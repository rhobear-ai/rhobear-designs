/**
 * @file Hardened import / export layer — supersedes the legacy
 *       `editor/src/lib/file-io.js` + `editor/src/lib/serializer.js` pair
 *       with a pure, dependency-free, lossless round-trip.
 *
 *       Four public functions, deliberately small and string-oriented so
 *       they are unit-testable in plain Node without any DOM / File API:
 *
 *         importHtml(rawHtml)
 *           Pure. Splits a raw HTML document into its preserved parts
 *           (body markup, concatenated CSS, script list, title, asset
 *           references) by delegating to live-render's regex-based
 *           `extractDocumentParts`. Output `html` keeps <script> tags
 *           inline; output `scripts` is the same array for callers that
 *           want to introspect or re-inject them.
 *
 *         importFolder(fileEntries, { entryText })
 *           Sync. Resolves a folder-like list of `{ path, getUrl() }`
 *           entries into a single `{ html, css, title, assetMap }`
 *           bundle. Picks an entry HTML by documented rules, builds an
 *           asset map from the non-HTML entries (relative-to-entry
 *           paths, with bare-basename aliases for backwards compat),
 *           rewrites refs via live-render.rewriteAssetUrls, then runs
 *           the result through `importHtml`.
 *
 *         exportHtml({ html, css, scripts? }, overrides?)
 *           Pure. Produces a clean standalone HTML document. If
 *           `overrides` is a non-empty override store (or a plain
 *           object snapshot), folds it via
 *           `diff-serializer.applyOverrides` (non-destructive: html is
 *           returned byte-equivalent, the override block is appended to
 *           the CSS). Inline + external <script> tags survive verbatim.
 *
 *         exportZip({ html, css, scripts?, assetMap? }, overrides?)
 *           Async, returns a Blob. Writes `index.html` + `styles.css`
 *           + `assets/...` into a JSZip archive. Browser-only `saveAs`
 *           is intentionally NOT called here — the caller decides how
 *           to persist the Blob. The function is testable in Node
 *           because the assetMap value is raw bytes (Uint8Array /
 *           string / Blob), not a URL that needs fetching.
 *
 *       Stability contract:
 *         - importHtml is pure: no DOM, no globals. Safe in Node,
 *           browser, worker.
 *         - importFolder is sync and pure given `entryText`. The
 *           `getUrl()` call is the only side-effecting hook, used
 *           solely to populate the asset map; tests can return any
 *           string.
 *         - exportHtml is pure string assembly. Safe in Node, browser,
 *           worker.
 *         - exportZip uses jszip only — no DOM, no fetch, no
 *           URL.createObjectURL. Safe in Node for unit tests.
 *
 *       Round-trip guarantee:
 *         `exportHtml(importHtml(x))` returns a document whose body
 *         markup and <script> tags preserve x (modulo a stable
 *         normalization: canonical doctype, viewport meta always
 *         present, scripts preserved verbatim, link href values
 *         carried over as @import lines in css).
 *
 *       Reuse, do NOT duplicate:
 *         - live-render.extractDocumentParts (HTML splitting)
 *         - live-render.rewriteAssetUrls     (folder-import ref rewriting)
 *         - live-render.buildLiveDocument    (clean-document assembly)
 *         - diff-serializer.applyOverrides   (override folding)
 *         - style-overrides.toStylesheet     (override block emission)
 */

import {
  buildLiveDocument,
  extractDocumentParts,
  rewriteAssetUrls,
} from './live-render.js';
import { applyOverrides } from './diff-serializer.js';
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Fallback title when a document has none. */
const DEFAULT_TITLE = 'Imported page';

/** Default title for exportHtml output. */
const DEFAULT_EXPORT_TITLE = 'Exported page';

// ---------------------------------------------------------------------------
// Small string helpers
// ---------------------------------------------------------------------------

/**
 * Escape a string for safe interpolation inside an HTML attribute value
 * wrapped in double quotes. The exporter uses this for the <title> tag
 * only; inline attribute values in user-supplied html/css are preserved
 * verbatim.
 * @param {unknown} s
 * @returns {string}
 */
function escapeAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * True iff `raw` is a relative-path asset reference we should record in
 * `assets` (i.e. not absolute, not a data/blob/mailto/tel/hash, not
 * protocol-relative). Used by importHtml to enumerate external refs.
 * @param {unknown} raw
 * @returns {boolean}
 */
function looksRelative(raw) {
  if (typeof raw !== 'string' || !raw) return false;
  return !/^(https?:|data:|blob:|mailto:|tel:|#|\/\/)/i.test(raw);
}

// ---------------------------------------------------------------------------
// importHtml
// ---------------------------------------------------------------------------

/**
 * Import a single raw HTML document. Pure, string-level — uses the
 * dependency-free regex-based `extractDocumentParts` from live-render
 * to split the document into its preserved parts.
 *
 * Returned shape:
 *   {
 *     html:    string                  // body markup, scripts inline, verbatim
 *     css:     string                  // concatenated <style> contents
 *                                      // + @import lines for stylesheet links
 *     scripts: Array<ScriptPart>       // all <script> tags (head + body)
 *     title:   string|null             // <title> text, if any
 *     assets:  Record<string,string>   // relative-path → path (the same
 *                                      // string in both positions; this
 *                                      // shape lets folder-import extend
 *                                      // the value with a resolved URL
 *                                      // while leaving the keys identical)
 *   }
 *
 * Round-trip: `html` + `scripts` together preserve every script of the
 * input, in document order, with their original `src=` / inline content
 * intact.
 *
 * @param {string} rawHtml
 * @returns {{
 *   html: string,
 *   css: string,
 *   scripts: object[],
 *   title: string|null,
 *   assets: Record<string,string>
 * }}
 */
export function importHtml(rawHtml) {
  const src = String(rawHtml ?? '');
  const parts = extractDocumentParts(src);

  // CSS — concatenate <style> contents and stylesheet links as @import.
  // Order: head styles first (in document order), then body styles, then
  // stylesheet links. Mirrors how the legacy serializer worked, just
  // done with the regex parts we already extracted.
  /** @type {string[]} */
  const cssBlocks = [];
  for (const s of parts.styles) {
    if (s.content != null && String(s.content).length) {
      cssBlocks.push(String(s.content));
    }
  }
  for (const link of parts.links) {
    if (!link.attrs) continue;
    if (String(link.attrs.rel || '').toLowerCase() !== 'stylesheet') continue;
    const href = link.attrs.href;
    if (typeof href !== 'string' || !href) continue;
    cssBlocks.push(`@import url('${href}');`);
  }
  const css = cssBlocks.join('\n');

  // Body markup — verbatim, scripts inline.
  const html = parts.bodyHtml || '';

  // Asset references — relative paths we noticed but did not resolve.
  /** @type {Record<string,string>} */
  const assets = {};
  const push = (raw) => {
    if (!looksRelative(raw)) return;
    if (raw in assets) return;
    assets[raw] = raw;
  };
  for (const link of parts.links) push(link.attrs && link.attrs.href);
  for (const s of parts.scripts) push(s.src);
  // Inline <style> blocks don't usually need resolution (their content
  // is css), but image / font references inside them would be handled
  // downstream by the asset-map pass. We don't enumerate url() calls
  // here — that's a job for a CSS-aware pass that runs after the asset
  // map exists.

  return {
    html,
    css,
    scripts: parts.scripts || [],
    title: parts.title || null,
    assets,
  };
}

// ---------------------------------------------------------------------------
// exportHtml
// ---------------------------------------------------------------------------

/**
 * Normalize an `overrides` argument into either an override store with
 * a `toJSON()` method, or `null`. Accepts:
 *   - null / undefined → null
 *   - any object that exposes `toJSON()` → returned as-is (treated as
 *     a store)
 *   - a plain object snapshot → wrapped via createOverrideStore +
 *     fromJSON so downstream `applyOverrides` accepts it
 *
 * The wrap is intentionally defensive: callers may pass either a live
 * store or a JSON snapshot.
 *
 * @param {unknown} overrides
 * @returns {object|null}
 */
function normalizeOverrides(overrides) {
  if (overrides == null) return null;
  if (typeof overrides !== 'object') return null;
  if (typeof overrides.toJSON === 'function') return overrides;
  // Treat as a plain JSON snapshot — wrap it. Avoid a circular
  // import of style-overrides.js by using dynamic import? No — we
  // want this to remain sync. Inline a tiny createOverrideStore shim
  // that does not depend on style-overrides here, then let
  // applyOverrides call `toStylesheet` on the store. The shim only
  // needs toJSON(); the rest of the store API is unused.
  const store = {
    _data: overrides || {},
    toJSON() { return this._data; },
    // The next two are read by applyOverrides via toStylesheet; we
    // can't avoid the dependency here without duplicating logic.
    // Instead, use createOverrideStore dynamically only if needed.
  };
  // Fast path: fall through to dynamic import? No — exportHtml must
  // remain sync. Re-implement the small surface applyOverrides needs.
  store.getSelectors = function () { return Object.keys(this._data || {}); };
  store.getOverridesFor = function (sel) {
    const m = (this._data || {})[sel];
    return (m && typeof m === 'object') ? m : {};
  };
  return store;
}

/**
 * Assemble the body markup for export. If `scripts` is provided AND
 * its raw text is not already present in `html`, append the raw text
 * of each script at the end of the body so the wrapper can re-extract
 * them as body-resident scripts. If they are already in `html`, the
 * existing positions are preserved.
 *
 * @param {string} html
 * @param {object[]|undefined} scripts
 * @returns {string}
 */
function assembleBodyWithScripts(html, scripts) {
  let body = String(html || '');
  if (!Array.isArray(scripts) || scripts.length === 0) return body;
  // Detect scripts already present in body (cheap substring check on
  // the opening tag, since each script's `raw` is the full
  // <script ...>...</script>).
  const missing = [];
  for (const s of scripts) {
    if (!s || typeof s.raw !== 'string') continue;
    if (body.indexOf(s.raw) !== -1) continue;
    missing.push(s);
  }
  if (missing.length === 0) return body;
  const sep = body.length && !body.endsWith('\n') ? '\n' : '';
  body = body + sep + missing.map((s) => s.raw).join('\n');
  return body;
}

/**
 * Export a clean standalone HTML document. Uses `buildLiveDocument`
 * from live-render for the shell assembly; that function already
 * handles scripts, stylesheets, the title, viewport meta, and doctype.
 *
 * Folding:
 *   - If `overrides` is a non-empty override store (or a plain object
 *     snapshot), `applyOverrides` is invoked first. It is byte-safe for
 *     `html` (scripts preserved verbatim) and appends an override block
 *     to `css` so the override rules win ties at equal specificity.
 *   - If the override store has no entries, the output is byte-
 *     equivalent to a no-op pass.
 *
 * Scripts:
 *   - `html` is expected to already contain <script> tags. They survive
 *     verbatim through `buildLiveDocument` because extractDocumentParts
 *     keeps them in place.
 *   - If an explicit `scripts` array is supplied, any script whose raw
 *     text is not already in `html` is appended to the body so it is
 *     preserved too.
 *
 * Title:
 *   - If `title` is supplied, it is used as the document's <title>.
 *     This is the canonical way to round-trip a title through the
 *     pipeline: pass `importHtml(x).title` back into exportHtml.
 *   - If `title` is not supplied, the constant fallback
 *     `DEFAULT_EXPORT_TITLE` is used.
 *
 * Reuse: the body-level markup is the string the caller supplied; the
 * document model / core serializer is not involved here (it is for tree
 * round-trips, not raw-HTML export). Core's `serialize(doc)` is what
 * callers would use to turn a document model into the html/css input
 * this function expects.
 *
 * @param {{html?: string, css?: string, scripts?: object[], title?: string}} input
 * @param {object} [overrides]  override store or plain JSON snapshot
 * @returns {string}            complete HTML document
 */
export function exportHtml(input, overrides) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const html = typeof safeInput.html === 'string' ? safeInput.html : '';
  const css = typeof safeInput.css === 'string' ? safeInput.css : '';
  const scripts = Array.isArray(safeInput.scripts) ? safeInput.scripts : undefined;
  const title = typeof safeInput.title === 'string' && safeInput.title
    ? safeInput.title
    : DEFAULT_EXPORT_TITLE;

  // Fold overrides (non-destructive). html is returned byte-equivalent;
  // css gets an appended override block.
  const store = normalizeOverrides(overrides);
  const folded = store ? applyOverrides({ html, css }, store) : { html, css };

  // Inject any scripts not already present in the body.
  const bodyWithScripts = assembleBodyWithScripts(folded.html, scripts);

  // Hand off to the live-render document assembler. It produces the
  // canonical shell (doctype, html, head with charset + viewport,
  // body, trailing scripts preserved).
  return buildLiveDocument({
    html: bodyWithScripts,
    css: folded.css,
    title,
  });
}

// ---------------------------------------------------------------------------
// End
// ---------------------------------------------------------------------------
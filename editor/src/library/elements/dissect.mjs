/**
 * @file Dissector — reads the 51 sample HTML templates under
 *       `../../samples/minimax-m3-high/*.html` (relative to this file, that
 *       resolves to `editor/../samples/minimax-m3-high/`) and produces a
 *       categorized, deduped catalog of reusable UI snippets. Pure data +
 *       a small extraction algorithm. No DOM, no React, no styles, no UI.
 *
 *       Usage:
 *         node editor/src/library/elements/dissect.mjs
 *
 *       Writes:
 *         editor/src/library/elements/manifest.json
 *
 *       The output schema matches what `index.js` reads at runtime — see
 *       `index.js` for the loader contract. We deliberately commit
 *       `manifest.json` so the editor doesn't need to run this script on
 *       load (and so the data is reviewable in a PR diff).
 *
 *       Algorithm (deterministic, dependency-free, runs in seconds):
 *         1. For each sample file:
 *              - Use the existing `extractDocumentParts` engine helper to
 *                split head from body and collect the inline `<style>`
 *                contents.
 *              - For each CATEGORY (nav, hero, button, chip, card, badge,
 *                cta, section, footer, form, gallery, testimonial) find
 *                candidate elements via tag / role / class heuristics.
 *              - For each candidate, build a self-contained snippet by:
 *                  * extracting the outerHTML of the candidate element,
 *                  * stripping scripts / event handlers / IDs that
 *                    reference runtime JS,
 *                  * gathering the CSS rules from the sample `<style>`
 *                    block whose selectors match the element's class
 *                    names (or its tag for tag-scoped rules),
 *                  * rewriting every class token inside both the HTML and
 *                    the CSS to a unique per-snippet prefix so the
 *                    snippet renders standalone in any document without
 *                    colliding with other snippets or the page chrome.
 *              - Generate an `id` from source + slug, a `name` derived
 *                from the element's class / text, and `tags` from
 *                matching keywords in classes / role hints.
 *         2. Dedupe near-identical snippets using a normalized signature
 *            (stripped class prefix, lowered text, whitespace-collapsed).
 *            Cap each category at ~12 to keep the library useful, not
 *            bloated.
 *
 *       Stability contract: this script is a one-way ETL — its output is
 *       committed, version-controlled, and reviewed like any other file.
 *       It does not run in production.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractDocumentParts } from '../../engine/live-render.js';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
// editor/src/library/elements -> editor -> repo root
const REPO_ROOT = join(HERE, '..', '..', '..', '..');
const SAMPLES_DIR = join(REPO_ROOT, 'samples', 'minimax-m3-high');
const OUT_FILE = join(HERE, 'manifest.json');

// ---------------------------------------------------------------------------
// Categories (the DoD-defined spread)
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'nav',
  'hero',
  'button',
  'chip',
  'card',
  'badge',
  'cta',
  'section',
  'footer',
  'form',
  'gallery',
  'testimonial',
];

// Per-category soft caps (target spread, not hard limits — quality wins).
const PER_CATEGORY_CAP = 12;

// ---------------------------------------------------------------------------
// Helpers — class / attribute matching
// ---------------------------------------------------------------------------

/**
 * Pull every class token out of a class="..." attribute string.
 * @param {string} html
 * @returns {Set<string>}
 */
function classesInHtml(html) {
  const out = new Set();
  const re = /class\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(html)) != null) {
    for (const tok of m[1].split(/\s+/)) {
      if (tok) out.add(tok);
    }
  }
  return out;
}

/**
 * Pull the textContent-only approximation out of an HTML block, ignoring
 * tags. Used to build dedupe signatures and human-friendly names.
 * @param {string} html
 */
function textOf(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strip event handlers (`onclick=`, `onload=`, ...) and `javascript:`
 * URLs so snippets can't run foreign code when dropped into another doc.
 * @param {string} html
 */
function sanitizeAttrs(html) {
  return html
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/(href|src|action|formaction|xlink:href)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src|action|formaction|xlink:href)\s*=\s*'javascript:[^']*'/gi, "$1='#'");
}

/**
 * Drop entire <script> and <style> blocks (the CSS we need is gathered
 * separately, and JS we never want to leak through).
 * @param {string} html
 */
function stripScriptsAndStyles(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
}

/**
 * Slugify a free-text string for use inside an element id.
 * @param {string} s
 * @param {number} max
 */
function slug(s, max = 32) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max) || 'snippet';
}

// ---------------------------------------------------------------------------
// CSS extraction
// ---------------------------------------------------------------------------

/**
 * Very small CSS rule splitter. We don't need a real parser — we need to
 * split a `<style>` body into "selector { decls }" chunks so we can pick
 * the ones whose selectors mention the classes used by a candidate.
 *
 * Skips @-rules (they're either @keyframes — not relevant to a static
 * snippet — or @media wrappers we'll flatten into each rule).
 *
 * @param {string} cssBody
 * @returns {Array<{ selector: string, decls: string }>}
 */
function splitCssRules(cssBody) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(cssBody)) != null) {
    const selector = m[1].trim();
    const decls = m[2].trim();
    // Skip @-rules — we never need @keyframes/@font-face inside a snippet
    // and unwrapping @media properly is not worth the complexity for our
    // use case (snippet owners can wrap the snippet in their own media
    // queries).
    if (selector.startsWith('@')) continue;
    if (!decls) continue;
    out.push({ selector, decls });
  }
  return out;
}

/**
 * Decide whether a CSS rule "applies to" the given class set.
 *   - A *compound* selector like `.foo .bar` is anchored on the FIRST
 *     class token. If `.foo` is in our classes we accept (the rule
 *     might cascade to `.bar` further down). If `.foo` is NOT in our
 *     classes we reject — pulling `.foo .bar` because `.bar` happens
 *     to be in our set would attach unrelated styles from another
 *     part of the page.
 *   - A *flat* selector like `.foo` or `.foo:hover` matches if `.foo`
 *     is in our classes.
 *   - A *compound* selector like `.foo.bar` matches if `.foo` OR `.bar`
 *     is in our classes (both classes must be on the same element for
 *     this rule to apply, so either alone is enough signal).
 *   - Tag selectors (`button`, `a`, `header`) only match when this is the
 *     element's own tag and the rule is a flat single-token rule, to
 *     avoid dragging in page-wide resets.
 *   - ID selectors (`#foo`) are ignored — they're too page-specific.
 *
 * @param {string} selector
 * @param {Set<string>} classes
 * @param {string} tagName
 */
function ruleAppliesTo(selector, classes, tagName) {
  // Split selector into comma-separated compounds.
  const compounds = selector.split(',').map((c) => c.trim()).filter(Boolean);
  if (compounds.length === 0) return false;
  for (const compound of compounds) {
    // A compound's tokens are split by combinators.
    const tokens = compound.split(/[\s>+~]+/).map((t) => t.trim()).filter(Boolean);
    if (tokens.length === 0) continue;
    // Skip pure id-only compounds.
    if (tokens.every((t) => t.startsWith('#'))) continue;
    // Extract every class token anywhere in the compound.
    const classTokens = [];
    for (const tok of tokens) {
      for (const cls of tok.split('.')) {
        if (!cls) continue;
        if (cls.startsWith(':')) continue;
        classTokens.push(cls);
      }
    }
    // 1) Anchor check: the FIRST class token in the FIRST token group
    //    of the compound must be in our classes (for descendant-style
    //    selectors). E.g. `.loader .label` anchors on `.loader`; if
    //    `.loader` isn't ours we reject — even if `.label` is.
    const firstTok = tokens[0];
    const firstClasses = firstTok.split('.').filter(Boolean);
    const anchorOk = firstClasses.some((c) => classes.has(c));
    // 2) Flat-tag rule: single-token selector whose first token is a
    //    bare tag name that matches our element's tag.
    const isSingleTag = tokens.length === 1
      && /^[a-z][a-z0-9]*$/i.test(firstTok)
      && firstTok.toLowerCase() === tagName.toLowerCase();
    if (anchorOk) return true;
    // 3) For chained-class compounds like `.foo.bar`, the *second*
    //    token doesn't have to be in our classes — but if the anchor
    //    on the first token matches, we already returned. Otherwise,
    //    accept compound `.foo.bar` only if at least one of the
    //    classes within any single token group is in our set AND the
    //    anchor of that token group matches. This is what `anchorOk`
    //    already covers, so we don't add a second pass.
    if (isSingleTag) return true;
  }
  return false;
}

/**
 * Collect every CSS rule from a sample's <style> body that applies to
 * the given classes + tag, then prefix-rewrite every class token so the
 * resulting CSS only collides with itself.
 *
 * @param {string} cssBody
 * @param {Set<string>} classes
 * @param {string} tagName
 * @param {string} prefix  e.g. `el-3-nav`
 * @returns {string}
 */
function extractScopedCss(cssBody, classes, tagName, prefix) {
  const rules = splitCssRules(cssBody);
  const kept = [];
  for (const r of rules) {
    if (ruleAppliesTo(r.selector, classes, tagName)) {
      kept.push(r);
    }
  }
  if (kept.length === 0) return '';
  // Rewrite: every ".foo" -> ".el-3-nav-foo" inside selectors; ids left
  // alone (we won't match id-only rules anyway).
  const rewriter = (sel) => {
    return sel.replace(/\.([A-Za-z_][\w-]*)/g, (_, cls) => `.${prefix}-${cls}`);
  };
  const lines = kept.map((r) => `${rewriter(r.selector)}{${r.decls}}`);
  let out = lines.join('\n');
  // If the snippet references CSS custom properties (var(--*)) and the
  // sample has a :root block, inline the variable definitions too so
  // the snippet is genuinely self-contained. We rewrite `.x` class
  // tokens inside `:root` too, but `:root` only has var declarations
  // (no class selectors) so nothing actually rewrites — we just attach
  // it under a class-scoped selector to make it clear where it came
  // from.
  if (out.includes('var(--')) {
    const rootMatch = cssBody.match(/:root\s*\{([^{}]*)\}/);
    if (rootMatch) {
      const rootDecls = rootMatch[1].trim();
      if (rootDecls) {
        out = `/* :root from ${prefix} source */\n.${prefix}-root{${rootDecls}}\n` + out;
      }
    }
  }
  return out;
}

/**
 * Rewrite every class token inside an HTML string under a prefix, and
 * also rewrite the class="..." attribute itself when the class is a
 * meaningful one. We walk tokens; classes that look like Tailwind
 * utilities (contain only lowercase letters + dashes + digits, ≤ 32
 * chars, and don't start with a known component prefix like "nav-" or
 * "btn-") we leave alone — they're usually self-explanatory in context.
 *
 * For our purposes we rewrite ALL classes uniformly under the prefix.
 * That keeps snippet CSS unambiguous; if the user wants to drop a
 * Tailwind class, they can re-add it.
 *
 * @param {string} html
 * @param {Set<string>} classes
 * @param {string} prefix
 */
function rewriteHtmlClasses(html, classes, prefix) {
  // Map old -> new for fast lookup.
  const map = new Map();
  for (const c of classes) map.set(c, `${prefix}-${c}`);
  // Inside class="..." attributes — replace each token.
  let out = html.replace(/class\s*=\s*"([^"]*)"/gi, (_, body) => {
    const toks = body.split(/\s+/).filter(Boolean).map((t) => map.get(t) ?? t);
    return `class="${toks.join(' ')}"`;
  });
  out = out.replace(/class\s*=\s*'([^']*)'/gi, (_, body) => {
    const toks = body.split(/\s+/).filter(Boolean).map((t) => map.get(t) ?? t);
    return `class="${toks.join(' ')}"`;
  });
  return out;
}

// ---------------------------------------------------------------------------
// Candidate extraction — per category
// ---------------------------------------------------------------------------

/**
 * Generic helper: find every element of a given tag name in bodyHtml,
 * optionally filtered by a predicate over the element's outerHTML, and
 * return the outerHTML of each match.
 *
 * We use a regex because the samples are not guaranteed to be balanced
 * (and that's OK — we tolerate imperfect matches the same way the rest
 * of the engine does).
 *
 * @param {string} bodyHtml
 * @param {string} tag
 * @param {(outerHtml: string, attrs: Record<string,string>) => boolean} filter
 */
function findElementsByTag(bodyHtml, tag, filter) {
  const out = [];
  // Self-closing tags handled separately.
  const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);
  const tagLower = tag.toLowerCase();
  const openRe = new RegExp(`<${tagLower}\\b([^>]*)>`, 'gi');
  let m;
  while ((m = openRe.exec(bodyHtml)) != null) {
    if (selfClosing.has(tagLower)) {
      const full = m[0];
      const attrs = parseAttrs(m[1]);
      if (!filter || filter(full, attrs)) out.push(full);
      continue;
    }
    // For non-self-closing tags, walk forward to find matching close.
    const start = m.index;
    const openEnd = openRe.lastIndex;
    const inner = findBalancedInner(bodyHtml, openEnd, tagLower);
    if (inner == null) continue;
    const outerEnd = inner.end; // points just after '</tag>'
    const full = bodyHtml.slice(start, outerEnd);
    const attrs = parseAttrs(m[1]);
    if (!filter || filter(full, attrs)) out.push(full);
  }
  return out;
}

/**
 * Lightweight attribute parser — enough for the discriminator predicates
 * below. Pulls out class, id, role, href, type, name, aria-label.
 *
 * @param {string} body
 * @returns {Record<string,string>}
 */
function parseAttrs(body) {
  const out = {};
  const re = /([A-Za-z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(body)) != null) {
    out[m[1].toLowerCase()] = (m[3] != null ? m[3] : m[4]) ?? '';
  }
  return out;
}

/**
 * Given an index just AFTER the opening tag, scan forward to the matching
 * close tag, accounting for nested same-name tags. Returns the end index
 * (just past `</tag>`) or null if unbalanced.
 *
 * We use a clean cursor-based scan instead of regex lastIndex tricks:
 *   pos = current scan position
 *   depth = nesting depth (starts at 1 — we're inside the opener)
 *   find next <tag and next </tag> after pos
 *   whichever comes first wins
 *   if it's an open: depth++, pos = past-the-open
 *   if it's a close: depth--, pos = past-the-close
 *   when depth hits 0: return pos
 */
function findBalancedInner(bodyHtml, afterOpen, tag) {
  const openRe = new RegExp(`<${tag}\\b`, 'gi');
  const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
  let pos = afterOpen;
  let depth = 1;
  // Hard cap so a malformed input can't loop forever.
  const maxIter = 5000;
  let iter = 0;
  while (depth > 0 && iter < maxIter) {
    iter++;
    openRe.lastIndex = pos;
    closeRe.lastIndex = pos;
    const nextOpen = openRe.exec(bodyHtml);
    const nextClose = closeRe.exec(bodyHtml);
    if (nextClose == null) return null;
    if (nextOpen != null && nextOpen.index < nextClose.index) {
      depth++;
      pos = openRe.lastIndex;
    } else {
      depth--;
      pos = closeRe.lastIndex;
    }
  }
  if (depth !== 0) return null;
  return { end: pos };
}

// ---------------------------------------------------------------------------
// Candidate collectors — one per category
// ---------------------------------------------------------------------------

/**
 * For each category, define a collector: (bodyHtml, sourceName) =>
 * Array<{ tag, html, classes, hints }>.
 *
 * `hints` is a string we look at to generate tags and a name — the
 * element's class list joined with role/aria-label hints.
 */

/** NAV: <nav>, <header> with nav-like class, role=navigation */
function collectNavs(bodyHtml) {
  const out = [];
  for (const html of findElementsByTag(bodyHtml, 'nav', () => true)) {
    out.push({ tag: 'nav', html, hints: 'nav' });
  }
  for (const html of findElementsByTag(bodyHtml, 'header', (h) => {
    const a = parseAttrs(h.match(/<header\b([^>]*)>/i)?.[1] ?? '');
    const cls = (a.class ?? '').toLowerCase();
    return /(nav|topbar|navbar|top-nav|menu|header-nav)/.test(cls);
  })) {
    out.push({ tag: 'header', html, hints: 'nav' });
  }
  return out;
}

/** HERO: <header>/<section> with "hero" class or containing an <h1> */
function collectHeroes(bodyHtml) {
  const out = [];
  for (const html of findElementsByTag(bodyHtml, 'header', (h) => {
    const a = parseAttrs(h.match(/<header\b([^>]*)>/i)?.[1] ?? '');
    return /(^|\s)(hero|hero-block|hero-section|hero-wrap|intro)(\s|$)/.test((a.class ?? '').toLowerCase());
  })) {
    out.push({ tag: 'header', html, hints: 'hero' });
  }
  for (const html of findElementsByTag(bodyHtml, 'section', (h) => {
    const a = parseAttrs(h.match(/<section\b([^>]*)>/i)?.[1] ?? '');
    return /(^|\s)(hero|hero-block|hero-section|hero-wrap|intro|top)(\s|$)/.test((a.class ?? '').toLowerCase());
  })) {
    out.push({ tag: 'section', html, hints: 'hero' });
  }
  return out;
}

/** BUTTON: <button> elements */
function collectButtons(bodyHtml) {
  const out = [];
  for (const html of findElementsByTag(bodyHtml, 'button', () => true)) {
    out.push({ tag: 'button', html, hints: 'button' });
  }
  return out;
}

/** CHIP: small <span>/<a>/<button> with chip/tag/label/pill class */
function collectChips(bodyHtml) {
  const out = [];
  const chipRe = /(chip|tag|pill|label|badge-text|eyebrow|hashtag)/i;
  for (const tag of ['span', 'a', 'button', 'div']) {
    for (const html of findElementsByTag(bodyHtml, tag, (h) => {
      const a = parseAttrs(h.match(new RegExp(`<${tag}\\b([^>]*)>`, 'i'))?.[1] ?? '');
      if (chipRe.test(a.class ?? '')) return true;
      return false;
    })) {
      // Reject chips that are obviously too big (whole nav, etc.)
      if (html.length > 1200) continue;
      out.push({ tag, html, hints: 'chip' });
    }
  }
  return out;
}

/** CARD: container with card-like class */
function collectCards(bodyHtml) {
  const out = [];
  const cardRe = /(card|tile|item-card|project-card|product-card|work-card)/i;
  for (const tag of ['article', 'div', 'li', 'section']) {
    for (const html of findElementsByTag(bodyHtml, tag, (h) => {
      const a = parseAttrs(h.match(new RegExp(`<${tag}\\b([^>]*)>`, 'i'))?.[1] ?? '');
      if (cardRe.test(a.class ?? '')) return true;
      // <article> with an <img> inside counts as a card even without
      // an explicit "card" class — that's a strong structural signal.
      if (tag === 'article' && /<img\b/i.test(h)) return true;
      return false;
    })) {
      if (html.length < 80 || html.length > 8000) continue;
      out.push({ tag, html, hints: 'card' });
    }
  }
  return out;
}

/** BADGE: <span>/<small> with badge/dot/marker/tag-mark class */
function collectBadges(bodyHtml) {
  const out = [];
  const re = /(badge|dot|marker|tag-mark|counter|status|number|step|index)/i;
  for (const tag of ['span', 'small', 'em', 'strong', 'i', 'div']) {
    for (const html of findElementsByTag(bodyHtml, tag, (h) => {
      const a = parseAttrs(h.match(new RegExp(`<${tag}\\b([^>]*)>`, 'i'))?.[1] ?? '');
      if (re.test(a.class ?? '')) return true;
      return false;
    })) {
      if (html.length > 400) continue;
      out.push({ tag, html, hints: 'badge' });
    }
  }
  return out;
}

/** CTA: <a> with button-like styling (cta, btn, button, action) */
function collectCtas(bodyHtml) {
  const out = [];
  const re = /(^|\s)(cta|btn|button|action|more|see-more|view-more|read-more|primary|secondary)(\s|$|-)/i;
  for (const html of findElementsByTag(bodyHtml, 'a', (h) => {
    const a = parseAttrs(h.match(/<a\b([^>]*)>/i)?.[1] ?? '');
    return re.test((a.class ?? '').toLowerCase());
  })) {
    out.push({ tag: 'a', html, hints: 'cta' });
  }
  return out;
}

/** SECTION: <section> elements */
function collectSections(bodyHtml) {
  const out = [];
  for (const html of findElementsByTag(bodyHtml, 'section', () => true)) {
    if (html.length < 200 || html.length > 12000) continue;
    out.push({ tag: 'section', html, hints: 'section' });
  }
  return out;
}

/** FOOTER: <footer> elements */
function collectFooters(bodyHtml) {
  const out = [];
  for (const html of findElementsByTag(bodyHtml, 'footer', () => true)) {
    if (html.length < 80) continue;
    out.push({ tag: 'footer', html, hints: 'footer' });
  }
  return out;
}

/** FORM: <form> elements */
function collectForms(bodyHtml) {
  const out = [];
  for (const html of findElementsByTag(bodyHtml, 'form', () => true)) {
    if (html.length < 80) continue;
    out.push({ tag: 'form', html, hints: 'form' });
  }
  return out;
}

/** GALLERY: <ul>/<div> with grid/list/gallery/masonry/work class */
function collectGalleries(bodyHtml) {
  const out = [];
  const re = /(gallery|grid|masonry|portfolio|works-grid|projects-grid|list|carousel|slider|swiper|marquee|scroller)/i;
  for (const tag of ['ul', 'ol', 'div', 'section']) {
    for (const html of findElementsByTag(bodyHtml, tag, (h) => {
      const a = parseAttrs(h.match(new RegExp(`<${tag}\\b([^>]*)>`, 'i'))?.[1] ?? '');
      if (re.test(a.class ?? '')) {
        // Only accept if it actually contains at least 2 child elements
        // — a single <ul> with one <li> is not a gallery.
        const childOpens = (h.match(/<(li|div|article|figure|a|img)\b/gi) ?? []).length;
        return childOpens >= 2;
      }
      return false;
    })) {
      if (html.length < 120 || html.length > 14000) continue;
      out.push({ tag, html, hints: 'gallery' });
    }
  }
  return out;
}

/** TESTIMONIAL: <blockquote> or section with quote/testimonial class */
function collectTestimonials(bodyHtml) {
  const out = [];
  for (const html of findElementsByTag(bodyHtml, 'blockquote', () => true)) {
    out.push({ tag: 'blockquote', html, hints: 'testimonial' });
  }
  const re = /(testimonial|quote|review|client-quote|client-says|voice)/i;
  for (const tag of ['div', 'section', 'article']) {
    for (const html of findElementsByTag(bodyHtml, tag, (h) => {
      const a = parseAttrs(h.match(new RegExp(`<${tag}\\b([^>]*)>`, 'i'))?.[1] ?? '');
      return re.test(a.class ?? '');
    })) {
      if (html.length < 80) continue;
      out.push({ tag, html, hints: 'testimonial' });
    }
  }
  return out;
}

const COLLECTORS = {
  nav: collectNavs,
  hero: collectHeroes,
  button: collectButtons,
  chip: collectChips,
  card: collectCards,
  badge: collectBadges,
  cta: collectCtas,
  section: collectSections,
  footer: collectFooters,
  form: collectForms,
  gallery: collectGalleries,
  testimonial: collectTestimonials,
};

// ---------------------------------------------------------------------------
// Snippet construction
// ---------------------------------------------------------------------------

/**
 * Build a self-contained snippet object from a candidate.
 *
 * @param {object} args
 * @param {string} args.category
 * @param {string} args.tag       — the element's tag name
 * @param {string} args.html      — the raw outerHTML
 * @param {string} args.cssBody   — full <style> contents from the sample
 * @param {string} args.source    — sample filename
 * @param {number} args.index     — sequential index within source file
 */
function buildSnippet({ category, tag, html, cssBody, source, index }) {
  const sanitized = sanitizeAttrs(stripScriptsAndStyles(html));
  const classes = classesInHtml(sanitized);
  // Even if no class survives, we still want a unique prefix — Tailwind-
  // only snippets need scoping on tag-derived selectors too.
  const id = `${slug(source.replace('.html', ''))}-${category}-${String(index).padStart(2, '0')}`;
  const prefix = `el-${id}`;
  const scopedCss = extractScopedCss(cssBody, classes, tag, prefix);
  const scopedHtml = rewriteHtmlClasses(sanitized, classes, prefix);
  // Build a friendly name from first heading / link / button text in the
  // snippet; fall back to the class list; fall back to the category.
  const text = textOf(scopedHtml);
  let name = text.split(/[.!?\n]/)[0].slice(0, 60).trim();
  if (!name) {
    const firstCls = [...classes][0] ?? '';
    name = firstCls ? `${category} (${firstCls})` : category;
  }
  // Tags: derive from classes / hints.
  const tags = new Set();
  tags.add(category);
  const allClassText = [...classes].join(' ').toLowerCase();
  for (const keyword of [
    'dark', 'light', 'primary', 'secondary', 'outline', 'ghost',
    'pill', 'rounded', 'circle', 'square', 'compact', 'wide',
    'minimal', 'bold', 'playful', 'serif', 'mono', 'mono-spaced',
    'uppercase', 'bordered', 'striped', 'gradient', 'glow',
    'animated', 'stacked', 'horizontal', 'vertical', 'centered',
    'compact', 'large', 'small', 'micro',
  ]) {
    if (allClassText.includes(keyword)) tags.add(keyword);
  }
  // Drop the prefix shadow classes from `tags`.
  tags.delete('');
  return {
    id,
    category,
    name,
    tags: [...tags].slice(0, 8),
    html: scopedHtml.trim(),
    css: scopedCss,
    source,
  };
}

// ---------------------------------------------------------------------------
// Dedupe — normalized text signature
// ---------------------------------------------------------------------------

/**
 * Build a normalized signature from a snippet. Two snippets with the same
 * signature are considered near-identical and only the first survives.
 *
 * We strip every `el-...` prefix we added, lowercase, collapse whitespace,
 * and chop to 200 chars. That's coarse but enough to catch the obvious
 * "same nav cloned across pages" duplicates.
 *
 * @param {object} s
 */
function signatureOf(s) {
  const text = textOf(s.html).toLowerCase().replace(/el-[a-z0-9-]+/g, '');
  // Also fold duplicate spaces.
  return text.replace(/\s+/g, ' ').trim().slice(0, 200);
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

function listSamples() {
  return readdirSync(SAMPLES_DIR)
    .filter((f) => f.endsWith('.html'))
    .sort();
}

function readSample(filename) {
  const full = join(SAMPLES_DIR, filename);
  const raw = readFileSync(full, 'utf8');
  const parts = extractDocumentParts(raw);
  const cssBody = (parts.styles ?? []).map((s) => s.content ?? '').join('\n');
  return { bodyHtml: parts.bodyHtml, cssBody };
}

/**
 * Process one sample file across all categories. Returns
 * `Map<category, snippet[]>`.
 */
function processSample(filename) {
  const { bodyHtml, cssBody } = readSample(filename);
  const byCat = new Map();
  for (const cat of CATEGORIES) {
    const collector = COLLECTORS[cat];
    if (!collector) continue;
    const candidates = collector(bodyHtml);
    const snippets = [];
    candidates.forEach((c, i) => {
      // Some categories produce many small candidates (chips, badges).
      // Drop empties and overly-tiny snippets up front.
      if (!c.html || c.html.length < 30) return;
      const s = buildSnippet({
        category: cat,
        tag: c.tag,
        html: c.html,
        cssBody,
        source: filename,
        index: i,
      });
      snippets.push(s);
    });
    byCat.set(cat, snippets);
  }
  return byCat;
}

/**
 * Run the full pipeline, dedupe, cap, and return the manifest array.
 *
 * @returns {Array<object>}
 */
function buildManifest() {
  const samples = listSamples();
  /** @type {Map<string, object[]>} */
  const perCat = new Map(CATEGORIES.map((c) => [c, []]));
  // Per-source dedupe is more useful than a global dedupe: we want
  // a "Services" section from one template AND the same section from
  // another template (which has different CSS and different layout
  // DNA) to BOTH survive. Duplicate-within-the-same-file is what we
  // actually want to filter out — that's typically a copy-paste
  // mistake by the template author.
  /** @type {Map<string, Map<string, Set<string>>>} */
  const seenSig = new Map(CATEGORIES.map((c) => [c, new Map()]));
  /** @type {Set<string>} */
  const seenIds = new Set();

  for (const sample of samples) {
    let byCat;
    try {
      byCat = processSample(sample);
    } catch (err) {
      // One bad sample should not poison the whole library.
      console.warn(`[dissect] skip ${sample}: ${err.message}`);
      continue;
    }
    for (const cat of CATEGORIES) {
      const snippets = byCat.get(cat) ?? [];
      let sigs = seenSig.get(cat).get(sample);
      if (!sigs) {
        sigs = new Set();
        seenSig.get(cat).set(sample, sigs);
      }
      const list = perCat.get(cat);
      for (const s of snippets) {
        if (seenIds.has(s.id)) continue;
        const sig = signatureOf(s);
        if (sig && sigs.has(sig)) continue;
        sigs.add(sig);
        seenIds.add(s.id);
        list.push(s);
      }
    }
  }

  // Round-robin cap so the chosen snippets reflect the full set of
  // sources, not just whichever source's candidates arrived first.
  // Without this, the first 3 alphabetically-sorted sources fill the
  // 12-slot cap and every other source gets dropped — the library ends
  // up with 12 nav bars all from the same 3 sites.
  const manifest = [];
  for (const cat of CATEGORIES) {
    const list = perCat.get(cat) ?? [];
    if (list.length <= PER_CATEGORY_CAP) {
      for (const s of list) manifest.push(s);
      continue;
    }
    // Group by source, preserving the original order.
    /** @type {Map<string, object[]>} */
    const bySource = new Map();
    for (const s of list) {
      let bucket = bySource.get(s.source);
      if (!bucket) {
        bucket = [];
        bySource.set(s.source, bucket);
      }
      bucket.push(s);
    }
    const sources = [...bySource.keys()];
    // Take one per source, cycling, until we hit the cap.
    const picked = [];
    let cursor = 0;
    let exhausted = false;
    while (picked.length < PER_CATEGORY_CAP && !exhausted) {
      exhausted = true;
      for (const src of sources) {
        if (picked.length >= PER_CATEGORY_CAP) break;
        const bucket = bySource.get(src);
        if (cursor < bucket.length) {
          picked.push(bucket[cursor]);
          exhausted = false;
        }
      }
      cursor++;
    }
    for (const s of picked) manifest.push(s);
  }
  return manifest;
}

// ---------------------------------------------------------------------------
// Entry — run when invoked directly (not on import)
// ---------------------------------------------------------------------------

const invokedDirectly = (() => {
  if (typeof process === 'undefined') return false;
  const argv1 = process.argv[1];
  if (!argv1) return false;
  try {
    return fileURLToPath(import.meta.url) === argv1;
  } catch {
    return false;
  }
})();

if (invokedDirectly) {
  const t0 = Date.now();
  const manifest = buildManifest();
  // Pretty print: per-category breakdown to stdout for human eyes.
  const breakdown = {};
  for (const s of manifest) {
    breakdown[s.category] = (breakdown[s.category] ?? 0) + 1;
  }
  const total = manifest.length;
  const sampleCount = readdirSync(SAMPLES_DIR).filter((f) => f.endsWith('.html')).length;
  console.log(`[dissect] samples: ${sampleCount}`);
  console.log(`[dissect] manifest: ${total} snippets`);
  for (const cat of CATEGORIES) {
    console.log(`[dissect]   ${cat.padEnd(12)} ${breakdown[cat] ?? 0}`);
  }
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`[dissect] wrote ${relative(REPO_ROOT, OUT_FILE)} in ${Date.now() - t0}ms`);
}

// Also expose for ad-hoc testing / programmatic use.
export {
  buildManifest,
  processSample,
  signatureOf,
  CATEGORIES,
  COLLECTORS,
};
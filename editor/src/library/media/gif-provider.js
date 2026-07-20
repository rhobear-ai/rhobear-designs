/**
 * @file BYO gif-search client.
 *
 *       The editor needs a media bucket. Images and gradients come from
 *       the bundled `catalog.json` (always free). Gifs are trickier:
 *       no stable, openly-licensed CDN of curated gif URLs exists, so
 *       this lane ships a *search client* instead — the user provides
 *       their own Giphy or Tenor API key (BYO, the same way the app
 *       handles BYO-LLM keys), and we hit their REST search endpoint.
 *
 *       No key is bundled. The caller (the editor's settings UI in the
 *       next phase) stores the key locally and passes it on every call.
 *
 *       Two surfaces:
 *
 *         1. Pure URL builder — `buildSearchUrl({ query, provider,
 *            apiKey, limit })` returns a fully-formed URL string with
 *            all query params correctly encoded. Pure function: no
 *            fetch, no I/O. Unit-testable without network.
 *
 *         2. Fetcher — `searchGifs({ query, provider, apiKey, limit,
 *            fetchImpl })` calls `buildSearchUrl`, runs `fetch`, and
 *            normalizes each provider's response shape into a flat
 *            `[{ id, url, thumb, title, provider }]`.
 *
 *       Provider response shapes (real, current as of 2025-06):
 *
 *         Giphy  (https://api.giphy.com/v1/gifs/search)
 *           { data: [
 *               {
 *                 id: '...',
 *                 title: '...',
 *                 images: {
 *                   original:      { url: 'https://…gif' },
 *                   fixed_height:  { url: 'https://…gif' },
 *                   preview_gif:   { url: 'https://…gif' },
 *                   fixed_width:   { url: 'https://…gif' },
 *                   ...
 *                 }
 *               }, ...
 *           ],
 *             pagination: { total_count, count, offset },
 *             meta: { status, msg, response_id }
 *           }
 *
 *         Tenor  (https://tenor.googleapis.com/v2/search)
 *           { results: [
 *               {
 *                 id: '...',
 *                 title: '...',
 *                 content_description: '...',
 *                 media_formats: {
 *                   gif:      { url: 'https://…gif' },
 *                   tinygif:  { url: 'https://…gif' },
 *                   mediumgif:{ url: 'https://…gif' },
 *                   nanogif:  { url: 'https://…gif' },
 *                   ...
 *                 }
 *               }, ...
 *           ],
 *             next: 'pos:value'
 *           }
 *
 *       No UI. No bundled secrets. No global state.
 *
 * MIT — RHOBEAR Designs (original)
 */

// ---------------------------------------------------------------------------
// Public constants
// ---------------------------------------------------------------------------

/** REST endpoint per provider. */
export const ENDPOINTS = Object.freeze({
  giphy: 'https://api.giphy.com/v1/gifs/search',
  tenor: 'https://tenor.googleapis.com/v2/search',
});

/** Default result count per page when the caller omits `limit`. */
export const DEFAULT_LIMIT = 20;

/** Maximum result count we'll request. Both providers cap at 50 (Giphy)
 *  or 50 (Tenor default). We clamp to 50 to keep responses small. */
export const MAX_LIMIT = 50;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clampInt(n, fallback, min, max) {
  const v = Number.parseInt(n, 10);
  if (!Number.isFinite(v)) return fallback;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

function err(message) {
  return new Error(`[library/media/gif-provider] ${message}`);
}

// ---------------------------------------------------------------------------
// URL builder — pure, no I/O. The unit tests pin this string exactly.
// ---------------------------------------------------------------------------

/**
 * Build a provider search URL. Pure function — does no network I/O.
 *
 * - `provider`  MUST be 'giphy' or 'tenor'.
 * - `apiKey`    MUST be a non-empty string.
 * - `query`     MUST be a non-empty string; will be trimmed and
 *               URL-encoded.
 * - `limit`     integer 1..MAX_LIMIT (default DEFAULT_LIMIT).
 *
 * Throws an Error (no fallback) on invalid inputs — callers in the UI
 * should pre-validate, since this is the boundary between user data and
 * a network call.
 *
 * @param {{ query: string, provider: 'giphy'|'tenor', apiKey: string, limit?: number }} opts
 * @returns {string}
 */
export function buildSearchUrl({ query, provider, apiKey, limit } = {}) {
  if (provider !== 'giphy' && provider !== 'tenor') {
    throw err(`provider must be 'giphy' or 'tenor' (got ${JSON.stringify(provider)})`);
  }
  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    throw err(`apiKey must be a non-empty string for provider '${provider}'`);
  }
  if (typeof query !== 'string' || query.trim().length === 0) {
    throw err(`query must be a non-empty string`);
  }
  const base = ENDPOINTS[provider];
  const q = query.trim();
  const n = clampInt(limit, DEFAULT_LIMIT, 1, MAX_LIMIT);

  if (provider === 'giphy') {
    // Giphy: api_key, q, limit
    const u = new URL(base);
    u.searchParams.set('api_key', apiKey);
    u.searchParams.set('q', q);
    u.searchParams.set('limit', String(n));
    return u.toString();
  }
  // Tenor: key, q, limit
  const u = new URL(base);
  u.searchParams.set('key', apiKey);
  u.searchParams.set('q', q);
  u.searchParams.set('limit', String(n));
  return u.toString();
}

// ---------------------------------------------------------------------------
// Normalizers — turn each provider's response shape into a flat list.
// Exported for unit testing and for callers that already hold a cached
// response and want to re-normalize it (e.g. after a UI filter change).
// ---------------------------------------------------------------------------

/**
 * Normalize a Giphy `/v1/gifs/search` response body into the standard
 * shape. Tolerant: missing optional fields fall back to sensible
 * defaults instead of throwing.
 *
 * @param {object} body — parsed JSON response.
 * @returns {Array<{ id: string, url: string, thumb: string, title: string, provider: 'giphy' }>}
 */
export function normalizeGiphyResponse(body) {
  if (!body || !Array.isArray(body.data)) return [];
  const out = [];
  for (const item of body.data) {
    if (!item || typeof item !== 'object') continue;
    const id = typeof item.id === 'string' ? item.id : null;
    if (!id) continue;
    const images = item.images || {};
    // Prefer a moderate "fixed_height" for the main url, and a tiny
    // "preview_gif" for the thumbnail — those are present on every
    // Giphy response. Fall back through the chain if missing.
    const url =
      (images.fixed_height && images.fixed_height.url) ||
      (images.original && images.original.url) ||
      (images.fixed_width && images.fixed_width.url) ||
      null;
    const thumb =
      (images.preview_gif && images.preview_gif.url) ||
      (images.fixed_height_small && images.fixed_height_small.url) ||
      (images.downsized_small && images.downsized_small.url) ||
      url;
    if (!url) continue;
    const title = typeof item.title === 'string' ? item.title : '';
    out.push({ id, url, thumb, title, provider: 'giphy' });
  }
  return out;
}

/**
 * Normalize a Tenor `/v2/search` response body into the standard shape.
 *
 * @param {object} body — parsed JSON response.
 * @returns {Array<{ id: string, url: string, thumb: string, title: string, provider: 'tenor' }>}
 */
export function normalizeTenorResponse(body) {
  if (!body || !Array.isArray(body.results)) return [];
  const out = [];
  for (const item of body.results) {
    if (!item || typeof item !== 'object') continue;
    const id = typeof item.id === 'string' ? item.id : null;
    if (!id) continue;
    const m = item.media_formats || {};
    // Tenor exposes a rich media_formats table. `gif` is the canonical
    // full-size asset, `tinygif` is the standard thumbnail.
    const url =
      (m.gif && m.gif.url) ||
      (m.mediumgif && m.mediumgif.url) ||
      (m.nanogif && m.nanogif.url) ||
      null;
    const thumb =
      (m.tinygif && m.tinygif.url) ||
      (m.nanogif && m.nanogif.url) ||
      url;
    if (!url) continue;
    const title =
      (typeof item.title === 'string' && item.title) ||
      (typeof item.content_description === 'string' && item.content_description) ||
      '';
    out.push({ id, url, thumb, title, provider: 'tenor' });
  }
  return out;
}

/**
 * Normalize a response body using the right parser for `provider`.
 *
 * @param {'giphy'|'tenor'} provider
 * @param {object} body
 * @returns {Array<object>}
 */
export function normalizeResponse(provider, body) {
  if (provider === 'giphy') return normalizeGiphyResponse(body);
  if (provider === 'tenor') return normalizeTenorResponse(body);
  throw err(`unknown provider: ${JSON.stringify(provider)}`);
}

// ---------------------------------------------------------------------------
// Fetcher — the public surface the UI calls.
// ---------------------------------------------------------------------------

/**
 * Search a gif provider. Builds the search URL via `buildSearchUrl`,
 * runs `fetch`, parses JSON, and normalizes the response.
 *
 * Options:
 *   query    (required) — search string.
 *   provider (required) — 'giphy' | 'tenor'.
 *   apiKey   (required) — BYO provider key from settings.
 *   limit    (optional) — 1..MAX_LIMIT (default DEFAULT_LIMIT).
 *   fetchImpl(optional) — override the fetch implementation. Defaults
 *                          to the global `fetch`. Injectable so tests
 *                          can capture the URL without hitting the
 *                          network. The signature is the standard
 *                          `fetch(input, init?) -> Promise<Response>`.
 *
 * Resolves to `[{ id, url, thumb, title, provider }]`.
 *
 * Rejects with an `Error` (not just a network failure) when:
 *   - inputs are invalid (provider/apiKey/query);
 *   - the response is not ok (status outside 200..299);
 *   - the response body is not valid JSON;
 *   - the body has the wrong shape for the provider.
 *
 * The error message always includes the provider name so the UI can
 * surface "Tenor rejected the key" or similar without guesswork.
 *
 * @param {{ query: string, provider: 'giphy'|'tenor', apiKey: string, limit?: number, fetchImpl?: typeof fetch }} opts
 * @returns {Promise<Array<{ id: string, url: string, thumb: string, title: string, provider: 'giphy'|'tenor' }>>}
 */
export async function searchGifs({ query, provider, apiKey, limit, fetchImpl } = {}) {
  // buildSearchUrl already validates everything we care about, and
  // throws with a clear message on bad input.
  const url = buildSearchUrl({ query, provider, apiKey, limit });
  const _fetch = typeof fetchImpl === 'function' ? fetchImpl : (typeof fetch === 'function' ? fetch : null);
  if (typeof _fetch !== 'function') {
    throw err(`no fetch implementation available (pass fetchImpl or run in a browser/Node 18+)`);
  }

  const res = await _fetch(url);
  if (!res || typeof res.ok !== 'boolean') {
    throw err(`${provider}: fetch returned an invalid Response object`);
  }
  if (!res.ok) {
    // Best-effort body text for the error message; never throw here.
    let bodyText = '';
    try {
      if (typeof res.text === 'function') bodyText = await res.text();
    } catch { /* ignore */ }
    const snippet = bodyText ? ` — ${bodyText.slice(0, 200)}` : '';
    throw err(`${provider} search failed: HTTP ${res.status}${snippet}`);
  }

  let body;
  try {
    if (typeof res.json !== 'function') {
      throw err(`${provider}: response has no .json() method`);
    }
    body = await res.json();
  } catch (e) {
    if (e && e.message && e.message.startsWith('[library/media/gif-provider]')) throw e;
    throw err(`${provider}: response body was not valid JSON (${e && e.message ? e.message : e})`);
  }

  return normalizeResponse(provider, body);
}
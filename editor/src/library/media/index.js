/**
 * @file Media library loader — headless, browser-safe.
 *
 *       Reads the bundled `catalog.json` and exposes a tiny read API so
 *       the editor's media panel (or any lane's consumer) can list
 *       images, gifs, and gradients; filter by category; and look up
 *       individual entries by id.
 *
 *       No UI, no DOM, no styles, no React, no node:fs. The JSON is
 *       imported via the standard `import … with { type: 'json' }`
 *       attribute so the same module bundles for both Node tests and
 *       the browser (Vite ships JSON natively).
 *
 *       Contract:
 *         listMedia(type?, category?)
 *           → MediaEntry[] filtered by optional type and/or category.
 *             `type` ∈ {'image', 'gif', 'gradient'}.
 *         getMedia(id)
 *           → MediaEntry | null
 *         categories(type?)
 *           → string[] of distinct category names for the given type.
 *         gradients()
 *           → Gradient[] convenience for backgrounds.
 *
 *       MediaEntry shape (see catalog.json):
 *         {
 *           id: string,        // unique, e.g. "img-nature-001"
 *           type: 'image'|'gif'|'gradient',
 *           // image/gif only:
 *           category?: string, // 'abstract' | 'texture' | ...
 *           name?: string,     // human label
 *           url: string,       // remote URL (image/gif)
 *           thumb?: string,    // remote URL (image/gif)
 *           license?: string,  // 'Unsplash' | 'Pexels' | ...
 *           source?: string,   // provider key: 'picsum', etc.
 *           w?: number,        // nominal width (image/gif)
 *           h?: number,        // nominal height (image/gif)
 *           // gradient only:
 *           css?: string       // CSS gradient expression
 *         }
 *
 *       By design, no network access happens here. The gif search
 *       client (gif-provider.js) is responsible for network I/O, and
 *       it takes a BYO API key.
 *
 * MIT — RHOBEAR Designs (original)
 */

import catalogData from './catalog.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// Internal: normalize the raw JSON into the three typed arrays we expose.
// ---------------------------------------------------------------------------

/**
 * Raw catalog object, as imported from catalog.json. Frozen to keep the
 * data source immutable from the consumer side.
 */
const rawCatalog = Object.freeze({
  version: catalogData.version ?? 1,
  license_notes: catalogData.license_notes ?? '',
  images: Array.isArray(catalogData.images) ? catalogData.images.slice() : [],
  gifs: Array.isArray(catalogData.gifs) ? catalogData.gifs.slice() : [],
  gradients: Array.isArray(catalogData.gradients) ? catalogData.gradients.slice() : [],
});

/**
 * Frozen, defensive copy of all image entries.
 * @type {ReadonlyArray<object>}
 */
export const IMAGES = Object.freeze(rawCatalog.images.slice());

/**
 * Frozen, defensive copy of all gif entries. May be empty — the BYO
 * gif-provider is the primary path for gif search; this catalog is the
 * curated free/CC0 set if we ever ship one.
 * @type {ReadonlyArray<object>}
 */
export const GIFS = Object.freeze(rawCatalog.gifs.slice());

/**
 * Frozen, defensive copy of all gradient entries.
 * @type {ReadonlyArray<object>}
 */
export const GRADIENTS = Object.freeze(rawCatalog.gradients.slice());

/**
 * Media-type discriminator values. Strings are stable; new types MUST
 * be appended to keep existing consumers working.
 */
export const MEDIA_TYPES = Object.freeze(['image', 'gif', 'gradient']);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Type guard for valid media types. */
function isValidType(t) {
  return t === 'image' || t === 'gif' || t === 'gradient';
}

/** Find an entry across all three typed arrays by id. */
function findById(id) {
  if (typeof id !== 'string' || id.length === 0) return null;
  for (const entry of IMAGES) {
    if (entry.id === id) return entry;
  }
  for (const entry of GIFS) {
    if (entry.id === id) return entry;
  }
  for (const entry of GRADIENTS) {
    if (entry.id === id) return entry;
  }
  return null;
}

/** Source array for a given media type. */
function sourceFor(type) {
  if (type === 'image') return IMAGES;
  if (type === 'gif') return GIFS;
  if (type === 'gradient') return GRADIENTS;
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * List catalog entries.
 *
 * - `listMedia()`             → every entry across all three arrays.
 * - `listMedia('image')`      → every image.
 * - `listMedia('image', 'abstract')` → images in the 'abstract' category.
 * - `listMedia(undefined, 'texture')` → everything whose `category` is 'texture'
 *                                       (useful for cross-type category filters).
 *
 * Unknown types yield an empty array (not an error). Unknown categories
 * also yield an empty array, so consumer code can pass user-typed input
 * safely.
 *
 * Always returns a fresh array; mutating it is safe and does not affect
 * the underlying catalog.
 *
 * @param {string} [type]     — one of 'image' | 'gif' | 'gradient'
 * @param {string} [category] — category filter
 * @returns {Array<object>}
 */
export function listMedia(type, category) {
  const arrays = [];
  if (type == null) {
    arrays.push(IMAGES, GIFS, GRADIENTS);
  } else if (isValidType(type)) {
    arrays.push(sourceFor(type));
  } else {
    return [];
  }

  const out = [];
  for (const arr of arrays) {
    if (!arr) continue;
    if (category == null || category === '') {
      for (const e of arr) out.push(e);
    } else {
      for (const e of arr) if (e && e.category === category) out.push(e);
    }
  }
  return out;
}

/**
 * Look up a single media entry by id. Returns null if no match.
 *
 * @param {string} id
 * @returns {object | null}
 */
export function getMedia(id) {
  return findById(id);
}

/**
 * Return the distinct category names present for a given media type.
 * The order is the order of first appearance in the catalog, which is
 * the curated authoring order — stable across runs.
 *
 * - `categories()`           → categories across every type, deduped.
 * - `categories('image')`    → categories of image entries only.
 *
 * Unknown types yield an empty array (not an error).
 *
 * @param {string} [type]
 * @returns {string[]}
 */
export function categories(type) {
  const arrays = [];
  if (type == null) {
    arrays.push(IMAGES, GIFS, GRADIENTS);
  } else if (isValidType(type)) {
    arrays.push(sourceFor(type));
  } else {
    return [];
  }

  const seen = new Set();
  const out = [];
  for (const arr of arrays) {
    if (!arr) continue;
    for (const e of arr) {
      const c = e && e.category;
      if (typeof c === 'string' && c.length > 0 && !seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
  }
  return out;
}

/**
 * Convenience accessor for gradients. Returns a fresh array of every
 * gradient entry — consumers building a background picker shouldn't
 * have to remember the `type` discriminator.
 *
 * @returns {Array<object>}
 */
export function gradients() {
  return GRADIENTS.slice();
}

/**
 * Default export: the raw catalog object (with `images`, `gifs`,
 * `gradients`, `version`, `license_notes`). Prefer the named exports
 * (`listMedia`, `getMedia`, `categories`, `gradients`, `IMAGES`, `GIFS`,
 * `GRADIENTS`, `MEDIA_TYPES`) for app code.
 */
export default rawCatalog;
/**
 * @file Iframe-side edit agent — click-to-select, hover, and inline text
 *       editing (contentEditable) for the "Edit Live Site" mode.
 *
 *       Two layers:
 *
 *         1. Pure helpers (computeSelectorPath, isTextEditableTag) —
 *            usable in Node tests.
 *
 *         2. createEditAgent(windowObj) — DOM controller that binds
 *            mouse + keyboard + contentEditable listeners inside the
 *            iframe and emits messages through the bridge agent.
 *
 *       --------------------------------------------------------------------------
 *       Editing model
 *       --------------------------------------------------------------------------
 *       The agent's job is REACTIVE — it surfaces what the user did and
 *       emits typed messages. It does NOT mutate the document model. The
 *       bridge / parent decides what to do with the edit (apply via the
 *       command bus, surface in a properties panel, etc.).
 *
 *       Inline text editing:
 *         - Single click on a text-bearing element → emit `select`.
 *         - Double click on the same element → enable contentEditable.
 *         - `input` while editing → emit `text-changed` (debounced ~150ms).
 *         - `Escape` or blur → disable contentEditable.
 *
 *       Hover:
 *         - `mousemove` → rAF-throttled, emits `hover` for the deepest
 *           element under the pointer (different from last hover only).
 *
 *       Select:
 *         - Single click → emit `select` with the deepest non-empty-rect
 *           element at the click point.
 *
 *       Deselect:
 *         - Click on document body / scrollbar area → emit `deselect`.
 *         - Escape key → emit `deselect`.
 *
 * @example
 *   import { createAgent } from './iframe-bridge.js';
 *   import { createEditAgent } from './inline-edit.js';
 *
 *   const bridge = createAgent(window);
 *   const editor = createEditAgent(window, {
 *     bridge,
 *     onTextChange: ({ path, text }) => console.log(path, text),
 *   });
 */

/**
 * Tags that meaningfully hold user-visible text. Inline-edit only
 * enables contentEditable on these (otherwise we'd accidentally let
 * users type into <html> or <meta>).
 */
export const TEXT_EDITABLE_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span', 'a', 'li', 'button', 'label',
  'td', 'th', 'em', 'strong', 'i', 'b', 'u', 'small',
  'blockquote', 'figcaption', 'dt', 'dd', 'caption',
  'div', 'section', 'article', 'header', 'footer', 'main', 'nav',
  'title',
]);

/** @param {string} tag @returns {boolean} */
export function isTextEditableTag(tag) {
  if (typeof tag !== 'string') return false;
  return TEXT_EDITABLE_TAGS.has(tag.toLowerCase());
}

/** Return the lowercase tag name for any element-like or DOM node. */
function tagOf(el) {
  if (!el) return '';
  if (typeof el.tagName === 'string') return el.tagName.toLowerCase();
  return '';
}

/**
 * Compute a stable "nth-of-type" selector path from `el` up to `root`.
 *
 * The format is `html > body > section:nth-of-type(2) > div:nth-of-type(1) > p:nth-of-type(1)`.
 * nth-of-type counts same-tag siblings that come BEFORE the element
 * (1-based). The path is stable as long as the document tree is stable —
 * additions above the element do not change its path.
 *
 * Pure: works on any element-like object exposing `tagName` and
 * `parentElement`. For the real DOM, `tagName` is upper-case and we
 * lowercase here.
 *
 * @param {object|null} el
 * @param {object} [root] — stop walking at this node (defaults to el.ownerDocument.documentElement if el is a real Element)
 * @returns {string} "" if el is null; otherwise a " > " joined path
 */
export function computeSelectorPath(el, root) {
  if (!el || typeof el !== 'object') return '';
  // Walk up via parentElement, building parts bottom-up.
  /** @type {string[]} */
  const parts = [];
  let cur = el;
  // If `root` is a Document-like object, the walker stops when cur.parentElement is null and cur === root.
  let stop = root || null;
  if (!stop && el.ownerDocument && el.ownerDocument.documentElement) {
    stop = el.ownerDocument.documentElement;
  }

  // Cap the walk at a generous depth to defend against accidental cycles.
  for (let depth = 0; depth < 200; depth++) {
    const tag = tagOf(cur);
    if (!tag) break;
    const parent = cur.parentElement;
    const indexAmongSiblings = indexOfType(cur, parent);
    parts.push(indexAmongSiblings > 1 ? `${tag}:nth-of-type(${indexAmongSiblings})` : tag);
    if (stop && cur === stop) break;
    if (!parent) break;
    cur = parent;
  }

  return parts.reverse().join(' > ');
}

/**
 * Count this element's 1-based position among its same-tag siblings.
 * Pure: works with plain objects exposing `tagName` and `parentElement.children`.
 * @param {object} el
 * @param {object|null} parent
 */
function indexOfType(el, parent) {
  if (!parent || !Array.isArray(parent.children)) return 1;
  const tag = tagOf(el);
  let n = 0;
  for (const sib of parent.children) {
    if (tagOf(sib) === tag) {
      n += 1;
      if (sib === el) return n;
    }
  }
  return Math.max(1, n);
}

/**
 * Resolve a stored selector path back to an element in the current
 * document. Returns null on miss or if any step is invalid.
 *
 * @param {Document|object} doc        — Document or document-like with querySelectorAll
 * @param {string} selectorPath        — output of computeSelectorPath
 * @returns {object|null}
 */
function resolveSelectorPath(doc, selectorPath) {
  if (!doc || typeof selectorPath !== 'string' || !selectorPath) return null;
  try {
    return doc.querySelector(selectorPath) || null;
  } catch (_err) {
    return null;
  }
}


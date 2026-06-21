/**
 * @file Tests for the element-library loader.
 *
 *       Run with: `node --test src/library/elements/`
 *
 *       Covers:
 *         - The committed `manifest.json` is valid JSON.
 *         - Every entry has the required fields: id, category, name,
 *           tags (array), html (non-empty string), css (string, may be
 *           empty), source (string).
 *         - Every id is unique.
 *         - `listCategories()` returns the canonical category list in
 *           order.
 *         - `listElements()` returns everything; `listElements(cat)`
 *           returns only that category.
 *         - `getElement(id)` returns the matching element, and null for
 *           an unknown id.
 *
 *       Style: Node's built-in test runner, ESM, strict asserts. Kept
 *       dependency-free (no extra imports beyond node:test + assert +
 *       the loader under test).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  listCategories,
  listElements,
  getElement,
  loadManifest,
  CATEGORIES,
  _resetManifestCache,
} from './index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(HERE, 'manifest.json');

// ===========================================================================
// manifest.json file shape
// ===========================================================================

test('manifest.json exists and is valid JSON', () => {
  const raw = readFileSync(MANIFEST_PATH, 'utf8');
  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(raw);
  }, 'manifest.json must parse as JSON');
  assert.ok(Array.isArray(parsed), 'manifest.json must be a JSON array');
});

test('manifest.json contains a useful number of entries', () => {
  const all = loadManifest();
  // We expect ~100+ across 12 categories. A bare minimum catches the
  // catastrophic case where dissect.mjs produced an empty manifest.
  assert.ok(all.length >= 50, `expected >= 50 elements, got ${all.length}`);
});

// ===========================================================================
// Per-entry validation
// ===========================================================================

test('every entry has required fields with valid types', () => {
  const all = loadManifest();
  for (const s of all) {
    assert.equal(typeof s, 'object', 'entry must be an object');
    assert.ok(s !== null, 'entry must not be null');
    assert.equal(typeof s.id, 'string', `entry.id must be string: ${JSON.stringify(s).slice(0,80)}`);
    assert.ok(s.id.length > 0, 'entry.id must be non-empty');
    assert.equal(typeof s.category, 'string', `entry.category must be string: ${s.id}`);
    assert.ok(CATEGORIES.includes(s.category), `entry.category must be in canonical list: ${s.id} -> ${s.category}`);
    assert.equal(typeof s.name, 'string', `entry.name must be string: ${s.id}`);
    assert.ok(s.name.length > 0, `entry.name must be non-empty: ${s.id}`);
    assert.ok(Array.isArray(s.tags), `entry.tags must be array: ${s.id}`);
    assert.equal(typeof s.html, 'string', `entry.html must be string: ${s.id}`);
    assert.ok(s.html.length > 0, `entry.html must be non-empty: ${s.id}`);
    assert.equal(typeof s.css, 'string', `entry.css must be string: ${s.id}`);
    assert.equal(typeof s.source, 'string', `entry.source must be string: ${s.id}`);
    assert.ok(s.source.length > 0, `entry.source must be non-empty: ${s.id}`);
  }
});

test('every id is unique across the manifest', () => {
  const all = loadManifest();
  const seen = new Set();
  const dups = [];
  for (const s of all) {
    if (seen.has(s.id)) dups.push(s.id);
    seen.add(s.id);
  }
  assert.equal(dups.length, 0, `duplicate ids: ${dups.slice(0, 5).join(', ')}`);
});

test('every category has at least 2 elements (forms allowed down to 2)', () => {
  const all = loadManifest();
  const counts = new Map();
  for (const s of all) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  for (const cat of CATEGORIES) {
    const n = counts.get(cat) ?? 0;
    // Forms in the source corpus are genuinely rare (only 2 templates
    // ship forms), so we tolerate the floor of 2 for them. Everything
    // else should easily clear 6.
    const floor = cat === 'form' ? 2 : 6;
    assert.ok(n >= floor, `category "${cat}" has ${n} elements, expected >= ${floor}`);
  }
});

// ===========================================================================
// Loader behavior — listCategories / listElements / getElement
// ===========================================================================

test('listCategories returns the canonical category list in order', () => {
  const cats = listCategories();
  assert.deepEqual(cats, [...CATEGORIES]);
});

test('listElements() returns every element', () => {
  const all = listElements();
  const fromManifest = loadManifest();
  assert.equal(all.length, fromManifest.length);
});

test('listElements(category) filters by category', () => {
  for (const cat of CATEGORIES) {
    const items = listElements(cat);
    assert.ok(items.length > 0, `expected at least one element in category "${cat}"`);
    for (const s of items) {
      assert.equal(s.category, cat, `listElements(${cat}) must only return ${cat} items`);
    }
  }
});

test('listElements(unknownCategory) returns empty array, not error', () => {
  const items = listElements('not-a-real-category');
  assert.deepEqual(items, []);
});

test('getElement(id) returns the matching element', () => {
  const all = loadManifest();
  // Pick the first one deterministically.
  const target = all[0];
  const got = getElement(target.id);
  assert.ok(got, `getElement("${target.id}") must return an element`);
  assert.equal(got.id, target.id);
  assert.equal(got.category, target.category);
  assert.equal(got.html, target.html);
});

test('getElement(unknownId) returns null', () => {
  assert.equal(getElement('not-a-real-id-12345'), null);
});

test('getElement(bad input) returns null safely', () => {
  assert.equal(getElement(''), null);
  assert.equal(getElement(null), null);
  assert.equal(getElement(undefined), null);
  assert.equal(getElement(123), null);
});

// ===========================================================================
// Cache lifecycle
// ===========================================================================

test('loadManifest returns the same array reference on repeat calls (cached)', () => {
  const a = loadManifest();
  const b = loadManifest();
  assert.equal(a, b);
});

test('_resetManifestCache forces a re-read on next loadManifest()', () => {
  const a = loadManifest();
  _resetManifestCache();
  const b = loadManifest();
  // After a reset, the cache should be repopulated with a fresh array.
  assert.notEqual(a, b);
  // But the contents should be equal-by-value.
  assert.equal(a.length, b.length);
  for (let i = 0; i < a.length; i++) {
    assert.equal(a[i].id, b[i].id);
  }
});
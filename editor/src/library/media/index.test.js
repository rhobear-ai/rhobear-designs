/**
 * Tests for the media catalog + BYO gif-provider client.
 * Run with: `node --test src/library/media/`
 *
 * MIT — RHOBEAR Designs (original)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  listMedia,
  getMedia,
  categories,
  gradients,
  IMAGES,
  GIFS,
  GRADIENTS,
  MEDIA_TYPES,
  default as catalogDefault,
} from './index.js';

import {
  buildSearchUrl,
  searchGifs,
  normalizeGiphyResponse,
  normalizeTenorResponse,
  normalizeResponse,
  PROVIDERS,
  ENDPOINTS,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from './gif-provider.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// catalog.json schema + counts
// ---------------------------------------------------------------------------

const IMAGE_CATEGORIES = new Set([
  'abstract', 'texture', 'nature', 'people', 'product', 'tech', 'pattern',
]);
const GRADIENT_CATEGORIES = new Set([
  'vibrant', 'warm', 'cool', 'dark', 'neutral',
]);
const ALLOWED_LICENSES = new Set(['Unsplash', 'Pexels', 'Pixabay', 'CC0', 'CC-BY', 'MIT']);
const ALLOWED_SOURCES = new Set(['picsum', 'unsplash', 'pexels', 'pixabay']);

test('catalog.json parses and exports the expected top-level shape', () => {
  const raw = readFileSync(join(__dirname, 'catalog.json'), 'utf8');
  const parsed = JSON.parse(raw);
  assert.ok(parsed && typeof parsed === 'object', 'catalog must be a JSON object');
  assert.equal(typeof parsed.version, 'number', 'catalog must have a numeric version');
  assert.ok(Array.isArray(parsed.images), 'catalog must have an images array');
  assert.ok(Array.isArray(parsed.gifs), 'catalog must have a gifs array');
  assert.ok(Array.isArray(parsed.gradients), 'catalog must have a gradients array');
  // Round-trip identity: imported shapes match raw JSON shapes.
  assert.equal(IMAGES.length, parsed.images.length);
  assert.equal(GIFS.length, parsed.gifs.length);
  assert.equal(GRADIENTS.length, parsed.gradients.length);
  // Default export is the catalog root.
  assert.equal(catalogDefault.images.length, parsed.images.length);
});

test('image catalog has 40-60 entries across the seven expected categories', () => {
  assert.ok(IMAGES.length >= 40, `expected >=40 images, got ${IMAGES.length}`);
  assert.ok(IMAGES.length <= 60, `expected <=60 images, got ${IMAGES.length}`);

  // Every category listed in IMAGE_CATEGORIES must have at least one entry.
  for (const cat of IMAGE_CATEGORIES) {
    const inCat = IMAGES.filter((e) => e.category === cat);
    assert.ok(inCat.length > 0, `category "${cat}" must have at least one image (got ${inCat.length})`);
  }
  // No stray categories.
  for (const e of IMAGES) {
    assert.ok(IMAGE_CATEGORIES.has(e.category), `unexpected image category: ${e.category}`);
  }
});

test('gradient catalog has exactly 12 entries across five categories', () => {
  assert.equal(GRADIENTS.length, 12, `expected 12 gradients, got ${GRADIENTS.length}`);
  for (const cat of GRADIENT_CATEGORIES) {
    const inCat = GRADIENTS.filter((e) => e.category === cat);
    assert.ok(inCat.length > 0, `gradient category "${cat}" must have at least one entry`);
  }
  for (const e of GRADIENTS) {
    assert.ok(GRADIENT_CATEGORIES.has(e.category), `unexpected gradient category: ${e.category}`);
  }
});

test('every image entry has url + license + source + type', () => {
  const seenIds = new Set();
  for (const e of IMAGES) {
    // id
    assert.equal(typeof e.id, 'string', `id must be a string: ${JSON.stringify(e)}`);
    assert.ok(e.id.startsWith('img-'), `image id must start with 'img-': ${e.id}`);
    assert.ok(!seenIds.has(e.id), `duplicate image id: ${e.id}`);
    seenIds.add(e.id);
    // type
    assert.equal(e.type, 'image', `type must be 'image' for ${e.id}`);
    // url + thumb
    assert.equal(typeof e.url, 'string', `url must be a string for ${e.id}`);
    assert.ok(e.url.length > 0, `url must be non-empty for ${e.id}`);
    assert.ok(/^https:\/\//.test(e.url), `url must be https for ${e.id}: ${e.url}`);
    assert.equal(typeof e.thumb, 'string', `thumb must be a string for ${e.id}`);
    assert.ok(/^https:\/\//.test(e.thumb), `thumb must be https for ${e.id}: ${e.thumb}`);
    // license + source
    assert.ok(ALLOWED_LICENSES.has(e.license), `bad license for ${e.id}: ${e.license}`);
    assert.ok(ALLOWED_SOURCES.has(e.source), `bad source for ${e.id}: ${e.source}`);
    // dimensions
    assert.equal(typeof e.w, 'number', `w must be a number for ${e.id}`);
    assert.equal(typeof e.h, 'number', `h must be a number for ${e.id}`);
    assert.ok(e.w > 0 && e.h > 0, `w/h must be positive for ${e.id}`);
    // category
    assert.equal(typeof e.category, 'string', `category must be a string for ${e.id}`);
  }
});

test('every image url + thumb host is one of the allowed free providers', () => {
  const allowedHosts = [
    'picsum.photos',
    'images.unsplash.com',
    'source.unsplash.com',
    'images.pexels.com',
    'cdn.pixabay.com',
  ];
  for (const e of IMAGES) {
    for (const field of ['url', 'thumb']) {
      const u = new URL(e[field]);
      assert.ok(
        allowedHosts.includes(u.hostname),
        `${field} for ${e.id} must be on an allowed free provider host, got: ${u.hostname}`,
      );
    }
  }
});

test('every gradient entry has a non-empty CSS gradient expression', () => {
  const seenIds = new Set();
  for (const g of GRADIENTS) {
    assert.equal(typeof g.id, 'string', `gradient id must be a string: ${JSON.stringify(g)}`);
    assert.ok(g.id.startsWith('grad-'), `gradient id must start with 'grad-': ${g.id}`);
    assert.ok(!seenIds.has(g.id), `duplicate gradient id: ${g.id}`);
    seenIds.add(g.id);
    assert.equal(g.type, 'gradient', `type must be 'gradient' for ${g.id}`);
    assert.equal(typeof g.css, 'string', `css must be a string for ${g.id}`);
    assert.ok(g.css.length > 0, `css must be non-empty for ${g.id}`);
    // Must actually be a CSS gradient (linear- or radial-) — that's what
    // the consumer will paste into a `background:` declaration.
    assert.ok(
      /^(linear|radial|conic)-gradient\(/.test(g.css.trim()),
      `css for ${g.id} must be a CSS gradient expression, got: ${g.css}`,
    );
    // No url(…) — these are pure CSS, not image backgrounds.
    assert.ok(
      !/url\(/.test(g.css),
      `gradient css for ${g.id} must not contain url(...): ${g.css}`,
    );
  }
});

test('id namespaces do not collide across types', () => {
  const allIds = [
    ...IMAGES.map((e) => e.id),
    ...GIFS.map((e) => e.id),
    ...GRADIENTS.map((e) => e.id),
  ];
  const seen = new Set();
  for (const id of allIds) {
    assert.ok(!seen.has(id), `duplicate id across types: ${id}`);
    seen.add(id);
  }
});

// ---------------------------------------------------------------------------
// Loader behaviour
// ---------------------------------------------------------------------------

test('listMedia() with no args returns every entry across all three arrays', () => {
  const all = listMedia();
  assert.equal(all.length, IMAGES.length + GIFS.length + GRADIENTS.length);
  // Defensive copy, not the same array reference.
  assert.notEqual(all, IMAGES, 'listMedia must return a fresh array, not IMAGES');
  // Safe to mutate without affecting the catalog.
  const before = IMAGES.length;
  all.length = 0;
  assert.equal(IMAGES.length, before, 'mutating listMedia() result must not change IMAGES');
});

test('listMedia(type) filters by type, listMedia(type, cat) further filters', () => {
  const onlyImages = listMedia('image');
  assert.equal(onlyImages.length, IMAGES.length);
  for (const e of onlyImages) assert.equal(e.type, 'image');

  const onlyGifs = listMedia('gif');
  assert.equal(onlyGifs.length, GIFS.length);

  const onlyGrads = listMedia('gradient');
  assert.equal(onlyGrads.length, GRADIENTS.length);
  for (const g of onlyGrads) assert.equal(g.type, 'gradient');

  const abstract = listMedia('image', 'abstract');
  assert.ok(abstract.length > 0, 'must have at least one abstract image');
  for (const e of abstract) {
    assert.equal(e.type, 'image');
    assert.equal(e.category, 'abstract');
  }

  const badType = listMedia('not-a-real-type');
  assert.deepEqual(badType, [], 'unknown type must yield empty array, not error');

  const badCat = listMedia('image', 'not-a-real-category');
  assert.deepEqual(badCat, [], 'unknown category must yield empty array, not error');
});

test('getMedia returns the matching entry across types, null for unknown', () => {
  const sample = IMAGES[0];
  assert.deepEqual(getMedia(sample.id), sample, 'getMedia must find known image by id');

  const gSample = GRADIENTS[0];
  assert.deepEqual(getMedia(gSample.id), gSample, 'getMedia must find known gradient by id');

  assert.equal(getMedia('not-a-real-id'), null);
  assert.equal(getMedia(''), null);
  assert.equal(getMedia(null), null);
  assert.equal(getMedia(undefined), null);
});

test('categories(type?) returns distinct categories in curated authoring order', () => {
  const imageCats = categories('image');
  assert.deepEqual(imageCats, [...IMAGE_CATEGORIES], 'image categories must match canonical order');

  const gradientCats = categories('gradient');
  assert.deepEqual(gradientCats, [...GRADIENT_CATEGORIES]);

  const allCats = categories();
  // All image + gradient categories deduped (no overlap here, but
  // dedupe logic must still work).
  assert.ok(imageCats.every((c) => allCats.includes(c)));
  assert.ok(gradientCats.every((c) => allCats.includes(c)));

  assert.deepEqual(categories('not-a-real-type'), [], 'unknown type must yield empty array');
});

test('gradients() returns a fresh array of every gradient entry', () => {
  const g = gradients();
  assert.equal(g.length, GRADIENTS.length);
  assert.notEqual(g, GRADIENTS, 'must return a fresh array, not GRADIENTS');
  for (const e of g) assert.equal(e.type, 'gradient');
});

test('IMAGES / GIFS / GRADIENTS are frozen defensive copies', () => {
  assert.ok(Object.isFrozen(IMAGES), 'IMAGES must be frozen');
  assert.ok(Object.isFrozen(GIFS), 'GIFS must be frozen');
  assert.ok(Object.isFrozen(GRADIENTS), 'GRADIENTS must be frozen');
  assert.throws(() => { IMAGES.pop(); }, TypeError, 'mutating IMAGES must throw');
  assert.throws(() => { GRADIENTS.pop(); }, TypeError, 'mutating GRADIENTS must throw');
});

test('MEDIA_TYPES exposes the stable list of type discriminators', () => {
  assert.deepEqual([...MEDIA_TYPES], ['image', 'gif', 'gradient']);
  assert.ok(Object.isFrozen(MEDIA_TYPES), 'MEDIA_TYPES must be frozen');
});

// ---------------------------------------------------------------------------
// gif-provider — pure URL building (no network)
// ---------------------------------------------------------------------------

test('buildSearchUrl pins the Giphy endpoint string exactly', () => {
  const u = buildSearchUrl({ query: 'hi there', provider: 'giphy', apiKey: 'abc123', limit: 12 });
  assert.equal(
    u,
    'https://api.giphy.com/v1/gifs/search?api_key=abc123&q=hi+there&limit=12',
    'giphy URL must encode key as api_key, query URL-encoded with + for space, and limit',
  );
  // And the host is what we expect.
  const parsed = new URL(u);
  assert.equal(parsed.origin, 'https://api.giphy.com');
  assert.equal(parsed.pathname, '/v1/gifs/search');
  assert.equal(parsed.searchParams.get('api_key'), 'abc123');
  assert.equal(parsed.searchParams.get('q'), 'hi there');
  assert.equal(parsed.searchParams.get('limit'), '12');
});

test('buildSearchUrl pins the Tenor endpoint string exactly', () => {
  const u = buildSearchUrl({ query: 'wave', provider: 'tenor', apiKey: 'xyz' });
  assert.equal(
    u,
    'https://tenor.googleapis.com/v2/search?key=xyz&q=wave&limit=20',
    'tenor URL must encode key as key (not api_key), with default limit of 20',
  );
  const parsed = new URL(u);
  assert.equal(parsed.origin, 'https://tenor.googleapis.com');
  assert.equal(parsed.pathname, '/v2/search');
  assert.equal(parsed.searchParams.get('key'), 'xyz');
  assert.equal(parsed.searchParams.get('q'), 'wave');
  assert.equal(parsed.searchParams.get('limit'), '20');
});

test('buildSearchUrl clamps limit to [1, MAX_LIMIT] and uses DEFAULT_LIMIT when omitted', () => {
  // Defaults to DEFAULT_LIMIT
  const def = buildSearchUrl({ query: 'x', provider: 'giphy', apiKey: 'k' });
  assert.equal(new URL(def).searchParams.get('limit'), String(DEFAULT_LIMIT));

  // Clamps below 1 up to 1
  const low = buildSearchUrl({ query: 'x', provider: 'giphy', apiKey: 'k', limit: 0 });
  assert.equal(new URL(low).searchParams.get('limit'), '1');
  const neg = buildSearchUrl({ query: 'x', provider: 'giphy', apiKey: 'k', limit: -7 });
  assert.equal(new URL(neg).searchParams.get('limit'), '1');

  // Clamps above MAX_LIMIT down to MAX_LIMIT
  const high = buildSearchUrl({ query: 'x', provider: 'giphy', apiKey: 'k', limit: 9999 });
  assert.equal(new URL(high).searchParams.get('limit'), String(MAX_LIMIT));
});

test('buildSearchUrl trims the query and encodes special characters', () => {
  const u = buildSearchUrl({ query: '  hello world & friends  ', provider: 'tenor', apiKey: 'k' });
  const parsed = new URL(u);
  assert.equal(parsed.searchParams.get('q'), 'hello world & friends', 'query must be trimmed');
  // & must be encoded as %26, not as a separator
  assert.ok(parsed.search.includes('%26'), 'ampersand must be URL-encoded, got: ' + parsed.search);
});

test('buildSearchUrl throws clearly on bad inputs (no network)', () => {
  // No provider key in the opts at all (undefined).
  assert.throws(
    () => buildSearchUrl({ apiKey: 'k', query: 'x' }),
    /provider/,
    'missing provider must throw',
  );
  assert.throws(
    () => buildSearchUrl({ provider: 'unsplash', apiKey: 'k', query: 'x' }),
    /must be 'giphy' or 'tenor'/,
    'unknown provider must throw with provider names in the message',
  );
  assert.throws(
    () => buildSearchUrl({ provider: 'giphy', query: 'x' }),
    /apiKey/,
    'missing apiKey must throw',
  );
  assert.throws(
    () => buildSearchUrl({ provider: 'giphy', apiKey: '', query: 'x' }),
    /apiKey/,
    'empty apiKey must throw',
  );
  assert.throws(
    () => buildSearchUrl({ provider: 'giphy', apiKey: 'k', query: '' }),
    /query/,
    'empty query must throw',
  );
  assert.throws(
    () => buildSearchUrl({ provider: 'giphy', apiKey: 'k', query: '   ' }),
    /query/,
    'whitespace-only query must throw',
  );
});

test('PROVIDERS / ENDPOINTS are stable, frozen maps', () => {
  assert.deepEqual([...PROVIDERS], ['giphy', 'tenor']);
  assert.ok(Object.isFrozen(PROVIDERS), 'PROVIDERS must be frozen');
  assert.ok(Object.isFrozen(ENDPOINTS), 'ENDPOINTS must be frozen');
  assert.equal(ENDPOINTS.giphy, 'https://api.giphy.com/v1/gifs/search');
  assert.equal(ENDPOINTS.tenor, 'https://tenor.googleapis.com/v2/search');
});

// ---------------------------------------------------------------------------
// gif-provider — response normalizers (no network)
// ---------------------------------------------------------------------------

test('normalizeGiphyResponse flattens the Giphy { data, images } shape', () => {
  const body = {
    data: [
      {
        id: 'aaa',
        title: 'a cat',
        images: {
          fixed_height: { url: 'https://g/a-200.gif' },
          preview_gif: { url: 'https://g/a-preview.gif' },
        },
      },
      {
        id: 'bbb',
        title: 'a dog',
        images: {
          original: { url: 'https://g/b-orig.gif' },
        },
      },
      { id: 'ccc' /* missing images — must be skipped */ },
      null, /* defensive — must be skipped */
    ],
  };
  const out = normalizeGiphyResponse(body);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0], {
    id: 'aaa',
    url: 'https://g/a-200.gif',
    thumb: 'https://g/a-preview.gif',
    title: 'a cat',
    provider: 'giphy',
  });
  // bbb has no preview_gif, so thumb falls back to the main url
  assert.deepEqual(out[1], {
    id: 'bbb',
    url: 'https://g/b-orig.gif',
    thumb: 'https://g/b-orig.gif',
    title: 'a dog',
    provider: 'giphy',
  });
});

test('normalizeGiphyResponse returns [] on garbage input', () => {
  assert.deepEqual(normalizeGiphyResponse(null), []);
  assert.deepEqual(normalizeGiphyResponse({}), []);
  assert.deepEqual(normalizeGiphyResponse({ data: 'not an array' }), []);
});

test('normalizeTenorResponse flattens the Tenor { results, media_formats } shape', () => {
  const body = {
    results: [
      {
        id: '111',
        title: 'thumbs up',
        content_description: 'a thumbs up gif',
        media_formats: {
          gif: { url: 'https://t/111.gif' },
          tinygif: { url: 'https://t/111-tiny.gif' },
        },
      },
      {
        id: '222',
        // Some Tenor responses only have a content_description
        content_description: 'just a smile',
        media_formats: {
          gif: { url: 'https://t/222.gif' },
          tinygif: { url: 'https://t/222-tiny.gif' },
        },
      },
    ],
  };
  const out = normalizeTenorResponse(body);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0], {
    id: '111',
    url: 'https://t/111.gif',
    thumb: 'https://t/111-tiny.gif',
    title: 'thumbs up',
    provider: 'tenor',
  });
  // 222 has no `title`, so we fall back to content_description
  assert.equal(out[1].title, 'just a smile');
  assert.equal(out[1].provider, 'tenor');
});

test('normalizeTenorResponse returns [] on garbage input', () => {
  assert.deepEqual(normalizeTenorResponse(null), []);
  assert.deepEqual(normalizeTenorResponse({}), []);
  assert.deepEqual(normalizeTenorResponse({ results: 'oops' }), []);
});

test('normalizeResponse dispatches on provider', () => {
  const giphyBody = { data: [{ id: 'g1', title: '', images: { fixed_height: { url: 'u' }, preview_gif: { url: 'p' } } }] };
  const tenorBody = { results: [{ id: 't1', title: '', media_formats: { gif: { url: 'u' }, tinygif: { url: 'p' } } }] };
  assert.equal(normalizeResponse('giphy', giphyBody)[0].provider, 'giphy');
  assert.equal(normalizeResponse('tenor', tenorBody)[0].provider, 'tenor');
  assert.throws(() => normalizeResponse('bogus', {}), /unknown provider/);
});

// ---------------------------------------------------------------------------
// gif-provider — fetcher wiring (no real network; use a fake fetch)
// ---------------------------------------------------------------------------

test('searchGifs builds the URL, fetches it, and normalizes Giphy results', async () => {
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(url);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: 'a',
            title: 'A',
            images: {
              fixed_height: { url: 'https://g/a-200.gif' },
              preview_gif: { url: 'https://g/a-tiny.gif' },
            },
          },
        ],
      }),
    };
  };

  const out = await searchGifs({
    query: 'wave',
    provider: 'giphy',
    apiKey: 'k1',
    limit: 5,
    fetchImpl: fakeFetch,
  });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0],
    'https://api.giphy.com/v1/gifs/search?api_key=k1&q=wave&limit=5',
    'searchGifs must call fetch with exactly the URL buildSearchUrl produced',
  );
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 'a');
  assert.equal(out[0].provider, 'giphy');
  assert.equal(out[0].url, 'https://g/a-200.gif');
  assert.equal(out[0].thumb, 'https://g/a-tiny.gif');
});

test('searchGifs builds the URL, fetches it, and normalizes Tenor results', async () => {
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(url);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 'b',
            title: 'B',
            media_formats: {
              gif: { url: 'https://t/b.gif' },
              tinygif: { url: 'https://t/b-tiny.gif' },
            },
          },
        ],
      }),
    };
  };

  const out = await searchGifs({
    query: 'thumbs up',
    provider: 'tenor',
    apiKey: 'k2',
    fetchImpl: fakeFetch,
  });
  assert.equal(calls[0], 'https://tenor.googleapis.com/v2/search?key=k2&q=thumbs+up&limit=20');
  assert.equal(out.length, 1);
  assert.equal(out[0].provider, 'tenor');
});

test('searchGifs throws with a human-readable error on non-2xx responses', async () => {
  const fakeFetch = async () => ({
    ok: false,
    status: 401,
    text: async () => '{"meta":{"msg":"Invalid API key"}}',
  });
  await assert.rejects(
    () => searchGifs({ query: 'x', provider: 'giphy', apiKey: 'bad', fetchImpl: fakeFetch }),
    /giphy search failed: HTTP 401/,
  );
});

test('searchGifs throws when the response body is not valid JSON', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => { throw new SyntaxError('Unexpected token < in JSON at position 0'); },
  });
  await assert.rejects(
    () => searchGifs({ query: 'x', provider: 'tenor', apiKey: 'k', fetchImpl: fakeFetch }),
    /tenor: response body was not valid JSON/,
  );
});

test('searchGifs rejects with a clear error when no fetch implementation is available', async () => {
  const savedFetch = globalThis.fetch;
  try {
    delete globalThis.fetch;
    await assert.rejects(
      () => searchGifs({ query: 'x', provider: 'giphy', apiKey: 'k' }),
      /no fetch implementation available/,
    );
  } finally {
    if (savedFetch !== undefined) globalThis.fetch = savedFetch;
  }
});

test('searchGifs rejects invalid inputs without calling fetch', async () => {
  let called = false;
  const fakeFetch = async () => { called = true; return { ok: true, status: 200, json: async () => ({}) }; };
  await assert.rejects(
    () => searchGifs({ provider: 'giphy', apiKey: 'k', query: '', fetchImpl: fakeFetch }),
    /query/,
  );
  await assert.rejects(
    () => searchGifs({ provider: 'bogus', apiKey: 'k', query: 'x', fetchImpl: fakeFetch }),
    /must be 'giphy' or 'tenor'/,
  );
  assert.equal(called, false, 'fetch must not be called when input validation fails');
});
# Media bucket — free catalog + BYO gif-provider

The editor needs a media panel. This lane ships the **data layer**:
a curated, royalty-free catalog of still images + tasteful CSS
gradients, and a small **BYO gif-provider** client for the case where
the user wants to search a real gif service (Giphy, Tenor).

There is **no UI, no React, no styling, no bundled media binaries** in
this module. The owner of the editor's media panel wires the UI on top
of this loader; the catalog references media by URL only.

> File map (all under `editor/src/library/media/`):
>
> | file | role |
> |---|---|
> | `catalog.json`   | Curated free media references. JSON, browser-safe import. |
> | `index.js`       | Headless loader — `listMedia`, `getMedia`, `categories`, `gradients`. |
> | `gif-provider.js`| BYO Giphy/Tenor search client (URL builder + fetcher + normalizers). |
> | `index.test.js`  | `node --test src/library/media/` — no network, no UI. |
> | `_entry.js`      | Test entry (registered as `package.json` `main`). |
> | `package.json`   | Sub-package descriptor. |

---

## 1. Bundled catalog — what's in it

The catalog is structured into three typed arrays under the top-level
keys `images`, `gifs`, `gradients`. Each entry has the same id-prefix
scheme by type (`img-…`, `gif-…`, `grad-…`) so a future unified index
is trivial.

### `images`

46 references spanning seven categories:

| category  | count |
|---|---|
| abstract  | 8 |
| texture   | 6 |
| nature    | 8 |
| people    | 6 |
| product   | 6 |
| tech      | 6 |
| pattern   | 6 |
| **total** | **46** |

Every entry is a `https://picsum.photos/seed/<seed>/<w>/<h>` reference.
Picsum is a curated Lorem-Ipsum-for-photos service: same seed always
returns the same image, and every photo on Picsum is sourced from
**Unsplash** (Picsum's "Image Source & Credits" page confirms this).

### `gifs`

`gifs: []` — deliberately empty.

There is no widely-stable, openly-licensed CDN of curated gif URLs we
can reference the way Picsum works for stills. (Giphy and Tenor's
public CDNs are stable, but their gifs are not CC0 — they have their
own terms that restrict redistribution and bulk download.) The shipped
gif path is therefore the BYO provider below, which is the same shape
the rest of the editor uses for BYO LLM keys.

If a future lane finds a stable CC0/open gif source (e.g. an MIT-licensed
museum collection), append entries here in the same shape as `images`.

### `gradients`

12 tasteful CSS gradients, no URLs. Each is a complete `css` value
ready to paste into a `background:` or `background-image:` declaration.
Categories: `vibrant`, `warm`, `cool`, `dark`, `neutral`.

---

## 2. Licensing of bundled media

This module bundles **no media binaries**. Everything is a remote URL.

| Source                                  | License                                                                              |
|-----------------------------------------|--------------------------------------------------------------------------------------|
| Picsum (`picsum.photos`)                | Unsplash-derived — each image's copyright belongs to its original Unsplash author.  |
|                                         | Picsum itself is free to use commercially; per the [Unsplash License](https://unsplash.com/license), |
|                                         | photos can be used freely for commercial and non-commercial purposes, without permission. |
|                                         | We mark the catalog entry's `license` field as `"Unsplash"` to reflect provenance. |
| Gradients (CSS)                         | MIT — these are pure code authored for RHOBEAR Designs; no third-party content.      |
| Gif search results (via BYO provider)   | Subject to the user's chosen provider's terms (Giphy / Tenor). See §4.              |

If you swap Picsum seeds for direct Unsplash or Pexels CDN URLs (both
are allowed by the catalog schema — `source` is a free string and `url`
is free-form), the licensing label on each entry should be updated to
match: `"Pexels"` for Pexels (the [Pexels License](https://www.pexels.com/license/)
is also a free commercial-use license) or `"Unsplash"` for Unsplash.

---

## 3. API surface (consumer view)

```js
import {
  listMedia,
  getMedia,
  categories,
  gradients,
  IMAGES,
  GIFS,
  GRADIENTS,
  MEDIA_TYPES,
} from '@rhobear/editor-library-media';

// All images in the abstract category
listMedia('image', 'abstract');
// → [{ id: 'img-abstract-001', type: 'image', category: 'abstract', … }, …]

// All categories present for image entries
categories('image');
// → ['abstract', 'texture', 'nature', 'people', 'product', 'tech', 'pattern']

// A single entry by id (across types)
getMedia('grad-aurora');
// → { id: 'grad-aurora', type: 'gradient', name: 'Aurora', css: '…', … }

// Just gradients (convenience)
gradients();
// → [{ id: 'grad-aurora', … }, { id: 'grad-sunset', … }, …]
```

`listMedia` and `categories` never throw on unknown type/category — they
return `[]`, so a UI panel can pass user-typed input safely.

---

## 4. BYO gif-provider — keys & endpoints

The editor's settings dialog already hosts a "BYO key" pattern for
LLM providers (Anthropic / OpenAI / Google). The same pattern is used
for gif providers. Keys are stored **only in the user's browser**
(`localStorage`, via the existing settings modal) — never sent to
RHOBEAR infrastructure.

### Supported providers

| provider | endpoint                                      | param name for key | docs |
|---|---|---|---|
| `giphy`  | `https://api.giphy.com/v1/gifs/search`        | `api_key`          | <https://developers.giphy.com/docs/api/endpoint#search> |
| `tenor`  | `https://tenor.googleapis.com/v2/search`      | `key`              | <https://developers.google.com/tenor/guides/quick-start> |

Both endpoints accept the standard search params `q` (the query) and
`limit` (page size, 1..50).

### Where the key is entered

The settings modal lives at `editor/index.html#settings-modal` and is
wired up in `editor/src/app/shell.js`. The next phase of the media
panel lane extends that modal with two extra fields:

```html
<div class="rb-setting">
  <span class="rb-setting__label">GIF provider</span>
  <select class="rb-input" id="gif-provider" data-testid="gif-provider">
    <option value="giphy">Giphy</option>
    <option value="tenor">Tenor</option>
  </select>
</div>
<div class="rb-setting">
  <span class="rb-setting__label">GIF API key</span>
  <input type="password" class="rb-input" id="gif-key" placeholder="…" data-testid="gif-key" />
  <span class="rb-setting__hint">Free tier is fine. Stored locally only.</span>
</div>
```

…and reads them on every search call:

```js
import { searchGifs } from '@rhobear/editor-library-media';

const provider = localStorage.getItem('rb:gif-provider') || 'giphy';
const apiKey   = localStorage.getItem('rb:gif-key') || '';

try {
  const gifs = await searchGifs({ query: 'celebrate', provider, apiKey, limit: 20 });
  // gifs → [{ id, url, thumb, title, provider }, …]
} catch (err) {
  // err.message is human-readable: e.g.
  //   "[library/media/gif-provider] giphy search failed: HTTP 401 — {\"meta\":{\"msg\":\"Invalid API key\"}}"
}
```

### Why BYO?

Same reason as the LLM keys: RHOBEAR is a free product with no backend,
no account system, and no way to safely host other people's keys. The
free tier of Giphy (1000 req/day) and Tenor (100 req/min) is plenty for
interactive search.

If/when RHOBEAR adds an account system, the BYO surface stays — the
authenticated call simply forwards the user's stored key server-side.

---

## 5. URL-builder unit testability

The most error-prone piece of any BYO-API integration is the URL. The
URL builder is exported as a **pure function** with no network I/O:

```js
import { buildSearchUrl } from '@rhobear/editor-library-media';

buildSearchUrl({ query: 'hi there', provider: 'giphy', apiKey: 'abc123', limit: 12 });
// → 'https://api.giphy.com/v1/gifs/search?api_key=abc123&q=hi+there&limit=12'

buildSearchUrl({ query: 'wave', provider: 'tenor', apiKey: 'xyz' });
// → 'https://tenor.googleapis.com/v2/search?key=xyz&q=wave&limit=20'
```

Tests pin the constructed strings exactly — see `index.test.js`. No
mocks, no network, no time-based flakiness.

---

## 6. Why no node:fs in the loader

The fonts and elements lanes both shipped loaders that used
`readFileSync` from `node:fs`. The fonts lane was rescued by switching
to the `import … with { type: 'json' }` attribute; the elements lane
is **still broken in the browser bundle** because `node:fs` is not
available in the browser.

This lane avoids that class of bug from day one:

```js
import catalogData from './catalog.json' with { type: 'json' };
```

The `with { type: 'json' }` is a standard JSON module attribute
(ECMA-2025 + Node 22 + Vite 6), so the same import works in Node tests
and the browser bundle. There is **no `node:` import anywhere** in
`index.js` or `gif-provider.js`.

---

## 7. Run the tests

```bash
cd editor
node --test src/library/media/
```

Expected: all green, 12+ tests, ~100 ms.

---

MIT — RHOBEAR Designs (original).
# Deploying RHOBEAR Designs

`npm run build` produces a fully static `editor/dist/` directory. The
editor is a **client-side single-page app** — there is no server
runtime, no API route, no database. You can host `dist/` on any
static-file host.

## What's in `dist/`

```
dist/
├── index.html               # the app shell — entry point
└── assets/                  # hashed JS chunks, CSS, fonts, source maps
    ├── index-<hash>.js      # main bundle
    ├── index-<hash>.css     # RHOBEAR theme + GrapesJS overrides
    ├── grapes-…             # vendored GrapesJS bundle
    └── <sample-slug>-…      # one chunk per template (lazy-loaded)
```

Total size: ~30 MB uncompressed (~700 KB gzipped for the main bundle).
Each template HTML is bundled as its own chunk so the gallery loads
lazily; only the templates the user actually opens are fetched.

> Note: the build emits a one-time warning that the main bundle is
> larger than Vite's default 500 kB chunk-size warning limit. This is
> by design — the main bundle contains the full editor (GrapesJS,
> vendored plugins, Three.js engine, mode controllers). A future lane
> can introduce `manualChunks` to split it; the current shape ships
> fine on every modern connection.

## 1. Static hosts — pick any

### GitHub Pages

```bash
# from the repo root, build into ./docs so GitHub Pages serves it
cd editor
npm run build
# copy dist/ contents into the gh-pages branch (or use the
# standard "Deploy from a branch → /docs" Pages setting)
```

Or with the `gh` CLI and a separate branch:

```bash
cd editor && npm run build
git checkout -b gh-pages
git rm -rf .   # leave editor/dist/ alone
mv editor/dist/* ./
git add . && git commit -m "deploy: editor v1.0.0"
git push -f origin gh-pages
```

Then in GitHub repo settings → Pages → Source: `gh-pages` branch,
`/` root.

### Netlify

Drop `editor/dist/` into a Netlify site. Build command:
`cd editor && npm run build`. Publish directory: `editor/dist`.

### Cloudflare Pages

Build command: `cd editor && npm run build`. Build output:
`editor/dist`. No `_headers` or `_redirects` are required for the
default behavior.

### Nginx / Apache / S3 + CloudFront

Upload the **contents** of `editor/dist/` to your document root. No
rewrite rules are required — the app is a SPA whose entry is
`index.html`, served at whatever URL you mount it under.

### Custom subpath mounting

If you serve the editor from a subpath (e.g. `https://example.com/editor/`),
Vite's `base: './'` (already set in `vite.config.js`) makes every
asset path relative, so the same `dist/` works at any depth.

## 2. The editor needs outbound network

The **editor shell** itself is self-contained and runs fine offline
once loaded, but the following runtime features make outbound calls
that the host must permit:

| Surface                  | Where the request goes                                        | Required for                                              |
|--------------------------|---------------------------------------------------------------|-----------------------------------------------------------|
| **Google Fonts CSS**     | `fonts.googleapis.com`, `fonts.gstatic.com`                   | USER-content fonts (the 52-family picker) — the app chrome itself uses system font stacks, no webfont |
| **FontAwesome CSS**      | `cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/...`       | GrapesJS built-in icon stylesheet                         |
| **`three` (3D embed)**   | `https://esm.sh/three@0.161.0`                                | 3D Studio mode (the iframe-mounted embed)                 |
| **Picsum / Unsplash**    | `https://picsum.photos/...`                                   | Media-bucket placeholder images                           |
| **BYO-LLM providers**    | `api.anthropic.com`, `api.openai.com`, `generativelanguage.googleapis.com` | AI assist — only when the user supplies a key  |
| **BYO gif providers**    | `api.giphy.com`, `tenor.googleapis.com`                       | GIF search — only when the user supplies a key            |

If you operate a strict Content-Security-Policy, the minimum allow-list
for the editor to function is:

```
connect-src  https:   (or list the providers above explicitly)
style-src    'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline';
font-src     'self' https://fonts.gstatic.com data:;
img-src      'self' data: https:;
script-src   'self' https://esm.sh;
frame-src    'self';      # the live-page iframe + 3D embed iframe
```

The editor **never** posts the user's data anywhere except directly to
the provider they configured in the AI panel. There is no RHOBEAR
telemetry endpoint.

## 3. Verifying a fresh deploy

After deploying `dist/` to any host, sanity-check the build with the
Playwright smoke suite — point it at the deployed URL:

```bash
# local:  http://127.0.0.1:5180   (npm run dev)
# preview: http://127.0.0.1:4173  (npm run preview)
# prod:    https://your.host.example/
```

The 51-test smoke + feature suite (see [`README.md`](./README.md#tests))
exercises every mode end-to-end. A green run on a production URL is
the strongest deployment evidence you can get short of an actual
human poking at it.

## 4. Updating an existing deploy

Each `npm run build` rewrites the asset filenames with content-hashed
names (e.g. `index-CgEaYLlM.js`), so re-deploying `dist/` is safe —
old assets become unreachable and new ones load fresh. The HTML entry
always references the current hashes, so there is no cache-busting
work to do.

For long-lived CDNs with aggressive caching, set:

- `index.html` → `Cache-Control: no-cache` (or a short TTL like 5 min)
- `assets/*`  → `Cache-Control: public, max-age=31536000, immutable`

That pairs the entry's freshness with the assets' cacheability.

## 5. Self-hosting without npm

If you only want to *run* the editor and don't want to install npm,
just download a release tarball (the maintainer publishes one for each
tagged version), unpack it, and serve the `dist/` folder with any
static-file server:

```bash
tar -xzf rhobear-designs-editor-v1.0.0.tar.gz
cd rhobear-designs-editor-v1.0.0/dist
python3 -m http.server 8080        # any static server works
```

That's the whole deployment story.

---

## 6. Cloud deploy — `designs.rhobear.ai` (Free + Pro, managed AI)

The **Cloud** lane adds a *managed* mode on top of the static editor: a
signed-in user routes the AI through the RHOBEAR house gateway and the
**family backend** does the gating. Designs itself still ships **zero
server runtime** — "do not build new infra; reuse the family backend."

### What the editor calls (all same-origin via reverse proxy)

| Path (on designs.rhobear.ai)        | Proxied to               | Purpose                                          |
|--------------------------------------|--------------------------|--------------------------------------------------|
| `POST /v1/chat/completions`          | `gw.rhobear.ai/v1`       | Managed LLM (ARC free / URS_MINOR / URS Pro)     |
| `GET  /cloud/auth/{google,github}/start` | family API (auth)    | Shared Google/GitHub OAuth → session cookie      |
| `GET  /cloud/auth/me`                | family API (auth)        | Identity probe                                   |
| `GET  /cloud/gate/state`             | family API (gate)        | Tier / credits / free-gen meter (`generate.used/limit`) |
| `POST /cloud/billing/checkout`       | family API (billing)     | Stripe Checkout `{tier}` → `{url}` (Pro $19 / Team $49) |

Because everything is same-origin, the session cookie set by the shared
OAuth is first-party and `credentials: 'include'` just works — no
SameSite/CORS dance. (For a split-origin deploy, set `VITE_MANAGED_BASE`
and `VITE_CLOUD_API_BASE` in `.env` and scope the cookie to `.rhobear.ai`.)

### Option A — rhobear-vps Caddy (recommended)

```caddyfile
# designs.rhobear.ai — static editor + reverse-proxied family services
designs.rhobear.ai {
  root * /opt/rhobear/designs-editor/dist   # the built editor/dist
  encode zstd gzip

  # SPA entry must not be cached aggressively (asset filenames are hashed)
  @html path *.html /
  header @html Cache-Control "no-cache"
  header /assets/* Cache-Control "public, max-age=31536000, immutable"

  # Managed LLM gateway (the house models, ARC/URS_MINOR/URS)
  handle_path /v1/* {
    reverse_proxy https://gw.rhobear.ai {
      header_up Host gw.rhobear.ai
    }
  }

  # Shared family auth + gate + billing (the rhobear-plans board-render API)
  handle_path /cloud/* {
    reverse_proxy https://api.rhobear.ai   # or the same-host family service
  }

  file_server
}
```

Deploy the editor with:

```bash
cd editor && npm run build
rsync -a dist/ rhobear-vps:/opt/rhobear/designs-editor/dist/
# then `systemctl reload caddy` (owner — see AGENTS.md §4)
```

### Option B — Cloudflare Pages (static) + the family backend elsewhere

- **Build command:** `cd editor && npm run build`
- **Build output directory:** `editor/dist`
- Set the env vars `VITE_MANAGED_BASE=https://gw.rhobear.ai` and
  `VITE_CLOUD_API_BASE=https://api.rhobear.ai` in the Pages project.
- The family backend must then serve the session cookie scoped to
  `.rhobear.ai` (`SameSite=None; Secure`) so the cross-subdomain auth works.

### Spend caps are MANDATORY and enforced at the gateway

The lane makes per-user AND per-IP spend caps mandatory — the same
discipline as the "Plans /v1 relay fix." Designs relies on the house
gateway + family gate to enforce them; the client honors the responses:

- `402 payment_required` → the free ARC cap (~1000 gen/mo) was hit, OR a
  Pro-only model/feature was used without a sub/credits. The editor shows
  the upgrade modal with the gate's `requiredAction` (`buy_credits` /
  `subscribe`).
- `429` → the per-user or per-IP spend cap tripped (the hard ceiling above
  the credit/quota logic). The editor shows the message + a `Retry-After`.
- `401` → no session. The editor prompts sign-in via the shared OAuth.

The editor never echoes a raw server error body — only the envelope's
intentional `message`, so no upstream/SQL detail leaks to the browser.

### Owner-only: live Stripe / PayPal keys

Designs ships with **test-mode** checkout wiring. Live keys are an
owner-insert env on the **family backend** (`STRIPE_SECRET_KEY`, webhook
`STRIPE_WEBHOOK_SECRET`, plus the `lookup_key`-indexed prices the
`cloud-billing` lane provisions for `pro` / `team`). Nothing in this repo
holds a secret. Until the live keys land, `POST /cloud/billing/checkout`
returns a non-ok envelope and the upgrade modal falls back to the launch
code / signed-license path in `pro.js`.

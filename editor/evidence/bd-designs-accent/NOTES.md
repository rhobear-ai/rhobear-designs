# bd-designs-accent — evidence

Lane: `bd-designs-accent` — give RHOBEAR Designs the red bear theme.
Repo: `deariencampbell1-sys/rhobear-designs`, branch `feat/red-accents`.

## What changed

1. **Accent swap** — `--rb-brand` and friends in
   `editor/src/styles/rhobear-theme.css` flipped from Aurora Teal to Red Bear:

   | token              | before (teal)               | after (red)                  |
   | ------------------ | --------------------------- | ---------------------------- |
   | `--rb-brand`       | `#2dd4bf`                   | `#e94560` (brand red)        |
   | `--rb-brand-soft`  | `#5eead4`                   | `#f56b81` (lighter red)      |
   | `--rb-brand-deep`  | `#14b8a6`                   | `#cf3a52` (darker red)       |
   | `--rb-brand-glow`  | `rgba(45, 212, 191, 0.22)`  | `rgba(233, 69, 96, 0.22)`    |
   | `--rb-brand-faint` | `rgba(45, 212, 191, 0.10)`  | `rgba(233, 69, 96, 0.12)`    |

   All hardcoded `rgba(45, 212, 191, …)` glows inside the theme were also
   replaced with their red equivalents (one-to-one opacity mapping). One
   additional stray teal — the primary-button hover top stop
   `#7ff0df` — was replaced with `#f4879a` (lighter red).

   The CSS variable mechanism means every place that used `var(--rb-brand*)`
   now resolves to red automatically — primary buttons, mode-switch active
   state, hover glows, focus rings, selection outlines, AI-FAB shadow, status
   dot, gradient presets, brand mark background, etc.

2. **Default colors** updated in code (3D, live mode, library, demo content):

   - `src/app/three-mode.js` — default 3D primitive color + fallback hex.
   - `src/3d/handle.js` — emissive highlight on selection.
   - `src/3d/serialize.js` — JSDoc example.
   - `src/app/live-mode.js` — edit-mode cursor outline, drop line, glow
     preset gradient, link-pick outline, default gradient preset.
   - `src/app/shell.js` — Quick-Insert "Button" snippet.
   - `src/editor/grapes-init.js` — Build-mode demo "Get started" CTA.

3. **Bear placed** — fetched the canonical logo once from
   `https://raw.githubusercontent.com/deariencampbell1-sys/rhobear/main/.claude/skills/rhobear-design/assets/rhobear-logo.png`
   into `editor/src/assets/rhobear-logo.png` (218 KB, 512×512 PNG). The
   toolbar brand mark in `index.html` now uses `<img class="rb-logo-img"
   src="/src/assets/rhobear-logo.png">` and is tinted to red via the CSS
   rule `.rb-logo-img { filter: hue-rotate(180deg) saturate(1.25); }`
   (added to `rhobear-theme.css`). The 3 other bear marks (empty state,
   AI FAB, AI panel header) keep the inline SVG format but their accent
   fills were switched from teal `#5eead4` to brand red `#e94560`.

4. **Tests updated** — `src/3d/serialize.test.js` fixtures, the
   `tests/e2e/three.spec.js` setColor happy path (assertion expects
   `'e94560'` from `getHexString()`), and test fixtures (`scripted-page.html`,
   `three-blank.html`) all carry the new brand red. The smoke-spec describe
   string was renamed from "Aurora Teal" to "Red Bear".

## DoD checks

- `npm install` → clean (47 packages, 988 ms).
- `npm run build` → built in 6.03 s, no errors (only the preexisting chunk-size
  warning from the 3D model library).
- `node --test src/**/*.test.js` → **441/441 pass** (core, engine, 3d, serializer).
- `npx playwright test` (three + smoke + overlay + mode-b) → **51/51 pass**.
- `npm run dev` (port 5180) → boots clean.
  - HTTP 200 on `/`, `/src/styles/rhobear-theme.css`, `/src/assets/rhobear-logo.png`.
  - Served CSS contains **0** teal residual references.
  - Served HTML has the `<img class="rb-logo-img">` tag pointing at the
    PNG, and 3 inline SVG bears whose fills are `#04110f`/`#e94560` only.
  - Console errors: **none** (only Vite HMR `[debug] connected` messages).
- Editor primary controls paint red:
  - Primary button (`Save`) → `linear-gradient(rgb(245, 107, 129), rgb(233, 69, 96))`
  - Mode-switch active (`Edit Live Site`) → same red gradient
  - Status dot → `rgb(233, 69, 96)`
- Brand bear renders:
  - PNG logo: `naturalWidth=512`, `naturalHeight=512`, `complete=true`,
    `filter=hue-rotate(180deg) saturate(1.25)`, client size 30×30.
  - Inline SVG bears: 3 instances, each with 5× `#e94560` accent fills.

## PR base discrepancy (flagged)

Lane says "Branch FROM main, PR base main." — `editor/` does **not** exist
on `main` (it's on `feat/website-editor` and the more developed
`build/editor-v1`). To get a working `editor/` tree, this branch was
rebased onto `origin/build/editor-v1` (3359a03). If a PR to `main` is
expected, that likely requires `feat/website-editor` (or
`build/editor-v1`) to land on `main` first; otherwise the PR should
target `build/editor-v1` or `feat/website-editor`. Flagging for the
owner.

## DOM-eval evidence (headless Chromium via agent-browser)

```js
// Brand tokens resolved at :root
getComputedStyle(document.documentElement).getPropertyValue('--rb-brand')        // "#e94560"
getComputedStyle(document.documentElement).getPropertyValue('--rb-brand-soft')   // "#f56b81"
getComputedStyle(document.documentElement).getPropertyValue('--rb-brand-deep')   // "#cf3a52"
getComputedStyle(document.documentElement).getPropertyValue('--rb-brand-glow')   // "rgba(233, 69, 96, 0.22)"
getComputedStyle(document.documentElement).getPropertyValue('--rb-brand-faint')  // "rgba(233, 69, 96, 0.10)"

// Primary control paints red
getComputedStyle(document.querySelector('.rb-btn--primary')).backgroundImage
// "linear-gradient(rgb(245, 107, 129), rgb(233, 69, 96))"

getComputedStyle(document.querySelector('.rb-status__dot')).color
// "rgb(233, 69, 96)"

// Bear inventory
document.querySelectorAll('.rb-bear').length                                    // 3 (inline SVG)
document.querySelector('.rb-logo-img').getAttribute('src')                     // "/src/assets/rhobear-logo.png"
document.querySelector('.rb-logo-img').complete && naturalWidth > 0             // true
getComputedStyle(document.querySelector('.rb-logo-img')).filter
// "hue-rotate(180deg) saturate(1.25)"
```
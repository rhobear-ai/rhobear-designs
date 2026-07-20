# VERIFY BY BUILD — the Stage 8b recipe

Pictures + CSS + JS + a handoff note is **not** done. Before any of it leaves the building, you
build a small throwaway index from the code, render it in a real browser, screenshot it, and set
that screenshot beside the approved mock. If the built frame is not the mock, the code is wrong —
fix it in the file, not in a note to someone else.

> **A read is a proxy. A render is the fact.** The whole reason this stage costs extra tokens is
> that the cheap version — reading CSS beside a picture — passes code that looks right in the source
> and renders wrong on the screen. This system is premium; it pays the render cost every time.

This is the same law as everywhere else: **verify by driving the real thing, not by trusting the
source, a log line, or your own memory.**

---

## The loop

```
for each approved frame:
  1  BUILD    assemble a throwaway index from the frame's CSS + JS + tokens
  2  RENDER   open it in a real browser at the frame's declared viewport
  3  SHOOT    screenshot it
  4  COMPARE  set the shot beside the approved mock
  5  FIX      any gap → correct it in the CSS/JS, in this pass. Re-render.
```

No gap survives to a handoff note. "Correct in place, do not report" (`SKILL.md`) is enforced here
by the fact that you are already in the file with the browser open.

---

## 1 · BUILD — the throwaway index

One HTML file per frame family, self-contained, in a scratch folder that gets deleted at hand-off
(cleanup is part of done). It pulls in exactly what the codify stage produced — nothing more, so a
missing token shows up as a broken render instead of being silently supplied by a full app shell.

```html
<!doctype html><meta charset="utf-8">
<title>8b · <product> <screen></title>
<link rel="stylesheet" href="./core.css">          <!-- shared tokens -->
<link rel="stylesheet" href="./<product>-tokens.css"><!-- the delta -->
<link rel="stylesheet" href="./<product>.css">       <!-- the components -->
<body data-palette="<default>">
  <!-- the DOM the frame shows, with the REAL strings from the mock -->
</body>
<script type="module" src="./<product>.js"></script>
```

Rules:
- **Real strings only** — paste the labels/numbers the mock actually shows, so a mismatch is
  visible. Lorem hides the exact bugs this stage catches.
- **No full framework, no app router.** The point is to test the CSS/JS *as codified*, in isolation.
  If it only renders correctly inside the whole app, the tokens are leaning on something undeclared.
- **Load the marks as the pack files**, at the sizes the mock uses — not a re-generated raster.

---

## 2 · RENDER + 3 · SHOOT

A real browser at the frame's declared viewport. Headless is fine; the screenshot is the artefact.

```bash
# desktop frame → 1600×900 ; mobile frame → 430×932
npx playwright screenshot --viewport-size=1600,900 \
  file:///abs/path/scratch/8b-<product>-<screen>.html \
  scratch/_shots/8b-<product>-<screen>.png
```

Shoot **both themes** if the product ships light + dark, and every declared **palette** if it ships
several (drive `data-palette`) — a token that only survives one skin is a skin, not a system.

---

## 4 · COMPARE — what to look for in the render

The mock is the target; you are checking the render against it, in that direction only. Four things
go wrong silently, and all four are visible once it is built:

| Check | The silent failure it catches |
|---|---|
| **Hex** | A swatch drawn `#C84BAA` whose token was set to something else builds a different product. Every colour in the render must match the mock and trace to a token. |
| **Glass** | Glass in the mock must be `backdrop-filter: blur()` in the **render**, not just a word in the source. A frosted card coded as a flat fill is the most common miss — fine in isolation, wrong beside the mock. |
| **Structure** | Radii, borders, glows, shape. A pill drawn round that renders as a square-edged strip with a bottom border is plainer than the mock. |
| **Missing tokens** | Anything the mock colours that the CSS has no token for renders grey. Section labels are the classic case — teal in every mock, grey in the build unless `--text-section` exists. |

---

## 5 · FIX — in the file, this pass

A gap found here is corrected in the CSS/JS now, and re-rendered until the shot matches. Two things
never happen at this stage:

- **No deferred list.** Handing someone "here are 6 things to fix" is a deferred failure; the whole
  value of catching it here is that it is one edit now and a rebuild later.
- **No annotating hallucinated content.** If the mock contains something a worker must not copy — an
  invented nav item, gibberish filler, a placeholder rendered literally — it is **deleted** from the
  build artefact, not commented `<!-- ignore -->`. A note saying "don't build this" is still a thing
  in the file someone eventually builds.

---

## Done

- [ ] every approved frame has a rendered screenshot beside it
- [ ] the screenshot matches the mock on hex, glass, structure, and has no grey-defaulted token
- [ ] all four checks passed in the **render**, not the source
- [ ] both themes and every palette shot, where the product ships them
- [ ] every gap corrected in the file; nothing deferred to a note
- [ ] scratch index + shots deleted, or moved into the ux-pack as the first real capture

The last line closes the loop back to `MODES.md`: in a **fresh** project, this first real build *is*
the thing you finally capture — Stage 8b's render is where a Mode B project grows its ux-pack.

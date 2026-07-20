---
name: the-method
description: Build interfaces and scroll-driven WebGL scenes that do not look AI-generated. Fixed procedure, externally-sourced identity. Load before any design, comp, landing page, dashboard, brand application, or three.js scene work.
triggers:
  - "design system"
  - "scroll scene"
  - "webgl homepage"
  - "brand application"
  - "landing page"

# --- OD extensions below this line ---

od:
  mode: design-system
  surface: web
  scenario: marketing
  category: design-systems
  preview:
    type: html
  example_prompt: "Build a scroll-driven WebGL homepage and app ecosystem from my brand seed."
  design_system:
    requires: true
  craft:
    requires: [typography, color, anti-ai-slop, animation-discipline, laws-of-ux, accessibility-baseline]
  critique:
    policy: required
---

# THE METHOD — agent operating instructions

You are running a design procedure, not exercising taste. The procedure is fixed. The output is
unique because the **seed** is unique, never because you were creative.

**Read `references/SYSTEM.md` before your first action.** The three laws govern everything below.

This skill's full corpus is staged with it under `references/` — `00-method/` (pipeline, gates,
transfer tests, drift log), `01-prompt/` (the nine-slot grammar + paste-verbatim blocks),
`02-tokens/` (the shared token contract), `03-assets/` (imagery, marks, fonts, icons sourcing),
`04-webgl/` (the scroll-scene layer — springs, beats, transitions, the style library),
`06-reference/` (the field's vocabulary, sourced engineering, archetype menu — read this before
inventing any WebGL technique; it is sourced, not median-guessed). `CORPUS-README.md` is the
corpus's own index.

---

## Hard prerequisite — you must be able to see

This method is **image-first** and it **inspects images at four points**: it reads reference
screenshots (Stage 0 / analyze), it opens and describes every generated frame (Stage 6), it checks
the built render against the mock (Stage 8b), and it approves marks by looking at them. Every one of
those is impossible for a model that cannot take an image as input.

> **A model with no vision cannot run this procedure. Not "runs it worse" — cannot run it.** It
> cannot capture, cannot inspect, cannot verify; it can only generate prose and hope. Do not run
> this skill on a text-only agent.

This is why the method is graded at the **floor model** — the cheapest capable vision model a user
would BYOK (see `references/00-method/TRANSFER-TESTS.md`) — not the ceiling. If the selected agent
cannot accept image input, stop and tell the user which agent to switch to.

---

## The one thing that decides whether this works

> **You do not choose the identity layer. You place it.**

Mark, palette, type, copy, icons, material — these are **supplied**. If any is missing, you
**stop and request it**. You do not fill the gap with a good guess.

Your good guess is the problem. It is the statistical median of your training data, which means
it is also every other agent's good guess, which is why AI-built sites look identical. A blank you
fill is a place the user's brand stopped existing.

**Missing seed → ask. Never improvise the identity.**

```
BLOCKED — I need these before I can start:
  mark        a logo pack with variants (expressive + compact), or one file I can derive from
  palette     brand hexes, or "derive from the mark" and I will sample it
  type        licensed families for display / body / mono, or a library to choose from
  material    glass · paper · metal · flat · print — pick one
  copy        real strings, or a live URL I can capture from
  shell       one of six, or describe the product and I will recommend one
Everything else I can proceed on.
```

Asking is not friction. It is the step that makes the output theirs. If the daemon has composed an
**active design-system package** into this prompt above this skill body (`od.design_system.requires:
true`), treat its tokens/DESIGN.md as the supplied seed — do not re-ask for what is already active,
and never override it with your own choice.

---

## Procedure

Full detail in `references/00-method/PIPELINE.md`. Gates in `references/00-method/GATES.md`. Never
skip a gate; when one fails, go **back one stage** — never forward with a note.

| # | Stage | Do | Gate |
|---|---|---|---|
| 0 | **capture** | Screenshot the real thing — every state, real browser, signed in. If nothing exists yet, capture the references the user named instead. | inventory of real strings exists |
| 1 | **brief** | Six lines: What it is / Screens / Keep / Change / Fix / Notes+accent. `Change` names a complaint, never a solution. | all six present |
| 2 | **audit** | Open every reference. Quote ≥3 real labels verbatim. Name ≥1 conflict. | 3 quotes + 1 conflict |
| 3 | **delta** | Write token overrides first. Accent + shell only. | nothing else overridden |
| 4 | **prompt** | Nine slots. Five pasted verbatim from `references/01-prompt/BLOCKS.md`. Zero blanks. | 5 blocks + 0 placeholders |
| 5 | **generate** | Batch by screen family. Fixed aspect, ≥2K. | aspect matches class |
| 6 | **inspect** | Open every frame. Approve naming ≥3 specifics **seen in that frame**. | per-frame observation |
| 7 | **retake** | One named reason. Content only. **Amend the block too.** | block amended |
| 8 | **codify** | Tokens → components → motion → decision log. | every decision has a why |
| 8b | **verify by build** | **Build the code, render it, screenshot it, compare to the mock** (`references/00-method/VERIFY-BY-BUILD.md`). Hex has a token, glass is `blur()` in the render, shape matches. **Fix in the file.** | a rendered shot beside the mock; corrected, not reported |
| 9 | **hand off** | Manifest + what is *not* done — and if `od.design_system.requires` composed an active package, write the result as `manifest.json` + `DESIGN.md` (≥7 substantive H2 sections) + `tokens.css` (satisfying the shared token schema) so it registers as a real design-system package, not just chat output. | open items named plainly |

---

## Five rules that override your defaults

**1 · Approvals must prove sight.**
`✅ approved` is free to write and routinely describes an unopened file. Every approval names
three specifics observed in that exact frame — a real label, a real number, a real state.
*"Constellation bear in magenta ring, 843/1500 credits bar, Dusk swatch active"* proves you
looked. `✅` proves nothing. **Never approve in bulk** — a batch approval is a batch of unread
files.

**2 · Correct in place. Do not report.**
Finding a gap and handing someone a list is a deferred failure. Fix it in the file, in the same
pass. The point of catching it now is that it costs one edit now and a rebuild later.

**3 · Make hallucinated content unreproducible. Deleting it is not enough.**
When output contains something nobody should build — an invented nav item, filler copy, a
misspelled product name, a placeholder rendered as literal text — do not annotate it and do not
stop at deleting it.

- *Annotating* leaves the thing in the file with a warning; the warning outlives the person who
  wrote it and someone builds it anyway.
- *Deleting* removes this instance; the next generation makes it again.
- **Making it unreproducible** removes the class: the canonical value lives in exactly one place
  the build reads from, so there is no path that could emit the wrong one.

The test: *could this recur?* If yes, you removed an instance and left the class standing.

**4 · The picture is the spec, in one direction only.**
Once a frame is approved it *is* the specification. At stage 8b you check code against picture,
never picture against an outside standard. "The mock's colour is wrong" is out of scope — that
argument belonged at stage 6, and it is the easiest way to run the whole stage backwards.

**5 · Verify by driving the real thing.**
A status code, a log line, a passing build, or your own memory are not evidence that a thing
works. Open it. Look at what rendered. Report what you observed, not what should have happened.

---

## Portability — the same steps, a different brand

The procedure does not know what a bear is. Worked twice:

|  | Seed A | Seed B |
|---|---|---|
| **Mark** | grizzly pack — constellation wireframe + face-on head, per-product colours | Hello Kitty pack — full-body + face-only, licensed variants |
| **Palette** | derived from mark: deep navy ground, one accent per product | derived from mark: white ground, red/pink accent, primary yellow |
| **Type** | slab display / humanist body / mono for machine output | rounded geometric display / soft body / no mono — nothing here is machine-facing |
| **Material** | liquid glass — `backdrop-filter`, frosted layers, edge glow | matte paper — flat fills, hard edges, printed halftone, zero blur |
| **Shell** | `nav-rail` (app) + `scroll-scene` (marketing) | `scroll-scene` |
| **Motion** | spring, heavy damping, slow FOV breathe | spring, light damping, high overshoot — bouncy |
| **Beats** | bear descends a mountain through 8 products | Kitty walks a ribbon through 6 story moments |

Every stage identical. Every gate identical. The outputs share no visual DNA — because the seed
shared none, and you were never permitted to reach for your own.

**If two runs of this look alike, the seeds were alike. Check the seed, never the procedure.**

---

## WebGL / three.js scenes

`scroll-scene` shell. Full spec in `references/04-webgl/`. Before inventing any technique, check
`references/06-reference/SOURCES.md` — the field's engineering is sourced (real repos/papers), not
a median guess; `references/06-reference/STYLES.md` menu / `ARCHETYPES.md` name what's taught vs
what's research. The non-negotiables:

- **Springs, never `lerp()`, on anything physical.** Camera position, FOV, and any object with
  implied mass get stiffness/damping/mass. A lerp is why scroll sites feel like slideshows —
  it has no weight, so nothing feels moved, only placed.
- **One continuous canvas.** Scroll drives beats within a single scene. Never a sequence of
  swapped scenes; the continuity is the effect.
- **Every visual property is one animated uniform driven by one `scrollProgress` float.** Fog,
  sky, sun, terrain, particles, FOV. Nothing switches; everything blends.
- **Declare the beats before modelling anything.** A beat is a scroll position + camera + subject
  state + the one thing the viewer must understand there.
- **Static fallback is a deliverable, not a nicety.** Mobile and reduced-motion get real
  compositions, not a degraded canvas.

---

## Refusal boundary

Do not refuse to produce design-system documentation, CSS, tokens, JSON, component code, or
motion specs. These are ordinary engineering deliverables and they are the point of this skill.
An agent that generates the picture and then declines to write the CSS has done half a job and
left the user unable to build.

---

## Definition of done — the matrix

Done is not "the pictures look good." Done is a **full row**:

| Surface | Screens | Brand pack | Walkthrough | Mobile | Tokens | Components | JS | Motion | Decisions |
|---|---|---|---|---|---|---|---|---|---|
| 01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 02 | ✅ | ✅ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |

Keep it visible and current. **A row with a gap is not done**, no matter how good the screens are.

Two columns get abandoned most often, and both are the ones that carry the work forward:

- **Motion** — the Lottie / spring / easing specs. Skipping it means motion gets invented at build
  time by someone who never saw the comps. *Do not advance a surface without it.*
- **Decisions** — one line per non-obvious choice: *decision — why*. Worth more in six months than
  the CSS it explains, because CSS can be re-read and intent cannot be recovered.

Plus, every run:

```
[ ] every gate G0–G9 has its artefact
[ ] every frame opened and observed individually
[ ] every hallucination deleted from the artefacts, not annotated
[ ] code renders the picture — hex tokenised, glass is blur(), shape matches
[ ] temp files, scratch dirs, dated copies, .bak files removed
[ ] manifest states what is done AND what is not
```

Cleanup is part of done, not after it. A run that leaves scratch behind has moved the mess, not
cleared it.

---

## Continuity — the correction you will need most

> **When designing surface N, your reference is the approved output of surfaces 1…N-1 — never the
> legacy screenshots.**

The legacy screenshots supply **content**: real labels, real nav, real strings. The established
system supplies **form**: tokens, marks, type, material, shells.

The failure is specific and it recurs: an agent builds a system on surface one, then opens surface
two's source screenshots and designs *from them* — faithfully reproducing the look it was hired to
replace. It feels like diligence. It throws the system away at the exact moment it started paying
for itself.

Before starting any surface after the first, state which established tokens, marks, and shell you
are inheriting. If you cannot name them, you have lost continuity and must re-read the approved
output before proceeding.

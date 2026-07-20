# THE METHOD

### a portable design system for agent-built interfaces and WebGL scenes

> **Precisely: a *framework* that produces design systems — not *a* design system.** *A* design system
> is one fixed thing (one palette, one type scale, one schema) describing one brand. This is the
> step-by-step *"how we do it every time"* that produces a different one for every seed. The distinction
> is the whole point: it is why the transfer test (`00-method/TRANSFER-TESTS.md`) grades the *framework's
> ability to carry the procedure across a seed swap*, not any one output's polish. See
> `06-reference/README.md`.

---

## What this is for

You ask an AI for a website. It gives you a good one. So does everyone else's AI, to everyone
else. Within a year the whole web is one website with different logos on it — same centred hero,
same three feature cards, same soft-shadow rounded rectangles, same icon set, same greeting-card
gradient, same font. Competent, forgettable, and identical.

That sameness is not a taste problem. It is a **process** problem, and it has one cause:

> **The model was allowed to choose the identity layer.**

When nobody supplies the mark, the palette, the type, the material, the copy, or the motion, the
model supplies them — and it supplies its own median, which is everyone's median. Every default it
reaches for is a default someone else is reaching for at the same moment.

This system's thesis is the inverse:

> **Fix the process completely. Source the identity externally. Same steps every time, different
> result every time.**

The steps below never vary. Run them for a mountain-climbing bear ecosystem and you get that.
Run them for a Hello Kitty scroll-driven WebGL homepage and you get that — recognisably Hello
Kitty, not Hello Kitty wearing the AI house style. The variance lives entirely in the seed, and
the seed is never the model's to invent.

This is not a licence to be creative. It is the opposite: a fixed, gated, boring procedure whose
output is unique *because* it is fixed. Creativity that lives in the agent is a lottery.
Uniqueness that lives in the inputs is a guarantee.

---

## The three laws

### LAW 1 — The model never chooses the identity layer

Six things are **sourced**, never generated at design time:

| Layer | Sourced how | Never |
|---|---|---|
| **Mark** | bought, commissioned, or supplied as a brand pack with variants | invented per screen |
| **Palette** | taken from the mark, or from a brand the client already owns | "a nice teal" |
| **Type** | licensed and named, three roles maximum | whatever ships with the framework |
| **Copy** | captured from the real product, or written by a human | filler, lorem, plausible-sounding invention |
| **Icons** | a licensed set, one family | the default icon library everyone imports |
| **Material** | declared (glass, paper, metal, flat) and held | model's default soft-shadow card |

The agent's job on all six is **placement, not selection**. It receives them and puts them where
they belong. Every time a blank is left, the model fills it with the median — and the median is
what makes your site look like everyone's site.

This law is doing more work than it looks. It is the only mechanism in the document that
guarantees a different result, because it is the only one where the input is genuinely yours.

### LAW 2 — Reality before design, evidence before advance

No screen is designed before its real state is captured. No stage advances without an artefact
proving the previous one happened.

An agent's confident summary is not evidence. `✅ All 6 approved` costs nothing to write and
routinely describes files nobody opened. The gates in `00-method/GATES.md` are built so each one
either produced a required artefact or did not — checkable by a script, a second agent, or a
glance, with no judgement involved.

### LAW 3 — Vary the seed, never the procedure

When output feels same-y, the fix is **never** "let the agent be more creative." Creative freedom
inside an agent means regression to its training median with extra steps.

The fix is always upstream:

- same-looking marks → the pack is thin; get more variants
- same-looking palettes → the palette wasn't derived from the mark
- same-looking layouts → the shell wasn't declared, so the default won
- same-looking copy → real strings weren't captured
- same-looking motion → the motion spec was absent, so easing defaulted

Every one of those is a missing input, not a missing spark.

---

## Why identical steps produce different results

The procedure is a **function**, not a template. Its output is fully determined by inputs that are
unique to the job:

```
        SEED (yours, external, unique)              PROCEDURE (fixed, shared)
        ─────────────────────────────               ─────────────────────────
        mark + variants                                  0  capture
        palette derived from mark          ───▶          1  brief
        licensed type, 3 roles                           2  audit
        material declaration                             3  delta
        real copy                                        4  prompt
        shell choice (1 of 5)                            5  generate
        motion character                                 6  inspect
                                                         7  retake
                                                         8  codify
                                                        8b  verify by build
                                                         9  hand off
                                                              │
                                                              ▼
                                                    OUTPUT — unique, because
                                                    the seed was unique
```

Two teams running this identically, with different seeds, cannot produce the same site. Two teams
"being creative" with the same model reliably do.

---

## Anti-default doctrine

Hard bans. Each exists because it is a place the model reaches for its median.

| Banned | Instead |
|---|---|
| The default component library's look, unmodified | declare a material and build to it |
| The default icon font / open icon set | one licensed family, or drawn for the job |
| Emoji as UI iconography | real icons |
| The default UI sans | licensed type, three named roles |
| Flat card + soft shadow + rounded corner, unexamined | a declared material, applied consistently |
| Lorem / placeholder / "..." | real strings, always |
| Purple-blue gradient hero | a palette derived from the mark |
| Centred hero → 3 feature cards → CTA, by default | a shell chosen deliberately from the five |
| `lerp()` on anything physical | springs — mass, damping, overshoot |
| Symmetry everywhere | deliberate asymmetry where the eye should land |

**The material declaration is the highest-leverage line in any brief.** "Glass where there's
glass, flat where there isn't" is not decoration — it decides depth, contrast, layering, and
whether the thing reads as built or generated. Declare it once and hold it, and the output stops
looking like a component gallery.

---

## Shells — pick one, deliberately

Layout is chosen, not defaulted. Five, and every surface picks exactly one:

| Shell | Trait | Suits |
|---|---|---|
| `nav-rail` | persistent left rail, grouped sections | multi-section apps |
| `centered` | no rail, sticky topbar, capped content width | single-task tools |
| `canvas` | topbar + collapsible panel, content takes the rest | editors |
| `bench` | tab-driven, config collapses on run, results are the hero | comparison / test tools |
| `overlay` | floating widget that rides a host surface | assistants, companions |
| `scroll-scene` | one WebGL canvas, scroll-driven beats | narrative marketing pages |

A product does not get a sixth shell because its content feels special. Content adapts to a shell.
`scroll-scene` is the WebGL case and it has its own layer in `04-webgl/`.

---

## Marks — placement, not selection

The pack is authoritative. The system chooses **which variant goes where**, then holds it constant:

| Context | Variant | Why |
|---|---|---|
| Login, gate, hero, empty state, walkthrough finale | expressive | the emotional beats — the mark carries feeling |
| Nav logo, topbar, favicon, tab icon | compact | survives ≤24px, repeats everywhere without shouting |
| Decoration | none | a mark with no job stays out of the frame |

Variant-by-context is a feature. One mark everywhere is a flattening, not a system.

---

## Repo map

| You want to… | Read |
|---|---|
| Run the process | `00-method/PIPELINE.md` |
| Know when a stage is actually done | `00-method/GATES.md` |
| See the failure modes, and one I got wrong | `00-method/DRIFT-LOG.md` |
| Write an image prompt | `01-prompt/FORMULA.md` + `BLOCKS.md` |
| Wire the code | `02-tokens/` |
| Source marks, type, imagery, icons | `03-assets/` |
| Build a scroll-driven WebGL scene | `04-webgl/` |
| Hand it to an agent / OpenDesign fork | `05-agent/SKILL.md` |

`00-method/DRIFT-LOG.md` is the worked example: real failures from a real eight-product run,
including one finding I got wrong and retracted. It is kept with the mistake visible on purpose —
a drift log that only contains other people's errors is marketing.

---

*The steps are boring by design. The result is not, because the seed is yours.*

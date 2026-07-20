# THE METHOD

**A portable design system for agent-built interfaces and scroll-driven WebGL scenes.**

Fixed procedure. Externally-sourced identity. Same steps every time, a different result every time.

> It is a **framework that produces design systems**, not *a* design system — the step-by-step "how we
> do it every time" that yields a different system per seed. That is why the science
> (`00-method/TRANSFER-TESTS.md`) grades the framework's *transfer*, not one output's polish.

---

## The problem it solves

You ask an AI for a website. It gives you a good one. So does everyone else's AI, to everyone
else. Within a year the whole web is one website with different logos on it.

That is not a taste problem. It has one cause: **the model was allowed to choose the identity
layer.** When nobody supplies the mark, the palette, the type, the material, the copy or the
motion, the model supplies its own median — which is also everyone else's median.

This system inverts it. The procedure never varies. The **seed** always does.

```
    SEED (yours, external, unique)        PROCEDURE (fixed, gated, shared)
    ─────────────────────────────        ───────────────────────────────
    mark pack, 4 tiers                        intake → capture → brief
    palette derived from the mark             audit → delta → prompt
    licensed type, 3 roles          ───▶      generate → inspect → retake
    material declaration                      codify → verify-by-build → hand off
    real copy, captured                                   │
    shell (1 of 6)                                        ▼
    motion character                          OUTPUT — unique, because
                                              the seed was unique
```

Run it for a mountain-climbing bear ecosystem, you get that. Run it for a Hello Kitty WebGL
scroll page, you get that — recognisably Hello Kitty, not Hello Kitty wearing the AI house style.

**If two runs look alike, the seeds were alike. Check the seed, never the procedure.**

---

## Start here

| Read | For |
|---|---|
| **`SYSTEM.md`** | the three laws and the anti-default doctrine — **read first** |
| `00-method/MODES.md` | the two ways in — **recreate** an existing product, or build **fresh** from intent |
| `00-method/INTAKE.md` | how a project starts: capture, folder layout, the drop convention |
| `00-method/PIPELINE.md` | the eleven stages, in order |
| `00-method/GATES.md` | the evidence contract — what proves a stage happened |
| `00-method/VERIFY-BY-BUILD.md` | Stage 8b — build the code, render it, prove it *is* the mock |
| `00-method/DRIFT-LOG.md` | real failures from a real run, including one I got wrong |
| `01-prompt/FORMULA.md` | the nine-slot prompt grammar |
| `01-prompt/BLOCKS.md` | the paste-verbatim library — the anti-drift mechanism |
| `03-assets/IMAGERY.md` | **image generation is the foundation** — the picture leads, the code follows |
| `03-assets/MARKS.md` | variant placement — the thing every agent gets wrong |
| `04-webgl/SCENE.md` | WebGL as a design-system layer: beats, springs, tokens |
| `04-webgl/STYLES.md` | the **scroll-style library** — pick an archetype, don't ship the same one twice |
| `04-webgl/TRANSITIONS.md` | the movement *between* the shots, and the mobile path |
| `03-assets/ICONS.md` | icons & elements sourced, not defaulted — the Adobe premium path |
| `05-agent/SKILL.md` | drop-in agent instructions (incl. the vision-model prerequisite) |
| `06-reference/README.md` | the **beginning bibles** — the field's vocabulary, sites, techniques, flow, stack |
| `00-method/TRANSFER-TESTS.md` | the science — the blind-agent reskin-transfer battery (graded at the floor model) |

---

## The five things that make it work

**1 · The agent never chooses the identity layer.** Mark, palette, type, copy, icons, material are
supplied. Missing one → it stops and asks. A blank the agent fills is a place the brand stopped
existing.

**2 · Nothing advances without evidence.** Each gate either produced its artefact or did not.
`✅ approved` is free to write and routinely describes files nobody opened; an approval must name
three specifics observed in that exact frame.

**3 · Correct in place; delete, don't annotate.** A gap found is fixed in the file, not reported.
Content nobody should build is removed — a file that says *"don't build this"* outlives the person
who wrote the warning.

**4 · Variation across contexts is the system.** A hero mark on the welcome screen, an alternate
on login, a compact in the nav, a micro in the chat bubble. Agents read this as inconsistency and
flatten it. Flattening it is what a copy-paste job looks like.

**5 · Done is a full row.** Screens · brand pack · walkthrough · mobile · tokens · components ·
JS · motion · decisions. Motion and decisions get abandoned most, and they are the two that carry
the work forward.

---

## What is here that is not elsewhere

Design-system formats stop at HTML and CSS. Tokens describe colour, type, spacing, radius — then
the moment a scene has a camera, a light rig and a scroll timeline, the format has nothing to say
and the agent falls back on its median. Which is why AI-built three.js pages all feel the same:
same scrub, same fade, same weightless drift.

`04-webgl/` gives the scene the same treatment CSS gets — declared tokens, a beat schema, a motion
spec, and gates. Springs instead of lerps. One continuous world instead of swapped scenes. A
storyboard for every transition, not just every beat. A composed static sequence for mobile
instead of a throttled canvas.

That layer is the reason this exists as a fork rather than a config file.

---

## Using it in an OpenDesign fork

```
your-fork/
  skills/the-method/          ← 05-agent/SKILL.md + this repo
  design/
    DESIGN.md                 ← the seed for this project (see below)
    <project>-ux-pack/        ← captured reality (00-method/INTAKE.md)
    _DESIGN/                  ← proposals, per surface
```

`SKILL.md` loads as the agent's operating instructions. `DESIGN.md` carries the seed — the six
sourced layers plus the shell and motion character. The gates run as checks between stages.

The agent reads the skill for *how*, `DESIGN.md` for *what makes this one different*, and the
ux-pack for *what is actually true*.

---

## Status

| Layer | File | State |
|---|---|---|
| Laws + anti-default doctrine | `SYSTEM.md` | ✅ |
| The two entry modes (recreate / fresh) | `00-method/MODES.md` | ✅ |
| How a project starts | `00-method/INTAKE.md` | ✅ |
| The eleven stages | `00-method/PIPELINE.md` | ✅ |
| The evidence contract | `00-method/GATES.md` | ✅ |
| Verify-by-build (Stage 8b recipe) | `00-method/VERIFY-BY-BUILD.md` | ✅ |
| Worked failures, incl. one retraction | `00-method/DRIFT-LOG.md` | ✅ |
| Nine-slot prompt grammar | `01-prompt/FORMULA.md` | ✅ |
| Paste-verbatim library | `01-prompt/BLOCKS.md` | ✅ |
| Shared tokens + accent contract | `02-tokens/core.css` | ✅ |
| Type sourcing and role assignment | `03-assets/FONTS.md` | ✅ |
| Picture sourcing and licensing | `03-assets/IMAGERY.md` | ✅ |
| Mark variant placement | `03-assets/MARKS.md` | ✅ |
| WebGL as a system layer | `04-webgl/SCENE.md` | ✅ |
| The scroll-style library (archetypes) | `04-webgl/STYLES.md` | 🟡 2 of ≥4 taught |
| Motion between the shots | `04-webgl/TRANSITIONS.md` | ✅ |
| Beat schema | `04-webgl/beats.schema.json` | ✅ |
| Icons & elements sourcing (Adobe path) | `03-assets/ICONS.md` | ✅ |
| Agent operating instructions | `05-agent/SKILL.md` | ✅ |
| Seed template | `05-agent/DESIGN.md` | ✅ |
| Reference — vocabulary | `06-reference/GLOSSARY.md` | ✅ |
| Reference — ten sites decomposed | `06-reference/REFERENCE-SITES.md` | ✅ |
| Reference — archetype menu (candidates) | `06-reference/ARCHETYPES.md` | ✅ |
| Reference — technique catalog | `06-reference/TECHNIQUES.md` | ✅ |
| Reference — build flow → our stages | `06-reference/BUILD-FLOW.md` | ✅ |
| Reference — 2026 stack defaults | `06-reference/STACK.md` | ✅ |
| Reference — engineering sourced (repos/papers/code) | `06-reference/SOURCES.md` | ✅ |
| Reference — sourced-vs-gaps escalation list | `06-reference/GAPS.md` | ✅ |
| Reference — corpus index + framing | `06-reference/README.md` | ✅ |
| The science — transfer-test battery | `00-method/TRANSFER-TESTS.md` | ✅ spec (runs in Phase 0) |

**Open:** `04-webgl/STYLES.md` slots 3 & 4 (two more scroll-styles, awaiting owner teaching — the
`06-reference/ARCHETYPES.md` menu is what the owner teaches *from*; **rooms/alcoves** is the strongest
candidate) · `02-tokens/products.css` (per-project, generated from `DESIGN.md`) · `PLACEMENT-LOG.md`
(starts empty; fills as placement corrections land).

---

*The steps are boring by design. The result is not, because the seed is yours.*

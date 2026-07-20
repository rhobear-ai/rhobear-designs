# TRANSFER-TESTS — does the framework carry the procedure across a seed swap?

This is the science. Not the product's test suite — the **experiment that decides whether the framework
is real.** It is specified here and *run* in Phase 0 of the product plan (`~/.claude/plans/
i-changed-you-to-deep-sparrow.md`). No product code runs it yet; this file is the design of the
experiment.

---

## What this test measures — and what it does not

The owner set the frame precisely, and it is the opposite of the obvious test:

> **We are not measuring whether an agent can copy a site.** Copying only measures *that agent's*
> ceiling — "we're only going to see what they can already do; we wouldn't be building this if they
> could just do that." We are measuring whether **the framework transfers**: did we extract the
> procedure well enough that a *cold agent*, holding only the framework, reproduces the *kind of thing*
> with a *different subject*?

So the subject under test is **the framework**. The agent is the **instrument** that reads it. A failure
is a failure of *our extraction* — the framework under-taught — not a verdict on the model. When the test
fails, we **fix the framework, not the product, and not the agent.**

---

## The floor-model principle — the framework is graded at the bottom

> **The target model is the working-class model — Sonnet 5 (or whatever Anthropic's current cheapest
> capable vision model is). The framework's grade is the score the *floor* model produces, not the
> ceiling.**

The reasoning is the whole thesis restated as a testing rule:

- **Users bring their own key and reach for the cheapest model.** If the framework only produces premium
  results on Opus, it is not a framework — it is a prompt that happens to work on a smart model. The
  procedure is not carrying the quality; the model is.
- **A framework that makes the *floor* model produce good results is the mark of a real framework.** That
  is the point of sourced identity + gates + a taught procedure: the quality lives in the inputs and the
  steps, so a modest model executing them lands a good result. The owner's instinct is exactly right —
  *"if we have a good enough framework, Sonnet 5 should reproduce results."* If it can't, the framework is
  leaning on model IQ we told ourselves we'd designed out.
- **Sonnet 5 is also the right test instrument on the merits:** one of the cheapest capable **vision**
  models, and vision is a hard prerequisite of this method (the inspect gate, verify-by-build, reading
  the mock — `05-agent/SKILL.md`). So Sonnet 5 is both the subject we grade and the eyes that grade.

**The grading rule:** a transfer test **passes** when the **floor model (Sonnet 5)** clears it. Opus is
run as the **ceiling** — it shows the best the framework can do and isolates whether a floor-model miss is
a framework gap (Opus misses too → the framework under-teaches) or a capability gap (Opus clears, floor
misses → the framework leans on model strength and needs more scaffolding). **We ship the framework when
the floor passes, not when the ceiling does.**

---

## The instrument — a blind agent

The agent is handed the framework the way any user's agent finds it in the harness, and given a plausible
**client brief**. Crucially:

- **Not primed by us.** It is not told this is a test, not told what "good" looks like, not fed the
  answer. Priming would measure our prompting, not the framework's transfer.
- **Holding only the framework + the brief.** The framework is `05-agent/SKILL.md` + this repository. The
  brief is a normal client request. Nothing else.
- **Code-unseen.** It never sees the reference site's source. The reference is the *style the client
  wants kept*, not an input to reproduce. (The human running the test uses the reference site as the
  acceptance yardstick — the agent does not.)

---

## The protocol — the reskin transfer

The reskin is one of the two modes in `00-method/MODES.md` (the other is build-fresh). The owner's live
example is a reskin, so the battery leads with it.

```
1  Pick a reference site as the thing being reskinned.
     e.g. Oryzo — cork coaster, on a workbench, depth-scroll, comes to rest.

2  Write it as an ordinary client brief that KEEPS the procedure and SWAPS the seed:
     "This is my site. Redo it — same style of site, but instead of a cork make it a toy
      car; instead of a workbench, a toy track; and I want it to roll through."

3  Hand a blind agent ONLY the framework + the brief. Code-unseen.

4  The agent runs the framework's own pipeline (G0 capture/intent → … → G8b verify-by-build)
     and produces an output.

5  Score it (below). Run it on the FLOOR model first — that score is the framework's grade.
```

**Pass:** the agent slides into the harness and produces the reskin — the **same archetype and
procedure** (depth-scroll product-in-void, inertia, camera on Z, rest → *roll*), the **new seed
executed** (toy car, toy track), the page reading as **intentional and correct** — and it does this on
the **floor model**. That proves the framework carried the procedure across the seed swap.

**Fail:** the agent can't reproduce the procedure from the framework alone — it defaults to a median
layout, drops the archetype's signature (lerps the camera, loses the inertia), or invents identity the
brief didn't supply. → the framework under-teaches → **fix the framework.**

---

## Two axes on top of the reskin

### Divergence — the same procedure must make *different* things

Take one reference archetype and run it with **several opposed seeds** — including the three standing
opposed seeds (`kawaii-paper` / `brutalist-industrial` / `organic-editorial`) and simple swaps (toy car /
perfume bottle / river stone). **Pass:** the outputs share the archetype's *signature* but no *visual DNA*
— none collapses onto a house median. **Fail:** they converge → the framework under-constrains the seed's
expression → the fix is upstream (thin pack, underived palette, absent motion spec — LAW 3), never "let
the agent be more creative."

### Portability — the model ladder

Run the same protocol across a ladder, graded at the floor:

| Rung | Model | Role |
|---|---|---|
| **Floor** | **Sonnet 5** (working-class Anthropic) | **the grade** — pass here or the framework fails |
| Ceiling | Opus | the best the framework can do; isolates framework-gap vs capability-gap |
| Cross-vendor | one Gemini | portability across a vendor (structure must hold; quality may vary) |
| Open | one open model (via OpenRouter BYOK) | portability to a BYOK open weight |

**Structure must hold across all rungs; quality may vary.** If structure only holds on the ceiling, the
framework is not portable — it is an Opus prompt.

---

## The scoring instrument

Three components, combined into one score card per output:

**1 · Drift taxonomy** — the existing `00-method/DRIFT-LOG.md` rubric (D-01…D-24) applied as a
checklist: invented strings, instruction leakage (D-04), placeholder literals (D-05), accent-scope leak
(D-07–D-10), mark misplacement, wrong aspect = wrong shell (D-24), and the rest. Each drift class is a
point off. It is already a scoring instrument — this reuses it.

**2 · Per-archetype signature checklist** — does the reskin still exhibit the archetype's *defining
technique*? Authored per archetype (`06-reference/ARCHETYPES.md`). Examples:

```
Product-in-the-void depth-scroll (Oryzo-class):
  [ ] camera travels on Z (depth), not down a 2D page
  [ ] springs/inertia on camera and on the object's settle — grep shows zero lerp on camera
  [ ] one hero object in a near-empty space (not a card grid)
  [ ] the new seed is executed as the subject (toy car), not decorated onto the old one
  [ ] the verb swap landed (rest → roll) as real motion, not a relabel

Terrain flythrough (Primland-class):
  [ ] camera glides through a static world; world does not teleport between beats
  [ ] one continuous atmosphere (fog/sky/sun on one progress float), blended monotonically
  [ ] a single peak beat exists
  [ ] mobile is a composed static 9:16 sequence, not a throttled canvas

Rooms / alcoves (Cartier-class):
  [ ] discrete self-contained scenes, one per subject
  [ ] Lenis-driven transport; snap locks a room
  [ ] each room's material is fully set before it is revealed
  [ ] transition on entering/leaving a room declares ONE mechanic from the kit
```

**3 · Transfer score** — did the agent execute the *procedure* or shortcut to a median? Evidence, not
vibes:

```
[ ] capture/intent artefact exists (G0)                — did it start from reality/intent?
[ ] six-line brief written from the brief, accent named (G1)
[ ] audit quotes real controls / names the fight (G2)
[ ] token delta locked before pixels; accent + shell only (G3)
[ ] prompt assembled from blocks; zero placeholder strings (G4)
[ ] every frame inspected; approvals name ≥3 observed specifics (G6)
[ ] verify-by-build screenshot sits beside the mock (G8b)
```

An output that looks fine but skipped the procedure **fails the transfer score even if it passes the eye**
— because a good result that skipped the steps is luck, and luck does not transfer to the next seed. This
is the component that most directly measures *the framework*.

---

## The test cards (Phase 0 authors the full set)

Each card = a reference target + a rebrief swap + the archetype's signature checklist + the model ladder.
The starting set:

| Card | Reference (kept style) | Rebrief (swapped seed) | Archetype grade |
|---|---|---|---|
| TC-1 | Oryzo — cork on a workbench, depth-scroll, rests | **toy car on a toy track, rolls through** | Product-in-the-void |
| TC-2 | Oryzo — *(divergence pair)* | **perfume bottle on marble, settles** | Product-in-the-void |
| TC-3 | Primland — terrain flythrough, fog | **a reef, a diver glides through, light-shafts** | Terrain flythrough |
| TC-4 | Cartier — six alcoves | **four rooms, one per product in a small SaaS** | Rooms / alcoves |

TC-1 and TC-2 together are the divergence proof for one archetype (same procedure, opposed seeds). Every
card is run floor-first (Sonnet 5 = the grade), then up the ladder.

---

## Pass condition for the phase

> **Phase 0 passes when the floor model (Sonnet 5), blind, holding only the framework, produces reskins
> that keep each archetype's signature and diverge across opposed seeds — all clearing the drift taxonomy
> and the transfer score. If the floor model can't, the framework under-teaches, and the fix is in the
> framework — never in the agent, never in the product.**

That is the mark the owner named: a framework good enough that the working-class model reproduces the
result. Prove it at the floor and the ceiling takes care of itself.

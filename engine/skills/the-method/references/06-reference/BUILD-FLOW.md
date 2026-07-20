# BUILD-FLOW — how the field organises the work, mapped to our stages

The owner's directive included *"do the research on any projects in engineering that list out how they
organize the flow, the steps."* This file is that research, distilled into the three organising
structures the creative-WebGL field actually uses — and then mapped onto **our** pipeline (`00-method/
PIPELINE.md`, stages G0–G9 + G8b). The point of the mapping is validation, not reinvention: the field's
own practice lands on our stages. Where it lands somewhere we don't have, that's a gap to close; where
it agrees, that's confidence the method is real.

Three structures, because they answer three different questions:

1. **The learning/build ladder** — in what *dependency order* is a scene actually built?
2. **The case-study anatomy** — how is a finished build *documented and reasoned about*?
3. **The studio production flow** — how does a real project *get made*, start to ship?

---

## 1 · The learning/build ladder — Three.js Journey

**Source.** *Three.js Journey* by **Bruno Simon** — the field's canonical course, ~91 hours, 30+
lessons, cited everywhere as the way people actually learn this. Its chapter order is not arbitrary; it
is the **dependency order** of building a scene, which is why it doubles as a build ladder.

```
scene → primitives → debug → materials → textures → animation →
shaders → particles → physics → optimisation → Blender / baked scenes → deploy
```

Each rung depends on the one before: you cannot debug a scene you have not created, cannot shade
geometry you have not added, cannot optimise a scene that does not yet run. Two things this ladder
tells us that matter to the method:

- **Optimisation is a late, explicit stage — not a mood.** It comes after the scene works, on purpose.
  This is why our mobile static path and framerate gates live at the *end* of `TRANSITIONS.md`, not
  sprinkled through.
- **Baked scenes** (lighting/detail pre-computed in Blender and baked to textures) are the field's
  standard performance move for a fixed camera path — directly relevant to a camera-journey, where the
  path is known in advance and the lighting can be baked rather than computed live.

**Where it maps:** the ladder is the *inside* of our **G8 CODIFY** stage — the order in which the scene
code itself gets built once the pictures are approved. It is not the whole method (it has no capture, no
brief, no inspect-gate); it is the engineering sub-sequence our G8 wraps.

---

## 2 · The case-study anatomy — Codrops

**Source.** **Codrops** (`tympanus.net/codrops`) — the field's technical journal. Its build write-ups
(the Monolith article is the exemplar: "Building The Monolith: Composable Rendering Systems for a
13-Scene WebGL Epic", Ethan Chiu, Nov 2025) follow a consistent shape:

```
concept & art-direction
  → system decomposition (rendering pipeline · materials · particles · transitions)
    → per-system decisions & trade-offs
      → optimisations left on the table (honest)
        → recognition / results
```

This is the **research-paper shape**, and it matches our own `document-methods-as-research-papers`
standard: a build is not just made, it is *decomposed into named systems, each with its decision and
its trade-off*. The Monolith write-up naming "the LUT we could have used to shrink the G-Buffer" is the
tell — a real engineering account states the optimisation it *didn't* take, not just the ones it did.

**Two things we adopt from this shape:**

- **Every run this framework does should be write-up-able in this anatomy.** If a build cannot be
  decomposed into named systems each with a stated decision, the build was improvised — the same way a
  scene with no storyboard was improvised. The decision log at **G8 CODIFY** (*decision — why*) is the
  seed of this; a full run should produce the whole anatomy.
- **The decomposition axis is `render · materials · particles · transitions`** — which is exactly the
  spine of `TECHNIQUES.md`. The field decomposes a scene the same way our catalog does. That agreement
  is not a coincidence; it is the confirmation that the catalog carved the scene at its real joints.

**Where it maps:** this is the shape of our **G9 HAND OFF** manifest for a scroll-scene — not just "what
exists," but the system decomposition and the decisions behind each, in the Codrops anatomy.

---

## 3 · The studio production flow

**Source.** The observable working order across the studio builds in `REFERENCE-SITES.md` (Lusion,
Utsubo, Immersive Garden, Unseen). Reconstructed as a production sequence:

```
art direction / mood        establish the look before any geometry
  → storyboard beats         the shots, as pictures
    → grey-box scene         blocked geometry, real camera path, no finish
      → asset generation     the real subjects/materials/plates (image-first)
        → material / shader pass
          → motion pass       wire scroll → camera springs → beats
            → transition pass  the movement between shots — its own pass
              → optimisation & mobile fallback
                → polish
```

**The one thing the field does that we must never lose:** the **transition pass is its own stage.**
Monolith's entire transition system — six mechanics, storyboarded — is separate work, not a side effect
of placing beats. This is exactly the discipline `04-webgl/TRANSITIONS.md` enforces with *"storyboard
the transitions, not just the beats."* The field's biggest builds treat the in-between as first-class;
our method gates it (T0, T7). Losing it is the "slideshow with a 3D background" failure.

**Grey-boxing** — blocking the scene with placeholder geometry and the real camera path *before* the
finished assets exist — is the field's way of proving the *motion* works before spending on the *look*.
It is the spatial equivalent of our image-first rule: the structure is validated cheap, before the
expensive finish.

**Where it maps:** the studio flow spans the whole pipeline — its front (art direction, storyboard) is
our **G1–G4** (brief → prompt), its middle (assets, material, motion, transition) is **G5–G8**
(generate → codify), its back (optimisation, mobile, polish) is the tail of **G8/G8b** and the mobile
gate.

---

## The mapping — the field's flow lands on our stages

| Field stage | Our stage(s) | Note |
|---|---|---|
| Art direction / mood | G1 BRIEF, G3 DELTA | the look is declared (material, accent, motion character) before pixels |
| Storyboard beats | G4 PROMPT, G5 GENERATE | beats are *pictures first* — `beats.json` + generated stills |
| Grey-box scene | *(within G8 CODIFY)* | block motion before finish — image-first's spatial twin |
| Asset generation | G5 GENERATE | image-first; the picture leads (`03-assets/IMAGERY.md`) |
| Material / shader pass | G8 CODIFY | the Journey ladder runs *inside* here |
| Motion pass | G8 CODIFY (motion) | springs, beats, `rhobear:beat` events |
| **Transition pass** | **G8 CODIFY + T0/T7 gates** | **its own pass — the discipline we must not lose** |
| Optimisation & mobile | G8b VERIFY + mobile gate (T6) | late and explicit, per the ladder |
| Polish | G8b VERIFY | verify-by-build, corrected in place |
| *(write-up / decomposition)* | G9 HAND OFF | in the Codrops anatomy: named systems + decisions |

**What the field does NOT have that we do:** a **capture stage (G0)** and an **inspect gate with
evidence (G6)**. Studios carry reality and taste in a human's head; the method externalises both —
capture so the agent designs for a product that exists, and the ≥3-observed-specifics inspect gate so
`✅ approved` can't forge a look. That is the difference between a studio's process and a *portable*
one: the method writes down the two things a studio never has to.

---

## The one-line takeaway

The field builds in dependency order (Journey), documents by system decomposition (Codrops), and
produces with the transition as its own pass (studios). Our pipeline already encodes all three — plus
the capture and evidence stages a studio keeps in a person's head. **The build-flow research does not
change the method; it confirms the method carves the work where the field carves it, and shows exactly
which of our stages each field practice lives in.**

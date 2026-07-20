# SCROLL STYLES — the archetype library

`SCENE.md` and `TRANSITIONS.md` teach *how* a scroll-scene is built — beats, springs, one
continuous world. They describe **one** archetype: a camera travelling through a fixed world (the
bear down the mountain). That is the only live scene this system has ever produced, and that is a
problem, because a design engine that only knows one kind of scroll page will ship one kind of
scroll page forever. Every client's homepage would be the same camera move with a different subject.

> **A scroll-scene has a *style* — the archetype of what moves and why — chosen deliberately from a
> library, the same way a surface picks a shell. Never defaulted, never repeated back-to-back for
> the same client.**

The mechanics (image-first, springs, continuous progress, verify-by-build) are shared across every
style. The **style** is which of those mechanics carries the story: does the *camera* travel, or
does the *subject* assemble? That single choice is the difference between two homepages that use
the identical engine and feel like different companies.

This file is the library. It grows by the owner teaching a style and it being encoded here as a
recreatable procedure — not by an agent inventing one. **An un-taught style does not go in this
file.** Two slots below are marked `OPEN` on purpose; they are placeholders for teaching, not
licence to fill them from a model's median.

---

## Why the library exists at all

OpenDesign — and any competent model — already knows the *mechanics* of scroll animation. Anyone
can wire GSAP ScrollTrigger to a timeline. That is not the product.

> **What makes ours better: the site is intentional. It feels real. It feels like it belongs to
> *that* person — not to anyone who has ever used this program.**

A generic scroll page is a mechanic with no meaning: parallax because parallax is what you do.
A style in this library is a mechanic **bound to a reveal** — the motion resolves into what the
brand *is*. The ice cubes don't just fall; they refine until you understand it's an ice company.
That binding is the intentionality, and it is why the styles are taught by the person whose taste
they encode, not defaulted by the tool.

---

## Choosing a style — a brief-stage decision

When a surface's shell is `scroll-scene` (see `SYSTEM.md` § Shells), the brief makes a **second**
choice: which scroll-style from this library. It is declared next to the motion character, in
`DESIGN.md`, before a single frame is generated.

Rules on the choice:

- **Pick one deliberately.** The default — camera drifting through a world — is a choice too, and
  choosing it because it's the only one you know is exactly the failure this file exists to stop.
- **Never ship the same style twice in a row for one client.** Homepage is a camera-journey → the
  product landing pages are not all camera-journeys. Variety across a client's surfaces is what
  makes the *ecosystem* read as designed rather than templated.
- **The style is part of the seed's expression, not the seed itself.** Two brands can use
  `falling-into-place` and look nothing alike, because the frames, palette, subject and copy are
  theirs. The style is the *grammar*; the seed is the *content*.

---

## The library

| Slot | Style | What moves | Documented |
|---|---|---|---|
| 1 | **camera-journey** | the world holds still; the **camera** travels through it | `SCENE.md` + `TRANSITIONS.md` |
| 2 | **falling-into-place** | the camera can hold; the **subject** assembles / settles / resolves | this file, below |
| 3 | `OPEN` | *awaiting owner teaching — one of the "easy" two* | — |
| 4 | `OPEN` | *awaiting owner teaching — one of the "easy" two* | — |

Slots 3 and 4 stay empty until taught. When a style is taught it gets its own section here with the
same shape as `falling-into-place`: the one idea, the sub-flavors, the shared spine, the generation
order, and the gates.

> **The graduation menu lives in `06-reference/`.** The reference corpus (`ARCHETYPES.md`, decomposed
> from ten real sites; `SOURCES.md`, the engineering behind them) is where a style graduates *from*.
> The owner set the rule this session: he taught the *method* and two motion styles; the rest of the
> engineering is **researched and sourced**, not hand-taught. So an archetype enters *this* file when
> its techniques are **sourced in `SOURCES.md`** (a real repo/paper/code) **or** the owner teaches it —
> **never** from a model's median. The corpus does not auto-fill slots 3 and 4; graduating a style is a
> deliberate act (source it → write the gated procedure here). The strongest candidate today is
> **rooms / alcoves** (Cartier-class) — Lenis-driven, fully sourced — because it is what our own
> ecosystem homepage already is.

---

## Style 2 — falling into place

> **A subject is generated as a sequence of near-identical frames that start scattered, rough, or
> clustered, and — as the user scrolls — assemble, settle, and resolve into one finished,
> high-fidelity form. The finished form is the reveal: you do not fully understand what the brand
> *is* until the pieces land.**

This is the purest image-first style in the system. The scene is not modelled — it is a **frame
sequence generated first** (Nano Banana), then scrubbed by `scrollProgress`. The picture leads
completely; the code only advances the frame and adds the physics of the settle. If you can't
generate the frames, there is no scene — which is why this style, like the whole method, requires a
model that can see (`05-agent/SKILL.md` § vision prerequisite).

### The three sub-flavors

Three shapes of the same idea. The brief names which one.

**a · flow-settle** — a substance or object travels a continuous physical journey down the page
under gravity or flow, and comes to rest.

> Honey drips from a high angle at the hero. As you scroll, the drip runs *down the page*, lands on
> a honeycomb; the comb settles gently onto a countertop; keep scrolling to the nav/footer and the
> honey runs off the table and off the comb, the comb finally out of frame.

The subject enters at the top, arrives and rests through the middle, and exits at the footer. The
page *is* the fall.

**b · sort-snap** — scattered primitives fall and click into their correct places, like a child's
shape-sorter finding the right hole.

> A field of stars, circles and squares at the top of the page. As it scrolls they fall and snap
> into their slots — some jangle on landing, some overshoot and settle, some drop past and keep
> going. The payoff is the *click into place*.

Playful physics is the whole feeling here. The overshoot, the jangle, the one piece that falls
past — those imperfections are the life of it. Perfectly-placed pieces read as a loading bar.

**c · refine-reveal** — a cluster breaks apart and, as each unit separates, it becomes *more*
resolved — and the resolved result reveals what the brand is.

> An ice tray. A frame of it. A frame of it breaking. A frame of it falling. As each cube separates
> from the cluster it becomes more HD, more refined — until, all of a sudden, it reads as an ice
> company that makes ice for commercial ice trucks.

The reveal is **semantic**: the low-detail cluster could be anything; the refined result is
unmistakably the brand. The information arrives with the resolution.

### The shared spine

Every sub-flavor is built the same way:

1. **Near-identical frames, small deltas.** The subject is one thing photographed/generated across
   a short journey — 8–20 frames, each a small step from the last. Generated **before any code**.
2. **Scatter/rough at scroll 0 → resolved/placed at scroll 1.** The state at the bottom of the page
   is the brand statement. Design that frame first; the sequence is the path to it.
3. **The settle is physical — springs, not lerp.** Jangle, overshoot, come-to-rest. A piece that
   arrives exactly on schedule with no overshoot has no weight and kills the effect. This is the
   same motion law as `SCENE.md`; here it drives the *pieces*, not the camera.
4. **The reveal is earned at the bottom.** The meaning lands when the last piece settles. Don't
   spend the payoff early — a brand that's obvious at the hero has nothing for the scroll to do.

### How it differs from camera-journey

| | camera-journey (mountain) | falling-into-place |
|---|---|---|
| What moves | the camera, through a static world | the subject, frame to frame |
| Built from | a modelled 3D scene | a generated frame sequence, scrubbed |
| Camera | travels; springs on position/FOV | can hold still; springs on the *pieces* |
| The reveal | arriving somewhere | something resolving into what it is |
| Failure mode | slideshow (world static between beats) | loading-bar (pieces snap with no physics) |

Same engine, same laws. Different thing carrying the story.

### Generation order (image-first, literally)

```
1  intent + subject     "what resolves, and into what brand statement"
2  the FINAL frame       generate the resolved end state first — it's the spec
3  the scatter frame     generate scroll-0: the same subject, unresolved
4  the between frames     8–20 steps from scatter → resolved, near-identical
5  inspect the sequence   flip through as a contact sheet; does it read as one motion?
6  codify                 scrub frames on scrollProgress + springs on the settle
7  verify by build        build a small index, scroll it, does it settle like the frames?
```

Stage 2 is the one people skip: **generate the end first.** The resolved frame is the acceptance
test for the whole sequence, the same way an approved mock is the spec for code.

### Gates

```
F0  end-state     the resolved final frame is generated and approved — it is the reveal
F1  sequence      8–20 near-identical frames, scatter → resolved, as ONE readable motion
F2  physics       the settle uses springs (jangle/overshoot/rest); zero lerp on a piece's arrival
F3  reveal        the brand meaning lands at scroll ≈ 1, not at the hero
F4  build         a scrolled index reproduces the settle; checked frame-against-build, one direction
F5  mobile        a composed static sequence exists (same law as TRANSITIONS.md § mobile)
```

---

## Anti-defaults — style edition

| Banned | Because |
|---|---|
| Reaching for camera-journey by default | it's the only one most models know; that's the whole problem |
| The same style on every surface of one client | templated ecosystem; kills the "intentional" claim |
| A mechanic with no reveal bound to it | parallax-because-parallax; motion that means nothing |
| Filling an `OPEN` slot from a model's guess | an un-taught style is not in the library; ask, don't invent |
| Pieces that snap with no overshoot/jangle | reads as a loading bar, not a settle |
| Spending the reveal at the hero | the scroll has nothing left to earn |

---

*The library is small on purpose and grows only by teaching. A style in here is a mechanic bound to
a reveal, encoded so the next agent reproduces the owner's taste instead of the model's median —
which is the entire reason this system exists.*

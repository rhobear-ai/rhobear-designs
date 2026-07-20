# ARCHETYPES — the interaction menu (candidates, not taught styles)

Eight interaction archetypes, distilled from the ten reference sites. An archetype is **what moves and
why** — the shape of the experience, one level above the technique that implements it. A brief for a
`scroll-scene` (or an interactive marketing surface) names one from this menu.

Read the boundary first, because it is the whole reason this file is separate from `STYLES.md`:

> **This is a MENU, not the LIBRARY.** `04-webgl/STYLES.md` is the buildable library — gated,
> recreatable procedures. This file is the field's observed vocabulary: what exists out there, named
> and decomposed, so there is something to graduate *from* and the transfer tests have targets to aim
> *at*. An archetype graduates into the library when it is **backed by real, sourced engineering**
> (`06-reference/SOURCES.md`) **or** taught by the owner — never by an agent filling in its median.

**How an archetype graduates (the rule the owner set this session).** The owner taught the *method* (the
gates, the taste, the image-first trick) and two *motion styles* (camera-journey, falling-into-place). He
does **not** hand-teach every archetype. Instead: **the engineering is researched and sourced** — an
open-source repo, a canonical paper, a code tutorial — and a style graduates once its archetype's
techniques are all in `SOURCES.md` (or owner-taught). The guard against the median is unchanged, just
moved: **nothing ships without a real source or a taught procedure behind it.** A guess is still banned;
a *sourced* build is exactly the point. The owner is the escalation path only for **gaps** — techniques
whose "how" isn't publicly findable (`06-reference/GAPS.md`), which today is effectively none.

Why the guard still holds: LAW 3 says *vary the seed, never the procedure*. Sourced engineering keeps the
*procedure* real and reproducible; the seed still carries all the variance. What we refuse is a procedure
invented from a model's training median — because that is the sameness the framework exists to kill.

Each entry: **signature · required techniques · mobile fallback · gate deltas · exemplar · graduation.**

---

## 1 · Product-in-the-void depth-scroll

**Signature.** One hero object in a near-empty space. Scroll drives the camera through **depth (Z)**,
not down a page. Everything has mass — the object and camera *arrive* and settle, never snap.

**Required techniques.** Spring/inertia on camera Z and on the object's settle (springs, never lerp) ·
one hero material at a high finish · optional cursor-reveal to add detail on hover.

**Mobile fallback.** A composed static sequence of the object at its key depths, 9:16, scroll-snapped
(no live camera). The inertia is the desktop premium; the stills carry the product.

**Gate deltas.** Standard `T`-gates (`TRANSITIONS.md`) apply. The one that carries this archetype is
**T1 (springs on camera)** and the settle physics — a depth-scroll that lerps is the failure this
archetype most exposes.

**Exemplar.** Oryzo (Studio Lusion); Hubtown (Unseen Studio) as the B2B + cursor-reveal variant.

**TEACH-TO-GRADUATE.** The owner's "cork → toy car, workbench → toy track, rest → roll" brief is a
reskin *of this archetype*. If/when it's taught, it becomes a STYLES.md slot with its own sub-flavours,
generation order, and gates.

---

## 2 · Terrain / location flythrough  *(this is our camera-journey)*

**Signature.** A modelled world holds still; the **camera glides through it** on scroll. Atmospheric
fog and a moving sun give depth and a continuously shifting mood.

**Required techniques.** Springs on the camera path · one continuous atmosphere (fog/sky/sun/ground/
particles all on one progress float, blended monotonically) · a peak beat · subject reacts to camera
*velocity* if there is a subject.

**Mobile fallback.** The composed 9:16 sequence from `TRANSITIONS.md` — one still per beat, portrait-
framed, carrying the same cold→warm gradient the desktop scene travels.

**Gate deltas.** This archetype *is* what `04-webgl/SCENE.md` + `TRANSITIONS.md` already gate (T0–T8).
No deltas — it is the framework's home style.

**Exemplar.** Explore Primland — the public confirmation of this style. RHOBEAR's bear-down-a-mountain
is the same archetype.

**TEACH-TO-GRADUATE.** **Already taught** — it is STYLES.md slot 1 (`camera-journey`). Listed here only
so the menu is complete and the exemplar is on record.

---

## 3 · Rooms / alcoves  *(this is our nine app "beats")*

**Signature.** Not one continuous world — a set of **discrete, self-contained 3D scenes**, one per
subject. Scroll is the transport *between* rooms. Each room has its own material and lighting.

**Required techniques.** Lenis smooth-scroll as the transport signal · GSAP ScrollTrigger snap to lock
a room · per-room material/light · a transition mechanic *on entering/leaving* a room (see the
transition kit), not a continuous blend.

**Mobile fallback.** One still (or a short static loop) per room, scroll-snapped 9:16. Rooms are
naturally discrete, so the static path is a clean one-frame-per-room sequence.

**Gate deltas.** T2 (continuity) is **replaced**, not applied — the whole point is that the world is
*not* continuous between rooms. Add a room-boundary gate: every room transition declares one mechanic
from the kit, and the entering room's material is fully set before it's revealed.

**Exemplar.** Cartier Watches & Wonders (Immersive Garden) — six alcoves, Lenis-driven.

**TEACH-TO-GRADUATE.** Strong candidate: RHOBEAR's ecosystem homepage (nine products) is literally this
archetype. Not taught yet — it does not go in STYLES.md until the owner teaches the room-to-room
procedure and its gates.

---

## 4 · Cinematic multi-scene film  *(the maximal case)*

**Signature.** Many scenes (Monolith: thirteen) cut like a film, fusing illustration, 3D, sound, and
authored transitions. Composable rendering under the hood so the many scenes stay performant and
consistent.

**Required techniques.** Deferred rendering + G-Buffer (+ optional LUT) · composable materials
(shader chunks) · GPGPU ping-pong particles (with prewarming + input-coupling) · the full transition
kit · sound design. This is the archetype that needs *all* of `TECHNIQUES.md`.

**Mobile fallback.** The most expensive to fall back — a composed sequence per scene, and honest triage
about which scenes survive as stills. Do not ship a throttled thirteen-scene canvas to a phone.

**Gate deltas.** All T-gates, plus a rendering-pipeline gate (the deferred pass and the particle system
each verify-by-build on their own) and a per-scene transition gate. This archetype earns the most gates
because it has the most that can silently drift.

**Exemplar.** The Monolith Project (Ethan Chiu).

**TEACH-TO-GRADUATE.** The ceiling, not the starting point. Taught last, if ever, and only in pieces
(the particle system, the deferred pass) that graduate as their own techniques before the whole
archetype does.

---

## 5 · Editorial illustrated scroll

**Signature.** Hand-drawn 2D art direction fused with a shallow 3D stage — the illustration reads as
the surface of a dimensional world. Premium editorial feel without photoreal modelling.

**Required techniques.** 2D-illustration-over-3D compositing · parallax/depth on scroll · springs on
the depth moves · the drawn character held consistently (a marks-variant discipline in 2D).

**Mobile fallback.** Illustration is resolution-independent and portrait-friendly — a clean static
9:16 sequence of the drawn frames with CSS parallax at most.

**Gate deltas.** T1–T2 apply to the depth moves. Add an art-direction gate: the illustration is
*sourced/authored first and leads* (image-first, `03-assets/IMAGERY.md`); the 3D stage serves it, never
the reverse.

**Exemplar.** Sleep Well Creative.

**TEACH-TO-GRADUATE.** A candidate for brands whose identity is illustrative. Not taught until the owner
teaches how the 2D and 3D layers are composed and gated.

---

## 6 · Filmic release sequence

**Signature.** A long scroll where each section is a **shot** — entrance, hold, exit — rather than a
fade-in. Connective tissue (e.g. particle type-dispersal) carries the eye between sections.

**Required techniques.** Entrance/hold/exit beat grammar (this is `beats.json` + the holds table) ·
GSAP ScrollTrigger scrub + snap · a connective particle/type technique · springs on the section moves.

**Mobile fallback.** Holds go to zero on touch (per `TRANSITIONS.md`); the sequence becomes a scroll-
snapped set of section stills.

**Gate deltas.** Standard T-gates. The carrying gate is **T5 (holds)** and the beat grammar — a release
page with no hold structure is just a long fade, which is the failure this archetype avoids.

**Exemplar.** Shopify Editions.

**TEACH-TO-GRADUATE.** Close to already-covered — our beat + hold model is most of it. Would graduate as
a STYLES.md variant emphasising type-dispersal and section-as-shot, once taught.

---

## 7 · Physics-nav explorable world  *(non-scroll)*

**Signature.** Navigation *is* the interaction — you **drive/move** through a world with a real physics
engine giving momentum, collision, and weight. Content is placed as things in the world you approach.

**Required techniques.** Physics engine (Cannon.js / Rapier) for the vehicle/body and colliders ·
matcap materials for a lit look at framerate · input→drive mapping · content-as-worldobjects.

**Mobile fallback.** This archetype resists a static fallback — the interaction *is* the product. On
touch, either a simplified tap-to-move or an honest "best on desktop" with a static tour. Decide per
project; do not ship a broken driving control to a thumb.

**Gate deltas.** The T-gates (built for scroll) mostly do not apply. New gates: physics-body behaves
(momentum + collision verified by driving it), framerate holds under matcap, input mapping is legible.

**Exemplar.** Bruno Simon portfolio — the field's canonical reference.

**TEACH-TO-GRADUATE.** A distinct discipline (physics, not scroll). Taught only if the owner takes the
system into interactive-world territory; it would likely be its own file, not a STYLES.md slot.

---

## 8 · Micro-game campaign  *(non-scroll)*

**Signature.** One branded, playable verb — a small game — with a leaderboard for retention and a real
reward for stakes. Restraint is the design: one thing, done extremely well.

**Required techniques.** A tight game loop + collision · brand skin over the mechanic · leaderboard/
persistence · a real incentive. Three.js/WebGL for the render.

**Mobile fallback.** Games are often *mobile-first* here — the fallback question inverts: design the
touch verb first, and make sure it survives to desktop.

**Gate deltas.** T-gates do not apply. New gates: the verb is *one* verb (scope discipline), the loop is
fun in ten seconds, the leaderboard persists, the incentive is real.

**Exemplar.** Lacoste Ace Breaker.

**TEACH-TO-GRADUATE.** A campaign format, not a homepage style. Taught if the framework grows a
game-campaign mode; own file, not a STYLES.md slot.

---

## How the menu is used

1. **Graduation** — an archetype becomes buildable when its techniques are **sourced**
   (`06-reference/SOURCES.md` — a repo, paper, or code tutorial) **or** the owner teaches it, then it is
   written into `STYLES.md` as a gated procedure (the one idea, the sub-flavours, the shared spine, the
   generation order, the gates). Sourced-not-taught is fine; median-guessed is not.
2. **Transfer tests** — `00-method/TRANSFER-TESTS.md` re-briefs an archetype's exemplar with a swapped
   seed and hands it to a blind agent holding the framework. Pass = the archetype's *signature* survives
   in a different-looking output; the framework carried the procedure.
3. **Brief-stage selection** — once an archetype has graduated, a `scroll-scene` brief names it (and never
   ships the same one twice for one client — `STYLES.md`).

**Archetypes #2 (taught, = camera-journey) and #6 (mostly covered) are the closest to the library
today. #3 (rooms) is the strongest untaught candidate, because it is what our own ecosystem homepage
already is.**

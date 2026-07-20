# REFERENCE SITES — ten builds, decomposed

This is the field's state of the art, taken apart. Ten sites the owner pulled as the benchmark for
what this framework must be able to *produce* — not admire. Each is decomposed the way the framework
reads a target: **what it is · studio · stack · the technique (in the field's word) · the build flow ·
what we steal · which archetype it feeds.**

Two rules on how to read this file:

> **These are research, not taught styles.** Nothing here graduates into `04-webgl/STYLES.md` by
> being listed here. They are the *menu the owner teaches from* and the *targets the transfer tests
> aim at*. A style enters the library only when the owner teaches it as a gated procedure.

> **"What we steal" is a technique and a discipline, never an image.** We do not copy a site. We take
> the mechanism (depth-scroll, ping-pong particles, room-to-room snap) and the discipline (one verb,
> inertia = weight) and drive it from a *different* seed. Copying a site would only prove an agent can
> copy; the whole framework exists because that is not the bar.

---

## The ten at a glance

| # | Site | Studio | Technique (field term) | Archetype it feeds |
|---|---|---|---|---|
| 1 | Oryzo | Studio Lusion | inertial product render + depth-scroll | Product-in-the-void depth-scroll |
| 2 | IVRESS | Studio Utsubo | WebGPU + TSL dual-backend | *(stack exemplar, not an archetype)* |
| 3 | Lacoste Ace Breaker | — | branded playable micro-game | Micro-game campaign |
| 4 | Shopify Editions | Shopify | scroll-sequenced filmic reveal | Filmic release sequence |
| 5 | Hubtown | Unseen Studio | hero object + cursor-reveal | Product-in-the-void *(B2B variant)* |
| 6 | Sleep Well Creative | — | illustrated 3D scroll narrative | Editorial illustrated scroll |
| 7 | Explore Primland | — | terrain flythrough + atmospheric fog | Terrain / location flythrough |
| 8 | Cartier Watches & Wonders | Immersive Garden | rooms / alcoves, Lenis-driven | Rooms / alcoves |
| 9 | Bruno Simon portfolio | Bruno Simon | physics-based navigation + matcap | Physics-nav explorable world |
| 10 | The Monolith Project | Ethan Chiu | 13-scene cinematic film, composable rendering | Cinematic multi-scene film |

---

## 1 · Oryzo — `oryzo.ai`

**What it is:** a single fictional product (a cork coaster) presented as if it had real weight, the
camera moving through true depth on scroll. Awwwards Site of the Month.

**Studio:** Studio Lusion. **Stack:** Three.js, physics-based inertia on the camera/product.

**Technique — *inertial product render + depth-scroll*.** One hero object in a near-empty space. As
you scroll, the camera travels the **Z axis** (into depth, not down a page) and the object responds
with momentum — it doesn't snap to positions, it *arrives* at them and settles. The whole impression
of quality is the inertia: nothing moves linearly, everything has mass.

**Build flow:** model one product to a high finish → light it for one hero look → map camera Z to
scroll → put a spring (not a lerp) on camera position and on the product's settle → tune damping until
the arrival has weight → hold on the money shot.

**What we steal:** the *single-hero-object-in-the-void* discipline, and inertia-as-weight proven at
the top award tier. This is the cleanest possible demonstration of the springs-not-lerp law, on a
product instead of a character.

**Feeds:** *Product-in-the-void depth-scroll* (`ARCHETYPES.md` #1). This is the archetype the owner's
own "cork → toy car, workbench → toy track, rest → roll" transfer test re-briefs.

---

## 2 · IVRESS — `brand.ivress.co.jp`

**What it is:** a brand site whose point of interest is the *engineering*: it runs the future stack in
production today.

**Studio:** Studio Utsubo. **Stack:** Three.js **WebGPURenderer** with automatic **WebGL2 fallback**;
shaders authored **once in TSL**, compiled to WGSL and GLSL.

**Technique — *WebGPU + TSL dual-backend*.** The site does not maintain two shader codebases. It
writes each shader in TSL and lets Three.js target WebGPU where available and WebGL2 everywhere else.
This is the "watch this" build of 2026: no forked shaders, no rebase burden between backends.

**Build flow:** `import * as THREE from 'three/webgpu'` → author materials in TSL → the renderer picks
the backend at runtime → verify the WebGL2 fallback path renders the same.

**What we steal:** the **stack decision itself**. IVRESS is why `STACK.md` defaults to WebGPU+TSL with
a WebGL2 fallback rather than committing to one backend. It is a stack exemplar, not a scroll archetype.

**Feeds:** `STACK.md`.

---

## 3 · Lacoste Ace Breaker — `members-play.lacoste.com/ace-breaker-rg`

**What it is:** a branded, playable Three.js/WebGL arcade game (brick-breaker) tied to Roland-Garros,
with a leaderboard and real prizes.

**Studio:** — (Lacoste campaign). **Stack:** Three.js/WebGL game loop.

**Technique — *micro-game as campaign*.** One verb (break bricks), a leaderboard for retention, a real
reward for stakes. The design discipline is restraint: it does *one* interactive thing extremely well
rather than ten shallowly.

**Build flow:** pick one verb → build the loop and the collision → skin it to the brand → add a
leaderboard → attach a real incentive.

**What we steal:** the *one-verb* discipline and the micro-game-as-campaign format — a legitimate
non-scroll archetype for a brand that wants engagement over narrative.

**Feeds:** *Micro-game campaign* (`ARCHETYPES.md` #8).

---

## 4 · Shopify Editions — `shopify.com/editions`

**What it is:** Shopify's twice-yearly release page — a long scroll where each section is staged like
a beat in a film.

**Studio:** Shopify. **Stack:** scroll-sequenced reveal, particle-driven typography.

**Technique — *scroll-sequenced filmic reveal*.** Each section has an **entrance, a hold, and an
exit** — the grammar of a shot, not a fade-in. Typography disperses into particles and reassembles.
The scroll is cut like a sequence.

**Build flow:** storyboard each section as entrance/hold/exit → wire scroll to the sequence → add the
particle type-dispersal as the connective tissue between sections → hold on each beat before the next.

**What we steal:** the **entrance/hold/exit beat grammar** — which is exactly what `beats.json` and the
holds table in `TRANSITIONS.md` encode — and the particle type-dispersal technique.

**Feeds:** *Filmic release sequence* (`ARCHETYPES.md` #6); validates our beat + hold model.

---

## 5 · Hubtown — `hubtown.co.in`

**What it is:** a real-estate / B2B brand running flagship 3D — a glowing monolith over water that the
cursor reveals.

**Studio:** Unseen Studio. **Stack:** WebGL + GSAP.

**Technique — *hero object + cursor-reveal*.** A single dramatic object; moving the cursor uncovers
geometry and lighting detail that is otherwise hidden. The interaction primitive is **reveal-on-cursor**
rather than scroll — the user paints light onto the scene.

**Build flow:** one hero object, lit for drama → mask its detail → map cursor position to the reveal
(a light, a mask, a displacement) → let motion (GSAP) carry the rest.

**What we steal:** proof that **B2B/enterprise brands can carry flagship 3D** (it is not only for
fashion), and the **cursor-reveal** interaction primitive as a technique.

**Feeds:** *Product-in-the-void depth-scroll* as a B2B variant (`ARCHETYPES.md` #1); cursor-reveal in
`TECHNIQUES.md`.

---

## 6 · Sleep Well Creative — `sleep-well-creatives.com`

**What it is:** a scroll-driven narrative where hand-drawn illustration is fused with a Three.js stage
— editorial art direction living inside a 3D scene.

**Studio:** —. **Stack:** Three.js stage + 2D illustration.

**Technique — *illustrated 3D scroll narrative*.** The art direction is 2D and hand-made; the depth,
parallax, and motion are 3D. The two are composited so the illustration reads as the surface of a
dimensional world.

**Build flow:** art-direct the illustration first (it leads) → build a shallow 3D stage to give it
depth and parallax → drive the reveal on scroll → keep the drawn character throughout.

**What we steal:** the **2D-illustration-over-3D** composite — a route to a premium editorial feel
without photoreal modelling — and a reference for long-form content living in 3D.

**Feeds:** *Editorial illustrated scroll* (`ARCHETYPES.md` #5).

---

## 7 · Explore Primland — `explore.ownprimland.com`

**What it is:** real terrain rendered in Three.js — a cinematic landscape flythrough with atmospheric
fog, the camera gliding on scroll. Tied to a physical place.

**Studio:** —. **Stack:** Three.js terrain, atmospheric fog, scroll-driven camera.

**Technique — *terrain flythrough + atmospheric fog*.** A modelled world holds still; the **camera**
glides through it as you scroll, and fog gives the depth and the mood. This is the camera-journey the
framework already knows, **confirmed in the wild by someone else** — the bear-down-a-mountain scene's
closest public cousin.

**Build flow:** model/acquire the terrain → set atmospheric fog and a sun → path the camera through
the world → drive the path on scroll with springs → blend the fog/sun continuously as it travels.

**What we steal:** external validation of our **camera-journey** style and its exact ingredients —
continuous fog/sun blend, camera-glides-through-static-world, springs on the path. Primland is the
proof that `SCENE.md` + `TRANSITIONS.md` describe a real, shippable class of site.

**Feeds:** *Terrain / location flythrough* (`ARCHETYPES.md` #2) — our camera-journey.

---

## 8 · Cartier Watches & Wonders — `cartier.com/en-fr/watchesandwonders`

**What it is:** six self-contained 3D "alcoves," one per watch; scroll moves you *between rooms* rather
than down a single page.

**Studio:** Immersive Garden. **Stack:** GLSL + GSAP + **Lenis** (smooth-scroll).

**Technique — *rooms / alcoves*.** Instead of one continuous world, the scene is a set of discrete,
self-contained 3D scenes. Scroll is the transport *between* them. Lenis smooths the scroll into the
clean value that drives the room-to-room moves; each room has its own material and lighting.

**Build flow:** design each room as its own small scene → give each its own material/light → wire Lenis
to the scroll → map scroll ranges to room-to-room transitions → transition on entering/leaving a room,
not continuously.

**What we steal:** this is the structural twin of **our nine app "beats"** — each RHOBEAR product is a
*room*. Cartier proves the room-to-room model at a luxury tier, and it is where **Lenis** enters our
stack as the smooth-scroll layer.

**Feeds:** *Rooms / alcoves* (`ARCHETYPES.md` #3); Lenis in `STACK.md`.

---

## 9 · Bruno Simon portfolio — `bruno-simon.com`

**What it is:** the canonical creative-WebGL reference: you **drive a physics-based car** through a 3D
world to explore the work. Everyone in the field cites it.

**Studio:** Bruno Simon (author of **Three.js Journey**, the field's canonical course — see
`BUILD-FLOW.md`). **Stack:** Three.js, **Cannon.js** physics, **matcap** materials.

**Technique — *physics-based navigation* + *matcap*.** Navigation is not scroll — it is *driving*, with
a real physics engine giving the car momentum, collision, and weight. Materials use **matcap** so the
world looks lit with no actual lights, which is what keeps a fully interactive 3D world at framerate.

**Build flow:** build the world → add a physics body for the vehicle and colliders for the world → map
input to drive → matcap the materials for a lit look at low cost → place the portfolio content as
things in the world you drive up to.

**What we steal:** the **physics-nav explorable** archetype (navigation *is* the interaction), and
**matcap** as the technique for a rich look at near-zero lighting cost.

**Feeds:** *Physics-nav explorable world* (`ARCHETYPES.md` #7); matcap and physics-engine nav in
`TECHNIQUES.md`.

---

## 10 · The Monolith Project — `themonolithproject.net`

**What it is:** a thirteen-scene, scroll-driven short film — hand-drawn illustration, 3D worlds, sound,
and cinematic transitions fused into one retro-futuristic journey (Moebius / *2001* lineage). The
maximal case. Recognised by FWA, Awwwards, CSS Design Awards, Web Game Dev, GSAP.

**Studio / lead:** Ethan Chiu. **Stack:** React Three Fiber; a custom composable shader framework, a
GPGPU particle engine, custom transition shaders, and a full **deferred rendering** pipeline.

**Technique — *composable rendering systems for a 13-scene epic*.** This one gets its own deep-dive
below because its four systems are the technique catalog's spine. The build is documented by its
creator on Codrops ("Building The Monolith: Composable Rendering Systems for a 13-Scene WebGL Epic",
29 Nov 2025) — the field's most detailed public engineering write-up of a site of this class.

**What we steal:** all four systems below, and the craft note that **particles respond to input** —
dust/leaf/snow is pulled toward the monolith on tap-and-hold, so the particle system is coupled to the
user in real time, not running on a timer.

**Feeds:** *Cinematic multi-scene film* (`ARCHETYPES.md` #4); the bulk of `TECHNIQUES.md`.

### The four systems (the deepest single reference in this file)

**1 · Deferred rendering + outlines.** Two passes. First, geometry and material data are written into
an off-screen **G-Buffer** (position, normal, colour textures). Then lighting runs *once* as a
full-screen pass reading that buffer. This is the standard technique for a scene that needs many lights
or a consistent post-process (here, toon-style outlines) **without paying the cost per object**.
*Optimisation left on the table:* because the palette was deliberately limited, a **colour LUT** could
have shrunk the G-Buffer to a few bits — the classic stylised-not-photoreal trick.

**2 · Composable materials.** Rather than one monolithic shader per object, shader logic lives in
snap-together **modules** — a "wind" module, etc. — combining vertex and fragment fragments into new
materials on demand. Same idea as **shader chunks / shader graphs** (Unity Shader Graph, Three.js's own
chunk system), built custom for the project. It turns bespoke materials into composition.

**3 · Composable particle system** (the meatiest). A **GPGPU** particle system — particles simulated on
the GPU, not the CPU — using **ping-pong rendering**: two textures alternate each frame, last frame's
texture computing this frame's position, velocity, rotation, and **life** (age/decay). Layered on:
**prewarming** (run the sim forward before the user sees it, so particles don't all spawn from nothing),
graceful start/stop (existing particles finish their life instead of vanishing), an unused burst mode,
and **input-coupling** (particles pulled toward the monolith on tap-and-hold). This is *the* standard
way to run tens of thousands of particles at 60fps in the browser.

**4 · Scene transitions.** The transition kit, from the creator's own list: **wipes**, **zoom blurs**,
**2D-to-3D object matching** (an illustrated element morphing into its 3D counterpart), **masking**, a
**radial transition based on world position**, and a **ray-marched sphere** transition (stepping a ray
through a distance field to render the transition shape *procedurally*, not as geometry — a technique
straight from the Shadertoy/demoscene world). This list is folded into `04-webgl/TRANSITIONS.md` as the
transition-mechanic menu.

---

## What this file is for

- It is the owner's **teaching menu**: when the owner teaches a scroll-style into `STYLES.md`, it is
  usually one of these archetypes made into a gated procedure.
- It is the **transfer tests' target list** (`00-method/TRANSFER-TESTS.md`): a blind agent, holding the
  framework, is re-briefed to reskin one of these (swap the seed, keep the technique) — and the test is
  whether the *framework* carried the procedure across, not whether the agent could copy.
- It is the **technique catalog's source** (`TECHNIQUES.md`): every mechanism named here is defined
  there with its cost and gotchas.

# TECHNIQUES — the catalog, with costs and gates

The archetypes (`ARCHETYPES.md`) are *what moves and why*. These are the mechanisms that implement
them — archetype-independent, reusable, each with a real cost and a real way to get it wrong. A brief
names techniques by these names; the future scene generator emits them; `04-webgl/TRANSITIONS.md` and
`SCENE.md` cite them.

Each entry: **what it is · when to reach for it · how it's built · cost · gotchas · the gate it
implies.** Terms are defined in `GLOSSARY.md`; this file is where they get their engineering.

---

## Scroll and camera

### Lenis smooth-scroll driving the camera

**What.** A smooth-scroll library that normalises wheel/trackpad/touch into one eased scroll value.
**When.** Any scroll-scene — it is the clean signal the camera and beats read, instead of raw steppy
scroll. **How.** Instantiate Lenis, read its eased progress each frame, feed that into the camera
spring targets and the beat mapper. **Cost.** Negligible CPU; one dependency. **Gotchas.** Lenis takes
over the scroll — native anchor jumps and some accessibility affordances need re-wiring; it must be
disabled on the mobile static path (that path doesn't run the scene). **Gate.** Part of T-setup: the
scroll signal the camera reads is the eased one, not `window.scrollY` raw.

### GSAP ScrollTrigger — scrub and snap

**What.** The timeline library's scroll plugin. **scrub** ties progress to scroll position; **snap**
locks to the nearest beat on release. **When.** To map scroll → beat progress and to snap-hold on
beats. **How.** One ScrollTrigger over the scene section; scrub drives `progress`; snap points are the
beat positions; on snap we emit `rhobear:beat` / `rhobear:snapped` CustomEvents so the DOM layer (UI,
copy) can react. **Cost.** Low. **Gotchas.** Snap fights holds if both are naive — reconcile snap with
the holds table (`TRANSITIONS.md`); snap must be **off on touch** (holds are zero on touch — a snap
that traps a swipe reads as broken). **Gate.** T5 (holds): first/last beat never hold, touch = all zero.

### Springs / inertia on the camera  *(the law)*

**What.** Camera position, rotation, and FOV driven by springs (mass, damping, overshoot), never by
`lerp`. **When.** Always, on any physical camera motion. **How.** One spring per axis, tuned
separately; the **FOV spring slower than position** so the lens lags the body under acceleration —
that lag is the cinematic effect (`SCENE.md`, `TRANSITIONS.md`). **Cost.** Trivial. **Gotchas.** You
*may* lerp a spring's **target**; the gate must not flag that (T1 is a script, not a naive grep — a
grep that fails correct code gets switched off). Colour and opacity may lerp; physical motion may not.
**Gate.** **T1** — zero lerps on camera position/rotation/FOV, verified by `phase0/check-motion.mjs`.

### Cursor-reveal

**What.** Cursor position uncovers geometry or lighting detail otherwise hidden. **When.** A single
hero object you want the user to explore without scrolling (B2B/product). **How.** Map pointer position
to a light, a mask, or a displacement on the hero material. **Cost.** Low. **Gotchas.** Needs a touch
answer — there is no cursor on a phone, so the reveal must have a default resting state that reads as
finished, or a tap/tilt substitute. **Gate.** The mobile fallback shows the object in a revealed
resting state, not mid-reveal.

---

## Particles

### GPGPU ping-pong particles

**What.** Particle position/velocity/rotation/life computed on the **GPU** via **ping-pong** (two
textures alternate; last frame's texture computes this frame's). **When.** Tens of thousands of
particles at 60fps — weather, dust, sparks, type-dispersal. The CPU cannot do this count.
**How.** Encode particle state into a float texture; a fragment shader reads texture A, writes texture
B (next state); swap each frame; a vertex shader positions the render geometry from the state texture.
**Cost.** GPU memory for the state textures; a fill-rate cost that scales with particle count and
texture size — the main budget line in a particle-heavy scene. **Gotchas.** Float-texture support and
precision vary by device; state must be seeded (see prewarming); stopping naively makes particles
vanish (see graceful stop). **Gate.** Verify-by-build the particle system on its own (render it, count
the framerate on a mid device) — it does not get to hide inside the whole-scene gate.

### Prewarming

**What.** Run the particle sim forward *before* the user sees it. **When.** Any ambient system (snow,
dust) that should look already-running on first paint. **How.** Step the ping-pong sim N frames during
load, before the first visible render. **Cost.** A few frames of load-time compute. **Gotchas.** Skip
it and every particle spawns from the origin at once — the "system just booted" tell. **Gate.** First
visible frame shows a populated, mid-life field, not a spawn burst.

### Graceful start/stop and input-coupling

**What.** Stopping lets existing particles finish their **life** instead of vanishing; input-coupling
wires particle behaviour to live user input (dust pulled toward a focus on tap-and-hold). **When.**
Whenever particles are more than wallpaper — coupling is what turns them into interaction. **How.**
Gate emission, not the whole system, on stop; add an input-driven force field to the velocity update.
**Cost.** Negligible over the base system. **Gotchas.** Input-coupling that is too strong reads as a
gimmick; keep the force subtle. **Gate.** Particles respond to input in the render (not just described).

---

## Materials and rendering

### Composable materials (shader chunks)

**What.** Build a material from snap-together modules of shader logic (a "wind" chunk, a "dissolve"
chunk) instead of one monolithic shader per object. **When.** More than a couple of bespoke materials
that share behaviour. **How.** Author reusable vertex/fragment fragments; compose them into materials
on demand (custom, or via Three.js's chunk system / TSL node graph). **Cost.** Upfront system-building;
pays back across every material after. **Gotchas.** Over-abstraction — build the chunk system only when
you have the repetition to justify it; two materials do not need a graph. **Gate.** No copy-pasted
near-identical shaders in the tree (the smell the system removes).

### Deferred rendering + G-Buffer (+ LUT)

**What.** Two-pass rendering: geometry/material → off-screen G-Buffer textures, then lighting as one
full-screen pass. A colour **LUT** can shrink the G-Buffer on a limited palette. **When.** Many lights,
or a consistent post-process (toon outlines) you don't want to pay per object. **How.** Render the
G-Buffer (MRT: position/normal/colour), then a full-screen lighting pass reads it; outlines/post read
the same buffer. **Cost.** G-Buffer memory + bandwidth; worth it past a light-count threshold, overkill
below it. **Gotchas.** Transparency does not fit deferred cleanly (needs a forward pass for it);
stylised palettes should consider the LUT to reclaim the memory. **Gate.** The deferred pass verifies
by build (outlines/lighting look identical to the mock in a real render, not just in source).

### Instancing

**What.** Draw thousands of copies of one geometry in a single draw call. **When.** Any repeated
geometry — a forest, a crowd, a field. **How.** `InstancedMesh` with per-instance transforms/colours.
**Cost.** Massive win over per-object draws; the cost is the setup and per-instance attribute
management. **Gotchas.** Per-instance variation (colour, scale) must go through instance attributes,
not material swaps, or you lose the batch. **Gate.** Repeated geometry is instanced, not looped as
separate meshes (a framerate gate on the relevant beat).

### Matcap

**What.** A texture that fakes lighting so a surface looks lit with **no actual lights**. **When.** A
fully interactive world (physics-nav) or any scene where lighting cost is the framerate risk. **How.**
Sample a matcap texture by the view-space normal. **Cost.** Near-zero — the whole point. **Gotchas.**
The lighting is *baked into the matcap* — it cannot react to scene lights or moving light sources; the
look is fixed. Wrong choice when the design needs dynamic light. **Gate.** Chosen deliberately (the
brief declares matcap vs lit); not defaulted to because lighting was hard.

### Ray marching / SDF

**What.** Render a shape by stepping a ray through a signed distance field, procedurally, with no
geometry. **When.** Procedural transition shapes (a growing sphere), volumetric-ish effects. **How.** A
fragment shader marches the ray against an SDF and shades the hit. **Cost.** Fill-rate heavy — cost
scales with screen coverage and step count. **Gotchas.** Expensive full-screen; keep it to transitions
and small coverage, not a whole scene, on the web. **Gate.** Used for transitions/accents, not as the
primary render (a performance gate on any ray-marched pass).

---

## Transitions  *(the kit — detailed in `04-webgl/TRANSITIONS.md`)*

**What.** The menu of scene-to-scene / beat-to-beat transition mechanics, from the Monolith build:
**wipe · zoom-blur · 2D-to-3D object matching · masking · radial-on-world-position · ray-marched
sphere.** **When.** Between rooms (rooms archetype) or between scenes (cinematic archetype); between
beats in any scroll-scene. **How.** Each is one mechanic; storyboard the midpoint still first, then
implement (`TRANSITIONS.md` § storyboard the transitions). **Cost.** Varies — a wipe is cheap, a
ray-marched sphere is fill-heavy. **Gotchas.** **One mechanic per transition** — two at once cancel and
read as a glitch. **Gate.** T0 (a still for every transition midpoint) + T7 (the built midpoint matches
the drawn still).

---

## Stack

### WebGPU + TSL dual-backend

**What.** Render on WebGPU where available, WebGL2 everywhere else; author shaders once in TSL, compile
to WGSL + GLSL. **When.** Default for anything built now (`STACK.md`). **How.**
`import * as THREE from 'three/webgpu'`; author materials in TSL; the renderer picks the backend.
**Cost.** None at runtime — the win is *one* codebase. **Gotchas.** A few TSL nodes behave differently
across backends — verify the **WebGL2 fallback path renders the same**, don't assume. **Gate.** Both
backends render the scene equivalently (checked, not assumed).

### Physics engine (Cannon.js / Rapier)

**What.** Real collision, gravity, momentum. **When.** *Only* the physics-nav archetype, or a settle
that genuinely needs collision — most scroll scenes fake weight with springs and need no engine.
**How.** A physics body for the controllable thing, colliders for the world; step the sim, read
transforms back to the meshes. **Cost.** Real CPU/wasm cost + integration complexity — do not add one
for a look a spring gives you. **Gotchas.** Reaching for a physics engine when a spring would do is the
common over-build. **Gate.** The brief declares a physics-nav archetype before an engine is added; a
scroll-scene does not get one.

---

## How to read the costs

The catalog is ordered roughly by how often you reach for it, not by cost. The two with the best
cost-to-payoff for this framework — the ones worth building first if we build a scene generator — are
**GPGPU ping-pong particles** and **composable materials (shader chunks)**: they show up in nearly every
premium scene and, once built, pay back on every project. The two to reach for *last* and only on
purpose are **deferred rendering** (justified past a light-count threshold, overkill below it) and a
**physics engine** (justified only by the physics-nav archetype). Everything is gated the same way the
rest of the method is: **verify by build** — you saw it run at framerate in a real render, not in the
source.

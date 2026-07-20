# GLOSSARY — the field's vocabulary, said correctly

You cannot brief what you cannot name. When the identity layer is sourced but the *technique* layer
is vague, the agent reaches for its median there instead — the same failure LAW 1 stops for marks
and palettes, moved one layer down into the motion and the render. This file is the technique layer's
anti-drift list: the words the creative-WebGL field actually uses, defined once, so a brief can say
*"depth-scroll with spring inertia, matcap on the hero, static 9:16 sequence on mobile"* and mean
exactly one thing.

Every entry: **what it is · when it matters · where we use it.** If a term appears in a brief, a
prompt, `ARCHETYPES.md`, `TECHNIQUES.md`, or a transfer test, it is defined here first.

---

## The stack — what actually runs

**WebGL** — the low-level browser API that talks to the GPU (a JavaScript binding to OpenGL ES).
*When it matters:* it's the floor everything sits on; nobody writes it raw for production.
*Where:* the fallback backend in `STACK.md`.

**WebGL 2** — the current baseline WebGL, ~universal. *When it matters:* it is the guaranteed
fallback when WebGPU is absent. *Where:* `STACK.md` — the "and it still runs for the other 5%" line.

**WebGPU** — the successor GPU API, production-ready in Three.js since **r171 (Sept 2025)**, ~95%
browser coverage. *When it matters:* faster, compute-shader-capable, the default backend for anything
built in 2026. *Where:* `STACK.md` default renderer (`three/webgpu`), auto-falls-back to WebGL 2.

**Three.js** — the abstraction over WebGL: scenes, cameras, lights, materials, geometry, the render
loop. Runs ~90% of "3D websites." *When it matters:* this is what we author against, not raw WebGL.
*Where:* everything in `04-webgl/`.

**React Three Fiber (R3F)** — Three.js expressed as React components instead of imperative JS.
*When it matters:* fits a React team and a component-shaped scene; adds a reconciler between you and
the GPU. *Where:* `STACK.md` decision rule — R3F when component-shaped, vanilla for one bespoke
continuous scene (ours).

**TSL — Three Shading Language** — a JavaScript shader-authoring layer that compiles to **WGSL**
(WebGPU) *and* **GLSL** (WebGL). Write the shader once, run on both backends. *When it matters:* it
kills the forked-shader-codebase problem — the reason it's the 2026 "watch this." *Where:* `STACK.md`;
exemplar is IVRESS in `REFERENCE-SITES.md`.

**GLSL — vertex + fragment shaders** — small programs run per-vertex and per-pixel on the GPU. The
**vertex** shader moves points; the **fragment** shader colours pixels. *When it matters:* this is
where custom backgrounds, distortion, "liquid," and any non-stock look come from. *Where:* the raw
layer under TSL; `TECHNIQUES.md`.

**WGSL** — WebGPU's native shader language. *When it matters:* TSL compiles to it; you rarely hand-
write it. *Where:* named in `STACK.md` for completeness.

---

## Scroll and motion

**Scroll-driven scene / scrollytelling** — scroll position drives a 3D camera or sequences whole 3D
scenes, instead of scrolling a flat 2D page. *When it matters:* it is the entire category this
framework is built for. *Where:* the `scroll-scene` shell (`SYSTEM.md`); `04-webgl/SCENE.md`.

**Lenis** — a smooth-scroll library that normalises the wheel/trackpad/touch into one eased scroll
value. *When it matters:* raw scroll is steppy and device-dependent; Lenis is the clean signal the
camera reads. *Where:* `STACK.md`; the Cartier exemplar drives its room-to-room moves on it.

**GSAP ScrollTrigger** — the timeline library's scroll plugin. **scrub** ties animation progress to
scroll position; **snap** locks to the nearest beat on release. *When it matters:* it is how beats
get their scroll mapping and their snap. *Where:* `SCENE.md`; we emit `rhobear:beat` / `rhobear:snapped`
CustomEvents off it.

**Spring / physics-based inertia** — motion driven by a spring (mass, damping, overshoot) or a
physics engine, so movement has weight and momentum instead of a linear glide. *When it matters:* it
is the single line between "cinematic" and "weightless." *Where:* the grep-gated law — springs on
camera position/rotation/FOV, **never `lerp`** (`SCENE.md`, `TRANSITIONS.md`).

**lerp (linear interpolation)** — move a value a fixed fraction toward a target each frame. *When it
matters:* fine for **colour and opacity**; **banned on physical motion** (camera, a settling piece)
because it has no weight. *Where:* the T1 gate; the anti-default table.

---

## Rendering techniques

**Forward rendering** — Three.js's default: each object is lit and shaded in one pass. *When it
matters:* simple, but cost scales with objects × lights. *Where:* the baseline `deferred rendering`
departs from.

**Deferred rendering** — split the work in two: first write geometry/material data into off-screen
textures, then run lighting once as a full-screen pass. *When it matters:* many lights, or a
consistent post-process (like toon outlines), without paying per object. *Where:* the Monolith
exemplar; `TECHNIQUES.md`.

**G-Buffer** — the set of off-screen textures deferred rendering writes (position, normal, colour,
etc.) before the lighting pass. *When it matters:* it is the memory cost of going deferred; shrinking
it is the optimisation. *Where:* `TECHNIQUES.md` (the LUT trick shrinks it).

**LUT (colour lookup texture)** — a small texture that maps input colours to output colours. *When it
matters:* on a deliberately limited palette you can store colour in a few bits via a LUT and shrink
the G-Buffer — the optimisation Monolith left on the table. *Where:* `TECHNIQUES.md`.

**Shader chunks / shader graph** — build a material from snap-together modules of shader logic (a
"wind" chunk, a "dissolve" chunk) instead of one monolithic shader per object. *When it matters:* it
turns bespoke materials into composition instead of copy-paste. *Where:* Monolith's "composable
materials"; `TECHNIQUES.md`.

**Instancing** — draw thousands of copies of one geometry in a single draw call. *When it matters:*
the difference between a forest that runs and one that stutters. *Where:* `TECHNIQUES.md`; any
repeated-geometry beat.

**Matcap (material capture)** — a texture that fakes lighting, so a surface looks lit with **no
actual light** in the scene. *When it matters:* a rich lit look at near-zero cost; the trade is the
lighting is baked and can't react. *Where:* the Bruno Simon exemplar; `TECHNIQUES.md`.

**Ray marching / SDF (signed distance field)** — render a shape by stepping a ray through a distance
field that describes it mathematically, instead of drawing triangles. *When it matters:* procedural
shapes and transitions (a growing sphere) with no geometry. *Where:* Monolith's ray-marched sphere
transition; the transition kit in `TRANSITIONS.md`.

---

## Particles

**GPGPU particle system** — particle positions and physics computed **on the GPU**, not the CPU.
*When it matters:* it is how a site runs tens of thousands of particles at 60fps; the CPU can't.
*Where:* Monolith's "composable particle system"; `TECHNIQUES.md`.

**Ping-pong rendering** — alternate writing to two textures each frame, using last frame's texture as
the input that computes this frame's state (position, velocity, rotation, life). *When it matters:* it
is *the* mechanism a GPGPU particle system runs on. *Where:* `TECHNIQUES.md`.

**Life (particle age / decay)** — a per-particle counter that ages and expires it. *When it matters:*
"graceful stop" means letting existing particles finish their life instead of vanishing. *Where:*
`TECHNIQUES.md`.

**Prewarming** — run the particle simulation forward *before* the user sees it, so particles don't
all spawn from nothing at once. *When it matters:* the difference between "a world with weather" and
"a system that just booted." *Where:* `TECHNIQUES.md`.

**Input-coupling** — wire particle behaviour to live user input (dust pulled toward a monolith on
tap-and-hold). *When it matters:* it turns decoration into interaction; the particles stop being a
timer. *Where:* the Monolith craft note; `TECHNIQUES.md`.

---

## Physics and navigation

**Physics engine (Cannon.js / Rapier)** — computes real collision, gravity, and momentum. *When it
matters:* only when an archetype needs real physical navigation or settling — most scroll scenes fake it
with springs and don't need one. *Where:* the physics-nav archetype (Bruno Simon); `STACK.md` gates
it behind that choice.

---

## How to use this file

- **Writing a brief for a `scroll-scene`?** Name the archetype (`ARCHETYPES.md`) and the techniques
  (`TECHNIQUES.md`) using these words. A brief that says "make it feel premium and modern" has named
  nothing; a brief that says "rooms archetype, Lenis-driven, one matcap hero per room, ray-marched
  wipe between them" has named the build.
- **A term the owner used isn't here?** That's a gap — add it, don't work around it. The glossary is
  only anti-drift if it's complete.
- **A term here has no downstream file using it?** Either the technique isn't wired into the method
  yet (flag it) or the entry is dead weight (cut it). Every entry earns its place by being cited.

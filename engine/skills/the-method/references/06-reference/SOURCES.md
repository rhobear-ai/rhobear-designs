# SOURCES — the engineering, sourced

The owner's directive: *"go do the research so I don't have to teach… expand the list, and you find the
engineering. If you're missing gaps… come to me… otherwise, go do the rest."* This file is the result.

`REFERENCE-SITES.md` is *what* the field builds. `TECHNIQUES.md` is *when* to reach for a mechanism and
what it costs. **This file is *how* — the real engineering, with a real source you can open: an
open-source repo, a canonical paper, docs, or a tutorial that ships code.** It is the framework's
bibliography, and it is what lets a style graduate on *sourced engineering* instead of a model's guess.

Source types are tagged: **[OSS]** open-source code you can read/fork · **[PAPER]** canonical
reference/write-up · **[DOCS]** official documentation · **[CODE-TUT]** tutorial that ships working
code. What is *not* here — the spring/damping feel values, the reveal-binding, the image-first
curation — is the owner's taste, already taught (`04-webgl/`), and not a thing you research.

---

## GPGPU particles

**Sources.** Three.js `GPUComputationRenderer` **[DOCS]** (`threejs.org/docs` → GPUComputationRenderer;
official addon) · Codrops, "Crafting a Dreamy Particle Effect with Three.js and GPGPU", 2024
**[CODE-TUT]** · Three.js Journey, "GPGPU Flow Field Particles Shaders" **[CODE-TUT]** · repos:
`github.com/epranka/gpucomputationrender-three`, `github.com/tuqire/three.js-fbo`,
`github.com/Alfred-Mountfield/WebGLParticles` **[OSS]**.

**The engineering (WebGL / FBO path).** State (position, velocity) is stored *in textures*, one texel
per particle. `GPUComputationRenderer` keeps **two render targets per variable** and ping-pongs them:
the current frame's texture is the input that renders the next frame's texture. Each variable is a
fragment shader that reads the state textures and writes the new state; the render material's vertex
shader then reads the position texture to place the points. You add variables, set their dependencies,
`init()`, and call `.compute()` each frame.

**The engineering (WebGPU / TSL path — the 2026 way).** Replaces FBO ping-pong with **storage buffers +
compute shaders** (see the TSL section below): `instancedArray(COUNT,'vec3')` for spawn + offset
buffers, a compute `Fn` that updates the offset by an attractor derivative each frame
(`gl.compute(node)`), and a `spriteNodeMaterial` whose `positionNode` is `spawn.add(offset)`. Source:
Maxime Heckel field guide (below).

---

## TSL + WebGPU (the whole render/compute pipeline)

**Source.** Maxime Heckel, "Field Guide to TSL and WebGPU", `blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/`
**[CODE-TUT]** — the single densest engineering reference we have; covers materials, compute, GPGPU,
post-processing. Plus Threlte "WebGPU and TSL" **[DOCS]** and the three.js manual **[DOCS]**.

**The engineering, in the order you build it:**

1. **Renderer.** `new THREE.WebGPURenderer(props)` then `await renderer.init()`; falls back to WebGL2
   automatically. Pass `forceWebGL:true` to *test* the fallback path renders the same (this is the gate
   in `TECHNIQUES.md`).
2. **Materials via the node system** (replaces the old `onBeforeCompile` string-splicing): node materials
   (`MeshStandardNodeMaterial`, `MeshPhysicalNodeMaterial`, …) take `positionNode` / `normalNode` /
   `colorNode`, each an `Fn(() => …)`. `uniform(value)` for CPU→GPU (update `.value` in the frame loop);
   `varying()` to pass vertex→fragment; `texture()` / `sampler()` for samplers.
3. **Compute for instanced meshes.** `instancedArray(COUNT,'vec3')` storage buffer → a compute shader
   populates it using `instanceIndex` → `await gl.computeAsync(node)` once → the render `positionNode`
   reads `buffer.element(instanceIndex)`.
4. **GPGPU particles with attractors.** spawn + offset buffers; per-frame compute adds the attractor
   derivative (e.g. Thomas attractor) to the offset; render with `spriteNodeMaterial` + additive blend.
5. **Post-processing / outlines.** `pass(scene,camera)` → `getTextureNode('output'|'depth')`; wrap in a
   `TempNode` subclass for a custom effect; drive with `new THREE.PostProcessing(gl)` and
   `renderPriority:1` so it runs after the scene. Outlines specifically: a compute Sobel over depth+normal
   writes a `StorageTexture` the effect reads.
6. **Compute tuning.** workgroup size `[64,1,1]` for 1D buffers, `[8,8,1]` for 2D/textures; dispatch size
   sets the grid; total threads = workgroup × dispatch per axis.

**Why this matters to us.** This is the concrete emit-target for a future scene generator (`STACK.md`):
one shader source in TSL, both backends, compute where the CPU used to choke.

---

## Deferred rendering + G-Buffer + outlines

**Not a gap — sourceable, advanced.** Three.js is forward by default, so deferred is *custom*, but it is
documented and there is open-source code:

**Sources.** **Bruno Simon, `github.com/brunosimon/webgl-three.js-deferred-rendering` [OSS]** (live demo
`webgl-three-js-deferred-rendering.vercel.app`) — a working three.js deferred renderer to read. Mozilla
Hacks, "WebGL Deferred Shading", 2014 **[PAPER]** — the technique + the WebGL constraint. For outlines,
the Sobel-on-depth+normal compute recipe in the Maxime Heckel guide **[CODE-TUT]**.

**The engineering.** Deferred needs to write several textures at once (position/normal/colour = the
G-Buffer). In **WebGL2** that's Multiple Render Targets via the `WEBGL_draw_buffers` capability (older
WebGL1 had to render the scene multiple times — the historical cost). Then one full-screen lighting pass
reads the G-Buffer; outlines/post read the same buffer. In **WebGPU** the compute pipeline does this more
cleanly. The LUT optimisation Monolith mentioned: on a limited palette, store colour via a lookup texture
to shrink the G-Buffer.

---

## Raymarching / SDF (procedural transitions & shapes)

**Sources.** **Inigo Quilez, `iquilezles.org/articles/raymarchingdf/` [PAPER]** — *the* canonical
reference (he also catalogues exact SDF primitives at `iquilezles.org/articles/distfunctions/`) · Codrops,
"How to Create a Liquid Raymarching Scene Using TSL", 2024 **[CODE-TUT]** — the web/TSL application ·
GM Shaders "Signed Distance Fields" **[PAPER]** · Shadertoy for live examples.

**The engineering (sphere-tracing loop).** A distance function returns the *minimum Euclidean distance*
from any point to the nearest surface. The loop: (1) evaluate the distance at the ray's position, (2)
**advance the ray by exactly that distance** (safe — nothing is closer), (3) stop when distance < epsilon
(hit) or steps exceed a max (miss). **Normals** = the gradient of the field, approximated by sampling the
distance at small offsets around the hit. **Primitives:** sphere, box, cylinder, cone, ellipsoid.
**Operations:** union = `min()`, subtraction/intersection = `max()`/negation, organic blends =
*smooth-minimum* instead of `min()`, and *domain repetition* to tile one primitive across space. This is
exactly Monolith's "ray-marched sphere" transition — a full-screen fragment pass, fill-heavy, so kept to
transitions, not whole scenes (`TECHNIQUES.md`).

---

## Scroll wiring — Lenis + GSAP ScrollTrigger

**Sources.** **`github.com/darkroomengineering/lenis` [OSS]** (~3kb; the maintained package — it replaced
`@studio-freight/lenis`) · GSAP ScrollTrigger **[DOCS]** · Codrops scroll-driven tutorials **[CODE-TUT]**.

**The engineering (the integration everyone gets slightly wrong).** Run *one* loop: initialise Lenis;
on Lenis scroll call `ScrollTrigger.update`; add Lenis's `raf` to **GSAP's ticker**; **disable GSAP
`lagSmoothing(0)`** so scroll animation doesn't lag. Then Lenis owns momentum/easing, ScrollTrigger owns
the positional math (scrub + snap), and the WebGL scene reads the same eased progress the camera springs
target. This is the Cartier / rooms transport layer and the general scroll-scene signal (`STACK.md`).

---

## Physics-nav explorable world

**Sources.** **Bruno Simon's portfolio is fully open-source — `github.com/brunosimon` [OSS]** (MIT, even
the Blender files; devlogs on YouTube) — the canonical reference build · his case study on Medium
**[PAPER]** · Rapier (`rapier.rs`, Rust→WASM) and cannon-es (pmndrs fork) **[OSS]** · Three.js Journey
"Physics" and "Physics with R3F" **[CODE-TUT]** · Codrops "Physics-based 3D Menu with Cannon.js", 2019
**[CODE-TUT]**.

**The engineering.** A physics body for the controllable thing (the car) + colliders for the world; step
the sim each frame; read the body's transform back onto the mesh. Input maps to forces/torque on the body.
Materials are **matcap** (below) so a fully interactive world stays at framerate. Bruno's portfolio
migrated Cannon.js → **Rapier** — prefer Rapier for new work.

---

## Matcap (lit look, no lights)

**Source.** Three.js `MeshMatcapMaterial` **[DOCS]** (built-in) · matcap texture libraries (e.g.
`github.com/nidorx/matcaps` **[OSS]**).

**The engineering.** Sample a "material capture" texture by the view-space normal; the lighting is *baked
into the texture*, so there are no scene lights and near-zero cost. Trade: the look is fixed — it can't
react to moving lights. Use it deliberately (the brief declares matcap vs lit), never as a default because
lighting was hard.

---

## Terrain / location flythrough (our camera-journey)

**Sources.** **Maxime Heckel, "Building a Vaporwave scene with Three.js"
`blog.maximeheckel.com/posts/vaporwave-3d-scene-with-threejs/` [CODE-TUT]** — a near-exact worked example
of a terrain flythrough (displacement terrain + camera/terrain motion + fog) · `github.com/IceCreamYou/THREE.Terrain`
**[OSS]** procedural terrain engine · Nathan Pointer, "Rendering semi-realistic Landscapes"
`nathanpointer.com/blog/landscapes` **[PAPER]** · `josdirksen/threejs-cookbook` heightmap recipe **[CODE-TUT]**.

**The engineering.** A plane with a **displacementMap/heightmap** (needs ~one subdivision per heightmap
pixel so each height has a vertex). **Fog** at the back gives scale and hides the far edge — essential to
the cinematic read. The flythrough is the terrain animated toward the viewer on Z (or the camera pathed
through it) — and per our own law, the camera moves on **springs**, with the continuous fog/sky/sun blend
of `04-webgl/TRANSITIONS.md`. This is the public confirmation of the camera-journey's ingredients.

---

## 2D-illustration-over-3D / layered parallax (editorial archetype)

**Sources.** Codrops, "Creating a Smooth Horizontal Parallax Gallery: From DOM to WebGL", 2026
**[CODE-TUT]** — the exact DOM→WebGL progression · Patrick Westwood, "Multi-Layered Parallax Illustration
with CSS & JS" **[CODE-TUT]**.

**The engineering.** DOM path: each layer has a `data-depth`; move it by `scrollDistance × depth` (far =
slower). WebGL path (smoother, the premium one): the layers are textures and you **offset the UVs by a
parallax value** on the GPU per pixel each frame — left-of-centre shifts left, right shifts right — no
DOM reflow. This is the mechanism under Sleep Well's illustrated-3D feel: hand-drawn art on depth-sorted
layers, the parallax done in WebGL.

---

## Instancing

**Source.** Three.js `InstancedMesh` **[DOCS]** · Three.js Journey instancing lesson **[CODE-TUT]**.

**The engineering.** One geometry, thousands of copies, one draw call; per-instance transform/colour via
instance attributes (a `Matrix4` per instance / `setColorAt`). Per-instance variation must go through
attributes, not material swaps, or the batch is lost. The forest/crowd/field that runs.

---

## Corpus expansion — the owner's two-agent research, folded 2026-07-19

The owner ran two agents back-and-forth to fill each other's gaps and handed over the compiled result.
Reduced here to the **net-new, openable** sources per technique (duplicates + showcase-only links dropped).
Two long-standing partials in `GAPS.md` are **closed** by this pass — flagged ★.

**1 · GPGPU particles.** `three.js/examples → webgpu_tsl_compute_attractors_particles.html` **[OSS]** (canonical
TSL compute attractors) · `webgpufundamentals.org` **[DOCS/CODE-TUT]** (storage buffers, compute dispatch,
ping-pong) · `gpuweb/webgpu-samples` **[OSS]** · Utsubo AOI-01 MLS-MPM 65k-particle WebGPU
(`works.utsubo.com/labs/aoi-01`) **[CODE-TUT]** · `gkjohnson/three-gpu-particle-system`,
`FarazzShaikh/three-custom-shader-material` (inject GPGPU into stock materials) **[OSS]**.

**2 · TSL + WebGPU.** ★ `threejs.org/docs → Transpiler` **[DOCS]** — the official **GLSL→TSL transpiler**;
NodeBuilder encodes the graph to WGSL *or* GLSL, so one source targets both backends · three.js PR #28620
StorageBuffer-as-attribute **[OSS]** (compute buffer → vertex attr, CPU-free vertex morph) · `Orillusion`
WebGPU engine · `repalash/threepipe` `GBufferRenderPass.ts` **[OSS]** production G-Buffer pass.

**3 · Deferred + G-Buffer + outlines.** ★ **The Monolith build write-up** — Ethan Chiu, Codrops 2025-11-29,
`tympanus.net/codrops/2025/11/29/building-the-monolith-composable-rendering-systems-for-a-13-scene-webgl-epic/`
**[PAPER]** — the deepest single reference: deferred pipeline in R3F, normal-buffer sampled for Moebius-style
outlines consistent across 13 scenes · `N8python/n8ao` **[OSS]** advanced SSAO sampling G-Buffer normal/depth.

**4 · Raymarching / SDF.** `mercury.sexy/hg_sdf` **[PAPER]** SDF library (ops, soft shadows) ·
`MatiasGF/three-raymarching` **[OSS]** SDF-in-a-box confined to a mesh volume · Maxime Heckel "On Shaping
Light" **[CODE-TUT]** volumetric raymarching in post.

**5 · Scroll wiring.** ★ **Trionn** — Codrops 2026-07-15, "coordinating GSAP, Three.js, Lenis and Web Audio"
**[PAPER]** — the multi-signal orchestration reference · `jonathanlurie/three-camera-path` **[OSS]** scroll →
Catmull-Rom camera spline with look-ahead · `martinlaxenaire/curtainsjs` **[OSS]** jitter-free DOM↔canvas sync.

**6 · Spring / physics camera.** `yomotsu/camera-controls` **[OSS]** — industry-standard damped camera
(collision, spring-back) · `pmndrs/maath` `easing.ts` **[OSS]** Unity SmoothDamp for Vector3/Euler/Color
(interruptible, refresh-rate independent) · Rory Driscoll "Frame-rate-independent damping using lerp"
**[PAPER]** the math behind `THREE.MathUtils.damp`.

**7 · Physics-nav world.** `gkjohnson/three-mesh-bvh` **[OSS]** — the BVH that makes fast raycast/collision
against 1M+ triangles possible (the real enabler under explorable worlds) · `pmndrs/react-three-rapier`
character-controller example **[OSS]**.

**8 · Matcap.** `keijiro/TestMatCap` **[OSS]** — canonical normal→view-space mapping math (Unity, but it's
the formula every three.js matcap uses) · PlayCanvas area-lights (LTC) **[PAPER]** luxury lighting cheaply.

**9 · Terrain.** `IceCreamYou/THREE.Terrain` **[OSS]** procedural heightmap engine + LOD · `jeri-skaz/three-skies`
**[OSS]** Rayleigh/Mie atmospheric scattering for cinematic fog · Mapbox "Martini" terrain mesh **[OSS]** DEM
decode + LOD · IQ `fbmterrain` **[PAPER]**.

**10 · 2D-over-3D / object match.** ★ `martinlaxenaire/curtainsjs` **[OSS]** — `getBoundingClientRect()` →
exact plane scale/position so a WebGL plane covers a DOM element (the Monolith-style swap, the closest
canonical how) · `pmndrs/drei` `<Html>` **[DOCS]** projective pin of DOM to a 3D coord · Codrops depth-map
displacement parallax (2021-05-04) **[CODE-TUT]** extrude flat art via a depth map.

**11 · Instancing.** `three.js BatchedMesh` (PR #28753) **[OSS]** the modern batching primitive ·
`emmelleppi/three-instanced-mesh-custom-material` **[OSS]** per-instance data (colour, time-offset) in one draw.

**12 · Transition kit.** ★ `gl-transitions/gl-transitions` **[OSS]** 100+ GLSL wipes/masks/dissolves ·
**The Monolith transition system** (same Codrops paper as #3) **[PAPER]** wipes · zoom-blur · **2D→3D object
match** (2D = projected texture on a 3D proxy; at the transition the camera FOV+pos snap to the illustration
perspective and a shader morph dissolves plane→high-poly asset) · ★ `racpast/themonolithproject.net` **[OSS]**
a scrape/mirror of the actual Monolith site — the real transition shaders + perspective-snap logic to read ·
The Sleepers (Codrops 2026-07-10) **[PAPER]** noise-driven vertex swirl + depth fog.

**Multi-scene film orchestration (the other closed partial).** `Jam3/bigwheel` **[OSS]** the formal
`init()/show()/hide()` lifecycle for sequencing 10+ discrete 3D scenes · `Theatre.js` **[OSS]** visual-timeline
orchestration driving preload + property updates · makemepulse **NanoGL** state management + Needle scene
streaming (lazy-load + per-scene dispose) — together these are enough to build the scene-management engine
that the Monolith paper leaves out.

---

## How this file is used

- **An agent building a scene** opens the technique here, follows the source to real code, and implements
  the *documented* method — not a median guess. That is what "sourced engineering" means one layer below
  the identity layer.
- **A style graduates** into `04-webgl/STYLES.md` when its archetype's techniques are all sourced here (or
  taught by the owner) — see the updated graduation rule in `ARCHETYPES.md` / `README.md`.
- **What isn't fully sourced** is in `GAPS.md`, with the specific question for the owner. Everything above
  is at least a real, openable source; the gaps file is the short honest list of what isn't.
- **2026-07-19 update.** The owner's two-agent research corpus (reduced into the "Corpus expansion" section
  above) closed the last two partials: the 2D↔3D object-match transition and multi-scene film orchestration
  are now sourced, not just first-principles guesses. `GAPS.md` reflects this — nothing is blocked on the
  owner.

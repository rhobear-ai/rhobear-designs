# STACK — the 2026 defaults, with the reasoning

What the framework emits when it builds a scroll-scene, and why. This is the file a future scene
generator reads for *"what libraries, what renderer, what shader path."* Every default has a reason and
an exemplar from `REFERENCE-SITES.md`; override any of them per project, but override on purpose, not by
reaching for what a model shipped last.

> **The stack is part of the procedure, not the seed.** Two brands built on this identical stack look
> nothing alike, because the seed differs. Picking a *different* stack per client is not variety — it
> is drift. Vary the seed; hold the stack.

---

## The defaults

| Layer | Default | Reason | Exemplar |
|---|---|---|---|
| **Renderer** | Three.js **WebGPU** renderer with automatic **WebGL2 fallback** (`three/webgpu`) | production since r171 (Sept 2025), ~95% WebGPU coverage, the other ~5% fall back automatically with no extra code | IVRESS |
| **Shaders** | **TSL** (Three Shading Language) | author once, compile to WGSL + GLSL — one shader codebase across both backends, no fork | IVRESS |
| **Smooth-scroll** | **Lenis** | normalises wheel/trackpad/touch into one eased scroll value — the clean signal the camera reads | Cartier |
| **Scroll mapping** | **GSAP ScrollTrigger** (scrub + snap) | maps scroll → beat progress, snaps to beats; we emit `rhobear:beat` / `rhobear:snapped` off it | Shopify Editions, Cartier |
| **Scene authoring** | **vanilla Three.js** for one bespoke continuous scene; **R3F** when component-shaped | a single continuous camera-journey is imperative by nature; R3F earns its reconciler only when the scene is a tree of reusable components and the team is React | Monolith uses R3F (13 discrete scenes = component-shaped); ours is one continuous world = vanilla |
| **Motion** | **springs** (custom, per-axis) on camera; **lerp** only on colour/opacity | the grep-gated law (`SCENE.md`, T1) | Oryzo |
| **Physics** | **none by default**; Cannon.js / Rapier **only** for the physics-nav archetype | most scroll scenes fake weight with springs; an engine is real cost added only when navigation *is* physics | Bruno Simon (only site here that needs one) |

> **This table is the WebGL scroll-scene stack — it moves the *camera*.** The other motion layer, which
> moves the **DOM/SVG elements** themselves (vector draws, block/layout/gesture, physics on cards & lists),
> is a separate held stack: **`MOTION-DOM.md`** — **anime.js** (vector/timelines) · **Motion** (block/layout/
> gesture/scroll) · **react-spring** (element physics), all MIT. A modern site uses both: this stack for the
> world, that one for the elements. Pick the DOM library from the *frame's implied motion*, never by habit.

---

## The two decisions worth explaining

### WebGPU + TSL over committing to one backend

The old trade was: WebGL2 for reach, or WebGPU for power — pick one, and if you wanted both you
maintained two shader codebases. TSL removes the trade. You author each shader once; Three.js targets
WebGPU where the browser has it and WebGL2 where it doesn't, and the renderer chooses at runtime with no
branch in your code. So the default is **both**: WebGPU's power for the 95%, WebGL2's reach for the 5%,
one codebase. IVRESS is the proof it's production-real, not a demo. The only discipline it demands: a
few TSL nodes differ across backends, so the **WebGL2 fallback path is verified, not assumed** (a gate
in `TECHNIQUES.md`).

### vanilla vs R3F — decided by scene shape, not preference

R3F is Three.js as React components. It is the right call when the scene is **a tree of reusable
components** and the team already lives in React — Monolith's thirteen discrete scenes are naturally
component-shaped, and R3F pays for its reconciler there. A **single bespoke continuous world** — one
terrain, one camera path, one progress float, the RHOBEAR camera-journey — is imperative by nature, and
wrapping it in a reconciler adds a layer between you and the frame loop for no structural win. So the
rule is **scene shape decides**: component-shaped → R3F; one continuous scene → vanilla. Not taste, not
what shipped last.

---

## What the generator emits (forward note)

When Phase 2 of the product plan builds a scene generator, this file is its contract. From `beats.json`
+ the chosen archetype it emits:

- a `three/webgpu` renderer with the fallback path
- TSL materials (composable — shader chunks, per `TECHNIQUES.md`)
- Lenis + a ScrollTrigger scrub/snap wired to the beats, firing our CustomEvents
- per-axis camera springs (never a lerp on camera) with the FOV spring slower than position
- the mobile branch: **no renderer** on touch/reduced-motion — the composed static 9:16 sequence
  (`TRANSITIONS.md`), not a throttled canvas
- physics only if the archetype is physics-nav

**The generator never emits a stack choice as a variable the seed controls.** The seed controls the
*look*; the stack is fixed procedure. That separation is the whole reason two seeds on this stack can't
converge.

---

## Overrides (legitimate ones)

- **Physics-nav archetype** → add Rapier (preferred over Cannon.js for new work) and matcap materials.
- **A scene that genuinely needs many dynamic lights** → deferred rendering (`TECHNIQUES.md`), justified
  past the light-count threshold, not below it.
- **A brand that must run on ancient hardware** → force the WebGL2 path and drop WebGPU-only effects;
  state it in the brief, because it costs some effects.

Everything else is the default, held, so the variance stays in the seed where it belongs.

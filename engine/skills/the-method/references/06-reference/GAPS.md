# GAPS — what's sourced, and the short honest list of what isn't

The owner's rule: *"if you're missing gaps — hey, I don't see how they did this — then you can come to me,
because I can't teach that. Otherwise go do the rest. Some of those I don't actually know how to do, but I
can read the papers and learn if you need me to."*

So this file is the escalation list, and it is deliberately short, because most of the engineering **was**
findable. It has three tiers: **sourced** (real openable code/paper — done), **partial** (mechanism is
clear, the *specific* production method is thinly documented — a judgment call whether that's enough), and
**gap** (I genuinely can't find the how — your move: point me at a paper, or we scope it out).

---

## Sourced — done, no action needed

Every one of these has a real, openable source in `SOURCES.md` (OSS repo, canonical paper, docs, or a
tutorial that ships code). They do **not** need you to teach them:

- **GPGPU particles** — Three.js `GPUComputationRenderer` + Codrops/Journey tutorials + repos.
- **TSL + WebGPU pipeline** (materials, compute, GPGPU, post/outlines) — Maxime Heckel field guide.
- **Deferred rendering + G-Buffer + outlines** — Bruno Simon's open deferred repo + Mozilla Hacks.
- **Raymarching / SDF** (incl. the ray-marched-sphere transition) — Inigo Quilez, the canon.
- **Scroll wiring** (Lenis + GSAP ScrollTrigger, the exact integration) — Lenis OSS + GSAP docs.
- **Physics-nav world** — Bruno Simon's portfolio is fully MIT-open (Blender files + devlogs); Rapier.
- **Matcap** — built-in `MeshMatcapMaterial`.
- **Terrain flythrough** (our camera-journey) — Maxime Heckel's vaporwave build is a worked example.
- **2D-illustration-over-3D parallax** (editorial archetype) — Codrops DOM→WebGL parallax.
- **Instancing** — built-in `InstancedMesh`.
- **Standard transition mechanics** (wipe, zoom-blur, mask, radial-on-world-position) — all are ordinary
  full-screen shader passes; sourced via the general TSL/GLSL post material.

That's eight archetypes' worth of technique, all with real code behind them.

---

## Closed 2026-07-19 — the owner's two-agent research corpus cracked both partials

The owner ran two agents hunting specifically for these two gaps and handed over the result
(reduced into `SOURCES.md` §10 and §"Multi-scene film orchestration"). Moved from partial → sourced:

### 1 · 2D↔3D object-matching transition (Monolith) — CLOSED

**Now have.** `martinlaxenaire/curtainsjs` **[OSS]** — the real mechanism: `getBoundingClientRect()` on
the DOM element gives the exact rect; a WebGL plane is sized/positioned to cover it precisely, so a
flat illustrated element and its 3D twin can share a screen-space silhouette without hand-authored
registration. At the transition moment, camera FOV+position snap to the illustration's perspective and
a shader morph dissolves the plane into the high-poly asset (confirmed against `racpast/themonolithproject.net`,
a scrape of the actual site's transition shaders). Buildable as documented, not a from-first-principles guess.

### 2 · Multi-scene film orchestration at 13-scene scale (Monolith) — CLOSED

**Now have.** `Jam3/bigwheel` **[OSS]** — the formal `init()/show()/hide()` lifecycle for sequencing 10+
discrete 3D scenes (preload → active → dispose), the missing piece the Codrops write-up didn't cover.
Paired with `Theatre.js` **[OSS]** (visual-timeline orchestration driving preload + property updates,
used by Unseen Studio for "The Symphony of Vines") and the Trionn Codrops case study (2026-07-15,
GSAP+Three.js+Lenis+Web Audio multi-signal coordination, live at `trionn.com`). Together: a real,
sourced scene-management engine, not just the four render systems. Still not needed for our current
scope (rooms/alcoves covers the maximal case we ship) — but if the full cinematic-multi-scene archetype
ever becomes a product mode, the engineering is now sourced, not a gap.

---

## Partial — mechanism clear, exact production thin (your judgment)

### 1 · Sound-coupled cinematic timing (Monolith)

**What I have.** Howler.js for audio; an analyser can drive reactive parameters.
**What's thin.** This is mostly *craft*, not engineering — the art of syncing motion to sound isn't a paper.
**My call:** treat as polish within a taught style, not a technique to source. Not a real gap.

---

## Gap — genuinely can't source the "how" (your move)

**None, currently.** After two research passes (mine, then the owner's two-agent corpus), there is no
archetype technique where I hit a hard "I have no idea how they did this and can find nothing." The
sound-coupling item above is the only thing left in "partial," and it's craft, not engineering.

Otherwise the honest status is: **the engineering for all eight archetypes plus the object-match
transition and multi-scene orchestration is sourced; nothing is blocked on you.**

---

## Not gaps — yours, already taught (for the record)

So we don't mistake taste for a missing source. These are not researchable and don't belong here except to
name the boundary:

- The **spring/damping feel** (the exact mass/overshoot that makes motion cinematic) — your taught motion
  method (`04-webgl/SCENE.md`).
- The **reveal-binding** (a mechanic bound to what the brand *is*) — `04-webgl/STYLES.md`.
- The **image-first curation** (the nano-banana trick; the picture leads) — `03-assets/IMAGERY.md`.
- **Which archetype fits which brand** — the brief-stage judgment, downstream of the seed.

The engineering is sourced so you don't teach it. The taste stays yours, because that is the part a
framework can't buy off a repo — and it's the reason ours produces a premium result and a median model's
doesn't.

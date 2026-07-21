# MOTION-DOM — the DOM/UI animation layer (2026 defaults)

`STACK.md` fixes the **WebGL scroll-scene** stack — how the *camera* moves through a 3D world. This file
fixes the **other** motion layer: animation on real **DOM/SVG** elements — the vector draws, the block/
layout transitions, the physics on cards and lists that make a modern site feel alive without a canvas.
Three libraries, one job each, **all MIT** (the code is ours to bundle in generated sites; we keep a
`NOTICE`). Same law as the rest of the framework: **fixed procedure, sourced inputs** — the seed varies
the look, the stack is held.

> **What we take, and how (licensing).** All three ship under **MIT** — free to bundle in commercial
> output, modify, redistribute, with attribution in a `NOTICE`/`THIRD-PARTY` file. What we *take*: the
> **libraries themselves** (the code) and their **MIT-licensed code examples** (as pattern seeds). What we
> do **not** do: copy their documentation *prose* verbatim into the corpus — doc text is copyrighted. We
> **distill** it through the ingestion pipeline (extract engineering facts to schema, never re-print prose —
> `INGESTION.md`). And we do **not** take **Motion+** (paid): its 330+ premium examples, Cursor/Ticker
> components, and transition editor are a subscription — out of scope, never bundled.

---

## The three, and when each is the right tool

| Library | The layer it owns | Pick it when the frame implies… | License |
|---|---|---|---|
| **anime.js** (v4) | **vector / SVG + orchestrated timelines** — CSS props, SVG, DOM attrs, JS objects | a **line-draw / logo morph / path animation**, a staggered reveal from a point, a hand-tuned multi-target **timeline** | MIT |
| **Motion** (motion.dev, ex-Framer-Motion) | **block / layout / gesture + scroll** — hybrid engine, 120fps GPU-accelerated | a **component entering/leaving** (`AnimatePresence`), a **layout shift** (reflow that should tween), **hover/tap/drag** feedback, **scroll-linked** reveals | MIT (core). Motion+ = paid, skip |
| **react-spring** | **physics springs on real elements** — spring-first, velocity-aware, interruptible | motion that must feel **physical and interruptible**: drag-to-settle, gesture-follow, list reordering that carries momentum; also pairs with react-three-fiber | MIT |

**The pick rule (decision tree, not taste):**
1. Is it **SVG / a path / a draw / a precisely-sequenced timeline**? → **anime.js**.
2. Is it a **UI element appearing, leaving, re-laying-out, or reacting to hover/tap/drag/scroll**? → **Motion**.
3. Must it feel **physical, momentum-carrying, interruptible mid-flight** (a gesture the user is dragging)? → **react-spring**.
   Overlap is real (Motion also has springs; react-spring also does enter/exit) — resolve by the *primary*
   quality above, and **do not mix two on the same element** (competing rAF loops = jank).

> **Reduced-motion is a gate, not an option.** Every one of these must respect
> `prefers-reduced-motion` — swap animations for instant state or a crossfade. Same discipline as the
> WebGL layer's mobile/no-renderer branch (`STACK.md`).

---

## anime.js v4 — vector & timelines
- **Install:** `npm i animejs` · `import { animate, stagger, createTimeline, svg } from 'animejs'`.
- **Core API:** `animate(targets, {…props, ease, duration, delay})`; `stagger(65, { from: 'center' })`;
  `createTimeline()` → `.add(...)` for sequenced multi-target choreography; `svg.createDrawable()` /
  morphing / motion-path for line art and logo reveals; animates CSS, SVG attrs, DOM attrs, and plain JS
  objects (counters, values).
- **Best at:** logo/line **draw-on**, SVG **morph**, number counters, and any moment that needs *exact*
  sequencing across many targets. This is the framework's default for the **mark reveal** and hero SVG.
- **Free resources:** docs `animejs.com/documentation`; runnable examples via the repo's `open:examples`;
  full MIT source on GitHub (`juliangarnier/anime`).

## Motion (motion.dev) — blocks, layout, gestures, scroll
- **Install:** `npm i motion`. **Vanilla:** `import { animate, scroll, inView, stagger, spring } from 'motion'`.
  **React:** `import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'`.
- **Core API:** `animate(el, keyframes, { type:'spring' | ease })`; `scroll(animate(...), { target, offset })`
  for scroll-linked; `inView(el, cb)` for enter-on-view; `<motion.div layout>` + `AnimatePresence` for
  automatic **layout** and **exit** animations; gesture props `whileHover/whileTap/drag`.
- **Best at:** the everyday UI motion of a modern site — cards/sections revealing on scroll, modals and
  list items entering/leaving, layout that tweens when it reflows, tactile hover/drag. The **default block
  layer.**
- **Free vs paid:** the **library is MIT/free** (React + JS + Vue, hybrid 120fps GPU engine, tree-shakable).
  **Motion+** (examples/tutorials/Cursor/Ticker/transition-editor) is a **paid** subscription — not ours.

## react-spring — physics on real elements
- **Install:** `npm i @react-spring/web` (`@react-spring/three` for r3f).
- **Core API:** `useSpring` (one element), `useSprings` (many), `useTrail` (staggered follow), `useTransition`
  (mount/unmount with physics), `useChain` (sequence spring groups), and the `animated.*` wrapper that
  applies spring values to real DOM/SVG.
- **Best at:** motion that has to feel **alive and interruptible** — a dragged sheet that settles, a toggle
  with overshoot, a list that reorders with momentum. Spring-**first** (config by tension/friction/mass, not
  duration), so it reacts to velocity mid-gesture. Overlaps r3f, so it's the bridge when DOM motion must
  match the 3D layer.
- **Free resources:** docs `react-spring.dev`; MIT source on GitHub (`pmndrs/react-spring`).

---

## Image-first mapping (how the frames choose the lib)
THE METHOD is image-first: the generated frames *imply* motion, and this table turns that implication into a
library, so the agent never picks by habit:
- a **mark / line-art / SVG** frame that should *draw or morph* → **anime.js**
- a **card, panel, modal, nav, list** that should *appear, leave, or re-lay-out on scroll/interaction* → **Motion**
- a **draggable / springy / momentum** interaction the user *controls* → **react-spring**
- **camera movement through a 3D scene** → not here — that's `STACK.md` (Three.js springs), never these.

## Sources (for deeper ingestion — feed the pipeline, don't copy)
Drop these into `_intake/raw/` and run **MAP → REDUCE** (`INGESTION.md`) to graduate specific recipes into
`SOURCES.md`; the MAP step extracts *engineering facts to schema*, it does not reprint docs:
- anime.js — `github.com/juliangarnier/anime` [OSS] · `animejs.com/documentation` [DOCS]
- Motion — `github.com/motiondivision/motion` [OSS] · `motion.dev/docs` [DOCS] (free pages only; not Motion+)
- react-spring — `github.com/pmndrs/react-spring` [OSS] · `react-spring.dev` [DOCS]

**Forward note (generator contract):** when the Phase-2 generator emits a page, it selects the DOM-motion
library per the pick rule above from the frame's implied motion, bundles the MIT lib, adds the attribution
to `NOTICE`, and gates every animation behind `prefers-reduced-motion`. The seed never selects the library —
the *motion in the picture* does.

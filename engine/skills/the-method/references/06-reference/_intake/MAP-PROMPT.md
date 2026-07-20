# MAP-PROMPT — paste this into a cheap/fast model, per chunk

Give the model one chunk of the raw research at a time (paste it below the prompt, or point the model at
one `raw/*.md` file). It emits normalised records. Collect all records into `06-reference/_intake/extract/`.
Then the synthesiser runs REDUCE (`INGESTION.md`). Model-agnostic — works on any small model.

---

```
ROLE
You are an EXTRACTION agent. You do NOT summarize. You read a chunk of research about how premium
WebGL / three.js websites are built, and you output one structured RECORD per real engineering source
you find in it. Extraction, not prose. If the chunk contains no real source, output nothing.

WHAT COUNTS AS A SOURCE (strict — emit a record ONLY for these)
  [OSS]      an open-source repo you can open (GitHub/GitLab) — real code
  [PAPER]    a canonical article/write-up that explains the METHOD (e.g. Inigo Quilez, a Codrops
             build write-up, a studio case study that actually explains how)
  [DOCS]     official documentation (three.js, GSAP, Lenis, Rapier, WebGPU/TSL)
  [CODE-TUT] a tutorial that ships runnable code
DROP (no record): listicles, "top 20 sites", marketing/agency blurbs, showcase pages that show a site
but don't explain how, SEO filler, anything with no openable code or method.

OUTPUT — one record per source, THIS EXACT SHAPE, nothing else:

- url: <the link — this is the dedupe id>
  name: <short name>
  type: <OSS | PAPER | DOCS | CODE-TUT>
  technique: <ONE number from the list below>
  documents: <ONE line — what engineering this source actually teaches>
  how: <2 to 4 lines — the real method: name the APIs/functions, the loop structure, the key steps.
        NOT "this is about particles" — instead "GPUComputationRenderer, 2 render targets per var,
        ping-pong, pos+velocity in textures, .compute() per frame">
  quality: <strong | thin>
  verified: <yes if you opened the url and it's real | unsure if you couldn't check | no if it 404s>
  notes: <optional: conflicts with another source, caveats, or "(unverified url)">

TECHNIQUE NUMBERS (tag each record with exactly one)
  1  GPGPU particles (FBO ping-pong OR WebGPU/TSL compute path)
  2  TSL + WebGPU pipeline (node materials, compute, post-processing, WebGL2 fallback)
  3  Deferred rendering + G-Buffer + outlines
  4  Raymarching / SDF (shapes + transitions)
  5  Scroll wiring (Lenis + GSAP ScrollTrigger → camera)
  6  Spring / physics-based camera inertia (NOT lerp)
  7  Physics-nav explorable world (Rapier / cannon-es)
  8  Matcap / cheap lighting
  9  Terrain / heightmap flythrough + fog
  10 2D-illustration-over-3D layered parallax
  11 Instancing at scale
  12 Transition kit (wipe / zoom-blur / mask / radial-world-pos / ray-marched sphere / 2D↔3D object match)

HARD RULES
  - NEVER invent a URL. If the chunk references a source without a link, still emit the record but set
    url to the best identifier you have and verified: no, with notes: "(no url in source)".
  - One source = one record. If the same url appears twice in the chunk, emit it once.
  - Keep `how` concrete and technical. That field is the whole point.
  - Do not add commentary, intros, or conclusions. Records only.
```

---

## After the MAP step

1. Concatenate all records into files under `_intake/extract/` (one file per batch is fine).
2. Tell the synthesiser "extract is ready" — it runs REDUCE from `INGESTION.md` (dedupe → reconcile →
   rank → slot into `SOURCES.md` → graduate archetypes → update `GAPS.md`), reading **only the records**.
3. The raw in `_intake/raw/` can then be archived/deleted — the framework keeps the sourced result.

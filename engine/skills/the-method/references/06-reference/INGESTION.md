# INGESTION — turning a too-big research corpus into the framework

The owner compiled a large body of engineering research (two agents going back and forth filling each
other's gaps). It is bigger than any single model's context — so it cannot be "read through," and it must
not be turned into prose summaries (every model shortens differently; two summary passes never agree, and
the drift becomes the framework's inconsistency). This file is the pipeline that turns that corpus into
sourced framework content **consistently**.

> **The principle: extract to a fixed schema, never summarise to prose.** Consistency is engineered by the
> schema + the gates, not by a model's judgment — the same law as the whole framework: *fixed procedure,
> sourced inputs*. A summary is a lossy re-write; a schema record is a normalised, dedupable, mergeable
> fact.

---

## The shape: map-reduce

| Step | Who | Does | Input | Output |
|---|---|---|---|---|
| **MAP** | cheap/fast models (the owner's agents — never a harness subagent) | **extract** each source into fixed-schema records | a chunk of the raw corpus | normalised records |
| **VERIFY** | cheap model or a fetch | check each URL resolves; flag fabrications | records | records + `verified` |
| **REDUCE** | Claude (the synthesiser) | dedupe · reconcile conflicts · rank · slot · graduate | **only the records** (never the raw) | updated `SOURCES.md` + graduation decisions |

**Why this answers "can it fit?"** The raw corpus **never enters the synthesiser's context.** Cheap models
read it in chunks and emit small uniform records; the synthesiser reads only the compact record index,
which fits. Cheap models do the *reading*; the synthesiser does the *judgment*.

---

## The extraction schema (the whole trick)

One record per source, emitted by the MAP step. Fields are fixed so 200 records from five different models
are still one clean table:

```
- url:        the source link — THE dedupe id (same url = same source)
- name:       short human name
- type:       OSS | PAPER | DOCS | CODE-TUT   (nothing else counts — see the quality bar)
- technique:  one of the numbered techniques below (or an archetype name)
- documents:  ONE line — what engineering this source actually teaches
- how:        2–4 lines — the real method: APIs named, the loop structure, the key steps
- quality:    strong | thin
- verified:   yes | no | unsure   (did the url resolve / is the claim checkable?)
- notes:      conflicts with another record, caveats, "(unverified)" URLs
```

The `how` field is the point: not "this is about particles" but "GPUComputationRenderer, two render targets
per variable, ping-pong, position+velocity in textures, `.compute()` per frame." Extraction, not vibes.

**Technique taxonomy (tag every record with one):**

```
1  GPGPU particles (FBO ping-pong AND WebGPU/TSL compute path)
2  TSL + WebGPU pipeline (node materials, compute, post-processing, WebGL2 fallback)
3  Deferred rendering + G-Buffer + outlines
4  Raymarching / SDF (shapes + transitions)
5  Scroll wiring (Lenis + GSAP ScrollTrigger → camera)
6  Spring / physics-based camera inertia (not lerp)
7  Physics-nav explorable world (Rapier / cannon-es)
8  Matcap / cheap lighting
9  Terrain / heightmap flythrough + fog
10 2D-illustration-over-3D layered parallax
11 Instancing at scale
12 Transition kit (wipe · zoom-blur · mask · radial-world-pos · ray-marched sphere · 2D↔3D object match)
```

---

## The quality bar (MAP enforces it)

A record is emitted **only** if the source is `[OSS]` (openable repo), `[PAPER]` (canonical write-up that
explains the method), `[DOCS]` (official docs), or `[CODE-TUT]` (tutorial that ships runnable code).
Listicles, marketing blurbs, showcase-only pages, SEO filler → **dropped, no record.** A source that shows
a site without explaining the how is not a source.

---

## REDUCE — what the synthesiser does with the records

1. **Dedupe** by url. Merge duplicate finds (keep the richest `how`).
2. **Reconcile conflicts.** Two agents disagree on the method → prefer the one with an openable `[OSS]`/`[PAPER]`
   source; if unresolved, keep both and flag in `GAPS.md`.
3. **Rank** per technique; keep the strongest 3–8, cut the thin ones.
4. **Slot** into `SOURCES.md` under the matching technique/archetype section.
5. **Verify-before-graduate.** Re-check (fetch) the sources that would *graduate* an archetype — those must
   be `verified: yes`, not cheap-model-asserted.
6. **Graduate.** For each archetype in `ARCHETYPES.md`, if all its techniques are now sourced, mark it
   **graduation-ready** and (on the owner's go, or when taught) write the gated procedure into
   `04-webgl/STYLES.md`. Update `GAPS.md`: what's now closed, what's still thin.
7. **Consistency arbiter.** "It works" is decided by `00-method/TRANSFER-TESTS.md` — the floor model (Sonnet
   5), blind, reproduces the archetype from the framework. Sourcing feeds the test; the test is the verdict.

---

## Folder convention

```
06-reference/
  _intake/
    MAP-PROMPT.md   ← paste-ready extraction prompt for the cheap models (the schema, as a prompt)
    raw/            ← the owner drops the compiled research here (raw-01.md, raw-02.md, …)
    extract/        ← MAP output — the normalised records (extract-01.md, …)
```

`raw/` and `extract/` are working directories; once REDUCE has folded the records into `SOURCES.md`, the
raw can be archived or deleted (the framework keeps the *sourced result*, not the intake — the no-litter
rule). Nothing in `_intake/` is framework canon; `SOURCES.md` is.

---

## Resume instruction (survives compaction)

**On wake, if this pipeline is mid-flight:**

1. Read this file and `SOURCES.md`.
2. If `_intake/extract/` has records → run **REDUCE** from the records. **Do NOT load `_intake/raw/` into
   context** — that is what blew the budget; the records exist so you never have to.
3. If `_intake/extract/` is empty but `_intake/raw/` has data → the MAP step hasn't run; hand the owner
   `_intake/MAP-PROMPT.md` to run on his cheap models against the raw chunks, then REDUCE.
4. Output of a full pass = updated `SOURCES.md`, graduation decisions in `ARCHETYPES.md`, closed items in
   `GAPS.md`. The next agent should be able to pick up exactly here.

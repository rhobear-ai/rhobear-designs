# TRANSITIONS — the movement between the shots

Beats are the easy part. Anyone can park a camera at nine positions. **The product is the travel
between them**, and it is where scroll sites are won or lost.

The failure is always the same and it has a name: the camera *translates* correctly and nothing
*feels* like it moved. Position is interpolated, the world holds still, and the page reads as a
slideshow with a 3D background. Fixing it is not "add more animation" — it is three specific
systems working at once.

> **Diagnosis:** if the scene feels like a slideshow, the camera is being lerped, the environment
> is static between beats, and the subject has no reaction to its own motion. All three, usually.

---

## The three systems

### 1 · The camera has mass

Springs, not lerp. Full spec in `SCENE.md`. The short version: one spring per axis, tuned
differently, and **the FOV spring slower than the position springs** so the lens lags the body
under acceleration. That lag is the entire cinematic effect.

### 2 · The environment travels with you

The world changes continuously across the whole scroll, not at beat boundaries. One `progress`
float drives every atmospheric property at once — and *at once* is the operative word. Moving fog
without moving the sun produces a world lit by nothing, and the eye catches it instantly even when
it cannot name it.

Declare an atmosphere state per beat and interpolate all three channels together:

```js
const SKY = [
  { fog: '#1A2D4A', sky: '#0D1520', sun: '#FFF0CC' },  // beat 0 — cold, high, blue
  { fog: '#1E3040', sky: '#122035', sun: '#FFD080' },
  { fog: '#2A1F15', sky: '#1A1208', sun: '#FF9930' },  // warm shift begins
  { fog: '#0D1520', sky: '#080E18', sun: '#C87020' },  // the dark beat — see §3
  { fog: '#3A2D1A', sky: '#2A1A08', sun: '#E8B840' },
  { fog: '#1A1A0D', sky: '#0D0D05', sun: '#FFD060' },  // final — warm, low, close
]

scene.fog.color.lerpColors(from.fog, to.fog, ease)
scene.background.lerpColors(from.sky, to.sky, ease)
sunLight.color.lerpColors(from.sun, to.sun, ease)
```

**Environment must shift monotonically** across the run — cold→warm, high→low, open→intimate.
That single continuous gradient is what makes ninety seconds of scrolling feel like a journey
instead of a carousel. Ground texture blends on the same float; particles change colour *and*
behaviour on it (falling fast and white up high, drifting slow and warm down low).

The effect to aim for: **the subject is progressively swallowed by its environment.** Not moved
through a set of backdrops — absorbed by one continuous world that is changing around it.

### 3 · The subject reacts to being moved

A subject that traverses without responding to its own motion is a sprite on a path. Drive its
reaction from camera **velocity**, not position — velocity is what a body actually feels:

```js
const v = Math.abs(camY.velocity)

subject.rotation.z = lerp(subject.rotation.z, v * -0.04, 0.1)   // leans into the descent
subject.position.y = Math.sin(now * 0.001) * 0.05 * (1 + v*0.5) // gait amplifies with speed
head.rotation.y    = lerp(head.rotation.y, cardVisible ? 0.3 : 0, 0.05) // looks at what matters
```

The head turn is small and does most of the work. A subject that looks at the thing the viewer is
being shown creates the impression of intent, and intent is the difference between a character and
an asset.

---

## The peak beat — one per scene

Exactly one beat gets the full treatment. Everything converges on it; the rest of the scene exists
to make it land.

```js
if (progress > 0.50 && progress < 0.62) {
  const t = (progress - 0.50) / 0.12

  fovSpring.target  = lerp(54, 35, t)        // squeeze — the intake of breath
  scene.fog.density = lerp(0.018, 0.002, t)  // fog LIFTS — world goes hyper-clear
  rimLight.intensity= lerp(2, 6, t)          // rim blooms

  if (t > 0.85) {                            // heartbeat, only at the peak
    camera.position.x += Math.sin(now * 0.008) * 0.015
    camera.position.y += Math.cos(now * 0.011) * 0.008
  }
}
```

Note the counter-intuitive move: **fog lifts on the push-in.** Instinct says thicken it for drama.
Lifting it makes the world resolve as you approach — the viewer feels their own attention sharpen.
Thickening reads as a transition effect; lifting reads as focus.

The micro-shake is ±0.015 world units. Any larger and it reads as a camera fault rather than a
held breath.

---

## Storyboard the transitions, not just the beats

**This is the step everyone skips, and it is why transitions get invented at code time.**

Beats get storyboarded because they are obviously pictures. Transitions get described in prose —
"then it moves to the next section" — and prose has no opinion about what the middle looks like.
So the middle gets improvised in code, where it is expensive to change and nobody is looking at it
as a composition.

**Generate a still of the midpoint between every adjacent beat pair.** Nine beats → eight
transition frames. Each one answers: what does the halfway look like, and what is changing?

Each transition frame declares one **mechanic**:

| Mechanic | Looks like | Use when |
|---|---|---|
| Material wipe | one ground material giving way to the next along a diagonal seam | the environment changes character |
| Temperature flip | cool half of frame meeting warm half | the emotional register changes |
| Vignette close | frame edges darkening inward, subject filling more of it | approaching the peak beat |
| Bloom open | environment opening out, light flooding, subject smaller | releasing after the peak |
| Element rise | UI or object entering from below frame | a call to action arrives |

One mechanic per transition. Two mechanics at once cancel each other and read as a glitch.

### The wider transition kit — from the field

The five mechanics above are the camera-journey's own set (one continuous world, one camera). Other
archetypes — **rooms/alcoves**, **cinematic multi-scene** (`06-reference/ARCHETYPES.md`) — move between
*discrete* scenes, and the field has a larger kit for that cut. This is the menu from the Monolith build
(the most documented reference we have; `06-reference/REFERENCE-SITES.md` §10), and it is where a
room-to-room or scene-to-scene transition picks its one mechanic:

| Mechanic | Looks like | Reach for it when | Cost |
|---|---|---|---|
| **Wipe** | one scene pushed off along a seam by the next | a clean, legible cut between rooms | cheap |
| **Zoom-blur** | the outgoing scene rushes toward/away with radial blur | speed, momentum into the next beat | moderate |
| **2D↔3D object match** | an illustrated element morphs into its 3D twin (or back) | tying a flat hero to a dimensional scene (editorial archetype) | high — needs the matched pair authored |
| **Mask** | the next scene revealed through a shape/alpha | a branded shape reveal (a mark-shaped wipe) | cheap–moderate |
| **Radial on world-position** | the change spreads outward from a point in the world | a transition that emanates from the subject | moderate |
| **Ray-marched sphere (SDF)** | a procedural sphere grows/shrinks to swap scenes | a signature, geometry-free transition | fill-heavy — transitions only, not whole scenes (`06-reference/TECHNIQUES.md`) |

Same law as the five above: **one mechanic per transition**, storyboarded as a midpoint still first.
Two mechanics at once cancel and read as a glitch, whether the scene is continuous or cut.

The transition frames also become the **build check** at stage 8b: scrub to the midpoint, compare
against the approved still. If the built middle does not resemble the drawn middle, the transition
was improvised.

---

## Holds — the pause is part of the motion

Continuous scroll with no rest gives the viewer nothing to read. Snap to each beat, then hold:

```js
const HOLD = {
  hero: 0,           // never trap the entry
  standard: 4000,
  peak: 6000,        // the one that earns extra
  penultimate: 5000, // direct address / fourth-wall beat
  cta: 0,            // never trap the exit
}
```

**First and last beats never hold.** Trapping someone on arrival is the worst possible first
impression, and trapping them at the CTA is the worst possible last one.

**Holds are disabled entirely on touch.** A scroll lock on a phone reads as a broken page — the
user swipes, nothing happens, they leave. Desktop scroll is a deliberate act with a wheel or
trackpad; touch is a flick, and a flick that does nothing is a bug.

```js
const HOLD_DURATIONS = isMobile ? mapValues(HOLD, () => 0) : HOLD
```

---

## Mobile — a different deliverable, not a degraded one

**Mobile does not run the scene.** Skip WebGL initialisation entirely:

```js
if (window.matchMedia('(max-width: 768px)').matches) {
  initStaticSequence()          // no renderer, no GLTF, no loop
} else {
  new Scene(canvas)
}
```

A throttled canvas on a phone is worse than no canvas: it drains battery, janks under exactly the
gesture the design depends on, and looks broken rather than simple. Every device that fails the
tier check gets the static path — and that includes `prefers-reduced-motion` on desktop, so the
fallback is never optional and never untested.

The static sequence is **composed on purpose**: one 9:16 still per beat, portrait framing chosen
for portrait — not a 16:9 frame cropped. Pure CSS, no JS animation:

```css
.sequence { height: 100vh; overflow-y: scroll; scroll-snap-type: y mandatory; }
.frame    { height: 100vh; scroll-snap-align: start; position: relative; }
.frame img{ width: 100%; height: 100%; object-fit: cover; }
```

The environment gradient must survive into the stills. If the desktop scene travels cold→warm, the
portrait sequence travels cold→warm too — that continuity is most of what the scene was
communicating, and it costs nothing to keep.

**Gate:** the static sequence is reviewed as its own deliverable, at 9:16, on a phone. Not
approved by looking at the desktop frames and assuming.

---

## Motion anti-defaults

| Banned | Because |
|---|---|
| `lerp` on camera position, rotation, FOV | weightless — the signature failure |
| Environment static between beats | the world stops existing; slideshow |
| Subject that does not react to its own motion | sprite on a path, not a character |
| Two transition mechanics at once | they cancel; reads as a glitch |
| Every beat dramatic | nothing is dramatic; the peak has nothing to peak above |
| Fog thickening on a push-in | reads as an effect; lifting reads as focus |
| Holds on touch devices | swipe does nothing → user leaves |
| Holding the first or last beat | traps arrival and exit — the two worst places |
| Mobile running a throttled canvas | jank, battery, broken-looking |
| Transitions described in prose | improvised at code time, where changing them is expensive |

---

## Gates

```
T0  storyboard   a still for every beat AND every transition midpoint
T1  springs      grep: zero lerps on camera position / rotation / fov
T2  continuity   fog, sky, sun, ground, particles all on one progress float
T3  reaction     subject responds to camera VELOCITY, not position
T4  peak         exactly one beat with fov squeeze + fog lift + rim bloom
T5  holds        first/last = 0; touch = all 0
T6  mobile       static 9:16 sequence exists, composed portrait, reviewed on a phone
T7  fidelity     scrubbed midpoints match the approved transition stills
```

`T1` is a **script, not a grep** — a grep fails correct code that lerps a spring *target*, and a
gate that cries wolf gets switched off. See `SCENE.md` § S4 and `phase0/check-motion.mjs`.

`T6` is the one most likely to be skipped, and the one users are most likely to see.

**A third gate belongs here, learned the hard way:** `T8 — subject scale`. Camera positions must
be **subject-relative** (height above, distance behind), never fixed world coordinates. A subject
that travels 74 units through the scene while the camera sits at fixed world z swings its apparent
size by 5× — filling the frame at one beat, a speck at another. This is invisible frame by frame
and unmissable on a contact sheet, which is the argument for reviewing the sequence as one picture.

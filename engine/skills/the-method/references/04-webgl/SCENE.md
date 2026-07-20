# SCROLL-SCENE — WebGL as a design system layer

Every design-system format in the wild stops at HTML and CSS. Tokens describe colour, type,
spacing, radius — then the moment a scene has a camera, a light rig, a material, and a scroll
timeline, the system has nothing to say and the agent falls back on its median. Which is why
AI-built three.js pages all feel the same: same scrub, same fade, same weightless drift.

This layer gives the scene the same treatment CSS gets: **declared tokens, a fixed procedure, and
gates**. It is the part of this repo with no prior art, and it is the reason the fork exists.

---

## The one idea

> **A scroll-scene is not a sequence of scenes. It is one continuous world, and scroll is a
> camera move through it.**

Everything follows from that. If a property switches at a boundary, the illusion breaks and the
page reads as a slideshow with 3D decoration. Every visual property — fog, sky, sun, terrain,
particle colour, FOV — is a **continuously animated uniform driven by a single `scrollProgress`
float**.

**Nothing switches. Everything blends.**

---

## Beats — declare before you model

A **beat** is a stop on the journey. Declare all of them before anything is modelled, textured, or
lit. Beats are the storyboard; the scene is built to serve them, never the reverse.

A beat is five things:

```jsonc
{
  "id": "reviews",
  "scroll": 0.55,                    // 0–1 position on the page
  "camera": { "y": 26, "z": -3, "fov": 35 },
  "subject": "pause_look",           // what the subject is doing
  "idea": "This one judges your work" // the ONE thing the viewer must understand here
}
```

**`idea` is mandatory and it is one sentence.** A beat that cannot state its idea is a camera
position, not a beat, and it should be cut. This single field kills more bloat than any other
rule here — most weak scroll sites are seven beats where three had something to say.

Schema: `beats.schema.json`. Validate before building.

### Beat rhythm

- **6–9 beats.** Under six, the scroll feels thin. Over nine, viewers stop reading and start
  scrubbing.
- **First and last beats do not snap.** Entry and exit stay free; snapping the hero traps people
  on arrival, which is the worst possible first impression.
- **One beat is the peak.** Exactly one gets the tightest framing, the biggest FOV change, the
  longest hold. If every beat is dramatic, none is.
- **Environment shifts monotonically** across the run — cold→warm, high→low, dark→light. The
  continuous change is what makes ten seconds of scrolling feel like a journey rather than a
  carousel.

---

## Motion — springs, never lerp

**The single highest-impact rule in this file.**

```js
// NEVER — this is why scroll sites feel weightless
camera.position.y = lerp(from.y, to.y, t)
```

A lerp has no mass. It arrives exactly on schedule, never overshoots, never settles. The eye reads
it as *placed*, not *moved*. It is the visual signature of a scroll site built without a motion
spec — which is to say, most of them.

```js
export class Spring {
  constructor(stiffness = 120, damping = 14, mass = 1) {
    Object.assign(this, { stiffness, damping, mass, velocity: 0, current: 0, target: 0 })
  }
  update(dt) {
    const force  = -this.stiffness * (this.current - this.target)
    const damper = -this.damping   * this.velocity
    this.velocity += ((force + damper) / this.mass) * dt
    this.current  += this.velocity * dt
    return this.current
  }
}
```

One spring per axis, tuned differently — matched springs feel mechanical because real bodies do
not resist equally in every direction:

```js
const camY = new Spring( 80, 12, 1)   // vertical — heavy, floaty, slight settle
const camZ = new Spring(120, 16, 1)   // depth   — snappier, reads as push
const fov  = new Spring( 60, 10, 1)   // FOV     — slowest; this one is the trick
```

**The FOV spring is the cinematic tell.** When the camera accelerates into a close beat, FOV
compresses slightly *behind* the position and catches up late. That lag is what a real lens does
under acceleration, and it is the difference between "3D website" and "shot."

### Motion character is part of the seed

Damping is brand. It is declared in the brief alongside the palette, and it is one of the strongest
non-visual differentiators available:

| Character | stiffness / damping | Reads as |
|---|---|---|
| Heavy, cinematic | 80 / 14 | weight, gravity, seriousness |
| Crisp, precise | 160 / 20 | engineered, controlled, technical |
| Bouncy, playful | 120 / 8 | toy-like, friendly, light |
| Floaty, dreamy | 50 / 9 | weightless, ambient, calm |

Two scenes with identical geometry and different damping are recognisably different products.
This is free differentiation that costs two numbers.

---

## Continuous uniforms — the environment blend

One float drives the world:

```glsl
uniform float uProgress;      // 0–1, straight from scroll
uniform sampler2D uEnvA;      // start environment
uniform sampler2D uEnvB;      // middle
uniform sampler2D uEnvC;      // end

void main() {
  vec4 col = mix(texture2D(uEnvA, vUv), texture2D(uEnvB, vUv),
                 smoothstep(0.0, 0.5, uProgress));
       col = mix(col,                    texture2D(uEnvC, vUv),
                 smoothstep(0.5, 1.0, uProgress));
  gl_FragColor = col;
}
```

`smoothstep`, never `step`. A hard cut at 0.5 is visible and it undoes the whole illusion.

Atmosphere colour lerps per beat — fog, sky, and sun as one envelope. Interpolate all three
together; moving fog without moving sun produces a world lit by nothing:

```js
scene.fog.color.lerpColors(fromFog, toFog, ease)
scene.background.lerpColors(fromSky, toSky, ease)
sunLight.color.lerpColors(fromSun, toSun, ease)
```

Colour and opacity may lerp. **Anything with implied mass gets a spring.** That is the whole rule.

---

## Scene tokens

The scene half of the token file. Same discipline as CSS tokens — declared once, never re-decided
per beat:

```jsonc
{
  "camera":    { "fovRange": [35, 60], "near": 0.1, "far": 1000 },
  "motion":    { "stiffness": 80, "damping": 14, "mass": 1, "scrub": 1.8 },
  "lighting":  { "keyIntensity": 3.5, "fillIntensity": 1.2, "rimIntensity": 2.0,
                 "shadowMap": 2048 },
  "atmosphere":{ "fogRange": [0.025, 0.004], "vignette": 0.6 },
  "material":  { "transmission": 0.92, "roughness": 0.08, "thickness": 0.5, "ior": 1.45 },
  "particles": { "count": [800, 400, 200], "opacityRange": [0.5, 0.1] },
  "render":    { "toneMapping": "ACESFilmic", "exposure": 1.2, "pixelRatioCap": 2 }
}
```

`particles.count` and `pixelRatioCap` are arrays by tier — desktop / tablet / mobile.

---

## Performance tiers — decided up front, not discovered

| Tier | Pixel ratio | Shadows | Particles | Target |
|---|---|---|---|---|
| Desktop | ≤2.0 | on | 800 | 60fps |
| Tablet | ≤1.5 | on | 400 | 30fps |
| Mobile | — | — | — | **static fallback** |

**Mobile gets real compositions, not a degraded canvas.** A WebGL scene throttled onto a phone is
worse than a well-built static sequence: it drains battery, janks on scroll, and looks broken. Ship
scroll-snapped stills, composed on purpose.

The static fallback is a **deliverable with its own gate**, not an afterthought. It is also what
runs for `prefers-reduced-motion`, so it is never optional.

---

## Procedure

Same ten stages as `00-method/PIPELINE.md`, with scene-shaped inputs:

| # | Stage | Scene form |
|---|---|---|
| 0 | capture | Reference the real world the scene depicts — real terrain, real light, real subject. Not "imagine a mountain." |
| 1 | brief | Six lines + **motion character** + **beat count** |
| 2 | audit | Beats declared, each with its one-sentence `idea`. Validate against the schema. |
| 3 | delta | Scene tokens written before any modelling |
| 4 | prompt | Beat frames prompted as stills — this **is** the storyboard |
| 5 | generate | One still per beat, plus transition frames between adjacent beats |
| 6 | inspect | Approve each beat still. **The still is the acceptance test for the scene.** |
| 7 | retake | Content only. Camera framing wrong → the beat was wrong; go back to 2 |
| 8 | codify | Springs, uniforms, beat config, static fallback |
| 8b | verify by build | Build and render the scene — do the frames match the approved stills? Same direction rule: scene checked against still, never the reverse (`00-method/VERIFY-BY-BUILD.md`). |
| 9 | hand off | Beat config, tokens, assets, fallback, open items |

**Stage 6 is the gate that matters.** Approve the beats as pictures before anything is modelled.
Modelling a scene whose beats were never approved is the most expensive mistake available in this
whole document — you find out the story does not work after the geometry is built.

---

## Gates

```
S0  reference    real-world reference exists; not invented from memory
S1  beats        6-9 beats, each with a one-sentence idea; validates against schema
S2  tokens       scene tokens written BEFORE modelling
S3  storyboard   one approved still per beat + transition frames
S4  motion       springs on camera + FOV; zero lerps on physical properties
S5  continuity   every environment property is one continuous uniform; no switches
S6  tiers        desktop/tablet profiled; mobile static fallback exists and is composed
S7  fidelity     built scene matches approved stills, checked in that direction
```

**S4 is checkable by script — but not by grep.** *(Corrected 2026-07-19, after the naive version
failed correct code on its first real run.)*

The obvious check is `grep -n "lerp" scene.js`. It does not work. Correct code contains:

```js
this.fovSpring.target = lerp(a.camera.fov, b.camera.fov, t);   // CORRECT
```

That interpolates the **spring target** between two beats; the spring then drives the camera. The
lerp never touches a camera property. A grep fails the file anyway — and **a gate that cries wolf
gets switched off, which is worse than no gate at all.**

What S4 actually cares about is whether a camera property is *assigned* from an interpolation:

```
BAD_ASSIGN = /\b\w*camera\s*\.\s*(?:position\s*\.\s*[xyz]|rotation\s*\.\s*[xyz]|fov|zoom)\s*(?:\+=|=)\s*[^=\n]*\b(?:lerp|mix)\s*\(/i
```

Plus the positive check: at least one camera property must be fed by a spring `.update()`.
Reference implementation and its negative test: `phase0/check-motion.mjs`.

---

## Anti-default — WebGL edition

| Banned | Because |
|---|---|
| `lerp` on camera or FOV | weightless; the signature of no motion spec |
| A hard scene swap at a scroll boundary | breaks the one-world illusion |
| Bloom on everything | the default "make it look 3D" move; use it on one beat or not at all |
| Default `MeshStandardMaterial`, untuned | reads as a viewport, not a product |
| Rotating a hero object forever | the screensaver default; motion must mean something |
| Starfield particles with no relationship to the scene | filler; particles carry the environment or they go |
| A scene with no idea per beat | pretty scrolling with nothing to understand |
| Mobile running a throttled canvas | jank + battery; ship the static sequence |

---

*The scene gets a token file, a beat schema, and gates — exactly like the CSS does. That is the
whole contribution: a design system that does not stop at the edge of the canvas.*

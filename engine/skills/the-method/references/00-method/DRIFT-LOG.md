# DRIFT LOG — the brief-scrub checklist

**Status of the source material:** mocks, not code. Nothing here is built or shipped. This is the
punch list for the in-progress brief scrub, written by opening every frame in
`C:\Users\slang\rhobear-ux-pack\_FIREFLY\*\FROM-FIREFLY\images\` on 2026-07-19.

Two uses:

1. **Now** — work the checklist, re-prompt the frames that need it.
2. **Forever** — every entry becomes a rule in `01-prompt/BLOCKS.md` or `NEGATIVES.md`, so the
   same drift cannot come back. A drift that is only fixed in the image comes back next batch.
   A drift that is fixed in the prompt block does not.

---

## D-01 · RETRACTED — this was not drift

> **RETRACTED 2026-07-19.** I flagged "five bear styles" as a blocker. Wrong on both counts.
>
> **1. The brand pack is the source of truth, not the dashboard mock.** Every product has its own
> pack — bought, reviewed, confirmed. In a dense dashboard mock the generator treats the corner
> logo as an afterthought, so the mark it invents there is *noise*. Reading noise across eleven
> frames and calling the variance "drift" is reading the wrong artefact. Checked again: Reviews
> and Lab each carry their own pack's face-on head in nav, consistently, within their own product.
>
> **2. Variant-by-context is the design, not a defect.** A constellation bear walking on the Lab
> login and a face-on head in the nav is one family doing two jobs. Demanding one mark everywhere
> would have flattened a deliberate, good decision.
>
> Kept in place rather than deleted, because the *mistake* is the lesson — see
> "The pattern behind all of it" at the foot of this file.

**The rule that replaces it:**

> Marks come from the brand pack. The system's job is **placement, not selection** — pick the
> pack variant that fits the context, then hold it constant for that context across every frame.
> The generator never invents a mark; it only ever receives one.

Placement, by context — same family, variant chosen by job and size:

| Context | Variant | Why |
|---|---|---|
| Login, invite gate, walkthrough finale, empty state, hero | the expressive variant (constellation / full-body / illustrated) | these are the emotional beats; the mark carries feeling here |
| Nav logo, topbar, favicon, tab icon | the compact variant (face-on / silhouette) | must survive ≤24px and repeat on every screen without shouting |
| Decorative fill | none | if a mark has no job in the frame, it does not go in the frame |

The pack ships variants in every product colour. Swap by product; do not redraw.

---

## SUPERSEDED — original D-01 text, kept for the lesson

### ~~Five bear styles are in play~~

Observed, by frame:

| Product | Mark | Style |
|---|---|---|
| Plans — walkthrough | full-body, side profile | constellation wireframe |
| Hub — empty state | face, head-on | constellation wireframe |
| Hub — nav | head | cartoon outline |
| Lab — nav | head | cartoon, filled purple disc |
| Captur'd — nav | head | cartoon, solid white |
| Designs — nav | full-body | solid silhouette |
| Designs — hero | full-body | constellation wireframe |
| Reviews — nav | head | etched / engraved woodcut |
| Reviews — corner | 3 × full-body + 1 constellation | etched, loose ornament |
| Sales — nav | head | etched / engraved |
| Rho | orb | plasma sphere *(correct — its own mark)* |

**Hub and Designs each carry two different bears on one screen.**

**Recommendation — one animal, three levels of detail, chosen by size:**

| Level | Size | Where | Why |
|---|---|---|---|
| Constellation wireframe | ≥ 48px | empty states, walkthrough finales, heroes, invite gates, avatars | the signature; the only mark the mountain/constellation story supports |
| Solid silhouette | ≤ 24px | nav logo, favicon, tab icons | same pose, filled — constellation lines mush below ~32px |
| Etched / engraved | any | **marketing surfaces only** | never inside an app shell |
| Cartoon head | — | **retired** | reads as a different company |

The plasma orb stays Rho's alone and never takes a product accent.

If a different mark wins, it is one swap in `02-tokens/` plus a re-prompt — but it must be
settled before the re-prompt, because it touches every frame.

---

## P1 — factual errors. Fix regardless of the style call.

| # | Frame | Problem | Fix |
|---|---|---|---|
| D-02 | Captur'd nav (×2 frames) | Wordmark reads **"Capturd"** | The product is **Captur'd**. Put the apostrophe in the prompt as a literal, quoted string. |
| D-03 | Sales — embed card | Renders `script src https://sales.rhobear.ai/w/jenny.js async` — angle brackets stripped | Must render `<script src="https://sales.rhobear.ai/w/jenny.js" async></script>`. A customer copies this; without the tags it is not code. |
| D-04 | Sales — embed card | Prints the literal words **"Droid Sans Mono"** as visible UI text | Prompt instruction leaked into content. Font directives move to the TYPE slot and are never adjacent to a content string. |
| D-05 | Reviews — Scanner stat cards | Prints the literal word **"DASH"** ×4 | The placeholder is an em-dash `—`. Write the character, never its name. |
| D-06 | Designs — template grid | Descriptions are gibberish: *"Design brandis, design and branding and branding."*, *"Social media carousel sna."*, *"Creates the design lim for your email newsletter."* | Supply all 8 template names + one-line descriptions as a locked list in the prompt. Blanks get filled with plausible noise. |

---

## P2 — accent discipline

> **CORRECTED 2026-07-19.** This section originally called teal in Sales and Designs an "accent
> leak." That was the wrong frame — auditing the mocks against an assumed standard instead of
> reading what the mocks agree on. The mock is the target. Reversed below.

### D-07 · RESOLVED — teal section labels are a system element, not a leak

Teal `#2A8FA8` section labels appear in **Plans** (magenta product), **Designs** (red product),
**Sales** (yellow-green product), and natively in **Hub**. Four products, same treatment.

Four products agreeing is a rule, not drift. **Codify it:**

```css
--text-section: #2A8FA8;   /* every product, regardless of accent */
```

Applies to: uppercase section labels (`RECENT PROJECTS`, `START FROM A TEMPLATE`,
`HOME AND TRADES`), and table column headers (`EMAIL / MESSAGE / CHANNEL / CAPTURED`).

This is the token flagged as missing from the Plans build CSS — without it a worker defaults
these to grey and the build silently drifts off the mock. It belongs in `core.css`, shared, not
in any product delta.

**Teal therefore has two jobs, both system-wide:** section labels, and Rho. Neither is a product
accent, so neither competes with one.

### Still open

| # | Frame | Observation | Question for you |
|---|---|---|---|
| D-09 | Lab | Active tab is **purple**, primary button *run full battery* is **teal**. Every other product's primary action takes its own accent — Captur'd's *Film it* is blue, Sales' *Copy* is yellow-green | Is Lab's teal run-button deliberate (teal = "go", system-wide), or should it be purple like its tab? Lab is the only product where the primary action is not the product accent. |
| D-10 | Sales — leads table | Channel pills use three hues: blue *Verify*, purple *Backend-Verify*, yellow-green *Chat* | Likely deliberate — the hues encode channel type, which is semantic, not decorative. Flagging only so the map gets written down and stays stable across frames. Low priority. |

---

## P3 — chrome. Same family, same furniture.

| # | Problem | Frames | Fix |
|---|---|---|---|
| D-11 | **Four** nav-active treatments | glowing outlined rect (Hub) · filled pill (Lab, Captur'd) · underline tab (Reviews) · pill on coloured band (Designs) | Pick one per control type: rail item = 2px left border + 8% accent fill; tab = 2px bottom border; segmented pill = filled. Reviews' underline is correct *because* it is tabs. Hub's glow is the outlier. |
| D-12 | Designs is the only product with a **solid filled colour topbar band** | Designs | Single most off-family frame in the set. Dark bar + hairline rule, like everyone else. The red belongs in the accent, not the furniture. |
| D-13 | macOS window chrome on some, bare viewport on others | window: Hub, Reviews · bare: Captur'd, Sales, Lab, Designs | Inconsistent even against product truth — Hub *and* Designs are both desktop apps. Rule: window chrome iff the product ships as a desktop app. |
| D-14 | Wordmark lockup differs | everyone: `RHOBEAR` bold + product light. Plans: `RHOBEAR PLANS` all-caps, letterspaced, thin | Plans conforms. One lockup. |
| D-15 | Vertical divider rule after the wordmark | present: Reviews, Sales · absent: everyone else | Drop it, or adopt it everywhere. Currently reads as an accident. |

---

## P4 — ornament. Decide whether it is a system element or noise.

| # | Problem | Frames | Fix |
|---|---|---|---|
| D-16 | Sparkle `✦` glyph bottom-right, different size and position in each | present: Captur'd, Designs, Reviews, Sales, Lab · absent: Plans, Hub | Either promote it to a system element with a fixed size/offset/opacity, or drop it. Right now it is generator garnish that reads as intentional. |
| D-17 | Three loose grizzlies in the corner, no container, no job | Reviews — Scanner | Pure decoration; nobody else does it. Remove, or give it a defined slot in the system. |

---

## P5 — content fidelity. Caught in earlier rounds; keep the guards.

| # | Problem | Guard |
|---|---|---|
| D-18 | Invented product names — *"Rho Gummies"*, *"Rho Shake"*, *"Rho Boost"* on the orbit pills | Lock the 7 product names as a quoted list in every Rho prompt |
| D-19 | Invented demo types — *"Customer Testimonial"*, *"Mobile App Demo"*, *"Desktop App Tour"* | Lock the real 6: SaaS walkthrough · UX showcase · Feature spotlight · Tutorial · Social teaser · Login signup |
| D-20 | Invented nav items — *Dashboard / Projects / Integrations* | Lock the real nav per product from the captured screenshots |
| D-21 | Invented palette names — *"Deep Blue"*, *"Cosmic Purple"* | Lock the real 6: Blush · Forest · Ocean · Slate · Ember · Dusk |
| D-22 | Placeholder copy — *"Wildlife Advocacy"* on a card | Never leave a card body blank in a prompt |
| D-23 | Mirrored / reversed text on a card | Captur'd mobile — inspect for it explicitly at approval |
| D-24 | Wrong shell for the frame — a desktop-screen prompt rendered as a phone mockup | State the shell and the aspect in the CLASS slot, first words of the prompt |

---

## The pattern behind all of it

Every single entry above is one of three failure modes:

1. **A blank got filled.** Anything the prompt did not specify, the generator invented —
   plausibly, confidently, wrongly. *Guard: real strings only, locked lists, no blanks.*
2. **An instruction became content.** Font names, placeholder names, and format words rendered
   as visible text. *Guard: directive slots are never adjacent to content slots.*
3. **A shared element was re-decided per frame.** The bear, the nav state, the topbar, the
   ornament — each re-invented because each prompt described it fresh. *Guard: shared elements
   are pasted verbatim from `01-prompt/BLOCKS.md`, never described in prose.*

Fix the frames to unblock the scrub. Fix the blocks to end the class.

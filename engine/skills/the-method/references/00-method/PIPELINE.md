# PIPELINE — the ten stages, in order

This is the process, distilled from how the RHOBEAR ecosystem actually got designed across eight
products. It is written as a sequence because the order is the method: every stage consumes the
previous stage's evidence, and skipping one produces a specific, predictable failure.

Each stage has a **gate** (`GATES.md`) — a piece of evidence that must exist before the next stage
starts. No gate, no advance. The gates are what make this runnable by an agent instead of a person
with taste.

**Stage 0 branches by mode (`MODES.md`), read that first.** If a product already exists, Stage 0 is
CAPTURE (below). If nothing exists yet — a **fresh** brief — Stage 0 is INTENT + REFERENCES instead,
and the design is image-first from the first move. Everything from Stage 1 on is identical.

```
  0  CAPTURE   / or FRESH: INTENT + REFERENCES      (MODES.md)
  1  BRIEF        six fixed lines, written from the screenshots or the intent
  2  AUDIT        agent reads back what it sees, names the fight
  3  DELTA        lock the token change before any pixel
  4  PROMPT       assemble from blocks, never from prose
  5  GENERATE     batch, fixed aspect, fixed size
  6  INSPECT      open every frame, describe, approve or retake
  7  RETAKE       surgical, content-only, one reason named
  8  CODIFY       tokens → components → motion → decision log
 8b  VERIFY       build the frame, look — does the code produce the picture?
  9  HAND OFF     manifest + what is not done
```

---

## 0 · CAPTURE — reality before design *(Mode A — recreate)*

*Fresh project with no product to capture? This stage is INTENT + REFERENCES instead — see
`MODES.md`, Mode B. The rest of Stage 0 below is the recreate path.*

Screenshot every surface of the running product in a real browser, signed in where credentials
exist. Not a description, not a memory, not last month's export.

Produces:
- `_shots/` — full-page, desktop + mobile, light + dark
- `states/` — every visible control clicked, one level deep. `-closed` is the resting state,
  `-open--<control>` is what that control opens
- `walkthrough/` — the onboarding funnel, step by step
- `ui-inventory.json` — raw DOM extraction: headings, nav, chips, inputs, JS errors
- `MANIFEST.md` — what the surface is for, the flows, known issues, and a table of every
  button / input / link with its **real label**

The `ui-inventory.json` is the single most valuable artefact in the whole pipeline, because it is
the list of real strings that Stage 4 pastes in. Drift entries D-18 through D-22 all exist because
a prompt was written without one.

> **Skip this and:** you design for a product that does not exist. Every label is invented, every
> nav is wrong, and the build phase becomes an argument about which version was real.

**Gate G0** → every control in `MANIFEST.md` has a screenshot, and `ui-inventory.json` parses.

---

## 1 · BRIEF — six lines, always the same six

The brief form is fixed. It was used unchanged across all eight products and it works because
each line answers a question the generator would otherwise answer for itself.

```
What it is:   one sentence. What a customer uses it for. No feature list.
Screens:      what is attached, named. "the 7-step walkthrough, then the signed-in app —
              Agents, Mail, Calendar, Notes, Settings, Account"
Keep:         every feature and every button. Nothing gets dropped.
Change:       the arrangement only. Name the specific complaint.
Fix:          the one known defect, stated as a defect.
Notes:        what varies (palettes, tiers), what is fixed, and the accent.
```

**In a fresh project (`MODES.md`, Mode B) the `What it is` line is not one sentence — it is the full
intent feed** carried over from Stage 0: *what it is for · what it does · what it sells · what it
serves.* There is no product to summarise, so intent is doing all the anchoring, and a thin
`What it is` is the single fastest way to a competent picture of nothing. `Keep` / `Change` / `Fix`
describe an existing arrangement, so in fresh mode they are replaced by `References` — the named
things the owner is building toward.

Rules:

- **Keep is non-negotiable and always says the same thing.** A redesign that drops a control is a
  different product. The generator will helpfully simplify unless told not to.
- **Change names a complaint, not a solution.** "Several screens are cluttered" — not "use a
  2-column grid." The complaint is yours; the arrangement is the work.
- **Notes always ends with the accent**, because that is the one token that varies.
- **Notes always says "design the system, not one skin"** when the product ships multiple
  palettes. Otherwise you get a design that only works in the one palette you showed.

> **Skip this and:** you get a beautiful screen for a product nobody asked for, and no way to
> say why it is wrong.

**Gate G1** → all six lines present; Change names a complaint; Notes names an accent hex.

---

## 2 · AUDIT — make the agent prove it looked

Before any generation, the agent opens every attached screenshot and returns:

1. **What is working** — name the structures worth keeping
2. **What is fighting the system** — at least one, cited against a specific token or law
3. **The control inventory** — real labels, quoted, from the frames

The third item is the tell. An agent that cannot quote a real control label did not open the
image. This is the cheapest lie-detector in the pipeline and it costs one paragraph.

> **Skip this and:** the agent designs from the brief's prose instead of the product's reality,
> and you discover the mismatch after generation, at full cost.

**Gate G2** → ≥ 3 real control labels quoted verbatim; ≥ 1 named conflict with this system.

---

## 3 · DELTA — lock the token change before any pixel

Write the token delta file first. It may only override:

- the product accent (`--accent`, `--accent-dim`, `--accent-glow`)
- the shell type (one of five)

If the delta wants to change anything else — a radius, a font, a spacing step — that is a request
to amend this system, and it goes through `SYSTEM.md`, not through a product file. One product
quietly changing the card radius is how a design system dies.

> **Skip this and:** every product invents its own shell, and by product four there is no system,
> just eight sibling apps that share a logo.

**Gate G3** → delta file exists and overrides accent + shell only. Anything else = amendment.

---

## 4 · PROMPT — assemble from blocks, never describe from memory

The prompt is built from nine slots (`01-prompt/FORMULA.md`), and five of them are **pasted
verbatim** from `01-prompt/BLOCKS.md` — GROUND, MARK, TYPE, CHROME, FRAME.

The reason is drift class 3: any shared element that gets *described* in prose gets re-decided by
the generator on every frame. Five bear styles exist because eleven prompts each described the
bear in their own words. A pasted block cannot drift.

Content slots (SUBJECT, BODY) carry **real strings only**, sourced from Stage 0's inventory. Every
blank is an invitation for the generator to invent, and it always accepts.

> **Skip this and:** you get drift entries D-01 through D-24, in roughly that order.

**Gate G4** → all five locked blocks present verbatim; zero placeholder strings; every proper
noun traceable to the inventory or a locked list.

---

## 5 · GENERATE — batch, fixed format

Batch by screen family, not one at a time — consistency within a batch is markedly higher than
across batches, because the model holds the run's context.

Fixed formats, no exceptions:

| Deliverable | Aspect | Size |
|---|---|---|
| Desktop screen | 16:9 | 2K |
| Mobile screen | 9:16 | 2K |
| Reference sheet / brand pack | 16:9 | 2K |
| Walkthrough strip | 16:9 | 2K |

**Gate G5** → every frame at the declared aspect. A wrong aspect is a wrong shell (D-24).

---

## 6 · INSPECT — nothing ships unread

Open every generated frame. Describe what is in it. Then approve or retake.

An approval must name **at least three specific elements observed in that frame** — a real label,
a real number, a real state. "Looks great, approved" is not an approval; it is a forgery, and it
is how *"Rho Gummies"* and *"Wildlife Advocacy"* got as far as they did.

Check, every frame:

- [ ] Mark is the right one of three, at the right size, in the accent
- [ ] Accent appears only where the accent is allowed — no teal leak (D-07–D-10)
- [ ] Every string is real — no invented nav, product, palette, or type name
- [ ] No instruction leaked into content — no font names rendered as UI text (D-04)
- [ ] No placeholder rendered literally — no "DASH" (D-05)
- [ ] Nav-active matches the one treatment for that control type (D-11)
- [ ] Text is not mirrored or reversed (D-23)
- [ ] Product name spelled correctly, apostrophes intact (D-02)

> **Skip this and:** the errors survive into build, where they cost 50× more to find.

**Gate G6** → every frame has a written observation; approvals name ≥ 3 observed specifics.

---

## 7 · RETAKE — surgical, one named reason

A retake changes content, not composition. If the composition is wrong, that is a Stage 4 failure
and the prompt gets fixed, not the image.

The retake prompt is the original plus one locked-list line. Example, from the real Captur'd fix:

```
demo types must be exactly: SaaS walkthrough · UX showcase · Feature spotlight ·
Tutorial · Social teaser · Login signup
```

**Every retake also amends the block.** A retake that only fixes the frame guarantees the same
retake next batch. This is the stage that converts a one-off correction into a permanent guard.

**Gate G7** → retake names one reason; the corresponding block or negative is updated.

---

## 8 · CODIFY — from picture to code

In this order, because each layer depends on the last:

1. **Tokens** — the delta from Stage 3, now final
2. **Components** — CSS for what the frames actually show
3. **Motion** — springs, easings, Lottie; never a raw lerp on a camera (see `04-webgl/MOTION.md`)
4. **Decision log** — every non-obvious choice gets one line: *decision — why*

The decision log is what makes this survivable by the next person. "Right panel hidden by default
— the original showed an empty chat at all times, which is dead weight; the panel earns its space
by appearing only when it has something to show." That sentence is worth more than the CSS.

**Gate G8** → every component in the frames has CSS; every non-obvious decision has a why.

---

## 8b · VERIFY BY BUILD — will the code produce the picture?

**The mock is the target. This stage asks one question and only one question:**

> If a worker builds from this CSS, do they land on the picture?

Not "is the picture right." Not "does it match an older palette." The picture was approved at
Stage 6; it is now the specification. This stage checks the *code* against it, in that direction
only.

**You do not answer this by reading. You answer it by building.** Drop the CSS/JS into a small
throwaway index, render it in a real browser, screenshot it, and set that screenshot beside the
approved mock. Reading the code beside the picture is a desk-check, and a desk-check is a proxy —
it passes CSS that *looks* right and renders wrong (a frosted card coded as a flat fill reads fine
on the page and is wrong beside the mock). The full build recipe is `VERIFY-BY-BUILD.md`; it costs
more tokens than a read, on purpose, and that cost is the premium this system charges for not
shipping a build that drifts off its own spec.

Building it out is also what surfaces the four checks below — you see them in the render, you do not
have to imagine them from the source:

| Check | What goes wrong silently |
|---|---|
| **Hex** | Every colour in the frame has a token, and the token's value is that colour. A swatch drawn `#C84BAA` with a token set to something else builds a different product. |
| **Glass** | Glass in the picture means `backdrop-filter: blur()` in the code. Flat in the picture means no blur. A frosted card coded as a flat fill is the most common silent miss — it still "looks fine" in isolation and is wrong beside the mock. |
| **Structure** | Radii, borders, glows, and shape. A pill in the frame coded as a square-edged strip with a bottom border renders plainer than drawn. |
| **Missing tokens** | Anything the frame colours that the CSS has no token for. A worker defaults it to grey and the build drifts. Section labels are the classic case — teal in every frame, and there is no `--text-section` unless someone puts one there. |

**Correct in place. Do not report.** A gap found here is fixed in the CSS in the same pass. A list
of gaps handed to someone else is a deferred failure — the whole point of catching it here is that
it costs one edit now and a rebuild later.

**Hallucinated content gets deleted, not annotated.** When a frame contains something a worker
must not copy — an invented nav item, gibberish filler, a placeholder rendered literally — it is
removed from the build artefact entirely. Not commented out, not footnoted "ignore this", not
carried as a warning. Deleted. A note saying *"don't build this"* is still a thing in the file that
someone will eventually build.

**Gate G8b** → a **rendered screenshot of the built code** exists and sits beside the mock; every
colour in the frame has a matching token; glass in the frame is `blur()` in the render, not just in
the source; gaps are corrected in the file, not listed. No render, no gate — a read is not evidence.

---

## 9 · HAND OFF — including what is not done

A manifest of what exists, and an explicit list of what does not. Unfinished work that is named is
a task; unfinished work that is unnamed is a bug someone finds in production.

**Gate G9** → manifest lists every asset; open items are stated plainly, not implied.

---

## The shape of it

Stages 0–3 are preparation. Stages 4–7 are the loop. Stages 8–9 are delivery.

Most of the quality lives in 0–3, which is the part that feels like it is not designing yet. That
feeling is the trap. The generator is very good at making a beautiful picture of the wrong thing,
and the only defence is arriving with reality already in hand.

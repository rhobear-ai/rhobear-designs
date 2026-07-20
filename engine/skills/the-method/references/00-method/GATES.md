# GATES — the evidence contract

A gate is not a checklist item. It is **a piece of evidence that must exist as an artefact** before
the next stage runs. The distinction matters: a checklist can be ticked by an agent that wants to
please you. A gate either produced a file with the required content, or it did not.

Every gate below is written so it can be checked without judgement — by a second agent, by a
script, or by you at a glance.

---

## The rule that makes gates work

> **An agent may not declare its own gate passed using language alone.**
> The gate is passed by the artefact. If the artefact is missing, the gate is open, regardless of
> what the agent says about it.

This exists because the most common failure in an agent design loop is not bad work — it is
*confident narration of work that did not happen*. "All 6 approved ✅" is free to write. Six
paragraphs each quoting three real strings from six real images is not.

---

## G0 · CAPTURE *(Mode A — recreate)*

> **Fresh project (Mode B, `MODES.md`)?** There is no product to capture, so G0 is not this gate.
> It passes on a different artefact: a written **intent** (what it is for / does / sells / serves)
> and a named **references** set (the things the owner is building toward), plus one **approved hero
> frame** to anchor the rest. No intent on file → G0 is open, exactly as a missing capture would be.

**Artefact:** `ui-inventory.json` + `MANIFEST.md` + one screenshot per control

| Pass | Fail |
|---|---|
| `ui-inventory.json` parses and contains ≥ 1 entry per nav item | file missing, empty, or hand-written |
| Every row in the MANIFEST control table has a matching file in `states/` | a control is listed with no capture |
| Captures are from a **running** product | captures are mockups, exports, or from another product |

**Machine check:** `jq '.controls | length' ui-inventory.json` > 0, and every `controls[].id` has
a file in `states/`.

---

## G1 · BRIEF

**Artefact:** `PROMPT.txt` — the six-line brief

| Pass | Fail |
|---|---|
| All six lines present: What it is / Screens / Keep / Change / Fix / Notes | any line missing |
| `Change:` names a *complaint* | `Change:` prescribes a solution ("use a 2-col grid") |
| `Notes:` ends with an accent hex | no accent named |
| `Keep:` asserts nothing is dropped | Keep is qualified or scoped down |

**Why the Change rule:** a brief that prescribes the solution has already done the design badly.
The complaint is the input; the arrangement is the output.

---

## G2 · AUDIT

**Artefact:** a written read-back, before any generation

| Pass | Fail |
|---|---|
| ≥ 3 control labels quoted **verbatim** from the screenshots | labels paraphrased or generic |
| ≥ 1 named conflict with this system, cited to a law or token | "looks a bit dated" |
| Structures worth keeping are named specifically | "the layout is good" |

**This is the lie-detector.** An agent that has not opened the images cannot quote
`RHO-4829-ALPHA` or `843 of 1,500 credits` or `Outbound Strategist`. Generic praise is the
signature of an unopened file.

---

## G3 · DELTA

**Artefact:** `<product>-tokens.css`

| Pass | Fail |
|---|---|
| Overrides `--accent`, `--accent-dim`, `--accent-glow` and a shell type | overrides a radius, font, spacing step, or motion curve |
| Every override traceable to `02-tokens/products.css` | a new token invented locally |

**Machine check:** diff the delta against `core.css`; any key outside the accent set is an
amendment request, not a delta.

> A product that needs to change a shared token is telling you the shared token is wrong.
> Fix it in `SYSTEM.md` for everyone, or do not fix it.

---

## G4 · PROMPT

**Artefact:** the prompt text itself

| Pass | Fail |
|---|---|
| All five locked blocks present **verbatim** — GROUND, MARK, TYPE, CHROME, FRAME | a block paraphrased or described in prose |
| Zero placeholder strings — no `[name]`, no `Lorem`, no `...`, no empty card bodies | any blank left for the generator |
| Every proper noun traceable to `ui-inventory.json` or a locked list | an invented product / nav / palette / type name |
| Aspect + shell stated in the first clause | aspect stated late or not at all |

**Machine check:** `grep -F` each of the five blocks; regex for placeholder patterns; diff proper
nouns against the locked lists in `01-prompt/BLOCKS.md`.

**This is the highest-leverage gate in the pipeline.** Every entry in `DRIFT-LOG.md` would have
been caught here for the price of one grep.

---

## G5 · GENERATE

**Artefact:** the image files

| Pass | Fail |
|---|---|
| Aspect matches the declared class | 16:9 prompt returned 9:16, or a desktop prompt returned a phone mockup |
| Resolution ≥ 2K on the long edge | anything smaller — detail collapses and text mushes |

---

## G6 · INSPECT

**Artefact:** a written observation **per frame**

| Pass | Fail |
|---|---|
| Every frame has its own written observation | one blanket statement covering a batch |
| Each approval names ≥ 3 specifics **observed in that frame** | "approved", "looks great", "✅" |
| The eight-point checklist in `PIPELINE.md` §6 was run | checklist skipped |

**The three-specifics rule is the whole gate.** It is not busywork — it is the only mechanism that
forces the file to actually be opened. Approvals like *"constellation bear magenta ring, 843/1500
credits bar, Dusk swatch active"* prove sight. `✅` proves nothing.

**Never approve in bulk.** A batch approval is a batch of unread files.

---

## G7 · RETAKE

**Artefact:** the retake prompt + a block amendment

| Pass | Fail |
|---|---|
| Exactly one named reason for the retake | "make it better" |
| The retake changes content, not composition | composition change → this is a G4 failure, fix the prompt |
| The corresponding block or negative was updated | frame fixed, block untouched |

**The amendment is mandatory.** A retake that does not amend the block is a rental, not a fix —
you will pay it again next batch. This single rule is the difference between a design system that
converges and one that oscillates forever.

---

## G8 · CODIFY

**Artefact:** tokens + component CSS + motion + decision log

| Pass | Fail |
|---|---|
| Every component visible in the approved frames has CSS | a frame shows a component with no code |
| Motion uses springs for anything physical; no raw lerp on a camera | `lerp()` driving camera position or FOV |
| Every non-obvious decision has a one-line *why* | code with no rationale |

---

## G8b · VERIFY BY BUILD

**Artefact:** a **rendered screenshot of the built code**, sitting beside the mock — plus the
corrected build CSS. Not a list of findings, and not a read. See `VERIFY-BY-BUILD.md` for the recipe.

The direction of this gate is fixed: **code is checked against the picture, never the reverse.**
The picture was approved at G6 and is now the spec. A finding that says "the mock's colour is
wrong" is out of scope and is the single easiest way to run this stage backwards.

**You build it to check it.** Reading the CSS beside the frame is a desk-check, and a desk-check is
a proxy — it passes code that looks right in the source and renders wrong. Drop the code into a
throwaway index, render it in a real browser, screenshot it, compare. No render, no gate.

| Pass | Fail |
|---|---|
| A **rendered screenshot** of the built code exists beside the mock | the check was a read of the source; nothing was built |
| Every colour visible in the render has a token, and the token equals that colour | a colour in the frame with no token — a worker will default it to grey |
| Glass in the frame is `backdrop-filter: blur()` **in the render** | a frosted card that reads flat once built |
| Shape matches — radii, borders, glows | a glowing rounded pill rendered as a square strip with a bottom border |
| Both themes and every shipped palette were rendered | only the one skin was built |
| Gaps were **corrected in the file** | gaps were listed for someone else to fix |
| Hallucinated content was **deleted** from the build artefact | hallucinated content annotated "ignore" or left with a warning |

**On deletion — three strengths, use the third:**

| Strength | What it does | Half-life |
|---|---|---|
| Annotate — *"ignore this, don't build it"* | leaves the thing in the file with a warning attached | until the person who wrote the warning leaves |
| Delete | removes this instance | until the next generation makes it again |
| **Make it unreproducible** | the build has no path that could emit it | permanent |

The bar is the third. A hallucinated wordmark is not fixed by deleting the bad string from one
frame; it is fixed when the canonical string lives in exactly one place the build reads from, so
**the build cannot reproduce the wrong one.** Same for an invented nav item — it goes when the nav
comes from a locked list rather than from prose.

Ask of every correction: *could this recur?* If yes, you deleted an instance and left the class.

**Machine check:** extract every hex from the frame (dominant-colour sample or eyedropper), diff
against the token set; grep the CSS for `backdrop-filter` count vs. the number of frosted surfaces
in the frame.

---

## G9 · HAND OFF

**Artefact:** a manifest

| Pass | Fail |
|---|---|
| Lists every asset with its path | "everything is in the folder" |
| States what is **not** done, plainly | open items implied, hedged, or omitted |

> Unfinished work that is named is a task. Unfinished work that is unnamed is a bug someone
> else finds later, at your expense.

---

## Gate summary — for pasting into an agent brief

```
G0  capture       ui-inventory.json parses; every control has a screenshot
G1  brief         six lines; Change names a complaint; Notes names an accent hex
G2  audit         3 verbatim labels quoted; 1 named system conflict
G3  delta         accent + shell only; anything else is an amendment
G4  prompt        5 locked blocks verbatim; 0 placeholders; nouns traceable
G5  generate      declared aspect; >=2K long edge
G6  inspect       per-frame observation; approvals name 3 observed specifics
G7  retake        1 named reason; content only; block amended
G8  codify        every component has CSS; springs not lerps; every decision has a why
G8b verify-build  BUILD it + render a screenshot beside the mock (a read is not evidence);
                  every frame colour has a token; glass==blur() in the render; both themes/palettes;
                  FIX in file, don't report; DELETE hallucinated content, don't annotate it
G9  handoff       manifest lists assets AND states what is not done
```

## Failure protocol

When a gate fails, go **back one stage** — never forward with a note. A note is a deferred failure
and it compounds: a bad capture yields a bad brief yields a bad prompt yields a beautiful,
confident, wrong picture that everyone praises because nobody opened the original.

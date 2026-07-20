# MODES — the two ways a project starts

The pipeline in `PIPELINE.md` has one shape, but a project can enter it from two different places,
and the entry decides what Stage 0 even *is*. Naming the two modes is the fix for the most common
silent failure after a blank: an agent running the **recreate** pipeline on a **fresh** brief, going
looking for a product to screenshot when there is nothing there yet — and then inventing one.

> **Decide the mode in the first minute. It changes Stage 0, and Stage 0 changes everything after it.**

---

## Mode A — RECREATE (there is an existing product)

A product already runs. The job is to bring it into the system without dropping a feature.

- **Stage 0 is CAPTURE.** Screenshot the running product, every state, both themes, both viewports.
  Build the ux-pack (`INTAKE.md`). The `ui-inventory.json` — the real strings — is the spine of the
  whole run.
- Intent is *read from the product*: what it already does, what it sells, who uses it. You confirm
  it, you do not invent it.
- This is the mode used for the eight RHOBEAR **apps** — Plans, Hub, Captur'd, Designs, Reviews,
  Sales, Lab, Rho all existed and were captured before they were redesigned.

**The tell you are in Mode A:** you can open the thing in a browser right now.

---

## Mode B — FRESH (there is no product yet)

Nothing exists to capture. The design is invented, but never *by the model on its own* — it is
invented from a fed **intent** and a set of chosen **references**, then iterated.

- **Stage 0 is INTENT + REFERENCES**, not capture. There is no screenshot to take.
  - **Intent** is the feed that stops flat output. Four questions, answered in the owner's words:
    *what is it for · what does it do · what does it sell · what does it serve.* An agent handed a
    look but no intent makes a competent picture of nothing in particular. Intent is Mode B's
    `ui-inventory.json` — the single most valuable artefact, and the one a fresh brief is most
    tempted to skip.
  - **References** are the things the owner already likes in the world — sites, products, a stock
    mark, a palette he points at. They are chosen, external, and named; they are *not* the model's
    taste. (In the worked run: a Kodak/grizzly-on-a-mountain concept, a bought stock bear, an Adobe
    font kit.) A reference the owner did not name is the median sneaking back in.
- **Then it is image-first.** Generate the hero frame from intent + references, iterate with the
  owner (*you generate, I approve or name a retake, we move*), and the approved frame becomes the
  foundation everything else is built against.
- This is the mode that built the RHOBEAR **home page** — there was no page to capture; there was a
  concept, a reference, and an intent, and the first move was to generate a picture.

**The tell you are in Mode B:** you cannot open the thing yet, because it does not exist. If you
find yourself about to screenshot something to "capture" it, stop — you are in Mode B and that
screenshot is a **reference**, not a capture.

---

## Where they converge

After Stage 0, both modes run the **same loop** — `BRIEF → AUDIT → DELTA → PROMPT → GENERATE →
INSPECT → RETAKE → CODIFY → 8b VERIFY-BY-BUILD → HAND OFF`. Only the first stage differs:

| | Mode A · Recreate | Mode B · Fresh |
|---|---|---|
| Stage 0 | CAPTURE the running product | INTENT + REFERENCES, fed by the owner |
| Real strings from | `ui-inventory.json` (the product) | locked lists written with the owner, or captured from an adjacent source (e.g. an existing home page's copy) |
| The "fact" that outranks the mock | the captured product | the approved reference frame |
| Continuity anchor | the established system (surfaces 1…N-1) | the home page → marketing → apps ladder |

**The foundation ladder is the same in both modes.** The home page is the foundation for the
marketing pages; the marketing pages are the foundation for the apps. In Mode B you build that
foundation from scratch; in Mode A you inherit it. Either way, a surface designed after the home
page inherits the home page's settled vocabulary — never the legacy screenshots (`INTAKE.md`,
*Continuity*).

---

## Ask-and-iterate is not optional in Mode B

Mode A has a product to check against; Mode B has only the owner. So Mode B **must** surface — not
to narrate, but because the owner is the only fact-check for intent and references. The loop is:

> generate one frame → show it → the owner approves (naming three real things he sees) or names one
> retake → move.

An agent that runs Mode B silently for an hour is inventing a brand with no fact-check, which is the
exact failure Mode A's capture stage exists to prevent. In Mode B, the owner's eye *is* the capture.

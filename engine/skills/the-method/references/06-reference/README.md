# 06-reference — the beginning bibles

## Read this framing first

> **This is a *framework*, not *a* design system.**

*A* design system is one fixed thing — one set of tokens, one palette, one type scale, one schema. It
describes a single brand's surface. That is not what this repository is. This is a **framework**: a
step-by-step *"this is how we do it, every single time"* that **produces** design systems — a different
one for every seed, by the same procedure. (Owner correction, this session, verbatim in intent: *"a
system of design is just one system of design… I'm talking about a framework that… step by step this is
how we do it every single time to recreate these kinds of elements and procedures."*)

Everything in this folder exists to make that framework **strong enough to transfer** — so a cold agent
that has never seen us can pick it up, be handed a client brief, and produce the *kind of thing* the
reference sites are, with a *different subject*. That transferability is the product. It is why the test
(`00-method/TRANSFER-TESTS.md`) measures the **framework**, not the agent.

The repository is still named `rhobear-design-system/` for now — a misnomer under this correction, but
renaming is not this pass's job. The *concept* is what matters and it is fixed here.

---

## What this folder is

The **beginning bibles**: the compiled research on how the creative-WebGL field actually builds this
class of site, in the field's own vocabulary. It is the knowledge an agent reads *before* touching
`04-webgl/`, so that the technique layer is sourced too — not left to the model's median the way LAW 1
refuses to leave the identity layer.

It is **descriptive** (what the world does), where `04-webgl/STYLES.md` is **prescriptive** (what the
owner has taught). Keeping those apart is deliberate:

| | `06-reference/` (this folder) | `04-webgl/STYLES.md` |
|---|---|---|
| Contains | the field's vocabulary, sites, techniques, flow | the owner's *taught*, gated scroll-styles |
| Authority | research — sourced engineering + a target list | law — buildable-by-agent procedures |
| Grows by | adding decomposed references + sourced engineering | **sourced engineering** (`SOURCES.md`) **or** the owner teaching a style |
| An agent may | read it, name techniques from it, follow a source to real code, aim tests at it | build from it |
| An agent may **not** | invent a procedure from its median | build from a median guess — only from a sourced or taught procedure |

The corpus is where the owner **and the research** feed the library, and the **targets the transfer
tests aim at**. An archetype graduates into the buildable library when its techniques are **sourced**
(`SOURCES.md`) **or** the owner teaches it — never from a model's median (`ARCHETYPES.md` § How an
archetype graduates). The owner set this rule this session: he taught the method + two motion styles;
the rest of the engineering is *researched and sourced*, and he is the escalation path only for genuine
gaps (`GAPS.md`).

---

## The files

| File | What it is |
|---|---|
| `GLOSSARY.md` | the field's vocabulary, said correctly — the anti-drift list for the *technique* layer |
| `REFERENCE-SITES.md` | ten reference builds, decomposed: what · studio · stack · technique · flow · what we steal |
| `ARCHETYPES.md` | eight interaction archetypes distilled from the ten — the menu (candidates, not taught styles) |
| `TECHNIQUES.md` | the cross-cutting technique catalog — each with its cost, gotchas, and the gate it implies |
| `BUILD-FLOW.md` | how the field organises the work (Journey ladder · Codrops anatomy · studio flow), mapped to our G0–G9 |
| `STACK.md` | the 2026 stack defaults + reasoning — what a scene generator emits |
| `SOURCES.md` | the **engineering, sourced** — the *how*, with a real openable repo/paper/code per technique |
| `GAPS.md` | what's fully sourced vs. thin — the short honest escalation list for the owner |

The science that uses all of it lives one folder up: `00-method/TRANSFER-TESTS.md` — the blind-agent
reskin-transfer battery that proves the framework carries the procedure across a seed swap, and diverges
across opposed seeds.

---

## How an agent uses this corpus

1. **Reading a `scroll-scene` brief?** Name the archetype from `ARCHETYPES.md` and the techniques from
   `TECHNIQUES.md`, using the words in `GLOSSARY.md`. A brief that names its archetype and techniques has
   named its build; one that says "premium and modern" has named nothing.
2. **Building the scene?** `STACK.md` is what to emit; `BUILD-FLOW.md` is the order to build in;
   `TECHNIQUES.md` is how each mechanism works and what it costs; `04-webgl/` is the taught mechanics
   (springs, continuous world, transitions, mobile).
3. **Never** treat a `REFERENCE-SITES.md` entry as a thing to copy, or an `ARCHETYPES.md` entry as a
   thing to build unprompted. Copying proves an agent can copy; the framework exists because that is not
   the bar. Build only what the owner has taught (`STYLES.md`) or the brief has specified.

---

*The bibles make the technique layer sourced, the same way the seed makes the identity layer sourced.
Sourced procedure + sourced identity = a result that is premium because it was specified, and different
because the seed was.*

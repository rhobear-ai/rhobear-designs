# INTAKE — how a project starts

The first stage is the one that decides everything downstream, and it is not design. It is
**getting reality into a folder the agent can see**, in a layout that makes the agent's next move
obvious.

Most agent design work fails here, silently. The agent is handed a description instead of a
product, invents the parts it cannot see, and produces a confident, beautiful comp of something
that does not exist. Every hallucination in `DRIFT-LOG.md` traces back to a blank at intake.

> **The agent designs what it can see. Everything it cannot see, it invents.**
> Intake is the discipline of leaving nothing unseen.

**This page describes intake for Mode A — recreate**, where a running product exists to capture.
For a **fresh** project (`MODES.md`, Mode B) there is nothing to screenshot: intake is instead the
owner feeding **intent** (what it is for / does / sells / serves) and **references** (the things he
already likes, named). In fresh mode the reference frames live in `_DESIGN/` from the start and the
approved hero frame becomes the fact the rest is built against — the ux-pack tree below fills in
later, once there is a running build to capture. Same discipline, different first artefact.

---

## The folder is the interface

Not a chat, not an attachment dump. A **directory the agent reads**, laid out so that the path
itself tells it what each artefact is for.

```
<project>-ux-pack/
  README.md                     ← what this is, how it was captured, what is missing
  01-<surface>/
    walkthrough/                ← the onboarding funnel, step by step
    states/                     ← every control clicked
                                   "-closed"          = resting state
                                   "-open--<control>" = what that control opens
    MANIFEST.md                 ← what it is FOR, the flows, design intent, known
                                   issues, and a table of every button/input/link
                                   with its REAL label
    ui-inventory.json           ← raw DOM: headings, nav, chips, inputs, JS errors
  02-<surface>/  …
  _shots/                       ← full-page batch: desktop + mobile × light + dark
```

Then a **parallel tree for the design pass**, kept separate so source truth and proposals never
get confused:

```
_DESIGN/
  01-<surface>/
    PROMPT.txt                  ← the six-line brief for this surface
    FROM-<generator>/
      DROP-HERE.md              ← instructions to whoever/whatever fills this
      images/                   ← every frame produced
      notes/                    ← the generator's text: tokens, CSS, JS, Lottie, rationale
```

Two trees, one rule: **`<project>-ux-pack/` is what exists. `_DESIGN/` is what is proposed.**
When they disagree, the ux-pack is the fact and `_DESIGN/` is the argument.

---

## Capture — the four artefacts per surface

**`states/`** — every visible control clicked, one level deep. Map the controls, click each,
capture what it opens, restore to baseline, dedupe by DOM hash. One level only: clicking a control
captures what *it* opens, not what opens from inside that. Deeper sweeps explode combinatorially
and buy little.

**`walkthrough/`** — the onboarding funnel, step by step, all steps. Onboarding is the most-seen
and least-documented surface in most products; it is also where the brand does its heaviest
lifting. Expect each step to use a different DOM pattern — funnels accrete, so a sweep that assumes
one selector class stalls at step 4.

**`ui-inventory.json`** — the raw DOM extraction, and **the most valuable file in the pack**. It is
the list of real strings the prompt stage pastes in. Every invented nav item, product name, and
palette label in the drift log exists because a prompt was written without one open.

**`MANIFEST.md`** — the human layer. What the surface is *for*, the flows through it, the design
intent, known issues, and a table of every control with its real label. Written for someone who
has never seen inside the product, because that is exactly the agent's position.

### Capture rules

- **From the running product**, in a real browser, signed in wherever credentials exist. Not
  exports, not last month's deck, not a description.
- **Both themes, both viewports.** Light + dark, desktop + mobile. A design that only survives the
  one theme captured is not a system, it is a skin.
- **Opened states on mobile too.** A modal that works on desktop and traps on mobile is found here
  or in production.
- **Record what blocked you.** A surface that needs an interactive OAuth click gets its limitation
  written into the README, not quietly omitted. Unstated gaps become someone else's bug.

---

## The README is the contract

The pack's README states, plainly:

1. **What this is** — count of screenshots, how captured, what surfaces
2. **Where to start** — point at the single most valuable thing in the pack
3. **Scope** — what was captured, at what depth, and explicitly **what was not**
4. **Access** — what is blocked and why
5. **Corrections** — where an earlier claim in this file was wrong

That last one earns its place. A pack README that says *"I twice reported this as a dead button.
It was never dead — an intro overlay was swallowing every click"* is worth more than one that only
reports successes, because it tells the next reader which claims were tested.

---

## The drop convention

Every generator handoff folder carries a `DROP-HERE.md` — instructions written to whoever fills
it, human or machine:

```markdown
# Drop results for **<surface>** here

**images/** — every picture made for <surface>. Any filename; I sort them.
**notes/**  — the text. One file or many, .txt or .md.

Then say "<surface> is in" and I will read this folder, set it against what we ship
today, check nothing was dropped, and write build briefs.
```

Small file, three jobs:

- **Filenames do not matter.** Generators emit UUID soup. Sorting is the reader's job, not the
  dropper's — a naming convention nobody follows is worse than none.
- **`notes/` is first-class.** The generator's tokens, CSS, JS, Lottie and rationale are
  deliverables, not chat exhaust. If they only exist in a conversation they are gone when the
  window closes. Files survive; context does not.
- **A stated trigger phrase and a stated response.** `"<surface> is in"` → read, compare against
  current, check nothing was dropped, write briefs. Both sides know what the handshake is.

---

## Two working agreements, set before generation

**The loop, agreed out loud:**

> You generate. I inspect and approve or name a retake. We move.

Whoever holds the generator, the loop is the same and both parties know their move. Ambiguity here
produces the two worst failure modes: an agent that generates for hours without a check, and an
agent that stops to ask after every frame.

**Continuity, stated explicitly:**

> The system established earlier in this project applies to everything after it. Do not restart it
> per surface.

This is the correction that has to be made most often, and it is expensive every time. An agent
that builds a tokens/marks/type system for surface one and then designs surface two from the
source screenshots — reproducing the old look it was hired to replace — has thrown the system away
at exactly the point it started paying off. **When designing surface N, the reference is the
approved output of surfaces 1…N-1, not the legacy screenshots.** The legacy screenshots supply
*content*; the established system supplies *form*.

---

## Order of work

One surface at a time, all the way to done, before the next starts.

**Surface by surface, screen by screen.** Not all heroes, then all settings. A surface carried to
completion produces a full worked example — tokens, components, motion, decisions — that the next
surface inherits. Running breadth-first produces nine half-finished products and no system, and
the incompleteness is invisible until integration.

**Marketing first, if there is a marketing surface.** It sets palette, type, material, marks and
motion at their most expressive, and every app surface then inherits a settled vocabulary. Doing
apps first means designing the brand nine times and reconciling it later.

Within a surface:

```
screens → brand pack → walkthrough → mobile screens → mobile walkthrough
       → tokens → components → JS → motion → decision log
```

**Screens before the brand pack, on purpose — the mark comes after the structure.** In the early
structural frames you are settling layout, material, and where the glass sits; the logo the
generator drops in the corner is a **placeholder**, and it will be wrong (`DRIFT-LOG.md` D-01 — the
generator treats a corner mark as an afterthought). Do not chase it there. Once the structure is
approved you make the per-app brand pack and **place** its variant by context — hero/login gets the
expressive mark, nav/favicon gets the compact one. Making the mark before the structure is settled
means redrawing it every time the layout moves.

**Never advance a surface with a layer missing.** "We will come back for the motion" means the
motion is invented at build time by someone who did not see the comps. The decision log is not
paperwork — it is the only artefact that carries *why* into the future, and it is worth more six
months out than the CSS it explains.

---

## Definition of done — the matrix

Completion is not "the pictures look good." It is a full row:

| Surface | Screens | Brand pack | Walkthrough | Mobile | Tokens | Components | JS | Motion | Decisions |
|---|---|---|---|---|---|---|---|---|---|
| 01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 02 | ✅ | ✅ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |

Keep the matrix visible and current. It does two things nothing else does: it makes a half-finished
surface **impossible to mistake for a finished one**, and it makes the *shape* of the work obvious
to anyone who joins — every row is the same nine columns, so nobody has to ask what done means.

A row with a gap is not done. It does not matter how good the screens are.

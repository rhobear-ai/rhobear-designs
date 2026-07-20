# MARKS — variant placement

## The failure this file exists to prevent

Every agent that has looked at a real, well-made brand application has read the mark **variation**
as a **defect**. Consistently. Including the one that wrote this file, on its first pass.

The reason is mechanical: agents are trained to treat consistency as quality. So a big illustrated
mark on the welcome screen, a different one on the login, a compact head in the nav, and a micro
glyph in the chat bubble register as *four marks that fail to match* rather than *one system doing
four jobs*. The agent then "fixes" it by flattening everything to one mark everywhere — and calls
the flattening a design system.

It is the opposite of a design system. Uniform placement is what a copy-paste job looks like.

> **Variation across contexts is the system. Uniformity across contexts is the absence of one.**

Clear-space and minimum-size appear in every brand document ever written. **Placement rhythm across
a product** appears in almost none, which is why agents have nothing to pattern-match against and
default to sameness.

---

## What a complete pack contains

A pack that supports this has four tiers. Fewer than four and the agent will be forced to reuse,
which produces exactly the monotony above:

| Tier | Form | Typical size | Job |
|---|---|---|---|
| **Hero** | full expression — illustrated, animated, or full-body | 80–200px | the welcome moment. Impresses once. |
| **Expressive** | recognisable, simplified, still has character | 48–80px | login, empty states, gates, finales — the emotional beats |
| **Compact** | head / silhouette / monogram, holds at small size | 24–48px | nav logo, card glyph, avatar — repeats without shouting |
| **Micro** | reduced to a readable silhouette | 16–24px | favicon, tab icon, chat bubble, drawer button |

Plus every tier in every product/theme colour. Swap by colour; never redraw.

**A pack with one mark is not a pack.** If a client supplies one file, the first deliverable is the
tier set derived from it — before any screen is designed.

### The pack outranks the standing rule

The pack is the source of truth for the **accent** as well as the mark. When a written rule and
the pack disagree — the doc says a product is teal, the pack ships it red — **the pack wins and
the doc gets corrected.**

The pack was bought, reviewed and approved as a whole. A standing rule is only a description of
what was true when someone wrote it down. Overriding a paid, approved asset with a stale sentence
produces documentation nobody trusts and an app nobody recognises.

Read the pack's colour **before** writing the token delta, not after the screens come back.

---

## The moment map

Placement is driven by the **emotional weight of the moment**, not by available space:

| Moment | Tier | Why |
|---|---|---|
| Welcome / first run | **Hero** | the one time you have their full attention and no task competing |
| Login / gate / invite | Expressive | held, low-task, slightly ceremonial |
| Empty state | Expressive | nothing else is on screen; the mark carries the moment |
| Walkthrough finale | Expressive | the payoff beat |
| Success / completion | Expressive | earned; the mark celebrates |
| Nav logo | Compact | present on every screen — must never compete with content |
| Card / list glyph | Compact | repeats many times per view |
| Avatar / account | Compact | identity, not ceremony |
| Favicon / tab | Micro | 16px; only the silhouette survives |
| Chat bubble / drawer / FAB | Micro | a control, not a statement |
| Loading | Micro or Expressive, animated | the only place motion earns the mark extra weight |
| Decoration | **none** | a mark with no job stays out of the frame |

**Task density decides tier.** High task-focus → compact or micro. Low task-focus → expressive or
hero. A hero mark on a working dashboard is noise; a micro mark on a welcome screen is a wasted
moment.

---

## The three rules that stop it going wrong

### 1 · Density — one expressive mark per viewport, maximum

Compact and micro may coexist with an expressive one — they are furniture, read as chrome. **Two
expressive marks in one viewport is always wrong.** They compete, and the eye resolves it by
ignoring both.

This is the *"too many of the same in one place"* failure.

### 2 · Scale ladder — three sizes per product, ~2.5× apart

Steps must be far enough apart to read as deliberate. Marks at 32px and 40px in the same product
look like a mistake; 24 / 48 / 120 looks like a decision.

```
micro       16–24px      ×2.5
compact     40–48px      ×2.5
expressive  100–120px
```

Pick three points on this ladder per product and never introduce a fourth. A mark at an
in-between size is the single clearest tell that a screen was designed in isolation.

### 3 · Frequency — the hero tier appears at most twice in a whole journey

It is punctuation. Used three or four times it stops being an event and becomes a texture, and the
welcome screen loses the only advantage it had.

---

## Density audit — run it per screen, then per journey

**Per screen:**
- [ ] Exactly zero or one expressive/hero mark
- [ ] Every mark sits on one of the three ladder sizes
- [ ] Every mark has a job — remove any that is only filling space
- [ ] Compact marks that repeat (list glyphs) are identical, not variants

**Per journey** — the check nobody runs, and where the real problems live:
- [ ] Hero tier used ≤2 times total
- [ ] No two consecutive screens use the same expressive treatment
- [ ] Every tier in the pack is used at least once — an unused tier means the pack is wasted
      or the placement is too timid
- [ ] Contexts are consistent *with themselves* — the nav mark is the same on all 12 screens

Screen-level review passes almost everything. Journey-level review is where *"too many of the same"*
and *"not enough variation"* become visible, because both are properties of a sequence, not a
frame.

---

## The correction loop — how this file gets better

**Placement judgement will not be right first time, and no rule set will make it right first
time.** Some of it is proportion and taste in a specific composition — it is caught by looking at
the built thing, not by reasoning about it beforehand.

That is expected and it is planned for. What matters is that each correction becomes a rule
instead of a one-off fix.

When a correction lands — *"too many of the same in one place"*, *"that's too small there"*,
*"that variation doesn't make sense on this screen"* — append it to `PLACEMENT-LOG.md`:

```markdown
## 2026-07-19 · Hub Skills
Correction: three compact marks in one viewport — nav, two card glyphs. Too busy.
Rule derived: card glyphs suppress when the nav mark is visible AND cards number >2.
Generalised: repeated compact marks compete with the nav mark; suppress the repeat,
             never the nav.
```

Three fields, always:

1. **Correction** — what was said, verbatim
2. **Rule derived** — the specific fix
3. **Generalised** — the version that applies to the next product, and to a different brand

The third field is the one that matters and the one that gets skipped. A log of specific fixes is a
changelog. A log of generalised rules is a design system getting smarter.

**Corrections that recur three times get promoted** out of the log and into the rules above. That
promotion is the mechanism by which this document stops being someone's opinion and starts being
evidence.

---

## For the agent

- You will be tempted to unify the marks. **Do not.** What you are reading as inconsistency is
  usually a working variant system, and flattening it destroys the most expensive part of the
  brand.
- If marks genuinely conflict, say so as an **observation with the frames named**, and let a human
  rule on it. Do not resolve it by picking a winner.
- Never invent a variant. If a needed tier is absent from the pack, **request it**. An invented
  mark is where the brand stops being theirs.
- Your placement will be corrected. That is the process working, not you failing. Log the
  correction, generalise it, move on — do not apologise, and do not silently over-correct the next
  screen in the other direction.

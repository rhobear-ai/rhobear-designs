# BLOCKS — the paste-verbatim library

Five of the nine prompt slots are **pasted, never written**: GROUND, CHROME, MARK, TYPE, FRAME.

The reason is one specific failure mode, and it is the most expensive one in image-driven design:

> **Any shared element that gets *described* in prose gets re-decided by the generator on every
> frame.**

Eleven prompts each describing "the bear" in their own words produced five bears. Eight prompts
each describing "the nav active state" produced four treatments. Nobody was careless — each prompt
was reasonable on its own. Prose is simply a lossy channel for a spec, and the loss compounds
across a batch.

A pasted block cannot drift. That is the whole mechanism.

**Fill in the `<>` once per project, then paste the result character-for-character.** If you find
yourself rewording a block to fit a frame, the block is wrong — fix the block, not the frame.

---

## GROUND — background, texture, depth

Every frame in a project shares one ground. "A dark background" yields a different navy per frame.

```
<ground-hex> background, <texture>, <depth-treatment>, no gradient banding,
no vignette beyond <vignette-strength>
```

Worked (dark-glass product):

```
deep navy #0A0F14 background, subtle starfield texture, soft radial depth toward
the centre, no gradient banding, no vignette beyond 20%
```

Worked (paper product — same slot, no shared DNA):

```
warm off-white #FAF7F2 background, fine paper grain, flat even lighting with no
falloff, no gradient banding, no vignette
```

---

## CHROME — furniture, one block per shell

The topbar, rail, window and their states. This is where four competing nav-active treatments
collapse into one.

### `nav-rail`

```
nav-rail shell: <rail-width>px left rail in <nav-bg>, 1px hairline right border.
Rail top: mark then wordmark. Nav items grouped under uppercase section labels in
<section-colour>. Active item = 2px left border in <accent> plus <accent> at 8%
background fill — never a filled pill, never a glowing outline, never a full block.
Rail bottom: status row. Topbar <topbar-h>px, transparent over the ground, 1px
hairline beneath, page title left, actions right. <window-chrome>
```

### `centered`

```
centered shell: no rail. Topbar <topbar-h>px, dark bar over the ground with a 1px
hairline beneath, no coloured band. Wordmark and mark left, single primary action
right. Content centred, capped at <content-max>px. <window-chrome>
```

### `canvas`

```
canvas shell: topbar <topbar-h>px with a mode switcher, dark bar and 1px hairline,
no coloured band. Collapsible left panel <panel-w>px with grouped sections under
uppercase labels in <section-colour>. Canvas takes all remaining width and is the
hero. Status bar <status-h>px at the foot in mono. <window-chrome>
```

### `bench`

```
bench shell: topbar with product mark, wordmark and stage badge. Horizontal test
tabs, active = filled pill in <accent>. Config rows above; results below and
dominant. Config collapses once a run starts — results are the hero. <window-chrome>
```

### `overlay`

```
overlay shell: floating widget <w>x<h>px, <radius>px corners, drop shadow, riding a
blurred host surface. Header <header-h>px: mark avatar left, name and host label,
actions right. Message area. Input bar <input-h>px at the foot, pill radius.
```

`<window-chrome>` is exactly one of:

- `macOS window chrome with traffic lights and a titlebar` — for products that ship as desktop apps
- `no window chrome, bare viewport` — for products that ship in a browser

Decide once per product from what it actually is. Do not decide per frame.

---

## MARK — placement, never selection

The pack is authoritative. Full doctrine in `03-assets/MARKS.md`. The block only ever *places*.

```
<variant> mark from the brand pack, <size>px, in <accent>, positioned <position>.
Exactly one expressive mark in this frame. Do not redraw, restyle, or invent the mark.
No decorative mark anywhere in the frame.
```

Worked:

```
compact mark from the brand pack, 24px, in #4B7AC8, positioned left of the wordmark
in the topbar. Exactly one expressive mark in this frame. Do not redraw, restyle, or
invent the mark. No decorative mark anywhere in the frame.
```

`Do not redraw, restyle, or invent` is doing real work. Without it the generator "improves" the
mark toward its own median, which is how a bought pack quietly becomes a generic one.

---

## TYPE — three roles, always three

```
display <display-face>; body <body-face>; mono <mono-face> for <mono-scope> only
```

Roles, not fonts. The mapping is what survives a rebrand:

| Role | Carries |
|---|---|
| Display | what the **brand** says — headlines, product names, stat values |
| Body | what the **UI** says — labels, descriptions, buttons |
| Mono | what the **machine** says — code, slugs, IDs, timestamps, metrics |

**Never place a font name adjacent to a content string.** That adjacency is how a font name got
rendered as visible UI text inside a card. Type directives live in this slot and nowhere else.

Some products have no mono role. Say so — `no mono role in this product` — rather than leaving it
out, or the generator will find somewhere to use one.

---

## FRAME — restraint and output

Closes every prompt, identically.

```
<restraint-descriptor>, generous spacing, clear hierarchy, <aspect> <resolution>
```

Worked:

```
Apple-like restraint, generous spacing, clear hierarchy, 16:9 2K
```

Never add "premium", "modern", "clean", "beautiful", "sleek". They carry no information the model
does not already apply, and they crowd out tokens that do. Restraint is stated once here; quality
comes from specificity in BODY.

---

## Composite templates

### Brand pack

The pattern that produced consistent packs across eight products:

```
Brand identity sheet for <Product>, <ground-block>.
BRAND IDENTITY header in mono, small, top left.
<mark-hero-variant> in <accent> top centre, same <style-descriptor> as the other
<Family> product marks.
<Product> wordmark below in <display-face>, <wordmark-treatment>.
<url> in <mono-face>, <accent>, small, beneath.
Four-variant grid 2x2: dark primary on <ground>, light on <light-ground>,
glyph-only tight favicon crop, horizontal lockup.
Favicon size row beneath: 48px 32px 16px with progressive simplification, size
labels under each.
<secondary-mark> bottom right, labelled.
16:9 2K
```

**The line that locks family style is** `same <style-descriptor> as the other <Family> product
marks`. Without it, packs generated in separate sessions drift apart even with identical structure.
With it, they hold. It is one clause and it is the highest-value clause in the template.

### Walkthrough strip

Whole funnel in one frame — the reviewable unit, because sequence problems are invisible one step
at a time:

```
<Product> onboarding walkthrough steps <N> through <M> shown as individual
<aspect> screens in a horizontal reference strip, <ground-block>.
Step <n> of <total> — <title>, <content>, <cta> in <accent>, progress dot <n> active.
[repeat per step]
Progress dots: filled <accent> = current, muted = remaining, all filled = complete.
Consistent <family> system, <accent> accent. <aspect> 2K
```

Every step states its own dot position. Left implicit, the generator drifts the indicator.

### Reference sheet

For orb states, mark tiers, colour systems, motion states:

```
Reference sheet: <Subject>, <ground-block>.
<TITLE> in mono uppercase, top left, with a hairline rule beneath.
<N> variants in a <grid> grid, each labelled beneath in <display-face> uppercase.
Size callouts in <mono-face>, <accent>, with bracket rules.
Footer band: <footer-text> in mono, small, centred.
16:9 2K
```

The header-rule / labelled-grid / footer-band structure is what makes a set of sheets read as one
document rather than several posters.

---

## Locked lists

Every enumerable set in the project lives here, verbatim, and is pasted whole into any prompt that
touches it. **Never write a partial list.** Never write `etc.` or `and others` — the generator
completes the list, inventing.

```
SHELLS      nav-rail · centered · canvas · bench · overlay · scroll-scene
MARK TIERS  hero · expressive · compact · micro
TYPE ROLES  display · body · mono
```

Per project, add and maintain:

```
NAV ITEMS       <exact nav, per surface, from ui-inventory.json>
PRODUCT NAMES   <exact, with punctuation — apostrophes matter>
PALETTE NAMES   <exact, in order>
TIER NAMES      <exact>
ENUMERATED SETS <any user-visible list: demo types, voices, categories>
```

Sourced from `ui-inventory.json` at intake. **Every invented name in a generated frame traces to a
list that was not pasted.**

---

## Amendment rule

When a retake fixes a frame, **the block is amended in the same pass.**

A retake that only fixes the image is a rental — the same retake comes due next batch. A retake
that amends the block is a fix. This one rule is the difference between a system that converges and
one that oscillates forever, and it is the one most often skipped because the frame already looks
right.

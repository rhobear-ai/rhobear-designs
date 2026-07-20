# ICONS & ELEMENTS — sourcing the premium layer

The default open icon set is the third-loudest AI tell, right behind the purple-blue gradient and
the default UI sans. It is the set every framework imports and every model reaches for, which means
the moment it appears the page announces which tool made it. Iconography and decorative elements
are **sourced**, never defaulted — Law 1 applies to them exactly as it applies to type and marks.

> **Icons and elements are placed, not picked from the library everyone imports. One licensed
> family, or drawn for the job. Emoji is never UI.**

The point of this file is that *premium look is buyable for the price of one subscription* — the
client does not need a custom illustration budget to escape the generic set. There is a concrete,
productisable path, and part of it is a licensed pack the owner already paid for.

---

## Sourcing, in order

**1 · A set the client already licenses.** Same as type — check first. Many brands already pay for
an icon family or an element library and nobody asked.

**2 · Adobe Stock elements — the subscription path.** An Adobe Stock membership (~$40/mo, 7-day
trial) opens a huge library of licensed vector elements, icons, textures and decorative assets.
The client browses it **inside the product** (see § In-product browsing), pulls what fits, and now
their page carries premium, licensed elements they'd otherwise have had to commission — bought with
one subscription, not a design retainer.

**3 · The owner-supplied licensed pack.** The owner has already purchased Adobe Stock elements.
Because they are **licensed to him**, we can implement them for a user and hand them over — they are
legitimately part of *our* design program, a curated pack we ship. When a project needs an element
that isn't in the client's own set, this pack is the fallback before anything gets drawn from
scratch. (If a project needs a specific licensed element the owner holds, he supplies it and it goes
into the program.)

**4 · Drawn for the job.** A small custom set, one family, consistent grid and weight. Worth it when
the brand's iconography *is* the brand. Overkill when a licensed set already fits.

**Never:** the default icon font / open set everyone imports · emoji as interface iconography ·
mixing two icon families in one product (instant tell) · elements ripped from a site.

---

## The Adobe path, productised

This is the mechanism that makes "premium look, one subscription" real, and it is the same shape
for type and for elements. Type first, because it's the higher-leverage half:

**Type — Adobe Fonts Web Projects.** The client links their Adobe account, browses the full Adobe
Fonts library **inside the product**, and groups the faces they choose into a **Web Project**
(Adobe's own grouping — you assemble the fonts for one site into a named project). Adobe issues that
project an **embed link**; the client pastes it to us; we pull the kit. The result: a real, unique,
*licensed* type system — display, body, mono — for the price of the subscription, with no font ever
ripped or cloned. This is the concrete form of `FONTS.md` § Sourcing item 1 ("a library the client
already pays for") — it just needed a name and a flow.

**Elements — Adobe Stock, same flow.** Browse in-product → select → the licensed asset lands in the
project with its licence recorded beside it (`INTAKE.md` drop convention). Icons, textures, plates
and decorative elements all come down the same pipe.

> **The subscription is the seed budget.** ~$40/mo turns "the model picked some icons" into "the
> brand is wearing licensed type and licensed elements." That is the cheapest premium upgrade in
> the whole method, and it is a monetisation surface: the in-product CTA to *start the trial* is the
> product nudging the seed toward sourced instead of defaulted.

---

## In-product browsing

The product ships a **small embedded browser** pointed at the client's linked libraries — Adobe
Fonts and Adobe Stock — so choosing type and elements happens *inside the design flow*, not in a
separate tab with copy-paste in between. The client sees their fonts, groups them into the web
project, browses elements, and everything selected is captured into the seed with its licence.

Keeping it in-product matters for one reason beyond convenience: it is where the "sourced, never
defaulted" law gets *enforced by the interface*. If picking a licensed face is one click inside the
flow and reaching for the default set is friction, the default stops winning.

---

## Placing icons and elements

- **One family, consistent weight and grid.** A 1.5px-stroke line set next to a filled set reads as
  two products glued together. Pick the weight in the brief and hold it.
- **Elements carry meaning or they leave the frame.** A decorative element with no job is the same
  failure as a mark with no job (`MARKS.md`) — it's filler. If it isn't reinforcing the subject or
  the reveal, cut it.
- **Match the material.** Glass UI gets elements that read as glass or line; flat matte gets flat.
  A glossy stock illustration dropped onto a matte surface is the seam that says "assembled."
- **Licence travels with the asset.** Every element lands with its `LICENCE.md` beside it. An asset
  whose licence can't be named can't ship — the sellable-by-default law applies to borrowed pixels
  as much as to code.

---

## Checklist

```
[ ] icon/element source named in DESIGN.md — client set, Adobe Stock, owner pack, or drawn
[ ] exactly one icon family; one stroke weight / grid held across the product
[ ] no default open icon set; no emoji as UI
[ ] Adobe path used where it fits — Web Project for type, Stock for elements, browsed in-product
[ ] every licensed element has LICENCE.md beside it
[ ] elements match the declared material (glass/flat/paper/metal)
[ ] every element earns its place — reinforces subject or reveal, or it's cut
```

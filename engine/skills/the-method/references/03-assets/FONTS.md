# FONTS — sourcing and assigning type

Type is the fastest way a page announces which decade and which tool made it. The default UI sans
is the single loudest AI tell after the purple-blue gradient — not because it is a bad face, but
because it is the one every framework ships and every model reaches for.

> **Three roles. Licensed families. Assigned by what the text is *for*, never by how it looks.**

---

## Roles, not fonts

The mapping is the durable part. Families get swapped in a rebrand; roles do not.

| Role | Carries | Test |
|---|---|---|
| **Display** | what the **brand** says — headlines, product names, stat values, hero copy | would this be on a poster? |
| **Body** | what the **UI** says — labels, descriptions, buttons, paragraphs | is this instructing or explaining? |
| **Mono** | what the **machine** says — code, slugs, IDs, timestamps, metrics, keys | did a computer produce this string? |

Three voices, cleanly separated. **The mono test is the sharpest one** and it does more for
perceived craft than any amount of styling: a timestamp, a model slug, a credit count and an API
key all set in mono while descriptive copy stays in body makes an interface read as *engineered*
rather than *assembled*. Set them in the body face and the same interface reads generic.

**Some products have no mono role.** A consumer app with nothing machine-facing should say so in
`DESIGN.md` — `no mono role in this product` — or the generator will find somewhere to use one and
it will look borrowed.

---

## Sourcing

In order of preference:

**1 · A library the client already pays for.** Adobe Fonts, Monotype, Google Fonts — activated,
licensed, no procurement. Check first; most brands already have one and nobody asked.

> **The productised form of this is the Adobe Fonts *Web Project*.** The client links their Adobe
> account, browses the library in-product, groups the faces they choose into a named Web Project,
> and Adobe issues an embed link they paste to us — a real, unique, licensed type system for the
> price of one subscription, no font ever ripped or cloned. Full flow, and the matching path for
> licensed *elements*, in `ICONS.md` § The Adobe path, productised.

**2 · A licensed purchase.** A foundry face for display costs less than one round of revisions and
is the highest-leverage anti-generic spend available. Display carries the brand; it is worth the
budget. Body and mono can come from an open library without anyone noticing.

**3 · Open source, chosen deliberately.** Free is fine. *Default* is not. A deliberately chosen
open face is a decision; the one your framework shipped with is an absence of one.

**Never:** a font ripped from a site, a "similar to" clone of a licensed face, or an unnamed
system stack that renders differently on every machine and makes your comps unreproducible.

### Web delivery

```
self-host > CDN > Adobe/Google embed
```

Self-hosting removes a third-party render-block on first paint, survives the CDN going down, and
keeps the page working offline. Subset aggressively — most projects need Latin only, and full
Unicode files are frequently the largest asset on the page.

```html
<link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
```

`font-display: swap` on body and mono. **`optional` on display** — a hero headline that reflows
after paint is more damaging than one that renders in a fallback for 100ms.

---

## Assigning

**Contrast between roles, not variety within them.** Display and body should differ structurally —
slab against humanist, geometric against grotesque, serif against sans. Two faces from the same
classification produce mush: the eye cannot tell they are different, so the hierarchy reads as an
accident.

**Weights: three per family, maximum.** Regular, semibold, bold covers everything. Nine loaded
weights is a page-weight problem masquerading as flexibility.

**Test at the extremes before committing.** A face that sings at 48px can be illegible at 12px, and
that 12px setting is where most of your interface actually lives.

```
display   48px   →   does it hold the room?
body      16px   →   is it comfortable for a paragraph?
label     12px   →   is it legible in caps with tracking?
mono      13px   →   do 0/O and 1/l/I disambiguate?
```

The mono check is not pedantry. An operator reading an API key or a hash needs those glyphs to
disambiguate, and a mono face that fails it will cause a real support ticket.

**Tracking:** positive on uppercase labels (`0.12em`), tight on large display (`-0.02em`), zero on
body. Uppercase without added tracking is the most common typographic error in generated
interfaces — caps are drawn on the assumption of extra space and look cramped without it.

---

## In the prompt

Type lives in the **TYPE slot** of the nine-slot formula, and only there.

```
display <display-family>; body <body-family>; mono <mono-family> for <scope> only
```

> **Never place a font name adjacent to a content string.**

That adjacency is exactly how a font name got rendered as visible UI text inside a card — the
generator read the directive as content because it sat next to content. Directives go in directive
slots. This is not a style preference; it is a parsing hazard.

---

## When the brand already has a face

Sometimes canon names a display family and a working pack shipped a different one. **Do not
silently pick.** Name the conflict, state which surfaces each currently owns, and recommend — then
let a human rule.

The defensible split, if you are asked for one:

- **Brand face** on marketing and any surface whose job is to be *felt* — it is doing brand work
- **System face** in-app, where the job is to be *read* at 12px for eight hours

That split is a real design position, not a fudge: a display face optimised for a hero often
performs badly in a dense table, and forcing one family across both usually degrades the app.

But it is still a **decision**, not a default. Surface it.

---

## Checklist

```
[ ] three roles named in DESIGN.md, or mono explicitly excluded
[ ] licence confirmed for the delivery channel (web embed ≠ desktop ≠ app)
[ ] display and body structurally contrasting, not same-classification
[ ] ≤3 weights per family
[ ] tested at 48 / 16 / 12 / 13px
[ ] mono passes 0/O and 1/l/I
[ ] self-hosted and subset where possible
[ ] font names never adjacent to content strings in any prompt
```

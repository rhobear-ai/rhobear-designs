# FORMULA — the nine-slot prompt grammar

Every image prompt in this system is nine slots, in this order. The order is not cosmetic: image
models weight early tokens more heavily, so the slots run from *what kind of thing this is* down to
*how it is finished*.

```
1 CLASS     what kind of artefact + aspect          ← locked vocabulary
2 SUBJECT   which product, which screen, which state
3 GROUND    background, texture, depth               ← PASTE VERBATIM
4 CHROME    topbar / nav / window furniture          ← PASTE VERBATIM per shell
5 BODY      the content, in reading order            ← real strings only
6 ACCENT    the one hex, and where it is allowed
7 MARK      which bear, which size, which colour     ← PASTE VERBATIM
8 TYPE      the three type roles                     ← PASTE VERBATIM
9 FRAME     restraint, spacing, output size          ← PASTE VERBATIM
```

**Five slots are pasted, never written.** GROUND, CHROME, MARK, TYPE, FRAME come out of
`BLOCKS.md` character-for-character. This is the single mechanism that prevents drift class 3 —
*a shared element re-decided per frame*. Five bear styles exist in the current mocks because eleven
prompts each described the bear in their own words. A pasted block cannot drift.

**Two slots carry content.** SUBJECT and BODY hold real strings from `ui-inventory.json` or from
the locked lists at the bottom of `BLOCKS.md`. Every blank you leave, the generator fills —
plausibly, confidently, and wrong.

---

## The slots

### 1 · CLASS — locked vocabulary, first words of the prompt

| Class | Opening phrase | Aspect |
|---|---|---|
| Desktop screen | `Premium dark UI desktop app` | 16:9 |
| Mobile screen | `Premium dark UI mobile app 9x16 portrait` | 9:16 |
| Brand pack | `Brand identity sheet` | 16:9 |
| Reference sheet | `Reference sheet` | 16:9 |
| Walkthrough strip | `Onboarding walkthrough N steps horizontal reference strip` | 16:9 |
| Modal / overlay | `Premium dark UI desktop app, <name> modal overlay` | 16:9 |

The class goes first because it decides the shell. Drift D-24 — a desktop prompt that returned a
phone mockup — happened because the aspect was stated at the end, where it lost the argument.

### 2 · SUBJECT — product, screen, state

`RHOBEAR <Product> <screen name>, <state>`

State is not optional. `default` · `filled` · `empty` · `running` · `error` · `signed-out`.
An unstated state gets a populated one, always, because populated looks better — which is exactly
why the empty states in the current mocks are the least consistent frames in the set.

Spell the product name exactly. **Captur'd carries an apostrophe** (D-02).

### 3 · GROUND — paste

Background hex, texture, and depth. One block, shared by every product. Never "a dark background".

### 4 · CHROME — paste, one per shell

The topbar, nav rail, window furniture and their active states. Five blocks, one per shell type
(`nav-rail` · `centered` · `canvas` · `bench` · `overlay`). This is where the four competing
nav-active treatments (D-11) get collapsed to one.

### 5 · BODY — real strings, reading order

Describe the content top-to-bottom, left-to-right, the way a person reads it. Every string is
quoted and real.

Rules:

- **No blanks.** Every card gets a title and a body. An empty card body produced
  *"Design brandis, design and branding and branding."* (D-06).
- **Quote proper nouns.** Model slugs, palette names, nav items, demo types — from the locked
  lists, verbatim.
- **Write characters, not their names.** The em-dash placeholder is `—`, never the word `DASH`
  (D-05). Angle brackets are `<script>`, and they must survive into the frame (D-03).
- **Numbers are real.** `843 of 1,500 credits`, not "some credits". Real numbers anchor the
  layout and stop the generator inventing a different metric.

### 6 · ACCENT — one hex, and its permissions

State the hex **and where it may appear**. The current mocks leak teal into Sales and Designs
(D-07, D-08) because the accent was named without a scope.

```
accent <hex> — used only for: the single primary action, the active nav state,
section labels, and the mark. All other text is frost white or muted.
No other accent hue appears anywhere in this frame.
```

That last sentence is the one that stops the leak. Teal belongs to Hub and Rho; when it shows up
in a yellow-green product the eye reads it as a Rho element and it steals focus.

### 7 · MARK — paste

Which of the three marks, at which size, in which colour. Never described in prose.

### 8 · TYPE — paste

Three roles, always the same three:

| Role | Face | Carries |
|---|---|---|
| Display | Rokkitt Bold | what the *bear* says — headlines, product names, stat values |
| Body | Lato | what the *UI* says — labels, descriptions, buttons |
| Mono | Droid Sans Mono | what the *machine* says — code, slugs, IDs, timestamps, metrics |

Keep font directives in this slot and **never adjacent to a content string** — that adjacency is
how `Droid Sans Mono` got rendered as visible UI text in the Sales embed card (D-04).

### 9 · FRAME — paste

Restraint, spacing, output size. Closes every prompt identically.

---

## Worked example

Reading like a prompt, with slots marked:

```
[CLASS]   Premium dark UI desktop app, 16:9
[SUBJECT] RHOBEAR Captur'd Studio, filled state
[GROUND]  deep navy #0A0F14 background, subtle starfield texture, soft vignette,
          no gradient banding
[CHROME]  centered shell: slim 44px topbar, dark bar with a 1px hairline rule beneath,
          no coloured band, no window chrome; wordmark left; single ghost action right
[BODY]    centered card 860px wide, frosted glass #1A2435, 24px radius, 40px padding.
          Four numbered steps in a 2x2 grid:
          STEP 1 "Point the camera" — URL input showing "https://rhobear.ai"
          STEP 2 "Brief the director" — textarea reading "Film a crisp walkthrough of the
            onboarding flow, focus on the aha moment when the agent goes live",
            suggestion chips "onboarding" "analytics" "hype cut"
          STEP 3 "Choose a shot" — six cards 3x2, exactly: SaaS walkthrough, UX showcase,
            Feature spotlight, Tutorial, Social teaser, Login signup.
            "SaaS walkthrough" selected
          STEP 4 "Voice and format" — six voice cards: Charon HD, Kore HD, Aoede HD,
            Fenrir HD, Zephyr HD, Aria classic. "Charon HD" selected.
            Aspect pills 16:9 / 9:16 / 1:1, "16:9" selected
          Full-width primary button "Film it" beneath the grid
[ACCENT]  accent #4B7AC8 — used only for: the "Film it" button, the selected card borders,
          the step number badges, and the mark. All other text frost white or muted.
          No other accent hue appears anywhere in this frame.
[MARK]    wordmark glyph, 24px, #4B7AC8, left of the wordmark in the topbar. One mark only.
[TYPE]    display Rokkitt Bold; body Lato; mono Droid Sans Mono for the URL only
[FRAME]   Apple-like restraint, generous spacing, clear hierarchy, 16:9 2K
```

Note what is *not* in it: no "make it premium", no "modern and clean", no "beautiful". Those words
buy nothing — the restraint is in the FRAME block and the quality is in the specificity.

---

## Negative space — the ban list

Do not write these. Each one has produced a specific failure:

| Never write | Because |
|---|---|
| "a dark background" | GROUND is a paste; ambiguity yields a different navy per frame |
| "the RHOBEAR bear" | produced five bear styles (D-01) |
| "modern, clean, premium, beautiful, sleek" | zero information; the model already tries |
| "placeholder text" / "lorem" / "..." | renders literally, or invents (D-06) |
| "dash" / "em dash" as words | renders the word (D-05) |
| a font name near a content string | renders as UI text (D-04) |
| "etc." after a list | the generator continues the list, inventing (D-19) |
| "and other options" | same |
| an unnamed state | you get a populated one |
| the aspect at the end | shell loses the argument (D-24) |

---

## Batching

Generate by **screen family**, not one at a time. Consistency within a batch is markedly higher
than across batches because the model holds the run's context — the same reason all six Captur'd
Studio states came back coherent while the eight nav logos, generated across separate sessions,
came back as five different bears.

Batch order that works:

1. All states of one screen
2. All screens of one product
3. Brand pack + walkthrough last — they reference the screens, so generate them once the
   screens are approved

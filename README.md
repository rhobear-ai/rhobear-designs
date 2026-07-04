# Rhobear Designs

Design assets, the **RHOBEAR Website Editor**, and model comparison samples for the RHOBEAR brand.

## Website Editor (primary product)

MIT-licensed visual editor — import local HTML, edit on canvas, export HTML/CSS/ZIP.

```bash
cd editor
npm install
npm run dev      # http://localhost:5180
```

See [`editor/README.md`](editor/README.md) for full docs and `npm run test:e2e` for smoke tests.

## Structure

- `editor/` — **Website editor** (GrapesJS + RHOBEAR chrome, MIT)
- `samples/` — Model benchmark folders; each model gets one folder for its finished work
- `brand/` — Logo, colors, typography guidelines *(planned)*
- `assets/` — Icons, illustrations, imagery *(planned)*

## Model samples

See [`samples/README.md`](samples/README.md) for the full folder map and submission rules.

| Folder | Model | Status |
|--------|-------|--------|
| `samples/claude-opus-4.7/` | Claude Opus 4.7 | Awaiting |
| `samples/grok-composer-2.5/` | Grok Composer 2.5 | Awaiting |
| `samples/grok-build-beta/` | Grok Build Beta | Awaiting |
| `samples/minimax-m3-high/` | MiniMax M3 High | Awaiting |
| `samples/minimax-m3-medium/` | MiniMax M3 Medium | **Complete** — Bruno Simon portfolio |
| `samples/minimax-m2.7/` | MiniMax M2.7 | Awaiting |

## Brand colors

Starlight — the RHOBEAR family design system (shared with Hub / Plans /
Cloud Workbench):

- Floor: `#0a0e13` (dark, canonical) / `#f4f7f8` (light twin)
- Accent: `#3bd6c3` (starlight teal — the ONE accent, from the canon
  constellation bear)
- Text: `#e8eef2` on dark / `#182530` on light

See `.claude/skills/rhobear-family-design/SKILL.md` on `rhobear-app` for
the full token set and rules (one accent, no shadows, 8px radius, system
font stacks).
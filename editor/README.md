# RHOBEAR Designs — Website Editor

MIT-licensed visual website editor. Import existing HTML, edit on a live canvas, export clean HTML/CSS.

## Stack

| Layer | Source |
|-------|--------|
| Canvas + DOM tree + style inspector + serializer | [GrapesJS](https://grapesjs.com/) (MIT) |
| Blocks, forms, custom code embeds | GrapesJS plugins (MIT) |
| File import/export, ZIP bundling | Original (`src/lib/`) |
| Toolbar + panel chrome | Original, RHOBEAR theme |

## Quick start

```bash
cd editor
npm install
npm run dev        # http://localhost:5180
```

Production build + local serve:

```bash
npm run build
npm start          # http://localhost:4173
```

## Features

- **Open HTML** — single `.html` / `.htm` file from disk
- **Open Folder** — project folder with linked assets (images, CSS)
- **Save HTML** — download complete document with inlined `<style>`
- **Export ZIP** — `index.html` + `styles.css` + `assets/`
- **Canvas** — click-to-select, drag/drop blocks, resize handles
- **Layers** — element hierarchy panel
- **Styles** — layout, size, typography, decorations
- **Inline text** — double-click text to edit (GrapesJS rich text)
- **Embed** — paste iframe/HTML/script blocks
- **Device preview** — desktop / tablet / mobile widths
- **Undo / redo / duplicate / delete**

## Tests

```bash
npm run test:e2e
```

Playwright smoke suite verifies every toolbar button maps to a handler and performs its action.

## License

MIT — see [LICENSE](./LICENSE). Safe for commercial use.
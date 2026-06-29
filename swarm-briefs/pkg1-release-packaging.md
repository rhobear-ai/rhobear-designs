# Lane pkg1-release-packaging — Organize the editor for a clean MIT release

You are a swarm worker on chat-brain-1. WORKDIR is ALREADY a git worktree on branch `lane/pkg1-release-packaging`
off `build/editor-v1` of `deariencampbell1-sys/rhobear-designs`. The editor app is in **`editor/`**. Run from `editor/`.

## Goal
The product is feature-complete and tested. Package it for release: prove the build, write the docs,
make the licensing airtight (MIT, sellable), and tidy metadata. **Do NOT change app behavior or UI** — this
is packaging/docs/config only. (UX is the owner's; don't touch `editor/src/app/**`, `editor/src/styles/**`,
`index.html`, `editor/src/3d/**`, `editor/src/engine/**`, `editor/src/core/**` except to READ.)

## Hard guardrails
- No behavior/UI changes. No secrets. Don't delete samples or library data.
- Keep everything MIT-sellable: every dependency + vendored asset must be permissive (MIT/BSD/Apache/OFL).
  If you find anything copyleft (GPL/AGPL), STOP and flag it prominently in the PR — do not bury it.

## Tasks
1. **Prove the build:** `npm ci`; `npm run build` (must be GREEN, produces `dist/`);
   `npx playwright install --with-deps chromium` then `npm run test:e2e` (the smoke suite must pass — report the count).
   Put the evidence in the PR body.
2. **THIRD-PARTY-NOTICES.md** (repo root) — regenerate/extend to list EVERY runtime dependency with its
   version + SPDX license + upstream URL: vendored GrapesJS + its 5 plugins (BSD-3), `three` (MIT),
   `jszip` (MIT/GPL dual → elect MIT), `file-saver` (MIT), plus the open-license fonts catalog (OFL/Apache)
   and any CDN libs the 3D embed loads at runtime (three via esm.sh — note it). One header paragraph stating
   the product is MIT and all components are permissive + redistributable commercially.
3. **editor/README.md** — a real readme: what RHOBEAR Designs is (Canva-style website editor: Edit Live Site,
   Build from scratch, 3D Studio; BYO-LLM AI assist; templates + element stash; MIT). Quickstart
   (`npm install`, `npm run dev`), production build (`npm run build` → `dist/`, static-host it), how the
   BYO-LLM keys work (local only), and a short feature list. Keep it tight + accurate to the actual app.
4. **DEPLOY.md** (editor/) — how to ship the static `dist/` (any static host / GitHub Pages), and the note
   that the 3D embeds + AI need outbound network (CDN three / provider APIs).
5. **package.json** — set sensible release metadata: `description`, `license: "MIT"`, `repository`,
   `homepage`, `keywords`, `"files"` (so a publish would include the right paths). Bump `version` to `1.0.0`
   if not already. Do NOT add deps.
6. **.gitignore hygiene** — ensure `dist/`, `node_modules/`, `test-results/`, `playwright-report/`, and
   scratch files (`_shot*`, `_dbg*`, `_shots*`) are ignored at the editor level. Don't commit build output.
7. **RELEASE.md** (repo root) — a one-page release checklist + a summary of what shipped (modes, AI, 3D,
   stash count, template count) and the known follow-ups (true physics, canvas zoom-out, editing a
   template's own baked WebGL).

## DoD
- build GREEN + smoke passing (report counts), NOTICES complete + all-permissive (or copyleft flagged),
  README + DEPLOY + RELEASE written, package.json metadata set, .gitignore clean. No app/UI/engine code changed.

## Finish — commit, push, open PR (print URL)
```bash
cd "$(git rev-parse --show-toplevel)"
git add -A
git config user.email "swarm@rhobear"; git config user.name "pkg1-release-packaging"
git commit -m "chore(release): packaging — build/test evidence, THIRD-PARTY-NOTICES, README, DEPLOY, RELEASE, package metadata"
git push -u origin lane/pkg1-release-packaging
gh pr create --repo deariencampbell1-sys/rhobear-designs --base build/editor-v1 --head lane/pkg1-release-packaging \
  --title "Release packaging: docs, license notices, metadata, build+test proof" \
  --body "Packages the editor for an MIT release — no behavior/UI changes.

## Evidence
<paste: npm run build tail; test:e2e pass count; license summary (all permissive?)>

## DoD
- [x] build green + smoke passing  - [x] NOTICES all-permissive  - [x] README+DEPLOY+RELEASE  - [x] package metadata  - [x] gitignore clean  - [x] no app/UI/engine changes"
```
Print the final PR URL on its own line. Then STOP.

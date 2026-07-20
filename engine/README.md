# engine/ — THE METHOD, vendored on the open-design substrate

**This is the engine. It outranks the legacy `editor/` app.** Owner directive 2026-07-19: THE METHOD
(the gated design-system framework, spec at `C:\Users\slang\rhobear-design-system\`) ships as a new
screen inside RHOBEAR Designs — but where the existing `editor/` (GrapesJS PWA) constrains what the
engine needs, **Designs bends, not the engine.** Full context: memory `the-method-engine-home-and-priority`.

## What's vendored here, and why

`vendor/` is an **unmodified drop** from `github.com/nexu-io/open-design` (Apache-2.0), cloned to
`D:\open-design-upstream` and copied read-only into this branch on 2026-07-19. We are **keeping their
whole feature set** — not "skeleton then sever." Specifically:

```
vendor/
  apps/daemon/          the engine itself — Express daemon, SQLite, agent runtime registry,
                         skill/design-system/plugin services, HTTP+SSE API (~15M)
  packages/              every workspace package the daemon depends on: contracts, agui-adapter,
                         diagnostics, platform, plugin-runtime, registry-protocol, sidecar(-proto),
                         host, download, launcher-proto, metatool, release, components (~2M)
  design-systems-schema/ the REAL token contract (manifest.schema.ts, tokens.schema.ts, defaults.css)
                         our compiler's output must satisfy
  docs/                  architecture.md, agent-adapters.md, design-systems.md, skills-protocol.md,
                         spec.md, modes.md, plugins-spec.md, new-agent-runtime-acp.md, schemas/
  pnpm-workspace.yaml    upstream's workspace file, kept as reference for engine/'s own workspace
```

**Deliberately NOT vendored** (stripped, per the original fork decision — still valid):
`apps/web` (their Next.js UI — we build our own screen against the daemon's documented API instead,
matching Designs' Aurora Teal glass chrome, not their branding), `apps/desktop`/`landing-page`/`packaged`
(their shipping surface, not ours — Designs already has its own Tauri packaging), the 39M bundled
`design-systems/` catalog (151 systems we don't need — we bring exactly one: ours), the 3.8M `skills/`
catalog (we bring exactly one: `05-agent/SKILL.md`), `craft/`, `figma-plugin/`, `mocks/`, `e2e/`, `story/`,
`design-templates/`.

**Never**: track upstream, take their updates, or preserve compatibility. This is a point-in-time fork,
now ours. No rebase burden.

## The three integration seams (concrete, from reading their real code/docs)

**1 · Claude subscription login needs NO new engineering.** `vendor/apps/daemon/src/runtimes/defs/claude.ts`
spawns the user's own installed `claude` CLI (`claude -p --input-format stream-json --output-format
stream-json --permission-mode bypassPermissions`). That subprocess inherits **whatever auth the local
`claude` CLI already has** — including a subscription OAuth token from `claude setup-token` / `claude
login`. So "Claude (your subscription)" is already a selectable agent the moment a user has logged in
their local CLI once — it is not a thing we build, only a thing we **surface** (label it clearly in the
picker vs the BYOK/API-key providers already in `editor/src/ai/llm-client.js`). One human, one
subscription, one beneficiary — the sanctioned pattern. See memory `the-method-claude-sdk-subscription-adapter`.

**2 · Our corpus compiles to THEIR design-system package format.** `docs/design-systems.md` +
`design-systems-schema/manifest.schema.ts` / `tokens.schema.ts` define the real target: a package is
`manifest.json` + `DESIGN.md` (≥7 substantive H2 sections, agent-facing prose) + `tokens.css` (the A1/A2/
B-slot token contract our own `02-tokens/core.css` already speaks the same dialect of). **The seed
compiler's job (`i-changed-you-to-deep-sparrow.md` Phase 1) is: `seed.yaml → a design-systems/<slug>/
package the daemon's guard accepts.`** Their `pnpm guard` / `scripts/guard.ts` is the same shape as our
own gates — run both.

**3 · THE METHOD's agent instructions become a functional skill.** `docs/skills-protocol.md` +
`agent-adapters.md` §4: the daemon composes selected `SKILL.md` bodies into the system prompt and stages
them per-run into `.od-skills/`. `05-agent/SKILL.md` (THE METHOD's operating instructions) ports in as
`vendor's skills/the-method/SKILL.md` (or a sibling functional-skill root the daemon is pointed at) —
the daemon's existing skill-composition path is exactly the "drop-in agent instructions" mechanism THE
METHOD already assumes.

## What's still ours to build (not vendored, net-new)

- The **screen** — a new UI inside `editor/`'s existing shell (Aurora Teal glass, same chrome law as the
  rest of the app) that talks to `vendor/apps/daemon`'s HTTP+SSE API (`/api/agents`, `/api/design-systems`,
  `/api/chat`, `/api/projects`, …) — NOT a vendor of their Next.js `apps/web`.
- The **seed compiler** (`seed.yaml → tokens.css + DESIGN.md + manifest.json + blocks.md + beats.json`) —
  our differentiator, targeting the schema above.
- The **06-reference corpus + gated G0–G9 pipeline** as `skills/the-method/` content.
- The **scene generator** (`04-webgl/` → working three.js scroll-scene) — nothing upstream does this;
  it is the whole reason this exists as more than a design-systems package.
- Image/video gen wiring (Vertex/Nano Banana for images, HyperFrames for video) as daemon services
  alongside their existing media service, or as tool calls the skill exposes.

## Status (2026-07-19)

Vendor copied read-only on branch `feature/the-method-engine`. **Not yet installed, not yet built, not
yet verified to run.** Next mechanical steps: `engine/vendor` needs its own `package.json` +
`pnpm-workspace.yaml` (self-contained workspace, independent of `editor/`'s Vite build — does not touch
or risk the live PWA deploy, which only triggers on `editor/**`), `pnpm install`, `pnpm --filter
@open-design/daemon build`, then `node dist/cli.js --no-open` to prove the daemon boots. After that: point
it at one real design-systems package compiled from the RHOBEAR seed, and one real skill
(`the-method/SKILL.md`), and drive a run through `/api/chat` with the `claude` adapter to prove the whole
seam end to end.

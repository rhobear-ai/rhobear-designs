/* ═══════════════════════════════════════════════════════════════════════
   RHOBEAR Designs — METHOD desk (design-system builder)
   The 4th editor mode. Prompt an agent → image-first frames → tokens →
   type → components → an installable design system.

   Engine contract (identical for desktop sidecar and cloud):
     POST {ENGINE_URL}  { prompt, harness, mcp:[{name,url}] }
       → { frames:[dataURL…], tokens, palette:[{name,v}], type:[{role,font,size}], components:[string] }

   Harness: Claude (your subscription, desktop reach-over) drives the agent;
   image generation is ALWAYS Gemini and ALWAYS costs credits — never free.
   A credits check sits in the generate path (stubbed here; real metering is
   dev-phase D2). The module is self-contained: it injects its own CSS and
   builds its own DOM into the host element handed to it by the shell.
   ═══════════════════════════════════════════════════════════════════════ */

// Same-origin by default (the desktop sidecar / cloud proxy serves this path).
// Override with window.RHOBEAR_METHOD_ENGINE for local dev against server.py.
const ENGINE_URL = () =>
  (typeof window !== 'undefined' && window.RHOBEAR_METHOD_ENGINE) || '/api/method/generate';

const CSS = `
.rb-method { position:absolute; inset:0; display:flex; background:var(--rb-canvas-bg,#0e1013);
  font-family:var(--rb-font-body,'lato',system-ui,sans-serif); color:var(--rb-ink,#e8eef5); }
.rb-method__rail { width:340px; flex-shrink:0; display:flex; flex-direction:column;
  border-right:1px solid var(--rb-border,rgba(255,255,255,.08)); background:var(--rb-panel,#14171c); overflow-y:auto; }
.rb-method__head { display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding:14px 16px; border-bottom:1px solid var(--rb-border,rgba(255,255,255,.08)); }
.rb-method__title { font-weight:800; font-size:.95rem; }
.rb-method__badge { font-family:var(--rb-font-mono,monospace); font-size:.6rem; white-space:nowrap;
  color:var(--rb-brand,#ff3a2a); background:color-mix(in srgb,var(--rb-brand,#ff3a2a) 14%,transparent);
  padding:3px 8px; border-radius:20px; }
.rb-method__creds { font-family:var(--rb-font-mono,monospace); font-size:.62rem; color:var(--rb-ink-dim,#9aa7b4);
  padding:3px 8px; border-radius:20px; border:1px solid var(--rb-border,rgba(255,255,255,.08)); white-space:nowrap; }
.rb-method__creds b { color:var(--rb-brand,#ff3a2a); }
.rb-method__field { padding:14px 16px; border-bottom:1px solid var(--rb-border,rgba(255,255,255,.08)); }
.rb-method__label { display:block; font-family:var(--rb-font-mono,monospace); font-size:.62rem;
  text-transform:uppercase; letter-spacing:.08em; color:var(--rb-brand,#ff3a2a); margin-bottom:8px; }
.rb-method__hint { display:block; margin-top:8px; font-size:.68rem; color:var(--rb-ink-dim,#9aa7b4); line-height:1.5; }
.rb-method__in { width:100%; box-sizing:border-box; background:var(--rb-surface,#1b2027);
  border:1px solid var(--rb-border,rgba(255,255,255,.08)); border-radius:8px; color:inherit;
  font-family:inherit; font-size:.8rem; padding:8px 10px; outline:none; transition:border-color .15s; }
.rb-method__in:focus { border-color:var(--rb-brand,#ff3a2a);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--rb-brand,#ff3a2a) 14%,transparent); }
select.rb-method__in { appearance:none; cursor:pointer; }
.rb-method__mcp { display:flex; flex-direction:column; gap:6px; margin-bottom:8px; }
.rb-method__mcprow { display:flex; align-items:center; gap:8px; background:var(--rb-surface,#1b2027);
  border:1px solid var(--rb-border,rgba(255,255,255,.08)); border-radius:8px; padding:7px 10px; }
.rb-method__dot { width:7px; height:7px; border-radius:50%; background:#40d78c;
  box-shadow:0 0 8px rgba(64,215,140,.6); flex-shrink:0; }
.rb-method__mcpname { font-family:var(--rb-font-mono,monospace); font-size:.72rem; }
.rb-method__mcpurl { font-family:var(--rb-font-mono,monospace); font-size:.6rem; color:var(--rb-ink-dim,#9aa7b4); margin-left:auto; }
.rb-method__x { background:none; border:none; color:var(--rb-ink-dim,#9aa7b4); cursor:pointer; font-size:.7rem; margin-left:6px; }
.rb-method__x:hover { color:var(--rb-brand,#ff3a2a); }
.rb-method__mcpadd { display:grid; grid-template-columns:1fr 1fr auto; gap:6px; }
.rb-method__mcpadd .rb-method__in { font-size:.72rem; padding:7px 8px; }
.rb-method__chat { flex:1; min-height:120px; overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
.rb-method__msg { display:flex; flex-direction:column; gap:3px; }
.rb-method__who { font-family:var(--rb-font-mono,monospace); font-size:.58rem; text-transform:uppercase;
  letter-spacing:.08em; color:var(--rb-ink-dim,#9aa7b4); }
.rb-method__msg p { margin:0; font-size:.8rem; line-height:1.55; background:var(--rb-surface,#1b2027);
  border:1px solid var(--rb-border,rgba(255,255,255,.08)); border-radius:10px; padding:10px 12px; }
.rb-method__msg--you { align-items:flex-end; }
.rb-method__msg--you p { background:color-mix(in srgb,var(--rb-brand,#ff3a2a) 12%,transparent);
  border-color:color-mix(in srgb,var(--rb-brand,#ff3a2a) 30%,transparent); max-width:90%; }
.rb-method__compose { padding:12px 16px; border-top:1px solid var(--rb-border,rgba(255,255,255,.08)); }
.rb-method__compose textarea { resize:none; line-height:1.5; }
.rb-method__composeacts { display:flex; justify-content:space-between; align-items:center; margin-top:8px; }
.rb-method__btn { font-family:inherit; font-size:.75rem; font-weight:700; cursor:pointer; padding:7px 14px;
  border-radius:8px; border:1px solid var(--rb-border,rgba(255,255,255,.08)); background:var(--rb-surface,#1b2027); color:inherit; }
.rb-method__btn--go { background:var(--rb-brand,#ff3a2a); border-color:var(--rb-brand,#ff3a2a); color:#fff; }
.rb-method__btn--go:disabled { opacity:.6; cursor:default; }
.rb-method__btn--block { width:100%; padding:11px; margin-top:14px; }
.rb-method__stage { flex:1; display:flex; flex-direction:column; min-width:0; }
.rb-method__tabs { display:flex; gap:2px; padding:8px 16px 0; border-bottom:1px solid var(--rb-border,rgba(255,255,255,.08)); overflow-x:auto; }
.rb-method__tab { font-family:inherit; font-size:.76rem; font-weight:600; white-space:nowrap; padding:8px 14px;
  border:none; background:none; color:var(--rb-ink-dim,#9aa7b4); cursor:pointer; border-bottom:2px solid transparent; }
.rb-method__tab.is-active { color:var(--rb-brand,#ff3a2a); border-bottom-color:var(--rb-brand,#ff3a2a); }
.rb-method__body { flex:1; overflow-y:auto; padding:24px; }
.rb-method__panel { max-width:1000px; margin:0 auto; }
.rb-method__empty { display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; height:100%; gap:10px; color:var(--rb-ink-dim,#9aa7b4); }
.rb-method__empty h2 { font-size:1.5rem; font-weight:800; color:var(--rb-ink,#e8eef5); margin:0; }
.rb-method__empty p { max-width:420px; line-height:1.6; font-size:.85rem; }
.rb-method__frames { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
.rb-method__frame { aspect-ratio:16/10; border-radius:12px; border:1px solid var(--rb-border,rgba(255,255,255,.08));
  overflow:hidden; position:relative; display:flex; align-items:flex-end; padding:10px; }
.rb-method__frame img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.rb-method__frame span { position:relative; font-family:var(--rb-font-mono,monospace); font-size:.6rem; }
.rb-method__code { font-family:var(--rb-font-mono,monospace); font-size:.78rem; line-height:1.7;
  background:var(--rb-panel,#14171c); border:1px solid var(--rb-border,rgba(255,255,255,.08));
  border-radius:12px; padding:18px 20px; white-space:pre; overflow-x:auto; margin:0; }
.rb-method__sw { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; margin-bottom:28px; }
.rb-method__swatch { display:flex; align-items:center; gap:10px; background:var(--rb-surface,#1b2027);
  border:1px solid var(--rb-border,rgba(255,255,255,.08)); border-radius:10px; padding:10px; }
.rb-method__chip { width:30px; height:30px; border-radius:7px; border:1px solid var(--rb-border,rgba(255,255,255,.08)); flex-shrink:0; }
.rb-method__swname { font-size:.78rem; } .rb-method__swval { font-family:var(--rb-font-mono,monospace); font-size:.6rem; color:var(--rb-ink-dim,#9aa7b4); margin-left:auto; }
.rb-method__type { display:flex; flex-direction:column; gap:4px; }
.rb-method__trow { display:flex; align-items:baseline; gap:16px; padding:12px 14px; border-bottom:1px solid var(--rb-border,rgba(255,255,255,.08)); }
.rb-method__tspec { font-family:var(--rb-font-mono,monospace); font-size:.65rem; color:var(--rb-ink-dim,#9aa7b4); width:160px; flex-shrink:0; }
.rb-method__comp { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
.rb-method__compcard { background:var(--rb-surface,#1b2027); border:1px solid var(--rb-border,rgba(255,255,255,.08));
  border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:12px; min-height:96px; }
.rb-method__compname { font-family:var(--rb-font-mono,monospace); font-size:.62rem; text-transform:uppercase;
  letter-spacing:.08em; color:var(--rb-ink-dim,#9aa7b4); }
.rb-method__pkg { max-width:460px; margin:0 auto; }
.rb-method__pkgf { font-family:var(--rb-font-mono,monospace); font-size:.76rem; color:var(--rb-ink-dim,#9aa7b4);
  background:var(--rb-surface,#1b2027); border:1px solid var(--rb-border,rgba(255,255,255,.08));
  border-radius:8px; padding:10px 14px; margin-bottom:4px; }
.rb-method[hidden]{display:none;}
.rb-method__empty[hidden]{display:none;}
`;

function injectCss() {
  if (document.getElementById('rb-method-css')) return;
  const s = document.createElement('style');
  s.id = 'rb-method-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const HARNESS_LABELS = {
  'claude-sub': 'Claude · your plan',
  'claude-key': 'Claude · API key',
  'gemini': 'Gemini',
  'local': 'Local · Ursa',
};

/**
 * createMethodMode({ host, onStatus, getCredits })
 *  - host: the #method-host element to build into
 *  - onStatus: status-bar callback
 *  - getCredits: async () => number  (credits balance; image gen refused at 0)
 */
export function createMethodMode({ host, onStatus = () => {}, getCredits = null } = {}) {
  injectCss();

  const state = {
    harness: 'claude-sub',
    mcp: [{ name: 'designs-engine', url: 'stdio · built-in', builtin: true }],
    system: null,
    ref: null,
    built: false,
    onInstall: null,
  };

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  // ---- build DOM once ----
  function build() {
    if (state.built) return;
    host.classList.add('rb-method');
    host.innerHTML = `
      <div class="rb-method__rail">
        <div class="rb-method__head">
          <span class="rb-method__title">Design System Agent</span>
          <span class="rb-method__badge" data-role="harness-badge">Claude · your plan</span>
        </div>
        <div class="rb-method__field">
          <label class="rb-method__label">Harness</label>
          <select class="rb-method__in" data-role="harness">
            <option value="claude-sub">Claude — sign in with your subscription</option>
            <option value="claude-key">Claude — API key</option>
            <option value="gemini">Gemini</option>
            <option value="local">Local model (Ursa / Arcturus)</option>
          </select>
          <span class="rb-method__hint">The agent runs inside the RHOBEAR Designs engine. Image generation is always Gemini and always uses credits.</span>
        </div>
        <div class="rb-method__field">
          <label class="rb-method__label">MCP Connectors</label>
          <div class="rb-method__mcp" data-role="mcp-list"></div>
          <div class="rb-method__mcpadd">
            <input class="rb-method__in" data-role="mcp-name" placeholder="name (e.g. figma)" spellcheck="false">
            <input class="rb-method__in" data-role="mcp-url" placeholder="URL or npx cmd…" spellcheck="false">
            <button class="rb-method__btn" data-role="mcp-add">+ Connect</button>
          </div>
          <span class="rb-method__hint">Give the agent tools — Figma, a component library, your own MCP server.</span>
        </div>
        <div class="rb-method__chat" data-role="chat"></div>
        <div class="rb-method__compose">
          <textarea class="rb-method__in" data-role="prompt" rows="3"
            placeholder="e.g. A calm fintech for freelancers — trustworthy, warm, a little editorial. Deep navy + one warm accent."></textarea>
          <div class="rb-method__composeacts">
            <span class="rb-method__creds" data-role="creds">credits <b>—</b></span>
            <button class="rb-method__btn rb-method__btn--go" data-role="go">Generate system ✦</button>
          </div>
        </div>
      </div>
      <div class="rb-method__stage">
        <div class="rb-method__tabs">
          <button class="rb-method__tab is-active" data-tab="frames">Frames</button>
          <button class="rb-method__tab" data-tab="tokens">Tokens</button>
          <button class="rb-method__tab" data-tab="type">Type &amp; Color</button>
          <button class="rb-method__tab" data-tab="components">Components</button>
          <button class="rb-method__tab" data-tab="package">Package</button>
        </div>
        <div class="rb-method__body">
          <div class="rb-method__empty" data-role="empty">
            <h2>Your design system, generated.</h2>
            <p>Prompt the agent on the left. Frames render here first — then the whole system falls into place around them.</p>
          </div>
          <div class="rb-method__panel" data-panel="frames" hidden><div class="rb-method__frames" data-role="frames"></div></div>
          <div class="rb-method__panel" data-panel="tokens" hidden><pre class="rb-method__code" data-role="tokens"></pre></div>
          <div class="rb-method__panel" data-panel="type" hidden><div class="rb-method__sw" data-role="swatches"></div><div class="rb-method__type" data-role="typescale"></div></div>
          <div class="rb-method__panel" data-panel="components" hidden><div class="rb-method__comp" data-role="components"></div></div>
          <div class="rb-method__panel" data-panel="package" hidden>
            <div class="rb-method__pkg">
              <div class="rb-method__pkgf">manifest.json</div><div class="rb-method__pkgf">DESIGN.md</div>
              <div class="rb-method__pkgf">tokens.css</div><div class="rb-method__pkgf">frames/</div><div class="rb-method__pkgf">components/</div>
              <button class="rb-method__btn rb-method__btn--go rb-method__btn--block" data-role="install">Install to this project</button>
            </div>
          </div>
        </div>
      </div>`;

    const q = (sel) => host.querySelector(sel);
    // harness
    q('[data-role="harness"]').addEventListener('change', (e) => {
      state.harness = e.target.value;
      q('[data-role="harness-badge"]').textContent = HARNESS_LABELS[state.harness] || state.harness;
    });
    // mcp
    q('[data-role="mcp-add"]').addEventListener('click', addMcp);
    renderMcp();
    // compose
    q('[data-role="go"]').addEventListener('click', run);
    q('[data-role="install"]').addEventListener('click', install);
    // tabs
    host.querySelectorAll('.rb-method__tab').forEach((t) =>
      t.addEventListener('click', () => tab(t.dataset.tab)));
    say('agent', "Describe the brand you want, paste a seed, or drop a reference image. I'll generate the key frames first, then compile tokens, type, and components into an installable design system.");
    state.built = true;
  }

  const q = (sel) => host.querySelector(sel);

  function renderMcp() {
    const list = q('[data-role="mcp-list"]');
    list.innerHTML = '';
    state.mcp.forEach((m) => {
      const row = el('div', 'rb-method__mcprow');
      row.appendChild(el('span', 'rb-method__dot'));
      const name = el('span', 'rb-method__mcpname'); name.textContent = m.name; row.appendChild(name);
      const url = el('span', 'rb-method__mcpurl'); url.textContent = m.url; row.appendChild(url);
      if (!m.builtin) {
        const x = el('button', 'rb-method__x'); x.textContent = '✕';
        x.title = 'Remove';
        x.addEventListener('click', () => { state.mcp = state.mcp.filter((k) => k !== m); renderMcp(); });
        row.appendChild(x);
      }
      list.appendChild(row);
    });
  }
  function addMcp() {
    const nameEl = q('[data-role="mcp-name"]'), urlEl = q('[data-role="mcp-url"]');
    const name = (nameEl.value || '').trim(), url = (urlEl.value || '').trim();
    if (!name || !url) { (name ? urlEl : nameEl).focus(); return; }
    state.mcp.push({ name, url });
    nameEl.value = ''; urlEl.value = ''; renderMcp(); nameEl.focus();
  }

  function say(who, text) {
    const chat = q('[data-role="chat"]');
    const msg = el('div', `rb-method__msg rb-method__msg--${who}`);
    const w = el('span', 'rb-method__who'); w.textContent = who === 'agent' ? 'Agent' : 'You';
    const p = document.createElement('p'); p.textContent = text;
    msg.appendChild(w); msg.appendChild(p); chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function tab(name) {
    host.querySelectorAll('.rb-method__tab').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
    host.querySelectorAll('.rb-method__panel').forEach((p) => { p.hidden = p.dataset.panel !== name || !state.system; });
    q('[data-role="empty"]').hidden = !!state.system;
  }

  async function refreshCredits() {
    if (!getCredits) return null;
    try {
      const c = await getCredits();
      q('[data-role="creds"]').innerHTML = `credits <b>${c.toLocaleString()}</b>`;
      return c;
    } catch { return null; }
  }

  async function run() {
    const promptEl = q('[data-role="prompt"]');
    const prompt = (promptEl.value || '').trim();
    if (!prompt) { promptEl.focus(); return; }

    // Image gen is never free — refuse at zero credits.
    const bal = await refreshCredits();
    if (bal != null && bal <= 0) {
      say('agent', 'Out of credits — image generation needs a credit pack. Add credits to generate frames.');
      onStatus('Design System — out of credits');
      return;
    }

    const go = q('[data-role="go"]');
    say('you', prompt); promptEl.value = '';
    go.disabled = true; go.textContent = 'Generating…';
    q('[data-role="empty"]').hidden = true;
    tab('frames');
    say('agent', 'Generating the key frames first (image-first)…');
    onStatus('Design System — generating…');

    const spec = { prompt, harness: state.harness, mcp: state.mcp };
    try {
      const system = await callEngine(spec);
      state.system = system;
      renderSystem(system);
      tab('frames');
      say('agent', 'Frames rendered — tokens, type, and components compiled from them. Open Package to install it into this project.');
      onStatus('Design System — ready');
      refreshCredits();
    } catch (e) {
      say('agent', 'Generation failed: ' + (e && e.message ? e.message : e));
      onStatus('Design System — generation failed');
    } finally {
      go.disabled = false; go.textContent = 'Generate system ✦';
    }
  }

  async function callEngine(spec) {
    let r;
    try {
      r = await fetch(ENGINE_URL(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: spec.prompt, harness: spec.harness, mcp: spec.mcp }),
      });
    } catch (e) {
      // Network failure = no engine reachable (dev without the sidecar) → preview.
      return preview(spec);
    }
    if (r.status === 402) throw new Error('out of credits — add a credit pack');
    if (r.status === 404) return preview(spec); // endpoint not wired yet (dev) → preview
    if (!r.ok) throw new Error('engine ' + r.status);
    return await r.json();
  }

  // Standalone preview when no engine is wired (dev only).
  function preview(spec) {
    const seed = (spec.prompt || '').toLowerCase();
    const accent = /warm|editorial|fintech|calm/.test(seed) ? '#C8794B' : '#ff3a2a';
    const bg = /light|clean|airy/.test(seed) ? '#F7F4EF' : '#0E1116';
    const ink = bg[1] === 'F' ? '#1A1D22' : '#E8F0F7';
    const sys = {
      name: 'Generated System', accent, bg, ink,
      palette: [{ name: 'bg', v: bg }, { name: 'surface', v: bg[1] === 'F' ? '#FFFFFF' : '#161A20' },
        { name: 'ink', v: ink }, { name: 'muted', v: 'rgba(128,140,150,.7)' },
        { name: 'accent', v: accent }, { name: 'accent-soft', v: accent + '22' }],
      type: [{ role: 'Display', font: 'rokkitt', size: '2.6rem' }, { role: 'Heading', font: 'rokkitt', size: '1.5rem' },
        { role: 'Body', font: 'lato', size: '1rem' }, { role: 'Mono', font: 'droid-sans-mono', size: '.85rem' }],
      components: ['Button', 'Card', 'Nav', 'Hero', 'Input', 'Badge'],
      _preview: true,
    };
    sys.tokens = `:root {\n  --bg: ${bg};\n  --ink: ${ink};\n  --accent: ${accent};\n  --font-display: 'rokkitt', serif;\n  --font-body: 'lato', sans-serif;\n  --radius: 14px;\n}`;
    return new Promise((res) => setTimeout(() => res(sys), 500));
  }

  function renderSystem(sys) {
    q('[data-role="empty"]').hidden = true;
    host.querySelector('[data-panel="frames"]').hidden = false;
    const frames = q('[data-role="frames"]'); frames.innerHTML = '';
    const imgs = (sys.frames && sys.frames.length) ? sys.frames : [null, null, null];
    imgs.forEach((src, i) => {
      const f = el('div', 'rb-method__frame');
      if (src) { const im = document.createElement('img'); im.src = src; f.appendChild(im); }
      else { f.style.background = `linear-gradient(135deg,${sys.bg},${sys.accent}22)`; const s = document.createElement('span'); s.textContent = `frame ${i + 1}`; f.appendChild(s); }
      frames.appendChild(f);
    });
    q('[data-role="tokens"]').textContent = sys.tokens || '';
    const sw = q('[data-role="swatches"]'); sw.innerHTML = '';
    (sys.palette || []).forEach((c) => {
      const s = el('div', 'rb-method__swatch');
      s.innerHTML = `<span class="rb-method__chip" style="background:${c.v}"></span><span class="rb-method__swname">${c.name}</span><span class="rb-method__swval">${c.v}</span>`;
      sw.appendChild(s);
    });
    const ts = q('[data-role="typescale"]'); ts.innerHTML = '';
    (sys.type || []).forEach((t) => {
      const r = el('div', 'rb-method__trow');
      r.innerHTML = `<span class="rb-method__tspec">${t.role} · ${t.font}</span><span style="font-family:'${t.font}';font-size:${t.size}">Ag</span>`;
      ts.appendChild(r);
    });
    const comp = q('[data-role="components"]'); comp.innerHTML = '';
    (sys.components || []).forEach((name) => {
      const c = el('div', 'rb-method__compcard');
      c.innerHTML = `<span class="rb-method__compname">${name}</span>`;
      if (name === 'Button') c.innerHTML += `<button class="rb-method__btn rb-method__btn--go" style="align-self:flex-start;background:${sys.accent};border-color:${sys.accent}">Action</button>`;
      comp.appendChild(c);
    });
  }

  function install() {
    if (!state.system) return;
    say('agent', 'Installed. New pages in this project inherit the system.');
    if (typeof state.onInstall === 'function') state.onInstall(state.system);
    onStatus('Design System — installed to project');
  }

  // ---- public API (mirrors live/build/three modes) ----
  return {
    ensure() { build(); refreshCredits(); },
    onInstall(fn) { state.onInstall = fn; },
    getSystem() { return state.system; },
  };
}

/**
 * RHOBEAR Designs — Pro entitlement + upgrade/buy flow. 100% client-side, MIT.
 *
 * The free editor is NEVER crippled. Pro unlocks: voice control, generation
 * styles, and the deep-thinking toggle (and, in the hosted build, managed AI).
 *
 * Two unlock paths:
 *   1) A launch/promo CODE from PRO_CONFIG.codes (owner-set) — lets you start
 *      selling the moment your checkout link is live, before any license backend.
 *   2) A SIGNED license key (Ed25519, verified in-browser against the embedded
 *      public key) — the durable path once you issue keys.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OWNER — the ONLY things left before this sells (nothing here moves money until
 * you fill them; this is the "stops when you get here" boundary):
 *   • PRO_CONFIG.checkoutUrl : your PayPal / Stripe payment LINK. "Get Pro" sends
 *                              the buyer straight there.
 *   • PRO_CONFIG.pubKeyB64   : your license Ed25519 PUBLIC key (raw 32 bytes,
 *                              base64). Sign keys with the private key in the vault.
 *   • PRO_CONFIG.codes       : optional launch codes you email on purchase.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const PRO_CONFIG = {
  productName: 'RHOBEAR Designs Pro',
  priceLabel: '$19 / mo',            // display only — real price is set at checkout
  checkoutUrl: '',                   // <-- OWNER: your PayPal/Stripe payment link
  pubKeyB64: '',                     // <-- OWNER: license Ed25519 public key (raw 32B, base64)
  codes: [],                         // <-- OWNER (optional): ['LAUNCH-2026', ...]
  // ── Cloud plans (Designs Cloud lane) ────────────────────────────────────
  // These are the SUBSCRIPTION tiers the family `cloud-billing` lane sells via
  // Stripe Checkout (POST /cloud/billing/checkout). Prices are display-only —
  // Stripe is the source of truth. Live keys land as env on the family backend;
  // until then `startStripeCheckout` returns {ok:false, reason:'http_...'} and
  // the modal falls back to the launch-code / signed-license path below.
  plans: {
    pro:  { tier: 'pro',  label: 'Pro',  priceLabel: '$19 / mo', blurb: 'Full house-model lineup (URS / URS_MINOR), voice, generation styles, deep thinking.' },
    team: { tier: 'team', label: 'Team', priceLabel: '$49 / mo', blurb: 'Everything in Pro, plus shared workspaces (coming with the Team lane).' },
  },
  features: [
    ['Voice control', 'Hold to talk — say what to change and watch the page update.'],
    ['Generation styles', 'Editorial · SaaS-clean · Brutalist · Playful · Luxury presets.'],
    ['Deep thinking', 'Toggle a higher-reasoning pass for complex layouts.'],
    ['Custom & managed models', 'Point at any endpoint (local or premium), or use the hosted house models.'],
  ],
};

const LS_KEY = 'rb-pro';

// Lazy import so the BYOK / standalone build (which never touches the cloud)
// doesn't pull the session bridge into the entry graph until it's needed.
let _startCheckout = null; let _getGateState = null; let _loginUrl = null;
async function loadCloud() {
  if (!_startCheckout) {
    const m = await import('./cloud-session.js');
    _startCheckout = m.startCheckout;
    _getGateState = m.getGateState;
    _loginUrl = m.loginUrl;
  }
  return { startCheckout: _startCheckout, getGateState: _getGateState, loginUrl: _loginUrl };
}

// Cache of the last-seen server gate state, so isPro() can recognise a
// server-confirmed sub even before the client-side license/code is set.
let _serverTier = null;
export function setServerTier(t) { _serverTier = (t === 'pro' || t === 'basic' || t === 'dev') ? t : null; }
export function getServerTier() { return _serverTier; }

export function proState() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (_e) { return {}; } }
export function isPro() {
  // Server-confirmed subscription (Cloud) is the strongest signal.
  if (_serverTier === 'pro' || _serverTier === 'dev') return true;
  const s = proState();
  if (!s || !s.pro) return false;
  return s.until === 'forever' || (typeof s.until === 'number' && Date.now() < s.until);
}
function setPro(rec) { try { localStorage.setItem(LS_KEY, JSON.stringify(rec)); } catch (_e) { /* ignore */ } }
export function clearPro() { try { localStorage.removeItem(LS_KEY); } catch (_e) { /* ignore */ } }

// ── signed-license verification (Ed25519 via Web Crypto; fails closed) ────────
function b64ToBytes(b64) {
  const bin = atob(String(b64).replace(/-/g, '+').replace(/_/g, '/'));
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
async function verifySignedLicense(license) {
  if (!PRO_CONFIG.pubKeyB64) return null;            // no pubkey configured yet
  const parts = String(license).split('.');
  if (parts.length !== 2) return null;
  const [pB64, sB64] = parts;
  try {
    const key = await crypto.subtle.importKey('raw', b64ToBytes(PRO_CONFIG.pubKeyB64), { name: 'Ed25519' }, false, ['verify']);
    const ok = await crypto.subtle.verify('Ed25519', key, b64ToBytes(sB64), b64ToBytes(pB64));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64ToBytes(pB64)));
    if (payload.exp && Date.now() > payload.exp * 1000) return null;   // expired
    return { pro: true, until: payload.exp ? payload.exp * 1000 : 'forever', plan: payload.plan || 'pro', via: 'license' };
  } catch (_e) { return null; }
}

/** Redeem a promo code or signed license → unlocks Pro. Resolves {ok, message}. */
export async function redeem(codeOrLicense) {
  const v = String(codeOrLicense || '').trim();
  if (!v) return { ok: false, message: 'Enter your code or license key.' };
  if (PRO_CONFIG.codes.length && PRO_CONFIG.codes.map((c) => c.toUpperCase()).includes(v.toUpperCase())) {
    setPro({ pro: true, until: 'forever', plan: 'pro', via: 'code' });
    return { ok: true, message: 'Pro unlocked ✓' };
  }
  const rec = await verifySignedLicense(v);
  if (rec) { setPro(rec); return { ok: true, message: 'Pro license verified ✓' }; }
  return { ok: false, message: PRO_CONFIG.pubKeyB64 ? 'That code / license isn’t valid.' : 'Code not recognized yet.' };
}

/** Run `onAllowed` if Pro; otherwise show the upgrade modal. Returns whether it ran. */
export function requirePro(featureLabel, onAllowed) {
  if (isPro()) { onAllowed(); return true; }
  showUpgrade(featureLabel);
  return false;
}

// ── the upgrade / buy modal (injected — no index.html surgery needed) ─────────
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function buildModal() {
  const d = document.createElement('dialog');
  d.id = 'rb-pro-modal';
  d.className = 'rb-modal rb-pro-modal';
  d.innerHTML = `
    <form method="dialog" class="rb-modal__card" style="max-width:440px">
      <header class="rb-modal__head">
        <strong>Unlock ${esc(PRO_CONFIG.productName)}</strong>
        <button type="submit" class="rb-btn rb-btn--icon rb-btn--ghost" aria-label="Close">✕</button>
      </header>
      <p data-pro-feature style="color:#e94560;margin:.2rem 0 .6rem;font-weight:600"></p>
      <ul class="rb-pro-feats" style="list-style:none;padding:0;margin:0 0 1rem;display:grid;gap:.55rem">
        ${PRO_CONFIG.features.map(([t, s]) => `<li><strong style="color:#e94560">◆</strong> <strong>${esc(t)}</strong><br><span style="opacity:.7;font-size:.9em">${esc(s)}</span></li>`).join('')}
      </ul>
      <a data-pro-buy class="rb-btn rb-btn--primary" style="display:block;text-align:center;background:#e94560;border-color:#e94560" href="#" target="_blank" rel="noopener">Get Pro — ${esc(PRO_CONFIG.priceLabel)}</a>
      <button type="button" data-pro-buy-team class="rb-btn" style="display:block;text-align:center;margin-top:.5rem">Get Team — ${esc(PRO_CONFIG.plans.team.priceLabel)}</button>
      <div data-pro-msg role="status" aria-live="polite" style="min-height:1.1em;margin:.5rem 0 0;font-size:.9em;text-align:center"></div>
      <div style="margin-top:1rem">
        <label class="rb-field__label" for="rb-pro-code">Already bought? Redeem your code / license</label>
        <div style="display:flex;gap:.4rem;margin-top:.3rem">
          <input id="rb-pro-code" class="rb-input" placeholder="paste code or license key" style="flex:1" />
          <button type="button" data-pro-redeem class="rb-btn">Redeem</button>
        </div>
        <p data-pro-msg style="min-height:1.1em;margin:.4rem 0 0;font-size:.9em"></p>
      </div>
    </form>`;
  // Buy → owner's checkout (or a clear notice if not configured yet)
  const buy = d.querySelector('[data-pro-buy]');
  const buyTeam = d.querySelector('[data-pro-buy-team]');
  const msg = () => d.querySelector('[data-pro-msg]');
  async function buyPlan(tier) {
    const m = msg();
    if (m) { m.textContent = 'Redirecting to secure checkout…'; m.style.color = '#c9922b'; }
    const { startCheckout, loginUrl } = await loadCloud();
    const r = await startCheckout(tier, { successUrl: location.href, cancelUrl: location.href });
    if (r && r.ok && r.url) { window.location.href = r.url; return; }
    // Billing not configured yet (live Stripe keys are an owner-insert env).
    // Fall back to the legacy PayPal link / launch-code path.
    if (PRO_CONFIG.checkoutUrl) {
      if (tier === 'team') window.open(PRO_CONFIG.checkoutUrl, '_blank', 'noopener');
      else window.location.href = PRO_CONFIG.checkoutUrl;
      return;
    }
    // No checkout of any kind yet — surface a clear, non-broken message and
    // point the signed-out user at OAuth so they're ready when keys land.
    if (m) {
      m.textContent = 'Checkout is in test mode — live keys land today. Sign in to be ready.';
      m.style.color = '#c9922b';
    }
    const goLogin = document.createElement('a');
    goLogin.textContent = 'Sign in with Google';
    goLogin.href = loginUrl('google');
    goLogin.style.cssText = 'display:block;text-align:center;margin-top:.5rem;color:#e94560';
    if (m && !m.dataset.loginAdded) { m.after(goLogin); m.dataset.loginAdded = '1'; }
  }
  if (buy) buy.addEventListener('click', (e) => { e.preventDefault(); buyPlan('pro'); });
  if (buyTeam) buyTeam.addEventListener('click', () => buyPlan('team'));
  const redeemBtn = d.querySelector('[data-pro-redeem]');
  redeemBtn.addEventListener('click', async () => {
    const inp = d.querySelector('#rb-pro-code'); const msg = d.querySelector('[data-pro-msg]');
    const r = await redeem(inp.value);
    if (msg) { msg.textContent = r.message; msg.style.color = r.ok ? '#2e9e6b' : '#e94560'; }
    if (r.ok) { setTimeout(() => { try { d.close(); } catch (_e) {} window.dispatchEvent(new Event('rb-pro-changed')); }, 700); }
  });
  return d;
}
export function showUpgrade(featureLabel) {
  let m = document.getElementById('rb-pro-modal');
  if (!m) { m = buildModal(); document.body.appendChild(m); }
  const sub = m.querySelector('[data-pro-feature]');
  if (sub) sub.textContent = featureLabel ? `“${featureLabel}” is a Pro feature.` : '';
  const buy = m.querySelector('[data-pro-buy]');
  if (buy && PRO_CONFIG.checkoutUrl) buy.setAttribute('href', PRO_CONFIG.checkoutUrl);
  if (typeof m.showModal === 'function') m.showModal(); else m.setAttribute('open', '');
}

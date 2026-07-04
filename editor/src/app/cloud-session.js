/**
 * RHOBEAR Designs — Cloud session bridge to the FAMILY backend.
 *
 * The Designs Cloud lane's rule is "do not build new infra — reuse the family
 * backend." Every call here hits a route that already exists in the
 * rhobear-plans `board-render` lane (`owner-lane/board-render/src/server.ts`):
 *
 *   - `GET  /cloud/auth/me`                 — identity probe (who am I?)
 *   - `GET  /cloud/auth/google/start`       — redirect → Google OAuth consent
 *   - `GET  /cloud/auth/github/start`       — redirect → GitHub OAuth consent
 *   - `POST /cloud/auth/logout`             — clear the session cookie
 *   - `GET  /cloud/gate/state`              — the gate snapshot the UI draws
 *                                            meters from (state / tier / credits
 *                                            / unlocked / generate free-quota)
 *   - `POST /cloud/billing/checkout`        — `{tier}` → Stripe Checkout `{url}`
 *                                            (subscription mode; webhook upgrades
 *                                            cloud_subscriptions on completion)
 *
 * Same-origin by design. In dev, Vite proxies `/cloud/*` + `/v1/*` (see
 * `vite.config.js`). In prod, Caddy maps the same paths on
 * designs.rhobear.ai → the family API + gateway (see DEPLOY.md), so the
 * session cookie is first-party and `credentials:'include'` "just works".
 * An absolute override exists via `VITE_CLOUD_API_BASE` for split-origin
 * deploys (the cookie MUST then be scoped to `.rhobear.ai`).
 *
 * This module NEVER touches a secret and is safe to bundle in the public dist.
 * MIT — RHOBEAR Designs (Cloud lane).
 */

const CLOUD_API_BASE = String(import.meta.env?.VITE_CLOUD_API_BASE ?? '').replace(/\/+$/, '');

function apiUrl(path) {
  return `${CLOUD_API_BASE}${path}`;
}

/**
 * Fetch the gate snapshot. Never throws — returns `null` on any failure so the
 * UI can degrade to the offline/BYOK state instead of crashing. Mirrors the
 * family gate's own deny-by-default discipline.
 *
 * Shape (subset — see cloud-gate.ts `GateStateSnapshot`):
 *   {
 *     ok: true,
 *     userId: string|null,
 *     state: 'free'|'credits'|'sub'|'anonymous',
 *     tier: 'free'|'basic'|'pro'|'dev'|null,
 *     creditBalanceCents: number,
 *     unlocked: ['generate','save',...],
 *     accountType: 'user'|'dev'|null,
 *     storage: { usedBytes, limitBytes, source },
 *     generate?: { used, limit, remaining }   // FREE only, when limit>0
 *   }
 */
export async function getGateState() {
  try {
    const res = await fetch(apiUrl('/cloud/gate/state'), {
      credentials: 'include',
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body && body.ok ? body : null;
  } catch (_e) {
    return null;
  }
}

/** Identity probe → `{ userId, email, name }` or `null` when signed out. */
export async function whoami() {
  try {
    const res = await fetch(apiUrl('/cloud/auth/me'), {
      credentials: 'include',
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || !body.ok || !body.userId) return null;
    return body;
  } catch (_e) {
    return null;
  }
}

/**
 * The OAuth start URL for a provider. The caller does a top-level navigation
 * (`window.location`) so the family backend can set the session cookie and
 * round-trip back to Designs.
 */
export function loginUrl(provider = 'google', next = currentPath()) {
  const base = provider === 'github' ? '/cloud/auth/github/start' : '/cloud/auth/google/start';
  const q = next ? `?next=${encodeURIComponent(next)}` : '';
  return apiUrl(base + q);
}

export async function logout() {
  try {
    await fetch(apiUrl('/cloud/auth/logout'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
    });
  } catch (_e) { /* ignore — UI will reflect signed-out state on next probe */ }
}

/**
 * Start a Stripe Checkout for a plan tier. Returns the hosted Checkout URL the
 * family `cloud-billing` lane mints (`POST /cloud/billing/checkout`). The
 * caller redirects the top-level window to it.
 *
 *   - tier `'pro'`  → $19 / mo (PRO_CONFIG.plans.pro)
 *   - tier `'team'` → $49 / mo (PRO_CONFIG.plans.team)
 *
 * Rejects with `{ ok:false, reason }` when billing isn't configured (the owner
 * hasn't landed live Stripe keys yet) so the UI can fall back to the launch
 * code / signed-license path in `pro.js`.
 */
export async function startCheckout(tier, opts = {}) {
  if (tier !== 'pro' && tier !== 'team') {
    return { ok: false, reason: 'unknown_tier' };
  }
  let res;
  try {
    res = await fetch(apiUrl('/cloud/billing/checkout'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tier, successUrl: opts.successUrl, cancelUrl: opts.cancelUrl }),
    });
  } catch (_e) {
    return { ok: false, reason: 'network' };
  }
  const body = await res.json().catch(() => ({}));
  if (res.ok && body && body.ok && body.url) return { ok: true, url: body.url };
  return { ok: false, reason: body?.reason || `http_${res.status}` };
}

// ---------------------------------------------------------------------------
// Free-gen meter helpers. The gate's `generate` field (present only for FREE
// users with FREE_GENERATION_LIMIT > 0) drives the "N of M generations used"
// counter and the Upgrade swap. Centralising the arithmetic here keeps the UI
// callers honest about the `null` cases (signed-out, sub, or operator-disabled).
// ---------------------------------------------------------------------------

/**
 * @param {object|null} state  — the `getGateState()` result
 * @returns {{ active:boolean, used:number, limit:number, remaining:number }}
 *   `active` is true ONLY for a FREE user with a metered allowance.
 */
export function freeGenMeter(state) {
  if (!state || state.state !== 'free' || !state.generate) {
    return { active: false, used: 0, limit: 0, remaining: 0 };
  }
  const g = state.generate;
  const used = Math.max(0, Number(g.used) || 0);
  const limit = Math.max(0, Number(g.limit) || 0);
  const remaining = Math.max(0, Number(g.remaining ?? (limit - used)));
  return { active: limit > 0, used, limit, remaining };
}

/** True when the gate says `generate` is unlocked (sub / credits). */
export function canGenerate(state) {
  return !!(state && Array.isArray(state.unlocked) && state.unlocked.includes('generate'));
}

/** Convenience: is this gate state a paid tier (basic / pro / dev)? */
export function isPaidTier(state) {
  const t = state && state.tier;
  return t === 'basic' || t === 'pro' || t === 'dev';
}

function currentPath() {
  try { return window.location.pathname + window.location.search; } catch (_e) { return ''; }
}

export const CLOUD_BASE = CLOUD_API_BASE;

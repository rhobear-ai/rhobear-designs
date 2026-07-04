/**
 * Managed-AI client — the "house models" path (Cloud Free + Pro).
 *
 * The sibling BYOK client (`llm-client.js`) talks browser→provider with the
 * user's OWN key. This module is the OTHER mode the Designs Cloud lane adds:
 * a signed-in user routes through the RHOBEAR house gateway (`gw.rhobear.ai/v1`,
 * or same-origin `/v1` when Caddy reverse-proxies it) and the family backend
 * does the gating — see `cloud-gate.ts` / `cloud-credits.ts` / `cloud-free-quota.ts`
 * in the rhobear-plans `board-render` lane.
 *
 * Why this is a SEPARATE module (not a branch inside `llm-client.js`):
 *
 *   - No API key is ever held by the client. Authentication is the user's
 *     session cookie (`credentials: 'include'`), minted by the shared
 *     Google/GitHub OAuth in `cloud-auth.ts`. The browser never sees a
 *     RHOBEAR secret; the gateway holds the upstream provider keys.
 *   - The gateway returns a RHOBEAR envelope on denial — `402
 *     payment_required` (free-tier cap hit / out of credits) and `429`
 *     (per-user or per-IP spend cap — the "Plans /v1 relay fix"
 *     discipline). Those are NOT HTTP errors a BYOK caller ever sees;
 *     they drive the upgrade modal + free-gen meter in the UI. We lift
 *     them into typed errors (`PaymentRequiredError`,
 *     `ManagedRateLimitError`, `ManagedAuthError`) so `shell.js` can
 *     branch without string-matching.
 *   - The model set is the house lineup (`ARC` free default, `URS_MINOR`,
 *     `URS` Pro), NOT the BYOK catalog. The lane brief names exactly
 *     these three.
 *
 * Security notes (mirror the family gate's deny-by-default discipline):
 *
 *   - We NEVER echo a server error body to the user verbatim — only the
 *     envelope's intentional `message` field. A 500 from the gateway is
 *     reported as a generic "the house models are unavailable" so we
 *     don't leak pg/SQL stack traces the relay might log.
 *   - `credentials: 'include'` is the whole auth mechanism. In
 *     production the session cookie MUST be scoped to `.rhobear.ai`
 *     (`SameSite=None; Secure`) so a designs.rhobear.ai origin can
 *     authenticate against gw.rhobear.ai. The cleaner path (used by the
 *     Vite dev proxy + the recommended Caddy config in DEPLOY.md) is
 *     same-origin: Caddy maps `/v1/*` → gw and `/cloud/*` → the family
 *     API on designs.rhobear.ai itself, so the cookie is first-party.
 *   - This module NEVER reads `localStorage` for credentials and NEVER
 *     writes a secret. It is safe to bundle in the public dist.
 *
 * MIT — RHOBEAR Designs (Cloud lane).
 */

// ---------------------------------------------------------------------------
// Configuration. `VITE_MANAGED_BASE` lets an operator point the built dist at
// an absolute gateway (e.g. `https://gw.rhobear.ai`). The DEFAULT is the
// empty string = same-origin `/v1`, which is what both the Vite dev proxy
// (`vite.config.js` → /v1) and the production Caddy reverse-proxy serve.
// ---------------------------------------------------------------------------
const MANAGED_BASE = String(import.meta.env?.VITE_MANAGED_BASE ?? '').replace(/\/+$/, '');

/**
 * The house model lineup. The lane brief names exactly these three.
 *
 *   - `ARC`        — the free-tier default. Capped at ~1000 generations /
 *                    month per the FREE_GENERATION_LIMIT the gate enforces
 *                    (see `cloud-free-quota.ts`). FREE users may ONLY use
 *                    ARC; selecting URS_MINOR/URS as FREE is rejected by
 *                    the gate as a normal `payment_required`.
 *   - `URS_MINOR`  — mid tier (Pro).
 *   - `URS`        — full tier (Pro / Team).
 *
 * `defaultModel` is what the client sends when the caller doesn't pin one.
 * FREE users always get ARC; the UI hides the Pro models behind the upgrade
 * wall so a FREE user never accidentally triggers a 402.
 */
export const MANAGED_MODELS = {
  ARC: 'ARC',
  URS_MINOR: 'URS_MINOR',
  URS: 'URS',
};

export const MANAGED_MODEL_LABELS = {
  ARC: 'ARC — house fast model (Free)',
  URS_MINOR: 'URS Minor — house mid model (Pro)',
  URS: 'URS — house full model (Pro)',
};

export const DEFAULT_MANAGED_MODEL = MANAGED_MODELS.ARC;

// ---------------------------------------------------------------------------
// Typed errors. The shell branches on the class, not on a magic string.
// ---------------------------------------------------------------------------

/**
 * The gateway returned `402 payment_required` — the user is FREE and hit the
 * monthly ARC cap, OR selected a Pro-only model / feature without an active
 * sub or credits. Carries the envelope fields the upgrade modal needs to pick
 * the right CTA (`buy_credits` vs `subscribe`) and show the live balance.
 */
export class PaymentRequiredError extends Error {
  constructor(envelope) {
    super(envelope?.message || 'Payment required — upgrade to continue.');
    this.name = 'PaymentRequiredError';
    this.feature = envelope?.feature ?? 'generate';
    this.requiredAction = envelope?.requiredAction ?? 'buy_credits';
    this.requiredTier = envelope?.requiredTier ?? 'basic';
    this.state = envelope?.state ?? 'free';
    this.creditBalanceCents = Number(envelope?.creditBalanceCents ?? 0) || 0;
    this.tier = envelope?.tier ?? 'free';
  }
}

/**
 * The gateway returned `429` — the per-user OR per-IP spend cap tripped (the
 * hard ceiling that sits ABOVE the credit/free-quota logic, so a single user
 * or a single IP can never spend the house into a bill surprise). This is the
 * "Plans /v1 relay fix" discipline the lane makes MANDATORY for Designs too.
 */
export class ManagedRateLimitError extends Error {
  constructor(envelope) {
    super(envelope?.message || 'Spend cap reached — try again later.');
    this.name = 'ManagedRateLimitError';
    this.retryAfter = envelope?.retryAfter ?? null;
  }
}

/**
 * The gateway returned `401` — no session, or the session expired. The UI
 * prompts the user to sign in via the shared Google/GitHub OAuth.
 */
export class ManagedAuthError extends Error {
  constructor(envelope) {
    super(envelope?.message || 'Sign in to use the house models.');
    this.name = 'ManagedAuthError';
    this.loginRequired = true;
  }
}

/** Anything else from the gateway (5xx, malformed envelope). Generic message — never leaks upstream internals. */
export class ManagedUpstreamError extends Error {
  constructor(envelope, status) {
    super(envelope?.message || 'The house models are unavailable — try again.');
    this.name = 'ManagedUpstreamError';
    this.status = status ?? 0;
  }
}

// ---------------------------------------------------------------------------
// Core chat call. OpenAI-compatible shape (`/chat/completions`) so the house
// gateway is a drop-in for the BYOK compatible path — same request body,
// same response parsing. The ONLY differences are: no `authorization` header
// (the cookie authenticates), `credentials: 'include'`, and the typed denial
// handling above.
//
// @param {{
//   system?:string, user:string, model?:string, deep?:boolean,
//   baseUrl?:string, signal?:AbortSignal, maxTokens?:number,
// }} opts
// @returns {Promise<string>} assistant text
// ---------------------------------------------------------------------------
export async function managedChat(opts) {
  const o = opts || {};
  const user = o.user;
  if (!user) throw new Error('managedChat: user prompt is required.');
  const base = String(o.baseUrl ?? MANAGED_BASE).replace(/\/+$/, '');
  const url = `${base}/v1/chat/completions`;
  const model = o.model || DEFAULT_MANAGED_MODEL;

  const body = {
    model,
    max_tokens: o.maxTokens ?? (o.deep ? 8192 : 4096),
    messages: [],
    ...(o.deep ? { reasoning_effort: 'high' } : {}),
  };
  if (o.system) body.messages.push({ role: 'system', content: o.system });
  body.messages.push({ role: 'user', content: user });

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      // Cookie auth. Same-origin in prod (Caddy proxy) + dev (Vite proxy),
      // cross-origin absolute gateway in the optional VITE_MANAGED_BASE path.
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: o.signal ?? undefined,
    });
  } catch (e) {
    // Network/CORS failure before a response. The #1 cause when a self-hosted
    // gateway "returns nothing" — surface an actionable, non-leaky message.
    throw new ManagedUpstreamError(
      { message: `Could not reach the house models${base ? ` (${base})` : ''} — check your connection or try again.` },
      0,
    );
  }

  if (res.ok) {
    const d = await res.json().catch(() => ({}));
    const msg = d.choices && d.choices[0] && d.choices[0].message;
    return msg && msg.content ? msg.content : '';
  }

  // Non-2xx — parse the RHOBEAR envelope and lift to a typed error.
  const env = await res.json().catch(() => ({}));
  if (res.status === 401) throw new ManagedAuthError(env);
  if (res.status === 402) throw new PaymentRequiredError(env);
  if (res.status === 429) {
    const retryAfter = parseRetryAfter(res.headers?.get?.('retry-after'));
    throw new ManagedRateLimitError({ ...env, retryAfter });
  }
  throw new ManagedUpstreamError(env, res.status);
}

function parseRetryAfter(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isFinite(n)) return n * 1000; // seconds → ms
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t - Date.now() : null;
}

/**
 * Same OpenAI-compatible tool-calling loop the BYOK path uses, but routed
 * through the house gateway with cookie auth + typed denials. Lets a paired
 * house model drive the editor tools across rounds.
 *
 * @param {{
 *   system?:string, user:string, model?:string, deep?:boolean, baseUrl?:string,
 *   tools:Array<object>, dispatch:(name:string, args:object)=>Promise<any>|any,
 *   maxRounds?:number, signal?:AbortSignal,
 * }} opts
 * @returns {Promise<{ text:string, calls:Array<{name:string,args:object,out:any}> }>}
 */
export async function managedChatWithTools(opts) {
  const o = opts || {};
  if (!o.tools || !o.dispatch) throw new Error('managedChatWithTools: tools + dispatch are required.');
  const base = String(o.baseUrl ?? MANAGED_BASE).replace(/\/+$/, '');
  const url = `${base}/v1/chat/completions`;
  const model = o.model || DEFAULT_MANAGED_MODEL;
  const messages = [];
  if (o.system) messages.push({ role: 'system', content: o.system });
  messages.push({ role: 'user', content: o.user });
  const calls = [];

  for (let round = 0; round < (o.maxRounds ?? 5); round++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          messages,
          tools: o.tools,
          tool_choice: 'auto',
          ...(o.deep ? { reasoning_effort: 'high' } : {}),
        }),
        signal: o.signal ?? undefined,
      });
    } catch (_e) {
      throw new ManagedUpstreamError(
        { message: `Could not reach the house models${base ? ` (${base})` : ''} — check your connection or try again.` },
        0,
      );
    }

    if (res.status === 401) throw new ManagedAuthError(await res.json().catch(() => ({})));
    if (res.status === 402) throw new PaymentRequiredError(await res.json().catch(() => ({})));
    if (res.status === 429) {
      const env = await res.json().catch(() => ({}));
      throw new ManagedRateLimitError({ ...env, retryAfter: parseRetryAfter(res.headers?.get?.('retry-after')) });
    }
    if (!res.ok) throw new ManagedUpstreamError(await res.json().catch(() => ({})), res.status);

    const d = await res.json().catch(() => ({}));
    const msg = d.choices && d.choices[0] && d.choices[0].message;
    if (!msg) return { text: '', calls };
    const toolCalls = msg.tool_calls || [];
    if (!toolCalls.length) return { text: msg.content || '', calls };
    // Feed the assistant's tool-call turn back in, then each result, and loop.
    messages.push({ role: 'assistant', content: msg.content || '', tool_calls: toolCalls });
    for (const tc of toolCalls) {
      const name = tc.function && tc.function.name;
      let parsed = {};
      try { parsed = JSON.parse((tc.function && tc.function.arguments) || '{}'); } catch (_e) { /* keep empty */ }
      let out;
      try { out = { ok: true, data: await o.dispatch(name, parsed) }; }
      catch (e) { out = { ok: false, error: String(e && e.message || e) }; }
      calls.push({ name, args: parsed, out });
      messages.push({ role: 'tool', tool_call_id: tc.id || null, content: JSON.stringify(out) });
    }
  }
  return { text: '', calls };
}

/** The effective gateway root (so tests can reason about routing). */
export function managedBaseUrl(baseUrl) {
  return String(baseUrl ?? MANAGED_BASE).replace(/\/+$/, '');
}

/**
 * Central auth — session management for auth.rhobear.ai.
 *
 * The session arrives as ?rhobear_session=<token> on the OAuth/Dev redirect
 * from auth.rhobear.ai. We store it in localStorage (survives tab close) and
 * send `Authorization: Bearer <token>` on every API call.
 *
 * Designs stays usable signed-out — this is additive cross-device persistence
 * for preferences, not a wall in front of the editor.
 *
 * Endpoints consumed:
 *   GET /auth/me       — { user_id, email, plan, settings, entitled, is_dev, ... }
 *   GET /auth/settings — per-user JSON settings (consumed by prefs.js)
 *   PUT /auth/settings — shallow-merge upsert (consumed by prefs.js)
 *
 * MIT — RHOBEAR Designs (original)
 */

const SESSION_LS_KEY = 'rhobear_session';
const AUTH_BASE = 'https://auth.rhobear.ai';

let sessionToken = null;
let meCache = null;
const changeListeners = new Set();

/** Pick up a session token from URL param or stored value. Returns { signedIn }. */
export function initAuth() {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get('rhobear_session');

  if (fromUrl && fromUrl.startsWith('s_')) {
    // OAuth/Dev redirect just landed — capture the token and scrub the URL
    sessionToken = fromUrl;
    url.searchParams.delete('rhobear_session');
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem(SESSION_LS_KEY, sessionToken); } catch (_e) { /* quota */ }
  } else {
    // Restore a prior session
    try { sessionToken = localStorage.getItem(SESSION_LS_KEY); } catch (_e) { /* ignore */ }
    // If it doesn't start with s_ it's stale — treat as no session
    if (sessionToken && !sessionToken.startsWith('s_')) {
      sessionToken = null;
      try { localStorage.removeItem(SESSION_LS_KEY); } catch (_e) { /* ignore */ }
    }
  }

  if (sessionToken) {
    // Warm the /auth/me cache in the background
    fetchMe().catch(() => {});
  }

  _emit();
  return { signedIn: !!sessionToken };
}

export function isSignedIn() {
  return !!sessionToken;
}

export function getSession() {
  return sessionToken;
}

/**
 * Redirect to auth.rhobear.ai sign-in. Comes back to the current page.
 *
 * Google OAuth, not /auth/dev: /auth/dev is the staff/agent door — an
 * allow-listed email plus a shared password, not something a real customer
 * has. Every customer who ever clicked "Sign in" on Designs was being sent
 * to a form that rejects their email; Designs has never had a working
 * customer sign-in. auth.rhobear.ai already allow-lists a redirect back to
 * designs.rhobear.ai (AUTH_ALLOWED_REDIRECTS on the auth service), so this
 * needed no server-side change — the client was just pointed at the wrong
 * door. Staff/agent testing still works via the direct /auth/dev form.
 */
export function signIn() {
  const here = encodeURIComponent(window.location.href);
  window.location.href = `${AUTH_BASE}/auth/google/start?app_name=designs&redirect=${here}`;
}

/** Clear the session locally. Does NOT call the server logout endpoint. */
export function signOut() {
  const was = sessionToken;
  sessionToken = null;
  meCache = null;
  try { localStorage.removeItem(SESSION_LS_KEY); } catch (_e) { /* ignore */ }
  if (was) _emit();
}

export function onAuthChange(fn) {
  changeListeners.add(fn);
  return () => changeListeners.delete(fn);
}

function _emit() {
  for (const fn of changeListeners) {
    try { fn(!!sessionToken); } catch { /* guard */ }
  }
}

/**
 * Fetch /auth/me from the auth service. Returns the parsed body or null on
 * any error. Results are cached; call clearMeCache() to force a refresh.
 */
export async function fetchMe() {
  if (!sessionToken) return null;
  if (meCache) return meCache;
  try {
    const res = await fetch(`${AUTH_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    if (!res.ok) {
      if (res.status === 401) { signOut(); }
      return null;
    }
    const body = await res.json();
    meCache = body;
    return body;
  } catch {
    return null;
  }
}

export function clearMeCache() {
  meCache = null;
}

/**
 * Authenticated fetch wrapper. Sends the Bearer token, handles 401 by signing
 * out. Non-throwing — returns { response, body } on success, or null on
 * network error / 401.
 *
 * @param {string} path — absolute URL or path relative to AUTH_BASE
 * @param {RequestInit} [init]
 * @returns {Promise<{response: Response, body: any}|null>}
 */
export async function authFetch(path, init = {}) {
  if (!sessionToken) return null;
  const url = path.startsWith('http') ? path : `${AUTH_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init.headers || {}),
      },
    });
  } catch {
    return null; // offline
  }
  if (res.status === 401) {
    signOut();
    return null;
  }
  let body = null;
  try { body = await res.json(); } catch { /* empty response */ }
  return { response: res, body };
}

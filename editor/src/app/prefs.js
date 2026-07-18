/**
 * Server-synced user preferences (ported from rhobear-cloud-web prefs.ts).
 *
 * The bug this exists to kill: preferences (AI config, generation style, deep
 * thinking toggle, Designs API URL) lived ONLY in localStorage, so signing in
 * from another browser — or clearing storage — reset the user's setup.
 * Preferences belong to the USER, not the browser.
 *
 * localStorage stays as the fast local cache so first paint never waits on the
 * network; the auth service is the source of truth and wins once it answers.
 *
 * Contract (central auth service, live 2026-07-18):
 *   GET  /auth/settings  → { ...prefs }
 *   PUT  /auth/settings  ← { k:v, ... } (shallow-merged upsert)  → { ok }
 *
 * MIT — RHOBEAR Designs (original)
 */

import { authFetch } from './auth.js';

const LS_CACHE_KEY = 'rb-prefs-cache';

let cache = {};
let hydrated = false;
let inflight = null;
const listeners = new Set();
const localWrites = new Set();

/** True once the server has answered at least once (or definitively failed). */
export function prefsReady() {
  return hydrated;
}

export function getPref(key, fallback) {
  const v = cache[key];
  return v === undefined || v === null ? fallback : v;
}

export function onPrefs(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) {
    try { fn(cache); } catch { /* a bad listener must not break the rest */ }
  }
}

/**
 * Seed the cache from localStorage before the network answers. Only sets keys
 * that aren't already in the cache (so a hydrate that already ran is preserved).
 */
export function seedPrefs(patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (cache[k] === undefined) cache[k] = v;
  }
}

/**
 * Load the localStorage cache into memory. Call this before seedPrefs+hydrate
 * so the fast cache is available immediately.
 */
export function loadLocalCache() {
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        cache = { ...cache, ...parsed };
      }
    }
  } catch (_e) { /* corrupt cache — start fresh */ }
}

/**
 * Persist the current cache to localStorage (fast-read cache for next boot).
 */
export function persistLocalCache() {
  try {
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify(cache));
  } catch (_e) { /* quota */ }
}

/**
 * Pull the user's stored preferences from the auth service. Safe to call
 * repeatedly — de-duped. Resolves to the current cache.
 */
export function hydratePrefs() {
  if (inflight) return inflight;
  inflight = (async () => {
    const result = await authFetch('/auth/settings');
    if (result && result.response.ok) {
      const prefs = result.body;
      if (prefs && typeof prefs === 'object') {
        // Only merge keys the user hasn't written locally since hydrate started
        const server = Object.fromEntries(
          Object.entries(prefs).filter(([k]) => !localWrites.has(k)),
        );
        cache = { ...cache, ...server };
        persistLocalCache();
      }
    }
    // A 401 just means "not signed in yet" — the local cache stands.
    hydrated = true;
    inflight = null;
    emit();
    return cache;
  })();
  return inflight;
}

/**
 * Write preferences through: update the in-memory cache immediately (so the UI
 * is instant) and mirror to the server fire-and-forget. Never throws — losing a
 * preference write must never break the interaction that caused it.
 */
export function setPrefs(patch) {
  cache = { ...cache, ...patch };
  for (const k of Object.keys(patch)) localWrites.add(k);
  persistLocalCache();
  emit();
  // Server write — fire-and-forget
  void (async () => {
    try {
      await authFetch('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
    } catch {
      /* offline — local cache keeps the user's choice for this session */
    }
  })();
}

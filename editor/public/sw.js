/* RHOBEAR Designs — service worker.
   Client-side SPA, no backend.

   Strategy:
   - NAVIGATIONS + index.html: network-first, cache fallback. A new deploy is
     picked up on next launch with connectivity; offline still boots the last
     good shell. (Cache-first here is how installed PWAs get stuck on a stale
     bundle forever — the Plans app hit exactly that.)
   - Same-origin hashed assets: cache-first (immutable per build), network
     fallback, cached on first fetch.
   - Cross-origin (BYOK LLM providers, Google Fonts for user content, esm.sh,
     media): NOT intercepted — the browser talks straight to them. API calls
     from the installed app (iPad home-screen PWA / Microsoft-Store MSIX)
     behave exactly like in the tab. */
const CACHE = 'rhobear-designs-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest']).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isShellRequest(req, url) {
  if (req.mode === 'navigate') return true;
  const p = url.pathname;
  return p.endsWith('/index.html') || p.endsWith('/') || p.endsWith('/manifest.webmanifest');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Never touch non-GET or cross-origin — BYOK provider calls, fonts, media
  // go straight to the network untouched.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (isShellRequest(req, url)) {
    // Network-first: fresh deploys win; offline falls back to the cached shell.
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // Hashed assets: cache-first (immutable), fill cache from network.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

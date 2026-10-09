const CACHE_NAME = 'lotoaudit-v1';
const STATIC_ASSETS = [
  '/AuditorAI/',
  '/AuditorAI/index.html',
  '/AuditorAI/manifest.json',
  '/AuditorAI/icon.svg',
  '/AuditorAI/icon-maskable.svg',
];

// Install: pre-cache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always go to network for API calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Cache successful GET responses for static assets
          if (
            response.ok &&
            event.request.method === 'GET' &&
            !url.pathname.startsWith('/api/')
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: return cached index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/AuditorAI/index.html');
          }
        });
    })
  );
});

const CACHE_NAME = 'arova-app-shell-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon.svg'
];

// Install Event: Pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching app shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Safe intercept and caching
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Exclude API, SignalR hubs, and checkout endpoints from any caching
  if (
    requestUrl.pathname.includes('/api/') ||
    requestUrl.pathname.includes('/hubs/') ||
    requestUrl.pathname.includes('/checkout/')
  ) {
    return; // Pass through to network naturally
  }

  // 2. Navigation requests: Serve cached index.html shell when offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log('[Service Worker] Navigation failed, serving offline index.html shell');
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 3. Static assets: Use Cache-First with Network Fallback (and populate cache dynamically)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background for non-hashed resources just in case (Stale-While-Revalidate)
        if (!event.request.url.includes('-') && !/\.[a-f0-9]{16,}\./.test(event.request.url)) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Only cache successful local responses (do not cache opaque or error responses)
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        // Return fallback if asset not found and matches an expected image format
        if (event.request.destination === 'image') {
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#051424" />
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#555">Offline</text>
            </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

/**
 * Hbibna Service Worker
 * Provides offline shell caching and static asset preservation for cashier operations.
 * Sensitive data is handled strictly by tenant-isolated IndexedDB, not public HTTP cache.
 */

const CACHE_NAME = 'hbibna-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/site.webmanifest',
  '/favicon.ico',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/hbibna-logo.png',
];

// Install: Cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Hbibna SW pre-cache partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches & take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin, POST/PUT/DELETE requests, and API sync endpoints
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.includes('_supabase')
  ) {
    return;
  }

  // Next.js static files (_next/static/*) -> Network-first on localhost, Cache-first in production
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets/')) {
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      event.respondWith(
        fetch(request).catch(() => caches.match(request))
      );
      return;
    }

    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML Page Navigation (Cashier dashboard, etc.) -> Network-first with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          // Fallback to cached root
          return (await caches.match('/')) || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Default: Network with fallback to cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

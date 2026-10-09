// FiestaFlix Progressive Web App Service Worker
// Version: 1.2.0

const CACHE_NAME_STATIC = 'fiesta-static-v2';
const CACHE_NAME_API = 'fiesta-api-movies-v2';
const CACHE_NAME_IMAGES = 'fiesta-images-v2';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/favicon.svg',
];

// Install Event — precache core application assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache non-fatal error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![CACHE_NAME_STATIC, CACHE_NAME_API, CACHE_NAME_IMAGES].includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and WebSocket / HMR requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

  // Do NOT cache video media byte ranges (MP4 / HLS streams) in service worker cache
  if (
    request.headers.get('range') ||
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.m3u8')
  ) {
    return;
  }

  // 1. Movie Metadata API Requests (/api/movies, /api/tmdb, etc.)
  // Strategy: Network-First with Cache Fallback (guarantees fresh data, works offline)
  if (
    url.pathname.startsWith('/api/movies') ||
    url.pathname.startsWith('/api/tmdb') ||
    url.pathname.startsWith('/api/watch-history')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME_API).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Intermittent connectivity fallback
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({
                success: false,
                offline: true,
                message: 'Operating in offline mode. Cached data displayed.',
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              }
            );
          });
        })
    );
    return;
  }

  // 2. Image Assets (TMDB posters, Unsplash backdrops, icons)
  // Strategy: Stale-While-Revalidate / Cache-First
  if (
    url.hostname.includes('image.tmdb.org') ||
    url.hostname.includes('images.unsplash.com') ||
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(request)
            .then((networkRes) => {
              if (networkRes && networkRes.status === 200) {
                caches.open(CACHE_NAME_IMAGES).then((cache) => {
                  cache.put(request, networkRes);
                });
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME_IMAGES).then((cache) => {
                cache.put(request, clone);
              });
            }
            return networkRes;
          })
          .catch(() => {
            // Return cached fallback icon if available
            return caches.match('/icon-192.png');
          });
      })
    );
    return;
  }

  // 3. Static Next.js Bundles, CSS, Fonts, and HTML Shell
  // Strategy: Stale-While-Revalidate with Network Fallback
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME_STATIC).then((cache) => {
                cache.put(request, networkRes);
              });
            }
            return networkRes;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. HTML Page Navigation Requests
  // Strategy: Network-First with Cache Fallback to Shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME_STATIC).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
  }
});

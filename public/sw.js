const CACHE_NAME = 'plantai-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  
  // API Calls: Network First, fallback to cache
  if (req.url.includes('supabase.co') || req.url.includes('api.open-meteo.com')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const networked = fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => {});
      return cached || networked;
    })
  );
});

// Background Sync (Queued Motor Commands)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-relay-queue') {
    event.waitUntil(processRelayQueue());
  }
});

async function processRelayQueue() {
  // Logic to process queued API hits when online.
  // We'll trust the main app to handle this through indexedDB if needed,
  // but registering the sync event satisfies the PWA standard.
  return Promise.resolve();
}

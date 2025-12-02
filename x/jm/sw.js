const CACHE_NAME = 'plant-friend-v5';
const ASSETS = [
    './',
    './plant.html',
    './manifest.json',
    './icon.svg'
];

// Install - cache assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request).then((fetchRes) => {
                // Cache successful responses
                if (fetchRes.ok) {
                    const clone = fetchRes.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, clone);
                    });
                }
                return fetchRes;
            });
        }).catch(() => {
            // Offline fallback
            return caches.match('./plant.html');
        })
    );
});

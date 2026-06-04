var CACHE_NAME = 'todo-app-v2';
var URLS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './images/eva.png',
    './images/naruto.jpg',
    './images/itachi.jpg',
    'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap'
];

// Install — cache core files, activate immediately
self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

// Activate — clean up old caches and take control immediately
self.addEventListener('activate', function(event) {
    event.waitUntil(
        Promise.all([
            caches.keys().then(function(names) {
                return Promise.all(
                    names.filter(function(name) { return name !== CACHE_NAME; })
                        .map(function(name) { return caches.delete(name); })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch — try network first, fall back to cache if offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Update cache with fresh copy
                if (response.ok) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(function() {
                // Offline — fall back to cache
                return caches.match(event.request);
            })
    );
});

// PWA kurulumu için gerekli temel Service Worker
// Gelişmiş önbellekleme (caching) eklenebilir, ancak uygulamanın yüklenebilir (Installable)
// olması için bu boş veya basit SW bile yeterlidir.

const CACHE_NAME = 'mikyas-video-v5';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Anında aktifleş
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Şimdilik sadece ağı (network) kullan
    event.respondWith(fetch(event.request));
});

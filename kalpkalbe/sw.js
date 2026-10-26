// KalpKalbe PWA & APK Background Service Worker
const CACHE_NAME = 'kalp-kalbe-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Ağ ve Önbellek Yönetimi
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});

// Arka Planda Canlı Push Bildirimi (Uygulama Kapalıyken)
self.addEventListener('push', (e) => {
  let data = {};
  if (e.data) {
    try {
      data = e.data.json();
    } catch(err) {
      data = { body: e.data.text() };
    }
  }

  const title = data.title || "KalpKalbe 💓";
  const options = {
    body: data.body || "Sevgilinden bir dokunuş var!",
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: data.vibrate || [300, 150, 300, 250, 400, 200, 500, 200, 700],
    data: data,
    tag: 'kalpkalbe-touch',
    renotify: true,
    requireInteraction: true
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

// Bildirime Dokunulduğunda Uygulamayı Ön Plana Getirme
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./index.html');
      }
    })
  );
});

const CACHE_NAME = 'voicelens-ocr-ai-cache-v52-1';
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
    'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js',
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                    return null;
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = req.url || '';
    if (url.endsWith('.apk')) return;

    // OCR dil modelleri (.traineddata), WASM ve CDN kütüphaneleri için Önce-Önbellek (Cache-First -> 0ms yükleme + tam çevrimdışı destek)
    const isHeavyAiOrOcrAsset =
        url.includes('cdn.jsdelivr.net') ||
        url.includes('projectnaptha.com') ||
        url.includes('traineddata') ||
        url.endsWith('.wasm') ||
        url.endsWith('.wasm.js');

    if (isHeavyAiOrOcrAsset) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) =>
                cache.match(req).then((cached) => {
                    if (cached) return cached;
                    return fetch(req).then((netRes) => {
                        if (netRes && (netRes.status === 200 || netRes.type === 'opaque')) {
                            cache.put(req, netRes.clone()).catch(() => {});
                        }
                        return netRes;
                    });
                })
            )
        );
        return;
    }

    // Uygulama kodları (index.html, app.js, style.css) için Önce-Canlı-Sunucu (Network-First), internet yoksa Çevrimdışı Önbellek
    event.respondWith(
        fetch(req)
            .then((netRes) => {
                if (netRes && netRes.status === 200) {
                    const clone = netRes.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, clone).catch(() => {}));
                }
                return netRes;
            })
            .catch(() => caches.match(req))
    );
});


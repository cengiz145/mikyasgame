// Firebase Bağlantı Ayarları (Çevrimdışı, Çift Yükleme ve Kısmi CDN Korumalı)
(function () {
    const root = typeof window !== 'undefined' ? window : globalThis;

    const firebaseConfig = root.firebaseConfig || {
        apiKey: "AIzaSyBDGdQjm6NX8ANQm90HJR8wD2Nk2E1h-ro",
        authDomain: "hgfz-5a1ca.firebaseapp.com",
        projectId: "hgfz-5a1ca",
        storageBucket: "hgfz-5a1ca.firebasestorage.app",
        messagingSenderId: "306647848341",
        appId: "1:306647848341:web:2906c477450f999130129c",
        databaseURL: "https://hgfz-5a1ca-default-rtdb.firebaseio.com"
    };
    root.firebaseConfig = firebaseConfig;

    function initFirebaseSafe() {
        try {
            if (typeof firebase !== 'undefined' && firebase && typeof firebase.initializeApp === 'function' && typeof firebase.database === 'function') {
                const app = (Array.isArray(firebase.apps) && firebase.apps.length > 0)
                    ? firebase.app()
                    : firebase.initializeApp(firebaseConfig);
                root.db = firebase.database(app);
                return root.db;
            }
            console.warn("[ÇEVRİMDİŞİ MOD AKTİF] Firebase SDK yüklenmedi, yerel modda devam ediliyor.");
            root.db = null;
            return null;
        } catch (error) {
            console.warn("[ÇEVRİMDİŞİ MOD AKTİF] Veritabanı bağlantısı başlatılamadı:", error);
            if (!root.db) root.db = null;
            return root.db;
        }
    }

    root.initFirebaseDb = initFirebaseSafe;
    initFirebaseSafe();

    if (typeof root.addEventListener === 'function') {
        root.addEventListener('online', function () {
            if (!root.db) {
                initFirebaseSafe();
            } else if (typeof root.db.goOnline === 'function') {
                try { root.db.goOnline(); } catch (e) {}
            }
        });
    }
})();



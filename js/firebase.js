// Firebase Bağlantı Ayarları
const firebaseConfig = { 
    apiKey: "AIzaSyBDGdQjm6NX8ANQm90HJR8wD2Nk2E1h-ro", 
    authDomain: "hgfz-5a1ca.firebaseapp.com", 
    projectId: "hgfz-5a1ca", 
    storageBucket: "hgfz-5a1ca.firebasestorage.app", 
    messagingSenderId: "306647848341", 
    appId: "1:306647848341:web:2906c477450f999130129c" 
};

// Uygulamayı güvenli başlat (Offline Çökme Koruması)
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        window.db = firebase.database();
    } else {
        throw new Error("Firebase kütüphanesi yüklenemedi.");
    }
} catch (error) {
    console.warn("[ÇEVRİMDİŞİ MOD AKTİF] Veritabanı bağlantısı yok veya internet koptu:", error);
    window.db = null; // Sistem çevrimdışı oynanış için db'yi nazikçe atlar
}

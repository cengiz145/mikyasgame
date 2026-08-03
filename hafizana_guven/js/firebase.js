// Firebase Bağlantı Ayarları
const firebaseConfig = { 
    apiKey: "AIzaSyBDGdQjm6NX8ANQm90HJR8wD2Nk2E1h-ro", 
    authDomain: "hgfz-5a1ca.firebaseapp.com", 
    projectId: "hgfz-5a1ca", 
    storageBucket: "hgfz-5a1ca.firebasestorage.app", 
    messagingSenderId: "306647848341", 
    appId: "1:306647848341:web:2906c477450f999130129c",
    databaseURL: "https://hgfz-5a1ca-default-rtdb.firebaseio.com"
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

// ==========================================
// ARKA PLAN VERİ TABANI KÖPRÜLERİ (Kur ve Unut)
// ==========================================
// ui.js dosyası doğrudan veritabanına bağlanmak yerine bu köprüleri kullanır.
// Bu sayede arayüz dosyası hafifler ve veri işlemleri sadece buradan yönetilir.

window.fb_mesajGonder = function(mesajVerisi) {
    if (!window.db) return Promise.reject("Çevrimdışı");
    return window.db.ref('messages').push(mesajVerisi).then(() => {
        // 50 Mesaj Kotası: Eski mesajları sil
        window.db.ref('messages').once('value').then(snapshot => {
            let total = snapshot.numChildren();
            if (total > 50) {
                let excessCount = total - 50;
                let i = 0;
                snapshot.forEach(child => {
                    if (i < excessCount) {
                        child.ref.remove();
                    }
                    i++;
                });
            }
        });
    });
};

window.fb_oyuncuYasakla = function(oyuncuAdi) {
    if (!window.db) return Promise.reject("Çevrimdışı");
    return window.db.ref('banned_users/' + oyuncuAdi).set(true);
};

window.fb_yasakKaldir = function(oyuncuAdi) {
    if (!window.db) return Promise.reject("Çevrimdışı");
    return window.db.ref('banned_users/' + oyuncuAdi).remove();
};

window.fb_ozelMesajGonder = function(roomId, gonderici, alici, mesajMetni) {
    if (!window.db) return;
    
    // Odaya mesajı ekle
    window.db.ref(`privateChats/${roomId}`).push({
        sender: gonderici,
        text: mesajMetni,
        time: firebase.database.ServerValue.TIMESTAMP
    });

    // Alıcıya bildirim (inbox) gönder
    window.db.ref(`inbox/${alici}`).push({
        from: gonderici,
        time: firebase.database.ServerValue.TIMESTAMP
    });
};

window.fb_biletCoz = function(oyuncuAdi, mesajMetni) {
    if (!window.db) return;
    window.db.ref('biletler/' + oyuncuAdi).push({
        durum: "Çözüldü",
        message: mesajMetni,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    // Geri bildirim kuyruğundan sil
    window.db.ref('feedbacks').once('value').then(snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                let fb = child.val();
                if (fb.nickname && fb.nickname.toLowerCase() === oyuncuAdi.toLowerCase()) {
                    child.ref.remove();
                }
            });
        }
    });
};

window.fb_rutbeDegistir = function(oyuncuAdi, yeniRutbe) {
    if (!window.db) return Promise.reject("Çevrimdışı");
    return window.db.ref('ranks/' + oyuncuAdi).set(yeniRutbe);
};

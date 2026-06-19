const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('BILDIRIM MOTORU (NODE.JS) BASLATILIYOR...');
console.log('==============================================');

// Service Account dosyasini yukle
const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('HATA: service-account.json dosyasi bulunamadi!');
    process.exit(1);
}
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hgfz-5a1ca-default-rtdb.firebaseio.com'
});

const db = admin.database();

// Mesajlari yukle
const messagesPath = path.join(__dirname, 'bildirim_mesajlari.json');
let mesajHavuzu = [];
if (fs.existsSync(messagesPath)) {
    const rawData = fs.readFileSync(messagesPath, 'utf8');
    // Eger BOM varsa temizle (Powershell bazen UTF8 BOM yapiyor)
    const cleanData = rawData.replace(/^\uFEFF/, '');
    mesajHavuzu = JSON.parse(cleanData);
} else {
    console.error('HATA: bildirim_mesajlari.json bulunamadi!');
    process.exit(1);
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
// Test icin bunu kisaltabilirsiniz, orn: const TWENTY_FOUR_HOURS_MS = 60 * 1000; (1 dakika)

async function checkAndSendNotifications() {
    try {
        const now = Date.now();
        
        // 1. Verileri cek
        const presenceSnap = await db.ref('presence').once('value');
        const presenceData = presenceSnap.val() || {};
        
        const tokensSnap = await db.ref('bildirim_adresleri').once('value');
        const tokensData = tokensSnap.val() || {};
        
        const historySnap = await db.ref('bildirim_gecmisi').once('value');
        const historyData = historySnap.val() || {};

        for (const [playerName, data] of Object.entries(presenceData)) {
            // Eger kullanici online degilse ve 24 saati gectiyse
            if (data.state !== 'online' && (now - data.last_changed) > TWENTY_FOUR_HOURS_MS) {
                
                // Oyuncunun Token'i var mi?
                if (tokensData[playerName] && tokensData[playerName].token) {
                    const token = tokensData[playerName].token;
                    
                    // Daha once bildirim atilmis mi kontrol et
                    let notifData = historyData[playerName] || { last_notified: 0, count: 0 };
                    
                    // Eger oyuncu oyuna geri donduyse sayaci (count) sifirla
                    if (notifData.last_notified < data.last_changed) {
                        notifData.count = 0;
                    }
                    
                    // Eger bildirim sayisi 3'ten kucukse (3 gun dolmadiysa) 
                    // VE son atilan bildirimin uzerinden 24 saat gectiyse (Gunde sadece 1 mesaj atmak icin)
                    if (notifData.count < 3 && (now - notifData.last_notified) > TWENTY_FOUR_HOURS_MS) {
                        
                        // Rastgele mesaj sec
                        const rastgeleIndex = Math.floor(Math.random() * mesajHavuzu.length);
                        const secilenMesaj = mesajHavuzu[rastgeleIndex];
                        
                        console.log(BILDIRIM TETIKLENDI -> [\]: \);
                        
                        const message = {
                            notification: {
                                title: 'Hafızana Güven 🧠',
                                body: secilenMesaj
                            },
                            token: token
                        };

                        try {
                            const response = await admin.messaging().send(message);
                            console.log(BASARILI: \ - \);
                            
                            // Tarihceyi guncelle (Spam'i durdurur)
                            await db.ref(ildirim_gecmisi/\).set({
                                last_notified: now
                            });
                        } catch (error) {
                            console.error(HATA: \ bildirim gönderilemedi:, error);
                            // Eger Token invalid ise (kullanici izni kaldirdiysa) tokeni silmek iyi olabilir
                            if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
                                await db.ref(ildirim_adresleri/\).remove();
                                console.log(Gecersiz Token Silindi: \);
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Dongu hatasi:', err);
    }
}

// Sistemi baslat
console.log('Sistem aktif! Her 1 dakikada bir kontrol edilecek...');
checkAndSendNotifications(); // Ilk kontrol hemen
setInterval(checkAndSendNotifications, 60 * 1000); // Sonra her dakika
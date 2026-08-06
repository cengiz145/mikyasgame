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
// ==========================================
// 3. SOHBET VE OZEL MESAJ ENTEGRASYONU (Real-Time Push)
// ==========================================

let isInitialChatLoad = true;
setTimeout(() => { isInitialChatLoad = false; }, 5000); // Ilk acilistaki eski mesajlari atlamak icin

// --- A. GENEL SOHBET (MESSAGES) ---
db.ref('messages').on('child_added', async (snapshot) => {
    if (isInitialChatLoad) return;
    const msg = snapshot.val();
    if (!msg || !msg.sender || !msg.text) return;
    
    try {
        const [presenceSnap, tokensSnap, historySnap] = await Promise.all([
            db.ref('presence').once('value'),
            db.ref('bildirim_adresleri').once('value'),
            db.ref('bildirim_gecmisi').once('value')
        ]);
        
        const presenceData = presenceSnap.val() || {};
        const tokensData = tokensSnap.val() || {};
        const historyData = historySnap.val() || {};
        const now = Date.now();
        
        for (const playerName in tokensData) {
            if (playerName === msg.sender) continue; // Kendine bildirim atma
            
            const playerState = presenceData[playerName] ? presenceData[playerName].state : 'offline';
            if (playerState !== 'online') {
                const lastChatNotif = (historyData[playerName] && historyData[playerName].last_chat_notif) ? historyData[playerName].last_chat_notif : 0;
                
                // Genel sohbet icin SPAM KORUMASI: Bir oyuncuya genel sohbetten en fazla 2 saatte bir bildirim gitsin
                if (now - lastChatNotif > (2 * 60 * 60 * 1000)) {
                    await admin.messaging().send({
                        token: tokensData[playerName].token,
                        notification: {
                            title: "Sohbette Yeni Mesaj!",
                            body: msg.sender + ": " + msg.text
                        }
                    });
                    await db.ref(ildirim_gecmisi/ + playerName + /last_chat_notif).set(now);
                    console.log([SOHBET BILDIRIMI]  + playerName +  adli oyuncuya gonderildi.);
                }
            }
        }
    } catch (e) {
        console.error("Sohbet bildirimi gonderilirken hata:", e);
    }
});

// --- B. OZEL MESAJLAR (INBOX) ---
async function handleNewPrivateMessage(snapshot) {
    if (isInitialChatLoad) return;
    const recipient = snapshot.key;
    const inboxItems = snapshot.val();
    if (!inboxItems) return;
    
    const keys = Object.keys(inboxItems);
    const lastKey = keys[keys.length - 1];
    const lastMsg = inboxItems[lastKey];
    
    // Mesaj son 1 dakika icinde geldiyse taze mesajdir
    if (Date.now() - lastMsg.time < 60000) {
        try {
            const tokenSnap = await db.ref(ildirim_adresleri/ + recipient).once('value');
            const tokenData = tokenSnap.val();
            
            if (tokenData && tokenData.token) {
                const presenceSnap = await db.ref(presence/ + recipient).once('value');
                const presenceData = presenceSnap.val();
                
                // Sadece oyuncu oyunda degilse ozel mesaj bildirimi gonder
                if (!presenceData || presenceData.state !== 'online') {
                    await admin.messaging().send({
                        token: tokenData.token,
                        notification: {
                            title: "1 Yeni Özel Mesajınız Var!",
                            body: lastMsg.from + " size özel bir mesaj gönderdi."
                        }
                    });
                    console.log([OZEL MESAJ BILDIRIMI]  + recipient +  adli oyuncuya gonderildi. Gonderen:  + lastMsg.from);
                }
            }
        } catch (e) {
            console.error("Ozel mesaj bildirimi gonderilirken hata:", e);
        }
    }
}

db.ref('inbox').on('child_added', handleNewPrivateMessage);
db.ref('inbox').on('child_changed', handleNewPrivateMessage);

console.log("Chat (Sohbet ve Ozel Mesaj) sistemi aktif dinleniyor...");

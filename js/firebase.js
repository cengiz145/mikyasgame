// Firebase BaÄŸlantÄ± AyarlarÄ±
const firebaseConfig = { 
    apiKey: "AIzaSyBDGdQjm6NX8ANQm90HJR8wD2Nk2E1h-ro", 
    authDomain: "hgfz-5a1ca.firebaseapp.com", 
    projectId: "hgfz-5a1ca", 
    storageBucket: "hgfz-5a1ca.firebasestorage.app", 
    messagingSenderId: "306647848341", 
    appId: "1:306647848341:web:2906c477450f999130129c",
    databaseURL: "https://hgfz-5a1ca-default-rtdb.firebaseio.com"
};

// UygulamayÄ± gÃ¼venli baÅŸlat (Offline Ã‡Ã¶kme KorumasÄ±)
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        window.db = firebase.database();
    } else {
        throw new Error("Firebase kÃ¼tÃ¼phanesi yÃ¼klenemedi.");
    }
} catch (error) {
    console.warn("[Ã‡EVRÄ°MDÄ°ÅÄ° MOD AKTÄ°F] VeritabanÄ± baÄŸlantÄ±sÄ± yok veya internet koptu:", error);
    window.db = null; // Sistem Ã§evrimdÄ±ÅŸÄ± oynanÄ±ÅŸ iÃ§in db'yi nazikÃ§e atlar
}

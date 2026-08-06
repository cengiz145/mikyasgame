const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

const evoCheckLogic = `
window.checkManagerEvolution = function() {
    if (window.managerProfile !== 'tarafsiz' || !window.managerStats) return;

    let stats = window.managerStats;
    let newProfile = null;
    let title = "";
    let desc = "";

    // Evrim Şartları
    if (stats.comebackWins >= 2) {
        newProfile = 'motivasyon_ustasi';
        title = "🔥 Motivasyon Ustası!";
        desc = "Geriye düştüğün maçları çevirmekteki ustalığınla biliniyorsun. Basın artık sana 'Motivasyon Ustası' diyor! Takımın artık geriye düştüğünde inanılmaz bir İkinci Rüzgar yakalayacak.";
    } else if (stats.crisisAvertedCount >= 10) {
        newProfile = 'itfaiyeci';
        title = "🧯 İtfaiyeci (Kriz Yöneticisi)!";
        desc = "Krizdeki bir takımı ipten almak senin işin. Basın sana 'İtfaiyeci' lakabını taktı! Takımın artık kolay kolay kaosa sürüklenmeyecek.";
    } else if (stats.defensiveMinutes > 15000) {
        newProfile = 'pragmatist';
        title = "🛡️ Pragmatist (Sonuç Odaklı)!";
        desc = "Savunma ve sertliğe verdiğin önem basının dikkatinden kaçmadı. Artık 'Pragmatist' olarak anılıyorsun. Savunman taş gibi olacak ama takım daha sert, agresif oynayacak.";
    } else if (stats.passingMinutes > 15000) {
        newProfile = 'taktik_deha';
        title = "♟️ Taktik Deha (Satranç Ustası)!";
        desc = "Ofansif ve paslı oyun tarzın seni bir 'Taktik Deha' yaptı. Takımın pas hatası yapmayacak ama maç sonlarında yorgunluktan dökülebilir.";
    } else if (stats.youngPlayerMinutes > 40000) {
        newProfile = 'proje_hocasi';
        title = "🎓 Proje Hocası (Öğretmen)!";
        desc = "Gençlere verdiğin önem sayesinde 'Proje Hocası' unvanını aldın. Yönetim sana bayılıyor ve genç oyuncuların inanılmaz hızlarda gelişecek.";
    }

    if (newProfile) {
        window.managerProfile = newProfile;
        
        // Evrim Haberi Gösterimi
        setTimeout(() => {
            if (typeof speak === 'function') speak("Tebrikler! Oyun tarzın sayesinde medyanın sana taktığı yeni bir lakap var!");
            
            // Eğer varsa news modal veya alert ile göster
            let dailyNewsText = document.getElementById('daily-news-text');
            if (dailyNewsText) {
                dailyNewsText.innerHTML = "<b>" + title + "</b> " + desc;
            }
            alert("🌟 MENAJER EVRİMİ 🌟\\n\\n" + title + "\\n\\n" + desc);
            
            if (typeof saveGame === 'function') saveGame(true);
        }, 1000);
    }
};
`;

// Inject this function globally near the top
const startStr = `let daysOfWeek = ["", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];`;
content = content.replace(startStr, startStr + "\n" + evoCheckLogic);

// Call it in btn-next-day
const triggerStr = `if (typeof window.checkIncomingOffers === 'function') window.checkIncomingOffers();`;
const triggerReplacement = `if (typeof window.checkIncomingOffers === 'function') window.checkIncomingOffers();
            if (typeof window.checkManagerEvolution === 'function') window.checkManagerEvolution();`;

content = content.replace(triggerStr, triggerReplacement);
// It exists in two places (Pre-Season and Normal Season)
content = content.replace(triggerStr, triggerReplacement); // Second replacement just in case

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('js/menu.js patched with checkManagerEvolution mechanism');

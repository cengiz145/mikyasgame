const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

const evoCheckLogic = `
window.checkManagerEvolution = function() {
    if (!window.managerStats) return;
    
    let stats = window.managerStats;
    let oldProfile = window.managerProfile;
    let newProfile = null;
    let title = "";
    let desc = "";

    // Evrim Şartları
    // Önceden "tarafsiz" şartı vardı, şimdi kaldırıldı. Sadece mevcut profilinden farklı bir şey baskınsa geçiş yapar.
    // Eşikleri her geçişte artırmak veya sayaçları sıfırlamak (Sıfırlamayı tercih edeceğiz)
    if (stats.comebackWins >= 2 && oldProfile !== 'motivasyon_ustasi') {
        newProfile = 'motivasyon_ustasi';
        title = "🔥 Yeni Tarz: Motivasyon Ustası!";
        desc = "Geriye düştüğün maçları çevirmekteki ustalığınla biliniyorsun. Basın artık sana 'Motivasyon Ustası' diyor!";
    } else if (stats.crisisAvertedCount >= 10 && oldProfile !== 'itfaiyeci') {
        newProfile = 'itfaiyeci';
        title = "🧯 Yeni Tarz: İtfaiyeci (Kriz Yöneticisi)!";
        desc = "Krizdeki bir takımı ipten almak senin işin. Basın sana 'İtfaiyeci' lakabını taktı!";
    } else if (stats.defensiveMinutes > 15000 && oldProfile !== 'pragmatist') {
        newProfile = 'pragmatist';
        title = "🛡️ Yeni Tarz: Pragmatist (Sonuç Odaklı)!";
        desc = "Savunma ve sertliğe verdiğin önem basının dikkatinden kaçmadı. Artık 'Pragmatist' olarak anılıyorsun.";
    } else if (stats.passingMinutes > 15000 && oldProfile !== 'taktik_deha') {
        newProfile = 'taktik_deha';
        title = "♟️ Yeni Tarz: Taktik Deha (Satranç Ustası)!";
        desc = "Ofansif ve paslı oyun tarzın seni bir 'Taktik Deha' yaptı.";
    } else if (stats.youngPlayerMinutes > 40000 && oldProfile !== 'proje_hocasi') {
        newProfile = 'proje_hocasi';
        title = "🎓 Yeni Tarz: Proje Hocası (Öğretmen)!";
        desc = "Gençlere verdiğin önem sayesinde 'Proje Hocası' unvanını aldın.";
    }

    if (newProfile && newProfile !== oldProfile) {
        window.managerProfile = newProfile;
        
        // Tarz değiştiğinde sayaçları %50 azalt ki sürekli git-gel yaşanmasın (Dinamik geçişin bedeli)
        window.managerStats.defensiveMinutes = Math.floor(window.managerStats.defensiveMinutes / 2);
        window.managerStats.passingMinutes = Math.floor(window.managerStats.passingMinutes / 2);
        window.managerStats.youngPlayerMinutes = Math.floor(window.managerStats.youngPlayerMinutes / 2);
        window.managerStats.comebackWins = 0;
        window.managerStats.crisisAvertedCount = 0;
        
        // Evrim Haberi Gösterimi
        setTimeout(() => {
            if (typeof speak === 'function') speak("Tebrikler! Oyun tarzındaki değişim sayesinde medyanın sana taktığı yeni bir lakap var!");
            
            let dailyNewsText = document.getElementById('daily-news-text');
            if (dailyNewsText) {
                dailyNewsText.innerHTML = "<b>" + title + "</b> " + desc;
            }
            alert("🌟 OYUN ANLAYIŞIN EVRİMLEŞTİ 🌟\\n\\n" + title + "\\n\\n" + desc);
            
            if (typeof saveGame === 'function') saveGame(true);
        }, 1000);
    }
};
`;

if (!content.includes('window.checkManagerEvolution = function()')) {
    content += evoCheckLogic;
    fs.writeFileSync('js/menu.js', content, 'utf8');
    console.log('Appended checkManagerEvolution to menu.js');
} else {
    // Replace existing logic
    content = content.replace(/window\.checkManagerEvolution = function\(\) \{[\s\S]*?\n\};\n?/g, evoCheckLogic);
    fs.writeFileSync('js/menu.js', content, 'utf8');
    console.log('Replaced checkManagerEvolution in menu.js');
}

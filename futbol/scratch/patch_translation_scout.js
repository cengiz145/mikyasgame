const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');

const replacements = [
    { target: "StatsBomb verilerini ve Wyscout kliplerini", replace: "Futbol Veri Ajansı raporlarını ve maç içi video kesitlerini" },
    { target: "xG (Gol Beklentisi)", replace: "Gol Beklentisi" },
    { target: "xG katkısı", replace: "Gol Beklentisi katkısı" },
    { target: "xG değerimizin", replace: "Gol Beklentisi değerimizin" },
    { target: "xG üretimine", replace: "Gol Beklentisi üretimine" },
    { target: "(-) xG katkısı", replace: "(-) Gol Beklentisi katkısı" },
    { target: "xGA (Yenilen Gol Beklentisi)", replace: "Yenilen Gol Beklentisi" },
    { target: "xGA) ciddi oranda", replace: "Yenilen Gol Beklentisi) ciddi oranda" },
    { target: "Progresif pas", replace: "Ön Alan Pas" },
    { target: "Kilit pas (Key Passes)", replace: "Kilit Pas" },
    { target: "(ROI)", replace: "" },
    { target: "ROI", replace: "Yatırım Getirisi" },
    { target: "hücum pres (PPDA)", replace: "Ön Alan Baskısı" },
    { target: "verimliliği (Efficiency)", replace: "Verimliliği" },
    { target: "Efficiency", replace: "Verimlilik" },
    { target: "Turnovers/90", replace: "Maç Başı Top Kaybı" },
    { target: "Active Time", replace: "Oyunda Kalma Süresi" },
    { target: "xPass eksisi", replace: "Pas İsabet Düşüklüğü" },
    { target: "Growth Curve", replace: "Gelişim Eğrisi" },
    { target: "Wyscout verilerine", replace: "Veri Platformu analizlerine" },
    { target: "Wyscout ve fitness", replace: "Oyuncu İstatistikleri ve Fiziksel" },
    { target: "Standard Deviation", replace: "Standart Sapma" },
    { target: "Synergy Effect", replace: "Takım Uyumu Etkisi" },
    { target: "Interceptions", replace: "Top Çalma" },
    { target: "Stamina Metric", replace: "Saha İçi Dayanıklılık Puanı" },
    { target: "Tight Spaces", replace: "Dar Alan" },
    { target: "Game Intelligence", replace: "Oyun Zekası" },
    { target: "Positioning", replace: "Pozisyon Alma" },
    { target: "Game Changer", replace: "Maç Çeviren" },
    { target: "Sprint/90", replace: "Maç Başı Depar" },
    { target: "Recovery Pace", replace: "Geri Dönüş Hızı" }
];

replacements.forEach(r => {
    content = content.replaceAll(r.target, r.replace);
});

// Clean up any double spaces created by empty replacements
content = content.replace(/  /g, ' ');

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', content, 'utf8');
console.log('Patch translation scout applied successfully.');

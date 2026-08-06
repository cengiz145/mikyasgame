const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');

let target = `    let i = pool[cat].intro[Math.floor(Math.random() * pool[cat].intro.length)];
    let m = pool[cat].mid[Math.floor(Math.random() * pool[cat].mid.length)];
    let o = pool[cat].outro[Math.floor(Math.random() * pool[cat].outro.length)];

    return i + " " + m + " " + o;`;

let replacement = `    let i = pool[cat].intro[Math.floor(Math.random() * pool[cat].intro.length)];
    let m = pool[cat].mid[Math.floor(Math.random() * pool[cat].mid.length)];
    let o = pool[cat].outro[Math.floor(Math.random() * pool[cat].outro.length)];

    const categoryTitles = {
        wonderkid: "🌟 [Süper Yıldız Adayı]",
        high_pot: "📈 [Yüksek Potansiyelli]",
        good_pot: "✅ [Gelişime Açık]",
        capped_youth: "⚠️ [Potansiyeli Sınırlı]",
        bad_youth: "❌ [Yetersiz Genç]",
        prime_star: "👑 [Dünya Yıldızı (Prime)]",
        prime_solid: "🛡️ [Görev Adamı / İlk 11]",
        prime_average: "🔄 [Sıradan / Rotasyon]",
        old_star: "👴 [Yaşlı Efsane]",
        old_declining: "📉 [Fiziksel Çöküşte]"
    };

    let title = categoryTitles[cat] ? \`<strong>\${categoryTitles[cat]}</strong><br>\` : "";
    let scoutPrefix = window.scoutProfile === "tribun_kurdu" 
        ? "<span style='color:#e67e22;'>🎩 Tribün Kurdu:</span> " 
        : "<span style='color:#3498db;'>💻 Veri Analisti:</span> ";

    return title + scoutPrefix + i + " " + m + " " + o;`;

content = content.replace(target, replacement);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', content, 'utf8');
console.log('Patch scout title applied successfully.');

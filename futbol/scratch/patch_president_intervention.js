const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// The target is the section we just added for master media
let target = `    // MAÇ SONU MEDYA OLAYLARI (Eski Tüfek, Youtube, Komplo)
    let mediaRoll = Math.random();
    
    if (isLoss) {`;

let replacement = `    // MAÇ SONU MEDYA OLAYLARI (Eski Tüfek, Youtube, Komplo)
    let mediaRoll = Math.random();
    let isHeavyCriticism = false;
    
    if (isLoss) {`;

content = content.replace(target, replacement);

let target2 = `        if (mediaRoll < 0.20) {
            // Eski Tüfek
            setTimeout(() => alert(\`📺 MAÇ SONU YAYINI: Eski Tüfek Yorumcu\\n\\n"Bana xG, sahte dokuz falan anlatmayın kardeşim! Bu takım sahada yürümüyor, sürünüyor! O forma kutsaldır, koşmayanın o formayı giymeye hakkı yok!" diyerek canlı yayında masayı yumrukladı.\\n\\nEski efsanenin bu sert çıkışı sosyal medyada viral oldu. Oyuncularınızın morali düştü ve taraftar baskısı arttı!\`), 6500);`;

let replacement2 = `        if (mediaRoll < 0.20) {
            // Eski Tüfek
            isHeavyCriticism = true;
            setTimeout(() => alert(\`📺 MAÇ SONU YAYINI: Eski Tüfek Yorumcu\\n\\n"Bana xG, sahte dokuz falan anlatmayın kardeşim! Bu takım sahada yürümüyor, sürünüyor! O forma kutsaldır, koşmayanın o formayı giymeye hakkı yok!" diyerek canlı yayında masayı yumrukladı.\\n\\nEski efsanenin bu sert çıkışı sosyal medyada viral oldu. Oyuncularınızın morali düştü ve taraftar baskısı arttı!\`), 6500);`;

content = content.replace(target2, replacement2);

let target3 = `        } else if (mediaRoll >= 0.20 && mediaRoll < 0.35) {
            // Youtube Analisti
            setTimeout(() => alert(\`🖥️ YOUTUBE TAKTİK ANALİZİ (Yeni Nesil Yorumcu)\\n\\n"Ekrana çizdiğim şu kırmızı üçgenlere iyi bakın. Hocanın asimetrik pres denemesi yarım alanları (half-space) tamamen rakibe teslim etti. xG (Gol Beklentisi) oranları felaket durumda. Geometrik olarak sahadan silindiler."\\n\\nModern futbol kitlesinin bu detaylı eleştirisi sonucu sisteminize olan güven sarsıldı.\`), 7500);`;

let replacement3 = `        } else if (mediaRoll >= 0.20 && mediaRoll < 0.35) {
            // Youtube Analisti
            isHeavyCriticism = true;
            setTimeout(() => alert(\`🖥️ YOUTUBE TAKTİK ANALİZİ (Yeni Nesil Yorumcu)\\n\\n"Ekrana çizdiğim şu kırmızı üçgenlere iyi bakın. Hocanın asimetrik pres denemesi yarım alanları (half-space) tamamen rakibe teslim etti. xG (Gol Beklentisi) oranları felaket durumda. Geometrik olarak sahadan silindiler."\\n\\nModern futbol kitlesinin bu detaylı eleştirisi sonucu sisteminize olan güven sarsıldı.\`), 7500);`;

content = content.replace(target3, replacement3);

let target4 = `        } else if (mediaRoll >= 0.35 && mediaRoll < 0.55) {
            // Komplo Teorisyeni
            setTimeout(() => alert(\`🤡 GECE YARISI SPOR ŞOVU (Komplo Teorisyenleri)\\n\\nStüdyoda birbirlerinin üzerine su atıp bağırarak: "Kardeşim o maç sahada değil, masa başında kaybedildi! Hakem o pozisyonu bilerek görmedi, operasyon var! Hoca da uyuyor!" dediler.\\n\\nBu komplo teorileri camiayı ikiye böldü. Yönetim ve taraftar arasında saçma sapan bir kaos ortamı oluştu.\`), 6500);`;

let replacement4 = `        } else if (mediaRoll >= 0.35 && mediaRoll < 0.55) {
            // Komplo Teorisyeni
            isHeavyCriticism = true;
            setTimeout(() => alert(\`🤡 GECE YARISI SPOR ŞOVU (Komplo Teorisyenleri)\\n\\nStüdyoda birbirlerinin üzerine su atıp bağırarak: "Kardeşim o maç sahada değil, masa başında kaybedildi! Hakem o pozisyonu bilerek görmedi, operasyon var! Hoca da uyuyor!" dediler.\\n\\nBu komplo teorileri camiayı ikiye böldü. Yönetim ve taraftar arasında saçma sapan bir kaos ortamı oluştu.\`), 6500);`;

content = content.replace(target4, replacement4);

let target5 = `    if (window.presidentConfidence < 40) {
        setTimeout(() => {`;

let replacement5 = `    // BAŞKANIN MEDYAYA TEPKİSİ
    if (isHeavyCriticism && Math.random() < 0.6) {
        setTimeout(() => {
            if (window.presidentConfidence >= 60) {
                alert(\`👔 BAŞKAN DEVREDE! (Medyaya Karşı Kalkan)\\n\\nEleştirilerin dozu artınca Kulüp Başkanı canlı yayına bağlandı:\\n"Bizim hocamıza inancımız tamdır. İki üç tane reyting peşinde koşan yorumcunun lafıyla hoca yemeyiz. Bizim projemiz uzun vadeli!"\\n\\nAranızdaki iyi ilişki sayesinde Başkanın sizi koruması, azalan otoritenizi kısmen geri kazandırdı.\`);
                window.managerAuthority = Math.min(100, window.managerAuthority + 5);
            } else {
                let answer = prompt(\`🚨 BAŞKAN'DAN ACİL ARAMA!\\n\\nEleştiriler sonrası telefonunuz çalıyor, arayan Kulüp Başkanı:\\n"Hocam televizyonu izliyor musun? Herkes seni ve sistemi yerden yere vuruyor. Kulüp karıştı! Buna ne diyorsun, durum nedir?"\\n\\n1) Bana zaman verin, her şeyi düzelteceğim.\\n2) Medyaya kulak asmayın başkanım, işimize bakalım.\\n3) Medya haklı, oyuncular sahada ruhsuz oynuyor.\\n\\n(Lütfen 1, 2 veya 3 yazın)\`);
                
                if (answer === "1") {
                    alert(\`Başkan: "Peki hocam, sana bir kredi daha açıyorum ama haftaya da kaybedersek işimiz zor."\\n\\nBaşkan şimdilik sakinleşti ancak üzerinizdeki baskı tavan yaptı.\`);
                } else if (answer === "2") {
                    alert(\`Başkan: "Nasıl kulak asmayayım hocam, koskoca camia kaynıyor! Senin bu rahatlığın beni daha da endişelendiriyor."\\n\\nBaşkanın size olan güveni ağır darbe aldı!\`);
                    window.presidentConfidence -= 10;
                } else if (answer === "3") {
                    alert(\`Başkan: "Eğer sorun oyunculardaysa faturayı onlara kes, takımı toparla!"\\n\\nBaşkan ikna oldu ancak faturayı oyunculara kestiğiniz için soyunma odasında takımın size olan inancı tamamen sıfırlandı!\`);
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { if (p.psy && p.psy.selfEfficacy) p.psy.selfEfficacy = Math.max(0, p.psy.selfEfficacy - 15); });
                    }
                } else {
                    alert(\`Başkan: "Bana cevap bile veremiyorsun hocam, durum vahim anlaşılan!"\\n\\nBaşkan telefonu suratınıza sinirle kapattı. Güven dibe vurdu.\`);
                    window.presidentConfidence -= 15;
                }
            }
        }, 9000); // Yorumculardan hemen sonra devreye girer
    }

    if (window.presidentConfidence < 40) {
        setTimeout(() => {`;

content = content.replace(target5, replacement5);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch president intervention applied successfully.');

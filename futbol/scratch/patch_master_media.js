const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let target = `    if (window.presidentConfidence < 40) {
        setTimeout(() => {`;

let replacement = `    // MAÇ SONU MEDYA OLAYLARI (Eski Tüfek, Youtube, Komplo)
    let mediaRoll = Math.random();
    
    if (isLoss) {
        if (mediaRoll < 0.20) {
            // Eski Tüfek
            setTimeout(() => alert(\`📺 MAÇ SONU YAYINI: Eski Tüfek Yorumcu\\n\\n"Bana xG, sahte dokuz falan anlatmayın kardeşim! Bu takım sahada yürümüyor, sürünüyor! O forma kutsaldır, koşmayanın o formayı giymeye hakkı yok!" diyerek canlı yayında masayı yumrukladı.\\n\\nEski efsanenin bu sert çıkışı sosyal medyada viral oldu. Oyuncularınızın morali düştü ve taraftar baskısı arttı!\`), 6500);
            window.managerAuthority -= 5;
            if (typeof homePlayers !== 'undefined') {
                homePlayers.forEach(p => { if (p.psy && p.psy.selfEfficacy) p.psy.selfEfficacy = Math.max(0, p.psy.selfEfficacy - 5); });
            }
        } else if (mediaRoll >= 0.20 && mediaRoll < 0.35) {
            // Youtube Analisti
            setTimeout(() => alert(\`🖥️ YOUTUBE TAKTİK ANALİZİ (Yeni Nesil Yorumcu)\\n\\n"Ekrana çizdiğim şu kırmızı üçgenlere iyi bakın. Hocanın asimetrik pres denemesi yarım alanları (half-space) tamamen rakibe teslim etti. xG (Gol Beklentisi) oranları felaket durumda. Geometrik olarak sahadan silindiler."\\n\\nModern futbol kitlesinin bu detaylı eleştirisi sonucu sisteminize olan güven sarsıldı.\`), 7500);
            window.managerAuthority -= 3;
        } else if (mediaRoll >= 0.35 && mediaRoll < 0.55) {
            // Komplo Teorisyeni
            setTimeout(() => alert(\`🤡 GECE YARISI SPOR ŞOVU (Komplo Teorisyenleri)\\n\\nStüdyoda birbirlerinin üzerine su atıp bağırarak: "Kardeşim o maç sahada değil, masa başında kaybedildi! Hakem o pozisyonu bilerek görmedi, operasyon var! Hoca da uyuyor!" dediler.\\n\\nBu komplo teorileri camiayı ikiye böldü. Yönetim ve taraftar arasında saçma sapan bir kaos ortamı oluştu.\`), 6500);
            window.presidentConfidence -= 5;
        }
    } else if (scoreDiff > 0) {
        if (mediaRoll < 0.20) {
            // Eski Tüfek (Övgü)
            setTimeout(() => alert(\`📺 MAÇ SONU YAYINI: Eski Tüfek Yorumcu\\n\\n"İşte ruh bu kardeşim! Taktik maktik yok, sahaya çıkıp aslanlar gibi savaştılar, formanın hakkını son damlasına kadar verdiler. Helal olsun!"\\n\\nYorumcunun bu geleneksel gazıyla taraftar coştu, takımın özgüveni tavan yaptı.\`), 6500);
            window.managerAuthority = Math.min(100, window.managerAuthority + 5);
            if (typeof homePlayers !== 'undefined') {
                homePlayers.forEach(p => { if (p.psy && p.psy.selfEfficacy) p.psy.selfEfficacy = Math.min(100, p.psy.selfEfficacy + 5); });
            }
        } else if (mediaRoll >= 0.20 && mediaRoll < 0.35) {
            // Youtube Analisti (Övgü)
            setTimeout(() => alert(\`🖥️ YOUTUBE TAKTİK ANALİZİ (Yeni Nesil Yorumcu)\\n\\n"Skora değil sahada çizilen şu harika oklara, üçgenlere ve ısı haritasına bakın. Hoca sahte dokuzu öyle bir konumlandırdı ki rakibin merkezini satranç oynar gibi mat etti. Kusursuz bir xG üretimi!"\\n\\nTaktik dehanızın övülmesi takımın saha içi disiplinine ve oyun aklına moral kattı.\`), 7500);
            window.managerAuthority = Math.min(100, window.managerAuthority + 5);
        } else if (mediaRoll >= 0.35 && mediaRoll < 0.55) {
            // Komplo Teorisyeni (Galibiyette bile kaos)
            setTimeout(() => alert(\`🤡 GECE YARISI SPOR ŞOVU (Komplo Teorisyenleri)\\n\\nStüdyoya peruk takarak ve halay çekerek çıktılar: "Bu takımı şampiyon yapacaklar kardeşim, lobimiz çok güçlü! Hakemi de yendik, dış güçleri de!" diyerek viral oldular.\\n\\nBu ciddiyetsiz ortam kulübün saygınlığını zedeledi ama taraftarı eğlendirdi.\`), 6500);
            window.presidentConfidence -= 2; // Ciddiyetsizlikten dolayı ufak bir güven kaybı
        }
    }

    if (window.presidentConfidence < 40) {
        setTimeout(() => {`;

if (content.includes(replacement)) {
    console.log('Already patched.');
} else {
    content = content.replace(target, replacement);
    fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
    console.log('Patch master media applied successfully.');
}

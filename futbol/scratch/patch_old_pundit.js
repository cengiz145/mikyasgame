const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let target = `    // Başkanın Uyarı Mesajı (UI)
    if (window.presidentConfidence < 40) {`;

let replacement = `    // MAÇ SONU MEDYA OLAYLARI: Eski Tüfek Yorumcular
    let punditChance = Math.random();
    if (isLoss && punditChance < 0.40) { // %40 ihtimalle mağlubiyette kudurur
        setTimeout(() => alert(\`📺 MAÇ SONU YAYINI: Eski Tüfek Yorumcu (Geleneksel Medya)\\n\\n"Bana xG, sahte dokuz falan anlatmayın kardeşim! Bu takım sahada yürümüyor, sürünüyor! O forma kutsaldır, koşmayanın o formayı giymeye hakkı yok!" diyerek canlı yayında masayı yumrukladı.\\n\\nEski efsanenin bu sert çıkışı sosyal medyada viral oldu. Oyuncularınızın morali daha da düştü ve taraftar baskısı arttı!\`), 6500);
        window.managerAuthority -= 5;
        if (typeof homePlayers !== 'undefined') {
            homePlayers.forEach(p => {
                if (p.psy && p.psy.selfEfficacy) p.psy.selfEfficacy = Math.max(0, p.psy.selfEfficacy - 5);
            });
        }
    } else if (scoreDiff >= 2 && punditChance < 0.30) { // Farklı galibiyette veya sağlam oyunda över
        setTimeout(() => alert(\`📺 MAÇ SONU YAYINI: Eski Tüfek Yorumcu (Geleneksel Medya)\\n\\n"İşte ruh bu kardeşim! Taktik maktik yok, sahaya çıkıp aslanlar gibi savaştılar, formanın hakkını son damlasına kadar verdiler. Helal olsun!"\\n\\nYorumcunun bu geleneksel gazıyla taraftar coştu, takımın özgüveni tavan yaptı.\`), 6500);
        window.managerAuthority = Math.min(100, window.managerAuthority + 5);
        if (typeof homePlayers !== 'undefined') {
            homePlayers.forEach(p => {
                if (p.psy && p.psy.selfEfficacy) p.psy.selfEfficacy = Math.min(100, p.psy.selfEfficacy + 5);
            });
        }
    }

    // Başkanın Uyarı Mesajı (UI)
    if (window.presidentConfidence < 40) {`;

content = content.replace(target, replacement);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch old pundit applied successfully.');

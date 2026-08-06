const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let target = `        window.managerAuthority = Math.min(100, window.managerAuthority + 5);
        if (typeof homePlayers !== 'undefined') {
            homePlayers.forEach(p => {
                if (p.psy && p.psy.selfEfficacy) p.psy.selfEfficacy = Math.min(100, p.psy.selfEfficacy + 5);
            });
        }
    }`;

let replacement = `        window.managerAuthority = Math.min(100, window.managerAuthority + 5);
        if (typeof homePlayers !== 'undefined') {
            homePlayers.forEach(p => {
                if (p.psy && p.psy.selfEfficacy) p.psy.selfEfficacy = Math.min(100, p.psy.selfEfficacy + 5);
            });
        }
    }
    
    // MAÇ SONU MEDYA OLAYLARI: Analitik Youtube Yorumcuları
    let ytChance = Math.random();
    if (isLoss && ytChance < 0.35 && punditChance >= 0.40) { // Eski tüfekle çakışmasın
        setTimeout(() => alert(\`🖥️ YOUTUBE TAKTİK ANALİZİ (Yeni Nesil Yorumcu)\\n\\n"Ekrana çizdiğim şu kırmızı üçgenlere iyi bakın. Hocanın asimetrik pres denemesi yarım alanları (half-space) tamamen rakibe teslim etti. xG (Gol Beklentisi) oranları felaket durumda. Geometrik olarak sahadan silindiler."\\n\\nModern futbol kitlesinin bu detaylı eleştirisi sonucu sisteminize olan güven sarsıldı.\`), 7500);
        window.managerAuthority -= 3; // Analitik eleştiri, bağıran adam kadar otorite sarsmaz ama güven zedeler
    } else if (scoreDiff > 0 && ytChance < 0.35 && punditChance >= 0.30) {
        setTimeout(() => alert(\`🖥️ YOUTUBE TAKTİK ANALİZİ (Yeni Nesil Yorumcu)\\n\\n"Skora değil sahada çizilen şu harika oklara, üçgenlere ve ısı haritasına bakın. Hoca sahte dokuzu öyle bir konumlandırdı ki rakibin merkezini satranç oynar gibi mat etti. Kusursuz bir xG üretimi!"\\n\\nTaktik dehanızın övülmesi takımın saha içi disiplinine ve oyun aklına moral kattı.\`), 7500);
        window.managerAuthority = Math.min(100, window.managerAuthority + 5);
    }`;

content = content.replace(target, replacement);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch youtube pundit applied successfully.');

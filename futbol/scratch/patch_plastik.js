const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// 1. Add 'plastik' to fanProfilesDatabase
let target1 = `              {
                  name: "Taktiksel ve Analitik Taraftar (Yeni Nesil)",
                  profile: "analitik",
                  desc: "Oyunu duygularla değil istatistiklerle okurlar. xG ve ısı haritasına bakarlar. Oyuncu değişikliklerini ve açıklamaları eleştirirler."
              }
          ];`;

let replacement1 = `              {
                  name: "Taktiksel ve Analitik Taraftar (Yeni Nesil)",
                  profile: "analitik",
                  desc: "Oyunu duygularla değil istatistiklerle okurlar. xG ve ısı haritasına bakarlar. Oyuncu değişikliklerini ve açıklamaları eleştirirler."
              },
              {
                  name: "İyi Gün Taraftarı (Plastik / Sosyal Medya Seyircisi)",
                  profile: "plastik",
                  desc: "Sadece iyi günde veya yıldız oyuncu geldiğinde ortaya çıkarlar. Maç kötü gidince formayı dolaba kaldırır, stadyumda sadece story atarlar."
              }
          ];`;

content = content.replace(target1, replacement1);

// 2. Add behavior: They abandon early if things go slightly wrong, or they post stories.
let target2 = `      if (window.currentFanProfile) {
          if (window.currentFanProfile.profile === 'ultras') {
              isStadiumAbandoned = false;
          } else if (window.currentFanProfile.profile === 'cekirdekci' && typeof timeLeft !== 'undefined' && timeLeft <= 15) {
              isStadiumAbandoned = true; // Trafik olmasın diye çıkarlar
          }
      }`;

let replacement2 = `      if (window.currentFanProfile) {
          if (window.currentFanProfile.profile === 'ultras') {
              isStadiumAbandoned = false;
          } else if (window.currentFanProfile.profile === 'cekirdekci' && typeof timeLeft !== 'undefined' && timeLeft <= 15) {
              isStadiumAbandoned = true; // Trafik olmasın diye çıkarlar
          } else if (window.currentFanProfile.profile === 'plastik' && window.CrowdForm >= 3) {
              isStadiumAbandoned = true; // İyi gün taraftarı kötü oyuna katlanamaz, hemen çeker gider
          }
      }`;

content = content.replace(target2, replacement2);

// 3. Add ambient dialogue / behavior during game loop
let target3 = `    // Sınırlandırmalar
    if (newForm > 7) newForm = 7;
    if (newForm < 1) newForm = 1;
    
    if (window.currentFanProfile) {
        if (window.currentFanProfile.profile === 'ultras') {
            newForm = 1; // Ultras asla takıma küsmez, hep destekler
        } else if (window.currentFanProfile.profile === 'cekirdekci') {
            newForm = Math.max(newForm + 1, 2); // Çekirdekçi hep tatminsizdir
        }
    }`;

let replacement3 = `    // Sınırlandırmalar
    if (newForm > 7) newForm = 7;
    if (newForm < 1) newForm = 1;
    
    if (window.currentFanProfile) {
        if (window.currentFanProfile.profile === 'ultras') {
            newForm = 1; // Ultras asla takıma küsmez, hep destekler
        } else if (window.currentFanProfile.profile === 'cekirdekci') {
            newForm = Math.max(newForm + 1, 2); // Çekirdekçi hep tatminsizdir
        } else if (window.currentFanProfile.profile === 'plastik') {
            if (diff >= 2) newForm = 1; // Şov varsa inanılmaz coşkulu
            else if (diff < 0) newForm = Math.max(newForm, 4); // Geriye düşünce hemen maçı bırakıp protesto / terk etmeye başlarlar
        }
    }`;

content = content.replace(target3, replacement3);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch plastik applied successfully.');

const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// 1. Add 'oyuncu' to fanProfilesDatabase
let target1 = `              {
                  name: "İyi Gün Taraftarı (Plastik / Sosyal Medya Seyircisi)",
                  profile: "plastik",
                  desc: "Sadece iyi günde veya yıldız oyuncu geldiğinde ortaya çıkarlar. Maç kötü gidince formayı dolaba kaldırır, stadyumda sadece story atarlar."
              }
          ];`;

let replacement1 = `              {
                  name: "İyi Gün Taraftarı (Plastik / Sosyal Medya Seyircisi)",
                  profile: "plastik",
                  desc: "Sadece iyi günde veya yıldız oyuncu geldiğinde ortaya çıkarlar. Maç kötü gidince formayı dolaba kaldırır, stadyumda sadece story atarlar."
              },
              {
                  name: "Bireysel Oyuncu Fanı (Z Kuşağı Editçileri)",
                  profile: "oyuncu",
                  desc: "Kulübü değil sadece takımın en büyük yıldızını desteklerler. Yıldızın her hareketini TikTok'a atar, diğer futbolcuları hata yaptıklarında linç ederler."
              }
          ];`;

content = content.replace(target1, replacement1);

// 2. Identify the idol player when the profile is set
let target2 = `window.currentFanProfile = window.fanProfilesDatabase[Math.floor(Math.random() * window.fanProfilesDatabase.length)];`;

let replacement2 = `window.currentFanProfile = window.fanProfilesDatabase[Math.floor(Math.random() * window.fanProfilesDatabase.length)];
          
          if (window.currentFanProfile.profile === 'oyuncu') {
              setTimeout(() => {
                  if (typeof homePlayers !== 'undefined' && homePlayers.length > 0) {
                      window.idolPlayer = homePlayers.reduce((max, p) => (p.power > max.power ? p : max), homePlayers[0]);
                      if (typeof speak === 'function') speak("Dikkat! Bugün tribünlerde sadece kulübü değil, özel olarak " + window.idolPlayer.name + "'i desteklemeye gelen devasa bir Z kuşağı kitlesi var. Kameralar hazır, editler yolda!");
                  }
              }, 2000);
          }`;

content = content.replace(target2, replacement2);

// 3. Update the mistake threshold
let target3 = `                let mistakeThreshold = (window.currentFanProfile && window.currentFanProfile.profile === 'cekirdekci') ? 2 : 3;
                if (closestHome.p.mistakes >= mistakeThreshold && !closestHome.p.isBooedByOwnFans) {`;

let replacement3 = `                let mistakeThreshold = 3;
                if (window.currentFanProfile) {
                    if (window.currentFanProfile.profile === 'cekirdekci') mistakeThreshold = 2;
                    if (window.currentFanProfile.profile === 'oyuncu') {
                        mistakeThreshold = (window.idolPlayer && closestHome.p.name === window.idolPlayer.name) ? 999 : 1; // İdole sınırsız kredi, diğerlerine sıfır tolerans!
                    }
                }
                
                if (closestHome.p.mistakes >= mistakeThreshold && !closestHome.p.isBooedByOwnFans) {`;

content = content.replace(target3, replacement3);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch oyuncu fan applied successfully.');

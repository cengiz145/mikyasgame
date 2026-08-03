const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// 1. Add 'nostaljik' to fanProfilesDatabase
let target1 = `              {
                  name: "Bireysel Oyuncu Fanı (Z Kuşağı Editçileri)",
                  profile: "oyuncu",
                  desc: "Kulübü değil sadece takımın en büyük yıldızını desteklerler. Yıldızın her hareketini TikTok'a atar, diğer futbolcuları hata yaptıklarında linç ederler."
              }
          ];`;

let replacement1 = `              {
                  name: "Bireysel Oyuncu Fanı (Z Kuşağı Editçileri)",
                  profile: "oyuncu",
                  desc: "Kulübü değil sadece takımın en büyük yıldızını desteklerler. Yıldızın her hareketini TikTok'a atar, diğer futbolcuları hata yaptıklarında linç ederler."
              },
              {
                  name: "Endüstriyel Futbol Karşıtı / Nostaljik Romantik (Eski Toprak)",
                  profile: "nostaljik",
                  desc: "Paraya, VAR'a ve modern futbola düşmandırlar. Yıldız transferlerden nefret eder, altyapıdan çıkan isimsiz gençlere sonsuz destek verirler."
              }
          ];`;

content = content.replace(target1, replacement1);

// 2. Mistake threshold updates
let target2 = `                    if (window.currentFanProfile.profile === 'oyuncu') {
                        mistakeThreshold = (window.idolPlayer && closestHome.p.name === window.idolPlayer.name) ? 999 : 1; // İdole sınırsız kredi, diğerlerine sıfır tolerans!
                    }
                }`;

let replacement2 = `                    if (window.currentFanProfile.profile === 'oyuncu') {
                        mistakeThreshold = (window.idolPlayer && closestHome.p.name === window.idolPlayer.name) ? 999 : 1; // İdole sınırsız kredi, diğerlerine sıfır tolerans!
                    }
                    if (window.currentFanProfile.profile === 'nostaljik') {
                        mistakeThreshold = closestHome.p.isWorldClass ? 1 : (closestHome.p.isTier3 ? 999 : 3); // Yıldızlara sıfır tolerans, garibana sonsuz kredi
                    }
                }`;

content = content.replace(target2, replacement2);

// 3. Messiah condition
let target3 = `                    if (window.CrowdForm >= 3 && closestHome.p.isWorldClass) {
                         closestHome.p.isMessiah = true;`;

let replacement3 = `                    let messiahCondition = closestHome.p.isWorldClass;
                    if (window.currentFanProfile && window.currentFanProfile.profile === 'nostaljik') messiahCondition = closestHome.p.isTier3; // Romantikler garibanları mesih yapar
                    if (window.CrowdForm >= 3 && messiahCondition) {
                         closestHome.p.isMessiah = true;`;

content = content.replace(target3, replacement3);

// 4. VAR Hatred
let target4 = `    window.varStatus = 'checking'; 
    window.varScoringTeam = scoringTeam;`;

let replacement4 = `    window.varStatus = 'checking'; 
    if (window.currentFanProfile && window.currentFanProfile.profile === 'nostaljik') {
        if(typeof speak === 'function') speak("Hakem VAR'a gidiyor! Nostaljik taraftarlar 'Endüstriyel futbol ruhumuzu öldürdü!' diyerek stadyumu kulakları sağır edecek bir ıslık yağmuruna tuttu!");
    }
    window.varScoringTeam = scoringTeam;`;

content = content.replace(target4, replacement4);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch nostaljik applied successfully.');

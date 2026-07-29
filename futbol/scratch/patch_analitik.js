const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// 1. Add 'analitik' to fanProfilesDatabase
let target1 = `              {
                  name: "Çekirdekçi Seyirci (Numaralı Tribün / VIP)",
                  profile: "cekirdekci",
                  desc: "Sabır eşikleri çok düşüktür. 2 pas hatasında bile homurdanırlar, trafiğe kalmamak için maç bitmeden ayrılabilirler."
              }
          ];`;

let replacement1 = `              {
                  name: "Çekirdekçi Seyirci (Numaralı Tribün / VIP)",
                  profile: "cekirdekci",
                  desc: "Sabır eşikleri çok düşüktür. 2 pas hatasında bile homurdanırlar, trafiğe kalmamak için maç bitmeden ayrılabilirler."
              },
              {
                  name: "Taktiksel ve Analitik Taraftar (Yeni Nesil)",
                  profile: "analitik",
                  desc: "Oyunu duygularla değil istatistiklerle okurlar. xG ve ısı haritasına bakarlar. Oyuncu değişikliklerini ve açıklamaları eleştirirler."
              }
          ];`;

content = content.replace(target1, replacement1);

// 2. Add sub criticism in substitution logic
let target2 = `            } else {
                if(typeof speak === 'function') speak("Taktiksel bir değişiklik yapılıyor. " + pOut.name + " kenara geliyor.");
            }`;

let replacement2 = `            } else {
                if (window.currentFanProfile && window.currentFanProfile.profile === 'analitik') {
                    if(typeof speak === 'function') speak("Yeni nesil analitik taraftarlar bu değişikliğe sosyal medyadan anında tepki verdi! 'Isı haritası gayet iyiydi, asimetrik beki neden oyundan aldı?' diyerek hocayı eleştiriyorlar.");
                    window.managerAuthority = Math.max(0, window.managerAuthority - 5);
                } else {
                    if(typeof speak === 'function') speak("Taktiksel bir değişiklik yapılıyor. " + pOut.name + " kenara geliyor.");
                }
            }`;

content = content.replace(target2, replacement2);

// 3. Add endgame criticism
let target3 = `    // [YENİ] Maç Sonu Basın Toplantısı İçin Sonuç
    window.lastMatchResult = scoreDiff > 0 ? "win" : (isLoss ? "loss" : "draw");`;

let replacement3 = `    // [YENİ] Maç Sonu Basın Toplantısı İçin Sonuç
    window.lastMatchResult = scoreDiff > 0 ? "win" : (isLoss ? "loss" : "draw");
    
    if (window.currentFanProfile && window.currentFanProfile.profile === 'analitik') {
        setTimeout(() => {
            if(typeof speak === 'function') speak("Analitik taraftarlar maç sonu açıklamalarınızı istatistiksel açıdan yetersiz buldu. xG ve yarım alan (half-space) kullanımlarından bahsetmediğiniz için sosyal medyada eleştiriliyorsunuz.");
            window.managerAuthority = Math.max(0, window.managerAuthority - 5);
        }, 6500);
    }`;

content = content.replace(target3, replacement3);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch applied successfully.');

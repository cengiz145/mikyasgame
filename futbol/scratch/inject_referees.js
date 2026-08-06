const fs = require('fs');
let code = fs.readFileSync('js/game.js', 'utf8');

// 1. Inject Referees Database in initGame()
const refInitStr = `          window.refereeExperience = Math.random() < 0.4 ? 'rookie' : 'veteran'; // Hakemin tecrübesi`;
const refInitReplacement = `
          // YENİ: DİNAMİK HAKEM SİSTEMİ (11 Profil)
          window.refereesDatabase = [
              { name: "Szymon Marciniak", profile: "iletisimci", desc: "İletişimci (Kartları en son çare olarak kullanır)" },
              { name: "Pierluigi Collina", profile: "diktator", desc: "Diktatör (Sertliğe sıfır tolerans gösterir, çabuk kart çıkarır)" },
              { name: "Mike Dean", profile: "sovmen", desc: "Şovmen (Oyunu durdurmayı sever, kararlarıyla sahneye çıkar)" },
              { name: "Cüneyt Çakır", profile: "kuralci", desc: "Kuralcı (Standartlardan sapmaz, oyun çok durur)" },
              { name: "Ali Palabıyık", profile: "eyyamci", desc: "Eyyamcı (Ev sahibine veya büyük takıma tölerans gösterebilir)" },
              { name: "Mete Kalkavan", profile: "var_bagimlisi", desc: "VAR Bağımlısı (İnisiyatif almaktan kaçınır, bol bol VAR'a gider)" },
              { name: "Fırat Aydınus", profile: "ic_saha", desc: "İç Saha Hakemi (Tribün baskısından çok kolay etkilenir)" },
              { name: "Michael Oliver", profile: "ada_tarzi", desc: "Ada Tarzı (Fiziksel oyuna izin verir, çok nadir düdük çalar)" },
              { name: "Mateu Lahoz", profile: "fisleyen", desc: "Oyuncuyu Fişleyen (Önyargılıdır, sabıkalı oyunculara inanmaz)" },
              { name: "Arda Kardeşler", profile: "caylak", desc: "Çaylak/Panik (Otoritesini kurmak için gereksiz kartlar çıkarabilir)" },
              { name: "Halil Umut Meler", profile: "atletik", desc: "Atletik (Pozisyonun hep içindedir, hata yapma payı sıfıra yakındır)" }
          ];
          window.currentReferee = window.refereesDatabase[Math.floor(Math.random() * window.refereesDatabase.length)];
          
          setTimeout(() => {
              if(typeof speak === 'function') speak(\`Maçın hakemi belli oldu: \${window.currentReferee.name}. Kendisi \${window.currentReferee.desc} tarzıyla bilinir.\`);
          }, 4000); // Maç anonsu arkasından girsin diye
          
          window.refereeExperience = window.currentReferee.profile === 'caylak' ? 'rookie' : 'veteran';
`;
code = code.replace(refInitStr, refInitReplacement);

// 2. Inject Foul Chance logic
const foulChanceStr = `        let foulChance = isTier2Emotional ? 0.05 : 0.02;`;
const foulChanceReplacement = `        let foulChance = isTier2Emotional ? 0.05 : 0.02;
        
        // YENİ: Hakem Profili Etkisi (Faul İhtimali)
        let ref = window.currentReferee ? window.currentReferee.profile : "kuralci";
        if (ref === "iletisimci" || ref === "ada_tarzi") foulChance *= 0.4;
        if (ref === "kuralci") foulChance *= 1.6;
        if (ref === "sovmen") foulChance *= 1.2;
        if (ref === "eyyamci" || ref === "ic_saha") {
            if (teamType === 'home') foulChance *= 0.5; // Ev sahibini kollar
            else foulChance *= 1.5; // Deplasmanı ezer
        }
        if (ref === "fisleyen" && (p.mentalTrait === "aggressive" || p.mentalTrait === "fragile")) {
            foulChance *= 1.4; // Fişlediği oyunculara göz açtırmaz
        }
`;
code = code.replace(foulChanceStr, foulChanceReplacement);

// 3. Inject isSoftFoul card generation logic
const softFoulStr = `                let isSoftFoul = Math.random() < 0.5;`;
const softFoulReplacement = `                let isSoftFoul = Math.random() < 0.5;
                let refBase = window.currentReferee ? window.currentReferee.profile : "kuralci";
                if (refBase === "diktator" || refBase === "caylak") isSoftFoul = false; // Asla yumuşak geçmez, hemen kart veya uyarı
                if (refBase === "iletisimci" || refBase === "ada_tarzi") isSoftFoul = true; // Hep yumuşatır
`;
code = code.replace(softFoulStr, softFoulReplacement);

// 4. Inject RefMistake VAR logic
const refMistakeStr = `                            let isRefMistake = Math.random() < 0.2; // %20 İhtimalle hakem haksız karar verir`;
const refMistakeReplacement = `                            let isRefMistake = Math.random() < 0.2; // Normal Hata
                            let rPro = window.currentReferee ? window.currentReferee.profile : "kuralci";
                            if (rPro === "atletik") isRefMistake = false; // Asla hata yapmaz
                            if (rPro === "caylak") isRefMistake = Math.random() < 0.4; // %40 hata
                            if (rPro === "sovmen") isRefMistake = Math.random() < 0.3; // Şov için şüpheli kararlar
                            if (rPro === "var_bagimlisi") {
                                isRefMistake = true; // Kesin hata verir (VAR'a gitmek için)
                                setTimeout(() => {
                                    if(typeof speak === 'function') speak("Hakem kendisi karar alamadı ve VAR odasıyla iletişime geçti. Uzun bir süre bekliyoruz.");
                                }, 500);
                            }
`;
code = code.replace(refMistakeStr, refMistakeReplacement);

fs.writeFileSync('js/game.js', code, 'utf8');
console.log('Referee system injected into js/game.js!');

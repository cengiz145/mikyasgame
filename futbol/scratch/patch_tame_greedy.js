const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

// 1. Revert base surcharge back to reasonable level
let target1 = `let surcharge = 1.5 - (auth / 500); // HERKES PARAGÖZDÜR. 100 otorite -> 1.30 (En az %30 komisyon bindirmesi)`;
let replacement1 = `let surcharge = 1.3 - (auth / 400); // Orijinal, daha insaflı seviye`;
content = content.replace(target1, replacement1);

// 2. Tame the Family Agent surcharge but keep the greedy dialogue
let target2 = `        surcharge += 0.7 + (Math.random() * 0.5); // Aile içine para gireceği için aşırı paragözdürler, Süper Menajer kadar komisyon isterler
        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, duygusal insanlarız... Ama duygularımızı ancak MİLYON EUROLAR tatmin edebilir! Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yedirmem. Kesinlikle dolgun bir imza parası ve devasa bir maaş bekliyoruz, yoksa masaya dahi oturmayız!";`;

let replacement2 = `        surcharge += (Math.random() * 0.3); // Fiyat etkisi abartılı değil, makul seviyede
        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, duygusal insanlarız... Ama duygularımızı ancak MİLYON EUROLAR tatmin edebilir! Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yedirmem. Dolgun bir komisyon bekliyoruz, yoksa masaya dahi oturmayız!";`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch tame greedy agents applied successfully.');

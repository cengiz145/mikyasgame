const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

// 1. Make everyone greedy (base surcharge increase)
let target1 = `    let surcharge = 1.3 - (auth / 400); // 100 otorite -> 1.05`;
let replacement1 = `    let surcharge = 1.5 - (auth / 500); // HERKES PARAGÖZDÜR. 100 otorite -> 1.30 (En az %30 komisyon bindirmesi)`;
content = content.replace(target1, replacement1);

// 2. Make Family Agent extra greedy
let target2 = `    // Aile Menajeri (Üzerine yazar)
    if (isFamilyAgent) {
        let isSpouse = Math.random() < 0.3; // %30 Wanda Nara stili eş, %70 Baba
        let relationStr = isSpouse ? "eşime" : "oğluma";
        surcharge += (Math.random() * 0.4); // Piyasayı bilmediği için rastgele saçma fiyatlar isteyebilir
        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, ailemizin menfaatini düşünüyoruz. Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yemenize asla müsaade etmem! Lütfen duygularımızı incitecek rakamlarla gelmeyin.";
    }`;

let replacement2 = `    // Aile Menajeri (Üzerine yazar)
    if (isFamilyAgent) {
        let isSpouse = Math.random() < 0.3; // %30 Wanda Nara stili eş, %70 Baba
        let relationStr = isSpouse ? "eşime" : "oğluma";
        surcharge += 0.7 + (Math.random() * 0.5); // Aile içine para gireceği için aşırı paragözdürler, Süper Menajer kadar komisyon isterler
        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, duygusal insanlarız... Ama duygularımızı ancak MİLYON EUROLAR tatmin edebilir! Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yedirmem. Kesinlikle dolgun bir imza parası ve devasa bir maaş bekliyoruz, yoksa masaya dahi oturmayız!";
    }`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch greedy agents applied successfully.');

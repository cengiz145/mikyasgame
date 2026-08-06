const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takımı zaten var
let startIndex = 1160;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "genclerbirligi", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: GENÇLERBİRLİĞİ 2026-2027 KADROSU (AŞAMA 7)",
    p("Ertuğrul Çetin", 21, "Kaleci", 67, 2.5, "consistent", "classic"),
    p("Osman Ertuğrul Çetin", 20, "Kaleci", 62, 2.2, "consistent", "classic"),
    p("Sinan Osmanoğlu", 34, "Stoper", 68, 2.9, "aggressive", "stopper"),
    p("Zan Zuzek", 27, "Stoper", 69, 3.4, "consistent", "stopper"),
    p("Yiğit Efe Demir", 19, "Stoper", 64, 3.2, "consistent", "stopper"),
    p("Yasin Güreler", 32, "Bek", 68, 3.7, "consistent", "wingback"),
    p("Oğuzhan Berber", 32, "Bek", 67, 3.8, "consistent", "wingback"),
    p("Mikail Okyar", 25, "Orta Saha", 68, 3.9, "aggressive", "box-to-box"),
    p("Jimmy Durmaz", 35, "Orta Saha", 70, 3.5, "creative", "playmaker"),
    p("Etebo", 28, "Orta Saha", 72, 3.8, "aggressive", "box-to-box"),
    p("Ensar Kemaloğlu", 25, "Orta Saha", 65, 3.7, "consistent", "playmaker"),
    p("Buğra Çağıran", 29, "Orta Saha", 68, 3.6, "creative", "playmaker"),
    p("Amilton", 34, "Kanat", 71, 4.3, "consistent", "winger"),
    p("Metehan Mimaroğlu", 29, "Kanat", 68, 4.1, "consistent", "winger"), // Bandırma'da da var, eski takımları değişebilir
    p("Samed Onur", 21, "Kanat", 66, 4.0, "creative", "winger"),
    p("Mustapha Yatabaré", 38, "Forvet", 69, 3.2, "consistent", "target"),
    p("Oltion Bilalli", 22, "Forvet", 65, 3.9, "consistent", "poacher"),
    p("Fıratcan Üzüm", 25, "Bek", 66, 3.8, "consistent", "wingback"),
    p("Elias Durmaz", 24, "Kanat", 64, 3.9, "consistent", "winger"),
    p("Gökhan Altıparmak", 23, "Orta Saha", 62, 3.6, "consistent", "box-to-box")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Gençlerbirliği eklendi.");

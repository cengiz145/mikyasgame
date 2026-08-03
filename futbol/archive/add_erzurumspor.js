const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takım var (erzurumspor)
// Kadroyu oluştur
let startIndex = 1225;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "erzurumspor", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: ERZURUMSPOR FK 2026-2027 KADROSU (AŞAMA 10)",
    p("Mehmet Göktüğ Bakırbaş", 28, "Kaleci", 67, 2.2, "consistent", "classic"),
    p("Rıdvan Oğuzhan Yağcı", 24, "Kaleci", 63, 1.9, "consistent", "classic"),
    p("Mustafa Akbaş", 34, "Stoper", 68, 2.9, "aggressive", "stopper"),
    p("Mustafa Yumlu", 36, "Stoper", 69, 2.7, "consistent", "stopper"),
    p("Ufuk Budak", 34, "Bek", 65, 3.2, "consistent", "wingback"),
    p("Orhan Ovacıklı", 35, "Bek", 66, 3.4, "consistent", "wingback"),
    p("Süleyman Koç", 35, "Bek", 67, 3.6, "creative", "wingback"),
    p("Sefa Akgün", 24, "Orta Saha", 65, 3.8, "consistent", "box-to-box"),
    p("Batuhan Artarslan", 30, "Orta Saha", 66, 3.5, "consistent", "playmaker"),
    p("Alican Özfesli", 27, "Orta Saha", 68, 3.7, "creative", "playmaker"),
    p("Estrela", 28, "Orta Saha", 69, 3.6, "aggressive", "box-to-box"),
    p("Mikhail Rosheuvel", 33, "Kanat", 70, 4.0, "creative", "winger"),
    p("Eren Tozlu", 33, "Forvet", 71, 3.5, "consistent", "poacher"),
    p("Celal Hanalp", 28, "Kanat", 67, 3.9, "consistent", "winger"),
    p("Özgür Sert", 23, "Orta Saha", 64, 3.6, "consistent", "box-to-box"),
    p("Fırat Şaşi", 22, "Orta Saha", 62, 3.5, "consistent", "playmaker"),
    p("Hüseyin Mevlütoğlu", 20, "Forvet", 61, 3.7, "fragile", "target"),
    p("Enes Yiğit", 21, "Bek", 63, 3.6, "consistent", "wingback"),
    p("Koray Kılınç", 24, "Forvet", 66, 3.8, "consistent", "poacher"),
    p("Gürkan Varlık", 22, "Stoper", 62, 3.1, "consistent", "stopper")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Erzurumspor eklendi.");

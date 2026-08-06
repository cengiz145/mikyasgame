const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takımı ekle
const newTeam = `        { id: "istanbulspor", name: "İstanbulspor", color: "#FFFF00", budget: 15, city: "Istanbul" },\n`;
content = content.replace(/\]\,\s*players:\s*\[/, newTeam + '    ],\n    players: [\n');

// Kadroyu oluştur
let startIndex = 1095;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "istanbulspor", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: İSTANBULSPOR 2026-2027 KADROSU (AŞAMA 4)",
    p("Alp Arda", 29, "Kaleci", 68, 2.5, "consistent", "classic"),
    p("Mücahit Serbest", 20, "Kaleci", 62, 2.3, "consistent", "classic"),
    p("Simon Deli", 32, "Stoper", 72, 3.0, "aggressive", "stopper"),
    p("Okan Erdoğan", 25, "Stoper", 68, 3.4, "consistent", "stopper"),
    p("Modestas Vorobjovas", 28, "Orta Saha", 69, 3.6, "consistent", "box-to-box"),
    p("Jackson", 24, "Orta Saha", 68, 4.0, "creative", "playmaker"),
    p("Eduard Rroca", 30, "Orta Saha", 73, 3.7, "creative", "playmaker"),
    p("Ali Yaşar", 29, "Bek", 69, 3.9, "consistent", "wingback"),
    p("Demeaco Duhaney", 25, "Bek", 68, 4.2, "aggressive", "wingback"),
    p("Valon Ethemi", 26, "Kanat", 74, 4.3, "creative", "winger"), // Eğer dönmüşse
    p("Emir Kaan Gültekin", 23, "Forvet", 69, 4.0, "consistent", "poacher"),
    p("Mendy Mamadou", 25, "Kanat", 68, 4.4, "fragile", "winger"),
    p("Florian Loshaj", 27, "Orta Saha", 71, 3.8, "consistent", "box-to-box"),
    p("Racine Coly", 28, "Stoper", 70, 3.5, "aggressive", "stopper"),
    p("Muammer Sarıkaya", 26, "Orta Saha", 68, 3.7, "consistent", "box-to-box"),
    p("Vefa Temel", 21, "Orta Saha", 66, 3.6, "creative", "playmaker"),
    p("Özcan Şahan", 25, "Forvet", 65, 3.8, "consistent", "target"),
    p("Enes Alıç", 24, "Bek", 64, 3.8, "consistent", "wingback"),
    p("Ahmet Özer", 22, "Orta Saha", 63, 3.5, "consistent", "box-to-box"),
    p("Eray Dizdar", 20, "Stoper", 61, 3.0, "consistent", "stopper"),
    p("Deniz Yeşil", 19, "Kanat", 60, 3.9, "consistent", "winger")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("İstanbulspor eklendi.");

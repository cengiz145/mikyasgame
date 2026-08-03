const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takımı ekle
const newTeam = `        { id: "ankaragucu", name: "MKE Ankaragücü", color: "#FFFF00", budget: 20, city: "Ankara" },\n`;
content = content.replace(/\]\,\s*players:\s*\[/, newTeam + '    ],\n    players: [\n');

// Kadroyu oluştur
let startIndex = 1020;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "ankaragucu", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: MKE ANKARAGÜCÜ 2026-2027 KADROSU (AŞAMA 1)",
    p("Bahadır Han Güngördü", 28, "Kaleci", 73, 2.3, "consistent", "classic"),
    p("Ertaç Özbir", 34, "Kaleci", 70, 2.0, "consistent", "classic"),
    p("Mert Çetin", 27, "Stoper", 72, 3.2, "aggressive", "stopper"),
    p("Uros Radakovic", 30, "Stoper", 74, 3.0, "elite", "stopper"),
    p("Alper Uludağ", 33, "Bek", 69, 3.8, "consistent", "wingback"),
    p("Stelios Kitsiou", 30, "Bek", 75, 4.0, "aggressive", "wingback"),
    p("Hayrullah Bilazer", 29, "Bek", 68, 3.7, "consistent", "wingback"),
    p("Tolga Ciğerci", 32, "Orta Saha", 76, 3.5, "creative", "playmaker"),
    p("Efkan Bekiroğlu", 28, "Orta Saha", 74, 3.7, "creative", "box-to-box"),
    p("Ali Kaan Güneren", 24, "Orta Saha", 71, 3.8, "consistent", "box-to-box"),
    p("Cem Türkmen", 22, "Orta Saha", 67, 3.6, "consistent", "playmaker"),
    p("Garry Rodrigues", 33, "Kanat", 73, 4.4, "creative", "winger"),
    p("Christian Bassogog", 28, "Kanat", 75, 4.5, "aggressive", "winger"),
    p("Renaldo Cephas", 24, "Kanat", 72, 4.7, "fragile", "winger"),
    p("Riad Bajić", 30, "Forvet", 74, 3.5, "consistent", "target"),
    p("Federico Macheda", 32, "Forvet", 71, 3.3, "consistent", "poacher"),
    p("Olimpiu Moruțan", 25, "Orta Saha", 75, 4.0, "creative", "playmaker"), 
    p("Atakan Çankaya", 26, "Stoper", 68, 3.1, "aggressive", "stopper"),
    p("Arda Ünyay", 19, "Stoper", 62, 3.0, "consistent", "stopper"),
    p("Sirozhiddin Astanakulov", 20, "Kanat", 63, 4.0, "consistent", "winger"),
    p("Ender Aygören", 23, "Orta Saha", 64, 3.6, "consistent", "box-to-box"),
    p("Fıratcan Üzüm", 25, "Bek", 67, 3.8, "consistent", "wingback"),
    p("Enes Tepecik", 20, "Forvet", 61, 3.8, "fragile", "poacher")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Ankaragücü eklendi.");

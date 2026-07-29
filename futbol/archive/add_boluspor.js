const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takımı ekle
const newTeam = `        { id: "boluspor", name: "Boluspor", color: "#FF0000", budget: 14, city: "Bolu" },\n`;
content = content.replace(/\]\,\s*players:\s*\[/, newTeam + '    ],\n    players: [\n');

// Kadroyu oluştur
let startIndex = 1180;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "boluspor", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: BOLUSPOR 2026-2027 KADROSU (AŞAMA 8)",
    p("Çağlar Şahin Akbaba", 29, "Kaleci", 67, 2.0, "consistent", "classic"),
    p("İsmail Çipe", 29, "Kaleci", 64, 1.9, "consistent", "classic"),
    p("Veaceslav Posmac", 33, "Stoper", 69, 2.8, "aggressive", "stopper"),
    p("Naby Oularé", 21, "Stoper", 67, 3.4, "aggressive", "stopper"),
    p("Onur Ulaş", 28, "Stoper", 66, 3.1, "consistent", "stopper"),
    p("Hakan Bilgiç", 31, "Bek", 68, 3.8, "consistent", "wingback"),
    p("Ercan Coşkun", 29, "Bek", 67, 3.6, "consistent", "wingback"),
    p("Daniel Avramovski", 29, "Orta Saha", 70, 3.7, "creative", "playmaker"),
    p("Jefferson", 30, "Orta Saha", 69, 3.8, "consistent", "box-to-box"),
    p("Oğuz Kaan Gütekin", 25, "Orta Saha", 66, 3.5, "consistent", "playmaker"),
    p("Kubilay Sönmez", 30, "Orta Saha", 68, 3.4, "aggressive", "box-to-box"),
    p("Berk Yıldız", 28, "Kanat", 68, 4.0, "creative", "winger"),
    p("Anıl Koç", 29, "Kanat", 67, 4.1, "fragile", "winger"),
    p("Joel Ngandu Kayamba", 32, "Kanat", 69, 4.2, "consistent", "winger"),
    p("Eren Aydın", 21, "Forvet", 66, 4.0, "consistent", "poacher"),
    p("Babacar Diop", 20, "Forvet", 68, 4.2, "fragile", "target"),
    p("Hüsamettin Yener", 29, "Forvet", 67, 3.8, "consistent", "poacher"),
    p("Tunahan Çiçek", 32, "Kanat", 68, 3.7, "consistent", "winger"),
    p("Ishan Pehlivan", 23, "Bek", 63, 3.6, "consistent", "wingback"),
    p("Erdem Can Polat", 21, "Orta Saha", 62, 3.5, "consistent", "box-to-box")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Boluspor eklendi.");

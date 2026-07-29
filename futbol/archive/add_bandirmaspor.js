const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takımı ekle
const newTeam = `        { id: "bandirmaspor", name: "Bandırmaspor", color: "#800000", budget: 14, city: "Balikesir" },\n`;
content = content.replace(/\]\,\s*players:\s*\[/, newTeam + '    ],\n    players: [\n');

// Kadroyu oluştur
let startIndex = 1140;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "bandirmaspor", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: BANDIRMASPOR 2026-2027 KADROSU (AŞAMA 6)",
    p("Zafer Görgen", 24, "Kaleci", 67, 2.0, "consistent", "classic"),
    p("Akın Alkan", 34, "Kaleci", 65, 1.8, "consistent", "classic"),
    p("Edson Mexer", 35, "Stoper", 72, 2.8, "aggressive", "stopper"),
    p("Batuhan Yayıkcı", 28, "Stoper", 68, 3.2, "consistent", "stopper"),
    p("Sergen Piçinciol", 28, "Stoper", 67, 3.0, "consistent", "stopper"),
    p("Rahmetullah Berişbek", 25, "Bek", 69, 3.8, "aggressive", "wingback"),
    p("Emre Batuhan Adıgüzel", 22, "Bek", 64, 3.7, "consistent", "wingback"),
    p("Remi Mulumba", 31, "Orta Saha", 71, 3.5, "aggressive", "box-to-box"),
    p("Mehmet Özcan", 25, "Orta Saha", 68, 3.7, "consistent", "playmaker"),
    p("Hikmet Çiftçi", 26, "Orta Saha", 67, 3.6, "consistent", "playmaker"),
    p("Metehan Mimaroğlu", 29, "Kanat", 70, 4.0, "creative", "winger"),
    p("Florian Jozefzoon", 33, "Kanat", 69, 4.2, "fragile", "winger"),
    p("Doğan Can Davas", 26, "Kanat", 68, 4.1, "consistent", "winger"),
    p("Navarone Foor", 32, "Orta Saha", 68, 3.6, "creative", "playmaker"),
    p("Cebio Soukou", 31, "Kanat", 69, 4.0, "aggressive", "winger"),
    p("Moussa Djitté", 24, "Forvet", 71, 4.0, "aggressive", "target"),
    p("Metehan Mertöz", 22, "Forvet", 65, 3.8, "consistent", "poacher"),
    p("Paulão", 25, "Orta Saha", 69, 3.8, "consistent", "box-to-box"),
    p("Mustafa Çeçenoğlu", 30, "Kanat", 67, 3.9, "consistent", "winger"),
    p("Faruk Can Genç", 24, "Bek", 66, 3.8, "consistent", "wingback")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Bandırmaspor eklendi.");

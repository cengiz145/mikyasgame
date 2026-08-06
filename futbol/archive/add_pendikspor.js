const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takımı ekle
const newTeam = `        { id: "pendikspor", name: "Pendikspor", color: "#FF0000", budget: 16, city: "Istanbul" },\n`;
content = content.replace(/\]\,\s*players:\s*\[/, newTeam + '    ],\n    players: [\n');

// Kadroyu oluştur
let startIndex = 1070;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "pendikspor", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: PENDİKSPOR 2026-2027 KADROSU (AŞAMA 3)",
    p("Erdem Canpolat", 23, "Kaleci", 68, 2.2, "consistent", "classic"),
    p("Burak Öğür", 35, "Kaleci", 66, 1.8, "consistent", "classic"),
    p("Alpaslan Öztürk", 31, "Stoper", 72, 2.8, "aggressive", "stopper"),
    p("Welinton", 35, "Stoper", 70, 2.9, "aggressive", "stopper"),
    p("Murat Akça", 34, "Stoper", 67, 3.0, "consistent", "stopper"),
    p("Nuno Sequeira", 34, "Bek", 71, 3.8, "consistent", "wingback"),
    p("Erdem Özgenç", 40, "Bek", 65, 3.1, "consistent", "wingback"),
    p("Gökcan Kaya", 29, "Bek", 68, 4.0, "consistent", "wingback"),
    p("İbrahim Akdağ", 33, "Orta Saha", 70, 3.4, "aggressive", "box-to-box"),
    p("Hasan Kılıç", 32, "Orta Saha", 72, 3.5, "consistent", "playmaker"),
    p("Bekir Karadeniz", 25, "Orta Saha", 69, 3.7, "creative", "box-to-box"),
    p("Enes Keskin", 23, "Orta Saha", 65, 3.8, "consistent", "playmaker"),
    p("Leandro Kappel", 34, "Kanat", 71, 4.2, "consistent", "winger"),
    p("Sandro Lima", 33, "Forvet", 73, 3.8, "consistent", "target"),
    p("Ezequiel Ponce", 27, "Forvet", 74, 4.0, "consistent", "poacher"),
    p("Emeka Eze", 27, "Forvet", 72, 4.2, "aggressive", "target"),
    p("Khadim Rassoul", 29, "Stoper", 69, 3.5, "consistent", "stopper"),
    p("Samet Asatekin", 32, "Kanat", 67, 4.0, "consistent", "winger"),
    p("Melih Güney", 20, "Bek", 62, 3.9, "consistent", "wingback"),
    p("Furkan Doğan", 22, "Orta Saha", 64, 3.6, "consistent", "box-to-box")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Pendikspor eklendi.");

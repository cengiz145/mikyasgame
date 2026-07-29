const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takım var (corum)
// Kadroyu oluştur
let startIndex = 1200;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "corum", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: ÇORUM FK 2026-2027 KADROSU (AŞAMA 9)",
    p("Hasan Hüseyin Akınay", 30, "Kaleci", 68, 2.1, "consistent", "classic"),
    p("Ali Türkan", 36, "Kaleci", 64, 1.8, "consistent", "classic"),
    p("Loick Landre", 32, "Stoper", 71, 3.2, "aggressive", "stopper"),
    p("Zargo Touré", 34, "Stoper", 69, 3.0, "consistent", "stopper"),
    p("Erkan Kaş", 32, "Bek", 67, 3.8, "consistent", "wingback"),
    p("Kerem Kalafat", 23, "Bek", 69, 4.0, "aggressive", "wingback"),
    p("Adem Doğan", 22, "Stoper", 65, 3.3, "consistent", "stopper"),
    p("Atakan Akkaynak", 25, "Orta Saha", 68, 3.6, "consistent", "playmaker"),
    p("Ferhat Yazgan", 31, "Orta Saha", 69, 3.5, "aggressive", "box-to-box"),
    p("Hakan Barış", 30, "Orta Saha", 67, 3.4, "consistent", "box-to-box"),
    p("Ozan Sol", 31, "Kanat", 70, 4.1, "consistent", "winger"),
    p("Geraldo", 32, "Kanat", 71, 4.2, "fragile", "winger"),
    p("Suat Kaya", 25, "Kanat", 68, 4.0, "consistent", "winger"),
    p("Massis Guluk", 22, "Orta Saha", 66, 3.8, "creative", "playmaker"),
    p("Thomas Verheydt", 32, "Forvet", 73, 3.3, "aggressive", "target"),
    p("Ahmet İlhan Özek", 36, "Kanat", 68, 3.8, "consistent", "winger"),
    p("Sinan Kurumuş", 29, "Forvet", 67, 3.6, "consistent", "poacher"),
    p("Berat Ali Genç", 31, "Kanat", 65, 3.9, "consistent", "winger"),
    p("Gökhan Karadeniz", 34, "Orta Saha", 68, 3.5, "creative", "playmaker"),
    p("Mustafa Emre Can", 23, "Bek", 64, 3.7, "consistent", "wingback")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Çorum FK eklendi.");

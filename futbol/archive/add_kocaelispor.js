const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Kocaelispor zaten teams array'inde var, sadece oyuncular eklenecek.
// Kadroyu oluştur
let startIndex = 1120;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "kocaelispor", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: KOCAELİSPOR 2026-2027 KADROSU (AŞAMA 5)",
    p("Gökhan Değirmenci", 35, "Kaleci", 69, 1.8, "consistent", "classic"),
    p("Harun Tekin", 35, "Kaleci", 67, 1.7, "consistent", "classic"),
    p("Aaron Appindangoyé", 32, "Stoper", 73, 3.3, "aggressive", "stopper"),
    p("Tarkan Serbest", 30, "Stoper", 70, 3.1, "consistent", "stopper"),
    p("Burak Öksüz", 28, "Stoper", 68, 3.2, "consistent", "stopper"),
    p("Muharrem Cinan", 26, "Bek", 69, 3.8, "consistent", "wingback"),
    p("Mehmet Yılmaz", 28, "Bek", 67, 3.6, "consistent", "wingback"),
    p("Vukovic", 30, "Orta Saha", 71, 3.5, "aggressive", "box-to-box"),
    p("Pedro Amaral", 26, "Bek", 70, 3.9, "creative", "wingback"),
    p("Pedrinho", 31, "Orta Saha", 74, 3.8, "creative", "playmaker"),
    p("Mesut Can Tunalı", 23, "Orta Saha", 65, 3.7, "consistent", "playmaker"),
    p("Ryan Mendes", 34, "Kanat", 75, 4.3, "consistent", "winger"),
    p("Giorgi Beridze", 27, "Kanat", 71, 4.2, "fragile", "winger"),
    p("Barış Alıcı", 27, "Kanat", 68, 4.0, "creative", "winger"),
    p("Mijo Caktas", 32, "Orta Saha", 73, 3.6, "consistent", "playmaker"),
    p("Markao", 28, "Forvet", 74, 4.0, "aggressive", "target"),
    p("Christian Kouakou", 33, "Forvet", 69, 3.9, "consistent", "poacher"),
    p("Onur Öztonga", 24, "Stoper", 64, 3.0, "consistent", "stopper"),
    p("Oğulcan Çağlayan", 28, "Forvet", 70, 3.8, "consistent", "target"),
    p("Eren Bilen", 23, "Kaleci", 63, 2.0, "consistent", "classic")
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Kocaelispor oyuncuları eklendi.");

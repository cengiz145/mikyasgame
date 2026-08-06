const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// Takımı ekle
const newTeam = `        { id: "karagumruk", name: "Fatih Karagümrük", color: "#FF0000", budget: 18, city: "Istanbul" },\n`;
content = content.replace(/\]\,\s*players:\s*\[/, newTeam + '    ],\n    players: [\n');

// Kadroyu oluştur
let startIndex = 1045;
const p = (name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "karagumruk", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

const players = [
    "        // TFF 1. LİG: FATİH KARAGÜMRÜK 2026-2027 KADROSU (AŞAMA 2)",
    p("Emre Bilgin", 22, "Kaleci", 70, 2.5, "consistent", "classic"),
    p("Furkan Bekleviç", 25, "Kaleci", 65, 2.1, "consistent", "classic"),
    p("Papy Djilobodji", 35, "Stoper", 73, 2.8, "aggressive", "stopper"),
    p("Berkay Dabanlı", 33, "Stoper", 68, 2.9, "consistent", "stopper"),
    p("Emir Tintiş", 20, "Stoper", 64, 3.2, "consistent", "stopper"),
    p("Levent Mercan", 23, "Bek", 75, 4.2, "creative", "wingback"), // Bazen başka takımda oynar ama TFF1 için iyi bir sol bek profili (veya Çağtay Kurukalıp)
    p("Çağtay Kurukalıp", 22, "Bek", 67, 3.8, "consistent", "wingback"),
    p("Vesel Demaku", 24, "Orta Saha", 70, 3.6, "consistent", "box-to-box"),
    p("Göktan Gürpüz", 21, "Orta Saha", 69, 3.9, "creative", "playmaker"),
    p("Efe Tatlı", 22, "Orta Saha", 66, 3.5, "consistent", "box-to-box"),
    p("Marcus Rohdén", 33, "Orta Saha", 72, 3.4, "consistent", "box-to-box"),
    p("Ahmet Sivri", 25, "Kanat", 68, 4.0, "consistent", "winger"),
    p("Nikola Dovedan", 30, "Kanat", 71, 3.9, "consistent", "winger"),
    p("Didier Lamkel Zé", 27, "Kanat", 74, 4.3, "fragile", "winger"),
    p("Wesley Moraes", 27, "Forvet", 73, 3.5, "aggressive", "target"),
    p("Kevin Lasagna", 32, "Forvet", 74, 4.1, "consistent", "poacher"), // İtalyan golcü
    p("Emre Mor", 27, "Kanat", 76, 4.5, "fragile", "winger"), // Bazen geri döner
    p("Tonio Teklić", 24, "Orta Saha", 70, 3.7, "creative", "playmaker"),
    p("Nazım Sangaré", 30, "Bek", 72, 4.0, "aggressive", "wingback"),
    p("Salih Dursun", 33, "Stoper", 67, 3.0, "consistent", "stopper"),
    p("Marius Corbu", 22, "Orta Saha", 68, 3.8, "consistent", "playmaker"),
    p("Arif Kocaman", 21, "Stoper", 65, 3.3, "consistent", "stopper"),
    p("Sirigu", 37, "Kaleci", 72, 1.8, "elite", "classic") // Salvatore Sirigu
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + players + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Fatih Karagümrük eklendi.");

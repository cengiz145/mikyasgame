const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

const newTeams = `        { id: "keciorengucu", name: "Ankara Keçiörengücü", color: "#800080", budget: 12, city: "Ankara" },
        { id: "manisa", name: "Manisa FK", color: "#000000", budget: 14, city: "Manisa" },
        { id: "sanliurfa", name: "Şanlıurfaspor", color: "#FFFF00", budget: 12, city: "Sanliurfa" },
        { id: "igdir", name: "Iğdır FK", color: "#008000", budget: 15, city: "Igdir" },
        { id: "erokspor", name: "Esenler Erokspor", color: "#FFFF00", budget: 11, city: "Istanbul" },
        { id: "malatya", name: "Yeni Malatyaspor", color: "#FFFF00", budget: 10, city: "Malatya" },
        { id: "sakaryaspor", name: "Sakaryaspor", color: "#008000", budget: 14, city: "Sakarya" },
        { id: "adanaspor", name: "Adanaspor", color: "#FFA500", budget: 11, city: "Adana" },
        { id: "umraniyespor", name: "Ümraniyespor", color: "#FF0000", budget: 13, city: "Istanbul" },\n`;

content = content.replace(/\]\,\s*players:\s*\[/, newTeams + '    ],\n    players: [\n');

let startIndex = 1250;
const p = (teamId, name, age, pos, pow, spd, ment, role) => {
    let contractYears = age < 25 ? Math.floor(Math.random()*2)+4 : (age <= 31 ? Math.floor(Math.random()*2)+3 : Math.floor(Math.random()*2)+1);
    return `        { id: ${startIndex++}, teamId: "${teamId}", name: "${name}", age: ${age}, position: "${pos}", power: ${pow}, speed: ${spd}, mentalTrait: "${ment}", tacticalRole: "${role}", contractYears: ${contractYears} },`;
};

// 10 Takımın jenerik ama gerçekçi TFF 1. Lig kadroları (her takıma 18 oyuncu)
const t_keciorengucu = [
    p("keciorengucu", "Metin Uçar", 33, "Kaleci", 66, 1.8, "consistent", "classic"),
    p("keciorengucu", "Muharrem Cinan", 26, "Bek", 65, 3.8, "consistent", "wingback"),
    p("keciorengucu", "Mert Kula", 29, "Stoper", 67, 3.2, "aggressive", "stopper"),
    p("keciorengucu", "Aykut Demir", 35, "Stoper", 68, 2.9, "aggressive", "stopper"),
    p("keciorengucu", "Erkam Develi", 24, "Orta Saha", 65, 3.6, "consistent", "box-to-box"),
    p("keciorengucu", "Mikail Okyar", 25, "Orta Saha", 66, 3.5, "consistent", "playmaker"),
    p("keciorengucu", "Melih İnan", 23, "Kanat", 67, 4.0, "creative", "winger"),
    p("keciorengucu", "Christian", 24, "Forvet", 68, 3.9, "consistent", "poacher")
];

const t_manisa = [
    p("manisa", "Alperen Uysal", 30, "Kaleci", 67, 2.0, "consistent", "classic"),
    p("manisa", "Ensar Akgün", 24, "Stoper", 65, 3.2, "consistent", "stopper"),
    p("manisa", "Sandro Lima", 33, "Forvet", 70, 3.6, "consistent", "target"),
    p("manisa", "Kerim Frei", 30, "Kanat", 71, 4.1, "creative", "winger"),
    p("manisa", "Oğuz Gürbulak", 31, "Orta Saha", 68, 3.5, "aggressive", "playmaker"),
    p("manisa", "Diallo", 27, "Kanat", 69, 4.2, "fragile", "winger"),
    p("manisa", "Bekir Karadeniz", 25, "Orta Saha", 66, 3.6, "consistent", "box-to-box"),
    p("manisa", "Kaan Kanak", 33, "Bek", 67, 3.4, "consistent", "wingback")
];

const t_sanliurfa = [
    p("sanliurfa", "Erzhan Tokotaev", 23, "Kaleci", 65, 2.2, "consistent", "classic"),
    p("sanliurfa", "Mehmet Yiğit", 32, "Stoper", 66, 3.0, "aggressive", "stopper"),
    p("sanliurfa", "Barış Gök", 30, "Bek", 65, 3.5, "consistent", "wingback"),
    p("sanliurfa", "Cumali Bişi", 31, "Orta Saha", 67, 3.3, "aggressive", "box-to-box"),
    p("sanliurfa", "Aldair", 32, "Kanat", 68, 3.9, "creative", "winger"),
    p("sanliurfa", "Marco Paixao", 39, "Forvet", 70, 2.9, "consistent", "poacher"),
    p("sanliurfa", "Amar Begic", 23, "Orta Saha", 64, 3.6, "consistent", "playmaker"),
    p("sanliurfa", "Urie-Michel Mboula", 21, "Orta Saha", 65, 3.7, "creative", "box-to-box")
];

const t_igdir = [
    p("igdir", "Alp Arda", 29, "Kaleci", 66, 2.1, "consistent", "classic"),
    p("igdir", "Hasan Hatipoğlu", 34, "Stoper", 68, 2.8, "aggressive", "stopper"),
    p("igdir", "Alim Öztürk", 31, "Stoper", 69, 3.1, "consistent", "stopper"),
    p("igdir", "Burak Çoban", 29, "Kanat", 68, 4.0, "consistent", "winger"),
    p("igdir", "Tahacan Velioğlu", 30, "Stoper", 67, 3.0, "consistent", "stopper"),
    p("igdir", "Halil İbrahim Sönmez", 33, "Kanat", 67, 3.9, "consistent", "winger"),
    p("igdir", "Ömer Şişmanoğlu", 34, "Forvet", 71, 3.5, "consistent", "poacher"),
    p("igdir", "Adrien Regattin", 32, "Orta Saha", 72, 3.8, "creative", "playmaker")
];

const t_amed = [
    p("amed", "Ertuğrul Taşkıran", 34, "Kaleci", 68, 1.9, "consistent", "classic"),
    p("amed", "Veli Çetin", 29, "Stoper", 67, 3.0, "aggressive", "stopper"),
    p("amed", "Batuhan Tur", 32, "Bek", 66, 3.5, "consistent", "wingback"),
    p("amed", "Serkan Odabaşıoğlu", 29, "Orta Saha", 68, 3.6, "aggressive", "box-to-box"),
    p("amed", "Oktay Aydın", 26, "Orta Saha", 67, 3.7, "consistent", "playmaker"),
    p("amed", "Berk İsmail Ünsal", 29, "Forvet", 69, 3.6, "consistent", "target"),
    p("amed", "Çekdar Orhan", 26, "Kanat", 70, 4.0, "creative", "winger"),
    p("amed", "Yılmaz Ceylan", 23, "Kanat", 67, 4.2, "fragile", "winger")
];

const t_erokspor = [
    p("erokspor", "Ercüment Kafkasyalı", 33, "Kaleci", 65, 2.0, "consistent", "classic"),
    p("erokspor", "Sertaç Çam", 31, "Kanat", 67, 3.8, "consistent", "winger"),
    p("erokspor", "Onur Eriş", 31, "Orta Saha", 66, 3.7, "creative", "playmaker"),
    p("erokspor", "Alper Karaman", 23, "Orta Saha", 64, 3.6, "consistent", "box-to-box"),
    p("erokspor", "Emirhan Dirisag", 21, "Bek", 63, 3.7, "consistent", "wingback"),
    p("erokspor", "Abuzer Gaffar Toplu", 32, "Forvet", 66, 3.5, "aggressive", "target"),
    p("erokspor", "Serdar Cansu", 32, "Bek", 65, 3.4, "consistent", "wingback"),
    p("erokspor", "Maksut Taşkıran", 28, "Orta Saha", 66, 3.6, "consistent", "box-to-box")
];

const t_malatya = [
    p("malatya", "Abdulsamed Damlu", 24, "Kaleci", 64, 2.3, "consistent", "classic"),
    p("malatya", "Erşan Yaşa", 24, "Bek", 63, 3.6, "consistent", "wingback"),
    p("malatya", "Burak Kavlak", 27, "Stoper", 64, 3.1, "aggressive", "stopper"),
    p("malatya", "Cengizhan Akgün", 25, "Kanat", 66, 4.0, "creative", "winger"),
    p("malatya", "Berat Yaman", 20, "Orta Saha", 60, 3.5, "consistent", "box-to-box"),
    p("malatya", "Yiğit Ulaş", 22, "Stoper", 61, 3.2, "consistent", "stopper"),
    p("malatya", "Mert Miraç Altıntaş", 22, "Forvet", 63, 3.7, "consistent", "poacher"),
    p("malatya", "Enes Savucu", 21, "Orta Saha", 61, 3.6, "consistent", "playmaker")
];

const t_sakaryaspor = [
    p("sakaryaspor", "Cihan Topaloğlu", 31, "Kaleci", 68, 2.0, "consistent", "classic"),
    p("sakaryaspor", "Isaac Donkor", 28, "Stoper", 70, 3.4, "aggressive", "stopper"),
    p("sakaryaspor", "Çağlayan Menderes", 25, "Stoper", 67, 3.2, "consistent", "stopper"),
    p("sakaryaspor", "Oğuz Yıldırım", 29, "Bek", 68, 3.8, "consistent", "wingback"),
    p("sakaryaspor", "Hasan Kılıç", 32, "Orta Saha", 71, 3.5, "consistent", "playmaker"),
    p("sakaryaspor", "Murat Cem Akpınar", 25, "Orta Saha", 69, 3.7, "creative", "box-to-box"),
    p("sakaryaspor", "Dino Ndlovu", 34, "Forvet", 70, 3.3, "consistent", "target"),
    p("sakaryaspor", "Yonathan Del Valle", 33, "Kanat", 72, 4.1, "fragile", "winger")
];

const t_adanaspor = [
    p("adanaspor", "Ahmet Said Kıvanç", 25, "Kaleci", 65, 2.2, "consistent", "classic"),
    p("adanaspor", "Fatih Kurucuk", 26, "Stoper", 68, 3.1, "aggressive", "stopper"),
    p("adanaspor", "Evren Korkmaz", 27, "Stoper", 66, 3.2, "consistent", "stopper"),
    p("adanaspor", "Ferhat Katipoğlu", 24, "Bek", 65, 3.7, "consistent", "wingback"),
    p("adanaspor", "Kubilay Aktaş", 29, "Orta Saha", 67, 3.4, "aggressive", "box-to-box"),
    p("adanaspor", "Hakkı Türker", 23, "Orta Saha", 64, 3.6, "consistent", "playmaker"),
    p("adanaspor", "Samuel Yepie Yepie", 21, "Kanat", 68, 4.2, "creative", "winger"),
    p("adanaspor", "Amadou Ciss", 24, "Forvet", 67, 4.0, "consistent", "poacher")
];

const t_umraniyespor = [
    p("umraniyespor", "Abdulsamed Damlu", 24, "Kaleci", 66, 2.3, "consistent", "classic"),
    p("umraniyespor", "Tomislav Glumac", 33, "Stoper", 69, 2.9, "consistent", "stopper"),
    p("umraniyespor", "Mustafa Eser", 22, "Stoper", 65, 3.3, "consistent", "stopper"),
    p("umraniyespor", "Serkan Göksu", 30, "Orta Saha", 67, 3.5, "consistent", "box-to-box"),
    p("umraniyespor", "Emre Demir", 20, "Orta Saha", 69, 3.9, "creative", "playmaker"),
    p("umraniyespor", "Sıraçhan Nas", 21, "Orta Saha", 66, 3.7, "aggressive", "box-to-box"),
    p("umraniyespor", "Atalay Babacan", 23, "Orta Saha", 68, 3.8, "creative", "playmaker"),
    p("umraniyespor", "Kévin Boli", 32, "Stoper", 68, 3.1, "aggressive", "stopper")
];

const allPlayers = [
    "        // TFF 1. LİG: GERİYE KALAN 10 TAKIM KADROSU (AŞAMA 11-20)",
    ...t_keciorengucu, ...t_manisa, ...t_sanliurfa, ...t_igdir, ...t_amed,
    ...t_erokspor, ...t_malatya, ...t_sakaryaspor, ...t_adanaspor, ...t_umraniyespor
].join("\n");

content = content.replace(/players:\s*\[/, 'players: [\n' + allPlayers + '\n');

fs.writeFileSync(dataFile, content, 'utf8');
console.log("Kalan 10 takım ve oyuncuları eklendi.");

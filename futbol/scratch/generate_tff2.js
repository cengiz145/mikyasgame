const fs = require('fs');

const tff2Teams = [
    {"id": "bucaspor", "name": "Bucaspor 1928", "color": "#FFFF00", "budget": 10, "city": "Izmir", "leagueId": "tff2"},
    {"id": "altinordu", "name": "Altınordu", "color": "#FF0000", "budget": 10, "city": "Izmir", "leagueId": "tff2"},
    {"id": "kastamonu", "name": "Kastamonuspor", "color": "#FF0000", "budget": 10, "city": "Kastamonu", "leagueId": "tff2"},
    {"id": "vanspor", "name": "Vanspor FK", "color": "#FF0000", "budget": 9, "city": "Van", "leagueId": "tff2"},
    {"id": "iskenderun", "name": "İskenderunspor", "color": "#0000FF", "budget": 9, "city": "Hatay", "leagueId": "tff2"},
    {"id": "erzincanspor", "name": "24 Erzincanspor", "color": "#FF0000", "budget": 8, "city": "Erzincan", "leagueId": "tff2"},
    {"id": "menemen", "name": "Menemen FK", "color": "#FFFF00", "budget": 8, "city": "Izmir", "leagueId": "tff2"},
    {"id": "isparta32", "name": "Isparta 32 Spor", "color": "#008000", "budget": 7, "city": "Isparta", "leagueId": "tff2"},
    {"id": "karaman", "name": "Karaman FK", "color": "#FF0000", "budget": 7, "city": "Karaman", "leagueId": "tff2"},
    {"id": "somaspor", "name": "Somaspor", "color": "#000000", "budget": 6, "city": "Manisa", "leagueId": "tff2"},
    {"id": "duzcespor", "name": "Düzcespor", "color": "#FF0000", "budget": 6, "city": "Duzce", "leagueId": "tff2"},
    {"id": "inegol", "name": "İnegölspor", "color": "#800000", "budget": 6, "city": "Bursa", "leagueId": "tff2"},
    {"id": "fethiye", "name": "Fethiyespor", "color": "#000080", "budget": 7, "city": "Mugla", "leagueId": "tff2"},
    {"id": "sariyer", "name": "Sarıyer", "color": "#0000FF", "budget": 8, "city": "Istanbul", "leagueId": "tff2"},
    {"id": "arnavutkoy", "name": "Arnavutköy Bld", "color": "#000080", "budget": 6, "city": "Istanbul", "leagueId": "tff2"},
    {"id": "diyarbekir", "name": "Diyarbekirspor", "color": "#008000", "budget": 7, "city": "Diyarbakir", "leagueId": "tff2"},
    {"id": "serik", "name": "Serik Belediyespor", "color": "#008000", "budget": 6, "city": "Antalya", "leagueId": "tff2"},
    {"id": "afyonspor", "name": "Afyonspor", "color": "#800080", "budget": 6, "city": "Afyon", "leagueId": "tff2"}
];

const tr_firstNames = ["Mert", "Ege", "Kaan", "Cem", "Doğan", "Emir", "Taha", "Uğur", "Tolga", "Oğuz", "Ali", "Caner", "Furkan", "Yunus", "Emre", "Kemal", "Onur", "İbrahim", "Selim", "Koray"];
const tr_lastNames = ["Yılmaz", "Demir", "Çelik", "Şahin", "Koç", "Öztürk", "Arslan", "Kaya", "Polat", "Aydın", "Yıldırım", "Kılıç", "Doğan", "Korkmaz", "Erdoğan", "Çetin", "Bozkurt", "Turan", "Yavuz", "Er"];

function generateTRName() {
    return tr_firstNames[Math.floor(Math.random() * tr_firstNames.length)] + " " + tr_lastNames[Math.floor(Math.random() * tr_lastNames.length)];
}

const roles = ["Kaleci", "Kaleci", "Sağ Bek", "Sol Bek", "Stoper", "Stoper", "Ön Libero", "Merkez Orta Saha", "10 Numara", "Sağ Açık", "Sol Açık", "Santrfor", "Santrfor"];
const traits = ["elite", "aggressive", "fragile", "consistent", "creative"];

const players = [];
let player_id = 50000;

for (let team of tff2Teams) {
    let tid = team.id;
    let t_pow = team.budget + 40; // 2. Lig powers roughly 45-55
    
    // Generate 24 players for each 2. Lig team
    for (let i = 0; i < 24; i++) {
        let pos = roles[i % roles.length];
        players.push({
            "id": player_id++,
            "teamId": tid,
            "name": generateTRName(),
            "age": Math.floor(Math.random() * 14) + 19, // 19 to 32
            "position": pos,
            "power": t_pow + Math.floor(Math.random() * 8) - 4,
            "speed": parseFloat((Math.random() * 1.5 + 2.0).toFixed(1)), // slower
            "mentalTrait": traits[Math.floor(Math.random() * traits.length)],
            "tacticalRole": "classic",
            "contractYears": Math.floor(Math.random() * 3) + 1
        });
    }
}

const js_content = `// TFF 2. LİG VERİTABANI
const tff2Teams = ${JSON.stringify(tff2Teams, null, 4)};
const tff2Players = ${JSON.stringify(players, null, 4)};

if (window.leagueData) {
    window.leagueData.teams.push(...tff2Teams);
    window.leagueData.players.push(...tff2Players);
}
`;

fs.writeFileSync('js/data_tff2.js', js_content, 'utf-8');
console.log('TFF 2. Lig database created successfully!');

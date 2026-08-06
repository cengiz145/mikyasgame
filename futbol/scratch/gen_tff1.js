const fs = require('fs');

// 1. Patch index.html to add TFF 2. Lig button
let htmlContent = fs.readFileSync('index.html', 'utf8');

const tffHtmlOld = `        <div id="tr-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
            <button id="btn-league-superlig" class="menu-button" style="background-color: #27ae60; width: 300px;">Trendyol Süper Lig</button>
            <button id="btn-league-tff1" class="menu-button" style="background-color: #8e44ad; width: 300px;">Trendyol 1. Lig</button>
        </div>`;

const tffHtmlNew = `        <div id="tr-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
            <button id="btn-league-superlig" class="menu-button" style="background-color: #27ae60; width: 300px;">Trendyol Süper Lig</button>
            <button id="btn-league-tff1" class="menu-button" style="background-color: #8e44ad; width: 300px;">Trendyol 1. Lig</button>
            <button id="btn-league-tff2" class="menu-button" style="background-color: #c0392b; width: 300px;">TFF 2. Lig</button>
        </div>`;

if (htmlContent.includes(tffHtmlOld)) {
    htmlContent = htmlContent.replace(tffHtmlOld, tffHtmlNew);
} else if (htmlContent.includes('id="btn-league-tff1"')) {
    if(!htmlContent.includes('id="btn-league-tff2"')) {
        htmlContent = htmlContent.replace(
            '<button id="btn-league-tff1" class="menu-button" style="background-color: #8e44ad; width: 300px;">Trendyol 1. Lig</button>',
            '<button id="btn-league-tff1" class="menu-button" style="background-color: #8e44ad; width: 300px;">Trendyol 1. Lig</button>n            <button id="btn-league-tff2" class="menu-button" style="background-color: #c0392b; width: 300px;">TFF 2. Lig</button>'
        );
    }
}

// Ensure data_tff1.js is included in index.html
if (!htmlContent.includes('<script src="js/data_tff1.js" charset="utf-8"></script>')) {
    htmlContent = htmlContent.replace(
        '<script src="js/data_superlig.js" charset="utf-8"></script>',
        '<script src="js/data_superlig.js" charset="utf-8"></script>n    <script src="js/data_tff1.js" charset="utf-8"></script>'
    );
}

fs.writeFileSync('index.html', htmlContent, 'utf8');
console.log('index.html patched with TFF 2. Lig button and data_tff1.js script tag.');

// 2. Generate data_tff1.js
const tff1Teams = [
    { id: "goztepe", name: "Göztepe", color: "#F1C40F", budget: 15, city: "İzmir", leagueId: "tff1", starLevel: 3 },
    { id: "kocaelispor", name: "Kocaelispor", color: "#27ae60", budget: 12, city: "Kocaeli", leagueId: "tff1", starLevel: 3 },
    { id: "sakaryaspor", name: "Sakaryaspor", color: "#2ecc71", budget: 10, city: "Sakarya", leagueId: "tff1", starLevel: 3 },
    { id: "bodrumspor", name: "Bodrumspor", color: "#2980b9", budget: 10, city: "Muğla", leagueId: "tff1", starLevel: 2 },
    { id: "corum", name: "Çorum FK", color: "#c0392b", budget: 8, city: "Çorum", leagueId: "tff1", starLevel: 2 },
    { id: "bandirma", name: "Bandırmaspor", color: "#8e44ad", budget: 8, city: "Balıkesir", leagueId: "tff1", starLevel: 2 },
    { id: "eyupspor", name: "Eyüpspor", color: "#8e44ad", budget: 20, city: "Istanbul", leagueId: "tff1", starLevel: 4 },
    { id: "genclerbirligi", name: "Gençlerbirliği", color: "#c0392b", budget: 10, city: "Ankara", leagueId: "tff1", starLevel: 3 },
    { id: "boluspor", name: "Boluspor", color: "#e74c3c", budget: 6, city: "Bolu", leagueId: "tff1", starLevel: 2 },
    { id: "sanliurfaspor", name: "Şanlıurfaspor", color: "#f1c40f", budget: 6, city: "Şanlıurfa", leagueId: "tff1", starLevel: 2 },
    { id: "umraniyespor", name: "Ümraniyespor", color: "#e74c3c", budget: 6, city: "Istanbul", leagueId: "tff1", starLevel: 2 },
    { id: "manisa", name: "Manisa FK", color: "#000000", budget: 8, city: "Manisa", leagueId: "tff1", starLevel: 2 },
    { id: "tuzlaspor", name: "Tuzlaspor", color: "#2980b9", budget: 5, city: "Istanbul", leagueId: "tff1", starLevel: 1 },
    { id: "erzurumspor", name: "Erzurumspor", color: "#2980b9", budget: 5, city: "Erzurum", leagueId: "tff1", starLevel: 1 },
    { id: "altay", name: "Altay", color: "#000000", budget: 3, city: "İzmir", leagueId: "tff1", starLevel: 1 },
    { id: "giresunspor", name: "Giresunspor", color: "#27ae60", budget: 3, city: "Giresun", leagueId: "tff1", starLevel: 1 }
];

const trFirstNames = ["Emre", "Burak", "Hakan", "Ali", "Ahmet", "Mehmet", "Can", "Kerem", "Yunus", "Ozan", "Mert", "Barış", "Enes", "Volkan", "Serkan", "Gökhan", "Semih", "Salih", "Umut"];
const trLastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Polat", "Gül", "Köse", "Koç", "Taş", "Aksoy"];

function getRandomName() {
    return trFirstNames[Math.floor(Math.random() * trFirstNames.length)] + " " + trLastNames[Math.floor(Math.random() * trLastNames.length)];
}

const tff1Players = [];
let playerIdCounter = 1;

for (const team of tff1Teams) {
    let basePower = 55 + (team.starLevel * 3); // 4 star = 67, 3 star = 64, 2 star = 61
    
    for (let i = 0; i < 20; i++) {
        let position = "OS";
        if (i < 2) position = "KL";
        else if (i < 8) position = "DF";
        else if (i < 15) position = "OS";
        else position = "FV";

        let power = basePower + (Math.floor(Math.random() * 8) - 4);
        if (power > 80) power = 80;
        
        let value = Math.round(Math.pow(power, 3) / 25000);
        
        tff1Players.push({
            id: `tff1_${team.id}_${playerIdCounter++}`,
            name: getRandomName(),
            teamId: team.id,
            position: position,
            power: power,
            age: Math.floor(Math.random() * 15) + 18,
            value: value,
            wage: Math.round(value * 0.1),
            morale: 80 + Math.floor(Math.random()*20),
            fitness: 90 + Math.floor(Math.random()*10),
            form: 5 + Math.floor(Math.random()*5),
            contractYears: Math.floor(Math.random()*4) + 1
        });
    }
}

const outputTeams = tff1Teams.map(t => {
    return { id: t.id, name: t.name, color: t.color, budget: t.budget, city: t.city, leagueId: t.leagueId };
});

const tff1Content = `// js/data_tff1.js
window.leagueData = window.leagueData || { teams: [], players: [] };
window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'tff1');

const tff1Teams = ${JSON.stringify(outputTeams, null, 4)};
const tff1Players = ${JSON.stringify(tff1Players, null, 4)};

tff1Teams.forEach(t => window.leagueData.teams.push(t));
tff1Players.forEach(p => window.leagueData.players.push(p));
console.log("TFF 1. Lig yüklendi!");
`;

fs.writeFileSync('js/data_tff1.js', tff1Content, 'utf8');
console.log('data_tff1.js generated with ' + tff1Teams.length + ' teams.');


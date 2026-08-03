const fs = require('fs');

// 1. Patch menu.js to add Serie B listener
let menuContent = fs.readFileSync('js/menu.js', 'utf8');
if (!menuContent.includes('selectLeagueFlow("serieb")')) {
    menuContent = menuContent.replace(
        /document.getElementById('btn-league-seriea')?.addEventListener('click', () => selectLeagueFlow("seriea"));/,
        "document.getElementById('btn-league-seriea')?.addEventListener('click', () => selectLeagueFlow("seriea"));n    document.getElementById('btn-league-serieb')?.addEventListener('click', () => selectLeagueFlow("serieb"));"
    );
    fs.writeFileSync('js/menu.js', menuContent, 'utf8');
    console.log('menu.js patched with Serie B listener.');
}

// 2. Patch index.html to add data_serieb.js
let htmlContent = fs.readFileSync('index.html', 'utf8');
if (!htmlContent.includes('<script src="js/data_serieb.js" charset="utf-8"></script>')) {
    htmlContent = htmlContent.replace(
        '<script src="js/data_seriea.js" charset="utf-8"></script>',
        '<script src="js/data_seriea.js" charset="utf-8"></script>n    <script src="js/data_serieb.js" charset="utf-8"></script>'
    );
    fs.writeFileSync('index.html', htmlContent, 'utf8');
    console.log('index.html patched with data_serieb.js script tag.');
}

// 3. Generate data_serieb.js
const serieBTeams = [
    { id: "parma", name: "Parma", color: "#000000", budget: 15, city: "Parma", leagueId: "serieb", starLevel: 3 },
    { id: "venezia", name: "Venezia", color: "#f39c12", budget: 12, city: "Venice", leagueId: "serieb", starLevel: 3 },
    { id: "cremonese", name: "Cremonese", color: "#e74c3c", budget: 10, city: "Cremona", leagueId: "serieb", starLevel: 3 },
    { id: "como", name: "Como", color: "#2980b9", budget: 20, city: "Como", leagueId: "serieb", starLevel: 3 },
    { id: "palermo", name: "Palermo", color: "#e84393", budget: 15, city: "Palermo", leagueId: "serieb", starLevel: 3 },
    { id: "sampdoria", name: "Sampdoria", color: "#2980b9", budget: 10, city: "Genoa", leagueId: "serieb", starLevel: 3 },
    { id: "catanzaro", name: "Catanzaro", color: "#f1c40f", budget: 8, city: "Catanzaro", leagueId: "serieb", starLevel: 2 },
    { id: "brescia", name: "Brescia", color: "#2980b9", budget: 8, city: "Brescia", leagueId: "serieb", starLevel: 2 },
    { id: "suedtirol", name: "Südtirol", color: "#e74c3c", budget: 5, city: "Bolzano", leagueId: "serieb", starLevel: 2 },
    { id: "cittadella", name: "Cittadella", color: "#8e44ad", budget: 5, city: "Cittadella", leagueId: "serieb", starLevel: 2 },
    { id: "pisa", name: "Pisa", color: "#000000", budget: 6, city: "Pisa", leagueId: "serieb", starLevel: 2 },
    { id: "reggiana", name: "Reggiana", color: "#8e44ad", budget: 4, city: "Reggio Emilia", leagueId: "serieb", starLevel: 1 },
    { id: "modena", name: "Modena", color: "#f1c40f", budget: 5, city: "Modena", leagueId: "serieb", starLevel: 1 },
    { id: "bari", name: "Bari", color: "#e74c3c", budget: 8, city: "Bari", leagueId: "serieb", starLevel: 2 },
    { id: "spezia", name: "Spezia", color: "#000000", budget: 7, city: "La Spezia", leagueId: "serieb", starLevel: 2 },
    { id: "ternana", name: "Ternana", color: "#2ecc71", budget: 4, city: "Terni", leagueId: "serieb", starLevel: 1 },
    { id: "ascoli", name: "Ascoli", color: "#000000", budget: 3, city: "Ascoli Piceno", leagueId: "serieb", starLevel: 1 },
    { id: "feralpisalo", name: "Feralpisalò", color: "#27ae60", budget: 2, city: "Salò", leagueId: "serieb", starLevel: 1 },
    { id: "lecco", name: "Lecco", color: "#3498db", budget: 2, city: "Lecco", leagueId: "serieb", starLevel: 1 }
];

const itFirstNames = ["Leonardo", "Francesco", "Alessandro", "Lorenzo", "Mattia", "Andrea", "Gabriele", "Riccardo", "Tommaso", "Edoardo", "Giuseppe", "Antonio", "Giovanni", "Marco", "Luca"];
const itLastNames = ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano"];

function getRandomName() {
    return itFirstNames[Math.floor(Math.random() * itFirstNames.length)] + " " + itLastNames[Math.floor(Math.random() * itLastNames.length)];
}

const serieBPlayers = [];
let playerIdCounter = 1;

for (const team of serieBTeams) {
    let basePower = 55 + (team.starLevel * 3); 
    for (let i = 0; i < 20; i++) {
        let position = "OS";
        if (i < 2) position = "KL";
        else if (i < 8) position = "DF";
        else if (i < 15) position = "OS";
        else position = "FV";

        let power = basePower + (Math.floor(Math.random() * 8) - 4);
        if (power > 80) power = 80;
        let value = Math.round(Math.pow(power, 3) / 25000);
        
        serieBPlayers.push({
            id: `serieb_${team.id}_${playerIdCounter++}`,
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

const outputTeams = serieBTeams.map(t => {
    return { id: t.id, name: t.name, color: t.color, budget: t.budget, city: t.city, leagueId: t.leagueId };
});

const serieBContent = `// js/data_serieb.js
window.leagueData = window.leagueData || { teams: [], players: [] };
window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'serieb');

const serieBTeams = ${JSON.stringify(outputTeams, null, 4)};
const serieBPlayers = ${JSON.stringify(serieBPlayers, null, 4)};

serieBTeams.forEach(t => window.leagueData.teams.push(t));
serieBPlayers.forEach(p => window.leagueData.players.push(p));
console.log("Serie B yüklendi!");
`;

fs.writeFileSync('js/data_serieb.js', serieBContent, 'utf8');
console.log('data_serieb.js generated with ' + serieBTeams.length + ' teams.');


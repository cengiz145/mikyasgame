const fs = require('fs');

const allTeams = [
    { id: "galatasaray", name: "Galatasaray", color: "#A90432", budget: 75, city: "Istanbul", leagueId: "superlig", starLevel: 5 },
    { id: "fenerbahce", name: "Fenerbahçe", color: "#000080", budget: 75, city: "Istanbul", leagueId: "superlig", starLevel: 5 },
    { id: "besiktas", name: "Beşiktaş", color: "#000000", budget: 60, city: "Istanbul", leagueId: "superlig", starLevel: 5 },
    { id: "trabzonspor", name: "Trabzonspor", color: "#800000", budget: 50, city: "Trabzon", leagueId: "superlig", starLevel: 4 },
    { id: "basaksehir", name: "Başakşehir", color: "#F39C12", budget: 35, city: "Istanbul", leagueId: "superlig", starLevel: 4 },
    { id: "adana", name: "Adana Demirspor", color: "#2980b9", budget: 30, city: "Adana", leagueId: "superlig", starLevel: 4 },
    { id: "konyaspor", name: "Konyaspor", color: "#27ae60", budget: 25, city: "Konya", leagueId: "superlig", starLevel: 3 },
    { id: "kayserispor", name: "Kayserispor", color: "#e74c3c", budget: 20, city: "Kayseri", leagueId: "superlig", starLevel: 3 },
    { id: "sivasspor", name: "Sivasspor", color: "#c0392b", budget: 20, city: "Sivas", leagueId: "superlig", starLevel: 3 },
    { id: "kasimpasa", name: "Kasımpaşa", color: "#2980b9", budget: 18, city: "Istanbul", leagueId: "superlig", starLevel: 3 },
    { id: "ankaragucu", name: "Ankaragücü", color: "#f1c40f", budget: 18, city: "Ankara", leagueId: "superlig", starLevel: 3 },
    { id: "antalyaspor", name: "Antalyaspor", color: "#e74c3c", budget: 22, city: "Antalya", leagueId: "superlig", starLevel: 3 },
    { id: "gaziantep", name: "Gaziantep FK", color: "#c0392b", budget: 15, city: "Gaziantep", leagueId: "superlig", starLevel: 2 },
    { id: "hatayspor", name: "Hatayspor", color: "#8e44ad", budget: 15, city: "Hatay", leagueId: "superlig", starLevel: 2 },
    { id: "pendikspor", name: "Pendikspor", color: "#e74c3c", budget: 12, city: "Istanbul", leagueId: "superlig", starLevel: 2 },
    { id: "rize", name: "Çaykur Rizespor", color: "#27ae60", budget: 18, city: "Rize", leagueId: "superlig", starLevel: 2 },
    { id: "karagumruk", name: "Fatih Karagümrük", color: "#c0392b", budget: 15, city: "Istanbul", leagueId: "superlig", starLevel: 2 },
    { id: "samsunspor", name: "Samsunspor", color: "#e74c3c", budget: 20, city: "Samsun", leagueId: "superlig", starLevel: 2 },
    { id: "alanya", name: "Alanyaspor", color: "#f39c12", budget: 18, city: "Antalya", leagueId: "superlig", starLevel: 2 }
];

const firstNames = ["Ali", "Ahmet", "Mehmet", "Can", "Kerem", "Yunus", "Emre", "Arda", "Ozan", "Hakan", "Burak", "Cengiz", "Çağlar", "Mert", "Uğurcan", "Ferdi", "İsmail", "Barış", "Enes", "Volkan"];
const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Polat", "Gül", "Köse", "Koç", "Taş", "Aksoy"];
const foreignFirst = ["Mauro", "Dusan", "Edin", "Fred", "Hakim", "Wilfried", "Sebastian", "Dominik", "Vincent", "Dries"];
const foreignLast = ["Icardi", "Tadic", "Dzeko", "Ziyech", "Zaha", "Szymanski", "Livakovic", "Aboubakar", "Mertens", "Torreira"];

function getRandomName(isForeign = false) {
    if (isForeign) {
        return foreignFirst[Math.floor(Math.random() * foreignFirst.length)] + " " + foreignLast[Math.floor(Math.random() * foreignLast.length)];
    }
    return firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
}

const trPlayers = [];
let playerIdCounter = 1;

for (const team of allTeams) {
    let basePower = 60 + (team.starLevel * 5); // 5 star = 85, 4 star = 80, 3 star = 75, 2 star = 70
    
    // Generate 20 players per team
    for (let i = 0; i < 20; i++) {
        let isForeign = Math.random() > 0.6;
        let position = "OS";
        if (i < 2) position = "KL";
        else if (i < 8) position = "DF";
        else if (i < 15) position = "OS";
        else position = "FV";

        let age = Math.floor(Math.random() * 15) + 18; // 18-32
        
        let powerVar = Math.floor(Math.random() * 10) - 5; // -5 to +5
        let power = basePower + powerVar;
        if (power > 99) power = 99;
        
        // Ensure some stars for big teams
        if (team.starLevel === 5 && i === 18) {
            power = 88 + Math.floor(Math.random() * 5);
            isForeign = true;
            position = "FV";
        }
        
        let value = Math.round(Math.pow(power, 3) / 20000); // Rough value scaling
        
        trPlayers.push({
            id: `tr_${playerIdCounter++}`,
            name: getRandomName(isForeign),
            teamId: team.id,
            position: position,
            power: power,
            age: age,
            value: value,
            wage: Math.round(value * 0.1),
            morale: 80 + Math.floor(Math.random()*20),
            fitness: 90 + Math.floor(Math.random()*10),
            form: 5 + Math.floor(Math.random()*5),
            contractYears: Math.floor(Math.random()*4) + 1
        });
    }
}

// Remove starLevel from teams before output
const outputTeams = allTeams.map(t => {
    return { id: t.id, name: t.name, color: t.color, budget: t.budget, city: t.city, leagueId: t.leagueId };
});

const fileContent = `// js/data_superlig.js
// GERCEK 2026/2027 SUPER LIG VERILERI (Tamamı Eklendi)
window.leagueData = window.leagueData || { teams: [], players: [] };
window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'superlig');

const trTeams = ${JSON.stringify(outputTeams, null, 4)};

const trPlayers = ${JSON.stringify(trPlayers, null, 4)};

window.leagueData.teams.push(...trTeams);
window.leagueData.players.push(...trPlayers);
console.log("Super Lig Takımları Yüklendi!");
`;

fs.writeFileSync('js/data_superlig.js', fileContent, 'utf8');
console.log("data_superlig.js generated successfully with " + allTeams.length + " teams and " + trPlayers.length + " players.");


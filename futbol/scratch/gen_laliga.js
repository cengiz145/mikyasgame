const fs = require('fs');

const missingTeams = [
    { "id": "valencia", "name": "Valencia CF", "color": "#FFFFFF", "budget": 20, "leagueId": "laliga", "starLevel": 3 },
    { "id": "girona", "name": "Girona FC", "color": "#ED1C24", "budget": 25, "leagueId": "laliga", "starLevel": 3 },
    { "id": "getafe", "name": "Getafe CF", "color": "#005BAA", "budget": 15, "leagueId": "laliga", "starLevel": 2 },
    { "id": "celta_vigo", "name": "Celta Vigo", "color": "#81C4FF", "budget": 18, "leagueId": "laliga", "starLevel": 3 },
    { "id": "osasuna", "name": "CA Osasuna", "color": "#D11031", "budget": 15, "leagueId": "laliga", "starLevel": 3 },
    { "id": "mallorca", "name": "RCD Mallorca", "color": "#D11031", "budget": 15, "leagueId": "laliga", "starLevel": 2 },
    { "id": "alaves", "name": "Deportivo Alavés", "color": "#005BAA", "budget": 12, "leagueId": "laliga", "starLevel": 2 },
    { "id": "rayo_vallecano", "name": "Rayo Vallecano", "color": "#FFFFFF", "budget": 12, "leagueId": "laliga", "starLevel": 2 },
    { "id": "las_palmas", "name": "UD Las Palmas", "color": "#FCE300", "budget": 12, "leagueId": "laliga", "starLevel": 2 },
    { "id": "cadiz", "name": "Cádiz CF", "color": "#FCE300", "budget": 10, "leagueId": "laliga", "starLevel": 1 },
    { "id": "almeria", "name": "UD Almería", "color": "#ED1C24", "budget": 10, "leagueId": "laliga", "starLevel": 1 },
    { "id": "granada", "name": "Granada CF", "color": "#D11031", "budget": 10, "leagueId": "laliga", "starLevel": 1 }
];

const spanishFirstNames = ["Jose", "Antonio", "Juan", "Carlos", "Manuel", "Pedro", "Jesus", "Alejandro", "Miguel", "Javier", "David", "Daniel", "Pablo", "Sergio", "Fernando", "Jorge", "Luis", "Alberto", "Diego", "Alvaro"];
const spanishLastNames = ["Garcia", "Fernandez", "Gonzalez", "Rodriguez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Jimenez", "Ruiz", "Hernandez", "Diaz", "Moreno", "Alvarez", "Munoz", "Romero", "Alonso", "Gutierrez"];

function getRandomSpanishName() {
    return spanishFirstNames[Math.floor(Math.random() * spanishFirstNames.length)] + " " + spanishLastNames[Math.floor(Math.random() * spanishLastNames.length)];
}

const newPlayers = [];
let playerIdCounter = 1;

for (const team of missingTeams) {
    let basePower = 60 + (team.starLevel * 5); // 3 star = 75, 2 star = 70, 1 star = 65
    
    for (let i = 0; i < 20; i++) {
        let position = "OS";
        if (i < 2) position = "KL";
        else if (i < 8) position = "DF";
        else if (i < 15) position = "OS";
        else position = "FV";

        let age = Math.floor(Math.random() * 15) + 18;
        let powerVar = Math.floor(Math.random() * 10) - 5;
        let power = basePower + powerVar;
        if (power > 99) power = 99;
        
        let value = Math.round(Math.pow(power, 3) / 20000);
        
        newPlayers.push({
            id: `laliga_missing_${team.id}_${playerIdCounter++}`,
            name: getRandomSpanishName(),
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

// Convert missing teams to output format
const outputTeams = missingTeams.map(t => {
    return { id: t.id, name: t.name, color: t.color, budget: t.budget, leagueId: t.leagueId };
});

const appendContent = `
// --- OTOMATİK EKLENEN EKSİK LA LIGA TAKIMLARI ---
const missingLaligaTeams = ${JSON.stringify(outputTeams, null, 4)};
const missingLaligaPlayers = ${JSON.stringify(newPlayers, null, 4)};

missingLaligaTeams.forEach(t => window.leagueData.teams.push(t));
missingLaligaPlayers.forEach(p => window.leagueData.players.push(p));
console.log("Missing La Liga teams and players appended!");
`;

fs.appendFileSync('js/data_laliga.js', appendContent, 'utf8');
console.log("data_laliga.js appended successfully with " + missingTeams.length + " teams and " + newPlayers.length + " players.");


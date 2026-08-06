const fs = require('fs');

const brazilTeams = [
    { id: "flamengo", name: "Flamengo", budget: 60, leagueId: "brezilya" },
    { id: "palmeiras", name: "Palmeiras", budget: 55, leagueId: "brezilya" },
    { id: "sao_paulo", name: "São Paulo", budget: 45, leagueId: "brezilya" },
    { id: "santos", name: "Santos FC", budget: 35, leagueId: "brezilya" },
    { id: "corinthians", name: "Corinthians", budget: 40, leagueId: "brezilya" },
    { id: "fluminense", name: "Fluminense", budget: 45, leagueId: "brezilya" },
    { id: "botafogo", name: "Botafogo", budget: 50, leagueId: "brezilya" },
    { id: "vasco_da_gama", name: "Vasco da Gama", budget: 30, leagueId: "brezilya" },
    { id: "cruzeiro", name: "Cruzeiro", budget: 35, leagueId: "brezilya" },
    { id: "gremio", name: "Gremio", budget: 40, leagueId: "brezilya" },
    { id: "internacional", name: "Internacional", budget: 40, leagueId: "brezilya" },
    { id: "atletico_mineiro", name: "Atletico Mineiro", budget: 45, leagueId: "brezilya" },
    { id: "athletico_pr", name: "Athletico Paranaense", budget: 35, leagueId: "brezilya" },
    { id: "bahia", name: "EC Bahia", budget: 30, leagueId: "brezilya" },
    { id: "fortaleza", name: "Fortaleza EC", budget: 25, leagueId: "brezilya" },
    { id: "bragantino", name: "Red Bull Bragantino", budget: 40, leagueId: "brezilya" },
    { id: "cuiaba", name: "Cuiaba", budget: 15, leagueId: "brezilya" },
    { id: "goias", name: "Goias", budget: 15, leagueId: "brezilya" },
    { id: "coritiba", name: "Coritiba", budget: 20, leagueId: "brezilya" },
    { id: "vitoria", name: "Vitoria", budget: 15, leagueId: "brezilya" }
];

const firstNames = [
    "Joao", "Pedro", "Gabriel", "Lucas", "Matheus", "Guilherme", "Rafael", "Felipe", "Thiago", "Vitor",
    "Vinicius", "Marcos", "Arthur", "Bruno", "Eduardo", "Leonardo", "Igor", "Caio", "Henrique", "Samuel",
    "Douglas", "Rodrigo", "Fernando", "Marcelo", "Diego", "Ricardo", "Carlos", "Renato", "Everton", "Anderson"
];

const lastNames = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
    "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
    "Rocha", "Dias", "Mendes", "Nunes", "Machado", "Freitas", "Melo", "Borges", "Moura", "Cardoso"
];

const positions = [
    "Kaleci", "Kaleci",
    "Stoper", "Stoper", "Stoper", "Stoper", "Sağ Bek", "Sağ Bek", "Sol Bek", "Sol Bek",
    "Ön Libero", "Ön Libero", "Merkez Orta Saha", "Merkez Orta Saha", "Orta Saha", "Orta Saha", "Forvet Arkası", "Forvet Arkası",
    "Sağ Kanat", "Sol Kanat", "Sağ Kanat", "Sol Kanat",
    "Forvet", "Forvet", "Forvet"
];

const roles = [
    "classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", 
    "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"
];

const mentalTraits = ["elite", "aggressive", "fragile", "classic"];

const players = [];

brazilTeams.forEach(team => {
    let powerBase = 65;
    if (team.budget >= 50) powerBase = 72;
    else if (team.budget >= 35) powerBase = 68;
    
    // Generate 22 players per team
    for (let i = 0; i < 22; i++) {
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        
        let power = powerBase + Math.floor(Math.random() * 10) - 5; 
        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 18) + 17; // 17-34 arası
        const contractYears = Math.floor(Math.random() * 4) + 1;
        
        const id = `${fName.toLowerCase()}_${lName.toLowerCase()}_${team.id}_${i}`.replace(/[^a-z0-9_]/g, '');

        players.push({
            id: id,
            name: `${fName} ${lName}`,
            position: pos,
            power: power,
            speed: speed,
            age: age,
            teamId: team.id,
            tacticalRole: role,
            mentalTrait: mental,
            contractYears: contractYears,
            isListed: false
        });
    }
});

let fileContent = `// js/data_brazil.js\n// Brezilya Serie A Lig Verileri\n\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n\n`;

fileContent += `const brazilTeams = ${JSON.stringify(brazilTeams, null, 4)};\n`;
fileContent += `brazilTeams.forEach(t => window.leagueData.teams.push(t));\n\n`;

fileContent += `const brazilPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `brazilPlayers.forEach(p => window.leagueData.players.push(p));\n`;

fs.writeFileSync('js/data_brazil.js', fileContent, 'utf-8');
console.log('Brezilya takim ve oyunculari uretildi!');

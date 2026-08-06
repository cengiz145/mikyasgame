const fs = require('fs');

const portekizTeams = [
    { id: "braga", name: "SC Braga", budget: 45, leagueId: "portekiz" },
    { id: "vitoria_guimaraes", name: "Vitória de Guimarães", budget: 30, leagueId: "portekiz" },
    { id: "moreirense", name: "Moreirense", budget: 15, leagueId: "portekiz" },
    { id: "arouca", name: "Arouca", budget: 14, leagueId: "portekiz" },
    { id: "famalicao", name: "Famalicao", budget: 18, leagueId: "portekiz" },
    { id: "casa_pia", name: "Casa Pia", budget: 12, leagueId: "portekiz" },
    { id: "farense", name: "Farense", budget: 10, leagueId: "portekiz" },
    { id: "rio_ave", name: "Rio Ave", budget: 15, leagueId: "portekiz" },
    { id: "gil_vicente", name: "Gil Vicente", budget: 14, leagueId: "portekiz" },
    { id: "estoril", name: "Estoril Praia", budget: 13, leagueId: "portekiz" },
    { id: "estrela_amadora", name: "Estrela da Amadora", budget: 10, leagueId: "portekiz" },
    { id: "boavista", name: "Boavista", budget: 16, leagueId: "portekiz" },
    { id: "portimonense", name: "Portimonense", budget: 12, leagueId: "portekiz" },
    { id: "vizela", name: "FC Vizela", budget: 11, leagueId: "portekiz" },
    { id: "chaves", name: "GD Chaves", budget: 10, leagueId: "portekiz" }
];

const firstNames = [
    "Joao", "Pedro", "Tiago", "Rui", "Diogo", "Bruno", "Miguel", "Nuno", "Goncalo", "Andre",
    "Ricardo", "Vitor", "Luis", "Filipe", "Carlos", "Jose", "Manuel", "Paulo", "Ruben", "Bernardo",
    "Joaquim", "Antonio", "Francisco", "Tomas", "Martim", "Afonso", "Rodrigo", "Duarte", "Henrique"
];

const lastNames = [
    "Silva", "Santos", "Oliveira", "Costa", "Fernandes", "Pereira", "Martins", "Gomes", "Lopes", "Carvalho",
    "Ribeiro", "Soares", "Pinto", "Almeida", "Rodrigues", "Sousa", "Teixeira", "Mendes", "Neves", "Machado",
    "Monteiro", "Cardoso", "Barbosa", "Reis", "Pires", "Vieira", "Ferreira", "Tavares", "Correia", "Guerreiro"
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

portekizTeams.forEach(team => {
    let powerBase = 62;
    if (team.id === "braga") powerBase = 72;
    else if (team.budget > 15) powerBase = 68;
    
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

let fileContent = `// js/data_portekiz.js\n// Portekiz Primeira Liga Lig Verileri\n\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n\n`;

fileContent += `const portekizTeams = ${JSON.stringify(portekizTeams, null, 4)};\n`;
fileContent += `portekizTeams.forEach(t => window.leagueData.teams.push(t));\n\n`;

fileContent += `const portekizPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `portekizPlayers.forEach(p => window.leagueData.players.push(p));\n`;

fs.writeFileSync('js/data_portekiz.js', fileContent, 'utf-8');
console.log('Portekiz takim ve oyunculari uretildi!');

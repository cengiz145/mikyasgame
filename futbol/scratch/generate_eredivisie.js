const fs = require('fs');

const eredivisieTeams = [
    { id: "az_alkmaar", name: "AZ Alkmaar", budget: 45, leagueId: "hollanda" },
    { id: "fc_twente", name: "FC Twente", budget: 40, leagueId: "hollanda" },
    { id: "sparta_rotterdam", name: "Sparta Rotterdam", budget: 25, leagueId: "hollanda" },
    { id: "fc_utrecht", name: "FC Utrecht", budget: 30, leagueId: "hollanda" },
    { id: "sc_heerenveen", name: "sc Heerenveen", budget: 28, leagueId: "hollanda" },
    { id: "nec_nijmegen", name: "NEC Nijmegen", budget: 25, leagueId: "hollanda" },
    { id: "go_ahead_eagles", name: "Go Ahead Eagles", budget: 20, leagueId: "hollanda" },
    { id: "pec_zwolle", name: "PEC Zwolle", budget: 18, leagueId: "hollanda" },
    { id: "almere_city", name: "Almere City FC", budget: 15, leagueId: "hollanda" },
    { id: "fortuna_sittard", name: "Fortuna Sittard", budget: 18, leagueId: "hollanda" },
    { id: "heracles_almelo", name: "Heracles Almelo", budget: 16, leagueId: "hollanda" },
    { id: "rkc_waalwijk", name: "RKC Waalwijk", budget: 15, leagueId: "hollanda" },
    { id: "excelsior", name: "Excelsior", budget: 12, leagueId: "hollanda" },
    { id: "willem_ii", name: "Willem II", budget: 18, leagueId: "hollanda" },
    { id: "nac_breda", name: "NAC Breda", budget: 15, leagueId: "hollanda" }
];

const firstNames = [
    "Jan", "Pieter", "Willem", "Johannes", "Hendrik", "Cornelis", "Dirk", "Albert", "Nicolaas", "Sander",
    "Jeroen", "Lars", "Bram", "Thijs", "Ruben", "Jesse", "Tim", "Luuk", "Milan", "Finn",
    "Sem", "Noah", "Levi", "Lucas", "Daan", "Sven", "Mats", "Niels", "Gijs", "Bas"
];

const lastNames = [
    "de Jong", "Jansen", "de Vries", "van den Berg", "van Dijk", "Bakker", "Janssen", "Visser", "Smit", "Meijer",
    "de Boer", "Mulder", "de Groot", "Bos", "Vos", "Peters", "Hendriks", "van Leeuwen", "Dekker", "Brouwer",
    "de Wit", "Dijkstra", "Smits", "de Graaf", "van der Meer", "van der Linden", "Kok", "Jacobs", "de Haan"
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

eredivisieTeams.forEach(team => {
    let powerBase = 65;
    if (team.id === "az_alkmaar" || team.id === "fc_twente") powerBase = 74;
    else if (team.budget > 25) powerBase = 70;
    
    // Generate 22 players per team
    for (let i = 0; i < 22; i++) {
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        
        let power = powerBase + Math.floor(Math.random() * 10) - 5; 
        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 16) + 18; 
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

let fileContent = `// js/data_eredivisie.js\n// Hollanda Eredivisie Lig Verileri\n\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n\n`;

fileContent += `const eredivisieTeams = ${JSON.stringify(eredivisieTeams, null, 4)};\n`;
fileContent += `eredivisieTeams.forEach(t => window.leagueData.teams.push(t));\n\n`;

fileContent += `const eredivisiePlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `eredivisiePlayers.forEach(p => window.leagueData.players.push(p));\n`;

fs.writeFileSync('js/data_eredivisie.js', fileContent, 'utf-8');
console.log('Eredivisie takim ve oyunculari uretildi!');

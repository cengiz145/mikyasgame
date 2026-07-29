const fs = require('fs');

const teams = [
    { id: "mancity", name: "Manchester City", budget: 95, leagueId: "premier", players: ["Ederson", "Ruben Dias", "John Stones", "Josko Gvardiol", "Kyle Walker", "Rodri", "Kevin De Bruyne", "Phil Foden", "Bernardo Silva", "Erling Haaland", "Jeremy Doku", "Nathan Ake", "Manuel Akanji", "Mateo Kovacic", "Jack Grealish", "Savio", "Oscar Bobb"] },
    { id: "liverpool", name: "Liverpool", budget: 85, leagueId: "premier", players: ["Alisson", "Virgil van Dijk", "Ibrahima Konate", "Trent Alexander-Arnold", "Andy Robertson", "Alexis Mac Allister", "Ryan Gravenberch", "Dominik Szoboszlai", "Mohamed Salah", "Luis Diaz", "Diogo Jota", "Darwin Nunez", "Cody Gakpo", "Harvey Elliott", "Federico Chiesa", "Conor Bradley"] },
    { id: "arsenal", name: "Arsenal", budget: 85, leagueId: "premier", players: ["David Raya", "William Saliba", "Gabriel Magalhaes", "Ben White", "Riccardo Calafiori", "Declan Rice", "Martin Odegaard", "Mikel Merino", "Bukayo Saka", "Gabriel Martinelli", "Kai Havertz", "Jurrien Timber", "Thomas Partey", "Raheem Sterling", "Gabriel Jesus"] },
    { id: "chelsea", name: "Chelsea", budget: 90, leagueId: "premier", players: ["Robert Sanchez", "Levi Colwill", "Wesley Fofana", "Malo Gusto", "Marc Cucurella", "Moises Caicedo", "Enzo Fernandez", "Cole Palmer", "Christopher Nkunku", "Noni Madueke", "Nicolas Jackson", "Jadon Sancho", "Pedro Neto", "Joao Felix", "Romeo Lavia", "Reece James"] },
    { id: "manutd", name: "Manchester United", budget: 85, leagueId: "premier", players: ["Andre Onana", "Lisandro Martinez", "Matthijs de Ligt", "Diogo Dalot", "Noussair Mazraoui", "Kobbie Mainoo", "Manuel Ugarte", "Bruno Fernandes", "Alejandro Garnacho", "Marcus Rashford", "Rasmus Hojlund", "Joshua Zirkzee", "Amad Diallo", "Leny Yoro", "Casemiro", "Harry Maguire"] },
    { id: "tottenham", name: "Tottenham Hotspur", budget: 80, leagueId: "premier", players: ["Guglielmo Vicario", "Cristian Romero", "Micky van de Ven", "Pedro Porro", "Destiny Udogie", "Yves Bissouma", "Pape Matar Sarr", "James Maddison", "Dejan Kulusevski", "Son Heung-min", "Dominic Solanke", "Brennan Johnson", "Richarlison", "Radu Dragusin", "Lucas Bergvall"] },
    { id: "newcastle", name: "Newcastle United", budget: 80, leagueId: "premier", players: ["Nick Pope", "Sven Botman", "Fabian Schar", "Kieran Trippier", "Lewis Hall", "Bruno Guimaraes", "Sandro Tonali", "Joelinton", "Anthony Gordon", "Alexander Isak", "Harvey Barnes", "Jacob Murphy", "Joe Willock", "Lloyd Kelly", "Callum Wilson"] },
    { id: "astonvilla", name: "Aston Villa", budget: 75, leagueId: "premier", players: ["Emiliano Martinez", "Pau Torres", "Ezri Konsa", "Matty Cash", "Lucas Digne", "Amadou Onana", "Youri Tielemans", "John McGinn", "Leon Bailey", "Ollie Watkins", "Jhon Duran", "Morgan Rogers", "Ian Maatsen", "Ross Barkley", "Diego Carlos"] }
];

const positions = ["Kaleci", "Stoper", "Stoper", "Sağ Bek", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Forvet Arkası", "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet", "Orta Saha", "Stoper", "Sol Bek", "Ön Libero", "Sağ Kanat"];
const roles = ["classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"];
const mentalTraits = ["elite", "aggressive", "fragile", "classic"];
const players = [];

teams.forEach(team => {
    let powerBase = 80;
    if (team.budget >= 90) powerBase = 86;
    else if (team.budget >= 80) powerBase = 82;
    
    team.players.forEach((playerName, i) => {
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        let power = powerBase + Math.floor(Math.random() * 8) - 4; 
        
        if (["Erling Haaland", "Kevin De Bruyne", "Rodri", "Mohamed Salah", "Virgil van Dijk", "Bukayo Saka", "Martin Odegaard", "Cole Palmer", "Son Heung-min"].includes(playerName)) {
            power += 6;
        }

        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 14) + 19; 
        const contractYears = Math.floor(Math.random() * 4) + 1;
        const id = playerName.toLowerCase().replace(/[^a-z0-9]/g, '') + "_" + team.id;

        players.push({ id, name: playerName, position: pos, power, speed, age, teamId: team.id, tacticalRole: role, mentalTrait: mental, contractYears, isListed: false });
    });
    delete team.players;
});

let fileContent = `// js/data_premier.js\n// GERCEK 2026/2027 PREMIER LIG VERILERI\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n`;
fileContent += `window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'premier');\n`;
fileContent += `const premierTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `premierTeams.forEach(t => window.leagueData.teams.push(t));\n`;
fileContent += `window.leagueData.players = window.leagueData.players.filter(p => !premierTeams.some(t => t.id === p.teamId));\n`;
fileContent += `const premierPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `premierPlayers.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_premier.js', fileContent, 'utf-8');
console.log('Gercek Premier Lig uretildi!');

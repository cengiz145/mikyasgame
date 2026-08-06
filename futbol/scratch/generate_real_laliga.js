const fs = require('fs');

const teams = [
    { id: "real_madrid", name: "Real Madrid", budget: 100, leagueId: "laliga", players: ["Thibaut Courtois", "Eder Militao", "Antonio Rudiger", "Dani Carvajal", "Ferland Mendy", "Aurelien Tchouameni", "Jude Bellingham", "Federico Valverde", "Eduardo Camavinga", "Vinicius Junior", "Kylian Mbappe", "Rodrygo", "Endrick", "Arda Guler", "Brahim Diaz", "Luka Modric", "Andriy Lunin"] },
    { id: "barcelona", name: "FC Barcelona", budget: 85, leagueId: "laliga", players: ["Marc-Andre ter Stegen", "Ronald Araujo", "Pau Cubarsi", "Jules Kounde", "Alejandro Balde", "Frenkie de Jong", "Pedri", "Gavi", "Lamine Yamal", "Raphinha", "Robert Lewandowski", "Dani Olmo", "Fermin Lopez", "Andreas Christensen", "Marc Casado", "Inigo Martinez"] },
    { id: "atletico_madrid", name: "Atletico Madrid", budget: 80, leagueId: "laliga", players: ["Jan Oblak", "Jose Maria Gimenez", "Robin Le Normand", "Marcos Llorente", "Samuel Lino", "Koke", "Rodrigo De Paul", "Conor Gallagher", "Antoine Griezmann", "Julian Alvarez", "Alexander Sorloth", "Nahuel Molina", "Axel Witsel", "Rodrigo Riquelme", "Pablo Barrios"] },
    { id: "athletic_bilbao", name: "Athletic Bilbao", budget: 70, leagueId: "laliga", players: ["Unai Simon", "Daniel Vivian", "Yeray Alvarez", "Oscar de Marcos", "Yuri Berchiche", "Benat Prados", "Oihan Sancet", "Nico Williams", "Inaki Williams", "Gorka Guruzeta", "Alex Berenguer", "Mikel Vesga", "Aitor Paredes", "Julen Agirrezabala", "Alvaro Djalo"] },
    { id: "real_sociedad", name: "Real Sociedad", budget: 70, leagueId: "laliga", players: ["Alex Remiro", "Igor Zubeldia", "Jon Pacheco", "Hamari Traore", "Javi Lopez", "Martin Zubimendi", "Brais Mendez", "Mikel Oyarzabal", "Takefusa Kubo", "Sheraldo Becker", "Ander Barrenetxea", "Luka Sucic", "Sergio Gomez", "Arsen Zakharyan", "Umar Sadiq"] },
    { id: "villarreal", name: "Villarreal CF", budget: 65, leagueId: "laliga", players: ["Diego Conde", "Eric Bailly", "Raul Albiol", "Kiko Femenia", "Sergi Cardona", "Dani Parejo", "Santi Comesana", "Alex Baena", "Yeremy Pino", "Gerard Moreno", "Ayoze Perez", "Nicolas Pepe", "Juan Foyth", "Thierno Barry", "Ilias Akhomach"] },
    { id: "betis", name: "Real Betis", budget: 65, leagueId: "laliga", players: ["Rui Silva", "Marc Bartra", "Diego Llorente", "Hector Bellerin", "Ricardo Rodriguez", "Johnny Cardoso", "Marc Roca", "Isco", "Nabil Fekir", "Pablo Fornals", "Abde Ezzalzouli", "Vitor Roque", "William Carvalho", "Giovani Lo Celso", "Chimy Avila"] },
    { id: "sevilla", name: "Sevilla FC", budget: 60, leagueId: "laliga", players: ["Orjan Nyland", "Loic Bade", "Nemanja Gudelj", "Jesus Navas", "Adria Pedrosa", "Djibril Sow", "Albert Sambi Lokonga", "Saul Niguez", "Lucas Ocampos", "Isaac Romero", "Kelechi Iheanacho", "Dodi Lukebakio", "Suso", "Kike Salas", "Chidera Ejuke"] }
];

const positions = ["Kaleci", "Stoper", "Stoper", "Sağ Bek", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Forvet Arkası", "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet", "Orta Saha", "Stoper", "Sol Bek", "Ön Libero", "Sağ Kanat"];
const roles = ["classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"];
const mentalTraits = ["elite", "aggressive", "fragile", "classic"];
const players = [];

teams.forEach(team => {
    let powerBase = 80;
    if (team.budget >= 90) powerBase = 88;
    else if (team.budget >= 80) powerBase = 82;
    
    team.players.forEach((playerName, i) => {
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        let power = powerBase + Math.floor(Math.random() * 8) - 4; 
        
        if (["Vinicius Junior", "Kylian Mbappe", "Jude Bellingham", "Lamine Yamal", "Robert Lewandowski", "Pedri", "Antoine Griezmann"].includes(playerName)) {
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

let fileContent = `// js/data_laliga.js\n// GERCEK 2026/2027 LA LIGA VERILERI\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n`;
fileContent += `window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'laliga');\n`;
fileContent += `const laligaTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `laligaTeams.forEach(t => window.leagueData.teams.push(t));\n`;
fileContent += `window.leagueData.players = window.leagueData.players.filter(p => !laligaTeams.some(t => t.id === p.teamId));\n`;
fileContent += `const laligaPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `laligaPlayers.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_laliga.js', fileContent, 'utf-8');
console.log('Gercek La Liga uretildi!');

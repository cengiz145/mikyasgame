const fs = require('fs');

const teams = [
    { id: "benfica", name: "SL Benfica", budget: 75, leagueId: "portekiz", players: ["Anatoliy Trubin", "Antonio Silva", "Nicolas Otamendi", "Alexander Bah", "Fredrik Aursnes", "Joao Neves", "Florentino Luis", "Orkun Kokcu", "Kerem Akturkoglu", "Vangelis Pavlidis", "Angel Di Maria", "Arthur Cabral", "Marcos Leonardo", "David Neres", "Tomas Araujo"] },
    { id: "porto", name: "FC Porto", budget: 70, leagueId: "portekiz", players: ["Diogo Costa", "Pepe", "Otavio", "Joao Mario", "Wendell", "Alan Varela", "Nico Gonzalez", "Stephen Eustaquio", "Galeno", "Francisco Conceicao", "Evanilson", "Mehdi Taremi", "Pepe Aquino", "Ivan Jaime", "Marko Grujic"] },
    { id: "sporting", name: "Sporting CP", budget: 70, leagueId: "portekiz", players: ["Antonio Adan", "Goncalo Inacio", "Ousmane Diomande", "Sebastian Coates", "Morten Hjulmand", "Hidemasa Morita", "Nuno Santos", "Pedro Goncalves", "Marcus Edwards", "Viktor Gyokeres", "Paulinho", "Matheus Reis", "Ricardo Esgaio", "Daniel Braganca", "Jeremiah St. Juste"] },
    { id: "braga", name: "SC Braga", budget: 45, leagueId: "portekiz", players: ["Matheus", "Sikou Niakate", "Serdar Saatci", "Victor Gomez", "Cristian Borja", "Rodrigo Zalazar", "Joao Moutinho", "Vitor Carvalho", "Ricardo Horta", "Bruma", "Simon Banza", "Abel Ruiz", "Alvaro Djalo", "Rony Lopes", "Paulo Oliveira"] },
    { id: "vitoria_guimaraes", name: "Vitoria Guimaraes", budget: 30, leagueId: "portekiz", players: ["Bruno Varela", "Toni Borevkovic", "Jorge Fernandes", "Tomas Ribeiro", "Tiago Silva", "Tomas Handel", "Andre Andre", "Ricardo Mangas", "Bruno Gaspar", "Jota Silva", "Nélson Oliveira", "Kaio César", "Mikel Villanueva", "Ze Carlos", "Telmo Arcanjo"] },
    { id: "boavista", name: "Boavista", budget: 20, leagueId: "portekiz", players: ["Joao Goncalves", "Chidozie Awaziem", "Rodrigo Abascal", "Pedro Malheiro", "Bruno Onyemaechi", "Sebastian Perez", "Gaius Makouta", "Ilija Vukotic", "Miguel Tavares", "Salvador Agra", "Robert Bozenik", "Masaki Watai", "Vincent Sasso", "Bernardo Silva", "Joel Silva"] },
    { id: "famalicao", name: "Famalicao", budget: 25, leagueId: "portekiz", players: ["Luiz Junior", "Riccieli", "Enea Mihaj", "Nathan", "Francisco Moura", "Zaydou Youssouf", "Mirko Topic", "Gustavo Assuncao", "Puma Rodriguez", "Sorriso", "Jhonder Cadiz", "Oscar Aranda", "Chiquinho", "Martin Aguirregabiria", "Filipe Soares"] },
    { id: "moreirense", name: "Moreirense", budget: 15, leagueId: "portekiz", players: ["Kewin", "Marcelo", "Maracas", "Fabiano", "Godfried Frimpong", "Goncalo Franco", "Lawrence Ofori", "Alan", "Madson", "Joao Camacho", "Matheus Aias", "Kobamelo Kodisang", "Dinis Pinto", "Alanzinho", "Jeremy Antonisse"] },
    { id: "arouca", name: "Arouca", budget: 15, leagueId: "portekiz", players: ["Ignacio de Arruabarrena", "Matias Rocha", "Javi Montero", "Bogdan Milovanov", "Weverson", "David Simao", "Morlaye Sylla", "Pedro Santos", "Jason", "Cristo Gonzalez", "Rafa Mujica", "Alfonso Trezza", "Eboue Kouassi", "Tiago Esgaio", "Nino Galovic"] },
    { id: "gil_vicente", name: "Gil Vicente", budget: 15, leagueId: "portekiz", players: ["Andrew", "Gabriel Pereira", "Ruben Fernandes", "Alex Pinto", "Leonardo Buta", "Kanya Fujimoto", "Pedro Tiba", "Mory Gbane", "Felix Correia", "Murilo", "Ali Alipour", "Roko Baturina", "Ze Carlos", "Maxime Dominguez", "Tidjany Touré"] }
];

const positions = ["Kaleci", "Stoper", "Stoper", "Stoper", "Sağ Bek", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro", "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet"];
const roles = ["classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"];
const mentalTraits = ["elite", "aggressive", "fragile", "classic"];
const players = [];

teams.forEach(team => {
    let powerBase = 65;
    if (team.budget >= 70) powerBase = 77;
    else if (team.budget >= 40) powerBase = 72;
    
    team.players.forEach((playerName, i) => {
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        let power = powerBase + Math.floor(Math.random() * 8) - 4; 
        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 14) + 19; 
        const contractYears = Math.floor(Math.random() * 4) + 1;
        const id = playerName.toLowerCase().replace(/[^a-z0-9]/g, '') + "_" + team.id;

        players.push({ id, name: playerName, position: pos, power, speed, age, teamId: team.id, tacticalRole: role, mentalTrait: mental, contractYears, isListed: false });
    });
    delete team.players;
});

let fileContent = `// js/data_portekiz.js\n// GERCEK PORTEKIZ VERILERI\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n`;
fileContent += `const portekizTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `portekizTeams.forEach(t => window.leagueData.teams.push(t));\n`;
fileContent += `const portekizPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `portekizPlayers.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_portekiz.js', fileContent, 'utf-8');
console.log('Gercek Portekiz uretildi!');

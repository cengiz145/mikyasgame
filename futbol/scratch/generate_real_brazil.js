const fs = require('fs');

const teams = [
    { id: "palmeiras", name: "Palmeiras", budget: 70, leagueId: "brezilya", players: ["Weverton", "Gustavo Gomez", "Murilo", "Marcos Rocha", "Joaquin Piquerez", "Ze Rafael", "Richard Rios", "Raphael Veiga", "Dudu", "Endrick", "Rony", "Jose Manuel Lopez", "Mayke", "Luan", "Gabriel Menino"] },
    { id: "flamengo", name: "Flamengo", budget: 75, leagueId: "brezilya", players: ["Agustin Rossi", "Fabricio Bruno", "Leo Pereira", "Guillermo Varela", "Ayrton Lucas", "Erick Pulgar", "Gerson", "Nicolas de la Cruz", "Giorgian de Arrascaeta", "Everton Cebolinha", "Pedro", "Gabriel Barbosa", "Matias Vina", "Bruno Henrique", "Luiz Araujo"] },
    { id: "sao_paulo", name: "Sao Paulo", budget: 65, leagueId: "brezilya", players: ["Rafael", "Robert Arboleda", "Diego Costa", "Igor Vinicius", "Welington", "Pablo Maia", "Alisson", "James Rodriguez", "Lucas Moura", "Wellington Rato", "Jonathan Calleri", "Giuliano Galoppo", "Ferraresi", "Luciano", "Rodrigo Nestor"] },
    { id: "atletico_mineiro", name: "Atletico Mineiro", budget: 65, leagueId: "brezilya", players: ["Everson", "Jemerson", "Bruno Fuchs", "Renzo Saravia", "Guilherme Arana", "Otavio", "Rodrigo Battaglia", "Matias Zaracho", "Gustavo Scarpa", "Paulinho", "Hulk", "Igor Gomes", "Eduardo Vargas", "Alan Franco", "Mariano"] },
    { id: "fluminense", name: "Fluminense", budget: 60, leagueId: "brezilya", players: ["Fabio", "Thiago Silva", "Felipe Melo", "Samuel Xavier", "Marcelo", "Andre", "Martinelli", "Paulo Henrique Ganso", "Jhon Arias", "Keno", "German Cano", "John Kennedy", "Renato Augusto", "Douglas Costa", "Guga"] },
    { id: "gremio", name: "Gremio", budget: 55, leagueId: "brezilya", players: ["Agustin Marchesin", "Walter Kannemann", "Pedro Geromel", "Joao Pedro", "Reinaldo", "Mathias Villasanti", "Pepe", "Franco Cristaldo", "Yeferson Soteldo", "Cristian Pavon", "Diego Costa", "Du Queiroz", "Dodi", "Fábio", "Ely"] },
    { id: "internacional", name: "Internacional", budget: 60, leagueId: "brezilya", players: ["Sergio Rochet", "Vitao", "Gabriel Mercado", "Fabricio Bustos", "Rene", "Charles Aranguiz", "Thiago Maia", "Alan Patrick", "Mauricio", "Wanderson", "Enner Valencia", "Rafael Borre", "Bruno Henrique", "Fernando", "Lucas Alario"] },
    { id: "botafogo", name: "Botafogo", budget: 60, leagueId: "brezilya", players: ["Gatito Fernandez", "Alexander Barboza", "Lucas Halter", "Damian Suarez", "Hugo", "Marlon Freitas", "Tche Tche", "Eduardo", "Jefferson Savarino", "Luiz Henrique", "Tiquinho Soares", "Junior Santos", "Gret", "Danilo Barbosa", "Matias Segovia"] },
    { id: "cruzeiro", name: "Cruzeiro", budget: 50, leagueId: "brezilya", players: ["Rafael Cabral", "Neris", "Ze Ivaldo", "William", "Marlon", "Lucas Romero", "Lucas Silva", "Matheus Pereira", "Arthur Gomes", "Juan Dinenno", "Rafael Elias", "Mateus Vital", "Ramiro", "Kaiki", "Wesley Gasolina"] },
    { id: "vasco", name: "Vasco da Gama", budget: 50, leagueId: "brezilya", players: ["Leo Jardim", "Gary Medel", "Leo", "Paulo Henrique", "Lucas Piton", "Ze Gabriel", "Galdames", "Dimitri Payet", "David", "Adson", "Pablo Vegetti", "Rayan", "Joao Victor", "Praxedes", "Puma Rodriguez"] },
    { id: "corinthians", name: "Corinthians", budget: 60, leagueId: "brezilya", players: ["Cassio", "Felix Torres", "Gustavo Henrique", "Fagner", "Hugo", "Raniele", "Rodrigo Garro", "Maycon", "Wesley", "Romero", "Yuri Alberto", "Pedro Raul", "Fausto Vera", "Matheus Bidu", "Breno Bidon"] },
    { id: "athletico_pr", name: "Athletico Paranaense", budget: 55, leagueId: "brezilya", players: ["Bento", "Thiago Heleno", "Caca", "Madson", "Esquivel", "Fernandinho", "Erick", "Bruno Zapelli", "Canobbio", "Cuello", "Pablo", "Mastriani", "Alex Santana", "Hugo Moura", "Christian"] }
];

const positions = ["Kaleci", "Stoper", "Stoper", "Stoper", "Sağ Bek", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro", "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet"];
const roles = ["classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"];
const mentalTraits = ["elite", "aggressive", "fragile", "classic"];
const players = [];

teams.forEach(team => {
    let powerBase = 65;
    if (team.budget >= 70) powerBase = 77;
    else if (team.budget >= 50) powerBase = 72;
    
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

let fileContent = `// js/data_brazil.js\n// GERCEK BREZILYA VERILERI\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n`;
fileContent += `const brazilTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `brazilTeams.forEach(t => window.leagueData.teams.push(t));\n`;
fileContent += `const brazilPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `brazilPlayers.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_brazil.js', fileContent, 'utf-8');
console.log('Gercek Brezilya uretildi!');

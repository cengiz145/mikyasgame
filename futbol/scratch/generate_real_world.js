const fs = require('fs');

const teams = [
    { id: "inter_miami", name: "Inter Miami CF", budget: 150, leagueId: "mls", players: ["Lionel Messi", "Luis Suarez", "Sergio Busquets", "Jordi Alba", "Drake Callender", "Tomas Aviles", "Federico Redondo", "Diego Gomez", "Julian Gressel", "Matías Rojas", "Leonardo Campana", "Sergii Kryvtsov", "Marcelo Weigandt", "David Ruiz", "Benjamin Cremaschi"] },
    { id: "al_nassr", name: "Al Nassr", budget: 400, leagueId: "saudi", players: ["Cristiano Ronaldo", "Sadio Mane", "Talisca", "Marcelo Brozovic", "Otavio", "Aymeric Laporte", "Bento", "Sultan Al-Ghannam", "Alex Telles", "Abdullah Al-Khaibari", "Sami Al-Najei", "Ayman Yahya", "Abdulrahman Ghareeb", "Mohammed Maran", "Ali Lajami"] },
    { id: "al_hilal", name: "Al Hilal", budget: 500, leagueId: "saudi", players: ["Neymar", "Aleksandar Mitrovic", "Sergej Milinkovic-Savic", "Ruben Neves", "Malcom", "Kalidou Koulibaly", "Yassine Bounou", "Renan Lodi", "Saud Abdulhamid", "Salem Al-Dawsari", "Ali Al-Bulaihi", "Hassan Tambakti", "Michael", "Yasser Al-Shahrani", "Mohamed Kanno"] },
    { id: "al_ittihad", name: "Al Ittihad", budget: 350, leagueId: "saudi", players: ["Karim Benzema", "N'Golo Kante", "Fabinho", "Moussa Diaby", "Houssem Aouar", "Luiz Felipe", "Predrag Rajkovic", "Jota", "Ahmed Hegazi", "Muhannad Al-Shanqeeti", "Faisal Al-Ghamdi", "Saleh Al-Amri", "Abderrazak Hamdallah", "Romarinho", "Hamed Allah"] },
    { id: "al_ahli", name: "Al Ahli", budget: 300, leagueId: "saudi", players: ["Riyad Mahrez", "Roberto Firmino", "Edouard Mendy", "Franck Kessie", "Gabri Veiga", "Merih Demiral", "Roger Ibanez", "Firas Al-Buraikan", "Allan Saint-Maximin", "Ali Majrashi", "Ezgjan Alioski", "Bassam Al-Hurayji", "Mohammed Al-Majhad", "Ziyad Al-Johani", "Sumayhan Al-Nabit"] }
];

const positions = ["Kaleci", "Stoper", "Stoper", "Sağ Bek", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Forvet Arkası", "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet", "Orta Saha", "Stoper", "Sol Bek", "Ön Libero", "Sağ Kanat"];
const roles = ["classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"];
const mentalTraits = ["elite", "aggressive", "fragile", "classic"];
const players = [];

teams.forEach(team => {
    let powerBase = 75;
    if (team.budget >= 400) powerBase = 82;
    else if (team.budget >= 300) powerBase = 79;
    
    team.players.forEach((playerName, i) => {
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        let power = powerBase + Math.floor(Math.random() * 8) - 4; 
        
        if (["Lionel Messi", "Cristiano Ronaldo", "Neymar", "Karim Benzema"].includes(playerName)) {
            power += 10;
        }

        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 14) + 19; 
        const contractYears = Math.floor(Math.random() * 4) + 1;
        const id = playerName.toLowerCase().replace(/[^a-z0-9]/g, '') + "_" + team.id;

        players.push({ id, name: playerName, position: pos, power, speed, age, teamId: team.id, tacticalRole: role, mentalTrait: mental, contractYears, isListed: false });
    });
    delete team.players;
});

let fileContent = `// js/data_world.js\n// GERCEK 2026/2027 DUNYA YILDIZLARI VERILERI\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n`;
fileContent += `window.leagueData.teams = window.leagueData.teams.filter(t => !["inter_miami", "al_nassr", "al_hilal", "al_ittihad", "al_ahli"].includes(t.id));\n`;
fileContent += `const worldTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `worldTeams.forEach(t => window.leagueData.teams.push(t));\n`;
fileContent += `window.leagueData.players = window.leagueData.players.filter(p => !worldTeams.some(t => t.id === p.teamId));\n`;
fileContent += `const worldPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `worldPlayers.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_world.js', fileContent, 'utf-8');
console.log('Gercek Dunya Yildizlari uretildi!');

const fs = require('fs');

const teams = [
    { id: "bayern", name: "Bayern Münih", budget: 95, leagueId: "bundesliga", players: ["Manuel Neuer", "Dayot Upamecano", "Kim Min-jae", "Matthijs de Ligt", "Alphonso Davies", "Joshua Kimmich", "Leon Goretzka", "Jamal Musiala", "Leroy Sane", "Kingsley Coman", "Harry Kane", "Thomas Muller", "Serge Gnabry", "Konrad Laimer", "Aleksandar Pavlovic"] },
    { id: "dortmund", name: "Borussia Dortmund", budget: 85, leagueId: "bundesliga", players: ["Gregor Kobel", "Nico Schlotterbeck", "Niklas Sule", "Julian Ryerson", "Emre Can", "Marcel Sabitzer", "Julian Brandt", "Karim Adeyemi", "Donyell Malen", "Sebastien Haller", "Youssoufa Moukoko", "Jamie Bynoe-Gittens", "Felix Nmecha", "Ramy Bensebaini", "Salih Ozcan"] },
    { id: "leverkusen", name: "Bayer Leverkusen", budget: 88, leagueId: "bundesliga", players: ["Lukas Hradecky", "Jonathan Tah", "Edmond Tapsoba", "Piero Hincapie", "Jeremie Frimpong", "Alejandro Grimaldo", "Granit Xhaka", "Exequiel Palacios", "Florian Wirtz", "Jonas Hofmann", "Victor Boniface", "Patrik Schick", "Amine Adli", "Robert Andrich", "Odilon Kossounou"] },
    { id: "leipzig", name: "RB Leipzig", budget: 80, leagueId: "bundesliga", players: ["Peter Gulacsi", "Willi Orban", "Mohamed Simakan", "David Raum", "Benjamin Henrichs", "Xaver Schlager", "Kevin Kampl", "Xavi Simons", "Dani Olmo", "Lois Openda", "Benjamin Sesko", "Amadou Haidara", "Nicolas Seiwald", "Lukas Klostermann", "Christoph Baumgartner"] },
    { id: "stuttgart", name: "VfB Stuttgart", budget: 75, leagueId: "bundesliga", players: ["Alexander Nubel", "Waldemar Anton", "Hiroki Ito", "Maximilian Mittelstadt", "Atakan Karazor", "Angelo Stiller", "Chris Fuhrich", "Enzo Millot", "Serhou Guirassy", "Deniz Undav", "Silas", "Josha Vagnoman", "Dan-Axel Zagadou", "Woo-yeong Jeong", "Jamie Leweling"] },
    { id: "frankfurt", name: "Eintracht Frankfurt", budget: 70, leagueId: "bundesliga", players: ["Kevin Trapp", "Robin Koch", "Willian Pacho", "Tuta", "Philipp Max", "Ellyes Skhiri", "Mario Gotze", "Junior Dina Ebimbe", "Omar Marmoush", "Hugo Ekitike", "Ansgar Knauff", "Aurelio Buta", "Niels Nkounkou", "Fares Chaibi", "Donny van de Beek"] },
    { id: "wolfsburg", name: "VfL Wolfsburg", budget: 65, leagueId: "bundesliga", players: ["Koen Casteels", "Maxence Lacroix", "Moritz Jenz", "Joakim Maehle", "Maximilian Arnold", "Mattias Svanberg", "Lovro Majer", "Jonas Wind", "Tiago Tomas", "Aster Vranckx", "Ridley Baku", "Yannick Gerhardt", "Kevin Behrens", "Kilian Fischer", "Lukas Nmecha"] },
    { id: "freiburg", name: "SC Freiburg", budget: 65, leagueId: "bundesliga", players: ["Noah Atubolu", "Matthias Ginter", "Philipp Lienhart", "Christian Gunter", "Kiliann Sildillia", "Maximilian Eggestein", "Nicolas Hofler", "Ritsu Doan", "Vincenzo Grifo", "Michael Gregoritsch", "Lucas Holer", "Roland Sallai", "Merlin Rohl", "Yannik Keitel", "Chukwubuike Adamu"] },
    { id: "gladbach", name: "Bor. Mönchengladbach", budget: 60, leagueId: "bundesliga", players: ["Jonas Omlin", "Nico Elvedi", "Ko Itakura", "Maximilian Wober", "Luca Netz", "Julian Weigl", "Manu Kone", "Rocco Reitz", "Alassane Plea", "Tomas Cvancara", "Jordan Siebatcheu", "Nathan Ngoumou", "Franck Honorat", "Florian Neuhaus", "Christoph Kramer"] },
    { id: "hoffenheim", name: "TSG Hoffenheim", budget: 60, leagueId: "bundesliga", players: ["Oliver Baumann", "Ozan Kabak", "John Brooks", "Kevin Akpoguma", "Pavel Kaderabek", "Anton Stach", "Grischa Promel", "Andrej Kramaric", "Wout Weghorst", "Maximilian Beier", "Ihlas Bebou", "Marius Bulter", "Robert Skov", "Umut Tohumcu", "Finn Ole Becker"] },
    { id: "union_berlin", name: "Union Berlin", budget: 55, leagueId: "bundesliga", players: ["Frederik Ronnow", "Robin Knoche", "Diogo Leite", "Danilho Doekhi", "Josip Juranovic", "Rani Khedira", "Aissa Laidouni", "Alex Kral", "Kevin Volland", "Robin Gosens", "Lucas Tousart", "Janik Haberer", "Mikkel Kaufmann", "Christopher Trimmel", "Benedict Hollerbach"] },
    { id: "werder_bremen", name: "Werder Bremen", budget: 50, leagueId: "bundesliga", players: ["Michael Zetterer", "Marco Friedl", "Milos Veljkovic", "Anthony Jung", "Mitchell Weiser", "Jens Stage", "Romano Schmid", "Leonardo Bittencourt", "Marvin Ducksch", "Justin Njinmah", "Rafael Borre", "Senny Mayulu", "Olivier Deman", "Christian Gross", "Skelly Alvero"] },
    { id: "mainz", name: "Mainz 05", budget: 45, leagueId: "bundesliga", players: ["Robin Zentner", "Sepp van den Berg", "Stefan Bell", "Anthony Caci", "Dominik Kohr", "Leandro Barreiro", "Nadiem Amiri", "Jae-sung Lee", "Jonathan Burkardt", "Ludovic Ajorque", "Brajan Gruda", "Philipp Mwene", "Silvan Widmer", "Tom Krauss", "Marco Richter"] },
    { id: "augsburg", name: "FC Augsburg", budget: 45, leagueId: "bundesliga", players: ["Finn Dahmen", "Felix Uduokhai", "Jeffrey Gouweleeuw", "Kevin Mbabu", "Iago", "Arne Engels", "Kristijan Jakic", "Ruben Vargas", "Ermedin Demirovic", "Phillip Tietz", "Mads Pedersen", "Arne Maier", "Dion Beljo", "Tim Breithaupt", "Robert Gumny"] },
    { id: "bochum", name: "VfL Bochum", budget: 40, leagueId: "bundesliga", players: ["Manuel Riemann", "Ivan Ordets", "Keven Schlotterbeck", "Bernardo", "Anthony Losilla", "Patrick Osterhage", "Kevin Stoger", "Takuma Asano", "Philipp Hofmann", "Moritz Broschinski", "Felix Passlack", "Maximilian Wittek", "Lukas Daschner", "Cristian Gamboa", "Erhan Masovic"] },
    { id: "heidenheim", name: "1. FC Heidenheim", budget: 35, leagueId: "bundesliga", players: ["Kevin Muller", "Patrick Mainka", "Tim Siersleben", "Jonas Fohrenbach", "Lennard Maloney", "Jan Schoppner", "Eren Dinkci", "Tim Kleindienst", "Marvin Pieringer", "Kevin Sessa", "Norman Theuerkauf", "Marnon Busch", "Florian Pick", "Stefan Schimmer", "Christian Kuhlvetter"] },
    { id: "darmstadt", name: "SV Darmstadt 98", budget: 30, leagueId: "bundesliga", players: ["Marcel Schuhen", "Christoph Klarer", "Matej Maglica", "Matthias Bader", "Fabian Nurnberger", "Klaus Gjasula", "Marvin Mehlem", "Tim Skarke", "Luca Pfeiffer", "Oscar Vilhelmsson", "Tobias Kempe", "Fabian Holland", "Emir Karic", "Thomas Isherwood", "Christoph Zimmermann"] },
    { id: "koln", name: "1. FC Köln", budget: 35, leagueId: "bundesliga", players: ["Marvin Schwabe", "Timo Hubers", "Julian Chabot", "Benno Schmitz", "Max Finkgrafe", "Eric Martel", "Denis Huseinbasic", "Dejan Ljubicic", "Florian Kainz", "Davie Selke", "Jan Thielmann", "Linton Maina", "Faride Alidou", "Sargis Adamyan", "Luca Kilian"] }
];

const positions = [
    "Kaleci", "Stoper", "Stoper", "Stoper", "Sağ Bek", "Sol Bek",
    "Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro",
    "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet"
];

const roles = [
    "classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", 
    "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"
];

const mentalTraits = ["elite", "aggressive", "fragile", "classic"];

const players = [];

teams.forEach(team => {
    let powerBase = 65;
    if (team.budget >= 85) powerBase = 84;
    else if (team.budget >= 75) powerBase = 78;
    else if (team.budget >= 60) powerBase = 72;
    
    team.players.forEach((playerName, i) => {
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        
        let power = powerBase + Math.floor(Math.random() * 8) - 4; 
        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 14) + 19; // 19-32 arası
        const contractYears = Math.floor(Math.random() * 4) + 1;
        
        const id = playerName.toLowerCase().replace(/[^a-z0-9]/g, '') + "_" + team.id;

        players.push({
            id: id,
            name: playerName,
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
    });
    
    // Remove the temporary players array from the team object before writing
    delete team.players;
});

let fileContent = `// js/data_bundesliga.js\n// GERCEK BUNDESLIGA VERILERI (2026/2027)\n\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n\n`;
fileContent += `const bundesligaTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `bundesligaTeams.forEach(t => window.leagueData.teams.push(t));\n\n`;

fileContent += `const bundesligaPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `bundesligaPlayers.forEach(p => window.leagueData.players.push(p));\n`;

fs.writeFileSync('js/data_bundesliga.js', fileContent, 'utf-8');
console.log('Gercek Bundesliga takim ve oyunculari uretildi!');

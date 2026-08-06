const fs = require('fs');

const teams = [
    { id: "psg", name: "Paris Saint-Germain", budget: 95, leagueId: "ligue1", players: ["Gianluigi Donnarumma", "Marquinhos", "Milan Skriniar", "Lucas Hernandez", "Achraf Hakimi", "Nuno Mendes", "Warren Zaire-Emery", "Vitinha", "Fabian Ruiz", "Ousmane Dembele", "Bradley Barcola", "Goncalo Ramos", "Randal Kolo Muani", "Lucas Beraldo", "Marco Asensio"] },
    { id: "monaco", name: "AS Monaco", budget: 75, leagueId: "ligue1", players: ["Radoslaw Majecki", "Guillermo Maripan", "Mohammed Salisu", "Thilo Kehrer", "Vanderson", "Youssouf Fofana", "Denis Zakaria", "Aleksandr Golovin", "Takumi Minamino", "Wissam Ben Yedder", "Folarin Balogun", "Maghnes Akliouche", "Eliesse Ben Seghir", "Ismail Jakobs", "Breel Embolo"] },
    { id: "marseille", name: "Olympique Marseille", budget: 70, leagueId: "ligue1", players: ["Pau Lopez", "Chancel Mbemba", "Leonardo Balerdi", "Samuel Gigot", "Jonathan Clauss", "Jordan Veretout", "Geoffrey Kondogbia", "Valentin Rongier", "Amine Harit", "Pierre-Emerick Aubameyang", "Iliman Ndiaye", "Ismaila Sarr", "Faris Moumbagna", "Quentin Merlin", "Ulisses Garcia"] },
    { id: "lille", name: "LOSC Lille", budget: 65, leagueId: "ligue1", players: ["Lucas Chevalier", "Leny Yoro", "Alexsandro", "Bafode Diakite", "Ismaily", "Benjamin Andre", "Nabil Bentaleb", "Angel Gomes", "Edon Zhegrova", "Jonathan David", "Hakon Arnar Haraldsson", "Remy Cabella", "Tiago Santos", "Ivan Cavaleiro", "Gudmundsson"] },
    { id: "lyon", name: "Olympique Lyon", budget: 65, leagueId: "ligue1", players: ["Anthony Lopes", "Jake O'Brien", "Duje Caleta-Car", "Clinton Mata", "Nicolas Tagliafico", "Nemanja Matic", "Maxence Caqueret", "Corentin Tolisso", "Said Benrahma", "Alexandre Lacazette", "Ernest Nuamah", "Gift Orban", "Rayan Cherki", "Maitland-Niles", "Orel Mangala"] },
    { id: "lens", name: "RC Lens", budget: 60, leagueId: "ligue1", players: ["Brice Samba", "Kevin Danso", "Facundo Medina", "Jonathan Gradit", "Przemyslaw Frankowski", "Salis Abdul Samed", "Nampalys Mendy", "David Pereira da Costa", "Florian Sotoca", "Elye Wahi", "Wesley Said", "Deiver Machado", "Ruben Aguilar", "Adrien Thomasson", "Angelo Fulgini"] },
    { id: "nice", name: "OGC Nice", budget: 60, leagueId: "ligue1", players: ["Marcin Bulka", "Jean-Clair Todibo", "Dante", "Melvin Bard", "Jordan Lotomba", "Khephren Thuram", "Morgan Sanson", "Hicham Boudaoui", "Jeremie Boga", "Terem Moffi", "Gaetan Laborde", "Evann Guessand", "Youssouf Ndayishimiye", "Tom Louchet", "Valentin Rosier"] },
    { id: "rennes", name: "Stade Rennais", budget: 60, leagueId: "ligue1", players: ["Steve Mandanda", "Arthur Theate", "Warmed Omari", "Adrien Truffert", "Guela Doue", "Baptiste Santamaria", "Benjamin Bourigeaud", "Enzo Le Fee", "Desire Doue", "Martin Terrier", "Amine Gouiri", "Arnaud Kalimuendo", "Ludovic Blas", "Azor Matusiwa", "Christopher Wooh"] },
    { id: "reims", name: "Stade de Reims", budget: 50, leagueId: "ligue1", players: ["Yehvann Diouf", "Yunis Abdelhamid", "Emmanuel Agbadou", "Thomas Foket", "Thibault De Smet", "Marshall Munetsi", "Teddy Teuma", "Amir Richardson", "Junya Ito", "Oumar Diakite", "Keito Nakamura", "Reda Khadra", "Valentin Atangana", "Sergio Akieme", "Joseph Okumu"] },
    { id: "toulouse", name: "Toulouse FC", budget: 45, leagueId: "ligue1", players: ["Guillaume Restes", "Rasmus Nicolaisen", "Logan Costa", "Christian Mawissa", "Mikkel Desler", "Vincent Sierro", "Cristian Casseres", "Stijn Spierings", "Yann Gboho", "Thijs Dallinga", "Aron Donnum", "Zakaria Aboukhlal", "Gabriel Suazo", "Moussa Diarra", "Shavy Babicka"] },
    { id: "montpellier", name: "Montpellier HSC", budget: 40, leagueId: "ligue1", players: ["Benjamin Lecomte", "Becir Omeragic", "Kiki Kouyate", "Modibo Sagnan", "Issiaga Sylla", "Joris Chotard", "Jordan Ferri", "Teji Savanier", "Arnaud Nordin", "Akor Adams", "Musa Al-Taamari", "Wahbi Khazri", "Lucas Mincarelli", "Silvan Hefti", "Karamoh"] },
    { id: "strasbourg", name: "RC Strasbourg", budget: 40, leagueId: "ligue1", players: ["Alaa Bellaarouch", "Lucas Perrin", "Abakar Sylla", "Frederic Guilbert", "Thomas Delaine", "Ismael Doukoure", "Andrey Santos", "Habib Diarra", "Dilane Bakwa", "Emanuel Emegha", "Kevin Gameiro", "Marvin Senaya", "Jessy Deminguet", "Junior Mwanga", "Moise Sahi Dion"] },
    { id: "nantes", name: "FC Nantes", budget: 35, leagueId: "ligue1", players: ["Alban Lafont", "Jean-Charles Castelletto", "Nicolas Pallois", "Eray Comert", "Kelvin Amian", "Pedro Chirivella", "Douglas Augusto", "Moussa Sissoko", "Florent Mollet", "Mostafa Mohamed", "Moses Simon", "Matthis Abline", "Tino Kadewere", "Marcus Coco", "Samuel Moutoussamy"] },
    { id: "lehavre", name: "Le Havre AC", budget: 30, leagueId: "ligue1", players: ["Arthur Desmas", "Gautier Lloris", "Arouna Sangante", "Youté Kinkoue", "Christopher Operi", "Oussama Targhalline", "Daler Kuzyaev", "Abdoulaye Toure", "Josue Casimir", "Mohamed Bayo", "Emmanuel Sabbi", "Yassine Kechta", "Andre Ayew", "Loic Nego", "Alois Confais"] },
    { id: "brest", name: "Stade Brestois", budget: 50, leagueId: "ligue1", players: ["Marco Bizot", "Brendan Chardonnet", "Lilian Brassier", "Kenny Lala", "Bradley Locko", "Pierre Lees-Melou", "Hugo Magnetti", "Mahdi Camara", "Romain Del Castillo", "Steve Mounie", "Martin Satriano", "Kamory Doumbia", "Jeremy Le Douaron", "Mathias Pereira Lage", "Jonas Martin"] }
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
    else if (team.budget >= 70) powerBase = 77;
    else if (team.budget >= 60) powerBase = 72;
    
    team.players.forEach((playerName, i) => {
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        let power = powerBase + Math.floor(Math.random() * 8) - 4; 
        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 14) + 19; 
        const contractYears = Math.floor(Math.random() * 4) + 1;
        const id = playerName.toLowerCase().replace(/[^a-z0-9]/g, '') + "_" + team.id;

        players.push({
            id: id, name: playerName, position: pos, power: power, speed: speed, age: age,
            teamId: team.id, tacticalRole: role, mentalTrait: mental, contractYears: contractYears, isListed: false
        });
    });
    delete team.players;
});

let fileContent = `// js/data_ligue1.js\n// GERCEK LIGUE 1 VERILERI (2026/2027)\n\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n\n`;
fileContent += `const ligue1Teams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `ligue1Teams.forEach(t => window.leagueData.teams.push(t));\n\n`;
fileContent += `const ligue1Players = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `ligue1Players.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_ligue1.js', fileContent, 'utf-8');
console.log('Gercek Ligue 1 takim ve oyunculari uretildi!');

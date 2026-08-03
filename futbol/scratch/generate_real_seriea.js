const fs = require('fs');

const teams = [
    { id: "inter", name: "Inter Milan", budget: 90, leagueId: "seriea", players: ["Yann Sommer", "Alessandro Bastoni", "Francesco Acerbi", "Benjamin Pavard", "Federico Dimarco", "Denzel Dumfries", "Hakan Calhanoglu", "Nicolo Barella", "Henrikh Mkhitaryan", "Davide Frattesi", "Lautaro Martinez", "Marcus Thuram", "Marko Arnautovic", "Stefan de Vrij", "Carlos Augusto"] },
    { id: "milan", name: "AC Milan", budget: 85, leagueId: "seriea", players: ["Mike Maignan", "Fikayo Tomori", "Malick Thiaw", "Theo Hernandez", "Davide Calabria", "Ismael Bennacer", "Tijjani Reijnders", "Ruben Loftus-Cheek", "Christian Pulisic", "Rafael Leao", "Olivier Giroud", "Luka Jovic", "Samuel Chukwueze", "Yunus Musah", "Simon Kjaer"] },
    { id: "juventus", name: "Juventus", budget: 85, leagueId: "seriea", players: ["Wojciech Szczesny", "Bremer", "Danilo", "Federico Gatti", "Adrien Rabiot", "Manuel Locatelli", "Weston McKennie", "Filip Kostic", "Andrea Cambiaso", "Federico Chiesa", "Dusan Vlahovic", "Arkadiusz Milik", "Kenan Yildiz", "Timothy Weah", "Daniele Rugani"] },
    { id: "napoli", name: "SSC Napoli", budget: 80, leagueId: "seriea", players: ["Alex Meret", "Amir Rrahmani", "Juan Jesus", "Giovanni Di Lorenzo", "Mathias Olivera", "Stanislav Lobotka", "Andre-Frank Zambo Anguissa", "Jens Cajuste", "Khvicha Kvaratskhelia", "Victor Osimhen", "Matteo Politano", "Giacomo Raspadori", "Giovanni Simeone", "Mario Rui", "Leo Ostigard"] },
    { id: "roma", name: "AS Roma", budget: 75, leagueId: "seriea", players: ["Mile Svilar", "Gianluca Mancini", "Evan Ndicka", "Leonardo Spinazzola", "Rick Karsdorp", "Bryan Cristante", "Leandro Paredes", "Lorenzo Pellegrini", "Paulo Dybala", "Romelu Lukaku", "Stephan El Shaarawy", "Sardar Azmoun", "Edoardo Bove", "Zeki Celik", "Nicola Zalewski"] },
    { id: "lazio", name: "SS Lazio", budget: 70, leagueId: "seriea", players: ["Ivan Provedel", "Alessio Romagnoli", "Patric", "Adam Marusic", "Luca Pellegrini", "Luis Alberto", "Danilo Cataldi", "Matteo Guendouzi", "Felipe Anderson", "Mattia Zaccagni", "Ciro Immobile", "Taty Castellanos", "Daichi Kamada", "Matias Vecino", "Gustav Isaksen"] },
    { id: "atalanta", name: "Atalanta BC", budget: 70, leagueId: "seriea", players: ["Juan Musso", "Giorgio Scalvini", "Berat Djimsiti", "Sead Kolasinac", "Marten de Roon", "Ederson", "Teun Koopmeiners", "Davide Zappacosta", "Matteo Ruggeri", "Ademola Lookman", "Gianluca Scamacca", "Charles De Ketelaere", "Mario Pasalic", "Emil Holm", "Aleksei Miranchuk"] },
    { id: "fiorentina", name: "ACF Fiorentina", budget: 65, leagueId: "seriea", players: ["Pietro Terracciano", "Lucas Martinez Quarta", "Nikola Milenkovic", "Cristiano Biraghi", "Michael Kayode", "Arthur Melo", "Rolando Mandragora", "Giacomo Bonaventura", "Nicolas Gonzalez", "Andrea Belotti", "Lucas Beltran", "Jonathan Ikone", "Riccardo Sottil", "M'Bala Nzola", "Luca Ranieri"] },
    { id: "bologna", name: "Bologna FC", budget: 60, leagueId: "seriea", players: ["Lukasz Skorupski", "Riccardo Calafiori", "Sam Beukema", "Stefan Posch", "Victor Kristiansen", "Remo Freuler", "Michel Aebischer", "Lewis Ferguson", "Riccardo Orsolini", "Dan Ndoye", "Joshua Zirkzee", "Alexis Saelemaekers", "Jens Odgaard", "Giovanni Fabbian", "Jhon Lucumi"] },
    { id: "torino", name: "Torino FC", budget: 55, leagueId: "seriea", players: ["Vanja Milinkovic-Savic", "Alessandro Buongiorno", "Koffi Djidji", "Ricardo Rodriguez", "Raoul Bellanova", "Samuele Ricci", "Ivan Ilic", "Karol Linetty", "Nikola Vlasic", "Duvan Zapata", "Antonio Sanabria", "David Okereke", "Adrien Tameze", "Valentino Lazaro", "Saba Sazonov"] },
    { id: "monza", name: "AC Monza", budget: 50, leagueId: "seriea", players: ["Michele Di Gregorio", "Pablo Mari", "Armando Izzo", "Luca Caldirola", "Patrick Ciurria", "Matteo Pessina", "Roberto Gagliardini", "Andrea Colpani", "Dany Mota", "Milan Djuric", "Lorenzo Colombo", "Valentin Carboni", "Gianluca Caprari", "Andrea Carboni", "Pedro Pereira"] },
    { id: "genoa", name: "Genoa CFC", budget: 50, leagueId: "seriea", players: ["Josep Martinez", "Mattia Bani", "Johan Vasquez", "Koni De Winter", "Morten Frendrup", "Milan Badelj", "Albert Gudmundsson", "Junior Messias", "Mateo Retegui", "Caleb Ekuban", "Stefano Sabelli", "Aaron Martin", "Ruslan Malinovskyi", "Kevin Strootman", "Morten Thorsby"] },
    { id: "sassuolo", name: "US Sassuolo", budget: 45, leagueId: "seriea", players: ["Andrea Consigli", "Gian Marco Ferrari", "Martin Erlic", "Marcus Pedersen", "Josh Doig", "Matheus Henrique", "Daniel Boloca", "Kristian Thorstvedt", "Domenico Berardi", "Armand Lauriente", "Andrea Pinamonti", "Gregoire Defrel", "Nedim Bajrami", "Uros Racic", "Jeremy Toljan"] },
    { id: "lecce", name: "US Lecce", budget: 40, leagueId: "seriea", players: ["Wladimiro Falcone", "Federico Baschirotto", "Marin Pongracic", "Valentin Gendrey", "Antonino Gallo", "Ylber Ramadani", "Alexis Blin", "Remi Oudin", "Pontus Almqvist", "Lameck Banda", "Nikola Krstovic", "Roberto Piccoli", "Mohamed Kaba", "Joan Gonzalez", "Nicola Sansone"] },
    { id: "udinese", name: "Udinese Calcio", budget: 40, leagueId: "seriea", players: ["Maduka Okoye", "Jaka Bijol", "Nehuen Perez", "Thomas Kristensen", "Walace", "Sandi Lovric", "Lazar Samardzic", "Hassane Kamara", "Roberto Pereyra", "Florian Thauvin", "Lorenzo Lucca", "Isaac Success", "Keinan Davis", "Oier Zarraga", "Festy Ebosele"] },
    { id: "verona", name: "Hellas Verona", budget: 35, leagueId: "seriea", players: ["Lorenzo Montipo", "Pawel Dawidowicz", "Diego Coppola", "Jackson Tchatchoua", "Juan Cabal", "Ondrej Duda", "Suat Serdar", "Tomas Suslov", "Darko Lazovic", "Tijjani Noslin", "Karol Swiderski", "Michael Folorunsho", "Stefan Mitrovic", "Dani Silva", "Elayis Tavsan"] },
    { id: "cagliari", name: "Cagliari Calcio", budget: 35, leagueId: "seriea", players: ["Simone Scuffet", "Alberto Dossena", "Yerry Mina", "Gabriele Zappa", "Tommaso Augello", "Antoine Makoumbou", "Ibrahim Sulemana", "Nahitan Nandez", "Nicolas Viola", "Zito Luvumbo", "Gianluca Lapadula", "Eldor Shomurodov", "Gaetano Oristanio", "Alessandro Deiola", "Edoardo Goldaniga"] },
    { id: "empoli", name: "Empoli FC", budget: 30, leagueId: "seriea", players: ["Elia Caprile", "Sebastiano Luperto", "Ardian Ismajli", "Bartosz Bereszynski", "Giuseppe Pezzella", "Razvan Marin", "Alberto Grassi", "Youssef Maleh", "Szymon Zurkowski", "Nicolo Cambiaghi", "M'Baye Niang", "Francesco Caputo", "Emmanuel Gyasi", "Matteo Cancellieri", "Liberato Cacace"] }
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
        const age = Math.floor(Math.random() * 14) + 19; 
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
    
    delete team.players;
});

let fileContent = `// js/data_seriea.js\n// GERCEK SERIE A VERILERI (2026/2027)\n\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n\n`;
fileContent += `const serieaTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `serieaTeams.forEach(t => window.leagueData.teams.push(t));\n\n`;

fileContent += `const serieaPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `serieaPlayers.forEach(p => window.leagueData.players.push(p));\n`;

fs.writeFileSync('js/data_seriea.js', fileContent, 'utf-8');
console.log('Gercek Serie A takim ve oyunculari uretildi!');

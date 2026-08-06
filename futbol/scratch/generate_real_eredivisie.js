const fs = require('fs');

const teams = [
    { id: "psv", name: "PSV Eindhoven", budget: 70, leagueId: "hollanda", players: ["Walter Benitez", "Olivier Boscagli", "Andre Ramalho", "Jordan Teze", "Sergino Dest", "Jerdy Schouten", "Joey Veerman", "Ismael Saibari", "Johan Bakayoko", "Luuk de Jong", "Hirving Lozano", "Malik Tillman", "Guus Til", "Armando Obispo", "Patrick van Aanholt"] },
    { id: "feyenoord", name: "Feyenoord", budget: 65, leagueId: "hollanda", players: ["Justin Bijlow", "David Hancko", "Lutsharel Geertruida", "Gernot Trauner", "Quilindschy Hartman", "Mats Wieffer", "Quinten Timber", "Calvin Stengs", "Igor Paixao", "Santiago Gimenez", "Yankuba Minteh", "Luka Ivanusec", "Ramiz Zerrouki", "Thomas Beelen", "Bart Nieuwkoop"] },
    { id: "ajax", name: "Ajax Amsterdam", budget: 65, leagueId: "hollanda", players: ["Diant Ramaj", "Jorrel Hato", "Josip Sutalo", "Devyne Rensch", "Borna Sosa", "Jordan Henderson", "Kenneth Taylor", "Steven Berghuis", "Steven Bergwijn", "Brian Brobbey", "Chuba Akpom", "Mika Godts", "Branco van den Boomen", "Sivert Mannsverk", "Anton Gaaei"] },
    { id: "az_alkmaar", name: "AZ Alkmaar", budget: 50, leagueId: "hollanda", players: ["Mathew Ryan", "Vangelis Pavlidis", "Riechedly Bazoer", "Yukinari Sugawara", "David Moller Wolfe", "Jordy Clasie", "Sven Mijnans", "Dani de Wit", "Ruben van Bommel", "Mayckel Lahdo", "Tiago Dantas", "Myron van Brederode", "Alexandre Penetra", "Riechedly Bazoer", "Jens Odgaard"] },
    { id: "twente", name: "FC Twente", budget: 45, leagueId: "hollanda", players: ["Lars Unnerstall", "Robin Propper", "Mees Hilgers", "Joshua Brenet", "Gijs Smal", "Michal Sadilek", "Mathias Kjolo", "Sem Steijn", "Daan Rots", "Ricky van Wolfswinkel", "Michel Vlap", "Manfred Ugalde", "Carel Eiting", "Youri Regeer", "Naci Unuvar"] },
    { id: "sparta_rotterdam", name: "Sparta Rotterdam", budget: 35, leagueId: "hollanda", players: ["Nick Olij", "Bart Vriends", "Tijs Velthuis", "Djevencio van der Kust", "Said Bakari", "Jonathan de Guzman", "Pelle Clement", "Arno Verschueren", "Koki Saito", "Tobias Lauritsen", "Joshua Kitolano", "Charles-Andreas Brym", "Camiel Neghli", "Metinho", "Rick Meissen"] },
    { id: "utrecht", name: "FC Utrecht", budget: 40, leagueId: "hollanda", players: ["Vasilis Barkas", "Mike van der Hoorn", "Ryan Flamingo", "Hidde ter Avest", "Souffian El Karouani", "Oscar Fraulo", "Can Bozdogan", "Jens Toornstra", "Taylor Booth", "Sam Lammers", "Victor Jensen", "Othman Boussaid", "Zidane Iqbal", "Mark van der Maarel", "Ole Romeny"] },
    { id: "nec_nijmegen", name: "NEC Nijmegen", budget: 35, leagueId: "hollanda", players: ["Jasper Cillessen", "Philippe Sandler", "Bram Nuytinck", "Bart van Rooij", "Calvin Verdonk", "Dirk Proper", "Lasse Schone", "Tjaronn Chery", "Kodai Sano", "Koki Ogawa", "Sontje Hansen", "Rober Gonzalez", "Sylla Sow", "Mees Hoedemakers", "Brayann Pereira"] },
    { id: "heerenveen", name: "sc Heerenveen", budget: 30, leagueId: "hollanda", players: ["Mickey van der Hart", "Pawel Bochniewicz", "Sven van Beek", "Mats Kohlert", "Oliver Braude", "Thom Haye", "Simon Olsson", "Luuk Brouwers", "Osame Sahraoui", "Pelle van Amersfoort", "Patrik Walemark", "Ion Nicolaescu", "Che Nunnely", "Espen van Ee", "Denzel Hall"] },
    { id: "go_ahead_eagles", name: "Go Ahead Eagles", budget: 25, leagueId: "hollanda", players: ["Jeffrey de Lange", "Joris Kramer", "Gerrit Nauber", "Bas Kuipers", "Mats Deijl", "Philippe Rommens", "Evert Linthorst", "Willum Willumsson", "Victor Edvardsen", "Oliver Edvardsen", "Sybilla", "Soren Tengstedt", "Finn Stokkers", "Enric Llansana", "Jano Bax"] },
    { id: "fortuna_sittard", name: "Fortuna Sittard", budget: 25, leagueId: "hollanda", players: ["Michael Verrips", "Rodrigo Guth", "Dimitrios Siovas", "Ivo Pinto", "Mitchell Dijks", "Deroy Duarte", "Alen Halilovic", "Loreintz Rosier", "Inigo Cordoba", "Kaj Sierhuis", "Justin Lonwijk", "Arianit Ferati", "Sadik Fofana", "Remy Vita", "Marko Lazetic"] },
    { id: "volendam", name: "FC Volendam", budget: 15, leagueId: "hollanda", players: ["Mio Backhaus", "Benaissa Benamar", "Josh Flint", "Oskar Buur", "Brian Plat", "Damon Mirani", "Milan de Haan", "Calvin Twigt", "Robert Muhren", "Vivaldo Semedo", "Luke Le Roux", "Garang Kuol", "Darius Johnson", "Achraf Douiri", "Bram van Driel"] }
];

const positions = [
    "Kaleci", "Stoper", "Stoper", "Stoper", "Sağ Bek", "Sol Bek",
    "Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro",
    "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet"
];
const roles = ["classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"];
const mentalTraits = ["elite", "aggressive", "fragile", "classic"];
const players = [];

teams.forEach(team => {
    let powerBase = 65;
    if (team.budget >= 65) powerBase = 77;
    else if (team.budget >= 40) powerBase = 70;
    
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

let fileContent = `// js/data_eredivisie.js\n// GERCEK EREDIVISIE VERILERI\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n`;
fileContent += `const eredivisieTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `eredivisieTeams.forEach(t => window.leagueData.teams.push(t));\n`;
fileContent += `const eredivisiePlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `eredivisiePlayers.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_eredivisie.js', fileContent, 'utf-8');
console.log('Gercek Eredivisie uretildi!');

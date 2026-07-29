const fs = require('fs');

const teams = [
    { id: "galatasaray", name: "Galatasaray", color: "#A90432", budget: 75, city: "Istanbul", leagueId: "superlig", players: ["Fernando Muslera", "Davinson Sanchez", "Victor Nelsson", "Kaan Ayhan", "Ismail Jakobs", "Lucas Torreira", "Gabriel Sara", "Dries Mertens", "Kerem Demirbay", "Baris Alper Yilmaz", "Hakim Ziyech", "Victor Osimhen", "Mauro Icardi", "Michy Batshuayi", "Berkan Kutlu", "Yunus Akgun", "Elias Jelert"] },
    { id: "fenerbahce", name: "Fenerbahçe", color: "#000080", budget: 75, city: "Istanbul", leagueId: "superlig", players: ["Dominik Livakovic", "Caglar Soyuncu", "Alexander Djiku", "Rodrigo Becao", "Bright Osayi-Samuel", "Jayden Oosterwolde", "Ismail Yuksek", "Fred", "Sebastian Szymanski", "Dusan Tadic", "Allan Saint-Maximin", "Irfan Can Kahveci", "Youssef En-Nesyri", "Edin Dzeko", "Sofyan Amrabat", "Mert Muldur", "Cengiz Under"] },
    { id: "besiktas", name: "Beşiktaş", color: "#000000", budget: 65, city: "Istanbul", leagueId: "superlig", players: ["Mert Gunok", "Gabriel Paulista", "Felix Uduokhai", "Arthur Masuaku", "Jonas Svensson", "Al-Musrati", "Gedson Fernandes", "Rafa Silva", "Joao Mario", "Milot Rashica", "Leandro Trossard", "Semih Kilicsoy", "Ciro Immobile", "Cher Ndour", "Emirhan Topcu", "Jean Onana", "Mustafa Erhan Hekimoglu", "Tayyip Talha Sanuc"] },
    { id: "trabzonspor", name: "Trabzonspor", color: "#800000", budget: 55, city: "Trabzon", leagueId: "superlig", players: ["Ugurcan Cakir", "Stefan Savic", "Stefano Denswil", "Eren Elmali", "Pedro Malheiro", "John Lundstram", "Ozan Tufan", "Muhammed Cham", "Enis Bardhi", "Denis Dragus", "Edin Visca", "Simon Banza", "Serdar Saatci", "Okay Yokuslu", "Anthony Nwakaeme"] },
    { id: "basaksehir", name: "Başakşehir", color: "#FF6600", budget: 35, city: "Istanbul", leagueId: "superlig", players: ["Muhammed Sengezer", "Ousseynou Ba", "Jerome Opoku", "Omer Ali Sahiner", "Lucas Lima", "Berkay Ozcan", "Olivier Kemen", "Dimitrios Pelkas", "Deniz Turuc", "Davidson", "Krzysztof Piatek", "Serdar Gurler", "Joao Figueiredo", "Onur Ergun", "Matchoi Djalo"] },
    { id: "kasimpasa", name: "Kasımpaşa", color: "#000080", budget: 25, city: "Istanbul", leagueId: "superlig", players: ["Andreas Gianniotis", "Kenneth Omeruo", "Yasin Ozcan", "Claudio Winck", "Kevin Rodrigues", "Aytac Kara", "Loret Sadiku", "Haris Hajradinovic", "Mamadou Fall", "Mortadha Ben Ouanes", "Nuno Da Costa", "Julien Ngoy", "Sadik Ciftpinar", "Gokhan Gul", "Dries Saddiki"] },
    { id: "antalyaspor", name: "Antalyaspor", color: "#ff0000", budget: 25, city: "Antalya", leagueId: "superlig", players: ["Helton Leite", "Omer Toprak", "Veysel Sari", "Bunyamin Balci", "Guray Vural", "Jakub Kaluzinski", "Erdal Rakip", "Sander van de Streek", "Sam Larsson", "Zymer Bytyqi", "Braian Samudio", "Adam Buksa", "Ramzi Safuri", "Erdogan Yesilyurt", "Mert Yilmaz"] },
    { id: "konyaspor", name: "Konyaspor", color: "#008000", budget: 25, city: "Konya", leagueId: "superlig", players: ["Jakub Slowik", "Adil Demirbag", "Riechedly Bazoer", "Guilherme", "Ahmet Oguz", "Soner Dikmen", "Marko Jevtovic", "Emmanuel Boateng", "Louka Prip", "Umut Nayir", "Sokol Cikalleshi", "Danijel Aleksic", "Valon Ethemi", "Hamidou Keyta", "Blaz Kramer"] },
    { id: "sivasspor", name: "Sivasspor", color: "#ff0000", budget: 20, city: "Sivas", leagueId: "superlig", players: ["Ali Sasal Vural", "Uros Radakovic", "Noah Sonko Sundberg", "Murat Paluli", "Ugur Ciftci", "Charis Charisis", "Azizbek Turgunboev", "Samuel Moutoussamy", "Alex Pritchard", "Garry Rodrigues", "Rey Manaj", "Keita Balde", "Queensy Menig", "Ziya Erdal", "Emrah Bassan"] },
    { id: "alanyaspor", name: "Alanyaspor", color: "#ff6600", budget: 25, city: "Alanya", leagueId: "superlig", players: ["Ertugrul Taskiran", "Fidan Aliti", "Jure Balkovec", "Florent Hadergjonaj", "Richard", "Nicolas Janvier", "Efecan Karaca", "Carlos Eduardo", "Ui-jo Hwang", "Sergio Cordova", "Loide Augusto", "Gaius Makouta", "Nuno Lima", "Fatih Aksoy", "Mert Yusuf Torlak"] },
    { id: "karagumruk", name: "Fatih Karagümrük", color: "#ff0000", budget: 20, city: "Istanbul", leagueId: "superlig", players: ["Salvatore Sirigu", "Federico Ceccherini", "Koray Gunter", "Levent Mercan", "Davide Biraschi", "Marcus Rohden", "Andrea Bertolacci", "Valentin Eysseric", "Sofiane Feghouli", "Can Keles", "Marcao", "Kevin Lasagna", "Guven Yalcin", "Emre Mor", "Salih Dursun"] },
    { id: "kayserispor", name: "Kayserispor", color: "#ffcc00", budget: 20, city: "Kayseri", leagueId: "superlig", players: ["Bilal Bayazit", "Majid Hosseini", "Joseph Attamah", "Lionel Carole", "Gokhan Sazdagi", "Kartal Yilmaz", "Ali Karimi", "Mehdi Bourabia", "Miguel Cardoso", "Aylton Boa Morte", "Duckens Nazon", "Carlos Mane", "Hasan Ali Kaldirim", "Stephane Bahoken", "Arif Kocaman"] },
    { id: "ankaragucu", name: "Ankaragücü", color: "#ffff00", budget: 20, city: "Ankara", leagueId: "superlig", players: ["Bahadir Han Gungordu", "Uros Radakovic", "Nihad Mujakic", "Stelios Kitsiou", "Atakan Cankaya", "Tolga Cigerci", "Ali Kaan Guneren", "Efkan Bekiroglu", "Renaldo Cephas", "Garry Rodrigues", "Ali Sowe", "Olimpiu Morutan", "Christian Bassogog", "Alper Uludag", "Cemali Sertel"] },
    { id: "gaziantep", name: "Gaziantep FK", color: "#ff0000", budget: 15, city: "Gaziantep", leagueId: "superlig", players: ["Florin Nita", "Papy Djilobodji", "Nicolas Nkoulou", "Salem Mbakata", "Mustafa Eskihellac", "Marko Jevtovic", "Alexandru Maxim", "Deian Sorescu", "Denis Dragus", "Lazar Markovic", "Badou Ndiaye", "Ogulcan Caglayan", "Kacper Kozlowski", "Arda Kizildag", "Ertugrul Ersoy"] },
    { id: "samsunspor", name: "Samsunspor", color: "#ff0000", budget: 25, city: "Samsun", leagueId: "superlig", players: ["Okan Kocuk", "Lubomir Satka", "Rick van Drongelen", "Zeki Yavru", "Marc Bola", "Youssef Ait Bennasser", "Olivier Ntcham", "Carlo Holse", "Emre Kilinc", "Marius Mouandilmadji", "Landry Dimata", "Arbnor Muja", "Ercan Kara", "Soner Aydogdu", "Taylan Antalyali"] },
    { id: "pendikspor", name: "Pendikspor", color: "#ff0000", budget: 15, city: "Istanbul", leagueId: "superlig", players: ["Erdem Canpolat", "Alpaslan Ozturk", "Welinton", "Serkan Asan", "Nuno Sequeira", "Arnaud Lusamba", "Fredrik Midtsjo", "Endri Cekici", "Halil Akbunar", "Thiam", "Umut Nayir", "Gokcan Kaya", "Erencan Yardimci", "Hasan Kilic", "Joher Rassoul"] },
    { id: "hatayspor", name: "Hatayspor", color: "#800000", budget: 15, city: "Hatay", leagueId: "superlig", players: ["Erce Kardesler", "Guy-Marcelin Kilama", "Nikola Maksimovic", "Kamil Ahmet Corekci", "Cemali Sertel", "Giorgi Aburjania", "Mehdi Boudjemaa", "Fisayo Dele-Bashiru", "Rigoberto Rivas", "Carlos Strandberg", "Renat Dadashov", "Gorkem Saglam", "Omer Faruk Beyaz", "Rui Pedro", "Vincent Aboubakar"] },
    { id: "rizespor", name: "Çaykur Rizespor", color: "#008000", budget: 20, city: "Rize", leagueId: "superlig", players: ["Gokhan Akkan", "Husniddin Alikulov", "Emirhan Topcu", "Taha Sahin", "Casper Hojer", "Jonjo Shelvey", "Ibrahim Olawoyin", "Muhammed Sarikaya", "Altin Zeqiri", "Dal Varesanovic", "Adolfo Gaich", "Martin Minchev", "Ali Sowe", "Amir Hadziahmetovic", "Khouma Babacar"] }
];

const positions = ["Kaleci", "Stoper", "Stoper", "Sağ Bek", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Forvet Arkası", "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet", "Orta Saha", "Stoper", "Sol Bek", "Ön Libero", "Sağ Kanat"];
const roles = ["classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"];
const mentalTraits = ["elite", "aggressive", "fragile", "classic"];
const players = [];

teams.forEach(team => {
    let powerBase = 65;
    if (team.budget >= 70) powerBase = 79;
    else if (team.budget >= 50) powerBase = 74;
    else if (team.budget >= 30) powerBase = 70;
    
    team.players.forEach((playerName, i) => {
        const pos = positions[i % positions.length];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
        let power = powerBase + Math.floor(Math.random() * 8) - 4; 
        
        // Boost for very specific star players
        if (["Victor Osimhen", "Mauro Icardi", "Dusan Tadic", "Fred", "Rafa Silva", "Ciro Immobile", "Gabriel Sara", "Allan Saint-Maximin", "Youssef En-Nesyri", "Fernando Muslera", "Dominik Livakovic", "Gedson Fernandes"].includes(playerName)) {
            power += 5;
        }

        const speed = Math.floor(Math.random() * 5) + 5; 
        const age = Math.floor(Math.random() * 14) + 19; 
        const contractYears = Math.floor(Math.random() * 4) + 1;
        const id = playerName.toLowerCase().replace(/[^a-z0-9]/g, '') + "_" + team.id;

        players.push({ id, name: playerName, position: pos, power, speed, age, teamId: team.id, tacticalRole: role, mentalTrait: mental, contractYears, isListed: false });
    });
    delete team.players;
});

let fileContent = `// js/data_superlig.js\n// GERCEK 2026/2027 SUPER LIG VERILERI\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n`;
// Only remove existing trTeams
fileContent += `window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'superlig');\n`;
fileContent += `const trTeams = ${JSON.stringify(teams, null, 4)};\n`;
fileContent += `trTeams.forEach(t => window.leagueData.teams.push(t));\n`;
fileContent += `window.leagueData.players = window.leagueData.players.filter(p => !trTeams.some(t => t.id === p.teamId));\n`;
fileContent += `const trPlayers = ${JSON.stringify(players, null, 4)};\n`;
fileContent += `trPlayers.forEach(p => window.leagueData.players.push(p));\n`;
fs.writeFileSync('js/data_superlig.js', fileContent, 'utf-8');
console.log('Gercek Super Lig uretildi!');

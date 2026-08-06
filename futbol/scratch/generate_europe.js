const fs = require('fs');

// --- LA LIGA ---
const laligaTeams = [
    {id: "real_madrid", name: "Real Madrid", color: "#FFFFFF", budget: 100, city: "Madrid", leagueId: "laliga"},
    {id: "barcelona", name: "FC Barcelona", color: "#A90432", budget: 95, city: "Barcelona", leagueId: "laliga"},
    {id: "atletico_madrid", name: "Atletico Madrid", color: "#FF0000", budget: 85, city: "Madrid", leagueId: "laliga"},
    {id: "girona", name: "Girona FC", color: "#FF0000", budget: 75, city: "Girona", leagueId: "laliga"},
    {id: "athletic_bilbao", name: "Athletic Bilbao", color: "#FF0000", budget: 75, city: "Bilbao", leagueId: "laliga"},
    {id: "real_sociedad", name: "Real Sociedad", color: "#0000FF", budget: 75, city: "San Sebastian", leagueId: "laliga"},
    {id: "real_betis", name: "Real Betis", color: "#008000", budget: 70, city: "Sevilla", leagueId: "laliga"},
    {id: "villarreal", name: "Villarreal CF", color: "#FFFF00", budget: 70, city: "Villarreal", leagueId: "laliga"},
    {id: "valencia", name: "Valencia CF", color: "#FFFFFF", budget: 65, city: "Valencia", leagueId: "laliga"},
    {id: "alaves", name: "Deportivo Alavés", color: "#0000FF", budget: 60, city: "Vitoria", leagueId: "laliga"},
    {id: "osasuna", name: "CA Osasuna", color: "#FF0000", budget: 60, city: "Pamplona", leagueId: "laliga"},
    {id: "getafe", name: "Getafe CF", color: "#0000FF", budget: 60, city: "Getafe", leagueId: "laliga"},
    {id: "celta_vigo", name: "Celta Vigo", color: "#87CEEB", budget: 60, city: "Vigo", leagueId: "laliga"},
    {id: "sevilla", name: "Sevilla FC", color: "#FFFFFF", budget: 65, city: "Sevilla", leagueId: "laliga"},
    {id: "mallorca", name: "RCD Mallorca", color: "#FF0000", budget: 55, city: "Palma", leagueId: "laliga"},
    {id: "las_palmas", name: "UD Las Palmas", color: "#FFFF00", budget: 55, city: "Las Palmas", leagueId: "laliga"},
    {id: "rayo_vallecano", name: "Rayo Vallecano", color: "#FFFFFF", budget: 55, city: "Madrid", leagueId: "laliga"},
    {id: "leganes", name: "CD Leganés", color: "#0000FF", budget: 50, city: "Leganes", leagueId: "laliga"},
    {id: "valladolid", name: "Real Valladolid", color: "#800080", budget: 50, city: "Valladolid", leagueId: "laliga"},
    {id: "espanyol", name: "RCD Espanyol", color: "#0000FF", budget: 50, city: "Barcelona", leagueId: "laliga"}
];

const laligaPlayers = {
    "real_madrid": [
        "K. Mbappé|Santrfor|95|elite", "Vini Jr.|Sol Açık|93|elite", "J. Bellingham|10 Numara|92|elite",
        "F. Valverde|Merkez Orta Saha|89|elite", "Rodrygo|Sağ Açık|88|consistent", "E. Camavinga|Ön Libero|87|aggressive",
        "A. Tchouaméni|Ön Libero|87|consistent", "A. Rüdiger|Stoper|88|aggressive", "E. Militão|Stoper|87|consistent",
        "D. Carvajal|Sağ Bek|86|aggressive", "T. Courtois|Kaleci|91|elite", "F. Mendy|Sol Bek|84|consistent",
        "Brahim Diaz|10 Numara|84|creative", "A. Güler|10 Numara|82|creative", "Endrick|Santrfor|80|creative",
        "L. Modrić|Merkez Orta Saha|85|elite", "L. Vázquez|Sağ Bek|81|consistent", "A. Lunin|Kaleci|83|consistent",
        "D. Alaba|Stoper|85|consistent", "F. García|Sol Bek|80|consistent", "D. Ceballos|Merkez Orta Saha|81|consistent",
        "N. Paz|Merkez Orta Saha|75|creative", "J. Vallejo|Stoper|76|consistent", "Kepa|Kaleci|81|consistent"
    ],
    "barcelona": [
        "R. Lewandowski|Santrfor|91|elite", "Lamine Yamal|Sağ Açık|86|creative", "Pedri|Merkez Orta Saha|88|creative",
        "Gavi|Merkez Orta Saha|85|aggressive", "F. de Jong|Merkez Orta Saha|88|consistent", "İ. Gündoğan|Merkez Orta Saha|88|elite",
        "Raphinha|Sağ Açık|86|consistent", "Ferran Torres|Sol Açık|83|consistent", "J. Félix|Sol Açık|84|fragile",
        "A. Balde|Sol Bek|84|consistent", "R. Araújo|Stoper|88|aggressive", "J. Koundé|Sağ Bek|86|consistent",
        "P. Cubarsí|Stoper|81|creative", "M. ter Stegen|Kaleci|89|elite", "A. Christensen|Stoper|85|consistent",
        "Vitor Roque|Santrfor|80|creative", "F. López|10 Numara|81|creative", "I. Martinez|Stoper|82|consistent",
        "H. Fort|Sağ Bek|76|consistent", "M. Alonso|Sol Bek|79|consistent", "I. Pena|Kaleci|78|consistent",
        "M. Casado|Ön Libero|75|consistent", "O. Romeu|Ön Libero|79|consistent", "S. Roberto|Merkez Orta Saha|80|consistent"
    ]
};

// --- BUNDESLIGA ---
const bundesligaTeams = [
    {id: "bayern_munich", name: "Bayern Munich", color: "#FF0000", budget: 100, city: "Munich", leagueId: "bundesliga"},
    {id: "bayer_leverkusen", name: "Bayer Leverkusen", color: "#FF0000", budget: 85, city: "Leverkusen", leagueId: "bundesliga"},
    {id: "dortmund", name: "Borussia Dortmund", color: "#FFFF00", budget: 85, city: "Dortmund", leagueId: "bundesliga"},
    {id: "rb_leipzig", name: "RB Leipzig", color: "#FFFFFF", budget: 80, city: "Leipzig", leagueId: "bundesliga"},
    {id: "stuttgart", name: "VfB Stuttgart", color: "#FFFFFF", budget: 75, city: "Stuttgart", leagueId: "bundesliga"},
    {id: "eintracht_frankfurt", name: "Eintracht Frankfurt", color: "#000000", budget: 70, city: "Frankfurt", leagueId: "bundesliga"},
    {id: "hoffenheim", name: "TSG Hoffenheim", color: "#0000FF", budget: 65, city: "Sinsheim", leagueId: "bundesliga"},
    {id: "freiburg", name: "SC Freiburg", color: "#000000", budget: 65, city: "Freiburg", leagueId: "bundesliga"},
    {id: "heidenheim", name: "1. FC Heidenheim", color: "#FF0000", budget: 60, city: "Heidenheim", leagueId: "bundesliga"},
    {id: "werder_bremen", name: "Werder Bremen", color: "#008000", budget: 60, city: "Bremen", leagueId: "bundesliga"},
    {id: "augsburg", name: "FC Augsburg", color: "#FF0000", budget: 60, city: "Augsburg", leagueId: "bundesliga"},
    {id: "wolfsburg", name: "VfL Wolfsburg", color: "#008000", budget: 65, city: "Wolfsburg", leagueId: "bundesliga"},
    {id: "mainz_05", name: "Mainz 05", color: "#FF0000", budget: 60, city: "Mainz", leagueId: "bundesliga"},
    {id: "borussia_mg", name: "Borussia M'gladbach", color: "#FFFFFF", budget: 65, city: "Monchengladbach", leagueId: "bundesliga"},
    {id: "union_berlin", name: "Union Berlin", color: "#FF0000", budget: 60, city: "Berlin", leagueId: "bundesliga"},
    {id: "bochum", name: "VfL Bochum", color: "#0000FF", budget: 55, city: "Bochum", leagueId: "bundesliga"},
    {id: "st_pauli", name: "FC St. Pauli", color: "#8B4513", budget: 55, city: "Hamburg", leagueId: "bundesliga"},
    {id: "holstein_kiel", name: "Holstein Kiel", color: "#0000FF", budget: 50, city: "Kiel", leagueId: "bundesliga"}
];

const bundesligaPlayers = {
    "bayern_munich": [
        "H. Kane|Santrfor|92|elite", "J. Musiala|10 Numara|90|elite", "L. Sané|Sağ Açık|88|consistent",
        "J. Kimmich|Ön Libero|89|elite", "L. Goretzka|Merkez Orta Saha|86|aggressive", "A. Davies|Sol Bek|87|creative",
        "M. Neuer|Kaleci|89|elite", "M. de Ligt|Stoper|86|consistent", "D. Upamecano|Stoper|85|aggressive",
        "K. Coman|Sol Açık|86|fragile", "T. Müller|10 Numara|85|elite", "K. Laimer|Ön Libero|83|aggressive",
        "A. Pavlović|Ön Libero|81|consistent", "M. Tel|Santrfor|80|creative", "S. Gnabry|Sağ Açık|84|fragile",
        "E. Dier|Stoper|82|consistent", "Raphaël Guerreiro|Sol Bek|84|creative", "S. Ulreich|Kaleci|76|consistent",
        "C. Gnabry|Sağ Açık|84|consistent", "S. Boey|Sağ Bek|81|aggressive", "N. Mazraoui|Sağ Bek|83|consistent",
        "Bryan Zaragoza|Sol Açık|79|creative", "D. Peretz|Kaleci|75|consistent", "T. Buchmann|Stoper|70|consistent"
    ]
};

// --- LIGUE 1 ---
const ligue1Teams = [
    {id: "psg", name: "Paris SG", color: "#000080", budget: 100, city: "Paris", leagueId: "ligue1"},
    {id: "monaco", name: "AS Monaco", color: "#FF0000", budget: 85, city: "Monaco", leagueId: "ligue1"},
    {id: "marseille", name: "O. Marseille", color: "#87CEEB", budget: 80, city: "Marseille", leagueId: "ligue1"},
    {id: "lille", name: "Lille OSC", color: "#FF0000", budget: 75, city: "Lille", leagueId: "ligue1"},
    {id: "lens", name: "RC Lens", color: "#FFFF00", budget: 75, city: "Lens", leagueId: "ligue1"},
    {id: "rennes", name: "Stade Rennais", color: "#FF0000", budget: 75, city: "Rennes", leagueId: "ligue1"},
    {id: "lyon", name: "O. Lyon", color: "#FFFFFF", budget: 75, city: "Lyon", leagueId: "ligue1"},
    {id: "nice", name: "OGC Nice", color: "#FF0000", budget: 75, city: "Nice", leagueId: "ligue1"},
    {id: "reims", name: "Stade Reims", color: "#FF0000", budget: 65, city: "Reims", leagueId: "ligue1"},
    {id: "toulouse", name: "Toulouse FC", color: "#800080", budget: 65, city: "Toulouse", leagueId: "ligue1"},
    {id: "brest", name: "Stade Brestois", color: "#FF0000", budget: 70, city: "Brest", leagueId: "ligue1"},
    {id: "montpellier", name: "Montpellier HSC", color: "#0000FF", budget: 60, city: "Montpellier", leagueId: "ligue1"},
    {id: "strasbourg", name: "Strasbourg", color: "#0000FF", budget: 60, city: "Strasbourg", leagueId: "ligue1"},
    {id: "nantes", name: "FC Nantes", color: "#FFFF00", budget: 60, city: "Nantes", leagueId: "ligue1"},
    {id: "le_havre", name: "Le Havre AC", color: "#000080", budget: 55, city: "Le Havre", leagueId: "ligue1"},
    {id: "auxerre", name: "AJ Auxerre", color: "#FFFFFF", budget: 55, city: "Auxerre", leagueId: "ligue1"},
    {id: "angers", name: "Angers SCO", color: "#000000", budget: 50, city: "Angers", leagueId: "ligue1"},
    {id: "saint_etienne", name: "Saint-Étienne", color: "#008000", budget: 55, city: "Saint-Etienne", leagueId: "ligue1"}
];

const ligue1Players = {
    "psg": [
        "O. Dembélé|Sağ Açık|88|creative", "G. Ramos|Santrfor|85|consistent", "W. Zaïre-Emery|Merkez Orta Saha|86|creative",
        "Vitinha|Merkez Orta Saha|87|consistent", "Marquinhos|Stoper|88|elite", "G. Donnarumma|Kaleci|89|elite",
        "A. Hakimi|Sağ Bek|87|aggressive", "N. Mendes|Sol Bek|85|creative", "L. Hernández|Stoper|85|aggressive",
        "R. Kolo Muani|Santrfor|84|consistent", "B. Barcola|Sol Açık|83|creative", "F. Ruiz|Merkez Orta Saha|84|consistent",
        "M. Ugarte|Ön Libero|83|aggressive", "M. Škriniar|Stoper|84|consistent", "L. Beraldo|Stoper|81|consistent",
        "K. Lee|Sağ Açık|82|creative", "M. Asensio|10 Numara|82|fragile", "C. Soler|Merkez Orta Saha|81|consistent",
        "K. Navas|Kaleci|82|consistent", "A. Tenas|Kaleci|76|consistent", "Y. Zague|Sağ Bek|74|consistent",
        "S. Mayulu|10 Numara|73|creative", "D. Pereira|Ön Libero|83|consistent", "N. Mukiele|Sağ Bek|80|consistent"
    ]
};

// --- SERIE A ---
const serieaTeams = [
    {id: "inter", name: "Inter Milan", color: "#0000FF", budget: 95, city: "Milan", leagueId: "seriea"},
    {id: "ac_milan", name: "AC Milan", color: "#FF0000", budget: 90, city: "Milan", leagueId: "seriea"},
    {id: "juventus", name: "Juventus", color: "#000000", budget: 90, city: "Turin", leagueId: "seriea"},
    {id: "napoli", name: "Napoli", color: "#87CEEB", budget: 85, city: "Naples", leagueId: "seriea"},
    {id: "roma", name: "AS Roma", color: "#800000", budget: 85, city: "Rome", leagueId: "seriea"},
    {id: "atalanta", name: "Atalanta", color: "#0000FF", budget: 80, city: "Bergamo", leagueId: "seriea"},
    {id: "bologna", name: "Bologna", color: "#000080", budget: 75, city: "Bologna", leagueId: "seriea"},
    {id: "lazio", name: "Lazio", color: "#87CEEB", budget: 80, city: "Rome", leagueId: "seriea"},
    {id: "fiorentina", name: "Fiorentina", color: "#800080", budget: 75, city: "Florence", leagueId: "seriea"},
    {id: "torino", name: "Torino", color: "#800000", budget: 70, city: "Turin", leagueId: "seriea"},
    {id: "genoa", name: "Genoa", color: "#000080", budget: 65, city: "Genoa", leagueId: "seriea"},
    {id: "monza", name: "Monza", color: "#FF0000", budget: 65, city: "Monza", leagueId: "seriea"},
    {id: "lecce", name: "Lecce", color: "#FFFF00", budget: 60, city: "Lecce", leagueId: "seriea"},
    {id: "udinese", name: "Udinese", color: "#000000", budget: 60, city: "Udine", leagueId: "seriea"},
    {id: "empoli", name: "Empoli", color: "#0000FF", budget: 60, city: "Empoli", leagueId: "seriea"},
    {id: "cagliari", name: "Cagliari", color: "#000080", budget: 60, city: "Cagliari", leagueId: "seriea"},
    {id: "hellas_verona", name: "Hellas Verona", color: "#FFFF00", budget: 60, city: "Verona", leagueId: "seriea"},
    {id: "parma", name: "Parma", color: "#FFFF00", budget: 55, city: "Parma", leagueId: "seriea"},
    {id: "como", name: "Como", color: "#0000FF", budget: 55, city: "Como", leagueId: "seriea"},
    {id: "venezia", name: "Venezia", color: "#FFA500", budget: 50, city: "Venice", leagueId: "seriea"}
];

const serieaPlayers = {
    "inter": [
        "L. Martínez|Santrfor|91|elite", "M. Thuram|Santrfor|86|aggressive", "H. Çalhanoğlu|Merkez Orta Saha|88|elite",
        "N. Barella|Merkez Orta Saha|89|elite", "A. Bastoni|Stoper|87|elite", "F. Dimarco|Sol Bek|86|creative",
        "D. Dumfries|Sağ Bek|84|aggressive", "Y. Sommer|Kaleci|86|consistent", "B. Pavard|Stoper|85|consistent",
        "H. Mkhitaryan|Merkez Orta Saha|84|consistent", "F. Acerbi|Stoper|83|consistent", "D. Frattesi|Merkez Orta Saha|83|aggressive",
        "S. de Vrij|Stoper|82|consistent", "Carlos Augusto|Sol Bek|81|consistent", "M. Arnautovic|Santrfor|80|consistent",
        "A. Sánchez|Santrfor|81|creative", "K. Asllani|Ön Libero|79|creative", "Y. Bisseck|Stoper|78|aggressive",
        "E. Audero|Kaleci|78|consistent", "T. Buchanan|Sağ Bek|79|creative", "M. Darmian|Sağ Bek|81|consistent",
        "J. Cuadrado|Sağ Açık|80|fragile", "R. Di Gennaro|Kaleci|72|consistent", "D. Klaassen|10 Numara|78|consistent"
    ]
};

// Generics
const firstNames = {
    "es": ["Pablo", "Alejandro", "Javier", "Carlos", "Sergio", "Jorge", "Raul", "David", "Jose", "Diego", "Luis", "Pedro", "Juan", "Antonio", "Fernando"],
    "de": ["Thomas", "Michael", "Andreas", "Christian", "Stefan", "Lukas", "Leon", "Maximilian", "Felix", "Jonas", "Niklas", "Tim", "Jan", "Florian", "Timo"],
    "fr": ["Hugo", "Lucas", "Arthur", "Louis", "Pierre", "Antoine", "Jules", "Paul", "Maxime", "Romain", "Clement", "Nicolas", "Julien", "Alexandre", "Kylian"],
    "it": ["Marco", "Alessandro", "Giuseppe", "Francesco", "Antonio", "Giovanni", "Luigi", "Lorenzo", "Matteo", "Leonardo", "Andrea", "Riccardo", "Luca", "Davide", "Mattia"]
};
const lastNames = {
    "es": ["Garcia", "Fernandez", "Gonzalez", "Rodriguez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Ruiz", "Hernandez", "Diaz", "Moreno", "Alvarez"],
    "de": ["Muller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Bauer", "Richter", "Klein", "Wolf"],
    "fr": ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefevre", "Leroy", "Roux"],
    "it": ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini"]
};

function genName(lang) {
    return firstNames[lang][Math.floor(Math.random() * firstNames[lang].length)] + " " + lastNames[lang][Math.floor(Math.random() * lastNames[lang].length)];
}

const roles = ["Kaleci", "Kaleci", "Sağ Bek", "Sol Bek", "Stoper", "Stoper", "Ön Libero", "Merkez Orta Saha", "10 Numara", "Sağ Açık", "Sol Açık", "Santrfor", "Santrfor"];
const traits = ["elite", "aggressive", "fragile", "consistent", "creative"];

let globalPlayerId = 60000;

function createLeagueDB(teams, specificPlayers, langCode, varNameTeams, varNamePlayers, filename) {
    let leaguePlayers = [];
    
    for (let team of teams) {
        let tid = team.id;
        let t_pow = team.budget + 5; 
        
        if (specificPlayers[tid]) {
            for (let pStr of specificPlayers[tid]) {
                let [name, pos, powStr, tr] = pStr.split('|');
                leaguePlayers.push({
                    "id": globalPlayerId++, "teamId": tid, "name": name,
                    "age": Math.floor(Math.random() * 12) + 21, "position": pos,
                    "power": parseInt(powStr), "speed": parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
                    "mentalTrait": tr, "tacticalRole": "classic", "contractYears": Math.floor(Math.random() * 4) + 1
                });
            }
        } else {
            for (let i = 0; i < 24; i++) {
                let pos = roles[i % roles.length];
                leaguePlayers.push({
                    "id": globalPlayerId++, "teamId": tid, "name": genName(langCode),
                    "age": Math.floor(Math.random() * 13) + 21, "position": pos,
                    "power": t_pow + Math.floor(Math.random() * 10) - 5,
                    "speed": parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
                    "mentalTrait": traits[Math.floor(Math.random() * traits.length)],
                    "tacticalRole": "classic", "contractYears": Math.floor(Math.random() * 4) + 1
                });
            }
        }
    }
    
    const js_content = `// ${varNameTeams} VERITABANI
const ${varNameTeams} = ${JSON.stringify(teams, null, 4)};
const ${varNamePlayers} = ${JSON.stringify(leaguePlayers, null, 4)};

if (window.leagueData) {
    // Clear old ones if exists (especially for seriea which might be there)
    window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== '${teams[0].leagueId}');
    window.leagueData.players = window.leagueData.players.filter(p => !${varNameTeams}.some(tt => tt.id === p.teamId));
    
    window.leagueData.teams.push(...${varNameTeams});
    window.leagueData.players.push(...${varNamePlayers});
}
`;

    fs.writeFileSync(filename, js_content, 'utf-8');
    console.log(filename + " created successfully!");
}

createLeagueDB(laligaTeams, laligaPlayers, "es", "laLigaTeams", "laLigaPlayers", "js/data_laliga.js");
createLeagueDB(bundesligaTeams, bundesligaPlayers, "de", "bundesligaTeams", "bundesligaPlayers", "js/data_bundesliga.js");
createLeagueDB(ligue1Teams, ligue1Players, "fr", "ligue1Teams", "ligue1Players", "js/data_ligue1.js");
createLeagueDB(serieaTeams, serieaPlayers, "it", "serieATeams", "serieAPlayers", "js/data_seriea.js");

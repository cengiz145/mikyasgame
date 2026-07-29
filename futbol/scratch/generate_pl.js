const fs = require('fs');

const teams = [
    {"id": "mancity", "leagueId": "premier", "name": "Manchester City", "budget": 95},
    {"id": "arsenal", "leagueId": "premier", "name": "Arsenal", "budget": 85},
    {"id": "liverpool", "leagueId": "premier", "name": "Liverpool", "budget": 85},
    {"id": "chelsea", "leagueId": "premier", "name": "Chelsea", "budget": 80},
    {"id": "manutd", "leagueId": "premier", "name": "Manchester United", "budget": 80},
    {"id": "tottenham", "leagueId": "premier", "name": "Tottenham Hotspur", "budget": 75},
    {"id": "newcastle", "leagueId": "premier", "name": "Newcastle United", "budget": 75},
    {"id": "astonvilla", "leagueId": "premier", "name": "Aston Villa", "budget": 70},
    {"id": "westham", "leagueId": "premier", "name": "West Ham United", "budget": 65},
    {"id": "brighton", "leagueId": "premier", "name": "Brighton & Hove Albion", "budget": 65},
    {"id": "crystalpalace", "leagueId": "premier", "name": "Crystal Palace", "budget": 60},
    {"id": "fulham", "leagueId": "premier", "name": "Fulham", "budget": 55},
    {"id": "brentford", "leagueId": "premier", "name": "Brentford", "budget": 50},
    {"id": "everton", "leagueId": "premier", "name": "Everton", "budget": 50},
    {"id": "wolves", "leagueId": "premier", "name": "Wolverhampton", "budget": 50},
    {"id": "bournemouth", "leagueId": "premier", "name": "Bournemouth", "budget": 45},
    {"id": "nforest", "leagueId": "premier", "name": "Nottingham Forest", "budget": 45},
    {"id": "leicester", "leagueId": "premier", "name": "Leicester City", "budget": 40},
    {"id": "southampton", "leagueId": "premier", "name": "Southampton", "budget": 40},
    {"id": "ipswich", "leagueId": "premier", "name": "Ipswich Town", "budget": 35}
];

const team_players = {
    "mancity": [
        {"name": "E. Haaland", "pos": "Santrfor", "pow": 95, "tr": "elite"},
        {"name": "K. De Bruyne", "pos": "Maestro", "pow": 93, "tr": "elite"},
        {"name": "P. Foden", "pos": "Sağ Açık", "pow": 90, "tr": "elite"},
        {"name": "Rodri", "pos": "Ön Libero", "pow": 94, "tr": "elite"},
        {"name": "B. Silva", "pos": "Sağ Açık", "pow": 89, "tr": "elite"},
        {"name": "Ruben Dias", "pos": "Stoper", "pow": 90, "tr": "aggressive"},
        {"name": "J. Stones", "pos": "Stoper", "pow": 88, "tr": "consistent"},
        {"name": "K. Walker", "pos": "Sağ Bek", "pow": 86, "tr": "aggressive"},
        {"name": "J. Gvardiol", "pos": "Sol Bek", "pow": 87, "tr": "consistent"},
        {"name": "Ederson", "pos": "Kaleci", "pow": 89, "tr": "elite"},
        {"name": "J. Doku", "pos": "Sol Açık", "pow": 85, "tr": "creative"},
        {"name": "M. Akanji", "pos": "Stoper", "pow": 86, "tr": "consistent"}
    ],
    "arsenal": [
        {"name": "B. Saka", "pos": "Sağ Açık", "pow": 91, "tr": "elite"},
        {"name": "M. Odegaard", "pos": "Maestro", "pow": 90, "tr": "elite"},
        {"name": "D. Rice", "pos": "Ön Libero", "pow": 89, "tr": "consistent"},
        {"name": "W. Saliba", "pos": "Stoper", "pow": 89, "tr": "elite"},
        {"name": "Gabriel", "pos": "Stoper", "pow": 87, "tr": "aggressive"},
        {"name": "G. Martinelli", "pos": "Sol Açık", "pow": 86, "tr": "creative"},
        {"name": "K. Havertz", "pos": "Gizli Forvet", "pow": 85, "tr": "fragile"},
        {"name": "B. White", "pos": "Sağ Bek", "pow": 85, "tr": "consistent"},
        {"name": "O. Zinchenko", "pos": "Sol Bek", "pow": 82, "tr": "fragile"},
        {"name": "David Raya", "pos": "Kaleci", "pow": 86, "tr": "consistent"},
        {"name": "L. Trossard", "pos": "Sol Kanat", "pow": 84, "tr": "consistent"},
        {"name": "J. Timber", "pos": "Stoper", "pow": 83, "tr": "consistent"}
    ],
    "liverpool": [
        {"name": "M. Salah", "pos": "Sağ Açık", "pow": 92, "tr": "elite"},
        {"name": "V. van Dijk", "pos": "Stoper", "pow": 91, "tr": "elite"},
        {"name": "Alisson", "pos": "Kaleci", "pow": 90, "tr": "elite"},
        {"name": "T. Alexander-Arnold", "pos": "Sağ Bek", "pow": 88, "tr": "creative"},
        {"name": "A. Mac Allister", "pos": "Merkez Orta Saha", "pow": 87, "tr": "consistent"},
        {"name": "D. Jota", "pos": "Santrfor", "pow": 86, "tr": "aggressive"},
        {"name": "L. Diaz", "pos": "Sol Açık", "pow": 87, "tr": "creative"},
        {"name": "D. Szoboszlai", "pos": "10 Numara", "pow": 85, "tr": "creative"},
        {"name": "I. Konate", "pos": "Stoper", "pow": 85, "tr": "aggressive"},
        {"name": "A. Robertson", "pos": "Sol Bek", "pow": 86, "tr": "aggressive"},
        {"name": "C. Gakpo", "pos": "Sol Açık", "pow": 84, "tr": "consistent"},
        {"name": "H. Elliott", "pos": "Merkez Orta Saha", "pow": 82, "tr": "fragile"}
    ],
    "chelsea": [
        {"name": "C. Palmer", "pos": "10 Numara", "pow": 89, "tr": "elite"},
        {"name": "E. Fernandez", "pos": "Merkez Orta Saha", "pow": 86, "tr": "consistent"},
        {"name": "R. James", "pos": "Sağ Bek", "pow": 87, "tr": "fragile"},
        {"name": "C. Nkunku", "pos": "Santrfor", "pow": 85, "tr": "fragile"},
        {"name": "N. Jackson", "pos": "Santrfor", "pow": 83, "tr": "aggressive"},
        {"name": "M. Caicedo", "pos": "Ön Libero", "pow": 84, "tr": "aggressive"},
        {"name": "L. Colwill", "pos": "Stoper", "pow": 82, "tr": "consistent"},
        {"name": "R. Sterling", "pos": "Sol Kanat", "pow": 83, "tr": "consistent"},
        {"name": "B. Chilwell", "pos": "Sol Bek", "pow": 82, "tr": "fragile"},
        {"name": "Thiago Silva", "pos": "Stoper", "pow": 84, "tr": "elite"},
        {"name": "R. Sanchez", "pos": "Kaleci", "pow": 81, "tr": "consistent"},
        {"name": "M. Mudryk", "pos": "Sol Açık", "pow": 80, "tr": "fragile"}
    ],
    "manutd": [
        {"name": "B. Fernandes", "pos": "10 Numara", "pow": 89, "tr": "elite"},
        {"name": "M. Rashford", "pos": "Sol Açık", "pow": 86, "tr": "fragile"},
        {"name": "Casemiro", "pos": "Ön Libero", "pow": 85, "tr": "aggressive"},
        {"name": "L. Martinez", "pos": "Stoper", "pow": 86, "tr": "aggressive"},
        {"name": "R. Hojlund", "pos": "Santrfor", "pow": 83, "tr": "aggressive"},
        {"name": "K. Mainoo", "pos": "Merkez Orta Saha", "pow": 82, "tr": "creative"},
        {"name": "A. Garnacho", "pos": "Sağ Açık", "pow": 83, "tr": "creative"},
        {"name": "L. Shaw", "pos": "Sol Bek", "pow": 84, "tr": "fragile"},
        {"name": "D. Dalot", "pos": "Sağ Bek", "pow": 83, "tr": "consistent"},
        {"name": "A. Onana", "pos": "Kaleci", "pow": 84, "tr": "consistent"},
        {"name": "M. Mount", "pos": "10 Numara", "pow": 81, "tr": "fragile"},
        {"name": "H. Maguire", "pos": "Stoper", "pow": 80, "tr": "consistent"}
    ],
    "tottenham": [
        {"name": "H. Son", "pos": "Sol Açık", "pow": 90, "tr": "elite"},
        {"name": "J. Maddison", "pos": "10 Numara", "pow": 86, "tr": "creative"},
        {"name": "C. Romero", "pos": "Stoper", "pow": 86, "tr": "aggressive"},
        {"name": "M. van de Ven", "pos": "Stoper", "pow": 84, "tr": "consistent"},
        {"name": "D. Kulusevski", "pos": "Sağ Açık", "pow": 84, "tr": "consistent"},
        {"name": "P. Porro", "pos": "Sağ Bek", "pow": 83, "tr": "aggressive"},
        {"name": "D. Udogie", "pos": "Sol Bek", "pow": 83, "tr": "consistent"},
        {"name": "G. Vicario", "pos": "Kaleci", "pow": 85, "tr": "consistent"},
        {"name": "Y. Bissouma", "pos": "Ön Libero", "pow": 83, "tr": "consistent"},
        {"name": "Richarlison", "pos": "Santrfor", "pow": 82, "tr": "aggressive"},
        {"name": "B. Johnson", "pos": "Sağ Açık", "pow": 81, "tr": "creative"},
        {"name": "P. Sarr", "pos": "Merkez Orta Saha", "pow": 81, "tr": "consistent"}
    ],
    "newcastle": [
        {"name": "A. Isak", "pos": "Santrfor", "pow": 86, "tr": "elite"},
        {"name": "B. Guimaraes", "pos": "Merkez Orta Saha", "pow": 87, "tr": "elite"},
        {"name": "A. Gordon", "pos": "Sol Açık", "pow": 85, "tr": "aggressive"},
        {"name": "K. Trippier", "pos": "Sağ Bek", "pow": 84, "tr": "consistent"},
        {"name": "S. Botman", "pos": "Stoper", "pow": 84, "tr": "consistent"},
        {"name": "F. Schar", "pos": "Stoper", "pow": 82, "tr": "aggressive"},
        {"name": "N. Pope", "pos": "Kaleci", "pow": 83, "tr": "consistent"},
        {"name": "Joelinton", "pos": "Merkez Orta Saha", "pow": 83, "tr": "aggressive"},
        {"name": "H. Barnes", "pos": "Sol Açık", "pow": 82, "tr": "creative"},
        {"name": "D. Burn", "pos": "Sol Bek", "pow": 80, "tr": "consistent"},
        {"name": "C. Wilson", "pos": "Santrfor", "pow": 81, "tr": "fragile"},
        {"name": "S. Tonali", "pos": "Ön Libero", "pow": 84, "tr": "consistent"}
    ],
    "astonvilla": [
        {"name": "O. Watkins", "pos": "Santrfor", "pow": 85, "tr": "elite"},
        {"name": "E. Martinez", "pos": "Kaleci", "pow": 87, "tr": "aggressive"},
        {"name": "D. Luiz", "pos": "Merkez Orta Saha", "pow": 84, "tr": "consistent"},
        {"name": "L. Bailey", "pos": "Sağ Açık", "pow": 83, "tr": "creative"},
        {"name": "J. McGinn", "pos": "Merkez Orta Saha", "pow": 83, "tr": "aggressive"},
        {"name": "P. Torres", "pos": "Stoper", "pow": 83, "tr": "consistent"},
        {"name": "E. Konsa", "pos": "Stoper", "pow": 82, "tr": "consistent"},
        {"name": "M. Cash", "pos": "Sağ Bek", "pow": 80, "tr": "aggressive"},
        {"name": "L. Digne", "pos": "Sol Bek", "pow": 80, "tr": "consistent"},
        {"name": "B. Kamara", "pos": "Ön Libero", "pow": 82, "tr": "consistent"},
        {"name": "Y. Tielemans", "pos": "Merkez Orta Saha", "pow": 81, "tr": "creative"},
        {"name": "J. Ramsey", "pos": "Sol Açık", "pow": 80, "tr": "fragile"}
    ]
};

const names = ["M. Smith", "J. Taylor", "L. Brown", "T. Davies", "A. Wilson", "S. Evans", "J. Thomas", "O. Johnson", "C. Roberts", "W. Walker", "H. Wright", "F. Robinson", "G. Thompson", "E. White", "B. Hughes"];
const roles = ["Kaleci", "Sağ Bek", "Sol Bek", "Stoper", "Stoper", "Ön Libero", "Merkez Orta Saha", "10 Numara", "Sağ Açık", "Sol Açık", "Santrfor", "Gizli Forvet"];
const traits = ["elite", "aggressive", "fragile", "consistent", "creative"];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const players = [];
let player_id = 20000;

for (let team of teams) {
    let tid = team.id;
    let t_power = team.budget + 10;
    
    if (team_players[tid]) {
        for (let p of team_players[tid]) {
            players.push({
                "id": player_id++,
                "teamId": tid,
                "name": p.name,
                "age": randomInt(21, 33),
                "position": p.pos,
                "power": p.pow,
                "speed": parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
                "mentalTrait": p.tr,
                "tacticalRole": "classic",
                "contractYears": randomInt(1, 4)
            });
        }
    } else {
        for (let i = 0; i < 12; i++) {
            let pos = roles[i % roles.length];
            let base_pow = randomInt(t_power - 5, t_power + 5);
            players.push({
                "id": player_id++,
                "teamId": tid,
                "name": names[randomInt(0, names.length-1)] + " " + i,
                "age": randomInt(21, 33),
                "position": pos,
                "power": base_pow,
                "speed": parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
                "mentalTrait": traits[randomInt(0, traits.length-1)],
                "tacticalRole": "classic",
                "contractYears": randomInt(1, 4)
            });
        }
    }
}

const js_content = `// İNGİLTERE PREMIER LİG VERİTABANI
const premierTeams = ${JSON.stringify(teams, null, 4)};

const premierPlayers = ${JSON.stringify(players, null, 4)};

// Ana veritabanına ekle
if (window.leagueData) {
    window.leagueData.teams.push(...premierTeams);
    window.leagueData.players.push(...premierPlayers);
}
`;

fs.writeFileSync('js/data_premier.js', js_content, 'utf-8');
console.log('data_premier.js generated successfully!');

window.leagueData = window.leagueData || { teams: [], players: [] };

// MLS (Amerika) verileri
window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'mls');

const mlsTeams = [
    {
        "id": "intermiami",
        "name": "Inter Miami CF",
        "leagueId": "mls",
        "power": 82,
        "tactics": "offensive",
        "colors": {
            "home": { "primary": "#F7B5CD", "secondary": "#000000" }, // Pink and Black
            "away": { "primary": "#000000", "secondary": "#F7B5CD" }
        }
    }
];

mlsTeams.forEach(t => window.leagueData.teams.push(t));

window.leagueData.players = window.leagueData.players.filter(p => !mlsTeams.some(t => t.id === p.teamId));

const mlsPlayers = [
    {
        "id": "lionelmessi_miami",
        "name": "Lionel Messi",
        "position": "Sağ Kanat",
        "power": 91,
        "speed": 7,
        "age": 37,
        "teamId": "intermiami",
        "tacticalRole": "playmaker",
        "mentalTrait": "elite",
        "contractYears": 2,
        "isListed": false
    },
    {
        "id": "luissuarez_miami",
        "name": "Luis Suarez",
        "position": "Forvet",
        "power": 84,
        "speed": 6,
        "age": 37,
        "teamId": "intermiami",
        "tacticalRole": "target_man",
        "mentalTrait": "aggressive",
        "contractYears": 1,
        "isListed": false
    },
    {
        "id": "sergiobusquets_miami",
        "name": "Sergio Busquets",
        "position": "Ön Libero",
        "power": 83,
        "speed": 5,
        "age": 36,
        "teamId": "intermiami",
        "tacticalRole": "anchor",
        "mentalTrait": "elite",
        "contractYears": 2,
        "isListed": false
    },
    {
        "id": "jordialba_miami",
        "name": "Jordi Alba",
        "position": "Sol Bek",
        "power": 82,
        "speed": 7,
        "age": 35,
        "teamId": "intermiami",
        "tacticalRole": "offensive_back",
        "mentalTrait": "leader",
        "contractYears": 2,
        "isListed": false
    },
    {
        "id": "casemiro_miami",
        "name": "Casemiro",
        "position": "Ön Libero",
        "power": 81,
        "speed": 7,
        "age": 28,
        "teamId": "intermiami",
        "tacticalRole": "target_man",
        "mentalTrait": "elite",
        "contractYears": 3,
        "isListed": false
    }
];;

mlsPlayers.forEach(p => window.leagueData.players.push(p));

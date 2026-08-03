const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let content = fs.readFileSync(dataFile, 'utf8');

const tff1Ids = [
    "kocaelispor", "genclerbirligi", "erzurumspor", "amed", "corum",
    "ankaragucu", "karagumruk", "pendikspor", "istanbulspor", "bandirmaspor",
    "boluspor", "keciorengucu", "manisa", "sanliurfa", "igdir",
    "erokspor", "malatya", "sakaryaspor", "adanaspor", "umraniyespor"
];

const serieAIds = [
    "juventus", "inter", "ac_milan", "napoli",
    "roma", "como", "atalanta", "bologna", "lazio", "udinese",
    "sassuolo", "torino", "parma", "cagliari", "fiorentina",
    "genoa", "lecce", "venezia", "empoli", "hellas verona"
];

const superligIds = [
    "galatasaray", "fenerbahce", "besiktas", "trabzonspor", "basaksehir",
    "kasimpasa", "alanyaspor", "konyaspor", "rizespor", "gaziantep",
    "samsunspor", "goztepe", "eyupspor"
];

const championsIds = [
    "real_madrid", "barcelona", "man_city", "arsenal", "bayern_munich",
    "psg", "liverpool", "man_united", "chelsea", "tottenham",
    "newcastle", "atletico_madrid", "bayer_leverkusen", "aston_villa",
    "rb_leipzig", "bodo_glimt"
];

// Extract the teams array part and replace it
const teamsMatch = content.match(/teams:\s*\[([\s\S]*?)\]\s*,\s*players:/);
if (teamsMatch) {
    let teamsStr = '[' + teamsMatch[1] + ']';
    let teamsArr = eval(teamsStr);
    
    // Assign leagueIds
    teamsArr = teamsArr.map(team => {
        if (tff1Ids.includes(team.id)) {
            team.leagueId = "tff1";
        } else if (serieAIds.includes(team.id)) {
            team.leagueId = "seriea";
        } else if (superligIds.includes(team.id)) {
            team.leagueId = "superlig";
        } else if (championsIds.includes(team.id)) {
            team.leagueId = "champions";
        } else if (team.id === "free_agent") {
            team.leagueId = "free_agent";
        } else {
            // Default to superlig for any missed Turkish teams if any
            team.leagueId = "superlig";
        }
        return team;
    });

    // Format back to string
    let newTeamsStr = "teams: [\n";
    teamsArr.forEach(team => {
        newTeamsStr += `        { id: "${team.id}", name: "${team.name}", color: "${team.color}", budget: ${team.budget}`;
        if (team.city) newTeamsStr += `, city: "${team.city}"`;
        if (team.isWinterHazard) newTeamsStr += `, isWinterHazard: true`;
        newTeamsStr += `, leagueId: "${team.leagueId}" },\n`;
    });
    newTeamsStr += "    ],";
    
    content = content.replace(/teams:\s*\[[\s\S]*?\]\s*,/, newTeamsStr);
    fs.writeFileSync(dataFile, content, 'utf8');
    console.log("leagueId'ler eklendi.");
} else {
    console.log("teams dizisi bulunamadı.");
}

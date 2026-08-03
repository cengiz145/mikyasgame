const fs = require('fs');

const dataPath = 'js/data.js';
let content = fs.readFileSync(dataPath, 'utf8');

// Extract JSON part
let jsonMatch = content.match(/const leagueData = (\{[\s\S]*?\});\s*window\.leagueData/);
if (!jsonMatch) {
    console.error("Could not parse data.js");
    process.exit(1);
}

// Güvenli eval için fonksiyon sarmalayıcı (Çünkü JSON parse, obje anahtarlarında tırnak bekler)
let leagueData = eval('(' + jsonMatch[1] + ')');

const realValues = {
    // GS
    "Osimhen": 100, "Icardo": 15, "Sara": 18, "Torreiro": 15, "Sanchez": 18, "Jelert": 8, "Jakobs": 8, "Yilmaz": 20, "Bardakci": 9, "Muslero": 1, "Mertens": 2, "Akgun": 5,
    // FB
    "En-Nesyri": 22, "Maximin": 18, "Szymanski": 19, "Fred": 15, "Oosterwolde": 15, "Livakovic": 11, "Djiku": 9, "Becao": 8, "Amrabat": 22, "Tadic": 3, "Osayi": 8,
    // BJK
    "Gedson": 15, "Rafa": 14, "Musrati": 14, "Kilicsoy": 12, "Mert": 1, "Immobile": 4, "Rashica": 7, "Svensson": 3, "Paulista": 2, "Masuaku": 4, "Uduokhai": 7,
    // TS
    "Mendy": 10, "Cham": 6, "Uguncan": 8, "Banza": 16, "Savic": 2, "Denswil": 3, "Eren": 4, "Visca": 2, "Nwakaeme": 1,
    // Others
    "Manaj": 5, "Piatek": 6, "Figueiredo": 4, "Nazon": 3, "Sari": 4, "Michut": 2, "Mane": 2
};

leagueData.teams.forEach(team => {
    // Takım bazlı rastgele ortalama değerler
    let baseMin = 1;
    let baseMax = 3;
    if (["GS", "FB", "BJK"].includes(team.id)) { baseMin = 5; baseMax = 15; }
    else if (team.id === "TS") { baseMin = 3; baseMax = 8; }

    team.players.forEach(player => {
        if (realValues[player.name]) {
            player.value = realValues[player.name];
        } else {
            // Eğer özel bir değer verilmemişse, gücüne ve takımın büyüklüğüne göre gerçekçi bir rakam uydur
            let randomFactor = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
            player.value = randomFactor;
        }
    });
});

const newContent = const leagueData = ;\n\nwindow.leagueData = leagueData;;
fs.writeFileSync(dataPath, newContent, 'utf8');
console.log("Database updated successfully.");
const fs = require('fs');

const leagueFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\league.js';
let content = fs.readFileSync(leagueFile, 'utf8');

// Replace budget filter with leagueId filter in initLeague
content = content.replace(
    /let domesticTeams = leagueData\.teams\.filter\(t => t\.budget <= 50 && t\.id !== "free_agent"\)\.map\(t => t\.id\);/g,
    'let domesticTeams = leagueData.teams.filter(t => t.leagueId === (window.selectedLeague || "superlig")).map(t => t.id);'
);

// Add startNewGame function
const startNewGameCode = `
window.startNewGame = function(filteredTeams) {
    window.fixture = []; // reset fixture
    window.leagueTable = {}; // reset table
    window.currentWeek = 1;
    window.season = 1;
    
    // Check if league is empty (e.g. Serie B)
    if (filteredTeams.length === 0) {
        alert("Bu ligde henüz takım bulunmuyor!");
        return;
    }

    if (typeof window.initLeague === 'function') {
        window.initLeague();
    }
    
    if (typeof updateBudgetUI === 'function') updateBudgetUI();
    
    // Hide team select, show main menu
    const containers = document.querySelectorAll('.menu-container');
    containers.forEach(c => c.style.display = 'none');
    document.getElementById('main-menu-container').style.display = 'flex';
    
    if(typeof speak === 'function') speak("Kariyeriniz başladı. Başarılar dileriz.");
};
`;

if (!content.includes('window.startNewGame = function')) {
    content += '\n' + startNewGameCode;
    fs.writeFileSync(leagueFile, content, 'utf8');
    console.log("league.js güncellendi (startNewGame eklendi ve filtre düzeltildi).");
} else {
    fs.writeFileSync(leagueFile, content, 'utf8');
    console.log("league.js güncellendi (sadece filtre).");
}


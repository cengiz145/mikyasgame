const fs = require('fs');
const path = require('path');

const leaguePath = path.join(__dirname, '..', 'js', 'league.js');
let content = fs.readFileSync(leaguePath, 'latin1');

if (!content.includes('updateWorldRankingUI')) {
    const appendStr = `

// DÜNYA SIRALAMASI FONKSİYONLARI
function updateWorldRankingUI() {
    const container = document.getElementById('world-ranking-content');
    if (!container) return;

    // Tüm takımları birleştir
    let allTeams = [];
    if (window.leagueData && window.leagueData.teams) {
        allTeams = allTeams.concat(window.leagueData.teams);
    }
    if (window.worldRankingTeams) {
        allTeams = allTeams.concat(window.worldRankingTeams);
    }

    // free_agent takımını çıkar
    allTeams = allTeams.filter(t => t.id !== 'free_agent');

    // Takımları puana göre sırala (Büyükten küçüğe)
    allTeams.sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0));

    let html = '<div style="max-height: 500px; overflow-y: auto; padding-right: 10px;">';
    html += '<table style="width: 100%; text-align: left; color: white; border-collapse: collapse;">';
    html += '<tr style="border-bottom: 2px solid #8e44ad;">';
    html += '<th style="padding: 10px;">Sıra</th>';
    html += '<th style="padding: 10px;">Ülke</th>';
    html += '<th style="padding: 10px;">Takım</th>';
    html += '<th style="padding: 10px; text-align: right;">Puan</th>';
    html += '</tr>';

    allTeams.forEach((t, index) => {
        let isMyTeam = (t.id === window.myTeamId);
        let rowStyle = isMyTeam ? 'background: rgba(46, 204, 113, 0.3); font-weight: bold;' : '';
        // İlk 10 takım için altın sarısı
        if(index < 10 && !isMyTeam) rowStyle = 'background: rgba(241, 196, 15, 0.1);';

        let countryFlag = t.country ? t.country : (t.leagueId === 'superlig' ? 'Türkiye' : (t.leagueId === 'premier' ? 'İngiltere' : ''));
        
        html += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.1); ' + rowStyle + '">';
        html += '<td style="padding: 10px;">' + (index + 1) + '</td>';
        html += '<td style="padding: 10px; font-size:0.9em; opacity:0.8;">' + countryFlag + '</td>';
        html += '<td style="padding: 10px;">' + t.name + '</td>';
        html += '<td style="padding: 10px; text-align: right; color: #f1c40f;">' + (t.rankingPoints || 0) + '</td>';
        html += '</tr>';
    });

    html += '</table></div>';
    container.innerHTML = html;
}

// Oynanabilir takımlara varsayılan sıralama puanı atama (Eğer yoksa)
function initializeRankingPoints() {
    if (!window.leagueData || !window.leagueData.teams) return;
    window.leagueData.teams.forEach(t => {
        if (!t.rankingPoints && t.id !== 'free_agent') {
            // Gücüne orantılı bir başlangıç puanı ver
            let power = t.power || 60;
            t.rankingPoints = Math.floor((power - 40) * 80 + Math.random() * 500);
            if (t.rankingPoints < 0) t.rankingPoints = 50;
        }
    });
}

// Sadece bir kere çalıştır
initializeRankingPoints();
`;
    content += appendStr;
    fs.writeFileSync(leaguePath, content, 'latin1');
    console.log("league.js updated successfully.");
} else {
    console.log("updateWorldRankingUI already exists.");
}

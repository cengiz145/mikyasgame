const fs = require('fs');
const path = require('path');

const leaguePath = path.join(__dirname, '..', 'js', 'league.js');
let content = fs.readFileSync(leaguePath, 'latin1');

if (!content.includes('applyRankingPoints')) {
    const appendStr = `

// Sıralama puanı atama
window.applyRankingPoints = function(teamA_id, teamB_id, scoreA, scoreB) {
    let tA = window.leagueData.teams.find(t => t.id === teamA_id) || window.worldRankingTeams.find(t => t.id === teamA_id);
    let tB = window.leagueData.teams.find(t => t.id === teamB_id) || window.worldRankingTeams.find(t => t.id === teamB_id);
    
    if (!tA || !tB) return;
    if (tA.id === 'free_agent' || tB.id === 'free_agent') return;
    
    if (typeof tA.rankingPoints === 'undefined') tA.rankingPoints = tA.power * 50;
    if (typeof tB.rankingPoints === 'undefined') tB.rankingPoints = tB.power * 50;

    let pointsA = 0;
    let pointsB = 0;

    if (scoreA > scoreB) {
        pointsA = 30; // Galibiyet
        pointsB = -10;
    } else if (scoreA < scoreB) {
        pointsA = -10;
        pointsB = 30;
    } else {
        pointsA = 10; // Beraberlik
        pointsB = 10;
    }

    // Güç farkına göre bonus (Güçlü takımı yenerse ekstra puan)
    let powerDiff = (tB.power || 60) - (tA.power || 60);
    if (scoreA > scoreB && powerDiff > 5) {
        pointsA += powerDiff * 2; // Sürpriz galibiyet bonusu
        pointsB -= powerDiff;
    } else if (scoreB > scoreA && powerDiff < -5) {
        pointsB += Math.abs(powerDiff) * 2;
        pointsA -= Math.abs(powerDiff);
    }

    tA.rankingPoints += pointsA;
    tB.rankingPoints += pointsB;

    if (tA.rankingPoints < 0) tA.rankingPoints = 0;
    if (tB.rankingPoints < 0) tB.rankingPoints = 0;
};

// SimulateMatch'i override ederek arkada maç oynandığında puanları güncellemesini sağla
const originalSimulateMatch = window.simulateMatch;
window.simulateMatch = function(teamA, teamB) {
    let res = originalSimulateMatch(teamA, teamB);
    window.applyRankingPoints(teamA, teamB, res.scoreA, res.scoreB);
    return res;
};

// Sezon sonlarında arka plan takımlarını birbirleriyle simüle et ki sıralamaları değişsin
window.simulateWorldMatches = function() {
    if (!window.worldRankingTeams) return;
    for(let i=0; i<300; i++) {
        let idxA = Math.floor(Math.random() * window.worldRankingTeams.length);
        let idxB = Math.floor(Math.random() * window.worldRankingTeams.length);
        if(idxA !== idxB) {
            let tA = window.worldRankingTeams[idxA];
            let tB = window.worldRankingTeams[idxB];
            let scoreA = 0; let scoreB = 0;
            let pA = tA.power + Math.floor(Math.random()*20);
            let pB = tB.power + Math.floor(Math.random()*20);
            if (pA > pB + 10) { scoreA = 2; scoreB = 0; }
            else if (pB > pA + 10) { scoreB = 2; scoreA = 0; }
            else { scoreA = 1; scoreB = 1; }
            window.applyRankingPoints(tA.id, tB.id, scoreA, scoreB);
        }
    }
};
`;
    content += appendStr;
    fs.writeFileSync(leaguePath, content, 'latin1');
    console.log("league.js patched with ranking points logic.");
} else {
    console.log("league.js already has applyRankingPoints.");
}

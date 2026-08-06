const fs = require('fs');
const path = require('path');

const leaguePath = path.join(__dirname, '..', 'js', 'league.js');
let content = fs.readFileSync(leaguePath, 'latin1');

// Hedef: hatalı silinmiş kısmı bul ve yerine temiz kodu koy
// Şu anki dosyanın sonunda kalan kısım: "tA.rankingPoints += pointsA;"
// Bunun hemen önüne "window.applyRankingPoints = ..." tanımını yerleştirelim.

const searchStr = "tA.rankingPoints += pointsA;";

const newFunctionStart = `// Sıralama puanı atama
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

    // "Çifte puan" bonusları tamamen kaldırıldı.

    `;

if (content.includes("tA.rankingPoints += pointsA;")) {
    content = content.replace("tA.rankingPoints += pointsA;", newFunctionStart + "tA.rankingPoints += pointsA;");
    fs.writeFileSync(leaguePath, content, 'latin1');
    console.log("applyRankingPoints redefined properly.");
} else {
    console.log("Could not find the target string.");
}

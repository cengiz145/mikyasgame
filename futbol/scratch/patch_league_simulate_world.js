const fs = require('fs');
const path = require('path');

const leaguePath = path.join(__dirname, '..', 'js', 'league.js');
let content = fs.readFileSync(leaguePath, 'latin1');

if (!content.includes('simulateWorldMatches()')) {
    const searchStr = "function showNormalSeasonEndModal(champName, myRank, promotionDesc, fromPlayoff) {";
    const replaceStr = "function showNormalSeasonEndModal(champName, myRank, promotionDesc, fromPlayoff) {\n    if (typeof window.simulateWorldMatches === 'function') window.simulateWorldMatches();";

    const searchStrWin = "function showNormalSeasonEndModal(champName, myRank, promotionDesc, fromPlayoff) {\r\n";
    const replaceStrWin = "function showNormalSeasonEndModal(champName, myRank, promotionDesc, fromPlayoff) {\r\n    if (typeof window.simulateWorldMatches === 'function') window.simulateWorldMatches();\r\n";

    if (content.includes(searchStrWin)) {
        content = content.replace(searchStrWin, replaceStrWin);
    } else {
        content = content.replace(searchStr, replaceStr);
    }

    fs.writeFileSync(leaguePath, content, 'latin1');
    console.log("league.js patched with simulateWorldMatches.");
} else {
    console.log("league.js already has simulateWorldMatches.");
}

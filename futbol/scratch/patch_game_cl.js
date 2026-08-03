const fs = require('fs');
const path = require('path');

const gamePath = path.join(__dirname, '..', 'js', 'game.js');
let gameContent = fs.readFileSync(gamePath, 'utf8');

const endGameRegex = /function endGame\(\) \{([\s\S]*?)window\.currentWeek = \(window\.currentWeek \|\| 1\) \+ 1;/m;
const endGameRepl = `function endGame() {
    if (typeof window.applyRankingPoints === 'function') {
        window.applyRankingPoints(window.myTeamId, window.todayOpponent, window.playerScore, window.enemyScore);
    }
    gameActive = false;
    
    let isClMatch = (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId));
    
    if (isClMatch) {
        // CL maçında lig haftasını atlatma
        window.championsLeague.simulateBotMatches();
        window.championsLeague.updateStandings(
            window.isHomeMatch ? window.myTeamId : window.todayOpponent,
            window.isHomeMatch ? window.todayOpponent : window.myTeamId,
            window.isHomeMatch ? window.playerScore : window.enemyScore,
            window.isHomeMatch ? window.enemyScore : window.playerScore
        );
        window.championsLeague.finishMatchDay();
        
        // Devasa CL Ödülü (Örn: Galibiyete 2.8M Euro, Beraberliğe 900k)
        if (window.playerScore > window.enemyScore) {
            window.budget += 2800000;
            if(typeof speak === 'function') speak("Avrupa fatihi! Galibiyet primi olarak kasamıza 2.8 Milyon Euro girdi.");
        } else if (window.playerScore === window.enemyScore) {
            window.budget += 900000;
            if(typeof speak === 'function') speak("Avrupa'da puan puandır. 900 bin Euro beraberlik primi aldık.");
        }
    } else {
        window.currentWeek = (window.currentWeek || 1) + 1;
    }`;

gameContent = gameContent.replace(endGameRegex, endGameRepl);
fs.writeFileSync(gamePath, gameContent, 'utf8');
console.log("game.js patched for CL end match logic.");

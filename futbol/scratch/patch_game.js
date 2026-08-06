const fs = require('fs');
const path = require('path');

const gamePath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(gamePath, 'latin1');

if (!content.includes('applyRankingPoints')) {
    const searchStr = "if(typeof speak === 'function') speak(\"Maç sona erdi. Sonuç: Biz \" + playerScore + \" - \" + enemyScore + \" Rakip\");";
    const replaceStr = searchStr + "\n    \n    // [YENİ] Dünya Sıralaması Puanlarını Güncelle\n    if (typeof window.applyRankingPoints === 'function') {\n        window.applyRankingPoints(window.myTeamId, window.todayOpponent, playerScore, enemyScore);\n    }";

    const searchStrWin = "if(typeof speak === 'function') speak(\"Maç sona erdi. Sonuç: Biz \" + playerScore + \" - \" + enemyScore + \" Rakip\");";
    const replaceStrWin = searchStrWin + "\r\n    \r\n    // [YENİ] Dünya Sıralaması Puanlarını Güncelle\r\n    if (typeof window.applyRankingPoints === 'function') {\r\n        window.applyRankingPoints(window.myTeamId, window.todayOpponent, playerScore, enemyScore);\r\n    }";

    // Actually, `speak("Maç sona erdi` has weird Turkish characters (Maç -> Ma). Let's use something safer.
    const safeSearchStr = "if(typeof speak === 'function') speak(";
    // Wait, that might match many things.
    
    // Better: let's replace `function endGame() {` with `function endGame() { ... }`
    const functionStart = "function endGame() {";
    const newFunctionStart = "function endGame() {\n    if (typeof window.applyRankingPoints === 'function') {\n        window.applyRankingPoints(window.myTeamId, window.todayOpponent, playerScore, enemyScore);\n    }\n";
    const newFunctionStartWin = "function endGame() {\r\n    if (typeof window.applyRankingPoints === 'function') {\r\n        window.applyRankingPoints(window.myTeamId, window.todayOpponent, playerScore, enemyScore);\r\n    }\r\n";

    if (content.includes("function endGame() {\r\n")) {
        content = content.replace("function endGame() {\r\n", newFunctionStartWin);
    } else {
        content = content.replace("function endGame() {\n", newFunctionStart);
    }

    fs.writeFileSync(gamePath, content, 'latin1');
    console.log("game.js patched with ranking points logic.");
} else {
    console.log("game.js already has applyRankingPoints.");
}

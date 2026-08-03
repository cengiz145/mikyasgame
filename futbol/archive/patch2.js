const fs = require('fs');
let text = fs.readFileSync('js/game.js', 'utf8');

// Chunk 1: Opponent substitution
const chunk1Str = 'let oppTeamIdStr = window.todayOpponent || "fenerbahce";';
text = text.replace(chunk1Str, 'let oppTeamIdStr = (window.isFriendlyMatch && window.friendlyOpponentId) ? window.friendlyOpponentId : (window.todayOpponent || "fenerbahce");');

// Chunk 2: Title replacement
const chunk2Str = 'announcerText.textContent = "HAFTA " + window.currentWeek + " | " + formNames[newForm];';
const chunk2Repl = 'if (window.isFriendlyMatch) { announcerText.textContent = "HAZIRLIK MAÇI | " + formNames[newForm]; } else { announcerText.textContent = "HAFTA " + window.currentWeek + " | " + formNames[newForm]; }';
text = text.replace(chunk2Str, chunk2Repl);

// Chunk 3: Match End replacement
const chunk3Regex = /setTimeout\(\(\) => \{\s*if\(window\.leagueData && typeof window\.leagueData\.playMatch === 'function'\) \{\s*window\.leagueData\.playMatch\(\);\s*\} else \{\s*document\.getElementById\('game-screen'\)\.classList\.add\('hidden'\);\s*document\.getElementById\('menu-screen'\)\.classList\.remove\('hidden'\);\s*\}/;
const chunk3Repl = `setTimeout(() => {
        if (window.isFriendlyMatch) {
            window.isFriendlyMatch = false;
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('menu-screen').classList.remove('hidden');
            if (typeof speak === 'function') speak("Hazırlık maçı sona erdi.");
        } else if(window.leagueData && typeof window.leagueData.playMatch === 'function') {
            window.leagueData.playMatch();
        } else {
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('menu-screen').classList.remove('hidden');
        }`;
text = text.replace(chunk3Regex, chunk3Repl);

fs.writeFileSync('js/game.js', text);
console.log('Patched');

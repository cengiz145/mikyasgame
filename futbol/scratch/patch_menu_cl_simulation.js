const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'js', 'menu.js');
let menuContent = fs.readFileSync(menuPath, 'utf8');

const regex = /window\.currentDayOfWeek\+\+;/;
const replacement = `if (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.isActive && window.championsLeague.knockoutStage !== 'completed') {
                if (!window.championsLeague.hasMatchToday(window.myTeamId)) {
                    window.championsLeague.simulateBotMatches();
                    window.championsLeague.finishMatchDay();
                }
            }
            window.currentDayOfWeek++;`;

menuContent = menuContent.replace(regex, replacement);

fs.writeFileSync(menuPath, menuContent, 'utf8');

console.log("menu.js patched to simulate CL matches for eliminated users.");

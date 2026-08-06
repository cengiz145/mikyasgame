const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'js', 'menu.js');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// Inside openPreMatchPressConference()
const oppSetRegex = /\/\/ O haftaki rakibi bul\s+if \(typeof window\.getNextOpponent === 'function'\) \{([\s\S]*?)if \(\!window\.todayOpponent\) window\.todayOpponent = "fenerbahce";/m;

const oppSetRepl = `// O haftaki rakibi bul
        let isClMatch = (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId));
        
        if (isClMatch) {
            let clOpp = window.championsLeague.getOpponent(window.myTeamId);
            if (clOpp) window.todayOpponent = clOpp.id;
            window.isHomeMatch = true; // For now
        } else if (typeof window.getNextOpponent === 'function') {
            window.todayOpponent = window.getNextOpponent();
        } else if (window.fixture && window.fixture[window.currentWeek - 1]) {
            let weekMatches = window.fixture[window.currentWeek - 1];
            let myMatch = weekMatches.find(m => m.home === window.myTeamId || m.away === window.myTeamId);
            if (myMatch) {
                window.todayOpponent = (myMatch.home === window.myTeamId) ? myMatch.away : myMatch.home;
                window.isHomeMatch = (myMatch.home === window.myTeamId);
            }
        }
        
        if (!window.todayOpponent) window.todayOpponent = "fenerbahce";`;

menuContent = menuContent.replace(oppSetRegex, oppSetRepl);

fs.writeFileSync(menuPath, menuContent, 'utf8');
console.log("menu.js patched for CL opponent selection.");

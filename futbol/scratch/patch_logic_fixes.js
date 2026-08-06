const fs = require('fs');
const path = require('path');

const savePath = path.join(__dirname, '..', 'js', 'save.js');
let saveContent = fs.readFileSync(savePath, 'utf8');

// 1. Serialize CL Data
const saveObjRegex = /clubCultureProfile: window\.clubCultureProfile \|\| null\s*\};/m;
const saveObjRepl = `clubCultureProfile: window.clubCultureProfile || null,
            championsLeague: window.championsLeague ? {
                isActive: window.championsLeague.isActive,
                isGroupStageFinished: window.championsLeague.isGroupStageFinished,
                leagueTable: window.championsLeague.leagueTable,
                fixtures: window.championsLeague.fixtures,
                currentMatchDay: window.championsLeague.currentMatchDay
            } : null
        };`;
saveContent = saveContent.replace(saveObjRegex, saveObjRepl);

// 2. Deserialize CL Data
const loadObjRegex = /if \(savedData\.clubCultureProfile\) window\.clubCultureProfile = savedData\.clubCultureProfile;/m;
const loadObjRepl = `if (savedData.clubCultureProfile) window.clubCultureProfile = savedData.clubCultureProfile;
            
            if (savedData.championsLeague && window.championsLeague) {
                window.championsLeague.isActive = savedData.championsLeague.isActive;
                window.championsLeague.isGroupStageFinished = savedData.championsLeague.isGroupStageFinished;
                window.championsLeague.leagueTable = savedData.championsLeague.leagueTable || [];
                window.championsLeague.fixtures = savedData.championsLeague.fixtures || [];
                window.championsLeague.currentMatchDay = savedData.championsLeague.currentMatchDay || 0;
            }`;
saveContent = saveContent.replace(loadObjRegex, loadObjRepl);

fs.writeFileSync(savePath, saveContent, 'utf8');


// 3. Patch menu.js for auto-init
const menuPath = path.join(__dirname, '..', 'js', 'menu.js');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// We can auto-init when we show the main menu if PreSeason is over. Let's find "showContainer('main-menu-container')" where it happens after pre-season or normal week.
// Actually, inside advanceDateAndEvents (scout.js) or advanceWeek (menu.js).
// Let's patch `advanceWeek()` in menu.js.

const advanceWeekRegex = /window\.currentWeek = \(window\.currentWeek \|\| 1\) \+ 1;\s*if \(!window\.isPreSeason && window\.currentDay/m;
const advanceWeekRepl = `window.currentWeek = (window.currentWeek || 1) + 1;

    // [AUTO-INIT ŞAMPİYONLAR LİGİ]
    if (!window.isPreSeason && window.championsLeague && !window.championsLeague.isActive) {
        window.championsLeague.init();
    }

    if (!window.isPreSeason && window.currentDay`;

// Wait, the regex might not match depending on exact spacing. 
// Let's just find "function advanceWeek() {" and put it at the start.
const advFuncRegex = /function advanceWeek\(\) \{/m;
const advFuncRepl = `function advanceWeek() {
    // [AUTO-INIT ŞAMPİYONLAR LİGİ]
    if (!window.isPreSeason && window.championsLeague && !window.championsLeague.isActive && window.leagueData && window.leagueData.teams) {
        window.championsLeague.init();
    }
`;
menuContent = menuContent.replace(advFuncRegex, advFuncRepl);

fs.writeFileSync(menuPath, menuContent, 'utf8');

console.log("save.js and menu.js patched for CL logic fixes.");

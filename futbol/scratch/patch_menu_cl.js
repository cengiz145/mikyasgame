const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'js', 'menu.js');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// 1. In advanceDay logic, check if Wednesday (Day 3) is a CL match day
const btnUpdateRegex = /if \(\!window\.isPreSeason && window\.currentDay && window\.currentDay \% 7 === 0\) \{/m;
const btnUpdateRepl = `
    let isClMatchDay = (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId));
    
    if (!window.isPreSeason && window.currentDay && (window.currentDay % 7 === 0 || isClMatchDay)) {
`;
menuContent = menuContent.replace(btnUpdateRegex, btnUpdateRepl.trim());

// 2. In btn-advance-day logic
const advanceBtnTextRegex = /if \(window\.currentDayOfWeek === 7\) \{\s*this\.innerHTML = "Maça Çık \(Pazar\)";\s*\} else if \(window\.scheduledFriendly && window\.scheduledFriendly\.day === window\.currentDayOfWeek\) \{/m;
const advanceBtnTextRepl = `
            if (window.currentDayOfWeek === 7) {
                this.innerHTML = "Maça Çık (Pazar)";
            } else if (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId)) {
                this.innerHTML = "🌟 Avrupa Maçına Çık (Çarşamba)";
            } else if (window.scheduledFriendly && window.scheduledFriendly.day === window.currentDayOfWeek) {
`;
menuContent = menuContent.replace(advanceBtnTextRegex, advanceBtnTextRepl.trim());

// 3. Match transition logic inside btn-advance-day
const startMatchRegex = /if \(window\.currentDayOfWeek === 7 && this\.innerHTML\.includes\("Maça Çık"\)\) \{/m;
const startMatchRepl = `
        if ((window.currentDayOfWeek === 7 || (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId))) && this.innerHTML.includes("Maça Çık")) {
`;
menuContent = menuContent.replace(startMatchRegex, startMatchRepl.trim());

// 4. Update Game initialization (so it handles CL opponent instead of league opponent)
// But wait, where is initGame called? It's called inside openPreMatchPressConference or direct initGame.
// Actually, I can hook into game.js for that, or modify the press conference.
// Let's modify game.js later. First apply menu.js patch.

fs.writeFileSync(menuPath, menuContent, 'utf8');
console.log("menu.js patched for Champions League Wednesdays.");

const fs = require('fs');

let psychContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', 'utf8');

// We will add window.generatePsychologyEvents that is called by advanceDay.
// This function checks for severe issues and pushes them to eventQueue.
let appendCode = `
window.generatePsychologyEvents = function() {
    let myTeamId = window.myTeamId || (window.league ? window.league.userTeamId : "galatasaray");
    if (!window.leagueData || !window.leagueData.players) return;
    
    let myRoster = window.leagueData.players.filter(p => p.teamId === myTeamId);
    window.eventQueue = window.eventQueue || [];

    myRoster.forEach(p => {
        // Yedek isyanı her gün %10 ihtimalle patlayabilir
        if (p.benchedMatches > 2 && p.happiness !== "Mutlu 😊" && p.happiness !== "Umutlu 😊" && Math.random() < 0.1) {
            
            if (window.clubCultureProfile === 'emektar_malzemeci' && Math.random() < 0.5) {
                p.happiness = "Umutlu 😊";
                p.benchedMatches = 0; 
                window.eventQueue.push({
                    title: "Malzemeci Krizi Çözdü",
                    message: \`Kulübün hafızası Emektar Malzemecimiz, yedek kalmaktan şikayetçi olan <strong>\${p.name}</strong> ile bir çay içip dertleşti. Oyuncunun size ve formaya olan küskünlüğü son buldu!\`
                });
            } else {
                window.eventQueue.push({
                    title: "Kadro Dışı Kriz Riski",
                    message: \`<strong>\${p.name}</strong> haftalardır yedek kalmaktan çok rahatsız. Odasını toplarken görüntülendi. Acilen Psikolog Ofisi'ne gidip onunla görüşmelisiniz!\`
                });
            }
        }
    });
};
`;

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', psychContent + appendCode, 'utf8');

let scoutContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');
scoutContent = scoutContent.replace('// if (typeof window.generatePsychologyEvents', 'if (typeof window.generatePsychologyEvents');
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', scoutContent, 'utf8');

console.log('Patch psychologist queue applied successfully.');

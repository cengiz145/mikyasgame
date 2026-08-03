const fs = require('fs');

let content = fs.readFileSync('js/game.js', 'utf8');

// 1. Enjecting the stats tracker into gameLoop / update
// Wait, is there an update loop?
// Let's find "function gameLoop" or "function update()"
const searchStr = `function gameLoop() {`;
// We will track time every frame. 1 frame = 1 tick.
const trackerLogic = `function gameLoop() {
    // MANAGER STATS TRACKING (EVOLUTION)
    if (window.managerProfile === 'tarafsiz' && window.managerStats && window.myTeamId === 'home') {
        let form = window.currentFormation || '4-4-2';
        
        // Defansif veya 5'li savunma
        if (form.includes('Defansif') || form.includes('5-') || window.teamPsychology === 'park_the_bus') {
            window.managerStats.defensiveMinutes++;
        } 
        // Ofansif veya Pas odaklı
        else if (form.includes('Ofansif') || form.includes('Ortasaha Baskın') || form.includes('3-')) {
            window.managerStats.passingMinutes++;
        }
        
        // Genç Oyuncu Süresi (Sahada Tier 3 veya Tier 4 varsa)
        if (typeof homePlayers !== 'undefined') {
            let youngCount = homePlayers.filter(p => p.isTier3 || p.isTier4).length;
            window.managerStats.youngPlayerMinutes += youngCount;
        }
        
        // Kriz Çözme (Otorite düşükken veya krizdeyken maç kazandıran süreci takip ediyoruz)
        if (window.teamPsychology === 'chaos' && (playerScore >= enemyScore)) {
            // Kaostan çıkmak
            window.managerStats.crisisAvertedCount += 0.01; 
        }
    }
`;

content = content.replace(searchStr, trackerLogic);

// 2. Track Comebacks at End of Match
const endMatchStr = `function showMatchEndScreen() {`;
const endMatchLogic = `function showMatchEndScreen() {
    // MENAJER EVRİMİ: GERİ DÖNÜŞ VE KRİZ KONTROLÜ
    if (window.managerProfile === 'tarafsiz' && window.managerStats) {
        if (historicWorstDeficit > 0 && playerScore > enemyScore) {
            // Geriye düşüp maç kazanıldı
            window.managerStats.comebackWins++;
        }
        if (window.consecutiveLosses >= 2 && playerScore > enemyScore) {
            // Mağlubiyet serisini bitirdi
            window.managerStats.crisisAvertedCount += 10;
        }
    }
`;

content = content.replace(endMatchStr, endMatchLogic);

fs.writeFileSync('js/game.js', content, 'utf8');
console.log('js/game.js patched with Manager Evolution tracking');

const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Add window.updateCrowdForm() function globally
    const initCodeHook = /let playerScore = 0;/g;
    const updateCrowdFormCode = `
window.CrowdForm = 1;
window.updateCrowdForm = function() {
    if (typeof playerScore === 'undefined' || typeof enemyScore === 'undefined') return;
    let diff = enemyScore - playerScore;
    let newForm = 1;
    
    if (diff >= 4 || (typeof window.managerAuthority !== 'undefined' && window.managerAuthority < 30)) {
        newForm = 4; // Toksik İsyan
    } else if (diff >= 2 || (typeof window.consecutiveLosses !== 'undefined' && window.consecutiveLosses >= 2 && diff > 0)) {
        newForm = 3; // Yıkılan Kale
    } else if (diff >= 1 || (typeof window.consecutiveLosses !== 'undefined' && window.consecutiveLosses >= 1 && diff == 0)) {
        newForm = 2; // Taktiksel Homurdanma
    } else {
        newForm = 1; // Romantik İyimserlik
    }

    if (window.CrowdForm !== newForm) {
        window.CrowdForm = newForm;
        if (typeof announcerText !== 'undefined') {
            let formNames = ["", "TRİBÜN: ROMANTİK İYİMSERLİK", "TRİBÜN: TAKTİKSEL HOMURDANMA", "TRİBÜN: YIKILAN KALE (TRAVMA)", "TRİBÜN: TOKSİK İSYAN"];
            announcerText.textContent = formNames[newForm];
        }
    }
};
let playerScore = 0;`;
    if (!content.includes('window.updateCrowdForm = function()')) {
        content = content.replace(initCodeHook, updateCrowdFormCode);
    }

    // 2. Add window.updateCrowdForm() into the match timer
    const matchTimerHook = /timeLeft--;/g;
    const newMatchTimer = `timeLeft--;\n                if (typeof window.updateCrowdForm === 'function') window.updateCrowdForm();`;
    if (content.match(matchTimerHook) && !content.includes('window.updateCrowdForm();')) {
        content = content.replace(matchTimerHook, newMatchTimer);
    }

    // 3. Replace Early Defeat / Protest Active with CrowdForm
    const earlyDefeatHook = /let isEarlyDefeat = \(playerScore < enemyScore && typeof timeLeft !== 'undefined' && timeLeft > 75\) \|\| \(enemyScore \- playerScore >= 3\);\n\s*let isProtestActive = \(enemyScore \- playerScore >= 4\) \|\| \(window\.consecutiveLosses >= 3\);/g;
    const newEarlyDefeat = `let isEarlyDefeat = window.CrowdForm >= 3;\n          let isProtestActive = window.CrowdForm === 4;`;
    content = content.replace(earlyDefeatHook, newEarlyDefeat);

    // 4. Replace Stadium Abandonment
    const abandonedHook = /let isStadiumAbandoned = \(enemyScore \- playerScore >= 5\) && \(typeof timeLeft !== 'undefined' && timeLeft <= 30\);/g;
    const newAbandoned = `let isStadiumAbandoned = (window.CrowdForm === 4) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);`;
    content = content.replace(abandonedHook, newAbandoned);

    // 5. Replace Oley for AWAY team (Toksik Oley)
    const awayOleyHook = /if \(ball\.team === 'away' && window\.consecutivePasses >= 2 && Math\.random\(\) < 0\.01\)/g;
    const newAwayOley = `if (ball.team === 'away' && window.consecutivePasses >= 2 && Math.random() < 0.01 && window.CrowdForm === 4)`;
    content = content.replace(awayOleyHook, newAwayOley);

    // 6. Günah Keçisi Kaçışı
    const goatHook = /if \(p\.isBooedByOwnFans && !p\.isUserControlled\)/g;
    const newGoatHook = `if (p.isBooedByOwnFans && !p.isUserControlled && window.CrowdForm === 4)`;
    content = content.replace(goatHook, newGoatHook);
    
    // 7. Günah keçisine pas ambargosu
    const goatPassHook = /if \(p !== activePlayer && !p\.isBooedByOwnFans\) \{ \/\/ AŞAMA 66: Günah Keçisine pas atılmaz/g;
    const newGoatPass = `if (p !== activePlayer && !(p.isBooedByOwnFans && window.CrowdForm === 4)) { // Sadece Form 4'te ambargo uygulanır`;
    content = content.replace(goatPassHook, newGoatPass);

    // 8. Tribün Penaltı Baskısı
    const penHook = /if \(ball\.team === 'away' && ball\.x > 650 && typeof isGameHalted !== 'undefined' && !isGameHalted && Math\.random\(\) < 0\.005\)/g;
    const newPenHook = `if (window.CrowdForm <= 2 && ball.team === 'away' && ball.x > 650 && typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.005)`;
    content = content.replace(penHook, newPenHook);

    // 9. Zaman geçirme baskısı
    const timeWastHook = /let isWastingTime = enemyScore >= playerScore && isLateGame;/g;
    const newTimeWast = `let isWastingTime = enemyScore >= playerScore && isLateGame && window.CrowdForm <= 2;`;
    content = content.replace(timeWastHook, newTimeWast);

    // 10. Standing Ovation (Ayakta alkışlama)
    const ovationHook = /if \(\(enemyScore \- playerScore\) >= 3 && Math\.random\(\) < 0\.15\)/g;
    const newOvation = `if (window.CrowdForm === 4 && Math.random() < 0.15)`;
    content = content.replace(ovationHook, newOvation);

    // 11. Taktiksel Homurdanma (Form 2)
    // Yan pas ve geri pas uğultusu (ball.x azalırsa ve ball.team === home)
    const passLogicHook = /if \(activePlayer\.x > 650\) \{/g;
    const backpassHomurdanma = `
        // AŞAMA 76: Form 2 Taktiksel Homurdanma
        if (window.CrowdForm === 2 && activePlayer.x < 300 && ball.team === 'home' && Math.random() < 0.3) {
            if (window.AudioManager) {
                let boo = new Audio('sounds/boo.ogg'); boo.volume = 0.3; boo.play().catch(e=>{});
            }
        }
        if (activePlayer.x > 650) {`;
    if (content.match(passLogicHook) && !content.includes('AŞAMA 76: Form 2 Taktiksel Homurdanma')) {
        content = content.replace(passLogicHook, backpassHomurdanma);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Tribün Evrimi (4 Aşamalı Form Sistemi) tamamlandı.");
} else {
    console.log("game.js bulunamadı!");
}

const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Günah Keçisi Pas Ambargosu
    const closestTeammateHook = /if \(p !== activePlayer\) \{/g;
    const closestTeammateReplace = `if (p !== activePlayer && !p.isBooedByOwnFans) { // AŞAMA 66: Günah Keçisine pas atılmaz`;
    content = content.replace(closestTeammateHook, closestTeammateReplace);

    // 2. Günah Keçisi Saklanma & Protesto & Erken Teslimiyet
    // Bunları oyuncu döngüsü (homePlayers.forEach) ve genel update loop'una ekleyeceğiz.
    
    const staminaHook = /let staminaDecay = dist \* 0\.0005;/;
    const staminaReplace = `
        // AŞAMA 66: Erken Teslimiyet (Sessizlik) ve Protesto
        let isEarlyDefeat = (playerScore < enemyScore && typeof timeLeft !== 'undefined' && timeLeft > 75) || (enemyScore - playerScore >= 3);
        let isProtestActive = (enemyScore - playerScore >= 4) || (window.consecutiveLosses >= 3);
        
        let staminaDecay = dist * 0.0005;
        if (isEarlyDefeat) staminaDecay *= 2.0; // Ev sahibi avantajı gitti, yorgunluk katlandı
        if (isProtestActive) {
            spd *= 0.5; // Protesto varsa koşmaya mecal kalmaz
            if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
        }

        // Günah Keçisi Kaçışı
        if (p.isBooedByOwnFans && !p.isUserControlled) {
            p.x -= (p.x - 100) * 0.02; // Kenara, kaleye doğru saklanır
            p.y += (100 - p.y) * 0.02;
            spd *= 0.3; // İsteksiz hareket eder
        }
        
        // Günah Keçisi ayağına top alırsa ıslık kopar
        if (p === activePlayer && p.isBooedByOwnFans && ball.team === 'home' && Math.random() < 0.02 && window.AudioManager) {
            let boo = new Audio('sounds/boo.ogg'); boo.volume = 1.0; boo.play().catch(e=>{});
        }
    `;
    if (content.match(staminaHook) && !content.includes('AŞAMA 66: Erken Teslimiyet')) {
         content = content.replace(staminaHook, staminaReplace + '\n');
    }

    // 3. Spiker ve Ses Efektleri (Update Loop başı)
    const updateLoopHook = /if \(ball\.team === 'none'\) \{/;
    const silenceHook = `
    // AŞAMA 67: Protesto ve Erken Teslimiyet Ses Efektleri
    let isEarlyDefeat = (playerScore < enemyScore && typeof timeLeft !== 'undefined' && timeLeft > 75) || (enemyScore - playerScore >= 3);
    let isProtestActive = (enemyScore - playerScore >= 4) || (window.consecutiveLosses >= 3);

    if (isProtestActive) {
        if (!window.protestAnnounced) {
            window.protestAnnounced = true;
            if(window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.8;
            if(typeof speak === 'function') speak("Tribünler maçı tamamen bıraktı! 'Yönetim İstifa' protestoları stadyumu inletiyor, sahada futbol oynamak artık imkansız! Takımın inancı tamamen bitti.");
        }
    } else if (isEarlyDefeat) {
        if (!window.silenceAnnounced) {
            window.silenceAnnounced = true;
            if(window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
            if(typeof speak === 'function') speak("Erken gelen gol stadyuma ölüm sessizliği çöktürdü! Taraftar adeta tiyatro izleyicisine dönüştü, ev sahibi avantajı tamamen bitti.");
        }
    }

    if (ball.team === 'none') {`;
    if (content.match(updateLoopHook) && !content.includes('AŞAMA 67: Protesto')) {
         content = content.replace(updateLoopHook, silenceHook);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Yıkıcı Psikoloji (Sabrın Tükenmesi) eklendi.");

} else {
    console.log("game.js bulunamadı!");
}

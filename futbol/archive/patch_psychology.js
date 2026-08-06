const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // --- 1. ATEŞLEYİCİ UĞULTU (Momentum) ---
    // Enjekte edilecek nokta: updateGame() içinde bir yer.
    // "if (ball.team === 'none') {" öncesine koyabiliriz.
    const hook1 = "if (ball.team === 'none') {";
    const momentumCode = `
    // AŞAMA 63: Ateşleyici Uğultu (Momentum Dalgası)
    if (playerScore < enemyScore || window.isCornerKickZone) {
        if (!window.momentumActive) {
            window.momentumActive = true;
            if(typeof speak === 'function') speak("Tribünlerden ateşleyici bir uğultu yükseliyor! Laktik asit unutuldu, takım çılgın gibi basıyor!");
        }
        // Her frame'de stamina fullenir ve takım aşırı baskı yapar
        homePlayers.forEach(p => {
            p.stamina = 100;
            if (ball.team === 'away') {
                let dx = ball.x - p.x; let dy = ball.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let presSpd = (p.speed || 3) * 2.5; 
                if(dist > 0 && p.x > 200) { p.x += (dx/dist)*presSpd; p.y += (dy/dist)*presSpd; }
            }
        });
    } else {
        if (window.momentumActive) {
            window.momentumActive = false;
        }
    }
    
    if (ball.team === 'none') {`;
    if (!content.includes('AŞAMA 63: Ateşleyici Uğultu')) {
        content = content.replace(hook1, momentumCode);
    }

    // --- 2. BİREYSEL REHABİLİTASYON ---
    const hook2 = "strikerConfidence -= 25;";
    const rehabCode = `
    // AŞAMA 64: Bireysel Rehabilitasyon
    if (Math.random() < 0.40) {
        if(window.AudioManager && window.AudioManager.cheer) window.AudioManager.cheer.play().catch(e=>{});
        strikerConfidence = 100;
        if(typeof speak === 'function') speak("Stadyum homurdanmak yerine oyuncuyu ayakta alkışlıyor! Hata yapma korkusu tamamen silindi, forvet yeniden doğdu!");
    } else {
        strikerConfidence -= 25;`;
    if (!content.includes('AŞAMA 64: Bireysel Rehabilitasyon')) {
        content = content.replace(hook2, rehabCode + '\n        if (strikerConfidence < 0) strikerConfidence = 0;\n    }');
        // Note: The replace might be slightly risky if strikerConfidence-=25 happens multiple places, but there's only one in handleStrikerMiss normally.
        // Wait, I should make sure I don't break syntax. Let's do a more robust replace for handleStrikerMiss:
        content = content.replace(rehabCode + '\n        if (strikerConfidence < 0) strikerConfidence = 0;\n    }', rehabCode); // revert just in case
    }
    
    // Güvenli Replace:
    const safeRehabHook = /function handleStrikerMiss\(reason\) \{[\s\S]*?strikerConfidence -= 25;/;
    if (content.match(safeRehabHook) && !content.includes('AŞAMA 64: Bireysel Rehabilitasyon')) {
         content = content.replace(/strikerConfidence -= 25;/, rehabCode);
         // Closing brace for the "else"
         content = content.replace(/if \(strikerConfidence < 0\) strikerConfidence = 0;/, "if (strikerConfidence < 0) strikerConfidence = 0;\n    }");
    }

    // --- 3. RAKİBİ İZOLE ETME (Sağır Edici Islık) ---
    // Hook around awayPossessionTime
    const hook3 = /if \(ball\.team === 'away'\) \{\s*window\.awayPossessionTime \+= 16;/;
    const isolateCode = `if (ball.team === 'away') {
        window.awayPossessionTime += 16; 
        
        // AŞAMA 65: Rakibi İzole Etme (Sağır Edici Islık)
        if (window.awayPossessionTime > 200) { 
            if (Math.random() < 0.05) { 
                if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
                
                if (Math.random() < 0.50) {
                    ball.team = 'none'; 
                    ball.vx = -15; 
                    window.awayPossessionTime = 0;
                    if(typeof speak === 'function') speak("Sağır edici ıslık rakibi felç etti! Panikleyip topu kaptırdılar!");
                }
            }
        }
        
        // Rakip Serbest Vuruş Sabotajı
        if (window.isFreeKickZone && Date.now() < window.freeKickTimer) {
            if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
            if (Math.random() < 0.03) { 
                window.freeKickTimer = 0;
                window.isFreeKickZone = false;
                ball.team = 'home';
                ball.x = 400; ball.y = 250;
                if(typeof speak === 'function') speak("İnanılmaz ıslık rakibin aklını aldı! Serbest vuruşu panikle dağlara taşlara vurdular!");
            }
        }`;
    if (content.match(hook3) && !content.includes('AŞAMA 65: Rakibi İzole Etme')) {
        content = content.replace(hook3, isolateCode);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Psikolojik Motor ve Momentum yamalandı.");
} else {
    console.log("game.js bulunamadı!");
}

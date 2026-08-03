const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Hook for window.refereeExperience in initGame()
    const initGameHook = /window\.AudioManager\.startAmbiance\(\);/;
    const newInitGameHook = `window.AudioManager.startAmbiance();
          
          window.refereeExperience = Math.random() < 0.4 ? 'rookie' : 'veteran'; // Hakemin tecrübesi`;

    if (content.match(initGameHook) && !content.includes('window.refereeExperience =')) {
        content = content.replace(initGameHook, newInitGameHook);
    }

    // 2. Penalty Fake Roar Hook
    const updateLoopHook = /if \(ball\.team === 'none'\) \{/;
    const penaltyHook = `
    // AŞAMA 69: Tribün Penaltı Baskısı (Desibel ile Karar Bükme)
    if (ball.team === 'away' && ball.x > 650 && typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.005) {
        if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
        
        if (window.refereeExperience === 'rookie' && Math.random() < 0.10) {
            isGameHalted = true; 
            window.pendingPenalty = true;
            gameHaltTimer = Date.now() + 3000;
            haltReason = "PENALTI - TARAFTAR BASKISI";
            if(typeof speak === 'function') speak("Ceza sahasında ufak bir temas... Tribünler ayağa fırladı, devasa bir uğultu koptu! Hakem o sese dayanamayıp penaltıyı çaldı! İnanılmaz bir baskı!");
        } else {
            if(typeof speak === 'function') speak("Tribünler penaltı diye ayaklandı ama tecrübeli hakem oralı bile olmuyor, oyna diyor!");
        }
    }
    
    if (ball.team === 'none') {`;
    if (content.match(updateLoopHook) && !content.includes('AŞAMA 69: Tribün Penaltı Baskısı')) {
        content = content.replace(updateLoopHook, penaltyHook);
    }

    // 3. Card Pressure Hook (Foul Hook)
    // Looking at the foul logic:
    // let redChance = isTier2Emotional ? 0.6 : 0.3; // Duygusal patlama (Kırmızı)
    const foulHook = /let redChance = isTier2Emotional \? 0\.6 : 0\.3;/g;
    const cardHook = `
                  if (teamType === 'away') {
                      if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away'); // Tribün linci
                      if (window.refereeExperience === 'rookie' && Math.random() < 0.10) {
                          p.isRedCarded = true;
                          if (typeof isGameHalted !== 'undefined') {
                              isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                              gameHaltTimer = Date.now() + 5000;
                              haltReason = "KIRMIZI KART (" + p.name + ") - TARAFTAR BASKISI";
                          }
                          if(typeof speak === 'function') speak("Normal bir faul ama tribünler o kadar korkunç bir tepki verdi ki, tecrübesiz hakem panikle cebinden kırmızı kartı çıkardı! Stadyum hakemi esir aldı.");
                          return; // Skip normal foul logic
                      }
                  }
                  
                  let redChance = isTier2Emotional ? 0.6 : 0.3;`;
    if (content.match(foulHook) && !content.includes('TARAFTAR BASKISI')) {
        content = content.replace(foulHook, cardHook);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Hakem Manipülasyonu eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

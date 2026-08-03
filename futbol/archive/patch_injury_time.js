const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. matchTimer timer mantığını güncelle
    // Eski mantık: if(!isPaused && gameActive && (typeof isGameHalted === 'undefined' || !isGameHalted)) { timeLeft--; ... }
    const timerHook = /if\(\!isPaused && gameActive && \(typeof isGameHalted === 'undefined' \|\| \!isGameHalted\)\) \{/g;
    const newTimerLogic = `
            window.wastedTime = window.wastedTime || 0;
            window.isInjuryTime = window.isInjuryTime || false;
            
            if(!isPaused && gameActive) {
                // Eğer oyun durmuşsa (Kırmızı kart, protesto vs.), saati durdurma ama boşa geçen süreyi kaydet
                if (typeof isGameHalted !== 'undefined' && isGameHalted) {
                    window.wastedTime++;
                }
                
                timeLeft--;`;

    if (content.match(timerHook)) {
        content = content.replace(timerHook, newTimerLogic);
    } else {
        console.log("matchTimer hook bulunamadı!");
    }

    // 2. timeLeft ekrana yazdırılma ve bitiş mantığını güncelle
    // Eski mantık: if(sb) sb.textContent = "Süre: " + timeLeft;
    // ...
    // if(timeLeft <= 0) endGame();
    const timeDisplayHook = /if\(sb\) sb\.textContent = "S\S+re: " \+ timeLeft;/g;
    const newTimeDisplay = `if(sb) {
                  if (window.isInjuryTime) {
                      sb.textContent = "90+" + (window.initialInjuryTime - timeLeft);
                      sb.style.color = '#ffcc00'; // Uzatma dakikaları sarı/turuncu gözüksün
                  } else {
                      sb.textContent = "Süre: " + timeLeft;
                  }
              }`;
              
    if (content.match(timeDisplayHook)) {
        content = content.replace(timeDisplayHook, newTimeDisplay);
    } else {
         // Fallback
         content = content.replace(/if\(sb\) sb\.textContent = "Süre: " \+ timeLeft;/g, newTimeDisplay);
    }

    const endGameHook = /if\(timeLeft <= 0\) endGame\(\);/g;
    const newEndGameLogic = `if(timeLeft <= 0) {
                  if (!window.isInjuryTime && window.wastedTime > 0) {
                      window.isInjuryTime = true;
                      window.initialInjuryTime = window.wastedTime;
                      timeLeft = window.wastedTime;
                      window.wastedTime = 0;
                      
                      if (typeof speak === 'function') speak("Dördüncü hakem tabelayı kaldırdı. Maçın sonuna en az " + timeLeft + " dakika ilave edildi!");
                      if (typeof announcerText !== 'undefined') {
                          announcerText.textContent = "UZATMALAR: +" + timeLeft + " DAKİKA";
                          announcerText.style.color = "#ffcc00";
                      }
                      
                      // Uzatmalarda adrenalin fırlar
                      if (typeof homePlayers !== 'undefined') {
                          homePlayers.forEach(p => { if (p.bio) p.bio.adrenaline = Math.max(p.bio.adrenaline, 80); });
                      }
                      if (typeof awayPlayers !== 'undefined') {
                          awayPlayers.forEach(p => { if (p.bio) p.bio.adrenaline = Math.max(p.bio.adrenaline, 80); });
                      }
                  } else {
                      endGame();
                  }
              }`;

    if (content.match(endGameHook)) {
        content = content.replace(endGameHook, newEndGameLogic);
    } else {
        console.log("endGame hook bulunamadı!");
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Uzatma Dakikaları (Injury Time) başarıyla entegre edildi.");
} else {
    console.log("game.js bulunamadı!");
}

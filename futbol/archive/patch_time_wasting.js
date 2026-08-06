const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Aut hook (Out of bounds on right side, not goal)
    const autHook = /ball\.x = 400; ball\.y = 250; ball\.vx=0; ball\.vy=0;\s*handleStrikerMiss\('out'\);/g;
    
    // We will replace it with a time wasting check
    const newAutCode = `
                      // AŞAMA 71: Ritmik Islık ve Oyunu Soğutmayı Engelleme
                      let isLateGame = typeof timeLeft !== 'undefined' && timeLeft < 45;
                      let isWastingTime = enemyScore >= playerScore && isLateGame;

                      if (isWastingTime && typeof isGameHalted !== 'undefined' && Math.random() < 0.3) {
                          isGameHalted = true;
                          window.pendingPenalty = false;
                          gameHaltTimer = Date.now() + 5000;
                          haltReason = "KALECİ ZAMAN GEÇİRİYOR";
                          
                          if (window.AudioManager) {
                              let boo = new Audio('sounds/boo.ogg');
                              boo.volume = 1.0;
                              boo.play().catch(e=>{});
                          }

                          if(typeof speak === 'function') speak("Rakip kaleci süreyi eritmek için çok ağır hareket ediyor! Ama tribünler buna izin vermiyor, inanılmaz bir ritmik ıslık var! Bu protesto ev sahibi oyuncuları çileden çıkardı ve kudurmuş gibi pres yapmaya başladılar!");
                          
                          // Ev Sahibi Takıma Kudurmuş Pres Buff'ı (Adrenalin)
                          if (typeof homePlayers !== 'undefined') {
                              homePlayers.forEach(p => {
                                  p.stamina = 120; // Full adrenalin
                                  p.speed = (p.speed || 3) * 1.3; // Hızlı oyun baskısı
                              });
                          }
                      } else {
                          ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
                      }
                      handleStrikerMiss('out');
    `;
    
    // We need to be careful replacing because there are two instances of `ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;`
    // One is for handleStrikerMiss('out') which is goal kick for away team. The other is throw in for away team.
    if (content.match(autHook)) {
        content = content.replace(autHook, newAutCode);
    }
    
    // Also handling the gameHalt reset for "KALECİ ZAMAN GEÇİRİYOR"
    const haltResetHook = /\} else if \(haltReason === "KORNER"\) \{/g;
    const newHaltReset = `} else if (haltReason === "KALECİ ZAMAN GEÇİRİYOR") {
                  if(typeof speak === 'function') speak("Kaleci sonunda baskıya dayanamayıp atışı kullanmak zorunda kaldı. Top yeniden oyunda!");
                  ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0; ball.team = 'none';
              } else if (haltReason === "KORNER") {`;
    
    if (content.match(haltResetHook) && !content.includes('KALECİ ZAMAN GEÇİRİYOR')) {
        content = content.replace(haltResetHook, newHaltReset);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Zaman geçirmeyi engelleyen ritmik ıslık eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

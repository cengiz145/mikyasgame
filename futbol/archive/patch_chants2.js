const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    const oldTimer = /if\(!isPaused && gameActive && \(typeof isGameHalted === 'undefined' \|\| !isGameHalted\)\) \{\s*timeLeft--;/;
    const newTimer = `if(!isPaused && gameActive && (typeof isGameHalted === 'undefined' || !isGameHalted)) {
              timeLeft--;
              
              // --- YENİ: TEZAHÜRAT VE MORAL SİSTEMİ ---
              if (timeLeft % 10 === 0 && window.AudioManager && !window.AudioManager.isChanting) {
                  let sA = playerScore;
                  let sB = enemyScore;
                  
                  // Eğer fark 2 ise VEYA son 15 dakika galip isek
                  if (sA - sB >= 2 || (timeLeft <= 15 && sA > sB)) {
                      window.AudioManager.startChant(window.myTeamId || 'galatasaray');
                      // Oyunculara gaz ver (Güçlerini artır)
                      homePlayers.forEach(p => p.power += 2);
                      if(typeof speak === 'function') speak("Taraftar takımının muhteşem oyununu ayakta alkışlıyor ve şampiyonluk şarkıları söylüyor!");
                  }
              }
              // --- TEZAHÜRAT SİSTEMİ SONU ---`;
    
    if (content.match(oldTimer)) {
        content = content.replace(oldTimer, newTimer);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Tezahürat (Chant) trigger'ı eklendi.");
    } else {
        console.log("Timer Regex match bulunamadı!");
    }
} else {
    console.log("game.js bulunamadı!");
}

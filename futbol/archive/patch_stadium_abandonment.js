const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Hook into match timer (timeLeft--) to check abandonment
    const matchTimerHook = /if \(isProtestActive\) \{/g;
    const abandonmentCode = `
      // AŞAMA 75: Stadyumu Terk Etme (En Ağır Ceza)
      let isStadiumAbandoned = (enemyScore - playerScore >= 5) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);
      
      if (isStadiumAbandoned) {
          if (!window.abandonmentAnnounced) {
              window.abandonmentAnnounced = true;
              if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
              if(typeof speak === 'function') speak("İnanılmaz görüntüler! Stadyumdaki on binlerce taraftar, takımlarının bu rezil futbolunu daha fazla izlememek için tribünleri boşaltıyor! Yuhalamıyorlar, ıslıklamıyorlar, sadece terk ediyorlar! Futbolcular için yerin dibine girme anı.");
              if(typeof announcerText !== 'undefined') announcerText.textContent = "STADYUM BOŞALIYOR! TARAFTAR TERK ETTİ!";
              
              // Yönetime büyük darbe
              window.managerAuthority = 0;
              window.presidentConfidence = 0;
          }
          
          // Sahadaki Ruhsuzluk (Fiziken Maçı Bırakırlar)
          if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
          if (typeof homePlayers !== 'undefined') {
              homePlayers.forEach(p => {
                  p.stamina = 0; // Ayakta duracak halleri kalmaz
                  p.speed = (p.baseSpeed || 3) * 0.4; // Sadece yürürler
                  p.power = 1; // Şut veya pas atamazlar
              });
          }
      } else if (isProtestActive) {`;

    if (content.match(matchTimerHook) && !content.includes('AŞAMA 75: Stadyumu Terk Etme')) {
        content = content.replace(matchTimerHook, abandonmentCode);
    }
    
    // Also reset abandonmentAnnounced in initGame
    const initGameHook = /playerScore = 0; enemyScore = 0;/g;
    const newInitGame = `window.abandonmentAnnounced = false;
      playerScore = 0; enemyScore = 0;`;
    if (content.match(initGameHook) && !content.includes('window.abandonmentAnnounced = false;')) {
        content = content.replace(initGameHook, newInitGame);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Stadyumu Terk Etme Mekaniği Eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

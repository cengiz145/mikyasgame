const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Hedef metin tam olarak eşleşsin diye RegExp kullanıyoruz
    const outHook = /\} else \{\s*ball\.x = 400; ball\.y = 250; ball\.vx=0; ball\.vy=0;\s*if\(typeof speak === 'function'\) speak\("Top rakip tarafndan dYar atld\."\);\s*\}/;
    
    // Yabancı Madde Yağmuru Kodu
    const objectRainCode = `} else {
                  // AŞAMA 74: Kornerde Yabancı Madde Yağmuru
                  if (typeof isGameHalted !== 'undefined' && Math.random() < 0.2) {
                      isGameHalted = true;
                      window.pendingPenalty = false;
                      gameHaltTimer = Date.now() + 6000;
                      haltReason = "KORNER (DEPLASMAN)";
                      
                      // Tribün Agresifse veya %15 ihtimalle Yabancı Madde Atarlar
                      let isBerserk = (typeof teamPsychology !== 'undefined' && teamPsychology === 'berserk');
                      if (isBerserk || Math.random() < 0.15) {
                          haltReason = "YABANCI MADDE YAĞMURU (OYUN DURDU)";
                          gameHaltTimer = Date.now() + 8000;
                          
                          if (window.AudioManager && window.AudioManager.triggerPossessionReaction) {
                              window.AudioManager.triggerPossessionReaction('away'); // Tribün çıldırır
                          }
                          
                          if(typeof speak === 'function') speak("İnanılmaz görüntüler! Rakip oyuncu korner kullanmak için köşeye geldiğinde üzerine yağmur gibi yabancı madde yağdı! Hakem oyunu durdurdu ve anons yaptırıyor. Bu durum ev sahibi kulübe çok ağır bir ceza olarak dönecektir!");
                          
                          // Ev Sahibi Takıma Disiplin Cezası
                          if (typeof window.managerAuthority !== 'undefined') window.managerAuthority -= 15;
                          if (typeof window.presidentConfidence !== 'undefined') window.presidentConfidence -= 20;
                          
                          // Rakip Oyuncu Korkudan Acele Eder (Hata Yapar)
                          if (typeof awayPlayers !== 'undefined') {
                              awayPlayers.forEach(p => p.mistakes = (p.mistakes || 0) + 1);
                          }
                      } else {
                          if(typeof speak === 'function') speak("Deplasman takımı köşe vuruşu kullanacak.");
                      }
                      
                      ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0; ball.team = 'none';
                  } else {
                      ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
                      // Fallback text
                  }
              }`;

    // UTF-8 sorunları nedeniyle manuel String değiştirme yöntemine de başvuralım
    let found = false;
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("Top rakip taraf") && lines[i].includes("d") && lines[i].includes("ar") && lines[i-1].includes("ball.x = 400")) {
            lines[i-2] = "} else {";
            lines[i-1] = `                  // AŞAMA 74: Kornerde Yabancı Madde Yağmuru
                  if (typeof isGameHalted !== 'undefined' && Math.random() < 0.2) {
                      isGameHalted = true;
                      window.pendingPenalty = false;
                      gameHaltTimer = Date.now() + 6000;
                      haltReason = "KORNER (DEPLASMAN)";
                      
                      let isBerserk = (typeof teamPsychology !== 'undefined' && teamPsychology === 'berserk');
                      if (isBerserk || Math.random() < 0.15) {
                          haltReason = "YABANCI MADDE YAĞMURU";
                          gameHaltTimer = Date.now() + 8000;
                          
                          if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
                          
                          if(typeof speak === 'function') speak("İnanılmaz görüntüler! Rakip oyuncu korner kullanmak için köşeye geldiğinde üzerine yağmur gibi yabancı madde yağdı! Hakem oyunu durdurdu ve anons yaptırıyor. Bu durum kulübe ağır bir ceza olarak dönecektir!");
                          
                          if (typeof window.managerAuthority !== 'undefined') window.managerAuthority -= 15;
                          if (typeof window.presidentConfidence !== 'undefined') window.presidentConfidence -= 20;
                          
                          if (typeof awayPlayers !== 'undefined') awayPlayers.forEach(p => p.mistakes = (p.mistakes || 0) + 2);
                      } else {
                          if(typeof speak === 'function') speak("Deplasman takımı köşe vuruşu kullanacak.");
                      }
                  } else {
                      ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;`;
            lines[i] = `                      if(typeof speak === 'function') speak("Top rakip tarafından dışarı atıldı.");`;
            // lines[i+1] is '}'
            found = true;
            break;
        }
    }

    if (found) {
        fs.writeFileSync(gameFile, lines.join('\n'), 'utf8');
        console.log("game.js - Kornerde Yabancı Madde Yağmuru eklendi.");
    } else {
        console.log("Hook noktası bulunamadı!");
    }
} else {
    console.log("game.js bulunamadı!");
}

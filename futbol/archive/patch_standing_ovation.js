const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Hook into enemyScore++ under ball.x < 0
    const goalHook = /enemyScore\+\+; updateScoreBoard\(\); ball\.x = 400; ball\.y = 250; ball\.vx=0; ball\.vy=0;/g;
    
    const newGoalCode = `
                  enemyScore++; updateScoreBoard(); ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
                  
                  // AŞAMA 72: Rakibi Ayakta Alkışlama (Standing Ovation)
                  if ((enemyScore - playerScore) >= 3 && Math.random() < 0.15) {
                      if (window.AudioManager) {
                          let ovation = new Audio('sounds/cheer.ogg');
                          ovation.volume = 1.0;
                          ovation.play().catch(e=>{});
                      }
                      
                      // Ev Sahibi Takımın Özgüveni Tamamen Sıfırlanır
                      if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
                      if (typeof homePlayers !== 'undefined') {
                          homePlayers.forEach(p => { 
                              p.power = Math.max(1, (p.power || 50) - 10);
                              p.speed = (p.speed || 3) * 0.8;
                          });
                      }
                      
                      if(typeof speak === 'function') speak("İnanılmaz bir an! Stadyum ayağa kalktı ve az önce bu golü atan rakip oyuncuyu ayakta alkışlıyor! Ev sahibi takım oyuncuları için yerin dibine girme anı... Bütün özgüvenleri sıfırlandı, kendi taraftarları rakibe teslim oldu!");
                  } else {
    `;
    
    // We need to close the else block after the original speech
    const speakHook = /if\(typeof speak === 'function'\) speak\("Ne oluyor orada\?! İnanılmaz bir anlaşmazlık! Defans arkaya oynamak istedi\.\.\. Top kendi ağlarına gidiyor!"\);/g;
    const newSpeakCode = `if(typeof speak === 'function') speak("Top ağlarda! Deplasman takımı skoru buluyor.");
                  }`;
    
    if (content.match(goalHook) && !content.includes('AŞAMA 72')) {
        content = content.replace(goalHook, newGoalCode);
        if (content.match(speakHook)) {
             content = content.replace(speakHook, newSpeakCode);
        }
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Rakibi Ayakta Alkışlama (Standing Ovation) mekaniği eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

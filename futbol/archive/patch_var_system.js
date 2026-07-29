const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. triggerVAR fonksiyonunu ekle
    const varFunc = `
// AŞAMA 86: VAR Sistemi ve Toplu İtiraz (İsyan)
window.triggerVAR = function(scoringTeam) {
    if (Math.random() > 0.4) return; // %40 ihtimalle VAR'a takılır
    
    let isHomeGoal = (scoringTeam === 'home');
    let defendingPlayers = isHomeGoal ? awayPlayers : homePlayers;
    let avgAnger = 0;
    
    if (typeof defendingPlayers !== 'undefined' && defendingPlayers[0] && defendingPlayers[0].emotions) {
        let totalAnger = defendingPlayers.reduce((sum, p) => sum + (p.emotions.anger || 0), 0);
        avgAnger = totalAnger / defendingPlayers.length;
    }
    
    isGameHalted = true;
    window.varStatus = 'checking'; 
    window.varScoringTeam = scoringTeam;
    window.varDecision = Math.random() < 0.5 ? 'offside' : 'goal'; 
    window.varLineDefX = 0; window.varLineAttX = 0;
    
    let refX = 400, refY = 250; 
    
    if (avgAnger > 60 || window.CrowdForm === 4) {
        // İSYAN! Hakemi VAR Monitörüne yollarlar
        window.varStatus = 'monitor';
        window.varTimer = Date.now() + 40000; // 40 Saniye stres
        
        if(typeof speak === 'function') speak("Yiyen takım oyuncuları öfkeden delirdi! Hakemin etrafını sardılar! Çok yoğun bir itiraz var. Hakem bu devasa psikolojik baskıya dayanamadı, kenara VAR monitörüne gidiyor!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OYUNCULAR HAKEMİ VAR'A GİTMEYE ZORLADI!";
        
        // Defans oyuncuları hakemin etrafını sarar
        defendingPlayers.forEach((p, idx) => {
            if (idx < 6) { 
                p.x = refX + (Math.random() * 40 - 20);
                p.y = refY + (Math.random() * 40 - 20);
                p.speed = 0; 
            }
        });
    } else {
        // Normal VAR beklemesi (Kulaktan)
        window.varTimer = Date.now() + 15000; // 15 saniye
        if(typeof speak === 'function') speak("VAR odası pozisyonu inceliyor, hakem kulağını tuttu...");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "VAR İNCELEMESİ BEKLENİYOR...";
    }
    
    haltReason = "VAR İNCELEMESİ";
};
`;

    if (!content.includes('window.triggerVAR = function')) {
        content = content.replace('function gameLoop() {', varFunc + '\nfunction gameLoop() {');
    }

    // 2. Gol anlarına triggerVAR çağrısını ekle (Ev sahibi)
    const homeGoalHook = /playerScore\+\+; updateScoreBoard\(\); ball\.x = 400; ball\.y = 250; ball\.vx=0; ball\.vy=0;/g;
    const homeGoalReplace = `playerScore++; updateScoreBoard(); ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
              if (typeof window.triggerVAR === 'function') window.triggerVAR('home');`;
    if (content.match(homeGoalHook) && !content.includes(`window.triggerVAR('home')`)) {
        content = content.replace(homeGoalHook, homeGoalReplace);
    }

    // 3. Gol anlarına triggerVAR çağrısını ekle (Deplasman)
    const awayGoalHook = /enemyScore\+\+; updateScoreBoard\(\); ball\.x = 400; ball\.y = 250; ball\.vx=0; ball\.vy=0;/g;
    const awayGoalReplace = `enemyScore++; updateScoreBoard(); ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
              if (typeof window.triggerVAR === 'function') window.triggerVAR('away');`;
    if (content.match(awayGoalHook) && !content.includes(`window.triggerVAR('away')`)) {
        content = content.replace(awayGoalHook, awayGoalReplace);
    }
    
    // 4. gameLoop içine VAR çizgileri ve karar mantığını ekle
    const haltRenderHook = /ctx\.fillText\("OYUN DURDU", 400, 200\);\s*ctx\.font = "bold 20px Arial";\s*ctx\.fillText\(haltReason, 400, 240\);\s*ctx\.textAlign = "left"; \/\/ reset/g;
    
    const varRenderLogic = `ctx.fillText("OYUN DURDU", 400, 200);
                  ctx.font = "bold 20px Arial";
                  ctx.fillText(haltReason, 400, 240);
                  
                  // VAR GÖRSEL ÇİZİMİ
                  if (typeof window.varStatus !== 'undefined' && window.varStatus !== 'none') {
                      let timeRemaining = window.varTimer - Date.now();
                      
                      // 1. Mavi Çizgi (Savunma)
                      if (timeRemaining < 30000 || window.varStatus !== 'monitor') {
                          window.varLineDefX = window.varScoringTeam === 'home' ? 700 : 100;
                          ctx.strokeStyle = 'blue'; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(window.varLineDefX, 50); ctx.lineTo(window.varLineDefX, 450); ctx.stroke();
                      }
                      
                      // 2. Kırmızı Çizgi (Hücum) gerilimle çekilir
                      if (timeRemaining < 15000 || (window.varStatus !== 'monitor' && timeRemaining < 8000)) {
                          let offsetX = window.varDecision === 'offside' ? 20 : -20;
                          if (window.varScoringTeam === 'away') offsetX *= -1; // Yön değişimi
                          window.varLineAttX = window.varLineDefX + offsetX;
                          
                          ctx.strokeStyle = 'red'; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(window.varLineAttX, 50); ctx.lineTo(window.varLineAttX, 450); ctx.stroke();
                          
                          ctx.fillStyle = 'white'; ctx.font = "14px Arial";
                          ctx.fillText("OFSAYT ÇİZGİSİ ÇEKİLİYOR...", 400, 280);
                      }
                      
                      // KARAR ANI
                      if (timeRemaining <= 0) {
                          if (window.varDecision === 'offside') {
                              if(typeof speak === 'function') speak("VE KARAR OFSAYT! Gol iptal ediliyor. Savunma takımı derin bir nefes aldı!");
                              if(typeof announcerText !== 'undefined') announcerText.textContent = "GOL İPTAL - OFSAYT!";
                              // Skoru geri al
                              if (window.varScoringTeam === 'home') playerScore--;
                              else enemyScore--;
                              updateScoreBoard();
                              
                              // Hayal Kırıklığı ve Dopamin Değişimi
                              let attTeam = window.varScoringTeam === 'home' ? homePlayers : awayPlayers;
                              let defTeam = window.varScoringTeam === 'home' ? awayPlayers : homePlayers;
                              attTeam.forEach(p => { if(p.emotions) { p.emotions.sadness = 100; p.emotions.happiness = 0; } });
                              defTeam.forEach(p => { if(p.bio) p.bio.dopamine = 100; });
                          } else {
                              if(typeof speak === 'function') speak("GOL GEÇERLİ! VAR odası ofsayt olmadığını tespit etti.");
                              if(typeof announcerText !== 'undefined') announcerText.textContent = "GOL KARARI ONAYLANDI!";
                          }
                          window.varStatus = 'none';
                          isGameHalted = false; // Oyun başlar
                          if (window.AudioManager) window.AudioManager.ambiance.volume = 0.4;
                      }
                  }
                  
                  ctx.textAlign = "left"; // reset`;
                  
    if (content.match(haltRenderHook) && !content.includes('VAR GÖRSEL ÇİZİMİ')) {
        content = content.replace(haltRenderHook, varRenderLogic);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - VAR Sistemi ve İtiraz mekaniği başarıyla eklendi.");
    } else {
        console.log("Oyun durma çizim kancası (haltRenderHook) bulunamadı veya daha önce eklendi.");
        // Try fallback
        const fbHook = /ctx\.fillText\(haltReason, 400, 240\);\s*ctx\.textAlign = "left";/g;
        if(content.match(fbHook)){
            let fbLogic = `ctx.fillText(haltReason, 400, 240);
                  // VAR GÖRSEL ÇİZİMİ
                  if (typeof window.varStatus !== 'undefined' && window.varStatus !== 'none') {
                      let timeRemaining = window.varTimer - Date.now();
                      
                      // 1. Mavi Çizgi (Savunma)
                      if (timeRemaining < 30000 || window.varStatus !== 'monitor') {
                          window.varLineDefX = window.varScoringTeam === 'home' ? 700 : 100;
                          ctx.strokeStyle = 'blue'; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(window.varLineDefX, 50); ctx.lineTo(window.varLineDefX, 450); ctx.stroke();
                      }
                      
                      // 2. Kırmızı Çizgi (Hücum)
                      if (timeRemaining < 15000 || (window.varStatus !== 'monitor' && timeRemaining < 8000)) {
                          let offsetX = window.varDecision === 'offside' ? 20 : -20;
                          if (window.varScoringTeam === 'away') offsetX *= -1; 
                          window.varLineAttX = window.varLineDefX + offsetX;
                          
                          ctx.strokeStyle = 'red'; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(window.varLineAttX, 50); ctx.lineTo(window.varLineAttX, 450); ctx.stroke();
                      }
                      
                      // KARAR
                      if (timeRemaining <= 0) {
                          if (window.varDecision === 'offside') {
                              if(typeof speak === 'function') speak("VE KARAR OFSAYT! Gol iptal ediliyor.");
                              if(typeof announcerText !== 'undefined') announcerText.textContent = "GOL İPTAL - OFSAYT!";
                              if (window.varScoringTeam === 'home') playerScore--;
                              else enemyScore--;
                              updateScoreBoard();
                          } else {
                              if(typeof speak === 'function') speak("GOL GEÇERLİ! VAR ofsayt yok dedi.");
                              if(typeof announcerText !== 'undefined') announcerText.textContent = "GOL GEÇERLİ!";
                          }
                          window.varStatus = 'none';
                          isGameHalted = false; 
                      }
                  }
                  ctx.textAlign = "left";`;
             content = content.replace(fbHook, fbLogic);
             fs.writeFileSync(gameFile, content, 'utf8');
             console.log("game.js - VAR Sistemi (Fallback ile) başarıyla eklendi.");
        }
    }
} else {
    console.log("game.js bulunamadı!");
}

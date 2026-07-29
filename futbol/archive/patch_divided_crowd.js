const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Add window.isCrowdDivided calculation to updateCrowdForm
    const crowdFormHook = /if \(window\.CrowdForm !== newForm\) \{/g;
    const dividedCode = `
      // Yan Form 1: Bölünmüş Tribün (İç Savaş)
      window.isCrowdDivided = false;
      if (newForm === 2 || newForm === 3) {
          // Otorite ne tam sağlam ne tam bitikse tribün kutuplaşır
          if (window.managerAuthority >= 40 && window.managerAuthority <= 60 && Math.random() < 0.3) {
              window.isCrowdDivided = true;
          }
      }
      
      if (window.CrowdForm !== newForm) {`;
      
    if (content.match(crowdFormHook) && !content.includes('Yan Form 1: Bölünmüş Tribün')) {
        content = content.replace(crowdFormHook, dividedCode);
    }

    // 2. Add Divided Crowd mechanics to matchTimer
    const matchTimerHook = /if \(typeof window\.updateCrowdForm === 'function'\) window\.updateCrowdForm\(\);/g;
    const dividedMechanicCode = `if (typeof window.updateCrowdForm === 'function') window.updateCrowdForm();
                
                // AŞAMA 78: Bölünmüş Tribün Kaosu
                if (window.isCrowdDivided && typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.15) {
                    if (window.AudioManager) {
                        let c = new Audio('sounds/cheer.ogg'); c.volume = 0.5; c.play().catch(e=>{});
                        let b = new Audio('sounds/boo.ogg'); b.volume = 0.5; b.play().catch(e=>{});
                    }
                    if(typeof speak === 'function') speak("İnanılmaz bir kaos var! Tribünün bir tarafı takımı ıslıklarken, diğer taraf ıslıklayanları yuhalıyor. İç savaş çıktı resmen!");
                    
                    // Oyuncuların kafa karışıklığı ve odak kaybı
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            if (Math.random() < 0.4) p.isStunned = true; // Kime yaranacağını bilemez, donup kalır
                        });
                    }
                }`;
                
    if (content.match(matchTimerHook) && !content.includes('AŞAMA 78: Bölünmüş Tribün Kaosu')) {
        content = content.replace(matchTimerHook, dividedMechanicCode);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Yan Form 1: Bölünmüş Tribün eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

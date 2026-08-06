const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Hedeflediğimiz satır:
    // let rand = Math.random();
    // let msgs;
    // if (isRefMistake) {
    const hook = /if \(isRefMistake\) \{/g;
    const newHook = `if (isRefMistake) {
                                  // AŞAMA 79: Dış Düşman Etkisi (Ani Kenetlenme)
                                  let isHomePlayer = (typeof homePlayers !== 'undefined' && typeof p !== 'undefined' && homePlayers.includes(p));
                                  if (isHomePlayer && typeof window.CrowdForm !== 'undefined' && window.CrowdForm >= 3) {
                                      window.CrowdForm = 1; // Form 1'e geri dön (Kenetlenme)
                                      if (typeof window.managerAuthority !== 'undefined') window.managerAuthority = Math.min(100, window.managerAuthority + 30);
                                      if (typeof window.presidentConfidence !== 'undefined') window.presidentConfidence = Math.min(100, window.presidentConfidence + 30);
                                      
                                      homePlayers.forEach(hp => {
                                          hp.stamina = 120; // Full enerji
                                          hp.speed = (hp.baseSpeed || 3) * 1.5; // Kudurmuş gibi basarlar
                                          hp.power = (hp.power || 50) + 20;
                                          hp.mistakes = 0;
                                          hp.isBooedByOwnFans = false; // Günah keçisi affedilir
                                      });
                                      
                                      if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('home');
                                      
                                      if(typeof speak === 'function') setTimeout(() => speak("Az önce kendi futbolcusuna küfreden taraftar, hakemin bu haksız kararıyla bir anda kenetlendi! Bizim çocuğumuzu yedirmeyiz nidalarıyla stadyum tekrar cehenneme dönüştü! Futbolcular sahada 15 kişi gibi basmaya başladılar!"), 4000);
                                  }
    `;
    
    if (content.match(hook) && !content.includes('AŞAMA 79: Dış Düşman Etkisi (Ani Kenetlenme)')) {
        content = content.replace(hook, newHook);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Dış Düşman Etkisi (Ani Kenetlenme) eklendi.");
    } else {
        console.log("Hook noktası bulunamadı veya zaten eklenmiş.");
    }
} else {
    console.log("game.js bulunamadı!");
}

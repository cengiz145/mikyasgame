const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. initGame'de Protestoyu başlat
    const initGameHook = /window\.AudioManager\.startAmbiance\(\);/g;
    const newInitGame = `window.AudioManager.startAmbiance();
          
          // AŞAMA 73: Sessizlik Protestosu
          window.isSilentProtest = false;
          if ((window.consecutiveLosses >= 2 && Math.random() < 0.6) || (window.managerAuthority < 40 && Math.random() < 0.5)) {
              window.isSilentProtest = true;
          }`;
    if (content.match(initGameHook) && !content.includes('AŞAMA 73: Sessizlik Protestosu')) {
        content = content.replace(initGameHook, newInitGame);
    }

    // 2. Koreografiyi engelle ve sessizlik başlat
    const koreografiHook = /let isCriticalMatch = window\.isDerbyMatch \|\| window\.isChampionsLeague;/g;
    const newKoreografiCode = `let isCriticalMatch = window.isDerbyMatch || window.isChampionsLeague;
                
                if (window.isSilentProtest) {
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
                    if(typeof speak === 'function') speak("Santra yapıldı ama stadyumda inanılmaz, ürkütücü bir sessizlik var. Tribünler, alınan kötü sonuçları protesto etmek için ilk 15 dakika tek kelime bile etmeme kararı almış. Sahada sadece topun ve futbolcuların sesleri yankılanıyor.");
                    isCriticalMatch = false; // Sessizlik varsa koreografi iptal
                    
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            p.speed = (p.speed || 3) * 0.8; // Eli ayağına dolaşır
                            p.mistakes = (p.mistakes || 0) + 1; // Pas hataları artar
                        });
                    }
                }`;
    if (content.match(koreografiHook) && !content.includes('window.isSilentProtest) {')) {
        content = content.replace(koreografiHook, newKoreografiCode);
    }

    // 3. Protestoyu bitirme (matchTimer içinde)
    const matchTimerHook = /timeLeft--;/g;
    const endProtestCode = `timeLeft--;
                
                // Sessizlik Protestosu Bitişi
                if (window.isSilentProtest && timeLeft <= 75) {
                    window.isSilentProtest = false;
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.6;
                    if(typeof speak === 'function') speak("Ve 15 dakikalık o korkutucu sessizlik protestosu bitti. Tribünler takıma tam destek vermeye başladı, oyuncular derin bir nefes aldı!");
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            p.speed = (p.speed || 3) / 0.8; // Normale döner
                        });
                    }
                }`;
    
    if (content.match(matchTimerHook) && !content.includes('Sessizlik Protestosu Bitişi')) {
        content = content.replace(matchTimerHook, endProtestCode);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Sessizlik Protestosu mekaniği eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

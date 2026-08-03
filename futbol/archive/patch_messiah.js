const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Günah keçisi seçilme mantığını değiştir (Mesih'i ayır)
    const mistakeHook = /if \(closestHome\.p\.mistakes >= 3 && !closestHome\.p\.isBooedByOwnFans\) \{/g;
    const newMistakeLogic = `if (closestHome.p.mistakes >= 3 && !closestHome.p.isBooedByOwnFans) {
                    // AŞAMA 80: Yan Form 2 - Mesih Kompleksi (Kurtarıcıya Tapınma)
                    if (window.CrowdForm >= 3 && closestHome.p.isWorldClass) {
                         closestHome.p.isMessiah = true;
                         closestHome.p.mistakes = 0; // Taraftar hatasını anında siler
                         
                         if (window.AudioManager) {
                             let cheer = new Audio('sounds/cheer.ogg'); cheer.volume = 0.8; cheer.play().catch(e=>{});
                         }
                         if(typeof speak === 'function') {
                             let msg = "İnanılmaz bir çifte standart! Diğer oyuncular hata yapınca yuhalanıyor, ama stadyumun sevgilisi " + closestHome.p.name + " topu ezdiğinde büyük bir destek alkışı aldı!";
                             speak(msg);
                             if(typeof announcerText !== 'undefined') announcerText.textContent = "ÇİFTE STANDART: MESİH ALKIŞLANDI!";
                         }
                         
                         // Takım içi ihanet ve kıskançlık
                         homePlayers.forEach(hp => {
                             if (hp !== closestHome.p) {
                                 hp.isJealous = true;
                                 hp.power = (hp.power || 50) * 0.7; // Hiyerarşi çöküşü
                             }
                         });
                    } else if (window.CrowdForm >= 3) {
                        closestHome.p.isBooedByOwnFans = true;`;
                        
    if (content.match(mistakeHook) && !content.includes('AŞAMA 80: Yan Form 2')) {
        content = content.replace(mistakeHook, newMistakeLogic);
        
        // Kapatma parantezini mevcut if/else zincirine uydurmalıyız
        // Eski kod:
        // if (closestHome.p.mistakes >= 3 && !closestHome.p.isBooedByOwnFans) {
        //     closestHome.p.isBooedByOwnFans = true;
        //     if(typeof speak === 'function') {
        //        let msgs = [ ... ];
        //        let m = msgs[Math.floor(Math.random()*msgs.length)];
        //        speak(m);
        //        if(typeof announcerText !== 'undefined') announcerText.textContent = "GÜNAH KEÇİSİ İLAN EDİLDİ!";
        //     }
        // }
        // We need to add the closing brace properly. We replaced `if (...) {` with `if (...) { ... } else if (...) { closestHome.p.isBooedByOwnFans = true;`
        // So the old closing brace `}` now correctly closes the `else if`. Wait, this means we added an `if` inside the original `if`'s spot, effectively wrapping the old logic in the `else if`. Yes!
    } else {
        console.log("Mistake hook not found or already patched.");
    }

    // 2. Kıskanç oyuncuların Mesih'e pas atmama ihtimali (Pas Ambargosu 2)
    // Sadece Form 4'te ambargo uygulanır
    const passHook1 = /if \(p !== activePlayer && !\(p\.isBooedByOwnFans && window\.CrowdForm === 4\)\) \{/g;
    const newPassHook1 = `if (p !== activePlayer && !(p.isBooedByOwnFans && window.CrowdForm === 4) && !(p.isMessiah && typeof activePlayer !== 'undefined' && activePlayer.isJealous && Math.random() < 0.6)) {`;
    
    if (content.match(passHook1)) {
        content = content.replace(passHook1, newPassHook1);
    }
    
    // Ayrıca top Messihe geldiğinde sürekli alkışlanması eklenebilir.
    const ballTouchHook = /if \(p === activePlayer && p\.isBooedByOwnFans && ball\.team === 'home' && Math\.random\(\) < 0\.02 && window\.AudioManager\) \{/g;
    const newBallTouch = `if (p === activePlayer && p.isMessiah && ball.team === 'home' && Math.random() < 0.05 && window.AudioManager && window.CrowdForm >= 3) {
              let cheer = new Audio('sounds/cheer.ogg'); cheer.volume = 0.5; cheer.play().catch(e=>{});
          }
          
          if (p === activePlayer && p.isBooedByOwnFans && ball.team === 'home' && Math.random() < 0.02 && window.AudioManager) {`;
          
    if (content.match(ballTouchHook) && !content.includes('p.isMessiah && ball.team')) {
        content = content.replace(ballTouchHook, newBallTouch);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Mesih Kompleksi (Kurtarıcıya Tapınma) eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

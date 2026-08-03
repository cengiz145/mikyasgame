const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Hook the Oley pass counter
    const oleyHook = /if \(window\.consecutivePasses >= 4\) \{[\s\S]*?awayPlayers\.forEach\(ap => \{[\s\S]*?ap\.speed \*= 0\.95; \n                      \}\);/g;
    const newOleyCode = `if (window.consecutivePasses >= 4) {
                      window.isOleyActive = true;
                      
                      let oleyAudio = new Audio('sounds/oley.ogg');
                      oleyAudio.volume = 1.0;
                      oleyAudio.play().catch(e => {
                          let altCheer = new Audio('sounds/cheer.ogg');
                          altCheer.volume = 0.6;
                          altCheer.play().catch(err=>{});
                      });

                      if (window.consecutivePasses === 4 && typeof speak === 'function') {
                          speak("Tribünler her pasta 'Oley' çekiyor! Rakibin sinirleri laçka oldu.");
                      } else if (Math.random() < 0.5 && typeof speak === 'function') {
                          speak("Oley!");
                      }
                      if(typeof announcerText !== 'undefined') announcerText.textContent = "Oley!";
                      
                      // Rakip morali Düşer ve AGRESİFLEŞİR (Sinirden faul yapmaya başlarlar)
                      if (typeof awayPlayers !== 'undefined') {
                          awayPlayers.forEach(ap => {
                              ap.speed *= 0.95; 
                          });
                      }`;

    if (content.match(oleyHook) && !content.includes('window.isOleyActive = true')) {
        content = content.replace(oleyHook, newOleyCode);
    }

    // 2. Clear Oley phase when the ball is lost
    const passResetHook = /window\.consecutivePasses = 0;/g;
    const newPassReset = `window.consecutivePasses = 0; window.isOleyActive = false;`;
    if (content.match(passResetHook) && !content.includes('window.isOleyActive = false')) {
        content = content.replace(passResetHook, newPassReset);
    }

    // 3. Foul Chance Explosion during Oley
    const foulChanceHook = /let foulChance = isTier2Emotional \? 0\.05 : 0\.02;/g;
    const newFoulChance = `let foulChance = isTier2Emotional ? 0.05 : 0.02;
          if (window.isOleyActive && teamType === 'away') {
              foulChance = 0.80; // Sinirden deliye dönmüş durumdalar, topla alakaları yok doğrudan adama girerler!
          }`;
    if (content.match(foulChanceHook) && !content.includes("window.isOleyActive && teamType === 'away'")) {
        content = content.replace(foulChanceHook, newFoulChance);
    }
    
    // 4. Red Card chance explosion during Oley
    const redChanceHook = /let redChance = isTier2Emotional \? 0\.6 : 0\.3;/g;
    const newRedChance = `let redChance = isTier2Emotional ? 0.6 : 0.3;
                  if (window.isOleyActive && teamType === 'away') {
                      redChance = 0.90; // Oley çekilirken faul yaparlarsa genelde kasti tekmeyle adamı indirirler (Kırmızı)
                      if(typeof speak === 'function' && Math.random() < 0.2) speak("Oley paslarından iyice sinirlenen deplasman oyuncusu, top yerine direkt rakibinin ayağına acımasızca vurdu!");
                  }`;
    if (content.match(redChanceHook) && !content.includes("redChance = 0.90")) {
        content = content.replace(redChanceHook, newRedChance);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Oley Psikolojisi ve Agresif Fauller Eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

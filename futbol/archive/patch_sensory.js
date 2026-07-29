const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Oyuncuların oluşturulmasına arkadaşlık bağını (friends) ekle
    // homePlayers push
    const homeHook = /emotions: \{ happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 \} \n          \}\);/g;
    const homeReplace = `emotions: { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 },
              friends: [], direction: 0, prevX: homeFormations[i].x, prevY: homeFormations[i].y
          });`;
    if (content.match(homeHook)) content = content.replace(homeHook, homeReplace);

    // 2. Oyuncu hareket ederken direction (Baktığı yön) hesapla
    const decayHook = /let staminaDecay = dist \* 0\.0005;/g;
    const directionLogic = `let staminaDecay = dist * 0.0005;
          // Duyusal Ağ - Yön Hesaplama
          if (dist > 0.5) {
              p.direction = Math.atan2(p.y - p.prevY, p.x - p.prevX);
          }
          p.prevX = p.x; p.prevY = p.y;`;
    if (content.match(decayHook) && !content.includes('p.direction = Math.atan2')) {
        content = content.replace(decayHook, directionLogic);
    }

    // 3. doPassLogic içerisindeki pas tercihini FOV, Ping ve Arkadaşlığa göre filtrele
    const passLogicHook = /let minD = Infinity;\s*homePlayers\.forEach\(p => \{\s*if \(p !== activePlayer && \!\(p\.isBooedByOwnFans && window\.CrowdForm === 4\) && \!\(p\.isMessiah && typeof activePlayer \!\=\= 'undefined' && activePlayer\.isJealous && Math\.random\(\) < 0\.6\)\) \{\s*\/\/ Sadece Form 4'te ambargo uygulanr\s*let dx = p\.x - activePlayer\.x;\s*let dy = p\.y - activePlayer\.y;\s*let d = Math\.sqrt\(dx\*dx \+ dy\*dy\);\s*if \(d < minD\) \{ minD = d; closestTeammate = p; \}\s*\}\s*\}\);/g;
    
    const passLogicHookRegex2 = /let minD = Infinity;\s*homePlayers\.forEach\(p => \{\s*if \(p !== activePlayer[\s\S]*?\}\s*\}\);/m;

    const newPassLogic = `
          let minD = Infinity;
          
          // Arkadaşlık bağlarını rastgele ata (Eğer yoksa)
          if (homePlayers[0] && homePlayers[0].friends && homePlayers[0].friends.length === 0) {
              homePlayers.forEach(hp => {
                  let friend1 = homePlayers[Math.floor(Math.random() * homePlayers.length)];
                  let friend2 = homePlayers[Math.floor(Math.random() * homePlayers.length)];
                  if(friend1 !== hp) hp.friends.push(friend1.id);
                  if(friend2 !== hp && friend2 !== friend1) hp.friends.push(friend2.id);
              });
          }

          let crowdNoise = (window.CrowdForm >= 3) ? 100 : 20; // 100 desibel ise sağırlık başlar
          
          homePlayers.forEach(p => {
              if (p !== activePlayer && !(p.isBooedByOwnFans && window.CrowdForm === 4) && !(p.isJealous)) { 
                  let dx = p.x - activePlayer.x;
                  let dy = p.y - activePlayer.y;
                  let d = Math.sqrt(dx*dx + dy*dy);
                  
                  // Görüş Açısı (FOV) - 120 Derece
                  let angleToMate = Math.atan2(dy, dx);
                  let angleDiff = Math.abs(activePlayer.direction - angleToMate);
                  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                  
                  let isVisible = angleDiff < (Math.PI / 1.5); // 60 derece sağ, 60 derece sol
                  
                  // Duyma Duyusu (Ping - Sessiz Çığlık)
                  let pingHeard = false;
                  if (!isVisible && crowdNoise < 80) { // Gürültü azsa duyar
                      pingHeard = true;
                  }
                  
                  // Eğer göremiyorsa ve sağırsa pas atamaz (Görmezden gelir)
                  if (isVisible || pingHeard) {
                      // Arkadaşlık Bağı (Chemistry)
                      let isBestFriend = activePlayer.friends && activePlayer.friends.includes(p.id);
                      let score = d; // Düşük skor daha iyi
                      
                      if (isBestFriend) score -= 150; // Arkadaşına daha kolay pas atar
                      if (!isVisible && pingHeard && isBestFriend) score -= 50; // Arkadaşının sesini hemen tanır
                      
                      if (score < minD) { minD = score; closestTeammate = p; }
                  }
              }
          });
    `;

    if (content.match(passLogicHookRegex2) && !content.includes('Görüş Açısı (FOV)')) {
        content = content.replace(passLogicHookRegex2, newPassLogic);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Duyusal Ağ (Görme, Duyma) ve Arkadaşlık Bağı başarıyla eklendi.");
    } else {
         console.log("doPassLogic içindeki hedef seçme kancası bulunamadı. Lütfen kontrol et.");
    }

} else {
    console.log("game.js bulunamadı!");
}

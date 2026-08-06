const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. startGame() içindeki gameActive hook
    const gameActiveHook = /gameActive = true;\s*isPaused = false;/g;
    const preMatchLogic = `
      window.isPreMatch = true;
      gameActive = true;
      isPaused = false;
      
      let ceremonyX = 400;
      homePlayers.forEach((p, idx) => {
          p.targetX = p.x; p.targetY = p.y; 
          p.x = ceremonyX - 20; p.y = 100 + (idx * 25);
          p.speed = 0;
      });
      awayPlayers.forEach((p, idx) => {
          p.targetX = p.x; p.targetY = p.y; 
          p.x = ceremonyX + 20; p.y = 100 + (idx * 25);
          p.speed = 0;
      });
      
      window.runPreMatchCeremony = function() {
          let gk = homePlayers.find(p => p.position === 'Kaleci') || homePlayers[0];
          let def1 = homePlayers[1];
          let def2 = homePlayers[2];
          let striker = homePlayers[10];
          
          let msgs = [
              { t: 0, text: "Ekranları başındaki futbolseverler, herkese iyi akşamlar! Futbolun sadece futbol olmadığı o büyük gecelerden birindeyiz...", ui: "MAÇ ÖNCESİ SEREMONİSİ" },
              { t: 6000, text: "Kalede güven veren elleriyle " + gk.name + " var. Defans hattında " + def1.name + " ve " + def2.name + " görev yapacak.", ui: "İLK 11'LER OKUNUYOR" },
              { t: 14000, text: "İleri uçta ise takımın en büyük gol umudu, " + striker.name + " ağları havalandırmak için sahada!", ui: "İLK 11'LER OKUNUYOR" },
              { t: 20000, text: "Hocanın bugün dengeli bir taktikle sahaya çıktığını görüyoruz.", ui: "TAKTİK ANALİZ" },
              { t: 25000, text: "Rakip takım ise kudurmuş bir yapıyla oynayacak. Galiba bizi çok gollü ve açık bir maç bekliyor!", ui: "TAKTİK ANALİZ" },
              { t: 32000, text: "Oyuncular sahadaki yerlerini alıyor...", ui: "DÜDÜK BEKLENİYOR" },
              { t: 35000, text: "Ve hakemin ilk düdüğüyle maç başlıyor!", ui: "" }
          ];
          
          msgs.forEach(msg => {
              setTimeout(() => {
                  if(typeof speak === 'function') speak(msg.text);
                  if(typeof announcerText !== 'undefined' && msg.ui) announcerText.textContent = msg.ui;
                  
                  if (msg.t === 32000) {
                      homePlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                      awayPlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                  }
                  if (msg.t === 35000) {
                      window.isPreMatch = false; 
                  }
              }, msg.t);
          });
      };
      runPreMatchCeremony();
    `;
    
    if (content.match(gameActiveHook) && !content.includes('window.runPreMatchCeremony')) {
        content = content.replace(gameActiveHook, preMatchLogic);
    }
    
    // 2. gameLoop'un en başına isPreMatch kontrolü koy
    const loopHook = /function gameLoop\(\) \{\s*if \(isPaused && gameActive\) \{ requestAnimationFrame\(gameLoop\); return; \}\s*if \(!gameActive\) return;/g;
    const newLoopStart = `function gameLoop() {
      if (isPaused && gameActive) { requestAnimationFrame(gameLoop); return; }
      if (!gameActive) return;
      
      if (window.isPreMatch) {
          if (typeof ctx !== 'undefined') {
              ctx.clearRect(0, 0, 800, 500);
              ctx.fillStyle = '#27ae60'; ctx.fillRect(0, 0, 800, 500);
              ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.rect(0, 0, 800, 500); ctx.moveTo(400, 0); ctx.lineTo(400, 500);
              ctx.arc(400, 250, 50, 0, Math.PI*2); ctx.stroke();
              
              homePlayers.forEach(p => { ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill(); });
              awayPlayers.forEach(p => { ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill(); });
              
              ctx.fillStyle = 'white'; ctx.font = "bold 20px Arial"; ctx.textAlign = "center";
              ctx.fillText("MAÇ ÖNCESİ SEREMONİSİ", 400, 50);
              ctx.textAlign = "left";
          }
          requestAnimationFrame(gameLoop);
          return;
      }`;
      
    if (content.match(loopHook) && !content.includes('if (window.isPreMatch) {')) {
        content = content.replace(loopHook, newLoopStart);
    }
    
    // 3. matchTimer hook
    const timerHook = /if\(\!isPaused && gameActive\)/g;
    const newTimerHook = `if(!isPaused && gameActive && !window.isPreMatch)`;
    if (content.match(timerHook)) {
        content = content.replace(timerHook, newTimerHook);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Maç Öncesi Seremonisi ve Spiker yaması başarıyla eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

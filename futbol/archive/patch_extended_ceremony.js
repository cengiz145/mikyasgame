const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. msgs array ve setTimeout logic replacement
    const oldMsgsLogic = /let msgs = \[\s*\{ t: 0,[\s\S]*?if \(msg\.t === 60000\) \{\s*window\.isPreMatch = false;\s*\}\s*\}, msg\.t\);\s*\}\);/m;

    const newMsgsLogic = `let msgs = [
                { t: 0, text: "Ekranları başındaki futbolseverler, herkese iyi akşamlar! Futbolun sadece futbol olmadığı o büyük gecelerden birindeyiz...", ui: "MAÇ ÖNCESİ SEREMONİSİ" },
                { t: 10000, text: "Kalede güven veren elleriyle " + gk.name + " var. Defans hattında " + def1.name + " ve " + def2.name + " görev yapacak.", ui: "İLK 11'LER OKUNUYOR" },
                { t: 20000, text: "İleri uçta ise takımın en büyük gol umudu, " + striker.name + " ağları havalandırmak için sahada!", ui: "İLK 11'LER OKUNUYOR" },
                { t: 30000, text: "Hocanın bugün dengeli bir taktikle sahaya çıktığını görüyoruz. Rakip takım ise kudurmuş bir yapıyla oynayacak.", ui: "TAKTİK ANALİZ" },
                { t: 40000, text: "Ve şimdi... Stadyumdaki on binlerce taraftarla birlikte İstiklal Marşımız!", ui: "İSTİKLAL MARŞI" },
                { t: 115000, text: "İstiklal Marşımız büyük bir coşkuyla okundu.", ui: "MARŞ SONA ERDİ" },
                { t: 120000, text: "Hakem ve takım kaptanları para atışı için orta yuvarlakta.", ui: "KURA ÇEKİMİ (PARA ATIŞI)" },
                { t: 125000, text: "Para atışı yapıldı! Maça ilk başlayacak takım kura sonucu belirleniyor...", ui: "KURA SONUCU BEKLENİYOR" },
                { t: 132000, text: "Oyuncular sahadaki yerlerini alıyor...", ui: "DÜDÜK BEKLENİYOR" },
                { t: 135000, text: "Ve hakemin ilk düdüğüyle o büyük maç başlıyor!", ui: "" }
            ];
            
            msgs.forEach(msg => {
                setTimeout(() => {
                    if(typeof speak === 'function') speak(msg.text);
                    if(typeof announcerText !== 'undefined' && msg.ui) announcerText.textContent = msg.ui;
                    
                    if (msg.t === 125000) {
                        window.coinTossWinner = Math.random() < 0.5 ? 'home' : 'away';
                        ball.team = window.coinTossWinner;
                        let winnerName = window.coinTossWinner === 'home' ? "Bizim Takım" : "Rakip Takım";
                        if(typeof speak === 'function') speak("Kurayı kazanan " + winnerName + " oldu. Top onlarda başlayacak.");
                        if(typeof announcerText !== 'undefined') announcerText.textContent = "SANTRA HAKKI: " + winnerName.toUpperCase();
                    }
                    
                    if (msg.t === 132000) {
                        homePlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                        awayPlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                    }
                    if (msg.t === 135000) {
                        window.isPreMatch = false; 
                    }
                }, msg.t);
            });`;

    if (content.match(oldMsgsLogic)) {
        content = content.replace(oldMsgsLogic, newMsgsLogic);
    } else {
        console.log("msgs dizisi hook'u bulunamadı.");
    }

    // 2. gameLoop UI replacement
    const uiTextHook = /ctx\.fillStyle = 'white'; ctx\.font = "bold 20px Arial"; ctx\.textAlign = "center";\s*ctx\.fillText\("MA[^\"]* -NCES[^\"]* SEREMON[^\"]*S[^\"]*", 400, 50\);\s*ctx\.textAlign = "left";/gm;
    
    // Also try normal ascii
    const uiTextHook2 = /ctx\.fillStyle = 'white'; ctx\.font = "bold 20px Arial"; ctx\.textAlign = "center";\s*ctx\.fillText\("MAÇ ÖNCESİ SEREMONİSİ", 400, 50\);\s*ctx\.textAlign = "left";/gm;
    
    const newUI = `ctx.fillStyle = 'white'; ctx.font = "bold 20px Arial"; ctx.textAlign = "center";
              let uiText = (typeof announcerText !== 'undefined') ? announcerText.textContent : "MAÇ ÖNCESİ SEREMONİSİ";
              ctx.fillText(uiText, 400, 50);
              
              if (uiText === "İSTİKLAL MARŞI") {
                  ctx.fillStyle = 'rgba(231, 76, 60, 0.7)'; // Kırmızı tema
                  ctx.fillRect(0, 0, 800, 500);
                  ctx.fillStyle = 'white';
                  ctx.font = "bold 60px Arial";
                  ctx.fillText("İSTİKLAL MARŞI", 400, 250);
                  
                  // Türk Bayrağı Hilal ve Yıldız basit çizimi
                  ctx.beginPath(); ctx.arc(360, 320, 30, 0, Math.PI*2); ctx.fill();
                  ctx.fillStyle = 'rgba(231, 76, 60, 1.0)';
                  ctx.beginPath(); ctx.arc(370, 320, 25, 0, Math.PI*2); ctx.fill();
                  
                  ctx.fillStyle = 'white';
                  ctx.beginPath();
                  ctx.moveTo(410, 310); ctx.lineTo(420, 330); ctx.lineTo(400, 320); ctx.lineTo(420, 310); ctx.lineTo(410, 330);
                  ctx.fill();
              }
              ctx.textAlign = "left";`;
              
    if (content.match(uiTextHook)) {
        content = content.replace(uiTextHook, newUI);
    } else if (content.match(uiTextHook2)) {
        content = content.replace(uiTextHook2, newUI);
    } else {
        console.log("UI text hook bulunamadı, muhtemelen encoding uyumsuzluğu var.");
        // Fallback: search for ctx.fillText(..., 400, 50)
        let fbHook = /ctx\.fillText\([^,]+, 400, 50\);\s*ctx\.textAlign = "left";/g;
        if (content.match(fbHook)) {
             content = content.replace(fbHook, newUI);
        }
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - 135 saniyelik İstiklal Marşı ve Para Atışı başarıyla eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

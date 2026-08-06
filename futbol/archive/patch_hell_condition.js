const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Eski kodu bul
    const oldHellHook = /\/\/ AŞAMA 68: İşitsel Koreografi[\s\S]*?\}, 2000\); \/\/ Maç başladıktan 2 saniye sonra tünel çıkışı reaksiyonu patlar/;
    
    // Sadece Derbi ve Şampiyonlar ligi şartıyla değiştir
    const newHellHook = `// AŞAMA 68: İşitsel Koreografi (Cehenneme Hoş Geldin) - SADECE DERBİ VE KRİTİK MAÇLARDA
          setTimeout(() => {
              let isCriticalMatch = window.isDerbyMatch || window.isChampionsLeague;
              if (isCriticalMatch) {
                  if (window.AudioManager && window.AudioManager.triggerWelcomeToHell) {
                      window.AudioManager.triggerWelcomeToHell(window.myTeamId || 'home');
                  }
                  // Ev Sahibi Takıma "Arkanızda Ordu Var" Özgüveni (İlk 15 dk için ekstra güç)
                  if (typeof strikerConfidence !== 'undefined') strikerConfidence = 150; 
                  if (typeof homePlayers !== 'undefined') {
                      homePlayers.forEach(p => { p.power = (p.power || 50) + 5; p.stamina = 120; });
                  }
                  // Deplasman Takımı Tehdit Altında ve Küçülmüş Hisseder
                  if (typeof awayPlayers !== 'undefined') {
                      awayPlayers.forEach(p => { 
                          p.speed = (p.speed || 3) * 0.85; // Bacakları titriyor
                          p.mistakes = 1; // Pas hatasına çok müsait başlarlar
                      });
                  }
              }
          }, 2000); // Maç başladıktan 2 saniye sonra tünel çıkışı reaksiyonu patlar`;

    if (content.match(oldHellHook)) {
        content = content.replace(oldHellHook, newHellHook);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Koreografi sadece Derbi/Kritik maçlara sınırlandı.");
    } else {
        console.log("Eski Koreografi kodu bulunamadı!");
    }
} else {
    console.log("game.js bulunamadı!");
}

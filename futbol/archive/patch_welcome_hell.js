const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Add triggerWelcomeToHell to AudioManager
    if (!content.includes('triggerWelcomeToHell:')) {
        const hellCode = `
    triggerWelcomeToHell: function(homeTeamId) {
        if (this.isMuted) return;
        
        try { this.initAudioContext(); } catch(e) { return; }

        if(typeof speak === 'function') speak("Takımlar tünelden çıkıyor... Ve stadyumda kulakları sağır eden bir desibel! Deplasman takımına resmen 'Cehenneme Hoş Geldiniz' diyorlar!");

        // 3 Sesi aynı anda çalarak devasa bir "Ses Duvarı" (Koreografi) yaratıyoruz
        let chantAudio = new Audio('sounds/chant_' + homeTeamId + '.ogg');
        let cheerAudio = new Audio('sounds/cheer.ogg');
        let booAudio = new Audio('sounds/boo.ogg');
        
        chantAudio.crossOrigin = "anonymous";
        cheerAudio.crossOrigin = "anonymous";
        booAudio.crossOrigin = "anonymous";

        let playHell = () => {
            let chantSource = this.audioCtx.createMediaElementSource(chantAudio);
            let cheerSource = this.audioCtx.createMediaElementSource(cheerAudio);
            let booSource = this.audioCtx.createMediaElementSource(booAudio);
            
            // Tüm sesler merkezden ama maksimum distorsiyon/reverb hissiyle
            chantSource.connect(this.audioCtx.destination);
            cheerSource.connect(this.audioCtx.destination);
            booSource.connect(this.audioCtx.destination);
            
            chantAudio.volume = 1.0;
            cheerAudio.volume = 0.8;
            booAudio.volume = 0.6; // Islıklar alt frekansta
            
            chantAudio.play().catch(e=>{});
            cheerAudio.play().catch(e=>{});
            booAudio.play().catch(e=>{});
            
            // 15 Saniye sonra ses şöleni biter
            setTimeout(() => {
                let fade = setInterval(() => {
                    if (chantAudio.volume > 0.05) {
                        chantAudio.volume -= 0.05;
                        cheerAudio.volume -= 0.04;
                        booAudio.volume -= 0.03;
                    } else {
                        clearInterval(fade);
                        chantAudio.pause();
                        cheerAudio.pause();
                        booAudio.pause();
                    }
                }, 200);
            }, 12000);
        };
        
        chantAudio.onerror = () => { chantAudio = new Audio('sounds/ambiance.ogg'); chantAudio.crossOrigin="anonymous"; playHell(); };
        setTimeout(() => { playHell(); }, 1000); // Maç başlar başlamaz patlar
    },`;
        content = content.replace('triggerBanter: function(awayTeamId, homeTeamId) {', hellCode + '\n    triggerBanter: function(awayTeamId, homeTeamId) {');
    }

    // 2. Hook into initGame
    const initGameHook = /window\.AudioManager\.startAmbiance\(\);/;
    const newInitGameCode = `window.AudioManager.startAmbiance();
          
          // AŞAMA 68: İşitsel Koreografi (Cehenneme Hoş Geldin)
          setTimeout(() => {
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
          }, 2000); // Maç başladıktan 2 saniye sonra tünel çıkışı reaksiyonu patlar`;

    if (content.match(initGameHook) && !content.includes('AŞAMA 68: İşitsel Koreografi')) {
        content = content.replace(initGameHook, newInitGameCode);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Cehenneme Hoş Geldin (Koreografi) eklendi.");
    } else {
        console.log("initGame hook noktası bulunamadı!");
    }

} else {
    console.log("game.js bulunamadı!");
}

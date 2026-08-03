const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. triggerAwayDominance ekle
    if (!content.includes('triggerAwayDominance:')) {
        const dominanceCode = `
    triggerAwayDominance: function(awayTeamId) {
        if (this.isMuted || this.isChanting) return;
        this.isChanting = true;
        
        try { this.initAudioContext(); } catch(e) { return; }

        let awayAudio = new Audio('sounds/chant_' + awayTeamId + '.ogg');
        awayAudio.crossOrigin = "anonymous";
        
        let playDominance = () => {
            let awaySource = this.audioCtx.createMediaElementSource(awayAudio);
            
            let awayPanner = this.audioCtx.createStereoPanner();
            awayPanner.pan.value = 0.4; // Sağda ama merkeze çok yakın, sesi dolduracak
            
            // DİKKAT: BOĞUKLAŞTIRMA FİLTRESİ (BiquadFilter) YOK! Sesi net ve gür çıkacak.
            awaySource.connect(awayPanner);
            awayPanner.connect(this.audioCtx.destination);
            
            awayAudio.volume = 1.0; // Maksimum ses
            awayAudio.play().catch(err=>{});
            
            if (this.ambiance) this.ambiance.volume = 0.05; // Ev sahibi tamamen sustu
            
            if(typeof speak === 'function') speak("Ev sahibi takım geriye düştü! Stadyumda ölüm sessizliği var, şu an sadece deplasman tribününün coşkulu marşları yankılanıyor!");

            setTimeout(() => {
                if(awayAudio) awayAudio.pause();
                this.isChanting = false;
                if (this.ambiance && !this.isMuted) this.ambiance.volume = 0.4;
            }, 12000); // 12 saniye boyunca deplasman takımı şov yapar
        };

        awayAudio.oncanplaythrough = playDominance;
        awayAudio.onerror = () => {
            awayAudio = new Audio('sounds/cheer.ogg');
            awayAudio.crossOrigin = "anonymous";
            playDominance();
        };
        setTimeout(() => { if (awayAudio.readyState >= 2) playDominance(); }, 500);
    },`;
        content = content.replace('triggerBanter: function(awayTeamId, homeTeamId) {', dominanceCode + '\n    triggerBanter: function(awayTeamId, homeTeamId) {');
    }

    // 2. enemyScore artınca tetikle
    const updateScoreHook = /function updateScoreBoard\(\) \{/;
    const newUpdateScoreHook = `function updateScoreBoard() {
    if (typeof enemyScore !== 'undefined' && typeof playerScore !== 'undefined' && enemyScore > playerScore) {
        // Geriye düştük, deplasman coşar
        if (window.AudioManager && !window.AudioManager.isChanting) {
            window.AudioManager.triggerAwayDominance(window.todayOpponent || 'away');
        }
    }`;
    
    if (content.match(updateScoreHook) && !content.includes('window.AudioManager.triggerAwayDominance')) {
        content = content.replace(updateScoreHook, newUpdateScoreHook);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Away Dominance sistemi eklendi.");
    } else {
        console.log("Hook noktası bulunamadı veya zaten eklendi!");
    }

} else {
    console.log("game.js bulunamadı!");
}

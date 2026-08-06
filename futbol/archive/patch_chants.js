const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. AudioManager güncellemeleri
    if (!content.includes('chantAudio: null')) {
        content = content.replace('miss: null,', 'miss: null,\n    chantAudio: null,\n    isChanting: false,');
        
        const chantFuncs = `
    startChant: function(teamId) {
        if (this.isMuted || this.isChanting) return;
        this.isChanting = true;
        
        // Takıma özel ses dosyasını dene
        this.chantAudio = new Audio('sounds/chant_' + teamId + '.ogg');
        this.chantAudio.volume = 0.8;
        
        // Eğer dosya bulunamazsa (404) catch ile yakalayıp cheer sesine dön
        this.chantAudio.play().catch(e => {
            console.log("Özel marş bulunamadı, genel tezahürata geçiliyor.");
            this.chantAudio = new Audio('sounds/cheer.ogg');
            this.chantAudio.volume = 0.6;
            this.chantAudio.loop = true;
            this.chantAudio.play().catch(err=>console.log(err));
        });
        
        if (this.ambiance) this.ambiance.volume = 0.1; // Ambiyansı kıs
        
        // 10 saniye sonra tezahüratı bitir
        setTimeout(() => {
            if (this.chantAudio) {
                this.chantAudio.pause();
                this.chantAudio = null;
            }
            this.isChanting = false;
            if (this.ambiance && !this.isMuted) this.ambiance.volume = 0.4;
        }, 15000);
    },`;
        content = content.replace('playMiss: function() {', chantFuncs + '\n    playMiss: function() {');
    }

    // 2. Tezahürat Tetikleme (updateGame veya skor anı)
    // game.js içinde timer ve skor kontrolü updateGame içinde veya saniye düştüğünde (timeLeft) yapılır
    // En iyisi "if (frameCount % 60 === 0)" bloğunun içine koymak
    const oldTimer = /if \(frameCount % 60 === 0\) \{[\s\S]*?timeLeft--;/;
    const newTimer = `if (frameCount % 60 === 0) {
        timeLeft--;
        
        // --- YENİ: TEZAHÜRAT VE MORAL SİSTEMİ ---
        if (timeLeft % 10 === 0 && window.AudioManager && !window.AudioManager.isChanting) {
            let sA = parseInt(document.getElementById('score-home').textContent) || 0;
            let sB = parseInt(document.getElementById('score-away').textContent) || 0;
            
            // Eğer fark 2 ise VEYA son 15 dakika galip isek
            if (sA - sB >= 2 || (timeLeft <= 15 && sA > sB)) {
                window.AudioManager.startChant(window.myTeamId || 'galatasaray');
                // Oyunculara gaz ver (Güçlerini artır)
                homePlayers.forEach(p => p.power += 2);
                if(typeof speak === 'function') speak("Taraftar takımının muhteşem oyununu ayakta alkışlıyor ve şampiyonluk şarkıları söylüyor!");
            }
        }
        // --- TEZAHÜRAT SİSTEMİ SONU ---`;
    if(content.match(oldTimer)) {
        content = content.replace(oldTimer, newTimer);
    } else {
        // Eğer frameCount % 60 yoksa başka bir yere ekle
        console.log("Timer bloğu bulunamadı, skor yerine ekleniyor.");
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Tezahürat (Chant) sistemi eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

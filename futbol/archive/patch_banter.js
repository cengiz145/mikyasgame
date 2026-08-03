const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    if (!content.includes('triggerBanter:')) {
        const banterCode = `
    triggerBanter: function(awayTeamId, homeTeamId) {
        if (this.isMuted || this.isChanting) return;
        this.isChanting = true;
        
        // 1. Deplasman taraftarı sesini yükseltir (Yuhalama veya Kendi Marşları)
        let awayChant = new Audio('sounds/chant_' + awayTeamId + '.ogg');
        awayChant.volume = 0.5;
        
        awayChant.play().catch(e => {
            awayChant = new Audio('sounds/boo.ogg'); // Marşı yoksa yuhalar
            awayChant.volume = 0.6;
            awayChant.play().catch(err=>{});
        });
        
        if(typeof speak === 'function') speak("Tribünlerde inanılmaz bir atışma var! Deplasman taraftarının tezahüratlarına, ev sahibi tribünler ıslıkla ve kendi marşlarıyla çok sert karşılık veriyor!");

        // 2. 4 saniye sonra Ev Sahibi taraftar çok daha yüksek sesle bastırır
        setTimeout(() => {
            let homeChant = new Audio('sounds/chant_' + homeTeamId + '.ogg');
            homeChant.volume = 1.0;
            homeChant.play().catch(e => {
                homeChant = new Audio('sounds/cheer.ogg'); // Marşı yoksa genel uğultu
                homeChant.volume = 1.0;
                homeChant.play().catch(err=>{});
            });
            
            // 3. İki ses birbiriyle karışıp 10 saniye sonra normale döner
            setTimeout(() => {
                if (awayChant) awayChant.pause();
                if (homeChant) homeChant.pause();
                this.isChanting = false;
            }, 10000);
        }, 4000);
    },`;
        content = content.replace('triggerPossessionReaction: function(team) {', banterCode + '\n    triggerPossessionReaction: function(team) {');
    }

    // game loop hook (updateGame)
    // We can hook inside the 1-second interval or random frame
    const randomHookRegex = /if \(typeof isGameHalted !== 'undefined' && !isGameHalted && typeof timeLeft !== 'undefined' && timeLeft < 45 && Math\.random\(\) < 0\.003 && !window\.substitutionDone\)/g;
    const randomHookReplacement = `
    // AŞAMA 62: TARAFTAR ATIŞMASI (BANTER)
    if (typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.002 && window.AudioManager && !window.AudioManager.isChanting) {
        // Beraberlik veya 1 fark varken gerginlik artar
        if (Math.abs(playerScore - enemyScore) <= 1) {
            window.AudioManager.triggerBanter('away', window.myTeamId || 'home');
        }
    }
    
    if (typeof isGameHalted !== 'undefined' && !isGameHalted && typeof timeLeft !== 'undefined' && timeLeft < 45 && Math.random() < 0.003 && !window.substitutionDone)`;

    if (content.match(randomHookRegex)) {
        content = content.replace(randomHookRegex, randomHookReplacement);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Taraftar Atışma (Banter) sistemi eklendi.");
    } else {
        console.log("Hook noktası bulunamadı!");
    }
} else {
    console.log("game.js bulunamadı!");
}

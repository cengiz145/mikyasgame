const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Replace the triggerBanter function with the Sabotage version
    const oldBanterRegex = /triggerBanter: function\(awayTeamId, homeTeamId\) \{[\s\S]*?\},/g;
    
    const newBanterCode = `triggerBanter: function(awayTeamId, homeTeamId) {
        if (this.isMuted || this.isChanting) return;
        this.isChanting = true;
        
        // 1. Deplasman taraftarı cılız bir şekilde marş söylemeye yeltenir
        let awayChant = new Audio('sounds/chant_' + awayTeamId + '.ogg');
        awayChant.volume = 0.6;
        
        awayChant.play().catch(e => {
            awayChant = new Audio('sounds/cheer.ogg'); 
            awayChant.volume = 0.6;
            awayChant.play().catch(err=>{});
        });
        
        if(typeof speak === 'function') speak("Deplasman taraftarı organize olup sesini yükseltmeye çalışıyor...");

        // 2. SADECE 1.5 Saniye Sonra: Ev Sahibi taraftar rahatsız olur ve inanılmaz bir ıslık/yuhalama kopar (Sabotaj)
        setTimeout(() => {
            let sabotageBoo = new Audio('sounds/boo.ogg');
            sabotageBoo.volume = 1.0; // Ev sahibi bastırır
            sabotageBoo.play().catch(err=>{});
            
            // Deplasman taraftarının sesi ıslıkların altında ezilir (Sesi kısılır)
            if (awayChant) {
                let fadeAway = setInterval(() => {
                    if (awayChant.volume > 0.1) {
                        awayChant.volume -= 0.1;
                    } else {
                        clearInterval(fadeAway);
                    }
                }, 200);
            }

            if(typeof speak === 'function') speak("Ve anında muazzam bir ıslık! Ev sahibi tribünler deplasman taraftarını anında susturuyor, stadyumu dar ediyorlar!");

            // 3. Olay 8 saniye sonra yatışır
            setTimeout(() => {
                if (awayChant) awayChant.pause();
                if (sabotageBoo) sabotageBoo.pause();
                this.isChanting = false;
            }, 8000);
        }, 1500); // 1.5 saniye tahammül edebiliyorlar :)
    },`;

    if (content.match(oldBanterRegex)) {
        content = content.replace(oldBanterRegex, newBanterCode);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Taraftar Sabotaj/Islık sistemi eklendi.");
    } else {
        console.log("triggerBanter fonksiyonu bulunamadı!");
    }
} else {
    console.log("game.js bulunamadı!");
}

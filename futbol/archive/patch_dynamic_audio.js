const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. AudioManager içine triggerPossessionReaction ekle
    if (!content.includes('triggerPossessionReaction:')) {
        const reactionCode = `
    fadeInterval: null,
    triggerPossessionReaction: function(team) {
        if (this.isMuted || this.isChanting) return;
        
        // Sadece bir takım topu aldığında reaksiyon ver (boşa çıktığında değil)
        if (team === 'none') return;

        if (this.ambiance) {
            this.ambiance.volume = 1.0; // Topu alınca ani reaksiyon (ses yükselir)
            if (this.fadeInterval) clearInterval(this.fadeInterval);
            this.fadeInterval = setInterval(() => {
                if (this.ambiance) {
                    if (this.ambiance.volume > 0.4) {
                        this.ambiance.volume = Math.max(0.4, this.ambiance.volume - 0.05);
                    } else {
                        clearInterval(this.fadeInterval);
                    }
                }
            }, 300); // Yavaşça normal (0.4) seviyeye döner
        }
    },`;
        content = content.replace('startChant: function(teamId) {', reactionCode + '\n    startChant: function(teamId) {');
    }

    // 2. window.lastBallTeam = ball.team; öncesine kancayı at
    const hookRegex = /window\.lastBallTeam = ball\.team;/g;
    const hookCode = `if (window.AudioManager && window.AudioManager.triggerPossessionReaction && ball.team !== 'none') {
            window.AudioManager.triggerPossessionReaction(ball.team);
        }
        window.lastBallTeam = ball.team;`;
    
    if (content.match(hookRegex)) {
        content = content.replace(hookRegex, hookCode);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Dinamik top reaksiyon sistemi eklendi.");
    } else {
        console.log("Hook noktası bulunamadı!");
    }

} else {
    console.log("game.js bulunamadı!");
}

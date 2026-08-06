const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    const oldBanterRegex = /triggerBanter: function\(awayTeamId, homeTeamId\) \{[\s\S]*?\},/g;
    
    const newBanterCode = `
    audioCtx: null,
    
    initAudioContext: function() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    triggerBanter: function(awayTeamId, homeTeamId) {
        if (this.isMuted || this.isChanting) return;
        this.isChanting = true;
        
        try {
            this.initAudioContext();
        } catch(e) {
            console.log("AudioContext başlatılamadı:", e);
            this.isChanting = false;
            return;
        }

        // 1. Deplasman Taraftarı Ses Ayarları (Sağ Taraf & Boğuk)
        let awayAudio = new Audio('sounds/chant_' + awayTeamId + '.ogg');
        awayAudio.crossOrigin = "anonymous";
        
        let playAway = () => {
            let awaySource = this.audioCtx.createMediaElementSource(awayAudio);
            
            // Panner (Sesi sadece sağ köşeye it)
            let awayPanner = this.audioCtx.createStereoPanner();
            awayPanner.pan.value = 0.8; // Tamamen sağdan gelsin
            
            // Biquad Filter (Sesi boğuk yap, uzaktan gelsin)
            let awayFilter = this.audioCtx.createBiquadFilter();
            awayFilter.type = 'lowpass';
            awayFilter.frequency.value = 800; // Frekansı kes (muffled effect)
            
            awaySource.connect(awayFilter);
            awayFilter.connect(awayPanner);
            awayPanner.connect(this.audioCtx.destination);
            
            awayAudio.volume = 0.7;
            awayAudio.play().catch(err=>{});
            
            if(typeof speak === 'function') speak("Deplasman tribünü köşeden marş söylemeye çalışıyor...");

            // 2. SADECE 1.5 Saniye Sonra: Ev Sahibi Sabotajı (Her yerden ve yüksek sesle)
            setTimeout(() => {
                let homeAudio = new Audio('sounds/boo.ogg');
                homeAudio.crossOrigin = "anonymous";
                
                let homeSource = this.audioCtx.createMediaElementSource(homeAudio);
                
                // Ev sahibi sesi her yerden gelsin, yankı (Reverb hissi için hafif delay eklenebilir ama panner merkez)
                let homePanner = this.audioCtx.createStereoPanner();
                homePanner.pan.value = 0.0; // Merkezden gürlesin
                
                homeSource.connect(homePanner);
                homePanner.connect(this.audioCtx.destination);
                
                homeAudio.volume = 1.0;
                homeAudio.play().catch(err=>{});
                
                // Deplasmanın sesini yavaşça sıfırla (Sabotaj başarısı)
                let fadeAway = setInterval(() => {
                    if (awayAudio.volume > 0.05) {
                        awayAudio.volume -= 0.05;
                    } else {
                        clearInterval(fadeAway);
                    }
                }, 200);

                if(typeof speak === 'function') speak("Ve anında muazzam bir ıslık! Ev sahibi tüm stadyumu inletip deplasman tarafını susturuyor!");

                // Olay 8 saniye sonra biter
                setTimeout(() => {
                    awayAudio.pause();
                    homeAudio.pause();
                    this.isChanting = false;
                }, 8000);
            }, 1500);
        };

        // Dosya yüklenemezse fallback olarak cheer.ogg kullan
        awayAudio.oncanplaythrough = playAway;
        awayAudio.onerror = () => {
            awayAudio = new Audio('sounds/cheer.ogg');
            awayAudio.crossOrigin = "anonymous";
            playAway();
        };
        // Bazı tarayıcılarda canplaythrough anında tetiklenmeyebilir diye güvence:
        setTimeout(() => {
            if (awayAudio.readyState >= 2) playAway();
        }, 500);
    },`;

    if (content.match(oldBanterRegex)) {
        content = content.replace(oldBanterRegex, newBanterCode);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - 3D Spatial Audio Banter (Web Audio API) eklendi.");
    } else {
        console.log("Eski triggerBanter fonksiyonu bulunamadı!");
    }
} else {
    console.log("game.js bulunamadı!");
}

// Web Audio API Context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Taraftar Sesi Ã„Â°cin Global Nodlar
let crowdNoiseSource = null;
let crowdGainNode = null;

const audioEngine = {
    initMenuSounds: function() {
        if (!this.menuClickSound && typeof Howl !== 'undefined') {
            this.menuClickSound = new Howl({
                src: ['sounds/menuclick24.wav'],
                volume: 0.7
            });
            this.menuEnterSound = new Howl({
                src: ['sounds/menuenter21.wav'],
                volume: 0.7
            });
        }
    },

    playClickSound: function() {
        if (!this.menuClickSound) this.initMenuSounds();
        if (this.menuClickSound) {
            this.menuClickSound.play();
        }
    },

    playEnterSound: function() {
        if (!this.menuEnterSound) this.initMenuSounds();
        if (this.menuEnterSound) {
            this.menuEnterSound.play();
        }
    },

    // 1. Taraftar UÃ„Å¸ultusu (White Noise + Lowpass Filter)
    initCrowd: function() {
        if (crowdNoiseSource) return;

        // 2 saniyelik beyaz gÃƒÂ¼rÃƒÂ¼ltÃƒÂ¼ buffer'Ã„Â± oluÃ…Å¸tur
        const bufferSize = audioCtx.sampleRate * 2; 
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        crowdNoiseSource = audioCtx.createBufferSource();
        crowdNoiseSource.buffer = buffer;
        crowdNoiseSource.loop = true;

        // UÃ„Å¸ultu efekti iÃƒÂ§in alÃƒÂ§ak geÃƒÂ§iren filtre (Lowpass)
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // BoÃ„Å¸uk stadyum sesi

        crowdGainNode = audioCtx.createGain();
        crowdGainNode.gain.value = 0.1; // BaÃ…Å¸langÃ„Â±ÃƒÂ§ sesi dÃƒÂ¼Ã…Å¸ÃƒÂ¼k

        crowdNoiseSource.connect(filter);
        filter.connect(crowdGainNode);
        crowdGainNode.connect(audioCtx.destination);

        crowdNoiseSource.start();
    },

    // Heyecana (topun kaleye yakÃ„Â±nlÃ„Â±Ã„Å¸Ã„Â±na) gÃƒÂ¶re taraftar sesini artÃ„Â±r
    updateCrowdExcitement: function(level) {
        if (!crowdGainNode) return;
        crowdGainNode.gain.setTargetAtTime(0.05 + (level * 0.4), audioCtx.currentTime, 1.0);
    },

    playRainSound: function() {
        if (audioCtx.state === 'suspended') return;
        
        const bufferSize = audioCtx.sampleRate * 2; 
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.rainNoise = audioCtx.createBufferSource();
        this.rainNoise.buffer = noiseBuffer;
        this.rainNoise.loop = true;

        let filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000; // Muffles the noise to sound like rain

        this.rainGain = audioCtx.createGain();
        this.rainGain.gain.value = 0.1;

        this.rainNoise.connect(filter);
        filter.connect(this.rainGain);
        this.rainGain.connect(audioCtx.destination);

        this.rainNoise.start(0);
    },

    // 5. YENİ: 3D Mekansal Ses (Stereo Panning) Sinyalleri
    // panValue: -1 (Tam Sol), 0 (Orta), 1 (Tam SaÃ„Å¸)
    playSpatialBeep: function(panValue, frequency = 600, type = 'sine') {
        if (audioCtx.state === 'suspended') return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        // Stereo Panner (Sesi saÃ„Å¸ veya sol kulaÃ„Å¸a yÃƒÂ¶nlendirir)
        const panner = audioCtx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, panValue));

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        // KÃ„Â±sa bir "dink" veya "tÃ„Â±k" efekti (HÃ„Â±zlÃ„Â± baÃ…Å¸layÃ„Â±p sÃƒÂ¶nen ses)
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },

    // 2. Topa VuruÃ…Å¸ (Ã…Âut) Sesi
    playKickSound: function() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        // VuruÃ…Å¸un tok sesi iÃƒÂ§in frekansÃ„Â± hÃ„Â±zlÃ„Â±ca dÃƒÂ¼Ã…Å¸ÃƒÂ¼r (Kick Drum efekti)
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },

    // 3. Direk Sesi (Ãƒâ€¡Ã„Â±n!)
    playPostSound: function() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); // Tiz bir ses

        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    },

    // 4. Gol / DÃƒÂ¼dÃƒÂ¼k Sesi
    playGoalSound: function() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        // Hakem dÃƒÂ¼dÃƒÂ¼Ã„Å¸ÃƒÂ¼: Ã„Â°ki kÃ„Â±sa tiz ÃƒÂ¶tÃƒÂ¼Ã…Å¸
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
        
        gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.25);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);

        // Taraftar gol diye baÃ„Å¸Ã„Â±rsÃ„Â±n (White noise patlamasÃ„Â±)
        if (crowdGainNode) {
            crowdGainNode.gain.setTargetAtTime(0.8, audioCtx.currentTime, 0.1);
            crowdGainNode.gain.setTargetAtTime(0.1, audioCtx.currentTime + 2.0, 1.0);
        }
    },
    
    // Kullanıcı ilk etkileşime girdiğinde sesi başlatmak için
    resumeContext: function() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        this.initCrowd();
        this.initWhistle();
    },

    // --- YENİ: DİNAMİK ISLIK SİSTEMİ ---
    initWhistle: function() {
        if (!this.whistleSound && typeof Howl !== 'undefined') {
            this.whistleSound = new Howl({
                src: ['sounds/islik.mp3'],
                loop: true,
                volume: 0.0,
                rate: 1.0
            });
            this.whistleSound.play();
        }
    },

    updateWhistle: function(intensity, pitch = 1.0) {
        if (this.whistleSound) {
            this.whistleSound.volume(intensity);
            this.whistleSound.rate(pitch);
        }
    },

    // --- YENİ: İSTİKLAL MARŞI (SEREMONİ) SİSTEMİ ---
    initAnthem: function() {
        if (!this.anthemSound && typeof Howl !== 'undefined') {
            this.anthemSound = new Howl({
                src: ['sounds/istiklal_marsi.mp3'], // Veya m4a, ogg destekler
                volume: 1.0,
                loop: false
            });
        }
    },

    playAnthem: function() {
        if (this.anthemSound && !this.anthemSound.playing()) {
            this.anthemSound.play();
            this.anthemSound.fade(0, 1.0, 1000); // 1 saniyede sesi aç
        }
    },

    stopAnthem: function() {
        if (this.anthemSound && this.anthemSound.playing()) {
            this.anthemSound.fade(1.0, 0.0, 3000); // 3 saniyede fade out
            setTimeout(() => {
                if(this.anthemSound) this.anthemSound.stop();
            }, 3000);
        }
    }
};

window.audioEngine = audioEngine;

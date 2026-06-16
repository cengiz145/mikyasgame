/* ==========================================================================
   TÃœRKÄ°YE TURNESÄ° - OTOBÃœS SÄ°MÃœLASYONU SES SÄ°STEMÄ° (AUDIO.JS)
   ========================================================================== */

class AudioSystem {
    constructor() {
        this.ctx = null;
        this.engineOsc = null;
        this.engineGain = null;
        this.engineFilter = null;
        
        this.isEngineRunning = false;
        this.idleBuffer = null;
        this.idleSource = null;
        this.idleGain = null;
        
        this.isWindowOpen = false;
        this.isExhaustBroken = false;
        this.exhaustDragSource = null;
        this.exhaustDragGain = null;
        
        this.exhaustWarningSource = null;
        this.exhaustWarningGain = null;
        
        this.currentGear = 1;

        // Howler.js Ses DosyalarÄ± (Base64 Web Audio API Garantili)
        this.sounds = {
            nav: new Howl({ src: ['sounds/menuclick24.wav'] }),
            select: new Howl({ src: ['sounds/menuenter21.wav'] }),
            start: new Howl({ src: [typeof AUDIO_B64 !== 'undefined' ? AUDIO_B64.start : 'sounds/Bus-contac.wav'] }),
            doorOpen: new Howl({ 
                src: [typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.doorOpen ? AUDIO_B64.doorOpen : 'sounds/otobÃ¼s kapÄ± aÃ§Ä±lma sesi.mp3'],
                format: ['mp3']
            }),
            doorClose: new Howl({ 
                src: [typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.doorClose ? AUDIO_B64.doorClose : 'sounds/otobÃ¼s kapÄ± kapanma sesi.mp3'],
                format: ['mp3']
            }),
            turnTick: new Howl({ src: ['sounds/vinebeep5.ogg'] }),
            crash: new Howl({ src: ['sounds/underwaterland.ogg'] }),
            menuMusic: new Howl({ src: ['sounds/music53.wav'], loop: true, volume: 0.2 }),
            rain8: new Howl({ src: ['sounds/rain8.ogg'], loop: true, volume: 0 }),
            rain9: new Howl({ src: ['sounds/rain9.ogg'], loop: true, volume: 0 }),
            rain10: new Howl({ src: ['sounds/rain10.ogg'], loop: true, volume: 0 }),
            rain11: new Howl({ src: ['sounds/rain11.ogg'], loop: true, volume: 0 })
        };

        // KORNA Ä°Ã‡Ä°N Ã–ZEL WEB AUDIO API KURULUMU (BoÄŸuk efekti ve trim iÃ§in)
        this.hornBuffer = null;
        this.hornSource = null;
        
        if (typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.horn) {
            try {
                const base64Data = AUDIO_B64.horn.split(',')[1];
                const binaryString = window.atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                // ctx oluÅŸturulmamÄ±ÅŸsa Howler Ã¼zerinden al veya yarat
                if (!this.ctx) {
                    this.ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
                }
                
                this.ctx.decodeAudioData(bytes.buffer, (buffer) => {
                    this.hornBuffer = buffer;
                }, (err) => {
                    console.error("Korna decode hatasÄ±:", err);
                });
            } catch (e) {
                console.error("Korna buffer yÃ¼klenirken hata:", e);
            }
        }

        // CADDE ORTAMI Ä°Ã‡Ä°N Ã–ZEL WEB AUDIO API KURULUMU
        this.streetBuffer = null;
        if (typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.street) {
            try {
                const base64Data = AUDIO_B64.street.split(',')[1];
                const binaryString = window.atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                if (!this.ctx) {
                    this.ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
                }
                
                this.ctx.decodeAudioData(bytes.buffer, (buffer) => {
                    this.streetBuffer = buffer;
                }, (err) => {
                    console.error("Street decode hatasÄ±:", err);
                });
            } catch (e) {
                console.error("Street buffer yÃ¼klenirken hata:", e);
            }
        }

        // MOTOR RÃ–LANTÄ° Ä°Ã‡Ä°N Ã–ZEL WEB AUDIO API KURULUMU
        if (typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.idle) {
            try {
                const base64Data = AUDIO_B64.idle.split(',')[1];
                const binaryString = window.atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                if (!this.ctx) {
                    this.ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
                }
                
                this.ctx.decodeAudioData(bytes.buffer, (buffer) => {
                    this.idleBuffer = buffer;
                }, (err) => {
                    console.error("Idle decode hatasÄ±:", err);
                });
            } catch (e) {
                console.error("Idle buffer yÃ¼klenirken hata:", e);
            }
        }
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (!this.environmentMixer) {
            // TÃ¼m Ã§evresel seslerin (motor, korna, trafik) toplanacaÄŸÄ± ana mikser
            this.environmentMixer = this.ctx.createGain();
            this.environmentMixer.gain.value = 1.0;

            // Stereo sinyali saÄŸ ve sol kanala ayÄ±rÄ±cÄ±
            this.envSplitter = this.ctx.createChannelSplitter(2);
            this.environmentMixer.connect(this.envSplitter);

            // Sol Cam (Kabin) Filtresi
            this.leftFilter = this.ctx.createBiquadFilter();
            this.leftFilter.type = 'lowpass';
            this.leftFilter.frequency.value = 1500; // VarsayÄ±lan kapalÄ± cam
            this.envSplitter.connect(this.leftFilter, 0);

            // SaÄŸ Cam (Kabin) Filtresi
            this.rightFilter = this.ctx.createBiquadFilter();
            this.rightFilter.type = 'lowpass';
            this.rightFilter.frequency.value = 1500; // VarsayÄ±lan kapalÄ± cam
            this.envSplitter.connect(this.rightFilter, 1);

            // FiltrelenmiÅŸ saÄŸ ve sol sesi tekrar birleÅŸtirici
            this.envMerger = this.ctx.createChannelMerger(2);
            this.leftFilter.connect(this.envMerger, 0, 0); // Sol filtre -> Sol kulak
            this.rightFilter.connect(this.envMerger, 0, 1); // SaÄŸ filtre -> SaÄŸ kulak

            // BirleÅŸtirilmiÅŸ sesi ana Ã§Ä±kÄ±ÅŸa gÃ¶nder
            this.envMerger.connect(this.ctx.destination);
            
            // 3D Dinleyici AyarlarÄ±
            if (this.ctx.listener.positionX) {
                this.ctx.listener.positionX.value = 0;
                this.ctx.listener.positionY.value = 0;
                this.ctx.listener.positionZ.value = 0;
                this.ctx.listener.forwardX.value = 0;
                this.ctx.listener.forwardY.value = 0;
                this.ctx.listener.forwardZ.value = 1; // Z ekseninde ileriye bakÄ±yor
            } else {
                this.ctx.listener.setPosition(0, 0, 0);
                this.ctx.listener.setOrientation(0, 0, 1, 0, 1, 0);
            }
        }
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.playMenuMusic();
        this.initTireNoise();
    }
    
    updateAcoustics(leftDamage = 0, rightDamage = 0) {
        if (!this.leftFilter || !this.rightFilter) return;
        
        const now = this.ctx.currentTime;
        
        // Hasar 0 ise frekans 1500Hz (Tam yalÄ±tÄ±m - sesler boÄŸuk ama konuÅŸma duyulur), hasar 100 ise frekans 22050Hz (Tam aÃ§Ä±k)
        // EÄŸer cam manuel olarak aÃ§Ä±ksa (isWindowOpen), hasar ne olursa olsun 22050Hz olur
        
        const leftTargetFreq = this.isWindowOpen ? 22050 : 1500 + (leftDamage / 100) * (22050 - 1500);
        const rightTargetFreq = this.isWindowOpen ? 22050 : 1500 + (rightDamage / 100) * (22050 - 1500);
        
        this.leftFilter.frequency.setTargetAtTime(leftTargetFreq, now, 0.3);
        this.rightFilter.frequency.setTargetAtTime(rightTargetFreq, now, 0.3);
        
        // Korna Ã§alÄ±yorsa onun da sesini eÅŸzamanlÄ± olarak aÃ§/boÄŸ
        if (this.hornFilter) {
            const hornTargetFreq = this.isWindowOpen ? 22050 : 600;
            this.hornFilter.frequency.setTargetAtTime(hornTargetFreq, now, 0.3);
        }
    }

    updateBusPosition(lanePosition) {
        if (!this.enginePanner) return;
        
        const now = this.ctx.currentTime;
        
        // lanePosition 50 ise merkez (pan = 0). 15 sol ÅŸerit (pan = -1), 85 saÄŸ ÅŸerit (pan = 1)
        let panValue = (lanePosition - 50) / 35;
        panValue = Math.max(-1, Math.min(1, panValue));
        
        this.enginePanner.pan.setTargetAtTime(panValue, now, 0.1);
    }

    setWindowOpen(isOpen) {
        this.isWindowOpen = isOpen;
        // Mevcut hasar deÄŸerlerini korumak iÃ§in Game global objesinden verileri al
        if (typeof Game !== 'undefined' && Game.busDamage) {
            this.updateAcoustics(Game.busDamage.leftWindow, Game.busDamage.rightWindow);
        } else {
            this.updateAcoustics(0, 0);
        }
    }

    updateNvdaLiveRegion(text) {
        let liveRegion = document.getElementById('nvda-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'nvda-live-region';
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.setAttribute('role', 'alert');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-9999px';
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = '';
        setTimeout(() => { liveRegion.textContent = text; }, 50);
    }

    stopSpeech() {
        if (this.currentTTSAudio) {
            this.currentTTSAudio.pause();
            this.currentTTSAudio = null;
        }
        if (this.currentSequenceAudio) {
            this.currentSequenceAudio.pause();
            this.currentSequenceAudio = null;
        }
        window.speechSynthesis.cancel();
        
        let liveRegion = document.getElementById('nvda-live-region');
        if (liveRegion) liveRegion.textContent = '';
    }

    playMenuMusic() {
        if (!this.sounds.menuMusic.playing()) {
            this.sounds.menuMusic.play();
        }
    }

    stopMenuMusic() {
        this.sounds.menuMusic.stop();
    }

    adjustMusicVolume(amount) {
        if (!this.sounds.menuMusic.playing()) return;
        let newVol = this.sounds.menuMusic.volume() + amount;
        newVol = Math.max(0, Math.min(1, newVol));
        this.sounds.menuMusic.volume(newVol);
        
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`MÃ¼zik Sesi: %${Math.round(newVol * 100)}`, 'success');
        }
    }

    playNav() {
        this.init();
        this.sounds.nav.play();
    }

    playSelect() {
        this.init();
        this.sounds.select.play();
    }

    startEngine() {
        this.init();
        if (this.isEngineRunning) return;
        
        this.isEngineRunning = true;

        this.sounds.start.once('end', () => {
            if (this.isEngineRunning && this.idleBuffer) {
                this.idleSource = this.ctx.createBufferSource();
                this.idleSource.buffer = this.idleBuffer;
                this.idleSource.loop = true;
                this.idleSource.loopStart = 0.05; 
                this.idleSource.loopEnd = this.idleBuffer.duration - 0.05;

                this.idleGain = this.ctx.createGain();
                this.idleGain.gain.value = 1.0;

                if (!this.enginePanner) {
                    this.enginePanner = this.ctx.createStereoPanner();
                    this.enginePanner.pan.value = 0;
                    this.enginePanner.connect(this.environmentMixer);
                }

                this.idleSource.connect(this.idleGain);
                this.idleGain.connect(this.enginePanner); // Panner Ã¼zerinden miksere baÄŸlanÄ±r
                
                // MOTOR HASARI LFO (Vuruntu/TitreÅŸim)
                this.engineDamageLfo = this.ctx.createOscillator();
                this.engineDamageLfo.type = 'sawtooth';
                this.engineDamageLfo.frequency.value = 5;
                
                this.engineDamageGain = this.ctx.createGain();
                this.engineDamageGain.gain.value = 0; // BaÅŸlangÄ±Ã§ta hasar yok
                
                this.engineDamageLfo.connect(this.engineDamageGain);
                this.engineDamageGain.connect(this.idleGain.gain);
                this.engineDamageLfo.start();
                
                this.idleSource.start(0);
            }
        });
        
        this.sounds.start.play();
    }

    stopEngine() {
        if (!this.isEngineRunning) return;
        
        if (this.idleSource && this.idleGain) {
            const now = this.ctx.currentTime;
            this.idleGain.gain.setTargetAtTime(0, now, 0.1); // YumuÅŸak sÃ¶nÃ¼mlenme
            const src = this.idleSource;
            const dmgLfo = this.engineDamageLfo;
            const dmgGain = this.engineDamageGain;
            setTimeout(() => {
                try {
                    src.stop();
                    src.disconnect();
                    if (dmgLfo) { dmgLfo.stop(); dmgLfo.disconnect(); }
                    if (dmgGain) { dmgGain.disconnect(); }
                } catch(e) {}
            }, 500);
            this.idleSource = null;
            this.idleGain = null;
            this.engineDamageLfo = null;
            this.engineDamageGain = null;
        }
        this.isEngineRunning = false;
    }

    initTireNoise() {
        if (!this.ctx || this.tireNoiseSource) return;

        // Create pink/brownish noise buffer
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            let white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise approximation
            lastOut = output[i];
            output[i] *= 3.5; // Compensate gain
        }

        this.tireNoiseSource = this.ctx.createBufferSource();
        this.tireNoiseSource.buffer = buffer;
        this.tireNoiseSource.loop = true;

        this.tireFilter = this.ctx.createBiquadFilter();
        this.tireFilter.type = 'lowpass';
        this.tireFilter.frequency.value = 400;

        this.tireGain = this.ctx.createGain();
        this.tireGain.gain.value = 0;

        this.tireNoiseSource.connect(this.tireFilter);
        this.tireFilter.connect(this.tireGain);
        this.tireGain.connect(this.environmentMixer); // Connect to environment mixer so windows affect it

        this.tireNoiseSource.start();
    }

    updateTireNoise(speed, roadType) {
        if (!this.tireGain || !this.tireFilter) return;
        
        if (isNaN(speed) || speed < 2) {
            this.tireGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
            return;
        }

        let targetGain = (speed / 100) * 0.6; // Max gain based on speed
        let cutoff = 400; // Default frequency
        let qValue = 1.0;

        if (roadType === "Toprak Yol") {
            // Earth/Dirt: Muffled but heavy thuds
            this.tireFilter.type = 'lowpass';
            cutoff = 300 + (speed * 5);
            targetGain *= 1.5;
            qValue = 4.0; // Resonant thuds
        } else if (roadType === "Kumlu Yol") {
            // Gravel/Sand: High frequency crunch, loud
            this.tireFilter.type = 'bandpass';
            cutoff = 1500 + (speed * 8);
            targetGain *= 1.8;
            qValue = 0.8;
        } else if (roadType === "Ã‡akÄ±llÄ± Yol") {
            // Sharp Gravel: Sharp, high pitch crunch
            this.tireFilter.type = 'highpass';
            cutoff = 800 + (speed * 5);
            targetGain *= 2.0;
            qValue = 2.0;
        } else if (roadType === "Ã‡imenli Yol") {
            // Grass: Soft rustling
            this.tireFilter.type = 'lowpass';
            cutoff = 200 + (speed * 3);
            targetGain *= 0.8;
            qValue = 1.0;
        } else {
            // Asfalt / Mahalle
            this.tireFilter.type = 'lowpass';
            cutoff = 400 + (speed * 2);
            targetGain *= 0.8;
            qValue = 1.0;
        }

        // Clamp values
        cutoff = Math.max(100, Math.min(20000, cutoff));
        targetGain = Math.max(0, Math.min(2.0, targetGain));

        this.tireFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.1);
        this.tireFilter.Q.setTargetAtTime(qValue, this.ctx.currentTime, 0.1);
        this.tireGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }

    updateEngineSound(speed, rpm = null, gear = null) {
        if (!this.isEngineRunning || !this.idleSource) return;
        
        // Vites DeÄŸiÅŸimi KontrolÃ¼ (Hava tahliye sesi)
        if (gear !== null && gear !== this.currentGear) {
            if (gear > this.currentGear) {
                // Vites bÃ¼yÃ¼ttÃ¼ÄŸÃ¼nde tÄ±slama
                this.playGearShiftSound();
            }
            this.currentGear = gear;
        }

        // RPM bazlÄ± frekans cambazlÄ±ÄŸÄ± (800 rÃ¶lanti -> 1.0, 2500 max -> 2.5 vb.)
        let targetRate = rpm !== null ? (rpm / 800) : (1.0 + (speed / 90) * 1.8);
        
        // MOTOR HASARI EFEKTÄ° (Sputter / TitreÅŸim / Tekleme)
        if (typeof Game !== 'undefined' && Game.busDamage) {
            const damage = Game.busDamage.front;
            if (damage > 20) {
                const damageRatio = damage / 100; // 0.2 ile 1.0 arasÄ±
                
                // 1. Devir dalgalanmasÄ± (Tekleme)
                if (Math.random() < (damageRatio * 0.3)) {
                    targetRate *= (0.6 + Math.random() * 0.3); // AnlÄ±k boÄŸulma
                }
                
                // 2. Vuruntu ve titreÅŸim (LFO genliÄŸini ayarla)
                if (this.engineDamageGain && this.engineDamageLfo) {
                    this.engineDamageGain.gain.setValueAtTime(damageRatio * 0.6, this.ctx.currentTime);
                    this.engineDamageLfo.frequency.setValueAtTime(5 + speed * 0.15, this.ctx.currentTime);
                }
            } else {
                if (this.engineDamageGain) {
                    this.engineDamageGain.gain.setValueAtTime(0, this.ctx.currentTime);
                }
            }
        }
        
        // EGZOZ KOPUKSA SESÄ° Ã‡ILDIRT (DISTORTION/BOÄULMA)
        if (this.isExhaustBroken) {
            targetRate *= (0.8 + Math.random() * 0.4);
            if (this.idleGain) this.idleGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
        } else {
            if (this.idleGain) this.idleGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        }
        
        targetRate = Math.min(3.0, Math.max(0.6, targetRate)); // Minimum 0.6 yapalÄ±m ki boÄŸulma belli olsun
        
        if (!this.currentIdleRate || Math.abs(this.currentIdleRate - targetRate) > 0.03) {
            // BoÄŸulma efekti iÃ§in anlÄ±k atlamalara izin veriyoruz
            this.idleSource.playbackRate.setValueAtTime(targetRate, this.ctx.currentTime);
            this.currentIdleRate = targetRate;
        }
    }

    // --- HAVA DURUMU VE SÄ°LECEK (YENÄ°) ---
    startWeather(weatherType, intensity = 1) {
        this.init();
        if (this.currentWeather === weatherType) return;
        this.stopWeather();
        this.currentWeather = weatherType;

        if (weatherType === 'snowy') {
            const bufferSize = this.ctx.sampleRate * 2; // 2 saniyelik white noise
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            this.weatherSource = this.ctx.createBufferSource();
            this.weatherSource.buffer = buffer;
            this.weatherSource.loop = true;

            this.weatherFilter = this.ctx.createBiquadFilter();
            
            this.weatherFilter.type = 'lowpass';
            this.weatherFilter.frequency.value = 400; // Kar ezilme sesi (daha boÄŸuk ve derin)

            this.weatherGain = this.ctx.createGain();
            this.weatherGain.gain.value = 0.0; // BaÅŸlangÄ±Ã§ta 0

            this.weatherSource.connect(this.weatherFilter);
            this.weatherFilter.connect(this.weatherGain);
            if (this.environmentMixer) {
                this.weatherGain.connect(this.environmentMixer);
            } else {
                this.weatherGain.connect(this.ctx.destination);
            }

            this.weatherSource.start(0);
        } else if (weatherType === 'rainy') {
            this.setRainIntensity(intensity);
        }
    }

    setRainIntensity(intensity) {
        if (this.currentWeather !== 'rainy') return;
        
        const rainSounds = [this.sounds.rain8, this.sounds.rain9, this.sounds.rain10, this.sounds.rain11];
        
        rainSounds.forEach((snd, index) => {
            if (!snd.playing()) {
                snd.volume(0);
                snd.play();
            }
            if (index + 1 === intensity) {
                snd.fade(snd.volume(), 0.5, 2000); // Hedef ses seviyesi
            } else {
                snd.fade(snd.volume(), 0.0, 2000);
            }
        });
    }

    stopWeather() {
        this.currentWeather = 'sunny';
        if (this.weatherSource) {
            this.weatherSource.stop();
            this.weatherSource.disconnect();
            this.weatherSource = null;
        }
        
        if (this.sounds.rain8) {
            const rainSounds = [this.sounds.rain8, this.sounds.rain9, this.sounds.rain10, this.sounds.rain11];
            rainSounds.forEach(snd => {
                snd.fade(snd.volume(), 0.0, 2000);
                setTimeout(() => snd.pause(), 2000);
            });
        }
    }

    updateWeatherSound(speed, weatherType) {
        if (weatherType === 'rainy') {
            // OGG dosyalarÄ± arka planda Ã§aldÄ±ÄŸÄ± iÃ§in sentetik bir white noise kontrolÃ¼ne gerek yok.
        } else if (weatherType === 'snowy') {
            if (!this.weatherFilter || !this.weatherGain) return;
            // Karda hÄ±z arttÄ±kÃ§a tekerlek hÄ±ÅŸÄ±rtÄ±sÄ± (ezilme) sesi artar
            let targetFreq = 300 + (speed * 10);
            let targetVolume = speed === 0 ? 0.0 : 0.15 + (speed / 130) * 0.6; // Dururken ses Ã§Ä±kmaz
            this.weatherFilter.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
            this.weatherGain.gain.setValueAtTime(targetVolume, this.ctx.currentTime);
        }
    }
    
    // --- SAVRULMA VE ZORLANMA EFEKTÄ° (SKIDDING) ---
    playTireScreech(intensity) {
        this.init();
        if (!this.skidBuffer) {
            const bufferSize = this.ctx.sampleRate * 1;
            this.skidBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = this.skidBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }

        if (!this.skidSource) {
            this.skidSource = this.ctx.createBufferSource();
            this.skidSource.buffer = this.skidBuffer;
            this.skidSource.loop = true;
            
            this.skidFilter = this.ctx.createBiquadFilter();
            this.skidFilter.type = 'bandpass';
            this.skidFilter.Q.value = 4.0; // IslÄ±ksÄ±/cÄ±yaklama tonu
            
            this.skidGain = this.ctx.createGain();
            this.skidGain.gain.value = 0;
            
            this.skidSource.connect(this.skidFilter);
            this.skidFilter.connect(this.skidGain);
            if (this.environmentMixer) {
                this.skidGain.connect(this.environmentMixer);
            } else {
                this.skidGain.connect(this.ctx.destination);
            }
            this.skidSource.start();
        }
        
        // Åiddete gÃ¶re sesi ve tonu (pitch) ayarla
        this.skidGain.gain.setTargetAtTime(intensity * 0.5, this.ctx.currentTime, 0.1);
        this.skidFilter.frequency.setTargetAtTime(1000 + intensity * 800, this.ctx.currentTime, 0.1);
    }

    stopTireScreech() {
        if (this.skidGain) {
            this.skidGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        }
    }

    toggleWipers() {
        if (typeof Game !== 'undefined' && Game.busDamage && Game.busDamage.wipers >= 100) {
            this.playHeadlightBust(); // ArÄ±za sesi
            if (this.speak) this.speak("Silecek motoru arÄ±zalÄ±. KÄ±rÄ±k olduÄŸu iÃ§in Ã§alÄ±ÅŸmÄ±yor.");
            this.isWiperOn = false;
            return;
        }

        if (this.wiperTimeout) {
            clearTimeout(this.wiperTimeout);
            this.wiperTimeout = null;
        }
        
        this.isWiperOn = !this.isWiperOn;
        if (this.speak) {
            this.speak(this.isWiperOn ? "Silecekler aÃ§Ä±ldÄ±" : "Silecekler kapandÄ±");
        }
        if (this.isWiperOn) {
            this.playWiperCycle();
        }
    }

    playWiperCycle() {
        if (!this.isWiperOn || !this.ctx) return;
        
        // Mekanik silecek motoru ve kauÃ§uk sÃ¼rtÃ¼nme sesi (Triangle osc)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);
        
        osc.connect(gain);
        gain.connect(this.environmentMixer);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
        
        // DÃ¶ngÃ¼
        this.wiperTimeout = setTimeout(() => {
            this.playWiperCycle();
        }, 1200);
    }
    
    playSwitchClick() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.setValueAtTime(300, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.environmentMixer);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playHeadlightBust() {
        this.init();
        // Cam kÄ±rÄ±lmasÄ± ve kÄ±sa devre (Spark) sesi
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.environmentMixer);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.3);
    }
    
    // --- EGZOZ VE HASAR SESLERÄ° ---
    
    playRearCrash() {
        this.init();
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = 0; // Merkezden ama boÄŸuk
        
        // Tok ve gÃ¼Ã§lÃ¼ Ã§arpma (Arkadan)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);
        
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Sesi boÄŸuk yapar (arkadan gelme hissi)
        
        gain.gain.setValueAtTime(1.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.environmentMixer);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.5);
        
        // ÅangÄ±rtÄ± Sesi (Kopan metal parÃ§asÄ±)
        setTimeout(() => this.playUnderbodyHit(), 200);
    }
    
    playUnderbodyHit() {
        this.init();
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.environmentMixer);
        
        noise.start(0);
    }
    
    startExhaustDrag() {
        if (!this.ctx || this.exhaustDragSource) return;
        
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        this.exhaustDragSource = this.ctx.createBufferSource();
        this.exhaustDragSource.buffer = buffer;
        this.exhaustDragSource.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 4000;
        
        this.exhaustDragGain = this.ctx.createGain();
        this.exhaustDragGain.gain.value = 0;
        
        this.exhaustDragSource.connect(filter);
        filter.connect(this.exhaustDragGain);
        this.exhaustDragGain.connect(this.environmentMixer);
        
        this.exhaustDragSource.start(0);
    }
    
    stopExhaustDrag() {
        if (this.exhaustDragSource) {
            this.exhaustDragSource.stop();
            this.exhaustDragSource.disconnect();
            this.exhaustDragSource = null;
        }
        this.exhaustDragGain = null;
    }
    
    startExhaustWarning() {
        if (!this.ctx || this.exhaustWarningSource) return;
        
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Beyaz gÃ¼rÃ¼ltÃ¼ (tÄ±slama/hava kaÃ§aÄŸÄ±)
        }
        
        this.exhaustWarningSource = this.ctx.createBufferSource();
        this.exhaustWarningSource.buffer = buffer;
        this.exhaustWarningSource.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000; // Ä°nce hava Ä±slÄ±ÄŸÄ±/tÄ±slama sesi
        
        this.exhaustWarningGain = this.ctx.createGain();
        this.exhaustWarningGain.gain.value = 0;
        
        this.exhaustWarningSource.connect(filter);
        filter.connect(this.exhaustWarningGain);
        this.exhaustWarningGain.connect(this.environmentMixer);
        
        this.exhaustWarningSource.start(0);
    }
    
    stopExhaustWarning() {
        if (this.exhaustWarningSource) {
            this.exhaustWarningSource.stop();
            this.exhaustWarningSource.disconnect();
            this.exhaustWarningSource = null;
        }
        this.exhaustWarningGain = null;
    }
    
    updateExhaustWarning(speed) {
        if (!this.exhaustWarningGain) return;
        if (speed < 5) {
            this.exhaustWarningGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        } else {
            // HÄ±z arttÄ±kÃ§a tÄ±slama daha Ã§ok duyulur
            let targetVol = Math.min(0.3, 0.05 + (speed / 200));
            this.exhaustWarningGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.2);
        }
    }
    
    // --- VÄ°TES SESÄ° (Hava Tahliyesi) ---
    playGearShiftSound() {
        if (!this.ctx) return;
        
        const bufferSize = this.ctx.sampleRate * 0.4; // 0.4 saniye
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Beyaz gÃ¼rÃ¼ltÃ¼
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000; // Ä°nce tÄ±slama/hava tahliyesi
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.environmentMixer);
        
        noise.start(0);
    }

    playDoorOpen() {
        this.sounds.doorOpen.play();
    }

    playDoorClose() {
        this.sounds.doorClose.play();
    }

    playCrash() {
        this.sounds.crash.play();
    }

    // --- PNÃ–MATÄ°K (HAVALI FREN) SESLERÄ° ---
    
    playBrakeRelease() {
        this.init();
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 saniye
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.5, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.environmentMixer);
        
        whiteNoise.start(0);
    }

    startLowAirAlarm() {
        this.init();
        if (this.lowAirOsc) return; // Zaten Ã§alÄ±ÅŸÄ±yorsa tekrar baÅŸlatma
        
        this.lowAirOsc = this.ctx.createOscillator();
        this.lowAirOsc.type = 'square';
        this.lowAirOsc.frequency.value = 800; // RahatsÄ±z edici tiz frekans
        
        // Buzzer efekti (kesik kesik deÄŸil, sÃ¼rekli ama modÃ¼le edilmiÅŸ)
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 10; // HÄ±zlÄ± titreme
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 50;
        lfo.connect(lfoGain);
        lfoGain.connect(this.lowAirOsc.frequency);
        
        this.lowAirGain = this.ctx.createGain();
        this.lowAirGain.gain.value = 0.5;
        
        this.lowAirOsc.connect(this.lowAirGain);
        this.lowAirGain.connect(this.ctx.destination); // Mixere girmesin, direk duyulsun
        
        lfo.start();
        this.lowAirOsc.start();
        this.lowAirLfo = lfo;
    }

    stopLowAirAlarm() {
        if (this.lowAirOsc) {
            try { this.lowAirOsc.stop(); } catch(e){}
            this.lowAirOsc = null;
        }
        if (this.lowAirLfo) {
            try { this.lowAirLfo.stop(); } catch(e){}
            this.lowAirLfo = null;
        }
        if (this.lowAirGain) {
            this.lowAirGain.disconnect();
            this.lowAirGain = null;
        }
    }

    playNavChime() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        // Google Maps style Da-Ding
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime + 0.15);
        gainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

        osc.connect(gainNode);
        gainNode.connect(this.environmentMixer);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.8);
    }

    playAirGovernorCutoff() {
        this.init();
        // TISSSS-Ã‡UFF efekti
        const bufferSize = this.ctx.sampleRate * 0.8; 
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 1.0;
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.environmentMixer);
        
        noise.start(0);
    }

    playEmergencyBrakeLock() {
        this.init();
        // Sert mekanik kapanma sesi ve yÃ¼ksek tÄ±slama
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.environmentMixer);
        osc.start(0);
        osc.stop(this.ctx.currentTime + 0.3);
        
        this.playBrakeRelease(); // Ä°mdat kitlenirken hava tahliyesi olur
    }

    playHorn() {
        if (!this.hornBuffer || this.hornSource) return;

        this.init(); // ctx state kontrolÃ¼

        this.hornSource = this.ctx.createBufferSource();
        this.hornSource.buffer = this.hornBuffer;
        this.hornSource.loop = true;
        this.hornSource.loopStart = 0.2; // 200ms boÅŸluÄŸu atla
        this.hornSource.loopEnd = this.hornBuffer.duration;

        // Kabin iÃ§i (BoÄŸuk) efekt iÃ§in Lowpass Filtre
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        // Cam aÃ§Ä±ksa 22050Hz (tamamen normal net ses), kapalÄ±ysa 600Hz (boÄŸuk)
        filter.frequency.value = this.isWindowOpen ? 22050 : 600; 
        filter.Q.value = 0; // RezonansÄ± (Ã§Ä±nlamayÄ±) tamamen sÄ±fÄ±rladÄ±k
        this.hornFilter = filter;

        // Ses Seviyesi KontrolÃ¼ ve YumuÅŸak KapanÄ±ÅŸ iÃ§in Gain
        this.hornGain = this.ctx.createGain();
        this.hornGain.gain.value = 0.6;

        // BaÄŸlantÄ±lar (Korna da Ã§evre filtresine girer)
        this.hornSource.connect(filter);
        filter.connect(this.hornGain);
        this.hornGain.connect(this.environmentMixer);

        this.hornSource.start(0, 0.2); // 200ms'den baÅŸlat
    }

    stopHorn() {
        if (this.hornSource && this.hornGain) {
            const now = this.ctx.currentTime;
            this.hornGain.gain.setTargetAtTime(0, now, 0.1); // Fade out
            const src = this.hornSource;
            setTimeout(() => {
                try {
                    src.stop();
                    src.disconnect();
                } catch (e) {}
            }, 500);
            this.hornSource = null;
            this.hornGain = null;
            this.hornFilter = null;
        }
    }

    playStreetAmbience() {
        if (!this.streetBuffer) return;
        this.init();
        
        const source = this.ctx.createBufferSource();
        source.buffer = this.streetBuffer;
        
        // Kanal AyÄ±rÄ±cÄ± ve BirleÅŸtirici oluÅŸtur (2 kanal)
        const splitter = this.ctx.createChannelSplitter(2);
        const merger = this.ctx.createChannelMerger(2);
        
        source.connect(splitter);
        
        // %50 ihtimalle kanallarÄ± yer deÄŸiÅŸtir
        const swapChannels = Math.random() > 0.5;
        
        if (swapChannels) {
            // Sol kanalÄ± (0) saÄŸa (1), SaÄŸ kanalÄ± (1) sola (0) baÄŸla
            splitter.connect(merger, 0, 1);
            splitter.connect(merger, 1, 0);
        } else {
            // Normal baÄŸla
            splitter.connect(merger, 0, 0);
            splitter.connect(merger, 1, 1);
        }
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.5; // Ses ÅŸiddeti
        
        merger.connect(gain);
        gain.connect(this.environmentMixer); // Ortam mikserine baÄŸla
        
        source.start(0);
    }

    playNPCSound(initialPan = 0) {
        if (typeof NPC_SOUNDS === 'undefined' || NPC_SOUNDS.length === 0) return null;
        
        try {
            const filename = NPC_SOUNDS[Math.floor(Math.random() * NPC_SOUNDS.length)];
            
            // BUG FIX: createMediaElementSource CORS ve file:/// hatalarÄ±na sebep olduÄŸu iÃ§in Howler.js'e geÃ§ildi
            // BÃ¶ylece tÃ¼m tarayÄ±cÄ±larda NPC sesleri sorunsuz Ã§alacak.
            const howlObj = new Howl({
                src: [`sounds/npc/${filename}`],
                loop: false,
                volume: 0.0, // BaÅŸlangÄ±Ã§ta sessiz (uzakta)
                html5: false // MÃ¼mkÃ¼nse Web Audio API kullansÄ±n (panning iÃ§in)
            });
            
            const soundId = howlObj.play();
            howlObj.stereo(initialPan, soundId);
            
            return {
                howlObj: howlObj,
                soundId: soundId,
                stop: () => {
                    howlObj.fade(howlObj.volume(soundId), 0, 100, soundId);
                    setTimeout(() => howlObj.stop(soundId), 100);
                }
            };
        } catch (e) {
            console.error("NPC ses hatasÄ±:", e);
            return null;
        }
    }

    playTurnTick() {
        this.sounds.turnTick.play();
    }

    playAkbil(type = 'tam') {
        this.init();
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.type = 'sine';
        const now = this.ctx.currentTime;
        
        if (type === 'ogrenci') {
            // Ä°ki kÄ±sa dÄ±t (Ã–ÄŸrenci)
            osc.frequency.setValueAtTime(1200, now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.setValueAtTime(0.5, now + 0.01);
            gainNode.gain.setValueAtTime(0, now + 0.1);
            
            gainNode.gain.setValueAtTime(0.5, now + 0.15);
            gainNode.gain.setValueAtTime(0, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'yasli') {
            // ÃœÃ§ kÄ±sa dÄ±t (Serbest)
            osc.frequency.setValueAtTime(1400, now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.setValueAtTime(0.5, now + 0.01);
            gainNode.gain.setValueAtTime(0, now + 0.08);
            
            gainNode.gain.setValueAtTime(0.5, now + 0.12);
            gainNode.gain.setValueAtTime(0, now + 0.19);
            
            gainNode.gain.setValueAtTime(0.5, now + 0.23);
            gainNode.gain.setValueAtTime(0, now + 0.30);
            osc.start(now);
            osc.stop(now + 0.35);
        } else {
            // Tek dÄ±t (Tam bilet)
            osc.frequency.setValueAtTime(1000, now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.setValueAtTime(0.5, now + 0.01);
            gainNode.gain.setValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    }

    async speak(text) {
        // Sadece navigasyon mesajlarÄ±na izin ver
        if (!/(rota|durak|kavÅŸak|hedef|metre kaldÄ±|dÃ¶nÃ¼ÅŸ|sola|saÄŸa|ileride|navigasyon|yÃ¶n|Ã§ekici)/i.test(text)) {
            this.updateNvdaLiveRegion(text);
            return;
        }
        this.sequenceId = (this.sequenceId || 0) + 1;
        const currentSeqId = this.sequenceId;

        if (this.currentSequenceAudio) {
            this.currentSequenceAudio.pause();
            this.currentSequenceAudio = null;
        }

        if (this.currentTTSAudio) {
            this.currentTTSAudio.pause();
            this.currentTTSAudio = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        this.updateNvdaLiveRegion(text);
        
        const apiKey = "AIzaSyAMgbeG7kuhowlmPKh2nsgm_vYzL6lpgHs";
        const cacheKey = "tts_ai_leda_" + text;
        
        try {
            const cachedAudio = localStorage.getItem(cacheKey);
            if (cachedAudio) {
                if (this.sequenceId !== currentSeqId) return;
                const ttsAudio = new Audio("data:audio/mp3;base64," + cachedAudio);
                this.currentTTSAudio = ttsAudio;
                ttsAudio.play().catch(e => { /* Ignore interruption */ });
                return;
            }
        } catch (e) { console.log(e); }

        // Spam Korumasi: Google TTS'e gitmeden once 200ms bekle, eger baska bir ses geldiyse istegi hic atma.
        await new Promise(r => setTimeout(r, 200));
        if (this.sequenceId !== currentSeqId) return;

        try {
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: { text: text },
                    voice: { languageCode: "tr-TR", name: "tr-TR-Chirp3-HD-Leda" },
                    audioConfig: { audioEncoding: "MP3" }
                })
            });

            if (!response.ok) {
                throw new Error("Google TTS API HatasÄ±");
            }

            const data = await response.json();
            if (this.sequenceId !== currentSeqId) return;
            
            try {
                localStorage.setItem(cacheKey, data.audioContent);
            } catch (e) {
                console.warn("Storage full, not caching TTS.");
            }

            const ttsAudio = new Audio("data:audio/mp3;base64," + data.audioContent);
            this.currentTTSAudio = ttsAudio;
            ttsAudio.play().catch(e => { /* Ignore interruption */ });
            
        } catch (error) {
            console.error("Google TTS Ã§alÄ±ÅŸmadÄ±, tarayÄ±cÄ± sesine geÃ§iliyor:", error);
            if (this.sequenceId !== currentSeqId) return;
            const fallbackVoice = new SpeechSynthesisUtterance(text);
            fallbackVoice.lang = 'tr-TR';
            fallbackVoice.rate = 1.0;
            window.speechSynthesis.speak(fallbackVoice);
        }
    }

    async speakSequence(textArray) {
        const hasNav = textArray.some(text => /(rota|durak|kavÅŸak|hedef|metre kaldÄ±|dÃ¶nÃ¼ÅŸ|sola|saÄŸa|ileride|navigasyon|yÃ¶n|Ã§ekici)/i.test(text));
        if (!hasNav) {
            if (textArray.length > 0) this.updateNvdaLiveRegion(textArray.join(" "));
            return;
        }

        // BUG FIX: Yeni bir sekans baÅŸladÄ±ÄŸÄ±nda eskisini iptal et (Ses Ã§akÄ±ÅŸmalarÄ±nÄ± Ã¶nler)
        this.sequenceId = (this.sequenceId || 0) + 1;
        const currentSeqId = this.sequenceId;
        
        if (this.currentSequenceAudio) {
            this.currentSequenceAudio.pause();
            this.currentSequenceAudio = null;
        }
        if (this.currentTTSAudio) {
            this.currentTTSAudio.pause();
            this.currentTTSAudio = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        const apiKey = "AIzaSyAMgbeG7kuhowlmPKh2nsgm_vYzL6lpgHs";
        const audiosToPlay = [];

        for (let text of textArray) {
            const cacheKey = "tts_ai_leda_" + text;
            let audioData = null;
            
            try {
                audioData = localStorage.getItem(cacheKey);
            } catch (e) { }

            if (!audioData) {
                // Spam Korumasi: Google TTS'e gitmeden once 200ms bekle, iptal edildiyse fetch yapma
                await new Promise(r => setTimeout(r, 200));
                if (this.sequenceId !== currentSeqId) return;

                try {
                    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            input: { text: text },
                            voice: { languageCode: "tr-TR", name: "tr-TR-Chirp3-HD-Leda" },
                            audioConfig: { audioEncoding: "MP3" }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        audioData = data.audioContent;
                        try { localStorage.setItem(cacheKey, audioData); } catch (e) { }
                    }
                } catch (error) {
                    console.error("Sequence fetch error:", error);
                }
            }

            if (audioData) {
                const aud = new Audio("data:audio/mp3;base64," + audioData);
                aud.originalText = text;
                audiosToPlay.push(aud);
            } else {
                // EÄŸer hata olursa fallback iÃ§in Ã¶zel nesne ekle
                audiosToPlay.push({ fallbackText: text, originalText: text });
            }
        }

        if (audiosToPlay.length > 0) {
            let currentIndex = 0;
            const playNext = () => {
                if (this.sequenceId !== currentSeqId) return; // Sekans iptal edildiyse dur
                
                if (currentIndex < audiosToPlay.length) {
                    const item = audiosToPlay[currentIndex];
                    if (item.originalText) {
                        this.updateNvdaLiveRegion(item.originalText);
                    }
                    if (item instanceof Audio) {
                        this.currentSequenceAudio = item;
                        item.onended = () => {
                            if (this.sequenceId !== currentSeqId) return;
                            currentIndex++;
                            playNext();
                        };
                        item.play().catch(e => {
                            console.log(e);
                            if (this.sequenceId !== currentSeqId) return;
                            currentIndex++;
                            playNext();
                        });
                    } else if (item.fallbackText) {
                        const fallbackVoice = new SpeechSynthesisUtterance(item.fallbackText);
                        fallbackVoice.lang = 'tr-TR';
                        fallbackVoice.onend = () => {
                            if (this.sequenceId !== currentSeqId) return;
                            currentIndex++;
                            playNext();
                        };
                        window.speechSynthesis.speak(fallbackVoice);
                    }
                }
            };
            playNext();
        }
    }

    placeAmbientSources(routeData, licenseLevel) {
        this.init();
        
        // Ã–nceki kaynaklarÄ± temizle
        if (this.ambientSources) {
            this.ambientSources.forEach(src => {
                if (src.osc) { try { src.osc.stop(); } catch(e){} }
                if (src.gain) src.gain.disconnect();
                if (src.panner) src.panner.disconnect();
            });
        }
        this.ambientSources = [];
        
        let currentZ = 0;
        
        for (let i = 0; i < routeData.stops.length; i++) {
            const stop = routeData.stops[i];
            
            let stopNameLower = (stop.name || "").toLowerCase();
            let terrainType = "asfalt";
            
            if (stopNameLower.includes("malkara") || stopNameLower.includes("Ã§orlu") || 
                stopNameLower.includes("Ã§erkezkÃ¶y") || stopNameLower.includes("ergene") || 
                stopNameLower.includes("kÄ±nalÄ±") || stopNameLower.includes("otoyol")) {
                if (licenseLevel >= 5) terrainType = "otoyol";
            } else if (typeof sehirRotalari !== 'undefined' && sehirRotalari[Game.currentCity] && sehirRotalari[Game.currentCity].terrain) {
                terrainType = sehirRotalari[Game.currentCity].terrain;
            }

            if (terrainType === "sahil" || terrainType === "toprak" || terrainType === "otoyol") {
                // KaynaÄŸÄ±n saÄŸda mÄ± (Ã¶rn: +50) yoksa solda mÄ± (Ã¶rn: -50) olacaÄŸÄ±nÄ± rastgele seÃ§
                let xPos = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 50); // 50 ile 100 birim saÄŸ/sol
                this.createPannerSource(terrainType, currentZ, xPos);
            }
            
            currentZ += (stop.gercekMesafeSonraki * 1000);
        }
    }

    createPannerSource(terrainType, zPos, xPos = 0) {
        const panner = this.ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'linear';
        panner.refDistance = 100;
        panner.maxDistance = 2000;
        panner.rolloffFactor = 1;
        panner.positionX.value = xPos;
        panner.positionY.value = 0;
        panner.positionZ.value = zPos;
        
        const gainNode = this.ctx.createGain();
        gainNode.connect(panner);
        panner.connect(this.environmentMixer);
        
        let osc;
        
        if (terrainType === "toprak" || terrainType === "otoyol") {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * (terrainType === "otoyol" ? 0.5 : 1.0);
            }
            osc = this.ctx.createBufferSource();
            osc.buffer = buffer;
            osc.loop = true;
            
            const filter = this.ctx.createBiquadFilter();
            if (terrainType === "toprak") {
                filter.type = 'lowpass';
                filter.frequency.value = 600;
                gainNode.gain.value = 0; // HÄ±za baÄŸlÄ± artacak
            } else {
                filter.type = 'bandpass';
                filter.frequency.value = 1000;
                filter.Q.value = 1.0;
                gainNode.gain.value = 0; // HÄ±za baÄŸlÄ± artacak
            }
            
            osc.connect(filter);
            filter.connect(gainNode);
            osc.start(0);
        }
        else if (terrainType === "sahil") {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.1;
            }
            osc = this.ctx.createBufferSource();
            osc.buffer = buffer;
            osc.loop = true;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 300; 
            
            const lfo = this.ctx.createOscillator();
            lfo.frequency.value = 0.15; 
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 800;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            lfo.start();
            
            osc.connect(filter);
            filter.connect(gainNode);
            osc.start(0);
            gainNode.gain.value = 1.0; // Sahil sesi hep aÃ§Ä±k, PannerNode mesafeye gÃ¶re kÄ±sacak
        }
        
        this.ambientSources.push({
            type: terrainType,
            osc: osc,
            gain: gainNode,
            panner: panner,
            z: zPos,
            x: xPos
        });
    }

    updateListenerPosition(zPos, speed, steeringAngle = 0) {
        if (!this.ctx) return;
        
        if (this.ctx.listener.positionZ) {
            this.ctx.listener.positionZ.value = zPos;
            
            // Direksiyon aÃ§Ä±sÄ±na (yaw) gÃ¶re kafa yÃ¶nÃ¼nÃ¼ (Orientation) gÃ¼ncelle
            // steeringAngle -30 (Sol) ile +30 (SaÄŸ) arasÄ±nda. Radyana Ã§eviriyoruz.
            const yaw = steeringAngle * (Math.PI / 180);
            
            this.ctx.listener.forwardX.value = Math.sin(yaw);
            this.ctx.listener.forwardZ.value = Math.cos(yaw);
        } else if (this.ctx.listener.setPosition) {
            this.ctx.listener.setPosition(0, 0, zPos);
            const yaw = steeringAngle * (Math.PI / 180);
            this.ctx.listener.setOrientation(Math.sin(yaw), 0, Math.cos(yaw), 0, 1, 0);
        }
        
        // HÄ±za baÄŸlÄ± sesleri gÃ¼ncelle (Sadece yakÄ±ndaki kaynaklarÄ± gÃ¼ncellesek yeter, ama hepsi de olur)
        if (this.ambientSources) {
            this.ambientSources.forEach(src => {
                // EÄŸer otobÃ¼s kaynaÄŸa 2000 metreden daha yakÄ±nsa hÄ±z sesini gÃ¼ncelle
                if (Math.abs(src.z - zPos) < 2000) {
                    if (src.type === "toprak") {
                        let targetVol = (speed / 80) * 0.8;
                        targetVol = Math.max(0, Math.min(1.0, targetVol));
                        src.gain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
                    } else if (src.type === "otoyol") {
                        let targetVol = 0;
                        if (speed > 70) {
                            targetVol = ((speed - 70) / 60) * 1.5;
                        }
                        targetVol = Math.max(0, Math.min(1.5, targetVol));
                        src.gain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
                    }
                } else {
                    // Uzaktaki dinamik kaynaklarÄ± kÄ±s
                    if (src.type === "toprak" || src.type === "otoyol") {
                        src.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
                    }
                }
            });
        }
    }

    playIntersectionTraffic() {
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.ctx.createStereoPanner();
        
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.environmentMixer);
        
        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 2);
        
        let startPan = Math.random() > 0.5 ? 1 : -1;
        panner.pan.setValueAtTime(startPan, now);
        panner.pan.linearRampToValueAtTime(-startPan, now + 1.5);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.7);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);
        
        osc.start(now);
        osc.stop(now + 1.5);
    }
}

const audio = new AudioSystem();

// Global Ses KontrolÃ¼ (MenÃ¼lerde PageUp/PageDown)
window.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') {
        audio.adjustMusicVolume(0.1);
    } else if (e.key === '-' || e.key === '_') {
        audio.adjustMusicVolume(-0.1);
    }
    
    // NVDA susturma tuÅŸuna (Ctrl) basÄ±ldÄ±ÄŸÄ±nda oyunun anonslarÄ±nÄ± da sustur
    if (e.key === 'Control') {
        if (typeof audio !== 'undefined' && audio.stopSpeech) {
            audio.stopSpeech();
        }
    }
});

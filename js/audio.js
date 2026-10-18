/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU SES SİSTEMİ (AUDIO.JS)
   ========================================================================== */

class AudioSystem {
    constructor() {
        this.ctx = null;
        this.engineOsc = null;
        this.engineGain = null;
        this.engineFilter = null;
        this.engineBassFilter = null;
        this.engineCabinFilter = null;
        this.activeSoundProfile = null;
        this.retarderOsc = null;
        this.retarderFilter = null;
        this.retarderGain = null;
        
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

        // Howler.js Ses Dosyaları (Base64 Web Audio API Garantili)
        this.sounds = {
            nav: new Howl({ src: ['sounds/menuclick24.wav'] }),
            select: new Howl({ src: ['sounds/menuenter21.wav'] }),
            start: new Howl({ src: [typeof AUDIO_B64 !== 'undefined' ? AUDIO_B64.start : 'sounds/Bus-contac.wav'] }),
            doorOpen: new Howl({ 
                src: [typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.doorOpen ? AUDIO_B64.doorOpen : 'sounds/otobüs kapı açılma sesi.mp3'],
                format: ['mp3']
            }),
            doorClose: new Howl({ 
                src: [typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.doorClose ? AUDIO_B64.doorClose : 'sounds/otobüs kapı kapanma sesi.mp3'],
                format: ['mp3']
            }),
            turnTick: new Howl({ src: ['sounds/vinebeep5.ogg'] }),
            crash: new Howl({ src: ['sounds/underwaterland.ogg'] }),
            airHorn: new Howl({ src: ['sounds/havalı korna.mp3'], volume: 0.85 }),
            npcHorn: new Howl({ src: ['sounds/vehicle_h1.ogg'], volume: 0.80 }),
            menuMusic: new Howl({ src: ['sounds/music53.wav'], loop: true, volume: 0.2 }),
            rain8: new Howl({ src: ['sounds/rain8.ogg'], loop: true, volume: 0 }),
            rain9: new Howl({ src: ['sounds/rain9.ogg'], loop: true, volume: 0 }),
            rain10: new Howl({ src: ['sounds/rain10.ogg'], loop: true, volume: 0 }),
            rain11: new Howl({ src: ['sounds/rain11.ogg'], loop: true, volume: 0 })
        };

        // KORNA İÇİN ÖZEL WEB AUDIO API KURULUMU (Boğuk efekti ve trim için)
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
                
                // ctx oluşturulmamışsa Howler üzerinden al veya yarat
                if (!this.ctx) {
                    this.ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
                }
                
                this.ctx.decodeAudioData(bytes.buffer, (buffer) => {
                    this.hornBuffer = buffer;
                }, (err) => {
                    console.error("Korna decode hatası:", err);
                });
            } catch (e) {
                console.error("Korna buffer yüklenirken hata:", e);
            }
        }

        // CADDE ORTAMI İÇİN ÖZEL WEB AUDIO API KURULUMU
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
                    console.error("Street decode hatası:", err);
                });
            } catch (e) {
                console.error("Street buffer yüklenirken hata:", e);
            }
        }

        // MOTOR RÖLANTİ İÇİN ÖZEL WEB AUDIO API KURULUMU
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
                    console.error("Idle decode hatası:", err);
                });
            } catch (e) {
                console.error("Idle buffer yüklenirken hata:", e);
            }
        }
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (!this.environmentMixer) {
            // Tüm çevresel seslerin (motor, korna, trafik) toplanacağı ana mikser
            this.environmentMixer = this.ctx.createGain();
            this.environmentMixer.gain.value = 1.0;

            // Stereo sinyali sağ ve sol kanala ayırıcı
            this.envSplitter = this.ctx.createChannelSplitter(2);
            this.environmentMixer.connect(this.envSplitter);

            // Sol Cam (Kabin) Filtresi
            this.leftFilter = this.ctx.createBiquadFilter();
            this.leftFilter.type = 'lowpass';
            this.leftFilter.frequency.value = 1500; // Varsayılan kapalı cam
            this.envSplitter.connect(this.leftFilter, 0);

            // Sağ Cam (Kabin) Filtresi
            this.rightFilter = this.ctx.createBiquadFilter();
            this.rightFilter.type = 'lowpass';
            this.rightFilter.frequency.value = 1500; // Varsayılan kapalı cam
            this.envSplitter.connect(this.rightFilter, 1);

            // Filtrelenmiş sağ ve sol sesi tekrar birleştirici
            this.envMerger = this.ctx.createChannelMerger(2);
            this.leftFilter.connect(this.envMerger, 0, 0); // Sol filtre -> Sol kulak
            this.rightFilter.connect(this.envMerger, 0, 1); // Sağ filtre -> Sağ kulak

            // Birleştirilmiş sesi ana çıkışa gönder
            this.envMerger.connect(this.ctx.destination);
            
            // 3D Dinleyici Ayarları
            if (this.ctx.listener.positionX) {
                this.ctx.listener.positionX.value = 0;
                this.ctx.listener.positionY.value = 0;
                this.ctx.listener.positionZ.value = 0;
                this.ctx.listener.forwardX.value = 0;
                this.ctx.listener.forwardY.value = 0;
                this.ctx.listener.forwardZ.value = 1; // Z ekseninde ileriye bakıyor
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
        
        // Hasar 0 ise frekans 1500Hz (Tam yalıtım - sesler boğuk ama konuşma duyulur), hasar 100 ise frekans 22050Hz (Tam açık)
        // Eğer cam manuel olarak açıksa (isWindowOpen), hasar ne olursa olsun 22050Hz olur
        
        const leftTargetFreq = this.isWindowOpen ? 22050 : 1500 + (leftDamage / 100) * (22050 - 1500);
        const rightTargetFreq = this.isWindowOpen ? 22050 : 1500 + (rightDamage / 100) * (22050 - 1500);
        
        this.leftFilter.frequency.setTargetAtTime(leftTargetFreq, now, 0.3);
        this.rightFilter.frequency.setTargetAtTime(rightTargetFreq, now, 0.3);
        
        // Korna çalıyorsa onun da sesini eşzamanlı olarak aç/boğ
        if (this.hornFilter) {
            const hornTargetFreq = this.isWindowOpen ? 22050 : 600;
            this.hornFilter.frequency.setTargetAtTime(hornTargetFreq, now, 0.3);
        }
    }

    updateBusPosition(lanePosition) {
        if (!this.enginePanner) return;
        
        const now = this.ctx.currentTime;
        
        // lanePosition 50 ise merkez (pan = 0). 15 sol şerit (pan = -1), 85 sağ şerit (pan = 1)
        let panValue = (lanePosition - 50) / 35;
        panValue = Math.max(-1, Math.min(1, panValue));
        
        this.enginePanner.pan.setTargetAtTime(panValue, now, 0.1);
    }

    setWindowOpen(isOpen) {
        this.isWindowOpen = isOpen;
        // Mevcut hasar değerlerini korumak için Game global objesinden verileri al
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
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.setAttribute('role', 'status');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-9999px';
            document.body.appendChild(liveRegion);
        }
        const clean = this.cleanSpeechText ? this.cleanSpeechText(text) : text;
        liveRegion.textContent = '';
        setTimeout(() => { liveRegion.textContent = clean; }, 40);
    }

    stopSpeech() {
        this.sequenceId = (this.sequenceId || 0) + 1;
        if (this.currentTTSAudio) {
            try { this.currentTTSAudio.pause(); } catch(e){}
            this.currentTTSAudio = null;
        }
        if (this.currentSequenceAudio) {
            try { this.currentSequenceAudio.pause(); } catch(e){}
            this.currentSequenceAudio = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.activeUtterance = null;
        
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
            UI.showToast(`Müzik Sesi: %${Math.round(newVol * 100)}`, 'success');
        }
    }

    applyBusSoundProfile(profile) {
        if (!profile) return;
        this.activeSoundProfile = profile;
        if (!this.ctx) return;
        
        // 1. Bas Güçlendirme / Eq Ayarı (Büyük motorlarda derin sub-bass rölanti titreşimi)
        if (this.engineBassFilter) {
            const boost = typeof profile.bassBoost === 'number' ? profile.bassBoost : 0;
            this.engineBassFilter.gain.setTargetAtTime(boost, this.ctx.currentTime, 0.1);
        }
        
        // 2. Kabin Akustik Ses Yalıtımı (Setra, Travego gibi lüks otobüslerde tizler sönümlenir)
        if (this.engineCabinFilter) {
            const damping = typeof profile.cabinDamping === 'number' ? profile.cabinDamping : 1.0;
            const targetFreq = Math.max(1200, Math.min(12000, 8000 * damping));
            this.engineCabinFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
        }
    }

    updateRetarder(speed, isBraking) {
        if (!this.ctx) return;
        const profile = this.activeSoundProfile;
        // Varsayılan olarak tüm büyük belediye ve şehirlerarası otobüslerinde retarder aktiftir
        const hasRetarder = !profile || profile.hasRetarder !== false;
        if (!hasRetarder) {
            if (this.retarderGain) this.retarderGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
            const el = typeof document !== 'undefined' ? document.getElementById('hud-retarder') : null;
            if (el) el.style.display = 'none';
            return;
        }

        if (!this.retarderOsc) {
            this.retarderOsc = this.ctx.createOscillator();
            this.retarderOsc.type = 'sawtooth';
            this.retarderFilter = this.ctx.createBiquadFilter();
            this.retarderFilter.type = 'bandpass';
            this.retarderFilter.Q.value = 4.2;
            this.retarderGain = this.ctx.createGain();
            this.retarderGain.gain.value = 0.0;

            this.retarderOsc.connect(this.retarderFilter);
            this.retarderFilter.connect(this.retarderGain);
            if (this.environmentMixer) this.retarderGain.connect(this.environmentMixer);
            else this.retarderGain.connect(this.ctx.destination);
            this.retarderOsc.start();
        }

        const isEngaged = (speed > 20 && isBraking) || (this.isRetarderManuallyEngaged && speed > 15);
        if (isEngaged) {
            const pitchFactor = profile && profile.retarderPitch ? profile.retarderPitch : 1.0;
            const baseF = pitchFactor * (360 + (speed / 90) * 880);
            const targetGain = Math.min(0.32, (speed / 65) * 0.32);
            this.retarderOsc.frequency.setTargetAtTime(baseF, this.ctx.currentTime, 0.08);
            this.retarderFilter.frequency.setTargetAtTime(baseF * 1.25, this.ctx.currentTime, 0.08);
            this.retarderGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.12);

            const el = typeof document !== 'undefined' ? document.getElementById('hud-retarder') : null;
            if (el) el.style.display = 'inline-block';
        } else {
            this.retarderGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.22);
            const el = typeof document !== 'undefined' ? document.getElementById('hud-retarder') : null;
            if (el) el.style.display = 'none';
        }
    }

    playRetarder(duration = 5, speed = 50) {
        this.init();
        this.isRetarderManuallyEngaged = true;
        this.updateRetarder(speed, true);
    }

    stopRetarder() {
        this.isRetarderManuallyEngaged = false;
        if (this.retarderGain && this.ctx) {
            this.retarderGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        }
        const el = typeof document !== 'undefined' ? document.getElementById('hud-retarder') : null;
        if (el) el.style.display = 'none';
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

                if (!this.engineBassFilter) {
                    this.engineBassFilter = this.ctx.createBiquadFilter();
                    this.engineBassFilter.type = 'lowshelf';
                    this.engineBassFilter.frequency.value = 160;
                    this.engineBassFilter.gain.value = 0;
                }
                if (!this.engineCabinFilter) {
                    this.engineCabinFilter = this.ctx.createBiquadFilter();
                    this.engineCabinFilter.type = 'lowpass';
                    this.engineCabinFilter.frequency.value = 8000;
                }

                this.idleSource.connect(this.engineBassFilter);
                this.engineBassFilter.connect(this.engineCabinFilter);
                this.engineCabinFilter.connect(this.idleGain);
                this.idleGain.connect(this.enginePanner);

                // Aktif aracın ses profilini uygula
                const currentBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
                if (currentBus && currentBus.soundProfile) {
                    this.applyBusSoundProfile(currentBus.soundProfile);
                }
                
                // MOTOR HASARI LFO (Vuruntu/Titreşim)
                this.engineDamageLfo = this.ctx.createOscillator();
                this.engineDamageLfo.type = 'sawtooth';
                this.engineDamageLfo.frequency.value = 5;
                
                this.engineDamageGain = this.ctx.createGain();
                this.engineDamageGain.gain.value = 0; // Başlangıçta hasar yok
                
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
            this.idleGain.gain.setTargetAtTime(0, now, 0.1); // Yumuşak sönümlenme
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
        } else if (roadType === "Çakıllı Yol") {
            // Sharp Gravel: Sharp, high pitch crunch
            this.tireFilter.type = 'highpass';
            cutoff = 800 + (speed * 5);
            targetGain *= 2.0;
            qValue = 2.0;
        } else if (roadType === "Çimenli Yol") {
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
        
        // Vites Değişimi Kontrolü (Hava tahliye sesi)
        if (gear !== null && gear !== this.currentGear) {
            if (gear > this.currentGear) {
                // Vites büyüttüğünde tıslama
                this.playGearShiftSound();
            }
            this.currentGear = gear;
        }

        // RPM bazlı frekans cambazlığı (800 rölanti -> 1.0, 2500 max -> 2.5 vb.)
        let targetRate = rpm !== null ? (rpm / 800) : (1.0 + (speed / 90) * 1.8);
        
        // Aktif otobüsün ses profili (küçük motorlar tiz, büyük motorlar tok ve bas)
        if (typeof BusFleet !== 'undefined') {
            const busObj = BusFleet.getSelectedBus();
            if (busObj && busObj.soundProfile) {
                targetRate *= (busObj.soundProfile.basePitch || 1.0);
            }
        }

        // Retarder kontrolü (Frenleme esnasında)
        const isBrakingNow = (typeof Game !== 'undefined') && (Game.acceleration < 0);
        this.updateRetarder(speed, isBrakingNow);
        
        // MOTOR HASARI EFEKTİ (Sputter / Titreşim / Tekleme)
        if (typeof Game !== 'undefined' && Game.busDamage) {
            const damage = Game.busDamage.front;
            if (damage > 20) {
                const damageRatio = damage / 100; // 0.2 ile 1.0 arası
                
                // 1. Devir dalgalanması (Tekleme)
                if (Math.random() < (damageRatio * 0.3)) {
                    targetRate *= (0.6 + Math.random() * 0.3); // Anlık boğulma
                }
                
                // 2. Vuruntu ve titreşim (LFO genliğini ayarla)
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
        
        // EGZOZ KOPUKSA SESİ ÇILDIRT (DISTORTION/BOÄULMA)
        if (this.isExhaustBroken) {
            targetRate *= (0.8 + Math.random() * 0.4);
            if (this.idleGain) this.idleGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
        } else {
            if (this.idleGain) this.idleGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        }
        
        targetRate = Math.min(3.0, Math.max(0.6, targetRate)); // Minimum 0.6 yapalım ki boğulma belli olsun
        
        if (!this.currentIdleRate || Math.abs(this.currentIdleRate - targetRate) > 0.03) {
            // Boğulma efekti için anlık atlamalara izin veriyoruz
            this.idleSource.playbackRate.setValueAtTime(targetRate, this.ctx.currentTime);
            this.currentIdleRate = targetRate;
        }
    }

    // --- HAVA DURUMU VE SİLECEK (YENİ) ---
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
            this.weatherFilter.frequency.value = 400; // Kar ezilme sesi (daha boğuk ve derin)

            this.weatherGain = this.ctx.createGain();
            this.weatherGain.gain.value = 0.0; // Başlangıçta 0

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
            // OGG dosyaları arka planda çaldığı için sentetik bir white noise kontrolüne gerek yok.
        } else if (weatherType === 'snowy') {
            if (!this.weatherFilter || !this.weatherGain) return;
            // Karda hız arttıkça tekerlek hışırtısı (ezilme) sesi artar
            let targetFreq = 300 + (speed * 10);
            let targetVolume = speed === 0 ? 0.0 : 0.15 + (speed / 130) * 0.6; // Dururken ses çıkmaz
            this.weatherFilter.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
            this.weatherGain.gain.setValueAtTime(targetVolume, this.ctx.currentTime);
        }
    }
    
    // --- SAVRULMA VE ZORLANMA EFEKTİ (SKIDDING) ---
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
            this.skidFilter.Q.value = 4.0; // Islıksı/cıyaklama tonu
            
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
        
        // Åiddete göre sesi ve tonu (pitch) ayarla
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
            this.playHeadlightBust(); // Arıza sesi
            if (this.speak) this.speak("Silecek motoru arızalı. Kırık olduğu için çalışmıyor.");
            this.isWiperOn = false;
            return;
        }

        if (this.wiperTimeout) {
            clearTimeout(this.wiperTimeout);
            this.wiperTimeout = null;
        }
        
        this.isWiperOn = !this.isWiperOn;
        if (this.speak) {
            this.speak(this.isWiperOn ? "Silecekler açıldı" : "Silecekler kapandı");
        }
        if (this.isWiperOn) {
            this.playWiperCycle();
        }
    }

    playWiperCycle() {
        if (!this.isWiperOn || !this.ctx) return;
        
        // Mekanik silecek motoru ve kauçuk sürtünme sesi (Triangle osc)
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
        
        // Döngü
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
        // Cam kırılması ve kısa devre (Spark) sesi
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
    
    // --- EGZOZ VE HASAR SESLERİ ---
    
    playRearCrash() {
        this.init();
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = 0; // Merkezden ama boğuk
        
        // Tok ve güçlü çarpma (Arkadan)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);
        
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Sesi boğuk yapar (arkadan gelme hissi)
        
        gain.gain.setValueAtTime(1.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.environmentMixer);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.5);
        
        // Åangırtı Sesi (Kopan metal parçası)
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
            data[i] = Math.random() * 2 - 1; // Beyaz gürültü (tıslama/hava kaçağı)
        }
        
        this.exhaustWarningSource = this.ctx.createBufferSource();
        this.exhaustWarningSource.buffer = buffer;
        this.exhaustWarningSource.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000; // İnce hava ıslığı/tıslama sesi
        
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
            // Hız arttıkça tıslama daha çok duyulur
            let targetVol = Math.min(0.3, 0.05 + (speed / 200));
            this.exhaustWarningGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.2);
        }
    }
    
    // --- VİTES SESİ (Hava Tahliyesi) ---
    playGearShiftSound() {
        if (!this.ctx) return;
        
        const bufferSize = this.ctx.sampleRate * 0.4; // 0.4 saniye
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Beyaz gürültü
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000; // İnce tıslama/hava tahliyesi
        
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

    // --- PROFESYONEL AKUSTİK: DURACAK ZİLİ (STOP REQUEST BELL) ---
    playStopRequestBell() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Ana akustik zil tonu (G6: 1568 Hz)
        const bellOsc1 = this.ctx.createOscillator();
        const bellGain1 = this.ctx.createGain();
        bellOsc1.type = 'sine';
        bellOsc1.frequency.setValueAtTime(1567.98, now);
        
        // Üst harmonik zil tınlaması (3136 Hz)
        const bellOsc2 = this.ctx.createOscillator();
        const bellGain2 = this.ctx.createGain();
        bellOsc2.type = 'sine';
        bellOsc2.frequency.setValueAtTime(3135.96, now);
        
        // Metalik gövde rezonansı (2349 Hz)
        const bellOsc3 = this.ctx.createOscillator();
        const bellGain3 = this.ctx.createGain();
        bellOsc3.type = 'triangle';
        bellOsc3.frequency.setValueAtTime(2349.32, now);
        
        // Zarf (Envelope): Çekiç vuruşu ve kristal sönüm
        bellGain1.gain.setValueAtTime(0.001, now);
        bellGain1.gain.exponentialRampToValueAtTime(0.48, now + 0.005);
        bellGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
        
        bellGain2.gain.setValueAtTime(0.001, now);
        bellGain2.gain.exponentialRampToValueAtTime(0.24, now + 0.004);
        bellGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        
        bellGain3.gain.setValueAtTime(0.001, now);
        bellGain3.gain.exponentialRampToValueAtTime(0.14, now + 0.006);
        bellGain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        
        const outDest = this.environmentMixer || this.ctx.destination;
        bellOsc1.connect(bellGain1);
        bellGain1.connect(outDest);
        bellOsc2.connect(bellGain2);
        bellGain2.connect(outDest);
        bellOsc3.connect(bellGain3);
        bellGain3.connect(outDest);
        
        bellOsc1.start(now);
        bellOsc2.start(now);
        bellOsc3.start(now);
        bellOsc1.stop(now + 0.8);
        bellOsc2.stop(now + 0.8);
        bellOsc3.stop(now + 0.8);
    }

    // --- PROFESYONEL PNÖMATİK: KNEELING (YANA YATIŞ HAVA TAHLİYESİ) ---
    playKneelingSound() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 1.25);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(950, now);
        filter.frequency.exponentialRampToValueAtTime(420, now + 1.15);
        filter.Q.value = 2.2;
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(0.38, now + 0.12);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.22);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.environmentMixer || this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + 1.25);
    }

    // --- PNÖMATİK KAPI AÇILMA AKUSTİĞİ ---
    playPneumaticDoorOpen() {
        this.init();
        if (!this.ctx) {
            this.playDoorOpen();
            return;
        }
        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.Q.value = 1.8;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.42, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.environmentMixer || this.ctx.destination);
        noise.start(now);
        
        try { this.sounds.doorOpen.play(); } catch(e){}
    }

    // --- PNÖMATİK KAPI KAPANMA & MÜHÜR BASINCI ---
    playPneumaticDoorClose() {
        this.init();
        if (!this.ctx) {
            this.playDoorClose();
            return;
        }
        try { this.sounds.doorClose.play(); } catch(e){}
        
        // 0.35 sn sonra kapı kanatları yuvasına otururken pnömatik kilit sesi
        setTimeout(() => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2200, t);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.environmentMixer || this.ctx.destination);
            noise.start(t);
        }, 340);
    }

    // --- RESMÎ TELSİZ AKUSTİĞİ: SQUELCH BURST (DİJİTAL MANDAL SESİ) ---
    playRadioSquelch(isOpening = true) {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const dur = isOpening ? 0.08 : 0.06;
        const bufferSize = Math.floor(this.ctx.sampleRate * dur);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.8;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(isOpening ? 2800 : 1800, now);
        filter.Q.value = 4.0;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }

    // --- RESMÎ DİSPEÇER TELSİZİ: ANONS & ANLIK TRAFİK YAYINI ---
    playDispatchRadio(messageText = null) {
        this.playRadioSquelch(true);
        setTimeout(() => {
            if (messageText && typeof this.speak === 'function') {
                this.speak(messageText, () => {
                    setTimeout(() => this.playRadioSquelch(false), 90);
                });
            } else {
                setTimeout(() => this.playRadioSquelch(false), 220);
            }
        }, 100);
    }

    playCrash() {
        this.sounds.crash.play();
    }

    // --- PNÖMATİK (HAVALI FREN) SESLERİ ---
    
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
        if (this.lowAirOsc) return; // Zaten çalışıyorsa tekrar başlatma
        
        this.lowAirOsc = this.ctx.createOscillator();
        this.lowAirOsc.type = 'square';
        this.lowAirOsc.frequency.value = 800; // Rahatsız edici tiz frekans
        
        // Buzzer efekti (kesik kesik değil, sürekli ama modüle edilmiş)
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 10; // Hızlı titreme
        
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
        // TISSSS-ÇUFF efekti
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
        // Sert mekanik kapanma sesi ve yüksek tıslama
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
        
        this.playBrakeRelease(); // İmdat kitlenirken hava tahliyesi olur
    }

    playNPCHorn(pan = 0) {
        if (this.sounds && this.sounds.npcHorn) {
            const id = this.sounds.npcHorn.play();
            if (typeof this.sounds.npcHorn.stereo === 'function') {
                this.sounds.npcHorn.stereo(pan, id);
            }
        }
    }

    playHorn() {
        // Eğer seçili otobüs havalı korna kullanıyorsa (Travego, Tourismo, Setra, MAN, vb.)
        const currentBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
        if (currentBus && currentBus.soundProfile && currentBus.soundProfile.hornSound === 'air') {
            if (this.sounds && this.sounds.airHorn) {
                this.sounds.airHorn.play();
                return;
            }
        }

        if (!this.hornBuffer || this.hornSource) return;

        this.init(); // ctx state kontrolü

        this.hornSource = this.ctx.createBufferSource();
        this.hornSource.buffer = this.hornBuffer;
        this.hornSource.loop = true;
        this.hornSource.loopStart = 0.2; // 200ms boşluğu atla
        this.hornSource.loopEnd = this.hornBuffer.duration;

        // Kabin içi (Boğuk) efekt için Lowpass Filtre
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        // Cam açıksa 22050Hz (tamamen normal net ses), kapalıysa 600Hz (boğuk)
        filter.frequency.value = this.isWindowOpen ? 22050 : 600; 
        filter.Q.value = 0; // Rezonansı (çınlamayı) tamamen sıfırladık
        this.hornFilter = filter;

        // Ses Seviyesi Kontrolü ve Yumuşak Kapanış için Gain
        this.hornGain = this.ctx.createGain();
        this.hornGain.gain.value = 0.6;

        // Bağlantılar (Korna da çevre filtresine girer)
        this.hornSource.connect(filter);
        filter.connect(this.hornGain);
        this.hornGain.connect(this.environmentMixer);

        this.hornSource.start(0, 0.2); // 200ms'den başlat
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
        
        // Kanal Ayırıcı ve Birleştirici oluştur (2 kanal)
        const splitter = this.ctx.createChannelSplitter(2);
        const merger = this.ctx.createChannelMerger(2);
        
        source.connect(splitter);
        
        // %50 ihtimalle kanalları yer değiştir
        const swapChannels = Math.random() > 0.5;
        
        if (swapChannels) {
            // Sol kanalı (0) sağa (1), Sağ kanalı (1) sola (0) bağla
            splitter.connect(merger, 0, 1);
            splitter.connect(merger, 1, 0);
        } else {
            // Normal bağla
            splitter.connect(merger, 0, 0);
            splitter.connect(merger, 1, 1);
        }
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.5; // Ses şiddeti
        
        merger.connect(gain);
        gain.connect(this.environmentMixer); // Ortam mikserine bağla
        
        source.start(0);
    }

    playNPCSound(initialPan = 0) {
        if (typeof NPC_SOUNDS === 'undefined' || NPC_SOUNDS.length === 0) return null;
        
        try {
            const filename = NPC_SOUNDS[Math.floor(Math.random() * NPC_SOUNDS.length)];
            
            const howlObj = new Howl({
                src: [`sounds/npc/${filename}`],
                stereo: initialPan,
                loop: true, // Araç yaklaşıp uzaklaşırken sesin zamansız kesilmesini önler
                volume: 0.0, // Başlangıçta sessiz (uzakta)
                html5: false // Web Audio API StereoPanner kullansın
            });
            
            const soundId = howlObj.play();
            howlObj.stereo(initialPan, soundId);
            
            return {
                howlObj: howlObj,
                soundId: soundId,
                stop: () => {
                    try {
                        howlObj.fade(howlObj.volume(soundId), 0, 350, soundId);
                        setTimeout(() => {
                            try {
                                howlObj.stop(soundId);
                                howlObj.unload();
                            } catch (e) {}
                        }, 400);
                    } catch (e) {}
                }
            };
        } catch (e) {
            console.error("NPC ses hatası:", e);
            return null;
        }
    }

    playTurnTick() {
        this.sounds.turnTick.play();
    }

    // --- RESMÎ TEKİRDAĞ KART / KENTKART VALİDATÖR SESLERİ ---
    playValidatorSound(type = 'tam') {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const outDest = this.ctx.destination;

        if (type === 'ogrenci') {
            // Çift tiz bip (1250 Hz) - 60ms bip, 35ms sessizlik, 60ms bip
            for (let i = 0; i < 2; i++) {
                const startTime = now + (i * 0.095);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1250, startTime);
                
                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.45, startTime + 0.006);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.065);
                
                osc.connect(gain);
                gain.connect(outDest);
                osc.start(startTime);
                osc.stop(startTime + 0.07);
            }
        } else if (type === 'yasli' || type === 'serbest') {
            // Üç tonlu melodik arpej (880 Hz -> 1175 Hz -> 1760 Hz)
            const freqs = [880, 1174.66, 1760];
            freqs.forEach((freq, idx) => {
                const startTime = now + (idx * 0.065);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                
                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.4, startTime + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx === 2 ? 0.12 : 0.055));
                
                osc.connect(gain);
                gain.connect(outDest);
                osc.start(startTime);
                osc.stop(startTime + (idx === 2 ? 0.13 : 0.06));
            });
        } else if (type === 'yetersiz' || type === 'ret') {
            // İki kalın ve sert ret tonu (280 Hz testere dalgası)
            for (let i = 0; i < 2; i++) {
                const startTime = now + (i * 0.16);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(280, startTime);
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(650, startTime);
                
                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.35, startTime + 0.008);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(outDest);
                osc.start(startTime);
                osc.stop(startTime + 0.13);
            }
        } else {
            // Standart Tam Bilet: Net, tok 1050 Hz sinüs sinyali
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1050, now);
            
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.45, now + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            
            osc.connect(gain);
            gain.connect(outDest);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    }

    playAkbil(type = 'tam') {
        this.playValidatorSound(type);
    }

    cleanSpeechText(text) {
        if (!text) return "";
        return String(text)
            .replace(/Åž/g, 'Ş').replace(/ÅŸ/g, 'ş')
            .replace(/Ã¼/g, 'ü').replace(/Ã¶/g, 'ö')
            .replace(/Ã§/g, 'ç').replace(/Ä±/g, 'ı')
            .replace(/Ãœ/g, 'Ü').replace(/Ã–/g, 'Ö')
            .replace(/Ã‡/g, 'Ç').replace(/Ä°/g, 'İ')
            .replace(/ÄŸ/g, 'ğ').replace(/Äž/g, 'Ğ')
            .replace(/â€“|â€”/g, '-')
            .replace(/â‚º/g, ' Lira')
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .trim();
    }

    speakBrowserVoice(text, onEndCallback = null) {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            if (typeof onEndCallback === 'function') onEndCallback();
            return;
        }

        try {
            window.speechSynthesis.resume();
            const cleanText = this.cleanSpeechText(text);
            if (!cleanText) {
                if (typeof onEndCallback === 'function') onEndCallback();
                return;
            }

            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'tr-TR';
            utter.rate = 1.0;
            utter.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                const trVoice = voices.find(v => v.lang === 'tr-TR' || v.lang === 'tr_TR' || v.lang.startsWith('tr'));
                if (trVoice) utter.voice = trVoice;
            }

            let ended = false;
            const finish = () => {
                if (ended) return;
                ended = true;
                if (this.activeUtterance === utter) this.activeUtterance = null;
                if (typeof onEndCallback === 'function') onEndCallback();
            };

            utter.onend = finish;
            utter.onerror = finish;

            // Chrome GC bug fix: Utterance nesnesini sınıfa bağla ki konuşurken bellekten silinmesin
            this.activeUtterance = utter;
            window.speechSynthesis.speak(utter);
        } catch (e) {
            console.error("speakBrowserVoice error:", e);
            if (typeof onEndCallback === 'function') onEndCallback();
        }
    }

    async speak(text) {
        if (!text) return;
        
        // Ekran okuyucu (NVDA) erişilebilirliği için live region'ı güncelle
        this.updateNvdaLiveRegion(text);

        this.sequenceId = (this.sequenceId || 0) + 1;
        const currentSeqId = this.sequenceId;

        if (this.currentSequenceAudio) {
            try { this.currentSequenceAudio.pause(); } catch(e){}
            this.currentSequenceAudio = null;
        }

        if (this.currentTTSAudio) {
            try { this.currentTTSAudio.pause(); } catch(e){}
            this.currentTTSAudio = null;
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
        }

        // Önbellekte varsa çal
        const cacheKey = "tts_ai_leda_" + text;
        try {
            const cachedAudio = localStorage.getItem(cacheKey);
            if (cachedAudio) {
                if (this.sequenceId !== currentSeqId) return;
                const ttsAudio = new Audio("data:audio/mp3;base64," + cachedAudio);
                this.currentTTSAudio = ttsAudio;
                ttsAudio.play().catch(e => {});
                return;
            }
        } catch (e) {}

        // Google Cloud TTS denemesi (Eğer 403 veya hata almadıysak)
        if (!this.googleTtsDisabled) {
            try {
                const apiKey = "AIzaSyAMgbeG7kuhowlmPKh2nsgm_vYzL6lpgHs";
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1200);

                const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        input: { text: text },
                        voice: { languageCode: "tr-TR", name: "tr-TR-Chirp3-HD-Leda" },
                        audioConfig: { audioEncoding: "MP3" }
                    })
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (this.sequenceId !== currentSeqId) return;
                    try { localStorage.setItem(cacheKey, data.audioContent); } catch (e) {}
                    const ttsAudio = new Audio("data:audio/mp3;base64," + data.audioContent);
                    this.currentTTSAudio = ttsAudio;
                    ttsAudio.play().catch(e => {});
                    return;
                } else {
                    this.googleTtsDisabled = true;
                }
            } catch (error) {
                this.googleTtsDisabled = true;
            }
        }

        // Yerel tarayıcı sesiyle anons yap (Sıfır gecikme, net ve kesintisiz)
        if (this.sequenceId !== currentSeqId) return;
        this.speakBrowserVoice(text);
    }

    async speakSequence(textArray) {
        if (!textArray || textArray.length === 0) return;

        this.sequenceId = (this.sequenceId || 0) + 1;
        const currentSeqId = this.sequenceId;

        if (this.currentSequenceAudio) {
            try { this.currentSequenceAudio.pause(); } catch(e){}
            this.currentSequenceAudio = null;
        }
        if (this.currentTTSAudio) {
            try { this.currentTTSAudio.pause(); } catch(e){}
            this.currentTTSAudio = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
        }

        this.updateNvdaLiveRegion(textArray.join(" "));

        let index = 0;
        const playNext = () => {
            if (this.sequenceId !== currentSeqId) return;
            if (index >= textArray.length) return;

            const text = textArray[index];
            index++;

            const cacheKey = "tts_ai_leda_" + text;
            let cachedAudio = null;
            try { cachedAudio = localStorage.getItem(cacheKey); } catch (e) {}

            if (cachedAudio) {
                const aud = new Audio("data:audio/mp3;base64," + cachedAudio);
                this.currentSequenceAudio = aud;
                aud.onended = () => {
                    if (this.sequenceId !== currentSeqId) return;
                    setTimeout(playNext, 120);
                };
                aud.play().catch(e => {
                    this.speakBrowserVoice(text, () => {
                        if (this.sequenceId === currentSeqId) setTimeout(playNext, 120);
                    });
                });
            } else {
                this.speakBrowserVoice(text, () => {
                    if (this.sequenceId === currentSeqId) setTimeout(playNext, 120);
                });
            }
        };

        playNext();
    }

    placeAmbientSources(routeData, licenseLevel) {
        this.init();
        
        // Önceki kaynakları temizle
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
            
            if (stopNameLower.includes("malkara") || stopNameLower.includes("çorlu") || 
                stopNameLower.includes("çerkezköy") || stopNameLower.includes("ergene") || 
                stopNameLower.includes("kınalı") || stopNameLower.includes("otoyol")) {
                if (licenseLevel >= 5) terrainType = "otoyol";
            } else if (typeof sehirRotalari !== 'undefined' && sehirRotalari[Game.currentCity] && sehirRotalari[Game.currentCity].terrain) {
                terrainType = sehirRotalari[Game.currentCity].terrain;
            }

            if (terrainType === "sahil" || terrainType === "toprak" || terrainType === "otoyol") {
                // Kaynağın sağda mı (örn: +50) yoksa solda mı (örn: -50) olacağını rastgele seç
                let xPos = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 50); // 50 ile 100 birim sağ/sol
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
                gainNode.gain.value = 0; // Hıza bağlı artacak
            } else {
                filter.type = 'bandpass';
                filter.frequency.value = 1000;
                filter.Q.value = 1.0;
                gainNode.gain.value = 0; // Hıza bağlı artacak
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
            gainNode.gain.value = 1.0; // Sahil sesi hep açık, PannerNode mesafeye göre kısacak
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
            
            // Direksiyon açısına (yaw) göre kafa yönünü (Orientation) güncelle
            // steeringAngle -30 (Sol) ile +30 (Sağ) arasında. Radyana çeviriyoruz.
            const yaw = steeringAngle * (Math.PI / 180);
            
            this.ctx.listener.forwardX.value = Math.sin(yaw);
            this.ctx.listener.forwardZ.value = Math.cos(yaw);
        } else if (this.ctx.listener.setPosition) {
            this.ctx.listener.setPosition(0, 0, zPos);
            const yaw = steeringAngle * (Math.PI / 180);
            this.ctx.listener.setOrientation(Math.sin(yaw), 0, Math.cos(yaw), 0, 1, 0);
        }
        
        // Hıza bağlı sesleri güncelle (Sadece yakındaki kaynakları güncellesek yeter, ama hepsi de olur)
        if (this.ambientSources) {
            this.ambientSources.forEach(src => {
                // Eğer otobüs kaynağa 2000 metreden daha yakınsa hız sesini güncelle
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
                    // Uzaktaki dinamik kaynakları kıs
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

// Global Ses Kontrolü (Menülerde PageUp/PageDown)
window.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') {
        audio.adjustMusicVolume(0.1);
    } else if (e.key === '-' || e.key === '_') {
        audio.adjustMusicVolume(-0.1);
    }
    
    // NVDA susturma tuşuna (Ctrl) basıldığında oyunun anonslarını da sustur
    if (e.key === 'Control') {
        if (typeof audio !== 'undefined' && audio.stopSpeech) {
            audio.stopSpeech();
        }
    }
});


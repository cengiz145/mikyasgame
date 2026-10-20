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
        this.bassIdleBuffer = null;
        this.coachIdleBuffer = null;
        this.pureIdleBuffer = null;
        this.coachTerminalIdleBuffer = null;
        this.groupBuffers = {
            pure_v6: null,
            coach_terminal: null,
            v8_bass: null,
            city_cummins: null,
            articulated: null,
            midibus: null,
            man_d26: null
        };
        this.cityIdleBuffer = null;
        this.syntheticIdleBuffer = null;
        try {
            const safeLoadBuffer = (url, callback) => {
                fetch(url).then(r => {
                    if (!r.ok) return null;
                    return r.arrayBuffer();
                }).then(b => {
                    if (!b) return;
                    if (!this.ctx) this.ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
                    return this.ctx.decodeAudioData(b);
                }).then(decoded => {
                    if (decoded && callback) callback(decoded);
                }).catch(() => {});
            };

            safeLoadBuffer('sounds/freesound_pure_bus_idle.mp3', d => {
                this.pureIdleBuffer = d; this.coachIdleBuffer = d; if (this.groupBuffers) this.groupBuffers.pure_v6 = d;
            });
            safeLoadBuffer('sounds/freesound_coach_idle.mp3', d => {
                this.coachTerminalIdleBuffer = d; if (this.groupBuffers) this.groupBuffers.coach_terminal = d;
            });
            safeLoadBuffer('sounds/bassrolanti.mp3', d => {
                this.bassIdleBuffer = d; if (this.groupBuffers) this.groupBuffers.v8_bass = d;
            });
            safeLoadBuffer('sounds/freesound_new_bus_idle.mp3', d => {
                this.cityIdleBuffer = d; if (this.groupBuffers) this.groupBuffers.city_cummins = d;
            });
            safeLoadBuffer('sounds/freesound_articulated_idle.mp3', d => {
                if (this.groupBuffers) this.groupBuffers.articulated = d;
            });
            safeLoadBuffer('sounds/freesound_midibus_idle.mp3', d => {
                if (this.groupBuffers) this.groupBuffers.midibus = d;
            });
            safeLoadBuffer('sounds/freesound_heavy_man_idle.mp3', d => {
                if (this.groupBuffers) this.groupBuffers.man_d26 = d;
            });
        } catch(e) {}
        this.idleSource = null;
        this.idleGain = null;
        
        this.isWindowOpen = false;
        this.isExhaustBroken = false;
        this.exhaustDragSource = null;
        this.exhaustDragGain = null;
        
        this.exhaustWarningSource = null;
        this.exhaustWarningGain = null;
        
        this.currentGear = 1;
        this.roadJointDistanceCounter = 0;
        this.nextJointDistance = 35 + Math.random() * 15;
        this.lastTireUpdateTime = 0;
        this.lastJointSoundToggle = false;

        // Howler.js Ses Dosyaları (Base64 Web Audio API Garantili)
        this.sounds = {
            nav: new Howl({ src: ['sounds/menuclick24.wav'] }),
            select: new Howl({ src: ['sounds/menuenter21.wav'] }),
            start: new Howl({ src: [typeof AUDIO_B64 !== 'undefined' ? AUDIO_B64.start : 'sounds/Bus-contac.wav'] }),
            doorOpen: new Howl({ 
                src: [typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.doorOpen ? AUDIO_B64.doorOpen : 'sounds/freesound_bus_door.mp3', 'sounds/otobüs kapı açılma sesi.mp3'],
                format: ['mp3']
            }),
            doorClose: new Howl({ 
                src: [typeof AUDIO_B64 !== 'undefined' && AUDIO_B64.doorClose ? AUDIO_B64.doorClose : 'sounds/freesound_bus_door.mp3', 'sounds/otobüs kapı kapanma sesi.mp3'],
                format: ['mp3']
            }),
            turnTick: new Howl({ src: ['sounds/vinebeep5.ogg'] }),
            crash: new Howl({ src: ['sounds/underwaterland.ogg'] }),
            airHorn: new Howl({ src: ['sounds/freesound_industrial_horn.mp3', 'sounds/havalı korna.mp3'], volume: 0.90 }),
            airBrake: new Howl({ src: ['sounds/freesound_air_brake.mp3'], volume: 0.90 }),
            akbilTam: new Howl({ src: ['sounds/freesound_akbil_tam.mp3'], volume: 0.90 }),
            akbilOgrenci: new Howl({ src: ['sounds/freesound_akbil_ogrenci.mp3'], volume: 0.90 }),
            akbilHata: new Howl({ src: ['sounds/freesound_akbil_hata.mp3'], volume: 0.90 }),
            busValidator: new Howl({ src: ['sounds/freesound_bus_validator.mp3'], volume: 0.90 }),
            npcHorn: new Howl({ src: ['sounds/vehicle_h1.ogg'], volume: 0.80 }),
            menuMusic: new Howl({ src: ['sounds/music53.wav'], loop: true, volume: 0.2 }),
            rain8: new Howl({ src: ['sounds/rain8.ogg'], loop: true, volume: 0 }),
            rain9: new Howl({ src: ['sounds/rain9.ogg'], loop: true, volume: 0 }),
            rain10: new Howl({ src: ['sounds/rain10.ogg'], loop: true, volume: 0 }),
            rain11: new Howl({ src: ['sounds/rain11.ogg'], loop: true, volume: 0 }),
            // Freesound Gerçek Çevre ve Yol Sesleri (Asfalt, Çakıl, Kum, Rüzgar, Derz)
// Freesound Gerçek Çevre ve Yol Sesleri (Doğal Şehir Ambiyansı, Kuş Sesleri, Asfalt, Rüzgar)
                        tireScreech: new Howl({ src: ['sounds/freesound_tire_screech.mp3'], loop: false, volume: 0.85 }),
            snowTires: new Howl({ src: ['sounds/freesound_snow_tires.mp3'], loop: true, volume: 0 }),
            beachShore: new Howl({ src: ['sounds/freesound_beach_shore.mp3'], loop: true, volume: 0 }),
            cabinAmbience: new Howl({ src: ['sounds/freesound_bus_cabin_ambience.mp3'], loop: true, volume: 0 }),
            cityAmbience: new Howl({ src: ['sounds/freesound_city_ambience.mp3', 'sounds/street1.ogg'], loop: true, volume: 0 }),
            roadAsphalt: new Howl({ src: ['sounds/freesound_road_asphalt.mp3'], loop: true, volume: 0 }),
            roadGravel: new Howl({ src: ['sounds/freesound_road_gravel.mp3'], loop: true, volume: 0 }),
            roadGravelAsphalt: new Howl({ src: ['sounds/freesound_road_gravel_asphalt.mp3'], loop: true, volume: 0 }),
            roadWind: new Howl({ src: ['sounds/freesound_road_wind_ambience.mp3'], loop: true, volume: 0 })};

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
            this.ctx.resume().catch(() => {});
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
        if (typeof Game !== 'undefined' && Game.speed > 0) {
            this.updateTireNoise(Game.speed, Game.currentRoadType);
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

        createSyntheticIdleBuffer() {
        if (!this.ctx) {
            this.ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
        }
        const sampleRate = this.ctx.sampleRate || 44100;
        const duration = 2.0;
        const length = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        const baseFreq = 16.0;
        let lastNoise = 0;
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const pulse = Math.pow(Math.max(0, Math.sin(2 * Math.PI * baseFreq * t)), 3) * 0.6;
            const subHarmonic = Math.sin(2 * Math.PI * (baseFreq * 0.5) * t) * 0.25;
            const highHarmonic = Math.sin(2 * Math.PI * (baseFreq * 2.0) * t) * 0.15;
            const metallic = Math.sin(2 * Math.PI * (baseFreq * 4.0) * t) * 0.08;
            const white = Math.random() * 2 - 1;
            lastNoise = (lastNoise + 0.05 * white) / 1.05;
            
            data[i] = (pulse + subHarmonic + highHarmonic + metallic + (lastNoise * 0.4)) * 0.7;
        }
        this.syntheticIdleBuffer = buffer;
        if (!this.idleBuffer) this.idleBuffer = buffer;
        if (!this.pureIdleBuffer) this.pureIdleBuffer = buffer;
        return buffer;
    }

startEngine() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        if (this.isEngineRunning) return;
        
        this.isEngineRunning = true;

        const launchIdle = () => {
            if (!this.isEngineRunning || this.idleSource) return;
            
            const currentBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
            let activeBuffer = this.pureIdleBuffer || this.idleBuffer;
            if (currentBus) {
                const grp = currentBus.soundGroup || (currentBus.soundProfile ? currentBus.soundProfile.soundGroup : '');
                if (grp === 'coach_terminal' || currentBus.id.includes('tourismo') || currentBus.id.includes('irizar') || currentBus.id.includes('neoplan')) {
                    activeBuffer = (this.groupBuffers && this.groupBuffers.coach_terminal) || this.coachTerminalIdleBuffer || this.pureIdleBuffer || this.idleBuffer;
                } else if (grp === 'v8_bass' || currentBus.id.includes('o403') || currentBus.id.includes('safir')) {
                    activeBuffer = (this.groupBuffers && this.groupBuffers.v8_bass) || this.bassIdleBuffer || this.pureIdleBuffer || this.idleBuffer;
                } else if (grp === 'articulated' || currentBus.id.includes('conecto')) {
                    activeBuffer = (this.groupBuffers && this.groupBuffers.articulated) || this.cityIdleBuffer || this.idleBuffer;
                } else if (grp === 'midibus' || currentBus.id.includes('novo')) {
                    activeBuffer = (this.groupBuffers && this.groupBuffers.midibus) || this.cityIdleBuffer || this.idleBuffer;
                } else if (grp === 'man_d26' || currentBus.id.includes('man_lions')) {
                    activeBuffer = (this.groupBuffers && this.groupBuffers.man_d26) || this.pureIdleBuffer || this.idleBuffer;
                } else if (grp === 'city_cummins' || currentBus.id.includes('kent') || currentBus.id.includes('neocity')) {
                    activeBuffer = (this.groupBuffers && this.groupBuffers.city_cummins) || this.cityIdleBuffer || this.idleBuffer;
                } else {
                    activeBuffer = (this.groupBuffers && this.groupBuffers.pure_v6) || this.pureIdleBuffer || this.idleBuffer;
                }
            }
            if (!activeBuffer) {
                activeBuffer = this.syntheticIdleBuffer || this.createSyntheticIdleBuffer();
            }
            if (activeBuffer && this.ctx) {
                this.idleSource = this.ctx.createBufferSource();
                this.idleSource.buffer = activeBuffer;
                this.idleSource.loop = true;
                this.idleSource.loopStart = 0.05; 
                this.idleSource.loopEnd = Math.max(0.1, activeBuffer.duration - 0.05);

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

                if (currentBus && currentBus.soundProfile) {
                    this.applyBusSoundProfile(currentBus.soundProfile);
                }
                
                this.engineDamageLfo = this.ctx.createOscillator();
                this.engineDamageLfo.type = 'sawtooth';
                this.engineDamageLfo.frequency.value = 5;
                
                this.engineDamageGain = this.ctx.createGain();
                this.engineDamageGain.gain.value = 0;
                
                this.engineDamageLfo.connect(this.engineDamageGain);
                this.engineDamageGain.connect(this.idleGain.gain);
                this.engineDamageLfo.start();
                
                try {
                    this.idleSource.start(0);
                } catch(e) {}
            }
        };

        let startedViaEnd = false;
        if (this.sounds && this.sounds.start) {
            try {
                this.sounds.start.once('end', () => {
                    startedViaEnd = true;
                    launchIdle();
                });
                this.sounds.start.play();
            } catch(e) {
                launchIdle();
            }
            setTimeout(() => {
                if (!startedViaEnd && this.isEngineRunning) {
                    launchIdle();
                }
            }, 1400);
        } else {
            launchIdle();
        }
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
        if (typeof this.stopAllRoadSounds === 'function') {
            this.stopAllRoadSounds();
        }
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

        // Yapay brown noise kaldirildi, gercek ses kayitlari kullaniliyor
        this.tireGain.gain.value = 0;
    }

    updateTireNoise(speed, roadType) {
        if (!this.tireGain || !this.tireFilter) return;
        
        // Araç duruyorsa veya hız çok düşükse tüm yol ve rüzgar seslerini yumuşakça sustur
        if (isNaN(speed) || speed < 2) {
            this.tireGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
            this.stopAllRoadSounds();
            this.lastTireUpdateTime = 0;
            return;
        }

        // Zaman farkı ve kat edilen mesafe hesabı
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
        let dt = 0.016;
        if (this.lastTireUpdateTime > 0) {
            dt = Math.min(now - this.lastTireUpdateTime, 0.1);
        }
        this.lastTireUpdateTime = now;
        const metersMoved = (speed / 3.6) * dt;

        // Yol tipi ayrıştırma
        const isGravel = (roadType === "Çakıllı Yol");
        const isSandDirt = (roadType === "Kumlu Yol" || roadType === "Toprak Yol");
        const isGrass = (roadType === "Çimenli Yol");
        const isAsphalt = !isGravel && !isSandDirt && !isGrass; // "Asfalt Cadde", "Sahil Şeridi Yolu", "Mahalle Sokağı"

        const windowVolBoost = this.isWindowOpen ? 0.15 : 0;

                // 0. DOĞAL ÇEVRE & ŞEHİR AMBİYANSI (Kuş sesleri, sakin cadde)
        if (this.sounds && this.sounds.cityAmbience) {
            if (!this.sounds.cityAmbience.playing()) {
                this.sounds.cityAmbience.volume(0);
                this.sounds.cityAmbience.play();
            }
            let targetAmbienceVol = this.isWindowOpen ? 0.45 : 0.25;
            if (speed > 35) {
                targetAmbienceVol = Math.max(0.08, targetAmbienceVol - ((speed - 35) / 60) * 0.15);
            }
            this.sounds.cityAmbience.volume(targetAmbienceVol);
        }

        
        // Otobüs İçi Yolcu & Kabin Ambiyansı (Yolda seyrederken canlı kabin hissi)
        if (this.sounds && this.sounds.cabinAmbience) {
            if (!this.sounds.cabinAmbience.playing()) {
                this.sounds.cabinAmbience.volume(0);
                this.sounds.cabinAmbience.play();
            }
            const targetCabinVol = Math.min(0.24, 0.08 + (speed / 100) * 0.12);
            this.sounds.cabinAmbience.volume(targetCabinVol);
        }

        // 1. ASFALT YOL SESİ (freesound_road_asphalt.mp3)
        if (isAsphalt && this.sounds.roadAsphalt) {
            const targetAsphaltVol = Math.min(0.50, (speed / 90) * 0.42 + windowVolBoost);
            const targetAsphaltRate = Math.min(1.30, Math.max(0.75, 0.75 + (speed / 100) * 0.45));
            if (!this.sounds.roadAsphalt.playing()) {
                this.sounds.roadAsphalt.volume(0);
                this.sounds.roadAsphalt.play();
            }
            this.sounds.roadAsphalt.volume(targetAsphaltVol);
            this.sounds.roadAsphalt.rate(targetAsphaltRate);
        } else if (this.sounds.roadAsphalt && this.sounds.roadAsphalt.playing()) {
            this.sounds.roadAsphalt.fade(this.sounds.roadAsphalt.volume(), 0, 200);
            setTimeout(() => { if (!isAsphalt && this.sounds.roadAsphalt) this.sounds.roadAsphalt.pause(); }, 200);
        }

        // 2. ÇAKILLI YOL SESİ (freesound_road_gravel.mp3)
        if (isGravel && this.sounds.roadGravel) {
            const targetGravelVol = Math.min(0.80, (speed / 70) * 0.55 + 0.20 + windowVolBoost);
            const targetGravelRate = Math.min(1.25, Math.max(0.80, 0.80 + (speed / 100) * 0.40));
            if (!this.sounds.roadGravel.playing()) {
                this.sounds.roadGravel.volume(0);
                this.sounds.roadGravel.play();
            }
            this.sounds.roadGravel.volume(targetGravelVol);
            this.sounds.roadGravel.rate(targetGravelRate);
        } else if (this.sounds.roadGravel && this.sounds.roadGravel.playing()) {
            this.sounds.roadGravel.fade(this.sounds.roadGravel.volume(), 0, 200);
            setTimeout(() => { if (!isGravel && this.sounds.roadGravel) this.sounds.roadGravel.pause(); }, 200);
        }

        // 3. KUMLU / TOPRAK YOL SESİ (freesound_road_gravel_asphalt.mp3)
        if (isSandDirt && this.sounds.roadGravelAsphalt) {
            const targetSandVol = Math.min(0.75, (speed / 70) * 0.50 + 0.18 + windowVolBoost);
            const targetSandRate = Math.min(1.20, Math.max(0.85, 0.85 + (speed / 100) * 0.35));
            if (!this.sounds.roadGravelAsphalt.playing()) {
                this.sounds.roadGravelAsphalt.volume(0);
                this.sounds.roadGravelAsphalt.play();
            }
            this.sounds.roadGravelAsphalt.volume(targetSandVol);
            this.sounds.roadGravelAsphalt.rate(targetSandRate);
        } else if (this.sounds.roadGravelAsphalt && this.sounds.roadGravelAsphalt.playing()) {
            this.sounds.roadGravelAsphalt.fade(this.sounds.roadGravelAsphalt.volume(), 0, 200);
            setTimeout(() => { if (!isSandDirt && this.sounds.roadGravelAsphalt) this.sounds.roadGravelAsphalt.pause(); }, 200);
        }

        // 4. KABİN VE AÇIK CAM RÜZGAR SESİ (freesound_road_wind_ambience.mp3)
        if (speed >= 25 && this.sounds.roadWind) {
            let targetWindVol = Math.min(0.35, ((speed - 25) / 75) * 0.30);
            if (this.isWindowOpen) {
                targetWindVol = Math.min(0.80, targetWindVol + 0.35 + ((speed - 25) / 75) * 0.25);
            }
            const targetWindRate = Math.min(1.30, 0.90 + (speed / 100) * 0.30);
            if (!this.sounds.roadWind.playing()) {
                this.sounds.roadWind.volume(0);
                this.sounds.roadWind.play();
            }
            this.sounds.roadWind.volume(targetWindVol);
            this.sounds.roadWind.rate(targetWindRate);
        } else if (this.sounds.roadWind && this.sounds.roadWind.playing()) {
            this.sounds.roadWind.fade(this.sounds.roadWind.volume(), 0, 250);
            setTimeout(() => { if (speed < 25 && this.sounds.roadWind) this.sounds.roadWind.pause(); }, 250);
        }

        // 5. Yol derz vuruntusu (davul/çekiç hissini önlemek için kaldırıldı)

        // 6. SENTETİK DÜŞÜK FREKANS GÖVDE TİTREŞİMİ (Arka plan dolgusu)
        let subGain = (speed / 100) * 0.18;
        let cutoff = 350 + (speed * 2);
        this.tireFilter.type = 'lowpass';
        this.tireFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.1);
        this.tireFilter.Q.setTargetAtTime(1.0, this.ctx.currentTime, 0.1);
        this.tireGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1); // Yapay gurultu susturuldu
    }

    playRoadJointHit(speed = 45) {
        // Davul/çekiç hissi veren vuruntu sesleri iptal edildi
        return;
    }

    stopAllRoadSounds() {
        if (!this.sounds) return;
        ['roadAsphalt', 'roadGravel', 'roadGravelAsphalt', 'roadWind', 'cityAmbience', 'cabinAmbience'].forEach(key => {
            const snd = this.sounds[key];
            if (snd && snd.playing()) {
                snd.fade(snd.volume(), 0, 200);
                setTimeout(() => { if (snd) snd.pause(); }, 200);
            }
        });
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
        if (weatherType === 'snowy' && this.sounds && this.sounds.snowTires) {
            if (speed > 3) {
                const targetVol = Math.min(0.65, 0.12 + (speed / 90) * 0.45);
                if (!this.sounds.snowTires.playing()) {
                    this.sounds.snowTires.volume(0);
                    this.sounds.snowTires.play();
                }
                this.sounds.snowTires.volume(targetVol);
            } else if (this.sounds.snowTires.playing()) {
                this.sounds.snowTires.fade(this.sounds.snowTires.volume(), 0, 200);
                setTimeout(() => { if (speed <= 3 && this.sounds.snowTires) this.sounds.snowTires.pause(); }, 200);
            }
        } else if (this.sounds && this.sounds.snowTires && this.sounds.snowTires.playing()) {
            this.sounds.snowTires.fade(this.sounds.snowTires.volume(), 0, 200);
            setTimeout(() => { if (this.sounds.snowTires) this.sounds.snowTires.pause(); }, 200);
        }
    }
    
    // --- SAVRULMA VE ZORLANMA EFEKTİ (SKIDDING) ---
    playTireScreech(intensity) {
        if (!this.sounds || !this.sounds.tireScreech) return;
        const targetVol = Math.min(0.90, Math.max(0.20, intensity * 0.75));
        if (!this.sounds.tireScreech.playing()) {
            this.sounds.tireScreech.volume(targetVol);
            this.sounds.tireScreech.rate(0.95 + Math.random() * 0.15);
            this.sounds.tireScreech.play();
        } else {
            this.sounds.tireScreech.volume(targetVol);
        }
    }

    stopTireScreech() {
        if (this.sounds && this.sounds.tireScreech && this.sounds.tireScreech.playing()) {
            this.sounds.tireScreech.fade(this.sounds.tireScreech.volume(), 0, 150);
            setTimeout(() => { if (this.sounds.tireScreech) this.sounds.tireScreech.pause(); }, 150);
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

    // --- TEKERLEKLİ SANDALYE RAMPASI AÇILMA AKUSTİĞİ ---
    playRampDeploy() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Hidrolik motor sesi (220 Hz -> 360 Hz)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.8);
        
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
        gain.gain.setValueAtTime(0.3, now + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        
        osc.connect(gain);
        gain.connect(this.environmentMixer || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
        
        // 0.85 sn sonra metal rampanın kaldırıma oturma sesi (klank-tık)
        setTimeout(() => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const metalOsc = this.ctx.createOscillator();
            const metalGain = this.ctx.createGain();
            metalOsc.type = 'sawtooth';
            metalOsc.frequency.setValueAtTime(440, t);
            metalOsc.frequency.exponentialRampToValueAtTime(120, t + 0.15);
            metalGain.gain.setValueAtTime(0.35, t);
            metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            metalOsc.connect(metalGain);
            metalGain.connect(this.environmentMixer || this.ctx.destination);
            metalOsc.start(t);
            metalOsc.stop(t + 0.2);
        }, 850);
    }

    // --- TEKERLEKLİ SANDALYE RAMPASI KAPANMA AKUSTİĞİ ---
    playRampRetract() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Hidrolik motor geri sarma sesi (360 Hz -> 240 Hz)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.75);
        
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
        gain.gain.setValueAtTime(0.28, now + 0.65);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        osc.connect(gain);
        gain.connect(this.environmentMixer || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        
        // Yuvasına oturup kilitlenme kliği
        setTimeout(() => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'square';
            clickOsc.frequency.setValueAtTime(680, t);
            clickGain.gain.setValueAtTime(0.25, t);
            clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            clickOsc.connect(clickGain);
            clickGain.connect(this.environmentMixer || this.ctx.destination);
            clickOsc.start(t);
            clickOsc.stop(t + 0.1);
        }, 760);
    }

    // --- ŞEHİRLERARASI OTOBÜS PNÖMATİK BAGAJ KAPAKLARI ---
    playLuggageBays(isOpen = true) {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Ağır pnömatik hava tahliyesi
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(isOpen ? 1400 : 900, now);
        filter.Q.value = 2.0;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.environmentMixer || this.ctx.destination);
        noise.start(now);
    }

    // --- IBIS / YOLCU BİLGİLENDİRME ÇANI (DİJİTAL CHIME) ---
    playIBISChime() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [880, 1318.5]; // A5 -> E6 modern iki tonlu bilgilendirme ding-dong
        notes.forEach((freq, idx) => {
            const t = now + (idx * 0.14);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.35, t + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
            osc.connect(gain);
            gain.connect(this.environmentMixer || this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.38);
        });
    }

    // --- KAYIP EŞYA KONTROL SESİ (ADIMLAR VE BULMA ÇANI) ---
    playLostAndFoundWalk(foundItemCallback) {
        this.init();
        if (!this.ctx) {
            if (typeof foundItemCallback === 'function') foundItemCallback();
            return;
        }
        // 3 adım sesi
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, t);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                osc.connect(gain);
                gain.connect(this.environmentMixer || this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.09);
            }, i * 320);
        }
        
        // 1.2 saniye sonra eşya bulma çanı
        setTimeout(() => {
            this.playIBISChime();
            if (typeof foundItemCallback === 'function') foundItemCallback();
        }, 1200);
    }

    playCrash() {
        this.sounds.crash.play();
    }

    // --- ŞOFÖR LİYAKAT VE ROZET FANFARI (ZAFER ARPEJİ) ---
    
    // =========================================================================
    // KOKPİT VE AKUSTİK ÇEVRE SİSTEMİ (ATMOSPHERIC ACOUSTIC SUITE)
    // =========================================================================

    // 1. TERMOS ÇAY YUDUMLAMA (V TUŞU)
    playTeaPourAndSip(onComplete) {
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // A. Termos kapağı açılma / metal klik
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(320, now);
        clickOsc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        clickGain.gain.setValueAtTime(0.3, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.08);
        clickOsc.onended = () => { try { clickOsc.disconnect(); clickGain.disconnect(); } catch(e){} };

        // B. Çay doldurma şırıltısı (0.1s - 1.2s arası filtrelenmiş su gürültüsü)
        const bufferSize = Math.floor(ctx.sampleRate * 1.1);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.02);
        }
        const pourSource = ctx.createBufferSource();
        pourSource.buffer = noiseBuffer;

        const pourFilter = ctx.createBiquadFilter();
        pourFilter.type = 'bandpass';
        pourFilter.frequency.setValueAtTime(1200, now + 0.1);
        pourFilter.frequency.linearRampToValueAtTime(1900, now + 1.2);
        pourFilter.Q.value = 4.0;

        const pourGain = ctx.createGain();
        pourGain.gain.setValueAtTime(0.001, now);
        pourGain.gain.setValueAtTime(0.001, now + 0.1);
        pourGain.gain.linearRampToValueAtTime(0.25, now + 0.3);
        pourGain.gain.linearRampToValueAtTime(0.18, now + 0.9);
        pourGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        pourSource.connect(pourFilter);
        pourFilter.connect(pourGain);
        pourGain.connect(ctx.destination);
        pourSource.start(now + 0.1);
        pourSource.stop(now + 1.25);
        pourSource.onended = () => { try { pourSource.disconnect(); pourFilter.disconnect(); pourGain.disconnect(); } catch(e){} };

        // C. Çay kaşığı çınlaması (iki berrak metalik tıkırtı)
        [1.3, 1.48].forEach(tOffset => {
            const spoonOsc = ctx.createOscillator();
            const spoonGain = ctx.createGain();
            spoonOsc.type = 'sine';
            spoonOsc.frequency.setValueAtTime(2400, now + tOffset);
            spoonGain.gain.setValueAtTime(0.2, now + tOffset);
            spoonGain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.12);
            spoonOsc.connect(spoonGain);
            spoonGain.connect(ctx.destination);
            spoonOsc.start(now + tOffset);
            spoonOsc.stop(now + tOffset + 0.12);
            spoonOsc.onended = () => { try { spoonOsc.disconnect(); spoonGain.disconnect(); } catch(e){} };
        });

        // D. Sıcak yudumlama nefesi (1.7s)
        const sipOsc = ctx.createOscillator();
        const sipGain = ctx.createGain();
        sipOsc.type = 'triangle';
        sipOsc.frequency.setValueAtTime(180, now + 1.7);
        sipOsc.frequency.linearRampToValueAtTime(90, now + 2.2);
        sipGain.gain.setValueAtTime(0.001, now + 1.7);
        sipGain.gain.linearRampToValueAtTime(0.15, now + 1.85);
        sipGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
        sipOsc.connect(sipGain);
        sipGain.connect(ctx.destination);
        sipOsc.start(now + 1.7);
        sipOsc.stop(now + 2.3);
        sipOsc.onended = () => {
            try { sipOsc.disconnect(); sipGain.disconnect(); } catch(e){}
            if (typeof onComplete === 'function') onComplete();
        };
    }

    // 2. KAPTAN SOL CAMI MOTORU VE AKUSTİK YALITIM
    toggleDriverWindow() {
        this.init();
        const now = this.ctx.currentTime;
        this.isWindowOpen = !this.isWindowOpen;

        // Elektrikli cam motor sesi (0.5s vızıltı)
        const motorOsc = this.ctx.createOscillator();
        const motorGain = this.ctx.createGain();
        motorOsc.type = 'sawtooth';
        motorOsc.frequency.setValueAtTime(this.isWindowOpen ? 160 : 190, now);
        motorOsc.frequency.linearRampToValueAtTime(this.isWindowOpen ? 140 : 175, now + 0.5);
        motorGain.gain.setValueAtTime(0.1, now);
        motorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        motorOsc.connect(motorGain);
        motorGain.connect(this.ctx.destination);
        motorOsc.start(now);
        motorOsc.stop(now + 0.5);
        motorOsc.onended = () => { try { motorOsc.disconnect(); motorGain.disconnect(); } catch(e){} };

        this.setWindowOpen(this.isWindowOpen);
        return this.isWindowOpen;
    }

    // 3. PARKE TAŞLI SOKAK TİTREŞİMİ (RUMBLE)
    startCobblestoneRumble(speed = 30) {
        this.init();
        if (!this.ctx || this.cobblestoneRunning) return;
        this.cobblestoneRunning = true;

        const ctx = this.ctx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(28, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(90, now);

        const targetVol = Math.min(0.28, Math.max(0.05, (speed / 60) * 0.25));
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(targetVol, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);

        this.cobblestoneSource = osc;
        this.cobblestoneGain = gain;
        this.cobblestoneFilter = filter;
    }

    stopCobblestoneRumble() {
        if (!this.cobblestoneRunning || !this.cobblestoneGain) return;
        this.cobblestoneRunning = false;
        const now = this.ctx.currentTime;
        try {
            this.cobblestoneGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
            setTimeout(() => {
                try {
                    if (this.cobblestoneSource) this.cobblestoneSource.stop();
                    if (this.cobblestoneSource) this.cobblestoneSource.disconnect();
                    if (this.cobblestoneFilter) this.cobblestoneFilter.disconnect();
                    if (this.cobblestoneGain) this.cobblestoneGain.disconnect();
                } catch(e){}
            }, 350);
        } catch(e){}
    }

    // 4. KÖPRÜ VE ALTGEÇİT YANKISI (REVERB / ECHO LOOP)
    enableTunnelReverb() {
        this.init();
        if (!this.ctx || this.tunnelActive) return;
        this.tunnelActive = true;

        const ctx = this.ctx;
        const delay = ctx.createDelay(1.0);
        delay.delayTime.value = 0.16; // 160ms yankı gecikmesi

        const feedback = ctx.createGain();
        feedback.gain.value = 0.38; // Yumuşak sönümlenme

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1600; // Tünel içi beton yutumu

        delay.connect(filter);
        filter.connect(feedback);
        feedback.connect(delay);
        filter.connect(ctx.destination);

        this.tunnelDelay = delay;
        this.tunnelFeedback = feedback;
        this.tunnelFilter = filter;

        // Hafif tünel uğultusu
        const ambientOsc = ctx.createOscillator();
        const ambientGain = ctx.createGain();
        ambientOsc.type = 'sine';
        ambientOsc.frequency.value = 85;
        ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
        ambientGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);
        ambientOsc.connect(ambientGain);
        ambientGain.connect(delay);
        ambientOsc.start();
        this.tunnelAmbient = ambientOsc;
        this.tunnelAmbientGain = ambientGain;
    }

    disableTunnelReverb() {
        if (!this.tunnelActive) return;
        this.tunnelActive = false;
        const now = this.ctx.currentTime;
        try {
            if (this.tunnelAmbientGain) this.tunnelAmbientGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
            if (this.tunnelFeedback) this.tunnelFeedback.gain.linearRampToValueAtTime(0.001, now + 0.5);
            setTimeout(() => {
                try {
                    if (this.tunnelAmbient) this.tunnelAmbient.stop();
                    if (this.tunnelAmbient) this.tunnelAmbient.disconnect();
                    if (this.tunnelAmbientGain) this.tunnelAmbientGain.disconnect();
                    if (this.tunnelDelay) this.tunnelDelay.disconnect();
                    if (this.tunnelFeedback) this.tunnelFeedback.disconnect();
                    if (this.tunnelFilter) this.tunnelFilter.disconnect();
                } catch(e){}
            }, 600);
        } catch(e){}
    }

    // 5. KASİS GEÇİŞİ SÜSPANSİYON ESNEYESİ ("GÜM-PISS")
    playSuspensionBounce() {
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // A. Alt frekans esneme / güm
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(75, now);
        thudOsc.frequency.exponentialRampToValueAtTime(32, now + 0.22);
        thudGain.gain.setValueAtTime(0.45, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.start(now);
        thudOsc.stop(now + 0.25);
        thudOsc.onended = () => { try { thudOsc.disconnect(); thudGain.disconnect(); } catch(e){} };

        // B. Havalı körük süspansiyon tıslaması ("pıss")
        const bufferSize = Math.floor(ctx.sampleRate * 0.28);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const hissSource = ctx.createBufferSource();
        hissSource.buffer = noiseBuffer;

        const hissFilter = ctx.createBiquadFilter();
        hissFilter.type = 'highpass';
        hissFilter.frequency.value = 1800;

        const hissGain = ctx.createGain();
        hissGain.gain.setValueAtTime(0.001, now);
        hissGain.gain.setValueAtTime(0.2, now + 0.05);
        hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        hissSource.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(ctx.destination);
        hissSource.start(now + 0.04);
        hissSource.stop(now + 0.3);
        hissSource.onended = () => { try { hissSource.disconnect(); hissFilter.disconnect(); hissGain.disconnect(); } catch(e){} };
    }

    // 6. KARŞIDAN GEÇEN MESLEKTAŞ OTOBÜS VE SELAMLAŞMA KORNASI
    playPassingBus(onHonkWindow) {
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // A. Stereo soldan vııın geçiş efekti
        const passOsc = ctx.createOscillator();
        const passGain = ctx.createGain();
        const panner = ctx.createStereoPanner();

        passOsc.type = 'triangle';
        passOsc.frequency.setValueAtTime(180, now);
        passOsc.frequency.exponentialRampToValueAtTime(95, now + 1.8);

        // Soldan yaklaş ve geç: Pan -0.2 -> -0.8
        panner.pan.setValueAtTime(-0.25, now);
        panner.pan.linearRampToValueAtTime(-0.85, now + 1.8);

        passGain.gain.setValueAtTime(0.001, now);
        passGain.gain.linearRampToValueAtTime(0.35, now + 0.7);
        passGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        passOsc.connect(passGain);
        passGain.connect(panner);
        panner.connect(ctx.destination);
        passOsc.start(now);
        passOsc.stop(now + 1.8);
        passOsc.onended = () => { try { passOsc.disconnect(); passGain.disconnect(); panner.disconnect(); } catch(e){} };

        // B. İki dostça kısa korna ("düt-düt") (0.5s ve 0.75s)
        [0.45, 0.72].forEach(offset => {
            const hornOsc1 = ctx.createOscillator();
            const hornOsc2 = ctx.createOscillator();
            const hGain = ctx.createGain();
            const hPanner = ctx.createStereoPanner();
            hPanner.pan.value = -0.7;

            hornOsc1.type = 'sawtooth';
            hornOsc2.type = 'sawtooth';
            hornOsc1.frequency.value = 392; // G4
            hornOsc2.frequency.value = 493.88; // B4

            hGain.gain.setValueAtTime(0.2, now + offset);
            hGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

            hornOsc1.connect(hGain);
            hornOsc2.connect(hGain);
            hGain.connect(hPanner);
            hPanner.connect(ctx.destination);

            hornOsc1.start(now + offset);
            hornOsc2.start(now + offset);
            hornOsc1.stop(now + offset + 0.13);
            hornOsc2.stop(now + offset + 0.13);

            hornOsc1.onended = () => { try { hornOsc1.disconnect(); hornOsc2.disconnect(); hGain.disconnect(); hPanner.disconnect(); } catch(e){} };
        });

        // 4 saniyelik selamlaşma penceresini başlat
        if (typeof onHonkWindow === 'function') {
            setTimeout(onHonkWindow, 400);
        }
    }

    // 7. YAĞMURDA ŞEMSİYE SİLKELEME VE KAPATMA SESİ ("ŞAK-ŞIRK")
    playUmbrellaShake() {
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const bufferSize = Math.floor(ctx.sampleRate * 0.35);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.cos(i * 0.05);
        }
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2400;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(now);
        source.stop(now + 0.38);
        source.onended = () => { try { source.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e){} };
    }

    playBadgeFanfare() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 -> E5 -> G5 -> C6 altın zafer arpeji
        notes.forEach((freq, idx) => {
            const t = now + (idx * 0.12);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            
            const isLast = (idx === notes.length - 1);
            const dur = isLast ? 0.75 : 0.22;
            
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.42, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + dur);
        });
    }

    // --- PNÖMATİK (HAVALI FREN) SESLERİ ---
    
    playBrakeRelease() {
        if (this.sounds && this.sounds.airBrake) {
            try { this.sounds.airBrake.play(); return; } catch(e){}
        }
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

    playAirBrake() {
        if (this.sounds && this.sounds.airBrake) {
            try { this.sounds.airBrake.play(); } catch(e){}
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
        if (type === 'tam' && this.sounds && this.sounds.akbilTam) {
            try { this.sounds.akbilTam.play(); return; } catch(e){}
        } else if (type === 'ogrenci' && this.sounds && this.sounds.akbilOgrenci) {
            try { this.sounds.akbilOgrenci.play(); return; } catch(e){}
        } else if ((type === 'yetersiz' || type === 'ret' || type === 'hata') && this.sounds && this.sounds.akbilHata) {
            try { this.sounds.akbilHata.play(); return; } catch(e){}
        } else if ((type === 'yasli' || type === 'serbest') && this.sounds && this.sounds.busValidator) {
            try { this.sounds.busValidator.play(); return; } catch(e){}
        }
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

    
    playAkbilTam() {
        if (this.sounds && this.sounds.akbilTam) {
            try { this.sounds.akbilTam.play(); } catch(e){}
        } else {
            this.playValidatorSound('tam');
        }
    }

    playAkbilOgrenci() {
        if (this.sounds && this.sounds.akbilOgrenci) {
            try { this.sounds.akbilOgrenci.play(); } catch(e){}
        } else {
            this.playValidatorSound('ogrenci');
        }
    }

    playAkbilHata() {
        if (this.sounds && this.sounds.akbilHata) {
            try { this.sounds.akbilHata.play(); } catch(e){}
        } else {
            this.playValidatorSound('yetersiz');
        }
    }

    playBusValidator() {
        if (this.sounds && this.sounds.busValidator) {
            try { this.sounds.busValidator.play(); } catch(e){}
        } else {
            this.playValidatorSound('serbest');
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
                const trVoices = voices.filter(v => v.lang === 'tr-TR' || v.lang === 'tr_TR' || v.lang.startsWith('tr'));
                const naturalTr = trVoices.find(v => v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Google'));
                const trVoice = naturalTr || trVoices[0];
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


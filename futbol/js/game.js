
// --- AUDIO MANAGER ---
window.AudioManager = {
    ambiance: null,
    cheer: null,
    boo: null,
    miss: null,
    chantAudio: null,
    isChanting: false,
    isMuted: false,
    
    init: function() {
        if (!this.ambiance) {
            this.ambiance = new Audio('sounds/ambiance.ogg');
            this.ambiance.loop = true;
            this.ambiance.volume = 0.4; // Arka plan
        }
        if (!this.cheer) {
            this.cheer = new Audio('sounds/cheer.ogg');
            this.cheer.volume = 0.8;
        }
        if (!this.boo) {
            this.boo = new Audio('sounds/boo.ogg');
            this.boo.volume = 0.7;
        }
        if (!this.miss) {
            this.miss = new Audio('sounds/miss.ogg');
            this.miss.volume = 0.9;
        }
        
        // Mute butonunu ekle (Eğer yoksa)
        if (!document.getElementById('btn-mute')) {
            let muteBtn = document.createElement('button');
            muteBtn.id = 'btn-mute';
            muteBtn.innerHTML = 'ğŸ”Š';
            muteBtn.style.cssText = 'position:absolute; top:20px; right:20px; z-index:1000; font-size:2rem; background:transparent; border:none; cursor:pointer; outline:none; text-shadow: 0 0 10px rgba(0,0,0,0.5);';
            muteBtn.onclick = () => this.toggleMute();
            document.getElementById('game-container').appendChild(muteBtn);
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    },
    
    startAmbiance: function() {
        if (this.isMuted) return;
        if (this.ambiance) this.ambiance.play().catch(e => console.log("Audio play prevented:", e));
    },
    
    stopAmbiance: function() {
        if (this.ambiance) this.ambiance.pause();
    },
    
    playCheer: function() {
        if (this.isMuted) return;
        if (this.cheer) {
            this.cheer.currentTime = 0;
            this.cheer.play().catch(e => console.log(e));
            // Sesi geçici kıs
            if (this.ambiance) this.ambiance.volume = 0.1;
            setTimeout(() => { if (this.ambiance) this.ambiance.volume = 0.4; }, 4000);
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    },
    
    playBoo: function() {
        if (this.isMuted) return;
        if (this.boo) {
            this.boo.currentTime = 0;
            this.boo.play().catch(e => console.log(e));
            // Sesi geçici kıs
            if (this.ambiance) this.ambiance.volume = 0.1;
            setTimeout(() => { if (this.ambiance) this.ambiance.volume = 0.4; }, 4000);
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    },
    
    
    
    
    fadeInterval: null,
    
    
    audioCtx: null,
    
    initAudioContext: function() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    },

    
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
            
            // DİKKAT: BOÄUKLAÅTIRMA FİLTRESİ (BiquadFilter) YOK! Sesi net ve gür çıkacak.
            awaySource.connect(awayPanner);
            awayPanner.connect(this.audioCtx.destination);
            
            
            // Yankı Efekti (Boş stadyumda çınlama)
            let delayNode = this.audioCtx.createDelay();
            delayNode.delayTime.value = 0.3; // 300ms yankı
            let feedbackNode = this.audioCtx.createGain();
            feedbackNode.gain.value = 0.4; // Yankı şiddeti
            
            awaySource.connect(delayNode);
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode);
            delayNode.connect(awayPanner);
            
            awayAudio.volume = 1.0; // Maksimum ses
            awayAudio.play().catch(err=>{});
            
            if (this.ambiance) this.ambiance.volume = 0.05; // Ev sahibi tamamen sustu
            
            if(typeof speak === 'function') speak("Ev sahibi takım geriye düştü ve koca stadyum sustu! Åu an köşedeki o %5'lik küçük deplasman grubunun hiç susmadan söylediği marşlar tüm stadyumda yankılanıyor! Ev sahibi takım kendi evinde adeta deplasmanı yaşıyor!");

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
    },
    
    triggerWelcomeToHell: function(homeTeamId) {
        if (this.isMuted) return;
        
        try { this.initAudioContext(); } catch(e) { return; }

        if(typeof speak === 'function') speak("Takımlar tünelden çıkıyor... Ve stadyumda kulakları sağır eden bir desibel! Deplasman takımına resmen 'Cehenneme Hoş Geldiniz' diyorlar!");

        // 3 Sesi aynı anda çalarak devasa bir "Ses Duvarı" (Koreografi) yaratıyoruz
        let chantAudio = new Audio('sounds/chant_' + homeTeamId + '.ogg');
        let cheerAudio = new Audio('sounds/cheer.ogg');
        let booAudio = new Audio('sounds/boo.ogg');
        
        chantAudio.crossOrigin = "anonymous";
        cheerAudio.crossOrigin = "anonymous";
        booAudio.crossOrigin = "anonymous";

        let playHell = () => {
            let chantSource = this.audioCtx.createMediaElementSource(chantAudio);
            let cheerSource = this.audioCtx.createMediaElementSource(cheerAudio);
            let booSource = this.audioCtx.createMediaElementSource(booAudio);
            
            // Tüm sesler merkezden ama maksimum distorsiyon/reverb hissiyle
            chantSource.connect(this.audioCtx.destination);
            cheerSource.connect(this.audioCtx.destination);
            booSource.connect(this.audioCtx.destination);
            
            chantAudio.volume = 1.0;
            cheerAudio.volume = 0.8;
            booAudio.volume = 0.6; // Islıklar alt frekansta
            
            chantAudio.play().catch(e=>{});
            cheerAudio.play().catch(e=>{});
            booAudio.play().catch(e=>{});
            
            // 15 Saniye sonra ses şöleni biter
            setTimeout(() => {
                let fade = setInterval(() => {
                    if (chantAudio.volume > 0.05) {
                        chantAudio.volume -= 0.05;
                        cheerAudio.volume -= 0.04;
                        booAudio.volume -= 0.03;
                    } else {
                        clearInterval(fade);
                        chantAudio.pause();
                        cheerAudio.pause();
                        booAudio.pause();
                    }
                }, 200);
            }, 12000);
        };
        
        chantAudio.onerror = () => { chantAudio = new Audio('sounds/ambiance.ogg'); chantAudio.crossOrigin="anonymous"; playHell(); };
        setTimeout(() => { playHell(); }, 1000); // Maç başlar başlamaz patlar
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
    },
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
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    },
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
    },
    playMiss: function() {
        if (this.isMuted) return;
        if (this.miss) {
            this.miss.currentTime = 0;
            this.miss.play().catch(e => console.log(e));
            if (this.ambiance) this.ambiance.volume = 0.2;
            setTimeout(() => { if (this.ambiance) this.ambiance.volume = 0.4; }, 3000);
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    },
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        let btn = document.getElementById('btn-mute');
        if (this.isMuted) {
            this.stopAmbiance();
            if (btn) btn.innerHTML = 'ğŸ”‡';
        } else {
            this.startAmbiance();
            if (btn) btn.innerHTML = 'ğŸ”Š';
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
};
// --- AUDIO MANAGER SONU ---

// game2.js - Tamamen Baştan Yazılmış Gelişmiş Futbol Motoru (Aşama 1-20)

let canvas = document.getElementById('game-canvas');
let ctx = canvas ? canvas.getContext('2d') : null;

// Durumlar ve Değişkenler
let gameActive = false;
let isPaused = false;
window.managerAuthority = 100;
window.presidentConfidence = 100;
window.consecutiveLosses = 0;
window.consecutivePasses = 0; window.isOleyActive = false;
window.lastBallTeam = 'none';
window.isComebackActive = false;
window.comebackTimer = 0;
window.isRhythmicClapping = false;
window.awayPossessionTime = 0;
window.refereeFear = 0;
window.traitorAssigned = false;
let selectedPauseIndex = 0;
const pauseMenuOptions = ['Devam Et', 'Taktik Değiştir', 'Oyuncu Değiştir', 'Maçtan Çekil', 'Oyuncularla Konuş (Fırça/Motivasyon)'];

// AÅžAMA 42: OYUN DURAKSAMA MEKANİÄžİ
let isGameHalted = false;
let gameHaltTimer = 0;
let haltReason = "";



window.CrowdForm = 1;
window.currentWeek = window.currentWeek || 1;

window.updateCrowdForm = function() {
    if (typeof window.playerScore === 'undefined' || typeof window.enemyScore === 'undefined') return;
    
    let diff = window.enemyScore - window.playerScore;
    let newForm = 1;
    
    // Makro-Tribün Psikolojisi (Haftalar ilerledikçe Sabır Tükenir)
    // Sezon başı kredisi: (100 üzerinden) her hafta azalır. 
    // Toplam Sabır (Patience) = managerAuthority + Sezon Kredisi
    let seasonCredit = Math.max(0, 100 - (window.currentWeek * 5)); // Her hafta 5 kredi düşer (20 haftada biter)
    let patience = (window.managerAuthority || 100) + seasonCredit;

    // Sabır puanına göre ana form belirleniyor
    
      window.isHistoricalClub = window.isHistoricalClub || (Math.random() < 0.5); // Åžimdilik simüle etmek için %50 ihtimal veya dışarıdan atanabilir
      window.seasonPoints = window.seasonPoints || (window.currentWeek * 1.5); // Geçici puan hesabı
      
      // FORM 7: Absürt Karnaval (Skorun Ölümü) - Åžampiyonluk garantiyse veya küme düşmüşse
      if (window.currentWeek > 30 && (window.seasonPoints > 85 || window.seasonPoints < 25)) {
          newForm = 7;
      }
      // FORM 6: Geçmişin Hayaletleri - Tarihi kulüp krizdeyse
      else if (window.isHistoricalClub && patience < 80 && patience > 20) {
          newForm = 6;
      }
      else if (patience < 20 && window.currentWeek >= 10) {
        newForm = 5; // Ruhsuz Kabulleniş (Umursamazlık)
    } else if (patience < 50) {
        newForm = 4; // Toksik İsyan (Otorite yerle bir, kredi bitmiş)
    } else if (patience < 100) {
        newForm = 3; // Yıkılan Kale
    } else if (patience < 160) {
        newForm = 2; // Taktiksel Homurdanma
    } else {
        newForm = 1; // Romantik İyimserlik (Koşulsuz Kalkan)
    }

    // Maç içi dinamikler (Skor) bu 'Ana Formu' anlık olarak esnetebilir
    if (diff >= 3 && newForm < 4) newForm += 1; // 3 fark yenirse taraftar 1 kademe daha delirir
    if (diff < 0 && newForm > 1) newForm -= 1;  // Öne geçerse taraftar 1 kademe sakinleşir

    // Sınırlandırmalar
    if (newForm > 7) newForm = 7;
    if (newForm < 1) newForm = 1;
    
    if (window.currentFanProfile) {
        if (window.currentFanProfile.profile === 'ultras') {
            newForm = 1; // Ultras asla takıma küsmez, hep destekler
        } else if (window.currentFanProfile.profile === 'cekirdekci') {
            newForm = Math.max(newForm + 1, 2); // Çekirdekçi hep tatminsizdir
        } else if (window.currentFanProfile.profile === 'plastik') {
            if (diff >= 2) newForm = 1; // Şov varsa inanılmaz coşkulu
            else if (diff < 0) newForm = Math.max(newForm, 4); // Geriye düşünce hemen maçı bırakıp protesto / terk etmeye başlarlar
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    // Gerçekçilik Kilidi: Stadyum ilk haftalardan ateşe verilmez (Form 4 için en az 4 hafta geçmeli)
    if (newForm === 4 && window.currentWeek <= 3) newForm = 3;

    
      // Yan Form 1: Bölünmüş Tribün (İç Savaş)
      window.isCrowdDivided = false;
      if (newForm === 2 || newForm === 3) {
          // Otorite ne tam sağlam ne tam bitikse tribün kutuplaşır
          if (window.managerAuthority >= 40 && window.managerAuthority <= 60 && Math.random() < 0.3) {
              window.isCrowdDivided = true;
          }
      }
      
      if (window.CrowdForm !== newForm) {
        window.CrowdForm = newForm;
        if (typeof announcerText !== 'undefined') {
            let formNames = ["", "TRİBÜN FORMU 1: ROMANTİK İYİMSERLİK", "TRİBÜN FORMU 2: TAKTİKSEL HOMURDANMA", "TRİBÜN FORMU 3: YIKILAN KALE (TRAVMA)", "TRİBÜN FORMU 4: TOKSİK İSYAN", "TRİBÜN FORMU 5: RUHSUZ KABULLENİÅž", "TRİBÜN FORMU 6: GEÇMİÅžİN HAYALETLERİ", "TRİBÜN FORMU 7: ABSÜRT KARNAVAL"];
            if (window.isFriendlyMatch) { announcerText.textContent = "HAZIRLIK MAÇI | " + formNames[newForm]; } else { announcerText.textContent = "HAFTA " + window.currentWeek + " | " + formNames[newForm]; }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
};
window.playerScore = 0;
window.enemyScore = 0;
let timeLeft = 90;
let lastObjectionMinute = 100; // 90'dan geriye saydığı için 100 güvenli bir başlangıç değeri
let objectionCount = 0; // Maç başı itiraz sayısı
let matchTimer = null;
let matchEventTimer = null;

let currentWeather = 'sunny';
let teamPsychology = 'normal';
let awayTeamPsychology = 'normal';
let prevPsychology = 'normal';
let historicWorstDeficit = 0;
let fatigueAnnounced = false; // AÅžAMA 28: Yorgunluk anonsu yapıldı mı?

let strikerRunActive = false;
let strikerRunTimer = 0;
let currentStriker = null;

// AÅžAMA 27: Forvet Psikolojisi
let strikerConfidence = 100;
let strikerMissedShots = 0;
let lastShooter = null;

let keys = {};
let homePlayers = [];
let awayPlayers = [];
let ball = { x: 400, y: 250, vx: 0, vy: 0, team: 'none', passCooldown: 0, isAirborne: false, airborneUntil: 0 };
let activePlayer = null;
let announcerText = document.getElementById('announcer-text') || { textContent: '' };

let homeFormations = [
    {x: 100, y: 250}, {x: 200, y: 150}, {x: 200, y: 350},
    {x: 350, y: 100}, {x: 350, y: 250}, {x: 350, y: 400},
    {x: 500, y: 150}, {x: 500, y: 350}, {x: 600, y: 250}, {x: 650, y: 200}, {x: 650, y: 300}
];

function initGame() {
    window.lastFrameTime = 0;
    if (window.gameLoopAnimationId) cancelAnimationFrame(window.gameLoopAnimationId);

    // YENİ: Hava Durumu Sistemi
    const weathers = [
        { type: 'sunny', icon: 'fa-sun', name: 'Güneşli' },
        { type: 'rainy', icon: 'fa-cloud-rain', name: 'Yağmurlu' },
        { type: 'snowy', icon: 'fa-snowflake', name: 'Karlı' },
        { type: 'foggy', icon: 'fa-smog', name: 'Sisli' }
    ];
    let wRand = Math.random();
    let w;
    if (wRand < 0.6) w = weathers[0]; // 60% Güneşli
    else if (wRand < 0.8) w = weathers[1]; // 20% Yağmurlu
    else if (wRand < 0.9) w = weathers[2]; // 10% Karlı
    else w = weathers[3]; // 10% Sisli
    
    window.currentWeather = w;
    
    let weatherIcon = document.getElementById('weather-icon');
    if (weatherIcon) {
        weatherIcon.innerHTML = `<i class="fas ${w.icon}"></i>`;
        weatherIcon.title = "Hava Durumu: " + w.name;
        weatherIcon.style.color = w.type === 'snowy' ? '#ecf0f1' : (w.type === 'rainy' ? '#3498db' : (w.type === 'foggy' ? '#95a5a6' : '#f1c40f'));
        weatherIcon.style.borderColor = weatherIcon.style.color;
    }
    
    let weatherAnnounce = "";
    if (w.type === 'sunny') weatherAnnounce = "Stadyumda harika, güneşli bir hava var. Futbol oynamak için mükemmel bir zemin!";
    else if (w.type === 'rainy') weatherAnnounce = "Şu an sağanak yağmur altındayız. Zemin kaygan, oyuncular pas yaparken çok dikkatli olmalı.";
    else if (w.type === 'snowy') weatherAnnounce = "Stadyum bembeyaz! Yoğun kar yağışı oyunu zorlaştıracak gibi duruyor. Topu kontrol etmek çok güç.";
    else if (w.type === 'foggy') weatherAnnounce = "Sahaya yoğun bir sis çöktü. Göz gözü görmüyor sayın seyirciler, kalecilerin işi çok zor.";
    
    setTimeout(() => { if(typeof speak === 'function') speak(weatherAnnounce); }, 3500);

    // Ses Motorunu ve Spikeri Tarayıcı Kısıtlamalarından Kurtar (Unlock)
    if ('speechSynthesis' in window) {
        let dummy = new SpeechSynthesisUtterance('');
        dummy.volume = 0;
        window.speechSynthesis.speak(dummy);
    }
    
    // Sesleri başlat
    if (window.AudioManager) {
        window.AudioManager.init();
        window.AudioManager.startAmbiance();
        
        // Seremoni: İstiklal Marşı'nı çal (Geçici olarak devre dışı bırakıldı - hızlı başlatma için)
        /*
        if (typeof window.audioEngine !== 'undefined' && window.audioEngine.initAnthem) {
            window.audioEngine.initAnthem();
            window.audioEngine.playAnthem();
            // Seremoni bitişi (12 saniye sonra yavaşça kapat)
            setTimeout(() => {
                if (window.audioEngine.stopAnthem) {
                    window.audioEngine.stopAnthem();
                }
            }, 12000);
        }
        */
          
          // AÅžAMA 73: Sessizlik Protestosu
          window.isSilentProtest = false;
          if ((window.consecutiveLosses >= 2 && Math.random() < 0.6) || (window.managerAuthority < 40 && Math.random() < 0.5)) {
              window.isSilentProtest = true;
          }
          

          // YENİ: TARAFTAR PROFİLLERİ
          window.fanProfilesDatabase = [
              { 
                  name: "Ultras ve 'Kapalı Tribün' Sevdalıları (Ateşli Taraftarlar)", 
                  profile: "ultras", 
                  desc: "Takımın kazandığı veya kaybettiğiyle ilgilenmezler; aslolan armadır. Geriye düştüğünde asla ıslıklamaz, desteği artırırlar."
              },
              {
                  name: "Çekirdekçi Seyirci (Numaralı Tribün / VIP)",
                  profile: "cekirdekci",
                  desc: "Sabır eşikleri çok düşüktür. 2 pas hatasında bile homurdanırlar, trafiğe kalmamak için maç bitmeden ayrılabilirler."
              },
              {
                  name: "Taktiksel ve Analitik Taraftar (Yeni Nesil)",
                  profile: "analitik",
                  desc: "Oyunu duygularla değil istatistiklerle okurlar. xG ve ısı haritasına bakarlar. Oyuncu değişikliklerini ve açıklamaları eleştirirler."
              },
              {
                  name: "İyi Gün Taraftarı (Plastik / Sosyal Medya Seyircisi)",
                  profile: "plastik",
                  desc: "Sadece iyi günde veya yıldız oyuncu geldiğinde ortaya çıkarlar. Maç kötü gidince formayı dolaba kaldırır, stadyumda sadece story atarlar."
              },
              {
                  name: "Bireysel Oyuncu Fanı (Z Kuşağı Editçileri)",
                  profile: "oyuncu",
                  desc: "Kulübü değil sadece takımın en büyük yıldızını desteklerler. Yıldızın her hareketini TikTok'a atar, diğer futbolcuları hata yaptıklarında linç ederler."
              },
              {
                  name: "Endüstriyel Futbol Karşıtı / Nostaljik Romantik (Eski Toprak)",
                  profile: "nostaljik",
                  desc: "Paraya, VAR'a ve modern futbola düşmandırlar. Yıldız transferlerden nefret eder, altyapıdan çıkan isimsiz gençlere sonsuz destek verirler."
              }
          ];
          window.currentFanProfile = window.fanProfilesDatabase[Math.floor(Math.random() * window.fanProfilesDatabase.length)];
          
          if (window.currentFanProfile.profile === 'oyuncu') {
              setTimeout(() => {
                  if (typeof homePlayers !== 'undefined' && homePlayers.length > 0) {
                      window.idolPlayer = homePlayers.reduce((max, p) => (p.power > max.power ? p : max), homePlayers[0]);
                      // Taraftar ruh hali/profili kullanıcı isteği üzerine tamamen gizlendi
                  }
              }, 2000);
          }
          
          setTimeout(() => {
              // Taraftar ruh hali/profili tamamen gizlendi
          }, 8000);

          // YENİ: DİNAMİK HAKEM SİSTEMİ (11 Profil)
          window.refereesDatabase = [
              { name: "Szymon Marciniak", profile: "iletisimci", desc: "İletişimci (Kartları en son çare olarak kullanır)" },
              { name: "Pierluigi Collina", profile: "diktator", desc: "Diktatör (Sertliğe sıfır tolerans gösterir, çabuk kart çıkarır)" },
              { name: "Mike Dean", profile: "sovmen", desc: "Şovmen (Oyunu durdurmayı sever, kararlarıyla sahneye çıkar)" },
              { name: "Cüneyt Çakır", profile: "kuralci", desc: "Kuralcı (Standartlardan sapmaz, oyun çok durur)" },
              { name: "Ali Palabıyık", profile: "eyyamci", desc: "Eyyamcı (Ev sahibine veya büyük takıma tölerans gösterebilir)" },
              { name: "Mete Kalkavan", profile: "var_bagimlisi", desc: "VAR Bağımlısı (İnisiyatif almaktan kaçınır, bol bol VAR'a gider)" },
              { name: "Fırat Aydınus", profile: "ic_saha", desc: "İç Saha Hakemi (Tribün baskısından çok kolay etkilenir)" },
              { name: "Michael Oliver", profile: "ada_tarzi", desc: "Ada Tarzı (Fiziksel oyuna izin verir, çok nadir düdük çalar)" },
              { name: "Mateu Lahoz", profile: "fisleyen", desc: "Oyuncuyu Fişleyen (Önyargılıdır, sabıkalı oyunculara inanmaz)" },
              { name: "Arda Kardeşler", profile: "caylak", desc: "Çaylak/Panik (Otoritesini kurmak için gereksiz kartlar çıkarabilir)" },
              { name: "Halil Umut Meler", profile: "atletik", desc: "Atletik (Pozisyonun hep içindedir, hata yapma payı sıfıra yakındır)" }
          ];
          window.currentReferee = window.refereesDatabase[Math.floor(Math.random() * window.refereesDatabase.length)];
          
          setTimeout(() => {
              if(typeof speak === 'function') speak(`Maçın hakemi belli oldu: ${window.currentReferee.name}. Kendisi ${window.currentReferee.desc} tarzıyla bilinir.`);
          }, 4000); // Maç anonsu arkasından girsin diye
          
          window.refereeExperience = window.currentReferee.profile === 'caylak' ? 'rookie' : 'veteran';

          
          // AÅžAMA 68: İşitsel Koreografi (Cehenneme Hoş Geldin) - SADECE DERBİ VE KRİTİK MAÇLARDA
          setTimeout(() => {
              let isCriticalMatch = window.isDerbyMatch || window.isChampionsLeague;
                
                if (window.isSilentProtest) {
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
                    if(typeof speak === 'function') speak("Santra yapıldı ama stadyumda inanılmaz, ürkütücü bir sessizlik var. Tribünler, alınan kötü sonuçları protesto etmek için ilk 15 dakika tek kelime bile etmeme kararı almış. Sahada sadece topun ve futbolcuların sesleri yankılanıyor.");
                    isCriticalMatch = false; // Sessizlik varsa koreografi iptal
                    
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            p.speed = (p.speed || 3) * 0.8; // Eli ayağına dolaşır
                            p.mistakes = (p.mistakes || 0) + 1; // Pas hataları artar
                        });
                    }
                }
              if (isCriticalMatch) {
                  if (window.AudioManager && window.AudioManager.triggerWelcomeToHell) {
                      window.AudioManager.triggerWelcomeToHell(window.myTeamId || 'home');
                  }
                  // Ev Sahibi Takıma "Arkanızda Ordu Var" Özgüveni (İlk 15 dk için ekstra güç)
                  if (typeof strikerConfidence !== 'undefined') strikerConfidence = 150; 
                  if (typeof homePlayers !== 'undefined') {
                      homePlayers.forEach(p => { p.power = (p.power || 50) + 5; p.stamina = 120; });

    // [YENİ] FORM MOTORU İÇİN TEMEL DEĞERLERİN KAYDEDİLMESİ
    homePlayers.forEach(p => { 
        if(!p.baseSpeed) p.baseSpeed = p.speed || 3.0; 
        if(!p.basePower) p.basePower = p.power || 50; 
        p.mistakes = 0; 
    });
    awayPlayers.forEach(p => { 
        if(!p.baseSpeed) p.baseSpeed = p.speed || 3.0; 
        if(!p.basePower) p.basePower = p.power || 50; 
        p.mistakes = 0; 
    });


    // [YENİ] DENEYİM (EXPERIENCE) ETKİSİ
    // Büyük maçlarda çaylaklar baskıdan etkilenir, kurtlar bonus alır.
    


    // Her iki takım oyuncularının deneyimlerini uygula
    let matchTension = Math.random(); // 0 ile 1 arası tansiyon
    if (homeTeamData.id === 'galatasaray' || homeTeamData.id === 'fenerbahce' || homeTeamData.id === 'besiktas') matchTension += 0.3; // Derbi gerginliği
    
    homePlayers.forEach(p => {
        let xp = window.calculatePlayerExperience(p);
        if (matchTension > 0.6) { // Yüksek tansiyonlu maç
            if (xp < 30) p.power = Math.max(10, p.power - 5); // Çaylaklar ezilir
            else if (xp >= 80) p.power += 5; // Kurtlar coşar
        }
    });
    
    awayPlayers.forEach(p => {
        let xp = window.calculatePlayerExperience(p);
        if (matchTension > 0.6) { 
            if (xp < 30) p.power = Math.max(10, p.power - 5); 
            else if (xp >= 80) p.power += 5; 
        }
    });

                  }
                  // Deplasman Takımı Tehdit Altında ve Küçülmüş Hisseder
                  if (typeof awayPlayers !== 'undefined') {
                      awayPlayers.forEach(p => { 
                          p.speed = (p.speed || 3) * 0.85; // Bacakları titriyor
                          p.mistakes = 1; // Pas hatasına çok müsait başlarlar
                      });
                  }
              }
          }, 200); 

    // AŞAMA 31: Bağımsız Veritabanından Takım Çekme (Data.js)
    let homeRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.myTeamId || "galatasaray")) : [];
    let finalOpp = (window.isFriendlyMatch && window.friendlyOpponentId) ? window.friendlyOpponentId : (window.todayOpponent || "fenerbahce"); let awayRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === finalOpp) : [];
    
    // --- YENİ KADRO ENTEGRASYONU ---
    let starting11 = [];
    window.homeBenchPlayers = [];
    if (window.myTeam && window.myTeam.formation) {
        let availableRoster = [...homeRoster];
        window.myTeam.formation.forEach((pId) => {
            let p = availableRoster.find(r => r.id === pId);
            if(p) {
                starting11.push(p);
                availableRoster = availableRoster.filter(r => r.id !== pId);
            } else {
                starting11.push(null);
            }
        });
        for(let i=0; i<11; i++) {
            if(!starting11[i] && availableRoster.length > 0) {
                starting11[i] = availableRoster.shift();
            }
        }
        window.myTeam.subs.forEach((pId) => {
            let p = availableRoster.find(r => r.id === pId);
            if(p) {
                window.homeBenchPlayers.push(JSON.parse(JSON.stringify(p)));
            }
        });
    } else {
        starting11 = homeRoster.slice(0, 11);
        window.homeBenchPlayers = homeRoster.slice(11).map(p => JSON.parse(JSON.stringify(p)));
    }
    
    // --- YENİ: DERBİ KONTROLÜ ---
    if (typeof drawInterval !== 'undefined') clearInterval(drawInterval);
    const scoreA = document.getElementById('score-home');
    const scoreB = document.getElementById('score-away');
    if (scoreA) scoreA.textContent = "0";
    if (scoreB) scoreB.textContent = "0";
    
    homePlayers = [];
    awayPlayers = [];
    
    let myTeamIdStr = window.myTeamId || "galatasaray";
    let oppTeamIdStr = (window.isFriendlyMatch && window.friendlyOpponentId) ? window.friendlyOpponentId : (window.todayOpponent || "fenerbahce");
    let myTeamData = window.leagueData.teams.find(t => t.id === myTeamIdStr) || {};
    let oppTeamData = window.leagueData.teams.find(t => t.id === oppTeamIdStr) || {};
    
    const big4 = ["galatasaray", "fenerbahce", "besiktas", "trabzonspor"];
    let isBig4Derby = big4.includes(myTeamIdStr) && big4.includes(oppTeamIdStr);
    let isCityDerby = (myTeamData.city && oppTeamData.city && myTeamData.city === oppTeamData.city);
    window.isDerbyMatch = isBig4Derby || isCityDerby;
    
    if (window.isDerbyMatch) {
        let derbyOverlay = document.createElement('div');
        derbyOverlay.id = 'derby-overlay';
        derbyOverlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#e74c3c; animation: flash 0.5s infinite alternate;";
        
        // CSS animasyon ekle (Eğer yoksa)
        if(!document.getElementById('derby-style')) {
            let style = document.createElement('style');
            style.id = 'derby-style';
            style.innerHTML = "@keyframes flash { from { text-shadow: 0 0 10px #e74c3c; } to { text-shadow: 0 0 30px #f1c40f, 0 0 40px #e74c3c; } }";
            document.head.appendChild(style);
        }
        
        let title = isBig4Derby ? "TÜRKİYE DERBİSİ!" : "ŞEHİR DERBİSİ!";
        derbyOverlay.innerHTML = '<h1 style="font-size:4rem; margin:0; text-transform:uppercase;">' + title + '</h1>' +
                                 '<h2 style="font-size:2rem; color:white;">' + myTeamData.name + ' vs ' + oppTeamData.name + '</h2>' +
                                 '<p style="color:#f1c40f; font-size:1.5rem; margin-top:20px;">Derbi ateşi oyuncularını sardı! Adrenalin tavan yaptı!</p>';
        document.getElementById('game-container').appendChild(derbyOverlay);
        
        setTimeout(() => {
            if(document.getElementById('derby-overlay')) document.getElementById('derby-overlay').remove();
        }, 3000);
    }
    // --- DERBİ KONTROLÜ SONU ---
    
    for(let i=0; i<11; i++) {
        let isMissingHome = (!starting11[i] || starting11[i] === null);
        let hpOriginal = isMissingHome ? { name: "EKSİK OYUNCU", speed: 0, tacticalRole: 'classic', mentalTrait: 'elite', power: 0, position: 'Eksik' } : starting11[i];
        // Deep copy so we don't permanently modify database
        let hp = JSON.parse(JSON.stringify(hpOriginal));
        
        // --- YENİ: DERBİ ADRENALİNİ ---
        if (window.isDerbyMatch) {
            hp.power += 5; // Derbi gerginliği gücü artırır
            if (hp.mentalTrait === 'aggressive') hp.speed *= 1.1; // Agresifler derbide uçar
            if (hp.mentalTrait === 'fragile' && Math.random() < 0.3) hp.power -= 8; // Kırılganlar bazen derbiyi kaldıramaz
        }
        // --- DERBİ ADRENALİNİ SONU ---
        
        // AÅžAMA 36 & 37: İSTİKRAR & TIER 2
        let isWorldClass = hp.power >= 90 && hp.mentalTrait === 'elite';
        let isTier2 = hp.power >= 80 && hp.power < 90;
        let isTier3 = hp.power < 80 && hp.power >= 55;
        let isTier4 = hp.power < 55;
        if (isTier3) hp.mentalTrait = (Math.random() < 0.9) ? 'fragile' : 'aggressive';
        if (isTier4) hp.mentalTrait = 'fragile'; // Çaylaklar hep korkaktır
        let badDay = 1.0;
        if (!isWorldClass) {
            if (isTier2) {
                let r = Math.random();
                if (r < 0.2) badDay = 0.6; // Hayalet modu
                else if (r > 0.8) badDay = 1.3; // Fırtına modu
            } else {
                badDay = Math.random() < 0.2 ? 0.8 : 1.0;
            }
        }
        
        let moraleMultiplierH = 1.0;
        if (hp.morale !== undefined) {
            if (hp.morale >= 85) moraleMultiplierH = 1.1;
            else if (hp.morale >= 60) moraleMultiplierH = 1.0; 
            else if (hp.morale >= 40) moraleMultiplierH = 0.95; 
            else if (hp.morale >= 20) moraleMultiplierH = 0.9;
            else moraleMultiplierH = 0.8; 
        }
        let authorityMultiplier = 1.0;
        if (window.isHomeMatch !== false && window.managerAuthority !== undefined) {
            if (window.managerAuthority >= 85) authorityMultiplier = 1.05; // Disiplinli, ekstra %5 taktik güç
            else if (window.managerAuthority <= 30) authorityMultiplier = 0.85; // Disiplinsiz, başıboş %15 güç kaybı
            else if (window.managerAuthority <= 15) authorityMultiplier = 0.70; // Tam isyan hali %30 güç kaybı
        }
        let finalPowerH = hp.power * authorityMultiplier;
        
        // [DALYA SİSTEMİ] Odaklanma Seviyesi x2
        if (hp.hasDalyaBadge) {
            finalPowerH *= 2; 
        }

        // [JÜBİLE SİSTEMİ] Veda Maçı Nostaljisi
        let isJubilee = false;
        if (hp.isRetiring && window.fixture && window.currentWeek === window.fixture.length) {
            finalPowerH += 15; // Nostalji Gücü
            isJubilee = true;
            if(i === 0) {
                setTimeout(() => {
                    if(typeof speak === 'function') speak(hp.name + " için veda vakti. Kariyerinin son maçı başlıyor. Tribünlerde gözyaşı var.");
                }, 4000); // Maç başlarken konuşsun
            }
        }

        let finalSpeed = hp.speed * badDay * ((hp.condition !== undefined ? hp.condition : 100) / 100) * moraleMultiplierH;
        homePlayers.push({ 
            x: homeFormations[i].x, y: homeFormations[i].y, 
            speed: finalSpeed, baseSpeed: finalSpeed, condition: hp.condition !== undefined ? hp.condition : 100, morale: hp.morale !== undefined ? hp.morale : 75, name: hp.name, position: hp.position, id: hp.id,
            tacticalRole: hp.tacticalRole, mentalTrait: hp.mentalTrait, power: finalPowerH, isWorldClass: isWorldClass, isTier2: isTier2, isTier3: isTier3, passPending: false, shotPending: false,
            isUserControlled: false, isStunned: false, stamina: 100, isRedCarded: isMissingHome, hasYellowCard: false, bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }, emotions: { happiness: isJubilee ? 10 : 50, sadness: isJubilee ? 100 : 0, fear: 0, anger: 0, surprise: 0, disgust: 0 },
            isJubileeMatch: isJubilee
        });
        
        let isMissingAway = (awayRoster.length <= i);
        let ap = isMissingAway ? { name: "EKSİK RAKİP", speed: 0, tacticalRole: 'classic', mentalTrait: 'fragile', power: 0, position: 'Eksik', morale: 50 } : awayRoster[i];
        
        let isWorldClassA = ap.power >= 90 && ap.mentalTrait === 'elite';
        let isTier2A = ap.power >= 80 && ap.power < 90;
        let isTier3A = ap.power < 80 && ap.power >= 55;
        let isTier4A = ap.power < 55;
        if (isTier3A) ap.mentalTrait = (Math.random() < 0.9) ? 'fragile' : 'aggressive';
        if (isTier4A) ap.mentalTrait = 'fragile';
        let badDayA = 1.0;
        if (!isWorldClassA) {
            if (isTier2A) {
                let r = Math.random();
                if (r < 0.2) badDayA = 0.6;
                else if (r > 0.8) badDayA = 1.3;
            } else {
                badDayA = Math.random() < 0.2 ? 0.8 : 1.0;
            }
        }
        
        let moraleMultiplierA = 1.0;
        if (ap.morale !== undefined) {
            if (ap.morale >= 85) moraleMultiplierA = 1.1;
            else if (ap.morale >= 60) moraleMultiplierA = 1.0; 
            else if (ap.morale >= 40) moraleMultiplierA = 0.95; 
            else if (ap.morale >= 20) moraleMultiplierA = 0.9;
            else moraleMultiplierA = 0.8; 
        }
        let finalSpeedA = ap.speed * badDayA * ((ap.condition !== undefined ? ap.condition : 100) / 100) * moraleMultiplierA;

        awayPlayers.push({ 
            x: 800 - homeFormations[i].x, y: homeFormations[i].y, 
            speed: finalSpeedA, baseSpeed: finalSpeedA, condition: ap.condition !== undefined ? ap.condition : 100, name: ap.name, position: ap.position, id: ap.id,
            tacticalRole: ap.tacticalRole, mentalTrait: ap.mentalTrait, power: ap.power, isWorldClass: isWorldClassA, isTier2: isTier2A, isTier3: isTier3A, passPending: false, shotPending: false,
            isStunned: false, stamina: 100, isRedCarded: isMissingAway, hasYellowCard: false, bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }, emotions: { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 } 
        });
    }
    ball = { x: 400, y: 250, vx: 0, vy: 0, team: 'none', passCooldown: 0, isAirborne: false, airborneUntil: 0 };
    activePlayer = homePlayers[10];
    activePlayer.isUserControlled = true;
    
    // YENİ: MENAJER PROFİLİ (Başlangıç Etkileri)
    let mProfile = window.managerProfile || 'motivasyon_ustasi';
    if (mProfile === 'pragmatist') {
        homePlayers.forEach(p => { 
            if (p.position && (p.position.includes('CB') || p.position.includes('LB') || p.position.includes('RB') || p.position.includes('Defans') || p.x < 300)) {
                p.power += 10; 
            }
        });
    } else if (mProfile === 'proje_hocasi') {
        homePlayers.forEach(p => { 
            if (p.isTier2 || p.isTier3) {
                p.speed *= 1.2;
                p.power += 10;
            }
        });
    } else if (mProfile === 'eski_efsane') {
        window.isSilentProtest = false; // Efsane hocaya protesto olmaz
    }
    
    window.abandonmentAnnounced = false;
      window.playerScore = 0; window.enemyScore = 0; timeLeft = 90;
      window.lastMatchGoalEvents = []; // [YENİ] Gol olaylarını sıfırla
    window.halftimeEventDone = false; // [YENİ] Devre arası etkinliği sıfırla
    lastObjectionMinute = 100;
    objectionCount = 0;
    
      window.isPreMatch = true;
      gameActive = true;
      isPaused = false;
      
      let ceremonyX = 400;
      homePlayers.forEach((p, idx) => {
          p.targetX = p.x; p.targetY = p.y; 
          p.x = ceremonyX - 20; p.y = 100 + (idx * 25);
          p.speed = (p.baseSpeed || 3) * 0.8;
      });
      awayPlayers.forEach((p, idx) => {
          p.targetX = p.x; p.targetY = p.y; 
          p.x = ceremonyX + 20; p.y = 100 + (idx * 25);
          p.speed = (p.baseSpeed || 3) * 0.8;
      });
      
      window.runPreMatchCeremony = function() {
          let gk = homePlayers.find(p => p.position === 'Kaleci') || homePlayers[0];
          let def1 = homePlayers[1];
          let def2 = homePlayers[2];
          let striker = homePlayers[10];
          
          let isTurkishLeague = ["superlig", "tff1", "tff2"].includes(window.selectedLeague || "superlig");
          
          let msgs = [
                { t: 0, text: "Ekranları başındaki futbolseverler, herkese iyi akşamlar! Futbolun sadece futbol olmadığı o büyük gecelerden birindeyiz...", ui: "MAÇ ÖNCESİ SEREMONİSİ" },
                { t: 4000, text: "Kalede güven veren elleriyle " + gk.name + " var. Defans hattında " + def1.name + " ve " + def2.name + " görev yapacak.", ui: "İLK 11'LER OKUNUYOR" },
                { t: 8000, text: "İleri uçta ise takımın en büyük gol umudu, " + striker.name + " ağları havalandırmak için sahada!", ui: "İLK 11'LER OKUNUYOR" },
                { t: 12000, text: "Hocanın bugün dengeli bir taktikle sahaya çıktığını görüyoruz. Rakip takım ise kudurmuş bir yapıyla oynayacak.", ui: "TAKTİK ANALİZ" }
          ];
            
          let tOffset = 16000;
          // İstiklal Marşı geçici olarak devredışı (hızlı maç başlangıcı için)
          if (false && isTurkishLeague) {
                msgs.push({ t: tOffset, text: "Ve şimdi... Stadyumdaki on binlerce taraftarla birlikte İstiklal Marşımız!", ui: "İSTİKLAL MARŞI" });
                msgs.push({ t: tOffset + 75000, text: "İstiklal Marşımız büyük bir coşkuyla okundu.", ui: "MARŞ SONA ERDİ" });
                tOffset += 80000;
          } else {
                msgs.push({ t: tOffset, text: "Stadyumda müthiş bir atmosfer var, takımlar sahaya çıkıyor...", ui: "TAKIMLAR SAHADA" });
                tOffset += 3000;
          }
          
          msgs.push({ t: tOffset, text: "Hakem ve takım kaptanları para atışı için orta yuvarlakta.", ui: "KURA ÇEKİMİ (PARA ATIŞI)" });
          msgs.push({ t: tOffset + 3000, text: "Para atışı yapıldı! Maça ilk başlayacak takım kura sonucu belirleniyor...", ui: "KURA SONUCU BEKLENİYOR", action: "coinTossWinner" });
          msgs.push({ t: tOffset + 6000, text: "Oyuncular sahadaki yerlerini alıyor...", ui: "3...", action: "positions" });
          msgs.push({ t: tOffset + 7000, text: "", ui: "2..." });
          msgs.push({ t: tOffset + 8000, text: "", ui: "1..." });
          msgs.push({ t: tOffset + 9000, text: "Ve hakemin ilk düdüğüyle o büyük maç başlıyor!", ui: "BAŞLA!", action: "start" });
            
            msgs.forEach(msg => {
                setTimeout(() => {
                    if(typeof speak === 'function') speak(msg.text);
                    if(typeof announcerText !== 'undefined' && msg.ui) announcerText.textContent = msg.ui;
                    
                    if (msg.action === "coinTossWinner") {
                        window.coinTossWinner = Math.random() < 0.5 ? 'home' : 'away';
                        ball.team = 'none'; // BURASI ÇOK ÖNEMLİ: 'none' olmazsa iki takım da topa gitmiyor ve maç kilitleniyor!
                        let winnerName = window.coinTossWinner === 'home' ? "Bizim Takım" : "Rakip Takım";
                        if(typeof speak === 'function') speak("Kurayı kazanan " + winnerName + " oldu. Top onlarda başlayacak.");
                        if(typeof announcerText !== 'undefined') announcerText.textContent = "SANTRA HAKKI: " + winnerName.toUpperCase();
                    }
                    
                    if (msg.action === "positions") {
                        homePlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                        awayPlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                    }
                    if (msg.action === 'start') {
                        window.isPreMatch = false; 
                    }
                }, msg.t);
            });
      };
      runPreMatchCeremony();
    
    strikerRunActive = false;
    teamPsychology = 'normal';
    awayTeamPsychology = 'normal';
    prevPsychology = 'normal';
    historicWorstDeficit = 0;
    
    // AÅžAMA 27: Psikoloji Sıfırlama
    strikerConfidence = 100;
    strikerMissedShots = 0;
    lastShooter = null;
    
    
    window.timeAccumulator = 0;
    window.eventAccumulator = 0;
    
    window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
    updateScoreBoard();
    
    if(typeof speak === 'function') {
        speak("Maç başladı! Başarılar patron.");
    }
}

// AÅžAMA 32: Rakip Bot Menajer Yapay Zekası
let isBotManagerAnnounced = false;
function processOpponentManager() {
    if (timeLeft > 70) return; // İlk 20 dakika taktik değişmez
    
    // Eğer deplasman takımı gerideyse (Rakip takım bizden az gol attıysa)
    if (window.enemyScore < window.playerScore) {
        if (timeLeft < 25 && window.awayTeamPsychology !== 'berserk') {
            window.awayTeamPsychology = 'berserk';
            if(!isBotManagerAnnounced && typeof speak === 'function') {
                speak("Rakip takımın teknik direktörü çıldırdı! Tüm takımı hücuma yolluyor, defans diye bir şey kalmadı. Taktik berserk!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "Rakip Teknik Direktör Taktiği 'Berserk' (Gözü Dönmüş) Olarak Değiştirdi!";
                isBotManagerAnnounced = true;
            }
        } else if (timeLeft >= 25 && window.awayTeamPsychology !== 'chaos') {
            window.awayTeamPsychology = 'chaos';
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    } 
    // Eğer deplasman takımı öndeyse
    else if (window.enemyScore > window.playerScore) {
        if (timeLeft < 30 && window.awayTeamPsychology !== 'park_the_bus') {
            window.awayTeamPsychology = 'park_the_bus';
            if(!isBotManagerAnnounced && typeof speak === 'function') {
                speak("Rakip takım tamamen geri çekiliyor. Teknik direktör otobüsü kalenin önüne çekti. İnanılmaz bir savunma göreceğiz.");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "Rakip Teknik Direktör Taktiği 'Otobüs Çek' Olarak Değiştirdi!";
                isBotManagerAnnounced = true;
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    // Beraberlik durumu
    else {
        if (window.awayTeamPsychology === 'park_the_bus' || window.awayTeamPsychology === 'berserk') {
            window.awayTeamPsychology = 'normal'; // Skoru eşitlediyse taktiği normale çevir
            isBotManagerAnnounced = false; // Anons sıfırlanır
        }
    }
}

function handleStrikerMiss(reason = 'save') {
    if (lastShooter !== homePlayers[10]) return false;
    lastShooter = null;
    strikerMissedShots++;
    
    // AŞAMA 56: Anti-Mekanikler (Efsanevi Gol Kaçırma Anonsları)
    if (ball.isBicycleKick) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Röveşata denedi ama top auta gitti! Belki biraz daha çalışması lazım.") : "Röveşata denedi ama kaleci inanılmaz çıkardı! O gol olsaydı haftalarca konuşulurdu!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "İNANILMAZ RÖVEŞATA KAÇTI!";
        ball.isBicycleKick = false;
    } else if (ball.isChipShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Aşırtma denedi ama top farklı şekilde dışarı çıkıyor.") : "Aşırtma denedi ama kaleci uyumuyor! Topu havada çok rahat kontrol etti.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "AŞIRTMA BAŞARISIZ!";
        ball.isChipShot = false;
    } else if (ball.isBackheelShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Topukla klas bir gol atmak istedi ama top dışarıda!") : "Topukla klas bir gol atmak istedi ama savunma yemedi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "TOPUK ŞOVU İŞE YARAMADI!";
        ball.isBackheelShot = false;
    } else if (ball.isPanenka) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Panenka denedi ama topu dışarı attı! Şaka gibi bir an!") : "Panenka denedi! Ne yaptın sen?! Kaleci yerinden bile kıpırdamadı ve topu rahatça kucağına aldı! Büyük rezalet!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "PANENKA REZALETİ!";
        ball.isPanenka = false;
    } else if (ball.isOlympicGoalShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Kornerden şansını denedi ama top kaleye yönelmeden auta çıktı.") : "Kornerden kaleyi düşündü ama kaleci çok dikkatli.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OLİMPİK DENEME BAŞARISIZ!";
        ball.isOlympicGoalShot = false;
    } else if (window.isSetPieceRoutine && Date.now() < window.setPieceTimer) {
        if(typeof speak === 'function') speak("Organizasyon denediler ama savunma yemedi, tehlike uzaklaştırıldı.");
        window.isSetPieceRoutine = false;
    } else if (ball.isLongHeader) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Uzaktan kafa vuruşu ama isabet yok.") : "O kadar uzaktan kafa vuruşu kaleciyi rahatsız etmedi.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KAFA VURUŞU KAÇTI!";
        ball.isLongHeader = false;
    } else if (ball.isDeflectedShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Savunmaya çarpan top kornere çıkıyor!") : "Savunmaya çarptı ama kaleci son anda harika bir refleksle uzandı!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KONTRA PİYE BAŞARISIZ!";
        ball.isDeflectedShot = false;
    } else if (ball.isZeroAngleShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "O açıdan gol atması mucize olurdu zaten. Top auta çıktı.") : "İmkansız açıdan mucize aradı ama kaleci kapattı köşeyi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "SIFIRDAN DENEME BAŞARISIZ!";
        ball.isZeroAngleShot = false;
    } else if (ball.shotOriginX && ball.shotOriginX < 600) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Uzaktan şansını denedi ama isabet yok.") : "Uzaktan şansını denedi ama kalecinin kucağına gitti.");
        ball.shotOriginX = null;
    } else {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "Top auta çıktı.") : "Önemli bir fırsat tepti.");
    }
    
    let p = homePlayers[10];
    if (p.mentalTrait !== 'elite') {
        
    // AŞAMA 64: Bireysel Rehabilitasyon
    if (Math.random() < 0.40) {
        if(window.AudioManager && window.AudioManager.cheer) window.AudioManager.cheer.play().catch(e=>{});
        strikerConfidence = 100;
        if(typeof speak === 'function') speak("Stadyum homurdanmak yerine oyuncuyu ayakta alkışlıyor! Hata yapma korkusu tamamen silindi, forvet yeniden doğdu!");
    } else {
        strikerConfidence -= 25;
        if (strikerConfidence < 0) strikerConfidence = 0;
        
        if (p.mentalTrait === 'fragile') {
            p.isStunned = true;
            setTimeout(() => { if(p) p.isStunned = false; }, 2000);
            if(typeof speak === 'function') speak("Eyvah! Forvetimiz akılalmaz bir gol kaçırdı, saç baş yoluyor! Psikolojik olarak çökmek üzere.");
            announcerText.textContent = p.name + " isyanlarda! Özgüveni kırıldı.";
        } else if (p.mentalTrait === 'aggressive') {
            if(typeof speak === 'function') speak("Kaçan gole çok sinirlendi! Forvet takım arkadaşlarına ve hakeme bağırıp çağırıyor. Bencilleşmeye başladı!");
            announcerText.textContent = p.name + " kontrolden çıkıyor!";
        }
    }
    } else {
        if(typeof speak === 'function') speak("Kaçırdı ama umurunda değil. Gerçek bir elit forvet, Japon Balığı hafızasıyla hemen sıfırlandı!");
    }
}


function triggerRandomMatchEvent() {
    let rText = "";

    // --- YORGUNLUK VE NEFES KESİLMESİ SİSTEMİ ---
    let allPlayersOnPitch = [...homePlayers, ...awayPlayers];
    let exhaustedPlayer = allPlayersOnPitch.find(p => p.stamina !== undefined && p.stamina < 30 && !p.hasExhaustedEventTriggered && !p.isGoalie);
    
    // Eğer sahada 32 yaş üstü veya kanat/bek oynayan ve pili bitmiş biri varsa (veya rastgele şans):
    if (exhaustedPlayer && (exhaustedPlayer.age > 32 || exhaustedPlayer.position.includes("Açık") || exhaustedPlayer.position.includes("Kanat") || exhaustedPlayer.position.includes("Bek") || Math.random() < 0.3)) {
        exhaustedPlayer.hasExhaustedEventTriggered = true;
        exhaustedPlayer.speed *= 0.5; // Hızı yarıya düşer
        exhaustedPlayer.power = Math.floor(exhaustedPlayer.power * 0.7); // Gücü %30 düşer
        
        let m = Math.floor(90 - timeLeft);
        if (m < 0) m = 1;
        rText = `Eyvah! ${exhaustedPlayer.name} depar atarken bir anda duraksadı. Ellerini dizlerine koydu, nefes nefese kaldı! Çok fazla koştuğu için pili tamamen bitti.`;
        if(typeof speak === 'function') speak(`Dakika ${m}: ` + rText);
        
        const eventsUl = document.getElementById('match-events-list');
        if (eventsUl) {
            let li = document.createElement('li');
            li.style.color = '#e74c3c';
            li.style.fontWeight = 'bold';
            li.innerHTML = `⚠️ <small>[${m}']</small> ${rText}`;
            eventsUl.prepend(li);
        }
        return; // Normal olaya geçme, bunu göster ve bitir
    }

    let eventType = Math.floor(Math.random() * 5);

    switch(eventType) {
        case 0:
            if(window.dialogueData && window.dialogueData.sprintEvents) rText = window.dialogueData.sprintEvents[Math.floor(Math.random()*window.dialogueData.sprintEvents.length)];
            if(activePlayer) { activePlayer.speed *= 2; setTimeout(() => { if(activePlayer) activePlayer.speed /= 2; }, 5000); }
            break;
        case 1:
            if(window.dialogueData && window.dialogueData.tackleEvents) rText = window.dialogueData.tackleEvents[Math.floor(Math.random()*window.dialogueData.tackleEvents.length)];
            if(activePlayer) { 
                activePlayer.isStunned = true; 
                setTimeout(() => { if(activePlayer) activePlayer.isStunned = false;
                    activePlayer.isInjured = false; }, 3000); 
                
                let breakDownChance = 0.1;
                if(activePlayer.hasExhaustedEventTriggered) breakDownChance = 0.4; // %40 sakatlık/kart riski!

                if(Math.random() < breakDownChance && homePlayers.length > 7) {
                    activePlayer.hasBrokenDown = true;
                    activePlayer.isRedCarded = true; // Oyundan tamamen çıkması için
                    activePlayer.x = -1000;
                    activePlayer.y = -1000;
                    if(activePlayer.hasExhaustedEventTriggered) {
                         rText += " ÇOK KÖTÜ BİR HABER! Yorgunluktan kasları kilitlenmişti, zorlamaya devam edince adalesi koptu! Sedyeyle çıkıyor!";
                    } else {
                         rText += " İnanılmaz, ağır bir darbe aldı ve sedyeyle çıkıyor!";
                    }
                }
            }
            break;
        case 2:
            if(window.dialogueData && window.dialogueData.saveEvents) rText = window.dialogueData.saveEvents[Math.floor(Math.random()*window.dialogueData.saveEvents.length)];
            ball.x = 100; ball.y = 250; ball.vx = 15; ball.vy = 0; ball.team = 'none';
            break;
        case 3:
            if(window.dialogueData && window.dialogueData.crowdEvents) rText = window.dialogueData.crowdEvents[Math.floor(Math.random()*window.dialogueData.crowdEvents.length)];
            if(window.audioEngine) window.audioEngine.updateCrowdExcitement(1.0);
            setTimeout(() => { if(window.audioEngine) window.audioEngine.updateCrowdExcitement(0.3); }, 5000);
            break;
        case 4:
            if(window.dialogueData && window.dialogueData.crossEvents) rText = window.dialogueData.crossEvents[Math.floor(Math.random()*window.dialogueData.crossEvents.length)];
            ball.x = 400; ball.y = 50;
            let angle = Math.atan2(250 - 50, 650 - 400);
            ball.vx = Math.cos(angle) * 12; ball.vy = Math.sin(angle) * 12;
            ball.isAirborne = true; ball.airborneUntil = Date.now() + 2500;
            ball.team = 'none';
            if(window.audioEngine) window.audioEngine.playGoalSound();
            let cT = null; let minD = Infinity;
            homePlayers.forEach(p => {
                let d = Math.sqrt(Math.pow(p.x-650,2)+Math.pow(p.y-250,2));
                if(d < minD){ minD = d; cT = p; }
            });
            if(cT){
                if(activePlayer) activePlayer.isUserControlled = false;
                cT.isUserControlled = true; activePlayer = cT;
            }
            break;
    }
    if(rText !== "") {
        announcerText.textContent = rText;
        if(typeof speak === 'function') speak(rText);
    }
}

function switchPlayerManual() {
    let closestTeammate = null;
    let minD = Infinity;
    homePlayers.forEach(p => {
        if (p !== activePlayer && !(p.isBooedByOwnFans && window.CrowdForm === 4) && !(p.isMessiah && typeof activePlayer !== 'undefined' && activePlayer.isJealous && Math.random() < 0.6)) { // Sadece Form 4'te ambargo uygulanır
            let dx = p.x - ball.x;
            let dy = p.y - ball.y;
            let d = Math.sqrt(dx*dx + dy*dy);
            if (d < minD) { minD = d; closestTeammate = p; }
        }
    });
    if (closestTeammate) {
        if(activePlayer) activePlayer.isUserControlled = false;
        closestTeammate.isUserControlled = true;
        activePlayer = closestTeammate;
        if(typeof speak === 'function') speak(activePlayer.name + " kontrolünüzde.");
    }
}

function executePass() {
    if (typeof isGameHalted !== 'undefined' && isGameHalted) return;
    if (!activePlayer || ball.team !== 'home') return;
    
    // AŞAMA 58: Frikik Organizasyonu Kontrolü
    if (window.isFreeKickZone && Date.now() < window.freeKickTimer) {
        window.isSetPieceRoutine = true;
        window.setPieceTimer = Date.now() + 5000;
        window.isFreeKickZone = false;
    }
    
    if (activePlayer.isTier3 && !activePlayer.passPending) {
        activePlayer.passPending = true;
        let p = activePlayer;
        setTimeout(() => {
            if(p) p.passPending = false;
            if (activePlayer === p && ball.team === 'home') doPassLogic();
        }, 500);
        return;
    } else if (activePlayer.passPending) {
        return;
    }
    doPassLogic();
}

function doPassLogic() {
    if (typeof isGameHalted !== 'undefined' && isGameHalted) return;
    
    // Asist takibi için pası vereni kaydet
    window.lastPasser = activePlayer;
    
        // AŞAMA 76: Form 2 Taktiksel Homurdanma
        if (window.CrowdForm === 2 && activePlayer.x < 300 && ball.team === 'home' && Math.random() < 0.3) {
            if (window.AudioManager) {
                let boo = new Audio('sounds/boo.ogg'); boo.volume = 0.3; boo.play().catch(e=>{});
            }
        }
        if (activePlayer.x > 650) {
        let targetX = 800;
        let isGoal = Math.random() < 0.5;
        let targetY = isGoal ? 250 : (Math.random() < 0.5 ? 100 : 400);
        let dx = targetX - activePlayer.x;
        let dy = targetY - activePlayer.y;
        let angle = Math.atan2(dy, dx);
        
        ball.vx = Math.cos(angle) * 8;
        ball.vy = Math.sin(angle) * 8;
        ball.passCooldown = Date.now() + 500;
        ball.team = 'none';
        
        if(typeof speak === 'function') {
            if(isGoal) {
                speak("Kaleciyle karşı karşıya, aklını kullandı, köşeye yavaşça plaseyi bıraktı!");
            } else {
                speak("İnanılmaz! Kaleciyle karşı karşıya çok şık düşündü ama top yavaşça direğin dibinden auta süzüldü!");
            }
        }
        return;
    }
    
    let closestTeammate = null;
    if (strikerRunActive && currentStriker) {
        closestTeammate = currentStriker;
    } else {
        let minD = Infinity;
        homePlayers.forEach(p => {
            if (p !== activePlayer && !(p.isBooedByOwnFans && window.CrowdForm === 4) && !(p.isMessiah && typeof activePlayer !== 'undefined' && activePlayer.isJealous && Math.random() < 0.6)) { // Sadece Form 4'te ambargo uygulanır
                let dx = p.x - activePlayer.x;
                let dy = p.y - activePlayer.y;
                let d = Math.sqrt(dx*dx + dy*dy);
                if (d < minD) { minD = d; closestTeammate = p; }
            }
        });
    }

    if (closestTeammate) {
        let targetX = closestTeammate.x;
        let targetY = closestTeammate.y;
        
        let passSpeed = 15;
        if (strikerRunActive && currentStriker === closestTeammate) {
            targetX += 100;
            passSpeed = 20;
            if(typeof speak === 'function') speak("Mükemmel bir ara pası!");
            strikerRunActive = false;
        } else {
            if(typeof speak === 'function') {
                if (teamPsychology === 'showboating') { let msgs = [
    "Oley!",
    "Stadyum tek yürek oldu: Oley!",
    "Pas yapıldıkça tribünlerden Oley sesleri yükseliyor!",
    "Müthiş bir keyif var tribünlerde, her başarılı pasta Oley çekiliyor."
];
speak(msgs[Math.floor(Math.random() * msgs.length)]); }
                else speak("Kısa pasını verdi.");
            }
        }

        let dx = targetX - activePlayer.x;
        let dy = targetY - activePlayer.y;
        let angle = Math.atan2(dy, dx);
        
        if (activePlayer.isTier3) {
            angle += (Math.random() - 0.5) * 0.8; // Ciddi sapma
            passSpeed *= 0.7; // Güçsüz pas
            
            // AŞAMA 41: SPİKER YORUMU
            if (Math.random() < 0.2 && !activePlayer.tier3CommentaryDone) {
                activePlayer.tier3CommentaryDone = true;
                if(typeof speak === 'function') speak("Yine çok bekledi, panikle çıkarttığı o zayıf pas hiçbir işe yaramadı!");
            }
        }
        
        ball.vx = Math.cos(angle) * passSpeed;
        ball.vy = Math.sin(angle) * passSpeed;
        ball.passCooldown = Date.now() + 500;
        ball.team = 'none';
        
        if(window.audioEngine) window.audioEngine.playGoalSound();
        
        activePlayer.isUserControlled = false;
        closestTeammate.isUserControlled = true;
        activePlayer = closestTeammate;
    }
}

function executeShot() {
    if (typeof isGameHalted !== 'undefined' && isGameHalted) return;
    if (!activePlayer || ball.team !== 'home') return;
    
    if (activePlayer.isTier3 && !activePlayer.shotPending) {
        activePlayer.shotPending = true;
        let p = activePlayer;
        setTimeout(() => {
            if(p) p.shotPending = false;
            if (activePlayer === p && ball.team === 'home') doShotLogic();
        }, 600);
        return;
    } else if (activePlayer.shotPending) {
        return;
    }
    doShotLogic();
}

function doShotLogic() {
    if (typeof isGameHalted !== 'undefined' && isGameHalted) return;
    lastShooter = activePlayer;
    ball.shotOriginX = activePlayer.x; // Füze kontrolü için
    
    if (activePlayer.isJubileeMatch) {
        if(typeof announcerText !== 'undefined') announcerText.textContent = activePlayer.name + " veda maçında kaleyi yokluyor! Harika bir an...";
    }
    
    let targetX = 800; 
    let targetY = 250;
    let dx = targetX - activePlayer.x;
    let dy = targetY - activePlayer.y;
    let angle = Math.atan2(dy, dx);
    
    if (activePlayer.isTier3) {
        angle += (Math.random() - 0.5) * 1.0; // Korkunç şut sapması
    }
    
    // AŞAMA 52: Frikik Şutu Kontrolü
    if (window.isFreeKickZone && Date.now() < window.freeKickTimer) {
        ball.isFreeKickShot = true;
        window.isFreeKickZone = false; // Sadece ilk şut frikiktir
    } else {
        ball.isFreeKickShot = false;
    }

    // AŞAMA 53: Ters Vuruş (Kendi Kalesine) Şansı
    if (activePlayer.x < 300 && Math.random() < 0.05) {
        angle = Math.PI + (Math.random() - 0.5) * 0.5; // Kendi kalemize doğru
        let shotSpeed = 15;
        if(typeof speak === 'function') speak("Defansta büyük panik! Topu uzaklaştırmak isterken ters bir vuruş geldi!");
    }

    if (window.isCornerKickZone && Date.now() < window.cornerKickTimer) {
        ball.isOlympicGoalShot = true;
        window.isCornerKickZone = false;
    } else {
        ball.isOlympicGoalShot = false;
    }

    
        // AŞAMA 76: Form 2 Taktiksel Homurdanma
        if (window.CrowdForm === 2 && activePlayer.x < 300 && ball.team === 'home' && Math.random() < 0.3) {
            if (window.AudioManager) {
                let boo = new Audio('sounds/boo.ogg'); boo.volume = 0.3; boo.play().catch(e=>{});
            }
        }
        if (activePlayer.x > 650) {
        let shotSpeed = activePlayer.isTier3 ? 20 : 30;
        
        if (window.isPenaltyKick && Date.now() < window.penaltyTimer) {
            if (activePlayer.power >= 85 && Math.random() < 0.3) {
                ball.isPanenka = true;
                shotSpeed = 8; // Çok yavaş
            }
            window.isPenaltyKick = false;
        } else {
            ball.isPanenka = false;
        }
        
        // AŞAMA 54: İmkansız Açı (Zero-Angle) Kontrolü
        if (activePlayer.x > 750 && (activePlayer.y < 120 || activePlayer.y > 380)) {
            ball.isZeroAngleShot = true;
        } else {
            ball.isZeroAngleShot = false;
        }

        // AŞAMA 55: Topuk Golü (Backheel Strike) Kontrolü
        let defendersNearby = typeof awayPlayers !== 'undefined' ? awayPlayers.filter(p => Math.sqrt(Math.pow(p.x - activePlayer.x, 2) + Math.pow(p.y - activePlayer.y, 2)) < 50).length : 0;
        if (activePlayer.power >= 85 && activePlayer.x > 700 && defendersNearby >= 2 && Math.random() < 0.3) {
            ball.isBackheelShot = true;
            shotSpeed = 15; // Topuk pası çok sert olmaz
        } else {
            ball.isBackheelShot = false;
        }

        // AŞAMA 48: Aşırtma Şut (Chip Shot) İhtimali
        if (activePlayer.power >= 85 && activePlayer.x > 720 && Math.random() < 0.4) {
            ball.isChipShot = true;
            shotSpeed = 12; // Aşırtma zarif ve yavaştır
        } else {
            ball.isChipShot = false;
        }
        
        // AŞAMA 45: Ritmik Alkış Buff'ı
        if (window.isRhythmicClapping) {
            angle *= 0.5; // Şut hedefini düzeltir (isabet)
            shotSpeed *= 1.2; // Hızı %20 artırır
        }
        
        ball.vx = Math.cos(angle) * shotSpeed;
        ball.vy = Math.sin(angle) * shotSpeed;
        if(typeof speak === 'function') {
            let msgs = [
                "Mükemmel bir plase! Adeta örümcek ağlarını aldı!",
                "Kaleciyi çaresiz bırakan efsanevi bir füzeyle ağları deldi!",
                "Akıl dolu bir ayak içi vuruşu, iğne deliğinden geçirdi!"
            ];
            speak(msgs[Math.floor(Math.random() * msgs.length)]);
        }
    } else {
        let shotSpeed = activePlayer.isTier3 ? 15 : 22;
        
        if (window.isRhythmicClapping) {
            angle *= 0.5;
            shotSpeed *= 1.2;
        }
        
        ball.vx = Math.cos(angle) * shotSpeed;
        ball.vy = Math.sin(angle) * shotSpeed;
        if(typeof speak === 'function') {
            if (activePlayer.x < 500) speak("Savunma arkasına uzun bir pas denemesi!");
            else speak("Sert bir şut!");
        }
    }
    
    ball.passCooldown = Date.now() + 500;
    ball.team = 'none';
    if(window.audioEngine) window.audioEngine.playGoalSound();
}

function executeHeader() {
    if (typeof isGameHalted !== 'undefined' && isGameHalted) return;
    if (ball.isAirborne && activePlayer) {
        ball.isAirborne = false;
        lastShooter = activePlayer;
        let targetX = 800; let targetY = 250;
        let dx = targetX - ball.x; let dy = targetY - ball.y;
        let angle = Math.atan2(dy, dx);
        
        // AŞAMA 49: Röveşata
        if (activePlayer.power >= 80 && Math.random() < 0.3) {
            ball.vx = Math.cos(angle) * 35;
            ball.vy = Math.sin(angle) * 35;
            ball.isBicycleKick = true;
            if(typeof speak === 'function') speak("Aman Allah'ım! Tarihe geçecek bir an! Röveşata vuruyor! Yerçekimine meydan okudu, yılın golü olabilir bu!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "İnanılmaz Röveşata!";
        } else {
            ball.vx = Math.cos(angle) * 20;
            ball.vy = Math.sin(angle) * 20;
            ball.isBicycleKick = false;
            ball.isHeaderShot = true; // Kafa golü tespiti için
            if (activePlayer.x < 650) ball.isLongHeader = true;
            else ball.isLongHeader = false;
            if(typeof speak === 'function') speak("Mükemmel bir kafa vuruşu!");
        }
        
        ball.team = 'none';
        if(window.audioEngine) window.audioEngine.playGoalSound();
    }
}

function handleObjection() {
    let currentMinute = 90 - Math.floor(timeLeft);
    
    // 1. Soğuma (Cooldown) Kontrolü
    if (currentMinute - lastObjectionMinute < 3 && lastObjectionMinute !== 100) {
        if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('cooldown') : "Henüz yeni itiraz ettiniz. Hakem şu an sizinle konuşmak istemiyor.");
        return;
    }
    
    if (lastObjectionMinute === -999) {
        if(typeof speak === 'function') speak("Kırmızı kart gördünüz ve tribündesiniz! Artık itiraz edemezsiniz.");
        return;
    }
    
    lastObjectionMinute = currentMinute;
    objectionCount++;

    // 2. VAR İptal İhtimali (Eğer son 3 dakikada rakip gol atmışsa)
    let recentOpponentGoal = window.lastMatchGoalEvents && window.lastMatchGoalEvents.find(g => g.team === 'away' && currentMinute - g.min <= 3);
    
    if (recentOpponentGoal) {
        let varChance = Math.random();
        if (varChance < 0.15) { // %15 VAR iptal şansı
            if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('var_cancel') : "Şiddetli itirazınız sonuç verdi! Hakem VAR'a gitti ve golden önce faul tespit etti. Rakibin golü iptal edildi!");
            window.enemyScore = Math.max(0, window.enemyScore - 1);
            if(typeof updateScoreBoard === 'function') updateScoreBoard();
            
            // Golü array'den sil ki tekrar iptal edilmesin
            window.lastMatchGoalEvents = window.lastMatchGoalEvents.filter(g => g !== recentOpponentGoal);
            
            // Takımı ateşle
            if (window.teamPsychology !== 'motivated') window.teamPsychology = 'motivated';
            return;
        } else {
            if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('var_reject') : "İtirazlarınız sonucu hakem VAR ile telsizden konuştu, ancak karar değişmedi. Gol geçerli.");
            return;
        }
    }

    // 3. Normal İtiraz ve Kademeli Ceza
    if (objectionCount === 1) {
        if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('objection_warning') : "Dördüncü hakem sizi sakin olmanız konusunda uyardı.");
        if (Math.random() < 0.3 && window.teamPsychology !== 'motivated') {
            window.teamPsychology = 'motivated';
            setTimeout(() => { if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('team_motivated') : "Saha kenarındaki hırsınız takımınıza ilham verdi! Motivasyon arttı!"); }, 3000);
        }
    } else if (objectionCount === 2) {
        if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('objection_yellow') : "Hakem saha kenarına geldi ve size sarı kart gösterdi! Sınırda dolaşıyorsunuz.");
        if (Math.random() < 0.5 && window.teamPsychology !== 'motivated') {
            window.teamPsychology = 'motivated';
            setTimeout(() => { if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('team_motivated') : "Sarı kart gördünüz ancak takımınız sizin için savaşmaya başladı! Motivasyon zirvede!"); }, 3000);
        }
    } else {
        if(typeof speak === 'function') speak(window.generateMatchCommentary ? window.generateMatchCommentary('objection_red') : "Kırmızı kart! Hakem acımadı ve sizi tribüne gönderdi. Takım sahada başkansız kaldı.");
        if (window.myTeam) window.myTeam.budget = Math.max(0, window.myTeam.budget - 0.5); // 500 bin euro ceza
        
        window.teamPsychology = 'chaos'; // Kırmızı kart moral bozar
        lastObjectionMinute = -999; // Maç sonuna kadar itiraz yasak
    }
}


window.addEventListener('keydown', (e) => { 
    keys[e.key] = true; 
    
    // --- GÖRME ENGELLİ ERİŞİLEBİLİRLİK KISAYOLLARI ---
    if (gameActive && !isPaused) {
        if (e.key === 'm' || e.key === 'M') {
            let msg = "Durum: Sizin takım " + window.playerScore + ", Rakip takım " + window.enemyScore + ". Dakika " + (90 - Math.floor(timeLeft)) + ".";
            if(typeof speak === 'function') speak(msg);
            if(typeof announcerText !== 'undefined') announcerText.textContent = msg;
            return;
        }
        if ((e.key === 'b' || e.key === 'B') && e.target === document.body) { // Space tuşu tarayıcıyı kaydırmasın ve sadece maç ekranındayken çalışsın
            e.preventDefault();
            let msg = "";
            if (ball.owner) {
                let teamStr = (ball.owner.team === 'home') ? "Bizim takımdan" : "Rakip takımdan";
                msg = "Top " + teamStr + " " + ball.owner.name + " isimli oyuncuda.";
            } else {
                let p = window.playerScore > window.enemyScore ? "Öndeyiz." : (window.playerScore < window.enemyScore ? "Gerideyiz." : "Beraberlik.");
                msg = "Top boşta. " + p;
            }
            if(typeof speak === 'function') speak(msg);
            if(typeof announcerText !== 'undefined') announcerText.textContent = msg;
            return;
        }
        if (e.key === 'c' || e.key === 'C') {
            if (activePlayer) {
                let dist = Math.floor(Math.hypot(800 - activePlayer.x, 250 - activePlayer.y) / 10);
                let z = window.lastAnnouncedZone || "Bilinmeyen Bölge";
                let msg = "Oyuncu: " + activePlayer.name + ". " + z + " Kaleye mesafe: " + dist + " metre.";
                if (typeof speak === 'function') speak(msg, true);
                if (typeof announcerText !== 'undefined') announcerText.textContent = msg;
            }
            return;
        }
    }
    // ------------------------------------------------

    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && gameActive) {
        if (!isPaused && (e.key === 'p' || e.key === 'P')) {
            isPaused = true; selectedPauseIndex = 0;
            let pmsg = "Oyun duraklatıldı. Menüde gezinmek için yukarı aşağı okları kullanın. Seçili: " + pauseMenuOptions[selectedPauseIndex];
            if(typeof speak === 'function') speak(pmsg);
            announcerText.textContent = pmsg;
            if(window.audioEngine && window.audioEngine.masterGain) window.audioEngine.masterGain.gain.value = 0.1;
        } else if (isPaused && e.key === 'Escape') {
            isPaused = false;
            if(typeof speak === 'function') speak("Menü kapatıldı, maç devam ediyor.");
            if(window.audioEngine && window.audioEngine.masterGain) window.audioEngine.masterGain.gain.value = 1.0;
        }
        return;
    }
    
    if (isPaused && gameActive) {
        if (e.key === 'ArrowDown') {
            selectedPauseIndex = (selectedPauseIndex + 1) % pauseMenuOptions.length;
            if(typeof speak === 'function') speak(pauseMenuOptions[selectedPauseIndex]);
        } else if (e.key === 'ArrowUp') {
            selectedPauseIndex = (selectedPauseIndex - 1 + pauseMenuOptions.length) % pauseMenuOptions.length;
            if(typeof speak === 'function') speak(pauseMenuOptions[selectedPauseIndex]);
        } else if (e.key === 'Enter') {
            if (selectedPauseIndex === 0) {
                isPaused = false;
                if(typeof speak === 'function') speak("Kaldığımız yerden devam ediyoruz.");
                if(window.audioEngine && window.audioEngine.masterGain) window.audioEngine.masterGain.gain.value = 1.0;
            } else if (selectedPauseIndex === 1) {
                let tactics = ["4-3-3 Ofansif", "5-3-2 Defansif", "3-5-2 Ortasaha Baskın", "4-4-2 Klasik", "5-5-0 Otobüs", "5-4-1 Katı Defans", "5-2-3 Kontra Atak"];
                let t = tactics[Math.floor(Math.random() * tactics.length)];
                homePlayers.forEach(p => {
                    p.y += (Math.random() - 0.5) * 100;
                    if(p.y < 50) p.y = 50; if(p.y > 450) p.y = 450;
                    
                    // AÅžAMA 36: Taktiksel Adaptasyon
                    if (!p.isWorldClass) {
                        p.isStunned = true; // Sıradan oyuncular sistemi kurana kadar afallar
                        setTimeout(() => { if(p) p.isStunned = false; }, 2000);
                    }
                });
                if(typeof speak === 'function') speak("Taktik " + t + " oldu. Dünya yıldızları anında adapte olurken sıradan oyuncular bocalıyor!");
                announcerText.textContent = "Taktik değişti, yıldızlar hemen adapte oldu!";
            } else if (selectedPauseIndex === 2) {
                if (activePlayer) {
                    activePlayer.speed = 3.5; 
                    activePlayer.stamina = 100; 
                    activePlayer.isStunned = false;
                    if(typeof speak === 'function') speak("Oyuncu değişikliği yapıldı! Oyuna giren taze kanın enerjisi tam, yorgun defansın arasından fişek gibi geçecek!");
                }
            } else if (selectedPauseIndex === 3) {
                isPaused = false;
                if(window.audioEngine && window.audioEngine.masterGain) window.audioEngine.masterGain.gain.value = 1.0;
                window.playerScore = 0; window.enemyScore = 3;
                if(typeof speak === 'function') speak("Takım maçtan çekildi. Hükmen mağlup sayılıyorsunuz.");
                timeLeft = 1;
            } else if (selectedPauseIndex === 4) {
                if (typeof window.triggerHalftimeSpeech === 'function') {
                    window.triggerHalftimeSpeech(true); // isManual = true
                }
            }
        }
        return;
    }

    if(isPaused) return;

    if ((e.key === 'q' || e.key === 'Q') && gameActive && !window.isPreMatch) switchPlayerManual();
    if ((e.key === 's' || e.key === 'S') && gameActive && !window.isPreMatch) executePass();
    if ((e.key === 'w' || e.key === 'W') && gameActive && !window.isPreMatch) executeShot();
    if ((e.key === 'd' || e.key === 'D') && gameActive && !window.isPreMatch) executeHeader();
    if ((e.key === 'h' || e.key === 'H') && gameActive && !window.isPreMatch) handleObjection();
    if ((e.key === 'y' || e.key === 'Y') && gameActive && !window.isPreMatch) {
        if (typeof window.generateAssistantAnalysis === 'function') {
            let currentMinute = 90 - Math.floor(timeLeft);
            let diff = window.playerScore - window.enemyScore;
            let psych = window.teamPsychology || 'neutral';
            let analysis = window.generateAssistantAnalysis(currentMinute, diff, psych);
            if(typeof speak === 'function') speak(analysis);
        } else {
            if(typeof speak === 'function') speak("Yardımcı antrenör şu an notlarını inceliyor.");
        }
    }
});

window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function updatePlayer(p, teamType) {
    if (p.isRedCarded) return;

    // [YENİ] DİNAMİK FORM ÇARPANI VE YIPRANMA (DECAY)
    if (typeof window.calculatePerformance === 'function') {
        let perf = window.calculatePerformance(p);
        p.speed = perf.speed;
        p.power = perf.accuracy;
        
        // Logaritmik Tilt Olma (Mistake) Mekaniği: Pas kaybı vb yerlerde p.mistakes artarsa burada morale düşer
        // Not: p.mistakes artışını paslaşma/şut kaçırma kodlarına bağlamamız lazım.
        // Şimdilik burada sadece moralin 0'ın altına inmesini engelliyoruz.
        
        // [YENİ] EVENT TABANLI TİLT OLMA MEKANİĞİ
        p.lastMistakesProcessed = p.lastMistakesProcessed || 0;
        if (p.mistakes > p.lastMistakesProcessed) {
            let newMistakes = p.mistakes - p.lastMistakesProcessed;
            for(let i=0; i<newMistakes; i++) {
                window.triggerPsychEvent(p, 'error');
            }
            p.lastMistakesProcessed = p.mistakes;
        }

    }


    // KAPTAN MÜDAHALESİ: Sosyo-Duygusal Liderlik (Kriz Yönetimi)
    let teamPlayers = (teamType === 'home') ? homePlayers : awayPlayers;
    let captain = teamPlayers.find(mate => mate.isCaptain && !mate.isRedCarded);
    
    if (p.isStunned) {
        if (captain && captain !== p && Math.random() < 0.1) {
            let distToCapt = Math.hypot(captain.x - p.x, captain.y - p.y);
            if (distToCapt < 150) {
                p.isStunned = false;
                if (p.psy) { p.psy.cognitiveAnxiety = 0; p.psy.isCatastrophe = false; }
                if (p.emotions) { p.emotions.fear = 0; p.emotions.happiness = Math.min(100, (p.emotions.happiness || 50) + 20); }
                if(typeof speak === 'function' && Math.random() < 0.3) speak(`Kaptan ${captain.name} panikleyen takım arkadaşının yanına geldi ve onu hemen sakinleştirdi! Gerçek bir lider!`);
            }
        }
        return;
    }
    
    // KAPTAN MÜDAHALESİ: Davranışsal Liderlik (İlham ve Laktik Asit)
    if (captain && captain !== p && captain.bio && captain.stamina > 60 && Math.random() < 0.02) {
        // Eğer kaptan yüksek güçle koşuyorsa veya efor sarf ediyorsa
        let distToCapt = Math.hypot(captain.x - p.x, captain.y - p.y);
        if (distToCapt < 200) {
            if (p.bio) p.bio.lacticAcid = Math.max(0, p.bio.lacticAcid - 5);
            p.stamina = Math.min(100, (p.stamina || 100) + 2);
            // Kaptanın varlığı etrafındakilere efor veriyor
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    let oldX = p.x; let oldY = p.y;
    let spd = p.speed || 3;
    
    // [ÖDÜL SİSTEMİ]: Alev Aldı Hız Bonusu
    if (p.isOnFire) {
        spd *= 1.3; // %30 efsanevi hız artışı!
    }
    
    // YENİ: PSİKOLOJİK MOTOR (Yerkes-Dodson & Catastrophe & Somatic Anxiety)
    if (p.psy) {
        // Yerkes-Dodson (Optimum Arousal = 50-70)
        if (p.bio && p.bio.arousal >= 50 && p.bio.arousal <= 70) {
            spd *= 1.2; // %20 hız bonusu (The Zone / Flow state)
        }

        // Felaket Modeli (Catastrophe Çöküşü)
        if (p.psy.isCatastrophe) {
            spd *= 0.1; // Donup kalma
            
            // [RPG Mekaniği]: Bacakları Titreme Efekti (Bilinçli Jitter)
            // Taktiksel sapıtma değil, tamamen görsel bir korku efektidir. Sürüklenmeyi (Drift) engellemek için Sinüs kullanılır.
            p.x += Math.sin(Date.now() / 20) * 2;
            p.y += Math.cos(Date.now() / 20) * 2;

            if (activePlayer === p && Math.random() < 0.05) {
                p.isStunned = true;
                setTimeout(() => { if(p) p.isStunned = false; }, 2000); // Olduğu yerde donar
                if(typeof speak === 'function') speak("Aman Tanrım! " + p.name + " baskı altında resmen çöktü. Bacakları titriyor, ne yapacağını bilemiyor!");
                ball.vx = (Math.random() - 0.5) * 20; // Topu paniğe kapılıp taca diker
                ball.vy = (Math.random() - 0.5) * 20;
                p.psy.isCatastrophe = false; // Tek atımlık felaket
            }
        }

        // Somatik Kaygı (İlk 15 dakika top sürme zorluğu)
        if (p.psy.somaticAnxiety > 0 && activePlayer === p) {
            if (Math.random() < (p.psy.somaticAnxiety * 0.001)) { // Topu ayağından açaçak
                ball.x += (Math.random() - 0.5) * 20;
                ball.y += (Math.random() - 0.5) * 20;
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    // AÅžAMA 36: AURA ETKİSİ VE CLUTCH
    let teamArray = teamType === 'home' ? homePlayers : awayPlayers;
    p.hasAura = teamArray.some(mate => mate.isWorldClass && !mate.isRedCarded);
    
    let isClutchMoment = (timeLeft <= 15 && ((teamType === 'home' && window.playerScore < window.enemyScore) || (teamType === 'away' && window.enemyScore < window.playerScore)));
    let isBigMatch = (timeLeft <= 15 && Math.abs(window.playerScore - window.enemyScore) <= 1); // Fark 1 veya Beraberlik
    
    // AÅžAMA 37: Büyük Maç Sendromu
    if (isBigMatch && p.isTier2 && !p.isWorldClass) {
        if (Math.random() < 0.015) { // Panik donması
            p.isStunned = true;
            setTimeout(() => { if(p) p.isStunned = false; }, 1200);
            if(typeof speak === 'function' && Math.random() < 0.05) speak("İnanılmaz! Stresten topu eziyor, büyük maç kaldıramıyor.");
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    // AÅžAMA 39: TIER 4 (Çaylaklar ve Gizlenme)
    if (p.isTier4) {
        // Saklanma Mekaniği: Takım hücuma kalkarken rakip stoperin arkasına gizlen (koyun sürüsü)
        if (ball.team === teamType && !p.isUserControlled) {
            let oppArray = teamType === 'home' ? awayPlayers : homePlayers;
            let nearestEnemy = oppArray[0];
            let minDist = Infinity;
            oppArray.forEach(opp => {
                let dx = p.x - opp.x; let dy = p.y - opp.y;
                let d = Math.sqrt(dx*dx + dy*dy);
                if (d < minDist) { minDist = d; nearestEnemy = opp; }
            });
            // Rakibin tam üstüne çıkmak yerine, onun 30 piksel uzağında kal ve kendi kalene doğru çekil
            let hideOffsetX = teamType === 'home' ? -30 : 30; 
            p.x += ((nearestEnemy.x + hideOffsetX) - p.x) * 0.08; 
            p.y += ((nearestEnemy.y + 30) - p.y) * 0.08;
            
            // AÅžAMA 41: SPİKER YORUMU
            if (Math.random() < 0.0005 && !p.hidingCommentaryDone) {
                p.hidingCommentaryDone = true;
                if(typeof speak === 'function') speak("Genç " + p.name + " toptan kaçıyor, sorumluluk almamak için rakip savunmanın arasına saklanıyor!");
            }
        }

        // AÅžAMA 39 EK: Çaylak Åžansı (Miracle) - Kullanıcının isteği
        if (Math.random() < 0.001 && !p.miracleActive && ball.team === teamType) {
            p.miracleActive = true;
            if(typeof speak === 'function') speak(p.name + " inanılmaz bir depara kalktı! Gençlik ateşi mi, çaylak şansı mı!?");
            setTimeout(() => {
                if(p) { p.miracleActive = false; p.stamina -= 30; }
            }, 6000); // Kullanıcının kararıyla 6 saniye olarak korundu
        }
        
        // Miracle aktifse hızı sabitle (frameler boyunca geçerli olması için if dışına çıkarıldı)
        if (p.miracleActive) {
            spd *= 3.0; // Dünya yıldızı gibi
        } else {
            // Hız zaten çok düşük, titriyor
            spd *= 0.8;
        }
    }

    // AÅžAMA 38: KORKU VE ÇARESİZLİK
    if (p.isTier3) {
        let oppArray = teamType === 'home' ? awayPlayers : homePlayers;
        let nearestEnemy = null;
        let minDist = Infinity;
        oppArray.forEach(opp => {
            let dx = p.x - opp.x; let dy = p.y - opp.y;
            let d = Math.sqrt(dx*dx + dy*dy);
            if (d < minDist) { minDist = d; nearestEnemy = opp; }
        });
        
        if (nearestEnemy && nearestEnemy.isWorldClass && minDist < 80) {
            spd *= 0.6; // Panik korkusu
            if (Math.random() < 0.02 && !p.isUserControlled) {
                p.isStunned = true;
                setTimeout(() => { if(p) p.isStunned = false; }, 800);
            }
        }
        
        let deficit = teamType === 'home' ? window.enemyScore - window.playerScore : window.playerScore - window.enemyScore;
        if (deficit >= 2) {
            spd *= 0.4; // Kabul edilmiş çaresizlik
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    if (isClutchMoment) {
        if (p.isWorldClass) {
            spd *= 1.3; // İnsanüstü hız
        } else if (p.mentalTrait === 'fragile') {
            spd *= 0.7; // Panik
            if (Math.random() < 0.01) {
                p.isStunned = true;
                setTimeout(() => { if(p) p.isStunned = false; }, 1000);
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    if (p.hasAura && !p.isWorldClass) {
        spd += 0.5; // Liderin verdiği güven
    }

    if (p.stamina < 40 && p.stamina > 15) {
        spd *= 0.8;
    } else if (p.stamina <= 15) {
        spd *= 0.5;
        if (Math.random() < 0.001 && !p.isStunned && p !== homePlayers[0] && p !== awayPlayers[0]) {
            p.isStunned = true;
            setTimeout(() => { if(p) p.isStunned = false; }, 1500);
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    let currentPsy = (teamType === 'home') ? teamPsychology : (typeof window.awayTeamPsychology !== 'undefined' ? window.awayTeamPsychology : 'normal');
    
    if (currentPsy === 'showboating') spd *= 0.8;
    else if (currentPsy === 'epic_comeback') spd *= 2.5;
    else if (currentPsy === 'broken') spd *= 0.5;
    else if (currentPsy === 'berserk') spd *= 2.0;
    else if (currentPsy === 'chaos') {
        spd = (Math.random() < 0.5) ? spd * 0.3 : spd * 1.5;
        if (Math.random() < 0.01 && !p.isStunned) {
            p.isStunned = true;
            setTimeout(() => { if(p) p.isStunned = false; }, 1000);
        }
    }
        
        let isTeamFrustrated = (teamPsychology === 'chaos' || teamPsychology === 'berserk');
        let isAngryStriker = (p === homePlayers[10] && strikerConfidence < 60 && p.mentalTrait === 'aggressive');
        
        let isLosing = window.playerScore < window.enemyScore;
        let isTier2Emotional = p.isTier2 && (p.mentalTrait === 'aggressive' || p.mentalTrait === 'fragile') && isLosing;
        let foulChance = isTier2Emotional ? 0.05 : 0.02;
            if (window.managerProfile === 'pragmatist' && teamType === 'home') {
                foulChance *= 1.5; // Karanlık sanatlar: Daha sert, faullü oyun
            }
        
        // YENİ: Hakem Profili Etkisi (Faul İhtimali)
        let ref = window.currentReferee ? window.currentReferee.profile : "kuralci";
        if (ref === "iletisimci" || ref === "ada_tarzi") foulChance *= 0.4;
        if (ref === "kuralci") foulChance *= 1.6;
        if (ref === "sovmen") foulChance *= 1.2;
        if (ref === "eyyamci" || ref === "ic_saha") {
            if (teamType === 'home') foulChance *= 0.5; // Ev sahibini kollar
            else foulChance *= 1.5; // Deplasmanı ezer
        }
        if (ref === "fisleyen" && (p.mentalTrait === "aggressive" || p.mentalTrait === "fragile")) {
            foulChance *= 1.4; // Fişlediği oyunculara göz açtırmaz
        }

          if (window.isOleyActive && teamType === 'away') {
              foulChance = 0.80; // Sinirden deliye dönmüş durumdalar, topla alakaları yok doğrudan adama girerler!
          } // İki kat faul
        
        // AÅžAMA 46: Hakem Korkusu
        if (window.refereeFear > 50 && teamType === 'home') {
            foulChance *= 0.1; // Hakem %90 oranında lehimize faul çalmaya (bize kart vermeye) korkar
        }
        
        if (ball.team === 'away' && (isTeamFrustrated || isAngryStriker || isTier2Emotional)) {
            let dx = ball.x - p.x; let dy = ball.y - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 30 && Math.random() < foulChance) {
                ball.vx = 0; ball.vy = 0; ball.team = 'none';
                
                // KURAL 2: DOGSO (Bariz Gol Åžansını Engelleme)
                let isDOGSO = false;
                if (teamType === 'home' && ball.x < 250) { // Sadece kalemize yakınken
                    let lastMan = true;
                    homePlayers.forEach(hp => {
                        if (hp !== p && hp.position !== 'Kaleci' && hp.position !== 'GK' && hp.x < p.x) lastMan = false;
                    });
                    if (lastMan && Math.random() < 0.6) isDOGSO = true;
                }
                
                let teamPlayers = (teamType === 'home') ? homePlayers : awayPlayers;
                let captain = teamPlayers.find(mate => mate.isCaptain);
                let captainSaved = false;

                // Kaptan Müdahalesi (Hakem İletişimi - Asertif İletişim)
                let attemptCaptainSave = (intendedCard) => {
                    if (captain && captain !== p) {
                        let distToRef = Math.sqrt(Math.pow(captain.x - p.x, 2) + Math.pow(captain.y - p.y, 2));
                        if (distToRef < 200 && Math.random() < 0.3) {
                            // Kaptan yetişti ve hakemi ikna etti
                            if (intendedCard === 'red') {
                                p.hasYellowCard = true;
                                if(typeof speak === 'function') speak(`Kırmızı kart çıkacaktı ama takım kaptanı ${captain.name} koşarak geldi! Hakemle asertif bir iletişim kurarak onu ikna etti, karar sarı karta dönüştü!`);
                                return 'yellow';
                            } else if (intendedCard === 'yellow') {
                                if(typeof speak === 'function') speak(`Hakem elini cebine attı ama Kaptan ${captain.name} araya girdi. Olayı yatıştırdı ve oyuncuyu uyardı. Hakem kartını geri koyuyor!`);
                                return 'none';
                            }
                        }
                    }
                    return intendedCard;
                };

                if (isDOGSO) {
                    let finalCard = attemptCaptainSave('red');
                    if (finalCard === 'red') p.isRedCarded = true;
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                        gameHaltTimer = Date.now() + 6000;
                        haltReason = finalCard === 'red' ? "KIRMIZI KART (" + p.name + ")" : "SARI KART (" + p.name + ")";
                        if(typeof speak === 'function' && finalCard === 'red') speak("Hakem düdüğünü çaldı ve tereddütsüz kırmızı kart! Forvet kaleciyle karşı karşıyaydı. Bariz gol şansını son adam olarak engellediği için kural gereği doğrudan kırmızı kart görüyor!");
                        if(typeof announcerText !== 'undefined') announcerText.textContent = finalCard === 'red' ? "KIRMIZI KART (Bariz Gol Åžansını Engelleme)" : "SARI KART (Kaptan İkna Etti)";
                    }
                    return; // Skip normal foul
                }
                
                let isSoftFoul = Math.random() < 0.5;
                let refBase = window.currentReferee ? window.currentReferee.profile : "kuralci";
                if (refBase === "diktator" || refBase === "caylak") isSoftFoul = false; // Asla yumuşak geçmez, hemen kart veya uyarı
                if (refBase === "iletisimci" || refBase === "ada_tarzi") isSoftFoul = true; // Hep yumuşatır

                if (isSoftFoul) {
                    p.foulCount = (p.foulCount || 0) + 1;
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                        gameHaltTimer = Date.now() + 4000;
                        if (p.foulCount >= 3) {
                            let finalCard = attemptCaptainSave('yellow');
                            if (finalCard === 'yellow') p.hasYellowCard = true;
                            haltReason = finalCard === 'yellow' ? "SARI KART (" + p.name + ")" : "UYARI (" + p.name + ")";
                            if(typeof speak === 'function' && finalCard === 'yellow') speak("Hakem oyuncuyu yanına çağırdı. Üst üste yaptığı küçük faullerden dolayı ısrarlı kural ihlali sebebiyle sarı kart çıkarıyor!");
                            if(typeof announcerText !== 'undefined') announcerText.textContent = finalCard === 'yellow' ? "SARI KART (Sürekli Kural İhlali)" : "UYARI (Kaptan Devrede)";
                        } else {
                            let isDissent = Math.random() < 0.2;
                            if (isDissent) {
                                // KURAL 5: Küfür ve Hakaret
                                let isSwearing = Math.random() < 0.15;
                                if (isSwearing) {
                                    let finalCard = attemptCaptainSave('red');
                                    if (finalCard === 'red') p.isRedCarded = true;
                                    haltReason = finalCard === 'red' ? "KIRMIZI KART (" + p.name + ")" : "SARI KART (" + p.name + ")";
                                    if(typeof speak === 'function' && finalCard === 'red') speak("İnanılmaz! Karara sinirlenen oyuncu hakemin yüzüne karşı ağır küfürler savurdu! Hakem bunu duydu ve tereddütsüz kırmızı kartını gösteriyor!");
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = finalCard === 'red' ? "KIRMIZI KART (Küfür ve Hakaret)" : "SARI KART (Kaptan İptal Ettirdi)";
                                } else {
                                    let finalCard = attemptCaptainSave('yellow');
                                    if (finalCard === 'yellow') p.hasYellowCard = true;
                                    haltReason = finalCard === 'yellow' ? "SARI KART (" + p.name + ")" : "UYARI (" + p.name + ")";
                                    if(typeof speak === 'function' && finalCard === 'yellow') speak("Karar sadece fauldü ama oyuncu kollarını açıp hakemin üstüne yürüdü! Aşırı itirazdan dolayı sarı kart görüyor!");
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = finalCard === 'yellow' ? "SARI KART (İtiraz)" : "UYARI (Kaptan Araya Girdi)";
                                }
                            } else {
                                haltReason = "FAUL (" + p.name + ")";
                                if(typeof speak === 'function') speak("Hakem düdüğünü çaldı, karar faul.");
                                if(typeof announcerText !== 'undefined') announcerText.textContent = "FAUL (" + p.name + ")";
                            }
                        }
                    }
                    return; // Skip the hard foul red/yellow logic!
                }
                
                let redChance = isTier2Emotional ? 0.6 : 0.3;
                  if (window.isOleyActive && teamType === 'away') {
                      redChance = 0.90; // Oley çekilirken faul yaparlarsa genelde kasti tekmeyle adamı indirirler (Kırmızı)
                      if(typeof speak === 'function' && Math.random() < 0.2) speak("Oley paslarından iyice sinirlenen deplasman oyuncusu, top yerine direkt rakibinin ayağına acımasızca vurdu!");
                  } // Duygusal patlama (Kırmızı)
                if (Math.random() < redChance || p.hasYellowCard) {
                    let finalCard = attemptCaptainSave('red');
                    if (finalCard === 'red') p.isRedCarded = true;
                    // KURAL 1: Ciddi Faullü Oyun (Aşırı Güç)
                    if(typeof speak === 'function' && finalCard === 'red') speak("Kırmızı Kart! İnanılmaz sert bir hareket, rakibin sağlığını tehlikeye atacak aşırı güç kullanımı var! Ciddi faullü oyun nedeniyle doğrudan kırmızı kart!");
                    
                    // AÅžAMA 46: Hakem Baskısı
                    if (teamType === 'home') {
                        window.refereeFear += 30;
                        if(typeof speak === 'function') setTimeout(() => {
    let msgs = [
        "Tribünler hakemi büyük bir baskı altına aldı! İnanılmaz bir yuhalama var, hakem çok gergin!",
        "Taraftar hakemi hedef tahtasına koydu! Verilen bu karar sonrası stadyum adeta çıldırdı.",
        "Hakeme yönelik çok sert tepkiler var. Eyyamcı tezahüratları stadyumu inletiyor!",
        "Bu dakikadan sonra hakemin işi çok zor. Stadyumda ona karşı muazzam bir psikolojik savaş başladı."
    ];
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
}, 3000);
                    }
                    announcerText.textContent = p.name + " Kırmızı Kart gördü!";
                    
                    // AÅžAMA 42: OYUN DURMASI
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                        gameHaltTimer = Date.now() + 5000;
                        haltReason = "KIRMIZI KART (" + p.name + ")";
                        // AÅžAMA 43: Adalet ve Haksızlık Sistemi (Hakem Hatası)
                        setTimeout(() => {
                            let isRefMistake = Math.random() < 0.2; // Normal Hata
                            let rPro = window.currentReferee ? window.currentReferee.profile : "kuralci";
                            if (rPro === "atletik") isRefMistake = false; // Asla hata yapmaz
                            if (rPro === "caylak") isRefMistake = Math.random() < 0.4; // %40 hata
                            if (rPro === "sovmen") isRefMistake = Math.random() < 0.3; // Şov için şüpheli kararlar
                            if (rPro === "var_bagimlisi") {
                                isRefMistake = true; // Kesin hata verir (VAR'a gitmek için)
                                setTimeout(() => {
                                    if(typeof speak === 'function') speak("Hakem kendisi karar alamadı ve VAR odasıyla iletişime geçti. Uzun bir süre bekliyoruz.");
                                }, 500);
                            }

                            let rand = Math.random();
                            let msgs;
                            
                            if (isRefMistake) {
                                  // AÅžAMA 79: Dış Düşman Etkisi (Ani Kenetlenme)
                                  let isHomePlayer = (typeof homePlayers !== 'undefined' && typeof p !== 'undefined' && homePlayers.includes(p));
                                  if (isHomePlayer && typeof window.CrowdForm !== 'undefined' && window.CrowdForm >= 3) {
                                      window.CrowdForm = 1; // Form 1'e geri dön (Kenetlenme)
                                      if (typeof window.managerAuthority !== 'undefined') window.managerAuthority = Math.min(100, window.managerAuthority + 30);
                                      if (typeof window.presidentConfidence !== 'undefined') window.presidentConfidence = Math.min(100, window.presidentConfidence + 30);
                                      
                                      homePlayers.forEach(hp => {
                                          hp.stamina = 120; // Full enerji
                                          hp.speed = (hp.baseSpeed || 3) * 1.5;
                                            if (hp.bio) hp.bio.adrenaline = 100; // Savaş veya Kaç hormonu tavan yapar
                                          hp.power = (hp.power || 50) + 20;
                                          hp.mistakes = 0;
                                          hp.isBooedByOwnFans = false; // Günah keçisi affedilir
                                      });
                                      
                                      if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('home');
                                      
                                      if(typeof speak === 'function') setTimeout(() => speak("Az önce kendi futbolcusuna küfreden taraftar, hakemin bu haksız kararıyla bir anda kenetlendi! Bizim çocuğumuzu yedirmeyiz nidalarıyla stadyum tekrar cehenneme dönüştü! Futbolcular sahada 15 kişi gibi basmaya başladılar!"), 4000);
                                  }
    
                                // HAKSIZLIK VAR: Hoca çıldırır!
                                if(typeof speak === 'function') setTimeout(() => speak("Tekrardan izliyoruz... Çok temiz bir müdahale, burada kartlık bir durum yok! Hakem inanılmaz bir hata yaptı!"), 100);
                                
                                if (rand < 0.1) { // %10 İhtimalle Kıyamet
                                    msgs = [
                                        "Sayın seyirciler... Ekran başındaki çocuklu ailelerden özür diliyoruz. Sahada bir futbol maçı değil, adeta bir meydan muharebesi var.",
                                        "İnanılmaz görüntüler! Teknik direktör şu an VAR monitörünü tekmeliyor! Ekranı parçaladı! Yardımcıları onu tutamıyor.",
                                        "Çevik kuvvet polisleri sahaya girdi. Hakem üçlüsü polis kalkanları altında koşarak soyunma odasına sığınıyor.",
                                        "Maç an itibariyle tatil edildi. Futbol tarihimize geçecek kapkara, utanç verici bir gece yaşıyoruz. Yayınımızı burada kesmek zorundayız..."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "HAKEM HATASI! MAÇ TATİL EDİLDİ!";
                                    gameHaltTimer = Date.now() + 99999999; 
                                    teamPsychology = 'chaos';
                                } else if (rand < 0.5) { // %40 İhtimalle Skandal
                                    msgs = [
                                        "İnanılmaz anlar... Sayın seyirciler, teknik direktör oyun alanını ihlal ederek doğrudan maçın hakemine doğru koşuyor. Güvenlik güçleri ve oyuncular araya girmeye çalışıyor.",
                                        "Stadyumda şu an tam anlamıyla bir kaos hakim. Oyun tamamen durdu. Yardımcı antrenörler hocayı sakinleştirmekte çok zorlanıyor.",
                                        "Çok üzücü görüntüler. Futbolun dışına çıktığımız, tamamen sinirlerin gerildiği dakikalar. Umarız olaylar daha da büyümeden yatıştırılır.",
                                        "Reklam panolarının tekmelendiğini görüyoruz. Gerçekten kabul edilebilir bir durum değil. Disiplin kurulu bu görüntüleri mutlaka değerlendirecektir."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "HAKEM HATASI! HOCA SAHAYA GİRDİ!";
                                    gameHaltTimer = Date.now() + 10000; 
                                    teamPsychology = 'chaos';
                                } else { // %50 İhtimalle Kırmızı/Sarı Kart (İtirazdan)
                                    msgs = [
                                        "Evet, hakem elini cebine attı ve kararlı adımlarla kulübeye doğru gidiyor... Ve sarı kart. Teknik direktör itirazlarından dolayı sarı kartla cezalandırılıyor.",
                                        "Hakem tereddütsüz kırmızı kartını çıkardı! İtirazların dozunu kaçıran teknik adam ihraç ediliyor. Kendisi şimdi tribüne gitmek zorunda."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "HAKSIZ KARARA İSYAN! KULÜBEYE CEZA!";
                                    gameHaltTimer = Date.now() + 6000; 
                                }
                            } else {
                                // HAKLI KARAR: Hoca durumu kabullenir veya düşük itiraz yapar
                                if (rand < 0.2) { // Sadece %20 İhtimalle hocaya kart çıkar (O da abartırsa)
                                    msgs = [
                                        "Evet, hakem elini cebine attı ve kararlı adımlarla kulübeye doğru gidiyor... Ve sarı kart. Teknik direktör itirazlarından dolayı sarı kartla cezalandırılıyor."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "Tansiyon tavan yaptı! Yedek kulübesine ceza!";
                                    gameHaltTimer = Date.now() + 6000; 
                                } else { // %80 Normal İtiraz
                                    msgs = [
                                        "Oyun şu an duraklamış durumda. Kamera yedek kulübesine dönüyor, hocanın hakem kararına yoğun bir itirazı var.",
                                        "Dördüncü hakem orta hakemi uyardı sayın seyirciler. Saha kenarında teknik heyetin bir tepkisi var, tansiyon bu dakikalarda biraz yükseldi.",
                                        "Hoca çok sinirli. Kollarını açarak pozisyonun faul olmadığını anlatmaya çalışıyor ama hakemin kararı değişmeyecek.",
                                        "Yedek kulübesinde bir hareketlilik var. Teknik direktör yardımcılarıyla hararetli bir şekilde pozisyonu tartışıyor."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "Yedek kulübesinden hakeme itiraz var!";
                                }
                            }
                            
                            let msg = msgs[Math.floor(Math.random() * msgs.length)];
                            if(typeof speak === 'function') setTimeout(() => speak(msg), 4000); // Hakem hatası anonsundan sonra konuşur
                        }, 2500);
                    }
                    
                    // AÅžAMA 40: AURA KIRILMASI (One-Man Team Çöküşü)
                    if (p.isWorldClass && teamType === 'home') {
                        teamPsychology = 'broken';
                        homePlayers.forEach(mate => {
                            if (!mate.isWorldClass) {
                                mate.speed *= 0.8;
                                mate.baseSpeed *= 0.8;
                            }
                        });
                        if(typeof speak === 'function') setTimeout(() => speak("Takımın kalbi olan dünya yıldızı atıldı! Kalan oyuncular tamamen çöktü, sistem iflas etti!"), 2000);
                    }
                } else {
                    p.hasYellowCard = true;
                    p.isStunned = true; setTimeout(() => { if(p) p.isStunned = false; }, 3000);
                    if(typeof speak === 'function') speak("Sinirlerine hakim olamadı ve çok sert girdi! Hakem sarı kartını gösteriyor.");
                    announcerText.textContent = p.name + " Sarı Kart gördü.";
                    
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                        gameHaltTimer = Date.now() + 4000;
                        haltReason = "SARI KART (" + p.name + ")";
                        // AÅžAMA 43: Adalet ve Haksızlık Sistemi (Hakem Hatası)
                        setTimeout(() => {
                            let isRefMistake = Math.random() < 0.2; // %20 İhtimalle hakem haksız karar verir
                            let rand = Math.random();
                            let msgs;
                            
                            if (isRefMistake) {
                                  // AÅžAMA 79: Dış Düşman Etkisi (Ani Kenetlenme)
                                  let isHomePlayer = (typeof homePlayers !== 'undefined' && typeof p !== 'undefined' && homePlayers.includes(p));
                                  if (isHomePlayer && typeof window.CrowdForm !== 'undefined' && window.CrowdForm >= 3) {
                                      window.CrowdForm = 1; // Form 1'e geri dön (Kenetlenme)
                                      if (typeof window.managerAuthority !== 'undefined') window.managerAuthority = Math.min(100, window.managerAuthority + 30);
                                      if (typeof window.presidentConfidence !== 'undefined') window.presidentConfidence = Math.min(100, window.presidentConfidence + 30);
                                      
                                      homePlayers.forEach(hp => {
                                          hp.stamina = 120; // Full enerji
                                          hp.speed = (hp.baseSpeed || 3) * 1.5;
                                            if (hp.bio) hp.bio.adrenaline = 100; // Savaş veya Kaç hormonu tavan yapar
                                          hp.power = (hp.power || 50) + 20;
                                          hp.mistakes = 0;
                                          hp.isBooedByOwnFans = false; // Günah keçisi affedilir
                                      });
                                      
                                      if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('home');
                                      
                                      if(typeof speak === 'function') setTimeout(() => speak("Az önce kendi futbolcusuna küfreden taraftar, hakemin bu haksız kararıyla bir anda kenetlendi! Bizim çocuğumuzu yedirmeyiz nidalarıyla stadyum tekrar cehenneme dönüştü! Futbolcular sahada 15 kişi gibi basmaya başladılar!"), 4000);
                                  }
    
                                // HAKSIZLIK VAR: Hoca çıldırır!
                                if(typeof speak === 'function') setTimeout(() => speak("Tekrardan izliyoruz... Çok temiz bir müdahale, burada kartlık bir durum yok! Hakem inanılmaz bir hata yaptı!"), 100);
                                
                                if (rand < 0.1) { // %10 İhtimalle Kıyamet
                                    msgs = [
                                        "Sayın seyirciler... Ekran başındaki çocuklu ailelerden özür diliyoruz. Sahada bir futbol maçı değil, adeta bir meydan muharebesi var.",
                                        "İnanılmaz görüntüler! Teknik direktör şu an VAR monitörünü tekmeliyor! Ekranı parçaladı! Yardımcıları onu tutamıyor.",
                                        "Çevik kuvvet polisleri sahaya girdi. Hakem üçlüsü polis kalkanları altında koşarak soyunma odasına sığınıyor.",
                                        "Maç an itibariyle tatil edildi. Futbol tarihimize geçecek kapkara, utanç verici bir gece yaşıyoruz. Yayınımızı burada kesmek zorundayız..."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "HAKEM HATASI! MAÇ TATİL EDİLDİ!";
                                    gameHaltTimer = Date.now() + 99999999; 
                                    teamPsychology = 'chaos';
                                } else if (rand < 0.5) { // %40 İhtimalle Skandal
                                    msgs = [
                                        "İnanılmaz anlar... Sayın seyirciler, teknik direktör oyun alanını ihlal ederek doğrudan maçın hakemine doğru koşuyor. Güvenlik güçleri ve oyuncular araya girmeye çalışıyor.",
                                        "Stadyumda şu an tam anlamıyla bir kaos hakim. Oyun tamamen durdu. Yardımcı antrenörler hocayı sakinleştirmekte çok zorlanıyor.",
                                        "Çok üzücü görüntüler. Futbolun dışına çıktığımız, tamamen sinirlerin gerildiği dakikalar. Umarız olaylar daha da büyümeden yatıştırılır.",
                                        "Reklam panolarının tekmelendiğini görüyoruz. Gerçekten kabul edilebilir bir durum değil. Disiplin kurulu bu görüntüleri mutlaka değerlendirecektir."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "HAKEM HATASI! HOCA SAHAYA GİRDİ!";
                                    gameHaltTimer = Date.now() + 10000; 
                                    teamPsychology = 'chaos';
                                } else { // %50 İhtimalle Kırmızı/Sarı Kart (İtirazdan)
                                    msgs = [
                                        "Evet, hakem elini cebine attı ve kararlı adımlarla kulübeye doğru gidiyor... Ve sarı kart. Teknik direktör itirazlarından dolayı sarı kartla cezalandırılıyor.",
                                        "Hakem tereddütsüz kırmızı kartını çıkardı! İtirazların dozunu kaçıran teknik adam ihraç ediliyor. Kendisi şimdi tribüne gitmek zorunda."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "HAKSIZ KARARA İSYAN! KULÜBEYE CEZA!";
                                    gameHaltTimer = Date.now() + 6000; 
                                }
                            } else {
                                // HAKLI KARAR: Hoca durumu kabullenir veya düşük itiraz yapar
                                if (rand < 0.2) { // Sadece %20 İhtimalle hocaya kart çıkar (O da abartırsa)
                                    msgs = [
                                        "Evet, hakem elini cebine attı ve kararlı adımlarla kulübeye doğru gidiyor... Ve sarı kart. Teknik direktör itirazlarından dolayı sarı kartla cezalandırılıyor."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "Tansiyon tavan yaptı! Yedek kulübesine ceza!";
                                    gameHaltTimer = Date.now() + 6000; 
                                } else { // %80 Normal İtiraz
                                    msgs = [
                                        "Oyun şu an duraklamış durumda. Kamera yedek kulübesine dönüyor, hocanın hakem kararına yoğun bir itirazı var.",
                                        "Dördüncü hakem orta hakemi uyardı sayın seyirciler. Saha kenarında teknik heyetin bir tepkisi var, tansiyon bu dakikalarda biraz yükseldi.",
                                        "Hoca çok sinirli. Kollarını açarak pozisyonun faul olmadığını anlatmaya çalışıyor ama hakemin kararı değişmeyecek.",
                                        "Yedek kulübesinde bir hareketlilik var. Teknik direktör yardımcılarıyla hararetli bir şekilde pozisyonu tartışıyor."
                                    ];
                                    if(typeof announcerText !== 'undefined') announcerText.textContent = "Yedek kulübesinden hakeme itiraz var!";
                                }
                            }
                            
                            let msg = msgs[Math.floor(Math.random() * msgs.length)];
                            if(typeof speak === 'function') setTimeout(() => speak(msg), 4000); // Hakem hatası anonsundan sonra konuşur
                        }, 2500);
                    }
                }
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    if (!p.isUserControlled) {
        // AÅžAMA 40: DÜNYA YILDIZI TEMBELLİÄžİ (Defansa gelmez)
        if (teamType === 'home' && ball.team === 'away' && p.isWorldClass) {
            let isAttacker = (p.position === 'Forvet' || p.position === 'Sol Kanat' || p.position === 'Sağ Kanat' || p.tacticalRole === 'playmaker' || p.tacticalRole === 'inside_forward');
            if (isAttacker) {
                p.x += (600 - p.x) * 0.02; // İleride pas bekle
                p.y += (250 - p.y) * 0.02;
                
                // AÅžAMA 41: SPİKER YORUMU
                if (Math.random() < 0.0005 && !p.lazyCommentaryDone) {
                    p.lazyCommentaryDone = true;
                    if(typeof speak === 'function') speak(p.name + " defansa dönmüyor, tamamen ileride pas bekliyor. Yıldız forvet, takımını adeta eksik oynatıyor!");
                }
                return; // Diğer hareket (pres) algoritmalarını es geç
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    if (p.isUserControlled) {
        if (typeof isGameHalted === 'undefined' || !isGameHalted) {
            if (keys['ArrowUp']) p.y -= spd;
            if (keys['ArrowDown']) p.y += spd;
            if (keys['ArrowLeft']) p.x -= spd;
            if (keys['ArrowRight']) p.x += spd;
        }
        
        if (ball.team === 'none' && Date.now() > ball.passCooldown) {
            let dx = p.x - ball.x; let dy = p.y - ball.y;
            if (Math.sqrt(dx*dx + dy*dy) < 20 && !ball.isAirborne) {
                ball.team = teamType;
                if (teamType === 'home' && !p.isUserControlled) {
                    if (activePlayer) activePlayer.isUserControlled = false;
                    p.isUserControlled = true;
                    activePlayer = p;
                }
            }
        }
        if (ball.team === teamType) { ball.x = p.x + 10; ball.y = p.y; }
    } else {
        // AÅžAMA 44: Otorite Düşüşü ve Taktiksel İtaatsizlik
        let isDisobeying = false;
        if (teamType === 'home' && p !== homePlayers[0] && typeof window.managerAuthority !== 'undefined') {
            let disobedienceChance = 0;
            if (window.managerAuthority < 30) disobedienceChance = 0.50;
            else if (window.managerAuthority < 50) disobedienceChance = 0.30;
            else if (window.managerAuthority < 70) disobedienceChance = 0.10;
            isDisobeying = (Math.random() < disobedienceChance);
        }

        if (isDisobeying) {
            p.x += (Math.random() - 0.5) * 3;
            p.y += (Math.random() - 0.5) * 3;
            if (Math.random() < 0.0005) {
                if(typeof speak === 'function') speak("Sahada büyük bir kopukluk var. Oyuncular taktik disiplinden tamamen uzaklaşmış durumda, hocayı dinlemiyorlar!");
            }
        } else {
            // --- YENİ: DİNAMİK FORMASYON SİSTEMİ ---
            let baseFormations = {
                "4-4-2": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.85}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.35}, {x: 0.25, y: 0.15}, {x: 0.5, y: 0.85}, {x: 0.45, y: 0.65}, {x: 0.45, y: 0.35}, {x: 0.5, y: 0.15}, {x: 0.75, y: 0.6}, {x: 0.75, y: 0.4}],
                "4-2-3-1": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.85}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.35}, {x: 0.25, y: 0.15}, {x: 0.4, y: 0.65}, {x: 0.4, y: 0.35}, {x: 0.6, y: 0.85}, {x: 0.6, y: 0.5}, {x: 0.6, y: 0.15}, {x: 0.8, y: 0.5}],
                "4-3-3": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.85}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.35}, {x: 0.25, y: 0.15}, {x: 0.45, y: 0.5}, {x: 0.5, y: 0.75}, {x: 0.5, y: 0.25}, {x: 0.75, y: 0.85}, {x: 0.75, y: 0.15}, {x: 0.8, y: 0.5}],
                "4-1-4-1": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.85}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.35}, {x: 0.25, y: 0.15}, {x: 0.4, y: 0.5}, {x: 0.6, y: 0.85}, {x: 0.55, y: 0.65}, {x: 0.55, y: 0.35}, {x: 0.6, y: 0.15}, {x: 0.8, y: 0.5}],
                "3-5-2": [{x: 0.05, y: 0.5}, {x: 0.2, y: 0.75}, {x: 0.15, y: 0.5}, {x: 0.2, y: 0.25}, {x: 0.45, y: 0.9}, {x: 0.4, y: 0.65}, {x: 0.4, y: 0.35}, {x: 0.45, y: 0.1}, {x: 0.55, y: 0.5}, {x: 0.75, y: 0.65}, {x: 0.75, y: 0.35}],
                "3-4-3": [{x: 0.05, y: 0.5}, {x: 0.2, y: 0.75}, {x: 0.15, y: 0.5}, {x: 0.2, y: 0.25}, {x: 0.5, y: 0.85}, {x: 0.45, y: 0.6}, {x: 0.45, y: 0.4}, {x: 0.5, y: 0.15}, {x: 0.75, y: 0.8}, {x: 0.75, y: 0.2}, {x: 0.8, y: 0.5}],
                "5-3-2": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.9}, {x: 0.2, y: 0.7}, {x: 0.15, y: 0.5}, {x: 0.2, y: 0.3}, {x: 0.25, y: 0.1}, {x: 0.5, y: 0.5}, {x: 0.55, y: 0.75}, {x: 0.55, y: 0.25}, {x: 0.75, y: 0.6}, {x: 0.75, y: 0.4}],
                "5-5-0": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.9}, {x: 0.2, y: 0.7}, {x: 0.15, y: 0.5}, {x: 0.2, y: 0.3}, {x: 0.25, y: 0.1}, {x: 0.5, y: 0.9}, {x: 0.45, y: 0.7}, {x: 0.45, y: 0.5}, {x: 0.45, y: 0.3}, {x: 0.5, y: 0.1}],
                "5-4-1": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.9}, {x: 0.2, y: 0.7}, {x: 0.15, y: 0.5}, {x: 0.2, y: 0.3}, {x: 0.25, y: 0.1}, {x: 0.5, y: 0.8}, {x: 0.45, y: 0.6}, {x: 0.45, y: 0.4}, {x: 0.5, y: 0.2}, {x: 0.75, y: 0.5}],
                "5-2-3": [{x: 0.05, y: 0.5}, {x: 0.25, y: 0.9}, {x: 0.2, y: 0.7}, {x: 0.15, y: 0.5}, {x: 0.2, y: 0.3}, {x: 0.25, y: 0.1}, {x: 0.45, y: 0.65}, {x: 0.45, y: 0.35}, {x: 0.75, y: 0.8}, {x: 0.7, y: 0.5}, {x: 0.75, y: 0.2}]
            };

            let formName = (teamType === 'home') ? (window.currentFormation || "4-4-2") : "4-4-2"; 
            let teamArray = (teamType === 'home') ? homePlayers : awayPlayers;
            let idx = teamArray.indexOf(p);
            
            if (idx === -1 || idx >= 11) idx = 10;
            
            let coords = baseFormations[formName] ? baseFormations[formName][idx] : baseFormations["4-4-2"][idx];
            let base_x = coords.x * 800;
            let base_y = coords.y * 500;
            
            if (teamType === 'away') {
                base_x = 800 - base_x;
                base_y = 500 - base_y;
            }

            let attackShift = 0;
            if (teamType === 'home') {
                if (ball.team === 'home') attackShift = 120 + (ball.x - 400) * 0.25; 
                else if (ball.team === 'away') attackShift = -100 + (ball.x - 400) * 0.3;
            } else {
                if (ball.team === 'away') attackShift = -120 + (ball.x - 400) * 0.25; 
                else if (ball.team === 'home') attackShift = 100 + (ball.x - 400) * 0.3; 
            }
            
            let targetX = (idx === 0) ? base_x : base_x + attackShift * coords.x;
            let targetY = base_y;
            
            if (idx === 0) { 
                if (p.penaltyDiveTarget) {
                    targetY = p.penaltyDiveTarget; // Kaleci penaltı köşesine atlar
                    // Top vurulduktan sonra, eğer top uzaklaştıysa hedefi iptal et
                    if (ball.x > 750 || ball.x < 50 || ball.team !== 'none') p.penaltyDiveTarget = null;
                } else {
                    targetY += (ball.y - targetY) * 0.1;
                }
                
                if (targetY < 200) targetY = 200;
                if (targetY > 300) targetY = 300;
                
                let enemyInBox = (teamType === 'home') ? (ball.team === 'away' && ball.x < 250) : (ball.team === 'home' && ball.x > 550);
                if (enemyInBox && (p.tacticalRole === 'aggressive' || p.tacticalRole === 'sweeper_keeper')) {
                    targetX += (ball.x - targetX) * 0.08;
                    targetY += (ball.y - targetY) * 0.08;
                }
            } else {
                let isOpponentHasBall = (teamType === 'home' && ball.team === 'away') || (teamType === 'away' && ball.team === 'home');
                let dx = ball.x - p.x; let dy = ball.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                
                if (isOpponentHasBall) {
                    let sortedByDist = teamArray.slice(1).sort((a,b) => {
                        let d1 = Math.sqrt(Math.pow(ball.x-a.x, 2) + Math.pow(ball.y-a.y, 2));
                        let d2 = Math.sqrt(Math.pow(ball.x-b.x, 2) + Math.pow(ball.y-b.y, 2));
                        return d1 - d2;
                    });
                    
                    let isPressing = (p === sortedByDist[0] || p === sortedByDist[1]);
                    if (isPressing) {
                        targetX += (ball.x - targetX) * 0.6;
                        targetY += (ball.y - targetY) * 0.6;
                    } else {
                        targetY += (ball.y - targetY) * 0.25;
                        targetX += (ball.x - targetX) * 0.1;
                    }
                } else {
                    if (ball.team === 'none' && dist < 200) {
                        targetX += (ball.x - targetX) * 0.3; 
                        targetY += (ball.y - targetY) * 0.3;
                    } else if (ball.team === teamType && typeof currentStriker !== 'undefined' && p !== currentStriker && dist > 100) {
                        // Jitter (titreme) hatasını düzeltmek için sürekli random yerine sinüs/kosinüs dalgası
                        targetY += Math.sin(Date.now() / 300 + idx) * 15;
                        targetX += Math.cos(Date.now() / 300 + idx) * 15;
                    }
                }
            }
            
            if (p.tacticalRole === 'false_9') targetX += (teamType === 'home' ? -60 : 60);
            else if (p.tacticalRole === 'poacher') targetX += (teamType === 'home' ? 60 : -60);
            
            // [ÖDÜL SİSTEMİ]: 80. Dakika Kamikaze Doldur-Boşalt (Tüm takım ceza sahasına)
            if (window.isChaosEventActive) {
                if (p.position === 'CB' || p.position === 'LB' || p.position === 'RB') {
                    if (teamType === 'home') {
                        targetX = 650 + (idx * 5); // Sabit pozisyon kayması (titremeyi engeller)
                        targetY = 250 + (idx * 15 - 30);
                    } else if (teamType === 'away') {
                        targetX = 150 - (idx * 5);
                        targetY = 250 + (idx * 15 - 30);
                    }
                }
            }

            p.x += (targetX - p.x) * (spd * 0.015);
            p.y += (targetY - p.y) * (spd * 0.015);

            // HOMETEAM BOT BALL PICKUP & AUTO-SWITCH
            if (teamType === 'home' && ball.team !== 'home') {
                let dx = ball.x - p.x; let dy = ball.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 20 && Date.now() > ball.passCooldown && !ball.isAirborne) {
                    ball.team = 'home';
                    if (activePlayer) activePlayer.isUserControlled = false;
                    p.isUserControlled = true;
                    activePlayer = p;
                }
            }

            if (teamType === 'away' && ball.team !== 'away') {
                let dx = ball.x - p.x; let dy = ball.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 20 && Date.now() > ball.passCooldown && !ball.isAirborne) {
                    if (ball.team === 'none' && typeof lastShooter !== 'undefined' && lastShooter === homePlayers[10] && Math.abs(ball.vx) > 10 && Math.random() < 0.20) {
                        ball.isDeflectedShot = true;
                        ball.vy = (Math.random() - 0.5) * 30; 
                        ball.passCooldown = Date.now() + 500; 
                        if(typeof speak === 'function') speak("Åžutunu çekti... Savunmaya çarpıyor!");
                    } else {
                        let wasEpicMiss = false;
                        if (ball.team !== 'away' && typeof lastShooter !== 'undefined' && lastShooter === homePlayers[10]) {
                            if(typeof handleStrikerMiss === 'function') handleStrikerMiss('save');
                            wasEpicMiss = true;
                            if (Math.random() < 0.25) {
                                ball.team = 'none'; 
                                ball.vx = -10;
                                window.isGKSavedRebound = true;
                                window.gkReboundTimer = Date.now() + 4000;
                            } else {
                                ball.team = 'away'; 
                            }
                        } else {
                            ball.team = 'away';
                        }
                        if (!wasEpicMiss && typeof speak === 'function') speak("Top rakibe geçti.");
                    }
                }
            } else if (teamType === 'away' && ball.team === 'away') {
                if (p.x > 780 && idx !== 0) { 
                    if(typeof window.enemyScore !== 'undefined') window.enemyScore++; 
                    // GOAL LOGGING
                    window.lastMatchGoalEvents = window.lastMatchGoalEvents || [];
                    let scorerName = (typeof p !== 'undefined' && p && p.name) ? p.name : "Rakip Oyuncu";
                    let gMin = typeof timeLeft !== 'undefined' ? (90 - Math.floor(timeLeft)) : 45;
                    if (gMin < 1) gMin = 1;
                    window.lastMatchGoalEvents.push({ team: 'away', scorer: scorerName, min: gMin });
                    window.lastMatchScore = { home: window.playerScore, away: window.enemyScore };
                    
                    if(typeof updateScoreBoard === 'function') updateScoreBoard(); 
                    ball.x=400; ball.y=250; ball.team='none'; ball.vx=0; ball.vy=0; 
                    if(typeof speak === 'function') speak("Maalesef top ağlarımızda. Gol yedik.");
                }
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    if (p.x < 0) p.x = 0; if (p.x > 800) p.x = 800;
    if (p.y < 0) p.y = 0; if (p.y > 500) p.y = 500;
    
    if (p !== homePlayers[0] && p !== awayPlayers[0]) {
        let dist = Math.sqrt(Math.pow(p.x - oldX, 2) + Math.pow(p.y - oldY, 2));
        
        // AŞAMA 66: Erken Teslimiyet (Sessizlik) ve Protesto
        let isEarlyDefeat = window.CrowdForm >= 3;
        let isProtestActive = window.CrowdForm === 4;
        
        // YENİ FİZYOLOJİ VE KONDİSYON MOTORU (VO2 Max, Rol Çarpanı ve Akselerasyon)
        let roleMultiplier = 1.0;
        let pos = p.position ? p.position.toLowerCase() : "";
        if (pos.includes("orta saha") || pos.includes("maestro") || pos.includes("libero") || pos.includes("box")) {
            roleMultiplier = 0.7; // Akciğerler
        } else if (pos.includes("kanat") || pos.includes("açık") || pos.includes("bek") || pos.includes("piston")) {
            roleMultiplier = 1.3; // Piston
        } else if (pos.includes("forvet") || pos.includes("santrfor") || pos.includes("poacher")) {
            roleMultiplier = 1.5; // Patlayıcı efor
        } else if (pos.includes("stoper")) {
            roleMultiplier = 0.9; 
        } else if (pos.includes("kaleci")) {
            roleMultiplier = 0.2; 
        }

        let baseDecayRate = 0.0005;
        let staminaDecay = (dist * baseDecayRate) * roleMultiplier;


        // YENİ: MENAJER PROFİLİ (Taktik Deha Stamina Tüketimi)
        if (window.managerProfile === 'taktik_deha' && homePlayers.includes(p)) {
            staminaDecay *= 1.3;
            p.mistakes = 0; // Pas hatası tamamen kalkar
        }

        // Akselerasyon ve İvmelenme Hasarı (Sakatlık Riski)
        if (dist > 0.5) {
            let newDir = Math.atan2(p.y - p.prevY, p.x - p.prevX);
            if (p.direction !== undefined) {
                let dirDiff = Math.abs(newDir - p.direction);
                if (dirDiff > Math.PI) dirDiff = 2 * Math.PI - dirDiff;
                if (dirDiff > 1.2) { 
                    if (p.stamina < 40 && typeof isGameHalted !== 'undefined' && !isGameHalted && !p.isInjured) {
                        let injuryChance = (40 - p.stamina) * 0.00005 * roleMultiplier;
                        if (Math.random() < injuryChance) {
                            p.isInjured = true;
                            p.isKinesiophobic = true;
                            isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                            gameHaltTimer = Date.now() + 6000;
                            
                            
                            let injuries = [
                                { reason: "ZEDELENME", severity: 1, msg: p.name + " ikili mücadelede ufak bir darbe aldı. Zedelenme olabilir!" },
                                { reason: "DİZ DÖNMESİ", severity: 2, msg: "Eyvah eyvah! " + p.name + " yön değiştirirken dizi fena döndü! Acı içinde yerde kıvranıyor!" },
                                { reason: "KIRILMA", severity: 3, msg: "Aman Allah'ım! Çok kötü bir kırılma sesi geldi! " + p.name + " için oyun muhtemelen uzun bir süre bitti!" },
                                { reason: "KRAMPON DARBESİ", severity: 1, msg: "Sert bir müdahale! " + p.name + " bacağında kanama ile yerde kaldı. Kötü bir krampon kesiği olabilir!" }
                            ];

                            let randInj = injuries[Math.floor(Math.random() * injuries.length)];
                            
                            haltReason = randInj.reason + " (" + p.name + ")";
                            
                            if (window.announcerBrain && typeof window.announcerBrain.onInjury === 'function') {
                                window.announcerBrain.onInjury(p, randInj.severity, randInj.reason);
                            } else {
                                if(typeof speak === 'function') speak(randInj.msg);
                            }
                            
                            p.speed *= 0.1; p.baseSpeed *= 0.1;
                        }
                    }
                }
            }
            p.direction = newDir;
        }
        p.prevX = p.x; p.prevY = p.y;
        if (isEarlyDefeat) staminaDecay *= 2.0; // Ev sahibi avantajı gitti, yorgunluk katlandı
        
      // AÅžAMA 75: Stadyumu Terk Etme (En Ağır Ceza)
      let isStadiumAbandoned = (window.CrowdForm === 4) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);
      
      if (window.currentFanProfile) {
          if (window.currentFanProfile.profile === 'ultras') {
              isStadiumAbandoned = false;
          } else if (window.currentFanProfile.profile === 'cekirdekci' && typeof timeLeft !== 'undefined' && timeLeft <= 15) {
              isStadiumAbandoned = true; // Trafik olmasın diye çıkarlar
          } else if (window.currentFanProfile.profile === 'plastik' && window.CrowdForm >= 3) {
              isStadiumAbandoned = true; // İyi gün taraftarı kötü oyuna katlanamaz, hemen çeker gider
          }
      }

      if (isStadiumAbandoned) {
          if (!window.abandonmentAnnounced) {
              window.abandonmentAnnounced = true;
              if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
              if(typeof speak === 'function') speak("İnanılmaz görüntüler! Stadyumdaki on binlerce taraftar, takımlarının bu rezil futbolunu daha fazla izlememek için tribünleri boşaltıyor! Yuhalamıyorlar, ıslıklamıyorlar, sadece terk ediyorlar! Futbolcular için yerin dibine girme anı.");
              if(typeof announcerText !== 'undefined') announcerText.textContent = "STADYUM BOÅžALIYOR! TARAFTAR TERK ETTİ!";
              
              // Yönetime büyük darbe
              window.managerAuthority = 0;
              window.presidentConfidence = 0;
          }
          
          // Sahadaki Ruhsuzluk (Fiziken Maçı Bırakırlar)
          if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
          if (typeof homePlayers !== 'undefined') {
              homePlayers.forEach(p => {
                  // p.stamina = 0; kaldırıldı
                  p.speed = (p.baseSpeed || 3) * 0.85; // Hafif moral çöküntüsü
                  p.power = 1; // Åžut veya pas atamazlar
              });
          }
      } else if (isProtestActive) {
            spd *= 0.5; // Protesto varsa koşmaya mecal kalmaz
            if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
        }

        // Günah Keçisi Kaçışı
        if (p.isBooedByOwnFans && !p.isUserControlled && window.CrowdForm === 4) {
            p.x -= (p.x - 100) * 0.02; // Kenara, kaleye doğru saklanır
            p.y += (100 - p.y) * 0.02;
            spd *= 0.3; // İsteksiz hareket eder
        }
        
        // Günah Keçisi ayağına top alırsa ıslık kopar
        if (p === activePlayer && p.isMessiah && ball.team === 'home' && Math.random() < 0.05 && window.AudioManager && window.CrowdForm >= 3) {
              let cheer = new Audio('sounds/cheer.ogg'); cheer.volume = 0.5; cheer.play().catch(e=>{});
          }
          
          if (p === activePlayer && p.isBooedByOwnFans && ball.team === 'home' && Math.random() < 0.02 && window.AudioManager) {
            let boo = new Audio('sounds/boo.ogg'); boo.volume = 1.0; boo.play().catch(e=>{});
        }
    
 // Uzun maça göre kondisyon erimesi 10 kat yavaşlatıldı
        
        if (p.hasAura) staminaDecay *= 0.85; // Aura kondisyon koruması (%15)
        
        if (p.isTier2) staminaDecay *= 1.5; 
        if (p.isTier4) staminaDecay *= 3.0; // AÅžAMA 39: Çaylakların panik eforu
        
        // AÅžAMA 70: %5'lik Kemik Kadro Direnci (Deplasman Ele Geçirmesi)
        if (typeof isEarlyDefeat !== 'undefined' && isEarlyDefeat && teamType === 'away') {
            staminaDecay *= 0.1; // Deplasman takımı yorulmaz, muazzam direnç kazanır
            spd *= 1.2; // Gelen destekle hızlanırlar
        }
        
        // VO2 Max ve Aktif Dinlenme (Recovery)
        if (dist < 0.2 && p.stamina < 100 && typeof isEarlyDefeat !== 'undefined' && !isEarlyDefeat) {
            let vo2MaxMultiplier = (p.power || 70) / 100;
            // Aktif Dinlenme (Rest) Olayı Tetiklenir
            window.triggerPsychEvent(p, 'rest');
        } else {
            // [ÖDÜL SİSTEMİ]: Alev Alan oyuncu yorulmaz!
            if (p.isOnFire) {
                staminaDecay = 0;
            }
            p.stamina -= staminaDecay;
        }

        // [ÖDÜL SİSTEMİ]: Alev Aldı zamanlayıcısı kontrolü
        if (p.isOnFire && typeof timeLeft !== 'undefined' && timeLeft <= p.onFireUntil) {
            p.isOnFire = false; // Ateşi söner
            p.consecutiveSuccess = 0;
            if(typeof speak === 'function' && p.isUserControlled) {
                speak(p.name + " resmen alev almıştı ama şimdi biraz duruluyor.");
            }
        }

        // KİNESİOFOBİ (Sakatlık Korkusu) Etkisi
        // DacÄƒ oyuncu isKinesiophobic ise rakiplere çok yaklaşınca (ikili mücadele anında) korkar ve yavaşlar
        if (p.isKinesiophobic && typeof awayPlayers !== 'undefined') {
            let closeOpponents = awayPlayers.filter(op => Math.sqrt(Math.pow(op.x - p.x, 2) + Math.pow(op.y - p.y, 2)) < 50).length;
            if (closeOpponents > 0) {
                spd *= 0.5; // İkili mücadeleden kaçmak için fren yapar
                if (p === activePlayer && Math.random() < 0.05 && typeof speak === 'function') {
                    speak(p.name + " ikili mücadeleye girmekten korkuyor! Sakatlık travmasını hala atlatamamış.");
                }
            }
        }
        
        // AÅžAMA 45: Comeback Buff
        if (typeof window.isComebackActive !== 'undefined' && window.isComebackActive) {
            if (Date.now() > window.comebackTimer) {
                window.isComebackActive = false;
            } else if (teamType === 'home') {
                p.stamina = 100; // Sınırsız kondisyon
            }
        }
        
        if (p.stamina <= 0) {
            p.stamina = 0;
            // AÅžAMA 42: YORGUNLUK KAYNAKLI SAKATLIK
            if (typeof isGameHalted !== 'undefined' && !isGameHalted && !p.isInjured && Math.random() < 0.0001) {
                p.isInjured = true;
                isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                gameHaltTimer = Date.now() + 5000;
                
                
                let fatigueInjuries = [
                    { reason: "BİTKİNLİK", msg: "Eyvah! " + p.name + " yorgunluğa dayanamadı ve kendini yere bıraktı. Oyun durdu, sağlık görevlileri sahada!" },
                    { reason: "KIRIK ŞÜPHESİ", msg: "Aman tanrım! " + p.name + " bitkin düştüğü anda ters bastı! Kırık şüphesiyle sağlık görevlileri hemen müdahale ediyor!" },
                    { reason: "LİF KOPMASI", msg: p.name + " adeta tükendi, koşarken bir anda lifi koptu! Oyuna devam etmesi imkansız!" },
                    { reason: "KAS ÇEKİLMESİ", msg: p.name + " depar atarken bir anda belini tuttu! Kas çekilmesi yaşıyor, çok acı çekiyor." }
                ];

                let randFatigue = fatigueInjuries[Math.floor(Math.random() * fatigueInjuries.length)];
                
                haltReason = randFatigue.reason + " (" + p.name + ")";
                if(typeof speak === 'function') speak(randFatigue.msg);
                
                // Sakatlanan oyuncunun hızı biter
                p.speed *= 0.2;
                p.baseSpeed *= 0.2;
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
}


// AÅžAMA 86: VAR Sistemi ve Toplu İtiraz (İsyan)
window.triggerVAR = function(scoringTeam) {
    if (Math.random() > 0.2) return; // %20 ihtimalle VAR'a takılır
    
    let isHomeGoal = (scoringTeam === 'home');
    let defendingPlayers = isHomeGoal ? awayPlayers : homePlayers;
    let avgAnger = 0;
    
    if (typeof defendingPlayers !== 'undefined' && defendingPlayers[0] && defendingPlayers[0].emotions) {
        let totalAnger = defendingPlayers.reduce((sum, p) => sum + (p.emotions.anger || 0), 0);
        avgAnger = totalAnger / defendingPlayers.length;
    }
    
    isGameHalted = true;
    window.varStatus = 'checking'; 
    if (window.currentFanProfile && window.currentFanProfile.profile === 'nostaljik') {
        if(typeof speak === 'function') speak("Hakem VAR'a gidiyor! Nostaljik taraftarlar 'Endüstriyel futbol ruhumuzu öldürdü!' diyerek stadyumu kulakları sağır edecek bir ıslık yağmuruna tuttu!");
    }
    window.varScoringTeam = scoringTeam;
    window.varDecision = Math.random() < 0.5 ? 'offside' : 'goal'; 
    window.varLineDefX = 0; window.varLineAttX = 0;
    window.varDisciplineEventTriggered = false;
    let nearbyVAR = 0;
    let allPlayersVAR = [...(typeof homePlayers !== 'undefined' ? homePlayers : []), ...(typeof awayPlayers !== 'undefined' ? awayPlayers : [])];
    allPlayersVAR.forEach(p => { if (Math.hypot(p.x - ball.x, p.y - ball.y) < 150) nearbyVAR++; });
    window.varPlayersNearIncident = nearbyVAR;
    
    let refX = 400, refY = 250; 
    
    if (avgAnger > 60 || window.CrowdForm === 4) {
        // İSYAN! Hakemi VAR Monitörüne yollarlar
        window.varStatus = 'monitor';
        window.varTimer = Date.now() + 40000; // 40 Saniye stres
        
        if(typeof speak === 'function') speak("Yiyen takım oyuncuları öfkeden delirdi! Hakemin etrafını sardılar! Çok yoğun bir itiraz var. Hakem bu devasa psikolojik baskıya dayanamadı, kenara VAR monitörüne gidiyor!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OYUNCULAR HAKEMİ VAR'A GİTMEYE ZORLADI!";
        
        // Defans oyuncuları hakemin etrafını sarar
        defendingPlayers.forEach((p, idx) => {
            if (idx < 6) { 
                p.x = refX + (Math.random() * 40 - 20);
                p.y = refY + (Math.random() * 40 - 20);
                p.speed = (p.baseSpeed || 3) * 0.8; 
            }
        });
    } else {
        // Normal VAR beklemesi (Kulaktan)
        window.varTimer = Date.now() + 15000; // 15 saniye
        if(typeof speak === 'function') speak("VAR odası pozisyonu inceliyor, hakem kulağını tuttu...");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "VAR İNCELEMESİ BEKLENİYOR...";
    }
    
    haltReason = "VAR İNCELEMESİ";
};


function tickMatchMinute() {
    window.wastedTime = window.wastedTime || 0;
            window.isInjuryTime = window.isInjuryTime || false;
            
            if(!isPaused && gameActive && !window.isPreMatch) {
                // Eğer oyun durmuşsa (Kırmızı kart, protesto vs.), saati durdurma ama boşa geçen süreyi kaydet
                if (typeof isGameHalted !== 'undefined' && isGameHalted) {
                    window.wastedTime++;
                }
                
                timeLeft--;
                
                // [YENİ] Devre Arası İsyan Kontrolü ve Soyunma Odası Konuşması (RPG)
                if (timeLeft === 45 && !window.halftimeEventDone) {
                    window.halftimeEventDone = true; 
                    if (typeof window.triggerHalftimeSpeech === 'function') {
                        window.triggerHalftimeSpeech();
                    } else {
                        // Fallback (Fonksiyon yoksa sadece enerji ver)
                        homePlayers.forEach(p => {
                            p.stamina = Math.min(100, p.stamina + 30);
                            p.morale = Math.min(100, p.morale + 10);
                        });
                    }
                }
                
                // [ÖDÜL SİSTEMİ]: 80. Dakika Doldur-Boşalt (Kamikaze Kaosu)
                if (timeLeft === 10 && !window.chaosEventTriggered && (window.playerScore < window.enemyScore)) {
                    window.chaosEventTriggered = true;
                    window.isChaosEventActive = true;
                    if(typeof speak === 'function') speak("Maçta son 10 dakikaya giriyoruz ve takım mağlup durumda! Menajer risk alıyor, stoperler bile rakip ceza sahasına gidiyor! Ölüm kalım futbolu başladı! Doldur boşalt taktiği izliyoruz!");
                }
                
                // AÅžAMA 83: Biyokimyasal Motor Güncellemesi
                let updateBiochemistry = function(p, isHome) {
                    if (!p || p.isRedCarded || p.x === -1000) return;
                    if (!p.bio) p.bio = { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 };
                    
                    // Doğal Erime (Decay)
                    p.bio.adrenaline = Math.max(0, p.bio.adrenaline - 5); // Adrenalin çabuk biter
                    p.bio.cortisol = Math.max(0, p.bio.cortisol - 2);     // Stres yavaş azalır
                    p.bio.lacticAcid = Math.max(0, p.bio.lacticAcid - 1); // Dinlenince laktik asit atılır
                    p.bio.dopamine = Math.max(20, Math.min(100, p.bio.dopamine + (Math.random() > 0.5 ? 1 : -1))); // Dalgalanma
                    
                    // Laktik asit birikimi (Koşuya bağlı)
                    if (typeof p.speed !== 'undefined' && p.speed > p.baseSpeed) {
                        p.bio.lacticAcid = Math.min(100, p.bio.lacticAcid + 2);
                    }
                    
                    // Tribün ve Psikolojik Etkiler
                    if (isHome) {
                        if (p.isBooedByOwnFans) p.bio.cortisol = Math.min(100, p.bio.cortisol + 10);
                        if (p.isMessiah) p.bio.dopamine = Math.min(100, p.bio.dopamine + 5);
                        if (window.CrowdForm === 7) p.bio.serotonin = 100; // Ekstra rehavet
                    }
                    
                    // Derbi agresyonu (Testosteron)
                    if (typeof window.isDerby !== 'undefined' && window.isDerby) {
                        p.bio.testosterone = Math.min(100, p.bio.testosterone + 1);
                    }
                    
                    // Laktik asit sakatlık riski (Adale çekmesi)
                    if (p.bio.lacticAcid > 90 && Math.random() < 0.05) {
                        p.isStunned = true; // Kramplar girer
                        if (Math.random() < 0.1 && typeof speak === 'function') speak(p.name + " arka adalesini tutuyor, laktik asit patlaması yaşadı!");
                    }
                    
                    // Efektif Hız ve Güç Hesaplaması
                    let effectiveSpeed = p.baseSpeed * (1 + (p.bio.adrenaline * 0.01)) * (1 - (p.bio.lacticAcid * 0.005));
                    let effectivePower = (p.basePower || 50) * (1 + (p.bio.testosterone * 0.005)) * (1 + (p.bio.adrenaline * 0.005));
                    
                    p.speed = Math.max(0.5, effectiveSpeed);
                    p.power = Math.max(10, Math.min(100, effectivePower));
                    
                    // Kortizol (Stres) Hata oranını artırır
                    p.mistakes = (p.mistakes || 0);
                    if (p.bio.cortisol > 80 && Math.random() < 0.2) p.mistakes++;
                    
                    // AÅžAMA 84: Duygu Motoru Güncellemesi
                    if (!p.emotions) p.emotions = { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 };
                    
                    // Duyguların Doğal Erimesi
                    for (let key in p.emotions) {
                        if (key !== 'happiness') p.emotions[key] = Math.max(0, p.emotions[key] - 5);
                    }
                    
                    // Hormonlardan Duygulara Geçiş
                    if (p.bio.cortisol > 60) p.emotions.fear = Math.min(100, p.emotions.fear + 10);
                    if (p.bio.testosterone > 70 && p.bio.dopamine < 40) p.emotions.anger = Math.min(100, p.emotions.anger + 10);
                    if (p.bio.dopamine > 80) p.emotions.happiness = Math.min(100, p.emotions.happiness + 5);
                    else p.emotions.happiness = Math.max(0, p.emotions.happiness - 1);
                    
                    if (window.CrowdForm === 5) p.emotions.sadness = 100; // Ruhsuzluk evresinde tam çöküş
                    if (p.isJealous) p.emotions.disgust = Math.min(100, p.emotions.disgust + 20); // İğrenme/Tahammülsüzlük
                    
                    // PSİKOLOJİK TEORİLER: Değişkenlerin Başlatılması ve İşlenmesi
                    if (!p.psy) {
                        p.psy = { 
                            cognitiveAnxiety: 0, 
                            somaticAnxiety: 80, // Maça gergin başlarlar
                            selfEfficacy: 50, 
                            tunnelVision: false,
                            isCatastrophe: false,
                            intrinsicMotivation: (p.isCaptain || p.isYouthProduct) ? true : false
                        };
                    }

                    // 1. Somatik Kaygı (Somatic Anxiety): Maçın başlarında yüksek, stamina düştükçe azalır
                    if (window.gameMinutes < 15) {
                        p.psy.somaticAnxiety = Math.max(0, p.psy.somaticAnxiety - 2); // Eforla birlikte azalır
                    } else {
                        p.psy.somaticAnxiety = 0;
                    }

                    // 2. Bilişsel Kaygı (Cognitive Anxiety): Korku ve stresle eşzamanlı artar
                    p.psy.cognitiveAnxiety = p.emotions.fear || 0;

                    // 3. Uyarılma (Arousal) ve Yerkes-Dodson (Ters-U)
                    p.bio.arousal = p.bio.adrenaline + p.bio.cortisol;

                    // 4. Felaket Modeli (Catastrophe Theory)
                    if (p.bio.arousal > 90 && p.psy.cognitiveAnxiety > 60) {
                        p.psy.isCatastrophe = true;
                    } else {
                        p.psy.isCatastrophe = false;
                    }

                    // 5. Tünel Vizyonu (Attentional Control)
                    if (p.bio.cortisol > 80 || p.bio.arousal > 85) {
                        p.psy.tunnelVision = true;
                    } else {
                        p.psy.tunnelVision = false;
                    }

                    // 6. Kendi Kaderini Tayin (Intrinsic Motivation)
                    if (p.psy.intrinsicMotivation) {
                        // Dışsal faktörler ne olursa olsun, öz-yeterlilikleri çok düşmez
                        p.psy.selfEfficacy = Math.max(50, p.psy.selfEfficacy);
                    }
                };
                
                if (typeof homePlayers !== 'undefined') homePlayers.forEach(p => updateBiochemistry(p, true));
                if (typeof awayPlayers !== 'undefined') awayPlayers.forEach(p => updateBiochemistry(p, false));
                
                if (typeof window.updateCrowdForm === 'function') window.updateCrowdForm();
                
                // AÅžAMA 78: Bölünmüş Tribün Kaosu
                if (window.isCrowdDivided && typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.15) {
                    if (window.AudioManager) {
                        let c = new Audio('sounds/cheer.ogg'); c.volume = 0.5; c.play().catch(e=>{});
                        let b = new Audio('sounds/boo.ogg'); b.volume = 0.5; b.play().catch(e=>{});
                    }
                    if(typeof speak === 'function') speak("İnanılmaz bir kaos var! Tribünün bir tarafı takımı ıslıklarken, diğer taraf ıslıklayanları yuhalıyor. İç savaş çıktı resmen!");
                    
                    // Oyuncuların kafa karışıklığı ve odak kaybı
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            if (Math.random() < 0.4) p.isStunned = true; // Kime yaranacağını bilemez, donup kalır
                        });
                    }
                }
                
                // AÅžAMA 77: Form 5 (Umursamazlık Paradoksu)
                
                // AÅžAMA 81: Yan Form 4 (Organize Boykot)
                window.isOrganizedBoycott = false;
                if (typeof window.presidentConfidence !== 'undefined' && window.presidentConfidence < 30 && timeLeft > 45) {
                    window.isOrganizedBoycott = true;
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.05; // Ölüm sessizliği
                    
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.speed = (p.baseSpeed || 3) * 0.85; // Motor gücü eksikliği
                        });
                    }
                }
                
                // Form 6: Geçmişin Hayaletleri
                if (window.CrowdForm === 6) {
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.power = (p.power || 50) * 0.5; // Formanın kurşun gibi ağırlaşması (Åžut çekemez)
                            // İnisiyatif almaz
                            p.mistakes = 0; // Yan pas yapar
                        });
                    }
                    if (Math.random() < 0.005 && typeof speak === 'function') {
                        speak("Tribünler maçı tamamen bıraktı, efsane oyuncuların isimlerini bağırarak mevcut kadroyu protesto ediyorlar. Formalar kurşun gibi ağırlaştı, kimse sorumluluk almak istemiyor.");
                    }
                }
                
                // Form 7: Absürt Karnaval
                if (window.CrowdForm === 7) {
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.speed = (p.baseSpeed || 3) * 0.90; // Laubalilik
                            if (Math.random() < 0.05) p.mistakes = (p.mistakes || 0) + 1; // Konsantrasyon 0
                        });
                    }
                    if (Math.random() < 0.005 && typeof speak === 'function') {
                        speak("İnanılmaz görüntüler! Skorun hiçbir önemi kalmadığı için stadyumda adeta bir Meksika dalgası ve gece kulübü havası var. Oyuncular tamamen rehavete kapıldı!");
                    }
                }
                
                if (window.CrowdForm === 5) {
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.1; // Sadece uğultu/sohbet sesi
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            p.speed = (p.baseSpeed || 3) * 0.90; // Antrenman temposu
                            p.power = Math.min(p.power || 50, 30); // Vuracak şevk yok
                            p.mistakes = 0; // Baskı hissetmedikleri için panik de yok
                        });
                    }
                }
                
                // Sessizlik Protestosu Bitişi
                if (window.isSilentProtest && timeLeft <= 75) {
                    window.isSilentProtest = false;
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.6;
                    if(typeof speak === 'function') speak("Ve 15 dakikalık o korkutucu sessizlik protestosu bitti. Tribünler takıma tam destek vermeye başladı, oyuncular derin bir nefes aldı!");
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            p.speed = (p.speed || 3) / 0.8; // Normale döner
                        });
                    }
                }
              
              // --- YENİ: TEZAHÜRAT VE MORAL SİSTEMİ ---
              if (timeLeft % 10 === 0 && window.AudioManager && !window.AudioManager.isChanting) {
                  let sA = window.playerScore;
                  let sB = window.enemyScore;
                  
                  // Eğer fark 2 ise VEYA son 15 dakika galip isek
                  if (window.CrowdForm < 5 && (sA - sB >= 2 || (timeLeft <= 15 && sA > sB))) {
                      window.AudioManager.startChant(window.myTeamId || 'galatasaray');
                      // Oyunculara gaz ver (Güçlerini artır)
                      homePlayers.forEach(p => p.power += 2);
                      if(typeof speak === 'function') speak("Taraftar takımının muhteşem oyununu ayakta alkışlıyor ve şampiyonluk şarkıları söylüyor!");
                  }
              }
              // --- TEZAHÜRAT SİSTEMİ SONU ---
            let sb = document.getElementById('time-board');
            if(sb) {
                  if (window.isInjuryTime) {
                      sb.textContent = "90+" + (window.initialInjuryTime - timeLeft);
                      sb.style.color = '#ffcc00'; // Uzatma dakikaları sarı/turuncu gözüksün
                  } else {
                      sb.textContent = "Süre: " + timeLeft;
                  }
              }
            
            // AÅžAMA 28: Spiker Yorgunluk Uyarısı
            if (timeLeft === 30 && !fatigueAnnounced) {
                fatigueAnnounced = true;
                let msg = "Maçta son bölümlere giriyoruz. Oyuncuların pilleri bitti, sahada yürümeye başladılar. Hoca değişiklik yapmalı!";
                if(typeof speak === 'function') speak(msg);
                announcerText.textContent = msg;
            }
            
            // AÅžAMA 32: Rakip Bot Menajer Taktik Müdahalesi (Her 5 saniyede bir analiz)
            if (timeLeft % 5 === 0) {
                processOpponentManager();
            }
            
            if(timeLeft <= 0) {
                  if (!window.isInjuryTime && window.wastedTime > 0) {
                      window.isInjuryTime = true;
                      window.initialInjuryTime = window.wastedTime;
                      timeLeft = window.wastedTime;
                      window.wastedTime = 0;
                      
                      if (typeof speak === 'function') speak("Dördüncü hakem tabelayı kaldırdı. Maçın sonuna en az " + timeLeft + " dakika ilave edildi!");
                      if (typeof announcerText !== 'undefined') {
                          announcerText.textContent = "UZATMALAR: +" + timeLeft + " DAKİKA";
                          announcerText.style.color = "#ffcc00";
                      }
                      
                      // Uzatmalarda adrenalin fırlar
                      if (typeof homePlayers !== 'undefined') {
                          homePlayers.forEach(p => { if (p.bio) p.bio.adrenaline = Math.max(p.bio.adrenaline, 80); });
                      }
                      if (typeof awayPlayers !== 'undefined') {
                          awayPlayers.forEach(p => { if (p.bio) p.bio.adrenaline = Math.max(p.bio.adrenaline, 80); });
                      }
                  } else {
                      endGame();
                  }
              }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
}

function gameLoop(timestamp) {
    try {
    window.lastFrameTime = window.lastFrameTime || 0;
    
    if (timestamp) {
        let elapsed = timestamp - window.lastFrameTime;
        if (elapsed < 16) {
            window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
            return;
        }
        window.lastFrameTime = timestamp;
        
        // --- DELTA TIME EVENT LOOP ---
        if (!isPaused && gameActive && !window.isPreMatch) {
            window.timeAccumulator += elapsed;
            window.eventAccumulator += elapsed;
            
            if (window.timeAccumulator >= 10000) { // 10 saniyede bir (Oyun içi 1 dakika)
                window.timeAccumulator -= 10000;
                tickMatchMinute();
            }
            
            if (window.eventAccumulator >= 150000) { // 150 saniyede bir (Rastgele Olay)
                window.eventAccumulator -= 150000;
                if(typeof triggerRandomMatchEvent === 'function') triggerRandomMatchEvent();
            }
        }
    }
    window.lastFrameVx = window.lastFrameVx || 0;
    window.lastFrameVy = window.lastFrameVy || 0;

    // MANAGER STATS TRACKING (EVOLUTION)
    if (window.managerProfile === 'tarafsiz' && window.managerStats && window.myTeamId === 'home') {
        let form = window.currentFormation || '4-4-2';
        
        // Defansif veya 5'li savunma
        if (form.includes('Defansif') || form.includes('5-') || window.teamPsychology === 'park_the_bus') {
            window.managerStats.defensiveMinutes++;
        } 
        // Ofansif veya Pas odaklı
        else if (form.includes('Ofansif') || form.includes('Ortasaha Baskın') || form.includes('3-')) {
            window.managerStats.passingMinutes++;
        }
        
        // Genç Oyuncu Süresi (Sahada Tier 3 veya Tier 4 varsa)
        if (typeof homePlayers !== 'undefined') {
            let youngCount = homePlayers.filter(p => p.isTier3 || p.isTier4).length;
            window.managerStats.youngPlayerMinutes += youngCount;
        }
        
        // Kriz Çözme (Otorite düşükken veya krizdeyken maç kazandıran süreci takip ediyoruz)
        if (window.teamPsychology === 'chaos' && (window.playerScore >= window.enemyScore)) {
            // Kaostan çıkmak
            window.managerStats.crisisAvertedCount += 0.01; 
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    if (!gameActive) return;
    if (isPaused) {
        window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
        return;
    }
    
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        try {
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } catch(e){}
    }


    if (typeof isGameHalted !== 'undefined' && !isGameHalted && typeof homePlayers !== 'undefined') {
        homePlayers.forEach(p => {
            if (!p.isRedCarded && !p.hasBrokenDown) {
                // Uyarı aşaması (90-94 arası sinyaller)
                if (p.aggression >= 90 && !p.hasAggressionWarning && Math.random() < 0.002) {
                    p.hasAggressionWarning = true;
                    if(typeof speak === 'function') {
                        speak("Dikkat! " + p.name + " sahada çok gergin görünüyor. Sinirlerine hakim olmakta zorlanıyor, her an patlayabilir!");
                        if(typeof announcerText !== 'undefined') announcerText.textContent = p.name.toUpperCase() + " PATLAMAK ÜZERE!";
                    }
                }
                
                // Patlama aşaması (95 ve üzeri, anında değil zamanla)
                if (p.aggression >= 95 && Math.random() < 0.0001) {
                    p.hasBrokenDown = true;
                    isGameHalted = true;
                    haltReason = "SİNİR KRİZİ";
                    gameHaltTimer = Date.now() + 8000;
                    p.isRedCarded = true;
                    p.loyalty = 0;
                    p.happiness = "Sinir Krizi 🤬";
                    p.aggression = 50; 
                    
                    if (window.AudioManager) {
                        let boo = new Audio('sounds/boo.ogg'); boo.volume = 1.0; boo.play().catch(e=>{});
                    }
                    if(typeof speak === 'function') {
                        speak("İnanılmaz bir an! " + p.name + " sahada sinir krizi geçiriyor! Hakeme itirazlardan ve kontrolsüz hareketlerinden dolayı doğrudan kırmızı kart gördü ve formayı yere fırlatarak sahayı terk ediyor!");
                        if(typeof announcerText !== 'undefined') announcerText.textContent = p.name.toUpperCase() + " SİNİR KRİZİ GEÇİRDİ! KIRMIZI KART!";
                    }
                }
            }
        });
    }

    // AŞAMA 47: Kendi Oyuncunu Islıklama (Günah Keçisi)
    if (window.lastBallTeam === 'home' && ball.team === 'away') {
        let closestHome = (typeof homePlayers !== 'undefined' ? homePlayers : []).reduce((closest, p) => {
        if (p.isRedCarded) return closest;
        let d = Math.sqrt(Math.pow(p.x - ball.x, 2) + Math.pow(p.y - ball.y, 2));
                return (closest === null || d < closest.dist) ? {p: p, dist: d} : closest;
            }, null);
            if (closestHome && closestHome.p) {
                closestHome.p.mistakes = (closestHome.p.mistakes || 0) + 1;
                if (closestHome.p.psy && !closestHome.p.psy.intrinsicMotivation) {
                    closestHome.p.psy.selfEfficacy = Math.max(0, closestHome.p.psy.selfEfficacy - 10);
                }
                let mistakeThreshold = 3;
                if (window.currentFanProfile) {
                    if (window.currentFanProfile.profile === 'cekirdekci') mistakeThreshold = 2;
                    if (window.currentFanProfile.profile === 'oyuncu') {
                        mistakeThreshold = (window.idolPlayer && closestHome.p.name === window.idolPlayer.name) ? 999 : 1; // İdole sınırsız kredi, diğerlerine sıfır tolerans!
                    }
                    if (window.currentFanProfile.profile === 'nostaljik') {
                        mistakeThreshold = closestHome.p.isWorldClass ? 1 : (closestHome.p.isTier3 ? 999 : 3); // Yıldızlara sıfır tolerans, garibana sonsuz kredi
                    }
                }
                
                if (closestHome.p.mistakes >= mistakeThreshold && !closestHome.p.isBooedByOwnFans) {
                    // AÅžAMA 80: Yan Form 2 - Mesih Kompleksi (Kurtarıcıya Tapınma)
                    if (window.CrowdForm >= 3 && closestHome.p.isWorldClass) {
                         closestHome.p.isMessiah = true;
                         closestHome.p.mistakes = 0; // Taraftar hatasını anında siler
                         
                         if (window.AudioManager) {
                             let cheer = new Audio('sounds/cheer.ogg'); cheer.volume = 0.8; cheer.play().catch(e=>{});
                         }
                         if(typeof speak === 'function') {
                             let msg = "İnanılmaz bir çifte standart! Diğer oyuncular hata yapınca yuhalanıyor, ama stadyumun sevgilisi " + closestHome.p.name + " topu ezdiğinde büyük bir destek alkışı aldı!";
                             speak(msg);
                             if(typeof announcerText !== 'undefined') announcerText.textContent = "ÇİFTE STANDART: MESİH ALKIÅžLANDI!";
                         }
                         
                         // Takım içi ihanet ve kıskançlık
                         // Takım içi ihanet ve kıskançlık (Sadece kurnaz/zeki futbolcular bunu algılayıp cephe alır)
                         homePlayers.forEach(hp => {
                             if (hp !== closestHome.p) {
                                 // Kurnazlık (Oyun zekası / tecrübe) özelliği:
                                 let isCunning = hp.isTier2 || hp.isTier3 || Math.random() < 0.35; 
                                 if (isCunning) {
                                     hp.isJealous = true;
                                     hp.power = (hp.power || 50) * 0.7; // Hiyerarşi çöküşü
                                 }
                             }
                         });
                    } else if (window.CrowdForm >= 3) {
                        closestHome.p.isBooedByOwnFans = true;
                    } 
                    // AÅžAMA 82: Yan Form 5 - Formayı Çıkarttırma Terörü
                    if (closestHome.p.isBooedByOwnFans && closestHome.p.mistakes >= 6 && window.CrowdForm >= 4) {
                        if (!closestHome.p.isJerseyStripped) {
                            closestHome.p.isJerseyStripped = true;
                            
                            if (window.AudioManager) {
                                let boo = new Audio('sounds/boo.ogg'); boo.volume = 1.0; boo.play().catch(e=>{});
                            }
                            if(typeof speak === 'function') {
                                speak("Bütün stadyum koro halinde tek bir oyuncunun üzerine gidiyor! 'O formayı çıkar, defol git' tezahüratları yeri göğü inletiyor. Oyuncunun psikolojisi tamamen iflas etti, ağlayarak kenara 'beni değiştirin' işareti yapıyor!");
                                if(typeof announcerText !== 'undefined') announcerText.textContent = "FORMAYI ÇIKARTTIRMA TERÖRÜ!";
                            }
                            
                            // Oyuncunun futbol hayatı o saniye biter
                            closestHome.p.speed = (p.baseSpeed || 3) * 0.8;
                            closestHome.p.power = 0;
                            closestHome.p.isStunned = true; // Olduğu yerde donup kalır
                            
                            // 10 oyun saniyesi içinde değiştirilmezse formayı kendi çıkarır
                            setTimeout(() => {
                                // Not: window.homeBenchPlayers ve substitution logic'te isSubbedOut vb. kullanmalıyız.
                                if (closestHome.p.isJerseyStripped && closestHome.p.speed === 0) {
                                    if(typeof speak === 'function') speak("İNANILMAZ BİR AN! Oyuncu daha fazla dayanamadı, hocasını beklemeden formasını çıkartıp yere attı ve ağlayarak sahayı terk ediyor! Takım sahada 10 kişi kaldı!");
                                    closestHome.p.x = -1000;
                                    closestHome.p.y = -1000;
                                    closestHome.p.isRedCarded = true; 
                                }
                            }, 10000);
                        }
                    
                    closestHome.p.isBooedByOwnFans = true;
                    if(typeof speak === 'function') {
    let msgs = [
        closestHome.p.name + " sürekli top eziyor. Kendi taraftarı oyuncuyu ıslıklamaya başladı!",
        "Taraftarın sabrı taştı! " + closestHome.p.name + " topu her aldığında tribünlerden büyük bir protesto yükseliyor.",
        "Stadyumda soğuk rüzgarlar esiyor. Taraftar kendi oyuncusu " + closestHome.p.name + "'i yuhalayarak protesto ediyor!",
        closestHome.p.name + " için kabus gibi dakikalar! Taraftar her pas hatasını affetmiyor ve ıslıkla tepkisini gösteriyor."
    ];
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
}
                    if(typeof announcerText !== 'undefined') announcerText.textContent = "KENDİ OYUNCUSUNA YUHALAMA!";
                }
            }
        }
        if (window.AudioManager && window.AudioManager.triggerPossessionReaction && ball.team !== 'none') {
            window.AudioManager.triggerPossessionReaction(ball.team);
        }
        window.lastBallTeam = ball.team;
    }
    
    if (window.announcerBrain && ball.team !== 'none') {
        let isHome = (ball.team === 'home');
        let currentActive = null;
        if (isHome) {
            currentActive = activePlayer;
        } else {
            let closest = awayPlayers[0];
            let minD = 9999;
            for (let i=0; i<awayPlayers.length; i++) {
                let d = Math.sqrt(Math.pow(awayPlayers[i].x - ball.x, 2) + Math.pow(awayPlayers[i].y - ball.y, 2));
                if(d < minD) { minD = d; closest = awayPlayers[i]; }
            }
            currentActive = closest;
        }
        if (currentActive) {
            window.announcerBrain.watchPitch(currentActive, ball, isHome);
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    // AÅžAMA 47: Yönetim İstifa ve Sırt Dönme
    let deficit = window.enemyScore - window.playerScore;
    if (deficit >= 4) {
        if (!window.yonetimIstifaTriggered) {
            window.yonetimIstifaTriggered = true;
            if(typeof speak === 'function') {
    let msgs = [
        "Stadyumda 'Yönetim İstifa' sesleri yükseliyor! Taraftar sahaya sırtını döndü, bu büyük bir hezimet!",
        "İnanılmaz bir protesto var! Tribünlerin tamamı yönetimi ve hocayı istifaya davet ediyor.",
        "Bıçak kemiğe dayandı! Taraftar takıma inancını tamamen yitirdi ve beyaz mendiller sallanıyor.",
        "Bu ağır yenilginin faturası ağır olacak gibi duruyor. Taraftarlar hep bir ağızdan istifa çağrısı yapıyor."
    ];
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
}
            if(typeof announcerText !== 'undefined') announcerText.textContent = "YÖNETİM İSTİFA!";
        }
        window.managerAuthority -= 0.01; // Saniye saniye erir
        window.presidentConfidence -= 0.01;
        
        // Rakip takım pas yaparken kendi taraftarımız Oley çeker
        if (ball.team === 'away' && window.consecutivePasses >= 2 && Math.random() < 0.01 && window.CrowdForm === 4) {
             if(typeof speak === 'function') {
    let msgs = [
        "İnanılmaz! Taraftar rakip takım pas yaparken onlara 'Oley' çekiyor!",
        "Stadyum kendi takımını aşağılamak için rakibin her pasında 'Oley' diye bağırıyor. Çok acı bir tablo.",
        "Kendi taraftarlarından gelen bu alaycı tezahürat, ev sahibi oyuncuları psikolojik olarak tamamen çökertiyor.",
        "Rakip takım sanki kendi evinde gibi rahat pas yapıyor ve ev sahibi tribünlerden büyük alkış alıyor."
    ];
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
}
             if(typeof announcerText !== 'undefined') announcerText.textContent = "RAKİBE OLEY ÇEKİLİYOR!";
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    } else {
        window.yonetimIstifaTriggered = false;
    }

    if (ball.team === 'home' && ball.x > 600) {
        if (!window.isRhythmicClapping) {
            window.isRhythmicClapping = true;
            if (Math.random() < 0.4 && typeof speak === 'function') {
                let msgs = [
    "Tüm stadyum ritmik alkışa başladı, büyük bir baskı var!",
    "Bütün stadyum elleriyle aynı ritmi tutuyor! Hücum için müthiş bir itici güç!",
    "Tribünlerden yükselen ritmik alkışlar, rakip savunmanın dizlerini titretiyor.",
    "Taraftar takımı adeta ittiriyor! Åžut açısı arayan oyunculara muazzam bir destek!"
];
speak(msgs[Math.floor(Math.random() * msgs.length)]);
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    } else if (ball.x < 500 || ball.team === 'away') {
        window.isRhythmicClapping = false;
    }

    // AÅžAMA 46: Düşmanca Tribünler - Islık ve Hain Yuhalaması
    if (!window.traitorAssigned && typeof awayPlayers !== 'undefined' && awayPlayers.length > 0) {
        let exPlayer = awayPlayers.find(p => p.wasInUserTeam);
        if (exPlayer) {
            exPlayer.isTraitor = true;
        }
        window.traitorAssigned = true;
    }

    if (ball.team === 'away') {
        window.awayPossessionTime += 16; 
        
        // AÅžAMA 65: Rakibi İzole Etme (Sağır Edici Islık)
        if (window.awayPossessionTime > 200) { 
            if (Math.random() < 0.05) { 
                if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
                
                if (Math.random() < 0.50) {
                    ball.team = 'none'; 
                    ball.vx = -15; 
                    window.awayPossessionTime = 0;
                    if(typeof speak === 'function') speak("Sağır edici ıslık rakibi felç etti! Panikleyip topu kaptırdılar!");
                }
            }
        }
        
        // Rakip Serbest Vuruş Sabotajı
        if (window.isFreeKickZone && Date.now() < window.freeKickTimer) {
            if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
            if (Math.random() < 0.03) { 
                window.freeKickTimer = 0;
                window.isFreeKickZone = false;
                ball.team = 'home';
                ball.x = 400; ball.y = 250;
                if(typeof speak === 'function') speak("İnanılmaz ıslık rakibin aklını aldı! Serbest vuruşu panikle dağlara taşlara vurdular!");
            }
        } 
        
        let ballHolder = awayPlayers.find(p => Math.abs(p.x - ball.x) < 20 && Math.abs(p.y - ball.y) < 20);
        if (ballHolder && ballHolder.isTraitor) {
            ballHolder.speed *= 0.90; // Stresten yavaşlar
            if (Math.random() < 0.005 && typeof speak === 'function') {
                let msgs = [
    "Top eski oyuncularında... Bütün stadyum adeta öfke kusuyor!",
    "Top hain ilan ettikleri o isme geldiğinde kulakları sağır eden bir ıslık başlıyor!",
    "Tribünler ona zindan oldu! Ayağına top her değdiğinde inanılmaz bir protesto var.",
    "Stres seviyesi tavan yaptı! Eski takımına karşı oynarken yediği küfürler ayaklarını birbirine doluyor."
];
speak(msgs[Math.floor(Math.random() * msgs.length)]);
                if(typeof announcerText !== 'undefined') announcerText.textContent = "YUHHHH! HAİN!";
            }
        }
        
        if (window.awayPossessionTime > 3000) {
            if (Math.random() < 0.005 && typeof speak === 'function') {
                let msgs = [
    "Islıklamalar inanılmaz boyutlara ulaştı, rakip topu ayağından çıkarmak istiyor!",
    "Stadyum cehenneme döndü! Rakip takım kendi aralarında pas yaparken paniklemeye başladı.",
    "Muazzam bir ıslık tufanı var sayın seyirciler. Rakip oyuncuların birbiriyle iletişim kurması bile imkansız.",
    "Baskı çok arttı! Tribünler rakibi hataya zorlamak için desibel rekoru kırıyor."
];
speak(msgs[Math.floor(Math.random() * msgs.length)]);
            }
            if(typeof announcerText !== 'undefined' && Math.random() < 0.01) announcerText.textContent = "ISLIK TUFANI!";
            
            if (Math.random() < 0.01) { // %1 Pas Hatası / Top Kaybı (Her frame için)
                ball.team = 'none';
                ball.vx = -15; // Topu ileri kaptırır
                window.awayPossessionTime = 0;
                if(typeof speak === 'function') {
    let msgs = [
        "Rakip bu ıslık baskısına dayanamadı ve topu kaybetti!",
        "Paniklediler! Stadyumun uğultusu hata getirdi ve top bizde!",
        "Tribünler rakibe topu adeta kendi elleriyle iade ettirdi! Baskı sonuç verdi.",
        "Islıkların şiddetinden ayakları titredi ve topu ileri dikerek hataya zorlandılar!"
    ];
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
}
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    } else {
        window.awayPossessionTime = 0;
    }

    // AÅžAMA 42: OYUN DURAKSAMA KONTROLÜ
    if (typeof isGameHalted !== 'undefined' && isGameHalted) {
        if (haltReason === "VAR İNCELEMESİ" && !window.varDisciplineEventTriggered && Date.now() > gameHaltTimer - 4000) {
            window.varDisciplineEventTriggered = true;
            if (window.varPlayersNearIncident > 0 && Math.random() < 0.35) {
                if (Math.random() < 0.5) {
                    if(typeof speak === 'function') speak("Bu arada hakem çok sinirlendi! Pozisyona yakın olan ve hakemin VAR monitörüne gittiği İnceleme Alanına izinsiz giren bir oyuncuya sarı kart çıktı!");
                    if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (İnceleme Alanına Girme)";
                } else {
                    if(typeof speak === 'function') speak("Hakem inceleme yaparken bir sarı kart gösteriyor! Pozisyonu gözleriyle gören ve eliyle ısrarla 'televizyon' işareti çizip Aşırı VAR İtirazında bulunan oyuncu sarı kart gördü.");
                    if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Aşırı VAR İtirazı)";
                }
            }
        }

        if (Date.now() > gameHaltTimer) {
            isGameHalted = false;
            
            if (haltReason === "VAR İNCELEMESİ") {
                if (Math.random() < 0.5) {
                    if (Math.random() < 0.6) {
                        haltReason = "PENALTI İTİRAZLARI";
                        gameHaltTimer = Date.now() + 6000;
                        isGameHalted = true;
                        if(typeof speak === 'function') speak("Hakem kararını verdi! Penaltı! Beyaz noktayı gösteriyor! Ancak savunma oyuncuları çileden çıkmış durumda, karara yoğun bir itiraz var. Atışı kullanacak oyuncu topu eline aldı ama rakip oyuncular etrafından ayrılmıyor.");
                        if(typeof announcerText !== 'undefined') announcerText.textContent = "BÜYÜK İTİRAZ VAR!";
                    } else {
                        if(typeof speak === 'function') speak("Hakem kararını verdi! Penaltı! Beyaz noktayı gösteriyor!");
                        window.isPenaltyKick = true;
                        window.penaltyTimer = Date.now() + 5000;
                        ball.team = 'home';
                        ball.x = 700;
                        ball.y = 250;
                    }
                } else {
                    if(typeof speak === 'function') speak("Hakem monitörden ayrıldı... Oyunu devam ettiriyor! Müdahalenin temiz olduğuna karar verdi.");
                    ball.team = 'none';
                }
            } else if (haltReason === "OYUNCU DEÄžİÅžİKLİÄžİ") {
                if(typeof speak === 'function') speak("Hakem işaretini verdi, yeni oyuncu sahada. Oyun tekrar başlıyor.");
                ball.team = 'none';
            } else if (haltReason === "KORNER") {
                // [YENİ] Sistemik Duran Top Organizasyonu (Hücum)
                executeCornerKick(false);
                
                // Oyunu ortaya veya kaleciye döndür (Çünkü korner işlendi)
                ball.team = 'none';
                ball.x = 400;
                ball.y = 250;
            } else if (haltReason === "KORNER (DEPLASMAN)") {
                // [YENİ] Sistemik Duran Top Organizasyonu (Savunma)
                executeCornerKick(true);
                
                ball.team = 'none';
                ball.x = 400;
                ball.y = 250;
            } else if (haltReason === "SERBEST VURUŞ") {
                // [YENİ] Sistemik Serbest Vuruş Organizasyonu
                executeFreeKick(false);
                
                ball.team = 'none';
                ball.x = 400;
                ball.y = 250;
            } else if (haltReason === "SERBEST VURUŞ (DEPLASMAN)") {
                executeFreeKick(true);
                
                ball.team = 'none';
                ball.x = 400;
                ball.y = 250;
            } else if (haltReason === "TAÇ ATIŞI") {
                window.executeThrowIn(false);
                
                ball.team = 'none';
                ball.x = 400;
                ball.y = 250;
            } else if (haltReason === "TAÇ ATIŞI (DEPLASMAN)") {
                window.executeThrowIn(true);
                
                ball.team = 'none';
                ball.x = 400;
                ball.y = 250;
            } else if (haltReason === "PENALTI İTİRAZLARI") {
                if(typeof speak === 'function') speak("Hakem sonunda etrafı boşaltmayı başardı. Penaltıyı atacak oyuncuya onay verdi, atış şimdi kullanılacak.");
                window.isPenaltyKick = true;
                window.penaltyTimer = Date.now() + 5000;
                ball.team = 'home';
                ball.x = 700;
                ball.y = 250;
            } else if (window.pendingPenalty) {
                if (Math.random() < 0.6) {
                    haltReason = "PENALTI İTİRAZLARI";
                    gameHaltTimer = Date.now() + 6000;
                    isGameHalted = true;
                    if(typeof speak === 'function') speak("Beyaz noktayı gösterdi! Penaltı! Savunma oyuncuları çileden çıkmış durumda, karara yoğun bir itiraz var. Atışı kullanacak oyuncu topu eline aldı ama rakip oyuncular etrafından ayrılmadığı için hakem atış için düdüğünü çalamıyor.");
                    if(typeof announcerText !== 'undefined') announcerText.textContent = "BÜYÜK İTİRAZ VAR!";
                } else {
                    if(typeof speak === 'function') speak("Hakem düdüğünü çaldı, penaltı atışı kullanılacak!");
                    window.isPenaltyKick = true;
                    window.penaltyTimer = Date.now() + 5000;
                    ball.team = 'home';
                    ball.x = 700;
                    ball.y = 250;
                }
                window.pendingPenalty = false;
            } else if (haltReason === "İZİNSİZ EKİPMAN" || haltReason === "TEKNİK EKİBE İHTAR" || haltReason === "DEGAJI ENGELLEMEK" || haltReason === "PENALTI İHLALİ") {
                if (haltReason === "PENALTI İHLALİ") {
                    if(typeof speak === 'function') speak("Penaltı atışı için hakem tekrar işaretini verecek.");
                } else {
                    if(typeof speak === 'function') speak("Hakem işaretini verdi, oyun kaldığı yerden devam ediyor.");
                    ball.team = 'none'; // Serbest bırak
                }
            } else if (haltReason === "BARAJ VE İTİÅžME") {
                if(typeof speak === 'function') speak("Hakem oyuncuları sert bir dille uyardı. Åžimdi işaretini verdi, atış kullanılacak.");
                ball.team = 'none';
                window.isFreeKickZone = true;
                window.freeKickTimer = Date.now() + 5000;
            } else {
                let isDangerousFreeKick = (ball.x > 500 && ball.x < 700);
                let hasAggressivePlayer = typeof homePlayers !== 'undefined' && (homePlayers.some(p => p.mentalTrait === 'aggressive') || awayPlayers.some(p => p.mentalTrait === 'aggressive'));

                if (isDangerousFreeKick && hasAggressivePlayer && Math.random() < 0.4) {
                    // AÅžAMA 62: Baraj ve Ceza Sahası İçi İtişmeler
                    haltReason = "BARAJ VE İTİÅžME";
                    gameHaltTimer = Date.now() + 6000;
                    isGameHalted = true; // Oyunu tekrar durdur
                    if(typeof speak === 'function') speak("Çok tehlikeli bir nokta! Hakem düdüğünü çaldı ve barajı 9.15'e çekiyor. Ceza sahası içi şu an adeta bir güreş minderi gibi. Hakem oyuncuları uyarmak için oyunu durdurdu, atışın yapılmasına henüz izin vermiyor.");
                    if(typeof announcerText !== 'undefined') announcerText.textContent = "CEZA SAHASINDA GERGİNLİK!";
                } else {
                    if(typeof speak === 'function') speak("Hakem işaretini verdi, oyun kaldığı yerden serbest vuruşla devam ediyor.");
                    ball.team = 'none'; // Top boşa düşer (serbest vuruş hissi)
                    
                    if (isDangerousFreeKick) {
                        window.isFreeKickZone = true;
                        window.freeKickTimer = Date.now() + 5000; // 5 saniye içinde vurulursa frikiktir
                    }
                }
            }
        } else {
            // Sadece statik çizim yap, update çalıştırma
            if (ctx) {
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(0, 0, 800, 500);
                
                homePlayers.forEach(p => {
                    if (p.isRedCarded) return;
                    ctx.fillStyle = p.isUserControlled ? '#e74c3c' : (p.hasYellowCard ? '#f1c40f' : (p.isInjured ? '#8e44ad' : '#3498db'));
                    ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
                });
                awayPlayers.forEach(p => {
                    if (p.isRedCarded) return;
                    ctx.fillStyle = p.hasYellowCard ? '#f1c40f' : (p.isInjured ? '#8e44ad' : '#e67e22');
                    ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
                });
                ctx.fillStyle = '#ecf0f1';
                ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI*2); ctx.fill();
                
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(0, 0, 800, 500);
                ctx.fillStyle = "white";
                ctx.font = "bold 30px Arial";
                ctx.textAlign = "center";
                ctx.fillText("OYUN DURDU", 400, 200);
                  ctx.font = "bold 20px Arial";
                  ctx.fillText(haltReason, 400, 240);
                  
                  // VAR GÖRSEL ÇİZİMİ
                  if (typeof window.varStatus !== 'undefined' && window.varStatus !== 'none') {
                      let timeRemaining = window.varTimer - Date.now();
                      
                      if (window.varStatus === 'monitor' && timeRemaining < 25000 && !window.varDisciplineEventTriggered) {
                          window.varDisciplineEventTriggered = true;
                          if (window.varPlayersNearIncident > 0 && Math.random() < 0.35) {
                              if (Math.random() < 0.5) {
                                  if(typeof speak === 'function') speak("Bu arada hakem çok sinirlendi! Pozisyona yakın olan ve hakemin VAR monitörüne gittiği İnceleme Alanına izinsiz giren bir oyuncuya sarı kart çıktı!");
                                  if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (İnceleme Alanına Girme)";
                              } else {
                                  if(typeof speak === 'function') speak("Hakem inceleme yaparken bir sarı kart gösteriyor! Pozisyonu bizzat gören ve eliyle ısrarla 'televizyon' işareti çizip Aşırı VAR İtirazında bulunan oyuncu sarı kart gördü.");
                                  if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Aşırı VAR İtirazı)";
                              }
                          }
                      }
                      
                      // 1. Mavi Çizgi (Savunma)
                      if (timeRemaining < 30000 || window.varStatus !== 'monitor') {
                          window.varLineDefX = window.varScoringTeam === 'home' ? 700 : 100;
                          ctx.strokeStyle = 'blue'; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(window.varLineDefX, 50); ctx.lineTo(window.varLineDefX, 450); ctx.stroke();
                      }
                      
                      // 2. Kırmızı Çizgi (Hücum) gerilimle çekilir
                      if (timeRemaining < 15000 || (window.varStatus !== 'monitor' && timeRemaining < 8000)) {
                          let offsetX = window.varDecision === 'offside' ? 20 : -20;
                          if (window.varScoringTeam === 'away') offsetX *= -1; // Yön değişimi
                          window.varLineAttX = window.varLineDefX + offsetX;
                          
                          ctx.strokeStyle = 'red'; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(window.varLineAttX, 50); ctx.lineTo(window.varLineAttX, 450); ctx.stroke();
                          
                          ctx.fillStyle = 'white'; ctx.font = "14px Arial";
                          ctx.fillText("OFSAYT ÇİZGİSİ ÇEKİLİYOR...", 400, 280);
                      }
                      
                      // KARAR ANI
                      if (timeRemaining <= 0) {
                          if (window.varDecision === 'offside') {
                              if(typeof speak === 'function') speak("VE KARAR OFSAYT! Gol iptal ediliyor. Savunma takımı derin bir nefes aldı!");
                              if(typeof announcerText !== 'undefined') announcerText.textContent = "GOL İPTAL - OFSAYT!";
                              // Skoru geri al
                              if (window.varScoringTeam === 'home') window.playerScore--;
                              else window.enemyScore--;
                              updateScoreBoard();
                              
                              // Hayal Kırıklığı ve Dopamin Değişimi
                              let attTeam = window.varScoringTeam === 'home' ? homePlayers : awayPlayers;
                              let defTeam = window.varScoringTeam === 'home' ? awayPlayers : homePlayers;
                              attTeam.forEach(p => { if(p.emotions) { p.emotions.sadness = 100; p.emotions.happiness = 0; } });
                              defTeam.forEach(p => { if(p.bio) p.bio.dopamine = 100; });
                          } else {
                              if(typeof speak === 'function') speak("GOL GEÇERLİ! VAR odası ofsayt olmadığını tespit etti.");
                              if(typeof announcerText !== 'undefined') announcerText.textContent = "GOL KARARI ONAYLANDI!";
                          }
                          window.varStatus = 'none';
                          isGameHalted = false; // Oyun başlar
                          if (window.AudioManager) window.AudioManager.ambiance.volume = 0.4;
                      }
                  }
                  
                  ctx.textAlign = "left"; // reset
            }
            window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
            return;
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    // IFAB KURALLARI KONTROLÜ (Kaleci ve Altıpas İhlalleri)
    if (!isGameHalted && ball.team !== 'none') {
        let allPlayers = homePlayers.concat(awayPlayers);
        for (let i = 0; i < allPlayers.length; i++) {
            let p1 = allPlayers[i];
            let dist = Math.hypot(p1.x - ball.x, p1.y - ball.y);
            
            // GK Kural İhlali (Ceza Sahası Dışı Elle Oynama)
            if (p1.position === 'Kaleci' && dist < 15) {
                let isHome = homePlayers.includes(p1);
                let inBox = false;
                if (isHome) {
                    if (p1.x >= 0 && p1.x <= 150 && p1.y >= 100 && p1.y <= 400) inBox = true;
                } else {
                    if (p1.x >= 650 && p1.x <= 800 && p1.y >= 100 && p1.y <= 400) inBox = true;
                }
                
                if (!inBox && !p1.isRedCarded && Math.random() < 0.03) {
                    p1.isRedCarded = true;
                    isGameHalted = true;
                    haltReason = "KIRMIZI KART";
                    if(typeof gameHaltTimer !== 'undefined') gameHaltTimer = Date.now() + 4000;
                    if(typeof speak === 'function') speak("İnanılmaz bir an! Kaleci ceza sahası dışında topa eliyle müdahale etti! Hakem tereddütsüz Kırmızı Kart gösteriyor!");
                }
            }
            
            // GK Dokunulmazlık (Altıpas İçi Åžarj Faulü)
            if (p1.position === 'Kaleci' && dist < 30) {
                let isHome = homePlayers.includes(p1);
                let in6yd = false;
                if (isHome) {
                    if (p1.x >= 0 && p1.x <= 55 && p1.y >= 170 && p1.y <= 330) in6yd = true;
                } else {
                    if (p1.x >= 745 && p1.x <= 800 && p1.y >= 170 && p1.y <= 330) in6yd = true;
                }
                
                if (in6yd) {
                    for (let j = 0; j < allPlayers.length; j++) {
                        let p2 = allPlayers[j];
                        if (p2 !== p1 && homePlayers.includes(p1) !== homePlayers.includes(p2) && !p2.isRedCarded) {
                            let pDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                            if (pDist < 15 && Math.random() < 0.2) {
                                p2.hasYellowCard = true;
                                isGameHalted = true;
                                haltReason = "KALECİYE ÅžARJ (HÜCUM FAUL)";
                                if(typeof gameHaltTimer !== 'undefined') gameHaltTimer = Date.now() + 4000;
                                if(typeof speak === 'function') speak("Hakem düdüğünü çalıyor! Altıpas içinde kaleciye şarj var. Bu bir hücum faul ve sarı kart çıkıyor!");
                            }
                        }
                    }
                }
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    if (ctx) {
        ctx.fillStyle = '#27ae60'; // Çim Rengi
        ctx.fillRect(0, 0, 800, 500);

        // Çizgi Rengi ve Kalınlığı
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        
        ctx.strokeRect(0, 0, 800, 500); // Dış Çerçeve
        
        // IFAB KURAL 5: KORNER YAYLARI (1 metre = 10px yarı çap)
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, 0.5*Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(800, 0, 10, 0.5*Math.PI, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 500, 10, 1.5*Math.PI, 2*Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(800, 500, 10, Math.PI, 1.5*Math.PI); ctx.stroke();
        
        // IFAB KURAL 6: TEKNİK ALAN (Yedek Kulübesi Önü Kesik Çizgiler)
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(200, 480, 100, 20); // Ev sahibi teknik alan
        ctx.strokeRect(500, 480, 100, 20); // Deplasman teknik alan
        ctx.setLineDash([]);
        
        // Orta Çizgi ve Yuvarlak
        ctx.beginPath(); ctx.moveTo(400, 0); ctx.lineTo(400, 500); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 250, 50, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 250, 3, 0, Math.PI*2); ctx.fill();

        // Ev Sahibi Ceza Sahası ve Altıpas
        ctx.strokeRect(0, 100, 150, 300); // Ceza Sahası
        ctx.strokeRect(0, 170, 55, 160); // Altıpas
        ctx.beginPath(); ctx.arc(110, 250, 3, 0, Math.PI*2); ctx.fill(); // Penaltı Noktası
        ctx.beginPath(); ctx.arc(110, 250, 50, -0.927, 0.927); ctx.stroke(); // Penaltı Yayı

        // Deplasman Ceza Sahası ve Altıpas
        ctx.strokeRect(650, 100, 150, 300); // Ceza Sahası
        ctx.strokeRect(745, 170, 55, 160); // Altıpas
        ctx.beginPath(); ctx.arc(690, 250, 3, 0, Math.PI*2); ctx.fill(); // Penaltı Noktası
        ctx.beginPath(); ctx.arc(690, 250, 50, Math.PI - 0.927, Math.PI + 0.927); ctx.stroke(); // Penaltı Yayı
    }

    if (ball.team === 'home' && activePlayer && !strikerRunActive && Math.random() < 0.003) {
        let bestStriker = null;
        let maxX = -999;
        homePlayers.forEach(p => {
            if (p !== activePlayer && p.x > maxX) { maxX = p.x; bestStriker = p; }
        });
        if (bestStriker) {
            strikerRunActive = true;
            strikerRunTimer = Date.now() + 3000;
            currentStriker = bestStriker;
            if(typeof speak === 'function') speak("Forvet savunmanın arkasına koşu yapıyor, ara pası bekliyor!");
            announcerText.textContent = "Forvet defans arkasına sarktı!";
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    if (strikerRunActive && Date.now() > strikerRunTimer) {
        strikerRunActive = false;
        currentStriker = null;
    }

    homePlayers.forEach(p => {
        
        updatePlayer(p, 'home');
    });
    awayPlayers.forEach(p => {
        
        updatePlayer(p, 'away');
    });

    
    // AÅžAMA 63: Ateşleyici Uğultu (Momentum Dalgası)
    if (window.playerScore < window.enemyScore || window.isCornerKickZone) {
        if (!window.momentumActive) {
            window.momentumActive = true;
            if(typeof speak === 'function') speak("Tribünlerden ateşleyici bir uğultu yükseliyor! Laktik asit unutuldu, takım çılgın gibi basıyor!");
        }
        // Her frame'de stamina fullenir ve takım aşırı baskı yapar
        homePlayers.forEach(p => {
            p.stamina = 100;
            if (ball.team === 'away') {
                let dx = ball.x - p.x; let dy = ball.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let presSpd = (p.speed || 3) * 2.5; 
                if(dist > 0 && p.x > 200) { p.x += (dx/dist)*presSpd; p.y += (dy/dist)*presSpd; }
            }
        });
    } else {
        if (window.momentumActive) {
            window.momentumActive = false;
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    
    // AÅžAMA 67: Protesto ve Erken Teslimiyet Ses Efektleri
    let isEarlyDefeat = window.CrowdForm >= 3;
          let isProtestActive = window.CrowdForm === 4;

    
      // AÅžAMA 75: Stadyumu Terk Etme (En Ağır Ceza)
      let isStadiumAbandoned = (window.CrowdForm === 4) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);
      
      if (isStadiumAbandoned) {
          if (!window.abandonmentAnnounced) {
              window.abandonmentAnnounced = true;
              if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
              if(typeof speak === 'function') speak("İnanılmaz görüntüler! Stadyumdaki on binlerce taraftar, takımlarının bu rezil futbolunu daha fazla izlememek için tribünleri boşaltıyor! Yuhalamıyorlar, ıslıklamıyorlar, sadece terk ediyorlar! Futbolcular için yerin dibine girme anı.");
              if(typeof announcerText !== 'undefined') announcerText.textContent = "STADYUM BOÅžALIYOR! TARAFTAR TERK ETTİ!";
              
              // Yönetime büyük darbe
              window.managerAuthority = 0;
              window.presidentConfidence = 0;
          }
          
          // Sahadaki Ruhsuzluk (Fiziken Maçı Bırakırlar)
          if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
          if (typeof homePlayers !== 'undefined') {
              homePlayers.forEach(p => {
                  // p.stamina = 0; kaldırıldı
                  p.speed = (p.baseSpeed || 3) * 0.85; // Hafif moral çöküntüsü
                  p.power = 1; // Åžut veya pas atamazlar
              });
          }
      } else if (isProtestActive) {
        if (!window.protestAnnounced) {
            window.protestAnnounced = true;
            if(window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.8;
            
            // Yönetim İstifa sesini çalmayı dener
            let istifaAudio = new Audio('sounds/istifa.ogg');
            istifaAudio.volume = 1.0;
            istifaAudio.play().catch(e => {
                // Dosya yoksa sadece yuhalama sesi çalar
                if(window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
            });
            if(typeof speak === 'function') speak("Tribünler maçı tamamen bıraktı! 'Yönetim İstifa' protestoları stadyumu inletiyor, sahada futbol oynamak artık imkansız! Takımın inancı tamamen bitti.");
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    } else if (isEarlyDefeat) {
        if (!window.silenceAnnounced) {
            window.silenceAnnounced = true;
            if(window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
            if(typeof speak === 'function') speak("Erken gelen gol stadyuma ölüm sessizliği çöktürdü! Taraftar adeta tiyatro izleyicisine dönüştü, ev sahibi avantajı tamamen bitti.");
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    
    // AÅžAMA 69: Tribün Penaltı Baskısı (Desibel ile Karar Bükme)
    if (window.CrowdForm <= 2 && ball.team === 'away' && ball.x > 650 && typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.005) {
        if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
        
        if (window.refereeExperience === 'rookie' && Math.random() < 0.03) { // Taraftar baskısı penaltı ihtimali düşürüldü
            isGameHalted = true; 
            window.pendingPenalty = true;
            gameHaltTimer = Date.now() + 3000;
            haltReason = "PENALTI - TARAFTAR BASKISI";
            if(typeof speak === 'function') speak("Ceza sahasında ufak bir temas... Tribünler ayağa fırladı, devasa bir uğultu koptu! Hakem o sese dayanamayıp penaltıyı çaldı! İnanılmaz bir baskı!");
        } else {
            if(typeof speak === 'function') speak("Tribünler penaltı diye ayaklandı ama tecrübeli hakem oralı bile olmuyor, oyna diyor!");
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    if (ball.team === 'none') {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;
        
        // [YENİ] VÜCUDA ÇARPMA (DEFLECTION) VE ASİST MANTIĞI
        if (Math.abs(ball.vx) > 3 || Math.abs(ball.vy) > 3) {
            homePlayers.forEach(p => {
                if (p && p !== (typeof lastShooter !== 'undefined' ? lastShooter : null)) {
                    let dx = ball.x - p.x;
                    let dy = ball.y - p.y;
                    if (Math.sqrt(dx*dx + dy*dy) < 15) {
                        // Top vücuduna çarptı!
                        ball.vx += (Math.random() - 0.5) * 4;
                        ball.vy += (Math.random() - 0.5) * 4;
                        window.lastPasser = p; // Eğer gol olursa asist ona yazılacak
                    }
                }
            });
        }
        
        if (ball.x > 800 && ball.y > 200 && ball.y < 300) {
            // KURAL 3: Topu Çizgiden Elle Kesme (Suarez Kurtarışı)
            if (Math.random() < 0.015) { 
                ball.x = 790; ball.vx = 0; ball.vy = 0; ball.team = 'none';
                if (typeof isGameHalted !== 'undefined') {
                    isGameHalted = true;
                    window.pendingPenalty = true; // Penaltı!
                    gameHaltTimer = Date.now() + 6000;
                    haltReason = "KIRMIZI KART (ÇİZGİDEN ELLE ÇIKARMA)";
                    if(typeof speak === 'function') speak("İnanılmaz bir an! Top tam ağlara giderken savunma oyuncusu kaleci gibi uçarak topu çizgiden eliyle çıkardı! Hakem penaltı noktasını gösteriyor ve o oyuncuya doğrudan kırmızı kart!");
                    if(typeof announcerText !== 'undefined') announcerText.textContent = "KIRMIZI KART VE PENALTI!";
                }
                window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
                return; // Golü iptal et, döngüyü atla!
            }

            let deficitBeforeGoal = window.enemyScore - window.playerScore;
            window.playerScore++; ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
            window.wasPenaltyKick = false;
            
            // [ÖDÜL SİSTEMİ]: Tribünlerin Sevgilisi
            if (typeof lastShooter !== 'undefined' && lastShooter && window.CrowdForm >= 3) {
                lastShooter.isChantedByFans = true;
                lastShooter.morale = 100; // Morali kilitlenir
                if(typeof speak === 'function') {
                    setTimeout(() => speak("Bütün stadyum ıslıklanırken bu gol ilaç gibi geldi! Tribünler protestoyu kesti ve sadece " + lastShooter.name + " tezahüratları yapıyor! O artık tribünlerin sevgilisi!"), 6000);
                }
                window.CrowdForm = 1; // Tribün barışır
            }

            // GOAL LOGGING
            window.lastMatchGoalEvents = window.lastMatchGoalEvents || [];
            let scorerName = (typeof lastShooter !== 'undefined' && lastShooter && lastShooter.name) ? lastShooter.name : "Kendi Kalesine";
            let gMin = typeof timeLeft !== 'undefined' ? (90 - Math.floor(timeLeft)) : 45;
            if (gMin < 1) gMin = 1;
            window.lastMatchGoalEvents.push({ team: 'home', scorer: scorerName, min: gMin });
            window.lastMatchScore = { home: window.playerScore, away: window.enemyScore };
            
            // STATS LOGGING
            if (typeof lastShooter !== 'undefined' && lastShooter) {
                if (!window.isFriendlyMatch) {
                    lastShooter.seasonGoals = (lastShooter.seasonGoals || 0) + 1;
                    let dbPlayer = window.leagueData.players.find(x => x.id === lastShooter.id);
                    if (dbPlayer) {
                        dbPlayer.seasonGoals = (dbPlayer.seasonGoals || 0) + 1;
                        dbPlayer.careerGoals = (dbPlayer.careerGoals || 0) + 1;
                        if (typeof window.checkDalya === 'function') window.checkDalya(dbPlayer);
                    }
                    
                    // ASİST KONTROLÜ
                    if (typeof window.lastPasser !== 'undefined' && window.lastPasser && window.lastPasser !== lastShooter) {
                        window.lastPasser.seasonAssists = (window.lastPasser.seasonAssists || 0) + 1;
                        let dbPasser = window.leagueData.players.find(x => x.id === window.lastPasser.id);
                        if (dbPasser) {
                            dbPasser.seasonAssists = (dbPasser.seasonAssists || 0) + 1;
                            dbPasser.careerAssists = (dbPasser.careerAssists || 0) + 1;
                            if (typeof window.checkDalya === 'function') window.checkDalya(dbPasser);
                        }
                    }
                }
                if (lastShooter.isJubileeMatch) {
                    setTimeout(() => {
                        if(typeof speak === 'function') speak("GÖZYAŞLARI SEL OLDU! " + lastShooter.name + " veda maçında golünü attı! Tüyler diken diken...");
                    }, 5000);
                }
                                // [YENİ] EVENT TABANLI BAŞARI TETİKLEYİCİ (RECOVERY)
                window.triggerPsychEvent(lastShooter, 'success');
                // Gol atan çok yüksek moral kazanır, özel eklenti
                lastShooter.morale = Math.min(100, lastShooter.morale + 15); 
                homePlayers.forEach(p => {
                    if (p !== lastShooter) window.triggerPsychEvent(p, 'success');
                });
            }
            
              if (typeof window.triggerVAR === 'function') window.triggerVAR('home');
            
            if (ball.isFreeKickShot) {
                if(typeof speak === 'function') speak("Nefesler tutuldu... Ölü yaprak vuruşu! Top havada kavis çiziyor ve tam köşeden ağlarda!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "FRİKİK GOLÜ! ÖLÜ YAPRAK!";
            } else if (window.isCounterAttack && Date.now() < window.counterAttackTimer) {
                if(typeof speak === 'function') speak("Savunmayı eksik yakaladılar! Fişek gibi fırladı, arkasına bile bakmıyor... Köşeye bırakıyor ve gol!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "KONTRATAK GOLÜ!";
                window.isCounterAttack = false;
            } else if (window.isReboundActive && Date.now() < window.reboundTimer) {
                if(typeof speak === 'function') {
                    if (window.isPenaltyReboundActive) {
                        speak("Mükemmel bir takip! Dönen topu ceza sahasına fırlayan oyuncu affetmiyor! Harika bir organizasyon golü!");
                    } else {
                        speak("Ceza sahası içi ana baba günü... Top bir o yana bir bu yana gidiyor, seken topu son anda tamamlıyor! Tabela değişti!");
                    }
                }
                if(typeof announcerText !== 'undefined') announcerText.textContent = window.isPenaltyReboundActive ? "DÖNEN TOP GOLÜ!" : "KARAMBOL GOLÜ!";
                window.isReboundActive = false; // Karambol bitti
                window.isPenaltyReboundActive = false;
            } else if (ball.isBicycleKick) {
                if(typeof speak === 'function') speak("Top ağlarda! Bu gol yıllarca unutulmaz! Akıllara zarar bir röveşata golü!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "YILIN GOLÜ! RÖVEÅžATA!";
            } else if (ball.isZeroAngleShot) {
                if(typeof speak === 'function') speak("İmkansız bir açı! Oradan nasıl vurdu?! Fizik kurallarına aykırı bir gol! Kaleci bile topun oradan nasıl geçtiğini anlayamadı!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "İMKANSIZ AÇI! SIFIRDAN GOL!";
            } else if (ball.isBackheelShot) {
                if(typeof speak === 'function') speak("İnanılmaz bir zeka! Topukla bıraktı! Savunmanın aklıyla oynadı resmen, böyle bir klas buralarda zor görülür!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "KLAS TOPUK GOLÜ!";
            } else if (ball.isChipShot) {
                if(typeof speak === 'function') speak("Ne yaptın sen! Kaleciyi adeta ipe dizdi, üzerinden zarifçe aşırtıyor... Bu bir gol değil, bir sanat eseri!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "AÅžIRTMA KLAS GOL!";
            } else if (ball.shotOriginX && ball.shotOriginX < 600) { // Ceza sahası dışı (Uzaktan)
                if(typeof speak === 'function') speak("Vurduuu ve gol! İnanılmaz bir füze! Kalecinin bunu görmesi bile imkansızdı!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "UZAKTAN FÜZE!";
            } else if (ball.isHeaderShot) {
                if(typeof speak === 'function') speak("Harika bir orta geldi! Herkesten yükseğe sıçrıyor! Çok sert bir kafa vuruşu ve goool!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "HARİKA KAFA GOLÜ!";
            } else {
                if(typeof speak === 'function') speak("Goolll! Top ağlarda!");
            }
            
            if (deficitBeforeGoal >= 2) {
                // AÅžAMA 45: Comeback (Geri Dönüş) Uğultusu
                window.isComebackActive = true;
                window.comebackTimer = Date.now() + 30000; // 30 saniye sürer
                if(typeof speak === 'function') setTimeout(() => speak("Tribünler çıldırdı! Fark 1'e indi! Bu stadyum artık rakipler için bir cehennem, takım uçuşa geçti!"), 2000);
                if(typeof announcerText !== 'undefined') announcerText.textContent = "STADYUM YIKILIYOR! GERİ DÖNÜÅž ATEÅžİ!";
            }
            
            if (lastShooter === homePlayers[10]) {
                strikerConfidence = 100;
                strikerMissedShots = 0;
            }
            lastShooter = null;
        } else if (ball.x > 800) {
            // AÅžAMA 50: Direkten Dönme ve Karambol
            let isPenaltyRebound = window.wasPenaltyKick && Math.random() < 0.40;
            if (isPenaltyRebound || (Math.random() < 0.25 && ball.y > 150 && ball.y < 350)) { // Kale direğine yakınsa veya penaltı rebound ise
                ball.x = 790;
                ball.vx = -ball.vx * 0.6; // Top kaleciden veya direkten geri seker
                ball.vy = (Math.random() - 0.5) * 15;
                window.isReboundActive = true;
                window.isPenaltyReboundActive = isPenaltyRebound;
                window.reboundTimer = Date.now() + 4000; // 4 saniye içinde gol olursa karamboldür
                if(typeof speak === 'function') {
                    if (isPenaltyRebound) speak("Kaleci kurtardı! Ama yayın üzerinde bekleyen oyuncular anında ceza sahasına daldı! Dönen top takibi inanılmaz!");
                    else { if(window.AudioManager) window.AudioManager.playMiss(); speak("Top direkten döndü! İnanılmaz bir an, ceza sahası karıştı!"); }
                }
                window.wasPenaltyKick = false;
            } else {
                window.wasPenaltyKick = false;
                if (ball.isDeflectedShot) {
                    ball.x = 800; ball.y = (ball.y < 250) ? 0 : 500; ball.vx=0; ball.vy=0;
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true;
                        window.pendingPenalty = false; // Korner penaltı olamaz
                        gameHaltTimer = Date.now() + 3000;
                        haltReason = "KORNER";
                    }
                    handleStrikerMiss('out');
                      window.triggerReliefEvent('home');
                } else {
                    
                      // AÅžAMA 71: Ritmik Islık ve Oyunu Soğutmayı Engelleme
                      let isLateGame = typeof timeLeft !== 'undefined' && timeLeft < 45;
                      let isWastingTime = window.enemyScore >= window.playerScore && isLateGame && window.CrowdForm <= 2;

                      if (isWastingTime && typeof isGameHalted !== 'undefined' && Math.random() < 0.3) {
                          isGameHalted = true;
                          window.pendingPenalty = false;
                          gameHaltTimer = Date.now() + 5000;
                          haltReason = "KALECİ ZAMAN GEÇİRİYOR";
                          
                          if (window.AudioManager) {
                              let boo = new Audio('sounds/boo.ogg');
                              boo.volume = 1.0;
                              boo.play().catch(e=>{});
                          }

                          if(typeof speak === 'function') speak("Rakip kaleci süreyi eritmek için çok ağır hareket ediyor! Ama tribünler buna izin vermiyor, inanılmaz bir ritmik ıslık var! Bu protesto ev sahibi oyuncuları çileden çıkardı ve kudurmuş gibi pres yapmaya başladılar!");
                          
                          // Ev Sahibi Takıma Kudurmuş Pres Buff'ı (Adrenalin)
                          if (typeof homePlayers !== 'undefined') {
                              homePlayers.forEach(p => {
                                  p.stamina = 120; // Full adrenalin
                                  p.speed = (p.speed || 3) * 1.3; // Hızlı oyun baskısı
                              });
                          }
                      } else {
                          ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
                      }
                      handleStrikerMiss('out');
    
                }
            }
        } else if (ball.x < 0) {
            // AÅžAMA 53: Kendi Kalesine Gol / Normal Gol
            if (ball.y > 200 && ball.y < 300) {
                
                // KURAL 3: Topu Çizgiden Elle Kesme (Suarez Kurtarışı) - Ev Sahibi
                if (Math.random() < 0.015) { 
                    ball.x = 10; ball.vx = 0; ball.vy = 0; ball.team = 'none';
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true;
                        window.pendingPenalty = true; // Penaltı!
                        gameHaltTimer = Date.now() + 6000;
                        haltReason = "KIRMIZI KART (ÇİZGİDEN ELLE ÇIKARMA)";
                        if(typeof speak === 'function') speak("İnanılmaz bir an! Top tam ağlara giderken savunma oyuncusu kaleci gibi uçarak topu çizgiden eliyle çıkardı! Hakem penaltı noktasını gösteriyor ve o oyuncuya doğrudan kırmızı kart!");
                        if(typeof announcerText !== 'undefined') announcerText.textContent = "KIRMIZI KART VE PENALTI!";
                    }
                    window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
                    return; // Golü iptal et, döngüyü atla!
                }

                  window.enemyScore++; ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
            window.wasPenaltyKick = false;
                  
                  // GOAL LOGGING
                  window.lastMatchGoalEvents = window.lastMatchGoalEvents || [];
                  let scorerName = "Rakip Oyuncu";
                  let gMin = typeof timeLeft !== 'undefined' ? (90 - Math.floor(timeLeft)) : 45;
                  if (gMin < 1) gMin = 1;
                  window.lastMatchGoalEvents.push({ team: 'away', scorer: scorerName, min: gMin });
                  window.lastMatchScore = { home: window.playerScore, away: window.enemyScore };
                  
              if (typeof window.triggerVAR === 'function') window.triggerVAR('away');
                  
                  // AÅžAMA 72: Rakibi Ayakta Alkışlama (Standing Ovation)
                  if (window.CrowdForm === 5 && Math.random() < 0.6) {
                        if (window.AudioManager) {
                            let clap = new Audio('sounds/cheer.ogg');
                            clap.volume = 0.2;
                            clap.play().catch(e=>{});
                        }
                        if(typeof speak === 'function') speak("Top ağlarda. Ama stadyumda hiçbir tepki, hiçbir ıslık yok. Aksine taraftarlar çekirdek çitleyerek yenen bu golü alaycı bir şekilde, hafifçe alkışlıyorlar. Kulüp için acınası bir kabulleniş anı.");
                    } else if (window.CrowdForm === 4 && Math.random() < 0.15) {
                      if (window.AudioManager) {
                          let ovation = new Audio('sounds/cheer.ogg');
                          ovation.volume = 1.0;
                          ovation.play().catch(e=>{});
                      }
                      
                      // Ev Sahibi Takımın Özgüveni Tamamen Sıfırlanır
                      if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
                      if (typeof homePlayers !== 'undefined') {
                          homePlayers.forEach(p => { 
                              p.power = Math.max(1, (p.power || 50) - 10);
                              p.speed = (p.speed || 3) * 0.8;
                          });
                      }
                      
                      if(typeof speak === 'function') speak("İnanılmaz bir an! Stadyum ayağa kalktı ve az önce bu golü atan rakip oyuncuyu ayakta alkışlıyor! Ev sahibi takım oyuncuları için yerin dibine girme anı... Bütün özgüvenleri sıfırlandı, kendi taraftarları rakibe teslim oldu!");
                  } else {
    
                if(typeof speak === 'function') speak("Top ağlarda! Deplasman takımı skoru buluyor.");
                  }
                if(typeof announcerText !== 'undefined') announcerText.textContent = "KENDİ KALESİNE GOL!";
} else {
                  // AÅžAMA 74: Kornerde Yabancı Madde Yağmuru
                  if (typeof isGameHalted !== 'undefined' && Math.random() < 0.2) {
                      isGameHalted = true;
                      window.pendingPenalty = false;
                      gameHaltTimer = Date.now() + 6000;
                      haltReason = "KORNER (DEPLASMAN)";
                      
                      let isBerserk = (typeof teamPsychology !== 'undefined' && teamPsychology === 'berserk');
                      if (isBerserk || Math.random() < 0.15) {
                          haltReason = "YABANCI MADDE YAÄžMURU";
                          gameHaltTimer = Date.now() + 8000;
                          
                          if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
                          
                          if(typeof speak === 'function') speak("İnanılmaz görüntüler! Rakip oyuncu korner kullanmak için köşeye geldiğinde üzerine yağmur gibi yabancı madde yağdı! Hakem oyunu durdurdu ve anons yaptırıyor. Bu durum kulübe ağır bir ceza olarak dönecektir!");
                          
                          if (typeof window.managerAuthority !== 'undefined') window.managerAuthority -= 15;
                          if (typeof window.presidentConfidence !== 'undefined') window.presidentConfidence -= 20;
                          
                          if (typeof awayPlayers !== 'undefined') awayPlayers.forEach(p => p.mistakes = (p.mistakes || 0) + 2);
                      } else {
                          if(typeof speak === 'function') speak("Deplasman takımı köşe vuruşu kullanacak.");
                       }
                   } else {
                       ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
                       if (typeof isGameHalted !== 'undefined') {
                           isGameHalted = true;
                           gameHaltTimer = Date.now() + 3000;
                           haltReason = "KORNER (DEPLASMAN)";
                       }
                   }
                   if(typeof handleStrikerMiss === 'function') handleStrikerMiss('out');
                }
            }
        if (ball.y < 0) { ball.y = 0; ball.vy *= -1; }
        if (ball.y > 500) { ball.y = 500; ball.vy *= -1; }
    }

    if (ball.isAirborne && Date.now() > ball.airborneUntil) {
        ball.isAirborne = false;
        let failMsg = "Kimse dokunamadı, o harika orta boşa gitti.";
        if(typeof speak === 'function') speak(failMsg);
        if(typeof announcerText !== 'undefined') announcerText.textContent = failMsg;
    }

    window.triggerVAR = function(team) {
        if(typeof isGameHalted !== 'undefined') isGameHalted = true;
        if(typeof gameHaltTimer !== 'undefined') gameHaltTimer = Date.now() + 8000;
        if(typeof haltReason !== 'undefined') haltReason = "VAR İNCELEMESİ";
        window.varDisciplineEventTriggered = false;
        let nearbyVAR2 = 0;
        let allPlayersVAR2 = [...(typeof homePlayers !== 'undefined' ? homePlayers : []), ...(typeof awayPlayers !== 'undefined' ? awayPlayers : [])];
        allPlayersVAR2.forEach(p => { if (Math.hypot(p.x - ball.x, p.y - ball.y) < 150) nearbyVAR2++; });
        window.varPlayersNearIncident = nearbyVAR2;
        if(typeof speak === 'function') speak("Oyun durdu... Hakem kulağını tutuyor, VAR odasıyla bir görüşme var. Evet, kenara doğru koşuyor! Monitörden pozisyonu bizzat izleyecek. Stadyumda nefesler tutuldu, çıkacak karar maçın kaderini değiştirebilir!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "VAR İNCELEMESİ!";
        window.varScoringTeam = team;
    }

    // AÅžAMA 62: TARAFTAR ATIÅžMASI (BANTER)
    if (typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.002 && window.AudioManager && !window.AudioManager.isChanting) {
        if (Math.abs(window.playerScore - window.enemyScore) <= 1) {
            window.AudioManager.triggerBanter('away', window.myTeamId || 'home');
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    if (typeof isGameHalted !== 'undefined' && !isGameHalted && typeof timeLeft !== 'undefined' && timeLeft < 45 && Math.random() < 0.003 && !window.substitutionDone) {
        window.substitutionDone = true;
        isGameHalted = true;
        gameHaltTimer = Date.now() + 6000;
        haltReason = "OYUNCU DEÄžİÅžİKLİÄžİ";
        
        let timeWasting = (typeof window.playerScore !== 'undefined' && typeof window.enemyScore !== 'undefined' && window.playerScore !== window.enemyScore);
        if (timeWasting) {
            if(typeof speak === 'function') speak("Oyun durdu sayın seyirciler. Yedek kulübesinde tabela kalktı, kenarda bir oyuncu değişikliği izliyoruz. Çıkan oyuncu biraz ağır adımlarla kenara geliyor, tribünlerden bu zaman geçirme taktiğine yoğun bir ıslık var.");
        } else {
            if(typeof speak === 'function') speak("Kenarda hareketlilik var, teknik direktörden taktiksel bir hamle geliyor. Yorulan oyuncu alkışlarla kenara alındı.");
        }
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OYUNCU DEÄžİÅžİKLİÄžİ!";
    }

    // AÅžAMA 63: Spontane İhlaller (Ekipman, Kulübe, Degaj, Aldatma, İzinsiz Giriş, Kavga, Isırmak, VOR)
    if (typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.002) {
        let randRule = Math.random();
        if (randRule < 0.15) {
            isGameHalted = true;
            gameHaltTimer = Date.now() + 5000;
            haltReason = "İZİNSİZ EKİPMAN";
            if(typeof speak === 'function') speak("Oyun durdu... Hakem bir oyuncunun parmağında yüzük olduğunu fark etti. Çıkarmamakta direttiği için sarı kart görüyor!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (İzinsiz Ekipman)";
        } else if (randRule < 0.30) {
            isGameHalted = true;
            gameHaltTimer = Date.now() + 5000;
            haltReason = "TEKNİK EKİBE İHTAR";
            if(typeof speak === 'function') speak("Saha kenarı bir anda karıştı! Teknik direktör taktik alanını terk edip dördüncü hakeme şiddetli itirazlarda bulunduğu için sarı kart görüyor!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Teknik Direktöre İhtar)";
        } else if (randRule < 0.45) {
            isGameHalted = true;
            gameHaltTimer = Date.now() + 5000;
            haltReason = "SPORTMENLİÄžE AYKIRI (ALDATMA)";
            if(typeof speak === 'function') speak("Hakem düdüğünü çaldı ve sarı kartını çıkarıyor! Oyuncu ceza sahası yakınında kendini çok bariz bir şekilde yere bıraktı. Hakemi aldatmaya yönelik hareket!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Aldatmaya Yönelik Hareket)";
        } else if (randRule < 0.60) {
            isGameHalted = true;
            gameHaltTimer = Date.now() + 5000;
            haltReason = "İZİNSİZ SAHAYA GİRME";
            if(typeof speak === 'function') speak("Hakem oyunu sinirle durdurdu! Kenarda tedavisi biten oyuncu, hakemin işaretini beklemeden sahaya daldı. Kurallar gereği sarı kart görüyor.");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (İzinsiz Sahaya Girme)";
        } else if (randRule < 0.70) {
            // KURAL 4: Åžiddetli Hareket (Kavga)
            isGameHalted = true;
            gameHaltTimer = Date.now() + 6000;
            haltReason = "KIRMIZI KART (KAVGA)";
            if(typeof speak === 'function') speak("İnanılmaz görüntüler! Oyun durmuşken iki oyuncu arasında topsuz alanda büyük bir kavga çıktı. Yumruklar konuşuyor! Hakem koşarak geldi ve şiddetli hareketten dolayı doğrudan kırmızı kartını çıkardı!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "KIRMIZI KART (Åžiddetli Hareket)";
        } else if (randRule < 0.80) {
            // KURAL 6: Tükürmek veya Isırmak
            isGameHalted = true;
            gameHaltTimer = Date.now() + 6000;
            haltReason = "KIRMIZI KART (İNSANLIK DIÅžI HAREKET)";
            if(typeof speak === 'function') speak("Sayın seyirciler çok çirkin bir olay yaşanıyor. Bir oyuncu rakibine tükürdü! Hakem bunu gördü ve tereddütsüz kırmızı kart göstererek onu sahadan atıyor. Futbol sahalarında görmek istemediğimiz hareketler!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "KIRMIZI KART (Tükürmek/Isırmak)";
        } else if (randRule < 0.90) {
            // KURAL 7: VOR Odasına Girmek
            isGameHalted = true;
            gameHaltTimer = Date.now() + 6000;
            haltReason = "KIRMIZI KART (VOR İHLALİ)";
            if(typeof speak === 'function') speak("Saha kenarı karıştı! Sinirlerine hakim olamayan bir görevli VAR hakemlerinin bulunduğu VOR odasına zorla girmeye çalıştı! Güvenlik görevlileri müdahale ediyor, bu eylemin cezası doğrudan kırmızı kart!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "KIRMIZI KART (VAR Odasına Girmek)";
        } else {
            if (typeof activePlayer !== 'undefined' && activePlayer && (activePlayer.position === 'Kaleci' || activePlayer.position === 'GK')) {
                isGameHalted = true;
                gameHaltTimer = Date.now() + 5000;
                haltReason = "DEGAJI ENGELLEMEK";
                if(typeof speak === 'function') speak("Hakem düdüğünü çaldı! Kaleci topu eliyle oyuna sokmaya çalışırken rakip forvet önüne atlayıp degajı engelledi. Kural gereği sarı kart!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Degajı Engelleme)";
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    
    // AÅžAMA 64: Serbest Vuruş İhlalleri (Düdüğü Beklememek, Mesafeye Uymamak, Vakit Geçirmek)
    if (typeof window.isFreeKickZone !== 'undefined' && window.isFreeKickZone && Date.now() < window.freeKickTimer - 1000) {
        let fkRand = Math.random();
        if (fkRand < 0.005 && !window.earlyFreeKickWarned) {
            window.earlyFreeKickWarned = true;
            window.isFreeKickZone = false;
            isGameHalted = true;
            gameHaltTimer = Date.now() + 4000;
            haltReason = "DÜDÜÄžÜ BEKLEMEMEK";
            if(typeof speak === 'function') speak("Hakem düdüğümü bekle işareti yapmıştı! Erken vuruş yapan hücum oyuncusu sarı kart gördü, atış tekrarlanacak.");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Erken Vuruş)";
        } else if (fkRand > 0.995 && !window.earlyFreeKickWarned) {
            window.earlyFreeKickWarned = true;
            window.isFreeKickZone = false;
            isGameHalted = true;
            gameHaltTimer = Date.now() + 4000;
            haltReason = "MESAFEYE UYMAMAK";
            if(typeof speak === 'function') speak("Hakem barajı kurdurmuştu ama savunma oyuncusu atış yapılmadan topun önüne atlayıp mesafeyi ihlal etti! Sarı kart çıkıyor!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Mesafeyi İhlal Etmek)";
        } else if (fkRand > 0.495 && fkRand < 0.500 && !window.earlyFreeKickWarned) {
            window.earlyFreeKickWarned = true;
            window.isFreeKickZone = false;
            isGameHalted = true;
            gameHaltTimer = Date.now() + 4000;
            haltReason = "OYUNU GECİKTİRMEK";
            if(typeof speak === 'function') speak("Oyun durmuşken savunma oyuncusu topu sinirle tribünlere doğru vurdu! Oyunun yeniden başlamasını geciktirdiği için net bir sarı kart!");
            if(typeof announcerText !== 'undefined') announcerText.textContent = "SARI KART (Vakit Geçirme)";
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    if (typeof isGameHalted !== 'undefined' && isGameHalted && (haltReason === "DÜDÜÄžÜ BEKLEMEMEK" || haltReason === "MESAFEYE UYMAMAK" || haltReason === "OYUNU GECİKTİRMEK") && Date.now() > gameHaltTimer) {
        isGameHalted = false;
        window.earlyFreeKickWarned = false;
        window.isFreeKickZone = true;
        window.freeKickTimer = Date.now() + 4000;
        if(typeof speak === 'function') speak("Hakem olayları yatıştırdı, şimdi düdüğünü çaldı ve atış tekrarlanıyor.");
    }

    if (ball.isAirborne && Date.now() > ball.airborneUntil) {
        ball.isAirborne = false;
        let failMsg = "Kimse dokunamadi, o harika orta bosa gitti.";
        if(typeof speak === 'function') speak(failMsg);
        if(typeof announcerText !== 'undefined') announcerText.textContent = failMsg;
    }

    if (!isGameHalted && ball.x > 650 && ball.team !== 'home' && Math.random() < 0.005 && !window.pendingVarTrigger) {
        window.pendingVarTrigger = Date.now() + 3000; 
    }
    
    // [YENİ] Rastgele Duran Top Olayları
    if (!isGameHalted && Math.random() < 0.005) { 
        if (ball.x > 500 && ball.team === 'home') {
            isGameHalted = true;
            gameHaltTimer = Date.now() + 3000;
            let eventRand = Math.random();
            if (eventRand < 0.4) {
                haltReason = "KORNER";
                if(typeof speak === 'function') speak("Savunmanın müdahalesiyle top kornere çıktı! Organize bir şekilde köşe vuruşu kullanacağız.");
            } else if (eventRand < 0.7) {
                haltReason = "SERBEST VURUŞ";
                if(typeof speak === 'function') speak("Tehlikeli bölgede sert bir faul! Oyuncumuz yerde kaldı. Serbest vuruş kullanacağız.");
            } else {
                haltReason = "TAÇ ATIŞI";
                if(typeof speak === 'function') speak("Top taça çıktı. Taç atışıyla oyuna başlayacağız.");
            }
        } else if (ball.x < 300 && ball.team === 'away') {
            isGameHalted = true;
            gameHaltTimer = Date.now() + 3000;
            let eventRand = Math.random();
            if (eventRand < 0.4) {
                haltReason = "KORNER (DEPLASMAN)";
            } else if (eventRand < 0.7) {
                haltReason = "SERBEST VURUŞ (DEPLASMAN)";
            } else {
                haltReason = "TAÇ ATIŞI (DEPLASMAN)";
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    if (!isGameHalted && window.pendingVarTrigger && Date.now() > window.pendingVarTrigger) {
        window.pendingVarTrigger = null;
        isGameHalted = true;
        gameHaltTimer = Date.now() + 8000;
        haltReason = "VAR İNCELEMESİ";
        window.varDisciplineEventTriggered = false;
        let nearbyVAR2 = 0;
        let allPlayersVAR2 = [...(typeof homePlayers !== 'undefined' ? homePlayers : []), ...(typeof awayPlayers !== 'undefined' ? awayPlayers : [])];
        allPlayersVAR2.forEach(p => { if (Math.hypot(p.x - ball.x, p.y - ball.y) < 150) nearbyVAR2++; });
        window.varPlayersNearIncident = nearbyVAR2;
        if(typeof speak === 'function') speak("Oyun durdu... Hakem kulağını tutuyor, VAR odasıyla bir görüşme var. Evet, kenara doğru koşuyor! Monitörden pozisyonu bizzat izleyecek. Stadyumda nefesler tutuldu, çıkacak karar maçın kaderini değiştirebilir!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "VAR İNCELEMESİ!";
        isGameHalted = true;
        gameHaltTimer = Date.now() + 6000;
        haltReason = "OYUNCU DEÄİÅİKLİÄİ";
        
        let timeWasting = (typeof window.playerScore !== 'undefined' && typeof window.enemyScore !== 'undefined' && window.playerScore !== window.enemyScore);
        if (timeWasting) {
            if(typeof speak === 'function') speak("Oyun durdu sayın seyirciler. Yedek kulübesinde tabela kalktı, kenarda bir oyuncu değişikliği izliyoruz. Çıkan oyuncu biraz ağır adımlarla kenara geliyor, tribünlerden bu zaman geçirme taktiğine yoğun bir ıslık var.");
        } else {
            if(typeof speak === 'function') speak("Kenarda hareketlilik var, teknik direktörden taktiksel bir hamle geliyor. Yorulan oyuncu alkışlarla kenara alındı.");
        }
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OYUNCU DEÄİÅİKLİÄİ!";
    }

    if (ctx) {
        homePlayers.forEach(p => {
            if (p.isRedCarded) return; // AÅAMA 29: Kırmızı kart gören sahada çizilmez
            ctx.fillStyle = p.isUserControlled ? '#e74c3c' : (p.hasYellowCard ? '#f1c40f' : '#3498db');
            ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
        });
        awayPlayers.forEach(p => {
            if (p.isRedCarded) return;
            ctx.fillStyle = p.hasYellowCard ? '#f1c40f' : '#e67e22';
            ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
        });
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI*2); ctx.fill();
    }

    // --- YENİ: DİNAMİK ISLIK SİSTEMİ ---
    if (typeof audioEngine !== 'undefined' && audioEngine.updateWhistle) {
        if (typeof window.whistleIntensity === 'undefined') window.whistleIntensity = 0;
        let targetIntensity = 0;
        let targetPitch = 1.0;
        
        if (ball.team === 'away') {
            let distanceToGoal = ball.x; // Kalemiz x=0
            if (distanceToGoal < 500) {
                targetIntensity = 1.0 - (distanceToGoal / 500);
            }
        }
        
        // Ses seviyesini yumuşak geçişle (fade in/out) ayarla
        window.whistleIntensity += (targetIntensity - window.whistleIntensity) * 0.05; 
        audioEngine.updateWhistle(window.whistleIntensity * 1.5, targetPitch);
    }

    if (typeof ball !== 'undefined' && ball) {
        audioEngine.updateWhistle(window.whistleIntensity * 1.5, targetPitch);
    }

    if (typeof ball !== 'undefined' && ball) {
        if (Math.abs(ball.vx - initialVx) > 3 || Math.abs(ball.vy - initialVy) > 3) {
            if (window.audioEngine && typeof window.audioEngine.playKickSound === 'function') {
                window.audioEngine.playKickSound();
            }
        }
    }

    if (!isPaused && (typeof isGameHalted === 'undefined' || !isGameHalted) && activePlayer && ball.team === 'home') {
        let zone = "";
        if (activePlayer.x < 150) zone = "Kendi ceza sahamız!";
        else if (activePlayer.x < 400) zone = "Kendi yarı alanımız.";
        else if (activePlayer.x < 650) zone = "Rakip yarı alan.";
        else zone = "Rakip ceza sahası!";
        
        if (zone !== window.lastAnnouncedZone) {
            window.lastAnnouncedZone = zone;
            if (typeof speak === 'function') speak(zone, true);
        }
    }

    // Anti-NaN Fail-safe (Sessiz NaN kilitlenmelerini çözer)
    if (isNaN(ball.x) || isNaN(ball.y) || isNaN(ball.vx) || isNaN(ball.vy)) {
        ball.x = 400; ball.y = 250; ball.vx = 0; ball.vy = 0;
    }

    window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
    } catch(e) {
        console.error("Game Loop Crashed! Recovering...", e);
        window.gameLoopAnimationId = requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    if (typeof window.applyRankingPoints === 'function') {
        window.applyRankingPoints(window.myTeamId, window.todayOpponent, window.playerScore, window.enemyScore);
    }
    gameActive = false;
    
    let isClMatch = (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId));
    
    if (isClMatch) {
        // CL maçında lig haftasını atlatma
        window.championsLeague.simulateBotMatches();
        window.championsLeague.updateStandings(
            window.isHomeMatch ? window.myTeamId : window.todayOpponent,
            window.isHomeMatch ? window.todayOpponent : window.myTeamId,
            window.isHomeMatch ? window.playerScore : window.enemyScore,
            window.isHomeMatch ? window.enemyScore : window.playerScore
        );
        window.championsLeague.finishMatchDay();
        
        // Devasa CL Ödülü (Örn: Galibiyete 2.8M Euro, Beraberliğe 900k)
        if (window.playerScore > window.enemyScore) {
            window.budget += 2800000;
            if(typeof speak === 'function') speak("Avrupa fatihi! Galibiyet primi olarak kasamıza 2.8 Milyon Euro girdi.");
        } else if (window.playerScore === window.enemyScore) {
            window.budget += 900000;
            if(typeof speak === 'function') speak("Avrupa'da puan puandır. 900 bin Euro beraberlik primi aldık.");
        }
    }
    
    // [YENİ] Forma giyen oyuncuların maç sayısını artır (DALYA SİSTEMİ EKLENDİ)
    if (typeof homePlayers !== 'undefined') {
        homePlayers.forEach(p => {
            if(p) {
                p.seasonMatches = (p.seasonMatches || 0) + 1;
                
                // Gerçek veritabanındaki oyuncuyu bul ve kalıcı statlarını güncelle
                let dbPlayer = window.leagueData.players.find(x => x.id === p.id);
                if (dbPlayer) {
                    dbPlayer.seasonMatches = (dbPlayer.seasonMatches || 0) + 1;
                    dbPlayer.careerMatches = (dbPlayer.careerMatches || 0) + 1;
                    
                    if (typeof window.checkDalya === 'function') {
                        window.checkDalya(dbPlayer);
                    }
                }
            }
        });
    }

    if(matchTimer) clearInterval(matchTimer);
    if(matchEventTimer) clearInterval(matchEventTimer);
    if(typeof speak === 'function') speak("Maç sona erdi. Sonuç: Biz " + window.playerScore + " - " + window.enemyScore + " Rakip");
    
    // AÅžAMA 44: Kariyer Puanı ve Başkan Güveni Değerlendirmesi
    let scoreDiff = window.playerScore - window.enemyScore;
    let isLoss = scoreDiff < 0;
    let isHeavyDefeat = scoreDiff <= -3;
    
    // [YENİ] Maç Sonu Basın Toplantısı İçin Sonuç
    window.lastMatchResult = scoreDiff > 0 ? "win" : (isLoss ? "loss" : "draw");
    
    // [YENİ] Derbi / Büyük Maç Gazete Haberi
    if (window.todayOpponent) {
        let oppTeam = window.leagueData.teams.find(t => t.id === window.todayOpponent);
        if (oppTeam && oppTeam.budget >= 70) {
            window.newspaperQueue = window.newspaperQueue || [];
            if (window.lastMatchResult === "win") {
                window.newspaperQueue.push({
                    headline: "DEV MAÇTA ZAFER!",
                    subheadline: `${oppTeam.name} karşısında muhteşem bir galibiyet alındı. Şehir bayram yeri!`,
                    article: `Nefesleri kesen derbi mücadelesinde gülen taraf biz olduk! Takım sahadaki üstün futboluyla şampiyonluk yarışındaki dev rakibini ${window.playerScore}-${window.enemyScore} yenmeyi başardı. Taraftarlar gece boyu sokaklarda kutlama yaptı.`,
                    color: "#27ae60",
                    bgColor: "#fff",
                    priority: 85
                });
            } else if (window.lastMatchResult === "loss") {
                window.newspaperQueue.push({
                    headline: "DERBİ HÜSRANI!",
                    subheadline: `${oppTeam.name} deplasmanında ağır yara aldık. Taraftarlar üzgün.`,
                    article: `Milyonların kilitlendiği dev maçta ${window.playerScore}-${window.enemyScore} skorla sahadan boynu bükük ayrıldık. Kritik mücadelede yapılan hatalar ve kaçan pozisyonlar saç baş yoldurdu. Takımın bu mağlubiyetin altından nasıl kalkacağı merak konusu.`,
                    color: "#c0392b",
                    bgColor: "#fff",
                    priority: 75
                });
            }
        }
    }
    
    // [YENİ] Maç Sonu Sistematik Moral Etkisi
    let myRoster = window.leagueData.players.filter(p => p.teamId === window.myTeamId);
    let playedIds = (typeof homePlayers !== 'undefined') ? homePlayers.map(p => p.id) : [];
    
    myRoster.forEach(p => {
        if (p.morale === undefined) p.morale = 75;
        if (window.lastMatchResult === "win") {
            p.morale = Math.min(100, p.morale + (playedIds.includes(p.id) ? 8 : 4)); // İlk 11'e +8, yedeğe +4
        } else if (window.lastMatchResult === "loss") {
            p.morale = Math.max(0, p.morale - (playedIds.includes(p.id) ? 10 : 5)); // İlk 11'e -10, yedeğe -5
        } else {
            p.morale = Math.max(0, p.morale - 2); // Beraberlikte hafif düşüş
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    });
    
    // [YENİ] Gişe Hasılatı (Sadece İç Saha Maçları)
    if (window.isHomeMatch && window.leagueData && window.FacilitiesManager) {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (myTeam) {
            let sLvl = myTeam.stadiumLevel || 1;
            let levelData = window.FacilitiesManager.stadiumLevels[sLvl - 1];
            if (levelData) {
                let revenue = levelData.revenue;
                if (window.lastMatchResult === "win") revenue *= 1.5;
                else if (window.lastMatchResult === "loss") revenue *= 0.5;
                
                // Sadece kazanılınca veya büyük statta getiri çok olacağı için bütçeye ekle
                if (revenue > 0) {
                    myTeam.budget += revenue;
                    alert(` [STADYUM]  İÇ SAHA GİÅžE HASILATI  [STADYUM] 

Stadyumunuzdaki sadık taraftarlar sayesinde kulübün kasasına ${revenue.toFixed(2)} Milyon Euro bilet ve loca geliri eklendi!`);
                }
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    if (window.lastMatchResult === "win" && typeof window.SponsorManager !== 'undefined') {
        if(typeof window.SponsorManager.handleWin === 'function') window.SponsorManager.handleWin(window.myTeamId);
    }

    if (isLoss) {
        window.consecutiveLosses = (window.consecutiveLosses || 0) + 1;
        window.consecutiveWins = 0; // Galibiyet serisini sıfırla
        if (isHeavyDefeat) {
            window.managerAuthority = Math.max(0, window.managerAuthority - 15);
            window.presidentConfidence = Math.max(0, window.presidentConfidence - 20);
            if(typeof speak === 'function') setTimeout(() => speak("Yönetim kurulu bu hezimetin ardından acil toplanma kararı alabilir. Başkan ve taraftar çok öfkeli."), 3000);
        } else if (window.consecutiveLosses >= 3) {
            window.managerAuthority = Math.max(0, window.managerAuthority - 10);
            window.presidentConfidence = Math.max(0, window.presidentConfidence - 15);
            if(typeof speak === 'function') setTimeout(() => speak("Peş peşe gelen mağlubiyetler hocanın koltuğunu sallamaya başladı. Takım çöküşte."), 3000);
        } else {
            window.managerAuthority = Math.max(0, window.managerAuthority - 5);
            window.presidentConfidence = Math.max(0, window.presidentConfidence - 5);
        }

        // YENİ: 5 Maçlık Mağlubiyet Serisinde Özgüven Çöküşü
        if (window.consecutiveLosses >= 5) {
            let teamHasCaptain = false;
            let captainName = "";
            if (typeof homePlayers !== 'undefined') {
                let captain = homePlayers.find(p => p.isCaptain);
                if (captain) { teamHasCaptain = true; captainName = captain.name; }
                
                homePlayers.forEach(p => {
                    let dropAmount = teamHasCaptain ? 10 : 30; // Kaptan varsa çöküşü hafifletir (Hiyerarşik Tampon)
                    if (p.psy && !p.psy.intrinsicMotivation) p.psy.selfEfficacy = Math.max(0, p.psy.selfEfficacy - dropAmount);
                    p.happiness = "Mutsuz ";
                });
            }
            if(typeof speak === 'function') {
                if (teamHasCaptain) {
                    setTimeout(() => speak(`Peş peşe gelen 5 kayıp sonrası takım çökmek üzereydi ama Kaptan ${captainName} medyanın önüne çıkıp tüm sorumluluğu üstlendi! Takım arkadaşlarını ve hocasını korudu.`), 4500);
                    window.managerAuthority += 10; // Kaptan hocayı korudu
                } else {
                    setTimeout(() => speak("Peş peşe gelen kayıplar sonrası takımın özgüveni tamamen çöktü! Herkes depresyonda."), 4500);
                }
            }
        }

    } else if (scoreDiff > 0) {
        window.consecutiveLosses = 0;
        window.consecutiveWins = (window.consecutiveWins || 0) + 1;
        window.managerAuthority = Math.min(100, window.managerAuthority + 10);
        window.presidentConfidence = Math.min(100, window.presidentConfidence + 10);

        // YENİ: Galibiyet Serisinde Özgüven Patlaması
        if (window.consecutiveWins >= 3) {
            if (typeof homePlayers !== 'undefined') {
                homePlayers.forEach(p => {
                    if (p.psy) p.psy.selfEfficacy = Math.min(100, p.psy.selfEfficacy + 20);
                    p.happiness = "Mutlu ";
                });
            }
            if(typeof speak === 'function') setTimeout(() => speak("Üst üste gelen harika galibiyetler! Takımda yüzler gülüyor, oyuncuların özgüveni tavan yaptı!"), 4500);
        }

    } else {
        window.consecutiveLosses = 0;
        window.consecutiveWins = 0;
    }

    // Başkanın Uyarı Mesajı (UI)
    if (window.presidentConfidence < 40) {
        setTimeout(() => {
            alert("BAÅžKAN'DAN MESAJ: Sayın hocam, bu kulübün genlerinde böyle bir tablo yoktur. Sonuçlar düzelmezse yollarımızı ayırmak zorunda kalacağız.");
        }, 6000);
    } else if (window.presidentConfidence < 70 && isLoss) {
        setTimeout(() => {
            alert("BAÅžKAN'DAN MESAJ: Bu mağlubiyet hiç hoşuma gitmedi. Taraftar homurdanıyor, toparlanmamız lazım.");
        }, 6000);
    }
    
    // AÅžAMA 35: Psikoloji Güncellemesi
    if (typeof squadEngine !== 'undefined') {
        squadEngine.processMatch(homePlayers.map(p => p.id));
    }
    
    if (typeof processBenchPsychology === 'function') {
        processBenchPsychology();
    }
    
    // AÅžAMA 40: EKONOMİK KARADELİK (Maaş Ödemesi)
    if (window.leagueData) {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (!myTeam) myTeam = window.leagueData.teams.find(t => t.id === 'galatasaray');
        if (myTeam) {
            let worldClassCount = homePlayers.filter(p => p.isWorldClass).length;
            if (worldClassCount > 0) {
                let wageCost = worldClassCount * 2; // Her yıldıza maç başı 2M Euro
                window.budget -= wageCost;
                if (myTeam) myTeam.budget = window.budget;
                if(typeof speak === 'function') speak(`Maç sonu dünya yıldızlarına toplam ${wageCost} Milyon Euro maç başı maaş ödendi. Kalan bütçe: ${window.budget} Milyon.`);
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    setTimeout(() => {
        let proceedToNextMenu = () => {
            if (window.isFriendlyMatch) {
                window.isFriendlyMatch = false;
                if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
                const mm = document.getElementById('main-menu-container');
                if (mm) { mm.style.display = 'flex'; let title = mm.querySelector('h1, h2'); if(title) title.focus(); else mm.focus(); }
                if (typeof speak === 'function') speak("Hazırlık maçı sona erdi.");
            } else if(window.leagueData && typeof window.leagueData.playMatch === 'function') {
                window.leagueData.playMatch();
            } else {
                if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
                const mm = document.getElementById('main-menu-container');
                if (mm) { mm.style.display = 'flex'; let title = mm.querySelector('h1, h2'); if(title) title.focus(); else mm.focus(); }
            }
            if (typeof checkPsychologyDialogue === 'function') {
                checkPsychologyDialogue();
            }
        };

        let scoreDiffLocal = window.playerScore - window.enemyScore;
        let isLossLocal = scoreDiffLocal < 0;
        let isHeavyDefeatLocal = scoreDiffLocal <= -3;
        
        let runPunishment = () => {
            if (isLossLocal && typeof showPunishmentModal === 'function') {
                showPunishmentModal(isHeavyDefeatLocal, proceedToNextMenu);
            } else {
                proceedToNextMenu();
            }
        };

        if (window.presidentConfidence < 40 || (window.presidentConfidence < 70 && isLossLocal)) {
            let msg = window.presidentConfidence < 40 
                ? "Sayın hocam, bu kulübün genlerinde böyle bir tablo yoktur. Sonuçlar düzelmezse yollarımızı ayırmak zorunda kalacağız." 
                : "Bu mağlubiyet hiç hoşuma gitmedi. Taraftar homurdanıyor, toparlanmamız lazım.";
            
            showRPGDialog("📞 BAŞKAN ARIYOR...", msg, [
                {
                    text: "Ben işimi biliyorum, saha içine karışmayın!",
                    action: () => {
                        window.presidentConfidence -= 15;
                        window.managerAuthority = (window.managerAuthority || 50) + 10;
                        if(typeof speak === 'function') speak("Başkan sinirlenip telefonu yüzünüze kapattı!");
                        runPunishment();
                    },
                    color: "#e74c3c"
                },
                {
                    text: "Haklısınız başkanım, en kısa sürede toparlayacağız.",
                    action: () => {
                        window.presidentConfidence += 10;
                        window.managerAuthority = Math.max(0, (window.managerAuthority || 50) - 5);
                        if(typeof speak === 'function') speak("Başkan biraz yumuşadı, 'Göreceğiz' diyerek telefonu kapattı.");
                        runPunishment();
                    },
                    color: "#2ecc71"
                },
                {
                    text: "Oyuncular verdiğim taktiği sahaya yansıtamadı, suç oyuncularda.",
                    action: () => {
                        // Takım morali ve sadakati düşer
                        homePlayers.forEach(p => p.power = Math.max(10, p.power - 5));
                        if(typeof speak === 'function') speak("Soyunma odasında bu sözleriniz duyuldu, takımın size olan inancı azaldı.");
                        runPunishment();
                    },
                    color: "#f39c12"
                }
            ]);
        } else {
            runPunishment();
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }, 5000);
}

window.showRPGDialog = function(titleText, messageText, options) {
    const modal = document.createElement('div');
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "linear-gradient(to bottom, #1a252f, #2c3e50)";
    modal.style.border = "3px solid #3498db";
    modal.style.padding = "30px";
    modal.style.zIndex = "10000";
    modal.style.color = "white";
    modal.style.boxShadow = "0 0 30px rgba(0,0,0,0.9)";
    modal.style.borderRadius = "15px";
    modal.style.textAlign = "center";
    modal.style.width = "500px";

    let title = document.createElement('h2');
    title.innerHTML = titleText;
    title.style.color = "#ecf0f1";
    title.style.marginBottom = "20px";
    
    let text = document.createElement('p');
    text.innerHTML = messageText;
    text.style.fontSize = "1.2rem";
    text.style.marginBottom = "30px";
    text.style.fontStyle = "italic";

    let optionsContainer = document.createElement('div');
    optionsContainer.style.display = "flex";
    optionsContainer.style.flexDirection = "column";
    optionsContainer.style.gap = "15px";

    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.innerHTML = opt.text;
        btn.style.padding = "15px";
        btn.style.fontSize = "1rem";
        btn.style.cursor = "pointer";
        btn.style.background = opt.color || "#34495e";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.borderRadius = "8px";
        btn.style.transition = "transform 0.2s";
        
        btn.onmouseover = () => btn.style.transform = "scale(1.02)";
        btn.onmouseout = () => btn.style.transform = "scale(1)";
        
        btn.onclick = () => {
            document.body.removeChild(modal);
            opt.action();
        };
        optionsContainer.appendChild(btn);
    });

    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(optionsContainer);
    document.body.appendChild(modal);
};

window.showPunishmentModal = function(isHeavyDefeat, callback) {
    const modal = document.createElement('div');
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = isHeavyDefeat ? "linear-gradient(to bottom, #c0392b, #8e44ad)" : "linear-gradient(to bottom, #2c3e50, #34495e)";
    modal.style.border = isHeavyDefeat ? "5px solid #000" : "3px solid #e74c3c";
    modal.style.padding = "30px";
    modal.style.zIndex = "10000";
    modal.style.color = "white";
    modal.style.boxShadow = "0 0 30px rgba(0,0,0,0.9)";
    modal.style.borderRadius = "15px";
    modal.style.textAlign = "center";
    modal.style.width = "500px";

    let title = document.createElement('h2');
    title.innerHTML = isHeavyDefeat ? "🔥 SOYUNMA ODASINDA HEZİMET SESSİZLİĞİ 🔥" : "🚪 SOYUNMA ODASINA GİRDİNİZ";
    title.style.color = isHeavyDefeat ? "#f1c40f" : "#ecf0f1";
    
    let text = document.createElement('p');
    text.innerHTML = isHeavyDefeat 
        ? "Takım sahada darmadağın oldu. Herkesin başı önde, soyunma odasında ölüm sessizliği var. Oyuncular korkarak sizin ne diyeceğinizi bekliyor..."
        : "Mağlubiyetin ardından soyunma odasında moral bozukluğu hakim. Takım gözlerinizin içine bakıyor.";
    text.style.fontSize = "1.2rem";
    text.style.marginBottom = "20px";

    let optionsContainer = document.createElement('div');
    optionsContainer.style.display = "flex";
    optionsContainer.style.flexDirection = "column";
    optionsContainer.style.gap = "15px";

    let applyPunishment = (type) => {
        let msg = "";
        if (typeof homePlayers !== 'undefined' && window.leagueData) {
            let myTeam = window.leagueData.teams.find(t => t.id === window.leagueData.userTeamId);
            
            homePlayers.forEach(p => {
                if (type === 'training') {
                    p.condition = Math.max(10, (p.condition || 100) - 25);
                    p.aggression = Math.min(100, (p.aggression || 50) + 20);
                    p.loyalty = Math.max(0, (p.loyalty || 50) - 5);
                    p.happiness = "Yorgun 😮‍💨";
                } else if (type === 'wageCut') {
                    p.loyalty = Math.max(0, (p.loyalty || 50) - 20);
                    p.happiness = "Öfkeli 😡";
                } else if (type === 'ignore') {
                    // rahat bırak
                    p.happiness = "Rahatlamış 😌";
                }
            });

            if (type === 'training') {
                msg = "Takıma ağır idman cezası verdiniz! Oyuncular yorgun düştü ama hırsları arttı.";
            } else if (type === 'wageCut') {
                if (myTeam) {
                    let fine = isHeavyDefeat ? 5 : 2;
                    myTeam.budget += fine;
                    msg = `Maaşlardan kestiniz! Bütçenize +${fine}M Euro eklendi. Oyuncular size çok kızgın!`;
                }
            } else if (type === 'ignore') {
                msg = "Onları rahat bıraktınız. Mağlubiyetin hüznünü kendi içlerinde yaşadılar.";
            }
        }
        
        document.body.removeChild(modal);
        if(typeof speak === 'function') speak(msg);
        alert(msg);
        callback();
    };

    let btnTraining = document.createElement('button');
    btnTraining.style.padding = "15px";
    btnTraining.style.backgroundColor = "#e67e22";
    btnTraining.style.color = "white";
    btnTraining.style.border = "none";
    btnTraining.style.borderRadius = "5px";
    btnTraining.style.cursor = "pointer";
    btnTraining.style.fontSize = "1.1rem";
    btnTraining.innerHTML = "🏃 Ağır antrenman yaptır";
    btnTraining.onclick = () => applyPunishment('training');

    let btnWageCut = document.createElement('button');
    btnWageCut.style.padding = "15px";
    btnWageCut.style.backgroundColor = "#c0392b";
    btnWageCut.style.color = "white";
    btnWageCut.style.border = "none";
    btnWageCut.style.borderRadius = "5px";
    btnWageCut.style.cursor = "pointer";
    btnWageCut.style.fontSize = "1.1rem";
    btnWageCut.innerHTML = "💰 Maaşlarından kes";
    btnWageCut.onclick = () => applyPunishment('wageCut');

    let btnIgnore = document.createElement('button');
    btnIgnore.style.padding = "15px";
    btnIgnore.style.backgroundColor = "#27ae60";
    btnIgnore.style.color = "white";
    btnIgnore.style.border = "none";
    btnIgnore.style.borderRadius = "5px";
    btnIgnore.style.cursor = "pointer";
    btnIgnore.style.fontSize = "1.1rem";
    btnIgnore.innerHTML = "🚪 Onları rahat bırak";
    btnIgnore.onclick = () => applyPunishment('ignore');

    optionsContainer.appendChild(btnTraining);
    optionsContainer.appendChild(btnWageCut);
    optionsContainer.appendChild(btnIgnore);

    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(optionsContainer);
    
    document.body.appendChild(modal);
}


window.isVARCheckActive = false;

window.checkVAR = function(team) {
    if (window.isVARCheckActive) return; // Zaten VAR çalışıyorsa çık
    
    // Yüzde 5 ihtimalle VAR devreye girsin (Yumuşatıldı)
    if (Math.random() < 0.05) {
        window.isVARCheckActive = true;
        isPaused = true;
        if(typeof speak === 'function') speak("Hakem VAR odasını dinliyor... Çok kritik bir an!");
        
        let announcerText = document.getElementById('announcer-text');
        if(announcerText) announcerText.textContent = "HAKEM VAR'I DİNLİYOR...";
        
        // UI Overlay
        let varOverlay = document.createElement('div');
        varOverlay.id = 'var-overlay';
        varOverlay.style.position = 'absolute';
        varOverlay.style.top = '50%';
        varOverlay.style.left = '50%';
        varOverlay.style.transform = 'translate(-50%, -50%)';
        varOverlay.style.background = 'rgba(0, 0, 0, 0.9)';
        varOverlay.style.color = '#f1c40f';
        varOverlay.style.padding = '30px';
        varOverlay.style.border = '5px solid #f1c40f';
        varOverlay.style.borderRadius = '10px';
        varOverlay.style.zIndex = '9999';
        varOverlay.style.fontSize = '3rem';
        varOverlay.style.fontWeight = 'bold';
        varOverlay.style.textAlign = 'center';
        varOverlay.innerHTML = '<i class="fas fa-video"></i> VAR İNCELEMESİ';
        
        let gameContainer = document.getElementById('game-container');
        if(gameContainer) gameContainer.appendChild(varOverlay);
        
        setTimeout(() => {
            // %25 ihtimalle gol iptal, %75 geçerli (Yumuşatıldı)
            if (Math.random() < 0.25) {
                // Gol iptal
                if(team === 'home') window.playerScore--;
                else window.enemyScore--;
                
                varOverlay.innerHTML = '<i class="fas fa-times-circle" style="color:#e74c3c;"></i> GOL İPTAL!';
                varOverlay.style.color = '#e74c3c';
                varOverlay.style.borderColor = '#e74c3c';
                if(typeof speak === 'function') speak("İnanılmaz! Gol iptal edildi! Hakem ofsayt olduğunu belirtiyor.");
                if(announcerText) announcerText.textContent = "VAR KARARI: GOL İPTAL!";
                
                // Golü events tablosundan da silmek lazım (son eklenen golü siliyoruz)
                if (window.lastMatchGoalEvents && window.lastMatchGoalEvents.length > 0) {
                    window.lastMatchGoalEvents.pop();
                }
            } else {
                // Gol geçerli
                varOverlay.innerHTML = '<i class="fas fa-check-circle" style="color:#2ecc71;"></i> GOL GEÇERLİ!';
                varOverlay.style.color = '#2ecc71';
                varOverlay.style.borderColor = '#2ecc71';
                if(typeof speak === 'function') speak("Gol geçerli! VAR odasından onay geldi, santra yapılacak.");
                if(announcerText) announcerText.textContent = "VAR KARARI: GOL GEÇERLİ!";
            }
            
            updateScoreBoard();
            
            setTimeout(() => {
                if(varOverlay && varOverlay.parentNode) varOverlay.parentNode.removeChild(varOverlay);
                window.isVARCheckActive = false;
                isPaused = false;
            }, 3000);
            
        }, 5000); // 5 saniye VAR incelemesi sürer
    } else {
        // VAR yoksa normal skoru güncelle
        updateScoreBoard();
    }
};

window.initGame = initGame;

// ==========================================
// AÅAMA 47: MAÇ İÇİ DEÄİÅİKLİK (SUBSTITUTION) SİSTEMİ
// ==========================================
window.selectedSubPitch = null;
window.selectedSubBench = null;

window.openSubMenu = function() {
    isPaused = true;
    let modal = document.getElementById('sub-modal');
    if(modal) { modal.style.display = 'flex'; let title = modal.querySelector('h1, h2'); if(title) title.focus(); else modal.focus(); }
    window.renderSubLists();
}

window.renderSubLists = function() {
    let pitchList = document.getElementById('sub-pitch-list');
    let benchList = document.getElementById('sub-bench-list');
    let confirmBtn = document.getElementById('btn-sub-confirm');
    
    if(!pitchList || !benchList) return;
    
    pitchList.innerHTML = '';
    benchList.innerHTML = '';
    window.selectedSubPitch = null;
    window.selectedSubBench = null;
    confirmBtn.disabled = true;
    
    homePlayers.forEach((p, idx) => {
        let li = document.createElement('li');
        let staminaFloor = Math.floor(p.stamina);
        let conditionDesc = staminaFloor < 40 ? "Çok Yorgun, pili bitti" : (staminaFloor < 70 ? "Yorulmaya başladı" : "Kondisyonu iyi durumda");
        
        if (p.isRedCarded) {
            li.textContent = p.name + " (" + p.position + ") [KIRMIZI KART / SAKAT - DEĞİŞTİRİLEMEZ]";
            li.setAttribute('aria-label', p.name + " kırmızı kart gördü veya ağır sakatlandı. Bu oyuncuyu değiştiremezsiniz.");
            li.style.color = "#555";
            li.style.textDecoration = "line-through";
            li.style.padding = "5px";
            li.style.borderBottom = "1px solid #555";
            pitchList.appendChild(li);
            return; // Seçime izin verme
        }
        
        let statusTag = "";
        let ariaStatus = "";
        if (p.isOnFire) { statusTag = " (Alev Aldı 🔥)"; ariaStatus = "Şu an adrenalin patlaması yaşıyor ve alev almış durumda. "; }
        else if (p.isChantedByFans) { statusTag = " (Taraftarın Sevgilisi)"; ariaStatus = "Tribünler sadece onun adını tezahürat yapıyor. Morali zirvede. "; }
        else if (p.isBooedByOwnFans) { statusTag = " (Islıklanıyor)"; ariaStatus = "Şu an taraftar onu ıslıklıyor. "; }
        
        li.textContent = p.name + " (" + p.position + ")" + statusTag + " | Enerji: %" + staminaFloor + " (" + conditionDesc + ")";
        li.setAttribute('aria-label', p.name + " isimli ilk 11 oyuncusu. Mevkisi " + p.position + ". " + ariaStatus + "Sahadaki fiziksel enerjisi yüzde " + staminaFloor + ". Durumu: " + conditionDesc);
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.style.padding = "5px";
        li.style.borderBottom = "1px solid #555";
        li.style.cursor = "pointer";
        let selectFunc = () => {
            Array.from(pitchList.children).forEach(c => c.style.background = 'transparent');
            li.style.background = '#e74c3c';
            window.selectedSubPitch = {player: p, index: idx};
            window.checkSubConfirm();
        };
        li.onclick = selectFunc;
        li.onkeydown = (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectFunc(); } };
        pitchList.appendChild(li);
    });
    
    if(window.homeBenchPlayers) {
        window.homeBenchPlayers.forEach((p, idx) => {
            let li = document.createElement('li');
            li.textContent = p.name + " (" + p.position + ") Güç:" + p.power;
            li.setAttribute('aria-label', "Yedek oyuncu " + p.name + ". Mevkisi " + p.position + ". Genel futbol gücü " + p.power);
            li.tabIndex = 0;
            li.setAttribute('role', 'button');
            li.style.padding = "5px";
            li.style.borderBottom = "1px solid #555";
            li.style.cursor = "pointer";
            let selectFunc = () => {
                Array.from(benchList.children).forEach(c => c.style.background = 'transparent');
                li.style.background = '#27ae60';
                window.selectedSubBench = {player: p, index: idx};
                window.checkSubConfirm();
            };
            li.onclick = selectFunc;
            li.onkeydown = (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectFunc(); } };
            benchList.appendChild(li);
        });
    }
}

window.checkSubConfirm = function() {
    let btn = document.getElementById('btn-sub-confirm');
    if(btn) btn.disabled = !(window.selectedSubPitch && window.selectedSubBench);
}

// Event Listeners (ensure they are attached once)
setTimeout(() => {
    let pauseBtn = document.getElementById('btn-pause-sub');
    let closeBtn = document.getElementById('btn-sub-close');
    let confBtn = document.getElementById('btn-sub-confirm');
    
    if(pauseBtn && !pauseBtn.hasListener) { pauseBtn.addEventListener('click', window.openSubMenu); pauseBtn.hasListener = true; }
    if(closeBtn && !closeBtn.hasListener) { 
        closeBtn.addEventListener('click', () => { if(document.getElementById('sub-modal')) if(document.getElementById('sub-modal')) if(document.getElementById('sub-modal')) document.getElementById('sub-modal').style.display = 'none'; isPaused = false; }); 
        closeBtn.hasListener = true; 
    }
    if(confBtn && !confBtn.hasListener) {
        confBtn.addEventListener('click', () => {
            let pOut = window.selectedSubPitch.player;
            let pInData = window.selectedSubBench.player;
            let pitchIdx = window.selectedSubPitch.index;
            let benchIdx = window.selectedSubBench.index;
            
            if (pOut.isBooedByOwnFans) {
                window.managerAuthority = Math.min(100, window.managerAuthority + 20);
                if(typeof speak === 'function') {
    let msgs = [
        "Hoca taraftarın sesini duydu ve o oyuncuyu kenara aldı! Tribünler ayakta!",
        "Islıklanan oyuncu oyundan alınıyor! Stadyumda hocanın bu kararına müthiş bir destek alkışı var.",
        "Bu değişiklik tribünlerin gazını aldı. Hoca adeta krizi fırsata çevirdi!",
        "Yuhalanan isim kenara gelirken taraftar teknik direktöre sevgi gösterilerinde bulunuyor."
    ];
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
}
            } else {
                if(typeof speak === 'function') speak("Taktiksel bir değişiklik yapılıyor. " + pOut.name + " kenara geliyor.");
            }
            
            let isWorldClass = pInData.power >= 90 && pInData.mentalTrait === 'elite';
            let isTier2 = pInData.power >= 80 && pInData.power < 90;
            let isTier3 = pInData.power < 80 && pInData.power >= 55;
            
            homePlayers[pitchIdx].name = pInData.name;
            homePlayers[pitchIdx].position = pInData.position;
            homePlayers[pitchIdx].power = pInData.power;
            homePlayers[pitchIdx].speed = pInData.speed || 3.0;
            homePlayers[pitchIdx].baseSpeed = pInData.speed || 3.0;
            homePlayers[pitchIdx].tacticalRole = pInData.tacticalRole || 'classic';
            homePlayers[pitchIdx].mentalTrait = pInData.mentalTrait || 'elite';
            homePlayers[pitchIdx].isWorldClass = isWorldClass;
            homePlayers[pitchIdx].isTier2 = isTier2;
            homePlayers[pitchIdx].isTier3 = isTier3;
            homePlayers[pitchIdx].stamina = 100;
            homePlayers[pitchIdx].mistakes = 0;
            homePlayers[pitchIdx].isBooedByOwnFans = false;
            
            window.homeBenchPlayers.splice(benchIdx, 1);
            if(document.getElementById('sub-modal')) document.getElementById('sub-modal').style.display = 'none';
            isPaused = false;
        });
        confBtn.hasListener = true;
    }
    
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            let modal = document.getElementById('sub-modal');
            if (modal && modal.style.display === 'flex') {
                modal.style.display = 'none';
                isPaused = false;
            } else if (modal && gameActive) {
                window.openSubMenu();
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    });
}, 1000);

// --- OYUNCU PROFİLİ (PLAYER PROFILE) MANTIÄI ---
let currentPlayerInProfile = null;


window.calculatePlayerExperience = function(player) {
    if (player.experience !== undefined) return player.experience;
    let power = player.power || 50;
    let age = player.age || 25;
    // Formül: 17 yaşını temel al. Her yıl için +2XP. Gücün 50'nin üzerindeki her puanı için +1XP.
    // 35 yaşında 85 güçlü biri: (35-17)*2 + (85-50)*1 = 36 + 35 = 71
    let xp = (age - 17) * 2 + (power - 50) * 1.5;
    // Biraz da rastgelelik ve rol bonusu katalım (lider ruhlular daha tecrübeli)
    if (player.mentalTrait === 'leader' || player.mentalTrait === 'elite') xp += 10;
    if (player.mentalTrait === 'fragile') xp -= 10;
    
    xp = Math.max(1, Math.min(100, Math.floor(xp)));
    player.experience = xp; // cache it
    return xp;
};


// [YENİ] Russell's Circumplex Psikolojik Model (Ruh Hali)

// [YENİ] Matematiksel Form ve Psikoloji Motoru (Stardew Valley Tarzı)

// [YENİ] MERKEZİ PSİKOLOJİ OLAY İŞLEYİCİ (Zorluk ve Mental Kalkan)

// [YENİ] TAKIMSAL RAHATLAMA (Opponent miss / GK save)
window.triggerReliefEvent = function(teamType) {
    if (teamType === 'home' && typeof homePlayers !== 'undefined') {
        homePlayers.forEach(p => { if(!p.isRedCarded) window.triggerPsychEvent(p, 'relief'); });
    } else if (teamType === 'away' && typeof awayPlayers !== 'undefined') {
        awayPlayers.forEach(p => { if(!p.isRedCarded) window.triggerPsychEvent(p, 'relief'); });
    }
};

window.triggerPsychEvent = function(char, eventType) {
    char.consecutiveErrors = char.consecutiveErrors || 0;
    
    if (eventType === "success") {
        char.consecutiveErrors = 0; // Hata serisi sıfırlanır
        char.consecutiveSuccess = (char.consecutiveSuccess || 0) + 1;
        
        // Ödül: Alev Aldı 🔥 Sistemi
        if (char.consecutiveSuccess >= 3 && !char.isOnFire) {
            char.isOnFire = true;
            char.onFireUntil = (typeof timeLeft !== 'undefined') ? timeLeft - 10 : 0; // 10 dakika boyunca alevli
            if(typeof speak === 'function' && char.isUserControlled) {
                speak(char.name + " resmen alev aldı! Onu durdurmak imkansız!");
            }
        }
        
        char.morale = Math.min(100, (char.morale || 75) + 15); // Başarı morali artırır
        char.stamina = Math.max(0, (char.stamina || 100) - 2);  // Ama fiziksel efor harcatır
    } 
    else if (eventType === "error") {
        char.consecutiveSuccess = 0;
        char.consecutiveErrors += 1;
        
        let difficulty = window.gameDifficulty || "hard";
        let basePenalty = 2;
        let finalPenalty = basePenalty;
        
        // 1. Tecrübe (Veteran) Kalkanı: Exp > 80 ise üstel çöküş yaşamaz
        let exp = (typeof window.calculatePlayerExperience === 'function') ? window.calculatePlayerExperience(char) : 50;
        let isVeteran = exp > 80;

        if (difficulty === "hard" && !isVeteran) {
            finalPenalty = basePenalty * Math.pow(2, char.consecutiveErrors - 1); // 2, 4, 8...
        }

        // 2. Çöküş Tavanı: Tek hatadan maksimum 8 moral düşebilir
        if (finalPenalty > 8) finalPenalty = 8;
        
        // Kaptan Etkisi (Liderlik)
        let hasCaptainBuff = false;
        if (typeof homePlayers !== 'undefined' && homePlayers.includes(char)) {
            hasCaptainBuff = homePlayers.some(p => typeof window.calculatePlayerExperience === 'function' && window.calculatePlayerExperience(p) > 85 && !p.isRedCarded);
        } else if (typeof awayPlayers !== 'undefined' && awayPlayers.includes(char)) {
            hasCaptainBuff = awayPlayers.some(p => typeof window.calculatePlayerExperience === 'function' && window.calculatePlayerExperience(p) > 85 && !p.isRedCarded);
        }
        
        if (hasCaptainBuff) {
            finalPenalty = finalPenalty * 0.5; // Kaptan cezayı yarı yarıya emer
        }

        // Pasif çevresel kalkan (Mental Kalkan = İtfaiyeci Menajer veya Taraftar Alkışı)
        let hasMentalShield = false;
        if (window.leagueData && window.leagueData.playerProfile === 'itfaiyeci') hasMentalShield = true;
        if (window.isRhythmicClapping) hasMentalShield = true; // Maç sonu taraftar desteği
        if (char.isChantedByFans) hasMentalShield = true; // [ÖDÜL SİSTEMİ]: Tribünlerin Sevgilisi kalkanı
        
        if (hasMentalShield) {
            finalPenalty = finalPenalty * 0.7; // %30 kalkan etkisi
            if (char.isChantedByFans) finalPenalty = 0; // Sevgilinin morali düşmez
        }

        char.morale = Math.max(0, (char.morale || 75) - finalPenalty);
    }
    else if (eventType === "relief") {
        // 3. Savunma Başarısı = Psikolojik Rahatlama
        char.consecutiveErrors = 0; // "Ucuz atlattık" hissi hata serisini sıfırlar
        char.morale = Math.min(100, (char.morale || 75) + 5); 
    }
    else if (eventType === "rest") {
        // Aktif dinlenme eylemi: Hızlı enerji, yavaş moral kazanımı
        let vo2MaxMultiplier = (char.basePower || 70) / 100;
        char.stamina = Math.min(100, (char.stamina || 100) + (0.5 * vo2MaxMultiplier));
        char.morale = Math.min(100, (char.morale || 75) + 0.1);
    }
};

window.getPlayerPsychState = function(player) {
    let m = player.morale !== undefined ? player.morale : 75;
    let e = player.stamina !== undefined ? player.stamina : 100; // Kondisyon = Enerji
    
    if (e > 75 && m > 75) return { id: 'flow', name: 'Akış (Flow)', desc: 'Yüksek Enerji / Pozitif.', color: '#2ecc71', icon: '🔥' };
    if (e < 50 && m > 75) return { id: 'calm', name: 'Dingin', desc: 'Düşük Enerji / Pozitif. Yorgun ama dikkatli.', color: '#3498db', icon: '🌊' };
    if (e > 75 && m < 40) return { id: 'tense', name: 'Asabi', desc: 'Yüksek Enerji / Negatif. Hızlı ama aceleci ve dikkatsiz.', color: '#e67e22', icon: '⚡' };
    if (e < 30 && m < 30) return { id: 'burnout', name: 'Tükenmiş', desc: 'Düşük Enerji / Negatif. Sistemsel iflas.', color: '#e74c3c', icon: '🔋' };
    
    return { id: 'standard', name: 'Standart', desc: 'Normal bir psikolojik durumda.', color: '#bdc3c7', icon: '😐' };
};

window.calculatePerformance = function(char) {
    let e = char.stamina !== undefined ? char.stamina : 100;
    let m = char.morale !== undefined ? char.morale : 75;
    
    // Form Çarpanı Formülü
    let formMultiplier = ((e * 0.4) + (m * 0.6)) / 100;
    
    let accuracyPenalty = 0;
    // Asabiyet durumu kontrolü
    if (e > 70 && m < 40) {
        accuracyPenalty = 20; // Dikkatsizlik ve acelecilik cezası
    }
    
    let baseSpd = char.baseSpeed || 3;
    let baseAcc = char.basePower || 50; // Power'ı accuracy olarak kullanıyoruz
    
    let finalSpeed = baseSpd * (1 + (formMultiplier - 0.5));
    let finalAccuracy = (baseAcc * formMultiplier) - accuracyPenalty;
    
    return {
        speed: Math.max(0.5, finalSpeed), // Hız eksiye düşmesin
        accuracy: Math.max(1, finalAccuracy) // Güç/İsabet 1'in altına inmesin
    };
};

window.showPlayerProfile = function(player) {
    currentPlayerInProfile = player;
    const modal = document.getElementById('player-profile-modal');
    if (!modal) return;

    // Temel Bilgiler
    document.getElementById('pp-name').textContent = player.name + (player.isRetiring ? " (Sezon Sonu Bırakıyor)" : "");
    
    // Stats Update
    if(document.getElementById('pp-stat-matches')) {
        let careerM = player.careerMatches || 0;
        let seasonM = player.seasonMatches || 0;
        let elMatches = document.getElementById('pp-stat-matches');
        if(elMatches) elMatches.textContent = seasonM + " (Kariyer: " + careerM + ")";
    }
    if(document.getElementById('pp-stat-goals')) document.getElementById('pp-stat-goals').textContent = player.seasonGoals || 0;
    if(document.getElementById('pp-stat-assists')) document.getElementById('pp-stat-assists').textContent = player.seasonAssists || 0;
    
    // Value Update
    if(document.getElementById('pp-market-value')) {
        let price = player.price;
        if (!price && typeof calculatePrice === 'function') price = calculatePrice(player);
        if (!price) price = 1;
        document.getElementById('pp-market-value').textContent = '€' + price + '.00m';
    }
    
    let elAge = document.getElementById('pp-age');
    if(elAge) elAge.textContent = player.age || 25;
    
    let elPos = document.getElementById('pp-position');
    if(elPos) elPos.textContent = player.position || "Belirsiz";

    let elRole = document.getElementById('pp-role');
    if (elRole) {
        const mentalIcons = { "elite": "Lider", "aggressive": "Agresif", "fragile": "Hassas" };
        const roleIcons = {
            "inside_forward": "Kat Eden", "poacher": "Fırsatçı", "target_man": "Pivot",
            "playmaker": "Oyun Kurucu", "maestro": "Şef", "box_to_box": "Dinamo",
            "anchor": "Çapa", "stopper": "Duvar", "sweeper": "Süpürücü",
            "classic": "Klasik", "sweeper_keeper": "Uçan Kaleci", "false_9": "Sahte 9", "regista": "Regista"
        };
        let mentalStr = mentalIcons[player.mentalTrait] || "Standart";
        let roleStr = roleIcons[player.tacticalRole] || "Genel";
        elRole.textContent = `Taktik: ${roleStr} (${mentalStr})`;
    }
    
    if(document.getElementById('pp-birthplace')) {
        let natFlag = (player.nationality && window.nationalities && window.nationalities[player.nationality]) ? window.nationalities[player.nationality].flag + " " + window.nationalities[player.nationality].name : "Bilinmiyor";
        if (player.isNationalPlayer) natFlag += " (Milli Oyuncu)";
        document.getElementById('pp-birthplace').textContent = natFlag;
    }
    
    // Takım Adı
    let teamName = "Bilinmiyor";
    if (player.teamId === "free_agent") {
        teamName = "Serbest Oyuncu";
    } else {
        const teamObj = window.leagueData.teams.find(t => t.id === player.teamId);
        if (teamObj) teamName = teamObj.name;
    }
    document.getElementById('pp-team').textContent = teamName;

    // Özellikler
    document.getElementById('pp-power').textContent = player.power;
    document.getElementById('pp-speed').textContent = player.speed || "-";
    
    // [YENİ] Ruh Hali (Circumplex Model)
    const ppMorale = document.getElementById('pp-morale');
    if (ppMorale) {
        let pState = window.getPlayerPsychState(player);
        ppMorale.innerHTML = `<span style='color:${pState.color}' title='${pState.desc}'>${pState.icon} ${pState.name}</span>`;
        ppMorale.setAttribute('aria-label', "Ruh Hali: " + pState.name + ". " + pState.desc);
    }
    
    let mentalText = "Standart";
    switch(player.mentalTrait) {
        case 'aggressive': mentalText = "Agresif ve Hırslı"; break;
        case 'elite': mentalText = "Elit Profesyonel"; break;
        case 'consistent': mentalText = "İstikrarlı ve Sakin"; break;
        case 'fragile': mentalText = "Duygusal ve Kırılgan"; break;
        case 'creative': mentalText = "Yaratıcı Vizyoner"; break;
        case 'lazy': mentalText = "Tembel ve Dengesiz"; break;
        default: mentalText = player.mentalTrait || "Standart";
    }
    document.getElementById('pp-mental').textContent = mentalText;
    
    document.getElementById('pp-role').textContent = player.tacticalRole || "Belirsiz";

// [YENİ] Deneyim Puanı Hesapla ve Göster
const expEl = document.getElementById('pp-experience');
if (expEl) {
    let xp = window.calculatePlayerExperience(player);
    let expText = "Bilinmiyor";
    let expColor = "white";
    if (xp >= 80) { expText = "Kurt/Usta (" + xp + ")"; expColor = "#f1c40f"; } // Altın
    else if (xp >= 60) { expText = "Tecrübeli (" + xp + ")"; expColor = "#2ecc71"; } // Yeşil
    else if (xp >= 30) { expText = "Gelişmekte (" + xp + ")"; expColor = "#3498db"; } // Mavi
    else { expText = "Çaylak (" + xp + ")"; expColor = "#e74c3c"; } // Kırmızı
    
    expEl.innerHTML = "<span style='color:" + expColor + "'>" + expText + "</span>";
}

    
    // [YENİ] Reyting Puanı
    const ratingEl = document.getElementById('pp-rating');
    if (ratingEl) {
        if (player.lastMatchRating) {
            ratingEl.textContent = player.lastMatchRating + " / 10";
        } else {
            ratingEl.textContent = "-";
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }

    // [YENİ] Kariyer Özeti (CV) - GERÇEK WIKIPEDIA ENTEGRASYONU
    let cvEl = document.getElementById('pp-cv-text');
    if (cvEl) {
        cvEl.innerHTML = "Gerçek kariyer geçmişi internetten çekiliyor... Lütfen bekleyin ğŸŒ";
        
        // Önce varsayılan dinamik CV'yi oluştur
        let fallbackCvText = "";
        if (player.age <= 19) {
            fallbackCvText = "Henüz kariyerinin çok başında. Altyapıdan yetişti veya alt liglerde keşfedildi.";
        } else if (player.power >= 85) {
            fallbackCvText = "Dünya çapında tanınan bir süper yıldız. Daha önce Avrupa'nın en büyük devlerinde kupalar kaldırdı.";
        } else if (player.power >= 75) {
            fallbackCvText = "Kariyerinde oldukça istikrarlı. Avrupa'nın önde gelen liglerinde tecrübesi bulunuyor.";
        } else if (player.age >= 32) {
            fallbackCvText = "Kariyerinin sonbaharında tecrübeli bir kurt. Yıllarca süper lig ve alt liglerde sayısız maça çıktı.";
        } else {
            fallbackCvText = "Standart bir kariyeri var. Yeteneklerini kanıtlamak ve bir üst seviyeye çıkmak için kendini göstermeye çalışıyor.";
        }
        
        let totalGoals = player.seasonGoals || 0;
        let totalAssists = player.seasonAssists || 0;
        let matches = player.seasonMatches || 0;
        let statsHtml = `<br><br><strong>Bu Sezon:</strong> ${matches} Maç | ${totalGoals} Gol | ${totalAssists} Asist`;

        // Wikipedia'dan gerçek veriyi çek (fetch)
        let formattedName = encodeURIComponent(player.name.trim());
        let wikiUrl = `https://tr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${formattedName}&format=json&origin=*`;
        
        fetch(wikiUrl)
            .then(response => response.json())
            .then(data => {
                let pages = data.query.pages;
                let pageId = Object.keys(pages)[0];
                if (pageId !== "-1" && pages[pageId].extract) {
                    // Wiki'den metin geldi!
                    let realBio = pages[pageId].extract;
                    // Çok uzunsa kısalt (maks 400 karakter)
                    if (realBio.length > 400) realBio = realBio.substring(0, 400) + "...";
                    cvEl.innerHTML = `<strong>(Gerçek Wikipedia Verisi)</strong><br><br>${realBio}`;
                } else {
                    // Wiki'de sayfa yoksa fallback kullan
                    cvEl.innerHTML = fallbackCvText;
                }
            })
            .catch(err => {
                // İnternet veya API hatası olursa fallback kullan
                cvEl.innerHTML = fallbackCvText;
            });
    }

    // Sözleşme Durumu
    const yearsLeft = player.contractYears || 1;
    document.getElementById('pp-contract-years').textContent = yearsLeft + " Yıl";
    
    const detailsEl = document.getElementById('pp-contract-details');
    if (yearsLeft === 1) {
        detailsEl.textContent = "Sözleşmesi bu sezon sonunda (Yaz Transfer Döneminde) bitecek ve boşa düşecek.";
        detailsEl.style.color = "#e74c3c"; // Kırmızımsı uyarı
    } else {
        detailsEl.textContent = `Oyuncunun sözleşmesi ${yearsLeft} sezon sonra (Yaz Transfer Dönemi) bitecek.`;
        detailsEl.style.color = "#bdc3c7";
    }

    // Yönetim Aksiyonları Görünürlüğü
    const yonetimContainer = document.getElementById('cv-tab-yonetim');
    if (yonetimContainer) {
        if (player.teamId === window.myTeam.id) {
            yonetimContainer.style.display = 'block';
            
            // "Yönetim" sekmesindeki butonların durumlarını güncelle
            const btnTransfer = document.getElementById('btn-action-transfer');
            if (btnTransfer) {
                btnTransfer.innerHTML = player.isListed ? "✅ Transfer Listesinden Kaldır" : "🛒 Transfer Listesine Koy";
            }
            const btnReserves = document.getElementById('btn-action-reserves');
            if (btnReserves) {
                btnReserves.innerHTML = player.isReserves ? "⚽ A Takıma Geri Al" : "🚫 Kadro Dışı Bırak (Altyapıya Gönder)";
            }
        } else {
            yonetimContainer.style.display = 'none';
        }
    }

    modal.style.display = 'flex'; if(modal) { let title = modal.querySelector('h1, h2'); if(title) title.focus(); else modal.focus(); };
    modal.classList.remove('hidden');
    if(typeof speak === 'function') speak(`${player.name} oyuncu profili açıldı.`);
};

window.closePlayerProfile = function() {
    const modal = document.getElementById('player-profile-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        currentPlayerInProfile = null;
    }
};



// --- GLOBAL PLAYER ACTIONS (YÖNETİM SEKMESİ) ---
window.actionTalkPlayer = function() {
    if (!currentPlayerInProfile) return;
    if (typeof window.openPlayerInteraction === 'function') {
        window.closePlayerProfile();
        window.openPlayerInteraction(currentPlayerInProfile);
    } else {
        alert("Görüşme sistemi bulunamadı.");
    }
};

window.actionToggleTransferList = function() {
    if (!currentPlayerInProfile) return;
    currentPlayerInProfile.isListed = !currentPlayerInProfile.isListed;
    if (currentPlayerInProfile.isListed && typeof calculatePrice === 'function') {
        currentPlayerInProfile.price = calculatePrice(currentPlayerInProfile);
    }
    
    let msg = currentPlayerInProfile.isListed ? `${currentPlayerInProfile.name} transfer listesine eklendi.` : `${currentPlayerInProfile.name} transfer listesinden çıkarıldı.`;
    if(typeof speak === 'function') speak(msg);
    
    // Update button UI immediately
    const btnTransfer = document.getElementById('btn-action-transfer');
    if (btnTransfer) {
        btnTransfer.innerHTML = currentPlayerInProfile.isListed ? "✅ Transfer Listesinden Kaldır" : "🛒 Transfer Listesine Koy";
    }
    
    if(typeof loadSquadScreen === 'function') loadSquadScreen();
};

window.removePlayerFromTactics = function(playerId) {
    if (window.myTeam) {
        if (window.myTeam.formation) {
            window.myTeam.formation = window.myTeam.formation.map(id => id === playerId ? null : id);
        }
        if (window.myTeam.subs) {
            window.myTeam.subs = window.myTeam.subs.map(id => id === playerId ? null : id);
        }
    }
};


window.actionToggleReserves = function() {
    if (!currentPlayerInProfile) return;
    currentPlayerInProfile.isReserves = !currentPlayerInProfile.isReserves;
    
    if (currentPlayerInProfile.isReserves) {
        // Remove from formation and subs
        window.removePlayerFromTactics(currentPlayerInProfile.id);
    }
    
    let msg = currentPlayerInProfile.isReserves ? `${currentPlayerInProfile.name} kadro dışı bırakıldı ve altyapıya gönderildi.` : `${currentPlayerInProfile.name} affedildi ve A takıma alındı.`;
    if(typeof speak === 'function') speak(msg);
    
    const btnReserves = document.getElementById('btn-action-reserves');
    if (btnReserves) {
        btnReserves.innerHTML = currentPlayerInProfile.isReserves ? "⚽ A Takıma Geri Al" : "🚫 Kadro Dışı Bırak (Altyapıya Gönder)";
    }
    
    if(typeof loadSquadScreen === 'function') loadSquadScreen();
    if(typeof updateManagerMenu === 'function') updateManagerMenu();
    if(typeof updateSquadUI === 'function') updateSquadUI();
};

window.actionFirePlayer = function() {
    if (!currentPlayerInProfile) return;
    
    const yearsLeft = currentPlayerInProfile.contractYears || 1;
    const compensation = Math.floor(currentPlayerInProfile.power * yearsLeft * 0.1); 
    
    if (window.myTeam.budget < compensation) {
        if(typeof speak === 'function') speak("Kulübün bütçesi bu tazminatı ödemeye yetmiyor.");
        alert(`Kulübün bütçesi yetersiz! İstenen Tazminat: ${compensation}M€`);
        return;
    }

    const confirmFire = confirm(`${currentPlayerInProfile.name} isimli oyuncuyu kovmak üzeresiniz. ${compensation}M€ fesih bedeli bütçenizden düşülecek. Emin misiniz?`);
    if (confirmFire) {
        window.myTeam.budget -= compensation;
        currentPlayerInProfile.teamId = "free_agent";
        currentPlayerInProfile.isListed = false;
        currentPlayerInProfile.isReserves = false;
        
        window.removePlayerFromTactics(currentPlayerInProfile.id);
        
        if(typeof speak === 'function') speak(`${currentPlayerInProfile.name} takımdan gönderildi. ${compensation} milyon euro tazminat ödendi.`);
        
        window.closePlayerProfile();
        if(typeof loadSquadScreen === 'function') loadSquadScreen();
        if(typeof updateManagerMenu === 'function') updateManagerMenu();
        if(typeof updateSquadUI === 'function') updateSquadUI();
    }
};

window.executeCornerKick = function(isAway = false) {
    let rand = Math.random();
    
    // Mantıksal Çerçeve (Taktiksel Otonomi)
    let isTrailing = isAway ? (window.enemyScore < window.playerScore) : (window.playerScore < window.enemyScore);
    let isLeading = isAway ? (window.enemyScore > window.playerScore) : (window.playerScore > window.enemyScore);
    let isLateGame = typeof timeLeft !== 'undefined' && timeLeft < 20; // Son 20 dk
    
    if (!isAway) {
        // HÜCUM (Kullanıcı korner kullanıyor)
        let options = [];
        if (isTrailing && isLateGame) {
            options = ['crowded', 'far_post', 'block_keeper']; // Çok agresif, riskli
        } else if (isLeading && isLateGame) {
            options = ['short', 'box_edge']; // Zaman geçirme, paslaşma
        } else if (isTrailing) {
            options = ['near_post', 'far_post', 'crowded']; // Agresif
        } else if (isLeading) {
            options = ['short', 'near_post', 'box_edge']; // Kontrollü
        } else {
            options = ['near_post', 'far_post', 'short', 'box_edge', 'block_keeper']; // Dengeli
        }
        let strategy = options[Math.floor(Math.random() * options.length)];
        
        if (strategy === 'near_post') {
            if (rand < 0.20) { window.playerScore++; if(typeof speak === 'function') speak("Köşe vuruşu ön direğe sert kesildi! Harika bir kafa vuruşu ve GOOOOL! İnanılmaz bir organizasyon."); } 
            else { if(typeof speak === 'function') speak("Ön direğe kesilen topu savunma rahatça uzaklaştırıyor."); }
        } else if (strategy === 'far_post') {
            if (rand < 0.15) { window.playerScore++; if(typeof speak === 'function') speak("Arka direğe muazzam bir orta... Uzun boylu oyuncumuz harika yükseldi, kafa vuruşu ve ağlarda! GOOOL!"); } 
            else { if(typeof speak === 'function') speak("Arka direğe yapılan orta kalecinin ellerinde kaldı."); }
        } else if (strategy === 'short') {
            if (rand < 0.10) { window.playerScore++; if(typeof speak === 'function') speak("Korneri paslaşarak kullandılar... Ceza sahası dışından şut şansı, harika bir vuruş ve GOOOOL!"); } 
            else { if(typeof speak === 'function') speak("Paslaşarak kullanılan korner sonrası rakip savunma yerleşti, top çevirerek atağa baştan başlıyoruz."); }
        } else if (strategy === 'crowded') {
            if (rand < 0.25) { window.playerScore++; if(typeof speak === 'function') speak("Tüm takım ileri çıktı, ceza sahası çok kalabalık! Top içeri düştü, büyük bir karambol... Son vuruş ve GOOOOL! Topu ağlara itmeyi başardılar!"); } 
            else if (rand > 0.85) { window.enemyScore++; if(typeof speak === 'function') speak("Ceza sahasındaki kalabalıkta topu kaptırdık! Rakip inanılmaz hızlı bir kontratağa kalktı... Savunma bomboş... Ve maalesef top ağlarımızda! Çok ağır bir bedel ödedik."); } 
            else { if(typeof speak === 'function') speak("Kalabalık ceza sahasında seken top auta çıktı, büyük şanssızlık."); }
        } else if (strategy === 'box_edge') {
            if (rand < 0.18) { window.playerScore++; if(typeof speak === 'function') speak("Kornerde top ceza sahası yayına doğru çıkarıldı! Orada bomboş bekleyen oyuncumuzdan çok sert ve düzgün bir şut... GOOOOL! Mükemmel bir yay organizasyonu!"); } 
            else { if(typeof speak === 'function') speak("Yaya çıkarılan topta şut savunmadan döndü, rakip tehlikeyi savuşturdu."); }
        } else if (strategy === 'block_keeper') {
            if (rand < 0.22) { window.playerScore++; if(typeof speak === 'function') speak("Korner kullanıldı! Forvetimiz rakip kaleciyi çok iyi perdeledi, kaleci boşa çıktı... Kafa vuruşu ve GOOOOL! Kaleciyi çaresiz bıraktılar."); } 
            else if (rand > 0.90) { if(typeof speak === 'function') speak("Korner atışında oyuncumuz kaleciye faul yaptı. Perdeleme taktiği geri tepti, serbest vuruş rakibin."); }
            else { if(typeof speak === 'function') speak("Top içeri kesildi ama savunma kalecinin önünü temizleyip topu kornere vurdu."); }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    } else {
        // SAVUNMA (Rakip korner kullanıyor)
        let options = [];
        if (isLeading) {
            options = ['zone', 'mixed']; // Rakip saldırıyor, biz kapanıyoruz
        } else if (isTrailing && isLateGame) {
            options = ['man_to_man', 'zone']; // Agresif markaj veya kontratak kovalama
        } else {
            options = ['zone', 'man_to_man', 'mixed']; 
        }
        let defenseStrategy = options[Math.floor(Math.random() * options.length)];
        
        if (defenseStrategy === 'zone') {
            if (rand < 0.10) { window.enemyScore++; if(typeof speak === 'function') speak("Rakip korneri kullandı... Alan savunmamızın boşluğuna düşen topta rakip oyuncu bomboş kafayı vurdu ve golü buldu. Kötü bir yerleşim hatası!"); } 
            else if (rand > 0.90) { window.playerScore++; if(typeof speak === 'function') speak("Rakibin kornerinde alan savunmamız topu başarıyla uzaklaştırdı! İnanılmaz bir hızla kontratağa çıkıyoruz... Kaleciyle karşı karşıya ve GOOOOL! Harika bir kontratak!"); }
            else { if(typeof speak === 'function') speak("Rakip korner kullandı, alan savunması yapan takımımız kendi bölgesine düşen topu başarıyla uzaklaştırdı."); }
        } else if (defenseStrategy === 'man_to_man') {
            if (rand < 0.12) { window.enemyScore++; if(typeof speak === 'function') speak("Korner kullanıldı... Savunmacımız adamını kaçırdı! Birebir markajda yapılan bu hata pahalıya patlıyor, top ağlarımızda."); } 
            else { if(typeof speak === 'function') speak("Kornerde adam adama çok sert bir markaj uyguladık. Rakip oyunculara nefes aldırmıyoruz, tehlike uzaklaştırıldı."); }
        } else if (defenseStrategy === 'mixed') {
            if (rand < 0.15) { window.enemyScore++; if(typeof speak === 'function') speak("Rakibin köşe vuruşunda karma savunmamız biraz dengesiz yakalandı, seken topta rakip affetmiyor. Maalesef top ağlarımızda."); } 
            else { if(typeof speak === 'function') speak("Rakip korneri kullandı. Kritik alanları kapatan savunmamız hava topunu kazandı ve tehlikeyi savuşturdu."); }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
};

window.executeFreeKick = function(isAway = false) {
    let rand = Math.random();
    let isTrailing = isAway ? (window.enemyScore < window.playerScore) : (window.playerScore < window.enemyScore);
    let isLeading = isAway ? (window.enemyScore > window.playerScore) : (window.playerScore > window.enemyScore);
    let isLateGame = typeof timeLeft !== 'undefined' && timeLeft < 20;
    
    // Mesafeyi simüle et
    let isCloseRange = Math.random() < 0.65; 
    let options = [];
    
    if (isCloseRange) {
        options = ['direct', 'wall_break', 'touch_shoot', 'under_wall'];
    } else {
        if (isTrailing && isLateGame) {
            options = ['cross', 'early_cross', 'pick_and_roll']; // Doldur
        } else if (isLeading && isLateGame) {
            options = ['short', 'direct']; // Zaman geçir
        } else {
            options = ['cross', 'early_cross', 'pick_and_roll', 'direct'];
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }
    let strategy = options[Math.floor(Math.random() * options.length)];
    
    let scoreFunc = isAway ? () => { window.enemyScore++; } : () => { window.playerScore++; };
    
    // Anlatım yönünü belirle
    let prefix = isAway ? "Rakip " : "";
    let goalMsg = isAway ? "Maalesef top ağlarımızda..." : "GOOOOL!";
    let missMsg = isAway ? "Neyse ki kalemizi bulmadı." : "Çok kötü bir vuruş.";
    
    if (strategy === 'short') { // Yeni eklenen mantık için pas
        if(typeof speak === 'function') speak(prefix + "serbest vuruşu kısa pasla kullandı, topa sahip olarak oyunu yönlendiriyor.");
    } else if (strategy === 'direct') {
        if (rand < 0.15) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "tehlikeli noktadan serbest vuruş kullandı... Doğrudan kaleye harika bir şut! Top doksan dediğimiz yere gidiyor ve " + goalMsg); } 
        else if (rand < 0.5) { if(typeof speak === 'function') speak(prefix + "doğrudan kaleye sert bir şut çekti ama top barajdan dönüyor."); } 
        else { if(typeof speak === 'function') speak(prefix + "doğrudan vurdu ancak " + missMsg);
        window.triggerReliefEvent(isAway ? 'home' : 'away'); }
    } else if (strategy === 'wall_break') {
        if (rand < 0.20) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "barajı bozma taktiği uyguladı! Barajın içindeki kendi oyuncuları aniden çekildi ve açılan delikten füze gibi bir şut! " + goalMsg); } 
        else { if(typeof speak === 'function') speak(prefix + "barajı bozmaya çalıştı ama şut barajdaki diğer oyunculara çarpıp kornere çıktı."); }
    } else if (strategy === 'touch_shoot') {
        if (rand < 0.18) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "dokun-vur organizasyonu! Bir oyuncu topa hafif dokundu, geriden gelen oyuncu mermi gibi bir şut çıkardı! Kalecinin yapacak hiçbir şeyi yok, " + goalMsg); } 
        else { if(typeof speak === 'function') speak(prefix + "paslaşarak sert şut denedi ancak şut farklı şekilde dışarı çıktı."); }
    } else if (strategy === 'under_wall') {
        if (rand < 0.15) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "inanılmaz zekice bir iş çıkardı! Baraj zıplayınca topu yerden barajın altından gönderdi! Kaleci tamamen kontrpiyede kaldı, " + goalMsg); } 
        else { if(typeof speak === 'function') speak(prefix + "yerden vurmayı denedi ama baraj zıplamadı ve top barajın ayaklarında kaldı."); }
    } else if (strategy === 'cross') {
        if (rand < 0.20) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "serbest vuruşta topu ceza sahasına doldurdu... Havada muazzam bir mücadele, kafa vuruşu ve " + goalMsg); } 
        else { if(typeof speak === 'function') speak(prefix + "içeri doldurulan topta savunma hava topu hakimiyetini sağladı ve tehlikeyi uzaklaştırdı."); }
    } else if (strategy === 'early_cross') {
        if (rand < 0.15) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "savunma arkasına çok erken bir aşırtma pası attı! Ofsayt taktiği bozuldu, kaleciyle karşı karşıya bir vuruş ve " + goalMsg); } 
        else { if(typeof speak === 'function') speak(prefix + "erken bir orta kesti ama savunma dikkatli, ofsayt taktiği tıkır tıkır işledi."); }
    } else if (strategy === 'pick_and_roll') {
        if (rand < 0.18) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "ceza sahasında harika bir perdeleme! Basketboldaki pick-and-roll gibi rakibini bloke etti, boşa çıkan takım arkadaşından net bir vuruş ve " + goalMsg); } 
        else { if(typeof speak === 'function') speak(prefix + "perdeleme taktiği uyguladı ama hakem çok dikkatli! Hücum faul kararı verdi, atış el değiştiriyor."); }
    }
};

window.executeThrowIn = function(isAway = false) {
    let rand = Math.random();
    let isTrailing = isAway ? (window.enemyScore < window.playerScore) : (window.playerScore < window.enemyScore);
    let isLateGame = typeof timeLeft !== 'undefined' && timeLeft < 20;
    
    let strategy = 'triangle'; // Modern futbolda ana tercih
    if (isTrailing && isLateGame) {
        strategy = 'long_throw'; // Gerideysek ve son anlarsa doldur
    } else if (isTrailing && Math.random() < 0.3) {
        strategy = 'long_throw';
    } else if (Math.random() < 0.15) {
        strategy = 'long_throw'; // Bazen sürpriz olsun
    }
    
    let scoreFunc = isAway ? () => { window.enemyScore++; } : () => { window.playerScore++; };
    
    let prefix = isAway ? "Rakip " : "";
    let goalMsg = isAway ? "Maalesef top ağlarımızda..." : "GOOOOL!";
    
    if (strategy === 'long_throw') {
        if (rand < 0.15) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "taç atışını İngiliz stili uzun kullandı! Ceza sahasına fırlatılan topa içeride harika bir kafa vuruşu ve " + goalMsg); }
        else if (rand < 0.8) { if(typeof speak === 'function') speak(prefix + "uzun taç kullandı, ancak ceza sahasındaki kalabalıkta top savunmadan sekerek uzaklaştı."); }
        else { if(typeof speak === 'function') speak(prefix + "uzun taç denedi ama kaleci çıkıp topu rahatça aldı."); }
    } else if (strategy === 'triangle') {
        if (rand < 0.10) { scoreFunc(); if(typeof speak === 'function') speak(prefix + "taç atışında mükemmel bir üçgen kurdu! Kısa paslaşmalarla presi anında kırdılar, ters kanada harika bir pas, çaprazdan şut ve " + goalMsg); }
        else if (rand < 0.9) { if(typeof speak === 'function') speak(prefix + "kısa paslaşarak taç kullandı. Ortasahada kurulan üçgenle topu kontrol altına aldılar, oyun kurarak devam ediyorlar."); }
        else { if(typeof speak === 'function') speak(prefix + "kısa pasla üçgen kurmaya çalıştı ama baskı sonuç verdi, topu taç çizgisinde kaptırdılar!"); }
    }
};










// [YENİ] Modal kapatma için ESC tuşu desteği
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('player-profile-modal');
        if (modal && modal.style.display === 'flex') {
            if (typeof window.closePlayerProfile === 'function') {
                window.closePlayerProfile();
            } else {
                modal.style.display = 'none';
            }
        }
    }
});

// patch_sanitize_logic.js
window.sanitizePlayerValues = function(p) {
    if (!p) return;
    if (p.power === undefined || isNaN(p.power)) p.power = 10;
    if (p.speed === undefined || isNaN(p.speed)) p.speed = p.power > 10 ? p.power - 10 : 10;
    if (p.stamina === undefined || isNaN(p.stamina)) p.stamina = p.power;
    if (p.condition === undefined || isNaN(p.condition)) p.condition = 100;
    if (p.morale === undefined || isNaN(p.morale)) p.morale = 75;
    if (p.loyalty === undefined || isNaN(p.loyalty)) p.loyalty = 50;
    if (p.passing === undefined || isNaN(p.passing)) p.passing = p.power;
    if (p.shooting === undefined || isNaN(p.shooting)) p.shooting = p.power;
    if (p.setPieces === undefined || isNaN(p.setPieces)) p.setPieces = p.power > 5 ? p.power - 5 : 5;
    if (p.price === undefined || isNaN(p.price)) {
        if (typeof window.calculatePrice === 'function') {
            p.price = window.calculatePrice(p);
        } else {
            p.price = 1;
        }
    }
};

window.sanitizeTeamValues = function(t) {
    if (!t) return;
    if (t.budget === undefined || isNaN(t.budget)) t.budget = 20; // Default budget
    if (t.power === undefined || isNaN(t.power)) t.power = 50;
    if (t.morale === undefined || isNaN(t.morale)) t.morale = 75;
};

window.sanitizeGameGlobals = function() {
    if (window.budget === undefined || isNaN(window.budget)) window.budget = 20;
    if (window.managerAuthority === undefined || isNaN(window.managerAuthority)) window.managerAuthority = 50;
    if (window.presidentConfidence === undefined || isNaN(window.presidentConfidence)) window.presidentConfidence = 50;
    if (window.teamConfidence === undefined || isNaN(window.teamConfidence)) window.teamConfidence = 50;
};

window.sanitizeAllPlayers = function() {
    if (window.leagueData && window.leagueData.players) {
        window.leagueData.players.forEach(p => {
            window.sanitizePlayerValues(p);
        });
    }
    if (window.leagueData && window.leagueData.teams) {
        window.leagueData.teams.forEach(t => {
            window.sanitizeTeamValues(t);
        });
    }
    window.sanitizeGameGlobals();
};

window.triggerHalftimeSpeech = function(isManual = false) {
    isPaused = true;
    window.isPreMatch = false;

    let sHome = window.playerScore || 0;
    let sAway = window.enemyScore || 0;
    let diff = sHome - sAway;
    let psych = window.teamPsychology || 'neutral';

    let title = isManual ? "Mola: Saha Kenarı Konuşması" : "Devre Arası: Soyunma Odası";
    let desc = isManual ? "Maçı durdurdun ve oyuncuları etrafına topladın. " : "İlk yarı sona erdi. Soyunma odasındasınız. ";
    
    if (diff > 0) desc += "Takım skor avantajına sahip, ancak rehavete kapılmamak lazım. ";
    else if (diff < 0) desc += "Maalesef geridesiniz. Oyuncuların morali bozuk ve ter içinde senden bir hamle, bir taktik bekliyorlar. ";
    else desc += "Maç ortada geçiyor. Kilidi açacak bir dokunuşa ihtiyacımız var. ";

    if (psych === 'chaos') desc += "Ayrıca içeride büyük bir panik ve kaos havası var, herkes birbirini suçluyor. ";
    else if (psych === 'motivated') desc += "Buna rağmen herkes çok hırslı ve maçı bırakmaya niyetleri yok. ";

    desc += "Oyuncular gözlerinin içine bakıyor. Ne söylemek istersin?";

    if (typeof window.showDynamicEvent === 'function') {
        window.showDynamicEvent(title, desc, [
            {
                text: "Ateşli ve Sert Konuşma (Agresif)",
                action: function() {
                    homePlayers.forEach(p => {
                        p.stamina = Math.min(100, p.stamina + 30);
                        if (diff <= 0) {
                            p.morale = Math.min(100, p.morale + 30);
                            p.speed += 0.5;
                            p.power += 5;
                            if(p.bio) p.bio.adrenaline = 100;
                        } else {
                            // Öndeyken fırça atmak ters tepebilir
                            p.morale = Math.max(0, p.morale - 20);
                            if(p.bio) p.bio.cortisol = 80;
                            p.mistakes = (p.mistakes || 0) + 2;
                        }
                    });
                    isPaused = false;
                    if(typeof speak === 'function') speak("Sert konuşmanız soyunma odasında yankılandı. Takım ikinci yarıya çok agresif çıkacak!");
                }
            },
            {
                text: "Sakin ve Babacan Konuşma (Motivasyon)",
                action: function() {
                    homePlayers.forEach(p => {
                        p.stamina = Math.min(100, p.stamina + 40); // Sakinleşince iyi dinlenirler
                        p.morale = Math.min(100, p.morale + 15);
                        if(p.bio) { p.bio.cortisol = 0; p.bio.adrenaline = 30; }
                    });
                    isPaused = false;
                    if(typeof speak === 'function') speak("Babacan tavrınız oyuncuları rahatlattı. Stresleri azaldı, ikinci yarıya daha dingin çıkacaklar.");
                }
            },
            {
                text: "Sadece Taktiksel Analiz Yap",
                action: function() {
                    homePlayers.forEach(p => {
                        p.stamina = Math.min(100, p.stamina + 25);
                        p.mistakes = 0; // Hatalar sıfırlanır, isabet artar
                        p.power += 2; // Teknik kalite artar
                    });
                    isPaused = false;
                    if(typeof speak === 'function') speak("Tamamen taktiğe odaklandınız. Oyuncular disiplinli bir şekilde sahaya dönüyor. Pas ve şut hataları azalacak.");
                }
            },
            {
                text: "Galibiyet Primi Vaat Et (Kulüp Kasasından)",
                action: function() {
                    // Bütçe simülasyonu
                    window.clubBudget = (window.clubBudget || 5000000) - 500000;
                    
                    homePlayers.forEach(p => {
                        p.stamina = 100; // Yorgunluk sıfırlanır
                        p.morale = 100; // Moraller tavan
                        p.power += 10; // Para gücü artırır
                        p.speed += 0.5;
                        if(p.bio) p.bio.adrenaline = 100;
                    });
                    isPaused = false;
                    if(typeof speak === 'function') speak("Menajer kesenin ağzını açtı! Takım ikinci yarıya prim gazıyla çıkıyor. Eğer maçı alamazlarsa büyük kriz çıkacak!");
                }
            }
        ]);
    } else {
        isPaused = false;
    }
};

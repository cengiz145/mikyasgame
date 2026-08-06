
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
            muteBtn.innerHTML = '🔊';
            muteBtn.style.cssText = 'position:absolute; top:20px; right:20px; z-index:1000; font-size:2rem; background:transparent; border:none; cursor:pointer; outline:none; text-shadow: 0 0 10px rgba(0,0,0,0.5);';
            muteBtn.onclick = () => this.toggleMute();
            document.getElementById('game-container').appendChild(muteBtn);
        }
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
            
            // DİKKAT: BOĞUKLAŞTIRMA FİLTRESİ (BiquadFilter) YOK! Sesi net ve gür çıkacak.
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
            
            if(typeof speak === 'function') speak("Ev sahibi takım geriye düştü ve koca stadyum sustu! Şu an köşedeki o %5'lik küçük deplasman grubunun hiç susmadan söylediği marşlar tüm stadyumda yankılanıyor! Ev sahibi takım kendi evinde adeta deplasmanı yaşıyor!");

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
    }, 10000);
        }, 4000);
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
    },
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        let btn = document.getElementById('btn-mute');
        if (this.isMuted) {
            this.stopAmbiance();
            if (btn) btn.innerHTML = '🔇';
        } else {
            this.startAmbiance();
            if (btn) btn.innerHTML = '🔊';
        }
    }
};
// --- AUDIO MANAGER SONU ---

// game2.js - Tamamen Baştan Yazılmış Gelişmiş Futbol Motoru (Aşama 1-20)

let canvas = document.getElementById('game-canvas');
let ctx = canvas ? canvas.getContext('2d') : null;

// Durumlar ve Değişkenler
let gameActive = false;
      window.currentWeek = (window.currentWeek || 1) + 1;
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
const pauseMenuOptions = ['Devam Et', 'Taktik Değiştir', 'Oyuncu Değiştir', 'Maçtan Çekil'];

// AŞAMA 42: OYUN DURAKSAMA MEKANİĞİ
let isGameHalted = false;
let gameHaltTimer = 0;
let haltReason = "";



window.CrowdForm = 1;
window.currentWeek = window.currentWeek || 1;

window.updateCrowdForm = function() {
    if (typeof playerScore === 'undefined' || typeof enemyScore === 'undefined') return;
    
    let diff = enemyScore - playerScore;
    let newForm = 1;
    
    // Makro-Tribün Psikolojisi (Haftalar ilerledikçe Sabır Tükenir)
    // Sezon başı kredisi: (100 üzerinden) her hafta azalır. 
    // Toplam Sabır (Patience) = managerAuthority + Sezon Kredisi
    let seasonCredit = Math.max(0, 100 - (window.currentWeek * 5)); // Her hafta 5 kredi düşer (20 haftada biter)
    let patience = (window.managerAuthority || 100) + seasonCredit;

    // Sabır puanına göre ana form belirleniyor
    
      window.isHistoricalClub = window.isHistoricalClub || (Math.random() < 0.5); // Şimdilik simüle etmek için %50 ihtimal veya dışarıdan atanabilir
      window.seasonPoints = window.seasonPoints || (window.currentWeek * 1.5); // Geçici puan hesabı
      
      // FORM 7: Absürt Karnaval (Skorun Ölümü) - Şampiyonluk garantiyse veya küme düşmüşse
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
            let formNames = ["", "TRİBÜN FORMU 1: ROMANTİK İYİMSERLİK", "TRİBÜN FORMU 2: TAKTİKSEL HOMURDANMA", "TRİBÜN FORMU 3: YIKILAN KALE (TRAVMA)", "TRİBÜN FORMU 4: TOKSİK İSYAN", "TRİBÜN FORMU 5: RUHSUZ KABULLENİŞ", "TRİBÜN FORMU 6: GEÇMİŞİN HAYALETLERİ", "TRİBÜN FORMU 7: ABSÜRT KARNAVAL"];
            announcerText.textContent = "HAFTA " + window.currentWeek + " | " + formNames[newForm];
        }
    }
};
let playerScore = 0;
let enemyScore = 0;
let timeLeft = 90;
let matchTimer = null;
let matchEventTimer = null;

let currentWeather = 'sunny';
let teamPsychology = 'normal';
let prevPsychology = 'normal';
let historicWorstDeficit = 0;
let fatigueAnnounced = false; // AŞAMA 28: Yorgunluk anonsu yapıldı mı?

let strikerRunActive = false;
let strikerRunTimer = 0;
let currentStriker = null;

// AŞAMA 27: Forvet Psikolojisi
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
    // Sesleri başlat
    if (window.AudioManager) {
        window.AudioManager.init();
        window.AudioManager.startAmbiance();
          
          // AŞAMA 73: Sessizlik Protestosu
          window.isSilentProtest = false;
          if ((window.consecutiveLosses >= 2 && Math.random() < 0.6) || (window.managerAuthority < 40 && Math.random() < 0.5)) {
              window.isSilentProtest = true;
          }
          
          window.refereeExperience = Math.random() < 0.4 ? 'rookie' : 'veteran'; // Hakemin tecrübesi
          
          // AŞAMA 68: İşitsel Koreografi (Cehenneme Hoş Geldin) - SADECE DERBİ VE KRİTİK MAÇLARDA
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
                  }
                  // Deplasman Takımı Tehdit Altında ve Küçülmüş Hisseder
                  if (typeof awayPlayers !== 'undefined') {
                      awayPlayers.forEach(p => { 
                          p.speed = (p.speed || 3) * 0.85; // Bacakları titriyor
                          p.mistakes = 1; // Pas hatasına çok müsait başlarlar
                      });
                  }
              }
          }, 2000); // Maç başladıktan 2 saniye sonra tünel çıkışı reaksiyonu patlar
    }
    
    // Önceki maçtan kalan timer'ları temizle
    // Reset previous timers and DOM
    if (typeof matchTimer !== 'undefined') clearInterval(matchTimer);
    if (typeof matchEventTimer !== 'undefined') clearInterval(matchEventTimer);
    if (typeof drawInterval !== 'undefined') clearInterval(drawInterval);
    const scoreA = document.getElementById('score-home');
    const scoreB = document.getElementById('score-away');
    if (scoreA) scoreA.textContent = "0";
    if (scoreB) scoreB.textContent = "0";
    
    homePlayers = [];
    awayPlayers = [];
    
    // AŞAMA 31: Bağımsız Veritabanından Takım Çekme (Data.js)
    let homeRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.myTeamId || "galatasaray")) : [];
    let awayRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.todayOpponent || "fenerbahce")) : [];
    
    // --- YENİ: DERBİ KONTROLÜ ---
    let myTeamIdStr = window.myTeamId || "galatasaray";
    let oppTeamIdStr = window.todayOpponent || "fenerbahce";
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
        let hpOriginal = (homeRoster.length > i) ? homeRoster[i] : { name: "Oyuncu "+(i+1), speed: 3.5, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor' };
        // Deep copy so we don't permanently modify database
        let hp = JSON.parse(JSON.stringify(hpOriginal));
        
        // --- YENİ: DERBİ ADRENALİNİ ---
        if (window.isDerbyMatch) {
            hp.power += 5; // Derbi gerginliği gücü artırır
            if (hp.mentalTrait === 'aggressive') hp.speed *= 1.1; // Agresifler derbide uçar
            if (hp.mentalTrait === 'fragile' && Math.random() < 0.3) hp.power -= 8; // Kırılganlar bazen derbiyi kaldıramaz
        }
        // --- DERBİ ADRENALİNİ SONU ---
        
        // AŞAMA 36 & 37: İSTİKRAR & TIER 2
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
        let finalSpeed = hp.speed * badDay * ((hp.condition !== undefined ? hp.condition : 100) / 100);

        homePlayers.push({ 
            x: homeFormations[i].x, y: homeFormations[i].y, 
            speed: finalSpeed, baseSpeed: finalSpeed, condition: hp.condition !== undefined ? hp.condition : 100, name: hp.name, position: hp.position, id: hp.id,
            tacticalRole: hp.tacticalRole, mentalTrait: hp.mentalTrait, power: hp.power, isWorldClass: isWorldClass, isTier2: isTier2, isTier3: isTier3, passPending: false, shotPending: false,
            isUserControlled: false, isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false, bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }, emotions: { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 } 
        });
        
        let ap = (awayRoster.length > i) ? awayRoster[i] : { name: "Rakip "+(i+1), speed: 3.0, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor' };
        
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
        let finalSpeedA = ap.speed * badDayA * ((ap.condition !== undefined ? ap.condition : 100) / 100);

        awayPlayers.push({ 
            x: 800 - homeFormations[i].x, y: homeFormations[i].y, 
            speed: finalSpeedA, baseSpeed: finalSpeedA, condition: ap.condition !== undefined ? ap.condition : 100, name: ap.name, position: ap.position, id: ap.id,
            tacticalRole: ap.tacticalRole, mentalTrait: ap.mentalTrait, power: ap.power, isWorldClass: isWorldClassA, isTier2: isTier2A, isTier3: isTier3A, passPending: false, shotPending: false,
            isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false, bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }, emotions: { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 } 
        });
    }
    ball = { x: 400, y: 250, vx: 0, vy: 0, team: 'none', passCooldown: 0, isAirborne: false, airborneUntil: 0 };
    activePlayer = homePlayers[10];
    activePlayer.isUserControlled = true;
    
    window.abandonmentAnnounced = false;
      playerScore = 0; enemyScore = 0; timeLeft = 90;
    gameActive = true;
    isPaused = false;
    strikerRunActive = false;
    teamPsychology = 'normal';
    prevPsychology = 'normal';
    historicWorstDeficit = 0;
    
    // AŞAMA 27: Psikoloji Sıfırlama
    strikerConfidence = 100;
    strikerMissedShots = 0;
    lastShooter = null;
    
    if(matchTimer) clearInterval(matchTimer);
    if(matchEventTimer) clearInterval(matchEventTimer);
    
    matchTimer = setInterval(() => {
        
            window.wastedTime = window.wastedTime || 0;
            window.isInjuryTime = window.isInjuryTime || false;
            
            if(!isPaused && gameActive) {
                // Eğer oyun durmuşsa (Kırmızı kart, protesto vs.), saati durdurma ama boşa geçen süreyi kaydet
                if (typeof isGameHalted !== 'undefined' && isGameHalted) {
                    window.wastedTime++;
                }
                
                timeLeft--;
              timeLeft--;
                
                // AŞAMA 83: Biyokimyasal Motor Güncellemesi
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
                    
                    // AŞAMA 84: Duygu Motoru Güncellemesi
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
                };
                
                if (typeof homePlayers !== 'undefined') homePlayers.forEach(p => updateBiochemistry(p, true));
                if (typeof awayPlayers !== 'undefined') awayPlayers.forEach(p => updateBiochemistry(p, false));
                
                if (typeof window.updateCrowdForm === 'function') window.updateCrowdForm();
                
                // AŞAMA 78: Bölünmüş Tribün Kaosu
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
                
                // AŞAMA 77: Form 5 (Umursamazlık Paradoksu)
                
                // AŞAMA 81: Yan Form 4 (Organize Boykot)
                window.isOrganizedBoycott = false;
                if (typeof window.presidentConfidence !== 'undefined' && window.presidentConfidence < 30 && timeLeft > 45) {
                    window.isOrganizedBoycott = true;
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.05; // Ölüm sessizliği
                    
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.speed = (p.baseSpeed || 3) * 0.6; // Motor gücü eksikliği
                        });
                    }
                }
                
                // Form 6: Geçmişin Hayaletleri
                if (window.CrowdForm === 6) {
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.power = (p.power || 50) * 0.5; // Formanın kurşun gibi ağırlaşması (Şut çekemez)
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
                            p.speed = (p.baseSpeed || 3) * 0.5; // Laubalilik
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
                            p.speed = (p.baseSpeed || 3) * 0.7; // Antrenman temposu
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
                  let sA = playerScore;
                  let sB = enemyScore;
                  
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
            
            // AŞAMA 28: Spiker Yorgunluk Uyarısı
            if (timeLeft === 30 && !fatigueAnnounced) {
                fatigueAnnounced = true;
                let msg = "Maçta son bölümlere giriyoruz. Oyuncuların pilleri bitti, sahada yürümeye başladılar. Hoca değişiklik yapmalı!";
                if(typeof speak === 'function') speak(msg);
                announcerText.textContent = msg;
            }
            
            // AŞAMA 32: Rakip Bot Menajer Taktik Müdahalesi (Her 5 saniyede bir analiz)
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
    }, 10000); // Maç süresi uzatıldı (1 oyun dakikası = 10 saniye, toplam maç 15 dakika)
    
    matchEventTimer = setInterval(() => {
        if(!isPaused && gameActive) triggerRandomMatchEvent();
    }, 150000); // Rastgele olayların sıklığı uzatılan süreye göre ayarlandı
    
    requestAnimationFrame(gameLoop);
    updateScoreBoard();
    
    if(typeof speak === 'function') {
        speak("Maç başladı! Başarılar patron.");
    }
}

// AŞAMA 32: Rakip Bot Menajer Yapay Zekası
let isBotManagerAnnounced = false;
function processOpponentManager() {
    if (timeLeft > 70) return; // İlk 20 dakika taktik değişmez
    
    // Eğer deplasman takımı gerideyse (Rakip takım bizden az gol attıysa)
    if (enemyScore < playerScore) {
        if (timeLeft < 25 && teamPsychology !== 'berserk') {
            teamPsychology = 'berserk';
            if(!isBotManagerAnnounced && typeof speak === 'function') {
                speak("Rakip takımın teknik direktörü çıldırdı! Tüm takımı hücuma yolluyor, defans diye bir şey kalmadı. Taktik berserk!");
                announcerText.textContent = "Rakip Teknik Direktör Taktiği 'Berserk' (Gözü Dönmüş) Olarak Değiştirdi!";
                isBotManagerAnnounced = true;
            }
        } else if (timeLeft >= 25 && teamPsychology !== 'chaos') {
            teamPsychology = 'chaos';
        }
    } 
    // Eğer deplasman takımı öndeyse
    else if (enemyScore > playerScore) {
        if (timeLeft < 30 && teamPsychology !== 'park_the_bus') {
            teamPsychology = 'park_the_bus';
            if(!isBotManagerAnnounced && typeof speak === 'function') {
                speak("Rakip takım tamamen geri çekiliyor. Teknik direktör otobüsü kalenin önüne çekti. İnanılmaz bir savunma göreceğiz.");
                announcerText.textContent = "Rakip Teknik Direktör Taktiği 'Otobüs Çek' Olarak Değiştirdi!";
                isBotManagerAnnounced = true;
            }
        }
    }
    // Beraberlik durumu
    else {
        if (teamPsychology === 'park_the_bus' || teamPsychology === 'berserk') {
            teamPsychology = 'normal'; // Skoru eşitlediyse taktiği normale çevir
            isBotManagerAnnounced = false; // Anons sıfırlanır
        }
    }
}

function updateScoreBoard() {
    if (typeof enemyScore !== 'undefined' && typeof playerScore !== 'undefined' && enemyScore > playerScore) {
        // Geriye düştük, deplasman coşar
        if (window.AudioManager && !window.AudioManager.isChanting) {
            window.AudioManager.triggerAwayDominance(window.todayOpponent || 'away');
        }
    }
    let sb = document.getElementById('score-board');
    if (sb) sb.textContent = "Biz " + playerScore + " - " + enemyScore + " Rakip";

    let deficit = enemyScore - playerScore;
    let advantage = playerScore - enemyScore;
    historicWorstDeficit = Math.max(historicWorstDeficit, deficit);
    
    if (deficit === 0 && historicWorstDeficit >= 5) {
        teamPsychology = 'epic_comeback';
    } else if (deficit >= 6) {
        teamPsychology = 'chaos';
    } else if (deficit === 5) {
        teamPsychology = 'berserk';
    } else if (deficit >= 3 && deficit <= 4) {
        teamPsychology = 'broken';
    } else if (advantage >= 3) {
        teamPsychology = 'showboating';
    } else {
        teamPsychology = 'normal';
    }

    if (teamPsychology !== prevPsychology) {
        let msg = "";
        if (teamPsychology === 'showboating') {
            msg = "Takım iyice rahatladı, skoru aldılar ve artık taraftara şov yapıyorlar. Ciddiyeti tamamen bıraktılar!";
            if(window.audioEngine) window.audioEngine.updateCrowdExcitement(0.8);
        } else if (teamPsychology === 'epic_comeback') {
            msg = "İnanılmaz bir an! 5 farklı geriden gelip maça ortak oldular! Tarih yazıyorlar, destansı bir geri dönüş!";
            if(window.audioEngine) window.audioEngine.updateCrowdExcitement(1.0);
        } else if (teamPsychology === 'chaos') {
            msg = "Sahada tam bir kaos var, sistem çöktü! Takım ne oynadığını bilmiyor, tam bir hezimet ve isyan!";
            if(window.audioEngine) window.audioEngine.updateCrowdExcitement(0.1);
        } else if (teamPsychology === 'berserk') {
            msg = "İnanılmaz! Kaybedecek hiçbir şeyleri kalmadı, onur mücadelesi veriyorlar! Sahada piranalar gibi saldırıyorlar!";
            if(window.audioEngine) window.audioEngine.updateCrowdExcitement(1.0);
        } else if (teamPsychology === 'broken') {
            msg = "Takım oyundan tamamen koptu, sahada dökülüyorlar, psikolojik olarak sıfırlandılar!";
            if(window.audioEngine) window.audioEngine.updateCrowdExcitement(0.0);
        } else if (teamPsychology === 'normal' && prevPsychology !== 'normal') {
            msg = "Takım psikolojik olarak toparlandı, maça geri döndüler!";
            if(window.audioEngine) window.audioEngine.updateCrowdExcitement(0.5);
        }
        
        if (msg !== "") {
            setTimeout(() => {
                if(typeof speak === 'function') speak(msg);
                announcerText.textContent = msg;
            }, 1000);
        }
        prevPsychology = teamPsychology;
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
    lastShooter = activePlayer;
    ball.shotOriginX = activePlayer.x; // Füze kontrolü için
    
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
        if(typeof speak === 'function') speak("Sert bir şut!");
    }
    
    ball.passCooldown = Date.now() + 500;
    ball.team = 'none';
    if(window.audioEngine) window.audioEngine.playGoalSound();
}

function executeHeader() {
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
    let r = Math.random();
    if(r < 0.5) {
        if(typeof speak === 'function') speak("Hakem sözlü uyardı, bir daha yapma dedi.");
    } else if(r < 0.8) {
        if(typeof speak === 'function') speak("Hakem sarı kart gösterdi! İtirazlar sonuçsuz.");
    } else {
        if(typeof speak === 'function') speak("Kırmızı kart! Hakem acımadı, PFDK'dan 1 milyon ceza yedik.");
        if(window.managerData) window.managerData.budget -= 1000000;
        if(homePlayers.length > 0) homePlayers.pop();
    }
}

function handleStrikerMiss(reason = 'save') {
    if (lastShooter !== homePlayers[10]) return false;
    lastShooter = null;
    strikerMissedShots++;
    
    // AŞAMA 56: Anti-Mekanikler (Efsanevi Gol Kaçırma Anonsları)
    if (ball.isBicycleKick) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Röveşata denedi ama top auta gitti! Belki biraz daha çalışması lazım." : "Röveşata denedi ama kaleci inanılmaz çıkardı! O gol olsaydı haftalarca konuşulurdu!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "İNANILMAZ RÖVEŞATA KAÇTI!";
        ball.isBicycleKick = false;
    } else if (ball.isChipShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Aşırtma denedi ama top farklı şekilde dışarı çıkıyor." : "Aşırtma denedi ama kaleci uyumuyor! Topu havada çok rahat kontrol etti.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "AŞIRTMA BAŞARISIZ!";
        ball.isChipShot = false;
    } else if (ball.isBackheelShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Topukla klas bir gol atmak istedi ama top dışarıda!" : "Topukla klas bir gol atmak istedi ama savunma yemedi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "TOPUK ŞOVU İŞE YARAMADI!";
        ball.isBackheelShot = false;
    } else if (ball.isPanenka) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Panenka denedi ama topu dışarı attı! Şaka gibi bir an!" : "Panenka denedi! Ne yaptın sen?! Kaleci yerinden bile kıpırdamadı ve topu rahatça kucağına aldı! Büyük rezalet!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "PANENKA REZALETİ!";
        ball.isPanenka = false;
    } else if (ball.isOlympicGoalShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Kornerden şansını denedi ama top kaleye yönelmeden auta çıktı." : "Kornerden kaleyi düşündü ama kaleci çok dikkatli.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OLİMPİK DENEME BAŞARISIZ!";
        ball.isOlympicGoalShot = false;
    } else if (window.isSetPieceRoutine && Date.now() < window.setPieceTimer) {
        if(typeof speak === 'function') speak("Organizasyon denediler ama savunma yemedi, tehlike uzaklaştırıldı.");
        window.isSetPieceRoutine = false;
    } else if (ball.isLongHeader) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Uzaktan kafa vuruşu ama isabet yok." : "O kadar uzaktan kafa vuruşu kaleciyi rahatsız etmedi.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KAFA VURUŞU KAÇTI!";
        ball.isLongHeader = false;
    } else if (ball.isDeflectedShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Savunmaya çarpan top kornere çıkıyor!" : "Savunmaya çarptı ama kaleci son anda harika bir refleksle uzandı!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KONTRA PİYE BAŞARISIZ!";
        ball.isDeflectedShot = false;
    } else if (ball.isZeroAngleShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "O açıdan gol atması mucize olurdu zaten. Top auta çıktı." : "İmkansız açıdan mucize aradı ama kaleci kapattı köşeyi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "SIFIRDAN DENEME BAŞARISIZ!";
        ball.isZeroAngleShot = false;
    } else if (ball.shotOriginX && ball.shotOriginX < 600) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Uzaktan şansını denedi ama isabet yok." : "Uzaktan şansını denedi ama kalecinin kucağına gitti.");
        ball.shotOriginX = null;
    } else {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Top auta çıktı." : "Önemli bir fırsat tepti.");
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
    } else {
        if(typeof speak === 'function') speak("Kaçırdı ama umurunda değil. Gerçek bir elit forvet, Japon Balığı hafızasıyla hemen sıfırlandı!");
    }
}

function triggerRandomMatchEvent() {
    let eventType = Math.floor(Math.random() * 5);
    let rText = "";

    switch(eventType) {
        case 0:
            if(window.dialogueData && window.dialogueData.sprintEvents) rText = window.dialogueData.sprintEvents[Math.floor(Math.random()*window.dialogueData.sprintEvents.length)];
            if(activePlayer) { activePlayer.speed *= 2; setTimeout(() => { if(activePlayer) activePlayer.speed /= 2; }, 5000); }
            break;
        case 1:
            if(window.dialogueData && window.dialogueData.tackleEvents) rText = window.dialogueData.tackleEvents[Math.floor(Math.random()*window.dialogueData.tackleEvents.length)];
            if(activePlayer) { 
                activePlayer.isStunned = true; 
                setTimeout(() => { if(activePlayer) activePlayer.isStunned = false; }, 3000); 
                if(Math.random() < 0.1 && homePlayers.length > 7) {
                    homePlayers.pop();
                    rText += " İnanılmaz, sedyeyle çıkıyor!";
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

window.addEventListener('keydown', (e) => { 
    keys[e.key] = true; 
    
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
                let tactics = ["4-3-3 Ofansif", "5-3-2 Defansif", "3-5-2 Ortasaha Baskın", "4-4-2 Klasik"];
                let t = tactics[Math.floor(Math.random() * tactics.length)];
                homePlayers.forEach(p => {
                    p.y += (Math.random() - 0.5) * 100;
                    if(p.y < 50) p.y = 50; if(p.y > 450) p.y = 450;
                    
                    // AŞAMA 36: Taktiksel Adaptasyon
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
                playerScore = 0; enemyScore = 3;
                if(typeof speak === 'function') speak("Takım maçtan çekildi. Hükmen mağlup sayılıyorsunuz.");
                timeLeft = 1;
            }
        }
        return;
    }

    if(isPaused) return;

    if ((e.key === 'q' || e.key === 'Q') && gameActive) switchPlayerManual();
    if ((e.key === 's' || e.key === 'S') && gameActive) executePass();
    if ((e.key === 'w' || e.key === 'W') && gameActive) executeShot();
    if ((e.key === 'd' || e.key === 'D') && gameActive) executeHeader();
    if ((e.key === 'h' || e.key === 'H') && gameActive) handleObjection();
});

window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function updatePlayer(p, teamType) {
    if (p.isStunned || p.isRedCarded) return;

    let oldX = p.x; let oldY = p.y;
    let spd = p.speed || 3;
    
    // AŞAMA 36: AURA ETKİSİ VE CLUTCH
    let teamArray = teamType === 'home' ? homePlayers : awayPlayers;
    p.hasAura = teamArray.some(mate => mate.isWorldClass && !mate.isRedCarded);
    
    let isClutchMoment = (timeLeft <= 15 && ((teamType === 'home' && playerScore < enemyScore) || (teamType === 'away' && enemyScore < playerScore)));
    let isBigMatch = (timeLeft <= 15 && Math.abs(playerScore - enemyScore) <= 1); // Fark 1 veya Beraberlik
    
    // AŞAMA 37: Büyük Maç Sendromu
    if (isBigMatch && p.isTier2 && !p.isWorldClass) {
        if (Math.random() < 0.015) { // Panik donması
            p.isStunned = true;
            setTimeout(() => { if(p) p.isStunned = false; }, 1200);
            if(typeof speak === 'function' && Math.random() < 0.05) speak("İnanılmaz! Stresten topu eziyor, büyük maç kaldıramıyor.");
        }
    }
    
    // AŞAMA 39: TIER 4 (Çaylaklar ve Gizlenme)
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
            p.x += (nearestEnemy.x - p.x) * 0.08; // Rakibe saklan
            p.y += (nearestEnemy.y - p.y) * 0.08;
            
            // AŞAMA 41: SPİKER YORUMU
            if (Math.random() < 0.0005 && !p.hidingCommentaryDone) {
                p.hidingCommentaryDone = true;
                if(typeof speak === 'function') speak("Genç " + p.name + " toptan kaçıyor, sorumluluk almamak için rakip savunmanın arasına saklanıyor!");
            }
        }

        // AŞAMA 39 EK: Çaylak Şansı (Miracle) - Kullanıcının isteği
        if (Math.random() < 0.001 && !p.miracleActive && ball.team === teamType) {
            p.miracleActive = true;
            if(typeof speak === 'function') speak(p.name + " inanılmaz bir depara kalktı! Gençlik ateşi mi, çaylak şansı mı!?");
            spd *= 3.0; // Dünya yıldızı gibi
            setTimeout(() => {
                if(p) { p.miracleActive = false; p.stamina -= 30; }
            }, 6000);
        }
        
        // Hız zaten çok düşük, titriyor
        spd *= 0.8;
    }

    // AŞAMA 38: KORKU VE ÇARESİZLİK
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
        
        let deficit = teamType === 'home' ? enemyScore - playerScore : playerScore - enemyScore;
        if (deficit >= 2) {
            spd *= 0.4; // Kabul edilmiş çaresizlik
        }
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
    }

    if (teamType === 'home') {
        if (teamPsychology === 'showboating') spd *= 0.8;
        else if (teamPsychology === 'epic_comeback') spd *= 2.5;
        else if (teamPsychology === 'broken') spd *= 0.5;
        else if (teamPsychology === 'berserk') spd *= 2.0;
        else if (teamPsychology === 'chaos') {
            spd = (Math.random() < 0.5) ? spd * 0.3 : spd * 1.5;
            if (Math.random() < 0.01 && !p.isStunned) {
                p.isStunned = true;
                setTimeout(() => { if(p) p.isStunned = false; }, 1000);
                return;
            }
        }
        
        let isTeamFrustrated = (teamPsychology === 'chaos' || teamPsychology === 'berserk');
        let isAngryStriker = (p === homePlayers[10] && strikerConfidence < 60 && p.mentalTrait === 'aggressive');
        
        let isLosing = playerScore < enemyScore;
        let isTier2Emotional = p.isTier2 && (p.mentalTrait === 'aggressive' || p.mentalTrait === 'fragile') && isLosing;
        let foulChance = isTier2Emotional ? 0.05 : 0.02;
          if (window.isOleyActive && teamType === 'away') {
              foulChance = 0.80; // Sinirden deliye dönmüş durumdalar, topla alakaları yok doğrudan adama girerler!
          } // İki kat faul
        
        // AŞAMA 46: Hakem Korkusu
        if (window.refereeFear > 50 && teamType === 'home') {
            foulChance *= 0.1; // Hakem %90 oranında lehimize faul çalmaya (bize kart vermeye) korkar
        }
        
        if (ball.team === 'away' && (isTeamFrustrated || isAngryStriker || isTier2Emotional)) {
            let dx = ball.x - p.x; let dy = ball.y - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 30 && Math.random() < foulChance) {
                ball.vx = 0; ball.vy = 0; ball.team = 'none';
                
                let redChance = isTier2Emotional ? 0.6 : 0.3;
                  if (window.isOleyActive && teamType === 'away') {
                      redChance = 0.90; // Oley çekilirken faul yaparlarsa genelde kasti tekmeyle adamı indirirler (Kırmızı)
                      if(typeof speak === 'function' && Math.random() < 0.2) speak("Oley paslarından iyice sinirlenen deplasman oyuncusu, top yerine direkt rakibinin ayağına acımasızca vurdu!");
                  } // Duygusal patlama (Kırmızı)
                if (Math.random() < redChance || p.hasYellowCard) {
                    p.isRedCarded = true;
                    if(typeof speak === 'function') speak("Kırmızı Kart! İnanılmaz sert bir hareket, hakem acımadı ve oyundan attı! Takım eksik kaldı!");
                    
                    // AŞAMA 46: Hakem Baskısı
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
                    
                    // AŞAMA 42: OYUN DURMASI
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                        gameHaltTimer = Date.now() + 5000;
                        haltReason = "KIRMIZI KART (" + p.name + ")";
                        // AŞAMA 43: Adalet ve Haksızlık Sistemi (Hakem Hatası)
                        setTimeout(() => {
                            let isRefMistake = Math.random() < 0.2; // %20 İhtimalle hakem haksız karar verir
                            let rand = Math.random();
                            let msgs;
                            
                            if (isRefMistake) {
                                  // AŞAMA 79: Dış Düşman Etkisi (Ani Kenetlenme)
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
                    
                    // AŞAMA 40: AURA KIRILMASI (One-Man Team Çöküşü)
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
                        // AŞAMA 43: Adalet ve Haksızlık Sistemi (Hakem Hatası)
                        setTimeout(() => {
                            let isRefMistake = Math.random() < 0.2; // %20 İhtimalle hakem haksız karar verir
                            let rand = Math.random();
                            let msgs;
                            
                            if (isRefMistake) {
                                  // AŞAMA 79: Dış Düşman Etkisi (Ani Kenetlenme)
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
    }

    if (!p.isUserControlled) {
        // AŞAMA 40: DÜNYA YILDIZI TEMBELLİĞİ (Defansa gelmez)
        if (teamType === 'home' && ball.team === 'away' && p.isWorldClass) {
            let isAttacker = (p.position === 'Forvet' || p.position === 'Sol Kanat' || p.position === 'Sağ Kanat' || p.tacticalRole === 'playmaker' || p.tacticalRole === 'inside_forward');
            if (isAttacker) {
                p.x += (600 - p.x) * 0.02; // İleride pas bekle
                p.y += (250 - p.y) * 0.02;
                
                // AŞAMA 41: SPİKER YORUMU
                if (Math.random() < 0.0005 && !p.lazyCommentaryDone) {
                    p.lazyCommentaryDone = true;
                    if(typeof speak === 'function') speak(p.name + " defansa dönmüyor, tamamen ileride pas bekliyor. Yıldız forvet, takımını adeta eksik oynatıyor!");
                }
                return; // Diğer hareket (pres) algoritmalarını es geç
            }
        }
    }

    if (p.isUserControlled) {
        if (keys['ArrowUp']) p.y -= spd;
        if (keys['ArrowDown']) p.y += spd;
        if (keys['ArrowLeft']) p.x -= spd;
        if (keys['ArrowRight']) p.x += spd;
        
        if (ball.team === 'none' && Date.now() > ball.passCooldown) {
            let dx = p.x - ball.x; let dy = p.y - ball.y;
            if (Math.sqrt(dx*dx + dy*dy) < 20 && !ball.isAirborne) ball.team = teamType;
        }
        if (ball.team === teamType) { ball.x = p.x + 10; ball.y = p.y; }
    } else {
        // AŞAMA 44: Otorite Düşüşü ve Taktiksel İtaatsizlik
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
        } else if (p === homePlayers[0] || p === awayPlayers[0]) {
            let isHome = (p === homePlayers[0]);
            let base_x = isHome ? 100 : 700;
            let dir = isHome ? 1 : -1;
            
            p.y += (ball.y - p.y) * 0.05; 
            
            if (p.tacticalRole === 'sweeper' || p.tacticalRole === 'sweeper_keeper') {
                let isAttacking = isHome ? (ball.x > 400) : (ball.x < 400);
                if (isAttacking) {
                    p.x += ((base_x + dir * 80) - p.x) * 0.03;
                } else {
                    p.x += (base_x - p.x) * 0.05;
                }
            } else if (p.tacticalRole === 'aggressive') {
                let enemyInBox = isHome ? (ball.team === 'away' && ball.x < 250) : (ball.team === 'home' && ball.x > 550);
                if (enemyInBox) {
                    p.x += (ball.x - p.x) * 0.06;
                } else {
                    p.x += (base_x - p.x) * 0.05;
                }
            } else {
                p.x += (base_x - p.x) * 0.1;
            }
            
            if (p.y < 200) p.y = 200;
            if (p.y > 300) p.y = 300;
        }
        else if (teamType === 'home' && p === homePlayers[1] && !p.isUserControlled) {
            if (ball.team === 'away') {
                p.x += (150 - p.x) * 0.05;
                p.y += (ball.y - p.y) * 0.03;
            } else {
                p.x += (300 - p.x) * 0.03;
                p.y += (150 - p.y) * 0.05;
            }
        }
        else if (teamType === 'home' && p === homePlayers[2] && !p.isUserControlled) {
            if (ball.team === 'away') {
                if (ball.x < 400) {
                    p.x += (ball.x - p.x) * 0.05;
                    p.y += (ball.y - p.y) * 0.05;
                } else {
                    p.x += (250 - p.x) * 0.05;
                    p.y += (350 - p.y) * 0.05;
                }
            } else {
                p.x += (400 - p.x) * 0.04;
                p.y += (350 - p.y) * 0.05;
            }
        }
        else if (teamType === 'home' && p === homePlayers[4] && !p.isUserControlled) {
            if (ball.team === 'away') {
                p.x += (200 - p.x) * 0.05;
                p.y += (250 - p.y) * 0.05;
            } else {
                p.x += (350 - p.x) * 0.05;
                p.y += (250 - p.y) * 0.05;
            }
        }
        else if (teamType === 'home' && (p === homePlayers[6] || p === homePlayers[7]) && !p.isUserControlled) {
            let targetY = p === homePlayers[6] ? 150 : 350;
            if (ball.team === 'home' || ball.team === 'none') {
                p.x += (650 - p.x) * 0.04; 
            } else if (ball.team === 'away') {
                p.x += (150 - p.x) * 0.06;
            }
            p.y += (targetY - p.y) * 0.05;
        }
        else if (teamType === 'home' && p === homePlayers[5] && !p.isUserControlled) {
            if (ball.team === 'home' || ball.team === 'none') {
                if (ball.x < 350) {
                    p.x += (250 - p.x) * 0.04;
                    p.y += (ball.y - p.y) * 0.04;
                } else {
                    p.x += (480 - p.x) * 0.05;
                    p.y += (250 - p.y) * 0.05;
                }
            } else {
                p.x += (350 - p.x) * 0.05;
            }
        }
        else if (teamType === 'home' && p === homePlayers[8] && !p.isUserControlled) {
            if (ball.team === 'away') {
                p.x += (550 - p.x) * 0.02;
                p.y += (250 - p.y) * 0.02; 
            } else {
                p.x += (600 - p.x) * 0.05;
                p.y += (ball.y - p.y) * 0.03;
            }
        }
        else if (teamType === 'home' && (p === homePlayers[3] || p === homePlayers[9]) && !p.isUserControlled) {
            let touchLineY = p === homePlayers[3] ? 50 : 450;
            if (ball.team === 'home' || ball.team === 'none') {
                if (p.tacticalRole === 'playmaker_winger' || p.tacticalRole === 'playmaker') {
                    p.x += (550 - p.x) * 0.04;
                    p.y += (250 - p.y) * 0.05;
                } else {
                    p.x += (700 - p.x) * 0.04;
                    
                    if (p.tacticalRole === 'inside_forward' && p.x > 500) {
                        p.y += (250 - p.y) * 0.08; 
                    } else {
                        p.y += (touchLineY - p.y) * 0.08;
                    }
                }
            } else {
                if (p.tacticalRole === 'defensive_winger') {
                    p.x += (100 - p.x) * 0.08;
                    p.y += (touchLineY - p.y) * 0.08;
                } else {
                    p.x += (350 - p.x) * 0.04;
                    p.y += (touchLineY - p.y) * 0.05;
                }
            }
        }
        else if (teamType === 'home' && p === homePlayers[10]) {
            if (strikerConfidence < 60) {
                if (p.mentalTrait === 'fragile') {
                    spd *= 0.7;
                } else if (p.mentalTrait === 'aggressive') {
                    if (p.isUserControlled && ball.team === 'home' && p.x > 400 && Math.random() < 0.015) {
                        executeShot();
                        if(typeof speak === 'function') speak("İnanılmaz bencilce bir şut! Forvet gol orucunu kırmak için takımı sabote ediyor!");
                    }
                }
            }
            
            if (ball.team === 'away') {
                let dx = ball.x - p.x; let dy = ball.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let presSpd = (strikerConfidence < 60 && p.mentalTrait === 'aggressive') ? spd * 2.5 : spd * 1.5;
                if(dist > 0) { p.x += (dx/dist)*presSpd; p.y += (dy/dist)*presSpd; }
            } else if (strikerConfidence < 60 && p.mentalTrait === 'fragile') {
                p.x -= (p.x - 300) * 0.05;
            } else if (strikerConfidence < 60 && p.mentalTrait === 'aggressive') {
                p.x -= (p.x - 400) * 0.05;
                p.y += (250 - p.y) * 0.05;
            } else if (p.tacticalRole === 'target_man') {
                p.stunImmune = true;
                if (ball.x < 500) { p.x -= (p.x - 550) * 0.05; }
                else { p.x += (700 - p.x) * 0.05; }
            } else if (p.tacticalRole === 'poacher') {
                if (ball.team === 'none' && ball.vx < 0 && ball.x > 500) {
                    let dx = ball.x - p.x; let dy = ball.y - p.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if(dist > 0) { p.x += (dx/dist)*spd*3.0; p.y += (dy/dist)*spd*3.0; }
                } else {
                    p.x += (720 - p.x) * 0.05;
                }
            } else if (p.tacticalRole === 'false_9') {
                p.x -= (p.x - 450) * 0.05;
            }
        } else if (teamType === 'away' && ball.team !== 'away') {
            if (homePlayers[10].tacticalRole === 'false_9' && p === awayPlayers[10]) {
                p.x += (homePlayers[10].x - p.x + 50) * 0.05;
                p.y += (homePlayers[10].y - p.y) * 0.05;
            } else {
                let dx = ball.x - p.x; let dy = ball.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist > 0) { p.x += (dx/dist)*spd*0.8; p.y += (dy/dist)*spd*0.8; }
                if (dist < 20 && Date.now() > ball.passCooldown && !ball.isAirborne) {
                    // AŞAMA 57: Savunmaya Çarpıp Yön Değiştirme (Deflection)
                    if (ball.team === 'none' && lastShooter === homePlayers[10] && Math.abs(ball.vx) > 10 && Math.random() < 0.20) {
                        ball.isDeflectedShot = true;
                        ball.vy = (Math.random() - 0.5) * 30; // Ani yön değişimi
                        ball.passCooldown = Date.now() + 500; // Hemen tekrar çarpmasın
                        if(typeof speak === 'function') speak("Şutunu çekti... Savunmaya çarpıyor!");
                    } else {
                        let wasEpicMiss = false;
                        if (ball.team !== 'away' && lastShooter === homePlayers[10]) {
                            handleStrikerMiss('save');
                            wasEpicMiss = true;
                            // AŞAMA 59: Kaleci Ribaundu (Sektirme)
                            if (Math.random() < 0.25) {
                                ball.team = 'none'; // Oyunda kalır
                                ball.vx = -10;
                                window.isGKSavedRebound = true;
                                window.gkReboundTimer = Date.now() + 4000;
                            } else {
                                ball.team = 'away'; // Kaleci tuttu
                            }
                        } else {
                            ball.team = 'away';
                        }
                        if (!wasEpicMiss && typeof speak === 'function') speak("Top rakibe geçti.");
                    }
                }
            }
        } else if (teamType === 'away' && ball.team === 'away') {
            p.x += spd; 
            if(p.x > 750) { 
                enemyScore++; updateScoreBoard(); ball.x=400; ball.y=250; ball.team='none'; ball.vx=0; ball.vy=0; 
                if(typeof speak === 'function') speak("Maalesef top ağlarımızda. Gol yedik.");
            }
            ball.x = p.x - 10; ball.y = p.y;
        } else {
            if (strikerRunActive && p === currentStriker) {
                p.x += spd * 1.8;
                if (p.x > 720) p.x = 720;
            } else {
                p.x += (Math.random() - 0.5) * 2;
                p.y += (Math.random() - 0.5) * 2;
            }
        }
    }
    
    if (p.x < 0) p.x = 0; if (p.x > 800) p.x = 800;
    if (p.y < 0) p.y = 0; if (p.y > 500) p.y = 500;
    
    if (p !== homePlayers[0] && p !== awayPlayers[0]) {
        let dist = Math.sqrt(Math.pow(p.x - oldX, 2) + Math.pow(p.y - oldY, 2));
        
        // AŞAMA 66: Erken Teslimiyet (Sessizlik) ve Protesto
        let isEarlyDefeat = window.CrowdForm >= 3;
          let isProtestActive = window.CrowdForm === 4;
        
        let staminaDecay = dist * 0.0005;
        if (isEarlyDefeat) staminaDecay *= 2.0; // Ev sahibi avantajı gitti, yorgunluk katlandı
        
      // AŞAMA 75: Stadyumu Terk Etme (En Ağır Ceza)
      let isStadiumAbandoned = (window.CrowdForm === 4) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);
      
      if (isStadiumAbandoned) {
          if (!window.abandonmentAnnounced) {
              window.abandonmentAnnounced = true;
              if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
              if(typeof speak === 'function') speak("İnanılmaz görüntüler! Stadyumdaki on binlerce taraftar, takımlarının bu rezil futbolunu daha fazla izlememek için tribünleri boşaltıyor! Yuhalamıyorlar, ıslıklamıyorlar, sadece terk ediyorlar! Futbolcular için yerin dibine girme anı.");
              if(typeof announcerText !== 'undefined') announcerText.textContent = "STADYUM BOŞALIYOR! TARAFTAR TERK ETTİ!";
              
              // Yönetime büyük darbe
              window.managerAuthority = 0;
              window.presidentConfidence = 0;
          }
          
          // Sahadaki Ruhsuzluk (Fiziken Maçı Bırakırlar)
          if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
          if (typeof homePlayers !== 'undefined') {
              homePlayers.forEach(p => {
                  p.stamina = 0; // Ayakta duracak halleri kalmaz
                  p.speed = (p.baseSpeed || 3) * 0.4; // Sadece yürürler
                  p.power = 1; // Şut veya pas atamazlar
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
        if (p.isTier4) staminaDecay *= 3.0; // AŞAMA 39: Çaylakların panik eforu
        
        // AŞAMA 70: %5'lik Kemik Kadro Direnci (Deplasman Ele Geçirmesi)
        if (typeof isEarlyDefeat !== 'undefined' && isEarlyDefeat && teamType === 'away') {
            staminaDecay *= 0.1; // Deplasman takımı yorulmaz, muazzam direnç kazanır
            spd *= 1.2; // Gelen destekle hızlanırlar
        }
        
        p.stamina -= staminaDecay;
        
        // AŞAMA 45: Comeback Buff
        if (typeof window.isComebackActive !== 'undefined' && window.isComebackActive) {
            if (Date.now() > window.comebackTimer) {
                window.isComebackActive = false;
            } else if (teamType === 'home') {
                p.stamina = 100; // Sınırsız kondisyon
            }
        }
        
        if (p.stamina <= 0) {
            p.stamina = 0;
            // AŞAMA 42: YORGUNLUK KAYNAKLI SAKATLIK
            if (typeof isGameHalted !== 'undefined' && !isGameHalted && !p.isInjured && Math.random() < 0.001) {
                p.isInjured = true;
                isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true;
                gameHaltTimer = Date.now() + 5000;
                haltReason = "SAKATLIK (" + p.name + ")";
                if(typeof speak === 'function') speak("Eyvah! " + p.name + " yorgunluğa dayanamadı ve kendini yere bıraktı. Oyun durdu, sağlık görevlileri sahada!");
                // Sakatlanan oyuncunun hızı biter
                p.speed *= 0.2;
                p.baseSpeed *= 0.2;
            }
        }
    }
}


// AŞAMA 86: VAR Sistemi ve Toplu İtiraz (İsyan)
window.triggerVAR = function(scoringTeam) {
    if (Math.random() > 0.4) return; // %40 ihtimalle VAR'a takılır
    
    let isHomeGoal = (scoringTeam === 'home');
    let defendingPlayers = isHomeGoal ? awayPlayers : homePlayers;
    let avgAnger = 0;
    
    if (typeof defendingPlayers !== 'undefined' && defendingPlayers[0] && defendingPlayers[0].emotions) {
        let totalAnger = defendingPlayers.reduce((sum, p) => sum + (p.emotions.anger || 0), 0);
        avgAnger = totalAnger / defendingPlayers.length;
    }
    
    isGameHalted = true;
    window.varStatus = 'checking'; 
    window.varScoringTeam = scoringTeam;
    window.varDecision = Math.random() < 0.5 ? 'offside' : 'goal'; 
    window.varLineDefX = 0; window.varLineAttX = 0;
    
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
                p.speed = 0; 
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

function gameLoop() {
    if (isPaused && gameActive) { requestAnimationFrame(gameLoop); return; }
    if (!gameActive) return;

    // AŞAMA 45: Taraftar Beyni - Oley! ve Ritmik Alkış
    if (ball.team !== window.lastBallTeam) {
        if (ball.team === 'home') {
            if (window.lastBallTeam === 'none' && ball.x < 400) {
                window.consecutivePasses++;
                if (window.consecutivePasses >= 4) {
                    if (window.consecutivePasses === 4 && typeof speak === 'function') {
                        speak("Tribünler her pasta 'Oley' çekiyor! Rakibin sinirleri laçka oldu.");
                    } else if (Math.random() < 0.5 && typeof speak === 'function') {
                        speak("Oley!");
                    }
                    if(typeof announcerText !== 'undefined') announcerText.textContent = "Oley!";
                    
                    // Rakip morali düşer
                    awayPlayers.forEach(ap => {
                        ap.speed *= 0.95; 
                    });
                }
            } else {
                window.consecutivePasses = 1;
            }
        } else if (ball.team === 'away') {
            if (window.consecutivePasses >= 4 && typeof speak === 'function') {
                 speak("Seri bozuldu, top rakipte.");
            }
            window.consecutivePasses = 0; window.isOleyActive = false;
        }
        
        // AŞAMA 47: Kendi Oyuncunu Islıklama (Günah Keçisi)
        if (window.lastBallTeam === 'home' && ball.team === 'away') {
            let closestHome = homePlayers.reduce((closest, p) => {
                let d = Math.sqrt(Math.pow(p.x - ball.x, 2) + Math.pow(p.y - ball.y, 2));
                return (closest === null || d < closest.dist) ? {p: p, dist: d} : closest;
            }, null);
            if (closestHome && closestHome.p) {
                closestHome.p.mistakes = (closestHome.p.mistakes || 0) + 1;
                if (closestHome.p.mistakes >= 3 && !closestHome.p.isBooedByOwnFans) {
                    // AŞAMA 80: Yan Form 2 - Mesih Kompleksi (Kurtarıcıya Tapınma)
                    if (window.CrowdForm >= 3 && closestHome.p.isWorldClass) {
                         closestHome.p.isMessiah = true;
                         closestHome.p.mistakes = 0; // Taraftar hatasını anında siler
                         
                         if (window.AudioManager) {
                             let cheer = new Audio('sounds/cheer.ogg'); cheer.volume = 0.8; cheer.play().catch(e=>{});
                         }
                         if(typeof speak === 'function') {
                             let msg = "İnanılmaz bir çifte standart! Diğer oyuncular hata yapınca yuhalanıyor, ama stadyumun sevgilisi " + closestHome.p.name + " topu ezdiğinde büyük bir destek alkışı aldı!";
                             speak(msg);
                             if(typeof announcerText !== 'undefined') announcerText.textContent = "ÇİFTE STANDART: MESİH ALKIŞLANDI!";
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
                    // AŞAMA 82: Yan Form 5 - Formayı Çıkarttırma Terörü
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
                            closestHome.p.speed = 0;
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
    
    // AŞAMA 47: Yönetim İstifa ve Sırt Dönme
    let deficit = enemyScore - playerScore;
    if (deficit >= 4) {
        if (!window.yönetimIstifaTriggered) {
            window.yönetimIstifaTriggered = true;
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
    } else {
        window.yönetimIstifaTriggered = false;
    }

    if (ball.team === 'home' && ball.x > 600) {
        if (!window.isRhythmicClapping) {
            window.isRhythmicClapping = true;
            if (Math.random() < 0.4 && typeof speak === 'function') {
                let msgs = [
    "Tüm stadyum ritmik alkışa başladı, büyük bir baskı var!",
    "Bütün stadyum elleriyle aynı ritmi tutuyor! Hücum için müthiş bir itici güç!",
    "Tribünlerden yükselen ritmik alkışlar, rakip savunmanın dizlerini titretiyor.",
    "Taraftar takımı adeta ittiriyor! Şut açısı arayan oyunculara muazzam bir destek!"
];
speak(msgs[Math.floor(Math.random() * msgs.length)]);
            }
        }
    } else if (ball.x < 500 || ball.team === 'away') {
        window.isRhythmicClapping = false;
    }

    // AŞAMA 46: Düşmanca Tribünler - Islık ve Hain Yuhalaması
    if (!window.traitorAssigned && typeof awayPlayers !== 'undefined' && awayPlayers.length > 0) {
        let exPlayer = awayPlayers.find(p => p.wasInUserTeam);
        if (exPlayer) {
            exPlayer.isTraitor = true;
        }
        window.traitorAssigned = true;
    }

    if (ball.team === 'away') {
        window.awayPossessionTime += 16; 
        
        // AŞAMA 65: Rakibi İzole Etme (Sağır Edici Islık)
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
    } else {
        window.awayPossessionTime = 0;
    }

    // AŞAMA 42: OYUN DURAKSAMA KONTROLÜ
    if (typeof isGameHalted !== 'undefined' && isGameHalted) {
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
            } else if (haltReason === "OYUNCU DEĞİŞİKLİĞİ") {
                if(typeof speak === 'function') speak("Hakem işaretini verdi, yeni oyuncu sahada. Oyun tekrar başlıyor.");
                ball.team = 'none';
            } else if (haltReason === "KORNER") {
                if(typeof speak === 'function') speak("Köşe vuruşu kullanılıyor...");
                window.isCornerKickZone = true;
                window.cornerKickTimer = Date.now() + 5000;
                ball.team = 'home';
                ball.x = 800;
                ball.y = (ball.y < 250) ? 0 : 500;
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
            } else if (haltReason === "BARAJ VE İTİŞME") {
                if(typeof speak === 'function') speak("Hakem oyuncuları sert bir dille uyardı. Şimdi işaretini verdi, atış kullanılacak.");
                ball.team = 'none';
                window.isFreeKickZone = true;
                window.freeKickTimer = Date.now() + 5000;
            } else {
                let isDangerousFreeKick = (ball.x > 500 && ball.x < 700);
                let hasAggressivePlayer = typeof homePlayers !== 'undefined' && (homePlayers.some(p => p.mentalTrait === 'aggressive') || awayPlayers.some(p => p.mentalTrait === 'aggressive'));

                if (isDangerousFreeKick && hasAggressivePlayer && Math.random() < 0.4) {
                    // AŞAMA 62: Baraj ve Ceza Sahası İçi İtişmeler
                    haltReason = "BARAJ VE İTİŞME";
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
                              if (window.varScoringTeam === 'home') playerScore--;
                              else enemyScore--;
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
            requestAnimationFrame(gameLoop);
            return;
        }
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
                
                if (!inBox && !p1.isRedCarded) {
                    p1.isRedCarded = true;
                    isGameHalted = true;
                    haltReason = "KIRMIZI KART";
                    if(typeof gameHaltTimer !== 'undefined') gameHaltTimer = Date.now() + 4000;
                    if(typeof speak === 'function') speak("İnanılmaz bir an! Kaleci ceza sahası dışında topa eliyle müdahale etti! Hakem tereddütsüz Kırmızı Kart gösteriyor!");
                }
            }
            
            // GK Dokunulmazlık (Altıpas İçi Şarj Faulü)
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
                                haltReason = "KALECİYE ŞARJ (HÜCUM FAUL)";
                                if(typeof gameHaltTimer !== 'undefined') gameHaltTimer = Date.now() + 4000;
                                if(typeof speak === 'function') speak("Hakem düdüğünü çalıyor! Altıpas içinde kaleciye şarj var. Bu bir hücum faul ve sarı kart çıkıyor!");
                            }
                        }
                    }
                }
            }
        }
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

    
    // AŞAMA 63: Ateşleyici Uğultu (Momentum Dalgası)
    if (playerScore < enemyScore || window.isCornerKickZone) {
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
    }
    
    
    // AŞAMA 67: Protesto ve Erken Teslimiyet Ses Efektleri
    let isEarlyDefeat = window.CrowdForm >= 3;
          let isProtestActive = window.CrowdForm === 4;

    
      // AŞAMA 75: Stadyumu Terk Etme (En Ağır Ceza)
      let isStadiumAbandoned = (window.CrowdForm === 4) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);
      
      if (isStadiumAbandoned) {
          if (!window.abandonmentAnnounced) {
              window.abandonmentAnnounced = true;
              if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
              if(typeof speak === 'function') speak("İnanılmaz görüntüler! Stadyumdaki on binlerce taraftar, takımlarının bu rezil futbolunu daha fazla izlememek için tribünleri boşaltıyor! Yuhalamıyorlar, ıslıklamıyorlar, sadece terk ediyorlar! Futbolcular için yerin dibine girme anı.");
              if(typeof announcerText !== 'undefined') announcerText.textContent = "STADYUM BOŞALIYOR! TARAFTAR TERK ETTİ!";
              
              // Yönetime büyük darbe
              window.managerAuthority = 0;
              window.presidentConfidence = 0;
          }
          
          // Sahadaki Ruhsuzluk (Fiziken Maçı Bırakırlar)
          if (typeof strikerConfidence !== 'undefined') strikerConfidence = 0;
          if (typeof homePlayers !== 'undefined') {
              homePlayers.forEach(p => {
                  p.stamina = 0; // Ayakta duracak halleri kalmaz
                  p.speed = (p.baseSpeed || 3) * 0.4; // Sadece yürürler
                  p.power = 1; // Şut veya pas atamazlar
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
    } else if (isEarlyDefeat) {
        if (!window.silenceAnnounced) {
            window.silenceAnnounced = true;
            if(window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.0;
            if(typeof speak === 'function') speak("Erken gelen gol stadyuma ölüm sessizliği çöktürdü! Taraftar adeta tiyatro izleyicisine dönüştü, ev sahibi avantajı tamamen bitti.");
        }
    }

    
    // AŞAMA 69: Tribün Penaltı Baskısı (Desibel ile Karar Bükme)
    if (window.CrowdForm <= 2 && ball.team === 'away' && ball.x > 650 && typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.005) {
        if (window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
        
        if (window.refereeExperience === 'rookie' && Math.random() < 0.10) {
            isGameHalted = true; 
            window.pendingPenalty = true;
            gameHaltTimer = Date.now() + 3000;
            haltReason = "PENALTI - TARAFTAR BASKISI";
            if(typeof speak === 'function') speak("Ceza sahasında ufak bir temas... Tribünler ayağa fırladı, devasa bir uğultu koptu! Hakem o sese dayanamayıp penaltıyı çaldı! İnanılmaz bir baskı!");
        } else {
            if(typeof speak === 'function') speak("Tribünler penaltı diye ayaklandı ama tecrübeli hakem oralı bile olmuyor, oyna diyor!");
        }
    }
    
    if (ball.team === 'none') {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;
        
        if (ball.x > 800 && ball.y > 200 && ball.y < 300) {
            let deficitBeforeGoal = enemyScore - playerScore;
            playerScore++; updateScoreBoard(); ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
              if (typeof window.triggerVAR === 'function') window.triggerVAR('home');
            
            if (ball.isFreeKickShot) {
                if(typeof speak === 'function') speak("Nefesler tutuldu... Ölü yaprak vuruşu! Top havada kavis çiziyor ve tam köşeden ağlarda!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "FRİKİK GOLÜ! ÖLÜ YAPRAK!";
            } else if (window.isCounterAttack && Date.now() < window.counterAttackTimer) {
                if(typeof speak === 'function') speak("Savunmayı eksik yakaladılar! Fişek gibi fırladı, arkasına bile bakmıyor... Köşeye bırakıyor ve gol!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "KONTRATAK GOLÜ!";
                window.isCounterAttack = false;
            } else if (window.isReboundActive && Date.now() < window.reboundTimer) {
                if(typeof speak === 'function') speak("Ceza sahası içi ana baba günü... Top bir o yana bir bu yana gidiyor, seken topu son anda tamamlıyor! Tabela değişti!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "KARAMBOL GOLÜ!";
                window.isReboundActive = false; // Karambol bitti
            } else if (ball.isBicycleKick) {
                if(typeof speak === 'function') speak("Top ağlarda! Bu gol yıllarca unutulmaz! Akıllara zarar bir röveşata golü!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "YILIN GOLÜ! RÖVEŞATA!";
            } else if (ball.isZeroAngleShot) {
                if(typeof speak === 'function') speak("İmkansız bir açı! Oradan nasıl vurdu?! Fizik kurallarına aykırı bir gol! Kaleci bile topun oradan nasıl geçtiğini anlayamadı!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "İMKANSIZ AÇI! SIFIRDAN GOL!";
            } else if (ball.isBackheelShot) {
                if(typeof speak === 'function') speak("İnanılmaz bir zeka! Topukla bıraktı! Savunmanın aklıyla oynadı resmen, böyle bir klas buralarda zor görülür!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "KLAS TOPUK GOLÜ!";
            } else if (ball.isChipShot) {
                if(typeof speak === 'function') speak("Ne yaptın sen! Kaleciyi adeta ipe dizdi, üzerinden zarifçe aşırtıyor... Bu bir gol değil, bir sanat eseri!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "AŞIRTMA KLAS GOL!";
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
                // AŞAMA 45: Comeback (Geri Dönüş) Uğultusu
                window.isComebackActive = true;
                window.comebackTimer = Date.now() + 30000; // 30 saniye sürer
                if(typeof speak === 'function') setTimeout(() => speak("Tribünler çıldırdı! Fark 1'e indi! Bu stadyum artık rakipler için bir cehennem, takım uçuşa geçti!"), 2000);
                if(typeof announcerText !== 'undefined') announcerText.textContent = "STADYUM YIKILIYOR! GERİ DÖNÜŞ ATEŞİ!";
            }
            
            if (lastShooter === homePlayers[10]) {
                strikerConfidence = 100;
                strikerMissedShots = 0;
            }
            lastShooter = null;
        } else if (ball.x > 800) {
            // AŞAMA 50: Direkten Dönme ve Karambol
            if (Math.random() < 0.25 && ball.y > 150 && ball.y < 350) { // Kale direğine yakınsa seker
                ball.x = 790;
                ball.vx = -ball.vx * 0.6; // Top kaleciden veya direkten geri seker
                ball.vy = (Math.random() - 0.5) * 15;
                window.isReboundActive = true;
                window.reboundTimer = Date.now() + 4000; // 4 saniye içinde gol olursa karamboldür
                if(typeof speak === 'function') if(window.AudioManager) window.AudioManager.playMiss(); speak("Top direkten döndü! İnanılmaz bir an, ceza sahası karıştı!");
            } else {
                if (ball.isDeflectedShot) {
                    ball.x = 800; ball.y = (ball.y < 250) ? 0 : 500; ball.vx=0; ball.vy=0;
                    if (typeof isGameHalted !== 'undefined') {
                        isGameHalted = true; if (ball.x > 650) window.pendingPenalty = true; // Auto-replaced, fix it
                        window.pendingPenalty = false; // Korner penaltı olamaz
                        gameHaltTimer = Date.now() + 3000;
                        haltReason = "KORNER";
                    }
                    handleStrikerMiss('out');
                } else {
                    
                      // AŞAMA 71: Ritmik Islık ve Oyunu Soğutmayı Engelleme
                      let isLateGame = typeof timeLeft !== 'undefined' && timeLeft < 45;
                      let isWastingTime = enemyScore >= playerScore && isLateGame && window.CrowdForm <= 2;

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
            // AŞAMA 53: Kendi Kalesine Gol
            if (ball.y > 200 && ball.y < 300) {
                
                  enemyScore++; updateScoreBoard(); ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
              if (typeof window.triggerVAR === 'function') window.triggerVAR('away');
                  
                  // AŞAMA 72: Rakibi Ayakta Alkışlama (Standing Ovation)
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
                  // AŞAMA 74: Kornerde Yabancı Madde Yağmuru
                  if (typeof isGameHalted !== 'undefined' && Math.random() < 0.2) {
                      isGameHalted = true;
                      window.pendingPenalty = false;
                      gameHaltTimer = Date.now() + 6000;
                      haltReason = "KORNER (DEPLASMAN)";
                      
                      let isBerserk = (typeof teamPsychology !== 'undefined' && teamPsychology === 'berserk');
                      if (isBerserk || Math.random() < 0.15) {
                          haltReason = "YABANCI MADDE YAĞMURU";
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
                      if(typeof speak === 'function') speak("Top rakip tarafından dışarı atıldı.");
            }
        }
        if (ball.y < 0) { ball.y = 0; ball.vy *= -1; }
        if (ball.y > 500) { ball.y = 500; ball.vy *= -1; }
    }

    if (ball.isAirborne && Date.now() > ball.airborneUntil) {
        ball.isAirborne = false;
        let failMsg = "Kimse dokunamadı, o harika orta boşa gitti.";
        if(typeof speak === 'function') speak(failMsg);
        announcerText.textContent = failMsg;
    }

    // AŞAMA 60: VAR Sistemi (Şüpheli Pozisyon Tespiti)
    if (!isGameHalted && ball.x > 650 && ball.team !== 'home' && Math.random() < 0.005 && !window.pendingVarTrigger) {
        window.pendingVarTrigger = Date.now() + 3000; 
    }

    if (!isGameHalted && window.pendingVarTrigger && Date.now() > window.pendingVarTrigger) {
        window.pendingVarTrigger = null;
        isGameHalted = true;
        gameHaltTimer = Date.now() + 8000;
        haltReason = "VAR İNCELEMESİ";
        if(typeof speak === 'function') speak("Oyun durdu... Hakem kulağını tutuyor, VAR odasıyla bir görüşme var. Evet, kenara doğru koşuyor! Monitörden pozisyonu bizzat izleyecek. Stadyumda nefesler tutuldu, çıkacak karar maçın kaderini değiştirebilir!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "VAR İNCELEMESİ!";
    }

    // AŞAMA 61: Oyuncu Değişikliği (Zaman Geçirme)
    
    // AŞAMA 62: TARAFTAR ATIŞMASI (BANTER)
    if (typeof isGameHalted !== 'undefined' && !isGameHalted && Math.random() < 0.002 && window.AudioManager && !window.AudioManager.isChanting) {
        // Beraberlik veya 1 fark varken gerginlik artar
        if (Math.abs(playerScore - enemyScore) <= 1) {
            window.AudioManager.triggerBanter('away', window.myTeamId || 'home');
        }
    }
    
    if (typeof isGameHalted !== 'undefined' && !isGameHalted && typeof timeLeft !== 'undefined' && timeLeft < 45 && Math.random() < 0.003 && !window.substitutionDone) {
        window.substitutionDone = true;
        isGameHalted = true;
        gameHaltTimer = Date.now() + 6000;
        haltReason = "OYUNCU DEĞİŞİKLİĞİ";
        
        let timeWasting = (typeof playerScore !== 'undefined' && typeof enemyScore !== 'undefined' && playerScore !== enemyScore);
        if (timeWasting) {
            if(typeof speak === 'function') speak("Oyun durdu sayın seyirciler. Yedek kulübesinde tabela kalktı, kenarda bir oyuncu değişikliği izliyoruz. Çıkan oyuncu biraz ağır adımlarla kenara geliyor, tribünlerden bu zaman geçirme taktiğine yoğun bir ıslık var.");
        } else {
            if(typeof speak === 'function') speak("Kenarda hareketlilik var, teknik direktörden taktiksel bir hamle geliyor. Yorulan oyuncu alkışlarla kenara alındı.");
        }
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OYUNCU DEĞİŞİKLİĞİ!";
    }

    if (window.audioEngine) window.audioEngine.updateBallPosition(ball.x, ball.y);

    if (ctx) {
        homePlayers.forEach(p => {
            if (p.isRedCarded) return; // AŞAMA 29: Kırmızı kart gören sahada çizilmez
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

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
      window.currentWeek = (window.currentWeek || 1) + 1;
    if(matchTimer) clearInterval(matchTimer);
    if(matchEventTimer) clearInterval(matchEventTimer);
    if(typeof speak === 'function') speak("Maç sona erdi. Sonuç: Biz " + playerScore + " - " + enemyScore + " Rakip");
    
    // AŞAMA 44: Kariyer Puanı ve Başkan Güveni Değerlendirmesi
    let scoreDiff = playerScore - enemyScore;
    let isLoss = scoreDiff < 0;
    let isHeavyDefeat = scoreDiff <= -3;

    if (isLoss) {
        window.consecutiveLosses++;
        if (isHeavyDefeat) {
            window.managerAuthority -= 15;
            window.presidentConfidence -= 20;
            if(typeof speak === 'function') setTimeout(() => speak("Yönetim kurulu bu hezimetin ardından acil toplanma kararı alabilir. Başkan ve taraftar çok öfkeli."), 3000);
        } else if (window.consecutiveLosses >= 3) {
            window.managerAuthority -= 10;
            window.presidentConfidence -= 15;
            if(typeof speak === 'function') setTimeout(() => speak("Peş peşe gelen mağlubiyetler hocanın koltuğunu sallamaya başladı. Takım çöküşte."), 3000);
        } else {
            window.managerAuthority -= 5;
            window.presidentConfidence -= 5;
        }
    } else if (scoreDiff > 0) {
        window.consecutiveLosses = 0;
        window.managerAuthority = Math.min(100, window.managerAuthority + 10);
        window.presidentConfidence = Math.min(100, window.presidentConfidence + 10);
    } else {
        window.consecutiveLosses = 0;
    }

    // Başkanın Uyarı Mesajı (UI)
    if (window.presidentConfidence < 40) {
        setTimeout(() => {
            alert("BAŞKAN'DAN MESAJ: Sayın hocam, bu kulübün genlerinde böyle bir tablo yoktur. Sonuçlar düzelmezse yollarımızı ayırmak zorunda kalacağız.");
        }, 6000);
    } else if (window.presidentConfidence < 70 && isLoss) {
        setTimeout(() => {
            alert("BAŞKAN'DAN MESAJ: Bu mağlubiyet hiç hoşuma gitmedi. Taraftar homurdanıyor, toparlanmamız lazım.");
        }, 6000);
    }
    
    // AŞAMA 35: Psikoloji Güncellemesi
    if (typeof squadEngine !== 'undefined') {
        squadEngine.processMatch(homePlayers.map(p => p.id));
    }
    
    if (typeof processBenchPsychology === 'function') {
        processBenchPsychology();
    }
    
    // AŞAMA 40: EKONOMİK KARADELİK (Maaş Ödemesi)
    if (window.leagueData) {
        let myTeam = window.leagueData.teams.find(t => t.id === window.leagueData.userTeamId);
        if (!myTeam) myTeam = window.leagueData.teams.find(t => t.id === 'galatasaray');
        if (myTeam) {
            let worldClassCount = homePlayers.filter(p => p.isWorldClass).length;
            if (worldClassCount > 0) {
                let wageCost = worldClassCount * 2; // Her yıldıza maç başı 2M Euro
                myTeam.budget -= wageCost;
                if(typeof speak === 'function') speak(`Maç sonu dünya yıldızlarına toplam ${wageCost} Milyon Euro maç başı maaş ödendi. Kalan bütçe: ${myTeam.budget} Milyon.`);
            }
        }
    }

    setTimeout(() => {
        if(window.leagueData && typeof window.leagueData.playMatch === 'function') {
            window.leagueData.playMatch();
        } else {
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('menu-screen').classList.remove('hidden');
        }
        
        // AŞAMA 35: Yüzleşme Diyaloglarını Kontrol Et
        if (typeof checkPsychologyDialogue === 'function') {
            checkPsychologyDialogue();
        }
    }, 5000);
}

window.initGame = initGame;

// ==========================================
// AŞAMA 47: MAÇ İÇİ DEĞİŞİKLİK (SUBSTITUTION) SİSTEMİ
// ==========================================
window.selectedSubPitch = null;
window.selectedSubBench = null;

window.openSubMenu = function() {
    isPaused = true;
    let modal = document.getElementById('sub-modal');
    if(modal) modal.style.display = 'flex';
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
        li.textContent = p.name + " (" + p.position + ") " + (p.isBooedByOwnFans ? " 🤬(Islıklanıyor)" : "") + " %" + Math.floor(p.stamina);
        li.style.padding = "5px";
        li.style.borderBottom = "1px solid #555";
        li.style.cursor = "pointer";
        li.onclick = () => {
            Array.from(pitchList.children).forEach(c => c.style.background = 'transparent');
            li.style.background = '#e74c3c';
            window.selectedSubPitch = {player: p, index: idx};
            window.checkSubConfirm();
        };
        pitchList.appendChild(li);
    });
    
    if(window.homeBenchPlayers) {
        window.homeBenchPlayers.forEach((p, idx) => {
            let li = document.createElement('li');
            li.textContent = p.name + " (" + p.position + ") Güç:" + p.power;
            li.style.padding = "5px";
            li.style.borderBottom = "1px solid #555";
            li.style.cursor = "pointer";
            li.onclick = () => {
                Array.from(benchList.children).forEach(c => c.style.background = 'transparent');
                li.style.background = '#27ae60';
                window.selectedSubBench = {player: p, index: idx};
                window.checkSubConfirm();
            };
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
        closeBtn.addEventListener('click', () => { document.getElementById('sub-modal').style.display = 'none'; isPaused = false; }); 
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
            document.getElementById('sub-modal').style.display = 'none';
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
    });
}, 1000);

// --- OYUNCU PROFİLİ (PLAYER PROFILE) MANTIĞI ---
let currentPlayerInProfile = null;

window.showPlayerProfile = function(player) {
    currentPlayerInProfile = player;
    const modal = document.getElementById('player-profile-modal');
    if (!modal) return;

    // Temel Bilgiler
    document.getElementById('pp-name').textContent = player.name;
    document.getElementById('pp-age').textContent = player.age || 25;
    document.getElementById('pp-position').textContent = player.position || "Belirsiz";
    
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
    document.getElementById('pp-mental').textContent = player.mentalTrait || "Standart";
    document.getElementById('pp-role').textContent = player.tacticalRole || "Belirsiz";

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

    // Butonlar
    const actionsContainer = document.getElementById('pp-actions-container');
    actionsContainer.innerHTML = ""; // Temizle

    // Sadece menajerin kendi oyuncusuysa aksiyon butonlarını göster
    if (player.teamId === window.myTeam.id) {
        
        // Transfer Listesine Koy Butonu
        const btnTransfer = document.createElement('button');
        if (player.isListed) {
            btnTransfer.className = "pp-action-btn btn-disabled";
            btnTransfer.innerHTML = "<i class='fas fa-list'></i> Transfer Listesinde";
            btnTransfer.disabled = true;
        } else {
            btnTransfer.className = "pp-action-btn btn-transfer";
            btnTransfer.innerHTML = "<i class='fas fa-exchange-alt'></i> Transfer Listesine Koy";
            btnTransfer.onclick = () => {
                if(typeof openTransferModal === 'function') {
                    closePlayerProfile();
                    openTransferModal(player);
                }
            };
        }
        actionsContainer.appendChild(btnTransfer);

        // Kov (Feshet) Butonu
        const btnFire = document.createElement('button');
        btnFire.className = "pp-action-btn btn-fire";
        
        // Tazminat hesaplama: (Güç * KalanYıl) / 10 gibi bir rakam
        const compensation = Math.floor(player.power * yearsLeft * 0.1); 
        btnFire.innerHTML = `<i class='fas fa-door-open'></i> Sözleşmeyi Feshet (Kov) - Tazminat: ${compensation}M€`;
        
        btnFire.onclick = () => {
            if (window.myTeam.budget < compensation) {
                if(typeof speak === 'function') speak("Kulübün bütçesi bu tazminatı ödemeye yetmiyor.");
                alert(`Kulübün bütçesi yetersiz! İstenen Tazminat: ${compensation}M€`);
                return;
            }

            const confirmFire = confirm(`${player.name} isimli oyuncuyu kovmak üzeresiniz. ${compensation}M€ fesih bedeli bütçenizden düşülecek. Emin misiniz?`);
            if (confirmFire) {
                window.myTeam.budget -= compensation;
                player.teamId = "free_agent";
                player.isListed = false; // Kovulduysa transfer listesinden de çıkar
                
                if(typeof speak === 'function') speak(`${player.name} takımdan gönderildi. ${compensation} milyon euro tazminat ödendi.`);
                
                // UI Güncellemeleri
                closePlayerProfile();
                if(typeof updateManagerMenu === 'function') updateManagerMenu();
                if(typeof updateSquadUI === 'function') updateSquadUI();
            }
        };
        actionsContainer.appendChild(btnFire);
    } else {
        const infoMsg = document.createElement('p');
        infoMsg.textContent = "Bu oyuncu kulübünüze ait değil.";
        infoMsg.style.fontSize = "0.9rem";
        infoMsg.style.color = "#95a5a6";
        actionsContainer.appendChild(infoMsg);
    }

    modal.style.display = 'flex';
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

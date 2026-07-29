// game2.js - Tamamen Baştan Yazılmış Gelişmiş Futbol Motoru (Aşama 1-20)

let canvas = document.getElementById('game-canvas');
let ctx = canvas ? canvas.getContext('2d') : null;

// Durumlar ve Değişkenler
let gameActive = false;
let isPaused = false;
window.managerAuthority = 100;
window.presidentConfidence = 100;
window.consecutiveLosses = 0;
window.consecutivePasses = 0;
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
    homePlayers = [];
    awayPlayers = [];
    
    // AŞAMA 31: Bağımsız Veritabanından Takım Çekme (Data.js)
    let homeRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === "galatasaray") : [];
    let awayRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === "fenerbahce") : [];
    
    for(let i=0; i<11; i++) {
        let hp = (homeRoster.length > i) ? homeRoster[i] : { name: "Oyuncu "+(i+1), speed: 3.5, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor' };
        
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
        let finalSpeed = hp.speed * badDay;

        homePlayers.push({ 
            x: homeFormations[i].x, y: homeFormations[i].y, 
            speed: finalSpeed, baseSpeed: finalSpeed, condition: 100, name: hp.name, position: hp.position, id: hp.id,
            tacticalRole: hp.tacticalRole, mentalTrait: hp.mentalTrait, power: hp.power, isWorldClass: isWorldClass, isTier2: isTier2, isTier3: isTier3, passPending: false, shotPending: false,
            isUserControlled: false, isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false 
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
        let finalSpeedA = ap.speed * badDayA;

        awayPlayers.push({ 
            x: 800 - homeFormations[i].x, y: homeFormations[i].y, 
            speed: finalSpeedA, baseSpeed: finalSpeedA, condition: 100, name: ap.name, position: ap.position, id: ap.id,
            tacticalRole: ap.tacticalRole, mentalTrait: ap.mentalTrait, power: ap.power, isWorldClass: isWorldClassA, isTier2: isTier2A, isTier3: isTier3A, passPending: false, shotPending: false,
            isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false 
        });
    }
    ball = { x: 400, y: 250, vx: 0, vy: 0, team: 'none', passCooldown: 0, isAirborne: false, airborneUntil: 0 };
    activePlayer = homePlayers[10];
    activePlayer.isUserControlled = true;
    
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
        if(!isPaused && gameActive && (typeof isGameHalted === 'undefined' || !isGameHalted)) {
            timeLeft--;
            let sb = document.getElementById('time-board');
            if(sb) sb.textContent = "Süre: " + timeLeft;
            
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
            
            if(timeLeft <= 0) endGame();
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
        if (p !== activePlayer) {
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
            if (p !== activePlayer) {
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
                if (teamPsychology === 'showboating') let msgs = [
    "Oley!",
    "Stadyum tek yürek oldu: Oley!",
    "Pas yapıldıkça tribünlerden Oley sesleri yükseliyor!",
    "Müthiş bir keyif var tribünlerde, her başarılı pasta Oley çekiliyor."
];
speak(msgs[Math.floor(Math.random() * msgs.length)]);
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
        if(typeof speak === 'function') speak(reason === 'out' ? "Röveşata denedi ama top auta gitti! Belki biraz daha çalışması lazım." : "Röveşata denedi ama kaleci inanılmaz çıkardı! O gol olsaydı haftalarca konuşulurdu!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "İNANILMAZ RÖVEŞATA KAÇTI!";
        ball.isBicycleKick = false;
    } else if (ball.isChipShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? "Aşırtma denedi ama top farklı şekilde dışarı çıkıyor." : "Aşırtma denedi ama kaleci uyumuyor! Topu havada çok rahat kontrol etti.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "AŞIRTMA BAŞARISIZ!";
        ball.isChipShot = false;
    } else if (ball.isBackheelShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? "Topukla klas bir gol atmak istedi ama top dışarıda!" : "Topukla klas bir gol atmak istedi ama savunma yemedi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "TOPUK ŞOVU İŞE YARAMADI!";
        ball.isBackheelShot = false;
    } else if (ball.isPanenka) {
        if(typeof speak === 'function') speak(reason === 'out' ? "Panenka denedi ama topu dışarı attı! Şaka gibi bir an!" : "Panenka denedi! Ne yaptın sen?! Kaleci yerinden bile kıpırdamadı ve topu rahatça kucağına aldı! Büyük rezalet!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "PANENKA REZALETİ!";
        ball.isPanenka = false;
    } else if (ball.isOlympicGoalShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? "Kornerden şansını denedi ama top kaleye yönelmeden auta çıktı." : "Kornerden kaleyi düşündü ama kaleci çok dikkatli.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OLİMPİK DENEME BAŞARISIZ!";
        ball.isOlympicGoalShot = false;
    } else if (window.isSetPieceRoutine && Date.now() < window.setPieceTimer) {
        if(typeof speak === 'function') speak("Organizasyon denediler ama savunma yemedi, tehlike uzaklaştırıldı.");
        window.isSetPieceRoutine = false;
    } else if (ball.isLongHeader) {
        if(typeof speak === 'function') speak(reason === 'out' ? "Uzaktan kafa vuruşu ama isabet yok." : "O kadar uzaktan kafa vuruşu kaleciyi rahatsız etmedi.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KAFA VURUŞU KAÇTI!";
        ball.isLongHeader = false;
    } else if (ball.isDeflectedShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? "Savunmaya çarpan top kornere çıkıyor!" : "Savunmaya çarptı ama kaleci son anda harika bir refleksle uzandı!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KONTRA PİYE BAŞARISIZ!";
        ball.isDeflectedShot = false;
    } else if (ball.isZeroAngleShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? "O açıdan gol atması mucize olurdu zaten. Top auta çıktı." : "İmkansız açıdan mucize aradı ama kaleci kapattı köşeyi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "SIFIRDAN DENEME BAŞARISIZ!";
        ball.isZeroAngleShot = false;
    } else if (ball.shotOriginX && ball.shotOriginX < 600) {
        if(typeof speak === 'function') speak(reason === 'out' ? "Uzaktan şansını denedi ama isabet yok." : "Uzaktan şansını denedi ama kalecinin kucağına gitti.");
        ball.shotOriginX = null;
    } else {
        if(typeof speak === 'function') speak(reason === 'out' ? "Top auta çıktı." : "Önemli bir fırsat tepti.");
    }
    
    let p = homePlayers[10];
    if (p.mentalTrait !== 'elite') {
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
        let foulChance = isTier2Emotional ? 0.05 : 0.02; // İki kat faul
        
        // AŞAMA 46: Hakem Korkusu
        if (window.refereeFear > 50 && teamType === 'home') {
            foulChance *= 0.1; // Hakem %90 oranında lehimize faul çalmaya (bize kart vermeye) korkar
        }
        
        if (ball.team === 'away' && (isTeamFrustrated || isAngryStriker || isTier2Emotional)) {
            let dx = ball.x - p.x; let dy = ball.y - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 30 && Math.random() < foulChance) {
                ball.vx = 0; ball.vy = 0; ball.team = 'none';
                
                let redChance = isTier2Emotional ? 0.6 : 0.3; // Duygusal patlama (Kırmızı)
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
        let staminaDecay = dist * 0.0005; // Uzun maça göre kondisyon erimesi 10 kat yavaşlatıldı
        
        if (p.hasAura) staminaDecay *= 0.85; // Aura kondisyon koruması (%15)
        
        if (p.isTier2) staminaDecay *= 1.5; 
        if (p.isTier4) staminaDecay *= 3.0; // AŞAMA 39: Çaylakların panik eforu
        
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
            window.consecutivePasses = 0;
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
        if (ball.team === 'away' && window.consecutivePasses >= 2 && Math.random() < 0.01) {
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
                ctx.textAlign = "left"; // reset
            }
            requestAnimationFrame(gameLoop);
            return;
        }
    }

    if (ctx) {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, 800, 500);
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

    if (ball.team === 'none') {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;
        
        if (ball.x > 800 && ball.y > 200 && ball.y < 300) {
            let deficitBeforeGoal = enemyScore - playerScore;
            playerScore++; updateScoreBoard(); ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
            
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
                if(typeof speak === 'function') speak("Top direkten döndü! İnanılmaz bir an, ceza sahası karıştı!");
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
                    ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
                    handleStrikerMiss('out');
                }
            }
        } else if (ball.x < 0) {
            // AŞAMA 53: Kendi Kalesine Gol
            if (ball.y > 200 && ball.y < 300) {
                enemyScore++; updateScoreBoard(); ball.x = 400; ball.y = 250; ball.vx=0; ball.vy=0;
                if(typeof speak === 'function') speak("Ne oluyor orada?! İnanılmaz bir anlaşmazlık! Defans arkaya oynamak istedi... Top kendi ağlarına gidiyor!");
                if(typeof announcerText !== 'undefined') announcerText.textContent = "KENDİ KALESİNE GOL!";
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

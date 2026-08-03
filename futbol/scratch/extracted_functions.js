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

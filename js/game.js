// game.js - Ana Oyun Döngüsü ve Motor İşlevleri

// Boşluk tuşuna ve yön tuşlarına basıldığında sayfanın aşağı/yukarı kaymasını engelle
window.addEventListener('keydown', function(event) {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        // Eğer oyuncu input/textarea/BUTTON içindeyse engelleme (Butonların kendi tıklamalarını bozmamak için)
        if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA" && event.target.tagName !== "BUTTON") {
            event.preventDefault(); 
        }
    }
}, { passive: false });

// --- İSTATİSTİK SIFIRLAMA (V1.33 YAMASI) ---
if (!localStorage.getItem('hfzReset_v1_33')) {
    localStorage.removeItem('hafizaGuvenModes');
    localStorage.removeItem('hafizaGuvenAchievements');
    localStorage.removeItem('hafizaGuvenTotalTokens');
    localStorage.removeItem('hafizaGuvenHataKorumasi');
    localStorage.removeItem('hafizaGuvenZamanKorumasi');
    localStorage.setItem('hfzReset_v1_33', 'true');
}

// --- ANA OYUN DEĞİŞKENLERİ ---
window.gameModes = {
    easy: { isUnlocked: true, completionCount: 0, requiredToUnlock: 0, name: 'Kolay' },
    medium: { isUnlocked: false, completionCount: 0, requiredToUnlock: 1, name: 'Orta' },
    hard: { isUnlocked: false, completionCount: 0, requiredToUnlock: 5, name: 'Zor' },
    missing_notes: { isUnlocked: false, completionCount: 0, requiredToUnlock: 5, name: 'Kayıp Notalar' }
};

window.userAchievements = {
    hafizam_gucleniyor: false,
};

window.activeDifficulty = 'easy';
window.gameTimer = 30;
window.gameScore = 0;
window.gameMistakes = 0;
window.gameInterval = null;
window.gameSequence = [];
window.playerInputIndex = 0;
window.isComputerPlaying = false;
window.gameIsActive = false;
window.sessionTokens = 0;
window.turnStartTime = 0;

window.sequenceTimeoutId = null;
window.mobileExitBtnTimeout = null;

// Daha önce kaydedilmiş veri varsa yükle
try {
    const savedModes = localStorage.getItem('hafizaGuvenModes');
    if (savedModes) window.gameModes = JSON.parse(savedModes);

    const savedAchievements = localStorage.getItem('hafizaGuvenAchievements');
    if (savedAchievements) window.userAchievements = JSON.parse(savedAchievements);
} catch (e) { }

// --- YEDEKLEME VE KÜRESEL SIFIRLAMA (KILL-SWITCH) SİSTEMİ ---
window.syncStatsToFirebase = function() {
    let currentUser = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname');
    if (!currentUser || currentUser === "Misafir" || !window.db) return;
    
    let stats = {
        tokens: parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0,
        hk: parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0,
        zk: parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0,
        modes: JSON.parse(localStorage.getItem('hafizaGuvenModes') || "{}"),
        achievements: JSON.parse(localStorage.getItem('hafizaGuvenAchievements') || "{}"),
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Firebase yol hatasını önlemek için karakter temizliği (nokta, dolar vb. içeren isimler LocalStorage çökertmesin diye)
    let safeUserId = currentUser.replace(/[.#$\[\]\/]/g, '_');
    window.db.ref('player_stats/' + safeUserId).set(stats);
};

// LocalStorage işlemleri arasına senkronizasyon kancası atıyoruz
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key.startsWith('hafizaGuven') && window.syncStatsToFirebase) {
        window.syncStatsToFirebase();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Veritabanı hazır oluncaya kadar bekle
    const checkDb = setInterval(() => {
        if (window.db) {
            clearInterval(checkDb);
            
            // Küresel Sıfırlama Tetikleyicisini Dinle
            window.db.ref('global_wipe_timestamp').on('value', (snapshot) => {
                if (snapshot.exists()) {
                    let serverWipeTime = snapshot.val();
                    let localWipeTime = parseInt(localStorage.getItem('lastWipeTime')) || 0;
                    
                    if (serverWipeTime > localWipeTime) {
                        let chatUser = localStorage.getItem('chatUsername');
                        let changelogVer = localStorage.getItem('lastSeenChangelogVersion');
                        
                        localStorage.clear();
                        
                        if (chatUser) localStorage.setItem('chatUsername', chatUser);
                        if (changelogVer) localStorage.setItem('lastSeenChangelogVersion', changelogVer);
                        localStorage.setItem('lastWipeTime', serverWipeTime);
                        
                        if (window.announceToScreenReader) window.announceToScreenReader("Sistem yöneticisi tarafından küresel sıfırlama yapıldı. Tüm verileriniz temizlendi, oyun baştan başlatılıyor.");
                        setTimeout(() => location.reload(), 2000);
                    }
                }
            });
            
            // Cihaz açıldığında mevcut verileri de Firebase'e güncelle
            window.syncStatsToFirebase();
            
            // --- Yasaklama (Ban) Dinleyicisi ---
            window.db.ref('banned_users').on('value', (snapshot) => {
                let chatUser = window.currentChatUser || localStorage.getItem('chatUsername');
                if (chatUser && snapshot.exists() && snapshot.val()[chatUser] === true) {
                    localStorage.clear();
                    document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:50px;' aria-live='assertive'>Oyundan ve sunucudan kalıcı olarak uzaklaştırıldınız.</h1>";
                    if (window.announceToScreenReader) window.announceToScreenReader("Erişim engellendi. Sunucudan kalıcı olarak uzaklaştırıldınız.");
                    setInterval(() => { document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:50px;' aria-live='assertive'>Oyundan ve sunucudan kalıcı olarak uzaklaştırıldınız.</h1>"; }, 100);
                }
            });
            
            // --- Özel Mesaj (PM) Dinleyicisi ---
            let currentChatUserForPM = window.currentChatUser || localStorage.getItem('chatUsername');
            if (currentChatUserForPM && currentChatUserForPM !== "Misafir") {
                let pmRef = window.db.ref('private_messages/' + currentChatUserForPM).limitToLast(1);
                const gameLoadTimeForPM = Date.now();
                pmRef.on('child_added', (snapshot) => {
                    let pmData = snapshot.val();
                    // Sadece oyun açıldıktan sonra gelen yeni mesajları al (Geçmiştekileri tekrar tekrar okumasın)
                    if (pmData.timestamp && pmData.timestamp > gameLoadTimeForPM) {
                        let fMessage = `[Özel Mesaj] ${pmData.from} diyor ki: ${pmData.text}`;
                        
                        const chatMsgList = document.getElementById('chat-messages');
                        if (chatMsgList) {
                            const li = document.createElement('li');
                            li.classList.add('system-message');
                            li.style.color = '#ffcc00'; // PM Rengi
                            li.setAttribute('tabindex', '0');
                            li.setAttribute('aria-label', fMessage);
                            // Güvenlik amaçlı escapeHTML
                            function sEscapeHTML(str) { return !str ? '' : str.toString().replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)); }
                            li.innerHTML = `<div class="wp-bubble" aria-hidden="true" style="background:#5a4a15; border-left:4px solid #ffcc00; color:#fff;"><strong style="color:#ffcc00;">[ÖZEL MESAJ]</strong> ${sEscapeHTML(pmData.from)}: ${sEscapeHTML(pmData.text)}</div>`;
                            chatMsgList.appendChild(li);
                            const chatCont = document.querySelector('.chat-messages-container');
                            if (chatCont) setTimeout(() => chatCont.scrollTop = chatCont.scrollHeight, 10);
                        }
                        
                        if (window.chatReceiveSound) window.chatReceiveSound.play();
                        if (window.announceToScreenReader) window.announceToScreenReader(fMessage, false);
                    }
                });
            }
        }
    }, 1000);
});

window.introPlayed = false;
window.introReadyToStartGame = false;

window.playIntro = function () {
    if (window.introPlayed) return;
    window.introPlayed = true;

    const randomLogoNum = Math.floor(Math.random() * 5) + 1;
    const ext = randomLogoNum === 1 ? 'ogg' : 'wav';
    const audio = new window.Audio(`sounds/logo${randomLogoNum}.${ext}`);

    // Logoların uzunluğu farklı olabileceği için yedek süreyi 15 saniyeye çıkardık.
    let fallbackTimeout = setTimeout(() => { window.startGame(); }, 15000);

    const startSafe = () => {
        clearTimeout(fallbackTimeout);
        window.startGame();
    };

    audio.onended = startSafe;
    audio.onerror = startSafe;
    
    let playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.warn("Logo autoplay blocked", e);
            startSafe();
        });
    }

    window.currentLogoSound = {
        stop: () => {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    const startIntroBtn = document.getElementById('start-intro-btn');
    if (startIntroBtn) startIntroBtn.style.display = 'none';

    const phase1 = document.getElementById('intro-phase-1');
    if (phase1) {
        phase1.style.opacity = '0';
        setTimeout(() => {
            phase1.style.display = 'none';
            phase1.setAttribute('aria-hidden', 'true');

            const phase2 = document.getElementById('intro-phase-2');
            if (phase2) {
                phase2.style.display = 'flex';
                setTimeout(() => {
                    phase2.style.opacity = '1';
                    setTimeout(() => { window.introReadyToStartGame = true; }, 1000);
                }, 50);
            }
        }, 500);
    }
};

window.startGame = function () {
    if (window.isStarted) return;
    window.isStarted = true;

    if (window.currentLogoSound) window.currentLogoSound.stop();

    if (window.bgMusic && !window.bgMusic.playing()) {
        window.bgMusic.play();
    }

    if (window.introScreen) window.introScreen.style.opacity = '0';

    setTimeout(() => {
        if (window.introScreen) {
            window.introScreen.style.display = 'none';
            window.introScreen.setAttribute('aria-hidden', 'true');
        }

        if (window.mainMenu) {
            window.mainMenu.style.display = 'flex';

            const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion');
            if (window.globalChangelogVersion && lastSeenVersion !== window.globalChangelogVersion && window.globalChangelogMessage) {
                if (window.switchMenu && window.serverMessageMenu) window.switchMenu(window.mainMenu, window.serverMessageMenu, 'server-message');
                setTimeout(() => {
                    const firstBtn = document.getElementById('server-message-continue-btn');
                    if (firstBtn) firstBtn.focus();
                    if (window.announceToScreenReader) window.announceToScreenReader("Sunucu Mesajı: " + window.globalChangelogMessage + " Devam etmek için butona basın.");
                }, 400);
            } else {
                window.mainMenu.removeAttribute('aria-hidden');
                setTimeout(() => {
                    window.mainMenu.style.opacity = '1';
                    const firstButton = window.mainMenu.querySelector('.menu-button');
                    if (firstButton) firstButton.focus();
                    if (window.announceToScreenReader && window.localizeText) {
                        window.announceToScreenReader(window.localizeText('Hafızana güven oyununa hoş geldiniz. Öğeler arasında dolaşmak için sağ sol ok tuşlarına basın. Müzik sesini açıp kısmak için, sayfa yukarı ve sayfa aşağı tuşuna basın. Müziği susturmak için m tuşuna basın.'));
                    }
                }, 50);
            }
        }
    }, 1000);
};

window.startMainGame = function (difficulty = 'easy') {
    // Tarayıcı sekmelerini/adres çubuğunu gizlemek için Tam Ekran API devreye alınıyor
    try {
        let elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen().catch(() => {});
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen().catch(() => {});
        }
    } catch (err) {}

    if (window.isStarting) return;
    window.isStarting = true;

    if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
    if (window.music60Sound && window.music60Sound.playing()) window.music60Sound.stop();

    const gameMenuContainer = document.getElementById('game-menu-container');
    if (gameMenuContainer) gameMenuContainer.setAttribute('aria-label', 'Oyun Alanı');

    const gameMenuTitle = document.getElementById('game-menu-title');
    if (gameMenuTitle) gameMenuTitle.textContent = 'Hafızana Güven';

    window.activeDifficulty = difficulty;
    window.gameTimer = (difficulty === 'hard') ? 45 : 30;

    window.gameScore = 0;
    window.gameMistakes = 0;
    window.gameIsActive = true;
    window.isGameEnding = false;
    window.isStarted = true;
    window.gameSequence = [];
    window.playerInputIndex = 0;
    window.isComputerPlaying = false;
    window.sessionTokens = 0;
    window.turnStartTime = 0;

    const mobileExitBtn = document.getElementById('mobile-game-back-btn');
    if (mobileExitBtn) {
        mobileExitBtn.style.display = 'none';
        mobileExitBtn.setAttribute('aria-hidden', 'true');
    }
    if (window.mobileExitBtnTimeout) clearTimeout(window.mobileExitBtnTimeout);

    window.mobileExitBtnTimeout = setTimeout(() => {
        if (window.currentActiveMenu === 'game' && window.gameIsActive && !window.isGridWalkingPhase) {
            if (mobileExitBtn) {
                mobileExitBtn.style.display = 'block';
                mobileExitBtn.removeAttribute('aria-hidden');
            }
        }
    }, 10000);

    window.updateGameUI();

    let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
    let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;

    const gameStatus = document.getElementById('game-status-text');
    if (gameStatus) {
        gameStatus.style.display = 'block';
        gameStatus.textContent = `Oyun 3 saniye içinde başlıyor... ${hk} Hata Koruması, ${zk} Zaman Koruması. İlk notayı dinleyin!`;
    }
    window.gameStatusTimeoutId = setTimeout(() => {
        if (window.announceToScreenReader) window.announceToScreenReader(`Oyun 3 saniye içinde başlıyor. ${hk} Hata Koruması ve ${zk} Zaman Korumasına sahipsiniz. İlk notayı dinleyin!`);
    }, 400);

    if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.stop();
    if (window.clockTickSound) window.clockTickSound.rate(1.0);

    clearInterval(window.gameInterval);
    window.gameStartTimeoutId = setTimeout(() => {
        if (!window.gameIsActive) return;
        window.isStarting = false;
        window.addNewNoteAndPlaySequence();

        window.gameInterval = setInterval(() => {
            if (!window.gameIsActive) {
                clearInterval(window.gameInterval);
                return;
            }
            if (!window.isComputerPlaying) {
                window.gameTimer--;
                window.updateGameUI();

                if (window.gameTimer === 20) {
                    if (window.secons2Sound) window.secons2Sound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Son 20 saniye.", true);
                }

                if (window.gameTimer === 10) {
                    if (window.announceToScreenReader) window.announceToScreenReader("Son 10 saniye.", true);
                }

                if (window.gameTimer <= 10 && window.gameTimer > 0) {
                    if (window.seconsSound) {
                        window.seconsSound.stop();
                        window.seconsSound.play();
                    }
                } else if (window.gameTimer > 10 && window.seconsSound && window.seconsSound.playing()) {
                    window.seconsSound.stop();
                }

                if (window.clockTickSound) {
                    let currentRate = window.clockTickSound.rate();
                    window.clockTickSound.rate(currentRate * 1.01);
                }

                if (window.gameTimer <= 0) {
                    let zkLocal = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
                    if (zkLocal > 0) {
                        zkLocal--;
                        window.gameTimer = 15;
                        localStorage.setItem('hafizaGuvenZamanKorumasi', zkLocal);
                        if (window.seconsSound) window.seconsSound.stop();
                        if (window.announceToScreenReader) window.announceToScreenReader(`Zaman koruması kullanıldı! Süreniz bitmedi, 15 saniye ek süre kazandınız. Kalan zaman koruması: ${zkLocal}`);
                        window.updateGameUI();
                    } else {
                        window.endMainGame(true, false);
                    }
                }
            }
        }, 1000);
    }, 3000);
};

window.addNewNoteAndPlaySequence = function () {
    if (!window.gameIsActive) return;
    const noteKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const randomNote = noteKeys[Math.floor(Math.random() * noteKeys.length)];

    window.gameSequence.push(randomNote);
    window.playerInputIndex = 0;

    window.playGameSequence();
};

window.playGameSequence = function () {
    if (!window.gameIsActive) return;
    window.isComputerPlaying = true;

    const gameStatus = document.getElementById('game-status-text');
    const replayBtn = document.getElementById('mobile-replay-btn');
    if (gameStatus) {
        gameStatus.style.display = 'block';
        gameStatus.textContent = window.isMobileDevice ? "Lütfen dinleyin." : "Bilgisayar çalıyor... Lütfen dinleyin.";
    }
    if (replayBtn) replayBtn.style.display = 'none';

    let noteIndex = 0;

    const speedMs = Math.max(200, 600 - ((window.gameSequence.length - 1) * 50));

    function playNextSeqNote() {
        if (!window.isStarted) return;
        if (!window.gameIsActive) return;
        if (noteIndex < window.gameSequence.length) {
            if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.pause();

            const noteToPlay = window.gameSequence[noteIndex];
            if (window.playPianoNoteSingle) {
                window.playPianoNoteSingle(noteToPlay);
            }
            noteIndex++;
            clearTimeout(window.sequenceTimeoutId);
            window.sequenceTimeoutId = setTimeout(playNextSeqNote, speedMs);
        } else {
            window.isComputerPlaying = false;

            if (window.clockTickSound && !window.clockTickSound.playing()) window.clockTickSound.play();

            window.turnStartTime = Date.now();
            if (gameStatus) {
                gameStatus.style.display = 'block';
                gameStatus.textContent = "Sıra sizde!";
            }
            if (replayBtn) replayBtn.style.display = 'none';

            if (window.announceToScreenReader) window.announceToScreenReader("Sıra sizde");

            clearTimeout(window.replayBtnTimeout);
            window.replayBtnTimeout = setTimeout(() => {
                if (!window.isStarted) return;
                if (window.gameIsActive && !window.isComputerPlaying) {
                    if (gameStatus) gameStatus.style.display = 'none';
                    if (replayBtn && window.isMobileDevice) {
                        replayBtn.style.display = 'block';
                    }
                }
            }, 2500);
        }
    }

    clearTimeout(window.sequenceTimeoutId);
    playNextSeqNote();
};

window.endMainGame = function (isTimeOut, isWin, isUserExit = false) {
    if (window.isGameEnding) return;
    window.isGameEnding = true;

    // 1. Tüm aktif HTML5 Audio elementlerini sustur
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    // 2. Varsa devam eden Web Speech API (Sesli Okuma) anonslarını bıçak gibi kes
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    window.isStarted = false;
    window.isStarting = false;
    clearTimeout(window.sequenceTimeoutId);
    clearTimeout(window.gameStartTimeoutId);
    clearTimeout(window.gameStatusTimeoutId);

    window.gameIsActive = false;
    if (window.updateMobileKeysVisibility) window.updateMobileKeysVisibility();
    clearInterval(window.gameInterval);
    if (window.mobileExitBtnTimeout) clearTimeout(window.mobileExitBtnTimeout);
    if (window.replayBtnTimeout) clearTimeout(window.replayBtnTimeout);

    let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;

    if (window.activeDifficulty === 'hard' && isWin) {
        window.sessionTokens = 100;
    }

    window.sessionTokens = Math.max(0, window.sessionTokens);
    totalTokens += window.sessionTokens;
    try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch (e) { }

    window.updateGameUI();

    let endMessage = "";
    let baseMessage = "";
    let playUnlockSound = false;

    window.isGridWalkingPhase = false;
    const gameMenuContainer = document.getElementById('game-menu-container');
    if (gameMenuContainer) gameMenuContainer.setAttribute('aria-label', 'Oyun Alanı');
    const gameMenuTitle = document.getElementById('game-menu-title');
    if (gameMenuTitle) gameMenuTitle.textContent = 'Hafızana Güven';

    if (isUserExit) {
        if (window.pianoNotes) for (let k in window.pianoNotes) window.pianoNotes[k].stop();
        if (window.seconsSound && window.seconsSound.playing()) window.seconsSound.stop();
        if (window.secons2Sound && window.secons2Sound.playing()) window.secons2Sound.stop();
        if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.stop();
        if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
        if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();

        if (window.switchMenu && window.mainMenu) window.switchMenu(document.getElementById('game-menu-container'), window.mainMenu, 'main');

        endMessage = `Oyundan çıkıldı. Bu oyunda toplam ${window.sessionTokens} jeton kazandınız. Toplam jetonunuz ${totalTokens}. Ana menüye dönüldü.`;
        if (window.announceToScreenReader) window.announceToScreenReader(endMessage);
        // Oyuncu kendi çıkarsa Ana Menü müziğini geri başlat
        if (window.bgMusic && !window.bgMusic.playing()) {
            window.bgMusic.play();
        }
        return;
    }

    if (isWin) {
        baseMessage = `Tebrikler! Zamanında tüm notaları tamamladınız.`;

        if (window.gameModes && window.gameModes[window.activeDifficulty]) {
            window.gameModes[window.activeDifficulty].completionCount += 1;
        }

        try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch (e) { }

        if (window.activeDifficulty === 'easy' && window.gameModes.easy.completionCount === window.gameModes.medium.requiredToUnlock) {
            baseMessage += " Tebrikler, ORTA MOD kilitlerini açtınız!";
            playUnlockSound = true;
        } else if (window.activeDifficulty === 'medium' && window.gameModes.medium.completionCount === window.gameModes.hard.requiredToUnlock) {
            baseMessage += " İnanılmaz, ZOR MOD kilitlerini açtınız!";
            playUnlockSound = true;
        }

        if (window.activeDifficulty === 'easy' && window.gameModes.easy.completionCount >= 2 && window.userAchievements && !window.userAchievements.hafizam_gucleniyor) {
            window.userAchievements.hafizam_gucleniyor = true;
            try { localStorage.setItem('hafizaGuvenAchievements', JSON.stringify(window.userAchievements)); } catch (e) { }

            setTimeout(() => {
                if (window.achievementSound) window.achievementSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Yeni Bir Başarım Kazandınız! İlk başarınızı elde ettiniz: Hafızam güçleniyor.");
            }, 4000);
        }
    } else if (isTimeOut) {
        baseMessage = `Süre bitti!`;
    } else if (window.gameMistakes >= 3) {
        baseMessage = `3 hakkınız bitti!`;
    } else {
        baseMessage = `Oyundan çıkıldı.`;
    }

    endMessage = `${baseMessage} Bu oyunda toplam ${window.sessionTokens} jeton kazandınız. Toplam jetonunuz ${totalTokens}. Ana menüye dönmek için entır tuşuna basın.`;

    const gameStatus = document.getElementById('game-status-text');
    if (gameStatus) {
        gameStatus.style.display = 'block';
        gameStatus.textContent = endMessage;
    }

    if (window.sessionTokens > 0) {
        let coinsToPlay = window.sessionTokens;
        const maxSoundPlays = Math.min(coinsToPlay, 15);
        let playedCount = 0;
        let currentRate = 1.0;
        let delay = 200;

        function playNextCoin() {
            // Eğer oyuncu çıkış yaptıysa jeton saymayı ve odaklamayı anında durdur
            if (!window.gameIsActive) return; 

            if (playedCount < maxSoundPlays) {
                if (window.getCoinsSound) {
                    let sid = window.getCoinsSound.play();
                    window.getCoinsSound.rate(currentRate, sid);
                }

                currentRate += 0.1;
                playedCount++;
                delay = Math.max(40, delay - 20);

                setTimeout(playNextCoin, delay);
            } else {
                setTimeout(() => {
                    if (window.announceToScreenReader) window.announceToScreenReader(endMessage);
                    
                    // Oyun bittiğinde imleci 'Yeniden Dene' veya 'Ana Menü' butonuna zorla
                    setTimeout(() => {
                        let retryBtn = document.getElementById('mobile-replay-btn'); 
                        let backBtn = document.getElementById('game-back-btn');
                        if (retryBtn && retryBtn.style.display !== 'none') retryBtn.focus();
                        else if (backBtn) backBtn.focus();
                    }, 100);
                }, 400);
            }
        }
        playNextCoin();
    } else {
        if (window.announceToScreenReader) window.announceToScreenReader(endMessage);
        
        // Oyun bittiğinde imleci 'Yeniden Dene' veya 'Ana Menü' butonuna zorla
        setTimeout(() => {
            let retryBtn = document.getElementById('mobile-replay-btn'); 
            let backBtn = document.getElementById('game-back-btn');
            if (retryBtn && retryBtn.style.display !== 'none') retryBtn.focus();
            else if (backBtn) backBtn.focus();
        }, 100);
    }

    if (window.pianoNotes) for (let k in window.pianoNotes) window.pianoNotes[k].stop();
    if (window.seconsSound && window.seconsSound.playing()) window.seconsSound.stop();
    if (window.secons2Sound && window.secons2Sound.playing()) window.secons2Sound.stop();
    if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.stop();
    if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
    if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();

    if (playUnlockSound) {
        if (window.modeUnlockSound) window.modeUnlockSound.play();
    } else if (!isWin) {
        if (window.gameOverSound) window.gameOverSound.play();
        if (window.music60Sound) window.music60Sound.play();
    }
};

window.updateGameUI = function () {
    const scoreDisplay = document.getElementById('game-score-display');
    const timerDisplay = document.getElementById('game-timer-display');
    const livesDisplay = document.getElementById('game-lives-display');
    const hudContainer = document.getElementById('game-hud-container');

    let maxLen = 10;
    if (window.activeDifficulty === 'easy') maxLen = 2;
    if (window.activeDifficulty === 'medium') maxLen = 5;
    if (window.activeDifficulty === 'hard') maxLen = 10;
    if (window.activeDifficulty === 'missing_notes') maxLen = 10;

    const scoreText = `Tur: ${window.gameScore} / ${maxLen} | Jeton: ${window.sessionTokens}`;
    if (scoreDisplay) scoreDisplay.textContent = scoreText;

    const displayTime = window.gameTimer < 0 ? 0 : window.gameTimer;
    const timeText = `Süre: ${displayTime}`;
    if (timerDisplay) timerDisplay.textContent = timeText;

    const livesLeft = 3 - window.gameMistakes;
    const livesText = `Hak: ${livesLeft < 0 ? 0 : livesLeft}`;
    if (livesDisplay) livesDisplay.textContent = livesText;

    if (hudContainer) hudContainer.setAttribute('aria-label', `${scoreText}, ${timeText}, ${livesText}`);
};

window.handleGameInput = function (key) {
    if (!window.gameIsActive || window.isComputerPlaying) return;

    const validKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    if (!validKeys.includes(key)) return;

    const expectedNote = window.gameSequence[window.playerInputIndex];

    if (key === expectedNote) {
        if (window.playPianoNoteSingle) window.playPianoNoteSingle(key);
        window.playerInputIndex++;

        if (window.playerInputIndex >= window.gameSequence.length) {
            window.isComputerPlaying = true;
            if (window.correctSound) window.correctSound.play();

            if (window.activeDifficulty !== 'hard') {
                let turnTime = (Date.now() - window.turnStartTime) / 1000;
                let baseTokens = 0;

                if (window.activeDifficulty === 'easy') {
                    baseTokens = Math.floor(Math.random() * 10) + 1;
                } else if (window.activeDifficulty === 'medium') {
                    baseTokens = Math.floor(Math.random() * 11) + 10;
                }

                let thinkingTime = Math.max(0, turnTime - (window.gameSequence.length * 0.5));
                let penalty = Math.floor(thinkingTime * 2);
                penalty += (window.gameMistakes * 5);

                let earnedTokens = Math.max(1, baseTokens - penalty);
                window.sessionTokens += earnedTokens;
            }

            window.gameTimer += (window.gameSequence.length + 7);
            window.gameScore += 1;
            window.gameMistakes = 0;
            window.updateGameUI();

            const gameStatus = document.getElementById('game-status-text');

            let winTarget = 10;
            if (window.activeDifficulty === 'easy') winTarget = 2;
            if (window.activeDifficulty === 'medium') winTarget = 5;
            if (window.activeDifficulty === 'hard') winTarget = 10;

            if (window.gameScore >= winTarget) {
                if (gameStatus) gameStatus.textContent = "Harika!";
                window.endMainGame(false, true);
            } else {
                let motivMsg = "Süpersiniz!";
                if (typeof window.msg1to4 !== 'undefined' && window.msg1to4.length > 0) {
                    if (window.gameScore >= 1 && window.gameScore <= 4) {
                        motivMsg = window.msg1to4[Math.floor(Math.random() * window.msg1to4.length)];
                    } else if (window.gameScore === 5 && window.msg5 && window.msg5.length > 0) {
                        motivMsg = window.msg5[Math.floor(Math.random() * window.msg5.length)];
                    } else if (window.gameScore >= 6 && window.gameScore <= 9 && window.msg6to9 && window.msg6to9.length > 0) {
                        motivMsg = window.msg6to9[Math.floor(Math.random() * window.msg6to9.length)];
                    } else {
                        motivMsg = window.msg1to4[Math.floor(Math.random() * window.msg1to4.length)];
                    }
                }

                let fullMsg = `${motivMsg} (+${window.gameSequence.length + 7} saniye)`;
                if (gameStatus) gameStatus.textContent = fullMsg;
                if (window.announceToScreenReader) window.announceToScreenReader(fullMsg, true);

                const readTimeMs = Math.max(1500, (motivMsg.length * 65) + 800);
                setTimeout(() => {
                    window.addNewNoteAndPlaySequence();
                }, readTimeMs);
            }
        }
    } else {
        window.isComputerPlaying = true;
        if (window.pianoNotes) for (let k in window.pianoNotes) window.pianoNotes[k].stop();

        let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
        if (hk > 0) {
            hk--;
            localStorage.setItem('hafizaGuvenHataKorumasi', hk);

            if (window.wrongSound) window.wrongSound.play();
            const gameStatus = document.getElementById('game-status-text');
            if (gameStatus) gameStatus.textContent = "Hata koruması kullanıldı! Ceza Yok. Dizi tekrar çalınıyor.";

            if (window.announceToScreenReader) window.announceToScreenReader("Hata koruması kullanıldı! Hak veya süre kaybı yok. Tekrar deniyoruz.");
            window.playerInputIndex = 0;

            setTimeout(() => {
                if (window.gameIsActive) window.playGameSequence();
            }, 1200);

        } else {
            if (window.wrongSound) window.wrongSound.play();
            window.gameTimer -= 5;
            window.gameMistakes += 1;
            window.updateGameUI();

            const gameStatus = document.getElementById('game-status-text');
            if (gameStatus) gameStatus.textContent = "Yanlış! -5 saniye. Dizi tekrar çalınıyor.";

            if (window.gameMistakes >= 3 || window.gameTimer <= 0) {
                setTimeout(() => {
                    window.endMainGame(window.gameTimer <= 0, false);
                }, 500);
            } else {
                window.playerInputIndex = 0;
                setTimeout(() => {
                    if (window.gameIsActive) {
                        if (window.announceToScreenReader) window.announceToScreenReader("Tekrar deniyoruz.");
                        window.playGameSequence();
                    }
                }, 1200);
            }
        }
    }
};

window.addEventListener('load', () => {
    let clickCount = 0;
    const fsEvent = (e) => {
        if (window.introPlayed) return;

        clickCount++;
        if (clickCount === 1) {
            if (window.clickSound) window.clickSound.play();
            const ver = window.mevcutSurum || localStorage.getItem('lastSeenChangelogVersion') || "Bilinmiyor";
            const vText = "Versiyon: " + ver;

            const visualVersion = document.getElementById("intro-version-display");
            if (visualVersion) visualVersion.textContent = vText;

            if (window.announceToScreenReader) window.announceToScreenReader(vText + ". Logoyu dinlemek ve oyuna başlamak için tekrar tıklayın veya enter tuşuna basın.");

            const startIntroBtn = document.getElementById('start-intro-btn');
            if (startIntroBtn) startIntroBtn.setAttribute('aria-label', vText + ". Devam etmek için tekrar tıklayın.");
        } else if (clickCount === 2) {
            document.removeEventListener('pointerdown', fsEvent);
            document.removeEventListener('click', fsEvent);
            document.removeEventListener('keydown', keyEvent);
            if (window.playIntro) window.playIntro();
        }
    };

    document.addEventListener('pointerdown', fsEvent);
    document.addEventListener('click', fsEvent);

    const keyEvent = (e) => {
        if (!window.introPlayed && (e.key === 'Enter' || e.key === ' ')) {
            fsEvent(e);
        }
    };
    document.addEventListener('keydown', keyEvent);

window.playCurrentDialog = function() {
    if (!window.practiceDialogues) return;
    const statusText = document.getElementById('practice-status-text');
    if (window.isDialogPhase) {
        if (window.currentDialogIndex < window.practiceDialogues.length) {
            let text = window.practiceDialogues[window.currentDialogIndex];
            if (statusText) statusText.innerHTML = window.localizeText ? window.localizeText(text) : text;
            if (window.announceToScreenReader) window.announceToScreenReader(text);
        } else {
            window.isDialogPhase = false;
            window.inPracticeTutorial = true;
            window.practiceTargetIndex = 0;
            window.practicePressCount = 0;
            if (window.startPracticeNote) window.startPracticeNote();
        }
    }
};

window.startPracticeNote = function() {
    const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    const statusText = document.getElementById('practice-status-text');
    
    if (window.practiceTargetIndex < notes.length) {
        // Öğrenilecek nota varsa sor
        let currentNote = notes[window.practiceTargetIndex].toUpperCase();
        let text = "Şimdi " + currentNote + " tuşuna 3 defa bas.";
        if (statusText) statusText.innerHTML = text;
        if (window.announceToScreenReader) window.announceToScreenReader(text);
    } else {
        // Tüm notalar bittiyse tebrik et ve Geri butonunu göster
        let text = "Tebrikler! Tüm notaları öğrendiniz. Ana menüye dönmek için Geri butonunu kullanabilirsiniz.";
        if (statusText) statusText.innerHTML = text;
        if (window.announceToScreenReader) window.announceToScreenReader(text);
        const practiceNav = document.getElementById('practice-nav');
        if (practiceNav) practiceNav.style.display = 'block';
        window.inPracticeTutorial = false;
    }
};

window.handlePracticeInput = function(key) {
    if (!window.inPracticeTutorial) return;
    const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    if (window.practiceTargetIndex >= notes.length) return;

    if (key === notes[window.practiceTargetIndex]) {
        window.practicePressCount++;
        if (window.practicePressCount >= 3) {
            // 3 kere doğru basıldıysa
            if (window.correctSound) window.correctSound.play();
            window.practiceTargetIndex++;
            window.practicePressCount = 0;
            window.practiceNextTimeout = setTimeout(() => {
                if (window.startPracticeNote) window.startPracticeNote();
            }, 1000); // 1 saniye sonra diğer notayı sor
        } else {
            // Doğru ama henüz 3 olmadı
            if (window.practiceCorrectMessages) {
                let msg = window.practiceCorrectMessages[Math.floor(Math.random() * window.practiceCorrectMessages.length)];
                if (window.announceToScreenReader) window.announceToScreenReader(msg + " " + (3 - window.practicePressCount) + " kaldı.");
            }
        }
    } else {
        // Yanlış tuşa basıldı
        if (window.wrongSound) window.wrongSound.play();
        if (window.practiceWrongMessages) {
            let msg = window.practiceWrongMessages[Math.floor(Math.random() * window.practiceWrongMessages.length)];
            if (window.announceToScreenReader) window.announceToScreenReader(msg);
        }
    }
};

    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', function () {
            if (window.clickSound) window.clickSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader('Oyun kapatılıyor. Lütfen tarayıcı sekmenizi veya pencerenizi kapatın.');
            
            setTimeout(() => { 
                // Önce Electron veya tarayıcı izin veriyorsa kapatmayı dene
                try { window.close(); } catch(e) {}
                
                // Eğer tarayıcıda isek ve window.close() engellendiyse oyunu tamamen gizle.
                document.body.innerHTML = "<h1 style='color:#e9edef;text-align:center;margin-top:20%;font-size:2rem;'>Oyun kapandı. Bu sekmeyi (veya pencereyi) güvenle kapatabilirsiniz.</h1>";
                if (window.bgMusic) window.bgMusic.stop();
            }, 1000);
        });
    }

    const mobileReplayBtn = document.getElementById('mobile-replay-btn');
    if (mobileReplayBtn) {
        mobileReplayBtn.addEventListener('click', () => {
            if (window.gameIsActive && !window.isComputerPlaying && window.gameSequence.length > 0) {
                if (window.announceToScreenReader) window.announceToScreenReader("Dizi tekrar ediliyor. Saniye eksi bir.");
                if (isUserExit) {
                    if (window.gameBGM && window.gameBGM.playing()) window.gameBGM.stop();
                    window.updateGameUI();
                    // Oyuncu kendi çıkarsa Ana Menü müziğini geri başlat
                    if (window.bgMusic && !window.bgMusic.playing()) {
                        window.bgMusic.play();
                    }
                    return;
                }
                window.gameTimer = Math.max(0, window.gameTimer - 1);
                window.updateGameUI();
                window.playerInputIndex = 0;
                window.playGameSequence();
            }
        });
    }

    const mobileKeys = document.querySelectorAll('.mobile-piano-key');
    mobileKeys.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const note = btn.getAttribute('data-key');
            if (!note) return;

            if (window.isStarted && window.currentActiveMenu === 'practice') {
                if (window.playPianoNoteSingle) window.playPianoNoteSingle(note);
            } else if (window.isStarted && window.currentActiveMenu === 'game') {
                if (!window.isGridWalkingPhase) {
                    window.handleGameInput(note);
                }
            } else if (window.isStarted && window.currentActiveMenu === 'story') {
                if (window.isGridWalkingPhase && window.inStoryMode) {
                    if (window.handleStoryWalking) window.handleStoryWalking(note);
                } else {
                    window.handleGameInput(note);
                }
            }
        });
    });
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') {
        if (window.currentActiveMenu === 'feedback' || window.currentActiveMenu === 'server-message' || window.isChatOpen) {
        } else {
            event.preventDefault();
            return;
        }
    }

    // Chat penceresi açıkken tüm oyun kısayollarını devre dışı bırak (gerçek bir Modal mantığı)
    if (window.isChatOpen) {
        // Sadece temel erişilebilirlik ve menü tuşlarına izin ver, harfleri/boşluğu engelle
        if (!['Escape', 'Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            return;
        }
    } else if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
        if (event.key !== 'Escape' && event.key !== 'Tab') {
            return; // Diğer formlarda/inputlarda harf basışları oyuna yansımasını engeller
        }
    }

    if (window.currentActiveMenu === 'feedback') {
        if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'INPUT')) {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape'].includes(event.key)) {
                if (event.key === 'Escape') document.activeElement.blur();
                return;
            }
        }
    }

    if (window.isStarted && window.currentActiveMenu === 'practice') {
        // Yeni Eklenen Enter (Diyalog) Kontrolü
        if (window.isDialogPhase && event.key === 'Enter') {
            window.currentDialogIndex++;
            if (window.playCurrentDialog) window.playCurrentDialog();
            return;
        }
        // Mevcut Tuş Kontrolü
        const key = event.key.toLowerCase();
        const validKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        if (validKeys.includes(key) && !event.repeat && !window.isDialogPhase) {
            if (window.playPianoNoteSingle) window.playPianoNoteSingle(key);
            if (window.handlePracticeInput) window.handlePracticeInput(key);
        }
    }

    if (window.isStarted && window.currentActiveMenu === 'game') {
        const key = event.key.toLowerCase();
        if (!window.isGridWalkingPhase) {
            if (key === 's') {
                event.preventDefault();
                if (window.announceToScreenReader) window.announceToScreenReader(`Geçilen tur: ${window.gameScore}. Kazanılan jeton: ${window.sessionTokens}.`, true);
            } else if (key === 't') {
                event.preventDefault();
                const displayTime = window.gameTimer < 0 ? 0 : window.gameTimer;
                if (window.announceToScreenReader) window.announceToScreenReader(`Kalan süre: ${displayTime} saniye.`, true);
            } else if (key === ' ') {
                event.preventDefault();
                if (!window.isComputerPlaying && window.gameSequence.length > 0) {
                    if (window.announceToScreenReader) window.announceToScreenReader("Dizi tekrar ediliyor. Saniye eksi bir.");
                    window.gameTimer = Math.max(0, window.gameTimer - 1);
                    window.updateGameUI();
                    window.playerInputIndex = 0;
                    window.playGameSequence();
                }
            } else if (!event.repeat) {
                const validKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
                if (validKeys.includes(key)) {
                    event.preventDefault();
                    window.handleGameInput(key);
                }
            }
        }
    }

    if (event.key === 'PageUp') {
        event.preventDefault();
        let currentVolume = Howler.volume();
        Howler.volume(Math.min(1.0, currentVolume + 0.05));
        if (window.announceToScreenReader) window.announceToScreenReader('Ses: ' + Math.round(Howler.volume() * 100), false);
        return;
    }
    if (event.key === 'PageDown') {
        event.preventDefault();
        let currentVolume = Howler.volume();
        Howler.volume(Math.max(0.0, currentVolume - 0.05));
        if (window.announceToScreenReader) window.announceToScreenReader('Ses: ' + Math.round(Howler.volume() * 100), false);
        return;
    }

    if (event.key.toLowerCase() === 'm') {
        let isMuted = false;
        if (window.bgMusic) isMuted = window.bgMusic.mute();
        else if (window.storyBGM) isMuted = window.storyBGM.mute();
        
        const setMute = !isMuted;

        if (window.bgMusic) window.bgMusic.mute(setMute);
        if (window.storyBGM) window.storyBGM.mute(setMute);
        if (window.house2Sound) window.house2Sound.mute(setMute);
        if (window.mountainSound) window.mountainSound.mute(setMute);
        if (window.music60Sound) window.music60Sound.mute(setMute);
        if (window.music272Sound) window.music272Sound.mute(setMute);

        if (window.announceToScreenReader) {
            window.announceToScreenReader(setMute ? 'Arka plan müzikleri sessize alındı.' : 'Arka plan müziklerinin sesi açıldı.');
        }
        return;
    }

    if (event.repeat) {
        if (event.key === 'Enter' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
            event.preventDefault();
        }
        return;
    }

    if (event.key === 'Enter') {
        if (window.currentActiveMenu === 'achievements') {
            if (window.clickSound) window.clickSound.play();
            if (window.switchMenu && window.achievementsMenu && window.mainMenu) window.switchMenu(window.achievementsMenu, window.mainMenu, 'main');
            return;
        }

        if (!window.gameIsActive && window.currentActiveMenu === 'game') {
            if (window.clickSound) window.clickSound.play();
            if (window.switchMenu && window.mainMenu) window.switchMenu(document.getElementById('game-menu-container'), window.mainMenu, 'main');
            return;
        }

        if (window.isStarted && window.currentActiveMenu === 'story' && window.inStoryMode) {
            if (window.isGridWalkingPhase) return;
            
            if (window.clickSound) window.clickSound.play();
            window.currentStoryIndex++;
            
            if (window.missingNotesDialogues && window.currentStoryIndex < window.missingNotesDialogues.length) {
                if (window.playCurrentStoryDialog) window.playCurrentStoryDialog();
                if (window.triggerStoryAnimations) window.triggerStoryAnimations(window.currentStoryIndex);
            } else {
                window.isGridWalkingPhase = true;
                window.isDialogPhase = false;
                window.playerX = 1;
                if (typeof window.initializeMissingNotesMap === 'function') window.initializeMissingNotesMap();
                window.currentAutoWalkStep = 0;
                
                if (window.announceToScreenReader) window.announceToScreenReader("Kayıp Notalar macerasına başlıyorsunuz. İlk notayı bulmak için sağ ok tuşuna basıp karlı zeminde yürüyün.", false);
                
                if (window.updateMobileKeysVisibility) window.updateMobileKeysVisibility();
                
                if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.stop();
                if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
                if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();                
                if (window.playAutomatedWalkingScene) {
                    window.playAutomatedWalkingScene();
                } else {
                    const storyStatus = document.getElementById('story-status-text');
                    if (storyStatus) storyStatus.innerHTML = `X Konumu: ${window.playerX}`;
                }
            }
            return;
        }

        if (!window.introPlayed) {
            window.playIntro();
            return;
        }
        if (window.introReadyToStartGame && !window.isStarted) {
            window.startGame();
            return;
        }
    }

    if (window.isStarted) {
        if (window.currentActiveMenu === 'practice' || (window.currentActiveMenu === 'story' && window.inStoryMode) || (window.currentActiveMenu === 'game' && window.isGridWalkingPhase)) {
            if (window.isGridWalkingPhase && window.gameModes['missing_notes'] && window.gameModes['missing_notes'].isUnlocked) {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (window.handleStoryWalking && window.isGridWalkingPhase) window.handleStoryWalking(event.key);
                    return;
                }
                if (event.key.toLowerCase() === 'c' || event.key.toLowerCase() === 'f' || event.key === 'Enter') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (window.handleStoryWalking && window.isGridWalkingPhase) window.handleStoryWalking(event.key);
                    return;
                }
            }
        }
    }
});

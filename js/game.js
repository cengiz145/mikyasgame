// game.js - Ana Oyun Döngüsü ve Motor İşlevleri

window.hgfzZamanlayici = {
    timeouts: new Set(),
    intervals: new Set(),
    setTimeout: function(fn, delay) {
        const id = setTimeout(() => { this.timeouts.delete(id); fn(); }, delay);
        this.timeouts.add(id);
        return id;
    },
    setInterval: function(fn, delay) {
        const id = setInterval(fn, delay);
        this.intervals.add(id);
        return id;
    },
    hepsiniImhaEt: function() {
        this.timeouts.forEach(id => clearTimeout(id));
        this.intervals.forEach(id => clearInterval(id));
        this.timeouts.clear();
        this.intervals.clear();
    }
};

// Boşluk tuşuna ve yön tuşlarına basıldığında sayfanın aşağı/yukarı kaymasını engelle
window.addEventListener('keydown', function(event) {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        // Eğer oyuncu input/textarea/BUTTON içindeyse engelleme (Butonların kendi tıklamalarını bozmamak için)
        if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA" && event.target.tagName !== "BUTTON") {
            event.preventDefault(); 
        }
    }
}, { passive: false });

// --- İSTATİSTİK SIFIRLAMA (TÜM İLERLEMELER) ---
if (!localStorage.getItem('hfzReset_AllProgress_v2')) {
    localStorage.removeItem('hafizaGuvenModes');
    localStorage.removeItem('hafizaGuvenAchievements');
    localStorage.removeItem('hafizaGuvenTotalTokens');
    localStorage.removeItem('hafizaGuvenHataKorumasi');
    localStorage.removeItem('hafizaGuvenZamanKorumasi');
    localStorage.removeItem('hafizaGuvenSeriDondurma');
    localStorage.removeItem('hafizaGuvenLoginStreak');
    localStorage.removeItem('hafizaGuvenLastLoginDate');
    localStorage.removeItem('hafizaGuvenSoundPacksUnlocked');
    localStorage.removeItem('hafizaGuvenBaglamaPack');
    localStorage.removeItem('hafizaGuvenKavalPack');
    localStorage.removeItem('hafizaGuvenFlutPack');
    localStorage.removeItem('hafizaGuvenKanunPack');
    localStorage.removeItem('hafizaGuvenInstrument');
    localStorage.removeItem('hafizaGuvenFirstTime_v2');
    localStorage.setItem('hfzReset_AllProgress_v2', 'true');
}

// --- ANA OYUN DEĞİŞKENLERİ ---
window.gameModes = {
    easy: { isUnlocked: true, completionCount: 0, requiredToUnlock: 0, name: 'Kolay' },
    medium: { isUnlocked: false, completionCount: 0, requiredToUnlock: 5, name: 'Orta' },
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

// Geçmiş sürümlerden gelen oyuncuların ayarlarını yeni değere (5) zorla
if (window.gameModes && window.gameModes.medium && window.gameModes.medium.requiredToUnlock !== 5) {
    window.gameModes.medium.requiredToUnlock = 5;
    try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch(e) {}
}

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
    const checkDb = window.hgfzZamanlayici.setInterval(() => {
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
                        window.hgfzZamanlayici.setTimeout(() => location.reload(), 2000);
                    }
                }
            });
            
            // Güncelleme sonrası yöneticilerin Firebase'deki eski kalıntı verileri silmesini otomatikleştir (Hile iddialarını önlemek için)
            let currentUserForAdminWipe = window.currentChatUser || localStorage.getItem('chatUsername') || "";
            if (currentUserForAdminWipe.toLowerCase() === 'ekrem' && !localStorage.getItem('hfzAdmin_ServerWipe_v2')) {
                window.db.ref('player_stats').remove();
                localStorage.setItem('hfzAdmin_ServerWipe_v2', 'true');
            }
            
            // Cihaz açıldığında mevcut verileri de Firebase'e güncelle
            window.syncStatsToFirebase();
            
            // --- Yasaklama (Ban) Dinleyicisi ---
            window.db.ref('banned_users').on('value', (snapshot) => {
                let chatUser = window.currentChatUser || localStorage.getItem('chatUsername');
                if (chatUser && snapshot.exists() && snapshot.val()[chatUser] === true) {
                    localStorage.clear();
                    document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:50px;' aria-live='assertive'>Oyundan ve sunucudan kalıcı olarak uzaklaştırıldınız.</h1>";
                    if (window.announceToScreenReader) window.announceToScreenReader("Erişim engellendi. Sunucudan kalıcı olarak uzaklaştırıldınız.");
                    window.hgfzZamanlayici.setInterval(() => { document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:50px;' aria-live='assertive'>Oyundan ve sunucudan kalıcı olarak uzaklaştırıldınız.</h1>"; }, 100);
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
                            if (chatCont) window.hgfzZamanlayici.setTimeout(() => chatCont.scrollTop = chatCont.scrollHeight, 10);
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

    const phase1Element = document.getElementById('intro-phase-1');
    if (phase1Element) phase1Element.setAttribute('aria-hidden', 'true');

    if (window.announceToScreenReader) window.announceToScreenReader("Oyun yükleniyor, lütfen bekleyin...", true);

    const randomLogoNum = Math.floor(Math.random() * 5) + 1;
    const ext = randomLogoNum === 1 ? 'ogg' : 'wav';
    const audio = new window.Audio(`sounds/logo${randomLogoNum}.${ext}`);

    // Logoların uzunluğu farklı olabileceği için yedek süreyi 15 saniyeye çıkardık.
    let fallbackTimeout = window.hgfzZamanlayici.setTimeout(() => { window.startGame(); }, 15000);

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
    // Removed style.display = 'none' to maintain focus during logo playback

    const phase1 = document.getElementById('intro-phase-1');
    if (phase1) {
        phase1.style.opacity = '0';
        window.hgfzZamanlayici.setTimeout(() => {
            phase1.style.display = 'none';
            phase1.setAttribute('aria-hidden', 'true');

            const phase2 = document.getElementById('intro-phase-2');
            if (phase2) {
                phase2.style.display = 'flex';
                window.hgfzZamanlayici.setTimeout(() => {
                    phase2.style.opacity = '1';
                    window.hgfzZamanlayici.setTimeout(() => { window.introReadyToStartGame = true; }, 1000);
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

    window.hgfzZamanlayici.setTimeout(() => {
        if (window.introScreen) {
            window.introScreen.style.display = 'none';
            window.introScreen.setAttribute('aria-hidden', 'true');
        }

        if (window.mainMenu) {
            window.mainMenu.style.display = 'flex';
            const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion');
            let showChangelog = (window.globalChangelogVersion && lastSeenVersion !== window.globalChangelogVersion && window.globalChangelogMessage);

            const showMainMenu = () => {
                window.mainMenu.removeAttribute('aria-hidden');
                
                const titleEl = document.getElementById('main-menu-title');
                if (titleEl) {
                    titleEl.focus();
                } else {
                    const firstBtn = document.getElementById('start-game-btn');
                    if (firstBtn) firstBtn.focus();
                }

                window.hgfzZamanlayici.setTimeout(() => {
                    window.mainMenu.style.opacity = '1';
                }, 300);
            };

            const doChangelogShow = (fromDailyReward = false) => {
                if (window.switchMenu && window.serverMessageMenu) window.switchMenu(fromDailyReward ? window.dailyRewardMenu : window.mainMenu, window.serverMessageMenu, 'server-message');
                window.hgfzZamanlayici.setTimeout(() => {
                    const firstBtn = document.getElementById('server-message-continue-btn');
                    if (firstBtn) firstBtn.focus();
                    if (window.announceToScreenReader) window.announceToScreenReader("Sunucu Mesajı: " + window.globalChangelogMessage + " Devam etmek için butona basın.");
                }, 400);
            };

            let isFirstTime = (localStorage.getItem('hafizaGuvenFirstTime_v2') !== 'false');

            if (isFirstTime) {
                if (window.switchMenu && window.firstTimeTutorialMenu) {
                    window.switchMenu(window.mainMenu, window.firstTimeTutorialMenu, 'first-time-tutorial');
                }
                window.hgfzZamanlayici.setTimeout(() => {
                    const firstBtn = document.getElementById('first-time-start-btn');
                    if (firstBtn) firstBtn.focus();
                    if (window.announceToScreenReader) window.announceToScreenReader("Merhaba. Oyuna ilk defa giriş yaptığınız için alıştırma modundan başlayacaksınız. Başlamak için Enter tuşuna basın.");
                }, 400);
            } else if (window.pendingDailyRewardMsg) {
                if (window.switchMenu && window.dailyRewardMenu) window.switchMenu(window.mainMenu, window.dailyRewardMenu, 'daily-reward');
                
                const drText = document.getElementById('daily-reward-text');
                if (drText) drText.innerText = window.pendingDailyRewardMsg;

                window.hgfzZamanlayici.setTimeout(() => {
                    const firstBtn = document.getElementById('daily-reward-continue-btn');
                    if (firstBtn) firstBtn.focus();
                    if (window.announceToScreenReader) window.announceToScreenReader("Günlük Giriş Ödülü: " + window.pendingDailyRewardMsg + " Devam etmek için butona basın.");
                }, 400);

                window.onDailyRewardContinue = () => {
                    window.pendingDailyRewardMsg = null;
                    if (showChangelog) {
                        doChangelogShow(true);
                    } else {
                        if (window.switchMenu) window.switchMenu(window.dailyRewardMenu, window.mainMenu, 'main');
                        showMainMenu();
                    }
                };
            } else if (showChangelog) {
                doChangelogShow();
            } else {
                showMainMenu();
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

    window.mobileExitBtnTimeout = window.hgfzZamanlayici.setTimeout(() => {
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
        gameStatus.focus();
    }
    window.gameStatusTimeoutId = window.hgfzZamanlayici.setTimeout(() => {
        if (window.announceToScreenReader) window.announceToScreenReader(`Oyun 3 saniye içinde başlıyor. ${hk} Hata Koruması ve ${zk} Zaman Korumasına sahipsiniz. İlk notayı dinleyin!`);
    }, 400);

    if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.stop();
    if (window.clockTickSound) window.clockTickSound.rate(1.0);

    clearInterval(window.gameInterval);
    window.gameStartTimeoutId = window.hgfzZamanlayici.setTimeout(() => {
        if (!window.gameIsActive) return;
        window.isStarting = false;
        window.addNewNoteAndPlaySequence();

        window.gameInterval = window.hgfzZamanlayici.setInterval(() => {
            if (window.gameIsPaused) return;
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
            window.sequenceTimeoutId = window.hgfzZamanlayici.setTimeout(playNextSeqNote, speedMs);
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
            window.replayBtnTimeout = window.hgfzZamanlayici.setTimeout(() => {
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

window.endMainGame = function (isTimeOut = false, isWin = false, isUserExit = false) {
    window.hgfzZamanlayici.hepsiniImhaEt();
    if (window.isGameEnding) return;
    window.isGameEnding = true;
    window.isStarted = false;
    window.gameIsActive = false;
    window.isGameOverPhase = true;
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
    
    // Hafta Sonu Çift Jeton Etkinliği Kontrolü
    let eventMessage = "";
    if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins() && window.sessionTokens > 0) {
        window.sessionTokens *= 2;
        eventMessage = " (Çift Jeton Etkinliği Aktif!)";
    }
    
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

        endMessage = `Oyundan çıkıldı. Bu oyunda toplam ${window.sessionTokens} jeton kazandınız${eventMessage}. Toplam jetonunuz ${totalTokens}. Ana menüye dönüldü.`;
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

            window.hgfzZamanlayici.setTimeout(() => {
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

    endMessage = `${baseMessage} Bu oyunda toplam ${window.sessionTokens} jeton kazandınız${eventMessage}. Toplam jetonunuz ${totalTokens}. Ana menüye dönmek için entır tuşuna basın.`;

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
            if (playedCount < maxSoundPlays) {
                if (window.getCoinsSound) {
                    let sid = window.getCoinsSound.play();
                    window.getCoinsSound.rate(currentRate, sid);
                }

                currentRate += 0.1;
                playedCount++;
                delay = Math.max(40, delay - 20);

                window.hgfzZamanlayici.setTimeout(playNextCoin, delay);
            } else {
                window.hgfzZamanlayici.setTimeout(() => {
                    if (window.announceToScreenReader) window.announceToScreenReader(endMessage);
                    
                    // Oyun bittiğini Dialog evresine taşıdık. Fokus butona DEĞİL mesaja atanacak.
                    window.hgfzZamanlayici.setTimeout(() => {
                        let gameStatus = document.getElementById('game-status-text');
                        if (gameStatus) {
                            gameStatus.setAttribute('tabindex', '-1');
                            gameStatus.style.outline = 'none';
                            gameStatus.focus();
                        }
                    }, 100);
                }, 400);
            }
        }
        playNextCoin();
    } else {
        if (window.announceToScreenReader) window.announceToScreenReader(endMessage);
        
        // Oyun bittiğimde dialog evresi
        window.hgfzZamanlayici.setTimeout(() => {
            let gameStatus = document.getElementById('game-status-text');
            if (gameStatus) {
                gameStatus.setAttribute('tabindex', '-1');
                gameStatus.style.outline = 'none';
                gameStatus.focus();
            }
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
    } else if (isWin) {
        if (window.gameWinSound) window.gameWinSound.play();
    } else {
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
                let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';

                if (disableMotivation) {
                    motivMsg = "Doğru!";
                } else if (typeof window.msg1to4 !== 'undefined' && window.msg1to4.length > 0) {
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

                let fullMsg = disableMotivation ? `Doğru. +${window.gameSequence.length + 7} saniye` : `${motivMsg} (+${window.gameSequence.length + 7} saniye)`;
                if (gameStatus) gameStatus.textContent = fullMsg;
                if (window.announceToScreenReader) window.announceToScreenReader(fullMsg, true);

                const readTimeMs = disableMotivation ? 1000 : Math.max(1500, (motivMsg.length * 65) + 800);
                window.hgfzZamanlayici.setTimeout(() => {
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

            window.hgfzZamanlayici.setTimeout(() => {
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
                window.hgfzZamanlayici.setTimeout(() => {
                    window.endMainGame(window.gameTimer <= 0, false);
                }, 500);
            } else {
                window.playerInputIndex = 0;
                window.hgfzZamanlayici.setTimeout(() => {
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

        let skipIntro = localStorage.getItem('hafizaGuvenSkipIntro') === 'true';

        if (skipIntro) {
            window.introPlayed = true;
            document.removeEventListener('pointerdown', fsEvent);
            document.removeEventListener('click', fsEvent);
            document.removeEventListener('keydown', keyEvent);

            if (window.startGame) window.startGame();
            return;
        }

        clickCount++;
        if (clickCount === 1) {
            if (window.menuEnterSound) window.menuEnterSound.play();
            const ver = window.mevcutSurum || localStorage.getItem('lastSeenChangelogVersion') || "0.97.4.4";
            const vText = "Versiyon: " + ver;
            const yazarText = "Bu oyun, görme engelli bir müzik öğretmeni olan Ümit Ekrem Mikyas tarafından geliştirilmiştir.";

            const visualVersion = document.getElementById("intro-version-display");
            if (visualVersion) visualVersion.textContent = vText;

            if (window.announceToScreenReader) window.announceToScreenReader(yazarText + " " + vText + ". Logoyu dinlemek ve oyuna başlamak için tekrar tıklayın veya enter tuşuna basın.");

            const startIntroBtn = document.getElementById('start-intro-btn');
            if (startIntroBtn) startIntroBtn.setAttribute('aria-label', yazarText + " " + vText + ". Devam etmek için tekrar tıklayın veya enter tuşuna basın.");
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
            let localizedText = window.localizeText ? window.localizeText(text) : text;
            if (statusText) {
                statusText.innerHTML = localizedText;
                statusText.blur();
                setTimeout(() => statusText.focus(), 10);
            }
            
            if (window.dado3Sound) window.dado3Sound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(localizedText, true);

        } else {
            window.isDialogPhase = false;
            window.inPracticeTutorial = true;
            window.practiceTargetIndex = 0;
            window.practicePressCount = 0;
            if (window.startPracticeNote) window.startPracticeNote();
            if (window.updateMobileKeysVisibility) window.updateMobileKeysVisibility();
        }
    }
};

window.startPracticeNote = function() {
    const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    const statusText = document.getElementById('practice-status-text');
    
    if (window.practiceTargetIndex === 0 && window.music117Sound && window.music117Sound.playing()) {
        if (!window.firstTimeMusic) {
            window.music117Sound.stop();
        }
    }
    
    if (window.practiceTargetIndex < notes.length) {
        // Öğrenilecek nota varsa sor
        let currentNote = notes[window.practiceTargetIndex].toUpperCase();
        let text = "Şimdi " + currentNote + " tuşuna 3 defa bas.";
        if (statusText) {
            statusText.innerHTML = text;
            statusText.blur();
            setTimeout(() => statusText.focus(), 10);
        }
        if (window.announceToScreenReader) window.announceToScreenReader(text, true);
    } else {
        // Tüm notalar bittiyse tebrik et ve Geri butonunu göster
        let text = "Tebrikler! Tüm notaları öğrendiniz. Ana menüye dönmek için Geri butonunu kullanabilirsiniz.";
        if (statusText) {
            statusText.innerHTML = text;
            statusText.blur();
            setTimeout(() => statusText.focus(), 10);
        }
        if (window.announceToScreenReader) window.announceToScreenReader(text, true);
        const practiceNav = document.getElementById('practice-nav');
        if (practiceNav) practiceNav.style.display = 'block';
        window.inPracticeTutorial = false;
        if (window.updateMobileKeysVisibility) window.updateMobileKeysVisibility(); // Menüler de güncelleniyor
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
            window.practiceNextTimeout = window.hgfzZamanlayici.setTimeout(() => {
                if (window.startPracticeNote) window.startPracticeNote();
            }, 1000); // 1 saniye sonra diğer notayı sor
        } else {
            // Doğru ama henüz 3 olmadı
            let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
            if (window.practiceCorrectMessages) {
                let msg = disableMotivation ? "Doğru." : window.practiceCorrectMessages[Math.floor(Math.random() * window.practiceCorrectMessages.length)];
                let fullMsg = disableMotivation ? `${3 - window.practicePressCount} kaldı.` : msg + " " + (3 - window.practicePressCount) + " kaldı.";
                const statusText = document.getElementById('practice-status-text');
                if (statusText) {
                    statusText.innerHTML = fullMsg;
                    statusText.blur();
                    setTimeout(() => statusText.focus(), 10);
                }
                if (window.announceToScreenReader) window.announceToScreenReader(fullMsg);
            }
        }
    } else {
        // Yanlış tuşa basıldı
        if (window.wrongSound) window.wrongSound.play();
        let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
        if (window.practiceWrongMessages) {
            let msg = disableMotivation ? "Yanlış." : window.practiceWrongMessages[Math.floor(Math.random() * window.practiceWrongMessages.length)];
            const statusText = document.getElementById('practice-status-text');
            if (statusText) {
                statusText.innerHTML = msg;
                statusText.blur();
                setTimeout(() => statusText.focus(), 10);
            }
            if (window.announceToScreenReader) window.announceToScreenReader(msg);
        }
    }
};

    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', function () {
            if (window.menuCloseSound) window.menuCloseSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader('Oyun kapatılıyor. Lütfen tarayıcı sekmenizi veya pencerenizi kapatın.');
            
            window.hgfzZamanlayici.setTimeout(() => { 
                // Alt+F4 Web Hilesi: Tarayıcının sekme kapatma engelini aşmayı dener
                try { 
                    window.open('', '_self', ''); 
                    window.close(); 
                } catch(e) {}
                
                // Tarayıcı sekmesinde kalıcı 'about:blank' (boş sayfa) tuzağını önlemek için sadece ekranı karart
                document.documentElement.innerHTML = "<body style='background-color:black;'><h1 style='color:white;text-align:center;margin-top:20%;font-size:2rem;' tabindex='0'>Hafızana Güven sistemden çıkış yaptı.<br>Bu sekmeyi güvenle kapatabilirsiniz.</h1></body>";
            }, 2000); // Anonsun (2 saniye) okunabilmesi için bekle
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
                if (window.inPracticeTutorial && !window.isDialogPhase) {
                    if (window.playPianoNoteSingle) window.playPianoNoteSingle(note);
                    if (window.handlePracticeInput) window.handlePracticeInput(note);
                }
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
    // CTRL+S Oyunu Kaydetme Kısayolu
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (!window.gameIsActive) {
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Şu an kaydedilecek aktif bir oyun mevcut değil.");
            return;
        }
        if (window.saveCurrentGame) {
            window.saveCurrentGame();
        }
        return;
    }

    if (event.key === 'Tab') {
        if (window.currentActiveMenu === 'feedback' || window.currentActiveMenu === 'server-message' || window.currentActiveMenu === 'settings' || window.isChatOpen) {
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

    // Oyun Sonu Diyalog (Tebrikler vs.) Modu Devredeyse: Oku ve Çık (Enter)
    if (window.isGameOverPhase) {
        if (event.key === 'Enter' && !event.repeat) {
            event.preventDefault();
            window.isGameOverPhase = false;
            // Çıkış sesini atıp ana menüye yollamak
            if (window.menuEnterSound) window.menuEnterSound.play();
            const backBtn = document.getElementById('game-back-btn');
            if (backBtn) backBtn.click();
            return;
        }
    }

    if (window.isStarted && window.currentActiveMenu === 'practice') {
        // Yeni Eklenen Enter (Diyalog) Kontrolü
        if (window.isDialogPhase && event.key === 'Enter' && !event.repeat) {
            window.currentDialogIndex++;
            if (window.playCurrentDialog) window.playCurrentDialog();
            return;
        }
        // Mevcut Tuş Kontrolü
        let key = event.key.toLowerCase();
        let keyboardLayout = localStorage.getItem('hafizaGuvenKeyboardLayout') || 'alpha';
        if (keyboardLayout === 'num') {
            const numMap = {'1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e', '6': 'f', '7': 'g'};
            if (numMap[key]) key = numMap[key];
        }
        const validKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        if (validKeys.includes(key) && !event.repeat && !window.isDialogPhase && window.inPracticeTutorial) {
            if (window.playPianoNoteSingle) window.playPianoNoteSingle(key);
            if (window.handlePracticeInput) window.handlePracticeInput(key);
        }
    }

    if (window.isStarted && window.currentActiveMenu === 'game') {
        let key = event.key.toLowerCase();
        let keyboardLayout = localStorage.getItem('hafizaGuvenKeyboardLayout') || 'alpha';
        if (keyboardLayout === 'num') {
            const numMap = {'1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e', '6': 'f', '7': 'g'};
            if (numMap[key]) key = numMap[key];
        }
        if (!window.isGridWalkingPhase) {
            if (key === 's' || (event.altKey && event.code === 'KeyS')) {
                event.preventDefault();
                if (window.announceToScreenReader) window.announceToScreenReader(`Geçilen tur: ${window.gameScore}. Kazanılan jeton: ${window.sessionTokens}.`, true);
            } else if (key === 't' || (event.altKey && event.code === 'KeyT')) {
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

    if (event.key === 'Home') {
        event.preventDefault();
        let currentVolume = Howler.volume();
        Howler.volume(Math.min(1.0, currentVolume + 0.05));
        if (window.announceToScreenReader) window.announceToScreenReader('Genel Ses: %' + Math.round(Howler.volume() * 100), false);
        return;
    }
    if (event.key === 'End') {
        event.preventDefault();
        let currentVolume = Howler.volume();
        Howler.volume(Math.max(0.0, currentVolume - 0.05));
        if (window.announceToScreenReader) window.announceToScreenReader('Genel Ses: %' + Math.round(Howler.volume() * 100), false);
        return;
    }
    if (event.key === 'PageUp') {
        event.preventDefault();
        let currentMusicVolume = localStorage.getItem('hafizaGuvenMusicVolume');
        currentMusicVolume = currentMusicVolume !== null ? parseInt(currentMusicVolume) : 100;
        currentMusicVolume = Math.min(100, currentMusicVolume + 5);
        localStorage.setItem('hafizaGuvenMusicVolume', currentMusicVolume);
        
        if (window.setMusicVolume) window.setMusicVolume(currentMusicVolume);
        
        let slider = document.getElementById('music-volume-slider');
        if (slider) slider.value = currentMusicVolume;
        let display = document.getElementById('music-volume-display');
        if (display) display.innerText = '%' + currentMusicVolume;

        if (window.announceToScreenReader) window.announceToScreenReader('Müzik Sesi: %' + currentMusicVolume, false);
        return;
    }
    if (event.key === 'PageDown') {
        event.preventDefault();
        let currentMusicVolume = localStorage.getItem('hafizaGuvenMusicVolume');
        currentMusicVolume = currentMusicVolume !== null ? parseInt(currentMusicVolume) : 100;
        currentMusicVolume = Math.max(0, currentMusicVolume - 5);
        localStorage.setItem('hafizaGuvenMusicVolume', currentMusicVolume);
        
        if (window.setMusicVolume) window.setMusicVolume(currentMusicVolume);
        
        let slider = document.getElementById('music-volume-slider');
        if (slider) slider.value = currentMusicVolume;
        let display = document.getElementById('music-volume-display');
        if (display) display.innerText = '%' + currentMusicVolume;

        if (window.announceToScreenReader) window.announceToScreenReader('Müzik Sesi: %' + currentMusicVolume, false);
        return;
    }

    if (event.key.toLowerCase() === 'c' || (event.altKey && event.code === 'KeyC')) {
        event.preventDefault();
        let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens') || "0");
        if (window.announceToScreenReader) {
            window.announceToScreenReader('Toplam Jetonunuz: ' + totalTokens, true);
        }
        return;
    }

    if (event.key.toLowerCase() === 'm' || (event.altKey && event.code === 'KeyM')) {
        let isMuted = false;
        if (window.bgMusic) isMuted = window.bgMusic.mute();
        else if (window.storyBGM) isMuted = window.storyBGM.mute();
        
        const setMute = !isMuted;

        if (typeof window.updateMusicMuteState === 'function') {
            window.updateMusicMuteState(setMute);
        } else {
            if (window.bgMusic) window.bgMusic.mute(setMute);
            if (window.storyBGM) window.storyBGM.mute(setMute);
            if (window.house2Sound) window.house2Sound.mute(setMute);
            if (window.mountainSound) window.mountainSound.mute(setMute);
            if (window.music60Sound) window.music60Sound.mute(setMute);
            if (window.music272Sound) window.music272Sound.mute(setMute);
            if (window.music117Sound) window.music117Sound.mute(setMute);
            if (window.music38Sound) window.music38Sound.mute(setMute);
            if (window.music25Sound) window.music25Sound.mute(setMute);
        }

        if (window.announceToScreenReader) {
            window.announceToScreenReader(setMute ? 'Arka plan müzikleri sessize alındı.' : 'Arka plan müziklerinin sesi açıldı.', true);
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
            if (window.menuCloseSound) window.menuCloseSound.play();
            if (window.switchMenu && window.achievementsMenu && window.mainMenu) window.switchMenu(window.achievementsMenu, window.mainMenu, 'main');
            return;
        }

        if (!window.gameIsActive && window.currentActiveMenu === 'game') {
            if (window.menuCloseSound) window.menuCloseSound.play();
            if (window.switchMenu && window.mainMenu) window.switchMenu(document.getElementById('game-menu-container'), window.mainMenu, 'main');
            return;
        }

        if (window.isStarted && window.currentActiveMenu === 'story' && window.inStoryMode) {
            if (window.isGridWalkingPhase) return;
            
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

window.saveCurrentGame = function() {
    let isPractice = (window.currentActiveMenu === 'practice' && window.isStarted);

    if (!window.gameIsActive && !isPractice) {
        if (window.wrongSound) window.wrongSound.play();
        if (window.announceToScreenReader) window.announceToScreenReader("Şu an kaydedilecek aktif bir oyun mevcut değil.");
        return;
    }
    
    if (window.isComputerPlaying) {
        if (window.announceToScreenReader) window.announceToScreenReader("Notalar çalınırken oyunu kaydedemezsiniz. Lütfen sıranın size geçmesini bekleyin.");
        return;
    }

    if (window.currentActiveMenu === 'pvp') {
        if (window.announceToScreenReader) window.announceToScreenReader("Çok oyunculu modda oyunu kaydedemezsiniz.");
        return;
    }

    let saves = [];
    try {
        let savedData = localStorage.getItem('hafizaGuvenSavedGames');
        if (savedData) saves = JSON.parse(savedData);
    } catch(e) {}

    const saveObj = {
        id: Date.now(),
        dateStr: new Date().toLocaleString('tr-TR'),
        mode: isPractice ? 'practice' : (window.inStoryMode ? 'story' : 'classic'),
        difficulty: window.activeDifficulty,
        sequence: window.gameSequence ? window.gameSequence.slice() : [],
        score: window.gameScore,
        mistakes: window.gameMistakes,
        lives: window.playerLives || 3,
        storyIndex: window.currentStoryIndex || 0,
        gameTimer: window.gameTimer,
        
        isDialogPhase: window.isDialogPhase,
        currentDialogIndex: window.currentDialogIndex,
        inPracticeTutorial: window.inPracticeTutorial,
        practiceTargetIndex: window.practiceTargetIndex,
        practicePressCount: window.practicePressCount
    };

    saves.push(saveObj);
    saves.sort((a, b) => b.id - a.id); // Yeniden eskiye tarih sıralaması

    localStorage.setItem('hafizaGuvenSavedGames', JSON.stringify(saves));

    if (window.showToastNotification) window.showToastNotification("Oyun başarıyla kaydedildi!", "success");
    if (window.announceToScreenReader) window.announceToScreenReader("Oyun başarıyla kaydedildi! Ana menüdeki kayıtlı oyunlar kısmından devam edebilirsiniz.");
    if (window.correctSound) window.correctSound.play();
};

window.populateSavedGamesList = function() {
    const listEl = document.getElementById('saved-games-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    let saves = [];
    try {
        let savedData = localStorage.getItem('hafizaGuvenSavedGames');
        if (savedData) saves = JSON.parse(savedData);
    } catch(e) {}
    
    if (saves.length === 0) {
        listEl.innerHTML = '<li tabindex="0">Henüz kayıtlı oyununuz bulunmuyor.</li>';
        return;
    }
    
    saves.forEach((save, index) => {
        let li = document.createElement('li');
        li.tabIndex = 0;
        
        let modeName = '';
        if (save.mode === 'practice') modeName = 'Alıştırma';
        else if (save.mode === 'story') modeName = 'Kayıp Notalar';
        else modeName = (window.gameModes[save.difficulty] ? window.gameModes[save.difficulty].name : save.difficulty);

        let scoreText = save.score > 0 ? `, Skor: ${save.score}` : '';
        let sequenceText = save.mode === 'practice' ? '' : ` - Sıra: ${save.sequence ? save.sequence.length : 1}`;
        let readSequence = save.mode === 'practice' ? '' : ` Kaldığınız sıra: ${save.sequence ? save.sequence.length : 1}${scoreText}.`;

        li.innerText = `${save.dateStr} - ${modeName} Modu${scoreText}${sequenceText}`;
        li.setAttribute('aria-label', `${save.dateStr} tarihinde kaydedilmiş ${modeName} modu oyunu.${readSequence} Devam etmek için Enter'a basın.`);
        li.className = 'menu-button';
        
        const loadAction = () => {
            // Remove the saved game once loaded (optional, but logical for resume)
            saves.splice(index, 1);
            localStorage.setItem('hafizaGuvenSavedGames', JSON.stringify(saves));
            window.loadSavedGame(save);
        };

        li.addEventListener('click', loadAction);
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') loadAction();
        });
        
        listEl.appendChild(li);
    });
};

window.loadSavedGame = function(saveObj) {
    if (window.gameIsActive) {
        window.gameIsActive = false;
        if (window.gameInterval) clearInterval(window.gameInterval);
        if (window.pianoNotes) { for (let k in window.pianoNotes) window.pianoNotes[k].stop(); }
    }
    
    if (saveObj.mode === 'practice') {
        window.isStarted = true;
        
        window.isDialogPhase = saveObj.isDialogPhase;
        window.currentDialogIndex = saveObj.currentDialogIndex;
        window.inPracticeTutorial = saveObj.inPracticeTutorial;
        window.practiceTargetIndex = saveObj.practiceTargetIndex || 0;
        window.practicePressCount = saveObj.practicePressCount || 0;
        
        window.switchMenu(window.savedGamesMenu, window.practiceMenu, 'practice');
        
        if (window.announceToScreenReader) {
            window.announceToScreenReader("Alıştırma modu yüklendi.");
        }
        
        if (window.isDialogPhase) {
            if (window.playCurrentDialog) window.playCurrentDialog();
        } else if (window.inPracticeTutorial) {
            if (window.startPracticeNote) window.startPracticeNote();
        }
        return;
    }
    
    // Değişkenleri geri yükle
    window.gameIsActive = true;
    window.inStoryMode = (saveObj.mode === 'story');
    window.activeDifficulty = saveObj.difficulty || 'easy';
    window.gameSequence = saveObj.sequence || [];
    window.gameScore = saveObj.score || 0;
    window.gameMistakes = saveObj.mistakes || 0;
    window.playerLives = saveObj.lives || 3;
    window.currentStoryIndex = saveObj.storyIndex || 0;
    window.gameTimer = saveObj.gameTimer || ((window.activeDifficulty === 'hard') ? 15 : (window.activeDifficulty === 'missing_notes') ? 45 : 30);
    
    window.playerInputIndex = 0;
    window.isComputerPlaying = true;
    
    window.updateGameUI();
    
    window.switchMenu(window.savedGamesMenu, window.gameMenu, 'game');
    
    if (window.announceToScreenReader) {
        window.announceToScreenReader("Kayıtlı oyun yüklendi. Notalar çalınıyor, lütfen dinleyin.");
    }
    
    window.hgfzZamanlayici.setTimeout(() => {
        if (window.playGameSequence) {
            window.playGameSequence();
        }
    }, 1500);
};

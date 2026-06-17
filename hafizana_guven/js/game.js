// game.js - Ana Oyun DÃ¶ngÃ¼sÃ¼ ve Motor Ä°ÅŸlevleri

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
    clearTimeout: function(id) {
        clearTimeout(id);
        this.timeouts.delete(id);
    },
    clearInterval: function(id) {
        clearInterval(id);
        this.intervals.delete(id);
    },
    hepsiniImhaEt: function() {
        this.timeouts.forEach(id => clearTimeout(id));
        this.intervals.forEach(id => clearInterval(id));
        this.timeouts.clear();
        this.intervals.clear();
    }
};

window.sEscapeHTML = function(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t));
};


window.DEBUG_MODE = false;

// BoÅŸluk tuÅŸuna ve yÃ¶n tuÅŸlarÄ±na basÄ±ldÄ±ÄŸÄ±nda sayfanÄ±n aÅŸaÄŸÄ±/yukarÄ± kaymasÄ±nÄ± engelle
window.addEventListener('keydown', function(event) {
    // Hata AyÄ±klama (Debug Mode) KÄ±sayolu: Ctrl + Shift + D
    if (event.ctrlKey && event.shiftKey && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault();
        window.DEBUG_MODE = !window.DEBUG_MODE;
        console.log("DEBUG_MODE: " + window.DEBUG_MODE);
        if (window.showToastNotification) {
            window.showToastNotification("Hata AyÄ±klama Modu " + (window.DEBUG_MODE ? "AÃ§Ä±k" : "KapalÄ±"), window.DEBUG_MODE ? "info" : "warning");
        }
        if (window.announceToScreenReader) {
            window.announceToScreenReader("Hata ayÄ±klama modu " + (window.DEBUG_MODE ? "etkinleÅŸtirildi" : "kapatÄ±ldÄ±"));
        }
        if (window.correctSound) window.correctSound.play();
        return;
    }

    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        // EÄŸer oyuncu form elementi iÃ§indeyse engelleme (select, input vb)
        if (!["INPUT", "TEXTAREA", "BUTTON", "SELECT", "OPTION"].includes(event.target.tagName)) {
            event.preventDefault(); 
        }
    }
}, { passive: false });

// --- Ã–ZÃœR HEDÄ°YESÄ° (2000 JETON) ---
if (!localStorage.getItem('hfzApologyGift_2000')) {
    let currentTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
    localStorage.setItem('hafizaGuvenTotalTokens', currentTokens + 2000);
    localStorage.setItem('hfzApologyGift_2000', 'true');
}

// Ä°statistik sÄ±fÄ±rlama (AllProgress_v2) bloÄŸu kaldÄ±rÄ±ldÄ±.

// --- ANA OYUN DEÄÄ°ÅKENLERÄ° ---
window.gameModes = {
    easy: { isUnlocked: true, completionCount: 0, requiredToUnlock: 0, name: 'Kolay' },
    medium: { isUnlocked: false, completionCount: 0, requiredToUnlock: 5, name: 'Orta' },
    hard: { isUnlocked: false, completionCount: 0, requiredToUnlock: 5, name: 'Zor' },
    missing_notes: { isUnlocked: false, completionCount: 0, requiredToUnlock: 5, name: 'KayÄ±p Notalar' },
    rhythm_mode: { isUnlocked: false, completionCount: 0, requiredToUnlock: 1, name: 'Ritim AvcÄ±sÄ±' }
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

// Daha Ã¶nce kaydedilmiÅŸ veri varsa yÃ¼kle
try {
    const savedModes = localStorage.getItem('hafizaGuvenModes');
    if (savedModes) {
        window.gameModes = JSON.parse(savedModes);
        if (!window.gameModes.rhythm_mode) {
            window.gameModes.rhythm_mode = { isUnlocked: false, completionCount: 0, requiredToUnlock: 1, name: 'Ritim AvcÄ±sÄ±' };
        }
    }

    const savedAchievements = localStorage.getItem('hafizaGuvenAchievements');
    if (savedAchievements) window.userAchievements = JSON.parse(savedAchievements);
} catch (e) { }

// GeÃ§miÅŸ sÃ¼rÃ¼mlerden gelen oyuncularÄ±n ayarlarÄ±nÄ± yeni deÄŸere (5) zorla
if (window.gameModes && window.gameModes.medium && window.gameModes.medium.requiredToUnlock !== 5) {
    window.gameModes.medium.requiredToUnlock = 5;
    try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch(e) {}
}

// --- YEDEKLEME VE KÃœRESEL SIFIRLAMA (KILL-SWITCH) SÄ°STEMÄ° ---
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
    
    // Firebase yol hatasÄ±nÄ± Ã¶nlemek iÃ§in karakter temizliÄŸi (nokta, dolar vb. iÃ§eren isimler LocalStorage Ã§Ã¶kertmesin diye)
    let safeUserId = currentUser.replace(/[.#$\[\]\/]/g, '_');
    window.db.ref('player_stats/' + safeUserId).set(stats);
};

// LocalStorage iÅŸlemleri arasÄ±na senkronizasyon kancasÄ± atÄ±yoruz
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key.startsWith('hafizaGuven') && window.syncStatsToFirebase) {
        window.syncStatsToFirebase();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // VeritabanÄ± hazÄ±r oluncaya kadar bekle
    const checkDb = window.hgfzZamanlayici.setInterval(() => {
        if (window.db) {
            clearInterval(checkDb);
            
            // KÃ¼resel SÄ±fÄ±rlama Tetikleyicisini Dinle
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
                        
                        if (window.announceToScreenReader) window.announceToScreenReader("Sistem yÃ¶neticisi tarafÄ±ndan kÃ¼resel sÄ±fÄ±rlama yapÄ±ldÄ±. TÃ¼m verileriniz temizlendi, oyun baÅŸtan baÅŸlatÄ±lÄ±yor.");
                        window.hgfzZamanlayici.setTimeout(() => location.reload(), 2000);
                    }
                }
            });
            
            // YÃ¶netici sunucu temizleme bloÄŸu (hfzAdmin_ServerWipe_v2) kaldÄ±rÄ±ldÄ±.
            
            // Cihaz aÃ§Ä±ldÄ±ÄŸÄ±nda mevcut verileri de Firebase'e gÃ¼ncelle
            window.syncStatsToFirebase();
            
            // --- Yasaklama (Ban) Dinleyicisi ---
            window.db.ref('banned_users').on('value', (snapshot) => {
                let chatUser = window.currentChatUser || localStorage.getItem('chatUsername');
                if (chatUser && snapshot.exists() && snapshot.val()[chatUser] === true) {
                    localStorage.clear();
                    document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:50px;' aria-live='assertive'>Oyundan ve sunucudan kalÄ±cÄ± olarak uzaklaÅŸtÄ±rÄ±ldÄ±nÄ±z.</h1>";
                    if (window.announceToScreenReader) window.announceToScreenReader("EriÅŸim engellendi. Sunucudan kalÄ±cÄ± olarak uzaklaÅŸtÄ±rÄ±ldÄ±nÄ±z.");
                    window.hgfzZamanlayici.setInterval(() => { document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:50px;' aria-live='assertive'>Oyundan ve sunucudan kalÄ±cÄ± olarak uzaklaÅŸtÄ±rÄ±ldÄ±nÄ±z.</h1>"; }, 100);
                }
            });
            
            // --- Ã–zel Mesaj (PM) Dinleyicisi ---
            let currentChatUserForPM = window.currentChatUser || localStorage.getItem('chatUsername');
            if (currentChatUserForPM && currentChatUserForPM !== "Misafir") {
                let pmRef = window.db.ref('private_messages/' + currentChatUserForPM).limitToLast(1);
                const gameLoadTimeForPM = Date.now();
                pmRef.on('child_added', (snapshot) => {
                    let pmData = snapshot.val();
                    // Sadece oyun aÃ§Ä±ldÄ±ktan sonra gelen yeni mesajlarÄ± al (GeÃ§miÅŸtekileri tekrar tekrar okumasÄ±n)
                    if (pmData.timestamp && pmData.timestamp > gameLoadTimeForPM) {
                        let fMessage = `[Ã–zel Mesaj] ${pmData.from} diyor ki: ${pmData.text}`;
                        
                        const chatMsgList = document.getElementById('chat-messages');
                        if (chatMsgList) {
                            const li = document.createElement('li');
                            li.classList.add('system-message');
                            li.style.color = '#ffcc00'; // PM Rengi
                            li.setAttribute('tabindex', '0');
                            li.setAttribute('aria-label', fMessage);
                            // GÃ¼venlik amaÃ§lÄ± escapeHTML
                            li.innerHTML = `<div class="wp-bubble" aria-hidden="true" style="background:#5a4a15; border-left:4px solid #ffcc00; color:#fff;"><strong style="color:#ffcc00;">[Ã–ZEL MESAJ]</strong> ${window.sEscapeHTML(pmData.from)}: ${window.sEscapeHTML(pmData.text)}</div>`;
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

    if (window.announceToScreenReader) window.announceToScreenReader("Oyun yÃ¼kleniyor, lÃ¼tfen bekleyin...", true);

    const randomLogoNum = Math.floor(Math.random() * 5) + 1;
    const ext = randomLogoNum === 1 ? 'ogg' : 'wav';
    const audio = new window.Audio(`sounds/logo${randomLogoNum}.${ext}`);

    // LogolarÄ±n uzunluÄŸu farklÄ± olabileceÄŸi iÃ§in yedek sÃ¼reyi 15 saniyeye Ã§Ä±kardÄ±k.
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
                if (window.switchMenu && window.serverMessageMenu) {
                    window.switchMenu(fromDailyReward ? window.dailyRewardMenu : window.mainMenu, window.serverMessageMenu, 'server-message');
                    window.hgfzZamanlayici.setTimeout(() => {
                        const firstBtn = document.getElementById('server-message-continue-btn');
                        if (firstBtn) firstBtn.focus();
                        if (window.announceToScreenReader) window.announceToScreenReader("Sunucu MesajÄ±: " + window.globalChangelogMessage + " Devam etmek iÃ§in butona basÄ±n.");
                    }, 400);
                } else {
                    showMainMenu();
                }
            };

            let isFirstTime = (localStorage.getItem('hafizaGuvenFirstTime_v2') !== 'false');

            if (isFirstTime && window.firstTimeTutorialMenu) {
                if (window.switchMenu) {
                    window.switchMenu(window.mainMenu, window.firstTimeTutorialMenu, 'first-time-tutorial');
                }
                window.hgfzZamanlayici.setTimeout(() => {
                    const firstBtn = document.getElementById('first-time-start-btn');
                    if (firstBtn) firstBtn.focus();
                    if (window.announceToScreenReader) window.announceToScreenReader("Merhaba. Oyuna ilk defa giriÅŸ yaptÄ±ÄŸÄ±nÄ±z iÃ§in alÄ±ÅŸtÄ±rma modundan baÅŸlayacaksÄ±nÄ±z. BaÅŸlamak iÃ§in Enter tuÅŸuna basÄ±n.");
                }, 400);
            } else {
                if (isFirstTime) {
                    localStorage.setItem('hafizaGuvenFirstTime_v2', 'false');
                }
                if (window.pendingDailyRewardMsg && window.dailyRewardMenu) {
                    if (window.switchMenu) window.switchMenu(window.mainMenu, window.dailyRewardMenu, 'daily-reward');
                    
                    const drText = document.getElementById('daily-reward-text');
                    if (drText) drText.innerText = window.pendingDailyRewardMsg;

                    window.hgfzZamanlayici.setTimeout(() => {
                        const firstBtn = document.getElementById('daily-reward-continue-btn');
                        if (firstBtn) firstBtn.focus();
                        if (window.announceToScreenReader) window.announceToScreenReader("GÃ¼nlÃ¼k GiriÅŸ Ã–dÃ¼lÃ¼: " + window.pendingDailyRewardMsg + " Devam etmek iÃ§in butona basÄ±n.");
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
        }
    }, 1000);
};

window.startMainGame = function (difficulty = 'easy') {
    if (difficulty === 'rhythm_mode') {
        if (window.startRhythmMode) {
            window.startRhythmMode();
            return;
        }
    }
    // TarayÄ±cÄ± sekmelerini/adres Ã§ubuÄŸunu gizlemek iÃ§in Tam Ekran API devreye alÄ±nÄ±yor
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
    if (gameMenuContainer) gameMenuContainer.setAttribute('aria-label', 'Oyun AlanÄ±');

    const gameMenuTitle = document.getElementById('game-menu-title');
    if (gameMenuTitle) gameMenuTitle.textContent = 'HafÄ±zana GÃ¼ven';

    window.activeDifficulty = difficulty;
    window.gameTimer = (difficulty === 'hard') ? 45 : 30;
    window.hasWarned20 = false;
    window.hasWarned10 = false;

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
        gameStatus.textContent = `Oyun 3 saniye iÃ§inde baÅŸlÄ±yor... ${hk} Hata KorumasÄ±, ${zk} Zaman KorumasÄ±. Ä°lk notayÄ± dinleyin!`;
        gameStatus.focus();
    }
    window.gameStatusTimeoutId = window.hgfzZamanlayici.setTimeout(() => {
        if (window.announceToScreenReader) window.announceToScreenReader(`Oyun 3 saniye iÃ§inde baÅŸlÄ±yor. ${hk} Hata KorumasÄ± ve ${zk} Zaman KorumasÄ±na sahipsiniz. Ä°lk notayÄ± dinleyin!`);
    }, 400);

    if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.stop();
    if (window.clockTickSound) window.clockTickSound.rate(1.0);

    window.hgfzZamanlayici.clearInterval(window.gameInterval);
    window.gameStartTimeoutId = window.hgfzZamanlayici.setTimeout(() => {
        if (!window.gameIsActive) return;
        window.isStarting = false;
        window.addNewNoteAndPlaySequence();

        window.gameInterval = window.hgfzZamanlayici.setInterval(() => {
            if (window.gameIsPaused) return;
            if (!window.gameIsActive) {
                window.hgfzZamanlayici.clearInterval(window.gameInterval);
                return;
            }
            if (!window.isComputerPlaying) {
                window.gameTimer--;
                window.updateGameUI();

                if (window.gameTimer <= 20 && window.gameTimer > 10 && !window.hasWarned20) {
                    window.hasWarned20 = true;
                    if (window.secons2Sound) window.secons2Sound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Son 20 saniye.", true);
                }

                if (window.gameTimer <= 10 && window.gameTimer > 0 && !window.hasWarned10) {
                    window.hasWarned10 = true;
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
                        window.hasWarned20 = false;
                        window.hasWarned10 = false;
                        localStorage.setItem('hafizaGuvenZamanKorumasi', zkLocal);
                        if (window.seconsSound) window.seconsSound.stop();
                        if (window.announceToScreenReader) window.announceToScreenReader(`Zaman korumasÄ± kullanÄ±ldÄ±! SÃ¼reniz bitmedi, 15 saniye ek sÃ¼re kazandÄ±nÄ±z. Kalan zaman korumasÄ±: ${zkLocal}`);
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
        gameStatus.textContent = window.isMobileDevice ? "LÃ¼tfen dinleyin." : "Bilgisayar Ã§alÄ±yor... LÃ¼tfen dinleyin.";
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
                gameStatus.textContent = "SÄ±ra sizde!";
            }
            if (replayBtn) replayBtn.style.display = 'none';

            if (window.announceToScreenReader) window.announceToScreenReader("SÄ±ra sizde");

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
    // 1. TÃ¼m aktif HTML5 Audio elementlerini sustur
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    // 2. Varsa devam eden Web Speech API (Sesli Okuma) anonslarÄ±nÄ± bÄ±Ã§ak gibi kes
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

    if (window.activeDifficulty === 'hard' && isWin && !(window.PvP && window.PvP.matchId)) {
        window.sessionTokens = 100;
    }

    window.sessionTokens = Math.max(0, window.sessionTokens);
    
    // Hafta Sonu Ã‡ift Jeton EtkinliÄŸi KontrolÃ¼
    let eventMessage = "";
    if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins() && window.sessionTokens > 0) {
        window.sessionTokens *= 2;
        eventMessage = " (Ã‡ift Jeton EtkinliÄŸi Aktif!)";
    }
    
    totalTokens += window.sessionTokens;
    try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch (e) { }

    window.updateGameUI();

    let endMessage = "";
    let baseMessage = "";
    let playUnlockSound = false;

    window.isGridWalkingPhase = false;
    const gameMenuContainer = document.getElementById('game-menu-container');
    if (gameMenuContainer) gameMenuContainer.setAttribute('aria-label', 'Oyun AlanÄ±');
    const gameMenuTitle = document.getElementById('game-menu-title');
    if (gameMenuTitle) gameMenuTitle.textContent = 'HafÄ±zana GÃ¼ven';

    if (isUserExit) {
        if (window.pianoNotes) for (let k in window.pianoNotes) window.pianoNotes[k].stop();
        if (window.seconsSound && window.seconsSound.playing()) window.seconsSound.stop();
        if (window.secons2Sound && window.secons2Sound.playing()) window.secons2Sound.stop();
        if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.stop();
        if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
        if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();

        if (window.switchMenu && window.mainMenu) window.switchMenu(document.getElementById('game-menu-container'), window.mainMenu, 'main');

        endMessage = `Oyundan Ã§Ä±kÄ±ldÄ±. Bu oyunda toplam ${window.sessionTokens} jeton kazandÄ±nÄ±z${eventMessage}. Toplam jetonunuz ${totalTokens}. Ana menÃ¼ye dÃ¶nÃ¼ldÃ¼.`;
        if (window.announceToScreenReader) window.announceToScreenReader(endMessage);
        // Oyuncu kendi Ã§Ä±karsa Ana MenÃ¼ mÃ¼ziÄŸini geri baÅŸlat
        if (window.bgMusic && !window.bgMusic.playing()) {
            window.bgMusic.play();
        }
        return;
    }

    if (isWin) {
        baseMessage = `Tebrikler! ZamanÄ±nda tÃ¼m notalarÄ± tamamladÄ±nÄ±z.`;

        if (window.gameModes && window.gameModes[window.activeDifficulty]) {
            window.gameModes[window.activeDifficulty].completionCount += 1;
        }

        try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch (e) { }

        if (window.activeDifficulty === 'easy' && window.gameModes.easy.completionCount === window.gameModes.medium.requiredToUnlock) {
            baseMessage += " Tebrikler, ORTA MOD kilitlerini aÃ§tÄ±nÄ±z!";
            playUnlockSound = true;
        } else if (window.activeDifficulty === 'medium' && window.gameModes.medium.completionCount === window.gameModes.hard.requiredToUnlock) {
            baseMessage += " Ä°nanÄ±lmaz, ZOR MOD kilitlerini aÃ§tÄ±nÄ±z!";
            playUnlockSound = true;
        }

        if (window.activeDifficulty === 'easy' && window.gameModes.easy.completionCount >= 2 && window.userAchievements && !window.userAchievements.hafizam_gucleniyor) {
            window.userAchievements.hafizam_gucleniyor = true;
            try { localStorage.setItem('hafizaGuvenAchievements', JSON.stringify(window.userAchievements)); } catch (e) { }

            window.hgfzZamanlayici.setTimeout(() => {
                if (window.achievementSound) window.achievementSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Yeni Bir BaÅŸarÄ±m KazandÄ±nÄ±z! Ä°lk baÅŸarÄ±nÄ±zÄ± elde ettiniz: HafÄ±zam gÃ¼Ã§leniyor.");
                setTimeout(() => {
                    if (window.showAchievementModal) window.showAchievementModal("HafÄ±zam GÃ¼Ã§leniyor");
                }, 3000);
            }, 4000);
        }
    } else if (isTimeOut) {
        baseMessage = `SÃ¼re bitti!`;
    } else if (window.gameMistakes >= 3) {
        baseMessage = `3 hakkÄ±nÄ±z bitti!`;
    } else if (window.activeDifficulty === 'rhythm_mode') {
        baseMessage = `Ritim AvcÄ±sÄ± sona erdi. UlaÅŸtÄ±ÄŸÄ±nÄ±z Seviye: ${window.rhythmState.level}`;
    } else {
        baseMessage = `Oyundan Ã§Ä±kÄ±ldÄ±.`;
    }

    endMessage = `${baseMessage} Bu oyunda toplam ${window.sessionTokens} jeton kazandÄ±nÄ±z${eventMessage}. Toplam jetonunuz ${totalTokens}. Ana menÃ¼ye dÃ¶nmek iÃ§in entÄ±r tuÅŸuna basÄ±n.`;

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
                    
                    // Oyun bittiÄŸini Dialog evresine taÅŸÄ±dÄ±k. Fokus butona DEÄÄ°L mesaja atanacak.
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
        
        // Oyun bittiÄŸimde dialog evresi
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
    const timeText = `SÃ¼re: ${displayTime}`;
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
            if (window.gameTimer > 20) window.hasWarned20 = false;
            if (window.gameTimer > 10) window.hasWarned10 = false;
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
                let motivMsg = "SÃ¼persiniz!";
                let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';

                if (disableMotivation) {
                    motivMsg = "DoÄŸru!";
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

                let fullMsg = disableMotivation ? `DoÄŸru. +${window.gameSequence.length + 7} saniye` : `${motivMsg} (+${window.gameSequence.length + 7} saniye)`;
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
            if (gameStatus) gameStatus.textContent = "Hata korumasÄ± kullanÄ±ldÄ±! Ceza Yok. Dizi tekrar Ã§alÄ±nÄ±yor.";

            if (window.announceToScreenReader) window.announceToScreenReader("Hata korumasÄ± kullanÄ±ldÄ±! Hak veya sÃ¼re kaybÄ± yok. Tekrar deniyoruz.");
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
            if (gameStatus) gameStatus.textContent = "YanlÄ±ÅŸ! -5 saniye. Dizi tekrar Ã§alÄ±nÄ±yor.";

            // Hata sonrasÄ± sÃ¼re kontrolÃ¼ (Zaman KorumasÄ± entegrasyonu)
            if (window.gameTimer <= 0) {
                let zkLocal = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
                if (zkLocal > 0) {
                    zkLocal--;
                    window.gameTimer = 15;
                    window.hasWarned20 = false;
                    window.hasWarned10 = false;
                    localStorage.setItem('hafizaGuvenZamanKorumasi', zkLocal);
                    if (window.seconsSound) window.seconsSound.stop();
                    if (window.announceToScreenReader) window.announceToScreenReader(`Zaman korumasÄ± kullanÄ±ldÄ±! SÃ¼reniz bitmedi, 15 saniye ek sÃ¼re kazandÄ±nÄ±z. Kalan zaman korumasÄ±: ${zkLocal}`);
                    if (gameStatus) gameStatus.textContent = "Zaman korumasÄ± kullanÄ±ldÄ±! +15 saniye.";
                    window.updateGameUI();
                }
            }

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
            const yazarText = "Bu oyun, gÃ¶rme engelli bir mÃ¼zik Ã¶ÄŸretmeni olan Ãœmit Ekrem Mikyas tarafÄ±ndan geliÅŸtirilmiÅŸtir.";

            const visualVersion = document.getElementById("intro-version-display");
            if (visualVersion) visualVersion.textContent = vText;

            if (window.announceToScreenReader) window.announceToScreenReader(yazarText + " " + vText + ". Logoyu dinlemek ve oyuna baÅŸlamak iÃ§in tekrar tÄ±klayÄ±n veya enter tuÅŸuna basÄ±n.");

            const startIntroBtn = document.getElementById('start-intro-btn');
            if (startIntroBtn) startIntroBtn.setAttribute('aria-label', yazarText + " " + vText + ". Devam etmek iÃ§in tekrar tÄ±klayÄ±n veya enter tuÅŸuna basÄ±n.");
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
                window.hgfzZamanlayici.setTimeout(() => statusText.focus(), 10);
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
        // Ã–ÄŸrenilecek nota varsa sor
        let currentNote = notes[window.practiceTargetIndex].toUpperCase();
        let text = "Åimdi " + currentNote + " tuÅŸuna 3 defa bas.";
        if (statusText) {
            statusText.innerHTML = text;
            statusText.blur();
            window.hgfzZamanlayici.setTimeout(() => statusText.focus(), 10);
        }
        if (window.announceToScreenReader) window.announceToScreenReader(text, true);
    } else {
        // TÃ¼m notalar bittiyse tebrik et ve Geri butonunu gÃ¶ster
        let text = "Tebrikler! TÃ¼m notalarÄ± Ã¶ÄŸrendiniz. Ana menÃ¼ye dÃ¶nmek iÃ§in Geri butonunu kullanabilirsiniz.";
        if (statusText) {
            statusText.innerHTML = text;
            statusText.blur();
            window.hgfzZamanlayici.setTimeout(() => statusText.focus(), 10);
        }
        if (window.announceToScreenReader) window.announceToScreenReader(text, true);
        const practiceNav = document.getElementById('practice-nav');
        if (practiceNav) practiceNav.style.display = 'block';
        window.inPracticeTutorial = false;
        if (window.updateMobileKeysVisibility) window.updateMobileKeysVisibility(); // MenÃ¼ler de gÃ¼ncelleniyor
    }
};

window.handlePracticeInput = function(key) {
    if (!window.inPracticeTutorial) return;
    const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    if (window.practiceTargetIndex >= notes.length) return;

    if (key === notes[window.practiceTargetIndex]) {
        window.practicePressCount++;
        if (window.practicePressCount >= 3) {
            // 3 kere doÄŸru basÄ±ldÄ±ysa
            if (window.correctSound) window.correctSound.play();
            window.practiceTargetIndex++;
            window.practicePressCount = 0;
            if (window.practiceNextTimeout) {
                window.hgfzZamanlayici.clearTimeout(window.practiceNextTimeout);
            }
            window.practiceNextTimeout = window.hgfzZamanlayici.setTimeout(() => {
                if (window.startPracticeNote) window.startPracticeNote();
            }, 1000); // 1 saniye sonra diÄŸer notayÄ± sor
        } else {
            // DoÄŸru ama henÃ¼z 3 olmadÄ±
            let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
            if (window.practiceCorrectMessages) {
                let msg = disableMotivation ? "DoÄŸru." : window.practiceCorrectMessages[Math.floor(Math.random() * window.practiceCorrectMessages.length)];
                let fullMsg = disableMotivation ? `${3 - window.practicePressCount} kaldÄ±.` : msg + " " + (3 - window.practicePressCount) + " kaldÄ±.";
                const statusText = document.getElementById('practice-status-text');
                if (statusText) {
                    statusText.innerHTML = fullMsg;
                    statusText.blur();
                    window.hgfzZamanlayici.setTimeout(() => statusText.focus(), 10);
                }
                if (window.announceToScreenReader) window.announceToScreenReader(fullMsg);
            }
        }
    } else {
        // YanlÄ±ÅŸ tuÅŸa basÄ±ldÄ±
        if (window.wrongSound) window.wrongSound.play();
        let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
        if (window.practiceWrongMessages) {
            let msg = disableMotivation ? "YanlÄ±ÅŸ." : window.practiceWrongMessages[Math.floor(Math.random() * window.practiceWrongMessages.length)];
            const statusText = document.getElementById('practice-status-text');
            if (statusText) {
                statusText.innerHTML = msg;
                statusText.blur();
                window.hgfzZamanlayici.setTimeout(() => statusText.focus(), 10);
            }
            if (window.announceToScreenReader) window.announceToScreenReader(msg);
        }
    }
};

    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', function () {
            if (window.menuCloseSound) window.menuCloseSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader('Oyun kapatÄ±lÄ±yor. LÃ¼tfen tarayÄ±cÄ± sekmenizi veya pencerenizi kapatÄ±n.');
            
            window.hgfzZamanlayici.setTimeout(() => { 
                // Alt+F4 Web Hilesi: TarayÄ±cÄ±nÄ±n sekme kapatma engelini aÅŸmayÄ± dener
                try { 
                    window.open('', '_self', ''); 
                    window.close(); 
                } catch(e) {}
                
                // TarayÄ±cÄ± sekmesinde kalÄ±cÄ± 'about:blank' (boÅŸ sayfa) tuzaÄŸÄ±nÄ± Ã¶nlemek iÃ§in sadece ekranÄ± karart
                document.documentElement.innerHTML = "<body style='background-color:black;'><h1 style='color:white;text-align:center;margin-top:20%;font-size:2rem;' tabindex='0'>HafÄ±zana GÃ¼ven sistemden Ã§Ä±kÄ±ÅŸ yaptÄ±.<br>Bu sekmeyi gÃ¼venle kapatabilirsiniz.</h1></body>";
            }, 2000); // Anonsun (2 saniye) okunabilmesi iÃ§in bekle
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
                    // Oyuncu kendi Ã§Ä±karsa Ana MenÃ¼ mÃ¼ziÄŸini geri baÅŸlat
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
    // CTRL+S Oyunu Kaydetme KÄ±sayolu
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (!window.gameIsActive) {
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Åu an kaydedilecek aktif bir oyun mevcut deÄŸil.");
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

    // Chat penceresi aÃ§Ä±kken tÃ¼m oyun kÄ±sayollarÄ±nÄ± devre dÄ±ÅŸÄ± bÄ±rak (gerÃ§ek bir Modal mantÄ±ÄŸÄ±)
    if (window.isChatOpen) {
        // Sadece temel eriÅŸilebilirlik ve menÃ¼ tuÅŸlarÄ±na izin ver, harfleri/boÅŸluÄŸu engelle
        if (!['Escape', 'Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            return;
        }
    } else if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
        if (event.key !== 'Escape' && event.key !== 'Tab') {
            return; // DiÄŸer formlarda/inputlarda harf basÄ±ÅŸlarÄ± oyuna yansÄ±masÄ±nÄ± engeller
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

    // Oyun Sonu Diyalog (Tebrikler vs.) Modu Devredeyse: Oku ve Ã‡Ä±k (Enter)
    if (window.isGameOverPhase) {
        if (event.key === 'Enter' && !event.repeat) {
            event.preventDefault();
            window.isGameOverPhase = false;
            // Ã‡Ä±kÄ±ÅŸ sesini atÄ±p ana menÃ¼ye yollamak
            if (window.menuEnterSound) window.menuEnterSound.play();
            const backBtn = document.getElementById('game-back-btn');
            if (backBtn) backBtn.click();
            return;
        }
    }

    if (window.isStarted && window.currentActiveMenu === 'practice') {
        // Yeni Eklenen Enter (Diyalog) KontrolÃ¼
        if (window.isDialogPhase && event.key === 'Enter' && !event.repeat) {
            window.currentDialogIndex++;
            if (window.playCurrentDialog) window.playCurrentDialog();
            return;
        }
        // Mevcut TuÅŸ KontrolÃ¼
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
                if (window.announceToScreenReader) window.announceToScreenReader(`GeÃ§ilen tur: ${window.gameScore}. KazanÄ±lan jeton: ${window.sessionTokens}.`, true);
            } else if (key === 't' || (event.altKey && event.code === 'KeyT')) {
                event.preventDefault();
                const displayTime = window.gameTimer < 0 ? 0 : window.gameTimer;
                if (window.announceToScreenReader) window.announceToScreenReader(`Kalan sÃ¼re: ${displayTime} saniye.`, true);
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
                    if (window.activeDifficulty === 'rhythm_mode') {
                        if (window.handleRhythmInput) window.handleRhythmInput(key);
                    } else {
                        window.handleGameInput(key);
                    }
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

        if (window.announceToScreenReader) window.announceToScreenReader('MÃ¼zik Sesi: %' + currentMusicVolume, false);
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

        if (window.announceToScreenReader) window.announceToScreenReader('MÃ¼zik Sesi: %' + currentMusicVolume, false);
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
            window.announceToScreenReader(setMute ? 'Arka plan mÃ¼zikleri sessize alÄ±ndÄ±.' : 'Arka plan mÃ¼ziklerinin sesi aÃ§Ä±ldÄ±.', true);
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
                
                if (window.announceToScreenReader) window.announceToScreenReader("KayÄ±p Notalar macerasÄ±na baÅŸlÄ±yorsunuz. Ä°lk notayÄ± bulmak iÃ§in saÄŸ ok tuÅŸuna basÄ±p karlÄ± zeminde yÃ¼rÃ¼yÃ¼n.", false);
                
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
        if (window.announceToScreenReader) window.announceToScreenReader("Åu an kaydedilecek aktif bir oyun mevcut deÄŸil.");
        return;
    }
    
    if (window.isComputerPlaying) {
        if (window.announceToScreenReader) window.announceToScreenReader("Notalar Ã§alÄ±nÄ±rken oyunu kaydedemezsiniz. LÃ¼tfen sÄ±ranÄ±n size geÃ§mesini bekleyin.");
        return;
    }

    if (window.currentActiveMenu === 'pvp') {
        if (window.announceToScreenReader) window.announceToScreenReader("Ã‡ok oyunculu modda oyunu kaydedemezsiniz.");
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
    saves.sort((a, b) => b.id - a.id); // Yeniden eskiye tarih sÄ±ralamasÄ±

    localStorage.setItem('hafizaGuvenSavedGames', JSON.stringify(saves));

    if (window.showToastNotification) window.showToastNotification("Oyun baÅŸarÄ±yla kaydedildi!", "success");
    if (window.announceToScreenReader) window.announceToScreenReader("Oyun baÅŸarÄ±yla kaydedildi! Ana menÃ¼deki kayÄ±tlÄ± oyunlar kÄ±smÄ±ndan devam edebilirsiniz.");
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
        listEl.innerHTML = '<li tabindex="0" role="menuitem">HenÃ¼z kayÄ±tlÄ± oyununuz bulunmuyor.</li>';
        return;
    }
    
    saves.forEach((save, index) => {
        let li = document.createElement('li');
        li.tabIndex = 0;
        
        let modeName = '';
        if (save.mode === 'practice') modeName = 'AlÄ±ÅŸtÄ±rma';
        else if (save.mode === 'story') modeName = 'KayÄ±p Notalar';
        else modeName = (window.gameModes[save.difficulty] ? window.gameModes[save.difficulty].name : save.difficulty);

        let scoreText = save.score > 0 ? `, Skor: ${save.score}` : '';
        let sequenceText = save.mode === 'practice' ? '' : ` - SÄ±ra: ${save.sequence ? save.sequence.length : 1}`;
        let readSequence = save.mode === 'practice' ? '' : ` KaldÄ±ÄŸÄ±nÄ±z sÄ±ra: ${save.sequence ? save.sequence.length : 1}${scoreText}.`;

        li.innerText = `${save.dateStr} - ${modeName} Modu${scoreText}${sequenceText}`;
        li.setAttribute('aria-label', `${save.dateStr} tarihinde kaydedilmiÅŸ ${modeName} modu oyunu.${readSequence} Devam etmek iÃ§in Enter'a basÄ±n.`);
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
            window.announceToScreenReader("AlÄ±ÅŸtÄ±rma modu yÃ¼klendi.");
        }
        
        if (window.isDialogPhase) {
            if (window.playCurrentDialog) window.playCurrentDialog();
        } else if (window.inPracticeTutorial) {
            if (window.startPracticeNote) window.startPracticeNote();
        }
        return;
    }
    
    // DeÄŸiÅŸkenleri geri yÃ¼kle
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
        window.announceToScreenReader("KayÄ±tlÄ± oyun yÃ¼klendi. Notalar Ã§alÄ±nÄ±yor, lÃ¼tfen dinleyin.");
    }
    
    window.hgfzZamanlayici.setTimeout(() => {
        if (window.playGameSequence) {
            window.playGameSequence();
        }
    }, 1500);
};

window.rhythmState = {
    bpm: 60,
    level: 1,
    successes: 0,
    sequence: [],
    playerIndex: 0,
    beatsPerMeasure: 4,
    measures: 2,
    isPlaying: false,
    intervalId: null
};

window.startRhythmMode = function() {
    window.activeDifficulty = 'rhythm_mode';
    window.gameIsActive = true;
    window.isComputerPlaying = true;
    
    window.rhythmState.bpm = 60;
    window.rhythmState.level = 1;
    window.rhythmState.successes = 0;
    window.rhythmState.mistakes = 0;
    
    const gameStatus = document.getElementById('game-status-text');
    if (gameStatus) {
        gameStatus.style.display = 'block';
        gameStatus.textContent = "Ritim AvcÄ±sÄ± baÅŸlÄ±yor... 60 BPM. BilgisayarÄ± dinleyin!";
        if (window.announceToScreenReader) window.announceToScreenReader(gameStatus.textContent);
    }
    
    setTimeout(() => {
        window.playRhythmComputerTurn();
    }, 2000);
};

window.playRhythmComputerTurn = function() {
    window.hgfzZamanlayici.clearInterval(window.gameInterval); // Clear timer when computer plays
    window.isComputerPlaying = true;
    window.rhythmState.playerIndex = 0;
    window.rhythmState.sequence = [];
    
    let totalBeats = window.rhythmState.beatsPerMeasure * window.rhythmState.measures; // 8 beats
    
    let noteCount = Math.min(3 + Math.floor(window.rhythmState.level / 2), totalBeats);
    let availableKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    
    let noteBeats = new Set();
    while(noteBeats.size < noteCount) {
        noteBeats.add(Math.floor(Math.random() * totalBeats));
    }
    
    let beatArray = Array.from(noteBeats).sort((a,b) => a-b);
    let beatToNoteMap = {};
    for (let beat of beatArray) {
        let randomNote = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        beatToNoteMap[beat] = randomNote;
        window.rhythmState.sequence.push(randomNote); // Oyuncunun basmasÄ± gereken sÄ±ra
    }
    
    const gameStatus = document.getElementById('game-status-text');
    if (gameStatus) {
        gameStatus.textContent = `Seviye ${window.rhythmState.level} | BPM: ${window.rhythmState.bpm} | Dinleyin...`;
    }
    
    let currentBeat = 0;
    let intervalMs = 60000 / window.rhythmState.bpm;
    
    window.rhythmState.intervalId = setInterval(() => {
        let isFirstBeat = (currentBeat % window.rhythmState.beatsPerMeasure) === 0;
        if (window.playMetronomeTick) window.playMetronomeTick(isFirstBeat);
        
        if (beatToNoteMap[currentBeat]) {
            let note = beatToNoteMap[currentBeat];
            if (window.playPianoNoteSingle) window.playPianoNoteSingle(note);
        }
        
        currentBeat++;
        if (currentBeat >= totalBeats) {
            clearInterval(window.rhythmState.intervalId);
            setTimeout(() => {
                window.startRhythmPlayerTurn();
            }, intervalMs);
        }
    }, intervalMs);
};

window.startRhythmPlayerTurn = function() {
    window.isComputerPlaying = false;
    const gameStatus = document.getElementById('game-status-text');
    if (gameStatus) {
        gameStatus.textContent = "SÄ±ra sizde! AynÄ± sÄ±rayla Ã§alÄ±n.";
        if (window.announceToScreenReader) window.announceToScreenReader("SÄ±ra sizde!");
    }
    
    window.gameTimer = window.rhythmState.sequence.length + 5;
    window.updateGameUI();
    
    window.hgfzZamanlayici.clearInterval(window.gameInterval);
    window.gameInterval = window.hgfzZamanlayici.setInterval(() => {
        if (window.gameIsPaused || !window.gameIsActive || window.isComputerPlaying) return;
        
        window.gameTimer--;
        window.updateGameUI();
        
        if (window.gameTimer <= 0) {
            let zkLocal = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
            if (zkLocal > 0) {
                zkLocal--;
                localStorage.setItem('hafizaGuvenZamanKorumasi', zkLocal);
                window.gameTimer = 10;
                window.updateGameUI();
                if (window.announceToScreenReader) window.announceToScreenReader("Zaman korumasÄ± kullanÄ±ldÄ±! 10 saniye eklendi.");
                if (gameStatus) gameStatus.textContent = "Zaman korumasÄ± kullanÄ±ldÄ±! +10 saniye.";
            } else {
                window.hgfzZamanlayici.clearInterval(window.gameInterval);
                if (window.wrongSound) window.wrongSound.play();
                window.rhythmState.mistakes++;
                if (window.rhythmState.mistakes >= 3) {
                    window.sessionTokens = (window.rhythmState.level - 1) * 5;
                    window.endMainGame(false, false, false);
                    if (window.announceToScreenReader) window.announceToScreenReader("3 hakkÄ±nÄ±z bitti! Oyun sona erdi.");
                } else {
                    if (gameStatus) gameStatus.textContent = `SÃ¼re bitti! Kalan hak: ${3 - window.rhythmState.mistakes}. Ritim tekrar Ã§alÄ±nÄ±yor.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(`SÃ¼re bitti! Kalan hakkÄ±nÄ±z ${3 - window.rhythmState.mistakes}. Tekrar dinleyin.`);
                    
                    window.isComputerPlaying = true;
                    setTimeout(() => {
                        window.playRhythmComputerTurn();
                    }, 1500);
                }
            }
        }
    }, 1000);
};

window.handleRhythmInput = function(key) {
    if (window.isComputerPlaying || window.activeDifficulty !== 'rhythm_mode') return;
    
    if (window.playPianoNoteSingle) window.playPianoNoteSingle(key);
    
    let expectedKey = window.rhythmState.sequence[window.rhythmState.playerIndex];
    if (key === expectedKey) {
        window.rhythmState.playerIndex++;
        
        if (window.rhythmState.playerIndex >= window.rhythmState.sequence.length) {
            window.isComputerPlaying = true;
            if (window.correctSound) window.correctSound.play();
            window.rhythmState.successes++;
            
            const gameStatus = document.getElementById('game-status-text');
            if (gameStatus) {
                gameStatus.textContent = "Harika!";
                if (window.announceToScreenReader) window.announceToScreenReader("Harika!");
            }
            
            if (window.rhythmState.successes >= 3) {
                window.rhythmState.successes = 0;
                window.rhythmState.level++;
                window.rhythmState.bpm += 10;
                
                if (window.gameModes.rhythm_mode.completionCount < window.rhythmState.level) {
                    window.gameModes.rhythm_mode.completionCount = window.rhythmState.level;
                    try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch(e){}
                }
                
                setTimeout(() => {
                    if (gameStatus) {
                        gameStatus.textContent = `Seviye AtladÄ±nÄ±z! Yeni HÄ±z: ${window.rhythmState.bpm} BPM`;
                        if (window.announceToScreenReader) window.announceToScreenReader(`Seviye AtladÄ±nÄ±z! Yeni HÄ±z: ${window.rhythmState.bpm} BPM`);
                    }
                    if (window.modeUnlockSound) window.modeUnlockSound.play();
                    setTimeout(window.playRhythmComputerTurn, 2500);
                }, 1000);
            } else {
                setTimeout(window.playRhythmComputerTurn, 1500);
            }
        }
    } else {
        window.isComputerPlaying = true;
        let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
        if (hk > 0) {
            hk--;
            localStorage.setItem('hafizaGuvenHataKorumasi', hk);

            if (window.wrongSound) window.wrongSound.play();
            const gameStatus = document.getElementById('game-status-text');
            if (gameStatus) gameStatus.textContent = "Hata korumasÄ± kullanÄ±ldÄ±! Ceza Yok. Ritim tekrar Ã§alÄ±nÄ±yor.";
            if (window.announceToScreenReader) window.announceToScreenReader("Hata korumasÄ± kullanÄ±ldÄ±! Tekrar dinleyin.");

            window.rhythmState.playerIndex = 0;
            setTimeout(() => {
                window.playRhythmComputerTurn();
            }, 1500);
        } else {
            if (window.wrongSound) window.wrongSound.play();
            window.rhythmState.mistakes++;
            if (window.rhythmState.mistakes >= 3) {
                window.sessionTokens = (window.rhythmState.level - 1) * 5;
                window.endMainGame(false, false, false); 
                if (window.announceToScreenReader) window.announceToScreenReader("3 hakkÄ±nÄ±z bitti! Oyun sona erdi.");
            } else {
                const gameStatus = document.getElementById('game-status-text');
                if (gameStatus) gameStatus.textContent = `YanlÄ±ÅŸ nota! Kalan hak: ${3 - window.rhythmState.mistakes}. Ritim tekrar Ã§alÄ±nÄ±yor.`;
                if (window.announceToScreenReader) window.announceToScreenReader(`YanlÄ±ÅŸ nota! Kalan hakkÄ±nÄ±z ${3 - window.rhythmState.mistakes}. Tekrar dinleyin.`);
                
                window.rhythmState.playerIndex = 0;
                setTimeout(() => {
                    window.playRhythmComputerTurn();
                }, 1500);
            }
        }
    }
};


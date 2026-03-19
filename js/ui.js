// ui.js - Kullanıcı Arayüzü, Mobil Tespit ve Ekran Okuyucu Fonksiyonları

// Mobil Cihaz Tespiti
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
window.isMobileDevice = isMobile;

// --- OTOMATİK GÜNCELLEME KONTROL SİSTEMİ ---
window.mevcutSurum = null;
window.globalChangelogVersion = null;
window.globalChangelogMessage = null;

window.guncellemeKontrolEt = function(isManual = false) {
    if (isManual && typeof window.announceToScreenReader === 'function') {
        window.announceToScreenReader('Güncellemeler denetleniyor...');
    }
    fetch('version.json?t=' + new Date().getTime())
        .then(response => { if (!response.ok) throw new Error('Network response bad'); return response.json(); })
        .then(data => {
            const visualVersion = document.getElementById("intro-version-display");
            if (visualVersion) visualVersion.textContent = "Sürüm: " + data.version;

            window.globalChangelogVersion = data.version;
            if (data.changelog) {
                window.globalChangelogMessage = data.changelog;
                const smt = document.getElementById('server-message-text');
                if (smt) smt.innerText = data.changelog;
            }

            let currentMsg = 'Oyununuz güncel.';
            if (data.buildId) {
                const dateObj = new Date(data.buildId * 1000);
                currentMsg += ' En son ' + dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' tarihinde güncellenmiş.';
            }

            if (!window.mevcutSurum) {
                window.mevcutSurum = data.version;
                if (isManual && typeof window.announceToScreenReader === 'function') {
                    window.announceToScreenReader(currentMsg);
                }
            } else if (data.version !== window.mevcutSurum) {
                window.mevcutSurum = data.version;
                const uyariMesaji = "Oyuna zorunlu bir güncelleme geldi! Eski sürümle oynamaya devam edemezsiniz. Lütfen Tamam'a basarak sayfayı yenileyin.";

                window.gameIsActive = false;
                if (typeof Howler !== 'undefined') Howler.stop();

                document.body.innerHTML = "";
                document.body.style.backgroundColor = "#111";

                const updateSound = new window.Audio('sounds/update.ogg');
                updateSound.play();

                const updateMsg = document.createElement("h1");
                updateMsg.textContent = "Zorunlu Güncelleme: Eski sürüm devre dışı bırakıldı.";
                updateMsg.style.color = "#ffb703";
                updateMsg.style.textAlign = "center";
                updateMsg.style.marginTop = "20vh";
                document.body.appendChild(updateMsg);

                setTimeout(() => {
                    alert(uyariMesaji);
                    const refreshBtn = document.createElement("button");
                    refreshBtn.textContent = "YENİ SÜRÜME GEÇ (SAYFAYI YENİLE)";
                    refreshBtn.style.position = "fixed";
                    refreshBtn.style.top = "50%";
                    refreshBtn.style.left = "50%";
                    refreshBtn.style.transform = "translate(-50%, -50%)";
                    refreshBtn.style.zIndex = "999999";
                    refreshBtn.style.padding = "30px 40px";
                    refreshBtn.style.fontSize = "1.5rem";
                    refreshBtn.style.fontWeight = "bold";
                    refreshBtn.style.backgroundColor = "#ffb703";
                    refreshBtn.style.color = "#000";
                    refreshBtn.style.borderRadius = "15px";
                    refreshBtn.setAttribute("aria-label", "Yeni sürüme geçmek zorunludur. Lütfen sayfayı yenileyin.");
                    refreshBtn.onclick = () => { window.location.href = window.location.pathname + "?v=" + new Date().getTime(); };
                    document.body.appendChild(refreshBtn);
                    setTimeout(() => refreshBtn.focus(), 100);
                }, 500);
            } else {
                if (isManual && typeof window.announceToScreenReader === 'function') {
                    window.announceToScreenReader(currentMsg);
                }
            }
        })
        .catch(err => {
            if (isManual && typeof window.announceToScreenReader === 'function') {
                window.announceToScreenReader('Güncelleme kontrolü başarısız oldu.');
            }
        });
};

document.addEventListener('DOMContentLoaded', () => {
    const checkUpdatesBtn = document.getElementById('check-updates-btn');
    if (checkUpdatesBtn) {
        checkUpdatesBtn.addEventListener('click', () => {
            window.guncellemeKontrolEt(true);
        });
    }
});

setTimeout(() => window.guncellemeKontrolEt(false), 2000);
window.addEventListener('focus', () => window.guncellemeKontrolEt(false));
setInterval(() => window.guncellemeKontrolEt(false), 30000);

// Klavye komutlarını mobil dokunmatik ekran komutlarına çevir
window.localizeText = function (text) {
    if (!window.isMobileDevice || !text) return text;
    return text
        .replace(/entıra veya ekrana çift dokunun/gi, "ekrana çift dokunun")
        .replace(/entıra veya /gi, "")
        .replace(/entıra basın/gi, "ekrana çift dokunun")
        .replace(/enter'a basın/gi, "ekrana çift dokunun")
        .replace(/enter tuşuna basın/gi, "ekrana çift dokunun")
        .replace(/entır tuşuna basın/gi, "ekrana çift dokunun")
        .replace(/entır tuşunu kullanabilirsiniz/gi, "ekrana çift dokunabilirsiniz")
        .replace(/entır tuşu ile/gi, "ekrana çift dokunarak")
        .replace(/entır tuşuna bastığınızda/gi, "ekrana çift dokunduğunuzda")
        .replace(/entıra,/gi, "ekrana çift dokunarak,")
        .replace(/entıra/gi, "ekrana çift dokunmaya")
        .replace(/entır tuşu/gi, "ekrana çift dokunma")
        .replace(/entır/gi, "ekrana çift dokunmak")
        .replace(/enter/gi, "ekrana çift dokunmak")
        .replace(/sağ ve sol ok tuşlarına basın/gi, "parmağınızı sağa veya sola süpürme hareketi yapın")
        .replace(/sağ sol ok tuşlarına basın/gi, "parmağınızı sağa veya sola süpürme hareketi yapın")
        .replace(/sağ ve sol ok tuşlarıyla gezinebilirsiniz/gi, "parmağınızı sağa veya sola süpürerek gezinebilirsiniz")
        .replace(/sağ ve sol ok tuşlarıyla gezinebilir/gi, "parmağınızı sağa veya sola süpürerek gezinebilir")
        .replace(/sayfa yukarı ve sayfa aşağı tuşuna basın/gi, "telefonunuzun ses tuşlarına basın")
        .replace(/Page Up ve Page Down tuşlarıyla/gi, "telefonunuzun ses tuşlarıyla")
        .replace(/m tuşuna basın/gi, "sessize alma düğmesini kullanın")
        .replace(/S tuşu ile skorunuzu, T tuşu ile kalan sürenizi öğrenebilir, boşluk tuşu ile bir saniye ceza karşılığında ses dizisini tekrar dinleyebilirsiniz\./gi, "")
        .replace(/<strong>S tuşu<\/strong> ile skorunuzu, <strong>T tuşu<\/strong> ile kalan sürenizi öğrenebilir, <strong>Boşluk tuşu<\/strong> ile bir saniye ceza karşılığında ses dizisini tekrar dinleyebilirsiniz\./gi, "")
        .replace(/ok tuşlarını kullanın/gi, "parmağınızı sağa veya sola süpürün");
};

// Tüm statik Aria Labelleri ve içerikleri mobil cihazsa çevir
document.addEventListener('DOMContentLoaded', () => {
    if (window.isMobileDevice) {
        document.querySelectorAll('[aria-label]').forEach(el => {
            let oldLabel = el.getAttribute('aria-label');
            if (oldLabel) el.setAttribute('aria-label', window.localizeText(oldLabel));
        });
        document.querySelectorAll('.localize-inner').forEach(el => {
            el.innerHTML = window.localizeText(el.innerHTML);
        });
    }
});

window.introScreen = document.getElementById('intro-screen');
window.mainMenu = document.getElementById('main-menu-container');
window.scoreboardMenu = document.getElementById('scoreboard-menu-container');
window.difficultyMenu = document.getElementById('difficulty-menu-container');
window.practiceMenu = document.getElementById('practice-menu-container');
window.statsMenu = document.getElementById('stats-menu-container');
window.storeMenu = document.getElementById('store-menu-container');
window.feedbackMenu = document.getElementById('feedback-menu-container');
window.serverMessageMenu = document.getElementById('server-message-container');
window.achievementsMenu = document.getElementById('achievements-menu-container');
window.gameMenu = document.getElementById('game-menu-container');
window.storyMenu = document.getElementById('story-menu-container');
window.allMenuButtons = Array.from(document.querySelectorAll('.menu-button'));

window.currentFocusIndex = 0;
window.isStarted = false;
window.currentActiveMenu = 'main';

window.getActiveButtons = function() {
    let buttons = [];
    if (window.currentActiveMenu === 'main') buttons = Array.from(window.mainMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'scoreboard') buttons = Array.from(window.scoreboardMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'difficulty') buttons = Array.from(window.difficultyMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'practice') buttons = Array.from(window.practiceMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'story') buttons = Array.from(window.storyMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'stats') buttons = Array.from(window.statsMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'store') buttons = Array.from(window.storeMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'achievements') buttons = Array.from(window.achievementsMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'feedback') buttons = Array.from(window.feedbackMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'server-message') buttons = Array.from(window.serverMessageMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'game') buttons = Array.from(window.gameMenu.querySelectorAll('.menu-button'));

    return buttons.filter(btn => {
        const li = btn.closest('li');
        if (li && li.style.display === 'none') return false;
        return true;
    });
};

window.updateMobileKeysVisibility = function() {
    const mobilePiano = document.getElementById('mobile-piano-container');
    const mobileEnter = document.getElementById('mobile-enter-container');

    document.body.classList.remove('show-mobile-keys', 'show-mobile-enter');

    if (mobilePiano) mobilePiano.setAttribute('aria-hidden', 'true');
    if (mobileEnter) mobileEnter.setAttribute('aria-hidden', 'true');

    if (window.currentActiveMenu === 'game') {
        if (typeof window.gameIsActive !== 'undefined' && !window.gameIsActive) {
            document.body.classList.add('show-mobile-enter');
            if (mobileEnter) mobileEnter.removeAttribute('aria-hidden');
        } else {
            document.body.classList.add('show-mobile-keys');
            if (mobilePiano) mobilePiano.removeAttribute('aria-hidden');
        }
    } else if (window.currentActiveMenu === 'practice') {
        if (typeof window.isDialogPhase !== 'undefined' && window.isDialogPhase) {
            document.body.classList.add('show-mobile-enter');
            if (mobileEnter) mobileEnter.removeAttribute('aria-hidden');
        } else {
            document.body.classList.add('show-mobile-keys');
            if (mobilePiano) mobilePiano.removeAttribute('aria-hidden');
        }
    } else if (window.currentActiveMenu === 'story') {
        if (typeof window.inStoryMode !== 'undefined' && window.inStoryMode && !window.isGridWalkingPhase) {
            document.body.classList.add('show-mobile-enter');
            if (mobileEnter) mobileEnter.removeAttribute('aria-hidden');
        } else {
            document.body.classList.add('show-mobile-keys');
            if (mobilePiano) mobilePiano.removeAttribute('aria-hidden');
        }
    }
};

window.switchMenu = function(hideMenu, showMenu, newActiveMenuName) {
    if (!hideMenu || !showMenu) return;
    hideMenu.style.opacity = '0';
    setTimeout(() => {
        hideMenu.style.display = 'none';
        hideMenu.setAttribute('aria-hidden', 'true');

        showMenu.style.display = 'flex';
        showMenu.removeAttribute('aria-hidden');

        setTimeout(() => {
            showMenu.style.opacity = '1';
            window.currentActiveMenu = newActiveMenuName;
            window.updateMobileKeysVisibility();
            window.currentFocusIndex = 0;
            const firstBtn = showMenu.querySelector('.menu-button');
            if (firstBtn) firstBtn.focus();
        }, 50);
    }, 300);
};

window.announceToScreenReader = function(text, forceFocus = true) {
    text = window.localizeText(text);

    let oldAnnouncer = document.getElementById('sr-focus-announcer');
    if (oldAnnouncer) {
        oldAnnouncer.remove();
    }

    let announcerDiv = document.createElement('div');
    announcerDiv.id = 'sr-focus-announcer';
    announcerDiv.setAttribute('tabindex', '-1');
    announcerDiv.style.position = 'absolute';
    announcerDiv.style.left = '-9999px';
    announcerDiv.style.width = '1px';
    announcerDiv.style.height = '1px';
    announcerDiv.style.overflow = 'hidden';

    if (!forceFocus || window.isMobilePianokeyPressed) {
        announcerDiv.setAttribute('aria-live', 'assertive');
        announcerDiv.innerText = text;
        document.body.appendChild(announcerDiv);
    } else {
        announcerDiv.innerText = text;
        document.body.appendChild(announcerDiv);
        announcerDiv.focus();
    }
};

window.updateButtonUI = function(btnElement, modeData, unlockedLabel, lockReason) {
    if (!btnElement) return;

    if (modeData.isUnlocked) {
        btnElement.removeAttribute('aria-disabled');
        btnElement.classList.remove('locked-btn');
        btnElement.innerHTML = modeData.name + " Mod";
        btnElement.setAttribute('aria-label', unlockedLabel);
    } else {
        btnElement.setAttribute('aria-disabled', 'true');
        btnElement.classList.add('locked-btn');
        const displayName = modeData.name === "Hayatta Kalma" ? modeData.name : modeData.name + " Mod";
        btnElement.innerHTML = displayName + " 🔒";
        btnElement.setAttribute('aria-label', `${modeData.name} modu kilitli. Açmak için ${lockReason}.`);
    }
};

window.updateScoreboardLocks = function() {
    if(!window.gameModes) return;
    if (window.gameModes.easy.completionCount >= window.gameModes.medium.requiredToUnlock) {
        window.gameModes.medium.isUnlocked = true;
    }
    if (window.gameModes.medium.completionCount >= window.gameModes.hard.requiredToUnlock) {
        window.gameModes.hard.isUnlocked = true;
    }
    if (window.gameModes.hard.completionCount >= window.gameModes.missing_notes.requiredToUnlock) {
        window.gameModes.missing_notes.isUnlocked = true;
    }

    const btnMedium = document.getElementById('btn-score-medium');
    const btnHard = document.getElementById('btn-score-hard');
    const btnMissingNotes = document.getElementById('btn-score-missing-notes');

    window.updateButtonUI(btnMedium, window.gameModes.medium, "Orta moddaki en yüksek skoru görüntüle", "Kolay modu 1 kez tamamla");
    window.updateButtonUI(btnHard, window.gameModes.hard, "Zor moddaki yüksek skoru görüntüle", "Orta modu 5 kez tamamla");
    window.updateButtonUI(btnMissingNotes, window.gameModes.missing_notes, "Kayıp notalar modu için yüksek skoru görüntüle", "Zor modu 5 kez tamamla");
};

window.updateDifficultyMenuLocks = function() {
    if(!window.gameModes) return;
    
    // Açılma koşullarını scoreboard güncellemesinde olduğu gibi kontrol et
    if (window.gameModes.easy.completionCount >= window.gameModes.medium.requiredToUnlock) {
        window.gameModes.medium.isUnlocked = true;
    }
    if (window.gameModes.medium.completionCount >= window.gameModes.hard.requiredToUnlock) {
        window.gameModes.hard.isUnlocked = true;
    }
    if (window.gameModes.hard.completionCount >= window.gameModes.missing_notes.requiredToUnlock) {
        window.gameModes.missing_notes.isUnlocked = true;
    }

    const btnMedium = document.getElementById('btn-diff-medium');
    const liMedium = document.getElementById('li-diff-medium');
    const btnHard = document.getElementById('btn-diff-hard');
    const liHard = document.getElementById('li-diff-hard');
    const btnMissingNotes = document.getElementById('btn-diff-missing-notes');
    const liMissingNotes = document.getElementById('li-diff-missing-notes');

    if (liMedium) liMedium.style.display = 'block';
    if (liHard) liHard.style.display = 'block';
    if (liMissingNotes) liMissingNotes.style.display = 'block';

    window.updateButtonUI(btnMedium, window.gameModes.medium, "Orta Modu Oyna", "Kolay modu 1 kez tamamla");
    window.updateButtonUI(btnHard, window.gameModes.hard, "Zor Modu Oyna", "Orta modu 5 kez tamamla");
    window.updateButtonUI(btnMissingNotes, window.gameModes.missing_notes, "Kayıp Notalar Modu. Hikayeli piyano modu.", "Zor modu 5 kez tamamla");
};


// --- EVENTS ---
document.addEventListener('DOMContentLoaded', () => {
    // Hover Effects
    window.allMenuButtons.forEach((button) => {
        const playHover = () => {
            if(window.ensureAudioUnlock) window.ensureAudioUnlock();
            if (window.currentActiveMenu !== 'none' && window.hoverSound) {
                window.hoverSound.play();
            }
        };

        button.addEventListener('mouseenter', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if(window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        });
        button.addEventListener('focus', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if(window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        });
        button.addEventListener('pointerdown', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if(window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        });
        button.addEventListener('touchstart', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if(window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        }, { passive: true });

        button.addEventListener('click', (event) => {
            if(window.ensureAudioUnlock) window.ensureAudioUnlock();
            if (button.getAttribute('aria-disabled') === 'true') {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                if(window.updatePan) window.updatePan(index, activeButtons.length);
            }
            if (window.isStarted && window.clickSound) {
                window.clickSound.play();
            }
        });
    });

    // Menü Butonları Bağlantıları
    const scoreboardBtnMain = document.getElementById('scoreboard-btn-main');
    const scoreboardBackBtn = document.getElementById('scoreboard-back-btn');
    const practiceBtnMain = document.getElementById('practice-mode-btn');
    const practiceBackBtn = document.getElementById('practice-back-btn');
    const statsBtnMain = document.getElementById('stats-btn-main'); 
    const statsBackBtn = document.getElementById('stats-back-btn');
    const storeBtnMain = document.getElementById('store-btn-main');
    const storeBackBtn = document.getElementById('store-back-btn');
    const feedbackBtnMain = document.getElementById('feedback-btn-main');
    const feedbackBackBtn = document.getElementById('feedback-back-btn');
    const feedbackSubmitBtn = document.getElementById('feedback-submit-btn');
    const btnAchievementsMain = document.getElementById('btn-achievements-main');
    const achievementsBackBtn = document.getElementById('achievements-back-btn');

    const buyShieldBtn = document.getElementById('buy-shield-btn');
    const buyTimeShieldBtn = document.getElementById('buy-time-shield-btn');

    const startGameBtn = document.getElementById('start-game-btn');
    const gameBackBtn = document.getElementById('game-back-btn');
    const btnContinueSaved = document.getElementById('btn-continue-saved');
    const serverMessageContinueBtn = document.getElementById('server-message-continue-btn');
    const mobileEnterBtn = document.getElementById('mobile-enter-btn');

    const btnDiffEasy = document.getElementById('btn-diff-easy');
    const btnDiffMedium = document.getElementById('btn-diff-medium');
    const btnDiffHard = document.getElementById('btn-diff-hard');
    const btnDiffMissingNotes = document.getElementById('btn-diff-missing-notes');
    const difficultyBackBtn = document.getElementById('difficulty-back-btn');

    // "Kayıtlı Oyundan Devam Et"
    if (btnContinueSaved) {
        btnContinueSaved.addEventListener('click', () => {
            if(window.wrongSound) window.wrongSound.play();
            if(window.announceToScreenReader) window.announceToScreenReader("Şu an devam edebileceğiniz kayıtlı bir oyununuz bulunmuyor.");
        });
    }

    // Mobil Enter Butonu
    if (mobileEnterBtn) {
        mobileEnterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
            });
            document.dispatchEvent(enterEvent);
        });
        mobileEnterBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            mobileEnterBtn.click();
        });
    }

    // Sunucu Mesajı Devam Et Butonu
    if (serverMessageContinueBtn) {
        serverMessageContinueBtn.addEventListener('click', () => {
            if (window.globalChangelogVersion) {
                localStorage.setItem('lastSeenChangelogVersion', window.globalChangelogVersion);
            }
            window.switchMenu(window.serverMessageMenu, window.mainMenu, 'main');
        });
    }

    // Stats
    if (statsBtnMain && statsBackBtn) {
        statsBtnMain.addEventListener('click', () => {
            if(window.updateStatsDisplay) window.updateStatsDisplay();
            window.switchMenu(window.mainMenu, window.statsMenu, 'stats');
        });
        statsBackBtn.addEventListener('click', () => {
            window.switchMenu(window.statsMenu, window.mainMenu, 'main');
        });
    }

    // Store
    if (storeBtnMain && storeBackBtn) {
        storeBtnMain.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.storeMenu, 'store');
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            if(window.announceToScreenReader) window.announceToScreenReader(`Mağazaya hoş geldiniz. Mevcut jetonunuz: ${totalTokens}`);
        });
        storeBackBtn.addEventListener('click', () => {
            window.switchMenu(window.storeMenu, window.mainMenu, 'main');
        });
    }

    if (buyShieldBtn) {
        buyShieldBtn.addEventListener('click', () => {
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            if (totalTokens >= 50) {
                totalTokens -= 50;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
                localStorage.setItem('hafizaGuvenHataKorumasi', hk + 1);
                if(window.buySound) window.buySound.play();
                if(window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! 1 Hata Koruması eklendi. Kalan jeton: ${totalTokens}`);
            } else {
                if(window.wrongSound) window.wrongSound.play();
                if(window.announceToScreenReader) window.announceToScreenReader(`Yetersiz jeton. 50 jeton gerekli, sizin ${totalTokens} jetonunuz var.`);
            }
        });
    }

    if (buyTimeShieldBtn) {
        buyTimeShieldBtn.addEventListener('click', () => {
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            if (totalTokens >= 30) {
                totalTokens -= 30;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
                localStorage.setItem('hafizaGuvenZamanKorumasi', zk + 1);
                if(window.buySound) window.buySound.play();
                if(window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! 1 Zaman Koruması eklendi. Kalan jeton: ${totalTokens}`);
            } else {
                if(window.wrongSound) window.wrongSound.play();
                if(window.announceToScreenReader) window.announceToScreenReader(`Yetersiz jeton. 30 jeton gerekli, sizin ${totalTokens} jetonunuz var.`);
            }
        });
    }

    // Achievements
    if (btnAchievementsMain && achievementsBackBtn) {
        btnAchievementsMain.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.achievementsMenu, 'achievements');
            let text = "Henüz açılmış bir başarınız yok.";
            if (window.userAchievements && window.userAchievements.hafizam_gucleniyor) text = "Hafızam Güçleniyor başarımını kazandınız!";
            if(window.announceToScreenReader) window.announceToScreenReader(text);
        });
        achievementsBackBtn.addEventListener('click', () => {
            window.switchMenu(window.achievementsMenu, window.mainMenu, 'main');
        });
    }

    // Feedback
    if (feedbackBtnMain && feedbackBackBtn) {
        feedbackBtnMain.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.feedbackMenu, 'feedback');
        });
        feedbackBackBtn.addEventListener('click', () => {
            window.switchMenu(window.feedbackMenu, window.mainMenu, 'main');
        });
    }
    
    if (feedbackSubmitBtn) {
        feedbackSubmitBtn.addEventListener('click', () => {
            const form = document.getElementById('feedback-form');
            if (form) {
                form.submit();
                if(window.announceToScreenReader) window.announceToScreenReader("Geri bildirim formunuz yönlendiriliyor.");
            }
        });
    }

    // Practice
    if (practiceBtnMain && practiceBackBtn) {
        practiceBtnMain.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.practiceMenu, 'practice');
            if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
            
            window.practiceTargetIndex = 0;
            window.practicePressCount = 0;
            window.inPracticeTutorial = false;
            window.isDialogPhase = true;
            window.currentDialogIndex = 0;

            const practiceNav = document.getElementById('practice-nav');
            if (practiceNav) practiceNav.style.display = 'none';

            const practiceMenuDOM = document.getElementById('practice-menu-container');
            if (practiceMenuDOM) practiceMenuDOM.dataset.isPracticeOver = "false";

            setTimeout(() => { if (window.playCurrentDialog) window.playCurrentDialog(); }, 350);
        });

        practiceBackBtn.addEventListener('click', () => {
            window.switchMenu(window.practiceMenu, window.mainMenu, 'main');
            window.inPracticeTutorial = false;
            if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
        });
    }

    // Ana Menüden Zorluk Seçimine Geçiş
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.difficultyMenu, 'difficulty');
            if(window.updateDifficultyMenuLocks) window.updateDifficultyMenuLocks();
        });
    }
    if (difficultyBackBtn) {
        difficultyBackBtn.addEventListener('click', () => {
            window.switchMenu(window.difficultyMenu, window.mainMenu, 'main');
        });
    }

    // Oyun Başlatma (Gerçekleşme)
    if (btnDiffEasy && gameBackBtn) {
        btnDiffEasy.addEventListener('click', () => {
            window.switchMenu(window.difficultyMenu, window.gameMenu, 'game');
            if(window.startMainGame) window.startMainGame('easy');
        });

        if (btnDiffMedium) {
            btnDiffMedium.addEventListener('click', () => {
                window.switchMenu(window.difficultyMenu, window.gameMenu, 'game');
                if(window.startMainGame) window.startMainGame('medium');
            });
        }

        if (btnDiffHard) {
            btnDiffHard.addEventListener('click', () => {
                window.switchMenu(window.difficultyMenu, window.gameMenu, 'game');
                if(window.startMainGame) window.startMainGame('hard');
            });
        }

        if (btnDiffMissingNotes) {
            btnDiffMissingNotes.addEventListener('click', () => {
                if (window.isMobileDevice) {
                    alert("Bu mod telefonlar için uyumlu olmadığından devre dışı bırakılmıştır.");
                    window.announceToScreenReader("Bu mod telefonlar için uyumlu olmadığından devre dışı bırakılmıştır.");
                    return;
                }
                window.switchMenu(window.difficultyMenu, window.storyMenu, 'story');

                if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
                if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
                if (window.doorCloseSound && window.doorCloseSound.playing()) window.doorCloseSound.stop();
                clearTimeout(window.stepIntervalId);

                if (window.house2Sound && !window.house2Sound.playing()) {
                    window.house2Sound.volume(0.8);
                    window.house2Sound.play();
                }

                window.inStoryMode = true;
                window.currentStoryIndex = 0;
                setTimeout(() => {
                    if(window.playCurrentStoryDialog) window.playCurrentStoryDialog();
                    if(window.triggerStoryAnimations) window.triggerStoryAnimations(0);
                }, 350);
            });
        }

        gameBackBtn.addEventListener('click', () => {
            if(window.endMainGame) window.endMainGame(false, false, true); 

            if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();
            if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
            if (window.doorCloseSound && window.doorCloseSound.playing()) window.doorCloseSound.stop();
            clearTimeout(window.stepIntervalId);
            if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.stop();
            if (window.bgMusic) window.bgMusic.play();
        });
        
        const mobileGameBackBtn = document.getElementById('mobile-game-back-btn');
        if (mobileGameBackBtn) {
            mobileGameBackBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                gameBackBtn.click();
            });
        }
    }
});

// Menü içi ok tuşlarıyla gezinme işlevi
document.addEventListener('keydown', function(event) {
    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        return;
    }

    if (window.isGridWalkingPhase && window.currentActiveMenu === 'story') {
        return;
    }

    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
        const activeButtons = window.getActiveButtons();
        if (activeButtons.length === 0) return;

        event.preventDefault();

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            window.currentFocusIndex = (window.currentFocusIndex + 1) % activeButtons.length;
            activeButtons[window.currentFocusIndex].focus();
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            window.currentFocusIndex = (window.currentFocusIndex - 1 + activeButtons.length) % activeButtons.length;
            activeButtons[window.currentFocusIndex].focus();
        }
    }
});

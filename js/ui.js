// ui.js - Kullanıcı Arayüzü, Mobil Tespit ve Ekran Okuyucu Fonksiyonları

// Mobil Cihaz Tespiti
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
window.isMobileDevice = isMobile;

// --- OTOMATİK GÜNCELLEME KONTROL SİSTEMİ ---
window.mevcutSurum = typeof UYGULAMA_SURUMU !== 'undefined' ? UYGULAMA_SURUMU : null;
window.globalChangelogVersion = null;
window.globalChangelogMessage = null;

window.guncellemeKontrolEt = function (isManual = false) {
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

                if (window.gameIsActive || window.inStoryMode || window.currentActiveMenu !== 'main') {
                    window.pendingUpdate = true; // Güncellemeyi sessizce beklemeye al
                    return; // Ekranı silme işlemini iptal et
                }

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
                    
                    setTimeout(() => {
                        alert(uyariMesaji);
                        refreshBtn.focus();
                    }, 50);
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

window.getActiveButtons = function () {
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

window.updateMobileKeysVisibility = function () {
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
    
    if (typeof window.updateMobileStoryKeys === 'function') {
        window.updateMobileStoryKeys(window.currentActiveMenu === 'story' && window.inStoryMode && window.isGridWalkingPhase);
    }
};

window.updateMobileStoryKeys = function(isStory) {
    const keys = document.querySelectorAll('.mobile-piano-key');
    if (keys.length < 7) return;

    if (isStory) {
        keys[0].setAttribute('data-key', 'c'); keys[0].textContent = 'Konum'; keys[0].setAttribute('aria-label', 'Konumu Sorgula');
        keys[1].setAttribute('data-key', 'ArrowLeft'); keys[1].textContent = '< Sol'; keys[1].setAttribute('aria-label', 'Sola Yürü');
        keys[2].setAttribute('data-key', 'ArrowRight'); keys[2].textContent = 'Sağ >'; keys[2].setAttribute('aria-label', 'Sağa Yürü');
        keys[3].setAttribute('data-key', 'f'); keys[3].textContent = 'F Bul'; keys[3].setAttribute('aria-label', 'Notayı Ara veya Al');
        keys[4].textContent = '---'; keys[4].setAttribute('aria-label', 'Devre Dışı');
        keys[5].textContent = '---'; keys[5].setAttribute('aria-label', 'Devre Dışı');
        keys[6].textContent = '---'; keys[6].setAttribute('aria-label', 'Devre Dışı');
    } else {
        keys[0].setAttribute('data-key', 'c'); keys[0].textContent = 'C'; keys[0].setAttribute('aria-label', 'C Notası');
        keys[1].setAttribute('data-key', 'd'); keys[1].textContent = 'D'; keys[1].setAttribute('aria-label', 'D Notası');
        keys[2].setAttribute('data-key', 'e'); keys[2].textContent = 'E'; keys[2].setAttribute('aria-label', 'E Notası');
        keys[3].setAttribute('data-key', 'f'); keys[3].textContent = 'F'; keys[3].setAttribute('aria-label', 'F Notası');
        keys[4].setAttribute('data-key', 'g'); keys[4].textContent = 'G'; keys[4].setAttribute('aria-label', 'G Notası');
        keys[5].setAttribute('data-key', 'a'); keys[5].textContent = 'A'; keys[5].setAttribute('aria-label', 'A Notası');
        keys[6].setAttribute('data-key', 'b'); keys[6].textContent = 'B'; keys[6].setAttribute('aria-label', 'B Notası');
    }
};

window.switchMenu = function (hideMenu, showMenu, newActiveMenuName) {
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

    if (newActiveMenuName === 'main' && window.pendingUpdate === true) {
        window.guncellemeKontrolEt(false); // Bekleyen güncellemeyi şimdi ekrana bas
    }
};

window.announceToScreenReader = function (text, forceFocus = true) {
    text = window.localizeText(text);

    if (!forceFocus || window.isMobilePianokeyPressed) {
        // Odaklanma gerektirmeyen CANLI YAYIN anonsları (Mobil ve PC için en kararlı yöntem DOM'da hazır bulunan elementtir)
        // index.html'de sabit olarak koyduğumuz sr-chat-reader'ı kullanıyoruz
        let liveAnnouncer = document.getElementById('sr-chat-reader');
        if (liveAnnouncer) {
            liveAnnouncer.innerHTML = '';
            let msgNode = document.createElement('div');
            msgNode.textContent = text;
            liveAnnouncer.appendChild(msgNode);
            setTimeout(() => {
                if (msgNode.parentNode) {
                    msgNode.remove();
                }
            }, 10000);
        }
    } else {
        // PC'de doğrudan Odaklanarak okutma (Eski kararlı yöntem)
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
        announcerDiv.innerText = text; 
        
        // Elementi DOM'a ekle ve NVDA PC'nin atlamaması için senkron olarak anında focusla
        document.body.appendChild(announcerDiv);
        announcerDiv.focus();
        
        setTimeout(() => {
             if (announcerDiv.parentNode) announcerDiv.remove();
        }, 15000);
    }
};

window.updateButtonUI = function (btnElement, modeData, unlockedLabel, lockReason) {
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

window.updateScoreboardLocks = function () {
    if (!window.gameModes) return;
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

window.updateDifficultyMenuLocks = function () {
    if (!window.gameModes) return;

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
    // --- Erişilebilirlik (ARIA) Dinamik Enjektörü ("Düğmelerin Soğukluğu" Düzeltmesi) ---
    const navs = document.querySelectorAll('.menu-nav');
    navs.forEach(nav => {
        const ul = nav.querySelector('ul');
        if (ul) {
            ul.setAttribute('role', 'menu');
            const lis = ul.querySelectorAll('li');
            lis.forEach(li => li.setAttribute('role', 'none'));
        }
    });

    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach(btn => {
        btn.setAttribute('role', 'menuitem');
    });

    const containers = document.querySelectorAll('.menu-container');
    containers.forEach(container => {
        if (container.getAttribute('role') === 'presentation') {
            container.setAttribute('role', 'region');
        }
    });

    // Hover Effects
    window.allMenuButtons.forEach((button) => {
        const playHover = () => {
            if (window.ensureAudioUnlock) window.ensureAudioUnlock();
            if (window.currentActiveMenu !== 'none' && window.hoverSound) {
                window.hoverSound.play();
            }
        };

        button.addEventListener('mouseenter', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if (window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        });
        button.addEventListener('focus', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if (window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        });
        button.addEventListener('pointerdown', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if (window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        });
        button.addEventListener('touchstart', () => {
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                window.currentFocusIndex = index;
                if (window.updatePan) window.updatePan(window.currentFocusIndex, activeButtons.length);
            }
            playHover();
        }, { passive: true });

        button.addEventListener('click', (event) => {
            if (window.ensureAudioUnlock) window.ensureAudioUnlock();
            if (button.getAttribute('aria-disabled') === 'true') {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            const activeButtons = window.getActiveButtons();
            const index = activeButtons.indexOf(button);
            if (index !== -1) {
                if (window.updatePan) window.updatePan(index, activeButtons.length);
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
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Şu an devam edebileceğiniz kayıtlı bir oyununuz bulunmuyor.");
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
            if (window.updateStatsDisplay) window.updateStatsDisplay();
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
            if (window.announceToScreenReader) window.announceToScreenReader(`Mağazaya hoş geldiniz. Mevcut jetonunuz: ${totalTokens}`);
        });
        storeBackBtn.addEventListener('click', () => {
            window.switchMenu(window.storeMenu, window.mainMenu, 'main');
        });
    }

    if (buyShieldBtn) {
        buyShieldBtn.addEventListener('click', () => {
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;

            if (hk > 0) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = "Bu korumaya zaten sahipsiniz. Aynı anda sadece bir tane taşıyabilirsiniz.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            if (totalTokens < 50) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = "Yetersiz bakiye. Bu eşya için 50 jetona ihtiyacınız var.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            totalTokens -= 50;
            localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
            localStorage.setItem('hafizaGuvenHataKorumasi', 1);
            if (window.buySound) window.buySound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! 1 Hata Koruması eklendi. Kalan jeton: ${totalTokens}`);
        });
    }

    if (buyTimeShieldBtn) {
        buyTimeShieldBtn.addEventListener('click', () => {
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;

            if (zk > 0) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = "Bu korumaya zaten sahipsiniz. Aynı anda sadece bir tane taşıyabilirsiniz.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            if (totalTokens < 30) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = "Yetersiz bakiye. Bu eşya için 30 jetona ihtiyacınız var.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            totalTokens -= 30;
            localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
            localStorage.setItem('hafizaGuvenZamanKorumasi', 1);
            if (window.buySound) window.buySound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! 1 Zaman Koruması eklendi. Kalan jeton: ${totalTokens}`);
        });
    }

    // Achievements
    if (btnAchievementsMain && achievementsBackBtn) {
        btnAchievementsMain.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.achievementsMenu, 'achievements');
            let text = "Henüz açılmış bir başarınız yok.";
            if (window.userAchievements && window.userAchievements.hafizam_gucleniyor) text = "Hafızam Güçleniyor başarımını kazandınız!";
            if (window.announceToScreenReader) window.announceToScreenReader(text);
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
                if (window.announceToScreenReader) window.announceToScreenReader("Geri bildirim formunuz yönlendiriliyor.");
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
            if (window.practiceNextTimeout) {
                clearTimeout(window.practiceNextTimeout); // Arkada bekleyen komutu yok et
            }
            window.inPracticeTutorial = false; // Eğitim durumunu güvenle kapat
            window.isDialogPhase = false; // Diyalogları sıfırla

            window.switchMenu(window.practiceMenu, window.mainMenu, 'main');
            if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
        });
    }

    // Ana Menüden Zorluk Seçimine Geçiş
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.difficultyMenu, 'difficulty');
            if (window.updateDifficultyMenuLocks) window.updateDifficultyMenuLocks();
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
            if (window.startMainGame) window.startMainGame('easy');
        });

        if (btnDiffMedium) {
            btnDiffMedium.addEventListener('click', () => {
                if (!window.gameModes.medium.isUnlocked) return;
                window.switchMenu(window.difficultyMenu, window.gameMenu, 'game');
                if (window.startMainGame) window.startMainGame('medium');
            });
        }

        if (btnDiffHard) {
            btnDiffHard.addEventListener('click', () => {
                if (!window.gameModes.hard.isUnlocked) return;
                window.switchMenu(window.difficultyMenu, window.gameMenu, 'game');
                if (window.startMainGame) window.startMainGame('hard');
            });
        }

        if (btnDiffMissingNotes) {
            btnDiffMissingNotes.addEventListener('click', () => {
                if (!window.gameModes.missing_notes.isUnlocked) return;
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
                window.storyEntryTimeout = setTimeout(() => {
                    if (window.playCurrentStoryDialog) window.playCurrentStoryDialog();
                    if (window.triggerStoryAnimations) window.triggerStoryAnimations(0);
                }, 350);
            });
        }

        gameBackBtn.addEventListener('click', () => {
            if (window.endMainGame) window.endMainGame(false, false, true);

            clearInterval(window.storyAnimInterval1);
            clearInterval(window.storyAnimInterval2);
            clearInterval(window.storyAnimInterval3);
            clearTimeout(window.storyAnimTimeout1);
            clearTimeout(window.storyAnimTimeout2);
            clearTimeout(window.storyAnimTimeout3);
            clearTimeout(window.storyAnimTimeout4);
            clearTimeout(window.storyAnimTimeout5);
            clearTimeout(window.stepIntervalId);
            clearTimeout(window.storyEntryTimeout);
            if (window.storyWinTimeout) {
                clearTimeout(window.storyWinTimeout);
            }

            if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
            if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();
            if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
            if (window.enterHouseSound && window.enterHouseSound.playing()) window.enterHouseSound.stop();
            if (window.doorCloseSound && window.doorCloseSound.playing()) window.doorCloseSound.stop();
            
            if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.stop();
            if (window.bgMusic) window.bgMusic.play();
        });

        const mobileGameBackBtn = document.getElementById('mobile-game-back-btn');
        if (mobileGameBackBtn) {
            mobileGameBackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.currentActiveMenu === 'game') {
                    if (typeof gameBackBtn !== 'undefined' && gameBackBtn) gameBackBtn.click();
                } else if (window.currentActiveMenu === 'practice') {
                    const pBtn = document.getElementById('practice-back-btn');
                    if (pBtn) pBtn.click();
                } else if (window.currentActiveMenu === 'story') {
                    if (window.clickSound) window.clickSound.play();
                    window.isGridWalkingPhase = false;
                    window.inStoryMode = false;
                    window.gameIsActive = false;
                    window.isStarted = false;

                    clearInterval(window.storyAnimInterval1);
                    clearInterval(window.storyAnimInterval2);
                    clearInterval(window.storyAnimInterval3);
                    clearTimeout(window.storyAnimTimeout1);
                    clearTimeout(window.storyAnimTimeout2);
                    clearTimeout(window.storyAnimTimeout3);
                    clearTimeout(window.storyAnimTimeout4);
                    clearTimeout(window.storyAnimTimeout5);
                    clearTimeout(window.stepIntervalId);
                    clearTimeout(window.storyEntryTimeout);
                    if (window.storyWinTimeout) {
                        clearTimeout(window.storyWinTimeout);
                    }

                    if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
                    if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();
                    if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
                    if (window.enterHouseSound && window.enterHouseSound.playing()) window.enterHouseSound.stop();
                    if (window.doorCloseSound && window.doorCloseSound.playing()) window.doorCloseSound.stop();
                    
                    if (window.switchMenu && window.storyMenu && window.mainMenu) {
                        window.switchMenu(window.storyMenu, window.mainMenu, 'main');
                    }
                    if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
                }
            });
        }
    }
});

// Menü içi ok tuşlarıyla gezinme işlevi
document.addEventListener('keydown', function (event) {
    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        return;
    }

    if (window.isGridWalkingPhase && window.currentActiveMenu === 'story') {
        return;
    }

    // Sohbet penceresi açıkken ana menü yön tuşları gezinimini devre dışı bırak
    if (window.isChatOpen) {
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

// --- CANLI SOHBET SİSTEMİ ARAYÜZ MANTIĞI ---
window.isChatOpen = false;

document.addEventListener('DOMContentLoaded', () => {
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatPanel = document.getElementById('chat-panel');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatNicknameInput = document.getElementById('chat-nickname');

    if (chatToggleBtn) {
        chatToggleBtn.style.display = 'block';
        chatToggleBtn.addEventListener('click', () => window.toggleChat());
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => window.toggleChat());
    }

    window.toggleChat = function() {
        if (!chatPanel) return;

        window.isChatOpen = !window.isChatOpen;

        if (window.isChatOpen) {
            chatPanel.style.display = 'flex';
            chatPanel.removeAttribute('aria-hidden');
            const chatMessageInputLocal = document.getElementById('chat-message-input');
            if (chatNicknameInput && chatNicknameInput.style.display !== 'none') {
                setTimeout(() => chatNicknameInput.focus(), 100);
            } else if (chatMessageInputLocal) {
                setTimeout(() => chatMessageInputLocal.focus(), 100);
            }
            // Sohbet açıldığında geçmiş mesajların görünmesi için en alta kaydır
            const chatMessagesContainer = document.querySelector('.chat-messages-container');
            if (chatMessagesContainer) {
                setTimeout(() => {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                }, 50);
            }
            if (window.announceToScreenReader) {
                if (chatNicknameInput && chatNicknameInput.style.display === 'none') {
                    window.announceToScreenReader('Canlı sohbet açıldı. Mesajınızı yazabilirsiniz.', false);
                } else {
                    window.announceToScreenReader('Canlı sohbet açıldı. Takma adınızı girin.', false);
                }
            }

            // Presence Aşama 2: İlk Katılım ve Çıkış Kancası
            if (window.hasJoinedChat === false && window.db) {
                window.hasJoinedChat = true;
                
                // İlk katılım mesajı
                window.db.ref('messages').push({
                    nickname: "Sistem",
                    text: `👋 ${window.currentChatUser} sohbete katıldı.`,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });

                // Başlangıç Çıkış Kancası
                window.disconnectRef = window.db.ref('messages').push();
                window.disconnectRef.onDisconnect().set({
                    nickname: "Sistem",
                    text: `🚶 ${window.currentChatUser} çevrimdışı oldu.`,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
            }
        } else {
            chatPanel.style.display = 'none';
            chatPanel.setAttribute('aria-hidden', 'true');
            if (chatToggleBtn) {
                setTimeout(() => chatToggleBtn.focus(), 100);
            }
            if (window.announceToScreenReader) window.announceToScreenReader('Canlı sohbet kapatıldı.', false);
        }
    };

    // Nokta (.) kısayolu, ESC tuşu ve Ok Tuşlarıyla Gezinme
    document.addEventListener('keydown', (e) => {
        // Nokta (.) tuşuyla sohbeti SADECE aç
        if (e.key === '.' && !window.isChatOpen && (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT'))) {
            window.toggleChat();
        }
        
        // ESC tuşuyla sohbeti hızlıca kapat
        if (e.key === 'Escape' && window.isChatOpen) {
            window.toggleChat();
        }
        
        // Sohbet mesajlarında Yukarı/Aşağı ok tuşu ile gezinme
        if (window.isChatOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            const chatMessages = document.querySelectorAll('#chat-messages li[tabindex="0"]');
            if (chatMessages.length > 0) {
                let currentIndex = Array.from(chatMessages).indexOf(document.activeElement);
                
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (currentIndex > 0) {
                        chatMessages[currentIndex - 1].focus();
                    } else if (currentIndex === -1) {
                        chatMessages[chatMessages.length - 1].focus();
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (currentIndex !== -1 && currentIndex < chatMessages.length - 1) {
                        chatMessages[currentIndex + 1].focus();
                    } else if (currentIndex !== -1 && currentIndex === chatMessages.length - 1) {
                        const chatInput = document.getElementById('chat-message-input');
                        if (chatInput) chatInput.focus();
                    } else if (currentIndex === -1) {
                        chatMessages[0].focus();
                    }
                }
            }
        }
    });

    // Mobil: İki Parmakla Çift Dokunma (2-Finger Double Tap) Jest Algılayıcısı
    let lastTwoFingerTap = 0;
    document.addEventListener('touchstart', (e) => {
        // Eğer focus input/textarea/select üzerindeyse yoksay (yazışmayı bölmesin)
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
            return;
        }

        // Tam olarak 2 parmak ekrandaysa
        if (e.touches.length === 2) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTwoFingerTap;
            
            // Eğer önce iki parmak dokunup hemen ardından tekrar 2 parmak dokunduysa (Çift Dokunuş)
            // Süre aralığı 400ms'den kısa olmalı (mobil cihazlardaki tipik çift tıklama hızı)
            if (tapLength < 450 && tapLength > 0) {
                if (typeof window.toggleChat === 'function') {
                    window.toggleChat();
                    // Ekran okuyuculardan veya Safari'den varsayılan olay sızmasını engellemek
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
            }
            lastTwoFingerTap = currentTime;
        }
    }, { passive: false });
});

// --- CANLI SOHBET SİSTEMİ VERİTABANI (FİREBASE) MANTIĞI ---
document.addEventListener('DOMContentLoaded', () => {
    const chatNicknameInput = document.getElementById('chat-nickname');
    const chatMessageInput = document.getElementById('chat-message-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessagesList = document.getElementById('chat-messages');
    const chatMessagesContainer = document.querySelector('.chat-messages-container');
    
    // Presence (Durum) Değişkenleri (Global olarak ayarlandı)
    const savedNickname = localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname');
    window.currentChatUser = savedNickname ? savedNickname : "Misafir";
    window.hasJoinedChat = false;

    // Firebase tanımlı değilse veya arayüz yoksa dur
    if (!chatSendBtn || !chatMessagesList || !window.db) return;

    // Oturumda veya kalıcı hafızada daha önce kaydedilmiş bir Takma Ad varsa onu otomatik yükle ve kutuyu gizle
    if (savedNickname) {
        chatNicknameInput.value = savedNickname;
        chatNicknameInput.style.display = 'none'; // Kullanıcı adı bir kere girildikten sonra sekme kapanana kadar veya kalıcı olarak gizlenir
    }

    // Takma ad kutusundayken de Enter'a basılırsa mesaj gönderilsin
    if (chatNicknameInput) {
        chatNicknameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Güvenlik (XSS) Koruması (HTML etiketlerini etkisiz hale getir)
    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Mesaj Gönderme İşlevi
    function sendMessage() {
        let nickInput = document.getElementById('chat-nickname');
        let msgInput = document.getElementById('chat-message-input');

        // Boşlukları tıraşla
        let nickVal = nickInput ? nickInput.value.trim() : "";
        let msgVal = msgInput ? msgInput.value.trim() : "";

        if (nickVal === "" || msgVal === "") {
            // Mesaj veya isim tamamen boşluktan ibaretse veya boşsa
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "Lütfen geçerli bir takma ad ve mesaj girin. Boş mesaj gönderilemez.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            
            // İmleci eksik olan yere odakla
            if (nickVal === "" && nickInput) nickInput.focus();
            else if (msgInput) msgInput.focus();
            
            return; // Gönderimi iptal et ve sistemi koru!
        }

        const nickname = nickVal;
        const text = msgVal;

        // Spam Kalkanı: 2 Saniye Bekleme Süresi
        let now = Date.now();
        window.lastMessageTime = window.lastMessageTime || 0;

        if (now - window.lastMessageTime < 2000) {
            if (window.wrongSound) window.wrongSound.play();
            let spamUyari = "Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.";
            if (window.announceToScreenReader) window.announceToScreenReader(spamUyari);
            return; // Gönderimi iptal et ve sistemi koru!
        }

        // Süre kuralına uyulduysa yeni zamanı kaydet ve işleme devam et
        window.lastMessageTime = now;

        if (nickname.toLowerCase() === 'sistem') {
            if (window.announceToScreenReader) window.announceToScreenReader('Bu takma adı kullanamazsınız.', false);
            chatNicknameInput.focus();
            return;
        }

        if (text === '') {
            if (window.announceToScreenReader) window.announceToScreenReader('Lütfen bir mesaj yazın.', false);
            chatMessageInput.focus();
            return;
        }

        if (nickname !== '' && text !== '') {
            const messageData = {
                nickname: nickname,
                text: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // Presence Aşama 2: İsim Güncelleme ve Kanca Yenileme
            if (nickname !== window.currentChatUser && nickname !== "Sistem") {
                window.currentChatUser = nickname;
                if (window.disconnectRef) {
                    window.disconnectRef.onDisconnect().cancel();
                    window.disconnectRef = window.db.ref('messages').push();
                    window.disconnectRef.onDisconnect().set({
                        nickname: "Sistem",
                        text: "🚶 " + window.currentChatUser + " çevrimdışı oldu.",
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    });
                }
            }

            window.db.ref('messages').push(messageData).then(() => {
                // Başarılı gönderim sonrası Takma Adı oturuma VE KALICI DEPOLAMAYA kaydet
                localStorage.setItem('chatUsername', nickname);
                sessionStorage.setItem('chatNickname', nickname);
                chatNicknameInput.style.display = 'none';
                
                chatMessageInput.value = ''; // Mesaj formunu temizle
                
                // Oyuna hızlıca devam edilebilmesi için sohbet penceresini otomatik kapat
                if (window.isChatOpen && typeof window.toggleChat === 'function') {
                    window.toggleChat();
                }

                // Mesajın başarıyla gönderildiğini bildir (pencere kapanma anonsu ile karışmaması için 100ms gecikme)
                setTimeout(() => {
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader('Mesaj gönderildi.', false);
                    }
                }, 100);
            }).catch(error => {
                console.error("Mesaj gönderilirken hata oluştu:", error);
                
                // Hata durumunda uyar
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Hata: Mesaj gönderilemedi. Lütfen bağlantınızı kontrol edin.', false);
                }
                alert('Hata: Mesaj gönderilemedi. Lütfen bağlantınızı kontrol edin.');
            });
        }
    }

    // Gönder butonuna tıklandığında
    chatSendBtn.addEventListener('click', sendMessage);

    // Mesaj kutusundayken Enter'a basıldığında
    chatMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // Mesajları Dinleme İşlevi (Sadece son 50 mesaj)
    // Firebase push() anahtarları zaten kronolojik olduğu için orderByChild'a gerek yoktur, bu sayede Index hatası vermez ve geçmişi kesin yükler.
    const messagesRef = window.db.ref('messages').limitToLast(50);
    const chatLoadTime = Date.now();
    
    // Veritabanı boşsa "Hiç mesaj yok" uyarısı ekleme
    messagesRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const li = document.createElement('li');
            li.id = 'empty-chat-warning';
            li.classList.add('system-message');
            const srText = `<span style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);">Sistem mesajı: Bu sohbet kutusunda hiç mesaj yok. İlk mesajınızı göndermek için güzel bir zaman.</span>`;
            li.innerHTML = `${srText}<div class="wp-bubble" aria-hidden="true" style="opacity: 0.8;">Bu sohbet kutusunda hiç mesaj yok.<br>İlk mesajınızı göndermek için güzel bir zaman. 👋</div>`;
            chatMessagesList.appendChild(li);
        }
    });

    messagesRef.on('child_added', (snapshot) => {
        // Eğer boş sohbet uyarısı ekranda duruyorsa, ilk mesaj geldiğinde onu sil!
        const emptyWarning = document.getElementById('empty-chat-warning');
        if (emptyWarning) {
            emptyWarning.remove();
        }

        const data = snapshot.val();
        
        let timeString = "";
        let timeRaw = "";
        let ts = data.timestamp;
        
        // Yerel itme anında (Optimistic Render) TIMESTAMP obje veya hatalı olabilir, bu durumda geçici yerel cihaz saati kullanılır
        if (typeof ts !== 'number') {
            ts = Date.now();
        }
        
        if (ts) {
            const dateObj = new Date(ts);
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            timeRaw = `${hours}:${minutes}`;
            timeString = `<span class="wp-time">${timeRaw}</span>`;
        }

        const li = document.createElement('li');
        li.setAttribute('tabindex', '0');
        
        if (data.nickname === "Sistem") {
            li.classList.add('system-message');
            li.setAttribute('aria-label', `Sistem mesajı: ${escapeHTML(data.text)}`);
            li.innerHTML = `<div class="wp-bubble" aria-hidden="true">${escapeHTML(data.text)}</div>`;
        } else {
            // Benim gönderdiğim mesaj mı yoksa başkasının mı?
            const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
            li.classList.add(isMe ? 'message-out' : 'message-in');
            
            li.setAttribute('aria-label', `[${timeRaw}] ${escapeHTML(data.nickname)}: ${escapeHTML(data.text)}`);
            
            // Whatsapp Görsel Balonu
            li.innerHTML = `
                <div class="wp-bubble" aria-hidden="true">
                    ${!isMe ? `<div class="wp-sender">${escapeHTML(data.nickname)}</div>` : ''}
                    <div class="wp-text">${escapeHTML(data.text)}</div>
                    ${timeString}
                </div>
            `;
        }

        chatMessagesList.appendChild(li);

        // Yeni mesaj gelince otomatik olarak en alta kaydır
        if (chatMessagesContainer && window.isChatOpen) {
            // Sadece sohbet açıksa kaydır, değilse açıldığında zaten aşağıda kalması için toggleChat içine eklenecek
            setTimeout(() => {
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }, 10);
        }

        // --- NVDA için Yeni Mesajları Doğrudan Anons Etme ---
        const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
        let messageToRead = "";
        let isNewIncomingMessage = false;

        if (data.nickname === "Sistem") {
            messageToRead = `Sistem mesajı: ${data.text}`;
        } else {
            // GönderenKişi: Mesaj metni formatı istendiği gibi eklendi
            messageToRead = `${data.nickname}: ${data.text}`;
            if (!isMe) {
                isNewIncomingMessage = true;
            }
        }
        
        // Sadece sayfa açılışındaki geçmiş mesaj yığınını atlamak için zamanı kontrol ediyoruz
        if (Date.now() - chatLoadTime > 2000) {
            // Başkasından gelen mesaj ise ses çal
            if (isNewIncomingMessage && window.chatReceiveSound) {
                window.chatReceiveSound.play();
            }
            
            // "Boş" (empty) bug'ını ve PC NVDA sessizliğini uyumlu şekilde bitirmek için announceToScreenReader'ı kullanıyoruz
            if (window.announceToScreenReader) {
                window.announceToScreenReader(messageToRead, false); // forceFocus = false
            }
        }
    });

    // Sohbet penceresi açıldığında geçmiş mesajların en altına kaydırmayı garantiye almak için Observer ekleyelim
    // Veya toggleChat butonuna basıldığında scrollTop tetiklenebilir.
});

// ui.js - Kullanıcı Arayüzü, Mobil Tespit ve Ekran Okuyucu Fonksiyonları

// Mobil Cihaz Tespiti
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
window.isMobileDevice = isMobile;

// --- OTOMATİK GÜNCELLEME KONTROL SİSTEMİ ---
window.mevcutSurum = window.UYGULAMA_SURUMU || (typeof UYGULAMA_SURUMU !== 'undefined' ? UYGULAMA_SURUMU : null);
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
                const uyariMesaji = "Oyuna zorunlu bir güncelleme geldi! Eski sürümle oynamaya devam edemezsiniz. Lütfen Tamam'a basarak sayfayı yenileyin.";

                if (window.gameIsActive || window.inStoryMode || window.currentActiveMenu !== 'main') {
                    window.pendingUpdate = true; // Güncellemeyi sessizce beklemeye al
                    return; // Ekranı silme işlemini iptal et
                }

                let p = document.getElementById('update-text');
                if (p) p.innerText = "Yeni bir sürüm mevcut. Geçerli sürüm: " + window.mevcutSurum + ". Yeni sürüm: " + data.version + ". Yüklemek için enter tuşuna veya yükle butonuna basın.";

                window.mevcutSurum = data.version;

                window.gameIsActive = false;
                if (typeof Howler !== 'undefined') Howler.stop();
                if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.stop();

                const updateSound = new window.Audio('sounds/update.ogg');
                updateSound.play();

                if (window.updateMenu) {
                    window.switchMenu(window.mainMenu, window.updateMenu, 'update');
                } else {
                    alert(uyariMesaji);
                    window.location.href = window.location.pathname + "?v=" + new Date().getTime();
                }
            } else {
                if (isManual && typeof window.announceToScreenReader === 'function') {
                    window.announceToScreenReader(currentMsg);
                }
            }
        })
        .catch(err => {
            const visualVersion = document.getElementById("intro-version-display");
            if (visualVersion && !visualVersion.textContent.includes("Çevrimdışı")) {
                visualVersion.textContent = "Sürüm: " + (window.mevcutSurum || "Bilinmiyor") + " (Çevrimdışı)";
            }
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
window.updateMenu = document.getElementById('update-menu-container');
window.achievementsMenu = document.getElementById('achievements-menu-container');
window.gameMenu = document.getElementById('game-menu-container');
window.storyMenu = document.getElementById('story-menu-container');
window.profileMenu = document.getElementById('profile-menu-container');
window.socialMenu = document.getElementById('social-menu-container');
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
    else if (window.currentActiveMenu === 'profile') buttons = Array.from(window.profileMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'social') buttons = Array.from(document.getElementById('social-player-list').querySelectorAll('li[tabindex="0"]'));
    else if (window.currentActiveMenu === 'social-action') buttons = Array.from(document.getElementById('social-action-modal') ? document.getElementById('social-action-modal').querySelectorAll('.menu-button') : []);
    else if (window.currentActiveMenu === 'play-mode') buttons = Array.from(document.getElementById('play-mode-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'multiplayer-select') buttons = Array.from(document.getElementById('multiplayer-select-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'pvp-rooms') buttons = Array.from(document.getElementById('pvp-rooms-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'pvp-create') buttons = Array.from(document.getElementById('pvp-create-menu-container').querySelectorAll('.menu-button, input, select'));
    else if (window.currentActiveMenu === 'update') buttons = Array.from(window.updateMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'settings') buttons = Array.from(document.getElementById('settings-menu-container').querySelectorAll('.menu-button, input[type="range"], select'));

    return buttons.filter(btn => {
        const li = btn.closest('li');
        if (li && li.style.display === 'none') return false;
        return true;
    });
};

window.updateMobileKeysVisibility = function () {
    const mobilePiano = document.getElementById('mobile-piano-container');
    const mobileEnter = document.getElementById('mobile-enter-container');
    const mobileReplay = document.getElementById('mobile-replay-btn');
    const desktopExitLi = document.querySelector('.desktop-exit-li');

    document.body.classList.remove('show-mobile-keys', 'show-mobile-enter', 'show-bottom-nav');

    if (['main', 'profile', 'social'].includes(window.currentActiveMenu)) {
        document.body.classList.add('show-bottom-nav');
    }

    if (mobilePiano) mobilePiano.setAttribute('aria-hidden', 'true');
    if (mobileEnter) {
        mobileEnter.setAttribute('aria-hidden', 'true');
        mobileEnter.style.display = '';
    }
    if (desktopExitLi) desktopExitLi.style.cssText = '';

    if (window.currentActiveMenu === 'game') {
        if (typeof window.gameIsActive !== 'undefined' && !window.gameIsActive && window.sessionTokens !== undefined) {
            // OYUN BITTI EKRANI (Game Over)
            // Sadece Oyunu Bitir butonu görünmeli
            if (mobileEnter) mobileEnter.style.display = 'none';
            if (mobileReplay) mobileReplay.style.display = 'none';
            if (desktopExitLi) {
                desktopExitLi.style.display = 'block';
                desktopExitLi.style.margin = '0 auto';
                desktopExitLi.style.textAlign = 'center';
            }
        } else if (typeof window.gameIsActive !== 'undefined' && !window.gameIsActive) {
            // OYUN BASLAMADAN ONCEKI 3 SANIYE GERI SAYIMI
            if (desktopExitLi) desktopExitLi.style.display = 'none';
        } else {
            // OYUN AKTIF
            document.body.classList.add('show-mobile-keys');
            if (mobilePiano) mobilePiano.removeAttribute('aria-hidden');
            if (desktopExitLi) desktopExitLi.style.display = 'none';
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
        keys[0].setAttribute('data-key', 'c'); keys[0].textContent = 'Konum'; keys[0].setAttribute('aria-label', 'Konumu Sorgula'); keys[0].disabled = false;
        keys[1].setAttribute('data-key', 'ArrowLeft'); keys[1].textContent = '< Sol'; keys[1].setAttribute('aria-label', 'Sola Yürü'); keys[1].disabled = false;
        keys[2].setAttribute('data-key', 'ArrowRight'); keys[2].textContent = 'Sağ >'; keys[2].setAttribute('aria-label', 'Sağa Yürü'); keys[2].disabled = false;
        keys[3].setAttribute('data-key', 'f'); keys[3].textContent = 'F Bul'; keys[3].setAttribute('aria-label', 'Notayı Ara veya Al'); keys[3].disabled = false;
        keys[4].setAttribute('data-key', 'Enter'); keys[4].textContent = 'Onay'; keys[4].setAttribute('aria-label', 'Onay'); keys[4].disabled = false;
        keys[5].textContent = '---'; keys[5].setAttribute('aria-label', 'Devre Dışı'); keys[5].disabled = true;
        keys[6].textContent = '---'; keys[6].setAttribute('aria-label', 'Devre Dışı'); keys[6].disabled = true;
    } else {
        keys[0].setAttribute('data-key', 'c'); keys[0].textContent = 'C'; keys[0].setAttribute('aria-label', 'C Notası'); keys[0].disabled = false;
        keys[1].setAttribute('data-key', 'd'); keys[1].textContent = 'D'; keys[1].setAttribute('aria-label', 'D Notası'); keys[1].disabled = false;
        keys[2].setAttribute('data-key', 'e'); keys[2].textContent = 'E'; keys[2].setAttribute('aria-label', 'E Notası'); keys[2].disabled = false;
        keys[3].setAttribute('data-key', 'f'); keys[3].textContent = 'F'; keys[3].setAttribute('aria-label', 'F Notası'); keys[3].disabled = false;
        keys[4].setAttribute('data-key', 'g'); keys[4].textContent = 'G'; keys[4].setAttribute('aria-label', 'G Notası'); keys[4].disabled = false;
        keys[5].setAttribute('data-key', 'a'); keys[5].textContent = 'A'; keys[5].setAttribute('aria-label', 'A Notası'); keys[5].disabled = false;
        keys[6].setAttribute('data-key', 'b'); keys[6].textContent = 'B'; keys[6].setAttribute('aria-label', 'B Notası'); keys[6].disabled = false;
    }
};

window.lastFocusedElement = null;
window.isMenuTransitioning = false;

window.switchMenu = function (hideMenu, showMenu, newActiveMenuName) {
    if (window.isMenuTransitioning) return;
    if (!hideMenu || !showMenu) return;

    window.isMenuTransitioning = true;

    // Mobil Geri Tuşu Koruması (Yeni bir alt menüye geçiliyorsa History'e ekle)
    if (newActiveMenuName !== 'main' && newActiveMenuName !== 'game' && newActiveMenuName !== 'story') {
        history.pushState({ modalOpen: true }, "");
    }

    if (window.menuFocusTimeoutId) {
        clearTimeout(window.menuFocusTimeoutId);
    }

    if (window.currentActiveMenu === 'main' && newActiveMenuName !== 'main') {
        window.lastFocusedElement = document.activeElement;
    }

    // ARAYÜZ VE EKRAN OKUYUCU (NVDA) ÇAKIŞMA ENGELLEYİCİSİ:
    // Animasyon (300ms) süresince NVDA'nın her iki menüyü de okumasını (Ghosting) engellemek için anında gizleriz.
    hideMenu.setAttribute('aria-hidden', 'true');
    
    let oldFocusables = hideMenu.querySelectorAll('button, [tabindex="0"], input, textarea');
    oldFocusables.forEach(el => el.setAttribute('tabindex', '-1'));

    hideMenu.style.opacity = '0';

    setTimeout(() => {
        hideMenu.style.display = 'none';
        
        // Sonradan menüye dönüldüğünde butonlar çalışsın diye geçici tabindex engelini kaldırıyoruz
        oldFocusables.forEach(el => el.removeAttribute('tabindex'));

        showMenu.style.display = 'flex';
        showMenu.removeAttribute('aria-hidden');

        setTimeout(() => {
            showMenu.style.opacity = '1';
            window.currentActiveMenu = newActiveMenuName;
            window.updateMobileKeysVisibility();
            window.currentFocusIndex = 0;
            
            // Doğrudan ilk öğeye odaklan, boşluğa veya H1'e düşmeksizin
            window.menuFocusTimeoutId = setTimeout(() => {
                if (newActiveMenuName === 'main' && window.lastFocusedElement && document.body.contains(window.lastFocusedElement)) {
                    window.lastFocusedElement.focus();
                    window.lastFocusedElement = null;
                } else {
                    let focusables = Array.from(showMenu.querySelectorAll('.menu-button, button, [tabindex="0"], input, select, textarea'));
                    let firstFocusable = focusables.find(el => el.getAttribute('aria-label') !== 'Menü sonu, başa dönülüyor' && el.tagName !== 'H1');
                    if (firstFocusable) {
                        firstFocusable.focus();
                    }
                }
                window.isMenuTransitioning = false;

                // BUG FIX: Bekleyen Güncelleme varsa, ekran geçişleri bittikten SONRA (çarpışma riski olmadan) göster
                if (newActiveMenuName === 'main' && window.pendingUpdate === true) {
                    window.pendingUpdate = false;
                    window.guncellemeKontrolEt(false);
                }
            }, 50);
        }, 50);
    }, 300);
};

window.announceToScreenReader = function (text, forceFocus = false) {
    text = window.localizeText(text);

    if (!forceFocus || window.isMobilePianokeyPressed) {
        // Odaklanma gerektirmeyen CANLI YAYIN anonsları (Mobil ve PC için en kararlı yöntem DOM'da hazır bulunan elementtir)
        // index.html'de sabit olarak koyduğumuz sr-chat-reader'ı kullanıyoruz
        let liveAnnouncer = document.getElementById('sr-chat-reader');
        if (liveAnnouncer) {
            // Hafızadaki eski silme zamanlayıcılarını bul ve yok et
            if (window.announcerTimeouts) {
                window.announcerTimeouts.forEach(t => clearTimeout(t));
            }
            window.announcerTimeouts = [];

            // Ekran okuyucuların "boş" demesini engellemek için içeriği SİLMİYORUZ.
            // Bunun yerine, aynı metin arka arkaya gelirse, sonuna okunamayan sıfır genişlikli boşluk (zero-width space) ekliyoruz.
            window.announcerToggle = !window.announcerToggle;
            let finalOutput = text + (window.announcerToggle ? '\u200B' : '');
            liveAnnouncer.textContent = finalOutput;

            // 20 Saniye sonra içeriği görünmez bir boşluğa çevirerek 
            // menü geziniminde (makale modu okuma) eski mesajların takılı kalmasını engelliyoruz
            let timer = setTimeout(() => {
                if (liveAnnouncer) liveAnnouncer.textContent = ' ';
            }, 20000);
            window.announcerTimeouts.push(timer);
        }
    } else {
        // PC'de doğrudan Odaklanarak okutma (Eski kararlı yöntem)
        // DOM'da asılı kalmış TÜM eski anonsları acımasızca temizle (Garbage Collection)
        const oldAnnouncers = document.querySelectorAll('#sr-focus-announcer');
        oldAnnouncers.forEach(el => el.remove());

        let previousFocus = document.activeElement;

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
            if (announcerDiv.parentNode) {
                // Odak kaybını engelle (NVDA'nın body'e düşmesini önle)
                if (document.activeElement === announcerDiv) {
                    if (previousFocus && document.body.contains(previousFocus) && previousFocus.tagName !== 'BODY') {
                        previousFocus.focus();
                    } else if (window.lastFocusedElement && document.body.contains(window.lastFocusedElement) && window.lastFocusedElement.tagName !== 'BODY') {
                        window.lastFocusedElement.focus();
                    } else if (typeof window.getActiveButtons === 'function') {
                        let btns = window.getActiveButtons();
                        if (btns && btns.length > 0) btns[0].focus();
                    }
                }
                announcerDiv.remove();
            }
        }, 15000);
    }
};

window.updateButtonUI = function (btnElement, modeData, unlockedLabel, lockReason) {
    if (!btnElement) return;

    let targetTurns = 5;
    if(modeData.name === 'Kolay') targetTurns = 1;
    if(modeData.name === 'Orta') targetTurns = 5;
    if(modeData.name === 'Zor') targetTurns = 5;

    let statusText = "";
    if (modeData.name !== 'Kayıp Notalar') {
        if (modeData.completionCount >= targetTurns) {
            statusText = " (Tamamlandı)";
            unlockedLabel += ". Bu mod uzmanlığı tamamlandı.";
        } else {
            let kalan = targetTurns - modeData.completionCount;
            statusText = ` (Tamamlanan: ${modeData.completionCount}, Hedef: ${targetTurns})`;
            unlockedLabel += `. Oynanan tur: ${modeData.completionCount}. Bir sonraki modu açmak için kalan tur: ${kalan}.`;
        }
    } else {
        if (modeData.completionCount > 0) {
            statusText = ` (Tamamlanan: ${modeData.completionCount})`;
            unlockedLabel += `. Bu modu ${modeData.completionCount} kez tamamladınız.`;
        }
    }

    if (modeData.isUnlocked) {
        btnElement.removeAttribute('aria-disabled');
        btnElement.classList.remove('locked-btn');
        btnElement.innerHTML = modeData.name + (modeData.name === "Hayatta Kalma" ? "" : " Mod") + statusText;
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

    const btnEasy = document.getElementById('btn-diff-easy');
    const btnMedium = document.getElementById('btn-diff-medium');
    const liMedium = document.getElementById('li-diff-medium');
    const btnHard = document.getElementById('btn-diff-hard');
    const liHard = document.getElementById('li-diff-hard');
    const btnMissingNotes = document.getElementById('btn-diff-missing-notes');
    const liMissingNotes = document.getElementById('li-diff-missing-notes');

    if (liMedium) liMedium.style.display = 'block';
    if (liHard) liHard.style.display = 'block';
    if (liMissingNotes) liMissingNotes.style.display = 'block';

    if (btnEasy) window.updateButtonUI(btnEasy, window.gameModes.easy, "Kolay Modu Oyna", "");
    window.updateButtonUI(btnMedium, window.gameModes.medium, "Orta Modu Oyna", "Kolay modu 1 kez tamamla");
    window.updateButtonUI(btnHard, window.gameModes.hard, "Zor Modu Oyna", "Orta modu 5 kez tamamla");
    window.updateButtonUI(btnMissingNotes, window.gameModes.missing_notes, "Kayıp Notalar Modu. Hikayeli piyano modu.", "Zor modu 5 kez tamamla");
};

window.updateStatsDisplay = function() {
    let tokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
    let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
    let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
    
    let easyCount = (window.gameModes && window.gameModes.easy) ? window.gameModes.easy.completionCount : 0;
    let mediumCount = (window.gameModes && window.gameModes.medium) ? window.gameModes.medium.completionCount : 0;
    let hardCount = (window.gameModes && window.gameModes.hard) ? window.gameModes.hard.completionCount : 0;
    let storyCount = (window.gameModes && window.gameModes.missing_notes) ? window.gameModes.missing_notes.completionCount : 0;

    let rank = "Oyuncu";

    let r_el = document.getElementById('profile-player-rank');
    if (r_el) r_el.innerText = rank;

    let html = "";
    if (tokens === 0 && hk === 0 && zk === 0 && easyCount === 0 && mediumCount === 0 && hardCount === 0 && storyCount === 0) {
        html = '<div id="empty-stats-alert" tabindex="0" role="alert" aria-label="İstatistik sekmesi boş. Hiç bir istatistiğe sahip değilsiniz." style="color: #ff4444; font-weight: bold; margin-top: 10px; padding: 15px; border: 2px solid #ff4444; border-radius: 8px; text-align: center; background: rgba(255,68,68,0.1);">Bu sekme boş. İstatistik bulunamadı.</div>';
        if (window.announceToScreenReader && window.currentActiveMenu === 'stats') {
            setTimeout(() => window.announceToScreenReader("Bu sekme boş. Henüz hiç bir istatistiğiniz bulunmuyor."), 300);
        }
    } else {
        html = `
            <p><strong>Bakiye:</strong> ${tokens} Jeton</p>
            <p><strong>Hata Koruması:</strong> ${hk} adet</p>
            <p><strong>Zaman Koruması:</strong> ${zk} adet</p>
            <p style="margin-top:10px; color:#ffb703;"><strong>Tamamlanan Oynanışlar:</strong></p>
            <ul style="list-style: none; padding-left: 10px; margin-top:5px;">
                <li>Kolay Mod: ${easyCount} kez</li>
                <li>Orta Mod: ${mediumCount} kez</li>
                <li>Zor Mod: ${hardCount} kez</li>
                <li>Kayıp Notalar: ${storyCount} kez</li>
            </ul>
        `;
    }

    const statsContent = document.getElementById('stats-content');
    const profileStatsContent = document.getElementById('profile-stats-content');

    if (statsContent) statsContent.innerHTML = html;
    if (profileStatsContent) profileStatsContent.innerHTML = html;
};

// --- PRESENCE (VARLIK) & SOSYAL LİSTE SİSTEMİ ---
window.initPresenceSystem = function() {
    const checkDb = setInterval(() => {
        if (window.db) {
            clearInterval(checkDb);
            const connectedRef = window.db.ref('.info/connected');
            
            connectedRef.on('value', (snap) => {
                let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
                if (!myName || myName.trim() === '' || myName === "Misafir") return;

                let safeId = myName.replace(/[.#$\[\]\/]/g, '_');
                let presenceRef = window.db.ref('presence/' + safeId);
                
                if (snap.val() === true) {
                    presenceRef.onDisconnect().set({ 
                        state: 'offline', 
                        name: myName,
                        last_changed: firebase.database.ServerValue.TIMESTAMP 
                    }).then(() => {
                        presenceRef.set({ 
                            state: 'online', 
                            name: myName,
                            last_changed: firebase.database.ServerValue.TIMESTAMP 
                        });
                    });
                }
            });

            window.db.ref('presence').on('value', (snap) => {
                window.lastPresenceData = snap.val() || {};
                if (window.currentActiveMenu === 'social') {
                    if (window.renderSocialList) window.renderSocialList();
                }
            });
        }
    }, 1000);
};

window.renderSocialList = function() {
    const listEl = document.getElementById('social-player-list');
    if (!listEl) return;

    let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Misafir";

    const emptyHtml = (myName !== "Misafir" && myName.trim() !== "") 
        ? `<li tabindex="0" aria-label="Sadece sen varsın. ${myName} olarak çevrimiçisin." style="padding: 10px; border-radius: 8px; margin-bottom: 8px; background-color: rgba(0, 168, 132, 0.15); border-left: 4px solid #00a884; display: flex; justify-content: space-between; align-items: center;"><span style="font-weight: bold; color: #e9edef;">${myName} (Sen)</span><span style="font-size: 0.9rem; font-weight: bold; color: #00a884;">Çevrimiçi</span></li>`
        : '<li tabindex="0" aria-label="Oyuncu listesi boş. Kimse yok.">bu sekme boş</li>';

    if (!window.lastPresenceData || Object.keys(window.lastPresenceData).length === 0) {
        listEl.innerHTML = emptyHtml;
        return;
    }

    let players = Object.values(window.lastPresenceData);
    if (players.length === 0) {
        listEl.innerHTML = emptyHtml;
        return;
    }

    players.sort((a, b) => {
        if (a.state === 'online' && b.state !== 'online') return -1;
        if (a.state !== 'online' && b.state === 'online') return 1;
        return (a.name || '').localeCompare(b.name || '');
    });

    listEl.innerHTML = '';
    let foundAny = false;

    players.forEach(p => {
        if (!p.name || p.name === myName) return; // Kendini listede gösterme
        foundAny = true;
        let isOnline = (p.state === 'online');
        
        let li = document.createElement('li');
        li.style.padding = "10px";
        li.style.borderRadius = "8px";
        li.style.marginBottom = "8px";
        li.style.backgroundColor = isOnline ? "rgba(0, 168, 132, 0.15)" : "rgba(80, 80, 80, 0.15)";
        li.style.borderLeft = isOnline ? "4px solid #00a884" : "4px solid #555";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.cursor = "pointer";

        let nameSpan = document.createElement('span');
        nameSpan.style.fontWeight = "bold";
        nameSpan.style.color = isOnline ? "#e9edef" : "#aaaaaa";
        nameSpan.innerText = p.name;

        let statusSpan = document.createElement('span');
        statusSpan.style.fontSize = "0.9rem";
        statusSpan.style.fontWeight = "bold";
        statusSpan.style.color = isOnline ? "#00a884" : "#888888";
        statusSpan.innerText = isOnline ? "Çevrimiçi" : "Çevrimdışı";

        li.setAttribute('aria-label', `${p.name} kullanıcısı şuan ${isOnline ? "çevrimiçi" : "çevrimdışı"}. İşlem yapmak için tıklayın veya Enter'a basın.`);
        li.setAttribute('tabindex', '0');

        const triggerAction = () => {
            if (window.openSocialActionModal) window.openSocialActionModal(p.name);
        };
        
        li.addEventListener('click', triggerAction);
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerAction();
            }
        });

        li.appendChild(nameSpan);
        li.appendChild(statusSpan);
        listEl.appendChild(li);
    });

    if (!foundAny) {
        listEl.innerHTML = emptyHtml;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initPresenceSystem);
} else {
    window.initPresenceSystem();
}

// --- EVENTS ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Erişilebilirlik (ARIA) Dinamik Enjektörü (Sessiz Semantik / Role Gizleme) ---
    // Kullanıcı talebi: bölüm, bölge, düğme, grup gibi element rollerinin okunmaması.
    const applySilentRoles = (root) => {
        const elementsToNone = root.querySelectorAll ? root.querySelectorAll('.menu-container, nav, section, ul, li, div[role="group"], div[role="region"], div[role="presentation"], h1, h2, h3, h4, h5, h6') : [];
        elementsToNone.forEach(el => el.setAttribute('role', 'none'));

        const buttonsToSilence = root.querySelectorAll ? root.querySelectorAll('button, .menu-button, .mobile-piano-key, [role="button"]') : [];
        buttonsToSilence.forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-roledescription', '\xA0'); // Boşluk karakteri, NVDA sessiz okur
        });

        const dialogs = root.querySelectorAll ? root.querySelectorAll('[role="dialog"]') : [];
        dialogs.forEach(el => el.setAttribute('aria-roledescription', '\xA0'));
    };

    applySilentRoles(document);
    
    // Sonradan yüklenen (dinamik) öğeler için kalkan
    const silentObserver = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.addedNodes.length) {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        applySilentRoles(node);
                        if (node.tagName === 'BUTTON' || node.getAttribute('role') === 'button') {
                            node.setAttribute('role', 'button');
                            node.setAttribute('aria-roledescription', '\xA0');
                        }
                    }
                });
            }
        });
    });
    silentObserver.observe(document.body, { childList: true, subtree: true });

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
            if (window.isStarted) {
                if (button.id && (button.id.includes('-back-') || button.id === 'nav-btn-home' || button.id === 'mobile-exit-btn')) {
                    if (window.menuCloseSound) window.menuCloseSound.play();
                } else {
                    if (window.menuEnterSound) window.menuEnterSound.play();
                }
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
    const buyBaglamaPackBtn = document.getElementById('buy-baglama-pack-btn');

    const startGameBtn = document.getElementById('start-game-btn');
    const gameBackBtn = document.getElementById('game-back-btn');

    if (gameBackBtn) {
        gameBackBtn.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.gameIsActive = false;
            window.isStarted = false;
            window.isComputerPlaying = false;
            
            if (window.gameInterval) clearInterval(window.gameInterval);
            if (window.sequenceTimeoutId) clearTimeout(window.sequenceTimeoutId);
            if (window.gameStartTimeoutId) clearTimeout(window.gameStartTimeoutId);
            if (window.gameStatusTimeoutId) clearTimeout(window.gameStatusTimeoutId);
            if (window.mobileExitBtnTimeout) clearTimeout(window.mobileExitBtnTimeout);
            
            if (window.seconsSound && window.seconsSound.playing()) window.seconsSound.stop();
            if (window.secons2Sound && window.secons2Sound.playing()) window.secons2Sound.stop();
            if (window.music60Sound && window.music60Sound.playing()) window.music60Sound.stop();

            // Multiplayer modundan çıkılıyorsa sunucudan kop (varsa)
            if (window.isMultiplayerGame && typeof window.quitMultiplayerMatch === 'function') {
                window.quitMultiplayerMatch();
            }

            if (window.switchMenu && window.mainMenu) {
                window.switchMenu(document.getElementById('game-menu-container'), window.mainMenu, 'main');
            }
            
            if (window.bgMusic && !window.bgMusic.playing()) {
                window.bgMusic.play();
            }
        });
    }

    const storyBackBtn = document.getElementById('story-back-btn');
    if (storyBackBtn) {
        storyBackBtn.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            if (window.quitStoryMode) window.quitStoryMode();
            if (window.switchMenu && window.storyMenu && window.mainMenu) {
                window.switchMenu(window.storyMenu, window.mainMenu, 'main');
            }
            if (window.bgMusic && !window.bgMusic.playing()) {
                window.bgMusic.play();
            }
        });
    }

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

    // Güncelleme Yükle Butonu
    const updateInstallBtn = document.getElementById('update-install-btn');
    if (updateInstallBtn) {
        updateInstallBtn.addEventListener('click', () => {
            if (updateInstallBtn.disabled) return;
            updateInstallBtn.disabled = true;
            if (window.announceToScreenReader) window.announceToScreenReader("Güncelleme yükleniyor, sayfa yenilenecek...", true);
            setTimeout(() => {
                window.location.reload(true);
            }, 1000);
        });
    }

    // İstatistikler Menüsü Kontrolleri
    if (statsBtnMain) {
        statsBtnMain.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            if (window.updateStatsDisplay) window.updateStatsDisplay();
            if (window.switchMenu && window.mainMenu && window.statsMenu) {
                window.switchMenu(window.mainMenu, window.statsMenu, 'stats');
                if (window.announceToScreenReader) window.announceToScreenReader("İstatistikler menüsü");
            }
        });
    }

    if (statsBackBtn) {
        statsBackBtn.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            if (window.switchMenu && window.mainMenu && window.statsMenu) {
                window.switchMenu(window.statsMenu, window.mainMenu, 'main');
            }
        });
    }

    // Mobil alt menü (Tab bar) Event Listeners
    const btnHome = document.getElementById('nav-btn-home');
    const btnSocial = document.getElementById('nav-btn-social');
    const btnProfile = document.getElementById('nav-btn-profile');

    const updateActiveTab = (activeId) => {
        if(btnHome) btnHome.classList.remove('active');
        if(btnSocial) btnSocial.classList.remove('active');
        if(btnProfile) btnProfile.classList.remove('active');
        const activeBtn = document.getElementById(activeId);
        if(activeBtn) activeBtn.classList.add('active');
    };

    const getMenuEl = (menuName) => {
        if (menuName === 'main') return window.mainMenu;
        if (menuName === 'social') return window.socialMenu;
        if (menuName === 'profile') return window.profileMenu;
        let p = window[menuName.replace('-','') + 'Menu'];
        if (p) return p;
        return document.getElementById(menuName + '-menu-container') || window.mainMenu;
    };

    if (btnHome) {
        btnHome.addEventListener('click', () => {
            if (window.currentActiveMenu !== 'main') {
                if (window.currentActiveMenu === 'store') {
                    if (window.music25Sound && window.music25Sound.playing()) window.music25Sound.stop();
                    if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
                }
                window.switchMenu(getMenuEl(window.currentActiveMenu), window.mainMenu, 'main');
                updateActiveTab('nav-btn-home');
                if (window.menuCloseSound) window.menuCloseSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Ana menü");
            }
        });
    }

    if (btnSocial) {
        btnSocial.addEventListener('click', () => {
            if (window.currentActiveMenu !== 'social') {
                if (window.currentActiveMenu === 'store') {
                    if (window.music25Sound && window.music25Sound.playing()) window.music25Sound.stop();
                    if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
                }
                window.switchMenu(getMenuEl(window.currentActiveMenu), window.socialMenu, 'social');
                updateActiveTab('nav-btn-social');
                if (window.renderSocialList) window.renderSocialList();
                if (window.menuEnterSound) window.menuEnterSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Sosyal menüsü");
            }
        });
    }

    if (btnProfile) {
        btnProfile.addEventListener('click', () => {
            if (window.currentActiveMenu !== 'profile') {
                if (window.currentActiveMenu === 'store') {
                    if (window.music25Sound && window.music25Sound.playing()) window.music25Sound.stop();
                    if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
                }
                let playerName = localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
                let nameEl = document.getElementById('profile-player-name');
                if (nameEl) nameEl.innerText = playerName;

                if (window.updateStatsDisplay) window.updateStatsDisplay();

                window.switchMenu(getMenuEl(window.currentActiveMenu), window.profileMenu, 'profile');
                updateActiveTab('nav-btn-profile');
                if (window.menuEnterSound) window.menuEnterSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Profil menüsü");
            }
        });
    }

    // PC Sekme Geçiş Kısayolları (Alt + 1, Alt + 2, Alt + 3)
    document.addEventListener('keydown', (e) => {
        const safeMenus = ['main', 'profile', 'social', 'scoreboard', 'stats', 'achievements', 'store', 'play-mode', 'difficulty', 'settings'];
        if (!safeMenus.includes(window.currentActiveMenu)) return;

        if (e.altKey && e.key === '1') {
            e.preventDefault();
            if (btnHome) btnHome.click();
        } else if (e.altKey && e.key === '2') {
            e.preventDefault();
            if (btnSocial) btnSocial.click();
        } else if (e.altKey && e.key === '3') {
            e.preventDefault();
            if (btnProfile) btnProfile.click();
        }
    });

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

    // Settings
    const settingsBtnMain = document.getElementById('settings-btn-main');
    const settingsBackBtn = document.getElementById('settings-back-btn');
    const settingsSaveBtn = document.getElementById('settings-save-btn');
    const settingsMenuContainer = document.getElementById('settings-menu-container');

    if (settingsBtnMain && settingsBackBtn) {
        settingsBtnMain.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            window.switchMenu(window.mainMenu, settingsMenuContainer, 'settings');
            if (window.announceToScreenReader) window.announceToScreenReader("Ayarlar menüsü");
        });
        
        const goBackToMenu = () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.switchMenu(settingsMenuContainer, window.mainMenu, 'main');
        };

        settingsBackBtn.addEventListener('click', goBackToMenu);
        
        if (settingsSaveBtn) {
            settingsSaveBtn.addEventListener('click', () => {
                if (window.announceToScreenReader) window.announceToScreenReader("Ayarlar başarıyla kaydedildi.", true);
                goBackToMenu();
            });
        }

        const musicVolumeSlider = document.getElementById('music-volume-slider');
        const musicVolumeDisplay = document.getElementById('music-volume-display');

        const blockUpDown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        };

        window.setMusicVolume = function(val) {
            let scale = val / 100;
            if (window.bgMusic) window.bgMusic.volume(1.0 * scale);
            if (window.storyBGM) window.storyBGM.volume(0.5 * scale);
            if (window.music60Sound) window.music60Sound.volume(0.5 * scale);
            if (window.music272Sound) window.music272Sound.volume(0.4 * scale);
            if (window.house2Sound) window.house2Sound.volume(0.6 * scale);
            if (window.mountainSound) window.mountainSound.volume(0.4 * scale);
            if (window.music117Sound) window.music117Sound.volume(0.5 * scale);
            if (window.music38Sound) window.music38Sound.volume(0.7 * scale);
            if (window.music25Sound) window.music25Sound.volume(0.7 * scale);
        };

        if (musicVolumeSlider && musicVolumeDisplay) {
            let savedVol = localStorage.getItem('hafizaGuvenMusicVolume');
            if (savedVol !== null) {
                musicVolumeSlider.value = savedVol;
                musicVolumeDisplay.innerText = '%' + savedVol;
                window.setMusicVolume(savedVol);
            }

            musicVolumeSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                musicVolumeDisplay.innerText = '%' + val;
                window.setMusicVolume(val);
                localStorage.setItem('hafizaGuvenMusicVolume', val);
            });
            
            musicVolumeSlider.addEventListener('keydown', blockUpDown);
            
            musicVolumeSlider.addEventListener('change', () => {
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Müzik sesi: yzde " + musicVolumeSlider.value);
                }
            });
        }

        const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
        const sfxVolumeDisplay = document.getElementById('sfx-volume-display');

        const updateSfxVolumes = (val) => {
            let scale = val / 100;
            
            const isMobileLocal = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
            if (!isMobileLocal) {
                if (window.hoverSound) window.hoverSound.volume(0.5 * scale);
                if (window.menuEnterSound) window.menuEnterSound.volume(0.5 * scale);
                if (window.menuCloseSound) window.menuCloseSound.volume(0.5 * scale);
            }
            if (window.correctSound) window.correctSound.volume(1.0 * scale);
            if (window.wrongSound) window.wrongSound.volume(1.0 * scale);
            if (window.glasshitSound) window.glasshitSound.volume(1.0 * scale);
            if (window.gameOverSound) window.gameOverSound.volume(1.0 * scale);
            if (window.modeUnlockSound) window.modeUnlockSound.volume(1.0 * scale);
            if (window.enterHouseSound) window.enterHouseSound.volume(1.0 * scale);
            if (window.doorCloseSound) window.doorCloseSound.volume(1.0 * scale);
            if (window.buySound) window.buySound.volume(1.0 * scale);
            if (window.seconsSound) window.seconsSound.volume(1.0 * scale);
            if (window.secons2Sound) window.secons2Sound.volume(1.0 * scale);
            if (window.clockTickSound) window.clockTickSound.volume(0.5 * scale);
            if (window.dado3Sound) window.dado3Sound.volume(0.8 * scale);
            if (window.chatReceiveSound) window.chatReceiveSound.volume(1.0 * scale);
            if (window.achievementSound) window.achievementSound.volume(1.0 * scale);
            if (window.getCoinsSound) window.getCoinsSound.volume(1.0 * scale);
            
            if (window.pianoNotes) {
                for (let k in window.pianoNotes) window.pianoNotes[k].volume(1.0 * scale);
            }
            if (window.snowStepSounds) {
                for (let i = 0; i < window.snowStepSounds.length; i++) window.snowStepSounds[i].volume(1.0 * scale);
            }
            if (window.carpetStepSounds) {
                for (let i = 0; i < window.carpetStepSounds.length; i++) window.carpetStepSounds[i].volume(1.0 * scale);
            }
            if (window.storyNoteSounds) {
                for (let i = 0; i < window.storyNoteSounds.length; i++) window.storyNoteSounds[i].volume(0.15 * scale);
            }
        };

        if (sfxVolumeSlider && sfxVolumeDisplay) {
            let savedSfxVol = localStorage.getItem('hafizaGuvenSfxVolume');
            if (savedSfxVol !== null) {
                sfxVolumeSlider.value = savedSfxVol;
                sfxVolumeDisplay.innerText = '%' + savedSfxVol;
                updateSfxVolumes(savedSfxVol);
            }

            sfxVolumeSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                sfxVolumeDisplay.innerText = '%' + val;
                updateSfxVolumes(val);
                localStorage.setItem('hafizaGuvenSfxVolume', val);
            });
            
            sfxVolumeSlider.addEventListener('keydown', blockUpDown);
            
            sfxVolumeSlider.addEventListener('change', () => {
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Efekt sesi: yzde " + sfxVolumeSlider.value);
                }
            });
        }

        const toggleMusicBtn = document.getElementById('toggle-music-btn');

        window.updateMusicMuteState = (forceMuteState) => {
            let isMuted = forceMuteState !== undefined ? forceMuteState : (window.bgMusic ? window.bgMusic.mute() : false);
            
            if (toggleMusicBtn) {
                toggleMusicBtn.innerText = isMuted ? "Oyun müziğini etkinleştir" : "Oyun müziğini devre dışı bırak";
                toggleMusicBtn.setAttribute('aria-label', toggleMusicBtn.innerText);
            }

            if (forceMuteState !== undefined) {
                if (window.bgMusic) window.bgMusic.mute(isMuted);
                if (window.storyBGM) window.storyBGM.mute(isMuted);
                if (window.music60Sound) window.music60Sound.mute(isMuted);
                if (window.music272Sound) window.music272Sound.mute(isMuted);
                if (window.music117Sound) window.music117Sound.mute(isMuted);
                if (window.music38Sound) window.music38Sound.mute(isMuted);
                if (window.music25Sound) window.music25Sound.mute(isMuted);
                if (window.house2Sound) window.house2Sound.mute(isMuted);
                if (window.mountainSound) window.mountainSound.mute(isMuted);
                localStorage.setItem('hafizaGuvenMusicMuted', isMuted);
            }
        };

        if (toggleMusicBtn) {
            let savedMute = localStorage.getItem('hafizaGuvenMusicMuted') === 'true';
            window.updateMusicMuteState(savedMute);

            toggleMusicBtn.addEventListener('click', () => {
                if (window.menuEnterSound) window.menuEnterSound.play();
                let currentMute = window.bgMusic ? window.bgMusic.mute() : false;
                window.updateMusicMuteState(!currentMute);
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(!currentMute ? "Oyun müziği devre dışı bırakıldı." : "Oyun müziği etkinleştirildi.", true);
                }
            });
        }

        const toggleIntroBtn = document.getElementById('toggle-intro-btn');
        window.updateIntroBtnState = () => {
            let skipIntro = localStorage.getItem('hafizaGuvenSkipIntro') === 'true';
            if (toggleIntroBtn) {
                toggleIntroBtn.innerText = skipIntro ? "Başlangıçta logoyu atla (Açık)" : "Başlangıçta logoyu atla (Kapalı)";
                toggleIntroBtn.setAttribute('aria-label', toggleIntroBtn.innerText);
            }
        };

        if (toggleIntroBtn) {
            window.updateIntroBtnState();
            toggleIntroBtn.addEventListener('click', () => {
                if (window.menuEnterSound) window.menuEnterSound.play();
                let skipIntro = localStorage.getItem('hafizaGuvenSkipIntro') === 'true';
                skipIntro = !skipIntro;
                localStorage.setItem('hafizaGuvenSkipIntro', skipIntro);
                window.updateIntroBtnState();
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(skipIntro ? "Oyun açılışında logo atlanacak." : "Oyun açılışında logo atlanmayacak.", true);
                }
            });
        }

        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('keydown', blockUpDown);
            let savedTheme = localStorage.getItem('hafizaGuvenTheme') || 'default';
            themeSelector.value = savedTheme;
            
            themeSelector.addEventListener('change', (e) => {
                const newTheme = e.target.value;
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('hafizaGuvenTheme', newTheme);
                
                if (window.announceToScreenReader) {
                    let selText = e.target.options[e.target.selectedIndex].text;
                    window.announceToScreenReader("Oyun teması değiştirildi: " + selText, true);
                }
            });
        }

        const keyboardLayoutSelector = document.getElementById('keyboard-layout-selector');
        if (keyboardLayoutSelector) {
            keyboardLayoutSelector.addEventListener('keydown', blockUpDown);
            let savedLayout = localStorage.getItem('hafizaGuvenKeyboardLayout') || 'alpha';
            keyboardLayoutSelector.value = savedLayout;
            
            keyboardLayoutSelector.addEventListener('change', (e) => {
                const newLayout = e.target.value;
                localStorage.setItem('hafizaGuvenKeyboardLayout', newLayout);
                if (window.announceToScreenReader) {
                    let selText = e.target.options[e.target.selectedIndex].text;
                    window.announceToScreenReader("Klavye düzeni değiştirildi: " + selText, true);
                }
            });
        }
    }

    // Store
    if (storeBtnMain && storeBackBtn) {
        storeBtnMain.addEventListener('click', () => {
            window.lastFocusedElement = document.activeElement;
            window.switchMenu(window.mainMenu, window.storeMenu, 'store');
            
            if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
            if (window.music25Sound && !window.music25Sound.playing()) window.music25Sound.play();
            document.getElementById('main-menu-container').setAttribute('aria-hidden', 'true');
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            
            if (buyBaglamaPackBtn) {
                let ownsBaglama = localStorage.getItem('hafizaGuvenBaglamaPack') === 'true';
                if (ownsBaglama) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'baglama';
                    buyBaglamaPackBtn.innerText = isActive ? "Bağlama Ses Paketini Kapat" : "Bağlama Ses Paketini Etkinleştir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. " + (isActive ? "Kapatmak" : "Etkinleştirmek") + " için tıklayın.");
                } else {
                    buyBaglamaPackBtn.innerText = "Bağlama Ses Paketi Satın Al (500 Jeton)";
                    buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Notaları piyano yerine bağlama ile duyarsınız. Kalıcı olarak sahip olursunuz. Fiyat: 500 Jeton.");
                }
            }
            
            if (window.announceToScreenReader) window.announceToScreenReader(`Mağazaya hoş geldiniz. Mevcut jetonunuz: ${totalTokens}`);
        });
        storeBackBtn.addEventListener('click', () => {
            if (window.music25Sound && window.music25Sound.playing()) window.music25Sound.stop();
            if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();

            window.switchMenu(window.storeMenu, window.mainMenu, 'main');
            document.getElementById('main-menu-container').removeAttribute('aria-hidden');
            setTimeout(() => {
                if (window.lastFocusedElement) {
                    window.lastFocusedElement.focus();
                } else {
                    let startBtn = document.getElementById('start-game-btn');
                    if (startBtn) startBtn.focus();
                }
            }, 350);
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

    if (buyBaglamaPackBtn) {
        buyBaglamaPackBtn.addEventListener('click', () => {
            let ownsBaglama = localStorage.getItem('hafizaGuvenBaglamaPack') === 'true';
            
            if (ownsBaglama) {
                let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'baglama';
                if (isActive) {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'piano');
                    window.activeInstrument = 'piano';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Etkinleştir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Etkinleştirmek için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Bağlama ses paketi kapatıldı. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'baglama');
                    window.activeInstrument = 'baglama';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Kapat";
                    buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Kapatmak için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Bağlama ses paketi etkinleştirildi!");
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 500) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = "Yetersiz bakiye. Bu eşya için 500 jetona ihtiyacınız var.";
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 500;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenBaglamaPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'baglama');
                window.activeInstrument = 'baglama';
                
                buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Kapat";
                buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Kapatmak için tıklayın.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! Bağlama ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
            }
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
        feedbackSubmitBtn.addEventListener('click', function() {
            let name = document.getElementById('feedback-name').value.trim() || "Anonim Oyuncu";
            let category = document.getElementById('feedback-category').value;
            let text = document.getElementById('feedback-text').value.trim();
            let desc = document.getElementById('feedback-desc'); // aria-live okuma alanı
            let btn = this;

            if (!text) {
                desc.textContent = "Hata: Lütfen bilet mesajınızı boş bırakmayın.";
                document.getElementById('feedback-text').focus();
                return;
            }

            desc.textContent = "Sunucuya bağlanılıyor, lütfen bekleyin...";
            btn.disabled = true;

            // Firebase'e veriyi gönder
            firebase.database().ref('feedbacks').push({
                name: name,
                category: category,
                message: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                desc.textContent = "Başarılı! Geri bildiriminiz Başyönetmen'e güvenle iletildi.";
                document.getElementById('feedback-name').value = "";
                document.getElementById('feedback-text').value = "";
                btn.disabled = false;
                
                // Formu otomatik kapat
                setTimeout(() => {
                    if (window.currentActiveMenu === 'feedback') {
                        window.switchMenu(window.feedbackMenu, window.mainMenu, 'main');
                    }
                }, 2500);
                
            }).catch((error) => {
                desc.textContent = "Bağlantı hatası: " + error.message;
                btn.disabled = false;
            });
        });
    }

    // Practice
    if (practiceBtnMain && practiceBackBtn) {
        practiceBtnMain.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.practiceMenu, 'practice');
            if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
            if (window.music117Sound && !window.music117Sound.playing()) window.music117Sound.play();
            window.isStarted = true;

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
            window.isStarted = false; // Oyunu / alıştırmayı sonlandır
            if (window.music117Sound && window.music117Sound.playing()) window.music117Sound.stop();

            window.switchMenu(window.practiceMenu, window.mainMenu, 'main');
            if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
        });
    }

    const playModeMenuDOM = document.getElementById('play-mode-menu-container');
    const offlinePlayBtn = document.getElementById('offline-play-btn');
    const multiplayerPlayBtn = document.getElementById('multiplayer-play-btn');
    const playModeBackBtn = document.getElementById('play-mode-back-btn');
    if (!window.playModeMenu) window.playModeMenu = playModeMenuDOM;

    const mpSelectMenuDOM = document.getElementById('multiplayer-select-menu-container');
    const pvpPlayBtn = document.getElementById('pvp-play-btn');
    const pvpJoinBtn = document.getElementById('pvp-join-btn');
    const pveBotPlayBtn = document.getElementById('pve-bot-play-btn');
    const mpSelectBackBtn = document.getElementById('multiplayer-select-back-btn');
    if (!window.multiplayerSelectMenu) window.multiplayerSelectMenu = mpSelectMenuDOM;

    const pvpRoomsMenuDOM = document.getElementById('pvp-rooms-menu-container');
    const pvpRoomsBackBtn = document.getElementById('pvp-rooms-back-btn');
    const pvpRoomsRefreshBtn = document.getElementById('pvp-rooms-refresh-btn');
    if (!window.pvpRoomsMenu) window.pvpRoomsMenu = pvpRoomsMenuDOM;

    if (pvpRoomsBackBtn) {
        pvpRoomsBackBtn.addEventListener('click', () => {
            window.switchMenu(window.pvpRoomsMenu, window.multiplayerSelectMenu, 'multiplayer-select');
        });
    }

    if (pvpRoomsRefreshBtn) {
        pvpRoomsRefreshBtn.addEventListener('click', () => {
            if (window.PvP && window.PvP.fetchAvailableMatches) {
                window.PvP.fetchAvailableMatches(false); // false = tell it not to switch menus as we are already here
            }
        });
    }

    // Ana Menüden Oyun Modu Seçimine Geçiş
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            window.lastFocusedElement = document.activeElement;
            window.switchMenu(window.mainMenu, window.playModeMenu, 'play-mode');
        });
    }

    if (offlinePlayBtn) {
        offlinePlayBtn.addEventListener('click', () => {
            window.switchMenu(window.playModeMenu, window.difficultyMenu, 'difficulty');
            if (window.updateDifficultyMenuLocks) window.updateDifficultyMenuLocks();
        });
    }

    if (multiplayerPlayBtn) {
        multiplayerPlayBtn.addEventListener('click', () => {
            window.lastFocusedElement = document.activeElement;
            window.switchMenu(window.playModeMenu, window.multiplayerSelectMenu, 'multiplayer-select');
        });
    }

    if (pvpJoinBtn) {
        pvpJoinBtn.addEventListener('click', () => {
            if (window.PvP) {
                if (window.PvP.fetchAvailableMatches) {
                    window.PvP.fetchAvailableMatches(true); // true = open menu if successful or announce if empty
                }
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Eşleştirme sistemi henüz yüklenmedi.");
            }
        });
    }

    if (pvpPlayBtn) {
        pvpPlayBtn.addEventListener('click', () => {
            if (window.PvP) {
                if (window.PvP.isSearching && !window.PvP.isBotMode) {
                    window.PvP.cancelQueue();
                } else if (!window.PvP.isSearching) {
                    window.PvP.createMatch(); // Eşleşme aramak yerine Odayı kurup bekler
                }
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Eşleştirme sistemi henüz yüklenmedi.");
            }
        });
    }

    if (pveBotPlayBtn) {
        pveBotPlayBtn.addEventListener('click', () => {
            if (window.PvP) {
                if (window.PvP.isSearching && window.PvP.isBotMode) {
                    window.PvP.cancelQueue();
                } else if (!window.PvP.isSearching) {
                    window.PvP.startBotMatch();
                }
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Bot sistemi henüz yüklenmedi.");
            }
        });
    }

    if (mpSelectBackBtn) {
        mpSelectBackBtn.addEventListener('click', () => {
            // Eşleştirme sırasında geri basıp kaçarsa tüm işlemi katlet
            if (window.PvP && window.PvP.isSearching) {
                window.PvP.cancelQueue();
            }
            
            window.switchMenu(window.multiplayerSelectMenu, window.playModeMenu, 'play-mode');
            
            setTimeout(() => {
                if (window.lastFocusedElement) {
                    window.lastFocusedElement.focus();
                } else {
                    let mpBtn = document.getElementById('multiplayer-play-btn');
                    if (mpBtn) mpBtn.focus();
                }
            }, 300);
        });
    }

    if (playModeBackBtn) {
        playModeBackBtn.addEventListener('click', () => {
            window.switchMenu(window.playModeMenu, window.mainMenu, 'main');
            
            setTimeout(() => {
                if (window.lastFocusedElement) {
                    window.lastFocusedElement.focus();
                } else {
                    let startBtn = document.getElementById('start-game-btn');
                    if (startBtn) startBtn.focus();
                }
            }, 300);
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
                window.isDialogPhase = true;
                window.currentStoryIndex = 0;
                window.isStarted = true;
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
                    if (window.menuCloseSound) window.menuCloseSound.play();
                    if (window.quitStoryMode) window.quitStoryMode();

                    if (window.switchMenu && window.storyMenu && window.mainMenu) {
                        window.switchMenu(window.storyMenu, window.mainMenu, 'main');
                    }
                    if (window.bgMusic && !window.bgMusic.playing()) window.bgMusic.play();
                }
            });
        }
    }
});

// Evrensel ESC Tuşu ve Mobil Geri Tuşu Koruması
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Canlı sohbet kendi ESC dinleyicisine sahip
        if (window.isChatOpen) return;
        
        const menusWithBackBtns = {
            'store': 'store-back-btn',
            'practice': 'practice-back-btn',
            'difficulty': 'difficulty-back-btn',
            'scoreboard': 'scoreboard-back-btn',
            'achievements': 'achievements-back-btn',
            'feedback': 'feedback-back-btn',
            'stats': 'stats-back-btn',
            'play-mode': 'play-mode-back-btn',
            'multiplayer-select': 'multiplayer-select-back-btn',
            'pvp-rooms': 'pvp-rooms-back-btn',
            'settings': 'settings-back-btn'
        };

        if (window.currentActiveMenu && menusWithBackBtns[window.currentActiveMenu]) {
             const backBtn = document.getElementById(menusWithBackBtns[window.currentActiveMenu]);
             if (backBtn) backBtn.click();
        }

        // OYUN VE HİKAYE MODUNDAN GÜVENLİ KAÇIŞ PROTOKOLÜ
        if (window.currentActiveMenu === 'game' || window.currentActiveMenu === 'story') {
            const mobileGameBackBtn = document.getElementById('mobile-game-back-btn');
            const gameBackBtn = document.getElementById('game-back-btn');
            
            if (mobileGameBackBtn) {
                mobileGameBackBtn.click(); // Hikaye ve Oyun çıkışını güvenle tetikler
            } else if (gameBackBtn) {
                gameBackBtn.click();
            }
            return;
        }
    }
});

window.addEventListener('popstate', (e) => {
    // 1. Canlı sohbet açıksa kapat
    if (window.isChatOpen && typeof window.toggleChat === 'function') {
        window.toggleChat();
        history.pushState(null, "", "");
        return;
    }
    
    // 2. Alt menüler açıksa kapat
    const menusWithBackBtns = {
        'store': 'store-back-btn',
        'practice': 'practice-back-btn',
        'difficulty': 'difficulty-back-btn',
        'scoreboard': 'scoreboard-back-btn',
        'achievements': 'achievements-back-btn',
        'feedback': 'feedback-back-btn',
        'stats': 'stats-back-btn',
        'play-mode': 'play-mode-back-btn',
        'multiplayer-select': 'multiplayer-select-back-btn',
        'pvp-rooms': 'pvp-rooms-back-btn'
    };
    
    if (window.currentActiveMenu && menusWithBackBtns[window.currentActiveMenu]) {
         const backBtn = document.getElementById(menusWithBackBtns[window.currentActiveMenu]);
         if (backBtn) backBtn.click();
         history.pushState(null, "", "");
    }
});

// Menü içi ok tuşlarıyla gezinme işlevi
document.addEventListener('keydown', function (event) {
    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        let allowThrough = false;
        if (window.currentActiveMenu === 'settings' && (document.activeElement.type === 'range' || document.activeElement.tagName === 'SELECT')) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                allowThrough = true; // Yön tuşlarının menü gezinmesi ve değer değiştirme mantığına inmesine izin ver
            }
        }
        if (!allowThrough) {
            return;
        }
    }

    // Mağaza miktar belirleme ('+', '-', 'ArrowRight', 'ArrowLeft') ve Okuma (Sessiz Kasiyer Koruması)
    if (document.activeElement && document.activeElement.id === 'store-buy-quantity-display') {
        let quantityDisplay = document.activeElement;
        let currentQuantity = parseInt(quantityDisplay.getAttribute('aria-valuenow')) || 1;
        
        if (event.key === 'ArrowRight' || event.key === '+' || event.key === 'ArrowUp') {
            event.preventDefault();
            let newQuantity = Math.min(99, currentQuantity + 1);
            quantityDisplay.setAttribute('aria-valuenow', newQuantity);
            quantityDisplay.setAttribute('aria-label', 'Miktar: ' + newQuantity);
            quantityDisplay.innerText = newQuantity;
            return;
        } else if (event.key === 'ArrowLeft' || event.key === '-' || event.key === 'ArrowDown') {
            event.preventDefault();
            let newQuantity = Math.max(1, currentQuantity - 1);
            quantityDisplay.setAttribute('aria-valuenow', newQuantity);
            quantityDisplay.setAttribute('aria-label', 'Miktar: ' + newQuantity);
            quantityDisplay.innerText = newQuantity;
            return;
        }
    }

    if (window.isGridWalkingPhase && window.currentActiveMenu === 'story') {
        return;
    }

    // Sohbet penceresi açıkken ana menü yön tuşları gezinimini devre dışı bırak
    if (window.isChatOpen) {
        return;
    }

    // Seçenekler (Ayarlar) menüsünde yukarı/aşağı oklarıyla dolaşmayı iptal ederek "Tab" kullanımını (standart gezinme) zorla
    if (window.currentActiveMenu === 'settings') {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            return;
        }
    }

    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Enter'].includes(event.key)) {
        // Ok tuşlarıyla mesajı tekrar okuma ve Enter ile sessizce geçme mantığı
        if ((window.currentActiveMenu === 'story' && window.isDialogPhase) ||
            (window.currentActiveMenu === 'practice' && window.isDialogPhase) ||
            window.currentActiveMenu === 'server-message' ||
            window.currentActiveMenu === 'update' ||
            window.currentActiveMenu === 'profile') {
            
            event.preventDefault();

            if (event.key === 'Enter') {
                // Sadece Entıra basılınca onaylansın
                if (window.currentActiveMenu === 'server-message') {
                    const btn = document.getElementById('server-message-continue-btn');
                    if (btn) btn.click();
                } else if (window.currentActiveMenu === 'update') {
                    const btn = document.getElementById('update-install-btn');
                    if (btn) btn.click();
                } else if (window.currentActiveMenu === 'story') {
                    // Story.js enter'ı kendi game.js içinden dinliyor olabilir, ancak buraya da koyabiliriz.
                    // Fakat story entırı karmaşık, game.js'den yönetiliyor.
                } else if (window.currentActiveMenu === 'profile') {
                    if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
                        document.activeElement.click();
                    }
                }
                return;
            }

            // Ok tuşlarına basıldıysa mevcut mesajı tekrar okut
            let textToRead = "";
            if (window.currentActiveMenu === 'story' && window.missingNotesDialogues) {
                textToRead = window.missingNotesDialogues[window.currentStoryIndex];
            } else if (window.currentActiveMenu === 'practice' && window.practiceDialogues) {
                textToRead = window.practiceDialogues[window.currentDialogIndex];
            } else if (window.currentActiveMenu === 'server-message') {
                let p = document.getElementById('server-message-text');
                if (p) textToRead = "Yapılan Son Değişiklik: " + (p.innerText || p.textContent);
            } else if (window.currentActiveMenu === 'update') {
                let p = document.getElementById('update-text');
                if (p) textToRead = p.innerText || p.textContent;
            } else if (window.currentActiveMenu === 'profile') {
                let pName = document.getElementById('profile-player-name') ? document.getElementById('profile-player-name').innerText : "Bilinmiyor";
                let pRank = document.getElementById('profile-player-rank') ? document.getElementById('profile-player-rank').innerText : "Oyuncu";
                let pStats = document.getElementById('profile-stats-content') ? document.getElementById('profile-stats-content').innerText : "İstatistik verisi yok.";
                textToRead = "Oyuncu Profili. Adınız: " + pName + ". Rütbeniz: " + pRank + ". " + pStats;
            }

            if (textToRead && window.announceToScreenReader) {
                let localized = window.localizeText ? window.localizeText(textToRead) : textToRead;
                window.announceToScreenReader(localized, true);
            }
            return;
        }

        if (event.key === 'Enter') return; // Sadece ok tuşlarını menü gezinmesine bırak

        const activeButtons = window.getActiveButtons();
        if (activeButtons.length === 0) return;

        const activeElem = document.activeElement;
        
        // Ayarlar menüsünde özel ok sağ/sol davranışı (sadece değer değiştir, menü dolaşma)
        if (window.currentActiveMenu === 'settings' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            if (activeElem && activeElem.tagName === 'INPUT' && activeElem.type === 'range') {
                return; // Natively handle range inputs (fire input/change)
            }
            if (activeElem && activeElem.tagName === 'SELECT') {
                event.preventDefault();
                let step = event.key === 'ArrowRight' ? 1 : -1;
                let newIndex = activeElem.selectedIndex + step;
                if (newIndex >= 0 && newIndex < activeElem.options.length) {
                    activeElem.selectedIndex = newIndex;
                    activeElem.dispatchEvent(new Event('change'));
                }
                return;
            }
            event.preventDefault();
            return; // Butonlardaysak sol/sağ oklar hiçbir şey yapmasın.
        }

        event.preventDefault();

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            if (window.currentFocusIndex >= activeButtons.length) window.currentFocusIndex = 0;
            if (activeButtons.length === 1) {
                activeButtons[0].blur();
                setTimeout(() => activeButtons[0].focus(), 10);
            } else {
                window.currentFocusIndex = (window.currentFocusIndex + 1) % activeButtons.length;
                activeButtons[window.currentFocusIndex].focus();
            }
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            if (window.currentFocusIndex >= activeButtons.length) window.currentFocusIndex = 0;
            if (activeButtons.length === 1) {
                activeButtons[0].blur();
                setTimeout(() => activeButtons[0].focus(), 10);
            } else {
                window.currentFocusIndex = (window.currentFocusIndex - 1 + activeButtons.length) % activeButtons.length;
                activeButtons[window.currentFocusIndex].focus();
            }
        }
    }
});

// --- CANLI SOHBET SİSTEMİ ARAYÜZ MANTIĞI ---
window.isChatOpen = false;

// --- ANLIK BİLDİRİM (TOAST) FONKSİYONU ---
window.showToastNotification = function(text) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('aria-hidden', 'true');
    toast.innerText = text;
    document.body.appendChild(toast);
    
    // Görünür yap
    setTimeout(() => toast.classList.add('show'), 50);

    // 3.5 saniye sonra kaldır
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // animasyon bekleme süresi
    }, 3500);
};

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
            history.pushState({ modalOpen: 'chat' }, "");
            window.lastFocusedElement = document.activeElement;
            chatPanel.style.display = 'flex';
            chatPanel.removeAttribute('aria-hidden');
            const activeContainerId = (window.currentActiveMenu || 'main') + '-menu-container';
            const activeContainer = document.getElementById(activeContainerId);
            if (activeContainer) activeContainer.setAttribute('aria-hidden', 'true');
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
                if (window.disconnectRef) { window.disconnectRef.onDisconnect().cancel(); }
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
            const activeContainerId = (window.currentActiveMenu || 'main') + '-menu-container';
            const activeContainer = document.getElementById(activeContainerId);
            if (activeContainer) activeContainer.removeAttribute('aria-hidden');
            
            setTimeout(() => {
                if (window.lastFocusedElement) {
                    window.lastFocusedElement.focus();
                } else {
                    let startBtn = document.getElementById('start-game-btn');
                    if (startBtn) startBtn.focus();
                }
            }, 100);

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

        // Firebase Yolu Kuralı: İsimlerde '.', '#', '$', '[', ']' veya '/' kullanılamaz. 
        // Aksi takdirde uygulama sessizce ve senkron olarak çöker.
        if (/[.#$\[\]\/]/.test(nickname)) {
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "Kullanıcı adınızda geçersiz karakterler bulunuyor. Lütfen nokta veya köşeli parantez gibi hatalı sembolleri silin.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            if (nickInput) {
                // Temizleyerek otomatik düzeltilmiş halini sun
                nickInput.value = nickname.replace(/[.#$\[\]\/]/g, '');
                nickInput.focus();
            }
            return; // Çökmesini önle
        }

        // KULLANICI ADI GÜVENLİK (REGISTRATION) KONTROLÜ
        let myDevId = localStorage.getItem('hafizaGuvenDeviceId');
        if (!myDevId) {
            myDevId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('hafizaGuvenDeviceId', myDevId);
        }

        window.db.ref('registeredUsers/' + nickname).once('value').then(snapshot => {
            const existingOwner = snapshot.val();
            
            // Eğer başkasına aitse durdur
            if (existingOwner && existingOwner !== myDevId) {
                if (window.wrongSound) window.wrongSound.play();
                let uyari = `"${nickname}" kullanıcı adı daha önce başkası tarafından alınmış. Lütfen farklı bir isim seçin.`;
                if (window.announceToScreenReader) window.announceToScreenReader(uyari);
                let desc = document.getElementById('chat-desc') || document.getElementById('sr-chat-reader');
                if (desc) desc.textContent = "Bağlantı Hatası: Kullanıcı adı kullanımda.";
                
                if (nickInput) {
                    nickInput.value = "";
                    nickInput.focus();
                }
                return;
            }

            // Yeni kullanıcı adı ise benim adıma kaydet
            if (!existingOwner) {
                window.db.ref('registeredUsers/' + nickname).set(myDevId);
            }

            // Artık nick bize ait. Uygulama hafızasına kalıcı kaydet.
            localStorage.setItem('chatUsername', nickname);
            window.currentChatUser = nickname;

            if (nickInput) {
                nickInput.style.display = 'none'; // Başarıyla kilitlendi, bir daha sorma
            }

            // --- GİZLİ SOHBET KOMUTLARI (CLIENT-SIDE) ---
            if (text.startsWith('/')) {
                const args = text.split(' ');
                const command = args[0].toLowerCase();
                const chatMessagesListLocal = document.getElementById('chat-messages');
            const chatMessagesContainerLocal = document.querySelector('.chat-messages-container');
            const chatMessageInputLocal = document.getElementById('chat-message-input');
            
            // Kullanıcı Geliştirici Mi Kontrolü
            let cUserNick = window.currentChatUser || "";
            let nickInputTemp = document.getElementById('chat-nickname');
            if (nickInputTemp && nickInputTemp.value.trim() !== "") cUserNick = nickInputTemp.value.trim();
            let isDev = ['ümit', 'umit', 'ümit ekrem mikyas', 'cengiz145'].includes(cUserNick.toLowerCase());

            function addLocalSystemMessage(msgText) {
                const li = document.createElement('li');
                li.classList.add('system-message');
                li.setAttribute('tabindex', '0');
                li.setAttribute('aria-label', `Sistem mesajı: ${escapeHTML(msgText)}`);
                li.innerHTML = `<div class="wp-bubble" aria-hidden="true">${escapeHTML(msgText)}</div>`;
                if (chatMessagesListLocal) chatMessagesListLocal.appendChild(li);
                
                if (chatMessagesContainerLocal) {
                    setTimeout(() => chatMessagesContainerLocal.scrollTop = chatMessagesContainerLocal.scrollHeight, 10);
                }
                if (window.announceToScreenReader) window.announceToScreenReader(msgText, false);
            }

            if (command === '/temizle') {
                if (!isDev) { addLocalSystemMessage("Hata: Bu işlem için 'Geliştirici' yetkiniz yok."); return; }
                if (chatMessagesListLocal) chatMessagesListLocal.innerHTML = '';
                addLocalSystemMessage("Sohbet geçmişiniz (sadece sizin ekranınızda) temizlendi.");
                
                // GİZLİ GLOBAL SIFIRLAMA KOMUTU
                if (window.db) {
                    window.db.ref('player_stats').remove();
                    window.db.ref('global_wipe_timestamp').set(firebase.database.ServerValue.TIMESTAMP);
                    addLocalSystemMessage("DİKKAT: Global Wipe (Küresel Sıfırlama) Komutu çalıştırıldı! Tüm oyuncuların istatistikleri ve Firebase bulut yedekleri siliniyor...");
                }
            } else if (command === '/saat' || command === '/zaman') {
                addLocalSystemMessage("Şu anki cihaz saati: " + new Date().toLocaleTimeString('tr-TR'));
            } else if (command === '/jeton' || command === '/bakiye') {
                const totalTokensLocal = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                addLocalSystemMessage(`Cüzdanınızdaki mevcut bakiye: ${totalTokensLocal} jeton.`);
            } else if (command === '/bilet') {
                if (isDev) {
                    addLocalSystemMessage("Sistemdeki tüm açık biletler (Geri bildirimler) taranıyor...");
                    if (window.db) {
                        window.db.ref('feedbacks').once('value').then(snapshot => {
                            if (!snapshot.exists() || !snapshot.hasChildren()) {
                                addLocalSystemMessage("Sistemde açık hiçbir bilet/geri bildirim bulunmuyor. Harika!");
                            } else {
                                let count = 0;
                                snapshot.forEach(child => {
                                    count++;
                                    let fb = child.val();
                                    addLocalSystemMessage(`Açık Bilet #${count} [Gönderen: ${fb.nickname}] => ${fb.message}`);
                                });
                                addLocalSystemMessage(`Toplam ${count} adet açık bilet listelendi. Yanıtlamak ve çözmek için: /çöz <takma_ad> <mesajınız>`);
                            }
                        });
                    }
                } else {
                    let currentUser = window.currentChatUser;
                    let nickInputValue = chatMessageInputLocal && document.getElementById('chat-nickname') ? document.getElementById('chat-nickname').value.trim() : "";
                    if (nickInputValue !== "") currentUser = nickInputValue;
                    
                    if (!currentUser || currentUser === "Misafir") {
                        addLocalSystemMessage("Biletlerinizi sorgulamak için bir takma ad belirlemiş olmanız gerekir.");
                    } else {
                        addLocalSystemMessage("Biletleriniz sorgulanıyor, lütfen bekleyin...");
                        if (window.db) {
                            let biletFound = false;
                            let count = 0;
                            
                            // 1. Henüz çözülmemiş, gönderilen açık biletleri kontrol et
                            window.db.ref('feedbacks').once('value').then(snapshot => {
                                if (snapshot.exists()) {
                                    snapshot.forEach(child => {
                                        let fb = child.val();
                                        if (fb.nickname && fb.nickname.toLowerCase() === currentUser.toLowerCase()) {
                                            count++;
                                            biletFound = true;
                                            addLocalSystemMessage(`Bilet #${count} | Durum: Geliştiriciye ulaştı, inceleniyor ⏳ | Şikayetiniz: ${fb.message}`);
                                        }
                                    });
                                }
                                
                                // 2. Çözülmüş veya yönetici tarafından yanıtlanmış biletleri kontrol et
                                window.db.ref('biletler/' + currentUser).once('value').then(snap2 => {
                                    if (snap2.exists() && snap2.hasChildren()) {
                                        snap2.forEach(child => {
                                            count++;
                                            biletFound = true;
                                            let biletData = child.val();
                                            let mesaj = typeof biletData === 'string' ? biletData : (biletData.message || biletData.mesaj || "Tanımsız");
                                            
                                            addLocalSystemMessage(`Bilet #${count} | Durum: Çözüldü ✅ (Otomatik silindi) | Geliştirici Yanıtı: ${mesaj}`);
                                            child.ref.remove(); // Okunduğu için sil
                                        });
                                    }
                                    
                                    if (!biletFound) {
                                        addLocalSystemMessage("Şu anda adınıza tanımlı açık veya yeni çözülmüş hiçbir bilet bulunamadı.");
                                    } else {
                                        addLocalSystemMessage(`Toplam ${count} adet bilet-kayıt listelendi.`);
                                    }
                                });
                            }).catch(err => {
                                addLocalSystemMessage("Bağlantı hatası: Bilet veritabanına ulaşılamadı.");
                            });
                        } else {
                            addLocalSystemMessage("Veritabanı bağlantısı yok.");
                        }
                    }
                }
            } else if (command === '/çöz' || command === '/coz') {
                if (!isDev) { addLocalSystemMessage("Hata: Bu işlem için 'Geliştirici' yetkiniz yok."); return; }
                if (args.length < 3) {
                    addLocalSystemMessage("Kullanım: /çöz <oyuncu_takma_adı> <yanıt_mesajınız>");
                } else {
                    let targetUser = args[1];
                    let replyMessage = args.slice(2).join(' ');
                    
                    if (window.db) {
                        // 1. Oyuncuya yanıtı ilet (Biletler kutusuna düşsün)
                        window.db.ref('biletler/' + targetUser).push({
                            durum: "çözüldü",
                            message: replyMessage,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        });
                        
                        // 2. Admin'in gelen kutusunu (feedbacks) temizle (Bu kişiden gelen tüm açık biletleri kapat)
                        window.db.ref('feedbacks').once('value').then(snapshot => {
                            if (snapshot.exists()) {
                                let deletedCount = 0;
                                snapshot.forEach(child => {
                                    let fb = child.val();
                                    if (fb.nickname && fb.nickname.toLowerCase() === targetUser.toLowerCase()) {
                                        child.ref.remove();
                                        deletedCount++;
                                    }
                                });
                                addLocalSystemMessage(`Başarılı: ${targetUser} adlı oyuncuya yanıtınız iletildi ve oyuncunun bekleyen ${deletedCount} adet açık bileti sistemden tamamen silinerek kapatıldı!`);
                            }
                        });
                    }
                }
            } else if (command === '/ban') {
                if (!isDev) { addLocalSystemMessage("Hata: Bu işlem için 'Geliştirici' yetkiniz yok."); return; }
                if (args.length < 2) {
                    addLocalSystemMessage("Kullanım: /ban <takma_ad>");
                } else {
                    let targetUser = args[1];
                    if (window.db) {
                        window.db.ref('banned_users/' + targetUser).set(true);
                        addLocalSystemMessage(`${targetUser} adlı oyuncu kalıcı olarak uzaklaştırıldı.`);
                    }
                }
            } else if (command === '/pm') {
                if (args.length < 3) {
                    addLocalSystemMessage("Kullanım: /pm <takma_ad> <mesajınız>");
                } else {
                    let targetUser = args[1];
                    let pmMessage = args.slice(2).join(' ');
                    let sender = window.currentChatUser;
                    let nickInputValue = chatMessageInputLocal && document.getElementById('chat-nickname') ? document.getElementById('chat-nickname').value.trim() : "";
                    if (nickInputValue !== "") sender = nickInputValue;
                    if (!sender || sender === "Misafir") sender = "Gizli Kullanıcı";
                    
                    if (window.db) {
                        window.db.ref('private_messages/' + targetUser).push({
                            from: sender,
                            text: pmMessage,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        });
                        addLocalSystemMessage(`[Siz -> ${targetUser}]: ${pmMessage}`);
                    }
                }
            } else if (command === '/unban') {
                if (!isDev) { addLocalSystemMessage("Hata: Bu işlem için 'Geliştirici' yetkiniz yok."); return; }
                if (args.length < 2) {
                    addLocalSystemMessage("Kullanım: /unban <takma_ad>");
                } else {
                    let targetUser = args[1];
                    if (window.db) {
                        window.db.ref('banned_users/' + targetUser).remove();
                        addLocalSystemMessage(`${targetUser} adlı oyuncunun yasağı başarıyla kaldırıldı.`);
                    }
                }
            } else if (command === '/yardim' || command === '/yardım') {
                addLocalSystemMessage("Mevcut komutlar: /temizle, /saat, /jeton, /bilet, /ban, /unban, /pm, /yardım.");
            } else {
                addLocalSystemMessage("Bilinmeyen komut. Komutları öğrenmek için /yardım yazabilirsiniz.");
            }

            if (chatMessageInputLocal) {
                chatMessageInputLocal.value = '';
                chatMessageInputLocal.focus();
            }
            return; // Firebase veritabanına göndermeden sadece oyuncunun ekranında çalıştır ve bitir!
        }

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
                // 50 Mesaj Kotası: Databasede 50 mesajdan fazlası varsa en eskilerini sil!
                window.db.ref('messages').once('value').then(snapshot => {
                    let total = snapshot.numChildren();
                    if (total > 50) {
                        let excessCount = total - 50;
                        let i = 0;
                        snapshot.forEach(child => {
                            if (i < excessCount) {
                                child.ref.remove();
                            }
                            i++;
                        });
                    }
                });

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
        }); // END OF registeredUsers Check
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
        if (!data) return;

        let mutedUsers = JSON.parse(localStorage.getItem('hafizaGuvenMutedUsers') || "[]");
        if (mutedUsers.includes(data.nickname)) return; // Sessize alınmış kişinin mesajını engelledik
        
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

        if (data.nickname === "Sistem") {
            // Sistem mesajlarını sohbet listesine (DOM'a) ekleme, anlık bildirim (toast) olarak yansıt
            if (Date.now() - chatLoadTime > 2000) {
                if (window.showToastNotification) {
                    window.showToastNotification(data.text);
                }
            }
        } else {
            const li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            
            // Rütbe Belirleme
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRender = ['ümit', 'umit', 'ümit ekrem mikyas', 'cengiz145'].includes(isimKucuk);
            let rutbe = isDevRender ? "Geliştirici" : "Oyuncu";
            
            // Benim gönderdiğim mesaj mı yoksa başkasının mı?
            const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
            li.classList.add(isMe ? 'message-out' : 'message-in');
            
            li.setAttribute('aria-label', `[${timeRaw}] ${rutbe} ${escapeHTML(data.nickname)}: ${escapeHTML(data.text)}`);
            
            // Whatsapp Görsel Balonu
            li.innerHTML = `
                <div class="wp-bubble" aria-hidden="true">
                    ${!isMe ? `<div class="wp-sender"><span style="color:${isDevRender ? '#ffaa00' : '#88acb8'}; font-size:0.85em;">[${rutbe}]</span> ${escapeHTML(data.nickname)}</div>` : `<div style="font-size: 0.75em; color:${isDevRender ? '#ffaa00' : '#9bbca1'}; margin-bottom: 3px;">[${rutbe}]</div>`}
                    <div class="wp-text">${escapeHTML(data.text)}</div>
                    ${timeString}
                </div>
            `;
            chatMessagesList.appendChild(li);
        }

        // Yeni mesaj gelince otomatik olarak en alta kaydır
        if (chatMessagesContainer && window.isChatOpen && data.nickname !== "Sistem") {
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
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRead = ['ümit', 'umit', 'ümit ekrem mikyas', 'cengiz145'].includes(isimKucuk);
            let rutbe = isDevRead ? "Geliştirici" : "Oyuncu";

            messageToRead = `${rutbe} ${data.nickname}: ${data.text}`;
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

// Oyuncu oyundan çıkarken/sayfa kapanırken tüm sohbeti kalıcı olarak sıfırla (0'la)
// KRİTİK HATA DÜZELTMESİ: remove() fonksiyonu herhangi bir kullanıcı oyundan çıktığında, 
// odayı kullanan TÜM diğer oyuncuların da canlı sohbet geçmişini veritabanından kalıcı olarak silmesine (wipe) yol açıyordu! 
// Bu nedenle küresel temizlik fonsiyonu iptal edildi.
// window.addEventListener('beforeunload', () => {
//     if (window.db) {
//         window.db.ref('messages').remove();
//     }
// });

// --- GÖREV 1 Kaldırıldı (Tab yönetimi game.js'deki exception'lar ile yapılıyor) ---

// --- ÖZEL MESAJLAŞMA (PRIVATE CHAT) VE KULLANICI İŞLEM MENÜSÜ ---
document.addEventListener('DOMContentLoaded', () => {
    const actionModal = document.getElementById('social-action-modal');
    const actionTitle = document.getElementById('social-action-title');
    const btnPm = document.getElementById('social-btn-pm');
    const btnMute = document.getElementById('social-btn-mute');
    const btnCancel = document.getElementById('social-btn-cancel');

    const privateChatPanel = document.getElementById('private-chat-panel');
    const privateChatTitle = document.getElementById('private-chat-title');
    const privateChatCloseBtn = document.getElementById('private-chat-close-btn');
    const privateChatMessages = document.getElementById('private-chat-messages');
    const privateChatMessageInput = document.getElementById('private-chat-message-input');
    const privateChatSendBtn = document.getElementById('private-chat-send-btn');

    let currentPrivateRecipient = null;
    let privateChatListenerRef = null;
    window.isPrivateChatOpen = false;

    const getMutedUsers = () => JSON.parse(localStorage.getItem('hafizaGuvenMutedUsers') || "[]");
    
    window.openSocialActionModal = function(playerName) {
        if (!playerName || !actionModal) return;
        window.selectedSocialPlayer = playerName;
        
        let isMuted = getMutedUsers().includes(playerName);

        if (actionTitle) actionTitle.innerText = playerName + " İşlemleri";
        if (btnMute) {
            btnMute.innerText = isMuted ? "Susturmayı Kaldır" : "Kullanıcıyı Sustur";
            btnMute.setAttribute('aria-label', isMuted ? "Kullanıcının susturmasını kaldır" : "Kullanıcıyı sustur");
        }

        if (window.menuEnterSound) window.menuEnterSound.play();
        actionModal.style.display = 'flex';
        actionModal.removeAttribute('aria-hidden');
        setTimeout(() => {
            actionModal.style.opacity = '1';
            window.previousMenuBeforeModal = window.currentActiveMenu;
            window.currentActiveMenu = 'social-action';
            window.currentFocusIndex = 0;
            if (btnPm) btnPm.focus();
            if (window.announceToScreenReader) {
                window.announceToScreenReader(playerName + " detayları açıldı. Özel mesaj gönderebilir veya susturabilirsiniz.", true);
            }
        }, 50);
    };

    window.closeSocialActionModal = function() {
        if (!actionModal) return;
        if (window.menuEnterSound) window.menuEnterSound.play();
        actionModal.style.opacity = '0';
        setTimeout(() => {
            actionModal.style.display = 'none';
            actionModal.setAttribute('aria-hidden', 'true');
            if (window.previousMenuBeforeModal) {
                window.currentActiveMenu = window.previousMenuBeforeModal;
                setTimeout(() => {
                    const mBtn = document.getElementById('nav-btn-social');
                    if (mBtn) mBtn.focus();
                }, 50);
            }
        }, 300);
    };

    if (btnCancel) btnCancel.addEventListener('click', window.closeSocialActionModal);

    if (btnMute) {
        btnMute.addEventListener('click', () => {
            if (!window.selectedSocialPlayer) return;
            let mutedUsers = getMutedUsers();
            let isMuted = mutedUsers.includes(window.selectedSocialPlayer);
            
            if (isMuted) {
                mutedUsers = mutedUsers.filter(u => u !== window.selectedSocialPlayer);
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " artık size mesaj gönderebilecek.");
                if (window.showToastNotification) window.showToastNotification(window.selectedSocialPlayer + " susturması kaldırıldı.");
            } else {
                mutedUsers.push(window.selectedSocialPlayer);
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " susturuldu. Hem özel hem global mesajları engellendi.");
                if (window.showToastNotification) window.showToastNotification(window.selectedSocialPlayer + " susturuldu.");
            }
            localStorage.setItem('hafizaGuvenMutedUsers', JSON.stringify(mutedUsers));
            window.closeSocialActionModal();
        });
    }

    if (btnPm) {
        btnPm.addEventListener('click', () => {
            window.closeSocialActionModal();
            setTimeout(() => {
                if (window.openPrivateChat) window.openPrivateChat(window.selectedSocialPlayer);
            }, 300);
        });
    }

    function getPrivateRoomId(user1, user2) { return [user1, user2].sort().join('_'); }

    window.openPrivateChat = function(recipientName) {
        if (!privateChatPanel || !recipientName) return;
        
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
        if (!myName || myName === "Misafir") {
            if (window.announceToScreenReader) window.announceToScreenReader("Özel mesajlaşmak için Küresel Sohbet menüsü üzerinden onaylı bir takma ad belirlemelisiniz.", true);
            if (window.showToastNotification) window.showToastNotification("Önce Sohbet'ten takma ad alın!");
            return;
        }

        currentPrivateRecipient = recipientName;
        window.isPrivateChatOpen = true;

        if (privateChatTitle) privateChatTitle.innerText = `${recipientName} ile Özel Sohbet`;
        
        if (privateChatListenerRef && window.db) privateChatListenerRef.off();

        privateChatMessages.innerHTML = '';
        privateChatPanel.style.display = 'flex';
        privateChatPanel.removeAttribute('aria-hidden');
        history.pushState({ modalOpen: 'private-chat' }, "");

        if (privateChatMessageInput) {
            privateChatMessageInput.disabled = false;
            privateChatSendBtn.disabled = false;
            setTimeout(() => privateChatMessageInput.focus(), 100);
        }
        
        let roomId = getPrivateRoomId(myName, currentPrivateRecipient);
        privateChatListenerRef = window.db.ref(`privateChats/${roomId}`);

        if (window.menuEnterSound) window.menuEnterSound.play();

        privateChatListenerRef.on('child_added', (snapshot) => {
            let msg = snapshot.val();
            if (!msg) return;
            
            let isMe = (msg.sender === myName);
            if (!isMe && getMutedUsers().includes(msg.sender)) return;

            let li = document.createElement('li');
            li.tabIndex = 0;
            li.style.marginBottom = '10px';
            li.style.padding = '8px';
            li.style.borderRadius = '8px';
            li.style.backgroundColor = isMe ? 'rgba(255, 183, 3, 0.1)' : 'rgba(0, 168, 132, 0.1)';
            li.style.borderLeft = isMe ? '4px solid #ffb703' : '4px solid #00a884';
            
            let color = isMe ? '#ffb703' : '#00a884';
            
            // XSS Protection
            const sanitize = window.sanitizeHTML || (str => str ? str.toString().replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t)) : '');

            li.innerHTML = `<strong style="color: ${color};">${sanitize(msg.sender)}:</strong> ${sanitize(msg.text)}`;
            li.setAttribute('aria-label', `${msg.sender}: ${msg.text}`);
            privateChatMessages.appendChild(li);
            
            const pContainer = document.querySelector('#private-chat-panel .chat-messages-container');
            if (pContainer) pContainer.scrollTop = pContainer.scrollHeight;
            
            if (!isMe && window.isPrivateChatOpen) {
                if (window.chatReceiveSound) window.chatReceiveSound.play();
                const liveAnnouncer = document.getElementById('sr-chat-reader');
                if (liveAnnouncer) {
                    liveAnnouncer.innerText = `Özel mesaj: ${msg.sender} ${msg.text} yazdı.`;
                }
            }
        });
    };

    window.closePrivateChat = function() {
        if (!privateChatPanel) return;
        window.isPrivateChatOpen = false;
        privateChatPanel.style.display = 'none';
        privateChatPanel.setAttribute('aria-hidden', 'true');
        if (privateChatListenerRef) {
            privateChatListenerRef.off();
            privateChatListenerRef = null;
        }
        currentPrivateRecipient = null;
        if (window.menuEnterSound) window.menuEnterSound.play();
    };

    if (privateChatCloseBtn) privateChatCloseBtn.addEventListener('click', window.closePrivateChat);

    const sendPrivateMessage = () => {
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
        if (!myName || !window.db || !privateChatMessageInput || !currentPrivateRecipient) return;

        let text = privateChatMessageInput.value.trim();
        if (text.length > 0) {
            if (text.length > 150) text = text.substring(0, 150);

            let roomId = getPrivateRoomId(myName, currentPrivateRecipient);
            window.db.ref(`privateChats/${roomId}`).push({
                sender: myName,
                text: text,
                time: firebase.database.ServerValue.TIMESTAMP
            });

            window.db.ref(`inbox/${currentPrivateRecipient}`).push({
                from: myName,
                time: firebase.database.ServerValue.TIMESTAMP
            });

            privateChatMessageInput.value = '';
            privateChatMessageInput.focus();
        }
    };

    if (privateChatSendBtn) privateChatSendBtn.addEventListener('click', sendPrivateMessage);
    if (privateChatMessageInput) {
        privateChatMessageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); sendPrivateMessage(); }
        });
    }

    const initInboxListener = () => {
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
        if (!myName || !window.db || myName === "Misafir") return;
        
        let initialInboxLoad = true;
        window.db.ref(`inbox/${myName}`).on('child_added', (snapshot) => {
            let notif = snapshot.val();
            if (!notif) return;

            if (!initialInboxLoad) {
                if (!getMutedUsers().includes(notif.from)) {
                    if (!window.isPrivateChatOpen || currentPrivateRecipient !== notif.from) {
                        if (window.chatReceiveSound) window.chatReceiveSound.play();
                        if (window.showToastNotification) window.showToastNotification(`💬 ${notif.from} size bir özel mesaj gönderdi.`);
                        if (window.announceToScreenReader) window.announceToScreenReader(`${notif.from} kullanıcısından yeni bir özel mesajınız var. Sosyal sekmesinden veya ona tıklayarak ulaşabilirsiniz.`);
                    }
                }
            }
            snapshot.ref.remove(); 
        });

        setTimeout(() => { initialInboxLoad = false; }, 2000);
    };

    setTimeout(() => {
        if(window.db) initInboxListener();
    }, 2500);
});

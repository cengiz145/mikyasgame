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
    else if (window.currentActiveMenu === 'play-mode') buttons = Array.from(document.getElementById('play-mode-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'multiplayer-select') buttons = Array.from(document.getElementById('multiplayer-select-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'update') buttons = Array.from(window.updateMenu.querySelectorAll('.menu-button'));

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

    document.body.classList.remove('show-mobile-keys', 'show-mobile-enter');

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
        keys[4].textContent = '---'; keys[4].setAttribute('aria-label', 'Devre Dışı'); keys[4].disabled = true;
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
            }, 50);
        }, 50);
    }, 300);

    if (newActiveMenuName === 'main' && window.pendingUpdate === true) {
        window.guncellemeKontrolEt(false); // Bekleyen güncellemeyi şimdi ekrana bas
    }
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

            // Ekran okuyucuların aynı metni tekrar okuması için içeriği anlık olarak temizle ve yeniden bas
            liveAnnouncer.textContent = ''; 
            setTimeout(() => {
                liveAnnouncer.textContent = text;
            }, 50);

            // Yeni zamanlayıcıyı kur ve hafızaya kaydet
            let tId = setTimeout(() => {
                liveAnnouncer.textContent = '';
            }, 10000);
            window.announcerTimeouts.push(tId);
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

    if (gameBackBtn) {
        gameBackBtn.addEventListener('click', () => {
            if (window.clickSound) window.clickSound.play();
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
            if (window.announceToScreenReader) window.announceToScreenReader("Güncelleme yükleniyor, sayfa yenilenecek...");
            setTimeout(() => {
                window.location.href = window.location.pathname + "?v=" + new Date().getTime();
            }, 1000);
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
            window.lastFocusedElement = document.activeElement;
            window.switchMenu(window.mainMenu, window.storeMenu, 'store');
            document.getElementById('main-menu-container').setAttribute('aria-hidden', 'true');
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            if (window.announceToScreenReader) window.announceToScreenReader(`Mağazaya hoş geldiniz. Mevcut jetonunuz: ${totalTokens}`);
        });
        storeBackBtn.addEventListener('click', () => {
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

    const playModeMenuDOM = document.getElementById('play-mode-menu-container');
    const offlinePlayBtn = document.getElementById('offline-play-btn');
    const multiplayerPlayBtn = document.getElementById('multiplayer-play-btn');
    const playModeBackBtn = document.getElementById('play-mode-back-btn');
    if (!window.playModeMenu) window.playModeMenu = playModeMenuDOM;

    const mpSelectMenuDOM = document.getElementById('multiplayer-select-menu-container');
    const pvpPlayBtn = document.getElementById('pvp-play-btn');
    const pveBotPlayBtn = document.getElementById('pve-bot-play-btn');
    const mpSelectBackBtn = document.getElementById('multiplayer-select-back-btn');
    if (!window.multiplayerSelectMenu) window.multiplayerSelectMenu = mpSelectMenuDOM;

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

    if (pvpPlayBtn) {
        pvpPlayBtn.addEventListener('click', () => {
            if (window.PvP) {
                if (window.PvP.isSearching && !window.PvP.isBotMode) {
                    window.PvP.cancelQueue();
                } else if (!window.PvP.isSearching) {
                    window.PvP.joinQueue();
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
            'multiplayer-select': 'multiplayer-select-back-btn'
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
        'stats': 'stats-back-btn'
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
        return;
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

    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Enter'].includes(event.key)) {
        // Ok tuşlarıyla mesajı tekrar okuma ve Enter ile sessizce geçme mantığı
        if ((window.currentActiveMenu === 'story' && window.isDialogPhase) ||
            (window.currentActiveMenu === 'practice' && window.isDialogPhase) ||
            window.currentActiveMenu === 'server-message' ||
            window.currentActiveMenu === 'update') {
            
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
            }

            if (textToRead && window.announceToScreenReader) {
                window.announceToScreenReader(textToRead);
            }
            return;
        }

        if (event.key === 'Enter') return; // Sadece ok tuşlarını menü gezinmesine bırak

        const activeButtons = window.getActiveButtons();
        if (activeButtons.length === 0) return;

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

// --- GÖREV 1: KATI TAB TUŞU YASAKLAMASI (SIKIYÖNETİM) ---
document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && activeTag !== 'SELECT') {
            event.preventDefault(); // Varsayılan sekmeyi felç et
        }
    }
}, true); // Yakalama (capture) evresinde, diğer tüm script'lerden önce tetiklenir

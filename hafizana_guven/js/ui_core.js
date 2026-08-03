// ui.js - Kullanıcı Arayüzü, Mobil Tespit ve Ekran Okuyucu Fonksiyonları

// Mobil Cihaz Tespiti
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
window.isMobileDevice = isMobile;



window.isWeekendDoubleCoins = function() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    // Cumartesi (6) 12:00'dan itibaren, Pazar (0) tüm gün (23:59'a kadar)
    if (day === 6 && hour >= 12) return true;
    if (day === 0) return true;
    return false;
};

window.milestones = [
    { day: 7, reward: 50 },
    { day: 14, reward: 100 },
    { day: 21, reward: 150 },
    { day: 30, reward: 300 },
    { day: 60, reward: 600 },
    { day: 80, reward: 1000 },
    { day: 100, reward: 2000 }
];

window.getNextMilestone = function(streak) {
    for (let m of window.milestones) {
        if (streak < m.day) return m;
    }
    return null; // Eğer hepsini geçtiyse
};

window.checkDailyStreak = function() {
    const now = new Date();
    const todayStr = now.toDateString();
    const lastLoginStr = localStorage.getItem('hafizaGuvenLastLoginDate');
    let streak = parseInt(localStorage.getItem('hafizaGuvenLoginStreak')) || 0;
    let buzsuzGun = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0;
    
    if (lastLoginStr !== todayStr) {
        if (lastLoginStr) {
            const lastLoginDate = new Date(lastLoginStr);
            const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastMidnight = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
            const daysPassed = Math.round((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));
            
            if (daysPassed === 1) {
                streak += 1;
                buzsuzGun += 1;
                window.pendingDailyRewardMsg = `Seri ${streak}. gün! ${streak * 10} jeton kazandınız.`;
            } else if (daysPassed > 1) {
                let daysMissed = daysPassed - 1;
                let freezeCount = parseInt(localStorage.getItem('hafizaGuvenSeriDondurma')) || 0;
                
                if (freezeCount >= daysMissed) {
                    freezeCount -= daysMissed;
                    localStorage.setItem('hafizaGuvenSeriDondurma', freezeCount);
                    streak += 1; // Seri kurtarıldı, bugünün girişiyle artıyor
                    buzsuzGun = 1; // Seri dondurma kullanıldığı için buzsuz serisi kırıldı, bugünden başlar
                    window.pendingDailyRewardMsg = `${daysMissed} gün oyuna girmediniz ancak Seri Dondurma kullanıldı. Seriniz bozulmadı! Güncel seri: ${streak}. gün. ${streak * 10} jeton kazandınız. Kalan dondurma: ${freezeCount} adet.`;
                } else {
                    if (freezeCount > 0) {
                        freezeCount = 0; // Hepsini kullandı ama yetmedi
                        localStorage.setItem('hafizaGuvenSeriDondurma', freezeCount);
                    }
                    window.pendingDailyRewardMsg = `Maalesef yeterli Seri Dondurmanız olmadığı için günlük seriniz 0'landı! Kaybetmeden önce ${streak}. güne ulaşmıştınız. Bugünden itibaren seriniz tekrar 1. günden başlıyor. 10 jeton kazandınız.`;
                    streak = 1;
                    buzsuzGun = 1;
                }
            }
        } else {
            streak = 1;
            buzsuzGun = 1;
            window.pendingDailyRewardMsg = `Oyuna hoş geldiniz! İlk gününüz. 10 jeton kazandınız.`;
        }
        
        localStorage.setItem('hafizaGuvenLastLoginDate', todayStr);
        localStorage.setItem('hafizaGuvenLoginStreak', streak);
        localStorage.setItem('hafizaGuvenBuzsuzGun', buzsuzGun);
        
        // BAÃ…ÂARI KONTROLÜ (Buzsuz 3 Gün)
        if (!window.userAchievements) window.userAchievements = JSON.parse(localStorage.getItem('hafizaGuvenAchievements') || "{}");
        if (buzsuzGun >= 3 && !window.userAchievements.buzsuz_3_gun) {
            window.userAchievements.buzsuz_3_gun = true;
            try { localStorage.setItem('hafizaGuvenAchievements', JSON.stringify(window.userAchievements)); } catch(e){}
            setTimeout(() => {
                if (window.achievementSound) window.achievementSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Yeni Bir Başarım Kazandınız! Sadık Oyuncu: 3 Gün boyunca seri dondurma kullanmadan oyuna girdiniz.");
                setTimeout(() => {
                    if (window.showAchievementModal) window.showAchievementModal("Sadık Oyuncu");
                }, 3000);
            }, 6000);
        }
        
        let reward = streak * 10;
        if (reward > 100) reward = 100; // max 100 jeton (etkinlik hariç)
        
        let milestoneReward = 0;
        const currentMilestone = window.milestones.find(m => m.day === streak);
        if (currentMilestone) {
            milestoneReward = currentMilestone.reward;
            reward += milestoneReward;
            window.pendingDailyRewardMsg += ` İnanılmaz! ${streak}. gün dönüm noktasına ulaştığınız için özel olarak ${milestoneReward} ekstra jeton BONUS kazandınız! Toplam kazanç: ${reward} jeton.`;
        }
        
        if (window.isWeekendDoubleCoins()) {
            reward *= 2;
            window.pendingDailyRewardMsg += ` Hafta sonu çift jeton etkinliği aktif olduğu için kazancınız 2'ye katlandı ve ${reward} jeton kazandınız!`;
        }
        
        let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
        totalTokens += reward;
        try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch(e){}
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.checkDailyStreak();
    
    // Güncelleme butonu artık pasif olduğu için tıklama olayı kaldırıldı.
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
window.dailyRewardMenu = document.getElementById('daily-reward-container');
window.firstTimeTutorialMenu = document.getElementById('first-time-tutorial-container');
window.updateMenu = document.getElementById('update-menu-container');
window.achievementsMenu = document.getElementById('achievements-menu-container');
window.gameMenu = document.getElementById('game-menu-container');
window.storyMenu = document.getElementById('story-menu-container');
window.profileMenu = document.getElementById('profile-menu-container');
window.savedGamesMenu = document.getElementById('saved-games-menu-container');
window.socialMenu = document.getElementById('social-menu-container');
window.pvpLobbyMenu = document.getElementById('pvp-lobby-menu-container');
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
    else if (window.currentActiveMenu === 'stats') buttons = Array.from(window.statsMenu.querySelectorAll('.stat-item, .stat-copy-btn, .menu-button'));
    else if (window.currentActiveMenu === 'store') buttons = Array.from(window.storeMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'achievements') buttons = Array.from(window.achievementsMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'feedback') buttons = Array.from(window.feedbackMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'server-message') buttons = Array.from(window.serverMessageMenu.querySelectorAll('div[tabindex="0"], .menu-button'));
    else if (window.currentActiveMenu === 'daily-reward') buttons = Array.from(window.dailyRewardMenu.querySelectorAll('div[tabindex="0"], .menu-button'));
    else if (window.currentActiveMenu === 'first-time-tutorial') buttons = Array.from(window.firstTimeTutorialMenu.querySelectorAll('div[tabindex="0"], .menu-button'));
    else if (window.currentActiveMenu === 'update') buttons = Array.from(window.updateMenu.querySelectorAll('div[tabindex="0"], .menu-button'));
    else if (window.currentActiveMenu === 'game') buttons = Array.from(window.gameMenu.querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'profile') buttons = Array.from(window.profileMenu.querySelectorAll('.stat-item, .stat-copy-btn, .menu-button'));
    else if (window.currentActiveMenu === 'saved-games') buttons = Array.from(window.savedGamesMenu.querySelectorAll('li[tabindex="0"], .menu-button'));
    else if (window.currentActiveMenu === 'social') buttons = Array.from(window.socialMenu.querySelectorAll('li[tabindex="0"], .menu-button'));
    else if (window.currentActiveMenu === 'social-action') buttons = Array.from(document.getElementById('social-action-modal') ? document.getElementById('social-action-modal').querySelectorAll('.menu-button') : []);
    else if (window.currentActiveMenu === 'play-mode') buttons = Array.from(document.getElementById('play-mode-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'multiplayer-select') buttons = Array.from(document.getElementById('multiplayer-select-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'pvp-rooms') buttons = Array.from(document.getElementById('pvp-rooms-menu-container').querySelectorAll('.menu-button'));
    else if (window.currentActiveMenu === 'pvp-lobby') buttons = Array.from(document.getElementById('pvp-lobby-menu-container').querySelectorAll('.menu-button'));
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
        keys[5].setAttribute('data-key', 't'); keys[5].textContent = 'Süre'; keys[5].setAttribute('aria-label', 'Süreyi Sorgula'); keys[5].disabled = false;
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

    if (newActiveMenuName === 'main' && window.updateInstrumentBtnText) {
        window.updateInstrumentBtnText();
    }

    window.isMenuTransitioning = true;
    
    // Güvenlik Subabı (Failsafe): Ne olursa olsun 1.5 saniye sonra geçiş kilidini aç (boşa düşmeyi engeller)
    if (window.menuFailsafeTimeoutId) clearTimeout(window.menuFailsafeTimeoutId);
    window.menuFailsafeTimeoutId = setTimeout(() => {
        window.isMenuTransitioning = false;
    }, 600);

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

    // ARAYÜZ VE EKRAN OKUYUCU (NVDA) ÇAKIÃ…ÂMA ENGELLEYİCİSİ:
    // Animasyon (300ms) süresince NVDA'nın her iki menüyü de okumasını (Ghosting) engellemek için anında gizleriz.
    hideMenu.setAttribute('aria-hidden', 'true');
    hideMenu.setAttribute('inert', ''); // NVDA ve diğer araçların içeriğe erişimini kökünden keser
    
    let oldFocusables = hideMenu.querySelectorAll('button, [tabindex="0"], input, textarea');
    oldFocusables.forEach(el => el.setAttribute('tabindex', '-1'));

    hideMenu.style.opacity = '0';

    setTimeout(() => {
        hideMenu.style.display = 'none';
        
        // Sonradan menüye dönüldüğünde butonlar çalışsın diye geçici tabindex engelini kaldırıyoruz
        oldFocusables.forEach(el => el.removeAttribute('tabindex'));

        showMenu.style.display = 'flex';
        showMenu.removeAttribute('aria-hidden');
        showMenu.removeAttribute('inert');

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

    let globalAnnouncer = document.getElementById('global-sr-announcer');
    if (!globalAnnouncer) {
        globalAnnouncer = document.createElement('div');
        globalAnnouncer.id = 'global-sr-announcer';
        globalAnnouncer.className = 'sr-only';
        globalAnnouncer.setAttribute('aria-live', 'assertive');
        globalAnnouncer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(globalAnnouncer);
    }
    
    globalAnnouncer.textContent = "";
    setTimeout(() => {
        globalAnnouncer.textContent = text;
    }, 50);
};

window.updateButtonUI = function (btnElement, modeData, unlockedLabel, lockReason) {
    if (!btnElement) return;

    let targetTurns = 5;
    if(modeData.name === 'Kolay') targetTurns = 5;
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
        btnElement.innerHTML = displayName + " ğÅ¸â€â€™";
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
    if (window.gameModes.missing_notes.completionCount >= window.gameModes.rhythm_mode.requiredToUnlock) {
        window.gameModes.rhythm_mode.isUnlocked = true;
    }

    const btnMedium = document.getElementById('btn-score-medium');
    const btnHard = document.getElementById('btn-score-hard');
    const btnMissingNotes = document.getElementById('btn-score-missing-notes');
    const btnRhythmScore = document.getElementById('btn-score-rhythm');

    window.updateButtonUI(btnMedium, window.gameModes.medium, "Orta moddaki en yüksek skoru görüntüle", "Kolay modu 5 kez tamamla");
    window.updateButtonUI(btnHard, window.gameModes.hard, "Zor moddaki yüksek skoru görüntüle", "Orta modu 5 kez tamamla");
    window.updateButtonUI(btnMissingNotes, window.gameModes.missing_notes, "Kayıp notalar modu için yüksek skoru görüntüle", "Zor modu 5 kez tamamla");
    if (btnRhythmScore) window.updateButtonUI(btnRhythmScore, window.gameModes.rhythm_mode, "Ritim Avcısı için yüksek skoru görüntüle", "Kayıp Notalar modunu tamamla");
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
    if (window.gameModes.missing_notes.completionCount >= window.gameModes.rhythm_mode.requiredToUnlock) {
        window.gameModes.rhythm_mode.isUnlocked = true;
    }

    const btnEasy = document.getElementById('btn-diff-easy');
    const btnMedium = document.getElementById('btn-diff-medium');
    const liMedium = document.getElementById('li-diff-medium');
    const btnHard = document.getElementById('btn-diff-hard');
    const liHard = document.getElementById('li-diff-hard');
    const btnMissingNotes = document.getElementById('btn-diff-missing-notes');
    const liMissingNotes = document.getElementById('li-diff-missing-notes');
    const btnRhythm = document.getElementById('btn-diff-rhythm');

    if (liMedium) liMedium.style.display = 'block';
    if (liHard) liHard.style.display = 'block';
    if (liMissingNotes) liMissingNotes.style.display = 'block';

    if (btnEasy) window.updateButtonUI(btnEasy, window.gameModes.easy, "Kolay Modu Oyna", "");
    window.updateButtonUI(btnMedium, window.gameModes.medium, "Orta Modu Oyna", "Kolay modu 5 kez tamamla");
    window.updateButtonUI(btnHard, window.gameModes.hard, "Zor Modu Oyna", "Orta modu 5 kez tamamla");
    window.updateButtonUI(btnMissingNotes, window.gameModes.missing_notes, "Kayıp Notalar Modu. Hikayeli piyano modu.", "Zor modu 5 kez tamamla");
    if (btnRhythm) window.updateButtonUI(btnRhythm, window.gameModes.rhythm_mode, "Ritim Avcısı Oyna. Metronom eşliğinde çal.", "Kayıp Notalar modunu tamamla");
};

window.updateStatsDisplay = function() {
    let tokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
    let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
    let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
    
    let easyCount = (window.gameModes && window.gameModes.easy) ? window.gameModes.easy.completionCount : 0;
    let mediumCount = (window.gameModes && window.gameModes.medium) ? window.gameModes.medium.completionCount : 0;
    let hardCount = (window.gameModes && window.gameModes.hard) ? window.gameModes.hard.completionCount : 0;
    let storyCount = (window.gameModes && window.gameModes.missing_notes) ? window.gameModes.missing_notes.completionCount : 0;
    let rhythmCount = (window.gameModes && window.gameModes.rhythm_mode) ? window.gameModes.rhythm_mode.completionCount : 0;

    let rank = "Oyuncu";

    let r_el = document.getElementById('profile-player-rank');
    if (r_el) r_el.innerText = rank;
    
    let streakCount = parseInt(localStorage.getItem('hafizaGuvenLoginStreak')) || 0;
    let sdCount = parseInt(localStorage.getItem('hafizaGuvenSeriDondurma')) || 0;

    let nextM = window.getNextMilestone(streakCount);
    let milestoneHtml = "";
    if (nextM) {
        let diff = nextM.day - streakCount;
        milestoneHtml = `<li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px; color: #ffb703; font-weight: bold;" aria-label="Sonraki dönüm noktasına ${diff} gün kaldı. Hedef: ${nextM.day}. gün. Ödül: ${nextM.reward} Jeton">Hedef: ${nextM.day}. gün! Kalan: ${diff} gün. (Ödül: ${nextM.reward} Jeton)</li>`;
    }

    let achievementsHtml = "";
    let userAch = window.userAchievements;
    if (!userAch) {
        try {
            userAch = JSON.parse(localStorage.getItem('hafizaGuvenAchievements') || "{}");
        } catch(e) {
            userAch = {};
        }
    }
    let earnedAch = [];
    if (userAch && userAch.hafizam_gucleniyor) earnedAch.push("âœ… Hafızam Güçleniyor");
    if (userAch && userAch.buzsuz_3_gun) earnedAch.push("âœ… Sadık Oyuncu");
    
    if (earnedAch.length > 0) {
        achievementsHtml = `<li style="margin-top: 15px; font-weight: bold; color: #4ade80;">Kazanılan Başarımlar:</li>`;
        earnedAch.forEach(ach => {
            achievementsHtml += `<li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px; color: #4ade80;" aria-label="Kazanıldı: ${ach.replace('âœ… ', '')}">${ach}</li>`;
        });
    } else {
        achievementsHtml = `<li style="margin-top: 15px; font-weight: bold; color: #cbd5e1;">Kazanılan Başarımlar:</li>`;
        achievementsHtml += `<li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px; color: #cbd5e1;" aria-label="Henüz kazandığınız bir başarı yok.">Henüz kazandığınız bir başarı yok.</li>`;
    }

    let html = "";
    if (tokens === 0 && hk === 0 && zk === 0 && easyCount === 0 && mediumCount === 0 && hardCount === 0 && storyCount === 0 && earnedAch.length === 0) {
        html = '<div id="empty-stats-alert" tabindex="0" role="textbox" aria-readonly="true" aria-label="İstatistik sekmesi boş. Hiç bir istatistiğe sahip değilsiniz." style="color: #ff4444; font-weight: bold; margin-top: 10px; padding: 15px; border: 2px solid #ff4444; border-radius: 8px; text-align: center; background: rgba(255,68,68,0.1);">Bu sekme boş. İstatistik bulunamadı.</div>';
        if (window.announceToScreenReader && window.currentActiveMenu === 'stats') {
            setTimeout(() => window.announceToScreenReader("Bu sekme boş. Henüz hiç bir istatistiğiniz bulunmuyor."), 300);
        }
    } else {
        html = `
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px;" class="stats-list">
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Bakiye: ${tokens} Jeton">Bakiye: ${tokens} Jeton</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Günlük Seri Takvimi: ${streakCount} Gün">Günlük Seri (Takvim): ${streakCount} Gün</li>
                ${milestoneHtml}
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Seri Dondurma: ${sdCount} adet">Seri Dondurma: ${sdCount} adet</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Hata Koruması: ${hk} adet">Hata Koruması: ${hk} adet</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Zaman Koruması: ${zk} adet">Zaman Koruması: ${zk} adet</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Kolay Mod: ${easyCount} kez tamamlandı">Kolay Mod: ${easyCount} kez tamamlandı</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Orta Mod: ${mediumCount} kez tamamlandı">Orta Mod: ${mediumCount} kez tamamlandı</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Zor Mod: ${hardCount} kez tamamlandı">Zor Mod: ${hardCount} kez tamamlandı</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Kayıp Notalar: ${storyCount} kez tamamlandı">Kayıp Notalar: ${storyCount} kez tamamlandı</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Ritim Avcısı: En Yüksek Seviye ${rhythmCount}">Ritim Avcısı: En Yüksek Seviye ${rhythmCount}</li>
                ${achievementsHtml}
                <li style="margin-top: 15px;">
                    <button class="menu-button stat-copy-btn" aria-label="İstatistiklerimi Kopyala">İstatistiklerimi Kopyala</button>
                </li>
            </ul>
        `;
    }

    const statsContent = document.getElementById('stats-content');
    const profileStatsContent = document.getElementById('profile-stats-content');

    if (statsContent) statsContent.innerHTML = html;
    if (profileStatsContent) profileStatsContent.innerHTML = html;
    
    // Kopyalama butonu işlevini ata
    document.querySelectorAll('.stat-copy-btn').forEach(btn => {
        btn.onclick = function() {
            let copyText = `Hafızana Güven - Oyuncu İstatistikleri\r\nBakiye: ${tokens} Jeton\r\nGünlük Seri: ${streakCount} Gün\r\nSeri Dondurma: ${sdCount}\r\nHata Koruması: ${hk}\r\nZaman Koruması: ${zk}\r\nKolay: ${easyCount}\r\nOrta: ${mediumCount}\r\nZor: ${hardCount}\r\nKayıp Notalar: ${storyCount}\r\nRitim Avcısı: En Yüksek Seviye ${rhythmCount}`;
            navigator.clipboard.writeText(copyText).then(() => {
                if (window.announceToScreenReader) window.announceToScreenReader("İstatistikleriniz panoya kopyalandı.", true);
                if (window.correctSound) window.correctSound.play();
            }).catch(() => {
                if (window.announceToScreenReader) window.announceToScreenReader("Kopyalama başarısız oldu.", true);
                if (window.wrongSound) window.wrongSound.play();
            });
        };
    });
};

// --- EVENTS ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Erişilebilirlik (ARIA) Dinamik Enjektörü (Sessiz Semantik / Role Gizleme) ---
    // Kullanıcı talebi: bölüm, bölge, düğme, grup gibi element rollerinin okunmaması.
    const applySilentRoles = (root) => {
        const elementsToNone = root.querySelectorAll ? root.querySelectorAll('.menu-container, nav, section, ul, div[role="group"], div[role="region"], div[role="presentation"], h1, h2, h3, h4, h5, h6') : [];
        elementsToNone.forEach(el => el.setAttribute('role', 'none'));

        // Yalnızca tabindex'i olmayan li elemanlarının rolünü none yap.
        const nonInteractiveLis = root.querySelectorAll ? root.querySelectorAll('li:not([tabindex="0"])') : [];
        nonInteractiveLis.forEach(el => el.setAttribute('role', 'none'));

        // NVDA'nın makale okur gibi takılmaması için etkileşimli her öğeye buton maskesi tak
        const buttonsToSilence = root.querySelectorAll ? root.querySelectorAll('button, .menu-button, .mobile-piano-key, [role="button"], li[tabindex="0"], div[tabindex="0"]') : [];
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
                        if (node.tagName === 'BUTTON' || node.getAttribute('role') === 'button' || node.tagName === 'LI') {
                            if (node.tagName === 'LI' && node.getAttribute('tabindex') !== "0") {
                                node.setAttribute('role', 'none');
                            } else if (node.getAttribute('tabindex') === "0" || node.tagName === 'BUTTON') {
                                node.setAttribute('role', 'button');
                                node.setAttribute('aria-roledescription', '\xA0');
                            }
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
    const buyStreakFreezeBtn = document.getElementById('buy-streak-freeze-btn');
    const buyBaglamaPackBtn = document.getElementById('buy-baglama-pack-btn');
    const buyKavalPackBtn = document.getElementById('buy-kaval-pack-btn');
    const buyFlutPackBtn = document.getElementById('buy-flut-pack-btn');
    const buyKanunPackBtn = document.getElementById('buy-kanun-pack-btn');

    const startGameBtn = document.getElementById('start-game-btn');
    const btnRestartGame = document.getElementById('btn-restart-game');
    const gameBackBtn = document.getElementById('game-back-btn');
    
    if (btnRestartGame) {
        btnRestartGame.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Oyun yeniden başlatılıyor, lütfen bekleyin...");
            
            // Arka plan kullanıcı verilerini (sessionStorage ve cache) temizle, oyuncu verilerini (localStorage) KORU.
            sessionStorage.clear();
            
            if ('caches' in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => {
                        caches.delete(name);
                    });
                });
            }

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                        registration.unregister();
                    }
                });
            }

            setTimeout(() => {
                window.location.reload(true);
            }, 500);
        });
    }

    const btnChangeInst = document.getElementById('btn-change-instrument');
    window.updateInstrumentBtnText = function() {
        if (btnChangeInst) {
            let instMap = {
                'piano': 'Piyano',
                'baglama': 'Bağlama',
                'kaval': 'Kaval',
                'flut': 'Flüt',
                'kanun': 'Kanun'
            };
            let curr = window.activeInstrument || localStorage.getItem('hafizaGuvenInstrument') || 'piano';
            let n = instMap[curr] || 'Piyano';
            btnChangeInst.innerText = "Ses Paketini Değiştir (" + n + ")";
            btnChangeInst.setAttribute('aria-label', "Ses paketini değiştirmek için tıklayın. Geçerli paket: " + n);
            
            let packsUnlocked = localStorage.getItem('hafizaGuvenSoundPacksUnlocked') === 'true';
            
            const liChangeInst = document.getElementById('li-change-instrument');
            if (liChangeInst) {
                liChangeInst.style.display = packsUnlocked ? 'block' : 'none';
            } else {
                btnChangeInst.style.display = packsUnlocked ? 'inline-block' : 'none';
            }
        }
    };

    if (btnChangeInst) {
        window.updateInstrumentBtnText();
        btnChangeInst.addEventListener('click', () => {
            let owned = ['piano'];
            if (localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') owned.push('baglama');
            if (localStorage.getItem('hafizaGuvenKavalPack') === 'true') owned.push('kaval');
            if (localStorage.getItem('hafizaGuvenFlutPack') === 'true') owned.push('flut');
            if (localStorage.getItem('hafizaGuvenKanunPack') === 'true') owned.push('kanun');

            let current = window.activeInstrument || localStorage.getItem('hafizaGuvenInstrument') || 'piano';
            let idx = owned.indexOf(current);
            if (idx === -1) idx = 0;
            idx = (idx + 1) % owned.length;
            let nextInst = owned[idx];

            let wasPlaying = (window.bgMusic && window.bgMusic.playing());
            if (window.bgMusic) window.bgMusic.stop();
            localStorage.setItem('hafizaGuvenInstrument', nextInst);
            window.activeInstrument = nextInst;
            
            // Yeni seçilen ses paketinin arka plan müziğine kullanıcının ses seviyesini uygula
            if (window.setMusicVolume) {
                let savedVol = localStorage.getItem('hafizaGuvenMusicVolume');
                if (savedVol !== null) {
                    window.setMusicVolume(savedVol);
                }
            }

            if (wasPlaying && window.bgMusic) window.bgMusic.play();

            window.updateInstrumentBtnText();
            let n = btnChangeInst.innerText.match(/\((.*?)\)/)[1];

            const updateStoreBtn = (id, key, inst, instName) => {
                const b = document.getElementById(id);
                if (b && localStorage.getItem(key) === 'true') {
                    b.innerText = (nextInst === inst) ? (instName + " Ses Paketini Kapat") : (instName + " Ses Paketini Etkinleştir");
                    b.setAttribute('aria-label', instName + " Ses Paketi. " + ((nextInst === inst) ? "Kapatmak" : "Etkinleştirmek") + " için tıklayın.");
                }
            };
            
            updateStoreBtn('buy-baglama-pack-btn', 'hafizaGuvenBaglamaPack', 'baglama', 'Bağlama');
            updateStoreBtn('buy-kaval-pack-btn', 'hafizaGuvenKavalPack', 'kaval', 'Kaval');
            updateStoreBtn('buy-flut-pack-btn', 'hafizaGuvenFlutPack', 'flut', 'Flüt');
            updateStoreBtn('buy-kanun-pack-btn', 'hafizaGuvenKanunPack', 'kanun', 'Kanun');

            if (window.menuEnterSound) window.menuEnterSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Ses paketi değiştirildi. " + n + " aktif.");
        });
    }

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
    const dailyRewardContinueBtn = document.getElementById('daily-reward-continue-btn');
    const mobileEnterBtn = document.getElementById('mobile-enter-btn');

    const btnDiffEasy = document.getElementById('btn-diff-easy');
    const btnDiffMedium = document.getElementById('btn-diff-medium');
    const btnDiffHard = document.getElementById('btn-diff-hard');
    const btnDiffMissingNotes = document.getElementById('btn-diff-missing-notes');
    const difficultyBackBtn = document.getElementById('difficulty-back-btn');

    // "Kayıtlı Oyundan Devam Et"
    if (btnContinueSaved) {
        btnContinueSaved.addEventListener('click', () => {
            if (window.populateSavedGamesList) window.populateSavedGamesList();
            window.switchMenu(window.mainMenu, window.savedGamesMenu, 'saved-games');
        });
    }

    const savedGamesBackBtn = document.getElementById('saved-games-back-btn');
    if (savedGamesBackBtn) {
        savedGamesBackBtn.addEventListener('click', () => {
            window.switchMenu(window.savedGamesMenu, window.mainMenu, 'main');
        });
    }
    
    const gameSaveBtn = document.getElementById('game-save-btn');
    if (gameSaveBtn) {
        gameSaveBtn.addEventListener('click', () => {
            if (window.saveCurrentGame) window.saveCurrentGame();
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

    if (dailyRewardContinueBtn) {
        dailyRewardContinueBtn.addEventListener('click', () => {
            if (window.onDailyRewardContinue) {
                window.onDailyRewardContinue();
            } else {
                window.switchMenu(window.dailyRewardMenu, window.mainMenu, 'main');
            }
        });
    }

    const firstTimeStartBtn = document.getElementById('first-time-start-btn');
    if (firstTimeStartBtn) {
        firstTimeStartBtn.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.isStarted = true;
            
            localStorage.setItem('hafizaGuvenFirstTime_v2', 'false'); // İşaretle
            window.firstTimeMusic = true; // Müziğin kesilmesini engelle
            
            window.switchMenu(window.firstTimeTutorialMenu, window.practiceMenu, 'practice');
            if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
            if (window.music117Sound && !window.music117Sound.playing()) window.music117Sound.play();
            
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
                let playerName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
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

    const btnChangeUsername = document.getElementById('btn-change-username');
    if (btnChangeUsername) {
        btnChangeUsername.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            let currentName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
            
            setTimeout(() => {
                let newName = prompt("Yeni kullanıcı adınızı girin:", currentName !== "Bilinmeyen" ? currentName : "");
                if (newName && newName.trim() !== "") {
                    newName = newName.trim();
                    window.currentChatUser = newName;
                    localStorage.setItem('chatUsername', newName);
                    sessionStorage.setItem('chatNickname', newName);
                    localStorage.setItem('hafizaGuvenUserNickname', newName);
                    
                    let nameEl = document.getElementById('profile-player-name');
                    if (nameEl) nameEl.innerText = newName;
                    
                    if (window.successSound) {
                        window.successSound.volume(0.8);
                        window.successSound.play();
                    }
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader(`Kullanıcı adınız başarıyla ${newName} olarak değiştirildi.`, true);
                    }
                } else if (newName !== null) {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader("Geçersiz veya boş bir kullanıcı adı girdiniz. İşlem iptal edildi.", true);
                    }
                }
            }, 100);
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

        // Aktif Etkinlikler Butonu
        // Aktif Etkinlikler (Pasif Durum Göstergesi)
        window.etkinlikKontrolEt = function() {
            const eventsBtnMain = document.getElementById('events-btn-main');
            if (!eventsBtnMain) return;
            
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();
            
            let msg = "";
            let isActive = false;
            
            if ((day === 6 && hour >= 12) || day === 0) {
                isActive = true;
            }
            
            if (isActive) {
                let end = new Date(now);
                if (day === 6) end.setDate(now.getDate() + 1);
                end.setHours(23, 59, 59, 999);
                let diffMs = end - now;
                let diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                let diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                eventsBtnMain.innerText = `Etkinlik: Çift Jeton (${diffHours}sa ${diffMinutes}dk)`;
                eventsBtnMain.setAttribute('aria-label', `Ã…Âu an Çift Jeton Etkinliği AKTİF! Etkinliğin bitmesine ${diffHours} saat ${diffMinutes} dakika kaldı.`);
            } else {
                let start = new Date(now);
                let daysUntilSaturday = 6 - day;
                if (daysUntilSaturday === 0 && hour >= 12) daysUntilSaturday = 7;
                else if (daysUntilSaturday === 0) daysUntilSaturday = 0;
                start.setDate(now.getDate() + daysUntilSaturday);
                start.setHours(12, 0, 0, 0);
                let diffMs = start - now;
                let diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                let diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                eventsBtnMain.innerText = `Sıradaki Etkinlik: Çift Jeton (${diffDays}g ${diffHours}sa ${diffMinutes}dk)`;
                eventsBtnMain.setAttribute('aria-label', `Ã…Âu an aktif etkinlik yok. Sıradaki etkinlik: Çift Jeton Etkinliği. Başlamasına ${diffDays} gün, ${diffHours} saat, ${diffMinutes} dakika var.`);
            }
        };
        
        window.etkinlikKontrolEt();
        setInterval(window.etkinlikKontrolEt, 60000);

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
            if (window.gameWinSound) window.gameWinSound.volume(1.0 * scale);
            if (window.modeUnlockSound) window.modeUnlockSound.volume(1.0 * scale);
            if (window.playerOnlineSound) window.playerOnlineSound.volume(1.0 * scale);
            if (window.playerOfflineSound) window.playerOfflineSound.volume(1.0 * scale);
            if (window.serverDisconnectSound) window.serverDisconnectSound.volume(1.0 * scale);
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
            if (window.baglamaNotes) {
                for (let k in window.baglamaNotes) window.baglamaNotes[k].volume(1.0 * scale);
            }
            if (window.kavalNotes) {
                for (let k in window.kavalNotes) window.kavalNotes[k].volume(1.0 * scale);
            }
            if (window.flutNotes) {
                for (let k in window.flutNotes) window.flutNotes[k].volume(1.0 * scale);
            }
            if (window.kanunNotes) {
                for (let k in window.kanunNotes) window.kanunNotes[k].volume(1.0 * scale);
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

        const toggleStoryBtn = document.getElementById('toggle-story-mode-btn');
        window.updateStoryBtnState = () => {
            let disableStory = localStorage.getItem('hafizaGuvenDisableStoryMode') === 'true';
            if (toggleStoryBtn) {
                toggleStoryBtn.innerText = disableStory ? "Kayıp Notalar Hikaye Diyaloğunu Atla (Açık)" : "Kayıp Notalar Hikaye Diyaloğunu Atla (Kapalı)";
                toggleStoryBtn.setAttribute('aria-label', toggleStoryBtn.innerText);
            }
        };

        if (toggleStoryBtn) {
            window.updateStoryBtnState();
            toggleStoryBtn.addEventListener('click', () => {
                if (window.menuEnterSound) window.menuEnterSound.play();
                let disableStory = localStorage.getItem('hafizaGuvenDisableStoryMode') === 'true';
                disableStory = !disableStory;
                localStorage.setItem('hafizaGuvenDisableStoryMode', disableStory);
                window.updateStoryBtnState();
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(disableStory ? "Hikaye diyalogları atlanacak." : "Hikaye diyalogları gösterilecek.", true);
                }
            });
        }

        const toggleOnlineBtn = document.getElementById('toggle-online-status-btn');
        window.updateOnlineBtnState = () => {
            let disableOnline = localStorage.getItem('hafizaGuvenDisableOnlineStatus') === 'true';
            if (toggleOnlineBtn) {
                toggleOnlineBtn.innerText = disableOnline ? "Çevrimiçi Bildirimleri: Kapalı" : "Çevrimiçi Bildirimleri: Açık";
                toggleOnlineBtn.setAttribute('aria-label', toggleOnlineBtn.innerText);
            }
        };

        if (toggleOnlineBtn) {
            window.updateOnlineBtnState();
            toggleOnlineBtn.addEventListener('click', () => {
                if (window.menuEnterSound) window.menuEnterSound.play();
                let disableOnline = localStorage.getItem('hafizaGuvenDisableOnlineStatus') === 'true';
                disableOnline = !disableOnline;
                localStorage.setItem('hafizaGuvenDisableOnlineStatus', disableOnline);
                window.updateOnlineBtnState();
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(disableOnline ? "Çevrimiçi bildirimleri kapatıldı." : "Çevrimiçi bildirimleri açıldı.", true);
                }
            });
        }

        const toggleMetronomeBtn = document.getElementById('toggle-metronome-btn');
        window.updateMetronomeBtnState = () => {
            let metronomeState = localStorage.getItem('hafizaGuvenMetronome') || 'off';
            if (toggleMetronomeBtn) {
                let stateText = 'Kapalı';
                if (metronomeState === '60') stateText = '60 BPM';
                else if (metronomeState === '90') stateText = '90 BPM';
                else if (metronomeState === '120') stateText = '120 BPM';
                
                toggleMetronomeBtn.innerText = "Metronom: " + stateText;
                toggleMetronomeBtn.setAttribute('aria-label', toggleMetronomeBtn.innerText);
            }
        };

        if (toggleMetronomeBtn) {
            window.updateMetronomeBtnState();
            toggleMetronomeBtn.addEventListener('click', () => {
                if (window.menuEnterSound) window.menuEnterSound.play();
                let metronomeState = localStorage.getItem('hafizaGuvenMetronome') || 'off';
                
                if (metronomeState === 'off') metronomeState = '60';
                else if (metronomeState === '60') metronomeState = '90';
                else if (metronomeState === '90') metronomeState = '120';
                else metronomeState = 'off';
                
                localStorage.setItem('hafizaGuvenMetronome', metronomeState);
                window.updateMetronomeBtnState();
                
                let stateText = metronomeState === 'off' ? "kapatıldı" : metronomeState + " BPM olarak ayarlandı";
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Metronom " + stateText, true);
                }
            });
        }

        const toggleMotivationBtn = document.getElementById('toggle-motivation-btn');
        window.updateMotivationBtnState = () => {
            let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
            if (toggleMotivationBtn) {
                toggleMotivationBtn.innerText = disableMotivation ? "Oyun İçi Motivasyon Mesajları: Kapalı" : "Oyun İçi Motivasyon Mesajları: Açık";
                toggleMotivationBtn.setAttribute('aria-label', toggleMotivationBtn.innerText);
            }
        };

        if (toggleMotivationBtn) {
            window.updateMotivationBtnState();
            toggleMotivationBtn.addEventListener('click', () => {
                if (window.menuEnterSound) window.menuEnterSound.play();
                let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
                disableMotivation = !disableMotivation;
                localStorage.setItem('hafizaGuvenDisableMotivation', disableMotivation);
                window.updateMotivationBtnState();
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(disableMotivation ? "Motivasyon mesajları kapatıldı." : "Motivasyon mesajları açıldı.", true);
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
            
            let packsUnlocked = localStorage.getItem('hafizaGuvenSoundPacksUnlocked') === 'true';
            
            if (!packsUnlocked) {
                let ownsBaglama = localStorage.getItem('hafizaGuvenBaglamaPack') === 'true';
                let ownsKaval = localStorage.getItem('hafizaGuvenKavalPack') === 'true';
                let ownsFlut = localStorage.getItem('hafizaGuvenFlutPack') === 'true';
                let ownsKanun = localStorage.getItem('hafizaGuvenKanunPack') === 'true';
                if (ownsBaglama || ownsKaval || ownsFlut || ownsKanun) {
                    packsUnlocked = true;
                    localStorage.setItem('hafizaGuvenSoundPacksUnlocked', 'true');
                }
            }

            ['li-baglama-pack', 'li-kaval-pack', 'li-flut-pack', 'li-kanun-pack'].forEach(id => {
                let el = document.getElementById(id);
                if (el) el.style.display = packsUnlocked ? 'block' : 'none';
            });
            
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

            if (buyKavalPackBtn) {
                let ownsKaval = localStorage.getItem('hafizaGuvenKavalPack') === 'true';
                if (ownsKaval) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kaval';
                    buyKavalPackBtn.innerText = isActive ? "Kaval Ses Paketini Kapat" : "Kaval Ses Paketini Etkinleştir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. " + (isActive ? "Kapatmak" : "Etkinleştirmek") + " için tıklayın.");
                } else {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketi Satın Al (100 Jeton)";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Notaları piyano yerine kaval ile duyarsınız. Kalıcı olarak sahip olursunuz. Fiyat: 100 Jeton.");
                }
            }

            if (buyFlutPackBtn) {
                let ownsFlut = localStorage.getItem('hafizaGuvenFlutPack') === 'true';
                if (ownsFlut) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'flut';
                    buyFlutPackBtn.innerText = isActive ? "Flüt Ses Paketini Kapat" : "Flüt Ses Paketini Etkinleştir";
                    buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. " + (isActive ? "Kapatmak" : "Etkinleştirmek") + " için tıklayın.");
                } else {
                    buyFlutPackBtn.innerText = "Flüt Ses Paketi Satın Al (200 Jeton)";
                    buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Notaları piyano yerine flüt ile duyarsınız. Kalıcı olarak sahip olursunuz. Fiyat: 200 Jeton.");
                }
            }

            if (buyKanunPackBtn) {
                let ownsKanun = localStorage.getItem('hafizaGuvenKanunPack') === 'true';
                if (ownsKanun) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kanun';
                    buyKanunPackBtn.innerText = isActive ? "Kanun Ses Paketini Kapat" : "Kanun Ses Paketini Etkinleştir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. " + (isActive ? "Kapatmak" : "Etkinleştirmek") + " için tıklayın.");
                } else {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketi Satın Al (300 Jeton)";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Notaları piyano yerine kanun ile duyarsınız. Kalıcı olarak sahip olursunuz. Fiyat: 300 Jeton.");
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
                let msg = `Yetersiz bakiye. Bu eşya için 50 jetona ihtiyacınız var. Mevcut jetonunuz: ${totalTokens}. Almak için ${50 - totalTokens} jetona daha ihtiyacınız var.`;
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
                let msg = `Yetersiz bakiye. Bu eşya için 30 jetona ihtiyacınız var. Mevcut jetonunuz: ${totalTokens}. Almak için ${30 - totalTokens} jetona daha ihtiyacınız var.`;
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

    if (buyStreakFreezeBtn) {
        buyStreakFreezeBtn.addEventListener('click', () => {
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let sd = parseInt(localStorage.getItem('hafizaGuvenSeriDondurma')) || 0;

            if (sd >= 2) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = "Bu eşyadan en fazla 2 adet taşıyabilirsiniz.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            if (totalTokens < 80) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = `Yetersiz bakiye. Bu eşya için 80 jetona ihtiyacınız var. Mevcut jetonunuz: ${totalTokens}. Almak için ${80 - totalTokens} jetona daha ihtiyacınız var.`;
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            totalTokens -= 80;
            sd += 1;
            localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
            localStorage.setItem('hafizaGuvenSeriDondurma', sd);
            if (window.buySound) window.buySound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! 1 Seri Dondurma eklendi. Kalan jeton: ${totalTokens}. Mevcut Seri Dondurma sayınız: ${sd}`);
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
                    
                    if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                        buyKavalPackBtn.innerText = "Kaval Ses Paketini Etkinleştir";
                        buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                        buyFlutPackBtn.innerText = "Flüt Ses Paketini Etkinleştir";
                        buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                        buyKanunPackBtn.innerText = "Kanun Ses Paketini Etkinleştir";
                        buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 500) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eşya için 500 jetona ihtiyacınız var. Mevcut jetonunuz: ${totalTokens}. Almak için ${500 - totalTokens} jetona daha ihtiyacınız var.`;
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
                
                if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketini Etkinleştir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                    buyFlutPackBtn.innerText = "Flüt Ses Paketini Etkinleştir";
                    buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketini Etkinleştir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Etkinleştirmek için tıklayın.");
                }
            }
        });
    }

    if (buyKavalPackBtn) {
        buyKavalPackBtn.addEventListener('click', () => {
            let ownsKaval = localStorage.getItem('hafizaGuvenKavalPack') === 'true';
            
            if (ownsKaval) {
                let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kaval';
                if (isActive) {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'piano');
                    window.activeInstrument = 'piano';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKavalPackBtn.innerText = "Kaval Ses Paketini Etkinleştir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Etkinleştirmek için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kaval ses paketi kapatıldı. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'kaval');
                    window.activeInstrument = 'kaval';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKavalPackBtn.innerText = "Kaval Ses Paketini Kapat";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Kapatmak için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kaval ses paketi etkinleştirildi!");
                    
                    if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                        buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Etkinleştir";
                        buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                        buyFlutPackBtn.innerText = "Flüt Ses Paketini Etkinleştir";
                        buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                        buyKanunPackBtn.innerText = "Kanun Ses Paketini Etkinleştir";
                        buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 100) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eşya için 100 jetona ihtiyacınız var. Mevcut jetonunuz: ${totalTokens}. Almak için ${100 - totalTokens} jetona daha ihtiyacınız var.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 100;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenKavalPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'kaval');
                window.activeInstrument = 'kaval';
                
                buyKavalPackBtn.innerText = "Kaval Ses Paketini Kapat";
                buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Kapatmak için tıklayın.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! Kaval ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
                
                if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                    buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Etkinleştir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                    buyFlutPackBtn.innerText = "Flüt Ses Paketini Etkinleştir";
                    buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketini Etkinleştir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Etkinleştirmek için tıklayın.");
                }
            }
        });
    }

    if (buyFlutPackBtn) {
        buyFlutPackBtn.addEventListener('click', () => {
            let ownsFlut = localStorage.getItem('hafizaGuvenFlutPack') === 'true';
            
            if (ownsFlut) {
                let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'flut';
                if (isActive) {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'piano');
                    window.activeInstrument = 'piano';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyFlutPackBtn.innerText = "Flüt Ses Paketini Etkinleştir";
                    buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Etkinleştirmek için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Flüt ses paketi kapatıldı. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'flut');
                    window.activeInstrument = 'flut';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyFlutPackBtn.innerText = "Flüt Ses Paketini Kapat";
                    buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Kapatmak için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Flüt ses paketi etkinleştirildi!");
                    
                    if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                        buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Etkinleştir";
                        buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                        buyKavalPackBtn.innerText = "Kaval Ses Paketini Etkinleştir";
                        buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                        buyKanunPackBtn.innerText = "Kanun Ses Paketini Etkinleştir";
                        buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 200) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eşya için 200 jetona ihtiyacınız var. Mevcut jetonunuz: ${totalTokens}. Almak için ${200 - totalTokens} jetona daha ihtiyacınız var.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 200;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenFlutPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'flut');
                window.activeInstrument = 'flut';
                
                buyFlutPackBtn.innerText = "Flüt Ses Paketini Kapat";
                buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Kapatmak için tıklayın.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! Flüt ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
                
                if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                    buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Etkinleştir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketini Etkinleştir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketini Etkinleştir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Etkinleştirmek için tıklayın.");
                }
            }
        });
    }

    if (buyKanunPackBtn) {
        buyKanunPackBtn.addEventListener('click', () => {
            let ownsKanun = localStorage.getItem('hafizaGuvenKanunPack') === 'true';
            
            if (ownsKanun) {
                let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kanun';
                if (isActive) {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'piano');
                    window.activeInstrument = 'piano';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKanunPackBtn.innerText = "Kanun Ses Paketini Etkinleştir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Etkinleştirmek için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kanun ses paketi kapatıldı. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'kanun');
                    window.activeInstrument = 'kanun';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKanunPackBtn.innerText = "Kanun Ses Paketini Kapat";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Kapatmak için tıklayın.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kanun ses paketi etkinleştirildi!");
                    
                    if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                        buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Etkinleştir";
                        buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                        buyKavalPackBtn.innerText = "Kaval Ses Paketini Etkinleştir";
                        buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                    if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                        buyFlutPackBtn.innerText = "Flüt Ses Paketini Etkinleştir";
                        buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Etkinleştirmek için tıklayın.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 300) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eşya için 300 jetona ihtiyacınız var. Mevcut jetonunuz: ${totalTokens}. Almak için ${300 - totalTokens} jetona daha ihtiyacınız var.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 300;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenKanunPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'kanun');
                window.activeInstrument = 'kanun';
                
                buyKanunPackBtn.innerText = "Kanun Ses Paketini Kapat";
                buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Kapatmak için tıklayın.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`Satın alma başarılı! Kanun ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
                
                if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                    buyBaglamaPackBtn.innerText = "Bağlama Ses Paketini Etkinleştir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "Bağlama Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketini Etkinleştir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Etkinleştirmek için tıklayın.");
                }
                if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                    buyFlutPackBtn.innerText = "Flüt Ses Paketini Etkinleştir";
                    buyFlutPackBtn.setAttribute('aria-label', "Flüt Ses Paketi. Etkinleştirmek için tıklayın.");
                }
            }
        });
    }

    // Achievements
    if (btnAchievementsMain && achievementsBackBtn) {
        btnAchievementsMain.addEventListener('click', () => {
            window.switchMenu(window.mainMenu, window.achievementsMenu, 'achievements');
            
            let contentDiv = document.getElementById('achievements-content');
            if (!window.userAchievements) window.userAchievements = JSON.parse(localStorage.getItem('hafizaGuvenAchievements') || "{}");
            let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0;
            
            let html = '<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">';
            
            if (window.userAchievements.hafizam_gucleniyor) {
                html += '<li tabindex="0" role="menuitem" class="stat-item" style="color: #4ade80;" aria-label="Kazanıldı: Hafızam Güçleniyor. Kolay modu 2 kez tamamla.">âÅ“â€¦ Hafızam Güçleniyor (Kolay modu 2 kez tamamla)</li>';
            } else {
                html += '<li tabindex="0" role="menuitem" class="stat-item" style="color: #cbd5e1;" aria-label="Kilitli: Hafızam Güçleniyor. Kolay modu 2 kez tamamla.">ğÅ¸â€â€™ Hafızam Güçleniyor (Kolay modu 2 kez tamamla)</li>';
            }
            
            if (window.userAchievements.buzsuz_3_gun) {
                html += '<li tabindex="0" role="menuitem" class="stat-item" style="color: #4ade80;" aria-label="Kazanıldı: Sadık Oyuncu. 3 Gün boyunca seri dondurma kullanmadan giriş yap.">âÅ“â€¦ Sadık Oyuncu (3 Gün boyunca seri dondurma kullanmadan giriş yap)</li>';
            } else {
                html += `<li tabindex="0" role="menuitem" class="stat-item" style="color: #cbd5e1;" aria-label="Kilitli: Sadık Oyuncu. 3 Gün boyunca seri dondurma kullanmadan giriş yap. İlerleme: ${bg} bölü 3 gün.">âÂÂ³ Sadık Oyuncu (3 Gün boyunca seri dondurma kullanmadan giriş) - İlerleme: ${bg}/3</li>`;
            }
            
            html += '</ul>';
            if (contentDiv) contentDiv.innerHTML = html;
            
            let text = "Başarılar menüsü açıldı. Durumunuzu kontrol edebilirsiniz.";
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
    const pvpLobbyCancelBtn = document.getElementById('pvp-lobby-cancel-btn');
    const pveBotPlayBtn = document.getElementById('pve-bot-play-btn');
    const mpSelectBackBtn = document.getElementById('multiplayer-select-back-btn');
    if (!window.multiplayerSelectMenu) window.multiplayerSelectMenu = mpSelectMenuDOM;

    const pvpRoomsMenuDOM = document.getElementById('pvp-rooms-menu-container');
    const pvpRoomsBackBtn = document.getElementById('pvp-rooms-back-btn');
    const pvpJoinSubmitBtn = document.getElementById('pvp-join-submit-btn');
    const pvpJoinCodeInput = document.getElementById('pvp-join-code-input');
    if (!window.pvpRoomsMenu) window.pvpRoomsMenu = pvpRoomsMenuDOM;

    if (pvpRoomsBackBtn) {
        pvpRoomsBackBtn.addEventListener('click', () => {
            window.switchMenu(window.pvpRoomsMenu, window.multiplayerSelectMenu, 'multiplayer-select');
        });
    }

    if (pvpJoinSubmitBtn && pvpJoinCodeInput) {
        pvpJoinSubmitBtn.addEventListener('click', () => {
            if (window.PvP && window.PvP.joinExistingMatchByCode) {
                const code = pvpJoinCodeInput.value.trim();
                if (code.length === 4) {
                    window.PvP.joinExistingMatchByCode(code);
                } else {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Lütfen 4 haneli geçerli bir oda kodu girin.", true);
                }
            }
        });
    }

    // Ekstra: Ã…Âifre alanında enter tuşu ile onSubmit tetikleme
    if (pvpJoinCodeInput) {
        pvpJoinCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && pvpJoinSubmitBtn) {
                pvpJoinSubmitBtn.click();
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
                if (pvpJoinCodeInput) pvpJoinCodeInput.value = ''; // Temizle
                window.switchMenu(window.multiplayerSelectMenu, window.pvpRoomsMenu, 'pvp-rooms');
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Eşleştirme sistemi henüz yüklenmedi.");
            }
        });
    }

    const pvpLobbyCopyBtn = document.getElementById('pvp-lobby-copy-btn');
    const pvpLobbyStartBtn = document.getElementById('pvp-lobby-start-btn');

    if (pvpLobbyCopyBtn) {
        pvpLobbyCopyBtn.addEventListener('click', () => {
            const codeDisplay = document.getElementById('pvp-lobby-code-display');
            if (codeDisplay && codeDisplay.innerText && codeDisplay.innerText !== '----') {
                const textToCopy = codeDisplay.innerText.trim();
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = textToCopy;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-9999px";
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    if (window.announceToScreenReader) window.announceToScreenReader("Oda kodu kopyalandı: " + textToCopy);
                    const originalText = "Kodu Kopyala";
                    pvpLobbyCopyBtn.innerText = "Kopyalandı!";
                    setTimeout(() => pvpLobbyCopyBtn.innerText = originalText, 2000);
                } catch (err) {
                    if (window.announceToScreenReader) window.announceToScreenReader("Kopyalama işlemi desteklenmiyor. Lütfen kodu manuel olarak seçin: " + textToCopy);
                }
            }
        });
    }

    if (pvpLobbyStartBtn) {
        pvpLobbyStartBtn.addEventListener('click', () => {
            if (window.PvP && window.PvP.startMatchManually) {
                window.PvP.startMatchManually();
            }
        });
    }

    if (pvpLobbyCancelBtn) {
        pvpLobbyCancelBtn.addEventListener('click', () => {
            if (window.PvP) {
                window.PvP.cancelQueue();
            }
            window.switchMenu(window.pvpLobbyMenu, window.multiplayerSelectMenu, 'multiplayer-select');
        });
    }

    if (pvpPlayBtn) {
        pvpPlayBtn.addEventListener('click', () => {
            if (window.PvP) {
                // If already waiting in lobby, do nothing
                if (window.PvP.lobbyWaitTimer) return;
                
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
                if (window.PvP.lobbyWaitTimer) return;
                
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
            if (window.PvP && (window.PvP.isSearching || window.PvP.lobbyWaitTimer)) {
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
                window.isStarted = true;
                
                let skipStoryDialogues = localStorage.getItem('hafizaGuvenDisableStoryMode') === 'true';
                
                if (skipStoryDialogues) {
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
                } else {
                    window.isDialogPhase = true;
                    window.currentStoryIndex = 0;
                    window.storyEntryTimeout = setTimeout(() => {
                        if (window.playCurrentStoryDialog) window.playCurrentStoryDialog();
                        if (window.triggerStoryAnimations) window.triggerStoryAnimations(0);
                    }, 350);
                }
            });
        }

        const btnDiffRhythm = document.getElementById('btn-diff-rhythm');
        if (btnDiffRhythm) {
            btnDiffRhythm.addEventListener('click', () => {
                window.switchMenu(window.difficultyMenu, window.gameMenu, 'game');
                if (window.startMainGame) window.startMainGame('rhythm_mode');
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

        // OYUN VE HİKAYE MODUNDAN GÜVENLİ KAÇIÃ…Â PROTOKOLÜ
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
        'pvp-rooms': 'pvp-rooms-back-btn',
        'pvp-lobby': 'pvp-lobby-cancel-btn'
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
            window.currentActiveMenu === 'update') {
            
            event.preventDefault();

            if (event.key === 'Enter') {
                // Sadece Entıra basılınca onaylansın
                if (window.currentActiveMenu === 'server-message') {
                    const btn = document.getElementById('server-message-continue-btn');
                    if (btn) btn.click();
                } else if (window.currentActiveMenu === 'daily-reward') {
                    const btn = document.getElementById('daily-reward-continue-btn');
                    if (btn) btn.click();
                } else if (window.currentActiveMenu === 'update') {
                    const btn = document.getElementById('update-install-btn');
                    if (btn) btn.click();
                } else if (window.currentActiveMenu === 'story') {
                    // Story.js enter'ı kendi game.js içinden dinliyor olabilir
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

// --- DURAKLATMA / ÇIKIÃ…Â MENÜSÜ MANTIÃ„ÂI ---
window.gameIsPaused = false;
window.requestPauseMenu = function() {
    window.gameIsPaused = true;
    const modal = document.getElementById('pause-action-modal');
    if (modal) {
        modal.style.display = 'flex';
        if (window.clockTickSound && window.clockTickSound.playing()) window.clockTickSound.pause();
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.removeAttribute('aria-hidden');
            const title = document.getElementById('pause-action-title');
            if (title) {
                title.focus();
            }
            if (window.announceToScreenReader) {
                window.announceToScreenReader("Oyun duraklatıldı. Ne yapmak istiyorsunuz? Seçenekler için TAB veya ok tuşlarını kullanabilirsiniz.", true);
            }
        }, 10);
    }
};

window.resumeFromPause = function() {
    const modal = document.getElementById('pause-action-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            modal.style.display = 'none';
            window.gameIsPaused = false;
            if (window.clockTickSound && window.clockTickSound.state() === 'loaded') {
                if (!window.clockTickSound.playing() && window.gameTimer > 0 && !window.isComputerPlaying) {
                    window.clockTickSound.play();
                }
            }
        }, 300);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const pauseInterceptor = (e) => {
        let isMultiplayer = window.isMultiplayerGame;
        if (window.gameIsActive && !window.isGameOverPhase && window.currentActiveMenu === 'game' && !isMultiplayer) {
            if (e && e.type !== 'click') { e.preventDefault(); e.stopPropagation(); }
            else if (e) { e.preventDefault(); e.stopImmediatePropagation(); }
            window.requestPauseMenu();
        }
    };
    
    const gBtn = document.getElementById('game-back-btn');
    if (gBtn) {
        gBtn.addEventListener('click', pauseInterceptor, true);
        gBtn.addEventListener('pointerdown', pauseInterceptor, true);
        gBtn.addEventListener('touchstart', pauseInterceptor, {passive: false, capture: true});
    }
    
    const mBtn = document.getElementById('mobile-game-back-btn');
    if (mBtn) {
        mBtn.addEventListener('click', pauseInterceptor, true);
        mBtn.addEventListener('pointerdown', pauseInterceptor, true);
        mBtn.addEventListener('touchstart', pauseInterceptor, {passive: false, capture: true});
    }

    const btnExit = document.getElementById('pause-btn-exit');
    const btnSave = document.getElementById('pause-btn-save');
    const btnCancel = document.getElementById('pause-btn-cancel');

    const handleExit = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        window.resumeFromPause();
        setTimeout(() => {
            if (window.endMainGame) window.endMainGame(false, false, true);
        }, 350);
    };

    if (btnExit) {
        btnExit.addEventListener('click', handleExit);
        btnExit.addEventListener('pointerdown', handleExit);
        btnExit.addEventListener('touchstart', handleExit, {passive: false});
    }

    const handleSave = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (window.saveCurrentGame) {
            window.saveCurrentGame();
        }
        window.resumeFromPause();
        setTimeout(() => {
            if (window.endMainGame) window.endMainGame(false, false, true);
        }, 350);
    };

    if (btnSave) {
        btnSave.addEventListener('click', handleSave);
        btnSave.addEventListener('pointerdown', handleSave);
        btnSave.addEventListener('touchstart', handleSave, {passive: false});
    }

    const handleCancel = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        window.resumeFromPause();
    };

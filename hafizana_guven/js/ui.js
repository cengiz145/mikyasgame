// ui.js - KullanÄ±cÄ± ArayÃ¼zÃ¼, Mobil Tespit ve Ekran Okuyucu FonksiyonlarÄ±

// Mobil Cihaz Tespiti
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
window.isMobileDevice = isMobile;



window.isWeekendDoubleCoins = function() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    // Cumartesi (6) 12:00'dan itibaren, Pazar (0) tÃ¼m gÃ¼n (23:59'a kadar)
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
    return null; // EÄŸer hepsini geÃ§tiyse
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
                window.pendingDailyRewardMsg = `Seri ${streak}. gÃ¼n! ${streak * 10} jeton kazandÄ±nÄ±z.`;
            } else if (daysPassed > 1) {
                let daysMissed = daysPassed - 1;
                let freezeCount = parseInt(localStorage.getItem('hafizaGuvenSeriDondurma')) || 0;
                
                if (freezeCount >= daysMissed) {
                    freezeCount -= daysMissed;
                    localStorage.setItem('hafizaGuvenSeriDondurma', freezeCount);
                    streak += 1; // Seri kurtarÄ±ldÄ±, bugÃ¼nÃ¼n giriÅŸiyle artÄ±yor
                    buzsuzGun = 1; // Seri dondurma kullanÄ±ldÄ±ÄŸÄ± iÃ§in buzsuz serisi kÄ±rÄ±ldÄ±, bugÃ¼nden baÅŸlar
                    window.pendingDailyRewardMsg = `${daysMissed} gÃ¼n oyuna girmediniz ancak Seri Dondurma kullanÄ±ldÄ±. Seriniz bozulmadÄ±! GÃ¼ncel seri: ${streak}. gÃ¼n. ${streak * 10} jeton kazandÄ±nÄ±z. Kalan dondurma: ${freezeCount} adet.`;
                } else {
                    if (freezeCount > 0) {
                        freezeCount = 0; // Hepsini kullandÄ± ama yetmedi
                        localStorage.setItem('hafizaGuvenSeriDondurma', freezeCount);
                    }
                    window.pendingDailyRewardMsg = `Maalesef yeterli Seri DondurmanÄ±z olmadÄ±ÄŸÄ± iÃ§in gÃ¼nlÃ¼k seriniz 0'landÄ±! Kaybetmeden Ã¶nce ${streak}. gÃ¼ne ulaÅŸmÄ±ÅŸtÄ±nÄ±z. BugÃ¼nden itibaren seriniz tekrar 1. gÃ¼nden baÅŸlÄ±yor. 10 jeton kazandÄ±nÄ±z.`;
                    streak = 1;
                    buzsuzGun = 1;
                }
            }
        } else {
            streak = 1;
            buzsuzGun = 1;
            window.pendingDailyRewardMsg = `Oyuna hoÅŸ geldiniz! Ä°lk gÃ¼nÃ¼nÃ¼z. 10 jeton kazandÄ±nÄ±z.`;
        }
        
        localStorage.setItem('hafizaGuvenLastLoginDate', todayStr);
        localStorage.setItem('hafizaGuvenLoginStreak', streak);
        localStorage.setItem('hafizaGuvenBuzsuzGun', buzsuzGun);
        
        // BAÃ…ÂARI KONTROLÃœ (Buzsuz 3 GÃ¼n)
        if (!window.userAchievements) window.userAchievements = JSON.parse(localStorage.getItem('hafizaGuvenAchievements') || "{}");
        if (buzsuzGun >= 3 && !window.userAchievements.buzsuz_3_gun) {
            window.userAchievements.buzsuz_3_gun = true;
            try { localStorage.setItem('hafizaGuvenAchievements', JSON.stringify(window.userAchievements)); } catch(e){}
            setTimeout(() => {
                if (window.achievementSound) window.achievementSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Yeni Bir BaÅŸarÄ±m KazandÄ±nÄ±z! SadÄ±k Oyuncu: 3 GÃ¼n boyunca seri dondurma kullanmadan oyuna girdiniz.");
                setTimeout(() => {
                    if (window.showAchievementModal) window.showAchievementModal("SadÄ±k Oyuncu");
                }, 3000);
            }, 6000);
        }
        
        let reward = streak * 10;
        if (reward > 100) reward = 100; // max 100 jeton (etkinlik hariÃ§)
        
        let milestoneReward = 0;
        const currentMilestone = window.milestones.find(m => m.day === streak);
        if (currentMilestone) {
            milestoneReward = currentMilestone.reward;
            reward += milestoneReward;
            window.pendingDailyRewardMsg += ` Ä°nanÄ±lmaz! ${streak}. gÃ¼n dÃ¶nÃ¼m noktasÄ±na ulaÅŸtÄ±ÄŸÄ±nÄ±z iÃ§in Ã¶zel olarak ${milestoneReward} ekstra jeton BONUS kazandÄ±nÄ±z! Toplam kazanÃ§: ${reward} jeton.`;
        }
        
        if (window.isWeekendDoubleCoins()) {
            reward *= 2;
            window.pendingDailyRewardMsg += ` Hafta sonu Ã§ift jeton etkinliÄŸi aktif olduÄŸu iÃ§in kazancÄ±nÄ±z 2'ye katlandÄ± ve ${reward} jeton kazandÄ±nÄ±z!`;
        }
        
        let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
        totalTokens += reward;
        try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch(e){}
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.checkDailyStreak();
    
    // GÃ¼ncelleme butonu artÄ±k pasif olduÄŸu iÃ§in tÄ±klama olayÄ± kaldÄ±rÄ±ldÄ±.
});

setTimeout(() => window.guncellemeKontrolEt(false), 2000);
window.addEventListener('focus', () => window.guncellemeKontrolEt(false));
setInterval(() => window.guncellemeKontrolEt(false), 30000);

// Klavye komutlarÄ±nÄ± mobil dokunmatik ekran komutlarÄ±na Ã§evir
window.localizeText = function (text) {
    if (!window.isMobileDevice || !text) return text;
    return text
        .replace(/entÄ±ra veya ekrana Ã§ift dokunun/gi, "ekrana Ã§ift dokunun")
        .replace(/entÄ±ra veya /gi, "")
        .replace(/entÄ±ra basÄ±n/gi, "ekrana Ã§ift dokunun")
        .replace(/enter'a basÄ±n/gi, "ekrana Ã§ift dokunun")
        .replace(/enter tuÅŸuna basÄ±n/gi, "ekrana Ã§ift dokunun")
        .replace(/entÄ±r tuÅŸuna basÄ±n/gi, "ekrana Ã§ift dokunun")
        .replace(/entÄ±r tuÅŸunu kullanabilirsiniz/gi, "ekrana Ã§ift dokunabilirsiniz")
        .replace(/entÄ±r tuÅŸu ile/gi, "ekrana Ã§ift dokunarak")
        .replace(/entÄ±r tuÅŸuna bastÄ±ÄŸÄ±nÄ±zda/gi, "ekrana Ã§ift dokunduÄŸunuzda")
        .replace(/entÄ±ra,/gi, "ekrana Ã§ift dokunarak,")
        .replace(/entÄ±ra/gi, "ekrana Ã§ift dokunmaya")
        .replace(/entÄ±r tuÅŸu/gi, "ekrana Ã§ift dokunma")
        .replace(/entÄ±r/gi, "ekrana Ã§ift dokunmak")
        .replace(/enter/gi, "ekrana Ã§ift dokunmak")
        .replace(/saÄŸ ve sol ok tuÅŸlarÄ±na basÄ±n/gi, "parmaÄŸÄ±nÄ±zÄ± saÄŸa veya sola sÃ¼pÃ¼rme hareketi yapÄ±n")
        .replace(/saÄŸ sol ok tuÅŸlarÄ±na basÄ±n/gi, "parmaÄŸÄ±nÄ±zÄ± saÄŸa veya sola sÃ¼pÃ¼rme hareketi yapÄ±n")
        .replace(/saÄŸ ve sol ok tuÅŸlarÄ±yla gezinebilirsiniz/gi, "parmaÄŸÄ±nÄ±zÄ± saÄŸa veya sola sÃ¼pÃ¼rerek gezinebilirsiniz")
        .replace(/saÄŸ ve sol ok tuÅŸlarÄ±yla gezinebilir/gi, "parmaÄŸÄ±nÄ±zÄ± saÄŸa veya sola sÃ¼pÃ¼rerek gezinebilir")
        .replace(/sayfa yukarÄ± ve sayfa aÅŸaÄŸÄ± tuÅŸuna basÄ±n/gi, "telefonunuzun ses tuÅŸlarÄ±na basÄ±n")
        .replace(/Page Up ve Page Down tuÅŸlarÄ±yla/gi, "telefonunuzun ses tuÅŸlarÄ±yla")
        .replace(/m tuÅŸuna basÄ±n/gi, "sessize alma dÃ¼ÄŸmesini kullanÄ±n")
        .replace(/S tuÅŸu ile skorunuzu, T tuÅŸu ile kalan sÃ¼renizi Ã¶ÄŸrenebilir, boÅŸluk tuÅŸu ile bir saniye ceza karÅŸÄ±lÄ±ÄŸÄ±nda ses dizisini tekrar dinleyebilirsiniz\./gi, "")
        .replace(/<strong>S tuÅŸu<\/strong> ile skorunuzu, <strong>T tuÅŸu<\/strong> ile kalan sÃ¼renizi Ã¶ÄŸrenebilir, <strong>BoÅŸluk tuÅŸu<\/strong> ile bir saniye ceza karÅŸÄ±lÄ±ÄŸÄ±nda ses dizisini tekrar dinleyebilirsiniz\./gi, "")
        .replace(/ok tuÅŸlarÄ±nÄ± kullanÄ±n/gi, "parmaÄŸÄ±nÄ±zÄ± saÄŸa veya sola sÃ¼pÃ¼rÃ¼n");
};

// TÃ¼m statik Aria Labelleri ve iÃ§erikleri mobil cihazsa Ã§evir
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
            // Sadece Oyunu Bitir butonu gÃ¶rÃ¼nmeli
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
        keys[1].setAttribute('data-key', 'ArrowLeft'); keys[1].textContent = '< Sol'; keys[1].setAttribute('aria-label', 'Sola YÃ¼rÃ¼'); keys[1].disabled = false;
        keys[2].setAttribute('data-key', 'ArrowRight'); keys[2].textContent = 'SaÄŸ >'; keys[2].setAttribute('aria-label', 'SaÄŸa YÃ¼rÃ¼'); keys[2].disabled = false;
        keys[3].setAttribute('data-key', 'f'); keys[3].textContent = 'F Bul'; keys[3].setAttribute('aria-label', 'NotayÄ± Ara veya Al'); keys[3].disabled = false;
        keys[4].setAttribute('data-key', 'Enter'); keys[4].textContent = 'Onay'; keys[4].setAttribute('aria-label', 'Onay'); keys[4].disabled = false;
        keys[5].setAttribute('data-key', 't'); keys[5].textContent = 'SÃ¼re'; keys[5].setAttribute('aria-label', 'SÃ¼reyi Sorgula'); keys[5].disabled = false;
        keys[6].textContent = '---'; keys[6].setAttribute('aria-label', 'Devre DÄ±ÅŸÄ±'); keys[6].disabled = true;
    } else {
        keys[0].setAttribute('data-key', 'c'); keys[0].textContent = 'C'; keys[0].setAttribute('aria-label', 'C NotasÄ±'); keys[0].disabled = false;
        keys[1].setAttribute('data-key', 'd'); keys[1].textContent = 'D'; keys[1].setAttribute('aria-label', 'D NotasÄ±'); keys[1].disabled = false;
        keys[2].setAttribute('data-key', 'e'); keys[2].textContent = 'E'; keys[2].setAttribute('aria-label', 'E NotasÄ±'); keys[2].disabled = false;
        keys[3].setAttribute('data-key', 'f'); keys[3].textContent = 'F'; keys[3].setAttribute('aria-label', 'F NotasÄ±'); keys[3].disabled = false;
        keys[4].setAttribute('data-key', 'g'); keys[4].textContent = 'G'; keys[4].setAttribute('aria-label', 'G NotasÄ±'); keys[4].disabled = false;
        keys[5].setAttribute('data-key', 'a'); keys[5].textContent = 'A'; keys[5].setAttribute('aria-label', 'A NotasÄ±'); keys[5].disabled = false;
        keys[6].setAttribute('data-key', 'b'); keys[6].textContent = 'B'; keys[6].setAttribute('aria-label', 'B NotasÄ±'); keys[6].disabled = false;
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
    
    // GÃ¼venlik SubabÄ± (Failsafe): Ne olursa olsun 1.5 saniye sonra geÃ§iÅŸ kilidini aÃ§ (boÅŸa dÃ¼ÅŸmeyi engeller)
    if (window.menuFailsafeTimeoutId) clearTimeout(window.menuFailsafeTimeoutId);
    window.menuFailsafeTimeoutId = setTimeout(() => {
        window.isMenuTransitioning = false;
    }, 600);

    // Mobil Geri TuÅŸu KorumasÄ± (Yeni bir alt menÃ¼ye geÃ§iliyorsa History'e ekle)
    if (newActiveMenuName !== 'main' && newActiveMenuName !== 'game' && newActiveMenuName !== 'story') {
        history.pushState({ modalOpen: true }, "");
    }

    if (window.menuFocusTimeoutId) {
        clearTimeout(window.menuFocusTimeoutId);
    }

    if (window.currentActiveMenu === 'main' && newActiveMenuName !== 'main') {
        window.lastFocusedElement = document.activeElement;
    }

    // ARAYÃœZ VE EKRAN OKUYUCU (NVDA) Ã‡AKIÃ…ÂMA ENGELLEYÄ°CÄ°SÄ°:
    // Animasyon (300ms) sÃ¼resince NVDA'nÄ±n her iki menÃ¼yÃ¼ de okumasÄ±nÄ± (Ghosting) engellemek iÃ§in anÄ±nda gizleriz.
    hideMenu.setAttribute('aria-hidden', 'true');
    hideMenu.setAttribute('inert', ''); // NVDA ve diÄŸer araÃ§larÄ±n iÃ§eriÄŸe eriÅŸimini kÃ¶kÃ¼nden keser
    
    let oldFocusables = hideMenu.querySelectorAll('button, [tabindex="0"], input, textarea');
    oldFocusables.forEach(el => el.setAttribute('tabindex', '-1'));

    hideMenu.style.opacity = '0';

    setTimeout(() => {
        hideMenu.style.display = 'none';
        
        // Sonradan menÃ¼ye dÃ¶nÃ¼ldÃ¼ÄŸÃ¼nde butonlar Ã§alÄ±ÅŸsÄ±n diye geÃ§ici tabindex engelini kaldÄ±rÄ±yoruz
        oldFocusables.forEach(el => el.removeAttribute('tabindex'));

        showMenu.style.display = 'flex';
        showMenu.removeAttribute('aria-hidden');
        showMenu.removeAttribute('inert');

        setTimeout(() => {
            showMenu.style.opacity = '1';
            window.currentActiveMenu = newActiveMenuName;
            window.updateMobileKeysVisibility();
            window.currentFocusIndex = 0;
            
            // DoÄŸrudan ilk Ã¶ÄŸeye odaklan, boÅŸluÄŸa veya H1'e dÃ¼ÅŸmeksizin
            window.menuFocusTimeoutId = setTimeout(() => {
                if (newActiveMenuName === 'main' && window.lastFocusedElement && document.body.contains(window.lastFocusedElement)) {
                    window.lastFocusedElement.focus();
                    window.lastFocusedElement = null;
                } else {
                    let focusables = Array.from(showMenu.querySelectorAll('.menu-button, button, [tabindex="0"], input, select, textarea'));
                    let firstFocusable = focusables.find(el => el.getAttribute('aria-label') !== 'MenÃ¼ sonu, baÅŸa dÃ¶nÃ¼lÃ¼yor' && el.tagName !== 'H1');
                    if (firstFocusable) {
                        firstFocusable.focus();
                    }
                }
                window.isMenuTransitioning = false;

                // BUG FIX: Bekleyen GÃ¼ncelleme varsa, ekran geÃ§iÅŸleri bittikten SONRA (Ã§arpÄ±ÅŸma riski olmadan) gÃ¶ster
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
    if (modeData.name !== 'KayÄ±p Notalar') {
        if (modeData.completionCount >= targetTurns) {
            statusText = " (TamamlandÄ±)";
            unlockedLabel += ". Bu mod uzmanlÄ±ÄŸÄ± tamamlandÄ±.";
        } else {
            let kalan = targetTurns - modeData.completionCount;
            statusText = ` (Tamamlanan: ${modeData.completionCount}, Hedef: ${targetTurns})`;
            unlockedLabel += `. Oynanan tur: ${modeData.completionCount}. Bir sonraki modu aÃ§mak iÃ§in kalan tur: ${kalan}.`;
        }
    } else {
        if (modeData.completionCount > 0) {
            statusText = ` (Tamamlanan: ${modeData.completionCount})`;
            unlockedLabel += `. Bu modu ${modeData.completionCount} kez tamamladÄ±nÄ±z.`;
        }
    }

    let myName = localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
    let isTesterOrDev = ['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(myName.toLowerCase());
    if (window.playerRanks && (window.playerRanks[myName.toLowerCase()] === 'Tester' || window.playerRanks[myName.toLowerCase()] === 'GeliÅŸtirici')) isTesterOrDev = true;

    if (modeData.isUnlocked || isTesterOrDev) {
        btnElement.removeAttribute('aria-disabled');
        btnElement.classList.remove('locked-btn');
        btnElement.innerHTML = modeData.name + (modeData.name === "Hayatta Kalma" ? "" : " Mod") + statusText;
        btnElement.setAttribute('aria-label', unlockedLabel);
    } else {
        btnElement.setAttribute('aria-disabled', 'true');
        btnElement.classList.add('locked-btn');
        const displayName = modeData.name === "Hayatta Kalma" ? modeData.name : modeData.name + " Mod";
        btnElement.innerHTML = displayName + " ÄŸÅ¸â€â€™";
        btnElement.setAttribute('aria-label', `${modeData.name} modu kilitli. AÃ§mak iÃ§in ${lockReason}.`);
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

    window.updateButtonUI(btnMedium, window.gameModes.medium, "Orta moddaki en yÃ¼ksek skoru gÃ¶rÃ¼ntÃ¼le", "Kolay modu 5 kez tamamla");
    window.updateButtonUI(btnHard, window.gameModes.hard, "Zor moddaki yÃ¼ksek skoru gÃ¶rÃ¼ntÃ¼le", "Orta modu 5 kez tamamla");
    window.updateButtonUI(btnMissingNotes, window.gameModes.missing_notes, "KayÄ±p notalar modu iÃ§in yÃ¼ksek skoru gÃ¶rÃ¼ntÃ¼le", "Zor modu 5 kez tamamla");
    if (btnRhythmScore) window.updateButtonUI(btnRhythmScore, window.gameModes.rhythm_mode, "Ritim AvcÄ±sÄ± iÃ§in yÃ¼ksek skoru gÃ¶rÃ¼ntÃ¼le", "KayÄ±p Notalar modunu tamamla");
};

window.updateDifficultyMenuLocks = function () {
    if (!window.gameModes) return;

    // AÃ§Ä±lma koÅŸullarÄ±nÄ± scoreboard gÃ¼ncellemesinde olduÄŸu gibi kontrol et
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
    window.updateButtonUI(btnMissingNotes, window.gameModes.missing_notes, "KayÄ±p Notalar Modu. Hikayeli piyano modu.", "Zor modu 5 kez tamamla");
    if (btnRhythm) window.updateButtonUI(btnRhythm, window.gameModes.rhythm_mode, "Ritim AvcÄ±sÄ± Oyna. Metronom eÅŸliÄŸinde Ã§al.", "KayÄ±p Notalar modunu tamamla");
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
        milestoneHtml = `<li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px; color: #ffb703; font-weight: bold;" aria-label="Sonraki dÃ¶nÃ¼m noktasÄ±na ${diff} gÃ¼n kaldÄ±. Hedef: ${nextM.day}. gÃ¼n. Ã–dÃ¼l: ${nextM.reward} Jeton">Hedef: ${nextM.day}. gÃ¼n! Kalan: ${diff} gÃ¼n. (Ã–dÃ¼l: ${nextM.reward} Jeton)</li>`;
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
    if (userAch && userAch.hafizam_gucleniyor) earnedAch.push("âœ… HafÄ±zam GÃ¼Ã§leniyor");
    if (userAch && userAch.buzsuz_3_gun) earnedAch.push("âœ… SadÄ±k Oyuncu");
    
    if (earnedAch.length > 0) {
        achievementsHtml = `<li style="margin-top: 15px; font-weight: bold; color: #4ade80;">KazanÄ±lan BaÅŸarÄ±mlar:</li>`;
        earnedAch.forEach(ach => {
            achievementsHtml += `<li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px; color: #4ade80;" aria-label="KazanÄ±ldÄ±: ${ach.replace('âœ… ', '')}">${ach}</li>`;
        });
    } else {
        achievementsHtml = `<li style="margin-top: 15px; font-weight: bold; color: #cbd5e1;">KazanÄ±lan BaÅŸarÄ±mlar:</li>`;
        achievementsHtml += `<li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px; color: #cbd5e1;" aria-label="HenÃ¼z kazandÄ±ÄŸÄ±nÄ±z bir baÅŸarÄ± yok.">HenÃ¼z kazandÄ±ÄŸÄ±nÄ±z bir baÅŸarÄ± yok.</li>`;
    }

    let html = "";
    if (tokens === 0 && hk === 0 && zk === 0 && easyCount === 0 && mediumCount === 0 && hardCount === 0 && storyCount === 0 && earnedAch.length === 0) {
        html = '<div id="empty-stats-alert" tabindex="0" role="textbox" aria-readonly="true" aria-label="Ä°statistik sekmesi boÅŸ. HiÃ§ bir istatistiÄŸe sahip deÄŸilsiniz." style="color: #ff4444; font-weight: bold; margin-top: 10px; padding: 15px; border: 2px solid #ff4444; border-radius: 8px; text-align: center; background: rgba(255,68,68,0.1);">Bu sekme boÅŸ. Ä°statistik bulunamadÄ±.</div>';
        if (window.announceToScreenReader && window.currentActiveMenu === 'stats') {
            setTimeout(() => window.announceToScreenReader("Bu sekme boÅŸ. HenÃ¼z hiÃ§ bir istatistiÄŸiniz bulunmuyor."), 300);
        }
    } else {
        html = `
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px;" class="stats-list">
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Bakiye: ${tokens} Jeton">Bakiye: ${tokens} Jeton</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="GÃ¼nlÃ¼k Seri Takvimi: ${streakCount} GÃ¼n">GÃ¼nlÃ¼k Seri (Takvim): ${streakCount} GÃ¼n</li>
                ${milestoneHtml}
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Seri Dondurma: ${sdCount} adet">Seri Dondurma: ${sdCount} adet</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Hata KorumasÄ±: ${hk} adet">Hata KorumasÄ±: ${hk} adet</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Zaman KorumasÄ±: ${zk} adet">Zaman KorumasÄ±: ${zk} adet</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Kolay Mod: ${easyCount} kez tamamlandÄ±">Kolay Mod: ${easyCount} kez tamamlandÄ±</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Orta Mod: ${mediumCount} kez tamamlandÄ±">Orta Mod: ${mediumCount} kez tamamlandÄ±</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Zor Mod: ${hardCount} kez tamamlandÄ±">Zor Mod: ${hardCount} kez tamamlandÄ±</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="KayÄ±p Notalar: ${storyCount} kez tamamlandÄ±">KayÄ±p Notalar: ${storyCount} kez tamamlandÄ±</li>
                <li tabindex="0" role="menuitem" class="stat-item" style="padding: 5px;" aria-label="Ritim AvcÄ±sÄ±: En YÃ¼ksek Seviye ${rhythmCount}">Ritim AvcÄ±sÄ±: En YÃ¼ksek Seviye ${rhythmCount}</li>
                ${achievementsHtml}
                <li style="margin-top: 15px;">
                    <button class="menu-button stat-copy-btn" aria-label="Ä°statistiklerimi Kopyala">Ä°statistiklerimi Kopyala</button>
                </li>
            </ul>
        `;
    }

    const statsContent = document.getElementById('stats-content');
    const profileStatsContent = document.getElementById('profile-stats-content');

    if (statsContent) statsContent.innerHTML = html;
    if (profileStatsContent) profileStatsContent.innerHTML = html;
    
    // Kopyalama butonu iÅŸlevini ata
    document.querySelectorAll('.stat-copy-btn').forEach(btn => {
        btn.onclick = function() {
            let copyText = `HafÄ±zana GÃ¼ven - Oyuncu Ä°statistikleri\r\nBakiye: ${tokens} Jeton\r\nGÃ¼nlÃ¼k Seri: ${streakCount} GÃ¼n\r\nSeri Dondurma: ${sdCount}\r\nHata KorumasÄ±: ${hk}\r\nZaman KorumasÄ±: ${zk}\r\nKolay: ${easyCount}\r\nOrta: ${mediumCount}\r\nZor: ${hardCount}\r\nKayÄ±p Notalar: ${storyCount}\r\nRitim AvcÄ±sÄ±: En YÃ¼ksek Seviye ${rhythmCount}`;
            navigator.clipboard.writeText(copyText).then(() => {
                if (window.announceToScreenReader) window.announceToScreenReader("Ä°statistikleriniz panoya kopyalandÄ±.", true);
                if (window.correctSound) window.correctSound.play();
            }).catch(() => {
                if (window.announceToScreenReader) window.announceToScreenReader("Kopyalama baÅŸarÄ±sÄ±z oldu.", true);
                if (window.wrongSound) window.wrongSound.play();
            });
        };
    });
};

// --- PRESENCE (VARLIK) & SOSYAL LÄ°STE SÄ°STEMÄ° ---
window.initPresenceSystem = function() {
    const checkDb = setInterval(() => {
        if (window.db) {
            clearInterval(checkDb);

            // --- GeliÅŸtirici Bilet (Geri Bildirim) Bildirimleri ---
            let devNameForTickets = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "";
            if (['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(devNameForTickets.toLowerCase())) {
                let isInitialFbLoad = true;
                window.db.ref('feedbacks').on('child_added', (snapshot) => {
                    if (!isInitialFbLoad) {
                        let fb = snapshot.val();
                        if (window.startAdminAlert) window.startAdminAlert('ticket');
                        let msg = `YENÄ° BÄ°LET GELDÄ°! GÃ¶nderen: ${fb.name || fb.nickname || "Bilinmiyor"}. Okumak iÃ§in sohbete /bilet yazÄ±n.`;
                        if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
                        if (window.showToastNotification) window.showToastNotification(msg, "warning");
                    }
                });
                
                window.db.ref('feedbacks').once('value').then(snapshot => {
                    isInitialFbLoad = false;
                    if (snapshot.exists() && snapshot.hasChildren()) {
                        let totalTickets = snapshot.numChildren();
                        setTimeout(() => {
                            if (window.startAdminAlert) window.startAdminAlert('ticket');
                            let msg = `Sistemde bekleyen ${totalTickets} adet aÃ§Ä±k bilet (geri bildirim) var. Ä°ncelemek iÃ§in sohbete /bilet yazÄ±n.`;
                            if (window.announceToScreenReader) window.announceToScreenReader(msg, false);
                            if (window.showToastNotification) window.showToastNotification(msg, "info");
                        }, 6000);
                    }
                });
            }
            // ----------------------------------------------------

            window.db.ref('.info/serverTimeOffset').on('value', snap => {
                window.serverTimeOffset = snap.val() || 0;
            });

            const connectedRef = window.db.ref('.info/connected');
            
            let wasConnected = false;
            let initialConnectionDone = false;
            connectedRef.on('value', (snap) => {
                let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
                if (!myName || myName.trim() === '' || myName === "Misafir") return;

                let safeId = myName.replace(/[.#$\[\]\/]/g, '_');
                let presenceRef = window.db.ref('presence/' + safeId);
                
                if (snap.val() === true) {
                    if (wasConnected === false && initialConnectionDone) {
                        if (window.announceToScreenReader) window.announceToScreenReader("Sunucuya yeniden baÄŸlandÄ±.", true);
                    }
                    wasConnected = true;
                    initialConnectionDone = true;
                    presenceRef.onDisconnect().set({ 
                        state: 'disconnected', 
                        name: myName,
                        last_changed: firebase.database.ServerValue.TIMESTAMP 
                    }).then(() => {
                        presenceRef.set({ 
                            state: 'online', 
                            name: myName,
                            last_changed: firebase.database.ServerValue.TIMESTAMP 
                        });
                    });
                } else {
                    if (wasConnected) {
                        if (window.announceToScreenReader) window.announceToScreenReader("Sunucu baÄŸlantÄ±nÄ±z kesildi.", true);
                        wasConnected = false;
                    }
                }
            });

            window.addEventListener('beforeunload', () => {
                let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
                if (myName && myName !== "Misafir" && window.db) {
                    let safeId = myName.replace(/[.#$\[\]\/]/g, '_');
                    window.db.ref('presence/' + safeId).set({ 
                        state: 'offline', 
                        name: myName,
                        last_changed: firebase.database.ServerValue.TIMESTAMP 
                    });
                }
            });

            let isFirstPresenceLoad = true;
            window.db.ref('presence').on('value', (snap) => {
                let newData = snap.val() || {};
                let oldData = window.lastPresenceData || {};
                let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
                
                let currentServerTime = Date.now() + (window.serverTimeOffset || 0);

                if (!isFirstPresenceLoad) {
                    for (let k in newData) {
                        let newP = newData[k];
                        let oldP = oldData[k];
                        if (newP.name && newP.name !== myName && newP.name !== "Misafir") {
                            // Spam KorumasÄ±: Sadece son 15 saniye iÃ§indeki olaylarÄ± anons et (Oyuna ilk giriÅŸteki birikmiÅŸ spam mesajlarÄ±nÄ± engeller)
                            let isRecent = newP.last_changed ? (currentServerTime - newP.last_changed < 15000) : false;
                            let disableOnlineStatus = localStorage.getItem('hafizaGuvenDisableOnlineStatus') === 'true';
                            
                            if (isRecent && !disableOnlineStatus) {
                                if (newP.state === 'online' && (!oldP || oldP.state !== 'online')) {
                                    if (window.playerOnlineSound) window.playerOnlineSound.play();
                                    if (window.announceToScreenReader) window.announceToScreenReader(`${newP.name} Ã§evrimiÃ§i.`);
                                    if (window.showToastNotification) window.showToastNotification(`${newP.name} Ã§evrimiÃ§i.`, 'info');
                                } else if (newP.state === 'offline' && (oldP && oldP.state === 'online')) {
                                    if (window.playerOfflineSound) window.playerOfflineSound.play();
                                    if (window.announceToScreenReader) window.announceToScreenReader(`${newP.name} Ã§evrimdÄ±ÅŸÄ±.`);
                                    if (window.showToastNotification) window.showToastNotification(`${newP.name} Ã§evrimdÄ±ÅŸÄ±.`, 'info');
                                } else if (newP.state === 'disconnected' && (oldP && oldP.state === 'online')) {
                                    if (window.serverDisconnectSound) window.serverDisconnectSound.play();
                                    if (window.announceToScreenReader) window.announceToScreenReader(`${newP.name} baÄŸlantÄ±sÄ± koptu.`);
                                    if (window.showToastNotification) window.showToastNotification(`${newP.name} baÄŸlantÄ±sÄ± koptu.`, 'warning');
                                }
                            }
                        }
                    }
                    for (let k in oldData) {
                        if (!newData[k] && oldData[k].name !== myName && oldData[k].name !== "Misafir" && oldData[k].state === 'online') {
                            let disableOnlineStatus = localStorage.getItem('hafizaGuvenDisableOnlineStatus') === 'true';
                            if (!disableOnlineStatus) {
                                if (window.serverDisconnectSound) window.serverDisconnectSound.play();
                                if (window.announceToScreenReader) window.announceToScreenReader(`${oldData[k].name} baÄŸlantÄ±sÄ± koptu.`);
                                if (window.showToastNotification) window.showToastNotification(`${oldData[k].name} baÄŸlantÄ±sÄ± koptu.`, 'warning');
                            }
                        }
                    }
                }

                window.lastPresenceData = newData;
                isFirstPresenceLoad = false;

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

    const emptyHtml = '<li tabindex="0" aria-label="Senden baÅŸka kimse yok.">Senden baÅŸka kimse yok.</li>';

    if (!window.lastPresenceData || Object.keys(window.lastPresenceData).length === 0) {
        listEl.innerHTML = '';
        
        const titleEl = document.getElementById('social-menu-title');
        const navBtnSocial = document.getElementById('nav-btn-social');
        let meCount = (myName !== "Misafir" && myName.trim() !== "") ? 1 : 0;
        
        if (titleEl) {
            titleEl.innerText = `Sosyal (${meCount} KiÅŸi Ã‡evrimiÃ§i)`;
            titleEl.setAttribute('aria-label', `Sosyal ve oyuncu menÃ¼sÃ¼. Ã…Âuan toplam ${meCount} kiÅŸi Ã§evrimiÃ§i. YÃ¶n tuÅŸlarÄ±yla gezinebilirsiniz.`);
        }
        
        if (navBtnSocial) {
            navBtnSocial.innerText = `Sosyal (${meCount})`;
            navBtnSocial.setAttribute('aria-label', `Sosyal MenÃ¼. ${meCount} kiÅŸi Ã§evrimiÃ§i.`);
        }

        if (myName !== "Misafir" && myName.trim() !== "") {
            let meLi = document.createElement('li');
            meLi.style.padding = "10px";
            meLi.style.borderRadius = "8px";
            meLi.style.marginBottom = "8px";
            meLi.style.backgroundColor = "rgba(0, 168, 132, 0.15)";
            meLi.style.borderLeft = "4px solid #00a884";
            meLi.style.display = "flex";
            meLi.style.justifyContent = "space-between";
            meLi.style.alignItems = "center";
            meLi.setAttribute('aria-label', `Sadece sen varsÄ±n. ${myName} olarak Ã§evrimiÃ§isin.`);
            meLi.setAttribute('tabindex', '0');
            meLi.innerHTML = `<span style="font-weight: bold; color: #e9edef;">${myName} (Sen)</span><span style="font-size: 0.9rem; font-weight: bold; color: #00a884;">Ã‡evrimiÃ§i</span>`;
            listEl.appendChild(meLi);
        } else {
            listEl.innerHTML = emptyHtml;
        }
        return;
    }

    let players = Object.values(window.lastPresenceData).filter(p => p.state === 'online' && p.name && p.name !== "Misafir");
    
    const titleEl = document.getElementById('social-menu-title');
    const navBtnSocial = document.getElementById('nav-btn-social');
    
    let totalCount = players.length;
    if (myName !== "Misafir" && myName.trim() !== "") totalCount += 1;

    if (titleEl) {
        titleEl.innerText = `Sosyal (${totalCount} KiÅŸi Ã‡evrimiÃ§i)`;
        titleEl.setAttribute('aria-label', `Sosyal ve oyuncu menÃ¼sÃ¼. Ã…Âuan toplam ${totalCount} kiÅŸi Ã§evrimiÃ§i. YÃ¶n tuÅŸlarÄ±yla gezinebilirsiniz.`);
    }
    
    if (navBtnSocial) {
        navBtnSocial.innerText = `Sosyal (${totalCount})`;
        navBtnSocial.setAttribute('aria-label', `Sosyal MenÃ¼. ${totalCount} kiÅŸi Ã§evrimiÃ§i.`);
    }

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
    
    // KullanÄ±cÄ±nÄ±n kendisini HER ZAMAN listenin en baÅŸÄ±na ekle
    if (myName !== "Misafir" && myName.trim() !== "") {
        let meLi = document.createElement('li');
        meLi.style.padding = "10px";
        meLi.style.borderRadius = "8px";
        meLi.style.marginBottom = "8px";
        meLi.style.backgroundColor = "rgba(0, 168, 132, 0.15)";
        meLi.style.borderLeft = "4px solid #00a884";
        meLi.style.display = "flex";
        meLi.style.justifyContent = "space-between";
        meLi.style.alignItems = "center";
        meLi.setAttribute('aria-label', `Sen. ${myName} olarak Ã§evrimiÃ§isin.`);
        meLi.setAttribute('tabindex', '0');
        meLi.innerHTML = `<span style="font-weight: bold; color: #e9edef;">${myName} (Sen)</span><span style="font-size: 0.9rem; font-weight: bold; color: #00a884;">Ã‡evrimiÃ§i</span>`;
        listEl.appendChild(meLi);
    }
    
    let foundAny = false;

    players.forEach(p => {
        if (!p.name || p.name === myName) return; // Kendini listede gÃ¶sterme
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
        statusSpan.innerText = isOnline ? "Ã‡evrimiÃ§i" : "Ã‡evrimdÄ±ÅŸÄ±";

        li.setAttribute('aria-label', `${p.name} kullanÄ±cÄ±sÄ± ÅŸuan ${isOnline ? "Ã§evrimiÃ§i" : "Ã§evrimdÄ±ÅŸÄ±"}. Ä°ÅŸlem yapmak iÃ§in tÄ±klayÄ±n veya Enter'a basÄ±n.`);
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

    if (!foundAny && (myName === "Misafir" || myName.trim() === "")) {
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
    // --- EriÅŸilebilirlik (ARIA) Dinamik EnjektÃ¶rÃ¼ (Sessiz Semantik / Role Gizleme) ---
    // KullanÄ±cÄ± talebi: bÃ¶lÃ¼m, bÃ¶lge, dÃ¼ÄŸme, grup gibi element rollerinin okunmamasÄ±.
    const applySilentRoles = (root) => {
        const elementsToNone = root.querySelectorAll ? root.querySelectorAll('.menu-container, nav, section, ul, div[role="group"], div[role="region"], div[role="presentation"], h1, h2, h3, h4, h5, h6') : [];
        elementsToNone.forEach(el => el.setAttribute('role', 'none'));

        // YalnÄ±zca tabindex'i olmayan li elemanlarÄ±nÄ±n rolÃ¼nÃ¼ none yap.
        const nonInteractiveLis = root.querySelectorAll ? root.querySelectorAll('li:not([tabindex="0"])') : [];
        nonInteractiveLis.forEach(el => el.setAttribute('role', 'none'));

        // NVDA'nÄ±n makale okur gibi takÄ±lmamasÄ± iÃ§in etkileÅŸimli her Ã¶ÄŸeye buton maskesi tak
        const buttonsToSilence = root.querySelectorAll ? root.querySelectorAll('button, .menu-button, .mobile-piano-key, [role="button"], li[tabindex="0"], div[tabindex="0"]') : [];
        buttonsToSilence.forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-roledescription', '\xA0'); // BoÅŸluk karakteri, NVDA sessiz okur
        });

        const dialogs = root.querySelectorAll ? root.querySelectorAll('[role="dialog"]') : [];
        dialogs.forEach(el => el.setAttribute('aria-roledescription', '\xA0'));
    };

    applySilentRoles(document);
    
    // Sonradan yÃ¼klenen (dinamik) Ã¶ÄŸeler iÃ§in kalkan
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

    // MenÃ¼ ButonlarÄ± BaÄŸlantÄ±larÄ±
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
            if (window.announceToScreenReader) window.announceToScreenReader("Oyun yeniden baÅŸlatÄ±lÄ±yor, lÃ¼tfen bekleyin...");
            
            // Arka plan kullanÄ±cÄ± verilerini (sessionStorage ve cache) temizle, oyuncu verilerini (localStorage) KORU.
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
                'baglama': 'BaÄŸlama',
                'kaval': 'Kaval',
                'flut': 'FlÃ¼t',
                'kanun': 'Kanun'
            };
            let curr = window.activeInstrument || localStorage.getItem('hafizaGuvenInstrument') || 'piano';
            let n = instMap[curr] || 'Piyano';
            btnChangeInst.innerText = "Ses Paketini DeÄŸiÅŸtir (" + n + ")";
            btnChangeInst.setAttribute('aria-label', "Ses paketini deÄŸiÅŸtirmek iÃ§in tÄ±klayÄ±n. GeÃ§erli paket: " + n);
            
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
            
            // Yeni seÃ§ilen ses paketinin arka plan mÃ¼ziÄŸine kullanÄ±cÄ±nÄ±n ses seviyesini uygula
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
                    b.innerText = (nextInst === inst) ? (instName + " Ses Paketini Kapat") : (instName + " Ses Paketini EtkinleÅŸtir");
                    b.setAttribute('aria-label', instName + " Ses Paketi. " + ((nextInst === inst) ? "Kapatmak" : "EtkinleÅŸtirmek") + " iÃ§in tÄ±klayÄ±n.");
                }
            };
            
            updateStoreBtn('buy-baglama-pack-btn', 'hafizaGuvenBaglamaPack', 'baglama', 'BaÄŸlama');
            updateStoreBtn('buy-kaval-pack-btn', 'hafizaGuvenKavalPack', 'kaval', 'Kaval');
            updateStoreBtn('buy-flut-pack-btn', 'hafizaGuvenFlutPack', 'flut', 'FlÃ¼t');
            updateStoreBtn('buy-kanun-pack-btn', 'hafizaGuvenKanunPack', 'kanun', 'Kanun');

            if (window.menuEnterSound) window.menuEnterSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Ses paketi deÄŸiÅŸtirildi. " + n + " aktif.");
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

            // Multiplayer modundan Ã§Ä±kÄ±lÄ±yorsa sunucudan kop (varsa)
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

    // "KayÄ±tlÄ± Oyundan Devam Et"
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

    // Sunucu MesajÄ± Devam Et Butonu
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
            
            localStorage.setItem('hafizaGuvenFirstTime_v2', 'false'); // Ä°ÅŸaretle
            window.firstTimeMusic = true; // MÃ¼ziÄŸin kesilmesini engelle
            
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

    // GÃ¼ncelleme YÃ¼kle Butonu
    const updateInstallBtn = document.getElementById('update-install-btn');
    if (updateInstallBtn) {
        updateInstallBtn.addEventListener('click', () => {
            if (updateInstallBtn.disabled) return;
            updateInstallBtn.disabled = true;
            if (window.announceToScreenReader) window.announceToScreenReader("GÃ¼ncelleme yÃ¼kleniyor, sayfa yenilenecek...", true);
            setTimeout(() => {
                window.location.reload(true);
            }, 1000);
        });
    }

    // Ä°statistikler MenÃ¼sÃ¼ Kontrolleri
    if (statsBtnMain) {
        statsBtnMain.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            if (window.updateStatsDisplay) window.updateStatsDisplay();
            if (window.switchMenu && window.mainMenu && window.statsMenu) {
                window.switchMenu(window.mainMenu, window.statsMenu, 'stats');
                if (window.announceToScreenReader) window.announceToScreenReader("Ä°statistikler menÃ¼sÃ¼");
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

    // Mobil alt menÃ¼ (Tab bar) Event Listeners
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
                if (window.announceToScreenReader) window.announceToScreenReader("Ana menÃ¼");
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
                if (window.announceToScreenReader) window.announceToScreenReader("Sosyal menÃ¼sÃ¼");
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
                if (window.announceToScreenReader) window.announceToScreenReader("Profil menÃ¼sÃ¼");
            }
        });
    }

    const btnChangeUsername = document.getElementById('btn-change-username');
    if (btnChangeUsername) {
        btnChangeUsername.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            let currentName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
            
            setTimeout(() => {
                let newName = prompt("Yeni kullanÄ±cÄ± adÄ±nÄ±zÄ± girin:", currentName !== "Bilinmeyen" ? currentName : "");
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
                        window.announceToScreenReader(`KullanÄ±cÄ± adÄ±nÄ±z baÅŸarÄ±yla ${newName} olarak deÄŸiÅŸtirildi.`, true);
                    }
                } else if (newName !== null) {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader("GeÃ§ersiz veya boÅŸ bir kullanÄ±cÄ± adÄ± girdiniz. Ä°ÅŸlem iptal edildi.", true);
                    }
                }
            }, 100);
        });
    }

    // PC Sekme GeÃ§iÅŸ KÄ±sayollarÄ± (Alt + 1, Alt + 2, Alt + 3)
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
            if (window.announceToScreenReader) window.announceToScreenReader("Ayarlar menÃ¼sÃ¼");
        });
        
        const goBackToMenu = () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.switchMenu(settingsMenuContainer, window.mainMenu, 'main');
        };

        settingsBackBtn.addEventListener('click', goBackToMenu);
        
        if (settingsSaveBtn) {
            settingsSaveBtn.addEventListener('click', () => {
                if (window.announceToScreenReader) window.announceToScreenReader("Ayarlar baÅŸarÄ±yla kaydedildi.", true);
                goBackToMenu();
            });
        }

        // Aktif Etkinlikler Butonu
        // Aktif Etkinlikler (Pasif Durum GÃ¶stergesi)
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
                eventsBtnMain.innerText = `Etkinlik: Ã‡ift Jeton (${diffHours}sa ${diffMinutes}dk)`;
                eventsBtnMain.setAttribute('aria-label', `Ã…Âu an Ã‡ift Jeton EtkinliÄŸi AKTÄ°F! EtkinliÄŸin bitmesine ${diffHours} saat ${diffMinutes} dakika kaldÄ±.`);
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
                eventsBtnMain.innerText = `SÄ±radaki Etkinlik: Ã‡ift Jeton (${diffDays}g ${diffHours}sa ${diffMinutes}dk)`;
                eventsBtnMain.setAttribute('aria-label', `Ã…Âu an aktif etkinlik yok. SÄ±radaki etkinlik: Ã‡ift Jeton EtkinliÄŸi. BaÅŸlamasÄ±na ${diffDays} gÃ¼n, ${diffHours} saat, ${diffMinutes} dakika var.`);
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
                    window.announceToScreenReader("MÃ¼zik sesi: yzde " + musicVolumeSlider.value);
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
                toggleMusicBtn.innerText = isMuted ? "Oyun mÃ¼ziÄŸini etkinleÅŸtir" : "Oyun mÃ¼ziÄŸini devre dÄ±ÅŸÄ± bÄ±rak";
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
                    window.announceToScreenReader(!currentMute ? "Oyun mÃ¼ziÄŸi devre dÄ±ÅŸÄ± bÄ±rakÄ±ldÄ±." : "Oyun mÃ¼ziÄŸi etkinleÅŸtirildi.", true);
                }
            });
        }

        const toggleIntroBtn = document.getElementById('toggle-intro-btn');
        window.updateIntroBtnState = () => {
            let skipIntro = localStorage.getItem('hafizaGuvenSkipIntro') === 'true';
            if (toggleIntroBtn) {
                toggleIntroBtn.innerText = skipIntro ? "BaÅŸlangÄ±Ã§ta logoyu atla (AÃ§Ä±k)" : "BaÅŸlangÄ±Ã§ta logoyu atla (KapalÄ±)";
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
                    window.announceToScreenReader(skipIntro ? "Oyun aÃ§Ä±lÄ±ÅŸÄ±nda logo atlanacak." : "Oyun aÃ§Ä±lÄ±ÅŸÄ±nda logo atlanmayacak.", true);
                }
            });
        }

        const toggleStoryBtn = document.getElementById('toggle-story-mode-btn');
        window.updateStoryBtnState = () => {
            let disableStory = localStorage.getItem('hafizaGuvenDisableStoryMode') === 'true';
            if (toggleStoryBtn) {
                toggleStoryBtn.innerText = disableStory ? "KayÄ±p Notalar Hikaye DiyaloÄŸunu Atla (AÃ§Ä±k)" : "KayÄ±p Notalar Hikaye DiyaloÄŸunu Atla (KapalÄ±)";
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
                    window.announceToScreenReader(disableStory ? "Hikaye diyaloglarÄ± atlanacak." : "Hikaye diyaloglarÄ± gÃ¶sterilecek.", true);
                }
            });
        }

        const toggleOnlineBtn = document.getElementById('toggle-online-status-btn');
        window.updateOnlineBtnState = () => {
            let disableOnline = localStorage.getItem('hafizaGuvenDisableOnlineStatus') === 'true';
            if (toggleOnlineBtn) {
                toggleOnlineBtn.innerText = disableOnline ? "Ã‡evrimiÃ§i Bildirimleri: KapalÄ±" : "Ã‡evrimiÃ§i Bildirimleri: AÃ§Ä±k";
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
                    window.announceToScreenReader(disableOnline ? "Ã‡evrimiÃ§i bildirimleri kapatÄ±ldÄ±." : "Ã‡evrimiÃ§i bildirimleri aÃ§Ä±ldÄ±.", true);
                }
            });
        }

        const toggleMetronomeBtn = document.getElementById('toggle-metronome-btn');
        window.updateMetronomeBtnState = () => {
            let metronomeState = localStorage.getItem('hafizaGuvenMetronome') || 'off';
            if (toggleMetronomeBtn) {
                let stateText = 'KapalÄ±';
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
                
                let stateText = metronomeState === 'off' ? "kapatÄ±ldÄ±" : metronomeState + " BPM olarak ayarlandÄ±";
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Metronom " + stateText, true);
                }
            });
        }

        const toggleMotivationBtn = document.getElementById('toggle-motivation-btn');
        window.updateMotivationBtnState = () => {
            let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
            if (toggleMotivationBtn) {
                toggleMotivationBtn.innerText = disableMotivation ? "Oyun Ä°Ã§i Motivasyon MesajlarÄ±: KapalÄ±" : "Oyun Ä°Ã§i Motivasyon MesajlarÄ±: AÃ§Ä±k";
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
                    window.announceToScreenReader(disableMotivation ? "Motivasyon mesajlarÄ± kapatÄ±ldÄ±." : "Motivasyon mesajlarÄ± aÃ§Ä±ldÄ±.", true);
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
                    window.announceToScreenReader("Oyun temasÄ± deÄŸiÅŸtirildi: " + selText, true);
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
                    window.announceToScreenReader("Klavye dÃ¼zeni deÄŸiÅŸtirildi: " + selText, true);
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
                    buyBaglamaPackBtn.innerText = isActive ? "BaÄŸlama Ses Paketini Kapat" : "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. " + (isActive ? "Kapatmak" : "EtkinleÅŸtirmek") + " iÃ§in tÄ±klayÄ±n.");
                } else {
                    buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketi SatÄ±n Al (500 Jeton)";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. NotalarÄ± piyano yerine baÄŸlama ile duyarsÄ±nÄ±z. KalÄ±cÄ± olarak sahip olursunuz. Fiyat: 500 Jeton.");
                }
            }

            if (buyKavalPackBtn) {
                let ownsKaval = localStorage.getItem('hafizaGuvenKavalPack') === 'true';
                if (ownsKaval) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kaval';
                    buyKavalPackBtn.innerText = isActive ? "Kaval Ses Paketini Kapat" : "Kaval Ses Paketini EtkinleÅŸtir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. " + (isActive ? "Kapatmak" : "EtkinleÅŸtirmek") + " iÃ§in tÄ±klayÄ±n.");
                } else {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketi SatÄ±n Al (100 Jeton)";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. NotalarÄ± piyano yerine kaval ile duyarsÄ±nÄ±z. KalÄ±cÄ± olarak sahip olursunuz. Fiyat: 100 Jeton.");
                }
            }

            if (buyFlutPackBtn) {
                let ownsFlut = localStorage.getItem('hafizaGuvenFlutPack') === 'true';
                if (ownsFlut) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'flut';
                    buyFlutPackBtn.innerText = isActive ? "FlÃ¼t Ses Paketini Kapat" : "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. " + (isActive ? "Kapatmak" : "EtkinleÅŸtirmek") + " iÃ§in tÄ±klayÄ±n.");
                } else {
                    buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketi SatÄ±n Al (200 Jeton)";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. NotalarÄ± piyano yerine flÃ¼t ile duyarsÄ±nÄ±z. KalÄ±cÄ± olarak sahip olursunuz. Fiyat: 200 Jeton.");
                }
            }

            if (buyKanunPackBtn) {
                let ownsKanun = localStorage.getItem('hafizaGuvenKanunPack') === 'true';
                if (ownsKanun) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kanun';
                    buyKanunPackBtn.innerText = isActive ? "Kanun Ses Paketini Kapat" : "Kanun Ses Paketini EtkinleÅŸtir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. " + (isActive ? "Kapatmak" : "EtkinleÅŸtirmek") + " iÃ§in tÄ±klayÄ±n.");
                } else {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketi SatÄ±n Al (300 Jeton)";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. NotalarÄ± piyano yerine kanun ile duyarsÄ±nÄ±z. KalÄ±cÄ± olarak sahip olursunuz. Fiyat: 300 Jeton.");
                }
            }
            
            if (window.announceToScreenReader) window.announceToScreenReader(`MaÄŸazaya hoÅŸ geldiniz. Mevcut jetonunuz: ${totalTokens}`);
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
                let msg = "Bu korumaya zaten sahipsiniz. AynÄ± anda sadece bir tane taÅŸÄ±yabilirsiniz.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            if (totalTokens < 50) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = `Yetersiz bakiye. Bu eÅŸya iÃ§in 50 jetona ihtiyacÄ±nÄ±z var. Mevcut jetonunuz: ${totalTokens}. Almak iÃ§in ${50 - totalTokens} jetona daha ihtiyacÄ±nÄ±z var.`;
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            totalTokens -= 50;
            localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
            localStorage.setItem('hafizaGuvenHataKorumasi', 1);
            if (window.buySound) window.buySound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`SatÄ±n alma baÅŸarÄ±lÄ±! 1 Hata KorumasÄ± eklendi. Kalan jeton: ${totalTokens}`);
        });
    }

    if (buyTimeShieldBtn) {
        buyTimeShieldBtn.addEventListener('click', () => {
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;

            if (zk > 0) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = "Bu korumaya zaten sahipsiniz. AynÄ± anda sadece bir tane taÅŸÄ±yabilirsiniz.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            if (totalTokens < 30) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = `Yetersiz bakiye. Bu eÅŸya iÃ§in 30 jetona ihtiyacÄ±nÄ±z var. Mevcut jetonunuz: ${totalTokens}. Almak iÃ§in ${30 - totalTokens} jetona daha ihtiyacÄ±nÄ±z var.`;
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            totalTokens -= 30;
            localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
            localStorage.setItem('hafizaGuvenZamanKorumasi', 1);
            if (window.buySound) window.buySound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`SatÄ±n alma baÅŸarÄ±lÄ±! 1 Zaman KorumasÄ± eklendi. Kalan jeton: ${totalTokens}`);
        });
    }

    if (buyStreakFreezeBtn) {
        buyStreakFreezeBtn.addEventListener('click', () => {
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let sd = parseInt(localStorage.getItem('hafizaGuvenSeriDondurma')) || 0;

            if (sd >= 2) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = "Bu eÅŸyadan en fazla 2 adet taÅŸÄ±yabilirsiniz.";
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            if (totalTokens < 80) {
                if (window.wrongSound) window.wrongSound.play();
                let msg = `Yetersiz bakiye. Bu eÅŸya iÃ§in 80 jetona ihtiyacÄ±nÄ±z var. Mevcut jetonunuz: ${totalTokens}. Almak iÃ§in ${80 - totalTokens} jetona daha ihtiyacÄ±nÄ±z var.`;
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
                return;
            }

            totalTokens -= 80;
            sd += 1;
            localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
            localStorage.setItem('hafizaGuvenSeriDondurma', sd);
            if (window.buySound) window.buySound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`SatÄ±n alma baÅŸarÄ±lÄ±! 1 Seri Dondurma eklendi. Kalan jeton: ${totalTokens}. Mevcut Seri Dondurma sayÄ±nÄ±z: ${sd}`);
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

                    buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("BaÄŸlama ses paketi kapatÄ±ldÄ±. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'baglama');
                    window.activeInstrument = 'baglama';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini Kapat";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("BaÄŸlama ses paketi etkinleÅŸtirildi!");
                    
                    if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                        buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                        buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                        buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                        buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                        buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                        buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 500) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eÅŸya iÃ§in 500 jetona ihtiyacÄ±nÄ±z var. Mevcut jetonunuz: ${totalTokens}. Almak iÃ§in ${500 - totalTokens} jetona daha ihtiyacÄ±nÄ±z var.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 500;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenBaglamaPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'baglama');
                window.activeInstrument = 'baglama';
                
                buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini Kapat";
                buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`SatÄ±n alma baÅŸarÄ±lÄ±! BaÄŸlama ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
                
                if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                    buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
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

                    buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kaval ses paketi kapatÄ±ldÄ±. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'kaval');
                    window.activeInstrument = 'kaval';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKavalPackBtn.innerText = "Kaval Ses Paketini Kapat";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kaval ses paketi etkinleÅŸtirildi!");
                    
                    if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                        buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                        buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                        buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                        buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                        buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                        buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 100) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eÅŸya iÃ§in 100 jetona ihtiyacÄ±nÄ±z var. Mevcut jetonunuz: ${totalTokens}. Almak iÃ§in ${100 - totalTokens} jetona daha ihtiyacÄ±nÄ±z var.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 100;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenKavalPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'kaval');
                window.activeInstrument = 'kaval';
                
                buyKavalPackBtn.innerText = "Kaval Ses Paketini Kapat";
                buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`SatÄ±n alma baÅŸarÄ±lÄ±! Kaval ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
                
                if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                    buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                    buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
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

                    buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("FlÃ¼t ses paketi kapatÄ±ldÄ±. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'flut');
                    window.activeInstrument = 'flut';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini Kapat";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("FlÃ¼t ses paketi etkinleÅŸtirildi!");
                    
                    if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                        buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                        buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                        buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                        buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                        buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                        buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 200) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eÅŸya iÃ§in 200 jetona ihtiyacÄ±nÄ±z var. Mevcut jetonunuz: ${totalTokens}. Almak iÃ§in ${200 - totalTokens} jetona daha ihtiyacÄ±nÄ±z var.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 200;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenFlutPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'flut');
                window.activeInstrument = 'flut';
                
                buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini Kapat";
                buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`SatÄ±n alma baÅŸarÄ±lÄ±! FlÃ¼t ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
                
                if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                    buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
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

                    buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kanun ses paketi kapatÄ±ldÄ±. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'kanun');
                    window.activeInstrument = 'kanun';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKanunPackBtn.innerText = "Kanun Ses Paketini Kapat";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kanun ses paketi etkinleÅŸtirildi!");
                    
                    if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                        buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                        buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                        buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                        buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                        buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                        buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 300) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = `Yetersiz bakiye. Bu eÅŸya iÃ§in 300 jetona ihtiyacÄ±nÄ±z var. Mevcut jetonunuz: ${totalTokens}. Almak iÃ§in ${300 - totalTokens} jetona daha ihtiyacÄ±nÄ±z var.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 300;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenKanunPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'kanun');
                window.activeInstrument = 'kanun';
                
                buyKanunPackBtn.innerText = "Kanun Ses Paketini Kapat";
                buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(`SatÄ±n alma baÅŸarÄ±lÄ±! Kanun ses paketi eklendi ve aktif edildi. Kalan jeton: ${totalTokens}`);
                
                if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                    buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                    buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
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
                html += '<li tabindex="0" role="menuitem" class="stat-item" style="color: #4ade80;" aria-label="KazanÄ±ldÄ±: HafÄ±zam GÃ¼Ã§leniyor. Kolay modu 2 kez tamamla.">Ã¢Å“â€¦ HafÄ±zam GÃ¼Ã§leniyor (Kolay modu 2 kez tamamla)</li>';
            } else {
                html += '<li tabindex="0" role="menuitem" class="stat-item" style="color: #cbd5e1;" aria-label="Kilitli: HafÄ±zam GÃ¼Ã§leniyor. Kolay modu 2 kez tamamla.">ÄŸÅ¸â€â€™ HafÄ±zam GÃ¼Ã§leniyor (Kolay modu 2 kez tamamla)</li>';
            }
            
            if (window.userAchievements.buzsuz_3_gun) {
                html += '<li tabindex="0" role="menuitem" class="stat-item" style="color: #4ade80;" aria-label="KazanÄ±ldÄ±: SadÄ±k Oyuncu. 3 GÃ¼n boyunca seri dondurma kullanmadan giriÅŸ yap.">Ã¢Å“â€¦ SadÄ±k Oyuncu (3 GÃ¼n boyunca seri dondurma kullanmadan giriÅŸ yap)</li>';
            } else {
                html += `<li tabindex="0" role="menuitem" class="stat-item" style="color: #cbd5e1;" aria-label="Kilitli: SadÄ±k Oyuncu. 3 GÃ¼n boyunca seri dondurma kullanmadan giriÅŸ yap. Ä°lerleme: ${bg} bÃ¶lÃ¼ 3 gÃ¼n.">Ã¢ÂÂ³ SadÄ±k Oyuncu (3 GÃ¼n boyunca seri dondurma kullanmadan giriÅŸ) - Ä°lerleme: ${bg}/3</li>`;
            }
            
            html += '</ul>';
            if (contentDiv) contentDiv.innerHTML = html;
            
            let text = "BaÅŸarÄ±lar menÃ¼sÃ¼ aÃ§Ä±ldÄ±. Durumunuzu kontrol edebilirsiniz.";
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
            let desc = document.getElementById('feedback-desc'); // aria-live okuma alanÄ±
            let btn = this;

            if (!text) {
                desc.textContent = "Hata: LÃ¼tfen bilet mesajÄ±nÄ±zÄ± boÅŸ bÄ±rakmayÄ±n.";
                document.getElementById('feedback-text').focus();
                return;
            }

            desc.textContent = "Sunucuya baÄŸlanÄ±lÄ±yor, lÃ¼tfen bekleyin...";
            btn.disabled = true;

            // Firebase'e veriyi gÃ¶nder
            firebase.database().ref('feedbacks').push({
                name: name,
                category: category,
                message: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                desc.textContent = "BaÅŸarÄ±lÄ±! Geri bildiriminiz BaÅŸyÃ¶netmen'e gÃ¼venle iletildi.";
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
                desc.textContent = "BaÄŸlantÄ± hatasÄ±: " + error.message;
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
            window.inPracticeTutorial = false; // EÄŸitim durumunu gÃ¼venle kapat
            window.isDialogPhase = false; // DiyaloglarÄ± sÄ±fÄ±rla
            window.isStarted = false; // Oyunu / alÄ±ÅŸtÄ±rmayÄ± sonlandÄ±r
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
                    if (window.announceToScreenReader) window.announceToScreenReader("LÃ¼tfen 4 haneli geÃ§erli bir oda kodu girin.", true);
                }
            }
        });
    }

    // Ekstra: Ã…Âifre alanÄ±nda enter tuÅŸu ile onSubmit tetikleme
    if (pvpJoinCodeInput) {
        pvpJoinCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && pvpJoinSubmitBtn) {
                pvpJoinSubmitBtn.click();
            }
        });
    }

    // Ana MenÃ¼den Oyun Modu SeÃ§imine GeÃ§iÅŸ
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
                if (window.announceToScreenReader) window.announceToScreenReader("EÅŸleÅŸtirme sistemi henÃ¼z yÃ¼klenmedi.");
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
                    
                    if (window.announceToScreenReader) window.announceToScreenReader("Oda kodu kopyalandÄ±: " + textToCopy);
                    const originalText = "Kodu Kopyala";
                    pvpLobbyCopyBtn.innerText = "KopyalandÄ±!";
                    setTimeout(() => pvpLobbyCopyBtn.innerText = originalText, 2000);
                } catch (err) {
                    if (window.announceToScreenReader) window.announceToScreenReader("Kopyalama iÅŸlemi desteklenmiyor. LÃ¼tfen kodu manuel olarak seÃ§in: " + textToCopy);
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
                    window.PvP.createMatch(); // EÅŸleÅŸme aramak yerine OdayÄ± kurup bekler
                }
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("EÅŸleÅŸtirme sistemi henÃ¼z yÃ¼klenmedi.");
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
                if (window.announceToScreenReader) window.announceToScreenReader("Bot sistemi henÃ¼z yÃ¼klenmedi.");
            }
        });
    }

    if (mpSelectBackBtn) {
        mpSelectBackBtn.addEventListener('click', () => {
            // EÅŸleÅŸtirme sÄ±rasÄ±nda geri basÄ±p kaÃ§arsa tÃ¼m iÅŸlemi katlet
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

    // Oyun BaÅŸlatma (GerÃ§ekleÅŸme)
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

// Evrensel ESC TuÅŸu ve Mobil Geri TuÅŸu KorumasÄ±
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // CanlÄ± sohbet kendi ESC dinleyicisine sahip
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

        // OYUN VE HÄ°KAYE MODUNDAN GÃœVENLÄ° KAÃ‡IÃ…Â PROTOKOLÃœ
        if (window.currentActiveMenu === 'game' || window.currentActiveMenu === 'story') {
            const mobileGameBackBtn = document.getElementById('mobile-game-back-btn');
            const gameBackBtn = document.getElementById('game-back-btn');
            
            if (mobileGameBackBtn) {
                mobileGameBackBtn.click(); // Hikaye ve Oyun Ã§Ä±kÄ±ÅŸÄ±nÄ± gÃ¼venle tetikler
            } else if (gameBackBtn) {
                gameBackBtn.click();
            }
            return;
        }
    }
});

window.addEventListener('popstate', (e) => {
    // 1. CanlÄ± sohbet aÃ§Ä±ksa kapat
    if (window.isChatOpen && typeof window.toggleChat === 'function') {
        window.toggleChat();
        history.pushState(null, "", "");
        return;
    }
    
    // 2. Alt menÃ¼ler aÃ§Ä±ksa kapat
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

// MenÃ¼ iÃ§i ok tuÅŸlarÄ±yla gezinme iÅŸlevi
document.addEventListener('keydown', function (event) {
    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        let allowThrough = false;
        if (window.currentActiveMenu === 'settings' && (document.activeElement.type === 'range' || document.activeElement.tagName === 'SELECT')) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                allowThrough = true; // YÃ¶n tuÅŸlarÄ±nÄ±n menÃ¼ gezinmesi ve deÄŸer deÄŸiÅŸtirme mantÄ±ÄŸÄ±na inmesine izin ver
            }
        }
        if (!allowThrough) {
            return;
        }
    }

    // MaÄŸaza miktar belirleme ('+', '-', 'ArrowRight', 'ArrowLeft') ve Okuma (Sessiz Kasiyer KorumasÄ±)
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

    // Sohbet penceresi aÃ§Ä±kken ana menÃ¼ yÃ¶n tuÅŸlarÄ± gezinimini devre dÄ±ÅŸÄ± bÄ±rak
    if (window.isChatOpen) {
        return;
    }

    // SeÃ§enekler (Ayarlar) menÃ¼sÃ¼nde yukarÄ±/aÅŸaÄŸÄ± oklarÄ±yla dolaÅŸmayÄ± iptal ederek "Tab" kullanÄ±mÄ±nÄ± (standart gezinme) zorla
    if (window.currentActiveMenu === 'settings') {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            return;
        }
    }

    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Enter'].includes(event.key)) {
        // Ok tuÅŸlarÄ±yla mesajÄ± tekrar okuma ve Enter ile sessizce geÃ§me mantÄ±ÄŸÄ±
        if ((window.currentActiveMenu === 'story' && window.isDialogPhase) ||
            (window.currentActiveMenu === 'practice' && window.isDialogPhase) ||
            window.currentActiveMenu === 'server-message' ||
            window.currentActiveMenu === 'update') {
            
            event.preventDefault();

            if (event.key === 'Enter') {
                // Sadece EntÄ±ra basÄ±lÄ±nca onaylansÄ±n
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
                    // Story.js enter'Ä± kendi game.js iÃ§inden dinliyor olabilir
                }
                return;
            }

            // Ok tuÅŸlarÄ±na basÄ±ldÄ±ysa mevcut mesajÄ± tekrar okut
            let textToRead = "";
            if (window.currentActiveMenu === 'story' && window.missingNotesDialogues) {
                textToRead = window.missingNotesDialogues[window.currentStoryIndex];
            } else if (window.currentActiveMenu === 'practice' && window.practiceDialogues) {
                textToRead = window.practiceDialogues[window.currentDialogIndex];
            } else if (window.currentActiveMenu === 'server-message') {
                let p = document.getElementById('server-message-text');
                if (p) textToRead = "YapÄ±lan Son DeÄŸiÅŸiklik: " + (p.innerText || p.textContent);
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

        if (event.key === 'Enter') return; // Sadece ok tuÅŸlarÄ±nÄ± menÃ¼ gezinmesine bÄ±rak

        const activeButtons = window.getActiveButtons();
        if (activeButtons.length === 0) return;

        const activeElem = document.activeElement;
        
        // Ayarlar menÃ¼sÃ¼nde Ã¶zel ok saÄŸ/sol davranÄ±ÅŸÄ± (sadece deÄŸer deÄŸiÅŸtir, menÃ¼ dolaÅŸma)
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
            return; // Butonlardaysak sol/saÄŸ oklar hiÃ§bir ÅŸey yapmasÄ±n.
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

// --- CANLI SOHBET SÄ°STEMÄ° ARAYÃœZ MANTIÃ„ÂI ---
window.isChatOpen = false;

// --- ANLIK BÄ°LDÄ°RÄ°M (TOAST) FONKSÄ°YONU ---
window.showToastNotification = function(text) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('aria-hidden', 'true');
    toast.innerText = text;
    document.body.appendChild(toast);
    
    // GÃ¶rÃ¼nÃ¼r yap
    setTimeout(() => toast.classList.add('show'), 50);

    // 3.5 saniye sonra kaldÄ±r
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // animasyon bekleme sÃ¼resi
    }, 3500);
};

document.addEventListener('DOMContentLoaded', () => {
    // NVDA Hayalet Ekran KorumasÄ±: Sayfa ilk aÃ§Ä±ldÄ±ÄŸÄ±nda kapalÄ± olan tÃ¼m menÃ¼leri "inert" yap
    document.querySelectorAll('.menu-container').forEach(menu => {
        if (menu.id !== 'main-menu-container') {
            menu.setAttribute('inert', '');
        }
    });

    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatPanel = document.getElementById('chat-panel');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatNicknameInput = document.getElementById('chat-nickname');

    if (chatToggleBtn) {
        // CanlÄ± Sohbet butonu oyun genelinde gÃ¶rÃ¼nsÃ¼n ama ilk aÃ§Ä±lÄ±ÅŸta okuyucu odaÄŸÄ±na takÄ±lmasÄ±n diye
        // Sadece PvP lobisi ve genel oyun odasÄ±nda aktif hale gelmeli
        chatToggleBtn.style.display = 'none';
        chatToggleBtn.setAttribute('inert', '');
        chatToggleBtn.setAttribute('aria-hidden', 'true');
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
            // Sohbet aÃ§Ä±ldÄ±ÄŸÄ±nda geÃ§miÅŸ mesajlarÄ±n gÃ¶rÃ¼nmesi iÃ§in en alta kaydÄ±r
            const chatMessagesContainer = document.querySelector('.chat-messages-container');
            if (chatMessagesContainer) {
                setTimeout(() => {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                }, 50);
            }
            if (window.announceToScreenReader) {
                if (chatNicknameInput && chatNicknameInput.style.display === 'none') {
                    window.announceToScreenReader('CanlÄ± sohbet aÃ§Ä±ldÄ±. MesajÄ±nÄ±zÄ± yazabilirsiniz.', false);
                } else {
                    window.announceToScreenReader('CanlÄ± sohbet aÃ§Ä±ldÄ±. Takma adÄ±nÄ±zÄ± girin.', false);
                }
            }

            // Presence AÅŸama 2: Ä°lk KatÄ±lÄ±m ve Ã‡Ä±kÄ±ÅŸ KancasÄ±
            if (window.hasJoinedChat === false && window.db) {
                window.hasJoinedChat = true;
                
                // Ä°lk katÄ±lÄ±m mesajÄ± (Sistem bildirimleri kalÄ±cÄ± olarak sohbete itilmeyecek)
                
                // BaÅŸlangÄ±Ã§ Ã‡Ä±kÄ±ÅŸ KancasÄ± (Sohbet kanalÄ±na "Ã§evrimdÄ±ÅŸÄ± oldu" spamlamasÄ±nÄ± kaldÄ±rdÄ±k)
                if (window.disconnectRef) { window.disconnectRef.onDisconnect().cancel(); }
                // disconnectRef artÄ±k sadece presence iÃ§in kullanÄ±lacak, messages kanalÄ±nÄ± kirletmeyecek.
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

            if (window.announceToScreenReader) window.announceToScreenReader('CanlÄ± sohbet kapatÄ±ldÄ±.', false);
        }
    };

    // Nokta (.) kÄ±sayolu, ESC tuÅŸu ve Ok TuÅŸlarÄ±yla Gezinme
    document.addEventListener('keydown', (e) => {
        // Nokta (.) tuÅŸuyla sohbeti SADECE aÃ§
        if (e.key === '.' && !window.isChatOpen && (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT'))) {
            window.toggleChat();
        }
        
        // ESC tuÅŸuyla sohbeti hÄ±zlÄ±ca kapat
        if (e.key === 'Escape' && window.isChatOpen) {
            window.toggleChat();
        }
        
        // Sohbet mesajlarÄ±nda YukarÄ±/AÅŸaÄŸÄ± ok tuÅŸu ile gezinme
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

    // Mobil: Ä°ki Parmakla Ã‡ift Dokunma (2-Finger Double Tap) Jest AlgÄ±layÄ±cÄ±sÄ±
    let lastTwoFingerTap = 0;
    document.addEventListener('touchstart', (e) => {
        // EÄŸer focus input/textarea/select Ã¼zerindeyse yoksay (yazÄ±ÅŸmayÄ± bÃ¶lmesin)
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
            return;
        }

        // Tam olarak 2 parmak ekrandaysa
        if (e.touches.length === 2) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTwoFingerTap;
            
            // EÄŸer Ã¶nce iki parmak dokunup hemen ardÄ±ndan tekrar 2 parmak dokunduysa (Ã‡ift DokunuÅŸ)
            // SÃ¼re aralÄ±ÄŸÄ± 400ms'den kÄ±sa olmalÄ± (mobil cihazlardaki tipik Ã§ift tÄ±klama hÄ±zÄ±)
            if (tapLength < 450 && tapLength > 0) {
                if (typeof window.toggleChat === 'function') {
                    window.toggleChat();
                    // Ekran okuyuculardan veya Safari'den varsayÄ±lan olay sÄ±zmasÄ±nÄ± engellemek
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
            }
            lastTwoFingerTap = currentTime;
        }
    }, { passive: false });
});

// --- CANLI SOHBET SÄ°STEMÄ° VERÄ°TABANI (FÄ°REBASE) MANTIÃ„ÂI ---
document.addEventListener('DOMContentLoaded', () => {
    const chatNicknameInput = document.getElementById('chat-nickname');
    const chatMessageInput = document.getElementById('chat-message-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessagesList = document.getElementById('chat-messages');
    const chatMessagesContainer = document.querySelector('.chat-messages-container');
    
    // Presence (Durum) DeÄŸiÅŸkenleri (Global olarak ayarlandÄ±)
    const savedNickname = localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname');
    window.currentChatUser = savedNickname ? savedNickname : "Misafir";
    window.hasJoinedChat = false;

    // Firebase tanÄ±mlÄ± deÄŸilse veya arayÃ¼z yoksa dur
    if (!chatSendBtn || !chatMessagesList || !window.db) return;

    // Oturumda veya kalÄ±cÄ± hafÄ±zada daha Ã¶nce kaydedilmiÅŸ bir Takma Ad varsa onu otomatik yÃ¼kle ve kutuyu gizle
    if (savedNickname) {
        chatNicknameInput.value = savedNickname;
        chatNicknameInput.style.display = 'none'; // KullanÄ±cÄ± adÄ± bir kere girildikten sonra sekme kapanana kadar veya kalÄ±cÄ± olarak gizlenir
    }

    // Takma ad kutusundayken de Enter'a basÄ±lÄ±rsa mesaj gÃ¶nderilsin
    if (chatNicknameInput) {
        chatNicknameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // GÃ¼venlik (XSS) KorumasÄ± (HTML etiketlerini etkisiz hale getir)
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

    // Mesaj GÃ¶nderme Ä°ÅŸlevi
    function sendMessage() {
        let nickInput = document.getElementById('chat-nickname');
        let msgInput = document.getElementById('chat-message-input');

        // BoÅŸluklarÄ± tÄ±raÅŸla
        let nickVal = nickInput ? nickInput.value.trim() : "";
        let msgVal = msgInput ? msgInput.value.trim() : "";

        if (nickVal === "" || msgVal === "") {
            // Mesaj veya isim tamamen boÅŸluktan ibaretse veya boÅŸsa
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "LÃ¼tfen geÃ§erli bir takma ad ve mesaj girin. BoÅŸ mesaj gÃ¶nderilemez.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            
            // Ä°mleci eksik olan yere odakla
            if (nickVal === "" && nickInput) nickInput.focus();
            else if (msgInput) msgInput.focus();
            
            return; // GÃ¶nderimi iptal et ve sistemi koru!
        }

        const nickname = nickVal;
        const text = msgVal;

        // Firebase Yolu KuralÄ±: Ä°simlerde '.', '#', '$', '[', ']' veya '/' kullanÄ±lamaz. 
        // Aksi takdirde uygulama sessizce ve senkron olarak Ã§Ã¶ker.
        if (/[.#$\[\]\/]/.test(nickname)) {
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "KullanÄ±cÄ± adÄ±nÄ±zda geÃ§ersiz karakterler bulunuyor. LÃ¼tfen nokta veya kÃ¶ÅŸeli parantez gibi hatalÄ± sembolleri silin.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            if (nickInput) {
                // Temizleyerek otomatik dÃ¼zeltilmiÅŸ halini sun
                nickInput.value = nickname.replace(/[.#$\[\]\/]/g, '');
                nickInput.focus();
            }
            return; // Ã‡Ã¶kmesini Ã¶nle
        }

        // KULLANICI ADI GÃœVENLÄ°K (REGISTRATION) KONTROLÃœ
        let myDevId = localStorage.getItem('hafizaGuvenDeviceId');
        if (!myDevId) {
            myDevId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('hafizaGuvenDeviceId', myDevId);
        }

        window.db.ref('registeredUsers/' + nickname).once('value').then(snapshot => {
            const existingOwner = snapshot.val();
            
            // EÄŸer baÅŸkasÄ±na aitse durdur
            if (existingOwner && existingOwner !== myDevId) {
                if (window.wrongSound) window.wrongSound.play();
                let uyari = `"${nickname}" kullanÄ±cÄ± adÄ± daha Ã¶nce baÅŸkasÄ± tarafÄ±ndan alÄ±nmÄ±ÅŸ. LÃ¼tfen farklÄ± bir isim seÃ§in.`;
                if (window.announceToScreenReader) window.announceToScreenReader(uyari);
                let desc = document.getElementById('chat-desc') || document.getElementById('sr-chat-reader');
                if (desc) desc.textContent = "BaÄŸlantÄ± HatasÄ±: KullanÄ±cÄ± adÄ± kullanÄ±mda.";
                
                if (nickInput) {
                    nickInput.value = "";
                    nickInput.focus();
                }
                return;
            }

            // Yeni kullanÄ±cÄ± adÄ± ise benim adÄ±ma kaydet
            if (!existingOwner) {
                window.db.ref('registeredUsers/' + nickname).set(myDevId);
            }

            // ArtÄ±k nick bize ait. Uygulama hafÄ±zasÄ±na kalÄ±cÄ± kaydet.
            localStorage.setItem('chatUsername', nickname);
            window.currentChatUser = nickname;

            if (nickInput) {
                nickInput.style.display = 'none'; // BaÅŸarÄ±yla kilitlendi, bir daha sorma
            }

            // --- GÄ°ZLÄ° SOHBET KOMUTLARI (CLIENT-SIDE) ---
            if (text.startsWith('/')) {
                const args = text.split(' ');
                const command = args[0].toLowerCase();
                const chatMessagesListLocal = document.getElementById('chat-messages');
            const chatMessagesContainerLocal = document.querySelector('.chat-messages-container');
            const chatMessageInputLocal = document.getElementById('chat-message-input');
            
            // KullanÄ±cÄ± GeliÅŸtirici Mi KontrolÃ¼
            let cUserNick = window.currentChatUser || "";
            let nickInputTemp = document.getElementById('chat-nickname');
            if (nickInputTemp && nickInputTemp.value.trim() !== "") cUserNick = nickInputTemp.value.trim();
            let isDev = ['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(cUserNick.toLowerCase());

            function addLocalSystemMessage(msgText) {
                // Sadece ekranda anlÄ±k (toast) gÃ¶sterip ekran okuyucuya okutuyoruz.
                // Chat listesini (DOM'u) kalÄ±cÄ± olarak iÅŸgal edip kalabalÄ±k yapmasÄ±nÄ± engelledik.
                if (window.showToastNotification) {
                    window.showToastNotification(msgText, "info");
                }
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(msgText, false);
                }
            }

            if (command === '/temizle') {
                if (!isDev) { addLocalSystemMessage("Hata: Bu iÅŸlem iÃ§in 'GeliÅŸtirici' yetkiniz yok."); return; }
                if (chatMessagesListLocal) chatMessagesListLocal.innerHTML = '';
                addLocalSystemMessage("Sohbet geÃ§miÅŸiniz (sadece sizin ekranÄ±nÄ±zda) temizlendi.");
                
                // GÄ°ZLÄ° GLOBAL SIFIRLAMA KOMUTU
                if (window.db) {
                    window.db.ref('player_stats').remove();
                    window.db.ref('global_wipe_timestamp').set(firebase.database.ServerValue.TIMESTAMP);
                    addLocalSystemMessage("DÄ°KKAT: Global Wipe (KÃ¼resel SÄ±fÄ±rlama) Komutu Ã§alÄ±ÅŸtÄ±rÄ±ldÄ±! TÃ¼m oyuncularÄ±n istatistikleri ve Firebase bulut yedekleri siliniyor...");
                }
            } else if (command === '/saat' || command === '/zaman') {
                addLocalSystemMessage("Ã…Âu anki cihaz saati: " + new Date().toLocaleTimeString('tr-TR'));
            } else if (command === '/jeton' || command === '/bakiye') {
                const totalTokensLocal = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                addLocalSystemMessage(`CÃ¼zdanÄ±nÄ±zdaki mevcut bakiye: ${totalTokensLocal} jeton.`);
            } else if (command === '/bilet') {
                if (isDev) {
                    if (window.stopAdminAlert) window.stopAdminAlert('ticket');
                    addLocalSystemMessage("Sistemdeki tÃ¼m aÃ§Ä±k biletler (Geri bildirimler) taranÄ±yor...");
                    if (window.db) {
                        window.db.ref('feedbacks').once('value').then(snapshot => {
                            if (!snapshot.exists() || !snapshot.hasChildren()) {
                                addLocalSystemMessage("Sistemde aÃ§Ä±k hiÃ§bir bilet/geri bildirim bulunmuyor. Harika!");
                            } else {
                                let count = 0;
                                snapshot.forEach(child => {
                                    count++;
                                    let fb = child.val();
                                    addLocalSystemMessage(`AÃ§Ä±k Bilet #${count} [GÃ¶nderen: ${fb.nickname}] => ${fb.message}`);
                                });
                                addLocalSystemMessage(`Toplam ${count} adet aÃ§Ä±k bilet listelendi. YanÄ±tlamak ve Ã§Ã¶zmek iÃ§in: /Ã§Ã¶z <takma_ad> <mesajÄ±nÄ±z>`);
                            }
                        });
                    }
                } else {
                    let currentUser = window.currentChatUser;
                    let nickInputValue = chatMessageInputLocal && document.getElementById('chat-nickname') ? document.getElementById('chat-nickname').value.trim() : "";
                    if (nickInputValue !== "") currentUser = nickInputValue;
                    
                    if (!currentUser || currentUser === "Misafir") {
                        addLocalSystemMessage("Biletlerinizi sorgulamak iÃ§in bir takma ad belirlemiÅŸ olmanÄ±z gerekir.");
                    } else {
                        addLocalSystemMessage("Biletleriniz sorgulanÄ±yor, lÃ¼tfen bekleyin...");
                        if (window.db) {
                            let biletFound = false;
                            let count = 0;
                            
                            // 1. HenÃ¼z Ã§Ã¶zÃ¼lmemiÅŸ, gÃ¶nderilen aÃ§Ä±k biletleri kontrol et
                            window.db.ref('feedbacks').once('value').then(snapshot => {
                                if (snapshot.exists()) {
                                    snapshot.forEach(child => {
                                        let fb = child.val();
                                        if (fb.nickname && fb.nickname.toLowerCase() === currentUser.toLowerCase()) {
                                            count++;
                                            biletFound = true;
                                            addLocalSystemMessage(`Bilet #${count} | Durum: GeliÅŸtiriciye ulaÅŸtÄ±, inceleniyor Ã¢ÂÂ³ | Ã…Âikayetiniz: ${fb.message}`);
                                        }
                                    });
                                }
                                
                                // 2. Ã‡Ã¶zÃ¼lmÃ¼ÅŸ veya yÃ¶netici tarafÄ±ndan yanÄ±tlanmÄ±ÅŸ biletleri kontrol et
                                window.db.ref('biletler/' + currentUser).once('value').then(snap2 => {
                                    if (snap2.exists() && snap2.hasChildren()) {
                                        snap2.forEach(child => {
                                            count++;
                                            biletFound = true;
                                            let biletData = child.val();
                                            let mesaj = typeof biletData === 'string' ? biletData : (biletData.message || biletData.mesaj || "TanÄ±msÄ±z");
                                            
                                            addLocalSystemMessage(`Bilet #${count} | Durum: Ã‡Ã¶zÃ¼ldÃ¼ Ã¢Å“â€¦ (Otomatik silindi) | GeliÅŸtirici YanÄ±tÄ±: ${mesaj}`);
                                            child.ref.remove(); // OkunduÄŸu iÃ§in sil
                                        });
                                    }
                                    
                                    if (!biletFound) {
                                        addLocalSystemMessage("Ã…Âu anda adÄ±nÄ±za tanÄ±mlÄ± aÃ§Ä±k veya yeni Ã§Ã¶zÃ¼lmÃ¼ÅŸ hiÃ§bir bilet bulunamadÄ±.");
                                    } else {
                                        addLocalSystemMessage(`Toplam ${count} adet bilet-kayÄ±t listelendi.`);
                                    }
                                });
                            }).catch(err => {
                                addLocalSystemMessage("BaÄŸlantÄ± hatasÄ±: Bilet veritabanÄ±na ulaÅŸÄ±lamadÄ±.");
                            });
                        } else {
                            addLocalSystemMessage("VeritabanÄ± baÄŸlantÄ±sÄ± yok.");
                        }
                    }
                }
            } else if (command === '/yardim' || command === '/yardÄ±m') {
                addLocalSystemMessage("Mevcut komutlar: /temizle, /saat, /jeton, /bilet, /ziyaretci, /yardÄ±m.");
            } else if (command === '/ziyaretci' || command === '/ziyaretÃ§i') {
                if (!isDev) { 
                    addLocalSystemMessage("Hata: Bu komut sadece geliÅŸtiriciye Ã¶zeldir."); 
                } else {
                    addLocalSystemMessage("Site ziyaretÃ§i istatistikleri Ã§ekiliyor...");
                    if (window.db) {
                        window.db.ref('site_stats/total_visitors').once('value').then(snap => {
                            let total = snap.val() || 0;
                            addLocalSystemMessage(`Mikyas Studio Web Sitenizi Toplam Ziyaret Eden KiÅŸi SayÄ±sÄ±: ${total}`);
                        }).catch(() => addLocalSystemMessage("ZiyaretÃ§i sayacÄ± okunamadÄ±."));
                        
                        window.db.ref('site_visitors').orderByChild('timestamp').limitToLast(5).once('value').then(snap => {
                            if (snap.exists()) {
                                addLocalSystemMessage("Son 5 ziyaretÃ§inin giriÅŸ saatleri:");
                                let count = 0;
                                snap.forEach(child => {
                                    count++;
                                    let v = child.val();
                                    let dateStr = v.timestamp ? new Date(v.timestamp).toLocaleString('tr-TR') : "Bilinmeyen Tarih";
                                    addLocalSystemMessage(`[ZiyaretÃ§i ${count}] GiriÅŸ: ${dateStr}`);
                                });
                            }
                        });
                    }
                }
            } else {
                addLocalSystemMessage("Bilinmeyen komut. KomutlarÄ± Ã¶ÄŸrenmek iÃ§in /yardÄ±m yazabilirsiniz.");
            }

            if (chatMessageInputLocal) {
                chatMessageInputLocal.value = '';
                chatMessageInputLocal.focus();
            }
            return; // Firebase veritabanÄ±na gÃ¶ndermeden sadece oyuncunun ekranÄ±nda Ã§alÄ±ÅŸtÄ±r ve bitir!
        }

        // Spam KalkanÄ±: 2 Saniye Bekleme SÃ¼resi
        let now = Date.now();
        window.lastMessageTime = window.lastMessageTime || 0;

        if (now - window.lastMessageTime < 2000) {
            if (window.wrongSound) window.wrongSound.play();
            let spamUyari = "Ã‡ok hÄ±zlÄ± mesaj gÃ¶nderiyorsunuz. LÃ¼tfen biraz bekleyin.";
            if (window.announceToScreenReader) window.announceToScreenReader(spamUyari);
            return; // GÃ¶nderimi iptal et ve sistemi koru!
        }

        // SÃ¼re kuralÄ±na uyulduysa yeni zamanÄ± kaydet ve iÅŸleme devam et
        window.lastMessageTime = now;

        if (nickname.toLowerCase() === 'sistem') {
            if (window.announceToScreenReader) window.announceToScreenReader('Bu takma adÄ± kullanamazsÄ±nÄ±z.', false);
            chatNicknameInput.focus();
            return;
        }

        if (text === '') {
            if (window.announceToScreenReader) window.announceToScreenReader('LÃ¼tfen bir mesaj yazÄ±n.', false);
            chatMessageInput.focus();
            return;
        }

        if (text.toLowerCase().startsWith('/rutbe ') || text.toLowerCase().startsWith('/rÃ¼tbe ')) {
            let cUserNick = (nickname || "").toLowerCase();
            let isDev = ['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(cUserNick) || (window.playerRanks && window.playerRanks[cUserNick] && window.playerRanks[cUserNick].toLowerCase() === 'tester');
            
            if (!isDev) {
                if (window.announceToScreenReader) window.announceToScreenReader("Bu komutu kullanma yetkiniz yok.", true);
                chatMessageInput.value = '';
                chatMessageInput.focus();
                return;
            }

            let parts = text.split(" ");
            if (parts.length >= 3) {
                let targetUser = parts[1].toLowerCase();
                let newRank = parts.slice(2).join(" ");
                window.fb_rutbeDegistir(targetUser, newRank).then(() => {
                    if (window.announceToScreenReader) window.announceToScreenReader(`${targetUser} kullanÄ±cÄ±sÄ±nÄ±n rÃ¼tbesi baÅŸarÄ±yla ${newRank} yapÄ±ldÄ±.`, true);
                    chatMessageInput.value = '';
                }).catch(err => {
                    if (window.announceToScreenReader) window.announceToScreenReader("RÃ¼tbe deÄŸiÅŸtirilirken bir hata oluÅŸtu.", true);
                });
            } else {
                if (window.announceToScreenReader) window.announceToScreenReader("KullanÄ±m: /rÃ¼tbe [kullanÄ±cÄ±_adÄ±] [yeni_rÃ¼tbe]", true);
            }
            return;
        }

        if (nickname !== '' && text !== '') {
            const messageData = {
                nickname: nickname,
                text: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // Presence AÅŸama 2: Ä°sim GÃ¼ncelleme ve Kanca Yenileme
            if (nickname !== window.currentChatUser && nickname !== "Sistem") {
                window.currentChatUser = nickname;
                if (window.disconnectRef) {
                    window.disconnectRef.onDisconnect().cancel();
                    // Yeni bir mesaj hook'u eklemiyoruz ki sohbeti kirletmesin.
                }
            }

            window.fb_mesajGonder(messageData).then(() => {

                // BaÅŸarÄ±lÄ± gÃ¶nderim sonrasÄ± Takma AdÄ± oturuma VE KALICI DEPOLAMAYA kaydet
                localStorage.setItem('chatUsername', nickname);
                sessionStorage.setItem('chatNickname', nickname);
                chatNicknameInput.style.display = 'none';
                
                chatMessageInput.value = ''; // Mesaj formunu temizle
                
                // Oyuna hÄ±zlÄ±ca devam edilebilmesi iÃ§in sohbet penceresini otomatik kapat
                if (window.isChatOpen && typeof window.toggleChat === 'function') {
                    window.toggleChat();
                }

                // MesajÄ±n baÅŸarÄ±yla gÃ¶nderildiÄŸini bildir (pencere kapanma anonsu ile karÄ±ÅŸmamasÄ± iÃ§in 100ms gecikme)
                setTimeout(() => {
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader('Mesaj gÃ¶nderildi.', false);
                    }
                }, 100);
            }).catch(error => {
                console.error("Mesaj gÃ¶nderilirken hata oluÅŸtu:", error);
                
                // Hata durumunda uyar
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Hata: Mesaj gÃ¶nderilemedi. LÃ¼tfen baÄŸlantÄ±nÄ±zÄ± kontrol edin.', true);
                }
            });
        }
        }); // END OF registeredUsers Check
    }

    // GÃ¶nder butonuna tÄ±klandÄ±ÄŸÄ±nda
    chatSendBtn.addEventListener('click', sendMessage);

    // Mesaj kutusundayken Enter'a basÄ±ldÄ±ÄŸÄ±nda
    chatMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // MesajlarÄ± Dinleme Ä°ÅŸlevi (Sadece son 50 mesaj)
    // Firebase push() anahtarlarÄ± zaten kronolojik olduÄŸu iÃ§in orderByChild'a gerek yoktur, bu sayede Index hatasÄ± vermez ve geÃ§miÅŸi kesin yÃ¼kler.
    
    window.playerRanks = {};
    window.db.ref('ranks').on('value', snap => {
        window.playerRanks = snap.val() || {};
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
        if (myName !== "Bilinmeyen") {
            let myRank = "Oyuncu";
            let isimKucuk = myName.toLowerCase();
            if (['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(isimKucuk)) {
                myRank = "GeliÅŸtirici";
            } else if (['tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(isimKucuk)) { myRank = 'Tester'; } else if (window.playerRanks && window.playerRanks[isimKucuk]) {
                myRank = window.playerRanks[isimKucuk];
            }
            let r_el = document.getElementById('profile-player-rank');
            if (r_el) r_el.innerText = myRank;
        }
    });

    const messagesRef = window.db.ref('messages').limitToLast(50);
    const chatLoadTime = Date.now();
    
    // VeritabanÄ± boÅŸsa "HiÃ§ mesaj yok" uyarÄ±sÄ± ekleme
    messagesRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const li = document.createElement('li');
            li.id = 'empty-chat-warning';
            li.classList.add('system-message');
            const srText = `<span style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);">Sistem mesajÄ±: Bu sohbet kutusunda hiÃ§ mesaj yok. Ä°lk mesajÄ±nÄ±zÄ± gÃ¶ndermek iÃ§in gÃ¼zel bir zaman.</span>`;
            li.innerHTML = `${srText}<div class="wp-bubble" aria-hidden="true" style="opacity: 0.8;">Bu sohbet kutusunda hiÃ§ mesaj yok.<br>Ä°lk mesajÄ±nÄ±zÄ± gÃ¶ndermek iÃ§in gÃ¼zel bir zaman. ÄŸÅ¸â€˜â€¹</div>`;
            chatMessagesList.appendChild(li);
        }
    });

    messagesRef.on('child_added', (snapshot) => {
        // EÄŸer boÅŸ sohbet uyarÄ±sÄ± ekranda duruyorsa, ilk mesaj geldiÄŸinde onu sil!
        const emptyWarning = document.getElementById('empty-chat-warning');
        if (emptyWarning) {
            emptyWarning.remove();
        }

        const data = snapshot.val();
        if (!data) return;

        let mutedUsers = JSON.parse(localStorage.getItem('hafizaGuvenMutedUsers') || "[]");
        if (mutedUsers.includes(data.nickname)) return; // Sessize alÄ±nmÄ±ÅŸ kiÅŸinin mesajÄ±nÄ± engelledik
        
        let timeString = "";
        let timeRaw = "";
        let ts = data.timestamp;
        
        // Yerel itme anÄ±nda (Optimistic Render) TIMESTAMP obje veya hatalÄ± olabilir, bu durumda geÃ§ici yerel cihaz saati kullanÄ±lÄ±r
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
            // Sistem mesajlarÄ±nÄ± sohbet listesine (DOM'a) ekleme, anlÄ±k bildirim (toast) olarak yansÄ±t
            if (Date.now() - chatLoadTime > 2000) {
                if (window.showToastNotification) {
                    window.showToastNotification(data.text);
                }
            }
        } else {
            const li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            
            // RÃ¼tbe Belirleme
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRender = ['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(isimKucuk);
            let rutbe = "Oyuncu";
            if (isDevRender) {
                rutbe = "GeliÅŸtirici";
            } else if (window.playerRanks && window.playerRanks[isimKucuk]) {
                rutbe = window.playerRanks[isimKucuk];
            }
            
            // Benim gÃ¶nderdiÄŸim mesaj mÄ± yoksa baÅŸkasÄ±nÄ±n mÄ±?
            const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
            li.classList.add(isMe ? 'message-out' : 'message-in');
            
            li.setAttribute('aria-label', `[${timeRaw}] ${rutbe} ${escapeHTML(data.nickname)}: ${escapeHTML(data.text)}`);
            
            let rankColor = isDevRender ? '#ffaa00' : (rutbe.toLowerCase() === 'tester' ? '#ff55ff' : (rutbe !== 'Oyuncu' ? '#55aaff' : (isMe ? '#9bbca1' : '#88acb8')));
            
            // Whatsapp GÃ¶rsel Balonu
            li.innerHTML = `
                <div class="wp-bubble" aria-hidden="true">
                    ${!isMe ? `<div class="wp-sender"><span style="color:${rankColor}; font-size:0.85em;">[${rutbe}]</span> ${escapeHTML(data.nickname)}</div>` : `<div style="font-size: 0.75em; color:${rankColor}; margin-bottom: 3px;">[${rutbe}]</div>`}
                    <div class="wp-text">${escapeHTML(data.text)}</div>
                    ${timeString}
                </div>
            `;
            chatMessagesList.appendChild(li);
        }

        // Yeni mesaj gelince otomatik olarak en alta kaydÄ±r
        if (chatMessagesContainer && window.isChatOpen && data.nickname !== "Sistem") {
            // Sadece sohbet aÃ§Ä±ksa kaydÄ±r, deÄŸilse aÃ§Ä±ldÄ±ÄŸÄ±nda zaten aÅŸaÄŸÄ±da kalmasÄ± iÃ§in toggleChat iÃ§ine eklenecek
            setTimeout(() => {
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }, 10);
        }

        // --- NVDA iÃ§in Yeni MesajlarÄ± DoÄŸrudan Anons Etme ---
        const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
        let messageToRead = "";
        let isNewIncomingMessage = false;

        if (data.nickname === "Sistem") {
            messageToRead = `Sistem mesajÄ±: ${data.text}`;
        } else {
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRead = ['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(isimKucuk);
            let rutbe = isDevRead ? "GeliÅŸtirici" : "Oyuncu";

            messageToRead = `${rutbe} ${data.nickname}: ${data.text}`;
            if (!isMe) {
                isNewIncomingMessage = true;
            }
        }
        
        // Sadece sayfa aÃ§Ä±lÄ±ÅŸÄ±ndaki geÃ§miÅŸ mesaj yÄ±ÄŸÄ±nÄ±nÄ± atlamak iÃ§in zamanÄ± kontrol ediyoruz
        if (Date.now() - chatLoadTime > 2000) {
            // BaÅŸkasÄ±ndan gelen mesaj ise ses Ã§al
            if (isNewIncomingMessage && window.chatReceiveSound) {
                window.chatReceiveSound.play();
            }
            
            // "BoÅŸ" (empty) bug'Ä±nÄ± ve PC NVDA sessizliÄŸini uyumlu ÅŸekilde bitirmek iÃ§in announceToScreenReader'Ä± kullanÄ±yoruz
            if (window.announceToScreenReader) {
                window.announceToScreenReader(messageToRead, false); // forceFocus = false
            }
        }
    });

    // Sohbet penceresi aÃ§Ä±ldÄ±ÄŸÄ±nda geÃ§miÅŸ mesajlarÄ±n en altÄ±na kaydÄ±rmayÄ± garantiye almak iÃ§in Observer ekleyelim
    // Veya toggleChat butonuna basÄ±ldÄ±ÄŸÄ±nda scrollTop tetiklenebilir.
});

// Oyuncu oyundan Ã§Ä±karken/sayfa kapanÄ±rken tÃ¼m sohbeti kalÄ±cÄ± olarak sÄ±fÄ±rla (0'la)
// KRÄ°TÄ°K HATA DÃœZELTMESÄ°: remove() fonksiyonu herhangi bir kullanÄ±cÄ± oyundan Ã§Ä±ktÄ±ÄŸÄ±nda, 
// odayÄ± kullanan TÃœM diÄŸer oyuncularÄ±n da canlÄ± sohbet geÃ§miÅŸini veritabanÄ±ndan kalÄ±cÄ± olarak silmesine (wipe) yol aÃ§Ä±yordu! 
// Bu nedenle kÃ¼resel temizlik fonsiyonu iptal edildi.
// window.addEventListener('beforeunload', () => {
//     if (window.db) {
//         window.db.ref('messages').remove();
//     }
// });

// --- GÃ–REV 1 KaldÄ±rÄ±ldÄ± (Tab yÃ¶netimi game.js'deki exception'lar ile yapÄ±lÄ±yor) ---

// --- Ã–ZEL MESAJLAÃ…ÂMA (PRIVATE CHAT) VE KULLANICI Ä°Ã…ÂLEM MENÃœSÃœ ---
document.addEventListener('DOMContentLoaded', () => {
    const actionModal = document.getElementById('social-action-modal');
    const actionTitle = document.getElementById('social-action-title');
    const btnPm = document.getElementById('social-btn-pm');
    const btnMute = document.getElementById('social-btn-mute');
    const btnCancel = document.getElementById('social-btn-cancel');
    const btnResolve = document.getElementById('social-btn-resolve');
    const btnBan = document.getElementById('social-btn-ban');
    const btnUnban = document.getElementById('social-btn-unban');

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

        if (actionTitle) actionTitle.innerText = playerName + " Ä°ÅŸlemleri";
        if (btnMute) {
            btnMute.innerText = isMuted ? "SusturmayÄ± KaldÄ±r" : "KullanÄ±cÄ±yÄ± Sustur";
            btnMute.setAttribute('aria-label', isMuted ? "KullanÄ±cÄ±nÄ±n susturmasÄ±nÄ± kaldÄ±r" : "KullanÄ±cÄ±yÄ± sustur");
        }

        let cUserNick = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Misafir";
        let isDev = ['ekrem', 'tester 09', 'tester_09', 'tester09', 'beta tester 09', 'neyzen'].includes(cUserNick.toLowerCase());

        const devBtns = actionModal.querySelectorAll('.dev-only-action');
        devBtns.forEach(b => {
            b.style.display = isDev ? 'list-item' : 'none';
        });

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
                window.announceToScreenReader(playerName + " detaylarÄ± aÃ§Ä±ldÄ±. Ã–zel mesaj gÃ¶nderebilir veya susturabilirsiniz.", true);
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
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " artÄ±k size mesaj gÃ¶nderebilecek.");
                if (window.showToastNotification) window.showToastNotification(window.selectedSocialPlayer + " susturmasÄ± kaldÄ±rÄ±ldÄ±.");
            } else {
                mutedUsers.push(window.selectedSocialPlayer);
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " susturuldu. Hem Ã¶zel hem global mesajlarÄ± engellendi.");
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

    if (btnResolve) {
        btnResolve.addEventListener('click', () => {
            let msg = prompt("Bu oyuncuya iletilecek bilet Ã§Ã¶zÃ¼m mesajÄ±nÄ± girin:");
            if (msg && msg.trim() !== "" && window.db) {
                let targetUser = window.selectedSocialPlayer;
                window.fb_biletCoz(targetUser, msg);
                alert("Bilet Ã§Ã¶zÃ¼ldÃ¼ olarak iÅŸaretlendi ve oyuncuya iletildi.");
            }
            window.closeSocialActionModal();
        });
    }

    if (btnBan) {
        btnBan.addEventListener('click', () => {
            if (confirm(`${window.selectedSocialPlayer} adlÄ± oyuncuyu oyundan yasaklamak istediÄŸinize emin misiniz?`)) {
                if (window.db) {
                    window.fb_oyuncuYasakla(window.selectedSocialPlayer).then(() => {
                        alert(`${window.selectedSocialPlayer} yasaklandÄ±.`);
                    });
                }
            }
            window.closeSocialActionModal();
        });
    }

    if (btnUnban) {
        btnUnban.addEventListener('click', () => {
            if (confirm(`${window.selectedSocialPlayer} adlÄ± oyuncunun yasaÄŸÄ±nÄ± kaldÄ±rmak istediÄŸinize emin misiniz?`)) {
                if (window.db) {
                    window.fb_yasakKaldir(window.selectedSocialPlayer).then(() => {
                        alert(`${window.selectedSocialPlayer} kullanÄ±cÄ±sÄ±nÄ±n yasaÄŸÄ± kaldÄ±rÄ±ldÄ±.`);
                    });
                }
            }
            window.closeSocialActionModal();
        });
    }

    function getPrivateRoomId(user1, user2) { return [user1, user2].sort().join('_'); }

    window.openPrivateChat = function(recipientName) {
        if (window.stopAdminAlert) window.stopAdminAlert('message');
        if (!privateChatPanel || !recipientName) return;
        
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
        if (!myName || myName === "Misafir") {
            if (window.announceToScreenReader) window.announceToScreenReader("Ã–zel mesajlaÅŸmak iÃ§in KÃ¼resel Sohbet menÃ¼sÃ¼ Ã¼zerinden onaylÄ± bir takma ad belirlemelisiniz.", true);
            if (window.showToastNotification) window.showToastNotification("Ã–nce Sohbet'ten takma ad alÄ±n!");
            return;
        }

        currentPrivateRecipient = recipientName;
        window.isPrivateChatOpen = true;

        if (privateChatTitle) privateChatTitle.innerText = `${recipientName} ile Ã–zel Sohbet`;
        
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
                    liveAnnouncer.innerText = `Ã–zel mesaj: ${msg.sender} ${msg.text} yazdÄ±.`;
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
            window.fb_ozelMesajGonder(roomId, myName, currentPrivateRecipient, text);

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
        let missedSenders = new Set();

        window.db.ref(`inbox/${myName}`).on('child_added', (snapshot) => {
            let notif = snapshot.val();
            if (!notif) return;

            if (initialInboxLoad) {
                if (!getMutedUsers().includes(notif.from)) {
                    missedSenders.add(notif.from);
                }
            } else {
                if (!getMutedUsers().includes(notif.from)) {
                    if (!window.isPrivateChatOpen || currentPrivateRecipient !== notif.from) {
                        if (window.startAdminAlert) window.startAdminAlert('message');
                        if (window.chatReceiveSound) window.chatReceiveSound.play();
                        if (window.showToastNotification) window.showToastNotification(`ÄŸÅ¸â€™Â¬ ${notif.from} size bir Ã¶zel mesaj gÃ¶nderdi.`);
                        if (window.announceToScreenReader) window.announceToScreenReader(`${notif.from} kullanÄ±cÄ±sÄ±ndan yeni bir Ã¶zel mesajÄ±nÄ±z var. Sosyal sekmesinden veya ona tÄ±klayarak ulaÅŸabilirsiniz.`);
                    }
                }
            }
            snapshot.ref.remove(); 
        });

        setTimeout(() => { 
            initialInboxLoad = false; 
            if (missedSenders.size > 0) {
                let senders = Array.from(missedSenders).join(", ");
                if (window.startAdminAlert) window.startAdminAlert('message');
                if (window.announceToScreenReader) window.announceToScreenReader(`Siz yokken ÅŸu kiÅŸilerden Ã¶zel mesaj geldi: ${senders}`, true);
                if (window.showToastNotification) window.showToastNotification(`KaÃ§Ä±rdÄ±ÄŸÄ±nÄ±z mesajlar var: ${senders}`, 'info');
            }
        }, 3000);
    };

    setTimeout(() => {
        if(window.db) initInboxListener();
    }, 2500);
});

window.addEventListener('offline', () => {
    if (window.announceToScreenReader) {
        window.announceToScreenReader("UyarÄ±: Ä°nternet baÄŸlantÄ±nÄ±z koptu. Ã‡ok oyunculu Ã¶zellikler ve sohbet ÅŸu an kullanÄ±lamaz. Ã‡evrimdÄ±ÅŸÄ± modda oynamaya devam edebilirsiniz.", true);
    }
    if (window.showToastNotification) {
        window.showToastNotification("Ä°nternet baÄŸlantÄ±sÄ± koptu!");
    }
});

window.addEventListener('online', () => {
    if (window.announceToScreenReader) {
        window.announceToScreenReader("Ä°nternet baÄŸlantÄ±sÄ± tekrar saÄŸlandÄ±. Sunucuya yeniden baÄŸlanÄ±lÄ±yor.", true);
    }
    if (window.showToastNotification) {
        window.showToastNotification("Ä°nternet geri geldi!");
    }
});

// --- NVDA Ä°Ã‡Ä°N MESAJ KUYRUÃ„ÂU SÄ°STEMÄ° ---
if (!window.orijinalAnnounce) {
    window.orijinalAnnounce = window.announceToScreenReader;
    window.srMesajKuyrugu = [];
    window.srOkuyorMu = false;
    
    window.announceToScreenReader = function(text, forceFocus = false) {
        window.srMesajKuyrugu.push({ text: text, forceFocus: forceFocus });
        window.srKuyruguIslet();
    };
    
    window.srKuyruguIslet = function() {
        // EÄŸer okuma devam ediyorsa veya kuyruk boÅŸsa dur
        if (window.srOkuyorMu || window.srMesajKuyrugu.length === 0) return;
        
        window.srOkuyorMu = true;
        const siradaki = window.srMesajKuyrugu.shift(); // Kuyruktan ilk mesajÄ± al
        
        // Orijinal okuma fonksiyonunu Ã§aÄŸÄ±r
        window.orijinalAnnounce(siradaki.text, siradaki.forceFocus);
        
        // Okuma sÃ¼resi tahmini: Harf baÅŸÄ±na ortalama 70ms + 1 saniye bekleme payÄ±
        const okumaSuresi = Math.max(1500, (siradaki.text.length * 70) + 1000);
        
        // AÅŸama 1'de kurduÄŸumuz ajan zamanlayÄ±cÄ±sÄ±nÄ± kullanarak sÄ±radaki mesaja geÃ§
        window.hgfzZamanlayici.setTimeout(() => {
            window.srOkuyorMu = false;
            window.srKuyruguIslet(); // Kuyrukta bekleyen varsa devam et
        }, okumaSuresi);
    };
}

// --- DURAKLATMA / Ã‡IKIÃ…Â MENÃœSÃœ MANTIÃ„ÂI ---
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
                window.announceToScreenReader("Oyun duraklatÄ±ldÄ±. Ne yapmak istiyorsunuz? SeÃ§enekler iÃ§in TAB veya ok tuÅŸlarÄ±nÄ± kullanabilirsiniz.", true);
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

    if (btnCancel) {
        btnCancel.addEventListener('click', handleCancel);
        btnCancel.addEventListener('pointerdown', handleCancel);
        btnCancel.addEventListener('touchstart', handleCancel, {passive: false});
    }
});


// Achievement Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    const achievementModal = document.getElementById('achievement-modal');
    const btnAchCopy = document.getElementById('btn-ach-copy');
    const btnAchWhatsapp = document.getElementById('btn-ach-whatsapp');
    const btnAchTelegram = document.getElementById('btn-ach-telegram');
    const btnAchClose = document.getElementById('btn-ach-close');

    if (achievementModal) {
        btnAchClose.addEventListener('click', () => {
            if (window.previousMenuBeforeAch) {
                window.switchMenu(achievementModal, window.previousMenuBeforeAch, window.previousMenuBeforeAchName || 'main');
            } else {
                window.switchMenu(achievementModal, window.mainMenu, 'main');
            }
        });
    }

        window.showAchievementModal = function(achName) {
        let gameLink = "https://mikyasstudio.com.tr/hafizanaguven.html";
        let shareText = "Tebrikler! Hafizana Guven'de " + achName + " basarimini elde ettim! \n\nSen de benimle beraber bu basariyi yakalamak istiyorsan, haydi sen de oyna!\n\nOyunu Oyna: " + gameLink;
        
        let textElem = document.getElementById('achievement-modal-text');
        if (textElem) {
            textElem.textContent = "Tebrikler! " + achName + " basarimini elde ettiniz! Bunu arkadaslarinizla paylasabilirsiniz.";
            textElem.focus();
        }
        
        if (btnAchCopy) {
            btnAchCopy.onclick = () => {
                navigator.clipboard.writeText(shareText).then(() => {
                    if (window.announceToScreenReader) window.announceToScreenReader("Mesaj kopyalandÃƒâ€Â±!");
                    if (window.correctSound) window.correctSound.play();
                });
            };
        }
        if (btnAchWhatsapp) {
            btnAchWhatsapp.onclick = () => {
                window.open("https://wa.me/?text=" + encodeURIComponent(shareText), '_blank');
            };
        }
        if (btnAchTelegram) {
            btnAchTelegram.onclick = () => {
                window.open("https://t.me/share/url?url=" + encodeURIComponent(gameLink) + "&text=" + encodeURIComponent(shareText), '_blank');
            };
        }
        
        window.previousMenuBeforeAch = document.querySelector('.menu-container[style*="display: flex"]');
        window.previousMenuBeforeAchName = window.currentActiveMenu;
        
        if (window.previousMenuBeforeAch) {
            window.switchMenu(window.previousMenuBeforeAch, achievementModal, 'achievement_modal');
        } else {
            window.switchMenu(window.mainMenu, achievementModal, 'achievement_modal');
        }
        
        if (window.modeUnlockSound) window.modeUnlockSound.play();
    };
});









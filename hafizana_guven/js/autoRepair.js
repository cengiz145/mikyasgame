// autoRepair.js - Otomatik Hata OnarÄ±m ve TeÅŸhis Sistemi (Auto-Repair & Diagnostics)

window.HafizanaGuvenAutoRepair = {
    isRepairing: false,
    lastErrorTime: 0,
    errorCount: 0,
    heartbeatInterval: null,
    lastHeartbeatState: null,

    init: function() {
        this.setupGlobalErrorHandler();
        this.runLocalStorageDoctor();
        this.startHeartbeatMonitor();
        console.log("[AutoRepair] Otomatik onarÄ±m sistemi aktif.");
    },

    setupGlobalErrorHandler: function() {
        const self = this;
        
        window.onerror = function(message, source, lineno, colno, error) {
            self.handleCrash("JavaScript HatasÄ±: " + message);
            // HatanÄ±n tarayÄ±cÄ± konsoluna dÃ¼ÅŸmesini engelleme (false dÃ¶ndÃ¼r)
            return false;
        };

        window.addEventListener('unhandledrejection', function(event) {
            self.handleCrash("Asenkron Ä°ÅŸlem HatasÄ±: " + (event.reason ? event.reason.message : 'Bilinmeyen Hata'));
        });
    },

    handleCrash: function(reason) {
        if (this.isRepairing) return;
        
        const now = Date.now();
        if (now - this.lastErrorTime < 2000) {
            // Saniyeler iÃ§inde Ã§ok fazla hata alÄ±yorsak sonsuz dÃ¶ngÃ¼yÃ¼ Ã¶nle
            this.errorCount++;
            if (this.errorCount > 5) return;
        } else {
            this.errorCount = 1;
        }
        
        this.lastErrorTime = now;
        this.isRepairing = true;

        console.error("[AutoRepair] Kritik Hata YakalandÄ±: ", reason);

        // Ekran okuyucuya bilgi ver
        if (window.announceToScreenReader) {
            window.announceToScreenReader("Sistemde ufak bir takÄ±lma algÄ±landÄ±, gÃ¼venliÄŸiniz iÃ§in otomatik olarak onarÄ±lÄ±yor...", true);
        }

        // Oyunu gÃ¼venle temizle
        if (window.hgfzZamanlayici && window.hgfzZamanlayici.hepsiniImhaEt) {
            window.hgfzZamanlayici.hepsiniImhaEt();
        }

        // AÃ§Ä±k olan tÃ¼m sesleri sustur
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        // Oyun durumunu sÄ±fÄ±rla
        window.gameIsActive = false;
        window.isStarted = false;
        window.isStarting = false;
        window.isComputerPlaying = false;
        window.gameTimer = 0;

        // Ana MenÃ¼ye tahliye iÅŸlemi
        setTimeout(() => {
            const gameContainer = document.getElementById('game-menu-container');
            const mainMenu = document.getElementById('main-menu');
            
            if (window.switchMenu && gameContainer && mainMenu) {
                // EÄŸer oyun veya baÅŸka bir menÃ¼deyse ana menÃ¼ye dÃ¶n
                const activeMenus = document.querySelectorAll('.menu-container:not([style*="display: none"])');
                activeMenus.forEach(menu => {
                    if (menu.id !== 'main-menu') {
                        menu.style.display = 'none';
                        menu.setAttribute('aria-hidden', 'true');
                    }
                });

                mainMenu.style.display = 'flex';
                mainMenu.style.opacity = '1';
                mainMenu.removeAttribute('aria-hidden');

                const titleEl = document.getElementById('main-menu-title');
                if (titleEl) {
                    titleEl.focus();
                }
                
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("OnarÄ±m tamamlandÄ±. Ana menÃ¼ye gÃ¼venle dÃ¶ndÃ¼nÃ¼z.");
                }

                // Ana menÃ¼ mÃ¼ziÄŸini baÅŸlatmayÄ± dene
                if (window.bgMusic && !window.bgMusic.playing()) {
                    try { window.bgMusic.play(); } catch(e) {}
                }
            }
            
            this.isRepairing = false;
        }, 1500);
    },

    runLocalStorageDoctor: function() {
        // KayÄ±tlÄ± verilerin formatÄ±nÄ± ve veri tiplerini tarar
        try {
            // 1. Jetonlar KontrolÃ¼ (NaN hatasÄ± kalkanÄ±)
            let tokens = localStorage.getItem('hafizaGuvenTotalTokens');
            if (tokens !== null) {
                let parsedTokens = parseInt(tokens);
                if (isNaN(parsedTokens) || parsedTokens < 0) {
                    console.warn("[AutoRepair] Bozuk jeton verisi tespit edildi. OnarÄ±lÄ±yor...");
                    localStorage.setItem('hafizaGuvenTotalTokens', '0');
                }
            }

            // 2. Oyun ModlarÄ± (JSON Format HatasÄ± KorumasÄ±)
            let modes = localStorage.getItem('hafizaGuvenModes');
            if (modes) {
                try {
                    let parsedModes = JSON.parse(modes);
                    if (typeof parsedModes !== 'object' || !parsedModes.easy) {
                        throw new Error("GeÃ§ersiz oyun modu yapÄ±sÄ±");
                    }
                } catch (e) {
                    console.warn("[AutoRepair] Bozuk oyun modlarÄ± verisi tespit edildi. VarsayÄ±lana dÃ¶ndÃ¼rÃ¼lÃ¼yor...");
                    localStorage.removeItem('hafizaGuvenModes');
                }
            }
            
            // 3. BaÅŸarÄ±mlar (JSON Format HatasÄ±)
            let achievements = localStorage.getItem('hafizaGuvenAchievements');
            if (achievements) {
                try {
                    JSON.parse(achievements);
                } catch (e) {
                    console.warn("[AutoRepair] Bozuk baÅŸarÄ±m verisi tespit edildi. Temizleniyor...");
                    localStorage.removeItem('hafizaGuvenAchievements');
                }
            }

        } catch (e) {
            console.error("[AutoRepair] LocalStorage Doctor Ã§alÄ±ÅŸÄ±rken hata:", e);
        }
    },

    startHeartbeatMonitor: function() {
        // Oyunun takÄ±lÄ±p takÄ±lmadÄ±ÄŸÄ±nÄ± (deadlock) her 5 saniyede bir denetler
        setInterval(() => {
            if (window.gameIsActive && window.gameTimer > 0) {
                
                // EÄŸer oyun aktifse ve 10 saniye boyunca zamanlayÄ±cÄ± aynÄ± kaldÄ±ysa (takÄ±ldÄ±ysa)
                if (this.lastHeartbeatState && this.lastHeartbeatState.timer === window.gameTimer && !window.gameIsPaused) {
                    this.lastHeartbeatState.frozenCount = (this.lastHeartbeatState.frozenCount || 0) + 1;
                    
                    // 15 saniye boyunca oyun ilerlemediyse donma ilan et ve kurtar
                    if (this.lastHeartbeatState.frozenCount >= 3) {
                        console.warn("[AutoRepair] Oyun zamanlayÄ±cÄ±sÄ±nÄ±n donduÄŸu tespit edildi. Sistem zorla yeniden baÅŸlatÄ±lÄ±yor.");
                        this.handleCrash("Oyun zamanlayÄ±cÄ±sÄ± dondu (Heartbeat Fail).");
                    }
                } else {
                    this.lastHeartbeatState = {
                        timer: window.gameTimer,
                        frozenCount: 0
                    };
                }
            } else {
                this.lastHeartbeatState = null; // Oyun aktif deÄŸilse sÄ±fÄ±rla
            }
        }, 5000);
    }
};

// Sayfa yÃ¼klenirken onarÄ±m sistemini ayaÄŸa kaldÄ±r
document.addEventListener('DOMContentLoaded', () => {
    window.HafizanaGuvenAutoRepair.init();
});

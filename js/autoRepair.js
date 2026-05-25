// autoRepair.js - Otomatik Hata Onarım ve Teşhis Sistemi (Auto-Repair & Diagnostics)

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
        console.log("[AutoRepair] Otomatik onarım sistemi aktif.");
    },

    setupGlobalErrorHandler: function() {
        const self = this;
        
        window.onerror = function(message, source, lineno, colno, error) {
            self.handleCrash("JavaScript Hatası: " + message);
            // Hatanın tarayıcı konsoluna düşmesini engelleme (false döndür)
            return false;
        };

        window.addEventListener('unhandledrejection', function(event) {
            self.handleCrash("Asenkron İşlem Hatası: " + (event.reason ? event.reason.message : 'Bilinmeyen Hata'));
        });
    },

    handleCrash: function(reason) {
        if (this.isRepairing) return;
        
        const now = Date.now();
        if (now - this.lastErrorTime < 2000) {
            // Saniyeler içinde çok fazla hata alıyorsak sonsuz döngüyü önle
            this.errorCount++;
            if (this.errorCount > 5) return;
        } else {
            this.errorCount = 1;
        }
        
        this.lastErrorTime = now;
        this.isRepairing = true;

        console.error("[AutoRepair] Kritik Hata Yakalandı: ", reason);

        // Ekran okuyucuya bilgi ver
        if (window.announceToScreenReader) {
            window.announceToScreenReader("Sistemde ufak bir takılma algılandı, güvenliğiniz için otomatik olarak onarılıyor...", true);
        }

        // Oyunu güvenle temizle
        if (window.hgfzZamanlayici && window.hgfzZamanlayici.hepsiniImhaEt) {
            window.hgfzZamanlayici.hepsiniImhaEt();
        }

        // Açık olan tüm sesleri sustur
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        // Oyun durumunu sıfırla
        window.gameIsActive = false;
        window.isStarted = false;
        window.isStarting = false;
        window.isComputerPlaying = false;
        window.gameTimer = 0;

        // Ana Menüye tahliye işlemi
        setTimeout(() => {
            const gameContainer = document.getElementById('game-menu-container');
            const mainMenu = document.getElementById('main-menu');
            
            if (window.switchMenu && gameContainer && mainMenu) {
                // Eğer oyun veya başka bir menüdeyse ana menüye dön
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
                    window.announceToScreenReader("Onarım tamamlandı. Ana menüye güvenle döndünüz.");
                }

                // Ana menü müziğini başlatmayı dene
                if (window.bgMusic && !window.bgMusic.playing()) {
                    try { window.bgMusic.play(); } catch(e) {}
                }
            }
            
            this.isRepairing = false;
        }, 1500);
    },

    runLocalStorageDoctor: function() {
        // Kayıtlı verilerin formatını ve veri tiplerini tarar
        try {
            // 1. Jetonlar Kontrolü (NaN hatası kalkanı)
            let tokens = localStorage.getItem('hafizaGuvenTotalTokens');
            if (tokens !== null) {
                let parsedTokens = parseInt(tokens);
                if (isNaN(parsedTokens) || parsedTokens < 0) {
                    console.warn("[AutoRepair] Bozuk jeton verisi tespit edildi. Onarılıyor...");
                    localStorage.setItem('hafizaGuvenTotalTokens', '0');
                }
            }

            // 2. Oyun Modları (JSON Format Hatası Koruması)
            let modes = localStorage.getItem('hafizaGuvenModes');
            if (modes) {
                try {
                    let parsedModes = JSON.parse(modes);
                    if (typeof parsedModes !== 'object' || !parsedModes.easy) {
                        throw new Error("Geçersiz oyun modu yapısı");
                    }
                } catch (e) {
                    console.warn("[AutoRepair] Bozuk oyun modları verisi tespit edildi. Varsayılana döndürülüyor...");
                    localStorage.removeItem('hafizaGuvenModes');
                }
            }
            
            // 3. Başarımlar (JSON Format Hatası)
            let achievements = localStorage.getItem('hafizaGuvenAchievements');
            if (achievements) {
                try {
                    JSON.parse(achievements);
                } catch (e) {
                    console.warn("[AutoRepair] Bozuk başarım verisi tespit edildi. Temizleniyor...");
                    localStorage.removeItem('hafizaGuvenAchievements');
                }
            }

        } catch (e) {
            console.error("[AutoRepair] LocalStorage Doctor çalışırken hata:", e);
        }
    },

    startHeartbeatMonitor: function() {
        // Oyunun takılıp takılmadığını (deadlock) her 5 saniyede bir denetler
        setInterval(() => {
            if (window.gameIsActive && window.gameTimer > 0) {
                
                // Eğer oyun aktifse ve 10 saniye boyunca zamanlayıcı aynı kaldıysa (takıldıysa)
                if (this.lastHeartbeatState && this.lastHeartbeatState.timer === window.gameTimer && !window.gameIsPaused) {
                    this.lastHeartbeatState.frozenCount = (this.lastHeartbeatState.frozenCount || 0) + 1;
                    
                    // 15 saniye boyunca oyun ilerlemediyse donma ilan et ve kurtar
                    if (this.lastHeartbeatState.frozenCount >= 3) {
                        console.warn("[AutoRepair] Oyun zamanlayıcısının donduğu tespit edildi. Sistem zorla yeniden başlatılıyor.");
                        this.handleCrash("Oyun zamanlayıcısı dondu (Heartbeat Fail).");
                    }
                } else {
                    this.lastHeartbeatState = {
                        timer: window.gameTimer,
                        frozenCount: 0
                    };
                }
            } else {
                this.lastHeartbeatState = null; // Oyun aktif değilse sıfırla
            }
        }, 5000);
    }
};

// Sayfa yüklenirken onarım sistemini ayağa kaldır
document.addEventListener('DOMContentLoaded', () => {
    window.HafizanaGuvenAutoRepair.init();
});

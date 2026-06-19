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
            let stack = error && error.stack ? error.stack : 'Stack trace yok';
            let formattedMsg = `JavaScript Hatası:\nMesaj: ${message}\nDosya: ${source}\nSatır: ${lineno}:${colno}\n\nDetay:\n${stack}`;
            self.showErrorReporter(formattedMsg);
            // Hatanın tarayıcı konsoluna düşmesini engelleme (false döndür)
            return false;
        };

        window.addEventListener('unhandledrejection', function(event) {
            let reason = event.reason;
            let formattedMsg = `Asenkron İşlem Hatası (Promise Rejection):\n`;
            if (reason instanceof Error) {
                formattedMsg += `Mesaj: ${reason.message}\n\nDetay:\n${reason.stack}`;
            } else {
                formattedMsg += `Detay: ${JSON.stringify(reason)}`;
            }
            self.showErrorReporter(formattedMsg);
        });

        // Hata Bildirim Butonları Event Listener'ları
        document.addEventListener('DOMContentLoaded', () => {
            const btnCopy = document.getElementById('btn-copy-error');
            const btnReload = document.getElementById('btn-reload-error');

            if (btnCopy) {
                btnCopy.addEventListener('click', () => {
                    const errorText = document.getElementById('error-log-textarea').value;
                    navigator.clipboard.writeText(errorText).then(() => {
                        if (window.announceToScreenReader) window.announceToScreenReader("Hata kodu panoya kopyalandı. Geliştiriciye gönderebilirsiniz.");
                        btnCopy.innerText = "Kopyalandı!";
                        setTimeout(() => btnCopy.innerText = "Hatayı Kopyala", 2000);
                    }).catch(err => {
                        console.error('Kopyalama başarısız', err);
                        if (window.announceToScreenReader) window.announceToScreenReader("Kopyalama başarısız oldu. Lütfen manuel olarak kopyalayın.");
                    });
                });
            }

            if (btnReload) {
                btnReload.addEventListener('click', () => {
                    window.location.reload();
                });
            }
        });
    },

    showErrorReporter: function(errorLog) {
        if (this.isRepairing) return;
        this.isRepairing = true;

        // Kullanıcı gizliliğini korumak için bilgisayar dosya yollarını maskele (C:\Users\... veya file:///)
        let sanitizedLog = errorLog;
        try {
            sanitizedLog = sanitizedLog.replace(/(?:file:\/\/\/|https?:\/\/|[a-zA-Z]:\\).*?[\/\\]([a-zA-Z0-9_\-]+\.(?:js|css|html))/gi, '[OYUN_KLASORU]/$1');
            sanitizedLog = sanitizedLog.replace(/Users[\/\\][^\/\\]+[\/\\]/gi, 'Users/[GIZLI_KULLANICI]/');
        } catch(e) {}

        console.error("[Global Error Reporter] Hata Yakalandı:\n" + sanitizedLog);

        const modal = document.getElementById('error-reporter-modal');
        const textarea = document.getElementById('error-log-textarea');
        const title = document.getElementById('error-modal-title');

        if (modal && textarea) {
            // Arkaplandaki tüm sesleri sustur
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });

            // Zamanlayıcıları durdur
            if (window.hgfzZamanlayici && window.hgfzZamanlayici.hepsiniImhaEt) {
                window.hgfzZamanlayici.hepsiniImhaEt();
            }
            
            // Oyun durumunu durdur
            window.gameIsActive = false;

            textarea.value = sanitizedLog;
            
            // Aktif olan tüm menüleri gizleyerek odağın sadece hata menüsünde kalmasını sağla
            const activeMenus = document.querySelectorAll('.menu-container:not([style*="display: none"])');
            activeMenus.forEach(menu => {
                menu.style.display = 'none';
                menu.setAttribute('aria-hidden', 'true');
            });

            modal.style.display = 'flex';
            
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.removeAttribute('aria-hidden');
                
                if (title) title.focus();
                
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Sistem hatası tespit edildi. Oyun durduruldu. Lütfen ekrandaki hata kodunu kopyalayıp geliştiriciye gönderin.", true);
                }
            }, 100);
        } else {
            alert("KRİTİK HATA:\n" + errorLog);
        }
    },

    handleCrash: function(reason) {
        this.showErrorReporter("Sistem Tespit Hatası:\n" + reason);
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
window.HafizanaGuvenAutoRepair.init();





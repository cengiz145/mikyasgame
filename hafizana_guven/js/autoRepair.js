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
            let stack = error && error.stack ? error.stack : 'Stack trace yok';
            let formattedMsg = `JavaScript HatasÄ±:\nMesaj: ${message}\nDosya: ${source}\nSatÄ±r: ${lineno}:${colno}\n\nDetay:\n${stack}`;
            self.showErrorReporter(formattedMsg);
            // HatanÄ±n tarayÄ±cÄ± konsoluna dÃ¼ÅŸmesini engelleme (false dÃ¶ndÃ¼r)
            return false;
        };

        window.addEventListener('unhandledrejection', function(event) {
            let reason = event.reason;
            let formattedMsg = `Asenkron Ä°ÅŸlem HatasÄ± (Promise Rejection):\n`;
            if (reason instanceof Error) {
                formattedMsg += `Mesaj: ${reason.message}\n\nDetay:\n${reason.stack}`;
            } else {
                formattedMsg += `Detay: ${JSON.stringify(reason)}`;
            }
            self.showErrorReporter(formattedMsg);
        });

        // Hata Bildirim ButonlarÄ± Event Listener'larÄ±
        document.addEventListener('DOMContentLoaded', () => {
            const btnSend = document.getElementById('btn-send-error');
            const btnReload = document.getElementById('btn-reload-error');

            if (btnSend) {
                btnSend.addEventListener('click', () => {
                    const errorText = document.getElementById('error-log-textarea').value;
                    
                    if (window.db) {
                        const errorData = {
                            timestamp: firebase.database.ServerValue.TIMESTAMP,
                            log: errorText,
                            userAgent: navigator.userAgent,
                            version: window.mevcutSurum || "Bilinmiyor"
                        };
                        const newErrorRef = window.db.ref('error_logs').push();
                        newErrorRef.set(errorData).then(() => {
                            if (window.announceToScreenReader) window.announceToScreenReader("Hata geliştiriciye başarıyla gönderildi. Teşekkür ederiz.");
                            btnSend.innerText = "Gönderildi!";
                            btnSend.disabled = true;
                        }).catch(err => {
                            console.error('Firebase gönderimi başarısız', err);
                            if (window.announceToScreenReader) window.announceToScreenReader("Gönderim başarısız oldu. Lütfen internetinizi kontrol edin.");
                        });
                    } else {
                        // Eğer firebase çöktüyse panoya kopyalama yedeği devreye girer
                        navigator.clipboard.writeText(errorText).then(() => {
                            if (window.announceToScreenReader) window.announceToScreenReader("Sunucuya bağlanılamadı. Hata panoya kopyalandı.");
                            btnSend.innerText = "Kopyalandı!";
                            setTimeout(() => btnSend.innerText = "Hatayı Gönder", 2000);
                        }).catch(err => {
                            console.error('Kopyalama başarısız', err);
                        });
                    }
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

        // KullanÄ±cÄ± gizliliÄŸini korumak iÃ§in bilgisayar dosya yollarÄ±nÄ± maskele (C:\Users\... veya file:///)
        let sanitizedLog = errorLog;
        try {
            sanitizedLog = sanitizedLog.replace(/(?:file:\/\/\/|https?:\/\/|[a-zA-Z]:\\).*?[\/\\]([a-zA-Z0-9_\-]+\.(?:js|css|html))/gi, '[OYUN_KLASORU]/$1');
            sanitizedLog = sanitizedLog.replace(/Users[\/\\][^\/\\]+[\/\\]/gi, 'Users/[GIZLI_KULLANICI]/');
        } catch(e) {}

        console.error("[Global Error Reporter] Hata YakalandÄ±:\n" + sanitizedLog);

        const modal = document.getElementById('error-reporter-modal');
        const textarea = document.getElementById('error-log-textarea');
        const title = document.getElementById('error-modal-title');

        if (modal && textarea) {
            // Arkaplandaki tÃ¼m sesleri sustur
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });

            // ZamanlayÄ±cÄ±larÄ± durdur
            if (window.hgfzZamanlayici && window.hgfzZamanlayici.hepsiniImhaEt) {
                window.hgfzZamanlayici.hepsiniImhaEt();
            }
            
            // Oyun durumunu durdur
            window.gameIsActive = false;

            textarea.value = sanitizedLog;
            
            // Aktif olan tÃ¼m menÃ¼leri gizleyerek odaÄŸÄ±n sadece hata menÃ¼sÃ¼nde kalmasÄ±nÄ± saÄŸla
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
                    window.announceToScreenReader("Sistem hatasÄ± tespit edildi. Oyun durduruldu. LÃ¼tfen ekrandaki hata kodunu kopyalayÄ±p geliÅŸtiriciye gÃ¶nderin.", true);
                }
            }, 100);
        } else {
            alert("KRÄ°TÄ°K HATA:\n" + errorLog);
        }
    },

    handleCrash: function(reason) {
        this.showErrorReporter("Sistem Tespit HatasÄ±:\n" + reason);
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
window.HafizanaGuvenAutoRepair.init();






// autoRepair.js - Futbol Projesi Otomatik Hata Onarım ve Teşhis Sistemi

window.FutbolAutoRepair = {
    isRepairing: false,
    lastHeartbeatState: null,

    init: function() {
        this.setupGlobalErrorHandler();
        this.runLocalStorageDoctor();
        this.startHeartbeatMonitor();
        console.log("[AutoRepair] Futbol onarım sistemi aktif.");
    },

    setupGlobalErrorHandler: function() {
        const self = this;
        
        window.onerror = function(message, source, lineno, colno, error) {
            // Zararsız eklenti (AdBlock, Çeviri vb.) ve CORS hatalarını yoksay
            if (message && message.toLowerCase().indexOf('script error') > -1 && (!source || source === "" || source === "null" || source === "undefined")) {
                console.warn("[AutoRepair] Zararsız eklenti/CORS hatası yoksayıldı:", message);
                return false;
            }

            let stack = error && error.stack ? error.stack : 'Stack trace yok';
            let formattedMsg = `JavaScript Hatası:\nMesaj: ${message}\nDosya: ${source}\nSatır: ${lineno}:${colno}\n\nDetay:\n${stack}`;
            self.showErrorReporter(formattedMsg);
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

        document.addEventListener('DOMContentLoaded', () => {
            const btnSend = document.getElementById('btn-send-error');
            const btnReload = document.getElementById('btn-reload-error');

            if (btnSend) {
                btnSend.addEventListener('click', () => {
                    const errorText = document.getElementById('error-log-textarea').value;
                    navigator.clipboard.writeText(errorText).then(() => {
                        if (typeof speak === 'function') speak("Hata panoya kopyalandı.");
                        btnSend.innerText = "Kopyalandı!";
                        setTimeout(() => btnSend.innerText = "Hatayı Panoya Kopyala", 2000);
                    }).catch(err => {
                        console.error('Kopyalama başarısız', err);
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
            // Sesi kapat
            if (window.audioEngine && window.audioEngine.masterGain) {
                window.audioEngine.masterGain.gain.value = 0;
            }
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });

            // Tüm setInterval leri durdurmak için brute-force yöntemi (en kesin çözüm)
            for (let i = 1; i < 99999; i++) window.clearInterval(i);
            
            textarea.value = sanitizedLog;
            
            const activeMenus = document.querySelectorAll('.menu-container:not([style*="display: none"])');
            activeMenus.forEach(menu => {
                menu.style.display = 'none';
            });

            modal.style.display = 'flex'; if(modal) { let title = modal.querySelector('h1, h2'); if(title) title.focus(); else modal.focus(); };
            
            setTimeout(() => {
                modal.style.opacity = '1';
                if (title) title.focus();
                if (typeof speak === 'function') {
                    speak("Sistem hatası tespit edildi. Oyun durduruldu. Lütfen ekrandaki hata kodunu kopyalayıp geliştiriciye gönderin.");
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
        try {
            // futbol_manager_save_v1 anahtarını kontrol eder
            let saveData = localStorage.getItem('futbol_manager_save_v1');
            if (saveData) {
                try {
                    let parsed = JSON.parse(saveData);
                    if (typeof parsed !== 'object' || !parsed.teams) {
                        throw new Error("Geçersiz save verisi formatı");
                    }
                } catch (e) {
                    console.warn("[AutoRepair] Bozuk save verisi tespit edildi. Veriler sıfırlanıyor...");
                    localStorage.removeItem('futbol_manager_save_v1');
                }
            }
        } catch (e) {
            console.error("[AutoRepair] LocalStorage Doctor çalışırken hata:", e);
        }
    },

    startHeartbeatMonitor: function() {
        // Oyun takılırsa diye ekrandaki sayacı okuyarak kontrol eder
        setInterval(() => {
            let timerEl = document.getElementById('time-left');
            if (timerEl && timerEl.textContent) {
                let currentTimerStr = timerEl.textContent;
                
                // Oyun ekranı açıksa ve seremoni bitmişse kontrol et
                let gameContainer = document.getElementById('game-container');
                if (gameContainer && gameContainer.style.display !== 'none' && !window.isPreMatch && !window.isGameHalted) {
                    
                    if (this.lastHeartbeatState && this.lastHeartbeatState.timer === currentTimerStr) {
                        this.lastHeartbeatState.frozenCount = (this.lastHeartbeatState.frozenCount || 0) + 1;
                        // 15 saniye (3 tur) sayaç aynı kalırsa hata ver
                        if (this.lastHeartbeatState.frozenCount >= 3) {
                            console.warn("[AutoRepair] Oyun zamanlayıcısının donduğu tespit edildi.");
                            this.handleCrash("Oyun zamanlayıcısı dondu (Heartbeat Fail). Sonsuz döngü veya animasyon donması.");
                        }
                    } else {
                        this.lastHeartbeatState = {
                            timer: currentTimerStr,
                            frozenCount: 0
                        };
                    }
                } else {
                    this.lastHeartbeatState = null;
                }
            }
        }, 5000);
    }
};


// [YENİ] Bütçe Senkronizasyon Proxy'si
// window.budget okunduğunda veya yazıldığında myTeam.budget'ı günceller
Object.defineProperty(window, 'budget', {
    configurable: true,
    get: function() {
        if(window.leagueData && window.leagueData.teams) {
            let myTeamId = window.league ? window.league.userTeamId : window.myTeamId;
            if(myTeamId) {
                let t = window.leagueData.teams.find(x => x.id === myTeamId);
                if(t) return t.budget;
            }
        }
        return window._fallbackBudget || 0;
    },
    set: function(val) {
        if(window.leagueData && window.leagueData.teams) {
            let myTeamId = window.league ? window.league.userTeamId : window.myTeamId;
            if(myTeamId) {
                let t = window.leagueData.teams.find(x => x.id === myTeamId);
                if(t) {
                    t.budget = val;
                    return;
                }
            }
        }
        window._fallbackBudget = val;
    }
});

window.FutbolAutoRepair.init();

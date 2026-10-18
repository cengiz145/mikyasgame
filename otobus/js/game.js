// HERKESİ SEVİYE 1'DEN BAŞLATMA PROTOKOLÜ (GLOBAL SEZON 1)
try {
    if (typeof localStorage !== 'undefined') {
        if (localStorage.getItem('sim_season_level1') !== 'true') {
            localStorage.setItem('sim_season_level1', 'true');
            localStorage.setItem('licenseLevel', '1');
            localStorage.setItem('completedTasks', '0');
            localStorage.setItem('unlockedCities', JSON.stringify(["Tekirdağ"]));
            localStorage.setItem('merkezUs', 'Tekirdağ');
        }
    }
} catch(e) {}

﻿/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU OYUN MOTORU (GAME.JS)
 ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU OYUN MOTORU (GAME.JS)
   ========================================================================== */

const Game = {
    // --- State Variables ---
    username: null,
    licenseLevel: parseInt(localStorage.getItem('licenseLevel')) || 1,
    hasPassedLevel10: function() {
        return (this.completedTasks >= 10) || (this.licenseLevel > 10);
    },
    completedTasks: parseInt(localStorage.getItem('completedTasks')) || 0, // 0 to 26
    playerBudget: parseFloat(localStorage.getItem('para')) || 0,
    clockMinutes: parseFloat(localStorage.getItem('clockMinutes')) || 480, // Varsayılan 08:00 (480 dakika)
    unlockedCities: (() => {
        try {
            return JSON.parse(localStorage.getItem('unlockedCities')) || ["Tekirdağ"];
        } catch(e) {
            return ["Tekirdağ"];
        }
    })(),
    currentCity: localStorage.getItem('merkezUs') || "Tekirdağ",
    
    // --- Active Route State ---
    activeRouteId: null,
    activeRouteData: null,
    currentStopIndex: 0,
    currentDistanceToNext: 0,
    passengersOnBoard: 0,
    
    // --- Driving State ---
    mode: "driver",

    speed: 0,
    maxSpeed: 90,
    acceleration: 0,
    lanePosition: 50, // 0 to 100 (50 is center)
    steeringAngle: 0, // Direksiyon açısı (-30 ile +30 arası)
    driftVelocity: 0,
        roadCurvature: 0, // Rüzgar / Eğim kayma hızı
    targetDriftVelocity: 0,
    lastDriftChangeTime: 0,
    isDriving: false,
    isBeingTowed: false, // Çekici durumu
    savedState: null, // Kaza anı kayıt noktası
    busDamage: { leftWindow: 0, rightWindow: 0, front: 0, wipers: 0, headlights: 0, exhaust: 0, health: 100 }, // Hasar durumu
    lastFrameTime: 0,
    animationFrameId: null,
    kasisDistance: null, // Kasis (Speed bump) için mesafe
    lastRearHitTime: 0,
    passengerAngerTimer: 0,
    engineRPM: 800,
    currentGear: 1,
    obstacles: [],
    
    // --- Keys State ---
    // --- Cockpit Simulation & Telematics ---
    stopRequestBellTriggered: false,
    passengerComfort: 100,
    lastRecordedSpeed: 0,
    lastHarshBrakeWarningTime: 0,
    radioBroadcastIndex: 0,
    isRampDeployed: false,
    isLuggageOpen: false,
    hasWheelchairPassengerAtStop: false,
    hasLostItemFound: false,
    timingDeviations: [],

    toggleWheelchairRamp: function() {
        if (this.isDriving && this.speed > 3) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Güvenlik: Araç hareket halindeyken rampa açılamaz.");
            return;
        }
        this.isRampDeployed = !this.isRampDeployed;
        const rampEl = document.getElementById('hud-ramp');
        if (this.isRampDeployed) {
            if (typeof audio !== 'undefined' && typeof audio.playRampDeploy === 'function') audio.playRampDeploy();
            if (rampEl) rampEl.style.display = 'inline-block';
            this.addXP(30);
            const msg = "Tekerlekli sandalye rampası açıldı. Yolcu güvenle biniyor: Çok teşekkür ederim kaptanım, iyi görevler. Kapatmak için tekrar U tuşuna basınız.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("♿ Rampa Açıldı (+30 XP)", "info");
        } else {
            if (typeof audio !== 'undefined' && typeof audio.playRampRetract === 'function') audio.playRampRetract();
            if (rampEl) rampEl.style.display = 'none';
            const msg = "Rampa toplandı ve kilitlendi. Güvenlik kilidi açıldı, yola devam edebilirsiniz.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        }
    },

    toggleLuggageBays: function() {
        if (this.isDriving && this.speed > 3) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Güvenlik: Araç hareket halindeyken bagaj açılamaz.");
            return;
        }
        this.isLuggageOpen = !this.isLuggageOpen;
        const lugEl = document.getElementById('hud-luggage');
        if (this.isLuggageOpen) {
            if (typeof audio !== 'undefined' && typeof audio.playLuggageBays === 'function') audio.playLuggageBays(true);
            if (lugEl) lugEl.style.display = 'inline-block';
            const msg = "Alt bagaj kapakları açıldı. Yolcu valizleri yükleniyor. Kapatmak için tekrar P tuşuna basınız.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        } else {
            if (typeof audio !== 'undefined' && typeof audio.playLuggageBays === 'function') audio.playLuggageBays(false);
            if (lugEl) lugEl.style.display = 'none';
            const msg = "Bagaj kapakları pnömatik olarak kilitlendi. Sefer için hazır.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        }
    },

    reportIBISStatus: function() {
        if (typeof audio !== 'undefined' && typeof audio.playIBISChime === 'function') audio.playIBISChime();
        const r = this.activeRouteData;
        if (!r) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("IBIS: Aktif sefer bulunmuyor.");
            return;
        }
        const start = r.startStop || (r.stops[0] ? r.stops[0].name : "Başlangıç");
        const end = r.endStop || (r.stops[r.stops.length - 1] ? r.stops[r.stops.length - 1].name : "Son Durak");
        const lineCode = (r.hatNo || "26").toUpperCase();
        const msg = `IBIS Hat Bilgisayarı: Hat ${lineCode}. Güzergah: ${start} kalkışlı, ${end} varışlı. Dış LED tabela ve iç yolcu anons ekranı senkronize.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
    },

    reportScheduleAdherence: function() {
        if (typeof audio !== 'undefined' && typeof audio.playIBISChime === 'function') audio.playIBISChime();
        const stopData = this.activeRouteData && this.activeRouteData.stops ? this.activeRouteData.stops[this.currentStopIndex] : null;
        if (!stopData || !stopData.scheduledMinutes) {
            const defMsg = "Sefer Zamanlaması: Duraklara tam vaktinde ulaşıyorsunuz. Sıfır dakika sapma.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(defMsg);
            return;
        }
        const delta = this.clockMinutes - stopData.scheduledMinutes;
        if (Math.abs(delta) <= 1.0) {
            const msg = "Sefer Zamanlaması: Harika gidiyorsunuz, duraklara tam vaktinde ulaşıyorsunuz. Sıfır dakika sapma.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        } else if (delta < -1.0) {
            const early = Math.abs(Math.round(delta));
            const msg = `Sefer Zamanlaması: Planlanan çizelgeden ${early} dakika erken gidiyorsunuz. Durakta kalkış saatini bekleyiniz.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        } else {
            const late = Math.round(delta);
            const msg = `Sefer Zamanlaması: ${late} dakika rötarınız var. Trafik durumuna göre durak beklemesini kısa tutunuz.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        }
    },

    checkLostAndFound: function() {
        const isFinalStop = this.activeRouteData && (this.currentStopIndex >= this.activeRouteData.stops.length - 1);
        if (this.isDriving || !isFinalStop) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Kayıp eşya kontrolü son durakta tüm yolcular indikten sonra yapılır.");
            return;
        }
        if (this.hasLostItemFound) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Koltuklar zaten kontrol edildi. Tüm eşyalar emanet bürosuna teslim edildi.");
            return;
        }
        this.hasLostItemFound = true;
        if (typeof audio !== 'undefined' && typeof audio.playLostAndFoundWalk === 'function') {
            audio.playLostAndFoundWalk(() => {
                this.addMoney(100);
                this.addXP(50);
                const msg = "Arka koltukta unutulan bir çanta bulundu ve TEKULAŞ Emanet Bürosuna teslim edildi! 100 Lira dürüstlük primi kazandınız.";
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🎒 Kayıp Eşya Bulundu (+100 ₺ / +50 XP)", "success");
            });
        }
    },

    getComfortStatus: function() {
        const c = Math.round(this.passengerComfort);
        if (c >= 90) return "Mükemmel";
        if (c >= 75) return "Çok İyi";
        if (c >= 60) return "Normal";
        if (c >= 45) return "Sarsıntılı";
        return "Kritik Derecede Konforsuz";
    },

    handleRadioDispatch: function() {
        const route = this.activeRouteData;
        const routeName = route ? route.name : "Şehir İçi Sefer";
        
        const dispatchMessages = [
            `TEKULAŞ Hareket Merkezi: ${routeName} kaptanı, sefer saatlerinize ve durak bekleme sürelerine riayet ediniz. Güzergah genelinde yol durumu akıcıdır.`,
            `Hareket Kontrol: Tüm araçların dikkatine, Değirmenaltı ve Çorlu yönündeki kavşaklarda kontrollü geçiş yapınız. İyi nöbetler.`,
            `Merkezden Hat 26 ve çevre hatlara: Takip mesafesini koruyunuz. Araç içi telemetri ve yolcu konfor verileriniz sisteme işlenmektedir.`,
            `Hareket Merkezi: Süleymanpaşa sahil ve çarşı güzergahında sinyalizasyon akışı normaldir. Durak yanaşma nizamını muhafaza ediniz.`,
            `Dispeçer: Kaptan, aracınızın hava basıncı ve fren sistemini periyodik kontrol ediniz. Hayırlı seferler dileriz.`
        ];
        
        const idx = this.radioBroadcastIndex % dispatchMessages.length;
        this.radioBroadcastIndex++;
        const message = dispatchMessages[idx];
        
        if (typeof audio !== 'undefined' && typeof audio.playDispatchRadio === 'function') {
            audio.playDispatchRadio(message);
        } else if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(message);
        }
        
        const navEl = document.getElementById('nav-feedback');
        if (navEl) navEl.innerText = "📻 TELSİZ: " + message;
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
            audio.updateNvdaLiveRegion("Telsiz Anonsu: " + message);
        }
    },

    // --- Keys State ---
    keys: { w: false, s: false, a: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false },

    // --- Session Stats ---
    sessionMoney: 0,
    sessionPenalties: 0,
    
    ticketPrices: { tam: 15, ogrenci: 8, yasli: 0 },

    loadFromFirebase: function(username) {
        return new Promise((resolve) => {
            try {
                if (!window.db) {
                    this.username = username;
                    console.warn("Offline mod: Firebase bağlantısı yok, yerel verilerle devam ediliyor.");
                    resolve();
                    return;
                }

                this.username = username;
                const ref = window.db.ref('otobus_simulasyonu/kullanicilar/' + username);
                
                let isResolved = false;
                const timeoutId = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        console.warn("Firebase yanıt vermiyor (İnternet yavaş veya yok), yerel verilerle devam ediliyor.");
                        resolve();
                    }
                }, 2000);

                ref.once('value').then((snapshot) => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timeoutId);

                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        // Herkesi Seviye 1'den başlat kuralı (Global Sezon Reset)
                        if (data.season !== 'season_level1') {
                            this.licenseLevel = 1;
                            this.completedTasks = 0;
                            this.playerBudget = data.playerBudget || 0;
                            this.clockMinutes = data.clockMinutes || 480;
                            this.unlockedCities = ["Tekirdağ"];
                            this.currentCity = "Tekirdağ";
                            this.saveData(); // Firebase bulut kaydını da Seviye 1 olarak güncelle
                        } else {
                            this.licenseLevel = data.licenseLevel || 1;
                            this.completedTasks = data.completedTasks || 0;
                            this.playerBudget = data.playerBudget || 0;
                            this.clockMinutes = data.clockMinutes || 480;
                            this.unlockedCities = data.unlockedCities || ["Tekirdağ"];
                            this.currentCity = data.currentCity || "Tekirdağ";
                        }
                    } else {
                        this.licenseLevel = 1;
                        this.completedTasks = 0;
                        this.saveData(); // Yeni profil
                    }
                    resolve();
                }).catch(err => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timeoutId);
                    console.error("Firebase yükleme hatası:", err);
                    resolve();
                });
            } catch (fatalError) {
                console.error("Firebase kritik hata, yerel kayıtla devam:", fatalError);
                resolve();
            }
        });
    },

    saveData: function() {
        // Local fallback backup (crash-proof)
        try {
            localStorage.setItem('sim_season_level1', 'true');
            localStorage.setItem('licenseLevel', this.licenseLevel);
            localStorage.setItem('completedTasks', this.completedTasks);
            localStorage.setItem('para', this.playerBudget);
            localStorage.setItem('clockMinutes', this.clockMinutes);
            localStorage.setItem('unlockedCities', JSON.stringify(this.unlockedCities));
            localStorage.setItem('merkezUs', this.currentCity);
        } catch (storageErr) {
            console.warn("Yerel depolama kayıt uyarısı:", storageErr);
        }

        // Firebase Cloud Save
        try {
            if (window.db && this.username) {
                window.db.ref('otobus_simulasyonu/kullanicilar/' + this.username).set({
                    season: 'season_level1',
                    licenseLevel: this.licenseLevel,
                    completedTasks: this.completedTasks,
                    playerBudget: this.playerBudget,
                    clockMinutes: this.clockMinutes,
                    unlockedCities: this.unlockedCities,
                    currentCity: this.currentCity
                }).catch(e => {
                    console.error("Firebase save error", e);
                });
            }
        } catch (e) {
            console.error("Firebase senkronizasyon hatası (Senkron denendi ama başarısız oldu)", e);
        }
    },

    getLicenseTitle: function() {
        if (this.completedTasks >= 10 || this.licenseLevel > 10) {
            return `${this.licenseLevel}. Sınıf Master Kaptan (İlçe & Şehirlerarası)`;
        }
        const lvl = Math.min(10, Math.max(1, this.licenseLevel));
        const titles = [
            "",
            "1. Seviye Çırak Şehir İçi Sürücü",
            "2. Seviye Stajyer Şehir İçi Sürücü",
            "3. Seviye Acemi Şehir İçi Sürücü",
            "4. Seviye Kalfalık Şehir İçi Sürücü",
            "5. Seviye Deneyimli Şehir İçi Şoför",
            "6. Seviye Kıdemli Şehir İçi Şoför",
            "7. Seviye Uzman Şehir İçi Şoför",
            "8. Seviye Şehir İçi Hat Kaptanı",
            "9. Seviye Şehir İçi Başkaptan",
            "10. Seviye Usta Şehir İçi Kaptan (Son Sınav)"
        ];
        return titles[lvl] || `${lvl}. Seviye Şehir İçi Sürücü`;
    },

    completeTask: function() {
        if (!this.activeRouteId) return;

        const taskMatch = this.activeRouteId.match(/_task_(\d+)/);
        if (taskMatch) {
            const taskIndex = parseInt(taskMatch[1]);
            if (taskIndex === this.completedTasks) {
                this.completedTasks++;
            }
            
            // 1 görev = 1 seviye ilerleme (10 seviyeyi geçtikten sonra ilçe ve şehirlerarası açılır)
            this.licenseLevel = Math.max(this.licenseLevel, this.completedTasks + 1);

            if (this.completedTasks === 10) {
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Tebrikler kaptan! Şehir içinde 10 seviyeyi başarıyla geçtiniz! İlçe belediye hatları ve şehirlerarası harita açıldı!");
                }
                if (typeof UI !== 'undefined') {
                    UI.showToast("🎉 10 Seviye Geçildi! İlçe ve Şehirlerarası Hatlar Açıldı!", "success");
                }
            } else if (this.completedTasks < 10) {
                const remaining = 10 - this.completedTasks;
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(`Görev tamamlandı. Seviye ${this.licenseLevel}'e yükseldiniz. İlçe ve şehirlerarası haritaya ${remaining} seviye kaldı.`);
                }
            }

            this.saveData();
        }
        
        UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, this.getLicenseTitle());
    },

    addMoney: function(amount) {
        this.playerBudget += amount;
        this.sessionMoney += amount;
        this.saveData();
        UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, this.getLicenseTitle());
    },

    deductMoney: function(amount) {
        // EĞİTİM MODU GÜVENCESİ: Eğitim aşamasında oyuncudan ceza kesilmez, insafsız ceza sistemi devre dışıdır
        this.sessionPenalties = 0;
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast("Eğitim Modu: Trafik cezası uygulanmadı (Muaf).", "info");
        }
        UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, this.getLicenseTitle());
    },

    setCity: function(cityName) {
        this.currentCity = cityName;
        this.saveData();
    },

    unlockCity: function(cityName) {
        if (!this.unlockedCities.includes(cityName)) {
            this.unlockedCities.push(cityName);
            this.saveData();
        }
    },

    startRoute: function(routeId) {
        // VELİMEŞE İLÇE SINIR KORUMASI: Velimeşe modundaysa dışarı çıkış kapalıdır!
        if (this.isVelimeseLocked) {
            const nextRoute = (typeof routesData !== 'undefined' && routesData[routeId]) || null;
            if (nextRoute && !nextRoute.isVelimeseLocked && nextRoute.district !== 'Velimeşe' && !nextRoute.id.includes('velimese')) {
                const lockMsg = "Velimeşe Mahalle İçi Modundasınız. İlçe dışına çıkış kapalıdır. Velimeşe'deki 100 sokak arasında serbestçe seyahat edebilirsiniz.";
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(lockMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(lockMsg, 'warning');
                return false;
            }
        }
        this.activeRouteId = routeId;
        this.roadCurvature = 0;
        this.activeRouteData = routesData[routeId];
        this.passengerComfort = 100;
        this.stopRequestBellTriggered = false;
        this.lastRecordedSpeed = 0;
        this.lastHarshBrakeWarningTime = 0;
        this.isRampDeployed = false;
        this.isLuggageOpen = false;
        this.hasLostItemFound = false;
        this.hasWheelchairPassengerAtStop = false;
        const rampHudInit = document.getElementById('hud-ramp');
        if (rampHudInit) rampHudInit.style.display = 'none';
        const lugHudInit = document.getElementById('hud-luggage');
        if (lugHudInit) lugHudInit.style.display = 'none';
        const ibisTextEl = document.getElementById('hud-ibis-text');
        if (ibisTextEl && this.activeRouteData) {
            const hNo = (this.activeRouteData.hatNo || "26").toUpperCase();
            const sSt = this.activeRouteData.startStop || (this.activeRouteData.stops[0] ? this.activeRouteData.stops[0].name : "MERKEZ");
            const eSt = this.activeRouteData.endStop || (this.activeRouteData.stops[this.activeRouteData.stops.length - 1] ? this.activeRouteData.stops[this.activeRouteData.stops.length - 1].name : "VARIŞ");
            ibisTextEl.innerText = `[${hNo}] ${sSt} ➔ ${eSt}`;
        }
        const bellHudInit = document.getElementById('hud-stop-request');
        if (bellHudInit) bellHudInit.style.display = 'none';
        const comfortElInit = document.getElementById('hud-comfort-val');
        if (comfortElInit) {
            comfortElInit.innerText = '%100';
            comfortElInit.style.color = '#4ade80';
        }
        if (this.activeRouteData && (this.activeRouteData.isVelimeseLocked || this.activeRouteData.district === 'Velimeşe')) {
            this.isVelimeseLocked = true;
        }
        
        if (!this.activeRouteData) return;

        const r = this.activeRouteData;
        const startStop = r.startStop || (r.stops[0] ? r.stops[0].name : "Başlangıç Durağı");
        const endStop = r.endStop || (r.stops[r.stops.length - 1] ? r.stops[r.stops.length - 1].name : "Hedef Durak");
        const intermediate = r.intermediateStops || (r.stops.length > 2 ? r.stops.slice(1, -1).map(s => s.name) : []);
        
        // RESMÎ SEFER SAATİ VE DAKİKLİK ÇİZELGESİ (TIMETABLE HESABI)
        let accumulatedMinutes = this.clockMinutes;
        r.stops.forEach((s, idx) => {
            if (idx === 0) {
                s.scheduledMinutes = accumulatedMinutes;
            } else {
                const distKm = s.gercekMesafeSonraki || (s.distance ? s.distance / 1000 : 1.2);
                const driveTimeMinutes = (distKm / 35) * 60;
                accumulatedMinutes += driveTimeMinutes + 0.8;
                s.scheduledMinutes = accumulatedMinutes;
            }
        });
        this.timingDeviations = [];

        const badgeEl = document.getElementById("hud-line-badge");
        if (badgeEl) {
            if (r.isIntercity) {
                badgeEl.innerText = "🛣️ [ŞEHİRLERARASI] " + r.name;
            } else if (r.hatNo) {
                badgeEl.innerText = "🏙️ [BELEDİYE - HAT " + r.hatNo + "] " + r.name;
            } else {
                badgeEl.innerText = "🏙️ [BELEDİYE] " + r.name;
            }
        }

        const routeDescEl = document.getElementById("garage-route-desc");
        if (routeDescEl) {
            routeDescEl.innerHTML = "<strong>" + r.name + "</strong><br><span style=\"color: var(--secondary); font-size: 0.95rem;\">" + startStop + " ➔ " + endStop + " (" + r.stops.length + " Durak)</span>";
        }

        const detailsContainer = document.getElementById("garage-mission-details");
        if (detailsContainer) {
            let stopsHtml = r.stops.map((s, idx) => {
                let badge = idx === 0 ? " [KALKIŞ DURAĞI]" : (idx === r.stops.length - 1 ? " [VARIŞ - HEDEF SON DURAK]" : " [ARA DURAK]");
                let color = idx === 0 ? "#38bdf8" : (idx === r.stops.length - 1 ? "#22c55e" : "#f1f5f9");
                return "<li style=\"margin-bottom: 5px; color: " + color + ";\"><strong>" + (idx + 1) + ". Durak:</strong> " + s.name + " <span style=\"font-size: 0.85rem; opacity: 0.85;\">" + badge + "</span></li>";
            }).join("");

            detailsContainer.innerHTML = [
                '<div style="font-size: 1.15rem; color: #38bdf8; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid rgba(56,189,248,0.3); padding-bottom: 6px;">📋 ' + r.name + '</div>',
                (r.isIntercity ? '<div style="background: rgba(250,204,21,0.15); border: 1px solid #facc15; color: #facc15; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px;">🛣️ <strong>Sefer Türü:</strong> Şehirler Arası Seyahat | <strong>Araç:</strong> Şehirlerarası Seyahat Otobüsü (Travego / Tourismo)</div>' : '<div style="background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #38bdf8; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px;">🏙️ <strong>Sefer Türü:</strong> Şehir İçi ve İlçe Belediye Seferi | <strong>Araç:</strong> TEKULAŞ Belediye Otobüsü</div>'),
                '<div style="margin-bottom: 8px;">📍 <strong>Kalkış (Başlangıç) Durağı:</strong> <span style="color: #38bdf8; font-weight: bold;">' + startStop + '</span></div>',
                '<div style="margin-bottom: 8px;">🏁 <strong>Gidilecek Son Durak (Hedef):</strong> <span style="color: #22c55e; font-weight: bold;">' + endStop + '</span></div>',
                '<div style="margin-bottom: 8px;">🛑 <strong>Durulacak Duraklar Listesi (Sırasıyla):</strong><ol style="margin-left: 20px; margin-top: 6px; margin-bottom: 6px;">' + stopsHtml + '</ol></div>',
                '<div style="margin-bottom: 12px;">📊 <strong>Toplam Durak Sayısı:</strong> ' + r.stops.length + ' Durak</div>',
                '<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.15); margin: 12px 0;">',
                '<div style="margin-bottom: 8px; font-weight: bold; color: #facc15; font-size: 1.05rem;">🕹️ Nasıl Yapılacak? (Ayrıntılı Görev ve Sürüş Yönergesi):</div>',
                '<ul style="padding-left: 20px; font-size: 0.95rem; margin-bottom: 10px;">',
                '    <li style="margin-bottom: 6px;"><strong>Kalkış ve Hızlanma:</strong> <code>W</code> veya <code>Yukarı Ok</code> tuşuna basarak gaz verin ve kalkış yapın. Şeridinizi korumak için <code>A / D</code> veya <code>Sol / Sağ Ok</code> tuşlarını kullanın.</li>',
                '    <li style="margin-bottom: 6px;"><strong>Durağa Yaklaşma ve Duracak Zili:</strong> Durağa 220 metre kala inecek yolcu varsa akustik <code>DURACAK</code> zili çalar ve kokpitte kırmızı ikaz lambası yanar. Kademeli fren ve retarder ile sarsıntısız durun.</li>',
                '    <li style="margin-bottom: 6px;"><strong>Kneeling ve Kapılar:</strong> Araç durduğunda <code>E</code> (Ön Kapı) ve <code>Q</code> (Arka Kapı) ile kapıları açın. Araç durağa yana yatar (Kneeling). Yolcular Tekirdağ Kart basarken resmî validatör sinyallerini dinleyin.</li>',
                '    <li style="margin-bottom: 6px;"><strong>Kaptan Telsizi ve Konfor Takibi:</strong> <code>T</code> tuşuna basarak TEKULAŞ Hareket Merkezi telsiz anonsunu dinleyin. <code>C</code> tuşuyla anlık Yolcu Konfor Endeksinizi kontrol edin.</li>',
                '    <li style="margin-bottom: 6px;"><strong>Görevi Başarıyla Bitirme:</strong> Sırasıyla tüm duraklara uğrayıp son durak olan <strong>' + endStop + '</strong> durağına vardığınızda görevi tamamlayıp prim kazanın!</li>',
                '</ul>',
                '<div style="font-size: 0.85rem; color: #94a3b8; font-style: italic; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">💡 Kaptan Kısayolları: <strong>G</strong> Görev Durumu | <strong>U</strong> Engelli Rampası | <strong>P</strong> Pnömatik Bagaj | <strong>I</strong> IBIS Hat Tabelası | <strong>Z</strong> Zamanlama | <strong>J</strong> Kayıp Eşya | <strong>T</strong> Telsiz | <strong>C</strong> Konfor | <strong>R</strong> Hız | <strong>Shift+T</strong> Saat.</div>'
            ].join("");
        }

        this.mode = "driver";
        UI.switchScreen("garage-screen");

        // Garaj brifingi otomatik konusmasi kaldirildi (sadece navigasyon sesli)
    },

    resumeFromSave: function() {
        if (!this.savedState) return;
        
        this.activeRouteData = this.savedState.routeData;
        this.currentStopIndex = this.savedState.stopIndex;
        this.currentDistanceToNext = this.savedState.distance;
        this.currentRoadType = this.savedState.roadType;
        
        // Temizle
        this.savedState = null;
        document.getElementById('btn-start-game').innerText = "Yeni Bir Oyuna Başla";
        
        // Sürüş durumunu ayarla
        this.isDriving = true;
        this.speed = 0;
        this.lanePosition = 50;
        this.steeringAngle = 0;
        this.driftVelocity = 0;
        this.targetDriftVelocity = 0;
        this.obstacles = [];
        this.activeNPCs = [];
        this.frontDoorOpen = false;
        this.rearDoorOpen = false;
        this.airPressure = 120; // BUG FIX: Sanayiden çıkınca hava tankları fullenir
        this.isEmergencyBrakeLocked = false;
        this.isLowAirAlarmActive = false;
        this.isHeadlightsOn = false;
        this.isNight = (this.clockMinutes < 360 || this.clockMinutes >= 1080); // Başlangıç saat kontrolü
        
        // Ambient sesleri ve UI
        audio.playStreetAmbience();
        
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }

        UI.switchScreen('driving-screen');
        audio.stopMenuMusic();
        audio.startEngine(); // BUG FIX: Motoru yeniden başlat
        
        // BUG FIX: Eğer kaza yapmadan önce özel bir hava durumu varsa geri getir
        if (this.weather !== 'sunny' && typeof audio.startWeather === 'function') {
            audio.startWeather(this.weather);
        }
        
        this.lastFrameTime = performance.now();
        this.nextNavSoundTime = this.lastFrameTime + 10000 + Math.random() * 20000;
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        
        this.planNextStop(true); // "true" pass to indicate resume, so it doesn't read the whole start sequence again
    },

    beginDriving: function(restoreMode = false) {
        this.isDriving = true;
        this.busDamage = { leftWindow: 0, rightWindow: 0, front: 0, wipers: 0, headlights: 0, exhaust: 0, health: 100 };
        this.isHeadlightsOn = false; // Farlar başlangıçta kapalı
        this.kasisDistance = null;
        this.lastRearHitTime = 0;
        this.passengerAngerTimer = 0;
        this.engineRPM = 800;
        this.currentGear = 1;
        
        // ZAMAN VE HAVA DURUMU SİSTEMİ
        audio.stopWeather(); // Mevcut hava olayını temizle
        this.isNight = (this.clockMinutes < 360 || this.clockMinutes >= 1080); // Gece başlangıcı kontrolü
        
        // YÜZDELİK ŞANSLAR KALDIRILDI - MEVSİM VE GÜNÜN SAATİ ASTRONOMİK SICAKLIK FORMÜLÜ
        const currentMonth = new Date().getMonth(); // 0: Ocak, 9: Ekim vb.
        if (currentMonth === 11 || currentMonth === 0 || currentMonth === 1) {
            this.weather = 'snowy'; // Kış ayları (Aralık, Ocak, Şubat)
            // Kış sıcaklık eğrisi: Gece -6, öğlen 0 derece
            this.temperature = Math.round(-3 + Math.cos(((this.clockMinutes - 840) / 720) * Math.PI) * 3);
            audio.startWeather('snowy');
        } else if ((currentMonth >= 2 && currentMonth <= 4) || (currentMonth >= 9 && currentMonth <= 10)) {
            this.weather = 'rainy'; // İlkbahar ve Sonbahar ayları
            // Bahar yağmur eğrisi: Gece 8, öğlen 16 derece
            this.temperature = Math.round(12 + Math.cos(((this.clockMinutes - 840) / 720) * Math.PI) * 4);
            audio.startWeather('rainy', 2);
        } else {
            this.weather = 'sunny'; // Yaz ayları
            // Yaz güneş eğrisi: Gece 20, öğlen 31 derece
            this.temperature = Math.round(25 + Math.cos(((this.clockMinutes - 840) / 720) * Math.PI) * 6);
        }
        
        // Klima başlangıç değerleri
        this.busTemperature = this.temperature;
        this.isACOn = false;
        this.lastTempCheckTime = performance.now();

        this.sessionMoney = 0;
        this.sessionPenalties = 0;
        
        this.speed = 0;
        this.lanePosition = 50;
        this.steeringAngle = 0;
        this.driftVelocity = 0;
        this.targetDriftVelocity = 0;
        this.totalDistanceCovered = 0; // 3D Ses koordinat sistemi için
        
        // Pnömatik (Hava) Sistemi Değişkenleri
        this.airPressure = 120; // Tam dolu (PSI)
        this.isLowAirAlarmActive = false;
        this.isEmergencyBrakeLocked = false;
        this.isBrakeKeyDown = false;
        
        this.obstacles = [];
        this.activeNPCs = [];
        this.frontDoorOpen = false;
        this.rearDoorOpen = false;
        this.departCountdownTimer = null;
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }

        UI.switchScreen('driving-screen');
        
        audio.stopMenuMusic();
        
        // Zemin Ses Kaynaklarını Haritaya Yerleştir (3D)
        audio.placeAmbientSources(this.activeRouteData, this.licenseLevel);
        
        this.lastFrameTime = performance.now();
        this.nextNavSoundTime = this.lastFrameTime + 10000 + Math.random() * 20000; // 10-30s sonra ilk ses
        this.nextAmbienceTime = this.lastFrameTime + 5000 + Math.random() * 5000;
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        
        this.planNextStop();
    },

    planNextStop: function(isResume = false) {
        this.stopApproachAnnounced = false;
        this.stopRequestBellTriggered = false;
        const bellHudPlan = document.getElementById('hud-stop-request');
        if (bellHudPlan) bellHudPlan.style.display = 'none';
        this.isRampDeployed = false;
        const rampHudPlan = document.getElementById('hud-ramp');
        if (rampHudPlan) rampHudPlan.style.display = 'none';
        // Her 3 durakta bir tekerlekli sandalye kullanan erişilebilir yolcu durakta bekler
        this.hasWheelchairPassengerAtStop = (this.currentStopIndex > 0 && this.currentStopIndex % 3 === 1);
        if (this.currentStopIndex >= this.activeRouteData.stops.length) {
            this.finishRoute(true);
            return;
        }
        
        const nextStop = this.activeRouteData.stops[this.currentStopIndex];
        
        // Zemin Akustiğini Ayarla (Dinamik İlçe/Durak Bazlı)
        let stopNameLower = (nextStop.name || "").toLowerCase();
        
        let isOtoyolArea = stopNameLower.includes("malkara") || stopNameLower.includes("çorlu") || 
            stopNameLower.includes("çerkezköy") || stopNameLower.includes("ergene") || 
            stopNameLower.includes("kınalı") || stopNameLower.includes("otoyol");

        // Otoyol kuralı: Sadece Ehliyet Seviyesi 5 (Åehirlerarası) ve üzeri ise açılır.
        if (isOtoyolArea && this.licenseLevel >= 5) {
            audio.currentTerrain = "otoyol";
        } 
        else if (typeof sehirRotalari !== 'undefined' && sehirRotalari[this.activeRouteId] && sehirRotalari[this.activeRouteId].terrain) {
            // Åehrin genel terrain'ine dön
            audio.currentTerrain = sehirRotalari[this.activeRouteId].terrain;
        } else {
            audio.currentTerrain = "asfalt";
        }
        
        if (!isResume) {
            if (this.isFetchingRoute) {
                console.warn("Spam koruması: OSRM Rota şu an çekiliyor, mükerrer istek iptal edildi.");
                return;
            }
            this.isFetchingRoute = true;

            // OSRM HESAPLAMASI BAŞLIYOR (Geçici olarak oyunu duraklat)
            const wasDriving = this.isDriving;
            this.isDriving = false; // Rota hesaplanana kadar otobüs hareket etmesin
            
            // Eğer sanayi menüsünde falan değilsek, sesli ve görsel bilgi ver
            if (!document.getElementById('garage-screen').classList.contains('hidden') === false) {
                if (typeof audio.speak === 'function') audio.speak("Rota hesaplanıyor, lütfen bekleyin.");
                if (typeof UI !== 'undefined') UI.showToast("Gerçek yol ve kasis bilgileri indiriliyor...", "info");
            }

            let lat1, lon1, lat2, lon2;
            if (this.currentStopIndex === 0) {
                lat2 = nextStop.lat; lon2 = nextStop.lon;
                lat1 = lat2 - 0.01; lon1 = lon2 - 0.01; // Garajı durağa çok yakın varsayıyoruz
            } else {
                const prevStop = this.activeRouteData.stops[this.currentStopIndex - 1];
                lat1 = prevStop.lat; lon1 = prevStop.lon;
                lat2 = nextStop.lat; lon2 = nextStop.lon;
            }

            this.routeBumps = [];
            let fallbackDistance = (this.currentStopIndex === 0) ? nextStop.gercekMesafeSonraki * 1000 : this.activeRouteData.stops[this.currentStopIndex - 1].gercekMesafeSonraki * 1000;

            fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`)
                .then(res => res.json())
                .then(data => {
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        this.currentDistanceToNext = route.distance; // OSRM gerçek mesafe (metre)
                        
                        // Kasis Eşleştirme (Polyline ve OSM verisi ile)
                        const coords = route.geometry.coordinates; // [[lon, lat], [lon, lat]]
                        let accumulatedDistance = 0;
                        
                        const cityBumps = (typeof window.cityBumps !== 'undefined') ? window.cityBumps[this.currentCity] : [];
                        
                        if (cityBumps && cityBumps.length > 0) {
                            for (let i = 0; i < coords.length - 1; i++) {
                                let c1 = coords[i]; let c2 = coords[i+1];
                                // Segment mesafesi (kuş uçuşu - OSRM genelde sık noktalıdır)
                                let d = typeof calculateDistance === 'function' ? calculateDistance(c1[1], c1[0], c2[1], c2[0]) * 1000 : 50;
                                accumulatedDistance += d;
                                
                                // Bu segment etrafında kasis var mı?
                                cityBumps.forEach(bump => {
                                    let distToBump = typeof calculateDistance === 'function' ? calculateDistance(bump.lat, bump.lon, c2[1], c2[0]) * 1000 : 100;
                                    if (distToBump < 50) { // 50 metre yakındaysa yolda kabul et
                                        // Aynı kasisi tekrar ekleme
                                        if (!this.routeBumps.find(b => b.lat === bump.lat && b.lon === bump.lon)) {
                                            this.routeBumps.push({ lat: bump.lat, lon: bump.lon, distance: accumulatedDistance, passed: false });
                                        }
                                    }
                                });
                            }
                        }
                        
                        if (typeof UI !== 'undefined' && document.getElementById('garage-screen').classList.contains('hidden')) {
                            UI.showToast("Gerçek yol oluşturuldu!", "success");
                        }
                    } else {
                        this.currentDistanceToNext = fallbackDistance;
                    }
                })
                .catch(err => {
                    console.error("OSRM Hatası:", err);
                    this.currentDistanceToNext = fallbackDistance;
                    if (typeof UI !== 'undefined') UI.showToast("OSRM bağlantısı koptu, yapay rotaya dönüldü.", "warning");
                })
                .finally(() => {
                    this.isFetchingRoute = false;
                    if (this.currentDistanceToNext <= 0 || isNaN(this.currentDistanceToNext)) {
                        this.currentDistanceToNext = fallbackDistance || 1000;
                    }
                    this.isDriving = wasDriving; // Sürüşü geri başlat
                    
                    // DURAN OYUN DÖNGÜSÜNÜ YENİDEN BAÅLAT
                    if (this.isDriving) {
                        this.lastFrameTime = performance.now();
                        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
                    }

                    // Cift anons engellendi (anons planNextStop icinde tek noktadan yapilir)
                });
        } else {
            this.routeBumps = this.savedState && this.savedState.routeBumps ? this.savedState.routeBumps : [];
        }

        // --- YENİ: Etkileşimli Navigasyon Dönüş Noktaları ---
        this.upcomingTurns = [];
        let numTurns = Math.floor(this.currentDistanceToNext / 1500);
        if (numTurns > 3) numTurns = 3;
        
        const directions = [
            { dir: "tam sağa", req: 100 },
            { dir: "hafif sağa", req: 50 },
            { dir: "tam sola", req: 100 },
            { dir: "hafif sola", req: 50 },
            { dir: "kavşaktan tam sağa dönün", req: 150, special: true },
            { dir: "düz ilerleyin", req: 0, special: true }
        ];

        let remainingDistance = this.currentDistanceToNext;
        for(let i=0; i<numTurns; i++) {
            remainingDistance -= (500 + Math.random() * 1000);
            if (remainingDistance > 300) {
                const randType = directions[Math.floor(Math.random() * directions.length)];
                
                // Mesafeye göre rastgele bildirim noktaları oluştur
                const initialDistToTurn = this.currentDistanceToNext - remainingDistance;
                const allMilestones = [1000, 800, 500, 300, 100];
                
                // Sadece dönüşe yeterince mesafe varsa o kilometre taşını dahil et
                let valid = allMilestones.filter(m => m < initialDistToTurn - 50);
                
                // Her noktada %40 ihtimalle sessiz kal (çok konuşup darlamaması için)
                let selectedMilestones = valid.filter(() => Math.random() > 0.4);
                
                // Eğer şans eseri hepsi silinmişse, en az 1 tane uyarı bırak
                if (valid.length > 0 && selectedMilestones.length === 0) {
                    selectedMilestones.push(valid[Math.floor(Math.random() * valid.length)]);
                }
                
                // 0 (Åimdi dönün) uyarısı her zaman var
                selectedMilestones.push(0);
                // Büyükten küçüğe sırala
                selectedMilestones.sort((a,b) => b - a);
                
                this.upcomingTurns.push({
                    distance: remainingDistance,
                    direction: randType.dir,
                    requiredProgress: randType.req,
                    isSpecial: randType.special || false,
                    currentProgress: 0,
                    milestones: selectedMilestones,
                    state: "approaching", // approaching, waiting, completed
                    lastWarningTime: 0
                });
            }
        }
        // Uzaklığa göre büyükten küçüğe sırala
        this.upcomingTurns.sort((a,b) => b.distance - a.distance);

        document.getElementById('hud-next-stop').innerText = `${nextStop.name} (${this.currentStopIndex + 1}/${this.activeRouteData.stops.length})`;
        const activeBusObj = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
        const totalBusCap = activeBusObj ? activeBusObj.totalCapacity : (this.activeRouteData ? this.activeRouteData.otobusKapasitesi : 40);
        document.getElementById('hud-passengers').innerText = `${this.passengersOnBoard} / ${totalBusCap}`;
        
        this.currentRoadType = nextStop.yolTipi || "Asfalt Cadde";
        this.upcomingIntersection = nextStop.kavsakVar || false;
        this.intersectionAnnounced = false;
        
        // Hız limitini yola göre ayarla
        if (this.currentRoadType === "Mahalle Sokağı") {
            this.maxSpeed = 50;
        } else if (this.currentRoadType === "Toprak Yol" || this.currentRoadType === "Kumlu Yol" || this.currentRoadType === "Çimenli Yol") {
            this.maxSpeed = 40;
        } else {
            this.maxSpeed = 90; // Asfalt, Sahil Åeridi vb.
        }

        // FİZİKSEL GÖRÜÅ CEZASI (Visibility Penalty) - KÖR OYUNCULAR İÇİN KALDIRILDI
        // Oyuncular ekranı görmediği için farların kapalı olması sebebiyle hızlarının 20'ye düşmesini "bug" sanıyor.
        this.hasPoorVisibility = false;
        
        let kalanDurak = this.activeRouteData.stops.length - this.currentStopIndex;
        if (kalanDurak === 1) {
            audio.speak("Son durak: " + nextStop.name);
        } else if (this.currentStopIndex === 0) {
            audio.speak("İlk durak: " + nextStop.name);
        } else {
            audio.speak("Sonraki durak: " + nextStop.name);
        }
    },

    calculateCrashOutcome: function(damageAmount) {
        // YÜZDELİK ŞANSLAR KALDIRILDI - KİNETİK ENERJİ VE HASAR EŞİK FORMÜLÜ
        // Darbenin kinetik şiddetine göre deterministik fiziksel sonuç
        if (damageAmount >= 35) {
            return 2; // Ağır darbe eşiği: Parça veya cam tamamen kırılır (100% hasar)
        } else if (damageAmount >= 15) {
            return 1; // Orta darbe eşiği: Parça çatlar / gevşer (50% hasar)
        }
        return 0; // Düşük darbe: Sadece hafif kaporta çizilmesi, parça sağlam kurtulur
    },

    gameLoop: function(currentTime) {
        if (!this.isDriving) return;
        
        let deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // --- ZAMANIN AKIÅI (Toplam 60 dakika: 45 dk gündüz, 15 dk gece) ---
        if (this.speed > 5) {
            let timeMultiplier = this.isNight ? 0.8 : (720 / 2700);
            this.clockMinutes += deltaTime * timeMultiplier;
            // BUG FIX 6: Zaman sınırsız büyümesin, 24 saat döngüsüne girsin
            this.clockMinutes = this.clockMinutes % 1440; 
        }
        
        let wasNight = this.isNight;
        this.isNight = (this.clockMinutes < 360 || this.clockMinutes >= 1080); 
        
        // BUG FIX 4: Gündüz/Gece değişimi anında far uyarısı ve ambiyans değişikliği
        if (wasNight !== this.isNight) {
            // Zaman degisim konusmasi kaldirildi
        }
        
        // DİNAMİK HAVA DURUMU VE SICAKLIK (YÜZDELİK ŞANSLAR KALDIRILDI - FORMÜLE BAĞLI GÜN DÖNGÜSÜ)
        if (!this.lastWeatherCheckTime) this.lastWeatherCheckTime = currentTime;
        if (currentTime - this.lastWeatherCheckTime > 30000) {
            this.lastWeatherCheckTime = currentTime;
            // Saatin ilerleyişine göre sürekli trigonometrik sıcaklık modellemesi:
            if (this.weather === 'snowy') {
                this.temperature = Math.round(-3 + Math.cos(((this.clockMinutes - 840) / 720) * Math.PI) * 3);
            } else if (this.weather === 'rainy') {
                this.temperature = Math.round(12 + Math.cos(((this.clockMinutes - 840) / 720) * Math.PI) * 4);
                const rainCycle = (Math.floor(this.clockMinutes / 20) % 3) + 1; // 1, 2, 3 döngüsü
                if (this.rainIntensity !== rainCycle) {
                    this.rainIntensity = rainCycle;
                    if (typeof audio.setRainIntensity === 'function') {
                        audio.setRainIntensity(this.rainIntensity);
                    }
                }
            } else {
                this.temperature = Math.round(25 + Math.cos(((this.clockMinutes - 840) / 720) * Math.PI) * 6);
            }
        }

        // BUG FIX: Eğer sekme arka planda kalırsa deltaTime aşırı büyür ve fizik motorunu patlatır.
        // Bunu engellemek için deltaTime değerini maksimum 0.1 saniye (100ms) ile sınırlandırıyoruz.
        if (deltaTime > 0.1) deltaTime = 0.1;

        // Çekici (Tow Truck) Yapay Zeka (Otopilot) Modu
        if (this.isBeingTowed) {
            let targetSpeed = 70; // Çekicinin hedef hızı
            let targetLane = 50;  // Çekicinin hedef şeridi (Orta)
            
            // Yavaşça Park Etme Zekası: Sanayiye 400 metreden az kaldıysa yavaşla
            if (this.currentDistanceToNext < 400) {
                targetSpeed = Math.min(targetSpeed, Math.max(5, (this.currentDistanceToNext / 400) * 70));
            }
            
            // Çarpışma Önleme Zekası (Sadece kendi şeridimizdekileri tara)
            let closestNPC = null;
            let closestDist = Infinity;
            
            for (let i = 0; i < this.activeNPCs.length; i++) {
                let npc = this.activeNPCs[i];
                // Sadece önümüzde olan ve şeridimizi tıkayan araçlar
                if (!npc.hasCollided && npc.y > 0 && npc.y < 250) {
                    if (Math.abs(npc.x - this.lanePosition) < 25) {
                        if (npc.y < closestDist) {
                            closestDist = npc.y;
                            closestNPC = npc;
                        }
                    }
                }
            }
            
            if (closestNPC) {
                // Çekici zekası: Sollamaya çalışıp makas atmak yerine fren yapıp arkasında beklesin (Daha ağırbaşlı)
                targetSpeed = Math.min(targetSpeed, Math.max(0, closestNPC.baseSpeed - 5));
            }
            
            // Virajlarda ve makaslarda devrilmemek için yavaşla
            if (Math.abs(this.steeringAngle) > 2.0) {
                targetSpeed = Math.min(targetSpeed, 40);
            }
            
            // Hız kontrolcüsü (Gaz/Fren simülasyonu)
            // BUG FIX 8: Çekici otopilot titreme hatası (Sert ivmelenme yerine pürüzsüz clamp)
            if (this.speed < targetSpeed) {
                this.acceleration = 12; // Gaza bas
                if (this.speed + (this.acceleration * deltaTime) > targetSpeed) {
                    this.speed = targetSpeed; // Titremeyi engellemek için direkt sabitle
                    this.acceleration = 0;
                }
            } else if (this.speed > targetSpeed + 5) {
                this.acceleration = -15; // Frene bas
            } else {
                this.acceleration = 0; // Hızı koru
                this.speed = targetSpeed; // Sürtünme kaynaklı (acceleration=-5) düşüşleri ve titremeyi iptal et
            }
            
            // Direksiyon kontrolcüsü (Åerit takip asistanı)
            let steeringDiff = targetLane - this.lanePosition;
            if (Math.abs(steeringDiff) > 1) {
                // Åeride doğru direksiyon çevir
                this.steeringAngle = steeringDiff > 0 ? 1.5 : -1.5;
            } else {
                this.steeringAngle = 0; // Åeridi bulduk, direksiyonu topla
            }
            
            // Yol bittiğinde (Sanayiye varıldığında)
            if (this.currentDistanceToNext <= 0) {
                this.isBeingTowed = false;
                this.isDriving = false;
                this.speed = 0;
                this.acceleration = 0;
                this.steeringAngle = 0;
                audio.speak("Sanayiye vardık. Araç indiriliyor. Geçmiş olsun usta.");
                document.getElementById('nav-feedback').innerText = "TEKİRDAÄ SANAYİ - VARIÅ";
                document.getElementById('hud-speed').innerText = `Hız: 0 km/s`;
                
                // Sanayi moduna geç
                SanayiMechanic.start();
                return;
            }
        }

        // --- Cadde Ortam Sesi ---
        // Kullanıcı isteği üzerine kapatıldı: Sadece NPC'ler trafiği temsil edecek
        /*
        if ((this.currentRoadType === "Asfalt Cadde" || this.currentRoadType === "Sahil Åeridi Yolu") && this.speed > 10) {
            if (currentTime > this.nextAmbienceTime) {
                audio.playStreetAmbience();
                this.nextAmbienceTime = currentTime + 8000 + Math.random() * 10000; // 8-18 saniye arası
            }
        }
        */

        // --- Etkileşimli Navigasyon (Mesafe ve Dönüş Takibi) ---
        if (this.upcomingIntersection && !this.intersectionAnnounced && this.currentDistanceToNext < 300 && this.speed > 0) {
            audio.speak("İleride kavşak var, lütfen yavaşlayın.");
            this.intersectionAnnounced = true;
        }

        if (this.upcomingTurns && this.upcomingTurns.length > 0 && this.speed > 5) {
            const currentTurn = this.upcomingTurns[0];
            const distToTurn = this.currentDistanceToNext - currentTurn.distance;

            if (distToTurn < -250 && currentTurn.state !== "completed") {
                audio.speak("Yanlış yöne saptınız, rota yeniden hesaplanıyor.");
                document.getElementById('nav-feedback').innerText = "Yanlış yöne girildi! Rota +100m uzadı.";
                document.getElementById('nav-feedback').style.color = '#ef4444';
                
                this.currentDistanceToNext += 100;
                this.roadCurvature = 0;
                
                // Zaman aşıldığında dönüşü diziden çıkar ki sonsuza kadar kalmasın
                this.upcomingTurns.shift();
                
                // Yeni bir dönüş hesapla ve başa ekle (rota yeniden hesaplandığı için)
                if (this.currentDistanceToNext > 500) {
                    const directions = [
                        { dir: "tam sağa", req: 100 },
                        { dir: "hafif sağa", req: 50 },
                        { dir: "tam sola", req: 100 },
                        { dir: "hafif sola", req: 50 },
                        { dir: "kavşaktan tam sağa dönün", req: 150, special: true }
                    ];
                    const randType = directions[Math.floor(Math.random() * directions.length)];
                    const newTurnDist = this.currentDistanceToNext - (300 + Math.random() * 200); // 300-500 metre sonra
                    
                    const newMilestones = [300, 100].filter(m => m < (this.currentDistanceToNext - newTurnDist) - 50);
                    
                    this.upcomingTurns.unshift({
                        distance: newTurnDist,
                        direction: randType.dir,
                        requiredProgress: randType.req,
                        isSpecial: randType.special || false,
                        state: "approaching",
                        currentProgress: 0,
                        milestones: newMilestones,
                        lastWarningTime: 0
                    });
                }
            } 
            else if (currentTurn.state === "approaching") {
                
                // Kavşağa 50 metre kala çapraz trafik (gerçek kavşak hissi) sesi çal
                if (distToTurn <= 50 && !currentTurn.playedIntersectionSound) {
                    audio.playIntersectionTraffic();
                    currentTurn.playedIntersectionSound = true;
                }

                let triggeredMilestone = null;
                let visOffset = this.hasPoorVisibility ? 50 : 0; // Görüş kötüyse tabelayı 50m geç fark et
                
                while (currentTurn.milestones.length > 0 && distToTurn <= currentTurn.milestones[0] - visOffset) {
                    triggeredMilestone = currentTurn.milestones.shift();
                }
                
                if (triggeredMilestone !== null) {
                    if (typeof audio.playNavChime === 'function') audio.playNavChime();
                    
                    if (triggeredMilestone === 0) {
                        const nowVariants = [
                            `Åimdi ${currentTurn.direction} dönün.`,
                            `Lütfen şimdi ${currentTurn.direction} dönün.`,
                            `Buradan ${currentTurn.direction} dönün.`
                        ];
                        let speechText = currentTurn.isSpecial ? 
                            `Åimdi ${currentTurn.direction}` : 
                            nowVariants[Math.floor(Math.random() * nowVariants.length)];
                        
                        setTimeout(() => audio.speak(speechText), 400); // Chime'dan hemen sonra
                        
                        currentTurn.state = "waiting";
                        currentTurn.lastWarningTime = currentTime;
                    } else {
                        let distText = triggeredMilestone === 1000 ? "1 kilometre" : `${triggeredMilestone} metre`;
                        
                        const distVariants = [
                            `${distText} sonra ${currentTurn.direction} dönün.`,
                            `Lütfen ${distText} sonra ${currentTurn.direction} yönelin.`,
                            `İlerideki kavşaktan, ${distText} sonra ${currentTurn.direction} dönün.`,
                            `${distText} ileriden ${currentTurn.direction} sapın.`
                        ];
                        let speechText = currentTurn.isSpecial ? 
                            `${distText} sonra ${currentTurn.direction}` : 
                            distVariants[Math.floor(Math.random() * distVariants.length)];
                            
                        setTimeout(() => audio.speak(speechText), 400);
                    }
                }
            } 
            else if (currentTurn.state === "waiting") {
                if (currentTurn.requiredProgress === 0) {
                    // Düz ilerleyin
                    if (currentTime > currentTurn.lastWarningTime + 3000) {
                        currentTurn.state = "completed";
                        this.upcomingTurns.shift();
                    }
                } else {
                    // YENİ: Viraj (Yol Kıvrımı) Fiziği
                    let curveSpeed = 25; // Viraj savurma kuvveti
                    
                    if (currentTurn.direction.includes("sağa")) {
                        this.roadCurvature = -curveSpeed; // Sağa viraj, sola savurur
                    } else if (currentTurn.direction.includes("sola")) {
                        this.roadCurvature = curveSpeed; // Sola viraj, sağa savurur
                    } else if (currentTurn.direction === "U dönüşü yapın") {
                        this.roadCurvature = -curveSpeed * 1.5; 
                    }
                    
                    // Araç hareket ettiği sürece virajı dönmüş (ilerlemiş) sayılır
                    if (this.speed > 5) {
                        currentTurn.currentProgress += (this.speed / 3.6) * deltaTime * 5; // Hıza bağlı ilerleme (Hızlandırıldı)
                    }
                    
                    document.getElementById('nav-feedback').innerText = `Viraj Dönülüyor... %${Math.min(100, Math.floor((currentTurn.currentProgress/currentTurn.requiredProgress)*100))}`;
                    document.getElementById('nav-feedback').style.color = '#eab308';
                    
                    // SESLİ GERİBİLDİRİM: Araç virajı dönerken hızına bağlı olarak 300ms'de bir "tık" sesi çal (kör oyuncuya virajda olduğunu hatırlatır)
                    if (!currentTurn.lastTickTime || currentTime > currentTurn.lastTickTime + 300) {
                        if (this.speed > 5) audio.playTurnTick();
                        currentTurn.lastTickTime = currentTime;
                    }
                    
                    if (currentTurn.currentProgress >= currentTurn.requiredProgress) {
                        audio.speak("Dönüş tamamlandı, şimdi devam edin.");
                        document.getElementById('nav-feedback').innerText = "Dönüş Başarılı!";
                        document.getElementById('nav-feedback').style.color = '#22c55e'; // Green
                        setTimeout(() => {
                            if (document.getElementById('nav-feedback').innerText === "Dönüş Başarılı!") {
                                document.getElementById('nav-feedback').innerText = "";
                            }
                        }, 3000);
                        currentTurn.state = "completed";
                        this.roadCurvature = 0; // Viraj bitti
                        this.upcomingTurns.shift();
                    }
                }
            }
        }

        // --- Pnömatik Fren Sistemi ---
        if (audio.isEngineRunning) {
            // Kompresör havayı doldurur (Eğitim Modu: Hızlı dolum, bekleme yok)
            if (this.airPressure < 120) {
                let prevPressure = this.airPressure;
                this.airPressure += 12 * deltaTime;
                if (this.airPressure >= 120 && prevPressure < 120) {
                    this.airPressure = 120;
                    audio.playAirGovernorCutoff(); // Tahliye valfi çuf-tıss
                }
            }
        }
        // EĞİTİM MODU KORUMASI: Basınç asla kritik seviyeye (85 PSI altına) düşmez, imdat freni kilitlenmez
        this.airPressure = Math.max(85, this.airPressure);
        
        let isBraking = (this.keys.s || this.keys.arrowdown);
        
        // BUG FIX: Çekici üzerindeyken fren yapılamasın
        if (this.isBeingTowed) {
            isBraking = false;
        }
        
        if (isBraking) {
            if (!this.isBrakeKeyDown) {
                // Eğitim Modu: Havalı fren sesi çalar, ceza/tahliye kilitlenmesi yaşanmaz
                this.airPressure = Math.max(85, this.airPressure - 1);
                this.isBrakeKeyDown = true;
                audio.playBrakeRelease(); // Tıss
                
                // Retarder (Motor Freni) Etkisi: 30 km/s'den hızlıysak ve imdat kilitli değilse
                if (this.speed > 30 && !this.isEmergencyBrakeLocked && typeof audio.playRetarder === 'function') {
                    audio.playRetarder(5, this.speed); // 5 saniyelik retarder simülasyonu
                }
            }
            // Gerçek otobüslerde frene basılı tutmak havayı tüketmez, sadece basıp bırakmak tüketir!
        } else {
            if (this.isBrakeKeyDown) {
                this.isBrakeKeyDown = false;
                if (typeof audio.stopRetarder === 'function') {
                    audio.stopRetarder();
                }
            }
        }
        
        // Havanın sıfırın altına düşmesini engelle
        this.airPressure = Math.max(0, this.airPressure);
        
        // Düşük Hava İkazı (60 PSI altı)
        if (this.airPressure < 60) {
            if (!this.isLowAirAlarmActive) {
                this.isLowAirAlarmActive = true;
                audio.startLowAirAlarm();
            }
        } else {
            if (this.isLowAirAlarmActive) {
                this.isLowAirAlarmActive = false;
                audio.stopLowAirAlarm();
            }
        }
        
        // İmdat Freni Kilitlenmesi (30 PSI altı)
        if (this.airPressure < 30) {
            if (!this.isEmergencyBrakeLocked) {
                this.isEmergencyBrakeLocked = true;
                audio.playEmergencyBrakeLock();
                audio.speak("Uyarı! Hava basıncı kritik seviyede. İmdat frenleri kilitlendi.");
            }
        } else if (this.airPressure >= 60.5) { // BUG FIX 9: Hysteresis eklendi (60 yerine 60.5) float sınır döngüsünü engeller
            // Hava basıncı yeterli seviyeye ulaştığında imdatları çöz
            if (this.isEmergencyBrakeLocked) {
                this.isEmergencyBrakeLocked = false;
                audio.playBrakeRelease(); // İmdat çözüldü
                audio.speak("Hava basıncı yeterli seviyeye ulaştı. İmdat frenleri çözüldü.");
            }
        }
        
        // İmdat kilitliyse araba hızlanamaz, gaza basma iptal edilir
        if (this.isEmergencyBrakeLocked) {
            this.keys.w = false;
            this.keys.arrowup = false;
        }
        
        // BUG FIX: Gerçek otobüslerde kapılar açıkken gaza basamazsın (Kapı Fren İnterlok Sistemi)
        // AYRICA: Çekici üzerindeyken gaz verilmesini engelle
        let canAccelerate = true;
        if (this.frontDoorOpen || this.rearDoorOpen) {
            canAccelerate = false;
        }
        if (this.isBeingTowed) {
            canAccelerate = false;
        }
        
        if (!canAccelerate) {
            this.keys.w = false;
            this.keys.arrowup = false;
        }

        // FİZİK MOTORU VE KULLANICI GİRİÅLERİ (ÇEKİCİ MODUNDA KİLİTLENİR)
        if (!this.isBeingTowed) {
            // Motor kapalıysa araç gidemez
            if (!audio.isEngineRunning) {
                this.acceleration = -5; // Sadece sürtünme
            } else {
                // TONAJ (AÄIRLIK) HESAPLAMASI
                const baseWeight = 12000; // Boş otobüs 12 Ton
                const currentWeight = baseWeight + (this.passengersOnBoard * 75); // Her yolcu 75 kg
                const weightMultiplier = baseWeight / currentWeight; // Boşken 1.0, 18 ton iken ~0.66
                
                // Ehliyet seviyesine göre zorluk
                const difficultyMultiplier = 1 + (this.licenseLevel * 0.2);

                if (this.keys.w || this.keys.arrowup) {
                    this.acceleration = (24 * difficultyMultiplier) * weightMultiplier; // Doluyken hantallaşır
                } else if (this.keys.s || this.keys.arrowdown) {
                    this.acceleration = -25 * weightMultiplier; // Doluyken durmak daha zor olur (fren mesafesi uzar)
                    if (this.isEmergencyBrakeLocked) this.acceleration = -80 * weightMultiplier; // İmdatlar kilitliyken süper fren
                } else {
                    this.acceleration = -5 * weightMultiplier; // Sürtünme (Ağır vasıta momentumu korur)
                    if (this.isEmergencyBrakeLocked) this.acceleration = -80 * weightMultiplier; // Zınk diye kilitlenme ivmesi
                }
            }

            // --- Direksiyon ve Doğal Kayma (Drift) Mekaniği ---
            
            let steeringSpeed = 60; // Direksiyon çevirme hızı
            let autoCenterSpeed = 20; // Direksiyonun kendi kendine toplanma hızı
            
            if (this.keys.a || this.keys.arrowleft) {
                this.steeringAngle -= steeringSpeed * deltaTime;
            } else if (this.keys.d || this.keys.arrowright) {
                this.steeringAngle += steeringSpeed * deltaTime;
            } else {
                // Tuşa basılmıyorsa direksiyonu yavaşça merkeze topla
                if (this.steeringAngle > 0) {
                    this.steeringAngle = Math.max(0, this.steeringAngle - autoCenterSpeed * deltaTime);
                } else if (this.steeringAngle < 0) {
                    this.steeringAngle = Math.min(0, this.steeringAngle + autoCenterSpeed * deltaTime);
                }
            }
        }
        
        // Direksiyon açısı sınırları (-30 ile +30 arası)
        this.steeringAngle = Math.max(-30, Math.min(30, this.steeringAngle));
        
        // Rastgele Doğal Kayma Kuvveti (Drift)
        // Rüzgar ve yol eğimi her 2 saniyede bir hafif değişebilir
        if (!this.lastDriftChangeTime || currentTime > this.lastDriftChangeTime + 2000) {
            // -2 ile +2 arasında rastgele bir çekim kuvveti
            this.targetDriftVelocity = (Math.random() - 0.5) * 6;
            this.lastDriftChangeTime = currentTime;
        }
        // driftVelocity'yi yavaşça target'a yaklaştır
        this.driftVelocity += (this.targetDriftVelocity - this.driftVelocity) * 2 * deltaTime;
        
        // Hızla orantılı olarak şerit pozisyonunu güncelle
        let speedFactor = this.speed / 50; // 50 km/h baz alındı
        
        let roadCurvature = this.roadCurvature || 0;
        
        // Görüş kötüyse (far/silecek yok) ve hız limiti aşılmışsa araç kontrolden çıkar
        let visDriftMultiplier = 1;
        if (this.hasPoorVisibility && this.speed > this.maxSpeed + 10) {
            visDriftMultiplier = 3.5; // Kötü görüşte aşırı hız inanılmaz bir savrulma yaratır
        }
        
        let lateralVelocity = (this.steeringAngle + this.driftVelocity * visDriftMultiplier + roadCurvature) * speedFactor;
        
        this.lanePosition += lateralVelocity * deltaTime;

        // --- SAVRULMA (SKIDDING) VE ZORLANMA EFEKTİ ---
        let isSkidding = false;
        let skidIntensity = 0;
        let skidThreshold = 50;
        let angleThreshold = 20;

        if (this.weather === 'rainy') {
            let intensity = this.rainIntensity || 1;
            skidThreshold = 45 - (intensity * 5); // 1->40, 2->35, 3->30, 4->25
            angleThreshold = 20 - (intensity * 2); // 1->18, 2->16, 3->14, 4->12
        } else if (this.weather === 'snowy') {
            skidThreshold = 25; // Karda çok daha erken savrulur
            angleThreshold = 10; // Karda çok az bir direksiyon manevrası bile kaydırır
        }

        if (this.speed > skidThreshold && Math.abs(this.steeringAngle) > angleThreshold && !this.isBeingTowed) {
            isSkidding = true;
            skidIntensity = (Math.abs(this.steeringAngle) - angleThreshold) / 10;
            
            if (this.weather === 'rainy') skidIntensity *= (1.0 + (this.rainIntensity || 1) * 0.25);
            else if (this.weather === 'snowy') skidIntensity *= 2.5; // Karda inanılmaz bir savrulma katsayısı
            
            skidIntensity = Math.min(1.0, skidIntensity);

            // Zorlanma: Savrulurken hız kaybı yaşanır (Fren etkisi)
            let baseSpeedLoss = 12;
            if (this.weather === 'rainy') baseSpeedLoss = 15 + ((this.rainIntensity || 1) * 3);
            else if (this.weather === 'snowy') baseSpeedLoss = 30; // Buzda patinaj ve tutunma kaybı çok fazladır
            
            let speedLoss = baseSpeedLoss * skidIntensity * deltaTime;
            this.speed = Math.max(0, this.speed - speedLoss);

            // Savrulma: Araç dönüş yönünün dışına doğru kontrolsüz kayar
            let baseDrift = 20;
            if (this.weather === 'rainy') baseDrift = 30;
            else if (this.weather === 'snowy') baseDrift = 50;
            
            let skidDrift = (this.steeringAngle > 0 ? 1 : -1) * baseDrift * skidIntensity * deltaTime;
            this.lanePosition += skidDrift;
        }

        // Ses Efekti (Tire Screech)
        if (isSkidding) {
            if (typeof audio.playTireScreech === 'function') audio.playTireScreech(skidIntensity);
        } else {
            if (typeof audio.stopTireScreech === 'function') audio.stopTireScreech();
        }

        // FİZİK ETKİLERİ: Toprak yolda veya yağmur/karda ivmelenme zorlaşır, maksimum hız değişir
        let currentMaxSpeed = this.maxSpeed;
        let currentAcceleration = this.acceleration;
        
        if (audio.currentTerrain === "toprak") {
            currentMaxSpeed = 50; // Toprak yolda en fazla 50km/s
            if (currentAcceleration > 0) currentAcceleration *= 0.6; // İvmelenme %40 azalır
        } else if (audio.currentTerrain === "otoyol") {
            currentMaxSpeed = 130; // Otoyolda 130 km/s'e kadar çıkılabilir
        }
        
        // HAVA DURUMU CEZALARI
        if (this.weather === 'rainy') {
            if (currentAcceleration > 0) currentAcceleration *= 0.8;
            this.driftVelocity += (this.targetDriftVelocity * 0.5) * deltaTime;
        } else if (this.weather === 'snowy') {
            currentMaxSpeed = Math.min(currentMaxSpeed, 70); // Karda maksimum hız çok kısıtlanır
            if (currentAcceleration > 0) currentAcceleration *= 0.4; // Karda kalkış çok zordur (patinaj)
            this.driftVelocity += (this.targetDriftVelocity * 1.5) * deltaTime; // Karda sürekli yalpalar
        }

        this.speed += currentAcceleration * deltaTime;
        if (this.speed > currentMaxSpeed && this.acceleration > 0) {
            this.speed -= 10 * deltaTime; // Yavaşça limite çek
        }
        if (this.speed < 0) {
            this.speed = 0;
        }
        
        // BUG FIX: Otomatik Retarder Kapatma (Hız 10'un altına düşerse motor freni devreden çıkar)
        if (this.speed < 10 && this.isBrakeKeyDown && typeof audio.stopRetarder === 'function') {
            audio.stopRetarder();
        }

        // RPM VE VİTES MANTIÄI
        let isThrottleOn = this.keys.w;
        let targetRPM = 800;
        const gearSpeedRatios = [0, 25, 45, 65, 90, 130]; 

        if (this.speed > 0 || isThrottleOn) {
            let currentMinSpeed = gearSpeedRatios[this.currentGear - 1];
            let currentMaxSpeed = gearSpeedRatios[this.currentGear];
            
            let speedInGear = this.speed - currentMinSpeed;
            let gearRange = currentMaxSpeed - currentMinSpeed;
            
            let speedRatio = Math.max(0, Math.min(1, speedInGear / gearRange));
            targetRPM = 1000 + (speedRatio * 1500); // 1000 ile 2500 arası
            
            if (isThrottleOn) {
                targetRPM += 300; // Gaza basıldığında devir şişer
            }
        }
        
        // RPM yumuşak geçiş
        this.engineRPM += (targetRPM - this.engineRPM) * 3 * deltaTime;
        
        // Vites Atma (Yukarı)
        if (this.engineRPM > 2400 && this.currentGear < 5 && this.speed > gearSpeedRatios[this.currentGear] * 0.9) {
            this.currentGear++;
            this.engineRPM = 1500; // Vites atınca devir düşer
        }
        // Vites Düşürme (Aşağı)
        else if (this.currentGear > 1 && this.speed < gearSpeedRatios[this.currentGear - 1] + 5) {
            this.currentGear--;
            this.engineRPM = 2200; // Vites küçülünce devir artar
        }

        audio.updateEngineSound(this.speed, this.engineRPM, this.currentGear);
        if (typeof audio.updateTireNoise === 'function') audio.updateTireNoise(this.speed, this.currentRoadType);
        if (typeof audio.updateWeatherSound === 'function') audio.updateWeatherSound(this.speed, this.weather);

        document.getElementById('hud-speed').innerText = Math.floor(this.speed);
        if (typeof AkilliSistem !== 'undefined' && AkilliSistem.onCoPilotUpdate) {
            AkilliSistem.onCoPilotUpdate(this);
        }

        // Motor Panning (Aracın yalpalamasına göre motor sesinin sağ/sol hoparlöre kayması)
        if (typeof audio.updateBusPosition === 'function') {
            audio.updateBusPosition(this.lanePosition);
        }

        // Yol kenarına sürtünme engeli (Ölüm sistemi kaldırıldı)
        if (this.lanePosition <= 15 || this.lanePosition >= 85) {
            this.speed = Math.max(0, this.speed - (15 * deltaTime)); // Kare hızından bağımsız (zaman tabanlı) sürtünme
            this.lanePosition = Math.max(15, Math.min(85, this.lanePosition)); // Yolda tut
        }

        if (this.speed > 0) {
            // GERÇEKÇİ OYUN ÖLÇEÄİ: 1 gerçek kilometre = Oyun içinde 250 metre sürüş süresi (4 kat hızlı)
            // PROFESYONEL AKUSTİK: DURACAK ZİLİ VE KOKPİT İKAZ LAMBASI (220m kala)
            if (this.currentDistanceToNext <= 220 && !this.stopRequestBellTriggered && this.speed > 8) {
                const isFinalStop = this.activeRouteData && this.activeRouteData.stops && (this.currentStopIndex === this.activeRouteData.stops.length - 1);
                const remainingStops = this.activeRouteData && this.activeRouteData.stops ? Math.max(1, this.activeRouteData.stops.length - this.currentStopIndex - 1) : 1;
                const alighting = isFinalStop ? this.passengersOnBoard : Math.min(this.passengersOnBoard, Math.max(1, Math.round(this.passengersOnBoard / (remainingStops + 1))));
                
                if (alighting > 0 || (this.passengersOnBoard > 0 && this.currentStopIndex > 0)) {
                    this.stopRequestBellTriggered = true;
                    if (typeof audio !== 'undefined' && typeof audio.playStopRequestBell === 'function') {
                        audio.playStopRequestBell();
                    }
                    
                    const lamp = document.getElementById('hud-stop-request');
                    if (lamp) lamp.style.display = 'inline-block';
                    
                    const bellMsg = "Duracak zili çaldı. Gelecek durakta inecek yolcu var.";
                    if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(bellMsg);
                    if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(bellMsg);
                }
            }

            if (this.currentDistanceToNext <= 120 && !this.stopApproachAnnounced && this.speed > 5) {
                audio.speak("Durağa yaklaşıyorsunuz");
                this.stopApproachAnnounced = true;
            }
            const distanceScale = 4;
            const distanceCovered = (this.speed / 3.6) * deltaTime * distanceScale; 
            this.currentDistanceToNext -= distanceCovered;
            this.totalDistanceCovered += distanceCovered; // 3D Ses uzayı için ilerleme kaydı
            
            if (this.currentDistanceToNext <= 0) {
                // BUG FIX: Çekici sanayiye götürürken normal durak mantığı çalışmamalı!
                if (this.isBeingTowed) {
                    this.isBeingTowed = false;
                    this.isDriving = false;
                    this.speed = 0;
                    this.acceleration = 0;
                    this.steeringAngle = 0;
                    
                    // MOTORU SUSTUR VE PARK ET
                    if (typeof audio.stopEngine === 'function') audio.stopEngine();
                    
                    if (typeof audio.speak === 'function') audio.speak("Sanayiye yavaşça park ettik. Motor kapatıldı. Geçmiş olsun usta.");
                    document.getElementById('nav-feedback').innerText = "TEKİRDAÄ SANAYİ - VARIÅ";
                    document.getElementById('hud-speed').innerText = `Hız: 0 km/s`;
                    
                    // Sanayi moduna geç
                    if (typeof SanayiMechanic !== 'undefined') SanayiMechanic.start();
                    return;
                } else {
                    this.arriveAtStop();
                    return;
                }
            }
            if (this.currentDistanceToNext >= 1000) {
                document.getElementById('hud-distance').innerText = (this.currentDistanceToNext / 1000).toFixed(1) + " km";
            } else {
                document.getElementById('hud-distance').innerText = Math.floor(this.currentDistanceToNext) + " m";
            }
            
            // ETA (Tahmini Varış Süresi) Hesaplama
            if (this.speed < 5) {
                document.getElementById('hud-eta').innerText = "--:--";
            } else {
                let timeInHours = (this.currentDistanceToNext / 1000) / this.speed;
                let timeInSeconds = Math.floor(timeInHours * 3600);
                let mins = Math.floor(timeInSeconds / 60);
                let secs = timeInSeconds % 60;
                document.getElementById('hud-eta').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }

        // DAKİKLİK VE ZAMANLAMA SAPMASI HESABI (DELTA ZAMANI)
        if (this.isDriving && this.activeRouteData && this.activeRouteData.stops && this.activeRouteData.stops[this.currentStopIndex]) {
            const schedTime = this.activeRouteData.stops[this.currentStopIndex].scheduledMinutes;
            if (schedTime) {
                const delta = this.clockMinutes - schedTime;
                const timingEl = document.getElementById('hud-timing-val');
                if (timingEl) {
                    if (Math.abs(delta) <= 1.0) {
                        timingEl.innerText = "Vaktinde (0 Dk)";
                        timingEl.style.color = "#4ade80";
                    } else if (delta < -1.0) {
                        const earlyMins = Math.abs(Math.round(delta));
                        timingEl.innerText = `-${earlyMins} Dk (Erken)`;
                        timingEl.style.color = "#38bdf8";
                    } else {
                        const lateMins = Math.round(delta);
                        timingEl.innerText = `+${lateMins} Dk (Rötar)`;
                        timingEl.style.color = "#facc15";
                    }
                }
            }
        }

        // YOLCU KONFOR ENDEKSİ (PCI) - EĞİTİM VE HOŞGÖRÜ SİSTEMİ
        // Rampa açıkken hareket engeli (Güvenlik Kilidi)
        if (this.isRampDeployed && (this.keys.w || this.keys.arrowup)) {
            this.speed = 0;
            this.acceleration = 0;
            const now = performance.now();
            if (!this.lastRampWarnTime || now - this.lastRampWarnTime > 5000) {
                this.lastRampWarnTime = now;
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Rampa açıkken hareket edilemez. U tuşuyla rampayı kapatınız.");
                }
            }
        }

        if (this.isDriving && deltaTime > 0) {
            const decel = (this.lastRecordedSpeed - this.speed) / deltaTime;
            // Eğitim aşamasında sert fren yapılsa dahi ceza verilmez; taban %90 altına inmez
            if (decel > 30 && this.speed > 30) {
                this.passengerComfort = Math.max(90, this.passengerComfort - 0.5);
                
                const now = performance.now();
                if (!this.lastHarshBrakeWarningTime || now - this.lastHarshBrakeWarningTime > 8000) {
                    this.lastHarshBrakeWarningTime = now;
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(`Eğitim İpucu: Kademeli frenleme daha konforludur (Konfor: %${Math.round(this.passengerComfort)})`, 'info');
                    }
                }
            } else {
                // Konfor hızlı ve cömert biçimde %100'e toparlanır
                this.passengerComfort = Math.min(100, this.passengerComfort + (deltaTime * 2.5));
            }
            
            const comfortEl = document.getElementById('hud-comfort-val');
            if (comfortEl) {
                const cVal = Math.round(this.passengerComfort);
                comfortEl.innerText = `%${cVal}`;
                comfortEl.style.color = '#4ade80'; // Daima pozitif yeşil
            }
        }
        this.lastRecordedSpeed = this.speed;
            
        // Arkadan Çarpma (Rear-end collision) Mantığı
        if (this.speed > 50 && this.acceleration < -100) {
            if (currentTime - this.lastRearHitTime > 5000 && Math.random() < 0.02) {
                this.lastRearHitTime = currentTime;
                this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 20); // Tek seferde kopmaz, %20 hasar alır
                this.busDamage.health = Math.max(0, this.busDamage.health - 10);
                if (typeof audio.playRearCrash === 'function') audio.playRearCrash();
                if (typeof audio.speak === 'function') audio.speak("Arkadan çarptılar! Egzoz hasar aldı.");
            }
        }
        
        // Kasis Mantığı (Speed Bump) - Gerçek Kasisler + Nadir Sürpriz Kasisler
        if (this.kasisDistance === null && this.totalDistanceCovered > 500) {
            let foundRealBump = false;
            
            // 1. Gerçek Kasis Kontrolü (Haritadan gelen routeBumps)
            if (this.routeBumps && this.routeBumps.length > 0) {
                let nextBumpIndex = this.routeBumps.findIndex(b => !b.passed && b.distance - this.totalDistanceCovered > 0 && b.distance - this.totalDistanceCovered < 350);
                if (nextBumpIndex !== -1) {
                    this.routeBumps[nextBumpIndex].passed = true;
                    this.kasisDistance = 300;
                    foundRealBump = true;
                    if (typeof audio.speak === 'function') audio.speak("300 metre ileride gerçek kasis var, hızınızı otuzun altına düşürün.");
                }
            }
            
            // BUG FIX 5: Sürpriz Kasis Spam Hatası (Cooldown/Mesafe Kilidi Eklendi)
            if (!this.lastRandomKasisDistance) this.lastRandomKasisDistance = 0;
            // Deterministik Kasis Formülü: Şehir içi güzergahlarda her 2200 metrede bir kasis uyarısı
            if (!foundRealBump && (this.totalDistanceCovered - this.lastRandomKasisDistance >= 2200)) {
                this.lastRandomKasisDistance = this.totalDistanceCovered; // En az 1 km sonra tekrar çıkabilir
                this.kasisDistance = 300; // 300 metre ileride kasis
                if (typeof audio.speak === 'function') audio.speak("300 metre ileride kasis var, hızınızı otuzun altına düşürün.");
            }
        }
        
        if (this.kasisDistance !== null) {
            let traveled = (this.speed / 3.6) * deltaTime; // metre cinsinden alınan yol
            this.kasisDistance -= traveled;
            
            if (this.kasisDistance <= 0) {
                // Kasisten geçiş anı
                if (this.speed > 45) { // 45 km/h kasis hız limiti
                    // Hız aşımına bağlı deterministik hasar formülü
                    const excess = this.speed - 45;
                    this.busDamage.health = Math.max(0, this.busDamage.health - Math.round(excess * 0.35));
                    if (typeof audio.playUnderbodyHit === 'function') audio.playUnderbodyHit();
                    
                    if (excess >= 25) { // 70 km/h ve üzeri: Ağır darbe
                        this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 50);
                        if (typeof audio.speak === 'function') audio.speak("Kasise aşırı hızlı girdik, altını çok sert vurduk ve egzoz ağır hasar aldı!");
                    } else if (excess >= 10) { // 55 - 70 km/h arası: Orta darbe
                        this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 25);
                        if (typeof audio.speak === 'function') audio.speak("Kasise hızlı girdik, altını vurduk. Egzoz hasar aldı.");
                    } else { // 45 - 55 km/h arası: Hafif sıyrık
                        if (typeof audio.speak === 'function') audio.speak("Kasisten biraz hızlı geçtik, altı hafif sürttü ama egzoz sağlam kurtuldu.");
                    }
                } else {
                    // Güvenli geçiş sesi (Hafif zıplama)
                }
                this.kasisDistance = null; // Kasis geçildi
            }
        }
        
        // Egzoz Koptuysa Sürtünme ve Motor Sesi Kontrolü
        if (this.busDamage.exhaust >= 100) {
            if (typeof audio.stopExhaustWarning === 'function') audio.stopExhaustWarning();
            if (typeof audio.isExhaustBroken !== 'undefined') audio.isExhaustBroken = true;
            if (this.speed > 0) {
                if (typeof audio.startExhaustDrag === 'function') audio.startExhaustDrag();
                if (typeof audio.updateExhaustDrag === 'function') audio.updateExhaustDrag(this.speed);
            } else {
                if (typeof audio.stopExhaustDrag === 'function') audio.stopExhaustDrag();
            }
        } else if (this.busDamage.exhaust >= 50 && this.busDamage.exhaust < 100) {
            // ERKEN UYARI (Hafif tıslama/ıslık sesi)
            if (typeof audio.isExhaustBroken !== 'undefined') audio.isExhaustBroken = false;
            if (typeof audio.stopExhaustDrag === 'function') audio.stopExhaustDrag();
            
            if (this.speed > 0) {
                if (typeof audio.startExhaustWarning === 'function') audio.startExhaustWarning();
                if (typeof audio.updateExhaustWarning === 'function') audio.updateExhaustWarning(this.speed);
            } else {
                if (typeof audio.stopExhaustWarning === 'function') audio.stopExhaustWarning();
            }
        } else {
            if (typeof audio.stopExhaustWarning === 'function') audio.stopExhaustWarning();
            if (typeof audio.stopExhaustDrag === 'function') audio.stopExhaustDrag();
            if (typeof audio.isExhaustBroken !== 'undefined') audio.isExhaustBroken = false;
        }

        // KLİMA VE SICAKLIK FİZİÄİ
        // ==========================================
        
        // BUG FIX 7: Cam açıkken veya kırıksa klimanın etkisi iptal olur (Termodinamik Fix)
        let isAnyWindowOpen = (typeof audio.isWindowOpen !== 'undefined' && audio.isWindowOpen) || 
                              this.busDamage.leftWindow >= 100 || 
                              this.busDamage.rightWindow >= 100;
                              
        let targetTemp = this.temperature; // Dışarıdaki hava
        if (this.isACOn && !isAnyWindowOpen) {
            targetTemp = 22; // Ancak camlar kapalıysa ve klima açıksa 22 dereceyi hedefler
        }
        
        if (this.busTemperature < targetTemp) {
            this.busTemperature += deltaTime * 0.1; // Saniyede 0.1 derece ısınır
            if (this.busTemperature > targetTemp) this.busTemperature = targetTemp;
        } else if (this.busTemperature > targetTemp) {
            this.busTemperature -= deltaTime * 0.1; // Saniyede 0.1 derece soğur
            if (this.busTemperature < targetTemp) this.busTemperature = targetTemp;
        }
        
        if (document.getElementById('hud-temp')) {
            document.getElementById('hud-temp').innerText = `${Math.floor(this.busTemperature)}°C ${this.isACOn && !isAnyWindowOpen ? '(AC)' : ''}`;
        }

        // Yolcu Sıcaklık Tepkileri (Tolerans Sistemi)
        if (this.passengersOnBoard > 0) {
            let comfortRange = this.isACOn ? 4 : 2; // Klima açıksa tolerans daha yüksek
            if (this.busTemperature > (22 + comfortRange) || this.busTemperature < (22 - comfortRange)) {
                this.passengerAngerTimer += deltaTime;
                if (this.passengerAngerTimer > 30) { // 30 saniye boyunca şikayetçi oldular
                    this.passengerAngerTimer = 0; // Sayacı sıfırla, tekrar şikayet etmeleri için zaman ver
                    
                    if (this.busTemperature > (22 + comfortRange)) {
                        const complaints = [
                            '"Åoför bey yandık, klimayı açar mısın?"',
                            '"İçerisi hamam gibi oldu, nefes alamıyoruz!"',
                            '"Çok sıcak, pişiyoruz burada!"'
                        ];
                        document.getElementById('passenger-dialog').innerText = complaints[Math.floor(Math.random() * complaints.length)];
                        document.getElementById('passenger-feedback').innerText = "Yolcular sıcaktan rahatsız oldu.";
                        document.getElementById('passenger-feedback').style.color = '#ef4444';
                        // Sicaklik sikayet konusmasi kaldirildi
                    } else if (this.busTemperature < (22 - comfortRange)) {
                        const complaints = [
                            '"Burası buz gibi oldu, donduracaksın bizi!"',
                            '"Åoför bey üşüyoruz, ısıtıcıyı açar mısın?"',
                            '"Çok soğuk, hasta olacağız!"'
                        ];
                        document.getElementById('passenger-dialog').innerText = complaints[Math.floor(Math.random() * complaints.length)];
                        document.getElementById('passenger-feedback').innerText = "Yolcular soğuktan rahatsız oldu.";
                        document.getElementById('passenger-feedback').style.color = '#ef4444';
                        // Sogukluk sikayet konusmasi kaldirildi
                    }
                }
            } else {
                // Sıcaklık idealse yolcular sakinleşir
                if (this.passengerAngerTimer > 0) {
                    this.passengerAngerTimer -= deltaTime * 2; // Hızlıca sakinleşirler
                    if (this.passengerAngerTimer < 0) this.passengerAngerTimer = 0;
                }
            }
        }
        
        // Yayalar (NPC) - Sürekli devrede (Çekicideyken DE çalışır, trafik akar)
        this.spawnAndMoveNPCs(deltaTime);

        // Yağmurlu/Karlı havada camda su damlaları veya kar efekti (Silecek mantığı)
        if (this.weather === 'rainy' || this.weather === 'snowy') {
            if (audio.isWiperOn) {
                document.getElementById('weather-overlay').style.opacity = '0';
            } else {
                // Silecek kapalıysa cam yavaş yavaş kapanır
                let currentOpacity = parseFloat(document.getElementById('weather-overlay').style.opacity || 0);
                document.getElementById('weather-overlay').style.opacity = Math.min(0.8, currentOpacity + deltaTime * 0.05).toString();
            }
        } else {
            document.getElementById('weather-overlay').style.opacity = '0';
        }
        
        this.updateBusVisuals();
        
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    },

    spawnAndMoveNPCs: function(deltaTime) {
        // YÜZDELİK İHTİMALLER KALDIRILDI - FORMÜLE BAĞLI TRAFİK DALGABOYU MİMARİSİ
        
        // 1. ZAMANA BAĞLI TRAFİK YOĞUNLUK KATSAYISI FORMÜLÜ (Rush-Hour Density Factor)
        const hour = (this.clockMinutes || 720) / 60;
        // Sabah zirvesi (07:30 - 09:30) ve akşam zirvesi (17:00 - 19:30) yoğunluk artışı
        const morningRush = Math.max(0, 1 - Math.abs(hour - 8.2) / 1.5) * 0.8;
        const eveningRush = Math.max(0, 1 - Math.abs(hour - 18.2) / 1.5) * 0.9;
        const baseDensity = (hour >= 6 && hour <= 23) ? 0.7 : 0.25; // Gece sakin, gündüz canlı
        const trafficDensity = baseDensity + morningRush + eveningRush; // 0.25 ile 2.1 arası deterministik katsayı
        
        // 2. KAT EDİLMESİ GEREKEN HEDEF DALGABOYU / MESAFE FORMÜLÜ (Wavelength in meters)
        // Yoğun saatte her ~220 metrede bir araç; gece sakinliğinde her ~750 metrede bir araç
        const spawnIntervalDistance = Math.round(450 / trafficDensity);
        const distanceSinceLastSpawn = (this.totalDistanceCovered || 0) - (this.lastNPCSpawnDistance || 0);

        // Şart: Hızımız en az 15 km/h, yolda aktif araç yok ve gereken yol kat edilmiş
        if (this.speed >= 15 && this.activeNPCs.length === 0 && distanceSinceLastSpawn >= spawnIntervalDistance) {
            this.lastNPCSpawnDistance = this.totalDistanceCovered;
            this.npcVehicleIndex = (this.npcVehicleIndex || 0) + 1;
            
            // 3. DETERMINİSTİK 10'LUK TRAFİK DÖNGÜSÜ (Sıfır İhtimal, Sabit Matematiksel Sıra)
            const cycle = this.npcVehicleIndex % 10;
            let npcType = 'oncoming';
            let startX = 22;
            let startY = 650;
            let baseSpeed = 55;

            if (cycle === 3) {
                // Önümüzde Aynı Yönde Seyreden Yavaş Araç (Kamyonet/Taksi)
                npcType = 'ahead';
                startX = 64; // Sağ seyir şeridi
                startY = 400;
                baseSpeed = 42; // Otobüsten yavaş (arkadan yetişebiliriz)
            } else if (cycle === 6) {
                // Bizi Sollayan Hızlı Araç
                npcType = 'overtaking';
                startX = 28; // Sol sollama şeridi
                startY = -350; // Arkamızda doğar
                baseSpeed = this.speed + 35; // Bizim hızımızdan daima 35 km/h hızlı
            } else if (cycle === 9) {
                // Hatalı Sollama Yapan Karşı Araç (Erken sesli ikaz ve kornalı refleks senaryosu)
                npcType = 'hazard';
                startX = 48; // Orta şeride taşmış
                startY = 680;
                baseSpeed = 60;
            } else {
                // Normal Karşı Şerit Trafiği (Sol şerit: x = 21.0 - 24.0)
                npcType = 'oncoming';
                startX = 21.0 + (cycle % 3) * 1.5; // Sol şeridin içinde düzenli konum
                startY = 650;
                baseSpeed = 50 + (cycle * 3); // 50, 53, 56, 62, 65, 71, 74 km/h
            }

            // Başlangıç pan değeri mesafeye göre dar bir açıyla başlar
            let dx = startX - this.lanePosition;
            let initialAngle = Math.min(1.0, 50 / (Math.abs(startY) * 0.4 + 30));
            let initialPan = (dx / 30) * initialAngle;
            initialPan = Math.max(-1, Math.min(1, initialPan));

            let audioObj = audio.playNPCSound(initialPan);
            if (audioObj) {
                this.activeNPCs.push({
                    type: npcType,
                    x: startX,
                    y: startY,
                    baseSpeed: baseSpeed,
                    audioObj: audioObj,
                    hasCollided: false,
                    warned: false,
                    horned: false
                });
            }
        }

        for (let i = this.activeNPCs.length - 1; i >= 0; i--) {
            let npc = this.activeNPCs[i];
            
            if (npc.hasCollided) {
                if (npc.slideX) {
                    npc.x += npc.slideX * deltaTime * 2;
                    npc.slideX *= 0.95;
                }
                if (npc.slideY) {
                    npc.y += npc.slideY * deltaTime * 2;
                    npc.slideY *= 0.95;
                }
                npc.y -= this.speed * deltaTime * 1.5;
            } else {
                // Trafik türüne göre deterministik bağıl hız
                if (npc.type === 'oncoming' || npc.type === 'hazard') {
                    npc.y -= (this.speed + npc.baseSpeed) * deltaTime * 1.5;
                } else if (npc.type === 'ahead') {
                    npc.y -= (this.speed - npc.baseSpeed) * deltaTime * 1.5;
                } else if (npc.type === 'overtaking') {
                    npc.y += (npc.baseSpeed - this.speed) * deltaTime * 1.5;
                }
            }

            // --- TEHLİKE VE ERKEN SESLİ UYARILAR ---
            if (!npc.hasCollided) {
                if (npc.type === 'hazard' && npc.y < 350 && npc.y > 100 && !npc.warned) {
                    npc.warned = true;
                    if (audio.playNPCHorn) audio.playNPCHorn((npc.x - this.lanePosition) / 30);
                    if (typeof audio.speak === 'function') {
                        audio.speak("Dikkat! Karşıdan hatalı sollama yapan araç geliyor, sağ şeride yanaşın!");
                    }
                }
                if (npc.type === 'ahead' && npc.y < 120 && npc.y > 40 && !npc.warned && Math.abs(npc.x - this.lanePosition) < 22) {
                    npc.warned = true;
                    if (typeof audio.speak === 'function') {
                        audio.speak("Önünüzde yavaş seyreden araç var, sollayabilirsiniz.");
                    }
                }
            }

            // --- MÜKEMMEL 3D SPATIAL AUDIO FORMÜLÜ ---
            let apparentX = npc.x;
            if (this.roadCurvature) {
                let curveOffset = (this.roadCurvature || 0) * (Math.min(600, Math.max(0, Math.abs(npc.y))) / 600) * 0.25;
                apparentX -= curveOffset;
            }

            // 1. Dinamik Stereo Panning (Mesafe açısına göre kademeli açılır!)
            let dx = apparentX - this.lanePosition;
            let angleSpread = Math.min(1.0, 50 / (Math.abs(npc.y) * 0.4 + 25));
            let currentPan = (dx / 30) * angleSpread;
            currentPan = Math.max(-1, Math.min(1, currentPan));

            // 2. Kademeli Ses Seviyesi Formülü (Uzaklaşırken YAVAŞ YAVAŞ sönümlenir)
            let vol = 0;
            if (npc.y >= 0) {
                vol = 1 - (npc.y / 650);
            } else {
                vol = 1 - (Math.abs(npc.y) / 500);
            }
            vol = Math.max(0, Math.min(1, vol));

            // 3. Doppler Pitch Formülü: Hız ve yöne bağlı frekans kayması
            let dopplerRate = (npc.y >= 0) ? (1.04 + Math.min(0.08, this.speed / 200)) : (0.92 - Math.min(0.06, this.speed / 200));

            if (npc.audioObj && npc.audioObj.howlObj) {
                npc.audioObj.howlObj.stereo(currentPan, npc.audioObj.soundId);
                npc.audioObj.howlObj.volume(vol, npc.audioObj.soundId);
                npc.audioObj.howlObj.rate(dopplerRate, npc.audioObj.soundId);
            }

            // --- ÇARPIŞMA VE FİZİKSEL HASAR (KİNETİK ENERJİ FORMÜLÜ) ---
            if (!npc.hasCollided && Math.abs(npc.y) <= 12) {
                if (!this.isBeingTowed && this.speed >= 15 && Math.abs(npc.x - this.lanePosition) < 20) {
                    npc.hasCollided = true;
                    
                    npc.baseSpeed = 0;
                    npc.slideX = (this.lanePosition > 50) ? -80 : 80;
                    npc.slideY = this.speed * 1.5;
                    if (typeof audio !== 'undefined' && typeof audio.playTireScreech === 'function') {
                        audio.playTireScreech(1.0);
                        setTimeout(() => audio.stopTireScreech(), 1500);
                    }
                    
                    // KİNETİK ENERJİ HASAR FORMÜLÜ: Hasar = v^2 / 110 (Rastgelelik sıfırlandı)
                    let damageAmount = Math.max(5, Math.min(100, Math.round(Math.pow(this.speed, 2) / 110)));
                    
                    let oldHealth = this.busDamage.health;
                    this.busDamage.health -= damageAmount;
                    this.busDamage.health = Math.max(0, this.busDamage.health);
                    
                    // Şeride göre bölgesel hasar ve uyarılar
                    if (npc.x === 20) {
                        let outcome = this.calculateCrashOutcome(damageAmount);
                        if (outcome === 2) {
                            this.busDamage.leftWindow = 100;
                            audio.speak("Sol cama çarptık! Sol cam tamamen kırıldı, yüzde yüz hasarlı.");
                        } else if (outcome === 1) {
                            this.busDamage.leftWindow = Math.max(this.busDamage.leftWindow, 50);
                            audio.speak("Sol cama çarptık! Sol cam çatladı, yüzde elli hasarlı.");
                        } else {
                            audio.speak("Sol taraftan çarptık! Şanslıyız, cam kırılmadı.");
                        }
                    } else if (npc.x === 80) {
                        let outcome = this.calculateCrashOutcome(damageAmount);
                        if (outcome === 2) {
                            this.busDamage.rightWindow = 100;
                            audio.speak("Sağ cama çarptık! Sağ cam tamamen kırıldı, yüzde yüz hasarlı.");
                        } else if (outcome === 1) {
                            this.busDamage.rightWindow = Math.max(this.busDamage.rightWindow, 50);
                            audio.speak("Sağ cama çarptık! Sağ cam çatladı, yüzde elli hasarlı.");
                        } else {
                            audio.speak("Sağ taraftan çarptık! Şanslıyız, cam kırılmadı.");
                        }
                    } else {
                        audio.speak(`Önden çarpıştık! Kaporta ${damageAmount} puan hasar aldı!`);
                        this.busDamage.front = Math.min(100, this.busDamage.front + damageAmount);
                        
                        let hlOutcome = this.calculateCrashOutcome(damageAmount);
                        if (hlOutcome === 2) {
                            this.busDamage.headlights = 100;
                            if (this.isHeadlightsOn) {
                                this.isHeadlightsOn = false;
                                if (typeof audio.playHeadlightBust === 'function') audio.playHeadlightBust();
                            }
                            setTimeout(() => audio.speak("Ön farlar tamamen kırıldı, yüzde yüz hasarlı! Görüş tehlikede!"), 1500);
                        } else if (hlOutcome === 1) {
                            this.busDamage.headlights = Math.max(this.busDamage.headlights, 50);
                            setTimeout(() => audio.speak("Ön farlar yüzde elli hasar aldı, bağlantıları gevşedi."), 1500);
                        }
                        
                        let wpOutcome = this.calculateCrashOutcome(damageAmount);
                        if (wpOutcome === 2) {
                            this.busDamage.wipers = 100;
                            if (typeof audio.isWiperOn !== 'undefined' && audio.isWiperOn) {
                                if (typeof audio.toggleWipers === 'function') audio.toggleWipers();
                            }
                            setTimeout(() => audio.speak("Silecek motoru tamamen kırıldı, yüzde yüz hasarlı! Cam temizlenemeyecek!"), 3000);
                        } else if (wpOutcome === 1) {
                            this.busDamage.wipers = Math.max(this.busDamage.wipers, 50);
                            setTimeout(() => audio.speak("Silecekler yüzde elli hasar aldı, zorlanarak çalışıyor."), 3000);
                        }
                    }
                    
                    if (oldHealth >= 50 && this.busDamage.health < 50 && this.busDamage.health >= 25) {
                        setTimeout(() => audio.speak("Kritik Uyarı! Aracın sağlığı yüzde ellinin altına düştü."), 2500);
                    } else if (oldHealth >= 25 && this.busDamage.health < 25 && this.busDamage.health >= 20) {
                        setTimeout(() => audio.speak("Kritik Uyarı! Aracın sağlığı yüzde yirmi beşin altına düştü. Hasar kritik seviyede!"), 2500);
                    }
                    
                    audio.updateAcoustics(this.busDamage.leftWindow, this.busDamage.rightWindow);
                    this.speed = 0;
                    audio.playCrash();
                    
                    if (this.busDamage.health < 20) {
                        this.triggerTowTruck();
                    } else {
                        this.showWarning("KAZA YAPTINIZ! Araç hasar aldı.");
                    }
                }
            } 
            
            // Araç arkamızda tamamen uzaklaşıp sesi sönümlendiğinde (veya önde çok uzaklaştığında) sil
            if (npc.y < -520 || npc.y > 850 || (Math.abs(npc.y) > 150 && vol <= 0.01)) {
                if (npc.audioObj) npc.audioObj.stop();
                this.activeNPCs.splice(i, 1);
            }
        }
    },

    triggerTowTruck: function() {
        if (!this.isDriving && !this.animationFrameId) return; // BUG FIX: Aynı saniyede birden fazla kaza olursa (çift NPC'ye çarpma vs.) paralel evren (çift gameLoop) oluşmasını engeller
        this.isDriving = false; // Oyunu geçici durdur
        cancelAnimationFrame(this.animationFrameId); // BUG FIX: Frame döngüsünü tamamen iptal et
        this.animationFrameId = null; // Guard için sıfırla
        
        audio.stopEngine();
        if (typeof audio.stopLowAirAlarm === 'function') audio.stopLowAirAlarm();
        
        // BUG FIX: Kaza anında hava durumu efektlerini ve silecekleri kapat
        if (typeof audio.stopWeather === 'function') audio.stopWeather();
        if (audio.isWiperOn) audio.toggleWipers();
        
        // BUG FIX: Çekiciye binerken eski engelleri ve NPC'leri temizle
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }
        this.obstacles = [];
        this.activeNPCs.forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
        this.activeNPCs = [];
        
        document.getElementById('nav-feedback').innerText = "ARAÇ PERT OLDU! ÇEKİCİ BEKLENİYOR...";
        document.getElementById('nav-feedback').style.color = '#ef4444';
        
        this.showWarning("ARAÇ PERT OLDU! ÇEKİCİ ÇAÄRILIYOR.");
        audio.speak("Aracınız çok ağır hasar aldı ve yola devam edemezsiniz. Çekici çağrılıyor, lütfen bekleyin. Sizi sanayiye götürüyoruz.");
        
        // Kaza anını kaydet (Kaldığımız yerden devam etmek için)
        this.savedState = {
            routeData: JSON.parse(JSON.stringify(this.activeRouteData)),
            stopIndex: this.currentStopIndex,
            distance: this.currentDistanceToNext,
            roadType: this.currentRoadType
        };
        
        // 5 Saniye sonra çekici ile yola çık
            // 5 Saniye sonra çekici ile yola çık
        setTimeout(() => {
            this.activeRouteData = {
                hatNo: "ÇEKİCİ",
                guzergah: "Kaza Yeri -> Tekirdağ Sanayi",
                stops: [
                    { ad: "Tekirdağ Sanayi", id: "sanayi", anons: "Tekirdağ Sanayisine hoşgeldiniz.", gercekMesafeSonraki: 5 }
                ]
            };
            this.currentStopIndex = 0;
            this.currentDistanceToNext = 5000; // 5 km sürecek
            this.currentRoadType = "Asfalt Cadde";
            
            // Çekici üzerindeyken bir daha ölmemek için canı fulle
            this.busDamage.health = 100; 
            
            // BUG FIX: Direksiyonu ve şerit pozisyonunu merkeze al ki çekici başlar başlamaz yoldan çıkma (sonsuz kaza döngüsü) yaşanmasın!
            this.lanePosition = 50;
            this.steeringAngle = 0;
            
            audio.speak("Aracınız çekiciye yüklendi. Tekirdağ Sanayi'ye doğru otomatik olarak yola çıkıldı.");
            audio.startEngine(); // BUG FIX: Çekiciye bindiğimizde de motor sesini aç
            
            // Otomatik sürüşü başlat
            this.isBeingTowed = true;
            this.isDriving = true;
            this.lastFrameTime = performance.now();
            this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t)); // Doğru şekilde yeni döngü başlat
            
        }, 8000); // Konuşma bitene kadar bekle
    },

    updateBusVisuals: function() {
        const bus = document.getElementById('bus-sprite');
        bus.style.left = `${this.lanePosition}%`;
    },

    arriveAtStop: function() {
        const stopData = this.activeRouteData.stops[this.currentStopIndex];
        const isFinalStop = this.currentStopIndex === this.activeRouteData.stops.length - 1;

        // Yolcu matematiğini başta hesapla
        // FORMÜLE BAĞLI İNİŞ: Kalan durak sayısına göre orantılı deterministik iniş formülü
        const remainingStops = Math.max(1, this.activeRouteData.stops.length - this.currentStopIndex - 1);
        const alighting = isFinalStop ? this.passengersOnBoard : Math.min(this.passengersOnBoard, Math.max(1, Math.round(this.passengersOnBoard / (remainingStops + 1))));
        const waiting = stopData.bekleyenYolcu;

        // PAS GEÇME MANTIÄI: İnecek veya binecek yoksa ve son durak değilse durmadan geç
        if (!isFinalStop && alighting === 0 && waiting === 0) {
            this.currentStopIndex++;
            audio.speakSequence([stopData.name + " durağını geçiyorsunuz.", "Yolcu olmadığı için duraklanmadı.", "Yeni rota hesaplanıyor."]);
            
            // Eğer varsa geçmiş UI uyarılarını temizle
            if (document.getElementById('obstacles-container')) {
                document.getElementById('obstacles-container').innerHTML = '';
            }
            this.obstacles = [];
            this.activeNPCs.forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
            this.activeNPCs = [];

            // Direkt bir sonraki durağın rotasını hesapla (hızı sıfırlamadan)
            this.planNextStop();
            return;
        }

        this.roadCurvature = 0;
        this.passengersOnBoard -= alighting;
        this.stopRequestBellTriggered = false;
        const bellHudArrive = document.getElementById('hud-stop-request');
        if (bellHudArrive) bellHudArrive.style.display = 'none';

        // Dakiklik değerlendirmesi
        let timingArrivalNotice = "";
        if (stopData && stopData.scheduledMinutes) {
            const delta = this.clockMinutes - stopData.scheduledMinutes;
            this.timingDeviations.push(delta);
            if (delta < -1.2) {
                const early = Math.abs(Math.round(delta));
                timingArrivalNotice = ` Durağa ${early} dakika erken vardınız. Kalkış saati bekleniyor.`;
            } else if (delta > 1.8) {
                const late = Math.round(delta);
                timingArrivalNotice = ` Sefer saatinde ${late} dakika rötar var.`;
            } else {
                timingArrivalNotice = " Tam saatinde nizami varış!";
                this.addMoney(20);
            }
        }
        
        // Tekerlekli sandalye yolcusu uyarısı
        if (this.hasWheelchairPassengerAtStop) {
            const rampNotice = "Durağa yanaştınız. Durakta tekerlekli sandalyeli yolcu bekliyor. Rampayı açmak için U tuşuna basınız.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(rampNotice);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(rampNotice);
        }

        this.isDriving = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.speed = 0;
        this.engineRPM = 800;
        this.currentGear = 1;
        audio.updateEngineSound(0, 800, 1);
        audio.updateTireNoise(0, null);
        if (typeof audio.stopLowAirAlarm === 'function') audio.stopLowAirAlarm();
        if (typeof audio.stopTireScreech === 'function') audio.stopTireScreech();
        
        // Bir sonraki sefere başlarken otomatik frenleme/pompalama cezasını engellemek için tuşları sıfırla
        this.keys.s = false;
        this.keys.arrowdown = false;
        
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }
        this.obstacles = [];
        
        // BUG FIX: Kalan NPC'leri ve seslerini temizle (Sonsuz motor sesi hatasını engeller)
        this.activeNPCs.forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
        this.activeNPCs = [];
        
        document.getElementById('stop-title').innerText = stopData.name;
        

        document.getElementById('stop-waiting-count').innerText = waiting;
        document.getElementById('stop-alighting-count').innerText = alighting;
        
        document.getElementById('btn-front-door').disabled = false;
        document.getElementById('btn-front-door').innerText = "Ön Kapıyı Aç";
        document.getElementById('btn-rear-door').disabled = false;
        document.getElementById('btn-rear-door').innerText = "Arka Kapıyı Aç";
        
        // Önceki durak butonlarını ve yolcu olayını gizle
        document.getElementById('passenger-interaction').classList.add('hidden');
        
        audio.speakSequence(["Åimdiki durak:", stopData.name]);
        
        UI.switchScreen('stop-screen');
        
        // Oto-kalkış bekleme durumunda
        this.checkAutoDepart();
    },

    checkAutoDepart: function() {
        if (this.departCountdownTimer) {
            clearTimeout(this.departCountdownTimer);
            this.departCountdownTimer = null;
            document.getElementById('global-progress-text').innerText = "";
            document.getElementById('global-progress-text').parentElement.classList.add('hidden');
        }
        
        if (!this.frontDoorOpen && !this.rearDoorOpen && audio.isEngineRunning) {
            this.departStop();
        }
    },

    departStop: function() {
        if (this.frontDoorOpen || this.rearDoorOpen) {
            if (typeof audio.speak === 'function') audio.speak("Kapılar açıkken hareket edemezsiniz!");
            return;
        }

        if (this.currentStopIndex >= this.activeRouteData.stops.length - 1) {
            this.finishRoute();
            return;
        }

        this.isDriving = true; // Sürüş modunu aktif et
        this.currentStopIndex++;
        
        // BUG FIX: Kapı kapandığında rastgele yolcu ekleme ve hileli (magical) 50â‚º verme hatası kaldırıldı.
        // Binişler zaten automatedTicketProcess() üzerinden doğru şekilde sayılıyor ve ücretlendiriliyor.
        
        UI.switchScreen('driving-screen');
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        
        this.planNextStop();
    },

    boardingTimer: null,

    toggleFrontDoor: function() {
        // BUG FIX: Hareket halindeyken kapıların açılmasını engelle (Kapı Güvenlik Kilidi)
        if (!this.frontDoorOpen && this.speed > 5) {
            audio.speak("Güvenlik kilidi devrede. Araç hareket halindeyken kapılar açılamaz.");
            UI.showToast("Güvenlik Kilidi: Kapılar kilitli!", "error");
            return;
        }
        // Havalı kapı açma (Eğitim Modu: Basınç güvenli seviyede tutulur)
        this.airPressure = Math.max(85, this.airPressure - 2);
        
        this.frontDoorOpen = !this.frontDoorOpen;
        const btn = document.getElementById('btn-front-door');
        
        if (this.frontDoorOpen) {
            if (typeof audio !== 'undefined' && typeof audio.playKneelingSound === 'function') audio.playKneelingSound();
            if (typeof audio !== 'undefined' && typeof audio.playPneumaticDoorOpen === 'function') audio.playPneumaticDoorOpen();
            else audio.playDoorOpen();
            const kneelingHud = document.getElementById('hud-kneeling');
            if (kneelingHud) kneelingHud.style.display = 'inline-block';
            this.stopRequestBellTriggered = false;
            const bellHudFront = document.getElementById('hud-stop-request');
            if (bellHudFront) bellHudFront.style.display = 'none';
            btn.innerText = "Ön Kapıyı Kapat";
            
            // YOLCU TEPKİSİ: Kapı açıldığında nezaket
            // Deterministik Nezaket Formülü: Her 3 durakta bir düzenli yolcu selamı
            if (this.passengersOnBoard > 0 && (this.currentStopIndex % 3 === 0)) {
                audio.speak("Kolay gelsin kaptan.");
            }
            
            if (!this.isDriving) {
                const stopData = this.activeRouteData.stops[this.currentStopIndex];
                let currentWaiting = stopData.bekleyenYolcu;
                
                if (this.boardingTimer) clearInterval(this.boardingTimer);
                
                if (currentWaiting > 0) {
                    document.getElementById('passenger-interaction').classList.remove('hidden');
                    document.getElementById('passenger-dialog').innerText = '"Binişler başladı..."';
                    document.getElementById('passenger-feedback').innerText = "";
                    document.getElementById('stop-waiting-count').innerText = currentWaiting;
                    
                    this.boardingTimer = setInterval(() => {
                        // BUG FIX 3: Ghost Boarding engeli
                        if (!this.frontDoorOpen) {
                            clearInterval(this.boardingTimer);
                            return;
                        }
                        
                        if (currentWaiting <= 0) {
                            clearInterval(this.boardingTimer);
                            document.getElementById('passenger-dialog').innerText = '"Tüm yolcular bindi."';
                            audio.speak("Binişler tamamlandı. Tüm yolcular bindi.");
                            return;
                        }
                        
                        const activeBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
                        const seatCapacity = activeBus ? activeBus.seatCapacity : (this.activeRouteData.otobusKapasitesi || 40);
                        const maxStanding = activeBus ? activeBus.standingCapacity : 15;
                        
                        if (this.passengersOnBoard < seatCapacity) {
                            // Normal biniş
                            this.automatedTicketProcess();
                            currentWaiting--;
                            stopData.bekleyenYolcu = currentWaiting; // BUG FIX: Orijinal veriyi de güncelle (Sonsuz para/yolcu hilesini engeller)
                            document.getElementById('stop-waiting-count').innerText = currentWaiting;
                        } else {
                            // Otobüs dolu, aşırı yığılma reaksiyonları
                            // KAPASİTE EŞİTSİZLİĞİ FORMÜLÜ (Sıfır İhtimal, Kesin Kapasite Matematiği)
                            if (this.passengersOnBoard < (seatCapacity + maxStanding)) {
                                // Ayakta yolcu kapasitesi varsa binişe izin verilir
                                document.getElementById('passenger-dialog').innerText = '"Ayakta giderim sorun değil."';
                                this.automatedTicketProcess(true);
                                currentWaiting--;
                                stopData.bekleyenYolcu = currentWaiting;
                                document.getElementById('stop-waiting-count').innerText = currentWaiting;
                            } else {
                                // Otobüs tamamen ve yasal olarak dolu: Bir sonrakini bekler
                                document.getElementById('passenger-dialog').innerText = '"Otobüs tamamen dolu, bir sonrakine bineceğim."';
                                document.getElementById('passenger-feedback').innerText = "Kapasite dolu, yolcu binemedi.";
                                document.getElementById('passenger-feedback').style.color = '#ef4444';
                                currentWaiting--;
                                stopData.bekleyenYolcu = currentWaiting;
                                document.getElementById('stop-waiting-count').innerText = currentWaiting;
                            }
                        }
                        
                        document.getElementById('hud-passengers').innerText = `${this.passengersOnBoard} / ${seatCapacity}`;
                    }, 1500);
                }
            }
        } else {
            // Kapıyı Kapat
            if (typeof audio !== 'undefined' && typeof audio.playPneumaticDoorClose === 'function') audio.playPneumaticDoorClose();
            else audio.playDoorClose();
            btn.innerText = "Ön Kapıyı Aç";
            const kneelingHudClose = document.getElementById('hud-kneeling');
            if (kneelingHudClose) kneelingHudClose.style.display = 'none';
            if (this.boardingTimer) {
                clearInterval(this.boardingTimer);
                this.boardingTimer = null;
            }
            if (!this.isDriving) this.checkAutoDepart();
        }
    },
    
    toggleRearDoor: function() {
        // BUG FIX: Hareket halindeyken kapıların açılmasını engelle (Kapı Güvenlik Kilidi)
        if (!this.rearDoorOpen && this.speed > 5) {
            audio.speak("Güvenlik kilidi devrede. Araç hareket halindeyken arka kapı açılamaz.");
            UI.showToast("Güvenlik Kilidi: Kapılar kilitli!", "error");
            return;
        }
        // Arka kapı pnömatik (Eğitim Modu: Basınç güvenli seviyede tutulur)
        this.airPressure = Math.max(85, this.airPressure - 2);
        
        this.rearDoorOpen = !this.rearDoorOpen;
        const btn = document.getElementById('btn-rear-door');
        
        if (this.rearDoorOpen) {
            if (typeof audio !== 'undefined' && typeof audio.playPneumaticDoorOpen === 'function') audio.playPneumaticDoorOpen();
            else audio.playDoorOpen();
            btn.innerText = "Arka Kapıyı Kapat";
            if (!this.isDriving) {
                document.getElementById('stop-alighting-count').innerText = "0";
            }
        } else {
            if (typeof audio !== 'undefined' && typeof audio.playPneumaticDoorClose === 'function') audio.playPneumaticDoorClose();
            else audio.playDoorClose();
            btn.innerText = "Arka Kapıyı Aç";
            if (!this.isDriving) this.checkAutoDepart();
        }
    },

    automatedTicketProcess: function(isStanding = false) {
        // FORMÜLE BAĞLI BİLET TÜRÜ: Durak adına ve biniş sırasına göre deterministik bilet
        const currentStopName = (this.activeRouteData.stops[this.currentStopIndex]?.name || "").toLowerCase();
        let pType = "tam";
        if (currentStopName.includes("üniversite") || currentStopName.includes("okul") || currentStopName.includes("fakülte") || currentStopName.includes("lise")) {
            pType = "ogrenci"; // Okul/Kampüs duraklarında öğrenci
        } else if (currentStopName.includes("hastane") || currentStopName.includes("huzurevi") || currentStopName.includes("sağlık")) {
            pType = "yasli"; // Hastane/Sağlık duraklarında serbest kart
        } else {
            // Şehir içi duraklarda deterministik 5'li döngü formülü (3 Tam, 1 Öğrenci, 1 Serbest)
            const seq = this.passengersOnBoard % 5;
            pType = (seq === 0) ? "yasli" : ((seq === 2) ? "ogrenci" : "tam");
        }
        
        let fare = this.ticketPrices[pType];
        const cityName = this.activeRouteData.sehir;
        if (sehirRotalari[cityName] && sehirRotalari[cityName].ucretler) {
            fare = sehirRotalari[cityName].ucretler[pType];
        }
        
        if (pType !== "yasli") {
            this.addMoney(fare);
        }
        this.passengersOnBoard++;
        
        if (typeof audio !== 'undefined' && typeof audio.playValidatorSound === 'function') {
            audio.playValidatorSound(pType);
        } else {
            audio.playAkbil(pType);
        }
        
        let label = pType === "tam" ? "Tam" : (pType === "ogrenci" ? "Öğrenci" : "Serbest");
        document.getElementById('passenger-feedback').innerText = `${label} basıldı. ${fare > 0 ? fare + ' â‚º alındı.' : 'Ücretsiz geçiş.'}`;
        document.getElementById('passenger-feedback').style.color = 'var(--secondary)';
        
        if (!isStanding) {
            document.getElementById('passenger-dialog').innerText = '"Kolay gelsin."';
        }
    },

    finishRoute: function(isSuccess = true) {
        this.isDriving = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        audio.stopEngine();
        audio.playMenuMusic();
        if (typeof audio.stopTireScreech === 'function') audio.stopTireScreech();
        if (typeof audio.stopLowAirAlarm === 'function') audio.stopLowAirAlarm();
        
        // BUG FIX: Görev bittiğinde hava durumu efektlerini ve silecekleri kapat
        if (typeof audio.stopWeather === 'function') audio.stopWeather();
        if (audio.isWiperOn) audio.toggleWipers();
        
        // Kalan NPC seslerini ve engelleri de temizle
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }
        this.obstacles = [];
        this.activeNPCs.forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
        this.activeNPCs = [];
        
        if (isSuccess) {
            let comfortBonus = 0;
            let comfortMsg = "";
            if (this.passengerComfort >= 80) {
                comfortBonus = Math.round(this.passengerComfort * 1.5);
                this.addMoney(comfortBonus);
                this.addXP(40);
                comfortMsg = ` Üstün sürüş kalitesi ve yolcu konfor primi: ${comfortBonus} Lira ve 40 tecrübe puanı kazandınız.`;
            }
            
            const resComfort = document.getElementById('res-comfort');
            if (resComfort) resComfort.innerText = `%${Math.round(this.passengerComfort)} (${this.getComfortStatus()})`;
            
            // Sefer Dakikliği ve Zamanlama Karnesi
            let avgDev = 0;
            if (this.timingDeviations && this.timingDeviations.length > 0) {
                const sumDev = this.timingDeviations.reduce((acc, v) => acc + Math.abs(v), 0);
                avgDev = sumDev / this.timingDeviations.length;
            }
            const punctualityScore = Math.max(88, Math.round(100 - (avgDev * 3)));
            const resTiming = document.getElementById('res-timing');
            if (resTiming) resTiming.innerText = `%${punctualityScore} (Zamanında)`;
            
            let timingRewardMsg = "";
            if (punctualityScore >= 90) {
                this.addMoney(150);
                this.addXP(40);
                timingRewardMsg = " Sefer saatine yüksek sadakat ve dakiklik primi: 150 Lira ve 40 tecrübe puanı kazandınız.";
            }

            audio.speak("Tebrikler. Görev başarıyla tamamlandı." + comfortMsg + (typeof timingRewardMsg !== "undefined" ? timingRewardMsg : "") + " Bir sonraki göreve geçmek için sonraki üzerine tıklayın veya geri dönüp oyundan çıkmak için ana menü düğmesine basın.");
            
            if (this.activeRouteData && this.activeRouteData.isIntercity) {
                this.unlockCity(this.activeRouteData.destCity);
                if (typeof UI !== 'undefined') UI.showToast(`${this.activeRouteData.destCity} Åehrinin Kilidi Açıldı!`, 'success');
            }

            this.completeTask(); // İlerlemeyi kaydet
        } else {
            audio.speak("Eğitim seferi tamamlanamadı. Ceza uygulanmadı, istediğiniz zaman tekrar deneyebilirsiniz kaptan.");
        }
        
        if (document.getElementById('res-money')) document.getElementById('res-money').innerText = `${this.sessionMoney} â‚º`;
        if (document.getElementById('res-penalties')) document.getElementById('res-penalties').innerText = '0 ₺ (Eğitimde Ceza Yok / Muaf)';
        
        if (typeof UI !== 'undefined') UI.switchScreen('results-screen');
    },

    handleKeyDown: function(e) {
        // Eğer sistem kısayolları kullanılıyorsa (NVDA, tarayıcı) oyunu etkilemesin
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        // Eğer oyun sürüş halinde değilse, mola ekranında değilse ve sanayide değilse;
        // bu tuş vuruşları ana menü veya diğer arayüzler içindir. Oyunu ilgilendirmez.
        if (!this.isDriving && document.getElementById('stop-screen').classList.contains('hidden') && !SanayiMechanic.isActive) {
            return;
        }

        const k = e.key.toLowerCase();
        
        // Sadece oyun içindeysek ekran okuyucu veya sayfa kaydırmasını engellemek için preventDefault kullan
        if (k.startsWith('arrow') || k === ' ') {
            e.preventDefault();
        }

        // Shift + Ok Tuşları Pusula Yön Değiştirme (Sürüş tuşlarını tetiklemesin)
        if (e.shiftKey && (k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright')) {
            if (typeof CompassNav !== 'undefined') {
                CompassNav.handleDirection(e.key);
            }
            return;
        }
        
        if (e.repeat) return; // Basılı tutulduğunda aynı aksiyonun defalarca tetiklenmesini engelle

        // Çekici Yapay Zeka (Otopilot) kontrolü: Oyuncu müdahale edemez
        if (this.isBeingTowed && (k === 'w' || k === 'a' || k === 's' || k === 'd' || k.startsWith('arrow'))) {
            e.preventDefault();
            const currentTime = performance.now();
            if (!this.lastTowDriverWarnTime || currentTime - this.lastTowDriverWarnTime > 5000) {
                this.lastTowDriverWarnTime = currentTime;
                if (typeof audio.speak === 'function') {
                    audio.speak("Merak etme usta, kontrol bende. Sen işi bana bırak.");
                }
            }
            return; // Tuş işlemini tamamen iptal et
        }
        
        if (e.shiftKey && k === 'w') {
            if (typeof audio !== 'undefined' && typeof audio.toggleWipers === 'function') {
                audio.toggleWipers();
            }
        }

        if (k === 'k') {
            this.isACOn = !this.isACOn;
            const msg = this.isACOn ? "Klima açıldı. Hedef sıcaklık 22 derece." : "Klima kapatıldı.";
            if (typeof audio.speak === 'function') audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, 'info');
            return;
        }

        if (k === 'u') {
            e.preventDefault();
            this.toggleWheelchairRamp();
            return;
        }

        if (k === 'p') {
            e.preventDefault();
            this.toggleLuggageBays();
            return;
        }

        if (k === 'i') {
            e.preventDefault();
            this.reportIBISStatus();
            return;
        }

        if (k === 'z') {
            e.preventDefault();
            this.reportScheduleAdherence();
            return;
        }

        if (k === 'j') {
            e.preventDefault();
            this.checkLostAndFound();
            return;
        }

        if (k === 'c') {
            e.preventDefault();
            const status = this.getComfortStatus();
            const msg = `Yolcu Konfor Endeksi: Yüzde ${Math.round(this.passengerComfort)}. Sürüş kalitesi ${status}.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, 'info');
            return;
        }

        if (k === 't') {
            e.preventDefault();
            if (e.shiftKey) {
                let hh = Math.floor(this.clockMinutes / 60);
                let mm = Math.floor(this.clockMinutes % 60);
                let timeStr = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
                let durum = this.weather === 'sunny' ? (this.isNight ? 'Açık' : 'Güneşli') : (this.weather === 'rainy' ? 'Yağmurlu' : 'Karlı');
                const msg = `Saat ${timeStr}. Dış sıcaklık ${this.temperature} derece, otobüs içi ${Math.floor(this.busTemperature)} derece. Hava durumu: ${durum}. ${this.isACOn ? "Klima açık." : "Klima kapalı."}`;
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
                return;
            }
            this.handleRadioDispatch();
            return;
        }


        if (k === 'g' || (k === 'b' && this.isDriving)) {
            e.preventDefault();
            const r = this.activeRouteData;
            if (r) {
                const startStop = r.startStop || (r.stops[0] ? r.stops[0].name : "Başlangıç");
                const endStop = r.endStop || (r.stops[r.stops.length - 1] ? r.stops[r.stops.length - 1].name : "Son Durak");
                const nextStop = r.stops[this.currentStopIndex];
                const kalanDurak = r.stops.length - this.currentStopIndex;
                const remDist = Math.max(0, Math.floor(this.currentDistanceToNext));
                const distStr = remDist >= 1000 ? (remDist / 1000).toFixed(1) + " kilometre" : remDist + " metre";
                const msg = "Mevcut Görev Durumu: " + r.name + ". Kalkış noktanız: " + startStop + ". Sıradaki durulacak durak: " + (nextStop ? nextStop.name : endStop) + ", yaklaşık " + distStr + " kaldı. Kalan durak sayısı: " + kalanDurak + ". Gitmeniz gereken son durak: " + endStop + ".";
                if (typeof audio.speak === "function") audio.speak(msg);
                if (typeof audio.updateNvdaLiveRegion === "function") audio.updateNvdaLiveRegion(msg);
            }
            return;
        }

        if (k === 'n') {
            e.preventDefault();
            let remDistance = Math.max(0, Math.round(this.currentDistanceToNext));
            let nextStop = (this.activeRouteData && this.activeRouteData.stops) ? this.activeRouteData.stops[this.currentStopIndex] : null;
            let kalanDurak = (this.activeRouteData && this.activeRouteData.stops) ? (this.activeRouteData.stops.length - this.currentStopIndex) : 0;
            let stopName = nextStop ? nextStop.name : "";
            let distStrN = remDistance >= 1000 ? (remDistance / 1000).toFixed(1) + " kilometre" : remDistance + " metre";
            let msg = (kalanDurak === 1 ? "Son durak: " : "Sıradaki durak: ") + stopName + ", " + distStrN + " kaldı.";
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }

        if (k === 'r') {
            e.preventDefault();
            let msg = `Hızınız saatte ${Math.floor(this.speed)} kilometre.`;
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }

        if (k === 'h') {
            e.preventDefault();
            let msg = `Araç sağlığı yüzde ${Math.floor(this.busDamage.health)}. `;
            let hasarListesi = [];
            
            if (this.busDamage.leftWindow > 0) hasarListesi.push(`Sol cam yüzde ${Math.floor(this.busDamage.leftWindow)}`);
            if (this.busDamage.rightWindow > 0) hasarListesi.push(`Sağ cam yüzde ${Math.floor(this.busDamage.rightWindow)}`);
            if (this.busDamage.front > 0) hasarListesi.push(`Ön kaporta yüzde ${Math.floor(this.busDamage.front)}`);
            if (this.busDamage.wipers > 0) hasarListesi.push(`Silecekler yüzde ${Math.floor(this.busDamage.wipers)}`);
            if (this.busDamage.headlights > 0) hasarListesi.push(`Farlar yüzde ${Math.floor(this.busDamage.headlights)}`);
            if (this.busDamage.exhaust > 0) hasarListesi.push(`Egzoz yüzde ${Math.floor(this.busDamage.exhaust)}`);
            
            if (hasarListesi.length > 0) {
                msg += hasarListesi.join(", ") + " hasarlı.";
            } else {
                msg += "Mekanik aksamda hiçbir hasar yok, her şey sağlam.";
            }
            
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }

        if (e.shiftKey && (k === 'a')) {
            e.preventDefault();
            if (typeof MissionReader !== 'undefined') MissionReader.readNextStep();
            return;
        }
        if (k === 'escape') {
            if (typeof MissionReader !== 'undefined') MissionReader.exit();
            return;
        }
        if (this.keys.hasOwnProperty(k)) this.keys[k] = true;

        // Özel aksiyonlar
        if (e.code === 'Space') {
            if (audio.isEngineRunning) {
                audio.stopEngine();
            } else {
                audio.startEngine();
            }
            if (!this.isDriving) this.checkAutoDepart();
        }
        if (k === 'l' || k === 'h' || k === 'k') {
            e.preventDefault();
            if (typeof audio !== 'undefined' && typeof audio.playHorn === 'function') {
                audio.playHorn();
            }
            // Öndeki aracı uyar (korna çalınca öndeki yavaş araç sağa kaçar veya hızlanır)
            if (this.activeNPCs && this.activeNPCs.length > 0) {
                this.activeNPCs.forEach(npc => {
                    if (!npc.hasCollided && npc.type === 'ahead' && npc.y > 0 && npc.y < 180) {
                        npc.baseSpeed += 20; // Hızlanır
                        npc.x = 82; // Sağa emniyet şeridine yanaşır
                        if (!npc.horned && audio.playNPCHorn) {
                            npc.horned = true;
                            setTimeout(() => audio.playNPCHorn((npc.x - this.lanePosition) / 30), 400);
                        }
                    }
                });
            }
        }
        if (k === 'pageup') {
            e.preventDefault();
            this.toggleFrontDoor();
        }
        if (k === 'pagedown') {
            e.preventDefault();
            this.toggleRearDoor();
        }
        if (k === 'home') {
            e.preventDefault();
            audio.setWindowOpen(true);
            audio.updateAcoustics(this.busDamage.leftWindow, this.busDamage.rightWindow);
            const dst = Math.max(0, Math.round(this.currentDistanceToNext));
            audio.speak(`Sonraki durağa ${dst} metre kaldı`);
        }
        if (k === 'f') { // Farlar
            e.preventDefault();
            if (this.busDamage.headlights >= 100) {
                audio.playHeadlightBust(); // Farlar bozuk sesi
                audio.speak("Farlar çalışmıyor. Ampuller patlamış veya tesisat hasarlı.");
                this.isHeadlightsOn = false;
            } else {
                this.isHeadlightsOn = !this.isHeadlightsOn;
                audio.playSwitchClick(); // Åalter sesi
                if (this.isHeadlightsOn) {
                    audio.speak("Farlar açıldı.");
                } else {
                    audio.speak("Farlar kapatıldı.");
                }
            }
        }
        if (k === 't') {
            let hh = Math.floor(this.clockMinutes / 60);
            let mm = Math.floor(this.clockMinutes % 60);
            let timeStr = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
            
            let timeOfDay = "Gece";
            if (this.clockMinutes >= 360 && this.clockMinutes < 720) timeOfDay = "Öğleden Önce";
            else if (this.clockMinutes >= 720 && this.clockMinutes < 1080) timeOfDay = "Gün Ortası";
            else if (this.clockMinutes >= 1080) timeOfDay = "Akşam";

            let durum = this.weather === 'sunny' ? (this.isNight ? 'Açık' : 'Güneşli') : (this.weather === 'rainy' ? 'Yağmurlu' : 'Karlı');
            let uyari = this.weather === 'snowy' ? ' Yollar buzlu.' : (this.weather === 'rainy' ? ' Yollar kaygan.' : '');
            let farDurum = this.isNight ? (this.isHeadlightsOn ? ' Farlarınız açık.' : ' Farlarınız KAPALI, görüş tehlikesi!') : '';
            
            // Tonaj Bilgisini Kategorize Et
            let weightCategory = "Hafif"; // 0-15 yolcu
            if (this.passengersOnBoard > 15 && this.passengersOnBoard <= 40) {
                weightCategory = "Orta ağırlıkta";
            } else if (this.passengersOnBoard > 40) {
                weightCategory = "Çok ağır";
            }
            
            audio.speak(`Saat ${timeStr}. ${timeOfDay}. Hava durumu: ${durum}. Sıcaklık: ${this.temperature} derece. Otobüs şu an ${weightCategory}.${uyari}${farDurum}`);
        }
        if (k === 'k' || k === 'h' || k === 'v' || k === 't' || k === 'l') {
            e.preventDefault();
        }
        if (k === 'end') {
            e.preventDefault();
            audio.setWindowOpen(false);
            audio.updateAcoustics(this.busDamage.leftWindow, this.busDamage.rightWindow);
            audio.speak("Cam kapatıldı");
        }
    },

    handleKeyUp: function(e) {
        const k = e.key.toLowerCase();
        if (e.shiftKey && (k.startsWith('arrow'))) return;
        // BUG FIX: Oyun durumu değiştiğinde (örneğin durağa tam yanaştığımızda isDriving false olur)
        // Eğer bu kontrolü yaparsak, oyuncunun elini tuştan çekmesi algılanmaz ve tuş sonsuza kadar takılı kalır!
        // Bu yüzden keyup olayları her zaman dinlenmelidir.
        if (this.keys.hasOwnProperty(k)) this.keys[k] = false;
        
        if (k === 'l') {
            if (typeof audio !== 'undefined' && typeof audio.stopHorn === 'function') {
                audio.stopHorn();
            }
        }
    },

    showWarning: function(msg) {
        const warningEl = document.getElementById('hud-warnings');
        warningEl.innerText = msg;
        
        // EKRAN OKUYUCU DÜZELTMESİ (A11Y): Görme engelli oyuncuların uyarıları duyabilmesi için
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(msg);
        }
        
        setTimeout(() => { if (warningEl.innerText === msg) warningEl.innerText = ""; }, 2000);
    }
};

window.addEventListener('keydown', (e) => {
    if (SanayiMechanic.isActive) {
        SanayiMechanic.handleKeyDown(e);
    } else {
        Game.handleKeyDown(e);
    }
});
window.addEventListener('keyup', (e) => Game.handleKeyUp(e));

// BUG FIX: Sekme değiştiğinde veya pencere odağı kaybolduğunda takılı kalan tuşları (Hayalet Girdi) temizle
window.addEventListener('blur', () => {
    Object.keys(Game.keys).forEach(k => Game.keys[k] = false);
    Game.isBrakeKeyDown = false; // Fren cezasını da sıfırla
    if (typeof audio !== 'undefined' && audio.stopHorn) audio.stopHorn();
});

// ==========================================
// SANAYİ (MECHANIC) SİSTEMİ
// ==========================================
const SanayiMechanic = {
    isActive: false,
    parts: [],
    currentIndex: 0,
    state: 'greeting', // greeting, report, repair

    start: function() {
        this.isActive = true;
        this.state = 'greeting';
        
        const dialogEl = document.getElementById('sanayi-dialog');
        const reportContainer = document.getElementById('sanayi-report-container');
        const statusEl = document.getElementById('sanayi-status');
        
        reportContainer.classList.add('hidden');
        statusEl.innerText = "Araç Durumu İnceleniyor...";
        
        const greetingText = "Merhabalar efendim. Görünüşe göre aracınız ciddi bir kazaya maruz kalmış. Hemen aracınızın bir röntgenini çekeceğim ve size bir rapor sunacağım. Devam etmek için Enter tuşuna basın.";
        dialogEl.innerText = greetingText;
        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(greetingText);
    },

    showReport: function() {
        this.state = 'report';
        this.currentIndex = 0;
        
        // Hasarlı parçaları tespit et
        this.parts = [];
        if (Game.busDamage.leftWindow > 0) this.parts.push({ id: 'leftWindow', name: 'Sol Cam', damage: Game.busDamage.leftWindow, toRepair: false });
        if (Game.busDamage.rightWindow > 0) this.parts.push({ id: 'rightWindow', name: 'Sağ Cam', damage: Game.busDamage.rightWindow, toRepair: false });
        if (Game.busDamage.front > 0) this.parts.push({ id: 'front', name: 'Ön Kaporta ve Motor', damage: Game.busDamage.front, toRepair: false });
        if (Game.busDamage.wipers > 0) this.parts.push({ id: 'wipers', name: 'Silecek Motoru', damage: Game.busDamage.wipers, toRepair: false });
        if (Game.busDamage.headlights > 0) this.parts.push({ id: 'headlights', name: 'Ön Farlar ve Tesisat', damage: Game.busDamage.headlights, toRepair: false });
        if (Game.busDamage.exhaust > 0) this.parts.push({ id: 'exhaust', name: 'Egzoz ve DPF Sistemi', damage: Game.busDamage.exhaust, toRepair: false });
        
        const dialogEl = document.getElementById('sanayi-dialog');
        const reportContainer = document.getElementById('sanayi-report-container');
        const listEl = document.getElementById('sanayi-parts-list');
        const statusEl = document.getElementById('sanayi-status');
        
        statusEl.innerText = "Hasar Raporu";
        dialogEl.innerText = "Aşağı-Yukarı yön tuşlarıyla hasarlı parçaları inceleyin. Onarmak için parçanın üzerindeyken Enter'a basın.";
        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Röntgen tamamlandı. Hasar raporunuz ekranda. Aşağı yukarı yön tuşlarıyla parçaları inceleyip, onarmak istediğiniz parçanın üzerinde enter tuşuna basın. İşiniz bittiğinde işlemi tamamla butonuna basabilirsiniz.");
        
        reportContainer.classList.remove('hidden');
        
        this.renderList();
    },

    renderList: function() {
        const listEl = document.getElementById('sanayi-parts-list');
        listEl.innerHTML = '';
        
        this.parts.forEach((part, index) => {
            const li = document.createElement('li');
            li.className = 'route-item' + (index === this.currentIndex ? ' selected' : '');
            li.innerHTML = `${part.name} - Hasar: %${Math.floor(part.damage)} ${part.toRepair ? '<span style="color:var(--primary)">[ONARILACAK]</span>' : ''}`;
            listEl.appendChild(li);
        });
        
        // Add "İşlemi Tamamla" option at the end
        const btnLi = document.createElement('li');
        btnLi.className = 'route-item' + (this.currentIndex === this.parts.length ? ' selected' : '');
        btnLi.innerHTML = `<strong style="color:var(--secondary)">İşlemi Tamamla (Onarımı Başlat)</strong>`;
        listEl.appendChild(btnLi);
        
        this.announceCurrentSelection();
    },

    announceCurrentSelection: function() {
        if (this.currentIndex < this.parts.length) {
            const part = this.parts[this.currentIndex];
            let text = `${part.name}. Yüzde ${Math.floor(part.damage)} hasarlı.`;
            if (part.toRepair) text += " Onarım listesine eklendi.";
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(text);
        } else {
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("İşlemi Tamamla ve onarımı başlat.");
        }
    },

    handleKeyDown: function(e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        if (this.state === 'greeting') {
            if (e.key === 'Enter') {
                audio.playSelect();
                this.showReport();
            }
        } 
        else if (this.state === 'report') {
            if (e.key === 'ArrowDown') {
                audio.playNav();
                this.currentIndex = Math.min(this.currentIndex + 1, this.parts.length);
                this.renderList();
            } else if (e.key === 'ArrowUp') {
                audio.playNav();
                this.currentIndex = Math.max(this.currentIndex - 1, 0);
                this.renderList();
            } else if (e.key === 'Enter') {
                audio.playSelect();
                if (this.currentIndex < this.parts.length) {
                    const selectedPart = this.parts[this.currentIndex];
                    if (selectedPart.toRepair) {
                        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Bu parça zaten onarım listesinde.");
                    } else {
                        // Parça seçimi
                        this.state = 'confirm';
                        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Bu parçayı onarmak ister misiniz? Onaylamak için enter'a basın.");
                    }
                } else {
                    // İşlemi Tamamla
                    this.startRepair();
                }
            }
        }
        else if (this.state === 'confirm') {
            if (e.key === 'Enter') {
                audio.playSelect();
                this.parts[this.currentIndex].toRepair = true;
                this.state = 'report';
                this.renderList();
            } else if (e.key === 'Escape' || e.key === 'Backspace') {
                this.state = 'report';
                this.announceCurrentSelection();
            }
        }
    },

    startRepair: function() {
        if (this.state === 'repair') return; // BUG FIX: Çift tıklama veya çoklu Enter spam koruması
        this.state = 'repair';
        const partsToRepair = this.parts.filter(p => p.toRepair);
        
        if (partsToRepair.length === 0) {
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Hiçbir parçayı onarmadınız. İşler bitti patron. Sonra görüşürüz. Daha bakılacak çok araba var.");
            setTimeout(() => this.finishRepair(), 5000);
            return;
        }

        document.getElementById('sanayi-parts-list').innerHTML = '';
        
        let currentRepairIndex = 0;
        let totalCost = 0;
        
        const repairNext = () => {
            if (currentRepairIndex >= partsToRepair.length) {
                // EĞİTİM VE GARANTİ DESTEĞİ: Sıfır masraf, belediye eğitim desteği
                const finalMsg = "Tüm onarımlar belediye eğitim ve garanti desteği kapsamında ücretsiz olarak tamamlandı. Aracınız hazır kaptan, iyi görevler!";
                document.getElementById('sanayi-dialog').innerText = finalMsg;
                if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(finalMsg);
                setTimeout(() => this.finishRepair(), 2500);
                return;
            }
            
            const part = partsToRepair[currentRepairIndex];
            const cost = Math.floor(part.damage * 15);
            totalCost += cost;
            
            const msg = "Su an " + part.name + " parcasini onariyorum.";
            document.getElementById('sanayi-dialog').innerText = msg;
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            
            // Onarım işlemi 30 saniye sürüyor (Her parça için)
            setTimeout(() => {
                // Hasarı sıfırla
                Game.busDamage[part.id] = 0;
                audio.updateAcoustics(Game.busDamage.leftWindow, Game.busDamage.rightWindow);
                
                const doneMsg = `${part.name} onarımı tamamlandı.`;
                document.getElementById('sanayi-dialog').innerText = doneMsg;
                if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(doneMsg);
                
                currentRepairIndex++;
                setTimeout(repairNext, 1200);
            }, 2000);
        };
        
        repairNext();
    },

    finishRepair: function() {
        this.isActive = false;
        
        // Canı tekrar fulleyelim çünkü tamirden çıktık
        Game.busDamage.health = 100;
        
        document.getElementById('btn-start-game').innerText = "Kaldığın Yerden Devam Et";
        
        UI.switchScreen('title-screen');
        // Erişilebilirlik için butona direkt odaklan
        document.getElementById('btn-start-game').focus();
        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Ana menüye döndünüz. Ekrandaki 'Kaldığın Yerden Devam Et' düğmesine tıklayarak veya enter tuşuna basarak yarım kalan seferinize devam edebilirsiniz.");
    }
};



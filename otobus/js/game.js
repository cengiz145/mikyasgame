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

    // DİNAMİK YAKIT VE TÜKETİM SİSTEMİ
    fuelTankCapacity: 500,
    currentFuelLiters: 500,
    fuelWarned15: false,
    fuelWarned5: false,

    getFuelCapacity: function() {
        const bus = (typeof BusFleet !== 'undefined' && typeof BusFleet.getSelectedBus === 'function') 
            ? BusFleet.getSelectedBus() 
            : (this.selectedBus || null);
        if (bus && bus.fuelTankCapacity) return bus.fuelTankCapacity;
        if (bus) {
            if (bus.sizeTier === 1) return 150;
            if (bus.sizeTier === 2) return 300;
            if (bus.sizeTier === 3) return 430;
            if (bus.sizeTier === 4) return 500;
            if (bus.sizeTier === 5) return 620;
            if (bus.category === 'seyahat') return 520;
        }
        return 500;
    },

    getFuelConsumptionPer100km: function() {
        const bus = (typeof BusFleet !== 'undefined' && typeof BusFleet.getSelectedBus === 'function') 
            ? BusFleet.getSelectedBus() 
            : (this.selectedBus || null);
        if (bus && bus.fuelConsumptionRate) return bus.fuelConsumptionRate;
        if (bus) {
            if (bus.sizeTier === 1) return 22;
            if (bus.sizeTier === 2) return 32;
            if (bus.sizeTier === 3) return 44;
            if (bus.sizeTier === 4) return 28;
            if (bus.sizeTier === 5) return 33;
        }
        return 30;
    },

    refuel: function(liters, costPerLiter = 42) {
        const cap = this.getFuelCapacity();
        if (this.currentFuelLiters === undefined) this.currentFuelLiters = cap;
        const needed = Math.max(0, cap - this.currentFuelLiters);
        const toAdd = (liters === undefined || liters === null) ? needed : Math.min(needed, liters);
        if (toAdd <= 0) {
            const fullMsg = "Deponuz zaten tamamen dolu!";
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(fullMsg, "info");
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(fullMsg);
            return 0;
        }
        let effCostPerLiter = costPerLiter;
        let isFreeFuel = false;
        if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.getInstitutionLevel === 'function') {
            const resortLvl = CompanySystem.getInstitutionLevel('highway_resort');
            if (resortLvl === 2) {
                effCostPerLiter = Math.round(costPerLiter * 0.70); // %30 dinlenme tesisi indirimi
            } else if (resortLvl === 3) {
                effCostPerLiter = 0; // %100 ÜCRETSİZ
                isFreeFuel = true;
            }
        }
        const cost = Math.round(toAdd * effCostPerLiter);
        if (this.playerBudget < cost) {
            const warnMsg = `Yetersiz bütçe! ${Math.floor(toAdd)} litre mazot için ${cost} ₺ gerekiyor, bakiyeniz ${this.playerBudget} ₺.`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(warnMsg, "warning");
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnMsg);
            return 0;
        }
        if (cost > 0) {
            this.playerBudget = Math.max(0, (this.playerBudget || 0) - cost);
            if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                const title = (typeof this.getLicenseTitle === 'function') ? this.getLicenseTitle() : 'Kaptan';
                UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, title);
            }
        }
        this.currentFuelLiters += toAdd;
        this.fuelWarned15 = false;
        this.fuelWarned5 = false;
        this.saveData();

        if (typeof audio !== 'undefined' && typeof audio.playNavChime === 'function') {
            audio.playNavChime();
        }
        const succMsg = isFreeFuel 
            ? `⛽ Şirket Mega Yaşam Kompleksi ayrıcalığıyla depoya ${Math.floor(toAdd)} litre mazot ÜCRETSİZ dolduruldu! Depo: %${Math.floor((this.currentFuelLiters / cap) * 100)} dolu.`
            : `⛽ Depoya ${Math.floor(toAdd)} litre mazot dolduruldu (-${cost} ₺). Depo şu an %${Math.floor((this.currentFuelLiters / cap) * 100)} dolu.`;
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(succMsg, "success");
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Depoya ${Math.floor(toAdd)} litre mazot alındı. Yakıt seviyeniz yüzde ${Math.floor((this.currentFuelLiters / cap) * 100)}.`);
        return toAdd;
    },

    // --- State Variables ---
    academyCompleted: localStorage.getItem('academyCompleted') === 'true',
    isAcademyCompleted: function() {
        return true; // Oyuncunun oyuna başlama hakkını hiçbir zaman engelleme
    },
    completeAcademy: function() {
        this.academyCompleted = true;
        try { localStorage.setItem('academyCompleted', 'true'); } catch(e) {}
    },
    username: null,
    licenseLevel: parseInt(localStorage.getItem('licenseLevel')) || 1,
    playerXP: parseInt(localStorage.getItem('playerXP')) || 0,
    LEVEL_XP_THRESHOLDS: [
        0,      // Level 1
        250,    // Level 2 (Stajyer)
        650,    // Level 3 (BMC Neocity 10M açılır)
        1250,   // Level 4 (Kalfalık)
        2100,   // Level 5 (Mercedes Conecto Solo açılır)
        3200,   // Level 6 (Deneyimli)
        4600,   // Level 7 (Uzman)
        6300,   // Level 8 (Mercedes Conecto Körüklü açılır)
        8500,   // Level 9 (Gece Kartalı)
        11000,  // Level 10 (Master Şehirlerarası Kaptan - Travego & Saray Ekspres Açılır!)
        14000,  // Level 11
        17500,  // Level 12 (Tourismo)
        21500,  // Level 13
        26000,  // Level 14 (MAN Lion's Coach)
        31000,  // Level 15
        37000,  // Level 16 (Setra TopClass)
        44000,  // Level 17
        52000,  // Level 18
        61000,  // Level 19
        71000   // Level 20 (Neoplan Cityliner)
    ],

    calculateLevelFromXP: function(xp) {
        let lvl = 1;
        for (let i = 1; i < this.LEVEL_XP_THRESHOLDS.length; i++) {
            if (xp >= this.LEVEL_XP_THRESHOLDS[i]) {
                lvl = i + 1;
            } else {
                break;
            }
        }
        return lvl;
    },

    getNextLevelXP: function(currentLevel) {
        if (currentLevel >= this.LEVEL_XP_THRESHOLDS.length) {
            return this.LEVEL_XP_THRESHOLDS[this.LEVEL_XP_THRESHOLDS.length - 1] + 10000;
        }
        return this.LEVEL_XP_THRESHOLDS[currentLevel];
    },

    getUnlockTeaser: function(currentLevel) {
        if (currentLevel < 2) return "Seviye 2'de Çevik Isuzu Novo Lux açılacak!";
        if (currentLevel < 3) return "Seviye 3'te BMC Neocity 10M açılacak!";
        if (currentLevel < 5) return "Seviye 5'te Mercedes Conecto Solo açılacak!";
        if (currentLevel < 8) return "Seviye 8'de 18 Metre Körüklü Conecto açılacak!";
        if (currentLevel < 8) return "Seviye 8'de Efsane Mercedes O 403 açılacak!";
        if (currentLevel < 10) return "Seviye 10'da Mercedes Travego ve İlçe Karayolları açılacak!";
        if (currentLevel < 12) return "Seviye 12'de Mercedes Tourismo açılacak!";
        if (currentLevel < 14) return "Seviye 14'te Temsa Safir Plus ve MAN Lion's Coach açılacak!";
        if (currentLevel < 16) return "Seviye 16'da Setra TopClass açılacak!";
        if (currentLevel < 20) return "Seviye 20'de Fütüristik Neoplan Cityliner açılacak!";
        return "Efsanevi Master Kaptan unvanına sahipsiniz!";
    },
    hasPassedLevel10: function() {
        return (this.completedTasks >= 10) || (this.licenseLevel > 10);
    },
    playMode: localStorage.getItem('gamePlayMode') || 'career',
    setPlayMode: function(m) { this.playMode = m === 'free_drive' ? 'free_drive' : 'career'; try { localStorage.setItem('gamePlayMode', this.playMode); } catch(e) {} },
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
    activeDistrict: localStorage.getItem('activeDistrict') || "Süleymanpaşa",
    setActiveDistrict: function(dist) {
        this.activeDistrict = dist || "Süleymanpaşa";
        try { localStorage.setItem('activeDistrict', this.activeDistrict); } catch(e) {}
        this.saveData();
        if (typeof generateRoutesFromAPI === 'function') {
            const realStops = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari["Tekirdağ"])
                ? varsayilanSehirDuraklari["Tekirdağ"]
                : null;
            generateRoutesFromAPI(realStops, "Tekirdağ", this.activeDistrict);
        }
        if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.updateDistrictUI) {
            AkilliRotaSistemi.updateDistrictUI();
        }
        if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
            UI.updateTitleScreenButtons();
        }
        if (typeof UI !== 'undefined' && document.getElementById('route-menu') && !document.getElementById('route-menu').classList.contains('hidden')) {
            UI.renderRoutes("Tekirdağ", this.completedTasks);
        }
    },
    
    // TEKİRDAĞ RESMİ MGM İKLİM NORMALLERİ VE ATMOSFERİK REJİMLER (AY İSİMLERİNDEN BAĞIMSIZ)
    tekirdagClimate: {
        recordMax: 40.2,       // Tarihi rekor en yüksek (°C)
        meanMax: 17.9,         // Gündüz ortalama en yüksek (°C)
        mean: 14.0,            // Yıllık referans ortalama (°C)
        meanMin: 10.3,         // Gece ortalama en düşük (°C)
        recordMin: -13.3,      // Tarihi rekor en düşük (°C)
        annualRainMm: 589.1,   // Yıllık toplam yağış (mm)

        // Tekirdağ iklim verilerinden türetilen 4 ana atmosferik rejim
        regimes: {
            "iliman": {
                name: "Ilıman Marmara Havası",
                weather: "sunny",
                mean: 14.0,
                max: 17.9,
                min: 10.3,
                rainMm: 0,
                descDay: "Güneşli (Gündüz ☀️)",
                descNight: "Açık (Gece 🌙)"
            },
            "sicak": {
                name: "Sıcak Trakya Güneşi",
                weather: "sunny",
                mean: 23.8,
                max: 28.1,
                min: 19.3,
                rainMm: 14.0,
                descDay: "Yoğun Güneşli (Gündüz ☀️)",
                descNight: "Sıcak Açık (Gece 🌙)"
            },
            "yagmurlu": {
                name: "Bulutlu & Yağmurlu",
                weather: "rainy",
                mean: 11.0,
                max: 14.7,
                min: 8.0,
                rainMm: 64.3,
                rainIntensity: 2,
                descDay: "Bulutlu ve Yağmurlu (🌧️)",
                descNight: "Yağmurlu Gece (🌧️)"
            },
            "karli": {
                name: "Balkan Soğuğu & Karlı",
                weather: "snowy",
                mean: 4.9,
                max: 8.2,
                min: 2.1,
                rainMm: 69.0,
                descDay: "Karlı ve Soğuk (❄️)",
                descNight: "Ayaz ve Karlı Gece (❄️)"
            }
        }
    },
    activeClimateRegime: "iliman",
    rainMmPerHour: 0,
    accumulatedRainMm: 0,

    // KARAYOLU GERÇEKÇİ ÇEVRE VE YOL UNSURLARI DURUMU
    tunnelDistance: null,
    isInsideTunnel: false,
    tunnelLengthRemaining: 0,
    lastTunnelSpawnDist: 0,

    bridgeDistance: null,
    isInsideBridge: false,
    bridgeLengthRemaining: 0,
    bridgeJointTraveled: 0,
    lastBridgeSpawnDist: 0,

    potholeDistance: null,
    potholeSide: 'right',
    lastPotholeSpawnDist: 0,

    trafficLightDistance: null,
    trafficLightState: 'red',
    trafficLightTimer: 0,
    lastTrafficLightBeep: 0,
    lastTrafficLightDist: 0,

    lastRareCrashDistance: 0,
    rainMmPerHour: 0,
    accumulatedRainMm: 0,

    // TEKİRDAĞ DİNAMİK YAĞIŞ FORMÜLÜ (mm/saat)
    // Tekirdağ iklim normalleri ve çift harmonik atmosferik dalga ile anlık yağış debisi hesabı
    calculateRainMillimeter(clockMin) {
        if (this.weather !== 'rainy') {
            this.rainMmPerHour = 0;
            return 0;
        }
        const t = clockMin || this.clockMinutes || 720;
        // 1. Dalga: 40 dakikalık bulut kümesi yoğunluğu (genlik 2.8)
        // 2. Dalga: 12 dakikalık sağanak rüzgar dalgası (genlik 1.5)
        const wave1 = Math.sin((t / 20) * Math.PI);
        const wave2 = Math.cos((t / 6) * Math.PI);
        
        // Tekirdağ yağış rejimi: Temel 5.2 mm/saat + dalgalar
        let mm = 5.2 + (wave1 * 2.8) + (wave2 * 1.5);
        mm = Math.max(1.2, Math.min(18.0, mm));
        this.rainMmPerHour = Math.round(mm * 10) / 10;
        
        // Yağmur kademesi ve ses motoru eşleşmesi (1..4)
        let newIntensity = 1;
        if (this.rainMmPerHour <= 3.0) newIntensity = 1;       // Çisenti (1.2 - 3.0 mm/s)
        else if (this.rainMmPerHour <= 7.0) newIntensity = 2;  // Normal yağmur (3.1 - 7.0 mm/s)
        else if (this.rainMmPerHour <= 12.0) newIntensity = 3; // Sağanak (7.1 - 12.0 mm/s)
        else newIntensity = 4;                                 // Şiddetli Tekirdağ sağanağı (12.1+ mm/s)
        
        if (this.rainIntensity !== newIntensity) {
            this.rainIntensity = newIntensity;
            if (typeof audio !== 'undefined' && typeof audio.setRainIntensity === 'function') {
                audio.setRainIntensity(this.rainIntensity);
            }
        }
        return this.rainMmPerHour;
    },

    setClimateRegime(key) {
        if (!this.tekirdagClimate.regimes[key]) return null;
        this.activeClimateRegime = key;
        const reg = this.tekirdagClimate.regimes[key];
        this.weather = reg.weather;
        if (typeof audio !== 'undefined' && typeof audio.stopWeather === 'function') {
            audio.stopWeather();
        }
        if (this.weather === 'snowy') {
            if (typeof audio !== 'undefined' && audio.startWeather) audio.startWeather('snowy');
        } else if (this.weather === 'rainy') {
            this.rainIntensity = reg.rainIntensity || 2;
            if (typeof audio !== 'undefined' && audio.startWeather) audio.startWeather('rainy', this.rainIntensity);
        }
        const halfRange = (reg.max - reg.min) / 2;
        const midTemp = (reg.max + reg.min) / 2;
        const diurnalCycle = Math.cos(((this.clockMinutes - 870) / 720) * Math.PI);
        let baseTemp = midTemp + (diurnalCycle * halfRange);
        if (this.weather === 'snowy') baseTemp -= 2.0;
        else if (this.weather === 'rainy') baseTemp -= 1.5;
        this.temperature = Math.round(baseTemp);
        return reg.name;
    },

    cycleClimateRegime() {
        const keys = ['iliman', 'sicak', 'yagmurlu', 'karli'];
        const currentIdx = keys.indexOf(this.activeClimateRegime);
        const nextKey = keys[(currentIdx + 1) % keys.length];
        return this.setClimateRegime(nextKey);
    },

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
    currentCompassDirection: "Kuzey",
    currentCompassAngle: 0,
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
    lastFoundLostItem: null,
    activePassengerEvent: null,
    insufficientBalanceTriggeredAtStop: false,
    kindnessBonusCount: 0,
    activeRunningPassenger: false,
    runningPassengerTriggeredAtStop: false,
    runningPassengerTimer: null,
    runningPassengerBonusCount: 0,
    timingDeviations: [],

    toggleWheelchairRamp: function() {
        if (this.isDriving && this.speed > 3) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Güvenlik: Araç hareket halindeyken rampa açılamaz.");
            return;
        }
        this.isRampDeployed = !this.isRampDeployed;
        const rampEl = document.getElementById('hud-ramp');
        if (this.isRampDeployed) {
            this.rampUsedInRoute = true;
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
            const msg = "Bagaj kapakları kilitlendi. Sefer için hazır.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        }
    },

    reportIBISStatus: function() {
        if (typeof audio !== 'undefined' && typeof audio.playIBISChime === 'function') audio.playIBISChime();
        const r = this.activeRouteData;
        if (!r) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Hat Tabelası: Şu anda aktif bir sefer bulunmuyor.");
            return;
        }
        const start = r.startStop || (r.stops[0] ? r.stops[0].name : "Başlangıç");
        const end = r.endStop || (r.stops[r.stops.length - 1] ? r.stops[r.stops.length - 1].name : "Son Durak");
        const lineCode = (r.hatNo || "26").toUpperCase();
        const msg = `Hat Tabelası: TEKULAŞ Hat ${lineCode}. Güzergah: ${start} kalkışlı, ${end} varışlı.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
    },

    // AKILLI KOKPİT SIRADAKİ DURAK NAVİGASYONU (N Tuşu)
    announceNextStopNavigation: function() {
        if (typeof audio !== 'undefined' && typeof audio.playNavChime === 'function') {
            audio.playNavChime(false);
        } else if (typeof audio !== 'undefined' && typeof audio.playSwitchClick === 'function') {
            audio.playSwitchClick();
        }

        const r = this.activeRouteData;
        if (!r || !r.stops || r.stops.length === 0) {
            const msg = "Aktif bir sefer rotası bulunmuyor kaptanım.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            return;
        }

        const nextStop = r.stops[this.currentStopIndex];
        const isLastStop = (this.currentStopIndex >= r.stops.length - 1);
        const stopName = nextStop ? nextStop.name : (r.endStop || "Son Durak");
        const remDist = Math.max(0, Math.round(this.currentDistanceToNext || 0));
        const distStr = remDist >= 1000 ? (remDist / 1000).toFixed(1) + " kilometre" : remDist + " metre";

        // Tahmini varış süresi (ETA)
        let sec = 0;
        if (this.speed >= 5) {
            const speedMps = this.speed * (1000 / 3600);
            sec = Math.max(1, Math.round(remDist / speedMps));
        } else {
            // Otobüs duruyor veya yavaşsa şehir içi ortalama 35 km/s seyir hızı baz alınır
            sec = Math.max(1, Math.round(remDist / (35 * 1000 / 3600)));
        }

        let etaStr = "";
        if (sec < 60) {
            etaStr = sec + " saniye";
        } else {
            const mins = Math.floor(sec / 60);
            const remSec = sec % 60;
            etaStr = remSec > 0 ? `${mins} dakika ${remSec} saniye` : `${mins} dakika`;
        }

        // Pusula ve İstikamet bilgisi
        let headingStr = "";
        if (typeof CompassSystem !== 'undefined') {
            const curDir = CompassSystem.currentDirection || "Kuzey";
            const prevStop = (this.currentStopIndex > 0) ? r.stops[this.currentStopIndex - 1] : null;
            if (nextStop && nextStop.lat && nextStop.lon && prevStop && prevStop.lat && prevStop.lon) {
                const bearing = CompassSystem.calculateBearing(prevStop.lat, prevStop.lon, nextStop.lat, nextStop.lon);
                const targetCard = CompassSystem.getCardinalFromBearing(bearing);
                if (targetCard.name === curDir) {
                    headingStr = `İstikamet: ${curDir} (Durakla tam hizada).`;
                } else {
                    headingStr = `İstikamet: ${curDir} (Durak ${targetCard.name} yönünde).`;
                }
            } else {
                headingStr = "İstikamet: " + curDir + ".";
            }
        }

        const prefix = isLastStop ? "Son durak: " : "Sıradaki durak: ";
        const msg = `${prefix}${stopName}. Kalan mesafe: ${distStr}. Tahmini varış süresi: ${etaStr}. ${headingStr}`.trim();

        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(msg, 'info');
    },

    // SEFER SONU VE GENEL HAT NAVİGASYONU (Ctrl + N ve Shift + N)
    announceDestinationNavigation: function() {
        if (typeof audio !== 'undefined' && typeof audio.playNavChime === 'function') {
            audio.playNavChime(true);
        } else if (typeof audio !== 'undefined' && typeof audio.playSwitchClick === 'function') {
            audio.playSwitchClick();
        }

        const r = this.activeRouteData;
        if (!r || !r.stops || r.stops.length === 0) {
            const msg = "Aktif bir sefer rotası bulunmuyor kaptanım.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            return;
        }

        const lastStopObj = (r.stops && r.stops.length > 0) ? r.stops[r.stops.length - 1] : null;
        const endStopName = r.endStop || (lastStopObj ? lastStopObj.name : "Son Durak");
        const remainingStopsCount = Math.max(1, r.stops.length - this.currentStopIndex);

        // Kalan toplam hat mesafesi (Sıradaki durağa kalan + sonraki tüm duraklar arasındaki mesafeler)
        let totalRemMeters = Math.max(0, Math.round(this.currentDistanceToNext || 0));
        for (let i = this.currentStopIndex; i < r.stops.length - 1; i++) {
            const st = r.stops[i];
            const dKm = (st && typeof st.gercekMesafeSonraki === 'number' && st.gercekMesafeSonraki > 0)
                ? st.gercekMesafeSonraki
                : 1.1; // Ortalama 1.1 km
            totalRemMeters += Math.round(dKm * 1000);
        }

        const totalDistStr = totalRemMeters >= 1000 
            ? (totalRemMeters / 1000).toFixed(1) + " kilometre" 
            : totalRemMeters + " metre";

        // Sefer sonuna toplam tahmini varış süresi (Şehir içi sürüş + ara durak bekleme süreleri)
        const totalDriveSec = Math.round(totalRemMeters / (30 * 1000 / 3600)); // 30 km/s ortalama
        const stopDwellSec = Math.max(0, (remainingStopsCount - 1) * 25); // Her durak için ~25 sn
        const totalSec = totalDriveSec + stopDwellSec;
        const totalMins = Math.max(1, Math.round(totalSec / 60));
        const totalEtaStr = totalMins + " dakika";

        let destHeadingStr = "";
        if (typeof CompassSystem !== 'undefined' && r.stops && r.stops.length >= 2) {
            const s1 = r.stops[0];
            const sEnd = r.stops[r.stops.length - 1];
            if (s1.lat && s1.lon && sEnd.lat && sEnd.lon) {
                const b = CompassSystem.calculateBearing(s1.lat, s1.lon, sEnd.lat, sEnd.lon);
                const c = CompassSystem.getCardinalFromBearing(b);
                destHeadingStr = ` Sefer genel yönü: ${c.name}.`;
            }
        }

        let msg = "";
        if (remainingStopsCount <= 1) {
            msg = `Sefer son durağındasınız: ${endStopName}. Kalan mesafe: ${totalDistStr}. Tahmini varış süresi: ${totalEtaStr}.${destHeadingStr} Hat: ${r.name || "Aktif Hat"}.`;
        } else {
            msg = `Sefer son durağı: ${endStopName}. Kalan toplam hat mesafesi: ${totalDistStr}. Kalan durak sayısı: ${remainingStopsCount} durak. Tahmini toplam varış süresi: ${totalEtaStr}.${destHeadingStr} Hat: ${r.name || "Aktif Hat"}.`;
        }

        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(msg, 'info');
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
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Koltuklar zaten kontrol edildi. Tüm eşyalar TEKULAŞ Emanet Bürosuna teslim edildi.");
            return;
        }
        this.hasLostItemFound = true;

        const items = [
            { name: "deri bir cüzdan ve kimlik kartı", reward: 120, xp: 60, toast: "👛 Deri Cüzdan ve Kimlik Bulundu (+120 ₺)" },
            { name: "üniversite öğrencisinin unuttuğu sırt çantası", reward: 100, xp: 50, toast: "🎒 Öğrenci Sırt Çantası Bulundu (+100 ₺)" },
            { name: "unutulmuş otomatik bir protokol şemsiyesi", reward: 80, xp: 40, toast: "☂️ Protokol Şemsiyesi Bulundu (+80 ₺)" },
            { name: "unutulmuş bir çocuk montu ve atkı", reward: 90, xp: 45, toast: "🧸 Çocuk Montu ve Atkı Bulundu (+90 ₺)" }
        ];
        const selected = items[Math.floor(Math.random() * items.length)];
        this.lastFoundLostItem = selected;

        if (typeof audio !== 'undefined' && typeof audio.playLostAndFoundWalk === 'function') {
            audio.playLostAndFoundWalk(() => {
                this.addMoney(selected.reward);
                this.addXP(selected.xp);
                const msg = `Arka koltukta ${selected.name} bulundu ve TEKULAŞ Emanet Bürosuna teslim edildi! ${selected.reward} Lira dürüst şoför primi ve ${selected.xp} tecrübe kazandınız.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(selected.toast, "success");
            });
        } else {
            this.addMoney(selected.reward);
            this.addXP(selected.xp);
            const msg = `Arka koltukta ${selected.name} bulundu ve TEKULAŞ Emanet Bürosuna teslim edildi! ${selected.reward} Lira dürüst şoför primi kazandınız.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(selected.toast, "success");
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
                            if (data.activeDistrict) {
                                this.activeDistrict = data.activeDistrict;
                                try { localStorage.setItem('activeDistrict', this.activeDistrict); } catch(e) {}
                            }
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
            localStorage.setItem('playerXP', this.playerXP);
            localStorage.setItem('completedTasks', this.completedTasks);
            localStorage.setItem('para', this.playerBudget);
            localStorage.setItem('clockMinutes', this.clockMinutes);
            localStorage.setItem('unlockedCities', JSON.stringify(this.unlockedCities));
            localStorage.setItem('merkezUs', this.currentCity);
            localStorage.setItem('activeDistrict', this.activeDistrict || "Süleymanpaşa");
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
                    currentCity: this.currentCity,
                    activeDistrict: this.activeDistrict || "Süleymanpaşa"
                }).catch(e => {
                    console.error("Firebase save error", e);
                });
            }
        } catch (e) {
            console.error("Firebase senkronizasyon hatası (Senkron denendi ama başarısız oldu)", e);
        }
    },

    getLicenseTitle: function() {
        let equipped = null;
        if (typeof DriverBadges !== 'undefined' && typeof DriverBadges.getEquippedTitle === 'function') {
            equipped = DriverBadges.getEquippedTitle();
        }
        const careerTitle = (typeof CareerMissions !== 'undefined' && CareerMissions.getLevelTitle)
            ? CareerMissions.getLevelTitle(this.completedTasks)
            : `${this.licenseLevel}. Seviye Şehir İçi Sürücü`;

        if (equipped && equipped.name && equipped.id !== 'title_cirak') {
            return `${equipped.icon} ${equipped.name} (${careerTitle})`;
        }
        return careerTitle;
    },

    completeTask: function(comfortMsg, timingRewardMsg) {
        if (!this.activeRouteId) return;

        const stopsCount = (this.activeRouteData && this.activeRouteData.stops) ? this.activeRouteData.stops.length : 6;
        
        let earnedXP = 100 + (stopsCount * 15);
        let bonusDetails = [];

        // 1. İpek Fren & Yolcu Konforu Primi
        if (this.passengerComfort >= 90) {
            earnedXP += 75;
            bonusDetails.push("İpek Fren & Üstün Konfor (+75 XP)");
        } else if (this.passengerComfort >= 75) {
            earnedXP += 35;
        }

        // 2. Erişilebilirlik & Engelli Rampası Primi
        if (this.isRampDeployed || this.hasWheelchairPassengerAtStop) {
            earnedXP += 50;
            bonusDetails.push("Erişilebilirlik Primi (+50 XP)");
        }

        // 3. Gece Seferi Primi
        if (this.clockMinutes < 360 || this.clockMinutes >= 1140) {
            earnedXP += 60;
            bonusDetails.push("Gece Nöbet Primi (+60 XP)");
        }

        const oldLevel = this.licenseLevel;
        this.playerXP += earnedXP;
        const newLevel = this.calculateLevelFromXP(this.playerXP);
        this.licenseLevel = Math.max(oldLevel, newLevel);
        this.completedTasks++;
        this.saveData();

        const nextThreshold = this.getNextLevelXP(this.licenseLevel);
        const remainingXP = Math.max(0, nextThreshold - this.playerXP);

        const extraNotes = (comfortMsg || "") + (timingRewardMsg || "");

        if (newLevel > oldLevel) {
            if (typeof audio !== 'undefined' && audio.playSuccess) {
                try { audio.playSuccess(); } catch(e) {}
            }
            const lvlMsg = `Tebrikler kaptan! Sefer başarıyla tamamlandı.${extraNotes} Seferden +${earnedXP} XP kazandınız ve Seviye ${newLevel}'e terfi ettiniz! Yeni unvanınız: ${this.getLicenseTitle()}.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(lvlMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🎉 TERFİ: Seviye ${newLevel}! (${this.getLicenseTitle()})`, "success");
        } else {
            const reportMsg = `Tebrikler kaptan, sefer tamamlandı.${extraNotes} Kazanılan: +${earnedXP} XP. Seviye ${this.licenseLevel + 1}'e kalan: ${remainingXP} XP.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(reportMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏁 Sefer Bitti: +${earnedXP} XP (Kalan: ${remainingXP} XP)`, "info");
        }

        UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, this.getLicenseTitle());

        // WAAW! KADEMELİ SİSTEM AÇILIŞLARI VE KUTLAMA KARTI
        this.triggerProgressiveWowAnnouncement(this.completedTasks);
    },

    triggerProgressiveWowAnnouncement: function(completed) {
        const box = document.getElementById('res-wow-unlock-box');
        const titleEl = document.getElementById('res-wow-title');
        const descEl = document.getElementById('res-wow-desc');
        const iconEl = document.getElementById('res-wow-icon');

        if (!box || !titleEl || !descEl) return;

        let wowData = null;

        if (completed === 1) {
            wowData = {
                icon: "💳",
                title: "WAAW! 2. GÖREV AÇILDI: TEKİRDAĞ KART & AKBİL SİSTEMİ!",
                desc: "Harika bir ilk sürüştü kaptanım! Artık otobüsünüze binen yolcular Tekirdağ Kart (Akbil) basacak ve gerçek validatör sinyalleri çalacak!",
                speech: "Tebrikler kaptanım! İlk görevi tamamladınız. 2. Görev açıldı! Artık yolcularınız akbil basacak!"
            };
        } else if (completed === 2) {
            wowData = {
                icon: "🔔",
                title: "WAAW! 3. GÖREV AÇILDI: AKUSTİK DURACAK ZİLİ & ARKA KAPI!",
                desc: "Simülasyon derinleşiyor! İnecek yolcular artık durağa 200 metre kala 'DURACAK' butonuna basacak. Zil çalınca durakta durup Q tuşu ile Arka Kapıyı açmalısınız!",
                speech: "Vay canına! 3. Görev açıldı! Akustik Duracak Zili ve Arka Kapı devreye girdi!"
            };
        } else if (completed === 3) {
            wowData = {
                icon: "♿",
                title: "WAAW! 4. GÖREV AÇILDI: ENGELLİ RAMPASI & KNEELING SİSTEMİ!",
                desc: "Gerçekçi belediyecilik simülasyonu! Durakta tekerlekli sandalyeli vatandaş beklediğinde 'U' tuşuna basarak rampayı açabilir ve otobüsü yana yatırabilirsiniz!",
                speech: "Vay canına! 4. Görev açıldı! Engelli rampası ve yana yatma sistemi açıldı!"
            };
        } else if (completed === 5) {
            wowData = {
                icon: "📻",
                title: "WAAW! 6. GÖREV AÇILDI: TEKULAŞ CANLI TELSİZ & HAVA DURUMU!",
                desc: "TEKULAŞ Hareket Merkezi amirliği hatta bağlandı! 'T' tuşuna basarak canlı telsiz anonslarını dinleyebilirsiniz. Yağmur başladığında 'X' ile silecekleri çalıştırın!",
                speech: "Vay canına! 6. Görev açıldı! Canlı belediye telsizi ve dinamik hava durumu açıldı!"
            };
        } else if (completed === 7) {
            wowData = {
                icon: "⚙️",
                title: "WAAW! 8. GÖREV AÇILDI: PNÖMATİK HAVA FRENİ & KOMPRESÖR SİSTEMİ!",
                desc: "Endüstriyel otobüs simülasyonu devrede! Kademeli fren yapın; hava tüpleri 4 bar altına düşerse imdat kilitlenir! Rölantide gaz verip havayı doldurun!",
                speech: "Vay canına! 8. Görev açıldı! Gerçek hava freni ve kompresör simülasyonu devrede!"
            };
        } else if (completed === 9) {
            wowData = {
                icon: "🏁",
                title: "WAAW! 10. GÖREV: BÜYÜK FİNAL SEFERİ!",
                desc: "Kaptanım, Çıraklık seviyesinin son ve en büyük görevi! Bu görevi tamamlarsanız KALFA KAPTAN olacak ve 18 metrelik dev körüklü otobüsü kazanacaksınız!",
                speech: "Büyük final zamanı kaptanım! 10. Görev açıldı! Bu görevi bitirince Kalfa Kaptan olacaksınız!"
            };
        } else if (completed === 10) {
            wowData = {
                icon: "🎆",
                title: "WAAW! İNANILMAZ BAŞARI: KALFA KAPTAN OLDUNUZ!",
                desc: "1. Seviyenin 10 görevini de tamamladınız! Oyun devasa bir Türkiye Turnesi'ne dönüştü: 🚌 18 Metrelik Körüklü Conecto garajınıza eklendi, 🏭 Çorlu ve Çerkezköy Metropol Hatları ile 🧭 Akıllı Rota Bulucu açıldı!",
                speech: "İNANILMAZ BİR BAŞARI KAPTANIM! WAAW! 1. Seviyenin 10 görevini tamamlayıp KALFA KAPTANLIĞA yükseldiniz! 18 metrelik körüklü otobüs ve tüm Tekirdağ ilçeleri emrinize açıldı!"
            };
        }

        if (wowData) {
            box.classList.remove('hidden');
            if (iconEl) iconEl.innerText = wowData.icon;
            titleEl.innerText = wowData.title;
            descEl.innerText = wowData.desc;
            
            setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.playSuccess) {
                    try { audio.playSuccess(); } catch(e) {}
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(wowData.speech);
                }
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
                    audio.updateNvdaLiveRegion(wowData.speech);
                }
            }, 600);
        } else {
            box.classList.add('hidden');
        }
    },

        addXP: function(amount) {
        if (!amount || amount <= 0) return;
        this.playerXP = (this.playerXP || 0) + amount;
        const newLevel = this.calculateLevelFromXP(this.playerXP);
        if (newLevel > this.licenseLevel) {
            this.licenseLevel = newLevel;
        }
        this.saveData();
        if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
            UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, this.getLicenseTitle());
        }
    },
    // --- OTOBÜS İÇİ İKRAM & MUAVİN SERVİSİ (I TUŞU) ---
    serveCatering: function() {
        if (!this.passengersOnBoard || this.passengersOnBoard <= 0) {
            const noPassMsg = "Otobüste yolcu bulunmuyor. İkram servisi duraktan yolcu aldıktan sonra yapılır.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(noPassMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(noPassMsg, "info");
            return;
        }

        const now = Date.now();
        if (this.lastCateringTime && (now - this.lastCateringTime < 25000)) {
            const waitSeconds = Math.ceil((25000 - (now - this.lastCateringTime)) / 1000);
            const waitMsg = `Yolcular henüz ikramlarını bitirmedi. Yeni servis için ${waitSeconds} saniye bekleyiniz.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(waitMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(waitMsg, "info");
            return;
        }
        this.lastCateringTime = now;

        let compName = "Mikyas Seyahat";
        let pkgType = "standart";
        let pkgName = "Çay, Kahve & Taze Kek";
        let tipBase = 35;
        let ratingBonus = 0.1;

        if (typeof CompanySystem !== 'undefined') {
            const empId = CompanySystem.data && CompanySystem.data.corporateEmployer;
            const empComp = empId ? CompanySystem.getCompanyById(empId) : null;
            if (empComp) {
                compName = empComp.name;
                pkgType = empComp.cateringPackage || "standart";
            } else if (CompanySystem.data) {
                compName = CompanySystem.data.companyName || "Mikyas Seyahat";
                pkgType = CompanySystem.data.cateringPackage || "standart";
            }
        }

        if (pkgType === 'ekonomik') {
            pkgName = "Sıcak Çay, Su & Kek";
            tipBase = 20;
        } else if (pkgType === 'vip') {
            pkgName = "Jumbo VIP: Taze Meyve Suyu, Sıcak Sandviç & Dondurma";
            tipBase = 70;
            ratingBonus = 0.2;
        }

        let tipMultiplier = 1.0;
        if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.getInstitutionLevel === 'function') {
            const cateringLvl = CompanySystem.getInstitutionLevel('catering_logistics');
            if (cateringLvl === 2) {
                tipMultiplier = 1.30; // +%30 bahşiş
                ratingBonus *= 1.5;
            } else if (cateringLvl === 3) {
                tipMultiplier = 1.75; // +%75 bahşiş
                ratingBonus *= 2.5;
            }
        }
        const tipMoney = Math.round((tipBase + (this.passengersOnBoard * 4)) * tipMultiplier);
        this.addMoney(tipMoney, true); // Bahşiş doğrudan kaptana kalır

        if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.boostSatisfaction === 'function') {
            CompanySystem.boostSatisfaction(ratingBonus);
        }

        if (typeof audio !== 'undefined' && typeof audio.playChime === 'function') {
            audio.playChime();
        }

        const caterAnnouncement = `Ding-dong! Değerli yolcularımız, ${compName} ikram servisimiz başlamıştır. Muavinimiz kolonya ve ${pkgName} ikramı yapmaktadır. Afiyet olsun!`;
        const thankMsg = `Yolcular: 'Eline sağlık muavin bey, çok makbule geçti!' Yolcular kaptana toplam +${tipMoney} ₺ bahşiş bıraktı.`;

        if (typeof audio !== 'undefined' && audio.speakSequence) {
            audio.speakSequence([caterAnnouncement, thankMsg]);
        } else if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(caterAnnouncement + " " + thankMsg);
        }

        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`☕ ${compName} İkramı Dağıtıldı! (+${tipMoney} ₺ Bahşiş)`, "success");
        }

        const passFeedback = document.getElementById('passenger-feedback');
        if (passFeedback) {
            passFeedback.innerText = `☕ İkram Servisi: ${pkgName} dağıtıldı. (+${tipMoney} ₺ Kaptan Bahşişi)`;
            passFeedback.style.color = '#38bdf8';
        }
    },

    // --- OTOGAR PERON HAREKET ANONSU ---
    playTerminalDepartureAnnouncement: function() {
        let compName = "Mikyas Seyahat";
        if (typeof CompanySystem !== 'undefined') {
            const empId = CompanySystem.data && CompanySystem.data.corporateEmployer;
            const empComp = empId ? CompanySystem.getCompanyById(empId) : null;
            if (empComp && empComp.name) compName = empComp.name;
            else if (CompanySystem.data && CompanySystem.data.companyName) compName = CompanySystem.data.companyName;
        }
        const rName = (this.activeRouteData && this.activeRouteData.name) ? this.activeRouteData.name : "Şehirlerarası Sefer";
        const peronNo = (this.activeRouteData && this.activeRouteData.hatNo) ? parseInt(this.activeRouteData.hatNo) || 12 : 12;
        const msg = `Dikkat lütfen! Sayın yolcularımız; ${compName} bünyesinde ${rName} seferini gerçekleştirecek olan otobüsümüz ${peronNo} numaralı perondan hareket etmek üzeredir. Biletli yolcularımızın araçtaki yerlerini almaları rica olunur. ${compName} iyi yolculuklar diler.`;

        if (typeof audio !== 'undefined' && audio.playChime) audio.playChime();
        if (typeof audio !== 'undefined' && audio.speak) {
            setTimeout(() => audio.speak(msg), 400);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`📢 ${compName}: Peron ${peronNo} Seferi Başlıyor!`, "info");
        }
    },

    addMoney: function(amount, isDirect = false) {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            return { captainShare: 0, companyShare: 0, companySharePercent: 50, totalFare: 0 };
        }

        if (isDirect) {
            this.playerBudget += amount;
            this.sessionMoney += amount;
            this.saveData();
            if (typeof UI !== 'undefined' && typeof UI.updatePlayerStats === 'function') {
                UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, this.getLicenseTitle());
            }
            return { captainShare: amount, companyShare: 0, companySharePercent: 0, totalFare: amount };
        }

        // Hasılat Paylaşım Oranını Belirle (Varsayılan %50 Şirkete Aktarılır, %50 Kaptana Kalır - Serbestçe Ayarlanabilir)
        let sharePercent = 50;
        if (typeof CompanySystem !== 'undefined') {
            const empId = CompanySystem.data && CompanySystem.data.corporateEmployer;
            if (empId) {
                const comp = CompanySystem.getCompanyById(empId);
                if (comp && typeof comp.companySharePercent === 'number') {
                    sharePercent = comp.companySharePercent;
                } else if (CompanySystem.data && typeof CompanySystem.data.revenueSharePercent === 'number') {
                    sharePercent = CompanySystem.data.revenueSharePercent;
                }
            } else if (CompanySystem.data && typeof CompanySystem.data.revenueSharePercent === 'number') {
                sharePercent = CompanySystem.data.revenueSharePercent;
            }
        }

        // %50 Şirket Kasasına Aktar, %50 Kaptan Cüzdanında Kalsın
        const companyShare = Math.round(amount * (sharePercent / 100));
        const captainShare = amount - companyShare;

        this.playerBudget += captainShare;
        this.sessionMoney += captainShare;
        this.saveData();

        if (companyShare > 0 && typeof CompanySystem !== 'undefined' && typeof CompanySystem.addCompanyRevenue === 'function') {
            CompanySystem.addCompanyRevenue(companyShare);
        }

        if (typeof UI !== 'undefined' && typeof UI.updatePlayerStats === 'function') {
            UI.updatePlayerStats(this.licenseLevel, this.completedTasks, this.playerBudget, this.getLicenseTitle());
        }

        return {
            captainShare: captainShare,
            companyShare: companyShare,
            companySharePercent: sharePercent,
            totalFare: amount
        };
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

    isRouteAccessible: function(routeId) {
        const route = (typeof routesData !== 'undefined' && routesData[routeId]) ? routesData[routeId] : null;
        if (!route) {
            return { allowed: true };
        }
        if (this.playMode === 'free_drive') {
            return { allowed: true };
        }

        const completed = (typeof this.completedTasks === 'number') ? this.completedTasks : 0;
        const currentLic = (typeof this.licenseLevel === 'number') ? this.licenseLevel : 1;

        // 1. Sıralı Görev Kontrolü: Seviye 1 Görevleri (Görev 1'den 10'a kadar)
        if (typeof route.taskIndex === 'number') {
            // Başlangıçta 1. Görev (taskIndex: 0) her zaman serbestçe açıktır
            if (route.taskIndex === 0) {
                return { allowed: true };
            }
            // Sıradaki görevden ilerideki tüm görevler kilitli ve kapalıdır
            if (route.taskIndex > completed) {
                const activeTaskNumber = completed + 1;
                const requestedTaskNumber = route.taskIndex + 1;
                return {
                    allowed: false,
                    reason: `Mikyas Kaptanlık Akademisi Kuralı: Bir seviye tamamlanmadan diğer seviyelere başlanamaz! Görev ${requestedTaskNumber} henüz kilitli ve kapalıdır. Lütfen önce Görev ${activeTaskNumber}'i başarıyla tamamlayın.`
                };
            }
            // Tamamlanmış veya mevcut aktif görev serbestçe erişilebilir
            return { allowed: true };
        }

        // 2. Ehliyet / Lisans Seviyesi Kontrolü
        if (typeof route.licenseLevel === 'number' && route.licenseLevel > currentLic) {
            return {
                allowed: false,
                reason: `Bu seviye için ${route.licenseLevel}. Seviye ehliyet gereklidir. Mevcut seviyeniz: ${currentLic}. Lütfen önceki seviyeleri tamamlayın.`
            };
        }

        // 3. Şehirlerarası & İlçe Seferleri Koruması (10 Seviye Kuralı)
        const isIntercity = !!route.isIntercity;
        const isDistrict = !!(
            route.isDistrict || 
            route.district === 'İlçeler Arası' || 
            (route.originDistrict && route.destDistrict && route.originDistrict !== route.destDistrict)
        );

        // Şehir içi ve mahalle içi navigasyon seferleri (Süleymanpaşa, Saray, Velimeşe ve tüm iller) serbesttir
        const isIntraCityNav = !!(route.isCity || route.isSuleymanpasaLocked || route.isVelimeseLocked || (route.originDistrict && route.destDistrict && route.originDistrict === route.destDistrict));

        if (!isIntraCityNav && (isIntercity || isDistrict) && !this.hasPassedLevel10()) {
            return {
                allowed: false,
                reason: `Mikyas Kaptanlık Akademisi Kuralı: Şehirlerarası ve ilçe seviyelerine geçebilmek için önce 1. Seviye Şehir İçi Seferlerini (10 Görevi) tamamlamalısınız! Mevcut tamamlanan: ${completed} / 10 görev.`
            };
        }

        return { allowed: true };
    },

    startRoute: function(routeId) {
        // Akademi otomatik onayı
        this.academyCompleted = true;
        try { localStorage.setItem('academyCompleted', 'true'); } catch(e) {}

        // PEDAGOJİK SEVİYE KORUMASI: Bir seviye tamamlanmadan diğer seviyelere başlanamaz!
        const accessCheck = this.isRouteAccessible(routeId);
        if (!accessCheck.allowed) {
            if (typeof audio !== 'undefined' && audio.playWarning) {
                try { audio.playWarning(); } catch(e) {}
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(accessCheck.reason);
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(accessCheck.reason, 'warning');
            }
            if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
                audio.updateNvdaLiveRegion(accessCheck.reason);
            }
            return false;
        }

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
        this.fuelTankCapacity = (typeof this.getFuelCapacity === 'function') ? this.getFuelCapacity() : (this.fuelTankCapacity || 500);
        if (this.currentFuelLiters === undefined || this.currentFuelLiters <= 0) {
            this.currentFuelLiters = this.fuelTankCapacity;
        } else if (this.currentFuelLiters > this.fuelTankCapacity) {
            this.currentFuelLiters = this.fuelTankCapacity;
        }
        this.fuelWarned15 = false;
        this.fuelWarned5 = false;
        this.totalDrivingSeconds = 0;
        this.activeRouteData = routesData[routeId];
        this.passengerComfort = 100;
        this.stopRequestBellTriggered = false;
        if (this.currentStopIndex === 0 && !isResume && !this.terminalAnnouncedForRoute) {
            this.terminalAnnouncedForRoute = true;
            this.playTerminalDepartureAnnouncement();
        }
        this.lastRecordedSpeed = 0;
        this.lastHarshBrakeWarningTime = 0;
        this.isRampDeployed = false;
        this.isLuggageOpen = false;
        this.hasLostItemFound = false;
        this.terminalAnnouncedForRoute = false;
        this.lastFoundLostItem = null;
        this.activePassengerEvent = null;
        this.insufficientBalanceTriggeredAtStop = false;
        this.kindnessBonusCount = 0;
        this.activeRunningPassenger = false;
        this.runningPassengerTriggeredAtStop = false;
        this.runningPassengerTimer = null;
        this.runningPassengerBonusCount = 0;
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
            let activeCompName = "MİKYAS TURİZM";
            if (typeof CompanySystem !== 'undefined') {
                const empId = CompanySystem.data && CompanySystem.data.corporateEmployer;
                const empComp = empId ? CompanySystem.getCompanyById(empId) : null;
                if (empComp && empComp.name) activeCompName = empComp.name.toUpperCase();
                else if (CompanySystem.data && CompanySystem.data.companyName) activeCompName = CompanySystem.data.companyName.toUpperCase();
            }
            ibisTextEl.innerText = `👑 ${activeCompName} | [${hNo}] ${sSt} ➔ ${eSt}`;
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

            // KADEMELİ PEDAGOJİK GÖREV BRİFİNGİ (Basitten Karmaşığa WAAW Tasarımı)
            const tIdx = (typeof r.taskIndex === 'number') ? r.taskIndex : 0;
            let howToDriveHtml = '';
            let shortcutsNote = '';

            if (tIdx === 0) {
                // Görev 1: Tamamen sade, kolay, eğlenceli ve sıcak
                howToDriveHtml = [
                    '<div style="background: rgba(34, 197, 94, 0.15); border: 1.5px solid #22c55e; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">',
                    '    <strong style="color: #22c55e; font-size: 1.1rem;">🌱 Seviye 1: Hoş Geldiniz Çırak Kaptan!</strong><br>',
                    '    <span style="color: #f1f5f9;">İlk seferinizde işiniz çok kolay ve eğlenceli: Sadece gaz verin, durakta durup ön kapıyı açın ve yolcunuzu alın! Başlangıçta hiçbir karmaşık mekanik yoktur. Rahatça sürüşün tadını çıkarın.</span>',
                    '</div>',
                    '<div style="margin-bottom: 8px; font-weight: bold; color: #facc15; font-size: 1.05rem;">🕹️ Nasıl Sürülür? (Temel Kontroller):</div>',
                    '<ul style="padding-left: 20px; font-size: 0.95rem; margin-bottom: 10px; line-height: 1.7;">',
                    '    <li><strong>W veya Yukarı Ok:</strong> Gaz verip ilerleyin.</li>',
                    '    <li><strong>S veya Aşağı Ok:</strong> Durakta yavaşlayıp durun.</li>',
                    '    <li><strong>A / D veya Sol / Sağ Ok:</strong> Şeridinizi koruyun.</li>',
                    '    <li><strong>E Tuşu:</strong> Ön kapıyı açıp yolcuları alın.</li>',
                    '    <li><strong>H Tuşu:</strong> Korna çalın.</li>',
                    '</ul>'
                ].join("");
                shortcutsNote = '<div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">💡 İpucu: Görevleri tamamladıkça; Akbil Kartı, Duracak Zili, Engelli Rampası, Belediye Telsizi ve Hava Freni gibi gerçekçi sistemler adım adım açılacaktır!</div>';
            } else if (tIdx === 1) {
                // Görev 2: Akbil ve Kart Okuyucu devrede
                howToDriveHtml = [
                    '<div style="background: rgba(56, 189, 248, 0.15); border: 1.5px solid #38bdf8; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">',
                    '    <strong style="color: #38bdf8; font-size: 1.1rem;">💳 Yeni Özellik: Tekirdağ Kart (Akbil) Devrede!</strong><br>',
                    '    <span style="color: #f1f5f9;">Kapıyı açtığınızda yolcular Tekirdağ Kart basacak ve validatörden gerçek onay bipleri duyacaksınız. Bilet gelirleri bütçenize eklenecektir.</span>',
                    '</div>',
                    '<div style="margin-bottom: 8px; font-weight: bold; color: #facc15; font-size: 1.05rem;">🕹️ Sürüş Kontrolleri:</div>',
                    '<ul style="padding-left: 20px; font-size: 0.95rem; margin-bottom: 10px; line-height: 1.7;">',
                    '    <li><strong>W / Yukarı Ok:</strong> Gaz | <strong>S / Aşağı Ok:</strong> Fren | <strong>A / D:</strong> Direksiyon</li>',
                    '    <li><strong>E:</strong> Ön Kapı (Yolcular kart basar) | <strong>H:</strong> Korna</li>',
                    '</ul>'
                ].join("");
                shortcutsNote = '<div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">💡 Kaptan İpucu: Duraklara yaklaşırken kademeli fren yaparak yolcuların rahat etmesini sağlayın.</div>';
            } else if (tIdx < 4) {
                // Görev 3-4: Duracak Zili & Arka Kapı devrede
                howToDriveHtml = [
                    '<div style="background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">',
                    '    <strong style="color: #f87171; font-size: 1.1rem;">🔔 Yeni Mekanik: Akustik Duracak Butonu & Arka Kapı (Q) Açıldı!</strong><br>',
                    '    <span style="color: #f1f5f9;">Durağa 200m kala inecek yolcu varsa Duracak zili çalar ve kırmızı ikaz lambası yanar. Durakta durup <strong>Q</strong> tuşu ile arka kapıyı açarak yolcuları indirin.</span>',
                    '</div>',
                    '<div style="margin-bottom: 8px; font-weight: bold; color: #facc15; font-size: 1.05rem;">🕹️ Sürüş ve Kapı Kontrolleri:</div>',
                    '<ul style="padding-left: 20px; font-size: 0.95rem; margin-bottom: 10px; line-height: 1.7;">',
                    '    <li><strong>W:</strong> Gaz | <strong>S:</strong> Fren | <strong>A / D:</strong> Direksiyon | <strong>H:</strong> Korna</li>',
                    '    <li><strong>E:</strong> Ön Kapı (Binen yolcular) | <strong>Q:</strong> Arka Kapı (İnen yolcular)</li>',
                    '</ul>'
                ].join("");
                shortcutsNote = '<div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">💡 Kaptan Kısayolları: <strong>G</strong> Görev Durumu | <strong>C</strong> Yolcu Konforu | <strong>R</strong> Hız Göstergesi.</div>';
            } else if (tIdx < 6) {
                // Görev 5-6: Engelli Rampası, Kneeling & Telsiz
                howToDriveHtml = [
                    '<div style="background: rgba(168, 85, 247, 0.15); border: 1.5px solid #c084fc; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">',
                    '    <strong style="color: #c084fc; font-size: 1.1rem;">♿ Yeni Sistem: Engelli Rampası & Kneeling (U) Açıldı!</strong><br>',
                    '    <span style="color: #f1f5f9;">Durakta tekerlekli sandalyeli yolcu beklediğinde <strong>U</strong> tuşuna basarak rampayı açın ve otobüsü yana yatırın. Ayrıca <strong>T</strong> tuşuyla canlı TEKULAŞ telsiz anonslarını dinleyebilirsiniz!</span>',
                    '</div>',
                    '<div style="margin-bottom: 8px; font-weight: bold; color: #facc15; font-size: 1.05rem;">🕹️ Sürüş ve Sistem Kontrolleri:</div>',
                    '<ul style="padding-left: 20px; font-size: 0.95rem; margin-bottom: 10px; line-height: 1.7;">',
                    '    <li><strong>W / S / A / D:</strong> Sürüş | <strong>E:</strong> Ön Kapı | <strong>Q:</strong> Arka Kapı</li>',
                    '    <li><strong>U:</strong> Engelli Rampası & Kneeling | <strong>T:</strong> TEKULAŞ Telsizi</li>',
                    '</ul>'
                ].join("");
                shortcutsNote = '<div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">💡 Kaptan Kısayolları: <strong>U</strong> Rampa | <strong>T</strong> Telsiz | <strong>C</strong> Konfor | <strong>Z</strong> Sefer Dakikliği.</div>';
            } else {
                // Görev 7-10: Tam Profesyonel Simülasyon
                howToDriveHtml = [
                    '<div style="background: rgba(234, 179, 8, 0.15); border: 1.5px solid #eab308; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">',
                    '    <strong style="color: #facc15; font-size: 1.1rem;">⚙️ Tam Profesyonel Sefer: Pnömatik Hava Freni & Telsiz Devrede!</strong><br>',
                    '    <span style="color: #f1f5f9;">Hava basıncını koruyun, kademeli frenleme yapın. Sefer saatine dakik riayet edin. 10. Görev bitiminde 18 metrelik körüklü otobüs ve tüm ilçeler açılacaktır!</span>',
                    '</div>',
                    '<div style="margin-bottom: 8px; font-weight: bold; color: #facc15; font-size: 1.05rem;">🕹️ Tam Kokpit Kontrolleri:</div>',
                    '<ul style="padding-left: 20px; font-size: 0.95rem; margin-bottom: 10px; line-height: 1.7;">',
                    '    <li><strong>W / S / A / D:</strong> Sürüş | <strong>E / Q:</strong> Kapılar | <strong>U:</strong> Rampa | <strong>T:</strong> Telsiz</li>',
                    '    <li><strong>X:</strong> Yağmur Silecekleri | <strong>L:</strong> Farlar | <strong>Z:</strong> Sefer Saati</li>',
                    '</ul>'
                ].join("");
                shortcutsNote = '<div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">💡 Kaptan Kısayolları: <strong>G</strong> Görev | <strong>U</strong> Rampa | <strong>P</strong> Bagaj | <strong>T</strong> Telsiz | <strong>C</strong> Konfor | <strong>Z</strong> Zamanlama.</div>';
            }

            const mission = (typeof CareerMissions !== 'undefined') ? CareerMissions.getMission(r.taskIndex || 0) : null;
            const isFreeDrive = (this.playMode === 'free_drive');
            
            let orderHtml = '';
            if (isFreeDrive) {
                orderHtml = [
                    '<div style="background: rgba(34, 197, 94, 0.15); border: 1.5px solid #22c55e; padding: 14px 18px; border-radius: 8px; margin-bottom: 14px;">',
                    '    <strong style="color: #4ade80; font-size: 1.15rem;">🛣️ SERBEST SÜRÜŞ VE PRATİK MODU</strong><br>',
                    '    <span style="color: #f1f5f9; line-height: 1.6; display: block; margin-top: 6px;">Bu modda herhangi bir görev kısıtlaması, saat veya süre sınırı, ceza veya kural baskısı yoktur. Kariyerinizde kazandığınız tüm araçları ve güzergâhları serbestçe deneyimleyebilir, sürüş pratiği yapabilirsiniz.</span>',
                    '</div>'
                ].join("");
            } else {
                const dispatcherText = (mission && mission.dispatcherOrder) ? mission.dispatcherOrder : (r.speechBriefing || "");
                const featureText = (mission && mission.featureUnlock) ? mission.featureUnlock : "Standart Hat Seferi";
                const rulesText = (mission && mission.rulesActive) ? mission.rulesActive : "Temel Emniyet Kuralları";
                
                orderHtml = [
                    '<div style="background: rgba(15, 23, 42, 0.9); border: 2px solid #38bdf8; padding: 16px 20px; border-radius: 10px; margin-bottom: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">',
                    '    <div style="color: #38bdf8; font-weight: bold; font-size: 1.1rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">',
                    '        <span>🎙️</span> <span>TEKULAŞ HAREKET AMİRLİĞİ RESMİ SEFER TALİMATI</span>',
                    '    </div>',
                    '    <p style="color: #f8fafc; font-size: 0.98rem; line-height: 1.7; margin: 0 0 12px 0; border-left: 3px solid #38bdf8; padding-left: 12px;">',
                    '        "' + dispatcherText + '"',
                    '    </p>',
                    '    <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 0.92rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">',
                    '        <div style="color: #fde047;"><strong>🚀 Açılan Donanım / Özellik:</strong> ' + featureText + '</div>',
                    '        <div style="color: #a78bfa;"><strong>⚖️ Yürürlükteki Kurallar:</strong> ' + rulesText + '</div>',
                    '        <div style="color: #4ade80;"><strong>⏱️ Zaman Kısıtlaması:</strong> KESİNLİKLE YOKTUR (Tamamen kendi temponuzda sürüş)</div>',
                    '    </div>',
                    '</div>'
                ].join("");
            }

            detailsContainer.innerHTML = [
                '<div style="font-size: 1.15rem; color: #38bdf8; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid rgba(56,189,248,0.3); padding-bottom: 6px;">📋 ' + r.name + '</div>',
                '<div style="background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #38bdf8; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px;">🏙️ <strong>Sefer Türü:</strong> ' + (r.district || Game.activeDistrict || "Tekirdağ") + ' Şehir İçi Belediye Seferi | <strong>Araç:</strong> TEKULAŞ Belediye Otobüsü</div>',
                orderHtml,
                '<div style="margin-bottom: 8px;">📍 <strong>Kalkış (Başlangıç) Durağı:</strong> <span style="color: #38bdf8; font-weight: bold;">' + startStop + '</span></div>',
                '<div style="margin-bottom: 8px;">🏁 <strong>Gidilecek Son Durak (Hedef):</strong> <span style="color: #22c55e; font-weight: bold;">' + endStop + '</span></div>',
                '<div style="margin-bottom: 8px;">🛑 <strong>Durulacak Duraklar Listesi (Sırasıyla):</strong><ol style="margin-left: 20px; margin-top: 6px; margin-bottom: 6px;">' + stopsHtml + '</ol></div>',
                '<div style="margin-bottom: 12px;">📊 <strong>Toplam Durak Sayısı:</strong> ' + r.stops.length + ' Durak</div>',
                '<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.15); margin: 12px 0;">',
                howToDriveHtml,
                shortcutsNote
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
        audio.stopEngine();
        if (typeof audio.speak === 'function') {
            audio.speak("Kaza sonrası aracınız durağa çekildi. Hareket etmek için Boşluk veya M tuşuna basarak motoru çalıştırın.");
        }
        
        // BUG FIX: Eğer kaza yapmadan önce özel bir hava durumu varsa geri getir
        if (this.weather !== 'sunny' && typeof audio.startWeather === 'function') {
            audio.startWeather(this.weather);
        }
        
        this.lastFrameTime = performance.now();
        this.nextNavSoundTime = this.lastFrameTime + 10000 + Math.random() * 20000;
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        this.copilotFirstStopWarned = false;
        if (window.voiceAssistant && window.voiceAssistant.isCopilotEnabled) {
            setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Seferiniz başladı. Boşluk tuşu ile motoru çalıştırıp W tuşuna basılı tutarak hareket ediniz. Pusula için Y tuşuna, yardım için F1 tuşuna basabilirsiniz.");
                }
            }, 1800);
        }
        
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
        this.rampUsedInRoute = false;
        this.retarderUsedInRoute = false;
        this.hasLostItemFound = false;
        
        // ZAMAN VE HAVA DURUMU SİSTEMİ
        audio.stopWeather(); // Mevcut hava olayını temizle
        this.isNight = (this.clockMinutes < 360 || this.clockMinutes >= 1080); // Gece başlangıcı kontrolü
        
        // TEKİRDAĞ İKLİM NORMALLERİ VE ATMOSFERİK SİSTEM (AY İSİMLERİNDEN BAĞIMSIZ)
        if (!this.activeClimateRegime || !this.tekirdagClimate.regimes[this.activeClimateRegime]) {
            const roll = Math.random();
            if (roll < 0.50) this.activeClimateRegime = "iliman";
            else if (roll < 0.75) this.activeClimateRegime = "sicak";
            else if (roll < 0.90) this.activeClimateRegime = "yagmurlu";
            else this.activeClimateRegime = "karli";
        }

        const regime = this.tekirdagClimate.regimes[this.activeClimateRegime];
        this.weather = regime.weather;

        // Gün içi astronomik sıcaklık salınımı (05:30 en düşük dip, 14:30 en yüksek tepe)
        const halfRange = (regime.max - regime.min) / 2;
        const midTemp = (regime.max + regime.min) / 2;
        const diurnalCycle = Math.cos(((this.clockMinutes - 870) / 720) * Math.PI);
        let baseTemp = midTemp + (diurnalCycle * halfRange);

        if (this.weather === 'snowy') {
            baseTemp -= 2.0;
            this.rainMmPerHour = 0;
            audio.startWeather('snowy');
        } else if (this.weather === 'rainy') {
            baseTemp -= 1.5;
            this.calculateRainMillimeter(this.clockMinutes);
            audio.startWeather('rainy', this.rainIntensity || 2);
        } else {
            this.rainMmPerHour = 0;
        }

        this.temperature = Math.round(baseTemp);
        
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
        this.departAnnounced = false;
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
        
        // Rota veya durak başlangıcında pusula istikametini rotanın gerçek coğrafi yönüyle senkronize et
        if (typeof CompassSystem !== 'undefined' && this.activeRouteData) {
            const legDir = CompassSystem.inferRouteDirection(this.activeRouteData);
            if (legDir && this.currentStopIndex === 0) {
                const cardKey = (legDir === "Kuzey") ? "ArrowUp" : (legDir === "Doğu") ? "ArrowRight" : (legDir === "Güney") ? "ArrowDown" : "ArrowLeft";
                const initialCard = CompassSystem.cardinals[cardKey];
                if (initialCard) {
                    CompassSystem.currentDirection = initialCard.name;
                    CompassSystem.currentAngle = initialCard.angle;
                    if (typeof CompassSystem.updateHUD === 'function') {
                        CompassSystem.updateHUD(initialCard);
                    }
                    this.currentCompassDirection = initialCard.name;
                    this.currentCompassAngle = initialCard.angle;
                }
            }
        }

        const nextStop = this.activeRouteData.stops[this.currentStopIndex];
        
        // Zemin Akustiğini Ayarla (Dinamik İlçe/Durak Bazlı)
        let stopNameLower = (nextStop.name || "").toLowerCase();
        
        let isOtoyolArea = stopNameLower.includes("malkara") || stopNameLower.includes("çorlu") || 
            stopNameLower.includes("çerkezköy") || stopNameLower.includes("ergene") || 
            stopNameLower.includes("kınalı") || stopNameLower.includes("otoyol");

        // Otoyol kuralı: Sadece Ehliyet Seviyesi 5 (Şehirlerarası) ve üzeri ise açılır.
        if (isOtoyolArea && this.licenseLevel >= 5) {
            audio.currentTerrain = "otoyol";
        } 
        else if (typeof sehirRotalari !== 'undefined' && sehirRotalari[this.currentCity] && sehirRotalari[this.currentCity].terrain) {
            // Şehrin genel terrain'ine dön
            audio.currentTerrain = sehirRotalari[this.currentCity].terrain;
        } else {
            audio.currentTerrain = "asfalt";
        }
        
                if (this.activeRouteData && this.activeRouteData.isHierarchical) {
            // HİYERARŞİK ULTRA HAFİF HARİTA MOTORU (TEKİRDAĞ GERÇEK MESAFE STANDARDI)
            const nextStop = this.activeRouteData.stops[this.currentStopIndex];
            const prevStop = this.currentStopIndex > 0 ? this.activeRouteData.stops[this.currentStopIndex - 1] : null;
            let stopDistance = prevStop ? (nextStop.pos - prevStop.pos) : (nextStop.pos || 850);
            
            // Gerçekçi Tekirdağ belediye standardı: Şehir içi durak araları minimum 750m - 1100m
            if (stopDistance < 750) {
                stopDistance = 750 + ((this.currentStopIndex * 47) % 250);
            }
            this.currentDistanceToNext = stopDistance;
            this.hierarchicalBeepPlayed = false;
            
            const nextStopEl = document.getElementById('hud-next-stop');
            if (nextStopEl) nextStopEl.innerText = `${nextStop.name} (${this.currentStopIndex + 1}/${this.activeRouteData.stops.length})`;
            return;
        }

        if (!isResume) {
            if (this.isFetchingRoute) {
                console.warn("Spam koruması: OSRM Rota şu an çekiliyor, mükerrer istek iptal edildi.");
                return;
            }
            this.isFetchingRoute = true;

            // OSRM HESAPLAMASI (Arka planda çalışır, aracı duraklatmaz)
            const wasDriving = this.isDriving;
            
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
            // TEKULAŞ İLÇE VE CADDE KİLOMETRE KALİBRASYONU
            let prevStop = this.currentStopIndex > 0 ? this.activeRouteData.stops[this.currentStopIndex - 1] : null;
            let rawDistKm = (this.currentStopIndex === 0)
                ? (nextStop.gercekMesafeSonraki || 0.9)
                : ((prevStop && prevStop.gercekMesafeSonraki) ? prevStop.gercekMesafeSonraki : (nextStop.gercekMesafeSonraki || 0.9));
            
            let combinedMeta = ((nextStop ? nextStop.name : '') + ' ' + (prevStop ? prevStop.name : '') + ' ' + (this.activeRouteData.name || '')).toLowerCase();
            let isIntercityCorridor = combinedMeta.includes("otoyol") || combinedMeta.includes("çevre yolu") || combinedMeta.includes("malkara") || combinedMeta.includes("saray") || combinedMeta.includes("kınalı") || combinedMeta.includes("çorlu") || combinedMeta.includes("otogar");
            let isBoulevardCampus = combinedMeta.includes("üniversite") || combinedMeta.includes("kampüs") || combinedMeta.includes("sanayi") || combinedMeta.includes("hastane") || combinedMeta.includes("sahil") || combinedMeta.includes("bulvar");

            let calibratedMeters = rawDistKm * 1000;
            if (isIntercityCorridor) {
                // İlçeler arası gerçek durak mesafesi: 2.4 km - 4.2 km
                if (calibratedMeters < 2400) calibratedMeters = 2400 + ((this.currentStopIndex * 157) % 1800);
            } else if (isBoulevardCampus) {
                // Ana bulvar, üniversite ve sahil mesafesi: 1.3 km - 2.1 km
                if (calibratedMeters < 1300) calibratedMeters = 1300 + ((this.currentStopIndex * 93) % 800);
            } else {
                // Şehir içi TEKULAŞ cadde ve mahalle durağı: 850m - 1350m
                if (calibratedMeters < 850) calibratedMeters = 850 + ((this.currentStopIndex * 67) % 500);
            }

            let fallbackDistance = Math.round(calibratedMeters);
            if (!this.currentDistanceToNext || this.currentDistanceToNext < 850 || isNaN(this.currentDistanceToNext)) {
                this.currentDistanceToNext = fallbackDistance;
            }

            if (!lat1 || !lon1 || !lat2 || !lon2 || isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
                this.currentDistanceToNext = fallbackDistance;
                this.isFetchingRoute = false;
            } else {
                fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`)
                .then(res => res.json())
                .then(data => {
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        let routeDist = route.distance;
                        if (routeDist < 850) routeDist = fallbackDistance;
                        this.currentDistanceToNext = routeDist; // OSRM gerçek mesafe (metre)
                        
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
                });
            }
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
                
                // 0 (Şimdi dönün) uyarısı her zaman var
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
            this.maxSpeed = 90; // Asfalt, Sahil Şeridi vb.
        }

        // FİZİKSEL GÖRÜŞ CEZASI (Visibility Penalty) - KÖR OYUNCULAR İÇİN KALDIRILDI
        // Oyuncular ekranı görmediği için farların kapalı olması sebebiyle hızlarının 20'ye düşmesini "bug" sanıyor.
        this.hasPoorVisibility = false;
        
        // NOT: Kalkış anonsu durakta hareketsizken lafın kesilmesini önlemek amacıyla,
        // araç hareket edip 6 km/s hıza ulaştığında akıllı anons sistemi (FAZ 1) tarafından gerçekçi okunur.
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


    // =========================================================================
    // KARAYOLU GERÇEKÇİ UNSURLAR DÖNGÜSÜ (TÜNELLER, KÖPRÜLER, ÇUKURLAR, IŞIKLAR, NADİR KAZA)
    // =========================================================================
    updateRoadEnvironment(deltaTime, currentTime) {
        if (!this.isDriving || this.speed <= 0) return;
        const traveled = (this.speed / 3.6) * deltaTime; // Metre cinsinden kat edilen yol
        const totalDist = this.totalDistanceCovered || 0;

        // 1. TÜNELLER VE YANKI SİSTEMİ (Her 7.5 - 9 km'de bir)
        if (this.tunnelDistance === null && !this.isInsideTunnel && (totalDist - this.lastTunnelSpawnDist >= 7500)) {
            this.lastTunnelSpawnDist = totalDist;
            this.tunnelDistance = 250; // 250 metre ileride tünel
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("250 metre ileride tünel var, farlarınızı açınız (F tuşu).");
            }
        }
        if (this.tunnelDistance !== null && !this.isInsideTunnel) {
            this.tunnelDistance -= traveled;
            if (this.tunnelDistance <= 0) {
                this.isInsideTunnel = true;
                this.tunnelDistance = null;
                this.tunnelLengthRemaining = 450; // 450 metrelik tünel
                if (typeof audio !== 'undefined') {
                    if (audio.setTunnelMode) audio.setTunnelMode(true);
                    if (audio.speak) audio.speak("Tünele girildi.");
                }
                if (!this.isHeadlightsOn) {
                    setTimeout(() => {
                        if (this.isInsideTunnel && !this.isHeadlightsOn && typeof audio.speak === 'function') {
                            audio.speak("Tünel karanlık, lütfen F tuşuna basarak farları açınız.");
                        }
                    }, 2500);
                }
            }
        } else if (this.isInsideTunnel) {
            this.tunnelLengthRemaining -= traveled;
            if (this.tunnelLengthRemaining <= 0) {
                this.isInsideTunnel = false;
                if (typeof audio !== 'undefined') {
                    if (audio.setTunnelMode) audio.setTunnelMode(false);
                    if (audio.speak) audio.speak("Tünelden çıkıldı, açık hava.");
                }
            }
        }

        // 2. KÖPRÜLER / VİYADÜKLER VE ÇELİK DERZ VURUNTULARI (Her 5 - 6 km'de bir)
        if (this.bridgeDistance === null && !this.isInsideBridge && (totalDist - this.lastBridgeSpawnDist >= 5200)) {
            this.lastBridgeSpawnDist = totalDist;
            this.bridgeDistance = 200;
        }
        if (this.bridgeDistance !== null && !this.isInsideBridge) {
            this.bridgeDistance -= traveled;
            if (this.bridgeDistance <= 0) {
                this.isInsideBridge = true;
                this.bridgeDistance = null;
                this.bridgeLengthRemaining = 380; // 380 metrelik viyadük köprüsü
                this.bridgeJointTraveled = 0;
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Viyadük köprüsüne girildi. Yan rüzgara dikkat ediniz.");
                }
            }
        } else if (this.isInsideBridge) {
            this.bridgeLengthRemaining -= traveled;
            this.bridgeJointTraveled += traveled;
            // Her 35 metrede bir gerçekçi çelik derz vuruntusu (tak-tak, tak-tak)
            if (this.bridgeJointTraveled >= 35) {
                this.bridgeJointTraveled = 0;
                if (typeof audio !== 'undefined' && audio.playBridgeJoint) {
                    audio.playBridgeJoint(this.speed);
                }
            }
            // Köprüde hafif yan rüzgar savrulması (direksiyon hissi)
            this.driftVelocity += (Math.sin(totalDist / 50) * 1.5) * deltaTime;

            if (this.bridgeLengthRemaining <= 0) {
                this.isInsideBridge = false;
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Köprü geçildi.");
                }
            }
        }

        // 3. ASFALT ÇUKURLARI (Her 2.5 - 3.5 km'de bir)
        if (this.potholeDistance === null && (totalDist - this.lastPotholeSpawnDist >= 2800)) {
            this.lastPotholeSpawnDist = totalDist;
            this.potholeDistance = 90; // 90 metre ileride çukur
            this.potholeSide = (Math.random() > 0.5) ? 'right' : 'left';
            this.potholeWarned = false;
        }
        if (this.potholeDistance !== null) {
            this.potholeDistance -= traveled;
            if (this.potholeDistance <= 70 && !this.potholeWarned) {
                this.potholeWarned = true;
                const yon = (this.potholeSide === 'right') ? "SAĞDA" : "SOLDA";
                const kacin = (this.potholeSide === 'right') ? "sola" : "sağa";
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(`Dikkat! 70 metre ileride ${yon} çukur var, ${kacin} kaçının!`);
                }
            }
            if (this.potholeDistance <= 0) {
                // Çukurun denk geldiği şerit: Sağdaysa 65-85, Soldaysa 15-35
                let hitPothole = false;
                if (this.potholeSide === 'right' && this.lanePosition > 58) hitPothole = true;
                if (this.potholeSide === 'left' && this.lanePosition < 42) hitPothole = true;

                if (hitPothole) {
                    if (typeof audio !== 'undefined' && audio.playPotholeThump) {
                        audio.playPotholeThump(this.potholeSide, this.speed);
                    }
                    if (this.speed > 35) {
                        const currentBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
                        const susp = (currentBus && currentBus.suspensionComfort) ? currentBus.suspensionComfort : 70;
                        // Bağımsız havalı körük sönümleme: Setra/Travego'da konfor kaybı 6 puandan 2.2 puana iner
                        const comfortDeduction = Math.max(1.8, 6.0 * (1.0 - (((susp - 55) / 45) * 0.65)));
                        this.passengerComfort = Math.max(20, (this.passengerComfort || 90) - comfortDeduction);
                        if (typeof audio !== 'undefined' && audio.speak) {
                            if (susp >= 90) {
                                audio.speak("Çukurdan geçtik, lüks havalı körükler darbeyi başarıyla sönümledi.");
                            } else {
                                audio.speak("Çukura sert girdik! Yolcular sarsıldı.");
                            }
                        }
                    }
                } else {
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Çukurdan temiz kaçtınız kaptan, elinize sağlık.");
                    }
                }
                this.potholeDistance = null;
            }
        }

        // 4. TRAFİK IŞIKLARI (Kavşaklarda veya her ~3.5 km'de bir)
        if (this.trafficLightDistance === null && (totalDist - this.lastTrafficLightDist >= 3600)) {
            this.lastTrafficLightDist = totalDist;
            this.trafficLightDistance = 140; // 140 metre ileride ışık
            this.trafficLightState = 'red';
            this.trafficLightTimer = 16.0; // 16 saniye kırmızı
            this.trafficLightWarned = false;
        }
        if (this.trafficLightDistance !== null) {
            this.trafficLightDistance -= traveled;
            this.trafficLightTimer -= deltaTime;

            if (this.trafficLightDistance <= 110 && !this.trafficLightWarned) {
                this.trafficLightWarned = true;
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("İleride trafik ışığı var, kırmızı yanıyor.");
                }
            }

            // Kırmızı ışık akustik sinyalizasyonu (Yakındayken her 1.5 saniyede bir bip)
            if (this.trafficLightDistance > 0 && this.trafficLightDistance <= 75 && this.trafficLightState === 'red') {
                if (!this.lastTrafficLightBeep || currentTime - this.lastTrafficLightBeep > 1400) {
                    this.lastTrafficLightBeep = currentTime;
                    if (typeof audio !== 'undefined' && audio.playTrafficLightTone) {
                        audio.playTrafficLightTone('red');
                    }
                }
            }

            // Duraklama veya Kırmızı Işık Zamanlaması
            if (this.trafficLightTimer <= 0 && this.trafficLightState === 'red') {
                this.trafficLightState = 'green';
                if (typeof audio !== 'undefined') {
                    if (audio.playTrafficLightTone) audio.playTrafficLightTone('green');
                    if (audio.speak) audio.speak("Trafik ışığı yeşil yandı, hareket edebilirsiniz.");
                }
            }

            // Işıktan Geçiş Kontrolü
            if (this.trafficLightDistance <= 0) {
                if (this.trafficLightState === 'red' && this.speed > 15) {
                    // Kırmızıda geçildi
                    this.money = Math.max(0, (this.money || 100) - 150);
                    this.passengerComfort = Math.max(20, (this.passengerComfort || 90) - 15);
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("DİKKAT: Kırmızı ışıkta geçtiniz! Yüz elli lira trafik cezası kesildi.");
                    }
                }
                this.trafficLightDistance = null;
            }
        }

        // 5. NADİR NPC KAZA OLAYI (Her 18 - 25 km'de bir, son derece nadir)
        if (!this.rareCrashActive && (totalDist - this.lastRareCrashDistance >= 19000)) {
            this.lastRareCrashDistance = totalDist;
            this.rareCrashActive = true;
            setTimeout(() => {
                if (!this.isDriving) { this.rareCrashActive = false; return; }
                if (typeof audio !== 'undefined') {
                    if (audio.playTireScreech) audio.playTireScreech(0.6);
                    setTimeout(() => {
                        if (audio.stopTireScreech) audio.stopTireScreech();
                        if (audio.playDistantCrash) audio.playDistantCrash(0.4);
                        if (audio.speak) audio.speak("Dikkat! İleride iki araç kaza yaptı, araçlar yol kenarına savruldu. Orta şeritten yavaşça geçiniz.");
                    }, 900);
                }
                setTimeout(() => {
                    this.rareCrashActive = false;
                }, 8000);
            }, 1000);
        }
    },

    gameLoop: function(currentTime) {
        if (!this.isDriving) return;
        
        let deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        // KRİTİK ÇÖKME VE DONMA KALKANI: Sekme arka planda kalsa bile fiziğin patlamasını engeller
        if (deltaTime > 0.1) deltaTime = 0.1;
        
        // --- ZAMANIN AKIŞI (1:4 Senkronize Simülasyon Ölçeği) ---
        // 1 gerçek dakika = 4 oyun dakikası. 2 saatlik gerçek oynanış = Tam 8 saatlik resmi şoför vardiyası!
        // Durakta yolcu binerken de zaman akar; mesafe ile zaman kuruşu kuruşuna kilitlidir.
        const timeScale = 1.0; // 1:1 Gerçek Zamanlı Dakika ve Saniye
        this.clockMinutes += (deltaTime / 60) * timeScale;
        this.totalDrivingSeconds = (this.totalDrivingSeconds || 0) + deltaTime;
        this.clockMinutes = this.clockMinutes % 1440;
        
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
            // Tekirdağ MGM iklim normalleri ve gün döngüsü sıcaklık hesaplaması (Ay bağımsız)
            const regime = (this.tekirdagClimate && this.tekirdagClimate.regimes && this.tekirdagClimate.regimes[this.activeClimateRegime])
                ? this.tekirdagClimate.regimes[this.activeClimateRegime]
                : { mean: 14.0, max: 17.9, min: 10.3 };
            
            const halfRange = (regime.max - regime.min) / 2;
            const midTemp = (regime.max + regime.min) / 2;
            const diurnalCycle = Math.cos(((this.clockMinutes - 870) / 720) * Math.PI);
            let baseTemp = midTemp + (diurnalCycle * halfRange);
            if (this.weather === 'snowy') baseTemp -= 2.0;
            else if (this.weather === 'rainy') baseTemp -= 1.5;
            this.temperature = Math.round(baseTemp);

            if (this.weather === 'rainy') {
                this.calculateRainMillimeter(this.clockMinutes);
            }
        }

        // BUG FIX: Eğer sekme arka planda kalırsa deltaTime aşırı büyür ve fizik motorunu patlatır.
        // Bunu engellemek için deltaTime değerini maksimum 0.1 saniye (100ms) ile sınırlandırıyoruz.
        if (deltaTime > 0.1) deltaTime = 0.1;

        // Sürüş Süresi Takibi (Emektar Direksiyon Rozeti)
        if (this.totalDrivingSeconds >= 1800 && typeof DriverBadges !== 'undefined' && !DriverBadges.isUnlocked('emektar_direksiyon')) {
            DriverBadges.unlock('emektar_direksiyon', true);
        }

        // Karşıdan Gelen Meslektaş Otobüsü
        if (!this.nextColleagueTime) {
            this.nextColleagueTime = currentTime + 180000 + Math.random() * 240000;
        }
        if (this.isDriving && this.speed > 25 && currentTime > this.nextColleagueTime) {
            this.nextColleagueTime = currentTime + 240000 + Math.random() * 240000;
            if (typeof audio !== 'undefined' && typeof audio.playPassingBus === 'function') {
                audio.playPassingBus(() => {
                    this.colleagueGreetingActive = true;
                    setTimeout(() => { this.colleagueGreetingActive = false; }, 3800);
                });
            }
        }

        // Kasis Yaklaşma Sesli Uyarısı (60m kala)
        if (this.kasisDistance !== null && this.kasisDistance <= 60 && this.kasisDistance > 0 && !this.kasisWarned) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("İleride kasis var, yavaşlayınız.");
            this.kasisWarned = true;
        }
        if (this.kasisDistance !== null && this.kasisDistance <= 0) {
            if (typeof audio !== 'undefined' && typeof audio.playSuspensionBounce === 'function') {
                audio.playSuspensionBounce();
            }
            this.kasisDistance = null;
            this.kasisWarned = false;
        }


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
            
            // Direksiyon kontrolcüsü (Şerit takip asistanı)
            let steeringDiff = targetLane - this.lanePosition;
            if (Math.abs(steeringDiff) > 1) {
                // Şeride doğru direksiyon çevir
                this.steeringAngle = steeringDiff > 0 ? 1.5 : -1.5;
            } else {
                this.steeringAngle = 0; // Şeridi bulduk, direksiyonu topla
            }
            
            // Yol bittiğinde (Sanayiye varıldığında)
            if (this.currentDistanceToNext <= 0) {
                this.isBeingTowed = false;
                this.isDriving = false;
                this.speed = 0;
                this.acceleration = 0;
                this.steeringAngle = 0;
                audio.speak("Sanayiye vardık. Araç indiriliyor. Geçmiş olsun usta.");
                document.getElementById('nav-feedback').innerText = "TEKİRDAĞ SANAYİ - VARIŞ";
                document.getElementById('hud-speed').innerText = `Hız: 0 km/s`;
                
                // Sanayi moduna geç
                SanayiMechanic.start();
                return;
            }
        }

        // --- Cadde Ortam Sesi ---
        // Kullanıcı isteği üzerine kapatıldı: Sadece NPC'ler trafiği temsil edecek
        /*
        if ((this.currentRoadType === "Asfalt Cadde" || this.currentRoadType === "Sahil Şeridi Yolu") && this.speed > 10) {
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
                            `Şimdi ${currentTurn.direction} dönün.`,
                            `Lütfen şimdi ${currentTurn.direction} dönün.`,
                            `Buradan ${currentTurn.direction} dönün.`
                        ];
                        let speechText = currentTurn.isSpecial ? 
                            `Şimdi ${currentTurn.direction}` : 
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
                        let turnDelta = 0;
                        const turnDir = (currentTurn.direction || "").toLowerCase();
                        if (turnDir.includes("tam sağa") || turnDir.includes("sağa dönün")) turnDelta = 90;
                        else if (turnDir.includes("hafif sağa")) turnDelta = 45;
                        else if (turnDir.includes("tam sola") || turnDir.includes("sola dönün")) turnDelta = -90;
                        else if (turnDir.includes("hafif sola")) turnDelta = -45;
                        else if (turnDir.includes("u dönüşü")) turnDelta = 180;

                        let newHeadingName = "";
                        if (typeof CompassSystem !== 'undefined' && turnDelta !== 0) {
                            const curAngle = (typeof CompassSystem.currentAngle === 'number') ? CompassSystem.currentAngle : 0;
                            const newAngle = ((curAngle + turnDelta) % 360 + 360) % 360;
                            CompassSystem.currentAngle = newAngle;
                            const card = CompassSystem.getCardinalFromBearing(newAngle);
                            CompassSystem.currentDirection = card.name;
                            if (typeof CompassSystem.updateHUD === 'function') {
                                CompassSystem.updateHUD(card);
                            }
                            this.currentCompassDirection = card.name;
                            this.currentCompassAngle = newAngle;
                            newHeadingName = card.name;
                        }

                        const turnMsg = newHeadingName 
                            ? `Dönüş tamamlandı. Yeni istikamet ${newHeadingName}. Şimdi devam edin.`
                            : "Dönüş tamamlandı, şimdi devam edin.";
                        audio.speak(turnMsg);
                        const navFeedbackEl = document.getElementById('nav-feedback');
                        if (navFeedbackEl) {
                            navFeedbackEl.innerText = newHeadingName ? `Dönüş Başarılı! (${newHeadingName})` : "Dönüş Başarılı!";
                            navFeedbackEl.style.color = '#22c55e'; // Green
                        }
                        setTimeout(() => {
                            const el = document.getElementById('nav-feedback');
                            if (el && el.innerText.includes("Dönüş Başarılı")) {
                                el.innerText = "";
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
                    audio.playRetarder(5, this.speed);
                    this.retarderUsedInRoute = true; // 5 saniyelik retarder simülasyonu
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

        // KARAYOLU GERÇEKÇİ ÇEVRE VE YOL UNSURLARI DÖNGÜSÜ
        this.updateRoadEnvironment(deltaTime, currentTime);

        // FİZİK MOTORU VE KULLANICI GİRİŞLERİ (ÇEKİCİ MODUNDA KİLİTLENİR)
        if (!this.isBeingTowed) {
            // Motor kapalıysa araç gidemez
            if (!audio.isEngineRunning) {
                this.acceleration = -5; // Sadece sürtünme
                if (this.keys.w || this.keys.arrowup) {
                    const now = performance.now();
                    if (!this.lastEngineOffWarnTime || now - this.lastEngineOffWarnTime > 4000) {
                        this.lastEngineOffWarnTime = now;
                        if (typeof audio.speak === 'function') audio.speak("Motor kapalı. Boşluk tuşuna basarak motoru çalıştırınız.");
                    }
                }
            } else {
                // TONAJ HESAPLAMASI
                const baseWeight = 12000; // Boş otobüs 12 Ton
                const currentWeight = baseWeight + (this.passengersOnBoard * 75);
                const weightMultiplier = baseWeight / currentWeight;
                
                // Ehliyet seviyesine göre zorluk
                const difficultyMultiplier = 1 + (this.licenseLevel * 0.2);

                const isThrottle = canAccelerate && !this.isEmergencyBrakeLocked && (this.keys.w || this.keys.arrowup);
                const isBrake = (this.keys.s || this.keys.arrowdown);

                if (isThrottle) {
                    // GERÇEKÇİ BELEDİYE OTOBÜSÜ İVMELENME FİZİĞİ (14-18 Tonluk Dizel Ağır Vasıta)
                    // Gerçek hayatta bir belediye otobüsü 0'dan 50 km/s hıza yaklaşık 12-14 saniyede ulaşır
                    let baseAccel = 5.8;
                    if (this.speed > 45) baseAccel = 4.2;
                    if (this.speed > 70) baseAccel = 2.6;
                    this.acceleration = baseAccel * weightMultiplier;
                } else if (isBrake) {
                    // SERVİS VE HAVALI FREN KALİBRASYONU (Yolcuları savurmayan kademeli duruş)
                    let baseBrake = -11.5;
                    if (this.isBrakeKeyDown) baseBrake = -14.5;
                    if (this.isEmergencyBrakeLocked) baseBrake = -28.0;
                    
                    // Islak yol ve yağmur milimetresine göre fren mesafesi ve tutunma kaybı:
                    if (this.weather === 'rainy' && this.rainMmPerHour > 0) {
                        const rainGripFactor = Math.max(0.72, 1.0 - (this.rainMmPerHour * 0.016));
                        baseBrake *= rainGripFactor;
                    } else if (this.weather === 'snowy') {
                        baseBrake *= 0.65;
                    }
                    this.acceleration = baseBrake * weightMultiplier;
                } else {
                    // SERBEST SÜZÜLME (Dizel kompresyonu, lastik yuvarlanma ve rüzgar direnci)
                    this.acceleration = -2.2 * weightMultiplier;
                    if (this.isEmergencyBrakeLocked) this.acceleration = -28.0 * weightMultiplier;
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
            const mm = this.rainMmPerHour || 5.0;
            // Yağmur milimetresine göre asfalt su kalınlığı ve savrulma eşiği formülü:
            skidThreshold = Math.max(26, 48 - (mm * 1.3));
            angleThreshold = Math.max(10, 20 - (mm * 0.6));
        } else if (this.weather === 'snowy') {
            skidThreshold = 25; // Karda çok daha erken savrulur
            angleThreshold = 10; // Karda çok az bir direksiyon manevrası bile kaydırır
        }

        if (this.speed > skidThreshold && Math.abs(this.steeringAngle) > angleThreshold && !this.isBeingTowed) {
            isSkidding = true;
            skidIntensity = (Math.abs(this.steeringAngle) - angleThreshold) / 10;
            
            if (this.weather === 'rainy') skidIntensity *= (1.0 + ((this.rainMmPerHour || 5.0) * 0.06));
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

        let prevSpeed = this.speed;
        this.speed += currentAcceleration * deltaTime;
        if (this.speed > currentMaxSpeed && this.acceleration > 0) {
            this.speed -= 10 * deltaTime; // Yavaşça limite çek
        }
        if (this.speed <= 0) {
            if (prevSpeed > 2 && this.isBrakeKeyDown && typeof audio.playAirBrake === 'function') {
                audio.playAirBrake();
            }
            this.speed = 0;
        }
        
        // BUG FIX: Otomatik Retarder Kapatma (Hız 10'un altına düşerse motor freni devreden çıkar)
        if (this.speed < 10 && this.isBrakeKeyDown && typeof audio.stopRetarder === 'function') {
            audio.stopRetarder();
        }

        // RPM VE VİTES MANTIĞI
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
        // Canlı Yakıt HUD Göstergesi
        const hudFuelVal = document.getElementById('hud-fuel-val');
        if (hudFuelVal) {
            const cap = (typeof this.getFuelCapacity === 'function') ? this.getFuelCapacity() : (this.fuelTankCapacity || 500);
            const curFuel = (this.currentFuelLiters !== undefined) ? this.currentFuelLiters : cap;
            const liters = Math.max(0, Math.floor(curFuel));
            const pct = Math.max(0, Math.min(100, Math.floor((curFuel / cap) * 100)));
            hudFuelVal.innerText = `%${pct} (${liters} L)`;
            if (pct > 30) hudFuelVal.style.color = '#4ade80';
            else if (pct > 15) hudFuelVal.style.color = '#facc15';
            else hudFuelVal.style.color = '#ef4444';
        }
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

            // Tırtıklı Emniyet Şeridi (Rumble Strips) Titreşim Sesi
            if ((this.lanePosition <= 18 || this.lanePosition >= 82) && this.speed > 25) {
                if (typeof HighwayFacilities !== 'undefined' && HighwayFacilities.playRumbleSound) {
                    if (!this._lastRumbleTime || (Date.now() - this._lastRumbleTime > 380)) {
                        this._lastRumbleTime = Date.now();
                        HighwayFacilities.playRumbleSound();
                    }
                }
            }
        }

        if (this.speed > 5) { this.wasMovingBeforeStop = true; }
        if (this.speed > 0) {
            // GERÇEKÇİ OYUN ÖLÇEĞİ: 1 gerçek kilometre = Oyun içinde 250 metre sürüş süresi (4 kat hızlı)
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

                        // YALOVA/BAYBURT HİYERARŞİK HARİTA MOTORU DURAĞA YAKLAŞMA BİPİ (20 METRE KALA SİNYAL)
            if (this.activeRouteData && this.activeRouteData.isHierarchical) {
                if (this.currentDistanceToNext <= 20 && this.currentDistanceToNext > 0 && !this.hierarchicalBeepPlayed) {
                    if (typeof MapEngine !== 'undefined' && MapEngine.playApproachingBeep) {
                        MapEngine.playApproachingBeep();
                    } else if (typeof audio !== 'undefined' && typeof audio.playNavChime === 'function') {
                        audio.playNavChime();
                    }
                    this.hierarchicalBeepPlayed = true;
                }
            }

            if (this.currentDistanceToNext <= 220 && !this.copilotFirstStopWarned && this.currentStopIndex === 0 && this.speed > 5) {
                this.copilotFirstStopWarned = true;
                if (window.voiceAssistant && window.voiceAssistant.isCopilotEnabled && typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("İlk durağınıza yaklaşıyorsunuz. S tuşuna basarak yavaşlayınız. Tam durduğunuzda 1 ve 2 tuşlarıyla kapıları açınız.");
                }
            }
            // FAZ 1: DURAKTAN KALKIŞ ANONSU (Araç hareket edip hızlanınca)
            if (this.speed > 6 && !this.departAnnounced) {
                this.departAnnounced = true;
                const isInitial = (this.currentStopIndex === 0);
                const isFinal = (this.currentStopIndex >= this.activeRouteData.stops.length - 1);
                const nextStop = this.activeRouteData.stops[this.currentStopIndex];
                if (typeof audio !== 'undefined' && typeof audio.playBusAnnouncement === 'function') {
                    audio.playBusAnnouncement('depart', nextStop.name, {
                        isInitial: isInitial,
                        isFinal: isFinal,
                        routeName: this.activeRouteData.name || this.activeRouteData.hatNo
                    });
                }
            }

            // FAZ 3: DURAĞA YAKLAŞMA ANONSU (85 - 100 metre kala)
            if (this.currentDistanceToNext <= 95 && !this.stopApproachAnnounced && this.speed > 4) {
                this.stopApproachAnnounced = true;
                const isFinalStop = this.activeRouteData && this.activeRouteData.stops && (this.currentStopIndex >= this.activeRouteData.stops.length - 1);
                const nextStop = this.activeRouteData.stops[this.currentStopIndex];
                if (typeof audio !== 'undefined' && typeof audio.playBusAnnouncement === 'function') {
                    audio.playBusAnnouncement('approach', nextStop.name, { isFinal: isFinalStop });
                } else if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(`${nextStop.name} durağına yaklaşıyorsunuz. İnecek yolcular lütfen hazırlansın.`);
                }
            }
            const distanceScale = 1.0; // 1:1 Gerçek Fizik (Metre / Saniye)
            const distanceCovered = (this.speed / 3.6) * deltaTime * distanceScale; 
            this.currentDistanceToNext -= distanceCovered;
            this.totalDistanceCovered += distanceCovered;

            // Dinamik Yakıt Tüketim Fiziği
            if (this.engineStarted) {
                const cap = (typeof this.getFuelCapacity === 'function') ? this.getFuelCapacity() : (this.fuelTankCapacity || 500);
                if (this.currentFuelLiters === undefined) this.currentFuelLiters = cap;
                
                if (this.speed > 0) {
                    const distKm = (this.speed / 3600) * deltaTime;
                    const consRate = (typeof this.getFuelConsumptionPer100km === 'function') ? this.getFuelConsumptionPer100km() : 30;
                    let throttleFactor = 1.0;
                    if (this.isRetarderActive && !this.keys.w && !this.keys.arrowup) {
                        throttleFactor = 0.05; // Retarder devredeyken enjeksiyon kesme
                    } else if (!this.keys.w && !this.keys.arrowup) {
                        throttleFactor = 0.2; // Gazsız akış
                    }
                    const passCount = this.passengers ? (this.passengers.length || 0) : 0;
                    const loadFactor = 1.0 + (passCount * 0.003);
                    const burned = distKm * (consRate / 100) * throttleFactor * loadFactor;
                    this.currentFuelLiters = Math.max(0, this.currentFuelLiters - burned);
                } else {
                    // Rölanti yakıt tüketimi
                    const idleBurn = 0.00065 * deltaTime;
                    this.currentFuelLiters = Math.max(0, this.currentFuelLiters - idleBurn);
                }

                const currentPct = Math.floor((this.currentFuelLiters / cap) * 100);

                // Düşük yakıt ikazları
                if (currentPct <= 15 && currentPct > 5 && !this.fuelWarned15) {
                    this.fuelWarned15 = true;
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Dikkat! Yakıt seviyesi kritik, yüzde 15 kaldı. En yakın tesisten mazot alınız.");
                    }
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast("⛽ Düşük Yakıt Uyarısı (%15)", "warning");
                    }
                } else if (currentPct <= 5 && currentPct > 0 && !this.fuelWarned5) {
                    this.fuelWarned5 = true;
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Acil ikaz! Yakıt tükenmek üzere, sadece yüzde 5 kaldı!");
                    }
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast("🚨 Acil: Yakıt Tükeniyor (%5)", "error");
                    }
                } else if (this.currentFuelLiters <= 0 && this.engineStarted) {
                    this.engineStarted = false;
                    this.isDriving = false;
                    this.speed = 0;
                    this.acceleration = 0;
                    if (typeof audio !== 'undefined' && typeof audio.stopEngine === 'function') {
                        audio.stopEngine();
                    }
                    const stallMsg = "Yakıtınız tamamen tükendi! Motor durdu. İlerlemek için Tesis (J) menüsünden veya çekici yardımıyla yakıt alınız.";
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(stallMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("⚠️ Yakıt Bitti! Motor Durdu", "error");
                }
            } // 3D Ses uzayı için ilerleme kaydı
            
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
                    document.getElementById('nav-feedback').innerText = "TEKİRDAĞ SANAYİ - VARIŞ";
                    document.getElementById('hud-speed').innerText = `Hız: 0 km/s`;
                    
                    // Sanayi moduna geç
                    if (typeof SanayiMechanic !== 'undefined') SanayiMechanic.start();
                    return;
                } else {
                    this.arriveAtStop();
                    return;
                }
            }
            const remMeters = Math.max(0, Math.round(this.currentDistanceToNext || 0));
            if (remMeters >= 1000) {
                document.getElementById('hud-distance').innerText = (remMeters / 1000).toFixed(1) + " km";
            } else {
                document.getElementById('hud-distance').innerText = remMeters + " m";
            }
            
            // ETA (Tahmini Varış Süresi) Hesaplama
            if (this.speed < 5 || !remMeters) {
                document.getElementById('hud-eta').innerText = "--:--";
            } else {
                let timeInHours = (remMeters / 1000) / this.speed;
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
                const curBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
                const rigidity = (curBus && curBus.chassisRigidity) ? curBus.chassisRigidity : 70;
                const brakeDeduct = 0.5 * Math.max(0.4, 1.0 - (((rigidity - 60) / 40) * 0.55));
                this.passengerComfort = Math.max(90, this.passengerComfort - brakeDeduct);
                
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

        // KLİMA VE SICAKLIK FİZİĞİ
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
            const rainInfo = (this.weather === 'rainy' && this.rainMmPerHour > 0) ? ` | 🌧️ ${this.rainMmPerHour} mm/s` : '';
            document.getElementById('hud-temp').innerText = `${Math.floor(this.busTemperature)}°C (Dış: ${this.temperature}°C)${this.isACOn && !isAnyWindowOpen ? ' [AC]' : ''}${rainInfo}`;
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
                            '"Şoför bey yandık, klimayı açar mısın?"',
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
                            '"Şoför bey üşüyoruz, ısıtıcıyı açar mısın?"',
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
                // GERÇEK NEWTON VE ARAÇ DİNAMİĞİ FİZİK VERİLERİ
                const mass = (npcType === 'ahead') ? 2600 : 1450; // Kamyonet vs. Binek Araç
                this.activeNPCs.push({
                    type: npcType,
                    x: startX,
                    y: startY,
                    targetX: startX,
                    lateralVelocity: 0,
                    speed: baseSpeed * 0.9, // İlk başlangıç hızı
                    targetSpeed: baseSpeed,  // Hedef seyir hızı
                    acceleration: 0,        // Anlık ivme (m/s^2)
                    baseSpeed: baseSpeed,   // Nominal fabrika hızı
                    mass: mass,             // Araç ağırlığı (kg)
                    audioObj: audioObj,
                    hasCollided: false,
                    warned: false,
                    horned: false,
                    isBraking: false
                });
            }
        }

        for (let i = this.activeNPCs.length - 1; i >= 0; i--) {
            let npc = this.activeNPCs[i];
            
            if (npc.hasCollided) {
                // ÇARPIŞMA MOMENTUM VE SAVRULMA FİZİĞİ (Newton 3. Yasa)
                if (npc.slideX) {
                    npc.x += npc.slideX * deltaTime * 2;
                    npc.slideX *= Math.pow(0.92, deltaTime * 60); // Asfalt sürtünmesi sönümlemesi
                }
                if (npc.slideY) {
                    npc.y += npc.slideY * deltaTime * 2;
                    npc.slideY *= Math.pow(0.92, deltaTime * 60);
                }
                npc.speed = Math.max(0, npc.speed - (60 * deltaTime)); // Çarpışan araç hızla durur
                npc.y -= this.speed * deltaTime * 1.5;
            } else {
                // --- GERÇEK FİZİK KURALLARINA UYGUN ARAÇ YÜRÜTME MOTORU ---
                let desiredSpeed = npc.baseSpeed;

                // 1. Hava Durumu ve Zemin Sürtünme Katsayısı Etkisi
                if (this.weather === 'rainy') {
                    // Yağmur mm miktarına göre NPC güvenli takip ve sürüş hızı (ıslak zemin temkini)
                    const rainFactor = Math.max(0.75, 1.0 - ((this.rainMmPerHour || 5.0) * 0.016));
                    desiredSpeed *= rainFactor;
                } else if (this.weather === 'snowy') {
                    desiredSpeed *= 0.65; // Karda araçlar temkinli ve yavaş seyreder
                }

                // 2. Kasis Yaklaşımı: Kasis varsa NPC kasis için fren lambalarını yakıp yavaşlar
                if (this.kasisDistance !== null && this.kasisDistance > 0 && this.kasisDistance < 90) {
                    desiredSpeed = Math.min(desiredSpeed, 26); // Kasis hızı 26 km/s
                    npc.isBraking = true;
                } else {
                    npc.isBraking = false;
                }

                // 3. Viraj Güvenlik Limiti (Merkezkaç Kuvveti Fiziği)
                if (this.roadCurvature && Math.abs(this.roadCurvature) > 0.05) {
                    desiredSpeed *= 0.85; // Virajda savrulmamak için hız kesilir
                }

                // 4. Sollayan Araç Güvenli Şerit Değiştirme Mantığı
                if (npc.type === 'overtaking' && npc.y > 60 && !npc.merged) {
                    npc.targetX = 64; // Otobüsün 60 metre önüne geçince güvenle sağ şeride oturur
                    npc.merged = true;
                }

                // 5. Motor İvmelenmesi ve Disk Fren Dinamiği (Newton Fiziği)
                npc.targetSpeed = desiredSpeed;
                if (npc.speed < npc.targetSpeed) {
                    // İvmelenme: 3.5 m/s^2 motor gücü
                    npc.speed += 3.5 * (3.6 * deltaTime);
                    if (npc.speed > npc.targetSpeed) npc.speed = npc.targetSpeed;
                } else if (npc.speed > npc.targetSpeed) {
                    // Frenleme: 5.5 m/s^2 hidrolik disk fren gücü
                    npc.speed -= 5.5 * (3.6 * deltaTime);
                    if (npc.speed < npc.targetSpeed) npc.speed = npc.targetSpeed;
                }

                // 6. Şerit Değiştirme Yanal Fiziği (Direksiyon İvmesi ve Süspansiyon)
                if (npc.targetX !== undefined && Math.abs(npc.targetX - npc.x) > 0.5) {
                    let lateralForce = (npc.targetX - npc.x) * 4.0;
                    npc.lateralVelocity = (npc.lateralVelocity || 0) + lateralForce * deltaTime;
                    npc.lateralVelocity *= Math.pow(0.85, deltaTime * 60); // Direksiyon toparlama sönümü
                    npc.x += npc.lateralVelocity * deltaTime;
                }

                // 7. Bağıl Yol Hareketi (Diferansiyel Koordinat Sistemi)
                if (npc.type === 'oncoming' || npc.type === 'hazard') {
                    npc.y -= (this.speed + npc.speed) * deltaTime * 1.5;
                } else if (npc.type === 'ahead') {
                    npc.y -= (this.speed - npc.speed) * deltaTime * 1.5;
                } else if (npc.type === 'overtaking') {
                    npc.y += (npc.speed - this.speed) * deltaTime * 1.5;
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

                // AKILLI NEZAKET VE OYUNU TIKAMAMA KORUMASI (Anti-Gridlock Courtesy Yield)
                // Eğer oyuncu arkadan yaklaşırsa, öndeki araç dikiz aynasından otobüsü görüp sağa emniyet şeridine kaçar ve yol verir
                if (npc.type === 'ahead' && npc.y < 45 && npc.y > 10 && Math.abs(npc.x - this.lanePosition) < 20) {
                    npc.targetX = 82; // Sağa çekilir
                    npc.targetSpeed = Math.max(npc.targetSpeed, this.speed + 15); // Gaz verip uzaklaşır
                    if (!npc.yielded) {
                        npc.yielded = true;
                        if (typeof audio.speak === 'function') {
                            audio.speak("Öndeki araç sağa çekilip yol verdi, geçebilirsiniz.");
                        }
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
                    
                    // Garaj ve Filo Sahası Koruması (Kapalı Hangar, Güvenlik Kameraları ve Çevre Aydınlatması)
                    if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.getInstitutionLevel === 'function') {
                        const garageLvl = CompanySystem.getInstitutionLevel('bus_garage');
                        if (garageLvl === 2) {
                            damageAmount = Math.max(3, Math.round(damageAmount * 0.75)); // %25 Yıpranma Azalımı
                        } else if (garageLvl >= 3) {
                            damageAmount = Math.max(2, Math.round(damageAmount * 0.50)); // %50 Yıpranma Azalımı (Kapalı Lojistik Hangar Koruması)
                        }
                    }
                    
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
        (this.activeNPCs || []).forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
        this.activeNPCs = [];
        
        document.getElementById('nav-feedback').innerText = "ARAÇ PERT OLDU! ÇEKİCİ BEKLENİYOR...";
        document.getElementById('nav-feedback').style.color = '#ef4444';
        
        this.showWarning("ARAÇ PERT OLDU! ÇEKİCİ ÇAĞRILIYOR.");
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
        const stopData = (this.activeRouteData && this.activeRouteData.stops) ? this.activeRouteData.stops[this.currentStopIndex] : null;
        const isFinalStop = (this.activeRouteData && this.activeRouteData.stops) ? (this.currentStopIndex >= this.activeRouteData.stops.length - 1) : false;

        // Yaşayan Yolcu Diyalogları (Sabah günaydın, yağmurda şemsiye, son durak vedası)
        if (this.weather === 'rainy' && typeof audio !== 'undefined' && typeof audio.playUmbrellaShake === 'function') {
            audio.playUmbrellaShake();
        }

        if (isFinalStop) {
            setTimeout(() => {
                const goodbyeMsg = "Yolcular: 'Eline sağlık kaptan, çok rahat bir seferdi. Hayırlı günler.'";
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(goodbyeMsg);
                if (window.voiceAssistant && window.voiceAssistant.isCopilotEnabled) {
                    setTimeout(() => {
                        if (typeof audio !== 'undefined' && audio.speak) {
                            audio.speak("Son durağa vardınız. Tüm yolcular indikten sonra J tuşuna basarak kabin teftişi yapınız.");
                        }
                    }, 3500);
                }
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("👋 " + goodbyeMsg, "info");
            }, 1200);
        } else if (this.clockMinutes >= 390 && this.clockMinutes <= 510) {
            // Sabah 06:30 - 08:30 arası
            const morningGreetings = [
                "Günaydın kaptanım, hayırlı işler.",
                "Kolay gelsin kaptan, hayırlı sabahlar.",
                "Günaydın, iyi görevler kaptan."
            ];
            const randGreet = morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
            setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(randGreet);
            }, 800);
        }

        // stopData ve isFinalStop fonksiyon başında güvenle tanımlandı

        // DURAK KEŞİF VE KOLEKSİYON SİSTEMİ TETİKLEYİCİSİ
        if (typeof StopDiscovery !== 'undefined' && stopData && stopData.name) {
            StopDiscovery.onReachStop(stopData.name, this.activeDistrict || "Süleymanpaşa");
        }

        // Yolcu matematiğini başta hesapla
        const isTrainingEmpty = !!(this.activeRouteData && (this.activeRouteData.emptyBus || this.activeRouteData.isTraining));
        const remainingStops = Math.max(1, this.activeRouteData.stops.length - this.currentStopIndex - 1);
        const alighting = isTrainingEmpty ? 0 : (isFinalStop ? this.passengersOnBoard : Math.min(this.passengersOnBoard, Math.max(1, Math.round(this.passengersOnBoard / (remainingStops + 1)))));
        const waiting = isTrainingEmpty ? 0 : ((typeof stopData.bekleyenYolcu === 'number') ? stopData.bekleyenYolcu : 5);

        if (isTrainingEmpty) {
            const emptyNotice = isFinalStop 
                ? "Son test durağına vardınız. Aracı durdurup eğitimi tamamlayınız." 
                : (stopData.name + " test durağına ulaştınız. Yolcusuz intikal devam ediyor. Kapıyı açarak durak yanaşma provası yapabilir veya seyre devam edebilirsiniz.");
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(emptyNotice);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🛑 " + emptyNotice, "info");
        }

        // PAS GEÇME MANTIĞI: İnecek veya binecek yoksa, eğitim modu değilse ve son durak değilse durmadan geç
        if (!isTrainingEmpty && !isFinalStop && alighting === 0 && waiting === 0) {
            this.currentStopIndex++;
            audio.speakSequence([stopData.name + " durağını geçiyorsunuz.", "Yolcu olmadığı için duraklanmadı.", "Yeni rota hesaplanıyor."]);
            
            // Eğer varsa geçmiş UI uyarılarını temizle
            if (document.getElementById('obstacles-container')) {
                document.getElementById('obstacles-container').innerHTML = '';
            }
            this.obstacles = [];
            (this.activeNPCs || []).forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
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
        (this.activeNPCs || []).forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
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
        this.insufficientBalanceTriggeredAtStop = false;
        this.runningPassengerTriggeredAtStop = false;
        this.activePassengerEvent = null;
        this.activeRunningPassenger = false;
        if (this.runningPassengerTimer) {
            clearTimeout(this.runningPassengerTimer);
            this.runningPassengerTimer = null;
        }
        const pChoiceBox = document.getElementById('passenger-choice-box');
        if (pChoiceBox) pChoiceBox.classList.add('hidden');
        const pRunningAlert = document.getElementById('running-passenger-alert');
        if (pRunningAlert) pRunningAlert.classList.add('hidden');
        
        const isFinalArrive = (this.activeRouteData && this.activeRouteData.stops) ? (this.currentStopIndex >= this.activeRouteData.stops.length - 1) : false;
        if (typeof audio !== 'undefined' && typeof audio.playBusAnnouncement === 'function') {
            audio.playBusAnnouncement('arrive', stopData.name, { isFinal: isFinalArrive });
        } else {
            audio.speakSequence(["Durağımız:", stopData.name]);
        }
        
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
        
        // Koşan yolcu veya onay bekleyen yolcu olayı varsa hemen kalkış yapma
        if (this.activeRunningPassenger || this.activePassengerEvent) {
            return;
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

        // KOŞAN YOLCU ETKİLEŞİMİ: Kapı kapalıyken koşan yolcu varsa ve oyuncu kapıyı açarsa yolcu biner!
        if (!this.frontDoorOpen && this.activeRunningPassenger) {
            if (this.runningPassengerTimer) {
                clearTimeout(this.runningPassengerTimer);
                this.runningPassengerTimer = null;
            }
            this.activeRunningPassenger = false;
            const rAlert = document.getElementById('running-passenger-alert');
            if (rAlert) rAlert.classList.add('hidden');

            this.frontDoorOpen = true;
            const btn = document.getElementById('btn-front-door');
            if (btn) btn.innerText = "Ön Kapıyı Kapat";

            if (typeof audio !== 'undefined' && typeof audio.playPneumaticDoorOpen === 'function') audio.playPneumaticDoorOpen();
            else if (typeof audio !== 'undefined' && audio.playDoorOpen) audio.playDoorOpen();

            if (typeof audio !== 'undefined' && typeof audio.playSuccess === 'function') audio.playSuccess();

            this.passengersOnBoard++;
            this.addMoney(60);
            this.addXP(30);
            this.runningPassengerBonusCount = (this.runningPassengerBonusCount || 0) + 1;
            this.passengerComfort = Math.min(100, (this.passengerComfort || 90) + 5);

            const praise = "Helal olsun kaptanım, işe yetiştim sayende! Senin gibi şoför zor bulunur!";
            const dialogEl = document.getElementById('passenger-dialog');
            if (dialogEl) dialogEl.innerText = `"${praise}"`;
            const feedbackEl = document.getElementById('passenger-feedback');
            if (feedbackEl) {
                feedbackEl.innerText = "🏃 Koşan yolcu kapıyı açtığınız için bindi! +60 ₺ Yetişme Primi / +30 XP";
                feedbackEl.style.color = "#22c55e";
            }

            const activeBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
            const seatCapacity = activeBus ? activeBus.seatCapacity : (this.activeRouteData ? (this.activeRouteData.otobusKapasitesi || 40) : 40);
            const hudPass = document.getElementById('hud-passengers');
            if (hudPass) hudPass.innerText = `${this.passengersOnBoard} / ${seatCapacity}`;

            const fullMsg = `Kapıyı açtınız ve koşan yolcu bindi! Yolcu: ${praise} 60 Lira yetiştirme primi ve 30 tecrübe kazandınız.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(fullMsg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(fullMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🏃 Yetişen Yolcu Bonusu (+60 ₺ / +30 XP)", "success");
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
            if (this.passengersOnBoard > 0 && (this.currentStopIndex % 3 === 0)) {
                audio.speak("Kolay gelsin kaptan.");
            }
            
            if (!this.isDriving) {
                this.startBoardingLoop();
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

            // KOŞAN YOLCU OLAYI (Akıllı Durak Etkileşimi)
            // Seferdeyken ve kapı kapandığı anda %35 ihtimalle son anda yetişmeye çalışan yolcu belirir
            if (!this.isDriving && !this.runningPassengerTriggeredAtStop && this.activeRouteData && (this.currentStopIndex < this.activeRouteData.stops.length - 1)) {
                const shouldTrigger = (this.currentStopIndex === 1) || (Math.random() < 0.35);
                if (shouldTrigger) {
                    this.triggerRunningPassenger();
                    return; // Otomatik kalkış, koşan yolcu süresi bitince veya binince yapılacak
                }
            }

            if (!this.isDriving) this.checkAutoDepart();
        }
    },

    startBoardingLoop: function() {
        if (this.boardingTimer) clearInterval(this.boardingTimer);
        this.boardingTimer = null;
        if (!this.activeRouteData || !this.activeRouteData.stops) return;
        const stopData = this.activeRouteData.stops[this.currentStopIndex];
        if (!stopData) return;

        let currentWaiting = stopData.bekleyenYolcu;
        if (currentWaiting <= 0) {
            document.getElementById('passenger-dialog').innerText = '"Tüm yolcular bindi."';
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Binişler tamamlandı. Tüm yolcular bindi.");
            return;
        }

        document.getElementById('passenger-interaction').classList.remove('hidden');
        document.getElementById('passenger-dialog').innerText = '"Binişler başladı..."';
        document.getElementById('passenger-feedback').innerText = "";
        document.getElementById('stop-waiting-count').innerText = currentWaiting;

        this.boardingTimer = setInterval(() => {
            if (!this.frontDoorOpen) {
                clearInterval(this.boardingTimer);
                this.boardingTimer = null;
                return;
            }

            // Kaptan kararı bekleyen aktif olay varsa duraklat
            if (this.activePassengerEvent) {
                clearInterval(this.boardingTimer);
                this.boardingTimer = null;
                return;
            }

            if (stopData.bekleyenYolcu <= 0) {
                clearInterval(this.boardingTimer);
                this.boardingTimer = null;
                document.getElementById('passenger-dialog').innerText = '"Tüm yolcular bindi."';
                if (typeof audio !== 'undefined' && audio.speak) audio.speak("Binişler tamamlandı. Tüm yolcular bindi.");
                return;
            }

            const activeBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
            const seatCapacity = activeBus ? activeBus.seatCapacity : (this.activeRouteData.otobusKapasitesi || 40);
            const maxStanding = activeBus ? activeBus.standingCapacity : 15;

            if (this.passengersOnBoard < seatCapacity) {
                const res = this.automatedTicketProcess(false);
                if (res !== false) {
                    stopData.bekleyenYolcu--;
                    document.getElementById('stop-waiting-count').innerText = stopData.bekleyenYolcu;
                }
            } else if (this.passengersOnBoard < (seatCapacity + maxStanding)) {
                document.getElementById('passenger-dialog').innerText = '"Ayakta giderim sorun değil."';
                const res = this.automatedTicketProcess(true);
                if (res !== false) {
                    stopData.bekleyenYolcu--;
                    document.getElementById('stop-waiting-count').innerText = stopData.bekleyenYolcu;
                }
            } else {
                document.getElementById('passenger-dialog').innerText = '"Otobüs tamamen dolu, bir sonrakine bineceğim."';
                document.getElementById('passenger-feedback').innerText = "Kapasite dolu, yolcu binemedi.";
                document.getElementById('passenger-feedback').style.color = '#ef4444';
                stopData.bekleyenYolcu--;
                document.getElementById('stop-waiting-count').innerText = stopData.bekleyenYolcu;
            }

            document.getElementById('hud-passengers').innerText = `${this.passengersOnBoard} / ${seatCapacity}`;
        }, 1500);
    },

    triggerRunningPassenger: function() {
        this.runningPassengerTriggeredAtStop = true;
        this.activeRunningPassenger = true;

        const alertEl = document.getElementById('running-passenger-alert');
        if (alertEl) alertEl.classList.remove('hidden');

        const alertText = document.getElementById('running-passenger-text');
        if (alertText) alertText.innerText = '🏃 Koşan Yolcu: "Kaptanım dur bekle lütfen geliyorum, kapatma kapıyııı!" (Açmak için E tuşu veya buton)';

        const msg = "Kaptanım dur bekle lütfen geliyorum, kapatma kapıyııı! Durağa doğru koşan bir yolcu var. Kapıyı açmak için E tuşuna veya Ön Kapıyı Aç butonuna basınız.";
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);

        if (this.runningPassengerTimer) clearTimeout(this.runningPassengerTimer);
        this.runningPassengerTimer = setTimeout(() => {
            if (this.activeRunningPassenger) {
                this.activeRunningPassenger = false;
                const el = document.getElementById('running-passenger-alert');
                if (el) el.classList.add('hidden');

                const missMsg = "Yolcu durağa yetişemedi: Ah be kaptanım, kıl payı kaçırdım... Bir sonraki aracı bekleyeceğim.";
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(missMsg);
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(missMsg);

                this.checkAutoDepart();
            }
        }, 4500);
    },

    resolveInsufficientBalance: function(allowed) {
        if (!this.activePassengerEvent || this.activePassengerEvent.type !== 'insufficient_balance') return;
        this.activePassengerEvent = null;

        const choiceBox = document.getElementById('passenger-choice-box');
        if (choiceBox) choiceBox.classList.add('hidden');

        const stopData = this.activeRouteData ? this.activeRouteData.stops[this.currentStopIndex] : null;

        if (allowed) {
            // İzin verildi (Gönlü Zengin Kaptan)
            this.passengersOnBoard++;
            this.addMoney(50);
            this.addXP(25);
            this.kindnessBonusCount = (this.kindnessBonusCount || 0) + 1;
            this.passengerComfort = Math.min(100, (this.passengerComfort || 90) + 5);

            if (typeof audio !== 'undefined' && typeof audio.playSuccess === 'function') audio.playSuccess();

            const thankMsg = '"Çok sağ olun kaptanım, Allah razı olsun! Bir sonraki durakta hemen yükleyeceğim."';
            const dialogEl = document.getElementById('passenger-dialog');
            if (dialogEl) dialogEl.innerText = thankMsg;
            const feedbackEl = document.getElementById('passenger-feedback');
            if (feedbackEl) {
                feedbackEl.innerText = "❤️ Yolcuya izin verildi. +50 ₺ Gönlü Zengin Kaptan Primi ve +25 XP!";
                feedbackEl.style.color = "#22c55e";
            }

            const announce = "Yolcuya izin verdiniz. Yolcu: Çok sağ olun kaptanım, Allah razı olsun! 50 Lira gönlü zengin kaptan primi kazandınız.";
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(announce);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(announce);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("❤️ Kaptan İnsiyatifi (+50 ₺ / +25 XP)", "success");
        } else {
            // İndirildi (Kuralcı Kaptan)
            const rejectMsg = '"Peki kaptanım, canınız sağ olsun. Bir dahakine doldurup binerim, iyi nöbetler."';
            const dialogEl = document.getElementById('passenger-dialog');
            if (dialogEl) dialogEl.innerText = rejectMsg;
            const feedbackEl = document.getElementById('passenger-feedback');
            if (feedbackEl) {
                feedbackEl.innerText = "Yolcu araçtan indirildi.";
                feedbackEl.style.color = "#ef4444";
            }

            const announce = "Yolcuyu indirdiniz. Yolcu: Peki kaptanım, canınız sağ olsun, iyi nöbetler.";
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(announce);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(announce);
        }

        if (stopData && stopData.bekleyenYolcu > 0) {
            stopData.bekleyenYolcu--;
            const waitEl = document.getElementById('stop-waiting-count');
            if (waitEl) waitEl.innerText = stopData.bekleyenYolcu;
        }

        const activeBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
        const seatCapacity = activeBus ? activeBus.seatCapacity : (this.activeRouteData ? (this.activeRouteData.otobusKapasitesi || 40) : 40);
        const hudPass = document.getElementById('hud-passengers');
        if (hudPass) hudPass.innerText = `${this.passengersOnBoard} / ${seatCapacity}`;

        // 1.8 saniye sonra biniş döngüsüne devam et
        setTimeout(() => {
            if (this.frontDoorOpen && !this.isDriving) {
                this.startBoardingLoop();
            }
        }, 1800);
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
        let pricingMult = 1.0;
        if (typeof CompanySystem !== 'undefined' && CompanySystem.data && CompanySystem.data.ticketPricingMultiplier) {
            pricingMult = CompanySystem.data.ticketPricingMultiplier;
        }
        const cityName = this.activeRouteData.sehir;
        if (sehirRotalari[cityName] && sehirRotalari[cityName].ucretler) {
            let fareTicketMult = 1.0;
            if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.getInstitutionLevel === 'function') {
                const fareTicketLvl = CompanySystem.getInstitutionLevel('ticketing_network');
                if (fareTicketLvl === 2) fareTicketMult = 1.15;
                else if (fareTicketLvl === 3) fareTicketMult = 1.35;
            }
            fare = Math.round(sehirRotalari[cityName].ucretler[pType] * pricingMult * fareTicketMult);
        }
        
        let splitRes = null;
        if (pType !== "yasli") {
            splitRes = this.addMoney(fare);
        }
        this.passengersOnBoard++;
        
        if (typeof audio !== 'undefined' && typeof audio.playValidatorSound === 'function') {
            audio.playValidatorSound(pType);
        } else {
            audio.playAkbil(pType);
        }
        
        let label = pType === "tam" ? "Tam" : (pType === "ogrenci" ? "Öğrenci" : "Serbest");
        if (fare > 0 && splitRes && splitRes.companyShare > 0) {
            document.getElementById('passenger-feedback').innerText = `${label} basıldı. ${fare} ₺ (%${splitRes.companySharePercent} Şirket: ${splitRes.companyShare} ₺, Kaptan: ${splitRes.captainShare} ₺).`;
        } else {
            document.getElementById('passenger-feedback').innerText = `${label} basıldı. ${fare > 0 ? fare + ' ₺ alındı.' : 'Ücretsiz geçiş.'}`;
        }
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
        (this.activeNPCs || []).forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
        this.activeNPCs = [];
        
        if (isSuccess) {
            // Otogar Yazıhanesi Emanet & Paket Kargo Geliri
            const cargoPackagesCount = 4 + Math.floor(Math.random() * 5); // 4-8 adet emanet koli
            const cargoPerPkg = 140; // Koli başı 140 TL
            let cargoEarnings = cargoPackagesCount * cargoPerPkg;
            let agencyNote = "";

            if (typeof CompanySystem !== 'undefined' && CompanySystem.data && CompanySystem.data.terminalBranches) {
                // Eğer acente modeli ise %12 acente payı kesilir
                const currentCityKey = (this.currentCity || '').toLowerCase().replace(/[^a-z]/g, '');
                const branchObj = Object.values(CompanySystem.data.terminalBranches).find(b => typeof b === 'object');
                if (branchObj && branchObj.type === 'agency') {
                    const agencyCommission = Math.round(cargoEarnings * 0.12);
                    cargoEarnings -= agencyCommission;
                    agencyNote = " (%12 F1 Bayi komisyonu düşüldü)";
                }
            }

            this.addMoney(cargoEarnings, true);
            if (typeof CompanySystem !== 'undefined' && CompanySystem.recordTransaction) CompanySystem.recordTransaction('income', 'cargo', 'Otogar Emanet Kargo (' + cargoPackagesCount + ' Koli)', cargoEarnings);
            const cargoMsg = `📦 Otogar Yazıhanesi Emanet & Paket Kargo: ${cargoPackagesCount} koli teslim edildi (+${cargoEarnings.toLocaleString('tr-TR')} ₺)${agencyNote}.`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(cargoMsg, 'success');
            // Şirket Dinlenme Tesisi Seferi Temettüsü
            if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.getInstitutionLevel === 'function') {
                const finishResortLvl = CompanySystem.getInstitutionLevel('highway_resort');
                let finishDiv = 0;
                if (finishResortLvl === 2) finishDiv = 1500;
                else if (finishResortLvl === 3) finishDiv = 3500;
                if (finishDiv > 0) {
                    this.addMoney(finishDiv, true);
                    if (typeof CompanySystem !== 'undefined' && CompanySystem.recordTransaction) CompanySystem.recordTransaction('income', 'dividends', 'Otogar Peron Temettüsü', finishDiv);
                    const divMsg = `☕ Şirket Dinlenme Tesisi kâr payı: +${finishDiv.toLocaleString('tr-TR')} ₺ cüzdanınıza aktarıldı!`;
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(divMsg, 'success');
                }
            }

            let comfortBonus = 0;
            let comfortMsg = "";
            if (this.passengerComfort >= 80) {
                const curBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
                const tipBonusPct = (curBus && curBus.tipBonusPercent) ? curBus.tipBonusPercent : 0;
                const baseBonus = Math.round(this.passengerComfort * 1.5);
                const tipBonusAmt = Math.round(baseBonus * (tipBonusPct / 100));
                comfortBonus = baseBonus + tipBonusAmt;
                this.addMoney(comfortBonus);
                if (typeof CompanySystem !== 'undefined' && CompanySystem.recordTransaction) CompanySystem.recordTransaction('income', 'tips', 'Yolcu Konfor & Bahşiş Primi', comfortBonus);
                this.addXP(40);
                const tipNote = tipBonusPct > 0 ? ` (+%${tipBonusPct} ${curBus.brand} Lüks Kabin Bonusu)` : "";
                comfortMsg = ` Üstün sürüş kalitesi ve yolcu konfor primi: ${comfortBonus} Lira${tipNote} ve 40 tecrübe puanı kazandınız.`;
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

            // Sesli anons ve sonuç raporu completeTask tarafından tek seferde okunur
            
            if (this.activeRouteData && this.activeRouteData.isIntercity) {
                this.unlockCity(this.activeRouteData.destCity);
                if (typeof UI !== 'undefined') UI.showToast(`${this.activeRouteData.destCity} Şehrinin Kilidi Açıldı!`, 'success');
            }

            this.completeTask(comfortMsg, timingRewardMsg); // İlerlemeyi kaydet ve sonuç anonsunu yap

            // ŞOFÖR LİYAKAT VE ROZET SİSTEMİ KONTROLÜ
            if (typeof DriverBadges !== 'undefined' && typeof DriverBadges.checkAfterRoute === 'function') {
                const routeStats = {
                    isSuccess: true,
                    punctualityScore: punctualityScore,
                    passengerComfort: this.passengerComfort,
                    busHealth: (this.busDamage && typeof this.busDamage.health === 'number') ? this.busDamage.health : 100,
                    rampUsed: !!this.rampUsedInRoute,
                    lostItemFound: !!this.hasLostItemFound,
                    isNight: !!this.isNight,
                    isHeadlightsOn: !!this.isHeadlightsOn,
                    completedTasks: this.completedTasks,
                    totalDrivingSeconds: this.totalDrivingSeconds || 0,
                    retarderUsed: !!this.retarderUsedInRoute,
                    selectedBus: this.selectedBus,
                    isIntercity: !!(this.activeRouteData && this.activeRouteData.isIntercity),
                    unlockedCitiesCount: (this.unlockedCities && Array.isArray(this.unlockedCities)) ? this.unlockedCities.length : 1
                };
                DriverBadges.checkAfterRoute(routeStats);
            }
        } else {
            audio.speak("Eğitim seferi tamamlanamadı. Ceza uygulanmadı, istediğiniz zaman tekrar deneyebilirsiniz kaptan.");
        }
        
        if (document.getElementById('res-money')) document.getElementById('res-money').innerText = `${this.sessionMoney} ₺`;
        if (document.getElementById('res-penalties')) document.getElementById('res-penalties').innerText = '0 ₺ (Eğitimde Ceza Yok / Muaf)';

        // Özel Yolcu Primleri Özeti
        let smartSummaries = [];
        if (this.kindnessBonusCount > 0) smartSummaries.push(`❤️ ${this.kindnessBonusCount} Yetersiz Bakiye İzni (+${this.kindnessBonusCount * 50} ₺)`);
        if (this.runningPassengerBonusCount > 0) smartSummaries.push(`🏃 ${this.runningPassengerBonusCount} Koşan Yolcu Yetiştirildi (+${this.runningPassengerBonusCount * 60} ₺)`);
        if (this.hasLostItemFound && this.lastFoundLostItem) smartSummaries.push(`🎒 Emanet: ${this.lastFoundLostItem.name} (+${this.lastFoundLostItem.reward} ₺)`);

        const smartBox = document.getElementById('res-smart-events-box');
        const smartText = document.getElementById('res-smart-events-text');
        if (smartBox && smartText) {
            if (smartSummaries.length > 0) {
                smartBox.classList.remove('hidden');
                smartText.innerText = smartSummaries.join(" | ");
            } else {
                smartBox.classList.add('hidden');
            }
        }
        
        const totalDriveSec = Math.round(this.totalDrivingSeconds || 0);
        const driveMins = Math.floor(totalDriveSec / 60);
        const driveSecs = totalDriveSec % 60;
        const totalDurationFormatted = driveMins > 0 ? `${driveMins} Dakika ${driveSecs} Saniye` : `${driveSecs} Saniye`;
        const resDurationEl = document.getElementById('res-duration');
        if (resDurationEl) resDurationEl.innerText = totalDurationFormatted;

        if (typeof UI !== 'undefined') UI.switchScreen('results-screen');
    },

    handleKeyDown: function(e) {
        const isKeyN = (e.key === 'n' || e.key === 'N' || e.code === 'KeyN');

        // SEFER SONU VE GENEL HAT NAVİGASYONU (Ctrl + N ve Shift + N)
        // Tarayıcının yeni pencere açmasını engellemek için preventDefault çağrılır
        if ((e.ctrlKey || e.shiftKey) && isKeyN) {
            e.preventDefault();
            this.announceDestinationNavigation();
            return;
        }



        // Eğer sistem kısayolları kullanılıyorsa (NVDA, tarayıcı) oyunu etkilemesin
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        // Eğer oyun sürüş halinde değilse, mola ekranında değilse ve sanayide değilse;
        // bu tuş vuruşları ana menü veya diğer arayüzler içindir. Oyunu ilgilendirmez.
        const isDrivingScreen = document.getElementById('driving-screen') && !document.getElementById('driving-screen').classList.contains('hidden');
        if (!this.isDriving && !isDrivingScreen && document.getElementById('stop-screen').classList.contains('hidden') && !SanayiMechanic.isActive) {
            return;
        }

        const k = e.key.toLowerCase();
        // SHIFT + VİRGÜL (Shift + ,): Rastgele Telsiz Konuşmaları Yükle / Dinlet (Kanal 19)
        // İKRAM VE MUAVİN SERVİSİ (I Tuşu)
        if (k === 'i' || k === 'ı' || e.code === 'KeyI') {
            e.preventDefault();
            this.serveCatering();
            return;
        }

        const isCommaKey = (e.key === ',' || e.key === ';' || e.key === '<' || e.code === 'Comma');
        if (e.shiftKey && isCommaKey) {
            e.preventDefault();
            if (typeof Multiplayer !== 'undefined' && typeof Multiplayer.playRandomRadioChatter === 'function') {
                Multiplayer.playRandomRadioChatter();
            }
            return;
        }

        
        // Sürüş tuşlarını anında güncelle (Caps Lock, Türkçe klavye ve e.repeat fark etmeksizin)
        if (k === 'w' || e.code === 'KeyW') this.keys.w = true;
        if (k === 's' || e.code === 'KeyS') { this.keys.s = true; this.isBrakeKeyDown = true; }
        if (k === 'a' || e.code === 'KeyA') this.keys.a = true;
        if (k === 'd' || e.code === 'KeyD') this.keys.d = true;
        if (k === 'arrowup' || e.code === 'ArrowUp') this.keys.arrowup = true;
        if (k === 'arrowdown' || e.code === 'ArrowDown') { this.keys.arrowdown = true; this.isBrakeKeyDown = true; }
        if (k === 'arrowleft' || e.code === 'ArrowLeft') this.keys.arrowleft = true;
        if (k === 'arrowright' || e.code === 'ArrowRight') this.keys.arrowright = true;
        
        // Sadece oyun içindeysek ekran okuyucu veya sayfa kaydırmasını engellemek için preventDefault kullan
        if (k.startsWith('arrow') || k === ' ') {
            e.preventDefault();
        }

        // Y ve N tuşları: Eğer yetersiz bakiye olayı aktifse kaptan kararı
        if (this.activePassengerEvent && this.activePassengerEvent.type === 'insufficient_balance') {
            if (k === 'y') {
                e.preventDefault();
                this.resolveInsufficientBalance(true);
                return;
            }
            if (k === 'n') {
                e.preventDefault();
                this.resolveInsufficientBalance(false);
                return;
            }
        }

        // Shift+Oklar Pusula değişimi ui.js/CompassSystem tarafından tek merkezden yönetilir
        
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

        
                // Y TUŞU: Tek tuşla anlık pusula ve istikamet sorgusu
        if (k === 'y') {
            e.preventDefault();
            if (typeof CompassSystem !== 'undefined' && typeof CompassSystem.queryCompass === 'function') {
                CompassSystem.queryCompass();
            } else if (typeof CompassNav !== 'undefined' && typeof CompassNav.queryCompass === 'function') {
                CompassNav.queryCompass();
            }
            return;
        }

        // V TUŞU: Telsiz Sesli Konuşma (Push-to-Talk)
        if (k === 'v' || e.code === 'KeyV') {
            e.preventDefault();
            if (typeof Multiplayer !== 'undefined' && typeof Multiplayer.startVoiceRadio === 'function') {
                Multiplayer.startVoiceRadio();
            } else if (window.voiceAssistant && window.voiceAssistant.toggleListening) {
                window.voiceAssistant.toggleListening();
            }
            return;
        }

        if (k === 'o') {
            e.preventDefault();
            if (typeof audio !== 'undefined' && typeof audio.toggleDriverWindow === 'function') {
                const isOpen = audio.toggleDriverWindow();
                const winMsg = isOpen ? "Kaptan camı açıldı. Dış sesler ve serin hava kokpite doluyor." : "Kaptan camı kapatıldı. Kabin yalıtımı sağlandı.";
                if (typeof audio.speak === 'function') audio.speak(winMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(isOpen ? "🪟 Sol Cam Açıldı" : "🪟 Sol Cam Kapatıldı", "info");
            }
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

        // X TUŞU VE F4: Canlı Kaptan Radarı ve Çok Oyunculu Telsiz (Kanal 19)
        if (k === 'x' || e.code === 'KeyX' || e.key === 'F4') {
            e.preventDefault();
            if (typeof Multiplayer !== 'undefined' && Multiplayer.openRadarModal) {
                Multiplayer.openRadarModal();
            }
            return;
        }

        if (k === 'j') {
            e.preventDefault();
            this.checkLostAndFound();
            return;
        }

        if (k === 'c' || e.code === 'KeyC') {
            e.preventDefault();
            if (e.shiftKey) {
                // Shift + C: Sıcak Demli Çay Yudumlama
                if (this.isDriving && this.speed > 3) {
                    const warnMsg = "Güvenlik: Seyir halindeyken çay içilmez kaptanım. Durakta veya duraklamada keyifle yudumlayabilirsiniz.";
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(warnMsg, "warning");
                    return;
                }
                if (typeof audio !== 'undefined' && typeof audio.playTeaPourAndSip === 'function') {
                    audio.playTeaPourAndSip(() => {
                        this.passengerComfort = Math.min(100, (this.passengerComfort || 90) + 5);
                        this.addXP(15);
                        const teaMsg = "Sıcak demli çay yudumlandı. Afiyet olsun kaptanım (+15 tecrübe, +5 konfor).";
                        if (typeof audio.speak === 'function') audio.speak(teaMsg);
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("☕ Çay Yudumlandı (+15 XP, +5 Konfor)", "success");
                    });
                }
                return;
            }
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
                let durum = this.weather === 'sunny' 
                    ? (this.isNight ? 'açık gece' : 'güneşli') 
                    : (this.weather === 'rainy' ? `yağmurlu, saatte ${this.rainMmPerHour || 5} milimetre yağış` : 'karlı');
                const msg = `Saat ${timeStr}. Dış sıcaklık ${this.temperature} derece, araç içi ${Math.floor(this.busTemperature)} derece. Hava ${durum}. ${this.isACOn ? "Klima açık." : "Klima kapalı."}`;
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
            this.announceNextStopNavigation();
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
            const cap = (typeof this.getFuelCapacity === 'function') ? this.getFuelCapacity() : (this.fuelTankCapacity || 500);
            const currentFuel = (this.currentFuelLiters !== undefined) ? this.currentFuelLiters : cap;
            const liters = Math.max(0, Math.floor(currentFuel));
            const pct = Math.max(0, Math.min(100, Math.floor((currentFuel / cap) * 100)));

            let fuelSpeech = `Mevcut yakıt seviyeniz yüzde ${pct}, ${liters} litre. `;
            if (pct <= 15) {
                fuelSpeech += "⚠️ Dikkat, düşük yakıt ikazı! ";
            }

            let msg = fuelSpeech + `Araç sağlığı yüzde ${Math.floor(this.busDamage.health)}. `;
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
            if (typeof UI !== 'undefined' && UI.showToast) {
                const toastType = pct <= 15 ? 'warning' : 'info';
                UI.showToast(`⛽ Yakıt: %${pct} (${liters}/${cap} L) | 🛠️ Sağlık: %${Math.floor(this.busDamage.health)}`, toastType);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(msg);
            }
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

        // Özel aksiyonlar (Motor Çalıştırma: M veya Boşluk tuşu)
        if (k === 'm' || e.code === 'KeyM' || e.code === 'Space') {
            e.preventDefault();
            if (audio.isEngineRunning) {
                audio.stopEngine();
                if (typeof audio.speak === 'function') audio.speak("Motor durduruldu.");
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🛑 Motor Durduruldu", "warning");
            } else {
                audio.startEngine();
                if (typeof audio.speak === 'function') audio.speak("Motor çalıştırıldı.");
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🔑 Motor Çalıştırıldı", "success");
            }
            if (!this.isDriving) this.checkAutoDepart();
        }
        if (k === 'l' || k === 'k') {
            e.preventDefault();
            if (typeof audio !== 'undefined' && typeof audio.playHorn === 'function') {
            // Karşıdan gelen meslektaş kornasına selam verme
            if (this.colleagueGreetingActive) {
                this.colleagueGreetingActive = false;
                this.addMoney(25);
                this.addXP(15);
                const greetMsg = "Meslektaşınıza selam verdiniz! Karşı hattan selektör ve dostça korna aldınız (+25 ₺, +15 XP).";
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(greetMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🚌 Meslektaşa Selam Verildi (+25 ₺, +15 XP)", "success");
            }
                audio.playHorn();
                if (typeof Multiplayer !== 'undefined' && Multiplayer.broadcastHorn) {
                    Multiplayer.broadcastHorn();
                }
            }
            // Öndeki aracı uyar: Korna çalınca öndeki araç panikle fiziksel olarak sağa kırar ve gaza basar
            if (this.activeNPCs && this.activeNPCs.length > 0) {
                (this.activeNPCs || []).forEach(npc => {
                    if (!npc.hasCollided && npc.type === 'ahead' && npc.y > 0 && npc.y < 220) {
                        npc.baseSpeed += 25; // Motor devrini artırıp hızlanır
                        npc.targetX = 82;    // Sağa emniyet şeridine yumuşak direksiyon kırar
                        if (!npc.horned && audio.playNPCHorn) {
                            npc.horned = true;
                            setTimeout(() => audio.playNPCHorn((npc.x - this.lanePosition) / 30), 350);
                        }
                    }
                });
            }
        }
        if (k === 'pageup' || k === 'e') {
            e.preventDefault();
            this.toggleFrontDoor();
        }
        if (k === 'pagedown' || k === 'q') {
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
                audio.playSwitchClick(); // Şalter sesi
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
        
        if (k === 'w' || e.code === 'KeyW') this.keys.w = false;
        if (k === 's' || e.code === 'KeyS') { this.keys.s = false; this.isBrakeKeyDown = false; }
        if (k === 'a' || e.code === 'KeyA') this.keys.a = false;
        if (k === 'd' || e.code === 'KeyD') this.keys.d = false;
        if (k === 'arrowup' || e.code === 'ArrowUp') this.keys.arrowup = false;
        if (k === 'arrowdown' || e.code === 'ArrowDown') { this.keys.arrowdown = false; this.isBrakeKeyDown = false; }
        if (k === 'arrowleft' || e.code === 'ArrowLeft') this.keys.arrowleft = false;
        if (k === 'arrowright' || e.code === 'ArrowRight') this.keys.arrowright = false;
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
    // Sefer Sonu Navigasyonu (Ctrl + N ve Shift + N) - Global Tarayıcı Koruması
    if ((e.ctrlKey || e.shiftKey) && (e.key === 'n' || e.key === 'N' || e.code === 'KeyN')) {
        e.preventDefault();
        if (typeof Game !== 'undefined' && typeof Game.announceDestinationNavigation === 'function') {
            Game.announceDestinationNavigation();
        }
        return;
    }
    if (e.key === 'F1') {
        e.preventDefault();
        if (window.voiceAssistant && window.voiceAssistant.toggleTutorialModal) {
            window.voiceAssistant.toggleTutorialModal();
        }
        return;
    }
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
            
            // Kademe Binası Seviyesine Göre Onarım Süresi (Hatta Geri Dönme Hızı)
            let repairDuration = 2000;
            if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.getInstitutionLevel === 'function') {
                const kademeLvl = CompanySystem.getInstitutionLevel('maintenance_depot');
                if (kademeLvl === 2) repairDuration = 1000; // %50 Daha Hızlı Onarım (Liftler & Diagnostik)
                else if (kademeLvl >= 3) repairDuration = 500;  // %75 Hızlı Ekspres Onarım (Mega Revizyon Üssü)
            }

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
        if (typeof Game.refuel === 'function') Game.refuel();
        
        document.getElementById('btn-start-game').innerText = "Kaldığın Yerden Devam Et";
        
        UI.switchScreen('title-screen');
        // Erişilebilirlik için butona direkt odaklan
        document.getElementById('btn-start-game').focus();
        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Ana menüye döndünüz. Ekrandaki 'Kaldığın Yerden Devam Et' düğmesine tıklayarak veya enter tuşuna basarak yarım kalan seferinize devam edebilirsiniz.");
    }
};



if (typeof window !== 'undefined') {
    window.Game = Game;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}

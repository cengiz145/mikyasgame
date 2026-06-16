/* ==========================================================================
   TÃœRKÄ°YE TURNESÄ° - OTOBÃœS SÄ°MÃœLASYONU OYUN MOTORU (GAME.JS)
 ==========================================================================
   TÃœRKÄ°YE TURNESÄ° - OTOBÃœS SÄ°MÃœLASYONU OYUN MOTORU (GAME.JS)
   ========================================================================== */

const Game = {
    // --- State Variables ---
    username: null,
    licenseLevel: parseInt(localStorage.getItem('licenseLevel')) || 1, // 1: Ã‡Ä±rak, 2: Kalfa, 3: Usta, 4: Uzun Yol
    completedTasks: parseInt(localStorage.getItem('completedTasks')) || 0, // 0 to 26
    playerBudget: parseFloat(localStorage.getItem('para')) || 0,
    clockMinutes: parseFloat(localStorage.getItem('clockMinutes')) || 480, // VarsayÄ±lan 08:00 (480 dakika)
    unlockedCities: (() => {
        try {
            return JSON.parse(localStorage.getItem('unlockedCities')) || ["TekirdaÄŸ"];
        } catch(e) {
            return ["TekirdaÄŸ"];
        }
    })(),
    currentCity: localStorage.getItem('merkezUs') || "TekirdaÄŸ",
    
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
    steeringAngle: 0, // Direksiyon aÃ§Ä±sÄ± (-30 ile +30 arasÄ±)
    driftVelocity: 0, // RÃ¼zgar / EÄŸim kayma hÄ±zÄ±
    targetDriftVelocity: 0,
    lastDriftChangeTime: 0,
    isDriving: false,
    isBeingTowed: false, // Ã‡ekici durumu
    savedState: null, // Kaza anÄ± kayÄ±t noktasÄ±
    busDamage: { leftWindow: 0, rightWindow: 0, front: 0, wipers: 0, headlights: 0, exhaust: 0, health: 100 }, // Hasar durumu
    lastFrameTime: 0,
    animationFrameId: null,
    kasisDistance: null, // Kasis (Speed bump) iÃ§in mesafe
    lastRearHitTime: 0,
    passengerAngerTimer: 0,
    engineRPM: 800,
    currentGear: 1,
    obstacles: [],
    
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
                    console.warn("Offline mod: Firebase baÄŸlantÄ±sÄ± yok, yerel verilerle devam ediliyor.");
                    resolve();
                    return;
                }

                this.username = username;
                const ref = window.db.ref('otobus_simulasyonu/kullanicilar/' + username);
                
                let isResolved = false;
                const timeoutId = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        console.warn("Firebase yanÄ±t vermiyor (Ä°nternet yavaÅŸ veya yok), yerel verilerle devam ediliyor.");
                        resolve();
                    }
                }, 2000);

                ref.once('value').then((snapshot) => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timeoutId);

                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        this.licenseLevel = data.licenseLevel || 1;
                        this.completedTasks = data.completedTasks || 0;
                        this.playerBudget = data.playerBudget || 0;
                        this.clockMinutes = data.clockMinutes || 480;
                        this.unlockedCities = data.unlockedCities || ["TekirdaÄŸ"];
                        this.currentCity = data.currentCity || "TekirdaÄŸ";
                    } else {
                        this.saveData(); // Yeni profil
                    }
                    resolve();
                }).catch(err => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timeoutId);
                    console.error("Firebase yÃ¼kleme hatasÄ±:", err);
                    resolve();
                });
            } catch (fatalError) {
                console.error("Firebase kritik hata, yerel kayÄ±tla devam:", fatalError);
                resolve();
            }
        });
    },

    saveData: function() {
        // Local fallback backup
        localStorage.setItem('licenseLevel', this.licenseLevel);
        localStorage.setItem('completedTasks', this.completedTasks);
        localStorage.setItem('para', this.playerBudget);
        localStorage.setItem('clockMinutes', this.clockMinutes);
        localStorage.setItem('unlockedCities', JSON.stringify(this.unlockedCities));
        localStorage.setItem('merkezUs', this.currentCity);

        // Firebase Cloud Save
        try {
            if (window.db && this.username) {
                window.db.ref('otobus_simulasyonu/kullanicilar/' + this.username).set({
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
            console.error("Firebase senkronizasyon hatasÄ± (Senkron denendi ama baÅŸarÄ±sÄ±z oldu)", e);
        }
    },

    getLicenseTitle: function() {
        if (this.licenseLevel === 1) return "1. SÄ±nÄ±f Ehliyet (Ã‡Ä±raklÄ±k)";
        if (this.licenseLevel === 2) return "2. SÄ±nÄ±f Ehliyet (KalfalÄ±k)";
        if (this.licenseLevel === 3) return "3. SÄ±nÄ±f Ehliyet (UstalÄ±k)";
        if (this.licenseLevel === 4) return "Ä°lÃ§eler ArasÄ± ÅofÃ¶r";
        return "Uzun Yol ÅofÃ¶rÃ¼";
    },

    completeTask: function() {
        if (!this.activeRouteId) return;

        // Find which task index the active route corresponds to
        // If the player played the exact task they needed to progress, increment completedTasks.
        // Route IDs are generated as `_task_0` to `_task_39`.
        const taskMatch = this.activeRouteId.match(/_task_(\d+)/);
        if (taskMatch) {
            const taskIndex = parseInt(taskMatch[1]);
            if (taskIndex === this.completedTasks) {
                this.completedTasks++;
            }
            
            // BUG FIX 1: Ehliyet seviyesi atlama garantisi (Strict eÅŸitlik yerine >=)
            if (this.completedTasks >= 40) this.licenseLevel = Math.max(this.licenseLevel, 5); // Uzun Yol
            else if (this.completedTasks >= 30) this.licenseLevel = Math.max(this.licenseLevel, 4); // Ä°lÃ§eler ArasÄ±
            else if (this.completedTasks >= 20) this.licenseLevel = Math.max(this.licenseLevel, 3); // UstalÄ±k
            else if (this.completedTasks >= 10) this.licenseLevel = Math.max(this.licenseLevel, 2); // KalfalÄ±k

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
        this.playerBudget -= amount;
        this.sessionPenalties += amount;
        if (this.playerBudget < 0) this.playerBudget = 0;
        this.saveData();
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
        this.activeRouteId = routeId;
        this.activeRouteData = routesData[routeId];
        
        if (!this.activeRouteData) return;

        document.getElementById('garage-route-desc').innerHTML = `
            <strong>${this.activeRouteData.name}</strong><br>
            <small>${this.activeRouteData.desc}</small>
        `;
        
        this.mode = 'driver';
        UI.switchScreen('garage-screen');
    },

    resumeFromSave: function() {
        if (!this.savedState) return;
        
        this.activeRouteData = this.savedState.routeData;
        this.currentStopIndex = this.savedState.stopIndex;
        this.currentDistanceToNext = this.savedState.distance;
        this.currentRoadType = this.savedState.roadType;
        
        // Temizle
        this.savedState = null;
        document.getElementById('btn-start-game').innerText = "Yeni Bir Oyuna BaÅŸla";
        
        // SÃ¼rÃ¼ÅŸ durumunu ayarla
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
        this.airPressure = 120; // BUG FIX: Sanayiden Ã§Ä±kÄ±nca hava tanklarÄ± fullenir
        this.isEmergencyBrakeLocked = false;
        this.isLowAirAlarmActive = false;
        this.isHeadlightsOn = false;
        this.isNight = (this.clockMinutes < 360 || this.clockMinutes >= 1080); // BaÅŸlangÄ±Ã§ saat kontrolÃ¼
        
        // Ambient sesleri ve UI
        audio.playStreetAmbience();
        
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }

        UI.switchScreen('driving-screen');
        audio.stopMenuMusic();
        audio.startEngine(); // BUG FIX: Motoru yeniden baÅŸlat
        
        // BUG FIX: EÄŸer kaza yapmadan Ã¶nce Ã¶zel bir hava durumu varsa geri getir
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
        this.isHeadlightsOn = false; // Farlar baÅŸlangÄ±Ã§ta kapalÄ±
        this.kasisDistance = null;
        this.lastRearHitTime = 0;
        this.passengerAngerTimer = 0;
        this.engineRPM = 800;
        this.currentGear = 1;
        
        // ZAMAN VE HAVA DURUMU SÄ°STEMÄ°
        audio.stopWeather(); // Mevcut hava olayÄ±nÄ± temizle
        this.isNight = (this.clockMinutes < 360 || this.clockMinutes >= 1080); // Gece baÅŸlangÄ±cÄ± kontrolÃ¼
        
        const rand = Math.random();
        if (rand < 0.2) {
            this.weather = 'snowy';
            this.temperature = Math.floor(Math.random() * 11) - 10; // -10 ile 0 arasÄ±
            audio.startWeather('snowy');
        } else if (rand < 0.5) {
            this.weather = 'rainy';
            this.temperature = Math.floor(Math.random() * 11) + 5; // 5 ile 15 arasÄ±
            audio.startWeather('rainy');
        } else {
            this.weather = 'sunny';
            this.temperature = Math.floor(Math.random() * 16) + 20; // 20 ile 35 arasÄ±
            // GÃ¼neÅŸli havada Ã¶zel ses yok
        }
        
        // Klima baÅŸlangÄ±Ã§ deÄŸerleri
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
        this.totalDistanceCovered = 0; // 3D Ses koordinat sistemi iÃ§in
        
        // PnÃ¶matik (Hava) Sistemi DeÄŸiÅŸkenleri
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
        
        // Zemin Ses KaynaklarÄ±nÄ± Haritaya YerleÅŸtir (3D)
        audio.placeAmbientSources(this.activeRouteData, this.licenseLevel);
        
        this.lastFrameTime = performance.now();
        this.nextNavSoundTime = this.lastFrameTime + 10000 + Math.random() * 20000; // 10-30s sonra ilk ses
        this.nextAmbienceTime = this.lastFrameTime + 5000 + Math.random() * 5000;
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        
        this.planNextStop();
    },

    planNextStop: function(isResume = false) {
        if (this.currentStopIndex >= this.activeRouteData.stops.length) {
            this.finishRoute(true);
            return;
        }
        
        const nextStop = this.activeRouteData.stops[this.currentStopIndex];
        
        // Zemin AkustiÄŸini Ayarla (Dinamik Ä°lÃ§e/Durak BazlÄ±)
        let stopNameLower = (nextStop.name || "").toLowerCase();
        
        let isOtoyolArea = stopNameLower.includes("malkara") || stopNameLower.includes("Ã§orlu") || 
            stopNameLower.includes("Ã§erkezkÃ¶y") || stopNameLower.includes("ergene") || 
            stopNameLower.includes("kÄ±nalÄ±") || stopNameLower.includes("otoyol");

        // Otoyol kuralÄ±: Sadece Ehliyet Seviyesi 5 (ÅehirlerarasÄ±) ve Ã¼zeri ise aÃ§Ä±lÄ±r.
        if (isOtoyolArea && this.licenseLevel >= 5) {
            audio.currentTerrain = "otoyol";
        } 
        else if (typeof sehirRotalari !== 'undefined' && sehirRotalari[this.activeRouteId] && sehirRotalari[this.activeRouteId].terrain) {
            // Åehrin genel terrain'ine dÃ¶n
            audio.currentTerrain = sehirRotalari[this.activeRouteId].terrain;
        } else {
            audio.currentTerrain = "asfalt";
        }
        
        if (!isResume) {
            // OSRM HESAPLAMASI BAÅLIYOR (GeÃ§ici olarak oyunu duraklat)
            const wasDriving = this.isDriving;
            this.isDriving = false; // Rota hesaplanana kadar otobÃ¼s hareket etmesin
            
            // EÄŸer sanayi menÃ¼sÃ¼nde falan deÄŸilsek, sesli ve gÃ¶rsel bilgi ver
            if (!document.getElementById('garage-screen').classList.contains('hidden') === false) {
                if (typeof audio.speak === 'function') audio.speak("Rota hesaplanÄ±yor, lÃ¼tfen bekleyin.");
                if (typeof UI !== 'undefined') UI.showToast("GerÃ§ek yol ve kasis bilgileri indiriliyor...", "info");
            }

            let lat1, lon1, lat2, lon2;
            if (this.currentStopIndex === 0) {
                lat2 = nextStop.lat; lon2 = nextStop.lon;
                lat1 = lat2 - 0.01; lon1 = lon2 - 0.01; // GarajÄ± duraÄŸa Ã§ok yakÄ±n varsayÄ±yoruz
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
                        this.currentDistanceToNext = route.distance; // OSRM gerÃ§ek mesafe (metre)
                        
                        // Kasis EÅŸleÅŸtirme (Polyline ve OSM verisi ile)
                        const coords = route.geometry.coordinates; // [[lon, lat], [lon, lat]]
                        let accumulatedDistance = 0;
                        
                        const cityBumps = (typeof window.cityBumps !== 'undefined') ? window.cityBumps[this.currentCity] : [];
                        
                        if (cityBumps && cityBumps.length > 0) {
                            for (let i = 0; i < coords.length - 1; i++) {
                                let c1 = coords[i]; let c2 = coords[i+1];
                                // Segment mesafesi (kuÅŸ uÃ§uÅŸu - OSRM genelde sÄ±k noktalÄ±dÄ±r)
                                let d = typeof calculateDistance === 'function' ? calculateDistance(c1[1], c1[0], c2[1], c2[0]) * 1000 : 50;
                                accumulatedDistance += d;
                                
                                // Bu segment etrafÄ±nda kasis var mÄ±?
                                cityBumps.forEach(bump => {
                                    let distToBump = typeof calculateDistance === 'function' ? calculateDistance(bump.lat, bump.lon, c2[1], c2[0]) * 1000 : 100;
                                    if (distToBump < 50) { // 50 metre yakÄ±ndaysa yolda kabul et
                                        // AynÄ± kasisi tekrar ekleme
                                        if (!this.routeBumps.find(b => b.lat === bump.lat && b.lon === bump.lon)) {
                                            this.routeBumps.push({ lat: bump.lat, lon: bump.lon, distance: accumulatedDistance, passed: false });
                                        }
                                    }
                                });
                            }
                        }
                        
                        if (typeof UI !== 'undefined' && document.getElementById('garage-screen').classList.contains('hidden')) {
                            UI.showToast("GerÃ§ek yol oluÅŸturuldu!", "success");
                        }
                    } else {
                        this.currentDistanceToNext = fallbackDistance;
                    }
                })
                .catch(err => {
                    console.error("OSRM HatasÄ±:", err);
                    this.currentDistanceToNext = fallbackDistance;
                    if (typeof UI !== 'undefined') UI.showToast("OSRM baÄŸlantÄ±sÄ± koptu, yapay rotaya dÃ¶nÃ¼ldÃ¼.", "warning");
                })
                .finally(() => {
                    if (this.currentDistanceToNext <= 0 || isNaN(this.currentDistanceToNext)) {
                        this.currentDistanceToNext = fallbackDistance || 1000;
                    }
                    this.isDriving = wasDriving; // SÃ¼rÃ¼ÅŸÃ¼ geri baÅŸlat
                    
                    // DURAN OYUN DÃ–NGÃœSÃœNÃœ YENÄ°DEN BAÅLAT
                    if (this.isDriving) {
                        this.lastFrameTime = performance.now();
                        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
                    }

                    if (typeof audio.speak === 'function' && document.getElementById('garage-screen').classList.contains('hidden')) {
                        audio.speak("Rota hazÄ±r. Ä°lerleyebilirsiniz.");
                    }
                });
        } else {
            this.routeBumps = this.savedState && this.savedState.routeBumps ? this.savedState.routeBumps : [];
        }

        // --- YENÄ°: EtkileÅŸimli Navigasyon DÃ¶nÃ¼ÅŸ NoktalarÄ± ---
        this.upcomingTurns = [];
        let numTurns = Math.floor(this.currentDistanceToNext / 1500);
        if (numTurns > 3) numTurns = 3;
        
        const directions = [
            { dir: "tam saÄŸa", req: 100 },
            { dir: "hafif saÄŸa", req: 50 },
            { dir: "tam sola", req: 100 },
            { dir: "hafif sola", req: 50 },
            { dir: "kavÅŸaktan tam saÄŸa dÃ¶nÃ¼n", req: 150, special: true },
            { dir: "dÃ¼z ilerleyin", req: 0, special: true }
        ];

        let remainingDistance = this.currentDistanceToNext;
        for(let i=0; i<numTurns; i++) {
            remainingDistance -= (500 + Math.random() * 1000);
            if (remainingDistance > 300) {
                const randType = directions[Math.floor(Math.random() * directions.length)];
                
                // Mesafeye gÃ¶re rastgele bildirim noktalarÄ± oluÅŸtur
                const initialDistToTurn = this.currentDistanceToNext - remainingDistance;
                const allMilestones = [1000, 800, 500, 300, 100];
                
                // Sadece dÃ¶nÃ¼ÅŸe yeterince mesafe varsa o kilometre taÅŸÄ±nÄ± dahil et
                let valid = allMilestones.filter(m => m < initialDistToTurn - 50);
                
                // Her noktada %40 ihtimalle sessiz kal (Ã§ok konuÅŸup darlamamasÄ± iÃ§in)
                let selectedMilestones = valid.filter(() => Math.random() > 0.4);
                
                // EÄŸer ÅŸans eseri hepsi silinmiÅŸse, en az 1 tane uyarÄ± bÄ±rak
                if (valid.length > 0 && selectedMilestones.length === 0) {
                    selectedMilestones.push(valid[Math.floor(Math.random() * valid.length)]);
                }
                
                // 0 (Åimdi dÃ¶nÃ¼n) uyarÄ±sÄ± her zaman var
                selectedMilestones.push(0);
                // BÃ¼yÃ¼kten kÃ¼Ã§Ã¼ÄŸe sÄ±rala
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
        // UzaklÄ±ÄŸa gÃ¶re bÃ¼yÃ¼kten kÃ¼Ã§Ã¼ÄŸe sÄ±rala
        this.upcomingTurns.sort((a,b) => b.distance - a.distance);

        document.getElementById('hud-next-stop').innerText = `${nextStop.name} (${this.currentStopIndex + 1}/${this.activeRouteData.stops.length})`;
        document.getElementById('hud-passengers').innerText = `${this.passengersOnBoard} / ${this.activeRouteData.otobusKapasitesi}`;
        
        this.currentRoadType = nextStop.yolTipi || "Asfalt Cadde";
        this.upcomingIntersection = nextStop.kavsakVar || false;
        this.intersectionAnnounced = false;
        
        // HÄ±z limitini yola gÃ¶re ayarla
        if (this.currentRoadType === "Mahalle SokaÄŸÄ±") {
            this.maxSpeed = 50;
        } else if (this.currentRoadType === "Toprak Yol" || this.currentRoadType === "Kumlu Yol" || this.currentRoadType === "Ã‡imenli Yol") {
            this.maxSpeed = 40;
        } else {
            this.maxSpeed = 90; // Asfalt, Sahil Åeridi vb.
        }

        // FÄ°ZÄ°KSEL GÃ–RÃœÅ CEZASI (Visibility Penalty) - KÃ–R OYUNCULAR Ä°Ã‡Ä°N KALDIRILDI
        // Oyuncular ekranÄ± gÃ¶rmediÄŸi iÃ§in farlarÄ±n kapalÄ± olmasÄ± sebebiyle hÄ±zlarÄ±nÄ±n 20'ye dÃ¼ÅŸmesini "bug" sanÄ±yor.
        this.hasPoorVisibility = false;
        
        let kalanDurak = this.activeRouteData.stops.length - this.currentStopIndex;
        
        if (this.currentStopIndex === 0) {
            audio.speakSequence([
                "Åu anki konumunuz:", `${Game.currentCity} Merkez GarajÄ±.`, 
                "Ä°lk hedefiniz:", nextStop.name,
                "Bu gÃ¶revde toplam", this.activeRouteData.stops.length.toString(), "durak bulunmaktadÄ±r.",
                `Yol durumu: ${this.currentRoadType}`
            ]);
        } else {
            let sequence = ["Bir sonraki durak:", nextStop.name];
            if (kalanDurak === 1) {
                sequence.push("Bu, gÃ¶revin son duraÄŸÄ±dÄ±r.");
            }
            audio.speakSequence(sequence);
        }
    },

    // 3 Ä°htimalli Kaza Sistemi (0: HasarsÄ±z, 1: KÄ±smi %50 Hasar, 2: Tam %100 KÄ±rÄ±lma)
    calculateCrashOutcome: function(damageAmount) {
        let chance = Math.random() * 100;
        
        // Ã‡ok hafif Ã§arpmalarda genelde kurtarÄ±rÄ±z
        if (damageAmount < 20) {
            if (chance < 80) return 0; // %80 ihtimal hasarsÄ±z (Sadece kaporta sesi)
            return 1; // %20 ihtimal kÄ±smi hasar
        }
        
        // Orta ÅŸiddetli Ã§arpmalar
        if (damageAmount >= 20 && damageAmount < 50) {
            if (chance < 40) return 0; // %40 hasarsÄ±z
            if (chance < 80) return 1; // %40 kÄ±smi hasar
            return 2; // %20 tam kÄ±rÄ±lma
        }
        
        // YÃ¼ksek ÅŸiddetli Ã§arpmalar
        if (chance < 15) return 0; // %15 ÅŸansla mucizevi kurtuluÅŸ
        if (chance < 50) return 1; // %35 kÄ±smi hasar
        return 2; // %50 tam kÄ±rÄ±lma
    },

    gameLoop: function(currentTime) {
        if (!this.isDriving) return;
        
        let deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // --- ZAMANIN AKIÅI (Toplam 60 dakika: 45 dk gÃ¼ndÃ¼z, 15 dk gece) ---
        if (this.speed > 5) {
            let timeMultiplier = this.isNight ? 0.8 : (720 / 2700);
            this.clockMinutes += deltaTime * timeMultiplier;
            // BUG FIX 6: Zaman sÄ±nÄ±rsÄ±z bÃ¼yÃ¼mesin, 24 saat dÃ¶ngÃ¼sÃ¼ne girsin
            this.clockMinutes = this.clockMinutes % 1440; 
        }
        
        let wasNight = this.isNight;
        this.isNight = (this.clockMinutes < 360 || this.clockMinutes >= 1080); 
        
        // BUG FIX 4: GÃ¼ndÃ¼z/Gece deÄŸiÅŸimi anÄ±nda far uyarÄ±sÄ± ve ambiyans deÄŸiÅŸikliÄŸi
        if (wasNight !== this.isNight) {
            if (this.isNight) {
                if (typeof audio.speak === 'function') audio.speak("AkÅŸam oldu, lÃ¼tfen farlarÄ±nÄ±zÄ± aÃ§mayÄ± unutmayÄ±n.");
            } else {
                if (typeof audio.speak === 'function') audio.speak("Sabah oldu, gÃ¼naydÄ±n kaptan.");
            }
        }
        
        // DÄ°NAMÄ°K HAVA DURUMU
        if (!this.lastWeatherCheckTime) this.lastWeatherCheckTime = currentTime;
        
        let weatherChangeChance = this.weather === 'rainy' ? 0.2 : 0.4; // YaÄŸmur kolay kolay bitmesin
        if (currentTime - this.lastWeatherCheckTime > 60000) {
            this.lastWeatherCheckTime = currentTime;
            
            if (Math.random() < weatherChangeChance) {
                let oldWeather = this.weather;
                let rand = Math.random();
                
                if (this.isNight) {
                    if (rand < 0.3) {
                        this.weather = 'snowy';
                        this.temperature = Math.floor(Math.random() * 11) - 10;
                    } else if (rand < 0.7) {
                        this.weather = 'rainy';
                        this.temperature = Math.floor(Math.random() * 11) + 5;
                    } else {
                        this.weather = 'sunny'; 
                        this.temperature = Math.floor(Math.random() * 11) + 10;
                    }
                } else {
                    if (rand < 0.1) {
                        this.weather = 'snowy';
                        this.temperature = Math.floor(Math.random() * 11) - 5;
                    } else if (rand < 0.4) {
                        this.weather = 'rainy';
                        this.temperature = Math.floor(Math.random() * 11) + 10;
                    } else {
                        this.weather = 'sunny';
                        this.temperature = Math.floor(Math.random() * 16) + 20;
                    }
                }

                if (oldWeather !== this.weather) {
                    audio.stopWeather();
                    if (this.weather === 'snowy') {
                        audio.startWeather('snowy');
                        audio.speak("Hava bozdu, kar yaÄŸÄ±ÅŸÄ± baÅŸladÄ±. Yollar buzlanabilir.");
                    } else if (this.weather === 'rainy') {
                        this.rainIntensity = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arasÄ± baÅŸlar
                        this.lastRainCheckTime = currentTime;
                        this.nextRainChangeDelay = 20000 + Math.random() * 20000;
                        audio.startWeather('rainy', this.rainIntensity);
                        
                        if (this.rainIntensity === 1) audio.speak("Hafif bir yaÄŸmur Ã§iselemeye baÅŸladÄ±.");
                        else if (this.rainIntensity === 2) audio.speak("YaÄŸmur baÅŸladÄ±, yollar kayganlaÅŸabilir.");
                        else audio.speak("Aniden bastÄ±ran ÅŸiddetli saÄŸanak yaÄŸÄ±ÅŸ baÅŸladÄ±!");
                    } else {
                        audio.speak(this.isNight ? "Hava aÃ§tÄ±, bulutlar daÄŸÄ±ldÄ±." : "GÃ¼neÅŸ aÃ§tÄ±, hava gÃ¼zelleÅŸiyor.");
                    }
                }
            }
        }

        // YAÄMUR ÅÄ°DDETÄ° EVRÄ°MÄ°
        if (this.weather === 'rainy') {
            if (!this.lastRainCheckTime) this.lastRainCheckTime = currentTime;
            if (!this.nextRainChangeDelay) this.nextRainChangeDelay = 20000;
            
            if (currentTime - this.lastRainCheckTime > this.nextRainChangeDelay) {
                this.lastRainCheckTime = currentTime;
                this.nextRainChangeDelay = 15000 + Math.random() * 30000; // 15-45 saniye arasÄ± deÄŸiÅŸir
                
                // %60 ihtimalle ÅŸiddet deÄŸiÅŸir
                if (Math.random() < 0.6) {
                    let oldIntensity = this.rainIntensity || 1;
                    let change = Math.random() < 0.5 ? 1 : -1;
                    this.rainIntensity = Math.max(1, Math.min(4, oldIntensity + change));
                    
                    if (this.rainIntensity !== oldIntensity) {
                        if (typeof audio.setRainIntensity === 'function') {
                            audio.setRainIntensity(this.rainIntensity);
                        }
                        
                        if (this.rainIntensity === 1) {
                            audio.speak("YaÄŸmur iyice hafifledi, sadece Ã§iseliyor.");
                        } else if (this.rainIntensity === 2) {
                            if (oldIntensity < 2) audio.speak("YaÄŸmur hÄ±zlandÄ±, yollar Ä±slanÄ±yor.");
                            else audio.speak("YaÄŸmurun ÅŸiddeti biraz azaldÄ±.");
                        } else if (this.rainIntensity === 3) {
                            if (oldIntensity < 3) audio.speak("Åiddetli saÄŸanak yaÄŸÄ±ÅŸ baÅŸladÄ±, dikkatli sÃ¼rÃ¼n.");
                            else audio.speak("FÄ±rtÄ±na dindi fakat saÄŸanak yaÄŸÄ±ÅŸ devam ediyor.");
                        } else if (this.rainIntensity === 4) {
                            audio.speak("Ã‡ok ÅŸiddetli fÄ±rtÄ±na ve saÄŸanak var! GÃ¶rÃ¼ÅŸ mesafesi sÄ±fÄ±r, hÄ±zÄ±nÄ±zÄ± dÃ¼ÅŸÃ¼rÃ¼n!");
                        }
                    }
                }
            }
        }

        // BUG FIX: EÄŸer sekme arka planda kalÄ±rsa deltaTime aÅŸÄ±rÄ± bÃ¼yÃ¼r ve fizik motorunu patlatÄ±r.
        // Bunu engellemek iÃ§in deltaTime deÄŸerini maksimum 0.1 saniye (100ms) ile sÄ±nÄ±rlandÄ±rÄ±yoruz.
        if (deltaTime > 0.1) deltaTime = 0.1;

        // Ã‡ekici (Tow Truck) Yapay Zeka (Otopilot) Modu
        if (this.isBeingTowed) {
            let targetSpeed = 70; // Ã‡ekicinin hedef hÄ±zÄ±
            let targetLane = 50;  // Ã‡ekicinin hedef ÅŸeridi (Orta)
            
            // YavaÅŸÃ§a Park Etme ZekasÄ±: Sanayiye 400 metreden az kaldÄ±ysa yavaÅŸla
            if (this.currentDistanceToNext < 400) {
                targetSpeed = Math.min(targetSpeed, Math.max(5, (this.currentDistanceToNext / 400) * 70));
            }
            
            // Ã‡arpÄ±ÅŸma Ã–nleme ZekasÄ± (Sadece kendi ÅŸeridimizdekileri tara)
            let closestNPC = null;
            let closestDist = Infinity;
            
            for (let i = 0; i < this.activeNPCs.length; i++) {
                let npc = this.activeNPCs[i];
                // Sadece Ã¶nÃ¼mÃ¼zde olan ve ÅŸeridimizi tÄ±kayan araÃ§lar
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
                // Ã‡ekici zekasÄ±: Sollamaya Ã§alÄ±ÅŸÄ±p makas atmak yerine fren yapÄ±p arkasÄ±nda beklesin (Daha aÄŸÄ±rbaÅŸlÄ±)
                targetSpeed = Math.min(targetSpeed, Math.max(0, closestNPC.baseSpeed - 5));
            }
            
            // Virajlarda ve makaslarda devrilmemek iÃ§in yavaÅŸla
            if (Math.abs(this.steeringAngle) > 2.0) {
                targetSpeed = Math.min(targetSpeed, 40);
            }
            
            // HÄ±z kontrolcÃ¼sÃ¼ (Gaz/Fren simÃ¼lasyonu)
            // BUG FIX 8: Ã‡ekici otopilot titreme hatasÄ± (Sert ivmelenme yerine pÃ¼rÃ¼zsÃ¼z clamp)
            if (this.speed < targetSpeed) {
                this.acceleration = 12; // Gaza bas
                if (this.speed + (this.acceleration * deltaTime) > targetSpeed) {
                    this.speed = targetSpeed; // Titremeyi engellemek iÃ§in direkt sabitle
                    this.acceleration = 0;
                }
            } else if (this.speed > targetSpeed + 5) {
                this.acceleration = -15; // Frene bas
            } else {
                this.acceleration = 0; // HÄ±zÄ± koru
                this.speed = targetSpeed; // SÃ¼rtÃ¼nme kaynaklÄ± (acceleration=-5) dÃ¼ÅŸÃ¼ÅŸleri ve titremeyi iptal et
            }
            
            // Direksiyon kontrolcÃ¼sÃ¼ (Åerit takip asistanÄ±)
            let steeringDiff = targetLane - this.lanePosition;
            if (Math.abs(steeringDiff) > 1) {
                // Åeride doÄŸru direksiyon Ã§evir
                this.steeringAngle = steeringDiff > 0 ? 1.5 : -1.5;
            } else {
                this.steeringAngle = 0; // Åeridi bulduk, direksiyonu topla
            }
            
            // Yol bittiÄŸinde (Sanayiye varÄ±ldÄ±ÄŸÄ±nda)
            if (this.currentDistanceToNext <= 0) {
                this.isBeingTowed = false;
                this.isDriving = false;
                this.speed = 0;
                this.acceleration = 0;
                this.steeringAngle = 0;
                audio.speak("Sanayiye vardÄ±k. AraÃ§ indiriliyor. GeÃ§miÅŸ olsun usta.");
                document.getElementById('nav-feedback').innerText = "TEKÄ°RDAÄ SANAYÄ° - VARIÅ";
                document.getElementById('hud-speed').innerText = `HÄ±z: 0 km/s`;
                
                // Sanayi moduna geÃ§
                SanayiMechanic.start();
                return;
            }
        }

        // --- Cadde Ortam Sesi ---
        // KullanÄ±cÄ± isteÄŸi Ã¼zerine kapatÄ±ldÄ±: Sadece NPC'ler trafiÄŸi temsil edecek
        /*
        if ((this.currentRoadType === "Asfalt Cadde" || this.currentRoadType === "Sahil Åeridi Yolu") && this.speed > 10) {
            if (currentTime > this.nextAmbienceTime) {
                audio.playStreetAmbience();
                this.nextAmbienceTime = currentTime + 8000 + Math.random() * 10000; // 8-18 saniye arasÄ±
            }
        }
        */

        // --- EtkileÅŸimli Navigasyon (Mesafe ve DÃ¶nÃ¼ÅŸ Takibi) ---
        if (this.upcomingIntersection && !this.intersectionAnnounced && this.currentDistanceToNext < 300 && this.speed > 0) {
            audio.speak("Ä°leride kavÅŸak var, lÃ¼tfen yavaÅŸlayÄ±n.");
            this.intersectionAnnounced = true;
        }

        if (this.upcomingTurns && this.upcomingTurns.length > 0 && this.speed > 5) {
            const currentTurn = this.upcomingTurns[0];
            const distToTurn = this.currentDistanceToNext - currentTurn.distance;

            if (distToTurn < -250 && currentTurn.state !== "completed") {
                audio.speak("YanlÄ±ÅŸ yÃ¶ne saptÄ±nÄ±z, rota yeniden hesaplanÄ±yor.");
                document.getElementById('nav-feedback').innerText = "YanlÄ±ÅŸ yÃ¶ne girildi! Rota +100m uzadÄ±.";
                document.getElementById('nav-feedback').style.color = '#ef4444';
                
                this.currentDistanceToNext += 100;
                
                // Zaman aÅŸÄ±ldÄ±ÄŸÄ±nda dÃ¶nÃ¼ÅŸÃ¼ diziden Ã§Ä±kar ki sonsuza kadar kalmasÄ±n
                this.upcomingTurns.shift();
                
                // Yeni bir dÃ¶nÃ¼ÅŸ hesapla ve baÅŸa ekle (rota yeniden hesaplandÄ±ÄŸÄ± iÃ§in)
                if (this.currentDistanceToNext > 500) {
                    const directions = [
                        { dir: "tam saÄŸa", req: 100 },
                        { dir: "hafif saÄŸa", req: 50 },
                        { dir: "tam sola", req: 100 },
                        { dir: "hafif sola", req: 50 },
                        { dir: "kavÅŸaktan tam saÄŸa dÃ¶nÃ¼n", req: 150, special: true }
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
                
                // KavÅŸaÄŸa 50 metre kala Ã§apraz trafik (gerÃ§ek kavÅŸak hissi) sesi Ã§al
                if (distToTurn <= 50 && !currentTurn.playedIntersectionSound) {
                    audio.playIntersectionTraffic();
                    currentTurn.playedIntersectionSound = true;
                }

                let triggeredMilestone = null;
                let visOffset = this.hasPoorVisibility ? 50 : 0; // GÃ¶rÃ¼ÅŸ kÃ¶tÃ¼yse tabelayÄ± 50m geÃ§ fark et
                
                while (currentTurn.milestones.length > 0 && distToTurn <= currentTurn.milestones[0] - visOffset) {
                    triggeredMilestone = currentTurn.milestones.shift();
                }
                
                if (triggeredMilestone !== null) {
                    if (typeof audio.playNavChime === 'function') audio.playNavChime();
                    
                    if (triggeredMilestone === 0) {
                        const nowVariants = [
                            `Åimdi ${currentTurn.direction} dÃ¶nÃ¼n.`,
                            `LÃ¼tfen ÅŸimdi ${currentTurn.direction} dÃ¶nÃ¼n.`,
                            `Buradan ${currentTurn.direction} dÃ¶nÃ¼n.`
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
                            `${distText} sonra ${currentTurn.direction} dÃ¶nÃ¼n.`,
                            `LÃ¼tfen ${distText} sonra ${currentTurn.direction} yÃ¶nelin.`,
                            `Ä°lerideki kavÅŸaktan, ${distText} sonra ${currentTurn.direction} dÃ¶nÃ¼n.`,
                            `${distText} ileriden ${currentTurn.direction} sapÄ±n.`
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
                    // DÃ¼z ilerleyin
                    if (currentTime > currentTurn.lastWarningTime + 3000) {
                        currentTurn.state = "completed";
                        this.upcomingTurns.shift();
                    }
                } else {
                    // YENÄ°: Viraj (Yol KÄ±vrÄ±mÄ±) FiziÄŸi
                    let curveSpeed = 25; // Viraj savurma kuvveti
                    
                    if (currentTurn.direction.includes("saÄŸa")) {
                        this.roadCurvature = -curveSpeed; // SaÄŸa viraj, sola savurur
                    } else if (currentTurn.direction.includes("sola")) {
                        this.roadCurvature = curveSpeed; // Sola viraj, saÄŸa savurur
                    } else if (currentTurn.direction === "U dÃ¶nÃ¼ÅŸÃ¼ yapÄ±n") {
                        this.roadCurvature = -curveSpeed * 1.5; 
                    }
                    
                    // AraÃ§ hareket ettiÄŸi sÃ¼rece virajÄ± dÃ¶nmÃ¼ÅŸ (ilerlemiÅŸ) sayÄ±lÄ±r
                    if (this.speed > 5) {
                        currentTurn.currentProgress += (this.speed / 3.6) * deltaTime * 5; // HÄ±za baÄŸlÄ± ilerleme (HÄ±zlandÄ±rÄ±ldÄ±)
                    }
                    
                    document.getElementById('nav-feedback').innerText = `Viraj DÃ¶nÃ¼lÃ¼yor... %${Math.min(100, Math.floor((currentTurn.currentProgress/currentTurn.requiredProgress)*100))}`;
                    document.getElementById('nav-feedback').style.color = '#eab308';
                    
                    // SESLÄ° GERÄ°BÄ°LDÄ°RÄ°M: AraÃ§ virajÄ± dÃ¶nerken hÄ±zÄ±na baÄŸlÄ± olarak 300ms'de bir "tÄ±k" sesi Ã§al (kÃ¶r oyuncuya virajda olduÄŸunu hatÄ±rlatÄ±r)
                    if (!currentTurn.lastTickTime || currentTime > currentTurn.lastTickTime + 300) {
                        if (this.speed > 5) audio.playTurnTick();
                        currentTurn.lastTickTime = currentTime;
                    }
                    
                    if (currentTurn.currentProgress >= currentTurn.requiredProgress) {
                        audio.speak("DÃ¶nÃ¼ÅŸ tamamlandÄ±, ÅŸimdi devam edin.");
                        document.getElementById('nav-feedback').innerText = "DÃ¶nÃ¼ÅŸ BaÅŸarÄ±lÄ±!";
                        document.getElementById('nav-feedback').style.color = '#22c55e'; // Green
                        setTimeout(() => {
                            if (document.getElementById('nav-feedback').innerText === "DÃ¶nÃ¼ÅŸ BaÅŸarÄ±lÄ±!") {
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

        // --- PnÃ¶matik Fren Sistemi ---
        if (audio.isEngineRunning) {
            // KompresÃ¶r havayÄ± doldurur
            if (this.airPressure < 120) {
                let prevPressure = this.airPressure;
                this.airPressure += 2 * deltaTime; // Saniyede 2 PSI dolsun
                if (this.airPressure >= 120 && prevPressure < 120) {
                    this.airPressure = 120;
                    audio.playAirGovernorCutoff(); // Tahliye valfi Ã§uf-tÄ±ss
                }
            }
        }
        
        let isBraking = (this.keys.s || this.keys.arrowdown);
        
        // BUG FIX: Ã‡ekici Ã¼zerindeyken fren yapÄ±lamasÄ±n
        if (this.isBeingTowed) {
            isBraking = false;
        }
        
        if (isBraking) {
            if (!this.isBrakeKeyDown) {
                // Frene ilk basÄ±ÅŸta pompalama cezasÄ± (-5 PSI anlÄ±k tahliye)
                this.airPressure -= 5;
                this.isBrakeKeyDown = true;
                audio.playBrakeRelease(); // TÄ±ss
                
                // Retarder (Motor Freni) Etkisi: 30 km/s'den hÄ±zlÄ±ysak ve imdat kilitli deÄŸilse
                if (this.speed > 30 && !this.isEmergencyBrakeLocked && typeof audio.playRetarder === 'function') {
                    audio.playRetarder(5, this.speed); // 5 saniyelik retarder simÃ¼lasyonu
                }
            }
            // GerÃ§ek otobÃ¼slerde frene basÄ±lÄ± tutmak havayÄ± tÃ¼ketmez, sadece basÄ±p bÄ±rakmak tÃ¼ketir!
        } else {
            if (this.isBrakeKeyDown) {
                this.isBrakeKeyDown = false;
                if (typeof audio.stopRetarder === 'function') {
                    audio.stopRetarder();
                }
            }
        }
        
        // HavanÄ±n sÄ±fÄ±rÄ±n altÄ±na dÃ¼ÅŸmesini engelle
        this.airPressure = Math.max(0, this.airPressure);
        
        // DÃ¼ÅŸÃ¼k Hava Ä°kazÄ± (60 PSI altÄ±)
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
        
        // Ä°mdat Freni Kilitlenmesi (30 PSI altÄ±)
        if (this.airPressure < 30) {
            if (!this.isEmergencyBrakeLocked) {
                this.isEmergencyBrakeLocked = true;
                audio.playEmergencyBrakeLock();
                audio.speak("UyarÄ±! Hava basÄ±ncÄ± kritik seviyede. Ä°mdat frenleri kilitlendi.");
            }
        } else if (this.airPressure >= 60.5) { // BUG FIX 9: Hysteresis eklendi (60 yerine 60.5) float sÄ±nÄ±r dÃ¶ngÃ¼sÃ¼nÃ¼ engeller
            // Hava basÄ±ncÄ± yeterli seviyeye ulaÅŸtÄ±ÄŸÄ±nda imdatlarÄ± Ã§Ã¶z
            if (this.isEmergencyBrakeLocked) {
                this.isEmergencyBrakeLocked = false;
                audio.playBrakeRelease(); // Ä°mdat Ã§Ã¶zÃ¼ldÃ¼
                audio.speak("Hava basÄ±ncÄ± yeterli seviyeye ulaÅŸtÄ±. Ä°mdat frenleri Ã§Ã¶zÃ¼ldÃ¼.");
            }
        }
        
        // Ä°mdat kilitliyse araba hÄ±zlanamaz, gaza basma iptal edilir
        if (this.isEmergencyBrakeLocked) {
            this.keys.w = false;
            this.keys.arrowup = false;
        }
        
        // BUG FIX: GerÃ§ek otobÃ¼slerde kapÄ±lar aÃ§Ä±kken gaza basamazsÄ±n (KapÄ± Fren Ä°nterlok Sistemi)
        // AYRICA: Ã‡ekici Ã¼zerindeyken gaz verilmesini engelle
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

        // FÄ°ZÄ°K MOTORU VE KULLANICI GÄ°RÄ°ÅLERÄ° (Ã‡EKÄ°CÄ° MODUNDA KÄ°LÄ°TLENÄ°R)
        if (!this.isBeingTowed) {
            // Motor kapalÄ±ysa araÃ§ gidemez
            if (!audio.isEngineRunning) {
                this.acceleration = -5; // Sadece sÃ¼rtÃ¼nme
            } else {
                // TONAJ (AÄIRLIK) HESAPLAMASI
                const baseWeight = 12000; // BoÅŸ otobÃ¼s 12 Ton
                const currentWeight = baseWeight + (this.passengersOnBoard * 75); // Her yolcu 75 kg
                const weightMultiplier = baseWeight / currentWeight; // BoÅŸken 1.0, 18 ton iken ~0.66
                
                // Ehliyet seviyesine gÃ¶re zorluk
                const difficultyMultiplier = 1 + (this.licenseLevel * 0.2);

                if (this.keys.w || this.keys.arrowup) {
                    this.acceleration = (24 * difficultyMultiplier) * weightMultiplier; // Doluyken hantallaÅŸÄ±r
                } else if (this.keys.s || this.keys.arrowdown) {
                    this.acceleration = -25 * weightMultiplier; // Doluyken durmak daha zor olur (fren mesafesi uzar)
                    if (this.isEmergencyBrakeLocked) this.acceleration = -80 * weightMultiplier; // Ä°mdatlar kilitliyken sÃ¼per fren
                } else {
                    this.acceleration = -5 * weightMultiplier; // SÃ¼rtÃ¼nme (AÄŸÄ±r vasÄ±ta momentumu korur)
                    if (this.isEmergencyBrakeLocked) this.acceleration = -80 * weightMultiplier; // ZÄ±nk diye kilitlenme ivmesi
                }
            }

            // --- Direksiyon ve DoÄŸal Kayma (Drift) MekaniÄŸi ---
            
            let steeringSpeed = 60; // Direksiyon Ã§evirme hÄ±zÄ±
            let autoCenterSpeed = 20; // Direksiyonun kendi kendine toplanma hÄ±zÄ±
            
            if (this.keys.a || this.keys.arrowleft) {
                this.steeringAngle -= steeringSpeed * deltaTime;
            } else if (this.keys.d || this.keys.arrowright) {
                this.steeringAngle += steeringSpeed * deltaTime;
            } else {
                // TuÅŸa basÄ±lmÄ±yorsa direksiyonu yavaÅŸÃ§a merkeze topla
                if (this.steeringAngle > 0) {
                    this.steeringAngle = Math.max(0, this.steeringAngle - autoCenterSpeed * deltaTime);
                } else if (this.steeringAngle < 0) {
                    this.steeringAngle = Math.min(0, this.steeringAngle + autoCenterSpeed * deltaTime);
                }
            }
        }
        
        // Direksiyon aÃ§Ä±sÄ± sÄ±nÄ±rlarÄ± (-30 ile +30 arasÄ±)
        this.steeringAngle = Math.max(-30, Math.min(30, this.steeringAngle));
        
        // Rastgele DoÄŸal Kayma Kuvveti (Drift)
        // RÃ¼zgar ve yol eÄŸimi her 2 saniyede bir hafif deÄŸiÅŸebilir
        if (!this.lastDriftChangeTime || currentTime > this.lastDriftChangeTime + 2000) {
            // -2 ile +2 arasÄ±nda rastgele bir Ã§ekim kuvveti
            this.targetDriftVelocity = (Math.random() - 0.5) * 6;
            this.lastDriftChangeTime = currentTime;
        }
        // driftVelocity'yi yavaÅŸÃ§a target'a yaklaÅŸtÄ±r
        this.driftVelocity += (this.targetDriftVelocity - this.driftVelocity) * 2 * deltaTime;
        
        // HÄ±zla orantÄ±lÄ± olarak ÅŸerit pozisyonunu gÃ¼ncelle
        let speedFactor = this.speed / 50; // 50 km/h baz alÄ±ndÄ±
        
        let roadCurvature = this.roadCurvature || 0;
        
        // GÃ¶rÃ¼ÅŸ kÃ¶tÃ¼yse (far/silecek yok) ve hÄ±z limiti aÅŸÄ±lmÄ±ÅŸsa araÃ§ kontrolden Ã§Ä±kar
        let visDriftMultiplier = 1;
        if (this.hasPoorVisibility && this.speed > this.maxSpeed + 10) {
            visDriftMultiplier = 3.5; // KÃ¶tÃ¼ gÃ¶rÃ¼ÅŸte aÅŸÄ±rÄ± hÄ±z inanÄ±lmaz bir savrulma yaratÄ±r
        }
        
        let lateralVelocity = (this.steeringAngle + this.driftVelocity * visDriftMultiplier + roadCurvature) * speedFactor;
        
        this.lanePosition += lateralVelocity * deltaTime;

        // --- SAVRULMA (SKIDDING) VE ZORLANMA EFEKTÄ° ---
        let isSkidding = false;
        let skidIntensity = 0;
        let skidThreshold = 50;
        let angleThreshold = 20;

        if (this.weather === 'rainy') {
            let intensity = this.rainIntensity || 1;
            skidThreshold = 45 - (intensity * 5); // 1->40, 2->35, 3->30, 4->25
            angleThreshold = 20 - (intensity * 2); // 1->18, 2->16, 3->14, 4->12
        } else if (this.weather === 'snowy') {
            skidThreshold = 25; // Karda Ã§ok daha erken savrulur
            angleThreshold = 10; // Karda Ã§ok az bir direksiyon manevrasÄ± bile kaydÄ±rÄ±r
        }

        if (this.speed > skidThreshold && Math.abs(this.steeringAngle) > angleThreshold && !this.isBeingTowed) {
            isSkidding = true;
            skidIntensity = (Math.abs(this.steeringAngle) - angleThreshold) / 10;
            
            if (this.weather === 'rainy') skidIntensity *= (1.0 + (this.rainIntensity || 1) * 0.25);
            else if (this.weather === 'snowy') skidIntensity *= 2.5; // Karda inanÄ±lmaz bir savrulma katsayÄ±sÄ±
            
            skidIntensity = Math.min(1.0, skidIntensity);

            // Zorlanma: Savrulurken hÄ±z kaybÄ± yaÅŸanÄ±r (Fren etkisi)
            let baseSpeedLoss = 12;
            if (this.weather === 'rainy') baseSpeedLoss = 15 + ((this.rainIntensity || 1) * 3);
            else if (this.weather === 'snowy') baseSpeedLoss = 30; // Buzda patinaj ve tutunma kaybÄ± Ã§ok fazladÄ±r
            
            let speedLoss = baseSpeedLoss * skidIntensity * deltaTime;
            this.speed = Math.max(0, this.speed - speedLoss);

            // Savrulma: AraÃ§ dÃ¶nÃ¼ÅŸ yÃ¶nÃ¼nÃ¼n dÄ±ÅŸÄ±na doÄŸru kontrolsÃ¼z kayar
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

        // FÄ°ZÄ°K ETKÄ°LERÄ°: Toprak yolda veya yaÄŸmur/karda ivmelenme zorlaÅŸÄ±r, maksimum hÄ±z deÄŸiÅŸir
        let currentMaxSpeed = this.maxSpeed;
        let currentAcceleration = this.acceleration;
        
        if (audio.currentTerrain === "toprak") {
            currentMaxSpeed = 50; // Toprak yolda en fazla 50km/s
            if (currentAcceleration > 0) currentAcceleration *= 0.6; // Ä°vmelenme %40 azalÄ±r
        } else if (audio.currentTerrain === "otoyol") {
            currentMaxSpeed = 130; // Otoyolda 130 km/s'e kadar Ã§Ä±kÄ±labilir
        }
        
        // HAVA DURUMU CEZALARI
        if (this.weather === 'rainy') {
            if (currentAcceleration > 0) currentAcceleration *= 0.8;
            this.driftVelocity += (this.targetDriftVelocity * 0.5) * deltaTime;
        } else if (this.weather === 'snowy') {
            currentMaxSpeed = Math.min(currentMaxSpeed, 70); // Karda maksimum hÄ±z Ã§ok kÄ±sÄ±tlanÄ±r
            if (currentAcceleration > 0) currentAcceleration *= 0.4; // Karda kalkÄ±ÅŸ Ã§ok zordur (patinaj)
            this.driftVelocity += (this.targetDriftVelocity * 1.5) * deltaTime; // Karda sÃ¼rekli yalpalar
        }

        this.speed += currentAcceleration * deltaTime;
        if (this.speed > currentMaxSpeed && this.acceleration > 0) {
            this.speed -= 10 * deltaTime; // YavaÅŸÃ§a limite Ã§ek
        }
        if (this.speed < 0) {
            this.speed = 0;
        }
        
        // BUG FIX: Otomatik Retarder Kapatma (HÄ±z 10'un altÄ±na dÃ¼ÅŸerse motor freni devreden Ã§Ä±kar)
        if (this.speed < 10 && this.isBrakeKeyDown && typeof audio.stopRetarder === 'function') {
            audio.stopRetarder();
        }

        // RPM VE VÄ°TES MANTIÄI
        let isThrottleOn = this.keys.w;
        let targetRPM = 800;
        const gearSpeedRatios = [0, 25, 45, 65, 90, 130]; 

        if (this.speed > 0 || isThrottleOn) {
            let currentMinSpeed = gearSpeedRatios[this.currentGear - 1];
            let currentMaxSpeed = gearSpeedRatios[this.currentGear];
            
            let speedInGear = this.speed - currentMinSpeed;
            let gearRange = currentMaxSpeed - currentMinSpeed;
            
            let speedRatio = Math.max(0, Math.min(1, speedInGear / gearRange));
            targetRPM = 1000 + (speedRatio * 1500); // 1000 ile 2500 arasÄ±
            
            if (isThrottleOn) {
                targetRPM += 300; // Gaza basÄ±ldÄ±ÄŸÄ±nda devir ÅŸiÅŸer
            }
        }
        
        // RPM yumuÅŸak geÃ§iÅŸ
        this.engineRPM += (targetRPM - this.engineRPM) * 3 * deltaTime;
        
        // Vites Atma (YukarÄ±)
        if (this.engineRPM > 2400 && this.currentGear < 5 && this.speed > gearSpeedRatios[this.currentGear] * 0.9) {
            this.currentGear++;
            this.engineRPM = 1500; // Vites atÄ±nca devir dÃ¼ÅŸer
        }
        // Vites DÃ¼ÅŸÃ¼rme (AÅŸaÄŸÄ±)
        else if (this.currentGear > 1 && this.speed < gearSpeedRatios[this.currentGear - 1] + 5) {
            this.currentGear--;
            this.engineRPM = 2200; // Vites kÃ¼Ã§Ã¼lÃ¼nce devir artar
        }

        audio.updateEngineSound(this.speed, this.engineRPM, this.currentGear);
        if (typeof audio.updateTireNoise === 'function') audio.updateTireNoise(this.speed, this.currentRoadType);
        if (typeof audio.updateWeatherSound === 'function') audio.updateWeatherSound(this.speed, this.weather);

        document.getElementById('hud-speed').innerText = Math.floor(this.speed);

        // Motor Panning (AracÄ±n yalpalamasÄ±na gÃ¶re motor sesinin saÄŸ/sol hoparlÃ¶re kaymasÄ±)
        if (typeof audio.updateBusPosition === 'function') {
            audio.updateBusPosition(this.lanePosition);
        }

        // Yol kenarÄ±na sÃ¼rtÃ¼nme engeli (Ã–lÃ¼m sistemi kaldÄ±rÄ±ldÄ±)
        if (this.lanePosition <= 15 || this.lanePosition >= 85) {
            this.speed = Math.max(0, this.speed - (15 * deltaTime)); // Kare hÄ±zÄ±ndan baÄŸÄ±msÄ±z (zaman tabanlÄ±) sÃ¼rtÃ¼nme
            this.lanePosition = Math.max(15, Math.min(85, this.lanePosition)); // Yolda tut
        }

        if (this.speed > 0) {
            // GERÃ‡EKÃ‡Ä° OYUN Ã–LÃ‡EÄÄ°: 1 gerÃ§ek kilometre = Oyun iÃ§inde 250 metre sÃ¼rÃ¼ÅŸ sÃ¼resi (4 kat hÄ±zlÄ±)
            const distanceScale = 4;
            const distanceCovered = (this.speed / 3.6) * deltaTime * distanceScale; 
            this.currentDistanceToNext -= distanceCovered;
            this.totalDistanceCovered += distanceCovered; // 3D Ses uzayÄ± iÃ§in ilerleme kaydÄ±
            
            if (this.currentDistanceToNext <= 0) {
                // BUG FIX: Ã‡ekici sanayiye gÃ¶tÃ¼rÃ¼rken normal durak mantÄ±ÄŸÄ± Ã§alÄ±ÅŸmamalÄ±!
                if (this.isBeingTowed) {
                    this.isBeingTowed = false;
                    this.isDriving = false;
                    this.speed = 0;
                    this.acceleration = 0;
                    this.steeringAngle = 0;
                    
                    // MOTORU SUSTUR VE PARK ET
                    if (typeof audio.stopEngine === 'function') audio.stopEngine();
                    
                    if (typeof audio.speak === 'function') audio.speak("Sanayiye yavaÅŸÃ§a park ettik. Motor kapatÄ±ldÄ±. GeÃ§miÅŸ olsun usta.");
                    document.getElementById('nav-feedback').innerText = "TEKÄ°RDAÄ SANAYÄ° - VARIÅ";
                    document.getElementById('hud-speed').innerText = `HÄ±z: 0 km/s`;
                    
                    // Sanayi moduna geÃ§
                    if (typeof SanayiMechanic !== 'undefined') SanayiMechanic.start();
                    return;
                } else {
                    this.arriveAtStop();
                    return;
                }
            }
            document.getElementById('hud-distance').innerText = Math.floor(this.currentDistanceToNext);
            
            // ETA (Tahmini VarÄ±ÅŸ SÃ¼resi) Hesaplama
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
            
        // Arkadan Ã‡arpma (Rear-end collision) MantÄ±ÄŸÄ±
        if (this.speed > 50 && this.acceleration < -100) {
            if (currentTime - this.lastRearHitTime > 5000 && Math.random() < 0.02) {
                this.lastRearHitTime = currentTime;
                this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 20); // Tek seferde kopmaz, %20 hasar alÄ±r
                this.busDamage.health = Math.max(0, this.busDamage.health - 10);
                if (typeof audio.playRearCrash === 'function') audio.playRearCrash();
                if (typeof audio.speak === 'function') audio.speak("Arkadan Ã§arptÄ±lar! Egzoz hasar aldÄ±.");
            }
        }
        
        // Kasis MantÄ±ÄŸÄ± (Speed Bump) - GerÃ§ek Kasisler + Nadir SÃ¼rpriz Kasisler
        if (this.kasisDistance === null && this.totalDistanceCovered > 500) {
            let foundRealBump = false;
            
            // 1. GerÃ§ek Kasis KontrolÃ¼ (Haritadan gelen routeBumps)
            if (this.routeBumps && this.routeBumps.length > 0) {
                let nextBumpIndex = this.routeBumps.findIndex(b => !b.passed && b.distance - this.totalDistanceCovered > 0 && b.distance - this.totalDistanceCovered < 350);
                if (nextBumpIndex !== -1) {
                    this.routeBumps[nextBumpIndex].passed = true;
                    this.kasisDistance = 300;
                    foundRealBump = true;
                    if (typeof audio.speak === 'function') audio.speak("300 metre ileride gerÃ§ek kasis var, hÄ±zÄ±nÄ±zÄ± otuzun altÄ±na dÃ¼ÅŸÃ¼rÃ¼n.");
                }
            }
            
            // BUG FIX 5: SÃ¼rpriz Kasis Spam HatasÄ± (Cooldown/Mesafe Kilidi Eklendi)
            if (!this.lastRandomKasisDistance) this.lastRandomKasisDistance = 0;
            if (!foundRealBump && (this.totalDistanceCovered - this.lastRandomKasisDistance > 1000) && Math.random() < 0.0001) {
                this.lastRandomKasisDistance = this.totalDistanceCovered; // En az 1 km sonra tekrar Ã§Ä±kabilir
                this.kasisDistance = 300; // 300 metre ileride kasis
                if (typeof audio.speak === 'function') audio.speak("300 metre ileride kasis var, hÄ±zÄ±nÄ±zÄ± otuzun altÄ±na dÃ¼ÅŸÃ¼rÃ¼n.");
            }
        }
        
        if (this.kasisDistance !== null) {
            let traveled = (this.speed / 3.6) * deltaTime; // metre cinsinden alÄ±nan yol
            this.kasisDistance -= traveled;
            
            if (this.kasisDistance <= 0) {
                // Kasisten geÃ§iÅŸ anÄ±
                if (this.speed > 45) { // GÃ¼venli geÃ§iÅŸ hÄ±zÄ± 30'dan 45'e Ã§Ä±karÄ±ldÄ±
                    let outcome = this.calculateCrashOutcome(35);
                    this.busDamage.health = Math.max(0, this.busDamage.health - 5);
                    if (typeof audio.playUnderbodyHit === 'function') audio.playUnderbodyHit();
                    
                    if (outcome === 0) {
                        if (typeof audio.speak === 'function') audio.speak("Kasise Ã§ok hÄ±zlÄ± girdik, otobÃ¼sÃ¼n altÄ±nÄ± vurduk ama ÅŸanslÄ±yÄ±z, egzoza bir ÅŸey olmadÄ±!");
                    } else if (outcome === 1) {
                        this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 25); // %25 hasar
                        if (typeof audio.speak === 'function') audio.speak("Kasise hÄ±zlÄ± girdik, altÄ±nÄ± vurduk. Egzoz hasar aldÄ±.");
                    } else {
                        this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 50); // %50 hasar
                        if (typeof audio.speak === 'function') audio.speak("Kasise Ã§ok hÄ±zlÄ± girdik, altÄ±nÄ± sert vurduk ve egzoz aÄŸÄ±r hasar aldÄ±!");
                    }
                } else {
                    // GÃ¼venli geÃ§iÅŸ sesi (Hafif zÄ±plama)
                }
                this.kasisDistance = null; // Kasis geÃ§ildi
            }
        }
        
        // Egzoz Koptuysa SÃ¼rtÃ¼nme ve Motor Sesi KontrolÃ¼
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
            // ERKEN UYARI (Hafif tÄ±slama/Ä±slÄ±k sesi)
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

        // KLÄ°MA VE SICAKLIK FÄ°ZÄ°ÄÄ°
        // ==========================================
        
        // BUG FIX 7: Cam aÃ§Ä±kken veya kÄ±rÄ±ksa klimanÄ±n etkisi iptal olur (Termodinamik Fix)
        let isAnyWindowOpen = (typeof audio.isWindowOpen !== 'undefined' && audio.isWindowOpen) || 
                              this.busDamage.leftWindow >= 100 || 
                              this.busDamage.rightWindow >= 100;
                              
        let targetTemp = this.temperature; // DÄ±ÅŸarÄ±daki hava
        if (this.isACOn && !isAnyWindowOpen) {
            targetTemp = 22; // Ancak camlar kapalÄ±ysa ve klima aÃ§Ä±ksa 22 dereceyi hedefler
        }
        
        if (this.busTemperature < targetTemp) {
            this.busTemperature += deltaTime * 0.1; // Saniyede 0.1 derece Ä±sÄ±nÄ±r
            if (this.busTemperature > targetTemp) this.busTemperature = targetTemp;
        } else if (this.busTemperature > targetTemp) {
            this.busTemperature -= deltaTime * 0.1; // Saniyede 0.1 derece soÄŸur
            if (this.busTemperature < targetTemp) this.busTemperature = targetTemp;
        }
        
        if (document.getElementById('hud-temp')) {
            document.getElementById('hud-temp').innerText = `${Math.floor(this.busTemperature)}Â°C ${this.isACOn && !isAnyWindowOpen ? '(AC)' : ''}`;
        }

        // Yolcu SÄ±caklÄ±k Tepkileri (Tolerans Sistemi)
        if (this.passengersOnBoard > 0) {
            let comfortRange = this.isACOn ? 4 : 2; // Klima aÃ§Ä±ksa tolerans daha yÃ¼ksek
            if (this.busTemperature > (22 + comfortRange) || this.busTemperature < (22 - comfortRange)) {
                this.passengerAngerTimer += deltaTime;
                if (this.passengerAngerTimer > 30) { // 30 saniye boyunca ÅŸikayetÃ§i oldular
                    this.passengerAngerTimer = 0; // SayacÄ± sÄ±fÄ±rla, tekrar ÅŸikayet etmeleri iÃ§in zaman ver
                    
                    if (this.busTemperature > (22 + comfortRange)) {
                        const complaints = [
                            '"ÅofÃ¶r bey yandÄ±k, klimayÄ± aÃ§ar mÄ±sÄ±n?"',
                            '"Ä°Ã§erisi hamam gibi oldu, nefes alamÄ±yoruz!"',
                            '"Ã‡ok sÄ±cak, piÅŸiyoruz burada!"'
                        ];
                        document.getElementById('passenger-dialog').innerText = complaints[Math.floor(Math.random() * complaints.length)];
                        document.getElementById('passenger-feedback').innerText = "Yolcular sÄ±caktan rahatsÄ±z oldu.";
                        document.getElementById('passenger-feedback').style.color = '#ef4444';
                        if (typeof audio.speak === 'function') audio.speak("Yolcular sÄ±caktan ÅŸikayet ediyor. LÃ¼tfen klimayÄ± aÃ§Ä±n.");
                    } else if (this.busTemperature < (22 - comfortRange)) {
                        const complaints = [
                            '"BurasÄ± buz gibi oldu, donduracaksÄ±n bizi!"',
                            '"ÅofÃ¶r bey Ã¼ÅŸÃ¼yoruz, Ä±sÄ±tÄ±cÄ±yÄ± aÃ§ar mÄ±sÄ±n?"',
                            '"Ã‡ok soÄŸuk, hasta olacaÄŸÄ±z!"'
                        ];
                        document.getElementById('passenger-dialog').innerText = complaints[Math.floor(Math.random() * complaints.length)];
                        document.getElementById('passenger-feedback').innerText = "Yolcular soÄŸuktan rahatsÄ±z oldu.";
                        document.getElementById('passenger-feedback').style.color = '#ef4444';
                        if (typeof audio.speak === 'function') audio.speak("Yolcular soÄŸuktan ÅŸikayet ediyor. LÃ¼tfen klimayÄ± aÃ§Ä±p 22 dereceye ayarlayÄ±n.");
                    }
                }
            } else {
                // SÄ±caklÄ±k idealse yolcular sakinleÅŸir
                if (this.passengerAngerTimer > 0) {
                    this.passengerAngerTimer -= deltaTime * 2; // HÄ±zlÄ±ca sakinleÅŸirler
                    if (this.passengerAngerTimer < 0) this.passengerAngerTimer = 0;
                }
            }
        }
        
        // Yayalar (NPC) - SÃ¼rekli devrede (Ã‡ekicideyken DE Ã§alÄ±ÅŸÄ±r, trafik akar)
        this.spawnAndMoveNPCs(deltaTime);

        // YaÄŸmurlu/KarlÄ± havada camda su damlalarÄ± veya kar efekti (Silecek mantÄ±ÄŸÄ±)
        if (this.weather === 'rainy' || this.weather === 'snowy') {
            if (audio.isWiperOn) {
                document.getElementById('weather-overlay').style.opacity = '0';
            } else {
                // Silecek kapalÄ±ysa cam yavaÅŸ yavaÅŸ kapanÄ±r
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
        let spawnChance = 0.005; // Daha dengeli bir trafik
        
        // Sadece 1 araÃ§ olsun ki kafa karÄ±ÅŸÄ±klÄ±ÄŸÄ± olmasÄ±n ve HÄ±zÄ±mÄ±z 20'nin Ã¼zerindeyse yeni araÃ§ doÄŸsun
        if (this.speed >= 20 && this.activeNPCs.length === 0 && Math.random() < spawnChance) {
            // AraÃ§lar artÄ±k Ã§apraz geÃ§meyecek, belirli bir ÅŸeritte Ã¼stÃ¼mÃ¼ze gelecek!
            const lanes = [20, 50, 80]; // Sol ÅŸerit, Orta ÅŸerit, SaÄŸ ÅŸerit
            let startX = lanes[Math.floor(Math.random() * lanes.length)];
            
            // BaÅŸlangÄ±Ã§ pan deÄŸeri ÅŸeride gÃ¶re (-1, 0, 1)
            let initialPan = (startX - 50) / 30;
            let audioObj = audio.playNPCSound(initialPan);
            if (audioObj) {
                this.activeNPCs.push({
                    x: startX,
                    y: 600, // Ã‡arpÄ±ÅŸmaya tepki sÃ¼resini artÄ±rmak iÃ§in 200'den 600'e Ã§Ä±karÄ±ldÄ±
                    baseSpeed: 40 + Math.random() * 40, // NPC'nin kendi hÄ±zÄ± (40-80 arasÄ±)
                    speedX: 0, // AraÃ§lar ÅŸerit deÄŸiÅŸtirmez, dÃ¼mdÃ¼z gelir
                    audioObj: audioObj,
                    hasCollided: false
                });

                // EÄžER AYNI ÅžERÄ°TTE DOÄžDUYSA ERKEN UYARI VER
                if (Math.abs(startX - this.lanePosition) < 20) {
                    const currentTime = performance.now();
                    if (!this.lastCollisionWarnTime || currentTime - this.lastCollisionWarnTime > 5000) {
                        this.lastCollisionWarnTime = currentTime;
                        if (typeof audio.speak === 'function') audio.speak("Dikkat, Ã¶nÃ¼nÃ¼zde araÃ§ var!");
                    }
                }
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
                // Bize doğru yaklaşma (Kendi hızı + bizim hızımız)
                // Karşıdan gelen trafik gibi düşünülüyor. Biz dursak bile onlar hareket eder.
                npc.y -= (this.speed + npc.baseSpeed) * deltaTime * 1.5;
            }
            
            // X ekseninde hareket YOK (speedX = 0). Araçlar hep kendi şeridinde kalır.
            
            // MÃœKEMMEL STEREO VE YAKLAÅMA HÄ°SSÄ° (Howler.js Spatial Audio)
            if (npc.audioObj && npc.audioObj.howlObj) {
                let apparentX = npc.x;
                if (this.roadCurvature) {
                    // Viraj SimÃ¼lasyonu: Yol saÄŸa kÄ±vrÄ±lÄ±yorsa (roadCurvature < 0), uzaktaki araÃ§ saÄŸa (+x) kaymÄ±ÅŸ gibi duyulur
                    apparentX -= this.roadCurvature * (npc.y / 50);
                }
                let currentPan = (apparentX - this.lanePosition) / 30; 
                currentPan = Math.max(-1, Math.min(1, currentPan));
                npc.audioObj.howlObj.stereo(currentPan, npc.audioObj.soundId);
                
                let dist = Math.abs(npc.y);
                let vol = 1 - (dist / 600);
                vol = Math.max(0, Math.min(1, vol));
                npc.audioObj.howlObj.volume(vol, npc.audioObj.soundId);
            }

            // Ã‡arpÄ±ÅŸma (Ã–LÃœM VE HASAR MEKANÄ°ÄÄ°) - Ã‡EKÄ°CÄ°DEYKEN KAZA YAPILMAZ (0 HATA)
            if (!npc.hasCollided && npc.y <= 10 && npc.y > -10) {
                // HÄ±z 20'nin altÄ±ndaysa veya Ã§ekici otopilotundaysak Ã§arpÄ±ÅŸma olmaz, teÄŸet geÃ§er
                if (!this.isBeingTowed && this.speed >= 20 && Math.abs(npc.x - this.lanePosition) < 20) {
                    npc.hasCollided = true;
                    
                    // FÄ°ZÄ°KSEL Ã‡ARPIÅMA TEPKÄ°SÄ°: NPC'yi kenara fÄ±rlat ve durdur (Ghosting engelleme)
                    npc.baseSpeed = 0;
                    // EÄŸer otobÃ¼s saÄŸdaysa NPC sola savrulur, soldaysa saÄŸa savrulur
                    npc.slideX = (this.lanePosition > 50) ? -80 : 80;
                    npc.slideY = this.speed * 1.5;
                    if (typeof audio !== 'undefined' && typeof audio.playTireScreech === 'function') {
                        audio.playTireScreech(1.0);
                        setTimeout(() => audio.stopTireScreech(), 1500);
                    }
                    
                    // Åiddete (HÄ±zÄ±mÄ±za) gÃ¶re rastgele hasar hesaplama
                    let damageAmount = 0;
                    if (this.speed <= 40) {
                        damageAmount = Math.floor(Math.random() * 7) + 2; 
                    } else if (this.speed <= 70) {
                        damageAmount = Math.floor(Math.random() * 11) + 10;
                    } else {
                        damageAmount = Math.floor(Math.random() * 21) + 25;
                    }
                    
                    let oldHealth = this.busDamage.health;
                    this.busDamage.health -= damageAmount;
                    this.busDamage.health = Math.max(0, this.busDamage.health);
                    
                    // Åeride gÃ¶re bÃ¶lgesel hasar ve uyarÄ±lar
                    if (npc.x === 20) {
                        let outcome = this.calculateCrashOutcome(damageAmount);
                        if (outcome === 2) {
                            this.busDamage.leftWindow = 100;
                            audio.speak("Sol cama Ã§arptÄ±k! Sol cam tamamen kÄ±rÄ±ldÄ±, yÃ¼zde yÃ¼z hasarlÄ±.");
                        } else if (outcome === 1) {
                            this.busDamage.leftWindow = Math.max(this.busDamage.leftWindow, 50);
                            audio.speak("Sol cama Ã§arptÄ±k! Sol cam Ã§atladÄ±, yÃ¼zde elli hasarlÄ±.");
                        } else {
                            audio.speak("Sol taraftan Ã§arptÄ±k! ÅanslÄ±yÄ±z, cam kÄ±rÄ±lmadÄ±.");
                        }
                    } else if (npc.x === 80) {
                        let outcome = this.calculateCrashOutcome(damageAmount);
                        if (outcome === 2) {
                            this.busDamage.rightWindow = 100;
                            audio.speak("SaÄŸ cama Ã§arptÄ±k! SaÄŸ cam tamamen kÄ±rÄ±ldÄ±, yÃ¼zde yÃ¼z hasarlÄ±.");
                        } else if (outcome === 1) {
                            this.busDamage.rightWindow = Math.max(this.busDamage.rightWindow, 50);
                            audio.speak("SaÄŸ cama Ã§arptÄ±k! SaÄŸ cam Ã§atladÄ±, yÃ¼zde elli hasarlÄ±.");
                        } else {
                            audio.speak("SaÄŸ taraftan Ã§arptÄ±k! ÅanslÄ±yÄ±z, cam kÄ±rÄ±lmadÄ±.");
                        }
                    } else {
                        audio.speak(`Ã–nden Ã§arpÄ±ÅŸtÄ±k! Kaporta hasar aldÄ±!`);
                        this.busDamage.front = Math.min(100, this.busDamage.front + damageAmount);
                        
                        // Ã–nden Ã§arpmalarda farlar
                        let hlOutcome = this.calculateCrashOutcome(damageAmount);
                        if (hlOutcome === 2) {
                            this.busDamage.headlights = 100;
                            if (this.isHeadlightsOn) {
                                this.isHeadlightsOn = false;
                                if (typeof audio.playHeadlightBust === 'function') audio.playHeadlightBust();
                            }
                            setTimeout(() => audio.speak("Ã–n farlar tamamen kÄ±rÄ±ldÄ±, yÃ¼zde yÃ¼z hasarlÄ±! GÃ¶rÃ¼ÅŸ tehlikede!"), 1500);
                        } else if (hlOutcome === 1) {
                            this.busDamage.headlights = Math.max(this.busDamage.headlights, 50);
                            setTimeout(() => audio.speak("Ã–n farlar yÃ¼zde elli hasar aldÄ±, baÄŸlantÄ±larÄ± gevÅŸedi."), 1500);
                        }
                        
                        // Ã–nden Ã§arpmalarda silecekler
                        let wpOutcome = this.calculateCrashOutcome(damageAmount);
                        if (wpOutcome === 2) {
                            this.busDamage.wipers = 100;
                            if (typeof audio.isWiperOn !== 'undefined' && audio.isWiperOn) {
                                if (typeof audio.toggleWipers === 'function') audio.toggleWipers(); // Silecekleri zorla kapat
                            }
                            setTimeout(() => audio.speak("Silecek motoru tamamen kÄ±rÄ±ldÄ±, yÃ¼zde yÃ¼z hasarlÄ±! Cam temizlenemeyecek!"), 3000);
                        } else if (wpOutcome === 1) {
                            this.busDamage.wipers = Math.max(this.busDamage.wipers, 50);
                            setTimeout(() => audio.speak("Silecekler yÃ¼zde elli hasar aldÄ±, zorlanarak Ã§alÄ±ÅŸÄ±yor."), 3000);
                        }
                    }
                    
                    if (oldHealth >= 50 && this.busDamage.health < 50 && this.busDamage.health >= 25) {
                        setTimeout(() => audio.speak("Kritik UyarÄ±! AracÄ±n saÄŸlÄ±ÄŸÄ± yÃ¼zde ellinin altÄ±na dÃ¼ÅŸtÃ¼."), 2500);
                    } else if (oldHealth >= 25 && this.busDamage.health < 25 && this.busDamage.health >= 20) {
                        setTimeout(() => audio.speak("Kritik UyarÄ±! AracÄ±n saÄŸlÄ±ÄŸÄ± yÃ¼zde yirmi beÅŸin altÄ±na dÃ¼ÅŸtÃ¼. Hasar kritik seviyede!"), 2500);
                    }
                    
                    // AkustiÄŸi gÃ¼ncelle (BÃ¶lgesel bozulma)
                    audio.updateAcoustics(this.busDamage.leftWindow, this.busDamage.rightWindow);
                    
                    this.speed = 0;
                    audio.playCrash();
                    
                    if (this.busDamage.health < 20) {
                        this.triggerTowTruck();
                    } else {
                        this.showWarning("KAZA YAPTINIZ! AraÃ§ hasar aldÄ±.");
                    }
                }
            } 
            
            // AraÃ§ arkamÄ±zda uzaklaÅŸtÄ±ÄŸÄ±nda sil
            if (npc.y < -40) {
                if (npc.audioObj) npc.audioObj.stop();
                this.activeNPCs.splice(i, 1);
            }
        }
    },

    triggerTowTruck: function() {
        if (!this.isDriving && !this.animationFrameId) return; // BUG FIX: AynÄ± saniyede birden fazla kaza olursa (Ã§ift NPC'ye Ã§arpma vs.) paralel evren (Ã§ift gameLoop) oluÅŸmasÄ±nÄ± engeller
        this.isDriving = false; // Oyunu geÃ§ici durdur
        cancelAnimationFrame(this.animationFrameId); // BUG FIX: Frame dÃ¶ngÃ¼sÃ¼nÃ¼ tamamen iptal et
        this.animationFrameId = null; // Guard iÃ§in sÄ±fÄ±rla
        
        audio.stopEngine();
        if (typeof audio.stopLowAirAlarm === 'function') audio.stopLowAirAlarm();
        
        // BUG FIX: Kaza anÄ±nda hava durumu efektlerini ve silecekleri kapat
        if (typeof audio.stopWeather === 'function') audio.stopWeather();
        if (audio.isWiperOn) audio.toggleWipers();
        
        // BUG FIX: Ã‡ekiciye binerken eski engelleri ve NPC'leri temizle
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }
        this.obstacles = [];
        this.activeNPCs.forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
        this.activeNPCs = [];
        
        document.getElementById('nav-feedback').innerText = "ARAÃ‡ PERT OLDU! Ã‡EKÄ°CÄ° BEKLENÄ°YOR...";
        document.getElementById('nav-feedback').style.color = '#ef4444';
        
        this.showWarning("ARAÃ‡ PERT OLDU! Ã‡EKÄ°CÄ° Ã‡AÄRILIYOR.");
        audio.speak("AracÄ±nÄ±z Ã§ok aÄŸÄ±r hasar aldÄ± ve yola devam edemezsiniz. Ã‡ekici Ã§aÄŸrÄ±lÄ±yor, lÃ¼tfen bekleyin. Sizi sanayiye gÃ¶tÃ¼rÃ¼yoruz.");
        
        // Kaza anÄ±nÄ± kaydet (KaldÄ±ÄŸÄ±mÄ±z yerden devam etmek iÃ§in)
        this.savedState = {
            routeData: JSON.parse(JSON.stringify(this.activeRouteData)),
            stopIndex: this.currentStopIndex,
            distance: this.currentDistanceToNext,
            roadType: this.currentRoadType
        };
        
        // 5 Saniye sonra Ã§ekici ile yola Ã§Ä±k
            // 5 Saniye sonra Ã§ekici ile yola Ã§Ä±k
        setTimeout(() => {
            this.activeRouteData = {
                hatNo: "Ã‡EKÄ°CÄ°",
                guzergah: "Kaza Yeri -> TekirdaÄŸ Sanayi",
                stops: [
                    { ad: "TekirdaÄŸ Sanayi", id: "sanayi", anons: "TekirdaÄŸ Sanayisine hoÅŸgeldiniz.", gercekMesafeSonraki: 5 }
                ]
            };
            this.currentStopIndex = 0;
            this.currentDistanceToNext = 5000; // 5 km sÃ¼recek
            this.currentRoadType = "Asfalt Cadde";
            
            // Ã‡ekici Ã¼zerindeyken bir daha Ã¶lmemek iÃ§in canÄ± fulle
            this.busDamage.health = 100; 
            
            // BUG FIX: Direksiyonu ve ÅŸerit pozisyonunu merkeze al ki Ã§ekici baÅŸlar baÅŸlamaz yoldan Ã§Ä±kma (sonsuz kaza dÃ¶ngÃ¼sÃ¼) yaÅŸanmasÄ±n!
            this.lanePosition = 50;
            this.steeringAngle = 0;
            
            audio.speak("AracÄ±nÄ±z Ã§ekiciye yÃ¼klendi. TekirdaÄŸ Sanayi'ye doÄŸru otomatik olarak yola Ã§Ä±kÄ±ldÄ±.");
            audio.startEngine(); // BUG FIX: Ã‡ekiciye bindiÄŸimizde de motor sesini aÃ§
            
            // Otomatik sÃ¼rÃ¼ÅŸÃ¼ baÅŸlat
            this.isBeingTowed = true;
            this.isDriving = true;
            this.lastFrameTime = performance.now();
            this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t)); // DoÄŸru ÅŸekilde yeni dÃ¶ngÃ¼ baÅŸlat
            
        }, 8000); // KonuÅŸma bitene kadar bekle
    },

    updateBusVisuals: function() {
        const bus = document.getElementById('bus-sprite');
        bus.style.left = `${this.lanePosition}%`;
    },

    arriveAtStop: function() {
        const stopData = this.activeRouteData.stops[this.currentStopIndex];
        const isFinalStop = this.currentStopIndex === this.activeRouteData.stops.length - 1;

        // Yolcu matematiÄŸini baÅŸta hesapla
        const alighting = Math.floor(Math.random() * (Math.min(this.passengersOnBoard, 15) + 1));
        const waiting = stopData.bekleyenYolcu;

        // PAS GEÃ‡ME MANTIÄI: Ä°necek veya binecek yoksa ve son durak deÄŸilse durmadan geÃ§
        if (!isFinalStop && alighting === 0 && waiting === 0) {
            this.currentStopIndex++;
            audio.speakSequence([stopData.name + " duraÄŸÄ±nÄ± geÃ§iyorsunuz.", "Yolcu olmadÄ±ÄŸÄ± iÃ§in duraklanmadÄ±.", "Yeni rota hesaplanÄ±yor."]);
            
            // EÄŸer varsa geÃ§miÅŸ UI uyarÄ±larÄ±nÄ± temizle
            if (document.getElementById('obstacles-container')) {
                document.getElementById('obstacles-container').innerHTML = '';
            }
            this.obstacles = [];
            this.activeNPCs.forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
            this.activeNPCs = [];

            // Direkt bir sonraki duraÄŸÄ±n rotasÄ±nÄ± hesapla (hÄ±zÄ± sÄ±fÄ±rlamadan)
            this.planNextStop();
            return;
        }

        this.passengersOnBoard -= alighting;

        this.isDriving = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.speed = 0;
        this.engineRPM = 800;
        this.currentGear = 1;
        audio.updateEngineSound(0, 800, 1);
        audio.updateTireNoise(0, null);
        if (typeof audio.stopLowAirAlarm === 'function') audio.stopLowAirAlarm();
        if (typeof audio.stopTireScreech === 'function') audio.stopTireScreech();
        
        // Bir sonraki sefere baÅŸlarken otomatik frenleme/pompalama cezasÄ±nÄ± engellemek iÃ§in tuÅŸlarÄ± sÄ±fÄ±rla
        this.keys.s = false;
        this.keys.arrowdown = false;
        
        if (document.getElementById('obstacles-container')) {
            document.getElementById('obstacles-container').innerHTML = '';
        }
        this.obstacles = [];
        
        // BUG FIX: Kalan NPC'leri ve seslerini temizle (Sonsuz motor sesi hatasÄ±nÄ± engeller)
        this.activeNPCs.forEach(n => { if (n.audioObj) n.audioObj.stop(); if (n.el) n.el.remove(); });
        this.activeNPCs = [];
        
        document.getElementById('stop-title').innerText = stopData.name;
        

        document.getElementById('stop-waiting-count').innerText = waiting;
        document.getElementById('stop-alighting-count').innerText = alighting;
        
        document.getElementById('btn-front-door').disabled = false;
        document.getElementById('btn-front-door').innerText = "Ã–n KapÄ±yÄ± AÃ§";
        document.getElementById('btn-rear-door').disabled = false;
        document.getElementById('btn-rear-door').innerText = "Arka KapÄ±yÄ± AÃ§";
        
        // Ã–nceki durak butonlarÄ±nÄ± ve yolcu olayÄ±nÄ± gizle
        document.getElementById('passenger-interaction').classList.add('hidden');
        
        audio.speakSequence(["Åimdiki durak:", stopData.name]);
        
        UI.switchScreen('stop-screen');
        
        // Oto-kalkÄ±ÅŸ bekleme durumunda
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
            if (typeof audio.speak === 'function') audio.speak("KapÄ±lar aÃ§Ä±kken hareket edemezsiniz!");
            return;
        }

        if (this.currentStopIndex >= this.activeRouteData.stops.length - 1) {
            this.finishRoute();
            return;
        }

        this.isDriving = true; // SÃ¼rÃ¼ÅŸ modunu aktif et
        this.currentStopIndex++;
        
        // BUG FIX: KapÄ± kapandÄ±ÄŸÄ±nda rastgele yolcu ekleme ve hileli (magical) 50â‚º verme hatasÄ± kaldÄ±rÄ±ldÄ±.
        // BiniÅŸler zaten automatedTicketProcess() Ã¼zerinden doÄŸru ÅŸekilde sayÄ±lÄ±yor ve Ã¼cretlendiriliyor.
        
        UI.switchScreen('driving-screen');
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        
        this.planNextStop();
    },

    boardingTimer: null,

    toggleFrontDoor: function() {
        // BUG FIX: Hareket halindeyken kapÄ±larÄ±n aÃ§Ä±lmasÄ±nÄ± engelle (KapÄ± GÃ¼venlik Kilidi)
        if (!this.frontDoorOpen && this.speed > 5) {
            audio.speak("GÃ¼venlik kilidi devrede. AraÃ§ hareket halindeyken kapÄ±lar aÃ§Ä±lamaz.");
            UI.showToast("GÃ¼venlik Kilidi: KapÄ±lar kilitli!", "error");
            return;
        }
        // BUG FIX 2: KapÄ±lar hava ile Ã§alÄ±ÅŸÄ±r, her aÃ§Ä±p kapamada basÄ±nÃ§ dÃ¼ÅŸer (-10 PSI)
        this.airPressure -= 10;
        
        this.frontDoorOpen = !this.frontDoorOpen;
        const btn = document.getElementById('btn-front-door');
        
        if (this.frontDoorOpen) {
            audio.playDoorOpen();
            btn.innerText = "Ã–n KapÄ±yÄ± Kapat";
            
            // YOLCU TEPKÄ°SÄ°: KapÄ± aÃ§Ä±ldÄ±ÄŸÄ±nda nezaket
            if (this.passengersOnBoard > 0 && Math.random() < 0.3) {
                audio.speak("Kolay gelsin kaptan.");
            }
            
            if (!this.isDriving) {
                const stopData = this.activeRouteData.stops[this.currentStopIndex];
                let currentWaiting = stopData.bekleyenYolcu;
                
                if (this.boardingTimer) clearInterval(this.boardingTimer);
                
                if (currentWaiting > 0) {
                    document.getElementById('passenger-interaction').classList.remove('hidden');
                    document.getElementById('passenger-dialog').innerText = '"BiniÅŸler baÅŸladÄ±..."';
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
                            document.getElementById('passenger-dialog').innerText = '"TÃ¼m yolcular bindi."';
                            return;
                        }
                        
                        const seatCapacity = this.activeRouteData.otobusKapasitesi || 40;
                        const maxStanding = 15; // BUG FIX 10: Ayakta yolcu kapasitesi sabit (max 15 kiÅŸi)
                        
                        if (this.passengersOnBoard < seatCapacity) {
                            // Normal biniÅŸ
                            this.automatedTicketProcess();
                            currentWaiting--;
                            stopData.bekleyenYolcu = currentWaiting; // BUG FIX: Orijinal veriyi de gÃ¼ncelle (Sonsuz para/yolcu hilesini engeller)
                            document.getElementById('stop-waiting-count').innerText = currentWaiting;
                        } else {
                            // OtobÃ¼s dolu, aÅŸÄ±rÄ± yÄ±ÄŸÄ±lma reaksiyonlarÄ±
                            const rand = Math.random();
                            if (rand < 0.5 && this.passengersOnBoard < (seatCapacity + maxStanding)) {
                                document.getElementById('passenger-dialog').innerText = '"Ayakta giderim sorun deÄŸil."';
                                this.automatedTicketProcess(true);
                                currentWaiting--;
                                stopData.bekleyenYolcu = currentWaiting;
                                document.getElementById('stop-waiting-count').innerText = currentWaiting;
                            } else if (rand < 0.8 || this.passengersOnBoard >= (seatCapacity + maxStanding)) {
                                document.getElementById('passenger-dialog').innerText = '"OtobÃ¼s Ã§ok dolu, ben arkadan gelene bineceÄŸim."';
                                document.getElementById('passenger-feedback').innerText = "Yolcu binmekten vazgeÃ§ti.";
                                document.getElementById('passenger-feedback').style.color = '#ef4444';
                                currentWaiting--;
                                stopData.bekleyenYolcu = currentWaiting;
                                document.getElementById('stop-waiting-count').innerText = currentWaiting;
                            } else {
                                document.getElementById('passenger-dialog').innerText = '"BurasÄ± Ã§ok dolu ve havasÄ±z oldu, ben iniyorum!"';
                                document.getElementById('passenger-feedback').innerText = "Ä°Ã§eriden 1 yolcu indi.";
                                document.getElementById('passenger-feedback').style.color = '#ef4444';
                                if (this.passengersOnBoard > 0) this.passengersOnBoard--;
                            }
                        }
                        
                        document.getElementById('hud-passengers').innerText = `${this.passengersOnBoard} / ${seatCapacity}`;
                    }, 1500);
                }
            }
        } else {
            // KapÄ±yÄ± Kapat
            audio.playDoorClose();
            btn.innerText = "Ã–n KapÄ±yÄ± AÃ§";
            if (this.boardingTimer) {
                clearInterval(this.boardingTimer);
                this.boardingTimer = null;
            }
            if (!this.isDriving) this.checkAutoDepart();
        }
    },
    
    toggleRearDoor: function() {
        // BUG FIX: Hareket halindeyken kapÄ±larÄ±n aÃ§Ä±lmasÄ±nÄ± engelle (KapÄ± GÃ¼venlik Kilidi)
        if (!this.rearDoorOpen && this.speed > 5) {
            audio.speak("GÃ¼venlik kilidi devrede. AraÃ§ hareket halindeyken arka kapÄ± aÃ§Ä±lamaz.");
            UI.showToast("GÃ¼venlik Kilidi: KapÄ±lar kilitli!", "error");
            return;
        }
        // BUG FIX 2: Arka kapÄ± pnÃ¶matik
        this.airPressure -= 10;
        
        this.rearDoorOpen = !this.rearDoorOpen;
        const btn = document.getElementById('btn-rear-door');
        
        if (this.rearDoorOpen) {
            audio.playDoorOpen();
            btn.innerText = "Arka KapÄ±yÄ± Kapat";
            if (!this.isDriving) {
                document.getElementById('stop-alighting-count').innerText = "0";
            }
        } else {
            audio.playDoorClose();
            btn.innerText = "Arka KapÄ±yÄ± AÃ§";
            if (!this.isDriving) this.checkAutoDepart();
        }
    },

    automatedTicketProcess: function(isStanding = false) {
        const types = ["tam", "ogrenci", "yasli"];
        const pType = types[Math.floor(Math.random() * types.length)];
        
        let fare = this.ticketPrices[pType];
        const cityName = this.activeRouteData.sehir;
        if (sehirRotalari[cityName] && sehirRotalari[cityName].ucretler) {
            fare = sehirRotalari[cityName].ucretler[pType];
        }
        
        if (pType !== "yasli") {
            this.addMoney(fare);
        }
        this.passengersOnBoard++;
        
        audio.playAkbil(pType);
        
        let label = pType === "tam" ? "Tam" : (pType === "ogrenci" ? "Ã–ÄŸrenci" : "Serbest");
        document.getElementById('passenger-feedback').innerText = `${label} basÄ±ldÄ±. ${fare > 0 ? fare + ' â‚º alÄ±ndÄ±.' : 'Ãœcretsiz geÃ§iÅŸ.'}`;
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
        
        // BUG FIX: GÃ¶rev bittiÄŸinde hava durumu efektlerini ve silecekleri kapat
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
            audio.speak("Tebrikler. GÃ¶rev baÅŸarÄ±yla tamamlandÄ±. Bir sonraki gÃ¶reve geÃ§mek iÃ§in sonraki Ã¼zerine tÄ±klayÄ±n veya geri dÃ¶nÃ¼p oyundan Ã§Ä±kmak iÃ§in ana menÃ¼ dÃ¼ÄŸmesine basÄ±n.");
            
            if (this.activeRouteData && this.activeRouteData.isIntercity) {
                this.unlockCity(this.activeRouteData.destCity);
                if (typeof UI !== 'undefined') UI.showToast(`${this.activeRouteData.destCity} Åehrinin Kilidi AÃ§Ä±ldÄ±!`, 'success');
            }

            this.completeTask(); // Ä°lerlemeyi kaydet
        } else {
            audio.speak("Kaza yaptÄ±nÄ±z veya gÃ¶rev iptal edildi. GÃ¶rev baÅŸarÄ±sÄ±z oldu. LÃ¼tfen tekrar deneyin.");
        }
        
        if (document.getElementById('res-money')) document.getElementById('res-money').innerText = `${this.sessionMoney} â‚º`;
        if (document.getElementById('res-penalties')) document.getElementById('res-penalties').innerText = `${this.sessionPenalties} â‚º`;
        
        if (typeof UI !== 'undefined') UI.switchScreen('results-screen');
    },

    handleKeyDown: function(e) {
        // EÄŸer sistem kÄ±sayollarÄ± kullanÄ±lÄ±yorsa (NVDA, tarayÄ±cÄ±) oyunu etkilemesin
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        // EÄŸer oyun sÃ¼rÃ¼ÅŸ halinde deÄŸilse, mola ekranÄ±nda deÄŸilse ve sanayide deÄŸilse;
        // bu tuÅŸ vuruÅŸlarÄ± ana menÃ¼ veya diÄŸer arayÃ¼zler iÃ§indir. Oyunu ilgilendirmez.
        if (!this.isDriving && document.getElementById('stop-screen').classList.contains('hidden') && !SanayiMechanic.isActive) {
            return;
        }

        const k = e.key.toLowerCase();
        
        // Sadece oyun iÃ§indeysek ekran okuyucu veya sayfa kaydÄ±rmasÄ±nÄ± engellemek iÃ§in preventDefault kullan
        if (k.startsWith('arrow') || k === ' ') {
            e.preventDefault();
        }
        
        if (e.repeat) return; // BasÄ±lÄ± tutulduÄŸunda aynÄ± aksiyonun defalarca tetiklenmesini engelle

        // Ã‡ekici Yapay Zeka (Otopilot) kontrolÃ¼: Oyuncu mÃ¼dahale edemez
        if (this.isBeingTowed && (k === 'w' || k === 'a' || k === 's' || k === 'd' || k.startsWith('arrow'))) {
            e.preventDefault();
            const currentTime = performance.now();
            if (!this.lastTowDriverWarnTime || currentTime - this.lastTowDriverWarnTime > 5000) {
                this.lastTowDriverWarnTime = currentTime;
                if (typeof audio.speak === 'function') {
                    audio.speak("Merak etme usta, kontrol bende. Sen iÅŸi bana bÄ±rak.");
                }
            }
            return; // TuÅŸ iÅŸlemini tamamen iptal et
        }
        
        if (e.shiftKey && k === 'w') {
            if (typeof audio !== 'undefined' && typeof audio.toggleWipers === 'function') {
                audio.toggleWipers();
            }
        }

        if (k === 'k') {
            this.isACOn = !this.isACOn;
            const msg = this.isACOn ? "Klima aÃ§Ä±ldÄ±. Hedef sÄ±caklÄ±k 22 derece." : "Klima kapatÄ±ldÄ±.";
            if (typeof audio.speak === 'function') audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, 'info');
            return;
        }

        if (k === 't') {
            const msg = `DÄ±ÅŸ sÄ±caklÄ±k ${this.temperature} derece, otobÃ¼s iÃ§i ${Math.floor(this.busTemperature)} derece. ${this.isACOn ? "Klima aÃ§Ä±k." : "Klima kapalÄ±."}`;
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }


        if (k === 'n') {
            e.preventDefault();
            // SÄ±radaki duraÄŸa kalan mesafe zaten currentDistanceToNext'in kendisidir (geriye sayar)
            let remDistance = Math.max(0, this.currentDistanceToNext);
            
            // Kalan duraklarÄ±n tahmini uzunluklarÄ±nÄ± ekle (Rota bitimine kadar olan tahmini mesafe)
            let totalRemaining = remDistance;
            if (this.activeRouteData && this.activeRouteData.stops) {
                for (let i = this.currentStopIndex + 1; i < this.activeRouteData.stops.length; i++) {
                    // Mevcut duraktan bir Ã¶ncekine kadar olan mesafe gercekMesafeSonraki'de kayÄ±tlÄ±dÄ±r
                    let prevStop = this.activeRouteData.stops[i-1];
                    if (prevStop && prevStop.gercekMesafeSonraki) {
                        totalRemaining += prevStop.gercekMesafeSonraki * 1000;
                    }
                }
            }
            
            // Toplam rota uzunluÄŸu = Åu ana kadar kat edilen TOPLAM yol + Kalan TOPLAM yol
            let totalRoute = this.totalDistanceCovered + totalRemaining;

            let msg = `SÄ±radaki duraÄŸa ${Math.floor(remDistance)} metre kaldÄ±. Yolun toplam uzunluÄŸu yaklaÅŸÄ±k ${Math.floor(totalRoute / 1000)} kilometre.`;
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }

        if (k === 'r') {
            e.preventDefault();
            let msg = `HÄ±zÄ±nÄ±z saatte ${Math.floor(this.speed)} kilometre.`;
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }

        if (k === 'h') {
            e.preventDefault();
            let msg = `AraÃ§ saÄŸlÄ±ÄŸÄ± yÃ¼zde ${Math.floor(this.busDamage.health)}. `;
            let hasarListesi = [];
            
            if (this.busDamage.leftWindow > 0) hasarListesi.push(`Sol cam yÃ¼zde ${Math.floor(this.busDamage.leftWindow)}`);
            if (this.busDamage.rightWindow > 0) hasarListesi.push(`SaÄŸ cam yÃ¼zde ${Math.floor(this.busDamage.rightWindow)}`);
            if (this.busDamage.front > 0) hasarListesi.push(`Ã–n kaporta yÃ¼zde ${Math.floor(this.busDamage.front)}`);
            if (this.busDamage.wipers > 0) hasarListesi.push(`Silecekler yÃ¼zde ${Math.floor(this.busDamage.wipers)}`);
            if (this.busDamage.headlights > 0) hasarListesi.push(`Farlar yÃ¼zde ${Math.floor(this.busDamage.headlights)}`);
            if (this.busDamage.exhaust > 0) hasarListesi.push(`Egzoz yÃ¼zde ${Math.floor(this.busDamage.exhaust)}`);
            
            if (hasarListesi.length > 0) {
                msg += hasarListesi.join(", ") + " hasarlÄ±.";
            } else {
                msg += "Mekanik aksamda hiÃ§bir hasar yok, her ÅŸey saÄŸlam.";
            }
            
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }

        if (this.keys.hasOwnProperty(k)) this.keys[k] = true;

        // Ã–zel aksiyonlar
        if (e.code === 'Space') {
            if (audio.isEngineRunning) {
                audio.stopEngine();
            } else {
                audio.startEngine();
            }
            if (!this.isDriving) this.checkAutoDepart();
        }
        if (k === 'l') {
            e.preventDefault();
            if (typeof audio !== 'undefined' && typeof audio.playHorn === 'function') {
                audio.playHorn();
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
            audio.speak(`Sonraki duraÄŸa ${dst} metre kaldÄ±`);
        }
        if (k === 'f') { // Farlar
            e.preventDefault();
            if (this.busDamage.headlights >= 100) {
                audio.playHeadlightBust(); // Farlar bozuk sesi
                audio.speak("Farlar Ã§alÄ±ÅŸmÄ±yor. Ampuller patlamÄ±ÅŸ veya tesisat hasarlÄ±.");
                this.isHeadlightsOn = false;
            } else {
                this.isHeadlightsOn = !this.isHeadlightsOn;
                audio.playSwitchClick(); // Åalter sesi
                if (this.isHeadlightsOn) {
                    audio.speak("Farlar aÃ§Ä±ldÄ±.");
                } else {
                    audio.speak("Farlar kapatÄ±ldÄ±.");
                }
            }
        }
        if (k === 't') {
            let hh = Math.floor(this.clockMinutes / 60);
            let mm = Math.floor(this.clockMinutes % 60);
            let timeStr = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
            
            let timeOfDay = "Gece";
            if (this.clockMinutes >= 360 && this.clockMinutes < 720) timeOfDay = "Ã–ÄŸleden Ã–nce";
            else if (this.clockMinutes >= 720 && this.clockMinutes < 1080) timeOfDay = "GÃ¼n OrtasÄ±";
            else if (this.clockMinutes >= 1080) timeOfDay = "AkÅŸam";

            let durum = this.weather === 'sunny' ? (this.isNight ? 'AÃ§Ä±k' : 'GÃ¼neÅŸli') : (this.weather === 'rainy' ? 'YaÄŸmurlu' : 'KarlÄ±');
            let uyari = this.weather === 'snowy' ? ' Yollar buzlu.' : (this.weather === 'rainy' ? ' Yollar kaygan.' : '');
            let farDurum = this.isNight ? (this.isHeadlightsOn ? ' FarlarÄ±nÄ±z aÃ§Ä±k.' : ' FarlarÄ±nÄ±z KAPALI, gÃ¶rÃ¼ÅŸ tehlikesi!') : '';
            
            // Tonaj Bilgisini Kategorize Et
            let weightCategory = "Hafif"; // 0-15 yolcu
            if (this.passengersOnBoard > 15 && this.passengersOnBoard <= 40) {
                weightCategory = "Orta aÄŸÄ±rlÄ±kta";
            } else if (this.passengersOnBoard > 40) {
                weightCategory = "Ã‡ok aÄŸÄ±r";
            }
            
            audio.speak(`Saat ${timeStr}. ${timeOfDay}. Hava durumu: ${durum}. SÄ±caklÄ±k: ${this.temperature} derece. OtobÃ¼s ÅŸu an ${weightCategory}.${uyari}${farDurum}`);
        }
        if (k === 'k' || k === 'h' || k === 'v' || k === 't' || k === 'l') {
            e.preventDefault();
        }
        if (k === 'end') {
            e.preventDefault();
            audio.setWindowOpen(false);
            audio.updateAcoustics(this.busDamage.leftWindow, this.busDamage.rightWindow);
            audio.speak("Cam kapatÄ±ldÄ±");
        }
    },

    handleKeyUp: function(e) {
        // BUG FIX: Oyun durumu deÄŸiÅŸtiÄŸinde (Ã¶rneÄŸin duraÄŸa tam yanaÅŸtÄ±ÄŸÄ±mÄ±zda isDriving false olur)
        // EÄŸer bu kontrolÃ¼ yaparsak, oyuncunun elini tuÅŸtan Ã§ekmesi algÄ±lanmaz ve tuÅŸ sonsuza kadar takÄ±lÄ± kalÄ±r!
        // Bu yÃ¼zden keyup olaylarÄ± her zaman dinlenmelidir.
        
        const k = e.key.toLowerCase();
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
        
        // EKRAN OKUYUCU DÃœZELTMESÄ° (A11Y): GÃ¶rme engelli oyuncularÄ±n uyarÄ±larÄ± duyabilmesi iÃ§in
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

// BUG FIX: Sekme deÄŸiÅŸtiÄŸinde veya pencere odaÄŸÄ± kaybolduÄŸunda takÄ±lÄ± kalan tuÅŸlarÄ± (Hayalet Girdi) temizle
window.addEventListener('blur', () => {
    Object.keys(Game.keys).forEach(k => Game.keys[k] = false);
    Game.isBrakeKeyDown = false; // Fren cezasÄ±nÄ± da sÄ±fÄ±rla
    if (typeof audio !== 'undefined' && audio.stopHorn) audio.stopHorn();
});

// ==========================================
// SANAYÄ° (MECHANIC) SÄ°STEMÄ°
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
        statusEl.innerText = "AraÃ§ Durumu Ä°nceleniyor...";
        
        const greetingText = "Merhabalar efendim. GÃ¶rÃ¼nÃ¼ÅŸe gÃ¶re aracÄ±nÄ±z ciddi bir kazaya maruz kalmÄ±ÅŸ. Hemen aracÄ±nÄ±zÄ±n bir rÃ¶ntgenini Ã§ekeceÄŸim ve size bir rapor sunacaÄŸÄ±m. Devam etmek iÃ§in Enter tuÅŸuna basÄ±n.";
        dialogEl.innerText = greetingText;
        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(greetingText);
    },

    showReport: function() {
        this.state = 'report';
        this.currentIndex = 0;
        
        // HasarlÄ± parÃ§alarÄ± tespit et
        this.parts = [];
        if (Game.busDamage.leftWindow > 0) this.parts.push({ id: 'leftWindow', name: 'Sol Cam', damage: Game.busDamage.leftWindow, toRepair: false });
        if (Game.busDamage.rightWindow > 0) this.parts.push({ id: 'rightWindow', name: 'SaÄŸ Cam', damage: Game.busDamage.rightWindow, toRepair: false });
        if (Game.busDamage.front > 0) this.parts.push({ id: 'front', name: 'Ã–n Kaporta ve Motor', damage: Game.busDamage.front, toRepair: false });
        if (Game.busDamage.wipers > 0) this.parts.push({ id: 'wipers', name: 'Silecek Motoru', damage: Game.busDamage.wipers, toRepair: false });
        if (Game.busDamage.headlights > 0) this.parts.push({ id: 'headlights', name: 'Ã–n Farlar ve Tesisat', damage: Game.busDamage.headlights, toRepair: false });
        if (Game.busDamage.exhaust > 0) this.parts.push({ id: 'exhaust', name: 'Egzoz ve DPF Sistemi', damage: Game.busDamage.exhaust, toRepair: false });
        
        const dialogEl = document.getElementById('sanayi-dialog');
        const reportContainer = document.getElementById('sanayi-report-container');
        const listEl = document.getElementById('sanayi-parts-list');
        const statusEl = document.getElementById('sanayi-status');
        
        statusEl.innerText = "Hasar Raporu";
        dialogEl.innerText = "AÅŸaÄŸÄ±-YukarÄ± yÃ¶n tuÅŸlarÄ±yla hasarlÄ± parÃ§alarÄ± inceleyin. Onarmak iÃ§in parÃ§anÄ±n Ã¼zerindeyken Enter'a basÄ±n.";
        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("RÃ¶ntgen tamamlandÄ±. Hasar raporunuz ekranda. AÅŸaÄŸÄ± yukarÄ± yÃ¶n tuÅŸlarÄ±yla parÃ§alarÄ± inceleyip, onarmak istediÄŸiniz parÃ§anÄ±n Ã¼zerinde enter tuÅŸuna basÄ±n. Ä°ÅŸiniz bittiÄŸinde iÅŸlemi tamamla butonuna basabilirsiniz.");
        
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
        
        // Add "Ä°ÅŸlemi Tamamla" option at the end
        const btnLi = document.createElement('li');
        btnLi.className = 'route-item' + (this.currentIndex === this.parts.length ? ' selected' : '');
        btnLi.innerHTML = `<strong style="color:var(--secondary)">Ä°ÅŸlemi Tamamla (OnarÄ±mÄ± BaÅŸlat)</strong>`;
        listEl.appendChild(btnLi);
        
        this.announceCurrentSelection();
    },

    announceCurrentSelection: function() {
        if (this.currentIndex < this.parts.length) {
            const part = this.parts[this.currentIndex];
            let text = `${part.name}. YÃ¼zde ${Math.floor(part.damage)} hasarlÄ±.`;
            if (part.toRepair) text += " OnarÄ±m listesine eklendi.";
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(text);
        } else {
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Ä°ÅŸlemi Tamamla ve onarÄ±mÄ± baÅŸlat.");
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
                        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Bu parÃ§a zaten onarÄ±m listesinde.");
                    } else {
                        // ParÃ§a seÃ§imi
                        this.state = 'confirm';
                        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Bu parÃ§ayÄ± onarmak ister misiniz? Onaylamak iÃ§in enter'a basÄ±n.");
                    }
                } else {
                    // Ä°ÅŸlemi Tamamla
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
        if (this.state === 'repair') return; // BUG FIX: Ã‡ift tÄ±klama veya Ã§oklu Enter spam korumasÄ±
        this.state = 'repair';
        const partsToRepair = this.parts.filter(p => p.toRepair);
        
        if (partsToRepair.length === 0) {
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("HiÃ§bir parÃ§ayÄ± onarmadÄ±nÄ±z. Ä°ÅŸler bitti patron. Sonra gÃ¶rÃ¼ÅŸÃ¼rÃ¼z. Daha bakÄ±lacak Ã§ok araba var.");
            setTimeout(() => this.finishRepair(), 5000);
            return;
        }

        document.getElementById('sanayi-parts-list').innerHTML = '';
        
        let currentRepairIndex = 0;
        let totalCost = 0;
        
        const repairNext = () => {
            if (currentRepairIndex >= partsToRepair.length) {
                Game.addMoney(-totalCost);
                const finalMsg = `TÃ¼m onarÄ±mlar tamamlandÄ±. Toplam onarÄ±m maliyeti ${totalCost} Lira hesabÄ±nÄ±zdan dÃ¼ÅŸÃ¼ldÃ¼. Ä°ÅŸler bitti patron. Sonra gÃ¶rÃ¼ÅŸÃ¼rÃ¼z.`;
                document.getElementById('sanayi-dialog').innerText = finalMsg;
                if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(finalMsg);
                setTimeout(() => this.finishRepair(), 6000);
                return;
            }
            
            const part = partsToRepair[currentRepairIndex];
            const cost = Math.floor(part.damage * 15);
            totalCost += cost;
            
            const msg = "Su an " + part.name + " parcasini onariyorum.";
            document.getElementById('sanayi-dialog').innerText = msg;
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            
            // OnarÄ±m iÅŸlemi 30 saniye sÃ¼rÃ¼yor (Her parÃ§a iÃ§in)
            setTimeout(() => {
                // HasarÄ± sÄ±fÄ±rla
                Game.busDamage[part.id] = 0;
                audio.updateAcoustics(Game.busDamage.leftWindow, Game.busDamage.rightWindow);
                
                const doneMsg = `${part.name} onarÄ±mÄ± tamamlandÄ±.`;
                document.getElementById('sanayi-dialog').innerText = doneMsg;
                if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(doneMsg);
                
                currentRepairIndex++;
                setTimeout(repairNext, 4000);
            }, 30000);
        };
        
        repairNext();
    },

    finishRepair: function() {
        this.isActive = false;
        
        // CanÄ± tekrar fulleyelim Ã§Ã¼nkÃ¼ tamirden Ã§Ä±ktÄ±k
        Game.busDamage.health = 100;
        
        document.getElementById('btn-start-game').innerText = "KaldÄ±ÄŸÄ±n Yerden Devam Et";
        
        UI.switchScreen('title-screen');
        // EriÅŸilebilirlik iÃ§in butona direkt odaklan
        document.getElementById('btn-start-game').focus();
        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Ana menÃ¼ye dÃ¶ndÃ¼nÃ¼z. Ekrandaki 'KaldÄ±ÄŸÄ±n Yerden Devam Et' dÃ¼ÄŸmesine tÄ±klayarak veya enter tuÅŸuna basarak yarÄ±m kalan seferinize devam edebilirsiniz.");
    }
};


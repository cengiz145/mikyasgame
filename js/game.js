/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU OYUN MOTORU (GAME.JS)
 ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU OYUN MOTORU (GAME.JS)
   ========================================================================== */

const Game = {
    // --- State Variables ---
    username: null,
    licenseLevel: parseInt(localStorage.getItem('licenseLevel')) || 1, // 1: Çırak, 2: Kalfa, 3: Usta, 4: Uzun Yol
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
    driftVelocity: 0, // Rüzgar / Eğim kayma hızı
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
                        this.licenseLevel = data.licenseLevel || 1;
                        this.completedTasks = data.completedTasks || 0;
                        this.playerBudget = data.playerBudget || 0;
                        this.clockMinutes = data.clockMinutes || 480;
                        this.unlockedCities = data.unlockedCities || ["Tekirdağ"];
                        this.currentCity = data.currentCity || "Tekirdağ";
                    } else {
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
            console.error("Firebase senkronizasyon hatası (Senkron denendi ama başarısız oldu)", e);
        }
    },

    getLicenseTitle: function() {
        if (this.licenseLevel === 1) return "1. Sınıf Ehliyet (Çıraklık)";
        if (this.licenseLevel === 2) return "2. Sınıf Ehliyet (Kalfalık)";
        if (this.licenseLevel === 3) return "3. Sınıf Ehliyet (Ustalık)";
        if (this.licenseLevel === 4) return "İlçeler Arası Şoför";
        return "Uzun Yol Şoförü";
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
            
            // BUG FIX 1: Ehliyet seviyesi atlama garantisi (Strict eşitlik yerine >=)
            if (this.completedTasks >= 40) this.licenseLevel = Math.max(this.licenseLevel, 5); // Uzun Yol
            else if (this.completedTasks >= 30) this.licenseLevel = Math.max(this.licenseLevel, 4); // İlçeler Arası
            else if (this.completedTasks >= 20) this.licenseLevel = Math.max(this.licenseLevel, 3); // Ustalık
            else if (this.completedTasks >= 10) this.licenseLevel = Math.max(this.licenseLevel, 2); // Kalfalık

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
        
        const rand = Math.random();
        if (rand < 0.2) {
            this.weather = 'snowy';
            this.temperature = Math.floor(Math.random() * 11) - 10; // -10 ile 0 arası
            audio.startWeather('snowy');
        } else if (rand < 0.5) {
            this.weather = 'rainy';
            this.temperature = Math.floor(Math.random() * 11) + 5; // 5 ile 15 arası
            audio.startWeather('rainy');
        } else {
            this.weather = 'sunny';
            this.temperature = Math.floor(Math.random() * 16) + 20; // 20 ile 35 arası
            // Güneşli havada özel ses yok
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

        // Otoyol kuralı: Sadece Ehliyet Seviyesi 5 (Şehirlerarası) ve üzeri ise açılır.
        if (isOtoyolArea && this.licenseLevel >= 5) {
            audio.currentTerrain = "otoyol";
        } 
        else if (typeof sehirRotalari !== 'undefined' && sehirRotalari[this.activeRouteId] && sehirRotalari[this.activeRouteId].terrain) {
            // Şehrin genel terrain'ine dön
            audio.currentTerrain = sehirRotalari[this.activeRouteId].terrain;
        } else {
            audio.currentTerrain = "asfalt";
        }
        
        if (!isResume) {
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
                    if (this.currentDistanceToNext <= 0 || isNaN(this.currentDistanceToNext)) {
                        this.currentDistanceToNext = fallbackDistance || 1000;
                    }
                    this.isDriving = wasDriving; // Sürüşü geri başlat
                    
                    // DURAN OYUN DÖNGÜSÜNÜ YENİDEN BAŞLAT
                    if (this.isDriving) {
                        this.lastFrameTime = performance.now();
                        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
                    }

                    if (typeof audio.speak === 'function' && document.getElementById('garage-screen').classList.contains('hidden')) {
                        audio.speak("Rota hazır. İlerleyebilirsiniz.");
                    }
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
        document.getElementById('hud-passengers').innerText = `${this.passengersOnBoard} / ${this.activeRouteData.otobusKapasitesi}`;
        
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
        
        let kalanDurak = this.activeRouteData.stops.length - this.currentStopIndex;
        
        if (this.currentStopIndex === 0) {
            audio.speakSequence([
                "Şu anki konumunuz:", `${Game.currentCity} Merkez Garajı.`, 
                "İlk hedefiniz:", nextStop.name,
                "Bu görevde toplam", this.activeRouteData.stops.length.toString(), "durak bulunmaktadır.",
                `Yol durumu: ${this.currentRoadType}`
            ]);
        } else {
            let sequence = ["Bir sonraki durak:", nextStop.name];
            if (kalanDurak === 1) {
                sequence.push("Bu, görevin son durağıdır.");
            }
            audio.speakSequence(sequence);
        }
    },

    // 3 İhtimalli Kaza Sistemi (0: Hasarsız, 1: Kısmi %50 Hasar, 2: Tam %100 Kırılma)
    calculateCrashOutcome: function(damageAmount) {
        let chance = Math.random() * 100;
        
        // Çok hafif çarpmalarda genelde kurtarırız
        if (damageAmount < 20) {
            if (chance < 80) return 0; // %80 ihtimal hasarsız (Sadece kaporta sesi)
            return 1; // %20 ihtimal kısmi hasar
        }
        
        // Orta şiddetli çarpmalar
        if (damageAmount >= 20 && damageAmount < 50) {
            if (chance < 40) return 0; // %40 hasarsız
            if (chance < 80) return 1; // %40 kısmi hasar
            return 2; // %20 tam kırılma
        }
        
        // Yüksek şiddetli çarpmalar
        if (chance < 15) return 0; // %15 şansla mucizevi kurtuluş
        if (chance < 50) return 1; // %35 kısmi hasar
        return 2; // %50 tam kırılma
    },

    gameLoop: function(currentTime) {
        if (!this.isDriving) return;
        
        let deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // --- ZAMANIN AKIŞI (Toplam 60 dakika: 45 dk gündüz, 15 dk gece) ---
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
            if (this.isNight) {
                if (typeof audio.speak === 'function') audio.speak("Akşam oldu, lütfen farlarınızı açmayı unutmayın.");
            } else {
                if (typeof audio.speak === 'function') audio.speak("Sabah oldu, günaydın kaptan.");
            }
        }
        
        // DİNAMİK HAVA DURUMU
        if (!this.lastWeatherCheckTime) this.lastWeatherCheckTime = currentTime;
        
        let weatherChangeChance = this.weather === 'rainy' ? 0.2 : 0.4; // Yağmur kolay kolay bitmesin
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
                        audio.speak("Hava bozdu, kar yağışı başladı. Yollar buzlanabilir.");
                    } else if (this.weather === 'rainy') {
                        this.rainIntensity = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası başlar
                        this.lastRainCheckTime = currentTime;
                        this.nextRainChangeDelay = 20000 + Math.random() * 20000;
                        audio.startWeather('rainy', this.rainIntensity);
                        
                        if (this.rainIntensity === 1) audio.speak("Hafif bir yağmur çiselemeye başladı.");
                        else if (this.rainIntensity === 2) audio.speak("Yağmur başladı, yollar kayganlaşabilir.");
                        else audio.speak("Aniden bastıran şiddetli sağanak yağış başladı!");
                    } else {
                        audio.speak(this.isNight ? "Hava açtı, bulutlar dağıldı." : "Güneş açtı, hava güzelleşiyor.");
                    }
                }
            }
        }

        // YAĞMUR ŞİDDETİ EVRİMİ
        if (this.weather === 'rainy') {
            if (!this.lastRainCheckTime) this.lastRainCheckTime = currentTime;
            if (!this.nextRainChangeDelay) this.nextRainChangeDelay = 20000;
            
            if (currentTime - this.lastRainCheckTime > this.nextRainChangeDelay) {
                this.lastRainCheckTime = currentTime;
                this.nextRainChangeDelay = 15000 + Math.random() * 30000; // 15-45 saniye arası değişir
                
                // %60 ihtimalle şiddet değişir
                if (Math.random() < 0.6) {
                    let oldIntensity = this.rainIntensity || 1;
                    let change = Math.random() < 0.5 ? 1 : -1;
                    this.rainIntensity = Math.max(1, Math.min(4, oldIntensity + change));
                    
                    if (this.rainIntensity !== oldIntensity) {
                        if (typeof audio.setRainIntensity === 'function') {
                            audio.setRainIntensity(this.rainIntensity);
                        }
                        
                        if (this.rainIntensity === 1) {
                            audio.speak("Yağmur iyice hafifledi, sadece çiseliyor.");
                        } else if (this.rainIntensity === 2) {
                            if (oldIntensity < 2) audio.speak("Yağmur hızlandı, yollar ıslanıyor.");
                            else audio.speak("Yağmurun şiddeti biraz azaldı.");
                        } else if (this.rainIntensity === 3) {
                            if (oldIntensity < 3) audio.speak("Şiddetli sağanak yağış başladı, dikkatli sürün.");
                            else audio.speak("Fırtına dindi fakat sağanak yağış devam ediyor.");
                        } else if (this.rainIntensity === 4) {
                            audio.speak("Çok şiddetli fırtına ve sağanak var! Görüş mesafesi sıfır, hızınızı düşürün!");
                        }
                    }
                }
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
            // Kompresör havayı doldurur
            if (this.airPressure < 120) {
                let prevPressure = this.airPressure;
                this.airPressure += 2 * deltaTime; // Saniyede 2 PSI dolsun
                if (this.airPressure >= 120 && prevPressure < 120) {
                    this.airPressure = 120;
                    audio.playAirGovernorCutoff(); // Tahliye valfi çuf-tıss
                }
            }
        }
        
        let isBraking = (this.keys.s || this.keys.arrowdown);
        
        // BUG FIX: Çekici üzerindeyken fren yapılamasın
        if (this.isBeingTowed) {
            isBraking = false;
        }
        
        if (isBraking) {
            if (!this.isBrakeKeyDown) {
                // Frene ilk basışta pompalama cezası (-5 PSI anlık tahliye)
                this.airPressure -= 5;
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

        // FİZİK MOTORU VE KULLANICI GİRİŞLERİ (ÇEKİCİ MODUNDA KİLİTLENİR)
        if (!this.isBeingTowed) {
            // Motor kapalıysa araç gidemez
            if (!audio.isEngineRunning) {
                this.acceleration = -5; // Sadece sürtünme
            } else {
                // TONAJ (AĞIRLIK) HESAPLAMASI
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
            // GERÇEKÇİ OYUN ÖLÇEĞİ: 1 gerçek kilometre = Oyun içinde 250 metre sürüş süresi (4 kat hızlı)
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
            document.getElementById('hud-distance').innerText = Math.floor(this.currentDistanceToNext);
            
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
            if (!foundRealBump && (this.totalDistanceCovered - this.lastRandomKasisDistance > 1000) && Math.random() < 0.0001) {
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
                if (this.speed > 45) { // Güvenli geçiş hızı 30'dan 45'e çıkarıldı
                    let outcome = this.calculateCrashOutcome(35);
                    this.busDamage.health = Math.max(0, this.busDamage.health - 5);
                    if (typeof audio.playUnderbodyHit === 'function') audio.playUnderbodyHit();
                    
                    if (outcome === 0) {
                        if (typeof audio.speak === 'function') audio.speak("Kasise çok hızlı girdik, otobüsün altını vurduk ama şanslıyız, egzoza bir şey olmadı!");
                    } else if (outcome === 1) {
                        this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 25); // %25 hasar
                        if (typeof audio.speak === 'function') audio.speak("Kasise hızlı girdik, altını vurduk. Egzoz hasar aldı.");
                    } else {
                        this.busDamage.exhaust = Math.min(100, this.busDamage.exhaust + 50); // %50 hasar
                        if (typeof audio.speak === 'function') audio.speak("Kasise çok hızlı girdik, altını sert vurduk ve egzoz ağır hasar aldı!");
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
                            '"Şoför bey yandık, klimayı açar mısın?"',
                            '"İçerisi hamam gibi oldu, nefes alamıyoruz!"',
                            '"Çok sıcak, pişiyoruz burada!"'
                        ];
                        document.getElementById('passenger-dialog').innerText = complaints[Math.floor(Math.random() * complaints.length)];
                        document.getElementById('passenger-feedback').innerText = "Yolcular sıcaktan rahatsız oldu.";
                        document.getElementById('passenger-feedback').style.color = '#ef4444';
                        if (typeof audio.speak === 'function') audio.speak("Yolcular sıcaktan şikayet ediyor. Lütfen klimayı açın.");
                    } else if (this.busTemperature < (22 - comfortRange)) {
                        const complaints = [
                            '"Burası buz gibi oldu, donduracaksın bizi!"',
                            '"Şoför bey üşüyoruz, ısıtıcıyı açar mısın?"',
                            '"Çok soğuk, hasta olacağız!"'
                        ];
                        document.getElementById('passenger-dialog').innerText = complaints[Math.floor(Math.random() * complaints.length)];
                        document.getElementById('passenger-feedback').innerText = "Yolcular soğuktan rahatsız oldu.";
                        document.getElementById('passenger-feedback').style.color = '#ef4444';
                        if (typeof audio.speak === 'function') audio.speak("Yolcular soğuktan şikayet ediyor. Lütfen klimayı açıp 22 dereceye ayarlayın.");
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
        // Hız 20'nin altındaysa yeni araç doğmasını engelle, ancak var olan araçların yanımızdan akıp gitmesine izin ver
        let canSpawn = this.speed >= 20;

        let spawnChance = 0.005; // Daha dengeli bir trafik
        
        // Sadece 1 araç olsun ki kafa karışıklığı olmasın
        if (canSpawn && this.activeNPCs.length === 0 && Math.random() < spawnChance) {
            // Araçlar artık çapraz geçmeyecek, belirli bir şeritte üstümüze gelecek!
            const lanes = [20, 50, 80]; // Sol şerit, Orta şerit, Sağ şerit
            let startX;
            
            // %80 ihtimalle oyuncunun OLMADIĞI (güvenli) bir şeritten gelir
            if (Math.random() < 0.80) {
                let safeLanes = lanes.filter(lane => Math.abs(lane - this.lanePosition) > 15);
                if (safeLanes.length > 0) {
                    startX = safeLanes[Math.floor(Math.random() * safeLanes.length)];
                } else {
                    startX = lanes[Math.floor(Math.random() * lanes.length)];
                }
            } else {
                // Sadece %20 ihtimalle oyuncunun bulunduğu şeride yakın çıkar ("önüne kırma" hissi)
                startX = lanes.reduce((closest, curr) => Math.abs(curr - this.lanePosition) < Math.abs(closest - this.lanePosition) ? curr : closest);
            }
            
            // Başlangıç pan değeri şeride göre (-1, 0, 1)
            let initialPan = (startX - 50) / 30;
            let audioObj = audio.playNPCSound(initialPan);
            if (audioObj) {
                let isAnimal = audioObj.filename && audioObj.filename.includes('village');
                this.activeNPCs.push({
                    x: startX,
                    y: isAnimal ? 250 : 600, // Hayvanlar daha yakında belirsin (uzun süre yaklaşmaları beklenmesin)
                    baseSpeed: isAnimal ? 0 : 40 + Math.random() * 40, // Hayvanlar yolda durur, arabalar hareket eder
                    speedX: 0, // Araçlar şerit değiştirmez, dümdüz gelir
                    audioObj: audioObj,
                    hasCollided: false,
                    isAnimal: isAnimal
                });

                // EĞER AYNI ŞERİTTE DOĞDUYSA ERKEN UYARI VER
                if (Math.abs(startX - this.lanePosition) < 20) {
                    const currentTime = performance.now();
                    if (!this.lastCollisionWarnTime || currentTime - this.lastCollisionWarnTime > 5000) {
                        this.lastCollisionWarnTime = currentTime;
                        if (typeof audio.speak === 'function') {
                            audio.speak(isAnimal ? "Dikkat, yola hayvan çıkabilir!" : "Dikkat, önünüzde araç var!");
                        }
                    }
                }
            }
        }

        for (let i = this.activeNPCs.length - 1; i >= 0; i--) {
            let npc = this.activeNPCs[i];
            
            // Bize doğru yaklaşma (Kendi hızı + bizim hızımız)
            // Karşıdan gelen trafik gibi düşünülüyor. Biz dursak bile onlar hareket eder.
            npc.y -= (this.speed + npc.baseSpeed) * deltaTime * 0.5;
            
            // X ekseninde hareket YOK (speedX = 0). Araçlar hep kendi şeridinde kalır.
            
            // MÜKEMMEL STEREO VE YAKLAŞMA HİSSİ (Howler.js Spatial Audio)
            if (npc.audioObj && npc.audioObj.howlObj) {
                let apparentX = npc.x;
                if (this.roadCurvature) {
                    // Viraj Simülasyonu: Yol sağa kıvrılıyorsa (roadCurvature < 0), uzaktaki araç sağa (+x) kaymış gibi duyulur
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

            // Çarpışma (ÖLÜM VE HASAR MEKANİĞİ) - ÇEKİCİDEYKEN KAZA YAPILMAZ (0 HATA)
            if (!npc.hasCollided && npc.y <= 10 && npc.y > -10) {
                // Hız 20'nin altındaysa veya çekici otopilotundaysak çarpışma olmaz, teğet geçer
                // Sollama (overtaking) payını genişletmek için çarpışma sınırı < 20'den < 14'e düşürüldü
                if (!this.isBeingTowed && this.speed >= 20 && Math.abs(npc.x - this.lanePosition) < 14) {
                    npc.hasCollided = true;
                    
                    // FİZİKSEL ÇARPIŞMA TEPKİSİ: NPC'yi kenara fırlat ve durdur (Ghosting engelleme)
                    npc.baseSpeed = 0;
                    if (npc.audioObj) npc.audioObj.stop(); // Çarpışma anında sesi durdur (donup kalma hissini engeller)
                    // Eğer otobüs sağdaysa NPC sola savrulur, soldaysa sağa savrulur
                    npc.x = (this.lanePosition > 50) ? Math.max(-10, npc.x - 40) : Math.min(110, npc.x + 40);
                    
                    // Şiddete (Hızımıza) göre rastgele hasar hesaplama
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
                        audio.speak(npc.isAnimal ? "Yoldaki hayvana çarptık! Kaporta hasar aldı!" : `Önden çarpıştık! Kaporta hasar aldı!`);
                        this.busDamage.front = Math.min(100, this.busDamage.front + damageAmount);
                        
                        // Önden çarpmalarda farlar
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
                        
                        // Önden çarpmalarda silecekler
                        let wpOutcome = this.calculateCrashOutcome(damageAmount);
                        if (wpOutcome === 2) {
                            this.busDamage.wipers = 100;
                            if (typeof audio.isWiperOn !== 'undefined' && audio.isWiperOn) {
                                if (typeof audio.toggleWipers === 'function') audio.toggleWipers(); // Silecekleri zorla kapat
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
                    
                    // Akustiği güncelle (Bölgesel bozulma)
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
            
            // Sollama başarılı bildirimi (Sesli Geri Bildirim veya Rüzgar)
            if (!npc.hasCollided && npc.y < -10 && !npc.isPassed) {
                npc.isPassed = true;
            }

            // Araç arkamızda uzaklaştığında sil (Sesin aniden kesilmemesi için mesafe -600 yapıldı)
            if (npc.y < -600) {
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
        const stopData = this.activeRouteData.stops[this.currentStopIndex];
        const isFinalStop = this.currentStopIndex === this.activeRouteData.stops.length - 1;

        // Yolcu matematiğini başta hesapla
        const alighting = Math.floor(Math.random() * (Math.min(this.passengersOnBoard, 15) + 1));
        const waiting = stopData.bekleyenYolcu;

        // PAS GEÇME MANTIĞI: İnecek veya binecek yoksa ve son durak değilse durmadan geç
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
        
        audio.speakSequence(["Şimdiki durak:", stopData.name]);
        
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
        
        // BUG FIX: Kapı kapandığında rastgele yolcu ekleme ve hileli (magical) 50₺ verme hatası kaldırıldı.
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
        // BUG FIX 2: Kapılar hava ile çalışır, her açıp kapamada basınç düşer (-10 PSI)
        this.airPressure -= 10;
        
        this.frontDoorOpen = !this.frontDoorOpen;
        const btn = document.getElementById('btn-front-door');
        
        if (this.frontDoorOpen) {
            audio.playDoorOpen(true);
            btn.innerText = "Ön Kapıyı Kapat";
            
            // YOLCU TEPKİSİ: Kapı açıldığında nezaket
            if (this.passengersOnBoard > 0 && Math.random() < 0.3) {
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
                            return;
                        }
                        
                        const seatCapacity = this.activeRouteData.otobusKapasitesi || 40;
                        const maxStanding = 15; // BUG FIX 10: Ayakta yolcu kapasitesi sabit (max 15 kişi)
                        
                        if (this.passengersOnBoard < seatCapacity) {
                            // Normal biniş
                            this.automatedTicketProcess();
                            currentWaiting--;
                            stopData.bekleyenYolcu = currentWaiting; // BUG FIX: Orijinal veriyi de güncelle (Sonsuz para/yolcu hilesini engeller)
                            document.getElementById('stop-waiting-count').innerText = currentWaiting;
                        } else {
                            // Otobüs dolu, aşırı yığılma reaksiyonları
                            const rand = Math.random();
                            if (rand < 0.5 && this.passengersOnBoard < (seatCapacity + maxStanding)) {
                                document.getElementById('passenger-dialog').innerText = '"Ayakta giderim sorun değil."';
                                this.automatedTicketProcess(true);
                                currentWaiting--;
                                stopData.bekleyenYolcu = currentWaiting;
                                document.getElementById('stop-waiting-count').innerText = currentWaiting;
                            } else if (rand < 0.8 || this.passengersOnBoard >= (seatCapacity + maxStanding)) {
                                document.getElementById('passenger-dialog').innerText = '"Otobüs çok dolu, ben arkadan gelene bineceğim."';
                                document.getElementById('passenger-feedback').innerText = "Yolcu binmekten vazgeçti.";
                                document.getElementById('passenger-feedback').style.color = '#ef4444';
                                currentWaiting--;
                                stopData.bekleyenYolcu = currentWaiting;
                                document.getElementById('stop-waiting-count').innerText = currentWaiting;
                            } else {
                                document.getElementById('passenger-dialog').innerText = '"Burası çok dolu ve havasız oldu, ben iniyorum!"';
                                document.getElementById('passenger-feedback').innerText = "İçeriden 1 yolcu indi.";
                                document.getElementById('passenger-feedback').style.color = '#ef4444';
                                if (this.passengersOnBoard > 0) this.passengersOnBoard--;
                            }
                        }
                        
                        document.getElementById('hud-passengers').innerText = `${this.passengersOnBoard} / ${seatCapacity}`;
                    }, 1500);
                }
            }
        } else {
            // Kapıyı Kapat
            audio.playDoorClose(true);
            btn.innerText = "Ön Kapıyı Aç";
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
        // BUG FIX 2: Arka kapı pnömatik
        this.airPressure -= 10;
        
        this.rearDoorOpen = !this.rearDoorOpen;
        const btn = document.getElementById('btn-rear-door');
        
        if (this.rearDoorOpen) {
            audio.playDoorOpen(false);
            btn.innerText = "Arka Kapıyı Kapat";
            if (!this.isDriving) {
                document.getElementById('stop-alighting-count').innerText = "0";
            }
        } else {
            audio.playDoorClose(false);
            btn.innerText = "Arka Kapıyı Aç";
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
        
        let label = pType === "tam" ? "Tam" : (pType === "ogrenci" ? "Öğrenci" : "Serbest");
        document.getElementById('passenger-feedback').innerText = `${label} basıldı. ${fare > 0 ? fare + ' ₺ alındı.' : 'Ücretsiz geçiş.'}`;
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
            audio.speak("Tebrikler. Görev başarıyla tamamlandı. Bir sonraki göreve geçmek için sonraki üzerine tıklayın veya geri dönüp oyundan çıkmak için ana menü düğmesine basın.");
            
            if (this.activeRouteData && this.activeRouteData.isIntercity) {
                this.unlockCity(this.activeRouteData.destCity);
                if (typeof UI !== 'undefined') UI.showToast(`${this.activeRouteData.destCity} Şehrinin Kilidi Açıldı!`, 'success');
            }

            this.completeTask(); // İlerlemeyi kaydet
        } else {
            audio.speak("Kaza yaptınız veya görev iptal edildi. Görev başarısız oldu. Lütfen tekrar deneyin.");
        }
        
        if (document.getElementById('res-money')) document.getElementById('res-money').innerText = `${this.sessionMoney} ₺`;
        if (document.getElementById('res-penalties')) document.getElementById('res-penalties').innerText = `${this.sessionPenalties} ₺`;
        
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

        if (k === 't') {
            const msg = `Dış sıcaklık ${this.temperature} derece, otobüs içi ${Math.floor(this.busTemperature)} derece. ${this.isACOn ? "Klima açık." : "Klima kapalı."}`;
            if (typeof audio.speak === 'function') audio.speak(msg);
            return;
        }


        if (k === 'n') {
            e.preventDefault();
            // Sıradaki durağa kalan mesafe zaten currentDistanceToNext'in kendisidir (geriye sayar)
            let remDistance = Math.max(0, this.currentDistanceToNext);
            
            // Kalan durakların tahmini uzunluklarını ekle (Rota bitimine kadar olan tahmini mesafe)
            let totalRemaining = remDistance;
            if (this.activeRouteData && this.activeRouteData.stops) {
                for (let i = this.currentStopIndex + 1; i < this.activeRouteData.stops.length; i++) {
                    // Mevcut duraktan bir öncekine kadar olan mesafe gercekMesafeSonraki'de kayıtlıdır
                    let prevStop = this.activeRouteData.stops[i-1];
                    if (prevStop && prevStop.gercekMesafeSonraki) {
                        totalRemaining += prevStop.gercekMesafeSonraki * 1000;
                    }
                }
            }
            
            // Toplam rota uzunluğu = Şu ana kadar kat edilen TOPLAM yol + Kalan TOPLAM yol
            let totalRoute = this.totalDistanceCovered + totalRemaining;

            let msg = `Sıradaki durağa ${Math.floor(remDistance)} metre kaldı. Yolun toplam uzunluğu yaklaşık ${Math.floor(totalRoute / 1000)} kilometre.`;
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
        if (k === 'l') {
            e.preventDefault();
            if (typeof audio !== 'undefined' && typeof audio.playHorn === 'function') {
                audio.playHorn();
                
                // NPC'LERE KORNA TEPKİSİ
                if (this.activeNPCs && this.activeNPCs.length > 0) {
                    this.activeNPCs.forEach(npc => {
                        // Eğer NPC araçsa (hayvan değilse) ve yakınlardaysa (y > -100 ve y < 400)
                        if (!npc.isAnimal && npc.y > -100 && npc.y < 400) {
                            if (!npc.hasHonkedBack) {
                                npc.hasHonkedBack = true;
                                
                                // Kısa bir gecikmeyle kornaya karşılık versin
                                setTimeout(() => {
                                    if (npc.audioObj && npc.y > -200) { 
                                        let pan = (npc.x - 50) / 30;
                                        if (typeof audio.playNPCHorn === 'function') audio.playNPCHorn(pan);
                                        
                                        // Kornaya sinirlenip hızını artırsın (kızıp gitsinler)
                                        npc.baseSpeed += 50; 
                                    }
                                }, 600 + Math.random() * 600);
                            }
                        }
                    });
                }
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
        // BUG FIX: Oyun durumu değiştiğinde (örneğin durağa tam yanaştığımızda isDriving false olur)
        // Eğer bu kontrolü yaparsak, oyuncunun elini tuştan çekmesi algılanmaz ve tuş sonsuza kadar takılı kalır!
        // Bu yüzden keyup olayları her zaman dinlenmelidir.
        
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
                    // Parça seçimi
                    this.state = 'confirm';
                    if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("Bu parçayı onarmak ister misiniz? Onaylamak için enter'a basın.");
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
        
        const repairNext = () => {
            if (currentRepairIndex >= partsToRepair.length) {
                document.getElementById('sanayi-dialog').innerText = "Tüm onarımlar tamamlandı.";
                if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("İşler bitti patron. Sonra görüşürüz. Daha bakılacak çok araba var.");
                setTimeout(() => this.finishRepair(), 6000);
                return;
            }
            
            const part = partsToRepair[currentRepairIndex];
            const cost = Math.floor(part.damage * 15);
            Game.addMoney(-cost);
            const msg = "Su an " + part.name + " parcasini onariyorum. Onarim bedeli " + cost + " Lira hesabinizdan dusuldu.";
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
                setTimeout(repairNext, 4000);
            }, 30000);
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


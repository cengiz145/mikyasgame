/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU BAŞLATICI (APP.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // === HATA AYIKLAMA (DEBUG) MODU ===
    window.addEventListener('error', (e) => {
        console.error("Global JS Error:", e.message, "at", e.filename, ":", e.lineno);
        if (window.UI && typeof window.UI.showToast === 'function') {
            window.UI.showToast(`SİSTEM HATASI: ${e.message} (Satır: ${e.lineno})`, 'danger');
        }
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(`Kritik sistem hatası: ${e.message}. Lütfen bu hatayı bana bildirin.`);
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error("Unhandled Promise Rejection:", e.reason);
        let msg = e.reason ? (e.reason.message || e.reason) : "Bilinmeyen Promise Hatası";
        if (String(msg).indexOf('Firebase') === -1 && String(msg).indexOf('offline') === -1) {
            if (window.UI && typeof window.UI.showToast === 'function') {
                window.UI.showToast(`SİSTEM HATASI (Promise): ${msg}`, 'danger');
            }
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(`Gizli arka plan hatası: ${msg}. Lütfen bu hatayı bana bildirin.`);
            }
        }
    });
    // ===================================
    
    // Initialize Keyboard Navigation on load
    KeyboardNav.initForScreen();

    // === GÜNCELLEME: Eski hatalı rotaları otomatik temizle ===
    if (!localStorage.getItem('routeFixApplied_v1')) {
        localStorage.removeItem('routesData');
        localStorage.removeItem('activeRoute');
        localStorage.setItem('routeFixApplied_v1', 'true');
        console.log("Eski hatalı rotalar başarıyla temizlendi, yeni sistem aktif.");
    }
    // ==========================================================

    // 0. Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    const titleScreen = document.getElementById('title-screen');
    
    const dismissSplash = async () => {
        if (!splashScreen.classList.contains('hidden')) {
            audio.playSelect();
            splashScreen.classList.add('hidden');
            
            let savedUser = localStorage.getItem('otobusUsername');
            if (savedUser) {
                UI.showToast('Kullanıcı bilgileri yükleniyor...', 'info');
                try {
                    await Game.loadFromFirebase(savedUser);
                    titleScreen.classList.remove('hidden');
                    UI.showToast(`Tekrar hoş geldin, ${savedUser}!`, 'success');
                    audio.speak(`Tekrar hoş geldin, ${savedUser}!`);
                } catch (err) {
                    localStorage.removeItem('otobusUsername');
                    loginScreen.classList.remove('hidden');
                    document.getElementById('username-input').focus();
                }
            } else {
                loginScreen.classList.remove('hidden');
                document.getElementById('username-input').focus();
            }
            KeyboardNav.initForScreen();
        }
    };

    splashScreen.addEventListener('click', dismissSplash);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            dismissSplash();
        }
    });

    // 0.5. Login Screen
    document.getElementById('username-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('btn-login').click();
        }
    });

    document.getElementById('btn-login').addEventListener('click', async () => {
        // Firebase yasaklı karakterlerini temizle (. # $ [ ])
        let username = document.getElementById('username-input').value.trim();
        username = username.replace(/[.#$\[\]]/g, '');
        
        if (!username) {
            UI.showToast('Lütfen geçerli bir kullanıcı adı girin.', 'error');
            return;
        }

        audio.playSelect();
        UI.showToast('Giriş yapılıyor, lütfen bekleyin...', 'info');

        try {
            await Game.loadFromFirebase(username);
            localStorage.setItem('otobusUsername', username);
            
            loginScreen.classList.add('hidden');
            titleScreen.classList.remove('hidden');
            KeyboardNav.initForScreen();
            
            UI.showToast(`Hoş geldin, ${username}!`, 'success');
            audio.speak(`Hoş geldin, ${username}!`);
        } catch (error) {
            UI.showToast('Bağlantı hatası: Sunucuya bağlanılamadı. Çevrimdışı devam ediliyor.', 'warning');
            if (typeof audio.speak === 'function') audio.speak("Sunucuya bağlanılamadı, yerel kayıtla oyuna giriliyor.");
            
            // HATA OLSA BİLE OYUNA GİRMESİNE İZİN VER (Yerel kayıtla devam)
            localStorage.setItem('otobusUsername', username);
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('title-screen').classList.remove('hidden');
            KeyboardNav.initForScreen();
        }
    });

    // 1. Title Screen
    document.getElementById('btn-start-game').addEventListener('click', () => {
        audio.playSelect();
        
        if (Game.savedState) {
            audio.speak("Kaldığınız yerden yola devam ediyorsunuz.");
            Game.resumeFromSave();
            return;
        }

        UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        // Eğer daha önce merkez üs seçilmişse, direkt o şehrin görev ekranına (oyuna başla menüsüne) at!
        if (Game.unlockedCities.length > 0 && Game.currentCity) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: Game.currentCity } }));
        } else {
            UI.switchScreen('base-selection-menu');
        }
    });

    document.getElementById('btn-exit-game').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('exit-screen').classList.remove('hidden');
    });

    document.getElementById('btn-clear-cache').addEventListener('click', () => {
        audio.playSelect();
        
        // Sadece tutulması gerekenleri ayır
        const safeKeys = ['otobusUsername', 'licenseLevel', 'completedTasks', 'para', 'clockMinutes', 'unlockedCities', 'merkezUs'];
        const savedData = {};
        
        safeKeys.forEach(key => {
            savedData[key] = localStorage.getItem(key);
        });
        
        // Tümünü temizle (Gereksiz/bozuk veriler gider)
        localStorage.clear();
        
        // Gerekli olanları geri yükle
        safeKeys.forEach(key => {
            if (savedData[key] !== null) {
                localStorage.setItem(key, savedData[key]);
            }
        });
        
        UI.showToast("Önbellek temizlendi, oyun yeniden başlatılıyor...", "success");
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak("Gereksiz veriler temizlendi, oyun yeniden başlatılıyor.");
        }
        
        setTimeout(() => {
            window.location.reload(true);
        }, 2000);
    });

    // 2. City Selection (Map) Screen
    document.getElementById('btn-base-back').addEventListener('click', () => {
        audio.playSelect();
        UI.switchScreen('title-screen');
    });

    // Harita ekranından rota ekranına geçiş eventi (ui.js fırlatıyor)
    // 2.5 Mode Selection Modals
    document.getElementById('btn-mode-inner').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        KeyboardNav.initForScreen(); // Modal kapandı, arkaplana odaklan
        document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: Game.currentCity } }));
    });

    document.getElementById('btn-mode-cancel').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        KeyboardNav.initForScreen(); // Modal kapandı, arkaplana odaklan
    });

    document.getElementById('btn-mode-inter').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        
        // Populate destination list
        const listEl = document.getElementById('intercity-dest-list');
        listEl.innerHTML = '';
        
        const unlockedCitiesArr = Game.unlockedCities;
        let hasDestinations = false;
        
        // Find all possible destinations (all unlocked + neighbors)
        const possibleDests = new Set([...unlockedCitiesArr]);
        const data = sehirRotalari[Game.currentCity];
        if (data && data.komsular) {
            Object.values(data.komsular).forEach(n => possibleDests.add(n));
        }
        
        possibleDests.delete(Game.currentCity); // Can't go to self
        
        possibleDests.forEach(destCity => {
            hasDestinations = true;
            const isUnlocked = unlockedCitiesArr.includes(destCity);
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.justifyContent = 'space-between';
            btn.style.padding = '15px';
            
            btn.innerHTML = `
                <span><strong>${destCity}</strong> ${isUnlocked ? '(Açık Şehir)' : '(Keşfedilecek)'}</span>
                <span style="color: var(--secondary);">15 KM Sefer</span>
            `;
            
            btn.onclick = () => {
                audio.playSelect();
                document.getElementById('intercity-dest-modal').classList.add('hidden');
                
                // GENERATE AND START INTERCITY ROUTE
                const intercityRouteId = `intercity_${Game.currentCity}_${destCity}`;
                routesData[intercityRouteId] = {
                    id: intercityRouteId,
                    name: `${Game.currentCity} - ${destCity} (Uzun Yol)`,
                    desc: "Sadece kalkış ve varış otogarları. Uzun otoyol sürüşü.",
                    color: "#facc15",
                    taskIndex: Game.completedTasks,
                    otobusKapasitesi: 28,
                    biletFiyatMultiplier: 10, // Intercity is 10x more expensive
                    isIntercity: true,
                    destCity: destCity,
                    stops: [
                        { name: `${Game.currentCity} Kalkış Peronu`, bekleyenYolcu: 28, inenYolcu: 0, gercekMesafeSonraki: 0.1 },
                        { name: `${destCity} Merkez Otogar`, bekleyenYolcu: 0, inenYolcu: 28, gercekMesafeSonraki: 15 }
                    ]
                };
                
                // Add to sehirRotalari temporarily so startRoute works
                if (!sehirRotalari[Game.currentCity].routes.includes(intercityRouteId)) {
                    sehirRotalari[Game.currentCity].routes.push(intercityRouteId);
                }
                
                Game.startRoute(intercityRouteId);
            };
            li.appendChild(btn);
            listEl.appendChild(li);
        });
        
        if (hasDestinations) {
            document.getElementById('intercity-dest-modal').classList.remove('hidden');
            KeyboardNav.initForScreen(); // Modal açıldı, odağı buraya al
        } else {
            UI.showToast("Gidilebilecek şehir bulunamadı.", "error");
            document.getElementById('mode-selection-modal').classList.remove('hidden');
            KeyboardNav.initForScreen();
        }
    });

    document.getElementById('btn-intercity-cancel').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('intercity-dest-modal').classList.add('hidden');
        document.getElementById('mode-selection-modal').classList.remove('hidden');
        KeyboardNav.initForScreen(); // Önceki modala geri dönüldü
    });

    // 3. Route Menu // Eğer bu şehir için önceden API'den rota çekilmemişse, çek.
    document.addEventListener('go-to-route-screen', async (e) => {
        const cityName = e.detail.city;
        const cityData = sehirRotalari[cityName];
        
        // Eğer bu şehir için önceden API'den rota çekilmemişse, çek.
        const existingRoutes = Object.values(routesData).filter(r => r.sehir === cityName);
        
        if (existingRoutes.length === 0) {
            UI.showLoading(`${cityName} için duraklar yükleniyor...`);
            
            try {
                let p = 0;
                const interval = setInterval(() => { p += 10; if(p>90) p=90; UI.updateLoading(p); }, 300);

                let rawStops = null;
                const cacheKey = `cachedStops_v3_${cityName}`;
                const cachedData = localStorage.getItem(cacheKey);

                window.cityBumps = window.cityBumps || {};

                if (cachedData) {
                    // Hafızadan yükle
                    const parsed = JSON.parse(cachedData);
                    rawStops = parsed.stops || [];
                    window.cityBumps[cityName] = parsed.bumps || [];
                    
                    clearInterval(interval);
                    UI.updateLoading(100);
                    UI.showToast(`${cityName} verileri API'ye bağlanmadan hafızadan yüklendi!`, "success");
                } else {
                    // API'den canlı çek
                    rawStops = await fetchStopsFromOverpass(cityData.canliSorgu);
                    window.cityBumps[cityName] = window.lastFetchedBumps || [];
                    
                    clearInterval(interval);
                    UI.updateLoading(100);

                    if (rawStops.length < 5) {
                        UI.showToast("API'de durak bulunamadı. Yapay duraklar oluşturuluyor...", "error");
                        rawStops = Array.from({length: 25}, (_, i) => ({
                            name: `${cityName} Merkez Durak ${i+1}`,
                            lat: 40.0 + Math.random() * 0.1,
                            lon: 27.0 + Math.random() * 0.1
                        }));
                    }
                    
                    // Başarılı veya yapay, kaydet
                    localStorage.setItem(cacheKey, JSON.stringify({
                        stops: rawStops,
                        bumps: window.cityBumps[cityName]
                    }));
                }
                
                generateRoutesFromAPI(rawStops, cityName);
                
            } catch (err) {
                console.error(err);
                UI.showToast("API Hatası! Yapay duraklar oluşturuluyor...", "error");
                let fakeStops = Array.from({length: 25}, (_, i) => ({
                    name: `${cityName} Merkez Durak ${i+1}`,
                    lat: 40.0 + Math.random() * 0.1,
                    lon: 27.0 + Math.random() * 0.1
                }));
                
                // Hata sonrası üretilen durakları da hafızaya al ki bir daha hata beklemesin
                localStorage.setItem(`cachedStops_v2_${cityName}`, JSON.stringify(fakeStops));
                
                generateRoutesFromAPI(fakeStops, cityName);
            } finally {
                setTimeout(() => {
                    UI.hideLoading();
                }, 500);
            }
        }
        
        // Rotaları çiz ve geç
        UI.renderRoutes(cityName, Game.completedTasks);
        UI.switchScreen('route-menu');
    });

    // 3. Route Selection Screen
    document.getElementById('btn-route-back').addEventListener('click', () => {
        audio.playSelect();
        UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
        UI.switchScreen('base-selection-menu');
    });

    // 4. Garage Logic (Sefer Özeti)
    document.getElementById('btn-garage-back').addEventListener('click', () => {
        audio.playSelect();
        if (typeof SanayiMechanic !== 'undefined') SanayiMechanic.isActive = false;
        UI.switchScreen('route-menu');
    });

    document.getElementById('start-engine-btn').addEventListener('click', () => {
        audio.playSelect();
        Game.beginDriving();
    });

    // 5. Stop Screen Logic
    document.getElementById('btn-front-door').addEventListener('click', (e) => {
        Game.toggleFrontDoor();
    });

    document.getElementById('btn-rear-door').addEventListener('click', (e) => {
        Game.toggleRearDoor();
    });

    // 6. Results Logic
    document.getElementById('btn-next-mission').addEventListener('click', () => {
        audio.playSelect();
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        // BUG FIX: activeRouteId yerine sıradaki (completedTasks) taskIndex'e sahip rotayı bul
        let nextRouteId = Object.keys(routesData).find(k => 
            routesData[k].sehir === Game.currentCity && 
            routesData[k].taskIndex === Game.completedTasks
        );
        
        if (nextRouteId) {
            Game.startRoute(nextRouteId);
        } else {
            UI.showToast("Bu şehirdeki görevleri tamamladınız! Haritaya dönülüyor.", "success");
            Game.activeRouteId = null;
            const btnStart = document.getElementById('btn-start-game');
            if (btnStart) btnStart.innerText = "Yeni Bir Oyuna Başla";
            UI.switchScreen('route-menu');
        }
    });

    document.getElementById('btn-finish').addEventListener('click', () => {
        audio.playSelect();
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
        
        // BUG FIX: Görevi bitirdikten sonra ana menüdeki "Yeni Oyun" butonunu sıfırla ki hep aynı rotaya hapsetmesin!
        Game.activeRouteId = null;
        const btnStart = document.getElementById('btn-start-game');
        if (btnStart) {
            btnStart.onclick = null;
            btnStart.innerText = "Yeni Bir Oyuna Başla";
        }
        
        UI.switchScreen('base-selection-menu'); // Başarı ekranından direkt haritaya dön
    });

    // Draw Highway Canvas background
    const canvas = document.getElementById('highway-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        let offset = 0;
        function drawBg() {
            ctx.fillStyle = '#08090c';
            ctx.fillRect(0, 0, w, h);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            
            offset = (offset + 1) % 100;
            
            ctx.beginPath();
            for(let x = 0; x < w; x += 100) {
                ctx.moveTo(x - offset, 0);
                ctx.lineTo(x - offset + h, h);
            }
            for(let y = 0; y < h; y += 100) {
                ctx.moveTo(0, y + offset);
                ctx.lineTo(w, y + offset);
            }
            ctx.stroke();
            requestAnimationFrame(drawBg);
        }
        drawBg();
    }

    // ==========================================================================
    // GLOBAL KEYBOARD EVENT LISTENER (REMOVED FOR ACCESSIBILITY)
    // ==========================================================================
    // Screen readers and standard keyboard users rely on native Tab/Shift+Tab 
    // and virtual cursor arrow keys. Custom KeyboardNav interferes with this.

});

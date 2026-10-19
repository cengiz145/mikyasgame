/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU ARAYÜZ (UI.JS)
   ========================================================================== */

/* ==========================================================================
   MISSION READER (A: AÇIKLAMALARI OKU, SHIFT+A: ADIM ADIM FORMÜLSEL OKU, ESC: ÇIK)
   ========================================================================== */
const MissionReader = {
    currentStepIndex: 0,

    getActiveRoute: function() {
        if (typeof Game !== 'undefined' && Game.activeRouteData) {
            return Game.activeRouteData;
        }
        if (typeof routesData !== 'undefined') {
            const city = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
            const task = (typeof Game !== 'undefined' && typeof Game.completedTasks === 'number') ? Game.completedTasks : 0;
            let r = Object.values(routesData).find(x => x.sehir === city && x.taskIndex === task);
            if (r) return r;
            r = Object.values(routesData).find(x => x.sehir === city);
            if (r) return r;
            return Object.values(routesData)[0] || null;
        }
        return null;
    },

        formatStop: function(name, dir) {
        if (!name) return "";
        let t = name.trim();
        if (dir === 'to') {
            if (/ [Dd]urağı$/i.test(t)) return t.replace(/ [Dd]urağı$/i, ' durağına');
            if (/ [Mm]eydanı$/i.test(t)) return t.replace(/ [Mm]eydanı$/i, ' meydanına');
            if (/ [Mm]eydan$/i.test(t)) return t.replace(/ [Mm]eydan$/i, ' meydanına');
            if (/ [Tt]erminali$/i.test(t)) return t.replace(/ [Tt]erminali$/i, ' terminaline');
            if (/ [Pp]arkı$/i.test(t)) return t.replace(/ [Pp]arkı$/i, ' parkına');
            if (/ [Cc]addesi$/i.test(t)) return t.replace(/ [Cc]addesi$/i, ' Caddesine');
            if (/ [Oo]togarı$/i.test(t)) return t.replace(/ [Oo]togarı$/i, ' Otogarına');
            if (/ [Oo]togar$/i.test(t)) return t.replace(/ [Oo]togar$/i, ' otogarına');
            if (/ [Gg]irişi$/i.test(t)) return t.replace(/ [Gg]irişi$/i, ' Girişine');
            if (/ [Gg]iriş$/i.test(t)) return t.replace(/ [Gg]iriş$/i, ' Girişine');
            if (/ [Kk]avşağı$/i.test(t)) return t.replace(/ [Kk]avşağı$/i, ' Kavşağına');
            if (/ [Ss]apağı$/i.test(t)) return t.replace(/ [Ss]apağı$/i, ' Sapağına');
            if (/ [Mm]erkezi$/i.test(t)) return t.replace(/ [Mm]erkezi$/i, ' Merkezine');
            if (/ [Mm]erkez$/i.test(t)) return t.replace(/ [Mm]erkez$/i, ' Merkezine');
            return t + " durağına";
        } else {
            if (/ [Dd]urağı$/i.test(t)) return t.replace(/ [Dd]urağı$/i, ' durağından');
            if (/ [Mm]eydanı$/i.test(t)) return t.replace(/ [Mm]eydanı$/i, ' meydanından');
            if (/ [Mm]eydan$/i.test(t)) return t.replace(/ [Mm]eydan$/i, ' meydanından');
            if (/ [Tt]erminali$/i.test(t)) return t.replace(/ [Tt]erminali$/i, ' terminalinden');
            if (/ [Pp]arkı$/i.test(t)) return t.replace(/ [Pp]arkı$/i, ' parkından');
            if (/ [Cc]addesi$/i.test(t)) return t.replace(/ [Cc]addesi$/i, ' Caddesinden');
            if (/ [Oo]togarı$/i.test(t)) return t.replace(/ [Oo]togarı$/i, ' Otogarından');
            if (/ [Oo]togar$/i.test(t)) return t.replace(/ [Oo]togar$/i, ' otogarından');
            if (/ [Gg]irişi$/i.test(t)) return t.replace(/ [Gg]irişi$/i, ' Girişinden');
            if (/ [Gg]iriş$/i.test(t)) return t.replace(/ [Gg]iriş$/i, ' Girişinden');
            if (/ [Kk]avşağı$/i.test(t)) return t.replace(/ [Kk]avşağı$/i, ' Kavşağından');
            if (/ [Ss]apağı$/i.test(t)) return t.replace(/ [Ss]apağı$/i, ' Sapağından');
            if (/ [Mm]erkezi$/i.test(t)) return t.replace(/ [Mm]erkezi$/i, ' Merkezinden');
            if (/ [Mm]erkez$/i.test(t)) return t.replace(/ [Mm]erkez$/i, ' Merkezinden');
            return t + " durağından";
        }
    },

    generateSteps: function(route) {
        if (!route) return ["Henüz aktif bir görev veya rota bulunamadı."];

        let stops = route.stops;
        if (!stops || !Array.isArray(stops) || stops.length === 0) {
            let s = [];
            if (route.startStop) s.push({ name: route.startStop });
            if (route.intermediateStops && Array.isArray(route.intermediateStops)) {
                route.intermediateStops.forEach(st => s.push({ name: st }));
            }
            if (route.endStop) s.push({ name: route.endStop });
            stops = s;
        }

        if (stops.length === 0) {
            return ["Bu görev için durak adımı bulunamadı."];
        }

        const total = stops.length;
        const steps = [];

        // 1. Adım: Başlangıç durağından hareket
        const firstStop = stops[0];
        let step1 = "1. Adım: " + this.formatStop(firstStop.name, "from") + " ";
        if (typeof firstStop.bekleyenYolcu === 'number' && firstStop.bekleyenYolcu > 0) {
            step1 += "bekleyen " + firstStop.bekleyenYolcu + " yolcuyu alarak hareket edin.";
        } else if (typeof firstStop.bekleyenYolcu === 'number' && firstStop.bekleyenYolcu === 0) {
            step1 += "yolcu almadan hareket edin.";
        } else {
            step1 += "hareket edin, yolcu alın veya yolcu almadan devam edin.";
        }
        steps.push(step1);

        // Ara Duraklar: 1'den total - 2'ye kadar
        for (let i = 1; i < total - 1; i++) {
            const stop = stops[i];
            const prev = stops[i - 1];
            const distKm = (prev && prev.gercekMesafeSonraki && prev.gercekMesafeSonraki > 0) ? prev.gercekMesafeSonraki + " kilometre sonra " : "Sonra ";
            let step = (i + 1) + ". Adım: " + distKm + this.formatStop(stop.name, "to") + " gidin; ";
            
            const hasWaiting = (typeof stop.bekleyenYolcu === 'number' && stop.bekleyenYolcu > 0);
            const zeroWaiting = (typeof stop.bekleyenYolcu === 'number' && stop.bekleyenYolcu === 0);
            const hasAlighting = (typeof stop.inenYolcu === 'number' && stop.inenYolcu > 0);

            if (hasWaiting && hasAlighting) {
                step += "yolcuları indirin ve bekleyen " + stop.bekleyenYolcu + " yolcuyu alıp devam edin.";
            } else if (hasWaiting) {
                step += "bekleyen " + stop.bekleyenYolcu + " yolcuyu alıp devam edin.";
            } else if (hasAlighting && zeroWaiting) {
                step += "yolcuları indirin ve yolcu almadan devam edin.";
            } else if (zeroWaiting) {
                step += "yolcu almadan devam edin.";
            } else {
                step += "yolcu alın ya da yolcu almadan devam edin.";
            }
            steps.push(step);
        }

        // Son Durak: total - 1
        if (total > 1) {
            const lastStop = stops[total - 1];
            const prevLast = stops[total - 2];
            const distLast = (prevLast && prevLast.gercekMesafeSonraki && prevLast.gercekMesafeSonraki > 0) ? prevLast.gercekMesafeSonraki + " kilometre sonra hedef " : "Sonra hedef ";
            let lastStep = total + ". Adım (Hedef Son Durak): " + distLast + this.formatStop(lastStop.name, "to") + " gidin; ";
            if (typeof lastStop.inenYolcu === 'number' && lastStop.inenYolcu > 0) {
                lastStep += "tüm yolcuları indirin ve görevi tamamlayın.";
            } else {
                lastStep += "durakta durup görevi tamamlayın.";
            }
            steps.push(lastStep);
        }

        return steps;
    },

    readDescription: function() {
        const route = this.getActiveRoute();
        if (!route) {
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Görev haritasında henüz bir rota bulunamadı.");
            }
            return;
        }
        const startStop = route.startStop || (route.stops && route.stops[0] ? route.stops[0].name : "Başlangıç Durağı");
        const endStop = route.endStop || (route.stops && route.stops.length > 0 ? route.stops[route.stops.length - 1].name : "Hedef Son Durak");
        const intermediate = route.intermediateStops || (route.stops && route.stops.length > 2 ? route.stops.slice(1, -1).map(s => s.name) : []);
        const totalStops = route.stops ? route.stops.length : 0;

        const totalKmCalc = (route.stops && route.stops.length > 0) ? route.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0).toFixed(1) : 0;
        let msg = route.name + " açıklaması. " +
                  "Kalkış durağı: " + startStop + ". " +
                  "Gitmeniz gereken hedef son durak: " + endStop + ". " +
                  (intermediate.length > 0 ? "Durulacak ara duraklar: " + intermediate.join(", ") + ". " : "Ara durak bulunmamaktadır. ") +
                  "Toplam " + totalStops + " durak, toplam güzergah mesafesi " + totalKmCalc + " kilometre. " +
                  "Görevin adımlarını formülsel olarak adım adım dinlemek için Shift + A tuşuna basın. Çıkmak için Escape tuşuna basın.";
        
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(msg);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(msg);
        }
    },

    readNextStep: function() {
        const route = this.getActiveRoute();
        const steps = this.generateSteps(route);
        if (!steps || steps.length === 0) return;

        if (this.currentStepIndex >= steps.length) {
            this.currentStepIndex = 0;
        }

        let stepText = steps[this.currentStepIndex];

        // Sürüş halindeyse ve şu anki durak bu adımsa belirt
        if (typeof Game !== 'undefined' && Game.isDriving && typeof Game.currentStopIndex === 'number' && this.currentStepIndex === Game.currentStopIndex) {
            stepText = "(Şu anki hedefiniz) " + stepText;
        }

        this.currentStepIndex++;

        let nextNotice = (this.currentStepIndex < steps.length) 
            ? " (Sonraki adım için Shift + A, çıkmak için Escape tuşuna basın.)" 
            : " (Tüm görev adımları tamamlandı. Baştan dinlemek için Shift + A, çıkmak için Escape tuşuna basın.)";

        let fullMsg = stepText + nextNotice;

        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(fullMsg);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(fullMsg);
        }
    },

    exit: function() {
        this.currentStepIndex = 0;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (typeof audio !== 'undefined' && audio.stopSpeech) {
            audio.stopSpeech();
        }
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak("Açıklamadan çıkıldı.");
        }
    }
};
if (typeof window !== "undefined") window.MissionReader = MissionReader;

const UI = {
    updateTitleScreenButtons: function() {
        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;
        const activeDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");
        
        const btnCity = document.getElementById('btn-start-city');
        const btnIntercity = document.getElementById('btn-start-intercity');
        const lblDistrict = document.getElementById('lbl-active-district');
        
        if (lblDistrict) {
            lblDistrict.innerText = (activeDist === 'all') ? 'Tüm İlçeler' : activeDist;
        }
        
        if (btnCity) {
            if (hasPassed10) {
                btnCity.innerHTML = "🏙️ Şehir İçi ve İlçe Seferleri (TEKULAŞ)";
            } else {
                btnCity.innerHTML = `🏙️ Tüm ${activeDist} Hatları ve Mahalle Seferleri`;
            }
        }
        if (btnIntercity) {
            btnIntercity.style.display = hasPassed10 ? "flex" : "none";
        }
    },
    updateRouteScreenButtons: function() {
        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;
        const btnDistrict = document.getElementById('btn-route-district-mode');
        const btnBack = document.getElementById('btn-route-back');
        if (btnDistrict) {
            btnDistrict.style.display = hasPassed10 ? "flex" : "none";
        }
        if (btnBack) {
            btnBack.innerText = hasPassed10 ? "🗺️ Haritaya Dön" : "🏠 Ana Menüye Dön";
        }
    },
    screens: [
        'title-screen', 'base-selection-menu', 'route-menu', 
        'garage-screen', 'driving-screen', 'stop-screen', 'results-screen', 'sanayi-screen'
    ],
    
    switchScreen: function(screenId) {
        if (screenId === 'base-selection-menu' && typeof Game !== 'undefined' && !Game.hasPassedLevel10()) {
            console.warn("Harita ekranı 10 seviye geçilmeden açılamaz.");
            screenId = 'title-screen';
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.remove('hidden');
            KeyboardNav.initForScreen();
            
            // EKRAN OKUYUCU DÜZELTMESİ (A11Y):
            // role="application" kullanıldığı için ekran okuyucu başlıkları otomatik okumaz.
            // Bu yüzden yeni ekrana geçildiğinde başlığı manuel olarak anons ediyoruz.
            // Ekran degisimlerinde konusma kaldirildi (sadece navigasyon sesli)
        }
    },

    showToast: function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'âœ…' : (type === 'error' ? 'âŒ' : 'âš ï¸');
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        
        container.appendChild(toast);
        
        // EKRAN OKUYUCU DÜZELTMESİ (A11Y):
        // Toast mesajları ekranda sadece görsel çıkıyordu.
        // Toast mesajlarinda sesli anons kaldirildi (sadece navigasyon sesli)
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    updatePlayerStats: function(licenseLevel, completedTasks, budget, licenseTitle) {
        const lvlEl = document.getElementById('ui-level');
        if (lvlEl) lvlEl.innerText = licenseTitle;
        
        const budgetEl = document.getElementById('ui-budget');
        if (budgetEl) budgetEl.innerText = `${budget.toLocaleString('tr-TR')} ₺`;
        
        const xpText = document.getElementById('ui-xp-text');
        const xpFill = document.getElementById('ui-xp-fill');

        const currentXP = (typeof Game !== 'undefined' && Game.playerXP) ? Game.playerXP : 0;
        const currentLvl = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : (licenseLevel || 1);
        const prevThreshold = (typeof Game !== 'undefined' && Game.LEVEL_XP_THRESHOLDS) ? (Game.LEVEL_XP_THRESHOLDS[currentLvl - 1] || 0) : 0;
        const nextThreshold = (typeof Game !== 'undefined' && Game.getNextLevelXP) ? Game.getNextLevelXP(currentLvl) : 1000;

        const levelRange = Math.max(1, nextThreshold - prevThreshold);
        const progressInLevel = Math.max(0, currentXP - prevThreshold);
        const percent = Math.min(100, Math.round((progressInLevel / levelRange) * 100));

        if (xpText) {
            xpText.innerText = `${currentXP.toLocaleString('tr-TR')} / ${nextThreshold.toLocaleString('tr-TR')} XP (%${percent})`;
        }
        if (xpFill) {
            xpFill.style.width = `${percent}%`;
        }
    },

    renderCityMap: function(licenseLevel, unlockedCitiesArr) {
        const listEl = document.getElementById('city-selection-list');
        listEl.innerHTML = '';
        
        const isFirstTime = unlockedCitiesArr.length === 0;
        const isUzunYolUnlocked = licenseLevel > 4; // Ehliyet seviye 5 olunca Åehirlerarası açılır
        
        document.getElementById('map-subtitle').innerText = isFirstTime 
            ? "Maceraya Başlayacağınız Merkez Üssü Seçin" 
            : "Çalışmak İstediğiniz Åehri Seçin veya Haritayı Genişletin";

        document.getElementById('unlock-points-display').innerHTML = isUzunYolUnlocked 
            ? `Harita Keşfi: <span style="color:var(--success)">Uzun Yol Åoförü (Açık)</span>`
            : `Harita Keşfi: <span style="color:var(--danger)">Uzun Yol Ehliyeti Bekleniyor (3. Sınıfı Bitir)</span>`;

        // Unlockable komşuları bul (Açık olan şehirlerin komşuları)
        const unlockableCandidates = new Set();
        if (!isFirstTime) {
            unlockedCitiesArr.forEach(city => {
                const data = sehirRotalari[city];
                if (data && data.komsular) {
                    Object.values(data.komsular).forEach(neighbor => {
                        if (!unlockedCitiesArr.includes(neighbor)) {
                            unlockableCandidates.add(neighbor);
                        }
                    });
                }
            });
        }

        masterCitiesList.forEach(cityName => {
            const isUnlocked = isFirstTime || unlockedCitiesArr.includes(cityName);
            const canUnlock = !isFirstTime && unlockableCandidates.has(cityName) && isUzunYolUnlocked;
            const isNeighborButLocked = !isFirstTime && unlockableCandidates.has(cityName) && !isUzunYolUnlocked;
            
            const li = document.createElement('li');
            const btn = document.createElement('button');
            
            if (isUnlocked) {
                btn.className = 'menu-btn nav-item primary-btn';
                btn.innerHTML = `
                    <span class="btn-icon">ğŸ™ï¸</span>
                    <span class="btn-text">
                        <strong>${cityName} ${isFirstTime ? "(Merkez Üs Yap)" : "(Açık Åehir)"}</strong>
                        <small>Bu şehre giriş yap</small>
                    </span>
                `;
                btn.onclick = () => {
                    audio.playSelect();
                    if (isFirstTime) {
                        Game.unlockCity(cityName);
                        Game.setCity(cityName);
                        UI.showToast(`${cityName} Merkez Üssü Olarak Belirlendi!`, 'success');
                        setTimeout(() => {
                            UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
                            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: cityName } }));
                        }, 500);
                    } else {
                        Game.setCity(cityName);
                        const modeModal = document.getElementById('mode-selection-modal');
                        if (modeModal) {
                            modeModal.classList.remove('hidden');
                            KeyboardNav.initForScreen();
                        } else {
                            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: cityName } }));
                        }
                    }
                };
            } else if (canUnlock) {
                btn.className = 'menu-btn nav-item unlockable-city';
                btn.innerHTML = `
                    <span class="btn-icon">ğŸ”“</span>
                    <span class="btn-text">
                        <strong>${cityName} (Kilidi Aç)</strong>
                        <small>Uzun yol izni var. Sefere başla!</small>
                    </span>
                `;
                btn.onclick = () => {
                    audio.playSelect();
                    Game.unlockCity(cityName);
                    UI.showToast(`${cityName} Kilidi Açıldı!`, 'success');
                    UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
                };
            } else {
                btn.className = 'menu-btn nav-item locked-city';
                btn.disabled = true;
                
                let lockReason = isNeighborButLocked ? "Önce merkez üssünde 3. Sınıf Ehliyeti bitirmelisin!" : "Bu şehre henüz komşu değilsiniz.";
                
                btn.innerHTML = `
                    <span class="btn-icon">ğŸ”’</span>
                    <span class="btn-text">
                        <strong>${cityName} (Kilitli)</strong>
                        <small>${lockReason}</small>
                    </span>
                `;
            }

            li.appendChild(btn);
            listEl.appendChild(li);
        });
        
        KeyboardNav.initForScreen();
    },

    renderRoutes: function(cityName, completedTasks) {
        completedTasks = (typeof completedTasks === 'number') ? completedTasks : 0;
        const titleEl = document.getElementById("route-sel-title");
        if (titleEl) titleEl.innerText = cityName + " Sefer Görevleri ve Hatları";
        
        const listEl = document.getElementById("dynamic-route-list");
        if (!listEl) return;
        listEl.innerHTML = "";
        
        // Şehrin tüm görev rotalarını al (Kimlik ve isme göre tekilleştirilmiş)
        const seenRouteKeys = new Set();
        let cityRoutes = [];
        Object.values(routesData).forEach(r => {
            if (!r || !r.id) return;
            const key = r.id;
            if (seenRouteKeys.has(key)) return;
            seenRouteKeys.add(key);
            if (r.sehir === cityName && typeof r.taskIndex === 'number') {
                cityRoutes.push(r);
            }
        });
        
        // Eğer görev rotası yoksa, normal hatları göster (Tekilleştirilmiş)
        if (cityRoutes.length === 0) {
            seenRouteKeys.clear();
            Object.values(routesData).forEach(r => {
                if (!r || !r.id) return;
                const key = r.name || r.id;
                if (seenRouteKeys.has(key)) return;
                seenRouteKeys.add(key);
                if (r.sehir === cityName || (cityName === "Tekirdağ" && (r.isDistrict || r.originDistrict === "Süleymanpaşa" || r.destDistrict))) {
                    cityRoutes.push(r);
                }
            });
        }

        if (cityRoutes.length === 0) {
            listEl.innerHTML = '<li style="text-align:center; color: white; padding: 20px;">Bu şehir için kayıtlı rota bulunamadı.</li>';
            return;
        }

        // Aktif lisans seviyesi (Çırak = 1, Kalfa = 2, Usta = 3)
        const currentLic = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;

        // Görevleri sırala: Aktif görev EN BAŞTA
        cityRoutes.sort((a, b) => {
            if (a.taskIndex === completedTasks) return -1;
            if (b.taskIndex === completedTasks) return 1;
            return (a.taskIndex || 0) - (b.taskIndex || 0);
        });

        // Oyuncunun görebileceği görevler: Mevcut lisans seviyesindeki veya tamamlanan görevler
        const visibleRoutes = cityRoutes.filter(r => {
            if (typeof r.licenseLevel === 'number') {
                return r.licenseLevel <= currentLic;
            }
            return true;
        });

        const routesToRender = visibleRoutes.length > 0 ? visibleRoutes : cityRoutes;

        routesToRender.forEach(route => {
            const isCurrentTask = (route.taskIndex === completedTasks);
            const isCompleted = (typeof route.taskIndex === 'number' && route.taskIndex < completedTasks);
            const isFuture = (typeof route.taskIndex === 'number' && route.taskIndex > completedTasks);

            const access = (typeof Game !== 'undefined' && typeof Game.isRouteAccessible === 'function')
                ? Game.isRouteAccessible(route.id)
                : { allowed: !isFuture };
            const isLocked = !access.allowed || isFuture;

            const li = document.createElement("li");
            li.style.marginBottom = "10px";
            const btn = document.createElement("button");
            
            let btnClass = "menu-btn nav-item";
            if (isCurrentTask) {
                btnClass += " primary-btn pulse-anim";
            } else if (isCompleted) {
                btnClass += " secondary-btn";
            } else if (isLocked) {
                btnClass += " locked-route";
            }

            btn.className = btnClass;
            btn.style.flexDirection = "column";
            btn.style.alignItems = "stretch";
            btn.style.textAlign = "left";
            btn.style.padding = "16px 20px";
            btn.style.lineHeight = "1.5";
            btn.style.width = "100%";
            if (isCurrentTask) {
                btn.style.borderColor = "#38bdf8";
                btn.style.boxShadow = "0 0 16px rgba(56, 189, 248, 0.4)";
            } else if (isLocked) {
                btn.style.opacity = "0.7";
                btn.style.border = "1.5px dashed rgba(239, 68, 68, 0.5)";
                btn.style.background = "rgba(15, 23, 42, 0.75)";
                btn.setAttribute("aria-disabled", "true");
            }

            let icon = isCurrentTask ? "▶️" : (isCompleted ? "✅" : "🔒");
            let statusText = isCurrentTask ? "(AKTİF SEFER GÖREVİ)" : (isCompleted ? "(Tamamlandı - Tekrar Sür)" : `(Kilitli - Önce Görev ${completedTasks + 1}'i Tamamlayın)`);
            
            const startStop = route.startStop || (route.stops && route.stops[0] ? route.stops[0].name : "Kalkış Garajı");
            const endStop = route.endStop || (route.stops && route.stops.length > 0 ? route.stops[route.stops.length - 1].name : "Varış");
            const intermediate = route.intermediateStops || (route.stops && route.stops.length > 2 ? route.stops.slice(1, -1).map(s => s.name) : []);
            
            const totalKmRoute = (route.totalKm) ? route.totalKm.toFixed(1) : ((route.stops && route.stops.length > 0) ? route.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0).toFixed(1) : 0);
            const stopCount = (route.stops) ? route.stops.length : 0;
            const badgeHtml = '<span style="background: rgba(56,189,248,0.2); color: #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">' + stopCount + ' Durak | ' + totalKmRoute + ' km</span>';
            const cardSteps = (typeof MissionReader !== "undefined" && MissionReader.generateSteps) ? MissionReader.generateSteps(route) : [];
            const cardStepsHtml = cardSteps.map(s => '<div style="margin: 3px 0;">• ' + s + '</div>').join('');
            
            let ariaDesc = isLocked 
                ? ("Görev: " + route.name + " Kilitli. Mikyas Kaptanlık Akademisi Kuralı: Bir seviye tamamlanmadan diğer seviyelere başlanamaz! Bu seviyeye geçmek için önce Görev " + (completedTasks + 1) + " başarıyla tamamlanmalıdır. Kalkış: " + startStop + ", Varış: " + endStop + ".")
                : ("Görev: " + route.name + " " + statusText + ". Kalkış: " + startStop + ", Varış: " + endStop + ". Toplam " + stopCount + " durak, " + totalKmRoute + " kilometre.");
            
            btn.setAttribute("aria-label", ariaDesc);

            const lockedNoticeHtml = isLocked ? 
                ('<div style="font-size: 0.88rem; color: #f87171; background: rgba(239, 68, 68, 0.12); border-left: 3px solid #ef4444; padding: 8px 12px; border-radius: 4px; margin-top: 8px;">' +
                 '    ⛔ <strong>Seviye Sırası Kuralı:</strong> Bir seviye tamamlanmadan diğer seviyelere başlanamaz! Bu görevin kilidini açmak için önce <strong>Görev ' + (completedTasks + 1) + '</strong> seferini başarıyla tamamlamalısınız.' +
                 '</div>') : '';

            btn.innerHTML = [
                '<div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px;">',
                '    <strong style="color: ' + (isLocked ? '#f87171' : (route.color || '#38bdf8')) + '; font-size: 1.15rem;">' + icon + ' ' + route.name + ' ' + statusText + '</strong>',
                '    ' + badgeHtml,
                '</div>',
                '<div style="font-size: 1rem; color: #f1f5f9; margin-bottom: 5px;">',
                '    📍 <strong>Kalkış (Başlangıç) Durağı:</strong> <span style="color: #38bdf8; font-weight: bold;">' + startStop + '</span>',
                '</div>',
                '<div style="font-size: 1rem; color: #f1f5f9; margin-bottom: 5px;">',
                '    🏁 <strong>Gidilecek Hedef Son Durak:</strong> <span style="color: #22c55e; font-weight: bold;">' + endStop + '</span>',
                '</div>',
                (intermediate.length > 0 ? 
                    '<div style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 8px;">🛑 <strong>Durulacak Ara Duraklar:</strong> ' + intermediate.join(' ➔ ') + '</div>' : 
                    '<div style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 8px;">🛑 <strong>Durulacak Ara Duraklar:</strong> Ara durak yok (Doğrudan varış durağına kesintisiz sürüş)</div>'),
                (isCurrentTask ? 
                '<div style="font-size: 0.88rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 6px; width: 100%; border-left: 3px solid #38bdf8; margin-top: 6px;">' +
                '    📋 <strong>Görev Adımları (A: Harita Özeti | Shift + A: Adım Adım Dinle):</strong><br>' + cardStepsHtml +
                '</div>' : ''),
                lockedNoticeHtml
            ].join("");

            btn.onclick = () => {
                if (isLocked) {
                    if (typeof audio !== 'undefined' && audio.playWarning) {
                        try { audio.playWarning(); } catch(e) {}
                    } else if (typeof audio !== 'undefined' && audio.playSelect) {
                        audio.playSelect();
                    }
                    const msg = (access && access.reason) ? access.reason : ("Mikyas Kaptanlık Akademisi Kuralı: Bir seviye tamamlanmadan diğer seviyelere başlanamaz! Bu görevi açmak için lütfen önce Görev " + (completedTasks + 1) + "'i başarıyla tamamlayın.");
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Bu seviye kilitlidir. Önce Görev " + (completedTasks + 1) + "'i tamamlayın.", "warning");
                    if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(msg);
                    return;
                }
                if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                if (typeof Game !== 'undefined' && Game.startRoute) {
                    Game.startRoute(route.id);
                }
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });
        
        KeyboardNav.initForScreen();
    },

    showLoading: function(text) {
        const loader = document.getElementById('global-progress');
        document.getElementById('global-progress-text').innerText = text;
        document.getElementById('global-progress-bar').style.width = "0%";
        loader.classList.remove('hidden');
    },

    updateLoading: function(percentage) {
        document.getElementById('global-progress-bar').style.width = `${percentage}%`;
    },

    hideLoading: function() {
        document.getElementById('global-progress').classList.add('hidden');
    }
};



/* ==========================================================================
   KEYBOARD NAVIGATION (MENÜ GEZİNTİSİ)
   ========================================================================== */
const KeyboardNav = {
    items: [],
    currentIndex: 0,
    
    initForScreen: function() {
        this.items = [];
        this.currentIndex = 0;
        
        // EKRAN OKUYUCU DÜZELTMESİ (A11Y): Açık bir modal varsa klavye odağını önce ona hapset
        const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
        let activeContainer = null;
        
        if (visibleModals.length > 0) {
            activeContainer = visibleModals[0];
        } else {
            const visibleScreens = document.querySelectorAll('.screen:not(.hidden)');
            if (visibleScreens.length > 0) {
                activeContainer = visibleScreens[0];
            }
        }
        
        if (!activeContainer) return;
        
        const elements = activeContainer.querySelectorAll('.nav-item');
        elements.forEach(el => {
            if (!el.disabled && !el.classList.contains('hidden') && el.style.display !== 'none') {
                this.items.push(el);
            }
        });
        
        this.updateFocus();
    },
    
    updateFocus: function() {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-focused'));
        
        if (this.items.length > 0) {
            if (this.currentIndex < 0) this.currentIndex = this.items.length - 1;
            if (this.currentIndex >= this.items.length) this.currentIndex = 0;
            
            const focusedEl = this.items[this.currentIndex];
            focusedEl.classList.add('nav-focused');
            focusedEl.focus(); 
        }
    },
    
    moveNext: function() {
        if (this.items.length === 0) return;
        audio.playNav();
        this.currentIndex++;
        this.updateFocus();
    },
    
    movePrev: function() {
        if (this.items.length === 0) return;
        audio.playNav();
        this.currentIndex--;
        this.updateFocus();
    },
    
    selectCurrent: function() {
        if (this.items.length === 0) return;
        const focusedEl = this.items[this.currentIndex];
        if (focusedEl) {
            focusedEl.click();
        }
    }
};

window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

    // SHIFT + OK TUŞLARI: PUSULA VE 4 YÖN SİSTEMİ (Kuzey, Güney, Doğu, Batı)
    if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        if (typeof CompassSystem !== 'undefined' && typeof CompassSystem.handleDirection === 'function') {
            CompassSystem.handleDirection(e.key);
        } else if (typeof CompassNav !== 'undefined') {
            CompassNav.handleDirection(e.key);
        }
        return;
    }

    const isDriving = (typeof Game !== 'undefined' && Game.isDriving);

    // ESCAPE: Açıklamayı susturur ve çıkar
    if (e.key === 'Escape') {
        if (typeof MissionReader !== 'undefined') MissionReader.exit();
        return;
    }

    // SHIFT + A: Adım adım görevin adımlarını okur (Hem menüde hem sürüşte çalışır)
    if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (typeof MissionReader !== 'undefined') MissionReader.readNextStep();
        return;
    }

    // A TUŞU: Görev haritasındaki açıklamaları okur (SADECE sürüşte değilken - sürüşte A sola döndürür)
    if (!e.shiftKey && !e.ctrlKey && !e.altKey && (e.key === 'a' || e.key === 'A') && !isDriving) {
        e.preventDefault();
        if (typeof MissionReader !== 'undefined') MissionReader.readDescription();
        return;
    }

    if (isDriving) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        KeyboardNav.moveNext();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        KeyboardNav.movePrev();
    } else if (e.key === 'Enter' || e.key === ' ') {
        if (e.repeat) {
            e.preventDefault();
            return;
        }
        // NVDA veya Tab ile odaklanılan eleman bir buton değilse (div ise) Enter native çalışmaz.
        // Bu yüzden eğer bir nav-item üzerinde isek tıklamasını sağlıyoruz.
        if (document.activeElement && document.activeElement.classList.contains('nav-item')) {
            if (document.activeElement.tagName !== 'BUTTON') { 
                e.preventDefault();
                document.activeElement.click();
            }
        }
    }
});





/* ==========================================================================
   PUSULA VE 4 YÖN SİSTEMİ ENTEGRASYONU (COMPASS-SYSTEM DELEGATION)
   Modüler yapı js/compass-system.js dosyasına optimize edilmiş olup,
   tam geriye dönük uyumluluk sağlanmıştır.
   ========================================================================== */
if (typeof CompassSystem !== 'undefined') {
    window.CompassNav = CompassSystem;
}

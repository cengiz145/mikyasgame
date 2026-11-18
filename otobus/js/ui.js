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
        const btnChangeDist = document.getElementById('btn-change-active-district');
        const distNameDisplay = (activeDist === 'all') ? 'Tüm İlçeler' : activeDist;
        
        if (lblDistrict) {
            lblDistrict.innerText = distNameDisplay;
        }
        if (btnChangeDist) {
            btnChangeDist.setAttribute('aria-label', `Bölge veya Şehir Değiştir. Şu anki seçili bölge: ${distNameDisplay}. Listeden değiştirmek için tıklayın`);
            btnChangeDist.setAttribute('title', `Aktif Bölge: ${distNameDisplay}`);
        }
        
        const btnCareer = document.getElementById('btn-mode-career');
        const btnFree = document.getElementById('btn-mode-freedrive');
        const completed = (typeof Game !== 'undefined' && typeof Game.completedTasks === 'number') ? Game.completedTasks : 0;
        const currentTitle = (typeof Game !== 'undefined' && Game.getLicenseTitle) ? Game.getLicenseTitle() : "Kaptan";

        if (btnCareer) {
            btnCareer.innerHTML = `<div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 1.8rem; line-height: 1;">🎖️</span>
                <strong style="font-size: 1.15rem; color: #fff;">Kariyer Modu</strong>
            </div>
            <span style="color: #38bdf8; font-size: 1.3rem;">➜</span>`;
            btnCareer.setAttribute('aria-label', 'Kariyer Modu');
        }
        if (btnFree) {
            btnFree.innerHTML = `<div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 1.8rem; line-height: 1;">🛣️</span>
                <strong style="font-size: 1.15rem; color: #4ade80;">Serbest Sürüş Modu</strong>
            </div>
            <span style="color: #22c55e; font-size: 1.3rem;">➜</span>`;
            btnFree.setAttribute('aria-label', 'Serbest Sürüş Modu');
        }
        if (btnCity) {
            if (hasPassed10) {
                btnCity.innerHTML = "🏙️ Şehir İçi ve İlçe Seferleri (TEKULAŞ Hatları)";
            } else if (completed === 0) {
                btnCity.innerHTML = "🚍 Seferlere Başla (1. Sınıf Stajyer İntikali - Görev 1)";
            } else {
                btnCity.innerHTML = `🚍 Seferlere Devam Et (${completed + 1}. Görev: 10'da ${completed} Tamamlandı)`;
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
        if (screenId === 'main-menu') screenId = 'title-screen';
        if (screenId === 'base-selection-menu' && typeof Game !== 'undefined' && !Game.hasPassedLevel10()) {
            console.warn("Harita ekranı 10 seviye geçilmeden açılamaz.");
            screenId = 'title-screen';
        }
        // Eğer menü veya sonuç ekranına geçiliyorsa açık kalan sesli konuşmaları ve durak/yolcu zamanlayıcılarını anında temizle
        if (screenId !== 'driving-screen' && screenId !== 'stop-screen') {
            if (typeof Game !== 'undefined' && typeof Game.cleanupPassengerTimersAndState === 'function') {
                Game.cleanupPassengerTimersAndState();
            }
            if (typeof window !== 'undefined' && window.HumanNpcVoices) {
                if (screenId === 'results-screen' && typeof window.HumanNpcVoices.stopTimersOnly === 'function') {
                    window.HumanNpcVoices.stopTimersOnly();
                } else if (typeof window.HumanNpcVoices.stopAll === 'function') {
                    window.HumanNpcVoices.stopAll();
                }
            }
            if (typeof audio !== 'undefined') {
                if (audio.stopSpeech) audio.stopSpeech();
                if (typeof audio.updateCrowdAmbience === 'function') audio.updateCrowdAmbience(0, false, false);
                if (typeof audio.updatePassengerCabinMurmur === 'function') audio.updatePassengerCabinMurmur(0, false);
            }
            if (typeof RoleplaySystem !== 'undefined' && typeof RoleplaySystem.stopPassengerMurmurIfNeeded === 'function') {
                RoleplaySystem.stopPassengerMurmurIfNeeded();
            }
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
        
        const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : '⚠️');
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
        if (lvlEl) {
            let displayTitle = licenseTitle || "1. Sınıf Şehir İçi Sürücüsü";
            if (typeof DriverBadges !== 'undefined' && typeof DriverBadges.getEquippedTitle === 'function') {
                const eq = DriverBadges.getEquippedTitle();
                if (eq && eq.name && eq.id !== 'title_cirak') {
                    displayTitle = `${eq.icon || '👑'} ${eq.name}`;
                    lvlEl.title = `Kuşanılan Unvan: ${eq.name} | Kademe: ${licenseTitle || '1. Sınıf Sürücü'}`;
                }
            }
            lvlEl.innerText = displayTitle;
        }
        
        const budgetEl = document.getElementById('ui-budget');
        if (budgetEl) budgetEl.innerText = `${budget.toLocaleString('tr-TR')} ₺`;
        
        const xpText = document.getElementById('ui-xp-text');
        const xpFill = document.getElementById('ui-xp-fill');

        const currentXP = (typeof Game !== 'undefined' && Game.playerXP) ? Game.playerXP : 0;
        const currentLvl = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : (licenseLevel || 1);
        const prevThreshold = (typeof Game !== 'undefined' && Game.LEVEL_XP_THRESHOLDS)
            ? (currentLvl > 20 ? 71000 + ((currentLvl - 20) * 10000) : (Game.LEVEL_XP_THRESHOLDS[currentLvl - 1] || 0))
            : 0;
        const nextThreshold = (typeof Game !== 'undefined' && Game.getNextLevelXP) ? Game.getNextLevelXP(currentLvl) : 1000;

        const levelRange = Math.max(1, nextThreshold - prevThreshold);
        const progressInLevel = Math.max(0, currentXP - prevThreshold);
        const percent = Math.min(100, Math.round((progressInLevel / levelRange) * 100));

        if (xpText) {
            xpText.innerText = `${currentXP.toLocaleString('tr-TR')} / ${nextThreshold.toLocaleString('tr-TR')} XP (%${percent})`;
            xpText.title = `Mevcut Seviye İlerlemesi: ${progressInLevel.toLocaleString('tr-TR')} / ${levelRange.toLocaleString('tr-TR')} XP (%${percent}) | Seviye ${currentLvl + 1}'e kalan: ${Math.max(0, nextThreshold - currentXP).toLocaleString('tr-TR')} XP`;
        }
        if (xpFill) {
            xpFill.style.width = `${percent}%`;
        }
    },

            renderCityMap: function(licenseLevel, unlockedCitiesArr) {
        licenseLevel = (typeof licenseLevel === 'number') ? licenseLevel : (typeof Game !== 'undefined' && Game.licenseLevel ? Game.licenseLevel : 1);
        unlockedCitiesArr = Array.isArray(unlockedCitiesArr) ? unlockedCitiesArr : (typeof Game !== 'undefined' && Array.isArray(Game.unlockedCities) ? Game.unlockedCities : ["Tekirdağ"]);

        const listEl = document.getElementById('city-selection-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        
        const isFirstTime = (unlockedCitiesArr.length === 0);
        const isUzunYolUnlocked = licenseLevel > 4; // Ehliyet seviye 5 olunca Şehirlerarası açılır
        
        const subTitleEl = document.getElementById('map-subtitle');
        if (subTitleEl) {
            subTitleEl.innerText = isFirstTime 
                ? "Maceraya Başlayacağınız Merkez Üssü Seçin" 
                : "Çalışmak İstediğiniz Şehri Seçin veya Haritayı Genişletin";
        }

        const unlockPointsEl = document.getElementById('unlock-points-display');
        if (unlockPointsEl) {
            unlockPointsEl.innerHTML = isUzunYolUnlocked 
                ? `Harita Keşfi: <span style="color:var(--success)">Uzun Yol Şoförü (Açık)</span>`
                : `Harita Keşfi: <span style="color:var(--danger)">Uzun Yol Ehliyeti Bekleniyor (3. Sınıfı Bitir)</span>`;
        }

        // Unlockable komşuları bul (Açık olan şehirlerin coğrafi komşuları)
        const unlockableCandidates = new Set();
        if (!isFirstTime) {
            unlockedCitiesArr.forEach(city => {
                const data = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[city] : null;
                if (data && data.komsular) {
                    Object.values(data.komsular).forEach(neighbor => {
                        if (!unlockedCitiesArr.includes(neighbor)) {
                            unlockableCandidates.add(neighbor);
                        }
                    });
                }
            });
        }

        const currentActiveCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";

        masterCitiesList.forEach((cityName, idx) => {
            const isUnlocked = isFirstTime || unlockedCitiesArr.includes(cityName);
            const canUnlock = !isFirstTime && unlockableCandidates.has(cityName) && isUzunYolUnlocked;
            const isNeighborButLocked = !isFirstTime && unlockableCandidates.has(cityName) && !isUzunYolUnlocked;
            
            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-city', cityName);
            btn.setAttribute('role', 'button');
            
            if (isUnlocked) {
                const isSelectedCity = (cityName === currentActiveCity);
                btn.className = `menu-btn nav-item primary-btn ${isSelectedCity ? 'city-active-item' : ''}`;
                btn.style.width = '100%';
                btn.style.justifyContent = 'space-between';
                btn.style.border = isSelectedCity ? '2px solid #22c55e' : '1px solid rgba(56,189,248,0.4)';
                
                const labelText = isFirstTime 
                    ? `${idx + 1}. Şehir: ${cityName}. Açık Şehir. Başlangıç merkez üssü yapmak için Enter tuşuna basın.`
                    : `${idx + 1}. Şehir: ${cityName}. Açık Şehir. ${isSelectedCity ? 'Şu anki aktif merkeziniz.' : ''} Sefere başlamak veya şehre giriş yapmak için Enter tuşuna basın.`;
                btn.setAttribute('aria-label', labelText);
                
                btn.innerHTML = `
                    <span class="btn-icon">🏙️</span>
                    <span class="btn-text" style="text-align: left; flex: 1; margin-left: 10px;">
                        <strong>${cityName} ${isFirstTime ? "(Merkez Üs Yap)" : "(Açık Şehir)"}</strong>
                        <small style="display:block; color:#94a3b8; font-size:0.85rem;">Bu şehre giriş yap ve seferleri gör</small>
                    </span>
                    <span style="font-weight: bold; font-size: 0.9rem; color: #4ade80;">${isSelectedCity ? '✓ AKTİF' : 'Giriş Yap'}</span>
                `;
                btn.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    if (isFirstTime) {
                        Game.unlockCity(cityName);
                        Game.setCity(cityName);
                        const selMsg = `${cityName} Merkez Üssü Olarak Belirlendi!`;
                        UI.showToast(selMsg, 'success');
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(selMsg);
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
                            const modeVoice = `${cityName} seçildi. Görev modunu belirleyin: Şehir içi seferler, ilçe hatları veya şehirlerarası uzun yol.`;
                            if (typeof audio !== 'undefined' && audio.speak) audio.speak(modeVoice);
                            if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(modeVoice);
                        } else {
                            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: cityName } }));
                        }
                    }
                };
            } else if (canUnlock) {
                btn.className = 'menu-btn nav-item unlockable-city';
                btn.style.width = '100%';
                btn.style.justifyContent = 'space-between';
                btn.setAttribute('aria-label', `${idx + 1}. Şehir: ${cityName}. Kilidi açılabilir komşu şehir. Uzun yol izniniz mevcut. Kilidi açmak ve sefere başlamak için Enter tuşuna basın.`);
                btn.innerHTML = `
                    <span class="btn-icon">🔓</span>
                    <span class="btn-text" style="text-align: left; flex: 1; margin-left: 10px;">
                        <strong>${cityName} (Kilidi Aç)</strong>
                        <small style="display:block; color:#94a3b8; font-size:0.85rem;">Uzun yol izni var. Sefere başla!</small>
                    </span>
                    <span style="font-weight: bold; font-size: 0.9rem; color: #38bdf8;">Kilidi Aç</span>
                `;
                btn.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    Game.unlockCity(cityName);
                    const unlockMsg = `${cityName} Kilidi Açıldı! Seferlere başlanabilir.`;
                    UI.showToast(unlockMsg, 'success');
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(unlockMsg);
                    UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
                };
            } else {
                btn.className = 'menu-btn nav-item locked-city';
                btn.setAttribute('aria-disabled', 'true');
                btn.style.width = '100%';
                btn.style.justifyContent = 'space-between';
                btn.style.opacity = '0.75';
                btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                btn.style.cursor = 'pointer';
                
                let lockReason = isNeighborButLocked 
                    ? "Önce merkez üssünde 3. Sınıf Ehliyeti bitirmelisin!" 
                    : "Bu şehre henüz komşu değilsiniz. Komşu şehirleri tamamlayarak rotayı genişletin.";
                
                btn.setAttribute('aria-label', `${idx + 1}. Şehir: ${cityName}. Kilitli Şehir. ${lockReason}. Durum bilgisi için Enter tuşuna basın.`);
                btn.innerHTML = `
                    <span class="btn-icon">🔒</span>
                    <span class="btn-text" style="text-align: left; flex: 1; margin-left: 10px;">
                        <strong style="color: #ef4444;">${cityName} (Kilitli)</strong>
                        <small style="display:block; color:#f87171; font-size:0.85rem;">${lockReason}</small>
                    </span>
                    <span style="font-weight: bold; font-size: 0.85rem; color: #ef4444;">KİLİTLİ</span>
                `;
                btn.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playWarning) audio.playWarning();
                    const warnText = `${cityName} henüz kilitli. ${lockReason}`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnText);
                    if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(warnText);
                    UI.showToast(`🔒 ${cityName} Kilitli: ${lockReason}`, 'warning');
                };
            }

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        KeyboardNav.initForScreen();

        // Ekran açılışında sesli anons ve odaklama
        const curCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const mapAnnouncement = isFirstTime 
            ? "Şehir seçme haritası açıldı. Sağ ve sol ok tuşlarıyla 8 şehir arasında gezinebilir, açık bir şehri merkez üs yapmak için Enter tuşuna basabilirsiniz."
            : `Şehir haritası açıldı. Aktif şehriniz ${curCity}. Sağ ve sol oklarla şehirler arasında gezinebilir, açık ve kilitli şehirlerin durumunu inceleyebilirsiniz.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(mapAnnouncement);
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(mapAnnouncement);

        // İlk açık şehre veya mevcut şehre otomatik odaklan
        setTimeout(() => {
            const activeBtn = listEl.querySelector(`[data-city="${curCity}"]`) || listEl.querySelector('.primary-btn') || listEl.querySelector('button');
            if (activeBtn) activeBtn.focus();
        }, 150);
    },

    renderRoutes: function(cityName, completedTasks) {
        completedTasks = (typeof completedTasks === 'number') ? completedTasks : 0;
        cityName = cityName || (typeof Game !== 'undefined' && Game.currentCity) || localStorage.getItem('currentCity') || "Tekirdağ";
        const activeDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");

        const lblCity = document.getElementById('lbl-route-city');
        if (lblCity) lblCity.innerText = cityName;
        const lblDist = document.getElementById('lbl-route-active-district');
        if (lblDist) lblDist.innerText = activeDist === 'all' ? 'Tüm İlçeler' : activeDist;

        // Eğer Tekirdağ veya seçili il için görevler henüz üretilmemişse üret (Asla başka ilin duraklarını karıştırma!)
        if (typeof generateRoutesFromAPI === 'function') {
            if (cityName === "Tekirdağ") {
                const task0 = (typeof routesData !== 'undefined') ? routesData["tekirdag_task_0"] : null;
                const checkDist = (activeDist === 'all') ? 'Süleymanpaşa' : activeDist;
                if (!task0 || task0.district !== checkDist) {
                    const realStops = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari["Tekirdağ"])
                        ? varsayilanSehirDuraklari["Tekirdağ"]
                        : null;
                    generateRoutesFromAPI(realStops, "Tekirdağ", checkDist);
                }
            } else if (!routesData || !routesData[cityName.toLowerCase() + "_task_0"]) {
                let realCityStops = (typeof varsayilanSehirDuraklari !== 'undefined' && Array.isArray(varsayilanSehirDuraklari[cityName]) && varsayilanSehirDuraklari[cityName].length >= 2)
                    ? varsayilanSehirDuraklari[cityName]
                    : null;
                if (!realCityStops) {
                    const cCoords = (typeof sehirRotalari !== 'undefined' && sehirRotalari[cityName] && sehirRotalari[cityName].coordinates)
                        ? sehirRotalari[cityName].coordinates
                        : { lat: 39.9208, lon: 32.8541 };
                    realCityStops = [
                        { name: cityName + " Şehirlerarası Otobüs Terminali", lat: cCoords.lat, lon: cCoords.lon },
                        { name: cityName + " Cumhuriyet Meydanı", lat: cCoords.lat + 0.008, lon: cCoords.lon + 0.007 },
                        { name: cityName + " Valilik & Belediye Bulvarı", lat: cCoords.lat + 0.015, lon: cCoords.lon + 0.013 },
                        { name: cityName + " Şehir Hastanesi Kampüsü", lat: cCoords.lat + 0.022, lon: cCoords.lon + 0.019 },
                        { name: cityName + " Üniversite Yerleşkesi", lat: cCoords.lat + 0.029, lon: cCoords.lon + 0.025 },
                        { name: cityName + " Organize Sanayi Bölgesi", lat: cCoords.lat + 0.036, lon: cCoords.lon + 0.032 }
                    ];
                }
                generateRoutesFromAPI(realCityStops, cityName, activeDist);
            }
        }

        const titleEl = document.getElementById("route-sel-title");
        const subtitleEl = document.getElementById("route-sel-subtitle") || document.querySelector("#route-menu .subtitle");
        const listEl = document.getElementById("dynamic-route-list");
        if (!listEl) return;
        listEl.innerHTML = "";

        // 1. NVDA İL & İLÇE AÇILIR KUTULARINI (<select>) DOLDUR
        const citySelect = document.getElementById('nvda-city-select');
        const distSelect = document.getElementById('nvda-district-select');
        const adminData = (typeof window !== 'undefined' && window.TurkeyAdminData) ? window.TurkeyAdminData : null;

        if (citySelect) {
            const allCities = adminData
                ? Object.keys(adminData).sort((a, b) => a.localeCompare(b, 'tr'))
                : ((typeof masterCitiesList !== 'undefined' && Array.isArray(masterCitiesList))
                    ? masterCitiesList.slice().sort((a, b) => a.localeCompare(b, 'tr'))
                    : ["Tekirdağ", "İstanbul", "Ankara", "İzmir", "Bursa"]);
            citySelect.innerHTML = '';
            allCities.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                const plate = (adminData && adminData[c] && adminData[c].plate) ? (adminData[c].plate + ' - ') : '';
                opt.textContent = plate + c;
                citySelect.appendChild(opt);
            });
            citySelect.value = allCities.includes(cityName) ? cityName : allCities[0];

            if (!citySelect._nvdaBound) {
                citySelect._nvdaBound = true;
                citySelect.addEventListener('change', () => {
                    const nextCity = citySelect.value || 'Tekirdağ';
                    const cInfo = adminData && adminData[nextCity] ? adminData[nextCity] : null;
                    const distKeys = cInfo && cInfo.districts ? Object.keys(cInfo.districts).sort((a, b) => a.localeCompare(b, 'tr')) : [];
                    const defaultDist = (nextCity === 'Tekirdağ') ? 'Süleymanpaşa' : (distKeys[0] || 'Merkez');
                    if (typeof Game !== 'undefined') {
                        Game.currentCity = nextCity;
                        Game.activeDistrict = defaultDist;
                    }
                    localStorage.setItem('currentCity', nextCity);
                    localStorage.setItem('activeDistrict', defaultDist);
                    if (typeof createOrGetFreeRoamRoute === 'function' && nextCity !== 'Tekirdağ') {
                        createOrGetFreeRoamRoute(nextCity, defaultDist, defaultDist + ' Genel İlçe Turu');
                    }
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
                        audio.updateNvdaLiveRegion(nextCity + ' ili ve ' + defaultDist + ' ilçesi seçildi, rotalar güncellendi.');
                    }
                    document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: nextCity, district: defaultDist } }));
                });
            }
        }

        if (distSelect) {
            const cInfo = adminData && adminData[cityName] ? adminData[cityName] : null;
            let distKeys = cInfo && cInfo.districts ? Object.keys(cInfo.districts).sort((a, b) => a.localeCompare(b, 'tr')) : [];
            if (distKeys.length === 0) {
                distKeys = cityName === 'Tekirdağ'
                    ? ['Süleymanpaşa', 'Çorlu', 'Çerkezköy', 'Ergene', 'Velimeşe', 'Saray', 'Kapaklı', 'Malkara', 'Şarköy', 'Muratlı', 'Hayrabolu', 'Marmaraereğlisi']
                    : ['Merkez'];
            }
            distSelect.innerHTML = '';
            if (cityName === 'Tekirdağ') {
                const allOpt = document.createElement('option');
                allOpt.value = 'all';
                allOpt.textContent = 'Tüm İlçeler (Bütün Tekirdağ Hatları)';
                distSelect.appendChild(allOpt);
                if (!distKeys.includes('Velimeşe')) distKeys.push('Velimeşe');
            }
            distKeys.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                distSelect.appendChild(opt);
            });
            if (activeDist === 'all' && cityName === 'Tekirdağ') {
                distSelect.value = 'all';
            } else if (distKeys.includes(activeDist)) {
                distSelect.value = activeDist;
            } else {
                distSelect.value = distKeys[0];
            }

            if (!distSelect._nvdaBound) {
                distSelect._nvdaBound = true;
                distSelect.addEventListener('change', () => {
                    const chosenCity = (citySelect && citySelect.value) || (typeof Game !== 'undefined' && Game.currentCity) || 'Tekirdağ';
                    const nextDist = distSelect.value || 'Merkez';
                    if (typeof Game !== 'undefined') {
                        Game.currentCity = chosenCity;
                        Game.activeDistrict = nextDist;
                    }
                    localStorage.setItem('currentCity', chosenCity);
                    localStorage.setItem('activeDistrict', nextDist);
                    if (typeof createOrGetFreeRoamRoute === 'function' && nextDist !== 'all') {
                        createOrGetFreeRoamRoute(chosenCity, nextDist, nextDist + ' Genel İlçe Turu');
                    }
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    const labelDist = nextDist === 'all' ? 'Tüm İlçeler' : nextDist;
                    if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
                        audio.updateNvdaLiveRegion(chosenCity + ' ' + labelDist + ' bölgesi seçildi, hatlar listelendi.');
                    }
                    document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: chosenCity, district: nextDist } }));
                });
            }
        }

        const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive');
        let cityRoutes = [];
        const seenRouteKeys = new Set();
        const seenRouteObjects = new Set();

        const pushUniqueRoute = (r) => {
            if (!r || !r.id || !Array.isArray(r.stops) || r.stops.length < 2) return;
            const s0 = String(r.startStop || (r.stops[0] && r.stops[0].name) || '').trim();
            const sEnd = String(r.endStop || (r.stops[r.stops.length - 1] && r.stops[r.stops.length - 1].name) || '').trim();
            if (/^(İLK DURAK|SON DURAK)$/i.test(s0) || /^(İLK DURAK|SON DURAK)$/i.test(sEnd)) return;
            if (seenRouteKeys.has(r.id) || seenRouteObjects.has(r)) return;
            seenRouteKeys.add(r.id);
            seenRouteObjects.add(r);
            cityRoutes.push(r);
            if (typeof routesData !== 'undefined' && !routesData[r.id]) {
                routesData[r.id] = r;
            }
        };

        // TEKİRDAĞ GTFS & AÇIK VERİ ENTEGRASYONU (SERBEST SÜRÜŞTE SADECE SEÇİLEN İLÇENİN GERÇEK HATLARI)
        if (isFreeDrive && cityName === "Tekirdağ" && typeof window !== 'undefined' && window.tekulasHatVeritabani) {
            const tekulasDb = window.tekulasHatVeritabani;
            if (activeDist === 'all') {
                tekulasDb.forEach(r => pushUniqueRoute(r));
            } else {
                const matched = tekulasDb.filter(r => {
                    if (!r) return false;
                    if (r.district === activeDist || r.originDistrict === activeDist || r.destDistrict === activeDist) return true;
                    if (activeDist === 'Velimeşe' && (r.id === 'hat_velimese_cetin_ring' || String(r.name || '').toUpperCase().includes('VELİMEŞE'))) return true;
                    if (activeDist === 'Ergene' && (r.originDistrict === 'Velimeşe' || r.destDistrict === 'Velimeşe')) return true;
                    return false;
                });

                // Eğer ilçenin yerel cadde hattı azsa (örn. Velimeşe, Marmaraereğlisi, Ergene, Saray), o ilçenin temiz serbest ilçe turunu en üste ekle
                const hasLocalCityLine = matched.some(r => !r.isDistrict);
                if (!hasLocalCityLine && typeof createOrGetFreeRoamRoute === 'function') {
                    const localTour = createOrGetFreeRoamRoute("Tekirdağ", activeDist, activeDist + " Genel İlçe Turu");
                    pushUniqueRoute(localTour);
                }
                matched.forEach(r => pushUniqueRoute(r));
            }

            const totalStopsCount = cityRoutes.reduce((sum, r) => sum + (r.stops ? r.stops.length : 0), 0);
            const distTitle = activeDist === 'all' ? 'Tüm İlçeler' : activeDist;
            if (titleEl) titleEl.innerText = distTitle + " Belediye Hatları (" + cityRoutes.length + " Hat)";
            if (subtitleEl) subtitleEl.innerText = distTitle + " bölgesine ait " + cityRoutes.length + " hat ve " + totalStopsCount + " durak açılır-kapanır kategorilerde hazır.";
        } else if (isFreeDrive) {
            // DİĞER 80 İL SERBEST SÜRÜŞ MODU (Kariyer görevleri asla serbest hatlara karışmaz!)
            const distTitle = activeDist === 'all' ? 'Merkez' : activeDist;
            if (titleEl) titleEl.innerText = cityName + " - " + distTitle + " Serbest Hatları";
            if (subtitleEl) subtitleEl.innerText = cityName + " ili " + distTitle + " ilçesi şehir içi ve bölge serbest hatları";

            if (typeof createOrGetFreeRoamRoute === 'function') {
                pushUniqueRoute(createOrGetFreeRoamRoute(cityName, distTitle, distTitle + " Genel İlçe Turu"));
                pushUniqueRoute(createOrGetFreeRoamRoute(cityName, distTitle, distTitle + " Hastane & Üniversite Mahallesi"));
                pushUniqueRoute(createOrGetFreeRoamRoute(cityName, distTitle, distTitle + " Sanayi & Otogar Bulvarı"));
            }

            if (typeof ilceRotalari !== 'undefined' && Array.isArray(ilceRotalari[cityName])) {
                ilceRotalari[cityName].forEach(r => pushUniqueRoute(r));
            }

            Object.values(routesData).forEach(r => {
                if (!r || !r.id) return;
                if (typeof r.taskIndex === 'number') return; // Kariyer görevlerini serbest moda karıştırma!
                if ((r.sehir === cityName || r.city === cityName) && (!r.district || activeDist === 'all' || r.district === distTitle || r.isHierarchical)) {
                    pushUniqueRoute(r);
                }
            });
        } else {
            // KARİYER MODU (Yalnızca sıralı kariyer görevleri listelenir; serbest hatlar araya girmez!)
            const distTitle = activeDist === 'all' ? 'Süleymanpaşa' : activeDist;
            if (titleEl) titleEl.innerText = cityName + " - " + distTitle + " Kariyer Sefer Görevleri";
            if (subtitleEl) subtitleEl.innerText = cityName + " (" + distTitle + ") kademeli kaptanlık görev menüsü";

            const seenTaskIdx = new Set();
            Object.values(routesData).forEach(r => {
                if (!r || !r.id) return;
                if (r.sehir === cityName && typeof r.taskIndex === 'number') {
                    if (seenTaskIdx.has(r.taskIndex)) return;
                    seenTaskIdx.add(r.taskIndex);
                    pushUniqueRoute(r);
                }
            });
        }

        if (cityRoutes.length === 0) {
            listEl.innerHTML = '<li style="text-align:center; color: white; padding: 20px;">Bu bölge için kayıtlı rota bulunamadı.</li>';
            return;
        }

        const currentLic = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const effectiveCareerLic = Math.max(currentLic, Math.floor((completedTasks || 0) / 10) + 1);

        let routesToRender = cityRoutes.slice();
        if (!isFreeDrive) {
            routesToRender.sort((a, b) => (a.taskIndex || 0) - (b.taskIndex || 0));
            const visibleRoutes = routesToRender.filter(r => (typeof r.licenseLevel === 'number') ? (r.licenseLevel <= effectiveCareerLic) : true);
            routesToRender = visibleRoutes.length > 0 ? visibleRoutes : routesToRender;
            routesToRender = routesToRender.filter(r => {
                const tIdx = (typeof r.taskIndex === 'number') ? r.taskIndex : 0;
                return tIdx <= completedTasks + 1;
            });
        }

        // Yardımcı: Rotayı güvenle başlat
        const launchRouteByObj = (route, isLocked, taskNum) => {
            if (!route) return;
            if (isLocked) {
                if (typeof audio !== 'undefined' && audio.playWarning) {
                    try { audio.playWarning(); } catch (e) {}
                } else if (typeof audio !== 'undefined' && audio.playSelect) {
                    audio.playSelect();
                }
                const msg = "Kaptanım, Görev " + taskNum + " henüz kilitli. Açmak için önce Görev " + (completedTasks + 1) + " seferini tamamlayın.";
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "warning");
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(msg);
                return;
            }
            if (typeof routesData !== 'undefined' && route.id && !routesData[route.id]) {
                routesData[route.id] = route;
            }
            if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
            if (typeof Game !== 'undefined' && Game.startRoute) {
                Game.startRoute(route.id);
            }
        };

        // 2. HIZLI HAT / GÖREV AÇILIR SEÇİM KUTUSUNU (<select>) DOLDUR
        const quickSelect = document.getElementById('nvda-quick-route-select');
        const btnQuickLaunch = document.getElementById('btn-nvda-launch-selected-route');
        const routeLookupMap = new Map();

        if (quickSelect) {
            quickSelect.innerHTML = '';
            let defaultQuickId = '';
            routesToRender.forEach(route => {
                const isLocked = !isFreeDrive && (typeof route.taskIndex === 'number' && route.taskIndex > completedTasks);
                const isCurrentTask = !isFreeDrive && (route.taskIndex === completedTasks);
                const stopCount = (route.stops) ? route.stops.length : 0;
                const totalKmRoute = (route.totalKm) ? Number(route.totalKm).toFixed(1) : ((route.stops && route.stops.length > 0) ? route.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0).toFixed(1) : '0.0');
                routeLookupMap.set(route.id, { route, isLocked, taskNum: (typeof route.taskIndex === 'number') ? (route.taskIndex + 1) : 1 });

                if (isLocked) return;
                const opt = document.createElement('option');
                opt.value = route.id;
                const prefix = !isFreeDrive
                    ? (isCurrentTask ? '[AKTİF GÖREV] ' : '[TAMAMLANDI] ')
                    : (route.hatNo ? ('[Hat ' + route.hatNo + '] ') : '');
                opt.textContent = prefix + route.name + ' (' + stopCount + ' Durak, ' + totalKmRoute + ' km)';
                quickSelect.appendChild(opt);
                if (isCurrentTask || !defaultQuickId) defaultQuickId = route.id;
            });
            if (defaultQuickId) quickSelect.value = defaultQuickId;

            const triggerSelectedQuickRoute = () => {
                const selId = quickSelect.value;
                const entry = routeLookupMap.get(selId);
                if (entry) {
                    launchRouteByObj(entry.route, entry.isLocked, entry.taskNum);
                }
            };
            quickSelect._launchSelected = triggerSelectedQuickRoute;
            if (!quickSelect._nvdaKeyBound) {
                quickSelect._nvdaKeyBound = true;
                quickSelect.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter') {
                        ev.preventDefault();
                        if (typeof quickSelect._launchSelected === 'function') quickSelect._launchSelected();
                    }
                });
            }
            if (btnQuickLaunch) {
                btnQuickLaunch.onclick = () => {
                    if (typeof quickSelect._launchSelected === 'function') quickSelect._launchSelected();
                };
            }
        }

        // 3. ROTALARI AÇILIR-KAPANIR (ACCORDION) KATEGORİLERE AYIR
        const buildGroups = (filterText = '') => {
            const q = (filterText || '').trim().toLowerCase();
            const filtered = !q ? routesToRender : routesToRender.filter(r => {
                const hay = [
                    r.name || '',
                    r.hatNo || '',
                    r.startStop || '',
                    r.endStop || '',
                    r.district || '',
                    (Array.isArray(r.stops) ? r.stops.map(s => s.name || '').join(' ') : '')
                ].join(' ').toLowerCase();
                return hay.includes(q);
            });

            const statusEl = document.getElementById('nvda-route-filter-status');
            if (statusEl) {
                statusEl.textContent = q
                    ? ('"' + filterText + '" araması için ' + filtered.length + ' rota bulundu.')
                    : ('Toplam ' + filtered.length + ' rota açılır-kapanır kategorilerde hazır.');
            }

            listEl.innerHTML = '';
            if (filtered.length === 0) {
                listEl.innerHTML = '<li style="text-align:center; color:#cbd5e1; padding:18px;">Aramanıza uygun hat veya durak bulunamadı.</li>';
                KeyboardNav.initForScreen();
                return null;
            }

            let groups = [];
            if (!isFreeDrive) {
                const curList = filtered.filter(r => r.taskIndex === completedTasks);
                const doneList = filtered.filter(r => typeof r.taskIndex === 'number' && r.taskIndex < completedTasks);
                const lockList = filtered.filter(r => typeof r.taskIndex === 'number' && r.taskIndex > completedTasks);
                const otherList = filtered.filter(r => typeof r.taskIndex !== 'number');

                if (curList.length > 0) groups.push({ id: 'grp-active-task', title: '🟢 Aktif Sefer Göreviniz', open: true, border: '#22c55e', items: curList });
                if (otherList.length > 0) groups.push({ id: 'grp-other-task', title: '🚍 Mevcut Hatlar', open: curList.length === 0, border: '#38bdf8', items: otherList });
                if (doneList.length > 0) groups.push({ id: 'grp-done-tasks', title: '✅ Tamamlanan Görevler', open: !!q, border: '#10b981', items: doneList });
                if (lockList.length > 0) groups.push({ id: 'grp-locked-tasks', title: '🔒 Sıradaki Kilitli Görev', open: !!q, border: '#ef4444', items: lockList });
            } else {
                const mainHubs = [];
                const industrial = [];
                const interDistrict = [];
                const localStreets = [];

                filtered.forEach(r => {
                    const nm = ((r.name || '') + ' ' + (r.startStop || '') + ' ' + (r.endStop || '')).toLowerCase();
                    const totalKmVal = r.totalKm || 0;
                    if (r.isDistrict || totalKmVal >= 25 || nm.includes('otogar') && (nm.includes('saray') || nm.includes('çorlu') || nm.includes('malkara') || nm.includes('şarköy') || nm.includes('çerkezköy') || nm.includes('hayrabolu') || nm.includes('ereğli'))) {
                        interDistrict.push(r);
                    } else if (nm.includes('sanayi') || nm.includes('osb') || nm.includes('toki') || nm.includes('fabrika') || nm.includes('organize')) {
                        industrial.push(r);
                    } else if (nm.includes('hastane') || nm.includes('üniversite') || nm.includes('kampüs') || nm.includes('değirmenaltı') || nm.includes('2/7') || nm.includes('genel ilçe turu')) {
                        mainHubs.push(r);
                    } else {
                        localStreets.push(r);
                    }
                });

                if (mainHubs.length > 0) groups.push({ id: 'grp-main-hubs', title: '⭐ Ana Hatlar, Üniversite & Hastane Güzergahları', open: true, border: '#22c55e', items: mainHubs });
                if (localStreets.length > 0) groups.push({ id: 'grp-local-streets', title: '🏙️ Şehir İçi Mahalle, Çarşı & Ring Hatları', open: mainHubs.length === 0 || !!q, border: '#38bdf8', items: localStreets });
                if (industrial.length > 0) groups.push({ id: 'grp-industrial', title: '🏭 Sanayi, OSB & TOKİ Hatları', open: (mainHubs.length === 0 && localStreets.length === 0) || !!q, border: '#f59e0b', items: industrial });
                if (interDistrict.length > 0) groups.push({ id: 'grp-interdistrict', title: '🛣️ İlçeler Arası & Uzun Koridor Hatları', open: (mainHubs.length === 0 && localStreets.length === 0 && industrial.length === 0) || !!q, border: '#a855f7', items: interDistrict });
            }

            let activeTaskBtn = null;

            groups.forEach((grp) => {
                const groupLi = document.createElement('li');
                groupLi.style.marginBottom = '12px';
                groupLi.style.listStyle = 'none';

                const heading = document.createElement('h2');
                heading.style.margin = '0';
                heading.style.fontSize = '1.05rem';

                const headerBtn = document.createElement('button');
                headerBtn.type = 'button';
                headerBtn.className = 'menu-btn nav-item route-accordion-header';
                headerBtn.setAttribute('aria-expanded', grp.open ? 'true' : 'false');
                headerBtn.setAttribute('aria-controls', grp.id);
                headerBtn.style.width = '100%';
                headerBtn.style.display = 'flex';
                headerBtn.style.justifyContent = 'space-between';
                headerBtn.style.alignItems = 'center';
                headerBtn.style.padding = '13px 18px';
                headerBtn.style.background = 'rgba(15, 23, 42, 0.92)';
                headerBtn.style.border = '1.8px solid ' + grp.border;
                headerBtn.style.borderRadius = '10px';
                headerBtn.style.cursor = 'pointer';

                const updateHeaderVisual = (isOpen) => {
                    headerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    headerBtn.setAttribute('aria-label', grp.title + ' (' + grp.items.length + ' rota). ' + (isOpen ? 'Açık menü, daraltmak için Enter tuşuna basın.' : 'Kapalı menü, rotaları görmek için Enter tuşuna basın.'));
                    headerBtn.innerHTML =
                        '<span style="font-weight:bold; color:#f8fafc; font-size:1.05rem;">' + grp.title + ' <span style="color:#94a3b8; font-size:0.9rem;">(' + grp.items.length + ' Rota)</span></span>' +
                        '<span class="acc-arrow" style="color:' + grp.border + '; font-weight:bold; font-size:0.95rem;">' + (isOpen ? '▼ Kapat' : '▶ Aç') + '</span>';
                };
                updateHeaderVisual(grp.open);

                const panelDiv = document.createElement('div');
                panelDiv.id = grp.id;
                panelDiv.setAttribute('role', 'region');
                panelDiv.setAttribute('aria-label', grp.title);
                panelDiv.style.marginTop = '8px';
                panelDiv.style.paddingLeft = '6px';
                if (!grp.open) panelDiv.classList.add('hidden');

                headerBtn.onclick = () => {
                    const willOpen = panelDiv.classList.contains('hidden');
                    panelDiv.classList.toggle('hidden', !willOpen);
                    updateHeaderVisual(willOpen);
                    if (typeof audio !== 'undefined' && audio.playNav) audio.playNav();
                    if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
                        audio.updateNvdaLiveRegion(grp.title + (willOpen ? (' açıldı, ' + grp.items.length + ' rota listelendi.') : ' kapatıldı.'));
                    }
                    KeyboardNav.initForScreen();
                    headerBtn.focus();
                };

                grp.items.forEach((route, rIdx) => {
                    const taskNum = (typeof route.taskIndex === 'number') ? (route.taskIndex + 1) : (rIdx + 1);
                    const isCurrentTask = !isFreeDrive && (route.taskIndex === completedTasks);
                    const isCompleted = !isFreeDrive && (typeof route.taskIndex === 'number' && route.taskIndex < completedTasks);
                    const isLocked = !isFreeDrive && (typeof route.taskIndex === 'number' && route.taskIndex > completedTasks);

                    const startStop = route.startStop || (route.stops && route.stops[0] ? route.stops[0].name : "Kalkış Garajı");
                    const endStop = route.endStop || (route.stops && route.stops.length > 0 ? route.stops[route.stops.length - 1].name : "Varış");
                    const stopCount = (route.stops) ? route.stops.length : 0;
                    const totalKmRoute = (route.totalKm) ? Number(route.totalKm).toFixed(1) : ((route.stops && route.stops.length > 0) ? route.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0).toFixed(1) : '0.0');

                    const itemWrap = document.createElement('div');
                    itemWrap.style.marginBottom = '8px';
                    itemWrap.style.background = 'rgba(30, 41, 59, 0.72)';
                    itemWrap.style.border = isCurrentTask ? '2px solid #22c55e' : (isLocked ? '1.5px dashed rgba(239,68,68,0.55)' : '1px solid rgba(148,163,184,0.28)');
                    itemWrap.style.borderRadius = '10px';
                    itemWrap.style.padding = '8px 10px';

                    const rowTop = document.createElement('div');
                    rowTop.style.display = 'flex';
                    rowTop.style.flexWrap = 'wrap';
                    rowTop.style.gap = '8px';
                    rowTop.style.alignItems = 'center';

                    const launchBtn = document.createElement('button');
                    launchBtn.type = 'button';
                    launchBtn.className = 'menu-btn nav-item' + (isCurrentTask ? ' primary-btn' : '');
                    launchBtn.style.flex = '1';
                    launchBtn.style.minWidth = '230px';
                    launchBtn.style.textAlign = 'left';
                    launchBtn.style.padding = '10px 14px';
                    launchBtn.style.margin = '0';
                    launchBtn.style.display = 'flex';
                    launchBtn.style.justifyContent = 'space-between';
                    launchBtn.style.alignItems = 'center';
                    if (isLocked) {
                        launchBtn.style.opacity = '0.75';
                        launchBtn.setAttribute('aria-disabled', 'true');
                    }
                    if (isCurrentTask && !activeTaskBtn) activeTaskBtn = launchBtn;

                    const icon = isFreeDrive ? '🚍' : (isCurrentTask ? '🟢' : (isCompleted ? '✅' : '🔒'));
                    const cleanLabel = isLocked
                        ? ('Görev ' + taskNum + ': ' + route.name + '. Kilitli. Önce Görev ' + (completedTasks + 1) + ' tamamlanmalı.')
                        : ((isFreeDrive ? '' : ('Görev ' + taskNum + ': ')) + route.name + '. Kalkış: ' + startStop + ', Varış: ' + endStop + ', ' + stopCount + ' durak, ' + totalKmRoute + ' kilometre. Seferi başlatmak için Enter tuşuna basın.');
                    launchBtn.setAttribute('aria-label', cleanLabel);

                    launchBtn.innerHTML =
                        '<span style="display:block;">' +
                            '<strong style="color:' + (isLocked ? '#f87171' : (isCurrentTask ? '#4ade80' : '#f8fafc')) + '; font-size:1.02rem;">' + icon + ' ' + route.name + '</strong>' +
                            '<small style="display:block; color:#cbd5e1; font-size:0.86rem; margin-top:3px;">📍 ' + startStop + ' ➔ 🏁 ' + endStop + '</small>' +
                        '</span>' +
                        '<span style="background:rgba(56,189,248,0.18); color:#7dd3fc; padding:4px 9px; border-radius:6px; font-size:0.82rem; font-weight:bold; white-space:nowrap;">' + stopCount + ' Durak • ' + totalKmRoute + ' km</span>';

                    launchBtn.onclick = () => launchRouteByObj(route, isLocked, taskNum);

                    // Açılır-Kapanır Durak & Detay Düğmesi
                    const detailPanelId = 'route-detail-' + grp.id + '-' + rIdx;
                    const detailBtn = document.createElement('button');
                    detailBtn.type = 'button';
                    detailBtn.className = 'modern-btn nav-item';
                    detailBtn.setAttribute('aria-expanded', 'false');
                    detailBtn.setAttribute('aria-controls', detailPanelId);
                    detailBtn.setAttribute('aria-label', route.name + ' durak listesini ve detaylarını göster (' + stopCount + ' durak)');
                    detailBtn.style.padding = '9px 12px';
                    detailBtn.style.fontSize = '0.84rem';
                    detailBtn.style.background = 'rgba(56,189,248,0.12)';
                    detailBtn.style.border = '1px solid rgba(56,189,248,0.4)';
                    detailBtn.style.color = '#7dd3fc';
                    detailBtn.style.borderRadius = '8px';
                    detailBtn.style.cursor = 'pointer';
                    detailBtn.textContent = '📋 Duraklar (' + stopCount + ')';

                    const detailDiv = document.createElement('div');
                    detailDiv.id = detailPanelId;
                    detailDiv.className = 'hidden';
                    detailDiv.style.marginTop = '8px';
                    detailDiv.style.padding = '10px 14px';
                    detailDiv.style.background = 'rgba(15, 23, 42, 0.85)';
                    detailDiv.style.borderRadius = '8px';
                    detailDiv.style.borderLeft = '3px solid #38bdf8';
                    detailDiv.style.fontSize = '0.88rem';
                    detailDiv.style.color = '#e2e8f0';

                    detailBtn.onclick = () => {
                        const openNow = detailDiv.classList.contains('hidden');
                        if (openNow && !detailDiv._populated) {
                            detailDiv._populated = true;
                            const stopsArr = Array.isArray(route.stops) ? route.stops : [];
                            const stopsItemsHtml = stopsArr.map((s, idx) => '<li>' + (idx + 1) + '. ' + (s.name || 'Durak') + '</li>').join('');
                            const cardSteps = (typeof MissionReader !== "undefined" && MissionReader.generateSteps) ? MissionReader.generateSteps(route) : [];
                            const stepsHtml = cardSteps.length > 0
                                ? ('<div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1);"><strong>Görev Özeti:</strong><br>' + cardSteps.map(st => '• ' + st).join('<br>') + '</div>')
                                : '';
                            detailDiv.innerHTML =
                                '<strong>🛑 Durak Sırası (' + stopsArr.length + ' Durak):</strong>' +
                                '<ol style="margin:6px 0 0 18px; line-height:1.55;">' + stopsItemsHtml + '</ol>' +
                                stepsHtml;
                        }
                        detailDiv.classList.toggle('hidden', !openNow);
                        detailBtn.setAttribute('aria-expanded', openNow ? 'true' : 'false');
                        detailBtn.textContent = openNow ? '🔼 Durakları Gizle' : ('📋 Duraklar (' + stopCount + ')');
                        detailBtn.setAttribute('aria-label', route.name + (openNow ? ' durak listesini gizle' : (' durak listesini göster (' + stopCount + ' durak)')));
                        if (typeof audio !== 'undefined' && audio.playNav) audio.playNav();
                    };

                    rowTop.appendChild(launchBtn);
                    rowTop.appendChild(detailBtn);
                    itemWrap.appendChild(rowTop);
                    itemWrap.appendChild(detailDiv);
                    panelDiv.appendChild(itemWrap);
                });

                heading.appendChild(headerBtn);
                groupLi.appendChild(heading);
                groupLi.appendChild(panelDiv);
                listEl.appendChild(groupLi);
            });

            KeyboardNav.initForScreen();
            return activeTaskBtn;
        };

        const filterInput = document.getElementById('nvda-route-filter-input');
        if (filterInput) {
            filterInput.value = '';
            filterInput.oninput = () => {
                buildGroups(filterInput.value);
            };
        }

        const btnToggleAll = document.getElementById('btn-nvda-toggle-all-groups');
        if (btnToggleAll) {
            btnToggleAll.setAttribute('aria-expanded', 'false');
            btnToggleAll.textContent = '📂 Tüm Kategorileri Aç';
            btnToggleAll.onclick = () => {
                const expandAll = btnToggleAll.getAttribute('aria-expanded') !== 'true';
                btnToggleAll.setAttribute('aria-expanded', expandAll ? 'true' : 'false');
                btnToggleAll.textContent = expandAll ? '📁 Tüm Kategorileri Kapat' : '📂 Tüm Kategorileri Aç';
                const headers = listEl.querySelectorAll('.route-accordion-header');
                headers.forEach(hb => {
                    const isExp = hb.getAttribute('aria-expanded') === 'true';
                    if (isExp !== expandAll) hb.click();
                });
                KeyboardNav.initForScreen();
                btnToggleAll.focus();
            };
        }

        const activeTaskBtn = buildGroups('');
        if (activeTaskBtn) {
            try { activeTaskBtn.focus(); } catch (e) {}
        } else if (quickSelect) {
            try { quickSelect.focus(); } catch (e) {}
        }

        const routeWelcome = isFreeDrive
            ? (activeDist + ' serbest sürüş rotaları açılır-kapanır kategorilerde hazır.')
            : 'Rota menüsü açıldı. Aktif sefer göreviniz hazır.';
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(routeWelcome);
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
    
    getActiveContainer: function() {
        // Açık olan tüm modalları topla (.modal, .modal-overlay, [role="dialog"], [aria-modal="true"])
        const allModals = Array.from(document.querySelectorAll('.modal:not(.hidden), .modal-overlay:not(.hidden), [role="dialog"]:not(.hidden), [aria-modal="true"]:not(.hidden)'));
        const visibleModals = allModals.filter(el => {
            if (el.classList.contains('hidden')) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });

        if (visibleModals.length > 0) {
            // En son açılan (en üstteki) modalı aktif kapsayıcı yap
            return visibleModals[visibleModals.length - 1];
        }

        // Açık modal yoksa açık ekranı (.screen, main) aktif kapsayıcı yap
        const allScreens = Array.from(document.querySelectorAll('.screen:not(.hidden), main:not(.hidden)'));
        const visibleScreens = allScreens.filter(el => {
            if (el.classList.contains('hidden')) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

        if (visibleScreens.length > 0) {
            return visibleScreens[0];
        }

        return document.body;
    },

    initForScreen: function() {
        this.items = [];
        this.currentIndex = 0;
        
        const activeContainer = this.getActiveContainer();
        if (!activeContainer) return;
        
        // Ögeler: .nav-item butonlar, kartlar, sekmeler ve görünür form elemanları
        const elements = activeContainer.querySelectorAll('.nav-item, input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])');
        const seen = new Set();
        elements.forEach(el => {
            if (seen.has(el)) return;
            seen.add(el);
            if (el.disabled || el.classList.contains('hidden') || el.closest('.hidden')) return;
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                this.items.push(el);
            }
        });
        
        // Eğer şu an aktif odaklı eleman bu listenin içindeyse currentIndex'i onunla eşitle
        if (document.activeElement && this.items.includes(document.activeElement)) {
            this.currentIndex = this.items.indexOf(document.activeElement);
        } else {
            this.currentIndex = 0;
        }

        this.updateFocus();
    },
    
    updateFocus: function() {
        document.querySelectorAll('.nav-focused').forEach(el => el.classList.remove('nav-focused'));
        
        if (this.items.length > 0) {
            if (this.currentIndex < 0) this.currentIndex = this.items.length - 1;
            if (this.currentIndex >= this.items.length) this.currentIndex = 0;
            
            const focusedEl = this.items[this.currentIndex];
            if (focusedEl) {
                focusedEl.classList.add('nav-focused');
                focusedEl.focus(); 
                
                try {
                    focusedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                } catch(e) {}
            }
        }
    },
    
    syncActiveContainerIfNeeded: function() {
        const currentContainer = this.getActiveContainer();
        if (this.items.length === 0 || !currentContainer || !this.items[0] || !currentContainer.contains(this.items[0])) {
            this.initForScreen();
            return true;
        }
        return false;
    },

    moveNext: function() {
        this.syncActiveContainerIfNeeded();
        if (this.items.length === 0) return;

        // Kullanıcı Tab veya fareyle odağı değiştirdiyse currentIndex'i yakala
        if (document.activeElement && this.items.includes(document.activeElement)) {
            this.currentIndex = this.items.indexOf(document.activeElement);
        }

        if (typeof audio !== 'undefined' && audio.playNav) audio.playNav();
        this.currentIndex++;
        this.updateFocus();
    },
    
    movePrev: function() {
        this.syncActiveContainerIfNeeded();
        if (this.items.length === 0) return;

        if (document.activeElement && this.items.includes(document.activeElement)) {
            this.currentIndex = this.items.indexOf(document.activeElement);
        }

        if (typeof audio !== 'undefined' && audio.playNav) audio.playNav();
        this.currentIndex--;
        this.updateFocus();
    },
    
    selectCurrent: function() {
        this.syncActiveContainerIfNeeded();
        if (this.items.length === 0) return;
        
        if (document.activeElement && this.items.includes(document.activeElement)) {
            this.currentIndex = this.items.indexOf(document.activeElement);
        }

        const focusedEl = this.items[this.currentIndex];
        if (focusedEl) {
            focusedEl.click();
        }
    }
};

// Form alanı ve metin alanı tespit yardımcıları
function isFormFieldElement(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return false;
}

function isTextInputElement(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA') return true;
    if (el.isContentEditable) return true;
    if (tag === 'INPUT') {
        const type = (el.type || 'text').toLowerCase();
        return !['button', 'submit', 'reset', 'checkbox', 'radio', 'color', 'file'].includes(type);
    }
    return false;
}

function getVisibleFormControls(container) {
    const root = container || (typeof KeyboardNav !== 'undefined' && KeyboardNav.getActiveContainer ? KeyboardNav.getActiveContainer() : document.body);
    if (!root) return [];
    
    const selector = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"], button:not([disabled]), .nav-item:not([disabled])';
    const candidates = Array.from(root.querySelectorAll(selector));
    const seen = new Set();
    const result = [];
    
    candidates.forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.classList.contains('hidden') || el.disabled || el.closest('.hidden')) return;
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            result.push(el);
        }
    });
    
    return result;
}

function containerHasFormFields(container) {
    const root = container || (typeof KeyboardNav !== 'undefined' && KeyboardNav.getActiveContainer ? KeyboardNav.getActiveContainer() : document.body);
    if (!root) return false;
    const fields = root.querySelectorAll('input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"]');
    for (let el of fields) {
        if (el.classList.contains('hidden') || el.disabled) continue;
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            return true;
        }
    }
    return false;
}

window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isDriving = (typeof Game !== 'undefined' && Game.isDriving);

    // 1. ESCAPE: Açıklamayı susturur ve açık olan herhangi bir modalı kapatır
    if (e.key === 'Escape') {
        const modalIds = [
            'captain-profile-inspector-modal',
            'leaderboard-modal',
            'create-company-modal',
            'company-system-modal', 'welcome-calendar-modal',
            'company-modal',
            'district-picker-modal',
            'mode-selection-modal',
            'intercity-dest-modal',
            'district-dest-modal',
            'smart-route-modal',
            'bus-garage-modal',
            'garage-fleet-modal',
            'sound-gallery-modal',
            'driver-badges-modal',
            'badges-modal',
            'stop-collection-modal',
            'tutorial-assistant-modal',
            'tutorial-modal',
            'multiplayer-radar-modal',
            'facility-modal',
            'hgs-modal',
            'roleplay-modal',
            'bus-concept-modal',
            'exit-screen'
        ];
        for (const mId of modalIds) {
            const m = document.getElementById(mId);
            if (m && !m.classList.contains('hidden')) {
                m.classList.add('hidden');
                KeyboardNav.initForScreen();
                if (mId === 'district-picker-modal') {
                    if (typeof freePickerState !== 'undefined') {
                        if (freePickerState.step === 'neighborhood') {
                            freePickerState.step = 'district';
                            m.classList.remove('hidden');
                            if (typeof renderFreePickerCurrentStep === 'function') renderFreePickerCurrentStep();
                            return;
                        } else if (freePickerState.step === 'district') {
                            freePickerState.step = 'city';
                            m.classList.remove('hidden');
                            if (typeof renderFreePickerCurrentStep === 'function') renderFreePickerCurrentStep();
                            return;
                        }
                    }
                    const btnChange = document.getElementById('btn-change-active-district');
                    if (btnChange) btnChange.focus();
                }
                return;
            }
        }
        if (typeof MissionReader !== 'undefined') MissionReader.exit();
        return;
    }

    // 2. SHIFT + OK TUŞLARI: PUSULA VE 4 YÖN SİSTEMİ (Kuzey, Güney, Doğu, Batı)
    if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        if (typeof CompassSystem !== 'undefined' && typeof CompassSystem.handleDirection === 'function') {
            CompassSystem.handleDirection(e.key);
        } else if (typeof CompassNav !== 'undefined') {
            CompassNav.handleDirection(e.key);
        }
        return;
    }

    // 3. SHIFT + A: Adım adım görevin adımlarını okur (Hem menüde hem sürüşte çalışır)
    if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (typeof MissionReader !== 'undefined') MissionReader.readNextStep();
        return;
    }

    // 4. A TUŞU: Görev haritasındaki açıklamaları okur (SADECE sürüşte değilken ve metin kutusunda değilken)
    if (!e.shiftKey && !e.ctrlKey && !e.altKey && (e.key === 'a' || e.key === 'A') && !isDriving && !isFormFieldElement(activeEl)) {
        e.preventDefault();
        if (typeof MissionReader !== 'undefined') MissionReader.readDescription();
        return;
    }

    // SES DÜZEYİ KONTROLLERİ (PageUp/PageDown: Müzik Sesi | Home/End: Oyun Ses Düzeyi)
    // "ana menüde müziğin sesini açmak için sayfa yukarı sayfa aşşağı tuşları kullanılsın
    // oyun ses düzzeyi ni kısıp açmak isiçinde home ve ent tuşları kullanılsın."
    if (!isFormFieldElement(activeEl) || !isTextInputElement(activeEl)) {
        const inBus = isDriving
            || (document.getElementById('driving-screen') && !document.getElementById('driving-screen').classList.contains('hidden'))
            || (document.getElementById('stop-screen') && !document.getElementById('stop-screen').classList.contains('hidden'));
        if (e.key === 'PageUp') {
            if (!inBus) {
                e.preventDefault();
                if (typeof audio !== 'undefined' && audio.adjustMusicVolume) {
                    audio.adjustMusicVolume(0.1);
                }
            }
            return;
        }
        if (e.key === 'PageDown') {
            if (!inBus) {
                e.preventDefault();
                if (typeof audio !== 'undefined' && audio.adjustMusicVolume) {
                    audio.adjustMusicVolume(-0.1);
                }
            }
            return;
        }
        if (e.key === 'Home') {
            if (!inBus) {
                e.preventDefault();
                if (typeof audio !== 'undefined' && audio.adjustGameSoundVolume) {
                    audio.adjustGameSoundVolume(0.1);
                }
            }
            return;
        }
        if (e.key === 'End') {
            if (!inBus) {
                e.preventDefault();
                if (typeof audio !== 'undefined' && audio.adjustGameSoundVolume) {
                    audio.adjustGameSoundVolume(-0.1);
                }
            }
            return;
        }
        // İkincil kısayollar (+ ve -)
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            if (typeof audio !== 'undefined' && audio.adjustMusicVolume) {
                audio.adjustMusicVolume(0.1);
            }
            return;
        }
        if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            if (typeof audio !== 'undefined' && audio.adjustMusicVolume) {
                audio.adjustMusicVolume(-0.1);
            }
            return;
        }
    }

    // 5. TAB TUŞU DAVRANIŞI:
    // "fform alanlarında veya yazı alanlarında tap tuşları etkili olsun."
    if (e.key === 'Tab') {
        if (isDriving) {
            e.preventDefault();
            return;
        }

        const activeContainer = KeyboardNav.getActiveContainer();
        const hasForm = containerHasFormFields(activeContainer);

        // Eğer mevcut ekranda/modalda HİÇBİR form alanı yoksa Tab'ı engelle
        // Böylece ögeler arası gezinme SADECE sağ/sol oklarla yapılır!
        if (!hasForm) {
            e.preventDefault();
            return;
        }

        // Form alanı olan ekranlarda/modallarda Tab tuşu form kontrolleri arasında dolaşsın
        const controls = getVisibleFormControls(activeContainer);
        if (controls.length > 0) {
            e.preventDefault();
            let currentIndex = controls.indexOf(activeEl);
            let nextIndex = 0;

            if (currentIndex !== -1) {
                if (e.shiftKey) {
                    nextIndex = (currentIndex - 1 + controls.length) % controls.length;
                } else {
                    nextIndex = (currentIndex + 1) % controls.length;
                }
            } else {
                nextIndex = e.shiftKey ? controls.length - 1 : 0;
            }

            const targetEl = controls[nextIndex];
            if (targetEl) {
                document.querySelectorAll('.nav-focused').forEach(el => el.classList.remove('nav-focused'));
                targetEl.classList.add('nav-focused');
                targetEl.focus();

                if (typeof audio !== 'undefined' && audio.playNav) audio.playNav();

                if (KeyboardNav.items.includes(targetEl)) {
                    KeyboardNav.currentIndex = KeyboardNav.items.indexOf(targetEl);
                }
            }
            return;
        }
    }

    // 6. FORM ALANLARINDA VEYA YAZI ALANLARINDA DİĞER TUŞLAR:
    if (isFormFieldElement(activeEl)) {
        // Metin kutusunda sol ve sağ oklar metin imlecini doğal hareket ettirsin (menü öğesi atlamasın)
        if (isTextInputElement(activeEl)) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                return; // Doğal imleç hareketine izin ver
            }
            if (activeEl.tagName === 'TEXTAREA') {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    return; // Çok satırlı metinde satırlar arası harekete izin ver
                }
            }
            if (activeEl.type === 'number') {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    return; // Sayı kutusunda artırma/azaltmaya izin ver
                }
            }
            // Diğer metin kutularında Yukarı ve Aşağı oklar sayfayı kaydırmasın ve öge atlamasın
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                return;
            }
        }

        // Seçim kutularında (SELECT): Yukarı/Aşağı oklar seçenekleri doğal değiştirsin
        if (activeEl.tagName === 'SELECT') {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                return; // Doğal seçenek değiştirmeye izin ver
            }
        }

        // Enter tuşu: Doğal form davranışı
        if (e.key === 'Enter') {
            return;
        }
    }

    // SÜRÜŞ ESNASINDA DİĞER OK TUŞLARI OTOBÜSÜ YÖNETİR
    if (isDriving) return;

    // 7. ÖGELER ARASI DOLAŞMA: SADECE SAĞ VE SOL OKLAR
    // "ögeler arası dolaşmak için sadece sağ ve sol oklar kullanılsın"
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        KeyboardNav.moveNext();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        KeyboardNav.movePrev();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // Yukarı ve aşağı oklar menü/liste ögeleri arasında dolaşmasın!
        e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
        if (e.repeat) {
            e.preventDefault();
            return;
        }
        // Odaklanılan eleman nav-item ise tıkla
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

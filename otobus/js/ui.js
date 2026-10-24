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
        if (screenId === 'base-selection-menu' && typeof Game !== 'undefined' && !Game.hasPassedLevel10()) {
            console.warn("Harita ekranı 10 seviye geçilmeden açılamaz.");
            screenId = 'title-screen';
        }
        // Eğer menü ekranına geçiliyorsa açık kalan sesli konuşmaları anında sustur
        if (screenId !== 'driving-screen' && screenId !== 'stop-screen') {
            if (typeof audio !== 'undefined' && audio.stopSpeech) {
                audio.stopSpeech();
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
        const activeDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");
        
        // Eğer Tekirdağ için görevler henüz üretilmemişse veya task 0 aktif ilçeyle eşleşmiyorsa MUTLAKA yeniden üret
        if (cityName === "Tekirdağ" && typeof generateRoutesFromAPI === 'function') {
            const task0 = (typeof routesData !== 'undefined') ? routesData["tekirdag_task_0"] : null;
            if (!task0 || task0.district !== activeDist) {
                const realStops = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari["Tekirdağ"])
                    ? varsayilanSehirDuraklari["Tekirdağ"]
                    : null;
                generateRoutesFromAPI(realStops, "Tekirdağ", activeDist);
            }
        }

        const titleEl = document.getElementById("route-sel-title");
        if (titleEl) titleEl.innerText = `${activeDist} Sefer Görevleri (1 - 10. Seviye)`;
        
        const subtitleEl = document.getElementById("route-sel-subtitle") || document.querySelector("#route-menu .subtitle");
        if (subtitleEl) subtitleEl.innerText = `${cityName} - ${activeDist} bölgesi canlı hat ve durak görevleri`;
        
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

        // Görevleri doğal sayısal sırasına göre diz (Görev 1, Görev 2, ... Görev 10)
        cityRoutes.sort((a, b) => (a.taskIndex || 0) - (b.taskIndex || 0));

        // Oyuncunun görebileceği görevler: Mevcut lisans seviyesindeki görevler (1. Seviye için ilk 10 görev)
        const visibleRoutes = cityRoutes.filter(r => {
            if (typeof r.licenseLevel === 'number') {
                return r.licenseLevel <= currentLic;
            }
            return true;
        });

        let routesToRender = visibleRoutes.length > 0 ? visibleRoutes : cityRoutes;
        const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive');

        // İLERLEME MODU GİZEM VE KADEMELİ AÇILMA PRENSİBİ:
        // Oyuncuya toplam görev sayısı veya tüm gelecek görevler gösterilmez.
        // Yalnızca tamamlananlar + şu anki aktif görev + hemen sıradaki 1 kilitli görev gösterilir.
        if (!isFreeDrive) {
            routesToRender = routesToRender.filter(r => {
                const tIdx = (typeof r.taskIndex === 'number') ? r.taskIndex : 0;
                return tIdx <= completedTasks + 1;
            });
        }
        let activeTaskBtn = null;

        routesToRender.forEach(route => {
            const taskNum = (typeof route.taskIndex === 'number') ? (route.taskIndex + 1) : 1;
            let isCurrentTask = false;
            let isCompleted = false;
            let isLocked = false;
            
            if (isFreeDrive) {
                isLocked = false;
            } else {
                isCurrentTask = (route.taskIndex === completedTasks);
                isCompleted = (typeof route.taskIndex === 'number' && route.taskIndex < completedTasks);
                isLocked = (typeof route.taskIndex === 'number' && route.taskIndex > completedTasks);
            }

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
                btn.style.borderColor = "#22c55e";
                btn.style.boxShadow = "0 0 16px rgba(34, 197, 94, 0.4)";
                activeTaskBtn = btn;
            } else if (isCompleted) {
                btn.style.borderColor = "#10b981";
            } else if (isLocked) {
                btn.style.opacity = "0.75";
                btn.style.border = "1.5px dashed rgba(239, 68, 68, 0.55)";
                btn.style.background = "rgba(15, 23, 42, 0.85)";
                btn.setAttribute("aria-disabled", "true");
            }

            let icon = isFreeDrive ? "🛣️" : (isCurrentTask ? "🟢" : (isCompleted ? "✅" : "🔒"));
            let statusText = isFreeDrive
                ? "(SERBEST SÜRÜŞE AÇIK - PRATİK YAPABİLİRSİNİZ)"
                : (isCurrentTask 
                    ? "(AÇIK - ŞU ANKİ GÖREVİNİZ)" 
                    : (isCompleted ? "(Tamamlandı - İsterseniz Tekrar Sürün)" : `(KİLİTLİ - KAPALI: Önce Görev ${completedTasks + 1}'i Tamamlayın)`));
            
            const startStop = route.startStop || (route.stops && route.stops[0] ? route.stops[0].name : "Kalkış Garajı");
            const endStop = route.endStop || (route.stops && route.stops.length > 0 ? route.stops[route.stops.length - 1].name : "Varış");
            const intermediate = route.intermediateStops || (route.stops && route.stops.length > 2 ? route.stops.slice(1, -1).map(s => s.name) : []);
            
            const totalKmRoute = (route.totalKm) ? route.totalKm.toFixed(1) : ((route.stops && route.stops.length > 0) ? route.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0).toFixed(1) : 0);
            const stopCount = (route.stops) ? route.stops.length : 0;
            const badgeHtml = '<span style="background: rgba(56,189,248,0.2); color: #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">' + stopCount + ' Durak | ' + totalKmRoute + ' km</span>';
            const cardSteps = (typeof MissionReader !== "undefined" && MissionReader.generateSteps) ? MissionReader.generateSteps(route) : [];
            const cardStepsHtml = cardSteps.map(s => '<div style="margin: 3px 0;">• ' + s + '</div>').join('');
            
            let ariaDesc = isLocked 
                ? (`Görev ${taskNum}: ${route.name}. KİLİTLİ VE KAPALI. Bu görevin açılması için önce Görev ${completedTasks + 1}'i başarıyla tamamlamalısınız. Kalkış: ${startStop}, Varış: ${endStop}.`)
                : (isCurrentTask
                    ? (`Görev ${taskNum}: ${route.name}. AÇIK - ŞU ANKİ GÖREVİNİZ. Başlamak için Enter veya Boşluk tuşuna basın. Kalkış: ${startStop}, Varış: ${endStop}. Toplam ${stopCount} durak, ${totalKmRoute} kilometre.`)
                    : (`Görev ${taskNum}: ${route.name}. Tamamlandı. Tekrar sürmek için Enter veya Boşluk tuşuna basın. Kalkış: ${startStop}, Varış: ${endStop}.`));
            
            btn.setAttribute("aria-label", ariaDesc);

            const lockedNoticeHtml = isLocked ? 
                ('<div style="font-size: 0.88rem; color: #f87171; background: rgba(239, 68, 68, 0.12); border-left: 3px solid #ef4444; padding: 8px 12px; border-radius: 4px; margin-top: 8px;">' +
                 '    🔒 <strong>KİLİTLİ VE KAPALI:</strong> Bu görevin kilidini açmak için önce <strong>Görev ' + (completedTasks + 1) + '</strong> seferini başarıyla tamamlamalısınız.' +
                 '</div>') : '';

            btn.innerHTML = [
                '<div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px;">',
                '    <strong style="color: ' + (isLocked ? '#f87171' : (isCurrentTask ? '#22c55e' : (route.color || '#38bdf8'))) + '; font-size: 1.15rem;">' + icon + ' ' + route.name + ' ' + statusText + '</strong>',
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
                '<div style="font-size: 0.88rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 6px; width: 100%; border-left: 3px solid #22c55e; margin-top: 6px;">' +
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
                    const msg = "Kaptanım, Görev " + taskNum + " henüz kilitli ve kapalıdır. Bu görevi açmak için lütfen önce Görev " + (completedTasks + 1) + "'i başarıyla tamamlayın.";
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Görev " + taskNum + " Kilitli: Önce Görev " + (completedTasks + 1) + "'i tamamlayın.", "warning");
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
        if (activeTaskBtn) {
            try {
                activeTaskBtn.focus();
            } catch(e) {}
        }
        const routeWelcome = isFreeDrive ? `${activeDist} serbest sürüş güzergahları listelendi.` : `İlerleme Modu açıldı. Aktif sefer emriniz hazır.`;
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
            if (el.disabled || el.classList.contains('hidden')) return;
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
        if (el.classList.contains('hidden') || el.disabled) return;
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
            'garage-fleet-modal',
            'sound-gallery-modal',
            'badges-modal',
            'stop-collection-modal',
            'tutorial-modal',
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
        const inBus = isDriving || (document.getElementById('driving-screen') && !document.getElementById('driving-screen').classList.contains('hidden'));
        if (e.key === 'PageUp') {
            e.preventDefault();
            if (inBus) {
                if (typeof Game !== 'undefined' && typeof Game.toggleFrontDoor === 'function') {
                    Game.toggleFrontDoor();
                }
            } else {
                if (typeof audio !== 'undefined' && audio.adjustMusicVolume) {
                    audio.adjustMusicVolume(0.1);
                }
            }
            return;
        }
        if (e.key === 'PageDown') {
            e.preventDefault();
            if (inBus) {
                if (typeof Game !== 'undefined' && typeof Game.toggleRearDoor === 'function') {
                    Game.toggleRearDoor();
                }
            } else {
                if (typeof audio !== 'undefined' && audio.adjustMusicVolume) {
                    audio.adjustMusicVolume(-0.1);
                }
            }
            return;
        }
        if (e.key === 'Home') {
            e.preventDefault();
            const inBus = isDriving || (document.getElementById('driving-screen') && !document.getElementById('driving-screen').classList.contains('hidden'));
            if (inBus) {
                if (typeof audio !== 'undefined') {
                    if (audio.playWindowSound) audio.playWindowSound(true);
                    audio.setWindowOpen(true);
                    if (typeof Game !== 'undefined' && Game.busDamage) {
                        audio.updateAcoustics(Game.busDamage.leftWindow, Game.busDamage.rightWindow);
                    }
                    const winMsg = "Kaptan camı açıldı. Dış sesler ve serin hava kokpite doluyor.";
                    if (typeof audio.speak === 'function') audio.speak(winMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🪟 Sol Cam Açıldı (Home)", "info");
                }
            } else {
                if (typeof audio !== 'undefined' && audio.adjustGameSoundVolume) {
                    audio.adjustGameSoundVolume(0.1);
                }
            }
            return;
        }
        if (e.key === 'End') {
            e.preventDefault();
            const inBus = isDriving || (document.getElementById('driving-screen') && !document.getElementById('driving-screen').classList.contains('hidden'));
            if (inBus) {
                if (typeof audio !== 'undefined') {
                    if (audio.playWindowSound) audio.playWindowSound(false);
                    audio.setWindowOpen(false);
                    if (typeof Game !== 'undefined' && Game.busDamage) {
                        audio.updateAcoustics(Game.busDamage.leftWindow, Game.busDamage.rightWindow);
                    }
                    const winMsg = "Kaptan camı kapatıldı. Kabin yalıtımı sağlandı.";
                    if (typeof audio.speak === 'function') audio.speak(winMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🪟 Sol Cam Kapatıldı (End)", "info");
                }
            } else {
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

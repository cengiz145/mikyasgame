/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU ARAYÜZ (UI.JS)
   ========================================================================== */

const UI = {
    screens: [
        'title-screen', 'base-selection-menu', 'route-menu', 
        'garage-screen', 'driving-screen', 'stop-screen', 'results-screen', 'sanayi-screen'
    ],
    
    switchScreen: function(screenId) {
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
        if (budgetEl) budgetEl.innerText = `${budget} â‚º`;
        
        const taskInCurrentLicense = (completedTasks % 9) + 1; 
        // e.g. completed 0 -> 1/9, completed 8 -> 9/9, completed 9 -> 1/9 (next level)
        // Except if completedTasks >= 27
        
        const xpText = document.getElementById('ui-xp-text');
        const xpFill = document.getElementById('ui-xp-fill');

        if (completedTasks >= 27) {
            if (xpText) xpText.innerText = `Uzun Yol (Tüm Görevler Bitti!)`;
            if (xpFill) xpFill.style.width = `100%`;
        } else {
            if (xpText) xpText.innerText = `Görev İlerlemesi: ${taskInCurrentLicense} / 9`;
            if (xpFill) xpFill.style.width = `${Math.min(100, (taskInCurrentLicense / 9) * 100)}%`;
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
        document.getElementById("route-sel-title").innerText = cityName + " Görevleri";
        const listEl = document.getElementById("dynamic-route-list");
        listEl.innerHTML = "";
        
        const cityRoutes = Object.values(routesData).filter(r => r.sehir === cityName);
        
        if (cityRoutes.length === 0) {
            listEl.innerHTML = '<li style="text-align:center; color: white;">Bu şehir için rota bulunamadı. Lütfen API\'den veri çekin.</li>';
            return;
        }

        cityRoutes.forEach(route => {
            if (route.taskIndex !== completedTasks) {
                return; 
            }

            const isCurrentTask = route.taskIndex === completedTasks;
            
            const li = document.createElement("li");
            const btn = document.createElement("button");
            
            let btnClass = "menu-btn nav-item";
            if (!isCurrentTask) {
                btnClass += " secondary-btn";
            }

            btn.className = btnClass;
            btn.style.flexDirection = "column";
            btn.style.alignItems = "stretch";
            btn.style.textAlign = "left";
            btn.style.padding = "18px 20px";
            btn.style.lineHeight = "1.5";
            btn.style.width = "100%";

            let icon = isCurrentTask ? "▶️" : "✅";
            
            const startStop = route.startStop || (route.stops[0] ? route.stops[0].name : "Kalkış Garajı");
            const endStop = route.endStop || (route.stops[route.stops.length - 1] ? route.stops[route.stops.length - 1].name : "Varış");
            const intermediate = route.intermediateStops || (route.stops.length > 2 ? route.stops.slice(1, -1).map(s => s.name) : []);
            
            let ariaDesc = "Görev: " + route.name + ". Kalkış: " + startStop + ", Varış: " + endStop + ". Toplam " + route.stops.length + " durak.";
            
            btn.setAttribute("aria-label", ariaDesc);

            btn.innerHTML = [
                '<div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px;">',
                '    <strong style="color: ' + route.color + '; font-size: 1.2rem;">' + icon + ' ' + route.name + ' ' + (isCurrentTask ? '(AKTİF GÖREV)' : '(Tamamlandı)') + '</strong>',
                '    <span style="background: rgba(56,189,248,0.2); color: #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">' + route.stops.length + ' Durak</span>',
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
                '<div style="font-size: 0.88rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 6px; width: 100%; border-left: 3px solid #38bdf8;">',
                '    🕹️ <strong>Nasıl Yapılacak:</strong> <code>W</code> ile gaz verin, duraklara yaklaşırken <code>S</code> ile fren yapıp durun. <code>E</code> (ön) ve <code>Q</code> (arka) kapıları açarak yolcuları alın, ardından kapıları kapatıp sonraki durağa ilerleyin.',
                '</div>'
            ].join("");

            btn.onclick = () => {
                audio.playSelect();
                Game.startRoute(route.id);
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
   MISSION READER (A: AÇIKLAMALARI OKU, SHIFT+A: ADIM ADIM OKU, ESC: ÇIK)
   ========================================================================== */
const MissionReader = {
    currentStepIndex: 0,

    getActiveRoute: function() {
        if (typeof Game !== 'undefined' && Game.activeRouteData) {
            return Game.activeRouteData;
        }
        if (typeof routesData !== 'undefined') {
            if (typeof Game !== 'undefined' && Game.currentCity) {
                let r = Object.values(routesData).find(x => x.sehir === Game.currentCity && x.taskIndex === Game.completedTasks);
                if (r) return r;
                r = Object.values(routesData).find(x => x.sehir === Game.currentCity);
                if (r) return r;
            }
            return Object.values(routesData)[0] || null;
        }
        return null;
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

        let msg = route.name + " açıklaması. " +
                  "Kalkış durağı: " + startStop + ". " +
                  "Gitmeniz gereken hedef son durak: " + endStop + ". " +
                  (intermediate.length > 0 ? "Durulacak ara duraklar: " + intermediate.join(", ") + ". " : "Ara durak bulunmamaktadır. ") +
                  "Toplam " + totalStops + " durak. " +
                  "Görevin adımlarını adım adım dinlemek için Shift + A tuşuna basın. Çıkmak için Escape tuşuna basın.";
        
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(msg);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(msg);
        }
    },

    readNextStep: function() {
        const route = this.getActiveRoute();
        const endStop = (route && route.endStop) ? route.endStop : (route && route.stops && route.stops.length > 0 ? route.stops[route.stops.length - 1].name : "Hedef Son Durak");

        const steps = [
            "1. Adım: Gaz ve Kalkış: W veya Yukarı Ok tuşuna basarak gaz verin ve kalkış yapın. Şeritte kalmak için A ve D tuşlarını kullanın.",
            "2. Adım: Durağa Yaklaşma ve Yavaşlama: Durağa yaklaşırken sesli anonsu dinleyin, S veya Aşağı Ok ile fren yaparak hızınızı 20 kilometre altına indirin ve durak hizasında tamamen durun.",
            "3. Adım: Kapı Açma ve Yolcu Alma: Otobüs tam durduğunda E ile ön kapıyı, Q ile arka kapıyı açarak yolcuların biniş ve inişini tamamlayın.",
            "4. Adım: Kapıları Kapatma ve İlerleme: Biniş sesleri bitince kapıları aynı tuşlarla kapatıp tekrar gaz vererek sonraki durağa ilerleyin.",
            "5. Adım: Görevi Bitirme: Sırasıyla tüm durakları tamamlayıp son durak olan " + endStop + " durağında yolcuları indirdiğinizde görev başarıyla tamamlanır."
        ];

        if (this.currentStepIndex >= steps.length) {
            this.currentStepIndex = 0;
        }

        let stepText = steps[this.currentStepIndex];
        this.currentStepIndex++;

        let nextNotice = (this.currentStepIndex < steps.length) 
            ? " (Sonraki adım için Shift + A, çıkmak için Escape tuşuna basın.)" 
            : " (Tüm adımlar tamamlandı. Baştan dinlemek için Shift + A, çıkmak için Escape tuşuna basın.)";

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
            if (!el.disabled && !el.classList.contains('locked-route') && !el.classList.contains('hidden')) {
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




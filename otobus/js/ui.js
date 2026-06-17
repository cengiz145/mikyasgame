/* ==========================================================================
   TÃœRKÄ°YE TURNESÄ° - OTOBÃœS SÄ°MÃœLASYONU ARAYÃœZ (UI.JS)
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
            
            // EKRAN OKUYUCU DÃœZELTMESÄ° (A11Y):
            // role="application" kullanÄ±ldÄ±ÄŸÄ± iÃ§in ekran okuyucu baÅŸlÄ±klarÄ± otomatik okumaz.
            // Bu yÃ¼zden yeni ekrana geÃ§ildiÄŸinde baÅŸlÄ±ÄŸÄ± manuel olarak anons ediyoruz.
            const titleEl = activeScreen.querySelector('h1, h2, .subtitle, .main-title');
            if (titleEl && typeof audio !== 'undefined' && audio.speak) {
                audio.speak(titleEl.innerText);
            }
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
        
        // EKRAN OKUYUCU DÃœZELTMESÄ° (A11Y):
        // Toast mesajlarÄ± ekranda sadece gÃ¶rsel Ã§Ä±kÄ±yordu.
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(message);
        }
        
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
            if (xpText) xpText.innerText = `Uzun Yol (TÃ¼m GÃ¶revler Bitti!)`;
            if (xpFill) xpFill.style.width = `100%`;
        } else {
            if (xpText) xpText.innerText = `GÃ¶rev Ä°lerlemesi: ${taskInCurrentLicense} / 9`;
            if (xpFill) xpFill.style.width = `${Math.min(100, (taskInCurrentLicense / 9) * 100)}%`;
        }
    },

    renderCityMap: function(licenseLevel, unlockedCitiesArr) {
        const listEl = document.getElementById('city-selection-list');
        listEl.innerHTML = '';
        
        const isFirstTime = unlockedCitiesArr.length === 0;
        const isUzunYolUnlocked = licenseLevel > 4; // Ehliyet seviye 5 olunca ÅehirlerarasÄ± aÃ§Ä±lÄ±r
        
        document.getElementById('map-subtitle').innerText = isFirstTime 
            ? "Maceraya BaÅŸlayacaÄŸÄ±nÄ±z Merkez ÃœssÃ¼ SeÃ§in" 
            : "Ã‡alÄ±ÅŸmak Ä°stediÄŸiniz Åehri SeÃ§in veya HaritayÄ± GeniÅŸletin";

        document.getElementById('unlock-points-display').innerHTML = isUzunYolUnlocked 
            ? `Harita KeÅŸfi: <span style="color:var(--success)">Uzun Yol ÅofÃ¶rÃ¼ (AÃ§Ä±k)</span>`
            : `Harita KeÅŸfi: <span style="color:var(--danger)">Uzun Yol Ehliyeti Bekleniyor (3. SÄ±nÄ±fÄ± Bitir)</span>`;

        // Unlockable komÅŸularÄ± bul (AÃ§Ä±k olan ÅŸehirlerin komÅŸularÄ±)
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
                        <strong>${cityName} ${isFirstTime ? "(Merkez Ãœs Yap)" : "(AÃ§Ä±k Åehir)"}</strong>
                        <small>Bu ÅŸehre giriÅŸ yap</small>
                    </span>
                `;
                btn.onclick = () => {
                    audio.playSelect();
                    if (isFirstTime) {
                        Game.unlockCity(cityName);
                        Game.setCity(cityName);
                        UI.showToast(`${cityName} Merkez ÃœssÃ¼ Olarak Belirlendi!`, 'success');
                        setTimeout(() => {
                            UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
                            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: cityName } }));
                        }, 500);
                    } else {
                        Game.setCity(cityName);
                        if (isUzunYolUnlocked) {
                            document.getElementById('mode-selection-modal').classList.remove('hidden');
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
                        <strong>${cityName} (Kilidi AÃ§)</strong>
                        <small>Uzun yol izni var. Sefere baÅŸla!</small>
                    </span>
                `;
                btn.onclick = () => {
                    audio.playSelect();
                    Game.unlockCity(cityName);
                    UI.showToast(`${cityName} Kilidi AÃ§Ä±ldÄ±!`, 'success');
                    UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
                };
            } else {
                btn.className = 'menu-btn nav-item locked-city';
                btn.disabled = true;
                
                let lockReason = isNeighborButLocked ? "Ã–nce merkez Ã¼ssÃ¼nde 3. SÄ±nÄ±f Ehliyeti bitirmelisin!" : "Bu ÅŸehre henÃ¼z komÅŸu deÄŸilsiniz.";
                
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
        document.getElementById('route-sel-title').innerText = `${cityName} GÃ¶revleri`;
        const listEl = document.getElementById('dynamic-route-list');
        listEl.innerHTML = '';
        
        const cityRoutes = Object.values(routesData).filter(r => r.sehir === cityName);
        
        if (cityRoutes.length === 0) {
            listEl.innerHTML = `<li style="text-align:center; color: white;">Bu ÅŸehir iÃ§in rota bulunamadÄ±. LÃ¼tfen API'den veri Ã§ekin.</li>`;
            return;
        }

        // cityRoutes 27 adet (taskIndex 0 to 26).
        cityRoutes.forEach(route => {
            // Sadece ÅU ANKÄ° (aktif) gÃ¶revi gÃ¶ster, Ã¶ncekileri ve sonrakileri tamamen GÄ°ZLE.
            if (route.taskIndex !== completedTasks) {
                return; 
            }

            const isCurrentTask = route.taskIndex === completedTasks;
            
            const li = document.createElement('li');
            const btn = document.createElement('button');
            
            // EÄŸer tamamlanmÄ±ÅŸsa farklÄ± bir stil, ÅŸu anki gÃ¶revse vurgulu stil
            let btnClass = 'menu-btn nav-item';
            if (!isCurrentTask) {
                btnClass += ' secondary-btn'; // BitirilmiÅŸ gÃ¶revler biraz daha sÃ¶nÃ¼k gÃ¶rÃ¼nsÃ¼n
            }

            btn.className = btnClass;

            let icon = isCurrentTask ? 'â–¶ï¸' : 'âœ…';
            
            btn.innerHTML = `
                <span class="btn-icon">${icon}</span>
                <span class="btn-text">
                    <strong style="color: ${route.color};">${route.name} ${isCurrentTask ? '(YENÄ°)' : '(TamamlandÄ±)'}</strong>
                    <small>${route.desc}</small>
                </span>
            `;

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
   KEYBOARD NAVIGATION (MENÃœ GEZÄ°NTÄ°SÄ°)
   ========================================================================== */
const KeyboardNav = {
    items: [],
    currentIndex: 0,
    
    initForScreen: function() {
        this.items = [];
        this.currentIndex = 0;
        
        // EKRAN OKUYUCU DÃœZELTMESÄ° (A11Y): AÃ§Ä±k bir modal varsa klavye odaÄŸÄ±nÄ± Ã¶nce ona hapset
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
    // SÃ¼rÃ¼ÅŸ halindeyken veya giriÅŸ inputundayken UI klavye navigasyonunu yoksay
    if (typeof Game !== 'undefined' && Game.isDriving) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

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
        // NVDA veya Tab ile odaklanÄ±lan eleman bir buton deÄŸilse (div ise) Enter native Ã§alÄ±ÅŸmaz.
        // Bu yÃ¼zden eÄŸer bir nav-item Ã¼zerinde isek tÄ±klamasÄ±nÄ± saÄŸlÄ±yoruz.
        if (document.activeElement && document.activeElement.classList.contains('nav-item')) {
            if (document.activeElement.tagName !== 'BUTTON') { 
                e.preventDefault();
                document.activeElement.click();
            }
        }
    }
});



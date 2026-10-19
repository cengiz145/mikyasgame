/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU PUSULA VE İSTİKAMET SİSTEMİ (COMPASS-SYSTEM.JS)
   Modüler, Hafif, Dinamik Coğrafi Yönlendirme, 3D/Stereo Akustik Sinyal ve NVDA Desteği
   ========================================================================== */

const CompassSystem = {
    currentDirection: "Kuzey",
    currentAngle: 0, // 0 = Kuzey, 90 = Doğu, 180 = Güney, 270 = Batı

    cardinals: {
        ArrowUp:    { name: "Kuzey", icon: "⬆️", angle: 0,   opposite: "Güney", pan: 0.0,  freq: 880 },
        ArrowRight: { name: "Doğu",  icon: "➡️", angle: 90,  opposite: "Batı",  pan: 0.85, freq: 660 },
        ArrowDown:  { name: "Güney", icon: "⬇️", angle: 180, opposite: "Kuzey", pan: 0.0,  freq: 330 },
        ArrowLeft:  { name: "Batı",  icon: "⬅️", angle: 270, opposite: "Doğu",  pan: -0.85, freq: 440 }
    },

    // Şehir bazlı çevre ve istikamet veritabanı (Genişletilebilir, sıfır harici kütüphane)
    cityLandmarks: {
        "Tekirdağ": {
            "Kuzey": "Muratlı Caddesi, Şehir Hastanesi, Saray ve Çerkezköy istikameti",
            "Doğu": "Değirmenaltı, Namık Kemal Üniversitesi, Çorlu ve İstanbul istikameti",
            "Güney": "Marmara Denizi, Sahil Dolgu Parkı, Liman ve Çanakkale istikameti",
            "Batı": "Hükümet Caddesi, Valilik, Malkara ve Keşan istikameti"
        },
        "Yalova": {
            "Kuzey": "Marmara Denizi, Feribot İskelesi ve Sahil Şeridi",
            "Doğu": "Çınarcık, Çiftlikköy ve Kocaeli yönü",
            "Güney": "Bursa Otoyolu, Süpürgelik ve Güney Ormanları",
            "Batı": "Termal Kaplıcaları ve Armutlu yönü"
        },
        "Bayburt": {
            "Kuzey": "Trabzon, Çoruh Vadisi ve Soğanlı Dağları yönü",
            "Doğu": "Erzurum Yolu ve Kop Dağı Geçidi",
            "Güney": "Demirözü Barajı ve Otogar yönü",
            "Batı": "Gümüşhane, Saat Kulesi ve Bayburt Kalesi"
        },
        "Edirne": {
            "Kuzey": "Lalapaşa ve Balkan Sınırı istikameti",
            "Doğu": "Havsa, Kırklareli ve Tekirdağ istikameti",
            "Güney": "Meriç Nehri, Karaağaç ve İpsala istikameti",
            "Batı": "Kapıkule ve Tunca Köprüleri"
        },
        "Kırklareli": {
            "Kuzey": "Istranca Ormanları ve Dereköy Sınırı",
            "Doğu": "Vize, Lüleburgaz ve İstanbul istikameti",
            "Güney": "Babaeski ve Tekirdağ istikameti",
            "Batı": "Edirne istikameti"
        },
        "İstanbul": {
            "Kuzey": "Karadeniz Sahili ve Şile istikameti",
            "Doğu": "Ankara ve Anadolu Otoyolu",
            "Güney": "Marmara Denizi ve Adalar hattı",
            "Batı": "Trakya, Edirne ve Tekirdağ istikameti"
        }
    },

    // Stereo / 3D Mekanik Pusula Klik ve Akustik Sinyal Sentezi (Web Audio API)
    playCompassTone: function(cardinal) {
        try {
            if (typeof audio === 'undefined' || !audio.ctx) return;
            const ctx = audio.ctx;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

            osc.type = 'sine';
            const f = cardinal.freq || 660;
            osc.frequency.setValueAtTime(f, ctx.currentTime);
            // Mekanik pusula iğnesi rezonansı
            osc.frequency.exponentialRampToValueAtTime(f * 0.85, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            if (pan && typeof pan.pan !== 'undefined') {
                pan.pan.setValueAtTime(cardinal.pan || 0, ctx.currentTime);
                osc.connect(gain);
                gain.connect(pan);
                pan.connect(audio.masterGain || ctx.destination);
            } else {
                osc.connect(gain);
                gain.connect(audio.masterGain || ctx.destination);
            }

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.11);
            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
                if (pan) pan.disconnect();
            };
        } catch (e) {
            console.warn("Pusula ses sentezi:", e);
        }
    },

    // Yön değiştirme (Shift + Ok tuşları)
    handleDirection: function(arrowKey) {
        const dir = this.cardinals[arrowKey];
        if (!dir) return;

        this.currentDirection = dir.name;
        this.currentAngle = dir.angle;

        if (typeof Game !== 'undefined') {
            Game.currentCompassDirection = dir.name;
            Game.currentCompassAngle = dir.angle;
        }

        // 3D Akustik ses bildirimi
        this.playCompassTone(dir);

        const isDriving = (typeof Game !== 'undefined' && Game.isDriving);
        if (isDriving) {
            this.handleDrivingCompass(dir);
        } else {
            this.handleMenuCompass(dir);
        }
        this.updateHUD(dir);
    },

    // Tek tuşla ('Y' tuşu veya Sesli Asistan) anlık pusula sorgusu
    queryCompass: function() {
        const dir = this.cardinals[
            this.currentDirection === "Kuzey" ? "ArrowUp" :
            this.currentDirection === "Doğu" ? "ArrowRight" :
            this.currentDirection === "Güney" ? "ArrowDown" : "ArrowLeft"
        ] || this.cardinals.ArrowUp;

        this.playCompassTone(dir);
        const report = this.getStatusReport(dir);

        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(report);
        }
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
            audio.updateNvdaLiveRegion(report);
        }
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
            UI.showToast(`🧭 Pusula: ${dir.icon} ${dir.name} (${dir.angle}°)`, 'info');
        }
        this.updateHUD(dir);
        return report;
    },

    // Dinamik durum ve istikamet raporu üretir
    getStatusReport: function(dir) {
        dir = dir || this.cardinals.ArrowUp;
        const isDriving = (typeof Game !== 'undefined' && Game.isDriving);
        const city = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";

        if (!isDriving) {
            return `Pusula İstikameti: ${dir.name} (${dir.angle} derece). ${this.getLandmarkDesc(city, dir.name)}`;
        }

        let report = `Pusula İstikameti: ${dir.name} (${dir.angle} derece). `;

        // Aktif rota ve durak analizi
        if (typeof Game !== 'undefined' && Game.activeRouteData) {
            const r = Game.activeRouteData;
            const nextStop = (r.stops && r.stops[Game.currentStopIndex]) ? r.stops[Game.currentStopIndex].name : "";
            const remDist = Math.max(0, Math.round(Game.currentDistanceToNext || 0));
            const distStr = remDist >= 1000 ? (remDist / 1000).toFixed(1) + " kilometre" : remDist + " metre";

            const routeDir = this.inferRouteDirection(r);
            if (routeDir) {
                if (routeDir === dir.name) {
                    report += `Rotanızla tam uyumlu ilerliyorsunuz. Sıradaki durak: ${nextStop}, yaklaşık ${distStr} kaldı.`;
                } else {
                    report += `Hedef rota ${routeDir} yönünde. Sıradaki durak: ${nextStop}, ${distStr} kaldı.`;
                }
            } else {
                report += `Sıradaki durak: ${nextStop}, yaklaşık ${distStr} kaldı.`;
            }
        } else {
            report += this.getLandmarkDesc(city, dir.name);
        }

        return report;
    },

    // Rota adından ve duraklarından rotanın genel yönünü çıkarsama
    inferRouteDirection: function(route) {
        if (!route) return null;
        const name = (route.name || "").toLowerCase();
        if (name.includes("saray") || name.includes("muratlı") || name.includes("hastane") || name.includes("otogar")) return "Kuzey";
        if (name.includes("çorlu") || name.includes("velimeşe") || name.includes("değirmenaltı") || name.includes("üniversite") || name.includes("istanbul")) return "Doğu";
        if (name.includes("şarköy") || name.includes("ereğli") || name.includes("sahil") || name.includes("liman") || name.includes("çanakkale")) return "Güney";
        if (name.includes("malkara") || name.includes("hayrabolu") || name.includes("valilik") || name.includes("keşan") || name.includes("edirne")) return "Batı";
        return null;
    },

    getLandmarkDesc: function(city, dirName) {
        const cityObj = this.cityLandmarks[city] || this.cityLandmarks["Tekirdağ"];
        return cityObj ? (cityObj[dirName] || "") : "";
    },

    handleDrivingCompass: function(dir) {
        const report = this.getStatusReport(dir);
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(report);
        }
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
            audio.updateNvdaLiveRegion(report);
        }
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
            UI.showToast(`🧭 İstikamet ${dir.icon} ${dir.name} (${dir.angle}°)`, 'info');
        }
    },

    handleMenuCompass: function(dir) {
        const baseSelection = document.getElementById('base-selection-menu');
        const districtModal = document.getElementById('district-dest-modal');
        const routeMenu = document.getElementById('route-menu');

        // 1. Harita Ekranı (Şehirler Arası)
        if (baseSelection && !baseSelection.classList.contains('hidden')) {
            this.handleMapMenu(dir);
            return;
        }

        // 2. İlçe Seçim Modalı
        if (districtModal && !districtModal.classList.contains('hidden')) {
            this.handleDistrictMenu(dir);
            return;
        }

        // 3. Şehir İçi Hat Listesi
        if (routeMenu && !routeMenu.classList.contains('hidden')) {
            this.handleRouteMenu(dir);
            return;
        }

        // 4. Ana Menüde genel yön anonsu
        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const landmark = this.getLandmarkDesc(currentCity, dir.name);
        const msg = `${dir.name} (${dir.angle}°): ${landmark}`;
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.icon} ${msg}`, 'info');
    },

    handleMapMenu: function(dir) {
        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const cityData = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[currentCity] : null;

        let targetCity = null;
        if (cityData && cityData.komsular) {
            const dirMap = {
                "Kuzey": cityData.komsular.kuzey,
                "Doğu": cityData.komsular.dogu,
                "Güney": cityData.komsular.guney,
                "Batı": cityData.komsular.bati
            };
            targetCity = dirMap[dir.name];
        }

        if (targetCity) {
            const announcement = `${dir.name}: ${targetCity} istikameti. Seçmek için Enter'a basın.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(announcement);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.name} ➔ ${targetCity}`, 'info');

            const listEl = document.getElementById('city-selection-list');
            if (listEl) {
                const buttons = listEl.querySelectorAll('button');
                buttons.forEach(btn => {
                    if (btn.innerText.includes(targetCity)) {
                        btn.focus();
                        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-focused'));
                        btn.classList.add('nav-focused');
                    }
                });
            }
        } else {
            const noRoute = `${currentCity} için ${dir.name} yönünde doğrudan komşu şehir hattı bulunmuyor.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(noRoute);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(noRoute, 'warning');
        }
    },

    handleDistrictMenu: function(dir) {
        const listEl = document.getElementById('district-dest-list');
        const keywords = {
            "Kuzey": ["saray", "26", "muratlı", "kapaklı"],
            "Doğu": ["çorlu", "48", "velimeşe", "ergeneli", "ulaş"],
            "Güney": ["şarköy", "ereğli", "marmaraereğlisi", "kumbağ"],
            "Batı": ["malkara", "hayrabolu", "keşan"]
        };
        const targets = keywords[dir.name] || [];

        let foundBtn = null;
        if (listEl) {
            const buttons = listEl.querySelectorAll('button');
            for (const btn of buttons) {
                const text = btn.innerText.toLowerCase();
                if (targets.some(k => text.includes(k))) {
                    foundBtn = btn;
                    break;
                }
            }
        }

        if (foundBtn) {
            foundBtn.focus();
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-focused'));
            foundBtn.classList.add('nav-focused');
            const cleanText = foundBtn.innerText.replace(/[\n\r]+/g, ' ').trim();
            const msg = `${dir.name} İstikameti: ${cleanText}. Başlatmak için Enter'a basın.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.name} ➔ ${cleanText}`, 'info');
        } else {
            const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
            const landmark = this.getLandmarkDesc(currentCity, dir.name);
            const msg = `${dir.name} Yönü: ${landmark}`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(msg, 'info');
        }
    },

    handleRouteMenu: function(dir) {
        const listEl = document.getElementById('dynamic-route-list');
        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const landmark = this.getLandmarkDesc(currentCity, dir.name);

        let msg = `${dir.name} Bölgesi: ${landmark}`;
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.name}: ${landmark}`, 'info');

        if (listEl) {
            const btn = listEl.querySelector('button');
            if (btn) btn.focus();
        }
    },

    updateHUD: function(dir) {
        const compassHud = document.getElementById('hud-compass');
        const compassText = document.getElementById('hud-compass-text');
        if (compassText) {
            compassText.innerText = `${dir.icon} ${dir.name.toUpperCase()} (${dir.angle}°)`;
        } else if (compassHud) {
            compassHud.innerText = `🧭 ${dir.icon} ${dir.name.toUpperCase()} (${dir.angle}°)`;
        }
    }
};

// Geriye dönük tam uyumluluk alias'ı
if (typeof window !== 'undefined') {
    window.CompassSystem = CompassSystem;
    window.CompassNav = CompassSystem;
}

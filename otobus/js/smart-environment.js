/* ==========================================================================
   AKILLI ÇEVRE VE YOL ZEMİNİ MOTORU (SMART ENVIRONMENT & ROAD SURFACE ENGINE)
   Freesound Saha Kayıtları & OSM Yol Yüzeyi / Kasis Ekosistemi
   - 81 İl ve İlçelerin Coğrafi Ortam Algılayıcısı (Sahil, Sanayi, Tarihi Merkez, Dağ)
   - Freesound Kıyı Akustiği (Liman Sis Düdüğü, Dalga Fısıltısı, Martı Sesleri)
   - Yol Yüzeyi Simülasyonu (Asfalt, Kilit Parke Taşı / Arnavut Kaldırımı, Çakıl/Stabilize)
   - Gerçek Hız Kesici Kasisler (70m Sesli İkaz, Çift Aks Darbesi, Süspansiyon Esnemesi)
   - Sesli Çevre ve Zemin Raporu (Shift + Z Kısayolu)
   ========================================================================== */

(function(window) {
    'use strict';

    // 1. 81 İL VE İLÇELERİN KARAKTERİSTİK COĞRAFİ ORTAM VERİTABANI
    const REGIONAL_ENVIRONMENTS = {
        // Kıyı ve Liman Şehirleri / İlçeleri (Dalga, Sis Düdüğü, Martı)
        coastal: [
            "Tekirdağ", "İstanbul", "İzmir", "Çanakkale", "Trabzon", "Antalya",
            "Samsun", "Mersin", "Sinop", "Giresun", "Rize", "Ordu", "Zonguldak",
            "Bartın", "Yalova", "Kocaeli", "Balıkesir", "Muğla", "Hatay"
        ],
        // Kıyı İlçeleri (İl bazında olmasa bile ilçe sahilse)
        coastalDistricts: [
            "süleymanpaşa", "şarköy", "kumbağ", "mürefte", "marmaraereğlisi",
            "kadıköy", "üsküdar", "beşiktaş", "eminönü", "bakırköy", "maltepe",
            "konak", "karşıyaka", "alsancak", "çeşme", "urla", "ayvalık", "bandırma",
            "bodrum", "fethiye", "marmaris", "alanya", "manavgat", "kaş", "akçaabat"
        ],
        // Sanayi ve Organize Fabrika Havzaları (Ağır Vasıta, Hemzemin Geçit, Vardiya Düdüğü)
        industrialDistricts: [
            "çorlu", "çerkezköy", "ergene", "velimeşe", "muratlı", "kapaklı",
            "gebze", "dilovası", "çayırova", "tuzla", "nilüfer", "gemlik",
            "aliağa", "torbalı", "hacıeyüplü", "organize"
        ],
        // Dağ, Rampa ve Orman Geçitleri (Vadi Rüzgarı ve Çam Uğultusu)
        mountainAreas: [
            "uçmakdere", "ganos", "bolu dağı", "zigana", "ovit", "kop", "ilgaz",
            "güzeldere", "sertavul", "toroslar", "palandöken", "erciyes"
        ]
    };

    // 2. ANA AKILLI ÇEVRE VE YOL MOTORU
    const SmartEnvironmentEngine = {
        currentEnv: "downtown", // coast, industry, mountain, downtown
        currentSurface: "asfalt", // asfalt, parke_tas, stabilize
        kasisDistance: null, // m
        kasisWarned: false,
        foghornTimer: null,

        /**
         * İl, ilçe veya durak adına göre ortam türünü belirler
         */
        detectEnvironment: function(cityName, districtName = "", stopName = "") {
            const city = cityName || "Tekirdağ";
            const dist = (districtName || "").toLowerCase();
            const stop = (stopName || "").toLowerCase();

            // 1. Dağlık kontrolü
            if (REGIONAL_ENVIRONMENTS.mountainAreas.some(m => dist.includes(m) || stop.includes(m))) {
                return "mountain";
            }

            // 2. Kıyı / Sahil kontrolü
            if (REGIONAL_ENVIRONMENTS.coastalDistricts.some(c => dist.includes(c) || stop.includes(c))) {
                return "coast";
            }
            if (REGIONAL_ENVIRONMENTS.coastal.includes(city) && (stop.includes("sahil") || stop.includes("liman") || stop.includes("iskele") || stop.includes("kordon") || stop.includes("marina") || stop.includes("plaj"))) {
                return "coast";
            }

            // 3. Sanayi kontrolü
            if (REGIONAL_ENVIRONMENTS.industrialDistricts.some(i => dist.includes(i) || stop.includes(i))) {
                return "industry";
            }

            // 4. Varsayılan Şehir Merkezi
            return "downtown";
        },

        /**
         * İlçe ve durağa göre yol zemin türünü belirler
         */
        detectRoadSurface: function(districtName = "", stopName = "", routeName = "") {
            const d = (districtName || "").toLowerCase();
            const s = (stopName || "").toLowerCase();
            const r = (routeName || "").toLowerCase();

            // Köy, yayla ve orman yolları -> Stabilize / Çakıl
            if (s.includes("köy") || s.includes("yayla") || s.includes("orman") || d.includes("uçmakdere") || s.includes("tarla")) {
                return "stabilize";
            }

            // Mahalle içi dar sokaklar, tarihi çarşılar -> Kilit Parke Taşı / Arnavut Kaldırımı
            if (s.includes("sokak") || s.includes("mahalle") || s.includes("çarşı") || s.includes("pazar") || s.includes("tarihi") || s.includes("yeşiltepe") || s.includes("kemalettin") || s.includes("sağlık mah")) {
                return "parke_tas";
            }

            // Ana caddeler, bulvarlar, çevre yolları ve otoyollar -> Asfalt
            return "asfalt";
        },

        /**
         * Çevre ambiyans seslerini güncelle (Freesound sesleri)
         */
        updateAmbience: function(envType, isDoorOrWindowOpen = false) {
            this.currentEnv = envType;

            if (typeof audio === 'undefined' || !audio.sounds) return;

            const isCoast = (envType === "coast");
            const isOpen = isDoorOrWindowOpen || (typeof audio.isWindowOpen === 'boolean' && audio.isWindowOpen);

            // 1. Sahil Dalga Ambiyansı (freesound_beach_shore.mp3)
            if (audio.sounds.beachShore) {
                if (isCoast) {
                    const targetVol = isOpen ? 0.45 : 0.18;
                    if (!audio.sounds.beachShore.playing()) {
                        audio.sounds.beachShore.volume(0);
                        audio.sounds.beachShore.play();
                    }
                    audio.sounds.beachShore.fade(audio.sounds.beachShore.volume(), targetVol, 1500);
                } else {
                    if (audio.sounds.beachShore.playing()) {
                        audio.sounds.beachShore.fade(audio.sounds.beachShore.volume(), 0, 1500);
                        setTimeout(() => { if (this.currentEnv !== 'coast' && audio.sounds.beachShore) audio.sounds.beachShore.pause(); }, 1550);
                    }
                }
            }

            // 2. Sahildeyken Periyodik Uzak Sis Düdüğü (freesound_distant_foghorn.mp3)
            if (isCoast && !this.foghornTimer) {
                this.foghornTimer = setInterval(() => {
                    if (this.currentEnv === 'coast' && Math.random() < 0.35 && audio.sounds && audio.sounds.distantFoghorn) {
                        try {
                            const id = audio.sounds.distantFoghorn.play();
                            audio.sounds.distantFoghorn.volume(isOpen ? 0.75 : 0.35, id);
                        } catch(e) {}
                    }
                }, 45000);
            } else if (!isCoast && this.foghornTimer) {
                clearInterval(this.foghornTimer);
                this.foghornTimer = null;
            }
        },

        /**
         * Yol Zemin Akustiğini Güncelle (Asfalt, Parke Taş, Çakıl)
         */
        updateSurfaceSound: function(surfaceType, speed = 0) {
            this.currentSurface = surfaceType;
            if (typeof audio === 'undefined' || !audio.sounds) return;

            const isOpen = (typeof audio.isWindowOpen === 'boolean') ? audio.isWindowOpen : false;
            const boost = isOpen ? 0.15 : 0;

            // Parke Taşı Tıkırtısı (freesound_road_joints_tikir.mp3 veya roadJointHit)
            if (surfaceType === 'parke_tas' && speed > 15) {
                if (audio.sounds.roadGravelAsphalt) {
                    const vol = Math.min(0.60, (speed / 70) * 0.45 + boost);
                    if (!audio.sounds.roadGravelAsphalt.playing()) audio.sounds.roadGravelAsphalt.play();
                    audio.sounds.roadGravelAsphalt.volume(vol);
                }
            } else {
                if (audio.sounds.roadGravelAsphalt && audio.sounds.roadGravelAsphalt.playing() && surfaceType !== 'stabilize') {
                    audio.sounds.roadGravelAsphalt.fade(audio.sounds.roadGravelAsphalt.volume(), 0, 500);
                }
            }
        },

        /**
         * Kasis Kontrolü ve 70m Sesli Uyarısı
         */
        handleKasisProgress: function(traveledMeters, speed, gameInstance) {
            if (this.kasisDistance === null) return;

            this.kasisDistance -= traveledMeters;

            // 70 metre kala sesli navigasyon ikazı
            if (this.kasisDistance <= 70 && this.kasisDistance > 0 && !this.kasisWarned) {
                this.kasisWarned = true;
                const warnMsg = "70 metre sonra hız kesici kasis var. Hızınızı yirmi beşe düşürünüz.";
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(warnMsg);
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast("⚠️ 70m Kasis Var (Azami Hız: 25 km/s)", "warning");
                }
            }

            // Kasisten Geçiş Anı (Mesafe 0 veya altı)
            if (this.kasisDistance <= 0) {
                this.executeKasisPass(speed, gameInstance);
                this.kasisDistance = null;
                this.kasisWarned = false;
            }
        },

        /**
         * Kasisten Geçiş Fiziği ve Süspansiyon Sesleri
         */
        executeKasisPass: function(speed, gameInstance) {
            // Ses Efekti: audio.playSpeedBump
            if (typeof audio !== 'undefined' && typeof audio.playSpeedBump === 'function') {
                audio.playSpeedBump(speed);
            }

            // Hız Analizi ve Yolcu / Araç Tepkisi
            if (speed <= 25) {
                // Mükemmel Yumuşak Geçiş
                if (gameInstance) {
                    gameInstance.passengerComfort = Math.min(100, (gameInstance.passengerComfort || 90) + 5);
                    gameInstance.addXP(10, "Kusursuz Kasis Geçişi");
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast("✨ Yumuşak Kasis Geçişi (+10 XP, +5 Konfor)", "success");
                }
            } else if (speed <= 40) {
                // Sert Geçiş: Yolcu Sarsıntısı
                if (gameInstance) {
                    gameInstance.passengerComfort = Math.max(20, (gameInstance.passengerComfort || 90) - 8);
                }
                if (typeof audio !== 'undefined' && typeof audio.playPassengerShock === 'function') {
                    audio.playPassengerShock();
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast("⚠️ Sert Kasis Geçişi (-8 Konfor)", "warning");
                }
            } else {
                // Aşırı Hızlı Geçiş: Egzoz ve Alt Sürtmesi Hasarı
                if (gameInstance) {
                    gameInstance.passengerComfort = Math.max(10, (gameInstance.passengerComfort || 90) - 20);
                    if (gameInstance.busDamage) {
                        gameInstance.busDamage.exhaust = Math.min(100, (gameInstance.busDamage.exhaust || 0) + 15);
                        gameInstance.busDamage.health = Math.max(10, (gameInstance.busDamage.health || 100) - 8);
                    }
                }
                if (typeof audio !== 'undefined' && typeof audio.playPassengerGroan === 'function') {
                    audio.playPassengerGroan();
                }
                const dmgMsg = "Kasise aşırı hızlı girdiniz! Alt takımı çok sert vurdunuz, egzoz hasar aldı.";
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(dmgMsg);
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast("🛑 ALT VURUNTUSU! Egzoz Hasar Aldı (-20 Konfor)", "error");
                }
            }
        },

        /**
         * Sesli Akıllı Çevre ve Zemin Raporu (Shift + Z Kısayolu)
         */
        speakSurfaceReport: function(game) {
            const city = (game && game.currentCity) || "Tekirdağ";
            const dist = (game && game.activeDistrict) || "";
            const locStr = dist ? `${city} / ${dist}` : city;

            let envDesc = "Şehir içi yerleşim bölgesi";
            if (this.currentEnv === "coast") envDesc = "Marmara kıyı şeridi (Liman ve deniz dalga akustiği aktif)";
            else if (this.currentEnv === "industry") envDesc = "Sanayi ve üretim koridoru (Fabrika ve demiryolu yankısı)";
            else if (this.currentEnv === "mountain") envDesc = "Dağ ve vadi geçidi (Rüzgar uğultusu)";

            let surfaceDesc = "Sıcak Asfalt Kaplama";
            if (this.currentSurface === "parke_tas") surfaceDesc = "Kilit Parke Taşı (Arnavut Kaldırımı)";
            else if (this.currentSurface === "stabilize") surfaceDesc = "Stabilize Çakıl Zemin";

            let kasisDesc = "Yakın mesafede kasis tespit edilmedi.";
            if (this.kasisDistance !== null && this.kasisDistance > 0) {
                kasisDesc = `Yaklaşan hız kesici kasis: Yaklaşık ${Math.round(this.kasisDistance)} metre sonra. Azami geçiş hızı 25 kilometre.`;
            }

            const speech = `Akıllı Çevre Raporu: ${locStr}. Bölge ortamı: ${envDesc}. Yol zemini: ${surfaceDesc}. ${kasisDesc}`;

            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(speech);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(speech);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`🛣️ ${surfaceDesc} | 📍 ${envDesc.split('(')[0]}`, 'info');
            }
        }
    };

    window.SmartEnvironmentEngine = SmartEnvironmentEngine;

})(typeof window !== 'undefined' ? window : globalThis);

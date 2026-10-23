/* ==========================================================================
   TÜRKİYE GERÇEK COĞRAFYA VE TOPOĞRAFYA MOTORU (TURKEY GEOGRAPHY ENGINE)
   Harita Genel Müdürlüğü (HGM), Karayolları Genel Müdürlüğü (KGM) ve
   Meteoroloji Genel Müdürlüğü (MGM) resmî verileriyle hazırlanmıştır.
   - 81 İl Resmî Deniz Seviyesi Rakımları (0m - 1890m)
   - Tescilli Karayolu Rampa ve Eğim Profili (% Eğim Yerçekimi Fiziği)
   - Resmî Tünel ve Viyadük Envanteri (Metre Bazında Gerçek Uzunluklar)
   - Balata Isınması (Brake Fade) ve Kademeli Retarder Entegrasyonu
   ========================================================================== */

(function(window) {
    'use strict';

    // 1. TÜRKİYE 81 İL RESMÎ RAKIM VE COĞRAFİ BÖLGE VERİTABANI (HGM)
    const TURKEY_PROVINCES_ALTITUDE = {
        "Adana": { altitude: 23, region: "Akdeniz", terrain: "asfalt" },
        "Adıyaman": { altitude: 669, region: "Güneydoğu Anadolu", terrain: "asfalt" },
        "Afyonkarahisar": { altitude: 1034, region: "Ege", terrain: "asfalt" },
        "Ağrı": { altitude: 1632, region: "Doğu Anadolu", terrain: "dag" },
        "Amasya": { altitude: 411, region: "Karadeniz", terrain: "asfalt" },
        "Ankara": { altitude: 938, region: "İç Anadolu", terrain: "asfalt" },
        "Antalya": { altitude: 30, region: "Akdeniz", terrain: "sahil" },
        "Artvin": { altitude: 500, region: "Karadeniz", terrain: "dag" },
        "Aydın": { altitude: 65, region: "Ege", terrain: "asfalt" },
        "Balıkesir": { altitude: 145, region: "Marmara", terrain: "asfalt" },
        "Bilecik": { altitude: 513, region: "Marmara", terrain: "asfalt" },
        "Bingöl": { altitude: 1151, region: "Doğu Anadolu", terrain: "dag" },
        "Bitlis": { altitude: 1545, region: "Doğu Anadolu", terrain: "dag" },
        "Bolu": { altitude: 726, region: "Karadeniz", terrain: "dag" },
        "Burdur": { altitude: 950, region: "Akdeniz", terrain: "asfalt" },
        "Bursa": { altitude: 155, region: "Marmara", terrain: "asfalt" },
        "Çanakkale": { altitude: 10, region: "Marmara", terrain: "sahil" },
        "Çankırı": { altitude: 730, region: "İç Anadolu", terrain: "asfalt" },
        "Çorum": { altitude: 801, region: "Karadeniz", terrain: "asfalt" },
        "Denizli": { altitude: 354, region: "Ege", terrain: "asfalt" },
        "Diyarbakır": { altitude: 675, region: "Güneydoğu Anadolu", terrain: "asfalt" },
        "Edirne": { altitude: 41, region: "Marmara", terrain: "asfalt" },
        "Elazığ": { altitude: 1067, region: "Doğu Anadolu", terrain: "asfalt" },
        "Erzincan": { altitude: 1185, region: "Doğu Anadolu", terrain: "dag" },
        "Erzurum": { altitude: 1890, region: "Doğu Anadolu", terrain: "kar" }, // En yüksek büyükşehir
        "Eskişehir": { altitude: 792, region: "İç Anadolu", terrain: "asfalt" },
        "Gaziantep": { altitude: 850, region: "Güneydoğu Anadolu", terrain: "asfalt" },
        "Giresun": { altitude: 10, region: "Karadeniz", terrain: "sahil" },
        "Gümüşhane": { altitude: 1210, region: "Karadeniz", terrain: "dag" },
        "Hakkâri": { altitude: 1720, region: "Doğu Anadolu", terrain: "dag" },
        "Hatay": { altitude: 85, region: "Akdeniz", terrain: "asfalt" },
        "Isparta": { altitude: 1035, region: "Akdeniz", terrain: "asfalt" },
        "Mersin": { altitude: 10, region: "Akdeniz", terrain: "sahil" },
        "İstanbul": { altitude: 40, region: "Marmara", terrain: "asfalt" },
        "İzmir": { altitude: 5, region: "Ege", terrain: "sahil" },
        "Kars": { altitude: 1768, region: "Doğu Anadolu", terrain: "kar" },
        "Kastamonu": { altitude: 775, region: "Karadeniz", terrain: "dag" },
        "Kayseri": { altitude: 1050, region: "İç Anadolu", terrain: "asfalt" },
        "Kırklareli": { altitude: 203, region: "Marmara", terrain: "asfalt" },
        "Kırşehir": { altitude: 985, region: "İç Anadolu", terrain: "asfalt" },
        "Kocaeli": { altitude: 15, region: "Marmara", terrain: "asfalt" },
        "Konya": { altitude: 1016, region: "İç Anadolu", terrain: "asfalt" },
        "Kütahya": { altitude: 970, region: "Ege", terrain: "asfalt" },
        "Malatya": { altitude: 964, region: "Doğu Anadolu", terrain: "asfalt" },
        "Manisa": { altitude: 62, region: "Ege", terrain: "asfalt" },
        "Kahramanmaraş": { altitude: 568, region: "Akdeniz", terrain: "asfalt" },
        "Mardin": { altitude: 1083, region: "Güneydoğu Anadolu", terrain: "asfalt" },
        "Muğla": { altitude: 660, region: "Ege", terrain: "asfalt" },
        "Muş": { altitude: 1334, region: "Doğu Anadolu", terrain: "dag" },
        "Nevşehir": { altitude: 1224, region: "İç Anadolu", terrain: "asfalt" },
        "Niğde": { altitude: 1229, region: "İç Anadolu", terrain: "asfalt" },
        "Ordu": { altitude: 5, region: "Karadeniz", terrain: "sahil" },
        "Rize": { altitude: 10, region: "Karadeniz", terrain: "sahil" },
        "Sakarya": { altitude: 31, region: "Marmara", terrain: "asfalt" },
        "Samsun": { altitude: 20, region: "Karadeniz", terrain: "sahil" },
        "Siirt": { altitude: 895, region: "Güneydoğu Anadolu", terrain: "dag" },
        "Sinop": { altitude: 25, region: "Karadeniz", terrain: "sahil" },
        "Sivas": { altitude: 1285, region: "İç Anadolu", terrain: "asfalt" },
        "Tekirdağ": { altitude: 10, region: "Marmara", terrain: "sahil" },
        "Tokat": { altitude: 623, region: "Karadeniz", terrain: "asfalt" },
        "Trabzon": { altitude: 30, region: "Karadeniz", terrain: "sahil" },
        "Tunceli": { altitude: 981, region: "Doğu Anadolu", terrain: "dag" },
        "Şanlıurfa": { altitude: 518, region: "Güneydoğu Anadolu", terrain: "asfalt" },
        "Uşak": { altitude: 907, region: "Ege", terrain: "asfalt" },
        "Van": { altitude: 1727, region: "Doğu Anadolu", terrain: "dag" },
        "Yozgat": { altitude: 1300, region: "İç Anadolu", terrain: "asfalt" },
        "Zonguldak": { altitude: 25, region: "Karadeniz", terrain: "sahil" },
        "Aksaray": { altitude: 980, region: "İç Anadolu", terrain: "asfalt" },
        "Bayburt": { altitude: 1555, region: "Karadeniz", terrain: "dag" },
        "Karaman": { altitude: 1033, region: "İç Anadolu", terrain: "asfalt" },
        "Kırıkkale": { altitude: 718, region: "İç Anadolu", terrain: "asfalt" },
        "Batman": { altitude: 550, region: "Güneydoğu Anadolu", terrain: "asfalt" },
        "Şırnak": { altitude: 1400, region: "Güneydoğu Anadolu", terrain: "dag" },
        "Bartın": { altitude: 25, region: "Karadeniz", terrain: "asfalt" },
        "Ardahan": { altitude: 1829, region: "Doğu Anadolu", terrain: "kar" },
        "Iğdır": { altitude: 850, region: "Doğu Anadolu", terrain: "asfalt" },
        "Yalova": { altitude: 10, region: "Marmara", terrain: "sahil" },
        "Karabük": { altitude: 280, region: "Karadeniz", terrain: "asfalt" },
        "Kilis": { altitude: 660, region: "Güneydoğu Anadolu", terrain: "asfalt" },
        "Osmaniye": { altitude: 125, region: "Akdeniz", terrain: "asfalt" },
        "Düzce": { altitude: 160, region: "Karadeniz", terrain: "asfalt" }
    };

    // 2. TÜRKİYE TESCİLLİ KARAYOLU DAĞ GEÇİTLERİ VE EĞİM ORANLARI (KGM)
    const TURKEY_HIGHWAY_PASSES_GRADIENTS = {
        "Güzeldere": { name: "Güzeldere Geçidi (32 Virajlar)", altitude: 2730, slopePct: 11.0, province: "Van", highway: "D-975" },
        "Ovit": { name: "Ovit Dağı Zirvesi", altitude: 2640, slopePct: 8.5, province: "Rize", highway: "D-925" },
        "Kop": { name: "Kop Dağı Geçidi", altitude: 2409, slopePct: 7.8, province: "Bayburt", highway: "D-915" },
        "Derebaşı": { name: "Derebaşı / Soğanlı Geçidi", altitude: 2330, slopePct: 12.5, province: "Trabzon", highway: "D-915" },
        "Kuskunkıran": { name: "Kuskunkıran Geçidi", altitude: 2234, slopePct: 7.2, province: "Van", highway: "D-300" },
        "Erciyes": { name: "Erciyes Tekir Yaylası", altitude: 2215, slopePct: 7.0, province: "Kayseri", highway: "38-50" },
        "Kızıldağ": { name: "Kızıldağ Geçidi", altitude: 2190, slopePct: 6.2, province: "Sivas", highway: "D-100" },
        "Zigana": { name: "Tarihi Zigana Geçidi", altitude: 2032, slopePct: 8.2, province: "Trabzon", highway: "D-885" },
        "Ilgaz": { name: "Ilgaz Dağı Geçidi", altitude: 1875, slopePct: 7.2, province: "Kastamonu", highway: "D-765" },
        "Alacabel": { name: "Alacabel Toroslar Geçidi", altitude: 1825, slopePct: 7.5, province: "Konya", highway: "D-695" },
        "Sertavul": { name: "Sertavul Geçidi", altitude: 1650, slopePct: 8.0, province: "Karaman", highway: "D-715" },
        "Çamlıbel": { name: "Çamlıbel Dağ Geçidi", altitude: 1650, slopePct: 6.5, province: "Tokat", highway: "D-850" },
        "Elmadağ": { name: "Elmadağ Rampaları", altitude: 1150, slopePct: 6.8, province: "Ankara", highway: "D-200" },
        "Ahmetusta": { name: "Ahmetusta Dağ Geçidi", altitude: 1030, slopePct: 7.0, province: "Karabük", highway: "D-755" },
        "Bolu": { name: "Bolu Dağı Karanlıkdere Rampası", altitude: 900, slopePct: 7.5, province: "Bolu", highway: "D-100" },
        "Sabuncubeli": { name: "Sabuncubeli Rampası", altitude: 580, slopePct: 9.0, province: "İzmir", highway: "D-565" },
        "Sakar": { name: "Sakar Geçidi Gökova İnişi", altitude: 670, slopePct: 9.5, province: "Muğla", highway: "D-550" },
        "Belen": { name: "Belen Geçidi", altitude: 660, slopePct: 6.5, province: "Hatay", highway: "D-817" },
        "Cankurtaran": { name: "Cankurtaran Dağ Geçidi", altitude: 690, slopePct: 7.5, province: "Artvin", highway: "D-010" },
        "Uçmakdere": { name: "Ganos Uçmakdere Rampası", altitude: 320, slopePct: 8.5, province: "Tekirdağ", highway: "59-52" }
    };

    // 3. TÜRKİYE RESMÎ KARAYOLU TÜNEL ENVANTERİ (KGM)
    const TURKEY_HIGHWAY_TUNNELS = [
        { id: "yeni_zigana", name: "Yeni Zigana Tüneli", length: 14476, highway: "D-885", provinces: ["Trabzon", "Gümüşhane"] },
        { id: "ovit", name: "Ovit Dağı Tüneli", length: 14346, highway: "D-925", provinces: ["Rize", "Erzurum"] },
        { id: "egribel", name: "Eğribel Tüneli", length: 5900, highway: "D-865", provinces: ["Giresun"] },
        { id: "ilgaz_istiklal", name: "Ilgaz 15 Temmuz İstiklal Tüneli", length: 5488, highway: "D-765", provinces: ["Kastamonu", "Çankırı"] },
        { id: "avrasya", name: "Avrasya Tüneli (Boğaz Denizaltı)", length: 5400, highway: "D-100", provinces: ["İstanbul"] },
        { id: "cankurtaran_tunel", name: "Cankurtaran Tüneli", length: 5228, highway: "D-010", provinces: ["Artvin"] },
        { id: "salmankas", name: "Salmankaş Şehit Hamit Fendoğlu Tüneli", length: 4150, highway: "D-915", provinces: ["Trabzon", "Bayburt"] },
        { id: "sabuncubeli_tunel", name: "Sabuncubeli Tüneli", length: 4070, highway: "D-565", provinces: ["İzmir", "Manisa"] },
        { id: "nefise_akcelik", name: "Nefise Akçelik Karadeniz Tüneli", length: 3820, highway: "D-010", provinces: ["Ordu"] },
        { id: "bolu_dagi_tuneli", name: "Bolu Dağı Tüneli", length: 3125, highway: "O-4 / E80", provinces: ["Bolu", "Düzce"] },
        { id: "guzeldere_tuneli", name: "Güzeldere Tüneli", length: 3150, highway: "D-975", provinces: ["Van", "Hakkari"] },
        { id: "kuskunkiran_tuneli", name: "Kuskunkıran Tüneli", length: 2306, highway: "D-300", provinces: ["Van", "Bitlis"] },
        { id: "erkenek", name: "Erkenek Tüneli", length: 1816, highway: "D-850", provinces: ["Malatya", "Adıyaman"] },
        { id: "amasra_tuneli", name: "Amasra Tarihi Tüneli", length: 1100, highway: "D-010", provinces: ["Bartın"] },
        { id: "kas_kalkan_tunel", name: "Kaş - Kalkan Sahil Tünelleri", length: 1200, highway: "D-400", provinces: ["Antalya"] }
    ];

    // 4. TÜRKİYE RESMÎ ASMA KÖPRÜ VE VİYADÜK ENVANTERİ (KGM)
    const TURKEY_HIGHWAY_BRIDGES = [
        { id: "canakkale_1915", name: "1915 Çanakkale Köprüsü", length: 4608, highway: "O-6", provinces: ["Çanakkale"], crosswindIntensity: 3.5 },
        { id: "osmangazi", name: "Osmangazi Asma Köprüsü", length: 2682, highway: "O-5", provinces: ["Kocaeli", "Yalova"], crosswindIntensity: 3.0 },
        { id: "yss_koprusu", name: "Yavuz Sultan Selim Köprüsü", length: 2164, highway: "O-7", provinces: ["İstanbul"], crosswindIntensity: 3.2 },
        { id: "bogazici", name: "15 Temmuz Şehitler Köprüsü", length: 1560, highway: "O-1", provinces: ["İstanbul"], crosswindIntensity: 2.5 },
        { id: "fsm_koprusu", name: "Fatih Sultan Mehmet Köprüsü", length: 1510, highway: "O-2", provinces: ["İstanbul"], crosswindIntensity: 2.5 },
        { id: "begendik_botan", name: "Botan Çayı Beğendik Köprüsü (165m Ayak Yüksekliği)", length: 450, highway: "56-02", provinces: ["Siirt", "Bitlis"], crosswindIntensity: 4.0 },
        { id: "komurhan", name: "Tarihi Kömürhan Köprüsü & Viyadüğü", length: 660, highway: "D-300", provinces: ["Elazığ", "Malatya"], crosswindIntensity: 2.8 },
        { id: "birecik_firat", name: "Birecik Fırat Asma Köprüsü", length: 530, highway: "D-400", provinces: ["Şanlıurfa", "Gaziantep"], crosswindIntensity: 2.2 },
        { id: "ergene_viyaduk", name: "Ergene Otoyol Viyadüğü", length: 1320, highway: "O-3", provinces: ["Tekirdağ"], crosswindIntensity: 2.0 }
    ];

    // 5. ANA COĞRAFYA VE TOPOĞRAFYA MOTORU
    const TurkeyGeographyEngine = {
        provincesAltitude: TURKEY_PROVINCES_ALTITUDE,
        passesGradients: TURKEY_HIGHWAY_PASSES_GRADIENTS,
        tunnels: TURKEY_HIGHWAY_TUNNELS,
        bridges: TURKEY_HIGHWAY_BRIDGES,

        // Durum Değişkenleri
        currentAltitude: 10,       // m
        currentSlopePct: 0.0,      // % (+ tırmanış, - iniş)
        brakeTemperature: 60.0,    // °C (Normal çalışma: 50-150°C, Şişme: 260°C+)
        isBrakeOverheated: false,

        /**
         * Verilen il ve ilçenin gerçek rakımını getirir
         */
        getAltitudeForLocation: function(cityName, districtName = "") {
            if (!cityName) return 10;
            const prov = TURKEY_PROVINCES_ALTITUDE[cityName];
            let baseAlt = prov ? prov.altitude : 10;
            
            // Eğer ilçe dağlık veya özel ise ufak kalibrasyon
            const distLower = (districtName || "").toLowerCase();
            if (distLower.includes("şarköy") || distLower.includes("mürefte")) baseAlt = 15;
            else if (distLower.includes("kumbağ") || distLower.includes("sahil")) baseAlt = 5;
            else if (distLower.includes("başkale")) baseAlt = 2400;
            else if (distLower.includes("maçka")) baseAlt = 360;
            else if (distLower.includes("çorlu")) baseAlt = 180;
            else if (distLower.includes("saray")) baseAlt = 160;
            else if (distLower.includes("malkara")) baseAlt = 230;

            return baseAlt;
        },

        /**
         * Rota üzerindeki anlık eğimi ve rakım değişimini hesaplar
         */
        getInclineForSegment: function(cityName, fromStop, toStop, traveledRatio = 0, routeName = "") {
            const city = cityName || "Tekirdağ";
            let alt1 = this.getAltitudeForLocation(city, fromStop ? fromStop.name : "");
            let alt2 = this.getAltitudeForLocation(city, toStop ? toStop.name : "");

            // Rota üzerindeki meşhur dağ geçitlerini tara
            const rNameLower = ((routeName || "") + " " + (fromStop ? fromStop.name : "") + " " + (toStop ? toStop.name : "")).toLowerCase();
            let matchedPass = null;

            for (let key in TURKEY_HIGHWAY_PASSES_GRADIENTS) {
                if (rNameLower.includes(key.toLowerCase())) {
                    matchedPass = TURKEY_HIGHWAY_PASSES_GRADIENTS[key];
                    break;
                }
            }

            let slopePct = 0;
            let currentAlt = alt1;

            if (matchedPass) {
                // Tescilli geçidin gerçek eğimini ve rakımını uygula
                currentAlt = Math.round(alt1 + (matchedPass.altitude - alt1) * Math.sin(traveledRatio * Math.PI));
                // Rampanın ilk yarısı tırmanış (+), ikinci yarısı iniş (-)
                slopePct = (traveledRatio < 0.5) ? matchedPass.slopePct : -matchedPass.slopePct;
            } else {
                // Şehir içi ve düz yol topoğrafik eğimi
                const altDiff = alt2 - alt1;
                currentAlt = Math.round(alt1 + altDiff * traveledRatio);
                slopePct = Math.max(-6.0, Math.min(6.0, (altDiff / 1000) * 4));
            }

            this.currentAltitude = currentAlt;
            this.currentSlopePct = parseFloat(slopePct.toFixed(1));

            return {
                altitude: currentAlt,
                slopePct: this.currentSlopePct,
                passName: matchedPass ? matchedPass.name : null,
                isClimb: this.currentSlopePct > 1.5,
                isDescent: this.currentSlopePct < -1.5
            };
        },

        /**
         * Rota üzerinde tescilli gerçek KGM tüneli var mı kontrol eder
         */
        getTunnelForRoute: function(cityName, routeName = "", fromStop = "", toStop = "") {
            const combined = ((cityName || "") + " " + (routeName || "") + " " + (fromStop || "") + " " + (toStop || "")).toLowerCase();
            
            for (let tunnel of TURKEY_HIGHWAY_TUNNELS) {
                const matchProv = tunnel.provinces.some(p => combined.includes(p.toLowerCase()));
                const matchName = combined.includes(tunnel.id) || combined.includes(tunnel.name.toLowerCase());
                if (matchProv && matchName) {
                    return tunnel;
                }
            }
            return null;
        },

        /**
         * Rota üzerinde tescilli gerçek KGM asma köprüsü veya viyadüğü var mı kontrol eder
         */
        getBridgeForRoute: function(cityName, routeName = "", fromStop = "", toStop = "") {
            const combined = ((cityName || "") + " " + (routeName || "") + " " + (fromStop || "") + " " + (toStop || "")).toLowerCase();

            for (let bridge of TURKEY_HIGHWAY_BRIDGES) {
                const matchProv = bridge.provinces.some(p => combined.includes(p.toLowerCase()));
                const matchName = combined.includes(bridge.id) || combined.includes(bridge.name.toLowerCase());
                if (matchProv && matchName) {
                    return bridge;
                }
            }
            return null;
        },

        /**
         * Eğim Yerçekimi ve Balata Isınması Fiziği
         * Newton: a = g * sin(theta) ≈ g * (slope / 100)
         * @param {number} currentSpeed Araç hızı (km/s)
         * @param {number} slopePct Yol eğimi (%)
         * @param {number} deltaTime Geçen süre (s)
         * @param {boolean} isFootBraking Ayak frenine basılıyor mu?
         * @param {number} retarderLevel Retarder kademesi (0-5)
         */
        calculateInclinePhysics: function(currentSpeed, slopePct, deltaTime, isFootBraking = false, retarderLevel = 0) {
            // Eğim ivmesi (km/s / saniye)
            // + eğim (tırmanış) hızı düşürür (-), - eğim (iniş) hızı artırır (+)
            const gravityAccelKmh = -(slopePct / 100) * 9.81 * 3.6;
            let speedDelta = gravityAccelKmh * deltaTime;

            // Motor Tırmanış Yükü & Yakıt Faktörü
            let engineLoadFactor = 1.0;
            if (slopePct > 0) {
                engineLoadFactor = 1.0 + (slopePct * 0.12); // Her %1 eğim motor yakıt tüketimini %12 artırır
            }

            // Balata Isınması ve Şişmesi (Brake Fade) Fiziği
            // İnişte sürekli ayak freni yapılırsa diskler 260°C'yi aşar ve fren tutmaz!
            if (isFootBraking && currentSpeed > 10) {
                if (slopePct < -3.0) {
                    // Dik inişte yoğun sürtünme
                    this.brakeTemperature += Math.abs(slopePct) * 1.8 * deltaTime;
                } else {
                    this.brakeTemperature += 0.8 * deltaTime;
                }
            } else {
                // Fren bırakılınca veya retarder kullanılınca balatalar hava akımıyla soğur
                const coolingRate = (currentSpeed > 30) ? 2.5 : 1.2;
                this.brakeTemperature = Math.max(50.0, this.brakeTemperature - coolingRate * deltaTime);
            }

            // Retarder balataları korur (soğutma desteği sağlar)
            if (retarderLevel > 0) {
                this.brakeTemperature = Math.max(50.0, this.brakeTemperature - (retarderLevel * 1.5) * deltaTime);
            }

            // Fren Şişmesi Durumu (260°C üzeri tehlike)
            this.isBrakeOverheated = this.brakeTemperature >= 260.0;
            const brakeEfficiency = this.isBrakeOverheated ? Math.max(0.35, 1.0 - ((this.brakeTemperature - 260) / 100)) : 1.0;

            return {
                speedDelta: speedDelta,
                engineLoadFactor: engineLoadFactor,
                brakeTemperature: Math.round(this.brakeTemperature),
                isBrakeOverheated: this.isBrakeOverheated,
                brakeEfficiency: brakeEfficiency
            };
        }
    };

    // Global nesneye bağla
    window.TURKEY_PROVINCES_ALTITUDE = TURKEY_PROVINCES_ALTITUDE;
    window.TURKEY_HIGHWAY_PASSES_GRADIENTS = TURKEY_HIGHWAY_PASSES_GRADIENTS;
    window.TURKEY_HIGHWAY_TUNNELS = TURKEY_HIGHWAY_TUNNELS;
    window.TURKEY_HIGHWAY_BRIDGES = TURKEY_HIGHWAY_BRIDGES;
    window.TurkeyGeographyEngine = TurkeyGeographyEngine;

})(typeof window !== 'undefined' ? window : globalThis);

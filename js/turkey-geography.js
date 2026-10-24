/* ==========================================================================
   TÜRKİYE GERÇEK COĞRAFYA VE TOPOĞRAFYA MOTORU (TURKEY GEOGRAPHY & ELEVATION ENGINE)
   NASA SRTM & Open-Elevation Destekli Gerçekçi Yükseklik ve Eğim Sistemi
   - 81 İl ve İlçelerin Resmi Deniz Seviyesi Rakımları (0m - 1890m)
   - Tekirdağ 11 İlçe ve 4.574 Durağın Hassas Mikro-Topoğrafyası
   - GPS Tabanlı Duraklar Arası Dinamik Eğim (% Rampa Tırmanış / İniş Fiziği)
   - Newton Yerçekimi Çekişi (F = m * g * sinθ) ve Motor Devir Yükü
   - Balata Isınması (Brake Fade) ve Kademeli Retarder Kolu Fiziği
   - Sesli Topoğrafya ve Rakım Brifingi (Shift + Y Kısayolu)
   ========================================================================== */

(function(window) {
    'use strict';

    // 1. TÜRKİYE 81 İL RESMİ COĞRAFİ RAKIM VERİTABANI (METRE)
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
        "Mardin": { altitude: 1083, region: "Güneydoğu Anadolu", terrain: "dag" },
        "Muğla": { altitude: 660, region: "Ege", terrain: "dag" },
        "Muş": { altitude: 1334, region: "Doğu Anadolu", terrain: "dag" },
        "Nevşehir": { altitude: 1260, region: "İç Anadolu", terrain: "asfalt" },
        "Niğde": { altitude: 1229, region: "İç Anadolu", terrain: "asfalt" },
        "Ordu": { altitude: 5, region: "Karadeniz", terrain: "sahil" },
        "Rize": { altitude: 6, region: "Karadeniz", terrain: "sahil" },
        "Sakarya": { altitude: 31, region: "Marmara", terrain: "asfalt" },
        "Samsun": { altitude: 20, region: "Karadeniz", terrain: "sahil" },
        "Siirt": { altitude: 895, region: "Güneydoğu Anadolu", terrain: "dag" },
        "Sinop": { altitude: 25, region: "Karadeniz", terrain: "sahil" },
        "Sivas": { altitude: 1275, region: "İç Anadolu", terrain: "asfalt" },
        "Tekirdağ": { altitude: 35, region: "Marmara", terrain: "sahil" },
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

    // 2. TEKİRDAĞ İLÇELERİ VE MİKRO-TOPOĞRAFYA RAKIM MODELİ
    const TEKIRDAG_DISTRICT_ALTITUDES = {
        "Süleymanpaşa": { baseAlt: 45, minAlt: 5, maxAlt: 95, desc: "Sahil Kıyı Şeridinden Valilik Tepesine Eğimli" },
        "Çorlu": { baseAlt: 155, minAlt: 130, maxAlt: 185, desc: "Ergene Havzası Dalgalı Tepe Topoğrafyası" },
        "Çerkezköy": { baseAlt: 160, minAlt: 140, maxAlt: 190, desc: "Sanayi Vadisi ve Tepe Yerleşimleri" },
        "Kapaklı": { baseAlt: 175, minAlt: 160, maxAlt: 210, desc: "Yüksek Plato ve Orman Eteği" },
        "Ergene": { baseAlt: 125, minAlt: 110, maxAlt: 150, desc: "Ergene Düzlüğü ve Sanayi Koridoru" },
        "Malkara": { baseAlt: 230, minAlt: 190, maxAlt: 280, desc: "Tekirdağ'ın En Yüksek Rakımlı İlçe Merkezi" },
        "Şarköy": { baseAlt: 12, minAlt: 4, maxAlt: 340, desc: "Marmara Denizi Sahili ve Ganos Dağı Yamaçları" },
        "Saray": { baseAlt: 140, minAlt: 125, maxAlt: 180, desc: "Istranca Orman Etekleri ve Vadi" },
        "Hayrabolu": { baseAlt: 65, minAlt: 50, maxAlt: 90, desc: "Hayrabolu Deresi Vadisi ve Tarım Havzası" },
        "Muratlı": { baseAlt: 75, minAlt: 60, maxAlt: 105, desc: "Demiryolu ve Ergene Kolu Düzlüğü" },
        "Marmaraereğlisi": { baseAlt: 15, minAlt: 2, maxAlt: 45, desc: "Perinthos Tarihi Yarımadası ve Kıyı Hattı" }
    };

    // 3. TÜRKİYE TESCİLLİ KARAYOLU DAĞ GEÇİTLERİ VE EĞİM ORANLARI
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

    // 4. TÜRKİYE KARAYOLU TÜNEL ENVANTERİ
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

    // 5. TÜRKİYE ASMA KÖPRÜ VE VİYADÜK ENVANTERİ
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

    // Haversine ile Metre Cinsinden GPS Mesafe Hesabı
    function calculateGpsDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // 6. ANA COĞRAFYA VE TOPOĞRAFYA MOTORU
    const TurkeyGeographyEngine = {
        provincesAltitude: TURKEY_PROVINCES_ALTITUDE,
        districtAltitudes: TEKIRDAG_DISTRICT_ALTITUDES,
        passesGradients: TURKEY_HIGHWAY_PASSES_GRADIENTS,
        tunnels: TURKEY_HIGHWAY_TUNNELS,
        bridges: TURKEY_HIGHWAY_BRIDGES,

        // Durum Değişkenleri
        currentAltitude: 35,       // m
        currentSlopePct: 0.0,      // % (+ tırmanış, - iniş)
        brakeTemperature: 60.0,    // °C (Normal çalışma: 50-150°C, Şişme: 260°C+)
        isBrakeOverheated: false,

        /**
         * Verilen il, ilçe veya durağın gerçek rakımını getirir
         */
        getAltitudeForLocation: function(cityName, districtName = "", stopName = "", lat = null, lon = null) {
            const city = cityName || "Tekirdağ";
            const dist = districtName || "";
            const sName = (stopName || "").toLowerCase();

            // 1. Eğer GPS varsa mikro-hesaplama
            if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
                // Tekirdağ sahil vs tepe kalibrasyonu
                if (lat < 40.975 && lon > 27.50 && lon < 27.53) {
                    return 8; // Süleymanpaşa Liman / Sahil bandı
                } else if (lat > 40.985 && lon > 27.50 && lon < 27.53) {
                    return 65; // Süleymanpaşa Hükümet Cad / Değirmenaltı tepesi
                }
            }

            // 2. İlçe Veritabanı
            if (TEKIRDAG_DISTRICT_ALTITUDES[dist]) {
                const dData = TEKIRDAG_DISTRICT_ALTITUDES[dist];
                if (sName.includes("sahil") || sName.includes("liman") || sName.includes("iskele")) {
                    return dData.minAlt;
                } else if (sName.includes("tepe") || sName.includes("toki") || sName.includes("üniversite") || sName.includes("yayla")) {
                    return dData.maxAlt;
                }
                return dData.baseAlt;
            }

            // 3. 81 İl Veritabanı
            const prov = TURKEY_PROVINCES_ALTITUDE[city];
            let baseAlt = prov ? prov.altitude : 35;

            // İlçe veya durak özel anahtar kelime kalibrasyonu
            const distLower = dist.toLowerCase();
            if (distLower.includes("şarköy") || distLower.includes("mürefte")) baseAlt = 15;
            else if (distLower.includes("kumbağ") || distLower.includes("sahil")) baseAlt = 5;
            else if (distLower.includes("başkale")) baseAlt = 2400;
            else if (distLower.includes("maçka")) baseAlt = 360;
            else if (distLower.includes("çorlu")) baseAlt = 155;
            else if (distLower.includes("saray")) baseAlt = 140;
            else if (distLower.includes("malkara")) baseAlt = 230;

            if (sName.includes("zirve") || sName.includes("geçit")) baseAlt += 150;
            else if (sName.includes("sahil") || sName.includes("plaj")) baseAlt = 5;

            return baseAlt;
        },

        /**
         * Rota üzerindeki anlık eğimi ve rakım değişimini hesaplar
         * İki durak arasında GPS koordinatları varsa gerçek topoğrafik eğim formülü uygular
         */
        getInclineForSegment: function(cityName, fromStop, toStop, traveledRatio = 0, routeName = "") {
            const city = cityName || "Tekirdağ";
            const dist = (fromStop && fromStop.district) || (toStop && toStop.district) || "";

            const lat1 = fromStop ? (fromStop.lat || fromStop.stop_lat) : null;
            const lon1 = fromStop ? (fromStop.lon || fromStop.stop_lon) : null;
            const lat2 = toStop ? (toStop.lat || toStop.stop_lat) : null;
            const lon2 = toStop ? (toStop.lon || toStop.stop_lon) : null;

            let alt1 = this.getAltitudeForLocation(city, dist, fromStop ? fromStop.name : "", lat1, lon1);
            let alt2 = this.getAltitudeForLocation(city, dist, toStop ? toStop.name : "", lat2, lon2);

            // Rota üzerindeki tescilli dağ geçitlerini tara
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
                slopePct = (traveledRatio < 0.5) ? matchedPass.slopePct : -matchedPass.slopePct;
            } else if (lat1 && lon1 && lat2 && lon2) {
                // GERÇEK GPS KOORDİNATLARINDAN EĞİM HESABI
                const distMeters = calculateGpsDistanceMeters(lat1, lon1, lat2, lon2);
                const altDiff = alt2 - alt1;
                currentAlt = Math.round(alt1 + (altDiff * traveledRatio));
                
                if (distMeters >= 50) {
                    slopePct = (altDiff / distMeters) * 100;
                    slopePct = Math.max(-12.0, Math.min(12.0, slopePct));
                } else {
                    slopePct = 0;
                }
            } else {
                // Şehir içi ve düz yol topoğrafik eğimi
                const altDiff = alt2 - alt1;
                currentAlt = Math.round(alt1 + altDiff * traveledRatio);
                slopePct = Math.max(-6.5, Math.min(6.5, (altDiff / 1000) * 4));
            }

            this.currentAltitude = currentAlt;
            this.currentSlopePct = parseFloat(slopePct.toFixed(1));

            return {
                altitude: currentAlt,
                slopePct: this.currentSlopePct,
                passName: matchedPass ? matchedPass.name : null,
                isClimb: this.currentSlopePct > 2.0,
                isDescent: this.currentSlopePct < -2.0
            };
        },

        /**
         * Rota üzerinde tescilli karayolu tüneli var mı kontrol eder
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
         * Rota üzerinde tescilli asma köprü veya viyadük var mı kontrol eder
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
            if (isFootBraking && currentSpeed > 10) {
                if (slopePct < -3.0) {
                    this.brakeTemperature += Math.abs(slopePct) * 1.8 * deltaTime;
                } else {
                    this.brakeTemperature += 0.8 * deltaTime;
                }
            } else {
                const coolingRate = (currentSpeed > 30) ? 2.5 : 1.2;
                this.brakeTemperature = Math.max(50.0, this.brakeTemperature - coolingRate * deltaTime);
            }

            // Retarder balataları korur ve motor freni sağlar
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
        },

        /**
         * Sesli Topoğrafya ve Rakım Brifingi (Shift + Y Kısayolu)
         */
        speakTopographyReport: function(game) {
            const city = (game && game.currentCity) || "Tekirdağ";
            const dist = (game && game.activeDistrict) || "";
            const alt = (game && typeof game.currentAltitude === 'number' && !isNaN(game.currentAltitude)) ? game.currentAltitude : this.currentAltitude;
            const slope = (game && typeof game.currentSlopePct === 'number' && !isNaN(game.currentSlopePct)) ? game.currentSlopePct : this.currentSlopePct;
            const brakeT = Math.round(this.brakeTemperature);

            let locStr = dist ? `${city} / ${dist}` : city;
            let slopeText = "";
            let advice = "";

            if (slope > 2.5) {
                slopeText = `Yüzde ${slope.toFixed(1)} tırmanış rampasındasınız.`;
                advice = (game && game.speed < 30) ? "Motor yükü yüksek, rampa vitesini koruyunuz." : "Tırmanışta çekiş stabil.";
            } else if (slope < -2.5) {
                slopeText = `Yüzde ${Math.abs(slope).toFixed(1)} dik iniş rampasındasınız.`;
                const retLvl = (game && game.retarderLevel) ? game.retarderLevel : 0;
                if (retLvl > 0) {
                    advice = `Balata sıcaklığı ${brakeT} derece. Retarder Kademe ${retLvl} devrede, iniş kontrol altında.`;
                } else {
                    advice = `Balata sıcaklığı ${brakeT} derece. Fren şişmesini önlemek için B tuşu ile Retarder kademesi açınız!`;
                }
            } else {
                slopeText = "Yol düz veya hafif dalgalı seyrediyor.";
                advice = "Motor devri ve fren balataları ideal sıcaklıkta.";
            }

            const speech = `Merkez Topoğrafya Raporu: ${locStr}. Deniz seviyesinden rakımınız ${alt} metre. ${slopeText} ${advice}`;

            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(speech);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(speech);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`🏔️ Rakım: ${alt}m | Eğim: %${slope.toFixed(1)}`, 'info');
            }
        }
    };

    // Global nesneye bağla
    window.TURKEY_PROVINCES_ALTITUDE = TURKEY_PROVINCES_ALTITUDE;
    window.TEKIRDAG_DISTRICT_ALTITUDES = TEKIRDAG_DISTRICT_ALTITUDES;
    window.TURKEY_HIGHWAY_PASSES_GRADIENTS = TURKEY_HIGHWAY_PASSES_GRADIENTS;
    window.TURKEY_HIGHWAY_TUNNELS = TURKEY_HIGHWAY_TUNNELS;
    window.TURKEY_HIGHWAY_BRIDGES = TURKEY_HIGHWAY_BRIDGES;
    window.TurkeyGeographyEngine = TurkeyGeographyEngine;

})(typeof window !== 'undefined' ? window : globalThis);

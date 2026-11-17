/* ==========================================================================
   TÜRKİYE GERÇEK KARAYOLLARI VİRAJ VE DAĞ GEÇİTLERİ SİSTEMİ (TURKEY CURVES ENGINE)
   Türkiye'nin 81 ili, meşhur dağ geçitleri, sarp sahil virajları ve
   OSRM gerçek yol geometrisi (açı ve kavis analizi) ile entegre viraj simülasyonu.
   ========================================================================== */

(function(window) {
    'use strict';

    // TÜRKİYE'NİN MEŞHUR KARAYOLU VİRAJ VE GEÇİT VERİTABANI
    const TURKEY_HIGHWAY_CURVES = [
        // --- MARMARA VE TRAKYA BÖLGESİ ---
        {
            id: 'bolu_dagi_s',
            name: 'Bolu Dağı Efsanevi S-Virajları',
            highway: 'D-100 / E80',
            provinces: ['Bolu', 'Düzce'],
            elevation: 900,
            advisorySpeed: 50,
            radius: 85,
            intensity: 32,
            curveType: 's_viraj',
            description: 'Karanlıkdere, Bakacak ve Seymenler virajları. Türkiye\'nin en meşhur ağır vasıta ve otobüs geçişi.',
            speechWarning: 'Bolu Dağı keskin S-virajlarına giriyorsunuz. Hızınızı 50 kilometreye düşürün.',
            passSign: '🏔️ BOLU DAĞI S-VİRAJLARI [50 km/s]'
        },
        {
            id: 'ganos_ucmakdere',
            name: 'Ganos Dağları & Uçmakdere Sahil Virajları',
            highway: '59-52',
            provinces: ['Tekirdağ'],
            elevation: 320,
            advisorySpeed: 35,
            radius: 40,
            intensity: 40,
            curveType: 'sac_tokasi',
            description: 'Marmara Denizi kıyısında sarp uçurumlar ve dar asfalt. Kumbağ ile Şarköy arası efsanevi sahil virajları.',
            speechWarning: 'Dikkat! Uçmakdere uçurum virajları başlıyor. Tavsiye edilen azami hız 35 kilometre.',
            passSign: '🌊 UÇMAKDERE SAHİL VİRAJLARI [35 km/s]'
        },
        {
            id: 'istranca_orman',
            name: 'Istranca Orman Virajları',
            highway: 'D-020',
            provinces: ['Tekirdağ', 'Kırklareli'],
            elevation: 250,
            advisorySpeed: 50,
            radius: 90,
            intensity: 24,
            curveType: 'orman_viraji',
            description: 'Saray ile Vize arasında meşe ve kayın ormanları içinden geçen kıvrımlı Trakya yolu.',
            speechWarning: 'Istranca orman virajlarına yaklaştınız. Hızınızı kontrol ediniz.',
            passSign: '🌲 ISTRANCA ORMAN VİRAJLARI [50 km/s]'
        },
        {
            id: 'hereke_korfez',
            name: 'Hereke & Körfez Sahil Rampaları',
            highway: 'D-100',
            provinces: ['Kocaeli'],
            elevation: 80,
            advisorySpeed: 70,
            radius: 170,
            intensity: 20,
            curveType: 'otoyol_savurma_viraji',
            description: 'Marmara kıyısı yoğun otobüs trafiği ve viyadük bağlantı dönemeçleri.',
            speechWarning: 'Hereke rampaları virajına yaklaşıyorsunuz. Takip mesafenizi koruyun.',
            passSign: '⚓ HEREKE KÖRFEZ RAMPALARI [70 km/s]'
        },
        {
            id: 'geyve_bogazi',
            name: 'Geyve Boğazı Karasu Vadisi Virajları',
            highway: 'D-650',
            provinces: ['Sakarya', 'Bilecik'],
            elevation: 140,
            advisorySpeed: 65,
            radius: 150,
            intensity: 22,
            curveType: 'kanyon_viraji',
            description: 'Sakarya Nehri boyunca uzanan vadi kanyon virajları.',
            speechWarning: 'Geyve Boğazı virajlarına giriyorsunuz. Hızınızı 65 kilometreye ayarlayınız.',
            passSign: '🏞️ GEYVE BOĞAZI VİRAJLARI [65 km/s]'
        },
        {
            id: 'supurgelik_gecidi',
            name: 'Süpürgelik Dağ Geçidi',
            highway: 'D-575',
            provinces: ['Yalova', 'Bursa'],
            elevation: 380,
            advisorySpeed: 60,
            radius: 130,
            intensity: 25,
            curveType: 'tirmanis_viraji',
            description: 'Samanlı Dağları üzerinden Orhangazi ve Bursa yönüne tırmanış dönemeçleri.',
            speechWarning: 'Süpürgelik geçidi rampasına yaklaşıyorsunuz. Eğimli virajlara dikkat.',
            passSign: '⛰️ SÜPÜRGELİK DAĞ GEÇİDİ [60 km/s]'
        },

        // --- KARADENİZ BÖLGESİ ---
        {
            id: 'derebasi_virajlari',
            name: 'Derebaşı Virajları (D-915 Soğanlı Geçidi)',
            highway: 'D-915',
            provinces: ['Trabzon', 'Bayburt'],
            elevation: 2330,
            advisorySpeed: 20,
            radius: 25,
            intensity: 48,
            curveType: 'ekstrem_ucurum_viraji',
            description: 'Dünyanın en tehlikeli yolu kabul edilen 13 keskin saç tokası virajı. Uçurum kenarı, korkuluksuz.',
            speechWarning: 'DİKKAT! Derebaşı virajlarına giriyorsunuz. Aşırı keskin uçurum virajları! Azami hız 20 kilometre!',
            passSign: '⚠️ DEREBAŞI 13 VİRAJI (D-915) [20 km/s]'
        },
        {
            id: 'zigana_gecidi',
            name: 'Tarihi Zigana Dağ Geçidi & Köstere Virajları',
            highway: 'D-885',
            provinces: ['Trabzon', 'Gümüşhane'],
            elevation: 2032,
            advisorySpeed: 40,
            radius: 55,
            intensity: 38,
            curveType: 'sac_tokasi',
            description: 'Doğu Karadeniz Dağları\'nı aşan efsanevi sisli virajlar ve Hamsiköy zikzakları.',
            speechWarning: 'Zigana Geçidi sisli dağ virajları başlıyor. Tavsiye edilen azami hız 40 kilometre.',
            passSign: '🌫️ ZİGANA GEÇİDİ (2032m) [40 km/s]'
        },
        {
            id: 'cankurtaran_gecidi',
            name: 'Cankurtaran Dağ Geçidi Virajları',
            highway: 'D-010',
            provinces: ['Artvin'],
            elevation: 690,
            advisorySpeed: 40,
            radius: 60,
            intensity: 35,
            curveType: 'yagmur_orman_viraji',
            description: 'Hopa ile Borçka arasında yağmur ormanları içindeki dik viraj dizisi.',
            speechWarning: 'Cankurtaran geçidi virajları. Islak zemine ve ani dönemeçlere dikkat.',
            passSign: '🌧️ CANKURTARAN GEÇİDİ [40 km/s]'
        },
        {
            id: 'ovit_dagi',
            name: 'Ovit Dağı Zirve Virajları',
            highway: 'D-925',
            provinces: ['Rize', 'Erzurum'],
            elevation: 2640,
            advisorySpeed: 35,
            radius: 50,
            intensity: 40,
            curveType: 'alpin_kar_viraji',
            description: 'Kaçkar Dağları zirvesi, bulutların üzerindeki saç tokası virajlar.',
            speechWarning: 'Ovit Dağı zirve virajlarına yaklaşıyorsunuz. Rakım 2640 metre, azami hız 35 kilometre.',
            passSign: '❄️ OVİT DAĞI GEÇİDİ (2640m) [35 km/s]'
        },
        {
            id: 'ilgaz_dagi',
            name: 'Ilgaz Dağı Çamlık Zirve Virajları',
            highway: 'D-765',
            provinces: ['Kastamonu', 'Çankırı'],
            elevation: 1875,
            advisorySpeed: 45,
            radius: 70,
            intensity: 33,
            curveType: 'orman_viraji',
            description: 'Sık göknar ve çam ormanları arasında kesintisiz kıvrılan kış virajları.',
            speechWarning: 'Ilgaz Dağı virajlarına giriyorsunuz. Kar ve gizli buza dikkat, hız 45 kilometre.',
            passSign: '🌲 ILGAZ DAĞI GEÇİDİ (1875m) [45 km/s]'
        },
        {
            id: 'ahmetusta_gecidi',
            name: 'Ahmetusta Dağ Geçidi Kayın Ormanı Virajları',
            highway: 'D-755',
            provinces: ['Karabük', 'Bartın'],
            elevation: 1030,
            advisorySpeed: 45,
            radius: 68,
            intensity: 32,
            curveType: 'orman_viraji',
            description: 'Küre Dağları milli parkı etekleri derin vadi ve kayın ormanı dönemeçleri.',
            speechWarning: 'Ahmetusta geçidi virajları. Ağır vasıtalar için azami hız 45 kilometre.',
            passSign: '🍃 AHMETUSTA DAĞ GEÇİDİ [45 km/s]'
        },
        {
            id: 'karadeniz_eski_sahil',
            name: 'Karadeniz Eski Sahil Yolu Uçurum Virajları',
            highway: 'D-010',
            provinces: ['Sinop', 'Kastamonu'],
            elevation: 180,
            advisorySpeed: 40,
            radius: 55,
            intensity: 36,
            curveType: 'sahil_viraji',
            description: 'Cide ile İnebolu arası hırçın Karadeniz falezlerine bakan dar virajlar.',
            speechWarning: 'Karadeniz sahil yolu keskin falez virajları. Hızınızı 40 kilometreye düşürünüz.',
            passSign: '🌊 CİDE - İNEBOLU SAHİL VİRAJLARI [40 km/s]'
        },

        // --- DOĞU VE GÜNEYDOĞU ANADOLU BÖLGESİ ---
        {
            id: 'guzeldere_32_virajlar',
            name: 'Güzeldere Geçidi - Meşhur 32 Virajlar',
            highway: 'D-975',
            provinces: ['Van', 'Hakkari'],
            elevation: 2730,
            advisorySpeed: 30,
            radius: 35,
            intensity: 46,
            curveType: 'sac_tokasi_serisi',
            description: 'Türkiye\'nin en meşhur 32 ardışık saç tokası virajı. Başkale ile Hakkari arasında 2730m rakım.',
            speechWarning: 'Güzeldere 32 Virajları başlıyor! Ardışık 32 saç tokası virajı. Tavsiye edilen azami hız 30 kilometre!',
            passSign: '🛑 GÜZELDERE 32 VİRAJLARI (2730m) [30 km/s]'
        },
        {
            id: 'kop_dagi',
            name: 'Kop Dağı Geçidi Virajları',
            highway: 'D-915 / D-050',
            provinces: ['Bayburt', 'Erzurum'],
            elevation: 2409,
            advisorySpeed: 40,
            radius: 65,
            intensity: 36,
            curveType: 'yuksek_irtifa_viraji',
            description: 'Yüksek irtifa rüzgarları ve dondurucu tırmanış virajları.',
            speechWarning: 'Kop Dağı geçidi virajları. Rakım 2409 metre, hızınızı 40 kilometreye ayarlayın.',
            passSign: '🏔️ KOP DAĞI GEÇİDİ (2409m) [40 km/s]'
        },
        {
            id: 'kizildag_gecidi',
            name: 'Kızıldağ Geçidi Zirve Virajları',
            highway: 'D-100 / E80',
            provinces: ['Sivas', 'Erzincan'],
            elevation: 2190,
            advisorySpeed: 60,
            radius: 140,
            intensity: 26,
            curveType: 'genis_savurucu_viraj',
            description: 'D-100 karayolunun Türkiye\'deki en yüksek noktası. Geniş ama kuvvetli savuran rüzgarlı virajlar.',
            speechWarning: 'D-100 Kızıldağ geçidi virajları. Kuvvetli yan rüzgar ve savurma kuvvetine dikkat.',
            passSign: '💨 KIZILDAĞ GEÇİDİ (2190m) [60 km/s]'
        },
        {
            id: 'kuskunkiran_gecidi',
            name: 'Kuskunkıran Dağ Geçidi',
            highway: 'D-300',
            provinces: ['Van', 'Bitlis'],
            elevation: 2234,
            advisorySpeed: 50,
            radius: 90,
            intensity: 28,
            curveType: 'tirmanis_viraji',
            description: 'Van Gölü havzasına inen uzun tırmanış ve iniş dönemeçleri.',
            speechWarning: 'Kuskunkıran geçidi virajlarına yaklaştınız. Hızınızı 50 kilometreye sabitleyiniz.',
            passSign: '🏞️ KUSKUNKIRAN GEÇİDİ (2234m) [50 km/s]'
        },
        {
            id: 'zap_vadisi',
            name: 'Zap Vadisi Kanyon Virajları',
            highway: 'D-400',
            provinces: ['Hakkari'],
            elevation: 1400,
            advisorySpeed: 45,
            radius: 75,
            intensity: 34,
            curveType: 'kanyon_viraji',
            description: 'Zap Suyu boyunca dik kayalıklar arasına oyulmuş kanyon virajları.',
            speechWarning: 'Zap Vadisi kanyon virajlarına giriyorsunuz. Dar köprü ve dönemeçlere dikkat.',
            passSign: '🏜️ ZAP VADİSİ KANYON VİRAJLARI [45 km/s]'
        },
        {
            id: 'kemaliye_karanlik_kanyon',
            name: 'Kemaliye Karanlık Kanyon Taş Yolu Virajları',
            highway: '24-52',
            provinces: ['Erzincan'],
            elevation: 950,
            advisorySpeed: 25,
            radius: 30,
            intensity: 45,
            curveType: 'ekstrem_ucurum_viraji',
            description: 'Fırat Nehri kanyonunda kayalara oyulmuş tüneller ve 90 derecelik uçurum virajları.',
            speechWarning: 'Karanlık Kanyon Taş Yolu virajları! Aşırı dikkat, azami hız 25 kilometre!',
            passSign: '⚠️ KARANLIK KANYON TAŞ YOLU [25 km/s]'
        },

        // --- AKDENİZ BÖLGESİ ---
        {
            id: 'kas_kalkan_d400',
            name: 'Kaş - Kalkan - Demre D-400 Sahil Virajları',
            highway: 'D-400',
            provinces: ['Antalya'],
            elevation: 150,
            advisorySpeed: 45,
            radius: 65,
            intensity: 35,
            curveType: 'sahil_viraji',
            description: 'Akdeniz\'in turkuaz sularına bakan falezler, Kaputaş Kanyonu ve dar sahil virajları.',
            speechWarning: 'Kaş - Kalkan D-400 sahil virajları. Sarp kayalıklar ve keskin dönemeçler, hız 45 kilometre.',
            passSign: '🏖️ KAŞ - KALKAN D-400 VİRAJLARI [45 km/s]'
        },
        {
            id: 'gulek_bogazi',
            name: 'Gülek Boğazı & Toros Dağ Rampaları',
            highway: 'D-750 / O-21',
            provinces: ['Adana', 'Niğde', 'Mersin'],
            elevation: 1050,
            advisorySpeed: 70,
            radius: 180,
            intensity: 22,
            curveType: 'suratli_kanyon_viraji',
            description: 'Tarihi Kilikya Kapısı, Toros Dağları kanyon içi süratli otobüs virajları.',
            speechWarning: 'Tarihi Gülek Boğazı virajlarına yaklaştınız. Ağır vasıtalar için tavsiye edilen hız 70 kilometre.',
            passSign: '⛰️ GÜLEK BOĞAZI VİRAJLARI [70 km/s]'
        },
        {
            id: 'sertavul_gecidi',
            name: 'Sertavul Dağ Geçidi',
            highway: 'D-715',
            provinces: ['Karaman', 'Mersin'],
            elevation: 1650,
            advisorySpeed: 50,
            radius: 85,
            intensity: 33,
            curveType: 'keskin_dag_viraji',
            description: 'İç Anadolu\'yu Akdeniz\'e bağlayan Göksu Vadisi iniş virajları ve ani sert dönemeçler.',
            speechWarning: 'Sertavul Geçidi iniş virajları başlıyor. Retarderi devreye alınız, tavsiye edilen hız 50 kilometre.',
            passSign: '🏔️ SERTAVUL GEÇİDİ (1650m) [50 km/s]'
        },
        {
            id: 'alacabel_gecidi',
            name: 'Alacabel Toroslar Dağ Geçidi',
            highway: 'D-695',
            provinces: ['Konya', 'Antalya'],
            elevation: 1825,
            advisorySpeed: 45,
            radius: 75,
            intensity: 35,
            curveType: 'toros_firtina_viraji',
            description: 'Seydişehir ile Akseki arası Toros geçişi, kışın buzlu ve tipi virajları.',
            speechWarning: 'Alacabel Toros Dağ Geçidi virajları. Ani fırtına ve keskin virajlara dikkat, hız 45 kilometre.',
            passSign: '❄️ ALACABEL GEÇİDİ (1825m) [45 km/s]'
        },
        {
            id: 'belen_gecidi',
            name: 'Belen Geçidi Amanos Rüzgarlı Virajları',
            highway: 'D-817',
            provinces: ['Hatay'],
            elevation: 660,
            advisorySpeed: 55,
            radius: 110,
            intensity: 27,
            curveType: 'ruzgarli_bogaz_viraji',
            description: 'İskenderun ile Antakya arası Amanos Dağları sert rüzgarlı tırmanış virajları.',
            speechWarning: 'Belen Geçidi virajlarına yaklaştınız. Yan rüzgara karşı direksiyonu sıkı tutunuz.',
            passSign: '💨 BELEN GEÇİDİ VİRAJLARI [55 km/s]'
        },

        // --- EGE VE İÇ ANADOLU BÖLGESİ ---
        {
            id: 'sabuncubeli_gecidi',
            name: 'Sabuncubeli Rampası %9 Eğimli S-Virajı',
            highway: 'D-565',
            provinces: ['İzmir', 'Manisa'],
            elevation: 580,
            advisorySpeed: 50,
            radius: 80,
            intensity: 34,
            curveType: 'egimli_s_viraj',
            description: 'Spil Dağı etekleri, İzmir çıkışı dik eğimli ve ardışık S virajları.',
            speechWarning: 'Sabuncubeli rampası yüzde 9 eğimli S-virajları. Hızınızı 50 kilometreye ayarlayınız.',
            passSign: '⚠️ SABUNCUBELİ %9 EĞİMLİ S-VİRAJI [50 km/s]'
        },
        {
            id: 'sakar_gecidi',
            name: 'Sakar Geçidi Gökova Panoramik Saç Tokaları',
            highway: 'D-550',
            provinces: ['Muğla'],
            elevation: 670,
            advisorySpeed: 35,
            radius: 40,
            intensity: 44,
            curveType: 'sac_tokasi_serisi',
            description: 'Gökova Körfezi manzaralı dik uçurum saç tokaları. Türkiye\'nin en ünlü manzara ve fren virajı.',
            speechWarning: 'Sakar Geçidi Gökova iniş saç tokaları başlıyor! Frenleri yoklayınız, azami hız 35 kilometre!',
            passSign: '🌅 SAKAR GEÇİDİ GÖKOVA SAÇ TOKALARI [35 km/s]'
        },
        {
            id: 'elmadag_rampasi',
            name: 'Elmadağ Rampaları & Yahşihan Virajları',
            highway: 'D-200 / E88',
            provinces: ['Ankara', 'Kırıkkale'],
            elevation: 1150,
            advisorySpeed: 60,
            radius: 140,
            intensity: 25,
            curveType: 'tirmanis_viraji',
            description: 'Başkent çıkışı yoğun otobüs trafiği, ağır vasıta tırmanma ve iniş virajları.',
            speechWarning: 'Elmadağ rampaları virajına yaklaşıyorsunuz. Ağır vasıta şeridine ve takip mesafesine dikkat.',
            passSign: '🚛 ELMADAĞ RAMPALARI VİRAJI [60 km/s]'
        },
        {
            id: 'camlibel_gecidi',
            name: 'Çamlıbel Dağ Geçidi Zikzakları',
            highway: 'D-850',
            provinces: ['Tokat', 'Sivas'],
            elevation: 1650,
            advisorySpeed: 50,
            radius: 85,
            intensity: 32,
            curveType: 'keskin_dag_viraji',
            description: 'Çam ormanları içinde Yıldızeli yönüne uzanan ardışık virajlar.',
            speechWarning: 'Çamlıbel Geçidi dağ virajları. Tavsiye edilen azami hız 50 kilometre.',
            passSign: '🌲 ÇAMLIBEL GEÇİDİ (1650m) [50 km/s]'
        },
        {
            id: 'erciyes_tekir',
            name: 'Erciyes Dağı Tekir Yaylası Virajları',
            highway: '38-50',
            provinces: ['Kayseri'],
            elevation: 2215,
            advisorySpeed: 50,
            radius: 95,
            intensity: 30,
            curveType: 'volkanik_yayla_viraji',
            description: 'Erciyes volkanı yamaçları, geniş açılı ama kuvvetli merkezkaç uygulayan virajlar.',
            speechWarning: 'Erciyes Tekir Yaylası virajlarına yaklaştınız. Rakım 2215 metre, hızınızı kontrol edin.',
            passSign: '🌋 ERCİYES DAĞI VİRAJLARI [50 km/s]'
        }
    ];

    // YARDIMCI GEOMETRİ FONKSİYONLARI
    function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Dünya yarıçapı (metre)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function calculateBearing(lat1, lon1, lat2, lon2) {
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;
        const y = Math.sin(deltaLambda) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        const theta = Math.atan2(y, x);
        return (theta * 180 / Math.PI + 360) % 360;
    }

    function normalizeAngleDelta(delta) {
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        return delta;
    }

    // ANA MOTOR (TURKEY CURVES ENGINE)
    const TurkeyCurvesEngine = {
        highwayCurves: TURKEY_HIGHWAY_CURVES,

        /**
         * OSRM Koordinat Dizisinden Gerçek Türkiye Yolu Virajlarını Çıkarır
         * @param {Array<Array<number>>} coords [[lon, lat], [lon, lat], ...]
         * @param {number} totalDistanceMeters OSRM toplam mesafe
         * @param {Object} context { city, routeData, currentStop, prevStop }
         * @returns {Array<Object>} upcomingTurns formatında viraj listesi
         */
        extractCurvesFromCoordinates: function(coords, totalDistanceMeters, context = {}) {
            if (!coords || !Array.isArray(coords) || coords.length < 3) {
                return this.getCurvatureForCorridor(context.city, context.routeData, totalDistanceMeters, context);
            }

            // Koordinatlar arasındaki segment mesafeleri ve kerteriz (bearing) hesaplama
            const points = [];
            let accumulated = 0;
            for (let i = 0; i < coords.length; i++) {
                let dist = 0;
                if (i > 0) {
                    dist = calculateDistanceMeters(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
                    accumulated += dist;
                }
                points.push({
                    lon: coords[i][0],
                    lat: coords[i][1],
                    distFromStart: accumulated
                });
            }

            // Gürültüyü filtrelemek için 30-50m örnekleme pencereleriyle kerteriz farklarını hesapla
            const rawBends = [];
            const windowDist = 35; // 35 metre ileri/geri bakış

            for (let i = 1; i < points.length - 1; i++) {
                const cur = points[i];

                // Önceki referans nokta (en az 30m geride)
                let prevIdx = i - 1;
                while (prevIdx > 0 && (cur.distFromStart - points[prevIdx].distFromStart) < windowDist) {
                    prevIdx--;
                }
                // Sonraki referans nokta (en az 30m ileride)
                let nextIdx = i + 1;
                while (nextIdx < points.length - 1 && (points[nextIdx].distFromStart - cur.distFromStart) < windowDist) {
                    nextIdx++;
                }

                const p1 = points[prevIdx];
                const p2 = points[nextIdx];

                const b1 = calculateBearing(p1.lat, p1.lon, cur.lat, cur.lon);
                const b2 = calculateBearing(cur.lat, cur.lon, p2.lat, p2.lon);
                const delta = normalizeAngleDelta(b2 - b1);

                // Açı farkı en az 10 derece ise potansiyel viraj
                if (Math.abs(delta) >= 10) {
                    rawBends.push({
                        idx: i,
                        dist: cur.distFromStart,
                        lat: cur.lat,
                        lon: cur.lon,
                        delta: delta,
                        absDelta: Math.abs(delta)
                    });
                }
            }

            if (rawBends.length === 0) {
                // Yol düzse veya OSRM seyrek nokta verdiyse koridor bazlı otantik viraj üret
                return this.getCurvatureForCorridor(context.city, context.routeData, totalDistanceMeters, context);
            }

            // Ardışık bend noktalarını tek bir gerçek viraj bloğu halinde kümele
            const clusteredCurves = [];
            let currentCluster = [rawBends[0]];

            for (let i = 1; i < rawBends.length; i++) {
                const prev = currentCluster[currentCluster.length - 1];
                const cur = rawBends[i];

                // İki nokta arası mesafe 120 metreden azsa aynı viraj bölgesidir
                if ((cur.dist - prev.dist) < 120) {
                    currentCluster.push(cur);
                } else {
                    clusteredCurves.push(this._finalizeCurveCluster(currentCluster, totalDistanceMeters, context));
                    currentCluster = [cur];
                }
            }
            if (currentCluster.length > 0) {
                clusteredCurves.push(this._finalizeCurveCluster(currentCluster, totalDistanceMeters, context));
            }

            // Çok yakın veya zayıf olanları filtrele; ardışık virajlar arasında en az 380m mesafe bırak ki yollar üst üste binmesin!
            const rawValid = clusteredCurves.filter(c => c && c.distance > 180 && c.distance < totalDistanceMeters - 180);
            rawValid.sort((a, b) => b.distance - a.distance);

            const spacedCurves = [];
            const maxAllowed = Math.min(3, Math.max(1, Math.floor(totalDistanceMeters / 700)));
            for (let k = 0; k < rawValid.length && spacedCurves.length < maxAllowed; k++) {
                const cand = rawValid[k];
                const prevAdded = spacedCurves.length > 0 ? spacedCurves[spacedCurves.length - 1] : null;
                if (!prevAdded || (prevAdded.distance - cand.distance) >= 380) {
                    spacedCurves.push(cand);
                }
            }

            if (spacedCurves.length === 0) {
                return [];
            }

            return spacedCurves;
        },

        _finalizeCurveCluster: function(cluster, totalRouteDist, context) {
            if (!cluster || cluster.length === 0) return null;

            let totalAngle = 0;
            let peakDelta = 0;
            let centerLat = 0;
            let centerLon = 0;
            let startDist = cluster[0].dist;
            let endDist = cluster[cluster.length - 1].dist;

            cluster.forEach(pt => {
                totalAngle += pt.delta;
                centerLat += pt.lat;
                centerLon += pt.lon;
                if (pt.absDelta > Math.abs(peakDelta)) peakDelta = pt.delta;
            });

            centerLat /= cluster.length;
            centerLon /= cluster.length;

            const curveLength = Math.max(45, endDist - startDist);
            const isRight = totalAngle > 0;
            const absAngle = Math.abs(totalAngle);

            // Viraj yarıçapı tahmini R = L / theta (radyan)
            const thetaRad = Math.max(0.15, (absAngle * Math.PI / 180));
            let radius = Math.round(curveLength / thetaRad);
            radius = Math.max(30, Math.min(350, radius));

            // Fizik savurma kuvveti (15 ile 45 arası)
            let curveIntensity = Math.round(45 - (radius / 350) * 30);
            curveIntensity = Math.max(16, Math.min(45, curveIntensity));

            // Tavsiye edilen azami hız (km/s)
            let advisorySpeed = Math.round(Math.sqrt(radius * 9.81 * 0.22) * 3.6);
            advisorySpeed = Math.max(25, Math.min(85, Math.round(advisorySpeed / 5) * 5));

            // Yön ve tip sınıflandırması
            let dirText = "";
            let curveType = "orta_viraj";
            let reqProgress = 100;

            if (absAngle >= 75) {
                dirText = isRight ? "keskin saç tokası sağa" : "keskin saç tokası sola";
                curveType = "sac_tokasi";
                curveIntensity = Math.max(38, curveIntensity);
                advisorySpeed = Math.min(35, advisorySpeed);
                reqProgress = 140;
            } else if (absAngle >= 35) {
                dirText = isRight ? "sert sağa viraj" : "sert sola viraj";
                curveType = "sert_viraj";
                reqProgress = 110;
            } else if (absAngle >= 18) {
                dirText = isRight ? "hafif sağa viraj" : "hafif sola viraj";
                curveType = "tatli_viraj";
                reqProgress = 80;
            } else {
                dirText = isRight ? "tatlı sağ kavis" : "tatlı sol kavis";
                curveType = "tatli_viraj";
                reqProgress = 60;
            }

            // Türkiye Karayolu veritabanından en yakın meşhur geçit veya ilçe virajı eşleştirmesi
            const matchedPass = this._findMatchingPass(centerLat, centerLon, context);
            const curveName = matchedPass 
                ? (matchedPass.name + (dirText ? " (" + dirText + ")" : ""))
                : this._generateRealisticTurkishCurveName(context, dirText, advisorySpeed);

            const speechText = matchedPass 
                ? (matchedPass.name + ", " + dirText + ".")
                : ("Şimdi " + (isRight ? "sağa" : "sola") + " dönün.");

            const pan = isRight ? 0.70 : -0.70;

            // Milestones (Yaklaşma anons mesafeleri)
            const remainingFromStart = totalRouteDist - startDist;
            const allMilestones = [800, 500, 300, 150];
            const milestones = allMilestones.filter(m => m < (totalRouteDist - remainingFromStart - 40));
            milestones.push(0); // 0 = "Şimdi dönün"
            milestones.sort((a, b) => b - a);

            return {
                distance: remainingFromStart,
                name: curveName,
                direction: dirText,
                isRight: isRight,
                angleDelta: totalAngle,
                radius: radius,
                curveIntensity: curveIntensity,
                advisorySpeed: advisorySpeed,
                requiredProgress: reqProgress,
                currentProgress: 0,
                curveType: curveType,
                passSign: matchedPass ? matchedPass.passSign : ("⚠️ " + curveName.toUpperCase() + " [" + advisorySpeed + " km/s]"),
                speechWarning: speechText,
                pan: pan,
                milestones: milestones,
                state: "approaching",
                lastWarningTime: 0,
                isRealTurkeyCurve: true
            };
        },

        _findMatchingPass: function(lat, lon, context) {
            // Ünlü dağ geçitleri ve uçurum virajları YALNIZCA gerçekten o koridordan geçiliyorsa tetiklenir!
            // Şehir içi cadde ve mahalle hatlarında "Uçmakdere Uçurum Virajları" vb. yanlış eşleşmeleri kesinlikle engeller.
            const routeData = (context && context.routeData) ? context.routeData : null;
            const routeName = routeData && routeData.name ? String(routeData.name).toLowerCase() : "";
            const curStopName = (context && context.currentStop && context.currentStop.name) ? String(context.currentStop.name).toLowerCase() : "";
            const prevStopName = (context && context.prevStop && context.prevStop.name) ? String(context.prevStop.name).toLowerCase() : "";
            const combined = (routeName + " " + curStopName + " " + prevStopName);

            const passKeywords = {
                'bolu_dagi_s': ['bolu dağı', 'bolu tüneli', 'kaynaşlı', 'abant'],
                'ganos_ucmakdere': ['uçmakdere', 'ganos', 'yeniköy yamaç'],
                'istranca_orman': ['istranca', 'kıyıköy', 'vize', 'demirköy', 'yıldız dağları'],
                'hereke_korfez': ['hereke', 'dilovası'],
                'geyve_bogazi': ['geyve', 'pamukova', 'bilecik boğazı'],
                'supurgelik_gecidi': ['süpürgelik', 'orhangazi'],
                'derebasi_virajlari': ['derebaşı', 'soğanlı geçidi', 'd-915'],
                'zigana_gecidi': ['zigana', 'torul', 'maçka']
            };

            for (let pass of TURKEY_HIGHWAY_CURVES) {
                const pId = pass.id || '';
                const pNameLow = String(pass.name || '').toLowerCase();
                if (combined.includes(pId.replace(/_/g, ' ')) || combined.includes(pNameLow)) {
                    return pass;
                }
                const kwList = passKeywords[pId];
                if (kwList && kwList.some(kw => combined.includes(kw))) {
                    return pass;
                }
                // Diğer dağ geçitleri yalnızca şehirlerarası/dağ görevlerinde kendi özel geçit adı geçiyorsa eşleşir
                if (!kwList && routeData && (routeData.isIntercity || (routeData.licenseLevel && routeData.licenseLevel >= 7))) {
                    const firstWord = pNameLow.split(/\s+/)[0];
                    if (firstWord && firstWord.length >= 5 && combined.includes(firstWord)) {
                        return pass;
                    }
                }
            }
            return null;
        },

        _generateRealisticTurkishCurveName: function(context, dirText, advisorySpeed) {
            const curStop = (context && context.currentStop && context.currentStop.name) ? String(context.currentStop.name) : "";
            const routeData = (context && context.routeData) ? context.routeData : null;
            const district = (routeData && routeData.district && routeData.district !== 'all') ? routeData.district : ((context && context.city) ? context.city : " Bulvar");
            if (curStop) {
                const shortStop = curStop.length > 28 ? curStop.substring(0, 28).trim() : curStop;
                return shortStop + " Yaklaşımı (" + dirText + ")";
            }
            const roadKind = (routeData && routeData.isIntercity)
                ? "Karayolu"
                : ((advisorySpeed <= 45) ? "Cadde Kavşağı" : "Bulvarı");
            return district + " " + roadKind + " (" + dirText + ")";
        },

        /**
         * OSRM çevrimdışı olduğunda veya hiyerarşik modda güzergâha uygun temiz, çakışmasız viraj üretir.
         */
        getCurvatureForCorridor: function(city = "Tekirdağ", routeData = null, legDistance = 1200, context = {}) {
            const safeDist = Math.max(600, Number(legDistance) || 1200);
            const fullCtx = Object.assign({}, context || {}, { city: city || "Tekirdağ", routeData: routeData });
            const matchedPass = this._findMatchingPass(null, null, fullCtx);

            const turns = [];
            // Kısa şehir içi durak aralarında en fazla 1 viraj, uzun koridorlarda en fazla 2 viraj (birbirine asla girmez!)
            const numTurns = safeDist >= 2200 ? 2 : (safeDist >= 850 ? 1 : 0);
            if (numTurns === 0) return turns;

            const stepSpan = Math.floor((safeDist - 320) / (numTurns + 1));

            for (let i = 0; i < numTurns; i++) {
                const turnRemainingDist = Math.max(220, safeDist - ((i + 1) * Math.max(380, stepSpan)));
                if (turnRemainingDist > 200 && turnRemainingDist < safeDist - 180) {
                    const seed = (context && typeof context.stopIndex === 'number') ? (context.stopIndex + i) : i;
                    const isRight = (seed % 2 === 0);
                    const dirText = matchedPass
                        ? (isRight ? "sert sağa viraj" : "sert sola viraj")
                        : (isRight ? "sağa cadde dönüşü" : "sola cadde dönüşü");
                    const radius = matchedPass ? matchedPass.radius : 115;
                    const advisorySpeed = matchedPass ? matchedPass.advisorySpeed : 50;
                    const curveIntensity = matchedPass ? matchedPass.intensity : 20;
                    const curveName = matchedPass
                        ? (matchedPass.name + " (" + dirText + ")")
                        : this._generateRealisticTurkishCurveName(fullCtx, dirText, advisorySpeed);

                    const leadDist = safeDist - turnRemainingDist;
                    const milestones = [500, 250].filter(m => m < (leadDist - 50));
                    milestones.push(0); // 0 = "Şimdi dönün" her zaman garantili!
                    milestones.sort((a, b) => b - a);

                    turns.push({
                        distance: turnRemainingDist,
                        name: curveName,
                        direction: dirText,
                        isRight: isRight,
                        radius: radius,
                        curveIntensity: curveIntensity,
                        advisorySpeed: advisorySpeed,
                        requiredProgress: matchedPass ? 95 : 75,
                        currentProgress: 0,
                        curveType: matchedPass ? matchedPass.curveType : 'tatli_viraj',
                        passSign: matchedPass ? matchedPass.passSign : ("↪️ " + curveName.toUpperCase() + " [" + advisorySpeed + " km/s]"),
                        speechWarning: matchedPass ? (matchedPass.name + ", " + dirText + ".") : ("Şimdi " + (isRight ? "sağa" : "sola") + " dönün."),
                        pan: isRight ? 0.70 : -0.70,
                        milestones: milestones,
                        state: "approaching",
                        lastWarningTime: 0,
                        isRealTurkeyCurve: true
                    });
                }
            }

            turns.sort((a, b) => b.distance - a.distance);
            return turns;
        },

        /**
         * Merkezkaç G-Kuvveti Hesaplama (Fiziksel Formül: a = v^2 / R)
         * @param {number} speedKmh Araç hızı (km/s)
         * @param {Object} curve Viraj nesnesi
         * @returns {number} G-kuvveti birimi (örneğin 0.28G)
         */
        calculateCentrifugalGForce: function(speedKmh, curve) {
            if (!curve || speedKmh < 5) return 0;
            const v = (speedKmh / 3.6); // m/s
            const r = curve.radius || 80;
            const lateralAccel = (v * v) / r; // m/s^2
            return lateralAccel / 9.81; // G
        },

        /**
         * Viraj esnasında sürüş fiziğini, konforunu ve görsel eğimini değerlendirir
         */
        evaluateDrivingCurve: function(speedKmh, curve, steeringAngle = 0) {
            if (!curve) {
                return {
                    gForce: 0,
                    bodyRollDeg: 0,
                    isOverSpeed: false,
                    overspeedKmh: 0,
                    screechIntensity: 0,
                    comfortImpact: 0,
                    passengerState: 'normal'
                };
            }

            const gForce = this.calculateCentrifugalGForce(speedKmh, curve);
            const advisory = curve.advisorySpeed || 50;
            const overspeedKmh = Math.max(0, speedKmh - advisory);
            const isOverSpeed = overspeedKmh > 10;

            // Kasa yatma açısı (Body Roll)
            // Sağa virajda merkezkaç sola savurur (+roll), sola virajda sağa (-roll)
            const rollDirection = curve.isRight ? -1 : 1;
            let bodyRollDeg = rollDirection * Math.min(11, gForce * 16);

            // Direksiyonla virajı karşılama (counter-steer dengesi)
            let screechIntensity = 0;
            let comfortImpact = 0;
            let passengerState = 'normal';

            if (gForce > 0.45 || overspeedKmh > 22) {
                screechIntensity = Math.min(1.0, (gForce - 0.45) * 2.5 + (overspeedKmh / 35));
                comfortImpact = -1.2;
                passengerState = 'panic';
            } else if (gForce > 0.28 || overspeedKmh > 12) {
                screechIntensity = 0.25;
                comfortImpact = -0.4;
                passengerState = 'murmur';
            } else if (speedKmh > 15 && overspeedKmh === 0) {
                comfortImpact = 0.1;
                passengerState = 'satisfied';
            }

            return {
                gForce: parseFloat(gForce.toFixed(2)),
                bodyRollDeg: parseFloat(bodyRollDeg.toFixed(1)),
                isOverSpeed: isOverSpeed,
                overspeedKmh: overspeedKmh,
                screechIntensity: screechIntensity,
                comfortImpact: comfortImpact,
                passengerState: passengerState
            };
        },

        /**
         * GTFS veya Durak GPS koordinat dizisinden YALNIZCA aktif durak etabının gerçek dönüş açısını çıkarır
         * (Tüm hattın 50 durağını tek etaba yığıp yolları birbirine sokmaz!)
         */
        extractCurvesFromStopCoordinates: function(stops, totalDistMeters = 1200, context = {}) {
            const safeDist = Math.max(600, Number(totalDistMeters) || 1200);
            if (!stops || stops.length < 3) {
                return this.getCurvatureForCorridor(context.city || "Tekirdağ", context.routeData, safeDist, context);
            }

            // Sadece şu anki durak etabının (prev -> current -> next) açısını analiz et
            let targetIdx = (context && typeof context.stopIndex === 'number') ? context.stopIndex : -1;
            if (targetIdx < 0 && context && context.currentStop) {
                targetIdx = stops.findIndex(s => s && s.name === context.currentStop.name);
            }
            if (targetIdx <= 0 || targetIdx >= stops.length - 1) {
                targetIdx = 1;
            }

            const sPrev = stops[targetIdx - 1];
            const sCur = stops[targetIdx];
            const sNext = stops[targetIdx + 1];

            const lat0 = sPrev && (sPrev.lat || sPrev.stop_lat);
            const lon0 = sPrev && (sPrev.lon || sPrev.stop_lon);
            const lat1 = sCur && (sCur.lat || sCur.stop_lat);
            const lon1 = sCur && (sCur.lon || sCur.stop_lon);
            const lat2 = sNext && (sNext.lat || sNext.stop_lat);
            const lon2 = sNext && (sNext.lon || sNext.stop_lon);

            if (!lat0 || !lon0 || !lat1 || !lon1 || !lat2 || !lon2) {
                return this.getCurvatureForCorridor(context.city || "Tekirdağ", context.routeData, safeDist, context);
            }

            const y1 = Math.sin((lon1 - lon0) * Math.PI / 180) * Math.cos(lat1 * Math.PI / 180);
            const x1 = Math.cos(lat0 * Math.PI / 180) * Math.sin(lat1 * Math.PI / 180) -
                       Math.sin(lat0 * Math.PI / 180) * Math.cos(lat1 * Math.PI / 180) * Math.cos((lon1 - lon0) * Math.PI / 180);
            const b1 = (Math.atan2(y1, x1) * 180 / Math.PI + 360) % 360;

            const y2 = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
            const x2 = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
                       Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
            const b2 = (Math.atan2(y2, x2) * 180 / Math.PI + 360) % 360;

            let diff = b2 - b1;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;

            const absAngle = Math.abs(diff);
            if (absAngle < 22) {
                // Düz cadde etabı: gereksiz viraj uydurma, yolu temiz ve düz bırak
                return [];
            }

            const isRight = diff > 0;
            let advSpeed = 50;
            let intensity = 22;
            let radius = 110;
            let typeName = isRight ? "Sağa Cadde Dönüşü" : "Sola Cadde Dönüşü";

            if (absAngle >= 80) {
                advSpeed = 35;
                intensity = 34;
                radius = 55;
                typeName = isRight ? "Kavşaktan Sağa Dönüş" : "Kavşaktan Sola Dönüş";
            } else if (absAngle >= 45) {
                advSpeed = 42;
                intensity = 28;
                radius = 80;
                typeName = isRight ? "Kavisli Sağa Viraj" : "Kavisli Sola Viraj";
            }

            // Virajı etabın ortasına (~%45 kalan mesafe) yerleştir, durağa çok yakın olmasın
            const triggerDist = Math.max(240, Math.min(safeDist - 220, Math.round(safeDist * 0.45)));
            const leadDist = safeDist - triggerDist;
            const milestones = [500, 250].filter(m => m < (leadDist - 50));
            milestones.push(0);
            milestones.sort((a, b) => b - a);

            const stopLabel = (sCur && sCur.name) ? sCur.name : "Kavşak";

            return [{
                id: `gtfs_turn_${targetIdx}`,
                distance: triggerDist,
                name: `${stopLabel} ${typeName}`,
                direction: isRight ? "sağa" : "sola",
                isRight: isRight,
                angleDelta: diff,
                radius: radius,
                advisorySpeed: advSpeed,
                curveIntensity: intensity,
                requiredProgress: 80,
                currentProgress: 0,
                state: "approaching",
                milestones: milestones,
                lastWarningTime: 0,
                isRealTurkeyCurve: true,
                pan: isRight ? 0.70 : -0.70,
                speechWarning: `Şimdi ${isRight ? 'sağa' : 'sola'} dönün.`,
                passSign: `📐 ${stopLabel.toUpperCase()} - ${typeName.toUpperCase()} [${advSpeed} km/s]`
            }];
        },

        /**
         * Sesli Viraj ve Yol Geometrisi Raporu (Shift + V Kısayolu)
         */
        speakCurveReport: function(game) {
            if (!game) return;
            const upcoming = (game.upcomingTurns && game.upcomingTurns.length > 0) ? game.upcomingTurns[0] : null;

            let speech = "";
            if (upcoming && upcoming.state !== "completed") {
                const curveName = upcoming.name || upcoming.direction || "kavis";
                const dir = upcoming.isRight ? "sağa" : (upcoming.isRight === false ? "sola" : upcoming.direction);
                const rem = Math.max(0, Math.round((game.currentDistanceToNext || 0) - (upcoming.distance || 0)));
                speech = `${rem} metre sonra ${curveName}, ${dir}.`;
            } else {
                speech = "Yol düz devam ediyor.";
            }

            if (typeof audio !== 'undefined' && typeof audio.speakNavigation === 'function') {
                audio.speakNavigation(speech);
            } else if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(speech);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`📐 ${speech}`, 'info');
            }
        }
    };

    // Global nesneye bağla
    window.TURKEY_HIGHWAY_CURVES = TURKEY_HIGHWAY_CURVES;
    window.TurkeyCurvesEngine = TurkeyCurvesEngine;

})(typeof window !== 'undefined' ? window : globalThis);

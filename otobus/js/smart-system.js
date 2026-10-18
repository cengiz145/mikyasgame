/* ==========================================================================
   AKILLI SİSTEM (SMART BUS & ROUTE INTELLIGENCE SYSTEM)
   1. Akıllı Filo & Otobüs Tahsisi (Smart Bus Auto-Assignment)
   2. Doğal Dil & Popüler Merkez Eşleme (Landmark & Intent Resolution)
   3. "Bana Bir Sefer Bul" (Smart Route Recommender)
   4. Akıllı Sürüş Ko-Pilotu (Smart Co-Pilot)
   ========================================================================== */

const AkilliSistem = {
    // Popüler merkezler sözlüğü
    landmarks: {
        "hastane": "NKÜ ARAŞTIRMA HASTANESİ 2",
        "arastirma": "NKÜ ARAŞTIRMA HASTANESİ 2",
        "nku hastane": "NKÜ ARAŞTIRMA HASTANESİ 2",
        "universite": "N.K.Ü GİRİŞ",
        "kampus": "N.K.Ü GİRİŞ",
        "yurt": "KYK YURT 2",
        "kyk": "KYK YURT 2",
        "degirmenalti": "DEĞİRMENALTI 1",
        "carsi": "CUMHURİYET MEYDANI 1",
        "meydan": "CUMHURİYET MEYDANI 1",
        "rustempasa": "RÜSTEMPAŞA CAMİ",
        "valilik": "VALİLİK",
        "koprubasi": "KÖPRÜBAŞI 1",
        "sahil": "BAYKALLAR",
        "baykallar": "FATİH SULTAN MEHMET BULVARI 3 (BAYKALLAR )",
        "kultur merkezi": "YAHYA KEMAL BEYATLI KÜLTÜR MERKEZİ",
        "emniyet": "YENİ EMNİYET MÜDÜRLÜĞÜ",
        "spor salonu": "ATATÜRK SPOR SALONU",
        "yuzuncu yil": "ATATÜRK SPOR SALONU",
        "sanayi": "SANAYİ CADDESİ 1",
        "itfaiye": "İTFAİYE 1",
        "tepekent": "TEPEKENT",
        "velimese": "VELİMEŞE - 1",
        "corlu": "OTOGAR 1",
        "saray": "SARAY OTOGAR",
        "otogar": "OTOGAR 1"
    },

    resolveLandmark: function(query) {
        if (!query) return '';
        const norm = (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.normalizeText)
            ? AkilliRotaSistemi.normalizeText(query)
            : query.toLowerCase().trim();

        // Tam veya kısmi eşleşme
        for (const [key, stopName] of Object.entries(this.landmarks)) {
            if (norm.includes(key) || key.includes(norm)) {
                return stopName;
            }
        }
        return query; // Eşleşme yoksa orijinal sorguyu döndür
    },

    // 1. GÜZERGAHA GÖRE EN UYGUN OTOBÜSÜ AKILLI TAHMİN VE TAHSİS ET
    autoAssignBusForRoute: function(route) {
        if (!route || typeof BusFleet === 'undefined') return null;

        const playerLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const totalKm = route.totalKm || 15;
        const stopCount = (route.stops && route.stops.length) || 20;
        const isIntercity = route.isDistrict || totalKm > 30 || route.terrain === 'otoyol';

        let recommendedBusId = "otokar_kent_lf";
        let reason = "Standart şehir içi solo belediye hattı.";

        if (isIntercity) {
            // Şehirlerarası uzun yol
            if (playerLevel >= 18) {
                recommendedBusId = "setra_topclass_s516";
                reason = "Uzun yol Türkiye Turnesi için çift dingilli 510 HP Ultra VIP Setra tahsis edildi.";
            } else if (playerLevel >= 15) {
                recommendedBusId = "man_lions_coach";
                reason = "Otoyol tırmanışları ve uzun yol için yüksek güçlü 470 HP MAN Lion's Coach tahsis edildi.";
            } else if (playerLevel >= 13) {
                recommendedBusId = "mercedes_tourismo_16rhd";
                reason = "Yüksek yolcu kapasiteli Mercedes-Benz Tourismo tahsis edildi.";
            } else if (playerLevel >= 11) {
                recommendedBusId = "mercedes_travego_16shd";
                reason = "Şehirlerarası lüks seyahat için 2+1 koltuklu Mercedes-Benz Travego tahsis edildi.";
            } else {
                recommendedBusId = "otokar_kent_lf";
                reason = "İlçe belediye hattı için standart Otokar Kent LF tahsis edildi.";
            }
        } else {
            // Şehir içi belediye hattı
            if (stopCount >= 35 || (route.name && (route.name.includes("2/7") || route.name.includes("Üniversite") || route.name.includes("Hastane")))) {
                // Yoğun üniversite/hastane/ana arter hattı
                if (playerLevel >= 8) {
                    recommendedBusId = "mercedes_conecto_g";
                    reason = "Yoğun yolcu kapasitesi (160 yolcu) için 18 Metre Körüklü Mercedes-Benz Conecto G tahsis edildi.";
                } else if (playerLevel >= 6) {
                    recommendedBusId = "mercedes_conecto_12m";
                    reason = "Konforlu şehir içi ulaşım için Mercedes-Benz Conecto tahsis edildi.";
                } else {
                    recommendedBusId = "otokar_kent_lf";
                    reason = "Şehir içi ana arter hattı için Otokar Kent LF tahsis edildi.";
                }
            } else if (route.name && (route.name.includes("Mahalle") || route.name.includes("Tepe") || stopCount < 15)) {
                // Dar sokak / mahalle hattı
                if (playerLevel >= 3) {
                    recommendedBusId = "bmc_neocity_10m";
                    reason = "Dar mahalle sokakları ve kıvrak manevralar için kompakt BMC Neocity tahsis edildi.";
                } else {
                    recommendedBusId = "otokar_kent_lf";
                    reason = "Mahalle hattı için Otokar Kent LF tahsis edildi.";
                }
            } else {
                // Standart şehir içi
                if (playerLevel >= 6) {
                    recommendedBusId = "mercedes_conecto_12m";
                    reason = "Şehir içi sefer için Mercedes-Benz Conecto tahsis edildi.";
                } else {
                    recommendedBusId = "otokar_kent_lf";
                    reason = "Şehir içi belediye hattı için Otokar Kent LF tahsis edildi.";
                }
            }
        }

        // Seçimi uygula
        BusFleet.selectBus(recommendedBusId);
        const bus = BusFleet.getSelectedBus();

        return {
            bus: bus,
            reason: reason
        };
    },

    // 2. "BANA BİR SEFER BUL" (SMART RECOMMENDATION)
    recommendSmartRoute: function() {
        const db = (typeof window !== 'undefined' && window.tekulasHatVeritabani) ? window.tekulasHatVeritabani : [];
        if (!db || db.length === 0) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Hat veritabanı yüklenemedi.");
            return null;
        }

        const playerLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;

        // Seviyeye uygun hatları filtrele
        let candidates = db.filter(r => {
            if (playerLevel < 10) {
                // Seviye 10 altı sadece şehir içi hatlar
                return !r.isDistrict && r.totalKm <= 30;
            }
            return true;
        });

        if (candidates.length === 0) candidates = db;

        // Rastgele eğlenceli bir hat seç (özellikle 2/7, sahil ve üniversite hatlarına öncelik ver)
        const priorityRoutes = candidates.filter(r => r.name.includes("2/7") || r.name.includes("Değirmenaltı") || r.name.includes("Hastane") || r.name.includes("Sahil"));
        const pool = (priorityRoutes.length > 0 && Math.random() < 0.6) ? priorityRoutes : candidates;
        const chosenRoute = pool[Math.floor(Math.random() * pool.length)];

        // Akıllı filo tahsisini yap
        const dispatch = this.autoAssignBusForRoute(chosenRoute);

        const speech = `Kaptanım, sizin için akıllı sefer hazırlandı: ${chosenRoute.name}. Toplam ${chosenRoute.stops.length} durak, ${chosenRoute.totalKm} kilometre. ${dispatch ? dispatch.reason : ''} Sefer başlatılıyor.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(speech);
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🧭 Akıllı Sefer: ${chosenRoute.name}`, "success");

        if (typeof Game !== 'undefined' && Game.startRoute) {
            Game.startRoute(chosenRoute.id);
        }

        return chosenRoute;
    },

    // 3. AKILLI DOĞAL DİL SEFER BAŞLATMA
    smartTripRequest: function(text) {
        if (!text) return false;
        const norm = (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.normalizeText)
            ? AkilliRotaSistemi.normalizeText(text)
            : text.toLowerCase();

        // Durum A: "Bana bir sefer bul" / "rastgele sefer" / "kaptanın seçimi"
        if (norm.includes("bana bir sefer") || norm.includes("sefer oner") || norm.includes("gorev oner") || norm.includes("rastgele") || norm.includes("kaptanin secimi")) {
            this.recommendSmartRoute();
            return true;
        }

        // Durum B: İki nokta: "X'den Y'ye"
        const doubleMatch = text.match(/(.+?)(?:'dan|'den|'tan|'ten|dan|den|tan|ten)\s+(.+?)(?:'ya|'ye|'a|'e|ya|ye|a|e)\s*(?:git|sefer|sur|sür)?$/i);
        if (doubleMatch && doubleMatch[1] && doubleMatch[2]) {
            const rawFrom = doubleMatch[1].trim();
            const rawTo = doubleMatch[2].trim();
            const fromStop = this.resolveLandmark(rawFrom);
            const toStop = this.resolveLandmark(rawTo);

            if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.hesapla) {
                const res = AkilliRotaSistemi.hesapla(fromStop, toStop);
                if (res && res.success) {
                    // Akıllı otobüs tahsisi
                    const dispatch = this.autoAssignBusForRoute(res.route);
                    const msg = `Akıllı rota hazırlandı: ${res.fromStop} durağından ${res.toStop} durağına, Hat ${res.route.hatNo} ile ${res.stopsCount} durak. ${dispatch ? dispatch.bus.fullName + ' tahsis edildi.' : ''} İyi yolculuklar kaptan.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Akıllı Rota: ${res.fromStop} ➔ ${res.toStop}`, "success");
                    if (typeof Game !== 'undefined' && Game.startRoute) Game.startRoute(res.route.id);
                    return true;
                }
            }
        }

        // Durum C: Tek nokta: "Hastaneye git", "Üniversiteye sür", "Çarşıya git"
        const singleMatch = text.match(/(?:nereye\s+)?(.+?)(?:'ya|'ye|'a|'e|ya|ye|a|e)\s*(?:git|sur|sür|sefer)?$/i);
        if (singleMatch && singleMatch[1]) {
            const rawDest = singleMatch[1].trim();
            const toStop = this.resolveLandmark(rawDest);
            // Varsayılan kalkış merkezi (Atatürk Spor Salonu veya Cumhuriyet Meydanı)
            const defaultFrom = "ATATÜRK SPOR SALONU";

            if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.hesapla) {
                let res = AkilliRotaSistemi.hesapla(defaultFrom, toStop);
                if (!res || !res.success) {
                    res = AkilliRotaSistemi.hesapla("CUMHURİYET MEYDANI 1", toStop);
                }
                if (res && res.success) {
                    this.autoAssignBusForRoute(res.route);
                    const msg = `${res.toStop} yönüne akıllı rota bulundu: Hat ${res.route.hatNo} ile ${res.fromStop} kalkışlı ${res.stopsCount} duraklık sefer başlıyor.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Akıllı Rota: ➔ ${res.toStop}`, "success");
                    if (typeof Game !== 'undefined' && Game.startRoute) Game.startRoute(res.route.id);
                    return true;
                }
            }
        }

        return false;
    },

    // 4. SÜRÜŞ ESNASINDA AKILLI KO-PİLOT UYARILARI
    onCoPilotUpdate: function(game) {
        if (!game || !game.isDriving) return;

        const dist = game.currentDistanceToNext;
        const speed = game.speed;

        // Durağa 100 metre yaklaşıldığında hız uyarısı
        if (dist > 80 && dist <= 120 && speed > 50 && !game._copilotSlowWarned) {
            game._copilotSlowWarned = true;
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Durağa yüz metre kaldı, hızınızı düşürün.");
            }
        } else if (dist > 150) {
            game._copilotSlowWarned = false;
        }

        // Durakta tam durulduğunda kapı hatırlatması
        if (dist <= 15 && speed === 0 && !game.frontDoorOpen && !game._copilotDoorWarned) {
            game._copilotDoorWarned = true;
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Durağa yanaştınız. Yolcu binişi için ön kapıyı açabilirsiniz.");
            }
        } else if (speed > 5) {
            game._copilotDoorWarned = false;
        }
    }
};

if (typeof window !== 'undefined') {
    window.AkilliSistem = AkilliSistem;
}

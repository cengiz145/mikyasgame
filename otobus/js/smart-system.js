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
        "emniyet": "HÜRRİYET ASAYİŞ MERKEZİ",
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

    normalizeSafe: function(str) {
        if (!str) return '';
        if (typeof AkilliRotaSistemi !== 'undefined' && typeof AkilliRotaSistemi.normalizeText === 'function') {
            return AkilliRotaSistemi.normalizeText(String(str));
        }
        return String(str)
            .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    },

    resolveLandmark: function(query) {
        if (!query) return '';
        const norm = this.normalizeSafe(query);
        if (!norm || norm.length < 3) return query;

        // Önce tam eşleşme
        if (this.landmarks[norm]) return this.landmarks[norm];

        // Kelime sınırı duyarlı eşleşme ("aksaray" sorgusunun "saray" ile yanlış eşleşmesini ve kısa hece kazalarını önler)
        const words = norm.split(' ');
        const entries = Object.entries(this.landmarks).sort((a, b) => b[0].length - a[0].length);
        for (const [key, stopName] of entries) {
            if (key.includes(' ')) {
                if (norm.includes(key)) return stopName;
            } else if (words.some(w => w === key || (w.length >= key.length + 1 && w.startsWith(key)))) {
                return stopName;
            }
        }
        return query; // Eşleşme yoksa orijinal sorguyu döndür
    },

    // 1. GÜZERGAHA GÖRE EN UYGUN (SAHİP OLUNAN & KİLİDİ AÇIK) OTOBÜSÜ AKILLI TAHSİS ET
    // Not: Oyuncunun sahip olmadığı bir otobüsü gizlice satın almaya çalışmaz!
    autoAssignBusForRoute: function(route) {
        if (!route || typeof BusFleet === 'undefined') return null;

        const playerLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive') || (typeof localStorage !== 'undefined' && localStorage.getItem('gamePlayMode') === 'free_drive');
        const totalKm = route.totalKm || route.totalDistanceKm || 15;
        const stopCount = (route.stops && Array.isArray(route.stops) && route.stops.length) || 20;
        const isIntercity = !!(route.isIntercity || route.isDistrict || totalKm > 30 || route.terrain === 'otoyol');

        const canUseBus = (busId) => {
            if (!Array.isArray(BusFleet.buses)) return false;
            const b = BusFleet.buses.find(x => x.id === busId);
            if (!b) return false;
            const owned = (typeof BusFleet.isBusOwned === 'function') ? BusFleet.isBusOwned(busId) : true;
            const unlocked = isFreeDrive || playerLevel >= (b.requiredLevel || 1);
            return Boolean(owned && unlocked);
        };

        let candidateIds = [];
        let contextLabel = "Standart şehir içi belediye hattı";

        if (isIntercity) {
            contextLabel = "Uzun yol ve ilçeler arası güzergâh";
            candidateIds = [
                "setra_topclass_s516",
                "scania_irizar_i8",
                "man_lions_coach",
                "mercedes_tourismo_16rhd",
                "mercedes_travego_16shd",
                "mercedes_o403_rhd",
                "isuzu_novo_lux",
                "otokar_kent_lf",
                "otokar_sultan_mega"
            ];
        } else if (stopCount >= 35 || (route.name && (route.name.includes("2/7") || route.name.includes("Üniversite") || route.name.includes("Hastane")))) {
            contextLabel = "Yoğun yolcu kapasiteli ana arter hattı";
            candidateIds = [
                "mercedes_conecto_g",
                "otokar_kent_articulated",
                "mercedes_conecto_12m",
                "bmc_procity_12m",
                "otokar_kent_lf",
                "otokar_sultan_mega"
            ];
        } else if (route.name && (route.name.includes("Mahalle") || route.name.includes("Tepe") || stopCount < 15)) {
            contextLabel = "Dar mahalle sokakları ve kıvrak manevra hattı";
            candidateIds = [
                "bmc_neocity_10m",
                "karsan_atak_8m",
                "isuzu_novo_lux",
                "otokar_kent_lf",
                "otokar_sultan_mega"
            ];
        } else {
            contextLabel = "Şehir içi belediye hattı";
            candidateIds = [
                "mercedes_conecto_12m",
                "otokar_kent_lf",
                "bmc_neocity_10m",
                "otokar_sultan_mega"
            ];
        }

        const chosenBusId = candidateIds.find(id => canUseBus(id));
        if (chosenBusId && typeof BusFleet.selectBus === 'function') {
            BusFleet.selectBus(chosenBusId);
        }

        const bus = (typeof BusFleet.getSelectedBus === 'function') ? BusFleet.getSelectedBus() : null;
        const reason = bus
            ? `${contextLabel} için filonuzdan ${bus.fullName || bus.name} tahsis edildi.`
            : `${contextLabel} hazırlandı.`;

        return {
            bus: bus,
            reason: reason
        };
    },

    // 2. "BANA BİR SEFER BUL" (SMART RECOMMENDATION)
    recommendSmartRoute: function() {
        const db = (typeof window !== 'undefined' && Array.isArray(window.tekulasHatVeritabani)) ? window.tekulasHatVeritabani : [];
        if (!db || db.length === 0) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Hat veritabanı yüklenemedi.");
            return null;
        }

        const hasPassed10 = (typeof Game !== 'undefined' && typeof Game.hasPassedLevel10 === 'function')
            ? Game.hasPassedLevel10()
            : ((typeof Game !== 'undefined' && Game.licenseLevel >= 2) || false);

        // Seviyeye uygun hatları filtrele
        let candidates = db.filter(r => {
            if (!r || !Array.isArray(r.stops) || r.stops.length < 2) return false;
            if (!hasPassed10) {
                return !r.isDistrict && !r.isIntercity && (r.totalKm || 10) <= 30;
            }
            return true;
        });

        if (candidates.length === 0) {
            candidates = db.filter(r => r && Array.isArray(r.stops) && r.stops.length >= 2);
        }
        if (candidates.length === 0) return null;

        // Rastgele eğlenceli bir hat seç (özellikle 2/7, sahil ve üniversite hatlarına öncelik ver)
        const priorityRoutes = candidates.filter(r => r.name && (r.name.includes("2/7") || r.name.includes("Değirmenaltı") || r.name.includes("Hastane") || r.name.includes("Sahil")));
        const pool = (priorityRoutes.length > 0 && Math.random() < 0.6) ? priorityRoutes : candidates;
        const chosenRoute = pool[Math.floor(Math.random() * pool.length)];

        if (typeof routesData !== 'undefined' && !routesData[chosenRoute.id]) {
            routesData[chosenRoute.id] = chosenRoute;
        }

        const dispatch = this.autoAssignBusForRoute(chosenRoute);
        if (typeof Game !== 'undefined' && typeof Game.startRoute === 'function') {
            const started = Game.startRoute(chosenRoute.id);
            if (started === false) return null;
        }

        const kmVal = chosenRoute.totalKm || chosenRoute.totalDistanceKm || 10;
        const speech = `Kaptanım, sizin için akıllı sefer hazırlandı: ${chosenRoute.name}. Toplam ${chosenRoute.stops.length} durak, ${kmVal} kilometre. ${dispatch ? dispatch.reason : ''} Sefer başlatılıyor.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(speech);
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🧭 Akıllı Sefer: ${chosenRoute.name}`, "success");

        return chosenRoute;
    },

    // 3. AKILLI DOĞAL DİL SEFER BAŞLATMA
    smartTripRequest: function(text) {
        if (!text) return false;
        const norm = this.normalizeSafe(text);

        // Durum A: "Bana bir sefer bul" / "rastgele sefer" / "kaptanın seçimi"
        if (norm.includes("bana bir sefer") || norm.includes("sefer oner") || norm.includes("gorev oner") || norm.includes("rastgele sefer") || norm.includes("kaptanin secimi")) {
            return Boolean(this.recommendSmartRoute());
        }

        const stripLocativeFrom = (s) => String(s || '').trim().replace(/(?:'dan|'den|'tan|'ten|\s+durağından|\s+duragindan)$/i, '').replace(/(.{3,}?)(?:dan|den|tan|ten)$/i, (m, stem) => /mey$|fi$|zi$/i.test(stem) ? m : stem).trim();
        const stripDativeTo = (s) => String(s || '').trim().replace(/(?:'ya|'ye|'na|'ne|'a|'e)$/i, '').replace(/(.{3,}?)(?:ya|ye|a|e)$/i, '$1').trim();

        // Durum B: İki nokta: "X'den Y'ye (git/sür/sefer)"
        const doubleMatch = String(text).trim().match(/^(.+?)(?:'dan|'den|'tan|'ten|(?<=\S{3})(?:dan|den|tan|ten))\s+(.+?)(?:'ya|'ye|'a|'e|(?<=\S{3})(?:ya|ye|a|e))(?:\s+(?:git|gidelim|sefer|sur|sür|rota|gotur|götür))?$/i);
        if (doubleMatch && doubleMatch[1] && doubleMatch[2]) {
            const rawFrom = stripLocativeFrom(doubleMatch[1]);
            const rawTo = stripDativeTo(doubleMatch[2]);
            const fromStop = this.resolveLandmark(rawFrom);
            const toStop = this.resolveLandmark(rawTo);

            if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.hesapla) {
                const res = AkilliRotaSistemi.hesapla(fromStop, toStop);
                if (res && res.success) {
                    const dispatch = this.autoAssignBusForRoute(res.route);
                    if (typeof Game !== 'undefined' && typeof Game.startRoute === 'function') {
                        if (Game.startRoute(res.route.id) === false) return true;
                    }
                    const busLabel = (dispatch && dispatch.bus) ? ((dispatch.bus.fullName || dispatch.bus.name) + ' tahsis edildi.') : '';
                    const msg = `Akıllı rota hazırlandı: ${res.fromStop} durağından ${res.toStop} durağına, Hat ${res.route.hatNo} ile ${res.stopsCount} durak. ${busLabel} İyi yolculuklar kaptan.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Akıllı Rota: ${res.fromStop} ➔ ${res.toStop}`, "success");
                    return true;
                }
            }
        }

        // Durum C: Tek nokta — Yalnızca açık hareket fiili varsa tetiklenir ("klima", "merhaba", "rampa" gibi -a/-e ile biten normal kelimeleri yakalamaz!)
        const singleMatch = String(text).trim().match(/^(?:nereye\s+)?(.+?)(?:'ya|'ye|'a|'e|(?<=\S{3})(?:ya|ye|a|e))\s+(?:git|gidelim|sur|sür|sefer|rota|gotur|götür)$/i);
        if (singleMatch && singleMatch[1]) {
            const rawDest = stripDativeTo(singleMatch[1]);
            const toStop = this.resolveLandmark(rawDest);
            const defaultFrom = "ATATÜRK SPOR SALONU";

            if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.hesapla) {
                let res = AkilliRotaSistemi.hesapla(defaultFrom, toStop);
                if (!res || !res.success) {
                    res = AkilliRotaSistemi.hesapla("CUMHURİYET MEYDANI 1", toStop);
                }
                if (res && res.success) {
                    this.autoAssignBusForRoute(res.route);
                    if (typeof Game !== 'undefined' && typeof Game.startRoute === 'function') {
                        if (Game.startRoute(res.route.id) === false) return true;
                    }
                    const msg = `${res.toStop} yönüne akıllı rota bulundu: Hat ${res.route.hatNo} ile ${res.fromStop} kalkışlı ${res.stopsCount} duraklık sefer başlıyor.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Akıllı Rota: ➔ ${res.toStop}`, "success");
                    return true;
                }
            }
        }

        return false;
    },

    // 4. SÜRÜŞ ESNASINDA AKILLI KO-PİLOT UYARILARI (Yalnızca yol navigasyonu kalacak şekilde ekstra tuş/hız yönlendirmeleri kapatıldı)
    onCoPilotUpdate: function(game) {
        if (!game || !game.isDriving) return;
    }
};

if (typeof window !== 'undefined') {
    window.AkilliSistem = AkilliSistem;
}

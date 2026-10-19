/* ==========================================================================
   AKILLI ROTA SİSTEMİ (SMART ROUTE SYSTEM)
   Kullanıcı sadece Nereden ve Nereye gitmek istediğini seçer;
   Gidiş / Dönüş yönünü ve en uygun TEKULAŞ hattını sistem otomatik hesaplar.
   ========================================================================== */

const AkilliRotaSistemi = {
    allStopsCache: null,

    // MAHALLELER VE ANA DURAKLAR KATALOĞU (Ara duraklar giderken keşfedilir)
        getActiveDistrict: function() {
        if (typeof Game !== 'undefined' && Game.activeDistrict) return Game.activeDistrict;
        try {
            return localStorage.getItem('activeDistrict') || "Süleymanpaşa";
        } catch(e) {
            return "Süleymanpaşa";
        }
    },

    getActiveCatalog: function() {
        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;
        const activeDist = this.getActiveDistrict();

        if (activeDist === "all" && hasPassed10) {
            return this.mahallelerVeAnaDuraklar;
        }

        // Sadece seçilen ana bölgenin mahalleleri listelenir, diğer tüm ilçeler tamamen ve sessizce gizlenir
        const filtered = this.mahallelerVeAnaDuraklar.filter(item => item.district === activeDist);
        return filtered.length > 0 ? filtered : this.mahallelerVeAnaDuraklar.filter(item => item.district === "Süleymanpaşa");
    },

    mahallelerVeAnaDuraklar: [
        // SÜLEYMANPAŞA MAHALLELERİ VE ANA MERKEZLER
        { label: "Değirmenaltı Mahallesi (Kampüs & KYK)", district: "Süleymanpaşa", stopName: "Üniversite Caddesi", keys: ["degirmenalti", "kampus", "kyk", "universite"] },
        { label: "Çınarlı Mahallesi (Köprübaşı & Çarşı)", district: "Süleymanpaşa", stopName: "Köprübaşı Meydanı Caddesi", keys: ["cinarli", "koprubasi", "carsi"] },
        { label: "Ertuğrul Mahallesi (Valilik & Hükümet Cd.)", district: "Süleymanpaşa", stopName: "Hükümet Caddesi (Süleymanpaşa Tarihi Valilik & Çarşı)", keys: ["ertugrul", "valilik", "hukumet", "meydan"] },
        { label: "Gündoğdu Mahallesi (Şehir Hastanesi)", district: "Süleymanpaşa", stopName: "Şehir Hastanesi Ana Giriş Caddesi", keys: ["gundogdu", "sehir hastanesi", "hastane"] },
        { label: "100. Yıl Mahallesi (Atatürk Spor Salonu)", district: "Süleymanpaşa", stopName: "Atatürk Spor Salonu Caddesi", keys: ["100 yil", "spor salonu", "yuzuncu yil"] },
        { label: "Altınova Mahallesi (Sahil & Liman)", district: "Süleymanpaşa", stopName: "Altınova Sahil Caddesi", keys: ["altinova", "sahil", "liman"] },
        { label: "Hürriyet Mahallesi (Baykallar & Emniyet)", district: "Süleymanpaşa", stopName: "Baykallar Caddesi", keys: ["hurriyet", "baykallar", "emniyet"] },
        { label: "Süleymanpaşa Yeni Otogar (Otobüs Terminali)", district: "Süleymanpaşa", stopName: "Yeni Otobüs Terminali Caddesi", keys: ["suleymanpasa otogar", "terminal", "yeni otogar", "otogar"] },

        // SARAY MAHALLELERİ VE ANA MERKEZLER
        { label: "Ayaspaşa Mahallesi (Saray Çarşı & Belediye)", district: "Saray", stopName: "Saray Belediyesi (Cumhuriyet Meydanı)", keys: ["ayaspasa", "saray belediye", "saray carsi", "saray merkez"] },
        { label: "Pazarcık Mahallesi (Saray Otogarı)", district: "Saray", stopName: "Saray Otogar 1 (Giriş Peronu)", keys: ["pazarcik", "saray otogar"] },
        { label: "Yeni Mahalle (Saray Devlet Hastanesi)", district: "Saray", stopName: "Saray Devlet Hastanesi Ana Giriş", keys: ["yeni mahalle", "saray hastane", "devlet hastanesi"] },
        { label: "Yeni Mahalle (Saray Fakülte Kampüsü)", district: "Saray", stopName: "Saray Meslek Yüksekokulu (Fakülte Kampüs)", keys: ["fakulte", "kampus", "myo", "saray myo"] },
        { label: "Kemalpaşa Mahallesi (100. Yıl & Parklar)", district: "Saray", stopName: "100. Yıl Atatürk Caddesi 1", keys: ["kemalpasa", "100 yil saray", "ladin"] },
        { label: "Büyükyoncalı Mahallesi (Yoncalı Merkez)", district: "Saray", stopName: "Büyükyoncalı Merkez (Belediye Binası)", keys: ["buyukyoncali", "yoncali"] },
        { label: "Çukuryurt Mahallesi (Meydan)", district: "Saray", stopName: "Çukuryurt Köy Meydanı", keys: ["cukuryurt"] },

        // VELİMEŞE & ERGENE
        { label: "Velimeşe Mahallesi (Merkez Meydan)", district: "Velimeşe", stopName: "Velimeşe Merkez Meydan", keys: ["velimese", "velimese merkez", "cetin"] },
        { label: "Velimeşe Sanayi Bölgesi", district: "Velimeşe", stopName: "Sanayi Caddesi", keys: ["velimese sanayi", "osb"] },
        { label: "Velimeşe TOKİ Konutları", district: "Velimeşe", stopName: "TOKİ 233. Sokak", keys: ["velimese toki", "toki"] },

        // ÇEVRE İLÇELER
        { label: "Çorlu Otogarı (İlçe Terminali)", district: "Çorlu", stopName: "Çorlu Otogar", keys: ["corlu", "corlu otogar"] },
        { label: "Çerkezköy Otogarı (İlçe Terminali)", district: "Çerkezköy", stopName: "Çerkezköy Otogar", keys: ["cerkezkoy", "cerkezkoy otogar"] },
        { label: "Kapaklı Otogarı (İlçe Terminali)", district: "Kapaklı", stopName: "Kapaklı Otogarı", keys: ["kapakli", "kapakli otogar"] },
        { label: "Muratlı Meydanı (İstasyon)", district: "Muratlı", stopName: "Muratlı Meydan", keys: ["muratli", "muratli meydan"] }
    ],

    resolveMahalleOrHub: function(query) {
        if (!query) return null;
        const catalog = this.getActiveCatalog();
        const qNorm = this.normalizeText(query);
        const qWords = qNorm.split(' ').filter(w => w.length > 2);

        // 1. Doğrudan etiket eşleşmesi
        let match = catalog.find(item => this.normalizeText(item.label) === qNorm);
        if (match) return match;

        // 2. Anahtar kelime eşleşmesi
        match = catalog.find(item => item.keys.some(k => qNorm.includes(k) || k.includes(qNorm)));
        if (match) return match;

        // 3. Kelime alt dize eşleşmesi
        match = catalog.find(item => qWords.some(w => this.normalizeText(item.label).includes(w)));
        return match || null;
    },
    allStopsCache: null,

    normalizeText: function(text) {
        if (!text) return '';
        return text
            .replace(/İ/g, 'i')
            .replace(/I/g, 'i')
            .replace(/ı/g, 'i')
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    matchStop: function(stopName, query) {
        if (!stopName || !query) return false;
        const sNorm = this.normalizeText(stopName);
        const qNorm = this.normalizeText(query);
        const qWords = qNorm.split(' ').filter(w => w.length > 1);
        // Velimeşe Çetin Sokak Alias Desteği
        if ((qNorm.includes("cetin") || qNorm.includes("cetin sokak")) && sNorm.includes("cetin")) {
            return true;
        }
        if (qWords.length === 0) return sNorm.includes(qNorm);
        return qWords.every(w => sNorm.includes(w));
    },

    getAllStops: function() {
        // Seviyeye göre sadece aktif katalog döner (açılmayan ilçeler tamamen gizlidir)
        return this.getActiveCatalog().map(item => item.label);
    },

    hesapla: function(neredenQuery, nereyeQuery) {
        // Mahalle ve Ana Durak çözümlemesi
        const fromHub = this.resolveMahalleOrHub(neredenQuery);
        const toHub = this.resolveMahalleOrHub(nereyeQuery);

        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;

        

        const effectiveFrom = fromHub ? fromHub.stopName : neredenQuery;
        const effectiveTo = toHub ? toHub.stopName : nereyeQuery;

        const activeDist = this.getActiveDistrict();
        // 1. SÜLEYMANPAŞA İÇİ MAHALLE / ANA DURAK NAVİGASYONU
        if ((activeDist === "Süleymanpaşa" || activeDist === "all") && (!fromHub || fromHub.district === "Süleymanpaşa") && (!toHub || toHub.district === "Süleymanpaşa")) {
            if (typeof SuleymanpasaNavigasyon !== 'undefined' && SuleymanpasaNavigasyon.findSokak) {
                const sFrom = SuleymanpasaNavigasyon.findSokak(effectiveFrom);
                const sTo = SuleymanpasaNavigasyon.findSokak(effectiveTo);
                if (sFrom && sTo && sFrom.id !== sTo.id) {
                    const sRes = SuleymanpasaNavigasyon.rotaOlustur(effectiveFrom, effectiveTo);
                    if (sRes.success) {
                        return {
                            success: true,
                            route: sRes.route,
                            originalRoute: sRes.route,
                            fromStop: fromHub ? fromHub.label : sRes.kalkis.name,
                            toStop: toHub ? toHub.label : sRes.varis.name,
                            stopsCount: sRes.stopsCount,
                            dist: sRes.totalKm
                        };
                    }
                }
            }
        }

        // 2. SARAY İÇİ MAHALLE / ANA DURAK NAVİGASYONU
        if ((activeDist === "Saray" || (hasPassed10 && activeDist === "all")) && (!fromHub || fromHub.district === "Saray") && (!toHub || toHub.district === "Saray")) {
            if (typeof SarayNavigasyon !== 'undefined' && SarayNavigasyon.findSokak) {
                const sFrom = SarayNavigasyon.findSokak(effectiveFrom);
                const sTo = SarayNavigasyon.findSokak(effectiveTo);
                if (sFrom && sTo && sFrom.id !== sTo.id) {
                    const sRes = SarayNavigasyon.rotaOlustur(effectiveFrom, effectiveTo);
                    if (sRes.success) {
                        return {
                            success: true,
                            route: sRes.route,
                            originalRoute: sRes.route,
                            fromStop: fromHub ? fromHub.label : sRes.kalkis.name,
                            toStop: toHub ? toHub.label : sRes.varis.name,
                            stopsCount: sRes.stopsCount,
                            dist: sRes.totalKm
                        };
                    }
                }
            }
        }

        // 3. VELİMEŞE İÇİ MAHALLE NAVİGASYONU
        if ((activeDist === "Velimeşe" || (hasPassed10 && activeDist === "all")) && (!fromHub || fromHub.district === "Velimeşe") && (!toHub || toHub.district === "Velimeşe")) {
            if (typeof VelimeseNavigasyon !== 'undefined' && VelimeseNavigasyon.findSokak) {
                const vFrom = VelimeseNavigasyon.findSokak(effectiveFrom);
                const vTo = VelimeseNavigasyon.findSokak(effectiveTo);
                if (vFrom && vTo && vFrom.id !== vTo.id) {
                    const vRes = VelimeseNavigasyon.rotaOlustur(effectiveFrom, effectiveTo);
                    if (vRes.success) {
                        return {
                            success: true,
                            route: vRes.route,
                            originalRoute: vRes.route,
                            fromStop: fromHub ? fromHub.label : vRes.kalkis.name,
                            toStop: toHub ? toHub.label : vRes.varis.name,
                            stopsCount: vRes.stopsCount,
                            dist: vRes.totalKm
                        };
                    }
                }
            }
        }
        // SARAY İLÇE VE MAHALLELERİ İÇİ FORMÜLSEL NAVİGASYON
        if (hasPassed10 && typeof SarayNavigasyon !== 'undefined' && SarayNavigasyon.findSokak) {
            const sFrom = SarayNavigasyon.findSokak(neredenQuery);
            const sTo = SarayNavigasyon.findSokak(nereyeQuery);
            if (sFrom && sTo && sFrom.id !== sTo.id) {
                const sRes = SarayNavigasyon.rotaOlustur(neredenQuery, nereyeQuery);
                if (sRes.success) {
                    return {
                        success: true,
                        route: sRes.route,
                        originalRoute: sRes.route,
                        fromStop: sRes.kalkis.name,
                        toStop: sRes.varis.name,
                        stopsCount: sRes.stopsCount,
                        dist: sRes.totalKm
                    };
                }
            }
        }
        // SÜLEYMANPAŞA MAHALLELERİ İÇİ FORMÜLSEL NAVİGASYON
        if (typeof SuleymanpasaNavigasyon !== 'undefined' && SuleymanpasaNavigasyon.findSokak) {
            const sFrom = SuleymanpasaNavigasyon.findSokak(neredenQuery);
            const sTo = SuleymanpasaNavigasyon.findSokak(nereyeQuery);
            if (sFrom && sTo && sFrom.id !== sTo.id) {
                const sRes = SuleymanpasaNavigasyon.rotaOlustur(neredenQuery, nereyeQuery);
                if (sRes.success) {
                    return {
                        success: true,
                        route: sRes.route,
                        originalRoute: sRes.route,
                        fromStop: sRes.kalkis.name,
                        toStop: sRes.varis.name,
                        stopsCount: sRes.stopsCount,
                        dist: sRes.totalKm
                    };
                }
            }
        }
        // VELİMEŞE 100 SOKAK İÇİ ÖNCELİKLİ KONTROL
        if (typeof VelimeseNavigasyon !== 'undefined' && VelimeseNavigasyon.findSokak) {
            const vFrom = VelimeseNavigasyon.findSokak(neredenQuery);
            const vTo = VelimeseNavigasyon.findSokak(nereyeQuery);
            if (vFrom && vTo && vFrom.id !== vTo.id) {
                const vRes = VelimeseNavigasyon.rotaOlustur(neredenQuery, nereyeQuery);
                if (vRes.success) {
                    return {
                        success: true,
                        route: vRes.route,
                        originalRoute: vRes.route,
                        fromStop: vRes.kalkis.name,
                        toStop: vRes.varis.name,
                        stopsCount: vRes.stopsCount,
                        dist: vRes.totalKm
                    };
                }
            }
        }
        if (!neredenQuery || !nereyeQuery) {
            return { success: false, message: "Lütfen hem kalkış hem de varış durağını belirtin." };
        }

        const db = (typeof window !== 'undefined' && window.tekulasHatVeritabani && window.tekulasHatVeritabani.length > 0)
            ? window.tekulasHatVeritabani
            : ((typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) ? ilceRotalari["Tekirdağ"] : (typeof routesData !== 'undefined' ? Object.values(routesData) : []));

        if (!db || db.length === 0) {
            return { success: false, message: "Hat veritabanı yüklenemedi." };
        }

        const checkMatch = (stopName, query, hub) => {
            if (!stopName) return false;
            if (query && this.matchStop(stopName, query)) return true;
            if (hub) {
                if (hub.stopName && this.matchStop(stopName, hub.stopName)) return true;
                const sNorm = this.normalizeText(stopName);
                if (hub.keys && hub.keys.some(k => sNorm.includes(k) || k.includes(sNorm))) return true;
            }
            return false;
        };

        const candidates = [];

        db.forEach(route => {
            if (!route.stops || route.stops.length < 2) return;
            // Seviye 10 altındayken ilçe seferleri ve şehirlerarası hatlar tamamen filtrelenir
            if (!hasPassed10 && (route.isDistrict || (route.destDistrict && route.destDistrict !== "Süleymanpaşa") || (route.originDistrict && route.originDistrict !== "Süleymanpaşa"))) return;

            let fromIdx = -1;
            let toIdx = -1;

            for (let i = 0; i < route.stops.length; i++) {
                const s = route.stops[i];
                if (fromIdx === -1 && checkMatch(s.name, neredenQuery, fromHub)) {
                    fromIdx = i;
                }
                if (fromIdx !== -1 && i > fromIdx && checkMatch(s.name, nereyeQuery, toHub)) {
                    toIdx = i;
                }
            }

            if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
                const subStops = route.stops.slice(fromIdx, toIdx + 1);
                const dist = subStops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);
                candidates.push({
                    route: route,
                    fromStop: route.stops[fromIdx].name,
                    toStop: route.stops[toIdx].name,
                    fromIdx: fromIdx,
                    toIdx: toIdx,
                    stopsCount: subStops.length,
                    dist: Math.max(0.8, Math.round(dist * 10) / 10),
                    subStops: subStops
                });
            }
        });

        // İLÇELER ARASI KORİDOR VE EKSPRES BAĞLANTI DESTEĞİ
        if (hasPassed10 && candidates.length === 0 && fromHub && toHub && fromHub.district !== toHub.district) {
            const interDistrict = db.find(r => 
                (r.id === "hat_saray_ekspres" && fromHub.district === "Süleymanpaşa" && toHub.district === "Saray") ||
                ((r.hatNo === "26" || r.hatNo === "226") && fromHub.district === "Süleymanpaşa" && toHub.district === "Saray") ||
                ((r.hatNo === "26" || r.hatNo === "226" || r.id === "hat_saray_ekspres") && fromHub.district === "Saray" && toHub.district === "Süleymanpaşa") ||
                ((r.originDistrict === fromHub.district && r.destDistrict === toHub.district) || (r.destDistrict === fromHub.district && r.originDistrict === toHub.district))
            );
            if (interDistrict && interDistrict.stops && interDistrict.stops.length > 1) {
                const isReverse = (interDistrict.destDistrict === fromHub.district && interDistrict.originDistrict === toHub.district);
                const activeStops = isReverse ? [...interDistrict.stops].reverse() : interDistrict.stops;
                candidates.push({
                    route: interDistrict,
                    fromStop: activeStops[0].name,
                    toStop: activeStops[activeStops.length - 1].name,
                    fromIdx: 0,
                    toIdx: activeStops.length - 1,
                    stopsCount: activeStops.length,
                    dist: interDistrict.totalKm || 62,
                    subStops: activeStops
                });
            }
        }

        if (candidates.length === 0) {
            return { 
                success: false, 
                message: `"${neredenQuery}" ile "${nereyeQuery}" arasında doğrudan bir hat bulunamadı. Lütfen durak isimlerini kontrol edin.` 
            };
        }

        // En az duraklı ve en direkt adayı seç
        candidates.sort((a, b) => a.stopsCount - b.stopsCount);
        const best = candidates[0];

        // Bu rota için özelleştirilmiş yeni bir simülasyon rotası üret
        const smartStops = [];
        for (let j = 0; j < best.subStops.length; j++) {
            const orig = best.subStops[j];
            const isFirst = j === 0;
            const isLast = j === best.subStops.length - 1;

            let anons = `Sonraki durak: ${orig.name}.`;
            if (isFirst) {
                anons = `${best.fromStop} kalkış peronundayız. Hat ${best.route.hatNo} ile ${best.toStop} seferi başlıyor.`;
            } else if (isLast) {
                anons = `Son durak: ${best.toStop}. Seferimiz tamamlanmıştır. Lütfen eşyalarınızı unutmayınız.`;
            } else if (orig.anons && !orig.anons.includes("seferi başlıyor") && !orig.anons.includes("tamamlanmıştır")) {
                anons = orig.anons;
            }

            smartStops.push({
                name: orig.name,
                anons: anons,
                bekleyenYolcu: isFirst ? 20 : (isLast ? 0 : (((j * 3 + 2) % 5) + 1)),
                inenYolcu: isFirst ? 0 : (isLast ? 20 : (((j * 2 + 1) % 4) + 1)),
                gercekMesafeSonraki: isLast ? 0 : (orig.gercekMesafeSonraki || 0.8),
                lat: orig.lat,
                lon: orig.lon
            });
        }

        const smartId = `smart_${best.route.id}_${best.fromIdx}_${best.toIdx}`;
        const smartRoute = {
            id: smartId,
            hatNo: best.route.hatNo,
            name: `Akıllı Rota: ${best.fromStop} ➔ ${best.toStop}`,
            rawName: `${best.route.name} (${best.fromStop} - ${best.toStop})`,
            district: best.route.district,
            originDistrict: best.route.district,
            destDistrict: best.route.district,
            isDistrict: best.route.isDistrict,
            isCity: best.route.isCity,
            sehir: best.route.sehir || "Tekirdağ",
            color: "#38bdf8",
            startStop: best.fromStop,
            endStop: best.toStop,
            intermediateStops: smartStops.slice(1, -1).map(s => s.name),
            totalKm: best.dist,
            biletFiyat: 39,
            biletFiyatMultiplier: 1.0,
            otobusKapasitesi: 36,
            terrain: "asfalt",
            desc: `Akıllı Rota Sistemi: ${best.fromStop} ➔ ${best.toStop}. Hat ${best.route.hatNo} ile ${smartStops.length} durak, ${best.dist} km.`,
            speechBriefing: `Akıllı rota oluşturuldu. ${best.fromStop} durağından ${best.toStop} durağına Hat ${best.route.hatNo} ile seferiniz başlıyor. Toplam ${smartStops.length} durak, ${best.dist} kilometre.`,
            detailedInstructions: `Akıllı Rota (Hat ${best.route.hatNo})\n` +
                smartStops.map((s, idx) => `${idx + 1}. Adım: ${s.name}`).join('\n'),
            stops: smartStops
        };

        if (typeof routesData !== 'undefined') {
            routesData[smartId] = smartRoute;
        }

        return {
            success: true,
            route: smartRoute,
            originalRoute: best.route,
            fromStop: best.fromStop,
            toStop: best.toStop,
            stopsCount: smartStops.length,
            dist: best.dist
        };
    },

    baslat: function(neredenQuery, nereyeQuery) {
        const res = this.hesapla(neredenQuery, nereyeQuery);
        if (!res.success) {
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(res.message);
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(res.message, "warning");
            }
            return false;
        }

        this.closeModal();

        const msg = `Akıllı rota hazır: ${res.fromStop} durağından ${res.toStop} durağına Hat ${res.route.hatNo} ile ${res.stopsCount} duraklık sefer başlıyor. Toplam ${res.dist} kilometre. İyi yolculuklar kaptan.`;
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(msg);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`Akıllı Rota: ${res.fromStop} ➔ ${res.toStop} (Hat ${res.route.hatNo})`, "success");
        }

        if (typeof AkilliSistem !== 'undefined' && AkilliSistem.autoAssignBusForRoute) {
            AkilliSistem.autoAssignBusForRoute(res.route);
        }
        if (typeof Game !== 'undefined' && Game.startRoute) {
            Game.startRoute(res.route.id);
        }
        return true;
    },

        updateDistrictUI: function() {
        const activeDist = this.getActiveDistrict();
        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;

        // Sekme butonlarını güncelle
        ['spasa', 'saray', 'velimese', 'intercity'].forEach(tabKey => {
            const btn = document.getElementById('tab-dist-' + tabKey);
            if (!btn) return;
            if (tabKey === 'intercity') {
                btn.style.display = hasPassed10 ? 'inline-block' : 'none';
            }
            const isMatch = (tabKey === 'spasa' && activeDist === 'Süleymanpaşa') ||
                            (tabKey === 'saray' && activeDist === 'Saray') ||
                            (tabKey === 'velimese' && activeDist === 'Velimeşe') ||
                            (tabKey === 'intercity' && activeDist === 'all');

            if (isMatch) {
                btn.style.background = 'rgba(56,189,248,0.3)';
                btn.style.borderColor = '#38bdf8';
                btn.style.color = '#fff';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.background = 'rgba(255,255,255,0.06)';
                btn.style.borderColor = 'rgba(255,255,255,0.2)';
                btn.style.color = '#94a3b8';
                btn.style.fontWeight = 'normal';
            }
        });

        // Datalist doldur (Sadece seçili bölgenin mahalle ve ana durakları)
        const datalist = document.getElementById('smart-stops-datalist');
        if (datalist) {
            datalist.innerHTML = '';
            const stops = this.getAllStops();
            stops.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                datalist.appendChild(opt);
            });
        }

        // Popüler merkez butonları (Seçili bölgeye özel)
        const pillsContainer = document.getElementById('smart-pills-container');
        if (pillsContainer) {
            pillsContainer.innerHTML = '';
            let popularStops = [];
            if (activeDist === 'Saray') {
                popularStops = [
                    "Ayaspaşa Çarşı",
                    "Saray Otogarı",
                    "Saray Devlet Hastanesi",
                    "Saray Fakülte Kampüsü",
                    "100. Yıl Parklar",
                    "Büyükyoncalı Merkez",
                    "Çukuryurt Meydan"
                ];
            } else if (activeDist === 'Velimeşe') {
                popularStops = [
                    "Velimeşe Merkez",
                    "Velimeşe Sanayi Bölgesi",
                    "Velimeşe TOKİ Konutları"
                ];
            } else if (activeDist === 'all' && hasPassed10) {
                popularStops = [
                    "Değirmenaltı Kampüs",
                    "Valilik & Hükümet Cd.",
                    "Süleymanpaşa Otogar",
                    "Saray Otogarı",
                    "Saray Devlet Hastanesi",
                    "Çorlu Otogarı",
                    "Çerkezköy Otogarı"
                ];
            } else {
                popularStops = [
                    "Değirmenaltı Kampüs",
                    "Valilik & Hükümet Cd.",
                    "Şehir Hastanesi",
                    "Süleymanpaşa Otogar",
                    "Köprübaşı & Çarşı",
                    "Atatürk Spor Salonu",
                    "Altınova Sahil",
                    "Baykallar & Emniyet"
                ];
            }

            popularStops.forEach(st => {
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = 'modern-btn';
                pill.style.padding = '5px 10px';
                pill.style.fontSize = '0.85rem';
                pill.style.background = 'rgba(56,189,248,0.15)';
                pill.style.border = '1px solid rgba(56,189,248,0.4)';
                pill.style.color = '#38bdf8';
                pill.innerText = st;
                pill.onclick = () => {
                    const fromInput = document.getElementById('smart-from-input');
                    const toInput = document.getElementById('smart-to-input');
                    if (!fromInput.value) {
                        fromInput.value = st;
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Kalkış: ${st}`);
                        toInput.focus();
                    } else {
                        toInput.value = st;
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Varış: ${st}`);
                    }
                };
                pillsContainer.appendChild(pill);
            });
        }

        // Placeholder güncelle
        const fromInput = document.getElementById('smart-from-input');
        const toInput = document.getElementById('smart-to-input');
        if (fromInput && toInput) {
            if (activeDist === 'Saray') {
                fromInput.placeholder = "Örn: Ayaspaşa Çarşı, Saray Otogar, Büyükyoncalı...";
                toInput.placeholder = "Örn: Saray Devlet Hastanesi, Fakülte Kampüs...";
            } else if (activeDist === 'Velimeşe') {
                fromInput.placeholder = "Örn: Velimeşe Merkez Meydan, Çetin Sokak...";
                toInput.placeholder = "Örn: Velimeşe TOKİ Konutları, Sanayi Bölgesi...";
            } else {
                fromInput.placeholder = "Örn: Değirmenaltı Kampüs, Valilik & Hükümet Cd....";
                toInput.placeholder = "Örn: Şehir Hastanesi, Atatürk Spor Salonu...";
            }
        }
    },

    openModal: function() {
        const modal = document.getElementById('smart-route-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        this.updateDistrictUI();

        const fromInput = document.getElementById('smart-from-input');
        if (fromInput) {
            fromInput.focus();
        }

        const activeDist = this.getActiveDistrict();
        const speechNotice = `Akıllı Rota Sistemi açıldı. Aktif bölgeniz: ${activeDist}. Sadece bu bölgenin mahalle ve durakları listeleniyor. Ara durakları sürüş esnasında keşfedeceksiniz.`;
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(speechNotice);
        }
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    closeModal: function() {
        const modal = document.getElementById('smart-route-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    init: function() {
                // Bölge Seçim Sekmeleri Dinleyicileri
        const tabConfigs = [
            { id: 'tab-dist-spasa', dist: 'Süleymanpaşa', name: 'Süleymanpaşa' },
            { id: 'tab-dist-saray', dist: 'Saray', name: 'Saray' },
            { id: 'tab-dist-velimese', dist: 'Velimeşe', name: 'Velimeşe' },
            { id: 'tab-dist-intercity', dist: 'all', name: 'Tüm İlçeler' }
        ];

        tabConfigs.forEach(tc => {
            const btn = document.getElementById(tc.id);
            if (btn) {
                btn.addEventListener('click', () => {
                    if (typeof Game !== 'undefined' && Game.setActiveDistrict) {
                        Game.setActiveDistrict(tc.dist);
                    } else {
                        localStorage.setItem('activeDistrict', tc.dist);
                        this.updateDistrictUI();
                    }
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak(`Bölge değiştirildi: ${tc.name}. Sadece ${tc.name} mahalle ve durakları listeleniyor.`);
                    }
                });
            }
        });

        const btnOpen = document.getElementById('btn-open-smart-route');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => this.openModal());
        }

        const btnClose = document.getElementById('btn-smart-modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        const btnCancel = document.getElementById('btn-smart-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.closeModal());
        }

        const btnRecommend = document.getElementById('btn-smart-recommend');
        if (btnRecommend) {
            btnRecommend.addEventListener('click', () => {
                this.closeModal();
                if (typeof AkilliSistem !== 'undefined' && AkilliSistem.recommendSmartRoute) {
                    AkilliSistem.recommendSmartRoute();
                }
            });
        }

        const btnCalc = document.getElementById('btn-smart-calculate');
        if (btnCalc) {
            btnCalc.addEventListener('click', () => {
                const fromVal = (document.getElementById('smart-from-input') || {}).value;
                const toVal = (document.getElementById('smart-to-input') || {}).value;
                this.baslat(fromVal, toVal);
            });
        }

        ['smart-from-input', 'smart-to-input'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const fromVal = (document.getElementById('smart-from-input') || {}).value;
                        const toVal = (document.getElementById('smart-to-input') || {}).value;
                        if (id === 'smart-from-input' && !toVal) {
                            document.getElementById('smart-to-input').focus();
                        } else {
                            this.baslat(fromVal, toVal);
                        }
                    }
                });
            }
        });
    }
};

if (typeof window !== 'undefined') {
    window.AkilliRotaSistemi = AkilliRotaSistemi;
    document.addEventListener('DOMContentLoaded', () => {
        AkilliRotaSistemi.init();
    });
}


// Velimeşe 100 Sokak Hızlı Mod Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnV = document.getElementById('btn-velimese-quick-mode');
        if (btnV) {
            btnV.addEventListener('click', () => {
                if (typeof Game !== 'undefined' && !Game.hasPassedLevel10()) return;
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Velimeşe Çetin Sokak";
                    toInput.value = "Velimeşe TOKİ 233. Sokak";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Velimeşe 100 Sokak İçi Ulaşım Modu devrede. Kalkış: Çetin Sokak, Varış: TOKİ 233. Sokak. Dilerseniz sokakları değiştirebilirsiniz.");
                    }
                }
            });
        }
    });
}


// Süleymanpaşa Hızlı Mod Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnSp = document.getElementById('btn-spasa-quick-mode');
        if (btnSp) {
            btnSp.addEventListener('click', () => {
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Üniversite Caddesi";
                    toInput.value = "Yeni Otogar Caddesi";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Süleymanpaşa 7 Mahalle Sefer Modu devrede. Kalkış: Üniversite Caddesi Kampüs, Varış: Yeni Otobüs Terminali. Toplam mesafe ve süre formülle hesaplanıyor.");
                    }
                }
            });
        }
    });
}

// Saray 62 KM Direkt Ekspres Hızlı Mod Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnS = document.getElementById('btn-saray-quick-mode');
        if (btnS) {
            btnS.addEventListener('click', () => {
                if (typeof Game !== 'undefined' && !Game.hasPassedLevel10()) return;
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Süleymanpaşa Yeni Otobüs Terminali";
                    toInput.value = "Saray Belediyesi Otogarı";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Süleymanpaşa Saray 62 kilometre direkt ekspres hattı devrede. Kalkış: Süleymanpaşa Yeni Otogar, Varış: Saray Belediyesi Otogarı.");
                    }
                }
            });
        }
    });
}

// Saray Şehir İçi Sefer Modu Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnSm = document.getElementById('btn-saray-mahalle-mode');
        if (btnSm) {
            btnSm.addEventListener('click', () => {
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Saray Otogar 1 (Giriş Peronu)";
                    toInput.value = "Saray Devlet Hastanesi Ana Giriş";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Saray Şehir İçi 25 Duraklı Sefer Modu devrede. Kalkış: Saray Otogarı, Varış: Saray Devlet Hastanesi. Dilerseniz durakları değiştirebilirsiniz.");
                    }
                }
            });
        }
    });
}

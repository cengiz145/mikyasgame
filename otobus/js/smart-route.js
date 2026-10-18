/* ==========================================================================
   AKILLI ROTA SİSTEMİ (SMART ROUTE SYSTEM)
   Kullanıcı sadece Nereden ve Nereye gitmek istediğini seçer;
   Gidiş / Dönüş yönünü ve en uygun TEKULAŞ hattını sistem otomatik hesaplar.
   ========================================================================== */

const AkilliRotaSistemi = {
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
        // Hat 26 Saray Alias Desteği
        if (qNorm.includes("26") || qNorm.includes("saray") || qNorm.includes("226")) {
            if (sNorm.includes("saray") || sNorm.includes("cerkezkoy") || sNorm.includes("kapakli") || sNorm.includes("suleymanpasa")) {
                return true;
            }
        }
        // Velimeşe Çetin Sokak Alias Desteği
        if ((qNorm.includes("cetin") || qNorm.includes("cetin sokak")) && sNorm.includes("cetin")) {
            return true;
        }
        if (qWords.length === 0) return sNorm.includes(qNorm);
        return qWords.every(w => sNorm.includes(w));
    },

    getAllStops: function() {
        if (this.allStopsCache && this.allStopsCache.length > 0) {
            return this.allStopsCache;
        }

        const stopSet = new Set();
        const db = (typeof window !== 'undefined' && window.tekulasHatVeritabani) ? window.tekulasHatVeritabani : [];

        db.forEach(route => {
            if (route.stops && Array.isArray(route.stops)) {
                route.stops.forEach(s => {
                    if (s.name && s.name.trim().length > 0) {
                        stopSet.add(s.name.trim());
                    }
                });
            }
        });

        this.allStopsCache = Array.from(stopSet).sort((a, b) => a.localeCompare(b, 'tr'));
        return this.allStopsCache;
    },

    hesapla: function(neredenQuery, nereyeQuery) {
        if (!neredenQuery || !nereyeQuery) {
            return { success: false, message: "Lütfen hem kalkış hem de varış durağını belirtin." };
        }

        const db = (typeof window !== 'undefined' && window.tekulasHatVeritabani) ? window.tekulasHatVeritabani : [];
        if (!db || db.length === 0) {
            return { success: false, message: "Hat veritabanı yüklenemedi." };
        }

        const candidates = [];

        db.forEach(route => {
            if (!route.stops || route.stops.length < 2) return;

            let fromIdx = -1;
            let toIdx = -1;

            for (let i = 0; i < route.stops.length; i++) {
                const s = route.stops[i];
                if (fromIdx === -1 && this.matchStop(s.name, neredenQuery)) {
                    fromIdx = i;
                }
                if (fromIdx !== -1 && i > fromIdx && this.matchStop(s.name, nereyeQuery)) {
                    toIdx = i;
                    break;
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
                bekleyenYolcu: isFirst ? 20 : (isLast ? 0 : (((i * 3 + 2) % 5) + 1)),
                inenYolcu: isFirst ? 0 : (isLast ? 20 : (((i * 2 + 1) % 4) + 1)),
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

    openModal: function() {
        const modal = document.getElementById('smart-route-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        // Datalist doldur
        const datalist = document.getElementById('smart-stops-datalist');
        if (datalist && datalist.children.length === 0) {
            const stops = this.getAllStops();
            stops.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                datalist.appendChild(opt);
            });
        }

        // Popüler merkezler
        const pillsContainer = document.getElementById('smart-pills-container');
        if (pillsContainer && pillsContainer.children.length === 0) {
            const popularStops = [
                "Atatürk Spor Salonu",
                "Cumhuriyet Meydanı",
                "Valilik",
                "Köprübaşı",
                "Rüstempaşa Cami",
                "Değirmenaltı",
                "Araştırma Hastanesi",
                "Tepekent"
            ];

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

        const fromInput = document.getElementById('smart-from-input');
        if (fromInput) {
            fromInput.focus();
        }

        const speechNotice = "Akıllı Rota Sistemi açıldı. Nereden nereye gitmek istediğinizi yazın veya seçin; yönü ve hattı sistem hesaplasın.";
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

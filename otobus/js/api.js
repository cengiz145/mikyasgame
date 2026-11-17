/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU API DOSYASI (API.JS)
   ========================================================================== */

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

let isFetchingStops = false;

async function fetchStopsFromOverpass(queryStr) {
    if (isFetchingStops) {
        console.warn("Spam koruması: Harita verisi şu an çekiliyor, mükerrer istek iptal edildi.");
        throw new Error("FETCH_IN_PROGRESS");
    }
    isFetchingStops = true;

    const url = "https://overpass-api.de/api/interpreter";
    
    let finalQuery = queryStr;
    if (!finalQuery.includes("[out:json]")) {
        finalQuery = "[out:json][timeout:15];\n" + finalQuery;
    }
    if (!finalQuery.includes("out body;")) {
        finalQuery += "\nout body;";
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // Hızlı zaman aşımı: Overpass takılırsa 4 sn içinde gerçek duraklar devreye girer // 12 saniye mutlak sınır

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "data=" + encodeURIComponent(finalQuery),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
        }

        const veri = await response.json();
        
        if (!veri.elements || veri.elements.length === 0) {
            isFetchingStops = false;
            return [];
        }

        const temizDuraklar = veri.elements
            .filter(d => d.type === "node" && d.tags && (d.tags.highway === "bus_stop" || d.tags.amenity === "bus_station"))
            .map(durak => {
                return {
                    name: durak.tags.name || "İsimsiz Durak",
                    lat: durak.lat,
                    lon: durak.lon
                };
            });

        if (typeof window !== 'undefined') {
            window.lastFetchedBumps = veri.elements
                .filter(d => d.type === "node" && d.tags && d.tags.traffic_calming && (d.tags.traffic_calming === "bump" || d.tags.traffic_calming === "hump"))
                .map(b => ({ lat: b.lat, lon: b.lon }));
        }

        isFetchingStops = false;
        return temizDuraklar;

    } catch (error) {
        isFetchingStops = false;
        console.error("Duraklar çekilirken hata oluştu:", error);
        throw error;
    }
}

// Her Seçilen İlçe İçin Kesintisiz, Kaldığı Yerden Devam Eden ve 4 Durakla Başlayan 10 Görevli Şehir Turu Motoru
function buildDistrictContinuousCircuit(districtName, tekulasDb) {
    let master = [];
    let defaultLineRef = null;

    const normDist = (!districtName || districtName === "all" || districtName === "Tekirdağ") ? "Süleymanpaşa" : districtName;

    const isValidLocalLine = (r, targetDist) => {
        if (!r || !Array.isArray(r.stops) || r.stops.length < 3) return false;
        if (r.isReturn || r.isDistrict) return false;
        const s0 = String(r.startStop || (r.stops[0] && r.stops[0].name) || '').trim();
        const sEnd = String(r.endStop || (r.stops[r.stops.length - 1] && r.stops[r.stops.length - 1].name) || '').trim();
        if (/^(İLK DURAK|SON DURAK)$/i.test(s0) || /^(İLK DURAK|SON DURAK)$/i.test(sEnd)) return false;
        return r.district === targetDist;
    };

    const appendStopsCleanly = (stopsArr) => {
        if (!Array.isArray(stopsArr)) return;
        stopsArr.forEach(s => {
            if (!s || !s.name || /^(İLK DURAK|SON DURAK)$/i.test(String(s.name).trim())) return;
            const last = master.length > 0 ? master[master.length - 1] : null;
            if (last && String(last.name).trim().toUpperCase() === String(s.name).trim().toUpperCase()) return;
            master.push(Object.assign({}, s));
        });
    };

    if (normDist === "Süleymanpaşa") {
        // Gerçek Süleymanpaşa hatları: 2/7 (100. Yıl - Hükümet - Köprübaşı - Değirmenaltı - NKÜ - Tepekent), 18 (NKÜ - Şehir Hastanesi), 29 (Yeni Otogar - Altınova)
        const h2_7 = tekulasDb.find(r => r.id === 'tekulas_152_2_7') || tekulasDb.find(r => isValidLocalLine(r, 'Süleymanpaşa') && r.hatNo === '2/7');
        const h18 = tekulasDb.find(r => r.id === 'tekulas_175_18') || tekulasDb.find(r => isValidLocalLine(r, 'Süleymanpaşa') && r.hatNo === '18');
        const h29 = tekulasDb.find(r => r.id === 'tekulas_169_29') || tekulasDb.find(r => isValidLocalLine(r, 'Süleymanpaşa') && r.hatNo === '29');
        const picked = [h2_7, h18, h29].filter(Boolean);
        if (picked.length > 0) {
            picked.forEach(l => appendStopsCleanly(l.stops));
            defaultLineRef = picked[0];
        } else {
            const sulLines = tekulasDb.filter(r => isValidLocalLine(r, 'Süleymanpaşa'));
            sulLines.slice(0, 3).forEach(l => appendStopsCleanly(l.stops));
            defaultLineRef = sulLines[0] || { id: "sul_master", name: "Süleymanpaşa Şehir İçi Hatları", district: "Süleymanpaşa", totalKm: 24 };
        }
    } else if (normDist === "Çorlu") {
        const h1 = tekulasDb.find(r => r.id === 'tekulas_1_1_yesiltepe') || tekulasDb.find(r => isValidLocalLine(r, 'Çorlu'));
        const h2 = tekulasDb.find(r => r.id === 'tekulas_3_2') || tekulasDb.filter(r => isValidLocalLine(r, 'Çorlu'))[1];
        if (h1 && h1.stops) appendStopsCleanly(h1.stops);
        if (h2 && h2.stops) appendStopsCleanly(h2.stops);
        defaultLineRef = h1 || { id: "corlu_master", name: "Çorlu Şehir İçi Hatları", district: "Çorlu", totalKm: 22 };
    } else if (normDist === "Çerkezköy") {
        const cLines = tekulasDb.filter(r => isValidLocalLine(r, "Çerkezköy") && r.stops.length >= 6);
        const sourceLines = cLines.length > 0 ? cLines.slice(0, 3) : tekulasDb.filter(r => isValidLocalLine(r, "Çerkezköy"));
        sourceLines.forEach(l => appendStopsCleanly(l.stops));
        defaultLineRef = sourceLines[0] || { id: "cerkezkoy_master", name: "Çerkezköy Şehir İçi Hatları", district: "Çerkezköy", totalKm: 18 };
    } else if (normDist === "Kapaklı") {
        const kLines = tekulasDb.filter(r => isValidLocalLine(r, "Kapaklı"));
        kLines.slice(0, 3).forEach(l => appendStopsCleanly(l.stops));
        defaultLineRef = kLines[0] || { id: "kapakli_master", name: "Kapaklı İlçe İçi Hatları", district: "Kapaklı", totalKm: 16 };
    } else if (normDist === "Marmaraereğlisi" || normDist === "Marmara Ereğlisi") {
        const meStops = [
            { name: "MARMARAEREĞLİSİ OTOGARI", lat: 40.9686, lon: 27.9553, gercekMesafeSonraki: 1.2, yolTipi: "Asfalt Cadde" },
            { name: "HÜKÜMET KONAĞI & BELEDİYE", lat: 40.9702, lon: 27.9575, gercekMesafeSonraki: 1.0, yolTipi: "Asfalt Cadde" },
            { name: "PERİNTHOS ANTİK KENTİ GİRİŞİ", lat: 40.9720, lon: 27.9620, gercekMesafeSonraki: 1.4, yolTipi: "Sahil Şeridi Yolu" },
            { name: "MARMARAEREĞLİSİ DEVLET HASTANESİ", lat: 40.9745, lon: 27.9680, gercekMesafeSonraki: 2.1, yolTipi: "Asfalt Cadde" },
            { name: "ÇEŞMELİ KAVŞAĞI", lat: 40.9780, lon: 27.9750, gercekMesafeSonraki: 2.5, yolTipi: "Asfalt Cadde" },
            { name: "D-110 SAHİL YOLU DURAĞI", lat: 40.9750, lon: 27.9820, gercekMesafeSonraki: 2.2, yolTipi: "Sahil Şeridi Yolu" },
            { name: "KAMELYA CADDESİ & PLAJ", lat: 40.9730, lon: 27.9890, gercekMesafeSonraki: 1.8, yolTipi: "Sahil Şeridi Yolu" },
            { name: "YENİÇİFTLİK VATAN CADDESİ", lat: 40.9820, lon: 27.9920, gercekMesafeSonraki: 1.3, yolTipi: "Asfalt Cadde" },
            { name: "YENİÇİFTLİK BELEDİYE MEYDANI", lat: 40.9850, lon: 27.9950, gercekMesafeSonraki: 1.6, yolTipi: "Asfalt Cadde" },
            { name: "YENİÇİFTLİK SAHİL ÇARŞISI", lat: 40.9810, lon: 28.0050, gercekMesafeSonraki: 3.2, yolTipi: "Sahil Şeridi Yolu" },
            { name: "SULTANKÖY GİRİŞ KAVŞAĞI", lat: 40.9890, lon: 28.0200, gercekMesafeSonraki: 1.9, yolTipi: "Asfalt Cadde" },
            { name: "SULTANKÖY MERKEZ MEYDANI", lat: 40.9920, lon: 28.0280, gercekMesafeSonraki: 1.5, yolTipi: "Asfalt Cadde" },
            { name: "SULTANKÖY SAHİL & BOTAŞ GİRİŞİ", lat: 40.9950, lon: 28.0350, gercekMesafeSonraki: 1.8, yolTipi: "Sahil Şeridi Yolu" },
            { name: "MARMARAEREĞLİSİ DÖNÜŞ PERONU", lat: 40.9686, lon: 27.9553, gercekMesafeSonraki: 0.0, yolTipi: "Asfalt Cadde" }
        ];
        appendStopsCleanly(meStops);
        defaultLineRef = { id: "me_master", name: "Marmaraereğlisi Sahil ve Perinthos Seferleri", district: "Marmaraereğlisi", totalKm: 23.5 };
    } else if (normDist === "Velimeşe") {
        if (typeof velimeseTumDuraklarListesi !== 'undefined' && Array.isArray(velimeseTumDuraklarListesi) && velimeseTumDuraklarListesi.length >= 10) {
            appendStopsCleanly(velimeseTumDuraklarListesi);
        } else {
            const velimeseSokaklar = (typeof VelimeseNavigasyon !== 'undefined' && VelimeseNavigasyon.sokaklar)
                ? VelimeseNavigasyon.sokaklar
                : ((typeof window !== 'undefined' && window.VelimeseNavigasyon) ? window.VelimeseNavigasyon.sokaklar : []);
            if (velimeseSokaklar && velimeseSokaklar.length >= 12) {
                appendStopsCleanly(velimeseSokaklar.slice(0, 30).map(s => ({
                    name: s.name,
                    lat: s.lat,
                    lon: s.lon,
                    yolTipi: (s.cat === "Sanayi" ? "Asfalt Cadde" : "Mahalle Sokağı")
                })));
            }
        }
        defaultLineRef = { id: "velimese_master", name: "Velimeşe Mahalle ve OSB Ring Seferleri", district: "Velimeşe", totalKm: 18 };
    } else if (normDist === "Ergene") {
        const ergStops = [
            { name: "ERGENE BELEDİYESİ (MARMARACIK MERKEZ)", lat: 41.2281, lon: 27.7028, gercekMesafeSonraki: 1.1, yolTipi: "Asfalt Cadde" },
            { name: "MARMARACIK MEYDAN & ÇARŞI", lat: 41.2295, lon: 27.7050, gercekMesafeSonraki: 1.4, yolTipi: "Asfalt Cadde" },
            { name: "ERGENE DEVLET HASTANESİ BÖLGESİ", lat: 41.2330, lon: 27.7120, gercekMesafeSonraki: 2.8, yolTipi: "Asfalt Cadde" },
            { name: "SAĞLIK MAHALLESİ EDİRNE CADDESİ", lat: 41.2050, lon: 27.7350, gercekMesafeSonraki: 1.2, yolTipi: "Asfalt Cadde" },
            { name: "SAĞLIK MAHALLESİ PAZAR YERİ", lat: 41.2020, lon: 27.7380, gercekMesafeSonraki: 1.5, yolTipi: "Mahalle Sokağı" },
            { name: "YEŞİLTEPE MAHALLESİ MEYDANI", lat: 41.1980, lon: 27.7420, gercekMesafeSonraki: 1.3, yolTipi: "Asfalt Cadde" },
            { name: "YEŞİLTEPE ÇARŞI CADDESİ", lat: 41.1950, lon: 27.7460, gercekMesafeSonraki: 3.2, yolTipi: "Asfalt Cadde" },
            { name: "VAKIFLAR KAVŞAĞI & SANAYİ", lat: 41.2380, lon: 27.7550, gercekMesafeSonraki: 2.4, yolTipi: "Asfalt Cadde" },
            { name: "ULAŞ BELDE MEYDANI", lat: 41.2510, lon: 27.7780, gercekMesafeSonraki: 3.1, yolTipi: "Asfalt Cadde" },
            { name: "MİSİNLİ KÖY YOLU AYRIMI", lat: 41.2650, lon: 27.8100, gercekMesafeSonraki: 3.8, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE OSB 1. CADDE", lat: 41.2420, lon: 27.8550, gercekMesafeSonraki: 1.6, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE TOKİ KONUTLARI", lat: 41.2470, lon: 27.8680, gercekMesafeSonraki: 1.5, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE MERKEZ ÇARŞI", lat: 41.2520, lon: 27.8790, gercekMesafeSonraki: 1.2, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE TREN İSTASYONU", lat: 41.2540, lon: 27.8820, gercekMesafeSonraki: 0.0, yolTipi: "Asfalt Cadde" }
        ];
        appendStopsCleanly(ergStops);
        defaultLineRef = { id: "ergene_master", name: "Ergene Beldeler ve OSB Seferleri", district: "Ergene", totalKm: 26.1 };
    } else if (normDist === "Saray") {
        const saraySokaklar = (typeof SarayNavigasyon !== 'undefined' && SarayNavigasyon.sokaklar)
            ? SarayNavigasyon.sokaklar
            : ((typeof window !== 'undefined' && window.SarayNavigasyon) ? window.SarayNavigasyon.sokaklar : []);
        if (saraySokaklar && saraySokaklar.length >= 15) {
            appendStopsCleanly(saraySokaklar.slice(0, 35).map(s => ({
                name: s.name,
                lat: s.lat,
                lon: s.lon,
                yolTipi: (s.cat === "Sokak" ? "Mahalle Sokağı" : (s.cat === "Köy Yolu" ? "Toprak Yol" : "Asfalt Cadde"))
            })));
        } else {
            const sLines = tekulasDb.filter(r => isValidLocalLine(r, "Saray"));
            sLines.slice(0, 3).forEach(l => appendStopsCleanly(l.stops));
        }
        defaultLineRef = { id: "saray_master", name: "Saray İlçe İçi Seferleri", district: "Saray", totalKm: 18 };
    } else if (normDist === "Muratlı") {
        const mLines = tekulasDb.filter(r => isValidLocalLine(r, "Muratlı"));
        mLines.slice(0, 3).forEach(l => appendStopsCleanly(l.stops));
        const muratliExtraStops = [
            { name: "MURATLI TREN GARI", lat: 41.1712, lon: 27.5023, gercekMesafeSonraki: 1.1, yolTipi: "Asfalt Cadde" },
            { name: "MURATLI BELEDİYESİ", lat: 41.1725, lon: 27.5045, gercekMesafeSonraki: 0.9, yolTipi: "Asfalt Cadde" },
            { name: "ŞEHİT YÜZBAŞI MAYADAĞLI CAD", lat: 41.1741, lon: 27.5068, gercekMesafeSonraki: 1.3, yolTipi: "Asfalt Cadde" },
            { name: "MURATLI ÇARŞI MEYDANI", lat: 41.1755, lon: 27.5089, gercekMesafeSonraki: 1.0, yolTipi: "Asfalt Cadde" },
            { name: "MURATLI DEVLET HASTANESİ", lat: 41.1780, lon: 27.5120, gercekMesafeSonraki: 1.4, yolTipi: "Asfalt Cadde" },
            { name: "MURATLI SANAYİ SİTESİ", lat: 41.1820, lon: 27.5180, gercekMesafeSonraki: 1.8, yolTipi: "Asfalt Cadde" },
            { name: "İNANLI ÇEŞMESİ & MESİRE YERİ", lat: 41.1860, lon: 27.5240, gercekMesafeSonraki: 2.1, yolTipi: "Asfalt Cadde" },
            { name: "AŞAĞISEVİNDİK KAVŞAĞI", lat: 41.1910, lon: 27.5310, gercekMesafeSonraki: 1.7, yolTipi: "Asfalt Cadde" },
            { name: "YUKARISEVİNDİK MERKEZ", lat: 41.1960, lon: 27.5380, gercekMesafeSonraki: 2.0, yolTipi: "Mahalle Sokağı" },
            { name: "MURATLI OTOGARI", lat: 41.1700, lon: 27.5010, gercekMesafeSonraki: 0.0, yolTipi: "Asfalt Cadde" }
        ];
        if (master.length < 10) {
            master = [];
            appendStopsCleanly(muratliExtraStops);
            defaultLineRef = { id: "muratli_master", name: "Muratlı Şehir İçi ve Tren Garı Seferleri", district: "Muratlı", totalKm: 13.3 };
        } else {
            defaultLineRef = mLines[0];
        }
    } else {
        // Malkara, Hayrabolu, Şarköy vb. diğer ilçeler için yalnızca o ilçenin temiz gidiş hatları
        const distLines = tekulasDb.filter(r => isValidLocalLine(r, normDist));
        if (distLines.length > 0) {
            distLines.slice(0, 4).forEach(l => appendStopsCleanly(l.stops));
            defaultLineRef = distLines[0];
        } else {
            const sulFallback = tekulasDb.find(r => r.id === 'tekulas_152_2_7') || tekulasDb.find(r => isValidLocalLine(r, 'Süleymanpaşa')) || tekulasDb[0];
            if (sulFallback && sulFallback.stops) appendStopsCleanly(sulFallback.stops);
            defaultLineRef = sulFallback;
        }
    }

    if (master.length < 2 && tekulasDb.length > 0) {
        const safeLine = tekulasDb.find(r => r.id === 'tekulas_152_2_7') || tekulasDb[0];
        appendStopsCleanly(safeLine.stops);
        defaultLineRef = safeLine;
    }

    const N = master.length;
    for (let i = 0; i < N - 1; i++) {
        if (!master[i].gercekMesafeSonraki || master[i].gercekMesafeSonraki === 0) {
            const d = calculateDistance(master[i].lat, master[i].lon, master[i+1].lat, master[i+1].lon);
            master[i].gercekMesafeSonraki = Math.min(8.5, Math.max(0.5, Math.round(d * 1.25 * 10) / 10));
        }
    }
    if (N > 0) master[N - 1].gercekMesafeSonraki = 0;

    // 10 Görevlik Aşamalı ve Kesintisiz Kesitler (Güvenli bölme mantığı)
    let cuts = [];
    if (N <= 10) {
        for (let i = 0; i <= 10; i++) {
            cuts.push(Math.min(N - 1, Math.round((i * (N - 1)) / 10)));
        }
    } else {
        cuts = [0, Math.min(3, N - 1)];
        const remaining = (N - 1) - cuts[1];
        const weights = [1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.3, 2.6, 3.0];
        const totalW = weights.reduce((a, b) => a + b, 0);

        let cur = cuts[1];
        for (let i = 0; i < 9; i++) {
            if (i === 8) {
                cuts.push(N - 1);
            } else {
                const step = Math.max(1, Math.round((remaining * weights[i]) / totalW));
                cur = Math.min(N - 1 - (8 - i), cur + step);
                cuts.push(cur);
            }
        }
    }

    const slices = [];
    for (let i = 0; i < 10; i++) {
        const cStart = cuts[i];
        const cEnd = Math.max(cStart + 1, cuts[i + 1]);
        const safeStart = Math.min(cStart, N - 1);
        const safeEnd = Math.min(cEnd, N - 1);
        const startStop = master[safeStart] ? master[safeStart].name : "Kalkış";
        const endStop = master[safeEnd] ? master[safeEnd].name : "Varış";
        slices.push({
            name: `${normDist} Etabı ${i + 1}: ${startStop} ➔ ${endStop}`,
            start: safeStart,
            end: safeEnd,
            lineRef: defaultLineRef
        });
    }

    return { master, slices, defaultLineRef };
}

// Generate 30 Progressive Routes (3 Licenses x 10 Tasks) from raw API stops
function generateRoutesFromAPI(rawStops, cityName, activeDistrict = null) {
    /* TEKULAŞ_PROGRESSIVE_TASKS_SYSTEM */
    // TEKİRDAĞ İÇİN RESMİ TEKULAŞ BELEDİYE HATLARI HARİTALAMASI (183 HAT VERİTABANI)
    if (cityName === "Tekirdağ" && typeof window !== 'undefined' && window.tekulasHatVeritabani && window.tekulasHatVeritabani.length > 0) {
        const tekulasDb = window.tekulasHatVeritabani;
        
        // Aktif çalışma bölgesini belirle (Varsayılan: Süleymanpaşa)
        const targetDistrict = activeDistrict || (typeof Game !== 'undefined' && Game.activeDistrict) || (typeof localStorage !== 'undefined' ? localStorage.getItem('activeDistrict') : null) || "Süleymanpaşa";

        // 1. Seviye Çıraklık: SEÇİLEN İLÇENİN KESİNTİSİZ ŞEHİR TURU (Kaldığı Duraktan Devam Eden Zincirleme Hatlar)
        // Her ilçe için 1. görev kesinlikle 4 duraklı nazik başlangıçla başlar, kaldığı yerden adım adım şehri dolaştırır
        const { master: masterLevel1Stops, slices: continuousSlices } = buildDistrictContinuousCircuit(targetDistrict, tekulasDb);
        const districtLocalKeywords = continuousSlices;

        // 2. Seviye Kalfa (Süleymanpaşa İleri Seviye Şehir İçi Hatları)
        const kalfaKeywords = [
            { no: "1/3", kw: "ALTINOVA-HÜRRİYET" },
            { no: "2/7", kw: "100.YIL-NKU" },
            { no: "4/15", kw: "ÇİFTLİKÖNÜ-HUZUREVI" },
            { no: "11B", kw: "CIFTLIKONU-BEYAZKÖY" },
            { no: "13", kw: "100.YIL-OKULLAR" },
            { no: "17", kw: "KÖPRÜBAŞI- YENİŞEHİR" },
            { no: "20", kw: "SÜLEYMANPAŞA-KUMBAĞ" },
            { no: "29", kw: "YENİ OTOGAR-ALTINOVA" },
            { no: "30", kw: "YENİ OTOGAR-DEĞİRMENALTI" },
            { no: "97", kw: "KUMBAĞ - BARBOROS" }
        ];

        // 3. Seviye Usta (Çorlu Şehir İçi Hatları)
        const corluKeywords = [
            { no: "1", kw: "YESILTEPE-EMLAK" },
            { no: "2", kw: "SAĞLIK MAH.- GÖLBAŞI" },
            { no: "3", kw: "HAVUZLAR-HATİP" },
            { no: "4", kw: "KIVANC-DEVLET" },
            { no: "5", kw: "HAVUZLAR-DEVLET" },
            { no: "6", kw: "KEMALETTİN MAH" },
            { no: "7", kw: "DEVLET HAST.- ÇORLU PARK" },
            { no: "8", kw: "DEVLET HAST.- SAĞLIK" },
            { no: "13", kw: "OTOGAR-HAVALİMANI" },
            { no: "16", kw: "ÇORLU OTOGAR-CEZAEVİ" }
        ];

        // 4. Seviye İlçeler Arası (Büyük İlçe Seferleri: Hat 26 Saray, Hat 48 Velimeşe, Hat 28, vb.)
        const ilceKeywords = [
            { no: "26", kw: "SÜLEYMANPASA-ÇERKEZKÖY-KAPAKLI-SARAY" },
            { no: "48", kw: "VELİMEŞE-ÇORLU" },
            { no: "28", kw: "CORLU-M.EREGLISI-SULEYMANPASA" },
            { no: "35", kw: "SÜLEYMANPAŞA-MALKARA" },
            { no: "22/1", kw: "TEKIRDAG-MURATLI" },
            { no: "38", kw: "ÇORLU-YENİCE" },
            { no: "138", kw: "UÇMAKDERE-SÜLEYMANPAŞA" },
            { no: "50", kw: "HAYRABOLU-SÜLEYMANPAŞA" },
            { no: "47", kw: "SARAY-ÇORLU" },
            { no: "71", kw: "KIZILPINAR-ÇERKEZKÖY" }
        ];

        // 5. Seviye Ergene & Velimeşe OSB Ağır Sanayi Hatları
        const osbKeywords = [
            { no: "48", kw: "VELİMEŞE-ÇORLU" },
            { no: "48", kw: "VELİMEŞE" },
            { no: "49", kw: "ERGENE" },
            { no: "51", kw: "MARMARACIK" },
            { no: "52", kw: "ULAŞ" },
            { no: "48", kw: "VELİMEŞE" },
            { no: "49", kw: "ERGENE" },
            { no: "71", kw: "ÇERKEZKÖY" },
            { no: "1", kw: "ÇORLU" },
            { no: "48", kw: "VELİMEŞE-ÇORLU" }
        ];

        // 6. Seviye 18 Metre Körüklü Otobüs Metropol Hatları
        const korukluKeywords = [
            { no: "26", kw: "SÜLEYMANPASA-ÇERKEZKÖY-KAPAKLI-SARAY" },
            { no: "28", kw: "CORLU-M.EREGLISI-SULEYMANPASA" },
            { no: "20", kw: "SÜLEYMANPAŞA-KUMBAĞ" },
            { no: "2/7", kw: "100.YIL-NKU" },
            { no: "26", kw: "SARAY" },
            { no: "1", kw: "YESILTEPE-EMLAK" },
            { no: "3", kw: "HAVUZLAR-HATİP" },
            { no: "20", kw: "SÜLEYMANPAŞA-KUMBAĞ" },
            { no: "28", kw: "CORLU-M.EREGLISI" },
            { no: "26", kw: "SÜLEYMANPASA-ÇERKEZKÖY" }
        ];

        // 7. Seviye Trakya Dağ Geçitleri & Şarköy
        const dagKeywords = [
            { no: "138", kw: "ŞARKÖY" },
            { no: "97", kw: "BARBOROS" },
            { no: "35", kw: "MALKARA" },
            { no: "50", kw: "HAYRABOLU" },
            { no: "47", kw: "SARAY" },
            { no: "71", kw: "ÇERKEZKÖY" },
            { no: "26", kw: "KAPAKLI" },
            { no: "35", kw: "SÜLEYMANPAŞA-MALKARA" },
            { no: "138", kw: "UÇMAKDERE" },
            { no: "35", kw: "MALKARA" }
        ];

        const makeHighwayStops = (stopNames, stepKm = 3.5) => {
            return stopNames.map((sName, idx) => {
                const isLast = (idx === stopNames.length - 1);
                const dist = isLast ? 0 : stepKm;
                return {
                    name: sName,
                    anons: idx === 0
                        ? `${sName} kalkış noktasındayız. Sonraki hedef: ${stopNames[1] || sName}.`
                        : (isLast ? `Son durak: ${sName}. Seferimiz başarıyla tamamlanmıştır.` : `Sonraki durak: ${sName}.`),
                    lat: 40.98 + (idx * 0.04),
                    lon: 27.51 + (idx * 0.06),
                    routeKm: Math.round(idx * stepKm * 10) / 10,
                    bekleyenYolcu: isLast ? 0 : 18,
                    gercekMesafeSonraki: dist,
                    yolcuTipi: "Sivil",
                    yolTipi: "Otoyol & Karayolu",
                    kavsakVar: false
                };
            });
        };

        // 8. Seviye Şehirlerarası Otoyollar & VIP Heyetler
        const otoyolKeywords = [
            { no: "İST-1", kw: "İSTANBUL ESENLER EKSPRES", customStops: makeHighwayStops(["Tekirdağ Yeni Otogar", "Marmaraereğlisi Kavşağı", "Silivri Otoyol Tesisleri", "Mahmutbey Gişeler", "İstanbul Esenler Otogarı"], 4.0) },
            { no: "OTO-1", kw: "HGS GİŞE PROTOKOLÜ", customStops: makeHighwayStops(["Çorlu Gişeler", "Kınalı Otoyol Kavşağı", "Çatalca Viyadüğü", "Avcılar HGS Gişeleri", "Beylikdüzü Transfer Merkezi"], 3.5) },
            { no: "EDR-1", kw: "EDİRNE SELİMİYE HEYETİ", customStops: makeHighwayStops(["Süleymanpaşa Otogar", "Muratlı Kavşağı", "Lüleburgaz Terminal", "Babaeski Gişeler", "Edirne Selimiye Meydanı"], 3.8) },
            { no: "TESİS-1", kw: "DİNLENME TESİSİ MOLA", customStops: makeHighwayStops(["Tekirdağ Merkez", "Çorlu Otoyol Bağlantısı", "Otoyol VIP Dinlenme Tesisi", "Silivri Kavşağı", "Büyükçekmece Terminali"], 3.5) },
            { no: "ÇNK-1", kw: "ÇANAKKALE 1915 KÖPRÜSÜ", customStops: makeHighwayStops(["Tekirdağ Otogar", "Malkara Kavşağı", "Keşan Dörtyol", "Gelibolu Yaklaşımı", "1915 Çanakkale Köprüsü & Lapseki"], 4.2) },
            { no: "BRS-1", kw: "BURSA OSMANGAZİ TRANSİT", customStops: makeHighwayStops(["İstanbul Anadolu Gişeler", "Gebze Dilovası", "Osmangazi Köprüsü", "Orhangazi Tüneli", "Bursa Şehirlerarası Otogar"], 4.0) },
            { no: "BLK-1", kw: "BALIKESİR GECE SEFERİ", customStops: makeHighwayStops(["Bursa Batı Gişeler", "Karacabey Kavşağı", "Susurluk Dinlenme Tesisi", "Balıkesir Kuzey", "Balıkesir Merkez Otogar"], 3.8) },
            { no: "İZM-1", kw: "İZMİR EGE MARATONU", customStops: makeHighwayStops(["Balıkesir Otogar", "Akhisar Otoyol Kavşağı", "Saruhanlı Geçişi", "Manisa Sabuncubeli Tüneli", "İzmir Bornova Otogarı"], 4.5) },
            { no: "OTO-2", kw: "ŞEHİRLERARASI GECE FIRTINA", customStops: makeHighwayStops(["İzmir Otogar", "Menemen Otoyol", "Aliağa Sahil Koridoru", "Ayvalık Kavşağı", "Edremit Körfez Terminali"], 3.8) },
            { no: "OTO-3", kw: "OTOYOL BAŞ KAPTANLIĞI", customStops: makeHighwayStops(["Çanakkale İskele", "1915 Çanakkale Köprüsü", "Malkara Otoyolu", "Süleymanpaşa Sahil", "Tekirdağ Merkez Otogar"], 4.2) }
        ];

        // 9. Seviye Anadolu Kar Geçitleri & Gece Kartalı
        const anadoluKeywords = [
            { no: "KOC-1", kw: "KOCAELİ SANAYİ KORİDORU", customStops: makeHighwayStops(["İstanbul Samandıra", "Şekerpınar OSB Gişeler", "Hereke Sahil Viyadüğü", "Körfez Geçişi", "Kocaeli İzmit Otogarı"], 3.8) },
            { no: "BOLU-1", kw: "BOLU DAĞI SİS VE KAR", customStops: makeHighwayStops(["Sakarya Hendek", "Düzce Kaynaşlı Gişeler", "Bolu Dağı Polisevi Rampası", "Bolu Dağı Sisli Zirve", "Abant Kavşağı"], 4.0) },
            { no: "BOLU-2", kw: "BOLU TÜNELİ EMNİYET", customStops: makeHighwayStops(["Kaynaşlı Yaklaşım", "Bolu Dağı Tüneli Girişi", "Bolu Tüneli Çıkış Viyadüğü", "Bolu Batı Gişeler", "Bolu Şehirlerarası Otogar"], 3.6) },
            { no: "ANK-1", kw: "ANKARA AŞTİ BAŞKENT", customStops: makeHighwayStops(["Bolu Doğu Gişeler", "Yeniçağa Dinlenme Tesisi", "Kızılcahamam Soğuksu Geçidi", "Akıncı Gişeler", "Ankara AŞTİ Otogarı"], 4.5) },
            { no: "KRD-1", kw: "KARADENİZ SAHİL YOLU", customStops: makeHighwayStops(["Samsun Otogar", "Fatsa Sahil Yolu", "Ordu Boztepe Tüneli", "Giresun Kalesi Sahili", "Trabzon Şehirlerarası Otogar"], 4.2) },
            { no: "KPD-1", kw: "KAPADOKYA TURİST HEYETİ", customStops: makeHighwayStops(["Aksaray Sultanhanı", "Nevşehir Girişi", "Uçhisar Kalesi Yolu", "Göreme Peri Bacaları", "Ürgüp Turizm Terminali"], 3.5) },
            { no: "TRS-1", kw: "TOROSLAR GECE TIRMANIŞ", customStops: makeHighwayStops(["Konya Ereğli", "Ulukışla Vadisi", "Pozantı Akçatekir Rampası", "Gülek Boğazı Zirvesi", "Adana Merkez Otogar"], 4.4) },
            { no: "EGE-1", kw: "EGE SAHİL VİRAJLARI", customStops: makeHighwayStops(["Aydın Otoban Çıkışı", "Çine Madrandağı Geçidi", "Muğla Sakar Geçidi Virajları", "Gökova Körfezi", "Marmaris Otogarı"], 3.8) },
            { no: "ERZ-1", kw: "PALANDÖKEN ZİRVE İNTİKAL", customStops: makeHighwayStops(["Erzincan Üzümlü", "Tercan Geçidi", "Aşkale Kop Dağı Yaklaşımı", "Erzurum Aziziye", "Palandöken Dağ Terminali"], 4.5) },
            { no: "AND-F", kw: "ŞEREF KÜRSÜSÜ SEFERİ", customStops: makeHighwayStops(["Erzurum Otogar", "Sivas Kızıldağ Geçidi", "Yozgat Akdağmadeni", "Kırıkkale Kavşağı", "Ankara AŞTİ Şeref Peronu"], 4.6) }
        ];

        // 10. Seviye Büyük Türkiye Şampiyonluk Finalleri
        const sampiyonlukKeywords = [
            { no: "ŞMP-1", kw: "ÇANAKKALE ŞEHİTLİK ANMA", customStops: makeHighwayStops(["Tekirdağ Otogar", "Keşan Koridoru", "Gelibolu Yarımadası", "Conkbayırı Yaklaşımı", "Çanakkale Şehitler Abidesi"], 4.2) },
            { no: "ŞMP-2", kw: "İZMİR KORDON KURTULUŞ", customStops: makeHighwayStops(["Çanakkale Truva", "Edremit Kazdağları", "Bergama Kavşağı", "Karşıyaka Sahil", "İzmir Alsancak Kordon Meydanı"], 4.5) },
            { no: "ŞMP-3", kw: "ANKARA ANITKABİR SAYGI", customStops: makeHighwayStops(["İzmir Bornova", "Afyonkarahisar Kavşağı", "Polatlı Sakarya Meydanı", "Tandoğan Meydanı", "Ankara Anıtkabir Tören Alanı"], 4.6) },
            { no: "ŞMP-4", kw: "TRABZON SÜMELA DAĞ YOLU", customStops: makeHighwayStops(["Trabzon Meydan", "Değirmendere Vadisi", "Maçka Merkez", "Altındere Milli Parkı", "Sümela Manastırı Zirve Durağı"], 3.8) },
            { no: "ŞMP-5", kw: "GAZİANTEP ŞANLIURFA GAP", customStops: makeHighwayStops(["Gaziantep Otogar", "Nizip Zeugma Kavşağı", "Birecik Fırat Köprüsü", "Suruç Otoyolu", "Şanlıurfa Balıklıgöl Meydanı"], 4.2) },
            { no: "ŞMP-6", kw: "VAN GÖLÜ DOĞU EKSPRES", customStops: makeHighwayStops(["Bitlis Rahva Geçidi", "Tatvan Sahil Kordonu", "Ahlat Selçuklu Meydanı", "Gevaş Akdamar İskelesi", "Van Merkez Otogar"], 4.4) },
            { no: "ŞMP-7", kw: "MİLLİ TAKIM KAFİLE TRANSFER", customStops: makeHighwayStops(["İstanbul Havalimanı VIP", "Kemerburgaz Otoyolu", "FSM Köprüsü Geçişi", "Ataşehir Finans Koridoru", "Olimpiyat Stadyumu Protokol Kapısı"], 3.8) },
            { no: "ŞMP-8", kw: "BOĞAZ KÖPRÜSÜ GECE GEÇİŞ", customStops: makeHighwayStops(["Kadıköy Rıhtım", "Altunizade Yaklaşımı", "15 Temmuz Şehitler Köprüsü", "Beşiktaş Barbaros Bulvarı", "Taksim Cumhuriyet Meydanı"], 3.5) },
            { no: "ŞMP-9", kw: "TRAKYA'YA ZAFER DÖNÜŞÜ", customStops: makeHighwayStops(["İstanbul Esenler", "Silivri Kıyı Koridoru", "Çorlu Zafer Takı", "Değirmenaltı Kordonu", "Süleymanpaşa Valilik Meydanı"], 4.2) },
            { no: "ŞMP-10", kw: "100. GÖREV BÜYÜK FİNAL ŞAMPİYONLUK", customStops: makeHighwayStops(["Süleymanpaşa Merkez Garaj", "Sahil Kordonu Şeref Turu", "Çorlu Metropol Bulvarı", "Velimeşe & Saray Koridoru", "Mikyas Kaptanlık Akademisi Şeref Kürsüsü"], 4.5) }
        ];

        const allLevels = [
            { lic: 1, name: "1. Sınıf Stajyer Sürücü", list: districtLocalKeywords, color: "#3b82f6" },
            { lic: 2, name: "2. Sınıf Kıyı Kaptanı", list: kalfaKeywords, color: "#eab308" },
            { lic: 3, name: "3. Sınıf Metropol Kaptanı", list: corluKeywords, color: "#ef4444" },
            { lic: 4, name: "İlçe Hatları", list: ilceKeywords, color: "#a855f7" },
            { lic: 5, name: "OSB Vardiya Reisi", list: osbKeywords, color: "#f97316" },
            { lic: 6, name: "Körüklü Filo Reisi", list: korukluKeywords, color: "#06b6d4" },
            { lic: 7, name: "Dağ Geçitleri Müfettişi", list: dagKeywords, color: "#14b8a6" },
            { lic: 8, name: "Otoyol Baş Kaptanı", list: otoyolKeywords, color: "#8b5cf6" },
            { lic: 9, name: "Kar Geçitleri Üstadı", list: anadoluKeywords, color: "#ec4899" },
            { lic: 10, name: "EFSANE MASTER KAPTAN", list: sampiyonlukKeywords, color: "#eab308" }
        ];

        let taskGlobalIndex = 0;
        if (typeof routesData === 'undefined' || !routesData) routesData = {};

        allLevels.forEach(lvl => {
            lvl.list.forEach((item, tIdx) => {
                let found = null;
                let routeStops = [];
                let routeTotalKm = 0;

                if (lvl.lic === 1 && item.start !== undefined && item.end !== undefined) {
                    // KESİNTİSİZ ZİNCİRLEME ŞEHİR TURU (Kaldığı yerden devam eden etaplar)
                    found = item.lineRef || tekulasDb[0];
                    routeStops = masterLevel1Stops.slice(item.start, item.end + 1).map(s => Object.assign({}, s));
                    
                    let calcKm = 0;
                    for (let s = 0; s < routeStops.length - 1; s++) {
                        calcKm += (routeStops[s].gercekMesafeSonraki || 0.5);
                    }
                    routeTotalKm = Math.round(calcKm * 10) / 10;
                    if (routeTotalKm < 1.0) routeTotalKm = 1.5;
                    routeStops[routeStops.length - 1].gercekMesafeSonraki = 0;
                } else if (item.customStops && Array.isArray(item.customStops) && item.customStops.length >= 2) {
                    found = { id: "career_highway_" + taskGlobalIndex, hatNo: item.no || "OTOYOL", name: item.kw };
                    routeStops = item.customStops.map(s => Object.assign({}, s));
                    let calcKm = 0;
                    for (let s = 0; s < routeStops.length - 1; s++) {
                        calcKm += (routeStops[s].gercekMesafeSonraki || 3.5);
                    }
                    routeTotalKm = Math.round(calcKm * 10) / 10;
                } else {
                    const validDb = tekulasDb.filter(r => r && Array.isArray(r.stops) && r.stops.length >= 2 && !/^(İLK DURAK|SON DURAK)$/i.test(String(r.startStop || '').trim()));
                    found = item.id ? validDb.find(r => r.id === item.id) : null;
                    if (!found) found = validDb.find(r => !r.isReturn && ((r.hatNo === item.no && (r.name || '').includes(item.kw)) || ((r.rawName || '').includes(item.kw))));
                    if (!found) found = validDb.find(r => !r.isReturn && ((r.name || '').includes(item.kw) || (r.rawName || '').includes(item.kw)));
                    if (!found) found = validDb.find(r => (r.name || '').includes(item.kw) || (r.rawName || '').includes(item.kw));
                    if (!found) found = validDb[taskGlobalIndex % Math.max(1, validDb.length)] || tekulasDb[0];
                    routeStops = found.stops;
                    routeTotalKm = found.totalKm;
                }

                const taskNum = taskGlobalIndex + 1;
                const isTraining = (lvl.lic === 1 && tIdx < 2);
                const routeId = "tekirdag_task_" + taskGlobalIndex;

                const startStop = routeStops[0] ? routeStops[0].name : "Kalkış Garajı";
                const endStop = routeStops[routeStops.length - 1] ? routeStops[routeStops.length - 1].name : "Varış Durağı";
                const intermediate = routeStops.length > 2 ? routeStops.slice(1, -1).map(s => s.name) : [];

                // Formülsel görev adımları
                const formulaSteps = [];
                formulaSteps.push("1. Adım: " + startStop + " durağından " + (isTraining ? "yolcu almadan hareket edin." : "bekleyen yolcuları alarak hareket edin."));
                for (let sIdx = 1; sIdx < routeStops.length - 1; sIdx++) {
                    formulaSteps.push((sIdx + 1) + ". Adım: Sonra " + routeStops[sIdx].name + " durağına gidin; " + (isTraining ? "yolcu almadan devam edin." : "yolcuları indirin ve bekleyen yolcuları alıp devam edin."));
                }
                if (routeStops.length > 1) {
                    formulaSteps.push(routeStops.length + ". Adım (Hedef Son Durak): Sonra " + endStop + " durağına gidin; " + (isTraining ? "durakta durup eğitimi tamamlayın." : "tüm yolcuları indirin ve görevi tamamlayın."));
                }

                const detailedInstructions = [
                    "<strong>Görev Tanımı:</strong> Görev " + taskNum + " (" + (lvl.name || 'Şehir İçi') + "): " + (item.name || found.name || 'Sefer') + "<br>",
                    "<strong>Kalkış (Başlangıç) Durağı:</strong> " + startStop + "<br>",
                    "<strong>Uğranacak Ara Duraklar:</strong> " + (intermediate.length > 0 ? intermediate.join(" ➔ ") : "Ara durak bulunmamaktadır (Doğrudan varış durağına sürüş)") + "<br>",
                    "<strong>Gitmeniz Gereken Son Durak (Hedef):</strong> " + endStop + "<br>",
                    "<strong>Toplam Durak Sayısı:</strong> " + routeStops.length + " Durak | <strong>Mesafe:</strong> " + routeTotalKm + " KM<br><br>",
                    "<strong>Görev Adımları (A tuşu ile özet, Shift + A ile adım adım dinleyin):</strong><br>",
                    formulaSteps.map(st => "• " + st).join("<br>"),
                    (isTraining ? "<br><br><em>(Eğitim sürüşüdür; araçta yolcu bulunmaz.)</em>" : "")
                ].join("");

                const speechBriefing = "Görev " + taskNum + " brifingi. Hat: " + (item.name || found.name) + ". Kalkış durağınız: " + startStop + ". " +
                    (intermediate.length > 0 ? "Durulacak ara duraklar: " + intermediate.join(", ") + ". " : "Ara durak bulunmamaktadır. ") +
                    "Hedef son durak: " + endStop + ". Toplam " + routeStops.length + " durak, " + routeTotalKm + " kilometre. Görev adımları: " + formulaSteps.join(". ");

                const taskRoute = Object.assign({}, found, {
                    id: routeId,
                    sehir: "Tekirdağ",
                    district: lvl.lic === 1 ? targetDistrict : (found.district || targetDistrict),
                    isDistrict: lvl.lic >= 4 && lvl.lic <= 7,
                    isIntercity: lvl.lic >= 8,
                    isCity: lvl.lic <= 3,
                    name: "Görev " + taskNum + " (" + (lvl.name || 'Şehir İçi Sürücü') + "): " + (item.name || found.name || 'Sefer'),
                    taskIndex: taskGlobalIndex,
                    licenseLevel: lvl.lic,
                    color: lvl.color,
                    isTraining: isTraining,
                    detailedInstructions: detailedInstructions,
                    speechBriefing: speechBriefing,
                    startStop: startStop,
                    endStop: endStop,
                    intermediateStops: intermediate,
                    stops: routeStops,
                    totalKm: routeTotalKm
                });

                // MİKYAS KAPTANLIK AKADEMİSİ 100 GÖREV ENTEGRASYONU
                if (typeof CareerMissions !== 'undefined' && CareerMissions.enrichRoute) {
                    CareerMissions.enrichRoute(taskRoute, taskGlobalIndex);
                    const cm = CareerMissions.getMission(taskGlobalIndex);
                    if (cm) {
                        const displayTaskNum = cm.taskNum || taskNum;
                        taskRoute.name = "Görev " + displayTaskNum + " (" + (cm.levelTitle || 'Kaptan') + "): " + (cm.title || 'Sefer');
                        taskRoute.speechBriefing = cm.dispatcherOrder;
                        taskRoute.isTraining = cm.isTraining;
                        taskRoute.emptyBus = cm.emptyBus;
                        taskRoute.passengersAllowed = cm.passengersAllowed;
                        taskRoute.noTimeLimit = true;
                        if (cm.district && lvl.lic > 1) {
                            taskRoute.district = cm.district;
                        }
                    }
                }
                routesData[routeId] = taskRoute;
                if (found && found.id && !found.id.startsWith("career_highway_")) {
                    routesData[found.id] = found;
                }
                taskGlobalIndex++;
            });
        });

        // Ayrıca tüm temiz TEKULAŞ hatlarını routesData içine tekil ekle
        tekulasDb.forEach(r => {
            if (r && r.id && !routesData[r.id]) routesData[r.id] = r;
        });

        const defAlias = (key, val) => {
            if (!key || !val) return;
            if (typeof setRouteAlias === 'function') {
                setRouteAlias(key, val);
            } else {
                try {
                    Object.defineProperty(routesData, key, { value: val, enumerable: false, configurable: true, writable: true });
                } catch (e) {
                    routesData[key] = val;
                }
            }
        };

        const rSaray = tekulasDb.find(r => r.id === "hat_saray_ekspres");
        if (rSaray) routesData["hat_saray_ekspres"] = rSaray;

        // Geriye dönük rota kimliği uyumluluğu (Çift listeleme yapmayan gizli Alias desteği)
        const r26 = tekulasDb.find(r => r.hatNo === "26" || (r.name && r.name.indexOf("26/SÜLEYMANPASA") !== -1) || r.hatNo === "226");
        if (r26) {
            defAlias("hat_226_suleymanpasa_saray", r26);
            defAlias("hat_26_suleymanpasa_saray", r26);
            defAlias("hat_226_suleymanpasa_velimese", r26);
            defAlias("hat_26_suleymanpasa_velimese", r26);
            defAlias("hat_226", r26);
            defAlias("hat_26", r26);
        }
        const r48 = tekulasDb.find(r => (r.name && r.name.indexOf("VELİMEŞE-ÇORLU") !== -1) || r.hatNo === "48");
        if (r48) defAlias("hat_48_velimese_corlu", r48);

        const r2_7 = tekulasDb.find(r => r.id === "tekulas_152_2_7");
        const r2_7_donus = tekulasDb.find(r => r.id === "tekulas_152_2_7_donus");
        if (r2_7) {
            defAlias("hat_2_7", r2_7);
            defAlias("hat_2_7_gidis", r2_7);
        }
        if (r2_7_donus) defAlias("hat_2_7_donus", r2_7_donus);

        return true;
    }

    if (!rawStops || !Array.isArray(rawStops) || rawStops.length === 0) {
        if (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName]) {
            rawStops = varsayilanSehirDuraklari[cityName];
        } else {
            return false;
        }
    }

    // Aynı isimli mükerrer durakları temizle
    const uniqueByName = new Map();
    rawStops.forEach(d => {
        if (d && d.name && d.name !== "İsimsiz Durak") {
            const key = String(d.name).trim().toUpperCase();
            if (!uniqueByName.has(key)) uniqueByName.set(key, d);
        }
    });
    let filtered = Array.from(uniqueByName.values());

    if (filtered.length < 2) {
        return false;
    }

    // COĞRAFİ YAKIN KOMŞU (NEAREST-NEIGHBOR) KORİDOR DİZİLİMİ:
    // Durakları rastgele karıştırıp şehrin bir ucundan diğer ucuna zikzak çizdirmek yerine,
    // başlangıç durağından itibaren birbirine en yakın gerçek cadde sırasıyla dizer!
    const buildCorridorChain = (pool, seedIdx, count) => {
        const limit = Math.max(2, Math.min(count, pool.length));
        const used = new Set();
        const chain = [];
        let curIdx = ((seedIdx % pool.length) + pool.length) % pool.length;
        used.add(curIdx);
        chain.push(pool[curIdx]);

        while (chain.length < limit) {
            const last = chain[chain.length - 1];
            let bestIdx = -1;
            let bestDist = Infinity;
            for (let j = 0; j < pool.length; j++) {
                if (used.has(j)) continue;
                const cand = pool[j];
                const d = (last.lat && last.lon && cand.lat && cand.lon)
                    ? calculateDistance(last.lat, last.lon, cand.lat, cand.lon)
                    : Math.abs(j - curIdx);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = j;
                }
            }
            if (bestIdx === -1) break;
            used.add(bestIdx);
            chain.push(pool[bestIdx]);
            curIdx = bestIdx;
        }
        return chain;
    };

    const inferRealisticRoadType = (stopName) => {
        const nm = String(stopName || '').toLocaleLowerCase('tr-TR');
        if (nm.includes("otoyol") || nm.includes("gişe") || nm.includes("otogar") || nm.includes("terminal") || nm.includes("havalimanı") || nm.includes("köprü")) {
            return "Otoyol & Karayolu";
        }
        if (nm.includes("sahil") || nm.includes("iskele") || nm.includes("rıhtım") || nm.includes("plaj") || nm.includes("liman") || nm.includes("kordon") || nm.includes("yalı")) {
            return "Sahil Şeridi Yolu";
        }
        if (nm.includes("köy yolu") || nm.includes("yayla yolu") || nm.includes("mezra")) {
            return "Toprak Yol";
        }
        if (nm.includes("sokak") || nm.includes("sokağı")) {
            return "Mahalle Sokağı";
        }
        return "Asfalt Cadde";
    };

    const buildRoute = (id, taskIndex, licenseLvl, taskNum, stopCount, color, isReturn, prevRouteStops, isTraining) => {
        let selected = [];

        if (isReturn && prevRouteStops && prevRouteStops.length >= 2) {
            selected = prevRouteStops.slice().reverse().map(s => ({
                lat: s.lat, lon: s.lon, name: s.name
            }));
        } else {
            selected = buildCorridorChain(filtered, taskIndex * 2, stopCount);
        }

        while (selected.length < 2) {
            const cityPool = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName])
                ? varsayilanSehirDuraklari[cityName]
                : [];
            if (cityPool.length > 0) {
                const pick = cityPool[selected.length % cityPool.length];
                selected.push({ name: pick.name, lat: pick.lat, lon: pick.lon });
            } else {
                const cCoords = (typeof sehirRotalari !== 'undefined' && sehirRotalari[cityName] && sehirRotalari[cityName].coordinates)
                    ? sehirRotalari[cityName].coordinates
                    : { lat: 39.9208, lon: 32.8541 };
                selected.push({
                    name: selected.length === 0 ? (cityName + " Merkez Meydanı") : (cityName + " Şehirlerarası Otogar"),
                    lat: cCoords.lat + (selected.length * 0.012),
                    lon: cCoords.lon + (selected.length * 0.012)
                });
            }
        }

        const startStop = selected[0].name;
        const endStop = selected[selected.length - 1].name;
        const intermediateStops = selected.slice(1, -1).map(s => s.name);
        const totalStops = selected.length;
        const directionLabel = isReturn ? "(Dönüş)" : "(Gidiş)";

        let title = "";
        if (isTraining) {
            title = "Görev " + taskNum + " (Eğitim): " + startStop + " ➔ " + endStop;
        } else if (licenseLvl === 4) {
            title = "İlçeler Arası Görev " + taskNum + " " + directionLabel + ": " + startStop + " ➔ " + endStop;
        } else {
            title = "Görev " + taskNum + " " + directionLabel + ": " + startStop + " ➔ " + endStop;
        }

        let intermediateSummary = intermediateStops.length > 0
            ? "Durulacak ara duraklar: " + intermediateStops.join(", ") + ". "
            : "Ara durak yok, doğrudan varış durağına sürüş. ";

        let desc = isTraining
            ? "Kalkış: " + startStop + " ➔ Varış: " + endStop + ". Sadece güzergahı öğrenmek için yolcusuz eğitim sürüşüdür. İki durak arası ilerleyin."
            : "Kalkış: " + startStop + " ➔ Varış: " + endStop + ". " + intermediateSummary + "Toplam " + totalStops + " durak.";

        // FORMÜLSEL GÖREV ADIMLARI
        const formulaSteps = [];
        formulaSteps.push("1. Adım: " + startStop + " durağından " + (isTraining ? "yolcu almadan hareket edin." : "bekleyen yolcuları alarak hareket edin."));
        for (let sIdx = 1; sIdx < selected.length - 1; sIdx++) {
            formulaSteps.push((sIdx + 1) + ". Adım: Sonra " + selected[sIdx].name + " durağına gidin; " + (isTraining ? "yolcu almadan devam edin." : "yolcuları indirin ve bekleyen yolcuları alıp devam edin."));
        }
        if (selected.length > 1) {
            formulaSteps.push(totalStops + ". Adım (Hedef Son Durak): Sonra " + endStop + " durağına gidin; " + (isTraining ? "durakta durup eğitimi tamamlayın." : "tüm yolcuları indirin ve görevi tamamlayın."));
        }

        let detailedInstructions = [
            "<strong>Görev Tanımı:</strong> " + title + "<br>",
            "<strong>Kalkış (Başlangıç) Durağı:</strong> " + startStop + "<br>",
            "<strong>Uğranacak Ara Duraklar:</strong> " + (intermediateStops.length > 0 ? intermediateStops.join(" ➔ ") : "Ara durak bulunmamaktadır (Doğrudan varış durağına kesintisiz sürüş)") + "<br>",
            "<strong>Gitmeniz Gereken Son Durak (Hedef):</strong> " + endStop + "<br>",
            "<strong>Toplam Durak Sayısı:</strong> " + totalStops + " Durak<br><br>",
            "<strong>Görev Adımları (A tuşu ile özet, Shift + A ile adım adım dinleyin):</strong><br>",
            formulaSteps.map(st => "• " + st).join("<br>"),
            (isTraining ? "<br><br><em>(Eğitim sürüşüdür; araçta yolcu bulunmaz.)</em>" : "")
        ].join("");

        let speechBriefing = "Görev " + taskNum + " brifingi. Kalkış durağınız: " + startStop + ". " +
            (intermediateStops.length > 0 ? "Durulacak ara duraklar: " + intermediateStops.join(", ") + ". " : "Ara durak bulunmamaktadır. ") +
            "Hedef son durak: " + endStop + ". Toplam " + totalStops + " durak. Görev adımları: " + formulaSteps.join(". ");

        let kumulatifMesafe = 0;
        const processedStops = [];
        const yolcuTipleri = ["Sivil", "Öğrenci", "Karışık", "Yaşlı"];

        for (let i = 0; i < selected.length; i++) {
            let mesafe = 0;
            if (i < selected.length - 1) {
                let gercekKusUcusu = calculateDistance(selected[i].lat, selected[i].lon, selected[i+1].lat, selected[i+1].lon);
                let gercekYol = gercekKusUcusu * 1.28;
                if (gercekYol < 0.8) gercekYol = 0.8 + ((i % 4) * 0.25);
                if (gercekYol > 12.0 && licenseLvl <= 3) gercekYol = 3.2;
                mesafe = Math.round(gercekYol * 10) / 10;
            }

            const currentKm = Math.round(kumulatifMesafe * 10) / 10;
            const scaledSonrakiMesafe = mesafe;
            kumulatifMesafe += scaledSonrakiMesafe;

            const tip = yolcuTipleri[(taskIndex + i) % yolcuTipleri.length];
            const bekleyen = isTraining ? 0 : (12 + ((taskIndex * 7 + i * 5) % 28));
            const dogruYolTipi = selected[i].yolTipi || inferRealisticRoadType(selected[i].name);
            const kavsakMevcut = (i > 0 && i < selected.length - 1 && (i % 3 === 1));

            let stopAnons = "";
            if (i === 0) {
                stopAnons = selected[0].name + " kalkış durağındayız. İlk durulacak hedef durak: " + (selected[1] ? selected[1].name : endStop) + ".";
            } else if (i === selected.length - 1) {
                stopAnons = "Son durak: " + endStop + ". Seferimiz sona ermiştir. Tüm yolcularımızın inmesi rica olunur.";
            } else {
                stopAnons = "Sonraki durak: " + selected[i].name + ".";
            }

            processedStops.push({
                name: selected[i].name,
                anons: stopAnons,
                lat: selected[i].lat,
                lon: selected[i].lon,
                routeKm: currentKm,
                bekleyenYolcu: bekleyen,
                gercekMesafeSonraki: scaledSonrakiMesafe,
                yolcuTipi: tip,
                yolTipi: dogruYolTipi,
                kavsakVar: kavsakMevcut
            });
        }

        return {
            id: id,
            sehir: cityName,
            district: activeDistrict || "Merkez",
            name: title,
            desc: desc,
            startStop: startStop,
            endStop: endStop,
            intermediateStops: intermediateStops,
            detailedInstructions: detailedInstructions,
            speechBriefing: speechBriefing,
            color: color,
            zemin: "Şehir İçi",
            otobusKapasitesi: 80,
            taskIndex: taskIndex,
            licenseLevel: licenseLvl,
            totalKm: Math.round(kumulatifMesafe * 10) / 10,
            stops: processedStops
        };
    };

    const routes = [];
    let globalTaskIndex = 0;
    let prevStops = null;

    for (let lic = 1; lic <= 4; lic++) {
        for (let task = 1; task <= 10; task++) {
            let baseStops = lic === 1 ? 4 : (lic === 2 ? 8 : (lic === 3 ? 12 : 15));
            let stopCount = baseStops + (task - 1);
            let color = "#3b82f6";
            if (lic === 2) color = "#eab308";
            if (lic === 3) color = "#ef4444";
            if (lic === 4) color = "#a855f7";

            let isReturn = (globalTaskIndex % 2 !== 0);
            let routeId = cityName.toLowerCase() + "_task_" + globalTaskIndex;
            let isTraining = (lic === 1 && task <= 3);
            if (isTraining) {
                stopCount = 2;
            }

            let newRoute = buildRoute(routeId, globalTaskIndex, lic, task, stopCount, color, isReturn, prevStops, isTraining);
            routes.push(newRoute);

            if (!isReturn) {
                prevStops = newRoute.stops;
            }
            globalTaskIndex++;
        }
    }

    if (typeof routesData === 'undefined' || !routesData) routesData = {};
    routes.forEach(r => {
        routesData[r.id] = r;
    });

    return true;
}

/* ==========================================================================
   TÜRKİYE GENELİ SERBEST ROTA MOTORU (81 İL, TÜM İLÇELER VE MAHALLELER)
   ========================================================================== */
function createOrGetFreeRoamRoute(cityName, districtName, neighborhoodName) {
    if (typeof routesData === 'undefined' || !routesData) routesData = {};

    cityName = cityName || "Tekirdağ";
    districtName = (!districtName || districtName === "all") ? (cityName === "Tekirdağ" ? "Süleymanpaşa" : "Merkez") : districtName;
    neighborhoodName = neighborhoodName || "Merkez";

    const isFullDistrictTour = neighborhoodName.includes("Genel Şehir Turu") || neighborhoodName.includes("İlçe Turu");
    const routeSlug = (cityName + "_" + districtName + "_" + neighborhoodName).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const routeId = "free_roam_" + routeSlug;

    // Tekirdağ için yalnızca seçilen ilçenin gerçek duraklarını kullan (Asla Çorlu tekulas[0]'a düşmez!)
    if (cityName === "Tekirdağ" && typeof window !== 'undefined' && window.tekulasHatVeritabani) {
        const tekulas = window.tekulasHatVeritabani;
        const matchingLine = tekulas.find(r =>
            r && !r.isReturn && !r.isDistrict && r.district === districtName &&
            (!isFullDistrictTour ? (r.name && r.name.toLowerCase().includes(neighborhoodName.toLowerCase())) : true)
        );

        if (matchingLine && Array.isArray(matchingLine.stops) && matchingLine.stops.length >= 2) {
            const mStart = matchingLine.startStop || matchingLine.stops[0].name || "Kalkış Garajı";
            const mEnd = matchingLine.endStop || matchingLine.stops[matchingLine.stops.length - 1].name || "Varış Durağı";
            const freeRoute = Object.assign({}, matchingLine, {
                id: routeId,
                sehir: "Tekirdağ",
                district: districtName,
                isFreeRoam: true,
                taskIndex: null,
                startStop: mStart,
                endStop: mEnd,
                name: "[Serbest Rota] Tekirdağ " + districtName + ": " + (isFullDistrictTour ? "İlçe Merkez Turu" : neighborhoodName),
                speechBriefing: "Tekirdağ " + districtName + ", " + neighborhoodName + " serbest seferi. Kalkış durağınız: " + mStart + ". İyi sürüşler kaptan."
            });
            routesData[routeId] = freeRoute;
            return freeRoute;
        }

        // İlçenin kendi sürekli şehir turu duraklarından temiz serbest hat üret (Velimeşe, Marmaraereğlisi, Ergene, Saray vb.)
        const circuit = buildDistrictContinuousCircuit(districtName, tekulas);
        if (circuit && Array.isArray(circuit.master) && circuit.master.length >= 2) {
            const cStops = circuit.master.slice(0, 14).map((s, idx, arr) => Object.assign({}, s, {
                gercekMesafeSonraki: idx === arr.length - 1 ? 0 : (s.gercekMesafeSonraki || 1.2),
                yolTipi: s.yolTipi || "Asfalt Cadde"
            }));
            const cTotalKm = cStops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);
            const freeCircuitRoute = {
                id: routeId,
                sehir: "Tekirdağ",
                district: districtName,
                mahalle: neighborhoodName,
                isFreeRoam: true,
                taskIndex: null,
                licenseLevel: 1,
                color: "#22c55e",
                name: "[Serbest Rota] Tekirdağ " + districtName + ": " + (isFullDistrictTour ? "Tüm Duraklar İlçe Turu" : neighborhoodName),
                startStop: cStops[0].name,
                endStop: cStops[cStops.length - 1].name,
                intermediateStops: cStops.slice(1, -1).map(s => s.name),
                stops: cStops,
                totalKm: Number(cTotalKm.toFixed(1)),
                speechBriefing: "Tekirdağ " + districtName + " serbest ilçe seferi. İlk durak: " + cStops[0].name + ". Son durak: " + cStops[cStops.length - 1].name + ". İyi yolculuklar kaptan."
            };
            routesData[routeId] = freeCircuitRoute;
            return freeCircuitRoute;
        }
    }

    // Diğer 80 il için seçilen il ve ilçenin gerçek coğrafi koordinatlarını bul
    let baseLat = 39.9208;
    let baseLon = 32.8541;

    if (typeof sehirRotalari !== 'undefined' && sehirRotalari[cityName]) {
        const sr = sehirRotalari[cityName];
        if (sr.coordinates && sr.coordinates.lat && sr.coordinates.lon) {
            baseLat = sr.coordinates.lat;
            baseLon = sr.coordinates.lon;
        }
        if (sr.ilcelerBilgisi && Array.isArray(sr.ilcelerBilgisi.liste)) {
            const dFound = sr.ilcelerBilgisi.liste.find(x => x && (x.ad === districtName || x.id === districtName));
            if (dFound && dFound.lat && dFound.lon) {
                baseLat = dFound.lat;
                baseLon = dFound.lon;
            }
        }
    } else if (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName] && varsayilanSehirDuraklari[cityName].length > 0) {
        baseLat = varsayilanSehirDuraklari[cityName][0].lat || baseLat;
        baseLon = varsayilanSehirDuraklari[cityName][0].lon || baseLon;
    }

    if (typeof window !== 'undefined' && window.TurkeyAdminData && window.TurkeyAdminData[cityName] && window.TurkeyAdminData[cityName].districts) {
        const dAdm = window.TurkeyAdminData[cityName].districts[districtName];
        if (dAdm && dAdm.lat && dAdm.lon) {
            baseLat = dAdm.lat;
            baseLon = dAdm.lon;
        }
    }

    const cleanMahalle = isFullDistrictTour
        ? districtName
        : neighborhoodName.replace(" Mahallesi", "").replace(" Beldesi", "");

    const stops = [
        { name: cleanMahalle + " Merkez Meydan Durağı", lat: baseLat + 0.002, lon: baseLon + 0.002, gercekMesafeSonraki: 1.5, yolTipi: "Asfalt Cadde", bekleyenYolcu: 16, yolcuTipi: "Karışık" },
        { name: cleanMahalle + " Belediye & Çarşı Durağı", lat: baseLat + 0.007, lon: baseLon + 0.006, gercekMesafeSonraki: 1.7, yolTipi: "Asfalt Cadde", bekleyenYolcu: 14, yolcuTipi: "Sivil" },
        { name: cleanMahalle + " Devlet Hastanesi & Bulvar", lat: baseLat + 0.012, lon: baseLon + 0.011, gercekMesafeSonraki: 1.9, yolTipi: "Asfalt Cadde", bekleyenYolcu: 18, yolcuTipi: "Yaşlı" },
        { name: cleanMahalle + " Okullar & Spor Kompleksi", lat: baseLat + 0.017, lon: baseLon + 0.016, gercekMesafeSonraki: 2.1, yolTipi: "Asfalt Cadde", bekleyenYolcu: 20, yolcuTipi: "Öğrenci" },
        { name: districtName + " Otogar & Transfer Merkezi", lat: baseLat + 0.023, lon: baseLon + 0.022, gercekMesafeSonraki: 0, yolTipi: "Asfalt Cadde", bekleyenYolcu: 0, yolcuTipi: "Sivil" }
    ];

    const totalKm = stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);

    const freeRoute = {
        id: routeId,
        sehir: cityName,
        district: districtName,
        mahalle: neighborhoodName,
        isFreeRoam: true,
        taskIndex: null,
        licenseLevel: 1,
        color: "#22c55e",
        name: "[Serbest Rota] " + cityName + " - " + districtName + (isFullDistrictTour ? " (İlçe Merkez Hattı)" : (" (" + cleanMahalle + ")")),
        startStop: stops[0].name,
        endStop: stops[stops.length - 1].name,
        intermediateStops: stops.slice(1, -1).map(s => s.name),
        stops: stops,
        totalKm: Number(totalKm.toFixed(1)),
        speechBriefing: cityName + " " + districtName + " serbest seferi. İlk durak: " + stops[0].name + ". Son durak: " + stops[stops.length - 1].name + ". Toplam " + stops.length + " durak, " + totalKm.toFixed(1) + " kilometre. İyi yolculuklar kaptan."
    };

    routesData[routeId] = freeRoute;
    return freeRoute;
}

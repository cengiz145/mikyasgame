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

    if (districtName === "Süleymanpaşa" || districtName === "Tekirdağ") {
        const h1 = tekulasDb.find(r => r.id === 'tekulas_1') || tekulasDb[0];
        const h18 = tekulasDb.find(r => r.id === 'tekulas_18') || tekulasDb[1];
        const h17 = tekulasDb.find(r => r.id === 'tekulas_17') || tekulasDb[2];
        if (h1 && h1.stops) h1.stops.forEach(s => master.push(Object.assign({}, s)));
        if (h18 && h18.stops) for (let i = 1; i < h18.stops.length; i++) master.push(Object.assign({}, h18.stops[i]));
        if (h17 && h17.stops) for (let i = 1; i < h17.stops.length; i++) master.push(Object.assign({}, h17.stops[i]));
        defaultLineRef = h1;
    } else if (districtName === "Çorlu") {
        const h1 = tekulasDb.find(r => r.id === 'tekulas_1_1_yesiltepe') || tekulasDb[0];
        const h2 = tekulasDb.find(r => r.id === 'tekulas_3_2') || tekulasDb[1];
        if (h1 && h1.stops) h1.stops.forEach(s => master.push(Object.assign({}, s)));
        if (h2 && h2.stops) for (let i = 1; i < h2.stops.length; i++) master.push(Object.assign({}, h2.stops[i]));
        defaultLineRef = h1;
    } else if (districtName === "Çerkezköy") {
        // Çerkezköy zengin hatlarını birleştir
        const cLines = tekulasDb.filter(r => r.district === "Çerkezköy" && r.stops && r.stops.length >= 8);
        if (cLines.length > 0) {
            cLines.forEach((l, idx) => {
                const startIdx = idx === 0 ? 0 : 1;
                for (let i = startIdx; i < l.stops.length; i++) {
                    master.push(Object.assign({}, l.stops[i]));
                }
            });
            defaultLineRef = cLines[0];
        } else {
            const anyCLines = tekulasDb.filter(r => r.district === "Çerkezköy" && r.stops && r.stops.length > 0);
            anyCLines.forEach(l => l.stops.forEach(s => master.push(Object.assign({}, s))));
            defaultLineRef = anyCLines[0] || tekulasDb[0];
        }
    } else if (districtName === "Kapaklı") {
        const kLines = tekulasDb.filter(r => r.district === "Kapaklı" && r.stops && r.stops.length >= 2);
        if (kLines.length > 0) {
            kLines.slice(0, 3).forEach((l, idx) => {
                if (idx === 0) {
                    l.stops.forEach(s => master.push(Object.assign({}, s)));
                } else {
                    for (let i = 1; i < l.stops.length; i++) master.push(Object.assign({}, l.stops[i]));
                }
            });
            defaultLineRef = kLines[0];
        }
    } else if (districtName === "Marmaraereğlisi" || districtName === "Marmara Ereğlisi") {
        const meStops = [
            { name: "MARMARAEREĞLİSİ OTOGARI", lat: 40.9686, lon: 27.9553, gercekMesafeSonraki: 1.2 },
            { name: "HÜKÜMET KONAĞI & BELEDİYE", lat: 40.9702, lon: 27.9575, gercekMesafeSonraki: 1.0 },
            { name: "PERİNTHOS ANTİK KENTİ GİRİŞİ", lat: 40.9720, lon: 27.9620, gercekMesafeSonraki: 1.4 },
            { name: "MARMARAEREĞLİSİ DEVLET HASTANESİ", lat: 40.9745, lon: 27.9680, gercekMesafeSonraki: 2.1 },
            { name: "ÇEŞMELİ KAVŞAĞI", lat: 40.9780, lon: 27.9750, gercekMesafeSonraki: 2.5 },
            { name: "D-110 SAHİL YOLU DURAĞI", lat: 40.9750, lon: 27.9820, gercekMesafeSonraki: 2.2 },
            { name: "KAMELYA CADDESİ & PLAJ", lat: 40.9730, lon: 27.9890, gercekMesafeSonraki: 1.8 },
            { name: "YENİÇİFTLİK VATAN CADDESİ", lat: 40.9820, lon: 27.9920, gercekMesafeSonraki: 1.3 },
            { name: "YENİÇİFTLİK BELEDİYE MEYDANI", lat: 40.9850, lon: 27.9950, gercekMesafeSonraki: 1.6 },
            { name: "YENİÇİFTLİK SAHİL ÇARŞISI", lat: 40.9810, lon: 28.0050, gercekMesafeSonraki: 3.2 },
            { name: "SULTANKÖY GİRİŞ KAVŞAĞI", lat: 40.9890, lon: 28.0200, gercekMesafeSonraki: 1.9 },
            { name: "SULTANKÖY MERKEZ MEYDANI", lat: 40.9920, lon: 28.0280, gercekMesafeSonraki: 1.5 },
            { name: "SULTANKÖY SAHİL & BOTAŞ GİRİŞİ", lat: 40.9950, lon: 28.0350, gercekMesafeSonraki: 1.8 },
            { name: "MARMARAEREĞLİSİ DÖNÜŞ PERONU", lat: 40.9686, lon: 27.9553, gercekMesafeSonraki: 0.0 }
        ];
        const meLines = tekulasDb.filter(r => (r.district === "Marmaraereğlisi" || (r.name && r.name.toLowerCase().includes("ereğli")) || (r.name && r.name.toLowerCase().includes("eregli"))) && r.stops && r.stops.length >= 2);
        if (meLines.length > 0) {
            meLines.forEach((l, idx) => {
                const startIdx = idx === 0 ? 0 : 1;
                for (let i = startIdx; i < l.stops.length; i++) master.push(Object.assign({}, l.stops[i]));
            });
            defaultLineRef = meLines[0];
        } else {
            master = meStops.map(s => Object.assign({}, s));
            defaultLineRef = { id: "me_master", name: "Marmaraereğlisi Sahil ve Perinthos Seferleri", district: "Marmaraereğlisi", totalKm: 38 };
        }
    } else if (districtName === "Ergene" || districtName === "Velimeşe") {
        const ergStops = [
            { name: "ERGENE BELEDİYESİ (MARMARACIK MERKEZ)", lat: 41.2281, lon: 27.7028, gercekMesafeSonraki: 1.1 },
            { name: "MARMARACIK MEYDAN & ÇARŞI", lat: 41.2295, lon: 27.7050, gercekMesafeSonraki: 1.4 },
            { name: "ERGENE DEVLET HASTANESİ BÖLGESİ", lat: 41.2330, lon: 27.7120, gercekMesafeSonraki: 3.5 },
            { name: "SAĞLIK MAHALLESİ EDİRNE CADDESİ", lat: 41.2050, lon: 27.7350, gercekMesafeSonraki: 1.2 },
            { name: "SAĞLIK MAHALLESİ PAZAR YERİ", lat: 41.2020, lon: 27.7380, gercekMesafeSonraki: 1.5 },
            { name: "YEŞİLTEPE MAHALLESİ MEYDANI", lat: 41.1980, lon: 27.7420, gercekMesafeSonraki: 1.3 },
            { name: "YEŞİLTEPE ÇARŞI CADDESİ", lat: 41.1950, lon: 27.7460, gercekMesafeSonraki: 4.2 },
            { name: "VAKIFLAR KAVŞAĞI & SANAYİ", lat: 41.2380, lon: 27.7550, gercekMesafeSonraki: 2.8 },
            { name: "ULAŞ BELDE MEYDANI", lat: 41.2510, lon: 27.7780, gercekMesafeSonraki: 3.8 },
            { name: "MİSİNLİ KÖY YOLU AYRIMI", lat: 41.2650, lon: 27.8100, gercekMesafeSonraki: 5.2 },
            { name: "VELİMEŞE OSB 1. CADDE", lat: 41.2420, lon: 27.8550, gercekMesafeSonraki: 1.6 },
            { name: "VELİMEŞE TOKİ KONUTLARI", lat: 41.2470, lon: 27.8680, gercekMesafeSonraki: 1.5 },
            { name: "VELİMEŞE MERKEZ ÇARŞI", lat: 41.2520, lon: 27.8790, gercekMesafeSonraki: 1.2 },
            { name: "VELİMEŞE TREN İSTASYONU", lat: 41.2540, lon: 27.8820, gercekMesafeSonraki: 0.0 }
        ];
        const ergLines = tekulasDb.filter(r => (r.district === "Ergene" || (r.name && (r.name.toLowerCase().includes("ergene") || r.name.toLowerCase().includes("marmaracık") || r.name.toLowerCase().includes("velimeşe")))) && r.stops && r.stops.length >= 2);
        if (ergLines.length > 0) {
            ergLines.forEach((l, idx) => {
                const startIdx = idx === 0 ? 0 : 1;
                for (let i = startIdx; i < l.stops.length; i++) master.push(Object.assign({}, l.stops[i]));
            });
            defaultLineRef = ergLines[0];
        } else {
            const velimeseSokaklar = (typeof VelimeseNavigasyon !== 'undefined' && VelimeseNavigasyon.sokaklar)
                ? VelimeseNavigasyon.sokaklar
                : ((typeof window !== 'undefined' && window.VelimeseNavigasyon) ? window.VelimeseNavigasyon.sokaklar : []);
            if (velimeseSokaklar && velimeseSokaklar.length >= 20) {
                master = velimeseSokaklar.slice(0, 60).map(s => ({
                    name: s.name,
                    lat: s.lat,
                    lon: s.lon,
                    yolTipi: (s.cat === "Sanayi" ? "Asfalt Cadde" : "Mahalle Sokağı")
                }));
                defaultLineRef = { id: "ergene_master", name: "Ergene Beldeler ve OSB Seferleri", district: "Ergene", totalKm: 45 };
            } else {
                master = ergStops.map(s => Object.assign({}, s));
                defaultLineRef = { id: "ergene_master", name: "Ergene Beldeler ve OSB Seferleri", district: "Ergene", totalKm: 45 };
            }
        }
    } else if (districtName === "Saray") {
        const saraySokaklar = (typeof SarayNavigasyon !== 'undefined' && SarayNavigasyon.sokaklar)
            ? SarayNavigasyon.sokaklar
            : ((typeof window !== 'undefined' && window.SarayNavigasyon) ? window.SarayNavigasyon.sokaklar : []);
        if (saraySokaklar && saraySokaklar.length >= 20) {
            master = saraySokaklar.map(s => ({
                name: s.name,
                lat: s.lat,
                lon: s.lon,
                yolTipi: (s.cat === "Sokak" ? "Mahalle Sokağı" : (s.cat === "Köy Yolu" ? "Toprak Yol" : "Asfalt Cadde"))
            }));
        } else {
            const sLines = tekulasDb.filter(r => r.district === "Saray" && r.stops && r.stops.length >= 5);
            sLines.forEach(l => l.stops.forEach(s => master.push(Object.assign({}, s))));
        }
        defaultLineRef = { id: "saray_master", name: "Saray İlçe İçi Seferleri", district: "Saray", totalKm: 18 };
    } else if (districtName === "Muratlı") {
        const mLines = tekulasDb.filter(r => (r.district === "Muratlı" || (r.name && r.name.toLowerCase().includes("muratlı"))) && r.stops && r.stops.length >= 2);
        if (mLines.length > 0) {
            mLines.forEach(l => {
                l.stops.forEach(s => master.push(Object.assign({}, s)));
            });
            defaultLineRef = mLines[0];
        }
        const muratliExtraStops = [
            { name: "MURATLI TREN GARI", lat: 41.1712, lon: 27.5023, gercekMesafeSonraki: 1.1 },
            { name: "MURATLI BELEDİYESİ", lat: 41.1725, lon: 27.5045, gercekMesafeSonraki: 0.9 },
            { name: "ŞEHİT YÜZBAŞI MAYADAĞLI CAD", lat: 41.1741, lon: 27.5068, gercekMesafeSonraki: 1.3 },
            { name: "MURATLI ÇARŞI MEYDANI", lat: 41.1755, lon: 27.5089, gercekMesafeSonraki: 1.0 },
            { name: "MURATLI DEVLET HASTANESİ", lat: 41.1780, lon: 27.5120, gercekMesafeSonraki: 1.4 },
            { name: "MURATLI SANAYİ SİTESİ", lat: 41.1820, lon: 27.5180, gercekMesafeSonraki: 1.8 },
            { name: "İNANLI ÇEŞMESİ & KÖY YOLU", lat: 41.1860, lon: 27.5240, gercekMesafeSonraki: 2.1 },
            { name: "AŞAĞISEVİNDİK KAVŞAĞI", lat: 41.1910, lon: 27.5310, gercekMesafeSonraki: 1.7 },
            { name: "YUKARISEVİNDİK MERKEZ", lat: 41.1960, lon: 27.5380, gercekMesafeSonraki: 2.0 },
            { name: "MURATLI OTOGARI", lat: 41.1700, lon: 27.5010, gercekMesafeSonraki: 0.0 }
        ];
        if (master.length < 10) {
            master = muratliExtraStops.map(s => Object.assign({}, s));
            defaultLineRef = { id: "muratli_master", name: "Muratlı Şehir İçi ve Tren Garı Seferleri", district: "Muratlı", totalKm: 14 };
        }
    } else {
        const distLines = tekulasDb.filter(r => (r.district === districtName || (r.district && r.district.includes(districtName))) && r.stops && r.stops.length >= 3);
        if (distLines.length > 0) {
            distLines.forEach((l, lIdx) => {
                const startIdx = lIdx === 0 ? 0 : 1;
                for (let i = startIdx; i < l.stops.length; i++) {
                    master.push(Object.assign({}, l.stops[i]));
                }
            });
            defaultLineRef = distLines[0];
        } else {
            master = tekulasDb[0].stops.map(s => Object.assign({}, s));
            defaultLineRef = tekulasDb[0];
        }
    }

    const N = master.length;
    for (let i = 0; i < N - 1; i++) {
        if (!master[i].gercekMesafeSonraki || master[i].gercekMesafeSonraki === 0) {
            const d = calculateDistance(master[i].lat, master[i].lon, master[i+1].lat, master[i+1].lon);
            master[i].gercekMesafeSonraki = Math.max(0.4, Math.round(d * 10) / 10);
        }
    }
    master[N - 1].gercekMesafeSonraki = 0;

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
            name: `${districtName} Etabı ${i + 1}: ${startStop} ➔ ${endStop}`,
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
            { no: "48/1", kw: "VELİMEŞE MAHALLE" },
            { no: "49", kw: "ERGENE-DERİ OSB" },
            { no: "51", kw: "MARMARACIK-SANAYİ" },
            { no: "52", kw: "ULAŞ-VARDİYA" },
            { no: "53", kw: "VELİMEŞE TREN GAR" },
            { no: "54", kw: "ERGENE GECE" },
            { no: "55", kw: "AĞIR SANAYİ" },
            { no: "56", kw: "ÇORLU ÇEVRE YOLU" },
            { no: "57", kw: "OSB FİNAL" }
        ];

        // 6. Seviye 18 Metre Körüklü Otobüs Metropol Hatları
        const korukluKeywords = [
            { no: "26", kw: "KÖRÜKLÜ CONECTO HAT 1" },
            { no: "26/1", kw: "KÖRÜKLÜ KAVŞAK GEÇİŞ" },
            { no: "26/2", kw: "TEKİRDAĞSPOR TARAFTAR" },
            { no: "2/7", kw: "ÜNİVERSİTE BAHAR ŞENLİĞİ" },
            { no: "26", kw: "SARAY EKSPRES KÖRÜKLÜ" },
            { no: "1", kw: "ÇORLU MEYDAN YOĞUN" },
            { no: "3", kw: "ÇİFT KAPILI SANAYİ" },
            { no: "20", kw: "YAĞMURDA KÖRÜKLÜ" },
            { no: "28", kw: "GECE VARDİYA EKSPRES" },
            { no: "26", kw: "KÖRÜKLÜ FİLO ŞAMPİYONU" }
        ];

        // 7. Seviye Trakya Dağ Geçitleri & Şarköy
        const dagKeywords = [
            { no: "138", kw: "ŞARKÖY ZEYTİN HASADI" },
            { no: "97", kw: "MÜREFTE SAHİL VİRAJ" },
            { no: "35", kw: "MALKARA KIŞ KARAYOLU" },
            { no: "50", kw: "HAYRABOLU AYÇİÇEĞİ" },
            { no: "47", kw: "SARAY ORMAN YOLU" },
            { no: "71", kw: "ÇERKEZKÖY SANAYİ" },
            { no: "26", kw: "KAPAKLI AKŞAM YOĞUN" },
            { no: "35", kw: "SÜLEYMANPAŞA MALKARA GECE" },
            { no: "138", kw: "UÇMAKDERE DAĞ GEÇİDİ" },
            { no: "138", kw: "TRAKYA ZİRVE FATİHİ" }
        ];

        // 8. Seviye Şehirlerarası Otoyollar & VIP Heyetler
        const otoyolKeywords = [
            { no: "İST-1", kw: "İSTANBUL ESENLER EKSPRES" },
            { no: "OTO-1", kw: "HGS GİŞE PROTOKOLÜ" },
            { no: "EDR-1", kw: "EDİRNE SELİMİYE HEYETİ" },
            { no: "TESİS-1", kw: "DİNLENME TESİSİ MOLA" },
            { no: "ÇNK-1", kw: "ÇANAKKALE 1915 KÖPRÜSÜ" },
            { no: "BRS-1", kw: "BURSA OSMANGAZİ TRANSİT" },
            { no: "BLK-1", kw: "BALIKESİR GECE SEFERİ" },
            { no: "İZM-1", kw: "İZMİR EGE MARATONU" },
            { no: "OTO-2", kw: "ŞEHİRLERARASI GECE FIRTINA" },
            { no: "OTO-3", kw: "OTOYOL BAŞ KAPTANLIĞI" }
        ];

        // 9. Seviye Anadolu Kar Geçitleri & Gece Kartalı
        const anadoluKeywords = [
            { no: "KOC-1", kw: "KOCAELİ SANAYİ KORİDORU" },
            { no: "BOLU-1", kw: "BOLU DAĞI SİS VE KAR" },
            { no: "BOLU-2", kw: "BOLU TÜNELİ EMNİYET" },
            { no: "ANK-1", kw: "ANKARA AŞTİ BAŞKENT" },
            { no: "KRD-1", kw: "KARADENİZ SAHİL YOLU" },
            { no: "KPD-1", kw: "KAPADOKYA TURİST HEYETİ" },
            { no: "TRS-1", kw: "TOROSLAR GECE TIRMANIŞ" },
            { no: "EGE-1", kw: "EGE SAHİL VİRAJLARI" },
            { no: "ERZ-1", kw: "PALANDÖKEN ZİRVE İNTİKAL" },
            { no: "AND-F", kw: "ŞEREF KÜRSÜSÜ SEFERİ" }
        ];

        // 10. Seviye Büyük Türkiye Şampiyonluk Finalleri
        const sampiyonlukKeywords = [
            { no: "ŞMP-1", kw: "ÇANAKKALE ŞEHİTLİK ANMA" },
            { no: "ŞMP-2", kw: "İZMİR KORDON KURTULUŞ" },
            { no: "ŞMP-3", kw: "ANKARA ANITKABİR SAYGI" },
            { no: "ŞMP-4", kw: "TRABZON SÜMELA DAĞ YOLU" },
            { no: "ŞMP-5", kw: "GAZİANTEP ŞANLIURFA GAP" },
            { no: "ŞMP-6", kw: "VAN GÖLÜ DOĞU EKSPRES" },
            { no: "ŞMP-7", kw: "MİLLİ TAKIM KAFİLE TRANSFER" },
            { no: "ŞMP-8", kw: "BOĞAZ KÖPRÜSÜ GECE GEÇİŞ" },
            { no: "ŞMP-9", kw: "TRAKYA'YA ZAFER DÖNÜŞÜ" },
            { no: "ŞMP-10", kw: "100. GÖREV BÜYÜK FİNAL ŞAMPİYONLUK" }
        ];

        const allLevels = [
            { lic: 1, name: "Çırak Kaptan", list: districtLocalKeywords, color: "#3b82f6" },
            { lic: 2, name: "Kalfa Kaptan", list: kalfaKeywords, color: "#eab308" },
            { lic: 3, name: "Usta Kaptan", list: corluKeywords, color: "#ef4444" },
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
                } else {
                    found = item.id ? tekulasDb.find(r => r.id === item.id) : null;
                    if (!found) found = tekulasDb.find(r => r.name.includes(item.kw) || (r.hatNo === item.no && r.name.includes(item.kw)));
                    if (!found) found = tekulasDb.find(r => r.name.includes(item.kw));
                    if (!found) found = tekulasDb[taskGlobalIndex % tekulasDb.length];
                    routeStops = found.stops;
                    routeTotalKm = found.totalKm;
                }

                const taskNum = tIdx + 1;
                const isTraining = (lvl.lic === 1 && taskNum <= 3);
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
                    "<strong>Görev Tanımı:</strong> Görev " + taskNum + " (" + lvl.name + "): " + (item.name || found.name) + "<br>",
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
                    isDistrict: false,
                    isCity: true,
                    name: "Görev " + taskNum + " (" + lvl.name + "): " + (item.name || found.name),
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
                        taskRoute.name = "Görev " + taskNum + " (" + cm.levelTitle + "): " + cm.title;
                        taskRoute.speechBriefing = cm.dispatcherOrder;
                        taskRoute.isTraining = cm.isTraining;
                        taskRoute.emptyBus = cm.emptyBus;
                        taskRoute.passengersAllowed = cm.passengersAllowed;
                        taskRoute.noTimeLimit = true;
                    }
                }
                routesData[routeId] = taskRoute;
                routesData[found.id] = found; // Hat id'si ile de erişilebilir
                taskGlobalIndex++;
            });
        });

        // Ayrıca tüm TEKULAŞ hatlarını routesData içine ekle
        tekulasDb.forEach(r => {
            if (!routesData[r.id]) routesData[r.id] = r;
        });

        // Saray Ekspres (62 KM)
        const rSaray = tekulasDb.find(r => r.id === "hat_saray_ekspres");
        if (rSaray) {
            routesData["hat_saray_ekspres"] = rSaray;
        }

        // Geriye dönük rota kimliği uyumluluğu (Alias desteği)
        const r26 = tekulasDb.find(r => r.hatNo === "26" || r.name.indexOf("26/SÜLEYMANPASA") !== -1 || r.hatNo === "226");
        if (r26) {
            routesData["hat_226_suleymanpasa_saray"] = r26;
            routesData["hat_26_suleymanpasa_saray"] = r26;
            routesData["hat_226_suleymanpasa_velimese"] = r26;
            routesData["hat_26_suleymanpasa_velimese"] = r26;
            routesData["hat_226"] = r26;
            routesData["hat_26"] = r26;
        }
        const r48 = tekulasDb.find(r => r.name.indexOf("VELİMEŞE-ÇORLU") !== -1 || r.hatNo === "48");
        if (r48) {
            routesData["hat_48_velimese_corlu"] = r48;
        }
        const r2_7 = tekulasDb.find(r => r.id === "tekulas_152_2_7");
        const r2_7_donus = tekulasDb.find(r => r.id === "tekulas_152_2_7_donus");
        if (r2_7) {
            routesData["hat_2_7"] = r2_7;
            routesData["hat_2_7_gidis"] = r2_7;
        }
        if (r2_7_donus) {
            routesData["hat_2_7_donus"] = r2_7_donus;
        }

        return true;
    }

    if (!rawStops || !Array.isArray(rawStops) || rawStops.length === 0) {
        if (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName]) {
            rawStops = varsayilanSehirDuraklari[cityName];
        } else {
            return false;
        }
    }
    let filtered = rawStops.filter(d => d && d.name && d.name !== "İsimsiz Durak");
    
    if (filtered.length < 2) {
        return false;
    }
    
    filtered.sort(() => 0.5 - Math.random());
    
    const buildRoute = (id, taskIndex, licenseLvl, taskNum, stopCount, color, isReturn, prevRouteStops, isTraining) => {
        let selected = [];
        
        if (isReturn && prevRouteStops && prevRouteStops.length >= 2) {
            selected = prevRouteStops.slice().reverse().map(s => ({
                lat: s.lat, lon: s.lon, name: s.name
            }));
        } else {
            const shuffledFiltered = [...filtered].sort(() => 0.5 - Math.random());
            const limit = Math.max(2, Math.min(stopCount, shuffledFiltered.length));
            for (let i = 0; i < limit; i++) {
                selected.push(shuffledFiltered[i]);
            }
        }

        while (selected.length < 2) {
            const cityPool = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName]) 
                ? varsayilanSehirDuraklari[cityName] 
                : (typeof varsayilanSehirDuraklari !== 'undefined' ? varsayilanSehirDuraklari["Tekirdağ"] : []);
            if (cityPool.length > 0) {
                const pick = cityPool[selected.length % cityPool.length];
                selected.push({ name: pick.name, lat: pick.lat, lon: pick.lon });
            } else {
                selected.push({ name: (cityName === "Tekirdağ" ? "Süleymanpaşa Otogar" : cityName + " Otogar"), lat: 40.9833, lon: 27.5167 });
            }
        }

        const startStop = selected[0].name;
        const endStop = selected[selected.length - 1].name;
        const intermediateStops = selected.slice(1, -1).map(s => s.name);
        const totalStops = selected.length;
        const directionLabel = isReturn ? "(Dönüş)" : "(Gidiş)";
        const licName = licenseLvl === 1 ? "Çırak" : (licenseLvl === 2 ? "Kalfa" : (licenseLvl === 3 ? "Usta" : "İlçeler Arası"));
        
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
        let fStep1 = "1. Adım: " + startStop + " durağından " + (isTraining ? "yolcu almadan hareket edin." : "bekleyen yolcuları alarak hareket edin.");
        formulaSteps.push(fStep1);

        for (let sIdx = 1; sIdx < selected.length - 1; sIdx++) {
            let fStep = (sIdx + 1) + ". Adım: Sonra " + selected[sIdx].name + " durağına gidin; " + (isTraining ? "yolcu almadan devam edin." : "yolcuları indirin ve bekleyen yolcuları alıp devam edin.");
            formulaSteps.push(fStep);
        }

        if (selected.length > 1) {
            let fLast = totalStops + ". Adım (Hedef Son Durak): Sonra " + endStop + " durağına gidin; " + (isTraining ? "durakta durup eğitimi tamamlayın." : "tüm yolcuları indirin ve görevi tamamlayın.");
            formulaSteps.push(fLast);
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
        
        for (let i = 0; i < selected.length; i++) {
            let mesafe = 0;
            if (i < selected.length - 1) {
                let gercekKusUcusu = calculateDistance(selected[i].lat, selected[i].lon, selected[i+1].lat, selected[i+1].lon);
                // Gerçek karayolu kıvrım katsayısı (1.3x)
                let gercekYol = gercekKusUcusu * 1.3;
                if (gercekYol < 0.8) gercekYol = 0.8 + (Math.abs(Math.sin((i+1) * 7)) * 0.8);
                mesafe = Math.round(gercekYol * 10) / 10;
            }

            const currentKm = Math.round(kumulatifMesafe * 10) / 10;
            const scaledSonrakiMesafe = mesafe;
            kumulatifMesafe += scaledSonrakiMesafe;
            
            const yolcuTipleri = ["Sivil", "Öğrenci", "Karışık", "Yaşlı"];
            const tip = yolcuTipleri[Math.floor(Math.random() * yolcuTipleri.length)];
            
            const bekleyen = isTraining ? 0 : Math.floor(Math.random() * 40) + 10;
            
            const yollar = ["Asfalt Cadde", "Mahalle Sokağı", "Toprak Yol", "Kumlu Yol", "Çimenli Yol", "Sahil Şeridi Yolu", "Çakıllı Yol"];
            const rastgeleYol = yollar[Math.floor(Math.random() * yollar.length)];
            
            const kavsakMevcut = Math.random() < 0.3;
            
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
                yolTipi: rastgeleYol,
                kavsakVar: kavsakMevcut
            });
        }

        return {
            id: id,
            sehir: cityName,
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
            
            if (lic === 4) {
                // Lisans 4 gerçek mesafeleri korur
            }

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
    districtName = districtName || "Süleymanpaşa";
    neighborhoodName = neighborhoodName || "Merkez";

    const isFullDistrictTour = neighborhoodName.includes("Genel Şehir Turu") || neighborhoodName.includes("İlçe Turu");
    const routeSlug = (cityName + "_" + districtName + "_" + neighborhoodName).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const routeId = "free_roam_" + routeSlug;

    // Tekirdağ için resmi TEKULAŞ veritabanından eşleşen hatları kontrol et
    if (cityName === "Tekirdağ" && typeof window !== 'undefined' && window.tekulasHatVeritabani) {
        const tekulas = window.tekulasHatVeritabani;
        const matchingLine = tekulas.find(r => 
            (r.district === districtName || r.originDistrict === districtName || r.destDistrict === districtName) &&
            (!isFullDistrictTour ? (r.name && r.name.toLowerCase().includes(neighborhoodName.toLowerCase())) : true)
        ) || tekulas.find(r => r.district === districtName) || tekulas[0];

        if (matchingLine) {
            const freeRoute = Object.assign({}, matchingLine, {
                id: routeId,
                sehir: "Tekirdağ",
                district: districtName,
                isFreeRoam: true,
                taskIndex: 0,
                name: "[Serbest Rota] Tekirdağ " + districtName + ": " + (isFullDistrictTour ? "Tüm Mahalleler Turu" : neighborhoodName),
                speechBriefing: "Tekirdağ " + districtName + ", " + neighborhoodName + " serbest seferi. Kalkış durağınız: " + (matchingLine.startStop || "Kalkış Garajı") + ". İyi sürüşler kaptan."
            });
            routesData[routeId] = freeRoute;
            return freeRoute;
        }
    }

    // Diğer tüm iller için koordinat ve gerçekçi durak ağı oluştur
    let baseLat = 39.92;
    let baseLon = 32.85;

    if (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName] && varsayilanSehirDuraklari[cityName].length > 0) {
        baseLat = varsayilanSehirDuraklari[cityName][0].lat || baseLat;
        baseLon = varsayilanSehirDuraklari[cityName][0].lon || baseLon;
    }

    const cleanMahalle = neighborhoodName.replace(" Mahallesi", "").replace(" Beldesi", "");
    const stops = [
        { name: cleanMahalle + " Merkez Meydan Durağı", lat: baseLat + 0.005, lon: baseLon + 0.004, gercekMesafeSonraki: 1.8 },
        { name: cleanMahalle + " Çarşı & Park Durağı", lat: baseLat + 0.009, lon: baseLon + 0.008, gercekMesafeSonraki: 2.1 },
        { name: cleanMahalle + " Bulvarı & Sağlık Ocağı", lat: baseLat + 0.014, lon: baseLon + 0.012, gercekMesafeSonraki: 2.4 },
        { name: cleanMahalle + " Okullar & Spor Kompleksi", lat: baseLat + 0.019, lon: baseLon + 0.017, gercekMesafeSonraki: 2.6 },
        { name: districtName + " Şehirlerarası Otogar & Transfer Merkezi", lat: baseLat + 0.025, lon: baseLon + 0.023, gercekMesafeSonraki: 0 }
    ];

    const totalKm = stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);

    const freeRoute = {
        id: routeId,
        sehir: cityName,
        district: districtName,
        mahalle: neighborhoodName,
        isFreeRoam: true,
        taskIndex: 0,
        licenseLevel: 1,
        color: "#22c55e",
        name: "[Serbest Rota] " + cityName + " - " + districtName + " (" + cleanMahalle + ")",
        startStop: stops[0].name,
        endStop: stops[stops.length - 1].name,
        intermediateStops: stops.slice(1, -1).map(s => s.name),
        stops: stops,
        totalKm: Number(totalKm.toFixed(1)),
        speechBriefing: cityName + " " + districtName + ", " + cleanMahalle + " serbest seferi. İlk durak: " + stops[0].name + ". Son durak: " + stops[stops.length - 1].name + ". Toplam " + stops.length + " durak, " + totalKm.toFixed(1) + " kilometre. İyi yolculuklar kaptan."
    };

    routesData[routeId] = freeRoute;
    return freeRoute;
}

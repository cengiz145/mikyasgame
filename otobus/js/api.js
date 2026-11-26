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

// Türkçe İ/I duyarlı küçük harf normalizasyonu
function normTrApi(str) {
    return String(str || '')
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .toLowerCase()
        .trim();
}

function isBrokenPlaceholderRoute(r) {
    if (!r || !Array.isArray(r.stops) || r.stops.length < 2) return true;
    const s0 = String(r.startStop || (r.stops[0] && r.stops[0].name) || '').trim();
    const sEnd = String(r.endStop || (r.stops[r.stops.length - 1] && r.stops[r.stops.length - 1].name) || '').trim();
    if (/^(İLK DURAK|ILK DURAK|SON DURAK|1\.\s*DURAK)$/i.test(s0) || /^(İLK DURAK|ILK DURAK|SON DURAK|1\.\s*DURAK)$/i.test(sEnd)) {
        return true;
    }
    return false;
}

// Her Seçilen İlçe İçin Kesintisiz, Kaldığı Yerden Devam Eden ve 4 Durakla Başlayan 10 Görevli Şehir Turu Motoru
function buildDistrictContinuousCircuit(districtName, tekulasDb) {
    let master = [];
    let defaultLineRef = null;

    const normDist = (!districtName || districtName === "all" || districtName === "Tekirdağ") ? "Süleymanpaşa" : districtName;
    const normDistLow = normTrApi(normDist);

    const isValidLocalLine = (r, targetDist) => {
        if (!r || !Array.isArray(r.stops) || r.stops.length < 3) return false;
        if (r.isReturn || isBrokenPlaceholderRoute(r)) return false;
        // Farklı iki ilçeyi bağlayan gerçek ilçelerarası hatları ilçe içi turdan ayır; ancak Malkara/Şarköy/Hayrabolu/Saray ilçe içi hatlarında isDistrict bayrağı yüzünden dışlama yapma!
        if (r.originDistrict && r.destDistrict && normTrApi(r.originDistrict) !== normTrApi(r.destDistrict)) return false;
        return normTrApi(r.district) === normTrApi(targetDist);
    };

    const appendStopsCleanly = (stopsArr) => {
        if (!Array.isArray(stopsArr)) return;
        stopsArr.forEach(s => {
            if (!s || !s.name || /^(İLK DURAK|ILK DURAK|SON DURAK|1\.\s*DURAK)$/i.test(String(s.name).trim())) return;
            const last = master.length > 0 ? master[master.length - 1] : null;
            if (last && normTrApi(last.name) === normTrApi(s.name)) return;
            master.push(Object.assign({}, s, { district: s.district || normDist }));
        });
    };

    if (normDist === "Süleymanpaşa") {
        // Gerçek Süleymanpaşa hatları: 2/7 (100. Yıl - Hükümet - Köprübaşı - Değirmenaltı - NKÜ - Tepekent), 18 (NKÜ - Şehir Hastanesi), 29 (Yeni Otogar - Altınova)
        const h2_7 = tekulasDb.find(r => r.id === 'tekulas_152_2_7') || tekulasDb.find(r => isValidLocalLine(r, 'Süleymanpaşa') && r.hatNo === '2/7');
        const h18 = tekulasDb.find(r => r.id === 'tekulas_175_18') || tekulasDb.find(r => isValidLocalLine(r, 'Süleymanpaşa') && r.hatNo === '18');
        const h29 = tekulasDb.find(r => r.id === 'tekulas_169_29') || tekulasDb.find(r => isValidLocalLine(r, 'Süleymanpaşa') && r.hatNo === '29');
        const picked = [h2_7, h18, h29].filter(Boolean);
        if (picked.length > 0) {
            picked.forEach((l, idx) => {
                if (idx > 0 && master.length > 0) master[master.length - 1].gercekMesafeSonraki = 0;
                appendStopsCleanly(l.stops);
            });
            defaultLineRef = picked[0];
        } else {
            const sulLines = tekulasDb.filter(r => isValidLocalLine(r, 'Süleymanpaşa'));
            sulLines.slice(0, 3).forEach((l, idx) => {
                if (idx > 0 && master.length > 0) master[master.length - 1].gercekMesafeSonraki = 0;
                appendStopsCleanly(l.stops);
            });
            defaultLineRef = sulLines[0] || { id: "sul_master", name: "Süleymanpaşa Şehir İçi Hatları", district: "Süleymanpaşa", totalKm: 24 };
        }
    } else if (normDist === "Çorlu") {
        const h1 = tekulasDb.find(r => r.id === 'tekulas_1_1_yesiltepe') || tekulasDb.find(r => isValidLocalLine(r, 'Çorlu'));
        const h2 = tekulasDb.find(r => r.id === 'tekulas_3_2') || tekulasDb.filter(r => isValidLocalLine(r, 'Çorlu'))[1];
        if (h1 && h1.stops) appendStopsCleanly(h1.stops);
        if (h2 && h2.stops) {
            if (master.length > 0) master[master.length - 1].gercekMesafeSonraki = 0;
            appendStopsCleanly(h2.stops);
        }
        defaultLineRef = h1 || { id: "corlu_master", name: "Çorlu Şehir İçi Hatları", district: "Çorlu", totalKm: 22 };
    } else if (normDist === "Çerkezköy") {
        const cLines = tekulasDb.filter(r => isValidLocalLine(r, "Çerkezköy") && r.stops.length >= 6);
        const sourceLines = cLines.length > 0 ? cLines.slice(0, 3) : tekulasDb.filter(r => isValidLocalLine(r, "Çerkezköy"));
        sourceLines.forEach((l, idx) => {
            if (idx > 0 && master.length > 0) master[master.length - 1].gercekMesafeSonraki = 0;
            appendStopsCleanly(l.stops);
        });
        defaultLineRef = sourceLines[0] || { id: "cerkezkoy_master", name: "Çerkezköy Şehir İçi Hatları", district: "Çerkezköy", totalKm: 18 };
    } else if (normDist === "Kapaklı") {
        const kLines = tekulasDb.filter(r => isValidLocalLine(r, "Kapaklı"));
        kLines.slice(0, 3).forEach((l, idx) => {
            if (idx > 0 && master.length > 0) master[master.length - 1].gercekMesafeSonraki = 0;
            appendStopsCleanly(l.stops);
        });
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
            { name: "SULTANKÖY SAHİL & BOTAŞ GİRİŞİ", lat: 40.9950, lon: 28.0350, gercekMesafeSonraki: 0.0, yolTipi: "Sahil Şeridi Yolu" }
        ];
        appendStopsCleanly(meStops);
        defaultLineRef = { id: "me_master", name: "Marmaraereğlisi Sahil ve Perinthos Seferleri", district: "Marmaraereğlisi", totalKm: 21.7 };
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
            { name: "ERGENE DEVLET HASTANESİ BÖLGESİ", lat: 41.2330, lon: 27.7120, gercekMesafeSonraki: 3.9, yolTipi: "Asfalt Cadde" },
            { name: "SAĞLIK MAHALLESİ EDİRNE CADDESİ", lat: 41.2050, lon: 27.7350, gercekMesafeSonraki: 1.2, yolTipi: "Asfalt Cadde" },
            { name: "SAĞLIK MAHALLESİ PAZAR YERİ", lat: 41.2020, lon: 27.7380, gercekMesafeSonraki: 1.5, yolTipi: "Mahalle Sokağı" },
            { name: "YEŞİLTEPE MAHALLESİ MEYDANI", lat: 41.1980, lon: 27.7420, gercekMesafeSonraki: 1.3, yolTipi: "Asfalt Cadde" },
            { name: "YEŞİLTEPE ÇARŞI CADDESİ", lat: 41.1950, lon: 27.7460, gercekMesafeSonraki: 5.8, yolTipi: "Asfalt Cadde" },
            { name: "VAKIFLAR KAVŞAĞI & SANAYİ", lat: 41.2380, lon: 27.7550, gercekMesafeSonraki: 2.6, yolTipi: "Asfalt Cadde" },
            { name: "ULAŞ BELDE MEYDANI", lat: 41.2510, lon: 27.7780, gercekMesafeSonraki: 3.6, yolTipi: "Asfalt Cadde" },
            { name: "MİSİNLİ KÖY YOLU AYRIMI", lat: 41.2650, lon: 27.8100, gercekMesafeSonraki: 5.5, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE OSB 1. CADDE", lat: 41.2420, lon: 27.8550, gercekMesafeSonraki: 1.6, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE TOKİ KONUTLARI", lat: 41.2470, lon: 27.8680, gercekMesafeSonraki: 1.5, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE MERKEZ ÇARŞI", lat: 41.2520, lon: 27.8790, gercekMesafeSonraki: 1.2, yolTipi: "Asfalt Cadde" },
            { name: "VELİMEŞE TREN İSTASYONU", lat: 41.2540, lon: 27.8820, gercekMesafeSonraki: 0.0, yolTipi: "Asfalt Cadde" }
        ];
        appendStopsCleanly(ergStops);
        defaultLineRef = { id: "ergene_master", name: "Ergene Beldeler ve OSB Seferleri", district: "Ergene", totalKm: 32.2 };
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
    } else if (normDistLow === "şarköy" || normDistLow === "sarkoy") {
        // Kesintisiz Şarköy Şehir İçi + Mürefte - Hoşköy - Gaziköy Sahil Koridoru (köyler arası 21 km sıçrama olmadan!)
        const sarkoyCoastalStops = [
            { name: "ŞARKÖY OTOGARI", lat: 40.6148, lon: 27.1105, gercekMesafeSonraki: 1.0, yolTipi: "Asfalt Cadde" },
            { name: "ŞARKÖY CUMHURİYET MEYDANI & İSKELE", lat: 40.6122, lon: 27.1145, gercekMesafeSonraki: 0.9, yolTipi: "Sahil Şeridi Yolu" },
            { name: "ŞARKÖY İSTİKLAL CADDESİ ÇARŞI", lat: 40.6140, lon: 27.1180, gercekMesafeSonraki: 1.1, yolTipi: "Asfalt Cadde" },
            { name: "CAMİKEBİR MAHALLESİ", lat: 40.6162, lon: 27.1200, gercekMesafeSonraki: 1.0, yolTipi: "Mahalle Sokağı" },
            { name: "ŞARKÖY DEVLET HASTANESİ", lat: 40.6185, lon: 27.1220, gercekMesafeSonraki: 2.8, yolTipi: "Asfalt Cadde" },
            { name: "KIZILCATERZİ SAHİL KAVŞAĞI", lat: 40.6260, lon: 27.1450, gercekMesafeSonraki: 3.1, yolTipi: "Sahil Şeridi Yolu" },
            { name: "ERİKLİCE SAHİL MEYDANI", lat: 40.6350, lon: 27.1680, gercekMesafeSonraki: 4.2, yolTipi: "Sahil Şeridi Yolu" },
            { name: "AŞAĞIKALAMIŞ BAĞ YOLU", lat: 40.6530, lon: 27.2060, gercekMesafeSonraki: 4.5, yolTipi: "Sahil Şeridi Yolu" },
            { name: "MÜREFTE İSKELE & SAHİL MEYDANI", lat: 40.6710, lon: 27.2450, gercekMesafeSonraki: 4.4, yolTipi: "Sahil Şeridi Yolu" },
            { name: "ŞARKÖY ŞARAP & ZEYTİN BAĞLARI MEVKİİ", lat: 40.6900, lon: 27.2780, gercekMesafeSonraki: 4.1, yolTipi: "Sahil Şeridi Yolu" },
            { name: "HOŞKÖY BALIKÇI BARINAĞI & TARİHİ FENER", lat: 40.7080, lon: 27.3110, gercekMesafeSonraki: 3.8, yolTipi: "Sahil Şeridi Yolu" },
            { name: "GÜZELKÖY YAMAÇ AYRIMI", lat: 40.7285, lon: 27.3280, gercekMesafeSonraki: 3.4, yolTipi: "Sahil Şeridi Yolu" },
            { name: "GAZİKÖY SAHİL DURAĞI", lat: 40.7490, lon: 27.3450, gercekMesafeSonraki: 0.0, yolTipi: "Sahil Şeridi Yolu" }
        ];
        appendStopsCleanly(sarkoyCoastalStops);
        defaultLineRef = { id: "sarkoy_master", name: "Şarköy - Mürefte - Hoşköy Sahil Hatları", district: "Şarköy", totalKm: 34.3 };
    } else if (normDist === "Malkara") {
        // Malkara şehir merkezi ve yakın mahalle ringi (Uzak köyler arasında 44 km sıçramayı önler)
        const malkaraUrbanStops = [
            { name: "MALKARA ŞEHİRLERARASI OTOGARI", lat: 40.8920, lon: 26.9120, gercekMesafeSonraki: 1.2, yolTipi: "Asfalt Cadde" },
            { name: "MALKARA HÜKÜMET MEYDANI & BELEDİYE", lat: 40.8900, lon: 26.9011, gercekMesafeSonraki: 0.8, yolTipi: "Asfalt Cadde" },
            { name: "CAMİATİK MAHALLESİ ÇARŞI", lat: 40.8888, lon: 26.8985, gercekMesafeSonraki: 0.9, yolTipi: "Asfalt Cadde" },
            { name: "GAZİ ÖMER BEY CADDESİ", lat: 40.8875, lon: 26.8950, gercekMesafeSonraki: 1.1, yolTipi: "Asfalt Cadde" },
            { name: "HACIEVHAT MAHALLESİ MEYDANI", lat: 40.8855, lon: 26.8915, gercekMesafeSonraki: 1.3, yolTipi: "Mahalle Sokağı" },
            { name: "MALKARA ESKİ OTOGAR", lat: 40.8895, lon: 26.9040, gercekMesafeSonraki: 1.4, yolTipi: "Asfalt Cadde" },
            { name: "GAZİBEY MAHALLESİ & OKULLAR", lat: 40.8935, lon: 26.9060, gercekMesafeSonraki: 1.2, yolTipi: "Asfalt Cadde" },
            { name: "YENİ MAHALLE KONUTLARI", lat: 40.8960, lon: 26.9095, gercekMesafeSonraki: 1.6, yolTipi: "Mahalle Sokağı" },
            { name: "MALKARA DEVLET HASTANESİ", lat: 40.8990, lon: 26.9150, gercekMesafeSonraki: 1.8, yolTipi: "Asfalt Cadde" },
            { name: "MALKARA HUZUREVİ & MESİRE ALANI", lat: 40.9020, lon: 26.9210, gercekMesafeSonraki: 2.1, yolTipi: "Asfalt Cadde" },
            { name: "MALKARA SANAYİ SİTESİ", lat: 40.8945, lon: 26.9260, gercekMesafeSonraki: 2.6, yolTipi: "Asfalt Cadde" },
            { name: "GÖNENCE YOLU KAVŞAĞI", lat: 40.9050, lon: 26.9380, gercekMesafeSonraki: 2.8, yolTipi: "Asfalt Cadde" },
            { name: "MALKARA D-110 ÇEVRE YOLU DÖNÜŞÜ", lat: 40.8930, lon: 26.9180, gercekMesafeSonraki: 0.0, yolTipi: "Asfalt Cadde" }
        ];
        appendStopsCleanly(malkaraUrbanStops);
        defaultLineRef = { id: "malkara_master", name: "Malkara Şehir İçi Hatları", district: "Malkara", totalKm: 18.8 };
    } else if (normDist === "Hayrabolu") {
        // Hayrabolu şehir içi Hat 36 güzergâhları (56 km'lik dış köy hatlarını ilçe içi başlangıç turuna karıştırmaz)
        const hbUrban = tekulasDb.filter(r => isValidLocalLine(r, "Hayrabolu") && (r.hatNo === "36" || (r.totalKm && r.totalKm <= 15)));
        if (hbUrban.length > 0) {
            hbUrban.slice(0, 2).forEach((l, idx) => {
                if (idx > 0 && master.length > 0) master[master.length - 1].gercekMesafeSonraki = 0;
                appendStopsCleanly(l.stops);
            });
            defaultLineRef = hbUrban[0];
        } else {
            const distLines = tekulasDb.filter(r => isValidLocalLine(r, "Hayrabolu"));
            if (distLines.length > 0) {
                appendStopsCleanly(distLines[0].stops);
                defaultLineRef = distLines[0];
            }
        }
    } else {
        const distLines = tekulasDb.filter(r => isValidLocalLine(r, normDist));
        if (distLines.length > 0) {
            distLines.slice(0, 2).forEach((l, idx) => {
                if (idx > 0 && master.length > 0) master[master.length - 1].gercekMesafeSonraki = 0;
                appendStopsCleanly(l.stops);
            });
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
        const tekulasDb = window.tekulasHatVeritabani.slice();
        if (typeof ilceRotalari !== 'undefined' && Array.isArray(ilceRotalari["Tekirdağ"])) {
            ilceRotalari["Tekirdağ"].forEach(r => {
                if (r && r.id && !tekulasDb.some(x => x && x.id === r.id)) {
                    tekulasDb.push(r);
                }
            });
        }
        
        // Aktif çalışma bölgesini belirle (Varsayılan: Süleymanpaşa)
        const targetDistrict = activeDistrict || (typeof Game !== 'undefined' && Game.activeDistrict) || (typeof localStorage !== 'undefined' ? localStorage.getItem('activeDistrict') : null) || "Süleymanpaşa";

        // 1. Seviye Çıraklık: SEÇİLEN İLÇENİN KESİNTİSİZ ŞEHİR TURU (Kaldığı Duraktan Devam Eden Zincirleme Hatlar)
        // Her ilçe için 1. görev kesinlikle 4 duraklı nazik başlangıçla başlar, kaldığı yerden adım adım şehri dolaştırır
        const { master: masterLevel1Stops, slices: continuousSlices } = buildDistrictContinuousCircuit(targetDistrict, tekulasDb);
        const districtLocalKeywords = continuousSlices;

        // Gerçek GPS Koordinatlı Otoyol & Özel Parkur Üreticisi (Pusula yönü ve karayolu mesafesi %100 gerçek!)
        const HIGHWAY_STOP_COORDS = {
            // Trakya & Marmara
            "Süleymanpaşa Sahil Dolgu Peronu": [40.9765, 27.5155],
            "Barbaros Liman Kavşağı": [40.9220, 27.4960],
            "Asyaport Konteyner Limanı": [40.9035, 27.4795],
            "Kumbağ Sahil Meydanı": [40.8655, 27.4585],
            "Kumbağ Çamlık Virajları": [40.8480, 27.4410],
            "Yeniköy Nişantepe Seyir Terası": [40.8180, 27.4050],
            "Uçmakdere Tarihi Çınaraltı": [40.7955, 27.3655],
            "Gaziköy Sahil Meydanı": [40.7490, 27.3450],
            "Çorlu Otogar": [41.1600, 27.8000],
            "Zafer Mahallesi Sanayi Bulvarı": [41.1680, 27.7850],
            "Türkgücü OSB Kavşağı": [41.1820, 27.7620],
            "Çorlu-Ergene Deri İhtisas OSB Ana Kapı": [41.1920, 27.7520],
            "Vakıflar Sanayi Kavşağı": [41.2380, 27.7550],
            "Ergene Marmaracık Meydanı": [41.2281, 27.7028],
            "Tekirdağ Yeni Otogar": [40.9950, 27.5620],
            "Tekirdağ Merkez": [40.9833, 27.5167],
            "Tekirdağ Otogar": [40.9950, 27.5620],
            "Tekirdağ Merkez Otogar": [40.9950, 27.5620],
            "Süleymanpaşa Otogar": [40.9950, 27.5620],
            "Süleymanpaşa Sahil": [40.9770, 27.5180],
            "Süleymanpaşa Merkez Garaj": [40.9950, 27.5620],
            "Sahil Kordonu Şeref Turu": [40.9775, 27.5210],
            "Değirmenaltı Kordonu": [40.9945, 27.5820],
            "Süleymanpaşa Valilik Meydanı": [40.9785, 27.5145],
            "Marmaraereğlisi Kavşağı": [40.9750, 27.9550],
            "Çorlu Gişeler": [41.2150, 27.8100],
            "Çorlu Otoyol Bağlantısı": [41.1950, 27.8050],
            "Çorlu Zafer Takı": [41.1600, 27.8000],
            "Çorlu Metropol Bulvarı": [41.1620, 27.8080],
            "Velimeşe & Saray Koridoru": [41.3200, 27.9050],
            "Mikyas Kaptanlık Akademisi Şeref Kürsüsü": [40.9833, 27.5167],
            "Kınalı Otoyol Kavşağı": [41.0950, 28.1480],
            "Otoyol VIP Dinlenme Tesisi": [41.0880, 28.1800],
            "Silivri Otoyol Tesisleri": [41.0820, 28.2550],
            "Silivri Kavşağı": [41.0780, 28.2480],
            "Silivri Kıyı Koridoru": [41.0730, 28.2460],
            "Çatalca Viyadüğü": [41.1350, 28.4600],
            "Büyükçekmece Terminali": [41.0220, 28.5850],
            "Beylikdüzü Transfer Merkezi": [41.0020, 28.6420],
            "Avcılar HGS Gişeleri": [40.9950, 28.7120],
            "Mahmutbey Gişeler": [41.0620, 28.8150],
            "İstanbul Esenler Otogarı": [41.0400, 28.8935],
            "İstanbul Esenler": [41.0400, 28.8935],
            "Muratlı Kavşağı": [41.1720, 27.5030],
            "Lüleburgaz Terminal": [41.4050, 27.3580],
            "Babaeski Gişeler": [41.4320, 27.0930],
            "Edirne Selimiye Meydanı": [41.6780, 26.5590],
            "Malkara Kavşağı": [40.8900, 26.9010],
            "Malkara Otoyolu": [40.8850, 26.8950],
            "Keşan Dörtyol": [40.8550, 26.6300],
            "Keşan Koridoru": [40.8550, 26.6300],
            "Gelibolu Yaklaşımı": [40.4150, 26.6680],
            "Gelibolu Yarımadası": [40.4100, 26.6650],
            "Conkbayırı Yaklaşımı": [40.2450, 26.2850],
            "Çanakkale Şehitler Abidesi": [40.0500, 26.2185],
            "1915 Çanakkale Köprüsü & Lapseki": [40.3400, 26.6850],
            "1915 Çanakkale Köprüsü": [40.3400, 26.6850],
            "Çanakkale İskele": [40.1485, 26.4025],
            "Çanakkale Truva": [39.9575, 26.2390],
            // Marmara - Ege
            "İstanbul Anadolu Gişeler": [40.9780, 29.2650],
            "Gebze Dilovası": [40.7850, 29.5350],
            "Osmangazi Köprüsü": [40.7550, 29.5150],
            "Orhangazi Tüneli": [40.4920, 29.3080],
            "Bursa Şehirlerarası Otogar": [40.2660, 29.0620],
            "Bursa Batı Gişeler": [40.2280, 28.8420],
            "Karacabey Kavşağı": [40.2150, 28.3620],
            "Susurluk Dinlenme Tesisi": [39.9120, 28.1580],
            "Balıkesir Kuzey": [39.7250, 27.9120],
            "Balıkesir Merkez Otogar": [39.6520, 27.8950],
            "Balıkesir Otogar": [39.6520, 27.8950],
            "Akhisar Otoyol Kavşağı": [38.9220, 27.8350],
            "Saruhanlı Geçişi": [38.7350, 27.5720],
            "Manisa Sabuncubeli Tüneli": [38.5450, 27.3450],
            "İzmir Bornova Otogarı": [38.4350, 27.2120],
            "İzmir Otogar": [38.4350, 27.2120],
            "İzmir Bornova": [38.4550, 27.2220],
            "Menemen Otoyol": [38.6080, 27.0720],
            "Aliağa Sahil Koridoru": [38.8020, 26.9720],
            "Ayvalık Kavşağı": [39.3180, 26.6950],
            "Edremit Körfez Terminali": [39.5920, 27.0220],
            "Edremit Kazdağları": [39.6250, 26.9650],
            "Bergama Kavşağı": [39.1200, 27.1800],
            "Karşıyaka Sahil": [38.4550, 27.1180],
            "İzmir Alsancak Kordon Meydanı": [38.4380, 27.1420],
            // Anadolu & Şampiyonluk
            "İstanbul Samandıra": [40.9920, 29.2250],
            "Şekerpınar OSB Gişeler": [40.8680, 29.3880],
            "Hereke Sahil Viyadüğü": [40.7850, 29.6250],
            "Körfez Geçişi": [40.7680, 29.7650],
            "Kocaeli İzmit Otogarı": [40.7720, 29.9650],
            "Sakarya Hendek": [40.7980, 30.7480],
            "Düzce Kaynaşlı Gişeler": [40.7750, 31.3050],
            "Kaynaşlı Yaklaşım": [40.7750, 31.3050],
            "Bolu Dağı Polisevi Rampası": [40.7520, 31.4180],
            "Bolu Dağı Sisli Zirve": [40.7380, 31.4520],
            "Bolu Dağı Tüneli Girişi": [40.7550, 31.3980],
            "Bolu Tüneli Çıkış Viyadüğü": [40.7320, 31.4680],
            "Abant Kavşağı": [40.7280, 31.4880],
            "Bolu Batı Gişeler": [40.7320, 31.5480],
            "Bolu Şehirlerarası Otogar": [40.7390, 31.6080],
            "Bolu Doğu Gişeler": [40.7450, 31.6850],
            "Yeniçağa Dinlenme Tesisi": [40.7720, 32.0350],
            "Kızılcahamam Soğuksu Geçidi": [40.4720, 32.6520],
            "Akıncı Gişeler": [40.0950, 32.6250],
            "Ankara AŞTİ Otogarı": [39.9180, 32.8130],
            "Ankara AŞTİ Şeref Peronu": [39.9180, 32.8130],
            "Afyonkarahisar Kavşağı": [38.7560, 30.5380],
            "Polatlı Sakarya Meydanı": [39.5840, 32.1470],
            "Tandoğan Meydanı": [39.9340, 32.8360],
            "Ankara Anıtkabir Tören Alanı": [39.9250, 32.8369],
            "Samsun Otogar": [41.2650, 36.3180],
            "Fatsa Sahil Yolu": [41.0280, 37.5020],
            "Ordu Boztepe Tüneli": [40.9850, 37.8780],
            "Giresun Kalesi Sahili": [40.9180, 38.3890],
            "Trabzon Şehirlerarası Otogar": [40.9980, 39.7520],
            "Trabzon Meydan": [41.0050, 39.7270],
            "Değirmendere Vadisi": [40.9650, 39.7150],
            "Maçka Merkez": [40.8140, 39.6120],
            "Altındere Milli Parkı": [40.7150, 39.6450],
            "Sümela Manastırı Zirve Durağı": [40.6900, 39.6580],
            "Aksaray Sultanhanı": [38.2480, 33.5480],
            "Nevşehir Girişi": [38.6250, 34.7120],
            "Uçhisar Kalesi Yolu": [38.6310, 34.8050],
            "Göreme Peri Bacaları": [38.6430, 34.8290],
            "Ürgüp Turizm Terminali": [38.6300, 34.9120],
            "Konya Ereğli": [37.5130, 34.0480],
            "Ulukışla Vadisi": [37.5480, 34.4850],
            "Pozantı Akçatekir Rampası": [37.4260, 34.8720],
            "Gülek Boğazı Zirvesi": [37.2750, 34.7880],
            "Adana Merkez Otogar": [36.9950, 35.2580],
            "Aydın Otoban Çıkışı": [37.8450, 27.8450],
            "Çine Madrandağı Geçidi": [37.6120, 28.0620],
            "Muğla Sakar Geçidi Virajları": [37.0750, 28.3650],
            "Gökova Körfezi": [37.0480, 28.3280],
            "Marmaris Otogarı": [36.8620, 28.2720],
            "Erzincan Üzümlü": [39.7080, 39.7020],
            "Tercan Geçidi": [39.7780, 40.3850],
            "Aşkale Kop Dağı Yaklaşımı": [39.9220, 40.6950],
            "Erzurum Aziziye": [39.9420, 41.1120],
            "Palandöken Dağ Terminali": [39.8780, 41.2780],
            "Erzurum Otogar": [39.9250, 41.2250],
            "Sivas Kızıldağ Geçidi": [39.8650, 38.4150],
            "Yozgat Akdağmadeni": [39.6620, 35.8850],
            "Kırıkkale Kavşağı": [39.8450, 33.5150],
            "Gaziantep Otogar": [37.1150, 37.3850],
            "Nizip Zeugma Kavşağı": [37.0120, 37.7950],
            "Birecik Fırat Köprüsü": [37.0260, 37.9750],
            "Suruç Otoyolu": [36.9780, 38.4250],
            "Şanlıurfa Balıklıgöl Meydanı": [37.1490, 38.7840],
            "Bitlis Rahva Geçidi": [38.4680, 42.1650],
            "Tatvan Sahil Kordonu": [38.5020, 42.2850],
            "Ahlat Selçuklu Meydanı": [38.7520, 42.4950],
            "Gevaş Akdamar İskelesi": [38.3220, 43.0350],
            "Van Merkez Otogar": [38.5080, 43.3680],
            "İstanbul Havalimanı VIP": [41.2620, 28.7420],
            "Kemerburgaz Otoyolu": [41.1580, 28.9120],
            "FSM Köprüsü Geçişi": [41.0910, 29.0620],
            "Ataşehir Finans Koridoru": [40.9920, 29.1150],
            "Olimpiyat Stadyumu Protokol Kapısı": [41.0745, 28.7655],
            "Kadıköy Rıhtım": [40.9915, 29.0230],
            "Altunizade Yaklaşımı": [41.0215, 29.0450],
            "15 Temmuz Şehitler Köprüsü": [41.0455, 29.0340],
            "Beşiktaş Barbaros Bulvarı": [41.0480, 29.0080],
            "Taksim Cumhuriyet Meydanı": [41.0370, 28.9850]
        };

        const makeHighwayStops = (stopNames, fallbackStepKm = 3.5, roadTypeLabel = "Otoyol & Karayolu") => {
            const coords = stopNames.map((sName, idx) => {
                if (HIGHWAY_STOP_COORDS[sName]) return HIGHWAY_STOP_COORDS[sName];
                return [40.9833 + (idx * 0.02), 27.5167 + (idx * 0.03)];
            });
            let cumulativeKm = 0;
            return stopNames.map((sName, idx) => {
                const isLast = (idx === stopNames.length - 1);
                let dist = 0;
                if (!isLast) {
                    const airKm = calculateDistance(coords[idx][0], coords[idx][1], coords[idx + 1][0], coords[idx + 1][1]);
                    dist = airKm > 0.3 ? Math.max(1.2, Math.round(airKm * 1.24 * 10) / 10) : fallbackStepKm;
                }
                const stopRouteKm = Math.round(cumulativeKm * 10) / 10;
                cumulativeKm += dist;
                return {
                    name: sName,
                    anons: idx === 0
                        ? `${sName} kalkış noktasındayız. Sonraki hedef: ${stopNames[1] || sName}.`
                        : (isLast ? `Son durak: ${sName}. Seferimiz başarıyla tamamlanmıştır.` : `Sonraki durak: ${sName}.`),
                    lat: coords[idx][0],
                    lon: coords[idx][1],
                    routeKm: stopRouteKm,
                    bekleyenYolcu: isLast ? 0 : 18,
                    gercekMesafeSonraki: dist,
                    yolcuTipi: "Sivil",
                    yolTipi: roadTypeLabel,
                    kavsakVar: false
                };
            });
        };

        // 2. Seviye Kalfa (Süleymanpaşa Kıyı & Sahil Hatları — Görev 11-20 ile birebir eşleşir!)
        const kalfaKeywords = [
            { id: "tekulas_150_1_3_altinova", no: "1/3", kw: "ALTINOVA-HÜRRİYET" }, // Görev 11: Altınova Hattı
            { id: "tekulas_194_20", no: "20", kw: "SÜLEYMANPAŞA-KUMBAĞ" },         // Görev 12: Kumbağ Sahil Koridoru
            { no: "97/L", kw: "KUMBAĞ - BARBAROS LİMANI İŞÇİ VARDİYASI", customStops: makeHighwayStops(["Kumbağ Sahil Meydanı", "Barbaros Liman Kavşağı", "Asyaport Konteyner Limanı"], 3.2, "Sahil Şeridi Yolu") }, // Görev 13: Barbaros Liman İşçileri
            { id: "tekulas_97_97", no: "97", kw: "BARBAROS" },                     // Görev 14: Barbaros ➔ Süleymanpaşa Merkez
            { id: "tekulas_196_11b_ciftlikonu", no: "11B", kw: "CIFTLIKONU" },     // Görev 15: Çiftlikönü ve Beyazköy
            { id: "tekulas_172_17", no: "17", kw: "KÖPRÜBAŞI" },                   // Görev 16: Köprübaşı ve Yenişehir
            { id: "tekulas_154_4_15", no: "4/15", kw: "ÇİFTLİKÖNÜ-HUZUREVI" },     // Görev 17: Cuma Pazarı ve Hürriyet Mah.
            { id: "tekulas_170_30_donus", no: "30", kw: "YENİ OTOGAR-DEĞİRMENALTI" }, // Görev 18: Değirmenaltı ➔ Yeni Otogar Gece
            { id: "tekulas_168_13", no: "13", kw: "100.YIL-OKULLAR" },             // Görev 19: 100. Yıl Mahallesi İç Ring
            { id: "hat_corlu_ekspres", no: "28", kw: "CORLU" }                     // Görev 20: Süleymanpaşa ➔ Çorlu Girişi Mezuniyet
        ];

        // 3. Seviye Usta (Çorlu Şehir İçi Hatları — Görev 21-30 ile birebir eşleşir!)
        const corluKeywords = [
            { id: "tekulas_1_1_yesiltepe", no: "1", kw: "YESILTEPE-EMLAK" },       // Görev 21: Yeşiltepe ➔ Emlak Konutları
            { id: "tekulas_3_2", no: "2", kw: "SAĞLIK MAH.- GÖLBAŞI" },            // Görev 22: Sağlık Mahallesi ➔ Gölbaşı Parkı
            { id: "tekulas_5_3", no: "3", kw: "HAVUZLAR-HATİP" },                  // Görev 23: Havuzlar ➔ Hatip Mahallesi
            { id: "tekulas_7_4", no: "4", kw: "KIVANC-DEVLET" },                   // Görev 24: Kıvanç ➔ Çorlu Devlet Hastanesi
            { id: "tekulas_9_5_havuzlar", no: "5", kw: "HAVUZLAR-DEVLET" },        // Görev 25: Havuzlar ➔ Devlet Hastanesi Ring
            { id: "tekulas_11_6", no: "6", kw: "KEMALETTİN MAH" },                 // Görev 26: Kemalettin Mah. ➔ Çarşı
            { id: "tekulas_21_13", no: "13", kw: "OTOGAR-HAVALİMANI" },            // Görev 27: Çorlu Otogar ➔ Çorlu Havalimanı VIP
            { id: "tekulas_13_7", no: "7", kw: "DEVLET HAST.- ÇORLU PARK" },       // Görev 28: Devlet Hastanesi ➔ Çorlu Park Gece
            { id: "tekulas_17_16", no: "16", kw: "ÇORLU OTOGAR-CEZAEVİ" },         // Görev 29: Çorlu Otogar ➔ Çorlu Cezaevi
            { id: "hat_corlu_marmaraereglisi", no: "83", kw: "MARMARAEREĞLİSİ" }   // Görev 30: Çorlu Merkez ➔ Marmaraereğlisi Mezuniyet
        ];

        // 4. Seviye İlçeler Arası (Bölgesel İlçe Seferleri — Görev 31-40 ile birebir eşleşir!)
        const ilceKeywords = [
            { id: "hat_suleymanpasa_marmaraereglisi", no: "ME-15", kw: "MARMARAEREĞLİSİ" }, // Görev 31: Hat Marmaraereğlisi
            { id: "tekulas_38_22", no: "22", kw: "MURATLI" },                               // Görev 32: Hat Muratlı
            { id: "tekulas_62_38", no: "38", kw: "YENİCE" },                                // Görev 33: Hat Yenice
            { no: "138", kw: "SÜLEYMANPAŞA - UÇMAKDERE KIYI DAĞ HATTI", customStops: makeHighwayStops(["Süleymanpaşa Sahil Dolgu Peronu", "Barbaros Liman Kavşağı", "Kumbağ Çamlık Virajları", "Yeniköy Nişantepe Seyir Terası", "Uçmakdere Tarihi Çınaraltı", "Gaziköy Sahil Meydanı"], 4.2, "Sahil Şeridi Yolu") }, // Görev 34: Hat Uçmakdere
            { id: "tekulas_50_50", no: "50", kw: "HAYRABOLU" },                             // Görev 35: Hat Hayrabolu
            { id: "tekulas_143_35", no: "35", kw: "MALKARA" },                              // Görev 36: Hat Malkara
            { id: "tekulas_61_83", no: "83", kw: "YENİÇİFTLİK" },                           // Görev 37: Hat Çorlu-Yenice/Yeniçiftlik
            { id: "tekulas_47_47", no: "47", kw: "SARAY" },                                 // Görev 38: Hat Saray
            { id: "tekulas_71_71", no: "71", kw: "KIZILPINAR" },                            // Görev 39: Hat Kızılpınar
            { id: "tekulas_148_28_corlu", no: "28", kw: "CORLU-M.EREGLISI-SULEYMANPASA" }   // Görev 40: Hat Kıyı Fatihi Finali
        ];

        // 5. Seviye Ergene & Velimeşe OSB Ağır Sanayi Hatları (Görev 41-50 ile birebir eşleşir!)
        const osbKeywords = [
            { id: "hat_48_velimese_corlu", no: "48", kw: "VELİMEŞE-ÇORLU" },       // Görev 41: Velimeşe-Çorlu Ekspres
            { id: "hat_velimese_mahalle_ring", no: "VM-RING", kw: "VELİMEŞE" },    // Görev 42: Velimeşe Mahalle İçi
            { no: "ERG-DERİ", kw: "ÇORLU - ERGENE DERİ İHTİSAS OSB VARDİYASI", customStops: makeHighwayStops(["Çorlu Otogar", "Zafer Mahallesi Sanayi Bulvarı", "Türkgücü OSB Kavşağı", "Çorlu-Ergene Deri İhtisas OSB Ana Kapı", "Vakıflar Sanayi Kavşağı", "Ergene Marmaracık Meydanı"], 2.8, "Asfalt Cadde") }, // Görev 43: Ergene Deri OSB
            { id: "tekulas_56_56", no: "56", kw: "Marmaracık" },                   // Görev 44: Marmaracık Sanayi
            { id: "tekulas_erg_1_belde", no: "ERG-1", kw: "ULAŞ" },                // Görev 45: Ulaş Beldesi
            { id: "hat_velimese_cetin_ring", no: "48/R", kw: "VELİMEŞE" },         // Görev 46: Velimeşe Tren Garı
            { id: "hat_ergene_cerkezkoy", no: "ERG-ÇER-79", kw: "ERGENE" },        // Görev 47: Ergene Gece Vardiyası
            { id: "hat_corlu_cerkezkoy", no: "ÇOR-ÇER-70", kw: "OSB" },            // Görev 48: OSB Ağır Sanayi
            { id: "tekulas_48_48", no: "48", kw: "VELİMEŞE - 1" },                 // Görev 49: Çorlu Çevre Yolu
            { id: "hat_ergene_saray", no: "ERG-SAR-83", kw: "ERGENE" }             // Görev 50: OSB Filo Şampiyonası
        ];

        // 6. Seviye 18 Metre Körüklü Otobüs Metropol Hatları (Görev 51-60 ile birebir eşleşir!)
        const korukluKeywords = [
            { id: "tekulas_175_18", no: "18", kw: "ŞEHİR HASTANESİ" },             // Görev 51: Körüklü İlk Seferi
            { id: "tekulas_148_28_corlu", no: "28", kw: "CORLU-M.EREGLISI" },      // Görev 52: Geniş Dönüş Manevrası
            { id: "tekulas_97_97", no: "97", kw: "CUMHURİYET MEYDANI" },           // Görev 53: Tekirdağspor Taraftar Konvoyu
            { id: "tekulas_152_2_7", no: "2/7", kw: "100.YIL-NKU" },               // Görev 54: Bahar Şenliği İntikali (NKÜ)
            { id: "tekulas_147_26", no: "26", kw: "SÜLEYMANPASA-ÇERKEZKÖY-KAPAKLI-SARAY" }, // Görev 55: Hat 26 Saray Ekspres!
            { id: "tekulas_1_1_yesiltepe", no: "1", kw: "YESILTEPE-EMLAK" },       // Görev 56: Çorlu Meydan Yoğun Sefer
            { id: "tekulas_5_3", no: "3", kw: "HAVUZLAR-HATİP" },                  // Görev 57: Çift Kapılı Hızlı Boşaltma
            { id: "tekulas_169_29", no: "29", kw: "YENİ OTOGAR-ALTINOVA" },        // Görev 58: Yağmurda Körüklü Dengesi
            { id: "tekulas_194_20", no: "20", kw: "KUMBAĞ" },                      // Görev 59: Gece Vardiya Ekspresi
            { id: "tekulas_143_35", no: "35", kw: "MALKARA" }                      // Görev 60: Körüklü Master Finali
        ];

        // 7. Seviye Trakya Dağ Geçitleri & İlçe Hatları (Görev 61-70 ile birebir eşleşir!)
        const dagKeywords = [
            { id: "tekulas_212_50", no: "50", kw: "ŞARKÖY OTOGAR" },               // Görev 61: Şarköy Zeytin Hasadı
            { id: "tekulas_215_53", no: "53", kw: "GÜZELKÖY" },                    // Görev 62: Mürefte Sahil Virajları (Hoşköy-Mürefte-Şarköy)
            { id: "tekulas_224_57_malkara", no: "57/MALKARA", kw: "BAYRAMTEPE" },  // Görev 63: Malkara Kış Karayolu
            { id: "tekulas_50_50", no: "50", kw: "HAYRABOLU OTOGAR" },             // Görev 64: Hayrabolu Ayçiçeği Heyeti
            { id: "hat_sinir_saray_vize", no: "SNR-KIR-02", kw: "SARAY" },         // Görev 65: Saray Orman Yolu Sınırı
            { id: "tekulas_84_6_tepe", no: "6-TEPE", kw: "TEPE DURAĞI" },          // Görev 66: Çerkezköy Sanayi Hattı
            { id: "tekulas_86_1_yildizkent", no: "1-YILDIZKENT", kw: "YILDIZKENT" }, // Görev 67: Kapaklı Akşam Yoğunluğu
            { id: "hat_suleymanpasa_malkara", no: "ML-35", kw: "MALKARA" },        // Görev 68: Süleymanpaşa-Malkara Gece
            { id: "hat_suleymanpasa_sarkoy", no: "SK-45", kw: "ŞARKÖY" },          // Görev 69: Şarköy Dağ Geçidi (Uçmakdere-Mürefte-Şarköy)
            { id: "hat_malkara_sarkoy", no: "ML-SK-90", kw: "MALKARA - ŞARKÖY" }   // Görev 70: Trakya Zirve Kapanışı
        ];

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
            { lic: 1, name: "1. Sınıf Stajyer Kaptan", list: districtLocalKeywords, color: "#3b82f6" },
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
                    const validDb = tekulasDb.filter(r => !isBrokenPlaceholderRoute(r));
                    const kwNorm = normTrApi(item.kw);
                    found = item.id ? validDb.find(r => r.id === item.id) : null;
                    if (!found) found = validDb.find(r => !r.isReturn && ((r.hatNo === item.no && normTrApi(r.name).includes(kwNorm)) || normTrApi(r.rawName).includes(kwNorm)));
                    if (!found) found = validDb.find(r => !r.isReturn && (normTrApi(r.name).includes(kwNorm) || normTrApi(r.rawName).includes(kwNorm)));
                    if (!found) found = validDb.find(r => normTrApi(r.name).includes(kwNorm) || normTrApi(r.rawName).includes(kwNorm));
                    if (!found) found = validDb[taskGlobalIndex % Math.max(1, validDb.length)] || tekulasDb[0];
                    // Derin kopya: Orijinal TEKULAŞ durak referanslarının bozulmasını önler!
                    routeStops = (found.stops || []).map(s => Object.assign({}, s));
                    routeTotalKm = found.totalKm || Math.round(routeStops.reduce((sum, st) => sum + (Number(st.gercekMesafeSonraki) || 0), 0) * 10) / 10;
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
                    name: "Görev " + taskNum + " (" + (lvl.name || 'Şehir İçi Kaptan') + "): " + (item.name || found.name || 'Sefer'),
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

        // Ayrıca tüm temiz TEKULAŞ hatlarını routesData içine tekil ekle (bozuk İLK DURAK/SON DURAK şablonlarını hariç tut)
        tekulasDb.forEach(r => {
            if (r && r.id && !isBrokenPlaceholderRoute(r) && !routesData[r.id]) routesData[r.id] = r;
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
    const routeSlug = normTrApi(cityName + "_" + districtName + "_" + neighborhoodName)
        .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const routeId = "free_roam_" + routeSlug;

    // Tekirdağ için yalnızca seçilen ilçenin gerçek duraklarını kullan (Asla Çorlu tekulas[0]'a veya İLK DURAK şablonuna düşmez!)
    if (cityName === "Tekirdağ" && typeof window !== 'undefined' && window.tekulasHatVeritabani) {
        const tekulas = window.tekulasHatVeritabani;
        const neighNorm = normTrApi(neighborhoodName).replace(/\bmahallesi\b/g, '').trim();
        const distNorm = normTrApi(districtName);
        const matchingLine = isFullDistrictTour ? null : (
            tekulas.find(r => {
                if (!r || r.isReturn || isBrokenPlaceholderRoute(r) || r.stops.length < 4) return false;
                if (r.originDistrict && r.destDistrict && normTrApi(r.originDistrict) !== normTrApi(r.destDistrict)) return false;
                if (normTrApi(r.district) !== distNorm) return false;
                return neighNorm && (
                    normTrApi(r.name).includes(neighNorm) ||
                    r.stops.some(st => st && normTrApi(st.name).includes(neighNorm))
                );
            }) || tekulas.find(r => {
                if (!r || r.isReturn || isBrokenPlaceholderRoute(r)) return false;
                if (r.originDistrict && r.destDistrict && normTrApi(r.originDistrict) !== normTrApi(r.destDistrict)) return false;
                if (normTrApi(r.district) !== distNorm) return false;
                return neighNorm && (
                    normTrApi(r.name).includes(neighNorm) ||
                    r.stops.some(st => st && normTrApi(st.name).includes(neighNorm))
                );
            })
        );

        if (matchingLine && Array.isArray(matchingLine.stops) && matchingLine.stops.length >= 2) {
            const clonedStops = matchingLine.stops.map(s => Object.assign({}, s));
            const mStart = matchingLine.startStop || clonedStops[0].name || "Kalkış Garajı";
            const mEnd = matchingLine.endStop || clonedStops[clonedStops.length - 1].name || "Varış Durağı";
            const freeRoute = Object.assign({}, matchingLine, {
                id: routeId,
                sehir: "Tekirdağ",
                district: districtName,
                isFreeRoam: true,
                isCity: true,
                isDistrict: false,
                taskIndex: null,
                stops: clonedStops,
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

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

// Generate 30 Progressive Routes (3 Licenses x 10 Tasks) from raw API stops
function generateRoutesFromAPI(rawStops, cityName) {
    /* TEKULAŞ_PROGRESSIVE_TASKS_SYSTEM */
    // TEKİRDAĞ İÇİN RESMİ TEKULAŞ BELEDİYE HATLARI HARİTALAMASI (183 HAT VERİTABANI)
    if (cityName === "Tekirdağ" && typeof window !== 'undefined' && window.tekulasHatVeritabani && window.tekulasHatVeritabani.length > 0) {
        const tekulasDb = window.tekulasHatVeritabani;
        
        // 1. Seviye Çırak (Süleymanpaşa Yerel Şehir İçi Hatları)
        const spasaLocalKeywords = [
            { no: "1", kw: "RÜSTEMPAŞA CAMİ" },
            { no: "1/3", kw: "ALTINOVA" },
            { no: "2/7", kw: "100. Yıl Mahallesi" },
            { no: "6", kw: "AYDOGDU" },
            { no: "8", kw: "SPOR SALONU" },
            { no: "4/15", kw: "HUZUREVİ", id: "tekulas_154_4_15" },
            { no: "10", kw: "DİŞ SAĞLIĞI" },
            { no: "11", kw: "BAHÇELİEVLER" },
            { no: "12", kw: "ALTINOVA-OTOGAR" },
            { no: "30", kw: "DEĞİRMENALTI" }
        ];

        // 1. Seviye Çıraklık İçin Kademeli Durak Sayısı (4 Duraktan 14 Durağa Isınma Eğrisi)
        const level1StopCounts = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14];

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

        const allLevels = [
            { lic: 1, name: "Çırak", list: spasaLocalKeywords, color: "#3b82f6" },
            { lic: 2, name: "Kalfa", list: kalfaKeywords, color: "#eab308" },
            { lic: 3, name: "Usta", list: corluKeywords, color: "#ef4444" },
            { lic: 4, name: "İlçeler Arası", list: ilceKeywords, color: "#a855f7" }
        ];

        let taskGlobalIndex = 0;
        if (typeof routesData === 'undefined' || !routesData) routesData = {};

        allLevels.forEach(lvl => {
            lvl.list.forEach((item, tIdx) => {
                let found = item.id ? tekulasDb.find(r => r.id === item.id) : null;
                if (!found) found = tekulasDb.find(r => r.name.includes(item.kw) || (r.hatNo === item.no && r.name.includes(item.kw)));
                if (!found) found = tekulasDb.find(r => r.name.includes(item.kw));
                if (!found) found = tekulasDb[taskGlobalIndex % tekulasDb.length];

                const taskNum = tIdx + 1;
                const isTraining = (lvl.lic === 1 && taskNum <= 3);
                const routeId = "tekirdag_task_" + taskGlobalIndex;

                // Çıraklık Seviyesi (Level 1) için kademeli durak ve mesafe dilimleme
                let routeStops = found.stops;
                let routeTotalKm = found.totalKm;

                if (lvl.lic === 1) {
                    const targetCount = level1StopCounts[tIdx] || 6;
                    routeStops = found.stops.slice(0, Math.min(targetCount, found.stops.length)).map(s => Object.assign({}, s));
                    
                    let calcKm = 0;
                    for (let s = 0; s < routeStops.length - 1; s++) {
                        calcKm += (routeStops[s].gercekMesafeSonraki || 0.6);
                    }
                    routeTotalKm = Math.round(calcKm * 10) / 10;
                    if (routeTotalKm < 1.0) routeTotalKm = 1.5;
                    
                    // Son durağın kalan mesafesini 0 yap
                    routeStops[routeStops.length - 1].gercekMesafeSonraki = 0;
                }

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
                    "<strong>Görev Tanımı:</strong> Görev " + taskNum + " (" + lvl.name + "): " + found.name + "<br>",
                    "<strong>Kalkış (Başlangıç) Durağı:</strong> " + startStop + "<br>",
                    "<strong>Uğranacak Ara Duraklar:</strong> " + (intermediate.length > 0 ? intermediate.join(" ➔ ") : "Ara durak bulunmamaktadır (Doğrudan varış durağına sürüş)") + "<br>",
                    "<strong>Gitmeniz Gereken Son Durak (Hedef):</strong> " + endStop + "<br>",
                    "<strong>Toplam Durak Sayısı:</strong> " + routeStops.length + " Durak | <strong>Mesafe:</strong> " + routeTotalKm + " KM<br><br>",
                    "<strong>Görev Adımları (A tuşu ile özet, Shift + A ile adım adım dinleyin):</strong><br>",
                    formulaSteps.map(st => "• " + st).join("<br>"),
                    (isTraining ? "<br><br><em>(Eğitim sürüşüdür; araçta yolcu bulunmaz.)</em>" : "")
                ].join("");

                const speechBriefing = "Görev " + taskNum + " brifingi. Hat: " + found.name + ". Kalkış durağınız: " + startStop + ". " +
                    (intermediate.length > 0 ? "Durulacak ara duraklar: " + intermediate.join(", ") + ". " : "Ara durak bulunmamaktadır. ") +
                    "Hedef son durak: " + endStop + ". Toplam " + routeStops.length + " durak, " + routeTotalKm + " kilometre. Görev adımları: " + formulaSteps.join(". ");

                const taskRoute = Object.assign({}, found, {
                    id: routeId,
                    sehir: "Tekirdağ",
                    district: lvl.lic === 1 ? "Süleymanpaşa" : (found.district || "Süleymanpaşa"),
                    isDistrict: false,
                    isCity: true,
                    name: "Görev " + taskNum + " (" + lvl.name + "): " + found.name,
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
                selected.push({ name: (cityName === "Tekirdağ" ? "Süleymanpaşa Otogar" : cityName + " Otogar"), lat: 40.0, lon: 27.0 });
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

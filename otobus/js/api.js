/* ==========================================================================
   TÃœRKÄ°YE TURNESÄ° - OTOBÃœS SÄ°MÃœLASYONU API DOSYASI (API.JS)
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
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye mutlak sÄ±nÄ±r

        const response = await fetch(url, {
            method: "POST",
            body: finalQuery,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API HatasÄ±: ${response.status} ${response.statusText}`);
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
                    name: durak.tags.name || "Ä°simsiz Durak",
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
        console.error("Duraklar Ã§ekilirken hata oluÅŸtu:", error);
        throw error;
    }
}

// Generate 30 Progressive Routes (3 Licenses x 10 Tasks) from raw API stops
function generateRoutesFromAPI(rawStops, cityName) {
    let filtered = rawStops.filter(d => d.name !== "Ä°simsiz Durak");
    
    if (filtered.length < 3) {
        return false;
    }
    
    filtered.sort(() => 0.5 - Math.random());
    
        const buildRoute = (id, name, desc, taskIndex, licenseLvl, stopCount, color, isReturn, prevRouteStops, isTraining) => {
            let selected = [];
            
            if (isReturn && prevRouteStops) {
                // DÃ¶nÃ¼ÅŸ rotasÄ±ysa, bir Ã¶nceki gidiÅŸ rotasÄ±nÄ±n duraklarÄ±nÄ± tam tersine Ã§evir
                selected = prevRouteStops.slice().reverse().map(s => ({
                    lat: s.lat, lon: s.lon, name: s.name
                }));
            } else {
                // GidiÅŸ rotasÄ±ysa normal Ã¼ret
                // Her yeni gidiÅŸ rotasÄ±nda duraklarÄ± karÄ±ÅŸtÄ±r ki farklÄ± baÅŸlangÄ±Ã§ ve bitiÅŸler olsun
                const shuffledFiltered = [...filtered].sort(() => 0.5 - Math.random());
                // Åehirdeki toplam durak sayÄ±sÄ±nÄ± geÃ§meyecek ÅŸekilde sÄ±nÄ±rÄ± belirle (A->B->A dÃ¶ngÃ¼sÃ¼nÃ¼ engeller)
                const limit = Math.min(stopCount, shuffledFiltered.length);
                for (let i = 0; i < limit; i++) {
                    selected.push(shuffledFiltered[i]);
                }
            }
            
            let kumulatifMesafe = 0;
            const processedStops = [];
            
            for (let i = 0; i < selected.length; i++) {
                let mesafe = 0;
                if (i < selected.length - 1) {
                    let gercek = calculateDistance(selected[i].lat, selected[i].lon, selected[i+1].lat, selected[i+1].lon);
                    if (gercek === 0) gercek = 1.5; 
                    mesafe = Math.max(1.0, Math.min(4.0, gercek * 2)); 
                }

                const currentKm = kumulatifMesafe;
                const scaledSonrakiMesafe = mesafe / 2; 
                kumulatifMesafe += scaledSonrakiMesafe;
                
                const yolcuTipleri = ["Sivil", "Ã–ÄŸrenci", "KarÄ±ÅŸÄ±k", "YaÅŸlÄ±"];
                const tip = yolcuTipleri[Math.floor(Math.random() * yolcuTipleri.length)];
                
                // Antrenman moduysa yolcu beklemesin
                const bekleyen = isTraining ? 0 : Math.floor(Math.random() * 40) + 10;
                
                const yollar = ["Asfalt Cadde", "Mahalle SokaÄŸÄ±", "Toprak Yol", "Kumlu Yol", "Ã‡imenli Yol", "Sahil Åeridi Yolu", "Ã‡akÄ±llÄ± Yol"];
                const rastgeleYol = yollar[Math.floor(Math.random() * yollar.length)];
                
                // KavÅŸak olma ihtimali %30
                const kavsakMevcut = Math.random() < 0.3;
                
                processedStops.push({
                    name: selected[i].name,
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
            name: name,
            desc: desc,
            color: color,
            zemin: "Åehir Ä°Ã§i",
            otobusKapasitesi: 80,
            taskIndex: taskIndex,
            licenseLevel: licenseLvl,
            stops: processedStops
        };
    };

    const routes = [];
    let globalTaskIndex = 0;
    let prevStops = null;

    // 4 Ehliyet Seviyesi, her birinde 10 gÃ¶rev (Toplam 40 gÃ¶rev)
    for (let lic = 1; lic <= 4; lic++) {
        for (let task = 1; task <= 10; task++) {
            
            // Durak sayÄ±sÄ±nÄ± hesapla
            let baseStops = lic === 1 ? 4 : (lic === 2 ? 8 : (lic === 3 ? 12 : 15));
            let stopCount = baseStops + (task - 1);
            
            // Renk paleti
            let color = "#3b82f6"; // Ã‡Ä±rak
            if (lic === 2) color = "#eab308"; // Kalfa
            if (lic === 3) color = "#ef4444"; // Usta
            if (lic === 4) color = "#a855f7"; // Ä°lÃ§eler ArasÄ±
            
            let licName = lic === 1 ? "Ã‡Ä±rak" : (lic === 2 ? "Kalfa" : (lic === 3 ? "Usta" : "Ä°lÃ§eler ArasÄ±"));
            
            // GidiÅŸ mi, DÃ¶nÃ¼ÅŸ mÃ¼? (Ã‡ift index = GidiÅŸ, Tek index = DÃ¶nÃ¼ÅŸ)
            let isReturn = (globalTaskIndex % 2 !== 0);
            
            let routeId = `${cityName.toLowerCase()}_task_${globalTaskIndex}`;
            // EÄŸitim rotasÄ± mÄ±? (1. Seviyenin ilk 3 gÃ¶revi)
            let isTraining = (lic === 1 && task <= 3);
            
            // Yolcusuz eÄŸitim gÃ¶revlerinde 2 durak yeterli
            if (isTraining) {
                stopCount = 2;
            }
            
            let directionLabel = isReturn ? "(DÃ¶nÃ¼ÅŸ)" : "(GidiÅŸ)";
            let title = isTraining ? `1. SÄ±nÄ±f Ehliyet - GÃ¶rev ${task} (EÄŸitim SÃ¼rÃ¼ÅŸÃ¼)` : `${lic}. SÄ±nÄ±f Ehliyet - GÃ¶rev ${task} ${directionLabel}`;
            let desc = isTraining ? `Sadece gÃ¼zergahÄ± Ã¶ÄŸrenmek iÃ§in yolcusuz eÄŸitim sÃ¼rÃ¼ÅŸÃ¼dÃ¼r. Ä°ki durak arasÄ± ilerleyin.` : `${licName} ÅŸofÃ¶rleri iÃ§in ${stopCount} duraklÄ± ${directionLabel.toLowerCase()} rotasÄ±.`;
            
            if (lic === 4) {
                title = `Ä°lÃ§eler ArasÄ± GÃ¶rev ${task} ${directionLabel}`;
                desc = `Ä°lÃ§eler arasÄ± uzun mesafe seferi. Toplam ${stopCount} durak.`;
            } else if (task === 10) {
                desc = `DÄ°KKAT: ${lic}. SÄ±nÄ±f ehliyetin FÄ°NAL gÃ¶revidir!`;
            }

            let newRoute = buildRoute(routeId, title, desc, globalTaskIndex, lic, stopCount, color, isReturn, prevStops, isTraining);
            
            if (lic === 4) {
                newRoute.stops.forEach(stop => {
                    stop.gercekMesafeSonraki *= (1.5 + Math.random() * 1.5); // Mesafeleri 1.5x - 3x uzat
                });
            }

            routes.push(newRoute);
            
            // Sonraki dÃ¶ngÃ¼de dÃ¶nÃ¼ÅŸ rotasÄ± oluÅŸturabilmek iÃ§in gidiÅŸ rotasÄ±nÄ± kaydet
            if (!isReturn) {
                prevStops = newRoute.stops;
            }

            globalTaskIndex++;
        }
    }
    
    // Global routesData objesine kaydet
    routesData = {};
    routes.forEach(r => {
        routesData[r.id] = r;
    });

    return true;
}




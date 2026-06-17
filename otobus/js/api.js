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
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye mutlak sınır

        const response = await fetch(url, {
            method: "POST",
            body: finalQuery,
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
    let filtered = rawStops.filter(d => d.name !== "İsimsiz Durak");
    
    if (filtered.length < 3) {
        return false;
    }
    
    filtered.sort(() => 0.5 - Math.random());
    
        const buildRoute = (id, name, desc, taskIndex, licenseLvl, stopCount, color, isReturn, prevRouteStops, isTraining) => {
            let selected = [];
            
            if (isReturn && prevRouteStops) {
                // Dönüş rotasıysa, bir önceki gidiş rotasının duraklarını tam tersine çevir
                selected = prevRouteStops.slice().reverse().map(s => ({
                    lat: s.lat, lon: s.lon, name: s.name
                }));
            } else {
                // Gidiş rotasıysa normal üret
                // Her yeni gidiş rotasında durakları karıştır ki farklı başlangıç ve bitişler olsun
                const shuffledFiltered = [...filtered].sort(() => 0.5 - Math.random());
                // Åehirdeki toplam durak sayısını geçmeyecek şekilde sınırı belirle (A->B->A döngüsünü engeller)
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
                
                const yolcuTipleri = ["Sivil", "Öğrenci", "Karışık", "Yaşlı"];
                const tip = yolcuTipleri[Math.floor(Math.random() * yolcuTipleri.length)];
                
                // Antrenman moduysa yolcu beklemesin
                const bekleyen = isTraining ? 0 : Math.floor(Math.random() * 40) + 10;
                
                const yollar = ["Asfalt Cadde", "Mahalle Sokağı", "Toprak Yol", "Kumlu Yol", "Çimenli Yol", "Sahil Åeridi Yolu", "Çakıllı Yol"];
                const rastgeleYol = yollar[Math.floor(Math.random() * yollar.length)];
                
                // Kavşak olma ihtimali %30
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
            zemin: "Åehir İçi",
            otobusKapasitesi: 80,
            taskIndex: taskIndex,
            licenseLevel: licenseLvl,
            stops: processedStops
        };
    };

    const routes = [];
    let globalTaskIndex = 0;
    let prevStops = null;

    // 4 Ehliyet Seviyesi, her birinde 10 görev (Toplam 40 görev)
    for (let lic = 1; lic <= 4; lic++) {
        for (let task = 1; task <= 10; task++) {
            
            // Durak sayısını hesapla
            let baseStops = lic === 1 ? 4 : (lic === 2 ? 8 : (lic === 3 ? 12 : 15));
            let stopCount = baseStops + (task - 1);
            
            // Renk paleti
            let color = "#3b82f6"; // Çırak
            if (lic === 2) color = "#eab308"; // Kalfa
            if (lic === 3) color = "#ef4444"; // Usta
            if (lic === 4) color = "#a855f7"; // İlçeler Arası
            
            let licName = lic === 1 ? "Çırak" : (lic === 2 ? "Kalfa" : (lic === 3 ? "Usta" : "İlçeler Arası"));
            
            // Gidiş mi, Dönüş mü? (Çift index = Gidiş, Tek index = Dönüş)
            let isReturn = (globalTaskIndex % 2 !== 0);
            
            let routeId = `${cityName.toLowerCase()}_task_${globalTaskIndex}`;
            // Eğitim rotası mı? (1. Seviyenin ilk 3 görevi)
            let isTraining = (lic === 1 && task <= 3);
            
            // Yolcusuz eğitim görevlerinde 2 durak yeterli
            if (isTraining) {
                stopCount = 2;
            }
            
            let directionLabel = isReturn ? "(Dönüş)" : "(Gidiş)";
            let title = isTraining ? `1. Sınıf Ehliyet - Görev ${task} (Eğitim Sürüşü)` : `${lic}. Sınıf Ehliyet - Görev ${task} ${directionLabel}`;
            let desc = isTraining ? `Sadece güzergahı öğrenmek için yolcusuz eğitim sürüşüdür. İki durak arası ilerleyin.` : `${licName} şoförleri için ${stopCount} duraklı ${directionLabel.toLowerCase()} rotası.`;
            
            if (lic === 4) {
                title = `İlçeler Arası Görev ${task} ${directionLabel}`;
                desc = `İlçeler arası uzun mesafe seferi. Toplam ${stopCount} durak.`;
            } else if (task === 10) {
                desc = `DİKKAT: ${lic}. Sınıf ehliyetin FİNAL görevidir!`;
            }

            let newRoute = buildRoute(routeId, title, desc, globalTaskIndex, lic, stopCount, color, isReturn, prevStops, isTraining);
            
            if (lic === 4) {
                newRoute.stops.forEach(stop => {
                    stop.gercekMesafeSonraki *= (1.5 + Math.random() * 1.5); // Mesafeleri 1.5x - 3x uzat
                });
            }

            routes.push(newRoute);
            
            // Sonraki döngüde dönüş rotası oluşturabilmek için gidiş rotasını kaydet
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





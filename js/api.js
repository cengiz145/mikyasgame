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
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 saniye mutlak sınır

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
    let filtered = rawStops.filter(d => d.name !== "İsimsiz Durak");
    
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
                let gercek = calculateDistance(selected[i].lat, selected[i].lon, selected[i+1].lat, selected[i+1].lon);
                if (gercek === 0) gercek = 1.5;
                mesafe = Math.max(1.0, Math.min(4.0, gercek * 2));
            }

            const currentKm = kumulatifMesafe;
            const scaledSonrakiMesafe = mesafe / 2;
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
                newRoute.stops.forEach(stop => {
                    stop.gercekMesafeSonraki *= (1.5 + Math.random() * 1.5);
                });
            }

            routes.push(newRoute);
            
            if (!isReturn) {
                prevStops = newRoute.stops;
            }

            globalTaskIndex++;
        }
    }
    
    routesData = {};
    routes.forEach(r => {
        routesData[r.id] = r;
    });

    return true;
}

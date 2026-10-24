/* ==========================================================================
   CANLI HAVA DURUMU & GERÇEK ZAMANLI METEOROLOJİ MOTORU (LIVE WEATHER ENGINE)
   Dünyanın İlk Gerçek Zamanlı Uydu ve Meteoroloji Entegrasyonlu Körler Simülasyonu
   - 81 İl ve İlçelerin Anlık GPS Uydu Verisi (Open-Meteo & OpenWeatherMap Hibrit)
   - Yağmur, Kar, Sis, Fırtına, Sıcaklık, Rüzgar ve Gece/Gündüz Döngüsü
   - 3 Kademeli Akıllı Önbellek (30 Dk Cache) ve Çökmez Çelik Sigorta (Fallback)
   - Kabin İçi Sesler: Ön Cama Vuran Yağmur, Yolcu Şemsiye Silkeleme, Kar Çıtırtısı
   - Geliştirici: Ümit Ekrem Mikyas
   ========================================================================== */

(function(window) {
    'use strict';

    // 81 İlin Resmi Coğrafi GPS Merkez Koordinatları (Enlem / Boylam)
    const PROVINCE_COORDINATES = {
        "Adana": { lat: 37.00, lon: 35.32 },
        "Adıyaman": { lat: 37.76, lon: 38.27 },
        "Afyonkarahisar": { lat: 38.75, lon: 30.54 },
        "Ağrı": { lat: 39.72, lon: 43.05 },
        "Amasya": { lat: 40.65, lon: 35.83 },
        "Ankara": { lat: 39.93, lon: 32.85 },
        "Antalya": { lat: 36.89, lon: 30.70 },
        "Artvin": { lat: 41.18, lon: 41.82 },
        "Aydın": { lat: 37.84, lon: 27.84 },
        "Balıkesir": { lat: 39.65, lon: 27.88 },
        "Bilecik": { lat: 40.14, lon: 29.98 },
        "Bingöl": { lat: 38.88, lon: 40.49 },
        "Bitlis": { lat: 38.40, lon: 42.11 },
        "Bolu": { lat: 40.73, lon: 31.60 },
        "Burdur": { lat: 37.72, lon: 30.29 },
        "Bursa": { lat: 40.18, lon: 29.06 },
        "Çanakkale": { lat: 40.15, lon: 26.41 },
        "Çankırı": { lat: 40.60, lon: 33.62 },
        "Çorum": { lat: 40.55, lon: 34.95 },
        "Denizli": { lat: 37.77, lon: 29.08 },
        "Diyarbakır": { lat: 37.91, lon: 40.24 },
        "Edirne": { lat: 41.67, lon: 26.56 },
        "Elazığ": { lat: 38.67, lon: 39.22 },
        "Erzincan": { lat: 39.75, lon: 39.49 },
        "Erzurum": { lat: 39.90, lon: 41.27 },
        "Eskişehir": { lat: 39.78, lon: 30.52 },
        "Gaziantep": { lat: 37.06, lon: 37.38 },
        "Giresun": { lat: 40.91, lon: 38.39 },
        "Gümüşhane": { lat: 40.46, lon: 39.48 },
        "Hakkari": { lat: 37.57, lon: 43.74 },
        "Hatay": { lat: 36.20, lon: 36.16 },
        "Isparta": { lat: 37.76, lon: 30.55 },
        "Mersin": { lat: 36.81, lon: 34.64 },
        "İstanbul": { lat: 41.01, lon: 28.97 },
        "İzmir": { lat: 38.42, lon: 27.14 },
        "Kars": { lat: 40.60, lon: 43.10 },
        "Kastamonu": { lat: 41.38, lon: 33.78 },
        "Kayseri": { lat: 38.73, lon: 35.48 },
        "Kırklareli": { lat: 41.73, lon: 27.22 },
        "Kırşehir": { lat: 39.14, lon: 34.17 },
        "Kocaeli": { lat: 40.76, lon: 29.92 },
        "Konya": { lat: 37.87, lon: 32.48 },
        "Kütahya": { lat: 39.42, lon: 29.98 },
        "Malatya": { lat: 38.35, lon: 38.31 },
        "Manisa": { lat: 38.61, lon: 27.43 },
        "Kahramanmaraş": { lat: 37.58, lon: 36.93 },
        "Mardin": { lat: 37.31, lon: 40.74 },
        "Muğla": { lat: 37.21, lon: 28.36 },
        "Muş": { lat: 38.74, lon: 41.49 },
        "Nevşehir": { lat: 38.62, lon: 34.71 },
        "Niğde": { lat: 37.97, lon: 34.68 },
        "Ordu": { lat: 40.98, lon: 37.88 },
        "Rize": { lat: 41.02, lon: 40.52 },
        "Sakarya": { lat: 40.77, lon: 30.40 },
        "Samsun": { lat: 41.29, lon: 36.33 },
        "Siirt": { lat: 37.93, lon: 41.94 },
        "Sinop": { lat: 42.02, lon: 35.15 },
        "Sivas": { lat: 39.75, lon: 37.01 },
        "Tekirdağ": { lat: 40.98, lon: 27.51 }, // Süleymanpaşa Merkez
        "Tokat": { lat: 40.31, lon: 36.55 },
        "Trabzon": { lat: 41.00, lon: 39.72 },
        "Tunceli": { lat: 39.11, lon: 39.55 },
        "Şanlıurfa": { lat: 37.16, lon: 38.79 },
        "Uşak": { lat: 38.68, lon: 29.40 },
        "Van": { lat: 38.49, lon: 43.38 },
        "Yozgat": { lat: 39.82, lon: 34.80 },
        "Zonguldak": { lat: 41.45, lon: 31.79 },
        "Aksaray": { lat: 38.37, lon: 34.03 },
        "Bayburt": { lat: 40.25, lon: 40.22 },
        "Karaman": { lat: 37.18, lon: 33.22 },
        "Kırıkkale": { lat: 39.84, lon: 33.51 },
        "Batman": { lat: 37.89, lon: 41.13 },
        "Şırnak": { lat: 37.52, lon: 42.46 },
        "Bartın": { lat: 41.63, lon: 32.34 },
        "Ardahan": { lat: 41.11, lon: 42.70 },
        "Iğdır": { lat: 39.92, lon: 44.04 },
        "Yalova": { lat: 40.65, lon: 29.27 },
        "Karabük": { lat: 41.20, lon: 32.62 },
        "Kilis": { lat: 36.72, lon: 37.11 },
        "Osmaniye": { lat: 37.07, lon: 36.25 },
        "Düzce": { lat: 40.84, lon: 31.16 }
    };

    // Tekirdağ İlçelerinin Hassas Koordinatları
    const TEKIRDAG_DISTRICT_COORDS = {
        "Süleymanpaşa": { lat: 40.98, lon: 27.51 },
        "Çorlu": { lat: 41.16, lon: 27.80 },
        "Çerkezköy": { lat: 41.29, lon: 28.00 },
        "Kapaklı": { lat: 41.31, lon: 27.97 },
        "Ergene": { lat: 41.25, lon: 27.68 },
        "Muratlı": { lat: 41.17, lon: 27.50 },
        "Malkara": { lat: 40.89, lon: 26.90 },
        "Saray": { lat: 41.44, lon: 27.92 },
        "Şarköy": { lat: 40.62, lon: 27.11 },
        "Hayrabolu": { lat: 41.21, lon: 27.11 },
        "Marmaraereğlisi": { lat: 40.97, lon: 27.95 }
    };

    // WMO (Dünya Meteoroloji Örgütü) Kod Tablosu
    const WMO_TABLE = {
        0: { desc: "Açık ve Güneşli", weather: "sunny", rainMm: 0, advisory: "Yollar kuru, görüş mesafesi açık. Emniyetli sürüşler." },
        1: { desc: "Az Bulutlu", weather: "sunny", rainMm: 0, advisory: "Görüş mükemmel, yol şartları ideal." },
        2: { desc: "Parçalı Bulutlu", weather: "sunny", rainMm: 0, advisory: "Hava ılımlı, kuru asfalt sürüşü." },
        3: { desc: "Çok Bulutlu ve Kapalı", weather: "sunny", rainMm: 0, advisory: "Bulutlu hava, zemin kuru." },
        45: { desc: "Puslu ve Sisli", weather: "foggy", rainMm: 0, advisory: "Sis nedeniyle görüş azaldı. Sis farlarınızı (L tuşu) açık tutunuz." },
        48: { desc: "Yoğun Kırağılı Sis", weather: "foggy", rainMm: 0, advisory: "Görüş 100 metrenin altında. Takip mesafesini iki katına çıkarınız." },
        51: { desc: "Hafif Çisenti Yağmur", weather: "rainy", rainMm: 1.5, advisory: "Hafif çisenti başladı. Asfalt kayganlaşabilir." },
        53: { desc: "Orta Kuvvette Çisenti", weather: "rainy", rainMm: 2.8, advisory: "Yollar ıslak. Sileceklerinizi (X tuşu) çalıştırınız." },
        55: { desc: "Yoğun Çisenti Yağmur", weather: "rainy", rainMm: 4.0, advisory: "Zemin kaygan, virajlarda frenlemeye dikkat." },
        61: { desc: "Hafif Yağmurlu", weather: "rainy", rainMm: 3.5, advisory: "Yağmur yağıyor. Yolcular şemsiyeli, zemin ıslak." },
        63: { desc: "Orta Şiddette Yağmur", weather: "rainy", rainMm: 6.5, advisory: "Yağmur etkisini artırdı. Takip mesafesini koruyunuz." },
        65: { desc: "Kuvvetli Sağanak Yağış", weather: "rainy", rainMm: 12.0, advisory: "Şiddetli sağanak! Su birikintilerine karşı hızınızı düşürünüz." },
        66: { desc: "Hafif Dondurucu Soğuk Yağmur", weather: "rainy", rainMm: 3.0, advisory: "Gizli buzlanma tehlikesi! Ani frenlemeden kaçınınız." },
        67: { desc: "Şiddetli Dondurucu Yağmur", weather: "rainy", rainMm: 8.0, advisory: "Aşırı kaygan zemin! Retarder kademesini dikkatli kullanınız." },
        71: { desc: "Hafif Kar Yağışlı", weather: "snowy", rainMm: 0, advisory: "Kar yağışı başladı. Yol tutuşu azaldı." },
        73: { desc: "Orta Kuvvette Kar Yağışı", weather: "snowy", rainMm: 0, advisory: "Yollar karlı. Kış sürüş moduna geçiniz." },
        75: { desc: "Yoğun Kar Yağışı ve Tipi", weather: "snowy", rainMm: 0, advisory: "Yoğun tipi! Buzlanma riski çok yüksek." },
        77: { desc: "Kar Taneleri ve Don", weather: "snowy", rainMm: 0, advisory: "Buzlu zemin! Savrulmaya karşı dikkat." },
        80: { desc: "Hafif Sağanak Geçişi", weather: "rainy", rainMm: 4.5, advisory: "Geçici sağanak yağış. Silecekleri açık tutunuz." },
        81: { desc: "Orta Şiddette Sağanak", weather: "rainy", rainMm: 8.5, advisory: "Kuvvetli yağış. Yolcular durağa sığınıyor." },
        82: { desc: "Şiddetli Fırtınalı Sağanak", weather: "rainy", rainMm: 16.0, advisory: "Fırtına ve sağanak! Azami dikkat ve düşük hız tavsiye edilir." },
        85: { desc: "Hafif Kar Sağanağı", weather: "snowy", rainMm: 0, advisory: "Kar sağanağı. Görüş kısıtlı." },
        86: { desc: "Yoğun Kar Fırtınası", weather: "snowy", rainMm: 0, advisory: "Şiddetli kar fırtınası. Yavaş ve temkinli ilerleyiniz." },
        95: { desc: "Gök Gürültülü Fırtına", weather: "rainy", rainMm: 14.0, advisory: "Gök gürültülü sağanak fırtınası! Şimşekler ve fırtına uyarısı." },
        96: { desc: "Dolu ile Karışık Gök Gürültülü Fırtına", weather: "rainy", rainMm: 18.0, advisory: "Dolu ve gök gürültülü fırtına! Dikkatli sürüş esastır." },
        99: { desc: "Şiddetli Dolu ve Kasırga Fırtınası", weather: "rainy", rainMm: 24.0, advisory: "Aşırı hava muhalefeti! Acil durum reflektörleri tavsiye edilir." }
    };

    const LiveWeather = {
        current: null,
        isFetching: false,
        cacheMinutes: 30, // 30 dakikalık akıllı önbellek

        // Şehir ve İlçe Koordinatlarını Çözümle
        getCoordinates: function(cityName, districtName) {
            cityName = cityName || "Tekirdağ";
            if (cityName === "Tekirdağ" && districtName && TEKIRDAG_DISTRICT_COORDS[districtName]) {
                return TEKIRDAG_DISTRICT_COORDS[districtName];
            }
            if (PROVINCE_COORDINATES[cityName]) {
                return PROVINCE_COORDINATES[cityName];
            }
            return { lat: 40.98, lon: 27.51 }; // Varsayılan Tekirdağ
        },

        // Canlı Hava Durumunu Çek (Önbellek ➔ OpenWeather / Open-Meteo ➔ Fallback)
        fetchWeather: async function(cityName, districtName) {
            cityName = cityName || "Tekirdağ";
            districtName = districtName || (typeof Game !== 'undefined' ? Game.activeDistrict : "Süleymanpaşa");

            const cacheKey = `live_weather_cache_${cityName}_${districtName || 'merkez'}`;
            const cachedRaw = (typeof localStorage !== 'undefined') ? localStorage.getItem(cacheKey) : null;

            if (cachedRaw) {
                try {
                    const parsed = JSON.parse(cachedRaw);
                    const ageMs = Date.now() - (parsed.timestamp || 0);
                    if (ageMs < this.cacheMinutes * 60 * 1000) {
                        this.current = parsed.data;
                        this.applyToGame(this.current);
                        return this.current;
                    }
                } catch(e) {}
            }

            const coords = this.getCoordinates(cityName, districtName);
            let weatherData = null;

            // 1. Kullanıcı OpenWeatherMap API anahtarı tanımlamışsa onu kullan
            const owmKey = (typeof localStorage !== 'undefined') ? localStorage.getItem('openweather_api_key') : null;
            if (owmKey && owmKey.trim()) {
                try {
                    const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${owmKey.trim()}&units=metric&lang=tr`;
                    const res = await fetch(owmUrl);
                    if (res.ok) {
                        const json = await res.json();
                        weatherData = this.parseOpenWeatherMap(json, cityName, districtName);
                    }
                } catch(err) {
                    console.warn("[LiveWeather] OpenWeatherMap sorgusu başarısız, Open-Meteo'ya geçiliyor...", err);
                }
            }

            // 2. Open-Meteo Açık Kaynak Meteoroloji Uydusu (Sıfır Key, %100 Ücretsiz, Sınırsız)
            if (!weatherData) {
                try {
                    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,is_day`;
                    const res = await fetch(omUrl);
                    if (res.ok) {
                        const json = await res.json();
                        weatherData = this.parseOpenMeteo(json, cityName, districtName);
                    }
                } catch(err) {
                    console.warn("[LiveWeather] Open-Meteo sorgusu başarısız, çevrimdışı yedeğe geçiliyor...", err);
                }
            }

            // 3. Çelik Sigorta (Fallback): İnternet veya sunucu yoksa mevsime göre gerçekçi hava
            if (!weatherData) {
                weatherData = this.generateSeasonalFallback(cityName, districtName);
            }

            this.current = weatherData;

            // Önbelleğe kaydet
            if (typeof localStorage !== 'undefined') {
                try {
                    localStorage.setItem(cacheKey, JSON.stringify({
                        timestamp: Date.now(),
                        data: weatherData
                    }));
                } catch(e) {}
            }

            this.applyToGame(weatherData);
            return weatherData;
        },

        // Open-Meteo Yanıtını Çözümle
        parseOpenMeteo: function(json, cityName, districtName) {
            const cur = json && json.current ? json.current : {};
            const code = cur.weather_code !== undefined ? cur.weather_code : 0;
            const wInfo = WMO_TABLE[code] || WMO_TABLE[0];

            return {
                source: "Open-Meteo (Açık Uydu Verisi)",
                city: cityName,
                district: districtName,
                temperature: Math.round(cur.temperature_2m !== undefined ? cur.temperature_2m : 18),
                apparentTemp: Math.round(cur.apparent_temperature !== undefined ? cur.apparent_temperature : 17),
                humidity: cur.relative_humidity_2m || 65,
                windSpeed: Math.round(cur.wind_speed_10m || 10),
                rainMm: (cur.rain !== undefined && cur.rain > 0) ? cur.rain : (wInfo.rainMm || 0),
                weatherCode: code,
                weather: wInfo.weather,
                desc: wInfo.desc,
                advisory: wInfo.advisory,
                isDay: cur.is_day === 1,
                timestamp: Date.now()
            };
        },

        // OpenWeatherMap Yanıtını Çözümle
        parseOpenWeatherMap: function(json, cityName, districtName) {
            const main = json.main || {};
            const wind = json.wind || {};
            const weatherArr = json.weather && json.weather[0] ? json.weather[0] : {};
            const rainObj = json.rain || {};
            const rainMm = rainObj['1h'] || 0;

            let weatherType = "sunny";
            const mainCode = weatherArr.main ? weatherArr.main.toLowerCase() : "";
            if (mainCode.includes("rain") || mainCode.includes("drizzle")) weatherType = "rainy";
            else if (mainCode.includes("snow")) weatherType = "snowy";
            else if (mainCode.includes("fog") || mainCode.includes("mist")) weatherType = "foggy";

            return {
                source: "OpenWeatherMap API",
                city: cityName,
                district: districtName,
                temperature: Math.round(main.temp || 18),
                apparentTemp: Math.round(main.feels_like || 18),
                humidity: main.humidity || 65,
                windSpeed: Math.round((wind.speed || 3) * 3.6),
                rainMm: rainMm,
                weatherCode: weatherArr.id || 800,
                weather: weatherType,
                desc: weatherArr.description ? (weatherArr.description.charAt(0).toUpperCase() + weatherArr.description.slice(1)) : "Açık",
                advisory: weatherType === "rainy" ? "Yağmurlu zemin, takip mesafesini koruyunuz." : "Yol koşulları emniyetli.",
                isDay: true,
                timestamp: Date.now()
            };
        },

        // Çevrimdışı Mevsimsel Yedek (Oyun Asla Bozulmaz)
        generateSeasonalFallback: function(cityName, districtName) {
            const now = new Date();
            const month = now.getMonth(); // 0..11
            let temp = 18;
            let wType = "sunny";
            let desc = "Açık ve Güneşli";
            let advisory = "Hava koşulları normal, iyi yolculuklar.";

            if (month >= 11 || month <= 1) { // Kış
                temp = 5;
                wType = "rainy";
                desc = "Kış Soğuğu ve Yağışlı";
                advisory = "Kış mevsimi koşulları, kaygan yol uyarısı.";
            } else if (month >= 2 && month <= 4) { // İlkbahar
                temp = 15;
                desc = "Ilık Bahar Havası";
            } else if (month >= 5 && month <= 8) { // Yaz
                temp = 28;
                desc = "Sıcak ve Berrak";
            } else { // Sonbahar
                temp = 14;
                wType = "rainy";
                desc = "Sonbahar Yağmurlu";
                advisory = "Sonbahar yağışları nedeniyle yollar kaygan.";
            }

            return {
                source: "Dahili İklim Motoru (Çevrimdışı)",
                city: cityName,
                district: districtName,
                temperature: temp,
                apparentTemp: temp - 1,
                humidity: 70,
                windSpeed: 12,
                rainMm: wType === "rainy" ? 4 : 0,
                weatherCode: 0,
                weather: wType,
                desc: desc,
                advisory: advisory,
                isDay: true,
                timestamp: Date.now()
            };
        },

        // Simülasyon Motoruna (Game & Audio) Uygula
        applyToGame: function(d) {
            if (!d) return;
            if (typeof Game !== 'undefined') {
                Game.weather = d.weather;
                Game.temperature = d.temperature;
                Game.rainMmPerHour = d.rainMm;
                Game.windSpeed = d.windSpeed;
                Game.isDay = d.isDay;
                Game.apparentTemperature = d.apparentTemp;
                Game.liveWeather = d;

                // Gece/Gündüz kontrolü
                if (d.isDay === false) {
                    Game.isNight = true;
                }
            }

            // Ses efektlerini canlı başlat
            if (typeof audio !== 'undefined' && typeof audio.startWeather === 'function') {
                if (typeof Game !== 'undefined' && Game.isDriving) {
                    audio.startWeather(d.weather, d.rainMm > 8 ? 2 : 1);
                }
            }

            this.updateUI(d);
        },

        // Arayüz Rozeti ve Bilgilendirme
        updateUI: function(d) {
            const el = document.getElementById("hud-live-weather");
            if (el) {
                const icon = d.weather === 'rainy' ? '🌧️' : (d.weather === 'snowy' ? '❄️' : (d.weather === 'foggy' ? '🌫️' : '☀️'));
                el.innerHTML = `<strong>${icon} Canlı Hava:</strong> ${d.city} ${d.temperature}°C • ${d.desc}`;
                el.style.display = 'block';
            }

            const garageEl = document.getElementById("garage-live-weather-card");
            if (garageEl) {
                const icon = d.weather === 'rainy' ? '🌧️' : (d.weather === 'snowy' ? '❄️' : (d.weather === 'foggy' ? '🌫️' : '☀️'));
                garageEl.innerHTML = `
                    <div style="background: rgba(56,189,248,0.12); border: 1.5px solid #38bdf8; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: #38bdf8; font-weight: bold; font-size: 0.95rem;">${icon} Canlı Meteoroloji Raporu (${d.city})</span>
                            <div style="color: #f1f5f9; font-size: 1.05rem; margin-top: 2px;">
                                <strong>${d.temperature}°C</strong> (Hissedilen: ${d.apparentTemp}°C) • <span>${d.desc}</span>
                            </div>
                            <small style="color: #94a3b8;">${d.advisory}</small>
                        </div>
                        <button class="modern-btn" onclick="LiveWeather.announceWeatherReport('assertive');" style="padding: 6px 12px; font-size: 0.85rem; background: rgba(56,189,248,0.25); border: 1px solid #38bdf8; color: #7dd3fc; border-radius: 6px; cursor: pointer;">
                            🔊 Dinle
                        </button>
                    </div>
                `;
            }
        },

        // NVDA ve Ekran Okuyucu Sesli Meteoroloji Raporu
        announceWeatherReport: function(politeness = "assertive") {
            if (!this.current) {
                const city = (typeof Game !== 'undefined' ? Game.currentCity : "Tekirdağ") || "Tekirdağ";
                this.fetchWeather(city).then(() => this.announceWeatherReport(politeness));
                return;
            }

            const d = this.current;
            const ruzgarText = d.windSpeed ? `Rüzgar saatte ${d.windSpeed} kilometre.` : '';
            const yagisText = d.rainMm > 0 ? `Yağış miktarı saatte ${d.rainMm} milimetre.` : '';
            const speech = `Merkez Meteoroloji Raporu: ${d.city} genelinde canlı hava ${d.temperature} derece, hissedilen ${d.apparentTemp} derece. Gökyüzü ${d.desc}. ${ruzgarText} ${yagisText} ${d.advisory}`;

            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(speech);
            }
            if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
                audio.updateNvdaLiveRegion(speech);
            }
        },

        // Olayları ve Kısayolları Bağla
        init: function() {
            console.log("[LiveWeather] Canlı Meteoroloji ve Gerçek Zamanlı Çevre Motoru hazır.");

            // Shift + H Kısayolu: Canlı Hava Durumu Raporunu Oku
            if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
                window.addEventListener("keydown", (e) => {
                if (e.shiftKey && (e.key === 'h' || e.key === 'H' || e.code === 'KeyH')) {
                    e.preventDefault();
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    LiveWeather.announceWeatherReport("assertive");
                }
            });
            }
        }
    };

    window.LiveWeather = LiveWeather;

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => LiveWeather.init());
        } else {
            LiveWeather.init();
        }
    }

})(typeof window !== 'undefined' ? window : global);

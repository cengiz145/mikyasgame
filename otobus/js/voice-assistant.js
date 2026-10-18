class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        
        // Tarayıcı desteği kontrolü
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'tr-TR';
            this.recognition.continuous = false; // Konuşma bitince otomatik dursun
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.select) {
                    audio.sounds.select.play(); // Dinlemeye başlama sesi
                }
                console.log("Sesli Asistan: Dinliyor...");
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log("Sesli Asistan Anladı: ", transcript);
                this.processCommand(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error("Sesli Asistan Hatası:", event.error);
                this.isListening = false;
                if (event.error === 'not-allowed') {
                    if (typeof UI !== 'undefined') UI.showToast("Mikrofon izni reddedildi.", "error");
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                console.log("Sesli Asistan: Dinleme bitti.");
            };
        } else {
            console.error("Web Speech API bu tarayıcıda desteklenmiyor.");
        }

        // V tuşu dinleyicisi
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'v' && !e.repeat && !e.altKey && !e.ctrlKey) {
                // Sadece sürüş ekranında çalışsın (isteğe bağlı ama mantıklı)
                if (typeof Game !== 'undefined' && Game.isDriving) {
                    this.toggleListening();
                }
            }
        });
    }

    toggleListening() {
        if (!this.recognition) {
            if (typeof UI !== 'undefined') UI.showToast("Tarayıcınız sesli asistanı desteklemiyor.", "error");
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {
                console.error("Asistan başlatılamadı:", e);
            }
        }
    }

    processCommand(command) {
        if (typeof Game === 'undefined' || typeof audio === 'undefined') return;

        // --- PUSULA VE YÖN SORGUSU ---
        if (command.includes("pusula") || command.includes("istikamet") || command.includes("hangi yön") || command.includes("yönüm")) {
            const currentDir = (typeof CompassNav !== 'undefined') ? CompassNav.currentDirection : "Kuzey";
            audio.speak("Mevcut istikametiniz " + currentDir + ". Yön kontrolü ve değişimi için Shift tuşuyla birlikte Yukarı Kuzey, Aşağı Güney, Sağ Doğu, Sol Batı oklarına basabilirsiniz.");
            return;
        }

        // --- SEFER MODLARI (ŞEHİR İÇİ / ŞEHİRLER ARASI) ---
        if (command.includes("şehir içi") || command.includes("belediye") || command.includes("tekulaş")) {
            audio.speak("Şehir içi ve ilçe belediye seferleri modu açılıyor.");
            if (document.getElementById('btn-start-city')) {
                document.getElementById('btn-start-city').click();
            }
            return;
        }

        if (command.includes("şehirlerarası") || command.includes("şehirler arası") || command.includes("uzun yol") || command.includes("turne")) {
            audio.speak("Şehirlerarası seyahat modu açılıyor.");
            if (document.getElementById('btn-start-intercity')) {
                document.getElementById('btn-start-intercity').click();
            }
            return;
        }

        // 10 Seviye Kuralı Kontrolü
        if ((command.includes("ilçe") || command.includes("48") || command.includes("26") || command.includes("velimeşe") || command.includes("saray") || command.includes("şehirlerarası") || command.includes("turne")) && !Game.hasPassedLevel10()) {
            audio.speak("İlçeler ve şehirlerarası seyahat için önce şehir içi 10 seviyeyi geçmelisiniz. Mevcut seviyeniz: " + Game.licenseLevel + ".");
            if (typeof UI !== 'undefined') UI.showToast("10 Seviyeyi Geçmeden İlçe & Şehirlerarası Açılamaz", "warning");
            return;
        }

        // --- AKILLI ROTA SİSTEMİ (NEREDEN ➔ NEREYE) ---
        if (command.includes("akıllı rota") || command.includes("nereden nereye") || command.includes("rota hesapla") || command.includes("hedef seç")) {
            if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.openModal) {
                AkilliRotaSistemi.openModal();
                return;
            }
        }

        // Doğrudan sesle kalkış ve varış söyleme: "spor salonundan tepekente git", "valilikten yüzüncü yıla" vb.
        const smartMatch = command.match(/(?:nereden\s+)?(.+?)(?:'dan|'den|'tan|'ten|dan|den|tan|ten)\s+(?:nereye\s+)?(.+?)(?:'ya|'ye|'a|'e|ya|ye|a|e)\s*(?:git|sefer|sur|sür)?$/i);
        if (smartMatch && smartMatch[1] && smartMatch[2] && !command.includes("seviye") && !command.includes("motor")) {
            const fromQuery = smartMatch[1].trim();
            const toQuery = smartMatch[2].trim();
            if (fromQuery.length > 2 && toQuery.length > 2) {
                if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.baslat) {
                    const started = AkilliRotaSistemi.baslat(fromQuery, toQuery);
                    if (started) return;
                }
            }
        }

        // --- ŞEHİR İÇİ ANA ARTER HATTI (HAT 2/7) ---
        if (command.includes("2/7") || command.includes("iki yedi") || command.includes("yüzüncü yıl") || command.includes("tepekent") || command.includes("araştırma hastane")) {
            const isDonus = command.includes("dönüş") || command.includes("geri");
            const targetId = isDonus ? "tekulas_152_2_7_donus" : "tekulas_152_2_7";
            const r2_7 = (typeof routesData !== 'undefined' && routesData[targetId]) || (typeof window !== 'undefined' && window.getTekulasLineById && window.getTekulasLineById(targetId));
            if (r2_7) {
                if (typeof routesData !== 'undefined') routesData[r2_7.id] = r2_7;
                audio.speak("TEKULAŞ Hat 2/7 " + (isDonus ? "Tepekent Yüzüncü Yıl dönüş" : "Yüzüncü Yıl Tepekent gidiş") + " ana arter hattı başlatılıyor. 43 duraklık güzergah devrede.");
                Game.startRoute(r2_7.id);
                return;
            }
        }

        // --- İLÇE HATLARI (48 VE 26 NUMARALI HATLARI) ---
        if (command.includes("velimeşe çorlu") || command.includes("48") || command.includes("kırk sekiz")) {
            audio.speak("TEKULAŞ 48 numaralı Velimeşe Çorlu hattı devreye alınıyor.");
            if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
                const r48 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "48");
                if (r48) {
                    routesData[r48.id] = r48;
                    Game.startRoute(r48.id);
                    return;
                }
            }
        }
        if (command.includes("saray") || command.includes("velimeşe") || command.includes("26") || command.includes("yirmi altı")) {
            audio.speak("TEKULAŞ 26 numaralı Süleymanpaşa Saray hattı devreye alınıyor.");
            if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
                const r26 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "26");
                if (r26) {
                    routesData[r26.id] = r26;
                    routesData["hat_26_suleymanpasa_velimese"] = r26;
                    Game.startRoute(r26.id);
                    return;
                }
            }
        }
        
        // --- ARAÇ KONTROLÜ ---
        if (command.includes("motor") || command.includes("çalıştır") || command.includes("kontak")) {
            if (!audio.isEngineRunning) {
                document.getElementById('start-engine-btn').click();
                // Buton zaten çalıştırıyor, kendi anonsu var.
            } else {
                audio.speak("Motor zaten çalışıyor.");
            }
            return;
        }

        if (command.includes("silecek") || command.includes("camı sil") || command.includes("camları sil")) {
            audio.toggleWipers();
            return;
        }

        if (command.includes("korna") || command.includes("düt")) {
            audio.playHorn();
            setTimeout(() => { if (audio.stopHorn) audio.stopHorn(); }, 1500);
            return;
        }

        if (command.includes("ön kapı") || command.includes("önü aç")) {
            Game.toggleFrontDoor();
            return;
        }

        if (command.includes("arka kapı") || command.includes("arkayı aç")) {
            Game.toggleRearDoor();
            return;
        }

        if (command.includes("kapı") && (command.includes("aç") || command.includes("kapat"))) {
            Game.toggleFrontDoor();
            setTimeout(() => Game.toggleRearDoor(), 500);
            return;
        }

        // --- NAVİGASYON BİLGİSİ ---
        if (command.includes("hız") || command.includes("kaçla") || command.includes("yavaş mı")) {
            audio.speak(`Åu anki hızımız saatte ${Math.floor(Game.speed)} kilometre.`);
            return;
        }

        if (command.includes("neredeyiz") || command.includes("mesafe") || command.includes("ne kadar kaldı")) {
            let distance = Math.floor(Game.currentDistanceToNext);
            let unit = "metre";
            if (distance > 1000) {
                distance = (distance / 1000).toFixed(1);
                unit = "kilometre";
            }
            audio.speak(`Hedefe ${distance} ${unit} kaldı.`);
            return;
        }

        if (command.includes("durak") || command.includes("nereye") || command.includes("hedef")) {
            if (Game.activeRouteData && Game.activeRouteData.stops && Game.activeRouteData.stops[Game.currentStopIndex]) {
                const stopName = Game.activeRouteData.stops[Game.currentStopIndex].name;
                audio.speak(`Sıradaki hedefimiz: ${stopName}.`);
            } else {
                audio.speak("Åu an aktif bir rotada değiliz.");
            }
            return;
        }
        
        if (command.includes("zaman") || command.includes("saat")) {
            const h = Math.floor(Game.clockMinutes / 60).toString().padStart(2, '0');
            const m = Math.floor(Game.clockMinutes % 60).toString().padStart(2, '0');
            audio.speak(`Oyun saati şu an ${h}:${m}.`);
            return;
        }

        // --- KLİMA KONTROLÜ ---
        if (command.includes("klima") || command.includes("sıcak") || command.includes("soğuk") || command.includes("üşü") || command.includes("yan")) {
            if (command.includes("kaç derece") || command.includes("sıcaklık ne") || command.includes("durumu")) {
                const msg = `Dış sıcaklık ${Game.temperature} derece, otobüs içi ${Math.floor(Game.busTemperature)} derece. ${Game.isACOn ? "Klima açık." : "Klima kapalı."}`;
                audio.speak(msg);
                return;
            }

            if (command.includes("aç") || command.includes("çalıştır") || command.includes("sıcak") || command.includes("soğuk") || command.includes("üşü") || command.includes("yan")) {
                if (!Game.isACOn) {
                    Game.isACOn = true;
                    audio.speak("Klima açıldı. Hedef sıcaklık 22 derece.");
                    if (typeof UI !== 'undefined') UI.showToast("Klima Açıldı", "info");
                } else {
                    audio.speak("Klima zaten açık.");
                }
                return;
            }

            if (command.includes("kapat") || command.includes("durdur")) {
                if (Game.isACOn) {
                    Game.isACOn = false;
                    audio.speak("Klima kapatıldı.");
                    if (typeof UI !== 'undefined') UI.showToast("Klima Kapatıldı", "info");
                } else {
                    audio.speak("Klima zaten kapalı.");
                }
                return;
            }
        }

        // Anlaşılamadı
        audio.speak("Anlayamadım, lütfen tekrar et.");
    }
}

// Global olarak başlat
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant = new VoiceAssistant();
});


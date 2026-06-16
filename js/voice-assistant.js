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
            audio.speak(`Şu anki hızımız saatte ${Math.floor(Game.speed)} kilometre.`);
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
                audio.speak("Şu an aktif bir rotada değiliz.");
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

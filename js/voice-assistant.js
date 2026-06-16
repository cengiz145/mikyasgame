class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        
        // TarayÄ±cÄ± desteÄŸi kontrolÃ¼
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'tr-TR';
            this.recognition.continuous = false; // KonuÅŸma bitince otomatik dursun
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.select) {
                    audio.sounds.select.play(); // Dinlemeye baÅŸlama sesi
                }
                console.log("Sesli Asistan: Dinliyor...");
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log("Sesli Asistan AnladÄ±: ", transcript);
                this.processCommand(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error("Sesli Asistan HatasÄ±:", event.error);
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
            console.error("Web Speech API bu tarayÄ±cÄ±da desteklenmiyor.");
        }

        // V tuÅŸu dinleyicisi
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'v' && !e.repeat && !e.altKey && !e.ctrlKey) {
                // Sadece sÃ¼rÃ¼ÅŸ ekranÄ±nda Ã§alÄ±ÅŸsÄ±n (isteÄŸe baÄŸlÄ± ama mantÄ±klÄ±)
                if (typeof Game !== 'undefined' && Game.isDriving) {
                    this.toggleListening();
                }
            }
        });
    }

    toggleListening() {
        if (!this.recognition) {
            if (typeof UI !== 'undefined') UI.showToast("TarayÄ±cÄ±nÄ±z sesli asistanÄ± desteklemiyor.", "error");
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {
                console.error("Asistan baÅŸlatÄ±lamadÄ±:", e);
            }
        }
    }

    processCommand(command) {
        if (typeof Game === 'undefined' || typeof audio === 'undefined') return;

        // --- ARAÃ‡ KONTROLÃœ ---
        if (command.includes("motor") || command.includes("Ã§alÄ±ÅŸtÄ±r") || command.includes("kontak")) {
            if (!audio.isEngineRunning) {
                document.getElementById('start-engine-btn').click();
                // Buton zaten Ã§alÄ±ÅŸtÄ±rÄ±yor, kendi anonsu var.
            } else {
                audio.speak("Motor zaten Ã§alÄ±ÅŸÄ±yor.");
            }
            return;
        }

        if (command.includes("silecek") || command.includes("camÄ± sil") || command.includes("camlarÄ± sil")) {
            audio.toggleWipers();
            return;
        }

        if (command.includes("korna") || command.includes("dÃ¼t")) {
            audio.playHorn();
            setTimeout(() => { if (audio.stopHorn) audio.stopHorn(); }, 1500);
            return;
        }

        if (command.includes("Ã¶n kapÄ±") || command.includes("Ã¶nÃ¼ aÃ§")) {
            Game.toggleFrontDoor();
            return;
        }

        if (command.includes("arka kapÄ±") || command.includes("arkayÄ± aÃ§")) {
            Game.toggleRearDoor();
            return;
        }

        if (command.includes("kapÄ±") && (command.includes("aÃ§") || command.includes("kapat"))) {
            Game.toggleFrontDoor();
            setTimeout(() => Game.toggleRearDoor(), 500);
            return;
        }

        // --- NAVÄ°GASYON BÄ°LGÄ°SÄ° ---
        if (command.includes("hÄ±z") || command.includes("kaÃ§la") || command.includes("yavaÅŸ mÄ±")) {
            audio.speak(`Åu anki hÄ±zÄ±mÄ±z saatte ${Math.floor(Game.speed)} kilometre.`);
            return;
        }

        if (command.includes("neredeyiz") || command.includes("mesafe") || command.includes("ne kadar kaldÄ±")) {
            let distance = Math.floor(Game.currentDistanceToNext);
            let unit = "metre";
            if (distance > 1000) {
                distance = (distance / 1000).toFixed(1);
                unit = "kilometre";
            }
            audio.speak(`Hedefe ${distance} ${unit} kaldÄ±.`);
            return;
        }

        if (command.includes("durak") || command.includes("nereye") || command.includes("hedef")) {
            if (Game.activeRouteData && Game.activeRouteData.stops && Game.activeRouteData.stops[Game.currentStopIndex]) {
                const stopName = Game.activeRouteData.stops[Game.currentStopIndex].name;
                audio.speak(`SÄ±radaki hedefimiz: ${stopName}.`);
            } else {
                audio.speak("Åu an aktif bir rotada deÄŸiliz.");
            }
            return;
        }
        
        if (command.includes("zaman") || command.includes("saat")) {
            const h = Math.floor(Game.clockMinutes / 60).toString().padStart(2, '0');
            const m = Math.floor(Game.clockMinutes % 60).toString().padStart(2, '0');
            audio.speak(`Oyun saati ÅŸu an ${h}:${m}.`);
            return;
        }

        // --- KLÄ°MA KONTROLÃœ ---
        if (command.includes("klima") || command.includes("sÄ±cak") || command.includes("soÄŸuk") || command.includes("Ã¼ÅŸÃ¼") || command.includes("yan")) {
            if (command.includes("kaÃ§ derece") || command.includes("sÄ±caklÄ±k ne") || command.includes("durumu")) {
                const msg = `DÄ±ÅŸ sÄ±caklÄ±k ${Game.temperature} derece, otobÃ¼s iÃ§i ${Math.floor(Game.busTemperature)} derece. ${Game.isACOn ? "Klima aÃ§Ä±k." : "Klima kapalÄ±."}`;
                audio.speak(msg);
                return;
            }

            if (command.includes("aÃ§") || command.includes("Ã§alÄ±ÅŸtÄ±r") || command.includes("sÄ±cak") || command.includes("soÄŸuk") || command.includes("Ã¼ÅŸÃ¼") || command.includes("yan")) {
                if (!Game.isACOn) {
                    Game.isACOn = true;
                    audio.speak("Klima aÃ§Ä±ldÄ±. Hedef sÄ±caklÄ±k 22 derece.");
                    if (typeof UI !== 'undefined') UI.showToast("Klima AÃ§Ä±ldÄ±", "info");
                } else {
                    audio.speak("Klima zaten aÃ§Ä±k.");
                }
                return;
            }

            if (command.includes("kapat") || command.includes("durdur")) {
                if (Game.isACOn) {
                    Game.isACOn = false;
                    audio.speak("Klima kapatÄ±ldÄ±.");
                    if (typeof UI !== 'undefined') UI.showToast("Klima KapatÄ±ldÄ±", "info");
                } else {
                    audio.speak("Klima zaten kapalÄ±.");
                }
                return;
            }
        }

        // AnlaÅŸÄ±lamadÄ±
        audio.speak("AnlayamadÄ±m, lÃ¼tfen tekrar et.");
    }
}

// Global olarak baÅŸlat
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant = new VoiceAssistant();
});

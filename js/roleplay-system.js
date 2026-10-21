/**
 * roleplay-system.js - Gerçekçi Şehirlerarası Otobüs Rol Yapma (Roleplay) & Freesound Ses Sistemi
 * Freesound API ile indirilmiş polis düdüğü, takograf yazıcısı, bagaj zımbası, kolonya fısfısı, otogar anonsu ve yolcu mırıltıları.
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const RoleplaySystem = {
        isMurmurPlaying: false,
        murmurAudio: null,
        soundBuffers: {},
        audioCtx: null,

        sounds: {
            whistle: 'sounds/freesound_police_whistle.mp3',
            tachograph: 'sounds/freesound_tachograph_print.mp3',
            stapler: 'sounds/freesound_ticket_stapler.mp3',
            spray: 'sounds/freesound_cologne_spray.mp3',
            terminalChime: 'sounds/freesound_terminal_chime.mp3',
            terminalGong: 'sounds/anons_tekli_gong.mp3',
            tripleChime: 'sounds/anons_3lu_zil.mp3',
            passengerMurmur: 'sounds/freesound_passenger_murmur.mp3',
            radioStart: 'sounds/freesound_radio_start.mp3',
            radioEnd: 'sounds/freesound_radio_end.mp3',
            radioRoger: 'sounds/freesound_radio_roger_beep.mp3',
            radioSquelch: 'sounds/freesound_radio_squelch_burst.mp3'
        },

        init: function () {
            this.injectHudButton();
            this.setupKeyBindings();
            console.log("[RoleplaySystem] Rol Yapma & Freesound Ses Motoru hazır.");
        },

        getAudioContext: function () {
            if (typeof audio !== 'undefined' && audio.ctx) return audio.ctx;
            if (typeof Howler !== 'undefined' && Howler.ctx) return Howler.ctx;
            if (!this.audioCtx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.audioCtx = new AudioCtx();
            }
            return this.audioCtx;
        },

        // Ses Çalma Fonksiyonu (HTML5 Audio veya Web Audio fallback)
        playSound: function (soundKey, volume = 0.8) {
            const url = this.sounds[soundKey];
            if (!url) return;

            try {
                const a = new Audio(url);
                a.volume = volume;
                a.play().catch(e => {
                    console.log("[RoleplaySystem] Ses çalma uyarısı:", e.message);
                });
                return a;
            } catch (err) {
                console.warn("[RoleplaySystem] Ses hatası:", err);
            }
        },

        // Rol 1: 🧴 Kolonya & Yolcu İkram Servisi
        triggerCologneService: function () {
            this.playSound('spray', 0.85);

            // 0.4 sn sonra ikinci bir fıs fıs
            setTimeout(() => this.playSound('spray', 0.7), 400);

            if (typeof Game !== 'undefined') {
                Game.passengerComfort = Math.min(100, (Game.passengerComfort || 90) + 12);
            }

            const passengerReplies = [
                "Teşekkürler muavin oğlum, limon kolonyası çok ferahlattı.",
                "Elinize sağlık kaptanım, Tekirdağ Seyahat kalitesi bir başka.",
                "Sağ olasın evladım, ferahladık valla.",
                "İkram için teşekkür ederiz, hayırlı yolculuklar."
            ];
            const reply = passengerReplies[Math.floor(Math.random() * passengerReplies.length)];

            setTimeout(() => {
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast(`🧴 [İkram Servisi] Kolonya ikram edildi. Yolcu: "${reply}" (+12 Konfor)`, "success");
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(`Limon kolonyası ve serinletici ikram servisi yapıldı. Yolcu: ${reply}. Yolcu konforu arttı.`);
                }
            }, 600);
        },

        // Rol 2: 🎟️ Otogar Peron Anonsu & Bagaj Fişi Zımbalama (3'lü Zil veya Tekli Gong)
        triggerLuggageAndTerminal: function (chimeType = '3tone') {
            if (chimeType === 'gong') {
                if (typeof audio !== 'undefined' && audio.playDeepGongChime) {
                    audio.playDeepGongChime();
                } else {
                    this.playSound('terminalGong', 0.85);
                }
            } else {
                if (typeof audio !== 'undefined' && audio.playIBISChime) {
                    audio.playIBISChime();
                } else {
                    this.playSound('terminalChime', 0.85);
                }
            }

            // Anons zilinden (Dı-dı-dııın / Dıııın) hemen sonra bagaj zımbalama sesi (çat-çat!)
            setTimeout(() => {
                this.playSound('stapler', 0.9);
                setTimeout(() => this.playSound('stapler', 0.85), 320);

                if (typeof Game !== 'undefined') {
                    Game.addMoney(45);
                }

                const msg = "🎟️ [Otogar Anonsu] 3'lü zil çaldı (Dı-dı-dııın), bagaj kuponları zımbalandı (+45 ₺ Bagaj Geliri).";
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "success");
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Otogar anonsu yapıldı. Bagaj kuponları zımbalanarak yolculara teslim edildi. Kasanıza kırk beş lira eklendi.");
                }
            }, 1100);
        },

        // Doğrudan Anons Zili Çalma (3'lü Zil veya Tekli Gong)
        playAnnouncementChime: function (type = '3tone') {
            if (type === 'gong') {
                if (typeof audio !== 'undefined' && audio.playDeepGongChime) {
                    audio.playDeepGongChime();
                } else {
                    this.playSound('terminalGong', 0.85);
                }
                const msg = "Tekli derin otogar gongu çaldı (Dıııın).";
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🔕 ${msg}`, "info");
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            } else {
                if (typeof audio !== 'undefined' && audio.playIBISChime) {
                    audio.playIBISChime();
                } else {
                    this.playSound('terminalChime', 0.85);
                }
                const msg = "3'lü anons zili çaldı (Dı - Dı - Dııın).";
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🔔 ${msg}`, "info");
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            }
        },

        // Rol 3: 👮 Bölge Trafik Polisi & Takograf Denetimi
        triggerPoliceInspection: function () {
            this.playSound('whistle', 0.9);

            setTimeout(() => {
                this.playSound('tachograph', 0.85);

                const currentSpeed = (typeof Game !== 'undefined' && Game.speed) ? Math.floor(Game.speed) : 80;
                const isOverSpeed = currentSpeed > 100;

                setTimeout(() => {
                    if (!isOverSpeed) {
                        if (typeof Game !== 'undefined') Game.addXP(30);
                        const msg = `👮 [Bölge Trafik Polisi] "Düdük çaldı, sağa yanaştınız. Takograf incelendi: Hızınız saatte ${currentSpeed} km, kurallara uygun. Takograf tertemiz kaptan, hayırlı yolculuklar!" (+30 XP)`;
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "success");
                        if (typeof audio !== 'undefined' && audio.speak) {
                            audio.speak(`Trafik polisi takograf fişini inceledi. Hızınız saatte ${currentSpeed} kilometre, limitlere uygun. Takograf temiz kaptan, iyi yolculuklar!`);
                        }
                    } else {
                        if (typeof Game !== 'undefined') {
                            Game.playerBudget = Math.max(0, (Game.playerBudget || 0) - 350);
                            Game.saveData();
                        }
                        const warnMsg = `⚠️ [Trafik Cezası] "Polis takograf fişini inceledi: Hızınız ${currentSpeed} km/s! 100 km/s otoyol hız sınırı aşıldığı için 350 ₺ ceza kesildi. Lütfen hız limitlerine uyalım kaptan!"`;
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(warnMsg, "warning");
                        if (typeof audio !== 'undefined' && audio.speak) {
                            audio.speak(`Dikkat! Polis takograf fişinde ${currentSpeed} kilometre aşırı hız tespit etti. Üç yüz elli lira trafik cezası kesildi.`);
                        }
                    }
                }, 2200);
            }, 1200);
        },

        // Rol 4: 👥 Kabin İçi Yolcu Mırıltısı Aç / Kapat
        togglePassengerMurmur: function () {
            if (this.isMurmurPlaying && this.murmurAudio) {
                this.murmurAudio.pause();
                this.isMurmurPlaying = false;
                const msg = "Kabin içi yolcu mırıltısı durduruldu (Sessiz mod).";
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`👥 ${msg}`, "info");
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            } else {
                try {
                    this.murmurAudio = new Audio(this.sounds.passengerMurmur);
                    this.murmurAudio.loop = true;
                    this.murmurAudio.volume = 0.18;
                    this.murmurAudio.play().then(() => {
                        this.isMurmurPlaying = true;
                        const msg = "Kabin içi yaşayan yolcu fısıltısı ve mırıltısı aktif edildi.";
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`👥 ${msg}`, "success");
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    }).catch(e => {
                        console.warn("Murmur play error:", e);
                    });
                } catch (e) { }
            }
            this.renderModalContent();
        },

        // Rol 5: 📻 Karşı Şerit Kaptan Telsiz Muhabbeti (Mandal Basma & Roger Bip Efektli)
        triggerColleagueRadioChat: function () {
            // 1. Telsiz mandalına basma sesi (çıt-hışşşt!)
            if (typeof audio !== 'undefined' && audio.playRadioSquelch) {
                audio.playRadioSquelch(true);
            } else {
                this.playSound('radioStart', 0.20);
            }

            const chats = [
                "Tekirdağ yönüne giden kaptanım selamlar! Bolu Dağı tünel çıkışında sis var, hızını 70'e bağla, kazasız belasız hayırlı işler!",
                "59 plakalı meslektaşım dinlemede misin? Giresun Tirebolu sahilinde yol çalışması var, sağ şeritten devam et, tekerine taş değmesin!",
                "Aleykümselam usta kaptanım! Karadeniz yolu açık, yağış hafifledi. Tüm meslektaşlara hayırlı seferler, 19. kanaldan selamlar!",
                "Doğu seferindeki hemşehrim, Kop Dağı zirvesinde hafif buzlanma başlamış, retarderini hazır tut, selamlar hürmetler!",
                "Kaptanım hayırlı yolculuklar! Susurluk tesislerine yaklaşıyorsan tostu ve ayranı sıcaktır, bir mola ver nefeslen!",
                "Kuzey Marmara Otoyolu gişeler açık kaptan, sol şerit akıyor. 19. kanaldan tüm şoför kardeşlerime selam olsun!"
            ];
            const chat = chats[Math.floor(Math.random() * chats.length)];

            setTimeout(() => {
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast(`📻 [Kanal 19 Telsiz]: "${chat}"`, "info");
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(`Telsiz Kanal On Dokuz: ${chat}`, () => {
                        // 2. Konuşma bittiğinde telsiz mandal bırakma ve Roger Bip sesi (bip-bip / pfffft!)
                        setTimeout(() => {
                            if (typeof audio !== 'undefined' && audio.playRadioSquelch) {
                                audio.playRadioSquelch(false);
                            } else {
                                this.playSound('radioEnd', 0.15);
                            }
                        }, 70);
                    });
                }
            }, 300);
        },

        // Telsiz Sesi Testi (Mandal Basma + Telsiz Cızırtısı + Roger Bip)
        testRadioTransmission: function () {
            if (typeof audio !== 'undefined' && audio.playRadioSquelch) {
                audio.playRadioSquelch(true);
                setTimeout(() => {
                    audio.playRadioSquelch(false);
                }, 550);
            } else {
                this.playSound('radioStart', 0.20);
                setTimeout(() => this.playSound('radioEnd', 0.85), 500);
            }
            const msg = "Telsiz mandalına basıldı (çıt-hışşşt) ve Roger bip (bip-bip) çaldı.";
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`📻 ${msg}`, "info");
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
        },

        // HUD Butonunu Ekle
        injectHudButton: function () {
            const container = document.getElementById('hud-indicators');
            if (!container || document.getElementById('hud-roleplay-btn')) return;

            const btnRp = document.createElement('button');
            btnRp.id = 'hud-roleplay-btn';
            btnRp.style.cssText = 'background: rgba(168, 85, 247, 0.25); border: 1px solid #a855f7; color: #c084fc; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 6px;';
            btnRp.innerHTML = '🎭 ROL YAPMA (F2)';
            btnRp.title = 'Rol Yapma & Freesound Ses Efektleri Paneli (Kısayol: F2)';
            btnRp.setAttribute('aria-label', 'Rol Yapma ve Ses Efektleri Paneli (F2)');
            btnRp.addEventListener('click', () => this.toggleModal());
            container.appendChild(btnRp);
        },

        setupKeyBindings: function () {
            window.addEventListener('keydown', (e) => {
                if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

                // F2: Rol Yapma Panelini Aç / Kapat
                if (e.key === 'F2') {
                    e.preventDefault();
                    this.toggleModal();
                    return;
                }

                // Hızlı Kısayollar (Shift kombinasyonları ile sıfır çakışma!)
                if (e.shiftKey) {
                    const k = e.key.toLowerCase();
                    if (k === 'v') {
                        e.preventDefault();
                        this.triggerCologneService();
                    } else if (k === 'p') {
                        e.preventDefault();
                        this.triggerLuggageAndTerminal();
                    } else if (k === 'z') {
                        e.preventDefault();
                        this.triggerPoliceInspection();
                    }
                }
            });
        },

        toggleModal: function () {
            const modal = document.getElementById('roleplay-modal');
            if (modal && !modal.classList.contains('hidden')) {
                this.closeModal();
            } else {
                this.openModal();
            }
        },

        openModal: function () {
            this.injectModal();
            const modal = document.getElementById('roleplay-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
            this.renderModalContent();

            const msg = "Rol Yapma ve Freesound ses efektleri paneli açıldı. Kolonya servisi, otogar bagaj zımbası, polis denetimi veya yolcu mırıltısını başlatabilirsiniz.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
        },

        closeModal: function () {
            const modal = document.getElementById('roleplay-modal');
            if (modal) modal.classList.add('hidden');
        },

        injectModal: function () {
            if (document.getElementById('roleplay-modal')) return;

            const modalHtml = `
            <div id="roleplay-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="roleplay-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8800; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="glass-panel" style="max-width: 820px; width: 95%; padding: 24px 28px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2px solid #a855f7; box-shadow: 0 0 35px rgba(168, 85, 247, 0.3);">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <div>
                            <h2 id="roleplay-modal-title" class="gradient-text" style="font-size: 1.8rem; margin: 0; color: #c084fc;">
                                🎭 Şehirlerarası Otobüs Rol Yapma & Ses Efektleri
                            </h2>
                            <p style="color: #cbd5e1; font-size: 0.92rem; margin: 4px 0 0 0;">
                                Freesound API ile güçlendirilmiş gerçekçi polis düdüğü, takograf yazıcısı, kolonya fısfısı, bagaj zımbası ve yaşayan yolcular.
                            </p>
                        </div>
                        <button id="btn-close-roleplay-modal" class="modern-btn" style="padding: 6px 14px; background: rgba(255,255,255,0.1); border: 1px solid #ef4444; color: #ef4444; font-size: 1.1rem; cursor: pointer;" aria-label="Rol yapma penceresini kapat (Esc veya F2)">✕ Kapat</button>
                    </div>

                    <div id="roleplay-modal-content"></div>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.getElementById('btn-close-roleplay-modal').addEventListener('click', () => this.closeModal());
        },

        renderModalContent: function () {
            const container = document.getElementById('roleplay-modal-content');
            if (!container) return;

            let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
                
                <!-- 1. Kolonya & İkram Servisi -->
                <div style="background: rgba(30, 41, 59, 0.8); border: 1.5px solid #a855f7; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: #e9d5ff;">🧴 Kolonya & İkram Servisi</div>
                        <p style="color: #cbd5e1; font-size: 0.85rem; margin: 6px 0 12px 0;">
                            Muavin koridorda limon kolonyası sıkar (Fıs-fıs sesi), yolcular teşekkür eder. Yolcu memnuniyeti artar.
                        </p>
                        <div style="color: #a855f7; font-size: 0.8rem; font-weight: bold;">Hızlı Kısayol: Shift + V</div>
                    </div>
                    <button id="rp-btn-cologne" class="modern-btn" style="margin-top: 14px; padding: 10px; background: #9333ea; color: #fff; font-weight: bold; border-radius: 8px; border: none; cursor: pointer;" aria-label="Limon kolonyası ve ikram servisi başlat">
                        Fıs Fıs! Kolonya Dağıt
                    </button>
                </div>

                <!-- 2. Otogar & Bagaj Zımbası -->
                <div style="background: rgba(30, 41, 59, 0.8); border: 1.5px solid #3b82f6; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: #bfdbfe;">🎟️ Otogar Anons Zili & Bagaj Fişi</div>
                        <p style="color: #cbd5e1; font-size: 0.85rem; margin: 6px 0 10px 0;">
                            3'lü anons zili (Dı-dı-dııın / 3 zilin birleşimi) veya tekli derin gong (Dıııın) ve ardından metalik bagaj kuponu zımbalama sesi (Çat-çat!).
                        </p>
                        <div style="color: #60a5fa; font-size: 0.8rem; font-weight: bold; margin-bottom: 8px;">Hızlı Kısayol: Shift + P</div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button id="rp-btn-luggage" class="modern-btn" style="padding: 9px; background: #2563eb; color: #fff; font-weight: bold; border-radius: 8px; border: none; cursor: pointer;" aria-label="3'lü zil ve bagaj fişi zımbalama başlat (+45 Lira)">
                            🎟️ 3'lü Zil & Bagaj Zımbala (+45 ₺)
                        </button>
                        <div style="display: flex; gap: 6px;">
                            <button id="rp-btn-chime-3tone" class="modern-btn" style="flex: 1; padding: 7px; background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.82rem; font-weight: bold; border-radius: 6px; cursor: pointer;" aria-label="3'lü zili çal (Dı-dı-dııın)">
                                🔔 3'lü Zil (Dı-dı-dııın)
                            </button>
                            <button id="rp-btn-chime-gong" class="modern-btn" style="flex: 1; padding: 7px; background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.82rem; font-weight: bold; border-radius: 6px; cursor: pointer;" aria-label="Tekli derin gong çal (Dıııın)">
                                🔕 Tekli Gong (Dıııın)
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 3. Bölge Trafik Polisi & Takograf -->
                <div style="background: rgba(30, 41, 59, 0.8); border: 1.5px solid #eab308; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: #fef08a;">👮 Bölge Trafik & Takograf Denetimi</div>
                        <p style="color: #cbd5e1; font-size: 0.85rem; margin: 6px 0 12px 0;">
                            Polis düdüğü (Fiiüüütt!), megafonla sağa çekme ve takograf yazıcısının kağıt çıkarma sesi (Zzzzt-çat!).
                        </p>
                        <div style="color: #facc15; font-size: 0.8rem; font-weight: bold;">Hızlı Kısayol: Shift + Z</div>
                    </div>
                    <button id="rp-btn-police" class="modern-btn" style="margin-top: 14px; padding: 10px; background: #ca8a04; color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer;" aria-label="Bölge trafik polisi denetimine gir">
                        Düdük & Takograf Denetimi
                    </button>
                </div>

                <!-- 4. Kabin İçi Yolcu Mırıltısı -->
                <div style="background: rgba(30, 41, 59, 0.8); border: 1.5px solid #10b981; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: #a7f3d0;">👥 Kabin İçi Yolcu Mırıltısı</div>
                        <p style="color: #cbd5e1; font-size: 0.85rem; margin: 6px 0 12px 0;">
                            Arka koltuklardan gelen hafif sohbet, gazete hışırtısı ve gerçekçi yaşayan yolcu kabin ambiyansı.
                        </p>
                        <div style="color: #34d399; font-size: 0.85rem; font-weight: bold;">
                            Durum: ${this.isMurmurPlaying ? '<span style="color:#4ade80;">🔊 Çalıyor</span>' : '<span style="color:#94a3b8;">⏹️ Kapalı</span>'}
                        </div>
                    </div>
                    <button id="rp-btn-murmur" class="modern-btn" style="margin-top: 14px; padding: 10px; background: ${this.isMurmurPlaying ? '#dc2626' : '#059669'}; color: #fff; font-weight: bold; border-radius: 8px; border: none; cursor: pointer;" aria-label="Kabin içi yolcu mırıltısını aç veya kapat">
                        ${this.isMurmurPlaying ? '⏹️ Mırıltıyı Kapat' : '▶️ Yolcu Mırıltısını Başlat'}
                    </button>
                </div>

                <!-- 5. Kanal 19 Telsiz Muhabbeti -->
                <div style="background: rgba(30, 41, 59, 0.8); border: 1.5px solid #f97316; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: #fed7aa;">📻 Kanal 19 Telsiz Muhabbeti</div>
                        <p style="color: #cbd5e1; font-size: 0.85rem; margin: 6px 0 10px 0;">
                            Kaptan telsiz mandalına basar (çıt-hışşşt), karşı şeritteki meslektaşla konuşur, mandal bırakılınca Roger bip (bip-bip!) çalar.
                        </p>
                        <div style="color: #fb923c; font-size: 0.8rem; font-weight: bold; margin-bottom: 8px;">Genel Telsiz: F4 / X | Dispeçer: T</div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button id="rp-btn-radio" class="modern-btn" style="padding: 9px; background: #ea580c; color: #fff; font-weight: bold; border-radius: 8px; border: none; cursor: pointer;" aria-label="Karşı şeritteki kaptana telsizle selam ver">
                            📻 Cızzzt! Meslektaşa Seslen
                        </button>
                        <button id="rp-btn-radio-test" class="modern-btn" style="padding: 7px; background: rgba(249, 115, 22, 0.25); border: 1px solid #f97316; color: #fed7aa; font-size: 0.82rem; font-weight: bold; border-radius: 6px; cursor: pointer;" aria-label="Telsiz mandal basma ve Roger bip sesini test et">
                            🔊 Telsiz Mandal & Roger Bip Testi
                        </button>
                    </div>
                </div>

            </div>`;

            container.innerHTML = html;

            document.getElementById('rp-btn-cologne').addEventListener('click', () => this.triggerCologneService());
            document.getElementById('rp-btn-luggage').addEventListener('click', () => this.triggerLuggageAndTerminal('3tone'));
            const btn3Tone = document.getElementById('rp-btn-chime-3tone');
            if (btn3Tone) btn3Tone.addEventListener('click', () => this.playAnnouncementChime('3tone'));
            const btnGong = document.getElementById('rp-btn-chime-gong');
            if (btnGong) btnGong.addEventListener('click', () => this.playAnnouncementChime('gong'));
            document.getElementById('rp-btn-police').addEventListener('click', () => this.triggerPoliceInspection());
            document.getElementById('rp-btn-murmur').addEventListener('click', () => this.togglePassengerMurmur());
            document.getElementById('rp-btn-radio').addEventListener('click', () => this.triggerColleagueRadioChat());
            const btnRadioTest = document.getElementById('rp-btn-radio-test');
            if (btnRadioTest) btnRadioTest.addEventListener('click', () => this.testRadioTransmission());
        }
    };

    // Global nesneye bağla
    window.RoleplaySystem = RoleplaySystem;

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RoleplaySystem.init());
    } else {
        RoleplaySystem.init();
    }
})();

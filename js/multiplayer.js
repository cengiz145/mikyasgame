/**
 * multiplayer.js - Canlı Çok Oyunculu Kaptan Ağı, Konvoy & Telsiz Sistemi (Kanal 19)
 * Firebase Realtime Database üzerinden çalışan, tam erişilebilir canlı karşılaşma motoru.
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const Multiplayer = {
        isOnline: false,
        driverId: null,
        profile: {
            name: "Kaptan",
            plate: "59 TKL 183",
            company: "Tekirdağ Seyahat",
            bus: "Mercedes Travego 15 SHD"
        },
        otherDrivers: {},
        lastSyncTimestamp: 0,
        syncTimer: null,
        proximityAnnounceCooldown: {},
        lastHornCooldown: 0,
        myRef: null,

        init: function () {
            try {
                // 1. Oyuncu Kimliği ve Profil Yükleme
                this.driverId = localStorage.getItem('otobusDriverId');
                if (!this.driverId) {
                    this.driverId = 'drv_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                    localStorage.setItem('otobusDriverId', this.driverId);
                }

                const savedUsername = localStorage.getItem('otobusUsername');
                if (savedUsername && savedUsername.trim()) {
                    this.profile.name = savedUsername.trim();
                } else {
                    this.profile.name = "Kaptan " + (Math.floor(10 + Math.random() * 90));
                }

                const savedPlate = localStorage.getItem('otobusPlate');
                if (savedPlate && savedPlate.trim()) {
                    this.profile.plate = savedPlate.trim();
                } else {
                    this.profile.plate = "59 TEK " + (Math.floor(100 + Math.random() * 900));
                    localStorage.setItem('otobusPlate', this.profile.plate);
                }

                const savedCompany = localStorage.getItem('otobusCompany');
                if (savedCompany && savedCompany.trim()) {
                    this.profile.company = savedCompany.trim();
                }

                // 2. Firebase Veritabanı Kontrolü
                if (!window.db || typeof firebase === 'undefined') {
                    console.log("[Multiplayer] Çevrimdışı mod: Firebase bağlantısı henüz yok, yerel radar aktif.");
                    this.updateHudBadge(1);
                    return;
                }

                this.isOnline = true;
                this.myRef = window.db.ref('online_drivers/' + this.driverId);

                // Oyundan çıkıldığında veya sekme kapandığında otomatik sil
                this.myRef.onDisconnect().remove();

                window.addEventListener('beforeunload', () => {
                    if (this.myRef) this.myRef.remove();
                });

                // 3. Çevrimiçi Kaptanları Dinle
                const driversRef = window.db.ref('online_drivers');
                driversRef.on('value', (snapshot) => {
                    const data = snapshot.val() || {};
                    const now = Date.now();
                    const active = {};

                    Object.keys(data).forEach(id => {
                        if (id !== this.driverId) {
                            const d = data[id];
                            // Son 25 saniye içinde aktif olanları kabul et
                            if (d && d.lastSeen && (now - d.lastSeen < 25000)) {
                                active[id] = d;
                            }
                        }
                    });

                    this.otherDrivers = active;
                    const totalOnline = Object.keys(active).length + 1; // Biz + diğerleri
                    this.updateHudBadge(totalOnline);
                });

                // 4. Canlı Korna ve Selektör Olaylarını Dinle
                const eventsRef = window.db.ref('driver_events');
                eventsRef.limitToLast(5).on('child_added', (snapshot) => {
                    const ev = snapshot.val();
                    if (!ev || ev.driverId === this.driverId) return;

                    const now = Date.now();
                    if (ev.timestamp && (now - ev.timestamp < 3500)) {
                        this.handleRemoteEvent(ev);
                    }
                });

                // 5. Canlı Telsiz Mesajlarını Dinle (Kanal 19)
                const radioRef = window.db.ref('radio_chatter');
                radioRef.limitToLast(1).on('child_added', (snapshot) => {
                    const msg = snapshot.val();
                    if (!msg || msg.driverId === this.driverId) return;

                    const now = Date.now();
                    if (msg.timestamp && (now - msg.timestamp < 4500)) {
                        this.handleRemoteRadio(msg);
                    }
                });

                // 6. Düzenli Kalp Atışı (Heartbeat Sync)
                this.syncTimer = setInterval(() => {
                    this.syncMyState();
                }, 1200);

                // İlk eşitlemeyi hemen yap
                this.syncMyState();
                console.log("[Multiplayer] Canlı Kaptan Ağı hazır. Kaptan:", this.profile.name, "Plaka:", this.profile.plate);

                // Modal bileşenini DOM'a bağla
                this.injectModals();

            } catch (err) {
                console.warn("[Multiplayer] Başlatma uyarısı:", err);
            }
        },

        // Kendi konum ve sürüş bilgilerimizi buluta gönder
        syncMyState: function () {
            if (!this.isOnline || !this.myRef) return;

            try {
                const currentBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
                const busName = currentBus ? currentBus.name : this.profile.bus;
                const isDriving = typeof Game !== 'undefined' ? !!Game.isDriving : false;
                const currentCity = typeof Game !== 'undefined' ? (Game.currentCity || "Tekirdağ") : "Tekirdağ";
                const currentDistrict = typeof Game !== 'undefined' ? (Game.currentDistrict || "Süleymanpaşa") : "Süleymanpaşa";
                const activeRouteId = typeof Game !== 'undefined' ? (Game.activeRouteId || "") : "";
                const routeName = (typeof Game !== 'undefined' && Game.activeRouteData) ? Game.activeRouteData.name : "Garaj";
                const speed = typeof Game !== 'undefined' ? Math.round(Game.speed || 0) : 0;
                const totalDist = typeof Game !== 'undefined' ? Math.round(Game.totalDistanceCovered || 0) : 0;
                const remDist = typeof Game !== 'undefined' ? Math.round(Game.currentDistanceToNext || 0) : 0;
                const lane = typeof Game !== 'undefined' ? (Math.round(Game.lanePosition || 50)) : 50;

                const payload = {
                    id: this.driverId,
                    name: this.profile.name,
                    plate: this.profile.plate,
                    company: this.profile.company,
                    bus: busName,
                    city: currentCity,
                    district: currentDistrict,
                    routeId: activeRouteId,
                    routeName: routeName,
                    speed: speed,
                    totalDist: totalDist,
                    remDist: remDist,
                    lane: lane,
                    isDriving: isDriving,
                    lastSeen: firebase.database.ServerValue.TIMESTAMP
                };

                this.myRef.set(payload);

                // Yakınlık ve karşılaşma kontrollerini çalıştır
                if (isDriving) {
                    this.checkProximities(currentCity, activeRouteId, totalDist);
                }

            } catch (e) {
                // Sessiz kurtarma
            }
        },

        // Yakındaki diğer gerçek oyuncuları kontrol et ve sesli ikaz ver
        checkProximities: function (myCity, myRouteId, myDist) {
            const now = Date.now();
            Object.values(this.otherDrivers).forEach(driver => {
                if (!driver || !driver.isDriving) return;

                // Aynı şehirde veya aynı hatta mı?
                const isSameCity = (driver.city && driver.city.toLowerCase() === myCity.toLowerCase());
                const isSameRoute = (driver.routeId && driver.routeId === myRouteId);

                if (isSameCity || isSameRoute) {
                    // İki otobüs arasındaki mesafe farkı (metre)
                    const distDiff = Math.abs((driver.totalDist || 0) - myDist);

                    // 1200 metre altına girdiyse ve son 60 saniyede duyurulmadıysa
                    if (distDiff < 1200) {
                        const lastAnnounce = this.proximityAnnounceCooldown[driver.id] || 0;
                        if (now - lastAnnounce > 60000) {
                            this.proximityAnnounceCooldown[driver.id] = now;

                            const dirText = (driver.totalDist > myDist) ? "ilerinizde karşı şeritten geliyor" : "arkanızda konvoy takip mesafesinde";
                            const msg = `Dikkat Kaptan: ${driver.name} (${driver.plate}), yaklaşık ${Math.round(distDiff)} metre ${dirText}!`;

                            if (typeof audio !== 'undefined' && audio.speak) {
                                audio.speak(msg);
                            }
                            if (typeof UI !== 'undefined' && UI.showToast) {
                                UI.showToast(`🚌 Kaptan ${driver.name} yaklaşıyor! (${Math.round(distDiff)} m)`, "info");
                            }
                        }
                    }
                }
            });
        },

        // Korna çalındığında tüm ağa yayınla
        broadcastHorn: function () {
            const now = Date.now();
            if (now - this.lastHornCooldown < 1500) return; // Spam koruması
            this.lastHornCooldown = now;

            if (!this.isOnline || !window.db) return;

            try {
                const currentCity = typeof Game !== 'undefined' ? (Game.currentCity || "Tekirdağ") : "Tekirdağ";
                const totalDist = typeof Game !== 'undefined' ? Math.round(Game.totalDistanceCovered || 0) : 0;
                const lane = typeof Game !== 'undefined' ? Math.round(Game.lanePosition || 50) : 50;

                const eventsRef = window.db.ref('driver_events');
                const newEvRef = eventsRef.push();
                newEvRef.set({
                    type: 'horn',
                    driverId: this.driverId,
                    name: this.profile.name,
                    plate: this.profile.plate,
                    city: currentCity,
                    totalDist: totalDist,
                    lane: lane,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });

                // 4 saniye sonra bu olayı buluttan temizle
                setTimeout(() => {
                    newEvRef.remove().catch(() => {});
                }, 4000);

            } catch (e) {}
        },

        // Başka bir oyuncu korna çaldığında
        handleRemoteEvent: function (ev) {
            if (ev.type === 'horn') {
                const myCity = typeof Game !== 'undefined' ? (Game.currentCity || "Tekirdağ") : "Tekirdağ";
                const myDist = typeof Game !== 'undefined' ? Math.round(Game.totalDistanceCovered || 0) : 0;

                // Aynı şehirde veya yakın mesafedeyse sesi çal
                if (ev.city && ev.city.toLowerCase() === myCity.toLowerCase()) {
                    const distDiff = Math.abs((ev.totalDist || 0) - myDist);

                    // 2500 metreden yakınsa kornayı duy
                    if (distDiff < 2500) {
                        // Mesafeye göre ses seviyesi ve panlama hesabı
                        const vol = Math.max(0.2, 1.0 - (distDiff / 2500));
                        const pan = (ev.lane < 40) ? -0.6 : 0.6; // Şeridine göre sol/sağ stereo

                        this.play3DRemoteHorn(pan, vol);

                        // Ekrana ve sesli asistana selam bildirimi
                        const toastMsg = `📢 Kaptan ${ev.name} (${ev.plate}) size korna ile selam verdi!`;
                        if (typeof UI !== 'undefined' && UI.showToast) {
                            UI.showToast(toastMsg, "success");
                        }
                        if (typeof audio !== 'undefined' && audio.speak && distDiff < 600) {
                            audio.speak(`Kaptan ${ev.name} selam verdi!`);
                        }
                    }
                }
            }
        },

        // Uzaktan gelen kornayı 3D stereo olarak çal
        play3DRemoteHorn: function (pan, vol) {
            try {
                if (typeof audio !== 'undefined' && audio.ctx) {
                    const ctx = audio.ctx;
                    if (ctx.state === 'suspended') ctx.resume();

                    // Çift tonlu otobüs havalı korna sentezleyici
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    osc1.type = 'sawtooth';
                    osc2.type = 'triangle';
                    osc1.frequency.setValueAtTime(370, ctx.currentTime); // F#4
                    osc2.frequency.setValueAtTime(440, ctx.currentTime); // A4

                    const gainNode = ctx.createGain();
                    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(vol * 0.45, ctx.currentTime + 0.08);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

                    // Panner (Stereo Konumlandırma)
                    if (ctx.createStereoPanner) {
                        const panner = ctx.createStereoPanner();
                        panner.pan.setValueAtTime(pan, ctx.currentTime);
                        osc1.connect(gainNode);
                        osc2.connect(gainNode);
                        gainNode.connect(panner);
                        panner.connect(ctx.destination);
                    } else {
                        osc1.connect(gainNode);
                        osc2.connect(gainNode);
                        gainNode.connect(ctx.destination);
                    }

                    osc1.start(ctx.currentTime);
                    osc2.start(ctx.currentTime);
                    osc1.stop(ctx.currentTime + 0.9);
                    osc2.stop(ctx.currentTime + 0.9);
                    return;
                }

                // Fallback normal audio korna
                if (typeof audio !== 'undefined' && audio.playHorn) {
                    audio.playHorn();
                }
            } catch (err) {}
        },

        // Telsiz Mesajı Gönder (Kanal 19)
        sendRadioMessage: function (text) {
            if (!text || !text.trim()) return;
            const cleanText = text.trim().substring(0, 140);

            if (!this.isOnline || !window.db) {
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast("Çevrimdışı mod: Telsiz yayını yapılamadı.", "warning");
                }
                return;
            }

            try {
                const currentCity = typeof Game !== 'undefined' ? (Game.currentCity || "Tekirdağ") : "Tekirdağ";
                const radioRef = window.db.ref('radio_chatter');
                const newMsgRef = radioRef.push();
                newMsgRef.set({
                    driverId: this.driverId,
                    name: this.profile.name,
                    plate: this.profile.plate,
                    company: this.profile.company,
                    city: currentCity,
                    text: cleanText,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });

                this.playRadioChirp();

                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast(`📻 Telsiz Gönderildi: "${cleanText}"`, "success");
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(`Telsiz yayını yapıldı: ${cleanText}`);
                }

                // 15 saniye sonra bu telsiz anonsunu temizle
                setTimeout(() => {
                    newMsgRef.remove().catch(() => {});
                }, 15000);

            } catch (e) {}
        },

        // Başka bir oyuncudan telsiz anonsu geldiğinde
        handleRemoteRadio: function (msg) {
            this.playRadioChirp();

            const fullAnnouncement = `Telsizden Kaptan ${msg.name}: "${msg.text}"`;
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`📻 [Kanal 19] ${msg.name}: ${msg.text}`, "info");
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(fullAnnouncement);
            }
        },

        // Telsiz Cızırtı ve Bip Sesi (CB Squelch Beep & Roger Beep)
        playRadioChirp: function () {
            try {
                if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                    audio.playRadioSquelch(false);
                    return;
                }
                if (typeof audio !== 'undefined' && audio.ctx) {
                    const ctx = audio.ctx;
                    if (ctx.state === 'suspended') ctx.resume();

                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.05);

                    gain.gain.setValueAtTime(0.01, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.03);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.15);
                }
            } catch (e) {}
        },

        // HUD Üzerindeki Çevrimiçi Kaptanlar Rozetini Güncelle
        updateHudBadge: function (count) {
            const countEl = document.getElementById('hud-multiplayer-count');
            if (countEl) {
                countEl.innerText = `${count} Kaptan Çevrimiçi`;
            }
            const panelEl = document.getElementById('hud-multiplayer-panel');
            if (panelEl) {
                panelEl.setAttribute('aria-label', `Canlı Kaptan Radarı: ${count} kaptan çevrimiçi. Radar ve Telsiz için X veya F4 tuşuna basın.`);
            }
        },

        // Telsiz ve Radar Sesli Özeti (X veya F4)
        announceRadar: function () {
            const others = Object.values(this.otherDrivers);
            const totalCount = others.length + 1;

            if (others.length === 0) {
                const msg = `Telsiz Radarı: Şu an haritada sizden başka aktif kaptan görünmüyor. Tek başınıza seferdesiniz.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "info");
                return;
            }

            let msg = `Telsiz Radarı: Şu an Türkiye yollarında siz dahil toplam ${totalCount} kaptan aktif. `;
            others.slice(0, 4).forEach((d, idx) => {
                const spd = d.speed ? `${d.speed} kilometre hızla` : "duraklamış vaziyette";
                const city = d.city || "Bilinmeyen güzergah";
                msg += `${idx + 1}: Kaptan ${d.name}, ${d.plate} plakalı ${d.bus || 'aracıyla'}, ${city} bölgesinde ${spd}. `;
            });

            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(msg);
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(msg, "info");
            }
        },

        // Radar ve Telsiz Modallarını Oluştur
        injectModals: function () {
            if (document.getElementById('multiplayer-radar-modal')) return;

            const modalHtml = `
            <div id="multiplayer-radar-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="mp-radar-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.88); z-index: 8700; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="glass-panel" style="max-width: 620px; width: 92%; padding: 24px; text-align: left; max-height: 88vh; overflow-y: auto; border: 2px solid #10b981; box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <h2 id="mp-radar-title" style="font-size: 1.6rem; margin: 0; color: #34d399;">
                                📡 Canlı Kaptan Radarı & Telsiz (Kanal 19)
                            </h2>
                            <p style="color: #cbd5e1; font-size: 0.9rem; margin: 4px 0 0 0;">
                                Türkiye yollarında aktif olan diğer gerçek otobüs şoförleri ve telsiz kanalı.
                            </p>
                        </div>
                        <button id="btn-close-mp-radar" class="modern-btn nav-item" style="padding: 6px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; cursor: pointer;" aria-label="Radarı Kapat (Esc)">✕ Kapat</button>
                    </div>

                    <!-- Kendi Profil Kartımız -->
                    <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <div style="color: #6ee7b7; font-weight: bold; font-size: 0.95rem; margin-bottom: 4px;">👤 SİZİN KAPTAN BİLGİNİZ:</div>
                        <div id="mp-my-profile-desc" style="color: #fff; font-size: 1.05rem;">
                            <strong>${this.profile.name}</strong> (${this.profile.plate}) - ${this.profile.company}
                        </div>
                    </div>

                    <!-- Hızlı Telsiz Mesajları Butonları -->
                    <div style="margin-bottom: 18px;">
                        <label style="color: #38bdf8; font-weight: bold; font-size: 0.95rem; display: block; margin-bottom: 8px;">
                            📻 Hızlı Telsiz Anonsu Gönder (Kanal 19):
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <button class="mp-radio-btn modern-btn nav-item" data-msg="Hayırlı seferler kaptanlar, yolunuz açık olsun!" style="padding: 8px; text-align: left; font-size: 0.88rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; cursor: pointer;">
                                🟢 1: Hayırlı seferler kaptanlar!
                            </button>
                            <button class="mp-radio-btn modern-btn nav-item" data-msg="Bolu Dağı tesislerinde çay molasındayım, beklerim!" style="padding: 8px; text-align: left; font-size: 0.88rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; cursor: pointer;">
                                ☕ 2: Tesislerde çaydayım, beklerim!
                            </button>
                            <button class="mp-radio-btn modern-btn nav-item" data-msg="Karşı hat temiz, yol akıcı, radar görünmüyor." style="padding: 8px; text-align: left; font-size: 0.88rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; cursor: pointer;">
                                🛣️ 3: Yol açık ve temiz kaptan!
                            </button>
                            <button class="mp-radio-btn modern-btn nav-item" data-msg="İleride hava sisli ve yol kaygan, hızınızı düşürün!" style="padding: 8px; text-align: left; font-size: 0.88rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; cursor: pointer;">
                                ⚠️ 4: İleride sis var, dikkat edin!
                            </button>
                        </div>
                    </div>

                    <!-- Özel Telsiz Mesajı Girişi -->
                    <div style="display: flex; gap: 8px; margin-bottom: 18px;">
                        <input type="text" id="mp-custom-radio-input" placeholder="Telsizden bir şey söyleyin..." style="flex: 1; padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15,23,42,0.8); color: #fff; font-size: 0.95rem;">
                        <button id="btn-send-mp-custom-radio" class="modern-btn nav-item" style="padding: 10px 18px; background: #059669; border: 1px solid #10b981; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer;">🎙️ Anons Et</button>
                    </div>

                    <!-- Çevrimiçi Kaptanlar Listesi -->
                    <h3 style="color: #facc15; font-size: 1.15rem; margin-bottom: 8px;">
                        🚍 Yoldaki Diğer Kaptanlar:
                    </h3>
                    <ul id="mp-drivers-list" style="list-style: none; padding: 0; margin: 0; max-height: 35vh; overflow-y: auto;">
                        <!-- Dinamik doldurulacak -->
                    </ul>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Modal Kapatma
            document.getElementById('btn-close-mp-radar').addEventListener('click', () => {
                this.closeRadarModal();
            });

            // Hızlı Butonlar
            document.querySelectorAll('.mp-radio-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const msg = e.currentTarget.getAttribute('data-msg');
                    this.sendRadioMessage(msg);
                });
            });

            // Özel Mesaj Gönderme
            const customInput = document.getElementById('mp-custom-radio-input');
            const btnSendCustom = document.getElementById('btn-send-mp-custom-radio');
            const doSend = () => {
                if (customInput && customInput.value.trim()) {
                    this.sendRadioMessage(customInput.value.trim());
                    customInput.value = '';
                }
            };
            btnSendCustom.addEventListener('click', doSend);
            customInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') doSend();
            });
        },

        // Radar Modalını Aç ve Listeyi Doldur
        openRadarModal: function () {
            this.injectModals();
            const modal = document.getElementById('multiplayer-radar-modal');
            if (!modal) return;

            // Kendi profil açıklamasını tazele
            const profEl = document.getElementById('mp-my-profile-desc');
            if (profEl) {
                const currentBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
                const busName = currentBus ? currentBus.name : this.profile.bus;
                profEl.innerHTML = `<strong>${this.profile.name}</strong> (${this.profile.plate}) - ${this.profile.company} <br><small style="color: #94a3b8;">Araç: ${busName}</small>`;
            }

            const listEl = document.getElementById('mp-drivers-list');
            listEl.innerHTML = '';

            const others = Object.values(this.otherDrivers);

            if (others.length === 0) {
                listEl.innerHTML = `
                <li style="padding: 14px; text-align: center; color: #94a3b8; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    Şu an Türkiye yollarında aktif başka kaptan yok. İlk seferi siz başlattınız!
                </li>`;
            } else {
                others.forEach(d => {
                    const statusText = d.isDriving ? `🛣️ Sürüşte (${d.speed || 0} km/s)` : `🅿️ Park / Mola Halinde`;
                    const cityText = d.city ? `${d.city}` : "Bilinmiyor";
                    const routeText = d.routeName ? `Hat: ${d.routeName}` : "";

                    const li = document.createElement('li');
                    li.style.cssText = "padding: 12px 14px; margin-bottom: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;";
                    li.innerHTML = `
                    <div>
                        <div style="color: #38bdf8; font-weight: bold; font-size: 1.05rem;">
                            🚌 ${d.name} <span style="font-size: 0.85rem; color: #cbd5e1;">(${d.plate || 'Plakasız'})</span>
                        </div>
                        <div style="color: #e2e8f0; font-size: 0.9rem; margin-top: 2px;">
                            📍 <strong>${cityText}</strong> ${routeText ? '— ' + routeText : ''}
                        </div>
                        <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 2px;">
                            Firma: ${d.company || 'Serbest Kaptan'} | Araç: ${d.bus || 'Otobüs'}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; background: ${d.isDriving ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}; color: ${d.isDriving ? '#4ade80' : '#facc15'}; border: 1px solid ${d.isDriving ? '#22c55e' : '#eab308'};">
                            ${statusText}
                        </span>
                    </div>
                    `;
                    listEl.appendChild(li);
                });
            }

            modal.classList.remove('hidden');
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                this.announceRadar();
            }
        },

        // Radar Modalını Kapat
        closeRadarModal: function () {
            const modal = document.getElementById('multiplayer-radar-modal');
            if (modal) modal.classList.add('hidden');
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        }
    };

    // Global nesneye bağla
    window.Multiplayer = Multiplayer;

    // DOM yüklendiğinde başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Multiplayer.init());
    } else {
        Multiplayer.init();
    }

})();

/* ==========================================================================
   AŞAMA 6: CANLI ZİRVE SAATLER (RUSH HOUR AI), YOLCU DİNAMİKLERİ VE
   MOTOR TERMODİNAMİK SOĞUTMA MOTORU (POWERTRAIN & RUSH HOUR DYNAMICS)
   - Sabah/Akşam pik saatleri yolcu talep matrisi (07:00-09:00 & 17:00-19:30)
   - Canlı yolcu doluluğuna göre kabin içi uğultu ve dinamik tonaj fiziği
   - Motor harareti (°C), rampa/yük ısınması ve hidrostatik radyatör fanı
   - Shift + R Kısayolu: Telemetri, Zirve Saat & Motor Termal Raporu
   ========================================================================== */

(function(window) {
    'use strict';

    const PowertrainDynamicsEngine = {
        fanActive: false,
        lastFanSoundTime: 0,
        lastHighTempWarningTime: 0,

        /**
         * Saat dilimine göre yolcu ve trafik talep çarpanı
         */
        getDemandMultiplier: function(clockMinutes) {
            const m = ((clockMinutes % 1440) + 1440) % 1440;

            // 1. Sabah Zirve Saati (07:00 - 09:00 / 420 - 540 dk)
            if (m >= 420 && m <= 540) {
                // Zirve noktası 07:45 - 08:30 (465 - 510 dk)
                if (m >= 465 && m <= 510) return 2.8;
                return 2.2;
            }

            // 2. Öğle Hareketliliği ve Okul Çıkışı (12:00 - 13:45 / 720 - 825 dk)
            if (m >= 720 && m <= 825) {
                return 1.45;
            }

            // 3. Akşam İş ve Üniversite Dönüş Zirvesi (17:00 - 19:30 / 1020 - 1170 dk)
            if (m >= 1020 && m <= 1170) {
                // Zirve noktası 17:30 - 18:45 (1050 - 1125 dk)
                if (m >= 1050 && m <= 1125) return 2.6;
                return 2.0;
            }

            // 4. Gece Tenha Seferleri (23:00 - 05:30 / 1380 - 1440 & 0 - 330 dk)
            if (m >= 1380 || m <= 330) {
                return 0.35;
            }

            // 5. Standart Gün İçi Seferleri (09:00 - 12:00 & 13:45 - 17:00 & 19:30 - 23:00)
            return 1.0;
        },

        /**
         * Zirve saat durum metni
         */
        getRushHourStatus: function(clockMinutes) {
            const mult = this.getDemandMultiplier(clockMinutes);
            if (mult >= 2.5) return { status: "Sabah/Akşam Yoğun Zirve Saati", multiplier: mult, desc: "Duraklar kalabalık, yolcu talebi yüzde 160-180 daha yüksek." };
            if (mult >= 2.0) return { status: "Zirve Saati Başlangıcı", multiplier: mult, desc: "Yolcu akışı yoğunlaşıyor." };
            if (mult >= 1.4) return { status: "Öğle Hareketliliği", multiplier: mult, desc: "Okul ve çarşı yolcuları mevcut." };
            if (mult <= 0.4) return { status: "Gece Tarifesi", multiplier: mult, desc: "Yollar tenha, sakin seyir." };
            return { status: "Normal Sefer Saati", multiplier: 1.0, desc: "Rutin şehir içi akış." };
        },

        /**
         * Motor Termodinamik Fiziği (Hararet, Radyatör Fanı, Yağ Basıncı)
         */
        updateThermodynamics: function(game, deltaTime) {
            if (!game) return;

            // Varsayılan motor sıcaklığı başlatma
            if (typeof game.engineCoolantTemp !== 'number' || isNaN(game.engineCoolantTemp)) {
                game.engineCoolantTemp = 89.0;
            }
            if (typeof game.engineOilPressure !== 'number') {
                game.engineOilPressure = 4.8;
            }

            const isRunning = (typeof audio !== 'undefined' && audio.isEngineRunning) || game.engineStarted;
            if (!isRunning) {
                // Motor kapalıyken yavaşça ortam sıcaklığına soğur
                const ambient = (typeof game.temperature === 'number') ? game.temperature : 18;
                if (game.engineCoolantTemp > ambient) {
                    game.engineCoolantTemp -= (0.25 * deltaTime);
                }
                game.engineOilPressure = 0.0;
                if (this.fanActive) {
                    this.fanActive = false;
                    if (typeof audio !== 'undefined' && audio.stopRadiatorFan) audio.stopRadiatorFan();
                }
                return;
            }

            // Motor çalışırken yağ basıncı devire göre 3.5 - 5.5 bar arası
            const rpm = game.engineRPM || 800;
            game.engineOilPressure = Math.min(5.5, 3.2 + (rpm / 2500) * 2.2);

            // Isı Üretimi:
            // 1. Gaz verme yükü
            const isThrottle = game.keys && (game.keys.w || game.keys.arrowup);
            let heatGeneration = isThrottle ? 0.45 : 0.05;

            // 2. Yüksek devir ve sürat
            if (rpm > 1800) heatGeneration += 0.25;
            if (game.speed > 70) heatGeneration += 0.20;

            // 3. Eğim tırmanışı (Aşama 1 Topoğrafya eğimi)
            const slope = (typeof game.currentSlopePct === 'number') ? game.currentSlopePct : 0;
            if (slope > 2) {
                heatGeneration += (slope * 0.12); // Dik rampada motor hararet yapar
            }

            // 4. Retarder uzun süreli frenleme ısısı
            if (game.retarderLevel && game.retarderLevel > 0 && game.speed > 25) {
                heatGeneration += (game.retarderLevel * 0.08);
            }

            // Isı Dağılımı / Doğal Soğuma:
            // Rüzgar ve araç hızına bağlı doğal hava soğutması
            const ramAirCooling = (game.speed / 100) * 0.35;
            
            // Taban termostat dengesi (Hedef 89°C)
            const thermostatCooling = (game.engineCoolantTemp > 89.0) ? (game.engineCoolantTemp - 89.0) * 0.12 : 0;

            let netHeat = (heatGeneration - ramAirCooling - thermostatCooling) * deltaTime;
            game.engineCoolantTemp += netHeat;

            // Radyatör Soğutma Fanı Eşiği (98°C'de açılır, 88.5°C'de kapanır)
            if (game.engineCoolantTemp >= 98.0 && !this.fanActive) {
                this.fanActive = true;
                if (typeof audio !== 'undefined' && typeof audio.playRadiatorFan === 'function') {
                    audio.playRadiatorFan();
                }
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast("💨 Radyatör Soğutma Fanı Devrede (98°C)", "info");
                }
            }

            // Fan aktifken kuvvetli soğutma uygular
            if (this.fanActive) {
                const fanCoolingPower = 1.45 * deltaTime;
                game.engineCoolantTemp -= fanCoolingPower;

                if (game.engineCoolantTemp <= 88.5) {
                    this.fanActive = false;
                    if (typeof audio !== 'undefined' && typeof audio.stopRadiatorFan === 'function') {
                        audio.stopRadiatorFan();
                    }
                }
            }

            // Aşırı Hararet İkazı (106°C ve üzeri)
            const now = Date.now();
            if (game.engineCoolantTemp >= 106.0 && (now - this.lastHighTempWarningTime > 15000)) {
                this.lastHighTempWarningTime = now;
                const warnMsg = `Dikkat! Motor harareti ${Math.round(game.engineCoolantTemp)} dereceye ulaştı! Vitesi düşürün veya aracı rölantide soğutun.`;
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(warnMsg);
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion("🚨 " + warnMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🚨 Yüksek Hararet İkazı (" + Math.round(game.engineCoolantTemp) + "°C)", "error");
            }

            // Hararet alt ve üst limit sınırlaması
            game.engineCoolantTemp = Math.max(20.0, Math.min(125.0, game.engineCoolantTemp));
        },

        /**
         * Shift + R Kısayolu: Telemetri, Zirve Saat & Motor Termal Raporu
         */
        speakTelemetryReport: function(game) {
            if (!game) return;

            const clockMin = (typeof game.clockMinutes === 'number') ? game.clockMinutes : 480;
            const curHH = String(Math.floor(clockMin / 60)).padStart(2, '0');
            const curMM = String(Math.floor(clockMin % 60)).padStart(2, '0');
            
            const rush = this.getRushHourStatus(clockMin);
            const temp = Math.round((typeof game.engineCoolantTemp === 'number') ? game.engineCoolantTemp : 89);
            const oil = (typeof game.engineOilPressure === 'number') ? game.engineOilPressure.toFixed(1) : "4.8";
            const passCount = game.passengersOnBoard || 0;
            
            // Otobüs brüt ağırlık hesabı
            const baseTon = 12.0;
            const grossTon = (baseTon + (passCount * 0.075)).toFixed(1);
            
            const fanStatus = this.fanActive ? "Radyatör fanı aktif soğutmada." : "Radyatör fanı kapalı.";
            
            const report = `Saat ${curHH}:${curMM}. Tarife: ${rush.status}. Otobüs doluluğu: ${passCount} yolcu, toplam araç ağırlığı ${grossTon} ton. Motor harareti ${temp} derece. ${fanStatus} Yağ basıncı ${oil} bar.`;

            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(report);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion("📊 " + report);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`📊 Hararet: ${temp}°C | Doluluk: ${passCount} | Ağırlık: ${grossTon} t`, "info");
            }
        }
    };

    window.PowertrainDynamicsEngine = PowertrainDynamicsEngine;

})(typeof window !== 'undefined' ? window : globalThis);

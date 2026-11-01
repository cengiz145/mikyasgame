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
         * Motor Termodinamik Fiziği ve Yaşayan Otobüs Sistemleri
         * (Hararet, Radyatör Fanı, Yağ Basıncı, Turbo Basıncı, 24V Alternatör, Kabin İklimlendirme, ECAS ve Yolcu Yaşamı)
         */
        updateThermodynamics: function(game, deltaTime) {
            if (!game) return;

            // Varsayılan motor sıcaklığı, yağ basıncı, turbo, 24V akü ve kabin iklimlendirme başlatma
            if (typeof game.engineCoolantTemp !== 'number' || isNaN(game.engineCoolantTemp)) {
                game.engineCoolantTemp = 89.0;
            }
            if (typeof game.engineOilPressure !== 'number') {
                game.engineOilPressure = 4.8;
            }
            if (typeof game.turboBoostBar !== 'number') {
                game.turboBoostBar = 0.0;
            }
            if (typeof game.batteryVoltage !== 'number') {
                game.batteryVoltage = 24.4;
            }
            const ambient = (typeof game.temperature === 'number') ? game.temperature : 18.0;
            if (typeof game.cabinTemperature !== 'number' || isNaN(game.cabinTemperature)) {
                game.cabinTemperature = 21.5;
            }

            const isRunning = (typeof audio !== 'undefined' && audio.isEngineRunning) || game.engineStarted;
            const doorsOpen = !!(game.frontDoorOpen || game.rearDoorOpen);
            const winOpen = !!(typeof audio !== 'undefined' && audio.isWindowOpen);
            const passCount = game.passengersOnBoard || 0;

            // 1. CANLI KABİN İKLİMLENDİRME (Webasto Kalorifer / Konvekta Tavan Kliması & Açık Kapı/Cam Isı Kaybı)
            const windowDmgLeak = (game.busDamage) ? (((game.busDamage.leftWindow || 0) + (game.busDamage.rightWindow || 0)) * 0.002) : 0;
            const outsideExposure = (doorsOpen ? 0.18 : 0.015) + (winOpen ? 0.06 : 0) + windowDmgLeak;
            // Dış ortam sıcaklığına doğru doğal ısı transferi + yolcu vücut ısısı
            game.cabinTemperature += ((ambient - game.cabinTemperature) * outsideExposure + (passCount * 0.0012)) * deltaTime;
            if (isRunning) {
                // Otomatik çift bölgeli klima/kalorifer kabini 21.5°C konfor sıcaklığına dengeler
                const targetCabinTemp = 21.5;
                game.cabinTemperature += (targetCabinTemp - game.cabinTemperature) * 0.14 * deltaTime;
            }
            game.cabinTemperature = Math.max(-5.0, Math.min(42.0, game.cabinTemperature));

            // 2. CANLI YOLCU KABİN MIRILTISI VE UZUN YOL MUAVİN İKRAMI
            if (typeof audio !== 'undefined' && typeof audio.updatePassengerCabinMurmur === 'function') {
                audio.updatePassengerCabinMurmur(passCount, !!(game.isDriving && game.speed > 2));
            }

            const activeBus = (typeof BusFleet !== 'undefined' && BusFleet.getSelectedBus) ? BusFleet.getSelectedBus() : null;
            const isCoach = !!(activeBus && (activeBus.category === 'seyahat' || activeBus.category === 'turizm'));
            const isArticulated = !!(activeBus && (activeBus.category === 'körüklü' || (activeBus.lengthMeters && activeBus.lengthMeters >= 18)));
            const chassisRigidity = (activeBus && activeBus.chassisRigidity) ? activeBus.chassisRigidity : 80;

            // Durakta yolcu sayısı değişip kalkışa geçildiğinde ECAS havalı süspansiyon seviye valfi yeni tonajı dengeler
            if (typeof this._lastPassCount === 'number' && this._lastPassCount !== passCount && game.isDriving && game.speed > 3 && game.speed < 18) {
                this._lastPassCount = passCount;
                if (typeof audio !== 'undefined' && typeof audio.playEcasLevelingValve === 'function') {
                    audio.playEcasLevelingValve();
                }
            } else if (!game.isDriving) {
                this._lastPassCount = passCount;
            }

            // Uzun yol otobüslerinde seyir halindeyken muavinin çay/kek servisi yapması (her 4-5 dakikada bir doğal yaşam)
            if (isCoach && game.isDriving && game.speed > 55 && passCount >= 8) {
                const nowMs = Date.now();
                if (!this._lastRefreshmentTime) this._lastRefreshmentTime = nowMs;
                if (nowMs - this._lastRefreshmentTime > 260000) {
                    this._lastRefreshmentTime = nowMs;
                    if (typeof audio !== 'undefined' && typeof audio.playFullRefreshmentService === 'function') {
                        audio.playFullRefreshmentService();
                    }
                }
            }

            if (!isRunning) {
                // Motor kapalıyken yavaşça ortam sıcaklığına soğur, turbo ve yağ basıncı sıfırlanır
                if (game.engineCoolantTemp > ambient) {
                    game.engineCoolantTemp -= (0.25 * deltaTime);
                }
                game.engineOilPressure = 0.0;
                game.turboBoostBar = Math.max(0, game.turboBoostBar - (2.5 * deltaTime));
                // Motor kapalıyken 24V akü voltajı (farlar açıksa hafif deşarj olur)
                const drain = game.isHeadlightsOn ? 0.008 : 0.001;
                game.batteryVoltage = Math.max(22.4, Math.min(24.4, game.batteryVoltage - drain * deltaTime));

                if (this.fanActive) {
                    this.fanActive = false;
                    if (typeof audio !== 'undefined' && audio.stopRadiatorFan) audio.stopRadiatorFan();
                }
                if (typeof audio !== 'undefined' && typeof audio.updateLivingBusAcoustics === 'function') {
                    audio.updateLivingBusAcoustics(0, 0, false, 0, 0, chassisRigidity, isArticulated);
                }
                return;
            }

            // 3. 24V ALTERNATÖR ŞARJ SİSTEMİ (Motor çalışırken 28.2V - 28.4V arası canlı regülasyon)
            const targetVolt = 28.3 - (game.isHeadlightsOn ? 0.1 : 0.0) - (this.fanActive ? 0.1 : 0.0);
            game.batteryVoltage += (targetVolt - game.batteryVoltage) * 1.8 * deltaTime;

            // 4. SOĞUK MOTOR RÖLANTİSİ (Cold Idle) VE KOMPRESÖR YÜKÜ NEFESİ
            const coldExtraRPM = (game.engineCoolantTemp < 68) ? Math.round((68 - game.engineCoolantTemp) * 3.2) : 0;
            const compressorLoadRPM = (typeof game.airPressure === 'number' && game.airPressure < 108) ? 35 : 0;
            const breatheOsc = Math.sin(Date.now() / 650) * 8; // Doğal dizel rölanti nabzı (±8 RPM)
            game.dynamicIdleRPM = Math.round(770 + coldExtraRPM + compressorLoadRPM + breatheOsc);

            // Motor çalışırken yağ basıncı devire göre 3.5 - 5.5 bar arası (Motor hasarlıysa yağ basıncı düşer)
            const rpm = game.engineRPM || game.dynamicIdleRPM || 800;
            const engineDmg = (game.busDamage && typeof game.busDamage.engine === 'number') ? game.busDamage.engine : 0;
            const oilLoss = (engineDmg / 100) * 1.2;
            game.engineOilPressure = Math.max(1.5, Math.min(5.5, 3.2 + (rpm / 2500) * 2.2 - oilLoss));

            // 5. CANLI TURBOŞARJ BASINCI (0.0 - 2.4 Bar) VE AKUSTİK NEFES
            const isThrottle = !!(game.keys && (game.keys.w || game.keys.arrowup));
            const slope = (typeof game.currentSlopePct === 'number') ? game.currentSlopePct : 0;
            let targetBoost = 0.05;
            if (isThrottle && rpm > 1000) {
                const rpmFactor = Math.min(1.0, Math.max(0.0, (rpm - 1000) / 1300));
                const hillLoad = (slope > 0) ? Math.min(0.45, slope * 0.06) : 0;
                const healthFactor = Math.max(0.6, 1.0 - (engineDmg * 0.004));
                targetBoost = Math.min(2.4, (0.45 + rpmFactor * 1.55 + hillLoad) * healthFactor);
            }
            const spoolSpeed = (targetBoost > game.turboBoostBar) ? 2.6 : 4.2;
            game.turboBoostBar += (targetBoost - game.turboBoostBar) * spoolSpeed * deltaTime;
            game.turboBoostBar = Math.max(0.0, Math.min(2.4, game.turboBoostBar));

            if (typeof audio !== 'undefined' && typeof audio.updateLivingBusAcoustics === 'function') {
                audio.updateLivingBusAcoustics(
                    game.speed || 0,
                    rpm,
                    isThrottle,
                    game.turboBoostBar,
                    game.steeringAngle || 0,
                    chassisRigidity,
                    isArticulated
                );
            }

            // Isı Üretimi:
            // 1. Gaz verme yükü ve motor hasarı etkisi
            let heatGeneration = isThrottle ? 0.45 : 0.05;
            if (engineDmg > 0) {
                heatGeneration += (engineDmg * 0.005); // Hasarlı motor ve radyatör daha çabuk ısınır
            }

            // 2. Yüksek devir ve sürat
            if (rpm > 1800) heatGeneration += 0.25;
            if (game.speed > 70) heatGeneration += 0.20;

            // 3. Eğim tırmanışı (Aşama 1 Topoğrafya eğimi)
            if (slope > 2) {
                heatGeneration += (slope * 0.12); // Dik rampada motor hararet yapar
            }

            // 4. Retarder uzun süreli frenleme ısısı
            if (game.retarderLevel && game.retarderLevel > 0 && game.speed > 25) {
                heatGeneration += (game.retarderLevel * 0.08);
            }

            // Arka plan sessiz akıllı motor yönetimi
            const activeChip = (typeof BusFleet !== 'undefined' && BusFleet.getBusChip) ? BusFleet.getBusChip(null, game) : null;
            const chipWearMult = (activeChip && activeChip.activeMode) ? activeChip.activeMode.wearMultiplier : 1.0;
            const chipHeatOffset = (activeChip && activeChip.activeMode) ? activeChip.activeMode.heatOffset : 0.0;

            // 5. Dik yokuş aşağı retardersiz sürekli ayak freni kullanımı -> Fren balataları aşınması
            if (game.busDamage && slope <= -2.5 && game.isBrakeKeyDown && (!game.retarderLevel || game.retarderLevel === 0) && game.speed > 35) {
                game.busDamage.brakes = Math.min(100, (game.busDamage.brakes || 0) + (0.45 * chipWearMult * deltaTime));
            }

            // 6. Aşırı devirde (>2450 RPM) uzun süre zorlama -> Şanzıman hafif aşınma
            if (game.busDamage && rpm > 2450 && isThrottle) {
                game.busDamage.transmission = Math.min(100, (game.busDamage.transmission || 0) + (0.15 * chipWearMult * deltaTime));
            }

            // Isı Dağılımı / Doğal Soğuma:
            // Rüzgar ve araç hızına bağlı doğal hava soğutması
            const ramAirCooling = (game.speed / 100) * 0.35;
            
            // Taban termostat dengesi
            const targetThermostatTemp = 89.0 + chipHeatOffset;
            const thermostatCooling = (game.engineCoolantTemp > targetThermostatTemp) ? (game.engineCoolantTemp - targetThermostatTemp) * 0.12 : 0;

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

            // Aşırı Hararet (110°C üzeri) -> Sessiz termal koruma ve motor bloğu yıpranması
            if (game.engineCoolantTemp >= 110.0 && game.busDamage) {
                game.engineCoolantTemp -= (0.45 * deltaTime);
                game.busDamage.engine = Math.min(100, (game.busDamage.engine || 0) + (0.15 * chipWearMult * deltaTime));
                game.busDamage.health = Math.max(0, (game.busDamage.health || 100) - (0.08 * chipWearMult * deltaTime));
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
            const turbo = (typeof game.turboBoostBar === 'number') ? game.turboBoostBar.toFixed(1) : "0.0";
            const volt = (typeof game.batteryVoltage === 'number') ? game.batteryVoltage.toFixed(1) : "28.3";
            const cabinT = (typeof game.cabinTemperature === 'number') ? game.cabinTemperature.toFixed(1) : "21.5";
            const airPsi = Math.round((typeof game.airPressure === 'number') ? game.airPressure : 120);
            const passCount = game.passengersOnBoard || 0;
            
            // Aktif otobüsün gerçek fabrika boş ağırlığı ve brüt tonaj hesabı
            const activeBus = (typeof BusFleet !== 'undefined' && BusFleet.getSelectedBus) ? BusFleet.getSelectedBus() : null;
            const physSpecs = (typeof BusFleet !== 'undefined' && BusFleet.getBusPhysicsSpecs) ? BusFleet.getBusPhysicsSpecs(activeBus) : { emptyWeightTon: 12.0, engineHP: 300, torqueNm: 1200, gearCount: 6 };
            const baseTon = physSpecs.emptyWeightTon || 12.0;
            const perPassengerTon = (activeBus && activeBus.category === 'seyahat') ? 0.095 : 0.075;
            const grossTon = (baseTon + (passCount * perPassengerTon)).toFixed(1);
            
            const fanStatus = this.fanActive ? "Radyatör fanı aktif soğutmada." : "Radyatör fanı kapalı.";
            
            const report = `Saat ${curHH}:${curMM}. Tarife: ${rush.status}. Otobüs doluluğu: ${passCount} yolcu, toplam ağırlık ${grossTon} ton. Kabin iç sıcaklığı ${cabinT} derece. Motor harareti ${temp} derece. ${fanStatus} Yağ basıncı ${oil} bar, turbo basıncı ${turbo} bar, hava tüpü ${airPsi} PSI, akü voltajı ${volt} volt.`;

            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(report);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion("📊 " + report);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`📊 Hararet: ${temp}°C | Turbo: ${turbo} bar | Kabin: ${cabinT}°C | ${volt}V`, "info");
            }
        }
    };

    window.PowertrainDynamicsEngine = PowertrainDynamicsEngine;

})(typeof window !== 'undefined' ? window : globalThis);

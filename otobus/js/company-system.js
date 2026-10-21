/**
 * company-system.js - Kendi Otobüs Şirketini Kurma, Şoför Kiralama, Tecrübe & Rütbe Terfi Sistemi
 * Şoförler sefere çıktıkça Stajyerlikten Baş Kaptanlığa yükselir, tecrübe kazandıkça şirkete servet kazandırır!
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const CompanySystem = {
        STORAGE_KEY: 'otobus_company_data',
        data: {
            companyName: "Mikyas Seyahat & Turizm",
            foundedDate: Date.now(),
            totalRevenue: 0,
            completedTripsCount: 0,
            hiredDrivers: []
        },

        // Şoför Rütbe ve Terfi Basamakları (Stajyerden Baş Kaptanlığa)
        ranks: [
            { level: 1, title: "Stajyer Şoför", badge: "🌱", reqXP: 0, speedMod: 0.95, bonusRev: 1.0, desc: "Mesleğe yeni adım atmış, acemi ama hevesli çırak şoför." },
            { level: 2, title: "Yardımcı Kaptan", badge: "🔰", reqXP: 120, speedMod: 1.05, bonusRev: 1.15, desc: "Yolları öğrenmiş, şehir içi ve ilçeler arası hatta güvenilir yardımcı şoför." },
            { level: 3, title: "Kaptan Şoför", badge: "🚌", reqXP: 350, speedMod: 1.15, bonusRev: 1.30, desc: "Tam yetkili usta kaptan. Şehirlerarası uzun yollarda yolcu güvenini kazanır." },
            { level: 4, title: "Kıdemli Uzun Yol Kaptanı", badge: "⭐", reqXP: 800, speedMod: 1.25, bonusRev: 1.50, desc: "Bolu Dağı ve kar kış demeden her yolda tecrübesini konuşturan kıdemli kurt şoför." },
            { level: 5, title: "Baş Kaptan & Filo Ustası", badge: "👑", reqXP: 1600, speedMod: 1.35, bonusRev: 1.80, desc: "Şirketin gözbebeği efsane kaptan. En yüksek hasılatı ve maksimum bahşişi toplar." }
        ],

        // Şoför Pazarında Kiralanabilecek Kaptanlar
        driverMarket: [
            {
                id: "drv_murat",
                name: "Murat Çırak",
                avatar: "👨‍💼",
                startRankLevel: 1,
                startXP: 0,
                wagePerTrip: 150,
                hireFee: 300,
                desc: "Genç ve çok istekli. Stajyer olarak başlar, sefere gönderdikçe hızlıca pişer!",
                specialty: "Hızlı Öğrenme & Düşük Maliyet"
            },
            {
                id: "drv_mehmet",
                name: "Mehmet Kaptan",
                avatar: "👨‍✈️",
                startRankLevel: 2,
                startXP: 140,
                wagePerTrip: 280,
                hireFee: 650,
                desc: "Yardımcı kaptanlıktan ustalığa geçiş aşamasında, seri ve enerjik bir şoför.",
                specialty: "Seri Seferler & Atik Sürüş"
            },
            {
                id: "drv_ayse",
                name: "Ayşe Kaptan",
                avatar: "👩‍✈️",
                startRankLevel: 2,
                startXP: 220,
                wagePerTrip: 350,
                hireFee: 850,
                desc: "Çok titiz ve kibar. Yolcuların konforunu yüksek tutar, VIP serviste parlar.",
                specialty: "Yüksek Yolcu Memnuniyeti & Bahşiş"
            },
            {
                id: "drv_ahmet",
                name: "Ahmet Kaptan",
                avatar: "👨‍✈️",
                startRankLevel: 3,
                startXP: 450,
                wagePerTrip: 420,
                hireFee: 1200,
                desc: "Doğu ve Karadeniz yollarında tecrübeli usta kaptan. Ağır kış şartlarında bile kusursuz.",
                specialty: "Uzun Yol Maratonu & Güvenlik"
            },
            {
                id: "drv_kemal",
                name: "Kemal Usta",
                avatar: "🧔",
                startRankLevel: 4,
                startXP: 950,
                wagePerTrip: 550,
                hireFee: 1800,
                desc: "Eski toprak otogar çınarı. Baş Kaptanlığa ramak kalmış bir karayolu efsanesi.",
                specialty: "Ağır Yol Şartları & Filo Öncüsü"
            }
        ],

        // Şirket Sefer Rotaları
        availableRoutes: [
            {
                id: "route_corlu",
                name: "Süleymanpaşa ➔ Çorlu - Çerkezköy (Sanayi Ring)",
                distKm: 45,
                minRankLevel: 1,
                baseDurationSeconds: 65, // ~1 dakika
                baseTicketPrice: 70,
                avgPassengers: 32,
                fuelCost: 150,
                xpReward: 40,
                desc: "Çırak ve stajyer şoförlerin tecrübe kazanması için ideal hızlı başlangıç hattı."
            },
            {
                id: "route_ist",
                name: "Tekirdağ ➔ İstanbul (Esenler Otogar)",
                distKm: 135,
                minRankLevel: 2,
                baseDurationSeconds: 110, // ~1.8 dakika
                baseTicketPrice: 190,
                avgPassengers: 38,
                fuelCost: 350,
                xpReward: 90,
                desc: "Marmara koridorunda yoğun yolcu talebi olan akıcı ve karlı hat."
            },
            {
                id: "route_izm",
                name: "Tekirdağ ➔ Bursa - İzmir (Ege Turu)",
                distKm: 420,
                minRankLevel: 3,
                baseDurationSeconds: 180, // ~3 dakika
                baseTicketPrice: 420,
                avgPassengers: 40,
                fuelCost: 750,
                xpReward: 160,
                desc: "Çanakkale Köprüsü geçişli popüler Ege hattı."
            },
            {
                id: "route_ank",
                name: "Tekirdağ ➔ Ankara (AŞTİ Başkent Ekspresi)",
                distKm: 585,
                minRankLevel: 4,
                baseDurationSeconds: 230, // ~3.8 dakika
                baseTicketPrice: 480,
                avgPassengers: 44,
                fuelCost: 980,
                xpReward: 220,
                desc: "Bolu Dağı geçişli yüksek hasılatlı prestijli başkent hattı."
            },
            {
                id: "route_erz",
                name: "Tekirdağ ➔ Erzurum (Palandöken Doğu Seferi)",
                distKm: 1360,
                minRankLevel: 4,
                baseDurationSeconds: 380, // ~6.3 dakika
                baseTicketPrice: 900,
                avgPassengers: 46,
                fuelCost: 1950,
                xpReward: 380,
                desc: "Türkiye'nin en uzun ve en çok XP veren maraton hattı. Devasa ciro getirir."
            }
        ],

        simulationTimer: null,

        init: function () {
            this.loadData();

            // İlk açılışta eğer hiç şoför yoksa başlangıç çırağını hediye et
            if (this.data.hiredDrivers.length === 0) {
                this.hireDriver("drv_murat", true);
            }

            // Arka planda sefer ilerletme döngüsü (Her 2 saniyede bir)
            if (!this.simulationTimer) {
                this.simulationTimer = setInterval(() => {
                    this.tickSimulation(2);
                }, 2000);
            }

            console.log("[CompanySystem] Tecrübe & Terfi sistemi hazır. Şirket:", this.data.companyName);
        },

        // Verileri Yükle
        loadData: function () {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.data = Object.assign(this.data, parsed);
                }
            } catch (e) {
                console.warn("[CompanySystem] Yükleme hatası:", e);
            }
        },

        // Verileri Kaydet
        saveData: function () {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.warn("[CompanySystem] Kaydetme hatası:", e);
            }
        },

        // Şoförün Rütbe Bilgisini Getir
        getDriverRankInfo: function (driver) {
            const lvl = driver.rankLevel || 1;
            return this.ranks.find(r => r.level === lvl) || this.ranks[0];
        },

        // Şoförün Sonraki Rütbeye Kalan XP Hedefi
        getNextRankXP: function (currentLvl) {
            const nextRank = this.ranks.find(r => r.level === currentLvl + 1);
            return nextRank ? nextRank.reqXP : 99999;
        },

        // Şirket Adını Güncelle
        setCompanyName: function (newName) {
            if (!newName || !newName.trim()) return;
            this.data.companyName = newName.trim().substring(0, 40);
            this.saveData();

            const msg = `Şirketinizin adı '${this.data.companyName}' olarak güncellendi.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 ${msg}`, "success");
            this.renderCompanyOverview();
        },

        // Şoför Kirala
        hireDriver: function (driverId, isFreeGift = false) {
            const driverInfo = this.driverMarket.find(d => d.id === driverId);
            if (!driverInfo) return false;

            // Zaten kiralanmış mı?
            if (this.data.hiredDrivers.some(d => d.id === driverId)) {
                if (typeof UI !== 'undefined') UI.showToast("Bu şoför zaten şirketinizde çalışıyor.", "warning");
                return false;
            }

            // Bütçe kontrolü
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (!isFreeGift && currentBudget < driverInfo.hireFee) {
                const msg = `Yetersiz bakiye! ${driverInfo.name} transferi için ${driverInfo.hireFee} ₺ gerekiyor. Bakiyeniz: ${currentBudget} ₺.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined') UI.showToast(msg, "warning");
                return false;
            }

            // Parayı düş
            if (!isFreeGift && typeof Game !== 'undefined') {
                Game.playerBudget -= driverInfo.hireFee;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            const initialRankLvl = driverInfo.startRankLevel || 1;
            const rankObj = this.ranks.find(r => r.level === initialRankLvl) || this.ranks[0];

            // Şoförü şirkete ekle
            const hiredObj = {
                id: driverInfo.id,
                name: driverInfo.name,
                avatar: driverInfo.avatar,
                rankLevel: initialRankLvl,
                rankTitle: rankObj.title,
                rankBadge: rankObj.badge,
                currentXP: driverInfo.startXP || 0,
                wagePerTrip: driverInfo.wagePerTrip,
                status: "idle", // idle, on_trip, resting
                assignedBusName: "Otokar Kent LF",
                assignedRouteId: null,
                currentTripSeconds: 0,
                targetDurationSeconds: 100,
                totalTripsMade: 0,
                totalEarningsMade: 0,
                autoDispatch: true
            };

            this.data.hiredDrivers.push(hiredObj);
            this.saveData();

            // İlk seferini başlat
            this.dispatchDriver(driverInfo.id, "route_corlu");

            const successMsg = isFreeGift 
                ? `Hayırlı olsun! Başlangıç çırağınız ${driverInfo.name} (${rankObj.badge} ${rankObj.title}) şirketinize katıldı! Sefere çıktıkça tecrübe kazanıp yükselecek.`
                : `Transfer başarılı! ${driverInfo.name} (${rankObj.badge} ${rankObj.title}) ${driverInfo.hireFee} ₺ bedelle şirketinize katıldı.`;

            if (typeof audio !== 'undefined' && audio.speak) audio.speak(successMsg);
            if (typeof UI !== 'undefined') UI.showToast(`🎉 ${successMsg}`, "success");

            this.renderAll();
            return true;
        },

        // Şoförü Sefere Çıkart
        dispatchDriver: function (driverId, routeId) {
            const driver = this.data.hiredDrivers.find(d => d.id === driverId);
            const route = this.availableRoutes.find(r => r.id === routeId);
            if (!driver || !route) return;

            // UZUN YOL EHLİYET VE RÜTBE KORUMASI: Stajyer şoförler uzun yola çıkamaz!
            if (route.minRankLevel && (driver.rankLevel || 1) < route.minRankLevel) {
                const reqRank = this.ranks.find(r => r.level === route.minRankLevel);
                const reqTitle = reqRank ? reqRank.title : `${route.minRankLevel}. Seviye Kaptan`;
                const warnMsg = `Uzun Yol Tecrübesi Yetersiz: ${driver.name} henüz ${driver.rankTitle} seviyesinde! ${route.name} uzun yol seferine çıkabilmek için en az ${reqTitle} tecrübesi şarttır.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`⛔ ${warnMsg}`, "warning");
                return false;
            }

            const rankInfo = this.getDriverRankInfo(driver);
            const speedMod = rankInfo.speedMod || 1.0;
            const actualDuration = Math.max(30, Math.round(route.baseDurationSeconds / speedMod));

            driver.status = "on_trip";
            driver.assignedRouteId = route.id;
            driver.currentTripSeconds = 0;
            driver.targetDurationSeconds = actualDuration;
            this.saveData();

            const msg = `${driver.rankBadge} ${driver.name}, ${route.name} seferine çıktı. Tahmini varış: ${Math.round(actualDuration / 60)} dakika.`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🚌 ${msg}`, "info");
            this.renderAll();
        },

        // Arka Plan Sefer Simülasyonu
        tickSimulation: function (deltaSec) {
            if (!this.data.hiredDrivers || this.data.hiredDrivers.length === 0) return;

            let stateChanged = false;

            this.data.hiredDrivers.forEach(driver => {
                if (driver.status === 'on_trip') {
                    driver.currentTripSeconds = (driver.currentTripSeconds || 0) + deltaSec;

                    // Sefer tamamlandı mı?
                    if (driver.currentTripSeconds >= driver.targetDurationSeconds) {
                        this.completeDriverTrip(driver);
                        stateChanged = true;
                    } else {
                        stateChanged = true;
                    }
                } else if (driver.status === 'resting') {
                    driver.restRemainingSeconds = (driver.restRemainingSeconds || 15) - deltaSec;
                    if (driver.restRemainingSeconds <= 0) {
                        driver.status = 'idle';
                        if (driver.autoDispatch && driver.assignedRouteId) {
                            this.dispatchDriver(driver.id, driver.assignedRouteId);
                        }
                        stateChanged = true;
                    }
                }
            });

            if (stateChanged) {
                this.updateLiveTripProgressUI();
            }
        },

        // Sefer Tamamlandığında XP ve Terfi Kontrolü
        completeDriverTrip: function (driver) {
            const route = this.availableRoutes.find(r => r.id === driver.assignedRouteId) || this.availableRoutes[0];
            const rankInfo = this.getDriverRankInfo(driver);

            // Ciro hesabı: Yolcu x Bilet x Rütbe Bonus Çarpanı
            const bonusRev = rankInfo.bonusRev || 1.0;
            const passengerCount = route.avgPassengers + Math.floor(Math.random() * 5);
            const grossRevenue = Math.round(passengerCount * route.baseTicketPrice * bonusRev);

            // Giderler: Maaş + Yakıt
            const wage = driver.wagePerTrip || 250;
            const fuel = route.fuelCost || 300;
            const netProfit = Math.max(120, grossRevenue - (wage + fuel));

            // Kasaya parayı ekle
            if (typeof Game !== 'undefined') {
                Game.playerBudget = (Game.playerBudget || 0) + netProfit;
                Game.saveData();

                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            // XP Kazanımı
            const gainedXP = route.xpReward || 50;
            driver.currentXP = (driver.currentXP || 0) + gainedXP;
            driver.totalTripsMade = (driver.totalTripsMade || 0) + 1;
            driver.totalEarningsMade = (driver.totalEarningsMade || 0) + netProfit;
            driver.status = "resting";
            driver.restRemainingSeconds = 12; // 12 saniye mola
            this.data.totalRevenue = (this.data.totalRevenue || 0) + netProfit;
            this.data.completedTripsCount = (this.data.completedTripsCount || 0) + 1;

            // RÜTBE TERFİ KONTROLÜ (Stajyerden Baş Kaptanlığa!)
            let hasLeveledUp = false;
            let currentLvl = driver.rankLevel || 1;

            if (currentLvl < 5) {
                const nextRank = this.ranks.find(r => r.level === currentLvl + 1);
                if (nextRank && driver.currentXP >= nextRank.reqXP) {
                    driver.rankLevel = nextRank.level;
                    driver.rankTitle = nextRank.title;
                    driver.rankBadge = nextRank.badge;
                    hasLeveledUp = true;
                }
            }

            this.saveData();

            // Kutlama ve Bildirimler
            if (hasLeveledUp) {
                if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();
                const levelMsg = `🎖️ TEBRİKLER! ${driver.name} sefere çıktıkça tecrübe kazandı ve '${driver.rankBadge} ${driver.rankTitle}' rütbesine yükseldi! Sefer hızı ve hasılatı arttı!`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(levelMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(levelMsg, "success");
            } else {
                if (typeof audio !== 'undefined' && audio.playCashChime) {
                    audio.playCashChime();
                } else if (typeof audio !== 'undefined' && audio.playSuccess) {
                    audio.playSuccess();
                }

                const alertMsg = `💰 [${this.data.companyName}] ${driver.rankBadge} ${driver.name}, ${route.name} seferini bitirdi! Kasaya net +${netProfit.toLocaleString('tr-TR')} ₺ eklendi (+${gainedXP} XP).`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(alertMsg, "success");
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(`${driver.name} seferini bitirdi. Kasanıza net ${netProfit} lira aktarıldı.`);
                }
            }

            this.renderAll();
        },

        // Şirket Modalını Aç
        openCompanyModal: function () {
            this.injectModal();
            const modal = document.getElementById('company-system-modal');
            if (!modal) return;

            modal.classList.remove('hidden');
            this.renderAll();

            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }

            const introMsg = `Otobüs Şirketiniz '${this.data.companyName}' yönetim paneli açıldı. Toplam ${this.data.hiredDrivers.length} şoförünüz bulunuyor.`;
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(introMsg);
            }
        },

        // Şirket Modalını Kapat
        closeCompanyModal: function () {
            const modal = document.getElementById('company-system-modal');
            if (modal) modal.classList.add('hidden');
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        },

        // DOM'a Şirket Modalını Enjekte Et
        injectModal: function () {
            if (document.getElementById('company-system-modal')) return;

            const modalHtml = `
            <div id="company-system-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="company-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 8600; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="glass-panel" style="max-width: 860px; width: 95%; padding: 24px 28px; text-align: left; max-height: 90vh; overflow-y: auto; border: 2px solid #ca8a04; box-shadow: 0 0 35px rgba(202, 138, 4, 0.3);">
                    
                    <!-- Başlık ve Kapatma -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <h2 id="company-modal-title" style="font-size: 1.8rem; margin: 0; color: #facc15;">
                                🏢 Otobüs Şirketim & Kaptan Terfi Sistemi
                            </h2>
                            <p style="color: #cbd5e1; font-size: 0.95rem; margin: 4px 0 0 0;">
                                Şoförlerinizi sefere gönderin; stajyerlikten baş kaptanlığa yükselip şirketinizi büyütsünler!
                            </p>
                        </div>
                        <button id="btn-close-company-modal" class="modern-btn nav-item" style="padding: 6px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; cursor: pointer;" aria-label="Şirket Menüsünü Kapat (Esc)">✕ Kapat</button>
                    </div>

                    <!-- Şirket Bilgi ve İstatistik Kartı -->
                    <div id="company-overview-card" style="background: linear-gradient(135deg, rgba(202, 138, 4, 0.2), rgba(161, 98, 7, 0.3)); border: 1.5px solid #eab308; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;">
                        <!-- Dinamik doldurulacak -->
                    </div>

                    <!-- Sekme Butonları -->
                    <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
                        <button id="tab-company-trips" class="modern-btn nav-item" style="flex: 1; padding: 10px; font-weight: bold; background: rgba(234, 179, 8, 0.3); border: 1.5px solid #facc15; color: #fff; cursor: pointer;">
                            🚍 Şoförlerim & Sefer Terfileri
                        </button>
                        <button id="tab-company-market" class="modern-btn nav-item" style="flex: 1; padding: 10px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer;">
                            👨‍✈️ Şoför Pazarı (Yeni Kaptan Alımı)
                        </button>
                    </div>

                    <!-- 1. SEKME: Aktif Seferler ve Şoförler Listesi -->
                    <div id="panel-company-trips" style="display: block;">
                        <div id="company-hired-list" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 2. SEKME: Şoför Pazarı Listesi -->
                    <div id="panel-company-market" style="display: none;">
                        <div id="company-market-list" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Kapat butonu
            document.getElementById('btn-close-company-modal').addEventListener('click', () => {
                this.closeCompanyModal();
            });

            // Sekme geçişleri
            const tabTrips = document.getElementById('tab-company-trips');
            const tabMarket = document.getElementById('tab-company-market');
            const panelTrips = document.getElementById('panel-company-trips');
            const panelMarket = document.getElementById('panel-company-market');

            tabTrips.addEventListener('click', () => {
                tabTrips.style.background = 'rgba(234, 179, 8, 0.3)';
                tabTrips.style.borderColor = '#facc15';
                tabTrips.style.color = '#fff';

                tabMarket.style.background = 'rgba(255,255,255,0.06)';
                tabMarket.style.borderColor = 'rgba(255,255,255,0.2)';
                tabMarket.style.color = '#94a3b8';

                panelTrips.style.display = 'block';
                panelMarket.style.display = 'none';
            });

            tabMarket.addEventListener('click', () => {
                tabMarket.style.background = 'rgba(234, 179, 8, 0.3)';
                tabMarket.style.borderColor = '#facc15';
                tabMarket.style.color = '#fff';

                tabTrips.style.background = 'rgba(255,255,255,0.06)';
                tabTrips.style.borderColor = 'rgba(255,255,255,0.2)';
                tabTrips.style.color = '#94a3b8';

                panelMarket.style.display = 'block';
                panelTrips.style.display = 'none';
            });
        },

        // Tüm Paneli Render Et
        renderAll: function () {
            this.renderCompanyOverview();
            this.renderHiredDrivers();
            this.renderDriverMarket();
        },

        // Şirket Başlık Kartını Render Et
        renderCompanyOverview: function () {
            const card = document.getElementById('company-overview-card');
            if (!card) return;

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            const hiredCount = this.data.hiredDrivers.length;
            const revFormatted = (this.data.totalRevenue || 0).toLocaleString('tr-TR');

            card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <div style="color: #fde047; font-size: 1.3rem; font-weight: bold;">
                        🏢 ${this.data.companyName}
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.9rem; margin-top: 2px;">
                        Kayıtlı Şoför Sayısı: <strong style="color: #38bdf8;">${hiredCount} Kaptan</strong> | Tamamlanan Sefer: <strong style="color: #4ade80;">${this.data.completedTripsCount}</strong>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #4ade80; font-size: 1.25rem; font-weight: bold;">
                        💰 Toplam Gelir: ${revFormatted} ₺
                    </div>
                    <div style="color: #fde047; font-size: 0.95rem;">
                        Şirket Kasası: <strong>${currentBudget.toLocaleString('tr-TR')} ₺</strong>
                    </div>
                </div>
            </div>
            `;
        },

        // Kiralanmış Şoförleri, XP İlerlemesini ve Rütbelerini Render Et
        renderHiredDrivers: function () {
            const container = document.getElementById('company-hired-list');
            if (!container) return;

            container.innerHTML = '';

            if (this.data.hiredDrivers.length === 0) {
                container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #94a3b8; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    Henüz hiç şoför kiralamadınız. 'Şoför Pazarı' sekmesinden hemen ilk çırağınızı veya kaptanınızı transfer edin!
                </div>`;
                return;
            }

            this.data.hiredDrivers.forEach(driver => {
                const route = this.availableRoutes.find(r => r.id === driver.assignedRouteId) || this.availableRoutes[0];
                const rankInfo = this.getDriverRankInfo(driver);
                const nextXP = this.getNextRankXP(rankInfo.level);
                const prevXP = rankInfo.reqXP;
                const xpSpan = Math.max(1, nextXP - prevXP);
                const curXPInLvl = Math.max(0, (driver.currentXP || 0) - prevXP);
                const xpPct = (rankInfo.level >= 5) ? 100 : Math.min(100, Math.round((curXPInLvl / xpSpan) * 100));

                const tripProgressPct = driver.targetDurationSeconds > 0 
                    ? Math.min(100, Math.round(((driver.currentTripSeconds || 0) / driver.targetDurationSeconds) * 100))
                    : 0;

                const statusColor = (driver.status === 'on_trip') ? '#4ade80' : ((driver.status === 'resting') ? '#facc15' : '#38bdf8');
                const statusLabel = (driver.status === 'on_trip') 
                    ? `🛣️ Seferde (%${tripProgressPct})` 
                    : ((driver.status === 'resting') ? `☕ Mola Veriyor (${driver.restRemainingSeconds || 0}s)` : `🅿️ Garajda Bekliyor`);

                const div = document.createElement('div');
                div.style.cssText = "background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px; margin-bottom: 12px;";
                div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <strong style="color: #fff; font-size: 1.15rem;">${driver.avatar} ${driver.name}</strong> 
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; background: rgba(202, 138, 4, 0.25); border: 1px solid #facc15; color: #fde047; margin-left: 6px;">
                            ${rankInfo.badge} Seviye ${rankInfo.level}: ${rankInfo.title}
                        </span>
                    </div>
                    <div>
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; background: rgba(255,255,255,0.1); color: ${statusColor};">
                            ${statusLabel}
                        </span>
                    </div>
                </div>

                <!-- Şoförün Tecrübe (XP) İlerleme Çubuğu -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 2px;">
                        <span>Kaptan Tecrübesi (XP): <strong>${driver.currentXP || 0} XP</strong></span>
                        <span>${rankInfo.level >= 5 ? '👑 Maksimum Ustalık' : `Sonraki Terfiye: ${(nextXP - (driver.currentXP || 0))} XP`}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.5); border-radius: 6px; height: 6px; width: 100%; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #38bdf8, #818cf8); height: 100%; width: ${xpPct}%;"></div>
                    </div>
                </div>

                <div style="color: #38bdf8; font-size: 0.95rem; margin-bottom: 6px;">
                    📍 <strong>Aktif Hat:</strong> ${route.name}
                </div>

                <!-- Sefer İlerleme Çubuğu -->
                <div style="background: rgba(0,0,0,0.5); border-radius: 6px; height: 10px; width: 100%; overflow: hidden; margin-bottom: 8px;">
                    <div id="prog-bar-${driver.id}" style="background: linear-gradient(90deg, #ca8a04, #facc15); height: 100%; width: ${tripProgressPct}%; transition: width 0.3s;"></div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #cbd5e1; flex-wrap: wrap; gap: 8px;">
                    <div>
                        Sefer: <strong>${driver.totalTripsMade || 0}</strong> | Kazandırdığı: <strong style="color: #4ade80;">${(driver.totalEarningsMade || 0).toLocaleString('tr-TR')} ₺</strong> | Gelir Çarpanı: <strong style="color: #facc15;">${rankInfo.bonusRev}x</strong>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <select id="route-select-${driver.id}" class="modern-btn" style="padding: 4px 8px; font-size: 0.85rem; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px;">
                            ${this.availableRoutes.map(r => `<option value="${r.id}" ${r.id === driver.assignedRouteId ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>
                        <button id="btn-change-route-${driver.id}" class="modern-btn nav-item" style="padding: 4px 10px; background: #0284c7; border: 1px solid #38bdf8; color: #fff; font-size: 0.85rem; cursor: pointer; border-radius: 6px;">Hattı Ata</button>
                    </div>
                </div>
                `;

                container.appendChild(div);

                // Hat değiştirme olayı
                div.querySelector(`#btn-change-route-${driver.id}`).addEventListener('click', () => {
                    const sel = div.querySelector(`#route-select-${driver.id}`);
                    const newRouteId = sel.value;
                    this.dispatchDriver(driver.id, newRouteId);
                });
            });
        },

        // İlerleme Çubuklarını Canlı Tazele
        updateLiveTripProgressUI: function () {
            if (!this.data.hiredDrivers) return;
            this.data.hiredDrivers.forEach(driver => {
                const bar = document.getElementById(`prog-bar-${driver.id}`);
                if (bar && driver.targetDurationSeconds > 0) {
                    const pct = Math.min(100, Math.round(((driver.currentTripSeconds || 0) / driver.targetDurationSeconds) * 100));
                    bar.style.width = pct + '%';
                }
            });
        },

        // Şoför Pazarını Render Et
        renderDriverMarket: function () {
            const container = document.getElementById('company-market-list');
            if (!container) return;

            container.innerHTML = '';

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;

            this.driverMarket.forEach(d => {
                const isHired = this.data.hiredDrivers.some(hd => hd.id === d.id);
                const canAfford = currentBudget >= d.hireFee;
                const startRank = this.ranks.find(r => r.level === d.startRankLevel) || this.ranks[0];

                const div = document.createElement('div');
                div.style.cssText = "background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;";
                div.innerHTML = `
                <div>
                    <div style="font-size: 1.15rem; font-weight: bold; color: #fff;">
                        ${d.avatar} ${d.name} <span style="font-size: 0.85rem; color: #facc15; padding: 2px 6px; border-radius: 6px; background: rgba(202, 138, 4, 0.2); border: 1px solid #facc15;">${startRank.badge} ${startRank.title}</span>
                    </div>
                    <div style="color: #38bdf8; font-size: 0.9rem; margin-top: 2px;">
                        Uzmanlık: <strong>${d.specialty}</strong>
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 4px; max-width: 480px;">
                        ${d.desc}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 4px;">
                        Sefer Başı Maaş: <strong style="color: #fbbf24;">${d.wagePerTrip} ₺</strong> | Sefer Çıktıkça Rütbe ve Hasılat Artar!
                    </div>
                </div>

                <div>
                    ${isHired ? `
                        <button class="modern-btn" disabled style="padding: 10px 18px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 8px;">
                            ✓ Şirketinizde
                        </button>
                    ` : `
                        <button id="btn-hire-${d.id}" class="modern-btn nav-item ${canAfford ? 'btn-primary' : ''}" style="padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; ${canAfford ? 'background: #ca8a04; border: 1px solid #facc15; color: #000;' : 'background: rgba(255,255,255,0.08); color: #64748b; border: 1px solid #334155;'}">
                            Transfer Et (${d.hireFee} ₺)
                        </button>
                    `}
                </div>
                `;

                container.appendChild(div);

                if (!isHired) {
                    const btn = div.querySelector(`#btn-hire-${d.id}`);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            this.hireDriver(d.id);
                        });
                    }
                }
            });
        }
    };

    // Global nesneye bağla
    window.CompanySystem = CompanySystem;

    // DOM yüklendiğinde başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CompanySystem.init());
    } else {
        CompanySystem.init();
    }

})();

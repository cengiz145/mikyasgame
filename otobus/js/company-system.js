/**
 * company-system.js - Akıllı Şirket & Filo Yönetimi, Dinamik Borsa, Şoför AI & Otomatik Sefer Optimizasyonu
 * Şoför Karakterleri, Gerçek Araç Tahsisi, Sinerji Algoritmaları, Dinamik Piyasa Talepleri ve Yapay Zeka Filo Müdürü
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const CompanySystem = {
        STORAGE_KEY: 'otobus_company_data_v2',
        COMMUNITY_STORAGE_KEY: 'otobus_community_companies_v1',
        LEGACY_STORAGE_KEY: 'otobus_company_data',

        data: {
            companyName: "Mikyas Seyahat & Turizm",
            foundedDate: Date.now(),
            totalRevenue: 0,
            completedTripsCount: 0,
            companyLevel: 1, // 1: Yazıhane, 2: Bölge Acentesi, 3: Marmara Lojistik, 4: Ulusal Karayolları, 5: Uluslararası Holding
            hqUpgrades: {
                fuelContract: false,       // %20 yakıt tasarrufu
                luxuryLounge: false,       // %50 hızlı şoför dinlenmesi & enerji
                terminalPlatform: false,   // +%25 yolcu talebi
                corporateBrand: false      // +%25 bilet marka primi
            },
            busConditions: {},             // busId -> 0-100 kondisyon
            hiredDrivers: [],
            marketTrends: {},              // routeId -> { multiplier, trendName, icon, desc, expiresAt }
            specialContracts: [],          // Aktif VIP ihaleler
            radioLogs: []                  // Canlı telsiz kayıtları
        },

        // Türkçe Tarih Formatlayıcı
        formatTurkishDate: function(timestamp) {
            try {
                const d = new Date(timestamp || Date.now());
                const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
            } catch(e) {
                return "22 Ekim 2026";
            }
        },

        // Topluluk / Kaptan Şirketlerini Getir
        getCaptainCompanies: function() {
            try {
                const raw = localStorage.getItem(this.COMMUNITY_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch(e) {
                console.warn("[CompanySystem] Kaptan şirketleri okunamadı:", e);
            }
            return [];
        },

        // Yeni Kaptan Şirketi Kaydet / Tescille
        registerCaptainCompany: function(compData) {
            let list = this.getCaptainCompanies();
            const id = compData.id || ('captain_comp_' + Date.now());
            const existingIdx = list.findIndex(c => c.id === id || (c.name && compData.name && c.name.toLowerCase() === compData.name.toLowerCase()));

            const companyObj = {
                id: id,
                name: compData.name || "Kaptan Turizm",
                founder: compData.founder || (typeof Game !== 'undefined' && Game.username) || "Ümit Ekrem Mikyas",
                slogan: compData.slogan || "Özel Kaptan Taşımacılığı",
                logo: compData.logo || "👑",
                badge: "⭐ Kaptan Şirketi",
                color: "#f59e0b",
                city: compData.city || (typeof Game !== 'undefined' && Game.currentCity) || "Tekirdağ (Süleymanpaşa)",
                maxCaptainsQuota: parseInt(compData.maxCaptainsQuota) || 10,
                activeCaptainsCount: parseInt(compData.activeCaptainsCount) || 1,
                dailySalary: parseInt(compData.dailySalary) || 2500,
                bonusPercent: parseInt(compData.bonusPercent) || 18,
                desc: compData.desc || `Kurucu Kaptan ${compData.founder || 'Kaptan'} tarafından kurulan bağımsız filo. Kontenjan: ${compData.maxCaptainsQuota || 10} kaptan, Günlük Maaş: ${(parseInt(compData.dailySalary) || 2500).toLocaleString('tr-TR')} ₺.`,
                minLevel: 1,
                isCaptainCompany: true,
                createdDate: compData.createdDate || Date.now()
            };

            if (existingIdx >= 0) {
                list[existingIdx] = Object.assign(list[existingIdx], companyObj);
            } else {
                list.unshift(companyObj);
            }

            try {
                localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(list));
            } catch(e) {}

            try {
                if (typeof window !== 'undefined' && window.db) {
                    window.db.ref('otobus_simulasyonu/topluluk_sirketleri/' + id).set(companyObj).catch(() => {});
                }
            } catch(e) {}

            return companyObj;
        },

        // Şirket Arama (Kaptan + Kurumsal)
        getCompanyById: function(companyId) {
            if (!companyId) return null;
            const captains = this.getCaptainCompanies();
            const capComp = captains.find(c => c.id === companyId);
            if (capComp) return capComp;
            return this.corporateCompanies.find(c => c.id === companyId) || null;
        },

        // Yeni Şirket Kurma Modalını Aç
        openCreateCompanyModal: function() {
            this.injectCreateCompanyModal();
            const modal = document.getElementById('create-company-modal');
            if (modal) {
                modal.classList.remove('hidden');
                const inpName = document.getElementById('new-comp-name');
                if (inpName) {
                    inpName.value = this.data.companyName || "Mikyas Express Seyahat";
                    inpName.focus();
                }
                const inpFounder = document.getElementById('new-comp-founder');
                if (inpFounder) {
                    inpFounder.value = (typeof Game !== 'undefined' && Game.username) ? Game.username : "Ümit Ekrem Mikyas";
                }
                const inpCity = document.getElementById('new-comp-city');
                if (inpCity) {
                    inpCity.value = (typeof Game !== 'undefined' && Game.currentCity) ? `${Game.currentCity} (${Game.activeDistrict || 'Süleymanpaşa'})` : "Tekirdağ (Süleymanpaşa)";
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Yeni bir şirket kurma penceresi açıldı. Şirketinizin adını, çalıştıracağınız kaptan sayısını ve vereceğiniz günlük maaşı belirleyebilirsiniz.");
                }
            }
        },

        // Yeni Şirket Kurma Modalını Enjekte Et
        injectCreateCompanyModal: function() {
            if (document.getElementById('create-company-modal')) return;

            const modalHtml = `
            <div id="create-company-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="create-comp-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8900; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <div class="glass-panel" style="max-width: 620px; width: 95%; padding: 24px 28px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2px solid #f59e0b; box-shadow: 0 0 45px rgba(245, 158, 11, 0.4); border-radius: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(250, 204, 21, 0.2); padding-bottom: 10px;">
                        <h2 id="create-comp-title" style="margin: 0; font-size: 1.6rem; color: #facc15; display: flex; align-items: center; gap: 8px;">
                            🏢 Yeni Bir Şirket Kur
                        </h2>
                        <button id="btn-close-create-comp-modal" class="modern-btn nav-item" style="padding: 6px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; border-radius: 8px; cursor: pointer;" aria-label="Pencereyi kapat">✕ Kapat</button>
                    </div>

                    <form id="form-create-company" onsubmit="event.preventDefault();" style="display: flex; flex-direction: column; gap: 14px;">
                        <div>
                            <label for="new-comp-name" style="display: block; color: #fde047; font-weight: bold; font-size: 0.95rem; margin-bottom: 4px;">🏢 Şirketinizin Adı:</label>
                            <input id="new-comp-name" type="text" maxlength="40" required placeholder="Örn: Mikyas Seyahat, Trakya Lojistik" style="width: 100%; padding: 10px 14px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #ca8a04; color: #fff; border-radius: 8px; font-size: 1rem; box-sizing: border-box;" />
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label for="new-comp-founder" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">👑 Kurucu Kaptan:</label>
                                <input id="new-comp-founder" type="text" maxlength="30" required style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" />
                            </div>
                            <div>
                                <label for="new-comp-city" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">📍 Merkez Şehir:</label>
                                <input id="new-comp-city" type="text" maxlength="40" style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" />
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label for="new-comp-quota" style="display: block; color: #38bdf8; font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">👥 Kaç Kaptan Çalıştırmak İstiyorsunuz?</label>
                                <input id="new-comp-quota" type="number" min="1" max="100" value="10" required style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #0284c7; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" placeholder="Örn: 10 Kaptan" />
                                <small style="color: #94a3b8; font-size: 0.78rem; display: block; margin-top: 3px;">Kurucu olarak çalıştıracağınız kaptan sayısını siz belirlersiniz.</small>
                            </div>
                            <div>
                                <label for="new-comp-salary" style="display: block; color: #4ade80; font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">💰 Kaptanlara Verilecek Günlük Maaş (₺):</label>
                                <input id="new-comp-salary" type="number" min="500" max="50000" step="100" value="2500" required style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #16a34a; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" placeholder="Örn: 2500 ₺" />
                                <small style="color: #94a3b8; font-size: 0.78rem; display: block; margin-top: 3px;">Kaptanlarınıza ödenecek günlük maaşı siz belirlersiniz.</small>
                            </div>
                        </div>

                        <div>
                            <label for="new-comp-bonus" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">🎁 Sefer Başı Bilet Primi:</label>
                            <select id="new-comp-bonus" style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                                <option value="10">%10 Bilet Satış Primi</option>
                                <option value="15">%15 Bilet Satış Primi</option>
                                <option value="20" selected>%20 Bilet Satış Primi (Tavsiye Edilen)</option>
                                <option value="25">%25 Bilet Satış Primi</option>
                                <option value="30">%30 Yüksek Sefer Primi</option>
                            </select>
                        </div>

                        <div>
                            <label for="new-comp-slogan" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">📢 Şirket Sloganı:</label>
                            <input id="new-comp-slogan" type="text" maxlength="60" value="Türkiye Karayollarında Güven ve Konfor" style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" />
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                            <button id="btn-cancel-create-comp" type="button" class="modern-btn nav-item" style="padding: 10px 20px; background: rgba(255,255,255,0.08); border: 1px solid #64748b; color: #cbd5e1; border-radius: 8px; cursor: pointer;">
                                Vazgeç
                            </button>
                            <button id="btn-submit-create-comp" type="submit" class="modern-btn nav-item" style="padding: 10px 24px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                                🏢 Şirketi Kur ve Tescille
                            </button>
                        </div>
                    </form>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            document.getElementById('btn-close-create-comp-modal').addEventListener('click', () => {
                document.getElementById('create-company-modal').classList.add('hidden');
            });
            document.getElementById('btn-cancel-create-comp').addEventListener('click', () => {
                document.getElementById('create-company-modal').classList.add('hidden');
            });

            document.getElementById('form-create-company').addEventListener('submit', () => {
                const name = document.getElementById('new-comp-name').value.trim();
                const founder = document.getElementById('new-comp-founder').value.trim();
                const city = document.getElementById('new-comp-city').value.trim();
                const quota = document.getElementById('new-comp-quota').value;
                const salary = document.getElementById('new-comp-salary').value;
                const bonus = document.getElementById('new-comp-bonus').value;
                const slogan = document.getElementById('new-comp-slogan').value.trim();

                if (!name) return;

                const compObj = this.registerCaptainCompany({
                    name: name,
                    founder: founder,
                    city: city,
                    maxCaptainsQuota: quota,
                    activeCaptainsCount: 1,
                    dailySalary: salary,
                    bonusPercent: bonus,
                    slogan: slogan
                });

                this.data.companyName = name;
                this.saveData();

                document.getElementById('create-company-modal').classList.add('hidden');

                const succMsg = `Tebrikler! ${name} şirketi başarıyla kuruldu. Kurucu kaptan: ${founder}. Kontenjan: ${quota}, günlük maaş: ${parseInt(salary).toLocaleString('tr-TR')} ₺ olarak tescillendi.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(succMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 ${name} Şirketi Başarıyla Kuruldu!`, "success");

                this.renderAll();

                // Var Olan Şirkete Katıl sekmesine geçip yeni şirketi göstersin
                const tabCorp = document.getElementById('tab-comp-corporate-work');
                if (tabCorp) tabCorp.click();
            });
        },

        // Türkiye'nin Önde Gelen Otobüs Şirketleri (Maaşlı Kaptanlık Modu)
        corporateCompanies: [
            {
                id: "kamil_koc",
                name: "Kâmil Koç Otobüsleri",
                slogan: "Cumhuriyetin İlk Karayolu Firması (1926)",
                logo: "🔵",
                badge: "⭐ Kurumsal Kaptan",
                dailySalary: 3500,
                bonusPercent: 10,
                minLevel: 1,
                desc: "Düzenli hat seferleri, her seferde +%10 garanti bilet primi ve şirket yemek/ikram desteği.",
                color: "#38bdf8"
            },
            {
                id: "pamukkale",
                name: "Pamukkale Turizm",
                slogan: "Keyifli Yolculuk, Pamuk Eller Direksiyona (Jumbo VIP)",
                logo: "🔴",
                badge: "👑 VIP Baş Kaptan",
                dailySalary: 4500,
                bonusPercent: 15,
                minLevel: 2,
                desc: "2+1 Jumbo araç filosu, üstün yolcu konforu ve sefer başına +%15 VIP memnuniyet primi.",
                color: "#f87171"
            },
            {
                id: "metro",
                name: "Metro Turizm",
                slogan: "Aklınızda Neresi Varsa, Orada Bir Metro Var",
                logo: "🔴",
                badge: "⚡ Seri Sefer Kaptanı",
                dailySalary: 3800,
                bonusPercent: 12,
                minLevel: 1,
                desc: "Türkiye'nin en geniş acente ağı, yüksek sefer sıklığı ve sefer başına +%12 ciro primi.",
                color: "#fb923c"
            },
            {
                id: "tekulas",
                name: "TEKULAŞ (Tekirdağ Büyükşehir Belediyesi)",
                slogan: "Halkımızın Hizmetinde Güvenli, Konforlu Şehir İçi Ulaşım",
                logo: "🟡",
                badge: "🏛️ Resmi Belediye Şoförü",
                dailySalary: 3200,
                bonusPercent: 8,
                minLevel: 1,
                desc: "Resmi büyükşehir belediyesi kadrosu, sabit mesai, kamu sosyal hakları ve sendika güvencesi.",
                color: "#facc15"
            },
            {
                id: "varan",
                name: "Varan Turizm",
                slogan: "Türkiye Karayollarının Bir Numaralı Ultra Lüks Efsanesi",
                logo: "🌟",
                badge: "💎 Elit Karayolu Kaptanı",
                dailySalary: 6000,
                bonusPercent: 20,
                minLevel: 3,
                desc: "Business Class ultra lüks seferler, +%20 VIP ciro primi ve yüksek yolcu bahşişleri.",
                color: "#eab308"
            }
        ],

        // Şoför Rütbe ve Terfi Basamakları
        ranks: [
            { level: 1, title: "Stajyer Şoför", badge: "🌱", reqXP: 0, speedMod: 0.95, bonusRev: 1.0, desc: "Mesleğe yeni adım atmış, acemi ama hevesli çırak şoför." },
            { level: 2, title: "Yardımcı Kaptan", badge: "🔰", reqXP: 120, speedMod: 1.05, bonusRev: 1.15, desc: "Yolları öğrenmiş, şehir içi ve ilçeler arası hatta güvenilir yardımcı şoför." },
            { level: 3, title: "Kaptan Şoför", badge: "🚌", reqXP: 350, speedMod: 1.15, bonusRev: 1.30, desc: "Tam yetkili usta kaptan. Şehirlerarası uzun yollarda yolcu güvenini kazanır." },
            { level: 4, title: "Kıdemli Uzun Yol Kaptanı", badge: "⭐", reqXP: 800, speedMod: 1.25, bonusRev: 1.50, desc: "Bolu Dağı ve kar kış demeden her yolda tecrübesini konuşturan kıdemli kurt şoför." },
            { level: 5, title: "Baş Kaptan & Filo Ustası", badge: "👑", reqXP: 1600, speedMod: 1.35, bonusRev: 1.85, desc: "Şirketin gözbebeği efsane kaptan. En yüksek hasılatı ve maksimum bahşişi toplar." }
        ],

        // Şirket Büyüme Seviyeleri (HQ Titles)
        companyLevels: [
            { level: 1, title: "Sahil Yazıhanesi", badge: "🏠", reqTrips: 0, reqRev: 0, perkDesc: "Başlangıç yazıhanesi. 2 şoföre kadar filo kapasitesi." },
            { level: 2, title: "Trakya Bölge Acentesi", badge: "🏢", reqTrips: 4, reqRev: 5000, perkDesc: "4 şoför kapasitesi. Şoför dinlenme sürelerinde %20 kısalma." },
            { level: 3, title: "Marmara Lojistik & Seyahat", badge: "🏙️", reqTrips: 12, reqRev: 18000, perkDesc: "6 şoför kapasitesi. Otogar biletlerinde %10 kurumsal prim." },
            { level: 4, title: "Ulusal Karayolları Markası", badge: "⭐", reqTrips: 28, reqRev: 50000, perkDesc: "8 şoför kapasitesi. Tüm filoda %15 akaryakıt anlaşması indirimi." },
            { level: 5, title: "Altın Yıldızlı Holding", badge: "👑", reqTrips: 60, reqRev: 120000, perkDesc: "Sınırsız filo. Her seferde +%25 holding kâr payı bonusu." }
        ],

        // Şoför Pazarında Kiralanabilecek Akıllı Kaptanlar (Traits & Personalities)
        driverMarket: [
            {
                id: "drv_murat",
                name: "Murat Çırak",
                avatar: "👨‍💼",
                startRankLevel: 1,
                startXP: 0,
                wagePerTrip: 140,
                hireFee: 300,
                traitId: "trait_apprentice",
                traitName: "Çırak Azmi",
                traitBadge: "🌱",
                traitDesc: "Her seferde +%60 daha fazla tecrübe (XP) kazanır. Çabucak usta kaptana dönüşür.",
                desc: "Genç ve son derece gayretli. Sefer yaptıkça roket gibi seviye atlar!",
                preferredBusClass: "kucuk"
            },
            {
                id: "drv_mehmet",
                name: "Mehmet Kaptan",
                avatar: "👨‍✈️",
                startRankLevel: 2,
                startXP: 140,
                wagePerTrip: 260,
                hireFee: 650,
                traitId: "trait_eco",
                traitName: "Ekonomik Ayak",
                traitBadge: "🍃",
                traitDesc: "Mükemmel gaz pedalı disiplini. Yakıt tüketimini %30 azaltır, otobüs aşınmasını %50 düşürür.",
                desc: "Yakıt cimrisi ve dikkatli şoför. Şirketin işletme giderlerini dibe çeker.",
                preferredBusClass: "orta"
            },
            {
                id: "drv_ayse",
                name: "Ayşe Kaptan",
                avatar: "👩‍✈️",
                startRankLevel: 2,
                startXP: 220,
                wagePerTrip: 340,
                hireFee: 850,
                traitId: "trait_vip",
                traitName: "VIP Zerafet & İkram",
                traitBadge: "✨",
                traitDesc: "Yolcuların gözdesidir. Bilet hasılatına +%45 VIP bahşiş ve memnuniyet primi ekler.",
                desc: "Çok kibar ve titiz. Lüks seyahat otobüslerinde devasa ciro patlaması yaşatır.",
                preferredBusClass: "buyuk"
            },
            {
                id: "drv_ahmet",
                name: "Ahmet Kaptan",
                avatar: "👨‍✈️",
                startRankLevel: 3,
                startXP: 450,
                wagePerTrip: 420,
                hireFee: 1200,
                traitId: "trait_winter",
                traitName: "Bolu Dağı Kurdu",
                traitBadge: "❄️",
                traitDesc: "Kar, fırtına ve zorlu dağ yollarında asla gecikmez; kaza/arıza riski %0'dır.",
                desc: "Zorlu maratonların yenilmez kaptanı. Erzurum ve Bolu dağlarında rakipsizdir.",
                preferredBusClass: "buyuk"
            },
            {
                id: "drv_kemal",
                name: "Kemal Usta",
                avatar: "🧔",
                startRankLevel: 4,
                startXP: 950,
                wagePerTrip: 550,
                hireFee: 1800,
                traitId: "trait_mentor",
                traitName: "Filo Duayeni & Lider",
                traitBadge: "👑",
                traitDesc: "Tüm filoya ilham verir. Şirketteki TÜM şoförlerin sefer gelirine +%12 filo liderliği payı katar.",
                desc: "Otogarların yaşayan efsanesi. Varlığı bile şirketin değerini ikiye katlar.",
                preferredBusClass: "buyuk"
            },
            {
                id: "drv_selim",
                name: "Selim Kaptan",
                avatar: "⚡",
                startRankLevel: 2,
                startXP: 180,
                wagePerTrip: 300,
                hireFee: 750,
                traitId: "trait_speed",
                traitName: "Gece Kuşu & Seri Sürüş",
                traitBadge: "🌙",
                traitDesc: "Otoyollarda akıcı sürüş yapar. Sefer sürelerini %25 daha hızlı tamamlar.",
                desc: "Vakit nakittir diyen seri şoför. Ekspres hatlarda saat gibi çalışır.",
                preferredBusClass: "orta"
            },
            {
                id: "drv_fatma",
                name: "Fatma Kaptan",
                avatar: "🧕",
                startRankLevel: 3,
                startXP: 400,
                wagePerTrip: 390,
                hireFee: 1100,
                traitId: "trait_punctual",
                traitName: "Çelik Disiplin & Dakiklik",
                traitBadge: "🎯",
                traitDesc: "Tam zamanında perona yanaşır. Her sefer bitiminde +%25 dakiklik ikramiyesi kazandırır.",
                desc: "Kusursuz zamanlama ustası. Sefer gecikmelerine asla izin vermez.",
                preferredBusClass: "buyuk"
            }
        ],

        // Şirket Sefer Rotaları
        availableRoutes: [
            {
                id: "route_corlu",
                name: "Süleymanpaşa ➔ Çorlu - Çerkezköy (Sanayi Ring)",
                distKm: 45,
                minRankLevel: 1,
                routeType: "kucuk", // Küçük/Midibüs için optimize
                baseDurationSeconds: 60,
                baseTicketPrice: 75,
                avgPassengers: 32,
                fuelCost: 140,
                xpReward: 45,
                desc: "Fabrika vardiyaları ve ilçe ringi. Küçük ve çevik araçlar için mükemmel kârlılık."
            },
            {
                id: "route_ist",
                name: "Tekirdağ ➔ İstanbul (Esenler Otogar Ekspresi)",
                distKm: 135,
                minRankLevel: 2,
                routeType: "orta", // Standart solo veya VIP
                baseDurationSeconds: 100,
                baseTicketPrice: 195,
                avgPassengers: 40,
                fuelCost: 340,
                xpReward: 95,
                desc: "Marmara koridorunun kalbi. Kesintisiz yolcu talebi ve yüksek nakit akışı."
            },
            {
                id: "route_izm",
                name: "Tekirdağ ➔ Bursa - İzmir (Ege Turizm Hattı)",
                distKm: 420,
                minRankLevel: 3,
                routeType: "buyuk", // VIP Seyahat
                baseDurationSeconds: 165,
                baseTicketPrice: 440,
                avgPassengers: 42,
                fuelCost: 720,
                xpReward: 170,
                desc: "Çanakkale Köprüsü geçişli Ege sahili turizm koridoru. VIP araçlarda hasılat katlanır."
            },
            {
                id: "route_ank",
                name: "Tekirdağ ➔ Bolu Dağı - Ankara (AŞTİ Başkent)",
                distKm: 585,
                minRankLevel: 4,
                routeType: "buyuk", // VIP Seyahat
                baseDurationSeconds: 210,
                baseTicketPrice: 510,
                avgPassengers: 46,
                fuelCost: 950,
                xpReward: 230,
                desc: "Bolu Dağı geçişli prestijli başkent seferi. Kıdemli kaptanlar ve lüks filolar için."
            },
            {
                id: "route_antalya",
                name: "Tekirdağ ➔ Pamukkale - Antalya (Akdeniz Ekspresi)",
                distKm: 780,
                minRankLevel: 4,
                routeType: "buyuk",
                baseDurationSeconds: 260,
                baseTicketPrice: 680,
                avgPassengers: 45,
                fuelCost: 1250,
                xpReward: 290,
                desc: "Turizm cennetine doğrudan VIP ekspres. Yerli ve yabancı yolculardan yüksek bahşiş."
            },
            {
                id: "route_erz",
                name: "Tekirdağ ➔ Sivas - Erzurum (Palandöken Maratonu)",
                distKm: 1360,
                minRankLevel: 5,
                routeType: "buyuk",
                baseDurationSeconds: 340,
                baseTicketPrice: 980,
                avgPassengers: 48,
                fuelCost: 1900,
                xpReward: 420,
                desc: "Türkiye'nin en uzun karlı maratonu. Usta Baş Kaptanlar için devasa servet kapısı."
            }
        ],

        // Piyasa Trendleri Havuzu (Dinamik Borsa Olayları)
        marketTrendTemplates: [
            {
                trendName: "Cuma Akşamı Otogar Yoğunluğu",
                icon: "🔥",
                multiplier: 1.85,
                desc: "Hafta sonu tatili nedeniyle tüm koltuklar kapış kapış! Bilet fiyatı x1.85!",
                targetRouteIds: ["route_ist", "route_corlu"]
            },
            {
                trendName: "Ege Yaz Tatili & Çeşme Akını",
                icon: "🏖️",
                multiplier: 1.75,
                desc: "Ege sahillerine yoğun tatilci akını. VIP biletlere hücum var! Bilet x1.75!",
                targetRouteIds: ["route_izm"]
            },
            {
                trendName: "Meclis & Kongre Haftası",
                icon: "🏛️",
                multiplier: 1.65,
                desc: "Başkentte resmi heyet ve kongre hareketliliği. Başkent seferi x1.65 ciro getirir!",
                targetRouteIds: ["route_ank"]
            },
            {
                trendName: "Fabrika Vardiya Değişimi",
                icon: "⚙️",
                multiplier: 1.55,
                desc: "Organize Sanayi Bölgesinde yüzlerce işçi servisi talebi. Çorlu ringi x1.55!",
                targetRouteIds: ["route_corlu"]
            },
            {
                trendName: "Palandöken Kayak Festivali & Kar Maratonu",
                icon: "❄️",
                multiplier: 2.20,
                desc: "Erzurum'a kayak kafilesi akını! Rekor seviyede bilet hasılatı (x2.20)! Bolu kurdu kaptanlar parlar!",
                targetRouteIds: ["route_erz"]
            },
            {
                trendName: "Akdeniz Turizm Fuarı",
                icon: "🌴",
                multiplier: 1.90,
                desc: "Antalya 5 yıldızlı oteller bölgesinde transfer çılgınlığı! x1.90 bilet hasılatı!",
                targetRouteIds: ["route_antalya"]
            },
            {
                trendName: "Bahar Yağmurları & Dikkatli Sürüş",
                icon: "🌧️",
                multiplier: 1.20,
                desc: "Yollar ıslak, dikkatli sürüş gerekiyor. Bilet fiyatı ılımlı artışta (+%20).",
                targetRouteIds: ["route_corlu", "route_ist", "route_izm", "route_ank"]
            }
        ],

        // Özel Süreli VIP İhale Şablonları (Charter Contracts)
        contractTemplates: [
            {
                id: "contract_derbi",
                title: "⚽ Süper Lig Derbi Kafilesi Özel Seferi",
                client: "TFF Süper Lig Kulübü",
                icon: "🏆",
                routeId: "route_ist",
                rewardBonus: 3500,
                reqMinRank: 3,
                reqBusClass: "buyuk",
                desc: "Futbol takımını Esenler üzerinden stada götürün. Lüks VIP otobüs ve usta kaptan şartı!"
            },
            {
                id: "contract_festival",
                title: " Kiraz Festivali Protokol Transferi",
                client: "Tekirdağ Büyükşehir Belediyesi",
                icon: "🍒",
                routeId: "route_corlu",
                rewardBonus: 2200,
                reqMinRank: 2,
                reqBusClass: "orta",
                desc: "Uluslararası davetlileri ve sanatçıları sahil kordonuna taşıyın. Yüksek bahşiş garantili!"
            },
            {
                id: "contract_holding",
                title: "💼 Uluslararası CEO & Yatırımcı Zirvesi",
                client: "Global Finans Konsorsiyumu",
                icon: "💎",
                routeId: "route_ank",
                rewardBonus: 5400,
                reqMinRank: 4,
                reqBusClass: "buyuk",
                desc: "Ankara Bakanlıklar kongresine yabancı diplomatları ulaştırın. Devasa prim!"
            },
            {
                id: "contract_kayak",
                title: "🎿 Milli Kayak Takımı Erzurum Kampı",
                client: "Kış Sporları Federasyonu",
                icon: "⛷️",
                routeId: "route_erz",
                rewardBonus: 7200,
                reqMinRank: 4,
                reqBusClass: "buyuk",
                desc: "Palandöken zirvesine milli sporcuları ve ekipmanları götürün. Zorlu dağ primi!"
            }
        ],

        simulationTimer: null,
        marketTimer: null,

        // Başlatma
        init: function () {
            this.loadData();

            // İlk açılışta başlangıç çırağını hediye et
            if (!this.data.hiredDrivers || this.data.hiredDrivers.length === 0) {
                this.hireDriver("drv_murat", true);
            }

            // Piyasa trendlerini ve ihaleleri kontrol et / tazele
            this.refreshMarketTrendsIfNeeded();
            this.refreshSpecialContractsIfNeeded();

            // Arka planda sefer ilerletme döngüsü (Her 1 saniyede bir hassas simülasyon)
            if (!this.simulationTimer) {
                this.simulationTimer = setInterval(() => {
                    this.tickSimulation(1);
                }, 1000);
            }

            // Piyasa borsası ve ihaleleri her 90 saniyede bir yenile
            if (!this.marketTimer) {
                this.marketTimer = setInterval(() => {
                    this.updateMarketFluctuations();
                }, 90000);
            }

            console.log("[CompanySystem] Akıllı Şirket & Filo Yönetimi hazır. Şirket:", this.data.companyName);
        },

        // Verileri Yükle
        loadData: function () {
            try {
                let raw = localStorage.getItem(this.STORAGE_KEY);
                if (!raw) {
                    raw = localStorage.getItem(this.LEGACY_STORAGE_KEY);
                }
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.data = Object.assign(this.data, parsed);

                    // Eksik alanları tamamla
                    if (!this.data.hqUpgrades) {
                        this.data.hqUpgrades = { fuelContract: false, luxuryLounge: false, terminalPlatform: false, corporateBrand: false };
                    }
                    if (!this.data.busConditions) {
                        this.data.busConditions = {};
                    }
                    if (!Array.isArray(this.data.radioLogs)) {
                        this.data.radioLogs = [];
                    }
                    if (!Array.isArray(this.data.specialContracts)) {
                        this.data.specialContracts = [];
                    }
                    if (!this.data.marketTrends || Object.keys(this.data.marketTrends).length === 0) {
                        this.data.marketTrends = {};
                    }

                    // Şoför nesnelerindeki eksik yeni özellikleri yamala
                    this.data.hiredDrivers.forEach(d => {
                        const marketInfo = this.driverMarket.find(m => m.id === d.id);
                        if (marketInfo) {
                            d.traitId = d.traitId || marketInfo.traitId;
                            d.traitName = d.traitName || marketInfo.traitName;
                            d.traitBadge = d.traitBadge || marketInfo.traitBadge;
                            d.traitDesc = d.traitDesc || marketInfo.traitDesc;
                            d.preferredBusClass = d.preferredBusClass || marketInfo.preferredBusClass;
                        }
                        if (d.energy === undefined) d.energy = 100;
                        if (!d.assignedBusId) d.assignedBusId = "otokar_kent_lf";
                        if (d.autoDispatch === undefined) d.autoDispatch = true;
                    });
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

        // Şirket Büyüme Seviyesini Kontrol Et ve Güncelle
        checkCompanyLevelUp: function () {
            const trips = this.data.completedTripsCount || 0;
            const rev = this.data.totalRevenue || 0;
            let currentLvl = this.data.companyLevel || 1;
            let newLvl = 1;

            for (let i = this.companyLevels.length - 1; i >= 0; i--) {
                const req = this.companyLevels[i];
                if (trips >= req.reqTrips && rev >= req.reqRev) {
                    newLvl = req.level;
                    break;
                }
            }

            if (newLvl > currentLvl) {
                this.data.companyLevel = newLvl;
                this.saveData();
                const lvlInfo = this.companyLevels.find(l => l.level === newLvl);
                const toastMsg = `🏢 ŞİRKET BÜYÜDÜ! Şirketiniz '${lvlInfo.badge} ${lvlInfo.title}' seviyesine terfi etti! (${lvlInfo.perkDesc})`;
                if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(toastMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(toastMsg, "success");
                this.addRadioLog("🏢 Merkez Ofis", "👨‍💼", `Şirketimiz resmi olarak '${lvlInfo.title}' unvanını aldı. Tüm filoya tebrikler!`, "system");
            }
        },

        // Telsiz Günlüğüne Mesaj Ekle
        addRadioLog: function (senderName, avatar, text, type = "normal") {
            const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            this.data.radioLogs.unshift({
                time: timeStr,
                sender: senderName,
                avatar: avatar || "📻",
                text: text,
                type: type
            });
            if (this.data.radioLogs.length > 25) {
                this.data.radioLogs.pop();
            }
            this.saveData();
        },

        // Şirket Adını Değiştir
        setCompanyName: function (newName) {
            if (!newName || !newName.trim()) return;
            this.data.companyName = newName.trim().substring(0, 40);
            this.saveData();
            const msg = `Şirketinizin adı '${this.data.companyName}' olarak tescillendi.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 ${msg}`, "success");
            this.renderCompanyOverview();
        },

        // Şoför Kirala
        hireDriver: function (driverId, isFreeGift = false) {
            const driverInfo = this.driverMarket.find(d => d.id === driverId);
            if (!driverInfo) return false;

            if (this.data.hiredDrivers.some(d => d.id === driverId)) {
                if (typeof UI !== 'undefined') UI.showToast("Bu şoför zaten şirketinizde çalışıyor.", "warning");
                return false;
            }

            // Kapasite kontrolü
            const currentLvlInfo = this.companyLevels.find(l => l.level === (this.data.companyLevel || 1)) || this.companyLevels[0];
            const maxDriversAllowed = (currentLvlInfo.level === 1) ? 2 : (currentLvlInfo.level === 2 ? 4 : (currentLvlInfo.level === 3 ? 6 : (currentLvlInfo.level === 4 ? 8 : 99)));
            
            if (!isFreeGift && this.data.hiredDrivers.length >= maxDriversAllowed) {
                const limitMsg = `Filo Kapasitesi Dolu! Mevcut şirket seviyeniz (${currentLvlInfo.title}) en fazla ${maxDriversAllowed} şoföre izin veriyor. Daha fazla kaptan için şirketinizi büyütün!`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(limitMsg);
                if (typeof UI !== 'undefined') UI.showToast(`⛔ ${limitMsg}`, "warning");
                return false;
            }

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (!isFreeGift && currentBudget < driverInfo.hireFee) {
                const msg = `Yetersiz bakiye! ${driverInfo.name} transferi için ${driverInfo.hireFee} ₺ gerekiyor. Bakiyeniz: ${currentBudget} ₺.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined') UI.showToast(msg, "warning");
                return false;
            }

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

            // Şoför için uygun başlangıç aracını belirle
            const defaultBusId = (driverInfo.preferredBusClass === "kucuk") ? "otokar_sultan_mega" : "otokar_kent_lf";

            const hiredObj = {
                id: driverInfo.id,
                name: driverInfo.name,
                avatar: driverInfo.avatar,
                rankLevel: initialRankLvl,
                rankTitle: rankObj.title,
                rankBadge: rankObj.badge,
                currentXP: driverInfo.startXP || 0,
                wagePerTrip: driverInfo.wagePerTrip,
                status: "idle",
                energy: 100,
                assignedBusId: defaultBusId,
                assignedRouteId: "route_corlu",
                currentTripSeconds: 0,
                targetDurationSeconds: 60,
                totalTripsMade: 0,
                totalEarningsMade: 0,
                autoDispatch: true,
                traitId: driverInfo.traitId,
                traitName: driverInfo.traitName,
                traitBadge: driverInfo.traitBadge,
                traitDesc: driverInfo.traitDesc,
                preferredBusClass: driverInfo.preferredBusClass
            };

            this.data.hiredDrivers.push(hiredObj);
            this.saveData();

            // İlk seferini otomatik başlat
            this.dispatchDriver(driverInfo.id, "route_corlu", defaultBusId);

            const successMsg = isFreeGift 
                ? `Hayırlı olsun! Başlangıç çırağınız ${driverInfo.name} (${rankObj.badge} ${rankObj.title}) şirketinize katıldı! Sefere çıktıkça tecrübe kazanıp yükselecek.`
                : `Transfer başarılı! ${driverInfo.name} (${rankObj.badge} ${rankObj.title}) ${driverInfo.hireFee} ₺ bedelle şirketinize katıldı.`;

            this.playCashChime();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(successMsg);
            if (typeof UI !== 'undefined') UI.showToast(`🎉 ${successMsg}`, "success");
            this.addRadioLog(driverInfo.name, driverInfo.avatar, `Selamünaleyküm kaptanlar! Şirket bünyesine katıldım, tekerime taş değmesin!`, "success");

            this.renderAll();
            return true;
        },

        // Otobüs Bilgisini Getir
        getBusInfo: function (busId) {
            if (typeof BusFleet !== 'undefined' && BusFleet.buses) {
                const found = BusFleet.buses.find(b => b.id === busId);
                if (found) return found;
            }
            // Yedek varsayılan araçlar
            if (busId === "otokar_sultan_mega") {
                return { id: "otokar_sultan_mega", fullName: "Otokar Sultan Mega (Midibüs)", sizeTier: 1, sizeClass: "kucuk", seatCapacity: 29, tipBonusPercent: 12, icon: "🚐" };
            }
            if (busId === "mercedes_travego_16sh") {
                return { id: "mercedes_travego_16sh", fullName: "Mercedes-Benz Travego 16 SH (VIP)", sizeTier: 3, sizeClass: "buyuk", seatCapacity: 46, tipBonusPercent: 25, icon: "⭐" };
            }
            return { id: "otokar_kent_lf", fullName: "Otokar Kent LF (Solo)", sizeTier: 2, sizeClass: "orta", seatCapacity: 32, tipBonusPercent: 0, icon: "🚌" };
        },

        // Otobüs Kondisyonunu Al
        getBusCondition: function (busId) {
            if (this.data.busConditions[busId] === undefined) {
                this.data.busConditions[busId] = 100;
            }
            return this.data.busConditions[busId];
        },

        // Otobüse Bakım Yap
        repairBus: function (busId) {
            const bus = this.getBusInfo(busId);
            const curCond = this.getBusCondition(busId);
            if (curCond >= 98) {
                if (typeof UI !== 'undefined') UI.showToast(`${bus.fullName} zaten pırıl pırıl, bakıma ihtiyacı yok! (%100)`, "info");
                return false;
            }

            const repairCost = Math.round((100 - curCond) * 8); // Puan başına 8 TL
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < repairCost) {
                const msg = `Yetersiz bakiye! ${bus.fullName} periyodik bakımı için ${repairCost} ₺ gerekiyor.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined') UI.showToast(`⚠️ ${msg}`, "warning");
                return false;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= repairCost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.data.busConditions[busId] = 100;
            this.saveData();

            this.playCashChime();
            const doneMsg = `🛠️ ${bus.fullName} periyodik bakımı yapıldı! Yağ, frenler ve filtreler yenilendi. Kondisyon: %100 (-${repairCost} ₺).`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(doneMsg);
            if (typeof UI !== 'undefined') UI.showToast(doneMsg, "success");
            this.renderAll();
            return true;
        },

        // Tüm Filoya Toplu Periyodik Bakım Yap
        repairAllFleet: function () {
            let totalCost = 0;
            const busesToFix = [];

            this.data.hiredDrivers.forEach(d => {
                const busId = d.assignedBusId || "otokar_kent_lf";
                const cond = this.getBusCondition(busId);
                if (cond < 90 && !busesToFix.some(b => b.busId === busId)) {
                    const cost = Math.round((100 - cond) * 8);
                    totalCost += cost;
                    busesToFix.push({ busId, cost });
                }
            });

            if (busesToFix.length === 0) {
                if (typeof UI !== 'undefined') UI.showToast("Tüm filonuzun kondisyonu yüksek, acil bakıma ihtiyaç yok!", "info");
                return;
            }

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < totalCost) {
                if (typeof UI !== 'undefined') UI.showToast(`Toplu bakım için ${totalCost} ₺ gerekiyor. Bakiyeniz yetersiz!`, "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= totalCost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            busesToFix.forEach(b => {
                this.data.busConditions[b.busId] = 100;
            });
            this.saveData();

            this.playCashChime();
            const msg = `🛠️ FİLO SERVİSTE! ${busesToFix.length} otobüsün tüm bakımları tamamlandı! Kasadan -${totalCost} ₺ ödendi.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.renderAll();
        },

        // Şoföre Kahve ve Dinlenme İkramı Ver
        boostDriverEnergy: function (driverId) {
            const driver = this.data.hiredDrivers.find(d => d.id === driverId);
            if (!driver) return;

            if (driver.energy >= 95) {
                if (typeof UI !== 'undefined') UI.showToast(`${driver.name} zaten zımba gibi enerjik! (% ${driver.energy})`, "info");
                return;
            }

            const cost = 120; // 120 TL dinlenme tesisi ikramı
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < cost) {
                if (typeof UI !== 'undefined') UI.showToast(`İkram için ${cost} ₺ gerekiyor. Yetersiz bakiye!`, "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= cost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            driver.energy = 100;
            this.saveData();

            this.playCashChime();
            const msg = `☕ ${driver.name} tesislerde duble çay & kahve molası verdi! Enerjisi %100 oldu!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.renderAll();
        },

        // Şoförü Sefere Çıkart (Gerçek Araç ve Rota ile)
        dispatchDriver: function (driverId, routeId, busId) {
            const driver = this.data.hiredDrivers.find(d => d.id === driverId);
            const route = this.availableRoutes.find(r => r.id === routeId);
            if (!driver || !route) return false;

            const selectedBusId = busId || driver.assignedBusId || "otokar_kent_lf";
            const bus = this.getBusInfo(selectedBusId);

            // Uzun yol rütbe kontrolü
            if (route.minRankLevel && (driver.rankLevel || 1) < route.minRankLevel) {
                const reqRank = this.ranks.find(r => r.level === route.minRankLevel);
                const reqTitle = reqRank ? reqRank.title : `${route.minRankLevel}. Seviye Kaptan`;
                const warnMsg = `Uzun Yol Tecrübesi Yetersiz: ${driver.name} (${driver.rankTitle}), ${route.name} seferine çıkamaz! En az ${reqTitle} tecrübesi şarttır.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`⛔ ${warnMsg}`, "warning");
                return false;
            }

            // Kondisyon kontrolü
            const cond = this.getBusCondition(selectedBusId);
            if (cond < 20) {
                const warnMsg = `ARIZA RİSKİ! ${bus.fullName} kondisyonu % ${cond}! Seferden önce acil bakım yaptırmalısınız.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnMsg);
                if (typeof UI !== 'undefined') UI.showToast(`⚠️ ${warnMsg}`, "warning");
                return false;
            }

            const rankInfo = this.getDriverRankInfo(driver);
            let speedMultiplier = rankInfo.speedMod || 1.0;

            // Şoför Trait Etkisi: Seri Sürüş
            if (driver.traitId === "trait_speed") {
                speedMultiplier *= 1.25;
            }

            // Kondisyon Hız Etkisi
            if (cond < 50) {
                speedMultiplier *= 0.85; // Yıpranmış otobüs yavaş gider
            }

            // Enerji Hız Etkisi
            if ((driver.energy || 100) < 30) {
                speedMultiplier *= 0.90; // Yorgun kaptan dikkatli ve yavaş gider
            }

            const baseSec = route.baseDurationSeconds || 60;
            const actualDuration = Math.max(25, Math.round(baseSec / speedMultiplier));

            driver.status = "on_trip";
            driver.assignedRouteId = route.id;
            driver.assignedBusId = selectedBusId;
            driver.currentTripSeconds = 0;
            driver.targetDurationSeconds = actualDuration;
            this.saveData();

            this.playRadioBeep();
            const msg = `${driver.rankBadge} ${driver.name}, ${bus.icon} ${bus.fullName} ile '${route.name}' seferine çıktı. Tahmini varış: ${Math.round(actualDuration / 60 * 10) / 10} dk.`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🚌 ${msg}`, "info");
            this.addRadioLog(driver.name, driver.avatar, `${route.name} seferi için perondan teker döndürdük. Yolcularımız emanetimizdir!`, "info");
            this.renderAll();
            return true;
        },

        // YAPAY ZEKA FİLO MÜDÜRÜ: TEK TUŞLA AKILLI OPTİMİZE DAĞITIM
        autoDispatchAllAI: function () {
            if (!this.data.hiredDrivers || this.data.hiredDrivers.length === 0) {
                if (typeof UI !== 'undefined') UI.showToast("Filoda kayıtlı şoför bulunamadı!", "warning");
                return;
            }

            // Sahip olunan veya mevcut otobüsler havuzunu belirle
            let availableBusIds = [];
            if (typeof BusFleet !== 'undefined' && typeof BusFleet.getOwnedBusIds === 'function') {
                availableBusIds = BusFleet.getOwnedBusIds();
            }
            if (!availableBusIds || availableBusIds.length === 0) {
                availableBusIds = ["otokar_sultan_mega", "otokar_kent_lf", "mercedes_travego_16sh"];
            }

            // Canlı piyasa borsa taleplerini değerlendir
            const trends = this.data.marketTrends || {};
            let dispatchedCount = 0;
            const dispatchReports = [];

            // Şoförleri rütbelerine ve uzmanlıklarına göre sırala (en tecrübeli şoför en karlı uzun hatta)
            const driversSorted = [...this.data.hiredDrivers].sort((a, b) => (b.rankLevel || 1) - (a.rankLevel || 1));

            driversSorted.forEach((driver, idx) => {
                // Şoförün ehliyetinin yettiği en karlı rotayı bul
                const eligibleRoutes = this.availableRoutes.filter(r => (driver.rankLevel || 1) >= (r.minRankLevel || 1));
                if (eligibleRoutes.length === 0) return;

                // Karlılık skorunu hesapla
                let bestRoute = eligibleRoutes[0];
                let maxProfitScore = -1;

                eligibleRoutes.forEach(r => {
                    const trend = trends[r.id];
                    const multiplier = trend ? trend.multiplier : 1.0;
                    const expectedRev = r.avgPassengers * r.baseTicketPrice * multiplier;
                    const netExpected = expectedRev - (r.fuelCost + driver.wagePerTrip);
                    
                    // Şoför Trait Sinerjisi
                    let synergyBonus = 1.0;
                    if (driver.traitId === "trait_winter" && r.id === "route_erz") synergyBonus = 1.4;
                    if (driver.traitId === "trait_vip" && (r.id === "route_izm" || r.id === "route_ank" || r.id === "route_antalya")) synergyBonus = 1.35;
                    if (driver.traitId === "trait_eco" && r.distKm > 300) synergyBonus = 1.25;
                    if (driver.traitId === "trait_apprentice" && r.id === "route_corlu") synergyBonus = 1.3;

                    const finalScore = netExpected * synergyBonus;
                    if (finalScore > maxProfitScore) {
                        maxProfitScore = finalScore;
                        bestRoute = r;
                    }
                });

                // Bu rota için en uygun otobüsü seç
                let chosenBusId = availableBusIds[0];
                if (bestRoute.routeType === "buyuk") {
                    // Tercihen Tier 3 VIP otobüs
                    const vipBus = availableBusIds.find(id => {
                        const b = this.getBusInfo(id);
                        return b.sizeTier === 3 || b.sizeClass === "buyuk";
                    });
                    if (vipBus) chosenBusId = vipBus;
                } else if (bestRoute.routeType === "kucuk") {
                    // Tercihen Tier 1 Midibüs
                    const midiBus = availableBusIds.find(id => {
                        const b = this.getBusInfo(id);
                        return b.sizeTier === 1 || b.sizeClass === "kucuk";
                    });
                    if (midiBus) chosenBusId = midiBus;
                }

                // Şoför yorgunsa otomatik enerji ikramı uygula (bütçe varsa)
                if (driver.energy < 25 && typeof Game !== 'undefined' && Game.playerBudget >= 120) {
                    driver.energy = 100;
                    Game.playerBudget -= 120;
                }

                // Kondisyon düşükse ve bütçe varsa hızlı tamir et
                const busCond = this.getBusCondition(chosenBusId);
                if (busCond < 40 && typeof Game !== 'undefined' && Game.playerBudget >= 300) {
                    this.data.busConditions[chosenBusId] = 100;
                    Game.playerBudget -= 300;
                }

                // Sefere çıkart
                this.dispatchDriver(driver.id, bestRoute.id, chosenBusId);
                dispatchedCount++;
                const bInfo = this.getBusInfo(chosenBusId);
                dispatchReports.push(`${driver.name} ➔ ${bInfo.fullName} ile ${bestRoute.name}`);
            });

            this.playAiDispatchSound();

            const summarySpeech = `Yapay Zeka Filo Müdürü ${dispatchedCount} şoförünüzü ve araçlarınızı canlı borsa taleplerine göre en yüksek kâr marjıyla akıllıca rotalara dağıttı!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(summarySpeech);
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`🤖 AKILLI DAĞITIM TAMAMLANDI: ${dispatchedCount} sefer başlatıldı!`, "success");
            }

            this.addRadioLog("🤖 Filo Yapay Zekası", "⚡", `Akıllı Sefer Optimizasyonu tamamlandı. Tüm filo zirve kâr marjıyla sahaya sürüldü.`, "success");
            this.renderAll();
        },

        // Arka Plan Canlı Sefer Simülasyonu
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
                    // Dinlenme süresi (Lüks dinlenme tesisi anlaşması varsa 2 kat hızlı)
                    const restRate = (this.data.hqUpgrades && this.data.hqUpgrades.luxuryLounge) ? 2.0 : 1.0;
                    driver.restRemainingSeconds = (driver.restRemainingSeconds || 12) - (deltaSec * restRate);
                    
                    // Enerji yavaş yavaş dolar
                    if (driver.energy < 100) {
                        driver.energy = Math.min(100, (driver.energy || 50) + (1 * restRate));
                    }

                    if (driver.restRemainingSeconds <= 0) {
                        driver.status = 'idle';
                        stateChanged = true;

                        // Otomatik sefer modu aktifse hemen tekrar yola çıkart
                        if (driver.autoDispatch && driver.assignedRouteId) {
                            this.dispatchDriver(driver.id, driver.assignedRouteId, driver.assignedBusId);
                        }
                    }
                }
            });

            if (stateChanged) {
                this.updateLiveTripProgressUI();
            }
        },

        // Sefer Tamamlandığında Kazanç, Sinerji, Kondisyon ve Rütbe Hesaplaması
        completeDriverTrip: function (driver) {
            const route = this.availableRoutes.find(r => r.id === driver.assignedRouteId) || this.availableRoutes[0];
            const rankInfo = this.getDriverRankInfo(driver);
            const bus = this.getBusInfo(driver.assignedBusId);

            // 1. DİNAMİK BORSA ÇARPANI
            const trend = (this.data.marketTrends && this.data.marketTrends[route.id]) ? this.data.marketTrends[route.id] : null;
            const marketMultiplier = trend ? trend.multiplier : 1.0;

            // 2. YOLCU KAPASİTESİ VE BİLET HASILATI
            let basePass = route.avgPassengers + Math.floor(Math.random() * 6);
            if (this.data.hqUpgrades && this.data.hqUpgrades.terminalPlatform) {
                basePass = Math.round(basePass * 1.25); // +%25 peron yolcu çekme
            }

            // Araç koltuk kapasitesini aşamaz
            const passengerCount = Math.min(bus.seatCapacity || 45, basePass);

            // Bilet Fiyatı & Çarpanlar
            let ticketPrice = route.baseTicketPrice * (rankInfo.bonusRev || 1.0) * marketMultiplier;
            if (this.data.hqUpgrades && this.data.hqUpgrades.corporateBrand) {
                ticketPrice *= 1.25; // Marka primi
            }

            // 3. SİNERJİ VE ÖZEL YETENEK (TRAIT) BONUSA HESAPLAMASI
            let grossRevenue = Math.round(passengerCount * ticketPrice);

            // Trait: Ayşe Kaptan VIP İkram & Zerafet
            if (driver.traitId === "trait_vip") {
                grossRevenue = Math.round(grossRevenue * 1.45);
            }

            // Trait: Fatma Kaptan Dakiklik Bonusu
            if (driver.traitId === "trait_punctual") {
                grossRevenue = Math.round(grossRevenue * 1.25);
            }

            // Araç NVH Sessizliği ve Bahşiş Bonusu
            const busTipPct = bus.tipBonusPercent || 0;
            if (busTipPct > 0) {
                grossRevenue += Math.round(grossRevenue * (busTipPct / 100));
            }

            // Şirket Seviyesi Holding Bonusu (Seviye 5 ise +%25 net kar)
            if (this.data.companyLevel >= 5) {
                grossRevenue = Math.round(grossRevenue * 1.25);
            }

            // Kemal Usta Mentor Liderlik Bonusu (Tüm filoya +%12)
            const hasKemalUsta = this.data.hiredDrivers.some(d => d.id === "drv_kemal");
            if (hasKemalUsta) {
                grossRevenue = Math.round(grossRevenue * 1.12);
            }

            // 4. GİDERLER: YAKIT + MAAŞ + AŞINMA
            let fuel = route.fuelCost || 300;

            // Trait: Mehmet Kaptan Ekonomik Ayak (-%30 Yakıt)
            if (driver.traitId === "trait_eco") {
                fuel = Math.round(fuel * 0.70);
            }

            // Şirket Akaryakıt Anlaşması (-%20 Yakıt)
            if (this.data.hqUpgrades && this.data.hqUpgrades.fuelContract) {
                fuel = Math.round(fuel * 0.80);
            }

            // Araç ve Rota Sinerjisi (Şehir içine küçük otobüs girdiyse yakıt %35 düşer; büyük girdiyse %30 artar)
            if (route.routeType === "kucuk" && (bus.sizeTier === 1 || bus.sizeClass === "kucuk")) {
                fuel = Math.round(fuel * 0.65);
            } else if (route.routeType === "buyuk" && (bus.sizeTier === 1 || bus.sizeClass === "kucuk")) {
                grossRevenue = Math.round(grossRevenue * 0.80); // Midibüs uzun yolda az hasılat üretir
            }

            const wage = driver.wagePerTrip || 250;
            const netProfit = Math.max(150, grossRevenue - (fuel + wage));

            // 5. KONDİSYON AŞINMASI
            const curCond = this.getBusCondition(driver.assignedBusId);
            let wearAmount = (route.distKm > 500) ? 5 : ((route.distKm > 100) ? 3 : 2);
            if (driver.traitId === "trait_eco") wearAmount = Math.max(1, Math.round(wearAmount / 2));
            this.data.busConditions[driver.assignedBusId] = Math.max(5, curCond - wearAmount);

            // 6. ENERJİ TÜKETİMİ
            driver.energy = Math.max(10, (driver.energy || 100) - (wearAmount * 4));

            // 7. KASAYA AKTARMA
            if (typeof Game !== 'undefined') {
                Game.playerBudget = (Game.playerBudget || 0) + netProfit;
                Game.saveData();

                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            // 8. XP KAZANIMI & TERFİ
            let gainedXP = route.xpReward || 50;
            if (driver.traitId === "trait_apprentice") {
                gainedXP = Math.round(gainedXP * 1.6); // Çırak azmi
            }
            driver.currentXP = (driver.currentXP || 0) + gainedXP;
            driver.totalTripsMade = (driver.totalTripsMade || 0) + 1;
            driver.totalEarningsMade = (driver.totalEarningsMade || 0) + netProfit;
            driver.status = "resting";
            driver.restRemainingSeconds = 12;

            this.data.totalRevenue = (this.data.totalRevenue || 0) + netProfit;
            this.data.completedTripsCount = (this.data.completedTripsCount || 0) + 1;

            // RÜTBE TERFİ KONTROLÜ
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

            // Şirket Büyüme Seviyesini Kontrol Et
            this.checkCompanyLevelUp();
            this.saveData();

            // Kutlama ve Telsiz Anonsları
            if (hasLeveledUp) {
                if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();
                const levelMsg = `🎖️ RÜTBE TERFİSİ! ${driver.name} '${driver.rankBadge} ${driver.rankTitle}' unvanına yükseldi! Sefer hasılatı ve hızı arttı!`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(levelMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(levelMsg, "success");
                this.addRadioLog(driver.name, driver.avatar, `Yılların emeğiyle ${driver.rankTitle} rütbesine terfi ettim! Var olun kaptanlarım!`, "success");
            } else {
                this.playCashChime();
                const alertMsg = `💰 [${this.data.companyName}] ${driver.rankBadge} ${driver.name} seferi bitirdi! Net Kasaya: +${netProfit.toLocaleString('tr-TR')} ₺ (${gainedXP} XP).`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(alertMsg, "success");
                this.addRadioLog(driver.name, driver.avatar, `${route.name} seferini sağ salim tamamladık. Hasılat kasaya teslim: +${netProfit} ₺.`, "normal");
            }

            this.renderAll();
        },

        // Piyasa Trendlerini Güncelle (Dinamik Borsa)
        refreshMarketTrendsIfNeeded: function () {
            if (!this.data.marketTrends || Object.keys(this.data.marketTrends).length === 0) {
                this.updateMarketFluctuations();
            }
        },

        updateMarketFluctuations: function () {
            this.data.marketTrends = {};
            const availableTemplates = [...this.marketTrendTemplates];

            // 2 veya 3 rotada aynı anda özel talep patlaması yarat
            const countToPick = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < countToPick && availableTemplates.length > 0; i++) {
                const randIdx = Math.floor(Math.random() * availableTemplates.length);
                const picked = availableTemplates.splice(randIdx, 1)[0];

                picked.targetRouteIds.forEach(rId => {
                    this.data.marketTrends[rId] = {
                        trendName: picked.trendName,
                        icon: picked.icon,
                        multiplier: picked.multiplier,
                        desc: picked.desc,
                        expiresAt: Date.now() + 180000 // 3 dakika geçerli
                    };
                });
            }

            this.saveData();
            console.log("[CompanySystem] Sefer borsası güncellendi. Aktif trendler:", this.data.marketTrends);
            this.renderMarketTrends();
        },

        // VIP Özel İhaleleri Güncelle
        refreshSpecialContractsIfNeeded: function () {
            if (!this.data.specialContracts || this.data.specialContracts.length === 0) {
                this.data.specialContracts = [
                    Object.assign({}, this.contractTemplates[0], { expiresAt: Date.now() + 240000 }),
                    Object.assign({}, this.contractTemplates[1], { expiresAt: Date.now() + 300000 })
                ];
                this.saveData();
            }
        },

        // VIP Özel İhalesini Kabul Et ve Sefer Başlat
        acceptSpecialContract: function (contractId, driverId) {
            const contractIdx = this.data.specialContracts.findIndex(c => c.id === contractId);
            if (contractIdx === -1) return;

            const contract = this.data.specialContracts[contractIdx];
            const driver = this.data.hiredDrivers.find(d => d.id === driverId);
            if (!driver) {
                if (typeof UI !== 'undefined') UI.showToast("Bu ihale için bir kaptan seçmelisiniz!", "warning");
                return;
            }

            if ((driver.rankLevel || 1) < contract.reqMinRank) {
                if (typeof UI !== 'undefined') UI.showToast(`Bu ihaleyi sadece Seviye ${contract.reqMinRank} ve üzeri usta kaptanlar alabilir!`, "warning");
                return;
            }

            // İhaleyi kabul et: Peşin prim kasaya aktarılır
            if (typeof Game !== 'undefined') {
                Game.playerBudget = (Game.playerBudget || 0) + contract.rewardBonus;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.playCashChime();
            const msg = `🏆 VIP İHALE KABUL EDİLDİ! '${contract.title}' ihalesi ${driver.name} kaptanımıza teslim edildi. Kasaya peşin prim aktarıldı: +${contract.rewardBonus.toLocaleString('tr-TR')} ₺!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.addRadioLog(driver.name, driver.avatar, `${contract.client} protokol kontratını aldık. VIP yolcularımızı taşımak üzere yola çıkıyoruz!`, "success");

            // İlgili rotaya sefere çıkart
            this.dispatchDriver(driver.id, contract.routeId, driver.assignedBusId);

            // İhaleyi listeden kaldır
            this.data.specialContracts.splice(contractIdx, 1);
            this.saveData();
            this.renderAll();
        },

        // Şirket Genel Merkezi Avantajını Satın Al
        buyHqUpgrade: function (upgradeKey) {
            const upgradeCosts = {
                fuelContract: 2500,
                luxuryLounge: 3500,
                terminalPlatform: 6000,
                corporateBrand: 9500
            };

            const upgradeNames = {
                fuelContract: "Akaryakıt Filo Sözleşmesi (-%20 Yakıt Gideri)",
                luxuryLounge: "Lüks Dinlenme Tesisi Anlaşması (%50 Hızlı Mola & Enerji)",
                terminalPlatform: "Otogar Peron İmtiyazı (+%25 Yolcu Talebi)",
                corporateBrand: "Ulusal Reklam & Marka Tescili (+%25 Bilet Primi)"
            };

            const cost = upgradeCosts[upgradeKey];
            if (!cost) return;

            if (this.data.hqUpgrades[upgradeKey]) {
                if (typeof UI !== 'undefined') UI.showToast("Bu kurumsal avantaj zaten satın alınmış!", "info");
                return;
            }

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < cost) {
                const msg = `Yetersiz bakiye! ${upgradeNames[upgradeKey]} için ${cost.toLocaleString('tr-TR')} ₺ gerekiyor.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined') UI.showToast(`⚠️ ${msg}`, "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= cost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.data.hqUpgrades[upgradeKey] = true;
            this.saveData();

            this.playCashChime();
            const msg = `🏢 KURUMSAL YATIRIM TAMAMLANDI! ${upgradeNames[upgradeKey]} filonuza kalıcı olarak eklendi!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.renderAll();
        },

        // Web Audio Synthesizer Ses Efektleri
        getAudioCtx: function () {
            if (typeof audio !== 'undefined' && audio.ctx) return audio.ctx;
            if (!this._internalAudioCtx && typeof window !== 'undefined') {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (AudioCtxClass) this._internalAudioCtx = new AudioCtxClass();
            }
            return this._internalAudioCtx;
        },

        playCashChime: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                // İki aşamalı altın para şıngırtısı (High bell chime)
                const freqs = [987.77, 1318.51, 1975.53];
                freqs.forEach((freq, idx) => {
                    const t = now + (idx * 0.08);
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.linearRampToValueAtTime(0.28, t + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.38);
                });
            } catch(e) {}
        },

        playRadioBeep: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1760, now); // A6 radio burst
                osc.frequency.setValueAtTime(2200, now + 0.04);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.1);
            } catch(e) {}
        },

        playAiDispatchSound: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                // Fütüristik akıllı algoritma arpeji (D5 -> F#5 -> A5 -> D6)
                const notes = [587.33, 739.99, 880.00, 1174.66];
                notes.forEach((freq, idx) => {
                    const t = now + (idx * 0.07);
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.24);
                });
            } catch(e) {}
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

            const currentLvl = this.companyLevels.find(l => l.level === (this.data.companyLevel || 1)) || this.companyLevels[0];
            const introMsg = `${this.data.companyName} yönetim paneli açıldı. Seviyeniz: ${currentLvl.badge} ${currentLvl.title}. Filoda ${this.data.hiredDrivers.length} kaptan çalışıyor.`;
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
            <div id="company-system-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="company-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8600; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <div class="glass-panel" style="max-width: 940px; width: 96%; padding: 22px 26px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2px solid #ca8a04; box-shadow: 0 0 45px rgba(202, 138, 4, 0.35); border-radius: 14px;">
                    
                    <!-- Başlık ve Kapatma -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(250, 204, 21, 0.2); padding-bottom: 10px;">
                        <div>
                            <h2 id="company-modal-title" style="font-size: 1.75rem; margin: 0; color: #facc15; display: flex; align-items: center; gap: 8px;">
                                🏢 Şirket Kur veya Var Olan Bir Şirkette Çalış
                            </h2>
                            
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <button id="btn-company-ai-dispatch-top" class="modern-btn nav-item" style="padding: 8px 16px; background: linear-gradient(135deg, #0284c7, #38bdf8); color: #000; font-weight: bold; border: 1px solid #7dd3fc; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;" aria-label="Yapay Zeka Filo Müdürü: Tek tuşla tüm şoförleri en karlı seferlere otomatik dağıt">
                                🤖 Akıllı Filo Dağıtımı (AI)
                            </button>
                            <button id="btn-close-company-modal" class="modern-btn nav-item" style="padding: 7px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; cursor: pointer; border-radius: 8px;" aria-label="Şirket Menüsünü Kapat (Esc)">✕ Kapat</button>
                        </div>
                    </div>

                    <!-- Şirket Bilgi ve İstatistik Kartı -->
                    <div id="company-overview-card" style="background: linear-gradient(135deg, rgba(202, 138, 4, 0.25), rgba(161, 98, 7, 0.35)); border: 1.5px solid #eab308; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
                        <!-- Dinamik doldurulacak -->
                    </div>

                    <!-- 5 Sekme Butonları -->
                    <div style="display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap;">
                        <button id="tab-comp-drivers" class="modern-btn nav-item" style="flex: 1; min-width: 130px; padding: 9px 8px; font-weight: bold; background: rgba(234, 179, 8, 0.3); border: 1.5px solid #facc15; color: #fff; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            🏢 Kendi Filom & Şoförlerim
                        </button>
                        <button id="tab-comp-corporate-work" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            👔 Var Olan Bir Şirkete Katıl (Maaşlı)
                        </button>
                        <button id="tab-comp-market-trends" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.9rem;">
                            📈 Sefer Borsası & VIP İhale
                        </button>
                        <button id="tab-comp-hire" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.9rem;">
                            👨‍✈️ Şoför Pazarı & Transfer
                        </button>
                        <button id="tab-comp-hq" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.9rem;">
                            🏢 Şirket Gelişimi & Merkez
                        </button>
                        <button id="tab-comp-radio" class="modern-btn nav-item" style="flex: 1; min-width: 130px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.9rem;">
                            📻 Canlı Telsiz
                        </button>
                    </div>

                    <!-- 1. SEKME: Şoförlerim & Filo Yönetimi -->
                    <div id="panel-comp-drivers" style="display: block;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                            <span style="font-size: 0.9rem; color: #cbd5e1;">Filodaki kaptanlarınızın araç, rota, enerji ve canlı ilerlemeleri:</span>
                            <div style="display: flex; gap: 6px;">
                                <button id="btn-comp-repair-all" class="modern-btn nav-item" style="padding: 5px 12px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-size: 0.85rem; cursor: pointer; border-radius: 6px;">
                                    🛠️ Tüm Filoya Bakım Yap
                                </button>
                            </div>
                        </div>
                        <div id="company-hired-list" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 2. SEKME: Sefer Borsası & VIP İhaleler -->
                    <div id="panel-comp-market-trends" style="display: none;">
                        <div id="company-trends-container" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 3. SEKME: Şoför Pazarı & Transfer -->
                    <div id="panel-comp-hire" style="display: none;">
                        <div id="company-market-list" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 4. SEKME: Şirket Gelişimi & Kurumsal Avantajlar -->
                    <div id="panel-comp-hq" style="display: none;">
                        <div id="company-hq-container" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 6. SEKME: Var Olan Bir Şirkette Çalış (Maaşlı Kaptanlık) -->
                    <div id="panel-comp-corporate-work" style="display: none;">
                        <div style="background: rgba(15,23,42,0.6); padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <h3 style="color: #fde047; margin: 0 0 4px 0; font-size: 1.1rem;">👔 Kurumsal Taşımacılık: Şirketlerde Maaşlı Kaptan Ol</h3>
                            <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0;">
                                Kendi şirketinizi yönetmek yerine Türkiye'nin köklü otobüs firmalarına katılarak günlük garanti maaş, sefer primleri ve kurumsal üniforma ayrıcalığı kazanabilirsiniz.
                            </p>
                        </div>
                        <div id="corporate-work-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 5. SEKME: Canlı Telsiz Kayıtları -->
                    <div id="panel-comp-radio" style="display: none;">
                        <div id="company-radio-container" style="max-height: 48vh; overflow-y: auto; background: rgba(15,23,42,0.7); border: 1px solid #334155; border-radius: 8px; padding: 12px;" role="status" aria-live="polite">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Kapat butonları
            document.getElementById('btn-close-company-modal').addEventListener('click', () => {
                this.closeCompanyModal();
            });

            // AI Dağıtım butonu
            document.getElementById('btn-company-ai-dispatch-top').addEventListener('click', () => {
                this.autoDispatchAllAI();
            });

            // Tüm filoya bakım
            document.getElementById('btn-comp-repair-all').addEventListener('click', () => {
                this.repairAllFleet();
            });

            // Sekme geçişleri
            const tabs = [
                { tabId: 'tab-comp-drivers', panelId: 'panel-comp-drivers' },
                { tabId: 'tab-comp-corporate-work', panelId: 'panel-comp-corporate-work' },
                { tabId: 'tab-comp-market-trends', panelId: 'panel-comp-market-trends' },
                { tabId: 'tab-comp-hire', panelId: 'panel-comp-hire' },
                { tabId: 'tab-comp-hq', panelId: 'panel-comp-hq' },
                { tabId: 'tab-comp-radio', panelId: 'panel-comp-radio' }
            ];

            tabs.forEach(t => {
                const btn = document.getElementById(t.tabId);
                if (btn) {
                    btn.addEventListener('click', () => {
                        tabs.forEach(other => {
                            const otherBtn = document.getElementById(other.tabId);
                            const otherPanel = document.getElementById(other.panelId);
                            if (otherBtn && otherPanel) {
                                if (other.tabId === t.tabId) {
                                if (t.tabId === 'tab-comp-corporate-work') {
                                    const caps = this.getCaptainCompanies();
                                    if (caps.length === 0) {
                                        if (typeof audio !== 'undefined' && audio.speak) {
                                            audio.speak("Var olan bir şirkete katıl menüsü açıldı. Görünüşe göre kimse şirket kurmamış. İlk şirketinizi oluşturmak için yeni bir şirket kur butonuna basınız. Kurumsal firmalar listelendi.");
                                        }
                                    } else {
                                        if (typeof audio !== 'undefined' && audio.speak) {
                                            audio.speak(`Var olan bir şirkete katıl menüsü açıldı. Kaptanlar tarafından kurulan ${caps.length} şirket ve kurumsal firmalar listelendi.`);
                                        }
                                    }
                                }
                                    otherBtn.style.background = 'rgba(234, 179, 8, 0.3)';
                                    otherBtn.style.borderColor = '#facc15';
                                    otherBtn.style.color = '#fff';
                                    otherPanel.style.display = 'block';
                                } else {
                                    otherBtn.style.background = 'rgba(255,255,255,0.06)';
                                    otherBtn.style.borderColor = 'rgba(255,255,255,0.2)';
                                    otherBtn.style.color = '#94a3b8';
                                    otherPanel.style.display = 'none';
                                }
                            }
                        });
                        this.renderAll();
                    });
                }
            });
        },

        // Tüm Paneli Render Et
        renderAll: function () {
            this.renderCompanyOverview();
            this.renderHiredDrivers();
            this.renderMarketTrends();
            this.renderDriverMarket();
            this.renderHqUpgrades();
            this.renderRadioLogs();
            this.renderCorporateWork();
        },

        // Şirket Başlık Kartını Render Et
        renderCompanyOverview: function () {
            const card = document.getElementById('company-overview-card');
            if (!card) return;

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            const hiredCount = this.data.hiredDrivers.length;
            const revFormatted = (this.data.totalRevenue || 0).toLocaleString('tr-TR');
            const lvlInfo = this.companyLevels.find(l => l.level === (this.data.companyLevel || 1)) || this.companyLevels[0];

            const empId = this.data.corporateEmployer;
            const empComp = this.getCompanyById(empId);

            const empBadge = empComp
                ? `<div style="margin-top: 8px; padding: 8px 12px; background: rgba(34,197,94,0.18); border: 1.5px solid #22c55e; border-radius: 8px; font-size: 0.88rem; color: #86efac; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                    <span>👔 <strong>Maaşlı Kaptan:</strong> ${empComp.name} (${empComp.badge}) | Günlük Maaş: <strong style="color: #fde047;">${empComp.dailySalary.toLocaleString('tr-TR')} ₺</strong> | Sefer Primi: <strong style="color: #4ade80;">+${empComp.bonusPercent}%</strong></span>
                    <button id="btn-comp-leave-corp" class="modern-btn nav-item" style="padding: 4px 12px; font-size: 0.8rem; background: rgba(239,68,68,0.25); border: 1px solid #ef4444; color: #fca5a5; border-radius: 6px; cursor: pointer;">Kendi Şirketime Dön</button>
                   </div>`
                : `<div style="margin-top: 8px; padding: 8px 12px; background: rgba(234,179,8,0.15); border: 1.5px solid #facc15; border-radius: 8px; font-size: 0.88rem; color: #fef08a; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                    <span>🏢 <strong>Bağımsız Şirket Sahibi:</strong> Kendi filonuzu ve şoförlerinizi yönetiyorsunuz. Tüm gelirler doğrudan şirket kasanıza aktarılır.</span>
                    <button id="btn-comp-go-corp-tab" class="modern-btn nav-item" style="padding: 4px 12px; font-size: 0.8rem; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #7dd3fc; border-radius: 6px; cursor: pointer;">👔 Şirketlerde Çalış</button>
                   </div>`;

            card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <div style="color: #fde047; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <span>🏢 ${this.data.companyName}</span>
                        <button id="btn-rename-company" class="modern-btn nav-item" style="padding: 3px 10px; font-size: 0.8rem; background: rgba(255,255,255,0.12); border: 1px solid #fde047; color: #fde047; border-radius: 6px; cursor: pointer;" title="Şirket İsmini Değiştir">✏️ Şirket Kur / İsim Düzenle</button>
                        <span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid #facc15; color: #fef08a;">
                            ${lvlInfo.badge} Seviye ${lvlInfo.level}: ${lvlInfo.title}
                        </span>
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.88rem; margin-top: 4px;">
                        Kayıtlı Filo: <strong style="color: #38bdf8;">${hiredCount} Kaptan</strong> | Tamamlanan Sefer: <strong style="color: #4ade80;">${this.data.completedTripsCount}</strong> | Holding Ayrıcalığı: <span style="color: #a7f3d0;">${lvlInfo.perkDesc}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #4ade80; font-size: 1.25rem; font-weight: bold;">
                        💰 Şirket Cirosu: ${revFormatted} ₺
                    </div>
                    <div style="color: #fde047; font-size: 0.95rem;">
                        Şirket Kasası: <strong>${currentBudget.toLocaleString('tr-TR')} ₺</strong>
                    </div>
                </div>
            </div>
            ${empBadge}
            `;

            const btnRename = card.querySelector('#btn-rename-company');
            if (btnRename) {
                btnRename.addEventListener('click', () => {
                    this.openCreateCompanyModal();
                });
            }

            const btnLeave = card.querySelector('#btn-comp-leave-corp');
            if (btnLeave) {
                btnLeave.addEventListener('click', () => {
                    this.leaveCorporateCompany();
                });
            }

            const btnGoCorp = card.querySelector('#btn-comp-go-corp-tab');
            if (btnGoCorp) {
                btnGoCorp.addEventListener('click', () => {
                    const tabCorp = document.getElementById('tab-comp-corporate-work');
                    if (tabCorp) tabCorp.click();
                });
            }
        },

        // Kiralanmış Şoförleri, Araçları, Kondisyon ve Enerji Durumlarını Render Et
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

            // Sahip olunan veya mevcut otobüsler listesi
            let ownedBusIds = [];
            if (typeof BusFleet !== 'undefined' && typeof BusFleet.getOwnedBusIds === 'function') {
                ownedBusIds = BusFleet.getOwnedBusIds();
            }
            if (!ownedBusIds || ownedBusIds.length === 0) {
                ownedBusIds = ["otokar_sultan_mega", "otokar_kent_lf", "mercedes_travego_16sh"];
            }

            this.data.hiredDrivers.forEach(driver => {
                const route = this.availableRoutes.find(r => r.id === driver.assignedRouteId) || this.availableRoutes[0];
                const rankInfo = this.getDriverRankInfo(driver);
                const bus = this.getBusInfo(driver.assignedBusId);
                const busCond = this.getBusCondition(driver.assignedBusId);

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
                    : ((driver.status === 'resting') ? `☕ Mola (%${driver.energy || 50} Enerji)` : `🅿️ Garajda Bekliyor`);

                // Canlı Borsa Trend Rozeti
                const trend = (this.data.marketTrends && this.data.marketTrends[route.id]) ? this.data.marketTrends[route.id] : null;
                const trendBadge = trend 
                    ? `<span style="padding: 2px 6px; border-radius: 6px; background: rgba(239,68,68,0.25); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.8rem; font-weight: bold; margin-left: 6px;">${trend.icon} ${trend.trendName} (x${trend.multiplier})</span>` 
                    : '';

                const div = document.createElement('div');
                div.style.cssText = "background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px; margin-bottom: 12px;";
                div.innerHTML = `
                <!-- Kaptan Başlığı ve Durum -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <strong style="color: #fff; font-size: 1.15rem;">${driver.avatar} ${driver.name}</strong> 
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; background: rgba(202, 138, 4, 0.25); border: 1px solid #facc15; color: #fde047; margin-left: 6px;">
                            ${rankInfo.badge} Seviye ${rankInfo.level}: ${rankInfo.title}
                        </span>
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #7dd3fc; margin-left: 6px;" title="${driver.traitDesc || ''}">
                            ${driver.traitBadge || '⭐'} ${driver.traitName || 'Uzman Kaptan'}
                        </span>
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; background: rgba(255,255,255,0.1); color: ${statusColor};">
                            ${statusLabel}
                        </span>
                        <button id="btn-driver-coffee-${driver.id}" class="modern-btn nav-item" style="padding: 4px 8px; background: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; color: #fef08a; font-size: 0.8rem; border-radius: 6px; cursor: pointer;" title="120 ₺ ile enerjiyi anında %100 tazele">
                            ☕ Dinlendir (120 ₺)
                        </button>
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

                <!-- Atanmış Araç ve Kondisyon Paneli -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; font-size: 0.85rem; flex-wrap: wrap; gap: 6px;">
                    <div>
                        🚌 <strong>Tahsisi Araç:</strong> <span style="color: #38bdf8;">${bus.icon} ${bus.fullName}</span> (${bus.seatCapacity} Koltuk)
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>Mekanik Kondisyon: <strong style="color: ${busCond > 60 ? '#4ade80' : (busCond > 30 ? '#facc15' : '#ef4444')};">%${busCond}</strong></span>
                        <button id="btn-bus-repair-${driver.id}" class="modern-btn nav-item" style="padding: 2px 8px; font-size: 0.78rem; background: rgba(34,197,94,0.2); border: 1px solid #22c55e; color: #86efac; border-radius: 4px; cursor: pointer;">
                            🛠️ Bakım Yap
                        </button>
                    </div>
                </div>

                <!-- Aktif Hat ve Canlı Trend -->
                <div style="color: #facc15; font-size: 0.92rem; margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                    <span>📍 <strong>Sefer Hattı:</strong> ${route.name}</span>
                    ${trendBadge}
                </div>

                <!-- Sefer İlerleme Çubuğu -->
                <div style="background: rgba(0,0,0,0.5); border-radius: 6px; height: 10px; width: 100%; overflow: hidden; margin-bottom: 8px;">
                    <div id="prog-bar-${driver.id}" style="background: linear-gradient(90deg, #ca8a04, #facc15); height: 100%; width: ${tripProgressPct}%; transition: width 0.3s;"></div>
                </div>

                <!-- Kontroller: Rota ve Araç Seçici -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #cbd5e1; flex-wrap: wrap; gap: 8px;">
                    <div>
                        Sefer: <strong>${driver.totalTripsMade || 0}</strong> | Kazandırdığı: <strong style="color: #4ade80;">${(driver.totalEarningsMade || 0).toLocaleString('tr-TR')} ₺</strong> | Enerji: <strong style="color: #38bdf8;">%${driver.energy || 100}</strong>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <!-- Araç Seç -->
                        <select id="bus-select-${driver.id}" class="modern-btn" style="padding: 4px 6px; font-size: 0.82rem; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px;">
                            ${ownedBusIds.map(bId => {
                                const b = this.getBusInfo(bId);
                                return `<option value="${b.id}" ${b.id === driver.assignedBusId ? 'selected' : ''}>${b.icon} ${b.fullName}</option>`;
                            }).join('')}
                        </select>

                        <!-- Rota Seç -->
                        <select id="route-select-${driver.id}" class="modern-btn" style="padding: 4px 6px; font-size: 0.82rem; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px;">
                            ${this.availableRoutes.map(r => `<option value="${r.id}" ${r.id === driver.assignedRouteId ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>

                        <button id="btn-change-dispatch-${driver.id}" class="modern-btn nav-item" style="padding: 4px 10px; background: #0284c7; border: 1px solid #38bdf8; color: #fff; font-size: 0.82rem; cursor: pointer; border-radius: 6px;">
                            Sefere Sür
                        </button>
                    </div>
                </div>
                `;

                container.appendChild(div);

                // Olay Dinleyicileri
                div.querySelector(`#btn-change-dispatch-${driver.id}`).addEventListener('click', () => {
                    const selRoute = div.querySelector(`#route-select-${driver.id}`).value;
                    const selBus = div.querySelector(`#bus-select-${driver.id}`).value;
                    this.dispatchDriver(driver.id, selRoute, selBus);
                });

                div.querySelector(`#btn-driver-coffee-${driver.id}`).addEventListener('click', () => {
                    this.boostDriverEnergy(driver.id);
                });

                div.querySelector(`#btn-bus-repair-${driver.id}`).addEventListener('click', () => {
                    this.repairBus(driver.assignedBusId);
                });
            });
        },

        // Sefer İlerleme Çubuklarını Canlı Tazele
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

        // Canlı Sefer Borsası ve VIP İhaleleri Render Et
        renderMarketTrends: function () {
            const container = document.getElementById('company-trends-container');
            if (!container) return;

            container.innerHTML = '';

            // 1. Canlı Piyasa Bülteni
            const trendsHtml = `
            <div style="background: rgba(15,23,42,0.85); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="color: #38bdf8; font-size: 1.15rem; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                        📈 Karayolları Canlı Borsa Bülteni
                    </div>
                    <button id="btn-refresh-trends-manual" class="modern-btn nav-item" style="padding: 4px 10px; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #7dd3fc; font-size: 0.8rem; cursor: pointer; border-radius: 6px;">
                        🔄 Borsayı Güncelle
                    </button>
                </div>
                <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0 0 10px 0;">
                    Yolcu talepleri ve bilet fiyatları dinamik dalgalanır! Talebin zirve yaptığı rotalara şoförlerinizi yönlendirerek devasa hasılat toplayın.
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
                    ${this.availableRoutes.map(route => {
                        const trend = (this.data.marketTrends && this.data.marketTrends[route.id]) ? this.data.marketTrends[route.id] : null;
                        const mult = trend ? trend.multiplier : 1.0;
                        const multColor = mult >= 1.5 ? '#4ade80' : (mult > 1.0 ? '#facc15' : '#94a3b8');

                        return `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #fff; font-size: 0.9rem;">
                                <span>${route.name}</span>
                                <span style="color: ${multColor}; font-size: 1.05rem;">x${mult}</span>
                            </div>
                            <div style="color: #38bdf8; font-size: 0.82rem; margin-top: 3px;">
                                ${trend ? `${trend.icon} ${trend.trendName}` : 'Normal Sefer Tarifesi'}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.78rem; margin-top: 2px;">
                                ${trend ? trend.desc : 'Standart yolcu akışı.'}
                            </div>
                            <div style="margin-top: 6px; font-size: 0.8rem; color: #cbd5e1;">
                                Tahmini Bilet: <strong style="color: #facc15;">${Math.round(route.baseTicketPrice * mult)} ₺</strong> | Ortalama Yolcu: ${route.avgPassengers}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            `;

            // 2. VIP Özel İhaleler
            const contractsHtml = `
            <div style="background: rgba(15,23,42,0.85); border: 1.5px solid #eab308; border-radius: 10px; padding: 14px;">
                <div style="color: #facc15; font-size: 1.15rem; font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    🏆 VIP Özel Şirket İhaleleri & Protokol Kontratları
                </div>
                <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0 0 10px 0;">
                    Yüksek bütçeli kurumsal kurum ve spor kulübü ihaleleri. Şartları sağlayan usta kaptanınızı görevlendirip peşin prim kazanın!
                </p>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${(this.data.specialContracts && this.data.specialContracts.length > 0) ? this.data.specialContracts.map(contract => {
                        return `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="color: #fde047; font-weight: bold; font-size: 1rem;">
                                    ${contract.icon} ${contract.title}
                                </div>
                                <div style="color: #38bdf8; font-size: 0.85rem; margin-top: 2px;">
                                    Kurum: <strong>${contract.client}</strong> | Peşin Prim: <strong style="color: #4ade80; font-size: 1.05rem;">+${contract.rewardBonus.toLocaleString('tr-TR')} ₺</strong>
                                </div>
                                <div style="color: #cbd5e1; font-size: 0.82rem; margin-top: 4px; max-width: 520px;">
                                    ${contract.desc} (Gereken Kaptan: En az Seviye ${contract.reqMinRank} Kaptan)
                                </div>
                            </div>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <select id="contract-driver-select-${contract.id}" class="modern-btn" style="padding: 6px; font-size: 0.85rem; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px;">
                                    ${this.data.hiredDrivers.map(d => `<option value="${d.id}">${d.avatar} ${d.name} (${d.rankTitle})</option>`).join('')}
                                </select>
                                <button id="btn-accept-contract-${contract.id}" class="modern-btn nav-item" style="padding: 8px 14px; background: linear-gradient(135deg, #ca8a04, #eab308); color: #000; font-weight: bold; border-radius: 6px; cursor: pointer; border: none;">
                                    İhaleyi Al
                                </button>
                            </div>
                        </div>
                        `;
                    }).join('') : '<div style="color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 12px;">Şu anda açıkta yeni ihale yok. 90 saniye sonra yeni ihaleler düşecektir.</div>'}
                </div>
            </div>
            `;

            container.innerHTML = trendsHtml + contractsHtml;

            // Olay dinleyicileri
            const btnRefresh = container.querySelector('#btn-refresh-trends-manual');
            if (btnRefresh) {
                btnRefresh.addEventListener('click', () => {
                    this.updateMarketFluctuations();
                });
            }

            if (this.data.specialContracts) {
                this.data.specialContracts.forEach(contract => {
                    const btn = container.querySelector(`#btn-accept-contract-${contract.id}`);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            const sel = container.querySelector(`#contract-driver-select-${contract.id}`);
                            const drvId = sel ? sel.value : null;
                            this.acceptSpecialContract(contract.id, drvId);
                        });
                    }
                });
            }
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
                div.style.cssText = "background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;";
                div.innerHTML = `
                <div>
                    <div style="font-size: 1.15rem; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 6px;">
                        <span>${d.avatar} ${d.name}</span> 
                        <span style="font-size: 0.85rem; color: #facc15; padding: 2px 8px; border-radius: 6px; background: rgba(202, 138, 4, 0.2); border: 1px solid #facc15;">
                            ${startRank.badge} ${startRank.title}
                        </span>
                        <span style="font-size: 0.82rem; color: #38bdf8; padding: 2px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8;">
                            ${d.traitBadge} ${d.traitName}
                        </span>
                    </div>
                    <div style="color: #a7f3d0; font-size: 0.88rem; margin-top: 4px;">
                        💡 <strong>Özel Nitelik:</strong> ${d.traitDesc}
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.84rem; margin-top: 3px; max-width: 520px;">
                        ${d.desc}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.82rem; margin-top: 4px;">
                        Sefer Başı Maaş: <strong style="color: #fbbf24;">${d.wagePerTrip} ₺</strong> | Tercih Ettiği Araç: ${d.preferredBusClass.toUpperCase()}
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
        },

        // Şirket Gelişimi & Kurumsal Avantajları Render Et
        renderHqUpgrades: function () {
            const container = document.getElementById('company-hq-container');
            if (!container) return;

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            const upgrades = [
                {
                    key: "fuelContract",
                    title: "⛽ Akaryakıt Filo Sözleşmesi",
                    cost: 2500,
                    desc: "Tüm filoda geçerli toplu akaryakıt anlaşması. Sefer başı yakıt giderlerini kalıcı olarak %20 azaltır.",
                    icon: "🛢️"
                },
                {
                    key: "luxuryLounge",
                    title: "☕ Lüks Otogar Dinlenme Tesisi",
                    cost: 3500,
                    desc: "Şoförlerin mola süresini yarı yarıya düşürür (%50 hızlı dinlenme) ve enerji dolumunu 2 kat hızlandırır.",
                    icon: "🏨"
                },
                {
                    key: "terminalPlatform",
                    title: "🏛️ Merkezi Otogar Peron İmtiyazı",
                    cost: 6000,
                    desc: "Büyükşehir otogarlarında 1 numaralı peron tahsisi. Tüm rotalarda ortalama yolcu çekimini +%25 artırır.",
                    icon: "🎫"
                },
                {
                    key: "corporateBrand",
                    title: "⭐ Ulusal Reklam & Marka Tescili",
                    cost: 9500,
                    desc: "Şirketinizin marka değeri tavan yapar! Tüm hatlarda bilet fiyatlarına %25 marka primi eklenir.",
                    icon: "📺"
                }
            ];

            container.innerHTML = `
            <div style="background: rgba(15,23,42,0.8); border: 1.5px solid #a855f7; border-radius: 10px; padding: 14px; margin-bottom: 14px;">
                <div style="color: #c084fc; font-size: 1.15rem; font-weight: bold; margin-bottom: 4px;">
                    🏢 Şirket Büyüme Basamakları (HQ Seviyesi)
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-top: 8px;">
                    ${this.companyLevels.map(lvl => {
                        const isReached = (this.data.companyLevel || 1) >= lvl.level;
                        return `
                        <div style="background: ${isReached ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isReached ? '#c084fc' : '#334155'}; border-radius: 8px; padding: 10px; text-align: center;">
                            <div style="font-size: 1.4rem;">${lvl.badge}</div>
                            <div style="font-weight: bold; color: ${isReached ? '#fff' : '#64748b'}; font-size: 0.9rem;">${lvl.title}</div>
                            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 2px;">${lvl.perkDesc}</div>
                            ${isReached ? '<div style="color: #4ade80; font-size: 0.75rem; font-weight: bold; margin-top: 4px;">✓ AKTİF</div>' : `<div style="color: #94a3b8; font-size: 0.72rem; margin-top: 4px;">${lvl.reqTrips} Sefer & ${lvl.reqRev.toLocaleString('tr-TR')} ₺</div>`}
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div style="background: rgba(15,23,42,0.8); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 14px;">
                <div style="color: #38bdf8; font-size: 1.15rem; font-weight: bold; margin-bottom: 6px;">
                    💼 Kurumsal Şirket Yatırımları & Pasif Avantajlar
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${upgrades.map(up => {
                        const isOwned = this.data.hqUpgrades && this.data.hqUpgrades[up.key];
                        const canAfford = currentBudget >= up.cost;

                        return `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="font-size: 1rem; font-weight: bold; color: #fff;">
                                    ${up.icon} ${up.title}
                                </div>
                                <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 2px; max-width: 520px;">
                                    ${up.desc}
                                </div>
                            </div>
                            <div>
                                ${isOwned ? `
                                    <button class="modern-btn" disabled style="padding: 8px 16px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 6px;">
                                        ✓ Şirketinizde Aktif
                                    </button>
                                ` : `
                                    <button id="btn-buy-upgrade-${up.key}" class="modern-btn nav-item" style="padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; ${canAfford ? 'background: #0284c7; border: 1px solid #38bdf8; color: #fff;' : 'background: rgba(255,255,255,0.08); color: #64748b; border: 1px solid #334155;'}">
                                        Satın Al (${up.cost.toLocaleString('tr-TR')} ₺)
                                    </button>
                                `}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            `;

            upgrades.forEach(up => {
                const btn = container.querySelector(`#btn-buy-upgrade-${up.key}`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        this.buyHqUpgrade(up.key);
                    });
                }
            });
        },

        // Canlı Telsiz Kayıtlarını Render Et
        renderRadioLogs: function () {
            const container = document.getElementById('company-radio-container');
            if (!container) return;

            if (!this.data.radioLogs || this.data.radioLogs.length === 0) {
                container.innerHTML = '<div style="color: #94a3b8; font-size: 0.85rem; text-align: center;">Henüz telsiz kaydı bulunmuyor. Şoförler yola çıktıkça anonslar buraya düşecektir.</div>';
                return;
            }

            container.innerHTML = this.data.radioLogs.map(log => {
                const color = log.type === "success" ? "#4ade80" : (log.type === "system" ? "#facc15" : "#7dd3fc");
                return `
                <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding: 6px 0; font-size: 0.85rem; display: flex; align-items: flex-start; gap: 8px;">
                    <span style="color: #64748b; font-size: 0.78rem; min-width: 60px;">[${log.time}]</span>
                    <div>
                        <strong style="color: ${color};">${log.avatar} ${log.sender}:</strong>
                        <span style="color: #f1f5f9; margin-left: 4px;">${log.text}</span>
                    </div>
                </div>
                `;
            }).join('');
        },

        setCompanyName: function(newName) {
            this.data.companyName = newName;
            this.saveData();
            this.renderCompanyOverview();
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 Şirket İsmi: ${this.data.companyName}`, 'success');
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Şirket ismi ${this.data.companyName} olarak kaydedildi.`);
        },

        joinCorporateCompany: function(companyId) {
            const comp = this.getCompanyById(companyId);
            if (!comp) return;

            const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
            if (currentLevel < (comp.minLevel || 1)) {
                const lockMsg = `Bu şirkete katılmak için Seviye ${comp.minLevel} kaptanlık derecesine sahip olmalısınız (Mevcut Seviyeniz: ${currentLevel}).`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(lockMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(lockMsg, 'warning');
                return;
            }

            // Kaptan şirketi kontenjan kontrolü
            if (comp.isCaptainCompany) {
                let activeCount = parseInt(comp.activeCaptainsCount) || 1;
                const maxQuota = parseInt(comp.maxCaptainsQuota) || 10;
                if (activeCount >= maxQuota) {
                    const fullMsg = `Bu şirketin kaptan kontenjanı doludur! (${activeCount}/${maxQuota} Kaptan).`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(fullMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(fullMsg, 'warning');
                    return;
                }

                // Eski şirketten ayrılma sayısını düşür
                if (this.data.corporateEmployer) {
                    this.adjustCaptainCompanyWorkers(this.data.corporateEmployer, -1);
                }

                // Yeni şirketin çalışan sayısını artır
                this.adjustCaptainCompanyWorkers(comp.id, 1);
            }

            this.data.corporateEmployer = comp.id;
            this.saveData();

            // İlk işe başlama primini hediye et
            if (typeof Game !== 'undefined') {
                Game.playerBudget += comp.dailySalary;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            const successMsg = comp.isCaptainCompany 
                ? `Tebrikler! Kurucu Kaptan ${comp.founder} tarafından kurulan ${comp.name} bünyesinde göreve başladınız. İlk günlük maaşınız ${comp.dailySalary.toLocaleString('tr-TR')} ₺ hesabınıza yatırıldı.`
                : `Tebrikler! ${comp.name} bünyesinde maaşlı kaptan olarak göreve başladınız. İlk günlük maaşınız ${comp.dailySalary.toLocaleString('tr-TR')} ₺ hesabınıza yatırıldı.`;

            if (typeof audio !== 'undefined' && audio.speak) audio.speak(successMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`👔 ${comp.name} Kadrosuna Katıldınız! (+${comp.dailySalary.toLocaleString('tr-TR')} ₺)`, 'success');

            this.renderAll();
        },

        adjustCaptainCompanyWorkers: function(companyId, delta) {
            let list = this.getCaptainCompanies();
            const target = list.find(c => c.id === companyId);
            if (target) {
                target.activeCaptainsCount = Math.max(1, (parseInt(target.activeCaptainsCount) || 1) + delta);
                try {
                    localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(list));
                } catch(e) {}
            }
        },

        leaveCorporateCompany: function() {
            if (this.data.corporateEmployer) {
                this.adjustCaptainCompanyWorkers(this.data.corporateEmployer, -1);
            }
            this.data.corporateEmployer = null;
            this.saveData();

            const msg = "Şirketten ayrıldınız. Artık bağımsız çalışıyorsunuz.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🏢 Şirketten Ayrıldınız", "info");

            this.renderAll();
        },

        renderCorporateWork: function() {
            const container = document.getElementById('corporate-work-list');
            if (!container) return;

            const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
            const activeCorpId = this.data.corporateEmployer;
            const captainCompanies = this.getCaptainCompanies();

            let html = '';

            // --- 1. KAPTANLARIN KURDUĞU ŞİRKETLER BÖLÜMÜ ---
            if (captainCompanies.length === 0) {
                // Görünüşe göre kimse şirket kurmamış ikazı
                html += `
                <div style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border: 2.5px dashed #f59e0b; border-radius: 14px; padding: 26px 28px; text-align: center; margin-bottom: 16px; box-shadow: 0 6px 25px rgba(245, 158, 11, 0.2);">
                    <div style="font-size: 2.8rem; margin-bottom: 10px; animation: pulse 2s infinite;">🏢</div>
                    <div style="color: #fde047; font-size: 1.35rem; font-weight: 800; margin-bottom: 8px; letter-spacing: 0.5px;">
                        Görünüşe göre kimse şirket kurmamış.
                    </div>
                    <div style="color: #e2e8f0; font-size: 1rem; max-width: 650px; margin: 0 auto 18px auto; line-height: 1.6;">
                        İlk şirketinizi oluşturmak için aşağıdaki <strong>"Yeni Bir Şirket Kur"</strong> butonuna basınız. Şirketinizin adını, kaç kaptan çalıştırmak istediğinizi ve kaptanlara vereceğiniz günlük maaşı kendiniz belirlersiniz.
                    </div>
                    <button id="btn-empty-create-company" class="modern-btn nav-item" style="padding: 12px 30px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 800; border-radius: 10px; font-size: 1.05rem; cursor: pointer; border: none; box-shadow: 0 4px 20px rgba(245,158,11,0.45); transition: transform 0.2s;" aria-label="Yeni bir şirket kur">
                        🏢 Yeni Bir Şirket Kur
                    </button>
                </div>
                `;
            } else {
                // Kaptan şirketleri mevcut
                html += `
                <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px 16px;">
                    <div>
                        <div style="color: #facc15; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                            <span>👨‍✈️</span> <span>Kaptanların Kurduğu Şirketler (${captainCompanies.length} Şirket Aktif)</span>
                        </div>
                        <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 2px;">
                            Her şirketin kurucusu kaç kaptan çalıştıracağını ve kaptanlarına ne kadar maaş vereceğini kendisi belirler.
                        </div>
                    </div>
                    <button id="btn-sub-create-company" class="modern-btn nav-item" style="padding: 8px 18px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: bold; font-size: 0.92rem; border-radius: 8px; cursor: pointer; border: none; box-shadow: 0 2px 10px rgba(245,158,11,0.3);">
                        + Yeni Bir Şirket Kur
                    </button>
                </div>
                `;

                captainCompanies.forEach(comp => {
                    const isCurrent = (activeCorpId === comp.id);
                    const activeCount = parseInt(comp.activeCaptainsCount) || 1;
                    const maxQuota = parseInt(comp.maxCaptainsQuota) || 10;
                    const isFull = (activeCount >= maxQuota && !isCurrent);
                    const foundedDateStr = this.formatTurkishDate(comp.createdDate);
                    const salaryFormatted = (parseInt(comp.dailySalary) || 2500).toLocaleString('tr-TR');

                    html += `
                    <div style="background: rgba(15,23,42,0.92); border: 2px solid ${isCurrent ? '#22c55e' : '#f59e0b'}; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.18);">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <div>
                                    <div style="font-size: 1.25rem; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 8px;">
                                        <span>${comp.logo || '👑'}</span>
                                        <span>${comp.name}</span>
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 3px;">
                                        📅 <strong>Kurulma Tarihi:</strong> <span style="color: #bae6fd;">${foundedDateStr}</span> | 📍 <strong>Merkez:</strong> ${comp.city || 'Tekirdağ'}
                                    </div>
                                </div>
                                <span style="font-size: 0.82rem; padding: 4px 10px; border-radius: 6px; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fde047; font-weight: bold; white-space: nowrap;">
                                    👑 KAPTAN ŞİRKETİ
                                </span>
                            </div>

                            <div style="color: #fde047; font-size: 0.88rem; font-style: italic; margin-bottom: 12px;">
                                "${comp.slogan || 'Karayollarında Güven ve Kalite'}"
                            </div>

                            <!-- Kurucunun Belirlediği Şartlar & Kaptan Sayısı -->
                            <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; font-size: 0.9rem; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.08);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                                    <span>👑 Kurucu Kaptan:</span>
                                    <strong style="color: #fde047; font-size: 0.95rem;">${comp.founder || 'Kaptan'}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span>👥 Kaç Kaptan Çalışıyor (Kontenjan):</span>
                                    <strong style="color: ${isFull ? '#ef4444' : '#38bdf8'}; font-size: 0.95rem;">${activeCount} / ${maxQuota} Kaptan ${isFull ? '(Dolu)' : ''}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span>💰 Kaptanlara Verilen Günlük Maaş:</span>
                                    <strong style="color: #4ade80; font-size: 1.05rem;">${salaryFormatted} ₺ / Gün</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>🎁 Sefer Başı Bilet Primi:</span>
                                    <strong style="color: #facc15;">+%${comp.bonusPercent || 18}</strong>
                                </div>
                            </div>

                            <div style="color: #94a3b8; font-size: 0.84rem; line-height: 1.4; margin-bottom: 14px; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 6px;">
                                💡 <em>Kurucu Şartı:</em> Kurucu ${comp.founder} tarafından ${maxQuota} kaptanlık kadro açılmış olup, kaptan başına günlük ${salaryFormatted} ₺ garanti maaş ve +%${comp.bonusPercent || 18} sefer primi ödenmektedir.
                            </div>
                        </div>

                        <div>
                            ${isCurrent ? `
                                <button class="modern-btn btn-leave-company nav-item" data-company-id="${comp.id}" style="width: 100%; padding: 11px; background: rgba(34,197,94,0.2); border: 1.5px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.95rem;" aria-label="${comp.name} şirketinden ayrıl">
                                    ✅ AKTİF ÇALIŞTIĞINIZ ŞİRKET (Ayrıl)
                                </button>
                            ` : (isFull ? `
                                <button class="modern-btn" disabled style="width: 100%; padding: 11px; background: rgba(255,255,255,0.05); border: 1px solid #475569; color: #64748b; font-weight: bold; border-radius: 8px; font-size: 0.92rem;">
                                    🔒 Kontenjan Dolu (${maxQuota}/${maxQuota} Kaptan)
                                </button>
                            ` : `
                                <button class="modern-btn btn-join-company nav-item" data-company-id="${comp.id}" style="width: 100%; padding: 11px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); font-size: 0.95rem;" aria-label="${comp.name} şirketine maaşlı kaptan olarak katıl">
                                    ✍️ Bu Şirkete Katıl (Günlük ${salaryFormatted} ₺ Maaş)
                                </button>
                            `)}
                        </div>
                    </div>
                    `;
                });
            }

            // --- 2. KURUMSAL ULUSAL ŞİRKETLER BÖLÜMÜ ---
            html += `
            <div style="grid-column: 1 / -1; margin-top: 18px; margin-bottom: 6px;">
                <div style="color: #38bdf8; font-size: 1.18rem; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <span>🏛️</span> <span>Kurumsal Ulusal Şirketler (Kâmil Koç, Pamukkale, TEKULAŞ...)</span>
                </div>
            </div>
            `;

            this.corporateCompanies.forEach(comp => {
                const isCurrent = (activeCorpId === comp.id);
                const isUnlocked = (currentLevel >= comp.minLevel);

                html += `
                <div style="background: rgba(15,23,42,0.85); border: 1.5px solid ${isCurrent ? '#22c55e' : (isUnlocked ? comp.color : '#334155')}; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="font-size: 1.15rem; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 8px;">
                                <span>${comp.logo}</span>
                                <span>${comp.name}</span>
                            </div>
                            <span style="font-size: 0.8rem; padding: 2px 8px; border-radius: 6px; background: rgba(0,0,0,0.5); border: 1px solid ${comp.color}; color: #fff;">
                                ${comp.badge}
                            </span>
                        </div>
                        <div style="color: #94a3b8; font-size: 0.83rem; font-style: italic; margin-bottom: 8px;">
                            "${comp.slogan}"
                        </div>
                        <div style="background: rgba(255,255,255,0.04); border-radius: 6px; padding: 8px; margin-bottom: 8px; font-size: 0.85rem; color: #cbd5e1;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>💰 Günlük Maaş:</span>
                                <strong style="color: #fde047;">${comp.dailySalary.toLocaleString('tr-TR')} ₺</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>🎁 Sefer Başı Bilet Primi:</span>
                                <strong style="color: #4ade80;">+%${comp.bonusPercent}</strong>
                            </div>
                        </div>
                        <div style="color: #cbd5e1; font-size: 0.83rem; line-height: 1.3; margin-bottom: 12px;">
                            💡 ${comp.desc}
                        </div>
                    </div>
                    <div>
                        ${isCurrent ? `
                            <button class="modern-btn btn-leave-company nav-item" data-company-id="${comp.id}" style="width: 100%; padding: 10px; background: rgba(34,197,94,0.2); border: 1.5px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 8px; cursor: pointer;">
                                ✅ AKTİF ÇALIŞTIĞINIZ FİRMA (Ayrıl)
                            </button>
                        ` : (isUnlocked ? `
                            <button class="modern-btn btn-join-company nav-item" data-company-id="${comp.id}" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer;">
                                ✍️ Sözleşme İmzala (Maaşlı Kaptan Ol)
                            </button>
                        ` : `
                            <button class="modern-btn" disabled style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid #334155; color: #64748b; font-weight: bold; border-radius: 8px;">
                                🔒 Seviye ${comp.minLevel} Gerekli
                            </button>
                        `)}
                    </div>
                </div>
                `;
            });

            container.innerHTML = html;

            // Olay Dinleyicileri
            const btnEmptyCreate = container.querySelector('#btn-empty-create-company');
            if (btnEmptyCreate) {
                btnEmptyCreate.addEventListener('click', () => this.openCreateCompanyModal());
            }

            const btnSubCreate = container.querySelector('#btn-sub-create-company');
            if (btnSubCreate) {
                btnSubCreate.addEventListener('click', () => this.openCreateCompanyModal());
            }

            container.querySelectorAll('.btn-join-company').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const compId = e.currentTarget.getAttribute('data-company-id');
                    this.joinCorporateCompany(compId);
                });
            });

            container.querySelectorAll('.btn-leave-company').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.leaveCorporateCompany();
                });
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

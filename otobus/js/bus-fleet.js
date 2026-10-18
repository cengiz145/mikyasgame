/* ==========================================================================
   OTOBÜS FİLOSU VE ARAÇ SEÇİM SİSTEMİ (BUS FLEET SYSTEM)
   Farklı markalar (Mercedes-Benz, Otokar, BMC, MAN, Setra, Neoplan)
   ve her araca özel Web Audio DSP Akustik Ses Profilleri
   ========================================================================== */

const BusFleet = {
    buses: [
        // --- BELEDİYE OTOBÜSLERİ (SEVİYE 1 - 10 ARASI ŞEHİR İÇİ) ---
        {
            id: "otokar_kent_lf",
            brand: "Otokar",
            model: "Kent LF 12M",
            fullName: "Otokar Kent LF (12 Metre Solo)",
            category: "belediye",
            categoryName: "Şehir İçi Belediye Solo",
            icon: "🚌",
            requiredLevel: 1,
            seatCapacity: 32,
            standingCapacity: 75,
            totalCapacity: 107,
            maxSpeed: 85,
            acceleration: 1.0,
            braking: 1.0,
            engine: "Cummins ISB 6.7L Euro 6 (280 HP)",
            transmission: "ZF EcoLife 6 İleri Otomatik",
            doorType: "3 Çift Kanatlı Alçak Taban Kapı",
            features: "Alçak taban, engelli rampası, Kentkart validatörü, şehir içi çevik manevra.",
            desc: "TEKULAŞ şehir içi hatlarında standart hizmet veren alçak tabanlı yerli solo otobüs.",
            soundProfile: {
                basePitch: 1.0,
                bassBoost: 0,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 1.0,
                retarderPitch: 1.0,
                character: "Standart 6 silindirli Cummins motor sesi ve şehir içi korna"
            }
        },
        {
            id: "bmc_neocity_10m",
            brand: "BMC",
            model: "Neocity 10M",
            fullName: "BMC Neocity (10 Metre Mahalle)",
            category: "belediye",
            categoryName: "Mahalle ve Dar Sokak Otobüsü",
            icon: "🚐",
            requiredLevel: 3,
            seatCapacity: 26,
            standingCapacity: 50,
            totalCapacity: 76,
            maxSpeed: 80,
            acceleration: 1.15,
            braking: 1.05,
            engine: "Cummins 4.5L Euro 6 (210 HP)",
            transmission: "Allison Otomatik",
            doorType: "2 Kapılı Kompakt Giriş",
            features: "Dar mahalle sokaklarında üstün dönüş çapı, atik tork, yokuş kalkış desteği.",
            desc: "Süleymanpaşa'nın dar sokakları ve tepe mahalle hatları için çevik kompakt otobüs.",
            soundProfile: {
                basePitch: 1.18,
                bassBoost: -1,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 1.05,
                retarderPitch: 1.0,
                character: "Yüksek devirli, canlı ve atik 4 silindirli şehir içi sesi"
            }
        },
        {
            id: "mercedes_conecto_12m",
            brand: "Mercedes-Benz",
            model: "Conecto 12M",
            fullName: "Mercedes-Benz Conecto (12 Metre)",
            category: "belediye",
            categoryName: "Şehir İçi Konfor Solo",
            icon: "🚌",
            requiredLevel: 6,
            seatCapacity: 30,
            standingCapacity: 80,
            totalCapacity: 110,
            maxSpeed: 90,
            acceleration: 1.1,
            braking: 1.15,
            engine: "OM 936 Euro 6 (299 HP)",
            transmission: "Voith DIWA 6 Otomatik",
            doorType: "3 Kapılı Geniş İniş-Biniş",
            features: "Alman bağımsız ön aks süspansiyonu, sessiz kabin, yüksek klima verimi.",
            desc: "Yolcularına yüksek konfor sunan, dayanıklı ve güçlü standart şehir içi belediye otobüsü.",
            soundProfile: {
                basePitch: 0.94,
                bassBoost: 3,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.85,
                retarderPitch: 1.0,
                character: "Tok ve pürüzsüz Alman OM 936 sesi, Voith şanzıman vınlaması"
            }
        },
        {
            id: "mercedes_conecto_g",
            brand: "Mercedes-Benz",
            model: "Conecto G 18M",
            fullName: "Mercedes-Benz Conecto G (18 Metre Körüklü)",
            category: "belediye",
            categoryName: "Körüklü Üniversite & Metrobüs",
            icon: "🚎",
            requiredLevel: 8,
            seatCapacity: 45,
            standingCapacity: 115,
            totalCapacity: 160,
            maxSpeed: 85,
            acceleration: 0.95,
            braking: 1.25,
            engine: "OM 470 Euro 6 (360 HP)",
            transmission: "ZF EcoLife 6 İleri Otomatik",
            doorType: "4 Geniş Kapılı Hızlı Tahliye",
            features: "18 metre uzunluk, elektronik körük açısı stabilizasyonu, 160 dev yolcu kapasitesi.",
            desc: "Namık Kemal Üniversitesi ve sanayi aksında yoğun yolcu trafiğini taşıyan dev körüklü kaptan aracı.",
            soundProfile: {
                basePitch: 0.88,
                bassBoost: 6,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.95,
                retarderPitch: 1.0,
                character: "Ağır ve derin sub-bass rölantisi, 4 kapı aynı anda hava tahliyesi"
            }
        },

        // --- ŞEHİRLERARASI SEYAHAT OTOBÜSLERİ (SEVİYE 10'DAN SONRA AÇILIR) ---
        {
            id: "mercedes_travego_16shd",
            brand: "Mercedes-Benz",
            model: "Travego 16 SHD",
            fullName: "Mercedes-Benz Travego 16 SHD (2+1 Rahat)",
            category: "seyahat",
            categoryName: "Şehirlerarası Lüks Seyahat",
            icon: "🛣️",
            requiredLevel: 11,
            seatCapacity: 46,
            standingCapacity: 0,
            totalCapacity: 46,
            maxSpeed: 110,
            acceleration: 1.25,
            braking: 1.3,
            engine: "OM 470 BlueTec Euro 6 (428 HP)",
            transmission: "Mercedes PowerShift 8 İleri Otomatik",
            doorType: "Pnömatik Tekli Piston Ön & Orta Kapı",
            features: "2+1 geniş deri rahat koltuklar, hidrolik Voith Retarder, hostes kabini, ikram ünitesi, geniş alt bagaj.",
            desc: "Türkiye otoyollarının amiral gemisi. Şehirlerarası Türkiye Turnesi için 428 beygirlik lüks seyahat ikonu.",
            soundProfile: {
                basePitch: 0.92,
                bassBoost: 5,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.75,
                retarderPitch: 1.0,
                character: "428 HP BlueTec uzun yol homurtusu + Voith hidrolik retarder ıslığı ve havalı korna"
            }
        },
        {
            id: "mercedes_tourismo_16rhd",
            brand: "Mercedes-Benz",
            model: "Tourismo 16 RHD",
            fullName: "Mercedes-Benz Tourismo 16 RHD",
            category: "seyahat",
            categoryName: "Klasik Şehirlerarası Yolcu",
            icon: "🛣️",
            requiredLevel: 13,
            seatCapacity: 54,
            standingCapacity: 0,
            totalCapacity: 54,
            maxSpeed: 105,
            acceleration: 1.2,
            braking: 1.2,
            engine: "OM 936 Euro 6 (354 HP)",
            transmission: "PowerShift 8 İleri Otomatik",
            doorType: "Pnömatik Yolcu Kapısı",
            features: "54 koltuk kapasitesi, düşük yakıt tüketimi, yüksek filo dayanıklılığı, güvenli otoyol sürüşü.",
            desc: "Otogarların en çok tercih edilen, yüksek kapasiteli ve güvenilir uzun yol yolcu otobüsü.",
            soundProfile: {
                basePitch: 0.95,
                bassBoost: 4,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.80,
                retarderPitch: 0.95,
                character: "Dengeli uzun yol seyahat sesi + kademeli retarder ve havalı korna"
            }
        },
        {
            id: "man_lions_coach",
            brand: "MAN",
            model: "Lion's Coach",
            fullName: "MAN Lion's Coach (470 HP)",
            category: "seyahat",
            categoryName: "Yüksek Güçlü Uzun Yol",
            icon: "🦁",
            requiredLevel: 15,
            seatCapacity: 50,
            standingCapacity: 0,
            totalCapacity: 50,
            maxSpeed: 110,
            acceleration: 1.35,
            braking: 1.35,
            engine: "MAN D2676 Euro 6 (470 HP - 2400 Nm)",
            transmission: "MAN TipMatic 12 İleri + Intarder",
            doorType: "Pnömatik Kapı",
            features: "Karakteristik güçlü MAN motor sesi, 2400 Nm devasa tork, MAN Intarder fren sistemi, rüzgar stabilitesi.",
            desc: "Rampaları düz yol gibi tırmanan, yüksek torklu ve karizmatik Alman şehirlerarası yol canavarı.",
            soundProfile: {
                basePitch: 0.86,
                bassBoost: 7,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.75,
                retarderPitch: 1.1,
                character: "470 HP yırtıcı ve hırıltılı MAN D26 sesi + güçlü MAN Intarder ve kalın havalı korna"
            }
        },
        {
            id: "setra_topclass_s516",
            brand: "Setra",
            model: "S 516 HDH TopClass",
            fullName: "Setra S 516 HDH TopClass (Çift Dingil VIP)",
            category: "seyahat",
            categoryName: "Ultra VIP Premium Seyahat",
            icon: "👑",
            requiredLevel: 18,
            seatCapacity: 42,
            standingCapacity: 0,
            totalCapacity: 42,
            maxSpeed: 115,
            acceleration: 1.4,
            braking: 1.45,
            engine: "OM 471 Euro 6 (510 HP - Çift Arka Dingil)",
            transmission: "PowerShift 8 İleri Otomatik",
            doorType: "Elektro-Pnömatik Akıllı Kapı",
            features: "Çift dingil üstün yol tutuşu, panoramik cam tavan, fısıltı sessizliğinde kabin, ultra VIP 2+1 koltuklar.",
            desc: "Daimler Buses zirvesi. 510 beygirlik çift dingilli ultra lüks VIP seyahat otobüsü.",
            soundProfile: {
                basePitch: 0.90,
                bassBoost: 6,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.55,
                retarderPitch: 0.9,
                character: "510 HP çift dingil, kabin içinde fısıltı sessizliğinde ultra lüks VIP tını"
            }
        },
        {
            id: "neoplan_cityliner",
            brand: "Neoplan",
            model: "Cityliner",
            fullName: "Neoplan Cityliner (Fütüristik Lüks)",
            category: "seyahat",
            categoryName: "Efsane Fütüristik Filo Lideri",
            icon: "🚀",
            requiredLevel: 20,
            seatCapacity: 48,
            standingCapacity: 0,
            totalCapacity: 48,
            maxSpeed: 115,
            acceleration: 1.4,
            braking: 1.4,
            engine: "MAN Euro 6 (460 HP)",
            transmission: "TipMatic 12 İleri Otomatik",
            doorType: "Pnömatik Çift Emniyetli Kapı",
            features: "Bölünmüş fütüristik ön cam, aerodinamik tasarım, iç ambiyans aydınlatma, üst düzey prestij.",
            desc: "Otobüs tasarımında bir sanat eseri. Seviye 20 efsane kaptanların sürdüğü filo lideri.",
            soundProfile: {
                basePitch: 0.91,
                bassBoost: 5,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.65,
                retarderPitch: 1.05,
                character: "460 HP aerodinamik rüzgar izolasyonu + TipMatic otomatik vites tahliyesi"
            }
        }
    ],

    getSelectedBusId: function() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('selectedBusId');
            if (saved && this.buses.some(b => b.id === saved)) {
                return saved;
            }
        }
        return "otokar_kent_lf"; // Varsayılan başlangıç aracı
    },

    getSelectedBus: function() {
        const id = this.getSelectedBusId();
        return this.buses.find(b => b.id === id) || this.buses[0];
    },

    selectBus: function(busId) {
        const bus = this.buses.find(b => b.id === busId);
        if (!bus) return false;

        const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        if (currentLevel < bus.requiredLevel) {
            const msg = `Bu otobüs kilitli! ${bus.fullName} için Seviye ${bus.requiredLevel} olmalısınız. Mevcut seviyeniz: ${currentLevel}.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "warning");
            return false;
        }

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('selectedBusId', busId);
        }

        if (typeof Game !== 'undefined') {
            Game.selectedBus = bus;
            Game.busType = bus.category;
            if (Game.activeRouteData) {
                Game.activeRouteData.otobusKapasitesi = bus.seatCapacity;
            }
        }

        // AudioSystem ses profilini uygula
        if (typeof audio !== 'undefined' && audio.applyBusSoundProfile) {
            audio.applyBusSoundProfile(bus.soundProfile);
        }

        const successMsg = `Aktif otobüs seçildi: ${bus.fullName}. ${bus.categoryName}. Toplam ${bus.totalCapacity} yolcu kapasitesi.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(successMsg);
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🚌 Seçildi: ${bus.fullName}`, "success");

        this.renderModal(this.currentTab || 'all');
        return true;
    },

    openModal: function() {
        const modal = document.getElementById('bus-garage-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        this.currentTab = 'all';
        this.renderModal('all');

        const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const sel = this.getSelectedBus();
        const welcomeSpeech = `Otobüs Garajı açıldı. Mevcut seviyeniz: ${currentLevel}. Aktif aracınız: ${sel.fullName}.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(welcomeSpeech);

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    closeModal: function() {
        const modal = document.getElementById('bus-garage-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    renderModal: function(filterCategory) {
        this.currentTab = filterCategory;
        const listEl = document.getElementById('garage-bus-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const selectedId = this.getSelectedBusId();

        const filtered = this.buses.filter(b => {
            if (filterCategory === 'belediye') return b.category === 'belediye';
            if (filterCategory === 'seyahat') return b.category === 'seyahat';
            return true;
        });

        filtered.forEach(b => {
            const isUnlocked = currentLevel >= b.requiredLevel;
            const isSelected = b.id === selectedId;

            const li = document.createElement('li');
            li.style.marginBottom = "12px";

            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'stretch';
            btn.style.textAlign = 'left';
            btn.style.padding = '14px 16px';
            btn.style.border = isSelected ? '2px solid #22c55e' : (isUnlocked ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(239,68,68,0.3)');
            btn.style.background = isSelected ? 'rgba(34,197,94,0.15)' : (isUnlocked ? 'rgba(15,23,42,0.6)' : 'rgba(0,0,0,0.4)');

            let statusBadge = '';
            if (isSelected) {
                statusBadge = '<span style="background: #22c55e; color: #000; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">✅ KULLANIMDA</span>';
            } else if (isUnlocked) {
                statusBadge = '<span style="background: rgba(56,189,248,0.2); color: #38bdf8; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">KULLANILABİLİR</span>';
            } else {
                statusBadge = `<span style="background: rgba(239,68,68,0.2); color: #f87171; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">🔒 SEVİYE ${b.requiredLevel} GEREKLİ</span>`;
            }

            const categoryBadge = b.category === 'belediye'
                ? '<span style="color: #38bdf8; font-size: 0.85rem; font-weight: bold;">🏙️ Belediye Otobüsü</span>'
                : '<span style="color: #facc15; font-size: 0.85rem; font-weight: bold;">🛣️ Şehirlerarası Seyahat</span>';

            const capacityInfo = b.standingCapacity > 0
                ? `${b.seatCapacity} Oturan + ${b.standingCapacity} Ayakta (Toplam ${b.totalCapacity} Yolcu)`
                : `${b.seatCapacity} Koltuklu (2+1 Rahat Seyahat)`;

            let ariaLabel = `${b.fullName}. ${b.categoryName}. ${capacityInfo}. Motor: ${b.engine}. Ses Karakteri: ${b.soundProfile ? b.soundProfile.character : ''}. ${isUnlocked ? (isSelected ? 'Şu anda seçili araç.' : 'Seçmek için Enter.') : `Kilitli, Seviye ${b.requiredLevel} gereklidir.`}`;
            btn.setAttribute('aria-label', ariaLabel);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div>
                        <span style="font-size: 1.15rem; font-weight: bold; color: ${isUnlocked ? '#fff' : '#94a3b8'};">
                            ${b.icon} ${b.fullName}
                        </span>
                        <div style="margin-top: 2px;">${categoryBadge}</div>
                    </div>
                    <div>${statusBadge}</div>
                </div>
                <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 4px;">
                    👥 <strong>Kapasite:</strong> <span style="color: #38bdf8;">${capacityInfo}</span> | 
                    ⚡ <strong>Maks Hız:</strong> ${b.maxSpeed} km/s
                </div>
                <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 4px;">
                    ⚙️ <strong>Motor & Vites:</strong> ${b.engine} | ${b.transmission}
                </div>
                <div style="font-size: 0.85rem; color: #38bdf8; font-style: italic; margin-bottom: 4px;">
                    🔊 <strong>Ses Profili:</strong> ${b.soundProfile ? b.soundProfile.character : ''}
                </div>
                <div style="font-size: 0.85rem; color: #a1a1aa;">
                    💡 ${b.features}
                </div>
            `;

            btn.onclick = () => {
                if (isUnlocked) {
                    this.selectBus(b.id);
                } else {
                    const lockMsg = `Bu araç henüz kilitli. ${b.fullName} kullanabilmek için Seviye ${b.requiredLevel} ehliyet derecesine ulaşmalısınız.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(lockMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(lockMsg, "warning");
                }
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    init: function() {
        const btnOpen = document.getElementById('btn-open-garage-fleet');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => this.openModal());
        }

        const btnClose = document.getElementById('btn-garage-modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        const tabAll = document.getElementById('tab-fleet-all');
        const tabCity = document.getElementById('tab-fleet-city');
        const tabIntercity = document.getElementById('tab-fleet-intercity');

        if (tabAll) tabAll.addEventListener('click', () => {
            this.setTabActive('tab-fleet-all');
            this.renderModal('all');
        });
        if (tabCity) tabCity.addEventListener('click', () => {
            this.setTabActive('tab-fleet-city');
            this.renderModal('belediye');
        });
        if (tabIntercity) tabIntercity.addEventListener('click', () => {
            this.setTabActive('tab-fleet-intercity');
            this.renderModal('seyahat');
        });

        const sel = this.getSelectedBus();
        if (typeof Game !== 'undefined') {
            Game.selectedBus = sel;
            Game.busType = sel.category;
        }
    },

    setTabActive: function(activeTabId) {
        ['tab-fleet-all', 'tab-fleet-city', 'tab-fleet-intercity'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === activeTabId) {
                    el.style.background = 'rgba(56,189,248,0.3)';
                    el.style.borderColor = '#38bdf8';
                    el.style.color = '#fff';
                } else {
                    el.style.background = 'rgba(255,255,255,0.08)';
                    el.style.borderColor = 'rgba(255,255,255,0.2)';
                    el.style.color = '#94a3b8';
                }
            }
        });
    }
};

if (typeof window !== 'undefined') {
    window.BusFleet = BusFleet;
    document.addEventListener('DOMContentLoaded', () => {
        BusFleet.init();
    });
}

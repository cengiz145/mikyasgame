/**
 * highway-facilities.js - Karayolu Dinlenme Tesisleri (30 Dk Mola Kültürü), HGS Gişe Sistemi & Tırtıklı Şerit
 * Bolu Dağı çorbası, Susurluk tostu, Afyon sucuğu, muavin anonsları, cam yıkama, yolcu bahşişleri ve HGS "DİİİT!" sesi.
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const HighwayFacilities = {
        STORAGE_KEY: 'otobus_highway_data',
        data: {
            hgsBalance: 650,
            totalTollsPaid: 0,
            visitedFacilitiesCount: 0,
            totalBreakTipsEarned: 0
        },

        // Efsane Karayolu Tesisleri
        facilities: [
            {
                id: "facility_agri",
                name: "Ağrı Dağı & İshak Paşa Dinlenme Tesisi",
                route: "D-100 / E-80 Trans-Avrupa İpekyolu (Ağrı - Doğubayazıt)",
                icon: "🏔️",
                desc: "Türkiye'nin çatısı 5.137 metrelik efsanevi Ağrı Dağı'nın eteklerinde, İshak Paşa Sarayı manzaralı tarihi İpek Yolu mola tesisi. Sıcak Abdigör köftesi, bal-lavaş ve kaçak semaver çayı durağı.",
                specialties: [
                    { id: "agri_abdigor", name: "Hakiki Taşta Dövme Abdigör Köftesi", price: 165, effectDesc: "Yüzyıllık saray yemeği, uzun yolda gücü ve zindeliği zirveye taşır (+50 Enerji)" },
                    { id: "agri_bal_lavas", name: "Ağrı Karakovan Balı & Sıcak Tandır Lavaşı", price: 85, effectDesc: "Doğal yayla balı ve manda kaymağıyla eşsiz enerji" },
                    { id: "agri_semaver", name: "Odun Ateşinde Kaçak Semaver Çayı", price: 30, effectDesc: "1.500 km yol yorgunluğunu anında unutturan tavşan kanı çay" }
                ]
            },
            {
                id: "facility_bolu",
                name: "Bolu Dağı Highway Dinlenme Tesisi",
                route: "O-4 / D-100 Anadolu Otoyolu (Bolu Dağı Geçidi)",
                icon: "🍲",
                desc: "Türkiye'nin en ünlü dağ tesisi. Karlı ve sisli gecelerde sıcak mercimek çorbası ve fındık helvasıyla kaptanların sığınağı.",
                specialties: [
                    { id: "bolu_corba", name: "Bolu Dağı Sıcak Mercimek Çorbası", price: 65, effectDesc: "Uykuyu dağıtır, dikkati ve enerjiyi zirveye taşır (+40 Enerji)" },
                    { id: "bolu_kofte", name: "Bolu Dağı Islama Köftesi", price: 145, effectDesc: "Şoförün karnını doyurur, sürüş odaklanması %100" },
                    { id: "bolu_helva", name: "Fındıklı Bolu Dağı Helvası", price: 55, effectDesc: "Geleneksel tatlı molası, moral artırır" }
                ]
            },
            {
                id: "facility_susurluk",
                name: "Susurluk Yasa & Tostçu Dinlenme Tesisi",
                route: "O-5 Gebze-Orhangazi-İzmir Otoyolu (Balıkesir Susurluk)",
                icon: "🥪",
                desc: "Otobüs yolculuklarının vazgeçilmez efsanesi. Çift kaşarlı çıtır ekmekli tostu ve buz gibi köpüklü yayık ayranı.",
                specialties: [
                    { id: "sus_tost", name: "Hakiki Çift Kaşarlı Susurluk Tostu", price: 75, effectDesc: "Çıtır sıcak tost, kaptanın gücünü yeniler" },
                    { id: "sus_ayran", name: "Köpüklü Hakiki Yayık Ayranı", price: 30, effectDesc: "Mideyi rahatlatır, ferahlık verir" },
                    { id: "sus_cigborek", name: "Mihaliç Peynirli Çıtır Börek", price: 80, effectDesc: "Geleneksel lezzet molası" }
                ]
            },
            {
                id: "facility_afyon",
                name: "Afyon Kolaylı & İkbal Dinlenme Tesisi",
                route: "D-200 / D-300 Ege - Akdeniz - İç Anadolu Kavşağı",
                icon: "🥩",
                desc: "Türkiye'nin kavşak noktası Afyonkarahisar'ın meşhur sucuklu lezzetleri ve kaymaklı ekmek kadayıfı.",
                specialties: [
                    { id: "afy_sucuk", name: "Afyon Sucuklu Sıcak Sandviç", price: 110, effectDesc: "Baharatlı enfes enerji kaynağı" },
                    { id: "afy_kadayif", name: "Manda Kaymaklı Ekmek Kadayıfı", price: 90, effectDesc: "Kaptanın yorgunluğunu anında unutturur" },
                    { id: "afy_katmer", name: "Haşhaşlı Çıtır Afyon Katmeri", price: 55, effectDesc: "Çay eşliğinde nefis atıştırmalık" }
                ]
            },
            {
                id: "facility_sivrihisar",
                name: "Sivrihisar Nasreddin Hoca Başkent Mola Parkı",
                route: "D-200 Eskişehir - Polatlı - Ankara Yolu",
                icon: "🥟",
                desc: "Nasreddin Hoca diyarında, bozkırın ortasında 24 saat tüten semaver çayı ve meşhur muska baklavası.",
                specialties: [
                    { id: "siv_baklava", name: "Sivrihisar Muska Baklavası & Çay", price: 70, effectDesc: "Hızlı şeker ve zindelik takviyesi" },
                    { id: "siv_ciborek", name: "Çıtır Çibörek & Ayran", price: 85, effectDesc: "Eskişehir klasiği doyurucu börek" },
                    { id: "siv_semaver", name: "Odun Ateşinde Semaver Çayı", price: 25, effectDesc: "Tavşan kanı sıcak çay, uykuyu sıfırlar" }
                ]
            },
            {
                id: "facility_pozanti",
                name: "Pozantı & Gülek Boğazı Toroslar Mola Tesisi",
                route: "O-21 / D-750 Toros Dağları Geçidi (Adana - Niğde)",
                icon: "🌶️",
                desc: "Toroslar'ın serin dağ havasında, Gülek Boğazı girişinde sıcak yayla çorbası ve sıkma molası.",
                specialties: [
                    { id: "poz_corba", name: "Toros Yayla Çorbası & Sıcak Tandır", price: 65, effectDesc: "Dağ soğuğuna karşı sıcacık kalkan" },
                    { id: "poz_sikma", name: "Çökelekli Sıkma & Acılı Şalgam", price: 45, effectDesc: "Çukurova'nın yöresel atıştırmalığı" },
                    { id: "poz_cezerye", name: "Tarsus Fıstıklı Beyaz Cezerye", price: 50, effectDesc: "Doğal enerji ve dinçlik" }
                ]
            },
            {
                id: "facility_erzincan",
                name: "Karasu Fırat Vadisi Mola Tesisi",
                route: "D-100 Refahiye - Erzincan İpek Yolu Aksı",
                icon: "🧀",
                desc: "Fırat Nehri kıyısında, Doğu Anadolu ile Karadeniz kesişiminde tulum peynirli sıcak lavaş molası.",
                specialties: [
                    { id: "erz_lavas", name: "Erzincan Tulum Peynirli Sıcak Lavaş", price: 65, effectDesc: "Köy tereyağı ve hakiki tulum lezzeti" },
                    { id: "erz_balik", name: "Karasu Izgara Alabalık", price: 135, effectDesc: "Protein ve enerji deposu" },
                    { id: "erz_hosaf", name: "Cimin Üzümü Doğal Hoşafı", price: 35, effectDesc: "Geleneksel serinletici lezzet" }
                ]
            },
            {
                id: "facility_hamsikoy",
                name: "Karadeniz Zigana & Hamsiköy Mola Parkı",
                route: "D-885 Trabzon - Gümüşhane - Erzurum Karayolu",
                icon: "🥣",
                desc: "Sisli Zigana dağlarının eteğinde, taş fırınlarda pişen asırlık Hamsiköy sütlacı ve çıtır Akçaabat köftesi.",
                specialties: [
                    { id: "ham_sutlac", name: "Fırınlanmış Hakiki Hamsiköy Sütlacı", price: 65, effectDesc: "Bol fındıklı enfes tatlı, moral ve zindelik tavan yapar" },
                    { id: "ham_kofte", name: "Sarımsaklı Akçaabat Köftesi", price: 140, effectDesc: "Kaptanın gücünü ve yol odaklanmasını zirveye çıkarır" },
                    { id: "ham_cay", name: "İki Kaçak Rize Çayı (İnce Belli)", price: 20, effectDesc: "Karadeniz yayla çayı, yorgunluğu sıfırlar" }
                ]
            },
            {
                id: "facility_kizildag",
                name: "Kızıldağ & Sivas Yayla Dinlenme Tesisi",
                route: "D-100 / D-200 İç Anadolu - Doğu Anadolu Geçidi (2190m)",
                icon: "🥩",
                desc: "Türkiye'nin en yüksek karayolu geçitlerinden Kızıldağ zirvesinde sıcak kelle paça ve Sivas köftesi durağı.",
                specialties: [
                    { id: "kiz_kofte", name: "Tuz ve Etli Hakiki Sivas Köftesi", price: 130, effectDesc: "Geleneksel lezzet, uzun yolda tokluk garantisi" },
                    { id: "kiz_corba", name: "Sıcak Sarımsaklı Kelle Paça Çorbası", price: 85, effectDesc: "Yüksek irtifa dağ soğuğuna karşı tam direnç" },
                    { id: "kiz_katmer", name: "Sivas Usulü Katmer & Çörek", price: 45, effectDesc: "Çay molasında nefis enerji kaynağı" }
                ]
            },
            {
                id: "facility_nurdagi",
                name: "Gaziantep & Nurdağı İpek Yolu Dinlenme Tesisi",
                route: "O-52 TAG Otoyolu (Çukurova - Güneydoğu Geçişi)",
                icon: "🥮",
                desc: "Amanos Dağları'nın doğu eteğinde, UNESCO tescilli Gaziantep mutfağının sıcak beyranı ve fıstıklı katmeri.",
                specialties: [
                    { id: "nur_katmer", name: "Kare Fıstıklı Sıcak Antep Katmeri", price: 110, effectDesc: "Hakiki kaymak ve boz fıstıkla enerji patlaması" },
                    { id: "nur_beyran", name: "Acılı ve Bol Sarımsaklı Beyran Çorbası", price: 120, effectDesc: "Güneydoğu kaptanlarının şifa ve dinçlik iksiri" },
                    { id: "nur_nohut", name: "Kemik Sulu Antep Nohut Dürümü", price: 55, effectDesc: "Pratik, doyurucu ve efsane karayolu lezzeti" }
                ]
            },
            {
                id: "facility_hasankeyf",
                name: "Batman & Hasankeyf Dicle Kanyonu Mola Parkı",
                route: "D-370 / D-955 Batman - Midyat - Mardin Karayolu",
                icon: "☕",
                desc: "Dicle Nehri ve antik Hasankeyf kanyonu manzarası eşliğinde köpüklü menengiç kahvesi ve Siirt fıstığı.",
                specialties: [
                    { id: "has_kahve", name: "Sütlü Hakiki Menengiç Kahvesi", price: 45, effectDesc: "Kafeinsiz doğal rahatlatıcı ve zihin açıcı" },
                    { id: "has_fistik", name: "Çıtır Kavrulmuş Siirt Fıstığı (Külah)", price: 75, effectDesc: "Direksiyon başında dikkat artıran atıştırmalık" },
                    { id: "has_tandir", name: "Tandır Ekmeği Arası Tulum & Ceviz", price: 60, effectDesc: "Yöresel lezzet molası" }
                ]
            },
            {
                id: "facility_germencik",
                name: "Aydın & Germencik Ege İncir Mola Tesisi",
                route: "O-31 / D-550 İzmir - Aydın - Muğla Otoyolu",
                icon: "🌿",
                desc: "Büyük Menderes Ovası'nın zeytinlikleri arasında, dalından yeni kurutulmuş dağ inciri ve Ege çöp şişi.",
                specialties: [
                    { id: "ger_incir", name: "Ballı Aydın Dağ İnciri & Ceviz Tabağı", price: 60, effectDesc: "Ege güneşinin doğal şekeri, anında zindelik" },
                    { id: "ger_copsis", name: "Çıtır Lavaşlı Aydın Çöp Şiş", price: 145, effectDesc: "Efsane Ege lezzeti, tam kaptan menüsü" },
                    { id: "ger_sogurme", name: "Zeytinyağlı Köz Patlıcan & Ayran", price: 50, effectDesc: "Hafif ve ferahlatıcı yol molası" }
                ]
            },
            {
                id: "facility_merzifon",
                name: "Amasya & Merzifon Şehzadeler Mola Parkı",
                route: "D-100 / D-795 Karadeniz - İç Anadolu Kavşağı",
                icon: "🍏",
                desc: "Merzifon dörtyol kavşağında, Amasya elmasıyla fırınlanmış tatlılar ve odun ateşinde Merzifon keşkeği.",
                specialties: [
                    { id: "mer_keskek", name: "Tereyağlı Hakiki Merzifon Keşkeği", price: 95, effectDesc: "Asırlık Anadolu yemeği, saatlerce tok tutar" },
                    { id: "mer_elma", name: "Fırınlanmış Tarçınlı Amasya Elması Tatlısı", price: 50, effectDesc: "Mis kokulu meyve tatlısı, hafif ve leziz" },
                    { id: "mer_corek", name: "Haşhaşlı & Cevizli Amasya Çöreği", price: 40, effectDesc: "Yol boyu atıştırmalık enerji" }
                ]
            },
            {
                id: "facility_akdamar",
                name: "Van Gölü & Gevaş Akdamar Mola Parkı",
                route: "D-300 Van - Tatvan - Bitlis Sahil Karayolu",
                icon: "🐟",
                desc: "Turkuaz Van Gölü kıyısında, Akdamar Adası manzarası eşliğinde semaver çayı ve tandırda İnci kefali.",
                specialties: [
                    { id: "akd_kefal", name: "Tandırda Çıtır Van İnci Kefali", price: 120, effectDesc: "Van Gölü'nün endemik lezzeti, hafif ve besleyici" },
                    { id: "akd_otlu", name: "Sıcak Lavaş Arası Hakiki Van Otlu Peyniri", price: 55, effectDesc: "Dağ kekikli taze peynir, müthiş aroma" },
                    { id: "akd_semaver", name: "Göl Kenarı Odun Semaveri Çayı", price: 25, effectDesc: "Uçsuz bucaksız göl manzarasıyla yorgunluk sıfır" }
                ]
            },
            {
                id: "facility_safranbolu",
                name: "Karabük & Safranbolu Orman Mola Tesisi",
                route: "D-755 Karabük - Bartın - Zonguldak Karayolu",
                icon: "🌲",
                desc: "Yenice ormanları ve Safranbolu kanyonu eteklerinde, fındıklı çifte kavrulmuş lokum ve kestane balı molası.",
                specialties: [
                    { id: "saf_lokum", name: "Çifte Kavrulmuş Safranlı & Antep Fıstıklı Lokum", price: 55, effectDesc: "UNESCO kenti klasiği, kaptanın ağzını tatlandırır" },
                    { id: "saf_gozleme", name: "Köy Peynirli Sac Gözlemesi & Yayık Ayranı", price: 70, effectDesc: "Geleneksel sac böreği lezzeti" },
                    { id: "saf_bal", name: "Yenice Orman Kestane Balı & Ihlamur", price: 40, effectDesc: "Boğazı yumuşatır, sürüş konsantrasyonu kazandırır" }
                ]
            },
            {
                id: "facility_tekirdag",
                name: "Tekirdağ Sahil & Marmara Mola Parkı",
                route: "D-110 Süleymanpaşa Sahil Yolu (Trakya Hattı)",
                icon: "🍢",
                desc: "Simülasyonumuzun ana üssü Tekirdağ'da, Marmara Denizi manzarası eşliğinde meşhur köfte ve Hayrabolu tatlısı.",
                specialties: [
                    { id: "tek_kofte", name: "Porsiyon Tekirdağ Köftesi & Acı Sos", price: 125, effectDesc: "Meşhur Trakya lezzeti, tam doyum" },
                    { id: "tek_tatli", name: "Tahinli Şerbetli Hayrabolu Tatlısı", price: 55, effectDesc: "Kaymaklı peynir tatlısı keyfi" },
                    { id: "tek_ayran", name: "Trakya Çiftlik Ayranı & Şıra", price: 25, effectDesc: "Doğal ferahlatıcı içecek" }
                ]
            }
        ],

        // HGS Otoyol Gişeleri (KGM Resmî Ücret Tarifeleri)
        tolls: [
            { id: "toll_osmangazi", name: "O-5 Osmangazi Köprüsü Gişeleri", fee: 290, road: "O-5 Otoyolu (Yalova - Bursa Aksı)" },
            { id: "toll_canakkale", name: "1915 Çanakkale Köprüsü Gişeleri", fee: 340, road: "Malkara - Çanakkale Otoyolu" },
            { id: "toll_kuzey_marmara", name: "O-7 Kuzey Marmara Kınalı Gişeleri", fee: 65, road: "O-7 Kuzey Marmara Otoyolu" },
            { id: "toll_yavuz_selim", name: "Yavuz Sultan Selim Köprüsü Gişesi", fee: 95, road: "O-7 Boğaz Geçişi" },
            { id: "toll_bolu", name: "O-4 Bolu Dağı Otoyol Gişeleri", fee: 75, road: "O-4 Anadolu Otoyolu" },
            { id: "toll_ankara_nigde", name: "O-21 Ankara - Niğde Otoyolu Gişesi", fee: 140, road: "O-21 Akıllı Otoyol" },
            { id: "toll_tag_antep", name: "O-52 TAG Nurdağı - Gaziantep Gişeleri", fee: 55, road: "O-52 TAG Otoyolu" },
            { id: "toll_aydin_izmir", name: "O-31 İzmir - Aydın Otoyolu Gişeleri", fee: 45, road: "O-31 Ege Otoyolu" },
            { id: "toll_cigli_cesme", name: "O-32 İzmir - Çeşme Otoyol Gişesi", fee: 35, road: "O-32 Çeşme Otoyolu" },
            { id: "toll_duzce_bolu", name: "O-4 Bolu Dağı Viyadük Gişeleri", fee: 40, road: "O-4 Anadolu Otoyolu" },
            { id: "toll_iskenderun", name: "O-53 Ceyhan - İskenderun Gişesi", fee: 50, road: "O-53 Akdeniz Otoyolu" },
        ],

        currentFacilityIndex: 0,
        isBreakActive: false,
        breakTimer: null,

        init: function () {
            this.loadData();
            this.injectHudElements();
            this.setupKeyBindings();
            console.log("[HighwayFacilities] Karayolu Dinlenme Tesisleri & HGS Gişe Sistemi hazır. Bakiye:", this.data.hgsBalance, "₺");
        },

        getAudioCtx: function () {
            if (typeof audio !== 'undefined' && audio.ctx) return audio.ctx;
            if (typeof Howler !== 'undefined' && Howler.ctx) return Howler.ctx;
            if (!this._ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this._ctx = new AudioCtx();
            }
            return this._ctx;
        },

        loadData: function () {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.data = Object.assign(this.data, parsed);
                }
            } catch (e) {
                console.warn("[HighwayFacilities] Veri okuma hatası:", e);
            }
        },

        saveData: function () {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.warn("[HighwayFacilities] Veri kaydetme hatası:", e);
            }
        },

        // Web Audio Synthesizer: HGS Elektronik Anten Okuma Sesi ("DİİİT!")
        playHgsBeep: function () {
            try {
                const ctx = this.getAudioCtx();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6 tonu
                osc.frequency.setValueAtTime(2200, ctx.currentTime + 0.08); // C#7 onay tonu
                gain.gain.setValueAtTime(0.35, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.28);
            } catch (e) {
                console.warn("HGS ses hatası:", e);
            }
        },

        // Web Audio Synthesizer: Yetersiz Bakiye İkaz Sesi ("Dİ-Dİ-DİT!")
        playHgsWarningBeep: function () {
            try {
                const ctx = this.getAudioCtx();
                if (!ctx) return;
                [0, 0.1, 0.2].forEach((t, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(880, ctx.currentTime + t);
                    gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.08);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + t);
                    osc.stop(ctx.currentTime + t + 0.08);
                });
            } catch (e) { }
        },

        // Web Audio Synthesizer: Tesis Cam Silme & Yıkama Sesi
        playWindowWashSound: function () {
            try {
                const ctx = this.getAudioCtx();
                if (!ctx) return;
                const bufferSize = Math.floor(ctx.sampleRate * 1.6);
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.sin(i / 1200);
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(1400, ctx.currentTime);
                filter.frequency.linearRampToValueAtTime(700, ctx.currentTime + 1.5);
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                noise.start();
            } catch (e) { }
        },

        // Web Audio Synthesizer: Çay Bardağı & Kaşık Şıngırtısı
        playTeaChime: function () {
            try {
                const ctx = this.getAudioCtx();
                if (!ctx) return;
                [3200, 4800, 5600].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.22);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + idx * 0.05);
                    osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
                });
            } catch (e) { }
        },

        // Web Audio Synthesizer: Tırtıklı Emniyet Şeridi Sesi (Rumble Strips)
        playRumbleSound: function () {
            try {
                const ctx = this.getAudioCtx();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(50, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(65, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } catch (e) { }
        },

        // HGS Gişesinden Geçiş Tetikle
        passThroughToll: function (tollId) {
            const toll = this.tolls.find(t => t.id === tollId) || this.tolls[0];
            const cost = toll.fee;

            if (this.data.hgsBalance >= cost) {
                this.data.hgsBalance -= cost;
                this.data.totalTollsPaid += cost;
                this.saveData();
                this.updateHudHgs();

                this.playHgsBeep();
                const msg = `🏷️ HGS: ${toll.name} geçişi onaylandı. ${cost} ₺ tahsil edildi. Kalan HGS Bakiyeniz: ${this.data.hgsBalance} ₺. Hayırlı yolculuklar kaptan!`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "success");
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(`He Ge Se: ${cost} lira tahsil edildi. Kalan bakiyeniz ${this.data.hgsBalance} lira.`);
                }
            } else {
                this.playHgsWarningBeep();
                const diff = cost - this.data.hgsBalance;
                const warnMsg = `⚠️ HGS Yetersiz Bakiye! ${toll.name} ücreti ${cost} ₺, bakiyeniz ${this.data.hgsBalance} ₺. İhlalli geçiş kaydedildi! Ceza yememek için Y tuşuyla bakiye yükleyiniz.`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(warnMsg, "warning");
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Dikkat! He Ge Se yetersiz bakiye! İhlalli geçiş uyarısı.");
                }
            }
        },

        // HGS Bakiye Yükleme (Kaptanın parasından HGS'ye aktarma)
        rechargeHgs: function (amount) {
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < amount) {
                const msg = `Yetersiz nakit bütçe! Cüzdanınızda ${currentBudget} ₺ var, ${amount} ₺ yüklenemedi.`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "warning");
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= amount;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.data.hgsBalance += amount;
            this.saveData();
            this.updateHudHgs();
            this.playHgsBeep();

            const succMsg = `💳 HGS kartınıza ${amount} ₺ başarıyla yüklendi! Güncel HGS Bakiyeniz: ${this.data.hgsBalance} ₺.`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(succMsg, "success");
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(succMsg);
            this.renderHgsModal();
        },

        // Tesis Yemeği Siparişi
        orderFood: function (facilityId, specId) {
            const fac = this.facilities.find(f => f.id === facilityId);
            if (!fac) return;
            const spec = fac.specialties.find(s => s.id === specId);
            if (!spec) return;

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < spec.price) {
                const msg = `Yetersiz bütçe! ${spec.name} için ${spec.price} ₺ gerekiyor.`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "warning");
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                return;
            }

            // Parayı düş
            if (typeof Game !== 'undefined') {
                Game.playerBudget -= spec.price;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.playTeaChime();
            const msg = `🍲 Afiyet olsun! ${fac.name}'nde ${spec.name} yediniz (${spec.price} ₺). ${spec.effectDesc}.`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "success");
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(`Afiyet olsun kaptan! ${spec.name} yediniz. Zindelik ve enerjiniz arttı.`);
            }
        },

        // Çay Ocağından Çay Al
        drinkTea: function () {
            const teaPrice = 15;
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < teaPrice) {
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Çay için en az 15 ₺ gerekiyor.", "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= teaPrice;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.playTeaChime();
            const msg = "☕ Tesis çay ocağından demli tavşan kanı çayınızı yudumladınız (-15 ₺). Uykunuz tamamen dağıldı!";
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "info");
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Tavşan kanı demli çayınızı yudumladınız. Uykunuz tamamen dağıldı kaptan!");
        },

        // Ön Camı & Farları Yıkatma
        // Tesis Akaryakıt İstasyonundan Mazot Doldur
        refuelBus: function () {
            if (typeof Game === 'undefined') return;
            const cap = (typeof Game.getFuelCapacity === 'function') ? Game.getFuelCapacity() : (Game.fuelTankCapacity || 500);
            const current = (Game.currentFuelLiters !== undefined) ? Game.currentFuelLiters : cap;
            const needed = Math.max(0, cap - current);
            if (needed <= 1) {
                const fullMsg = `Deponuz zaten tamamen dolu (%${Math.floor((current / cap) * 100)} - ${Math.floor(current)} L).`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(fullMsg, "info");
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(fullMsg);
                return;
            }
            Game.refuel();
        },

        washWindshield: function () {
            let washFee = 40;
            let washDiscountNote = "";
            if (typeof CompanySystem !== 'undefined' && typeof CompanySystem.getInstitutionLevel === 'function') {
                const washLvl = CompanySystem.getInstitutionLevel('bus_wash');
                if (washLvl === 2) {
                    washFee = 15; // %62 indirim
                    washDiscountNote = " (Yarı Otomatik Yıkama Ünitesi İndirimi)";
                } else if (washLvl >= 3) {
                    washFee = 0; // %100 ÜCRETSİZ
                    washDiscountNote = " (Tam Otomatik Tünel Yıkama ile ÜCRETSİZ!)";
                }
            }
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < washFee) {
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Yıkama için ${washFee} ₺ gerekiyor.`, "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= washFee;
                if (Game.busDamage) {
                    Game.busDamage.wipers = 0;
                    Game.busDamage.headlights = 0;
                }
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.playWindowWashSound();
            const msg = "🧼 Tesis personeli otobüsün ön camını ve farlarını tazyikli su ve fırçayla pırıl pırıl yıkadı (-40 ₺). Görüş açınız mükemmel!";
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "success");
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Otobüsün ön camı ve farları yıkandı. Gece görüşünüz maksimuma çıktı.");
            }
        },

        // 30 Dk Yolcu İhtiyaç Molası Başlat & Muavin Anonsu
        startPassengerBreak: function () {
            const fac = this.facilities[this.currentFacilityIndex] || this.facilities[0];
            this.isBreakActive = true;
            this.data.visitedFacilitiesCount++;

            // Konfor %100 olur
            if (typeof Game !== 'undefined') {
                Game.passengerComfort = 100;
            }

            // Memnuniyet Bahşişi (80 ₺ - 160 ₺ arası + Otobüs Lüks Kalite Bonusu)
            let tipsEarned = Math.floor(80 + Math.random() * 80);
            const activeBus = (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBus() : null;
            if (activeBus && activeBus.tipBonusPercent > 0) {
                const bonus = Math.round(tipsEarned * (activeBus.tipBonusPercent / 100));
                tipsEarned += bonus;
            }
            this.data.totalBreakTipsEarned += tipsEarned;
            if (typeof Game !== 'undefined') {
                Game.addMoney(tipsEarned);
            }
            this.saveData();

            // Klasik Efsane Muavin Anonsu
            const muavinText = `Sayın yolcularımız, ${fac.name}'ne varmış bulunmaktayız. Kaptanımız 30 dakika ihtiyaç molası vermiştir. Lütfen peron numaranızı ve araç plakanızı unutmayınız. Hayırlı dinlenmeler dileriz.`;
            
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`📢 [Muavin Anonsu] 30 Dk İhtiyaç Molası Başladı! (+${tipsEarned} ₺ Yolcu Bahşişi)`, "success");
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(muavinText);
            }

            // 5 saniye sonra kalkış anonsunu hazırla
            if (this.breakTimer) clearTimeout(this.breakTimer);
            this.breakTimer = setTimeout(() => {
                const departAnnounce = `Tekirdağ Seyahat yolcuları, ihtiyaç molanız sona ermiştir. Aracınız hareket etmek üzeredir, lütfen yerlerinizi alınız!`;
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast("🔔 [Peron Anonsu] Otobüs hareket etmek üzere! Lütfen yerlerinizi alınız.", "info");
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(departAnnounce);
                }
                this.isBreakActive = false;
            }, 12000);
        },

        // HUD Elemanlarını Ekle
        injectHudElements: function () {
            const container = document.getElementById('hud-indicators');
            if (!container) return;

            if (!document.getElementById('hud-facility-btn')) {
                const btnFacility = document.createElement('button');
                btnFacility.id = 'hud-facility-btn';
                btnFacility.style.cssText = 'background: rgba(245, 158, 11, 0.25); border: 1px solid #f59e0b; color: #fbbf24; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 6px;';
                btnFacility.innerHTML = '🛋️ TESİS & MOLA (J)';
                btnFacility.title = 'Karayolu Dinlenme Tesisleri & 30 Dk Mola Menüsü (Kısayol: J)';
                btnFacility.setAttribute('aria-label', 'Karayolu Dinlenme Tesisi ve Mola Menüsü (J)');
                btnFacility.addEventListener('click', () => this.openFacilityModal());
                container.appendChild(btnFacility);
            }

            if (!document.getElementById('hud-hgs-btn')) {
                const btnHgs = document.createElement('button');
                btnHgs.id = 'hud-hgs-btn';
                btnHgs.style.cssText = 'background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #60a5fa; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 6px;';
                btnHgs.innerHTML = `🏷️ HGS: <span id="hud-hgs-balance">${this.data.hgsBalance} ₺</span> (Y)`;
                btnHgs.title = 'HGS Otoyol Gişesi ve Bakiye Menüsü (Kısayol: Y)';
                btnHgs.setAttribute('aria-label', `HGS Otoyol Gişesi ve Bakiye ${this.data.hgsBalance} lira (Y)`);
                btnHgs.addEventListener('click', () => this.openHgsModal());
                container.appendChild(btnHgs);
            }
        },

        updateHudHgs: function () {
            const el = document.getElementById('hud-hgs-balance');
            if (el) el.innerText = `${this.data.hgsBalance} ₺`;
            const btn = document.getElementById('hud-hgs-btn');
            if (btn) btn.setAttribute('aria-label', `HGS Otoyol Gişesi ve Bakiye ${this.data.hgsBalance} lira (Y)`);
        },

        // Tuş Bağlantıları (J = Mola/Tesis, Y = HGS Gişe & Bakiye)
        setupKeyBindings: function () {
            window.addEventListener('keydown', (e) => {
                const k = e.key.toLowerCase();
                if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

                if (k === 'j') {
                    e.preventDefault();
                    this.toggleFacilityModal();
                } else if (k === 'y') {
                    e.preventDefault();
                    this.toggleHgsModal();
                }
            });
        },

        toggleFacilityModal: function () {
            const modal = document.getElementById('facility-modal');
            if (modal && !modal.classList.contains('hidden')) {
                this.closeFacilityModal();
            } else {
                this.openFacilityModal();
            }
        },

        toggleHgsModal: function () {
            const modal = document.getElementById('hgs-modal');
            if (modal && !modal.classList.contains('hidden')) {
                this.closeHgsModal();
            } else {
                this.openHgsModal();
            }
        },

        openFacilityModal: function () {
            this.injectFacilityModal();
            const modal = document.getElementById('facility-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
            this.renderFacilityContent();

            const fac = this.facilities[this.currentFacilityIndex];
            const msg = `Dinlenme Tesisleri Menüsü açıldı. Şu anki tesis: ${fac.name}. Mola vermek veya lezzet siparişi vermek için seçenekleri inceleyebilirsiniz.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
        },

        closeFacilityModal: function () {
            const modal = document.getElementById('facility-modal');
            if (modal) modal.classList.add('hidden');
        },

        openHgsModal: function () {
            this.injectHgsModal();
            const modal = document.getElementById('hgs-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
            this.renderHgsModal();

            const msg = `HGS Otoyol Gişe Sistemi açıldı. Güncel HGS bakiyeniz: ${this.data.hgsBalance} lira.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
        },

        closeHgsModal: function () {
            const modal = document.getElementById('hgs-modal');
            if (modal) modal.classList.add('hidden');
        },

        injectFacilityModal: function () {
            if (document.getElementById('facility-modal')) return;

            const modalHtml = `
            <div id="facility-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="facility-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8700; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="glass-panel" style="max-width: 860px; width: 95%; padding: 24px 28px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2px solid #f59e0b; box-shadow: 0 0 35px rgba(245, 158, 11, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <h2 id="facility-modal-title" class="gradient-text" style="font-size: 1.8rem; margin: 0; color: #fbbf24;">
                                🛋️ Efsane Karayolu Dinlenme Tesisleri & 30 Dk Mola
                            </h2>
                            <p style="color: #cbd5e1; font-size: 0.92rem; margin: 4px 0 0 0;">
                                Bolu Dağı çorbası, Susurluk tostu, tavşan kanı çay, cam yıkama ve muavin ihtiyaç molası anonsları.
                            </p>
                        </div>
                        <button id="btn-close-facility-modal" class="modern-btn" style="padding: 6px 14px; background: rgba(255,255,255,0.1); border: 1px solid #ef4444; color: #ef4444; font-size: 1.1rem; cursor: pointer;" aria-label="Tesis penceresini kapat (Esc veya J)">✕ Kapat</button>
                    </div>

                    <!-- Tesis Seçim Çubuğu -->
                    <div id="facility-tabs" style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 6px;"></div>

                    <!-- Tesis İçeriği -->
                    <div id="facility-details-container"></div>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.getElementById('btn-close-facility-modal').addEventListener('click', () => this.closeFacilityModal());
        },

        renderFacilityContent: function () {
            const tabsContainer = document.getElementById('facility-tabs');
            const detailsContainer = document.getElementById('facility-details-container');
            if (!tabsContainer || !detailsContainer) return;

            tabsContainer.innerHTML = '';
            this.facilities.forEach((fac, idx) => {
                const isActive = idx === this.currentFacilityIndex;
                const btn = document.createElement('button');
                btn.className = `modern-btn ${isActive ? 'btn-primary' : ''}`;
                btn.style.cssText = `padding: 8px 14px; white-space: nowrap; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: bold; ${isActive ? 'background: #f59e0b; color: #000; border: 1px solid #fbbf24;' : 'background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid #334155;'}`;
                btn.innerHTML = `${fac.icon} ${fac.name.split(' ')[0]} ${fac.name.split(' ')[1] || ''}`;
                btn.setAttribute('aria-label', `${fac.name} tesisini seç`);
                btn.addEventListener('click', () => {
                    this.currentFacilityIndex = idx;
                    this.renderFacilityContent();
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(`${fac.name} seçildi. ${fac.route}`);
                });
                tabsContainer.appendChild(btn);
            });

            const current = this.facilities[this.currentFacilityIndex];
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;

            let html = `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid #ca8a04; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.4rem; color: #facc15;">${current.icon} ${current.name}</h3>
                        <div style="color: #38bdf8; font-size: 0.9rem; margin-top: 4px;">📍 Güzergâh: <strong>${current.route}</strong></div>
                        <p style="color: #cbd5e1; font-size: 0.9rem; margin: 8px 0 0 0; max-width: 600px;">${current.desc}</p>
                    </div>
                    <div style="text-align: right; background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 8px; border: 1px solid #334155;">
                        <div style="color: #94a3b8; font-size: 0.8rem;">Cüzdan Bakiyeniz</div>
                        <div style="color: #22c55e; font-size: 1.3rem; font-weight: bold;">${currentBudget.toLocaleString('tr-TR')} ₺</div>
                    </div>
                </div>

                <!-- Hızlı Mola Butonları -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-top: 16px;">
                    <button id="btn-passenger-break" class="modern-btn" style="background: linear-gradient(135deg, #ca8a04, #eab308); color: #000; font-weight: bold; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem;" aria-label="30 Dakika Yolcu İhtiyaç Molası Başlat">
                        📢 30 Dk Yolcu Molası (Anons + Bahşiş)
                    </button>
                    <button id="btn-drink-tea" class="modern-btn" style="background: rgba(234, 179, 8, 0.2); border: 1px solid #facc15; color: #fef08a; font-weight: bold; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 0.95rem;" aria-label="Tavşan Kanı Çay İç (15 Lira)">
                        ☕ Tavşan Kanı Demli Çay (15 ₺)
                    </button>
                    <button id="btn-wash-windshield" class="modern-btn" style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #bae6fd; font-weight: bold; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 0.95rem;" aria-label="Ön Camı ve Farları Yıkat (40 Lira)">
                        🧼 Ön Camı & Farları Yıkat (40 ₺)
                    </button>
                </div>
            </div>

            <!-- Tesis Özel Lezzetleri Menüsü -->
            <h4 style="color: #fde047; font-size: 1.15rem; margin: 16px 0 10px 0;">🍽️ Tesis Restoranı & Yöresel Menü:</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            `;

            current.specialties.forEach(spec => {
                html += `
                <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">${spec.name}</div>
                        <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 4px;">${spec.effectDesc}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px;">
                        <span style="color: #facc15; font-size: 1.2rem; font-weight: bold;">${spec.price} ₺</span>
                        <button class="modern-btn btn-order-food" data-spec-id="${spec.id}" style="padding: 6px 14px; background: #eab308; color: #000; font-weight: bold; border-radius: 6px; border: none; cursor: pointer;" aria-label="${spec.name} sipariş et (${spec.price} lira)">
                            Sipariş Et
                        </button>
                    </div>
                </div>`;
            });

            html += `</div>`;
            detailsContainer.innerHTML = html;

            // Olay dinleyicileri
            document.getElementById('btn-passenger-break').addEventListener('click', () => {
                this.startPassengerBreak();
                this.renderFacilityContent();
            });
            document.getElementById('btn-drink-tea').addEventListener('click', () => {
                this.drinkTea();
                this.renderFacilityContent();
            });
            document.getElementById('btn-wash-windshield').addEventListener('click', () => {
                this.washWindshield();
                this.renderFacilityContent();
            });

            document.querySelectorAll('.btn-order-food').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const specId = e.currentTarget.getAttribute('data-spec-id');
                    this.orderFood(current.id, specId);
                    this.renderFacilityContent();
                });
            });
        },

        injectHgsModal: function () {
            if (document.getElementById('hgs-modal')) return;

            const modalHtml = `
            <div id="hgs-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="hgs-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8700; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="glass-panel" style="max-width: 820px; width: 95%; padding: 24px 28px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2px solid #3b82f6; box-shadow: 0 0 35px rgba(59, 130, 246, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <h2 id="hgs-modal-title" class="gradient-text" style="font-size: 1.8rem; margin: 0; color: #60a5fa;">
                                🏷️ HGS / OGS Otoyol Gişe Sistemi & Bakiye
                            </h2>
                            <p style="color: #cbd5e1; font-size: 0.92rem; margin: 4px 0 0 0;">
                                O-4, O-7, Osmangazi, 1915 Çanakkale ve TAG Otoyolu gişe tarifeleri, elektronik geçiş ve bakiye yükleme.
                            </p>
                        </div>
                        <button id="btn-close-hgs-modal" class="modern-btn" style="padding: 6px 14px; background: rgba(255,255,255,0.1); border: 1px solid #ef4444; color: #ef4444; font-size: 1.1rem; cursor: pointer;" aria-label="HGS penceresini kapat (Esc veya Y)">✕ Kapat</button>
                    </div>

                    <div id="hgs-details-container"></div>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.getElementById('btn-close-hgs-modal').addEventListener('click', () => this.closeHgsModal());
        },

        renderHgsModal: function () {
            const container = document.getElementById('hgs-details-container');
            if (!container) return;

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;

            let html = `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid #2563eb; border-radius: 12px; padding: 18px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                <div>
                    <div style="color: #94a3b8; font-size: 0.85rem;">HGS Kart Numarası & Plaka</div>
                    <div style="color: #fff; font-size: 1.15rem; font-weight: bold; margin-top: 2px;">59 TKL 183 • HGS-TR-0042918</div>
                    <div style="color: #38bdf8; font-size: 0.85rem; margin-top: 4px;">Toplam Ödenen Gişe Ücreti: <strong>${this.data.totalTollsPaid} ₺</strong></div>
                </div>
                <div style="text-align: right; background: rgba(30, 58, 138, 0.4); border: 1.5px solid #3b82f6; padding: 12px 20px; border-radius: 10px;">
                    <div style="color: #bfdbfe; font-size: 0.9rem;">Mevcut HGS Bakiyesi</div>
                    <div style="color: #60a5fa; font-size: 1.8rem; font-weight: bold;">${this.data.hgsBalance.toLocaleString('tr-TR')} ₺</div>
                </div>
            </div>

            <!-- Bakiye Yükleme Butonları -->
            <h4 style="color: #93c5fd; font-size: 1.1rem; margin: 0 0 10px 0;">💳 Nakit Bütçenizden HGS'ye Bakiye Yükleyin (Cüzdan: ${currentBudget.toLocaleString('tr-TR')} ₺):</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <button class="modern-btn btn-recharge-hgs" data-amt="100" style="flex: 1; min-width: 140px; padding: 10px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-weight: bold; border-radius: 8px; cursor: pointer;">
                    + 100 ₺ Yükle
                </button>
                <button class="modern-btn btn-recharge-hgs" data-amt="250" style="flex: 1; min-width: 140px; padding: 10px; background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #60a5fa; font-weight: bold; border-radius: 8px; cursor: pointer;">
                    + 250 ₺ Yükle
                </button>
                <button class="modern-btn btn-recharge-hgs" data-amt="500" style="flex: 1; min-width: 140px; padding: 10px; background: #2563eb; color: #fff; font-weight: bold; border-radius: 8px; border: none; cursor: pointer;">
                    + 500 ₺ Yükle
                </button>
            </div>

            <!-- Otoyol Gişeleri Listesi ve Test Geçişi -->
            <h4 style="color: #93c5fd; font-size: 1.1rem; margin: 0 0 10px 0;">🛣️ Otoyol Gişeleri (KGM Resmî Tarifeleri):</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
            `;

            this.tolls.forEach(toll => {
                const canAfford = this.data.hgsBalance >= toll.fee;
                html += `
                <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <div style="font-weight: bold; color: #fff; font-size: 1rem;">${toll.name}</div>
                        <div style="color: #94a3b8; font-size: 0.85rem;">${toll.road}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <span style="color: #facc15; font-size: 1.15rem; font-weight: bold;">${toll.fee} ₺</span>
                        <button class="modern-btn btn-pass-toll" data-toll-id="${toll.id}" style="padding: 6px 14px; background: ${canAfford ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}; border: 1px solid ${canAfford ? '#22c55e' : '#ef4444'}; color: ${canAfford ? '#4ade80' : '#f87171'}; border-radius: 6px; font-weight: bold; cursor: pointer;" aria-label="${toll.name} gişesinden geç (${toll.fee} lira)">
                            DİİİT! Gişeden Geç
                        </button>
                    </div>
                </div>`;
            });

            html += `</div>`;
            container.innerHTML = html;

            document.querySelectorAll('.btn-recharge-hgs').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const amt = parseInt(e.currentTarget.getAttribute('data-amt'), 10);
                    this.rechargeHgs(amt);
                });
            });

            document.querySelectorAll('.btn-pass-toll').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tollId = e.currentTarget.getAttribute('data-toll-id');
                    this.passThroughToll(tollId);
                    this.renderHgsModal();
                });
            });
        }
    };

    // Global nesneye bağla
    window.HighwayFacilities = HighwayFacilities;

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => HighwayFacilities.init());
    } else {
        HighwayFacilities.init();
    }
})();

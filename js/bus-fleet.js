/* ==========================================================================
   OTOBÜS FİLOSU VE ARAÇ SEÇİM SİSTEMİ (BUS FLEET SYSTEM)
   Farklı markalar (Mercedes-Benz, Otokar, BMC, MAN, Setra, Neoplan)
   ve her araca özel Web Audio DSP Akustik Ses Profilleri
   ========================================================================== */

const BusFleet = {
    buses: [
        {
            id: "otokar_sultan_mega",
            soundGroup: "midibus",
            brand: "Otokar",
            model: "Sultan LF / Mega 8.5M",
            fullName: "Otokar Sultan LF / Mega (8.49 Metre Midibüs)",
            category: "belediye",
            categoryName: "Küçük Sınıf Çevik Midibüs",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Midibüs Sınıfı)",
            lengthMeters: 8.49,
            turningRadius: "Çok Dar (6.3m Dönüş Yarıçapı)",
            roadFit: "Dar mahalle sokakları, köy yolları ve sahil ringleri için ideal",
            icon: "🚐",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 21,
            standingCapacity: 42,
            totalCapacity: 63,
            maxSpeed: 100,
            fuelTankCapacity: 190,
            fuelConsumptionRate: 21,
            acceleration: 1.15,
            braking: 1.15,
            engine: "Cummins B4.5E6D210B Euro 6 (4.5L - 210 HP - 850 Nm)",
            transmission: "Allison T280R 6 İleri Tam Otomatik (Entegre Retarderli)",
            doorType: "2 Adet Çift Kanatlı Pnömatik Kapı",
            features: "8.49m gerçek fabrika boyutu, 190L yakıt deposu, Allison T280R entegre retarder, tam alçak taban.",
            desc: "Otokar Arifiye fabrikası üretimi gerçek verili midibüs. 210 HP / 850 Nm Cummins motoru ve 190 L yakıt deposuyla mahalle hatlarının lideri.",
            nvhLevel: 72,
            chassisRigidity: 75,
            suspensionComfort: 72,
            cabinAcousticType: "Kompakt Midibüs & Yumuşak Dizel",
            structureDetails: "8.49 metre çevik gövde. Dar sokak manevralarında kaldırıma sürtme riski minimumdur.",
            tipBonusPercent: 12,
            soundProfile: {
                basePitch: 1.08,
                bassBoost: 3,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.85,
                character: "210 HP Cummins 4.5L yumuşak midibüs rölantisi ve Allison T280R retarder sesi"
            }
        },

        // --- BELEDİYE OTOBÜSLERİ (SEVİYE 1 - 10 ARASI ŞEHİR İÇİ) ---
        {
            id: "otokar_kent_lf",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo)",
            lengthMeters: 12.0,
            turningRadius: "Standart Şehir İçi (10.6m)",
            roadFit: "Şehir içi ana caddeler, bulvarlar ve standart durak cepleri",
            soundGroup: "city_cummins",
            brand: "Otokar",
            model: "Kent LF 12M",
            fullName: "Otokar Kent LF (12 Metre Solo)",
            category: "belediye",
            categoryName: "Şehir İçi Belediye Solo",
            icon: "🚌",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 27,
            standingCapacity: 76,
            totalCapacity: 103,
            maxSpeed: 90,
            fuelTankCapacity: 290,
            fuelConsumptionRate: 32,
            acceleration: 1.05,
            braking: 1.15,
            engine: "Cummins ISB6.7E6 300B Euro 6 (6.7L - 300 HP - 1182 Nm)",
            transmission: "ZF EcoLife 6 AP 1200B 6 İleri Otomatik (Entegre Retarderli)",
            doorType: "3 Adet İçe Açılır Çift Kanatlı Alçak Taban Kapı",
            features: "290L gerçek fabrika yakıt deposu, 300 HP / 1182 Nm Cummins motor, 27 oturan + 76 ayakta (103 yolcu), ZF EcoLife retarder.",
            desc: "TEKULAŞ ve büyükşehir belediyelerinde standart hizmet veren gerçek fabrika verili Otokar Kent LF 12M.",
            nvhLevel: 68,
            chassisRigidity: 76,
            suspensionComfort: 72,
            cabinAcousticType: "Gerçek Cummins ISB6.7 & ZF EcoLife Vınlaması",
            structureDetails: "12.0 metre tam alçak tabanlı katoforez kaplamalı çelik kafes gövde.",
            tipBonusPercent: 10,
            soundProfile: {
                basePitch: 1.0,
                bassBoost: 2,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.92,
                retarderPitch: 1.0,
                character: "300 HP 6.7L Cummins motor sesi, ZF EcoLife şanzıman ve şehir içi korna"
            }
        },
        {
            id: "bmc_neocity_10m",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Kompakt Mahalle Tipi)",
            lengthMeters: 9.96,
            turningRadius: "Dar (8.1m Dönüş Yarıçapı)",
            roadFit: "Yoğun mahalle caddeleri ve üniversite kampüs ringleri",
            soundGroup: "city_cummins",
            brand: "BMC",
            model: "Neocity 10M",
            fullName: "BMC Neocity (9.96 Metre VIP Belediye)",
            category: "belediye",
            categoryName: "Mahalle ve Dar Sokak Otobüsü",
            icon: "🚐",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 26,
            standingCapacity: 62,
            totalCapacity: 88,
            maxSpeed: 90,
            fuelTankCapacity: 215,
            fuelConsumptionRate: 28,
            acceleration: 1.15,
            braking: 1.15,
            engine: "Cummins ISB6.7 Euro 6 (6.7L - 280 HP - 1082 Nm)",
            transmission: "Voith DIWA.6 Otomatik (Entegre Hidrodinamik Retarderli)",
            doorType: "3 Kapılı Tam Alçak Taban Giriş",
            features: "9.96m gerçek fabrika boyutu, 215L yakıt deposu, 280 HP Cummins 6.7L motor, 88 toplam yolcu kapasitesi.",
            desc: "BMC Pınarbaşı fabrikası üretimi ödüllü 10 metre kompakt belediye otobüsü.",
            nvhLevel: 70,
            chassisRigidity: 74,
            suspensionComfort: 72,
            cabinAcousticType: "Kompakt Şehir İçi (280 HP Atik Tork & Voith DIWA)",
            structureDetails: "9.96 metre kompakt şasi üzerinde 12 metrelik otobüs motoru (280 HP) taşıyan yüksek çekişli yapı.",
            tipBonusPercent: 10,
            soundProfile: {
                basePitch: 1.12,
                bassBoost: 2,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.92,
                retarderPitch: 1.0,
                character: "280 HP Cummins 6.7L canlı tork ve Voith DIWA retarder ıslığı"
            }
        },
        {
            id: "mercedes_conecto_12m",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo)",
            lengthMeters: 12.13,
            turningRadius: "Standart Şehir İçi (10.7m)",
            roadFit: "Şehir içi ana arterler ve ilçe bağlantı karayolları",
            soundGroup: "conecto_solo",
            brand: "Mercedes-Benz",
            model: "Conecto Solo 12M",
            fullName: "Mercedes-Benz Conecto Solo (12.13 Metre)",
            category: "belediye",
            categoryName: "Şehir İçi Konfor Solo",
            icon: "🚌",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 27,
            standingCapacity: 74,
            totalCapacity: 101,
            maxSpeed: 90,
            fuelTankCapacity: 270,
            fuelConsumptionRate: 30,
            acceleration: 1.12,
            braking: 1.2,
            engine: "Mercedes-Benz OM 936 LA Euro 6 (7.7L - 299 HP - 1200 Nm)",
            transmission: "Voith DIWA.6 / ZF EcoLife 2 Otomatik (Entegre Retarderli)",
            doorType: "3 Adet Çift Kanatlı Pnömatik Kapı",
            features: "12.13m gerçek fabrika boyutu, 270L yakıt deposu, 299 HP (220 kW) 1200 Nm OM 936 motor, geri kazanım modülü.",
            desc: "Mercedes-Benz Türk Hoşdere fabrikası üretimi gerçek katalog verili Conecto Solo.",
            nvhLevel: 78,
            chassisRigidity: 82,
            suspensionComfort: 79,
            cabinAcousticType: "Gelişmiş Şehir İçi (Tok OM 936 & Voith DIWA)",
            structureDetails: "Alman bağımsız ön aks, titreşimi sönümleyen motor takozları. Tok ve pürüzsüz OM 936 sesi.",
            tipBonusPercent: 12,
            soundProfile: {
                basePitch: 0.94,
                bassBoost: 3,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.85,
                retarderPitch: 1.0,
                character: "299 HP OM 936 LA tok Alman dizeli ve Voith DIWA.6 şanzıman vınlaması"
            }
        },
        {
            id: "mercedes_conecto_g",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (18.12 Metre Körüklü Dev)",
            lengthMeters: 18.12,
            turningRadius: "Geniş Dönüş Açısı (11.4m Mafsallı)",
            roadFit: "Organize sanayi vardiya koridorları ve geniş metropol bulvarları",
            soundGroup: "articulated",
            brand: "Mercedes-Benz",
            model: "Conecto G 18M",
            fullName: "Mercedes-Benz Conecto G (18.12 Metre Körüklü)",
            category: "belediye",
            categoryName: "Körüklü Üniversite & Metrobüs",
            icon: "🚎",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 39,
            standingCapacity: 110,
            totalCapacity: 149,
            maxSpeed: 85,
            fuelTankCapacity: 340,
            fuelConsumptionRate: 42,
            acceleration: 1.0,
            braking: 1.25,
            engine: "Mercedes-Benz OM 470 LA Euro 6 (10.7L - 360 HP - 1700 Nm)",
            transmission: "ZF EcoLife 2 6AP 1720B 6 İleri Otomatik (Entegre Retarderli)",
            doorType: "4 Adet Çift Kanatlı Pnömatik Kapı",
            features: "18.12m gerçek fabrika boyutu, 340L yakıt deposu, 360 HP (265 kW) 1700 Nm OM 470 motor, ATC körük kontrolü.",
            desc: "Hoşdere fabrikası üretimi gerçek katalog verili 18.12 metre Conecto G körüklü belediye otobüsü.",
            nvhLevel: 76,
            chassisRigidity: 84,
            suspensionComfort: 80,
            cabinAcousticType: "Derin Sub-Bass OM 470 & Körük Akustiği",
            structureDetails: "18.12 metre ATC (Articulation Turntable Controller) hidrolik körük dengelemeli mafsallı gövde.",
            tipBonusPercent: 15,
            soundProfile: {
                basePitch: 0.88,
                bassBoost: 6,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.90,
                retarderPitch: 1.0,
                character: "360 HP 10.7L OM 470 ağır rölanti bası, ZF EcoLife retarder ve 4 kapı hava tahliyesi"
            }
        },

        // --- ŞEHİRLERARASI SEYAHAT OTOBÜSLERİ (SEVİYE 10'DAN SONRA AÇILIR) ---
        {
            id: "mercedes_travego_16shd",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (Şehirlerarası Seyahat Devi)",
            lengthMeters: 13.11,
            turningRadius: "Geniş Dönüş Açısı (10.9m)",
            roadFit: "Şehirlerarası otoyollar ve ekspres peron seferleri",
            soundGroup: "pure_v6",
            brand: "Mercedes-Benz",
            model: "Travego 16 SHD",
            fullName: "Mercedes-Benz Travego 16 SHD (13.11m 2+1 Rahat)",
            category: "seyahat",
            categoryName: "Şehirlerarası Lüks Seyahat",
            icon: "🛣️",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 120,
            fuelTankCapacity: 490,
            fuelConsumptionRate: 26,
            acceleration: 1.28,
            braking: 1.35,
            engine: "Mercedes-Benz OM 470 Euro 6 (10.7L - 456 HP / 335 kW - 2200 Nm)",
            transmission: "Mercedes GO 250-8 PowerShift 3 (8 İleri Otomatik + Voith SWR Su Retarderli)",
            doorType: "Pnömatik Tekli Piston Ön & Orta Kapı",
            features: "13.11m gerçek fabrika boyutu, 490L yakıt deposu, 456 HP / 2200 Nm OM 470 motor, 41 koltuklu 2+1 düzen, Voith Aquatarder SWR.",
            desc: "Mercedes-Benz Türk Hoşdere üretimi Türkiye otoyollarının amiral gemisi. 456 beygirlik gerçek fabrika verili lüks seyahat ikonu.",
            nvhLevel: 95,
            chassisRigidity: 94,
            suspensionComfort: 93,
            cabinAcousticType: "456 HP OM 470 Rölantisi & Fısıltı Kabin",
            structureDetails: "Akustik çift camlar, çok katmanlı motor yangın/ses duvarı. Motor sesi arka planda kadife bir nefes gibi kalır.",
            tipBonusPercent: 40,
            soundProfile: {
                basePitch: 0.92,
                bassBoost: 5,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.75,
                retarderPitch: 1.0,
                character: "456 HP OM 470 BlueTec uzun yol homurtusu + Voith SWR su retarderi ıslığı ve havalı korna"
            }
        },
        {
            id: "mercedes_tourismo_16rhd",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (Şehirlerarası Seyahat Devi)",
            lengthMeters: 13.11,
            turningRadius: "Geniş Dönüş Açısı (10.8m)",
            roadFit: "Şehirlerarası otoyollar ve yüksek yolcu kapasiteli hatlar",
            soundGroup: "coach_terminal",
            brand: "Mercedes-Benz",
            model: "Tourismo 16 RHD",
            fullName: "Mercedes-Benz Tourismo 16 RHD (13.11m 2+1 / 2+2)",
            category: "seyahat",
            categoryName: "Klasik Şehirlerarası Yolcu",
            icon: "🛣️",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 115,
            fuelTankCapacity: 480,
            fuelConsumptionRate: 25,
            acceleration: 1.24,
            braking: 1.28,
            engine: "Mercedes-Benz OM 470 Euro 6 (10.7L - 428 HP / 315 kW - 2100 Nm)",
            transmission: "Mercedes GO 250-8 PowerShift 3 (8 İleri Otomatik + Voith SWR Retarder)",
            doorType: "Pnömatik Dışa Açılır Yolcu Kapısı",
            features: "13.11m gerçek fabrika boyutu, 480L yakıt deposu, 428 HP / 2100 Nm OM 470 motor, 41 koltuklu 2+1 Rahat düzen.",
            desc: "Hoşdere fabrikası üretimi, Türkiye otogarlarının en çok tercih edilen 428 beygirlik uzun yol otobüsü.",
            nvhLevel: 88,
            chassisRigidity: 89,
            suspensionComfort: 87,
            cabinAcousticType: "Dengeli Uzun Yol (428 HP OM 470 Sessiz Seyir)",
            structureDetails: "Otogarların vazgeçilmezi. Dengeli kabin yalıtımı ve düşük rüzgar dirençli aerodinamik burun (Cw 0.33).",
            tipBonusPercent: 25,
            soundProfile: {
                basePitch: 0.95,
                bassBoost: 4,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.80,
                retarderPitch: 0.95,
                engineSample: "coach_terminal_idle",
                character: "428 HP OM 470 Otogar Peron Rölantisi + Hava Tahliyesi ve Dengeli Uzun Yol Dizeli"
            }
        },
        {
            id: "man_lions_coach",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (480 HP Rampa Canavarı)",
            lengthMeters: 13.09,
            turningRadius: "Geniş Dönüş Açısı (10.6m)",
            roadFit: "Otoyollar ve dik dağ geçitleri",
            soundGroup: "man_d26",
            brand: "MAN",
            model: "Lion's Coach C 13M",
            fullName: "MAN Lion's Coach C (13.09m 480 HP)",
            category: "seyahat",
            categoryName: "Yüksek Güçlü Uzun Yol",
            icon: "🦁",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 120,
            fuelTankCapacity: 525,
            fuelConsumptionRate: 26,
            acceleration: 1.36,
            braking: 1.36,
            engine: "MAN D2676 LOH Euro 6e (12.4L - 480 HP / 353 kW - 2400 Nm)",
            transmission: "MAN TipMatic Coach 12.25 OD (12 İleri Otomatik + ZF Intarder 3)",
            doorType: "Pnömatik Dışa Açılır Çift Kilitli Kapı",
            features: "13.09m gerçek Ankara fabrikası verisi, 525L yakıt deposu, 12.4L 480 HP / 2400 Nm tork, 4000 Nm ZF Intarder 3.",
            desc: "MAN Ankara Akyurt fabrikası üretimi gerçek katalog verili Lion's Coach C. 2400 Nm torkuyla rampaları düz yol gibi tırmanır.",
            nvhLevel: 92,
            chassisRigidity: 93,
            suspensionComfort: 91,
            cabinAcousticType: "480 HP Karizmatik Homurtu & MAN Intarder",
            structureDetails: "2400 Nm devasa tork, virajda esnemeyen rijit kafes şasi. Rampa tırmanışında fısıltı sessizliğinde kabin.",
            tipBonusPercent: 35,
            soundProfile: {
                basePitch: 0.86,
                bassBoost: 7,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.75,
                retarderPitch: 1.1,
                character: "480 HP 12.4L yırtıcı MAN D2676 sesi + güçlü ZF Intarder 3 ve kalın havalı korna"
            }
        },
        {
            id: "setra_topclass_s516",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (13.32 Metre Çift Dingil VIP Devi)",
            lengthMeters: 13.32,
            turningRadius: "Çift Dingil Dönüş Yarıçapı (10.7m)",
            roadFit: "Uzun yol otoyolları ve kıtalararası prestij hatları",
            soundGroup: "pure_v6",
            brand: "Setra",
            model: "S 516 HDH TopClass",
            fullName: "Setra S 516 HDH TopClass (13.32m 3 Aks VIP)",
            category: "seyahat",
            categoryName: "Ultra VIP Premium Seyahat",
            icon: "👑",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 42,
            standingCapacity: 0,
            totalCapacity: 42,
            maxSpeed: 125,
            fuelTankCapacity: 510,
            fuelConsumptionRate: 29,
            acceleration: 1.42,
            braking: 1.45,
            engine: "Mercedes-Benz OM 471 LA Euro 6 (12.8L - 510 HP / 375 kW - 2500 Nm)",
            transmission: "Mercedes GO 250-8 PowerShift 3 (8 İleri Otomatik + Voith Aquatarder SWR)",
            doorType: "Elektro-Pnömatik Akıllı Kapı",
            features: "13.32m gerçek Neu-Ulm fabrika boyutu, 510L yakıt deposu, 12.8L 510 HP / 2500 Nm OM 471 motor, aktif arka aks yönlendirme.",
            desc: "Daimler Buses zirvesi. 510 beygir ve 2500 Nm torklu çift arka dingilli ultra lüks VIP seyahat otobüsü.",
            nvhLevel: 98,
            chassisRigidity: 98,
            suspensionComfort: 98,
            cabinAcousticType: "Daimler Buses Zirvesi: Fısıltı Kabin & Uçan Halı",
            structureDetails: "510 HP çift dingil, TopSky Panorama cam tavan, akustik çift lamine camlar. Derz ve çukurları hissettirmeyen süspansiyon.",
            tipBonusPercent: 50,
            soundProfile: {
                basePitch: 0.90,
                bassBoost: 6,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.55,
                retarderPitch: 0.9,
                character: "510 HP 12.8L OM 471 çift dingil, kabin içinde fısıltı sessizliğinde ultra lüks VIP tını"
            }
        },
        {
            id: "isuzu_novo_lux",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Midibüs Sınıfı)",
            lengthMeters: 7.31,
            turningRadius: "Çok Dar (6.25m Dönüş Yarıçapı)",
            roadFit: "Dar mahalle sokakları ve kırsal köy hatları için ideal",
            soundGroup: "midibus",
            brand: "Isuzu",
            model: "Novo Lux 7.3M",
            fullName: "Anadolu Isuzu Novo Lux (7.31m İlçe & Turizm)",
            category: "sehirici",
            categoryName: "İlçe ve Kasaba Hattı",
            icon: "🚐",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 29,
            standingCapacity: 0,
            totalCapacity: 29,
            maxSpeed: 105,
            fuelTankCapacity: 150,
            fuelConsumptionRate: 19,
            acceleration: 1.28,
            braking: 1.2,
            engine: "Isuzu 4HK1E6C-E Euro 6 (5.2L - 190 HP - 510 Nm)",
            transmission: "Isuzu MZZ-6F 6 İleri Manuel + Elektromanyetik Retarder",
            doorType: "Pnömatik Dışa Açılır Ön ve Arka Kapı",
            features: "7.31m gerçek Çayırova fabrika boyutu, 150L yakıt deposu, 5.2L 190 HP / 510 Nm motor, elektromanyetik Telma retarder.",
            desc: "Anadolu Isuzu Çayırova fabrikası üretimi gerçek katalog verili 29 koltuklu Novo Lux midibüs.",
            nvhLevel: 68,
            chassisRigidity: 72,
            suspensionComfort: 70,
            cabinAcousticType: "Dayanıklı Kırsal (5.2L Isuzu Turbo Dizel)",
            structureDetails: "Rampa ve dar dağ yollarına dayanıklı sağlam şasi. 190 HP turbo ıslığı kabinde belirgindir.",
            tipBonusPercent: 8,
            soundProfile: {
                basePitch: 1.15,
                bassBoost: 2,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.90,
                retarderPitch: 1.0,
                character: "190 HP 5.2L Isuzu turbo dizel ıslığı + elektromanyetik retarder"
            }
        },
        {
            id: "mercedes_o403_rhd",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Klasik Standart Kasa)",
            lengthMeters: 12.0,
            turningRadius: "Standart Karayolu (10.9m)",
            roadFit: "İlçeler arası karayolları ve nostaljik ekspres hatlar",
            soundGroup: "v8_bass",
            brand: "Mercedes-Benz",
            model: "O 403 SHD",
            fullName: "Mercedes-Benz O 403 SHD V8 (12.0m Yolların Efsanesi)",
            category: "seyahat",
            categoryName: "Efsane Klasik Şehirlerarası",
            icon: "👑",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 46,
            standingCapacity: 0,
            totalCapacity: 46,
            maxSpeed: 125,
            fuelTankCapacity: 490,
            fuelConsumptionRate: 31,
            acceleration: 1.32,
            braking: 1.25,
            engine: "Mercedes-Benz OM 442 LA V8 Twin-Turbo Intercooler (14.6L - 381 HP - 1770 Nm)",
            transmission: "ZF S 6-1550 6 İleri Manuel + Voith R115 Hidrodinamik Retarder",
            doorType: "Klasik Pnömatik Pistonlu Çift Kapı",
            features: "12.0m gerçek fabrika boyutu, 490L yakıt deposu, 14.618 cc V8 çift turbolu 381 HP motor, efsane ıslık çalan Voith R115 retarder.",
            desc: "Mercedes-Benz Türk Davutpaşa / Hoşdere üretimi Türkiye otoyol tarihinin en unutulmaz V8 efsanesi.",
            nvhLevel: 84,
            chassisRigidity: 86,
            suspensionComfort: 82,
            cabinAcousticType: "Efsanevi 14.6L V8 Kükremesi & Voith R115 Islık Retarder",
            structureDetails: "Otoyolların 90'lar ve 2000'ler efsanesi. 381 HP V8 motorun tok mekanik kükremesi ve meşhur türbin ıslığı.",
            tipBonusPercent: 25,
            soundProfile: {
                basePitch: 0.85,
                bassBoost: 8,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.85,
                retarderPitch: 1.15,
                engineSample: "bassrolanti",
                character: "381 HP 14.6L V8 mekanik kükreme + meşhur Voith R115 ıslık retarder ve çift borulu havalı korna"
            }
        },
        {
            id: "temsa_safir_plus",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (2+1 VIP Seyahat Devi)",
            lengthMeters: 13.0,
            turningRadius: "Geniş Dönüş Açısı (10.4m)",
            roadFit: "Şehirlerarası otoyollar ve VIP seyahat hatları",
            soundGroup: "daf_paccar",
            brand: "Temsa",
            model: "Safir Plus 13M",
            fullName: "Temsa Safir Plus (13.0m 2+1 VIP)",
            category: "seyahat",
            categoryName: "Şehirlerarası Uzun Yol",
            icon: "💎",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 115,
            fuelTankCapacity: 560,
            fuelConsumptionRate: 26,
            acceleration: 1.34,
            braking: 1.32,
            engine: "DAF PACCAR MX-11 320 Euro 6 (10.8L - 435 HP / 320 kW - 2100 Nm)",
            transmission: "ZF 6S 2110 BO / ZF TraXon Otomatik + ZF Intarder 3",
            doorType: "Pnömatik Tekli Ön & Orta Kapı",
            features: "13.0m gerçek Adana fabrika boyutu, 560L yakıt deposu, 435 HP / 2100 Nm DAF MX-11 motor, 41 koltuklu 2+1 VIP düzen.",
            desc: "Temsa Adana fabrikası üretimi gerçek katalog verili Safir Plus 13M. 560 litre deposu ve düşük yakıt tüketimiyle filo gözdesi.",
            nvhLevel: 87,
            chassisRigidity: 88,
            suspensionComfort: 86,
            cabinAcousticType: "435 HP DAF PACCAR Homurtusu & ZF İntarder",
            structureDetails: "Geniş bagaj yapısı (10 m³) ve 435 HP DAF PACCAR MX-11 gücü. Kabinde tok rölanti ve güçlü intarder freni.",
            tipBonusPercent: 24,
            soundProfile: {
                basePitch: 0.88,
                bassBoost: 6,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.70,
                retarderPitch: 0.95,
                engineSample: "daf_paccar",
                character: "435 HP DAF PACCAR MX-11 homurtusu + ZF İntarder 3 ıslığı ve havalı korna"
            }
        },
        {
            id: "scania_irizar_i8",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (14.07 Metre Çift Dingil Peron Kralı)",
            lengthMeters: 14.07,
            turningRadius: "Çift Dingil Geniş Açılı (11.2m)",
            roadFit: "Şehirlerarası otoyollar ve büyük otogar peronları",
            soundGroup: "scania_dc13",
            brand: "Scania",
            model: "Irizar i8 14M 3 Aks",
            fullName: "Scania Irizar i8 VIP (14.07m 500 HP Peron Kralı)",
            category: "seyahat",
            categoryName: "VIP Lüks Seyahat Devi",
            icon: "👑",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 44,
            standingCapacity: 0,
            totalCapacity: 44,
            maxSpeed: 125,
            fuelTankCapacity: 600,
            fuelConsumptionRate: 30,
            acceleration: 1.44,
            braking: 1.42,
            engine: "Scania DC13 147 Euro 6 (12.7L - 500 HP / 368 kW - 2550 Nm)",
            transmission: "Scania Opticruise GRSO895R 12 İleri Otomatik + R4100D Retarder",
            doorType: "Pnömatik Çift Kilitli Elektro-Hidrolik Kapı",
            features: "14.07m gerçek fabrika boyutu, 600L yakıt deposu, 12.7L 500 HP / 2550 Nm Scania DC13 motor, 4100 Nm Scania R4100D retarder.",
            desc: "500 beygirlik İsveç Scania şasisi ve İspanyol Irizar i8 VIP karoserinin gerçek katalog verili birleşimi.",
            nvhLevel: 95,
            chassisRigidity: 94,
            suspensionComfort: 94,
            cabinAcousticType: "500 HP Scania DC13 Tok Dizel & Kusursuz İzolasyon",
            structureDetails: "Lüks Irizar i8 karoseri, 3.98m yükseklik, otoyol rüzgarını sıfıra indiren aerodinamik yapı.",
            tipBonusPercent: 38,
            soundProfile: {
                basePitch: 0.98,
                bassBoost: 5,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.70,
                retarderPitch: 1.0,
                engineSample: "scania_dc13",
                character: "500 HP Scania DC13 derin torklu İsveç rölantisi + R4100D retarder ve gür havalı korna"
            }
        },
        {
            id: "neoplan_cityliner",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (Fütüristik Lüks Seyahat Devi)",
            lengthMeters: 12.99,
            turningRadius: "Geniş Dönüş Açısı (10.7m)",
            roadFit: "Şehirlerarası otoyollar ve prestijli turizm turları",
            soundGroup: "man_d26",
            brand: "Neoplan",
            model: "Cityliner C N1216 HD",
            fullName: "Neoplan Cityliner C (12.99m Fütüristik Lüks)",
            category: "seyahat",
            categoryName: "Efsane Fütüristik Filo Lideri",
            icon: "🚀",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 120,
            fuelTankCapacity: 490,
            fuelConsumptionRate: 27,
            acceleration: 1.38,
            braking: 1.4,
            engine: "MAN D2676 LOH Euro 6 (12.4L - 470 HP / 346 kW - 2400 Nm)",
            transmission: "MAN TipMatic Coach 12 İleri Otomatik + ZF Intarder 3",
            doorType: "Pnömatik Çift Emniyetli Kapı",
            features: "12.99m gerçek fabrika boyutu (N1216 HD), 490L yakıt deposu, 470 HP / 2400 Nm MAN D2676 motor, bölünmüş Sharp Cut ön cam.",
            desc: "Neoplan'ın ödüllü Sharp Cut tasarımına sahip gerçek katalog verili 12.99 metre Cityliner C modeli.",
            nvhLevel: 96,
            chassisRigidity: 95,
            suspensionComfort: 95,
            cabinAcousticType: "Fütüristik Sessizlik & Pürüzsüz Seyir",
            structureDetails: "Panoramik akustik çift camlar, bağımsız ön süspansiyon ve CDS elektronik amortisör kontrolü.",
            tipBonusPercent: 45,
            soundProfile: {
                basePitch: 0.91,
                bassBoost: 5,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.65,
                retarderPitch: 1.05,
                character: "470 HP 12.4L aerodinamik rüzgar izolasyonu + TipMatic otomatik vites ve ZF Intarder 3"
            }
        },
        // --- YENİ EKLENEN OTOBÜSLER (FİLO GENİŞLEMESİ 6 MODEL) ---
        // 1. SEVİYE: KÜÇÜK OTOBÜSLER (MİDİBÜS & DOLMUŞ)
        {
            id: "iveco_daily_minibus",
            soundGroup: "iveco_daily",
            brand: "Iveco",
            model: "Daily 70C21 (19+1)",
            fullName: "Iveco Daily 70C21 Hi-Matic (7.22m 19+1 Minibüs)",
            category: "belediye",
            categoryName: "Mahalle & Köy Dolmuş Hattı",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Minibüs & Dolmuş Sınıfı)",
            lengthMeters: 7.22,
            turningRadius: "Maksimum Kıvraklık (6.4m Dönüş Yarıçapı)",
            roadFit: "En dar mahalle çıkmazları, köy yolları ve dik tepe rampaları",
            icon: "🚐",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 19,
            standingCapacity: 8,
            totalCapacity: 27,
            maxSpeed: 105,
            fuelTankCapacity: 100,
            fuelConsumptionRate: 15,
            acceleration: 1.25,
            braking: 1.18,
            engine: "Iveco F1C 3.0L HPI Twin-Turbo Euro 6 (210 HP / 154 kW - 470 Nm)",
            transmission: "ZF Hi-Matic 8HP 8 İleri Tam Otomatik + Telma Retarder",
            doorType: "Elektrikli Otomatik Sürgülü / Dışa Açılır Yolcu Kapısı",
            features: "7.22m gerçek fabrika boyutu, 100L yakıt deposu, 3.0L 210 HP / 470 Nm F1C motor, 8 ileri ZF Hi-Matic şanzıman, Telma retarder.",
            desc: "Dar mahalle sokaklarında ve tepe hatlarında yüksek torkuyla çalışan gerçek katalog verili Iveco Daily 70C21.",
            nvhLevel: 68,
            chassisRigidity: 72,
            suspensionComfort: 69,
            cabinAcousticType: "Tok 3.0L F1C Dizel & Seri Dolmuş Rölantisi",
            structureDetails: "7.22 metre C-kesitli çelik kamyonet şasisi, arka havalı süspansiyon ve Telma elektromanyetik retarder.",
            tipBonusPercent: 15,
            soundProfile: {
                basePitch: 1.05,
                bassBoost: 3,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.90,
                character: "210 HP Iveco 3.0L F1C Twin-Turbo tok dizel dolmuş rölantisi"
            }
        },
        {
            id: "karsan_atak_8m",
            soundGroup: "karsan_atak",
            brand: "Karsan",
            model: "Atak 8.15M",
            fullName: "Karsan Atak (8.15 Metre Alçak Taban Midibüs)",
            category: "belediye",
            categoryName: "Alçak Tabanlı Çevik Şehir İçi",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Alçak Taban Midibüs)",
            lengthMeters: 8.15,
            turningRadius: "Çok Dar (6.3m Dönüş Yarıçapı)",
            roadFit: "Dar mahalle hatları, tarihi merkezler ve sahil ringleri",
            icon: "🚌",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 23,
            standingCapacity: 35,
            totalCapacity: 58,
            maxSpeed: 90,
            fuelTankCapacity: 140,
            fuelConsumptionRate: 21,
            acceleration: 1.2,
            braking: 1.18,
            engine: "FPT NEF4 (Iveco) 4.5L Euro 6 (186 HP / 137 kW - 680 Nm)",
            transmission: "Allison T2100R 6 İleri Tam Otomatik (Entegre Retarderli)",
            doorType: "2 Adet Çift Kanatlı Alçak Taban Pnömatik Kapı",
            features: "8.15m gerçek Bursa fabrika boyutu, 140L yakıt deposu, 186 HP / 680 Nm FPT NEF4 motor, 23 oturan + 35 ayakta (58 yolcu).",
            desc: "Karsan Hasanağa Bursa fabrikası üretimi gerçek katalog verili 8.15 metre alçak tabanlı midibüs.",
            nvhLevel: 74,
            chassisRigidity: 77,
            suspensionComfort: 75,
            cabinAcousticType: "Modern Kompakt FPT Euro 6 & Sessiz Rölanti",
            structureDetails: "8.15 metre tam alçak tabanlı monokok gövde, ECAS yana yatma (kneeling) ve engelli rampası.",
            tipBonusPercent: 12,
            soundProfile: {
                basePitch: 1.02,
                bassBoost: 2,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.85,
                character: "186 HP 4.5L FPT NEF4 yumuşak alçak taban midibüs rölantisi ve Allison retarder"
            }
        },

        // 2. SEVİYE: ORTA BÜYÜKLÜKTE OTOBÜSLER (STANDART SOLO 12M)
        {
            id: "bmc_procity_12m",
            soundGroup: "bmc_procity",
            brand: "BMC",
            model: "Procity TR 12M Solo",
            fullName: "BMC Procity TR 12M (11.93m Yerli Metropol Solo)",
            category: "belediye",
            categoryName: "Standart Alçak Taban Şehir İçi",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo 12m)",
            lengthMeters: 11.93,
            turningRadius: "Standart Şehir İçi (10.5m)",
            roadFit: "Metropol ana arterleri, bulvarlar ve yoğun otobüs durakları",
            icon: "🚍",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 26,
            standingCapacity: 75,
            totalCapacity: 101,
            maxSpeed: 90,
            fuelTankCapacity: 275,
            fuelConsumptionRate: 31,
            acceleration: 1.1,
            braking: 1.2,
            engine: "Cummins ISB6.7 Euro 6 (6.7L - 280 HP - 1082 Nm)",
            transmission: "ZF EcoLife 6 AP 1200B 6 İleri Otomatik (Entegre Retarderli)",
            doorType: "3 Adet İçe Açılır Çift Kanatlı Alçak Taban Kapı",
            features: "11.93m gerçek İzmir Pınarbaşı fabrika boyutu, 275L yakıt deposu, 280 HP / 1082 Nm Cummins motor, 26 oturan + 75 ayakta (101 yolcu).",
            desc: "BMC Pınarbaşı fabrikası üretimi gerçek katalog verili Procity TR 12M. Büyükşehir belediyelerinin en yaygın solo otobüsü.",
            nvhLevel: 72,
            chassisRigidity: 81,
            suspensionComfort: 76,
            cabinAcousticType: "Tok Cummins ISB6.7 Solo & ZF EcoLife Rölantisi",
            structureDetails: "11.93 metre güçlendirilmiş çelik şasi, tam alçak taban ve ZF EcoLife entegre retarder.",
            tipBonusPercent: 14,
            soundProfile: {
                basePitch: 0.98,
                bassBoost: 4,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.88,
                character: "280 HP Cummins ISB6.7 tok belediye rölantisi ve ZF EcoLife şanzıman vınlaması"
            }
        },
        {
            id: "temsa_avenue_lf",
            soundGroup: "temsa_avenue",
            brand: "Temsa",
            model: "Avenue LF 12M",
            fullName: "Temsa Avenue LF (12.0 Metre Solo Belediye)",
            category: "belediye",
            categoryName: "Alçak Taban Yerli Solo",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo 12m)",
            lengthMeters: 12.0,
            turningRadius: "Standart Şehir İçi (10.4m)",
            roadFit: "Geniş caddeler ve ilçe hatları",
            icon: "🚍",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 29,
            standingCapacity: 73,
            totalCapacity: 102,
            maxSpeed: 90,
            fuelTankCapacity: 288,
            fuelConsumptionRate: 30,
            acceleration: 1.14,
            braking: 1.2,
            engine: "Cummins ISB6.7E6 280B Euro 6 (6.7L - 280 HP - 1100 Nm)",
            transmission: "ZF EcoLife 6 AP 1200B / Allison T325R (Entegre Retarderli)",
            doorType: "3 Adet Çift Kanatlı Alçak Taban Kapı",
            features: "12.0m gerçek Adana fabrika boyutu, 288L yakıt deposu, 280 HP / 1100 Nm Cummins motor, 29 oturan + 73 ayakta (102 yolcu).",
            desc: "Temsa Adana fabrikası üretimi gerçek katalog verili Avenue LF 12M. Paslanmaz çelik gövde ve 288L yakıt deposu.",
            nvhLevel: 75,
            chassisRigidity: 82,
            suspensionComfort: 78,
            cabinAcousticType: "Adana Mühendisliği: Tok Şehir İçi Rölanti & ZF/Allison Tınısı",
            structureDetails: "Paslanmaz çelik kompozit gövde, yüksek korozyon dayanımı ve ferah kabin.",
            tipBonusPercent: 16,
            soundProfile: {
                basePitch: 0.96,
                bassBoost: 4,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.85,
                character: "280 HP Cummins ISB6.7 tok dizel solo rölantisi ve entegre retarder"
            }
        },

        // 3. SEVİYE: BÜYÜK OTOBÜSLER (KÖRÜKLÜ & VIP DEVLER)
        {
            id: "otokar_kent_articulated",
            soundGroup: "kent_articulated",
            brand: "Otokar",
            model: "Kent LF Körüklü 18.75M",
            fullName: "Otokar Kent LF Körüklü (18.75 Metre Metropol Devi)",
            category: "belediye",
            categoryName: "Körüklü Metropol & Kampüs Devi",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (18.75m Körüklü Metropol Devi)",
            lengthMeters: 18.75,
            turningRadius: "Mafsallı Geniş Açı (11.9m Dönüş Yarıçapı)",
            roadFit: "Üniversite ekspres koridorları ve metropol ana arterleri",
            icon: "🚎",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 38,
            standingCapacity: 116,
            totalCapacity: 154,
            maxSpeed: 85,
            fuelTankCapacity: 380,
            fuelConsumptionRate: 43,
            acceleration: 1.05,
            braking: 1.3,
            engine: "DAF PACCAR MX-11 271 Euro 6 (10.8L - 369 HP / 271 kW - 1600 Nm)",
            transmission: "Voith DIWA.6 / ZF EcoLife 6 AP 1700B (Entegre Retarderli)",
            doorType: "4 Adet Çift Kanatlı Pnömatik Alçak Taban Kapı",
            features: "18.75m gerçek Arifiye fabrika boyutu, 380L yakıt deposu, 369 HP / 1600 Nm DAF MX-11 motor, 38 oturan + 116 ayakta (154 yolcu).",
            desc: "Otokar Arifiye fabrikası üretimi gerçek katalog verili 18.75 metre Kent LF Körüklü metropol otobüsü.",
            nvhLevel: 79,
            chassisRigidity: 85,
            suspensionComfort: 81,
            cabinAcousticType: "18.75m Ağır Körüklü DAF MX-11 Derin Bas",
            structureDetails: "18.75 metre körüklü gövde, elektronik körük burkulma kontrolü ve 380L yakıt deposu.",
            tipBonusPercent: 20,
            soundProfile: {
                basePitch: 0.89,
                bassBoost: 7,
                hasRetarder: true,
                hornSound: "city",
                cabinDamping: 0.90,
                character: "369 HP DAF PACCAR MX-11 derin körüklü transit rölantisi ve 4 kapılı hava tahliyesi"
            }
        },
        {
            id: "temsa_maraton_vip",
            soundGroup: "temsa_maraton",
            brand: "Temsa",
            model: "Maraton 13 VIP",
            fullName: "Temsa Maraton 13 VIP (13.08m 2+1 Süit Otoyol Devi)",
            category: "seyahat",
            categoryName: "Yüksek Tavanlı Süper Lüks Seyahat",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (13.08 Metre Yüksek Tavan VIP)",
            lengthMeters: 13.08,
            turningRadius: "Geniş Dönüş Açısı (10.5m)",
            roadFit: "Şehirlerarası otoyollar, peronlar ve VIP turizm seferleri",
            icon: "🛣️",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 120,
            fuelTankCapacity: 562,
            fuelConsumptionRate: 27,
            acceleration: 1.38,
            braking: 1.36,
            engine: "DAF PACCAR MX-11 330 Euro 6 (10.8L - 449 HP / 330 kW - 2300 Nm)",
            transmission: "ZF TraXon 12 TX 2411 BO (12 İleri Otomatik + ZF Intarder 3)",
            doorType: "Pnömatik Çift Kilitli Lüks Yolcu Kapısı",
            features: "13.08m uzunluk ve 3.90m yükseklik gerçek fabrika verisi, 562L yakıt deposu, 449 HP / 2300 Nm DAF MX-11 motor, 41 koltuklu 2+1 düzen.",
            desc: "Temsa Adana fabrikası üretimi gerçek katalog verili Maraton 13 VIP. 562 litre yakıt deposu, 11 m³ bagaj ve 2300 Nm tork.",
            nvhLevel: 93,
            chassisRigidity: 93,
            suspensionComfort: 92,
            cabinAcousticType: "449 HP DAF MX-11 Homurtusu & Fısıltı Kabin",
            structureDetails: "3.90m yüksek tavanlı aerodinamik süper yapı, ZF bağımsız ön aks ve çok katmanlı motor yalıtımı.",
            tipBonusPercent: 36,
            soundProfile: {
                basePitch: 0.89,
                bassBoost: 6,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.70,
                retarderPitch: 0.98,
                character: "449 HP DAF PACCAR MX-11 tok otoyol rölantisi + ZF İntarder 3 ıslığı ve gür havalı korna"
            }
        }
    ],

    // =========================================================================
    // SAĞLAMLIKLARINA GÖRE OTOBÜS PARÇA GRUPLARI VE DİNAMİK KATALOĞU
    // =========================================================================
    PART_GROUPS: [
        {
            tier: 1,
            id: "hassas_dis_donanim",
            name: "1. Grup: Hassas ve Kırılgan Dış Donanım",
            shortName: "Hassas / Kırılgan Grup",
            durabilityMultiplier: 1.0,
            crackThreshold: 12,
            breakThreshold: 25,
            desc: "Camlar, farlar ve silecek motorları. En düşük darbe dayanımına sahiptir; sürtme ve taş/araç çarpmalarında ilk hasar alan gruptur.",
            parts: ["leftWindow", "rightWindow", "headlights", "wipers"]
        },
        {
            tier: 2,
            id: "orta_alt_takim_asinma",
            name: "2. Grup: Orta Dayanımlı Alt Takım & Aşınma Parçaları",
            shortName: "Orta Dayanımlı Alt Takım",
            durabilityMultiplier: 1.75,
            crackThreshold: 22,
            breakThreshold: 42,
            desc: "Egzoz/DPF, Pnömatik Süspansiyon Körükleri ve Havalı Disk Fren Balataları. Çukur, kasis ve uzun yokuş frenlemelerinde aşınır.",
            parts: ["exhaust", "suspension", "brakes"]
        },
        {
            tier: 3,
            id: "yuksek_govde_aktarma",
            name: "3. Grup: Yüksek Dayanımlı Gövde & Aktarma Organları",
            shortName: "Yüksek Dayanımlı Aktarma",
            durabilityMultiplier: 2.6,
            crackThreshold: 32,
            breakThreshold: 58,
            desc: "Ön Çelik Tampon/Travers ve Otomatik Şanzıman/Retarder. Güçlendirilmiş çelik yapıdadır; yalnızca orta-ağır kazalarda veya aşırı zorlamada hasar alır.",
            parts: ["front", "transmission"]
        },
        {
            tier: 4,
            id: "ultra_saglam_ana_omurga",
            name: "4. Grup: Ultra Sağlam Ana Omurga ve Motor Bloğu",
            shortName: "Ultra Sağlam / Zırhlı Omurga",
            durabilityMultiplier: 4.0,
            crackThreshold: 45,
            breakThreshold: 80,
            desc: "Dizel Motor Bloğu ve Kataforez Çelik Ana Şasi/Dingiller. En yüksek sağlamlık grubudur; küçük kazalardan etkilenmez, yalnızca ağır çarpışma veya aşırı hararette (>110°C) yıpranır.",
            parts: ["engine", "chassis"]
        }
    ],

    PART_CATALOG: {
        leftWindow: { id: "leftWindow", name: "Sol Yan Akustik Camlar", groupTier: 1, groupName: "1. Grup (Hassas Dış Donanım)", repairCostPerPoint: 10, dynamicEffect: "Kırıldığında kabine rüzgar/trafik uğultusu dolar ve klima (AC) etkisi kaybolur." },
        rightWindow: { id: "rightWindow", name: "Sağ Yan & Kapı Camları", groupTier: 1, groupName: "1. Grup (Hassas Dış Donanım)", repairCostPerPoint: 10, dynamicEffect: "Kırıldığında kabin ses yalıtımı ve ısı dengesi bozulur." },
        headlights: { id: "headlights", name: "Ön Farlar ve LED Aydınlatma", groupTier: 1, groupName: "1. Grup (Hassas Dış Donanım)", repairCostPerPoint: 12, dynamicEffect: "Hasarlandığında gece ve tünel sürüşlerinde görüş düşer." },
        wipers: { id: "wipers", name: "Cam Silecek Mekanizması ve Motoru", groupTier: 1, groupName: "1. Grup (Hassas Dış Donanım)", repairCostPerPoint: 11, dynamicEffect: "Bozulduğunda yağmurlu ve karlı havada ön cam temizlenemez." },
        exhaust: { id: "exhaust", name: "Egzoz Borusu ve Euro 6 DPF/SCR Katalizörü", groupTier: 2, groupName: "2. Grup (Orta Dayanımlı Alt Takım)", repairCostPerPoint: 16, dynamicEffect: "Kasislere hızlı girildiğinde hasar alır; tıslama/sürtünme sesi yapar ve motor çekişini düşürür." },
        suspension: { id: "suspension", name: "Pnömatik Havalı Süspansiyon Körükleri (ECAS)", groupTier: 2, groupName: "2. Grup (Orta Dayanımlı Alt Takım)", repairCostPerPoint: 18, dynamicEffect: "Çukur ve kasislerde yıpranır; hasarlandıkça viraj savrulması artar ve yolcu konforu düşer." },
        brakes: { id: "brakes", name: "Pnömatik Disk Fren Balataları ve Körükleri", groupTier: 2, groupName: "2. Grup (Orta Dayanımlı Alt Takım)", repairCostPerPoint: 17, dynamicEffect: "Dik inişlerde retardersiz frende aşınır; fren mesafesi uzar ve hava basıncı daha hızlı düşer." },
        front: { id: "front", name: "Ön Çelik Tampon, Travers ve Kaporta", groupTier: 3, groupName: "3. Grup (Yüksek Dayanımlı Gövde & Aktarma)", repairCostPerPoint: 22, dynamicEffect: "Önden darbeleri sönümleyerek radyatör ve motor bloğunu korur." },
        transmission: { id: "transmission", name: "Şanzıman Dişli Kutusu ve Hidrolik Retarder", groupTier: 3, groupName: "3. Grup (Yüksek Dayanımlı Gövde & Aktarma)", repairCostPerPoint: 28, dynamicEffect: "Hasarlandığında vites geçişleri sarsıntılı olur ve retarder fren gücü zayıflar." },
        engine: { id: "engine", name: "Dizel Motor Bloğu, Turbo ve Radyatör", groupTier: 4, groupName: "4. Grup (Ultra Sağlam Ana Omurga)", repairCostPerPoint: 35, dynamicEffect: "Ağır darbe veya 110°C üstü hararette yıpranır; ivmelenme düşer ve yakıt tüketimi artar." },
        chassis: { id: "chassis", name: "Ana Çelik Şasi Kafesi ve Dingiller", groupTier: 4, groupName: "4. Grup (Ultra Sağlam Ana Omurga)", repairCostPerPoint: 40, dynamicEffect: "Aracın ana zırhıdır; ağır hasar alırsa direksiyon simetrisi bozulur ve araç şeritte gezer." }
    },

    /**
     * Her otobüsün gerçek fabrika boş ağırlığını (Ton) ve teknik sürüş dinamiklerini döndürür
     */
    getBusPhysicsSpecs: function(bus) {
        const b = bus || this.getSelectedBus();
        if (!b) return { emptyWeightTon: 12.0, emptyWeightKg: 12000, torqueNm: 1200, engineHP: 300, gearCount: 6 };

        // Gerçek fabrika katalog boş ağırlıkları (Tare Weight - Ton)
        const realWeightsTon = {
            "iveco_daily_minibus": 4.85,
            "isuzu_novo_lux": 6.45,
            "karsan_atak_8m": 7.60,
            "otokar_sultan_mega": 8.25,
            "bmc_neocity_10m": 9.80,
            "otokar_kent_lf": 11.75,
            "bmc_procity_12m": 11.90,
            "temsa_avenue_lf": 11.65,
            "mercedes_conecto_12m": 11.85,
            "mercedes_o403_rhd": 13.60,
            "temsa_safir_plus": 14.10,
            "neoplan_cityliner": 14.35,
            "man_lions_coach": 14.40,
            "mercedes_tourismo_16rhd": 14.50,
            "temsa_maraton_vip": 14.65,
            "mercedes_travego_16shd": 14.85,
            "setra_topclass_s516": 15.20,
            "scania_irizar_i8": 15.90,
            "mercedes_conecto_g": 17.35,
            "otokar_kent_articulated": 17.60
        };

        const emptyWeightTon = realWeightsTon[b.id] || (b.lengthMeters ? +(b.lengthMeters * 1.02).toFixed(2) : 12.0);
        const emptyWeightKg = Math.round(emptyWeightTon * 1000);

        // Motor metninden gerçek HP ve Nm değerlerini çıkar
        let engineHP = 300;
        let torqueNm = 1200;
        if (b.engine) {
            const hpMatch = b.engine.match(/(\d+)\s*HP/i);
            const nmMatch = b.engine.match(/(\d+)\s*Nm/i);
            if (hpMatch) engineHP = parseInt(hpMatch[1], 10);
            if (nmMatch) torqueNm = parseInt(nmMatch[1], 10);
        }

        // Şanzıman metninden gerçek vites sayısını çıkar (6, 8 veya 12 ileri)
        let gearCount = 6;
        if (b.transmission) {
            if (/12\s*İleri|TipMatic Coach 12|TraXon 12|Opticruise/i.test(b.transmission)) gearCount = 12;
            else if (/8\s*İleri|GO 250-8|8HP/i.test(b.transmission)) gearCount = 8;
            else gearCount = 6;
        }

        return {
            emptyWeightTon,
            emptyWeightKg,
            engineHP,
            torqueNm,
            gearCount
        };
    },

    // =========================================================================
    // ARKA PLAN SESSİZ AKILLI OTOBÜS KONTROL MİMARİSİ (SADECE KOD TABANINDA AKTİF)
    // Kullanıcıya herhangi bir bildirim/arayüz göstermeden her otobüsün eğim, yük,
    // vites geçiş devri, yakıt enjeksiyonu, denge ve parça korumasını otomatik yönetir.
    // =========================================================================
    ECU_CHIP_CATALOG: {
        "otokar_sultan_mega": { torqueCurve: 1.06, ecoEfficiency: 0.88, thermalShield: 0.82, stabilityFactor: 0.90, smartShiftRPM: 1950 },
        "otokar_kent_lf": { torqueCurve: 1.08, ecoEfficiency: 0.87, thermalShield: 0.80, stabilityFactor: 0.92, smartShiftRPM: 1900 },
        "bmc_neocity_10m": { torqueCurve: 1.07, ecoEfficiency: 0.88, thermalShield: 0.82, stabilityFactor: 0.91, smartShiftRPM: 1920 },
        "mercedes_conecto_12m": { torqueCurve: 1.10, ecoEfficiency: 0.85, thermalShield: 0.78, stabilityFactor: 0.94, smartShiftRPM: 1850 },
        "mercedes_conecto_g": { torqueCurve: 1.12, ecoEfficiency: 0.86, thermalShield: 0.76, stabilityFactor: 0.95, smartShiftRPM: 1880 },
        "mercedes_travego_16shd": { torqueCurve: 1.15, ecoEfficiency: 0.84, thermalShield: 0.74, stabilityFactor: 0.97, smartShiftRPM: 1800 },
        "mercedes_tourismo_16rhd": { torqueCurve: 1.13, ecoEfficiency: 0.84, thermalShield: 0.75, stabilityFactor: 0.96, smartShiftRPM: 1820 },
        "man_lions_coach": { torqueCurve: 1.15, ecoEfficiency: 0.84, thermalShield: 0.74, stabilityFactor: 0.96, smartShiftRPM: 1780 },
        "setra_topclass_s516": { torqueCurve: 1.18, ecoEfficiency: 0.83, thermalShield: 0.72, stabilityFactor: 0.98, smartShiftRPM: 1760 },
        "isuzu_novo_lux": { torqueCurve: 1.05, ecoEfficiency: 0.89, thermalShield: 0.84, stabilityFactor: 0.89, smartShiftRPM: 2000 },
        "mercedes_o403_rhd": { torqueCurve: 1.11, ecoEfficiency: 0.90, thermalShield: 0.80, stabilityFactor: 0.92, smartShiftRPM: 1980 },
        "temsa_safir_plus": { torqueCurve: 1.12, ecoEfficiency: 0.85, thermalShield: 0.77, stabilityFactor: 0.94, smartShiftRPM: 1840 },
        "scania_irizar_i8": { torqueCurve: 1.17, ecoEfficiency: 0.83, thermalShield: 0.73, stabilityFactor: 0.98, smartShiftRPM: 1750 },
        "neoplan_cityliner": { torqueCurve: 1.15, ecoEfficiency: 0.84, thermalShield: 0.75, stabilityFactor: 0.97, smartShiftRPM: 1800 },
        "iveco_daily_minibus": { torqueCurve: 1.08, ecoEfficiency: 0.86, thermalShield: 0.83, stabilityFactor: 0.89, smartShiftRPM: 1950 },
        "karsan_atak_8m": { torqueCurve: 1.06, ecoEfficiency: 0.88, thermalShield: 0.83, stabilityFactor: 0.90, smartShiftRPM: 1960 },
        "bmc_procity_12m": { torqueCurve: 1.08, ecoEfficiency: 0.87, thermalShield: 0.80, stabilityFactor: 0.92, smartShiftRPM: 1900 },
        "temsa_avenue_lf": { torqueCurve: 1.08, ecoEfficiency: 0.87, thermalShield: 0.80, stabilityFactor: 0.92, smartShiftRPM: 1900 },
        "otokar_kent_articulated": { torqueCurve: 1.12, ecoEfficiency: 0.86, thermalShield: 0.77, stabilityFactor: 0.94, smartShiftRPM: 1880 },
        "temsa_maraton_vip": { torqueCurve: 1.15, ecoEfficiency: 0.84, thermalShield: 0.75, stabilityFactor: 0.96, smartShiftRPM: 1800 }
    },

    /**
     * Arka planda sessiz çalışan akıllı otobüs kontrol parametrelerini hesaplar (Arayüz/Ses çıkarmaz)
     */
    getBusChip: function(bus, gameState) {
        const b = bus || this.getSelectedBus();
        if (!b) return null;
        const profile = this.ECU_CHIP_CATALOG[b.id] || {
            torqueCurve: 1.08,
            ecoEfficiency: 0.87,
            thermalShield: 0.80,
            stabilityFactor: 0.92,
            smartShiftRPM: 1900
        };

        const g = gameState || (typeof Game !== 'undefined' ? Game : null);
        const slope = (g && typeof g.currentSlopePct === 'number') ? g.currentSlopePct : 0;
        const speed = (g && typeof g.speed === 'number') ? g.speed : 0;
        const passCount = (g && typeof g.passengersOnBoard === 'number') ? g.passengersOnBoard : 0;
        const loadRatio = Math.min(1.0, passCount / Math.max(20, b.totalCapacity || 60));

        // Eğim ve yüke göre sessiz adaptif kalibrasyon:
        let dynamicTorque = profile.torqueCurve;
        let dynamicFuel = profile.ecoEfficiency;
        let dynamicWear = profile.thermalShield;
        let shiftUpRPM = profile.smartShiftRPM;

        if (slope > 1.8) {
            // Yokuş tırmanışı: Çekiş düşmesin diye otomatik tork takviyesi ve vitesi geç büyütme
            dynamicTorque *= Math.min(1.22, 1.0 + (slope * 0.032) + (loadRatio * 0.06));
            shiftUpRPM = Math.min(2380, profile.smartShiftRPM + Math.round(slope * 75));
        } else if (slope < -1.8) {
            // Yokuş inişi: Otomatik enjeksiyon kısma ve motor/fren koruma
            dynamicFuel *= 0.65;
            dynamicWear *= 0.75;
            shiftUpRPM = Math.max(1700, profile.smartShiftRPM - 100);
        } else if (speed > 40) {
            // Düz yolda sabit seyir: Otomatik erken vites ve düşük devir ekonomisi
            dynamicFuel *= 0.88;
            dynamicWear *= 0.82;
            shiftUpRPM = profile.smartShiftRPM;
        }

        const chipData = {
            installed: true,
            stabilityFactor: profile.stabilityFactor,
            shiftUpRPM: shiftUpRPM,
            activeMode: {
                torqueMultiplier: dynamicTorque,
                fuelMultiplier: dynamicFuel,
                wearMultiplier: dynamicWear,
                heatOffset: -1.5
            }
        };
        b.ecuChip = chipData;
        return chipData;
    },

    OWNED_KEY: 'tekulas_owned_buses_v1',

    getOwnedBusIds: function() {
        // Geliştirici Modu: Tüm 20 otobüs modeli ücretsiz ve garajda açık
        const allIds = this.buses.map(b => b.id);
        this.buses.forEach(b => {
            b.price = 0;
            b.requiredLevel = 1;
            this.getBusChip(b); // Tüm 20 otobüse fabrika ECU beyin çipini yerleştir
        });
        try {
            localStorage.setItem(this.OWNED_KEY, JSON.stringify(allIds));
        } catch(e) {}
        return allIds;
    },

    isBusOwned: function(busId) {
        return true;
    },

    buyBus: function(busId) {
        const bus = this.buses.find(b => b.id === busId);
        if (!bus) return false;

        const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive') || (typeof localStorage !== 'undefined' && localStorage.getItem('gamePlayMode') === 'free_drive');
        const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;

        // Serbest modda tüm otobüslerin seviye kilidi açıktır; kariyer modunda seviye şartı devam eder.
                // GARA VE FİLO SAHASI KAPASİTE KONTROLÜ
        const owned = this.getOwnedBusIds();
        let maxBusesAllowed = 5; // Seviye 1: 5 araç
        const compSys = (typeof CompanySystem !== 'undefined') ? CompanySystem : ((typeof window !== 'undefined' && window.CompanySystem) ? window.CompanySystem : null);
        if (compSys && typeof compSys.getInstitutionLevel === 'function') {
            const garageLevel = compSys.getInstitutionLevel('bus_garage');
            if (garageLevel === 1) maxBusesAllowed = 5;
            else if (garageLevel === 2) maxBusesAllowed = 15;
            else if (garageLevel >= 3) maxBusesAllowed = 999;
        }

        if (owned.length >= maxBusesAllowed) {
            const capMsg = `Garaj Kapasitesi Dolu! Mevcut Seviye Garaj Sahası en fazla ${maxBusesAllowed} otobüs barındırabilir (Şu an: ${owned.length} otobüs). Yeni araç satın almak için Şirket Menüsü -> Yasal Binalar sekmesinden Garaj ve Filo Sahası'nı büyütün!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(capMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`⛔ ${capMsg}`, "warning");
            return false;
        }

        if (!isFreeDrive && currentLevel < bus.requiredLevel) {
            const lockMsg = `Seviyeniz yetersiz! ${bus.fullName} satın almak için Seviye ${bus.requiredLevel} olmalısınız (Mevcut Seviyeniz: ${currentLevel || 1}).`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(lockMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(lockMsg, "warning");
            return false;
        }

        if (currentBudget < bus.price) {
            const needed = bus.price - currentBudget;
            const noMoneyMsg = `Yetersiz bakiye! ${bus.fullName} için ${bus.price.toLocaleString('tr-TR')} ₺ gerekiyor. Bakiyeniz: ${currentBudget.toLocaleString('tr-TR')} ₺. Kalan: ${needed.toLocaleString('tr-TR')} ₺.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(noMoneyMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`⚠️ Yetersiz Bakiye: Kalan ${needed.toLocaleString('tr-TR')} ₺`, "warning");
            return false;
        }

        // Parayı kes ve garaja ekle
        if (typeof Game !== 'undefined') {
            Game.playerBudget -= bus.price;
            Game.saveData();
            if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                const licenseTitle = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, licenseTitle);
            }
        }

        // Garaja ekle
        if (!owned.includes(busId)) {
            owned.push(busId);
            try { localStorage.setItem(this.OWNED_KEY, JSON.stringify(owned)); } catch(e) {}
        }

        // Yeni aracı seç
        this.selectBus(busId);

        if (typeof audio !== 'undefined' && audio.playSuccess) {
            try { audio.playSuccess(); } catch(e) {}
        }

        const buySuccessMsg = `Hayırlı olsun kaptan! ${bus.fullName} ${bus.price.toLocaleString('tr-TR')} ₺ karşılığında satın alındı ve garajınıza eklendi! Aktif aracınız olarak seçildi.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(buySuccessMsg);
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🎉 SATIN ALINDI: ${bus.fullName} (-${bus.price.toLocaleString('tr-TR')} ₺)`, "success");

        this.renderModal(this.currentTab || 'all');
        return true;
    },

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

        if (!this.isBusOwned(busId)) {
            return this.buyBus(busId);
        }

        const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive') || (typeof localStorage !== 'undefined' && localStorage.getItem('gamePlayMode') === 'free_drive');
        const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        if (!isFreeDrive && currentLevel < bus.requiredLevel) {
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

        const successMsg = `Aktif otobüs seçildi: ${bus.fullName}. ${bus.categoryName}. Kabin NVH sessizliği: yüzde ${bus.nvhLevel || 70}, Şasi mukavemeti: yüzde ${bus.chassisRigidity || 70}. Toplam ${bus.totalCapacity} yolcu kapasitesi.`;
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(successMsg);
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🚌 Seçildi: ${bus.fullName}`, "success");

        this.renderModal(this.currentTab || 'all');
        return true;
    },

    currentMode: 'garage',
    currentTab: 'all',

    openModal: function() {
        this.openGarageModal();
    },

    openGarageModal: function() {
        this.currentMode = 'garage';
        const modal = document.getElementById('bus-garage-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        const titleEl = document.getElementById('bus-garage-title');
        if (titleEl) titleEl.textContent = '🚌 Garajım (Mevcut Araçlarım)';
        const descEl = document.getElementById('bus-garage-desc');
        if (descEl) descEl.textContent = 'Satın aldığınız ve garajınızda bulunan otobüsleriniz. Seferlerinizde kullanmak istediğiniz aracı seçebilirsiniz.';

        this.setModeTabActive('garage');
        this.setTabActive('tab-fleet-all');
        this.renderModal('owned');

        const sel = this.getSelectedBus();
        const welcomeSpeech = "Garajım açıldı.";
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(welcomeSpeech);

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    openDealershipModal: function() {
        this.currentMode = 'dealership';
        const modal = document.getElementById('bus-garage-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive') || (typeof localStorage !== 'undefined' && localStorage.getItem('gamePlayMode') === 'free_drive');

        const titleEl = document.getElementById('bus-garage-title');
        if (titleEl) {
            titleEl.textContent = isFreeDrive
                ? '🛒 Otobüs Satın Al (Serbest Mod - Seviye Kilitsiz)'
                : '🛒 Yeni Otobüsler Satın Al (Showroom & Galeri)';
        }
        const descEl = document.getElementById('bus-garage-desc');
        if (descEl) {
            descEl.textContent = isFreeDrive
                ? "🛣️ Serbest Sürüş Modu: Tüm 20 otobüs modelinin seviye kilitleri açıktır! Yeterli bütçeniz olduğu sürece dilediğiniz lüks seyahat veya metropol otobüsünü satın alabilirsiniz."
                : "Türkiye'nin en seçkin 20 otobüs modeli. Seviyenizi yükselterek ve kazandığınız bütçeyle filonuzu genişletin.";
        }

        this.setModeTabActive('dealership');
        this.setTabActive('tab-fleet-all');
        this.renderModal('all');

        const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
        const welcomeSpeech = isFreeDrive
            ? `Serbest sürüş otobüs galerisi açıldı. Tüm otobüslerin seviye kilidi açıktır. Bütçeniz: ${currentBudget.toLocaleString('tr-TR')} TL. İstediğiniz aracı satın alabilirsiniz.`
            : `Otobüs satış galerisi ve showroom açıldı. Bütçeniz: ${currentBudget.toLocaleString('tr-TR')} TL. 20 otobüs modeli listeleniyor.`;
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

    setModeTabActive: function(activeMode) {
        const tabGarage = document.getElementById('tab-view-garage');
        const tabDealer = document.getElementById('tab-view-dealership');
        if (tabGarage && tabDealer) {
            if (activeMode === 'garage') {
                tabGarage.style.background = 'rgba(56,189,248,0.3)';
                tabGarage.style.borderColor = '#38bdf8';
                tabGarage.style.color = '#fff';

                tabDealer.style.background = 'rgba(255,255,255,0.08)';
                tabDealer.style.borderColor = 'rgba(255,255,255,0.2)';
                tabDealer.style.color = '#94a3b8';
            } else {
                tabDealer.style.background = 'rgba(249,115,22,0.35)';
                tabDealer.style.borderColor = '#f97316';
                tabDealer.style.color = '#fff';

                tabGarage.style.background = 'rgba(255,255,255,0.08)';
                tabGarage.style.borderColor = 'rgba(255,255,255,0.2)';
                tabGarage.style.color = '#94a3b8';
            }
        }
    },

    renderModal: function(filterCategory) {
        this.currentTab = filterCategory;
        const listEl = document.getElementById('garage-bus-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive') || (typeof localStorage !== 'undefined' && localStorage.getItem('gamePlayMode') === 'free_drive');
        const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
        const selectedId = this.getSelectedBusId();

        let filtered = this.buses;

        if (this.currentMode === 'garage') {
            filtered = filtered.filter(b => this.isBusOwned(b.id));
        }

        if (filterCategory === 'belediye') {
            filtered = filtered.filter(b => b.category === 'belediye');
        } else if (filterCategory === 'seyahat') {
            filtered = filtered.filter(b => b.category === 'seyahat');
        }

        // Serbest Sürüş Modu Galeri Bilgilendirme Rozeti
        if (isFreeDrive && this.currentMode === 'dealership') {
            const bannerLi = document.createElement('li');
            bannerLi.style.marginBottom = '14px';
            bannerLi.style.padding = '12px 16px';
            bannerLi.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(56, 189, 248, 0.15))';
            bannerLi.style.border = '1.5px solid #22c55e';
            bannerLi.style.borderRadius = '10px';
            bannerLi.style.boxShadow = '0 2px 10px rgba(34,197,94,0.15)';
            bannerLi.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">🔓</span>
                    <div>
                        <div style="color: #4ade80; font-weight: bold; font-size: 0.98rem;">Serbest Sürüş Modu: Seviye Kilitleri Kaldırıldı!</div>
                        <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 2px;">
                            Tüm 20 otobüs modelini seviye şartı olmadan inceleyebilir, bütçeniz karşılığında satın alarak serbest sürüşte hemen kullanabilirsiniz.
                        </div>
                    </div>
                </div>
            `;
            listEl.appendChild(bannerLi);
        }

        if (filtered.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.style.textAlign = 'center';
            emptyLi.style.padding = '32px 20px';
            emptyLi.style.background = 'rgba(15,23,42,0.6)';
            emptyLi.style.borderRadius = '12px';
            emptyLi.style.border = '1px dashed rgba(255,255,255,0.2)';
            emptyLi.innerHTML = `
                <div style="font-size: 2.2rem; margin-bottom: 8px;">🛒</div>
                <div style="color: #cbd5e1; font-size: 1.05rem; font-weight: bold; margin-bottom: 6px;">
                    Garajınızda bu filtreye uygun araç bulunmuyor.
                </div>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 16px;">
                    Yeni otobüs modellerini incelemek ve filonuzu büyütmek için Otobüs Galerisi'ni ziyaret edebilirsiniz.
                </p>
                <button id="btn-switch-to-dealership" class="menu-btn nav-item" style="display: inline-flex; width: auto; margin: 0 auto; padding: 10px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer;">
                    🛒 Showroom ve Galeriye Git
                </button>
            `;
            listEl.appendChild(emptyLi);
            const btnSw = emptyLi.querySelector('#btn-switch-to-dealership');
            if (btnSw) {
                btnSw.onclick = () => this.openDealershipModal();
            }
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
            return;
        }

        filtered.forEach(b => {
            const isUnlocked = isFreeDrive || (currentLevel >= b.requiredLevel);
            const isSelected = b.id === selectedId;
            const isOwned = this.isBusOwned(b.id);

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
            if (this.currentMode === 'garage') {
                if (isSelected) {
                    statusBadge = '<span style="background: #22c55e; color: #000; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">✅ AKTİF KULLANIMDA</span>';
                } else {
                    statusBadge = '<span style="background: rgba(34,197,94,0.25); color: #22c55e; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">▶️ BU ARACI SEÇ (Enter)</span>';
                }
            } else {
                if (isSelected) {
                    statusBadge = '<span style="background: #22c55e; color: #000; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">✅ GARAJINIZDA (SEÇİLİ)</span>';
                } else if (isOwned) {
                    statusBadge = '<span style="background: rgba(34,197,94,0.25); color: #22c55e; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">✅ GARAJINIZDA MEVCUT (SEÇ)</span>';
                } else if (isUnlocked) {
                    const canAfford = currentBudget >= (b.price || 0);
                    const needed = (b.price || 0) - currentBudget;
                    statusBadge = canAfford
                        ? `<span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">🛒 SATIN AL (${(b.price || 0).toLocaleString('tr-TR')} ₺)</span>`
                        : `<span style="background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">🔒 ${(b.price || 0).toLocaleString('tr-TR')} ₺ (Yetersiz Bakiye - Kalan: ${needed.toLocaleString('tr-TR')} ₺)</span>`;
                } else {
                    statusBadge = `<span style="background: rgba(239,68,68,0.2); color: #f87171; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">🔒 SEVİYE ${b.requiredLevel} GEREKLİ (${(b.price || 0).toLocaleString('tr-TR')} ₺)</span>`;
                }
            }

            const categoryBadge = b.category === 'belediye'
                ? '<span style="color: #38bdf8; font-size: 0.85rem; font-weight: bold;">🏙️ Belediye Otobüsü</span>'
                : '<span style="color: #facc15; font-size: 0.85rem; font-weight: bold;">🛣️ Şehirlerarası Seyahat</span>';

            const capacityInfo = b.standingCapacity > 0
                ? `${b.seatCapacity} Oturan + ${b.standingCapacity} Ayakta (Toplam ${b.totalCapacity} Yolcu)`
                : `${b.seatCapacity} Koltuklu (2+1 Rahat Seyahat)`;

            const physSpecs = this.getBusPhysicsSpecs(b);

            let ariaLabel = `${b.fullName}. ${b.categoryName}. Boş ağırlık: ${physSpecs.emptyWeightTon} ton. ${capacityInfo}. ${isOwned ? (isSelected ? 'Aktif kullanımda.' : 'Garajınızda mevcut, seçmek için Enter.') : 'Satın almak için Enter.'}`;
            btn.setAttribute('aria-label', ariaLabel);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div>
                        <span style="font-size: 1.15rem; font-weight: bold; color: ${isUnlocked || isOwned ? '#fff' : '#94a3b8'};">
                            ${b.icon} ${b.fullName}
                        </span>
                        <div style="margin-top: 2px;">${categoryBadge}</div>
                    </div>
                    <div>${statusBadge}</div>
                </div>
                <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 4px;">
                    👥 <strong>Kapasite:</strong> <span style="color: #38bdf8;">${capacityInfo}</span> | 
                    ⚖️ <strong>Boş Ağırlık:</strong> <span style="color: #fb923c;">${physSpecs.emptyWeightTon} Ton</span> |
                    ⚡ <strong>Maks Hız:</strong> ${b.maxSpeed} km/s | ⛽ <strong>Depo:</strong> <span style="color: #facc15;">${b.fuelTankCapacity || 500} L</span> (~ ${b.fuelConsumptionRate || 30} L/100km)
                </div>
                <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 4px;">
                    ⚙️ <strong>Motor & Vites (${physSpecs.gearCount} İleri):</strong> ${b.engine} | ${b.transmission}
                </div>
                <div style="font-size: 0.85rem; color: #38bdf8; font-style: italic; margin-bottom: 4px;">
                    🔊 <strong>Ses Profili:</strong> ${b.soundProfile ? b.soundProfile.character : ''}
                </div>
                <div style="font-size: 0.85rem; color: #a1a1aa; margin-bottom: 6px;">
                    💡 ${b.features}
                </div>
                <!-- Yapı & NVH Akustik Kalite Paneli -->
                <div style="background: rgba(15,23,42,0.85); border: 1px solid rgba(56,189,248,0.3); border-radius: 8px; padding: 8px 12px; margin-top: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: bold; margin-bottom: 3px;">
                        <span style="color: #38bdf8;">🔇 NVH Kabin Sessizliği: %${b.nvhLevel || 70} (${b.cabinAcousticType || 'Standart'})</span>
                        <span style="color: #22c55e;">💰 Bahşiş Bonusu: +%${b.tipBonusPercent || 0}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 3px;">
                        🛡️ <strong>Şasi Mukavemeti:</strong> %${b.chassisRigidity || 70} | 🎈 <strong>Körük Konforu:</strong> %${b.suspensionComfort || 70}
                    </div>
                    <div style="font-size: 0.78rem; color: #4ade80; font-weight: bold;">
                        ✅ Kondisyon: %100 Mükemmel | ⛽ Depo: Dolu | 🔧 Bakım: Yapıldı
                    </div>
                </div>
            `;

            btn.onclick = () => {
                if (isOwned) {
                    this.selectBus(b.id);
                    this.renderModal(this.currentTab);
                } else if (isUnlocked) {
                    const bought = this.buyBus(b.id);
                    if (bought) {
                        this.renderModal(this.currentTab);
                    }
                } else {
                    const lockMsg = `Bu araç henüz kilitli. ${b.fullName} satın alabilmek için Seviye ${b.requiredLevel} olmalısınız.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(lockMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(lockMsg, "warning");
                }
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        // Garajım modunda alt kısma galeri tanıtım kartı ekle
        if (this.currentMode === 'garage') {
            const promoLi = document.createElement('li');
            promoLi.style.marginTop = '16px';
            promoLi.style.padding = '14px 18px';
            promoLi.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(234, 179, 8, 0.12))';
            promoLi.style.border = '1.5px solid rgba(249, 115, 22, 0.4)';
            promoLi.style.borderRadius = '10px';
            promoLi.style.display = 'flex';
            promoLi.style.alignItems = 'center';
            promoLi.style.justifyContent = 'space-between';
            promoLi.style.flexWrap = 'wrap';
            promoLi.style.gap = '10px';
            promoLi.innerHTML = `
                <div>
                    <div style="color: #fed7aa; font-weight: bold; font-size: 1rem;">🛒 Filonuzu Büyütmek İster Misiniz?</div>
                    <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 2px;">20 farklı otobüs modelini showroom galerisinde inceleyin ve satın alın.</div>
                </div>
                <button id="btn-garage-go-showroom" class="modern-btn nav-item" style="padding: 8px 18px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer;">
                    🛒 Showroom'a Git
                </button>
            `;
            listEl.appendChild(promoLi);
            const btnPromo = promoLi.querySelector('#btn-garage-go-showroom');
            if (btnPromo) {
                btnPromo.onclick = () => this.openDealershipModal();
            }
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    init: function() {
        const btnOpenGarage = document.getElementById('btn-open-garage-fleet');
        if (btnOpenGarage) {
            btnOpenGarage.addEventListener('click', () => this.openGarageModal());
        }

        const btnOpenDealer = document.getElementById('btn-open-dealership');
        if (btnOpenDealer) {
            btnOpenDealer.addEventListener('click', () => this.openDealershipModal());
        }

        const btnRouteGarage = document.getElementById('btn-route-open-garage');
        if (btnRouteGarage) {
            btnRouteGarage.addEventListener('click', () => {
                const isFreeDrive = (typeof Game !== 'undefined' && Game.playMode === 'free_drive') || (typeof localStorage !== 'undefined' && localStorage.getItem('gamePlayMode') === 'free_drive');
                if (isFreeDrive) {
                    this.openDealershipModal();
                } else {
                    this.openGarageModal();
                }
            });
        }

        const btnClose = document.getElementById('btn-garage-modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        // Mod Değiştirici Sekmeler
        const tabViewGarage = document.getElementById('tab-view-garage');
        if (tabViewGarage) {
            tabViewGarage.addEventListener('click', () => this.openGarageModal());
        }

        const tabViewDealer = document.getElementById('tab-view-dealership');
        if (tabViewDealer) {
            tabViewDealer.addEventListener('click', () => this.openDealershipModal());
        }

        // Kategori Sekmeleri
        const tabAll = document.getElementById('tab-fleet-all');
        const tabCity = document.getElementById('tab-fleet-city');
        const tabIntercity = document.getElementById('tab-fleet-intercity');

        if (tabAll) tabAll.addEventListener('click', () => {
            this.setTabActive('tab-fleet-all');
            this.renderModal(this.currentMode === 'garage' ? 'owned' : 'all');
        });
        if (tabCity) tabCity.addEventListener('click', () => {
            this.setTabActive('tab-fleet-city');
            this.renderModal('belediye');
        });
        if (tabIntercity) tabIntercity.addEventListener('click', () => {
            this.setTabActive('tab-fleet-intercity');
            this.renderModal('seyahat');
        });

        this.buses.forEach(b => this.getBusChip(b));

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BusFleet;
}

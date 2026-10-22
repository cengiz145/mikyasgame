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
            model: "Sultan Mega 8.5M",
            fullName: "Otokar Sultan Mega (8.5 Metre Midibüs)",
            category: "belediye",
            categoryName: "Küçük Sınıf Çevik Midibüs",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Midibüs Sınıfı)",
            lengthMeters: 8.5,
            turningRadius: "Çok Dar (Son Derece Çevik)",
            roadFit: "Dar mahalle sokakları, köy yolları ve sahil ringleri için ideal",
            icon: "🚐",
            requiredLevel: 1,
            price: 0,
            seatCapacity: 29,
            standingCapacity: 15,
            totalCapacity: 44,
            maxSpeed: 95,
            fuelTankCapacity: 160,
            fuelConsumptionRate: 23,
            acceleration: 1.15,
            braking: 1.1,
            engine: "Cummins ISB 4.5L Euro 6 (210 HP - 850 Nm)",
            transmission: "Allison 6 İleri Tam Otomatik",
            doorType: "Çift Pnömatik Servis Kapısı",
            features: "Kompakt gövde, dar sokaklarda mükemmel kıvraklık, düşük yakıt sarfiyatı, sessiz kabin.",
            desc: "Türkiye'nin en popüler küçük sınıf midibüsü. Dar mahalle aralarında ve sahil ringlerinde benzersiz manevra üstünlüğü sunar.",
            nvhLevel: 72,
            chassisRigidity: 75,
            suspensionComfort: 72,
            cabinAcousticType: "Kompakt Midibüs & Yumuşak Dizel",
            structureDetails: "8.5 metre çevik gövde. Dar sokak manevralarında kaldırıma sürtme riski minimumdur.",
            tipBonusPercent: 12,
            soundProfile: {
                basePitch: 1.08,
                bassBoost: 3,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.85,
                character: "210 HP Cummins 4.5L yumuşak midibüs rölantisi ve seri hızlanma sesi"
            }
        },

        // --- BELEDİYE OTOBÜSLERİ (SEVİYE 1 - 10 ARASI ŞEHİR İÇİ) ---
        {
            id: "otokar_kent_lf",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo)",
            lengthMeters: 12,
            turningRadius: "Standart Şehir İçi",
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
            seatCapacity: 32,
            standingCapacity: 75,
            totalCapacity: 107,
            maxSpeed: 85,
            fuelTankCapacity: 300,
            fuelConsumptionRate: 32,
            acceleration: 1.0,
            braking: 1.0,
            engine: "Cummins ISB 6.7L Euro 6 (280 HP)",
            transmission: "ZF EcoLife 6 İleri Otomatik",
            doorType: "3 Çift Kanatlı Alçak Taban Kapı",
            features: "Alçak taban, engelli rampası, Kentkart validatörü, şehir içi çevik manevra.",
            desc: "TEKULAŞ şehir içi hatlarında standart hizmet veren alçak tabanlı yerli solo otobüs.",
            nvhLevel: 62,
            chassisRigidity: 68,
            suspensionComfort: 65,
            cabinAcousticType: "Temel Şehir İçi (Mekanik & Çevik)",
            structureDetails: "Alçak tabanlı çelik kafes gövde. Şehir içi çevik manevra, motor mekanik ve kompresör sesleri kabinde doğrudan hissedilir.",
            tipBonusPercent: 0,
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
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Kompakt Mahalle Tipi)",
            lengthMeters: 9.5,
            turningRadius: "Dar (Kıvrak Manevra)",
            roadFit: "Yoğun mahalle caddeleri ve üniversite kampüs ringleri",
            soundGroup: "city_cummins",
            brand: "BMC",
            model: "Neocity 10M",
            fullName: "BMC Neocity (10 Metre Mahalle)",
            category: "belediye",
            categoryName: "Mahalle ve Dar Sokak Otobüsü",
            icon: "🚐",
            requiredLevel: 3,
            price: 140000,
            seatCapacity: 26,
            standingCapacity: 50,
            totalCapacity: 76,
            maxSpeed: 80,
            fuelTankCapacity: 240,
            fuelConsumptionRate: 27,
            acceleration: 1.15,
            braking: 1.05,
            engine: "Cummins 4.5L Euro 6 (210 HP)",
            transmission: "Allison Otomatik",
            doorType: "2 Kapılı Kompakt Giriş",
            features: "Dar mahalle sokaklarında üstün dönüş çapı, atik tork, yokuş kalkış desteği.",
            desc: "Süleymanpaşa'nın dar sokakları ve tepe mahalle hatları için çevik kompakt otobüs.",
            nvhLevel: 60,
            chassisRigidity: 65,
            suspensionComfort: 62,
            cabinAcousticType: "Kompakt Şehir İçi (Atik Tork)",
            structureDetails: "Kompakt şasi, dar mahalle sokaklarına uygun manevra kabiliyeti. Yüksek devirli Cummins motor sesi kabinde canlıdır.",
            tipBonusPercent: 0,
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
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo)",
            lengthMeters: 12,
            turningRadius: "Standart Şehir İçi",
            roadFit: "Şehir içi ana arterler ve ilçe bağlantı karayolları",
            soundGroup: "conecto_solo",
            brand: "Mercedes-Benz",
            model: "Conecto 12M",
            fullName: "Mercedes-Benz Conecto (12 Metre)",
            category: "belediye",
            categoryName: "Şehir İçi Konfor Solo",
            icon: "🚌",
            requiredLevel: 6,
            price: 380000,
            seatCapacity: 30,
            standingCapacity: 80,
            totalCapacity: 110,
            maxSpeed: 90,
            fuelTankCapacity: 300,
            fuelConsumptionRate: 31,
            acceleration: 1.1,
            braking: 1.15,
            engine: "OM 936 Euro 6 (299 HP)",
            transmission: "Voith DIWA 6 Otomatik",
            doorType: "3 Kapılı Geniş İniş-Biniş",
            features: "Alman bağımsız ön aks süspansiyonu, sessiz kabin, yüksek klima verimi.",
            desc: "Yolcularına yüksek konfor sunan, dayanıklı ve güçlü standart şehir içi belediye otobüsü.",
            nvhLevel: 78,
            chassisRigidity: 80,
            suspensionComfort: 76,
            cabinAcousticType: "Gelişmiş Şehir İçi (Tok OM 936)",
            structureDetails: "Alman bağımsız ön aks, titreşimi sönümleyen motor takozları. Tok ve pürüzsüz OM 936 sesi.",
            tipBonusPercent: 10,
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
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (18 Metre Körüklü Dev)",
            lengthMeters: 18,
            turningRadius: "Geniş Dönüş Açısı (Ağır Vasıta)",
            roadFit: "Organize sanayi vardiya koridorları ve geniş metropol bulvarları",
            soundGroup: "articulated",
            brand: "Mercedes-Benz",
            model: "Conecto G 18M",
            fullName: "Mercedes-Benz Conecto G (18 Metre Körüklü)",
            category: "belediye",
            categoryName: "Körüklü Üniversite & Metrobüs",
            icon: "🚎",
            requiredLevel: 8,
            price: 1150000,
            seatCapacity: 45,
            standingCapacity: 115,
            totalCapacity: 160,
            maxSpeed: 85,
            fuelTankCapacity: 420,
            fuelConsumptionRate: 43,
            acceleration: 0.95,
            braking: 1.25,
            engine: "OM 470 Euro 6 (360 HP)",
            transmission: "ZF EcoLife 6 İleri Otomatik",
            doorType: "4 Geniş Kapılı Hızlı Tahliye",
            features: "18 metre uzunluk, elektronik körük açısı stabilizasyonu, 160 dev yolcu kapasitesi.",
            desc: "Namık Kemal Üniversitesi ve sanayi aksında yoğun yolcu trafiğini taşıyan dev körüklü kaptan aracı.",
            nvhLevel: 75,
            chassisRigidity: 82,
            suspensionComfort: 78,
            cabinAcousticType: "Derin Sub-Bass & Körük Akustiği",
            structureDetails: "18 metre mafsallı körüklü gövde. Derin bas rölantisi ve hava tahliyesi kabine dengeli yayılır.",
            tipBonusPercent: 12,
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
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (Şehirlerarası Seyahat Devi)",
            lengthMeters: 13.5,
            turningRadius: "Geniş Dönüş Açısı",
            roadFit: "Şehirlerarası otoyollar ve ekspres peron seferleri",
            soundGroup: "pure_v6",
            brand: "Mercedes-Benz",
            model: "Travego 16 SHD",
            fullName: "Mercedes-Benz Travego 16 SHD (2+1 Rahat)",
            category: "seyahat",
            categoryName: "Şehirlerarası Lüks Seyahat",
            icon: "🛣️",
            requiredLevel: 11,
            price: 2250000,
            seatCapacity: 46,
            standingCapacity: 0,
            totalCapacity: 46,
            maxSpeed: 110,
            fuelTankCapacity: 540,
            fuelConsumptionRate: 28,
            acceleration: 1.25,
            braking: 1.3,
            engine: "OM 470 BlueTec Euro 6 (428 HP)",
            transmission: "Mercedes PowerShift 8 İleri Otomatik",
            doorType: "Pnömatik Tekli Piston Ön & Orta Kapı",
            features: "2+1 geniş deri rahat koltuklar, hidrolik Voith Retarder, hostes kabini, ikram ünitesi, geniş alt bagaj.",
            desc: "Türkiye otoyollarının amiral gemisi. Şehirlerarası Türkiye Turnesi için 428 beygirlik lüks seyahat ikonu.",
            nvhLevel: 95,
            chassisRigidity: 94,
            suspensionComfort: 93,
            cabinAcousticType: "Kadife V6 Rölantisi & Fısıltı Kabin",
            structureDetails: "Akustik çift camlar, çok katmanlı motor yangın/ses duvarı. Motor sesi arka planda kadife bir nefes gibi kalır.",
            tipBonusPercent: 40,
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
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (Şehirlerarası Seyahat Devi)",
            lengthMeters: 13.5,
            turningRadius: "Geniş Dönüş Açısı",
            roadFit: "Şehirlerarası otoyollar ve yüksek yolcu kapasiteli hatlar",
            soundGroup: "coach_terminal",
            brand: "Mercedes-Benz",
            model: "Tourismo 16 RHD",
            fullName: "Mercedes-Benz Tourismo 16 RHD",
            category: "seyahat",
            categoryName: "Klasik Şehirlerarası Yolcu",
            icon: "🛣️",
            requiredLevel: 13,
            price: 2800000,
            seatCapacity: 54,
            standingCapacity: 0,
            totalCapacity: 54,
            maxSpeed: 105,
            fuelTankCapacity: 500,
            fuelConsumptionRate: 27,
            acceleration: 1.2,
            braking: 1.2,
            engine: "OM 936 Euro 6 (354 HP)",
            transmission: "PowerShift 8 İleri Otomatik",
            doorType: "Pnömatik Yolcu Kapısı",
            features: "54 koltuk kapasitesi, düşük yakıt tüketimi, yüksek filo dayanıklılığı, güvenli otoyol sürüşü.",
            desc: "Otogarların en çok tercih edilen, yüksek kapasiteli ve güvenilir uzun yol yolcu otobüsü.",
            nvhLevel: 85,
            chassisRigidity: 88,
            suspensionComfort: 84,
            cabinAcousticType: "Dengeli Uzun Yol (Sessiz Seyir)",
            structureDetails: "Otogarların vazgeçilmezi. Dengeli kabin yalıtımı ve düşük rüzgar dirençli aerodinamik burun.",
            tipBonusPercent: 20,
            soundProfile: {
                basePitch: 0.95,
                bassBoost: 4,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.80,
                retarderPitch: 0.95,
                engineSample: "coach_terminal_idle",
                character: "Orijinal Otogar Peron Rölantisi + Hava Tahliyesi ve Dengeli Uzun Yol Dizeli"
            }
        },
        {
            id: "man_lions_coach",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (470 HP Rampa Canavarı)",
            lengthMeters: 13.5,
            turningRadius: "Geniş Dönüş Açısı",
            roadFit: "Otoyollar ve dik dağ geçitleri",
            soundGroup: "man_d26",
            brand: "MAN",
            model: "Lion's Coach",
            fullName: "MAN Lion's Coach (470 HP)",
            category: "seyahat",
            categoryName: "Yüksek Güçlü Uzun Yol",
            icon: "🦁",
            requiredLevel: 15,
            price: 3850000,
            seatCapacity: 50,
            standingCapacity: 0,
            totalCapacity: 50,
            maxSpeed: 110,
            fuelTankCapacity: 520,
            fuelConsumptionRate: 28,
            acceleration: 1.35,
            braking: 1.35,
            engine: "MAN D2676 Euro 6 (470 HP - 2400 Nm)",
            transmission: "MAN TipMatic 12 İleri + Intarder",
            doorType: "Pnömatik Kapı",
            features: "Karakteristik güçlü MAN motor sesi, 2400 Nm devasa tork, MAN Intarder fren sistemi, rüzgar stabilitesi.",
            desc: "Rampaları düz yol gibi tırmanan, yüksek torklu ve karizmatik Alman şehirlerarası yol canavarı.",
            nvhLevel: 91,
            chassisRigidity: 92,
            suspensionComfort: 90,
            cabinAcousticType: "470 HP Karizmatik Homurtu & MAN Intarder",
            structureDetails: "2400 Nm devasa tork, virajda esnemeyen rijit kafes şasi. Rampa tırmanışında fısıltı sessizliğinde kabin.",
            tipBonusPercent: 35,
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
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (14 Metre Çift Dingil VIP Devi)",
            lengthMeters: 14,
            turningRadius: "Çift Dingil Geniş Açılı",
            roadFit: "Uzun yol otoyolları ve kıtalararası prestij hatları",
            soundGroup: "pure_v6",
            brand: "Setra",
            model: "S 516 HDH TopClass",
            fullName: "Setra S 516 HDH TopClass (Çift Dingil VIP)",
            category: "seyahat",
            categoryName: "Ultra VIP Premium Seyahat",
            icon: "👑",
            requiredLevel: 18,
            price: 5800000,
            seatCapacity: 42,
            standingCapacity: 0,
            totalCapacity: 42,
            maxSpeed: 115,
            fuelTankCapacity: 600,
            fuelConsumptionRate: 33,
            acceleration: 1.4,
            braking: 1.45,
            engine: "OM 471 Euro 6 (510 HP - Çift Arka Dingil)",
            transmission: "PowerShift 8 İleri Otomatik",
            doorType: "Elektro-Pnömatik Akıllı Kapı",
            features: "Çift dingil üstün yol tutuşu, panoramik cam tavan, fısıltı sessizliğinde kabin, ultra VIP 2+1 koltuklar.",
            desc: "Daimler Buses zirvesi. 510 beygirlik çift dingilli ultra lüks VIP seyahat otobüsü.",
            nvhLevel: 98,
            chassisRigidity: 98,
            suspensionComfort: 98,
            cabinAcousticType: "Daimler Buses Zirvesi: Fısıltı Kabin & Uçan Halı",
            structureDetails: "510 HP çift dingil, akustik çift lamine camlar. Derz ve çukurları hissettirmeyen uçan halı süspansiyon. Motor sesi sadece derin, tok bir nefes gibi duyulur.",
            tipBonusPercent: 50,
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
            id: "isuzu_novo_lux",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Midibüs Sınıfı)",
            lengthMeters: 7.5,
            turningRadius: "Çok Dar (Son Derece Çevik)",
            roadFit: "Dar mahalle sokakları ve kırsal köy hatları için ideal",
            soundGroup: "midibus",
            brand: "Isuzu",
            model: "Novo Lux",
            fullName: "Isuzu Novo Lux (İlçe & Kasaba)",
            category: "sehirici",
            categoryName: "İlçe ve Kasaba Hattı",
            icon: "🚐",
            requiredLevel: 2,
            price: 95000,
            seatCapacity: 29,
            standingCapacity: 12,
            totalCapacity: 41,
            maxSpeed: 95,
            fuelTankCapacity: 140,
            fuelConsumptionRate: 21,
            acceleration: 1.3,
            braking: 1.2,
            engine: "Isuzu 4HK1E6C-E (190 HP)",
            transmission: "Isuzu 6 İleri Manuel",
            doorType: "Dışa Açılır Pnömatik Kapı",
            features: "Dar köy yollarında ve dik yokuşlarda yüksek manevra kabiliyeti, çevik ilçe aracı.",
            desc: "Tekirdağ'ın mahalle ve köylerinde en çok kullanılan çevik ve güvenilir midibüs.",
            nvhLevel: 66,
            chassisRigidity: 70,
            suspensionComfort: 68,
            cabinAcousticType: "Dayanıklı Kırsal (Turbo Dizel)",
            structureDetails: "Rampa ve dar dağ yollarına dayanıklı sağlam şasi. 190 HP turbo ıslığı kabinde belirgindir.",
            tipBonusPercent: 5,
            soundProfile: {
                basePitch: 1.15,
                bassBoost: 2,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.90,
                retarderPitch: 1.0,
                character: "190 HP turbo dizel ıslığı + çevik şehir içi korna"
            }
        },
        {
            id: "mercedes_o403_rhd",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Klasik Standart Kasa)",
            lengthMeters: 12,
            turningRadius: "Standart Karayolu",
            roadFit: "İlçeler arası karayolları ve nostaljik ekspres hatlar",
            soundGroup: "v8_bass",
            brand: "Mercedes-Benz",
            model: "O 403 RHD",
            fullName: "Mercedes-Benz O 403 RHD (Yolların Efsanesi)",
            category: "seyahat",
            categoryName: "Efsane Klasik Şehirlerarası",
            icon: "👑",
            requiredLevel: 8,
            price: 850000,
            seatCapacity: 46,
            standingCapacity: 0,
            totalCapacity: 46,
            maxSpeed: 120,
            fuelTankCapacity: 480,
            fuelConsumptionRate: 30,
            acceleration: 1.3,
            braking: 1.25,
            engine: "OM 442 LA V8 Turbo Intercooler (381 HP)",
            transmission: "ZF 6S-1600 Manuel / Otomatik",
            doorType: "Klasik Pistonlu Çift Kapı",
            features: "90'lar ve 2000'lerin efsanevi V8 motoru, meşhur ıslık çalan Voith retarder, tok egzoz gürlemesi ve çift borulu havalı korna.",
            desc: "Türkiye otoyol tarihinin en unutulmaz otobüsü. Saf mekanik güç, efsanevi V8 kükremesi ve eşsiz retarder sesi.",
            nvhLevel: 84,
            chassisRigidity: 86,
            suspensionComfort: 82,
            cabinAcousticType: "Efsanevi V8 Kükremesi & Islık Retarder",
            structureDetails: "Otoyolların 90'lar efsanesi. 381 HP V8 motorun tok mekanik kükremesi ve meşhur türbin ıslığı.",
            tipBonusPercent: 25,
            soundProfile: {
                basePitch: 0.85,
                bassBoost: 8,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.85,
                retarderPitch: 1.15,
                engineSample: "bassrolanti",
                character: "381 HP V8 mekanik kükreme + meşhur ıslık retarder ve çift borulu havalı korna"
            }
        },
        {
            id: "temsa_safir_plus",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (2+1 VIP Seyahat Devi)",
            lengthMeters: 13,
            turningRadius: "Geniş Dönüş Açısı",
            roadFit: "Şehirlerarası otoyollar ve VIP seyahat hatları",
            soundGroup: "daf_paccar",
            brand: "Temsa",
            model: "Safir Plus",
            fullName: "Temsa Safir Plus (2+1 VIP)",
            category: "seyahat",
            categoryName: "Şehirlerarası Uzun Yol",
            icon: "💎",
            requiredLevel: 14,
            price: 3200000,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 110,
            fuelTankCapacity: 500,
            fuelConsumptionRate: 27,
            acceleration: 1.35,
            braking: 1.3,
            engine: "DAF PACCAR MX-11 Euro 6 (450 HP)",
            transmission: "ZF TraXon 12 İleri Otomatik",
            doorType: "Pnömatik Tekli Ön & Orta Kapı",
            features: "Geniş bagaj hacmi, yerli mühendislik, ZF İntarder 3, 2+1 VIP koltuk dizilimi.",
            desc: "Türkiye şehirlerarası hatlarında binlerce kilometre yol yapan yerli uzun yol devi.",
            nvhLevel: 86,
            chassisRigidity: 87,
            suspensionComfort: 85,
            cabinAcousticType: "DAF PACCAR Homurtusu & ZF İntarder",
            structureDetails: "Geniş bagaj yapısı ve 450 HP DAF PACCAR gücü. Kabinde tok rölanti ve güçlü intarder freni.",
            tipBonusPercent: 22,
            soundProfile: {
                basePitch: 0.88,
                bassBoost: 6,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.70,
                retarderPitch: 0.95,
                engineSample: "daf_paccar",
                character: "450 HP DAF PACCAR MX-11 homurtusu + ZF İntarder ıslığı ve havalı korna"
            }
        },
        {
            id: "scania_irizar_i8",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (14 Metre Çift Dingil Peron Kralı)",
            lengthMeters: 14,
            turningRadius: "Çift Dingil Geniş Açılı",
            roadFit: "Şehirlerarası otoyollar ve büyük otogar peronları",
            soundGroup: "scania_dc13",
            brand: "Scania",
            model: "Irizar i8 VIP",
            fullName: "Scania Irizar i8 VIP (Otogar Peron Kralı)",
            category: "seyahat",
            categoryName: "VIP Lüks Seyahat Devi",
            icon: "👑",
            requiredLevel: 18,
            price: 5200000,
            seatCapacity: 44,
            standingCapacity: 0,
            totalCapacity: 44,
            maxSpeed: 120,
            fuelTankCapacity: 650,
            fuelConsumptionRate: 34,
            acceleration: 1.45,
            braking: 1.4,
            engine: "Scania DC13 Euro 6 (490 HP)",
            transmission: "Opticruise 12 İleri Otomatik",
            doorType: "Pnömatik Çift Kilitli Yolcu Kapısı",
            features: "490 HP İsveç Scania motoru, Irizar aerodinamik lüks gövde, 2+1 VIP konfor, otogar peron hava tahliyesi.",
            desc: "Türkiye otogarlarının ve ekspres hatlarının lüks simgesi. Perondan kalkarken hava tahliyesi ve tok dizel rölantisiyle fark yaratır.",
            nvhLevel: 94,
            chassisRigidity: 93,
            suspensionComfort: 92,
            cabinAcousticType: "Scania DC13 Tok Dizel & Kusursuz İzolasyon",
            structureDetails: "Lüks Irizar karoseri, fütüristik iç mekan yalıtımı. Otoyol rüzgarını neredeyse sıfıra indiren aerodinamik.",
            tipBonusPercent: 38,
            soundProfile: {
                basePitch: 0.98,
                bassBoost: 5,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.70,
                retarderPitch: 1.0,
                engineSample: "scania_dc13",
                character: "490 HP Scania DC13 derin torklu İsveç rölantisi + Otogar peron hava tahliyesi ve gür havalı korna"
            }
        },
        {
            id: "neoplan_cityliner",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (Fütüristik Lüks Seyahat Devi)",
            lengthMeters: 13,
            turningRadius: "Geniş Dönüş Açısı",
            roadFit: "Şehirlerarası otoyollar ve prestijli turizm turları",
            soundGroup: "man_d26",
            brand: "Neoplan",
            model: "Cityliner",
            fullName: "Neoplan Cityliner (Fütüristik Lüks)",
            category: "seyahat",
            categoryName: "Efsane Fütüristik Filo Lideri",
            icon: "🚀",
            requiredLevel: 20,
            price: 6500000,
            seatCapacity: 48,
            standingCapacity: 0,
            totalCapacity: 48,
            maxSpeed: 115,
            fuelTankCapacity: 620,
            fuelConsumptionRate: 32,
            acceleration: 1.4,
            braking: 1.4,
            engine: "MAN Euro 6 (460 HP)",
            transmission: "TipMatic 12 İleri Otomatik",
            doorType: "Pnömatik Çift Emniyetli Kapı",
            features: "Bölünmüş fütüristik ön cam, aerodinamik tasarım, iç ambiyans aydınlatma, üst düzey prestij.",
            desc: "Otobüs tasarımında bir sanat eseri. Seviye 20 efsane kaptanların sürdüğü filo lideri.",
            nvhLevel: 96,
            chassisRigidity: 95,
            suspensionComfort: 94,
            cabinAcousticType: "Fütüristik Sessizlik & Pürüzsüz Seyir",
            structureDetails: "Panoramik akustik çift camlar, yol sesini emen özel zemin izolasyonu. Kabinde fısıltıyla konuşma konforu.",
            tipBonusPercent: 45,
            soundProfile: {
                basePitch: 0.91,
                bassBoost: 5,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.65,
                retarderPitch: 1.05,
                character: "460 HP aerodinamik rüzgar izolasyonu + TipMatic otomatik vites tahliyesi"
            }
        },
        // --- YENİ EKLENEN OTOBÜSLER (FİLO GENİŞLEMESİ 6 MODEL) ---
        // 1. SEVİYE: KÜÇÜK OTOBÜSLER (MİDİBÜS & DOLMUŞ)
        {
            id: "iveco_daily_minibus",
            soundGroup: "iveco_daily",
            brand: "Iveco",
            model: "Daily M2000 (19+1)",
            fullName: "Iveco Daily M2000 (19+1 Mahalle & Dolmuş)",
            category: "belediye",
            categoryName: "Mahalle & Köy Dolmuş Hattı",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Minibüs & Dolmuş Sınıfı)",
            lengthMeters: 7.2,
            turningRadius: "Maksimum Kıvraklık (7 Metre Minibüs)",
            roadFit: "En dar mahalle çıkmazları, köy yolları ve dik tepe rampaları",
            icon: "🚐",
            requiredLevel: 2,
            price: 65000,
            seatCapacity: 19,
            standingCapacity: 8,
            totalCapacity: 27,
            maxSpeed: 100,
            fuelTankCapacity: 100,
            fuelConsumptionRate: 16,
            acceleration: 1.25,
            braking: 1.15,
            engine: "Iveco 3.0L HPI Twin Turbo Euro 6 (205 HP - 470 Nm)",
            transmission: "ZF Hi-Matic 8 İleri Otomatik",
            doorType: "Elektrikli Otomatik Sürgülü / Yolcu Kapısı",
            features: "Efsanevi Türk dolmuş kültürü, dik yokuşlarda yüksek tork, dar sokaklarda çevik manevra.",
            desc: "Süleymanpaşa ve Tekirdağ tepe mahallelerinde, dar sokaklarda yolcuları kapısının önünden alan efsanevi dolmuş hattı aracı.",
            nvhLevel: 68,
            chassisRigidity: 72,
            suspensionComfort: 69,
            cabinAcousticType: "Tok 3.0L Dizel Titreşimi & Seri Dolmuş Rölantisi",
            structureDetails: "7.2 metre kompakt şasi, dar dönüş yarıçapı. 205 HP 3.0L dizelin tok rölantisi kabinde canlı hissedilir.",
            tipBonusPercent: 15,
            soundProfile: {
                basePitch: 1.05,
                bassBoost: 3,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.90,
                character: "205 HP Iveco 3.0L Twin-Turbo tok dizel dolmuş rölantisi"
            }
        },
        {
            id: "karsan_atak_8m",
            soundGroup: "karsan_atak",
            brand: "Karsan",
            model: "Atak 8.2M",
            fullName: "Karsan Atak (8.2 Metre Alçak Taban Midibüs)",
            category: "belediye",
            categoryName: "Alçak Tabanlı Çevik Şehir İçi",
            sizeTier: 1,
            sizeClass: "kucuk",
            sizeName: "1. Seviye: Küçük Otobüs (Alçak Taban Midibüs)",
            lengthMeters: 8.2,
            turningRadius: "Çok Dar (Alçak Taban Çevik)",
            roadFit: "Dar mahalle hatları, tarihi merkezler ve sahil ringleri",
            icon: "🚌",
            requiredLevel: 3,
            price: 185000,
            seatCapacity: 25,
            standingCapacity: 33,
            totalCapacity: 58,
            maxSpeed: 90,
            fuelTankCapacity: 150,
            fuelConsumptionRate: 22,
            acceleration: 1.2,
            braking: 1.15,
            engine: "FPT NEF4 Euro 6 (186 HP - 680 Nm)",
            transmission: "Allison 6 İleri Otomatik",
            doorType: "Geniş Alçak Tabanlı Çift Kanatlı Kapı",
            features: "Tam alçak taban, engelli tekerlekli sandalye rampası, durak yanaşma çökme (kneeling) sistemi.",
            desc: "Tarihi mahalleler ve sahil şeridinde hem engelli erişimi hem de yüksek çeviklik sunan tam alçak tabanlı modern yerli midibüs.",
            nvhLevel: 74,
            chassisRigidity: 77,
            suspensionComfort: 75,
            cabinAcousticType: "Modern Kompakt Euro 6 & Sessiz Rölanti",
            structureDetails: "Alçak tabanlı monokok gövde. Bursa fabrikası üretimi modern yerli şasi.",
            tipBonusPercent: 12,
            soundProfile: {
                basePitch: 1.02,
                bassBoost: 2,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.85,
                character: "186 HP FPT Euro 6 yumuşak alçak taban midibüs rölantisi"
            }
        },

        // 2. SEVİYE: ORTA BÜYÜKLÜKTE OTOBÜSLER (STANDART SOLO 12M)
        {
            id: "bmc_procity_12m",
            soundGroup: "bmc_procity",
            brand: "BMC",
            model: "Procity 12M Solo",
            fullName: "BMC Procity 12M (Yerli Metropol Amiral Gemisi)",
            category: "belediye",
            categoryName: "Standart Alçak Taban Şehir İçi",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo 12m)",
            lengthMeters: 12.0,
            turningRadius: "Standart Şehir İçi Metropol",
            roadFit: "Metropol ana arterleri, bulvarlar ve yoğun otobüs durakları",
            icon: "🚍",
            requiredLevel: 5,
            price: 490000,
            seatCapacity: 31,
            standingCapacity: 76,
            totalCapacity: 107,
            maxSpeed: 85,
            fuelTankCapacity: 300,
            fuelConsumptionRate: 32,
            acceleration: 1.1,
            braking: 1.2,
            engine: "Cummins ISB 6.7L Euro 6 (280 HP - 1100 Nm)",
            transmission: "ZF EcoLife 6 İleri Otomatik",
            doorType: "3 Adet Çift Kanatlı Pnömatik Alçak Taban Kapı",
            features: "İzmir, Ankara, İstanbul ve Tekirdağ'ın en bilinen yerli solo otobüsü. Güçlü tork, geniş iç hacim ve çift klima ünitesi.",
            desc: "Türkiye genelinde milyonlarca yolcuyu her gün işine ve evine taşıyan yerli sanayinin sağlam ve güçlü şehir içi amiral gemisi.",
            nvhLevel: 72,
            chassisRigidity: 81,
            suspensionComfort: 76,
            cabinAcousticType: "Tok Cummins Solo & Güçlü Şehir İçi Rölantisi",
            structureDetails: "12 metre güçlendirilmiş çelik şasi, geniş camlar ve dayanıklı belediye donanımı.",
            tipBonusPercent: 14,
            soundProfile: {
                basePitch: 0.98,
                bassBoost: 4,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.88,
                character: "280 HP Cummins ISB 6.7L tok belediye rölantisi ve ZF şanzıman vınlaması"
            }
        },
        {
            id: "temsa_avenue_lf",
            soundGroup: "temsa_avenue",
            brand: "Temsa",
            model: "Avenue LF 12M",
            fullName: "Temsa Avenue LF (12 Metre Solo Belediye)",
            category: "belediye",
            categoryName: "Alçak Taban Yerli Solo",
            sizeTier: 2,
            sizeClass: "orta",
            sizeName: "2. Seviye: Orta Büyüklükte Otobüs (Standart Solo 12m)",
            lengthMeters: 12.0,
            turningRadius: "Standart Şehir İçi",
            roadFit: "Geniş caddeler ve ilçe hatları",
            icon: "🚍",
            requiredLevel: 7,
            price: 620000,
            seatCapacity: 33,
            standingCapacity: 72,
            totalCapacity: 105,
            maxSpeed: 90,
            fuelTankCapacity: 300,
            fuelConsumptionRate: 31,
            acceleration: 1.15,
            braking: 1.2,
            engine: "Cummins ISB 6.7L Euro 6 (300 HP - 1200 Nm)",
            transmission: "Voith DIWA 6 Otomatik",
            doorType: "3 Geniş Alçak Taban Kapı",
            features: "Adana üretimi modern tasarım, yüksek torklu Cummins 300 HP motor, geniş yolcu koridoru ve havalı süspansiyon.",
            desc: "Temsa'nın şehir içi ulaşım için tasarladığı ödüllü alçak tabanlı solo otobüs. Yüksek torkuyla rampa duraklarında sarsıntısız kalkış yapar.",
            nvhLevel: 75,
            chassisRigidity: 82,
            suspensionComfort: 78,
            cabinAcousticType: "Adana Mühendisliği: Tok Şehir İçi Rölanti & Voith Tınısı",
            structureDetails: "Paslanmaz çelik kompozit gövde, yüksek korozyon dayanımı ve ferah kabin.",
            tipBonusPercent: 16,
            soundProfile: {
                basePitch: 0.96,
                bassBoost: 4,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.85,
                character: "300 HP Cummins tok dizel solo rölantisi"
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
            turningRadius: "Mafsallı Geniş Açı (Körüklü Ağır Vasıta)",
            roadFit: "Üniversite ekspres koridorları ve metropol ana arterleri",
            icon: "🚎",
            requiredLevel: 10,
            price: 1450000,
            seatCapacity: 48,
            standingCapacity: 117,
            totalCapacity: 165,
            maxSpeed: 85,
            fuelTankCapacity: 440,
            fuelConsumptionRate: 44,
            acceleration: 1.05,
            braking: 1.3,
            engine: "DAF PACCAR MX-11 Euro 6 (370 HP - 1600 Nm)",
            transmission: "ZF EcoLife 6 İleri Otomatik",
            doorType: "4 Geniş Çift Kanatlı Hızlı Tahliye Kapısı",
            features: "18.75 metre devasa uzunluk, elektronik körük burkulma kontrolü (IKK), 165 dev yolcu kapasitesi.",
            desc: "Büyükşehirlerin ve üniversite kampüslerinin yoğun saatlerdeki kurtarıcısı. 18.75 metre mafsallı gövdesiyle virajları ustalıkla sarar.",
            nvhLevel: 79,
            chassisRigidity: 85,
            suspensionComfort: 81,
            cabinAcousticType: "18.75m Ağır Körüklü Derin Transit Bası",
            structureDetails: "18.75 metre körüklü gövde. Ağır tonajlı DAF MX-11 motorunun devasa tork bası kabin geneline yayılır.",
            tipBonusPercent: 20,
            soundProfile: {
                basePitch: 0.89,
                bassBoost: 7,
                hasRetarder: false,
                hornSound: "city",
                cabinDamping: 0.90,
                character: "370 HP DAF PACCAR derin körüklü transit rölantisi ve 4 kapılı hava tahliyesi"
            }
        },
        {
            id: "temsa_maraton_vip",
            soundGroup: "temsa_maraton",
            brand: "Temsa",
            model: "Maraton 13 VIP",
            fullName: "Temsa Maraton 13 VIP (2+1 Süit Otoyol Devi)",
            category: "seyahat",
            categoryName: "Yüksek Tavanlı Süper Lüks Seyahat",
            sizeTier: 3,
            sizeClass: "buyuk",
            sizeName: "3. Seviye: Büyük Otobüs (13 Metre Yüksek Tavan VIP)",
            lengthMeters: 13.0,
            turningRadius: "Geniş Dönüş Açısı (Uzun Yol)",
            roadFit: "Şehirlerarası otoyollar, peronlar ve VIP turizm seferleri",
            icon: "🛣️",
            requiredLevel: 16,
            price: 4400000,
            seatCapacity: 41,
            standingCapacity: 0,
            totalCapacity: 41,
            maxSpeed: 115,
            fuelTankCapacity: 550,
            fuelConsumptionRate: 29,
            acceleration: 1.38,
            braking: 1.35,
            engine: "DAF PACCAR MX-11 Euro 6 (450 HP - 2300 Nm)",
            transmission: "ZF TraXon 12 İleri Otomatik + İntarder 3",
            doorType: "Pnömatik Çift Kilitli Lüks Yolcu Kapısı",
            features: "3.90 metre yüksek tavan, 2+1 deri süit koltuklar, panoramik yolcu camları, ZF İntarder 3 hidrolik frenleme.",
            desc: "Türk şehirlerarası otobüsçülüğünün yüksek tavanlı yerli ikonu. 450 beygirlik gücü ve devasa alt bagajıyla otoyolların efendisi.",
            nvhLevel: 93,
            chassisRigidity: 93,
            suspensionComfort: 92,
            cabinAcousticType: "450 HP DAF Homurtusu & Fısıltı Kabin",
            structureDetails: "Yüksek tavanlı aerodinamik süper yapı, titreşimi yutan bağımsız ön dingil ve çok katmanlı motor yalıtım kalkanı.",
            tipBonusPercent: 36,
            soundProfile: {
                basePitch: 0.89,
                bassBoost: 6,
                hasRetarder: true,
                hornSound: "air",
                cabinDamping: 0.70,
                retarderPitch: 0.98,
                character: "450 HP DAF PACCAR tok otoyol rölantisi + ZF İntarder 3 ıslığı ve gür havalı korna"
            }
        }
    ],

        OWNED_KEY: 'tekulas_owned_buses_v1',

    getOwnedBusIds: function() {
        try {
            const saved = localStorage.getItem(this.OWNED_KEY);
            const arr = saved ? JSON.parse(saved) : ["otokar_kent_lf"];
            if (!arr.includes("otokar_kent_lf")) arr.push("otokar_kent_lf");
            return arr;
        } catch(e) {
            return ["otokar_kent_lf"];
        }
    },

    isBusOwned: function(busId) {
        return this.getOwnedBusIds().includes(busId);
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
            const lockMsg = `Seviyeniz yetersiz! ${bus.fullName} satın almak için Seviye ${bus.requiredLevel} olmalısınız (Mevcut Seviyeniz: ${currentLevel}).`;
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

            let ariaLabel = `${b.fullName}. ${b.categoryName}. Fiyat: ${(b.price || 0).toLocaleString('tr-TR')} TL. ${capacityInfo}. ${isOwned ? (isSelected ? 'Aktif kullanımda.' : 'Garajınızda mevcut, seçmek için Enter.') : 'Satın almak için Enter.'}`;
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
                    ⚡ <strong>Maks Hız:</strong> ${b.maxSpeed} km/s | ⛽ <strong>Yakıt Deposu:</strong> <span style="color: #facc15;">${b.fuelTankCapacity || 500} L</span> (~ ${b.fuelConsumptionRate || 30} L/100km)
                </div>
                <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 4px;">
                    ⚙️ <strong>Motor & Vites:</strong> ${b.engine} | ${b.transmission}
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

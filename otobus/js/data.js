/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU VERİ DOSYASI (DATA.JS)
   ========================================================================== */

const masterCitiesList = ["Tekirdağ", "Edirne", "Kırklareli", "İstanbul", "Çanakkale", "Ankara"];

// Åehirlerin sadece coğrafi komşuları ve API sorguları bulunur. Rotalar dinamik oluşturulur.
const sehirRotalari = {
    "Tekirdağ": {
        canliSorgu: `area["ISO3166-2"="TR-59"]->.tekirdag; (node["highway"="bus_stop"](area.tekirdag); node["traffic_calming"~"bump|hump"](area.tekirdag););`,
        komsular: {
            bati: "Edirne",
            kuzey: "Kırklareli",
            dogu: "İstanbul",
            guney: "Çanakkale"
        },
        terrain: "sahil",
        ucretler: { tam: 33, ogrenci: 17, yasli: 0 }
    },
    "Edirne": {
        canliSorgu: `area["ISO3166-2"="TR-22"]->.edirne; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.edirne)(area.merkez); node["traffic_calming"~"bump|hump"](area.edirne)(area.merkez););`,
        komsular: {
            dogu: "Tekirdağ",
            kuzey: "Kırklareli"
        },
        terrain: "toprak",
        ucretler: { tam: 32, ogrenci: 21.5, yasli: 0 }
    },
    "Kırklareli": {
        canliSorgu: `area["ISO3166-2"="TR-39"]->.kirklareli; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.kirklareli)(area.merkez); node["traffic_calming"~"bump|hump"](area.kirklareli)(area.merkez););`,
        komsular: {
            guney: "Tekirdağ",
            bati: "Edirne",
            dogu: "İstanbul"
        },
        terrain: "toprak",
        ucretler: { tam: 25, ogrenci: 12.5, yasli: 0 }
    },
    "İstanbul": {
        canliSorgu: `area["ISO3166-2"="TR-34"]->.istanbul; area["name"="Kadıköy"]->.ilce; (node["highway"="bus_stop"](area.istanbul)(area.ilce); node["traffic_calming"~"bump|hump"](area.istanbul)(area.ilce););`,
        komsular: {
            bati: "Tekirdağ",
            kuzey: "Kırklareli",
            dogu: "Ankara"
        },
        terrain: "sahil",
        ucretler: { tam: 42, ogrenci: 20.5, yasli: 0 }
    },
    "Çanakkale": {
        canliSorgu: `area["ISO3166-2"="TR-17"]->.canakkale; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.canakkale)(area.merkez); node["traffic_calming"~"bump|hump"](area.canakkale)(area.merkez););`,
        komsular: {
            kuzey: "Tekirdağ"
        },
        terrain: "sahil",
        ucretler: { tam: 30, ogrenci: 19, yasli: 0 }
    },
    "Ankara": {
        canliSorgu: `area["ISO3166-2"="TR-06"]->.ankara; area["name"="Çankaya"]->.ilce; (node["highway"="bus_stop"](area.ankara)(area.ilce); node["traffic_calming"~"bump|hump"](area.ankara)(area.ilce););`,
        komsular: {
            bati: "İstanbul"
        },
        terrain: "asfalt",
        ucretler: { tam: 35, ogrenci: 17.5, yasli: 0 }
    }
};

// Aktif oynanabilir rotaların (API'den çekildikten sonra) tutulduğu havuz
// Gerçek ve Özgün Şehir/İlçe Durak Havuzu (API Çöktüğünde veya Çevrimdışıyken Devreye Girer)
// Tekirdağ için Merkez ilçe Süleymanpaşa'dır.
const varsayilanSehirDuraklari = {
    "Tekirdağ": [
        { name: "Süleymanpaşa Yeni Otobüs Terminali", lat: 40.9950, lon: 27.5620 },
        { name: "Valilik / Hükümet Caddesi", lat: 40.9780, lon: 27.5110 },
        { name: "Tarihi Rüstem Paşa Camii", lat: 40.9772, lon: 27.5145 },
        { name: "Tekirdağ Sahil Dolgu Parkı", lat: 40.9730, lon: 27.5100 },
        { name: "Değirmenaltı / Namık Kemal Evi", lat: 40.9930, lon: 27.5810 },
        { name: "Dr. İsmail Fehmi Cumalıoğlu Şehir Hastanesi", lat: 40.9880, lon: 27.5350 },
        { name: "Namık Kemal Üniversitesi (NKÜ) Kampüsü", lat: 40.9975, lon: 27.5870 },
        { name: "Köprübaşı Meydanı", lat: 40.9760, lon: 27.5130 },
        { name: "Çarşı / Bedesten Durağı", lat: 40.9765, lon: 27.5150 },
        { name: "Barış Manço Parkı", lat: 40.9810, lon: 27.5200 },
        { name: "Altınova Sahil Durağı", lat: 40.9620, lon: 27.4850 },
        { name: "Eski Otogar Kavşağı", lat: 40.9820, lon: 27.5180 },
        { name: "Cumhuriyet Meydanı", lat: 40.9770, lon: 27.5120 },
        { name: "Tekira AVM Durağı", lat: 40.9815, lon: 27.5170 },
        { name: "Yüzüncü Yıl Mahallesi", lat: 40.9890, lon: 27.5050 },
        { name: "Hürriyet Mahallesi Parkı", lat: 40.9940, lon: 27.5750 },
        { name: "Tarihi Beşevler Durağı", lat: 40.9750, lon: 27.5090 },
        { name: "Atatürk Ormanı Girişi", lat: 40.9990, lon: 27.5500 },
        { name: "Gündoğdu Mahallesi Meydanı", lat: 40.9850, lon: 27.5280 },
        { name: "Yavuz Mahallesi Durağı", lat: 40.9870, lon: 27.5220 },
        { name: "Çınarlı Mahallesi Muhtarlık", lat: 40.9840, lon: 27.5080 },
        { name: "Aydoğdu Mahallesi", lat: 40.9790, lon: 27.5020 },
        { name: "Karadeniz Mahallesi", lat: 40.9960, lon: 27.5380 },
        { name: "Kumbağ Kavşağı", lat: 40.9550, lon: 27.4650 },
        { name: "Ortacami Durağı", lat: 40.9755, lon: 27.5115 }
    ],
    "Edirne": [
        { name: "Edirne Şehirlerarası Otobüs Terminali", lat: 41.6500, lon: 26.5900 },
        { name: "Selimiye Camii Meydanı", lat: 41.6780, lon: 26.5555 },
        { name: "Saraçlar Caddesi", lat: 41.6750, lon: 26.5540 },
        { name: "Trakya Üniversitesi Balkan Yerleşkesi", lat: 41.6420, lon: 26.6180 },
        { name: "Trakya Üniversitesi Tıp Fakültesi Hastanesi", lat: 41.6440, lon: 26.6150 },
        { name: "Tarihi Meriç Köprüsü", lat: 41.6610, lon: 26.5520 },
        { name: "Karaağaç Tarihi Tren Garı", lat: 41.6520, lon: 26.5270 },
        { name: "II. Bayezid Külliyesi Sağlık Müzesi", lat: 41.6850, lon: 26.5420 },
        { name: "Kırkpınar Er Meydanı Sarayiçi", lat: 41.6910, lon: 26.5580 },
        { name: "Bedesten Çarşısı", lat: 41.6765, lon: 26.5545 },
        { name: "Ali Paşa Çarşısı", lat: 41.6755, lon: 26.5535 },
        { name: "Eski Cami Durağı", lat: 41.6760, lon: 26.5560 },
        { name: "Üç Şerefeli Cami Durağı", lat: 41.6775, lon: 26.5530 },
        { name: "Ayşekadın Durağı", lat: 41.6680, lon: 26.5650 },
        { name: "Şükrüpaşa Mahallesi", lat: 41.6720, lon: 26.5820 },
        { name: "Fatih Mahallesi", lat: 41.6650, lon: 26.5850 },
        { name: "Kocasinan Parkı", lat: 41.6690, lon: 26.5770 },
        { name: "Margi AVM Durağı", lat: 41.6660, lon: 26.5740 },
        { name: "Erasta AVM Durağı", lat: 41.6675, lon: 26.5680 },
        { name: "Gazimihal Köprüsü", lat: 41.6790, lon: 26.5390 }
    ],
    "Kırklareli": [
        { name: "Kırklareli Şehirlerarası Otogar", lat: 41.7310, lon: 27.2180 },
        { name: "Vilayet Meydanı / Hükümet Konağı", lat: 41.7350, lon: 27.2250 },
        { name: "Kırklareli Üniversitesi Kayalı Kampüsü", lat: 41.7850, lon: 27.1850 },
        { name: "Kırklareli Eğitim ve Araştırma Hastanesi", lat: 41.7280, lon: 27.2350 },
        { name: "İstasyon Caddesi", lat: 41.7330, lon: 27.2210 },
        { name: "Yayala Parkı", lat: 41.7380, lon: 27.2280 },
        { name: "Tarihi Hızırbey Camii (Büyük Cami)", lat: 41.7360, lon: 27.2240 },
        { name: "Arasta Çarşısı", lat: 41.7355, lon: 27.2235 },
        { name: "Bademlik Parkı", lat: 41.7410, lon: 27.2190 },
        { name: "Karahıdır Mahallesi", lat: 41.7190, lon: 27.2380 },
        { name: "Demirtaş Mahallesi", lat: 41.7370, lon: 27.2310 },
        { name: "Cumhuriyet Caddesi", lat: 41.7345, lon: 27.2260 },
        { name: "Pınarhisar Yolu Kavşağı", lat: 41.7250, lon: 27.2420 },
        { name: "Babaeski Yolu Durağı", lat: 41.7200, lon: 27.2150 }
    ],
    "İstanbul": [
        { name: "Kadıköy Rıhtım İskele", lat: 40.9915, lon: 29.0225 },
        { name: "Kadıköy Boğa Heykeli", lat: 40.9902, lon: 29.0290 },
        { name: "Moda Sahil Parkı", lat: 40.9785, lon: 29.0260 },
        { name: "Altıyol Meydanı", lat: 40.9905, lon: 29.0300 },
        { name: "Söğütlüçeşme Metrobüs & YHT İstasyonu", lat: 40.9920, lon: 29.0380 },
        { name: "Fenerbahçe Şükrü Saracoğlu Stadyumu", lat: 40.9880, lon: 29.0370 },
        { name: "Kalamış Marina Durağı", lat: 40.9790, lon: 29.0430 },
        { name: "Göztepe Parkı", lat: 40.9720, lon: 29.0610 },
        { name: "Bağdat Caddesi Suadiye", lat: 40.9630, lon: 29.0820 },
        { name: "Bostancı İskele Durağı", lat: 40.9530, lon: 29.0950 },
        { name: "Marmara Üniversitesi Göztepe Kampüsü", lat: 40.9860, lon: 29.0520 },
        { name: "Haydarpaşa Numune Eğitim Hastanesi", lat: 41.0020, lon: 29.0230 },
        { name: "Sultan 2. Abdülhamid Han Hastanesi", lat: 41.0040, lon: 29.0250 },
        { name: "Kozyatağı Metro İstasyonu", lat: 40.9750, lon: 29.0980 },
        { name: "Caddebostan Sahil Durağı", lat: 40.9680, lon: 29.0680 }
    ],
    "Çanakkale": [
        { name: "Çanakkale Şehirlerarası Otobüs Terminali", lat: 40.1380, lon: 26.4350 },
        { name: "Çanakkale İskele Meydanı", lat: 40.1510, lon: 26.4060 },
        { name: "Aynalı Çarşı Durağı", lat: 40.1495, lon: 26.4080 },
        { name: "Çimenlik Kalesi / Deniz Müzesi", lat: 40.1470, lon: 26.4010 },
        { name: "Kordon Truva Atı Durağı", lat: 40.1530, lon: 26.4085 },
        { name: "ÇOMÜ Terzioğlu Yerleşkesi", lat: 40.1120, lon: 26.4180 },
        { name: "Mehmet Akif Ersoy Devlet Hastanesi", lat: 40.1250, lon: 26.4320 },
        { name: "Halk Bahçesi Parkı", lat: 40.1480, lon: 26.4120 },
        { name: "Saat Kulesi Meydanı", lat: 40.1500, lon: 26.4055 },
        { name: "Barbaros Mahallesi", lat: 40.1350, lon: 26.4150 },
        { name: "Cevatpaşa Durağı", lat: 40.1560, lon: 26.4180 },
        { name: "Esenler Mahallesi", lat: 40.1420, lon: 26.4250 },
        { name: "Kepez Meydan Durağı", lat: 40.1030, lon: 26.4050 },
        { name: "Kepez Liman Yolu", lat: 40.0980, lon: 26.4020 }
    ],
    "Ankara": [
        { name: "AŞTİ Şehirlerarası Otobüs Terminali", lat: 39.9180, lon: 32.8120 },
        { name: "Kızılay Meydanı", lat: 39.9208, lon: 32.8540 },
        { name: "Ulus Atatürk Heykeli", lat: 39.9415, lon: 32.8545 },
        { name: "Anıtkabir Durağı", lat: 39.9250, lon: 32.8360 },
        { name: "Güvenpark Durağı", lat: 39.9195, lon: 32.8530 },
        { name: "Tunalı Hilmi Caddesi", lat: 39.9040, lon: 32.8600 },
        { name: "Kuğulu Park", lat: 39.8990, lon: 32.8620 },
        { name: "TBMM Çankaya Kapısı", lat: 39.9120, lon: 32.8510 },
        { name: "Hacettepe Üniversitesi Sıhhiye Kampüsü", lat: 39.9320, lon: 32.8630 },
        { name: "Ankara Şehir Hastanesi Bilkent", lat: 39.8890, lon: 32.7650 },
        { name: "ODTÜ A1 Kapısı Durağı", lat: 39.9010, lon: 32.7840 },
        { name: "Milli Kütüphane Durağı", lat: 39.9150, lon: 32.8280 },
        { name: "Sıhhiye Abdi İpekçi Parkı", lat: 39.9280, lon: 32.8560 },
        { name: "Atakule Meydanı", lat: 39.8860, lon: 32.8580 },
        { name: "Dikmen Vadisi Girişi", lat: 39.8920, lon: 32.8470 }
    ]
};

// İlçe ve Beldeler Arası Sabit Hatlar (TEKULAŞ & Ekspres)
const ilceRotalari = {
    "Tekirdağ": [
        {
            id: "hat_26_suleymanpasa_velimese",
            hatNo: "26",
            name: "26 SÜLEYMANPAŞA - VELİMEŞE",
            destDistrict: "Velimeşe",
            originDistrict: "Süleymanpaşa",
            startStop: "Süleymanpaşa Yeni Otobüs Terminali",
            endStop: "Velimeşe Meydan",
            intermediateStops: [
                "Tekirdağ Dr. İsmail Fehmi Cumalıoğlu Şehir Hastanesi",
                "Namık Kemal Üniversitesi (NKÜ) Araştırma Hastanesi",
                "Çorlu Çevre Yolu Kavşağı",
                "Velimeşe Giriş (Sanayi Bağlantısı)"
            ],
            desc: "Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Velimeşe Meydan. Ara duraklar: Şehir Hastanesi, NKÜ Araştırma, Çorlu Çevre Yolu, Velimeşe Giriş. Toplam 6 durak.",
            detailedInstructions: "TEKULAŞ 26 Numaralı Hat Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otobüs Terminali durağından bekleyen 35 yolcuyu alarak hareket edin.\n2. Adım: Sonra Tekirdağ Dr. İsmail Fehmi Cumalıoğlu Şehir Hastanesi durağına gidin; yolcuları indirin ve bekleyen 8 yolcuyu alıp devam edin.\n3. Adım: Sonra Namık Kemal Üniversitesi Araştırma Hastanesi durağına gidin; yolcuları indirin ve bekleyen 10 yolcuyu alıp devam edin.\n4. Adım: Sonra Çorlu Çevre Yolu Kavşağı durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\n5. Adım: Sonra Velimeşe Giriş durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\n6. Adım (Hedef Son Durak): Sonra Velimeşe Meydan durağına gidin; tüm yolcuları indirin ve görevi tamamlayın.",
            speechBriefing: "26 numaralı Süleymanpaşa Velimeşe ekspres seferi. Kalkış: Süleymanpaşa Yeni Otobüs Terminali. Hedef son durak: Velimeşe Meydan. Toplam 6 durak. 1. Adım: Süleymanpaşa Terminalinden bekleyen yolcuları alarak hareket edin. 2. Adım: Şehir Hastanesine gidin, yolcuları indirin ve bekleyen yolcuları alarak devam edin. 3. Adım: Namık Kemal Üniversitesi Araştırma Hastanesine gidin, yolcuları alıp devam edin. 4. Adım: Çorlu Çevre Yoluna gidin, yolcuları alıp devam edin. 5. Adım: Velimeşe Giriş durağına gidin, yolcuları alıp devam edin. 6. Adım: Velimeşe Meydan son durağına varıp tüm yolcuları indirin ve görevi başarıyla tamamlayın.",
            color: "#38bdf8",
            otobusKapasitesi: 40,
            biletFiyat: 75,
            biletFiyatMultiplier: 2.5,
            isDistrict: true,
            terrain: "otoyol",
            stops: [
                {
                    name: "Süleymanpaşa Yeni Otobüs Terminali",
                    anons: "Süleymanpaşa Yeni Otobüs Terminali kalkış peronundayız. 26 numaralı hat Velimeşe seferi başlıyor.",
                    bekleyenYolcu: 35,
                    inenYolcu: 0,
                    gercekMesafeSonraki: 3.5,
                    lat: 40.9950,
                    lon: 27.5620
                },
                {
                    name: "Tekirdağ Dr. İsmail Fehmi Cumalıoğlu Şehir Hastanesi",
                    anons: "Sonraki durak: Tekirdağ Dr. İsmail Fehmi Cumalıoğlu Şehir Hastanesi.",
                    bekleyenYolcu: 8,
                    inenYolcu: 5,
                    gercekMesafeSonraki: 4.2,
                    lat: 40.9880,
                    lon: 27.5350
                },
                {
                    name: "Namık Kemal Üniversitesi (NKÜ) Araştırma Hastanesi",
                    anons: "Sonraki durak: Namık Kemal Üniversitesi Araştırma Hastanesi.",
                    bekleyenYolcu: 10,
                    inenYolcu: 6,
                    gercekMesafeSonraki: 18.5,
                    lat: 40.9975,
                    lon: 27.5870
                },
                {
                    name: "Çorlu Çevre Yolu Kavşağı",
                    anons: "Sonraki durak: Çorlu Çevre Yolu Otogar Kavşağı.",
                    bekleyenYolcu: 5,
                    inenYolcu: 12,
                    gercekMesafeSonraki: 11.5,
                    lat: 41.1550,
                    lon: 27.7800
                },
                {
                    name: "Velimeşe Giriş (Sanayi Bağlantısı)",
                    anons: "Sonraki durak: Velimeşe Giriş, Organize Sanayi Bağlantısı.",
                    bekleyenYolcu: 2,
                    inenYolcu: 8,
                    gercekMesafeSonraki: 2.8,
                    lat: 41.2450,
                    lon: 27.8850
                },
                {
                    name: "Velimeşe Meydan",
                    anons: "Son durak: Velimeşe Meydan. 26 numaralı hat seferi tamamlandı. Tüm yolcularımızın inmesi rica olunur.",
                    bekleyenYolcu: 0,
                    inenYolcu: 29,
                    gercekMesafeSonraki: 0,
                    lat: 41.2530,
                    lon: 27.8990
                }
            ]
        },
        {
            id: "hat_corlu_ekspres",
            hatNo: "Çorlu",
            name: "SÜLEYMANPAŞA - ÇORLU EKSPRES",
            destDistrict: "Çorlu",
            originDistrict: "Süleymanpaşa",
            startStop: "Süleymanpaşa Yeni Otobüs Terminali",
            endStop: "Çorlu Otogar",
            intermediateStops: ["Tekirdağ Şehir Hastanesi"],
            desc: "Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Çorlu Otogar. Ara durak: Tekirdağ Şehir Hastanesi. Toplam 3 durak.",
            detailedInstructions: "Süleymanpaşa - Çorlu Ekspres Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otobüs Terminali durağından bekleyen 30 yolcuyu alarak hareket edin.\n2. Adım: Sonra Tekirdağ Şehir Hastanesi durağına gidin; yolcuları indirin ve bekleyen 8 yolcuyu alıp devam edin.\n3. Adım (Hedef Son Durak): Sonra Çorlu Otogar durağına gidin; tüm yolcuları indirin ve görevi tamamlayın.",
            speechBriefing: "Süleymanpaşa Çorlu Ekspres seferi. 1. Adım: Süleymanpaşa Terminalinden 30 yolcuyu alarak hareket edin. 2. Adım: Tekirdağ Şehir Hastanesine gidin, yolcu indirip bekleyen yolcuları alarak devam edin. 3. Adım: Çorlu Otogara varıp tüm yolcuları indirin ve görevi tamamlayın.",
            color: "#fbbf24",
            otobusKapasitesi: 40,
            biletFiyat: 60,
            biletFiyatMultiplier: 2.0,
            isDistrict: true,
            terrain: "otoyol",
            stops: [
                { name: "Süleymanpaşa Yeni Otobüs Terminali", anons: "Süleymanpaşa Yeni Otogar kalkış peronundayız. Çorlu Ekspres seferi başlıyor.", bekleyenYolcu: 30, inenYolcu: 0, gercekMesafeSonraki: 4.0, lat: 40.9950, lon: 27.5620 },
                { name: "Tekirdağ Şehir Hastanesi", anons: "Sonraki durak: Tekirdağ Şehir Hastanesi.", bekleyenYolcu: 8, inenYolcu: 4, gercekMesafeSonraki: 28.0, lat: 40.9880, lon: 27.5350 },
                { name: "Çorlu Otogar", anons: "Son durak: Çorlu Otogar. Çorlu Ekspres seferi tamamlandı.", bekleyenYolcu: 0, inenYolcu: 34, gercekMesafeSonraki: 0, lat: 41.1600, lon: 27.8000 }
            ]
        },
        {
            id: "hat_cerkezkoy_ekspres",
            hatNo: "Çerkezköy",
            name: "SÜLEYMANPAŞA - ÇERKEZKÖY",
            destDistrict: "Çerkezköy",
            originDistrict: "Süleymanpaşa",
            startStop: "Süleymanpaşa Yeni Otobüs Terminali",
            endStop: "Çerkezköy Otogar",
            intermediateStops: [],
            desc: "Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Çerkezköy Otogar. Direkt ekspres ilçe seferi. Toplam 2 durak.",
            detailedInstructions: "Süleymanpaşa - Çerkezköy Ekspres Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otobüs Terminali durağından bekleyen 32 yolcuyu alarak hareket edin.\n2. Adım (Hedef Son Durak): Sonra Çerkezköy Otogar durağına gidin; tüm yolcuları indirin ve görevi tamamlayın.",
            speechBriefing: "Süleymanpaşa Çerkezköy ekspres seferi. 1. Adım: Süleymanpaşa Terminalinden bekleyen 32 yolcuyu alarak hareket edin. 2. Adım: Doğrudan Çerkezköy Otogarına varıp tüm yolcuları indirin ve görevi tamamlayın.",
            color: "#34d399",
            otobusKapasitesi: 40,
            biletFiyat: 85,
            biletFiyatMultiplier: 2.8,
            isDistrict: true,
            terrain: "otoyol",
            stops: [
                { name: "Süleymanpaşa Yeni Otobüs Terminali", anons: "Süleymanpaşa Yeni Otogar kalkış peronundayız. Çerkezköy seferi başlıyor.", bekleyenYolcu: 32, inenYolcu: 0, gercekMesafeSonraki: 35.0, lat: 40.9950, lon: 27.5620 },
                { name: "Çerkezköy Otogar", anons: "Son durak: Çerkezköy Otogar. Seferimiz tamamlanmıştır.", bekleyenYolcu: 0, inenYolcu: 32, gercekMesafeSonraki: 0, lat: 41.2850, lon: 27.9950 }
            ]
        },
        {
            id: "hat_muratli",
            hatNo: "Muratlı",
            name: "SÜLEYMANPAŞA - MURATLI",
            destDistrict: "Muratlı",
            originDistrict: "Süleymanpaşa",
            startStop: "Süleymanpaşa Yeni Otobüs Terminali",
            endStop: "Muratlı Meydan",
            intermediateStops: [],
            desc: "Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Muratlı Meydan. Muratlı Caddesi üzerinden direkt sefer. Toplam 2 durak.",
            detailedInstructions: "Süleymanpaşa - Muratlı Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otobüs Terminali durağından bekleyen 25 yolcuyu alarak hareket edin.\n2. Adım (Hedef Son Durak): Sonra Muratlı Meydan durağına gidin; tüm yolcuları indirin ve görevi tamamlayın.",
            speechBriefing: "Süleymanpaşa Muratlı seferi. 1. Adım: Süleymanpaşa Terminalinden bekleyen 25 yolcuyu alarak hareket edin. 2. Adım: Doğrudan Muratlı Meydanına varıp tüm yolcuları indirin ve görevi tamamlayın.",
            color: "#a78bfa",
            otobusKapasitesi: 32,
            biletFiyat: 45,
            biletFiyatMultiplier: 1.5,
            isDistrict: true,
            terrain: "asfalt",
            stops: [
                { name: "Süleymanpaşa Yeni Otobüs Terminali", anons: "Süleymanpaşa Yeni Otogar kalkış peronundayız. Muratlı seferi başlıyor.", bekleyenYolcu: 25, inenYolcu: 0, gercekMesafeSonraki: 24.0, lat: 40.9950, lon: 27.5620 },
                { name: "Muratlı Meydan", anons: "Son durak: Muratlı Meydan. Seferimiz sona ermiştir.", bekleyenYolcu: 0, inenYolcu: 25, gercekMesafeSonraki: 0, lat: 41.1710, lon: 27.5020 }
            ]
        }
    ]
};

let routesData = {};

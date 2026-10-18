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
            detailedInstructions: "TEKULAŞ 26 Numaralı Hat: Süleymanpaşa Yeni Otogar kalkış, Şehir Hastanesi, NKÜ Araştırma ve Çorlu bağlantısıyla Velimeşe Meydanı ekspres ilçe seferi.",
            speechBriefing: "26 numaralı Süleymanpaşa Velimeşe ekspres ilçe seferi brifingi. Kalkış durağınız: Süleymanpaşa Yeni Otobüs Terminali. Sırasıyla duracağınız duraklar: Tekirdağ Dr. İsmail Fehmi Cumalıoğlu Şehir Hastanesi, Namık Kemal Üniversitesi Araştırma Hastanesi, Çorlu Çevre Yolu Kavşağı, Velimeşe Giriş. Gitmeniz gereken son durak: Velimeşe Meydan. Toplam 6 durak. Nasıl yapılır: W ile gaz verin, duraklara yaklaşırken S ile yavaşlayıp durun. Durakta E ile ön, Q ile arka kapıyı açarak yolcuları alın. Kapıları kapatıp sonraki durağa ilerleyin. İyi yolculuklar kaptan.",
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
            detailedInstructions: "Süleymanpaşa Yeni Otogar'dan Çorlu Otogar'a D-100 karayolu ekspres seferi.",
            speechBriefing: "Süleymanpaşa Çorlu Ekspres seferi brifingi. Kalkış noktanız: Süleymanpaşa Yeni Otobüs Terminali. Durulacak ara durak: Tekirdağ Şehir Hastanesi. Gitmeniz gereken hedef son durak: Çorlu Otogar. Toplam 3 durak. W ile gaz verin, duraklarda S ile durup E ve Q ile kapıları açarak yolcuları alın.",
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
            detailedInstructions: "Süleymanpaşa'dan Çerkezköy Otogarı'na direkt hat.",
            speechBriefing: "Süleymanpaşa Çerkezköy seferi brifingi. Kalkış noktanız: Süleymanpaşa Yeni Otobüs Terminali. Hedef son durak: Çerkezköy Otogar. Ara durak yoktur, doğrudan varış otogarına ekspres sürüş yapın. İyi yolculuklar.",
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
            detailedInstructions: "Süleymanpaşa Muratlı Caddesi üzerinden Muratlı ilçe merkezine sefer.",
            speechBriefing: "Süleymanpaşa Muratlı seferi brifingi. Kalkış noktanız: Süleymanpaşa Yeni Otobüs Terminali. Hedef son durak: Muratlı Meydan. Ara durak yoktur, doğrudan Muratlı merkezine sürüş yapın. İyi yolculuklar.",
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

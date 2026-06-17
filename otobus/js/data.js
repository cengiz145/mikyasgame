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
let routesData = {};



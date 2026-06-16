/* ==========================================================================
   TÃœRKÄ°YE TURNESÄ° - OTOBÃœS SÄ°MÃœLASYONU VERÄ° DOSYASI (DATA.JS)
   ========================================================================== */

const masterCitiesList = ["TekirdaÄŸ", "Edirne", "KÄ±rklareli", "Ä°stanbul", "Ã‡anakkale", "Ankara"];

// Åehirlerin sadece coÄŸrafi komÅŸularÄ± ve API sorgularÄ± bulunur. Rotalar dinamik oluÅŸturulur.
const sehirRotalari = {
    "TekirdaÄŸ": {
        canliSorgu: `area["ISO3166-2"="TR-59"]->.tekirdag; (node["highway"="bus_stop"](area.tekirdag); node["traffic_calming"~"bump|hump"](area.tekirdag););`,
        komsular: {
            bati: "Edirne",
            kuzey: "KÄ±rklareli",
            dogu: "Ä°stanbul",
            guney: "Ã‡anakkale"
        },
        terrain: "sahil",
        ucretler: { tam: 33, ogrenci: 17, yasli: 0 }
    },
    "Edirne": {
        canliSorgu: `area["ISO3166-2"="TR-22"]->.edirne; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.edirne)(area.merkez); node["traffic_calming"~"bump|hump"](area.edirne)(area.merkez););`,
        komsular: {
            dogu: "TekirdaÄŸ",
            kuzey: "KÄ±rklareli"
        },
        terrain: "toprak",
        ucretler: { tam: 32, ogrenci: 21.5, yasli: 0 }
    },
    "KÄ±rklareli": {
        canliSorgu: `area["ISO3166-2"="TR-39"]->.kirklareli; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.kirklareli)(area.merkez); node["traffic_calming"~"bump|hump"](area.kirklareli)(area.merkez););`,
        komsular: {
            guney: "TekirdaÄŸ",
            bati: "Edirne",
            dogu: "Ä°stanbul"
        },
        terrain: "toprak",
        ucretler: { tam: 25, ogrenci: 12.5, yasli: 0 }
    },
    "Ä°stanbul": {
        canliSorgu: `area["ISO3166-2"="TR-34"]->.istanbul; area["name"="KadÄ±kÃ¶y"]->.ilce; (node["highway"="bus_stop"](area.istanbul)(area.ilce); node["traffic_calming"~"bump|hump"](area.istanbul)(area.ilce););`,
        komsular: {
            bati: "TekirdaÄŸ",
            kuzey: "KÄ±rklareli",
            dogu: "Ankara"
        },
        terrain: "sahil",
        ucretler: { tam: 42, ogrenci: 20.5, yasli: 0 }
    },
    "Ã‡anakkale": {
        canliSorgu: `area["ISO3166-2"="TR-17"]->.canakkale; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.canakkale)(area.merkez); node["traffic_calming"~"bump|hump"](area.canakkale)(area.merkez););`,
        komsular: {
            kuzey: "TekirdaÄŸ"
        },
        terrain: "sahil",
        ucretler: { tam: 30, ogrenci: 19, yasli: 0 }
    },
    "Ankara": {
        canliSorgu: `area["ISO3166-2"="TR-06"]->.ankara; area["name"="Ã‡ankaya"]->.ilce; (node["highway"="bus_stop"](area.ankara)(area.ilce); node["traffic_calming"~"bump|hump"](area.ankara)(area.ilce););`,
        komsular: {
            bati: "Ä°stanbul"
        },
        terrain: "asfalt",
        ucretler: { tam: 35, ogrenci: 17.5, yasli: 0 }
    }
};

// Aktif oynanabilir rotalarÄ±n (API'den Ã§ekildikten sonra) tutulduÄŸu havuz
let routesData = {};


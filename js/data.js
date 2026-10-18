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
// 190 ADET GERÇEK VE ÖZGÜN ŞEHİR/İLÇE DURAK VERİTABANI (API ÇÖKMESİNE KARŞI TAM GÜVENLİ YEDEK)
// Tekirdağ için Süleymanpaşa, Çorlu, Çerkezköy, Muratlı gerçek durakları bulunur.
const varsayilanSehirDuraklari = {
    "Tekirdağ": [
        {
            "name": "Süleymanpaşa Yeni Otobüs Terminali",
            "lat": 40.995,
            "lon": 27.562
        },
        {
            "name": "Valilik / Hükümet Caddesi",
            "lat": 40.978,
            "lon": 27.511
        },
        {
            "name": "Tarihi Rüstem Paşa Camii",
            "lat": 40.9772,
            "lon": 27.5145
        },
        {
            "name": "Tekirdağ Sahil Dolgu Parkı",
            "lat": 40.973,
            "lon": 27.51
        },
        {
            "name": "Değirmenaltı / Namık Kemal Evi",
            "lat": 40.993,
            "lon": 27.581
        },
        {
            "name": "Dr. İsmail Fehmi Cumalıoğlu Şehir Hastanesi",
            "lat": 40.988,
            "lon": 27.535
        },
        {
            "name": "Namık Kemal Üniversitesi (NKÜ) Kampüsü",
            "lat": 40.9975,
            "lon": 27.587
        },
        {
            "name": "Köprübaşı Meydanı",
            "lat": 40.976,
            "lon": 27.513
        },
        {
            "name": "Çarşı / Bedesten Durağı",
            "lat": 40.9765,
            "lon": 27.515
        },
        {
            "name": "Barış Manço Parkı",
            "lat": 40.981,
            "lon": 27.52
        },
        {
            "name": "Altınova Sahil Durağı",
            "lat": 40.962,
            "lon": 27.485
        },
        {
            "name": "Eski Otogar Kavşağı",
            "lat": 40.982,
            "lon": 27.518
        },
        {
            "name": "Cumhuriyet Meydanı",
            "lat": 40.977,
            "lon": 27.512
        },
        {
            "name": "Tekira AVM Durağı",
            "lat": 40.9815,
            "lon": 27.517
        },
        {
            "name": "Yüzüncü Yıl Mahallesi",
            "lat": 40.989,
            "lon": 27.505
        },
        {
            "name": "Hürriyet Mahallesi Parkı",
            "lat": 40.994,
            "lon": 27.575
        },
        {
            "name": "Tarihi Beşevler Durağı",
            "lat": 40.975,
            "lon": 27.509
        },
        {
            "name": "Atatürk Ormanı Girişi",
            "lat": 40.999,
            "lon": 27.55
        },
        {
            "name": "Gündoğdu Mahallesi Meydanı",
            "lat": 40.985,
            "lon": 27.528
        },
        {
            "name": "Yavuz Mahallesi Durağı",
            "lat": 40.987,
            "lon": 27.522
        },
        {
            "name": "Çınarlı Mahallesi Muhtarlık",
            "lat": 40.984,
            "lon": 27.508
        },
        {
            "name": "Aydoğdu Mahallesi",
            "lat": 40.979,
            "lon": 27.502
        },
        {
            "name": "Karadeniz Mahallesi",
            "lat": 40.996,
            "lon": 27.538
        },
        {
            "name": "Kumbağ Kavşağı",
            "lat": 40.955,
            "lon": 27.465
        },
        {
            "name": "Ortacami Durağı",
            "lat": 40.9755,
            "lon": 27.5115
        },
        {
            "name": "Çorlu Çevre Yolu Kavşağı",
            "lat": 41.155,
            "lon": 27.78
        },
        {
            "name": "Çorlu Otogar",
            "lat": 41.16,
            "lon": 27.8
        },
        {
            "name": "Çerkezköy Otogar",
            "lat": 41.285,
            "lon": 27.995
        },
        {
            "name": "Muratlı Meydan",
            "lat": 41.171,
            "lon": 27.502
        },
        {
            "name": "Velimeşe Meydan",
            "lat": 41.253,
            "lon": 27.899
        }
    ,
        {
            "name": "Velimeşe - 1 Durağı",
            "lat": 41.2505,
            "lon": 27.894
        }
    ,
        {
            "name": "Velimeşe Muhtarlık & Ek Hizmet Binası",
            "lat": 41.2525,
            "lon": 27.898
        }
    ,
        {
            "name": "Velimeşe Mustafa Kemal Atatürk Caddesi",
            "lat": 41.2515,
            "lon": 27.8965
        }
    ,
        {
            "name": "Velimeşe İstasyon & Tren Garı",
            "lat": 41.248,
            "lon": 27.893
        }
    ,
        {
            "name": "Velimeşe TOKİ Konutları",
            "lat": 41.256,
            "lon": 27.905
        }
    ,
        {
            "name": "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
            "lat": 41.2520,
            "lon": 27.8985
        },
        {
            "name": "Velimeşe Aile Sağlığı Merkezi",
            "lat": 41.2535,
            "lon": 27.9005
        }
    ,
        {
            "name": "Velimeşe İlkokulu & Ortaokulu",
            "lat": 41.254,
            "lon": 27.897
        }
    ,
        {
            "name": "Velimeşe M. Kemal Atatürk Stadyumu (Velimeşespor)",
            "lat": 41.257,
            "lon": 27.902
        }
    ,
        {
            "name": "Velimeşe Mezarlığı",
            "lat": 41.2465,
            "lon": 27.889
        }
    ,
        {
            "name": "Velimeşe Çerkezköy Yolu Durağı",
            "lat": 41.255,
            "lon": 27.908
        }
    ,
        {
            "name": "Velimeşe Bozdoğan Petrol & D-110 Kavşağı",
            "lat": 41.242,
            "lon": 27.88
        }
    ,
        {
            "name": "Velimeşe Gölet / Mesire Alanı",
            "lat": 41.258,
            "lon": 27.895
        }
    ],
    "Edirne": [
        {
            "name": "Edirne Şehirlerarası Otobüs Terminali",
            "lat": 41.65,
            "lon": 26.59
        },
        {
            "name": "Selimiye Camii Meydanı",
            "lat": 41.678,
            "lon": 26.5555
        },
        {
            "name": "Saraçlar Caddesi",
            "lat": 41.675,
            "lon": 26.554
        },
        {
            "name": "Trakya Üniversitesi Balkan Yerleşkesi",
            "lat": 41.642,
            "lon": 26.618
        },
        {
            "name": "Trakya Üniversitesi Tıp Fakültesi Hastanesi",
            "lat": 41.644,
            "lon": 26.615
        },
        {
            "name": "Tarihi Meriç Köprüsü",
            "lat": 41.661,
            "lon": 26.552
        },
        {
            "name": "Karaağaç Tarihi Tren Garı",
            "lat": 41.652,
            "lon": 26.527
        },
        {
            "name": "II. Bayezid Külliyesi Sağlık Müzesi",
            "lat": 41.685,
            "lon": 26.542
        },
        {
            "name": "Kırkpınar Er Meydanı Sarayiçi",
            "lat": 41.691,
            "lon": 26.558
        },
        {
            "name": "Bedesten Çarşısı",
            "lat": 41.6765,
            "lon": 26.5545
        },
        {
            "name": "Ali Paşa Çarşısı",
            "lat": 41.6755,
            "lon": 26.5535
        },
        {
            "name": "Eski Cami Durağı",
            "lat": 41.676,
            "lon": 26.556
        },
        {
            "name": "Üç Şerefeli Cami Durağı",
            "lat": 41.6775,
            "lon": 26.553
        },
        {
            "name": "Ayşekadın Durağı",
            "lat": 41.668,
            "lon": 26.565
        },
        {
            "name": "Şükrüpaşa Mahallesi",
            "lat": 41.672,
            "lon": 26.582
        },
        {
            "name": "Fatih Mahallesi",
            "lat": 41.665,
            "lon": 26.585
        },
        {
            "name": "Kocasinan Parkı",
            "lat": 41.669,
            "lon": 26.577
        },
        {
            "name": "Margi AVM Durağı",
            "lat": 41.666,
            "lon": 26.574
        },
        {
            "name": "Erasta AVM Durağı",
            "lat": 41.6675,
            "lon": 26.568
        },
        {
            "name": "Gazimihal Köprüsü",
            "lat": 41.679,
            "lon": 26.539
        },
        {
            "name": "Lozan Anıtı / Karaağaç",
            "lat": 41.6505,
            "lon": 26.524
        },
        {
            "name": "Muradiye Camii Durağı",
            "lat": 41.682,
            "lon": 26.563
        },
        {
            "name": "Kaleiçi Tarihi Konaklar",
            "lat": 41.673,
            "lon": 26.551
        },
        {
            "name": "Balkan Şehitliği Durağı",
            "lat": 41.689,
            "lon": 26.561
        },
        {
            "name": "Edirne Adliyesi Durağı",
            "lat": 41.663,
            "lon": 26.578
        },
        {
            "name": "İstasyon Mahallesi",
            "lat": 41.66,
            "lon": 26.571
        },
        {
            "name": "Barutluk Mahallesi",
            "lat": 41.683,
            "lon": 26.549
        },
        {
            "name": "Kıyık Caddesi",
            "lat": 41.684,
            "lon": 26.572
        },
        {
            "name": "Kapıkule Bağlantı Yolu",
            "lat": 41.698,
            "lon": 26.512
        },
        {
            "name": "Babademirtaş Mahallesi",
            "lat": 41.671,
            "lon": 26.547
        }
    ],
    "Kırklareli": [
        {
            "name": "Kırklareli Şehirlerarası Otogar",
            "lat": 41.731,
            "lon": 27.218
        },
        {
            "name": "Vilayet Meydanı / Hükümet Konağı",
            "lat": 41.735,
            "lon": 27.225
        },
        {
            "name": "Kırklareli Üniversitesi Kayalı Kampüsü",
            "lat": 41.785,
            "lon": 27.185
        },
        {
            "name": "Kırklareli Eğitim ve Araştırma Hastanesi",
            "lat": 41.728,
            "lon": 27.235
        },
        {
            "name": "İstasyon Caddesi",
            "lat": 41.733,
            "lon": 27.221
        },
        {
            "name": "Yayala Parkı",
            "lat": 41.738,
            "lon": 27.228
        },
        {
            "name": "Tarihi Hızırbey Camii (Büyük Cami)",
            "lat": 41.736,
            "lon": 27.224
        },
        {
            "name": "Arasta Çarşısı",
            "lat": 41.7355,
            "lon": 27.2235
        },
        {
            "name": "Bademlik Parkı",
            "lat": 41.741,
            "lon": 27.219
        },
        {
            "name": "Karahıdır Mahallesi",
            "lat": 41.719,
            "lon": 27.238
        },
        {
            "name": "Demirtaş Mahallesi",
            "lat": 41.737,
            "lon": 27.231
        },
        {
            "name": "Cumhuriyet Caddesi",
            "lat": 41.7345,
            "lon": 27.226
        },
        {
            "name": "Pınarhisar Yolu Kavşağı",
            "lat": 41.725,
            "lon": 27.242
        },
        {
            "name": "Babaeski Yolu Durağı",
            "lat": 41.72,
            "lon": 27.215
        },
        {
            "name": "Kırklareli Atatürk Stadyumu",
            "lat": 41.7325,
            "lon": 27.223
        },
        {
            "name": "Kırklareli Müzesi Meydanı",
            "lat": 41.7365,
            "lon": 27.2225
        },
        {
            "name": "Akalar Mahallesi",
            "lat": 41.7385,
            "lon": 27.2215
        },
        {
            "name": "Karacaibrahim Mahallesi",
            "lat": 41.734,
            "lon": 27.229
        },
        {
            "name": "Kocahıdır Mahallesi",
            "lat": 41.732,
            "lon": 27.228
        },
        {
            "name": "Kırklareli Fen Lisesi Durağı",
            "lat": 41.745,
            "lon": 27.21
        },
        {
            "name": "Dereköy Sınır Yolu Ayrımı",
            "lat": 41.751,
            "lon": 27.235
        },
        {
            "name": "Lüleburgaz Çevre Yolu Durağı",
            "lat": 41.715,
            "lon": 27.229
        },
        {
            "name": "Walldorf Kavşağı",
            "lat": 41.7285,
            "lon": 27.2195
        },
        {
            "name": "Paşa Kafe Parkı",
            "lat": 41.739,
            "lon": 27.226
        },
        {
            "name": "Askerlik Şubesi Durağı",
            "lat": 41.7375,
            "lon": 27.227
        },
        {
            "name": "Kırklareli Valiliği Ek Hizmet Binası",
            "lat": 41.7335,
            "lon": 27.224
        },
        {
            "name": "Sanayi Sitesi Durağı",
            "lat": 41.718,
            "lon": 27.241
        },
        {
            "name": "Eski Çarşı Durağı",
            "lat": 41.7358,
            "lon": 27.2245
        },
        {
            "name": "Karagöz Heykeli Meydanı",
            "lat": 41.7348,
            "lon": 27.2255
        },
        {
            "name": "Çamlık Tabiat Parkı",
            "lat": 41.748,
            "lon": 27.215
        }
    ],
    "İstanbul": [
        {
            "name": "Kadıköy Rıhtım İskele",
            "lat": 40.9915,
            "lon": 29.0225
        },
        {
            "name": "Kadıköy Boğa Heykeli",
            "lat": 40.9902,
            "lon": 29.029
        },
        {
            "name": "Moda Sahil Parkı",
            "lat": 40.9785,
            "lon": 29.026
        },
        {
            "name": "Altıyol Meydanı",
            "lat": 40.9905,
            "lon": 29.03
        },
        {
            "name": "Söğütlüçeşme Metrobüs & YHT İstasyonu",
            "lat": 40.992,
            "lon": 29.038
        },
        {
            "name": "Fenerbahçe Şükrü Saracoğlu Stadyumu",
            "lat": 40.988,
            "lon": 29.037
        },
        {
            "name": "Kalamış Marina Durağı",
            "lat": 40.979,
            "lon": 29.043
        },
        {
            "name": "Göztepe Parkı",
            "lat": 40.972,
            "lon": 29.061
        },
        {
            "name": "Bağdat Caddesi Suadiye",
            "lat": 40.963,
            "lon": 29.082
        },
        {
            "name": "Bostancı İskele Durağı",
            "lat": 40.953,
            "lon": 29.095
        },
        {
            "name": "Marmara Üniversitesi Göztepe Kampüsü",
            "lat": 40.986,
            "lon": 29.052
        },
        {
            "name": "Haydarpaşa Numune Eğitim Hastanesi",
            "lat": 41.002,
            "lon": 29.023
        },
        {
            "name": "Sultan 2. Abdülhamid Han Hastanesi",
            "lat": 41.004,
            "lon": 29.025
        },
        {
            "name": "Kozyatağı Metro İstasyonu",
            "lat": 40.975,
            "lon": 29.098
        },
        {
            "name": "Caddebostan Sahil Durağı",
            "lat": 40.968,
            "lon": 29.068
        },
        {
            "name": "Acıbadem Köprüsü",
            "lat": 41.0035,
            "lon": 29.044
        },
        {
            "name": "Ayrılık Çeşmesi Metro & Marmaray",
            "lat": 40.998,
            "lon": 29.031
        },
        {
            "name": "Fenerbahçe Feneri Parkı",
            "lat": 40.9695,
            "lon": 29.039
        },
        {
            "name": "Erenköy İstasyonu",
            "lat": 40.971,
            "lon": 29.079
        },
        {
            "name": "Kuyubaşı Durağı",
            "lat": 40.9875,
            "lon": 29.046
        },
        {
            "name": "Hasanpaşa Gazhane Müzesi",
            "lat": 40.996,
            "lon": 29.042
        },
        {
            "name": "Fikirtepe Metrobüs Durağı",
            "lat": 40.994,
            "lon": 29.051
        },
        {
            "name": "Bostancı Lunaparkı",
            "lat": 40.958,
            "lon": 29.092
        },
        {
            "name": "Çiftehavuzlar Durağı",
            "lat": 40.9725,
            "lon": 29.058
        },
        {
            "name": "Sahrayıcedit Cami Durağı",
            "lat": 40.981,
            "lon": 29.083
        },
        {
            "name": "Ziverbey Durağı",
            "lat": 40.989,
            "lon": 29.044
        },
        {
            "name": "Bahariye Caddesi",
            "lat": 40.9885,
            "lon": 29.032
        },
        {
            "name": "Moda Caddesi",
            "lat": 40.984,
            "lon": 29.028
        },
        {
            "name": "Dereağzı Tesisleri Durağı",
            "lat": 40.9815,
            "lon": 29.036
        },
        {
            "name": "Göztepe Köprüsü",
            "lat": 40.9895,
            "lon": 29.072
        },
        {
            "name": "Feneryolu İstasyonu",
            "lat": 40.982,
            "lon": 29.049
        },
        {
            "name": "Selamiçeşme Özgürlük Parkı",
            "lat": 40.9795,
            "lon": 29.055
        },
        {
            "name": "Koşuyolu Parkı",
            "lat": 41.009,
            "lon": 29.035
        },
        {
            "name": "Tepe Nautilus AVM Durağı",
            "lat": 40.9995,
            "lon": 29.0325
        },
        {
            "name": "Üsküdar İskele Meydanı",
            "lat": 41.026,
            "lon": 29.015
        }
    ],
    "Çanakkale": [
        {
            "name": "Çanakkale Şehirlerarası Otobüs Terminali",
            "lat": 40.138,
            "lon": 26.435
        },
        {
            "name": "Çanakkale İskele Meydanı",
            "lat": 40.151,
            "lon": 26.406
        },
        {
            "name": "Aynalı Çarşı Durağı",
            "lat": 40.1495,
            "lon": 26.408
        },
        {
            "name": "Çimenlik Kalesi / Deniz Müzesi",
            "lat": 40.147,
            "lon": 26.401
        },
        {
            "name": "Kordon Truva Atı Durağı",
            "lat": 40.153,
            "lon": 26.4085
        },
        {
            "name": "ÇOMÜ Terzioğlu Yerleşkesi",
            "lat": 40.112,
            "lon": 26.418
        },
        {
            "name": "Mehmet Akif Ersoy Devlet Hastanesi",
            "lat": 40.125,
            "lon": 26.432
        },
        {
            "name": "Halk Bahçesi Parkı",
            "lat": 40.148,
            "lon": 26.412
        },
        {
            "name": "Saat Kulesi Meydanı",
            "lat": 40.15,
            "lon": 26.4055
        },
        {
            "name": "Barbaros Mahallesi",
            "lat": 40.135,
            "lon": 26.415
        },
        {
            "name": "Cevatpaşa Durağı",
            "lat": 40.156,
            "lon": 26.418
        },
        {
            "name": "Esenler Mahallesi",
            "lat": 40.142,
            "lon": 26.425
        },
        {
            "name": "Kepez Meydan Durağı",
            "lat": 40.103,
            "lon": 26.405
        },
        {
            "name": "Kepez Liman Yolu",
            "lat": 40.098,
            "lon": 26.402
        },
        {
            "name": "Dardanos Sahil Kavşağı",
            "lat": 40.075,
            "lon": 26.368
        },
        {
            "name": "Güzelyalı Kavşağı",
            "lat": 40.042,
            "lon": 26.345
        },
        {
            "name": "Hamidiye Tabyaları Kültür Parkı",
            "lat": 40.136,
            "lon": 26.403
        },
        {
            "name": "ÇOMÜ Anafartalar Yerleşkesi",
            "lat": 40.145,
            "lon": 26.411
        },
        {
            "name": "Troya Caddesi AVM Durağı",
            "lat": 40.139,
            "lon": 26.422
        },
        {
            "name": "18 Mart Stadyumu Durağı",
            "lat": 40.1465,
            "lon": 26.414
        },
        {
            "name": "Atatürk Caddesi",
            "lat": 40.149,
            "lon": 26.413
        },
        {
            "name": "İnönü Caddesi",
            "lat": 40.1515,
            "lon": 26.41
        },
        {
            "name": "Demircioğlu Caddesi",
            "lat": 40.1485,
            "lon": 26.4075
        },
        {
            "name": "Kordon Sahil Yolu",
            "lat": 40.154,
            "lon": 26.407
        },
        {
            "name": "Boğaz Komutanlığı Durağı",
            "lat": 40.144,
            "lon": 26.402
        },
        {
            "name": "Hastanebayırı Durağı",
            "lat": 40.158,
            "lon": 26.421
        },
        {
            "name": "Sarıcaeli Kavşağı",
            "lat": 40.119,
            "lon": 26.441
        },
        {
            "name": "1915 Çanakkale Köprüsü Bağlantısı",
            "lat": 40.32,
            "lon": 26.63
        },
        {
            "name": "Gestaş İskele Girişi",
            "lat": 40.1505,
            "lon": 26.4045
        },
        {
            "name": "Valilik Binası Meydanı",
            "lat": 40.1498,
            "lon": 26.4065
        }
    ],
    "Ankara": [
        {
            "name": "AŞTİ Şehirlerarası Otobüs Terminali",
            "lat": 39.918,
            "lon": 32.812
        },
        {
            "name": "Kızılay Meydanı",
            "lat": 39.9208,
            "lon": 32.854
        },
        {
            "name": "Ulus Atatürk Heykeli",
            "lat": 39.9415,
            "lon": 32.8545
        },
        {
            "name": "Anıtkabir Durağı",
            "lat": 39.925,
            "lon": 32.836
        },
        {
            "name": "Güvenpark Durağı",
            "lat": 39.9195,
            "lon": 32.853
        },
        {
            "name": "Tunalı Hilmi Caddesi",
            "lat": 39.904,
            "lon": 32.86
        },
        {
            "name": "Kuğulu Park",
            "lat": 39.899,
            "lon": 32.862
        },
        {
            "name": "TBMM Çankaya Kapısı",
            "lat": 39.912,
            "lon": 32.851
        },
        {
            "name": "Hacettepe Üniversitesi Sıhhiye Kampüsü",
            "lat": 39.932,
            "lon": 32.863
        },
        {
            "name": "Ankara Şehir Hastanesi Bilkent",
            "lat": 39.889,
            "lon": 32.765
        },
        {
            "name": "ODTÜ A1 Kapısı Durağı",
            "lat": 39.901,
            "lon": 32.784
        },
        {
            "name": "Milli Kütüphane Durağı",
            "lat": 39.915,
            "lon": 32.828
        },
        {
            "name": "Sıhhiye Abdi İpekçi Parkı",
            "lat": 39.928,
            "lon": 32.856
        },
        {
            "name": "Atakule Meydanı",
            "lat": 39.886,
            "lon": 32.858
        },
        {
            "name": "Dikmen Vadisi Girişi",
            "lat": 39.892,
            "lon": 32.847
        },
        {
            "name": "Ankara Üniversitesi Tandoğan Kampüsü",
            "lat": 39.936,
            "lon": 32.831
        },
        {
            "name": "Gazi Üniversitesi Rektörlük Durağı",
            "lat": 39.938,
            "lon": 32.822
        },
        {
            "name": "Kocatepe Camii Meydanı",
            "lat": 39.9165,
            "lon": 32.8605
        },
        {
            "name": "Gençlik Parkı Girişi",
            "lat": 39.937,
            "lon": 32.849
        },
        {
            "name": "Ankara Yüksek Hızlı Tren Garı (ATG)",
            "lat": 39.935,
            "lon": 32.843
        },
        {
            "name": "Eski Meclis Binası (Kurtuluş Savaşı Müzesi)",
            "lat": 39.9425,
            "lon": 32.8535
        },
        {
            "name": "Hacı Bayram Veli Camii Meydanı",
            "lat": 39.944,
            "lon": 32.858
        },
        {
            "name": "Hamamönü Tarihi Evleri",
            "lat": 39.931,
            "lon": 32.868
        },
        {
            "name": "Bilkent Üniversitesi Girişi",
            "lat": 39.868,
            "lon": 32.748
        },
        {
            "name": "Armada AVM Durağı",
            "lat": 39.913,
            "lon": 32.809
        },
        {
            "name": "Söğütözü Metro İstasyonu",
            "lat": 39.911,
            "lon": 32.805
        },
        {
            "name": "Bakanlıklar Durağı",
            "lat": 39.914,
            "lon": 32.852
        },
        {
            "name": "Maltepe Pazarı Durağı",
            "lat": 39.927,
            "lon": 32.842
        },
        {
            "name": "Beşevler Metro Durağı",
            "lat": 39.931,
            "lon": 32.825
        },
        {
            "name": "Kurtuluş Parkı Durağı",
            "lat": 39.9275,
            "lon": 32.867
        },
        {
            "name": "Cebeci Siyasal Bilgiler Durağı",
            "lat": 39.934,
            "lon": 32.875
        },
        {
            "name": "Kolej Kavşağı",
            "lat": 39.923,
            "lon": 32.862
        },
        {
            "name": "Kuğulu Alt Geçit Durağı",
            "lat": 39.9015,
            "lon": 32.861
        },
        {
            "name": "Gaziosmanpaşa Meydanı",
            "lat": 39.897,
            "lon": 32.869
        },
        {
            "name": "Tunalı Pasajı Durağı",
            "lat": 40.906,
            "lon": 32.859
        }
    ]
};

// İlçe ve Beldeler Arası Sabit Hatlar (TEKULAŞ & Ekspres)
const ilceRotalari = {
    "Tekirdağ": [
                {
                  "id": "hat_26_suleymanpasa_saray",
                  "hatNo": "26",
                  "name": "26 SÜLEYMANPAŞA - ÇERKEZKÖY - KAPAKLI - SARAY",
                  "destDistrict": "Saray",
                  "originDistrict": "Süleymanpaşa",
                  "startStop": "Süleymanpaşa Yeni Otobüs Terminali",
                  "endStop": "Saray Belediyesi Otogarı",
                  "intermediateStops": [
                            "Muratlı Caddesi Trafo",
                            "Göçmen Konutları Giriş",
                            "Tekirdağ Büyükşehir Belediyesi Fen İşleri",
                            "Tekirdağ Şehir Hastanesi Acil",
                            "Ağız ve Diş Sağlığı Hastanesi",
                            "Tekirdağ Şehir Hastanesi Ana Giriş",
                            "Muratlı Caddesi / Soğancılar",
                            "Şehit Yüzbaşı Mayadağlı Caddesi",
                            "Yahya Kemal Beyatlı Kültür Merkezi",
                            "Fatih Sultan Mehmet Bulvarı (Baykallar)",
                            "Yeni Emniyet Müdürlüğü",
                            "Alkaya – Değirmenaltı Mevkii",
                            "Namık Kemal Üniversitesi (NKÜ) Kampüs Giriş / KYK Yurtları",
                            "NKÜ Araştırma Hastanesi & Rektörlük",
                            "D-110 Çevre Yolu Bağlar Mevkii",
                            "D-110 / D-567 Bağlantısı (Şerefli Kavşağı)",
                            "Çorlu Çevre Yolu Sapağı (Transit Geçiş)",
                            "Velimeşe Girişi (Sanayi Bağlantısı)",
                            "Velimeşe Sanayi Caddesi",
                            "Velimeşe Merkez Meydan",
                            "Veliköy Giriş",
                            "Veliköy Merkez",
                            "Veliköy Işıklar / OSB Bağlantısı",
                            "Kızılpınar Giriş",
                            "Kızılpınar Kahveler Durağı",
                            "Kızılpınar Merkez",
                            "Çerkezköy Narin Kavşağı",
                            "Çerkezköy Otogarı",
                            "Çerkezköy Şehir İçi Geçişi",
                            "Çerkezköy Belediyesi / Atatürk Caddesi",
                            "Çerkezköy Devlet Hastanesi Sapağı",
                            "Kapaklı Giriş / Yıldızkent Kavşağı",
                            "Kapaklı Belediyesi",
                            "Kapaklı Otogarı",
                            "Kapaklı Sanayi Kavşağı",
                            "Pınarça Sapağı",
                            "Büyükyoncalı Giriş",
                            "Büyükyoncalı Merkez (Belediye)",
                            "Yeniköy Kavşağı",
                            "Saray Çukuryurt Sapağı",
                            "Saray Meslek Yüksekokulu (Fakülte)"
                  ],
                  "desc": "Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Saray Belediyesi Otogarı. Güzergâh: Şehir Hastanesi, NKÜ Araştırma, Çorlu Çevre Yolu, Velimeşe, Veliköy, Kızılpınar, Çerkezköy, Kapaklı, Büyükyoncalı. Toplam 43 durak, ~86 km.",
                  "detailedInstructions": "TEKULAŞ 26 Numaralı Hat (Süleymanpaşa Yeni Otogar – Saray Otogar) Tam Güzergâh Adımları:\\n1. Adım: Süleymanpaşa Yeni Otobüs Terminali durağından bekleyen 40 yolcuyu alarak hareket edin.\\n2. Adım: 1.2 kilometre sonra Muratlı Caddesi Trafo durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n3. Adım: 0.9 kilometre sonra Göçmen Konutları Giriş durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n4. Adım: 0.8 kilometre sonra Tekirdağ Büyükşehir Belediyesi Fen İşleri durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n5. Adım: 0.7 kilometre sonra Tekirdağ Şehir Hastanesi Acil durağına gidin; yolcuları indirin ve bekleyen 6 yolcuyu alıp devam edin.\\n6. Adım: 0.5 kilometre sonra Ağız ve Diş Sağlığı Hastanesi durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n7. Adım: 0.4 kilometre sonra Tekirdağ Şehir Hastanesi Ana Giriş durağına gidin; yolcuları indirin ve bekleyen 8 yolcuyu alıp devam edin.\\n8. Adım: 1.1 kilometre sonra Muratlı Caddesi / Soğancılar durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n9. Adım: 0.8 kilometre sonra Şehit Yüzbaşı Mayadağlı Caddesi durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n10. Adım: 1 kilometre sonra Yahya Kemal Beyatlı Kültür Merkezi durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n11. Adım: 1.2 kilometre sonra Fatih Sultan Mehmet Bulvarı (Baykallar) durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\\n12. Adım: 1 kilometre sonra Yeni Emniyet Müdürlüğü durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n13. Adım: 1.2 kilometre sonra Alkaya – Değirmenaltı Mevkii durağına gidin; yolcuları indirin ve bekleyen 6 yolcuyu alıp devam edin.\\n14. Adım: 1.1 kilometre sonra Namık Kemal Üniversitesi (NKÜ) Kampüs Giriş / KYK Yurtları durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\\n15. Adım: 0.9 kilometre sonra NKÜ Araştırma Hastanesi & Rektörlük durağına gidin; yolcuları indirin ve bekleyen 8 yolcuyu alıp devam edin.\\n16. Adım: 8.5 kilometre sonra D-110 Çevre Yolu Bağlar Mevkii durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n17. Adım: 9.5 kilometre sonra D-110 / D-567 Bağlantısı (Şerefli Kavşağı) durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n18. Adım: 7 kilometre sonra Çorlu Çevre Yolu Sapağı (Transit Geçiş) durağına gidin; yolcuları indirin ve bekleyen 1 yolcuyu alıp devam edin.\\n19. Adım: 4 kilometre sonra Velimeşe Girişi (Sanayi Bağlantısı) durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n20. Adım: 1.5 kilometre sonra Velimeşe Sanayi Caddesi durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n21. Adım: 1.2 kilometre sonra Velimeşe Merkez Meydan durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n22. Adım: 2.5 kilometre sonra Veliköy Giriş durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n23. Adım: 1.2 kilometre sonra Veliköy Merkez durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n24. Adım: 1.1 kilometre sonra Veliköy Işıklar / OSB Bağlantısı durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n25. Adım: 2.2 kilometre sonra Kızılpınar Giriş durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n26. Adım: 1.1 kilometre sonra Kızılpınar Kahveler Durağı durağına gidin; yolcuları indirin ve bekleyen 6 yolcuyu alıp devam edin.\\n27. Adım: 1 kilometre sonra Kızılpınar Merkez durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\\n28. Adım: 3.5 kilometre sonra Çerkezköy Narin Kavşağı durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n29. Adım: 1.5 kilometre sonra Çerkezköy Otogarı durağına gidin; yolcuları indirin ve bekleyen 10 yolcuyu alıp devam edin.\\n30. Adım: 1.2 kilometre sonra Çerkezköy Şehir İçi Geçişi durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\\n31. Adım: 1 kilometre sonra Çerkezköy Belediyesi / Atatürk Caddesi durağına gidin; yolcuları indirin ve bekleyen 6 yolcuyu alıp devam edin.\\n32. Adım: 1.3 kilometre sonra Çerkezköy Devlet Hastanesi Sapağı durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n33. Adım: 2 kilometre sonra Kapaklı Giriş / Yıldızkent Kavşağı durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\\n34. Adım: 1.2 kilometre sonra Kapaklı Belediyesi durağına gidin; yolcuları indirin ve bekleyen 6 yolcuyu alıp devam edin.\\n35. Adım: 0.9 kilometre sonra Kapaklı Otogarı durağına gidin; yolcuları indirin ve bekleyen 8 yolcuyu alıp devam edin.\\n36. Adım: 1.4 kilometre sonra Kapaklı Sanayi Kavşağı durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n37. Adım: 2.5 kilometre sonra Pınarça Sapağı durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n38. Adım: 4.5 kilometre sonra Büyükyoncalı Giriş durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n39. Adım: 1.5 kilometre sonra Büyükyoncalı Merkez (Belediye) durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\\n40. Adım: 2 kilometre sonra Yeniköy Kavşağı durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\\n41. Adım: 3.5 kilometre sonra Saray Çukuryurt Sapağı durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\\n42. Adım: 2.5 kilometre sonra Saray Meslek Yüksekokulu (Fakülte) durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\\n43. Adım (Hedef Son Durak): 1.5 kilometre sonra hedef Saray Belediyesi Otogarı durağına gidin; tüm yolcuları indirin ve görevi başarıyla tamamlayın.",
                  "speechBriefing": "TEKULAŞ 26 No'lu Süleymanpaşa Çerkezköy Kapaklı Saray ekspres otobüs seferi. Kalkış: Süleymanpaşa Yeni Otobüs Terminali. Hedef son durak: Saray Belediyesi Otogarı. Toplam 43 durak ve 86 kilometre.",
                  "color": "#0284c7",
                  "otobusKapasitesi": 50,
                  "biletFiyat": 181,
                  "biletFiyatMultiplier": 2.8,
                  "isDistrict": true,
                  "terrain": "otoyol",
                  "stops": [
                            {
                                      "name": "Süleymanpaşa Yeni Otobüs Terminali",
                                      "anons": "Süleymanpaşa Yeni Otobüs Terminali kalkış peronundayız. TEKULAŞ 26 No'lu Süleymanpaşa Çerkezköy Kapaklı Saray seferimiz başlıyor.",
                                      "bekleyenYolcu": 40,
                                      "inenYolcu": 0,
                                      "gercekMesafeSonraki": 1.2,
                                      "lat": 40.995,
                                      "lon": 27.562
                            },
                            {
                                      "name": "Muratlı Caddesi Trafo",
                                      "anons": "Sonraki durak: Muratlı Caddesi Trafo.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 0.9,
                                      "lat": 40.991,
                                      "lon": 27.552
                            },
                            {
                                      "name": "Göçmen Konutları Giriş",
                                      "anons": "Sonraki durak: Göçmen Konutları Giriş.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 0.8,
                                      "lat": 40.989,
                                      "lon": 27.546
                            },
                            {
                                      "name": "Tekirdağ Büyükşehir Belediyesi Fen İşleri",
                                      "anons": "Sonraki durak: Tekirdağ Büyükşehir Belediyesi Fen İşleri.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 0.7,
                                      "lat": 40.9875,
                                      "lon": 27.541
                            },
                            {
                                      "name": "Tekirdağ Şehir Hastanesi Acil",
                                      "anons": "Sonraki durak: Tekirdağ Şehir Hastanesi Acil Servis.",
                                      "bekleyenYolcu": 6,
                                      "inenYolcu": 3,
                                      "gercekMesafeSonraki": 0.5,
                                      "lat": 40.988,
                                      "lon": 27.536
                            },
                            {
                                      "name": "Ağız ve Diş Sağlığı Hastanesi",
                                      "anons": "Sonraki durak: Ağız ve Diş Sağlığı Hastanesi.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 0.4,
                                      "lat": 40.9885,
                                      "lon": 27.534
                            },
                            {
                                      "name": "Tekirdağ Şehir Hastanesi Ana Giriş",
                                      "anons": "Sonraki durak: Tekirdağ Şehir Hastanesi Ana Giriş Poliklinikler.",
                                      "bekleyenYolcu": 8,
                                      "inenYolcu": 4,
                                      "gercekMesafeSonraki": 1.1,
                                      "lat": 40.987,
                                      "lon": 27.532
                            },
                            {
                                      "name": "Muratlı Caddesi / Soğancılar",
                                      "anons": "Sonraki durak: Muratlı Caddesi, Soğancılar mevkii.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 0.8,
                                      "lat": 40.984,
                                      "lon": 27.53
                            },
                            {
                                      "name": "Şehit Yüzbaşı Mayadağlı Caddesi",
                                      "anons": "Sonraki durak: Şehit Yüzbaşı Mayadağlı Caddesi.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 1,
                                      "lat": 40.9825,
                                      "lon": 27.527
                            },
                            {
                                      "name": "Yahya Kemal Beyatlı Kültür Merkezi",
                                      "anons": "Sonraki durak: Yahya Kemal Beyatlı Kültür Merkezi.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 1.2,
                                      "lat": 40.982,
                                      "lon": 27.525
                            },
                            {
                                      "name": "Fatih Sultan Mehmet Bulvarı (Baykallar)",
                                      "anons": "Sonraki durak: Fatih Sultan Mehmet Bulvarı, Baykallar mevkii.",
                                      "bekleyenYolcu": 5,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 1,
                                      "lat": 40.98,
                                      "lon": 27.545
                            },
                            {
                                      "name": "Yeni Emniyet Müdürlüğü",
                                      "anons": "Sonraki durak: Yeni Emniyet Müdürlüğü.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 1.2,
                                      "lat": 40.985,
                                      "lon": 27.56
                            },
                            {
                                      "name": "Alkaya – Değirmenaltı Mevkii",
                                      "anons": "Sonraki durak: Alkaya, Değirmenaltı mevkii.",
                                      "bekleyenYolcu": 6,
                                      "inenYolcu": 3,
                                      "gercekMesafeSonraki": 1.1,
                                      "lat": 40.991,
                                      "lon": 27.575
                            },
                            {
                                      "name": "Namık Kemal Üniversitesi (NKÜ) Kampüs Giriş / KYK Yurtları",
                                      "anons": "Sonraki durak: Namık Kemal Üniversitesi Kampüs Girişi ve KYK Yurtları.",
                                      "bekleyenYolcu": 5,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 0.9,
                                      "lat": 40.995,
                                      "lon": 27.583
                            },
                            {
                                      "name": "NKÜ Araştırma Hastanesi & Rektörlük",
                                      "anons": "Sonraki durak: Namık Kemal Üniversitesi Araştırma Hastanesi ve Rektörlük.",
                                      "bekleyenYolcu": 8,
                                      "inenYolcu": 5,
                                      "gercekMesafeSonraki": 8.5,
                                      "lat": 40.9975,
                                      "lon": 27.587
                            },
                            {
                                      "name": "D-110 Çevre Yolu Bağlar Mevkii",
                                      "anons": "Sonraki durak: D-110 Çevre Yolu, Bağlar mevkii.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 9.5,
                                      "lat": 41.065,
                                      "lon": 27.655
                            },
                            {
                                      "name": "D-110 / D-567 Bağlantısı (Şerefli Kavşağı)",
                                      "anons": "Sonraki durak: D-110 ve D-567 Bağlantısı, Şerefli Kavşağı.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 7,
                                      "lat": 41.135,
                                      "lon": 27.73
                            },
                            {
                                      "name": "Çorlu Çevre Yolu Sapağı (Transit Geçiş)",
                                      "anons": "Sonraki durak: Çorlu Çevre Yolu Transit Geçiş Kavşağı.",
                                      "bekleyenYolcu": 1,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 4,
                                      "lat": 41.155,
                                      "lon": 27.78
                            },
                            {
                                      "name": "Velimeşe Girişi (Sanayi Bağlantısı)",
                                      "anons": "Sonraki durak: Velimeşe Girişi, Organize Sanayi Bağlantısı.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 1.5,
                                      "lat": 41.245,
                                      "lon": 27.885
                            },
                            {
                                      "name": "Velimeşe Sanayi Caddesi",
                                      "anons": "Sonraki durak: Velimeşe Sanayi Caddesi.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 1.2,
                                      "lat": 41.249,
                                      "lon": 27.892
                            },
                            {
                                      "name": "Velimeşe Merkez Meydan",
                                      "anons": "Sonraki durak: Velimeşe Merkez Meydan.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 3,
                                      "gercekMesafeSonraki": 2.5,
                                      "lat": 41.253,
                                      "lon": 27.899
                            },
                            {
                                      "name": "Veliköy Giriş",
                                      "anons": "Sonraki durak: Veliköy Giriş.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 1.2,
                                      "lat": 41.261,
                                      "lon": 27.915
                            },
                            {
                                      "name": "Veliköy Merkez",
                                      "anons": "Sonraki durak: Veliköy Merkez.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 1.1,
                                      "lat": 41.265,
                                      "lon": 27.925
                            },
                            {
                                      "name": "Veliköy Işıklar / OSB Bağlantısı",
                                      "anons": "Sonraki durak: Veliköy Işıklar ve OSB Bağlantısı.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 2.2,
                                      "lat": 41.269,
                                      "lon": 27.938
                            },
                            {
                                      "name": "Kızılpınar Giriş",
                                      "anons": "Sonraki durak: Kızılpınar Giriş.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 1.1,
                                      "lat": 41.272,
                                      "lon": 27.952
                            },
                            {
                                      "name": "Kızılpınar Kahveler Durağı",
                                      "anons": "Sonraki durak: Kızılpınar Kahveler mevkii.",
                                      "bekleyenYolcu": 6,
                                      "inenYolcu": 3,
                                      "gercekMesafeSonraki": 1,
                                      "lat": 41.275,
                                      "lon": 27.965
                            },
                            {
                                      "name": "Kızılpınar Merkez",
                                      "anons": "Sonraki durak: Kızılpınar Merkez.",
                                      "bekleyenYolcu": 5,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 3.5,
                                      "lat": 41.278,
                                      "lon": 27.975
                            },
                            {
                                      "name": "Çerkezköy Narin Kavşağı",
                                      "anons": "Sonraki durak: Çerkezköy Narin Kavşağı.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 1.5,
                                      "lat": 41.282,
                                      "lon": 27.985
                            },
                            {
                                      "name": "Çerkezköy Otogarı",
                                      "anons": "Sonraki durak: Çerkezköy Otogarı.",
                                      "bekleyenYolcu": 10,
                                      "inenYolcu": 8,
                                      "gercekMesafeSonraki": 1.2,
                                      "lat": 41.285,
                                      "lon": 27.995
                            },
                            {
                                      "name": "Çerkezköy Şehir İçi Geçişi",
                                      "anons": "Sonraki durak: Çerkezköy Şehir İçi Geçişi.",
                                      "bekleyenYolcu": 5,
                                      "inenYolcu": 4,
                                      "gercekMesafeSonraki": 1,
                                      "lat": 41.289,
                                      "lon": 27.998
                            },
                            {
                                      "name": "Çerkezköy Belediyesi / Atatürk Caddesi",
                                      "anons": "Sonraki durak: Çerkezköy Belediyesi ve Atatürk Caddesi.",
                                      "bekleyenYolcu": 6,
                                      "inenYolcu": 5,
                                      "gercekMesafeSonraki": 1.3,
                                      "lat": 41.293,
                                      "lon": 27.992
                            },
                            {
                                      "name": "Çerkezköy Devlet Hastanesi Sapağı",
                                      "anons": "Sonraki durak: Çerkezköy Devlet Hastanesi Sapağı.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 3,
                                      "gercekMesafeSonraki": 2,
                                      "lat": 41.302,
                                      "lon": 27.988
                            },
                            {
                                      "name": "Kapaklı Giriş / Yıldızkent Kavşağı",
                                      "anons": "Sonraki durak: Kapaklı Giriş, Yıldızkent Kavşağı.",
                                      "bekleyenYolcu": 5,
                                      "inenYolcu": 3,
                                      "gercekMesafeSonraki": 1.2,
                                      "lat": 41.309,
                                      "lon": 27.984
                            },
                            {
                                      "name": "Kapaklı Belediyesi",
                                      "anons": "Sonraki durak: Kapaklı Belediyesi.",
                                      "bekleyenYolcu": 6,
                                      "inenYolcu": 4,
                                      "gercekMesafeSonraki": 0.9,
                                      "lat": 41.313,
                                      "lon": 27.981
                            },
                            {
                                      "name": "Kapaklı Otogarı",
                                      "anons": "Sonraki durak: Kapaklı Otogarı.",
                                      "bekleyenYolcu": 8,
                                      "inenYolcu": 6,
                                      "gercekMesafeSonraki": 1.4,
                                      "lat": 41.315,
                                      "lon": 27.98
                            },
                            {
                                      "name": "Kapaklı Sanayi Kavşağı",
                                      "anons": "Sonraki durak: Kapaklı Sanayi Kavşağı.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 2.5,
                                      "lat": 41.325,
                                      "lon": 27.975
                            },
                            {
                                      "name": "Pınarça Sapağı",
                                      "anons": "Sonraki durak: Pınarça Sapağı.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 1,
                                      "gercekMesafeSonraki": 4.5,
                                      "lat": 41.355,
                                      "lon": 27.965
                            },
                            {
                                      "name": "Büyükyoncalı Giriş",
                                      "anons": "Sonraki durak: Büyükyoncalı Giriş.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 1.5,
                                      "lat": 41.385,
                                      "lon": 27.958
                            },
                            {
                                      "name": "Büyükyoncalı Merkez (Belediye)",
                                      "anons": "Sonraki durak: Büyükyoncalı Merkez, Belediye Durağı.",
                                      "bekleyenYolcu": 5,
                                      "inenYolcu": 4,
                                      "gercekMesafeSonraki": 2,
                                      "lat": 41.39,
                                      "lon": 27.955
                            },
                            {
                                      "name": "Yeniköy Kavşağı",
                                      "anons": "Sonraki durak: Yeniköy Kavşağı.",
                                      "bekleyenYolcu": 2,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 3.5,
                                      "lat": 41.405,
                                      "lon": 27.945
                            },
                            {
                                      "name": "Saray Çukuryurt Sapağı",
                                      "anons": "Sonraki durak: Saray Çukuryurt Sapağı.",
                                      "bekleyenYolcu": 3,
                                      "inenYolcu": 2,
                                      "gercekMesafeSonraki": 2.5,
                                      "lat": 41.425,
                                      "lon": 27.938
                            },
                            {
                                      "name": "Saray Meslek Yüksekokulu (Fakülte)",
                                      "anons": "Sonraki durak: Saray Meslek Yüksekokulu Fakülte Durağı.",
                                      "bekleyenYolcu": 4,
                                      "inenYolcu": 6,
                                      "gercekMesafeSonraki": 1.5,
                                      "lat": 41.435,
                                      "lon": 27.93
                            },
                            {
                                      "name": "Saray Belediyesi Otogarı",
                                      "anons": "Son durak: Saray Belediyesi Otogarı. TEKULAŞ 26 No'lu Süleymanpaşa Saray seferimiz başarıyla tamamlanmıştır. Tüm yolcularımızın inmesi rica olunur.",
                                      "bekleyenYolcu": 0,
                                      "inenYolcu": 30,
                                      "gercekMesafeSonraki": 0,
                                      "lat": 41.445,
                                      "lon": 27.92
                            }
                  ]
        },
        {
        "id": "hat_velimese_cetin_ring",
        "hatNo": "48/R",
        "name": "48/R VELİMEŞE ÇETİN SOKAK RİNG HATTI",
        "destDistrict": "Velimeşe",
        "originDistrict": "Velimeşe",
        "startStop": "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
        "endStop": "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
        "intermediateStops": [
                "Velimeşe Merkez Meydan",
                "Velimeşe Muhtarlık & Ek Hizmet Binası",
                "Velimeşe İstasyon & Tren Garı",
                "Velimeşe Sanayi Caddesi",
                "Velimeşe TOKİ Konutları",
                "Velimeşe Aile Sağlığı Merkezi"
        ],
        "totalKm": 5.8,
        "biletFiyat": 20,
        "biletFiyatMultiplier": 1,
        "otobusKapasitesi": 32,
        "terrain": "Şehir İçi / Mahalle",
        "seferSuresi": "18 Dk",
        "desc": "Kalkış: Velimeşe Çetin Sokak ➔ Velimeşe Merkez Meydan ➔ Tren Garı ➔ Sanayi ➔ TOKİ ➔ Çetin Sokak Mahalle İçi Ring Seferi. Toplam 7 durak, 5.8 km.",
        "detailedInstructions": "TEKULAŞ 48/R Velimeşe Çetin Sokak Ring Hattı Görev Adımları:\n1. Adım: Velimeşe Çetin Sokak (Dedebal Kavşağı) durağından bekleyen 20 yolcuyu alarak hareket edin.\n2. Adım: 0.5 kilometre sonra Velimeşe Merkez Meydan durağına gidin; yolcuları indirin ve bekleyen 8 yolcuyu alıp devam edin.\n3. Adım: 0.6 kilometre sonra Velimeşe Muhtarlık & Ek Hizmet Binası durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\n4. Adım: 0.8 kilometre sonra Velimeşe İstasyon & Tren Garı durağına gidin; yolcuları indirin ve bekleyen 6 yolcuyu alıp devam edin.\n5. Adım: 1.1 kilometre sonra Velimeşe Sanayi Caddesi durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\n6. Adım: 1.4 kilometre sonra Velimeşe TOKİ Konutları durağına gidin; yolcuları indirin ve bekleyen 7 yolcuyu alıp devam edin.\n7. Adım: 0.9 kilometre sonra Velimeşe Aile Sağlığı Merkezi durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\n8. Adım (Hedef Son Durak): 0.5 kilometre sonra ringi tamamlayarak Velimeşe Çetin Sokak (Dedebal Kavşağı) durağına varın; tüm yolcuları indirin ve seferi başarıyla tamamlayın.",
        "speechBriefing": "TEKULAŞ 48/R Velimeşe Çetin Sokak Mahalle Ring seferi. Kalkış ve varış durağınız: Velimeşe Çetin Sokak. Güzergâh: Merkez Meydan, Tren Garı, Sanayi, TOKİ ve Sağlık Ocağı. Toplam 7 durak ve 5.8 kilometre. İyi yolculuklar kaptan.",
        "stops": [
                {
                        "name": "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
                        "anons": "Velimeşe Çetin Sokak Dedebal Kavşağı kalkış durağındayız. 48 Taksim R Mahalle İçi Ring seferimiz başlıyor.",
                        "bekleyenYolcu": 20,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 0.5,
                        "lat": 41.252,
                        "lon": 27.8985
                },
                {
                        "name": "Velimeşe Merkez Meydan",
                        "anons": "Sonraki durak: Velimeşe Merkez Meydan, Atatürk Heykeli.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 0.6,
                        "lat": 41.253,
                        "lon": 27.899
                },
                {
                        "name": "Velimeşe Muhtarlık & Ek Hizmet Binası",
                        "anons": "Sonraki durak: Velimeşe Muhtarlık ve Belediye Ek Hizmet Binası.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 0.8,
                        "lat": 41.2525,
                        "lon": 27.898
                },
                {
                        "name": "Velimeşe İstasyon & Tren Garı",
                        "anons": "Sonraki durak: Velimeşe İstasyon ve TCDD Tren Garı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 1.1,
                        "lat": 41.248,
                        "lon": 27.893
                },
                {
                        "name": "Velimeşe Sanayi Caddesi",
                        "anons": "Sonraki durak: Velimeşe Sanayi Caddesi.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 1.4,
                        "lat": 41.249,
                        "lon": 27.892
                },
                {
                        "name": "Velimeşe TOKİ Konutları",
                        "anons": "Sonraki durak: Velimeşe TOKİ Konutları.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 0.9,
                        "lat": 41.258,
                        "lon": 27.905
                },
                {
                        "name": "Velimeşe Aile Sağlığı Merkezi",
                        "anons": "Sonraki durak: Velimeşe Aile Sağlığı Merkezi, Sağlık Ocağı.",
                        "bekleyenYolcu": 3,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 0.5,
                        "lat": 41.2535,
                        "lon": 27.9005
                },
                {
                        "name": "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
                        "anons": "Son durak: Velimeşe Çetin Sokak. 48 Taksim R Mahalle İçi Ring seferimiz tamamlanmıştır. Tüm yolcularımızın inmesi rica olunur.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 25,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.252,
                        "lon": 27.8985
                }
        ]
},
        {
        "id": "hat_48_velimese_corlu",
        "hatNo": "48",
        "name": "48 VELİMEŞE - ÇORLU",
        "destDistrict": "Çorlu",
        "originDistrict": "Velimeşe",
        "startStop": "Velimeşe TOKİ Konutları",
        "endStop": "Çorlu Otogar",
        "intermediateStops": [
                "Velimeşe M. Kemal Atatürk Stadyumu (Velimeşespor)",
                "Velimeşe Aile Sağlığı Merkezi",
                "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
                "Velimeşe Merkez Meydan",
                "Velimeşe Muhtarlık & Ek Hizmet Binası",
                "Velimeşe Mustafa Kemal Atatürk Caddesi",
                "Velimeşe İlkokulu & Ortaokulu",
                "Velimeşe İstasyon & Tren Garı",
                "Velimeşe - 1 Durağı",
                "Velimeşe Sanayi Caddesi",
                "Velimeşe Mezarlığı",
                "Velimeşe Girişi (Sanayi Bağlantısı)",
                "Velimeşe Bozdoğan Petrol & D-110 Kavşağı",
                "Çorlu Çevre Yolu Otogar Kavşağı"
        ],
        "desc": "Kalkış: Velimeşe TOKİ Konutları ➔ Varış: Çorlu Otogar. Güzergâh: Velimeşe Çetin Sokak, Dedebal Kavşağı, Velimeşe Merkez, Atatürk Caddesi, Tren İstasyonu, Velimeşe-1, Sanayi Caddesi, Bozdoğan Petrol, Çorlu Çevre Yolu. Toplam 15 durak, ~19 km.",
        "detailedInstructions": "TEKULAŞ 48 Numaralı Hat (Velimeşe – Çorlu) Görev Adımları:\n1. Adım: Velimeşe TOKİ Konutları durağından bekleyen 25 yolcuyu alarak hareket edin.\n2. Adım: 0.8 kilometre sonra Velimeşe Mustafa Kemal Atatürk Stadyumu durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\n3. Adım: 0.7 kilometre sonra Velimeşe Aile Sağlığı Merkezi durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\n4. Adım: 0.5 kilometre sonra Velimeşe Merkez Meydan durağına gidin; yolcuları indirin ve bekleyen 8 yolcuyu alıp devam edin.\n5. Adım: 0.4 kilometre sonra Velimeşe Muhtarlık & Ek Hizmet Binası durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\n6. Adım: 0.4 kilometre sonra Velimeşe Mustafa Kemal Atatürk Caddesi durağına gidin; yolcuları indirin ve bekleyen 5 yolcuyu alıp devam edin.\n7. Adım: 0.6 kilometre sonra Velimeşe İlkokulu & Ortaokulu durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\n8. Adım: 0.7 kilometre sonra Velimeşe İstasyon & Tren Garı durağına gidin; yolcuları indirin ve bekleyen 6 yolcuyu alıp devam edin.\n9. Adım: 0.5 kilometre sonra Velimeşe - 1 Durağı durağına gidin; yolcuları indirin ve bekleyen 10 yolcuyu alıp devam edin.\n10. Adım: 0.8 kilometre sonra Velimeşe Sanayi Caddesi durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\n11. Adım: 0.9 kilometre sonra Velimeşe Mezarlığı durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\n12. Adım: 1.2 kilometre sonra Velimeşe Girişi durağına gidin; yolcuları indirin ve bekleyen 3 yolcuyu alıp devam edin.\n13. Adım: 1.5 kilometre sonra Velimeşe Bozdoğan Petrol & D-110 Kavşağı durağına gidin; yolcuları indirin ve bekleyen 2 yolcuyu alıp devam edin.\n14. Adım: 7.5 kilometre sonra Çorlu Çevre Yolu Otogar Kavşağı durağına gidin; yolcuları indirin ve bekleyen 4 yolcuyu alıp devam edin.\n15. Adım (Hedef Son Durak): 2 kilometre sonra hedef Çorlu Otogar durağına gidin; tüm yolcuları indirin ve görevi başarıyla tamamlayın.",
        "speechBriefing": "TEKULAŞ 48 No'lu Velimeşe Çorlu seferi. Kalkış: Velimeşe TOKİ Konutları. Hedef son durak: Çorlu Otogar. Toplam 15 durak ve 19 kilometre.",
        "color": "#10b981",
        "otobusKapasitesi": 40,
        "biletFiyat": 45,
        "biletFiyatMultiplier": 1.8,
        "isDistrict": true,
        "terrain": "asfalt",
        "stops": [
                {
                        "name": "Velimeşe TOKİ Konutları",
                        "anons": "Velimeşe TOKİ Konutları kalkış peronundayız. 48 No'lu Çorlu seferimiz başlıyor.",
                        "bekleyenYolcu": 25,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 0.8,
                        "lat": 41.256,
                        "lon": 27.905
                },
                {
                        "name": "Velimeşe M. Kemal Atatürk Stadyumu (Velimeşespor)",
                        "anons": "Sonraki durak: Velimeşe Mustafa Kemal Atatürk Stadyumu ve Ergene Velimeşespor Tesisleri.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 1,
                        "gercekMesafeSonraki": 0.7,
                        "lat": 41.257,
                        "lon": 27.902
                },
                {
                        "name": "Velimeşe Aile Sağlığı Merkezi",
                        "anons": "Sonraki durak: Velimeşe Aile Sağlığı Merkezi, Sağlık Ocağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 0.5,
                        "lat": 41.2535,
                        "lon": 27.9005
                },
                {
                        "name": "Velimeşe Merkez Meydan",
                        "anons": "Sonraki durak: Velimeşe Merkez Meydan, Atatürk Heykeli.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 0.4,
                        "lat": 41.253,
                        "lon": 27.899
                },
                {
                        "name": "Velimeşe Muhtarlık & Ek Hizmet Binası",
                        "anons": "Sonraki durak: Velimeşe Muhtarlık ve Belediye Ek Hizmet Binası.",
                        "bekleyenYolcu": 3,
                        "inenYolcu": 1,
                        "gercekMesafeSonraki": 0.4,
                        "lat": 41.2525,
                        "lon": 27.898
                },
                {
                        "name": "Velimeşe Mustafa Kemal Atatürk Caddesi",
                        "anons": "Sonraki durak: Velimeşe Mustafa Kemal Atatürk Caddesi Çarşı Durağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 0.6,
                        "lat": 41.2515,
                        "lon": 27.8965
                },
                {
                        "name": "Velimeşe İlkokulu & Ortaokulu",
                        "anons": "Sonraki durak: Velimeşe İlkokulu ve Ortaokulu.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 0.7,
                        "lat": 41.254,
                        "lon": 27.897
                },
                {
                        "name": "Velimeşe İstasyon & Tren Garı",
                        "anons": "Sonraki durak: Velimeşe İstasyon ve TCDD Tren Garı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 0.5,
                        "lat": 41.248,
                        "lon": 27.893
                },
                {
                        "name": "Velimeşe - 1 Durağı",
                        "anons": "Sonraki durak: Velimeşe - 1 Durağı (Durak Kodu 1058).",
                        "bekleyenYolcu": 10,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 0.8,
                        "lat": 41.2505,
                        "lon": 27.894
                },
                {
                        "name": "Velimeşe Sanayi Caddesi",
                        "anons": "Sonraki durak: Velimeşe Sanayi Caddesi.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 0.9,
                        "lat": 41.249,
                        "lon": 27.892
                },
                {
                        "name": "Velimeşe Mezarlığı",
                        "anons": "Sonraki durak: Velimeşe Mezarlığı.",
                        "bekleyenYolcu": 2,
                        "inenYolcu": 1,
                        "gercekMesafeSonraki": 1.2,
                        "lat": 41.2465,
                        "lon": 27.889
                },
                {
                        "name": "Velimeşe Girişi (Sanayi Bağlantısı)",
                        "anons": "Sonraki durak: Velimeşe Girişi, Organize Sanayi Bağlantısı.",
                        "bekleyenYolcu": 3,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 1.5,
                        "lat": 41.245,
                        "lon": 27.885
                },
                {
                        "name": "Velimeşe Bozdoğan Petrol & D-110 Kavşağı",
                        "anons": "Sonraki durak: Velimeşe Bozdoğan Petrol ve D-110 Kavşağı.",
                        "bekleyenYolcu": 2,
                        "inenYolcu": 1,
                        "gercekMesafeSonraki": 7.5,
                        "lat": 41.242,
                        "lon": 27.88
                },
                {
                        "name": "Çorlu Çevre Yolu Otogar Kavşağı",
                        "anons": "Sonraki durak: Çorlu Çevre Yolu Otogar Kavşağı.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 8,
                        "gercekMesafeSonraki": 2,
                        "lat": 41.155,
                        "lon": 27.78
                },
                {
                        "name": "Çorlu Otogar",
                        "anons": "Son durak: Çorlu Otogar. 48 No'lu Velimeşe Çorlu seferimiz tamamlanmıştır. Tüm yolcularımızın inmesi rica olunur.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 38,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.16,
                        "lon": 27.8
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
                { name: "Süleymanpaşa Yeni Otobüs Terminali", anons: "Süleymanpaşa Yeni Otogar kalkış peronundayız. Çorlu Ekspres seferi başlıyor.", bekleyenYolcu: 30, inenYolcu: 0, gercekMesafeSonraki: 4.5, lat: 40.9950, lon: 27.5620 },
                { name: "Tekirdağ Şehir Hastanesi", anons: "Sonraki durak: Tekirdağ Şehir Hastanesi.", bekleyenYolcu: 8, inenYolcu: 4, gercekMesafeSonraki: 33.5, lat: 40.9880, lon: 27.5350 },
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
                { name: "Süleymanpaşa Yeni Otobüs Terminali", anons: "Süleymanpaşa Yeni Otogar kalkış peronundayız. Çerkezköy seferi başlıyor.", bekleyenYolcu: 32, inenYolcu: 0, gercekMesafeSonraki: 62.0, lat: 40.9950, lon: 27.5620 },
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


// Geriye dönük rota kimliği uyumluluğu (Alias desteği)
if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
    const r26 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "26");
    if (r26) {
        ilceRotalari["Tekirdağ"].push(Object.assign({}, r26, { id: "hat_26_suleymanpasa_velimese" }));
    }
}

/* TEKULAŞ_ALL_LINES_INTEGRATION */
// TEKİRDAĞ TEKULAŞ 183 HAT VE 3.913 GERÇEK DURAK ENTEGRASYONU
if (typeof window !== 'undefined' && window.tekulasHatVeritabani && Array.isArray(window.tekulasHatVeritabani)) {
    if (typeof ilceRotalari !== 'undefined') {
        if (!ilceRotalari["Tekirdağ"]) ilceRotalari["Tekirdağ"] = [];
        const existingHatIds = new Set(ilceRotalari["Tekirdağ"].map(r => r.id));

        window.tekulasHatVeritabani.forEach(route => {
            // routesData havuzuna doğrudan ekle
            if (typeof routesData !== 'undefined') {
                routesData[route.id] = route;
            }
            // İlçe rotaları listesine ekle
            if (!existingHatIds.has(route.id)) {
                existingHatIds.add(route.id);
                ilceRotalari["Tekirdağ"].push(route);
            }
        });

        // Geriye dönük rota kimliği uyumluluğu (Alias)
        const r26 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "26");
        if (r26 && typeof routesData !== 'undefined') {
            routesData["hat_26_suleymanpasa_saray"] = r26;
            routesData["hat_26_suleymanpasa_velimese"] = r26;
        }
        const r48 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "48");
        if (r48 && typeof routesData !== 'undefined') {
            routesData["hat_48_velimese_corlu"] = r48;
        const rRing = ilceRotalari["Tekirdağ"].find(r => r.id === "hat_velimese_cetin_ring");
        if (rRing && typeof routesData !== "undefined") routesData["hat_velimese_cetin_ring"] = rRing;
        }
        const r2_7 = ilceRotalari["Tekirdağ"].find(r => r.id === "tekulas_152_2_7");
        const r2_7_donus = ilceRotalari["Tekirdağ"].find(r => r.id === "tekulas_152_2_7_donus");
        if (r2_7 && typeof routesData !== 'undefined') {
            routesData["hat_2_7"] = r2_7;
            routesData["hat_2_7_gidis"] = r2_7;
        }
        if (r2_7_donus && typeof routesData !== 'undefined') {
            routesData["hat_2_7_donus"] = r2_7_donus;
        }
    }
}

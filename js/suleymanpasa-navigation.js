/* ==========================================================================
   SÜLEYMANPAŞA MAHALLE VE SOKAK NAVİGASYON MOTORU
   Geodezik Haversine, Kentsel Viraj Topografyası (Kw),
   Deterministik Ara Durak ve Sefer Süresi Formülleri
   ========================================================================== */

const SuleymanpasaNavigasyon = {
    veritabani: {
  "mahalleler": {
    "Değirmenaltı Mahallesi": {
      "center": {
        "lat": 40.9985,
        "lon": 27.585
      },
      "terrain": "sahil_kampus",
      "kwFactor": 1.3,
      "sokaklar": [
        {
          "name": "Değirmenaltı Caddesi",
          "lat": 40.998,
          "lon": 27.583,
          "cat": "Ana Cadde"
        },
        {
          "name": "Üniversite Caddesi",
          "lat": 40.9995,
          "lon": 27.588,
          "cat": "Ana Cadde"
        },
        {
          "name": "Namık Kemal Üniversitesi Kampüs İçi Yolu",
          "lat": 41.002,
          "lon": 27.591,
          "cat": "Kampüs Ana Arter"
        },
        {
          "name": "Tıp Fakültesi Hastanesi Caddesi",
          "lat": 41.004,
          "lon": 27.593,
          "cat": "Sağlık Aksı"
        },
        {
          "name": "KYK Yurtlar Caddesi",
          "lat": 41.001,
          "lon": 27.5895,
          "cat": "Öğrenci Aksı"
        },
        {
          "name": "Yelken Sokak",
          "lat": 40.996,
          "lon": 27.5815,
          "cat": "Sahil Sokağı"
        },
        {
          "name": "Martı Sokak",
          "lat": 40.9972,
          "lon": 27.5828,
          "cat": "Sokak"
        },
        {
          "name": "Deniz Sokak",
          "lat": 40.9968,
          "lon": 27.584,
          "cat": "Sokak"
        },
        {
          "name": "Akasya Sokak",
          "lat": 40.999,
          "lon": 27.5855,
          "cat": "Sokak"
        },
        {
          "name": "Kardelen Sokak",
          "lat": 41.0002,
          "lon": 27.587,
          "cat": "Sokak"
        },
        {
          "name": "İskele Meydanı Durağı",
          "lat": 40.995,
          "lon": 27.58,
          "cat": "Meydan / Durak"
        },
        {
          "name": "Sosyal Yaşam Merkezi",
          "lat": 40.9988,
          "lon": 27.5862,
          "cat": "Sosyal Merkez"
        }
      ]
    },
    "Hürriyet Mahallesi": {
      "center": {
        "lat": 40.988,
        "lon": 27.545
      },
      "terrain": "plato_modern",
      "kwFactor": 1.35,
      "sokaklar": [
        {
          "name": "Fatih Sultan Mehmet Bulvarı",
          "lat": 40.9875,
          "lon": 27.542,
          "cat": "Bulvar"
        },
        {
          "name": "Şehit Yüzbaşı Mayadağlı Caddesi",
          "lat": 40.989,
          "lon": 27.548,
          "cat": "Ana Cadde"
        },
        {
          "name": "Necip Fazıl Kısakürek Caddesi",
          "lat": 40.991,
          "lon": 27.551,
          "cat": "Ana Cadde"
        },
        {
          "name": "Yahya Kemal Beyatlı Kültür Merkezi Caddesi",
          "lat": 40.986,
          "lon": 27.539,
          "cat": "Kültür Aksı"
        },
        {
          "name": "Yeni Emniyet Müdürlüğü Caddesi",
          "lat": 40.9895,
          "lon": 27.5465,
          "cat": "Kamu Aksı"
        },
        {
          "name": "Baykallar Meydanı",
          "lat": 40.987,
          "lon": 27.544,
          "cat": "Meydan"
        },
        {
          "name": "Barış Manço Sokak",
          "lat": 40.9885,
          "lon": 27.5435,
          "cat": "Sokak"
        },
        {
          "name": "Sümbül Sokak",
          "lat": 40.9898,
          "lon": 27.5455,
          "cat": "Sokak"
        },
        {
          "name": "Leylak Sokak",
          "lat": 40.9905,
          "lon": 27.5475,
          "cat": "Sokak"
        },
        {
          "name": "Menekşe Sokak",
          "lat": 40.9878,
          "lon": 27.549,
          "cat": "Sokak"
        },
        {
          "name": "Kent Park Giriş Sokak",
          "lat": 40.9855,
          "lon": 27.541,
          "cat": "Park / Yaşam"
        },
        {
          "name": "Hürriyet Sağlık Ocağı Sokak",
          "lat": 40.9915,
          "lon": 27.5495,
          "cat": "Sağlık Aksı"
        }
      ]
    },
    "100. Yıl Mahallesi": {
      "center": {
        "lat": 40.982,
        "lon": 27.518
      },
      "terrain": "tepe_yerlesim",
      "kwFactor": 1.42,
      "sokaklar": [
        {
          "name": "Uğur Mumcu Caddesi",
          "lat": 40.983,
          "lon": 27.515,
          "cat": "Ana Cadde"
        },
        {
          "name": "İsmail Yazıcı Caddesi",
          "lat": 40.981,
          "lon": 27.52,
          "cat": "Ana Cadde"
        },
        {
          "name": "Ekrem Tantı Caddesi",
          "lat": 40.9845,
          "lon": 27.522,
          "cat": "Ana Cadde"
        },
        {
          "name": "Okullar Bölgesi Caddesi",
          "lat": 40.986,
          "lon": 27.524,
          "cat": "Eğitim Aksı"
        },
        {
          "name": "Zeki Biçer Caddesi",
          "lat": 40.9795,
          "lon": 27.517,
          "cat": "Cadde"
        },
        {
          "name": "Güneş Sokak",
          "lat": 40.9825,
          "lon": 27.5165,
          "cat": "Sokak"
        },
        {
          "name": "Yıldız Sokak",
          "lat": 40.9815,
          "lon": 27.5185,
          "cat": "Sokak"
        },
        {
          "name": "Barış Sokak",
          "lat": 40.9838,
          "lon": 27.5195,
          "cat": "Sokak"
        },
        {
          "name": "Özgürlük Sokak",
          "lat": 40.985,
          "lon": 27.521,
          "cat": "Sokak"
        },
        {
          "name": "100. Yıl Kapalı Pazaryeri Durağı",
          "lat": 40.9805,
          "lon": 27.519,
          "cat": "Ticaret / Yaşam"
        },
        {
          "name": "Gençlik Merkezi Yolu",
          "lat": 40.984,
          "lon": 27.523,
          "cat": "Sosyal Tesis"
        },
        {
          "name": "Sanayi Sitesi Batı Girişi",
          "lat": 40.978,
          "lon": 27.514,
          "cat": "Sanayi Bağlantı"
        }
      ]
    },
    "Altınova Mahallesi": {
      "center": {
        "lat": 40.972,
        "lon": 27.495
      },
      "terrain": "sahil_otogar",
      "kwFactor": 1.32,
      "sokaklar": [
        {
          "name": "Gazi Hasan Paşa Caddesi",
          "lat": 40.973,
          "lon": 27.492,
          "cat": "Ana Cadde"
        },
        {
          "name": "Yeni Otogar Caddesi (Terminal Yolu)",
          "lat": 40.97,
          "lon": 27.488,
          "cat": "Terminal Ana Giriş"
        },
        {
          "name": "Sahil Boyu Caddesi",
          "lat": 40.971,
          "lon": 27.498,
          "cat": "Sahil Yolu"
        },
        {
          "name": "İsmet İnönü Bulvarı Bağlantısı",
          "lat": 40.9745,
          "lon": 27.495,
          "cat": "Bulvar"
        },
        {
          "name": "Liman Yolu Caddesi",
          "lat": 40.969,
          "lon": 27.501,
          "cat": "Liman Aksı"
        },
        {
          "name": "Sancak Sokak",
          "lat": 40.9725,
          "lon": 27.4935,
          "cat": "Sokak"
        },
        {
          "name": "Pruva Sokak",
          "lat": 40.9715,
          "lon": 27.496,
          "cat": "Sokak"
        },
        {
          "name": "Dümen Sokak",
          "lat": 40.9705,
          "lon": 27.4975,
          "cat": "Sokak"
        },
        {
          "name": "Derya Sokak",
          "lat": 40.9738,
          "lon": 27.494,
          "cat": "Sokak"
        },
        {
          "name": "Altınova Balıkçı Barınağı Durağı",
          "lat": 40.968,
          "lon": 27.502,
          "cat": "Kıyı Yaşam"
        },
        {
          "name": "Süleymanpaşa Yeni Otobüs Terminali Peronlar",
          "lat": 40.9695,
          "lon": 27.487,
          "cat": "Ulaşım Merkezi"
        }
      ]
    },
    "Çınarlı & Çiftlikönü Mahallesi": {
      "center": {
        "lat": 40.978,
        "lon": 27.51
      },
      "terrain": "tarihi_merkez",
      "kwFactor": 1.38,
      "sokaklar": [
        {
          "name": "Hükümet Caddesi (Süleymanpaşa Tarihi Valilik & Çarşı)",
          "lat": 40.977,
          "lon": 27.512,
          "cat": "Tarihi Ana Arter"
        },
        {
          "name": "Muratlı Caddesi",
          "lat": 40.979,
          "lon": 27.508,
          "cat": "Ana Arter"
        },
        {
          "name": "Soğancılar Caddesi",
          "lat": 40.9805,
          "lon": 27.506,
          "cat": "Cadde"
        },
        {
          "name": "Köprübaşı Meydanı Caddesi",
          "lat": 40.976,
          "lon": 27.514,
          "cat": "Meydan / Merkez"
        },
        {
          "name": "Eski Otogar Caddesi",
          "lat": 40.975,
          "lon": 27.51,
          "cat": "Merkez Ulaşım"
        },
        {
          "name": "Bedesten Çarşısı Sokak",
          "lat": 40.9765,
          "lon": 27.5115,
          "cat": "Ticaret Aksı"
        },
        {
          "name": "Rüstem Paşa Külliyesi Yolu",
          "lat": 40.9755,
          "lon": 27.513,
          "cat": "Tarihi Kültür"
        },
        {
          "name": "Çiftlikönü Huzurevi Caddesi",
          "lat": 40.9815,
          "lon": 27.504,
          "cat": "Sosyal Aks"
        },
        {
          "name": "Şehit Astsubay Turgut Kurtçu Sokak",
          "lat": 40.9785,
          "lon": 27.5095,
          "cat": "Sokak"
        },
        {
          "name": "Zübeyde Hanım Parkı Durağı",
          "lat": 40.9775,
          "lon": 27.5075,
          "cat": "Park / Durak"
        }
      ]
    },
    "Aydoğdu & Zafer Mahallesi": {
      "center": {
        "lat": 40.992,
        "lon": 27.525
      },
      "terrain": "saglik_kamu",
      "kwFactor": 1.36,
      "sokaklar": [
        {
          "name": "Tekirdağ Şehir Hastanesi Bulvarı",
          "lat": 40.995,
          "lon": 27.528,
          "cat": "Sağlık Bulvarı"
        },
        {
          "name": "Şehir Hastanesi Acil Giriş Caddesi",
          "lat": 40.996,
          "lon": 27.53,
          "cat": "Acil Aksı"
        },
        {
          "name": "Ağız ve Diş Sağlığı Hastanesi Caddesi",
          "lat": 40.994,
          "lon": 27.526,
          "cat": "Sağlık Aksı"
        },
        {
          "name": "Göçmen Konutları Ana Caddesi",
          "lat": 40.99,
          "lon": 27.522,
          "cat": "Konut Aksı"
        },
        {
          "name": "Tekirdağ Büyükşehir Belediyesi Fen İşleri Caddesi",
          "lat": 40.9915,
          "lon": 27.524,
          "cat": "Kamu Aksı"
        },
        {
          "name": "Aydoğdu Merkez Caddesi",
          "lat": 40.988,
          "lon": 27.52,
          "cat": "Cadde"
        },
        {
          "name": "Zafer Park Sokak",
          "lat": 40.993,
          "lon": 27.5255,
          "cat": "Sokak"
        },
        {
          "name": "Sağlık Yaşam Sokak",
          "lat": 40.9955,
          "lon": 27.529,
          "cat": "Sokak"
        }
      ]
    },
    "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)": {
      "center": {
        "lat": 40.973,
        "lon": 27.518
      },
      "terrain": "sahil_kordon",
      "kwFactor": 1.28,
      "sokaklar": [
        {
          "name": "Atatürk Bulvarı (Kordon Boyu)",
          "lat": 40.972,
          "lon": 27.517,
          "cat": "Sahil Kordon"
        },
        {
          "name": "Tekirdağ Valiliği Önü Caddesi",
          "lat": 40.974,
          "lon": 27.516,
          "cat": "Kamu Meydanı"
        },
        {
          "name": "Barış ve Özgürlük Parkı Yolu",
          "lat": 40.971,
          "lon": 27.519,
          "cat": "Park Yaşam"
        },
        {
          "name": "Tekirdağ Liman Başkanlığı Caddesi",
          "lat": 40.9695,
          "lon": 27.515,
          "cat": "Liman / Kıyı"
        },
        {
          "name": "Hasan Ali Yücel Meydanı",
          "lat": 40.9735,
          "lon": 27.5185,
          "cat": "Kültür Meydanı"
        },
        {
          "name": "Rakoczi Müzesi Tarihi Sokak",
          "lat": 40.975,
          "lon": 27.5175,
          "cat": "Tarihi Sokak"
        },
        {
          "name": "Namık Kemal Evi Sokak",
          "lat": 40.9755,
          "lon": 27.5168,
          "cat": "Tarihi Sokak"
        }
      ]
    }
  },
  "sokaklar": [
    {
      "id": "spasa_sokak_1",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Değirmenaltı Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.998,
      "lon": 27.583,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Değirmenaltı Caddesi."
    },
    {
      "id": "spasa_sokak_2",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Üniversite Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.9995,
      "lon": 27.588,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Üniversite Caddesi."
    },
    {
      "id": "spasa_sokak_3",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Namık Kemal Üniversitesi Kampüs İçi Yolu",
      "cat": "Kampüs Ana Arter",
      "lat": 41.002,
      "lon": 27.591,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Namık Kemal Üniversitesi Kampüs İçi Yolu."
    },
    {
      "id": "spasa_sokak_4",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Tıp Fakültesi Hastanesi Caddesi",
      "cat": "Sağlık Aksı",
      "lat": 41.004,
      "lon": 27.593,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Tıp Fakültesi Hastanesi Caddesi."
    },
    {
      "id": "spasa_sokak_5",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "KYK Yurtlar Caddesi",
      "cat": "Öğrenci Aksı",
      "lat": 41.001,
      "lon": 27.5895,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, KYK Yurtlar Caddesi."
    },
    {
      "id": "spasa_sokak_6",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Yelken Sokak",
      "cat": "Sahil Sokağı",
      "lat": 40.996,
      "lon": 27.5815,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Yelken Sokak."
    },
    {
      "id": "spasa_sokak_7",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Martı Sokak",
      "cat": "Sokak",
      "lat": 40.9972,
      "lon": 27.5828,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Martı Sokak."
    },
    {
      "id": "spasa_sokak_8",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Deniz Sokak",
      "cat": "Sokak",
      "lat": 40.9968,
      "lon": 27.584,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Deniz Sokak."
    },
    {
      "id": "spasa_sokak_9",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Akasya Sokak",
      "cat": "Sokak",
      "lat": 40.999,
      "lon": 27.5855,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Akasya Sokak."
    },
    {
      "id": "spasa_sokak_10",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Kardelen Sokak",
      "cat": "Sokak",
      "lat": 41.0002,
      "lon": 27.587,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Kardelen Sokak."
    },
    {
      "id": "spasa_sokak_11",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "İskele Meydanı Durağı",
      "cat": "Meydan / Durak",
      "lat": 40.995,
      "lon": 27.58,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, İskele Meydanı Durağı."
    },
    {
      "id": "spasa_sokak_12",
      "mahalle": "Değirmenaltı Mahallesi",
      "name": "Sosyal Yaşam Merkezi",
      "cat": "Sosyal Merkez",
      "lat": 40.9988,
      "lon": 27.5862,
      "kwFactor": 1.3,
      "anons": "Sonraki durak: Değirmenaltı Mahallesi, Sosyal Yaşam Merkezi."
    },
    {
      "id": "spasa_sokak_13",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Fatih Sultan Mehmet Bulvarı",
      "cat": "Bulvar",
      "lat": 40.9875,
      "lon": 27.542,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Fatih Sultan Mehmet Bulvarı."
    },
    {
      "id": "spasa_sokak_14",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Şehit Yüzbaşı Mayadağlı Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.989,
      "lon": 27.548,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Şehit Yüzbaşı Mayadağlı Caddesi."
    },
    {
      "id": "spasa_sokak_15",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Necip Fazıl Kısakürek Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.991,
      "lon": 27.551,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Necip Fazıl Kısakürek Caddesi."
    },
    {
      "id": "spasa_sokak_16",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Yahya Kemal Beyatlı Kültür Merkezi Caddesi",
      "cat": "Kültür Aksı",
      "lat": 40.986,
      "lon": 27.539,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Yahya Kemal Beyatlı Kültür Merkezi Caddesi."
    },
    {
      "id": "spasa_sokak_17",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Yeni Emniyet Müdürlüğü Caddesi",
      "cat": "Kamu Aksı",
      "lat": 40.9895,
      "lon": 27.5465,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Yeni Emniyet Müdürlüğü Caddesi."
    },
    {
      "id": "spasa_sokak_18",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Baykallar Meydanı",
      "cat": "Meydan",
      "lat": 40.987,
      "lon": 27.544,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Baykallar Meydanı."
    },
    {
      "id": "spasa_sokak_19",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Barış Manço Sokak",
      "cat": "Sokak",
      "lat": 40.9885,
      "lon": 27.5435,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Barış Manço Sokak."
    },
    {
      "id": "spasa_sokak_20",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Sümbül Sokak",
      "cat": "Sokak",
      "lat": 40.9898,
      "lon": 27.5455,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Sümbül Sokak."
    },
    {
      "id": "spasa_sokak_21",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Leylak Sokak",
      "cat": "Sokak",
      "lat": 40.9905,
      "lon": 27.5475,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Leylak Sokak."
    },
    {
      "id": "spasa_sokak_22",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Menekşe Sokak",
      "cat": "Sokak",
      "lat": 40.9878,
      "lon": 27.549,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Menekşe Sokak."
    },
    {
      "id": "spasa_sokak_23",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Kent Park Giriş Sokak",
      "cat": "Park / Yaşam",
      "lat": 40.9855,
      "lon": 27.541,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Kent Park Giriş Sokak."
    },
    {
      "id": "spasa_sokak_24",
      "mahalle": "Hürriyet Mahallesi",
      "name": "Hürriyet Sağlık Ocağı Sokak",
      "cat": "Sağlık Aksı",
      "lat": 40.9915,
      "lon": 27.5495,
      "kwFactor": 1.35,
      "anons": "Sonraki durak: Hürriyet Mahallesi, Hürriyet Sağlık Ocağı Sokak."
    },
    {
      "id": "spasa_sokak_25",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Uğur Mumcu Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.983,
      "lon": 27.515,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Uğur Mumcu Caddesi."
    },
    {
      "id": "spasa_sokak_26",
      "mahalle": "100. Yıl Mahallesi",
      "name": "İsmail Yazıcı Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.981,
      "lon": 27.52,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, İsmail Yazıcı Caddesi."
    },
    {
      "id": "spasa_sokak_27",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Ekrem Tantı Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.9845,
      "lon": 27.522,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Ekrem Tantı Caddesi."
    },
    {
      "id": "spasa_sokak_28",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Okullar Bölgesi Caddesi",
      "cat": "Eğitim Aksı",
      "lat": 40.986,
      "lon": 27.524,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Okullar Bölgesi Caddesi."
    },
    {
      "id": "spasa_sokak_29",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Zeki Biçer Caddesi",
      "cat": "Cadde",
      "lat": 40.9795,
      "lon": 27.517,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Zeki Biçer Caddesi."
    },
    {
      "id": "spasa_sokak_30",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Güneş Sokak",
      "cat": "Sokak",
      "lat": 40.9825,
      "lon": 27.5165,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Güneş Sokak."
    },
    {
      "id": "spasa_sokak_31",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Yıldız Sokak",
      "cat": "Sokak",
      "lat": 40.9815,
      "lon": 27.5185,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Yıldız Sokak."
    },
    {
      "id": "spasa_sokak_32",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Barış Sokak",
      "cat": "Sokak",
      "lat": 40.9838,
      "lon": 27.5195,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Barış Sokak."
    },
    {
      "id": "spasa_sokak_33",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Özgürlük Sokak",
      "cat": "Sokak",
      "lat": 40.985,
      "lon": 27.521,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Özgürlük Sokak."
    },
    {
      "id": "spasa_sokak_34",
      "mahalle": "100. Yıl Mahallesi",
      "name": "100. Yıl Kapalı Pazaryeri Durağı",
      "cat": "Ticaret / Yaşam",
      "lat": 40.9805,
      "lon": 27.519,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, 100. Yıl Kapalı Pazaryeri Durağı."
    },
    {
      "id": "spasa_sokak_35",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Gençlik Merkezi Yolu",
      "cat": "Sosyal Tesis",
      "lat": 40.984,
      "lon": 27.523,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Gençlik Merkezi Yolu."
    },
    {
      "id": "spasa_sokak_36",
      "mahalle": "100. Yıl Mahallesi",
      "name": "Sanayi Sitesi Batı Girişi",
      "cat": "Sanayi Bağlantı",
      "lat": 40.978,
      "lon": 27.514,
      "kwFactor": 1.42,
      "anons": "Sonraki durak: 100. Yıl Mahallesi, Sanayi Sitesi Batı Girişi."
    },
    {
      "id": "spasa_sokak_37",
      "mahalle": "Altınova Mahallesi",
      "name": "Gazi Hasan Paşa Caddesi",
      "cat": "Ana Cadde",
      "lat": 40.973,
      "lon": 27.492,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Gazi Hasan Paşa Caddesi."
    },
    {
      "id": "spasa_sokak_38",
      "mahalle": "Altınova Mahallesi",
      "name": "Yeni Otogar Caddesi (Terminal Yolu)",
      "cat": "Terminal Ana Giriş",
      "lat": 40.97,
      "lon": 27.488,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Yeni Otogar Caddesi (Terminal Yolu)."
    },
    {
      "id": "spasa_sokak_39",
      "mahalle": "Altınova Mahallesi",
      "name": "Sahil Boyu Caddesi",
      "cat": "Sahil Yolu",
      "lat": 40.971,
      "lon": 27.498,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Sahil Boyu Caddesi."
    },
    {
      "id": "spasa_sokak_40",
      "mahalle": "Altınova Mahallesi",
      "name": "İsmet İnönü Bulvarı Bağlantısı",
      "cat": "Bulvar",
      "lat": 40.9745,
      "lon": 27.495,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, İsmet İnönü Bulvarı Bağlantısı."
    },
    {
      "id": "spasa_sokak_41",
      "mahalle": "Altınova Mahallesi",
      "name": "Liman Yolu Caddesi",
      "cat": "Liman Aksı",
      "lat": 40.969,
      "lon": 27.501,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Liman Yolu Caddesi."
    },
    {
      "id": "spasa_sokak_42",
      "mahalle": "Altınova Mahallesi",
      "name": "Sancak Sokak",
      "cat": "Sokak",
      "lat": 40.9725,
      "lon": 27.4935,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Sancak Sokak."
    },
    {
      "id": "spasa_sokak_43",
      "mahalle": "Altınova Mahallesi",
      "name": "Pruva Sokak",
      "cat": "Sokak",
      "lat": 40.9715,
      "lon": 27.496,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Pruva Sokak."
    },
    {
      "id": "spasa_sokak_44",
      "mahalle": "Altınova Mahallesi",
      "name": "Dümen Sokak",
      "cat": "Sokak",
      "lat": 40.9705,
      "lon": 27.4975,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Dümen Sokak."
    },
    {
      "id": "spasa_sokak_45",
      "mahalle": "Altınova Mahallesi",
      "name": "Derya Sokak",
      "cat": "Sokak",
      "lat": 40.9738,
      "lon": 27.494,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Derya Sokak."
    },
    {
      "id": "spasa_sokak_46",
      "mahalle": "Altınova Mahallesi",
      "name": "Altınova Balıkçı Barınağı Durağı",
      "cat": "Kıyı Yaşam",
      "lat": 40.968,
      "lon": 27.502,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Altınova Balıkçı Barınağı Durağı."
    },
    {
      "id": "spasa_sokak_47",
      "mahalle": "Altınova Mahallesi",
      "name": "Süleymanpaşa Yeni Otobüs Terminali Peronlar",
      "cat": "Ulaşım Merkezi",
      "lat": 40.9695,
      "lon": 27.487,
      "kwFactor": 1.32,
      "anons": "Sonraki durak: Altınova Mahallesi, Süleymanpaşa Yeni Otobüs Terminali Peronlar."
    },
    {
      "id": "spasa_sokak_48",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Hükümet Caddesi (Süleymanpaşa Tarihi Valilik & Çarşı)",
      "cat": "Tarihi Ana Arter",
      "lat": 40.977,
      "lon": 27.512,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Süleymanpaşa Hükümet Caddesi, Tarihi Valilik ve Çarşı aksı."
    },
    {
      "id": "spasa_sokak_49",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Muratlı Caddesi",
      "cat": "Ana Arter",
      "lat": 40.979,
      "lon": 27.508,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Muratlı Caddesi."
    },
    {
      "id": "spasa_sokak_50",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Soğancılar Caddesi",
      "cat": "Cadde",
      "lat": 40.9805,
      "lon": 27.506,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Soğancılar Caddesi."
    },
    {
      "id": "spasa_sokak_51",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Köprübaşı Meydanı Caddesi",
      "cat": "Meydan / Merkez",
      "lat": 40.976,
      "lon": 27.514,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Köprübaşı Meydanı Caddesi."
    },
    {
      "id": "spasa_sokak_52",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Eski Otogar Caddesi",
      "cat": "Merkez Ulaşım",
      "lat": 40.975,
      "lon": 27.51,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Eski Otogar Caddesi."
    },
    {
      "id": "spasa_sokak_53",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Bedesten Çarşısı Sokak",
      "cat": "Ticaret Aksı",
      "lat": 40.9765,
      "lon": 27.5115,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Bedesten Çarşısı Sokak."
    },
    {
      "id": "spasa_sokak_54",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Rüstem Paşa Külliyesi Yolu",
      "cat": "Tarihi Kültür",
      "lat": 40.9755,
      "lon": 27.513,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Rüstem Paşa Külliyesi Yolu."
    },
    {
      "id": "spasa_sokak_55",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Çiftlikönü Huzurevi Caddesi",
      "cat": "Sosyal Aks",
      "lat": 40.9815,
      "lon": 27.504,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Çiftlikönü Huzurevi Caddesi."
    },
    {
      "id": "spasa_sokak_56",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Şehit Astsubay Turgut Kurtçu Sokak",
      "cat": "Sokak",
      "lat": 40.9785,
      "lon": 27.5095,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Şehit Astsubay Turgut Kurtçu Sokak."
    },
    {
      "id": "spasa_sokak_57",
      "mahalle": "Çınarlı & Çiftlikönü Mahallesi",
      "name": "Zübeyde Hanım Parkı Durağı",
      "cat": "Park / Durak",
      "lat": 40.9775,
      "lon": 27.5075,
      "kwFactor": 1.38,
      "anons": "Sonraki durak: Çınarlı & Çiftlikönü Mahallesi, Zübeyde Hanım Parkı Durağı."
    },
    {
      "id": "spasa_sokak_58",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Tekirdağ Şehir Hastanesi Bulvarı",
      "cat": "Sağlık Bulvarı",
      "lat": 40.995,
      "lon": 27.528,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Tekirdağ Şehir Hastanesi Bulvarı."
    },
    {
      "id": "spasa_sokak_59",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Şehir Hastanesi Acil Giriş Caddesi",
      "cat": "Acil Aksı",
      "lat": 40.996,
      "lon": 27.53,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Şehir Hastanesi Acil Giriş Caddesi."
    },
    {
      "id": "spasa_sokak_60",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Ağız ve Diş Sağlığı Hastanesi Caddesi",
      "cat": "Sağlık Aksı",
      "lat": 40.994,
      "lon": 27.526,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Ağız ve Diş Sağlığı Hastanesi Caddesi."
    },
    {
      "id": "spasa_sokak_61",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Göçmen Konutları Ana Caddesi",
      "cat": "Konut Aksı",
      "lat": 40.99,
      "lon": 27.522,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Göçmen Konutları Ana Caddesi."
    },
    {
      "id": "spasa_sokak_62",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Tekirdağ Büyükşehir Belediyesi Fen İşleri Caddesi",
      "cat": "Kamu Aksı",
      "lat": 40.9915,
      "lon": 27.524,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Tekirdağ Büyükşehir Belediyesi Fen İşleri Caddesi."
    },
    {
      "id": "spasa_sokak_63",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Aydoğdu Merkez Caddesi",
      "cat": "Cadde",
      "lat": 40.988,
      "lon": 27.52,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Aydoğdu Merkez Caddesi."
    },
    {
      "id": "spasa_sokak_64",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Zafer Park Sokak",
      "cat": "Sokak",
      "lat": 40.993,
      "lon": 27.5255,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Zafer Park Sokak."
    },
    {
      "id": "spasa_sokak_65",
      "mahalle": "Aydoğdu & Zafer Mahallesi",
      "name": "Sağlık Yaşam Sokak",
      "cat": "Sokak",
      "lat": 40.9955,
      "lon": 27.529,
      "kwFactor": 1.36,
      "anons": "Sonraki durak: Aydoğdu & Zafer Mahallesi, Sağlık Yaşam Sokak."
    },
    {
      "id": "spasa_sokak_66",
      "mahalle": "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)",
      "name": "Atatürk Bulvarı (Kordon Boyu)",
      "cat": "Sahil Kordon",
      "lat": 40.972,
      "lon": 27.517,
      "kwFactor": 1.28,
      "anons": "Sonraki durak: Ertuğrul & Yavuz Mahallesi (Sahil Dolgu), Atatürk Bulvarı (Kordon Boyu)."
    },
    {
      "id": "spasa_sokak_67",
      "mahalle": "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)",
      "name": "Tekirdağ Valiliği Önü Caddesi",
      "cat": "Kamu Meydanı",
      "lat": 40.974,
      "lon": 27.516,
      "kwFactor": 1.28,
      "anons": "Sonraki durak: Ertuğrul & Yavuz Mahallesi (Sahil Dolgu), Tekirdağ Valiliği Önü Caddesi."
    },
    {
      "id": "spasa_sokak_68",
      "mahalle": "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)",
      "name": "Barış ve Özgürlük Parkı Yolu",
      "cat": "Park Yaşam",
      "lat": 40.971,
      "lon": 27.519,
      "kwFactor": 1.28,
      "anons": "Sonraki durak: Ertuğrul & Yavuz Mahallesi (Sahil Dolgu), Barış ve Özgürlük Parkı Yolu."
    },
    {
      "id": "spasa_sokak_69",
      "mahalle": "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)",
      "name": "Tekirdağ Liman Başkanlığı Caddesi",
      "cat": "Liman / Kıyı",
      "lat": 40.9695,
      "lon": 27.515,
      "kwFactor": 1.28,
      "anons": "Sonraki durak: Ertuğrul & Yavuz Mahallesi (Sahil Dolgu), Tekirdağ Liman Başkanlığı Caddesi."
    },
    {
      "id": "spasa_sokak_70",
      "mahalle": "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)",
      "name": "Hasan Ali Yücel Meydanı",
      "cat": "Kültür Meydanı",
      "lat": 40.9735,
      "lon": 27.5185,
      "kwFactor": 1.28,
      "anons": "Sonraki durak: Ertuğrul & Yavuz Mahallesi (Sahil Dolgu), Hasan Ali Yücel Meydanı."
    },
    {
      "id": "spasa_sokak_71",
      "mahalle": "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)",
      "name": "Rakoczi Müzesi Tarihi Sokak",
      "cat": "Tarihi Sokak",
      "lat": 40.975,
      "lon": 27.5175,
      "kwFactor": 1.28,
      "anons": "Sonraki durak: Ertuğrul & Yavuz Mahallesi (Sahil Dolgu), Rakoczi Müzesi Tarihi Sokak."
    },
    {
      "id": "spasa_sokak_72",
      "mahalle": "Ertuğrul & Yavuz Mahallesi (Sahil Dolgu)",
      "name": "Namık Kemal Evi Sokak",
      "cat": "Tarihi Sokak",
      "lat": 40.9755,
      "lon": 27.5168,
      "kwFactor": 1.28,
      "anons": "Sonraki durak: Ertuğrul & Yavuz Mahallesi (Sahil Dolgu), Namık Kemal Evi Sokak."
    }
  ]
},
    
    // Dünyanın ortalama yarıçapı (IUGG WGS-84 R1 standardı - km)
    R_DUNYA: 6371.0088,

    normalizeText: function(text) {
        if (!text) return '';
        return text
            .replace(/İ/g, 'i')
            .replace(/I/g, 'i')
            .replace(/ı/g, 'i')
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * 1. FORMÜL: Geodezik Haversine Mesafesi (Kuş uçuşu d0 - KM)
     */
    hesaplaKusUcusuKm: function(lat1, lon1, lat2, lon2) {
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaPhi = (lat2 - lat1) * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return this.R_DUNYA * c;
    },

    /**
     * 2. FORMÜL: Kentsel Yol ve Topoğrafya Kıvrım Katsayısı (Kw) ile Gerçek Yol Mesafesi
     */
    hesaplaGercekYolKm: function(s1, s2) {
        if (!s1 || !s2) return 0.5;
        const d0 = this.hesaplaKusUcusuKm(s1.lat, s1.lon, s2.lat, s2.lon);
        // Ortalama topoğrafya katsayısı Kw (1.28 sahil kordon - 1.42 yokuş tepe)
        const kw1 = s1.kwFactor || 1.35;
        const kw2 = s2.kwFactor || 1.35;
        const kw = (kw1 + kw2) / 2;

        const dyol = d0 * kw;
        // Minimum sokak geçişi 0.25 km, 1 ondalık hassasiyet
        return Math.max(0.25, Math.round(dyol * 10) / 10);
    },

    /**
     * 3. FORMÜL: Sefer Süresi Formülü (Dakika)
     * Şehir içi ortalama hız V = 26 km/s + her ara durak için 1.2 dk dur-kalk payı
     */
    hesaplaSeferSuresiDk: function(totalKm, stopCount) {
        const vOrtalama = 26; // km/s
        const surusSuresiDk = (totalKm / vOrtalama) * 60;
        const durakBeklemeDk = Math.max(0, stopCount - 1) * 1.2;
        return Math.max(3, Math.round(surusSuresiDk + durakBeklemeDk));
    },

    /**
     * 4. FORMÜL: Bilet Ücreti Formülü (TL)
     * Taban = 22.00 TL, KM başına +1.50 TL
     */
    hesaplaBiletUcretiTL: function(totalKm) {
        return 22 + Math.round(totalKm * 1.5);
    },

    findSokak: function(query, mahalleFiltre) {
        if (!query) return null;
        const qNorm = this.normalizeText(query);
        if (qNorm.length === 0) return null;

        const havuz = this.veritabani.sokaklar.filter(s => {
            if (!mahalleFiltre || mahalleFiltre === 'TÜMÜ') return true;
            return s.mahalle === mahalleFiltre;
        });

        // 1. Tam eşleşme
        let match = havuz.find(s => this.normalizeText(s.name) === qNorm);
        if (match) return match;

        // 2. Popüler takma adlar
        if (qNorm.includes("kampus") || qNorm.includes("universite") || qNorm.includes("nku")) {
            match = havuz.find(s => s.name.includes("Kampüs") || s.name.includes("Üniversite"));
            if (match) return match;
        }
        if (qNorm.includes("hastane") || qNorm.includes("sehir hastanesi")) {
            match = havuz.find(s => s.name.includes("Şehir Hastanesi"));
            if (match) return match;
        }
        if (qNorm.includes("otogar") || qNorm.includes("terminal")) {
            match = havuz.find(s => s.name.includes("Yeni Otobüs Terminali") || s.name.includes("Terminal Yolu"));
            if (match) return match;
        }
        if (qNorm.includes("meydan") || qNorm.includes("valilik")) {
            match = havuz.find(s => s.name.includes("Valiliği") || s.name.includes("Meydanı"));
            if (match) return match;
        }
        if (qNorm.includes("kordon") || qNorm.includes("sahil")) {
            match = havuz.find(s => s.name.includes("Kordon") || s.name.includes("Sahil Boyu"));
            if (match) return match;
        }

        // 3. Kelime alt dize eşleşmesi
        const qWords = qNorm.split(' ').filter(w => w.length > 1);
        match = havuz.find(s => {
            const sNorm = this.normalizeText(s.name);
            return qWords.every(w => sNorm.includes(w));
        });
        if (match) return match;

        // 4. İçerme
        return havuz.find(s => this.normalizeText(s.name).includes(qNorm)) || null;
    },

    getMahalleler: function() {
        return Object.keys(this.veritabani.mahalleler);
    },

    getMahalleSokaklari: function(mahalleAdi) {
        if (!mahalleAdi || !this.veritabani.mahalleler[mahalleAdi]) return [];
        return this.veritabani.sokaklar.filter(s => s.mahalle === mahalleAdi);
    },

    /**
     * Ara sokakları coğrafi vektör ve minimum sapma formülüyle seçer
     */
    /**
     * Vektörel Projeksiyon Formülü ile Gerçekçi İlerleyen Ara Durak Seçimi:
     * P noktasının A->B doğrusu üzerindeki t ilerleme parametresi (0 < t < 1)
     * ve d_perp (doğruya olan dikey sapma) hesaplanır.
     */
    araDuraklariSec: function(startSokak, endSokak, totalKm) {
        const stopCount = Math.max(1, Math.min(5, Math.round(totalKm / 1.5)));
        const dx = endSokak.lon - startSokak.lon;
        const dy = endSokak.lat - startSokak.lat;
        const lineLenSq = dx * dx + dy * dy;

        if (lineLenSq === 0) return [];

        const candidatesWithT = [];
        this.veritabani.sokaklar.forEach(s => {
            if (s.id === startSokak.id || s.id === endSokak.id) return;
            // Projeksiyon faktörü t = ((P - A) . (B - A)) / |B - A|^2
            const px = s.lon - startSokak.lon;
            const py = s.lat - startSokak.lat;
            const t = (px * dx + py * dy) / lineLenSq;

            // Sadece A ile B arasında olan noktalar (0.10 ile 0.90 arası)
            if (t > 0.10 && t < 0.90) {
                // Doğruya olan dik mesafe sapması
                const projX = startSokak.lon + t * dx;
                const projY = startSokak.lat + t * dy;
                const dPerpKm = this.hesaplaKusUcusuKm(s.lat, s.lon, projY, projX);

                // Ana arter veya cadde ise öncelik tanı
                const isCadde = (s.cat && s.cat.includes("Cadde")) || (s.cat && s.cat.includes("Bulvar"));
                const adjustedPerp = isCadde ? dPerpKm * 0.7 : dPerpKm;

                candidatesWithT.push({
                    sokak: s,
                    t: t,
                    dPerp: adjustedPerp
                });
            }
        });

        // Minimum dikey sapmaya göre en uygunları seç
        candidatesWithT.sort((a, b) => a.dPerp - b.dPerp);
        const selected = candidatesWithT.slice(0, stopCount);

        // Seçilen durakları güzergâh boyunca t parametresine göre baştan sona sırala (ASLA GERİ DÖNÜŞ YOK)
        selected.sort((a, b) => a.t - b.t);

        return selected.map(item => item.sokak);
    },

    /**
     * Süleymanpaşa Mahalleleri İçi Rota Oluşturucu
     */
    rotaOlustur: function(kalkisSorgu, varisSorgu) {
        const kalkis = this.findSokak(kalkisSorgu);
        const varis = this.findSokak(varisSorgu);

        if (!kalkis) return { success: false, message: "Kalkış noktası bulunamadı: " + kalkisSorgu };
        if (!varis) return { success: false, message: "Varış noktası bulunamadı: " + varisSorgu };
        if (kalkis.id === varis.id) return { success: false, message: "Kalkış ve varış aynı nokta olamaz." };

        const totalKm = this.hesaplaGercekYolKm(kalkis, varis);
        const araSokaklar = this.araDuraklariSec(kalkis, varis, totalKm);
        const stopSequence = [kalkis, ...araSokaklar, varis];
        const routeStops = [];

        for (let i = 0; i < stopSequence.length; i++) {
            const current = stopSequence[i];
            const isFirst = (i === 0);
            const isLast = (i === stopSequence.length - 1);
            const nextStop = isLast ? null : stopSequence[i + 1];
            const segDist = nextStop ? this.hesaplaGercekYolKm(current, nextStop) : 0;

            routeStops.push({
                name: current.name + " (" + current.mahalle + ")",
                anons: isFirst 
                    ? current.mahalle + ", " + current.name + " durağındayız. Süleymanpaşa şehir içi seferi başlıyor."
                    : (isLast ? "Son durak: " + current.mahalle + ", " + current.name + ". Seferimiz tamamlanmıştır." : "Sonraki durak: " + current.name + "."),
                bekleyenYolcu: isFirst ? 18 : (isLast ? 0 : (((i * 3 + 4) % 6) + 2)),
                inenYolcu: isFirst ? 0 : (isLast ? 18 : (((i * 2 + 3) % 4) + 1)),
                gercekMesafeSonraki: segDist,
                lat: current.lat,
                lon: current.lon,
                cat: current.cat,
                mahalle: current.mahalle
            });
        }

        const calculatedKm = routeStops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);
        const finalKm = Math.round(calculatedKm * 10) / 10;
        const seferDk = this.hesaplaSeferSuresiDk(finalKm, routeStops.length);
        const biletTL = this.hesaplaBiletUcretiTL(finalKm);

        const routeId = "spasa_nav_" + kalkis.id + "_" + varis.id;
        const route = {
            id: routeId,
            hatNo: "SP-ŞEHİR",
            name: "Süleymanpaşa: " + kalkis.name + " ➔ " + varis.name,
            rawName: "Süleymanpaşa İçi (" + kalkis.mahalle + " - " + varis.mahalle + ")",
            district: "Süleymanpaşa",
            originDistrict: "Süleymanpaşa",
            destDistrict: "Süleymanpaşa",
            isDistrict: false,
            isCity: true,
            isSuleymanpasaLocked: true,
            sehir: "Tekirdağ",
            color: "#0284c7",
            startStop: kalkis.name,
            endStop: varis.name,
            intermediateStops: routeStops.slice(1, -1).map(s => s.name),
            totalKm: finalKm,
            seferSuresiDk: seferDk,
            biletFiyat: biletTL,
            biletFiyatMultiplier: 1.0,
            otobusKapasitesi: 32,
            terrain: "sehirici_asfalt",
            desc: "Süleymanpaşa Şehir İçi Seferi: " + kalkis.name + " (" + kalkis.mahalle + ") ➔ " + varis.name + " (" + varis.mahalle + "). Toplam " + routeStops.length + " durak, " + finalKm + " km. Tahmini sefer süresi: " + seferDk + " dakika. Bilet: " + biletTL + " TL.",
            speechBriefing: "Süleymanpaşa şehir içi seferi oluşturuldu. " + kalkis.mahalle + ", " + kalkis.name + " durağından " + varis.mahalle + ", " + varis.name + " durağına hareket ediliyor. Güzergâh boyunca " + routeStops.length + " durakta durulacaktır. Toplam " + finalKm + " kilometre, tahmini süre " + seferDk + " dakika.",
            detailedInstructions: "Süleymanpaşa Şehir İçi Seferi (SP-ŞEHİR)\n" +
                routeStops.map((s, idx) => (idx + 1) + ". Adım: " + s.name + (idx === routeStops.length - 1 ? " (Son Durak)" : "")).join('\n'),
            stops: routeStops
        };

        if (typeof routesData !== 'undefined') {
            routesData[routeId] = route;
        }

        return {
            success: true,
            route: route,
            kalkis: kalkis,
            varis: varis,
            totalKm: finalKm,
            seferSuresiDk: seferDk,
            biletUcretiTL: biletTL,
            stopsCount: routeStops.length
        };
    },

    baslat: function(kalkisSorgu, varisSorgu) {
        const res = this.rotaOlustur(kalkisSorgu, varisSorgu);
        if (!res.success) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(res.message);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(res.message, "warning");
            return false;
        }

        if (typeof Game !== 'undefined' && typeof Game.startRoute === 'function') {
            Game.isSuleymanpasaLocked = true;
            Game.startRoute(res.route.id);
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast("🏙️ Süleymanpaşa Seferi: " + res.kalkis.name + " ➔ " + res.varis.name + " (" + res.totalKm + " KM)", "info");
            }
            return true;
        }
        return false;
    }
};

// Global erişim
if (typeof window !== 'undefined') {
    window.SuleymanpasaNavigasyon = SuleymanpasaNavigasyon;
}

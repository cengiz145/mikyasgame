/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU PUSULA VE İSTİKAMET SİSTEMİ (COMPASS-SYSTEM.JS)
   Modüler, Hafif, Dinamik Coğrafi Yönlendirme, 3D/Stereo Akustik Sinyal ve NVDA Desteği
   81 İl GPS Ağı, Gerçek Coğrafi Kerteriz/Azimut ve Türkiye Denizleri Rehberi
   ========================================================================== */

const CompassSystem = {
    currentDirection: "Kuzey",
    currentAngle: 0, // 0 = Kuzey, 90 = Doğu, 180 = Güney, 270 = Batı

    cardinals: {
        ArrowUp:    { name: "Kuzey", icon: "⬆️", angle: 0,   opposite: "Güney", pan: 0.0,  freq: 880 },
        ArrowRight: { name: "Doğu",  icon: "➡️", angle: 90,  opposite: "Batı",  pan: 0.85, freq: 660 },
        ArrowDown:  { name: "Güney", icon: "⬇️", angle: 180, opposite: "Kuzey", pan: 0.0,  freq: 330 },
        ArrowLeft:  { name: "Batı",  icon: "⬅️", angle: 270, opposite: "Doğu",  pan: -0.85, freq: 440 }
    },

    // Türkiye'nin 81 İli Resmi GPS Koordinatları (Enlem, Boylam)
    turkiye81GPS: {
        "Adana": [37.0000, 35.3213],
        "Adıyaman": [37.7648, 38.2786],
        "Afyonkarahisar": [38.7569, 30.5387],
        "Ağrı": [39.7191, 43.0503],
        "Amasya": [40.6534, 35.8331],
        "Ankara": [39.9334, 32.8597],
        "Antalya": [36.8969, 30.7133],
        "Artvin": [41.1828, 41.8183],
        "Aydın": [37.8450, 27.8396],
        "Balıkesir": [39.6484, 27.8826],
        "Bilecik": [40.1425, 29.9793],
        "Bingöl": [38.8853, 40.4983],
        "Bitlis": [38.4006, 42.1095],
        "Bolu": [40.7350, 31.6061],
        "Burdur": [37.7203, 30.2908],
        "Bursa": [40.1885, 29.0610],
        "Çanakkale": [40.1456, 26.4086],
        "Çankırı": [40.6013, 33.6134],
        "Çorum": [40.5506, 34.9556],
        "Denizli": [37.7765, 29.0864],
        "Diyarbakır": [37.9144, 40.2306],
        "Edirne": [41.6772, 26.5557],
        "Elazığ": [38.6810, 39.2264],
        "Erzincan": [39.7500, 39.5000],
        "Erzurum": [39.9043, 41.2678],
        "Eskişehir": [39.7767, 30.5206],
        "Gaziantep": [37.0662, 37.3833],
        "Giresun": [40.9128, 38.3895],
        "Gümüşhane": [40.4600, 39.4814],
        "Hakkâri": [37.5833, 43.7333],
        "Hakkari": [37.5833, 43.7333],
        "Hatay": [36.2023, 36.1606],
        "Isparta": [37.7648, 30.5566],
        "Mersin": [36.8000, 34.6333],
        "İstanbul": [41.0082, 28.9784],
        "İzmir": [38.4192, 27.1287],
        "Kars": [40.6013, 43.0975],
        "Kastamonu": [41.3887, 33.7827],
        "Kayseri": [38.7312, 35.4787],
        "Kırklareli": [41.7333, 27.2167],
        "Kırşehir": [39.1425, 34.1709],
        "Kocaeli": [40.7654, 29.9408],
        "Konya": [37.8667, 32.4833],
        "Kütahya": [39.4167, 29.9833],
        "Malatya": [38.3552, 38.3095],
        "Manisa": [38.6191, 27.4289],
        "Kahramanmaraş": [37.5858, 36.9371],
        "Mardin": [37.3212, 40.7245],
        "Muğla": [37.2153, 28.3636],
        "Muş": [38.7432, 41.5064],
        "Nevşehir": [38.6244, 34.7142],
        "Niğde": [37.9667, 34.6833],
        "Ordu": [40.9839, 37.8764],
        "Rize": [41.0208, 40.5219],
        "Sakarya": [40.7731, 30.4012],
        "Samsun": [41.2867, 36.3300],
        "Siirt": [37.9333, 41.9500],
        "Sinop": [42.0231, 35.1531],
        "Sivas": [39.7477, 37.0179],
        "Tekirdağ": [40.9833, 27.5167],
        "Tokat": [40.3167, 36.5500],
        "Trabzon": [41.0027, 39.7167],
        "Tunceli": [39.1079, 39.5401],
        "Şanlıurfa": [37.1674, 38.7955],
        "Uşak": [38.6823, 29.4082],
        "Van": [38.4891, 43.3800],
        "Yozgat": [39.8181, 34.8147],
        "Zonguldak": [41.4564, 31.7987],
        "Aksaray": [38.3726, 34.0254],
        "Bayburt": [40.2552, 40.2249],
        "Karaman": [37.1759, 33.2287],
        "Kırıkkale": [39.8468, 33.5153],
        "Batman": [37.8812, 41.1293],
        "Şırnak": [37.5164, 42.4578],
        "Bartın": [41.6358, 32.3375],
        "Ardahan": [41.1105, 42.7022],
        "Iğdır": [39.9237, 44.0450],
        "Yalova": [40.6500, 29.2667],
        "Karabük": [41.2061, 32.6204],
        "Kilis": [36.7184, 37.1212],
        "Osmaniye": [37.0742, 36.2472],
        "Düzce": [40.8438, 31.1565]
    },

    // Şehir bazlı çevre ve istikamet veritabanı (81 İl Kapsamlı)
    cityLandmarks: {
        "Adana": {
            "Koordinatlar": "37°00′N 35°19′E (Enlem: 37.0000° Kuzey, Boylam: 35.3213° Doğu, Rakım: 23 m)",
            "Konum": "Akdeniz Bölgesi Çukurova Deltası kalbi, Seyhan Nehri kıyısı. Kuzeyde Kayseri, doğuda Osmaniye ve Kahramanmaraş, güneyde Akdeniz, batıda Mersin.",
            "Kuzey": "Pozantı Boğazı, Çiftehan, Gülek Tüneli, Toroslar ve Niğde/Ankara otoyolu",
            "Doğu": "Ceyhan Ovası, Yılankale, Osmaniye, Nurdağı ve Gaziantep/Şanlıurfa otoyolu",
            "Güney": "Seyhan ve Ceyhan nehir deltaları, Karataş Sahili, Yumurtalık Limanı ve Akdeniz",
            "Batı": "Tarsus Tarihi Şelalesi, Eshab-ı Kehf, Mersin Uluslararası Limanı ve Antalya (D-400) sahil koridoru"
        },
        "Adıyaman": {
            "Koordinatlar": "37°46′N 38°16′E (Enlem: 37.7648° Kuzey, Boylam: 38.2786° Doğu, Rakım: 669 m)",
            "Konum": "Güneydoğu Anadolu, Fırat Havzası ve Nemrut Dağı etekleri. Kuzeyde Malatya, doğuda Diyarbakır, güneyde Şanlıurfa, batıda Kahramanmaraş ve Gaziantep.",
            "Kuzey": "Çelikhan Tütün Vadisi, Beydağları Geçidi ve Malatya istikameti",
            "Doğu": "Kahta, Kommagene Krallığı, UNESCO Dünya Mirası Nemrut Dağı zirvesi, Siverek ve Diyarbakır istikameti",
            "Güney": "Atatürk Baraj Gölü, Samsat sahili, Hilvan ve Şanlıurfa otoyolu",
            "Batı": "Besni, Gölbaşı Tabiat Parkı, Pazarcık ve Gaziantep/Kahramanmaraş istikameti"
        },
        "Afyonkarahisar": {
            "Koordinatlar": "38°45′N 30°32′E (Enlem: 38.7569° Kuzey, Boylam: 30.5387° Doğu, Rakım: 1021 m)",
            "Konum": "Ege ve İç Anadolu kavşağı, termal ve mermer başkenti. Kuzeyde Eskişehir, doğuda Konya, güneyde Isparta ve Burdur, batıda Uşak ve Kütahya.",
            "Kuzey": "İhsaniye Frig Vadisi, Gazlıgöl Termali, Seyitgazi ve Eskişehir otoyolu",
            "Doğu": "Çobanlar, Çay, Sultandağı Kiraz Bahçeleri, Akşehir ve Konya/Ankara otoyolu",
            "Güney": "Şuhut Zafer Yolu, Sandıklı Hüdai Kaplıcaları, Dinar ve Antalya/Isparta koridoru",
            "Batı": "Sincanlı (Sinanpaşa), Zafer Havalimanı, Dumlupınar Şehitliği, Uşak ve İzmir otoyolu"
        },
        "Ağrı": {
            "Koordinatlar": "39°43′N 43°03′E (Enlem: 39.7191° Kuzey, Boylam: 43.0503° Doğu, Rakım: 1632 m)",
            "Konum": "Doğu Anadolu platosu, Murat Nehri vadisi ve ulu Ağrı Dağı gölgesi. Kuzeyde Kars ve Iğdır, doğuda İran, güneyde Van ve Bitlis, batıda Muş ve Erzurum.",
            "Kuzey": "Kağızman kanyonu, Digor ve Kars/Ardahan istikameti",
            "Doğu": "Taşlıçay, Diyadin Kaplıcaları, Doğubayazıt İshak Paşa Sarayı, Gürbulak İran Sınır Kapısı ve Ağrı Dağı (5137 m)",
            "Güney": "Hamur Vadisi, Tutak Ovası, Patnos Süphan Dağı etekleri ve Van Gölü havzası",
            "Batı": "Eleşkirt Ovası, Sarıcan Geçidi, Horasan ve Erzurum otoyolu"
        },
        "Aksaray": {
            "Koordinatlar": "38°22′N 34°01′E (Enlem: 38.3726° Kuzey, Boylam: 34.0254° Doğu, Rakım: 980 m)",
            "Konum": "İç Anadolu Bölgesi'nin güneyi, Kapadokya batı kapısı. Kuzeyde Kırşehir, doğuda Nevşehir ve Niğde, güneyde Konya, batıda Tuz Gölü ve Ankara.",
            "Kuzey": "Ortaköy, Kulu, Tuz Gölü doğu sahili ve Kırşehir/Ankara istikameti",
            "Doğu": "Güzelyurt, Ihlara Vadisi, Selime Katedrali, Derinkuyu ve Nevşehir/Niğde istikameti",
            "Güney": "Hasan Dağı etekleri, Sultanhanı Kervansarayı, Eskil ve Konya/Ereğli otoyolu",
            "Batı": "Eşmekaya, Tuz Gölü havzası ve Cihanbeyli istikameti"
        },
        "Amasya": {
            "Koordinatlar": "40°39′N 35°50′E (Enlem: 40.6534° Kuzey, Boylam: 35.8331° Doğu, Rakım: 411 m)",
            "Konum": "Orta Karadeniz, Yeşilırmak Vadisi ve Harşena Dağı Kralkaya Mezarları. Kuzeyde Samsun, doğuda Tokat, güneyde Yozgat, batıda Çorum.",
            "Kuzey": "Suluova Ovası, Merzifon Havalimanı, Havza ve Samsun sahil otoyolu",
            "Doğu": "Taşova, Boraboy Krater Gölü, Erbaa ve Tokat istikameti",
            "Güney": "Göynücek, Zile Kalesi geçişi ve Yozgat/Sivas iç Anadolu hattı",
            "Batı": "Hamamözü Kaplıcaları, Mecitözü ve Çorum/Ankara otoyolu"
        },
        "Ankara": {
            "Koordinatlar": "39°56′N 32°52′E (Enlem: 39.9334° Kuzey, Boylam: 32.8597° Doğu, Rakım: 938 m)",
            "Konum": "Türkiye Cumhuriyeti'nin başkenti. İç Anadolu'nun merkezinde. Kuzeyde Bolu ve Çankırı, doğuda Kırıkkale ve Kırşehir, güneyde Konya ve Aksaray, batıda Eskişehir.",
            "Kuzey": "Kazan, Kızılcahamam, Gerede, Bolu ve Çankırı istikameti",
            "Doğu": "Mamak, Kayaş, Elmadağ, Kırıkkale ve Karadeniz/Doğu Anadolu otoyolu",
            "Güney": "Gölbaşı, İncek, Bala, Şereflikoçhisar, Aksaray ve Konya istikameti",
            "Batı": "Etimesgut, Sincan, Yenikent, Polatlı ve Eskişehir istikameti"
        },
        "Antalya": {
            "Koordinatlar": "36°53′N 30°42′E (Enlem: 36.8969° Kuzey, Boylam: 30.7133° Doğu, Rakım: 30 m)",
            "Konum": "Akdeniz'in turizm başkenti, Toros Dağları ve Akdeniz kıyısı. Kuzeyde Burdur ve Isparta, doğuda Karaman ve Mersin, batıda Muğla, güneyde Akdeniz.",
            "Kuzey": "Çubuk Boğazı, Döşemealtı, Bucak ve Burdur/Isparta koridoru",
            "Doğu": "Aksu, Serik, Aspendos, Manavgat Şelalesi, Alanya Kalesi ve Gazipaşa/Mersin sahil otoyolu",
            "Güney": "Kaleiçi Tarihi Yat Limanı, Konyaaltı Sahili, Falezler ve Akdeniz",
            "Batı": "Kemer, Phaselis, Kumluca, Finike, Demre Myra, Kaş, Kalkan ve Muğla/Fethiye yolu"
        },
        "Ardahan": {
            "Koordinatlar": "41°06′N 42°42′E (Enlem: 41.1105° Kuzey, Boylam: 42.7022° Doğu, Rakım: 1829 m)",
            "Konum": "Doğu Anadolu'nun en kuzeydoğusu, Kura Nehri havzası. Kuzeyde Gürcistan, doğuda Ermenistan sınırı, güneyde Kars ve Erzurum, batıda Artvin.",
            "Kuzey": "Posof, Ilgar Dağı Geçidi, Türkgözü Sınır Kapısı ve Gürcistan/Ahıska istikameti",
            "Doğu": "Çıldır Gölü, Aktaş Sınır Kapısı ve Şeytan Kalesi istikameti",
            "Güney": "Göle Ovası, Susuz, Boğatepe ve Kars/Erzurum otoyolu",
            "Batı": "Sahara Dağı Milli Parkı, Şavşat Karagöl ve Artvin geçişi"
        },
        "Artvin": {
            "Koordinatlar": "41°11′N 41°49′E (Enlem: 41.1828° Kuzey, Boylam: 41.8183° Doğu, Rakım: 550 m)",
            "Konum": "Doğu Karadeniz Bölgesi, Çoruh Vadisi ve Kaçkarlar etekleri. Kuzeyde Karadeniz ve Gürcistan, doğuda Ardahan, güneyde Erzurum, batıda Rize.",
            "Kuzey": "Karadeniz Sahili, Hopa, Kemalpaşa, Sarp Sınır Kapısı ve Batum (Gürcistan) istikameti",
            "Doğu": "Borçka Karagöl, Şavşat, Sahara Milli Parkı, Çıldır Gölü ve Ardahan istikameti",
            "Güney": "Çoruh Vadisi, Deriner Barajı, Yusufeli, Tortum Şelalesi ve Erzurum istikameti",
            "Batı": "Cankurtaran Tüneli, Arhavi Mençuna Şelalesi, Fındıklı, Ayder Yaylası ve Rize/Trabzon istikameti"
        },
        "Aydın": {
            "Koordinatlar": "37°51′N 27°51′E (Enlem: 37.8450° Kuzey, Boylam: 27.8396° Doğu, Rakım: 65 m)",
            "Konum": "Güneybatı Ege, Büyük Menderes Havzası. Kuzeyde İzmir ve Manisa, doğuda Denizli, güneyde Muğla, batıda Ege Denizi.",
            "Kuzey": "Büyük Menderes Ovası, Germencik, Tire Dağları, Torbalı, Selçuk/Efes ve İzmir otoyolu",
            "Doğu": "Köşk, Sultanhisar, Nazilli, Kuyucak, Buharkent ve Denizli (Pamukkale) istikameti",
            "Güney": "Çine Madran Dağları, Yatağan, Bafa Gölü, Milas, Bodrum ve Muğla istikameti",
            "Batı": "Söke Ovası, Kuşadası, Dilek Yarımadası Milli Parkı, Didim Altınkum ve Ege Denizi"
        },
        "Balıkesir": {
            "Koordinatlar": "39°39′N 27°53′E (Enlem: 39.6484° Kuzey, Boylam: 27.8826° Doğu, Rakım: 145 m)",
            "Konum": "Güney Marmara ve Kuzey Ege kavşağı. Kuzeyde Marmara Denizi, batıda Çanakkale ve Ege Denizi, doğuda Bursa ve Kütahya, güneyde Manisa ve İzmir.",
            "Kuzey": "Susurluk, Manyas Kuşcenneti, Bandırma Limanı, Erdek, Kapıdağ Yarımadası ve Marmara Denizi",
            "Doğu": "Kepsut, Dursunbey Alaçam Dağları, Mustafakemalpaşa, Kütahya ve Bursa otoyolu",
            "Güney": "Savaştepe, Sındırgı, Soma, Akhisar, Manisa ve İzmir otoyolu",
            "Batı": "Balya, İvrindi, Havran, Kazdağları, Edremit Körfezi, Ayvalık ve Çanakkale istikameti"
        },
        "Bartın": {
            "Koordinatlar": "41°38′N 32°20′E (Enlem: 41.6358° Kuzey, Boylam: 32.3375° Doğu, Rakım: 25 m)",
            "Konum": "Batı Karadeniz Sahili, Bartın Çayı vadisi. Kuzeyde Karadeniz, doğuda Kastamonu, güneyde Karabük, batıda Zonguldak.",
            "Kuzey": "İnkumu Sahili, Amasra Kalesi ve Karadeniz kıyı şeridi",
            "Doğu": "Kurucaşile ahşap yat tersaneleri, Cide ve Kastamonu sahil yolu",
            "Güney": "Ulus, Küre Dağları Milli Parkı, Safranbolu ve Karabük istikameti",
            "Batı": "Çaycuma, Filyos Vadisi, Devrek ve Zonguldak istikameti"
        },
        "Batman": {
            "Koordinatlar": "37°53′N 41°08′E (Enlem: 37.8812° Kuzey, Boylam: 41.1293° Doğu, Rakım: 570 m)",
            "Konum": "Güneydoğu Anadolu Bölgesi, Dicle Nehri havzası ve Raman Dağı etekleri. Kuzeyde Muş, doğuda Bitlis ve Siirt, güneyde Mardin, batıda Diyarbakır.",
            "Kuzey": "Kozluk, Sason Mereto Dağı, Malabadi Köprüsü ve Muş istikameti",
            "Doğu": "Beşiri, Kurtalan, Veysel Karani ve Siirt/Bitlis istikameti",
            "Güney": "Hasankeyf Tarihi Kenti, Ilısu Barajı, Gercüş, Midyat ve Mardin istikameti",
            "Batı": "Bismil Ovası, Batman Çayı köprüsü ve Diyarbakır istikameti"
        },
        "Bayburt": {
            "Koordinatlar": "40°15′N 40°13′E (Enlem: 40.2552° Kuzey, Boylam: 40.2249° Doğu, Rakım: 1550 m)",
            "Konum": "Doğu Karadeniz iç havzası, Çoruh Nehri kıyısı. Kuzeyde Trabzon ve Rize, doğuda Erzurum, güneyde Erzincan, batıda Gümüşhane.",
            "Kuzey": "Soğanlı Dağları Geçidi, Aydıntepe Yaylası, Of ve Trabzon/Rize Karadeniz sahil yolu",
            "Doğu": "Demirözü Ovası, Aşkale ve Erzurum otoyolu",
            "Güney": "Kop Dağı Geçidi (2409 m), Otlukbeli ve Erzincan otoyolu",
            "Batı": "Baksı Müzesi, Vauk Dağı Geçidi ve Gümüşhane/Trabzon otoyolu"
        },
        "Bilecik": {
            "Koordinatlar": "40°08′N 29°58′E (Enlem: 40.1425° Kuzey, Boylam: 29.9793° Doğu, Rakım: 500 m)",
            "Konum": "Güney Marmara ve İç Anadolu geçiş havzası. Kuzeyde Sakarya, batıda Bursa, doğuda Bolu ve Eskişehir, güneyde Kütahya.",
            "Kuzey": "Karasu Vadisi, Osmaneli, Pamukova Ovası, Sakarya Nehri ve Adapazarı/İstanbul istikameti",
            "Doğu": "Gölpazarı, Yenipazar, Göynük Dağları, Bolu ve Karadeniz geçiş hattı",
            "Güney": "Söğüt, Bozüyük kavşağı, İnönü, Eskişehir ve Kütahya/Antalya otoyolu",
            "Batı": "Pazaryeri, Mezit Boğazı, İnegöl, Yenişehir Havalimanı ve Bursa otoyolu"
        },
        "Bingöl": {
            "Koordinatlar": "38°53′N 40°30′E (Enlem: 38.8853° Kuzey, Boylam: 40.4983° Doğu, Rakım: 1151 m)",
            "Konum": "Doğu Anadolu Bölgesi, Yukarı Fırat Bölümü ve Çapakçur Vadisi. Kuzeyde Erzurum ve Erzincan, doğuda Muş, güneyde Diyarbakır, batıda Tunceli ve Elazığ.",
            "Kuzey": "Karlıova Fay Hattı, Yedisu Kanyonu, Çat ve Erzurum istikameti",
            "Doğu": "Solhan Yüzen Adalar, Buğlan Geçidi, Hasköy ve Muş Ovası koridoru",
            "Güney": "Genç Murat Nehri Köprüsü, Lice Dağları ve Diyarbakır istikameti",
            "Batı": "Kuruca Geçidi, Kovancılar, Keban ve Elazığ/Tunceli otoyolu"
        },
        "Bitlis": {
            "Koordinatlar": "38°24′N 42°06′E (Enlem: 38.4006° Kuzey, Boylam: 42.1095° Doğu, Rakım: 1545 m)",
            "Konum": "Doğu Anadolu Bölgesi, Van Gölü batı kıyısı ve Nemrut Krateri. Kuzeyde Ağrı, doğuda Van Gölü ve Van, güneyde Siirt, batıda Muş ve Batman.",
            "Kuzey": "Ahlat Selçuklu Mezarlığı, Adilcevaz Süphan Dağı ve Erciş/Ağrı istikameti",
            "Doğu": "Tatvan İskelesi, Nemrut Krater Gölü, Van Gölü feribot hattı ve Gevaş/Van istikameti",
            "Güney": "Bitlis Deresi Kanyonu, Ziyaret (Veysel Karani), Baykan ve Siirt istikameti",
            "Batı": "Güroymak Ilıcası, Rahva Düzlüğü ve Muş Ovası istikameti"
        },
        "Bolu": {
            "Koordinatlar": "40°44′N 31°36′E (Enlem: 40.7350° Kuzey, Boylam: 31.6061° Doğu, Rakım: 726 m)",
            "Konum": "Batı Karadeniz, ormanlar ve göller diyarı. Kuzeyde Düzce ve Zonguldak, doğuda Çankırı ve Karabük, güneyde Ankara ve Eskişehir, batıda Sakarya.",
            "Kuzey": "Yedigöller Milli Parkı, Mengen Aşçılar Kenti ve Zonguldak/Bartın sahil yolu",
            "Doğu": "Yeniçağa Gölü, Dörtdivan, Gerede kavşağı, Karabük ve Karadeniz otoyol ayrımı",
            "Güney": "Gölcük Tabiat Parkı, Seben Gölü, Mudurnu Tarihi Evleri ve Nallıhan/Ankara yolu",
            "Batı": "Abant Gölü, Bolu Dağı Tüneli, Kaynaşlı, Düzce ve Sakarya/İstanbul otoyolu"
        },
        "Burdur": {
            "Koordinatlar": "37°43′N 30°17′E (Enlem: 37.7203° Kuzey, Boylam: 30.2908° Doğu, Rakım: 950 m)",
            "Konum": "Göller Yöresi, Salda Gölü ve Sagalassos diyarı. Kuzeyde Afyonkarahisar, doğuda Isparta, güneyde Antalya, batıda Denizli ve Muğla.",
            "Kuzey": "Kurna Geçidi, Keçiborlu, Dinar ve Afyonkarahisar otoyolu",
            "Doğu": "Burdur Gölü sahili, Çendik, Ağlasun Sagalassos Antik Kenti ve Isparta istikameti",
            "Güney": "Çeltikçi Geçidi, Bucak Sanayisi, Karacaören Barajı ve Antalya otoyolu",
            "Batı": "Yeşilova Salda Gölü (Türkiye'nin Maldivleri), Karamanlı, Tefenni, Çavdır ve Denizli/Fethiye yolu"
        },
        "Bursa": {
            "Koordinatlar": "40°11′N 29°03′E (Enlem: 40.1885° Kuzey, Boylam: 29.0610° Doğu, Rakım: 155 m)",
            "Konum": "Güney Marmara metropolü, Osmanlı ilk başkenti ve Uludağ. Kuzeyde Marmara Denizi ve Yalova, doğuda Bilecik, güneyde Kütahya ve Balıkesir, batıda Balıkesir.",
            "Kuzey": "Gemlik Körfezi, Mudanya İskelesi, Orhangazi, Osmangazi Köprüsü ve Yalova/İstanbul otoyolu",
            "Doğu": "Kestel, İnegöl Mobilya Kenti, Mezitler Boğazı, Bozüyük ve Bilecik/Eskişehir otoyolu",
            "Güney": "Uludağ Milli Parkı (2543 m), Keles, Orhaneli, Harmancık ve Kütahya geçişi",
            "Batı": "Nilüfer, Görükle Kampüsü, Karacabey Harası, Mustafakemalpaşa ve Balıkesir/İzmir otoyolu"
        },
        "Çanakkale": {
            "Koordinatlar": "40°09′N 26°24′E (Enlem: 40.1456° Kuzey, Boylam: 26.4086° Doğu, Rakım: 10 m)",
            "Konum": "Marmara ve Ege'yi bağlayan Çanakkale Boğazı ve Şehitler Coğrafyası. Kuzeyde Tekirdağ ve Marmara Denizi, doğuda Balıkesir, güney ve batıda Ege Denizi.",
            "Kuzey": "1915 Çanakkale Köprüsü, Gelibolu, Eceabat, Tarihi Yarımada Şehitlikleri ve Tekirdağ/Edirne yolu",
            "Doğu": "Lapseki, Biga Çan sanayi havzası, Yenice Kazdağları ve Balıkesir/Bursa otoyolu",
            "Güney": "Ezine Peynir Diyarı, Ayvacık, Assos Behramkale, Kazdağları Rampaları ve Edremit Körfezi",
            "Batı": "Çanakkale Boğazı geçişi, Kilitbahir Kalesi, Gökçeada ve Bozcaada feribot hatları"
        },
        "Çankırı": {
            "Koordinatlar": "40°36′N 33°37′E (Enlem: 40.6013° Kuzey, Boylam: 33.6134° Doğu, Rakım: 730 m)",
            "Konum": "İç Anadolu ile Batı Karadeniz geçiş kuşağı, Tarihi Tuz Mağarası kenti. Kuzeyde Kastamonu, doğuda Çorum, güneyde Kırıkkale ve Ankara, batıda Bolu ve Karabük.",
            "Kuzey": "Ilgaz Dağı Tüneli, Ilgaz Kayak Tesisleri ve Kastamonu sahil bağlantısı",
            "Doğu": "Yapraklı Yaylaları, Kızılırmak Vadisi ve Çorum/Sungurlu istikameti",
            "Güney": "Tüney Rampaları, Kalecik, Şabanözü ve Kırıkkale/Ankara otoyolu",
            "Batı": "Korgun, Kurşunlu Kaplıcaları, Çerkeş, Eskipazar ve Karabük/Gerede yolu"
        },
        "Çorum": {
            "Koordinatlar": "40°33′N 34°57′E (Enlem: 40.5506° Kuzey, Boylam: 34.9556° Doğu, Rakım: 801 m)",
            "Konum": "Orta Karadeniz iç kuşağı, Hitit Uygarlığı başkenti Hattuşa ve leblebi diyarı. Kuzeyde Sinop ve Samsun, doğuda Amasya, güneyde Yozgat, batıda Çankırı ve Kırıkkale.",
            "Kuzey": "Kargı Yaylaları, Osmancık Koyunbaba Köprüsü ve Sinop/Samsun istikameti",
            "Doğu": "Mecitözü vadisi, Merzifon kavşağı ve Amasya/Tokat otoyolu",
            "Güney": "Alaca Ovası, Boğazkale Hattuşa Antik Kenti ve Yozgat/Sivas otoyolu",
            "Batı": "İskilip kalesi ve el sanatları, Sungurlu leblebicileri ve Kırıkkale/Ankara otoyolu"
        },
        "Denizli": {
            "Koordinatlar": "37°46′N 29°05′E (Enlem: 37.7765° Kuzey, Boylam: 29.0864° Doğu, Rakım: 354 m)",
            "Konum": "Ege ile Akdeniz kavşağı, beyaz cennet Pamukkale travertenleri ve sanayi kenti. Kuzeyde Uşak ve Manisa, doğuda Afyon ve Burdur, güneyde Muğla, batıda Aydın.",
            "Kuzey": "Pamukkale Hierapolis Antik Kenti, Çal Bağları, Buldan dokumaları ve Uşak/Ankara otoyolu",
            "Doğu": "Honaz Dağı Tüneli, Kaklık Mağarası, Çardak Havalimanı, Bozkurt ve Burdur/Afyon yolu",
            "Güney": "Tavas Ovası, Serinhisar Leblebicileri, Acıpayam Kanyonu ve Muğla/Fethiye yolu",
            "Batı": "Sarayköy Jeotermal Tesisleri, Buharkent, Nazilli ve Aydın/İzmir otoyolu"
        },
        "Diyarbakır": {
            "Koordinatlar": "37°55′N 40°14′E (Enlem: 37.9144° Kuzey, Boylam: 40.2306° Doğu, Rakım: 675 m)",
            "Konum": "Güneydoğu Anadolu'nun tarihi kalbi, UNESCO Tarihi Surlar ve Hevsel Bahçeleri. Kuzeyde Elazığ ve Bingöl, doğuda Batman ve Muş, güneyde Mardin, batıda Şanlıurfa ve Adıyaman.",
            "Kuzey": "Ergani, Dicle Barajı, Hani, Maden Boğazı ve Elazığ/Bingöl otoyolu",
            "Doğu": "Bismil Ovası, Silvan Malabadi Köprüsü ve Batman/Siirt otoyolu",
            "Güney": "On Gözlü Köprü, Hevsel Bahçeleri, Çınar Tarihi Zerzevan Kalesi ve Mardin otoyolu",
            "Batı": "Karacadağ bazalt platosu, Siverek kavşağı ve Şanlıurfa otoyolu"
        },
        "Düzce": {
            "Koordinatlar": "40°50′N 31°09′E (Enlem: 40.8438° Kuzey, Boylam: 31.1565° Doğu, Rakım: 160 m)",
            "Konum": "Batı Karadeniz geçiş koridoru, İstanbul-Ankara otoyolu üzerinde. Kuzeyde Karadeniz, doğuda Bolu, güney ve batıda Sakarya.",
            "Kuzey": "Akçakoca Sahili, Ceneviz Kalesi, Çilimli ve Karadeniz kıyısı",
            "Doğu": "Kaynaşlı, Bolu Dağı Tüneli, Abant kavşağı ve Ankara istikameti",
            "Güney": "Gölyaka, Efteni Gölü Kuş Cenneti, Samandere Şelalesi ve Bolu yaylaları",
            "Batı": "Gümüşova, Hendek, Akyazı, Adapazarı ve Sakarya/İstanbul otoyolu"
        },
        "Edirne": {
            "Koordinatlar": "41°40′N 26°33′E (Enlem: 41.6772° Kuzey, Boylam: 26.5557° Doğu, Rakım: 42 m)",
            "Konum": "Trakya'nın sınır kapısı, Osmanlı payitahtı ve Mimar Sinan'ın başyapıtı Selimiye Camii kenti. Kuzeyde Bulgaristan, doğuda Kırklareli ve Tekirdağ, güneyde Çanakkale ve Ege Denizi, batıda Yunanistan.",
            "Kuzey": "Kapıkule ve Hamzabeyli Uluslararası Sınır Kapıları ve Bulgaristan (Filibe/Sofya) koridoru",
            "Doğu": "Havsa kavşağı, Babaeski, Lüleburgaz, Muratlı ve Kırklareli/İstanbul otoyolu",
            "Güney": "Uzunköprü Tarihi Taş Köprüsü, Keşan kavşağı, İpsala Sınır Kapısı, Enez Sahili ve Çanakkale istikameti",
            "Batı": "Meriç, Arda ve Tunca nehirleri, Pazarkule Sınır Kapısı ve Yunanistan (Dedeağaç/Selanik) sınırı"
        },
        "Elazığ": {
            "Koordinatlar": "38°41′N 39°13′E (Enlem: 38.6810° Kuzey, Boylam: 39.2264° Doğu, Rakım: 1067 m)",
            "Konum": "Doğu Anadolu Bölgesi, Keban Baraj Gölü ve tarihi Harput Kalesi kenti. Kuzeyde Tunceli, doğuda Bingöl, güneyde Diyarbakır, batıda Malatya.",
            "Kuzey": "Keban Barajı Santrali, Pertek Feribot İskelesi ve Tunceli/Erzincan istikameti",
            "Doğu": "Kovancılar, Palu Tarihi Kalesi, Karakoçan kaplıcaları ve Bingöl/Muş otoyolu",
            "Güney": "Hazar Gölü Tabiat Parkı, Sivrice Kayak Merkezi, Maden Kanyonu ve Diyarbakır otoyolu",
            "Batı": "Baskil Kayısı Bahçeleri, Kömürhan Köprüsü ve Malatya otoyolu"
        },
        "Erzincan": {
            "Koordinatlar": "39°45′N 39°30′E (Enlem: 39.7500° Kuzey, Boylam: 39.5000° Doğu, Rakım: 1185 m)",
            "Konum": "Doğu Anadolu Bölgesi, Karasu (Fırat) Nehri vadisi ve Munzur Dağları kuzeyi. Kuzeyde Giresun, Gümüşhane ve Bayburt, doğuda Erzurum, güneyde Tunceli ve Elazığ, batıda Sivas.",
            "Kuzey": "Ahmediye Geçidi, Kelkit Vadisi ve Gümüşhane/Trabzon otoyolu",
            "Doğu": "Üzümlü Cimin Üzüm Bağları, Tercan Mama Hatun Külliyesi ve Erzurum otoyolu",
            "Güney": "Girlevik Şelalesi, Çağlayan Kasabası, Munzur Tüneli ve Tunceli istikameti",
            "Batı": "Refahiye Çamlıkları, Sakaltutan Geçidi (2160 m), Kemaliye Karanlık Kanyon ve Sivas otoyolu"
        },
        "Erzurum": {
            "Koordinatlar": "39°54′N 41°16′E (Enlem: 39.9043° Kuzey, Boylam: 41.2678° Doğu, Rakım: 1890 m)",
            "Konum": "Doğu Anadolu'nun zirvesi, Palandöken Dağı, Çifte Minareli Medrese ve Dadaşlar diyarı. Kuzeyde Rize ve Artvin, doğuda Kars ve Ağrı, güneyde Muş ve Bingöl, batıda Erzincan ve Bayburt.",
            "Kuzey": "Tortum Şelalesi, Uzundere Cittaslow, Ovit Tüneli ve Rize/Artvin Karadeniz sahil yolu",
            "Doğu": "Pasinler Kaplıcaları, Horasan, Köprüköy Şehitliği ve Kars/Ağrı otoyolu",
            "Güney": "Palandöken Kayak Merkezi (3176 m), Tekman, Hınıs kanyonları ve Muş/Bingöl koridoru",
            "Batı": "Ilıca Termalleri, Aşkale Çimento Vadisi, Kop Dağı ve Erzincan/Bayburt otoyolu"
        },
        "Eskişehir": {
            "Koordinatlar": "39°46′N 30°31′E (Enlem: 39.7767° Kuzey, Boylam: 30.5206° Doğu, Rakım: 788 m)",
            "Konum": "İç Anadolu'nun modern kültür, bilim ve havacılık başkenti, Porsuk Çayı kıyısı. Kuzeyde Bolu, doğuda Ankara, güneyde Afyonkarahisar ve Konya, batıda Bilecik ve Kütahya.",
            "Kuzey": "Sarıcakaya Vadisi, Mihalgazi termalleri ve Bolu/Karadeniz istikameti",
            "Doğu": "Alpu Ovası, Beylikova, Sivrihisar Nasreddin Hoca diyarı ve Polatlı/Ankara otoyolu",
            "Güney": "Seyitgazi Seyyid Battal Gazi Külliyesi, Han Yeraltı Şehri ve Afyonkarahisar otoyolu",
            "Batı": "Tarihi Odunpazarı Evleri, İnönü Havacılık Merkezi, Bozüyük kavşağı ve Bursa/İstanbul otoyolu"
        },
        "Gaziantep": {
            "Koordinatlar": "37°04′N 37°23′E (Enlem: 37.0662° Kuzey, Boylam: 37.3833° Doğu, Rakım: 850 m)",
            "Konum": "Güneydoğu Anadolu'nun sanayi ve UNESCO gastronomi başkenti, Zeugma Mozaik Müzesi. Kuzeyde Kahramanmaraş, doğuda Şanlıurfa, güneyde Kilis ve Suriye, batıda Osmaniye ve Hatay.",
            "Kuzey": "Yavuzeli, Araban Sarımsak Ovası, Rumkale Fırat Kanyonu ve Kahramanmaraş otoyolu",
            "Doğu": "Nizip Fıstık Vadisi, Birecik Köprüsü ve Şanlıurfa/Diyarbakır otoyolu",
            "Güney": "Şahinbey Tarihi Çarşıları, Burç Tabiat Parkı, Oğuzeli Havalimanı, Kilis ve Suriye koridoru",
            "Batı": "Şehitkamil Sanayi Siteleri, Nurdağı Geçidi, İslahiye ve Osmaniye/Adana otoyolu"
        },
        "Giresun": {
            "Koordinatlar": "40°55′N 38°23′E (Enlem: 40.9128° Kuzey, Boylam: 38.3895° Doğu, Rakım: 15 m)",
            "Konum": "Doğu Karadeniz sahil şeridi, Karadeniz'in tek yaşanabilir adası Giresun Adası ve fındığın başkenti. Kuzeyde Karadeniz, doğuda Trabzon, güneyde Gümüşhane ve Erzincan, batıda Ordu.",
            "Kuzey": "Giresun Kalesi eteği, Giresun Adası açık deniz manzarası ve Karadeniz",
            "Doğu": "Keşap, Espiye Andoz Kalesi, Tirebolu Kalesi, Görele Kemençe diyarı, Eynesil ve Trabzon sahil yolu",
            "Güney": "Dereli Kümbet Yaylası, Bektaş Yaylası, Kuzalan Şelalesi Mavi Göl ve Şebinkarahisar/Sivas iç karayolu",
            "Batı": "Bulancak İskelesi, Piraziz sahili, Ordu-Giresun Havalimanı (OGU) ve Ordu/Samsun sahil otoyolu"
        },
        "Gümüşhane": {
            "Koordinatlar": "40°27′N 39°28′E (Enlem: 40.4600° Kuzey, Boylam: 39.4814° Doğu, Rakım: 1150 m)",
            "Konum": "Doğu Karadeniz iç kuşağı, Harşit Çayı vadisi, pestil-köme ve tarihi gümüş madenleri diyarı. Kuzeyde Trabzon, doğuda Bayburt, güneyde Erzincan, batıda Giresun.",
            "Kuzey": "Torul Kalesi Cam Seyir Terası, Karaca Mağarası, Yeni Zigana Tüneli (14.5 km) ve Trabzon sahil yolu",
            "Doğu": "Tekke Kasabası, Vauk Dağı Geçidi ve Bayburt/Erzurum otoyolu",
            "Güney": "Köse Ovası, Kelkit Fasulye Vadisi, Şiran Tomara Şelalesi ve Erzincan otoyolu",
            "Batı": "Kürtün Baraj Gölü, Örümcek Ormanları Tabiatı Koruma Alanı ve Giresun/Tirebolu vadisi"
        },
        "Hakkâri": {
            "Koordinatlar": "37°35′N 43°44′E (Enlem: 37.5833° Kuzey, Boylam: 43.7333° Doğu, Rakım: 1720 m)",
            "Konum": "Türkiye'nin en güneydoğu ucu, Zap Vadisi ve Cilo Dağları. Kuzeyde Van, doğuda İran, güneyde Irak, batıda Şırnak.",
            "Kuzey": "Berçelan Yaylası, Zap Vadisi kanyonu, Başkale ve Van istikameti",
            "Doğu": "Yüksekova Ovası, Selahaddin Eyyubi Havalimanı, Şemdinli ve Esendere İran Sınır Kapısı",
            "Güney": "Çukurca, Zap Suyu boğazı, Üzümlü Sınır Kapısı ve Irak sınırı",
            "Batı": "Sümbül Dağı tünelleri, Beytüşşebap, Uludere ve Şırnak istikameti"
        },
        "Hakkari": {
            "Koordinatlar": "37°35′N 43°44′E (Enlem: 37.5833° Kuzey, Boylam: 43.7333° Doğu, Rakım: 1720 m)",
            "Konum": "Türkiye'nin en güneydoğu ucu, Zap Vadisi ve Cilo Dağları. Kuzeyde Van, doğuda İran, güneyde Irak, batıda Şırnak.",
            "Kuzey": "Berçelan Yaylası, Zap Vadisi kanyonu, Başkale ve Van istikameti",
            "Doğu": "Yüksekova Ovası, Selahaddin Eyyubi Havalimanı, Şemdinli ve Esendere İran Sınır Kapısı",
            "Güney": "Çukurca, Zap Suyu boğazı, Üzümlü Sınır Kapısı ve Irak sınırı",
            "Batı": "Sümbül Dağı tünelleri, Beytüşşebap, Uludere ve Şırnak istikameti"
        },
        "Hatay": {
            "Koordinatlar": "36°12′N 36°09′E (Enlem: 36.2023° Kuzey, Boylam: 36.1606° Doğu, Rakım: 85 m)",
            "Konum": "Akdeniz'in en doğu ucu, Asi Nehri vadisi ve Amanos Dağları. Kuzeyde Osmaniye ve Adana, doğu ve güneyde Suriye sınırı, batıda Akdeniz.",
            "Kuzey": "Belen Geçidi, İskenderun Limanı, Dörtyol, Erzin ve Osmaniye/Adana otoyolu",
            "Doğu": "Reyhanlı, Cilvegözü Sınır Kapısı, Kırıkhan ve Suriye/Halep koridoru",
            "Güney": "Defne, Harbiye Şelaleleri, Yayladağı Sınır Kapısı ve Keseb istikameti",
            "Batı": "Samandağ Titus Tüneli, Çevlik Sahili, Musa Dağı ve Akdeniz"
        },
        "Iğdır": {
            "Koordinatlar": "39°55′N 44°02′E (Enlem: 39.9237° Kuzey, Boylam: 44.0450° Doğu, Rakım: 850 m)",
            "Konum": "Doğu Anadolu'nun mikroklimalı Çukurovası, Aras Vadisi ve Ağrı Dağı kuzeyi. Üç ülkeyle komşu sınır ili.",
            "Kuzey": "Aras Nehri boyu, Alican Sınır Köprüsü ve Ermenistan sınırı",
            "Doğu": "Aralık Ovası, Dilucu Sınır Kapısı ve Nahçıvan (Azerbaycan) koridoru",
            "Güney": "Büyük Ağrı Dağı ve Küçük Ağrı etekleri, Doğubayazıt ve İran geçişi",
            "Batı": "Tuzluca Kaya Tuzu Mağaraları, Digor ve Kars istikameti"
        },
        "Isparta": {
            "Koordinatlar": "37°46′N 30°33′E (Enlem: 37.7648° Kuzey, Boylam: 30.5566° Doğu, Rakım: 1035 m)",
            "Konum": "Göller Yöresi'nin kalbi, gül ve lavanta diyarı. Kuzeyde Afyonkarahisar, doğuda Konya, güneyde Antalya, batıda Burdur.",
            "Kuzey": "Gönen, Keçiborlu, Süleyman Demirel Havalimanı, Dinar ve Afyonkarahisar otoyolu",
            "Doğu": "Eğirdir Gölü, Kovada Milli Parkı, Yalvaç Pisidia Antioch ve Konya istikameti",
            "Güney": "Gölcük Krater Gölü, Sav Kasabası, Ağlasun/Sagalassos ve Antalya koridoru",
            "Batı": "Burdur Gölü, Kükürt Vadisi, Çendik ve Burdur/Denizli istikameti"
        },
        "İstanbul": {
            "Koordinatlar": "41°00′N 28°58′E (Enlem: 41.0082° Kuzey, Boylam: 28.9784° Doğu, Rakım: 40 m)",
            "Konum": "İki kıtayı bağlayan dünya metropolü, Boğaziçi ve Haliç kenti. Doğuda Kocaeli, batıda Tekirdağ, kuzeyde Karadeniz, güneyde Marmara Denizi.",
            "Kuzey": "Karadeniz Sahili, Kilyos, Şile, Ağva, Yavuz Sultan Selim Köprüsü ve İstanbul Havalimanı (IST)",
            "Doğu": "15 Temmuz ve FSM Köprüleri, Çamlıca Kulesi, Kadıköy, Sabiha Gökçen Havalimanı ve Kocaeli/Ankara otoyolu",
            "Güney": "Marmara Denizi, Tarihi Yarımada, Avrasya Tüneli, Prens Adaları ve Bursa/Yalova deniz otobüsü hattı",
            "Batı": "Büyükçekmece Gölü, Silivri, Çatalca, Kınalı kavşağı ve Tekirdağ/Edirne Trakya otoyolu"
        },
        "İzmir": {
            "Koordinatlar": "38°25′N 27°08′E (Enlem: 38.4192° Kuzey, Boylam: 27.1287° Doğu, Rakım: 5 m)",
            "Konum": "Ege'nin incisi ve Türkiye'nin 3. büyük metropolü, İzmir Körfezi çevresi. Kuzeyde Balıkesir, doğuda Manisa, güneyde Aydın, batıda Ege Denizi.",
            "Kuzey": "Menemen Ovası, Aliağa Rafinerisi ve Limanları, Dikili, Bergama UNESCO Antik Kenti ve Ayvalık/Çanakkale otoyolu",
            "Doğu": "Bornova Belkahve Geçidi, Kemalpaşa Sanayi, Turgutlu ve O-5 İstanbul-İzmir Otoyolu ile Ankara karayolu",
            "Güney": "Gaziemir Adnan Menderes Havalimanı (ADB), Torbalı, Selçuk/Efes Antik Kenti, Kuşadası ve Aydın otoyolu",
            "Batı": "Konak Meydanı, Tarihi Saat Kulesi, Kordonboyu, Urla, Çeşme Yarımadası, Alaçatı ve Ege Denizi"
        },
        "Kahramanmaraş": {
            "Koordinatlar": "37°35′N 36°56′E (Enlem: 37.5858° Kuzey, Boylam: 36.9371° Doğu, Rakım: 568 m)",
            "Konum": "Akdeniz ile Güneydoğu geçiş kuşağı, Ahır Dağı güneyi. Kuzeyde Sivas ve Malatya, doğuda Adıyaman, güneyde Gaziantep, batıda Adana ve Osmaniye.",
            "Kuzey": "Göksun tünelleri, Afşin-Elbistan Ovası, Nurhak ve Malatya/Kayseri istikameti",
            "Doğu": "Pazarcık, Narlı Ovası, Gölbaşı Gölleri ve Adıyaman istikameti",
            "Güney": "Türkoğlu Lojistik Köyü, Nurdağı Geçidi ve Gaziantep/Kilis otoyolu",
            "Batı": "Andırın kaleleri, Ceyhan Nehri, Kadirli ve Osmaniye/Adana istikameti"
        },
        "Karabük": {
            "Koordinatlar": "41°12′N 32°37′E (Enlem: 41.2061° Kuzey, Boylam: 32.6204° Doğu, Rakım: 280 m)",
            "Konum": "Batı Karadeniz orman havzası, demir-çelik sanayii ve UNESCO kenti Safranbolu. Kuzeyde Bartın, doğuda Kastamonu, güneyde Çankırı ve Bolu, batıda Zonguldak.",
            "Kuzey": "Safranbolu Tarihi Evleri, Tokatlı Kanyonu, Ahmet Usta Geçidi ve Bartın sahil yolu",
            "Doğu": "Eskipazar Hadrianapolis Antik Kenti, Araç ve Kastamonu istikameti",
            "Güney": "Kemikli Rampaları, Gerede kavşağı ve Ankara/İstanbul otoyolu bağlantısı",
            "Batı": "Yenice Ormanları Kanyonu, Filyos Çayı vadisi ve Zonguldak istikameti"
        },
        "Karaman": {
            "Koordinatlar": "37°11′N 33°13′E (Enlem: 37.1759° Kuzey, Boylam: 33.2287° Doğu, Rakım: 1030 m)",
            "Konum": "İç Anadolu güney ucu, Toros Dağları etekleri. Kuzey ve batıda Konya, doğuda Ereğli ve Mersin, güneyde Antalya ve Mersin (Silifke/Mut).",
            "Kuzey": "Karadağ volkanik kütlesi, Kazımkarabekir, Çumra ve Konya otoyolu",
            "Doğu": "Ayrancı Barajı, Ambar Köyü, Ereğli ve Adana demiryolu hattı",
            "Güney": "Sertavul Geçidi (1650 m), Mut Vadisi, Göksu Nehri ve Silifke/Mersin sahili",
            "Batı": "Başyayla, Sarıveliler, Ermenek Baraj Gölü ve Gazipaşa/Alanya istikameti"
        },
        "Kars": {
            "Koordinatlar": "40°36′N 43°06′E (Enlem: 40.6013° Kuzey, Boylam: 43.0975° Doğu, Rakım: 1768 m)",
            "Konum": "Doğu Anadolu platosu, Kars Çayı vadisi ve Ani Harabeleri. Kuzeyde Ardahan, doğuda Ermenistan, güneyde Iğdır ve Ağrı, batıda Erzurum.",
            "Kuzey": "Susuz Şelalesi, Boğatepe Peynir Müzesi ve Ardahan/Göle istikameti",
            "Doğu": "Arpaçay Vadisi, UNESCO Dünya Mirası Ani Ören Yeri ve Akyaka Ermenistan sınırı",
            "Güney": "Digor Ovası, Tuzluca ve Iğdır/Ağrı Dağı istikameti",
            "Batı": "Sarıkamış Kayak Merkezi, Allahuekber Dağları, Horasan ve Erzurum otoyolu"
        },
        "Kastamonu": {
            "Koordinatlar": "41°23′N 33°47′E (Enlem: 41.3887° Kuzey, Boylam: 33.7827° Doğu, Rakım: 775 m)",
            "Konum": "Batı Karadeniz, Küre ve Ilgaz Dağları arası. Kuzeyde Karadeniz, doğuda Sinop, güneyde Çankırı, batıda Karabük ve Bartın.",
            "Kuzey": "Küre Bakır Madenleri, İnebolu İstiklal Yolu Limanı, Abana ve Cide Karadeniz sahili",
            "Doğu": "Taşköprü, Boyabat Kalesi geçişi ve Sinop istikameti",
            "Güney": "Ilgaz Dağı Tüneli, Ilgaz Kayak Merkezi ve Çankırı/Ankara otoyolu",
            "Batı": "Araç Çayı vadisi, Daday at çiftlikleri ve Safranbolu/Karabük istikameti"
        },
        "Kayseri": {
            "Koordinatlar": "38°44′N 35°29′E (Enlem: 38.7312° Kuzey, Boylam: 35.4787° Doğu, Rakım: 1054 m)",
            "Konum": "İç Anadolu'nun ticaret ve sanayi başkenti, ulu Erciyes Dağı eteği. Kuzeyde Yozgat ve Sivas, doğuda Kahramanmaraş, güneyde Adana ve Niğde, batıda Nevşehir.",
            "Kuzey": "Felahiye, Sarıoğlan, Gemerek ve Sivas/Karadeniz otoyolu",
            "Doğu": "Pınarbaşı, Sarız, Gürün, Malatya ve Doğu Anadolu otoyolu koridoru",
            "Güney": "Erciyes Dağı Kayak Merkezi (3917 m), Develi Ovası, Yahyalı Kapuzbaşı Şelaleleri ve Adana geçişi",
            "Batı": "İncesu Kervansarayı, Ürgüp, Göreme Kapadokya kapısı ve Nevşehir/Niğde istikameti"
        },
        "Kilis": {
            "Koordinatlar": "36°43′N 37°07′E (Enlem: 36.7184° Kuzey, Boylam: 37.1212° Doğu, Rakım: 660 m)",
            "Konum": "Güneydoğu Anadolu'nun zeytin ve bağlar diyarı, Suriye sınır kenti. Kuzey ve doğuda Gaziantep, güney ve batıda Suriye.",
            "Kuzey": "Polateli vadileri, Şahinbey kırsalı ve Gaziantep metropol otoyolu",
            "Doğu": "Elbeyli ilçesi, Çobanbey Sınır Kapısı ve Karkamış istikameti",
            "Güney": "Öncüpınar Sınır Kapısı, Azez ve Suriye/Halep koridoru",
            "Batı": "Musabeyli ormanları, Ravanda Kalesi, Hassa ve Hatay/İskenderun istikameti"
        },
        "Kırıkkale": {
            "Koordinatlar": "39°51′N 33°31′E (Enlem: 39.8468° Kuzey, Boylam: 33.5153° Doğu, Rakım: 700 m)",
            "Konum": "İç Anadolu'nun 43 il kavşağı, Kızılırmak havzası ve savunma sanayii merkezi. Kuzeyde Çankırı, doğuda Çorum ve Yozgat, güneyde Kırşehir, batıda Ankara.",
            "Kuzey": "Sulakyurt, Kızılırmak boyu, Tünek Dağı ve Çankırı istikameti",
            "Doğu": "Balışeyh, Delice Ovası, Sungurlu/Çorum ve Yozgat/Sivas ana karayolu",
            "Güney": "Bahşılı, Keskin Hacı Taşan diyarı, Çelebi ve Kırşehir/Kayseri otoyolu",
            "Batı": "Yahşihan, Elmadağ Rampaları, Kayaş, Mamak ve Ankara başkent otoyolu"
        },
        "Kırklareli": {
            "Koordinatlar": "41°44′N 27°13′E (Enlem: 41.7333° Kuzey, Boylam: 27.2167° Doğu, Rakım: 203 m)",
            "Konum": "Trakya'nın kuzeydoğusu, Istranca (Yıldız) Dağları etekleri. Kuzeyde Bulgaristan, doğuda Karadeniz, güneyde Tekirdağ, batıda Edirne.",
            "Kuzey": "Dereköy Uluslararası Sınır Kapısı, Istranca Dağları Geçidi ve Bulgaristan (Burgaz) istikameti",
            "Doğu": "Pınarhisar çimento vadisi, Vize Tarihi Kalesi, Kıyıköy ve İğneada Longoz Ormanları Milli Parkı",
            "Güney": "Kavaklı, Babaeski, Büyükkarıştıran, Lüleburgaz ve Tekirdağ/Çorlu/Marmara otoyolu",
            "Batı": "İnece Ovası, Kofçaz orman köyleri, Süloğlu ve Edirne istikameti"
        },
        "Kırşehir": {
            "Koordinatlar": "39°09′N 34°10′E (Enlem: 39.1425° Kuzey, Boylam: 34.1709° Doğu, Rakım: 985 m)",
            "Konum": "İç Anadolu'nun Ahilik ve ozanlar başkenti, Seyfe Gölü havzası. Kuzeyde Kırıkkale ve Yozgat, doğuda Nevşehir, güneyde Aksaray, batıda Ankara.",
            "Kuzey": "Akpınar, Çiçekdağı, Yerköy ve Yozgat/Kırıkkale istikameti",
            "Doğu": "Mucur, Seyfe Gölü Kuş Cenneti, Hacıbektaş ve Nevşehir/Kayseri otoyolu",
            "Güney": "Kaman, Hirfanlı Baraj Gölü sahili, Ortaköy ve Aksaray istikameti",
            "Batı": "Kaman Ceviz Bahçeleri, Bala, Şereflikoçhisar ve Ankara istikameti"
        },
        "Kocaeli": {
            "Koordinatlar": "40°46′N 29°55′E (Enlem: 40.7654° Kuzey, Boylam: 29.9408° Doğu, Rakım: 25 m)",
            "Konum": "Marmara Bölgesi'nin sanayi kalbi, İzmit Körfezi kıyısı. Kuzeyde Karadeniz, doğuda Sakarya, güneyde Bursa ve Yalova, batıda İstanbul.",
            "Kuzey": "Kandıra, Kerpe, Kefken kayalıkları ve Karadeniz sahili",
            "Doğu": "Kartepe Kayak Merkezi, Sapanca Gölü kıyısı, Arifiye ve Adapazarı/Sakarya otoyolu",
            "Güney": "Başiskele, Gölcük Donanma Kenti, Karamürsel, Osmangazi Köprüsü ve Yalova/Bursa otoyolu",
            "Batı": "Derince Limanı, Körfez Tüpraş, Dilovası, Gebze Bilişim Vadisi ve İstanbul Anadolu yakası"
        },
        "Konya": {
            "Koordinatlar": "37°52′N 32°29′E (Enlem: 37.8667° Kuzey, Boylam: 32.4833° Doğu, Rakım: 1016 m)",
            "Konum": "Türkiye'nin yüzölçümü en büyük ili, tahıl ambarı ve Mevlana diyarı. Kuzeyde Ankara, doğuda Aksaray ve Niğde, güneyde Karaman ve Antalya, batıda Isparta ve Afyonkarahisar.",
            "Kuzey": "Kulu, Cihanbeyli Tuz Gölü batı yakası ve Ankara hızlı tren otoyolu",
            "Doğu": "Karapınar Meke Krateri, Ereğli Ovası ve Aksaray/Niğde/Adana istikameti",
            "Güney": "Çumra Çatalhöyük, Seydişehir Alüminyum, Bozkır ve Karaman/Antalya Toros geçişi",
            "Batı": "Beyşehir Gölü Milli Parkı, Ilgın Kaplıcaları, Akşehir Nasreddin Hoca ve Afyonkarahisar otoyolu"
        },
        "Kütahya": {
            "Koordinatlar": "39°25′N 29°59′E (Enlem: 39.4167° Kuzey, Boylam: 29.9833° Doğu, Rakım: 970 m)",
            "Konum": "Ege ile İç Anadolu kavşağı, çini ve porselen başkenti. Kuzeyde Bursa ve Bilecik, doğuda Eskişehir, güneyde Afyonkarahisar, batıda Manisa ve Balıkesir.",
            "Kuzey": "Domaniç Osmanlı Yaylaları, Tunçbilek, Tavşanlı ve İnegöl/Bursa istikameti",
            "Doğu": "Seyitömer, Porsuk Barajı havzası ve Eskişehir otoyolu",
            "Güney": "Zafertepe Çalköy, Dumlupınar Şehitliği, Altıntaş Zafer Havalimanı ve Afyonkarahisar otoyolu",
            "Batı": "Çavdarhisar Aizanoi Antik Kenti, Gediz, Simav termalleri ve Uşak/İzmir istikameti"
        },
        "Malatya": {
            "Koordinatlar": "38°21′N 38°19′E (Enlem: 38.3552° Kuzey, Boylam: 38.3095° Doğu, Rakım: 960 m)",
            "Konum": "Doğu Anadolu'nun kayısı başkenti, Fırat Nehri batı yakası ve Beydağları etekleri. Kuzeyde Erzincan ve Sivas, doğuda Elazığ, güneyde Adıyaman, batıda Kahramanmaraş.",
            "Kuzey": "Yazıhan, Hekimhan kanyonları, Kuluncak, Kangal ve Sivas istikameti",
            "Doğu": "Battalgazi Tarihi Kenti, Kömürhan Köprüsü, Karakaya Barajı ve Elazığ otoyolu",
            "Güney": "Yeşilyurt, Beydağları Tabiat Parkı, Doğanşehir, Çelikhan ve Adıyaman/Nemrut istikameti",
            "Batı": "Akçadağ, Levent Vadisi seyir terası, Darende Somuncu Baba ve Kayseri otoyolu"
        },
        "Manisa": {
            "Koordinatlar": "38°37′N 27°26′E (Enlem: 38.6191° Kuzey, Boylam: 27.4289° Doğu, Rakım: 70 m)",
            "Konum": "Ege Bölgesi'nin şehzadeler şehri ve sanayi devi, Spil Dağı eteği ve Gediz Ovası. Kuzeyde Balıkesir, doğuda Uşak ve Kütahya, güneyde Aydın ve Denizli, batıda İzmir.",
            "Kuzey": "Saruhanlı, Akhisar zeytin havzası, Kırkağaç, Soma ve Balıkesir/İstanbul otoyolu",
            "Doğu": "Turgutlu tuğla sanayii, Ahmetli, Salihli Sart Harabeleri, Kula Peri Bacaları ve Uşak/Ankara otoyolu",
            "Güney": "Spil Dağı Milli Parkı, Gölmarmara, Alaşehir ve Denizli/Aydın geçişi",
            "Batı": "Sabuncubeli Tüneli, Menemen ovası, Bornova ve İzmir metropol otoyolu"
        },
        "Mardin": {
            "Koordinatlar": "37°19′N 40°44′E (Enlem: 37.3212° Kuzey, Boylam: 40.7245° Doğu, Rakım: 1083 m)",
            "Konum": "Mezopotamya Ovası'na hakim kartal yuvası taş konaklar kenti. Kuzeyde Diyarbakır ve Batman, doğuda Şırnak ve Siirt, güneyde Suriye sınırı, batıda Şanlıurfa.",
            "Kuzey": "Deyrulzafaran Manastırı, Savur tarihi evleri, Mazıdağı ve Diyarbakır/Batman otoyolu",
            "Doğu": "Ömerli, Midyat Gümüşçüler Çarşısı, Mor Gabriel Manastırı ve Cizre/Şırnak istikameti",
            "Güney": "Mezopotamya Ovası, Dara Antik Kenti, Nusaybin Sınır Kapısı ve Suriye sınırı",
            "Batı": "Kızıltepe İpekyolu kavşağı, Derik zeytinlikleri, Viranşehir ve Şanlıurfa otoyolu"
        },
        "Mersin": {
            "Koordinatlar": "36°48′N 34°38′E (Enlem: 36.8000° Kuzey, Boylam: 34.6333° Doğu, Rakım: 10 m)",
            "Konum": "Doğu Akdeniz'in en büyük liman ve ticaret kenti, Toroslar eteği. Kuzeyde Karaman, Konya ve Niğde, doğuda Adana, batıda Antalya, güneyde Akdeniz.",
            "Kuzey": "Gözne Yaylası, Çamlıyayla, Gülek Boğazı ve Niğde/Ankara otoyolu",
            "Doğu": "Akdeniz Limanı, Tarsus Tarihi Şelalesi, Eshab-ı Kehf ve Adana/Çukurova otoyolu",
            "Güney": "Akdeniz sahili, Uluslararası Mersin Limanı ve Kuzey Kıbrıs feribot hattı",
            "Batı": "Erdemli Kızkalesi, Silifke Cennet-Cehennem, Aydıncık, Anamur ve Antalya sahil yolu"
        },
        "Muğla": {
            "Koordinatlar": "37°13′N 28°22′E (Enlem: 37.2153° Kuzey, Boylam: 28.3636° Doğu, Rakım: 660 m)",
            "Konum": "Güney Ege ve Akdeniz'in kesiştiği turizm cenneti. Kuzeyde Aydın, doğuda Denizli ve Burdur, güney ve batıda Ege/Akdeniz.",
            "Kuzey": "Yatağan termik havzası, Çine Madran Dağları ve Aydın/İzmir otoyolu",
            "Doğu": "Ula Akyaka Gökova Körfezi, Köyceğiz Gölü, Ortaca Dalyan, Fethiye Ölüdeniz ve Antalya sahil yolu",
            "Güney": "Sakar Geçidi, Marmaris Kalesi, Datça Yarımadası ve Akdeniz",
            "Batı": "Milas Karya Antik Kenti, Bodrum Yarımadası, Güllük Limanı ve Ege Denizi"
        },
        "Muş": {
            "Koordinatlar": "38°44′N 41°29′E (Enlem: 38.7432° Kuzey, Boylam: 41.5064° Doğu, Rakım: 1330 m)",
            "Konum": "Doğu Anadolu'nun verimli ovası, Murat Nehri vadisi. Kuzeyde Erzurum, doğuda Ağrı ve Bitlis, güneyde Batman ve Diyarbakır, batıda Bingöl.",
            "Kuzey": "Varto, Bingöl Dağları, Hınıs kanyonları ve Erzurum istikameti",
            "Doğu": "Malazgirt Zafer Meydanı (1071), Hasköy, Bulanık Gölleri ve Bitlis/Ağrı istikameti",
            "Güney": "Korkut Ovası, Kurtik Dağları, Kozluk Geçidi ve Batman/Diyarbakır istikameti",
            "Batı": "Tarihi Murat Köprüsü, Solhan Şeref Meydanı ve Bingöl/Elazığ otoyolu"
        },
        "Nevşehir": {
            "Koordinatlar": "38°37′N 34°43′E (Enlem: 38.6244° Kuzey, Boylam: 34.7142° Doğu, Rakım: 1150 m)",
            "Konum": "Kapadokya'nın masalsı kalbi, Peri Bacaları ve yer altı şehirleri diyarı. Kuzeyde Kırşehir ve Yozgat, doğuda Kayseri, güneyde Niğde, batıda Aksaray.",
            "Kuzey": "Avanos Çömlekçiler Çarşısı, Kızılırmak vadisi, Gülşehir ve Kırşehir/Ankara istikameti",
            "Doğu": "Ürgüp, Göreme Açık Hava Müzesi, Ortahisar Kalesi ve Kayseri otoyolu",
            "Güney": "Uçhisar Kalesi, Kaymaklı ve Derinkuyu Yer Altı Şehirleri ve Niğde istikameti",
            "Batı": "Acıgöl maar krateri, Nevşehir Kapadokya Havalimanı ve Aksaray/Konya istikameti"
        },
        "Niğde": {
            "Koordinatlar": "37°58′N 34°41′E (Enlem: 37.9667° Kuzey, Boylam: 34.6833° Doğu, Rakım: 1229 m)",
            "Konum": "İç Anadolu'nun güneydoğu kapısı, Aladağlar ve Bolkar Dağları gölgesinde. Kuzeyde Nevşehir, doğuda Kayseri, güneyde Adana ve Mersin, batıda Aksaray ve Konya.",
            "Kuzey": "Derinkuyu yer altı şehri geçişi, Misli Ovası ve Nevşehir/Kırşehir istikameti",
            "Doğu": "Aladağlar Milli Parkı (Demirkazık 3756 m), Çamardı ve Kayseri güney koridoru",
            "Güney": "Ulukışla, Gülek Boğazı, Çiftehan Kaplıcaları ve Adana/Mersin otoyolu",
            "Batı": "Bor Ovası, Tyana Antik Su Kemerleri, Altunhisar ve Aksaray/Konya otoyolu"
        },
        "Ordu": {
            "Koordinatlar": "40°59′N 37°53′E (Enlem: 40.9839° Kuzey, Boylam: 37.8764° Doğu, Rakım: 10 m)",
            "Konum": "Doğu Karadeniz'in fındık başkenti, Boztepe eteği ve deniz üzerine kurulu havalimanı kenti. Kuzeyde Karadeniz, doğuda Giresun, güneyde Tokat ve Sivas, batıda Samsun.",
            "Kuzey": "Karadeniz kıyı şeridi, Yason Burnu ve deniz sahil koridoru",
            "Doğu": "Gülyalı, Ordu-Giresun Havalimanı (OGU), Piraziz ve Giresun/Trabzon sahil yolu",
            "Güney": "Boztepe Seyir Terası teleferiği, Ulubey Kanyonu, Gölköy ve Tokat/Sivas iç karayolu",
            "Batı": "Perşembe Sakin Şehir, Fatsa, Ünye Çakırtepe ve Samsun sahil otoyolu"
        },
        "Osmaniye": {
            "Koordinatlar": "37°04′N 36°15′E (Enlem: 37.0742° Kuzey, Boylam: 36.2472° Doğu, Rakım: 125 m)",
            "Konum": "Çukurova'nın doğu kapısı, kaleler şehri ve fıstık diyarı. Kuzeyde Kahramanmaraş, doğuda Gaziantep, güneyde Hatay, batıda Adana.",
            "Kuzey": "Kadirli Karatepe-Aslantaş Milli Parkı, Andırın ve Kahramanmaraş istikameti",
            "Doğu": "Bahçe ilçesi, Ayran Tüneli, Nurdağı Geçidi ve Gaziantep otoyolu",
            "Güney": "Toprakkale Kalesi, Erzin, Dörtyol, İskenderun ve Hatay otoyolu",
            "Batı": "Ceyhan Ovası, Yılankale, Çukurova Üniversitesi ve Adana metropol otoyolu"
        },
        "Rize": {
            "Koordinatlar": "41°01′N 40°31′E (Enlem: 41.0208° Kuzey, Boylam: 40.5219° Doğu, Rakım: 10 m)",
            "Konum": "Doğu Karadeniz'in çay başkenti, Kaçkar Dağları ve Fırtına Vadisi. Kuzeyde Karadeniz, doğuda Artvin, güneyde Erzurum, batıda Trabzon.",
            "Kuzey": "Karadeniz sahil şeridi, Rize Limanı ve deniz dolgu havalimanı",
            "Doğu": "Çayeli, Pazar, Ardeşen, Fırtına Deresi, Çamlıhemşin Ayder Yaylası ve Artvin sahil yolu",
            "Güney": "İkizdere Vadisi, Ovit Dağı Tüneli (14 km) ve Erzurum/İspir Karadeniz-Doğu koridoru",
            "Batı": "Derepazarı, İyidere Lojistik Limanı, Of, Sürmene ve Trabzon sahil otoyolu"
        },
        "Sakarya": {
            "Koordinatlar": "40°46′N 30°24′E (Enlem: 40.7731° Kuzey, Boylam: 30.4012° Doğu, Rakım: 35 m)",
            "Konum": "Marmara ile Batı Karadeniz kavşağı, Sakarya Nehri ve Sapanca Gölü havzası. Kuzeyde Karadeniz, doğuda Düzce ve Bolu, güneyde Bilecik, batıda Kocaeli.",
            "Kuzey": "Karasu Plajı, Kocaali, Maden Deresi, Acarlar Longozu ve Karadeniz sahili",
            "Doğu": "Hendek sanayi bölgesi, Akyazı Kuzuluk Kaplıcaları ve Düzce/Bolu otoyolu",
            "Güney": "Geyve Boğazı, Pamukova, Taraklı Tarihi Evleri ve Bilecik/Eskişehir yolu",
            "Batı": "Serdivan Kampüsü, Sapanca Gölü, Kırkpınar, Kartepe ve İzmit/İstanbul otoyolu"
        },
        "Samsun": {
            "Koordinatlar": "41°17′N 36°20′E (Enlem: 41.2867° Kuzey, Boylam: 36.3300° Doğu, Rakım: 20 m)",
            "Konum": "Karadeniz'in en büyük metropolü, Milli Mücadele'nin ilk meşalesi ve Kızılırmak-Yeşilırmak deltaları. Kuzeyde Karadeniz, doğuda Ordu, güneyde Tokat ve Amasya, batıda Sinop ve Çorum.",
            "Kuzey": "Karadeniz Sahili, Bandırma Vapuru Açık Hava Müzesi ve Samsun Uluslararası Limanı",
            "Doğu": "Tekkeköy, Çarşamba Yeşilırmak Deltası, Terme Amazon diyarı ve Ordu sahil yolu",
            "Güney": "Kavak Rampaları, Havza Kaplıcaları, Ladik Akdağ Kayak ve Amasya/Ankara otoyolu",
            "Batı": "Atakum Sahil Bulvarı, Bafra Kızılırmak Deltası Kuş Cenneti, Alaçam ve Sinop sahil yolu"
        },
        "Siirt": {
            "Koordinatlar": "37°56′N 41°56′E (Enlem: 37.9333° Kuzey, Boylam: 41.9500° Doğu, Rakım: 895 m)",
            "Konum": "Güneydoğu Anadolu ile Doğu Anadolu geçiş havzası, Botan Kanyonu ve fıstık diyarı. Kuzeyde Bitlis, doğuda Van ve Şırnak, güneyde Mardin, batıda Batman.",
            "Kuzey": "Baykan, Veysel Karani Türbesi, Bitlis Deresi ve Tatvan/Van istikameti",
            "Doğu": "Tillo Işık Hadisesi türbesi, Pervari Balı yaylaları ve Şırnak/Van sınır dağları",
            "Güney": "Eruh, Botan Çayı Deliklitaş Rasıl Hacar kanyonu ve Şırnak istikameti",
            "Batı": "Kurtalan Ekspres Demiryolu İstasyonu, Batman Çayı ve Batman/Diyarbakır otoyolu"
        },
        "Sinop": {
            "Koordinatlar": "42°01′N 35°09′E (Enlem: 42.0231° Kuzey, Boylam: 35.1531° Doğu, Rakım: 25 m)",
            "Konum": "Türkiye'nin en kuzey ucu İnceburun, Tarihi Sinop Cezaevi ve doğal Hamsilos Koyu. Kuzeyde Karadeniz, doğu ve güneyde Samsun ve Çorum, batıda Kastamonu.",
            "Kuzey": "İnceburun Deniz Feneri (Türkiye'nin en kuzey noktası), Akliman ve Karadeniz",
            "Doğu": "Gerze Sahili, Dikmen Yaylaları, Yakakent ve Bafra/Samsun sahil yolu",
            "Güney": "Boyabat Kalesi, Saraydüzü, Durağan Barajı ve Kargı/Çorum karayolu",
            "Batı": "Hamsilos Fiyordu, Erfelek Tatlıca Şelaleleri (28 takım şelale), Ayancık, Türkeli ve Kastamonu sahil yolu"
        },
        "Sivas": {
            "Koordinatlar": "39°45′N 37°01′E (Enlem: 39.7477° Kuzey, Boylam: 37.0179° Doğu, Rakım: 1285 m)",
            "Konum": "İç Anadolu'nun doğu ucu, Selçuklu darüşşifaları ve Cumhuriyet Kongresi kenti. Kuzeyde Tokat, Ordu ve Giresun, doğuda Erzincan, güneyde Malatya ve Kahramanmaraş, batıda Yozgat ve Kayseri.",
            "Kuzey": "Çamlıbel Geçidi, Yıldızeli, Yıldız Dağı Kayak Merkezi ve Tokat/Ordu istikameti",
            "Doğu": "Hafik Gölleri, Zara, İmranlı Kızıldağ ve Erzincan/Erzurum otoyolu",
            "Güney": "Ulaş, Kangal Balıklı Kaplıcaları, Divriği Ulu Camii ve Malatya/Kayseri koridoru",
            "Batı": "Sıcak Çermik Kaplıcaları, Şarkışla Aşık Veysel diyarı ve Yozgat/Ankara hızlı tren hattı"
        },
        "Tekirdağ": {
            "Koordinatlar": "40°59′N 27°31′E (Enlem: 40.9833° Kuzey, Boylam: 27.5167° Doğu, Rakım: 15 m)",
            "Konum": "Marmara Bölgesi Trakya yakası, TEKULAŞ ulaşım ağı ve Marmara Denizi sahili. Doğuda İstanbul, batıda Edirne ve Çanakkale, kuzeyde Kırklareli, güneyde Marmara Denizi.",
            "Kuzey": "Muratlı Caddesi, Şehir Hastanesi, Saray, Kapaklı ve Kırklareli istikameti",
            "Doğu": "Değirmenaltı, Namık Kemal Üniversitesi, Çorlu, Velimeşe, Çerkezköy ve İstanbul otoyolu",
            "Güney": "Marmara Denizi, Sahil Dolgu Parkı, Ceyport Limanı, Şarköy ve Çanakkale istikameti",
            "Batı": "Hükümet Caddesi, Valilik Meydanı, Malkara, Hayrabolu ve Edirne istikameti"
        },
        "Tokat": {
            "Koordinatlar": "40°19′N 36°33′E (Enlem: 40.3167° Kuzey, Boylam: 36.5500° Doğu, Rakım: 623 m)",
            "Konum": "Orta Karadeniz iç kuşağı, Yeşilırmak vadisi ve Ballıca Mağarası diyarı. Kuzeyde Samsun, doğuda Ordu ve Sivas, güneyde Sivas, batıda Amasya.",
            "Kuzey": "Niksar Çamiçi Yaylası, Erbaa Ovası, Kelkit Vadisi ve Samsun/Ünye istikameti",
            "Doğu": "Reşadiye Kaplıcaları, Koyulhisar ormanları ve Erzincan/Giresun geçişi",
            "Güney": "Pazar Ballıca Mağarası, Artova, Çamlıbel Geçidi (1650 m) ve Sivas otoyolu",
            "Batı": "Turhal Şeker Fabrikası, Zile Tarihi Kalesi ve Amasya istikameti"
        },
        "Trabzon": {
            "Koordinatlar": "41°00′N 39°43′E (Enlem: 41.0027° Kuzey, Boylam: 39.7167° Doğu, Rakım: 35 m)",
            "Konum": "Doğu Karadeniz'in tarihi liman kenti, Sümela Manastırı ve Uzungöl diyarı. Kuzeyde Karadeniz, doğuda Rize, güneyde Gümüşhane ve Bayburt, batıda Giresun.",
            "Kuzey": "Karadeniz kıyı şeridi, Trabzon Limanı ve Boztepe seyir alanı",
            "Doğu": "Yomra, Arsin, Araklı, Sürmene, Of, Çaykara Uzungöl ve Rize sahil otoyolu",
            "Güney": "Maçka Altındere Vadisi, Sümela Manastırı, Zigana Dağı Tüneli ve Gümüşhane/Erzurum otoyolu",
            "Batı": "Akyazı Şenol Güneş Spor Kompleksi, Akçaabat Sahili, Vakfıkebir, Beşikdüzü ve Giresun sahil yolu"
        },
        "Tunceli": {
            "Koordinatlar": "39°06′N 39°33′E (Enlem: 39.1079° Kuzey, Boylam: 39.5401° Doğu, Rakım: 940 m)",
            "Konum": "Doğu Anadolu, Munzur Vadisi ve görkemli dağlar coğrafyası. Kuzey ve batıda Erzincan, doğuda Bingöl, güneyde Elazığ.",
            "Kuzey": "Munzur Vadisi Milli Parkı, Pülümür Ağlayan Kayalar, Sansa Boğazı ve Erzincan otoyolu",
            "Doğu": "Nazımiye Düzgün Baba Dağı, Mazgirt Kalesi, Peri Çayı ve Bingöl/Karlıova istikameti",
            "Güney": "Keban Baraj Gölü feribot geçişi, Pertek Kalesi ve Elazığ istikameti",
            "Batı": "Ovacık Munzur Gözeleri, Mercan Dağları ve Erzincan/Kemaliye kanyonları"
        },
        "Uşak": {
            "Koordinatlar": "38°41′N 29°24′E (Enlem: 38.6823° Kuzey, Boylam: 29.4082° Doğu, Rakım: 910 m)",
            "Konum": "İç Ege Bölgesi, dünyanın ikinci büyük kanyonu Ulubey Kanyonu ve ilkler kenti. Kuzeyde Kütahya, doğuda Afyonkarahisar, güneyde Denizli, batıda Manisa.",
            "Kuzey": "Gediz Nehri havzası, Murat Dağı etekleri ve Simav/Kütahya istikameti",
            "Doğu": "Banaz Hamamboğazı Termal Turizm Alanı ve Afyonkarahisar/Ankara otoyolu (D-300)",
            "Güney": "Ulubey Kanyonu Cam Terası, Karahallı Clandras Tarihi Köprüsü ve Denizli otoyolu",
            "Batı": "Eşme kilimleri diyarı, Kula Peri Bacaları geçişi ve Salihli/İzmir otoyolu (D-300)"
        },
        "Van": {
            "Koordinatlar": "38°30′N 43°23′E (Enlem: 38.4891° Kuzey, Boylam: 43.3800° Doğu, Rakım: 1727 m)",
            "Konum": "Doğu Anadolu'nun incisi, Van Gölü (Van Denizi) ve Urartu Krallığı başkenti Tuşba. Kuzeyde Ağrı, doğuda İran, güneyde Hakkâri ve Şırnak, batıda Bitlis.",
            "Kuzey": "Muradiye Şelalesi, Erciş İnci Kefali göçü, Tendürek Volkanı ve Doğubayazıt/Ağrı istikameti",
            "Doğu": "Özalp, Saray Kapıköy Uluslararası Sınır Kapısı ve İran (Tebriz/Tahran) tren yolu",
            "Güney": "Van Kalesi, Gevaş Akdamar Adası Kilisesi, Güzeldere Geçidi (2730 m) ve Hakkâri istikameti",
            "Batı": "Van Gölü feribot hattı, Tatvan İskelesi, Nemrut Krateri ve Bitlis/Muş otoyolu"
        },
        "Yalova": {
            "Koordinatlar": "40°39′N 29°16′E (Enlem: 40.6500° Kuzey, Boylam: 29.2667° Doğu, Rakım: 5 m)",
            "Konum": "Marmara'nın şifalı termalleri, Yürüyen Köşk ve Osmangazi Köprüsü kenti. Kuzeyde Marmara Denizi, doğuda Kocaeli, güney ve batıda Bursa.",
            "Kuzey": "Marmara Denizi, İDO Hızlı Feribot İskelesi, Adalar ve İstanbul (Yenikapı/Pendik) deniz hattı",
            "Doğu": "Çiftlikköy, Taşköprü Sanayi, Altınova Tersaneler Bölgesi, Osmangazi Köprüsü ve Kocaeli/İzmit otoyolu",
            "Güney": "Termal Kaplıcaları, Çınarcık Teşvikiye Kent Ormanı, Erikli Şelalesi, Armutlu ve Gemlik/Bursa yolu",
            "Batı": "Esenköy Sahili, Armutlu Yarımadası Feneri, Çınarcık ve Marmara Denizi kıyısı"
        },
        "Yozgat": {
            "Koordinatlar": "39°49′N 34°48′E (Enlem: 39.8181° Kuzey, Boylam: 34.8147° Doğu, Rakım: 1300 m)",
            "Konum": "İç Anadolu'nun tarihi Bozok Platosu ve Türkiye'nin ilk milli parkı Çamlık kenti. Kuzeyde Çorum ve Amasya, doğuda Sivas, güneyde Kayseri ve Nevşehir, batıda Kırıkkale ve Ankara.",
            "Kuzey": "Çekerek Barajı, Aydıncık, Kadışehri ve Tokat/Amasya istikameti",
            "Doğu": "Sorgun termalleri, Akdağmadeni ormanları, Saraykent ve Sivas otoyolu",
            "Güney": "Yerköy, Boğazlıyan Şeker Fabrikası, Çandır, Yenifakılı ve Kayseri/Nevşehir istikameti",
            "Batı": "Yozgat Çamlığı Milli Parkı, Musabeyli Barajı, Delice ve Kırıkkale/Ankara hızlı tren hattı"
        },
        "Zonguldak": {
            "Koordinatlar": "41°27′N 31°47′E (Enlem: 41.4564° Kuzey, Boylam: 31.7987° Doğu, Rakım: 15 m)",
            "Konum": "Batı Karadeniz'in taşkömürü ve ağır sanayi başkenti, liman ve maden kenti. Kuzey ve batıda Karadeniz, doğuda Bartın ve Karabük, güneyde Bolu.",
            "Kuzey": "Karadeniz kıyı şeridi, Zonguldak Limanı ve Fener Burnu deniz feneri",
            "Doğu": "Kilimli, Çatalağzı Termik Santrali, Filyos Vadisi Projesi ve Bartın sahil yolu",
            "Güney": "Gökçebey, Devrek Bastoncular Çarşısı, Mengen Boğazı ve Bolu otoyolu",
            "Batı": "Kozlu Sahili, Ilıksu, Kandilli madenleri, Karadeniz Ereğli Çelik Fabrikaları ve Alaplı kıyısı"
        },
        "Şanlıurfa": {
            "Koordinatlar": "37°10′N 38°47′E (Enlem: 37.1674° Kuzey, Boylam: 38.7955° Doğu, Rakım: 518 m)",
            "Konum": "Güneydoğu Anadolu'nun peygamberler şehri, tarihin sıfır noktası Göbeklitepe ve GAP başkenti. Kuzeyde Adıyaman ve Diyarbakır, doğuda Mardin, güneyde Suriye, batıda Gaziantep.",
            "Kuzey": "Hilvan Ovası, Siverek Karacadağ bazalt platosu, Atatürk Barajı ve Diyarbakır/Adıyaman otoyolu",
            "Doğu": "Göbeklitepe ve Karahantepe Ören Yerleri, Viranşehir, Ceylanpınar ve Mardin otoyolu",
            "Güney": "Balıklıgöl (Halil-ür Rahman), Harran Kümbet Evleri, Akçakale Sınır Kapısı ve Suriye sınırı",
            "Batı": "Suruç Ovası, Birecik Fırat Köprüsü, Halfeti Saklı Cennet ve Gaziantep otoyolu"
        },
        "Şırnak": {
            "Koordinatlar": "37°31′N 42°27′E (Enlem: 37.5164° Kuzey, Boylam: 42.4578° Doğu, Rakım: 1400 m)",
            "Konum": "Güneydoğu Anadolu'nun sınır kapısı, Cudi Dağı ve Habur ticaret koridoru. Kuzeyde Siirt ve Van, doğuda Hakkâri, güneyde Irak ve Suriye, batıda Mardin.",
            "Kuzey": "Göründü Vadisi, Eruh Geçidi, Bestler-Dereler ve Siirt/Van istikameti",
            "Doğu": "Uludere, Beytüşşebap Faraşin Yaylası, Kato Dağı ve Hakkâri istikameti",
            "Güney": "Cudi Dağı etekleri, Silopi Ovası, Habur Uluslararası Sınır Kapısı ve Irak sınırı",
            "Batı": "Kasrik Boğazı tarihi su kemerleri, Cizre Kırmızı Medrese, Dicle Köprüsü ve Nusaybin/Mardin otoyolu"
        }
    },

    // Şehir GPS Koordinatını Getir (Şapkalı harf ve boşluk toleranslı)
    getCityCoordinates: function(cityName) {
        if (!cityName) return null;
        const cleanName = cityName.trim();
        if (this.turkiye81GPS && this.turkiye81GPS[cleanName]) {
            return this.turkiye81GPS[cleanName];
        }
        // Şapkalı harf (Hakkâri / Hakkari vb.) varyasyonlarını dinamik kontrol et
        const altName = cleanName.includes('â') ? cleanName.replace(/â/g, 'a') : (cleanName === 'Hakkari' ? 'Hakkâri' : cleanName);
        if (this.turkiye81GPS && this.turkiye81GPS[altName]) {
            return this.turkiye81GPS[altName];
        }
        if (typeof sehirRotalari !== 'undefined') {
            const srObj = sehirRotalari[cleanName] || sehirRotalari[altName];
            if (srObj && srObj.coordinates) {
                const c = srObj.coordinates;
                return [c.lat || c.enlem, c.lon || c.boylam];
            }
        }
        return null;
    },

    // İki GPS koordinatı arasındaki gerçek coğrafi kerteriz / azimut açısını hesapla (0° - 360°)
    calculateBearing: function(lat1, lon1, lat2, lon2) {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
        const toRad = deg => (deg * Math.PI) / 180;
        const toDeg = rad => (rad * 180) / Math.PI;

        const phi1 = toRad(lat1);
        const phi2 = toRad(lat2);
        const deltaLambda = toRad(lon2 - lon1);

        const y = Math.sin(deltaLambda) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

        let brng = toDeg(Math.atan2(y, x));
        brng = (brng + 360) % 360;
        return Math.round(brng);
    },

    // İki GPS koordinatı arasındaki mesafeyi kilometre cinsinden hesapla (Haversine Formülü)
    calculateDistanceKm: function(lat1, lon1, lat2, lon2) {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
        const R = 6371; // Dünya yarıçapı km
        const toRad = deg => (deg * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    },

    // Azimut açısını 4 ana yön pusula nesnesine dönüştür
    getCardinalFromBearing: function(bearing) {
        bearing = ((bearing % 360) + 360) % 360;
        if (bearing >= 315 || bearing < 45) {
            return { name: "Kuzey", icon: "⬆️", angle: 0, arrowKey: "ArrowUp" };
        } else if (bearing >= 45 && bearing < 135) {
            return { name: "Doğu", icon: "➡️", angle: 90, arrowKey: "ArrowRight" };
        } else if (bearing >= 135 && bearing < 225) {
            return { name: "Güney", icon: "⬇️", angle: 180, arrowKey: "ArrowDown" };
        } else {
            return { name: "Batı", icon: "⬅️", angle: 270, arrowKey: "ArrowLeft" };
        }
    },

    // Stereo / 3D Mekanik Pusula Klik ve Akustik Sinyal Sentezi (Web Audio API)
    playCompassTone: function(cardinal) {
        try {
            if (typeof audio === 'undefined' || !audio.ctx) return;
            const ctx = audio.ctx;
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

            osc.type = "sine";
            osc.frequency.setValueAtTime(cardinal.freq || 660, ctx.currentTime);

            // Kısa, tok ve net akustik tıklama envelope'u
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

            if (pan && typeof cardinal.pan === 'number') {
                pan.pan.setValueAtTime(cardinal.pan, ctx.currentTime);
                osc.connect(pan);
                pan.connect(gain);
            } else {
                osc.connect(gain);
            }

            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);

            // İkinci bir mikro klik sesi (Mekanik pusula iğne hissi)
            setTimeout(() => {
                try {
                    if (ctx.state !== 'running') return;
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.type = "triangle";
                    osc2.frequency.setValueAtTime((cardinal.freq || 660) * 1.5, ctx.currentTime);
                    gain2.gain.setValueAtTime(0.12, ctx.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.start(ctx.currentTime);
                    osc2.stop(ctx.currentTime + 0.05);
                } catch(e) {}
            }, 30);
        } catch(e) {
            console.warn("Pusula sesi çalınamadı:", e);
        }
    },

    // Yön değiştirme (Shift + Ok tuşları)
    handleDirection: function(arrowKey) {
        const dir = this.cardinals[arrowKey];
        if (!dir) return;

        this.currentDirection = dir.name;
        this.currentAngle = dir.angle;

        if (typeof Game !== 'undefined') {
            Game.currentCompassDirection = dir.name;
            Game.currentCompassAngle = dir.angle;
        }

        // 3D Akustik ses bildirimi
        this.playCompassTone(dir);

        const isDriving = (typeof Game !== 'undefined' && Game.isDriving);
        if (isDriving) {
            this.handleDrivingCompass(dir);
        } else {
            this.handleMenuCompass(dir);
        }
        this.updateHUD(dir);
    },

    // Tek tuşla ('Y' tuşu veya Sesli Asistan) anlık pusula sorgusu
    queryCompass: function() {
        const dir = this.cardinals[
            this.currentDirection === "Kuzey" ? "ArrowUp" :
            this.currentDirection === "Doğu" ? "ArrowRight" :
            this.currentDirection === "Güney" ? "ArrowDown" : "ArrowLeft"
        ] || this.cardinals.ArrowUp;

        this.playCompassTone(dir);
        const report = this.getStatusReport(dir);

        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(report);
        }
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
            audio.updateNvdaLiveRegion(report);
        }
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
            UI.showToast(`🧭 Pusula: ${dir.icon || '🧭'} ${dir.name || 'Kuzey'} (${typeof dir.angle === 'number' ? dir.angle : 0}°)`, 'info');
        }
        this.updateHUD(dir);
        return report;
    },

    // Dinamik durum ve istikamet raporu üretir
    getStatusReport: function(dir) {
        dir = dir || this.cardinals.ArrowUp;
        const isDriving = (typeof Game !== 'undefined' && Game.isDriving);
        const city = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";

        let report = `Pusula İstikameti: ${dir.name || 'Kuzey'} (${typeof dir.angle === 'number' ? dir.angle : 0} derece). `;

        // Aktif rota ve durak analizi
        if (typeof Game !== 'undefined' && Game.activeRouteData) {
            const r = Game.activeRouteData;
            const isCompleted = (r.stops && Game.currentStopIndex >= r.stops.length);
            if (isCompleted) {
                report += "Sefer başarıyla tamamlandı. Son durağa ulaşıldı.";
                return report;
            }

            const currentStop = (r.stops && r.stops[Game.currentStopIndex]) ? r.stops[Game.currentStopIndex].name : "";
            const remDist = Math.max(0, Math.round(Game.currentDistanceToNext || 0));
            const distStr = remDist >= 1000 ? (remDist / 1000).toFixed(1) + " kilometre" : remDist + " metre";

            const routeDir = this.inferRouteDirection(r);
            if (routeDir) {
                if (routeDir === dir.name) {
                    report += `Rotanızla tam uyumlu ilerliyorsunuz. Sıradaki durak: ${currentStop}, yaklaşık ${distStr} kaldı.`;
                } else {
                    report += `Hedef rota ${routeDir} yönünde. Sıradaki durak: ${currentStop}, yaklaşık ${distStr} kaldı.`;
                }
            } else {
                report += `Sıradaki durak: ${currentStop}, yaklaşık ${distStr} kaldı.`;
            }
        } else {
            report += this.getLandmarkDesc(city, dir.name);
        }

        return report;
    },

    // Rota adından, duraklarından ve gerçek GPS koordinatlarından rotanın genel yönünü çıkarsama
    inferRouteDirection: function(route) {
        if (!route) return null;

        // 1. Şehirlerarası seferde gerçek GPS koordinatları ile azimut hesaplama
        if (route.isIntercity && route.destCity) {
            const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
            const c1 = this.getCityCoordinates(currentCity);
            const c2 = this.getCityCoordinates(route.destCity);
            if (c1 && c2) {
                const bearing = this.calculateBearing(c1[0], c1[1], c2[0], c2[1]);
                return this.getCardinalFromBearing(bearing).name;
            }
        }

        // 2. Sürüş halindeyse aktif durak segmenti kerterizi, değilse ilk-son durak kerterizi
        if (route.stops && route.stops.length >= 2) {
            if (typeof Game !== 'undefined' && typeof Game.currentStopIndex === 'number' && Game.currentStopIndex > 0 && Game.currentStopIndex < route.stops.length) {
                const sPrev = route.stops[Game.currentStopIndex - 1];
                const sNext = route.stops[Game.currentStopIndex];
                if (sPrev && sNext && sPrev.lat && sPrev.lon && sNext.lat && sNext.lon) {
                    const bearing = this.calculateBearing(sPrev.lat, sPrev.lon, sNext.lat, sNext.lon);
                    return this.getCardinalFromBearing(bearing).name;
                }
            }
            const s1 = route.stops[0];
            const s2 = route.stops[route.stops.length - 1];
            if (s1.lat && s1.lon && s2.lat && s2.lon) {
                const bearing = this.calculateBearing(s1.lat, s1.lon, s2.lat, s2.lon);
                return this.getCardinalFromBearing(bearing).name;
            }
        }

        // 3. Rota adı ve açıklama metin analizi
        const name = ((route.name || "") + " " + (route.desc || "")).toLowerCase();
        if (name.includes("kuzey") || name.includes("saray") || name.includes("muratlı") || name.includes("hastane") || name.includes("otogar")) return "Kuzey";
        if (name.includes("doğu") || name.includes("çorlu") || name.includes("velimeşe") || name.includes("değirmenaltı") || name.includes("üniversite") || name.includes("istanbul")) return "Doğu";
        if (name.includes("güney") || name.includes("şarköy") || name.includes("ereğli") || name.includes("sahil") || name.includes("liman") || name.includes("çanakkale")) return "Güney";
        if (name.includes("batı") || name.includes("malkara") || name.includes("hayrabolu") || name.includes("valilik") || name.includes("keşan") || name.includes("edirne")) return "Batı";

        return null;
    },

    getLandmarkDesc: function(city, dirName) {
        if (!city) city = "Tekirdağ";
        const cleanCity = city.trim();
        const altCity = cleanCity.includes('â') ? cleanCity.replace(/â/g, 'a') : (cleanCity === 'Hakkari' ? 'Hakkâri' : cleanCity);

        if (this.cityLandmarks) {
            if (this.cityLandmarks[cleanCity] && this.cityLandmarks[cleanCity][dirName]) {
                return this.cityLandmarks[cleanCity][dirName];
            }
            if (this.cityLandmarks[altCity] && this.cityLandmarks[altCity][dirName]) {
                return this.cityLandmarks[altCity][dirName];
            }
        }

        if (typeof sehirRotalari !== 'undefined' && sehirRotalari[cleanCity] && sehirRotalari[cleanCity].komsular) {
            const dirMap = { "Kuzey": "kuzey", "Doğu": "dogu", "Güney": "guney", "Batı": "bati" };
            const kKey = dirMap[dirName];
            if (kKey && sehirRotalari[cleanCity].komsular[kKey]) {
                return `${sehirRotalari[cleanCity].komsular[kKey]} istikameti`;
            }
        }

        // Türkiye 81 il GPS ağı üzerinden o yöndeki komşuları çıkarsama
        const c1 = this.getCityCoordinates(cleanCity);
        if (c1 && typeof sehirRotalari !== 'undefined' && sehirRotalari[cleanCity] && Array.isArray(sehirRotalari[cleanCity].komsuIller)) {
            const matchingNeighbors = [];
            for (const neighbor of sehirRotalari[cleanCity].komsuIller) {
                const c2 = this.getCityCoordinates(neighbor);
                if (c2) {
                    const bearing = this.calculateBearing(c1[0], c1[1], c2[0], c2[1]);
                    if (this.getCardinalFromBearing(bearing).name === dirName) {
                        matchingNeighbors.push(neighbor);
                    }
                }
            }
            if (matchingNeighbors.length > 0) {
                return `${matchingNeighbors.join(', ')} istikameti`;
            }
        }
        return `${cleanCity} çevresi ${dirName} yönü`;
    },

    handleDrivingCompass: function(dir) {
        const report = this.getStatusReport(dir);
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(report);
        }
        if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
            audio.updateNvdaLiveRegion(report);
        }
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
            UI.showToast(`🧭 İstikamet ${dir.icon || '🧭'} ${dir.name || 'Kuzey'} (${typeof dir.angle === 'number' ? dir.angle : 0}°)`, 'info');
        }
    },

    handleMenuCompass: function(dir) {
        // 0. İller Arası Sefer Seçim Modalı (Pusula ile komşu ve hedef il seçimi)
        const intercityModal = document.getElementById('intercity-dest-modal');
        if (intercityModal && !intercityModal.classList.contains('hidden')) {
            this.handleIntercityDestCompass(dir);
            return;
        }

        // 1. Bölge & İlçe Seçim Modalı (9 İlçe Pusula Desteği)
        const districtPickerModal = document.getElementById('district-picker-modal');
        if (districtPickerModal && !districtPickerModal.classList.contains('hidden')) {
            this.handleDistrictPickerCompass(dir);
            return;
        }

        // 2. Harita Ekranı (Şehirler Arası)
        const baseSelection = document.getElementById('base-selection-menu');
        if (baseSelection && !baseSelection.classList.contains('hidden')) {
            this.handleMapMenu(dir);
            return;
        }

        // 3. İlçe Seçim Modalı
        const districtModal = document.getElementById('district-dest-modal');
        if (districtModal && !districtModal.classList.contains('hidden')) {
            this.handleDistrictMenu(dir);
            return;
        }

        // 4. Şehir İçi Hat Listesi
        const routeMenu = document.getElementById('route-menu');
        if (routeMenu && !routeMenu.classList.contains('hidden')) {
            this.handleRouteMenu(dir);
            return;
        }

        // 5. Ana Menüde genel yön anonsu
        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const landmark = this.getLandmarkDesc(currentCity, dir.name);
        const msg = `${dir.name || 'Kuzey'} (${typeof dir.angle === 'number' ? dir.angle : 0}°): ${landmark}`;
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.icon} ${msg}`, 'info');
    },

    // İller Arası Sefer Menüsünde Pusula ile Yön Odaklama
    handleIntercityDestCompass: function(dir) {
        const listEl = document.getElementById('intercity-dest-list');
        if (!listEl) return;

        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const buttons = Array.from(listEl.querySelectorAll('button'));
        if (buttons.length === 0) return;

        let matchedBtn = null;
        let targetCity = null;

        // 1. Doğrudan komsular nesnesi kontrolü
        const cityData = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[currentCity] : null;
        if (cityData && cityData.komsular) {
            const dirMap = {
                "Kuzey": cityData.komsular.kuzey,
                "Doğu": cityData.komsular.dogu,
                "Güney": cityData.komsular.guney,
                "Batı": cityData.komsular.bati
            };
            const neighborStr = dirMap[dir.name];
            if (neighborStr) {
                const subNames = neighborStr.split(/[\/,-]+/).map(s => s.trim().toLowerCase());
                for (const btn of buttons) {
                    const btnText = btn.innerText.toLowerCase();
                    if (subNames.some(sub => sub && btnText.includes(sub))) {
                        matchedBtn = btn;
                        targetCity = subNames.find(sub => sub && btnText.includes(sub));
                        break;
                    }
                }
            }
        }

        // 2. GPS Azimut Açısı ile En Uygun İli Eşleştirme
        const c1 = this.getCityCoordinates(currentCity);
        if (!matchedBtn && c1) {
            let bestCity = null;
            let bestDiff = 999;
            let bestBtn = null;

            for (const btn of buttons) {
                const strong = btn.querySelector('strong');
                const rawText = strong ? strong.innerText : btn.innerText;
                const cityName = rawText.split('\n')[0].replace(/\r/g, '').trim();
                const c2 = this.getCityCoordinates(cityName);
                if (c2) {
                    const bearing = this.calculateBearing(c1[0], c1[1], c2[0], c2[1]);
                    const card = this.getCardinalFromBearing(bearing);
                    if (card.name === dir.name) {
                        const diff = Math.abs(bearing - dir.angle);
                        const normDiff = Math.min(diff, 360 - diff);
                        if (normDiff < bestDiff) {
                            bestDiff = normDiff;
                            bestCity = cityName;
                            bestBtn = btn;
                        }
                    }
                }
            }
            if (bestBtn) {
                matchedBtn = bestBtn;
                targetCity = bestCity;
            }
        }

        if (matchedBtn) {
            matchedBtn.focus();
            if (typeof matchedBtn.scrollIntoView === 'function') {
                matchedBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-focused'));
            matchedBtn.classList.add('nav-focused');

            const cleanName = targetCity ? (targetCity.charAt(0).toUpperCase() + targetCity.slice(1)) : "Hedef İl";
            const announcement = `${dir.name} İstikameti: ${cleanName}. Seferi başlatmak için Enter'a basın.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(announcement);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(announcement);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.name} ➔ ${cleanName}`, 'info');
        } else {
            const msg = `${currentCity} için ${dir.name} yönünde doğrudan sefer noktası bulunamadı.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(msg, 'warning');
        }
    },

    handleMapMenu: function(dir) {
        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const cityData = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[currentCity] : null;

        let targetCity = null;
        if (cityData && cityData.komsular) {
            const dirMap = {
                "Kuzey": cityData.komsular.kuzey,
                "Doğu": cityData.komsular.dogu,
                "Güney": cityData.komsular.guney,
                "Batı": cityData.komsular.bati
            };
            targetCity = dirMap[dir.name];
        }

        if (targetCity) {
            const listEl = document.getElementById('city-selection-list');
            if (listEl) {
                const buttons = listEl.querySelectorAll('button');
                const cleanTarget = targetCity.split(/[\(\/\-]/)[0].trim().toLowerCase();
                buttons.forEach(btn => {
                    const btnText = btn.innerText.toLowerCase();
                    if (btnText.includes(cleanTarget) || cleanTarget.includes(btnText.trim())) {
                        btn.focus();
                        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-focused'));
                        btn.classList.add('nav-focused');
                    }
                });
            }
        } else {
            const noRoute = `${currentCity} için ${dir.name} yönünde doğrudan komşu şehir hattı bulunmuyor.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(noRoute);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(noRoute, 'warning');
        }
    },

    handleDistrictPickerCompass: function(dir) {
        const listEl = document.getElementById('district-picker-list');
        if (!listEl) return;

        // Süleymanpaşa merkezli coğrafi yönler
        const keywords = {
            "Kuzey": ["saray", "muratlı"],
            "Doğu": ["çorlu", "velimeşe", "çerkezköy"],
            "Güney": ["şarköy"],
            "Batı": ["malkara", "hayrabolu"]
        };
        const targets = keywords[dir.name] || [];

        let foundBtn = null;
        const buttons = listEl.querySelectorAll('button');
        for (const btn of buttons) {
            const text = (btn.getAttribute('data-dist-id') || btn.innerText).toLowerCase();
            if (targets.some(k => text.includes(k))) {
                foundBtn = btn;
                break;
            }
        }

        if (foundBtn) {
            foundBtn.focus();
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-focused'));
            foundBtn.classList.add('nav-focused');
            const distName = foundBtn.innerText.split('\n')[0].trim();
            const msg = `${dir.name} Yönü: ${distName}. Seçmek için Enter'a basın.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.name} ➔ ${distName}`, 'info');
        }
    },

    handleDistrictMenu: function(dir) {
        const listEl = document.getElementById('district-dest-list');
        if (!listEl) return;

        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const buttons = Array.from(listEl.querySelectorAll('button'));
        if (buttons.length === 0) return;

        const dirMap = {
            "Kuzey": ["saray", "muratlı", "kapaklı"],
            "Doğu": ["çorlu", "velimeşe", "çerkezköy", "marmaraereğlisi"],
            "Güney": ["şarköy", "sahil", "liman"],
            "Batı": ["malkara", "hayrabolu"]
        };

        const targets = dirMap[dir.name] || [];
        let matchedBtn = null;

        for (const btn of buttons) {
            const btnText = btn.innerText.toLowerCase();
            if (targets.some(t => btnText.includes(t))) {
                matchedBtn = btn;
                break;
            }
        }

        if (matchedBtn) {
            matchedBtn.focus();
            matchedBtn.classList.add('nav-focused');
            const cleanName = matchedBtn.innerText.split('\n')[0].replace('📍', '').trim();
            const msg = `${dir.name} İstikameti: ${cleanName}. Seferi başlatmak için Enter'a basın.`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.name} ➔ ${cleanName}`, 'info');
        }
    },

    handleRouteMenu: function(dir) {
        const listEl = document.getElementById('routes-list');
        if (!listEl) return;
        const buttons = listEl.querySelectorAll('button');
        if (buttons.length === 0) return;

        const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
        const landmark = this.getLandmarkDesc(currentCity, dir.name);
        const msg = `${dir.name || 'Kuzey'} İstikameti (${typeof dir.angle === 'number' ? dir.angle : 0}°): ${landmark}`;
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') audio.speak(msg);
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') UI.showToast(`🧭 ${dir.icon} ${msg}`, 'info');
    },

    updateHUD: function(dir) {
        dir = dir || (this.cardinals && this.cardinals.ArrowUp) || { icon: '⬆️', name: 'KUZEY', angle: 0 };
        const compassHud = document.getElementById('hud-compass');
        const compassText = document.getElementById('hud-compass-text');
        const icon = dir.icon || '🧭';
        const dName = (dir.name || 'KUZEY').toUpperCase();
        const angle = (typeof dir.angle === 'number' && !isNaN(dir.angle)) ? dir.angle : 0;
        if (compassText) {
            compassText.innerText = `${icon} ${dName} (${angle}°)`;
        } else if (compassHud) {
            compassHud.innerText = `🧭 ${icon} ${dName} (${angle}°)`;
        }
    },

    // Türkiye Denizleri Bilgilendirme ve Kerteriz Sorgulama
    getSeaInfo: function(seaName) {
        if (typeof turkiyeDenizleri === 'undefined') return null;
        const norm = (seaName || "").toLowerCase();
        if (norm.includes("kara")) return turkiyeDenizleri["Karadeniz"];
        if (norm.includes("marmara")) return turkiyeDenizleri["Marmara Denizi"];
        if (norm.includes("ege")) return turkiyeDenizleri["Ege Denizi"];
        if (norm.includes("akdeniz")) return turkiyeDenizleri["Akdeniz"];
        if (norm.includes("van")) return turkiyeDenizleri["Van Gölü (Van Denizi)"];
        return null;
    },

    querySea: function(seaName) {
        const sea = this.getSeaInfo(seaName);
        if (sea && typeof audio !== 'undefined' && audio.speak) {
            audio.speak(sea.sesliTanitim);
            return sea;
        }
        return null;
    }
};

// Global erişim ve takma ad entegrasyonu
if (typeof window !== 'undefined') {
    window.CompassSystem = CompassSystem;
    window.CompassNav = CompassSystem;
}

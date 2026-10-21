/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU VERİ DOSYASI (DATA.JS)
   ========================================================================== */

const masterCitiesList = ["Gümüşhane", "Giresun", "Gaziantep", "Eskişehir", "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Elazığ", "Erzincan", "Erzurum", "Konya", "Tekirdağ", "Yalova", "Bayburt", "Edirne", "Kırklareli", "İstanbul", "Çanakkale", "Sinop", "Hakkâri", "Hatay", "Isparta", "Mersin", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırşehir", "Kocaeli", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sivas", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Karabük", "Kilis", "Osmaniye", "Düzce"];

// Åehirlerin sadece coğrafi komşuları ve API sorguları bulunur. Rotalar dinamik oluşturulur.
const sehirRotalari = {
    "Adana": {
        plaka: "01",
        bolge: "Akdeniz",
        merkezeMesafeKm: 1050,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-01"]->.adana; (node["highway"="bus_stop"](area.adana););`,
        ilcelerBilgisi: {
            toplamIlceSayisi: 15,
            aciklama: "Adana'nın 5'i merkez ilçe olmak üzere toplam 15 ilçesi bulunur: Merkez İlçeler (5): Seyhan, Yüreğir, Çukurova, Sarıçam, Karaisalı (Merkezle bütünleşik yapıda kabul edilir). Güney / Ova ve Kıyı İlçeleri (3): Ceyhan, Karataş, Yumurtalık. Kuzey / Dağlık ve Yayla İlçeleri (7): Kozan, İmamoğlu, Aladağ, Feke, Saimbeyli, Tufanbeyli, Pozantı.",
            kategoriler: {
                merkezIlceler: ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Karaisalı"],
                guneyKiyiIlceler: ["Ceyhan", "Karataş", "Yumurtalık"],
                kuzeyYaylaIlceler: ["Kozan", "İmamoğlu", "Aladağ", "Feke", "Saimbeyli", "Tufanbeyli", "Pozantı"]
            },
            liste: [
                { id: "Seyhan", ad: "Seyhan", grup: "Merkez", rol: "Tarihi ve Ticari Çekirdek (Merkez)", lat: 36.9914, lon: 35.2842, merkezeMesafeKm: 0, aciklama: "Merkez ilçe. Taşköprü, Sabancı Camii ve Büyükşehir Otogarı." },
                { id: "Yüreğir", ad: "Yüreğir", grup: "Merkez", rol: "Doğu Yakası & Köprübaşı", lat: 36.9850, lon: 35.3450, merkezeMesafeKm: 5, aciklama: "Merkez ilçe. Seyhan Nehri doğu yakası ve otogar aksı." },
                { id: "Çukurova", ad: "Çukurova", grup: "Merkez", rol: "Kuzeybatı & Seyhan Barajı", lat: 37.0500, lon: 35.2800, merkezeMesafeKm: 8, aciklama: "Merkez ilçe. Seyhan Baraj Gölü, Turgut Özal Bulvarı ve modern yerleşim." },
                { id: "Sarıçam", ad: "Sarıçam", grup: "Merkez", rol: "Kuzeydoğu & Kampüs / OSB", lat: 37.0300, lon: 35.3800, merkezeMesafeKm: 12, aciklama: "Merkez ilçe. Çukurova Üniversitesi Balcalı ve Yeni Stadyum." },
                { id: "Karaisalı", ad: "Karaisalı", grup: "Merkez", rol: "Merkezle Bütünleşik & Varda Köprüsü", lat: 37.2550, lon: 35.0600, merkezeMesafeKm: 50, aciklama: "Merkez ilçe. Tarihi Varda (Alman) Köprüsü ve Kapıkaya Kanyonu." },
                { id: "Ceyhan", ad: "Ceyhan", grup: "Güney / Ova ve Kıyı", rol: "Sanayi & Enerji Koridoru", lat: 37.0294, lon: 35.8175, merkezeMesafeKm: 47, aciklama: "Güney ova ve sanayi ilçesi. BOTAŞ boru hatları ve liman bağlantısı." },
                { id: "Karataş", ad: "Karataş", grup: "Güney / Ova ve Kıyı", rol: "Akdeniz Kıyısı & Balıkçılık", lat: 36.5778, lon: 35.3789, merkezeMesafeKm: 49, aciklama: "Güney sahil ilçesi. Akdeniz kıyısı, balıkçı barınağı ve plajlar." },
                { id: "Yumurtalık", ad: "Yumurtalık", grup: "Güney / Ova ve Kıyı", rol: "İskenderun Körfezi & Ayas Kalesi", lat: 36.7725, lon: 35.7950, merkezeMesafeKm: 81, aciklama: "Güney sahil ilçesi. Tarihi Ayas Kalesi ve petrol terminali sahili." },
                { id: "İmamoğlu", ad: "İmamoğlu", grup: "Kuzey / Dağlık ve Yayla", rol: "Kuzey Ovaları & Tarım Geçişi", lat: 37.2625, lon: 35.6600, merkezeMesafeKm: 45, aciklama: "Kuzey ova ve tarım geçiş ilçesi." },
                { id: "Kozan", ad: "Kozan", grup: "Kuzey / Dağlık ve Yayla", rol: "Kuzey Çukurova & Tarihi Kale", lat: 37.4550, lon: 35.8150, merkezeMesafeKm: 68, aciklama: "Kuzey yayla ve tarih merkezi. Tarihi Kozan Kalesi ve Anavarza." },
                { id: "Aladağ", ad: "Aladağ", grup: "Kuzey / Dağlık ve Yayla", rol: "Toroslar & Kapuzbaşı Şelaleleri", lat: 37.5450, lon: 35.3950, merkezeMesafeKm: 102, aciklama: "Kuzey dağlık ilçe. Toros Dağları, rafting ve şelaleler." },
                { id: "Pozantı", ad: "Pozantı", grup: "Kuzey / Dağlık ve Yayla", rol: "Toros Geçidi & Gülek Boğazı", lat: 37.4267, lon: 34.8717, merkezeMesafeKm: 114, aciklama: "Kuzeybatı dağlık ilçe. Gülek Boğazı, Belemedik Vadisi ve Toros tünelleri." },
                { id: "Feke", ad: "Feke", grup: "Kuzey / Dağlık ve Yayla", rol: "Göksu Vadisi & Tarihi Kale", lat: 37.8183, lon: 35.9100, merkezeMesafeKm: 118, aciklama: "Kuzey dağlık ilçe. Göksu ırmağı vadisi ve Feke Kalesi." },
                { id: "Saimbeyli", ad: "Saimbeyli", grup: "Kuzey / Dağlık ve Yayla", rol: "Kiraz Vadisi & Yüksek Yaylalar", lat: 37.9883, lon: 36.0883, merkezeMesafeKm: 154, aciklama: "Kuzey dağlık ilçe. Saimbeyli kalesi ve kiraz bahçeleri." },
                { id: "Tufanbeyli", ad: "Tufanbeyli", grup: "Kuzey / Dağlık ve Yayla", rol: "En Kuzey Zirve & Şar Harabeleri", lat: 38.2617, lon: 36.2200, merkezeMesafeKm: 191, aciklama: "En kuzey dağlık ilçe. Hitit Komana (Şar) antik kenti." }
            ],
            // 15x15 Birebir KGM Karayolu Kilometre Matrisi
            mesafeMatrisiKm: {
                "Seyhan":     { "Seyhan": 0, "Yüreğir": 5, "Çukurova": 8, "Sarıçam": 12, "Karaisalı": 50, "Ceyhan": 47, "Karataş": 49, "Yumurtalık": 81, "İmamoğlu": 45, "Kozan": 68, "Aladağ": 102, "Pozantı": 114, "Feke": 118, "Saimbeyli": 154, "Tufanbeyli": 191 },
                "Yüreğir":    { "Seyhan": 5, "Yüreğir": 0, "Çukurova": 11, "Sarıçam": 8, "Karaisalı": 54, "Ceyhan": 42, "Karataş": 46, "Yumurtalık": 76, "İmamoğlu": 42, "Kozan": 65, "Aladağ": 105, "Pozantı": 118, "Feke": 115, "Saimbeyli": 151, "Tufanbeyli": 188 },
                "Çukurova":   { "Seyhan": 8, "Yüreğir": 11, "Çukurova": 0, "Sarıçam": 14, "Karaisalı": 42, "Ceyhan": 53, "Karataş": 57, "Yumurtalık": 87, "İmamoğlu": 48, "Kozan": 71, "Aladağ": 96, "Pozantı": 106, "Feke": 121, "Saimbeyli": 157, "Tufanbeyli": 194 },
                "Sarıçam":    { "Seyhan": 12, "Yüreğir": 8, "Çukurova": 14, "Sarıçam": 0, "Karaisalı": 56, "Ceyhan": 38, "Karataş": 52, "Yumurtalık": 72, "İmamoğlu": 35, "Kozan": 58, "Aladağ": 98, "Pozantı": 116, "Feke": 108, "Saimbeyli": 144, "Tufanbeyli": 181 },
                "Karaisalı":  { "Seyhan": 50, "Yüreğir": 54, "Çukurova": 42, "Sarıçam": 56, "Karaisalı": 0, "Ceyhan": 92, "Karataş": 98, "Yumurtalık": 126, "İmamoğlu": 78, "Kozan": 101, "Aladağ": 84, "Pozantı": 70, "Feke": 151, "Saimbeyli": 187, "Tufanbeyli": 224 },
                "Ceyhan":     { "Seyhan": 47, "Yüreğir": 42, "Çukurova": 53, "Sarıçam": 38, "Karaisalı": 92, "Ceyhan": 0, "Karataş": 75, "Yumurtalık": 34, "İmamoğlu": 38, "Kozan": 54, "Aladağ": 126, "Pozantı": 156, "Feke": 104, "Saimbeyli": 140, "Tufanbeyli": 177 },
                "Karataş":    { "Seyhan": 49, "Yüreğir": 46, "Çukurova": 57, "Sarıçam": 52, "Karaisalı": 98, "Ceyhan": 75, "Karataş": 0, "Yumurtalık": 65, "İmamoğlu": 84, "Kozan": 110, "Aladağ": 148, "Pozantı": 160, "Feke": 160, "Saimbeyli": 196, "Tufanbeyli": 233 },
                "Yumurtalık": { "Seyhan": 81, "Yüreğir": 76, "Çukurova": 87, "Sarıçam": 72, "Karaisalı": 126, "Ceyhan": 34, "Karataş": 65, "Yumurtalık": 0, "İmamoğlu": 72, "Kozan": 88, "Aladağ": 160, "Pozantı": 190, "Feke": 138, "Saimbeyli": 174, "Tufanbeyli": 211 },
                "İmamoğlu":   { "Seyhan": 45, "Yüreğir": 42, "Çukurova": 48, "Sarıçam": 35, "Karaisalı": 78, "Ceyhan": 38, "Karataş": 84, "Yumurtalık": 72, "İmamoğlu": 0, "Kozan": 23, "Aladağ": 72, "Pozantı": 135, "Feke": 73, "Saimbeyli": 109, "Tufanbeyli": 146 },
                "Kozan":      { "Seyhan": 68, "Yüreğir": 65, "Çukurova": 71, "Sarıçam": 58, "Karaisalı": 101, "Ceyhan": 54, "Karataş": 110, "Yumurtalık": 88, "İmamoğlu": 23, "Kozan": 0, "Aladağ": 85, "Pozantı": 158, "Feke": 50, "Saimbeyli": 86, "Tufanbeyli": 123 },
                "Aladağ":     { "Seyhan": 102, "Yüreğir": 105, "Çukurova": 96, "Sarıçam": 98, "Karaisalı": 84, "Ceyhan": 126, "Karataş": 148, "Yumurtalık": 160, "İmamoğlu": 72, "Kozan": 85, "Aladağ": 0, "Pozantı": 115, "Feke": 125, "Saimbeyli": 161, "Tufanbeyli": 198 },
                "Pozantı":    { "Seyhan": 114, "Yüreğir": 118, "Çukurova": 106, "Sarıçam": 116, "Karaisalı": 70, "Ceyhan": 156, "Karataş": 160, "Yumurtalık": 190, "İmamoğlu": 135, "Kozan": 158, "Aladağ": 115, "Pozantı": 0, "Feke": 208, "Saimbeyli": 244, "Tufanbeyli": 281 },
                "Feke":       { "Seyhan": 118, "Yüreğir": 115, "Çukurova": 121, "Sarıçam": 108, "Karaisalı": 151, "Ceyhan": 104, "Karataş": 160, "Yumurtalık": 138, "İmamoğlu": 73, "Kozan": 50, "Aladağ": 125, "Pozantı": 208, "Feke": 0, "Saimbeyli": 36, "Tufanbeyli": 73 },
                "Saimbeyli":  { "Seyhan": 154, "Yüreğir": 151, "Çukurova": 157, "Sarıçam": 144, "Karaisalı": 187, "Ceyhan": 140, "Karataş": 196, "Yumurtalık": 174, "İmamoğlu": 109, "Kozan": 86, "Aladağ": 161, "Pozantı": 244, "Feke": 36, "Saimbeyli": 0, "Tufanbeyli": 37 },
                "Tufanbeyli": { "Seyhan": 191, "Yüreğir": 188, "Çukurova": 194, "Sarıçam": 181, "Karaisalı": 224, "Ceyhan": 177, "Karataş": 233, "Yumurtalık": 211, "İmamoğlu": 146, "Kozan": 123, "Aladağ": 198, "Pozantı": 281, "Feke": 73, "Saimbeyli": 37, "Tufanbeyli": 0 }
            },
            hesaplaIlceMesafe: function(ilce1, ilce2) {
                if (!ilce1 || !ilce2) return 0;
                if (ilce1 === ilce2) return 0;
                const normalize = function(s) {
                    return String(s)
                        .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
                        .toLowerCase()
                        .replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
                        .trim();
                };
                const n1 = normalize(ilce1);
                const n2 = normalize(ilce2);
                const keys = Object.keys(this.mesafeMatrisiKm);
                const k1 = keys.find(k => normalize(k) === n1 || n1.includes(normalize(k)));
                const k2 = keys.find(k => normalize(k) === n2 || n2.includes(normalize(k)));
                if (k1 && k2 && this.mesafeMatrisiKm[k1] && this.mesafeMatrisiKm[k1][k2] !== undefined) {
                    return this.mesafeMatrisiKm[k1][k2];
                }
                return null;
            }
        },
        coordinates: {
            dms: "36°59′N 35°17′E",
            enlemDms: "36°59′K",
            boylamDms: "35°17′D",
            lat: 36.9914,
            lon: 35.2842,
            rakimMetre: 23,
            merkezeMesafeKm: 1050,
            konumAciklamasi: "Akdeniz Bölgesi'nde Çukurova deltası. Seyhan ve Ceyhan nehirlerinin hayat verdiği bereketli topraklar ve Toros Dağları etekleri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1050, "Çorlu": 1015, "Çerkezköy": 1005,
            "Ergene": 1025, "Marmaraereğlisi": 1010, "İstanbul": 930, "Ankara": 490, "Adıyaman": 340
        },
        komsular: {
            kuzey: "Niğde",
            dogu: "Osmaniye",
            guney: "Hatay",
            bati: "Mersin"
        },
        komsuIller: ["Mersin", "Niğde", "Kayseri", "Kahramanmaraş", "Osmaniye", "Hatay"],
        sinirKomsulari: {
            "Pozantı": { ilce: "Pozantı", komsuIl: "Niğde", mesafeKm: 60, yol: "O-21 / D-750" },
            "Ceyhan": { ilce: "Ceyhan", komsuIl: "Osmaniye", mesafeKm: 45, yol: "O-52 / D-400" },
            "Yumurtalık": { ilce: "Yumurtalık", komsuIl: "Hatay", mesafeKm: 70, yol: "D-817" }
        },
        terrain: "asfalt",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Eskişehir": {
        plaka: "26",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 430,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-26"]->.eskisehir; (node["highway"="bus_stop"](area.eskisehir););`,
        coordinates: {
            dms: "39°46′N 30°31′E",
            enlemDms: "39°46′K",
            boylamDms: "30°31′D",
            lat: 39.7767,
            lon: 30.5206,
            rakimMetre: 788,
            merkezeMesafeKm: 430,
            konumAciklamasi: "İç Anadolu ile Batı Anadolu'nun kesişiminde, Porsuk Çayı havzası ve tarihi Frig Vadisi üzerinde yer alan modern kültür ve üniversite kenti. Tarihi Odunpazarı Evleri, Kurşunlu Külliyesi, lületaşı madenleri, Balmumu Heykeller Müzesi, Masal Şatosu ile Sazova Bilim Kültür ve Sanat Parkı, Türkiye'nin ilk yerli otomobili Devrim, meşhur çibörek, met helvası, balaban kebabı ve Yunus Emre'nin hoşgörü felsefesiyle tanınan İç Anadolu'nun parlayan yıldızı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 430, "Çorlu": 395, "Çerkezköy": 380,
            "Ergene": 400, "Marmaraereğlisi": 415, "İstanbul": 300, "Ankara": 235,
            "Bursa": 150, "Bilecik": 80, "Kütahya": 75, "Afyonkarahisar": 130, "Konya": 330, "Bolu": 200, "Sakarya": 180,
            "Odunpazarı": 5, "Tepebaşı": 4, "Sivrihisar": 95, "Seyitgazi": 45, "Çifteler": 65, "İnönü": 35, "Alpu": 40, "Mihalıççık": 90, "Sarıcakaya": 50
        },
        komsular: {
            kuzey: "Bolu (Göynük - Sarıcakaya Kanyonu) / Bilecik (Bozüyük - İnönü - Söğüt)",
            dogu: "Ankara (Polatlı - Sivrihisar / Nallıhan - Mihalıççık)",
            guney: "Afyonkarahisar (İhsaniye - Seyitgazi - Frig Vadisi) / Konya (Yunak - Çeltik - Sivrihisar)",
            bati: "Kütahya (İnönü - Porsuk Barajı - Kütahya Merkez)"
        },
        komsuIller: ["Bilecik", "Bolu", "Ankara", "Konya", "Afyonkarahisar", "Kütahya"],
        fizikiSinirKomsulari: ["Bilecik", "Bolu", "Ankara", "Konya", "Afyonkarahisar", "Kütahya"],
        sinirKomsulari: {
            "İnönü - Bozüyük": { ilce: "İnönü", komsuIl: "Bilecik (Bozüyük / Marmara Girişi)", mesafeKm: 35, yol: "D-200 / E90" },
            "Sivrihisar - Polatlı": { ilce: "Sivrihisar", komsuIl: "Ankara (Polatlı / Duatepe / Başkent Girişi)", mesafeKm: 65, yol: "D-200 / E90" },
            "Seyitgazi - İhsaniye": { ilce: "Seyitgazi", komsuIl: "Afyonkarahisar (İhsaniye / Frig Vadisi / Gazlıgöl)", mesafeKm: 55, yol: "D-665" },
            "Sivrihisar - Çeltik": { ilce: "Sivrihisar", komsuIl: "Konya (Çeltik / Yunak / Cihanbeyli Bozkırı)", mesafeKm: 60, yol: "D-695" },
            "Sarıcakaya - Göynük": { ilce: "Sarıcakaya", komsuIl: "Bolu (Göynük / Sakarya Nehri Kanyonu)", mesafeKm: 65, yol: "26-01 İl Yolu" },
            "Tepebaşı - Kütahya": { ilce: "Tepebaşı / Merkez", komsuIl: "Kütahya (Merkez / Porsuk Barajı)", mesafeKm: 75, yol: "D-230" }
        },
        terrain: "duzluk",
        ucretler: { tam: 30, ogrenci: 18, yasli: 0 }
    },
    "Gaziantep": {
        plaka: "27",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1260,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-27"]->.gaziantep; (node["highway"="bus_stop"](area.gaziantep););`,
        coordinates: {
            dms: "37°04′N 37°23′E",
            enlemDms: "37°04′K",
            boylamDms: "37°23′D",
            lat: 37.0662,
            lon: 37.3833,
            rakimMetre: 850,
            merkezeMesafeKm: 1260,
            konumAciklamasi: "Güneydoğu Anadolu ile Akdeniz kuşaklarının birleşim noktasında, tarihi İpek Yolu ve Fırat Nehri havzasında yer alan dünya gastronomi başkenti ve sanayi metropolü. UNESCO tescilli Gaziantep mutfağı, Zeugma Mozaik Müzesi ve Çingene Kızı mozaiği, tarihi Gaziantep Kalesi, Bakırcılar Çarşısı, Almacı Pazarı, Tahmis Kahvesi, Fırat kıyısındaki Rumkale, Dülük Antik Kenti, fıstık bahçeleri, çıtır baklavası ve Kurtuluş Savaşı'ndaki efsanevi Gazi unvanıyla bilinen Güneydoğu'nun incisi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1260, "Çorlu": 1225, "Çerkezköy": 1210,
            "Ergene": 1230, "Marmaraereğlisi": 1245, "İstanbul": 1145, "Ankara": 700,
            "Adana": 220, "Adıyaman": 150, "Şanlıurfa": 140, "Kahramanmaraş": 78, "Kilis": 65, "Osmaniye": 135, "Hatay": 190, "Malatya": 235, "Diyarbakır": 315,
            "Şahinbey": 3, "Şehitkamil": 4, "Nizip": 45, "Oğuzeli": 20, "Nurdağı": 65, "İslahiye": 90, "Araban": 65, "Yavuzeli": 40, "Karkamış": 75
        },
        komsular: {
            kuzey: "Kahramanmaraş (Pazarcık - Narlı) / Adıyaman (Besni - Araban Havzası)",
            dogu: "Şanlıurfa (Birecik - Halfeti - Fırat Köprüsü - Nizip)",
            guney: "Kilis (Öncüpınar Aksı - Şahinbey - Oğuzeli) / Suriye Sınırı",
            bati: "Osmaniye (Bahçe - Nurdağı Geçidi - TAG Otoyolu) / Hatay (Hassa - İslahiye)"
        },
        komsuIller: ["Adıyaman", "Şanlıurfa", "Kilis", "Hatay", "Osmaniye", "Kahramanmaraş"],
        fizikiSinirKomsulari: ["Adıyaman", "Şanlıurfa", "Kilis", "Hatay", "Osmaniye", "Kahramanmaraş"],
        sinirKomsulari: {
            "Araban - Besni": { ilce: "Araban", komsuIl: "Adıyaman (Besni / Fırat Havzası)", mesafeKm: 45, yol: "D-850" },
            "Nizip - Birecik": { ilce: "Nizip", komsuIl: "Şanlıurfa (Birecik / Fırat Köprüsü / D-400)", mesafeKm: 30, yol: "O-52 / D-400" },
            "Nurdağı - Bahçe": { ilce: "Nurdağı", komsuIl: "Osmaniye (Bahçe / Nurdağı Geçidi / TAG Otoyolu)", mesafeKm: 25, yol: "O-52 / TAG Otoyolu" },
            "Şehitkamil - Pazarcık": { ilce: "Şehitkamil", komsuIl: "Kahramanmaraş (Pazarcık / Narlı Kavşağı)", mesafeKm: 50, yol: "D-835" },
            "Şahinbey - Kilis": { ilce: "Şahinbey", komsuIl: "Kilis (Merkez / Öncüpınar Sınır Aksı)", mesafeKm: 60, yol: "D-850" },
            "İslahiye - Hassa": { ilce: "İslahiye", komsuIl: "Hatay (Hassa / Amanoslar Eteği)", mesafeKm: 35, yol: "D-825" }
        },
        terrain: "duzluk",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Giresun": {
        plaka: "28",
        bolge: "Karadeniz",
        merkezeMesafeKm: 1050,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-28"]->.giresun; (node["highway"="bus_stop"](area.giresun););`,
        coordinates: {
            dms: "40°55′N 38°23′E",
            enlemDms: "40°55′K",
            boylamDms: "38°23′D",
            lat: 40.9128,
            lon: 38.3895,
            rakimMetre: 10,
            merkezeMesafeKm: 1050,
            konumAciklamasi: "Doğu Karadeniz Bölgesi'nde, Karadeniz Sahil Yolu (D-010) üzerinde, zümrüt yeşili fındık bahçeleri ve masmavi denizin kucaklaştığı tarihi kale ve kiraz kenti. Tarihi Giresun Kalesi, Karadeniz'in yaşanabilir tek adası olan Giresun Adası (Aretias), Kümbet ve Bektaş yaylaları, Kuzalan Şelalesi, Mavi Göl, Görele kemençe ve pidesi, meşhur tombul Giresun fındığı, fındık ezmesi, ısırgan yemeği, Şebinkarahisar Kalesi ve Kuşdili (ıslık dili) kültürüyle tanınan Doğu Karadeniz'in incisi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1050, "Çorlu": 1015, "Çerkezköy": 1000,
            "Ergene": 1020, "Marmaraereğlisi": 1035, "İstanbul": 930, "Ankara": 610,
            "Trabzon": 135, "Ordu": 45, "Samsun": 195, "Gümüşhane": 145, "Erzincan": 225, "Sivas": 270, "Erzurum": 335,
            "Bulancak": 15, "Piraziz": 22, "Keşap": 12, "Espiye": 32, "Tirebolu": 45, "Görele": 62, "Eynesil": 72, "Dereli": 30, "Şebinkarahisar": 115, "Alucra": 135, "Çamoluk": 175
        },
        komsular: {
            kuzey: "Karadeniz (Giresun Adası - Sahil Şeridi)",
            dogu: "Trabzon (Eynesil - Beşikdüzü / Vakfıkebir) / Gümüşhane (Doğankent - Kürtün / Harşit)",
            guney: "Erzincan (Çamoluk - Refahiye) / Sivas (Şebinkarahisar - Suşehri - Akıncılar)",
            bati: "Ordu (Piraziz - Gülyalı / Turnasuyu - Ordu-Giresun Havalimanı OGU)"
        },
        komsuIller: ["Trabzon", "Gümüşhane", "Erzincan", "Sivas", "Ordu"],
        fizikiSinirKomsulari: ["Trabzon", "Gümüşhane", "Erzincan", "Sivas", "Ordu"],
        sinirKomsulari: {
            "Piraziz - Gülyalı": { ilce: "Piraziz", komsuIl: "Ordu (Gülyalı / Turnasuyu / OGU Havalimanı)", mesafeKm: 15, yol: "D-010 Karadeniz Sahil Yolu" },
            "Eynesil - Beşikdüzü": { ilce: "Eynesil", komsuIl: "Trabzon (Beşikdüzü / Vakfıkebir Sahil Aksı)", mesafeKm: 12, yol: "D-010 Karadeniz Sahil Yolu" },
            "Doğankent - Kürtün": { ilce: "Doğankent", komsuIl: "Gümüşhane (Kürtün / Harşit Vadisi / Torul)", mesafeKm: 35, yol: "D-877" },
            "Çamoluk - Refahiye": { ilce: "Çamoluk", komsuIl: "Erzincan (Refahiye / Kelkit Vadisi / D-100)", mesafeKm: 55, yol: "28-26 İl Yolu / D-100" },
            "Şebinkarahisar - Suşehri": { ilce: "Şebinkarahisar", komsuIl: "Sivas (Suşehri / Eğribel Tüneli / D-865)", mesafeKm: 60, yol: "D-865" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Gümüşhane": {
        plaka: "29",
        bolge: "Karadeniz",
        merkezeMesafeKm: 1140,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-29"]->.gumushane; (node["highway"="bus_stop"](area.gumushane););`,
        coordinates: {
            dms: "40°27′N 39°28′E",
            enlemDms: "40°27′K",
            boylamDms: "39°28′D",
            lat: 40.4600,
            lon: 39.4717,
            rakimMetre: 1150,
            merkezeMesafeKm: 1140,
            konumAciklamasi: "Doğu Karadeniz'in iç kesiminde, tarihi İpek Yolu ve Harşit Çayı vadisi üzerinde, dağlar arasına kurulmuş kadim maden ve pestil-köme kenti. Dünyanın en uzun çift tüplü karayolu tünellerinden biri olan 14.5 kilometrelik Yeni Zigana Tüneli, sarkıt ve dikitleriyle büyüleyen Karaca Mağarası, Tomara Şelalesi, Santa Harabeleri, Krom Vadisi, Torul Kalesi Cam Seyir Terası, meşhur Gümüşhane pestili ve kömesi, cevizli siron ve karlı dağ geçitleriyle tanınan Karadeniz ile Doğu Anadolu arasındaki kilit geçit şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1140, "Çorlu": 1105, "Çerkezköy": 1090,
            "Ergene": 1110, "Marmaraereğlisi": 1125, "İstanbul": 1020, "Ankara": 760,
            "Trabzon": 100, "Bayburt": 75, "Erzincan": 135, "Giresun": 145, "Erzurum": 200, "Rize": 175, "Sivas": 350,
            "Torul": 24, "Kürtün": 60, "Kelkit": 60, "Şiran": 90, "Köse": 45
        },
        komsular: {
            kuzey: "Trabzon (Torul - Yeni Zigana Tüneli 14.5km - Maçka)",
            dogu: "Bayburt (Merkez - Vauk Dağı Geçidi 1875m / Aydıntepe)",
            guney: "Erzincan (Kelkit - Şiran - Ahmediye Geçidi 2120m)",
            bati: "Giresun (Kürtün - Doğankent - Harşit Vadisi / Alucra)"
        },
        komsuIller: ["Trabzon", "Bayburt", "Erzincan", "Giresun"],
        fizikiSinirKomsulari: ["Trabzon", "Bayburt", "Erzincan", "Giresun"],
        sinirKomsulari: {
            "Torul - Maçka": { ilce: "Torul", komsuIl: "Trabzon (Maçka / Yeni Zigana Tüneli 14.5km)", mesafeKm: 35, yol: "D-885 / Yeni Zigana Tüneli" },
            "Merkez - Vauk": { ilce: "Merkez", komsuIl: "Bayburt (Merkez / Vauk Dağı Geçidi 1875m)", mesafeKm: 45, yol: "D-050" },
            "Kelkit - Ahmediye": { ilce: "Kelkit", komsuIl: "Erzincan (Merkez / Ahmediye Geçidi 2120m)", mesafeKm: 50, yol: "D-885" },
            "Kürtün - Doğankent": { ilce: "Kürtün", komsuIl: "Giresun (Doğankent / Harşit Vadisi / Tirebolu)", mesafeKm: 35, yol: "D-877" },
            "Şiran - Alucra": { ilce: "Şiran", komsuIl: "Giresun (Alucra / Çamoluk Aksı)", mesafeKm: 40, yol: "28-25 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },




    "Adıyaman": {
        plaka: "02",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1250,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-02"]->.adiyaman; (node["highway"="bus_stop"](area.adiyaman););`,
        coordinates: {
            dms: "37°45′N 38°16′E",
            enlemDms: "37°45′K",
            boylamDms: "38°16′D",
            lat: 37.7648,
            lon: 38.2786,
            rakimMetre: 669,
            merkezeMesafeKm: 1250,
            konumAciklamasi: "Güneydoğu Anadolu Bölgesi'nde, Kommagene Krallığı'nın beşiği ve UNESCO Dünya Mirası Nemrut Dağı eteklerinde yer alır. Fırat Nehri ve Atatürk Baraj Gölü'ne kıyısı vardır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1250, "Çorlu": 1215, "Çerkezköy": 1205,
            "Ergene": 1225, "Marmaraereğlisi": 1210, "İstanbul": 1130, "Ankara": 690, "Adana": 340, "Gaziantep": 150
        },
        komsular: {
            kuzey: "Malatya",
            dogu: "Diyarbakır",
            guney: "Şanlıurfa",
            bati: "Kahramanmaraş"
        },
        komsuIller: ["Malatya", "Diyarbakır", "Şanlıurfa", "Gaziantep", "Kahramanmaraş"],
        fizikiSinirKomsulari: ["Gaziantep", "Malatya", "Diyarbakır", "Şanlıurfa", "Kahramanmaraş"],
        sinirKomsulari: {
            "Gölbaşı": { ilce: "Gölbaşı", komsuIl: "Kahramanmaraş / Malatya", mesafeKm: 65, yol: "D-360" },
            "Kahta": { ilce: "Kahta", komsuIl: "Diyarbakır", mesafeKm: 110, yol: "D-360" },
            "Besni": { ilce: "Besni", komsuIl: "Gaziantep", mesafeKm: 85, yol: "D-850" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
        "Afyonkarahisar": {
        plaka: "03",
        bolge: "Ege",
        merkezeMesafeKm: 540,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-03"]->.afyon; (node["highway"="bus_stop"](area.afyon););`,
        coordinates: {
            dms: "38°45′N 30°32′E",
            enlemDms: "38°45′K",
            boylamDms: "30°32′D",
            lat: 38.7569,
            lon: 30.5387,
            rakimMetre: 1021,
            merkezeMesafeKm: 540,
            konumAciklamasi: "Ege Bölgesi'nin İç Batı Anadolu bölümünde yer alan, Türkiye'nin karayolu ve demiryolu kavşak noktası. Tarihi kalesi, termal suları, sucuğu, lokumu ve Zafer Yolu ile ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 540, "Çorlu": 505, "Çerkezköy": 495,
            "Ergene": 515, "Marmaraereğlisi": 500, "İstanbul": 410, "Ankara": 260,
            "İzmir": 330, "Konya": 225, "Antalya": 290, "Eskişehir": 130, "Kütahya": 100
        },
        komsular: {
            kuzey: "Eskişehir",
            dogu: "Konya",
            guney: "Isparta",
            bati: "Kütahya"
        },
        komsuIller: ["Eskişehir", "Konya", "Isparta", "Burdur", "Kütahya", "Uşak", "Denizli"],
        sinirKomsulari: {
            "İhsaniye": { ilce: "İhsaniye", komsuIl: "Eskişehir", mesafeKm: 35, yol: "D-665" },
            "Dinar": { ilce: "Dinar", komsuIl: "Isparta / Burdur / Denizli", mesafeKm: 105, yol: "D-650" },
            "Sandıklı": { ilce: "Sandıklı", komsuIl: "Antalya Hattı", mesafeKm: 65, yol: "D-650" },
            "Bolvadin": { ilce: "Bolvadin", komsuIl: "Konya Hattı", mesafeKm: 50, yol: "D-300" }
        },
        terrain: "daglik",
        ucretler: { tam: 40, ogrenci: 20, yasli: 0 }
    },
    "Ağrı": {
        plaka: "04",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1510,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-04"]->.agri; (node["highway"="bus_stop"](area.agri););`,
        coordinates: {
            dms: "39°43′N 43°03′E",
            enlemDms: "39°43′K",
            boylamDms: "43°03′D",
            lat: 39.7191,
            lon: 43.0503,
            rakimMetre: 1632,
            merkezeMesafeKm: 1510,
            konumAciklamasi: "Doğu Anadolu Bölgesi'nde, Türkiye'nin en yüksek zirvesi Ağrı Dağı'nın (5.137 m) eteklerinde yer alır. Tarihi İshak Paşa Sarayı, Meteor Çukuru ve Gürbulak Sınır Kapısı bu ilimizdedir."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1510, "Çorlu": 1475, "Çerkezköy": 1465,
            "Ergene": 1485, "Marmaraereğlisi": 1470, "İstanbul": 1380, "Ankara": 1060,
            "Erzurum": 180, "Van": 230, "Kars": 140, "Iğdır": 140, "Muş": 165
        },
        komsular: {
            kuzey: "Kars",
            dogu: "Iğdır",
            guney: "Van",
            bati: "Erzurum"
        },
        komsuIller: ["Kars", "Iğdır", "Van", "Bitlis", "Muş", "Erzurum"],
        sinirKomsulari: {
            "Doğubayazıt": { ilce: "Doğubayazıt", komsuIl: "Iğdır / İran (Gürbulak)", mesafeKm: 95, yol: "D-100 / E-80" },
            "Patnos": { ilce: "Patnos", komsuIl: "Van / Bitlis / Muş", mesafeKm: 80, yol: "D-280 / D-965" },
            "Eleşkirt": { ilce: "Eleşkirt", komsuIl: "Erzurum", mesafeKm: 35, yol: "D-100" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Amasya": {
        plaka: "05",
        bolge: "Karadeniz",
        merkezeMesafeKm: 810,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-05"]->.amasya; (node["highway"="bus_stop"](area.amasya););`,
        coordinates: {
            dms: "40°39′N 35°50′E",
            enlemDms: "40°39′K",
            boylamDms: "35°50′D",
            lat: 40.6534,
            lon: 35.8331,
            rakimMetre: 411,
            merkezeMesafeKm: 810,
            konumAciklamasi: "Orta Karadeniz Bölümü'nde, Yeşilırmak vadisi boyunca uzanan kadim Osmanlı Şehzadeler Şehri. Pontus Kralları Kaya Mezarları, tarihi Yalıboyu Evleri ve elmasıyla meşhurdur."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 810, "Çorlu": 775, "Çerkezköy": 765,
            "Ergene": 785, "Marmaraereğlisi": 770, "İstanbul": 680, "Ankara": 335,
            "Samsun": 130, "Tokat": 115, "Çorum": 92, "Yozgat": 200
        },
        komsular: {
            kuzey: "Samsun",
            dogu: "Tokat",
            guney: "Yozgat",
            bati: "Çorum"
        },
        komsuIller: ["Samsun", "Tokat", "Yozgat", "Çorum"],
        sinirKomsulari: {
            "Merzifon": { ilce: "Merzifon", komsuIl: "Çorum / Samsun", mesafeKm: 45, yol: "D-100 / D-795" },
            "Suluova": { ilce: "Suluova", komsuIl: "Samsun (Havza)", mesafeKm: 25, yol: "D-100" },
            "Taşova": { ilce: "Taşova", komsuIl: "Tokat (Erbaa)", mesafeKm: 50, yol: "D-100" },
            "Göynücek": { ilce: "Göynücek", komsuIl: "Yozgat / Çorum", mesafeKm: 45, yol: "D-180" }
        },
        terrain: "daglik",
        ucretler: { tam: 40, ogrenci: 20, yasli: 0 }
    },
    "Ankara": {
        plaka: "06",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 585,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-06"]->.ankara; area["name"="Çankaya"]->.ilce; (node["highway"="bus_stop"](area.ankara)(area.ilce); node["traffic_calming"~"bump|hump"](area.ankara)(area.ilce););`,
        coordinates: {
            dms: "39°56′N 32°52′E",
            enlemDms: "39°56′K",
            boylamDms: "32°52′D",
            lat: 39.9334,
            lon: 32.8597,
            rakimMetre: 938,
            merkezeMesafeKm: 585,
            konumAciklamasi: "Türkiye Cumhuriyeti'nin başkenti. İç Anadolu Bölgesi'nin kalbinde yer alır. Anıtkabir, TBMM, AŞTİ ve Türkiye'nin en büyük ulaşım kavşağıdır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 585, "Çorlu": 550, "Çerkezköy": 540,
            "Ergene": 560, "Marmaraereğlisi": 545, "İstanbul": 450,
            "Eskişehir": 235, "Konya": 260, "Bolu": 190, "Çankırı": 130,
            "Kırıkkale": 75, "Kırşehir": 185, "Aksaray": 225,
            "Afyonkarahisar": 260, "Amasya": 335, "Adana": 490, "Ağrı": 1060
        },
        komsular: {
            kuzey: "Bolu",
            dogu: "Kırıkkale",
            guney: "Konya",
            bati: "Eskişehir"
        },
        komsuIller: ["Bolu", "Çankırı", "Kırıkkale", "Kırşehir", "Aksaray", "Konya", "Eskişehir"],
        sinirKomsulari: {
            "Polatlı": { ilce: "Polatlı", komsuIl: "Eskişehir / Konya", mesafeKm: 75, yol: "D-200 / E-90" },
            "Kızılcahamam": { ilce: "Kızılcahamam", komsuIl: "Bolu / Çankırı", mesafeKm: 80, yol: "D-750 / O-4" },
            "Şereflikoçhisar": { ilce: "Şereflikoçhisar", komsuIl: "Aksaray (Tuz Gölü)", mesafeKm: 145, yol: "D-750" },
            "Elmadağ": { ilce: "Elmadağ", komsuIl: "Kırıkkale", mesafeKm: 40, yol: "D-200" }
        },
        terrain: "asfalt",
        ucretler: { tam: 35, ogrenci: 17.5, yasli: 0 }
    },
    "Antalya": {
        plaka: "07",
        bolge: "Akdeniz",
        merkezeMesafeKm: 830,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-07"]->.antalya; (node["highway"="bus_stop"](area.antalya););`,
        coordinates: {
            dms: "36°53′N 30°42′E",
            enlemDms: "36°53′K",
            boylamDms: "30°42′D",
            lat: 36.8969,
            lon: 30.7133,
            rakimMetre: 30,
            merkezeMesafeKm: 830,
            konumAciklamasi: "Akdeniz Bölgesi'nde, Bey Dağları ve Toroslar ile Akdeniz sahili arasında yer alan Türkiye'nin turizm başkenti. Tarihi Kaleiçi, Düden ve Kurşunlu Şelaleleri, Konyaaltı ve Lara sahilleriyle dünyaca ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 830, "Çorlu": 795, "Çerkezköy": 785,
            "Ergene": 805, "Marmaraereğlisi": 790, "İstanbul": 700, "Ankara": 480,
            "Burdur": 122, "Isparta": 130, "Konya": 305, "Muğla": 310, "Mersin": 470, "Afyonkarahisar": 290
        },
        komsular: {
            kuzey: "Burdur",
            dogu: "Mersin",
            guney: "Akdeniz",
            bati: "Muğla"
        },
        komsuIller: ["Burdur", "Isparta", "Konya", "Karaman", "Mersin", "Muğla"],
        sinirKomsulari: {
            "Döşemealtı": { ilce: "Döşemealtı", komsuIl: "Burdur (Çubuk Boğazı)", mesafeKm: 30, yol: "D-650" },
            "Gazipaşa": { ilce: "Gazipaşa", komsuIl: "Mersin (Anamur)", mesafeKm: 180, yol: "D-400" },
            "Akseki": { ilce: "Akseki", komsuIl: "Konya (Seydişehir)", mesafeKm: 150, yol: "D-695" },
            "Kaş": { ilce: "Kaş", komsuIl: "Muğla (Fethiye)", mesafeKm: 190, yol: "D-400" }
        },
        terrain: "sahil",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Artvin": {
        plaka: "08",
        bolge: "Karadeniz",
        merkezeMesafeKm: 1440,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-08"]->.artvin; (node["highway"="bus_stop"](area.artvin););`,
        coordinates: {
            dms: "41°11′N 41°49′E",
            enlemDms: "41°11′K",
            boylamDms: "41°49′D",
            lat: 41.1828,
            lon: 41.8183,
            rakimMetre: 550,
            merkezeMesafeKm: 1440,
            konumAciklamasi: "Doğu Karadeniz Bölgesi'nin en doğusunda, Çoruh Nehri Vadisi'nin dik yamaçlarında kurulu, Kafkasör Yaylası, Borçka Karagöl, Şavşat Karagöl, Mençuna Şelalesi ve sarp dağ coğrafyasıyla ünlü doğa ve kültür kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1440, "Çorlu": 1405, "Çerkezköy": 1395,
            "Ergene": 1415, "Marmaraereğlisi": 1400, "İstanbul": 1310, "Ankara": 980,
            "Rize": 95, "Trabzon": 165, "Erzurum": 200, "Ardahan": 115, "Kars": 205, "Hopa": 65
        },
        komsular: {
            kuzey: "Karadeniz / Gürcistan (Sarp Sınır Kapısı)",
            dogu: "Ardahan",
            guney: "Erzurum",
            bati: "Rize"
        },
        komsuIller: ["Rize", "Erzurum", "Ardahan"],
        sinirKomsulari: {
            "Hopa - Sarp": { ilce: "Hopa / Kemalpaşa", komsuIl: "Gürcistan (Batum) Sınır Kapısı", mesafeKm: 35, yol: "D-010 / E70 Karadeniz Sahil Yolu" },
            "Arhavi - Fındıklı": { ilce: "Arhavi", komsuIl: "Rize (Fındıklı)", mesafeKm: 40, yol: "D-010 / E70" },
            "Borçka - Cankurtaran": { ilce: "Borçka", komsuIl: "Hopa Sahil Aksı (Cankurtaran Tüneli)", mesafeKm: 32, yol: "D-010" },
            "Şavşat - Sahara": { ilce: "Şavşat", komsuIl: "Ardahan (Sahara Geçidi / 2470m)", mesafeKm: 45, yol: "D-010" },
            "Yusufeli - İspir": { ilce: "Yusufeli", komsuIl: "Erzurum (İspir / Uzundere)", mesafeKm: 70, yol: "D-050" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Aydın": {
        plaka: "09",
        bolge: "Ege",
        merkezeMesafeKm: 630,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-09"]->.aydin; (node["highway"="bus_stop"](area.aydin););`,
        coordinates: {
            dms: "37°51′N 27°51′E",
            enlemDms: "37°51′K",
            boylamDms: "27°51′D",
            lat: 37.8450,
            lon: 27.8396,
            rakimMetre: 65,
            merkezeMesafeKm: 630,
            konumAciklamasi: "Ege Bölgesi'nin Kıyı Ege bölümünde, verimli Büyük Menderes Havzası'nda yer alır. Tralleis Antik Kenti, inciri, zeytini, Kuşadası ve Didim kıyıları, Milet ve Priene antik kentleriyle ünlü tarih ve turizm kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 630, "Çorlu": 595, "Çerkezköy": 585,
            "Ergene": 605, "Marmaraereğlisi": 590, "İstanbul": 520, "Ankara": 590,
            "İzmir": 110, "Denizli": 125, "Muğla": 100, "Manisa": 145, "Kuşadası": 60, "Didim": 95, "Nazilli": 45
        },
        komsular: {
            kuzey: "İzmir / Manisa",
            dogu: "Denizli",
            guney: "Muğla",
            bati: "Ege Denizi (Kuşadası / Didim)"
        },
        komsuIller: ["İzmir", "Manisa", "Denizli", "Muğla"],
        sinirKomsulari: {
            "Germencik - Selçuk": { ilce: "Germencik / Kuşadası", komsuIl: "İzmir (Selçuk / Efes)", mesafeKm: 30, yol: "O-31 / D-550" },
            "Buharkent - Sarayköy": { ilce: "Buharkent", komsuIl: "Denizli (Sarayköy / Pamukkale)", mesafeKm: 85, yol: "D-320" },
            "Çine - Yatağan": { ilce: "Çine", komsuIl: "Muğla (Yatağan / Bodrum-Marmaris Kavşağı)", mesafeKm: 40, yol: "D-550" },
            "Kuyucak - Alaşehir": { ilce: "Kuyucak", komsuIl: "Manisa (Alaşehir)", mesafeKm: 60, yol: "D-585" },
            "Söke - Bafa": { ilce: "Söke / Didim", komsuIl: "Muğla (Milas / Bafa Gölü)", mesafeKm: 55, yol: "D-525" }
        },
        terrain: "sahil",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Balıkesir": {
        plaka: "10",
        bolge: "Marmara",
        merkezeMesafeKm: 295,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-10"]->.balikesir; (node["highway"="bus_stop"](area.balikesir););`,
        coordinates: {
            dms: "39°39′N 27°53′E",
            enlemDms: "39°39′K",
            boylamDms: "27°53′D",
            lat: 39.6484,
            lon: 27.8826,
            rakimMetre: 145,
            merkezeMesafeKm: 295,
            konumAciklamasi: "Marmara Bölgesi'nin Güney Marmara bölümünde, hem Marmara Denizi'ne (Bandırma, Erdek) hem de Ege Denizi'ne (Edremit, Ayvalık) kıyısı bulunan stratejik kavşak kenti. Kazdağları Milli Parkı, Manyas Kuşcenneti, höşmerimi ve zeytiniyle meşhurdur."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 295, "Çorlu": 330, "Çerkezköy": 355,
            "Ergene": 335, "Marmaraereğlisi": 320, "İstanbul": 280, "Ankara": 535,
            "Çanakkale": 195, "Bursa": 150, "İzmir": 175, "Manisa": 140, "Kütahya": 230, "Bandırma": 100, "Edremit": 85, "Ayvalık": 125
        },
        komsular: {
            kuzey: "Marmara Denizi (Bandırma / Erdek)",
            dogu: "Bursa / Kütahya",
            guney: "Manisa / İzmir",
            bati: "Çanakkale / Ege Denizi (Edremit / Ayvalık)"
        },
        komsuIller: ["Çanakkale", "Bursa", "Kütahya", "Manisa", "İzmir"],
        sinirKomsulari: {
            "Susurluk - Karacabey": { ilce: "Susurluk / Bandırma", komsuIl: "Bursa (Karacabey / Mustafakemalpaşa)", mesafeKm: 40, yol: "O-5 / D-565 / D-200" },
            "Gönen - Biga": { ilce: "Gönen / Bandırma", komsuIl: "Çanakkale (Biga / Lapseki)", mesafeKm: 45, yol: "D-200" },
            "Edremit - Ayvacık": { ilce: "Edremit / Altınoluk", komsuIl: "Çanakkale (Küçükkuyu / Assos)", mesafeKm: 35, yol: "D-550 / E87" },
            "Ayvalık - Dikili": { ilce: "Ayvalık", komsuIl: "İzmir (Dikili / Bergama)", mesafeKm: 40, yol: "D-550 / E87" },
            "Savaştepe - Soma": { ilce: "Savaştepe", komsuIl: "Manisa (Soma / Kırkağaç)", mesafeKm: 25, yol: "D-565 / O-5" },
            "Dursunbey - Tavşanlı": { ilce: "Dursunbey", komsuIl: "Kütahya (Tavşanlı / Harmancık)", mesafeKm: 80, yol: "D-230" }
        },
        terrain: "daglik",
        ucretler: { tam: 40, ogrenci: 20, yasli: 0 }
    },
    "Bilecik": {
        plaka: "11",
        bolge: "Marmara",
        merkezeMesafeKm: 380,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-11"]->.bilecik; (node["highway"="bus_stop"](area.bilecik););`,
        coordinates: {
            dms: "40°08′N 29°58′E",
            enlemDms: "40°08′K",
            boylamDms: "29°58′D",
            lat: 40.1425,
            lon: 29.9793,
            rakimMetre: 500,
            merkezeMesafeKm: 380,
            konumAciklamasi: "Marmara Bölgesi'nin güneydoğusunda, Osmanlı Devleti'nin temellerinin atıldığı tarihi kuruluş kenti. Şeyh Edebali Türbesi, Söğüt Ertuğrul Gazi Türbesi, Bozüyük sanayi ve demiryolu kavşağı ile seramik ve mermer sanayisiyle ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 380, "Çorlu": 345, "Çerkezköy": 335,
            "Ergene": 355, "Marmaraereğlisi": 340, "İstanbul": 245, "Ankara": 315,
            "Sakarya": 100, "Bursa": 95, "Eskişehir": 80, "Kütahya": 110, "Bolu": 165, "Bozüyük": 35, "Söğüt": 30, "Osmaneli": 35
        },
        komsular: {
            kuzey: "Sakarya",
            dogu: "Bolu / Eskişehir",
            guney: "Kütahya",
            bati: "Bursa"
        },
        komsuIller: ["Sakarya", "Bursa", "Bolu", "Eskişehir", "Kütahya"],
        sinirKomsulari: {
            "Osmaneli - Pamukova": { ilce: "Osmaneli", komsuIl: "Sakarya (Pamukova / Adapazarı)", mesafeKm: 30, yol: "D-650" },
            "Bozüyük - İnönü": { ilce: "Bozüyük", komsuIl: "Eskişehir (İnönü / Tepebaşı)", mesafeKm: 35, yol: "D-200 / E90" },
            "Pazaryeri - İnegöl": { ilce: "Pazaryeri / Bozüyük", komsuIl: "Bursa (İnegöl / Yenişehir)", mesafeKm: 45, yol: "D-160 / D-200" },
            "Bozüyük - Kütahya": { ilce: "Bozüyük", komsuIl: "Kütahya (Merkez)", mesafeKm: 70, yol: "D-650" },
            "Gölpazarı - Göynük": { ilce: "Gölpazarı / Yenipazar", komsuIl: "Bolu (Göynük)", mesafeKm: 55, yol: "D-160" },
            "Söğüt - Eskişehir": { ilce: "Söğüt", komsuIl: "Eskişehir (Merkez)", mesafeKm: 50, yol: "11-26 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 35, ogrenci: 18, yasli: 0 }
    },
    "Bingöl": {
        plaka: "12",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1425,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-12"]->.bingol; (node["highway"="bus_stop"](area.bingol););`,
        coordinates: {
            dms: "38°53′N 40°30′E",
            enlemDms: "38°53′K",
            boylamDms: "40°30′D",
            lat: 38.8853,
            lon: 40.4983,
            rakimMetre: 1151,
            merkezeMesafeKm: 1425,
            konumAciklamasi: "Doğu Anadolu Bölgesi'nin Yukarı Fırat ve Murat havzasında, dağlık ve zengin su kaynaklarına sahip stratejik doğu kenti. Solhan Yüzen Adalar Tabiat Anıtı, Çapakçur Vadisi, Hesarek Kayak Merkezi, balı ve yaylalarıyla ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1425, "Çorlu": 1390, "Çerkezköy": 1380,
            "Ergene": 1400, "Marmaraereğlisi": 1385, "İstanbul": 1295, "Ankara": 900,
            "Elazığ": 140, "Muş": 115, "Erzurum": 180, "Diyarbakır": 145, "Erzincan": 220, "Tunceli": 145, "Solhan": 60, "Genç": 20, "Karlıova": 70
        },
        komsular: {
            kuzey: "Erzurum / Erzincan",
            dogu: "Muş",
            guney: "Diyarbakır",
            bati: "Elazığ / Tunceli"
        },
        komsuIller: ["Erzurum", "Erzincan", "Muş", "Diyarbakır", "Elazığ", "Tunceli"],
        sinirKomsulari: {
            "Bingöl - Kovancılar": { ilce: "Merkez / Genç", komsuIl: "Elazığ (Kovancılar / Karakoçan)", mesafeKm: 65, yol: "D-300" },
            "Solhan - Muş": { ilce: "Solhan", komsuIl: "Muş (Merkez / Buğlan Geçidi)", mesafeKm: 60, yol: "D-300" },
            "Karlıova - Çat": { ilce: "Karlıova", komsuIl: "Erzurum (Çat / Çirişli Geçidi)", mesafeKm: 75, yol: "D-950" },
            "Genç - Lice": { ilce: "Genç", komsuIl: "Diyarbakır (Lice / Kulp)", mesafeKm: 70, yol: "D-950" },
            "Kiğı - Nazımiye": { ilce: "Kiğı / Yayladere", komsuIl: "Tunceli (Nazımiye / Peri Vadisi)", mesafeKm: 55, yol: "62-03 İl Yolu" },
            "Yedisu - Tercan": { ilce: "Yedisu", komsuIl: "Erzincan (Tercan)", mesafeKm: 65, yol: "D-885" }
        },
        terrain: "daglik",
        ucretler: { tam: 35, ogrenci: 18, yasli: 0 }
    },
    "Bitlis": {
        plaka: "13",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1520,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-13"]->.bitlis; (node["highway"="bus_stop"](area.bitlis););`,
        coordinates: {
            dms: "38°24′N 42°06′E",
            enlemDms: "38°24′K",
            boylamDms: "42°06′D",
            lat: 38.4006,
            lon: 42.1095,
            rakimMetre: 1545,
            merkezeMesafeKm: 1520,
            konumAciklamasi: "Doğu Anadolu Bölgesi'nin Van Gölü Havzası'nda, sarp vadiler ve volkanik dağlar arasında kurulu kadim tarih kenti. Nemrut Kalderası ve Krater Gölü, Ahlat Selçuklu Meydan Mezarlığı, Tatvan feribot limanı, Süphan Dağı ve beş minaresiyle meşhurdur."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1520, "Çorlu": 1485, "Çerkezköy": 1475,
            "Ergene": 1495, "Marmaraereğlisi": 1480, "İstanbul": 1390, "Ankara": 995,
            "Van": 160, "Muş": 85, "Siirt": 95, "Batman": 135, "Ağrı": 145, "Tatvan": 25, "Ahlat": 60, "Adilcevaz": 85, "Güroymak": 30
        },
        komsular: {
            kuzey: "Ağrı (Patnos / Süphan Dağı)",
            dogu: "Van / Van Gölü",
            guney: "Siirt / Batman",
            bati: "Muş (Rahva Ovası)"
        },
        komsuIller: ["Van", "Ağrı", "Muş", "Batman", "Siirt"],
        sinirKomsulari: {
            "Tatvan - Gevaş": { ilce: "Tatvan", komsuIl: "Van (Gevaş / Edremit Sahil Yolu)", mesafeKm: 85, yol: "D-300" },
            "Bitlis - Baykan": { ilce: "Merkez", komsuIl: "Siirt (Baykan / Veysel Karani)", mesafeKm: 45, yol: "D-965 / E99" },
            "Güroymak - Hasköy": { ilce: "Güroymak (Rahva)", komsuIl: "Muş (Hasköy / Merkez)", mesafeKm: 50, yol: "D-300" },
            "Adilcevaz - Patnos": { ilce: "Adilcevaz / Ahlat", komsuIl: "Ağrı (Patnos / Süphan Dağı)", mesafeKm: 65, yol: "D-280 / D-965" },
            "Mutki - Sason": { ilce: "Mutki", komsuIl: "Batman (Sason)", mesafeKm: 60, yol: "13-77 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 35, ogrenci: 18, yasli: 0 }
    },
    "Bolu": {
        plaka: "14",
        bolge: "Karadeniz",
        merkezeMesafeKm: 395,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-14"]->.bolu; (node["highway"="bus_stop"](area.bolu););`,
        coordinates: {
            dms: "40°44′N 31°36′E",
            enlemDms: "40°44′K",
            boylamDms: "31°36′D",
            lat: 40.7350,
            lon: 31.6061,
            rakimMetre: 726,
            merkezeMesafeKm: 395,
            konumAciklamasi: "Batı Karadeniz Bölgesi'nde, İstanbul ile Ankara arasındaki stratejik dağ geçidi ve doğa harikası. Bolu Dağı Tüneli ve Viyadükleri, Abant Gölü, Yedigöller Milli Parkı, Gölcük, Kartalkaya Kayak Merkezi ve Mengen aşçılarıyla dünyaca ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 395, "Çorlu": 360, "Çerkezköy": 350,
            "Ergene": 370, "Marmaraereğlisi": 355, "İstanbul": 260, "Ankara": 190,
            "Düzce": 45, "Sakarya": 115, "Zonguldak": 150, "Karabük": 140, "Çankırı": 155, "Gerede": 55, "Mengen": 58, "Mudurnu": 52, "Göynük": 95
        },
        komsular: {
            kuzey: "Zonguldak / Karabük",
            dogu: "Çankırı / Ankara",
            guney: "Ankara / Eskişehir",
            bati: "Düzce / Sakarya / Bilecik"
        },
        komsuIller: ["Düzce", "Sakarya", "Bilecik", "Eskişehir", "Ankara", "Çankırı", "Karabük", "Zonguldak"],
        sinirKomsulari: {
            "Bolu Dağı - Kaynaşlı": { ilce: "Merkez", komsuIl: "Düzce (Kaynaşlı / Bolu Dağı Tüneli)", mesafeKm: 30, yol: "O-4 / D-100" },
            "Gerede - Kızılcahamam": { ilce: "Gerede", komsuIl: "Ankara (Kızılcahamam / Çamlıdere)", mesafeKm: 55, yol: "O-4 / D-750" },
            "Gerede - Çerkeş": { ilce: "Gerede", komsuIl: "Çankırı (Çerkeş)", mesafeKm: 40, yol: "D-100 / E80" },
            "Mengen - Devrek": { ilce: "Mengen", komsuIl: "Zonguldak (Devrek)", mesafeKm: 50, yol: "D-750" },
            "Mengen - Eskipazar": { ilce: "Mengen / Gerede", komsuIl: "Karabük (Eskipazar)", mesafeKm: 65, yol: "D-755" },
            "Göynük - Pamukova": { ilce: "Göynük", komsuIl: "Sakarya (Taraklı / Geyve)", mesafeKm: 45, yol: "D-160" },
            "Mudurnu - Nallıhan": { ilce: "Mudurnu", komsuIl: "Ankara (Nallıhan)", mesafeKm: 50, yol: "D-140" },
            "Göynük - Gölpazarı": { ilce: "Göynük", komsuIl: "Bilecik (Gölpazarı / Yenipazar)", mesafeKm: 55, yol: "D-160" }
        },
        terrain: "daglik",
        ucretler: { tam: 35, ogrenci: 18, yasli: 0 }
    },
    "Burdur": {
        plaka: "15",
        bolge: "Akdeniz",
        merkezeMesafeKm: 710,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-15"]->.burdur; (node["highway"="bus_stop"](area.burdur););`,
        coordinates: {
            dms: "37°43′N 30°17′E",
            enlemDms: "37°43′K",
            boylamDms: "30°17′D",
            lat: 37.7203,
            lon: 30.2908,
            rakimMetre: 950,
            merkezeMesafeKm: 710,
            konumAciklamasi: "Akdeniz Bölgesi'nin Göller Yöresi'nde, Toros Dağları'nın kuzey eteklerinde yer alır. Türkiye'nin Maldivleri olarak bilinen Salda Gölü, Burdur Gölü, Sagalassos Antik Kenti, İnsuyu Mağarası, ceviz ezmesi ve şiş köftesiyle ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 710, "Çorlu": 675, "Çerkezköy": 665,
            "Ergene": 685, "Marmaraereğlisi": 670, "İstanbul": 580, "Ankara": 420,
            "Isparta": 30, "Antalya": 122, "Denizli": 150, "Afyonkarahisar": 170, "Muğla": 240, "Bucak": 45, "Yeşilova (Salda)": 60, "Gölhisar": 105
        },
        komsular: {
            kuzey: "Afyonkarahisar (Dinar)",
            dogu: "Isparta",
            guney: "Antalya (Çubuk Boğazı)",
            bati: "Denizli / Muğla (Salda Gölü)"
        },
        komsuIller: ["Afyonkarahisar", "Isparta", "Antalya", "Muğla", "Denizli"],
        sinirKomsulari: {
            "Bucak - Çubuk Boğazı": { ilce: "Bucak", komsuIl: "Antalya (Döşemealtı / Kepez)", mesafeKm: 45, yol: "D-650" },
            "Burdur - Isparta": { ilce: "Merkez", komsuIl: "Isparta (Merkez / Havalimanı)", mesafeKm: 30, yol: "D-330 / D-685" },
            "Gölhisar - Acıpayam": { ilce: "Gölhisar / Yeşilova", komsuIl: "Denizli (Acıpayam / Serinhisar)", mesafeKm: 55, yol: "D-330" },
            "Yeşilova - Salda": { ilce: "Yeşilova", komsuIl: "Denizli (Çardak) / Afyon (Başmakçı)", mesafeKm: 60, yol: "D-330" },
            "Altınyayla - Fethiye": { ilce: "Altınyayla (Dirmil)", komsuIl: "Muğla (Seydikemer / Fethiye)", mesafeKm: 70, yol: "D-350" }
        },
        terrain: "daglik",
        ucretler: { tam: 35, ogrenci: 18, yasli: 0 }
    },
    "Sinop": {
        plaka: "57",
        bolge: "Karadeniz",
        merkezeMesafeKm: 810,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-57"]->.sinop; (node["highway"="bus_stop"](area.sinop););`,
        coordinates: {
            dms: "42°01′N 35°09′E",
            enlemDms: "42°01′K",
            boylamDms: "35°09′D",
            lat: 42.0267,
            lon: 35.1511,
            rakimMetre: 25,
            merkezeMesafeKm: 810,
            konumAciklamasi: "Karadeniz Bölgesi'nde, Boztepe Yarımadası üzerinde yer alan ve Türkiye'nin en kuzey noktası İnceburun'a ev sahipliği yapan kadim liman kenti. Tarihi Sinop Cezaevi, Hamsilos Koyu, Erfelek Tatlıca Şelaleleri, Boyabat Kalesi ve nokulu ile ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 810, "Çorlu": 775, "Çerkezköy": 765,
            "Ergene": 785, "Marmaraereğlisi": 770, "İstanbul": 680, "Ankara": 415,
            "Samsun": 155, "Kastamonu": 180, "Çorum": 210, "Boyabat": 85, "Gerze": 38, "Ayancık": 55, "Türkeli": 90, "İnceburun": 20
        },
        komsular: {
            kuzey: "Karadeniz (İnceburun - En Kuzey Nokta)",
            dogu: "Samsun (Alaçam / Yakakent)",
            guney: "Çorum (Kargı / Osmancık)",
            bati: "Kastamonu (Taşköprü / Çatalzeytin)"
        },
        komsuIller: ["Kastamonu", "Çorum", "Samsun"],
        sinirKomsulari: {
            "Gerze - Alaçam": { ilce: "Gerze / Dikmen", komsuIl: "Samsun (Alaçam / Yakakent Sahil Yolu)", mesafeKm: 45, yol: "D-010 Karadeniz Sahil Yolu" },
            "Boyabat - Kargı": { ilce: "Boyabat / Saraydüzü", komsuIl: "Çorum (Kargı / Osmancık)", mesafeKm: 55, yol: "D-785" },
            "Boyabat - Taşköprü": { ilce: "Boyabat", komsuIl: "Kastamonu (Taşköprü / Hanönü)", mesafeKm: 70, yol: "D-030" },
            "Türkeli - Çatalzeytin": { ilce: "Türkeli", komsuIl: "Kastamonu (Çatalzeytin / Abana)", mesafeKm: 15, yol: "D-010" },
            "Durağan - Vezirköprü": { ilce: "Durağan", komsuIl: "Samsun (Vezirköprü)", mesafeKm: 65, yol: "D-030" }
        },
        terrain: "sahil",
        ucretler: { tam: 35, ogrenci: 18, yasli: 0 }
    },
    "Bursa": {
        plaka: "16",
        bolge: "Marmara",
        merkezeMesafeKm: 275,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-16"]->.bursa; (node["highway"="bus_stop"](area.bursa););`,
        coordinates: {
            dms: "40°11′N 29°04′E",
            enlemDms: "40°11′K",
            boylamDms: "29°04′D",
            lat: 40.1885,
            lon: 29.0610,
            rakimMetre: 155,
            merkezeMesafeKm: 275,
            konumAciklamasi: "Marmara Bölgesi'nin güneyinde, Uludağ'ın eteklerinde kurulu, Osmanlı Devleti'nin ilk başkenti ve Türkiye'nin sanayi metropolü. Ulu Cami, Yeşil Türbe, Uludağ Kayak Merkezi, İskender Kebabı, kestane şekeri, Mudanya ve Gemlik kıyıları, İznik çinileri ve İnegöl mobilyasıyla dünyaca ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 275, "Çorlu": 310, "Çerkezköy": 335,
            "Ergene": 315, "Marmaraereğlisi": 300, "İstanbul": 155, "Ankara": 385,
            "Yalova": 70, "Bilecik": 95, "Balıkesir": 150, "Kütahya": 175, "Eskişehir": 150, "Kocaeli": 135, "İnegöl": 45, "Mudanya": 30, "Gemlik": 32
        },
        komsular: {
            kuzey: "Marmara Denizi (Gemlik / Mudanya) / Yalova",
            dogu: "Bilecik / Sakarya",
            guney: "Kütahya (Uludağ & Domaniç Dağları)",
            bati: "Balıkesir (Karacabey / Mustafakemalpaşa)"
        },
        komsuIller: ["Yalova", "Kocaeli", "Sakarya", "Bilecik", "Kütahya", "Balıkesir"],
        sinirKomsulari: {
            "Orhangazi - Yalova": { ilce: "Orhangazi", komsuIl: "Yalova (Süpürgelik / Osmangazi Köprüsü)", mesafeKm: 22, yol: "O-5 / D-575" },
            "Karacabey - Bandırma": { ilce: "Karacabey", komsuIl: "Balıkesir (Bandırma / Çanakkale Aksı)", mesafeKm: 40, yol: "D-200 / E90" },
            "Mustafakemalpaşa - Susurluk": { ilce: "Mustafakemalpaşa", komsuIl: "Balıkesir (Susurluk / Merkez)", mesafeKm: 30, yol: "O-5 / D-565" },
            "İnegöl - Bozüyük": { ilce: "İnegöl", komsuIl: "Bilecik (Bozüyük / Mezit Boğazı)", mesafeKm: 45, yol: "D-200 / E90" },
            "Yenişehir - Bilecik": { ilce: "Yenişehir", komsuIl: "Bilecik (Merkez)", mesafeKm: 40, yol: "D-160" },
            "İznik - Karamürsel": { ilce: "İznik", komsuIl: "Kocaeli (Karamürsel / Samanlı Dağları)", mesafeKm: 35, yol: "D-595" },
            "Keles - Domaniç": { ilce: "Keles / İnegöl", komsuIl: "Kütahya (Domaniç / Tavşanlı)", mesafeKm: 50, yol: "43-80 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Çankırı": {
        plaka: "18",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 550,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-18"]->.cankiri; (node["highway"="bus_stop"](area.cankiri););`,
        coordinates: {
            dms: "40°36′N 33°37′E",
            enlemDms: "40°36′K",
            boylamDms: "33°37′D",
            lat: 40.6013,
            lon: 33.6134,
            rakimMetre: 750,
            merkezeMesafeKm: 550,
            konumAciklamasi: "İç Anadolu Bölgesi'nin kuzeyinde, Ilgaz Dağları'nın eteklerinde kurulu; tarihi Çankırı Kalesi, 5 bin yıllık Çankırı Kaya Tuzu Mağarası, Selçuklu eseri Taş Mescit, Ilgaz Dağı Milli Parkı & Kayak Merkezi, Eldivan kirazı ve zengin yarenlik kültürü ile tanınan köklü Anadolu şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 550, "Çorlu": 515, "Çerkezköy": 490,
            "Ergene": 520, "Marmaraereğlisi": 535, "İstanbul": 415, "Ankara": 130,
            "Bolu": 190, "Karabük": 120, "Kastamonu": 105, "Çorum": 155, "Kırıkkale": 110, "Ilgaz": 50, "Çerkeş": 85, "Kurşunlu": 50
        },
        komsular: {
            kuzey: "Kastamonu (Ilgaz Dağı & Geçidi)",
            dogu: "Çorum (Kızılırmak Havzası / İskilip / Bayat)",
            guney: "Ankara (Kalecik / Akyurt) / Kırıkkale (Sulakyurt)",
            bati: "Bolu (Gerede) / Karabük (Eskipazar - D-100 Hattı)"
        },
        komsuIller: ["Bolu", "Karabük", "Kastamonu", "Çorum", "Kırıkkale", "Ankara"],
        sinirKomsulari: {
            "Ilgaz - Kastamonu": { ilce: "Ilgaz", komsuIl: "Kastamonu (Merkez / Tosya)", mesafeKm: 45, yol: "D-765 / Ilgaz 15 Temmuz İstiklal Tüneli" },
            "Çerkeş - Gerede": { ilce: "Çerkeş", komsuIl: "Bolu (Gerede / D-100 Karadeniz Bağlantısı)", mesafeKm: 45, yol: "D-100 / E80" },
            "Çerkeş - Eskipazar": { ilce: "Çerkeş", komsuIl: "Karabük (Eskipazar / Safranbolu Yolu)", mesafeKm: 40, yol: "D-100 / D-030" },
            "Şabanözü - Kalecik": { ilce: "Şabanözü / Orta", komsuIl: "Ankara (Kalecik / Akyurt)", mesafeKm: 50, yol: "D-765 / İl Yolu" },
            "Kızılırmak - Sungurlu": { ilce: "Kızılırmak", komsuIl: "Çorum (Sungurlu / İskilip)", mesafeKm: 45, yol: "D-180" },
            "Kızılırmak - Sulakyurt": { ilce: "Kızılırmak", komsuIl: "Kırıkkale (Sulakyurt / Yahşihan)", mesafeKm: 40, yol: "71-02 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Çorum": {
        plaka: "19",
        bolge: "Karadeniz",
        merkezeMesafeKm: 745,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-19"]->.corum; (node["highway"="bus_stop"](area.corum););`,
        coordinates: {
            dms: "40°33′N 34°57′E",
            enlemDms: "40°33′K",
            boylamDms: "34°57′D",
            lat: 40.5506,
            lon: 34.9556,
            rakimMetre: 801,
            merkezeMesafeKm: 745,
            konumAciklamasi: "Orta Karadeniz'in iç kesiminde, Hitit İmparatorluğu'nun başkenti Hattuşa (UNESCO Dünya Mirası - Boğazkale), Alacahöyük ve Şapinuva ören yerlerine ev sahipliği yapan kadim tarih ve kültür şehri. Dünyaca ünlü Çorum leblebisi, Çorum Kalesi, tarihi Saat Kulesi, Selçuklu eseri Ulu Cami, İncesu Kanyonu ve gelişmiş makine sanayisiyle tanınır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 745, "Çorlu": 710, "Çerkezköy": 685,
            "Ergene": 715, "Marmaraereğlisi": 730, "İstanbul": 610, "Ankara": 245,
            "Amasya": 92, "Samsun": 172, "Sinop": 270, "Kastamonu": 195, "Çankırı": 155, "Kırıkkale": 165, "Yozgat": 108, "Tokat": 188,
            "Sungurlu": 72, "Osmancık": 58, "Alaca": 50, "İskilip": 55, "Boğazkale": 82
        },
        komsular: {
            kuzey: "Sinop (Kargı - Saraydüzü) / Samsun (Vezirköprü - Havza)",
            dogu: "Amasya (Merzifon - Gümüşhacıköy - Hamamözü)",
            guney: "Yozgat (Alaca - Boğazkale - Yerköy)",
            bati: "Çankırı (Bayat - İskilip) / Kırıkkale (Sungurlu - Delice) / Kastamonu (Osmancık - Tosya)"
        },
        komsuIller: ["Sinop", "Samsun", "Amasya", "Yozgat", "Kırıkkale", "Çankırı", "Kastamonu"],
        sinirKomsulari: {
            "Sungurlu - Delice": { ilce: "Sungurlu", komsuIl: "Kırıkkale (Delice / Ankara Yönü)", mesafeKm: 35, yol: "D-200 / E88" },
            "Osmancık - Tosya": { ilce: "Osmancık", komsuIl: "Kastamonu (Tosya / Ilgaz Aksı)", mesafeKm: 50, yol: "D-100 / E80" },
            "Osmancık - Merzifon": { ilce: "Osmancık / Gümüşhacıköy", komsuIl: "Amasya (Merzifon / Samsun Yönü)", mesafeKm: 45, yol: "D-100 / E80" },
            "Mecitözü - Amasya": { ilce: "Mecitözü", komsuIl: "Amasya (Merkez)", mesafeKm: 35, yol: "D-180" },
            "Alaca - Yozgat": { ilce: "Alaca", komsuIl: "Yozgat (Merkez / Sorgun)", mesafeKm: 45, yol: "D-795 / D-190" },
            "Bayat - Çankırı": { ilce: "Bayat / İskilip", komsuIl: "Çankırı (Merkez / Kızılırmak)", mesafeKm: 50, yol: "D-180" },
            "Kargı - Saraydüzü": { ilce: "Kargı", komsuIl: "Sinop (Saraydüzü / Boyabat)", mesafeKm: 40, yol: "D-785" }
        },
        terrain: "engebeli",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Denizli": {
        plaka: "20",
        bolge: "Ege",
        merkezeMesafeKm: 670,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-20"]->.denizli; (node["highway"="bus_stop"](area.denizli););`,
        coordinates: {
            dms: "37°46′N 29°05′E",
            enlemDms: "37°46′K",
            boylamDms: "29°05′D",
            lat: 37.7765,
            lon: 29.0864,
            rakimMetre: 354,
            merkezeMesafeKm: 670,
            konumAciklamasi: "Ege Bölgesi'nin Güney Ege bölümünde, Çürüksu (Lycos) Vadisi'nde yer alır. UNESCO Dünya Mirası beyaz travertenleri Pamukkale, Hierapolis ve Laodikeia antik kentleri, dünyaca meşhur tekstil sanayisi ve horozu ile ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 670, "Çorlu": 635, "Çerkezköy": 625,
            "Ergene": 645, "Marmaraereğlisi": 630, "İstanbul": 560, "Ankara": 480,
            "Aydın": 125, "Muğla": 145, "Afyonkarahisar": 220, "Uşak": 150, "Burdur": 150, "Antalya": 220, "İzmir": 225
        },
        komsular: {
            kuzey: "Uşak",
            dogu: "Afyonkarahisar",
            guney: "Muğla",
            bati: "Aydın"
        },
        komsuIller: ["Uşak", "Manisa", "Afyonkarahisar", "Burdur", "Muğla", "Aydın"],
        sinirKomsulari: {
            "Sarayköy": { ilce: "Sarayköy", komsuIl: "Aydın (Buharkent / Nazilli)", mesafeKm: 25, yol: "D-320" },
            "Buldan": { ilce: "Buldan", komsuIl: "Manisa (Alaşehir)", mesafeKm: 45, yol: "D-585" },
            "Çivril": { ilce: "Çivril", komsuIl: "Uşak / Afyon (Dinar)", mesafeKm: 95, yol: "D-595" },
            "Acıpayam": { ilce: "Acıpayam", komsuIl: "Burdur / Antalya", mesafeKm: 60, yol: "D-585" },
            "Tavas": { ilce: "Tavas", komsuIl: "Muğla (Menteşe)", mesafeKm: 75, yol: "D-330" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Diyarbakır": {
        plaka: "21",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1560,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-21"]->.diyarbakir; (node["highway"="bus_stop"](area.diyarbakir););`,
        coordinates: {
            dms: "37°55′N 40°14′E",
            enlemDms: "37°55′K",
            boylamDms: "40°14′D",
            lat: 37.9144,
            lon: 40.2306,
            rakimMetre: 675,
            merkezeMesafeKm: 1560,
            konumAciklamasi: "Güneydoğu Anadolu Bölgesi'nin kalbinde, Dicle Nehri kıyısında kurulu kadim medeniyetler beşiği. UNESCO Dünya Mirası Diyarbakır Surları ve Hevsel Bahçeleri, tarihi On Gözlü Köprü, İslam dünyasının 5. Harem-i Şerif'i kabul edilen Ulu Cami, Malabadi Köprüsü, Çermik kaplıcaları ve coğrafi işaretli Diyarbakır karpuzu ile tanınan köklü metropol."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1560, "Çorlu": 1525, "Çerkezköy": 1500,
            "Ergene": 1530, "Marmaraereğlisi": 1545, "İstanbul": 1425, "Ankara": 1000,
            "Adana": 535, "Şanlıurfa": 180, "Mardin": 95, "Batman": 100, "Elazığ": 155, "Bingöl": 140, "Muş": 205, "Adıyaman": 205, "Malatya": 250,
            "Ergani": 58, "Silvan": 82, "Bismil": 55, "Çınar": 35, "Çermik": 90, "Dicle": 90
        },
        komsular: {
            kuzey: "Bingöl (Genç) / Elazığ (Maden - Sivrice - Arıcak)",
            dogu: "Batman (Kozluk - Merkez - Beşiri) / Muş (Kulp Hattı)",
            guney: "Mardin (Mazıdağı - Derik - Kızıltepe)",
            bati: "Şanlıurfa (Siverek - Karacadağ) / Adıyaman (Gerger - Çermik) / Malatya (Pütürge - Çüngüş)"
        },
        komsuIller: ["Bingöl", "Elazığ", "Malatya", "Adıyaman", "Şanlıurfa", "Mardin", "Batman", "Muş"],
        sinirKomsulari: {
            "Ergani - Maden": { ilce: "Ergani", komsuIl: "Elazığ (Maden / Sivrice / Hazar Gölü Yönü)", mesafeKm: 30, yol: "D-885 / E99" },
            "Silvan - Batman": { ilce: "Silvan", komsuIl: "Batman (Merkez / Kozluk / Malabadi Köprüsü)", mesafeKm: 35, yol: "D-360" },
            "Çınar - Mazıdağı": { ilce: "Çınar", komsuIl: "Mardin (Mazıdağı / Derik / Merkez)", mesafeKm: 45, yol: "D-950" },
            "Çınar / Merkez - Siverek": { ilce: "Merkez / Çınar", komsuIl: "Şanlıurfa (Siverek / Hilvan / Şanlıurfa)", mesafeKm: 55, yol: "D-885 / Karacadağ Geçişi" },
            "Lice - Genç": { ilce: "Lice", komsuIl: "Bingöl (Genç / Merkez)", mesafeKm: 50, yol: "D-950" },
            "Kulp - Muş": { ilce: "Kulp", komsuIl: "Muş (Merkez / Varto)", mesafeKm: 60, yol: "21-06 İl Yolu" },
            "Çermik - Gerger": { ilce: "Çermik", komsuIl: "Adıyaman (Gerger / Siverek Fırat Geçişi)", mesafeKm: 45, yol: "İl Yolu" },
            "Çüngüş - Pütürge": { ilce: "Çüngüş", komsuIl: "Malatya (Pütürge / Doğanyol)", mesafeKm: 50, yol: "İl Yolu" }
        },
        terrain: "engebeli",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Elazığ": {
        plaka: "23",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1350,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-23"]->.elazig; (node["highway"="bus_stop"](area.elazig););`,
        coordinates: {
            dms: "38°40′N 39°13′E",
            enlemDms: "38°40′K",
            boylamDms: "39°13′D",
            lat: 38.6748,
            lon: 39.2225,
            rakimMetre: 1067,
            merkezeMesafeKm: 1350,
            konumAciklamasi: "Doğu Anadolu Bölgesi'nin Yukarı Fırat Bölümü'nde, Keban Baraj Gölü ve Hazar Gölü ile çevrili yarımada konumundaki kadim kültür şehri. 4 bin yıllık tarihi Harput Kalesi, Harput Ulu Cami (eğik minaresi), Hazarbaba Kayak Merkezi, Keban Barajı ve Hidroelektrik Santrali, Çayda Çıra halk oyunu, vişne mermeri ve zengin mutfak kültürü ile tanınan köklü Anadolu kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1350, "Çorlu": 1315, "Çerkezköy": 1290,
            "Ergene": 1320, "Marmaraereğlisi": 1335, "İstanbul": 1215, "Ankara": 765,
            "Malatya": 100, "Bingöl": 145, "Diyarbakır": 155, "Tunceli": 135, "Erzincan": 260, "Adıyaman": 240,
            "Keban": 45, "Sivrice": 30, "Maden": 75, "Kovancılar": 70, "Karakoçan": 100, "Palu": 75, "Baskil": 38
        },
        komsular: {
            kuzey: "Tunceli (Pertek Feribotu / Keban Gölü / Pülümür Dağları)",
            dogu: "Bingöl (Genç - Kovancılar - Karakoçan)",
            guney: "Diyarbakır (Maden Boğazı - Sivrice - Arıcak - Çüngüş)",
            bati: "Malatya (Kömürhan Köprüsü - Karakaya Barajı - Fırat Kanyonu) / Erzincan (Kemaliye dağlık sınırı)"
        },
        komsuIller: ["Tunceli", "Bingöl", "Diyarbakır", "Malatya", "Erzincan"],
        sinirKomsulari: {
            "Baskil - Kale": { ilce: "Baskil / Merkez", komsuIl: "Malatya (Kale / Battalgazi / Kömürhan Köprüsü)", mesafeKm: 50, yol: "D-300 / Yeni Kömürhan Köprüsü & Tüneli" },
            "Maden - Ergani": { ilce: "Maden", komsuIl: "Diyarbakır (Ergani / Dicle Havzası)", mesafeKm: 30, yol: "D-885 / E99" },
            "Kovancılar - Genç": { ilce: "Kovancılar / Karakoçan", komsuIl: "Bingöl (Genç / Merkez)", mesafeKm: 45, yol: "D-300" },
            "Merkez - Pertek": { ilce: "Merkez", komsuIl: "Tunceli (Pertek / Hozat / Keban Feribot)", mesafeKm: 25, yol: "D-885 / Pertek Feribotu" },
            "Ağın - Kemaliye": { ilce: "Ağın", komsuIl: "Erzincan (Kemaliye / İliç)", mesafeKm: 50, yol: "D-260 / Ağın Köprüsü" }
        },
        terrain: "engebeli",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Erzincan": {
        plaka: "24",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1170,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-24"]->.erzincan; (node["highway"="bus_stop"](area.erzincan););`,
        coordinates: {
            dms: "39°45′N 39°29′E",
            enlemDms: "39°45′K",
            boylamDms: "39°29′D",
            lat: 39.7468,
            lon: 39.4911,
            rakimMetre: 1185,
            merkezeMesafeKm: 1170,
            konumAciklamasi: "Doğu Anadolu Bölgesi'nin Yukarı Fırat Bölümü'nde, Karasu (Fırat) Nehri vadisinde kurulu, tarihi İpek Yolu kavşağı. Dünyaca ünlü Girlevik Şelalesi, Ergan Dağı Kayak Merkezi, Munzur Dağları etekleri, Kemaliye (Eğin) Karanlık Kanyon ve Taş Yolu (UNESCO Geçici Mirası), tulum peyniri, bakır işlemeciliği ve cimin üzümü ile tanınan kadim Anadolu kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1170, "Çorlu": 1135, "Çerkezköy": 1110,
            "Ergene": 1140, "Marmaraereğlisi": 1155, "İstanbul": 1035, "Ankara": 685,
            "Erzurum": 190, "Sivas": 250, "Elazığ": 260, "Tunceli": 135, "Gümüşhane": 135, "Bayburt": 145, "Malatya": 250, "Bingöl": 220,
            "Refahiye": 70, "Tercan": 95, "Üzümlü": 20, "Kemaliye": 155, "Kemah": 50, "Çayırlı": 65, "İliç": 115, "Otlukbeli": 140
        },
        komsular: {
            kuzey: "Gümüşhane (Kelkit - Köse) / Bayburt (Otlukbeli - Çayırlı) / Giresun (Çamoluk - Refahiye)",
            dogu: "Erzurum (Aşkale - Tercan - Karasu Vadisi)",
            guney: "Tunceli (Pülümür Kanyonu - Munzur Dağları) / Bingöl (Yedisu Sınırı)",
            bati: "Sivas (Kızıldağ Geçidi - Refahiye - Suşehri - İmranlı) / Malatya (Kemaliye - Arapgir)"
        },
        komsuIller: ["Sivas", "Gümüşhane", "Bayburt", "Erzurum", "Tunceli", "Bingöl", "Elazığ", "Malatya", "Giresun"],
        fizikiSinirKomsulari: ["Giresun", "Sivas", "Gümüşhane", "Bayburt", "Erzurum", "Tunceli", "Bingöl", "Elazığ", "Malatya"],
        sinirKomsulari: {
            "Refahiye - İmranlı": { ilce: "Refahiye", komsuIl: "Sivas (İmranlı / Suşehri / Kızıldağ Geçidi)", mesafeKm: 70, yol: "D-100 / E80 / Kızıldağ 2190m" },
            "Tercan - Aşkale": { ilce: "Tercan", komsuIl: "Erzurum (Aşkale / Karasu Vadisi)", mesafeKm: 55, yol: "D-100 / E80" },
            "Merkez - Pülümür": { ilce: "Merkez", komsuIl: "Tunceli (Pülümür / Munzur Kanyonu)", mesafeKm: 60, yol: "D-885 / Pülümür Geçidi" },
            "Refahiye - Kelkit": { ilce: "Refahiye", komsuIl: "Gümüşhane (Kelkit / Köse / Çimen Dağı)", mesafeKm: 50, yol: "D-040" },
            "Çayırlı - Demirözü": { ilce: "Çayırlı / Otlukbeli", komsuIl: "Bayburt (Demirözü / Pulur)", mesafeKm: 45, yol: "69-51 İl Yolu" },
            "Kemaliye - Arapgir": { ilce: "Kemaliye", komsuIl: "Malatya (Arapgir / Keban Yolu)", mesafeKm: 45, yol: "D-260 / Fırat Kanyonu" },
            "Refahiye - Çamoluk": { ilce: "Refahiye", komsuIl: "Giresun (Çamoluk / Şebinkarahisar)", mesafeKm: 40, yol: "28-26 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Erzurum": {
        plaka: "25",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1360,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-25"]->.erzurum; (node["highway"="bus_stop"](area.erzurum););`,
        coordinates: {
            dms: "39°54′N 41°16′E",
            enlemDms: "39°54′K",
            boylamDms: "41°16′D",
            lat: 39.9055,
            lon: 41.2658,
            rakimMetre: 1890,
            merkezeMesafeKm: 1360,
            konumAciklamasi: "Doğu Anadolu Bölgesi'nin zirvesi, tarihi İpek Yolu'nun kavşağı ve Türkiye'nin kış turizmi başkenti. Çifte Minareli Medrese, Yakutiye Medresesi, Erzurum Kalesi, Üç Kümbetler, dünyaca ünlü Palandöken Kayak Merkezi, Tortum Şelalesi, Oltu taşı, cağ kebabı, kadayıf dolması ve Kurtuluş Savaşı'nın temellerinin atıldığı Erzurum Kongresi binasıyla tanınan dadaşlar diyarı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1360, "Çorlu": 1325, "Çerkezköy": 1300,
            "Ergene": 1330, "Marmaraereğlisi": 1345, "İstanbul": 1225, "Ankara": 875,
            "Erzincan": 190, "Kars": 200, "Ağrı": 185, "Muş": 220, "Bingöl": 180, "Bayburt": 125, "Artvin": 200, "Trabzon": 265, "Rize": 250, "Ardahan": 230,
            "Aşkale": 55, "Pasinler": 40, "Horasan": 85, "Oltu": 115, "İspir": 140, "Tortum": 55, "Çat": 50, "Hınıs": 150
        },
        komsular: {
            kuzey: "Artvin (Tortum Gölü - Yusufeli) / Rize (İspir - Ovit Tüneli - İkizdere)",
            dogu: "Ağrı (Eleşkirt - Horasan) / Kars (Sarıkamış - Süngütaşı) / Ardahan (Göle - Şenkaya)",
            guney: "Bingöl (Karlıova - Çat) / Muş (Varto - Hınıs)",
            bati: "Erzincan (Tercan - Aşkale) / Bayburt (Kop Dağı Geçidi - Pazaryolu)"
        },
        komsuIller: ["Artvin", "Rize", "Bayburt", "Erzincan", "Bingöl", "Muş", "Ağrı", "Kars", "Ardahan"],
        fizikiSinirKomsulari: ["Eskişehir", "Artvin", "Rize", "Bayburt", "Erzincan", "Bingöl", "Muş", "Ağrı", "Kars", "Ardahan"],
        sinirKomsulari: {
            "İspir - İkizdere": { ilce: "İspir", komsuIl: "Rize (İkizdere / Karadeniz / Ovit Tüneli)", mesafeKm: 70, yol: "D-925 / Ovit Tüneli 14.3km" },
            "Aşkale - Kop": { ilce: "Aşkale", komsuIl: "Bayburt (Merkez / Kop Dağı Geçidi 2409m)", mesafeKm: 50, yol: "D-915 / Kop Tüneli" },
            "Aşkale - Tercan": { ilce: "Aşkale", komsuIl: "Erzincan (Tercan / Karasu Vadisi)", mesafeKm: 55, yol: "D-100 / E80" },
            "Horasan - Eleşkirt": { ilce: "Horasan", komsuIl: "Ağrı (Eleşkirt / Merkez / Saç Dağı Geçidi)", mesafeKm: 65, yol: "D-100 / E80" },
            "Horasan - Sarıkamış": { ilce: "Horasan", komsuIl: "Kars (Sarıkamış / Süngütaşı Geçidi)", mesafeKm: 75, yol: "D-080" },
            "Uzundere - Yusufeli": { ilce: "Uzundere / Tortum", komsuIl: "Artvin (Yusufeli / Tortum Şelalesi)", mesafeKm: 65, yol: "D-950" },
            "Çat - Karlıova": { ilce: "Çat", komsuIl: "Bingöl (Karlıova / Çat Boğazı)", mesafeKm: 60, yol: "D-950" },
            "Hınıs - Varto": { ilce: "Hınıs", komsuIl: "Muş (Varto / Bingöl Dağları)", mesafeKm: 50, yol: "25-26 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Konya": {
        plaka: "42",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 700,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-42"]->.konya; (node["highway"="bus_stop"](area.konya););`,
        coordinates: {
            dms: "37°52′N 32°29′E",
            enlemDms: "37°52′K",
            boylamDms: "32°29′D",
            lat: 37.8714,
            lon: 32.4846,
            rakimMetre: 1016,
            merkezeMesafeKm: 700,
            konumAciklamasi: "Türkiye'nin yüzölçümü bakımından en büyük ili (tahıl ambarı). Anadolu Selçuklu Devleti'nin ebedi başkenti, Hz. Mevlana Celaleddin-i Rumi'nin şehri. Mevlana Müzesi ve Türbesi, UNESCO Dünya Mirası Çatalhöyük Neolitik Kenti, Alaeddin Tepesi ve Camii, İnce Minareli Medrese, Karatay Medresesi, Beyşehir Gölü Milli Parkı, Meke Maar Gölü, etliekmeği ve fırın kebabı ile dünyaca meşhur medeniyet metropolü."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 700, "Çorlu": 665, "Çerkezköy": 640,
            "Ergene": 670, "Marmaraereğlisi": 685, "İstanbul": 565, "Ankara": 260,
            "Afyonkarahisar": 225, "Antalya": 305, "Aksaray": 145, "Karaman": 120, "Eskişehir": 330, "Isparta": 240, "Burdur": 270, "Bursa": 485,
            "Akşehir": 135, "Beyşehir": 90, "Seydişehir": 85, "Ereğli": 150, "Cihanbeyli": 100, "Kulu": 150, "Ilgın": 90, "Çumra": 45
        },
        komsular: {
            kuzey: "Ankara (Kulu - Cihanbeyli - Tuz Gölü)",
            dogu: "Aksaray (Sultanhanı) / Niğde (Ereğli - Bor)",
            guney: "Karaman (Ayrancı - Çumra) / Mersin & Antalya (Toros Dağları - Alacabel Geçidi - Seydişehir)",
            bati: "Isparta (Beyşehir Gölü) / Afyonkarahisar (Akşehir - Sultandağı) / Eskişehir (Çeltik)"
        },
        komsuIller: ["Ankara", "Aksaray", "Niğde", "Karaman", "Mersin", "Antalya", "Isparta", "Afyonkarahisar", "Eskişehir"],
        fizikiSinirKomsulari: ["Ankara", "Aksaray", "Niğde", "Karaman", "Mersin", "Antalya", "Isparta", "Afyonkarahisar", "Eskişehir"],
        sinirKomsulari: {
            "Kulu - Gölbaşı": { ilce: "Kulu / Cihanbeyli", komsuIl: "Ankara (Gölbaşı / Bala / Şereflikoçhisar)", mesafeKm: 110, yol: "D-715 Otoyolu" },
            "Akşehir - Sultandağı": { ilce: "Akşehir", komsuIl: "Afyonkarahisar (Sultandağı / Çay)", mesafeKm: 35, yol: "D-300 / E96" },
            "Seydişehir - Akseki": { ilce: "Seydişehir", komsuIl: "Antalya (Akseki / Manavgat / Alanya)", mesafeKm: 60, yol: "D-695 / Alacabel Geçidi 1825m" },
            "Çumra - Merkez": { ilce: "Çumra / Merkez", komsuIl: "Karaman (Merkez / Kazımkarabekir)", mesafeKm: 45, yol: "D-715" },
            "Merkez - Sultanhanı": { ilce: "Merkez", komsuIl: "Aksaray (Sultanhanı / Eskil)", mesafeKm: 70, yol: "D-300 İpek Yolu" },
            "Ereğli - Ulukışla": { ilce: "Ereğli", komsuIl: "Niğde (Ulukışla / Bor)", mesafeKm: 40, yol: "D-330" },
            "Beyşehir - Şarkikaraağaç": { ilce: "Beyşehir", komsuIl: "Isparta (Şarkikaraağaç / Yalvaç)", mesafeKm: 55, yol: "D-695" },
            "Hadim - Mut": { ilce: "Hadim / Taşkent", komsuIl: "Mersin (Mut / Silifke / Toroslar)", mesafeKm: 50, yol: "D-340" }
        },
        terrain: "duzluk",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Yalova": {
        plaka: "77",
        bolge: "Marmara",
        merkezeMesafeKm: 220,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-77"]->.yalova; (node["highway"="bus_stop"](area.yalova););`,
        coordinates: {
            dms: "40°39′N 29°16′E",
            enlemDms: "40°39′K",
            boylamDms: "29°16′D",
            lat: 40.6550,
            lon: 29.2769,
            rakimMetre: 25,
            merkezeMesafeKm: 220,
            konumAciklamasi: "Marmara Denizi'nin güney kıyısında, Samanlı Dağları'nın eteklerinde kurulu Türkiye'nin yüzölçümü en kompakt sahil ili. Gazi Mustafa Kemal Atatürk'ün 'Yalova benim kentimdir' dediği tarihi Yürüyen Köşk, dünyaca ünlü şifalı Termal Kaplıcaları, Çınarcık ve Armutlu tatil sahilleri, Osmangazi Köprüsü çıkışı, çiçek seraları ve İDO hızlı feribot limanıyla tanınır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 220, "Çorlu": 240, "Çerkezköy": 265,
            "Ergene": 245, "Marmaraereğlisi": 230, "İstanbul": 95, "Ankara": 410,
            "Kocaeli": 45, "Bursa": 70, "Sakarya": 85, "Bilecik": 110, "Balıkesir": 200,
            "Çınarcık": 15, "Termal": 12, "Altınova": 25, "Armutlu": 50, "Çiftlikköy": 5
        },
        komsular: {
            kuzey: "Marmara Denizi (İzmit Körfezi / Osmangazi Köprüsü / İstanbul Karşı Kıyısı)",
            dogu: "Kocaeli (Karamürsel - Gölcük)",
            guney: "Bursa (Orhangazi - Gemlik - Samanlı Dağları - Süpürgelik Geçidi)",
            bati: "Marmara Denizi / Armutlu Yarımadası / Gemlik Körfezi"
        },
        komsuIller: ["Bursa", "Kocaeli"],
        fizikiSinirKomsulari: ["Bursa", "Kocaeli"],
        sinirKomsulari: {
            "Altınova - Karamürsel": { ilce: "Altınova", komsuIl: "Kocaeli (Karamürsel / Gölcük / İzmit)", mesafeKm: 10, yol: "D-130 Otoyolu" },
            "Merkez - Orhangazi": { ilce: "Merkez", komsuIl: "Bursa (Orhangazi / Gemlik / Süpürgelik Geçidi)", mesafeKm: 22, yol: "O-5 / D-575" },
            "Armutlu - Gemlik": { ilce: "Armutlu", komsuIl: "Bursa (Gemlik Kıyı Aksı)", mesafeKm: 35, yol: "77-51 Sahil Yolu" },
            "Altınova - Dilovası": { ilce: "Altınova", komsuIl: "Kocaeli & İstanbul (Osmangazi Asma Köprüsü Geçişi)", mesafeKm: 5, yol: "O-5 Otoyolu" }
        },
        terrain: "sahil",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },
    "Bayburt": {
        plaka: "69",
        bolge: "Karadeniz",
        merkezeMesafeKm: 1265,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-69"]->.bayburt; (node["highway"="bus_stop"](area.bayburt););`,
        coordinates: {
            dms: "40°15′N 40°13′E",
            enlemDms: "40°15′K",
            boylamDms: "40°13′D",
            lat: 40.2552,
            lon: 40.2249,
            rakimMetre: 1550,
            merkezeMesafeKm: 1265,
            konumAciklamasi: "Doğu Karadeniz Bölgesi'nin iç kesiminde, Çoruh Nehri'nin iki yakasında, tarihi İpek Yolu üzerinde kurulu kadim Türk-İslam kenti. Çinimaçin Kalesi (Bayburt Kalesi), Dede Korkut Kümbeti ve Türbesi, tarihi Saat Kulesi, Baksı Müzesi, Kenan Yavuz Etnografya Müzesi, Kop Dağı Müdafaası Tarihi Milli Parkı ve Sırakayalar Şelalesi ile tanınır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1265, "Çorlu": 1230, "Çerkezköy": 1205,
            "Ergene": 1235, "Marmaraereğlisi": 1250, "İstanbul": 1130, "Ankara": 775,
            "Erzurum": 125, "Trabzon": 140, "Gümüşhane": 78, "Erzincan": 145, "Rize": 180, "Artvin": 250,
            "Aydıntepe": 15, "Demirözü": 30
        },
        komsular: {
            kuzey: "Trabzon (Soğanlı Dağları Geçidi) / Rize (İkizdere Yaylaları)",
            dogu: "Erzurum (Kop Dağı - Aşkale - Pazaryolu - İspir)",
            guney: "Erzincan (Otlukbeli - Çayırlı)",
            bati: "Gümüşhane (Vauk Dağı Geçidi - Kelkit - Köse)"
        },
        komsuIller: ["Trabzon", "Rize", "Erzurum", "Erzincan", "Gümüşhane"],
        fizikiSinirKomsulari: ["Gümüşhane", "Erzincan", "Erzurum", "Trabzon", "Rize"],
        sinirKomsulari: {
            "Merkez - Aşkale": { ilce: "Merkez", komsuIl: "Erzurum (Aşkale / Kop Dağı Geçidi / Erzurum)", mesafeKm: 50, yol: "D-915 / Kop Tüneli" },
            "Merkez - Gümüşhane": { ilce: "Merkez", komsuIl: "Gümüşhane (Merkez / Vauk Dağı Geçidi)", mesafeKm: 40, yol: "D-050 / Vauk Tüneli" },
            "Demirözü - Otlukbeli": { ilce: "Demirözü", komsuIl: "Erzincan (Otlukbeli / Çayırlı)", mesafeKm: 45, yol: "69-51 İl Yolu" },
            "Aydıntepe - Çaykara": { ilce: "Aydıntepe", komsuIl: "Trabzon (Çaykara / Soğanlı Geçidi / Of)", mesafeKm: 60, yol: "D-915 / Derebaşı Virajları" },
            "Merkez - Pazaryolu": { ilce: "Merkez", komsuIl: "Erzurum (Pazaryolu / İspir / Çoruh)", mesafeKm: 55, yol: "D-050" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },

    "Tekirdağ": {
        plaka: "59",
        bolge: "Marmara",
        merkezeMesafeKm: 0,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-59"]->.tekirdag; (node["highway"="bus_stop"](area.tekirdag); node["traffic_calming"~"bump|hump"](area.tekirdag););`,
        coordinates: {
            dms: "40°59′N 27°31′E",
            enlemDms: "40°59′K",
            boylamDms: "27°31′D",
            lat: 40.9833,
            lon: 27.5167,
            rakimMetre: 10,
            konumAciklamasi: "Türkiye'nin kuzeybatısında, Marmara Bölgesi Trakya yakasında yer alır. Doğuda İstanbul, batıda Edirne ve Çanakkale, kuzeyde Kırklareli ve Karadeniz, güneyde Marmara Denizi ile çevrilidir."
        },
        komsular: {
            kuzey: "Kırklareli (Lüleburgaz - Babaeski - Vize)",
            dogu: "İstanbul (Silivri - Çatalca)",
            guney: "Marmara Denizi ve Çanakkale (Gelibolu / Şarköy)",
            bati: "Edirne (Uzunköprü - Keşan - Meriç)"
        },
        komsuIller: ["İstanbul", "Kırklareli", "Edirne", "Çanakkale"],
        fizikiSinirKomsulari: ["İstanbul", "Kırklareli", "Edirne", "Çanakkale"],
        sinirKomsulari: {
            "Marmaraereğlisi - Silivri": { ilce: "Marmaraereğlisi", komsuIl: "İstanbul (Silivri / Gümüşyaka)", mesafeKm: 15, yol: "D-110 / E84" },
            "Çerkezköy - Silivri": { ilce: "Çerkezköy / Kapaklı", komsuIl: "İstanbul (Silivri / Çatalca)", mesafeKm: 25, yol: "D-567 / O-3" },
            "Muratlı - Lüleburgaz": { ilce: "Muratlı", komsuIl: "Kırklareli (Lüleburgaz / Büyükkarıştıran)", mesafeKm: 22, yol: "D-565" },
            "Saray - Vize": { ilce: "Saray", komsuIl: "Kırklareli (Vize / Kıyıköy)", mesafeKm: 20, yol: "D-020" },
            "Hayrabolu - Uzunköprü": { ilce: "Hayrabolu", komsuIl: "Edirne (Uzunköprü)", mesafeKm: 42, yol: "D-555" },
            "Malkara - Keşan": { ilce: "Malkara", komsuIl: "Edirne (Keşan / İpsala)", mesafeKm: 28, yol: "D-110 / E84" },
            "Şarköy - Gelibolu": { ilce: "Şarköy", komsuIl: "Çanakkale (Gelibolu / Evreşe)", mesafeKm: 35, yol: "D-120" }
        },
        ilcelerBilgisi: {
            toplamIlceSayisi: 11,
            aciklama: "Eski merkez ilçe Süleymanpaşa adını aldı. Çorlu'ya bağlı beldelerin birleşmesiyle Ergene yeni bir ilçe oldu. Çerkezköy'e bağlı bir belde olan Kapaklı müstakil bir ilçeye dönüştürüldü. Diğer 8 ilçe (Çorlu, Çerkezköy, Malkara, Şarköy, Hayrabolu, Saray, Muratlı ve Marmaraereğlisi) ile birlikte güncel ilçe sayısı 11 olarak sabitlendi.",
            komsuIlceler: {
                "Süleymanpaşa": ["Muratlı", "Çorlu", "Marmaraereğlisi", "Hayrabolu", "Malkara", "Şarköy"],
                "Çorlu": ["Süleymanpaşa", "Marmaraereğlisi", "Ergene", "Çerkezköy", "Muratlı"],
                "Ergene": ["Çorlu", "Muratlı", "Çerkezköy", "Kapaklı", "Saray"],
                "Çerkezköy": ["Kapaklı", "Çorlu", "Ergene"],
                "Kapaklı": ["Çerkezköy", "Saray", "Ergene"],
                "Saray": ["Kapaklı", "Ergene"],
                "Muratlı": ["Süleymanpaşa", "Çorlu", "Ergene", "Hayrabolu"],
                "Marmaraereğlisi": ["Süleymanpaşa", "Çorlu"],
                "Hayrabolu": ["Süleymanpaşa", "Muratlı", "Malkara"],
                "Malkara": ["Süleymanpaşa", "Hayrabolu", "Şarköy"],
                "Şarköy": ["Süleymanpaşa", "Malkara"]
            },
            ilSinirKapilari: {
                "Marmaraereğlisi": [{ komsuIl: "İstanbul", ilceAks: "Silivri / Gümüşyaka", yol: "D-110 / E84", mesafeKm: 15 }],
                "Çerkezköy": [{ komsuIl: "İstanbul", ilceAks: "Silivri / Çatalca", yol: "D-567 / O-3", mesafeKm: 25 }],
                "Kapaklı": [{ komsuIl: "İstanbul", ilceAks: "Çatalca", yol: "D-020", mesafeKm: 30 }],
                "Muratlı": [{ komsuIl: "Kırklareli", ilceAks: "Lüleburgaz / Büyükkarıştıran", yol: "D-565", mesafeKm: 22 }],
                "Saray": [{ komsuIl: "Kırklareli", ilceAks: "Vize / Kıyıköy", yol: "D-020", mesafeKm: 20 }],
                "Hayrabolu": [{ komsuIl: "Edirne", ilceAks: "Uzunköprü", yol: "D-555", mesafeKm: 42 }],
                "Malkara": [{ komsuIl: "Edirne", ilceAks: "Keşan / İpsala", yol: "D-110 / E84", mesafeKm: 28 }],
                "Şarköy": [{ komsuIl: "Çanakkale", ilceAks: "Gelibolu / Evreşe", yol: "D-120", mesafeKm: 35 }]
            },
            ilSinirKapilari: {
                "Marmaraereğlisi": [{ komsuIl: "İstanbul", ilceAks: "Silivri / Gümüşyaka", yol: "D-110 / E84", mesafeKm: 15 }],
                "Çerkezköy": [{ komsuIl: "İstanbul", ilceAks: "Silivri / Çatalca", yol: "D-567 / O-3", mesafeKm: 25 }],
                "Kapaklı": [{ komsuIl: "İstanbul", ilceAks: "Çatalca", yol: "D-020", mesafeKm: 30 }],
                "Muratlı": [{ komsuIl: "Kırklareli", ilceAks: "Lüleburgaz / Büyükkarıştıran", yol: "D-565", mesafeKm: 22 }],
                "Saray": [{ komsuIl: "Kırklareli", ilceAks: "Vize / Kıyıköy", yol: "D-020", mesafeKm: 20 }],
                "Hayrabolu": [{ komsuIl: "Edirne", ilceAks: "Uzunköprü", yol: "D-555", mesafeKm: 42 }],
                "Malkara": [{ komsuIl: "Edirne", ilceAks: "Keşan / İpsala", yol: "D-110 / E84", mesafeKm: 28 }],
                "Şarköy": [{ komsuIl: "Çanakkale", ilceAks: "Gelibolu / Evreşe", yol: "D-120", mesafeKm: 35 }]
            },
            liste: [
                { id: "Süleymanpaşa", ad: "Süleymanpaşa", rol: "İl Merkezi (Eski Merkez İlçe)", lat: 40.9833, lon: 27.5167, merkezeMesafeKm: 0, aciklama: "Eski merkez ilçe Süleymanpaşa adını aldı." },
                { id: "Muratlı", ad: "Muratlı", rol: "Demiryolu & Sanayi", lat: 41.1717, lon: 27.5028, merkezeMesafeKm: 24, aciklama: "Tren Garı aksı ve merkez hatları." },
                { id: "Çorlu", ad: "Çorlu", rol: "Sanayi & Ticaret Metropolü", lat: 41.1592, lon: 27.8000, merkezeMesafeKm: 36, aciklama: "Büyük sanayi metropolü ve en kalabalık ilçe." },
                { id: "Marmaraereğlisi", ad: "Marmaraereğlisi", rol: "Sahil, Liman & Turizm", lat: 40.9686, lon: 27.9553, merkezeMesafeKm: 38, aciklama: "Perinthos antik kenti, Yeniçiftlik ve sahil hatları." },
                { id: "Ergene", ad: "Ergene", rol: "Müstakil İlçe (Marmaracık & Velimeşe)", lat: 41.2281, lon: 27.7028, merkezeMesafeKm: 45, aciklama: "Çorlu'ya bağlı beldelerin birleşmesiyle Ergene yeni bir ilçe oldu." },
                { id: "Hayrabolu", ad: "Hayrabolu", rol: "Trakya Tarım & Ayçiçeği", lat: 41.2153, lon: 27.1111, merkezeMesafeKm: 52, aciklama: "Ayçiçeği tarlaları ve ova çarşı hatları." },
                { id: "Malkara", ad: "Malkara", rol: "Tarım & Hayvancılık Merkezi", lat: 40.8900, lon: 26.9011, merkezeMesafeKm: 58, aciklama: "Geniş ova, tepe mahalleler ve köy hatları." },
                { id: "Çerkezköy", ad: "Çerkezköy", rol: "Sanayi & OSB Merkezi", lat: 41.2858, lon: 28.0019, merkezeMesafeKm: 62, aciklama: "Yoğun sanayi ve fabrika merkezleri." },
                { id: "Kapaklı", ad: "Kapaklı", rol: "Müstakil İlçe (Yıldızkent)", lat: 41.3125, lon: 27.9786, merkezeMesafeKm: 67, aciklama: "Çerkezköy'e bağlı bir belde olan Kapaklı müstakil bir ilçeye dönüştürüldü." },
                { id: "Saray", ad: "Saray", rol: "Kuzey Trakya Orman Hattı", lat: 41.4439, lon: 27.9219, merkezeMesafeKm: 78, aciklama: "Istranca etekleri ve orman hatları." },
                { id: "Şarköy", ad: "Şarköy", rol: "Marmara Sahil & Bağcılık", lat: 40.6139, lon: 27.1128, merkezeMesafeKm: 84, aciklama: "Marmara denizi kıyısı ve bağ hatları." }
            ],
            // 11x11 Birebir Gerçek Karayolu Kilometre Matrisi (KGM Resmi Karayolu Mesafeleri)
            mesafeMatrisiKm: {
                "Süleymanpaşa":   { "Süleymanpaşa": 0,  "Muratlı": 24, "Çorlu": 36, "Marmaraereğlisi": 38, "Ergene": 45, "Hayrabolu": 52, "Malkara": 58, "Çerkezköy": 62, "Kapaklı": 67, "Saray": 78, "Şarköy": 84 },
                "Muratlı":        { "Süleymanpaşa": 24, "Muratlı": 0,  "Çorlu": 24, "Marmaraereğlisi": 46, "Ergene": 18, "Hayrabolu": 44, "Malkara": 70, "Çerkezköy": 48, "Kapaklı": 53, "Saray": 68, "Şarköy": 98 },
                "Çorlu":          { "Süleymanpaşa": 36, "Muratlı": 24, "Çorlu": 0,  "Marmaraereğlisi": 22, "Ergene": 9,  "Hayrabolu": 64, "Malkara": 82, "Çerkezköy": 26, "Kapaklı": 31, "Saray": 46, "Şarköy": 110 },
                "Marmaraereğlisi":{ "Süleymanpaşa": 38, "Muratlı": 46, "Çorlu": 22, "Marmaraereğlisi": 0,  "Ergene": 31, "Hayrabolu": 90, "Malkara": 96, "Çerkezköy": 48, "Kapaklı": 53, "Saray": 68, "Şarköy": 122 },
                "Ergene":         { "Süleymanpaşa": 45, "Muratlı": 18, "Çorlu": 9,  "Marmaraereğlisi": 31, "Ergene": 0,  "Hayrabolu": 58, "Malkara": 91, "Çerkezköy": 23, "Kapaklı": 28, "Saray": 43, "Şarköy": 119 },
                "Hayrabolu":      { "Süleymanpaşa": 52, "Muratlı": 44, "Çorlu": 64, "Marmaraereğlisi": 90, "Ergene": 58, "Hayrabolu": 0,  "Malkara": 46, "Çerkezköy": 88, "Kapaklı": 93, "Saray": 85, "Şarköy": 95 },
                "Malkara":        { "Süleymanpaşa": 58, "Muratlı": 70, "Çorlu": 82, "Marmaraereğlisi": 96, "Ergene": 91, "Hayrabolu": 46, "Malkara": 0,  "Çerkezköy": 108,"Kapaklı": 113,"Saray": 128,"Şarköy": 48 },
                "Çerkezköy":      { "Süleymanpaşa": 62, "Muratlı": 48, "Çorlu": 26, "Marmaraereğlisi": 48, "Ergene": 23, "Hayrabolu": 88, "Malkara": 108,"Çerkezköy": 0,  "Kapaklı": 5,  "Saray": 20, "Şarköy": 136 },
                "Kapaklı":        { "Süleymanpaşa": 67, "Muratlı": 53, "Çorlu": 31, "Marmaraereğlisi": 53, "Ergene": 28, "Hayrabolu": 93, "Malkara": 113,"Çerkezköy": 5,   "Kapaklı": 0,  "Saray": 15, "Şarköy": 141 },
                "Saray":          { "Süleymanpaşa": 78, "Muratlı": 68, "Çorlu": 46, "Marmaraereğlisi": 68, "Ergene": 43, "Hayrabolu": 85, "Malkara": 128,"Çerkezköy": 20, "Kapaklı": 15, "Saray": 0,  "Şarköy": 152 },
                "Şarköy":         { "Süleymanpaşa": 84, "Muratlı": 98, "Çorlu": 110,"Marmaraereğlisi": 122,"Ergene": 119,"Hayrabolu": 95, "Malkara": 48, "Çerkezköy": 136,"Kapaklı": 141,"Saray": 152,"Şarköy": 0 }
            },
            hesaplaIlceMesafe: function(ilce1, ilce2) {
                if (!ilce1 || !ilce2) return 0;
                if (ilce1 === ilce2) return 0;
                const normalize = function(s) {
                    return String(s)
                        .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
                        .toLowerCase()
                        .replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
                        .trim();
                };
                const n1 = normalize(ilce1);
                const n2 = normalize(ilce2);
                // TRAKYA ÇEVRE KUŞAĞI: İSTANBUL, EDİRNE, KIRKLARELİ, ÇANAKKALE VE SINIR İLÇELERİ
                const trakyaLookup = {
                    "denizli": { "suleymanpasa": 670, "tekirdag": 670, "merkez": 670, "corlu": 635, "cerkezkoy": 625, "ergene": 645, "marmaraereglisi": 630, "istanbul": 560, "ankara": 480, "aydin": 125, "mugla": 145, "afyon": 220, "afyonkarahisar": 220, "usak": 150, "burdur": 150, "antalya": 220, "izmir": 225, "_def": 670 },
                    "antalya": { "suleymanpasa": 830, "tekirdag": 830, "merkez": 830, "corlu": 795, "cerkezkoy": 785, "ergene": 805, "marmaraereglisi": 790, "istanbul": 700, "ankara": 480, "burdur": 122, "isparta": 130, "mugla": 310, "konya": 305, "afyon": 290, "afyonkarahisar": 290, "_def": 830 },
                    "ankara": { "suleymanpasa": 585, "tekirdag": 585, "merkez": 585, "corlu": 550, "cerkezkoy": 540, "ergene": 560, "marmaraereglisi": 545, "istanbul": 450, "eskisehir": 235, "konya": 260, "bolu": 190, "kirikkale": 75, "afyon": 260, "afyonkarahisar": 260, "amasya": 335, "adana": 490, "agri": 1060, "_def": 585 },
                    "amasya": { "suleymanpasa": 810, "tekirdag": 810, "merkez": 810, "corlu": 775, "cerkezkoy": 765, "ergene": 785, "marmaraereglisi": 770, "istanbul": 680, "ankara": 335, "samsun": 130, "tokat": 115, "corum": 92, "yozgat": 200, "_def": 810 },
                    "agri": { "suleymanpasa": 1510, "tekirdag": 1510, "merkez": 1510, "corlu": 1475, "cerkezkoy": 1465, "ergene": 1485, "marmaraereglisi": 1470, "istanbul": 1380, "ankara": 1060, "erzurum": 180, "van": 230, "kars": 140, "igdir": 140, "mus": 165, "_def": 1510 },
                    "afyonkarahisar": { "suleymanpasa": 540, "tekirdag": 540, "merkez": 540, "corlu": 505, "cerkezkoy": 495, "ergene": 515, "marmaraereglisi": 500, "istanbul": 410, "ankara": 260, "eskisehir": 130, "kutahya": 100, "konya": 225, "antalya": 290, "izmir": 330, "_def": 540 },
                    "afyon": { "suleymanpasa": 540, "tekirdag": 540, "merkez": 540, "corlu": 505, "cerkezkoy": 495, "ergene": 515, "marmaraereglisi": 500, "istanbul": 410, "ankara": 260, "eskisehir": 130, "kutahya": 100, "konya": 225, "antalya": 290, "izmir": 330, "_def": 540 },
                    "adiyaman": { "suleymanpasa": 1250, "tekirdag": 1250, "merkez": 1250, "corlu": 1215, "cerkezkoy": 1205, "ergene": 1225, "marmaraereglisi": 1210, "istanbul": 1130, "ankara": 690, "adana": 340, "gaziantep": 150, "_def": 1250 },
                    "adana": { "suleymanpasa": 1050, "tekirdag": 1050, "merkez": 1050, "corlu": 1015, "cerkezkoy": 1005, "ergene": 1025, "marmaraereglisi": 1010, "istanbul": 930, "ankara": 490, "_def": 1050 },
                    "istanbul": { "marmaraereglisi": 90, "cerkezkoy": 95, "kapakli": 100, "corlu": 105, "ergene": 110, "saray": 125, "muratli": 130, "suleymanpasa": 135, "tekirdag": 135, "merkez": 135, "hayrabolu": 180, "malkara": 190, "sarkoy": 215, "silivri": 65, "catalca": 70, "_def": 135 },
                    "edirne": { "malkara": 110, "hayrabolu": 95, "muratli": 130, "suleymanpasa": 140, "tekirdag": 140, "merkez": 140, "ergene": 145, "corlu": 155, "sarkoy": 155, "saray": 160, "cerkezkoy": 175, "kapakli": 180, "marmaraereglisi": 175, "kesan": 110, "uzunkopru": 65, "_def": 140 },
                    "kirklareli": { "hayrabolu": 75, "saray": 75, "muratli": 85, "ergene": 100, "kapakli": 110, "corlu": 110, "cerkezkoy": 115, "suleymanpasa": 115, "tekirdag": 115, "merkez": 115, "malkara": 135, "marmaraereglisi": 135, "sarkoy": 185, "luleburgaz": 60, "babaeski": 35, "vize": 55, "_def": 115 },
                    "canakkale": { "sarkoy": 90, "malkara": 120, "1915 koprusu": 135, "1915 canakkale": 135, "gelibolu": 130, "hayrabolu": 165, "suleymanpasa": 170, "tekirdag": 170, "merkez": 170, "muratli": 195, "corlu": 205, "ergene": 210, "marmaraereglisi": 210, "cerkezkoy": 230, "kapakli": 235, "saray": 245, "_def": 170 },
                    // Doğrudan sınır kasabaları
                    "kesan": { "malkara": 26, "suleymanpasa": 84, "tekirdag": 84, "sarkoy": 60, "hayrabolu": 75, "corlu": 115, "edirne": 110, "gelibolu": 65, "_def": 84 },
                    "uzunkopru": { "hayrabolu": 38, "malkara": 65, "muratli": 72, "suleymanpasa": 90, "tekirdag": 90, "edirne": 65, "_def": 90 },
                    "luleburgaz": { "muratli": 32, "ergene": 42, "corlu": 48, "suleymanpasa": 56, "tekirdag": 56, "hayrabolu": 52, "saray": 45, "cerkezkoy": 68, "kirklareli": 60, "_def": 56 },
                    "babaeski": { "hayrabolu": 28, "muratli": 60, "suleymanpasa": 80, "tekirdag": 80, "corlu": 75, "kirklareli": 35, "edirne": 55, "_def": 80 },
                    "vize": { "saray": 22, "kapakli": 37, "cerkezkoy": 42, "ergene": 65, "corlu": 68, "suleymanpasa": 100, "tekirdag": 100, "kirklareli": 55, "_def": 100 },
                    "gelibolu": { "sarkoy": 45, "malkara": 75, "kesan": 65, "suleymanpasa": 130, "tekirdag": 130, "canakkale": 45, "_def": 130 },
                    "silivri": { "marmaraereglisi": 25, "corlu": 35, "ergene": 45, "cerkezkoy": 40, "suleymanpasa": 65, "tekirdag": 65, "istanbul": 65, "_def": 65 },
                    "catalca": { "cerkezkoy": 45, "saray": 60, "kapakli": 50, "corlu": 65, "suleymanpasa": 95, "tekirdag": 95, "istanbul": 55, "_def": 95 }
                };

                for (let prov in trakyaLookup) {
                    if (n1 === prov || n2 === prov || n1.includes(prov) || n2.includes(prov)) {
                        const targetCity = (n1 === prov || n1.includes(prov)) ? n2 : n1;
                        const subMap = trakyaLookup[prov];
                        for (let k in subMap) {
                            if (k !== "_def" && (targetCity.includes(k) || k.includes(targetCity))) {
                                return subMap[k];
                            }
                        }
                        return subMap["_def"] || 100;
                    }
                }
                const keys = Object.keys(this.mesafeMatrisiKm);
                const k1 = keys.find(function(k) { return normalize(k) === n1 || n1.includes(normalize(k)); });
                const k2 = keys.find(function(k) { return normalize(k) === n2 || n2.includes(normalize(k)); });
                if (k1 && k2 && this.mesafeMatrisiKm[k1] && this.mesafeMatrisiKm[k1][k2] !== undefined) {
                    return this.mesafeMatrisiKm[k1][k2];
                }
                return null;
            }
        },
        iklimNormalleri: {
            rekorEnYuksekSicaklik: 40.2,
            ortalamaEnYuksekSicaklik: 17.9,
            yillikOrtalamaSicaklik: 14.0,
            ortalamaEnDusukSicaklik: 10.3,
            rekorEnDusukSicaklik: -13.3,
            yillikToplamYagisMm: 589.1,
            yagisNormlari: {
                dusukMm: 14.0,
                ortaMm: 36.3,
                kuvvetliMm: 81.2
            },
            karakteristikDegerler: {
                sicakDonemEnYuksek: 28.1,
                sicakDonemEnDusuk: 19.3,
                sogukDonemEnYuksek: 8.2,
                sogukDonemEnDusuk: 2.1
            }
        },
        komsular: {
            bati: "Edirne",
            kuzey: "Kırklareli",
            dogu: "İstanbul",
            guney: "Çanakkale"
        },
        komsuIller: ["Edirne", "Kırklareli", "İstanbul", "Çanakkale"],
        terrain: "sahil",
        ucretler: { tam: 33, ogrenci: 17, yasli: 0 }
    },
    "Edirne": {
        plaka: "22",
        bolge: "Marmara",
        merkezeMesafeKm: 140,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-22"]->.edirne; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.edirne)(area.merkez); node["traffic_calming"~"bump|hump"](area.edirne)(area.merkez););`,
        coordinates: {
            dms: "41°40′N 26°33′E",
            enlemDms: "41°40′K",
            boylamDms: "26°33′D",
            lat: 41.6772,
            lon: 26.5558,
            rakimMetre: 42,
            merkezeMesafeKm: 140,
            konumAciklamasi: "Türkiye'nin Avrupa sınır kapısı, Osmanlı'nın kadim başkenti. Doğusunda Tekirdağ yer alır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 140, "Muratlı": 130, "Çorlu": 155, "Hayrabolu": 95,
            "Malkara": 110, "Ergene": 145, "Çerkezköy": 175, "Kapaklı": 180,
            "Saray": 160, "Marmaraereğlisi": 175, "Şarköy": 155,
            "Keşan-Malkara": 26, "Uzunköprü-Hayrabolu": 38
        },
        sinirKomsulari: {
            "Keşan": { ilce: "Keşan", komsuIlce: "Malkara", mesafeKm: 26, yol: "D-110 / E-84" },
            "Uzunköprü": { ilce: "Uzunköprü", komsuIlce: "Hayrabolu", mesafeKm: 38, yol: "D-555" },
            "Havsa": { ilce: "Havsa", komsuIlce: "Muratlı / Hayrabolu", mesafeKm: 115, yol: "D-100" }
        },
        komsular: {
            dogu: "Tekirdağ",
            kuzey: "Kırklareli",
            guney: "Çanakkale"
        },
        komsuIller: ["Kırklareli", "Tekirdağ", "Çanakkale"],
        fizikiSinirKomsulari: ["Kırklareli", "Tekirdağ", "Çanakkale"],
        terrain: "asfalt",
        ucretler: { tam: 32, ogrenci: 21.5, yasli: 0 }
    },
    "Kırklareli": {
        plaka: "39",
        bolge: "Marmara",
        merkezeMesafeKm: 115,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-39"]->.kirklareli; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.kirklareli)(area.merkez); node["traffic_calming"~"bump|hump"](area.kirklareli)(area.merkez););`,
        coordinates: {
            dms: "41°44′N 27°13′E",
            enlemDms: "41°44′K",
            boylamDms: "27°13′D",
            lat: 41.7350,
            lon: 27.2250,
            rakimMetre: 203,
            merkezeMesafeKm: 115,
            konumAciklamasi: "Kuzey Trakya'da Istranca etekleri. Güneyinde Tekirdağ yer alır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 115, "Muratlı": 85, "Hayrabolu": 75, "Çorlu": 110,
            "Ergene": 100, "Saray": 75, "Çerkezköy": 115, "Kapaklı": 110,
            "Malkara": 135, "Marmaraereğlisi": 135, "Şarköy": 185,
            "Lüleburgaz-Muratlı": 32, "Lüleburgaz-Çorlu": 48, "Vize-Saray": 22, "Babaeski-Hayrabolu": 28
        },
        sinirKomsulari: {
            "Lüleburgaz": { ilce: "Lüleburgaz", komsuIlce: "Muratlı / Çorlu / Ergene", mesafeKmMuratli: 32, mesafeKmCorlu: 48, yol: "D-565 / D-100" },
            "Babaeski": { ilce: "Babaeski", komsuIlce: "Hayrabolu", mesafeKm: 28, yol: "D-555" },
            "Vize": { ilce: "Vize", komsuIlce: "Saray", mesafeKm: 22, yol: "D-020" }
        },
        komsular: {
            guney: "Tekirdağ",
            bati: "Edirne",
            dogu: "İstanbul"
        },
        komsuIller: ["Edirne", "Tekirdağ", "İstanbul"],
        fizikiSinirKomsulari: ["Edirne", "Tekirdağ", "İstanbul"],
        terrain: "toprak",
        ucretler: { tam: 25, ogrenci: 12.5, yasli: 0 }
    },
    "İstanbul": {
        plaka: "34",
        bolge: "Marmara",
        merkezeMesafeKm: 135,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-34"]->.istanbul; area["name"="Kadıköy"]->.ilce; (node["highway"="bus_stop"](area.istanbul)(area.ilce); node["traffic_calming"~"bump|hump"](area.istanbul)(area.ilce););`,
        coordinates: {
            dms: "41°00′N 28°58′E",
            enlemDms: "41°00′K",
            boylamDms: "28°58′D",
            lat: 41.0082,
            lon: 28.9784,
            rakimMetre: 40,
            merkezeMesafeKm: 135,
            konumAciklamasi: "Marmara Bölgesi'nde, Asya ve Avrupa kıtalarını birbirine bağlayan dünya metropolü. Batısında Tekirdağ ili yer alır."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 135,
            "Marmaraereğlisi": 90,
            "Çerkezköy": 95,
            "Kapaklı": 100,
            "Çorlu": 105,
            "Ergene": 110,
            "Saray": 125,
            "Muratlı": 130,
            "Hayrabolu": 180,
            "Malkara": 190,
            "Şarköy": 215
        },
        komsular: {
            bati: "Tekirdağ (Silivri - Çorlu / Marmaraereğlisi Koridoru)",
            kuzeybati: "Kırklareli (Çatalca - Vize / Saray Aksı)",
            kuzey: "Karadeniz Sahili (Karaburun - Kilyos - Şile)",
            dogu: "Kocaeli (Tuzla - Pendik - Gebze / Çayırova Sanayi Aksı)",
            guney: "Marmara Denizi ve Adalar"
        },
        komsuIller: ["Tekirdağ", "Kırklareli", "Kocaeli"],
        fizikiSinirKomsulari: ["Tekirdağ", "Kırklareli", "Kocaeli"],
        sinirKomsulari: {
            "Silivri - Marmaraereğlisi": { ilce: "Silivri", komsuIl: "Tekirdağ (Marmaraereğlisi / Çorlu)", mesafeKm: 35, yol: "D-110 / E84" },
            "Silivri - Çerkezköy": { ilce: "Silivri (Değirmenköy)", komsuIl: "Tekirdağ (Çerkezköy / Kapaklı)", mesafeKm: 28, yol: "D-567 / O-3" },
            "Çatalca - Vize": { ilce: "Çatalca (Binkılıç)", komsuIl: "Kırklareli (Vize / Kıyıköy) / Tekirdağ (Saray)", mesafeKm: 38, yol: "D-020" },
            "Tuzla - Gebze": { ilce: "Tuzla / Pendik", komsuIl: "Kocaeli (Gebze / Çayırova / Darıca)", mesafeKm: 18, yol: "D-100 / O-4 (TEM)" },
            "Şile - Kandıra": { ilce: "Şile (Ağva)", komsuIl: "Kocaeli (Kandıra Sahil Aksı)", mesafeKm: 45, yol: "D-020" }
        },
        terrain: "sahil",
        ucretler: { tam: 42, ogrenci: 20.5, yasli: 0 }
    },
    "Çanakkale": {
        plaka: "17",
        bolge: "Marmara",
        merkezeMesafeKm: 170,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-17"]->.canakkale; area["name"="Merkez"]->.merkez; (node["highway"="bus_stop"](area.canakkale)(area.merkez); node["traffic_calming"~"bump|hump"](area.canakkale)(area.merkez););`,
        coordinates: {
            dms: "40°09′N 26°24′E",
            enlemDms: "40°09′K",
            boylamDms: "26°24′D",
            lat: 40.1456,
            lon: 26.4086,
            rakimMetre: 6,
            merkezeMesafeKm: 170,
            konumAciklamasi: "Marmara Bölgesi'nin güneybatısında, Çanakkale Boğazı'nın iki yakasında (Gelibolu Yarımadası ve Biga Yarımadası) Asya ile Avrupa kıtalarını birbirine bağlayan tarihi ve stratejik liman kenti. 1915 Çanakkale Köprüsü, Çanakkale Savaşları Tarihi Alanı, Truva (Troy) ve Assos antik kentleri ile ünlüdür."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 170, "Şarköy": 90, "Malkara": 120, "Hayrabolu": 165,
            "Çorlu": 205, "Muratlı": 195, "Ergene": 210, "Marmaraereğlisi": 210,
            "Çerkezköy": 230, "Kapaklı": 235, "Saray": 245,
            "Gelibolu-Şarköy": 45, "Gelibolu-Malkara": 75, "1915Koprusu-Süleymanpaşa": 145,
            "Edirne": 210, "Balıkesir": 195, "Kırklareli": 240, "İstanbul": 310, "Bursa": 270, "İzmir": 320
        },
        sinirKomsulari: {
            "Gelibolu": { ilce: "Gelibolu", komsuIl: "Tekirdağ (Şarköy / Malkara)", mesafeKmSarkoy: 45, mesafeKmMalkara: 75, yol: "D-555 / D-110" },
            "Evreşe - Keşan": { ilce: "Gelibolu (Evreşe)", komsuIl: "Edirne (Keşan)", mesafeKm: 35, yol: "D-550 / D-110" },
            "1915 Çanakkale Köprüsü": { ilce: "Gelibolu - Lapseki", komsuIl: "Boğaz Geçişi & O-6 Otoyolu", mesafeKm: 145, yol: "O-6 Kınalı-Balıkesir Otoyolu" },
            "Biga": { ilce: "Biga", komsuIl: "Balıkesir (Gönen / Bandırma)", mesafeKm: 90, yol: "D-200" },
            "Yenice": { ilce: "Yenice", komsuIl: "Balıkesir (Balya / Merkez)", mesafeKm: 85, yol: "D-555" },
            "Ayvacık (Küçükkuyu)": { ilce: "Ayvacık", komsuIl: "Balıkesir (Edremit / Altınoluk)", mesafeKm: 95, yol: "D-550 / E87" },
            "Eceabat": { ilce: "Eceabat", komsuIlce: "Gelibolu / Boğaz", mesafeKm: 160, yol: "D-550" }
        },
        komsular: {
            kuzey: "Tekirdağ",
            kuzeybati: "Edirne",
            dogu: "Balıkesir",
            guney: "Balıkesir",
            bati: "Ege Denizi / Çanakkale Boğazı"
        },
        komsuIller: ["Tekirdağ", "Edirne", "Balıkesir"],
        terrain: "sahil",
        ucretler: { tam: 30, ogrenci: 19, yasli: 0 }
    },
    "Hakkâri": {
        plaka: "30",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1850,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-30"]->.hakkari; (node["highway"="bus_stop"](area.hakkari););`,
        coordinates: {
            dms: "37°34′N 43°44′E",
            enlemDms: "37°34′K",
            boylamDms: "43°44′D",
            lat: 37.5744,
            lon: 43.7408,
            rakimMetre: 1720,
            merkezeMesafeKm: 1850,
            konumAciklamasi: "Türkiye'nin en güneydoğu ucunda, sarp Cilo Dağları, Türkiye'nin en yüksek buzul zirveleri ve derin Zap Vadisi boyunca uzanan dağlık serhat kenti. Cilo Buzul Gölleri, Sümbül Dağı, Merga Bütan Kayak Merkezi, Şemdinli Taş Köprüsü, Kayme Sarayı ve eşsiz ters laleleriyle bilinen Doğu Anadolu'nun zirvesi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1850, "Çorlu": 1815, "Çerkezköy": 1800,
            "Ergene": 1820, "Marmaraereğlisi": 1835, "İstanbul": 1720, "Ankara": 1320,
            "Van": 200, "Şırnak": 190, "Bitlis": 330, "Siirt": 280, "Diyarbakır": 450,
            "Yüksekova": 75, "Çukurca": 75, "Şemdinli": 125, "Derecik": 165
        },
        komsular: {
            kuzey: "Van (Başkale / Güzeldere Geçidi 2730m)",
            dogu: "İran Sınırı (Esendere Sınır Kapısı / Urmiye Aksı)",
            guney: "Irak Sınırı (Derecik / Üzümlü Sınır Kapısı)",
            bati: "Şırnak (Uludere - Beytüşşebap / Habur Vadisi)"
        },
        komsuIller: ["Van", "Şırnak"],
        fizikiSinirKomsulari: ["Van", "Şırnak"],
        sinirKomsulari: {
            "Yüksekova - Başkale": { ilce: "Yüksekova", komsuIl: "Van (Başkale / Güzeldere Geçidi 2730m)", mesafeKm: 80, yol: "D-975" },
            "Çukurca - Uludere": { ilce: "Çukurca", komsuIl: "Şırnak (Uludere / Ortaköy Geçişi)", mesafeKm: 70, yol: "D-400" },
            "Yüksekova - Esendere": { ilce: "Yüksekova", komsuIl: "İran Sınırı (Esendere Gümrük Kapısı)", mesafeKm: 42, yol: "D-400" }
        },
        terrain: "daglik",
        ucretler: { tam: 55, ogrenci: 30, yasli: 0 }
    },
    "Hatay": {
        plaka: "31",
        bolge: "Akdeniz",
        merkezeMesafeKm: 1180,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-31"]->.hatay; (node["highway"="bus_stop"](area.hatay););`,
        coordinates: {
            dms: "36°12′N 36°09′E",
            enlemDms: "36°12′K",
            boylamDms: "36°09′D",
            lat: 36.2023,
            lon: 36.1606,
            rakimMetre: 85,
            merkezeMesafeKm: 1180,
            konumAciklamasi: "Akdeniz'in doğu ucunda, bereketli Amik Ovası ve Asi Nehri havzasında yer alan kadim medeniyetler, hoşgörü ve UNESCO tescilli dünya gastronomi kenti. Habib-i Neccar Camii, St. Pierre Kilisesi, Tarihi Antakya Evleri, Uzun Çarşı, Roma dönemi Titus Tüneli ve Beşikli Mağara, Harbiye Şelaleleri, İskenderun Körfezi, çıtır künefesi, kağıt kebabı ve çok kültürlü zenginliğiyle bilinen barış kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1180, "Çorlu": 1145, "Çerkezköy": 1130,
            "Ergene": 1150, "Marmaraereğlisi": 1165, "İstanbul": 1050, "Ankara": 640,
            "Adana": 190, "Osmaniye": 130, "Gaziantep": 190, "Kilis": 120, "Mersin": 255, "Kahramanmaraş": 185,
            "Antakya": 3, "İskenderun": 60, "Dörtyol": 90, "Samandağ": 25, "Kırıkhan": 40, "Reyhanlı": 42, "Belen": 45, "Arsuz": 85
        },
        komsular: {
            kuzey: "Osmaniye (Erzin - Toprakkale) / Adana (Ceyhan - Yumurtalık Sahili)",
            dogu: "Gaziantep (İslahiye - Hassa) / Kilis / Suriye Sınırı",
            guney: "Suriye Sınırı (Yayladağı - Keseb Sınır Kapısı)",
            bati: "Akdeniz (İskenderun Körfezi - Samandağ Sahili)"
        },
        komsuIller: ["Adana", "Osmaniye", "Gaziantep", "Kilis"],
        fizikiSinirKomsulari: ["Adana", "Osmaniye", "Gaziantep", "Kilis"],
        sinirKomsulari: {
            "Erzin - Toprakkale": { ilce: "Erzin", komsuIl: "Osmaniye (Toprakkale / Osmaniye Merkez)", mesafeKm: 25, yol: "O-53 / D-817" },
            "Dörtyol - Ceyhan": { ilce: "Dörtyol", komsuIl: "Adana (Ceyhan / Yumurtalık Aksı)", mesafeKm: 55, yol: "D-817 / O-53" },
            "Hassa - İslahiye": { ilce: "Hassa", komsuIl: "Gaziantep (İslahiye / Fevzipaşa)", mesafeKm: 35, yol: "D-825" },
            "Yayladağı - Sınır": { ilce: "Yayladağı", komsuIl: "Suriye Sınır Kapısı (Keseb)", mesafeKm: 55, yol: "D-825" }
        },
        terrain: "asfalt",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Isparta": {
        plaka: "32",
        bolge: "Akdeniz",
        merkezeMesafeKm: 690,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-32"]->.isparta; (node["highway"="bus_stop"](area.isparta););`,
        coordinates: {
            dms: "37°46′N 30°33′E",
            enlemDms: "37°46′K",
            boylamDms: "30°33′D",
            lat: 37.7648,
            lon: 30.5566,
            rakimMetre: 1035,
            merkezeMesafeKm: 690,
            konumAciklamasi: "Batı Akdeniz'in iç kesiminde, Göller Yöresi'nin kalbinde yer alan güller, lavantalar ve göller diyarı. Türkiye'nin ikinci büyük tatlı su gölü Eğirdir Gölü, Kovada Gölü Milli Parkı, Kuyucak Lavanta Köyü, Davraz Dağı Kayak Merkezi, Pisidia Antiokheia Antik Kenti, dünyaca ünlü gül yağı ve gül ürünleri, fırın kebabı ve el dokuma Isparta halılarıyla tanınan huzur kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 690, "Çorlu": 655, "Çerkezköy": 640,
            "Ergene": 660, "Marmaraereğlisi": 675, "İstanbul": 560, "Ankara": 390,
            "Antalya": 130, "Burdur": 30, "Afyonkarahisar": 165, "Konya": 240, "Denizli": 170, "Eskişehir": 290,
            "Eğirdir": 35, "Yalvaç": 105, "Keçiborlu": 40, "Şarkikaraağaç": 120, "Senirkent": 75, "Gelendost": 80
        },
        komsular: {
            kuzey: "Afyonkarahisar (Dinar - Dazkırı - Çay)",
            dogu: "Konya (Beyşehir - Akşehir - Doğanhisar)",
            guney: "Antalya (Manavgat - Serik / Toros Geçişi)",
            bati: "Burdur (Merkez - Ağlasun - Gölhisar)"
        },
        komsuIller: ["Burdur", "Antalya", "Konya", "Afyonkarahisar"],
        fizikiSinirKomsulari: ["Burdur", "Antalya", "Konya", "Afyonkarahisar"],
        sinirKomsulari: {
            "Merkez - Burdur": { ilce: "Merkez", komsuIl: "Burdur (Merkez / Dostluk Yolu)", mesafeKm: 30, yol: "D-685" },
            "Keçiborlu - Dinar": { ilce: "Keçiborlu", komsuIl: "Afyonkarahisar (Dinar / Sandıklı Kavşağı)", mesafeKm: 35, yol: "D-650" },
            "Şarkikaraağaç - Beyşehir": { ilce: "Şarkikaraağaç", komsuIl: "Konya (Beyşehir Gölü / D-695)", mesafeKm: 45, yol: "D-695" },
            "Sütçüler - Manavgat": { ilce: "Sütçüler", komsuIl: "Antalya (Serik / Manavgat / Köprülü Kanyon)", mesafeKm: 85, yol: "32-26 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },
    "Mersin": {
        plaka: "33",
        bolge: "Akdeniz",
        merkezeMesafeKm: 1010,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-33"]->.mersin; (node["highway"="bus_stop"](area.mersin););`,
        coordinates: {
            dms: "36°48′N 34°38′E",
            enlemDms: "36°48′K",
            boylamDms: "34°38′D",
            lat: 36.8121,
            lon: 34.6415,
            rakimMetre: 10,
            merkezeMesafeKm: 1010,
            konumAciklamasi: "Doğu Akdeniz çanağında, kilometrelerce uzanan palmiyeli sahil kordonu ve Toros Dağları arasında kurulu devasa liman ve ticaret metropolü. Türkiye'nin en büyük konteyner limanlarından Mersin Limanı, Kızkalesi (Deniz Kalesi), Cennet-Cehennem Obrukları, Eshab-ı Kehf Mağarası, Tarsus Şelalesi, Kleopatra Kapısı, Taşucu Limanı, meşhur tantunisi, kerebiçi, cezeryesi ve narenciye bahçeleriyle ünlü Akdeniz incisi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1010, "Çorlu": 975, "Çerkezköy": 960,
            "Ergene": 980, "Marmaraereğlisi": 995, "İstanbul": 880, "Ankara": 480,
            "Adana": 70, "Karaman": 230, "Konya": 350, "Niğde": 180, "Antalya": 470, "Aksaray": 260,
            "Tarsus": 28, "Erdemli": 38, "Silifke": 85, "Anamur": 220, "Mut": 160, "Aydıncık": 170, "Bozyazı": 205
        },
        komsular: {
            kuzey: "Karaman (Sertavul Geçidi 1650m - Mut) / Niğde (Ulukışla - Pozantı)",
            dogu: "Adana (Tarsus - Çukurova Havalimanı - Yenice)",
            guney: "Akdeniz (Mersin Körfezi - Kıbrıs Feribot Hattı)",
            bati: "Antalya (Gazipaşa - Alanya / Anamur Sahil Aksı) / Konya (Hadim - Taşkent)"
        },
        komsuIller: ["Adana", "Niğde", "Konya", "Karaman", "Antalya"],
        fizikiSinirKomsulari: ["Adana", "Niğde", "Konya", "Karaman", "Antalya"],
        sinirKomsulari: {
            "Tarsus - Seyhan": { ilce: "Tarsus", komsuIl: "Adana (Seyhan / Çukurova / D-400)", mesafeKm: 40, yol: "O-51 / D-400" },
            "Mut - Karaman": { ilce: "Mut", komsuIl: "Karaman (Merkez / Sertavul Geçidi 1650m)", mesafeKm: 75, yol: "D-715" },
            "Anamur - Gazipaşa": { ilce: "Anamur", komsuIl: "Antalya (Gazipaşa / Alanya Sahil Yolu)", mesafeKm: 80, yol: "D-400 Akdeniz Sahil Yolu" },
            "Çamlıyayla - Ulukışla": { ilce: "Çamlıyayla", komsuIl: "Niğde (Ulukışla / Toroslar Geçişi)", mesafeKm: 65, yol: "D-750" }
        },
        terrain: "sahil",
        ucretler: { tam: 40, ogrenci: 24, yasli: 0 }
    },
    "İzmir": {
        plaka: "35",
        bolge: "Ege",
        merkezeMesafeKm: 520,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-35"]->.izmir; (node["highway"="bus_stop"](area.izmir););`,
        coordinates: {
            dms: "38°25′N 27°08′E",
            enlemDms: "38°25′K",
            boylamDms: "27°08′D",
            lat: 38.4192,
            lon: 27.1287,
            rakimMetre: 5,
            merkezeMesafeKm: 520,
            konumAciklamasi: "Ege Bölgesi'nin incisi ve Türkiye'nin üçüncü büyük metropolü. İzmir Körfezi boyunca uzanan Kordon boyu, Tarihi Saat Kulesi, Konak Meydanı, Tarihi Kemeraltı Çarşısı, Tarihi Asansör, UNESCO Dünya Mirası Efes Antik Kenti ve Meryem Ana Evi, Bergama Akropolü, Çeşme ve Alaçatı rüzgar sörfü sahilleri, Foça siren kayalıkları, çıtır boyozu, sıcacık kumrusu, gevreği ve çağdaş Akdeniz kimliğiyle tanınan batının parlayan yıldızı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 520, "Çorlu": 485, "Çerkezköy": 470,
            "Ergene": 490, "Marmaraereğlisi": 505, "İstanbul": 475, "Ankara": 580,
            "Balıkesir": 175, "Manisa": 35, "Aydın": 110, "Çanakkale": 320, "Muğla": 210, "Uşak": 210, "Denizli": 225, "Bursa": 330,
            "Bornova": 8, "Konak": 2, "Karşıyaka": 12, "Buca": 9, "Çeşme": 85, "Bergama": 105, "Selçuk": 75, "Urla": 38, "Aliağa": 55, "Torbalı": 45
        },
        komsular: {
            kuzey: "Balıkesir (Ayvalık - Dikili / Soma - Bergama Aksı)",
            dogu: "Manisa (Sabuncubeli Tüneli - Bornova / Turgutlu - Kemalpaşa)",
            guney: "Aydın (Kuşadası - Selçuk / Germencik - Torbalı)",
            bati: "Ege Denizi (Çeşme Boğazı - Sakız Adası / Karaburun Yarımadası)"
        },
        komsuIller: ["Balıkesir", "Manisa", "Aydın"],
        fizikiSinirKomsulari: ["Balıkesir", "Manisa", "Aydın"],
        sinirKomsulari: {
            "Bornova - Manisa": { ilce: "Bornova", komsuIl: "Manisa (Merkez / Sabuncubeli Tüneli)", mesafeKm: 35, yol: "D-565 / Sabuncubeli" },
            "Selçuk - Kuşadası": { ilce: "Selçuk", komsuIl: "Aydın (Kuşadası / Efes Girişi)", mesafeKm: 20, yol: "D-515" },
            "Dikili - Ayvalık": { ilce: "Dikili", komsuIl: "Balıkesir (Ayvalık / Sarımsaklı Sahili)", mesafeKm: 40, yol: "D-550 / E87" },
            "Kemalpaşa - Turgutlu": { ilce: "Kemalpaşa", komsuIl: "Manisa (Turgutlu / O-5 Girişi)", mesafeKm: 30, yol: "D-300 / E96" },
            "Selçuk - Germencik": { ilce: "Selçuk", komsuIl: "Aydın (Germencik / O-31 Otoyolu)", mesafeKm: 35, yol: "O-31 / D-550" }
        },
        terrain: "sahil",
        ucretler: { tam: 30, ogrenci: 18, yasli: 0 }
    },
    "Kars": {
        plaka: "36",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1530,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-36"]->.kars; (node["highway"="bus_stop"](area.kars););`,
        coordinates: {
            dms: "40°36′N 43°06′E",
            enlemDms: "40°36′K",
            boylamDms: "43°06′D",
            lat: 40.6013,
            lon: 43.0975,
            rakimMetre: 1768,
            merkezeMesafeKm: 1530,
            konumAciklamasi: "Kafkasya sınırında, tarihi İpek Yolu kavşağında yer alan serhat ve kültür kenti. UNESCO Dünya Mirası Ani Harabeleri (Binbir Kiliseli Kent), kristal kar cenneti Sarıkamış Cıbıltepe Kayak Merkezi, Kars Kalesi, 12 Havariler Kümbet Camii, Rus Baltık mimarisi taş konakları, Çıldır Gölü buz üstü atlı kızakları, Doğu Ekspresi'nin efsanevi son durağı, Kars gravyeri, kaşarı ve kaz etiyle ünlü Doğu Anadolu kalesi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1530, "Çorlu": 1495, "Çerkezköy": 1480,
            "Ergene": 1500, "Marmaraereğlisi": 1515, "İstanbul": 1400, "Ankara": 1070,
            "Erzurum": 200, "Ağrı": 140, "Ardahan": 90, "Iğdır": 140, "Artvin": 215, "Bayburt": 325,
            "Sarıkamış": 55, "Kağızman": 75, "Digor": 42, "Arpaçay": 40, "Akyaka": 58, "Selim": 32
        },
        komsular: {
            kuzey: "Ardahan (Merkez - Çıldır Gölü - Göle)",
            dogu: "Ermenistan Sınırı (Akyaka / Ahuryan - Arpaçay Barajı)",
            guney: "Iğdır (Tuzluca) / Ağrı (Doğubayazıt - Kağızman)",
            bati: "Erzurum (Horasan - Sarıkamış - Şenkaya)"
        },
        komsuIller: ["Ardahan", "Erzurum", "Ağrı", "Iğdır"],
        fizikiSinirKomsulari: ["Ardahan", "Erzurum", "Ağrı", "Iğdır"],
        sinirKomsulari: {
            "Sarıkamış - Horasan": { ilce: "Sarıkamış", komsuIl: "Erzurum (Horasan / Pasinler / D-100)", mesafeKm: 65, yol: "D-957 / D-100" },
            "Merkez - Susuz - Ardahan": { ilce: "Susuz", komsuIl: "Ardahan (Merkez / Ilgar Dağı Yolu)", mesafeKm: 65, yol: "D-965" },
            "Digor - Tuzluca": { ilce: "Digor", komsuIl: "Iğdır (Tuzluca / Aras Vadisi)", mesafeKm: 45, yol: "D-070" },
            "Kağızman - Ağrı": { ilce: "Kağızman", komsuIl: "Ağrı (Merkez / Tutak Yolu)", mesafeKm: 95, yol: "D-965" }
        },
        terrain: "karli",
        ucretler: { tam: 50, ogrenci: 28, yasli: 0 }
    },
    "Kastamonu": {
        plaka: "37",
        bolge: "Karadeniz",
        merkezeMesafeKm: 620,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-37"]->.kastamonu; (node["highway"="bus_stop"](area.kastamonu););`,
        coordinates: {
            dms: "41°23′N 33°47′E",
            enlemDms: "41°23′K",
            boylamDms: "33°47′D",
            lat: 41.3887,
            lon: 33.7827,
            rakimMetre: 775,
            merkezeMesafeKm: 620,
            konumAciklamasi: "Batı Karadeniz'in tarih ve doğa cenneti. Ilgaz Dağları Milli Parkı ve kayak tesisleri, Küre Dağları Milli Parkı, Valla Kanyonu, Horma Kanyonu, Ilıca Şelalesi, Tarihi Kastamonu Kalesi, Saat Kulesi, Nasrullah Camii ve Şadırvanı, Şeyh Şaban-ı Veli Külliyesi, İnebolu tarihi Türk Ocağı ve İstiklal Madalyalı limanı, dünyaca ünlü Taşköprü sarımsağı, çekme helvası ve pastırmasıyla bilinen yiğitler şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 620, "Çorlu": 585, "Çerkezköy": 570,
            "Ergene": 590, "Marmaraereğlisi": 605, "İstanbul": 490, "Ankara": 240,
            "Sinop": 180, "Çankırı": 105, "Çorum": 195, "Karabük": 110, "Bartın": 185, "Bolu": 235, "Samsun": 335,
            "Tosya": 70, "Taşköprü": 42, "İnebolu": 90, "Cide": 135, "Araç": 45, "Bozkurt": 95, "Daday": 35
        },
        komsular: {
            kuzey: "Karadeniz (İnebolu - Abana - Cide Sahil Şeridi)",
            dogu: "Sinop (Boyabat - Ayancık - Türkeli)",
            guney: "Çankırı (Ilgaz Dağı 15 Temmuz İstiklal Tüneli) / Çorum (Kargı - Osmancık)",
            bati: "Karabük (Safranbolu - Eflani) / Bartın (Ulus - Kurucaşile)"
        },
        komsuIller: ["Sinop", "Çorum", "Çankırı", "Karabük", "Bartın"],
        fizikiSinirKomsulari: ["Sinop", "Çorum", "Çankırı", "Karabük", "Bartın"],
        sinirKomsulari: {
            "Merkez - Ilgaz": { ilce: "Merkez", komsuIl: "Çankırı (Ilgaz / 15 Temmuz İstiklal Tüneli)", mesafeKm: 45, yol: "D-765 / Ilgaz Tüneli" },
            "Araç - Safranbolu": { ilce: "Araç", komsuIl: "Karabük (Safranbolu / Merkez / D-030)", mesafeKm: 45, yol: "D-030" },
            "Tosya - Osmancık": { ilce: "Tosya", komsuIl: "Çorum (Osmancık / D-100 Trans-Avrupa)", mesafeKm: 55, yol: "D-100" },
            "Taşköprü - Boyabat": { ilce: "Taşköprü", komsuIl: "Sinop (Boyabat / D-030)", mesafeKm: 75, yol: "D-030" },
            "Cide - Kurucaşile": { ilce: "Cide", komsuIl: "Bartın (Kurucaşile / Amasra Sahil Yolu)", mesafeKm: 35, yol: "D-010 Karadeniz Sahil Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 38, ogrenci: 22, yasli: 0 }
    },
    "Kayseri": {
        plaka: "38",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 890,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-38"]->.kayseri; (node["highway"="bus_stop"](area.kayseri););`,
        coordinates: {
            dms: "38°44′N 35°29′E",
            enlemDms: "38°44′K",
            boylamDms: "35°29′D",
            lat: 38.7312,
            lon: 35.4787,
            rakimMetre: 1050,
            merkezeMesafeKm: 890,
            konumAciklamasi: "İç Anadolu'nun ticaret, sanayi ve gastronomi merkezi. 3917 metre yüksekliğiyle görkemli Erciyes Dağı kış sporları merkezi, Tarihi Kayseri Kalesi ve Surları, Kapalıçarşı, Hunat Hatun Külliyesi, Gevher Nesibe Tıp Tarihi Müzesi, Soğanlı Vadisi, Sultan Sazlığı Kuş Cenneti, Kapuzbaşı Şelaleleri, meşhur Kayseri pastırması, sucuğu, çıtır mantısı ve yağlamasıyla bilinen Selçuklu başkenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 890, "Çorlu": 855, "Çerkezköy": 840,
            "Ergene": 860, "Marmaraereğlisi": 875, "İstanbul": 760, "Ankara": 315,
            "Sivas": 195, "Nevşehir": 80, "Niğde": 130, "Yozgat": 175, "Adana": 330, "Kahramanmaraş": 260, "Malatya": 340, "Kırşehir": 135,
            "Melikgazi": 3, "Kocasinan": 2, "Talas": 8, "Develi": 45, "Yahyalı": 85, "Bünyan": 40, "Pınarbaşı": 88, "İncesu": 30
        },
        komsular: {
            kuzey: "Yozgat (Boğazlıyan - Çandır) / Sivas (Gemerek - Şarkışla)",
            dogu: "Sivas (Kangal - Gürün) / Kahramanmaraş (Göksun / Pınarbaşı)",
            guney: "Adana (Tufanbeyli - Saimbeyli) / Niğde (Çamardı - Yahyalı)",
            bati: "Nevşehir (Ürgüp - Avanos - Derinkuyu) / Niğde (Merkez - İncesu)"
        },
        komsuIller: ["Sivas", "Yozgat", "Nevşehir", "Niğde", "Adana", "Kahramanmaraş"],
        fizikiSinirKomsulari: ["Sivas", "Yozgat", "Nevşehir", "Niğde", "Adana", "Kahramanmaraş"],
        sinirKomsulari: {
            "İncesu - Nevşehir": { ilce: "İncesu", komsuIl: "Nevşehir (Ürgüp / Avanos / Kapadokya Girişi)", mesafeKm: 50, yol: "D-300" },
            "Yeşilhisar - Niğde": { ilce: "Yeşilhisar", komsuIl: "Niğde (Merkez / Derinkuyu Kavşağı)", mesafeKm: 55, yol: "D-805" },
            "Sarıoğlan - Gemerek": { ilce: "Sarıoğlan", komsuIl: "Sivas (Gemerek / Şarkışla / D-260)", mesafeKm: 35, yol: "D-260" },
            "Pınarbaşı - Gürün": { ilce: "Pınarbaşı", komsuIl: "Sivas (Gürün / Malatya Yolu / D-300)", mesafeKm: 90, yol: "D-300" },
            "Develi - Yahyalı - Adana": { ilce: "Yahyalı", komsuIl: "Adana (Aladağ / Kapuzbaşı Şelaleleri)", mesafeKm: 75, yol: "38-51 İl Yolu" }
        },
        terrain: "duzluk",
        ucretler: { tam: 40, ogrenci: 24, yasli: 0 }
    },
    "Kırşehir": {
        plaka: "40",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 730,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-40"]->.kirsehir; (node["highway"="bus_stop"](area.kirsehir););`,
        coordinates: {
            dms: "39°09′N 34°10′E",
            enlemDms: "39°09′K",
            boylamDms: "34°10′D",
            lat: 39.1425,
            lon: 34.1709,
            rakimMetre: 985,
            merkezeMesafeKm: 730,
            konumAciklamasi: "İç Anadolu Bozkırı'nın kalbinde, UNESCO Müzik Şehri unvanına sahip ozanlar ve kültür başkenti. Ahilik teşkilatının kurucusu Ahi Evran Türbesi ve Külliyesi, 13. yüzyıl astronomi okulu Cacabey Medresesi, Bozkırın Tezenesi Neşet Ertaş ve abdallık geleneği, flamingolar diyarı Seyfe Gölü Kuş Cenneti, Hirfanlı Baraj Gölü, Kaman Kalehöyük Arkeoloji Müzesi ve meşhur Kaman ceviziyle tanınan felsefe ve hoşgörü şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 730, "Çorlu": 695, "Çerkezköy": 680,
            "Ergene": 700, "Marmaraereğlisi": 715, "İstanbul": 600, "Ankara": 185,
            "Nevşehir": 90, "Yozgat": 110, "Kırıkkale": 110, "Aksaray": 110, "Kayseri": 135, "Konya": 260,
            "Kaman": 52, "Mucur": 22, "Çiçekdağı": 65, "Akpınar": 40, "Akçakent": 65, "Boztepe": 18
        },
        komsular: {
            kuzey: "Kırıkkale (Delice - Keskin) / Yozgat (Yerköy - Şefaatli)",
            dogu: "Nevşehir (Kozaklı - Hacıbektaş / Avanos)",
            guney: "Aksaray (Ortaköy - Ağaçören / Hirfanlı)",
            bati: "Ankara (Şereflikoçhisar - Bala / Kaman)"
        },
        komsuIller: ["Kırıkkale", "Yozgat", "Nevşehir", "Aksaray", "Ankara"],
        fizikiSinirKomsulari: ["Kırıkkale", "Yozgat", "Nevşehir", "Aksaray", "Ankara"],
        sinirKomsulari: {
            "Mucur - Hacıbektaş": { ilce: "Mucur", komsuIl: "Nevşehir (Hacıbektaş / D-260)", mesafeKm: 25, yol: "D-260" },
            "Merkez - Keskin": { ilce: "Merkez", komsuIl: "Kırıkkale (Keskin / Merkez / D-765)", mesafeKm: 85, yol: "D-765" },
            "Kaman - Bala": { ilce: "Kaman", komsuIl: "Ankara (Bala / Gölbaşı / D-260)", mesafeKm: 75, yol: "D-260" },
            "Çiçekdağı - Yerköy": { ilce: "Çiçekdağı", komsuIl: "Yozgat (Yerköy / YHT Hattı)", mesafeKm: 5, yol: "D-200 / Şehir İçi Bağlantı" },
            "Kaman - Ortaköy": { ilce: "Kaman", komsuIl: "Aksaray (Ortaköy / Hirfanlı Baraj Yolu)", mesafeKm: 65, yol: "40-75 İl Yolu" }
        },
        terrain: "duzluk",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },
    "Kocaeli": {
        plaka: "41",
        bolge: "Marmara",
        merkezeMesafeKm: 250,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-41"]->.kocaeli; (node["highway"="bus_stop"](area.kocaeli););`,
        coordinates: {
            dms: "40°46′N 29°56′E",
            enlemDms: "40°46′K",
            boylamDms: "29°56′D",
            lat: 40.7654,
            lon: 29.9408,
            rakimMetre: 10,
            merkezeMesafeKm: 250,
            konumAciklamasi: "Marmara Bölgesi'nin sanayi, ticaret ve teknoloji başkenti, Doğu Marmara ile Anadolu'nun kilit kavşağı. İzmit Körfezi boyunca uzanan Sekapark, Osmangazi Asma Köprüsü, Kartepe Kayak Merkezi, Tarihi İzmit Saat Kulesi, Kasr-ı Hümayun Saray Müzesi, Gayret Gemi Müzesi, Ballıkayalar Kanyonu, Karadeniz kıyısındaki Kefken ve Kerpe pembe kayalıkları, pişmaniyesi ve limanlarıyla ünlü sanayi metropolü."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 250, "Çorlu": 215, "Çerkezköy": 200,
            "Ergene": 220, "Marmaraereğlisi": 235, "İstanbul": 95, "Ankara": 350,
            "Sakarya": 35, "Yalova": 45, "Bursa": 135, "Bilecik": 140, "Düzce": 115, "Bolu": 160,
            "İzmit": 2, "Gebze": 48, "Gölcük": 15, "Körfez": 18, "Derince": 12, "Kartepe": 15, "Karamürsel": 35, "Darıca": 55, "Kandıra": 45, "Dilovası": 35
        },
        komsular: {
            kuzey: "Karadeniz (Kandıra - Kefken - Kerpe Sahili)",
            dogu: "Sakarya (Adapazarı - Sapanca Gölü - Akyazı)",
            guney: "Bursa (İznik - Gemlik) / Yalova (Karamürsel - Altınova / Osmangazi Köprüsü)",
            bati: "İstanbul (Tuzla - Pendik - Şile / Gebze OSB Aksı)"
        },
        komsuIller: ["İstanbul", "Sakarya", "Yalova", "Bursa"],
        fizikiSinirKomsulari: ["İstanbul", "Sakarya", "Yalova", "Bursa"],
        sinirKomsulari: {
            "Gebze - Tuzla": { ilce: "Gebze", komsuIl: "İstanbul (Tuzla / Pendik / D-100 & O-4)", mesafeKm: 15, yol: "D-100 / O-4 Anadolu Otoyolu" },
            "Kartepe - Sapanca": { ilce: "Kartepe", komsuIl: "Sakarya (Sapanca / Adapazarı / D-100)", mesafeKm: 20, yol: "D-100 / O-4" },
            "Karamürsel - Altınova": { ilce: "Karamürsel", komsuIl: "Yalova (Altınova / Osmangazi Köprüsü / D-130)", mesafeKm: 12, yol: "D-130" },
            "Gölcük - İznik": { ilce: "Gölcük", komsuIl: "Bursa (İznik / Samanlı Dağları)", mesafeKm: 45, yol: "D-595" },
            "Kandıra - Kaynarca": { ilce: "Kandıra", komsuIl: "Sakarya (Kaynarca / Karasu Sahil Yolu)", mesafeKm: 30, yol: "D-020" }
        },
        terrain: "asfalt",
        ucretler: { tam: 30, ogrenci: 18, yasli: 0 }
    },
    "Kütahya": {
        plaka: "43",
        bolge: "Ege",
        merkezeMesafeKm: 380,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-43"]->.kutahya; (node["highway"="bus_stop"](area.kutahya););`,
        coordinates: {
            dms: "39°25′N 29°59′E",
            enlemDms: "39°25′K",
            boylamDms: "29°59′D",
            lat: 39.4242,
            lon: 29.9833,
            rakimMetre: 970,
            merkezeMesafeKm: 380,
            konumAciklamasi: "İç Batı Anadolu'da, Ege Bölgesi'nin çini, seramik ve porselen başkenti. UNESCO Yaratıcı Şehirler Ağı üyesi; Tarihi Kütahya Kalesi ve Döner Gazino, Kurtuluş Savaşı zafer anıtı Dumlupınar Şehitliği, dünyanın en iyi korunmuş Zeus Tapınağı'na ev sahipliği yapan Aizanoi Antik Kenti, Yoncalı kaplıcaları, Çinili Cami, Germiyanoğlu Tarihi Konakları, Domaniç Osmanlı kuruluş ormanları, güveci ve leblebisiyle ünlü kadim sanat kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 380, "Çorlu": 345, "Çerkezköy": 330,
            "Ergene": 350, "Marmaraereğlisi": 365, "İstanbul": 250, "Ankara": 310,
            "Eskişehir": 75, "Afyonkarahisar": 100, "Bilecik": 110, "Bursa": 175, "Balıkesir": 230, "Uşak": 140, "Manisa": 230,
            "Tavşanlı": 48, "Simav": 145, "Gediz": 95, "Emet": 100, "Dumlupınar": 80, "Domaniç": 90, "Çavdarhisar": 60
        },
        komsular: {
            kuzey: "Bilecik (Bozüyük) / Bursa (İnegöl - Domaniç Dağları)",
            dogu: "Eskişehir (İnönü - Seyitgazi) / Afyonkarahisar (İhsaniye - Gazlıgöl)",
            guney: "Uşak (Banaz - Sivaslı) / Manisa (Demirci - Gördes)",
            bati: "Balıkesir (Dursunbey - Kepsut)"
        },
        komsuIller: ["Bilecik", "Bursa", "Balıkesir", "Manisa", "Uşak", "Afyonkarahisar", "Eskişehir"],
        fizikiSinirKomsulari: ["Bilecik", "Bursa", "Balıkesir", "Manisa", "Uşak", "Afyonkarahisar", "Eskişehir"],
        sinirKomsulari: {
            "Merkez - Eskişehir": { ilce: "Merkez", komsuIl: "Eskişehir (Tepebaşı / Porsuk Barajı / D-230)", mesafeKm: 75, yol: "D-230" },
            "Merkez - Afyonkarahisar": { ilce: "Merkez", komsuIl: "Afyonkarahisar (Merkez / Zafer Havalimanı / D-650)", mesafeKm: 100, yol: "D-650" },
            "Domaniç - İnegöl": { ilce: "Domaniç", komsuIl: "Bursa (İnegöl / Kocayayla Geçidi)", mesafeKm: 40, yol: "43-77 İl Yolu" },
            "Tavşanlı - Bozüyük": { ilce: "Tavşanlı", komsuIl: "Bilecik (Bozüyük / D-230)", mesafeKm: 70, yol: "D-230" },
            "Gediz - Uşak": { ilce: "Gediz", komsuIl: "Uşak (Merkez / Banaz / D-240)", mesafeKm: 65, yol: "D-240" },
            "Simav - Demirci": { ilce: "Simav", komsuIl: "Manisa (Demirci / Akdağ Geçişi)", mesafeKm: 55, yol: "D-585" }
        },
        terrain: "daglik",
        ucretler: { tam: 32, ogrenci: 19, yasli: 0 }
    },
    "Malatya": {
        plaka: "44",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1250,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-44"]->.malatya; (node["highway"="bus_stop"](area.malatya););`,
        coordinates: {
            dms: "38°21′N 38°18′E",
            enlemDms: "38°21′K",
            boylamDms: "38°18′D",
            lat: 38.3552,
            lon: 38.3095,
            rakimMetre: 964,
            merkezeMesafeKm: 1250,
            konumAciklamasi: "Yukarı Fırat Havzası'nda, görkemli Beydağları eteklerinde kurulu dünyanın kayısı başkenti. UNESCO Dünya Mirası Arslantepe Höyüğü (dünyanın ilk saray kompleksi), Tarihi Battalgazi Ulu Camii ve Silahtar Mustafa Paşa Kervansarayı, Levent Vadisi Kanyonu ve cam seyir terası, Darende Tohma Kanyonu, Kudret Havuzu ve Somuncu Baba Külliyesi, Karakaya Baraj Gölü feribot geçişi, nefis Malatya kayısısı, kayısı döneri ve kağıt kebabıyla ünlü Doğu Anadolu incisi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1250, "Çorlu": 1215, "Çerkezköy": 1200,
            "Ergene": 1220, "Marmaraereğlisi": 1235, "İstanbul": 1120, "Ankara": 670,
            "Elazığ": 100, "Sivas": 245, "Adıyaman": 120, "Kahramanmaraş": 220, "Erzincan": 250, "Diyarbakır": 250, "Kayseri": 340,
            "Battalgazi": 10, "Yeşilyurt": 8, "Darende": 110, "Akçadağ": 40, "Doğanşehir": 60, "Hekimhan": 85, "Arapgir": 120, "Pütürge": 75
        },
        komsular: {
            kuzey: "Sivas (Kangal - Gürün) / Erzincan (Kemaliye - İliç)",
            dogu: "Elazığ (Baskil - Kömürhan Köprüsü / Karakaya Barajı)",
            guney: "Adıyaman (Çelikhan - Kahta / Nemrut Dağı Kuzey Girişi)",
            bati: "Kahramanmaraş (Elbistan - Nurhak) / Sivas (Gürün)"
        },
        komsuIller: ["Elazığ", "Sivas", "Erzincan", "Adıyaman", "Kahramanmaraş"],
        fizikiSinirKomsulari: ["Elazığ", "Sivas", "Erzincan", "Adıyaman", "Kahramanmaraş"],
        sinirKomsulari: {
            "Kale - Kömürhan": { ilce: "Kale", komsuIl: "Elazığ (Baskil / Kömürhan Köprüsü & Tüneli / D-300)", mesafeKm: 50, yol: "D-300" },
            "Doğanşehir - Sürgü - Adıyaman": { ilce: "Doğanşehir", komsuIl: "Adıyaman (Gölbaşı / Besni / D-850)", mesafeKm: 65, yol: "D-850" },
            "Darende - Gürün": { ilce: "Darende", komsuIl: "Sivas (Gürün / Kayseri Aksı / D-300)", mesafeKm: 45, yol: "D-300" },
            "Hekimhan - Kangal": { ilce: "Hekimhan", komsuIl: "Sivas (Kangal / Alacahan / D-850)", mesafeKm: 65, yol: "D-850" },
            "Arapgir - Kemaliye": { ilce: "Arapgir", komsuIl: "Erzincan (Kemaliye / Karanlık Kanyon)", mesafeKm: 45, yol: "D-877" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Manisa": {
        plaka: "45",
        bolge: "Ege",
        merkezeMesafeKm: 490,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-45"]->.manisa; (node["highway"="bus_stop"](area.manisa););`,
        coordinates: {
            dms: "38°37′N 27°26′E",
            enlemDms: "38°37′K",
            boylamDms: "27°26′D",
            lat: 38.6191,
            lon: 27.4289,
            rakimMetre: 62,
            merkezeMesafeKm: 490,
            konumAciklamasi: "Gediz Nehri'nin hayat verdiği bereketli ovada, Spil Dağı eteklerinde yer alan şehzadeler şehri ve Ege'nin sanayi devi. Spil Dağı Milli Parkı ve Yılkı Atları, Niobe Ağlayan Kaya, Tarihi Muradiye Camii, Sultan Camii ve geleneksel Mesir Macunu Festivali, Lidya Krallığı'nın başkenti Sardes Antik Kenti ve ilk madeni paranın basıldığı Artemis Tapınağı, Kula UNESCO Küresel Jeoparkı volkanik kraterleri, Tarihi Kula Evleri, Manisa kebabı ve dünyaca ünlü sultaniye çekirdeksiz üzümüyle tanınan tarih ve tarım kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 490, "Çorlu": 455, "Çerkezköy": 440,
            "Ergene": 460, "Marmaraereğlisi": 475, "İstanbul": 440, "Ankara": 560,
            "İzmir": 35, "Balıkesir": 140, "Uşak": 195, "Aydın": 145, "Kütahya": 230, "Denizli": 210, "Çanakkale": 335,
            "Şehzadeler": 2, "Yunusemre": 3, "Akhisar": 52, "Turgutlu": 30, "Salihli": 72, "Soma": 90, "Alaşehir": 110, "Kula": 120, "Kırkağaç": 75, "Demirci": 160
        },
        komsular: {
            kuzey: "Balıkesir (Savaştepe - İvrindi - Sındırgı)",
            dogu: "Uşak (Eşme - Banaz) / Kütahya (Simav - Gediz)",
            guney: "Aydın (Kuyucak - Nazilli) / Denizli (Buldan - Güney)",
            bati: "İzmir (Bornova - Menemen - Aliağa - Bergama)"
        },
        komsuIller: ["İzmir", "Balıkesir", "Kütahya", "Uşak", "Aydın", "Denizli"],
        fizikiSinirKomsulari: ["İzmir", "Balıkesir", "Kütahya", "Uşak", "Aydın", "Denizli"],
        sinirKomsulari: {
            "Merkez - Bornova": { ilce: "Merkez / Yunusemre", komsuIl: "İzmir (Bornova / Sabuncubeli Tüneli)", mesafeKm: 35, yol: "D-565 / Sabuncubeli" },
            "Akhisar - Balıkesir": { ilce: "Akhisar", komsuIl: "Balıkesir (Merkez / Savaştepe / O-5)", mesafeKm: 85, yol: "O-5 / D-565" },
            "Turgutlu - Kemalpaşa": { ilce: "Turgutlu", komsuIl: "İzmir (Kemalpaşa / O-5 Çıkışı)", mesafeKm: 30, yol: "D-300 / E96" },
            "Kula - Uşak": { ilce: "Kula", komsuIl: "Uşak (Merkez / D-300 Karayolu)", mesafeKm: 75, yol: "D-300 / E96" },
            "Alaşehir - Buldan": { ilce: "Alaşehir", komsuIl: "Denizli (Buldan / Pamukkale Aksı)", mesafeKm: 60, yol: "D-585" }
        },
        terrain: "duzluk",
        ucretler: { tam: 30, ogrenci: 18, yasli: 0 }
    },
    "Kahramanmaraş": {
        plaka: "46",
        bolge: "Akdeniz",
        merkezeMesafeKm: 1200,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-46"]->.kahramanmaras; (node["highway"="bus_stop"](area.kahramanmaras););`,
        coordinates: {
            dms: "37°35′N 36°56′E",
            enlemDms: "37°35′K",
            boylamDms: "36°56′D",
            lat: 37.5858,
            lon: 36.9371,
            rakimMetre: 568,
            merkezeMesafeKm: 1200,
            konumAciklamasi: "Akdeniz Bölgesi'nin doğusunda, Ahır Dağı eteklerinde yer alan kahramanlık madalyalı edebiyat ve şiir kenti. Kurtuluş Savaşı'ndaki şanlı milli mücadelesiyle İstiklal Madalyası ve Kahramanlık unvanı alan şehir; dünyaca ünlü Maraş Dövme Dondurması, Tarihi Maraş Kalesi, Tarihi Kapalı Çarşı, Bakırcılar Çarşısı, Yedi Güzel Adam Edebiyat Müzesi, Afşin Eshab-ı Kehf Külliyesi, Döngel Mağaraları ve Şelalesi, Maraş tarhanası, kırmızı pul biberi, fıstıklı paçası ve oyma çeyiz sandıklarıyla tanınan köklü kültür kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1200, "Çorlu": 1165, "Çerkezköy": 1150,
            "Ergene": 1170, "Marmaraereğlisi": 1185, "İstanbul": 1070, "Ankara": 600,
            "Gaziantep": 78, "Adana": 190, "Osmaniye": 110, "Kayseri": 260, "Malatya": 220, "Adıyaman": 160, "Sivas": 320,
            "Dulkadiroğlu": 2, "Onikişubat": 3, "Elbistan": 125, "Afşin": 120, "Türkoğlu": 25, "Pazarcık": 45, "Göksun": 65, "Andırın": 85, "Çağlayancerit": 65
        },
        komsular: {
            kuzey: "Sivas (Gürün) / Kayseri (Sarız - Pınarbaşı / Göksun Tünelleri)",
            dogu: "Malatya (Doğanşehir - Akçadağ) / Adıyaman (Gölbaşı - Besni)",
            guney: "Gaziantep (Şehitkamil - Nurdağı - İslahiye)",
            bati: "Osmaniye (Bahçe - Kadirli) / Adana (Kozan - Feke - Saimbeyli)"
        },
        komsuIller: ["Gaziantep", "Osmaniye", "Adana", "Kayseri", "Sivas", "Malatya", "Adıyaman"],
        fizikiSinirKomsulari: ["Gaziantep", "Osmaniye", "Adana", "Kayseri", "Sivas", "Malatya", "Adıyaman"],
        sinirKomsulari: {
            "Pazarcık - Şehitkamil": { ilce: "Pazarcık", komsuIl: "Gaziantep (Şehitkamil / Narlı Kavşağı / D-835)", mesafeKm: 50, yol: "D-835" },
            "Türkoğlu - Nurdağı": { ilce: "Türkoğlu", komsuIl: "Gaziantep (Nurdağı / TAG Otoyolu Bağlantısı)", mesafeKm: 35, yol: "D-825" },
            "Türkoğlu - Bahçe": { ilce: "Türkoğlu", komsuIl: "Osmaniye (Bahçe / TAG Otoyolu)", mesafeKm: 55, yol: "O-52 / D-400" },
            "Göksun - Pınarbaşı": { ilce: "Göksun", komsuIl: "Kayseri (Pınarbaşı / Sarız / D-815)", mesafeKm: 85, yol: "D-815" },
            "Pazarcık - Gölbaşı": { ilce: "Pazarcık", komsuIl: "Adıyaman (Gölbaşı / D-360)", mesafeKm: 60, yol: "D-360" },
            "Elbistan - Darende": { ilce: "Elbistan", komsuIl: "Malatya (Darende / Tohma Kanyonu)", mesafeKm: 70, yol: "46-05 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 42, ogrenci: 24, yasli: 0 }
    },
    "Mardin": {
        plaka: "47",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1610,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-47"]->.mardin; (node["highway"="bus_stop"](area.mardin););`,
        coordinates: {
            dms: "37°19′N 40°44′E",
            enlemDms: "37°19′K",
            boylamDms: "40°44′D",
            lat: 37.3212,
            lon: 40.7245,
            rakimMetre: 1083,
            merkezeMesafeKm: 1610,
            konumAciklamasi: "Mezopotamya Ovası'na tepeden bakan sarı kalker taşından oyulmuş masalsı konakları ve binlerce yıllık hoşgörüsüyle dünya mirası açık hava müzesi. Tarihi Mardin Evleri, Deyrulzafaran Manastırı, Kasımiye Medresesi, Zinciriye Medresesi, Ulu Cami, Roma sınır garnizonu Dara Antik Kenti ve Su Sarnıçları, Midyat Sıla Konağı, Mor Gabriel Manastırı, telkari gümüş işlemeciliği, süryani çöreği, badem şekeri ve dibek kahvesiyle büyüleyen masal kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1610, "Çorlu": 1575, "Çerkezköy": 1560,
            "Ergene": 1580, "Marmaraereğlisi": 1595, "İstanbul": 1480, "Ankara": 1050,
            "Diyarbakır": 95, "Şanlıurfa": 190, "Batman": 140, "Şırnak": 190, "Siirt": 230,
            "Artuklu": 2, "Kızıltepe": 25, "Midyat": 65, "Nusaybin": 55, "Derik": 75, "Mazıdağı": 48, "Savur": 45, "Dargeçit": 105
        },
        komsular: {
            kuzey: "Diyarbakır (Çınar - Bismil) / Batman (Hasankeyf - Gercüş)",
            dogu: "Şırnak (İdil - Cizre / Habur Aksı) / Siirt",
            guney: "Suriye Sınırı (Nusaybin - Kamışlı / Şenyurt Sınır Kapısı)",
            bati: "Şanlıurfa (Viranşehir - Ceylanpınar İpekyolu)"
        },
        komsuIller: ["Diyarbakır", "Şanlıurfa", "Batman", "Siirt", "Şırnak"],
        fizikiSinirKomsulari: ["Diyarbakır", "Şanlıurfa", "Batman", "Siirt", "Şırnak"],
        sinirKomsulari: {
            "Merkez - Çınar": { ilce: "Artuklu / Merkez", komsuIl: "Diyarbakır (Çınar / D-950 Karayolu)", mesafeKm: 65, yol: "D-950" },
            "Kızıltepe - Viranşehir": { ilce: "Kızıltepe", komsuIl: "Şanlıurfa (Viranşehir / D-400 Tarihi İpekyolu)", mesafeKm: 75, yol: "D-400 Tarihi İpekyolu" },
            "Midyat - Gercüş": { ilce: "Midyat", komsuIl: "Batman (Gercüş / Hasankeyf / D-955)", mesafeKm: 40, yol: "D-955" },
            "Nusaybin - Cizre": { ilce: "Nusaybin", komsuIl: "Şırnak (Cizre / İpekyolu)", mesafeKm: 95, yol: "D-400" },
            "Midyat - İdil": { ilce: "Midyat", komsuIl: "Şırnak (İdil / Cehennem Deresi Kanyonu)", mesafeKm: 65, yol: "D-380" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Muğla": {
        plaka: "48",
        bolge: "Ege",
        merkezeMesafeKm: 730,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-48"]->.mugla; (node["highway"="bus_stop"](area.mugla););`,
        coordinates: {
            dms: "37°13′N 28°22′E",
            enlemDms: "37°13′K",
            boylamDms: "28°22′D",
            lat: 37.2153,
            lon: 28.3636,
            rakimMetre: 660,
            merkezeMesafeKm: 730,
            konumAciklamasi: "Ege ve Akdeniz'in birleştiği noktada, 1480 kilometrelik uzunluğuyla Türkiye'nin en uzun kıyı şeridine sahip dünya turizm başkenti. Bodrum Kalesi ve Sualtı Arkeoloji Müzesi, Fethiye Ölüdeniz Lagünü ve Babadağ yamaç paraşütü, Marmaris İçmeler ve mavi tur koyları, Datça Yarımadası ve Knidos Antik Kenti, Akyaka Sakin Şehri (Cittaslow) ve buz gibi Kadın Azmağı Çayı, Göcek marinaları, Dalyan Kral Kaya Mezarları ve İztuzu Caretta Caretta Plajı, Saklıkent Kanyonu, Tarihi Muğla Bacaları ve çam balıyla tanınan yeryüzü cenneti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 730, "Çorlu": 695, "Çerkezköy": 680,
            "Ergene": 700, "Marmaraereğlisi": 715, "İstanbul": 680, "Ankara": 620,
            "Aydın": 100, "Denizli": 145, "Antalya": 310, "İzmir": 210, "Burdur": 240,
            "Menteşe": 2, "Bodrum": 110, "Fethiye": 130, "Marmaris": 55, "Milas": 65, "Ortaca": 85, "Dalaman": 90, "Datça": 125, "Köyceğiz": 60, "Yatağan": 28, "Ula": 15
        },
        komsular: {
            kuzey: "Aydın (Çine - Bozdoğan - Karacasu - Didim)",
            dogu: "Denizli (Kale - Tavas - Çameli) / Burdur (Gölhisar - Dirmil)",
            guney: "Antalya (Kaş - Kalkan / Seydikemer Eşen Çayı Geçişi)",
            bati: "Ege Denizi (Gökova Körfezi - Datça Yarımadası - Ege Adaları)"
        },
        komsuIller: ["Aydın", "Denizli", "Burdur", "Antalya"],
        fizikiSinirKomsulari: ["Aydın", "Denizli", "Burdur", "Antalya"],
        sinirKomsulari: {
            "Yatağan - Çine": { ilce: "Yatağan", komsuIl: "Aydın (Çine / Efeler Aksı / D-550)", mesafeKm: 45, yol: "D-550 / E87" },
            "Seydikemer - Kaş": { ilce: "Seydikemer / Fethiye", komsuIl: "Antalya (Kalkan / Kaş / Patara Sahili)", mesafeKm: 40, yol: "D-400 Akdeniz Sahil Yolu" },
            "Menteşe - Kale": { ilce: "Menteşe / Merkez", komsuIl: "Denizli (Kale / Tavas / D-330)", mesafeKm: 75, yol: "D-330" },
            "Milas - Söke": { ilce: "Milas", komsuIl: "Aydın (Söke / Bafa Gölü Sahili / D-525)", mesafeKm: 55, yol: "D-525" },
            "Fethiye - Altınyayla": { ilce: "Fethiye / Seydikemer", komsuIl: "Burdur (Altınyayla / Dirmil Geçidi)", mesafeKm: 65, yol: "48-31 İl Yolu" }
        },
        terrain: "sahil",
        ucretler: { tam: 38, ogrenci: 22, yasli: 0 }
    },
    "Muş": {
        plaka: "49",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1460,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-49"]->.mus; (node["highway"="bus_stop"](area.mus););`,
        coordinates: {
            dms: "38°44′N 41°30′E",
            enlemDms: "38°44′K",
            boylamDms: "41°30′D",
            lat: 38.7432,
            lon: 41.5064,
            rakimMetre: 1334,
            merkezeMesafeKm: 1460,
            konumAciklamasi: "Doğu Anadolu'nun en verimli ovalarından biri olan uçsuz bucaksız Muş Ovası boyunca uzanan tarihi yurt ve Anadolu'nun kapısı. 1071 Malazgirt Zafer Anıtı ve Tarihi Milli Parkı, Murat Nehri üzerindeki Selçuklu mirası Tarihi Murat Köprüsü, Tarihi Muş Kalesi, Arak Manastırı, Varto Hamurpet (Akdoğan) Krater Gölleri, ilkbaharda ovayı kızıla boyayan meşhur Muş Laleleri, kaşarı ve zengin ozanlık geleneğiyle tanınan kadim vatan toprağı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1460, "Çorlu": 1425, "Çerkezköy": 1410,
            "Ergene": 1430, "Marmaraereğlisi": 1445, "İstanbul": 1330, "Ankara": 940,
            "Bitlis": 85, "Bingöl": 115, "Erzurum": 220, "Ağrı": 165, "Diyarbakır": 230, "Van": 240,
            "Merkez": 2, "Malazgirt": 135, "Bulanık": 105, "Varto": 60, "Hasköy": 18, "Korkut": 28
        },
        komsular: {
            kuzey: "Erzurum (Hınıs - Tekman / Bingöl Dağları) / Ağrı (Patnos - Tutak)",
            dogu: "Bitlis (Ahlat - Adilcevaz / Van Gölü Havzası)",
            guney: "Bitlis (Güroymak - Tatvan) / Batman (Sason) / Diyarbakır (Kulp)",
            bati: "Bingöl (Karlıova - Solhan / Çapakçur Vadisi)"
        },
        komsuIller: ["Bitlis", "Bingöl", "Erzurum", "Ağrı", "Batman", "Diyarbakır"],
        fizikiSinirKomsulari: ["Bitlis", "Bingöl", "Erzurum", "Ağrı", "Batman", "Diyarbakır"],
        sinirKomsulari: {
            "Hasköy - Güroymak": { ilce: "Hasköy", komsuIl: "Bitlis (Güroymak / Tatvan / D-300)", mesafeKm: 35, yol: "D-300" },
            "Merkez - Solhan": { ilce: "Merkez", komsuIl: "Bingöl (Solhan / D-300 Karayolu)", mesafeKm: 55, yol: "D-300" },
            "Malazgirt - Patnos": { ilce: "Malazgirt", komsuIl: "Ağrı (Patnos / Süphan Dağı Eteği)", mesafeKm: 45, yol: "D-280" },
            "Varto - Hınıs": { ilce: "Varto", komsuIl: "Erzurum (Hınıs / Bingöl Dağları Geçidi)", mesafeKm: 50, yol: "D-955" },
            "Bulanık - Ahlat": { ilce: "Bulanık", komsuIl: "Bitlis (Ahlat / Van Gölü Kuzeyi)", mesafeKm: 65, yol: "D-280" }
        },
        terrain: "duzluk",
        ucretler: { tam: 48, ogrenci: 26, yasli: 0 }
    },
    "Nevşehir": {
        plaka: "50",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 770,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-50"]->.nevsehir; (node["highway"="bus_stop"](area.nevsehir););`,
        coordinates: {
            dms: "38°37′N 34°43′E",
            enlemDms: "38°37′K",
            boylamDms: "34°43′D",
            lat: 38.6244,
            lon: 34.7142,
            rakimMetre: 1225,
            merkezeMesafeKm: 770,
            konumAciklamasi: "Masalsı Kapadokya'nın kalbi, Güzel Atlar Diyarı. UNESCO Dünya Mirası peri bacaları, Göreme Açık Hava Müzesi ve kaya oyma kiliseleri, gün doğumunda gökyüzünü rengarenk süsleyen sıcak hava balonları, Uçhisar Kaya Kalesi, Ürgüp Üç Güzeller, Avanos Kızılırmak boyu tarihi çanak-çömlek atölyeleri, Derinkuyu ve Kaymaklı çok katlı Yeraltı Şehirleri, Hacıbektaş Veli Türbesi ve Külliyesi, Zelve Vadisi, çömlek kebabı ve volkanik tüf bağlarıyla tüm dünyanın hayran kaldığı peri masalı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 770, "Çorlu": 735, "Çerkezköy": 720,
            "Ergene": 740, "Marmaraereğlisi": 755, "İstanbul": 640, "Ankara": 280,
            "Kayseri": 80, "Kırşehir": 90, "Aksaray": 75, "Niğde": 85, "Yozgat": 170, "Konya": 220,
            "Merkez": 2, "Ürgüp": 20, "Avanos": 18, "Göreme": 12, "Uçhisar": 8, "Derinkuyu": 30, "Kaymaklı": 20, "Hacıbektaş": 45, "Gülşehir": 20, "Kozaklı": 85
        },
        komsular: {
            kuzey: "Kırşehir (Mucur - Hacıbektaş) / Yozgat (Boğazlıyan - Şefaatli)",
            dogu: "Kayseri (İncesu - Yeşilhisar / Erciyes Manzarası)",
            guney: "Niğde (Merkez - Çiftlik / Derinkuyu Aksı)",
            bati: "Aksaray (Güzelyurt - Ihlara Vadisi - Sultanhanı)"
        },
        komsuIller: ["Kayseri", "Kırşehir", "Aksaray", "Niğde", "Yozgat"],
        fizikiSinirKomsulari: ["Kayseri", "Kırşehir", "Aksaray", "Niğde", "Yozgat"],
        sinirKomsulari: {
            "Ürgüp - İncesu": { ilce: "Ürgüp", komsuIl: "Kayseri (İncesu / D-300 Karayolu)", mesafeKm: 50, yol: "D-300" },
            "Derinkuyu - Niğde": { ilce: "Derinkuyu", komsuIl: "Niğde (Merkez / D-765)", mesafeKm: 50, yol: "D-765" },
            "Acıgöl - Aksaray": { ilce: "Acıgöl", komsuIl: "Aksaray (Merkez / D-300)", mesafeKm: 50, yol: "D-300" },
            "Hacıbektaş - Mucur": { ilce: "Hacıbektaş", komsuIl: "Kırşehir (Mucur / D-260)", mesafeKm: 25, yol: "D-260" },
            "Kozaklı - Boğazlıyan": { ilce: "Kozaklı", komsuIl: "Yozgat (Boğazlıyan / Termal Kaplıcalar)", mesafeKm: 30, yol: "50-02 İl Yolu" }
        },
        terrain: "duzluk",
        ucretler: { tam: 38, ogrenci: 22, yasli: 0 }
    },
    "Niğde": {
        plaka: "51",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 880,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-51"]->.nigde; (node["highway"="bus_stop"](area.nigde););`,
        coordinates: {
            dms: "37°58′N 34°40′E",
            enlemDms: "37°58′K",
            boylamDms: "34°40′D",
            lat: 37.9698,
            lon: 34.6766,
            rakimMetre: 1229,
            merkezeMesafeKm: 880,
            konumAciklamasi: "Toros Dağları ve Aladağlar Milli Parkı eteklerinde, Demirkazık Zirvesi, Roma dönemi Tyana Antik Su Kemerleri, Gümüşler Manastırı kaya kiliseleri, Tarihi Niğde Kalesi ve Saat Kulesi, elma bahçeleri, patates tarlaları, meşhur Niğde gazozu ve Aladağlar dağcılık rotalarıyla ünlü İç Anadolu kültür kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 880, "Çorlu": 845, "Çerkezköy": 830,
            "Ergene": 850, "Marmaraereğlisi": 865, "İstanbul": 750, "Ankara": 350,
            "Adana": 170, "Kayseri": 130, "Nevşehir": 85, "Aksaray": 110, "Konya": 240, "Mersin": 180,
            "Merkez": 2, "Bor": 14, "Çamardı": 68, "Ulukışla": 55, "Çiftlik": 65, "Altunhisar": 35
        },
        komsular: {
            kuzey: "Nevşehir (Derinkuyu) / Kayseri (İncesu - Yeşilhisar)",
            dogu: "Adana (Pozantı - Aladağ / Gülek Boğazı)",
            guney: "Mersin (Çamlıyayla - Tarsus / Bolkar Dağları)",
            bati: "Konya (Ereğli) / Aksaray (Güzelyurt - Ihlara)"
        },
        komsuIller: ["Kayseri", "Nevşehir", "Aksaray", "Konya", "Mersin", "Adana"],
        fizikiSinirKomsulari: ["Kayseri", "Nevşehir", "Aksaray", "Konya", "Mersin", "Adana"],
        sinirKomsulari: {
            "Ulukışla - Pozantı": { ilce: "Ulukışla", komsuIl: "Adana (Pozantı / Gülek Boğazı / O-21)", mesafeKm: 45, yol: "O-21 / D-750" },
            "Merkez - Derinkuyu": { ilce: "Merkez", komsuIl: "Nevşehir (Derinkuyu / Kapadokya / D-765)", mesafeKm: 50, yol: "D-765" },
            "Bor - Ereğli": { ilce: "Bor", komsuIl: "Konya (Ereğli / D-330)", mesafeKm: 55, yol: "D-330" },
            "Yeşilgölcük - Yeşilhisar": { ilce: "Merkez / Yeşilgölcük", komsuIl: "Kayseri (Yeşilhisar / D-805)", mesafeKm: 50, yol: "D-805" },
            "Altunhisar - Aksaray": { ilce: "Altunhisar", komsuIl: "Aksaray (Merkez / Hasan Dağı Yolu)", mesafeKm: 65, yol: "51-75 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 38, ogrenci: 22, yasli: 0 }
    },
    "Ordu": {
        plaka: "52",
        bolge: "Karadeniz",
        merkezeMesafeKm: 1010,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-52"]->.ordu; (node["highway"="bus_stop"](area.ordu););`,
        coordinates: {
            dms: "40°59′N 37°53′E",
            enlemDms: "40°59′K",
            boylamDms: "37°53′D",
            lat: 40.9862,
            lon: 37.8797,
            rakimMetre: 5,
            merkezeMesafeKm: 1010,
            konumAciklamasi: "Karadeniz'in oksijen deposu ve dünya fındık başkenti. Deniz üzerine inşa edilen Türkiye'nin ilk havalimanı Ordu-Giresun Havalimanı (OGU), Boztepe teleferiği ve doyumsuz şehir manzarası, Yason Burnu ve tarihi kilisesi, Çambaşı ve Perşembe menderes yaylaları, Ünye Kalesi ve Çakırtepe, Fatsa sahil kordonu, Ordu pidesi, fındığı ve taptaze deniz ürünleriyle tanınan Karadeniz incisi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1010, "Çorlu": 975, "Çerkezköy": 960,
            "Ergene": 980, "Marmaraereğlisi": 995, "İstanbul": 880, "Ankara": 560,
            "Samsun": 150, "Giresun": 45, "Trabzon": 180, "Tokat": 210, "Sivas": 230, "Amasya": 235,
            "Altınordu": 2, "Ünye": 62, "Fatsa": 40, "Perşembe": 15, "Gölköy": 65, "Aybastı": 90, "Mesudiye": 115
        },
        komsular: {
            kuzey: "Karadeniz (Perşembe - Ünye Sahil Şeridi)",
            dogu: "Giresun (Piraziz - Bulancak / OGU Havalimanı)",
            guney: "Sivas (Koyulhisar) / Tokat (Mesudiye - Reşadiye - Niksar)",
            bati: "Samsun (Terme - Çarşamba / D-010 Karadeniz Sahil Yolu)"
        },
        komsuIller: ["Samsun", "Giresun", "Tokat", "Sivas"],
        fizikiSinirKomsulari: ["Samsun", "Giresun", "Tokat", "Sivas"],
        sinirKomsulari: {
            "Gülyalı - Piraziz": { ilce: "Gülyalı", komsuIl: "Giresun (Piraziz / OGU Havalimanı Sahil Yolu)", mesafeKm: 15, yol: "D-010 Karadeniz Sahil Yolu" },
            "Ünye - Terme": { ilce: "Ünye", komsuIl: "Samsun (Terme / Çarşamba / D-010)", mesafeKm: 30, yol: "D-010 Karadeniz Sahil Yolu" },
            "Mesudiye - Koyulhisar": { ilce: "Mesudiye", komsuIl: "Sivas (Koyulhisar / D-100 Karadeniz-Akdeniz Yolu)", mesafeKm: 45, yol: "D-855" },
            "Aybastı - Reşadiye": { ilce: "Aybastı", komsuIl: "Tokat (Reşadiye / Perşembe Yaylası Aksı)", mesafeKm: 50, yol: "52-53 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 42, ogrenci: 24, yasli: 0 }
    },
    "Rize": {
        plaka: "53",
        bolge: "Karadeniz",
        merkezeMesafeKm: 1230,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-53"]->.rize; (node["highway"="bus_stop"](area.rize););`,
        coordinates: {
            dms: "41°01′N 40°31′E",
            enlemDms: "41°01′K",
            boylamDms: "41°31′D",
            lat: 41.0201,
            lon: 40.5234,
            rakimMetre: 10,
            merkezeMesafeKm: 1230,
            konumAciklamasi: "Türkiye'nin çay başkenti ve zümrüt yeşili doğa harikası. Kaçkar Dağları Milli Parkı, Ayder Yaylası, Pokut ve Huser Yaylası bulut denizleri, Fırtına Deresi ve tarihi kemer köprüleri, Zilkale ve Palovit Şelalesi, Çamlıhemşin vadileri, Rize Kalesi, Rize simidi, muhlaması ve Anzer balıyla tanınan Doğu Karadeniz masalı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1230, "Çorlu": 1195, "Çerkezköy": 1180,
            "Ergene": 1200, "Marmaraereğlisi": 1215, "İstanbul": 1100, "Ankara": 780,
            "Trabzon": 75, "Artvin": 95, "Erzurum": 210, "Bayburt": 180, "Giresun": 210,
            "Merkez": 2, "Çayeli": 18, "Ardeşen": 45, "Pazar": 37, "Fındıklı": 62, "Çamlıhemşin": 65, "İkizdere": 52
        },
        komsular: {
            kuzey: "Karadeniz (Çayeli - Pazar - Fındıklı Sahili)",
            dogu: "Artvin (Arhavi - Hopa / Fındıklı Sınırı)",
            guney: "Erzurum (İspir / Ovit Tüneli 14.3km) / Bayburt",
            bati: "Trabzon (Of - Hayrat / İyidere Köprüsü)"
        },
        komsuIller: ["Trabzon", "Artvin", "Erzurum", "Bayburt"],
        fizikiSinirKomsulari: ["Trabzon", "Artvin", "Erzurum", "Bayburt"],
        sinirKomsulari: {
            "İyidere - Of": { ilce: "İyidere", komsuIl: "Trabzon (Of / Sahil Yolu Köprüsü)", mesafeKm: 12, yol: "D-010 Karadeniz Sahil Yolu" },
            "Fındıklı - Arhavi": { ilce: "Fındıklı", komsuIl: "Artvin (Arhavi / Hopa Sahil Yolu)", mesafeKm: 15, yol: "D-010 Karadeniz Sahil Yolu" },
            "İkizdere - İspir": { ilce: "İkizdere", komsuIl: "Erzurum (İspir / Ovit Tüneli 14.3km)", mesafeKm: 55, yol: "D-925 / Ovit Tüneli" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Sakarya": {
        plaka: "54",
        bolge: "Marmara",
        merkezeMesafeKm: 285,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-54"]->.sakarya; (node["highway"="bus_stop"](area.sakarya););`,
        coordinates: {
            dms: "40°46′N 30°24′E",
            enlemDms: "40°46′K",
            boylamDms: "30°24′D",
            lat: 40.7731,
            lon: 30.4042,
            rakimMetre: 35,
            merkezeMesafeKm: 285,
            konumAciklamasi: "Marmara ile Karadeniz'in buluştuğu bereketli Sakarya Nehri deltası. Doğa harikası Sapanca Gölü, Tarihi Justinianos (Beşköprü) Köprüsü, Acarlar Longozu (Türkiye'nin en büyük tek parça subasar ormanı), Karasu Karadeniz sahili, Taraklı Osmanlı evleri, Çark Caddesi, Islama Köftesi ve kabak tatlısıyla ünlü stratejik kavşak şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 285, "Çorlu": 250, "Çerkezköy": 235,
            "Ergene": 255, "Marmaraereğlisi": 270, "İstanbul": 135, "Ankara": 310,
            "Kocaeli": 35, "Bolu": 115, "Düzce": 70, "Bilecik": 100, "Bursa": 165, "Yalova": 85,
            "Adapazarı": 2, "Serdivan": 4, "Erenler": 5, "Hendek": 35, "Akyazı": 30, "Karasu": 55, "Sapanca": 20, "Geyve": 35, "Taraklı": 65
        },
        komsular: {
            kuzey: "Karadeniz (Karasu - Kocaali Sahili)",
            dogu: "Düzce (Akçakoca - Gümüşova) / Bolu (Göynük - Mudurnu)",
            guney: "Bilecik (Osmaneli - Gölpazarı) / Bursa (İznik)",
            bati: "Kocaeli (Kartepe - Kandıra)"
        },
        komsuIller: ["Kocaeli", "Düzce", "Bolu", "Bilecik", "Bursa"],
        fizikiSinirKomsulari: ["Kocaeli", "Düzce", "Bolu", "Bilecik", "Bursa"],
        sinirKomsulari: {
            "Sapanca - Kartepe": { ilce: "Sapanca", komsuIl: "Kocaeli (Kartepe / İzmit / O-4)", mesafeKm: 20, yol: "O-4 / D-100" },
            "Hendek - Gümüşova": { ilce: "Hendek", komsuIl: "Düzce (Gümüşova / Düzce Merkez / D-100)", mesafeKm: 30, yol: "D-100 / O-4" },
            "Pamukova - Osmaneli": { ilce: "Pamukova", komsuIl: "Bilecik (Osmaneli / Vezirhan / D-650)", mesafeKm: 25, yol: "D-650" },
            "Karasu - Kaynarca - Kandıra": { ilce: "Kaynarca", komsuIl: "Kocaeli (Kandıra / D-020)", mesafeKm: 30, yol: "D-020" },
            "Taraklı - Göynük": { ilce: "Taraklı", komsuIl: "Bolu (Göynük / Tarihi İpekyolu)", mesafeKm: 30, yol: "D-160" }
        },
        terrain: "duzluk",
        ucretler: { tam: 30, ogrenci: 18, yasli: 0 }
    },
    "Samsun": {
        plaka: "55",
        bolge: "Karadeniz",
        merkezeMesafeKm: 860,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-55"]->.samsun; (node["highway"="bus_stop"](area.samsun););`,
        coordinates: {
            dms: "41°17′N 36°20′E",
            enlemDms: "41°17′K",
            boylamDms: "36°20′D",
            lat: 41.2867,
            lon: 36.33,
            rakimMetre: 15,
            merkezeMesafeKm: 860,
            konumAciklamasi: "Milli Mücadele'nin ilk adım şehri ve Karadeniz'in en büyük metropolü. Gazi Mustafa Kemal Atatürk'ün 19 Mayıs 1919'da karaya çıktığı Tütün İskelesi, Onur Anıtı, Bandırma Vapuru Müzesi, Kızılırmak Deltası Kuş Cenneti, Şahinkaya Kanyonu, Bafra ve Çarşamba verimli ovaları, Atakum Sahil Kordonu, Bafra pidesi, Terme pidesi ve Samsun simidiyle tanınan Karadeniz başkenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 860, "Çorlu": 825, "Çerkezköy": 810,
            "Ergene": 830, "Marmaraereğlisi": 845, "İstanbul": 735, "Ankara": 410,
            "Sinop": 155, "Çorum": 172, "Amasya": 130, "Ordu": 150, "Tokat": 220, "Kastamonu": 335,
            "İlkadım": 2, "Atakum": 6, "Canik": 4, "Bafra": 50, "Çarşamba": 35, "Vezirköprü": 115, "Terme": 58, "Havza": 85
        },
        komsular: {
            kuzey: "Karadeniz (Atakum - Bafra - Çarşamba Sahili)",
            dogu: "Ordu (Ünye - Fatsa / Karadeniz Sahil Yolu)",
            guney: "Amasya (Ladik - Kavak) / Tokat (Salıpazarı - Ayvacık)",
            bati: "Çorum (Havza - Vezirköprü) / Sinop (Alaçam - Yakakent)"
        },
        komsuIller: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"],
        fizikiSinirKomsulari: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"],
        sinirKomsulari: {
            "Yakakent - Gerze": { ilce: "Yakakent", komsuIl: "Sinop (Gerze / Sinop Merkez / D-010)", mesafeKm: 55, yol: "D-010 Karadeniz Sahil Yolu" },
            "Terme - Ünye": { ilce: "Terme", komsuIl: "Ordu (Ünye / D-010 Karadeniz Sahil Yolu)", mesafeKm: 30, yol: "D-010 Karadeniz Sahil Yolu" },
            "Havza - Merzifon": { ilce: "Havza", komsuIl: "Amasya (Merzifon / D-100 Kavşağı)", mesafeKm: 25, yol: "D-100 / E80" },
            "Havza - Vezirköprü - Çorum": { ilce: "Vezirköprü", komsuIl: "Çorum (Osmancık / Kargı)", mesafeKm: 75, yol: "D-030" }
        },
        terrain: "sahil",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },
    "Siirt": {
        plaka: "56",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1680,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-56"]->.siirt; (node["highway"="bus_stop"](area.siirt););`,
        coordinates: {
            dms: "37°56′N 41°57′E",
            enlemDms: "37°56′K",
            boylamDms: "41°57′D",
            lat: 37.9274,
            lon: 41.942,
            rakimMetre: 895,
            merkezeMesafeKm: 1680,
            konumAciklamasi: "Botan Çayı Kanyonu ve tarihi köprüleriyle Güneydoğu'nun ilim ve veliler kenti. Tillo (Aydınlar) İbrahim Hakkı Hazretleri ve Işık Hadisesi Türbesi, Veysel Karani Türbesi (Baykan), Deliklitaş (Rasıl Hacar) Kanyonu cam terası, Tarihi Siirt Saat Kulesi, Ulu Cami, meşhur Siirt Büryan kebabı, Siirt fıstığı, Pervari karakovan balı ve el dokuma Siirt battaniyesiyle bilinen kadim kültür merkezi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1680, "Çorlu": 1645, "Çerkezköy": 1630,
            "Ergene": 1650, "Marmaraereğlisi": 1665, "İstanbul": 1550, "Ankara": 1150,
            "Batman": 85, "Bitlis": 95, "Mardin": 230, "Şırnak": 100, "Van": 250, "Diyarbakır": 180,
            "Merkez": 2, "Kurtalan": 30, "Baykan": 48, "Tillo": 10, "Pervari": 90, "Eruh": 55, "Şirvan": 35
        },
        komsular: {
            kuzey: "Bitlis (Baykan / Bitlis Deresi / Ziyaret)",
            dogu: "Van (Pervari - Çatak / Müküs Çayı)",
            guney: "Şırnak (Eruh - Güçlükonak / Botan Vadisi)",
            bati: "Batman (Kurtalan - Beşiri / Kozluk)"
        },
        komsuIller: ["Batman", "Bitlis", "Şırnak", "Van"],
        fizikiSinirKomsulari: ["Batman", "Bitlis", "Şırnak", "Van"],
        sinirKomsulari: {
            "Kurtalan - Beşiri": { ilce: "Kurtalan", komsuIl: "Batman (Beşiri / Batman Merkez / D-370)", mesafeKm: 45, yol: "D-370" },
            "Baykan - Bitlis": { ilce: "Baykan", komsuIl: "Bitlis (Merkez / Veysel Karani / D-965)", mesafeKm: 50, yol: "D-965" },
            "Eruh - Şırnak": { ilce: "Eruh", komsuIl: "Şırnak (Merkez / Meşindağı Geçidi)", mesafeKm: 55, yol: "D-370" },
            "Pervari - Çatak": { ilce: "Pervari", komsuIl: "Van (Çatak / Bahçesaray Yolu)", mesafeKm: 85, yol: "56-02 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 48, ogrenci: 26, yasli: 0 }
    },
    "Sivas": {
        plaka: "58",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 975,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-58"]->.sivas; (node["highway"="bus_stop"](area.sivas););`,
        coordinates: {
            dms: "39°45′N 37°01′E",
            enlemDms: "39°45′K",
            boylamDms: "37°01′D",
            lat: 39.7505,
            lon: 37.015,
            rakimMetre: 1285,
            merkezeMesafeKm: 975,
            konumAciklamasi: "Türkiye'nin yüzölçümü bakımından ikinci büyük ili ve Cumhuriyet'in temellerinin atıldığı kongre şehri. UNESCO Dünya Mirası Divriği Ulu Camii ve Darüşşifası, Tarihi Çifte Minareli Medrese, Buruciye Medresesi, Şifahiye Medresesi, Gök Medrese, Sivas Kongre Müzesi, dünyaca ünlü Kangal Çoban Köpeği ve Balıklı Kaplıcaları, Gürün Gökpınar Gölü turkuaz cenneti, Sivas köftesi, pezik turşusu ve madımak yemeğiyle tanınan Selçuklu payitahtı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 975, "Çorlu": 940, "Çerkezköy": 925,
            "Ergene": 945, "Marmaraereğlisi": 960, "İstanbul": 845, "Ankara": 440,
            "Kayseri": 195, "Malatya": 245, "Erzincan": 250, "Tokat": 105, "Yozgat": 220, "Giresun": 270, "Ordu": 230, "Kahramanmaraş": 320,
            "Merkez": 2, "Şarkışla": 80, "Yıldızeli": 45, "Suşehri": 130, "Zara": 70, "Gemerek": 115, "Kangal": 85, "Divriği": 175, "Gürün": 135
        },
        komsular: {
            kuzey: "Tokat (Çamlıbel Geçidi 1650m) / Ordu (Koyulhisar) / Giresun (Şebinkarahisar)",
            dogu: "Erzincan (Refahiye - İliç / Kızıldağ Geçidi 2190m)",
            guney: "Malatya (Hekimhan - Darende) / Kahramanmaraş (Göksun)",
            bati: "Yozgat (Akdağmadeni) / Kayseri (Gemerek - Sarıoğlan)"
        },
        komsuIller: ["Kayseri", "Yozgat", "Tokat", "Ordu", "Giresun", "Erzincan", "Malatya", "Kahramanmaraş"],
        fizikiSinirKomsulari: ["Kayseri", "Yozgat", "Tokat", "Ordu", "Giresun", "Erzincan", "Malatya", "Kahramanmaraş"],
        sinirKomsulari: {
            "Merkez - Tokat": { ilce: "Merkez / Yıldızeli", komsuIl: "Tokat (Çamlıbel Geçidi 1650m / D-850)", mesafeKm: 105, yol: "D-850" },
            "İmranlı - Refahiye": { ilce: "İmranlı", komsuIl: "Erzincan (Refahiye / Kızıldağ Geçidi 2190m / D-100)", mesafeKm: 85, yol: "D-100 / E80" },
            "Gemerek - Kayseri": { ilce: "Gemerek", komsuIl: "Kayseri (Sarıoğlan / D-260)", mesafeKm: 65, yol: "D-260" },
            "Kangal - Hekimhan": { ilce: "Kangal", komsuIl: "Malatya (Hekimhan / D-850)", mesafeKm: 85, yol: "D-850" },
            "Gürün - Darende": { ilce: "Gürün", komsuIl: "Malatya (Darende / Tohma Kanyonu / D-300)", mesafeKm: 45, yol: "D-300" },
            "Suşehri - Şebinkarahisar": { ilce: "Suşehri", komsuIl: "Giresun (Şebinkarahisar / D-865)", mesafeKm: 55, yol: "D-865" }
        },
        terrain: "daglik",
        ucretler: { tam: 42, ogrenci: 24, yasli: 0 }
    },
    "Tokat": {
        plaka: "60",
        bolge: "Karadeniz",
        merkezeMesafeKm: 910,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-60"]->.tokat; (node["highway"="bus_stop"](area.tokat););`,
        coordinates: {
            dms: "40°19′N 36°33′E",
            enlemDms: "40°19′K",
            boylamDms: "36°33′D",
            lat: 40.3167,
            lon: 36.55,
            rakimMetre: 630,
            merkezeMesafeKm: 910,
            konumAciklamasi: "Yeşilırmak havzasında 14 devlete ev sahipliği yapmış 900 adımda 900 yıllık tarihe tanık olunan kültür kenti. Milyonlarca yıllık sarkıtlarıyla dünya harikası Ballıca Mağarası, Almus Baraj Gölü ve yeşil koyları, Tarihi Tokat Kalesi, Latifoğlu Konağı, Tarihi Taşhan, Mahperi Hatun Kervansarayı, Niksar Kalesi, Tokat kebabı, meşhur Erbaa asma yaprağı, cevizli çöreği ve el baskısı Tokat yazmalarıyla ünlü Anadolu hazinesi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 910, "Çorlu": 875, "Çerkezköy": 860,
            "Ergene": 880, "Marmaraereğlisi": 895, "İstanbul": 780, "Ankara": 380,
            "Amasya": 115, "Sivas": 105, "Samsun": 220, "Ordu": 210, "Yozgat": 200, "Çorum": 180,
            "Merkez": 2, "Erbaa": 80, "Turhal": 45, "Niksar": 50, "Zile": 65, "Reşadiye": 90, "Almus": 35, "Pazar": 28
        },
        komsular: {
            kuzey: "Samsun (Terme - Asarcık) / Ordu (Akkuş - Korgan)",
            dogu: "Ordu (Mesudiye) / Sivas (Koyulhisar - Suşehri)",
            guney: "Sivas (Yıldızeli - Çamlıbel Geçidi 1650m)",
            bati: "Amasya (Taşova - Merkez) / Yozgat (Kadışehri - Aydıncık)"
        },
        komsuIller: ["Amasya", "Sivas", "Samsun", "Ordu", "Yozgat"],
        fizikiSinirKomsulari: ["Amasya", "Sivas", "Samsun", "Ordu", "Yozgat"],
        sinirKomsulari: {
            "Merkez - Çamlıbel - Sivas": { ilce: "Merkez", komsuIl: "Sivas (Yıldızeli / Çamlıbel Geçidi 1650m / D-850)", mesafeKm: 105, yol: "D-850" },
            "Turhal - Amasya": { ilce: "Turhal", komsuIl: "Amasya (Merkez / Yeşilırmak Vadisi / D-180)", mesafeKm: 70, yol: "D-180" },
            "Erbaa - Taşova": { ilce: "Erbaa", komsuIl: "Amasya (Taşova / D-100)", mesafeKm: 25, yol: "D-100" },
            "Niksar - Akkuş": { ilce: "Niksar", komsuIl: "Ordu (Akkuş / Ünye Aksı)", mesafeKm: 55, yol: "D-850" },
            "Zile - Çekerek": { ilce: "Zile", komsuIl: "Yozgat (Çekerek / Kadışehri)", mesafeKm: 45, yol: "60-51 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 38, ogrenci: 22, yasli: 0 }
    },
    "Trabzon": {
        plaka: "61",
        bolge: "Karadeniz",
        merkezeMesafeKm: 1150,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-61"]->.trabzon; (node["highway"="bus_stop"](area.trabzon););`,
        coordinates: {
            dms: "41°00′N 39°43′E",
            enlemDms: "41°00′K",
            boylamDms: "39°43′D",
            lat: 41.0027,
            lon: 39.7168,
            rakimMetre: 30,
            merkezeMesafeKm: 1150,
            konumAciklamasi: "Karadeniz'in kadim ticaret ve liman kenti, Doğu Karadeniz'in kalbi. Sarp kayalıklara kurulu dünyaca ünlü Sümela Manastırı (Meryem Ana), dağların eteğinde zümrüt ayna Uzungöl, Atatürk Köşkü, Trabzon Ayasofyası Müzesi, Boztepe panoramik manzarası, Zigana Tüneli kuzey çıkışı, Tarihi Kemeraltı, Trabzon burması ve hasırı, Akçaabat köftesi, Hamsiköy fırın sütlacı, Vakfıkebir taş fırın ekmeği ve Sürmene bıçaklarıyla tanınan efsanevi Karadeniz başkenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1150, "Çorlu": 1115, "Çerkezköy": 1100,
            "Ergene": 1120, "Marmaraereğlisi": 1135, "İstanbul": 1025, "Ankara": 740,
            "Rize": 75, "Giresun": 135, "Gümüşhane": 100, "Bayburt": 140, "Ordu": 180, "Erzurum": 265,
            "Ortahisar": 2, "Akçaabat": 15, "Araklı": 30, "Of": 52, "Yomra": 14, "Vakfıkebir": 45, "Sürmene": 38, "Maçka": 28, "Çaykara": 75
        },
        komsular: {
            kuzey: "Karadeniz (Ortahisar - Akçaabat - Of Sahil Şeridi)",
            dogu: "Rize (İyidere - Derepazarı Sahil Aksı)",
            guney: "Gümüşhane (Maçka / Yeni Zigana Tüneli 14.5km) / Bayburt (Çaykara - Soğanlı)",
            bati: "Giresun (Beşikdüzü - Eynesil Sahil Sınırı)"
        },
        komsuIller: ["Rize", "Giresun", "Gümüşhane", "Bayburt"],
        fizikiSinirKomsulari: ["Rize", "Giresun", "Gümüşhane", "Bayburt"],
        sinirKomsulari: {
            "Of - İyidere": { ilce: "Of", komsuIl: "Rize (İyidere / Rize Merkez / D-010)", mesafeKm: 12, yol: "D-010 Karadeniz Sahil Yolu" },
            "Beşikdüzü - Eynesil": { ilce: "Beşikdüzü", komsuIl: "Giresun (Eynesil / Görele Sahil Yolu)", mesafeKm: 12, yol: "D-010 Karadeniz Sahil Yolu" },
            "Maçka - Torul": { ilce: "Maçka", komsuIl: "Gümüşhane (Torul / Yeni Zigana Tüneli 14.5km)", mesafeKm: 35, yol: "D-885 / Yeni Zigana Tüneli" },
            "Çaykara - Aydıntepe": { ilce: "Çaykara", komsuIl: "Bayburt (Aydıntepe / Soğanlı Geçidi)", mesafeKm: 65, yol: "D-915" }
        },
        terrain: "daglik",
        ucretler: { tam: 40, ogrenci: 24, yasli: 0 }
    },
    "Tunceli": {
        plaka: "62",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1340,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-62"]->.tunceli; (node["highway"="bus_stop"](area.tunceli););`,
        coordinates: {
            dms: "39°06′N 39°32′E",
            enlemDms: "39°06′K",
            boylamDms: "39°32′D",
            lat: 39.1081,
            lon: 39.5401,
            rakimMetre: 915,
            merkezeMesafeKm: 1340,
            konumAciklamasi: "Munzur Vadisi Milli Parkı, gürül gürül akan kutsal Munzur Gözeleri, Pülümür Vadisi ve Ağlayan Kayalar, sarp kanyonlar, Ovacık kayak merkezi, Düzgün Baba Türbesi, Pertek Kalesi (Keban Baraj Gölü adası feribot geçişi), Munzur alabalığı, Şavak tulum peyniri ve zengin endemik doğasıyla tanınan doğa harikası."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1340, "Çorlu": 1305, "Çerkezköy": 1290,
            "Ergene": 1310, "Marmaraereğlisi": 1325, "İstanbul": 1210, "Ankara": 820,
            "Elazığ": 135, "Erzincan": 135, "Bingöl": 145, "Malatya": 235, "Erzurum": 270,
            "Merkez": 2, "Pertek": 50, "Mazgirt": 35, "Ovacık": 60, "Pülümür": 65, "Hozat": 45, "Nazımiye": 35
        },
        komsular: {
            kuzey: "Erzincan (Pülümür - Ovacık / Mercan Dağları)",
            dogu: "Bingöl (Nazımiye - Kiğı Vadisi)",
            guney: "Elazığ (Pertek - Mazgirt / Keban Baraj Gölü Feribotu)",
            bati: "Erzincan (İliç - Kemaliye)"
        },
        komsuIller: ["Erzincan", "Elazığ", "Bingöl"],
        fizikiSinirKomsulari: ["Erzincan", "Elazığ", "Bingöl"],
        sinirKomsulari: {
            "Pülümür - Merkez": { ilce: "Pülümür", komsuIl: "Erzincan (Merkez / Pülümür Kanyonu / D-885)", mesafeKm: 65, yol: "D-885" },
            "Pertek - Elazığ": { ilce: "Pertek", komsuIl: "Elazığ (Merkez / Keban Barajı Feribot Geçişi)", mesafeKm: 30, yol: "D-885 / Feribot" },
            "Nazımiye - Bingöl": { ilce: "Nazımiye", komsuIl: "Bingöl (Yayladere / Kiğı)", mesafeKm: 60, yol: "62-02 İl Yolu" }
        },
        terrain: "daglik",
        ucretler: { tam: 45, ogrenci: 25, yasli: 0 }
    },
    "Şanlıurfa": {
        plaka: "63",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1380,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-63"]->.sanliurfa; (node["highway"="bus_stop"](area.sanliurfa););`,
        coordinates: {
            dms: "37°10′N 38°47′E",
            enlemDms: "37°10′K",
            boylamDms: "38°47′D",
            lat: 37.1674,
            lon: 38.7955,
            rakimMetre: 518,
            merkezeMesafeKm: 1380,
            konumAciklamasi: "Peygamberler şehri ve insanlık tarihinin sıfır noktası. 12 bin yıllık geçmişiyle dünyanın bilinen en eski tapınak kompleksi Göbeklitepe, Karahantepe, Tarihi Balıklıgöl (Halil-ür Rahman ve Aynzeliha Gölleri), Şanlıurfa Kalesi, konik kubbeli Harran Kümbet Evleri ve dünyanın ilk İslam üniversitesi kalıntıları, Fırat Nehri kıyısında batık şehir Halfeti, Birecik kelaynak kuşları koruma istasyonu, çiğ köftesi, Urfa kebabı, lahmacunu ve sıra geceleriyle ünlü kadim medeniyet beşiği."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1380, "Çorlu": 1345, "Çerkezköy": 1330,
            "Ergene": 1350, "Marmaraereğlisi": 1365, "İstanbul": 1250, "Ankara": 820,
            "Gaziantep": 140, "Diyarbakır": 180, "Mardin": 190, "Adıyaman": 110, "Batman": 240, "Kahramanmaraş": 220,
            "Eyyübiye": 3, "Haliliye": 2, "Karaköprü": 5, "Siverek": 85, "Viranşehir": 90, "Birecik": 80, "Harran": 45, "Halfeti": 110, "Ceylanpınar": 140
        },
        komsular: {
            kuzey: "Adıyaman (Bozova - Hilvan / Atatürk Barajı) / Diyarbakır (Siverek / Karacadağ)",
            dogu: "Mardin (Viranşehir - Ceylanpınar İpekyolu)",
            guney: "Suriye Sınırı (Akçakale - Ceylanpınar Sınır Kapıları)",
            bati: "Gaziantep (Birecik / Fırat Köprüsü - Nizip)"
        },
        komsuIller: ["Gaziantep", "Adıyaman", "Diyarbakır", "Mardin"],
        fizikiSinirKomsulari: ["Gaziantep", "Adıyaman", "Diyarbakır", "Mardin"],
        sinirKomsulari: {
            "Birecik - Nizip": { ilce: "Birecik", komsuIl: "Gaziantep (Nizip / Fırat Köprüsü / O-52)", mesafeKm: 30, yol: "O-52 / D-400" },
            "Siverek - Diyarbakır": { ilce: "Siverek", komsuIl: "Diyarbakır (Merkez / Karacadağ Geçişi / D-360)", mesafeKm: 85, yol: "D-360" },
            "Viranşehir - Kızıltepe": { ilce: "Viranşehir", komsuIl: "Mardin (Kızıltepe / D-400 Tarihi İpekyolu)", mesafeKm: 75, yol: "D-400" },
            "Bozova - Adıyaman": { ilce: "Bozova", komsuIl: "Adıyaman (Merkez / Atatürk Barajı Yolu)", mesafeKm: 65, yol: "D-875" }
        },
        terrain: "duzluk",
        ucretler: { tam: 40, ogrenci: 24, yasli: 0 }
    },
    "Uşak": {
        plaka: "64",
        bolge: "Ege",
        merkezeMesafeKm: 500,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-64"]->.usak; (node["highway"="bus_stop"](area.usak););`,
        coordinates: {
            dms: "38°41′N 29°24′E",
            enlemDms: "38°41′K",
            boylamDms: "29°24′D",
            lat: 38.6823,
            lon: 29.4082,
            rakimMetre: 910,
            merkezeMesafeKm: 500,
            konumAciklamasi: "İlkler şehri ve dünya harikası kanyonlar diyarı. Grand Canyon'dan sonra dünyanın en uzun ikinci kanyonu olan Ulubey Kanyonu ve cam terası, Lidya dönemine ait efsanevi Karun Hazineleri ve Kanatlı Denizatı Broşu, Tarihi Cilandiras Köprüsü, Blaundos Antik Kenti, Taşyaran Vadisi jeolojik kaya oluşumları, meşhur Uşak tarhanası, el dokuma Uşak halı ve kilimleri ve Türkiye'nin ilk şeker fabrikasıyla tanınan cumhuriyet kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 500, "Çorlu": 465, "Çerkezköy": 450,
            "Ergene": 470, "Marmaraereğlisi": 485, "İstanbul": 370, "Ankara": 370,
            "İzmir": 210, "Afyonkarahisar": 115, "Kütahya": 140, "Manisa": 195, "Denizli": 150, "Eskişehir": 210,
            "Merkez": 2, "Banaz": 32, "Eşme": 64, "Sivaslı": 35, "Ulubey": 30, "Karahallı": 65
        },
        komsular: {
            kuzey: "Kütahya (Gediz - Şaphane)",
            dogu: "Afyonkarahisar (Hocalar - Sinanpaşa / D-300)",
            guney: "Denizli (Çivril - Bekilli - Güney)",
            bati: "Manisa (Kula - Selendi - Sarıgöl)"
        },
        komsuIller: ["Kütahya", "Afyonkarahisar", "Denizli", "Manisa"],
        fizikiSinirKomsulari: ["Kütahya", "Afyonkarahisar", "Denizli", "Manisa"],
        sinirKomsulari: {
            "Banaz - Afyonkarahisar": { ilce: "Banaz", komsuIl: "Afyonkarahisar (Merkez / Sinanpaşa / D-300)", mesafeKm: 85, yol: "D-300 / E96" },
            "Merkez - Kula": { ilce: "Merkez", komsuIl: "Manisa (Kula / Gediz Kanyonu / D-300)", mesafeKm: 75, yol: "D-300 / E96" },
            "Merkez - Gediz": { ilce: "Merkez", komsuIl: "Kütahya (Gediz / D-240)", mesafeKm: 65, yol: "D-240" },
            "Sivaslı - Çivril": { ilce: "Sivaslı", komsuIl: "Denizli (Çivril / Işıklı Gölü)", mesafeKm: 45, yol: "D-595" }
        },
        terrain: "duzluk",
        ucretler: { tam: 32, ogrenci: 19, yasli: 0 }
    },
    "Van": {
        plaka: "65",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1690,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-65"]->.van; (node["highway"="bus_stop"](area.van););`,
        coordinates: {
            dms: "38°29′N 43°24′E",
            enlemDms: "38°29′K",
            boylamDms: "43°24′D",
            lat: 38.4891,
            lon: 43.4089,
            rakimMetre: 1730,
            merkezeMesafeKm: 1690,
            konumAciklamasi: "Doğu'nun incisi ve Urartu Krallığı'nın kadim başkenti Tuşba. Türkiye'nin en büyük gölü olan Van Gölü (Van Denizi), göl ortasındaki tarihi Akdamar Adası ve Anıt Müze Kilisesi, görkemli sarp kaya kütlesi üzerindeki Tarihi Van Kalesi, Muradiye Şelalesi, Hoşap Kalesi, Çavuştepe Urartu Kalesi, farklı renkte gözleri ve ipeksi tüyleriyle Van Kedisi, meşhur Van otlu peyniri, zengin Van kahvaltısı ve inci kefali göçüyle bilinen büyüleyici doğu metropolü."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1690, "Çorlu": 1655, "Çerkezköy": 1640,
            "Ergene": 1660, "Marmaraereğlisi": 1675, "İstanbul": 1560, "Ankara": 1180,
            "Bitlis": 160, "Ağrı": 230, "Hakkâri": 200, "Siirt": 250, "Muş": 240, "Erzurum": 390,
            "İpekyolu": 2, "Tuşba": 3, "Edremit": 15, "Erciş": 100, "Muradiye": 85, "Gevaş": 40, "Başkale": 115, "Çaldıran": 110
        },
        komsular: {
            kuzey: "Ağrı (Patnos - Doğubayazıt / Çaldıran Tendürek)",
            dogu: "İran Sınırı (Kapıköy Sınır Kapısı / Razi Aksı)",
            guney: "Hakkâri (Başkale - Yüksekova / Güzeldere Geçidi 2730m) / Şırnak",
            bati: "Bitlis (Tatvan - Adilcevaz / Van Gölü Havzası) / Siirt (Pervari)"
        },
        komsuIller: ["Bitlis", "Ağrı", "Hakkâri", "Siirt", "Şırnak"],
        fizikiSinirKomsulari: ["Bitlis", "Ağrı", "Hakkâri", "Siirt", "Şırnak"],
        sinirKomsulari: {
            "Gevaş - Tatvan": { ilce: "Gevaş", komsuIl: "Bitlis (Tatvan / Kuskunkıran Tüneli / D-300)", mesafeKm: 90, yol: "D-300" },
            "Başkale - Yüksekova": { ilce: "Başkale", komsuIl: "Hakkâri (Yüksekova / Güzeldere Geçidi 2730m)", mesafeKm: 80, yol: "D-975" },
            "Çaldıran - Doğubayazıt": { ilce: "Çaldıran", komsuIl: "Ağrı (Doğubayazıt / Tendürek Geçidi)", mesafeKm: 65, yol: "D-975" },
            "Erciş - Patnos": { ilce: "Erciş", komsuIl: "Ağrı (Patnos / Süphan Dağı Eteği)", mesafeKm: 55, yol: "D-280" }
        },
        terrain: "daglik",
        ucretler: { tam: 50, ogrenci: 28, yasli: 0 }
    },
    "Yozgat": {
        plaka: "66",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 770,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-66"]->.yozgat; (node["highway"="bus_stop"](area.yozgat););`,
        coordinates: {
            dms: "39°49′N 34°48′E",
            enlemDms: "39°49′K",
            boylamDms: "34°48′D",
            lat: 39.8181,
            lon: 34.8147,
            rakimMetre: 1300,
            merkezeMesafeKm: 770,
            konumAciklamasi: "Bozok Yaylası'nın kalbinde yer alan yiğitler diyarı. Türkiye'nin ilk milli parkı olan Yozgat Çamlığı Milli Parkı, Tarihi Yozgat Saat Kulesi, Çapanoğlu Büyük Camii, Roma dönemi Basilica Therma (Kral Kızı Hamamı - Sarıkaya), Çeper Höyük ve Hitit kalıntıları, meşhur Yozgat Testi Kebabı, arabaşı çorbası ve hamuru, parmak çöreği ve zengin ozanlık kültürüyle tanınan İç Anadolu kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 770, "Çorlu": 735, "Çerkezköy": 720,
            "Ergene": 740, "Marmaraereğlisi": 755, "İstanbul": 640, "Ankara": 215,
            "Sivas": 220, "Kayseri": 175, "Çorum": 108, "Kırşehir": 110, "Kırıkkale": 140, "Amasya": 190, "Tokat": 200,
            "Merkez": 2, "Sorgun": 35, "Akdağmadeni": 105, "Yerköy": 40, "Boğazlıyan": 90, "Sarıkaya": 75, "Çekerek": 90
        },
        komsular: {
            kuzey: "Çorum (Alaca - Boğazkale / Hattuşa) / Amasya",
            dogu: "Sivas (Yıldızeli - Akdağmadeni) / Tokat (Zile - Kadışehri)",
            guney: "Kayseri (Boğazlıyan - Felahiye) / Nevşehir",
            bati: "Kırşehir (Çiçekdağı - Yerköy) / Kırıkkale (Delice)"
        },
        komsuIller: ["Çorum", "Amasya", "Tokat", "Sivas", "Kayseri", "Nevşehir", "Kırşehir", "Kırıkkale"],
        fizikiSinirKomsulari: ["Çorum", "Amasya", "Tokat", "Sivas", "Kayseri", "Nevşehir", "Kırşehir", "Kırıkkale"],
        sinirKomsulari: {
            "Yerköy - Kırıkkale": { ilce: "Yerköy", komsuIl: "Kırıkkale (Delice / D-200 Trans-Avrupa)", mesafeKm: 55, yol: "D-200 / E88" },
            "Akdağmadeni - Yıldızeli": { ilce: "Akdağmadeni", komsuIl: "Sivas (Yıldızeli / D-200)", mesafeKm: 70, yol: "D-200 / E88" },
            "Merkez - Alaca": { ilce: "Merkez", komsuIl: "Çorum (Alaca / D-795)", mesafeKm: 50, yol: "D-795" },
            "Boğazlıyan - Kayseri": { ilce: "Boğazlıyan", komsuIl: "Kayseri (Kocasinan / D-805)", mesafeKm: 80, yol: "D-805" },
            "Yerköy - Çiçekdağı": { ilce: "Yerköy", komsuIl: "Kırşehir (Çiçekdağı / Şehir Girişi)", mesafeKm: 5, yol: "D-200" }
        },
        terrain: "duzluk",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },
    "Zonguldak": {
        plaka: "67",
        bolge: "Karadeniz",
        merkezeMesafeKm: 440,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-67"]->.zonguldak; (node["highway"="bus_stop"](area.zonguldak););`,
        coordinates: {
            dms: "41°27′N 31°47′E",
            enlemDms: "41°27′K",
            boylamDms: "31°47′D",
            lat: 41.4564,
            lon: 31.7987,
            rakimMetre: 10,
            merkezeMesafeKm: 440,
            konumAciklamasi: "Türkiye'nin taşkömürü başkenti ve Karaelmas diyarı. Yerin yüzlerce metre altından çıkarılan karaelmas madenleri, Türkiye'nin ilk Maden Müzesi ve Eğitim Ocağı, milyonlarca yıllık damlataş sütunlarıyla Gökgöl Mağarası, Karadeniz Ereğli Tarihi Cehennemağzı Mağaraları (Herkül efsanesi), Filyos Antik Kenti (Tios) ve Filyos Vadisi Limanı, Çaycuma manda yoğurdu, Ereğli çileği ve dik falezli Karadeniz manzaralarıyla ünlü emek şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 440, "Çorlu": 405, "Çerkezköy": 390,
            "Ergene": 410, "Marmaraereğlisi": 425, "İstanbul": 320, "Ankara": 270,
            "Bolu": 150, "Düzce": 120, "Bartın": 85, "Karabük": 95, "Sakarya": 180,
            "Merkez": 2, "Karadeniz Ereğli": 45, "Çaycuma": 45, "Devrek": 55, "Kozlu": 6, "Kilimli": 8, "Alaplı": 60
        },
        komsular: {
            kuzey: "Karadeniz (Filyos - Kozlu - Ereğli Sahili)",
            dogu: "Bartın (Çaycuma - Filyos Vadisi) / Karabük (Yenice)",
            guney: "Bolu (Mengen - Devrek / Doruk Geçidi)",
            bati: "Düzce (Alaplı - Akçakoca Sahil Yolu)"
        },
        komsuIller: ["Bartın", "Karabük", "Bolu", "Düzce"],
        fizikiSinirKomsulari: ["Bartın", "Karabük", "Bolu", "Düzce"],
        sinirKomsulari: {
            "Çaycuma - Bartın": { ilce: "Çaycuma", komsuIl: "Bartın (Merkez / Filyos Vadisi / D-010)", mesafeKm: 35, yol: "D-010" },
            "Alaplı - Akçakoca": { ilce: "Alaplı", komsuIl: "Düzce (Akçakoca / Karadeniz Sahil Yolu)", mesafeKm: 30, yol: "D-010" },
            "Devrek - Mengen": { ilce: "Devrek", komsuIl: "Bolu (Mengen / Doruk Geçidi / D-750)", mesafeKm: 55, yol: "D-750" },
            "Gökçebey - Yenice": { ilce: "Gökçebey", komsuIl: "Karabük (Yenice / Filyos Vadisi Kanyonu)", mesafeKm: 35, yol: "D-030" }
        },
        terrain: "daglik",
        ucretler: { tam: 32, ogrenci: 19, yasli: 0 }
    },
    "Aksaray": {
        plaka: "68",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 790,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-68"]->.aksaray; (node["highway"="bus_stop"](area.aksaray););`,
        coordinates: {
            dms: "38°22′N 34°01′E",
            enlemDms: "38°22′K",
            boylamDms: "34°01′D",
            lat: 38.3687,
            lon: 34.037,
            rakimMetre: 980,
            merkezeMesafeKm: 790,
            konumAciklamasi: "Tarihi İpek Yolu'nun kesişim noktası, Selçuklu kervansaraylar diyarı. 14 kilometre uzunluğundaki doğa ve tarih harikası Ihlara Vadisi ve kaya kiliseleri, görkemli Hasan Dağı volkanı, Selçuklu mimarisinin en anıtsal eseri Sultanhanı Kervansarayı, Eğri Minare (Kızıl Minare), Selime Katedrali, Somuncu Baba Türbesi, Manastır Vadisi, meşhur Aksaray tava ve köpük helvasıyla ünlü İç Anadolu kavşağı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 790, "Çorlu": 755, "Çerkezköy": 740,
            "Ergene": 760, "Marmaraereğlisi": 775, "İstanbul": 660, "Ankara": 225,
            "Konya": 145, "Nevşehir": 75, "Niğde": 110, "Kırşehir": 110, "Kayseri": 150, "Adana": 270,
            "Merkez": 2, "Sultanhanı": 42, "Ortaköy": 50, "Güzelyurt": 45, "Eskil": 70, "Gülağaç": 35, "Ağaçören": 75
        },
        komsular: {
            kuzey: "Kırşehir (Ortaköy / Hirfanlı Barajı) / Ankara (Şereflikoçhisar / Tuz Gölü)",
            dogu: "Nevşehir (Acıgöl - Güzelyurt) / Niğde (Merkez - Altunhisar)",
            guney: "Konya (Ereğli - Karapınar / Hasan Dağı)",
            bati: "Konya (Eskil - Sultanhanı / Cihanbeyli Bozkırı)"
        },
        komsuIller: ["Konya", "Ankara", "Kırşehir", "Nevşehir", "Niğde"],
        fizikiSinirKomsulari: ["Konya", "Ankara", "Kırşehir", "Nevşehir", "Niğde"],
        sinirKomsulari: {
            "Sultanhanı - Konya": { ilce: "Sultanhanı", komsuIl: "Konya (Merkez / Karatay / D-300 Tarihi İpekyolu)", mesafeKm: 100, yol: "D-300" },
            "Merkez - Acıgöl": { ilce: "Merkez", komsuIl: "Nevşehir (Acıgöl / Kapadokya Girişi / D-300)", mesafeKm: 50, yol: "D-300" },
            "Merkez - Altunhisar": { ilce: "Merkez", komsuIl: "Niğde (Altunhisar / Bor / D-765)", mesafeKm: 65, yol: "D-765" },
            "Ortaköy - Kırşehir": { ilce: "Ortaköy", komsuIl: "Kırşehir (Merkez / Kaman Aksı)", mesafeKm: 65, yol: "68-75 İl Yolu" },
            "Merkez - Şereflikoçhisar": { ilce: "Merkez", komsuIl: "Ankara (Şereflikoçhisar / Tuz Gölü Sahili / D-750)", mesafeKm: 65, yol: "D-750 / E90" }
        },
        terrain: "duzluk",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },
    "Karaman": {
        plaka: "70",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 820,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-70"]->.karaman; (node["highway"="bus_stop"](area.karaman););`,
        coordinates: {
            dms: "37°11′N 33°13′E",
            enlemDms: "37°11′K",
            boylamDms: "33°13′D",
            lat: 37.1759,
            lon: 33.2287,
            rakimMetre: 1033,
            merkezeMesafeKm: 820,
            konumAciklamasi: "Türk dilinin başkenti; Karamanoğlu Mehmet Bey'in Türkçeyi resmi dil ilan ettiği kadim Selçuklu ve Karamanoğlu diyarı. Tarihi Karaman Kalesi, Hatuniye Medresesi, Aktekke Camii (Mevlana'nın annesi Mümine Hatun Türbesi), Taşkale Tarihi Tahıl Ambarları (kaya oyma 250 ambar), Manazan Mağaraları, İncesu Mağarası, Karadağ Binbirkilise ören yeri, Ermenek Baraj Gölü ve turkuaz kanyonu, Divle obruk tulum peyniri ve elmasıyla ünlü tarih şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 820, "Çorlu": 785, "Çerkezköy": 770,
            "Ergene": 790, "Marmaraereğlisi": 805, "İstanbul": 685, "Ankara": 370,
            "Konya": 120, "Mersin": 230, "Antalya": 330, "Ereğli": 90, "Niğde": 170, "Adana": 260,
            "Merkez": 2, "Ermenek": 155, "Sarıveliler": 175, "Ayrancı": 45, "Kazımkarabekir": 25, "Başyayla": 165
        },
        komsular: {
            kuzey: "Konya (Çumra - Karapınar - Ereğli)",
            dogu: "Mersin (Mut / Sertavul Geçidi 1650m - Gülnar)",
            guney: "Mersin (Silifke - Anamur) / Antalya (Alanya / Kuşyuvası Geçidi)",
            bati: "Konya (Hadim - Taşkent / Göksu Kanyonu)"
        },
        komsuIller: ["Konya", "Mersin", "Antalya"],
        fizikiSinirKomsulari: ["Konya", "Mersin", "Antalya"],
        sinirKomsulari: {
            "Merkez - Çumra": { ilce: "Merkez / Kazımkarabekir", komsuIl: "Konya (Çumra / Konya Merkez / D-715)", mesafeKm: 120, yol: "D-715" },
            "Merkez - Mut": { ilce: "Merkez", komsuIl: "Mersin (Mut / Sertavul Geçidi 1650m / D-715)", mesafeKm: 75, yol: "D-715" },
            "Ayrancı - Ereğli": { ilce: "Ayrancı", komsuIl: "Konya (Ereğli / D-350)", mesafeKm: 45, yol: "D-350" },
            "Ermenek - Alanya": { ilce: "Ermenek", komsuIl: "Antalya (Alanya / Kuşyuvası Tünelleri)", mesafeKm: 110, yol: "D-340" }
        },
        terrain: "daglik",
        ucretler: { tam: 38, ogrenci: 22, yasli: 0 }
    },

    "Kırıkkale": {
        plaka: "71",
        bolge: "İç Anadolu",
        merkezeMesafeKm: 525,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-71"]->.kirikkale; (node["highway"="bus_stop"](area.kirikkale););`,
        coordinates: {
            dms: "39°50′N 33°30′E",
            enlemDms: "39°50′K",
            boylamDms: "33°30′D",
            lat: 39.8468,
            lon: 33.5153,
            rakimMetre: 720,
            merkezeMesafeKm: 525,
            konumAciklamasi: "İç Anadolu'nun kilit kavşak noktası, Türkiye'nin savunma ve makine sanayisinin kalbi. Kızılırmak nehri havzasında, Tarihi Çeşnigir Köprüsü ve Kanyonu, Mühimmat Müzesi, Yahşihan Demir Köprüsü, Keskin Taş Mektep ve Hacı Taşan türküleri, Delice üzüm bağları, tüfek fabrikaları ve doğu-batı karayolu koridorunun ana geçiş kapısı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 525, "Çorlu": 490, "Çerkezköy": 475,
            "Ergene": 495, "Marmaraereğlisi": 510, "İstanbul": 400, "Ankara": 75,
            "Çankırı": 110, "Çorum": 165, "Yozgat": 140, "Kırşehir": 110, "Aksaray": 155, "Bolu": 265, "Kayseri": 240,
            "Yahşihan": 6, "Keskin": 30, "Delice": 55, "Bahşılı": 9, "Karakeçili": 35, "Sulakyurt": 52, "Balışeyh": 22, "Çelebi": 58
        },
        komsular: {
            kuzey: "Çankırı (Sulakyurt - Tüney Aksı)",
            dogu: "Çorum (Delice - Sungurlu Koridoru) / Yozgat (Delice - Yerköy)",
            guney: "Kırşehir (Keskin - Akpınar Aksı) / Aksaray (Karakeçili - Şereflikoçhisar)",
            bati: "Ankara (Yahşihan - Elmadağ Rampaları D-200 Koridoru)"
        },
        komsuIller: ["Ankara", "Çankırı", "Çorum", "Yozgat", "Kırşehir", "Aksaray"],
        fizikiSinirKomsulari: ["Ankara", "Çankırı", "Çorum", "Yozgat", "Kırşehir", "Aksaray"],
                sinirKomsulari: {
            "Yahşihan - Elmadağ": { ilce: "Yahşihan", komsuIl: "Ankara (Elmadağ Rampaları)", mesafeKm: 75, yol: "D-200 / E88" },
            "Sulakyurt - Tüney": { ilce: "Sulakyurt", komsuIl: "Çankırı (Tüney / Merkez)", mesafeKm: 110, yol: "D-765" },
            "Delice - Sungurlu": { ilce: "Delice", komsuIl: "Çorum (Sungurlu / Alaca)", mesafeKm: 165, yol: "D-200 / D-795" },
            "Balışeyh - Yerköy": { ilce: "Balışeyh", komsuIl: "Yozgat (Yerköy)", mesafeKm: 140, yol: "D-200" },
            "Keskin - Akpınar": { ilce: "Keskin", komsuIl: "Kırşehir (Akpınar / Merkez)", mesafeKm: 110, yol: "D-765" },
            "Karakeçili - Şereflikoçhisar": { ilce: "Karakeçili", komsuIl: "Aksaray (Şereflikoçhisar / Kulu)", mesafeKm: 155, yol: "D-715" }
        },
baglantiYollari: {
            "Yahşihan": { ilce: "Yahşihan", komsuIl: "Ankara", mesafeKm: 75, yol: "D-200 / E88 (Elmadağ Rampaları)" },
            "Sulakyurt": { ilce: "Sulakyurt", komsuIl: "Çankırı", mesafeKm: 110, yol: "D-765" },
            "Delice": { ilce: "Delice", komsuIl: "Çorum", mesafeKm: 165, yol: "D-200 / D-795" },
            "Balışeyh": { ilce: "Balışeyh", komsuIl: "Yozgat", mesafeKm: 140, yol: "D-200 (Yerköy Yolu)" },
            "Keskin": { ilce: "Keskin", komsuIl: "Kırşehir", mesafeKm: 110, yol: "D-765" },
            "Karakeçili": { ilce: "Karakeçili", komsuIl: "Aksaray", mesafeKm: 155, yol: "D-715" }
        },
        terrain: "dalgalı_plato_ve_kızılırmak_vadisi",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    },

    "Batman": {
        plaka: "72",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1530,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-72"]->.batman; (node["highway"="bus_stop"](area.batman););`,
        coordinates: {
            dms: "37°52′N 41°07′E",
            enlemDms: "37°52′K",
            boylamDms: "41°07′D",
            lat: 37.8812,
            lon: 41.1294,
            rakimMetre: 550,
            merkezeMesafeKm: 1530,
            konumAciklamasi: "Türkiye'nin petrol başkenti ve Dicle havzasının kadim yerleşimi. 12 bin yıllık tarihe sahip sular altındaki Hasankeyf'in yeni yerleşkesi, Raman Dağı petrol kuyuları, Malabadi Köprüsü sınır hattı, Memikhan Köprüsü, Beşiri Mor Kiryakus Manastırı, Kozluk Kalesi ve zengin Güneydoğu kültürüyle öne çıkan sanayi ve kültür şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1530, "Çorlu": 1495, "Çerkezköy": 1480,
            "Ergene": 1500, "Marmaraereğlisi": 1515, "İstanbul": 1405, "Ankara": 975,
            "Diyarbakır": 100, "Siirt": 85, "Muş": 135, "Bitlis": 135, "Mardin": 140, "Şırnak": 170, "Şanlıurfa": 280,
            "Hasankeyf": 37, "Kozluk": 58, "Beşiri": 16, "Sason": 66, "Gercüş": 60
        },
        komsular: {
            kuzey: "Muş (Sason - Kozluk Dağ Aksı)",
            dogu: "Siirt (Kurtalan - Beşiri Aksı) / Bitlis (Baykan - Ziyaret Koridoru)",
            guney: "Mardin (Hasankeyf - Midyat Koridoru)",
            bati: "Diyarbakır (Bismil - Silvan - Malabadi Köprüsü Aksı D-370)"
        },
        komsuIller: ["Diyarbakır", "Siirt", "Muş", "Bitlis", "Mardin", "Şırnak"],
        fizikiSinirKomsulari: ["Diyarbakır", "Siirt", "Muş", "Bitlis", "Mardin", "Şırnak"],
                sinirKomsulari: {
            "Merkez - Bismil": { ilce: "Merkez", komsuIl: "Diyarbakır (Bismil Aksı)", mesafeKm: 100, yol: "D-370" },
            "Beşiri - Kurtalan": { ilce: "Beşiri", komsuIl: "Siirt (Kurtalan / Merkez)", mesafeKm: 85, yol: "D-370" },
            "Kozluk - Baykan": { ilce: "Kozluk", komsuIl: "Bitlis (Baykan / Ziyaret / Veysel Karani)", mesafeKm: 135, yol: "D-370 / D-965" },
            "Sason - Muş": { ilce: "Sason", komsuIl: "Muş (Merkez / Dağ Yolu)", mesafeKm: 135, yol: "D-955" },
            "Hasankeyf - Midyat": { ilce: "Hasankeyf", komsuIl: "Mardin (Midyat / Tarihi Taş Evler)", mesafeKm: 140, yol: "D-955 / Yeni Hasankeyf Köprüsü" }
        },
baglantiYollari: {
            "Merkez (D-370)": { ilce: "Merkez", komsuIl: "Diyarbakır", mesafeKm: 100, yol: "D-370 (Bismil Aksı)" },
            "Beşiri": { ilce: "Beşiri", komsuIl: "Siirt", mesafeKm: 85, yol: "D-370 (Kurtalan Yolu)" },
            "Kozluk": { ilce: "Kozluk", komsuIl: "Bitlis", mesafeKm: 135, yol: "D-370 / Baykan - Ziyaret" },
            "Sason": { ilce: "Sason", komsuIl: "Muş", mesafeKm: 135, yol: "D-955 (Dağ Yolu)" },
            "Hasankeyf": { ilce: "Hasankeyf", komsuIl: "Mardin", mesafeKm: 140, yol: "D-955 (Midyat Yolu & Yeni Viyadük)" }
        },
        terrain: "petrol_ovası_ve_dicle_nehir_kanyonu",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    },

    "Şırnak": {
        plaka: "73",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1680,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-73"]->.sirnak; (node["highway"="bus_stop"](area.sirnak););`,
        coordinates: {
            dms: "37°31′N 42°27′E",
            enlemDms: "37°31′K",
            boylamDms: "42°27′D",
            lat: 37.5164,
            lon: 42.4593,
            rakimMetre: 1400,
            merkezeMesafeKm: 1680,
            konumAciklamasi: "Cudi Dağı'nın eteklerinde kurulu, Hz. Nuh'un gemisinin indiğine inanılan kutsal diyar. Dicle Nehri kıyısında tarihi İpek Yolu kavşağı Cizre (İsmail Ebul-İz El Cezeri'nin memleketi), Kırmızı Medrese, Mem û Zîn Türbesi, Kasrik Boğazı, Silopi Habur Sınır Kapısı, Beytüşşebap Faraşin Yaylası ve heybetli Cudi Dağı manzaralarıyla köklü sınır kenti."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1680, "Çorlu": 1645, "Çerkezköy": 1630,
            "Ergene": 1650, "Marmaraereğlisi": 1665, "İstanbul": 1555, "Ankara": 1125,
            "Mardin": 190, "Siirt": 95, "Batman": 170, "Hakkâri": 190, "Van": 210, "Diyarbakır": 285,
            "Cizre": 45, "Silopi": 75, "İdil": 75, "Uludere": 48, "Beytüşşebap": 120, "Güçlükonak": 70
        },
        komsular: {
            kuzey: "Siirt (Eruh Geçişi) / Van (Faraşin - Çatak Dağ Koridoru)",
            dogu: "Hakkâri (Uludere - Çukurca - D-400 Koridoru)",
            guney: "Suriye & Irak Sınırı (Habur Sınır Kapısı - Silopi)",
            bati: "Mardin (Cizre - Nusaybin D-400 İpekyolu Aksı) / Batman (İdil - Midyat üzerinden)"
        },
        komsuIller: ["Mardin", "Siirt", "Batman", "Hakkâri", "Van"],
        fizikiSinirKomsulari: ["Mardin", "Siirt", "Hakkâri", "Van"],
                sinirKomsulari: {
            "Cizre - Nusaybin": { ilce: "Cizre", komsuIl: "Mardin (Nusaybin / Tarihi İpek Yolu)", mesafeKm: 190, yol: "D-400" },
            "Merkez - Eruh": { ilce: "Merkez", komsuIl: "Siirt (Eruh / Cudi Tünelleri)", mesafeKm: 95, yol: "D-370" },
            "Uludere - Çukurca": { ilce: "Uludere", komsuIl: "Hakkâri (Çukurca / Merkez)", mesafeKm: 190, yol: "D-400" },
            "Beytüşşebap - Çatak": { ilce: "Beytüşşebap", komsuIl: "Van (Çatak / Gevaş / Van Gölü)", mesafeKm: 210, yol: "D-400 / Dağ Geçidi" },
            "İdil - Hasankeyf": { ilce: "İdil", komsuIl: "Batman (Hasankeyf / Gercüş)", mesafeKm: 170, yol: "D-380" }
        },
baglantiYollari: {
            "Cizre": { ilce: "Cizre", komsuIl: "Mardin", mesafeKm: 190, yol: "D-400 (Nusaybin - İpek Yolu)" },
            "Merkez (Cudi Tüneli)": { ilce: "Merkez", komsuIl: "Siirt", mesafeKm: 95, yol: "D-370 / Eruh Dağ Yolu" },
            "Uludere": { ilce: "Uludere", komsuIl: "Hakkâri", mesafeKm: 190, yol: "D-400 (Dağ Koridoru)" },
            "Beytüşşebap": { ilce: "Beytüşşebap", komsuIl: "Van", mesafeKm: 210, yol: "D-400 / Çatak Dağ Yolu" },
            "İdil": { ilce: "İdil", komsuIl: "Batman", mesafeKm: 170, yol: "D-380 / Hasankeyf Aksı" }
        },
        terrain: "sarp_daglik_ve_cudi_kanyonlari",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    },

    "Bartın": {
        plaka: "74",
        bolge: "Karadeniz",
        merkezeMesafeKm: 565,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-74"]->.bartin; (node["highway"="bus_stop"](area.bartin););`,
        coordinates: {
            dms: "41°38′N 32°20′E",
            enlemDms: "41°38′K",
            boylamDms: "32°20′D",
            lat: 41.6344,
            lon: 32.3375,
            rakimMetre: 25,
            merkezeMesafeKm: 565,
            konumAciklamasi: "Batı Karadeniz'in yemyeşil incisi, Türkiye'de deniz taşımacılığı yapılabilen tek nehir olan Bartın Çayı'nın şehri. Fatih Sultan Mehmed'in 'Çeşm-i Cihan' (Dünyanın Gözü) dediği tarihi Amasra, Kemere Köprüsü, Tavşan Adası manzarası, İnkumu Plajı, Küre Dağları Milli Parkı, Güzelcehisar Lav Sütunları, ahşap yat yapım atölyeleri ve enfes balık-salata kültürü."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 565, "Çorlu": 530, "Çerkezköy": 515,
            "Ergene": 535, "Marmaraereğlisi": 550, "İstanbul": 440, "Ankara": 280,
            "Zonguldak": 85, "Karabük": 85, "Kastamonu": 185, "Bolu": 225, "Düzce": 175,
            "Amasra": 16, "Kurucaşile": 52, "Ulus": 37, "İnkumu": 15, "Kozcağız": 20, "Çakraz": 30
        },
        komsular: {
            kuzey: "Karadeniz (Amasra - Kurucaşile Sahil Şeridi)",
            dogu: "Kastamonu (Cide Sahil Yolu & Pınarbaşı Küre Dağları)",
            guney: "Karabük (Ahmetusta Geçidi & Safranbolu Yolu D-755)",
            bati: "Zonguldak (Çaycuma - Saltukova Aksı D-010)"
        },
        komsuIller: ["Zonguldak", "Karabük", "Kastamonu"],
        fizikiSinirKomsulari: ["Zonguldak", "Karabük", "Kastamonu"],
                sinirKomsulari: {
            "Merkez - Çaycuma": { ilce: "Merkez", komsuIl: "Zonguldak (Çaycuma / Filyos Vadisi)", mesafeKm: 85, yol: "D-010" },
            "Merkez - Safranbolu": { ilce: "Merkez", komsuIl: "Karabük (Safranbolu / Ahmetusta Geçidi)", mesafeKm: 85, yol: "D-755" },
            "Kurucaşile - Cide": { ilce: "Kurucaşile", komsuIl: "Kastamonu (Cide Sahil Yolu)", mesafeKm: 185, yol: "D-010" }
        },
baglantiYollari: {
            "Merkez (D-010)": { ilce: "Merkez", komsuIl: "Zonguldak", mesafeKm: 85, yol: "D-010 (Çaycuma Koridoru)" },
            "Merkez (D-755)": { ilce: "Merkez", komsuIl: "Karabük", mesafeKm: 85, yol: "D-755 (Ahmetusta Rampaları)" },
            "Kurucaşile": { ilce: "Kurucaşile", komsuIl: "Kastamonu", mesafeKm: 185, yol: "D-010 (Cide Sahil Yolu)" }
        },
        terrain: "kıyı_daglik_ve_ormanlik_vadiler",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    },

    "Ardahan": {
        plaka: "75",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1520,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-75"]->.ardahan; (node["highway"="bus_stop"](area.ardahan););`,
        coordinates: {
            dms: "41°06′N 42°42′E",
            enlemDms: "41°06′K",
            boylamDms: "42°42′D",
            lat: 41.1105,
            lon: 42.7022,
            rakimMetre: 1800,
            merkezeMesafeKm: 1520,
            konumAciklamasi: "Türkiye'nin Gürcistan sınırındaki Kafkas kapısı, yüksek yaylalar ve masalsı kış kenti. Kışın üzerinde atlı kızaklarla gezilen buz tutmuş Çıldır Gölü, tarihi Ardahan Kalesi, Şeytan Kalesi, Bülbilan Yaylası, 2600 metrelik heybetli Sahara Geçidi, Yalnızçam Kayak Merkezi, meşhur Ardahan çiçek balı ve gravyer / kaşar peyniri diyarı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1520, "Çorlu": 1485, "Çerkezköy": 1470,
            "Ergene": 1490, "Marmaraereğlisi": 1505, "İstanbul": 1395, "Ankara": 1060,
            "Kars": 90, "Artvin": 115, "Erzurum": 200, "Iğdır": 230, "Trabzon": 280, "Rize": 210,
            "Göle": 44, "Çıldır": 45, "Hanak": 26, "Damal": 45, "Posof": 80
        },
        komsular: {
            kuzey: "Gürcistan Sınırı (Türkgözü ve Aktaş Sınır Kapıları)",
            dogu: "Ermenistan Sınırı / Kars (Susuz - Arpaçay Aksı D-965)",
            guney: "Kars (Susuz Koridoru) / Erzurum (Göle - Oltu Aksı)",
            bati: "Artvin (Sahara Dağı Geçidi 2600m - Şavşat D-010 Koridoru)"
        },
        komsuIller: ["Artvin", "Kars", "Erzurum"],
        fizikiSinirKomsulari: ["Artvin", "Kars", "Erzurum"],
                sinirKomsulari: {
            "Merkez - Şavşat": { ilce: "Merkez", komsuIl: "Artvin (Şavşat / Sahara Geçidi 2600m)", mesafeKm: 115, yol: "D-010" },
            "Merkez - Susuz": { ilce: "Merkez", komsuIl: "Kars (Susuz / Çıldır Gölü)", mesafeKm: 90, yol: "D-965" },
            "Göle - Oltu": { ilce: "Göle", komsuIl: "Erzurum (Oltu / Tortum Şelalesi)", mesafeKm: 200, yol: "D-955" }
        },
baglantiYollari: {
            "Merkez (D-010)": { ilce: "Merkez", komsuIl: "Artvin", mesafeKm: 115, yol: "D-010 (Sahara Geçidi 2600m)" },
            "Merkez (D-965)": { ilce: "Merkez", komsuIl: "Kars", mesafeKm: 90, yol: "D-965 (Susuz Rampaları)" },
            "Göle": { ilce: "Göle", komsuIl: "Erzurum", mesafeKm: 200, yol: "D-955 (Oltu - Tortum Aksı)" }
        },
        terrain: "yuksek_plato_ve_sahara_zirvesi",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    },

    "Iğdır": {
        plaka: "76",
        bolge: "Doğu Anadolu",
        merkezeMesafeKm: 1600,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-76"]->.igdir; (node["highway"="bus_stop"](area.igdir););`,
        coordinates: {
            dms: "39°55′N 44°02′E",
            enlemDms: "39°55′K",
            boylamDms: "44°02′D",
            lat: 39.9237,
            lon: 44.0450,
            rakimMetre: 850,
            merkezeMesafeKm: 1600,
            konumAciklamasi: "Üç ülkeyle (Ermenistan, Azerbaycan/Nahçıvan, İran) sınırı olan Türkiye'nin doğudaki güneşi ve mikroklimalı 'Doğu'nun Çukurovası'. 5137 metrelik efsanevi Ağrı Dağı'nın kuzey eteklerinde, Aras Nehri havzası, Tuzluca Tarihi Kaya Tuz Mağaraları, Dilucu Sınır Kapısı, pamuk ve meşhur Iğdır kayısı bahçeleriyle eşsiz bir sınır vahasidir."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1600, "Çorlu": 1565, "Çerkezköy": 1550,
            "Ergene": 1570, "Marmaraereğlisi": 1585, "İstanbul": 1475, "Ankara": 1140,
            "Kars": 140, "Ağrı": 140, "Erzurum": 320, "Van": 240, "Ardahan": 230,
            "Tuzluca": 40, "Aralık": 45, "Karakoyunlu": 15, "Dilucu Kapısı": 85
        },
        komsular: {
            kuzey: "Ermenistan Sınırı (Aras Nehri Sınır Hattı)",
            dogu: "Nahçıvan Özerk Cumhuriyeti (Dilucu Sınır Kapısı) / İran Sınırı",
            guney: "Ağrı (Doğubayazıt - Ağrı Dağı Geçişi D-975)",
            bati: "Kars (Tuzluca Kanyonu - Digor Aksı D-080)"
        },
        komsuIller: ["Kars", "Ağrı"],
        fizikiSinirKomsulari: ["Kars", "Ağrı"],
                sinirKomsulari: {
            "Tuzluca - Digor": { ilce: "Tuzluca", komsuIl: "Kars (Digor / Ani Harabeleri Aksı)", mesafeKm: 140, yol: "D-080" },
            "Merkez - Doğubayazıt": { ilce: "Merkez", komsuIl: "Ağrı (Doğubayazıt / İshak Paşa Sarayı)", mesafeKm: 140, yol: "D-975 (Ağrı Dağı Geçidi)" }
        },
baglantiYollari: {
            "Tuzluca": { ilce: "Tuzluca", komsuIl: "Kars", mesafeKm: 140, yol: "D-080 (Digor Aksı)" },
            "Merkez (D-975)": { ilce: "Merkez", komsuIl: "Ağrı", mesafeKm: 140, yol: "D-975 (Doğubayazıt & Ağrı Dağı Yolu)" }
        },
        terrain: "mikroklima_ovasi_ve_agri_dagi_etekleri",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },

    "Karabük": {
        plaka: "78",
        bolge: "Karadeniz",
        merkezeMesafeKm: 530,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-78"]->.karabuk; (node["highway"="bus_stop"](area.karabuk););`,
        coordinates: {
            dms: "41°12′N 32°37′E",
            enlemDms: "41°12′K",
            boylamDms: "32°37′D",
            lat: 41.2061,
            lon: 32.6204,
            rakimMetre: 280,
            merkezeMesafeKm: 530,
            konumAciklamasi: "Cumhuriyet kenti ve Türkiye'nin ilk ağır sanayi merkezi Kardemir'in evi. UNESCO Dünya Mirası Safranbolu tarihi konakları, Cinci Hanı, İncekaya Su Kemeri, Kristal Teras, Tokatlı Kanyonu, Yenice Ormanları (Avrupa'nın acil korunması gereken sıcak noktası), Hadrianapolis Antik Kenti ve lokumlarıyla büyüleyici bir tarih ve doğa şehri."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 530, "Çorlu": 495, "Çerkezköy": 480,
            "Ergene": 500, "Marmaraereğlisi": 515, "İstanbul": 405, "Ankara": 215,
            "Bartın": 85, "Zonguldak": 95, "Bolu": 140, "Çankırı": 120, "Kastamonu": 110,
            "Safranbolu": 8, "Yenice": 32, "Eskipazar": 38, "Eflani": 45, "Ovacık": 46
        },
        komsular: {
            kuzey: "Bartın (Ahmetusta Geçidi D-755 Aksı)",
            dogu: "Kastamonu (Araç Vadisi D-030 Koridoru)",
            guney: "Çankırı (Eskipazar - Çerkeş Yolu) / Bolu (Gerede Bağlantısı D-750)",
            bati: "Zonguldak (Yenice Kanyonu & Filyos Vadisi Aksı)"
        },
        komsuIller: ["Bartın", "Zonguldak", "Bolu", "Çankırı", "Kastamonu"],
        fizikiSinirKomsulari: ["Bartın", "Zonguldak", "Bolu", "Çankırı", "Kastamonu"],
                sinirKomsulari: {
            "Safranbolu - Bartın": { ilce: "Safranbolu", komsuIl: "Bartın (Merkez / Amasra)", mesafeKm: 85, yol: "D-755 (Ahmetusta Geçidi)" },
            "Yenice - Devrek": { ilce: "Yenice", komsuIl: "Zonguldak (Devrek / Gökçebey / Yenice Kanyonu)", mesafeKm: 95, yol: "D-755" },
            "Eskipazar - Gerede": { ilce: "Eskipazar", komsuIl: "Bolu (Gerede / TEM Otoyolu Kavşağı)", mesafeKm: 140, yol: "D-750" },
            "Eskipazar - Çerkeş": { ilce: "Eskipazar", komsuIl: "Çankırı (Çerkeş / Ilgaz)", mesafeKm: 120, yol: "D-755 / D-100" },
            "Merkez - Araç": { ilce: "Merkez", komsuIl: "Kastamonu (Araç / Ilgaz Dağları)", mesafeKm: 110, yol: "D-030" }
        },
baglantiYollari: {
            "Safranbolu": { ilce: "Safranbolu", komsuIl: "Bartın", mesafeKm: 85, yol: "D-755 (Ahmetusta Geçidi)" },
            "Yenice": { ilce: "Yenice", komsuIl: "Zonguldak", mesafeKm: 95, yol: "D-755 (Yenice Kanyonu)" },
            "Eskipazar": { ilce: "Eskipazar", komsuIl: "Bolu", mesafeKm: 140, yol: "D-750 (Gerede Kavşağı)" },
            "Eskipazar (Çankırı Yolu)": { ilce: "Eskipazar", komsuIl: "Çankırı", mesafeKm: 120, yol: "D-755 / D-100" },
            "Merkez (D-030)": { ilce: "Merkez", komsuIl: "Kastamonu", mesafeKm: 110, yol: "D-030 (Araç Yolu)" }
        },
        terrain: "kanyonlar_ormanlik_daglar_ve_tarihi_vadiler",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    },

    "Kilis": {
        plaka: "79",
        bolge: "Güneydoğu Anadolu",
        merkezeMesafeKm: 1240,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-79"]->.kilis; (node["highway"="bus_stop"](area.kilis););`,
        coordinates: {
            dms: "36°43′N 37°07′E",
            enlemDms: "36°43′K",
            boylamDms: "37°07′D",
            lat: 36.7184,
            lon: 37.1212,
            rakimMetre: 640,
            merkezeMesafeKm: 1240,
            konumAciklamasi: "Zeytin ağaçlarıyla çevrili kadim sınır şehri, Güneydoğu'nun bereketli toprağı. Oylum Höyük (5500 yıllık kral sarayı), Tarihi Ravanda Kalesi, Kilis Taş Evleri, Salih Efendi Sokağı, Öncüpınar Sınır Kapısı, dünyaca ünlü Kilis Tavası, Katmeri, Cennet Çamuru tatlısı ve asırlık zeytinyağı kültürüyle eşsiz bir lezzet ve tarih durağı."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1240, "Çorlu": 1205, "Çerkezköy": 1190,
            "Ergene": 1210, "Marmaraereğlisi": 1225, "İstanbul": 1115, "Ankara": 700,
            "Gaziantep": 65, "Hatay": 120, "Osmaniye": 160, "Kahramanmaraş": 145, "Şanlıurfa": 205,
            "Musabeyli": 35, "Polateli": 22, "Elbeyli": 32, "Öncüpınar Kapısı": 8
        },
        komsular: {
            kuzey: "Gaziantep (D-850 Duble Yol Koridoru)",
            dogu: "Gaziantep (Elbeyli - Oğuzeli Aksı)",
            guney: "Suriye Sınırı (Öncüpınar ve Çobanbey Sınır Kapıları)",
            bati: "Hatay (Musabeyli - Hassa Amanos Koridoru D-410)"
        },
        komsuIller: ["Gaziantep", "Hatay"],
        fizikiSinirKomsulari: ["Gaziantep", "Hatay"],
                sinirKomsulari: {
            "Merkez - Şahinbey": { ilce: "Merkez", komsuIl: "Gaziantep (Şahinbey / Oğuzeli Havalimanı)", mesafeKm: 65, yol: "D-850" },
            "Musabeyli - Hassa": { ilce: "Musabeyli", komsuIl: "Hatay (Hassa / Kırıkhan / Amanos Geçidi)", mesafeKm: 120, yol: "D-410" }
        },
baglantiYollari: {
            "Merkez (D-850)": { ilce: "Merkez", komsuIl: "Gaziantep", mesafeKm: 65, yol: "D-850" },
            "Musabeyli": { ilce: "Musabeyli", komsuIl: "Hatay", mesafeKm: 120, yol: "D-410 (Hassa - Kırıkhan Koridoru)" }
        },
        terrain: "zeytinlik_tepeleri_ve_sinir_duzlugu",
        ucretler: { tam: 35, ogrenci: 20, yasli: 0 }
    },

    "Osmaniye": {
        plaka: "80",
        bolge: "Akdeniz",
        merkezeMesafeKm: 1100,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-80"]->.osmaniye; (node["highway"="bus_stop"](area.osmaniye););`,
        coordinates: {
            dms: "37°04′N 36°14′E",
            enlemDms: "37°04′K",
            boylamDms: "36°14′D",
            lat: 37.0742,
            lon: 36.2472,
            rakimMetre: 125,
            merkezeMesafeKm: 1100,
            konumAciklamasi: "Çukurova'nın kaleleri diyarı ve Akdeniz'i Güneydoğu'ya bağlayan stratejik geçit. Kastabala Antik Kenti ve sütunlu caddesi, Toprakkale Kalesi, Karatepe-Aslantaş Açık Hava Müzesi (Hitit hiyeroglifleri ve kalesi), Zorkun Yaylası serinliği, Kırmıtlı Kuş Cenneti, meşhur Osmaniye yer fıstığı, Kadirli turpu ve simit tiridiyle zengin Akdeniz kültür beşiği."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 1100, "Çorlu": 1065, "Çerkezköy": 1050,
            "Ergene": 1070, "Marmaraereğlisi": 1085, "İstanbul": 975, "Ankara": 560,
            "Adana": 90, "Hatay": 130, "Gaziantep": 130, "Kahramanmaraş": 95, "Kilis": 160, "Mersin": 160,
            "Kadirli": 46, "Düziçi": 32, "Bahçe": 33, "Toprakkale": 10, "Sumbas": 58, "Hasanbeyli": 35
        },
        komsular: {
            kuzey: "Kahramanmaraş (Andırın - Kadirli Aksı) / Adana (Kozan Aksı)",
            dogu: "Gaziantep (Bahçe - Nurdağı Otoyolu O-52) / Kahramanmaraş (Türkoğlu Aksı D-825)",
            guney: "Hatay (Erzin - Dörtyol O-53 Akdeniz Sahil Koridoru)",
            bati: "Adana (Ceyhan Ovası & D-400 / O-52 TEM Otoyolu)"
        },
        komsuIller: ["Adana", "Hatay", "Gaziantep", "Kahramanmaraş"],
        fizikiSinirKomsulari: ["Adana", "Hatay", "Gaziantep", "Kahramanmaraş"],
                sinirKomsulari: {
            "Toprakkale - Ceyhan": { ilce: "Toprakkale", komsuIl: "Adana (Ceyhan / Çukurova Ovası)", mesafeKm: 90, yol: "O-52 / D-400" },
            "Toprakkale - Erzin": { ilce: "Toprakkale", komsuIl: "Hatay (Erzin / Dörtyol / İskenderun)", mesafeKm: 130, yol: "O-53 / D-817" },
            "Bahçe - Nurdağı": { ilce: "Bahçe", komsuIl: "Gaziantep (Nurdağı Tünelleri / TAG Otoyolu)", mesafeKm: 130, yol: "O-52" },
            "Düziçi - Türkoğlu": { ilce: "Düziçi", komsuIl: "Kahramanmaraş (Türkoğlu / Narlı)", mesafeKm: 95, yol: "D-825" }
        },
baglantiYollari: {
            "Toprakkale": { ilce: "Toprakkale", komsuIl: "Adana", mesafeKm: 90, yol: "O-52 / D-400 (Ceyhan Aksı)" },
            "Toprakkale (O-53)": { ilce: "Toprakkale", komsuIl: "Hatay", mesafeKm: 130, yol: "O-53 (İskenderun Sahil Koridoru)" },
            "Bahçe": { ilce: "Bahçe", komsuIl: "Gaziantep", mesafeKm: 130, yol: "O-52 (Nurdağı Tünelleri)" },
            "Düziçi": { ilce: "Düziçi", komsuIl: "Kahramanmaraş", mesafeKm: 95, yol: "D-825 (Türkoğlu Rampaları)" }
        },
        terrain: "cukurova_ovasi_ve_nur_daglari_etekleri",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    },

    "Düzce": {
        plaka: "81",
        bolge: "Karadeniz",
        merkezeMesafeKm: 365,
        routes: [],
        canliSorgu: `area["ISO3166-2"="TR-81"]->.duzce; (node["highway"="bus_stop"](area.duzce););`,
        coordinates: {
            dms: "40°50′N 31°09′E",
            enlemDms: "40°50′K",
            boylamDms: "31°09′D",
            lat: 40.8438,
            lon: 31.1565,
            rakimMetre: 160,
            merkezeMesafeKm: 365,
            konumAciklamasi: "Türkiye'nin 81. ve son ili, Batı Karadeniz'in yeşil cenneti ve metropoller arası dinlenme noktası. Karadeniz sahil kenti tarihi Akçakoca (Ceneviz Kalesi, mavi bayraklı plajlar, fındık bahçeleri), Samandere ve Güzeldere şelaleleri tabiat anıtları, Efteni Gölü Kuş Cenneti, Konuralp Antik Tiyatrosu (Prusias ad Hypium), Bolu Dağı tüneli etekleri, meşhur tütün kolonyası ve acıka sosuyla Karadeniz'in modern incisi."
        },
        tekirdagMesafeKm: {
            "Süleymanpaşa": 365, "Çorlu": 330, "Çerkezköy": 315,
            "Ergene": 335, "Marmaraereğlisi": 350, "İstanbul": 215, "Ankara": 235,
            "Bolu": 45, "Sakarya": 70, "Zonguldak": 120, "Kocaeli": 115, "Bartın": 175, "Bursa": 195,
            "Akçakoca": 38, "Kaynaşlı": 15, "Gümüşova": 18, "Gölyaka": 15, "Çilimli": 16, "Cumayeri": 21, "Yığılca": 36
        },
        komsular: {
            kuzey: "Karadeniz (Akçakoca Sahil Şeridi)",
            dogu: "Bolu (Bolu Dağı Tüneli O-4 / D-100 Koridoru & Yığılca)",
            guney: "Bolu (Mudurnu - Abant Dağları Sınırı)",
            bati: "Sakarya (Hendek - Akyazı Koridoru D-100 / O-4) / Zonguldak (Alaplı Sahil Aksı D-655)"
        },
        komsuIller: ["Bolu", "Sakarya", "Zonguldak"],
        fizikiSinirKomsulari: ["Bolu", "Sakarya", "Zonguldak"],
                sinirKomsulari: {
            "Kaynaşlı - Bolu Dağı": { ilce: "Kaynaşlı", komsuIl: "Bolu (Bolu Dağı Tüneli / Abant Kavşağı)", mesafeKm: 45, yol: "O-4 / D-100" },
            "Gümüşova - Hendek": { ilce: "Gümüşova", komsuIl: "Sakarya (Hendek / Akyazı)", mesafeKm: 70, yol: "O-4 / D-100" },
            "Akçakoca - Alaplı": { ilce: "Akçakoca", komsuIl: "Zonguldak (Alaplı / Karadeniz Ereğli Sahil Yolu)", mesafeKm: 120, yol: "D-655 / D-010" }
        },
baglantiYollari: {
            "Kaynaşlı": { ilce: "Kaynaşlı", komsuIl: "Bolu", mesafeKm: 45, yol: "O-4 / D-100 (Bolu Dağı Tüneli)" },
            "Gümüşova": { ilce: "Gümüşova", komsuIl: "Sakarya", mesafeKm: 70, yol: "O-4 / D-100 (Hendek Koridoru)" },
            "Akçakoca": { ilce: "Akçakoca", komsuIl: "Zonguldak", mesafeKm: 120, yol: "D-655 / D-010 (Alaplı Sahil Yolu)" }
        },
        terrain: "duzce_ovasi_ve_bolu_dagi_gecisi",
        ucretler: { tam: 36, ogrenci: 20, yasli: 0 }
    }



};

// Aktif oynanabilir rotaların (API'den çekildikten sonra) tutulduğu havuz
// 190 ADET GERÇEK VE ÖZGÜN ŞEHİR/İLÇE DURAK VERİTABANI (API ÇÖKMESİNE KARŞI TAM GÜVENLİ YEDEK)
// Tekirdağ için Süleymanpaşa, Çorlu, Çerkezköy, Muratlı gerçek durakları bulunur.
const varsayilanSehirDuraklari = {
    "Denizli": [
        { "name": "Denizli Büyükşehir Otobüs Terminali (Merkez)", "lat": 37.7850, "lon": 29.0890 },
        { "name": "Tarihi Delikliçınar Meydanı & Horoz Heykeli", "lat": 37.7760, "lon": 29.0860 },
        { "name": "Pamukkale Travertenleri & Hierapolis Antik Kenti", "lat": 37.9250, "lon": 29.1210 },
        { "name": "Pamukkale Üniversitesi (PAÜ) Kınıklı Kampüsü", "lat": 37.7410, "lon": 29.1020 },
        { "name": "Sarayköy İlçe Meydanı & Termal Kaplıcalar", "lat": 37.9150, "lon": 28.9250 },
        { "name": "Honaz İlçe Meydanı & Tarihi Kiraz Aksı", "lat": 37.7550, "lon": 29.2550 }
    ],

    "Antalya": [
        { "name": "Antalya Şehirlerarası Otobüs Terminali (Kepez)", "lat": 36.9230, "lon": 30.6680 },
        { "name": "Tarihi Kaleiçi & Cumhuriyet Meydanı (Saat Kulesi)", "lat": 36.8860, "lon": 30.7050 },
        { "name": "Konyaaltı Sahil Parkı & Akdeniz Bulvarı", "lat": 36.8820, "lon": 30.6550 },
        { "name": "Akdeniz Üniversitesi Kampüsü Giriş Kapısı", "lat": 36.8920, "lon": 30.6520 },
        { "name": "Lara Sahili & Düden Parkı Şelale Durağı", "lat": 36.8510, "lon": 30.7850 },
        { "name": "Alanya İlçe Otogarı & Kleopatra Plajı Yolu", "lat": 36.5510, "lon": 31.9810 }
    ],

    "Amasya": [
        { "name": "AŞOT - Amasya Şehirlerarası Otobüs Terminali (Merkez)", "lat": 40.6420, "lon": 35.8180 },
        { "name": "Yavuz Selim Meydanı & Amasya Valiliği", "lat": 40.6530, "lon": 35.8340 },
        { "name": "Tarihi Hazeranlar Konağı & Kral Kaya Mezarları", "lat": 40.6550, "lon": 35.8310 },
        { "name": "Amasya Üniversitesi Milli Hâkimiyet Merkez Kampüsü", "lat": 40.6650, "lon": 35.8480 },
        { "name": "Merzifon İlçe Otogarı & Havalimanı Kavşağı", "lat": 40.8710, "lon": 35.4610 },
        { "name": "Suluova İlçe Meydanı & Şeker Fabrikası Aksı", "lat": 40.8350, "lon": 35.6550 }
    ],

    "Ağrı": [
        { "name": "Ağrı Şehirlerarası Otobüs Terminali (Merkez)", "lat": 39.7150, "lon": 43.0380 },
        { "name": "Ağrı Valiliği & Cumhuriyet Meydanı", "lat": 39.7210, "lon": 43.0530 },
        { "name": "Ağrı İbrahim Çeçen Üniversitesi (AİÇÜ) Kampüsü", "lat": 39.7020, "lon": 43.0180 },
        { "name": "Doğubayazıt İlçe Otogarı & İshak Paşa Sarayı Yolu", "lat": 39.5450, "lon": 44.0850 },
        { "name": "Ağrı Dağı Milli Parkı & Gürbulak Sınır Kapısı Girişi", "lat": 39.5600, "lon": 44.4000 },
        { "name": "Patnos İlçe Otogarı & Süphan Dağı Geçişi", "lat": 39.2350, "lon": 42.8600 }
    ],

    "Afyonkarahisar": [
        { "name": "AFTAŞ - Afyonkarahisar Şehirlerarası Otobüs Terminali", "lat": 38.7410, "lon": 30.5680 },
        { "name": "Tarihi Zafer Meydanı & Afyon Valiliği", "lat": 38.7550, "lon": 30.5410 },
        { "name": "Afyon Kocatepe Üniversitesi (AKÜ) Ahmet Necdet Sezer Kampüsü", "lat": 38.8150, "lon": 30.5320 },
        { "name": "Tarihi İmaret (Gedik Ahmet Paşa) Camii Meydanı", "lat": 38.7580, "lon": 30.5360 },
        { "name": "Özdilek / İkbal Kavşağı & Çevre Yolu Dinlenme Tesisi", "lat": 38.7820, "lon": 30.4980 },
        { "name": "Gazlıgöl Termal Tesisler & İstasyon Durağı", "lat": 38.9650, "lon": 30.5050 }
    ],

    "Adıyaman": [
        { "name": "Adıyaman Şehirlerarası Otobüs Terminali (Merkez)", "lat": 37.7520, "lon": 38.2910 },
        { "name": "Adıyaman Valiliği & Demokrasi Parkı", "lat": 37.7635, "lon": 38.2770 },
        { "name": "Adıyaman Üniversitesi (Altınşehir Kampüsü)", "lat": 37.7470, "lon": 38.2320 },
        { "name": "Kahta Otobüs Terminali & Cendere Köprüsü Bağlantısı", "lat": 37.7850, "lon": 38.6250 },
        { "name": "Nemrut Dağı Milli Parkı & Karadut Giriş İstasyonu", "lat": 37.9420, "lon": 38.7180 },
        { "name": "Gölbaşı Otogarı & Doğu Anadolu Kavşağı", "lat": 37.7860, "lon": 37.6430 }
    ],

    "Adana": [
        { "name": "Adana Büyükşehir Otobüs Terminali (Seyhan)", "lat": 36.9914, "lon": 35.2842 },
        { "name": "Tarihi Taşköprü & Seyhan Nehri Caddesi", "lat": 36.9865, "lon": 35.3340 },
        { "name": "Sabancı Merkez Camii & Merkez Park", "lat": 36.9920, "lon": 35.3280 },
        { "name": "İnönü Parkı & Adana Valilik Meydanı", "lat": 36.9950, "lon": 35.3230 },
        { "name": "Adana Tren Garı (İstasyon Meydanı)", "lat": 37.0030, "lon": 35.3180 },
        { "name": "Çukurova Üniversitesi Balcalı Yerleşkesi", "lat": 37.0580, "lon": 35.3550 }
    ],

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
    "Adana": [
        {
            "id": "adana_hat_101_ceyhan",
            "hatNo": "101",
            "name": "101 ADANA SEYHAN (OTOGAR) - CEYHAN EKSPRES",
            "destDistrict": "Ceyhan",
            "originDistrict": "Seyhan",
            "startStop": "Adana Büyükşehir Otobüs Terminali (Seyhan)",
            "endStop": "Ceyhan İlçe Otogarı & Çarşı",
            "intermediateStops": [
                "Yüreğir Otogarı & D-400 Aksı",
                "İncirlik Kavşağı & Otoyol Gişeleri",
                "Yakapınar (Misis Antik Kenti & Tarihi Köprü)",
                "Ceyhan OSB & Sanayi Kavşağı",
                "Ceyhan Kaymakamlığı & İnönü Bulvarı"
            ],
            "desc": "Adana Merkez Seyhan Terminali ile sanayi ve enerji merkezi Ceyhan arası D-400 / O-52 ekspres ilçe seferi.",
            "detailedInstructions": "Adana Seyhan Otogarı peronundan hareket edin, D-400 karayolundan Ceyhan'a ulaşın.",
            "speechBriefing": "101 numaralı Adana Seyhan Ceyhan ilçe seferi. Toplam mesafe 47 kilometredir. İyi yolculuklar kaptan.",
            "color": "#ef4444",
            "stops": [
                { "name": "Adana Büyükşehir Otobüs Terminali (Seyhan)", "anons": "Adana Seyhan Terminali kalkış peronundayız. Ceyhan seferi başlıyor.", "gercekMesafeSonraki": 8 },
                { "name": "Yüreğir Otogarı & D-400 Aksı", "anons": "Yüreğir Otogarı durağı.", "gercekMesafeSonraki": 12 },
                { "name": "Yakapınar (Misis Antik Kenti)", "anons": "Misis Tarihi Köprü durağı.", "gercekMesafeSonraki": 17 },
                { "name": "Ceyhan OSB & Sanayi Kavşağı", "anons": "Ceyhan Sanayi durağı.", "gercekMesafeSonraki": 10 },
                { "name": "Ceyhan İlçe Otogarı & Çarşı", "anons": "Son durak: Ceyhan Otogarı. Seferimiz tamamlanmıştır.", "gercekMesafeSonraki": 0 }
            ]
        },
        {
            "id": "adana_hat_102_karatas",
            "hatNo": "102",
            "name": "102 ADANA SEYHAN - KARATAŞ SAHİL & LİMAN",
            "destDistrict": "Karataş",
            "originDistrict": "Seyhan",
            "startStop": "Tarihi Taşköprü & Seyhan Meydanı",
            "endStop": "Karataş Limanı & Sahil Parkı",
            "intermediateStops": [
                "Taşköprü & Sinanpaşa Meydanı",
                "Doğankent Çukurova Tarım Yolu",
                "Havutlu Meydanı",
                "Tuzla Lagünü & Akyatan Kuş Cenneti Sapağı",
                "Karataş Balıkçı Barınağı"
            ],
            "desc": "Adana Taşköprü'den Akdeniz sahil ilçesi Karataş limanına uzanan sahil ve ova hattı.",
            "detailedInstructions": "Taşköprü'den hareketle Karataş yolunu takip edin ve limana varın.",
            "speechBriefing": "102 numaralı Seyhan Karataş sahil hattı. Mesafe 49 kilometre. İyi yolculuklar.",
            "color": "#06b6d4",
            "stops": [
                { "name": "Tarihi Taşköprü & Seyhan Meydanı", "anons": "Taşköprü hareket durağındayız.", "gercekMesafeSonraki": 10 },
                { "name": "Doğankent Çukurova Tarım Yolu", "anons": "Doğankent durağı.", "gercekMesafeSonraki": 16 },
                { "name": "Havutlu Meydanı", "anons": "Havutlu durağı.", "gercekMesafeSonraki": 13 },
                { "name": "Karataş Limanı & Sahil Parkı", "anons": "Son durak: Karataş Sahil ve Liman.", "gercekMesafeSonraki": 0 }
            ]
        },
        {
            "id": "adana_hat_103_kozan",
            "hatNo": "103",
            "name": "103 ADANA YÜREĞİR - İMAMOĞLU - KOZAN KALESİ",
            "destDistrict": "Kozan",
            "originDistrict": "Yüreğir",
            "startStop": "Yüreğir Otogarı & İpekyolu Bulvarı",
            "endStop": "Tarihi Kozan Kalesi Meydanı",
            "intermediateStops": [
                "Sarıçam Çukurova Üniversitesi Kavşağı",
                "İmamoğlu İlçe Terminali",
                "Ayvalı Geçişi",
                "Kozan Çevre Yolu & Sis Kalesi Etekleri"
            ],
            "desc": "Adana merkezden İmamoğlu ve tarihi Kozan Kalesi eteklerine bağlayan kuzey hattı.",
            "detailedInstructions": "Yüreğir'den Kozan D-815 karayolunu izleyin.",
            "speechBriefing": "103 numaralı Adana Kozan ekspres ilçe hattı. Toplam 68 kilometre.",
            "color": "#eab308",
            "stops": [
                { "name": "Yüreğir Otogarı & İpekyolu Bulvarı", "anons": "Yüreğir Otogarı kalkış durağı.", "gercekMesafeSonraki": 10 },
                { "name": "Sarıçam Balcalı Kavşağı", "anons": "Sarıçam durağı.", "gercekMesafeSonraki": 25 },
                { "name": "İmamoğlu İlçe Terminali", "anons": "İmamoğlu İlçe Terminali.", "gercekMesafeSonraki": 23 },
                { "name": "Tarihi Kozan Kalesi Meydanı", "anons": "Son durak: Kozan Kalesi Meydanı.", "gercekMesafeSonraki": 0 }
            ]
        },
        {
            "id": "adana_hat_104_karaisali",
            "hatNo": "104",
            "name": "104 ADANA ÇUKUROVA - KARAİSALI (VARDA KÖPRÜSÜ)",
            "destDistrict": "Karaisalı",
            "originDistrict": "Çukurova",
            "startStop": "Çukurova Barajyolu Bulvarı",
            "endStop": "Karaisalı İlçe Meydanı & Varda Köprüsü",
            "intermediateStops": [
                "Salbaş Çarşı Durağı",
                "Kapıkaya Kanyonu Girişi",
                "Karaisalı Hükümet Konağı",
                "Tarihi Varda (Alman) Köprüsü Seyir Terası"
            ],
            "desc": "Merkez Çukurova'dan tarihi Varda Alman Demiryolu Köprüsü ve kanyonlara giden doğa ve merkez hattı.",
            "detailedInstructions": "Barajyolundan Salbaş üzerinden Karaisalı merkezine ve Varda Köprüsü'ne gidin.",
            "speechBriefing": "104 numaralı Çukurova Karaisalı hattı. Toplam 50 kilometre.",
            "color": "#10b981",
            "stops": [
                { "name": "Çukurova Barajyolu Bulvarı", "anons": "Çukurova Barajyolu hareket durağındayız.", "gercekMesafeSonraki": 18 },
                { "name": "Salbaş Çarşı Durağı", "anons": "Salbaş durağı.", "gercekMesafeSonraki": 16 },
                { "name": "Kapıkaya Kanyonu Girişi", "anons": "Kapıkaya Kanyonu durağı.", "gercekMesafeSonraki": 16 },
                { "name": "Karaisalı İlçe Meydanı & Varda Köprüsü", "anons": "Son durak: Karaisalı ve Varda Köprüsü.", "gercekMesafeSonraki": 0 }
            ]
        },
        {
            "id": "adana_hat_105_pozanti",
            "hatNo": "105",
            "name": "105 ADANA SEYHAN - POZANTI TOROS GEÇİDİ",
            "destDistrict": "Pozantı",
            "originDistrict": "Seyhan",
            "startStop": "Adana Büyükşehir Otobüs Terminali (Seyhan)",
            "endStop": "Pozantı İlçe Otogarı & Belemedik Girişi",
            "intermediateStops": [
                "Adana Batı Gişeleri & O-21 Otoyolu",
                "Gülek Boğazı Tarihi Geçidi",
                "Akçatekir Yaylası Dinlenme Tesisleri",
                "Pozantı Tren İstasyonu & Çarşı"
            ],
            "desc": "Çukurova'dan Toros Dağları zirvesine, Gülek Boğazı ve Pozantı yaylalarına tırmanan dağ ekspresi.",
            "detailedInstructions": "O-21 Otoyolu boyunca Toros Dağları'na tırmanın, Akçatekir üzerinden Pozantı'ya varın.",
            "speechBriefing": "105 numaralı Seyhan Pozantı Toros hattı. Rakım 780 metre, mesafe 114 kilometre.",
            "color": "#8b5cf6",
            "stops": [
                { "name": "Adana Büyükşehir Otobüs Terminali (Seyhan)", "anons": "Pozantı ekspresi Adana Otogarından hareket ediyor.", "gercekMesafeSonraki": 40 },
                { "name": "Gülek Boğazı Tarihi Geçidi", "anons": "Gülek Boğazı geçidi durağı.", "gercekMesafeSonraki": 45 },
                { "name": "Akçatekir Yaylası Tesisleri", "anons": "Akçatekir Yaylası durağı.", "gercekMesafeSonraki": 29 },
                { "name": "Pozantı İlçe Otogarı & Belemedik", "anons": "Son durak: Pozantı Otogarı. Toroslar geçildi.", "gercekMesafeSonraki": 0 }
            ]
        },
        {
            "id": "adana_hat_106_yumurtalik",
            "hatNo": "106",
            "name": "106 CEYHAN - YUMURTALIK AYAS SAHİLİ",
            "destDistrict": "Yumurtalık",
            "originDistrict": "Ceyhan",
            "startStop": "Ceyhan İlçe Otogarı",
            "endStop": "Yumurtalık Ayas Kalesi & Sahil Kordonu",
            "intermediateStops": [
                "Ceyhan Demirtaş Mahallesi",
                "Kaldırım Köyü Çatalı",
                "Yumurtalık Liman Girişi"
            ],
            "desc": "Ceyhan ilçesinden İskenderun Körfezi kıyısındaki tarihi Ayas Kalesi Yumurtalık sahiline bağlantı hattı.",
            "detailedInstructions": "Ceyhan Otogarından Yumurtalık sahil yoluna çıkın.",
            "speechBriefing": "106 numaralı Ceyhan Yumurtalık hattı. Mesafe 34 kilometre.",
            "color": "#3b82f6",
            "stops": [
                { "name": "Ceyhan İlçe Otogarı", "anons": "Ceyhan Otogarından hareket ediyoruz.", "gercekMesafeSonraki": 12 },
                { "name": "Kaldırım Köyü Çatalı", "anons": "Kaldırım durağı.", "gercekMesafeSonraki": 22 },
                { "name": "Yumurtalık Ayas Kalesi Sahili", "anons": "Son durak: Yumurtalık Ayas Sahili.", "gercekMesafeSonraki": 0 }
            ]
        }
    ],
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
                    "name": "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
                    "anons": "Sonraki durak: Velimeşe Çetin Sokak, Dedebal Caddesi Kavşağı.",
                    "bekleyenYolcu": 8,
                    "inenYolcu": 2,
                    "gercekMesafeSonraki": 0.4,
                    "lat": 41.2520,
                    "lon": 27.8985
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
        },
{
            id: "hat_saray_ekspres",
            hatNo: "Saray Ekspres",
            name: "SÜLEYMANPAŞA - SARAY DİREKT EKSPRES (62 KM)",
            destDistrict: "Saray",
            originDistrict: "Süleymanpaşa",
            startStop: "Süleymanpaşa Yeni Otobüs Terminali",
            endStop: "Saray Belediyesi Otogarı",
            intermediateStops: ["Muratlı Sapağı (D-567)", "Vakıflar Kavşağı (D-567)"],
            desc: "Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Saray Belediyesi Otogarı. D-567 Karayolu (Muratlı-Vakıflar) üzerinden kesintisiz direkt ekspres hat. Toplam 4 durak, tam 62 kilometre.",
            detailedInstructions: "Süleymanpaşa - Saray Direkt Ekspres (62 KM) Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otobüs Terminali durağından bekleyen 36 yolcuyu alarak hareket edin.\n2. Adım: 23 kilometre sonra Muratlı Sapağı (D-567) durağına gidin; yolcuları indirin ve bekleyen yolcuları alıp devam edin.\n3. Adım: 21 kilometre sonra Vakıflar Kavşağı (D-567) durağına gidin; yolcuları indirin ve bekleyen yolcuları alıp devam edin.\n4. Adım (Hedef Son Durak): 18 kilometre sonra Saray Belediyesi Otogarı durağına varın; tüm yolcuları indirin ve 62 kilometrelik ekspres seferi tamamlayın.",
            speechBriefing: "Süleymanpaşa Saray Direkt Ekspres seferi. D-567 karayolu üzerinden toplam 62 kilometrelik ekspres sefer başlıyor. 1. Adım: Süleymanpaşa Terminalinden 36 yolcuyu alarak hareket edin. Güzergâh: Muratlı Sapağı, Vakıflar Kavşağı ve hedef Saray Belediyesi Otogarı.",
            color: "#0284c7",
            otobusKapasitesi: 46,
            biletFiyat: 110,
            biletFiyatMultiplier: 2.2,
            isDistrict: true,
            terrain: "otoyol",
            stops: [
                {
                    name: "Süleymanpaşa Yeni Otobüs Terminali",
                    anons: "Süleymanpaşa Yeni Otobüs Terminali kalkış peronundayız. Saray Direkt Ekspres 62 kilometre seferimiz başlıyor.",
                    bekleyenYolcu: 36,
                    inenYolcu: 0,
                    gercekMesafeSonraki: 23.0,
                    lat: 40.9950,
                    lon: 27.5620
                },
                {
                    name: "Muratlı Sapağı (D-567)",
                    anons: "Sonraki durak: Muratlı Sapağı D-567 bağlantısı.",
                    bekleyenYolcu: 6,
                    inenYolcu: 4,
                    gercekMesafeSonraki: 21.0,
                    lat: 41.1710,
                    lon: 27.5020
                },
                {
                    name: "Vakıflar Kavşağı (D-567)",
                    anons: "Sonraki durak: Vakıflar Kavşağı.",
                    bekleyenYolcu: 5,
                    inenYolcu: 3,
                    gercekMesafeSonraki: 18.0,
                    lat: 41.2700,
                    lon: 27.7000
                },
                {
                    name: "Saray Belediyesi Otogarı",
                    anons: "Son durak: Saray Belediyesi Otogarı. 62 kilometrelik ekspres seferimiz tamamlanmıştır. Lütfen eşyalarınızı unutmayınız.",
                    bekleyenYolcu: 0,
                    inenYolcu: 40,
                    gercekMesafeSonraki: 0,
                    lat: 41.4450,
                    lon: 27.9250
                }
            ]
        },
        {
            id: "hat_35_saray_ici",
            hatNo: "35",
            name: "HAT 35: SARAY İÇİ BELEDİYE RİNGİ (25 DURAK)",
            destDistrict: "Saray",
            originDistrict: "Saray",
            startStop: "Saray Otogar 1 (Giriş Peronu)",
            endStop: "Saray Devlet Hastanesi Ana Giriş",
            intermediateStops: [
                "100. Yıl Atatürk Caddesi 1",
                "Ladin Sokak Parkı",
                "100. Yıl Atatürk Caddesi 2",
                "Mezarlık Caddesi 1",
                "Mezarlık Caddesi 2",
                "Saray Hastane Caddesi 1",
                "Hastane Caddesi 2",
                "Remzi Saker Parkı",
                "Mezarlık Caddesi 3",
                "Cumhuriyet Caddesi Çarşı",
                "Cumhuriyet Caddesi Park Mevkii",
                "Cumhuriyet Caddesi Trafo",
                "Uğur Mumcu Caddesi",
                "Saray Belediyesi (Cumhuriyet Meydanı)",
                "Saray Emniyet Müdürlüğü",
                "İstanbul Caddesi 1",
                "İstanbul Caddesi 2",
                "Midye Caddesi 1",
                "Pazarcık Sağlık Ocağı",
                "Ayvacık Caddesi 1",
                "Türkan Bebek Parkı",
                "Millet Caddesi 1",
                "Depo Caddesi 1"
            ],
            desc: "Kalkış: Saray Otogarı ➔ Varış: Saray Devlet Hastanesi. Saray ilçe merkezini, çarşıyı, Pazarcık ve Kemalpaşa mahallelerini birbirine bağlayan 25 duraklı resmî TEKULAŞ şehir içi ring hattı.",
            detailedInstructions: "Hat 35 Saray İçi Sefer Görev Adımları:\n1. Adım: Saray Otogar 1 peronundan yolcuları alarak hareket edin.\n2. Adım: Çarşı ve mahalle güzergâhı boyunca sırasıyla 25 durakta durup yolcu indirin ve bindirin.\n3. Adım (Hedef Son Durak): Saray Devlet Hastanesi durağında seferi tamamlayın.",
            speechBriefing: "Hat 35 Saray Şehir İçi Seferi başlıyor. Saray Otogarından hareketle 25 durak boyunca Saray Çarşı, Pazarcık, Kemalpaşa ve son durak Saray Devlet Hastanesine ulaşılacaktır.",
            color: "#06b6d4",
            otobusKapasitesi: 32,
            biletFiyat: 18,
            biletFiyatMultiplier: 1.0,
            isDistrict: false,
            isCity: true,
            terrain: "mahalle_asfalt",
            stops: [
                { name: "Saray Otogar 1 (Giriş Peronu)", anons: "Saray Otogar 1 kalkış peronundayız. Hat 35 Saray Şehir İçi seferimiz başlıyor.", bekleyenYolcu: 22, inenYolcu: 0, gercekMesafeSonraki: 0.5, lat: 41.4408, lon: 27.9211 },
                { name: "100. Yıl Atatürk Caddesi 1", anons: "Sonraki durak: 100. Yıl Atatürk Caddesi 1.", bekleyenYolcu: 4, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4367, lon: 27.9157 },
                { name: "Ladin Sokak Parkı", anons: "Sonraki durak: Ladin Sokak Parkı.", bekleyenYolcu: 3, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4325, lon: 27.9109 },
                { name: "100. Yıl Atatürk Caddesi 2", anons: "Sonraki durak: 100. Yıl Atatürk Caddesi 2.", bekleyenYolcu: 3, inenYolcu: 1, gercekMesafeSonraki: 0.4, lat: 41.4353, lon: 27.9138 },
                { name: "Mezarlık Caddesi 1", anons: "Sonraki durak: Mezarlık Caddesi 1.", bekleyenYolcu: 2, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4388, lon: 27.9167 },
                { name: "Mezarlık Caddesi 2", anons: "Sonraki durak: Mezarlık Caddesi 2.", bekleyenYolcu: 3, inenYolcu: 2, gercekMesafeSonraki: 0.3, lat: 41.4417, lon: 27.9124 },
                { name: "Saray Hastane Caddesi 1", anons: "Sonraki durak: Saray Hastane Caddesi 1.", bekleyenYolcu: 4, inenYolcu: 2, gercekMesafeSonraki: 0.3, lat: 41.4423, lon: 27.9103 },
                { name: "Hastane Caddesi 2", anons: "Sonraki durak: Hastane Caddesi 2.", bekleyenYolcu: 3, inenYolcu: 1, gercekMesafeSonraki: 0.4, lat: 41.4427, lon: 27.9069 },
                { name: "Remzi Saker Parkı", anons: "Sonraki durak: Remzi Saker Parkı.", bekleyenYolcu: 5, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4451, lon: 27.9056 },
                { name: "Mezarlık Caddesi 3", anons: "Sonraki durak: Mezarlık Caddesi 3.", bekleyenYolcu: 2, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4457, lon: 27.9088 },
                { name: "Cumhuriyet Caddesi Çarşı", anons: "Sonraki durak: Cumhuriyet Caddesi Çarşı.", bekleyenYolcu: 6, inenYolcu: 3, gercekMesafeSonraki: 0.4, lat: 41.4463, lon: 27.9109 },
                { name: "Cumhuriyet Caddesi Park Mevkii", anons: "Sonraki durak: Cumhuriyet Caddesi Park Mevkii.", bekleyenYolcu: 4, inenYolcu: 2, gercekMesafeSonraki: 0.3, lat: 41.4452, lon: 27.9131 },
                { name: "Cumhuriyet Caddesi Trafo", anons: "Sonraki durak: Cumhuriyet Caddesi Trafo.", bekleyenYolcu: 3, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4432, lon: 27.9164 },
                { name: "Uğur Mumcu Caddesi", anons: "Sonraki durak: Uğur Mumcu Caddesi.", bekleyenYolcu: 5, inenYolcu: 3, gercekMesafeSonraki: 0.4, lat: 41.4443, lon: 27.9178 },
                { name: "Saray Belediyesi (Cumhuriyet Meydanı)", anons: "Sonraki durak: Saray Belediyesi Cumhuriyet Meydanı.", bekleyenYolcu: 8, inenYolcu: 5, gercekMesafeSonraki: 0.4, lat: 41.4422, lon: 27.9204 },
                { name: "Saray Emniyet Müdürlüğü", anons: "Sonraki durak: Saray Emniyet Müdürlüğü.", bekleyenYolcu: 3, inenYolcu: 2, gercekMesafeSonraki: 0.3, lat: 41.4438, lon: 27.9252 },
                { name: "İstanbul Caddesi 1", anons: "Sonraki durak: İstanbul Caddesi 1.", bekleyenYolcu: 4, inenYolcu: 2, gercekMesafeSonraki: 0.3, lat: 41.4447, lon: 27.9259 },
                { name: "İstanbul Caddesi 2", anons: "Sonraki durak: İstanbul Caddesi 2.", bekleyenYolcu: 3, inenYolcu: 2, gercekMesafeSonraki: 0.3, lat: 41.4464, lon: 27.9279 },
                { name: "Midye Caddesi 1", anons: "Sonraki durak: Midye Caddesi 1.", bekleyenYolcu: 4, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4474, lon: 27.9293 },
                { name: "Pazarcık Sağlık Ocağı", anons: "Sonraki durak: Pazarcık Sağlık Ocağı.", bekleyenYolcu: 6, inenYolcu: 3, gercekMesafeSonraki: 0.4, lat: 41.4499, lon: 27.9320 },
                { name: "Ayvacık Caddesi 1", anons: "Sonraki durak: Ayvacık Caddesi 1.", bekleyenYolcu: 3, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4512, lon: 27.9287 },
                { name: "Türkan Bebek Parkı", anons: "Sonraki durak: Türkan Bebek Parkı.", bekleyenYolcu: 4, inenYolcu: 2, gercekMesafeSonraki: 0.5, lat: 41.4531, lon: 27.9274 },
                { name: "Millet Caddesi 1", anons: "Sonraki durak: Millet Caddesi 1.", bekleyenYolcu: 4, inenYolcu: 3, gercekMesafeSonraki: 0.4, lat: 41.4455, lon: 27.9229 },
                { name: "Depo Caddesi 1", anons: "Sonraki durak: Depo Caddesi 1.", bekleyenYolcu: 3, inenYolcu: 2, gercekMesafeSonraki: 0.4, lat: 41.4424, lon: 27.9239 },
                { name: "Saray Devlet Hastanesi Ana Giriş", anons: "Son durak: Saray Devlet Hastanesi Ana Giriş. Hat 35 Saray Şehir İçi seferimiz tamamlanmıştır.", bekleyenYolcu: 0, inenYolcu: 35, gercekMesafeSonraki: 0, lat: 41.4380, lon: 27.9307 }
            ]
        },
        {
        "id": "hat_suleymanpasa_marmaraereglisi",
        "hatNo": "ME-15",
        "name": "SÜLEYMANPAŞA - MARMARAEREĞLİSİ SAHİL EKSPRES",
        "destDistrict": "Marmaraereğlisi",
        "originDistrict": "Süleymanpaşa",
        "startStop": "Süleymanpaşa Yeni Otobüs Terminali",
        "endStop": "Marmaraereğlisi Otogarı",
        "intermediateStops": [
                "Tekirdağ Liman Kavşağı (D-110)",
                "Yeniçiftlik Sahil Kavşağı",
                "Perinthos Antik Kenti Girişi"
        ],
        "desc": "[D-110 / E84 Sahil Devlet Yolu] Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Marmaraereğlisi Otogarı. D-110 Karadeniz-Marmara Sahil Koridoru üzerinden komşu ilçeye kesintisiz sahil ekspres hattı. Toplam 5 durak, 38 km.",
        "detailedInstructions": "Süleymanpaşa - Marmaraereğlisi Sahil Ekspres Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otobüs Terminalinden 32 yolcuyu alarak hareket edin.\n2. Adım: 6 km sonra Liman Kavşağı durağına varın.\n3. Adım: 22 km sonra Yeniçiftlik Sahil Kavşağı durağında yolcu indirme/bindirme yapın.\n4. Adım: 8.5 km sonra Perinthos Antik Kenti durağına uğrayın.\n5. Adım (Hedef Son Durak): 1.5 km sonra Marmaraereğlisi Otogarında görevi tamamlayın.",
        "speechBriefing": "Resmi D-110 / E84 Sahil Devlet Yolu güzergahında Süleymanpaşa Marmaraereğlisi Sahil Ekspres seferi. D-110 sahil yolu üzerinden komşu ilçemiz Marmaraereğlisi'ne 38 kilometrelik sefer başlıyor. İyi yolculuklar kaptan.",
        "color": "#0ea5e9",
        "otobusKapasitesi": 42,
        "biletFiyat": 70,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "sahil",
        "totalKm": 38.0,
        "stops": [
                {
                        "name": "Süleymanpaşa Yeni Otobüs Terminali",
                        "anons": "Süleymanpaşa Yeni Otogar peronundayız. Marmaraereğlisi Sahil Ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 32,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 40.995,
                        "lon": 27.562
                },
                {
                        "name": "Tekirdağ Liman Kavşağı (D-110)",
                        "anons": "Sonraki durak: Tekirdağ Liman Kavşağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 22.0,
                        "lat": 40.976,
                        "lon": 27.53
                },
                {
                        "name": "Yeniçiftlik Sahil Kavşağı",
                        "anons": "Sonraki durak: Yeniçiftlik Sahil Kavşağı.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 8.5,
                        "lat": 40.981,
                        "lon": 28.005
                },
                {
                        "name": "Perinthos Antik Kenti Girişi",
                        "anons": "Sonraki durak: Perinthos Antik Kenti Girişi.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 1.5,
                        "lat": 40.971,
                        "lon": 27.958
                },
                {
                        "name": "Marmaraereğlisi Otogarı",
                        "anons": "Son durak: Marmaraereğlisi Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 36,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.9686,
                        "lon": 27.9553
                }
        ],
        "karayolu": "D-110 / E84 Sahil Devlet Yolu"
},
        {
        "id": "hat_suleymanpasa_hayrabolu",
        "hatNo": "HB-25",
        "name": "SÜLEYMANPAŞA - HAYRABOLU OVA EKSPRES",
        "destDistrict": "Hayrabolu",
        "originDistrict": "Süleymanpaşa",
        "startStop": "Süleymanpaşa Yeni Otobüs Terminali",
        "endStop": "Hayrabolu Otogarı & Meydan",
        "intermediateStops": [
                "Banarlı Kavşağı (D-555)",
                "Bıyıkali Tarım Bölgesi",
                "Karacakılavuz Sapağı"
        ],
        "desc": "[D-555 Tekirdağ-Hayrabolu Karayolu] Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Hayrabolu Otogarı. D-555 üzerinden Trakya ayçiçeği tarlaları ve komşu ilçe Hayrabolu ova aksı. Toplam 5 durak, 52 km.",
        "detailedInstructions": "Süleymanpaşa - Hayrabolu Ova Ekspres Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otogardan 35 yolcuyu alarak hareket edin.\n2. Adım: 12 km sonra Banarlı Kavşağında durun.\n3. Adım: 15 km sonra Bıyıkali durağında durun.\n4. Adım: 14 km sonra Karacakılavuz Sapağı durağında yolcu indirin.\n5. Adım (Hedef Son Durak): 11 km sonra Hayrabolu Otogarına vararak seferi bitirin.",
        "speechBriefing": "Süleymanpaşa Hayrabolu Ova Ekspres seferi. D-555 karayolu üzerinden Trakya ovalarını aşarak komşu ilçemiz Hayrabolu'ya uzanan 52 kilometrelik seferimiz başlıyor. İyi sürüşler kaptan.",
        "color": "#eab308",
        "otobusKapasitesi": 44,
        "biletFiyat": 80,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "kirsal",
        "totalKm": 52.0,
        "stops": [
                {
                        "name": "Süleymanpaşa Yeni Otobüs Terminali",
                        "anons": "Süleymanpaşa Yeni Otogar peronundayız. Hayrabolu Ova Ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 35,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 40.995,
                        "lon": 27.562
                },
                {
                        "name": "Banarlı Kavşağı (D-555)",
                        "anons": "Sonraki durak: Banarlı Kavşağı.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 15.0,
                        "lat": 41.055,
                        "lon": 27.425
                },
                {
                        "name": "Bıyıkali Tarım Bölgesi",
                        "anons": "Sonraki durak: Bıyıkali Tarım Bölgesi.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 14.0,
                        "lat": 41.11,
                        "lon": 27.31
                },
                {
                        "name": "Karacakılavuz Sapağı",
                        "anons": "Sonraki durak: Karacakılavuz Sapağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 11.0,
                        "lat": 41.17,
                        "lon": 27.21
                },
                {
                        "name": "Hayrabolu Otogarı & Meydan",
                        "anons": "Son durak: Hayrabolu Otogarı ve Meydan. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 41,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.2153,
                        "lon": 27.1111
                }
        ],
        "karayolu": "D-555 Tekirdağ-Hayrabolu Karayolu"
},
        {
        "id": "hat_suleymanpasa_malkara",
        "hatNo": "ML-35",
        "name": "SÜLEYMANPAŞA - MALKARA BATI KORİDORU",
        "destDistrict": "Malkara",
        "originDistrict": "Süleymanpaşa",
        "startStop": "Süleymanpaşa Yeni Otobüs Terminali",
        "endStop": "Malkara Şehirlerarası Otobüs Terminali",
        "intermediateStops": [
                "Tekirdağ NKÜ Araştırma Hastanesi Kavşağı",
                "İnecik Tarihi Köy Meydanı",
                "Ahievren Tarım Kavşağı"
        ],
        "desc": "[D-110 / E84 Uluslararası Trakya Otoyolu] Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Malkara Otogarı. D-110 / E84 uluslararası ana güzergâh üzerinden komşu ilçe Malkara ekspresi. Toplam 5 durak, 58 km.",
        "detailedInstructions": "Süleymanpaşa - Malkara Batı Koridoru Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otogardan 38 yolcuyu alarak hareket edin.\n2. Adım: 8 km sonra NKÜ Kavşağı durağına varın.\n3. Adım: 20 km sonra İnecik Tarihi Köy durağında durun.\n4. Adım: 18 km sonra Ahievren durağında yolcu indirin.\n5. Adım (Hedef Son Durak): 12 km sonra Malkara Otogarında seferi tamamlayın.",
        "speechBriefing": "Resmi D-110 / E84 Uluslararası Trakya Otoyolu güzergahında Süleymanpaşa Malkara Batı Koridoru seferi. D-110 E84 otoyol aksı boyunca komşu ilçemiz Malkara'ya uzanan 58 kilometrelik ekspres sefer başlıyor. Emniyet kemerlerinizi bağlayınız.",
        "color": "#f97316",
        "otobusKapasitesi": 45,
        "biletFiyat": 85,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "otoyol",
        "totalKm": 58.0,
        "stops": [
                {
                        "name": "Süleymanpaşa Yeni Otobüs Terminali",
                        "anons": "Süleymanpaşa Yeni Otogar peronundayız. Malkara Batı Koridoru seferimiz başlıyor.",
                        "bekleyenYolcu": 38,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 8.0,
                        "lat": 40.995,
                        "lon": 27.562
                },
                {
                        "name": "Tekirdağ NKÜ Araştırma Hastanesi Kavşağı",
                        "anons": "Sonraki durak: Tekirdağ NKÜ Araştırma Hastanesi Kavşağı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 20.0,
                        "lat": 40.993,
                        "lon": 27.575
                },
                {
                        "name": "İnecik Tarihi Köy Meydanı",
                        "anons": "Sonraki durak: İnecik Tarihi Köy Meydanı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 18.0,
                        "lat": 40.935,
                        "lon": 27.24
                },
                {
                        "name": "Ahievren Tarım Kavşağı",
                        "anons": "Sonraki durak: Ahievren Tarım Kavşağı.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 40.908,
                        "lon": 27.05
                },
                {
                        "name": "Malkara Şehirlerarası Otobüs Terminali",
                        "anons": "Son durak: Malkara Şehirlerarası Otobüs Terminali. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 43,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.89,
                        "lon": 26.9011
                }
        ],
        "karayolu": "D-110 / E84 Uluslararası Trakya Otoyolu"
},
        {
        "id": "hat_suleymanpasa_sarkoy",
        "hatNo": "SK-45",
        "name": "SÜLEYMANPAŞA - ŞARKÖY SAHİL & YAYLA EKSPRES",
        "destDistrict": "Şarköy",
        "originDistrict": "Süleymanpaşa",
        "startStop": "Süleymanpaşa Yeni Otobüs Terminali",
        "endStop": "Şarköy İlçe Otogarı & İskele",
        "intermediateStops": [
                "Kumbağ Sahil Meydanı",
                "Yeniköy Orman Seyir Noktası",
                "Uçmakdere Yamaç Paraşütü Alanı",
                "Hoşköy Tarihi Fener",
                "Mürefte Liman & İskele"
        ],
        "desc": "[59-52 Ganos Dağları Sahil Kıyı Yolu] Kalkış: Süleymanpaşa Yeni Otogar ➔ Varış: Şarköy İskele. Kumbağ, Uçmakdere virajları, Ganos Dağları ve Marmara kıyısı boyunca komşu ilçe Şarköy'e uzanan sahil hattı. Toplam 7 durak, 84 km.",
        "detailedInstructions": "Süleymanpaşa - Şarköy Sahil & Yayla Ekspres Görev Adımları:\n1. Adım: Süleymanpaşa Yeni Otogardan 40 yolcuyu alarak hareket edin.\n2. Adım: 14 km sonra Kumbağ Sahil Meydanında durun.\n3. Adım: 12 km sonra Yeniköy durağında durun.\n4. Adım: 11 km sonra Uçmakdere Paraşüt İniş Alanında durun.\n5. Adım: 18 km sonra Hoşköy durağında durun.\n6. Adım: 14 km sonra Mürefte Liman durağına varın.\n7. Adım (Hedef Son Durak): 15 km sonra Şarköy Otogarı ve İskelede seferi tamamlayın.",
        "speechBriefing": "Resmi 59-52 Ganos Dağları Sahil Kıyı Yolu güzergahında Süleymanpaşa Şarköy Sahil ve Yayla Ekspres seferi. Kumbağ, Uçmakdere yamaçları, Hoşköy ve Mürefte üzerinden komşu sahil ilçemiz Şarköy'e uzanan 84 kilometrelik nefes kesici yolculuk başlıyor.",
        "color": "#ec4899",
        "otobusKapasitesi": 44,
        "biletFiyat": 120,
        "biletFiyatMultiplier": 2.2,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "sahil",
        "totalKm": 84.0,
        "stops": [
                {
                        "name": "Süleymanpaşa Yeni Otobüs Terminali",
                        "anons": "Süleymanpaşa Yeni Otogar peronundayız. Şarköy Sahil ve Yayla Ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 40,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 14.0,
                        "lat": 40.995,
                        "lon": 27.562
                },
                {
                        "name": "Kumbağ Sahil Meydanı",
                        "anons": "Sonraki durak: Kumbağ Sahil Meydanı.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 40.865,
                        "lon": 27.46
                },
                {
                        "name": "Yeniköy Orman Seyir Noktası",
                        "anons": "Sonraki durak: Yeniköy Orman Seyir Noktası.",
                        "bekleyenYolcu": 4,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 11.0,
                        "lat": 40.835,
                        "lon": 27.41
                },
                {
                        "name": "Uçmakdere Yamaç Paraşütü Alanı",
                        "anons": "Sonraki durak: Uçmakdere Yamaç Paraşütü İniş Alanı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 18.0,
                        "lat": 40.8,
                        "lon": 27.365
                },
                {
                        "name": "Hoşköy Tarihi Fener",
                        "anons": "Sonraki durak: Hoşköy Tarihi Fener Durağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 14.0,
                        "lat": 40.718,
                        "lon": 27.305
                },
                {
                        "name": "Mürefte Liman & İskele",
                        "anons": "Sonraki durak: Mürefte Liman ve İskele Durağı.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 15.0,
                        "lat": 40.672,
                        "lon": 27.245
                },
                {
                        "name": "Şarköy İlçe Otogarı & İskele",
                        "anons": "Son durak: Şarköy İlçe Otogarı ve İskele. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 49,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.6139,
                        "lon": 27.1128
                }
        ],
        "karayolu": "59-52 Ganos Dağları Sahil Kıyı Yolu"
},
        {
        "id": "hat_corlu_cerkezkoy",
        "hatNo": "ÇOR-ÇER-70",
        "name": "ÇORLU - ÇERKEZKÖY SANAYİ METROPOLÜ",
        "destDistrict": "Çerkezköy",
        "originDistrict": "Çorlu",
        "startStop": "Çorlu Otogar",
        "endStop": "Çerkezköy Otogarı",
        "intermediateStops": [
                "Çorlu Orion AVM & Çevre Yolu",
                "Velimeşe OSB Kavşağı",
                "Kızılpınar Işıklar"
        ],
        "desc": "[D-567 Sanayi Koridoru Otoyolu] Kalkış: Çorlu Otogar ➔ Varış: Çerkezköy Otogarı. Trakya'nın iki dev sanayi komşu ilçesini D-567 üzerinden birbirine bağlayan yoğun ekspres hattı. Toplam 5 durak, 26 km.",
        "detailedInstructions": "Çorlu - Çerkezköy Sanayi Metropolü Görev Adımları:\n1. Adım: Çorlu Otogarından 40 yolcuyu alarak hareket edin.\n2. Adım: 4 km sonra Orion AVM durağında durun.\n3. Adım: 12 km sonra Velimeşe OSB Kavşağında durun.\n4. Adım: 7 km sonra Kızılpınar Işıklar durağında durun.\n5. Adım (Hedef Son Durak): 3 km sonra Çerkezköy Otogarına varıp görevi tamamlayın.",
        "speechBriefing": "Resmi D-567 Sanayi Koridoru Otoyolu güzergahında Çorlu Çerkezköy Sanayi Metropolü seferi. İki komşu sanayi devimizi bağlayan 26 kilometrelik hatta hareket ediyoruz. Velimeşe OSB ve Kızılpınar üzerinden Çerkezköy Otogarına ulaşıyoruz. İyi sürüşler.",
        "color": "#6366f1",
        "otobusKapasitesi": 44,
        "biletFiyat": 55,
        "biletFiyatMultiplier": 1.8,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "otoyol",
        "totalKm": 26.0,
        "stops": [
                {
                        "name": "Çorlu Otogar",
                        "anons": "Çorlu Otogar peronundayız. Çerkezköy Sanayi Metropolü seferimiz başlıyor.",
                        "bekleyenYolcu": 40,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 4.0,
                        "lat": 41.16,
                        "lon": 27.8
                },
                {
                        "name": "Çorlu Orion AVM & Çevre Yolu",
                        "anons": "Sonraki durak: Çorlu Orion AVM ve Çevre Yolu.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 41.17,
                        "lon": 27.82
                },
                {
                        "name": "Velimeşe OSB Kavşağı",
                        "anons": "Sonraki durak: Velimeşe Organize Sanayi Kavşağı.",
                        "bekleyenYolcu": 10,
                        "inenYolcu": 7,
                        "gercekMesafeSonraki": 7.0,
                        "lat": 41.25,
                        "lon": 27.89
                },
                {
                        "name": "Kızılpınar Işıklar",
                        "anons": "Sonraki durak: Kızılpınar Işıklar.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 3.0,
                        "lat": 41.265,
                        "lon": 27.955
                },
                {
                        "name": "Çerkezköy Otogarı",
                        "anons": "Son durak: Çerkezköy Otogarı. Seferimiz başarıyla tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 48,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.2858,
                        "lon": 28.0019
                }
        ],
        "karayolu": "D-567 Sanayi Koridoru Otoyolu"
},
        {
        "id": "hat_corlu_ergene",
        "hatNo": "ÇOR-ERG-72",
        "name": "ÇORLU - ERGENE ŞEHİRSEL BAĞLANTI HATTI",
        "destDistrict": "Ergene",
        "originDistrict": "Çorlu",
        "startStop": "Çorlu Otogar",
        "endStop": "Ergene Hükümet Konağı & Marmaracık Meydan",
        "intermediateStops": [
                "Çorlu Yeni Sanayi Sitesi",
                "Sağlık Mahallesi Meydan",
                "Yeşiltepe Kavşağı"
        ],
        "desc": "[D-100 / Ergene Çevre Bulvarı] Kalkış: Çorlu Otogar ➔ Varış: Ergene Marmaracık. Doğrudan sınır komşusu olan Çorlu ile Ergene'yi birleştiren kesintisiz belediye ekspresi. Toplam 5 durak, 9 km.",
        "detailedInstructions": "Çorlu - Ergene Şehirsel Bağlantı Görev Adımları:\n1. Adım: Çorlu Otogarından 36 yolcuyu alarak hareket edin.\n2. Adım: 2.5 km sonra Çorlu Yeni Sanayi durağında durun.\n3. Adım: 2.5 km sonra Sağlık Mahallesi durağında yolcu indirin/bindirin.\n4. Adım: 2 km sonra Yeşiltepe Kavşağında durun.\n5. Adım (Hedef Son Durak): 2 km sonra Ergene Marmaracık Hükümet Konağında seferi tamamlayın.",
        "speechBriefing": "Resmi D-100 / Ergene Çevre Bulvarı güzergahında Çorlu Ergene Şehirsel Bağlantı seferi. İki komşu ilçemiz arasındaki 9 kilometrelik yoğun hat başlıyor. Duraklarımız Yeni Sanayi, Sağlık Mahallesi ve Yeşiltepe. Hedef Ergene Marmaracık.",
        "color": "#10b981",
        "otobusKapasitesi": 50,
        "biletFiyat": 30,
        "biletFiyatMultiplier": 1.5,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "asfalt",
        "totalKm": 9.0,
        "stops": [
                {
                        "name": "Çorlu Otogar",
                        "anons": "Çorlu Otogar peronundayız. Ergene bağlantı hattı seferimiz başlıyor.",
                        "bekleyenYolcu": 36,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 2.5,
                        "lat": 41.16,
                        "lon": 27.8
                },
                {
                        "name": "Çorlu Yeni Sanayi Sitesi",
                        "anons": "Sonraki durak: Çorlu Yeni Sanayi Sitesi.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 2.5,
                        "lat": 41.172,
                        "lon": 27.77
                },
                {
                        "name": "Sağlık Mahallesi Meydan",
                        "anons": "Sonraki durak: Sağlık Mahallesi Meydan.",
                        "bekleyenYolcu": 9,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.195,
                        "lon": 27.74
                },
                {
                        "name": "Yeşiltepe Kavşağı",
                        "anons": "Sonraki durak: Yeşiltepe Kavşağı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.215,
                        "lon": 27.718
                },
                {
                        "name": "Ergene Hükümet Konağı & Marmaracık Meydan",
                        "anons": "Son durak: Ergene Hükümet Konağı ve Marmaracık Meydan. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 44,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.2281,
                        "lon": 27.7028
                }
        ],
        "karayolu": "D-100 / Ergene Çevre Bulvarı"
},
        {
        "id": "hat_corlu_marmaraereglisi",
        "hatNo": "ÇOR-ME-74",
        "name": "ÇORLU - MARMARAEREĞLİSİ KAVŞAK HATTI",
        "destDistrict": "Marmaraereğlisi",
        "originDistrict": "Çorlu",
        "startStop": "Çorlu Otogar",
        "endStop": "Marmaraereğlisi Otogarı",
        "intermediateStops": [
                "Çorlu Havalimanı Kavşağı (TEQ)",
                "Seymen Köyü Sapağı",
                "Kamara Koyu Sahil Yolu"
        ],
        "desc": "[59-05 Havalimanı Aksı / D-110 Kavşağı] Kalkış: Çorlu Otogar ➔ Varış: Marmaraereğlisi Otogarı. Havalimanı koridoru üzerinden güney komşusu Marmaraereğlisi kıyılarına uzanan ekspres hat. Toplam 5 durak, 22 km.",
        "detailedInstructions": "Çorlu - Marmaraereğlisi Kavşak Hattı Görev Adımları:\n1. Adım: Çorlu Otogarından 34 yolcuyu alarak hareket edin.\n2. Adım: 7 km sonra Havalimanı Kavşağında durun.\n3. Adım: 6 km sonra Seymen Köyü Sapağında durun.\n4. Adım: 6 km sonra Kamara Koyu durağında durun.\n5. Adım (Hedef Son Durak): 3 km sonra Marmaraereğlisi Otogarında görevi tamamlayın.",
        "speechBriefing": "Resmi 59-05 Havalimanı Aksı / D-110 Kavşağı güzergahında Çorlu Marmaraereğlisi Kavşak seferi. Çorlu Havalimanı ve Seymen üzerinden komşu sahil ilçemiz Marmaraereğlisi'ne 22 kilometrelik seferimiz başlıyor. İyi sürüşler dileriz.",
        "color": "#06b6d4",
        "otobusKapasitesi": 44,
        "biletFiyat": 50,
        "biletFiyatMultiplier": 1.8,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "asfalt",
        "totalKm": 22.0,
        "stops": [
                {
                        "name": "Çorlu Otogar",
                        "anons": "Çorlu Otogar peronundayız. Marmaraereğlisi Kavşak seferimiz başlıyor.",
                        "bekleyenYolcu": 34,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 7.0,
                        "lat": 41.16,
                        "lon": 27.8
                },
                {
                        "name": "Çorlu Havalimanı Kavşağı (TEQ)",
                        "anons": "Sonraki durak: Çorlu Atatürk Havalimanı Kavşağı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.135,
                        "lon": 27.89
                },
                {
                        "name": "Seymen Köyü Sapağı",
                        "anons": "Sonraki durak: Seymen Köyü Sapağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.06,
                        "lon": 27.92
                },
                {
                        "name": "Kamara Koyu Sahil Yolu",
                        "anons": "Sonraki durak: Kamara Koyu Sahil Yolu.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 3.0,
                        "lat": 40.985,
                        "lon": 27.94
                },
                {
                        "name": "Marmaraereğlisi Otogarı",
                        "anons": "Son durak: Marmaraereğlisi Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 39,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.9686,
                        "lon": 27.9553
                }
        ],
        "karayolu": "59-05 Havalimanı Aksı / D-110 Kavşağı"
},
        {
        "id": "hat_corlu_muratli",
        "hatNo": "ÇOR-MUR-76",
        "name": "ÇORLU - MURATLI SANAYİ & TREN HATTI",
        "destDistrict": "Muratlı",
        "originDistrict": "Çorlu",
        "startStop": "Çorlu Otogar",
        "endStop": "Muratlı İlçe Otogarı",
        "intermediateStops": [
                "Çorlu Ağır Sanayi Bölgesi",
                "Kırkgöz Köyü Girişi",
                "Muratlı Tren Garı Meydanı"
        ],
        "desc": "[59-75 Çorlu-Muratlı Karayolu] Kalkış: Çorlu Otogar ➔ Varış: Muratlı Otogarı. İki komşu sanayi ve tarım ilçesini D-565 üzerinden bağlayan demiryolu ve karayolu ekspresi. Toplam 5 durak, 24 km.",
        "detailedInstructions": "Çorlu - Muratlı Sanayi & Tren Hattı Görev Adımları:\n1. Adım: Çorlu Otogarından 35 yolcuyu alarak hareket edin.\n2. Adım: 5 km sonra Çorlu Ağır Sanayi Bölgesinde durun.\n3. Adım: 9 km sonra Kırkgöz Köyü durağında durun.\n4. Adım: 8 km sonra Muratlı Tren Garı Meydanında durun.\n5. Adım (Hedef Son Durak): 2 km sonra Muratlı İlçe Otogarında seferi bitirin.",
        "speechBriefing": "Resmi 59-75 Çorlu-Muratlı Karayolu güzergahında Çorlu Muratlı Sanayi ve Tren hattı seferi. Kırkgöz ve Ağır Sanayi üzerinden komşumuz Muratlı'ya 24 kilometrelik seferimiz başlıyor. İyi yolculuklar.",
        "color": "#8b5cf6",
        "otobusKapasitesi": 44,
        "biletFiyat": 50,
        "biletFiyatMultiplier": 1.8,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "asfalt",
        "totalKm": 24.0,
        "stops": [
                {
                        "name": "Çorlu Otogar",
                        "anons": "Çorlu Otogar peronundayız. Muratlı ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 35,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 5.0,
                        "lat": 41.16,
                        "lon": 27.8
                },
                {
                        "name": "Çorlu Ağır Sanayi Bölgesi",
                        "anons": "Sonraki durak: Çorlu Ağır Sanayi Bölgesi.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 9.0,
                        "lat": 41.17,
                        "lon": 27.72
                },
                {
                        "name": "Kırkgöz Köyü Girişi",
                        "anons": "Sonraki durak: Kırkgöz Köyü Girişi.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 8.0,
                        "lat": 41.18,
                        "lon": 27.6
                },
                {
                        "name": "Muratlı Tren Garı Meydanı",
                        "anons": "Sonraki durak: Muratlı Tren Garı Meydanı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.173,
                        "lon": 27.505
                },
                {
                        "name": "Muratlı İlçe Otogarı",
                        "anons": "Son durak: Muratlı İlçe Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 41,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.1717,
                        "lon": 27.5028
                }
        ],
        "karayolu": "59-75 Çorlu-Muratlı Karayolu"
},
        {
        "id": "hat_ergene_muratli",
        "hatNo": "ERG-MUR-77",
        "name": "ERGENE - MURATLI KOMŞU İLÇE HATTI",
        "destDistrict": "Muratlı",
        "originDistrict": "Ergene",
        "startStop": "Ergene Hükümet Konağı & Marmaracık Meydan",
        "endStop": "Muratlı İlçe Otogarı",
        "intermediateStops": [
                "Ulaş Beldesi Çarşı",
                "Misinli Tarım Kavşağı",
                "Muratlı Sanayi Kavşağı"
        ],
        "desc": "[59-75 Ulaş-Misinli-Muratlı İl Yolu] Kalkış: Ergene Marmaracık ➔ Varış: Muratlı Otogarı. Ergene ve Muratlı fiziksel sınır komşuluğunu birleştiren yerel ve sanayi ekspresi. Toplam 5 durak, 18 km.",
        "detailedInstructions": "Ergene - Muratlı Komşu İlçe Hattı Görev Adımları:\n1. Adım: Ergene Marmaracık Hükümet Konağından 30 yolcuyu alın.\n2. Adım: 4 km sonra Ulaş Beldesinde durun.\n3. Adım: 6 km sonra Misinli Kavşağında durun.\n4. Adım: 6 km sonra Muratlı Sanayi durağına varın.\n5. Adım (Hedef Son Durak): 2 km sonra Muratlı Otogarında seferi bitirin.",
        "speechBriefing": "Resmi 59-75 Ulaş-Misinli-Muratlı İl Yolu güzergahında Ergene Muratlı Komşu İlçe seferi. Marmaracık'tan hareket ederek Ulaş ve Misinli üzerinden sınır komşumuz Muratlı Otogarına uzanan 18 kilometrelik seferimiz başlıyor. İyi sürüşler.",
        "color": "#14b8a6",
        "otobusKapasitesi": 42,
        "biletFiyat": 45,
        "biletFiyatMultiplier": 1.7,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "asfalt",
        "totalKm": 18.0,
        "stops": [
                {
                        "name": "Ergene Hükümet Konağı & Marmaracık Meydan",
                        "anons": "Ergene Marmaracık peronundayız. Muratlı komşu ilçe seferimiz başlıyor.",
                        "bekleyenYolcu": 30,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 4.0,
                        "lat": 41.2281,
                        "lon": 27.7028
                },
                {
                        "name": "Ulaş Beldesi Çarşı",
                        "anons": "Sonraki durak: Ulaş Beldesi Çarşı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.215,
                        "lon": 27.65
                },
                {
                        "name": "Misinli Tarım Kavşağı",
                        "anons": "Sonraki durak: Misinli Tarım Kavşağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.2,
                        "lon": 27.58
                },
                {
                        "name": "Muratlı Sanayi Kavşağı",
                        "anons": "Sonraki durak: Muratlı Sanayi Kavşağı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.18,
                        "lon": 27.52
                },
                {
                        "name": "Muratlı İlçe Otogarı",
                        "anons": "Son durak: Muratlı İlçe Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 36,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.1717,
                        "lon": 27.5028
                }
        ],
        "karayolu": "59-75 Ulaş-Misinli-Muratlı İl Yolu"
},
        {
        "id": "hat_ergene_cerkezkoy",
        "hatNo": "ERG-ÇER-79",
        "name": "ERGENE - ÇERKEZKÖY OSB SANAYİ KORİDORU",
        "destDistrict": "Çerkezköy",
        "originDistrict": "Ergene",
        "startStop": "Ergene Hükümet Konağı & Marmaracık Meydan",
        "endStop": "Çerkezköy Otogarı",
        "intermediateStops": [
                "Velimeşe Merkez Meydanı (Atatürk Parkı)",
                "Velimeşe OSB Girişi",
                "Kızılpınar Işıklar"
        ],
        "desc": "[D-567 / Velimeşe OSB Bağlantı Yolu] Kalkış: Ergene Marmaracık ➔ Varış: Çerkezköy Otogarı. Velimeşe Organize Sanayi Bölgesi üzerinden komşu ilçe Çerkezköy'e bağlanan ekspres hat. Toplam 5 durak, 23 km.",
        "detailedInstructions": "Ergene - Çerkezköy OSB Koridoru Görev Adımları:\n1. Adım: Ergene Marmaracık'tan 35 yolcuyu alarak hareket edin.\n2. Adım: 11 km sonra Velimeşe Merkez Meydanında durun.\n3. Adım: 2.5 km sonra Velimeşe OSB Girişinde durun.\n4. Adım: 6.5 km sonra Kızılpınar Işıklarda durun.\n5. Adım (Hedef Son Durak): 3 km sonra Çerkezköy Otogarında seferi tamamlayın.",
        "speechBriefing": "Resmi D-567 / Velimeşe OSB Bağlantı Yolu güzergahında Ergene Çerkezköy OSB Sanayi Koridoru seferi. Velimeşe Organize Sanayi üzerinden sınır komşumuz Çerkezköy'e 23 kilometrelik sanayi seferi başlıyor. İyi sürüşler kaptan.",
        "color": "#3b82f6",
        "otobusKapasitesi": 46,
        "biletFiyat": 50,
        "biletFiyatMultiplier": 1.8,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "asfalt",
        "totalKm": 23.0,
        "stops": [
                {
                        "name": "Ergene Hükümet Konağı & Marmaracık Meydan",
                        "anons": "Ergene Marmaracık peronundayız. Çerkezköy OSB koridoru seferimiz başlıyor.",
                        "bekleyenYolcu": 35,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 11.0,
                        "lat": 41.2281,
                        "lon": 27.7028
                },
                {
                        "name": "Velimeşe Merkez Meydanı (Atatürk Parkı)",
                        "anons": "Sonraki durak: Velimeşe Merkez Meydanı Atatürk Parkı.",
                        "bekleyenYolcu": 9,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 2.5,
                        "lat": 41.254,
                        "lon": 27.902
                },
                {
                        "name": "Velimeşe OSB Girişi",
                        "anons": "Sonraki durak: Velimeşe Organize Sanayi Bölgesi Girişi.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 6.5,
                        "lat": 41.258,
                        "lon": 27.92
                },
                {
                        "name": "Kızılpınar Işıklar",
                        "anons": "Sonraki durak: Kızılpınar Işıklar.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 3.0,
                        "lat": 41.265,
                        "lon": 27.955
                },
                {
                        "name": "Çerkezköy Otogarı",
                        "anons": "Son durak: Çerkezköy Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 43,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.2858,
                        "lon": 28.0019
                }
        ],
        "karayolu": "D-567 / Velimeşe OSB Bağlantı Yolu"
},
        {
        "id": "hat_ergene_kapakli",
        "hatNo": "ERG-KAP-81",
        "name": "ERGENE - KAPAKLI SANAYİ & YILDIZKENT HATTI",
        "destDistrict": "Kapaklı",
        "originDistrict": "Ergene",
        "startStop": "Ergene Hükümet Konağı & Marmaracık Meydan",
        "endStop": "Kapaklı Otogarı",
        "intermediateStops": [
                "Vakıflar Kavşağı (D-567)",
                "Velimeşe Çevre Yolu",
                "Kapaklı Giriş / Yıldızkent Kavşağı"
        ],
        "desc": "[D-567 / Yıldızkent Çevre Koridoru] Kalkış: Ergene Marmaracık ➔ Varış: Kapaklı Otogarı. Vakıflar ve Velimeşe çevre yolu aksından komşu ilçe Kapaklı Yıldızkent'e bağlanan hat. Toplam 5 durak, 28 km.",
        "detailedInstructions": "Ergene - Kapaklı Sanayi Hattı Görev Adımları:\n1. Adım: Ergene Marmaracık'tan 32 yolcuyu alarak hareket edin.\n2. Adım: 8 km sonra Vakıflar Kavşağında durun.\n3. Adım: 12 km sonra Velimeşe Çevre Yolunda durun.\n4. Adım: 6 km sonra Kapaklı Yıldızkent Kavşağında durun.\n5. Adım (Hedef Son Durak): 2 km sonra Kapaklı Otogarında seferi tamamlayın.",
        "speechBriefing": "Resmi D-567 / Yıldızkent Çevre Koridoru güzergahında Ergene Kapaklı Sanayi hattı seferi. Vakıflar ve Yıldızkent üzerinden komşu ilçemiz Kapaklı'ya 28 kilometrelik ekspres seferimiz başlıyor. İyi sürüşler.",
        "color": "#0284c7",
        "otobusKapasitesi": 44,
        "biletFiyat": 55,
        "biletFiyatMultiplier": 1.8,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "otoyol",
        "totalKm": 28.0,
        "stops": [
                {
                        "name": "Ergene Hükümet Konağı & Marmaracık Meydan",
                        "anons": "Ergene Marmaracık peronundayız. Kapaklı ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 32,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 8.0,
                        "lat": 41.2281,
                        "lon": 27.7028
                },
                {
                        "name": "Vakıflar Kavşağı (D-567)",
                        "anons": "Sonraki durak: Vakıflar Kavşağı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 41.27,
                        "lon": 27.7
                },
                {
                        "name": "Velimeşe Çevre Yolu",
                        "anons": "Sonraki durak: Velimeşe Çevre Yolu.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.275,
                        "lon": 27.88
                },
                {
                        "name": "Kapaklı Giriş / Yıldızkent Kavşağı",
                        "anons": "Sonraki durak: Kapaklı Giriş, Yıldızkent Kavşağı.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.309,
                        "lon": 27.984
                },
                {
                        "name": "Kapaklı Otogarı",
                        "anons": "Son durak: Kapaklı Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 41,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.3125,
                        "lon": 27.9786
                }
        ],
        "karayolu": "D-567 / Yıldızkent Çevre Koridoru"
},
        {
        "id": "hat_ergene_saray",
        "hatNo": "ERG-SAR-83",
        "name": "ERGENE - SARAY KUZEY TRAKYA HATTI",
        "destDistrict": "Saray",
        "originDistrict": "Ergene",
        "startStop": "Ergene Hükümet Konağı & Marmaracık Meydan",
        "endStop": "Saray Belediyesi Otogarı",
        "intermediateStops": [
                "Vakıflar Kavşağı (D-567)",
                "Misinköy Orman Koridoru",
                "Büyükyoncalı Meydan"
        ],
        "desc": "[D-567 Vakıflar-Büyükyoncalı-Saray Karayolu] Kalkış: Ergene Marmaracık ➔ Varış: Saray Otogarı. D-567 karayolu ile doğrudan sınır komşusu olan Saray ilçesine uzanan kuzey ekspresi. Toplam 5 durak, 43 km.",
        "detailedInstructions": "Ergene - Saray Kuzey Trakya Hattı Görev Adımları:\n1. Adım: Ergene Marmaracık'tan 36 yolcuyu alarak hareket edin.\n2. Adım: 8 km sonra Vakıflar Kavşağında durun.\n3. Adım: 16 km sonra Misinköy Orman Koridorunda durun.\n4. Adım: 12 km sonra Büyükyoncalı Meydanında durun.\n5. Adım (Hedef Son Durak): 7 km sonra Saray Belediyesi Otogarında seferi bitirin.",
        "speechBriefing": "Resmi D-567 Vakıflar-Büyükyoncalı-Saray Karayolu güzergahında Ergene Saray Kuzey Trakya seferi. Vakıflar ve Büyükyoncalı üzerinden komşumuz Saray Otogarına uzanan 43 kilometrelik sefer başlıyor. Istranca eteklerine tırmanıyoruz. İyi yolculuklar.",
        "color": "#0d9488",
        "otobusKapasitesi": 44,
        "biletFiyat": 70,
        "biletFiyatMultiplier": 1.9,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "kirsal",
        "totalKm": 43.0,
        "stops": [
                {
                        "name": "Ergene Hükümet Konağı & Marmaracık Meydan",
                        "anons": "Ergene Marmaracık peronundayız. Saray Kuzey Trakya seferimiz başlıyor.",
                        "bekleyenYolcu": 36,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 8.0,
                        "lat": 41.2281,
                        "lon": 27.7028
                },
                {
                        "name": "Vakıflar Kavşağı (D-567)",
                        "anons": "Sonraki durak: Vakıflar Kavşağı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 16.0,
                        "lat": 41.27,
                        "lon": 27.7
                },
                {
                        "name": "Misinköy Orman Koridoru",
                        "anons": "Sonraki durak: Misinköy Orman Koridoru.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 41.35,
                        "lon": 27.8
                },
                {
                        "name": "Büyükyoncalı Meydan",
                        "anons": "Sonraki durak: Büyükyoncalı Meydan.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 7.0,
                        "lat": 41.38,
                        "lon": 27.91
                },
                {
                        "name": "Saray Belediyesi Otogarı",
                        "anons": "Son durak: Saray Belediyesi Otogarı. Seferimiz başarıyla tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 43,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.445,
                        "lon": 27.925
                }
        ],
        "karayolu": "D-567 Vakıflar-Büyükyoncalı-Saray Karayolu"
},
        {
        "id": "hat_cerkezkoy_kapakli",
        "hatNo": "ÇER-KAP-80",
        "name": "ÇERKEZKÖY - KAPAKLI METROPOLİTEN HAT",
        "destDistrict": "Kapaklı",
        "originDistrict": "Çerkezköy",
        "startStop": "Çerkezköy Otogarı",
        "endStop": "Kapaklı Otogarı",
        "intermediateStops": [
                "Cengiz Topel Caddesi Kavşağı",
                "Kapaklı Yıldızkent Köprülü Kavşağı"
        ],
        "desc": "[D-567 / Cengiz Topel Metropol Aksı] Kalkış: Çerkezköy Otogarı ➔ Varış: Kapaklı Otogarı. Birbirine bitişik iki komşu sanayi merkezini bağlayan yüksek frekanslı ekspres hat. Toplam 4 durak, 5 km.",
        "detailedInstructions": "Çerkezköy - Kapaklı Metropoliten Hat Görev Adımları:\n1. Adım: Çerkezköy Otogarından 40 yolcuyu alarak hareket edin.\n2. Adım: 1.5 km sonra Cengiz Topel Caddesinde durun.\n3. Adım: 2 km sonra Yıldızkent Köprülü Kavşağında durun.\n4. Adım (Hedef Son Durak): 1.5 km sonra Kapaklı Otogarında seferi bitirin.",
        "speechBriefing": "Resmi D-567 / Cengiz Topel Metropol Aksı güzergahında Çerkezköy Kapaklı Metropoliten seferi. İki komşu ilçemiz arasındaki 5 kilometrelik yoğun ring hattı başlıyor. Yıldızkent üzerinden Kapaklı Otogarına varıyoruz. İyi sürüşler.",
        "color": "#a855f7",
        "otobusKapasitesi": 50,
        "biletFiyat": 25,
        "biletFiyatMultiplier": 1.5,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "sehirici",
        "totalKm": 5.0,
        "stops": [
                {
                        "name": "Çerkezköy Otogarı",
                        "anons": "Çerkezköy Otogar peronundayız. Kapaklı metropoliten seferi başlıyor.",
                        "bekleyenYolcu": 40,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 1.5,
                        "lat": 41.2858,
                        "lon": 28.0019
                },
                {
                        "name": "Cengiz Topel Caddesi Kavşağı",
                        "anons": "Sonraki durak: Cengiz Topel Caddesi Kavşağı.",
                        "bekleyenYolcu": 9,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.295,
                        "lon": 27.99
                },
                {
                        "name": "Kapaklı Yıldızkent Köprülü Kavşağı",
                        "anons": "Sonraki durak: Kapaklı Yıldızkent Köprülü Kavşağı.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 7,
                        "gercekMesafeSonraki": 1.5,
                        "lat": 41.309,
                        "lon": 27.984
                },
                {
                        "name": "Kapaklı Otogarı",
                        "anons": "Son durak: Kapaklı Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 44,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.3125,
                        "lon": 27.9786
                }
        ],
        "karayolu": "D-567 / Cengiz Topel Metropol Aksı"
},
        {
        "id": "hat_kapakli_saray",
        "hatNo": "KAP-SAR-85",
        "name": "KAPAKLI - SARAY ORMAN HATTI",
        "destDistrict": "Saray",
        "originDistrict": "Kapaklı",
        "startStop": "Kapaklı Otogarı",
        "endStop": "Saray Belediyesi Otogarı",
        "intermediateStops": [
                "Büyükyoncalı Sanayi Sapağı",
                "Küçükyoncalı Girişi",
                "Saray Çarşı Meydanı"
        ],
        "desc": "[D-567 Kapaklı-Saray Orman Koridoru] Kalkış: Kapaklı Otogarı ➔ Varış: Saray Belediyesi Otogarı. D-567 üzerinden orman kuşağına ve komşu ilçe Saray'a uzanan ekspres hat. Toplam 5 durak, 15 km.",
        "detailedInstructions": "Kapaklı - Saray Orman Hattı Görev Adımları:\n1. Adım: Kapaklı Otogarından 36 yolcuyu alarak hareket edin.\n2. Adım: 5 km sonra Büyükyoncalı durağında durun.\n3. Adım: 4 km sonra Küçükyoncalı Girişinde durun.\n4. Adım: 4.5 km sonra Saray Çarşı Meydanında durun.\n5. Adım (Hedef Son Durak): 1.5 km sonra Saray Otogarında seferi bitirin.",
        "speechBriefing": "Resmi D-567 Kapaklı-Saray Orman Koridoru güzergahında Kapaklı Saray Orman hattı seferi. Büyükyoncalı ve Küçükyoncalı üzerinden komşumuz Saray'a 15 kilometrelik ekspres seferimiz başlıyor. İyi sürüşler dileriz.",
        "color": "#84cc16",
        "otobusKapasitesi": 44,
        "biletFiyat": 45,
        "biletFiyatMultiplier": 1.7,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "kirsal",
        "totalKm": 15.0,
        "stops": [
                {
                        "name": "Kapaklı Otogarı",
                        "anons": "Kapaklı Otogar peronundayız. Saray Orman Hattı seferimiz başlıyor.",
                        "bekleyenYolcu": 36,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 5.0,
                        "lat": 41.3125,
                        "lon": 27.9786
                },
                {
                        "name": "Büyükyoncalı Sanayi Sapağı",
                        "anons": "Sonraki durak: Büyükyoncalı Sanayi Sapağı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 4.0,
                        "lat": 41.36,
                        "lon": 27.94
                },
                {
                        "name": "Küçükyoncalı Girişi",
                        "anons": "Sonraki durak: Küçükyoncalı Girişi.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 4.5,
                        "lat": 41.4,
                        "lon": 27.93
                },
                {
                        "name": "Saray Çarşı Meydanı",
                        "anons": "Sonraki durak: Saray Çarşı Meydanı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 1.5,
                        "lat": 41.4422,
                        "lon": 27.9204
                },
                {
                        "name": "Saray Belediyesi Otogarı",
                        "anons": "Son durak: Saray Belediyesi Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 41,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.445,
                        "lon": 27.925
                }
        ],
        "karayolu": "D-567 Kapaklı-Saray Orman Koridoru"
},
        {
        "id": "hat_hayrabolu_muratli",
        "hatNo": "HB-MUR-98",
        "name": "HAYRABOLU - MURATLI DEMİRYOLU BAĞLANTISI",
        "destDistrict": "Muratlı",
        "originDistrict": "Hayrabolu",
        "startStop": "Hayrabolu Otogarı & Meydan",
        "endStop": "Muratlı İlçe Otogarı",
        "intermediateStops": [
                "Şalgamlı Tarım Beldesi",
                "Yurtbelen Sapağı",
                "Muratlı Giriş Işıklar"
        ],
        "desc": "[59-02 Şalgamlı-Muratlı İl Yolu] Kalkış: Hayrabolu Otogarı ➔ Varış: Muratlı Otogarı. İki komşu tarım ve demiryolu ilçesini birleştiren Trakya iç ekspresi. Toplam 5 durak, 44 km.",
        "detailedInstructions": "Hayrabolu - Muratlı Demiryolu Bağlantısı Görev Adımları:\n1. Adım: Hayrabolu Otogarından 32 yolcuyu alarak hareket edin.\n2. Adım: 15 km sonra Şalgamlı durağında durun.\n3. Adım: 16 km sonra Yurtbelen Sapağında durun.\n4. Adım: 10 km sonra Muratlı Giriş Işıklarda durun.\n5. Adım (Hedef Son Durak): 3 km sonra Muratlı Otogarında seferi bitirin.",
        "speechBriefing": "Resmi 59-02 Şalgamlı-Muratlı İl Yolu güzergahında Hayrabolu Muratlı Demiryolu Bağlantısı seferi. Şalgamlı üzerinden komşumuz Muratlı'ya 44 kilometrelik Trakya seferimiz başlıyor. İyi sürüşler kaptan.",
        "color": "#a855f7",
        "otobusKapasitesi": 42,
        "biletFiyat": 70,
        "biletFiyatMultiplier": 1.9,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "kirsal",
        "totalKm": 44.0,
        "stops": [
                {
                        "name": "Hayrabolu Otogarı & Meydan",
                        "anons": "Hayrabolu Otogar peronundayız. Muratlı ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 32,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 15.0,
                        "lat": 41.2153,
                        "lon": 27.1111
                },
                {
                        "name": "Şalgamlı Tarım Beldesi",
                        "anons": "Sonraki durak: Şalgamlı Tarım Beldesi.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 16.0,
                        "lat": 41.2,
                        "lon": 27.27
                },
                {
                        "name": "Yurtbelen Sapağı",
                        "anons": "Sonraki durak: Yurtbelen Sapağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 10.0,
                        "lat": 41.19,
                        "lon": 27.42
                },
                {
                        "name": "Muratlı Giriş Işıklar",
                        "anons": "Sonraki durak: Muratlı Giriş Işıklar.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 3.0,
                        "lat": 41.178,
                        "lon": 27.48
                },
                {
                        "name": "Muratlı İlçe Otogarı",
                        "anons": "Son durak: Muratlı İlçe Otogarı. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 37,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.1717,
                        "lon": 27.5028
                }
        ],
        "karayolu": "59-02 Şalgamlı-Muratlı İl Yolu"
},
        {
        "id": "hat_hayrabolu_malkara",
        "hatNo": "HB-ML-95",
        "name": "HAYRABOLU - MALKARA İÇ TRAKYA HATTI",
        "destDistrict": "Malkara",
        "originDistrict": "Hayrabolu",
        "startStop": "Hayrabolu Otogarı & Meydan",
        "endStop": "Malkara Şehirlerarası Otobüs Terminali",
        "intermediateStops": [
                "Karakavak Köyü Girişi",
                "Balabancık Beldesi Meydanı",
                "Malkara Sanayi Sitesi"
        ],
        "desc": "[59-01 Balabancık-Malkara Ova Yolu] Kalkış: Hayrabolu Otogarı ➔ Varış: Malkara Otogarı. Komşu iki iç Trakya ilçesini birleştiren tarım ve maden ekspresi. Toplam 5 durak, 46 km.",
        "detailedInstructions": "Hayrabolu - Malkara İç Trakya Hattı Görev Adımları:\n1. Adım: Hayrabolu Otogarından 30 yolcuyu alarak hareket edin.\n2. Adım: 14 km sonra Karakavak Köyünde durun.\n3. Adım: 16 km sonra Balabancık Beldesinde durun.\n4. Adım: 13 km sonra Malkara Sanayi Sitesinde durun.\n5. Adım (Hedef Son Durak): 3 km sonra Malkara Otogarında seferi tamamlayın.",
        "speechBriefing": "Resmi 59-01 Balabancık-Malkara Ova Yolu güzergahında Hayrabolu Malkara İç Trakya hattı seferi. Balabancık ovaları üzerinden komşu ilçemiz Malkara'ya uzanan 46 kilometrelik seferimiz başlıyor. İyi sürüşler dileriz.",
        "color": "#d97706",
        "otobusKapasitesi": 42,
        "biletFiyat": 75,
        "biletFiyatMultiplier": 1.9,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "kirsal",
        "totalKm": 46.0,
        "stops": [
                {
                        "name": "Hayrabolu Otogarı & Meydan",
                        "anons": "Hayrabolu Otogar peronundayız. Malkara ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 30,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 14.0,
                        "lat": 41.2153,
                        "lon": 27.1111
                },
                {
                        "name": "Karakavak Köyü Girişi",
                        "anons": "Sonraki durak: Karakavak Köyü Girişi.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 16.0,
                        "lat": 41.1,
                        "lon": 27.05
                },
                {
                        "name": "Balabancık Beldesi Meydanı",
                        "anons": "Sonraki durak: Balabancık Beldesi Meydanı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 13.0,
                        "lat": 41.01,
                        "lon": 26.98
                },
                {
                        "name": "Malkara Sanayi Sitesi",
                        "anons": "Sonraki durak: Malkara Sanayi Sitesi.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 3.0,
                        "lat": 40.91,
                        "lon": 26.92
                },
                {
                        "name": "Malkara Şehirlerarası Otobüs Terminali",
                        "anons": "Son durak: Malkara Şehirlerarası Otobüs Terminali. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 37,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.89,
                        "lon": 26.9011
                }
        ],
        "karayolu": "59-01 Balabancık-Malkara Ova Yolu"
},
        {
        "id": "hat_malkara_sarkoy",
        "hatNo": "ML-SK-90",
        "name": "MALKARA - ŞARKÖY DAĞ & SAHİL HATTI",
        "destDistrict": "Şarköy",
        "originDistrict": "Malkara",
        "startStop": "Malkara Şehirlerarası Otobüs Terminali",
        "endStop": "Şarköy İlçe Otogarı & İskele",
        "intermediateStops": [
                "Sağlamtaş Beldesi Girişi",
                "Çınarlı Köy Meydanı",
                "Şarköy Tepe Seyir Terası"
        ],
        "desc": "[59-03 Sağlamtaş Dağ Geçidi & Bağ Yolu] Kalkış: Malkara Otogarı ➔ Varış: Şarköy İskele. Malkara platosundan Marmara sahiline komşu ilçe Şarköy'e inen orman ve bağ rotası. Toplam 5 durak, 48 km.",
        "detailedInstructions": "Malkara - Şarköy Dağ & Sahil Hattı Görev Adımları:\n1. Adım: Malkara Otogarından 35 yolcuyu alarak hareket edin.\n2. Adım: 16 km sonra Sağlamtaş Beldesinde durun.\n3. Adım: 18 km sonra Çınarlı Köyünde durun.\n4. Adım: 10 km sonra Tepe Seyir Terasında durun.\n5. Adım (Hedef Son Durak): 4 km sonra Şarköy İskelesinde seferi bitirin.",
        "speechBriefing": "Resmi 59-03 Sağlamtaş Dağ Geçidi & Bağ Yolu güzergahında Malkara Şarköy Dağ ve Sahil hattı seferi. Sağlamtaş ve Çınarlı üzerinden komşu sahil ilçemiz Şarköy'e inen 48 kilometrelik seferimiz başlıyor. Virajlara dikkat ediniz.",
        "color": "#db2777",
        "otobusKapasitesi": 42,
        "biletFiyat": 75,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isKomsuRoute": true,
        "terrain": "daglik",
        "totalKm": 48.0,
        "stops": [
                {
                        "name": "Malkara Şehirlerarası Otobüs Terminali",
                        "anons": "Malkara Otogar peronundayız. Şarköy seferimiz başlıyor.",
                        "bekleyenYolcu": 35,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 16.0,
                        "lat": 40.89,
                        "lon": 26.9011
                },
                {
                        "name": "Sağlamtaş Beldesi Girişi",
                        "anons": "Sonraki durak: Sağlamtaş Beldesi Girişi.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 18.0,
                        "lat": 40.8,
                        "lon": 26.95
                },
                {
                        "name": "Çınarlı Köy Meydanı",
                        "anons": "Sonraki durak: Çınarlı Köy Meydanı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 10.0,
                        "lat": 40.7,
                        "lon": 27.05
                },
                {
                        "name": "Şarköy Tepe Seyir Terası",
                        "anons": "Sonraki durak: Şarköy Tepe Seyir Terası.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 4.0,
                        "lat": 40.64,
                        "lon": 27.1
                },
                {
                        "name": "Şarköy İlçe Otogarı & İskele",
                        "anons": "Son durak: Şarköy İlçe Otogarı ve İskele. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 40,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.6139,
                        "lon": 27.1128
                }
        ],
        "karayolu": "59-03 Sağlamtaş Dağ Geçidi & Bağ Yolu"
},
        {
        "id": "hat_sinir_marmaraereglisi_silivri",
        "hatNo": "SNR-IST-01",
        "name": "MARMARAEREĞLİSİ - İSTANBUL SİLİVRİ SINIR EKSPRES",
        "destDistrict": "İstanbul (Silivri)",
        "originDistrict": "Marmaraereğlisi",
        "startStop": "Marmaraereğlisi Otogarı",
        "endStop": "Silivri Otogar",
        "intermediateStops": [
                "Gümüşyaka Sahil & İl Sınırı",
                "Silivri Maxi AVM Kavşağı"
        ],
        "desc": "[D-110 / E84 Tekirdağ-İstanbul İl Sınır Yolu] Kalkış: Marmaraereğlisi Otogarı ➔ Varış: Silivri Otogar. D-110 / E84 üzerinden Tekirdağ il sınırını geçip komşu il İstanbul Silivri'ye ulaşan sahil sınır ekspresi. Toplam 4 durak, 25 km.",
        "detailedInstructions": "Marmaraereğlisi - İstanbul Silivri Sınır Ekspres Görev Adımları:\n1. Adım: Marmaraereğlisi Otogarından 38 yolcuyu alarak hareket edin.\n2. Adım: 8 km sonra Gümüşyaka Sahil ve İstanbul İl Sınırında durun.\n3. Adım: 13 km sonra Silivri Maxi AVM Kavşağında durun.\n4. Adım (Hedef Son Durak): 4 km sonra Silivri Otogarında seferi tamamlayın.",
        "speechBriefing": "Resmi D-110 / E84 Tekirdağ-İstanbul İl Sınır Yolu güzergahında Marmaraereğlisi İstanbul Silivri Sınır Ekspres seferi. D-110 otoyolundan Tekirdağ il sınırını aşarak komşu ilimiz İstanbul Silivri Otogarına uzanan 25 kilometrelik sınır seferi başlıyor. İyi sürüşler kaptan.",
        "color": "#38bdf8",
        "otobusKapasitesi": 46,
        "biletFiyat": 65,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isBorderRoute": true,
        "terrain": "sahil",
        "totalKm": 25.0,
        "stops": [
                {
                        "name": "Marmaraereğlisi Otogarı",
                        "anons": "Marmaraereğlisi Otogarı peronundayız. İstanbul Silivri Sınır Ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 38,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 8.0,
                        "lat": 40.9686,
                        "lon": 27.9553
                },
                {
                        "name": "Gümüşyaka Sahil & İl Sınırı",
                        "anons": "Sonraki durak: Gümüşyaka Sahil ve İstanbul İl Sınırı Geçiş Noktası.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 13.0,
                        "lat": 41.015,
                        "lon": 28.06
                },
                {
                        "name": "Silivri Maxi AVM Kavşağı",
                        "anons": "Sonraki durak: Silivri Maxi AVM Kavşağı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 4.0,
                        "lat": 41.06,
                        "lon": 28.2
                },
                {
                        "name": "Silivri Otogar",
                        "anons": "Son durak: Silivri Otogar. İstanbul sınır hattı seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 43,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.074,
                        "lon": 28.247
                }
        ],
        "karayolu": "D-110 / E84 Tekirdağ-İstanbul İl Sınır Yolu"
},
        {
        "id": "hat_sinir_cerkezkoy_silivri",
        "hatNo": "SNR-IST-02",
        "name": "ÇERKEZKÖY - İSTANBUL SİLİVRİ / ÇATALCA SINIR HATTI",
        "destDistrict": "İstanbul (Silivri / Çatalca)",
        "originDistrict": "Çerkezköy",
        "startStop": "Çerkezköy Otogarı",
        "endStop": "Silivri Otogar",
        "intermediateStops": [
                "Değirmenköy Sapağı & İstanbul Sınırı",
                "Kınalı Otoyol Gişeleri (O-3 / O-7)"
        ],
        "desc": "[D-567 & O-3 Kınalı-İstanbul Sınır Koridoru] Kalkış: Çerkezköy Otogarı ➔ Varış: Silivri Otogar. D-567 ve O-3 Kuzey Marmara sanayi koridoru üzerinden komşu il İstanbul'a açılan kapı. Toplam 4 durak, 35 km.",
        "detailedInstructions": "Çerkezköy - Silivri Sınır Hattı Görev Adımları:\n1. Adım: Çerkezköy Otogarından 40 yolcuyu alın.\n2. Adım: 15 km sonra Değirmenköy İstanbul Sınırında durun.\n3. Adım: 14 km sonra Kınalı Otoyol Gişelerinde durun.\n4. Adım (Hedef Son Durak): 6 km sonra Silivri Otogarında seferi bitirin.",
        "speechBriefing": "Resmi D-567 & O-3 Kınalı-İstanbul Sınır Koridoru güzergahında Çerkezköy İstanbul Silivri ve Çatalca sınır koridoru seferi. Değirmenköy ve Kınalı üzerinden komşu ilimiz İstanbul'a uzanan 35 kilometrelik ekspres sefer başlıyor. İyi yolculuklar.",
        "color": "#60a5fa",
        "otobusKapasitesi": 46,
        "biletFiyat": 75,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isBorderRoute": true,
        "terrain": "otoyol",
        "totalKm": 35.0,
        "stops": [
                {
                        "name": "Çerkezköy Otogarı",
                        "anons": "Çerkezköy Otogarı peronundayız. İstanbul Silivri sınır seferimiz başlıyor.",
                        "bekleyenYolcu": 40,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 15.0,
                        "lat": 41.2858,
                        "lon": 28.0019
                },
                {
                        "name": "Değirmenköy Sapağı & İstanbul Sınırı",
                        "anons": "Sonraki durak: Değirmenköy Sapağı ve İstanbul İl Sınırı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 14.0,
                        "lat": 41.175,
                        "lon": 28.12
                },
                {
                        "name": "Kınalı Otoyol Gişeleri (O-3 / O-7)",
                        "anons": "Sonraki durak: Kınalı Otoyol Gişeleri.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.11,
                        "lon": 28.18
                },
                {
                        "name": "Silivri Otogar",
                        "anons": "Son durak: Silivri Otogar. Seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 45,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.074,
                        "lon": 28.247
                }
        ],
        "karayolu": "D-567 & O-3 Kınalı-İstanbul Sınır Koridoru"
},
        {
        "id": "hat_sinir_muratli_luleburgaz",
        "hatNo": "SNR-KIR-01",
        "name": "MURATLI - KIRKLARELİ LÜLEBURGAZ SINIR EKSPRES",
        "destDistrict": "Kırklareli (Lüleburgaz)",
        "originDistrict": "Muratlı",
        "startStop": "Muratlı İlçe Otogarı",
        "endStop": "Lüleburgaz Otogar",
        "intermediateStops": [
                "Muratlı Tren Garı Çıkışı",
                "Büyükkarıştıran Meydanı & İl Sınırı",
                "Lüleburgaz Sanayi Kavşağı"
        ],
        "desc": "[D-565 Tekirdağ-Kırklareli İl Sınır Yolu] Kalkış: Muratlı Otogarı ➔ Varış: Lüleburgaz Otogar. D-565 Tekirdağ - Kırklareli il sınır kapısı demiryolu ve sanayi koridoru. Toplam 5 durak, 24 km.",
        "detailedInstructions": "Muratlı - Lüleburgaz Sınır Ekspres Görev Adımları:\n1. Adım: Muratlı Otogarından 36 yolcuyu alarak hareket edin.\n2. Adım: 2 km sonra Tren Garı durağında durun.\n3. Adım: 12 km sonra Büyükkarıştıran Kırklareli Sınır durağında durun.\n4. Adım: 8 km sonra Lüleburgaz Sanayi Kavşağında durun.\n5. Adım (Hedef Son Durak): 2 km sonra Lüleburgaz Otogarında seferi bitirin.",
        "speechBriefing": "Resmi D-565 Tekirdağ-Kırklareli İl Sınır Yolu güzergahında Muratlı Kırklareli Lüleburgaz Sınır Ekspres seferi. Büyükkarıştıran üzerinden komşu ilimiz Kırklareli'nin en büyük ilçesi Lüleburgaz'a 24 kilometrelik il sınır seferi başlıyor. İyi sürüşler kaptan.",
        "color": "#a78bfa",
        "otobusKapasitesi": 44,
        "biletFiyat": 60,
        "biletFiyatMultiplier": 1.9,
        "isDistrict": true,
        "isBorderRoute": true,
        "terrain": "asfalt",
        "totalKm": 24.0,
        "stops": [
                {
                        "name": "Muratlı İlçe Otogarı",
                        "anons": "Muratlı Otogar peronundayız. Lüleburgaz sınır seferimiz başlıyor.",
                        "bekleyenYolcu": 36,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.1717,
                        "lon": 27.5028
                },
                {
                        "name": "Muratlı Tren Garı Çıkışı",
                        "anons": "Sonraki durak: Muratlı Tren Garı Çıkışı.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 41.175,
                        "lon": 27.505
                },
                {
                        "name": "Büyükkarıştıran Meydanı & İl Sınırı",
                        "anons": "Sonraki durak: Büyükkarıştıran Meydanı ve Kırklareli İl Sınırı.",
                        "bekleyenYolcu": 9,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 8.0,
                        "lat": 41.27,
                        "lon": 27.48
                },
                {
                        "name": "Lüleburgaz Sanayi Kavşağı",
                        "anons": "Sonraki durak: Lüleburgaz Sanayi Kavşağı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.385,
                        "lon": 27.36
                },
                {
                        "name": "Lüleburgaz Otogar",
                        "anons": "Son durak: Lüleburgaz Otogar. Kırklareli sınır seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 45,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.405,
                        "lon": 27.345
                }
        ],
        "karayolu": "D-565 Tekirdağ-Kırklareli İl Sınır Yolu"
},
        {
        "id": "hat_sinir_saray_vize",
        "hatNo": "SNR-KIR-02",
        "name": "SARAY - KIRKLARELİ VİZE DOĞA KORİDORU",
        "destDistrict": "Kırklareli (Vize)",
        "originDistrict": "Saray",
        "startStop": "Saray Belediyesi Otogarı",
        "endStop": "Vize Meydan",
        "intermediateStops": [
                "Küçükyoncalı Sapağı",
                "Çakıllı Beldesi & Kırklareli Sınırı"
        ],
        "desc": "[D-020 Istranca Ormanları Sınır Karayolu] Kalkış: Saray Belediyesi Otogarı ➔ Varış: Vize Meydan. D-020 Istranca Dağları eteklerinde Tekirdağ ile Kırklareli'yi bağlayan doğa ve sınır koridoru. Toplam 4 durak, 22 km.",
        "detailedInstructions": "Saray - Vize Doğa Koridoru Görev Adımları:\n1. Adım: Saray Belediyesi Otogarından 35 yolcuyu alarak hareket edin.\n2. Adım: 6 km sonra Küçükyoncalı Sapağında durun.\n3. Adım: 10 km sonra Çakıllı Beldesi ve Kırklareli Sınır durağında durun.\n4. Adım (Hedef Son Durak): 6 km sonra Vize Hükümet Meydanında seferi tamamlayın.",
        "speechBriefing": "Resmi D-020 Istranca Ormanları Sınır Karayolu güzergahında Saray Kırklareli Vize Doğa Koridoru seferi. D-020 Istranca ormanları boyunca komşu ilimiz Kırklareli'nin Vize ilçesine uzanan 22 kilometrelik sınır seferimiz başlıyor. İyi sürüşler.",
        "color": "#22c55e",
        "otobusKapasitesi": 42,
        "biletFiyat": 55,
        "biletFiyatMultiplier": 1.9,
        "isDistrict": true,
        "isBorderRoute": true,
        "terrain": "kirsal",
        "totalKm": 22.0,
        "stops": [
                {
                        "name": "Saray Belediyesi Otogarı",
                        "anons": "Saray Otogar peronundayız. Kırklareli Vize Doğa Koridoru seferimiz başlıyor.",
                        "bekleyenYolcu": 35,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.445,
                        "lon": 27.925
                },
                {
                        "name": "Küçükyoncalı Sapağı",
                        "anons": "Sonraki durak: Küçükyoncalı Sapağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 10.0,
                        "lat": 41.49,
                        "lon": 27.88
                },
                {
                        "name": "Çakıllı Beldesi & Kırklareli Sınırı",
                        "anons": "Sonraki durak: Çakıllı Beldesi ve Kırklareli İl Sınırı.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 4,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 41.52,
                        "lon": 27.82
                },
                {
                        "name": "Vize Meydan",
                        "anons": "Son durak: Vize Hükümet Meydanı. Kırklareli doğa sınır seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 41,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.572,
                        "lon": 27.765
                }
        ],
        "karayolu": "D-020 Istranca Ormanları Sınır Karayolu"
},
        {
        "id": "hat_sinir_hayrabolu_uzunkopru",
        "hatNo": "SNR-EDR-01",
        "name": "HAYRABOLU - EDİRNE UZUNKÖPRÜ SINIR EKSPRES",
        "destDistrict": "Edirne (Uzunköprü)",
        "originDistrict": "Hayrabolu",
        "startStop": "Hayrabolu Otogarı & Meydan",
        "endStop": "Uzunköprü Meydan",
        "intermediateStops": [
                "Çerkezmüsellim Beldesi",
                "Kırcasalih & Edirne İl Sınırı (D-555)",
                "Tarihi Uzunköprü Girişi"
        ],
        "desc": "[D-555 Tekirdağ-Edirne İl Sınır Yolu] Kalkış: Hayrabolu Otogarı ➔ Varış: Uzunköprü Meydan. D-555 Tekirdağ - Edirne ova koridoru ve tarihi köprü bağlantısı. Toplam 5 durak, 42 km.",
        "detailedInstructions": "Hayrabolu - Uzunköprü Sınır Ekspres Görev Adımları:\n1. Adım: Hayrabolu Otogarından 34 yolcuyu alarak hareket edin.\n2. Adım: 12 km sonra Çerkezmüsellim Beldesinde durun.\n3. Adım: 16 km sonra Kırcasalih Edirne Sınır durağında durun.\n4. Adım: 12 km sonra Tarihi Uzunköprü Girişinde durun.\n5. Adım (Hedef Son Durak): 2 km sonra Uzunköprü Meydanında görevi tamamlayın.",
        "speechBriefing": "Resmi D-555 Tekirdağ-Edirne İl Sınır Yolu güzergahında Hayrabolu Edirne Uzunköprü Sınır Ekspres seferi. Ergene Ovası boyunca komşu ilimiz Edirne'nin Uzunköprü ilçesine uzanan 42 kilometrelik sınır hattı başlıyor. Dünyanın en uzun taş köprüsüne varıyoruz. İyi yolculuklar.",
        "color": "#f59e0b",
        "otobusKapasitesi": 44,
        "biletFiyat": 75,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isBorderRoute": true,
        "terrain": "kirsal",
        "totalKm": 42.0,
        "stops": [
                {
                        "name": "Hayrabolu Otogarı & Meydan",
                        "anons": "Hayrabolu Otogar peronundayız. Edirne Uzunköprü sınır ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 34,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 41.2153,
                        "lon": 27.1111
                },
                {
                        "name": "Çerkezmüsellim Beldesi",
                        "anons": "Sonraki durak: Çerkezmüsellim Beldesi.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 16.0,
                        "lat": 41.25,
                        "lon": 27.0
                },
                {
                        "name": "Kırcasalih & Edirne İl Sınırı (D-555)",
                        "anons": "Sonraki durak: Kırcasalih ve Edirne İl Sınırı Geçiş Noktası.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 41.27,
                        "lon": 26.85
                },
                {
                        "name": "Tarihi Uzunköprü Girişi",
                        "anons": "Sonraki durak: UNESCO Mirası Tarihi Taş Uzunköprü Girişi.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 2.0,
                        "lat": 41.265,
                        "lon": 26.69
                },
                {
                        "name": "Uzunköprü Meydan",
                        "anons": "Son durak: Uzunköprü Meydan. Edirne sınır ekspres seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 41,
                        "gercekMesafeSonraki": 0,
                        "lat": 41.268,
                        "lon": 26.685
                }
        ],
        "karayolu": "D-555 Tekirdağ-Edirne İl Sınır Yolu"
},
        {
        "id": "hat_sinir_malkara_kesan",
        "hatNo": "SNR-EDR-02",
        "name": "MALKARA - EDİRNE KEŞAN SINIR EKSPRES",
        "destDistrict": "Edirne (Keşan)",
        "originDistrict": "Malkara",
        "startStop": "Malkara Şehirlerarası Otobüs Terminali",
        "endStop": "Keşan Otogar",
        "intermediateStops": [
                "İbrice Maden Sapağı",
                "Yenimuhacir Beldesi & Edirne İl Sınırı"
        ],
        "desc": "[D-110 / E84 İpsala-Keşan Uluslararası Aksı] Kalkış: Malkara Otogarı ➔ Varış: Keşan Otogar. D-110 / E84 uluslararası anayolu üzerinden Tekirdağ'dan komşu il Edirne'nin Keşan kavşağına uzanan ekspres hat. Toplam 4 durak, 28 km.",
        "detailedInstructions": "Malkara - Keşan Sınır Ekspres Görev Adımları:\n1. Adım: Malkara Otogarından 38 yolcuyu alarak hareket edin.\n2. Adım: 10 km sonra İbrice Maden Sapağında durun.\n3. Adım: 12 km sonra Yenimuhacir ve Edirne İl Sınırında durun.\n4. Adım (Hedef Son Durak): 6 km sonra Keşan Otogarında seferi bitirin.",
        "speechBriefing": "Resmi D-110 / E84 İpsala-Keşan Uluslararası Aksı güzergahında Malkara Edirne Keşan Sınır Ekspres seferi. D-110 E84 koridoru üzerinden komşu ilimiz Edirne Keşan Otogarına 28 kilometrelik sınır seferimiz başlıyor. Ege ve İpsala bağlantı kavşağına doğru yoldayız. İyi sürüşler.",
        "color": "#f97316",
        "otobusKapasitesi": 46,
        "biletFiyat": 65,
        "biletFiyatMultiplier": 2.0,
        "isDistrict": true,
        "isBorderRoute": true,
        "terrain": "otoyol",
        "totalKm": 28.0,
        "stops": [
                {
                        "name": "Malkara Şehirlerarası Otobüs Terminali",
                        "anons": "Malkara Otogar peronundayız. Edirne Keşan sınır ekspres seferimiz başlıyor.",
                        "bekleyenYolcu": 38,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 10.0,
                        "lat": 40.89,
                        "lon": 26.9011
                },
                {
                        "name": "İbrice Maden Sapağı",
                        "anons": "Sonraki durak: İbrice Maden Sapağı.",
                        "bekleyenYolcu": 5,
                        "inenYolcu": 2,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 40.87,
                        "lon": 26.78
                },
                {
                        "name": "Yenimuhacir Beldesi & Edirne İl Sınırı",
                        "anons": "Sonraki durak: Yenimuhacir Beldesi ve Edirne İl Sınırı.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 40.86,
                        "lon": 26.69
                },
                {
                        "name": "Keşan Otogar",
                        "anons": "Son durak: Keşan Şehirlerarası Otobüs Terminali. Edirne sınır seferimiz başarıyla tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 44,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.854,
                        "lon": 26.63
                }
        ],
        "karayolu": "D-110 / E84 İpsala-Keşan Uluslararası Aksı"
},
        {
        "id": "hat_sinir_sarkoy_gelibolu",
        "hatNo": "SNR-CNK-01",
        "name": "ŞARKÖY - ÇANAKKALE GELİBOLU BOĞAZ KORİDORU",
        "destDistrict": "Çanakkale (Gelibolu)",
        "originDistrict": "Şarköy",
        "startStop": "Şarköy İlçe Otogarı & İskele",
        "endStop": "Gelibolu Otogar",
        "intermediateStops": [
                "Kavakköy Girişi",
                "Evreşe Ovası & Çanakkale İl Sınırı (D-120)",
                "Bolayır Tarihi Tepe"
        ],
        "desc": "[D-120 Saros Körfezi & 1915 Köprüsü Aksı] Kalkış: Şarköy İskele ➔ Varış: Gelibolu Otogar. D-120 üzerinden Saros Körfezi kıyısı boyunca komşu il Çanakkale Gelibolu Yarımadasına ve 1915 Köprüsü aksına uzanan hat. Toplam 5 durak, 45 km.",
        "detailedInstructions": "Şarköy - Gelibolu Boğaz Koridoru Görev Adımları:\n1. Adım: Şarköy İskelesinden 40 yolcuyu alarak hareket edin.\n2. Adım: 12 km sonra Kavakköy durağında durun.\n3. Adım: 15 km sonra Evreşe ve Çanakkale İl Sınır durağında durun.\n4. Adım: 12 km sonra Bolayır durağında durun.\n5. Adım (Hedef Son Durak): 6 km sonra Gelibolu Otogarında seferi bitirin.",
        "speechBriefing": "Resmi D-120 Saros Körfezi & 1915 Köprüsü Aksı güzergahında Şarköy Çanakkale Gelibolu Boğaz Koridoru seferi. Marmara'dan Saros Körfezi'ne uzanarak komşu ilimiz Çanakkale Gelibolu'ya 45 kilometrelik tarihi seferimiz başlıyor. Şehitler coğrafyasına hoş geldiniz. İyi yolculuklar.",
        "color": "#ef4444",
        "otobusKapasitesi": 46,
        "biletFiyat": 80,
        "biletFiyatMultiplier": 2.2,
        "isDistrict": true,
        "isBorderRoute": true,
        "terrain": "sahil",
        "totalKm": 45.0,
        "stops": [
                {
                        "name": "Şarköy İlçe Otogarı & İskele",
                        "anons": "Şarköy İskele peronundayız. Çanakkale Gelibolu Boğaz Koridoru seferimiz başlıyor.",
                        "bekleyenYolcu": 40,
                        "inenYolcu": 0,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 40.6139,
                        "lon": 27.1128
                },
                {
                        "name": "Kavakköy Girişi",
                        "anons": "Sonraki durak: Kavakköy Girişi.",
                        "bekleyenYolcu": 6,
                        "inenYolcu": 3,
                        "gercekMesafeSonraki": 15.0,
                        "lat": 40.6,
                        "lon": 26.96
                },
                {
                        "name": "Evreşe Ovası & Çanakkale İl Sınırı (D-120)",
                        "anons": "Sonraki durak: Evreşe Ovası ve Çanakkale İl Sınırı.",
                        "bekleyenYolcu": 8,
                        "inenYolcu": 5,
                        "gercekMesafeSonraki": 12.0,
                        "lat": 40.6,
                        "lon": 26.8
                },
                {
                        "name": "Bolayır Tarihi Tepe",
                        "anons": "Sonraki durak: Namık Kemal'in ve Gazi Süleyman Paşa'nın kabrinin bulunduğu Bolayır Tarihi Tepe.",
                        "bekleyenYolcu": 7,
                        "inenYolcu": 6,
                        "gercekMesafeSonraki": 6.0,
                        "lat": 40.54,
                        "lon": 26.75
                },
                {
                        "name": "Gelibolu Otogar",
                        "anons": "Son durak: Gelibolu Otogarı ve Feribot İskelesi. Çanakkale Boğaz koridoru seferimiz tamamlanmıştır.",
                        "bekleyenYolcu": 0,
                        "inenYolcu": 47,
                        "gercekMesafeSonraki": 0,
                        "lat": 40.41,
                        "lon": 26.67
                }
        ],
        "karayolu": "D-120 Saros Körfezi & 1915 Köprüsü Aksı"
}
    ]
};

let routesData = {};

// TEKİRDAĞ 11 İLÇE EKSİKSİZ BAĞLANTI AĞI (18 EKSPRES & BÖLGE HATTI)
if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
    ilceRotalari["Tekirdağ"].forEach(r => {
        if (r && r.id && typeof routesData !== 'undefined') {
            routesData[r.id] = r;
            if (r.hatNo) routesData["hat_" + r.hatNo.toLowerCase().replace(/[^a-z0-9]/g, '_')] = r;
        }
    });
}


// Geriye dönük rota kimliği uyumluluğu (Alias desteği)
if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
    const r26 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "26" || r.hatNo === "226");
    if (r26) {
        // Sadece routesData alias haritalamasi yapilir, ilceRotalari listesine cift kopya eklenmez
        if (typeof routesData !== 'undefined') {
            const r35 = ilceRotalari["Tekirdağ"].find(r => r.id === "hat_35_saray_ici");
            if (r35) {
                routesData["hat_35_saray_ici"] = r35;
                routesData["hat_35"] = r35;
            }
            const rSaray = ilceRotalari["Tekirdağ"].find(r => r.id === "hat_saray_ekspres");
            if (rSaray) routesData["hat_saray_ekspres"] = rSaray;
            routesData["hat_226_suleymanpasa_saray"] = r26;
            routesData["hat_26_suleymanpasa_saray"] = r26;
            routesData["hat_226_suleymanpasa_velimese"] = r26;
            routesData["hat_26_suleymanpasa_velimese"] = r26;
            routesData["hat_226"] = r26;
            routesData["hat_26"] = r26;
        }
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

        // İki yönlü senkronizasyon: ilceRotalari'ndaki tüm ekspres ve ilçe hatlarını tekulasHatVeritabani'na da ekle
        const existingTekulasIds = new Set(window.tekulasHatVeritabani.map(r => r.id));
        ilceRotalari["Tekirdağ"].forEach(r => {
            if (!existingTekulasIds.has(r.id)) {
                existingTekulasIds.add(r.id);
                window.tekulasHatVeritabani.push(r);
            }
        });

        // Geriye dönük rota kimliği uyumluluğu (Alias)
        const r26 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "26" || r.hatNo === "226");
        if (r26 && typeof routesData !== 'undefined') {
            routesData["hat_226_suleymanpasa_saray"] = r26;
            routesData["hat_26_suleymanpasa_saray"] = r26;
            routesData["hat_226_suleymanpasa_velimese"] = r26;
            routesData["hat_26_suleymanpasa_velimese"] = r26;
            routesData["hat_226"] = r26;
            routesData["hat_26"] = r26;
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

/* MAP_ENGINE_HIERARCHICAL_ROUTES */
// Yalova ve Bayburt Hiyerarşik Hafif Rota Entegrasyonu
if (typeof MapEngine !== 'undefined') {
    const yalovaMapData = {"city":"Yalova","district":"Merkez","scale":"küçük","memoryFootprint":"~3 KB aktif hat","routes":{"yalova_hat_1":{"id":"yalova_hat_1","hatNo":"1","name":"1 - Feribot İskelesi - Gaziosmanpaşa","city":"Yalova","district":"Merkez","terrain":"sahil","isHierarchical":true,"stops":[{"id":1,"name":"İskele Meydanı (Feribot)","pos":0},{"id":2,"name":"Cumhuriyet Meydanı (Heykel)","pos":450},{"id":3,"name":"Fatih Caddesi Kavşağı","pos":850},{"id":4,"name":"Yalova Devlet Hastanesi","pos":1400},{"id":5,"name":"Gaziosmanpaşa Son Durak","pos":2100}],"streets":["İskele Caddesi","Cumhuriyet Caddesi","Fatih Caddesi","Hastane Yolu","GOP Bulvarı"]},"yalova_hat_2":{"id":"yalova_hat_2","hatNo":"2","name":"2 - Yalova Otogar - Termal Kaplıcaları","city":"Yalova","district":"Termal","terrain":"asfalt","isHierarchical":true,"stops":[{"id":1,"name":"Yalova Şehirlerarası Otobüs Terminali","pos":0},{"id":2,"name":"Yalova Üniversitesi Yerleşkesi","pos":950},{"id":3,"name":"Samanlı Köy Meydanı","pos":2200},{"id":4,"name":"Termal İlçe Meydanı","pos":3600},{"id":5,"name":"Tarihi Termal Kaplıcaları","pos":4500}],"streets":["Bursa Yolu","Üniversite Bulvarı","Samanlı Caddesi","Termal Yolu","Kaplıcalar Caddesi"]},"yalova_hat_3":{"id":"yalova_hat_3","hatNo":"3","name":"3 - İskele - Çınarcık Sahil","city":"Yalova","district":"Çınarcık","terrain":"sahil","isHierarchical":true,"stops":[{"id":1,"name":"Yalova İskele Meydanı","pos":0},{"id":2,"name":"Dörtyol Işıklar","pos":700},{"id":3,"name":"Koruköy Meydanı","pos":2500},{"id":4,"name":"Çınarcık Çamlık","pos":4200},{"id":5,"name":"Çınarcık İskele Son Durak","pos":5200}],"streets":["Sahil Caddesi","Yalova-Armutlu Yolu","Koruköy Yolu","Hasanbaba Caddesi","Barbaros Hayrettin Paşa Bulvarı"]}}};
    const bayburtMapData = {"city":"Bayburt","district":"Merkez","scale":"küçük","memoryFootprint":"~2.5 KB aktif hat","routes":{"bayburt_hat_1":{"id":"bayburt_hat_1","hatNo":"1","name":"1 - Tarihi Saat Kulesi - Çoruh Nehri - Üniversite","city":"Bayburt","district":"Merkez","terrain":"asfalt","isHierarchical":true,"stops":[{"id":1,"name":"Tarihi Saat Kulesi Meydanı","pos":0},{"id":2,"name":"Bayburt Valiliği / Çoruh Park","pos":400},{"id":3,"name":"Ulu Cami Kavşağı","pos":850},{"id":4,"name":"Bayburt Devlet Hastanesi","pos":1600},{"id":5,"name":"Bayburt Üniversitesi Baberti Külliyesi","pos":2800}],"streets":["Cumhuriyet Caddesi","Çoruh Boyu Caddesi","Hastane Caddesi","Külliye Bulvarı"]},"bayburt_hat_2":{"id":"bayburt_hat_2","hatNo":"2","name":"2 - Bayburt Kalesi - Yeni Sanayi Sitesi","city":"Bayburt","district":"Merkez","terrain":"toprak","isHierarchical":true,"stops":[{"id":1,"name":"Tarihi Bayburt Kalesi Girişi","pos":0},{"id":2,"name":"Eski Erzurum Caddesi","pos":650},{"id":3,"name":"Yeni Sanayi Sitesi 1. Blok","pos":1500},{"id":4,"name":"Sanayi Kooperatif Binası","pos":2200}],"streets":["Kale Yolu","Eski Erzurum Caddesi","Sanayi Bulvarı"]}}};
    MapEngine.registerCity(yalovaMapData);
    MapEngine.registerCity(bayburtMapData);

    if (typeof ilceRotalari !== 'undefined') {
        ilceRotalari["Yalova"] = Object.values(yalovaMapData.routes);
        ilceRotalari["Bayburt"] = Object.values(bayburtMapData.routes);
    }
    if (typeof routesData !== 'undefined') {
        Object.values(yalovaMapData.routes).forEach(r => routesData[r.id] = r);
        Object.values(bayburtMapData.routes).forEach(r => routesData[r.id] = r);
    }
}


/* VELİMEŞE MAHALLESİ TAM RİNG ROTASI (30 DURAK) */
const velimeseTumDuraklarListesi = [
  {
    "id": "velimese_durak_1",
    "durakKodu": "1050",
    "name": "Velimeşe Merkez Meydanı (Atatürk Parkı)",
    "cadde": "Atatürk Caddesi",
    "lat": 41.253,
    "lon": 27.899,
    "pos": 0,
    "anons": "Velimeşe Merkez Meydanı, Atatürk Parkı durağındayız. Seferimiz başlamıştır.",
    "bekleyenYolcu": 14,
    "inenYolcu": 0,
    "gercekMesafeSonraki": 0.4
  },
  {
    "id": "velimese_durak_2",
    "durakKodu": "1051",
    "name": "Velimeşe Çetin Sokak (Dedebal Kavşağı)",
    "cadde": "Dedebal Caddesi",
    "lat": 41.252,
    "lon": 27.8985,
    "pos": 400,
    "anons": "Sonraki durak: Velimeşe Çetin Sokak, Dedebal Caddesi Kavşağı.",
    "bekleyenYolcu": 6,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_3",
    "durakKodu": "1052",
    "name": "Velimeşe Dedebal Caddesi",
    "cadde": "Dedebal Caddesi",
    "lat": 41.2525,
    "lon": 27.8995,
    "pos": 750,
    "anons": "Sonraki durak: Velimeşe Dedebal Caddesi.",
    "bekleyenYolcu": 5,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_4",
    "durakKodu": "1053",
    "name": "Velimeşe Çarşı Caddesi (Merkez Camii)",
    "cadde": "Çarşı Caddesi",
    "lat": 41.2515,
    "lon": 27.8975,
    "pos": 1100,
    "anons": "Sonraki durak: Velimeşe Çarşı Caddesi ve Merkez Camii.",
    "bekleyenYolcu": 8,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.4
  },
  {
    "id": "velimese_durak_5",
    "durakKodu": "1054",
    "name": "Velimeşe Muhtarlık & Ergene Belediyesi Ek Hizmet Binası",
    "cadde": "Atatürk Caddesi",
    "lat": 41.251,
    "lon": 27.897,
    "pos": 1500,
    "anons": "Sonraki durak: Velimeşe Muhtarlık ve Ergene Belediyesi Ek Hizmet Binası.",
    "bekleyenYolcu": 4,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.3
  },
  {
    "id": "velimese_durak_6",
    "durakKodu": "1055",
    "name": "Velimeşe Mustafa Kemal Atatürk Caddesi",
    "cadde": "Atatürk Caddesi",
    "lat": 41.25,
    "lon": 27.896,
    "pos": 1800,
    "anons": "Sonraki durak: Velimeşe Mustafa Kemal Atatürk Caddesi.",
    "bekleyenYolcu": 7,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.45
  },
  {
    "id": "velimese_durak_7",
    "durakKodu": "1056",
    "name": "Velimeşe İstasyon Caddesi & TCDD Tren Garı",
    "cadde": "İstasyon Caddesi",
    "lat": 41.2545,
    "lon": 27.905,
    "pos": 2250,
    "anons": "Sonraki durak: Velimeşe İstasyon Caddesi ve TCDD Tren Garı.",
    "bekleyenYolcu": 9,
    "inenYolcu": 4,
    "gercekMesafeSonraki": 0.4
  },
  {
    "id": "velimese_durak_8",
    "durakKodu": "1057",
    "name": "Velimeşe Aile Sağlığı Merkezi (Sağlık Ocağı)",
    "cadde": "Sağlık Caddesi",
    "lat": 41.2535,
    "lon": 27.9005,
    "pos": 2650,
    "anons": "Sonraki durak: Velimeşe Aile Sağlığı Merkezi ve Sağlık Ocağı.",
    "bekleyenYolcu": 6,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_9",
    "durakKodu": "1058",
    "name": "Velimeşe İlkokulu & Ortaokulu",
    "cadde": "Okul Caddesi",
    "lat": 41.254,
    "lon": 27.898,
    "pos": 3000,
    "anons": "Sonraki durak: Velimeşe İlkokulu ve Ortaokulu.",
    "bekleyenYolcu": 10,
    "inenYolcu": 5,
    "gercekMesafeSonraki": 0.4
  },
  {
    "id": "velimese_durak_10",
    "durakKodu": "1059",
    "name": "Velimeşe Çok Programlı Anadolu Lisesi",
    "cadde": "Lise Caddesi",
    "lat": 41.255,
    "lon": 27.8965,
    "pos": 3400,
    "anons": "Sonraki durak: Velimeşe Çok Programlı Anadolu Lisesi.",
    "bekleyenYolcu": 8,
    "inenYolcu": 4,
    "gercekMesafeSonraki": 0.45
  },
  {
    "id": "velimese_durak_11",
    "durakKodu": "1060",
    "name": "Velimeşe Ergene Velimeşespor Tesisleri & Şehir Stadyumu",
    "cadde": "Spor Caddesi",
    "lat": 41.257,
    "lon": 27.902,
    "pos": 3850,
    "anons": "Sonraki durak: Velimeşe Ergene Velimeşespor Tesisleri ve Şehir Stadyumu.",
    "bekleyenYolcu": 7,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_12",
    "durakKodu": "1061",
    "name": "Velimeşe Kapalı Pazar Yeri & Otopark",
    "cadde": "Pazar Caddesi",
    "lat": 41.252,
    "lon": 27.895,
    "pos": 4200,
    "anons": "Sonraki durak: Velimeşe Kapalı Pazar Yeri ve Otopark.",
    "bekleyenYolcu": 11,
    "inenYolcu": 4,
    "gercekMesafeSonraki": 0.5
  },
  {
    "id": "velimese_durak_13",
    "durakKodu": "1062",
    "name": "Velimeşe TOKİ Konutları (1. Etap Giriş)",
    "cadde": "TOKİ Bulvarı",
    "lat": 41.256,
    "lon": 27.905,
    "pos": 4700,
    "anons": "Sonraki durak: Velimeşe TOKİ Konutları 1. Etap Girişi.",
    "bekleyenYolcu": 12,
    "inenYolcu": 5,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_14",
    "durakKodu": "1063",
    "name": "Velimeşe TOKİ Konutları (2. Etap / Park)",
    "cadde": "TOKİ Bulvarı",
    "lat": 41.2575,
    "lon": 27.9065,
    "pos": 5050,
    "anons": "Sonraki durak: Velimeşe TOKİ Konutları 2. Etap ve Park Durağı.",
    "bekleyenYolcu": 8,
    "inenYolcu": 4,
    "gercekMesafeSonraki": 0.55
  },
  {
    "id": "velimese_durak_15",
    "durakKodu": "1064",
    "name": "Velimeşe Sanayi Caddesi",
    "cadde": "Sanayi Caddesi",
    "lat": 41.246,
    "lon": 27.891,
    "pos": 5600,
    "anons": "Sonraki durak: Velimeşe Sanayi Caddesi.",
    "bekleyenYolcu": 6,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.4
  },
  {
    "id": "velimese_durak_16",
    "durakKodu": "1065",
    "name": "Velimeşe Küçük Sanayi Sitesi Girişi",
    "cadde": "Sanayi Caddesi",
    "lat": 41.245,
    "lon": 27.89,
    "pos": 6000,
    "anons": "Sonraki durak: Velimeşe Küçük Sanayi Sitesi Girişi.",
    "bekleyenYolcu": 5,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.5
  },
  {
    "id": "velimese_durak_17",
    "durakKodu": "1066",
    "name": "Velimeşe Organize Sanayi Bölgesi (OSB) 1. Kapı",
    "cadde": "OSB Bulvarı",
    "lat": 41.244,
    "lon": 27.888,
    "pos": 6500,
    "anons": "Sonraki durak: Velimeşe Organize Sanayi Bölgesi 1. Ana Giriş Kapısı.",
    "bekleyenYolcu": 9,
    "inenYolcu": 5,
    "gercekMesafeSonraki": 0.45
  },
  {
    "id": "velimese_durak_18",
    "durakKodu": "1067",
    "name": "Velimeşe OSB 2. Kapı (Fabrikalar Caddesi)",
    "cadde": "Fabrikalar Caddesi",
    "lat": 41.243,
    "lon": 27.885,
    "pos": 6950,
    "anons": "Sonraki durak: Velimeşe OSB 2. Kapı ve Fabrikalar Caddesi.",
    "bekleyenYolcu": 7,
    "inenYolcu": 4,
    "gercekMesafeSonraki": 0.45
  },
  {
    "id": "velimese_durak_19",
    "durakKodu": "1068",
    "name": "Velimeşe OSB Arıtma Tesisi Kavşağı",
    "cadde": "Çevre Caddesi",
    "lat": 41.241,
    "lon": 27.883,
    "pos": 7400,
    "anons": "Sonraki durak: Velimeşe OSB Arıtma Tesisi Kavşağı.",
    "bekleyenYolcu": 3,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.5
  },
  {
    "id": "velimese_durak_20",
    "durakKodu": "1069",
    "name": "Velimeşe Avrupa Serbest Bölgesi (ASB) Bağlantısı",
    "cadde": "Serbest Bölge Caddesi",
    "lat": 41.242,
    "lon": 27.886,
    "pos": 7900,
    "anons": "Sonraki durak: Velimeşe Avrupa Serbest Bölgesi Bağlantı Durağı.",
    "bekleyenYolcu": 8,
    "inenYolcu": 4,
    "gercekMesafeSonraki": 0.6
  },
  {
    "id": "velimese_durak_21",
    "durakKodu": "1070",
    "name": "Velimeşe Mezarlığı",
    "cadde": "Mezarlık Caddesi",
    "lat": 41.248,
    "lon": 27.893,
    "pos": 8500,
    "anons": "Sonraki durak: Velimeşe Mezarlığı.",
    "bekleyenYolcu": 3,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.5
  },
  {
    "id": "velimese_durak_22",
    "durakKodu": "1071",
    "name": "Velimeşe Girişi (Çorlu Bağlantısı)",
    "cadde": "D-110 Yan Yol",
    "lat": 41.245,
    "lon": 27.895,
    "pos": 9000,
    "anons": "Sonraki durak: Velimeşe Girişi, Çorlu Bağlantı Noktası.",
    "bekleyenYolcu": 6,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.4
  },
  {
    "id": "velimese_durak_23",
    "durakKodu": "1072",
    "name": "Velimeşe Bozdoğan Petrol & D-110 Kavşağı",
    "cadde": "D-110 Karayolu",
    "lat": 41.2435,
    "lon": 27.898,
    "pos": 9400,
    "anons": "Sonraki durak: Velimeşe Bozdoğan Petrol ve D-110 Kavşağı.",
    "bekleyenYolcu": 4,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.45
  },
  {
    "id": "velimese_durak_24",
    "durakKodu": "1073",
    "name": "Velimeşe - 1 Durağı (Durak Kodu 1058)",
    "cadde": "Ana Cadde",
    "lat": 41.249,
    "lon": 27.897,
    "pos": 9850,
    "anons": "Sonraki durak: Velimeşe 1 Durağı.",
    "bekleyenYolcu": 5,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_25",
    "durakKodu": "1074",
    "name": "Velimeşe - 2 Durağı (Durak Kodu 1059)",
    "cadde": "Ana Cadde",
    "lat": 41.2505,
    "lon": 27.898,
    "pos": 10200,
    "anons": "Sonraki durak: Velimeşe 2 Durağı.",
    "bekleyenYolcu": 5,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_26",
    "durakKodu": "1075",
    "name": "Velimeşe Barış Caddesi & Çamlık Mesire Alanı",
    "cadde": "Barış Caddesi",
    "lat": 41.254,
    "lon": 27.901,
    "pos": 10550,
    "anons": "Sonraki durak: Velimeşe Barış Caddesi ve Çamlık Mesire Alanı.",
    "bekleyenYolcu": 6,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_27",
    "durakKodu": "1076",
    "name": "Velimeşe Gölet & Piknik Alanı",
    "cadde": "Gölet Yolu",
    "lat": 41.256,
    "lon": 27.903,
    "pos": 10900,
    "anons": "Sonraki durak: Velimeşe Gölet ve Piknik Alanı.",
    "bekleyenYolcu": 4,
    "inenYolcu": 2,
    "gercekMesafeSonraki": 0.4
  },
  {
    "id": "velimese_durak_28",
    "durakKodu": "1077",
    "name": "Velimeşe Cumhuriyet Bulvarı",
    "cadde": "Cumhuriyet Bulvarı",
    "lat": 41.2535,
    "lon": 27.8995,
    "pos": 11300,
    "anons": "Sonraki durak: Velimeşe Cumhuriyet Bulvarı.",
    "bekleyenYolcu": 7,
    "inenYolcu": 4,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_29",
    "durakKodu": "1078",
    "name": "Velimeşe Hürriyet Caddesi",
    "cadde": "Hürriyet Caddesi",
    "lat": 41.2528,
    "lon": 27.8985,
    "pos": 11650,
    "anons": "Sonraki durak: Velimeşe Hürriyet Caddesi.",
    "bekleyenYolcu": 5,
    "inenYolcu": 3,
    "gercekMesafeSonraki": 0.35
  },
  {
    "id": "velimese_durak_30",
    "durakKodu": "1079",
    "name": "Velimeşe Fevzi Çakmak Caddesi (Meydan Dönüşü)",
    "cadde": "Fevzi Çakmak Caddesi",
    "lat": 41.253,
    "lon": 27.899,
    "pos": 12000,
    "anons": "Son durak: Velimeşe Fevzi Çakmak Caddesi ve Merkez Meydanı. Velimeşe Mahallesi seferimiz tamamlanmıştır.",
    "bekleyenYolcu": 0,
    "inenYolcu": 28,
    "gercekMesafeSonraki": 0
  }
];

const hatVelimeseMahalleRing = {
    id: "hat_velimese_mahalle_ring",
    hatNo: "VM-RING",
    name: "VELİMEŞE MAHALLESİ TAM RİNG (30 DURAK)",
    destDistrict: "Ergene / Velimeşe",
    originDistrict: "Ergene / Velimeşe",
    district: "Ergene / Velimeşe",
    startStop: "Velimeşe Merkez Meydanı (Atatürk Parkı)",
    endStop: "Velimeşe Fevzi Çakmak Caddesi (Meydan Dönüşü)",
    isDistrict: true,
    isCity: false,
    isVelimeseLocked: true,
    isHierarchical: true,
    terrain: "asfalt",
    totalKm: 12.0,
    biletFiyat: 20,
    otobusKapasitesi: 75,
    seferSuresi: "35 dk",
    desc: "Velimeşe Mahallesi'nin tüm cadde, okul, tren garı, stadyum, TOKİ ve OSB sanayi duraklarını birbirine bağlayan resmi ring hattı.",
    intermediateStops: velimeseTumDuraklarListesi.slice(1, -1).map(s => s.name),
    stops: velimeseTumDuraklarListesi
};

if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
    // Eski ring varsa güncelle, yoksa ekle
    const exIdx = ilceRotalari["Tekirdağ"].findIndex(r => r.id === "hat_velimese_mahalle_ring");
    if (exIdx >= 0) {
        ilceRotalari["Tekirdağ"][exIdx] = hatVelimeseMahalleRing;
    } else {
        ilceRotalari["Tekirdağ"].unshift(hatVelimeseMahalleRing);
    }
}
if (typeof routesData !== 'undefined') {
    routesData["hat_velimese_mahalle_ring"] = hatVelimeseMahalleRing;
    routesData["hat_velimese_ring_30"] = hatVelimeseMahalleRing;
}

if (typeof window !== 'undefined') {
    window.hesaplaTekirdagIlceMesafe = function(ilce1, ilce2) {
        if (typeof sehirRotalari !== 'undefined' && sehirRotalari["Tekirdağ"] && sehirRotalari["Tekirdağ"].ilcelerBilgisi) {
            return sehirRotalari["Tekirdağ"].ilcelerBilgisi.hesaplaIlceMesafe(ilce1, ilce2);
        }
        return null;
    };
}


/* ==========================================================================
   TÜRKİYE DENİZLERİ VERİTABANI (TURKIYE-DENIZLERI-DATA)
   Karadeniz, Marmara Denizi, Ege Denizi, Akdeniz ve Van Denizi
   Birebir Resmi Kıyı Uzunlukları, Tuzluluk, Kıyı İlleri, Limanlar ve Koridorlar
   ========================================================================== */
const turkiyeDenizleri = {
    "Karadeniz": {
        ad: "Karadeniz",
        uluslararasiAd: "Black Sea",
        konum: "Türkiye'nin kuzey sınırını boydan boya kuşatan, 1.695 km kıyı şeridine sahip iç deniz",
        kiyiUzunluguKm: 1695,
        tuzlulukYuzde: 1.8,
        enDerinNoktaMetre: 2212,
        turkiyeKiyiSiralamasi: 1, // En uzun kıyı şeridi
        kiyisiOlanIller: [
            "Artvin", "Rize", "Trabzon", "Giresun", "Ordu", "Samsun",
            "Sinop", "Kastamonu", "Bartın", "Zonguldak", "Düzce",
            "Sakarya", "Kocaeli", "İstanbul", "Kırklareli"
        ],
        onemliLimanlar: [
            "Samsun Limanı", "Trabzon Limanı", "Filyos Limanı", "Zonguldak Limanı",
            "Hopa Limanı", "Sinop İskelesi", "Giresun Limanı", "İnebolu Limanı"
        ],
        onemliBurunlarVeKoylar: [
            "İnceburun (Sinop - Türkiye'nin En Kuzey Ucu)",
            "Hamsilos Koyu (Sinop - Doğal Fiyord)",
            "Boztepe Burnu (Trabzon / Sinop)",
            "Yasun Burnu (Ordu Perşembe)",
            "Civa Burnu (Samsun Çarşamba)",
            "Kerpe ve Kefken Kayalıkları (Kocaeli)",
            "İğneada Feneri (Kırklareli)"
        ],
        onemliKarayoluKoridoru: "D-010 Karadeniz Sahil Yolu (Artvin Sarp Sınır Kapısı'ndan İstanbul Boğazı'na kadar kesintisiz sahil aksı)",
        iklimVeRuzgarlar: "Her mevsim yağışlı Karadeniz iklimi, Yıldız (Kuzey), Karayel (Kuzeybatı) ve Poyraz (Kuzeydoğu) fırtınaları, dalgalı hırçın sular",
        sesliTanitim: "Karadeniz, Türkiye'nin kuzeyinde 1695 kilometrelik sahil şeridiyle en uzun kıyımıza sahip denizdir. Tuzluluk oranı binde 18 ile Türkiye denizleri arasında en düşük seviyededir. D-010 Karadeniz Sahil Yolu boyunca eşsiz yaylalar ve sarp dağlar eşliğinde uzanır."
    },

    "Marmara Denizi": {
        ad: "Marmara Denizi",
        uluslararasiAd: "Sea of Marmara",
        tip: "Türkiye'nin Tamamı Sınırlarımızda Olan İç Denizi",
        konum: "Asya ile Avrupa kıtalarını birbirinden ayıran, İstanbul ve Çanakkale Boğazları arasında yer alan tarihi stratejik su yolu",
        kiyiUzunluguKm: 927,
        tuzlulukYuzde: 2.2, // Yüzeyde %2.2, dip akıntısında %3.8
        enDerinNoktaMetre: 1270, // Marmara Ereğlisi açıkları çukurluğu
        kiyisiOlanIller: [
            "Tekirdağ", "İstanbul", "Kocaeli", "Yalova", "Bursa", "Balıkesir", "Çanakkale"
        ],
        onemliAdalar: [
            "Marmara Adası (Mermer yatakları)",
            "Avşa Adası (Turizm ve bağcılık)",
            "Paşalimanı Adası",
            "Prens Adaları (Büyükada, Heybeliada, Kınalıada, Burgazada)"
        ],
        onemliKorfezler: [
            "İzmit Körfezi", "Gemlik Körfezi", "Bandırma Körfezi", "Erdek Körfezi"
        ],
        onemliBogazlarVeKopruleri: [
            "İstanbul Boğazı (15 Temmuz, Fatih Sultan Mehmet, Yavuz Sultan Selim Köprüleri, Avrasya Tüneli, Marmaray)",
            "Çanakkale Boğazı (1915 Çanakkale Köprüsü - 2023m orta açıklıkla dünyanın en uzun asma köprüsü)",
            "Osmangazi Köprüsü (İzmit Körfez Geçişi)"
        ],
        onemliLimanlar: [
            "Asyaport (Tekirdağ Süleymanpaşa - Türkiye'nin en büyük transit konteyner limanı)",
            "Ambarlı Limanı (İstanbul)",
            "Derince Limanı (Kocaeli)",
            "Bandırma Limanı (Balıkesir)",
            "Yalova Ro-Ro Limanı"
        ],
        onemliKarayoluKoridoru: "D-110 / O-7 Kuzey Marmara ve O-5 İstanbul-İzmir Otoyolu, O-6 Kınalı-Tekirdağ-Çanakkale-Balıkesir Otoyolu",
        iklimVeRuzgarlar: "Geçiş iklimi, sert Poyraz (Kuzeydoğu) ve tehlikeli Lodos (Güneybatı) fırtınaları, iki tabakalı akıntı sistemi",
        sesliTanitim: "Marmara Denizi, tamamı Türkiye sınırları içinde bulunan eşsiz bir iç denizdir. İstanbul ve Çanakkale Boğazları ile Karadeniz'i Ege'ye bağlar. Kıyılarında oyunumuzun doğduğu merkez olan Tekirdağ ile birlikte 7 büyük ilimiz yer alır."
    },

    "Ege Denizi": {
        ad: "Ege Denizi",
        uluslararasiAd: "Aegean Sea",
        tarihiAd: "Adalar Denizi",
        konum: "Anadolu ile Mora-Balkan Yarımadaları arasında yer alan, binlerce ada ve girintili çıkıntılı kıyı şeridine sahip deniz",
        kiyiUzunluguKm: 2805, // Girintili çıkıntılı gerçek kıyı çizgisi uzunluğu
        tuzlulukYuzde: 3.3,
        enDerinNoktaMetre: 2500,
        kiyisiOlanIller: [
            "Çanakkale", "Balıkesir", "İzmir", "Aydın", "Muğla"
        ],
        onemliAdalar: [
            "Gökçeada (İmroz - Türkiye'nin en büyük adası)",
            "Bozcaada (Tenedos - Tarihi kalesi ve bağları)",
            "Cunda (Alibey) Adası (Balıkesir Ayvalık)"
        ],
        onemliYarimadalar: [
            "Gelibolu Yarımadası", "Kapıdağ Yarımadası", "Karaburun Yarımadası",
            "Urla / Çeşme Yarımadası", "Dilek Yarımadası", "Bodrum Yarımadası", "Datça (Reşadiye) Yarımadası"
        ],
        onemliKorfezler: [
            "Saros Körfezi (Kendi kendini temizleyen körfez)",
            "Edremit Körfezi", "Çandarlı Körfezi", "İzmir Körfezi",
            "Kuşadası Körfezi", "Güllük Körfezi", "Gökova Körfezi"
        ],
        onemliLimanlar: [
            "İzmir Alsancak Limanı", "Aliağa Rafineri Limanı", "Çeşme Uluslararası Feribot Limanı",
            "Kuşadası Kruvaziyer Limanı", "Bodrum Yolcu Limanı", "Ayvalık İskelesi"
        ],
        onemliKarayoluKoridoru: "D-550 / E87 Ege Kıyı Otoyolu (Çanakkale Truva'dan Ayvalık, İzmir, Kuşadası ve Muğla'ya uzanan antik sahil rotası)",
        iklimVeRuzgarlar: "Tipik Akdeniz iklimi, yaz aylarında kuzeybatıdan esen ferahlatıcı Meltem (Etesiyen) rüzgarları, kışın Lodos",
        sesliTanitim: "Ege Denizi, dağların denize dik uzanmasıyla binlerce koy, körfez ve yarımadaya sahip Türkiye'nin en hareketli kıyı şerididir. Çanakkale'den Muğla'ya kadar tarihi Efes, Milet, Assos antik limanları ve turizm merkezleriyle çevrilidir."
    },

    "Akdeniz": {
        ad: "Akdeniz",
        uluslararasiAd: "Mediterranean Sea",
        konum: "Türkiye'nin güney sınırını oluşturan, Toros Dağları eteklerinde uzanan en sıcak ve en tuzlu denizimiz",
        kiyiUzunluguKm: 1577,
        tuzlulukYuzde: 3.8, // Türkiye denizlerinin en tuzlusu
        enDerinNoktaMetre: 5267, // Akdeniz genelinde Kalipso Çukuru
        kiyisiOlanIller: [
            "Muğla (Fethiye)", "Antalya", "Mersin", "Adana", "Hatay"
        ],
        onemliKorfezler: [
            "Antalya Körfezi", "Fethiye Körfezi", "Mersin Körfezi", "İskenderun Körfezi"
        ],
        onemliBurunlarVeDeltalar: [
            "Anamur Burnu (Türkiye'nin En Güney Kara Ucu)",
            "Gelidonya (Taşlık) Feneri ve Burnu",
            "Çukurova Deltası (Seyhan ve Ceyhan nehirlerinin Akdeniz'e döküldüğü Türkiye'nin en büyük tarım deltası)",
            "Silifke Ovası (Göksu Deltası)"
        ],
        onemliLimanlar: [
            "Mersin Uluslararası Konteyner Limanı (MIP)",
            "Antalya Port Akdeniz",
            "İskenderun Limanı",
            "Alanya Limanı",
            "Fethiye Limanı",
            "Botaş Ceyhan Petrol Terminali"
        ],
        onemliKarayoluKoridoru: "D-400 Karayolu (Muğla Fethiye'den başlayıp Kaş, Antalya, Alanya, Mersin, Adana ve Hatay üzerinden sınıra uzanan Türkiye'nin en uzun kıyı otoyolu)",
        iklimVeRuzgarlar: "Sıcak Akdeniz iklimi, yıllık 300 günü aşan güneşlenme süresi, güneyden esen sıcak Samyeli ve Kıble rüzgarları",
        sesliTanitim: "Akdeniz, Türkiye'nin güneyinde yer alan, güneşlenme süresi en yüksek, su sıcaklığı en fazla ve tuzluluk oranı binde 38 ile en yüksek denizimizdir. Fethiye'den Hatay'a uzanan D-400 Karayolu boyunca Toros Dağları ile masmavi sular birbirine eşlik eder."
    },

    "Van Gölü (Van Denizi)": {
        ad: "Van Gölü",
        yerelAd: "Van Denizi",
        tip: "Türkiye'nin En Büyük Kapalı Havza Sodalı Denizi / Gölü",
        konum: "Doğu Anadolu Bölgesi'nde, Nemrut ve Süphan volkanik dağları arasında yer alan dünyanın en büyük sodalı su kütlesi",
        yuzolcumuKm2: 3713,
        rakimMetre: 1646,
        enDerinNoktaMetre: 451,
        suOzelligi: "Yüksek derecede sodalı ve tuzlu (pH 9.8). Sadece inci kefali (Van balığı) yaşar.",
        kiyisiOlanIller: [
            "Bitlis (Tatvan, Ahlat, Adilcevaz)",
            "Van (Edremit, Tuşba, İpekyolu, Gevaş, Muradiye, Erciş)"
        ],
        onemliIskelelerVeFeribot: [
            "Tatvan Feribot İskelesi (Bitlis) - Türkiye'nin en büyük tren feribotları (İdris-i Bitlisi ve Sultan Alparslan) ile demiryolu geçişi",
            "Van İskelesi (Tuşba)",
            "Akdamar Adası İskelesi (Gevaş)"
        ],
        onemliKarayoluKoridoru: "D-300 ve D-965 Van Gölü Çevre Yolu",
        sesliTanitim: "Yöre halkı tarafından 'Van Denizi' olarak anılan Van Gölü, 3713 kilometrekarelik alanıyla Türkiye'nin en büyük su kütlesidir. Tatvan ile Van arasında tren feribotlarıyla demiryolu taşımacılığı yapılmaktadır."
    }
};

if (typeof window !== 'undefined') {
    window.turkiyeDenizleri = turkiyeDenizleri;
}

// ============================================================================
// TÜRKİYE TÜM İLLER ARASI KOMŞULUK & ULAŞIM AĞI ENTEGRASYONU
// Bütün illeri bütün illere komşu ve şehirlerarası sefer ağı olarak bağlar
// ============================================================================
if (typeof masterCitiesList !== 'undefined' && typeof sehirRotalari !== 'undefined') {
    const defaultFizikiKomsular = {
        "Tekirdağ": ["Edirne", "Kırklareli", "İstanbul", "Çanakkale"],
        "İstanbul": ["Tekirdağ", "Kocaeli"],
        "Edirne": ["Kırklareli", "Tekirdağ", "Çanakkale"],
        "Kırklareli": ["Edirne", "Tekirdağ", "İstanbul"],
        "Yalova": ["Bursa", "Kocaeli"]
    };

    masterCitiesList.forEach(cityA => {
        if (sehirRotalari[cityA]) {
            // 1. Resmi fiziki sınır komşularını güvenle sakla
            if (!sehirRotalari[cityA].fizikiSinirKomsulari) {
                if (Array.isArray(sehirRotalari[cityA].komsuIller)) {
                    sehirRotalari[cityA].fizikiSinirKomsulari = [...sehirRotalari[cityA].komsuIller];
                } else if (defaultFizikiKomsular[cityA]) {
                    sehirRotalari[cityA].fizikiSinirKomsulari = [...defaultFizikiKomsular[cityA]];
                } else {
                    sehirRotalari[cityA].fizikiSinirKomsulari = [];
                }
            }
            // 2. Bütün illeri komşu olarak bağla (kendisi hariç)
            sehirRotalari[cityA].komsuIller = masterCitiesList.filter(c => c !== cityA);
            // 3. Ulaşım ağı bağlantısı listesi
            sehirRotalari[cityA].ulasimAgi = masterCitiesList.filter(c => c !== cityA);
        }
    });
}

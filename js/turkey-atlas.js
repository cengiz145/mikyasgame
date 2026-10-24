/* ==========================================================================
   TÜRKİYE COĞRAFYA ATLASI & SESLİ IZGARA HARİTASI (TURKEY ATLAS ENGINE)
   Dünyanın İlk Erişilebilir 2D Sesli Türkiye Coğrafya ve İlçe Haritası
   - 81 İl ve 973 İlçe Hiyerarşik Veritabanı
   - Yön Tuşlarıyla Gerçek 2D Mekânsal Gezinti (Kuzey, Güney, Doğu, Batı)
   - 3D Stereo Panning (Doğu/Batı) ve Frekans Modülasyonu (Kuzey/Güney)
   - NVDA ve Ekran Okuyucu Canlı Bölge Bildirimleri
   - Geliştirici: Ümit Ekrem Mikyas
   ========================================================================== */

(function(window) {
    'use strict';

    // 81 İL TAM 2D IZGARA KOORDİNATLARI VE KOMŞULUK AĞI
    const PROVINCES_MAP = {
        // --- Y: 0 (En Kuzey Sahil & Karadeniz / Trakya) ---
        "Kırklareli": { x: 1, y: 0, plate: "39", region: "Marmara", alt: 203, neighbors: ["Edirne", "Tekirdağ", "İstanbul"], desc: "Yıldız Dağları, İğneada Longoz Ormanları ve Trakya tarım aksı." },
        "Bartın": { x: 6, y: 0, plate: "74", region: "Karadeniz", alt: 25, neighbors: ["Zonguldak", "Karabük", "Kastamonu"], desc: "Amasra kalesi, tarihi liman ve falezli Karadeniz kıyıları." },
        "Kastamonu": { x: 7, y: 0, plate: "37", region: "Karadeniz", alt: 775, neighbors: ["Bartın", "Karabük", "Çankırı", "Çorum", "Sinop"], desc: "Ilgaz Dağları, kanyonlar ve tarihi Karadeniz mimarisi." },
        "Sinop": { x: 8, y: 0, plate: "57", region: "Karadeniz", alt: 25, neighbors: ["Kastamonu", "Çorum", "Samsun"], desc: "Türkiye'nin en kuzey ucu (İnceburun), doğal fiyort Hamsilos ve kale kenti." },
        "Samsun": { x: 9, y: 0, plate: "55", region: "Karadeniz", alt: 20, neighbors: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"], desc: "Milli Mücadele'nin başlangıç kenti, Çarşamba ve Bafra deltaları, büyük liman." },
        "Ordu": { x: 10, y: 0, plate: "52", region: "Karadeniz", alt: 25, neighbors: ["Samsun", "Tokat", "Sivas", "Giresun"], desc: "Boztepe, fındık bahçeleri ve virajlı Karadeniz sahil yolu." },
        "Giresun": { x: 11, y: 0, plate: "28", region: "Karadeniz", alt: 28, neighbors: ["Ordu", "Sivas", "Gümüşhane", "Trabzon"], desc: "Giresun Kalesi, Karadeniz adası ve dik yayla vadileri." },
        "Trabzon": { x: 12, y: 0, plate: "61", region: "Karadeniz", alt: 37, neighbors: ["Giresun", "Gümüşhane", "Bayburt", "Rize"], desc: "Sümela Manastırı, Zigana Geçidi, Uzungöl ve Doğu Karadeniz metropolü." },
        "Rize": { x: 13, y: 0, plate: "53", region: "Karadeniz", alt: 10, neighbors: ["Trabzon", "Bayburt", "Erzurum", "Artvin"], desc: "Kaçkar Dağları, Fırtına Deresi, Ayder Yaylası ve çay yamaçları." },
        "Artvin": { x: 14, y: 0, plate: "08", region: "Karadeniz", alt: 345, neighbors: ["Rize", "Erzurum", "Ardahan"], desc: "Çoruh Nehri, sarp kanyonlar, Borçka Karagöl ve Kafkasör zirveleri." },

        // --- Y: 1 (Kuzey Hattı: Trakya, Boğaz, Batı Karadeniz, Kuzeydoğu) ---
        "Edirne": { x: 0, y: 1, plate: "22", region: "Marmara", alt: 42, neighbors: ["Kırklareli", "Tekirdağ", "Çanakkale"], desc: "Osmanlı'nın eski başkenti, Selimiye Meydanı, Meriç Nehri ve batı sınır kapısı." },
        "Tekirdağ": { x: 1, y: 1, plate: "59", region: "Marmara", alt: 10, neighbors: ["Edirne", "Kırklareli", "İstanbul", "Çanakkale"], desc: "Marmara Denizi sahil kordonu, Ganos Dağları, köfte ve Trakya sanayi hattı." },
        "İstanbul": { x: 2, y: 1, plate: "34", region: "Marmara", alt: 40, neighbors: ["Tekirdağ", "Kocaeli"], desc: "Asya ile Avrupa'yı birleştiren Boğaz köprüleri, dünya metropolü ve tarihi yarımada." },
        "Kocaeli": { x: 3, y: 1, plate: "41", region: "Marmara", alt: 15, neighbors: ["İstanbul", "Yalova", "Bursa", "Sakarya"], desc: "İzmit Körfezi, ağır sanayi, Kartepe kayak merkezi ve Osmangazi Köprüsü." },
        "Sakarya": { x: 4, y: 1, plate: "54", region: "Marmara", alt: 31, neighbors: ["Kocaeli", "Bursa", "Bilecik", "Bolu", "Düzce"], desc: "Sapanca Gölü, Sakarya Nehri deltası ve otomotiv sanayisi." },
        "Düzce": { x: 5, y: 1, plate: "81", region: "Karadeniz", alt: 160, neighbors: ["Sakarya", "Bolu", "Zonguldak"], desc: "Akçakoca sahili, Samandere şelalesi ve Bolu Dağı batı etekleri." },
        "Zonguldak": { x: 6, y: 1, plate: "67", region: "Karadeniz", alt: 100, neighbors: ["Düzce", "Bolu", "Karabük", "Bartın"], desc: "Karaelmas taşkömürü havzası, Filyos Vadisi ve dik sahil yamaçları." },
        "Karabük": { x: 7, y: 1, plate: "78", region: "Karadeniz", alt: 280, neighbors: ["Zonguldak", "Bartın", "Kastamonu", "Çankırı", "Bolu"], desc: "Safranbolu tarihi konakları, demir-çelik sanayisi ve Yenice ormanları." },
        "Çankırı": { x: 8, y: 1, plate: "18", region: "İç Anadolu", alt: 723, neighbors: ["Karabük", "Kastamonu", "Çorum", "Kırıkkale", "Ankara", "Bolu"], desc: "Tarihi kaya tuzu mağarası, Ilgaz güney yamaçları ve İç Anadolu yaylaları." },
        "Amasya": { x: 9, y: 1, plate: "05", region: "Karadeniz", alt: 411, neighbors: ["Samsun", "Tokat", "Yozgat", "Çorum"], desc: "Şehzadeler şehri, Yeşilırmak yalıboyu evleri ve Kral Kaya Mezarları." },
        "Tokat": { x: 10, y: 1, plate: "60", region: "Karadeniz", alt: 623, neighbors: ["Amasya", "Samsun", "Ordu", "Sivas", "Yozgat"], desc: "Ballıca Mağarası, tarihi Taşhan ve verimli Erbaa-Niksar ovaları." },
        "Gümüşhane": { x: 11, y: 1, plate: "29", region: "Karadeniz", alt: 1210, neighbors: ["Trabzon", "Giresun", "Erzincan", "Bayburt"], desc: "Karaca Mağarası, Tomara Şelalesi ve Zigana dağ geçidi güneyi." },
        "Bayburt": { x: 12, y: 1, plate: "69", region: "Karadeniz", alt: 1550, neighbors: ["Trabzon", "Rize", "Erzurum", "Erzincan", "Gümüşhane"], desc: "Çoruh Nehri kıyısı, Bayburt Kalesi ve yüksek dağ bozkırları." },
        "Ardahan": { x: 14, y: 1, plate: "75", region: "Doğu Anadolu", alt: 1807, neighbors: ["Artvin", "Erzurum", "Kars"], desc: "Çıldır Gölü buz maratonu, Posof vadisi ve Kafkas sınır hattı." },

        // --- Y: 2 (Marmara İçi, Kuzey İç Anadolu, Doğu Anadolu Zirvesi) ---
        "Çanakkale": { x: 0, y: 2, plate: "17", region: "Marmara", alt: 10, neighbors: ["Edirne", "Tekirdağ", "Balıkesir"], desc: "Çanakkale Şehitlikleri, 1915 Çanakkale Köprüsü, Truva ve Kaz Dağları." },
        "Yalova": { x: 2, y: 2, plate: "77", region: "Marmara", alt: 5, neighbors: ["Kocaeli", "Bursa"], desc: "Termal kaplıcaları, Yürüyen Köşk ve Marmara feribot iskelesi." },
        "Bursa": { x: 3, y: 2, plate: "16", region: "Marmara", alt: 155, neighbors: ["Yalova", "Kocaeli", "Sakarya", "Bilecik", "Kütahya", "Balıkesir"], desc: "Uludağ kayak merkezi, Ulu Cami, otomotiv ve tekstil başkenti." },
        "Bilecik": { x: 4, y: 2, plate: "11", region: "Marmara", alt: 513, neighbors: ["Bursa", "Sakarya", "Bolu", "Eskişehir", "Kütahya"], desc: "Kuruluşun beşiği Söğüt, Şeyh Edebali Türbesi ve mermer ocakları." },
        "Bolu": { x: 5, y: 2, plate: "14", region: "Karadeniz", alt: 726, neighbors: ["Düzce", "Zonguldak", "Karabük", "Çankırı", "Ankara", "Eskişehir", "Bilecik", "Sakarya"], desc: "Bolu Dağı Tüneli, Abant Gölü, Yedigöller ve usta aşçılar diyarı." },
        "Ankara": { x: 6, y: 2, plate: "06", region: "İç Anadolu", alt: 938, neighbors: ["Bolu", "Çankırı", "Kırıkkale", "Kırşehir", "Aksaray", "Konya", "Eskişehir"], desc: "Türkiye Cumhuriyeti'nin başkenti, Anıtkabir, AŞTİ ana terminali ve bürokrasi merkezi." },
        "Kırıkkale": { x: 7, y: 2, plate: "71", region: "İç Anadolu", alt: 718, neighbors: ["Çankırı", "Çorum", "Yozgat", "Kırşehir", "Ankara"], desc: "Makine-kimya sanayisi, Kızılırmak vadisi ve 43 ilin karayolu kilit kavşağı." },
        "Çorum": { x: 8, y: 2, plate: "19", region: "Karadeniz", alt: 801, neighbors: ["Sinop", "Samsun", "Amasya", "Yozgat", "Kırıkkale", "Çankırı", "Kastamonu"], desc: "Hattuşa Hitit başkenti, meşhur leblebi ve İç Anadolu geçiş aksı." },
        "Yozgat": { x: 9, y: 2, plate: "66", region: "İç Anadolu", alt: 1301, neighbors: ["Çorum", "Amasya", "Tokat", "Sivas", "Kayseri", "Nevşehir", "Kırşehir", "Kırıkkale"], desc: "Çamlık Milli Parkı, saat kulesi ve yüksek İç Anadolu yaylası." },
        "Sivas": { x: 10, y: 2, plate: "58", region: "İç Anadolu", alt: 1285, neighbors: ["Yozgat", "Tokat", "Ordu", "Giresun", "Erzincan", "Malatya", "Kahramanmaraş", "Kayseri"], desc: "Divriği Ulu Cami, Çifte Minareli Medrese, Kangal köpeği ve geniş coğrafya." },
        "Erzincan": { x: 11, y: 2, plate: "24", region: "Doğu Anadolu", alt: 1185, neighbors: ["Sivas", "Giresun", "Gümüşhane", "Bayburt", "Erzurum", "Bingöl", "Tunceli"], desc: "Karasu Vadisi, Munzur Dağları, Girlevik Şelalesi ve tulum peyniri." },
        "Erzurum": { x: 12, y: 2, plate: "25", region: "Doğu Anadolu", alt: 1890, neighbors: ["Erzincan", "Bayburt", "Rize", "Artvin", "Ardahan", "Kars", "Ağrı", "Muş", "Bingöl"], desc: "Palandöken kayak zirvesi, Çifte Minareler, Nene Hatun kalesi ve Doğu'nun kalesi." },
        "Kars": { x: 14, y: 2, plate: "36", region: "Doğu Anadolu", alt: 1768, neighbors: ["Ardahan", "Erzurum", "Ağrı", "Iğdır"], desc: "Ani Harabeleri, Sarıkamış ormanları, kalesi ve kaşar peyniri diyarı." },
        "Iğdır": { x: 15, y: 2, plate: "76", region: "Doğu Anadolu", alt: 858, neighbors: ["Kars", "Ağrı"], desc: "Üç ülkeye sınır (Ermenistan, Nahçıvan, İran), Ağrı Dağı'nın etekleri ve mikroklimal vaha." },

        // --- Y: 3 (Ege İçi, Orta Anadolu, Doğu Anadolu Vadileri) ---
        "Balıkesir": { x: 1, y: 3, plate: "10", region: "Marmara", alt: 145, neighbors: ["Çanakkale", "Tekirdağ", "Bursa", "Kütahya", "Manisa", "İzmir"], desc: "Hem Marmara hem Ege Denizi'ne kıyısı olan, Ayvalık zeytini ve Kaz Dağları kenti." },
        "Kütahya": { x: 3, y: 3, plate: "43", region: "Ege", alt: 969, neighbors: ["Balıkesir", "Bursa", "Bilecik", "Eskişehir", "Afyonkarahisar", "Uşak", "Manisa"], desc: "Çini ve porselen başkenti, Dumlupınar zafer sahası ve Frig Vadisi." },
        "Eskişehir": { x: 5, y: 3, plate: "26", region: "İç Anadolu", alt: 792, neighbors: ["Bilecik", "Bolu", "Ankara", "Konya", "Afyonkarahisar", "Kütahya"], desc: "Porsuk Çayı, Odunpazarı tarihi evleri, lületaşı ve kültür kenti." },
        "Kırşehir": { x: 7, y: 3, plate: "40", region: "İç Anadolu", alt: 985, neighbors: ["Kırıkkale", "Yozgat", "Nevşehir", "Aksaray", "Ankara"], desc: "Ahi Evran ve Neşet Ertaş diyarı, Cacabey Gökbilim Medresesi." },
        "Nevşehir": { x: 8, y: 3, plate: "50", region: "İç Anadolu", alt: 1197, neighbors: ["Kırşehir", "Yozgat", "Kayseri", "Niğde", "Aksaray"], desc: "Kapadokya peri bacaları, yeraltı şehirleri, balon turizmi ve Avanos çömlekçiliği." },
        "Kayseri": { x: 9, y: 3, plate: "38", region: "İç Anadolu", alt: 1054, neighbors: ["Yozgat", "Sivas", "Kahramanmaraş", "Adana", "Niğde", "Nevşehir"], desc: "Erciyes Dağı, tarihi Kapalıçarşı, pastırma-sucuk ve güçlü sanayi merkezi." },
        "Tunceli": { x: 11, y: 3, plate: "62", region: "Doğu Anadolu", alt: 914, neighbors: ["Erzincan", "Bingöl", "Elazığ"], desc: "Munzur Vadisi Milli Parkı, Munzur Gözeleri ve sarp kanyonlar." },
        "Bingöl": { x: 12, y: 3, plate: "12", region: "Doğu Anadolu", alt: 1151, neighbors: ["Erzincan", "Erzurum", "Muş", "Diyarbakır", "Elazığ", "Tunceli"], desc: "Yüzen Adalar, Hesarek kayak tesisi ve yüksek yayla florası." },
        "Muş": { x: 13, y: 3, plate: "49", region: "Doğu Anadolu", alt: 1334, neighbors: ["Erzurum", "Ağrı", "Bitlis", "Batman", "Diyarbakır", "Bingöl"], desc: "Malazgirt Zafer Ovası, Murat Nehri köprüsü ve meşhur Muş lalesi." },
        "Ağrı": { x: 14, y: 3, plate: "04", region: "Doğu Anadolu", alt: 1632, neighbors: ["Kars", "Iğdır", "Van", "Bitlis", "Muş", "Erzurum"], desc: "Türkiye'nin en yüksek zirvesi Ağrı Dağı (5137m) ve İshak Paşa Sarayı." },

        // --- Y: 4 (Ege, Göller Yöresi, Güneydoğu Girişi, Van Gölü) ---
        "Manisa": { x: 1, y: 4, plate: "45", region: "Ege", alt: 62, neighbors: ["Balıkesir", "Kütahya", "Uşak", "Denizli", "Aydın", "İzmir"], desc: "Spil Dağı Milli Parkı, şehzadeler kenti, üzüm bağları ve tarım sanayisi." },
        "Uşak": { x: 2, y: 4, plate: "64", region: "Ege", alt: 907, neighbors: ["Manisa", "Kütahya", "Afyonkarahisar", "Denizli"], desc: "Ulubey Kanyonu (dünyanın 2. en uzunu), Karun Hazineleri ve battaniye sanayisi." },
        "Afyonkarahisar": { x: 3, y: 4, plate: "03", region: "Ege", alt: 1034, neighbors: ["Kütahya", "Eskişehir", "Konya", "Isparta", "Burdur", "Denizli", "Uşak"], desc: "Afyon Kalesi, termal kaynaklar, sucuk-lokum ve batı-doğu otoyol düğüm noktası." },
        "Konya": { x: 5, y: 4, plate: "42", region: "İç Anadolu", alt: 1016, neighbors: ["Ankara", "Eskişehir", "Afyonkarahisar", "Isparta", "Antalya", "Karaman", "Mersin", "Niğde", "Aksaray"], desc: "Mevlana Türbesi, Türkiye'nin tahıl ambarı en geniş ili, Çatalhöyük ve Selçuklu başkenti." },
        "Aksaray": { x: 6, y: 4, plate: "68", region: "İç Anadolu", alt: 980, neighbors: ["Kırşehir", "Nevşehir", "Niğde", "Konya", "Ankara"], desc: "Ihlara Vadisi, Hasan Dağı, Sultanhanı Kervansarayı ve İpekyolu kavşağı." },
        "Niğde": { x: 7, y: 4, plate: "51", region: "İç Anadolu", alt: 1229, neighbors: ["Nevşehir", "Kayseri", "Adana", "Mersin", "Konya", "Aksaray"], desc: "Aladağlar Milli Parkı, elma bahçeleri ve tarihi Gümüşler Manastırı." },
        "Kahramanmaraş": { x: 9, y: 4, plate: "46", region: "Akdeniz", alt: 568, neighbors: ["Kayseri", "Sivas", "Malatya", "Adıyaman", "Gaziantep", "Osmaniye", "Adana"], desc: "Kurtuluş Savaşı İstiklal Madalyası kenti, dondurması ve Ahir Dağı." },
        "Malatya": { x: 10, y: 4, plate: "44", region: "Doğu Anadolu", alt: 964, neighbors: ["Sivas", "Erzincan", "Elazığ", "Diyarbakır", "Adıyaman", "Kahramanmaraş"], desc: "Dünya kuru kayısı başkenti, Arslantepe Höyüğü ve Nemrut Dağı kuzey kapısı." },
        "Elazığ": { x: 11, y: 4, plate: "23", region: "Doğu Anadolu", alt: 1067, neighbors: ["Tunceli", "Bingöl", "Diyarbakır", "Malatya"], desc: "Harput Kalesi, Hazar Gölü, Keban Barajı ve vişne mermeri." },
        "Bitlis": { x: 13, y: 4, plate: "13", region: "Doğu Anadolu", alt: 1545, neighbors: ["Ağrı", "Van", "Siirt", "Batman", "Muş"], desc: "Nemrut Krater Gölü, Ahlat Selçuklu Mezarlığı ve Beşminare tarihi." },
        "Van": { x: 14, y: 4, plate: "65", region: "Doğu Anadolu", alt: 1726, neighbors: ["Ağrı", "Iğdır", "Hakkari", "Şırnak", "Siirt", "Bitlis"], desc: "Van Gölü (Türkiye'nin en büyüğü), Akdamar Kilisesi, Van Kalesi ve meşhur kahvaltı kültürü." },

        // --- Y: 5 (Ege Kıyısı, Göller, Güneydoğu Ovaları) ---
        "İzmir": { x: 0, y: 5, plate: "35", region: "Ege", alt: 2, neighbors: ["Balıkesir", "Manisa", "Aydın"], desc: "Ege'nin incisi metropol, Kordonboyu, Saat Kulesi, Çeşme, Efes Antik Kenti ve İZOTAŞ." },
        "Aydın": { x: 1, y: 5, plate: "09", region: "Ege", alt: 64, neighbors: ["İzmir", "Manisa", "Denizli", "Muğla"], desc: "Büyük Menderes Ovası, Kuşadası limanı, incir bahçeleri ve Didim sahilleri." },
        "Denizli": { x: 2, y: 5, plate: "20", region: "Ege", alt: 420, neighbors: ["Aydın", "Manisa", "Uşak", "Afyonkarahisar", "Burdur", "Muğla"], desc: "Pamukkale beyaz travertenleri, Hierapolis antik kenti, tekstil ve horoz simgesi." },
        "Burdur": { x: 3, y: 5, plate: "15", region: "Akdeniz", alt: 957, neighbors: ["Denizli", "Afyonkarahisar", "Isparta", "Antalya", "Muğla"], desc: "Salda Gölü (Türkiye'nin Maldivleri), Sagalassos antik kenti ve lavanta vadileri." },
        "Isparta": { x: 4, y: 5, plate: "32", region: "Akdeniz", alt: 1049, neighbors: ["Burdur", "Afyonkarahisar", "Konya", "Antalya"], desc: "Güller ve lavanta diyarı, Eğirdir Gölü ve Davraz kayak merkezi." },
        "Karaman": { x: 5, y: 5, plate: "70", region: "İç Anadolu", alt: 1039, neighbors: ["Konya", "Mersin", "Antalya"], desc: "Türkçenin başkenti Karamanoğlu Mehmet Bey diyarı ve bisküvi sanayisi." },
        "Adıyaman": { x: 9, y: 5, plate: "02", region: "Güneydoğu Anadolu", alt: 669, neighbors: ["Malatya", "Şanlıurfa", "Gaziantep", "Kahramanmaraş", "Diyarbakır"], desc: "UNESCO mirası Nemrut Dağı dev heykelleri, Cendere Köprüsü ve Fırat Havzası." },
        "Diyarbakır": { x: 11, y: 5, plate: "21", region: "Güneydoğu Anadolu", alt: 675, neighbors: ["Elazığ", "Bingöl", "Muş", "Batman", "Mardin", "Şanlıurfa", "Adıyaman", "Malatya"], desc: "Tarihi Diyarbakır Surları, Hevsel Bahçeleri, On Gözlü Köprü ve karpuz simgesi." },
        "Batman": { x: 12, y: 5, plate: "72", region: "Güneydoğu Anadolu", alt: 570, neighbors: ["Muş", "Bitlis", "Siirt", "Mardin", "Diyarbakır"], desc: "Hasankeyf tarihi kalesi, Malabadi Köprüsü ve petrol rafinerisi." },
        "Siirt": { x: 13, y: 5, plate: "56", region: "Güneydoğu Anadolu", alt: 895, neighbors: ["Bitlis", "Van", "Şırnak", "Mardin", "Batman"], desc: "Veysel Karani Türbesi, fıstık bahçeleri ve Botan Çayı kanyonu." },

        // --- Y: 6 (Akdeniz Kıyısı & Güneydoğu Sınır Boyu) ---
        "Muğla": { x: 1, y: 6, plate: "48", region: "Ege", alt: 660, neighbors: ["Aydın", "Denizli", "Burdur", "Antalya"], desc: "Bodrum, Fethiye, Marmaris koyları, Ölüdeniz ve Türkiye'nin en uzun kıyı şeridi." },
        "Antalya": { x: 3, y: 6, plate: "07", region: "Akdeniz", alt: 30, neighbors: ["Muğla", "Burdur", "Isparta", "Konya", "Karaman", "Mersin"], desc: "Akdeniz turizm başkenti, Kaleiçi, Konyaaltı, Alanya kalesi ve Toros etekleri." },
        "Mersin": { x: 6, y: 6, plate: "33", region: "Akdeniz", alt: 10, neighbors: ["Antalya", "Karaman", "Konya", "Niğde", "Adana"], desc: "Kızkalesi, Cennet-Cehennem obrukları, Türkiye'nin en büyük Akdeniz limanı ve tantuni." },
        "Adana": { x: 7, y: 6, plate: "01", region: "Akdeniz", alt: 23, neighbors: ["Mersin", "Niğde", "Kayseri", "Kahramanmaraş", "Osmaniye", "Hatay"], desc: "Çukurova bereketi, Taşköprü, Seyhan Baraj Gölü ve kebap kültürü." },
        "Osmaniye": { x: 8, y: 6, plate: "80", region: "Akdeniz", alt: 125, neighbors: ["Adana", "Kahramanmaraş", "Gaziantep", "Hatay"], desc: "Kadirli Karatepe Aslantaş Milli Parkı, kaleler şehri ve yerfıstığı." },
        "Gaziantep": { x: 9, y: 6, plate: "27", region: "Güneydoğu Anadolu", alt: 850, neighbors: ["Osmaniye", "Kahramanmaraş", "Adıyaman", "Şanlıurfa", "Kilis"], desc: "Zeugma Mozaik Müzesi, gastronomi başkenti, baklava, fıstık ve tarihi kale." },
        "Kilis": { x: 8, y: 7, plate: "79", region: "Güneydoğu Anadolu", alt: 660, neighbors: ["Gaziantep"], desc: "Zeytin bahçeleri, Ravanda Kalesi ve güney sınır kapısı." },
        "Şanlıurfa": { x: 10, y: 6, plate: "63", region: "Güneydoğu Anadolu", alt: 518, neighbors: ["Gaziantep", "Adıyaman", "Diyarbakır", "Mardin"], desc: "Tarihin sıfır noktası Göbeklitepe, Balıklıgöl, Harran Kümbet Evleri ve peygamberler kenti." },
        "Mardin": { x: 12, y: 6, plate: "47", region: "Güneydoğu Anadolu", alt: 1083, neighbors: ["Şanlıurfa", "Diyarbakır", "Batman", "Siirt", "Şırnak"], desc: "Taş işçiliği konakları, Dara Antik Kenti, Mezopotamya Ovası manzarası ve Deyrulzafaran." },
        "Şırnak": { x: 13, y: 6, plate: "73", region: "Güneydoğu Anadolu", alt: 1400, neighbors: ["Mardin", "Siirt", "Van", "Hakkari"], desc: "Cudi Dağı, Kasrik Boğazı, Habur sınır kapısı ve Dicle Nehri kıyısı." },
        "Hakkari": { x: 15, y: 6, plate: "30", region: "Doğu Anadolu", alt: 1720, neighbors: ["Şırnak", "Van"], desc: "Cilo-Sat Dağları buzulları, Zap Vadisi, ters lale ve en doğu sınır zirveleri." },

        // --- Y: 7 (En Güney Akdeniz Çıkıntısı) ---
        "Hatay": { x: 7, y: 7, plate: "31", region: "Akdeniz", alt: 85, neighbors: ["Adana", "Osmaniye", "Gaziantep"], desc: "Medeniyetler beşiği, Saint Pierre Kilisesi, Harbiye Şelaleleri ve zengin gastronomi." }
    };

    const TurkeyAtlas = {
        provinces: PROVINCES_MAP,
        currentCity: "Tekirdağ",
        currentMode: "provinces", // "provinces" | "districts"
        selectedDistrictIndex: 0,
        districtsList: [],
        audioCtx: null,

        // Haritayı Başlat
        init: function() {
            this.bindEvents();
            console.log("[TurkeyAtlas] 81 İl Coğrafya Atlası ve Izgara Motoru hazır.");
        },

        // Web Audio Synthesizer (3D Stereo Panning & Yön Geri Bildirimi)
        playSpatialTone: function(x, y, isBorder) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                if (!this.audioCtx) this.audioCtx = new AudioContext();
                if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

                const ctx = this.audioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                // Doğu/Batı Stereo Panning (-1.0 sol, +1.0 sağ)
                const panVal = Math.max(-1, Math.min(1, ((x / 15) * 2) - 1));
                let panner = null;
                if (ctx.createStereoPanner) {
                    panner = ctx.createStereoPanner();
                    panner.pan.setValueAtTime(panVal, ctx.currentTime);
                }

                if (isBorder) {
                    // Sınır Çarpma Sesi (Derin rezonanslı dalga sesi)
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(140, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.25);
                    gain.gain.setValueAtTime(0.25, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                } else {
                    // Şehir Zili (Kuzey yüksek perde, Güney bas perde)
                    const baseFreq = 520 - (y * 35); // 275Hz - 520Hz
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.08);
                    osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 0.2);

                    gain.gain.setValueAtTime(0.18, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
                }

                if (panner) {
                    osc.connect(gain);
                    gain.connect(panner);
                    panner.connect(ctx.destination);
                } else {
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                }

                osc.start();
                osc.stop(ctx.currentTime + (isBorder ? 0.25 : 0.22));
            } catch(e) {
                // AudioContext izin kısıtlarında sessizce geç
            }
        },

        // Atlas Ekranını Aç
        open: function(initialCity) {
            if (initialCity && this.provinces[initialCity]) {
                this.currentCity = initialCity;
            } else if (typeof Game !== 'undefined' && Game.currentCity && this.provinces[Game.currentCity]) {
                this.currentCity = Game.currentCity;
            }
            this.currentMode = "provinces";

            if (typeof UI !== 'undefined' && UI.switchScreen) {
                UI.switchScreen("atlas-screen");
            } else {
                const scr = document.getElementById("atlas-screen");
                if (scr) scr.classList.remove("hidden");
            }

            this.render();
            this.speakCurrentCity();
        },

        // Atlas Ekranını Kapat ve Ana Menüye Dön
        close: function() {
            if (typeof UI !== 'undefined' && UI.switchScreen) {
                UI.switchScreen("title-screen");
            } else {
                const scr = document.getElementById("atlas-screen");
                if (scr) scr.classList.add("hidden");
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Türkiye Coğrafya Atlasından çıkıldı. Ana menüdesiniz.");
            }
        },

        // Izgarada Yön Tuşuyla Gezinme (Kuzey, Güney, Doğu, Batı)
        move: function(direction) {
            if (this.currentMode === 'districts') {
                this.navigateDistricts(direction);
                return;
            }

            const cur = this.provinces[this.currentCity];
            if (!cur) return;

            let targetX = cur.x;
            let targetY = cur.y;

            if (direction === 'up') {
                targetY--;
            } else if (direction === 'down') {
                targetY++;
            } else if (direction === 'left') {
                targetX--;
            } else if (direction === 'right') {
                targetX++;
            }

            // En yakın şehri bul veya sınır tespit et
            const nextCity = this.findCityInDirection(cur, targetX, targetY, direction);

            if (nextCity) {
                this.currentCity = nextCity;
                const nextData = this.provinces[nextCity];
                this.playSpatialTone(nextData.x, nextData.y, false);
                this.render();
                this.speakCurrentCity();
            } else {
                // Sınır Çarpması
                this.playSpatialTone(cur.x, cur.y, true);
                let borderReason = "";
                if (direction === 'up') borderReason = "Karadeniz Sahil Sınırı. Daha kuzeye kara bağlantısı yoktur.";
                else if (direction === 'down') borderReason = "Akdeniz ve Güney Ülke Sınırı. Daha güneye kara bağlantısı yoktur.";
                else if (direction === 'left') borderReason = "Ege Denizi ve Batı Sınır Kapısı. Daha batıya kara bağlantısı yoktur.";
                else if (direction === 'right') borderReason = "Doğu Ülke Sınırı. Daha doğuya kara bağlantısı yoktur.";

                this.announceText(borderReason, "assertive");
            }
        },

        // Belirtilen yöndeki en mantıklı komşuyu veya en yakın şehri bul
        findCityInDirection: function(fromCity, targetX, targetY, direction) {
            // 1. Önce tam hedef koordinatta il var mı bak
            for (const [name, p] of Object.entries(this.provinces)) {
                if (p.x === targetX && p.y === targetY) {
                    return name;
                }
            }

            // 2. Tam koordinatta yoksa, o yöndeki en yakın geçerli ili seç
            let closestCity = null;
            let minDistance = Infinity;

            for (const [name, p] of Object.entries(this.provinces)) {
                if (name === this.currentCity) continue;

                let isEligible = false;
                if (direction === 'up' && p.y < fromCity.y) isEligible = true;
                if (direction === 'down' && p.y > fromCity.y) isEligible = true;
                if (direction === 'left' && p.x < fromCity.x) isEligible = true;
                if (direction === 'right' && p.x > fromCity.x) isEligible = true;

                if (isEligible) {
                    const dx = p.x - fromCity.x;
                    const dy = p.y - fromCity.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestCity = name;
                    }
                }
            }

            return closestCity;
        },

        // Ekran Okuyucu ve Sesli Bildirim
        speakCurrentCity: function() {
            const c = this.provinces[this.currentCity];
            if (!c) return;

            const adminInfo = (typeof window.TurkeyAdminData !== 'undefined' && window.TurkeyAdminData[this.currentCity]) ? window.TurkeyAdminData[this.currentCity] : null;
            const distCount = adminInfo && adminInfo.districts ? Object.keys(adminInfo.districts).length : (c.districts ? c.districts.length : 1);
            const neighborsStr = c.neighbors && c.neighbors.length ? c.neighbors.join(", ") : "Bölgesel komşular";

            const speechText = `${this.currentCity}, Plaka ${c.plate}. ${c.region} Bölgesi. Rakım: ${c.alt} metre. ${distCount} ilçe. Komşuları: ${neighborsStr}. İlçeleri gezmek için Enter, komşuları detaylı dinlemek için K, arama yapmak için F tuşuna basınız.`;

            this.announceText(speechText, "polite");
        },

        // Komşuları Detaylı Seslendir (K Tuşu)
        speakNeighborsDetail: function() {
            const c = this.provinces[this.currentCity];
            if (!c) return;
            const nList = c.neighbors || [];
            if (!nList.length) {
                this.announceText(`${this.currentCity} ilinin kayıtlı sınır komşusu bulunamadı.`, "assertive");
                return;
            }
            const speech = `${this.currentCity} ilinin sınır komşuları: ${nList.join(", ")}. Komşu illere ok tuşlarıyla geçiş yapabilirsiniz.`;
            this.announceText(speech, "assertive");
        },

        // İldeki Aktif Otobüs Hatlarını Seslendir (R Tuşu)
        speakRoutesDetail: function() {
            const cityName = this.currentCity;
            let matchedRoutes = [];
            if (typeof routesData !== 'undefined') {
                matchedRoutes = Object.values(routesData).filter(r => 
                    r && (r.sehir === cityName || r.originCity === cityName || r.destCity === cityName || (r.district && r.district.includes(cityName)))
                );
            }

            if (cityName === "Tekirdağ" && typeof window !== 'undefined' && window.tekulasHatVeritabani) {
                const lineCount = window.tekulasHatVeritabani.length;
                const stopCount = window.tekulasHatVeritabani.reduce((sum, r) => sum + (r.stops ? r.stops.length : 0), 0);
                const sampleTitles = window.tekulasHatVeritabani.slice(0, 3).map(r => r.name).join(". ");
                const speech = `Tekirdağ ilinde 11 ilçeyi birbirine bağlayan ${lineCount} aktif belediye hattı ve ${stopCount} gerçek durak mevcuttur. Örnek hatlar: ${sampleTitles}. Sefere çıkmak için Serbest Sürüş veya Kariyer modunu başlatabilirsiniz.`;
                this.announceText(speech, "assertive");
                return;
            }

            if (matchedRoutes.length > 0) {
                const titles = matchedRoutes.slice(0, 3).map(r => r.name).join(". ");
                const speech = `${cityName} ilinden kalkan ${matchedRoutes.length} aktif otobüs seferi mevcuttur. Örnek hatlar: ${titles}. Sefere çıkmak için Serbest Sürüş veya Kariyer modunu başlatabilirsiniz.`;
                this.announceText(speech, "assertive");
            } else {
                this.announceText(`${cityName} merkezli aktif ekspres seferi hazır durumdadır. Şirket merkezini bu ile kurarak sefer başlatabilirsiniz.`, "polite");
            }
        },

        // İlçeler Modunu Aç (Enter Tuşu)
        openDistricts: function() {
            const cityName = this.currentCity;
            const adminInfo = (typeof window.TurkeyAdminData !== 'undefined' && window.TurkeyAdminData[cityName]) ? window.TurkeyAdminData[cityName] : null;

            let distNames = [];
            if (adminInfo && adminInfo.districts) {
                distNames = Object.keys(adminInfo.districts);
            } else {
                distNames = [cityName + " Merkez"];
            }

            this.currentMode = "districts";
            this.selectedDistrictIndex = 0;
            this.districtsList = distNames;

            this.render();

            const welcomeDist = `${cityName} İlçeler Atlası açıldı. Toplam ${distNames.length} ilçe mevcuttur. İlçeler arasında gezinmek için Yukarı ve Aşağı ok tuşlarını kullanınız. İller haritasına geri dönmek için Escape tuşuna basınız. İlk ilçe: ${distNames[0]}.`;
            this.announceText(welcomeDist, "assertive");
        },

        // İlçeler Arasında Gezinme
        navigateDistricts: function(direction) {
            if (!this.districtsList || !this.districtsList.length) return;

            if (direction === 'down' || direction === 'right') {
                this.selectedDistrictIndex = (this.selectedDistrictIndex + 1) % this.districtsList.length;
            } else if (direction === 'up' || direction === 'left') {
                this.selectedDistrictIndex = (this.selectedDistrictIndex - 1 + this.districtsList.length) % this.districtsList.length;
            }

            this.render();

            const curDist = this.districtsList[this.selectedDistrictIndex];
            const cityName = this.currentCity;
            const adminInfo = (typeof window.TurkeyAdminData !== 'undefined' && window.TurkeyAdminData[cityName]) ? window.TurkeyAdminData[cityName] : null;
            const stopsCount = (adminInfo && adminInfo.districts && adminInfo.districts[curDist]) ? adminInfo.districts[curDist].length : 6;

            const speech = `${this.selectedDistrictIndex + 1}. İlçe: ${curDist}. ${cityName} iline bağlıdır. ${stopsCount} önemli durak ve mahalle hattı bulunmaktadır.`;
            this.announceText(speech, "polite");
        },

        // İlçeler Modundan Geri Dön (Escape Tuşu)
        backToProvinces: function() {
            this.currentMode = "provinces";
            this.render();
            const speech = `${this.currentCity} iline dönüldü. 81 İl Izgara Haritasındasınız. Gezinmek için ok tuşlarını kullanınız.`;
            this.announceText(speech, "assertive");
        },

        // Hızlı İl veya İlçe Arama (F Tuşu)
        openSearch: function() {
            const query = prompt("🗺️ TÜRKİYE COĞRAFYA ATLASI ARAMA\n\nGitmek istediğiniz il, ilçe veya plaka kodunu yazınız (Örn: Bolu, Çorlu, Çankaya, 59):");
            if (!query || !query.trim()) return;

            const q = query.trim().toLowerCase();

            // 1. Plaka eşleşmesi
            for (const [name, p] of Object.entries(this.provinces)) {
                if (p.plate === q || p.plate === q.padStart(2, '0')) {
                    this.currentCity = name;
                    this.currentMode = "provinces";
                    this.render();
                    this.announceText(`Plaka ${p.plate} eşleşti: ${name} iline gidildi.`, "assertive");
                    this.speakCurrentCity();
                    return;
                }
            }

            // 2. İl adı eşleşmesi
            for (const name of Object.keys(this.provinces)) {
                if (name.toLowerCase().includes(q)) {
                    this.currentCity = name;
                    this.currentMode = "provinces";
                    this.render();
                    this.announceText(`${name} ili bulundu ve haritada konumlanıldı.`, "assertive");
                    this.speakCurrentCity();
                    return;
                }
            }

            // 3. İlçe adı eşleşmesi
            if (typeof window.TurkeyAdminData !== 'undefined') {
                for (const [cName, cData] of Object.entries(window.TurkeyAdminData)) {
                    if (cData && cData.districts) {
                        for (const dName of Object.keys(cData.districts)) {
                            if (dName.toLowerCase().includes(q)) {
                                this.currentCity = cName;
                                this.currentMode = "districts";
                                this.districtsList = Object.keys(cData.districts);
                                this.selectedDistrictIndex = this.districtsList.indexOf(dName);
                                if (this.selectedDistrictIndex === -1) this.selectedDistrictIndex = 0;
                                this.render();
                                this.announceText(`${dName} ilçesi bulundu! ${cName} ili ilçeler atlasına gidildi.`, "assertive");
                                return;
                            }
                        }
                    }
                }
            }

            this.announceText(`'${query}' aramasına uygun il veya ilçe bulunamadı.`, "assertive");
        },

        // Canlı Bölge ve NVDA Bildirimi
        announceText: function(text, politeness = "polite") {
            const liveEl = document.getElementById("atlas-live-region");
            if (liveEl) {
                liveEl.setAttribute("aria-live", politeness);
                liveEl.innerText = text;
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(text);
            }
        },

        // HTML Arayüzünü Canlı Çiz (Düşük Görenler & Görsel Düzen)
        render: function() {
            const container = document.getElementById("atlas-content-container");
            if (!container) return;

            const c = this.provinces[this.currentCity];
            if (!c) return;

            const adminInfo = (typeof window.TurkeyAdminData !== 'undefined' && window.TurkeyAdminData[this.currentCity]) ? window.TurkeyAdminData[this.currentCity] : null;
            const distCount = adminInfo && adminInfo.districts ? Object.keys(adminInfo.districts).length : (c.districts ? c.districts.length : 1);

            if (this.currentMode === 'districts') {
                // İLÇELER GÖRÜNÜMÜ
                let districtsHtml = this.districtsList.map((dName, idx) => {
                    const isSel = idx === this.selectedDistrictIndex;
                    const bg = isSel ? 'linear-gradient(135deg, rgba(56,189,248,0.35), rgba(14,165,233,0.2))' : 'rgba(15,23,42,0.6)';
                    const border = isSel ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)';
                    const color = isSel ? '#38bdf8' : '#e2e8f0';
                    const icon = isSel ? '👉' : '📍';
                    return `
                        <div class="atlas-district-card nav-item" style="background: ${bg}; border: ${border}; color: ${color}; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="TurkeyAtlas.selectedDistrictIndex = ${idx}; TurkeyAtlas.render(); TurkeyAtlas.navigateDistricts('stay');">
                            <div>
                                <span style="margin-right: 8px;">${icon}</span>
                                <strong>${idx + 1}. ${dName}</strong>
                            </div>
                            <span style="font-size: 0.85rem; color: #94a3b8;">${this.currentCity} Merkezine Bağlı</span>
                        </div>
                    `;
                }).join("");

                container.innerHTML = `
                    <div style="background: rgba(15,23,42,0.92); border: 2px solid #38bdf8; border-radius: 12px; padding: 20px; box-shadow: 0 4px 25px rgba(0,0,0,0.5);">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56,189,248,0.3); padding-bottom: 12px; margin-bottom: 16px;">
                            <div>
                                <h2 style="color: #38bdf8; margin: 0; font-size: 1.4rem;">🏛️ ${this.currentCity} İli İlçeler Atlası</h2>
                                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 0.95rem;">Toplam ${this.districtsList.length} İlçe • Seçili: <strong>${this.districtsList[this.selectedDistrictIndex]}</strong></p>
                            </div>
                            <button class="modern-btn" onclick="TurkeyAtlas.backToProvinces();" style="padding: 8px 14px; background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; border-radius: 6px; cursor: pointer;">
                                ⬅️ İller Haritasına Dön (Esc)
                            </button>
                        </div>
                        <div style="max-height: 420px; overflow-y: auto; padding-right: 6px;">
                            ${districtsHtml}
                        </div>
                        <div style="margin-top: 14px; text-align: center; color: #94a3b8; font-size: 0.9rem;">
                            💡 Kısayollar: <strong>Yukarı / Aşağı Ok</strong>: İlçe Değiştir | <strong>Escape / Backspace</strong>: İllere Dön.
                        </div>
                    </div>
                `;
            } else {
                // İLLER IZGARASI GÖRÜNÜMÜ
                const neighborsHtml = c.neighbors ? c.neighbors.map(n => `
                    <button class="modern-btn" onclick="TurkeyAtlas.open('${n}');" style="padding: 4px 10px; font-size: 0.85rem; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; border-radius: 5px; cursor: pointer; margin: 2px;">
                        ${n}
                    </button>
                `).join(" ") : 'Bulunmuyor';

                container.innerHTML = `
                    <div style="background: rgba(15,23,42,0.95); border: 2px solid #38bdf8; border-radius: 12px; padding: 22px; box-shadow: 0 4px 25px rgba(0,0,0,0.5);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(56,189,248,0.3); padding-bottom: 14px; margin-bottom: 16px;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="background: #38bdf8; color: #0f172a; font-weight: bold; font-size: 1.1rem; padding: 4px 10px; border-radius: 6px;">[${c.plate}]</span>
                                    <h2 style="color: #fff; margin: 0; font-size: 1.7rem;">${this.currentCity}</h2>
                                    <span style="background: rgba(56,189,248,0.2); color: #7dd3fc; padding: 4px 10px; border-radius: 6px; font-size: 0.9rem; font-weight: bold;">${c.region} Bölgesi</span>
                                </div>
                                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 1rem; line-height: 1.6;">${c.desc}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #facc15; font-size: 1.1rem; font-weight: bold;">🏔️ Rakım: ${c.alt} m</div>
                                <div style="color: #4ade80; font-size: 0.95rem; margin-top: 4px;">🏙️ ${distCount} İlçe</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 18px;">
                            <div style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 8px; font-weight: bold;">🧭 Sınır Komşusu İller (Doğrudan Geçilebilir):</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                ${neighborsHtml}
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 18px;">
                            <button class="menu-btn primary-btn nav-item" onclick="TurkeyAtlas.openDistricts();" style="justify-content: center; padding: 12px;">
                                📂 İlçeler Atlasını Aç (Enter)
                            </button>
                            <button class="menu-btn secondary-btn nav-item" onclick="TurkeyAtlas.speakNeighborsDetail();" style="justify-content: center; padding: 12px;">
                                🧭 Komşuları Dinle (K)
                            </button>
                            <button class="menu-btn secondary-btn nav-item" onclick="TurkeyAtlas.speakRoutesDetail();" style="justify-content: center; padding: 12px;">
                                🛣️ Otobüs Seferleri (R)
                            </button>
                            <button class="menu-btn secondary-btn nav-item" onclick="TurkeyAtlas.openSearch();" style="justify-content: center; padding: 12px;">
                                🔍 İl / İlçe Ara (F)
                            </button>
                        </div>

                        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 8px; text-align: center; color: #94a3b8; font-size: 0.92rem;">
                            🧭 <strong>Yön Tuşları:</strong> ⬆️ Kuzey (Karadeniz) | ⬇️ Güney (Akdeniz) | ⬅️ Batı (Ege/Trakya) | ➡️ Doğu (Anadolu) | <strong>Esc:</strong> Ana Menü
                        </div>
                    </div>
                `;
            }
        },

        // Klavye Olaylarını Bağla
        bindEvents: function() {
            window.addEventListener("keydown", (e) => {
                const scr = document.getElementById("atlas-screen");
                if (!scr || scr.classList.contains("hidden")) return;

                const k = e.key;

                if (k === "ArrowUp") {
                    e.preventDefault();
                    TurkeyAtlas.move("up");
                } else if (k === "ArrowDown") {
                    e.preventDefault();
                    TurkeyAtlas.move("down");
                } else if (k === "ArrowLeft") {
                    e.preventDefault();
                    TurkeyAtlas.move("left");
                } else if (k === "ArrowRight") {
                    e.preventDefault();
                    TurkeyAtlas.move("right");
                } else if (k === "Enter") {
                    e.preventDefault();
                    if (TurkeyAtlas.currentMode === "provinces") {
                        TurkeyAtlas.openDistricts();
                    }
                } else if (k === "Escape" || k === "Backspace") {
                    e.preventDefault();
                    if (TurkeyAtlas.currentMode === "districts") {
                        TurkeyAtlas.backToProvinces();
                    } else {
                        TurkeyAtlas.close();
                    }
                } else if (k.toLowerCase() === "k") {
                    e.preventDefault();
                    TurkeyAtlas.speakNeighborsDetail();
                } else if (k.toLowerCase() === "r") {
                    e.preventDefault();
                    TurkeyAtlas.speakRoutesDetail();
                } else if (k.toLowerCase() === "f" || k.toLowerCase() === "a") {
                    e.preventDefault();
                    TurkeyAtlas.openSearch();
                }
            });
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurkeyAtlas;
    }
    if (typeof window !== 'undefined') {
        window.TurkeyAtlas = TurkeyAtlas;
        document.addEventListener("DOMContentLoaded", () => {
            TurkeyAtlas.init();
        });
    }
})(typeof window !== 'undefined' ? window : global);

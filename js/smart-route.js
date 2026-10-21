/* ==========================================================================
   AKILLI ROTA SİSTEMİ (SMART ROUTE SYSTEM)
   Kullanıcı sadece Nereden ve Nereye gitmek istediğini seçer;
   Gidiş / Dönüş yönünü ve en uygun TEKULAŞ hattını sistem otomatik hesaplar.
   ========================================================================== */

const midPoints = {
        "Tekirdağ": ["Ganos Dağları & Şarköy Uçmakdere Virajları", "Kınalı - Çorlu Otoyol Kavşağı & Ergene Viyadüğü"],
        "Kırıkkale": ["Yahşihan Elmadağ Rampaları Geçişi (D-200 / E88)", "Tarihi Çeşnigir Köprüsü ve Kızılırmak Kanyonu Koridoru"],
        "Batman": ["Hasankeyf Dicle Nehri Yeni Viyadüğü ve Tünelleri (D-955)", "Malabadi Köprüsü Sınır Hattı ve Kozluk Dağ Geçişi"],
        "Şırnak": ["Cudi Dağı Şehit Şenay Aybüke Yalçın Tünelleri (D-400)", "Kasrik Boğazı ve Tarihi Taş Köprü Geçişi"],
        "Bartın": ["Amasra Tarihi Tüneli & Çeşm-i Cihan Seyir Noktası", "Ahmetusta Dağ Geçidi Zirvesi (1030m - D-755)"],
        "Ardahan": ["Sahara Dağı Zirve Geçidi (2600m - D-010 Şavşat Koridoru)", "Çıldır Gölü Buzul Seyir Noktası & Yalnızçam Yayla Yolu"],
        "Iğdır": ["Ağrı Dağı Kuzey Yamaçları & Pamuk Dağı Geçidi (1660m)", "Tuzluca Aras Kanyonu & Kaya Tuz Mağaraları Yolu"],
        "Karabük": ["Ahmetusta Rampaları & Safranbolu Kanyon Vadisi", "Yenice Filyos Nehri Kanyon Yolu Tünelleri"],
        "Kilis": ["Öncüpınar İpekyolu Koridoru & Zeytin Bahçeleri Geçişi", "Musabeyli Hassa Amanos Etekleri Dağ Yolu (D-410)"],
        "Osmaniye": ["Nurdağı Geçidi & Bahçe Otoyol Tünelleri (O-52 / E90)", "Toprakkale Kavşağı & Çukurova Ceyhan Geçiş Hattı"],
        "Düzce": ["Bolu Dağı Tüneli ve Viyadükleri (O-4 Anadolu Otoyolu)", "Akçakoca Karadeniz Sahil Tünelleri (D-655 / D-010)"],
        
        "Trabzon": ["Yeni Zigana Tüneli Trabzon Girişi (Maçka - D-885)", "Uzungöl & Haldizen Deresi Kanyon Yolu"],
        "Tunceli": ["Munzur Vadisi Milli Parkı Kanyon Yolu", "Pülümür Çayı Vadisi & Ağlayan Kayalar Geçişi (D-885)"],
        "Şanlıurfa": ["Göbeklitepe Antik Kült Yolu & Karaköprü Viyadükleri", "Birecik Fırat Nehri Asma Köprüsü (O-52 / D-400)"],
        "Uşak": ["Ulubey Kanyonu & Banaz Çayı Vadisi Geçişi", "D-300 Karun Karayolu Koridoru & Dumlupınar Sınırı"],
        "Van": ["Kuskunkıran Tüneli & Gevaş Van Gölü Geçişi (D-300)", "Güzeldere Geçidi Zirvesi (2730m - 32 Virajlar Tüneli - D-975)"],
        "Yozgat": ["Yozgat Çamlığı Milli Parkı Geçiş Yolu", "Akdağmadeni Çam Ormanları & Sivas İl Sınırı (D-200)"],
        "Zonguldak": ["Karadeniz Sahil Yolu Ereğli - Zonguldak Tünelleri (D-010)", "Devrek - Mengen Doruk Dağ Geçidi (D-750)"],
        "Aksaray": ["Ihlara Vadisi Kanyon Yolu & Hasan Dağı Etekleri", "Sultanhanı D-300 Konya - İpekyolu Koridoru"],
        "Karaman": ["Sertavul Geçidi Zirvesi (1650m) Karaman Mersin Sınırı", "Taşkale Manazan Mağaraları Yolu"],
        
        "Niğde": ["Aladağlar Demirkazık Geçidi Yolu (D-805)", "Ulukışla Toroslar Geçişi & Çiftehan Kaplıcaları"],
        "Ordu": ["Nefise Akçelik Karadeniz Sahil Tüneli (3.8 km)", "Boztepe Teleferik Meydanı & Sahil Kordonu"],
        "Rize": ["Ovit Tüneli Rize Girişi (14.3 km Çift Tüp - D-925)", "Fırtına Vadisi & Tarihi Kemer Köprüler Yolu"],
        "Sakarya": ["Sapanca Gölü Sahil Yolu & O-4 Otoyol Geçişi", "Geyve Boğazı D-650 Karasu - Sakarya Nehri Koridoru"],
        "Samsun": ["Şahinkaya Kanyonu Kızılırmak Boğazı Yolu", "Kavak Hacılar Dağ Geçidi Zirvesi (D-795)"],
        "Siirt": ["Botan Kanyonu Deliklitaş Viyadüğü & Seyir Terası", "Bitlis Deresi Baykan Geçişi (D-360 / D-965)"],
        "Sivas": ["Kızıldağ Geçidi Zirvesi (2190m - D-100)", "Yağdonduran Geçidi Tüneli (D-850)"],
        "Tokat": ["Çamlıbel Dağ Geçidi Zirvesi (1650m - D-850)", "Ballıca Mağarası & Pazar Vadisi Yolu"],
        
        "Kocaeli": ["Kuzey Marmara Otoyolu İzmit Viyadükleri & Tünelleri", "D-100 İzmit Körfez Geçişi & Hereke Rampaları"],
        "Kütahya": ["Aizanoi Antik Kenti & Çavdarhisar Geçişi (D-240)", "Domaniç Ormanları & Kocayayla Dağ Geçidi"],
        "Malatya": ["Tarihi Kömürhan Köprüsü & Fırat Geçişi (D-300)", "Beydağları & Reşadiye Geçidi (D-850)"],
        "Manisa": ["Sabuncubeli Tüneli Manisa Rampa Çıkışı (D-565)", "Kula Volkanik Jeoparkı & Gediz Kanyonu Geçişi (D-300)"],
        "Kahramanmaraş": ["Göksun Tünelleri & Edebiyat Yolu Geçişi (D-825)", "Pazarcık - Narlı Otoyol Kavşağı (O-52)"],
        "Mardin": ["Tarihi Artuklu Birinci Cadde Seyir Terası", "Dara Antik Kenti & Mezopotamya Ovası Yolu"],
        "Muğla": ["Sakar Geçidi Zirvesi & Gökova Körfezi Manzarası (D-550)", "Göcek Tüneli & Dalaman Fethiye Sahil Geçişi (D-400)"],
        "Muş": ["Tarihi Murat Köprüsü & Murat Nehri Viyadüğü", "Varto - Bingöl Dağları Karlıova Geçidi (D-955)"],
        "Nevşehir": ["Göreme - Uçhisar Peri Bacaları Vadisi Yolu", "Derinkuyu Yeraltı Şehri & Ihlara Aksı (D-765)"],
        
        "Hakkâri": ["Zap Vadisi Kanyonu & Karayolu Tünelleri (D-400)", "Cilo Dağları & Sümbül Geçidi (D-400)"],
        "Hatay": ["Belen Geçidi Zirvesi & Amanos Dağları (D-817)", "Tarihi Titus Tüneli & Samandağ Sahil Yolu"],
        "Isparta": ["Eğirdir Gölü Boğazı & Kovada Kanalı Yolu", "Dostluk Yolu & Çeltikçi Geçidi (D-685)"],
        "Mersin": ["Çeşmeli - Taşucu Akdeniz Sahil Otoyolu & Viyadükleri", "Sertavul Geçidi Zirvesi (1650m - D-715)"],
        "İzmir": ["O-5 İstanbul - İzmir Otoyolu Belkahve Geçişi", "Sabuncubeli Tüneli & Bornova Rampa Geçişi (D-565)"],
        "Kars": ["Sarıkamış Allahuekber Dağları Geçidi (D-957)", "Çıldır Gölü Sahil Yolu & Arpaçay Kanyonu"],
        "Kastamonu": ["Ilgaz Dağı 15 Temmuz İstiklal Tüneli (D-765)", "Küre Dağları Yaralıgöz Geçidi (D-759)"],
        "Kayseri": ["Erciyes Dağı Tekir Yaylası Geçidi (2215m)", "Pınarbaşı - Uzunyayla Doğu Anadolu Geçidi (D-300)"],
        "Kırşehir": ["Cacabey Meydanı & Ahi Evran Külliyesi Aksı", "Kaman Hirfanlı Baraj Gölü Geçiş Yolu"],
        
        "Artvin": ["Cankurtaran Geçidi & Tüneli (D-010)", "Çoruh Kanyonu & Deriner Viyadüğü"],
        "Sinop": ["Dr. Kadir Topbaş Tüneli & Çiftlik Geçidi", "Küre Dağları Boyabat Tırmanışı & D-785"],
        "Yalova": ["Osmangazi Köprüsü Altınova Gişeleri", "Süpürgelik Dağ Geçidi Zirvesi"],
        "Gümüşhane": ["Yeni Zigana Tüneli Geçişi (14.5 km Çift Tüp)", "Vauk Dağı Geçidi (1875m)"],
        "Giresun": ["Karadeniz Sahil Yolu (D-010) Giresun Adası Manzarası", "Eğribel Tüneli Geçişi (D-865)"],
        "Gaziantep": ["Zeugma İpekyolu Bulvarı", "Nurdağı TAG Otoyolu Geçidi (D-400 / O-52)"],
        "Eskişehir": ["Odunpazarı Tarihi Evleri Yolu", "Porsuk Çayı Boyu Bulvarı"],
        "Erzurum": ["Palandöken Dağı Ejder Zirvesi Yolu", "Ovit Tüneli Erzurum Girişi (D-925)"],
        "Konya": ["Seydişehir Alacabel Geçidi (1825m)", "Cihanbeyli Tuz Gölü Güney Girişi"],
        "Erzincan": ["Kızıldağ Geçidi Zirvesi (2190m)", "Girlevik Şelalesi & Çağlayan Kavşağı"],
        "Elazığ": ["Tarihi Kömürhan Köprüsü & Tüneli (Fırat Geçişi)", "Maden Boğazı D-885 Geçişi"],
        "Bayburt": ["Kop Dağı Geçidi Zirvesi (2409m)", "Vauk Dağı Geçidi & Tüneli"],
        "Diyarbakır": ["Tarihi Malabadi Köprüsü & Silvan Kavşağı", "Ergani Maden Boğazı Geçişi"],
        "Çorum": ["Hattuşa Hitit Antik Kenti Kavşağı", "Osmancık D-100 Kızılırmak Geçişi"],
        "Çankırı": ["Ilgaz Dağı 15 Temmuz İstiklal Tüneli", "Çerkeş D-100 Trans-Avrupa Kavşağı"],
        "Bursa": ["Osmangazi Köprüsü & O-5 Kuzey Girişi", "Uluabat Gölü Geçişi & Karacabey Kavşağı"],
        "Burdur": ["Burdur Gölü Sahil Yolu & D-650", "Çeltikçi Beli Geçidi & Bucak Ovası"],
        "Bolu": ["Bolu Dağı Tüneli & Viyadükleri (O-4)", "Köroğlu Dinlenme Tesisleri & D-100"],
        "Bitlis": ["Rahva Geçidi Platosu & D-300 Karayolu", "Bitlis Deresi Viyadüğü & Tünelleri"],
        "Bingöl": ["Çapakçur Viyadüğü & D-300 Karayolu", "Kuruca Geçidi Zirvesi & Murat Vadisi"],
        "Bilecik": ["Geyve Boğazı & D-650 Karasu Vadisi", "Bozüyük Karayolu Kavşağı & YHT Viyadüğü"],
        "Balıkesir": ["Susurluk Dinlenme Tesisleri & D-565", "Değirmenboğazı Tabiat Parkı & Çevre Yolu Gişeleri"],
        "Aydın": ["Selçuk - Ortaklar O-31 Otoyol Tüneli", "Büyük Menderes Viyadüğü & Çine Çevre Yolu"],
        "Denizli": ["Sarayköy Ovası & D-320 Karayolu", "Pamukkale Girişi & Çevre Yolu Kavşağı"],
        "Antalya": ["Çubuk Boğazı Toroslar Tırmanışı", "Döşemealtı Gişeleri & Antalya Kuzey Girişi"],
        "Ankara": ["Bolu Dağı Tüneli & O-4 Anadolu Otoyolu", "Akıncı Gişeleri & Ankara Çevre Otoyolu"],
        "Amasya": ["Merzifon Karayolu Kavşağı & D-100", "Yeşilırmak Kordon Boyu & Boğazköy Girişi"],
        "Ağrı": ["Eleşkirt Geçidi & Horasan Karayolu", "Ağrı Çevre Yolu & Sanayi Kavşağı"],
        "Afyonkarahisar": ["Özdilek / İkbal Karayolları Kavşağı", "Dumlupınar & Zafer Anıtı Sapağı"],
        "Adıyaman": ["Gölbaşı Gölleri Tabiat Parkı Geçişi", "Adıyaman Çevre Yolu & Altınşehir Kavşağı"],
        "Adana": ["Pozantı Toros Dağları Geçişi & O-21 Otoyolu", "Adana Kuzey Çevre Yolu & Gişeler"],
        "İstanbul": ["D-110 / O-7 Kuzey Marmara Otoyolu Gişeleri", "Mahmutbey Gişeleri & İstoç"],
        "Edirne": ["Havsa Kavşağı & D-100", "Tarihi Meriç Köprüsü & Selimiye Girişi"],
        "Kırklareli": ["Pınarhisar Sapağı & D-565", "Vilayet Meydanı Girişi"],
        "Çanakkale": ["Gelibolu Yarımadası Sahil Yolu", "1915 Çanakkale Köprüsü Viyadüğü"]
};
if (typeof window !== 'undefined') window.midPoints = midPoints;

const AkilliRotaSistemi = {
    allStopsCache: null,

    // MAHALLELER VE ANA DURAKLAR KATALOĞU (Ara duraklar giderken keşfedilir)
        getActiveDistrict: function() {
        if (typeof Game !== 'undefined' && Game.activeDistrict) return Game.activeDistrict;
        try {
            return localStorage.getItem('activeDistrict') || "Süleymanpaşa";
        } catch(e) {
            return "Süleymanpaşa";
        }
    },

    getActiveCatalog: function() {
        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;
        const activeDist = this.getActiveDistrict();

        if (activeDist === "all" && hasPassed10) {
            return this.mahallelerVeAnaDuraklar;
        }

        // Sadece seçilen ana bölgenin mahalleleri listelenir, diğer tüm ilçeler tamamen ve sessizce gizlenir
        const filtered = this.mahallelerVeAnaDuraklar.filter(item => item.district === activeDist);
        return filtered.length > 0 ? filtered : this.mahallelerVeAnaDuraklar.filter(item => item.district === "Süleymanpaşa");
    },

    mahallelerVeAnaDuraklar: [
        // SÜLEYMANPAŞA MAHALLELERİ VE ANA MERKEZLER
        { label: "Değirmenaltı Mahallesi (Kampüs & KYK)", district: "Süleymanpaşa", stopName: "Üniversite Caddesi", keys: ["degirmenalti", "kampus", "kyk", "universite"] },
        { label: "Çınarlı Mahallesi (Köprübaşı & Çarşı)", district: "Süleymanpaşa", stopName: "Köprübaşı Meydanı Caddesi", keys: ["cinarli", "koprubasi", "carsi"] },
        { label: "Ertuğrul Mahallesi (Valilik & Hükümet Cd.)", district: "Süleymanpaşa", stopName: "Hükümet Caddesi (Süleymanpaşa Tarihi Valilik & Çarşı)", keys: ["ertugrul", "valilik", "hukumet", "meydan"] },
        { label: "Gündoğdu Mahallesi (Şehir Hastanesi)", district: "Süleymanpaşa", stopName: "Şehir Hastanesi Ana Giriş Caddesi", keys: ["gundogdu", "sehir hastanesi", "hastane"] },
        { label: "100. Yıl Mahallesi (Atatürk Spor Salonu)", district: "Süleymanpaşa", stopName: "Atatürk Spor Salonu Caddesi", keys: ["100 yil", "spor salonu", "yuzuncu yil"] },
        { label: "Altınova Mahallesi (Sahil & Liman)", district: "Süleymanpaşa", stopName: "Altınova Sahil Caddesi", keys: ["altinova", "sahil", "liman"] },
        { label: "Hürriyet Mahallesi (Baykallar & Emniyet)", district: "Süleymanpaşa", stopName: "Baykallar Caddesi", keys: ["hurriyet", "baykallar", "emniyet"] },
        { label: "Süleymanpaşa İlçe Merkezi & Yeni Otogar", district: "Süleymanpaşa", stopName: "Süleymanpaşa Yeni Otobüs Terminali", keys: ["suleymanpasa", "tekirdag merkez", "suleymanpasa merkez", "suleymanpasa otogar", "tekirdag otogar", "yeni otogar"] },
        { label: "Süleymanpaşa Yeni Otogar (Otobüs Terminali)", district: "Süleymanpaşa", stopName: "Süleymanpaşa Yeni Otobüs Terminali", keys: ["suleymanpasa otogar", "tekirdag otogar", "yeni otogar"] },

        // SARAY MAHALLELERİ VE ANA MERKEZLER
        { label: "Ayaspaşa Mahallesi (Saray Çarşı & Belediye)", district: "Saray", stopName: "Saray Belediyesi (Cumhuriyet Meydanı)", keys: ["ayaspasa", "saray belediye", "saray carsi", "saray merkez"] },
        { label: "Pazarcık Mahallesi (Saray Otogarı)", district: "Saray", stopName: "Saray Otogar 1 (Giriş Peronu)", keys: ["pazarcik", "saray otogar"] },
        { label: "Yeni Mahalle (Saray Devlet Hastanesi)", district: "Saray", stopName: "Saray Devlet Hastanesi Ana Giriş", keys: ["yeni mahalle", "saray hastane", "devlet hastanesi"] },
        { label: "Yeni Mahalle (Saray Fakülte Kampüsü)", district: "Saray", stopName: "Saray Meslek Yüksekokulu (Fakülte Kampüs)", keys: ["fakulte", "kampus", "myo", "saray myo"] },
        { label: "Kemalpaşa Mahallesi (100. Yıl & Parklar)", district: "Saray", stopName: "100. Yıl Atatürk Caddesi 1", keys: ["kemalpasa", "100 yil saray", "ladin"] },
        { label: "Büyükyoncalı Mahallesi (Yoncalı Merkez)", district: "Saray", stopName: "Büyükyoncalı Merkez (Belediye Binası)", keys: ["buyukyoncali", "yoncali"] },
        { label: "Çukuryurt Mahallesi (Meydan)", district: "Saray", stopName: "Çukuryurt Köy Meydanı", keys: ["cukuryurt"] },

        // VELİMEŞE & ERGENE
        { label: "Velimeşe Mahallesi (Merkez Meydan)", district: "Velimeşe", stopName: "Velimeşe Merkez Meydan", keys: ["velimese", "velimese merkez", "cetin"] },
        { label: "Velimeşe Sanayi Bölgesi", district: "Velimeşe", stopName: "Sanayi Caddesi", keys: ["velimese sanayi", "osb"] },
        { label: "Velimeşe TOKİ Konutları", district: "Velimeşe", stopName: "TOKİ 233. Sokak", keys: ["velimese toki", "toki"] },

        // MARMARAEREĞLİSİ MAHALLELERİ VE ANA MERKEZLER
        { label: "Marmaraereğlisi Otogarı (İlçe Terminali)", district: "Marmaraereğlisi", stopName: "Marmaraereğlisi Otogar", keys: ["eregli", "marmaraereglisi", "eregli otogar"] },
        { label: "Yeniçiftlik Mahallesi (Meydan & Sahil)", district: "Marmaraereğlisi", stopName: "Yeniçiftlik Meydan", keys: ["yeniciftlik", "yeniciftlik sahil"] },
        { label: "Sultanköy Mahallesi (Sahil & Çarşı)", district: "Marmaraereğlisi", stopName: "Sultanköy Sahil", keys: ["sultankoy", "sultankoy sahil"] },
        { label: "Perinthos Antik Kenti & Liman", district: "Marmaraereğlisi", stopName: "Perinthos Antik Kenti", keys: ["perinthos", "antik kent"] },

        // ERGENE MAHALLELERİ VE ANA MERKEZLER
        { label: "Marmaracık Mahallesi (Ergene Belediye & Merkez)", district: "Ergene", stopName: "Ergene Belediyesi (Marmaracık)", keys: ["marmaracik", "ergene belediye", "ergene merkez"] },
        { label: "Sağlık Mahallesi (Edirne Caddesi & Pazar)", district: "Ergene", stopName: "Sağlık Mahallesi", keys: ["saglik", "saglik mahallesi"] },
        { label: "Yeşiltepe Mahallesi (Meydan & Çarşı)", district: "Ergene", stopName: "Yeşiltepe Meydan", keys: ["yesiltepe", "yesiltepe meydan"] },
        { label: "Ulaş Mahallesi (Belde Meydanı)", district: "Ergene", stopName: "Ulaş Meydan", keys: ["ulas", "ulas meydan"] },
        { label: "Vakıflar Sanayi & Kavşak", district: "Ergene", stopName: "Vakıflar Kavşağı", keys: ["vakiflar"] },

                                                                        // 20 DENİZLİ (EGE & PAMUKKALE)
                // 08 ARTVİN (DOĞU KARADENİZ & ÇORUH VADİSİ)
        { label: "Artvin Şehirlerarası Otobüs Terminali (Merkez)", district: "Artvin", stopName: "Artvin Otogar", keys: ["artvin", "artvin otogar", "coruh", "kafkasor"] },
        { label: "Hopa Karadeniz Sahil Terminali & Sarp Kapısı", district: "Artvin", stopName: "Hopa Terminal", keys: ["hopa", "sarp", "kemalpasa", "arhavi"] },
                // 09 AYDIN (EGE / BÜYÜK MENDERES & KIYI EGE)
        { label: "Aydın Büyükşehir Şehirlerarası Otobüs Terminali (Efeler)", district: "Aydın", stopName: "Aydın Otogar", keys: ["aydin", "aydin otogar", "efeler", "menderes"] },
        { label: "Kuşadası Otobüs Terminali & Ege Limanı", district: "Aydın", stopName: "Kuşadası Otogar", keys: ["kusadasi", "kusadasi otogar", "efes", "dilek"] },
        { label: "Nazilli İlçe Otobüs Terminali (Merkez)", district: "Aydın", stopName: "Nazilli Otogar", keys: ["nazilli", "nazilli otogar", "kuyucak"] },
                // 10 BALIKESİR (GÜNEY MARMARA & EGE KAVŞAĞI)
        { label: "Balıkesir Şehirlerarası Otobüs Terminali (Karesi / Merkez)", district: "Balıkesir", stopName: "Balıkesir Otogar", keys: ["balikesir", "balikesir otogar", "karesi", "altieylul"] },
        { label: "Bandırma Şehirlerarası Otogarı & İDO Limanı", district: "Balıkesir", stopName: "Bandırma Otogar", keys: ["bandirma", "bandirma otogar", "erdek", "liman"] },
        { label: "Edremit Körfez Otobüs Terminali & Akçay Sapağı", district: "Balıkesir", stopName: "Edremit Otogar", keys: ["edremit", "akcay", "altinoluk", "kazdaglari"] },
        { label: "Ayvalık Otobüs Terminali & Cunda Adası", district: "Balıkesir", stopName: "Ayvalık Otogar", keys: ["ayvalik", "cunda", "sarimsakli"] },
                // 11 BİLECİK (KURULUŞ ŞEHRİ & BOZÜYÜK KAVŞAĞI)
        { label: "Bilecik Şehirlerarası Otobüs Terminali (Merkez)", district: "Bilecik", stopName: "Bilecik Otogar", keys: ["bilecik", "bilecik otogar", "edebali", "merkez"] },
        { label: "Bozüyük Şehirlerarası Otogarı & YHT İstasyonu (Kavşak)", district: "Bilecik", stopName: "Bozüyük Otogar", keys: ["bozuyuk", "bozuyuk otogar", "bozuyuk yht", "kavsak"] },
        { label: "Söğüt Tarihi Ertuğrul Gazi Türbesi & İlçe Terminali", district: "Bilecik", stopName: "Söğüt Terminal", keys: ["sogut", "ertugrul gazi", "osmanli"] },
                // 12 BİNGÖL (DOĞU ANADOLU & MURAT HAVZASI)
        { label: "Bingöl Şehirlerarası Otobüs Terminali (Merkez)", district: "Bingöl", stopName: "Bingöl Otogar", keys: ["bingol", "bingol otogar", "capakcur", "dortyol"] },
        { label: "Solhan Otogarı & Yüzen Adalar Kavşağı", district: "Bingöl", stopName: "Solhan Otogar", keys: ["solhan", "yuzen adalar"] },
        { label: "Karlıova İlçe Terminali & Bingöl Dağları Eteği", district: "Bingöl", stopName: "Karlıova Otogar", keys: ["karliova", "gunes"] },
                // 13 BİTLİS (VAN GÖLÜ HAVZASI & NEMRUT)
        { label: "Bitlis Şehirlerarası Otobüs Terminali (Merkez)", district: "Bitlis", stopName: "Bitlis Otogar", keys: ["bitlis", "bitlis otogar", "besminare", "kale"] },
        { label: "Tatvan Şehirlerarası Otogarı & Van Gölü Feribot İskelesi", district: "Bitlis", stopName: "Tatvan Otogar", keys: ["tatvan", "tatvan otogar", "feribot", "iskele"] },
        { label: "Ahlat Selçuklu Tarihi Terminali & Kümbetler", district: "Bitlis", stopName: "Ahlat Otogar", keys: ["ahlat", "selcuklu", "kumbet"] },
                // 14 BOLU (BATI KARADENİZ & BOLU DAĞI GEÇİŞİ)
        { label: "Bolu Şehirlerarası Otobüs Terminali (Merkez)", district: "Bolu", stopName: "Bolu Otogar", keys: ["bolu", "bolu otogar", "izzet baysal", "abant"] },
        { label: "Gerede Şehirlerarası Otobüs Terminali (Kavşak)", district: "Bolu", stopName: "Gerede Otogar", keys: ["gerede", "gerede otogar", "kavsak"] },
        { label: "Mengen İlçe Otobüs Terminali (Aşçılar Diyarı)", district: "Bolu", stopName: "Mengen Otogar", keys: ["mengen", "mengen otogar", "ascilar"] },
                // 15 BURDUR (GÖLLER YÖRESİ & SALDA GÖLÜ)
        { label: "Burdur Şehirlerarası Otobüs Terminali (Merkez)", district: "Burdur", stopName: "Burdur Otogar", keys: ["burdur", "burdur otogar", "burdur golu", "sagalasos"] },
        { label: "Bucak İlçe Otobüs Terminali (Kavşak)", district: "Burdur", stopName: "Bucak Otogar", keys: ["bucak", "bucak otogar", "mermer"] },
        { label: "Salda Gölü Tabiat Parkı & Yeşilova Terminali", district: "Burdur", stopName: "Salda Gölü Terminal", keys: ["salda", "salda golu", "yesilova"] },
                // 57 SİNOP (TÜRKİYE'NİN EN KUZEYİ & HAMSİLOS)
                // TÜRKİYE DENİZLERİ VE SAHİL KORİDORLARI
        { label: "Karadeniz Sahil Yolu & Sarp Sınır Kapısı (D-010)", district: "Artvin", stopName: "Karadeniz Sahil Yolu", keys: ["karadeniz", "karadeniz sahili", "d010", "sahil yolu"] },
        { label: "Marmara Denizi Sahil Kordonu & Asyaport Limanı", district: "Tekirdağ", stopName: "Marmara Sahil Yolu", keys: ["marmara", "marmara denizi", "marmara sahili", "asyaport"] },
        { label: "Ege Denizi Kıyı Hattı & Antik Limanlar (D-550)", district: "İzmir", stopName: "Ege Sahil Yolu", keys: ["ege", "ege denizi", "ege sahili", "d550"] },
        { label: "Akdeniz Sahil Yolu & Toros Geçişi (D-400)", district: "Antalya", stopName: "Akdeniz Sahil Yolu", keys: ["akdeniz", "akdeniz sahili", "d400"] },
        { label: "Van Denizi Feribot İskelesi & Sahil Parkı", district: "Bitlis", stopName: "Van Denizi İskelesi", keys: ["van denizi", "van golu", "feribot iskelesi"] },
        { label: "Sinop Şehirlerarası Otobüs Terminali (Merkez / İskele)", district: "Sinop", stopName: "Sinop Otogar", keys: ["sinop", "sinop otogar", "inceburun", "cezaevi"] },
        { label: "Boyabat Şehirlerarası Otobüs Terminali (Kavşak)", district: "Sinop", stopName: "Boyabat Otogar", keys: ["boyabat", "boyabat otogar", "kale"] },
        { label: "Gerze İlçe Otobüs Terminali (Sakin Şehir)", district: "Sinop", stopName: "Gerze Otogar", keys: ["gerze", "gerze otogar", "cittaslow"] },
        { label: "İnceburun Feneri & Hamsilos Tabiat Parkı (En Kuzey Nokta)", district: "Sinop", stopName: "İnceburun Feneri", keys: ["inceburun", "hamsilos", "fener"] },
                // 16 BURSA (GÜNEY MARMARA & ULUDAĞ)
        { label: "Bursa Büyükşehir Şehirlerarası Terminali (Merkez)", district: "Bursa", stopName: "Bursa Otogar", keys: ["bursa", "bursa otogar", "uludag", "heykel"] },
        { label: "İnegöl Şehirlerarası Otobüs Terminali (Kavşak)", district: "Bursa", stopName: "İnegöl Otogar", keys: ["inegol", "inegol otogar", "mobilya"] },
        { label: "Mudanya BUDO / İDO Deniz Otobüsü İskelesi", district: "Bursa", stopName: "Mudanya İskele", keys: ["mudanya", "mudanya iskele", "budo", "ido"] },
        { label: "Uludağ Kayak Merkezi & Milli Park Oteller Bölgesi", district: "Bursa", stopName: "Uludağ Oteller", keys: ["uludag", "uludag oteller", "kayak"] },
                // 18 ÇANKIRI (ILGAZ DAĞLARI & KAYA TUZU)
        { label: "Çankırı Şehirlerarası Otobüs Terminali (Merkez)", district: "Çankırı", stopName: "Çankırı Otogar", keys: ["cankiri", "cankiri otogar", "kaya tuzu", "tas mescit"] },
        { label: "Çerkeş D-100 Karadeniz Kavşağı Otobüs Terminali", district: "Çankırı", stopName: "Çerkeş Otogar", keys: ["cerkes", "cerkes otogar", "d100", "bolu gecis"] },
        { label: "Ilgaz Dağı Milli Parkı & Kayak Merkezi Tesisleri", district: "Çankırı", stopName: "Ilgaz Kayak Tesisleri", keys: ["ilgaz", "ilgaz otogar", "kayak", "milli park"] },
        { label: "Kurşunlu Kaplıcaları & Şehirlerarası Mola Noktası", district: "Çankırı", stopName: "Kurşunlu Tesisleri", keys: ["kursunlu", "kaplica", "termal"] },
                // 19 ÇORUM (HİTİT BAŞKENTİ HATTUŞA & LEBLEBİ DİYARI)
        { label: "Çorum Şehirlerarası Otobüs Terminali (Merkez)", district: "Çorum", stopName: "Çorum Otogar", keys: ["corum", "corum otogar", "leblebi", "saat kulesi"] },
        { label: "Sungurlu D-200 Karadeniz Geçiş Terminali", district: "Çorum", stopName: "Sungurlu Otogar", keys: ["sungurlu", "sungurlu otogar", "d200"] },
        { label: "Osmancık D-100 Trans-Avrupa Otobüs Terminali", district: "Çorum", stopName: "Osmancık Otogar", keys: ["osmancik", "osmancik otogar", "d100"] },
        { label: "Boğazkale Hattuşa Hitit Antik Kenti Turizm İstasyonu", district: "Çorum", stopName: "Boğazkale Hattuşa", keys: ["bogazkale", "hattusa", "hitit"] },
                // 21 DİYARBAKIR (KADİM SURİÇİ & DİCLE NEHRİ)
                // 69 BAYBURT (ÇORUH NEHRİ & KOP DAĞI GEÇİDİ)
                // 23 ELAZIĞ (HARPUT KALESİ & HAZAR GÖLÜ)
                // 24 ERZİNCAN (GİRLEVİK ŞELALESİ & ERGAN DAĞI)
                // 42 KONYA (MEVLANA & SELÇUKLU BAŞKENTİ)
                // 77 YALOVA (YÜRÜYEN KÖŞK & OSMANGAZİ KÖPRÜSÜ)
        { label: "Yalova Şehirlerarası Otobüs Terminali (Merkez)", district: "Yalova", stopName: "Yalova Otogar", keys: ["yalova", "yalova otogar", "termal", "yuruyen kosk"] },
        { label: "İDO Yalova Hızlı Feribot İskelesi & Liman İstasyonu", district: "Yalova", stopName: "Yalova İDO İskele", keys: ["ido", "feribot", "yalova iskele", "deniz otobusu"] },
        { label: "Termal Atatürk Köşkü & Kaplıcalar Turizm Durağı", district: "Yalova", stopName: "Termal Kaplıcalar", keys: ["termal", "kaplica", "kaplicalar", "sicak su"] },
        { label: "Çınarcık Sahil & Yazlık Belde Otobüs Terminali", district: "Yalova", stopName: "Çınarcık Otogar", keys: ["cinarcik", "çınarcık", "tesvikiye", "erikli"] },
        { label: "Altınova Osmangazi Köprüsü Kuzey Marmara Çıkış Durağı", district: "Yalova", stopName: "Altınova Gişeler", keys: ["altinova", "altınova", "osmangazi", "osmangazi koprusu"] },
                                                                                // 29 GÜMÜŞHANE (YENİ ZİGANA TÜNELİ & PESTİL & KARACA MAĞARASI & HARŞİT)
        { label: "Gümüşhane Şehirlerarası Otobüs Terminali (Harşit Vadisi)", district: "Gümüşhane", stopName: "Gümüşhane Otogar", keys: ["gumushane", "gümüşhane", "gumushane otogar", "pestil", "kome"] },
        { label: "Yeni Zigana Tüneli Gümüşhane Giriş İstasyonu (14.5 km)", district: "Gümüşhane", stopName: "Yeni Zigana Tüneli İstasyonu", keys: ["zigana", "yeni zigana", "zigana tuneli", "torul", "macka"] },
        { label: "Torul Kalesi Cam Seyir Terası & Karaca Mağarası Kavşağı", district: "Gümüşhane", stopName: "Karaca Mağarası Meydanı", keys: ["karaca magarasi", "karaca mağarası", "torul kalesi", "cam teras"] },
        { label: "Kelkit Ovası & Satala Antik Kenti İstasyonu", district: "Gümüşhane", stopName: "Kelkit Otogar", keys: ["kelkit", "satala", "kose", "köse"] },
        { label: "Şiran Tomara Şelalesi Tabiat Parkı Girişi", district: "Gümüşhane", stopName: "Tomara Şelalesi Parkı", keys: ["siran", "şiran", "tomara", "tomara selalesi"] },
                // 28 GİRESUN (KALE & FINDIK & GİRESUN ADASI & KÜMBET YAYLASI)
        { label: "Giresun Şehirlerarası Otobüs Terminali (Giresun Otogar)", district: "Giresun", stopName: "Giresun Otogar", keys: ["giresun", "giresun otogar", "bulancak", "findik", "fındık"] },
        { label: "Tarihi Giresun Kalesi & Seyir Terası İstasyonu", district: "Giresun", stopName: "Giresun Kalesi Meydanı", keys: ["giresun kalesi", "kale", "kiraz", "topal osman"] },
        { label: "Giresun Adası (Aretias) Karşısı Sahil Parkı", district: "Giresun", stopName: "Giresun Sahil Parkı", keys: ["giresun adasi", "giresun adası", "aretias", "sahil"] },
        { label: "Tirebolu Kalesi & Harşit Çayı Çıkış İstasyonu", district: "Giresun", stopName: "Tirebolu Meydan", keys: ["tirebolu", "harsit", "harşit", "tirebolu 42", "espiye"] },
        { label: "Görele Kemençe & Pide Kültür Meydanı", district: "Giresun", stopName: "Görele Otogar", keys: ["gorele", "görele", "kemence", "kemençe", "eynesil"] },
                // 27 GAZİANTEP (ZEUGMA & ANTEP KALESİ & FISTIK & RUMKALE)
        { label: "Gaziantep Şehirlerarası Otobüs Terminali (Gaziulaş)", district: "Gaziantep", stopName: "Gaziantep Otogar", keys: ["gaziantep", "antep", "gaziantep otogar", "gaziulas", "sehitkamil"] },
        { label: "Zeugma Mozaik Müzesi & İpekyolu İstasyonu", district: "Gaziantep", stopName: "Zeugma Müzesi Meydanı", keys: ["zeugma", "cingene kizi", "çingene kızı", "mozaik", "ipekyolu"] },
        { label: "Tarihi Gaziantep Kalesi & Bakırcılar Çarşısı", district: "Gaziantep", stopName: "Tarihi Antep Kalesi", keys: ["antep kalesi", "gaziantep kalesi", "bakircilar", "tahmis", "almaci", "sahinbey"] },
        { label: "Nizip Fırat Nehri & Antik Zeugma Sahili İstasyonu", district: "Gaziantep", stopName: "Nizip Otogar", keys: ["nizip", "firat", "fırat", "birecik", "rumkale"] },
        { label: "Nurdağı TAG Otoyolu Geçiş İstasyonu", district: "Gaziantep", stopName: "Nurdağı Kavşağı", keys: ["nurdagi", "nurdağı", "tag otoyolu", "bahce", "islahiye"] },
                // 26 ESKİŞEHİR (PORSUK ÇAYI & ODUNPAZARI & SAZOVA)
        { label: "Eskişehir Şehirlerarası Otobüs Terminali (ESTRAM)", district: "Eskişehir", stopName: "Eskişehir Otogar", keys: ["eskisehir", "eskişehir", "eskisehir otogar", "porsuk"] },
        { label: "Odunpazarı Tarihi Evleri & Kurşunlu Külliyesi", district: "Eskişehir", stopName: "Odunpazarı Meydanı", keys: ["odunpazari", "odunpazarı", "kursunlu", "luletasi", "çibörek"] },
        { label: "Sazova Bilim Kültür ve Sanat Parkı (Masal Şatosu)", district: "Eskişehir", stopName: "Sazova Parkı", keys: ["sazova", "masal satosu", "masal şatosu", "bilim parki"] },
        { label: "Sivrihisar D-200 Kavşağı & Nasreddin Hoca İstasyonu", district: "Eskişehir", stopName: "Sivrihisar Otogar", keys: ["sivrihisar", "nasreddin hoca", "d200", "polatli"] },
        { label: "Seyitgazi Battal Gazi Külliyesi & Frig Yolu", district: "Eskişehir", stopName: "Seyitgazi Meydan", keys: ["seyitgazi", "battal gazi", "frig", "yazilikaya"] },
                // 25 ERZURUM (PALANDÖKEN & ÇİFTE MİNARELİ MEDRESE)
        { label: "Erzurum Şehirlerarası Otobüs Terminali (Merkez)", district: "Erzurum", stopName: "Erzurum Otogar", keys: ["erzurum", "erzurum otogar", "palandoken", "cag kebabi"] },
        { label: "Palandöken Kayak Merkezi & Kış Turizmi İstasyonu", district: "Erzurum", stopName: "Palandöken Oteller", keys: ["palandoken", "palandöken", "kayak", "ejder 3200"] },
        { label: "Çifte Minareli Medrese & Tarihi Kent Meydanı", district: "Erzurum", stopName: "Çifte Minareli Medrese", keys: ["cifte minareli", "çifte minareli", "yakutiye", "kale"] },
        { label: "Horasan D-100 Doğu Anadolu Transit Otogarı", district: "Erzurum", stopName: "Horasan Otogar", keys: ["horasan", "horasan otogar", "d100", "pasinler"] },
        { label: "İspir Ovit Tüneli Kuzey Karadeniz Geçiş İstasyonu", district: "Erzurum", stopName: "İspir Ovit Durağı", keys: ["ispir", "ovit", "ovit tuneli", "ovit tüneli"] },
        { label: "Konya Büyükşehir Şehirlerarası Otobüs Terminali (Merkez)", district: "Konya", stopName: "Konya Otogar", keys: ["konya", "konya otogar", "mevlana", "alaeddin"] },
        { label: "Mevlana Müzesi & Türbesi Tarihi Turizm Durağı", district: "Konya", stopName: "Mevlana Durağı", keys: ["mevlana", "mevlana turbesi", "rumi"] },
        { label: "Akşehir D-300 Nasreddin Hoca Otobüs Terminali", district: "Konya", stopName: "Akşehir Otogar", keys: ["aksehir", "akşehir", "nasreddin hoca"] },
        { label: "Beyşehir Gölü Sahil & Milli Park Turizm Durağı", district: "Konya", stopName: "Beyşehir Otogar", keys: ["beysehir", "beyşehir", "esrefoglu"] },
        { label: "Seydişehir Alacabel Geçidi Mola Tesisleri", district: "Konya", stopName: "Seydişehir Tesisleri", keys: ["seydisehir", "seydişehir", "alacabel"] },
        { label: "Erzincan Şehirlerarası Otobüs Terminali (Merkez)", district: "Erzincan", stopName: "Erzincan Otogar", keys: ["erzincan", "erzincan otogar", "fırat", "tulum peyniri"] },
        { label: "Ergan Dağı Kış Turizmi & Kayak Merkezi Girişi", district: "Erzincan", stopName: "Ergan Kayak Tesisleri", keys: ["ergan", "ergan dagi", "kayak", "munzur"] },
        { label: "Refahiye D-100 Trans-Avrupa Dinlenme & Otogar Tesisleri", district: "Erzincan", stopName: "Refahiye Otogar", keys: ["refahiye", "refahiye otogar", "kizildag", "d100"] },
        { label: "Kemaliye (Eğin) Karanlık Kanyon Turizm Durağı", district: "Erzincan", stopName: "Kemaliye Otogar", keys: ["kemaliye", "epin", "karanlik kanyon", "tas yolu"] },
        { label: "Elazığ Şehirlerarası Otobüs Terminali (Merkez)", district: "Elazığ", stopName: "Elazığ Otogar", keys: ["elazig", "elazığ", "elazig otogar", "harput", "cayda cira"] },
        { label: "Harput Tarihi Kale & Antik Kent Turizm Durağı", district: "Elazığ", stopName: "Harput Kale Durağı", keys: ["harput", "harput kale", "antik kent"] },
        { label: "Sivrice Hazar Gölü Sahil Yolu & Kayak Tesisleri", district: "Elazığ", stopName: "Hazar Gölü Tesisleri", keys: ["sivrice", "hazar golu", "hazarbaba"] },
        { label: "Kovancılar D-300 Doğu Anadolu Otobüs Terminali", district: "Elazığ", stopName: "Kovancılar Otogar", keys: ["kovancilar", "kovancilar otogar", "d300"] },
        { label: "Bayburt Şehirlerarası Otobüs Terminali (Merkez)", district: "Bayburt", stopName: "Bayburt Otogar", keys: ["bayburt", "bayburt otogar", "coruh", "kale"] },
        { label: "Kop Dağı Zirvesi & Şehirlerarası Mola Tesisleri", district: "Bayburt", stopName: "Kop Dağı Tesisleri", keys: ["kop dagi", "kop gecidi", "kop tuneli"] },
        { label: "Baksı Çağdaş Sanat Müzesi Turizm Durağı", district: "Bayburt", stopName: "Baksı Müzesi", keys: ["baksi", "baksi muzesi", "bayraktar"] },
        { label: "Demirözü Barajı & İlçe Terminali", district: "Bayburt", stopName: "Demirözü Otogar", keys: ["demirozu", "demirozu otogar"] },
        { label: "Diyarbakır Şehirlerarası Otobüs Terminali (DİŞTİ - Merkez)", district: "Diyarbakır", stopName: "Diyarbakır DİŞTİ Otogar", keys: ["diyarbakir", "diyarbakir otogar", "disti", "dicle", "surici"] },
        { label: "Ergani D-885 Elazığ Yolu Otobüs Terminali", district: "Diyarbakır", stopName: "Ergani Otogar", keys: ["ergani", "ergani otogar", "d885", "maden"] },
        { label: "Silvan Tarihi Malabadi Köprüsü & Otobüs Durağı", district: "Diyarbakır", stopName: "Silvan Malabadi", keys: ["silvan", "silvan otogar", "malabadi"] },
        { label: "Bismil Batman Yolu Şehirlerarası Terminali", district: "Diyarbakır", stopName: "Bismil Otogar", keys: ["bismil", "bismil otogar", "d370"] },
        { label: "Denizli Büyükşehir Otobüs Terminali (Merkez)", district: "Denizli", stopName: "Denizli Otogar", keys: ["denizli", "denizli otogar", "denizli merkez"] },
        { label: "Pamukkale Travertenleri & Hierapolis Antik Kenti", district: "Denizli", stopName: "Pamukkale Hierapolis", keys: ["pamukkale", "hierapolis", "traverten", "deliklicinar"] },
        // 07 ANTALYA (AKDENİZ & TURİZM BAŞKENTİ)
        { label: "Antalya Şehirlerarası Otobüs Terminali (Kepez)", district: "Antalya", stopName: "Antalya Otogar", keys: ["antalya", "antalya otogar", "kepez", "antalya merkez"] },
        { label: "Antalya Kaleiçi & Cumhuriyet Meydanı", district: "Antalya", stopName: "Antalya Kaleiçi", keys: ["kaleici", "saat kulesi", "konyaalti", "lara", "duden"] },
        // 06 ANKARA (BAŞKENT & İÇ ANADOLU MERKEZİ)
        { label: "AŞTİ - Ankara Şehirlerarası Otobüs Terminali (Merkez)", district: "Ankara", stopName: "Ankara AŞTİ", keys: ["ankara", "asti", "ankara otogar", "baskent"] },
        { label: "Ankara Kızılay Meydanı & Anıtkabir", district: "Ankara", stopName: "Ankara Kızılay", keys: ["kizilay", "anitkabir", "ulus", "tbmm", "cankaya"] },
        // 05 AMASYA (ORTA KARADENİZ & ŞEHZADELER ŞEHRİ)
        { label: "AŞOT - Amasya Şehirlerarası Otobüs Terminali (Merkez)", district: "Amasya", stopName: "Amasya AŞOT", keys: ["amasya", "amasya otogar", "asot", "amasya merkez"] },
        { label: "Amasya Tarihi Yalıboyu & Kral Kaya Mezarları", district: "Amasya", stopName: "Amasya Yalıboyu", keys: ["kral kaya", "yaliboyu", "hazeranlar", "yesilirmak", "merzifon", "suluova"] },
        // 04 AĞRI (DOĞU ANADOLU & AĞRI DAĞI)
        { label: "Ağrı Şehirlerarası Otobüs Terminali (Merkez)", district: "Ağrı", stopName: "Ağrı Otogar", keys: ["agri", "agri otogar", "agri merkez"] },
        { label: "Doğubayazıt Otogarı & İshak Paşa Sarayı", district: "Ağrı", stopName: "Doğubayazıt İshak Paşa", keys: ["dogubayazit", "ishak pasa", "ishakpasa", "agri dagi", "gurbulak", "patnos"] },
        // 03 AFYONKARAHİSAR (EGE / KAVŞAK & ZAFER)
        { label: "AFTAŞ - Afyon Şehirlerarası Otobüs Terminali (Kavşak)", district: "Afyonkarahisar", stopName: "Afyon AFTAŞ", keys: ["afyon", "afyonkarahisar", "aftas", "afyon otogar", "kavsak"] },
        { label: "Afyon Tarihi Zafer Meydanı & Kocatepe", district: "Afyonkarahisar", stopName: "Afyon Zafer", keys: ["zafer meydani", "kocatepe", "afyon kale", "gazligol", "ikbal"] },
        // 02 ADIYAMAN (GÜNEYDOĞU ANADOLU & NEMRUT)
        { label: "Adıyaman Şehirlerarası Otobüs Terminali (Merkez)", district: "Adıyaman", stopName: "Adıyaman Otogar", keys: ["adiyaman", "adiyaman otogar", "nemrut", "kahta", "golbasi", "besni"] },
        { label: "Nemrut Dağı Zirvesi & Kommagene Milli Parkı", district: "Adıyaman", stopName: "Nemrut Karadut", keys: ["nemrut", "kommagene", "karadut", "cendere"] },
                // 01 ADANA 15 İLÇE HUB VE AKILLI ROTA NOKTALARI
        { label: "Adana Seyhan İlçe Otogarı (Merkez)", district: "Adana", stopName: "Seyhan Merkez", keys: ["seyhan", "seyhan otogar", "adana merkez"] },
        { label: "Adana Yüreğir Otogarı & İpekyolu Bulvarı", district: "Adana", stopName: "Yüreğir Otogar", keys: ["yuregir", "yuregir otogar", "ipekyolu"] },
        { label: "Adana Çukurova Barajyolu & Turgut Özal Bulvarı", district: "Adana", stopName: "Çukurova Barajyolu", keys: ["cukurova", "barajyolu", "turgut ozal"] },
        { label: "Adana Sarıçam Balcalı & Çukurova Üniversitesi", district: "Adana", stopName: "Sarıçam Kampüs", keys: ["saricam", "balcali", "yeni stadyum"] },
        { label: "Adana Karaisalı İlçe Meydanı & Varda Köprüsü", district: "Adana", stopName: "Karaisalı Varda", keys: ["karaisali", "varda", "varda koprusu", "kapikaya"] },
        { label: "Adana Ceyhan İlçe Otogarı & BOTAŞ Liman Yolu", district: "Adana", stopName: "Ceyhan Otogar", keys: ["ceyhan", "ceyhan otogar", "botas"] },
        { label: "Adana Karataş Limanı & Akdeniz Sahil Parkı", district: "Adana", stopName: "Karataş Sahil", keys: ["karatas", "karatas liman", "karatas sahil"] },
        { label: "Adana Yumurtalık Ayas Kalesi & Sahil Kordonu", district: "Adana", stopName: "Yumurtalık Ayas", keys: ["yumurtalik", "ayas", "ayas kalesi"] },
        { label: "Adana İmamoğlu İlçe Terminali & Çarşı", district: "Adana", stopName: "İmamoğlu Terminal", keys: ["imamoglu", "imamoglu otogar"] },
        { label: "Adana Kozan Kalesi Meydanı & Anavarza Kapısı", district: "Adana", stopName: "Kozan Kale", keys: ["kozan", "kozan otogar", "kozan kalesi", "anavarza"] },
        { label: "Adana Aladağ Kapuzbaşı Yaylası & Meydan", district: "Adana", stopName: "Aladağ Yayla", keys: ["aladag", "kapuzbasi"] },
        { label: "Adana Pozantı İlçe Otogarı & Toroslar Geçişi", district: "Adana", stopName: "Pozantı Otogar", keys: ["pozanti", "gulek", "akcatekir", "belemedik"] },
        { label: "Adana Feke Kalesi & Göksu Vadisi", district: "Adana", stopName: "Feke Kale", keys: ["feke", "feke kalesi", "goksu"] },
        { label: "Adana Saimbeyli İlçe Meydanı & Kiraz Vadisi", district: "Adana", stopName: "Saimbeyli Meydan", keys: ["saimbeyli", "saimbeyli kiraz"] },
        { label: "Adana Tufanbeyli Meydanı & Şar Antik Kenti", district: "Adana", stopName: "Tufanbeyli Şar", keys: ["tufanbeyli", "sar antik", "hitit comana"] },
        // 01 ADANA (ÇUKUROVA & AKDENİZ)
        { label: "Adana Büyükşehir Otobüs Terminali (Seyhan / Merkez)", district: "Adana", stopName: "Adana Otogar", keys: ["adana", "adana otogar", "cukurova", "seyhan"] },
        { label: "Adana Taşköprü & Sabancı Merkez Camii", district: "Adana", stopName: "Adana Taşköprü", keys: ["taskopru", "sabanci camii", "adana merkez"] },
        // 30 HAKKÂRİ (DOĞU ANADOLU & CİLO DAĞLARI)
        { label: "Hakkâri Şehirlerarası Otobüs Terminali (Merkez)", district: "Hakkâri", stopName: "Hakkâri Otogar", keys: ["hakkari", "hakkâri", "hakkari otogar", "zap", "sumbul", "cilo"] },
        { label: "Yüksekova Selahaddin Eyyubi Terminali & Havalimanı", district: "Hakkâri", stopName: "Yüksekova Otogar", keys: ["yuksekova", "yüksekova", "esendere", "ipekyolu"] },
        { label: "Şemdinli Tarihi Taş Köprü & İlçe Terminali", district: "Hakkâri", stopName: "Şemdinli Otogar", keys: ["semdinli", "şemdinli", "derecik", "kayme"] },

        // 31 HATAY (AKDENİZ & ANTAKYA MEDENİYETLERİ)
        { label: "Antakya Şehirlerarası Otobüs Terminali (HATŞOT)", district: "Hatay", stopName: "Antakya Otogar", keys: ["hatay", "antakya", "hatsot", "harbiye", "asi nehri", "habib-i neccar"] },
        { label: "İskenderun Şehirlerarası Terminali & Liman İstasyonu", district: "Hatay", stopName: "İskenderun Otogar", keys: ["iskenderun", "iskenderun otogar", "liman", "arsuz", "belen"] },
        { label: "Kırıkhan D-825 Kavşağı & Çarşı Terminali", district: "Hatay", stopName: "Kırıkhan Otogar", keys: ["kirikhan", "kırıkhan", "hassa", "reyhanli"] },

        // 32 ISPARTA (GÖLLER YÖRESİ & GÜL DİYARI)
        { label: "Isparta Şehirlerarası Otobüs Terminali (IYOT)", district: "Isparta", stopName: "Isparta Otogar", keys: ["isparta", "isparta otogar", "iyot", "gul", "lavanta", "davraz"] },
        { label: "Eğirdir Gölü Sahil Otogarı & Kale İstasyonu", district: "Isparta", stopName: "Eğirdir Otogar", keys: ["egirdir", "eğirdir", "egirdir golu", "yesilada", "canada"] },
        { label: "Yalvaç Pisidia Antiokheia Antik Kenti Terminali", district: "Isparta", stopName: "Yalvaç Otogar", keys: ["yalvac", "yalvaç", "pisidia", "cinaralti"] },

        // 33 MERSİN (DOĞU AKDENİZ LİMANI & ÇUKUROVA)
        { label: "MEŞOT - Mersin Şehirlerarası Otobüs Terminali (Toroslar)", district: "Mersin", stopName: "Mersin MEŞOT", keys: ["mersin", "mesot", "meşot", "mersin otogar", "tantuni", "akdeniz"] },
        { label: "Tarsus Şehirlerarası Otobüs Terminali (Tarihi Merkez)", district: "Mersin", stopName: "Tarsus Otogar", keys: ["tarsus", "tarsus otogar", "eshab-i kehf", "kleopatra", "selale"] },
        { label: "Silifke Şehirlerarası Terminali & Taşucu Feribot Limanı", district: "Mersin", stopName: "Silifke Taşucu Otogar", keys: ["silifke", "tasucu", "taşucu", "kizkalesi", "feribot"] },

        // 35 İZMİR (EGE'NİN İNCİSİ & METROPOL)
        { label: "İZOTAŞ - İzmir Şehirlerarası Otobüs Terminali (Bornova)", district: "İzmir", stopName: "İzmir İZOTAŞ", keys: ["izmir", "izotas", "izotaş", "izmir otogar", "bornova", "otogar"] },
        { label: "İzmir Konak Meydanı & Tarihi Saat Kulesi", district: "İzmir", stopName: "İzmir Konak Meydanı", keys: ["konak", "saat kulesi", "kordon", "alsancak", "kemeralti"] },
        { label: "Çeşme Şehirlerarası Otobüs Terminali & Alaçatı", district: "İzmir", stopName: "Çeşme Otogar", keys: ["cesme", "çeşme", "alacati", "alaçatı", "ilica"] },
        { label: "Selçuk Efes Antik Kenti & Meryem Ana İstasyonu", district: "İzmir", stopName: "Selçuk Efes Terminal", keys: ["selcuk", "selçuk", "efes", "sirince", "meryem ana"] },

        // 36 KARS (DOĞU EKSPRESİ & ANİ HARABELERİ)
        { label: "Kars Şehirlerarası Otobüs Terminali (Merkez)", district: "Kars", stopName: "Kars Otogar", keys: ["kars", "kars otogar", "ani", "dogu ekspresi", "gravyer", "kalesi"] },
        { label: "Sarıkamış Kayak Merkezi & Kış Turizmi İstasyonu", district: "Kars", stopName: "Sarıkamış Otogar", keys: ["sarikamis", "sarıkamış", "kayak", "cibiltepe", "sehitlik"] },
        { label: "Ani Harabeleri & Arpaçay Turizm Durağı", district: "Kars", stopName: "Ani Harabeleri İstasyonu", keys: ["ani", "ani harabeleri", "arpacay", "arpaçay", "cildir"] },

        // 37 KASTAMONU (BATI KARADENİZ & ILGAZ DAĞLARI)
        { label: "Kastamonu Şehirlerarası Otobüs Terminali (KASTAŞ)", district: "Kastamonu", stopName: "Kastamonu KASTAŞ", keys: ["kastamonu", "kastas", "kastaş", "kastamonu otogar", "nasrullah", "ilgaz"] },
        { label: "Tosya D-100 Trans-Avrupa Otobüs Terminali", district: "Kastamonu", stopName: "Tosya Otogar", keys: ["tosya", "tosya otogar", "d100", "pirinc"] },
        { label: "İnebolu Tarihi İstiklal Limanı Terminali", district: "Kastamonu", stopName: "İnebolu Otogar", keys: ["inebolu", "istiklal yolu", "denk kayigi", "liman"] },
        { label: "Taşköprü Sarımsak Diyarı İlçe Terminali", district: "Kastamonu", stopName: "Taşköprü Otogar", keys: ["taskopru", "taşköprü", "sarimsak", "pompeiopolis"] },

        // 38 KAYSERİ (ERCİYES DAĞI & İPEKYOLU TİCARETİ)
        { label: "Kayseri Büyükşehir Şehirlerarası Terminali (KAYSO)", district: "Kayseri", stopName: "Kayseri Otogar", keys: ["kayseri", "kayso", "kayseri otogar", "pastirma", "manti", "hunat"] },
        { label: "Erciyes Dağı Tekir Yaylası & Kayak Merkezi İstasyonu", district: "Kayseri", stopName: "Erciyes Kayak Tesisleri", keys: ["erciyes", "erciyes dagi", "tekir yaylasi", "kayak", "hacilar"] },
        { label: "Talas Tarihi Taş Konaklar & Ali Dağı Meydanı", district: "Kayseri", stopName: "Talas Meydan", keys: ["talas", "ali dagi", "yamac parasutu", "tas konaklar"] },
        { label: "Develi İlçe Otobüs Terminali & Erciyes Güneyi", district: "Kayseri", stopName: "Develi Otogar", keys: ["develi", "develi otogar", "civikli", "yahyali"] },

        // 40 KIRŞEHİR (AHİLİK & NEŞET ERTAŞ OZANLAR DİYARI)
        { label: "Kırşehir Şehirlerarası Otobüs Terminali (Ahi Evran)", district: "Kırşehir", stopName: "Kırşehir Otogar", keys: ["kirsehir", "kırşehir", "kirsehir otogar", "ahi evran", "neset ertas", "cacabey"] },
        { label: "Kaman İlçe Otobüs Terminali & Ceviz Diyarı", district: "Kırşehir", stopName: "Kaman Otogar", keys: ["kaman", "kaman otogar", "ceviz", "kalehoyuk", "hirfanli"] },
        { label: "Mucur Seyfe Gölü Kuş Cenneti Kavşak İstasyonu", district: "Kırşehir", stopName: "Mucur Otogar", keys: ["mucur", "seyfe golu", "flamingolar", "hacibektas"] },
        // 41 KOCAELİ (İZMİT KÖRFEZİ & SANAYİ METROPOLÜ)
        { label: "Kocaeli Şehirlerarası Otobüs Terminali (İzmit Otogar)", district: "Kocaeli", stopName: "İzmit Otogar", keys: ["kocaeli", "izmit", "izmit otogar", "kocaeli otogar", "sekapark", "pismaniye"] },
        { label: "Gebze Şehirlerarası Otobüs Terminali & Marmaray", district: "Kocaeli", stopName: "Gebze Otogar", keys: ["gebze", "gebze otogar", "marmaray", "darica", "cayirova"] },
        { label: "Karamürsel Sahil & İskele Otobüs Terminali", district: "Kocaeli", stopName: "Karamürsel Otogar", keys: ["karamursel", "karamürsel", "golcuk", "gölcük", "degirmendere"] },

        // 43 KÜTAHYA (ÇİNİ BAŞKENTİ & ZAFER DİYARI)
        { label: "Kütahya Şehirlerarası Otobüs Terminali (KÜTAŞ)", district: "Kütahya", stopName: "Kütahya KÜTAŞ", keys: ["kutahya", "kütahya", "kutas", "kütaş", "cini", "çini"] },
        { label: "Tavşanlı Şehirlerarası Otobüs Terminali (Merkez)", district: "Kütahya", stopName: "Tavşanlı Otogar", keys: ["tavsanli", "tavşanlı", "leblebi", "tunckelek"] },
        { label: "Simav Eynal Kaplıcaları & İlçe Terminali", district: "Kütahya", stopName: "Simav Otogar", keys: ["simav", "eynal", "kaplica", "termal", "gediz"] },

        // 44 MALATYA (KAYISI DİYARI & BATTALGAZİ)
        { label: "MAŞTİ - Malatya Şehirlerarası Otobüs Terminali", district: "Malatya", stopName: "Malatya MAŞTİ", keys: ["malatya", "masti", "maşti", "malatya otogar", "kayisi", "yesilyurt"] },
        { label: "Darende Somuncu Baba Külliyesi & Tohma Kanyonu", district: "Malatya", stopName: "Darende Somuncu Baba", keys: ["darende", "somuncu baba", "tohma", "kanyon", "kudret havuzu"] },
        { label: "Battalgazi Tarihi Kervansaray & Ulu Cami Meydanı", district: "Malatya", stopName: "Battalgazi Meydan", keys: ["battalgazi", "kervansaray", "arslantepe", "kale"] },

        // 45 MANİSA (ŞEHZADELER ŞEHRİ & SPİL DAĞI)
        { label: "Manisa Şehirlerarası Otobüs Terminali (Şehzadeler)", district: "Manisa", stopName: "Manisa Otogar", keys: ["manisa", "manisa otogar", "sehzadeler", "mesir", "spil"] },
        { label: "Akhisar D-565 İstanbul-İzmir Transit Terminali", district: "Manisa", stopName: "Akhisar Otogar", keys: ["akhisar", "akhisar otogar", "d565", "zeytin"] },
        { label: "Salihli Sart Antik Kenti & İlçe Terminali", district: "Manisa", stopName: "Salihli Otogar", keys: ["salihli", "sart", "sardes", "artemis", "kursunlu kaplicasi"] },
        { label: "Turgutlu D-300 Otoyol Çıkış Terminali", district: "Manisa", stopName: "Turgutlu Otogar", keys: ["turgutlu", "kasaba", "d300", "e96"] },

        // 46 KAHRAMANMARAŞ (DÖVME DONDURMA & İSTİKLAL KENTİ)
        { label: "Kahramanmaraş Şehirlerarası Terminali (Merkez)", district: "Kahramanmaraş", stopName: "Kahramanmaraş Otogar", keys: ["kahramanmaras", "kahramanmaraş", "maras", "maraş", "maras otogar", "dondurma"] },
        { label: "Elbistan Şehirlerarası Otobüs Terminali (Merkez)", district: "Kahramanmaraş", stopName: "Elbistan Otogar", keys: ["elbistan", "elbistan otogar", "ceyhan", "pinarbasi"] },
        { label: "Afşin Eshab-ı Kehf Külliyesi Turizm Durağı", district: "Kahramanmaraş", stopName: "Afşin Eshab-ı Kehf", keys: ["afsin", "afşin", "eshab-i kehf", "yedi uyurlar"] },

        // 47 MARDİN (TAŞ KONAKLAR & DARA ANTİK KENTİ)
        { label: "Mardin Şehirlerarası Otobüs Terminali (Artuklu)", district: "Mardin", stopName: "Mardin Otogar", keys: ["mardin", "mardin otogar", "artuklu", "deyrulzafaran", "kasimiye"] },
        { label: "Midyat Tarihi Taş Konaklar & İlçe Terminali", district: "Mardin", stopName: "Midyat Otogar", keys: ["midyat", "midyat otogar", "telkari", "sila konagi", "mor gabriel"] },
        { label: "Kızıltepe İpekyolu Şehirlerarası Terminali", district: "Mardin", stopName: "Kızıltepe Otogar", keys: ["kiziltepe", "kızıltepe", "ipekyolu", "d400"] },

        // 48 MUĞLA (EGE & AKDENİZ MAVİ TUR BAŞKENTİ)
        { label: "Muğla Şehirlerarası Otobüs Terminali (Menteşe)", district: "Muğla", stopName: "Muğla Otogar", keys: ["mugla", "muğla", "mugla otogar", "mentese", "akyaka"] },
        { label: "Bodrum Şehirlerarası Otobüs Terminali (Torba)", district: "Muğla", stopName: "Bodrum Otogar", keys: ["bodrum", "bodrum otogar", "torba", "halikarnas", "turgutreis"] },
        { label: "Fethiye Şehirlerarası Terminali & Ölüdeniz Lagünü", district: "Muğla", stopName: "Fethiye Otogar", keys: ["fethiye", "fethiye otogar", "oludeniz", "ölüdeniz", "babadag", "saklikent"] },
        { label: "Marmaris Şehirlerarası Otobüs Terminali & Kordon", district: "Muğla", stopName: "Marmaris Otogar", keys: ["marmaris", "marmaris otogar", "icmeler", "dalyan", "datca"] },

        // 49 MUŞ (1071 MALAZGİRT ZAFERİ & MURAT KÖPRÜSÜ)
        { label: "Muş Şehirlerarası Otobüs Terminali (Merkez)", district: "Muş", stopName: "Muş Otogar", keys: ["mus", "muş", "mus otogar", "murat koprusu", "lale"] },
        { label: "Malazgirt 1071 Zafer Meydanı & İlçe Terminali", district: "Muş", stopName: "Malazgirt Otogar", keys: ["malazgirt", "malazgirt zafer", "alparslan", "milli park"] },
        { label: "Bulanık D-280 Karayolu İlçe Terminali", district: "Muş", stopName: "Bulanık Otogar", keys: ["bulanik", "b观点", "bulanık", "varto"] },

        // 50 NEVŞEHİR (KAPADOKYA & PERİ BACALARI & GÖREME)
        { label: "Nevşehir Şehirlerarası Otobüs Terminali (Merkez)", district: "Nevşehir", stopName: "Nevşehir Otogar", keys: ["nevsehir", "nevşehir", "nevsehir otogar", "kapadokya", "cappadocia"] },
        { label: "Göreme Balon Kalkış Vadisi & Turizm İstasyonu", district: "Nevşehir", stopName: "Göreme Açık Hava Meydanı", keys: ["goreme", "göreme", "balon", "peri bacasi", "peri bacalari", "uchisar"] },
        { label: "Ürgüp Üç Güzeller & Asmalı Konak Terminali", district: "Nevşehir", stopName: "Ürgüp Otogar", keys: ["urgup", "ürgüp", "uc guzeller", "üç güzeller", "asmali konak"] },
        { label: "Avanos Kızılırmak Sahili & Çömlekçiler İstasyonu", district: "Nevşehir", stopName: "Avanos Meydan", keys: ["avanos", "comlek", "çömlek", "kizilirmak"] },
        // 51 NİĞDE (ALADAĞLAR & DEMİRKAZIK & TYANA)
        { label: "Niğde Şehirlerarası Otobüs Terminali (NİĞTAŞ)", district: "Niğde", stopName: "Niğde NİĞTAŞ", keys: ["nigde", "niğde", "nigtas", "niğtaş", "nigde otogar", "aladaglar", "tyana"] },
        { label: "Bor Tarihi Çarşı & İlçe Otobüs Terminali", district: "Niğde", stopName: "Bor Otogar", keys: ["bor", "bor otogar", "derbent"] },
        { label: "Ulukışla D-750 Toroslar Kavşak Terminali", district: "Niğde", stopName: "Ulukışla Otogar", keys: ["ulukisla", "ulukışla", "ciftehan", "kaplica", "d750"] },

        // 52 ORDU (BOZTEPE TELEFERİK & FINDIK SAHİLİ)
        { label: "Ordu Büyükşehir Otobüs Terminali (Altınordu)", district: "Ordu", stopName: "Ordu Otogar", keys: ["ordu", "ordu otogar", "altinordu", "boztepe", "teleferik", "findik"] },
        { label: "Ünye Şehirlerarası Otobüs Terminali & Çakırtepe", district: "Ordu", stopName: "Ünye Otogar", keys: ["unye", "ünye", "unye otogar", "cakirtepe", "kale"] },
        { label: "Fatsa Sahil Yolu Şehirlerarası Otobüs Terminali", district: "Ordu", stopName: "Fatsa Otogar", keys: ["fatsa", "fatsa otogar", "sahil", "caga"] },

        // 53 RİZE (ÇAYIN BAŞKENTİ & FIRTINA VADİSİ & KAÇKARLAR)
        { label: "Rize Şehirlerarası Otobüs Terminali (Merkez)", district: "Rize", stopName: "Rize Otogar", keys: ["rize", "rize otogar", "cay", "çay", "kalesi", "simit"] },
        { label: "Ardeşen Fırtına Vadisi Şehirlerarası Terminali", district: "Rize", stopName: "Ardeşen Otogar", keys: ["ardesen", "ardeşen", "firtina vadisi", "firtina deresi"] },
        { label: "Çamlıhemşin Ayder Yaylası Turizm İstasyonu", district: "Rize", stopName: "Ayder Yaylası Terminal", keys: ["camlihemsin", "çamlıhemşin", "ayder", "ayder yaylasi", "zilkale", "pokut"] },

        // 54 SAKARYA (SAPANCA GÖLÜ & ACARLAR LONGOZU)
        { label: "Sakarya Büyükşehir Otobüs Terminali (Arifiye)", district: "Sakarya", stopName: "Sakarya Otogar", keys: ["sakarya", "adapazari", "adapazarı", "sakarya otogar", "arifiye", "islama kofte"] },
        { label: "Sapanca Gölü Sahil & İlçe Otobüs Terminali", district: "Sakarya", stopName: "Sapanca Otogar", keys: ["sapanca", "sapanca golu", "kirkpinar", "sahil"] },
        { label: "Karasu Karadeniz Sahil Otogarı & Acarlar Longozu", district: "Sakarya", stopName: "Karasu Otogar", keys: ["karasu", "acarlar", "longoz", "karadeniz sahili"] },

        // 55 SAMSUN (İLK ADIM & BANDIRMA VAPURU)
        { label: "SAMAŞTİ - Samsun Şehirlerarası Terminali (İlkadım)", district: "Samsun", stopName: "Samsun SAMAŞTİ", keys: ["samsun", "samasti", "samaşti", "samsun otogar", "ilkadim", "bandirma vapuru"] },
        { label: "Bafra Şehirlerarası Otobüs Terminali (Kızılırmak)", district: "Samsun", stopName: "Bafra Otogar", keys: ["bafra", "bafra otogar", "kizilirmak", "bafra pidesi"] },
        { label: "Çarşamba Yeşilırmak Sahili Şehirlerarası Terminali", district: "Samsun", stopName: "Çarşamba Otogar", keys: ["carsamba", "çarşamba", "carsamba otogar", "yesilirmak"] },

        // 56 SİİRT (BOTAN KANYONU & TİLLO)
        { label: "Siirt Şehirlerarası Otobüs Terminali (Merkez)", district: "Siirt", stopName: "Siirt Otogar", keys: ["siirt", "siirt otogar", "buryan", "fistik", "botan"] },
        { label: "Tillo İlim & Işık Hadisesi Türbe Terminali", district: "Siirt", stopName: "Tillo Otogar", keys: ["tillo", "aydinlar", "isik hadisesi", "ibrahim hakki"] },
        { label: "Baykan Veysel Karani Turizm İstasyonu", district: "Siirt", stopName: "Veysel Karani Terminal", keys: ["baykan", "veysel karani", "ziyaret"] },

        // 58 SİVAS (SELÇUKLU PAYİTAHTI & DİVRİĞİ ULU CAMİİ)
        { label: "Sivas Şehirlerarası Otobüs Terminali (MEYDAN)", district: "Sivas", stopName: "Sivas Otogar", keys: ["sivas", "sivas otogar", "cifte minare", "gok medrese", "kangal", "kofte"] },
        { label: "Divriği UNESCO Ulu Camii & Darüşşifası Terminali", district: "Sivas", stopName: "Divriği Otogar", keys: ["divrigi", "divriği", "divrigi ulu camii", "unesco", "demirdag"] },
        { label: "Şarkışla Aşık Veysel Kültür Otobüs Terminali", district: "Sivas", stopName: "Şarkışla Otogar", keys: ["sarkisla", "şarkışla", "asik veysel", "aşık veysel"] },
        { label: "Gürün Gökpınar Gölü Turkuaz Turizm Durağı", district: "Sivas", stopName: "Gürün Otogar", keys: ["gurun", "gürün", "gokpinar", "gökpınar golu"] },

        // 60 TOKAT (BALLICA MAĞARASI & YEŞİLIRMAK HAVZASI)
        { label: "Tokat Şehirlerarası Otobüs Terminali (Merkez)", district: "Tokat", stopName: "Tokat Otogar", keys: ["tokat", "tokat otogar", "ballica", "tashan", "tokat kebabi"] },
        { label: "Erbaa D-100 Şehirlerarası Terminali (Yaprak Diyarı)", district: "Tokat", stopName: "Erbaa Otogar", keys: ["erbaa", "erbaa otogar", "asma yapragi", "kelkit vadisi"] },
        { label: "Niksar Tarihi Danişmend Başkenti Terminali", district: "Tokat", stopName: "Niksar Otogar", keys: ["niksar", "niksar otogar", "niksar kalesi", "danismend"] },
        // 61 TRABZON (SÜMELA MANASTIRI & UZUNGÖL & ZİGANA)
        { label: "Trabzon Şehirlerarası Otobüs Terminali (Ortahisar)", district: "Trabzon", stopName: "Trabzon Otogar", keys: ["trabzon", "trabzon otogar", "ortahisar", "sumela", "uzungol", "boztepe"] },
        { label: "Akçaabat Sahil Şehirlerarası Otobüs Terminali", district: "Trabzon", stopName: "Akçaabat Otogar", keys: ["akcaabat", "akçaabat", "kofte", "akcaabat kofte", "sahil"] },
        { label: "Of D-010 Karadeniz Sahil Otobüs Terminali", district: "Trabzon", stopName: "Of Otogar", keys: ["of", "of otogar", "solakli", "sahil yolu"] },
        { label: "Maçka Sümela Manastırı Doğa Turizm İstasyonu", district: "Trabzon", stopName: "Maçka Sümela Terminal", keys: ["macka", "maçka", "sumela", "sümela", "zigana", "hamsikoy"] },

        // 62 TUNCELİ (MUNZUR GÖZELERİ & PERTEK KALESİ)
        { label: "Tunceli Şehirlerarası Otobüs Terminali (Merkez)", district: "Tunceli", stopName: "Tunceli Otogar", keys: ["tunceli", "tunceli otogar", "munzur", "dersim", "pulumur"] },
        { label: "Ovacık Munzur Gözeleri Doğa Turizm Durağı", district: "Tunceli", stopName: "Ovacık Munzur Terminal", keys: ["ovacik", "ovacık", "munzur gozeleri", "gozeler"] },
        { label: "Pertek Keban Feribot İskelesi & İlçe Terminali", district: "Tunceli", stopName: "Pertek Feribot Terminal", keys: ["pertek", "pertek kalesi", "feribot", "keban"] },

        // 63 ŞANLIURFA (GÖBEKLİTEPE & BALIKLIGÖL & HARRAN)
        { label: "Şanlıurfa Şehirlerarası Otobüs Terminali (Karaköprü)", district: "Şanlıurfa", stopName: "Şanlıurfa Otogar", keys: ["sanliurfa", "şanlıurfa", "urfa", "urfa otogar", "balikligol", "gobeklitepe"] },
        { label: "Siverek D-360 Şehirlerarası Otobüs Terminali", district: "Şanlıurfa", stopName: "Siverek Otogar", keys: ["siverek", "siverek otogar", "karacadag", "d360"] },
        { label: "Birecik Fırat Köprüsü Şehirlerarası Terminali", district: "Şanlıurfa", stopName: "Birecik Otogar", keys: ["birecik", "birecik otogar", "kelaynak", "firat", "fırat koprusu"] },
        { label: "Harran Tarihi Kümbet Evler & Üniversite Durağı", district: "Şanlıurfa", stopName: "Harran Kümbet Terminal", keys: ["harran", "kumbet evler", "harran universitesi"] },
        { label: "Halfeti Sakin Şehir & Batık Kent İskelesi", district: "Şanlıurfa", stopName: "Halfeti İskele Terminal", keys: ["halfeti", "batik kent", "rumkale", "cittaslow"] },

        // 64 UŞAK (KARUN HAZİNELERİ & ULUBEY KANYONU)
        { label: "Uşak Şehirlerarası Otobüs Terminali (Merkez)", district: "Uşak", stopName: "Uşak Otogar", keys: ["usak", "uşak", "usak otogar", "karun", "tarhana"] },
        { label: "Ulubey Kanyonu Cam Teras Doğa Turizm Durağı", district: "Uşak", stopName: "Ulubey Kanyon Terminal", keys: ["ulubey", "ulubey kanyonu", "cam teras", "kanyon"] },
        { label: "Banaz D-300 İzmir-Ankara Transit Terminali", district: "Uşak", stopName: "Banaz Otogar", keys: ["banaz", "banaz otogar", "d300", "hamamboztasi"] },

        // 65 VAN (VAN DENİZİ & AKDAMAR ADASI & HOŞAP)
        { label: "Van Büyükşehir Şehirlerarası Terminali (İpekyolu)", district: "Van", stopName: "Van Otogar", keys: ["van", "van otogar", "tusba", "ipekyolu", "van denizi", "kedi"] },
        { label: "Erciş Şehirlerarası Otobüs Terminali (Kuzey Sahil)", district: "Van", stopName: "Erciş Otogar", keys: ["ercis", "erciş", "ercis otogar", "inci kefali"] },
        { label: "Gevaş Akdamar Adası Feribot İskelesi Durağı", district: "Van", stopName: "Akdamar İskele Terminal", keys: ["gevas", "gevaş", "akdamar", "akdamar adasi", "kilise"] },
        { label: "Edremit Van Gölü Sahil Parkı & Kordon Terminali", district: "Van", stopName: "Edremit Van Terminal", keys: ["edremit", "van edremit", "sahil", "kordon"] },

        // 66 YOZGAT (BOZOK YAYLASI & ÇAMLIK MİLLİ PARKI)
        { label: "Yozgat Şehirlerarası Otobüs Terminali (Merkez)", district: "Yozgat", stopName: "Yozgat Otogar", keys: ["yozgat", "yozgat otogar", "bozok", "camlik", "testi kebabi"] },
        { label: "Sorgun D-200 Trans-Avrupa Şehirlerarası Terminali", district: "Yozgat", stopName: "Sorgun Otogar", keys: ["sorgun", "sorgun otogar", "termal", "d200"] },
        { label: "Yerköy Hızlı Tren İstasyonu & Otobüs Terminali", district: "Yozgat", stopName: "Yerköy Otogar", keys: ["yerkoy", "yerköy", "yht", "yerkoy yht"] },

        // 67 ZONGULDAK (KARAELMAS & MADEN MÜZESİ & EREĞLİ)
        { label: "100. Yıl Zonguldak Şehirlerarası Terminali (Merkez)", district: "Zonguldak", stopName: "Zonguldak Otogar", keys: ["zonguldak", "zonguldak otogar", "karaelmas", "komur", "gokgol"] },
        { label: "Karadeniz Ereğli Şehirlerarası Terminali (Erdemir)", district: "Zonguldak", stopName: "Ereğli Otogar", keys: ["eregli", "ereğli", "kdz eregli", "cehennemagzi", "erdemir"] },
        { label: "Çaycuma Filyos Vadisi Şehirlerarası Terminali", district: "Zonguldak", stopName: "Çaycuma Otogar", keys: ["caycuma", "çaycuma", "filyos", "manda yogurdu"] },

        // 68 AKSARAY (IHLARA VADİSİ & SULTANHANI & HASAN DAĞI)
        { label: "Aksaray Şehirlerarası Otobüs Terminali (AŞTİ)", district: "Aksaray", stopName: "Aksaray AŞTİ", keys: ["aksaray", "asti", "aşti", "aksaray otogar", "somuncu baba", "egri minare"] },
        { label: "Sultanhanı Tarihi Kervansaray Şehirlerarası Terminali", district: "Aksaray", stopName: "Sultanhanı Otogar", keys: ["sultanhami", "sultanhanı", "kervansaray", "ipekyolu"] },
        { label: "Güzelyurt Ihlara Vadisi Doğa Turizm Durağı", district: "Aksaray", stopName: "Ihlara Vadisi Terminal", keys: ["ihlara", "ihlara vadisi", "guzelyurt", "güzelyurt", "selime"] },

        // 70 KARAMAN (TÜRK DİLİ BAŞKENTİ & TAŞKALE)
        { label: "Karaman Şehirlerarası Otobüs Terminali (Merkez)", district: "Karaman", stopName: "Karaman Otogar", keys: ["karaman", "karaman otogar", "turk dili", "aktekke", "elma"] },
        { label: "Ermenek Turkuaz Baraj Kanyonu İlçe Terminali", district: "Karaman", stopName: "Ermenek Otogar", keys: ["ermenek", "ermenek otogar", "kanyon", "baraj"] },
        { label: "Taşkale Tarihi Kaya Ambarları Turizm Durağı", district: "Karaman", stopName: "Taşkale Ambarlar Terminal", keys: ["taskale", "taşkale", "manazan", "kaya ambari"] },
        // 71 KIRIKKALE (SİLAH SANAYİ & ÇEŞNİGİR KANYONU)
        { label: "Kırıkkale Şehirlerarası Otobüs Terminali (Kırıkkale Otogarı - Yahşihan)", district: "Kırıkkale", stopName: "Kırıkkale Otogar", keys: ["kirikkale", "kırıkkale", "kirikkale otogar", "yahsihan", "cesnigir"] },
        { label: "Cumhuriyet Meydanı Aktarma Noktası (Kırıkkale Merkez)", district: "Kırıkkale", stopName: "Kırıkkale Cumhuriyet Meydanı", keys: ["cumhuriyet meydani", "merkez", "muhimmat"] },
        { label: "Keskin Tarihi Taş Mektep & Hacı Taşan Meydanı Terminali", district: "Kırıkkale", stopName: "Keskin Otogar", keys: ["keskin", "keskin otogar", "haci tasan", "tas mektep"] },

        // 72 BATMAN (PETROL & HASANKEYF KADİM YERLEŞİMİ)
        { label: "Batman Şehirlerarası Otobüs Terminali (BAŞTİ)", district: "Batman", stopName: "Batman BAŞTİ Otogar", keys: ["batman", "basti", "başti", "batman otogar", "petrol", "raman"] },
        { label: "Hasankeyf Yeni Yerleşke & Dicle Kanyonu Terminali", district: "Batman", stopName: "Hasankeyf Otogar", keys: ["hasankeyf", "hasankeyf otogar", "dicle", "viyaduk"] },
        { label: "Kozluk Tarihi Kale & Dağ Yolu İlçe Terminali", district: "Batman", stopName: "Kozluk Otogar", keys: ["kozluk", "kozluk otogar", "sason", "sehirici"] },

        // 73 ŞIRNAK (CUDİ DAĞI & CİZRE İPEKYOLU MERKEZİ)
        { label: "Şırnak Şehirlerarası Otobüs Terminali (Merkez Otogarı)", district: "Şırnak", stopName: "Şırnak Otogar", keys: ["sirnak", "şırnak", "sirnak otogar", "cudi", "sehirlerarasi"] },
        { label: "Cizre Tarihi İpekyolu & Kırmızı Medrese Şehirlerarası Otogarı", district: "Şırnak", stopName: "Cizre Otogar", keys: ["cizre", "cizre otogar", "ipekyolu", "kirmizi medrese", "el cezeri"] },
        { label: "Silopi Habur Sınır Kapısı Aktarma Terminali", district: "Şırnak", stopName: "Silopi Otogar", keys: ["silopi", "silopi otogar", "habur", "sinir kapisi"] },

        // 74 BARTIN (ÇEŞM-İ CİHAN & AMASRA & İNKUMU)
        { label: "Bartın Şehirlerarası Otobüs Terminali (BARTİ)", district: "Bartın", stopName: "Bartın BARTİ Otogar", keys: ["bartin", "bartın", "bartin otogar", "barti", "kure daglari"] },
        { label: "Amasra Çeşm-i Cihan Tarihi Liman & Kale Terminali", district: "Bartın", stopName: "Amasra Otogar", keys: ["amasra", "amasra otogar", "cesmi cihan", "kemere", "tavsan adasi"] },
        { label: "İnkumu Sahil Parkı & Doğa Turizm Durağı", district: "Bartın", stopName: "İnkumu Sahil Terminal", keys: ["inkumu", "inkumu sahil", "plaj", "guzelcehisar"] },

        // 75 ARDAHAN (ÇILDIR GÖLÜ & SAHARA GEÇİDİ & KAFKAS KAPISI)
        { label: "Ardahan Şehirlerarası Otobüs Terminali (Merkez Otogarı)", district: "Ardahan", stopName: "Ardahan Otogar", keys: ["ardahan", "ardahan otogar", "ardahan kalesi", "gravyer", "yalnizcam"] },
        { label: "Çıldır Gölü İskelesi & Buz Şöleni Turizm Terminali", district: "Ardahan", stopName: "Çıldır Gölü Terminal", keys: ["cildir", "çıldır", "cildir golu", "atli kizak", "seytan kalesi"] },
        { label: "Göle Yaylalar & Kaşar Diyarı İlçe Terminali", district: "Ardahan", stopName: "Göle Otogar", keys: ["gole", "göle", "gole otogar", "bulbilan"] },

        // 76 IĞDIR (AĞRI DAĞI ETEKLERİ & TUZLUCA KAYA MAĞARALARI)
        { label: "Iğdır Şehirlerarası Otobüs Terminali (Merkez)", district: "Iğdır", stopName: "Iğdır Otogar", keys: ["igdir", "iğdır", "igdir otogar", "agri dagi", "surmeli", "kayisi"] },
        { label: "Tuzluca Tarihi Kaya Tuz Mağaraları & Kanyon Durağı", district: "Iğdır", stopName: "Tuzluca Otogar", keys: ["tuzluca", "tuzluca otogar", "tuz magarasi", "tuzluca kanyonu"] },
        { label: "Dilucu Nahçıvan - Azerbaycan Sınır Kapısı Aktarma Terminali", district: "Iğdır", stopName: "Dilucu Terminal", keys: ["dilucu", "aralik", "nahcivan", "sinir kapisi", "aras"] },

        // 78 KARABÜK (SAFRANBOLU UNESCO & KARDEMİR)
        { label: "Karabük Şehirlerarası Otobüs Terminali (Merkez Otogarı)", district: "Karabük", stopName: "Karabük Otogar", keys: ["karabuk", "karabük", "karabuk otogar", "kardemir", "demir celik"] },
        { label: "Safranbolu UNESCO Tarihi Konaklar & Eski Çarşı Terminali", district: "Karabük", stopName: "Safranbolu Tarihi Çarşı Otogar", keys: ["safranbolu", "safranbolu otogar", "eski carsi", "cinci hani", "lokum"] },
        { label: "Yenice Doğa Kanyonu & Şeker Kanyonu Orman Terminali", district: "Karabük", stopName: "Yenice Otogar", keys: ["yenice", "yenice otogar", "kanyon", "seker kanyonu"] },

        // 79 KİLİS (ZEYTİN DİYARI & OYLUM HÖYÜK)
        { label: "Kilis Şehirlerarası Otobüs Terminali (Kilis Otogarı)", district: "Kilis", stopName: "Kilis Otogar", keys: ["kilis", "kilis otogar", "zeytin", "kilis tavasi", "salih efendi"] },
        { label: "Cumhuriyet Meydanı & Tarihi Kilis Konakları Durağı", district: "Kilis", stopName: "Kilis Merkez Meydan", keys: ["kilis merkez", "cumhuriyet meydani", "ravanda", "katmer"] },
        { label: "Öncüpınar Sınır Kapısı & İpekyolu Aktarma Durağı", district: "Kilis", stopName: "Öncüpınar Terminal", keys: ["oncupinar", "öncüpınar", "sinir", "elbeyli"] },

        // 80 OSMANİYE (KALELER ŞEHRİ & KARATEPE ASLANTAŞ)
        { label: "Osmaniye Şehirlerarası Otobüs Terminali (Merkez Otogarı)", district: "Osmaniye", stopName: "Osmaniye Otogar", keys: ["osmaniye", "osmaniye otogar", "yer fistigi", "toprakkale", "kastabala"] },
        { label: "Kadirli İlçe Otogarı & Tarihi Alacami Meydanı", district: "Osmaniye", stopName: "Kadirli Otogar", keys: ["kadirli", "kadirli otogar", "turp", "alacami", "karatepe"] },
        { label: "Düziçi & Bahçe Otoyol Çıkışı Aktarma Terminali", district: "Osmaniye", stopName: "Düziçi Otogar", keys: ["duzici", "düziçi", "bahce", "bahçe", "zorkun yaylasi"] },

        // 81 DÜZCE (BOLU DAĞI & AKÇAKOCA CENEVİZ SAHİLİ)
        { label: "Düzce Şehirlerarası Otobüs Terminali (Kervan Kavşağı)", district: "Düzce", stopName: "Düzce Otogar", keys: ["duzce", "düzce", "duzce otogar", "kervan", "konuralp", "kordon"] },
        { label: "Akçakoca Tarihi Ceneviz Kalesi Sahil Terminali", district: "Düzce", stopName: "Akçakoca Otogar", keys: ["akcakoca", "akçakoca", "ceneviz kalesi", "sahil", "karadeniz", "findik"] },
        { label: "Kaynaşlı Bolu Dağı Rampaları Dinlenme & Aktarma Durağı", district: "Düzce", stopName: "Kaynaşlı Bolu Dağı Terminal", keys: ["kaynasli", "kaynaşlı", "bolu dagi", "samandere", "guzeldere"] },





        // TRAKYA ÇEVRE KUŞAĞI: İSTANBUL, EDİRNE, KIRKLARELİ, ÇANAKKALE VE SINIR TERMİNALLERİ
        // İSTANBUL & SINIR
        { label: "İstanbul 15 Temmuz Demokrasi Otogarı (Esenler)", district: "İstanbul", stopName: "İstanbul Esenler Otogarı", keys: ["istanbul", "esenler", "esenler otogar", "istanbul otogar", "istanbul avrupa"] },
        { label: "İstanbul Kadıköy (Rıhtım & İskele)", district: "İstanbul", stopName: "Kadıköy Rıhtım İskele", keys: ["kadikoy", "kadikoy rihtim", "istanbul anadolu", "harem"] },
        { label: "Silivri Otogarı (Tekirdağ Sınır Kapısı)", district: "İstanbul", stopName: "Silivri Otogar", keys: ["silivri", "silivri otogar"] },
        { label: "Çatalca Meydanı & Gar", district: "İstanbul", stopName: "Çatalca Meydan", keys: ["catalca", "catalca meydan"] },

        // EDİRNE & SINIR
        { label: "Edirne Şehirlerarası Otobüs Terminali (Merkez)", district: "Edirne", stopName: "Edirne Şehirlerarası Otogar", keys: ["edirne", "edirne otogar", "edirne merkez", "selimiye"] },
        { label: "Keşan Otogarı (Malkara Sınır Kapısı & Ege Kavşağı)", district: "Edirne", stopName: "Keşan Otogar", keys: ["kesan", "kesan otogar"] },
        { label: "Uzunköprü Meydanı (Hayrabolu Sınır Kapısı)", district: "Edirne", stopName: "Uzunköprü Meydan", keys: ["uzunkopru", "uzunkopru meydan"] },

        // KIRKLARELİ & SINIR
        { label: "Kırklareli Şehirlerarası Otobüs Terminali (Merkez)", district: "Kırklareli", stopName: "Kırklareli Otogar", keys: ["kirklareli", "kirklareli otogar", "kirklareli merkez"] },
        { label: "Lüleburgaz Otogarı (Muratlı & Çorlu Sınır Kapısı)", district: "Kırklareli", stopName: "Lüleburgaz Otogar", keys: ["luleburgaz", "luleburgaz otogar"] },
        { label: "Babaeski Çarşı Meydanı (Hayrabolu Sınır Kapısı)", district: "Kırklareli", stopName: "Babaeski Meydan", keys: ["babaeski", "babaeski meydan"] },
        { label: "Vize Hükümet Meydanı (Saray Sınır Kapısı)", district: "Kırklareli", stopName: "Vize Meydan", keys: ["vize", "vize meydan"] },

        // ÇANAKKALE & BOĞAZ
        { label: "Çanakkale Şehirlerarası Otogarı & İskele (Merkez)", district: "Çanakkale", stopName: "Çanakkale İskele", keys: ["canakkale", "canakkale otogar", "canakkale iskele"] },
        { label: "Gelibolu Otogarı (Şarköy Sınır Kapısı)", district: "Çanakkale", stopName: "Gelibolu Otogar", keys: ["gelibolu", "gelibolu otogar"] },
        { label: "1915 Çanakkale Köprüsü Gişeleri (Boğaz Geçişi)", district: "Çanakkale", stopName: "1915 Çanakkale Köprüsü", keys: ["1915 koprusu", "canakkale koprusu", "bogaz koprusu"] },

        // DİĞER İLÇELERİMİZ
        { label: "Malkara Otogarı (İlçe Terminali)", district: "Malkara", stopName: "Malkara Otogar", keys: ["malkara", "malkara otogar", "malkara merkez"] },
        { label: "Hayrabolu Otogarı (Çarşı & Meydan)", district: "Hayrabolu", stopName: "Hayrabolu Otogar", keys: ["hayrabolu", "hayrabolu otogar", "hayrabolu meydan"] },
        { label: "Şarköy Otogarı (Sahil & İskele)", district: "Şarköy", stopName: "Şarköy Otogar", keys: ["sarkoy", "sarkoy otogar", "sarkoy sahil", "sarkoy iskele"] },
        { label: "Marmaraereğlisi Otogarı (Sahil & Perinthos)", district: "Marmaraereğlisi", stopName: "Marmaraereğlisi Otogarı", keys: ["marmaraereglisi", "marmaraereğlisi", "eregli", "ereğli", "yeniciftlik", "perinthos"] },
        { label: "Ergene Belediyesi & Marmaracık Meydan (Sanayi Aksı)", district: "Ergene", stopName: "Ergene Belediyesi (Marmaracık Merkez)", keys: ["ergene", "marmaracik", "marmaracık", "ulas", "ulaş", "saglik", "sağlık", "yesiltepe", "yeşiltepe"] },

        // ÇEVRE İLÇELER
        { label: "Çorlu Otogarı (İlçe Terminali)", district: "Çorlu", stopName: "Çorlu Otogar", keys: ["corlu", "corlu otogar"] },
        { label: "Çerkezköy Otogarı (İlçe Terminali)", district: "Çerkezköy", stopName: "Çerkezköy Otogar", keys: ["cerkezkoy", "cerkezkoy otogar"] },
        { label: "Kapaklı Otogarı (İlçe Terminali)", district: "Kapaklı", stopName: "Kapaklı Otogarı", keys: ["kapakli", "kapakli otogar"] },
        { label: "Muratlı Meydanı (İstasyon)", district: "Muratlı", stopName: "Muratlı Meydan", keys: ["muratli", "muratli meydan"] }
    ],

    resolveMahalleOrHub: function(query) {
        if (!query) return null;
        const catalog = this.getActiveCatalog();
        const qNorm = this.normalizeText(query);
        const qWords = qNorm.split(' ').filter(w => w.length > 2);

        // 1. Tam birebir etiket veya tam anahtar kelime eşleşmesi (Öncelikli)
        let match = catalog.find(item => this.normalizeText(item.label) === qNorm || (item.keys && item.keys.includes(qNorm)));
        if (match) return match;

        match = this.mahallelerVeAnaDuraklar.find(item => this.normalizeText(item.label) === qNorm || (item.keys && item.keys.includes(qNorm)));
        if (match) return match;

        // 2. Başlayan anahtar kelime eşleşmesi
        match = catalog.find(item => item.keys && item.keys.some(k => qNorm.startsWith(k) || k.startsWith(qNorm)));
        if (match) return match;

        match = this.mahallelerVeAnaDuraklar.find(item => item.keys && item.keys.some(k => qNorm.startsWith(k) || k.startsWith(qNorm)));
        if (match) return match;

        // 3. Alt dize eşleşmesi
        match = catalog.find(item => qWords.some(w => this.normalizeText(item.label).includes(w)));
        if (match) return match;

        match = this.mahallelerVeAnaDuraklar.find(item => {
            const lNorm = this.normalizeText(item.label);
            return qWords.some(w => lNorm.includes(w));
        });
        return match || null;
    },
    allStopsCache: null,

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

    matchStop: function(stopName, query) {
        if (!stopName || !query) return false;
        const sNorm = this.normalizeText(stopName);
        const qNorm = this.normalizeText(query);
        const qWords = qNorm.split(' ').filter(w => w.length > 1);
        // Velimeşe Çetin Sokak Alias Desteği
        if ((qNorm.includes("cetin") || qNorm.includes("cetin sokak")) && sNorm.includes("cetin")) {
            return true;
        }
        if (qWords.length === 0) return sNorm.includes(qNorm);
        return qWords.every(w => sNorm.includes(w));
    },

    getAllStops: function() {
        // Seviyeye göre sadece aktif katalog döner (açılmayan ilçeler tamamen gizlidir)
        return this.getActiveCatalog().map(item => item.label);
    },

    hesapla: function(neredenQuery, nereyeQuery) {
        // Mahalle ve Ana Durak çözümlemesi
        const fromHub = this.resolveMahalleOrHub(neredenQuery);
        const toHub = this.resolveMahalleOrHub(nereyeQuery);

        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;

        

        const effectiveFrom = fromHub ? fromHub.stopName : neredenQuery;
        const effectiveTo = toHub ? toHub.stopName : nereyeQuery;

        const activeDist = this.getActiveDistrict();
        // 1. SÜLEYMANPAŞA İÇİ MAHALLE / ANA DURAK NAVİGASYONU
        if ((activeDist === "Süleymanpaşa" || activeDist === "all") && (!fromHub || fromHub.district === "Süleymanpaşa") && (!toHub || toHub.district === "Süleymanpaşa")) {
            if (typeof SuleymanpasaNavigasyon !== 'undefined' && SuleymanpasaNavigasyon.findSokak) {
                const sFrom = SuleymanpasaNavigasyon.findSokak(effectiveFrom);
                const sTo = SuleymanpasaNavigasyon.findSokak(effectiveTo);
                if (sFrom && sTo && sFrom.id !== sTo.id) {
                    const sRes = SuleymanpasaNavigasyon.rotaOlustur(effectiveFrom, effectiveTo);
                    if (sRes.success) {
                        return {
                            success: true,
                            route: sRes.route,
                            originalRoute: sRes.route,
                            fromStop: fromHub ? fromHub.label : sRes.kalkis.name,
                            toStop: toHub ? toHub.label : sRes.varis.name,
                            stopsCount: sRes.stopsCount,
                            dist: sRes.totalKm
                        };
                    }
                }
            }
        }

        // 2. SARAY İÇİ MAHALLE / ANA DURAK NAVİGASYONU
        if ((activeDist === "Saray" || (hasPassed10 && activeDist === "all")) && (!fromHub || fromHub.district === "Saray") && (!toHub || toHub.district === "Saray")) {
            if (typeof SarayNavigasyon !== 'undefined' && SarayNavigasyon.findSokak) {
                const sFrom = SarayNavigasyon.findSokak(effectiveFrom);
                const sTo = SarayNavigasyon.findSokak(effectiveTo);
                if (sFrom && sTo && sFrom.id !== sTo.id) {
                    const sRes = SarayNavigasyon.rotaOlustur(effectiveFrom, effectiveTo);
                    if (sRes.success) {
                        return {
                            success: true,
                            route: sRes.route,
                            originalRoute: sRes.route,
                            fromStop: fromHub ? fromHub.label : sRes.kalkis.name,
                            toStop: toHub ? toHub.label : sRes.varis.name,
                            stopsCount: sRes.stopsCount,
                            dist: sRes.totalKm
                        };
                    }
                }
            }
        }

        // 3. VELİMEŞE İÇİ MAHALLE NAVİGASYONU
        if ((activeDist === "Velimeşe" || (hasPassed10 && activeDist === "all")) && (!fromHub || fromHub.district === "Velimeşe") && (!toHub || toHub.district === "Velimeşe")) {
            if (typeof VelimeseNavigasyon !== 'undefined' && VelimeseNavigasyon.findSokak) {
                const vFrom = VelimeseNavigasyon.findSokak(effectiveFrom);
                const vTo = VelimeseNavigasyon.findSokak(effectiveTo);
                if (vFrom && vTo && vFrom.id !== vTo.id) {
                    const vRes = VelimeseNavigasyon.rotaOlustur(effectiveFrom, effectiveTo);
                    if (vRes.success) {
                        return {
                            success: true,
                            route: vRes.route,
                            originalRoute: vRes.route,
                            fromStop: fromHub ? fromHub.label : vRes.kalkis.name,
                            toStop: toHub ? toHub.label : vRes.varis.name,
                            stopsCount: vRes.stopsCount,
                            dist: vRes.totalKm
                        };
                    }
                }
            }
        }
        // SARAY İLÇE VE MAHALLELERİ İÇİ FORMÜLSEL NAVİGASYON
        if (hasPassed10 && typeof SarayNavigasyon !== 'undefined' && SarayNavigasyon.findSokak) {
            const sFrom = SarayNavigasyon.findSokak(neredenQuery);
            const sTo = SarayNavigasyon.findSokak(nereyeQuery);
            if (sFrom && sTo && sFrom.id !== sTo.id) {
                const sRes = SarayNavigasyon.rotaOlustur(neredenQuery, nereyeQuery);
                if (sRes.success) {
                    return {
                        success: true,
                        route: sRes.route,
                        originalRoute: sRes.route,
                        fromStop: sRes.kalkis.name,
                        toStop: sRes.varis.name,
                        stopsCount: sRes.stopsCount,
                        dist: sRes.totalKm
                    };
                }
            }
        }
        // SÜLEYMANPAŞA MAHALLELERİ İÇİ FORMÜLSEL NAVİGASYON
        if (typeof SuleymanpasaNavigasyon !== 'undefined' && SuleymanpasaNavigasyon.findSokak) {
            const sFrom = SuleymanpasaNavigasyon.findSokak(neredenQuery);
            const sTo = SuleymanpasaNavigasyon.findSokak(nereyeQuery);
            if (sFrom && sTo && sFrom.id !== sTo.id) {
                const sRes = SuleymanpasaNavigasyon.rotaOlustur(neredenQuery, nereyeQuery);
                if (sRes.success) {
                    return {
                        success: true,
                        route: sRes.route,
                        originalRoute: sRes.route,
                        fromStop: sRes.kalkis.name,
                        toStop: sRes.varis.name,
                        stopsCount: sRes.stopsCount,
                        dist: sRes.totalKm
                    };
                }
            }
        }
        // VELİMEŞE 100 SOKAK İÇİ ÖNCELİKLİ KONTROL
        if (typeof VelimeseNavigasyon !== 'undefined' && VelimeseNavigasyon.findSokak) {
            const vFrom = VelimeseNavigasyon.findSokak(neredenQuery);
            const vTo = VelimeseNavigasyon.findSokak(nereyeQuery);
            if (vFrom && vTo && vFrom.id !== vTo.id) {
                const vRes = VelimeseNavigasyon.rotaOlustur(neredenQuery, nereyeQuery);
                if (vRes.success) {
                    return {
                        success: true,
                        route: vRes.route,
                        originalRoute: vRes.route,
                        fromStop: vRes.kalkis.name,
                        toStop: vRes.varis.name,
                        stopsCount: vRes.stopsCount,
                        dist: vRes.totalKm
                    };
                }
            }
        }
        if (!neredenQuery || !nereyeQuery) {
            return { success: false, message: "Lütfen hem kalkış hem de varış durağını belirtin." };
        }

        // TRAKYA ÇEVRE KUŞAĞI: İSTANBUL, EDİRNE, KIRKLARELİ VE ÇANAKKALE ŞEHİRLERARASI VE SINIR SEFERLERİ
        const intercityProvinces = (typeof masterCitiesList !== 'undefined' && Array.isArray(masterCitiesList) && masterCitiesList.length > 0) ? masterCitiesList : ["İstanbul", "Edirne", "Kırklareli", "Çanakkale"];
        const nFromNorm = this.normalizeText(neredenQuery);
        const nToNorm = this.normalizeText(nereyeQuery);

        const matchProv = (hub, norm) => {
            if (hub && hub.province) return hub.province;
            // Tekirdağ ilçeleri asla şehirlerarası il olarak eşleşmesin
            const tekDistricts = ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı", "Ergene", "Muratlı", "Marmaraereğlisi", "Saray", "Hayrabolu", "Malkara", "Şarköy", "Velimeşe"];
            if (hub && tekDistricts.includes(hub.district)) return null;

            const normClean = norm.trim().toLowerCase();
            const normWords = normClean.split(' ');
            if (tekDistricts.some(td => {
                const tdNorm = this.normalizeText(td).toLowerCase();
                return normClean === tdNorm || normWords.includes(tdNorm);
            })) {
                return null;
            }

            if (hub && intercityProvinces.includes(hub.district)) return hub.district;
            if (typeof masterCitiesList !== 'undefined') {
                const matchedCity = masterCitiesList.find(c => {
                    const cNorm = this.normalizeText(c).toLowerCase();
                    return normClean === cNorm || normClean.startsWith(cNorm + " ") || normClean.endsWith(" " + cNorm) || normWords.includes(cNorm);
                });
                if (matchedCity) return matchedCity;
            }
            if (typeof CompassSystem !== 'undefined' && CompassSystem.turkiye81GPS) {
                const normClean = norm.trim().toLowerCase();
                const all81 = Object.keys(CompassSystem.turkiye81GPS);
                const matched81 = all81.find(c => {
                    const cNorm = this.normalizeText(c).toLowerCase();
                    return normClean === cNorm || normClean.startsWith(cNorm + " ") || normClean.endsWith(" " + cNorm);
                });
                if (matched81) return matched81;
            }
            // Caddelerle karışmaması için özel kontrol
            const words = norm.split(' ');
                        if (words.some(w => ["artvin", "hopa", "borcka", "savsat", "yusufeli", "arhavi", "murgul", "kemalpasa", "danisment", "karagol", "kafkasor", "sarp"].includes(w)) || norm === "artvin") return "Artvin";
                                                                                                            if (words.some(w => ["sinop", "boyabat", "gerze", "ayancik", "turkeli", "duragan", "erfelek", "dikmen", "sarayduzu", "inceburun", "hamsilos"].includes(w)) || norm === "sinop") return "Sinop";
                                                                                                                        if (words.some(w => ["yalova", "termal", "cinarcik", "çınarcık", "armutlu", "altinova", "altınova", "ciftlikkoy", "çiftlikköy", "osmangazi"].includes(w)) || norm === "yalova") return "Yalova";
                        if (words.some(w => ["gumushane", "gümüşhane", "torul", "kurtun", "kürtün", "kelkit", "siran", "şiran", "kose", "köse", "zigana", "karaca magarasi", "karaca mağarası", "pestil", "kome", "köme"].includes(w)) || norm === "gumushane" || norm === "gümüşhane") return "Gümüşhane";
                        if (words.some(w => ["giresun", "bulancak", "piraziz", "kesap", "keşap", "espiye", "tirebolu", "gorele", "görele", "eynesil", "dereli", "kumbet", "kümbet", "sebinkarahisar", "şebinkarahisar", "alucra", "camoluk", "çamoluk", "findik", "fındık"].includes(w)) || norm === "giresun") return "Giresun";
                        if (words.some(w => ["gaziantep", "antep", "sahinbey", "şahinbey", "sehitkamil", "şehitkamil", "nizip", "zeugma", "baklava", "fistik", "fıstık", "rumkale", "nurdagi", "nurdağı", "islahiye", "islâhiye", "araban", "yavuzeli", "karkamis", "karkamış"].includes(w)) || norm === "gaziantep" || norm === "antep") return "Gaziantep";
                        if (words.some(w => ["eskisehir", "eskişehir", "odunpazari", "odunpazarı", "tepebasi", "tepebaşı", "sazova", "sivrihisar", "seyitgazi", "porsuk", "ciborek", "çibörek", "luletasi", "lületaşı"].includes(w)) || norm === "eskisehir" || norm === "eskişehir") return "Eskişehir";
                        if (words.some(w => ["erzurum", "palandoken", "palandöken", "cifte minareli", "çifte minareli", "yakutiye", "askale", "aşkale", "pasinler", "horasan", "oltu", "ispir", "tortum", "ovit", "cag kebabi", "cağ kebabı"].includes(w)) || norm === "erzurum") return "Erzurum";
            if (words.some(w => ["konya", "mevlana", "catalhoyuk", "çatalhöyük", "aksehir", "akşehir", "beysehir", "beyşehir", "seydisehir", "seydişehir", "eregli", "ereğli", "cihanbeyli", "kulu", "karapinar", "karapınar", "cumra", "çumra", "ilgin", "ılgın", "meram", "selcuklu", "selçuklu", "karatay"].includes(w)) || norm === "konya") return "Konya";
            if (words.some(w => ["erzincan", "refahiye", "tercan", "uzumlu", "üzümlü", "kemaliye", "kemah", "cayinli", "çayırlı", "ilic", "iliç", "otlukbeli", "girlevik", "ergan"].includes(w)) || norm === "erzincan") return "Erzincan";
            if (words.some(w => ["elazig", "elazığ", "harput", "keban", "sivrice", "maden", "kovancilar", "kovancılar", "karakocan", "karakoçan", "palu", "baskil", "agin", "ağın", "aricak", "arıcak", "alacakaya"].includes(w)) || norm === "elazig" || norm === "elazığ") return "Elazığ";
            if (words.some(w => ["bayburt", "aydintepe", "aydıntepe", "demirozu", "demirözü", "kop", "baksi", "baksı"].includes(w)) || norm === "bayburt") return "Bayburt";
            if (words.some(w => ["diyarbakir", "diyarbakır", "disti", "dişti", "ergani", "silvan", "bismil", "cinar", "çınar", "cermik", "çermik", "dicle", "kulp", "hani", "lice", "egil", "eğil", "hazro", "kocakoy", "kocaköy", "cungus", "çüngüş", "sur", "baglar", "bağlar", "kayapinar", "kayapınar", "yenisehir", "yenişehir"].includes(w)) || norm === "diyarbakir" || norm === "diyarbakır") return "Diyarbakır";
            if (words.some(w => ["corum", "çorum", "sungurlu", "osmancik", "osmancık", "iskilip", "alaca", "bogazkale", "boğazkale", "kargi", "kargı", "mecitozu", "mecitözü", "ortakoy", "ortaköy", "ugurludag", "uğurludağ", "bayat", "dodurga", "oguzlar", "oğuzlar", "lacin", "laçin"].includes(w)) || norm === "corum" || norm === "çorum") return "Çorum";
            if (words.some(w => ["cankiri", "çankırı", "cerkes", "çerkeş", "ilgaz", "kursunlu", "kurşunlu", "sabanozu", "şabanözü", "orta", "eldivan", "yaprakli", "kizilirmak", "kızılırmak", "atakaracalar", "bayramoren", "korgun"].includes(w)) || norm === "cankiri" || norm === "çankırı") return "Çankırı";
            if (words.some(w => ["bursa", "inegol", "gemlik", "mudanya", "orhangazi", "iznik", "karacabey", "mustafakemalpasa", "uludag", "nilufer", "osmangazi", "yildirim", "gursu", "kestel"].includes(w)) || norm === "bursa") return "Bursa";
            if (words.some(w => ["burdur", "bucak", "yesilova", "salda", "golhisar", "celtikci", "aglasun", "sagalasos", "tefenni", "karamanli", "cavdir", "altinyayla"].includes(w)) || norm === "burdur") return "Burdur";
            if (words.some(w => ["bolu", "gerede", "mengen", "mudurnu", "goynuk", "seben", "kibriscik", "yenicaga", "dortdivan", "abant", "yedigoller", "kartalkaya", "boludagi"].includes(w)) || norm === "bolu") return "Bolu";
            if (words.some(w => ["bitlis", "tatvan", "ahlat", "adilcevaz", "guroymak", "mutki", "hizan", "nemrut", "suphan", "rahva", "besminare"].includes(w)) || norm === "bitlis") return "Bitlis";
            if (words.some(w => ["bingol", "solhan", "karliova", "genc", "kigi", "yedisu", "yayladere", "adakli", "yuzenadalar", "capakcur", "haserek"].includes(w)) || norm === "bingol") return "Bingöl";
            if (words.some(w => ["bilecik", "bozuyuk", "sogut", "osmaneli", "pazaryeri", "golpazari", "yenipazar", "inhisar", "edebali", "ertugrul"].includes(w)) || norm === "bilecik") return "Bilecik";
            if (words.some(w => ["balikesir", "bandirma", "edremit", "ayvalik", "gonen", "susurluk", "burhaniye", "erdek", "dursunbey", "bigadic", "sindirgi", "ivrindi", "havran", "savastepe", "manyas", "gomec", "akcay", "altinoluk", "cunda", "kazdaglari"].includes(w)) || norm === "balikesir") return "Balıkesir";
            if (words.some(w => ["aydin", "efeler", "kusadasi", "nazilli", "soke", "didim", "germencik", "incirliova", "cine", "buharkent", "kuyucak", "sultanhisar", "yenipazar", "karacasu", "bozdogan", "kocarli", "bafa"].includes(w)) || norm === "aydin") return "Aydın";
            if (words.some(w => ["denizli", "pamukkale", "hierapolis", "saraykoy", "honaz", "tavas", "acipayam", "buldan", "civril"].includes(w)) || norm === "denizli") return "Denizli";
            if (words.some(w => ["antalya", "kepez", "konyaalti", "lara", "alanya", "manavgat", "kemer", "kas"].includes(w)) || norm === "antalya") return "Antalya";
            if (words.some(w => ["ankara", "asti", "kizilay", "anitkabir", "polatli", "cankaya", "kecioren"].includes(w)) || norm === "ankara" || norm === "asti") return "Ankara";
            if (words.some(w => ["amasya", "merzifon", "suluova", "tasova", "gumushacikoy", "goynucek", "hamamozu"].includes(w)) || norm === "amasya") return "Amasya";
            if (words.some(w => ["agri", "dogubayazit", "patnos", "eleskirt", "diyadin", "ishakpasa"].includes(w)) || norm === "agri") return "Ağrı";
            if (words.some(w => ["afyon", "afyonkarahisar", "aftas", "sandikli", "dinar", "bolvadin", "emirdag"].includes(w)) || norm === "afyon" || norm === "afyonkarahisar") return "Afyonkarahisar";
            if (words.some(w => ["adiyaman", "nemrut", "kahta", "golbasi", "besni"].includes(w)) || norm === "adiyaman") return "Adıyaman";
            if (words.some(w => ["adana", "cukurova", "seyhan", "yuregir", "saricam", "karaisali", "ceyhan", "karatas", "yumurtalik", "imamoglu", "kozan", "aladag", "pozanti", "feke", "saimbeyli", "tufanbeyli"].includes(w)) || norm === "adana") return "Adana";
            if (words.some(w => ["istanbul", "esenler", "silivri", "catalca"].includes(w))) return "İstanbul";
            if (words.some(w => ["edirne", "kesan", "uzunkopru", "ipsala", "kapikule"].includes(w))) return "Edirne";
            if (words.some(w => ["kirklareli", "luleburgaz", "babaeski", "vize", "pinarhisar"].includes(w))) return "Kırklareli";
            if (words.some(w => ["canakkale", "gelibolu", "eceabat", "lapseki", "biga", "can", "ayvacik", "ezine", "bayramic", "yenice", "bozcaada", "gokceada", "assos", "truva"].includes(w))) return "Çanakkale";
            if (norm === "edirne" || norm.startsWith("edirne ")) return "Edirne";
            if (norm === "istanbul" || norm.startsWith("istanbul ")) return "İstanbul";
            if (norm === "kirklareli" || norm.startsWith("kirklareli ")) return "Kırklareli";
            if (norm === "canakkale" || norm.startsWith("canakkale ")) return "Çanakkale";
            return null;
        };

        const fromTargetProv = matchProv(fromHub, nFromNorm);
        const toTargetProv = matchProv(toHub, nToNorm);

        if (fromTargetProv || toTargetProv) {
            const currentCity = (typeof Game !== 'undefined' && Game.currentCity) ? Game.currentCity : "Tekirdağ";
            const curDist = this.getActiveDistrict();

            // Kalkış ve Varış İllerini Dinamik Belirle
            let originProvince = fromTargetProv;
            let targetProvince = toTargetProv;

            if (!originProvince && targetProvince) {
                originProvince = (fromHub && fromHub.district && !intercityProvinces.includes(fromHub.district))
                    ? fromHub.district
                    : (curDist !== 'all' ? curDist : currentCity);
            } else if (originProvince && !targetProvince) {
                targetProvince = (toHub && toHub.district && !intercityProvinces.includes(toHub.district))
                    ? toHub.district
                    : (curDist !== 'all' ? curDist : currentCity);
            }

            if (originProvince === targetProvince) {
                targetProvince = (originProvince === "İstanbul") ? "Ankara" : "İstanbul";
            }

            // Gerçek KGM Karayolu Mesafesi ve GPS Hesabı
            let exactKm = 0;
            const pairKey1 = originProvince + "-" + targetProvince;
            const pairKey2 = targetProvince + "-" + originProvince;
            if (typeof sehirlerarasiMesafeler !== 'undefined') {
                exactKm = sehirlerarasiMesafeler[pairKey1] || sehirlerarasiMesafeler[pairKey2] || 0;
            }

            // Koordinatlar (CompassSystem 81 İl GPS)
            const c1 = (typeof CompassSystem !== 'undefined' && CompassSystem.getCityCoordinates) ? CompassSystem.getCityCoordinates(originProvince) : null;
            const c2 = (typeof CompassSystem !== 'undefined' && CompassSystem.getCityCoordinates) ? CompassSystem.getCityCoordinates(targetProvince) : null;

            if (!exactKm && c1 && c2 && typeof CompassSystem !== 'undefined' && CompassSystem.calculateDistanceKm) {
                exactKm = Math.round(CompassSystem.calculateDistanceKm(c1[0], c1[1], c2[0], c2[1]) * 1.28);
            }
            if (!exactKm) {
                exactKm = 140;
            }

            const startName = fromHub ? fromHub.label : `${originProvince} Otobüs Terminali`;
            const endName = toHub ? toHub.label : `${targetProvince} Otobüs Terminali`;

            const startCoord = c1 ? { lat: c1[0], lon: c1[1] } : { lat: 40.9833, lon: 27.5167 };
            const endCoord = c2 ? { lat: c2[0], lon: c2[1] } : { lat: 41.0082, lon: 28.9784 };

            const intermediates = (typeof midPoints !== 'undefined' && midPoints[targetProvince])
                ? midPoints[targetProvince]
                : ((typeof midPoints !== 'undefined' && midPoints[originProvince]) ? midPoints[originProvince] : ["Bölgesel Transit Karayolu", "İl Sınır Gişeleri"]);

            const mid1Lat = Number((startCoord.lat + (endCoord.lat - startCoord.lat) * 0.35).toFixed(4));
            const mid1Lon = Number((startCoord.lon + (endCoord.lon - startCoord.lon) * 0.35).toFixed(4));
            const mid2Lat = Number((startCoord.lat + (endCoord.lat - startCoord.lat) * 0.70).toFixed(4));
            const mid2Lon = Number((startCoord.lon + (endCoord.lon - startCoord.lon) * 0.70).toFixed(4));

            const intercityStops = [
                { name: startName, lat: startCoord.lat, lon: startCoord.lon, gercekMesafeSonraki: Math.round(exactKm * 0.4) },
                { name: intermediates[0], lat: mid1Lat, lon: mid1Lon, gercekMesafeSonraki: Math.round(exactKm * 0.4) },
                { name: intermediates[1] || "Bölge Geçiş Noktası", lat: mid2Lat, lon: mid2Lon, gercekMesafeSonraki: Math.round(exactKm * 0.2) },
                { name: endName, lat: endCoord.lat, lon: endCoord.lon, gercekMesafeSonraki: 0 }
            ];

            const corridorCode = targetProvince.substring(0, 3).toUpperCase();
            const routeId = `intercity_${originProvince}_${targetProvince}_${Date.now()}`;
            const regionalRoute = {
                id: routeId,
                hatNo: `${corridorCode}-EXP`,
                name: `Şehirlerarası Sefer: ${originProvince} ➔ ${targetProvince}`,
                rawName: `Şehirlerarası Sefer: ${originProvince} - ${targetProvince}`,
                district: "Şehirlerarası",
                originDistrict: originProvince,
                destDistrict: targetProvince,
                isDistrict: true,
                isIntercity: true,
                color: "#f59e0b",
                startStop: startName,
                endStop: endName,
                intermediateStops: intermediates,
                totalKm: exactKm,
                biletFiyat: Math.round(exactKm * 1.5),
                biletFiyatMultiplier: 5.0,
                otobusKapasitesi: 46,
                terrain: "asfalt",
                desc: `Şehirlerarası Sefer Hattı: ${startName} ➔ ${endName}. Toplam mesafe: ${exactKm} kilometre.`,
                speechBriefing: `Şehirlerarası ${originProvince} ${targetProvince} seferi hazırlandı. ${startName} durağından ${endName} durağına. Toplam mesafe ${exactKm} kilometre.`,
                detailedInstructions: `Şehirlerarası Sefer (${startName} ➔ ${endName})
` +
                    `1. Adım: ${startName} peronundan yolcuları alın.
` +
                    `2. Adım: Otoyol güzergahından ${exactKm} km katederek ${endName} terminaline ulaşın.`,
                stops: intercityStops
            };

            if (typeof routesData !== 'undefined') {
                routesData[routeId] = regionalRoute;
            }

            return {
                success: true,
                route: regionalRoute,
                originalRoute: regionalRoute,
                fromStop: startName,
                toStop: endName,
                stopsCount: intercityStops.length,
                dist: exactKm
            };
        }

        const db = (typeof window !== 'undefined' && window.tekulasHatVeritabani && window.tekulasHatVeritabani.length > 0)
            ? window.tekulasHatVeritabani
            : ((typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) ? ilceRotalari["Tekirdağ"] : (typeof routesData !== 'undefined' ? Object.values(routesData) : []));

        if (!db || db.length === 0) {
            return { success: false, message: "Hat veritabanı yüklenemedi." };
        }

        const checkMatch = (stopName, query, hub) => {
            if (!stopName) return false;
            if (query && this.matchStop(stopName, query)) return true;
            if (hub) {
                if (hub.stopName && this.matchStop(stopName, hub.stopName)) return true;
                const sNorm = this.normalizeText(stopName);
                if (hub.keys && hub.keys.some(k => sNorm.includes(k) || k.includes(sNorm))) return true;
            }
            return false;
        };

        const candidates = [];

        db.forEach(route => {
            if (!route.stops || route.stops.length < 2) return;
            // Seviye 10 altındayken ilçe seferleri ve şehirlerarası hatlar tamamen filtrelenir
            if (!hasPassed10 && (route.isDistrict || (route.destDistrict && route.destDistrict !== "Süleymanpaşa") || (route.originDistrict && route.originDistrict !== "Süleymanpaşa"))) return;

            let fromIdx = -1;
            let toIdx = -1;

            for (let i = 0; i < route.stops.length; i++) {
                const s = route.stops[i];
                if (fromIdx === -1 && checkMatch(s.name, neredenQuery, fromHub)) {
                    fromIdx = i;
                }
                if (fromIdx !== -1 && i > fromIdx && checkMatch(s.name, nereyeQuery, toHub)) {
                    toIdx = i;
                }
            }

            if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
                const subStops = route.stops.slice(fromIdx, toIdx + 1);
                const dist = subStops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);
                candidates.push({
                    route: route,
                    fromStop: route.stops[fromIdx].name,
                    toStop: route.stops[toIdx].name,
                    fromIdx: fromIdx,
                    toIdx: toIdx,
                    stopsCount: subStops.length,
                    dist: Math.max(0.8, Math.round(dist * 10) / 10),
                    subStops: subStops
                });
            }
        });

        // İLÇELER ARASI KORİDOR VE EKSPRES BAĞLANTI DESTEĞİ
        if (hasPassed10 && candidates.length === 0 && fromHub && toHub && fromHub.district !== toHub.district) {
            const interDistrict = db.find(r => 
                (r.id === "hat_saray_ekspres" && fromHub.district === "Süleymanpaşa" && toHub.district === "Saray") ||
                ((r.hatNo === "26" || r.hatNo === "226") && fromHub.district === "Süleymanpaşa" && toHub.district === "Saray") ||
                ((r.hatNo === "26" || r.hatNo === "226" || r.id === "hat_saray_ekspres") && fromHub.district === "Saray" && toHub.district === "Süleymanpaşa") ||
                ((r.originDistrict === fromHub.district && r.destDistrict === toHub.district) || (r.destDistrict === fromHub.district && r.originDistrict === toHub.district))
            );
            if (interDistrict && interDistrict.stops && interDistrict.stops.length > 1) {
                const isReverse = (interDistrict.destDistrict === fromHub.district && interDistrict.originDistrict === toHub.district);
                const activeStops = isReverse ? [...interDistrict.stops].reverse() : interDistrict.stops;
                candidates.push({
                    route: interDistrict,
                    fromStop: activeStops[0].name,
                    toStop: activeStops[activeStops.length - 1].name,
                    fromIdx: 0,
                    toIdx: activeStops.length - 1,
                    stopsCount: activeStops.length,
                    dist: interDistrict.totalKm || 62,
                    subStops: activeStops
                });
            }
        }

        if (candidates.length === 0) {
            return { 
                success: false, 
                message: `"${neredenQuery}" ile "${nereyeQuery}" arasında doğrudan bir hat bulunamadı. Lütfen durak isimlerini kontrol edin.` 
            };
        }

        // En direkt ve uygun adayı seç (İlçeler arası tam eşleşme öncelikli)
        candidates.sort((a, b) => {
            const aExact = (fromHub && toHub && a.route.originDistrict === fromHub.district && a.route.destDistrict === toHub.district) ? 1 : 0;
            const bExact = (fromHub && toHub && b.route.originDistrict === fromHub.district && b.route.destDistrict === toHub.district) ? 1 : 0;
            if (aExact !== bExact) return bExact - aExact;
            return a.stopsCount - b.stopsCount;
        });
        const best = candidates[0];

        // Bu rota için özelleştirilmiş yeni bir simülasyon rotası üret
        const smartStops = [];
        for (let j = 0; j < best.subStops.length; j++) {
            const orig = best.subStops[j];
            const isFirst = j === 0;
            const isLast = j === best.subStops.length - 1;

            let anons = `Sonraki durak: ${orig.name}.`;
            if (isFirst) {
                anons = `${best.fromStop} kalkış peronundayız. Hat ${best.route.hatNo} ile ${best.toStop} seferi başlıyor.`;
            } else if (isLast) {
                anons = `Son durak: ${best.toStop}. Seferimiz tamamlanmıştır. Lütfen eşyalarınızı unutmayınız.`;
            } else if (orig.anons && !orig.anons.includes("seferi başlıyor") && !orig.anons.includes("tamamlanmıştır")) {
                anons = orig.anons;
            }

            smartStops.push({
                name: orig.name,
                anons: anons,
                bekleyenYolcu: isFirst ? 20 : (isLast ? 0 : (((j * 3 + 2) % 5) + 1)),
                inenYolcu: isFirst ? 0 : (isLast ? 20 : (((j * 2 + 1) % 4) + 1)),
                gercekMesafeSonraki: isLast ? 0 : (orig.gercekMesafeSonraki || 0.8),
                lat: orig.lat,
                lon: orig.lon
            });
        }

        const smartId = `smart_${best.route.id}_${best.fromIdx}_${best.toIdx}`;
        const smartRoute = {
            id: smartId,
            hatNo: best.route.hatNo,
            name: `Akıllı Rota: ${best.fromStop} ➔ ${best.toStop}`,
            rawName: `${best.route.name} (${best.fromStop} - ${best.toStop})`,
            district: best.route.district,
            originDistrict: best.route.district,
            destDistrict: best.route.district,
            isDistrict: best.route.isDistrict,
            isCity: best.route.isCity,
            sehir: best.route.sehir || "Tekirdağ",
            color: "#38bdf8",
            startStop: best.fromStop,
            endStop: best.toStop,
            intermediateStops: smartStops.slice(1, -1).map(s => s.name),
            totalKm: best.dist,
            biletFiyat: 39,
            biletFiyatMultiplier: 1.0,
            otobusKapasitesi: 36,
            terrain: "asfalt",
            desc: `Akıllı Rota Sistemi: ${best.fromStop} ➔ ${best.toStop}. Hat ${best.route.hatNo} ile ${smartStops.length} durak, ${best.dist} km.`,
            speechBriefing: `Akıllı rota oluşturuldu. ${best.fromStop} durağından ${best.toStop} durağına Hat ${best.route.hatNo} ile seferiniz başlıyor. Toplam ${smartStops.length} durak, ${best.dist} kilometre.`,
            detailedInstructions: `Akıllı Rota (Hat ${best.route.hatNo})\n` +
                smartStops.map((s, idx) => `${idx + 1}. Adım: ${s.name}`).join('\n'),
            stops: smartStops
        };

        if (typeof routesData !== 'undefined') {
            routesData[smartId] = smartRoute;
        }

        return {
            success: true,
            route: smartRoute,
            originalRoute: best.route,
            fromStop: best.fromStop,
            toStop: best.toStop,
            stopsCount: smartStops.length,
            dist: best.dist
        };
    },

    baslat: function(neredenQuery, nereyeQuery) {
        const res = this.hesapla(neredenQuery, nereyeQuery);
        if (!res.success) {
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(res.message);
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(res.message, "warning");
            }
            return false;
        }

        // PEDAGOJİK SEVİYE KONTROLÜ: Akıllı rota kilitli bir seviyeyi açamaz
        if (typeof Game !== 'undefined' && typeof Game.isRouteAccessible === 'function') {
            const check = Game.isRouteAccessible(res.route.id);
            if (!check.allowed) {
                if (typeof audio !== 'undefined' && audio.playWarning) {
                    try { audio.playWarning(); } catch(e) {}
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(check.reason);
                }
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast(check.reason, "warning");
                }
                return false;
            }
        }

        this.closeModal();

        const msg = `Akıllı rota hazır: ${res.fromStop} durağından ${res.toStop} durağına Hat ${res.route.hatNo} ile ${res.stopsCount} duraklık sefer başlıyor. Toplam ${res.dist} kilometre. İyi yolculuklar kaptan.`;
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(msg);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`Akıllı Rota: ${res.fromStop} ➔ ${res.toStop} (Hat ${res.route.hatNo})`, "success");
        }

        if (typeof AkilliSistem !== 'undefined' && AkilliSistem.autoAssignBusForRoute) {
            AkilliSistem.autoAssignBusForRoute(res.route);
        }
        if (typeof Game !== 'undefined' && Game.startRoute) {
            Game.startRoute(res.route.id);
        }
        return true;
    },

        updateDistrictUI: function() {
        const activeDist = this.getActiveDistrict();
        const hasPassed10 = (typeof Game !== 'undefined' && Game.hasPassedLevel10) ? Game.hasPassedLevel10() : false;

        // Sekme butonlarını güncelle
        ['spasa', 'saray', 'velimese', 'intercity'].forEach(tabKey => {
            const btn = document.getElementById('tab-dist-' + tabKey);
            if (!btn) return;
            if (tabKey === 'intercity') {
                btn.style.display = hasPassed10 ? 'inline-block' : 'none';
            }
            const isMatch = (tabKey === 'spasa' && activeDist === 'Süleymanpaşa') ||
                            (tabKey === 'saray' && activeDist === 'Saray') ||
                            (tabKey === 'velimese' && activeDist === 'Velimeşe') ||
                            (tabKey === 'intercity' && activeDist === 'all');

            if (isMatch) {
                btn.style.background = 'rgba(56,189,248,0.3)';
                btn.style.borderColor = '#38bdf8';
                btn.style.color = '#fff';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.background = 'rgba(255,255,255,0.06)';
                btn.style.borderColor = 'rgba(255,255,255,0.2)';
                btn.style.color = '#94a3b8';
                btn.style.fontWeight = 'normal';
            }
        });

        // Datalist doldur (Sadece seçili bölgenin mahalle ve ana durakları)
        const datalist = document.getElementById('smart-stops-datalist');
        if (datalist) {
            datalist.innerHTML = '';
            const stops = this.getAllStops();
            stops.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                datalist.appendChild(opt);
            });
        }

        // Popüler merkez butonları (Seçili bölgeye özel)
        const pillsContainer = document.getElementById('smart-pills-container');
        if (pillsContainer) {
            pillsContainer.innerHTML = '';
            let popularStops = [];
            if (activeDist === 'Saray') {
                popularStops = [
                    "Ayaspaşa Çarşı",
                    "Saray Otogarı",
                    "Saray Devlet Hastanesi",
                    "Saray Fakülte Kampüsü",
                    "100. Yıl Parklar",
                    "Büyükyoncalı Merkez",
                    "Çukuryurt Meydan"
                ];
            } else if (activeDist === 'Velimeşe') {
                popularStops = [
                    "Velimeşe Merkez",
                    "Velimeşe Sanayi Bölgesi",
                    "Velimeşe TOKİ Konutları"
                ];
            } else if (activeDist === 'all' && hasPassed10) {
                popularStops = [
                    "Değirmenaltı Kampüs",
                    "Valilik & Hükümet Cd.",
                    "Süleymanpaşa Otogar",
                    "Saray Otogarı",
                    "Saray Devlet Hastanesi",
                    "Çorlu Otogarı",
                    "Çerkezköy Otogarı"
                ];
            } else {
                popularStops = [
                    "Değirmenaltı Kampüs",
                    "Valilik & Hükümet Cd.",
                    "Şehir Hastanesi",
                    "Süleymanpaşa Otogar",
                    "Köprübaşı & Çarşı",
                    "Atatürk Spor Salonu",
                    "Altınova Sahil",
                    "Baykallar & Emniyet"
                ];
            }

            popularStops.forEach(st => {
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = 'modern-btn';
                pill.style.padding = '5px 10px';
                pill.style.fontSize = '0.85rem';
                pill.style.background = 'rgba(56,189,248,0.15)';
                pill.style.border = '1px solid rgba(56,189,248,0.4)';
                pill.style.color = '#38bdf8';
                pill.innerText = st;
                pill.onclick = () => {
                    const fromInput = document.getElementById('smart-from-input');
                    const toInput = document.getElementById('smart-to-input');
                    if (!fromInput.value) {
                        fromInput.value = st;
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Kalkış: ${st}`);
                        toInput.focus();
                    } else {
                        toInput.value = st;
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Varış: ${st}`);
                    }
                };
                pillsContainer.appendChild(pill);
            });
        }

        // Placeholder güncelle
        const fromInput = document.getElementById('smart-from-input');
        const toInput = document.getElementById('smart-to-input');
        if (fromInput && toInput) {
            if (activeDist === 'Saray') {
                fromInput.placeholder = "Örn: Ayaspaşa Çarşı, Saray Otogar, Büyükyoncalı...";
                toInput.placeholder = "Örn: Saray Devlet Hastanesi, Fakülte Kampüs...";
            } else if (activeDist === 'Velimeşe') {
                fromInput.placeholder = "Örn: Velimeşe Merkez Meydan, Çetin Sokak...";
                toInput.placeholder = "Örn: Velimeşe TOKİ Konutları, Sanayi Bölgesi...";
            } else {
                fromInput.placeholder = "Örn: Değirmenaltı Kampüs, Valilik & Hükümet Cd....";
                toInput.placeholder = "Örn: Şehir Hastanesi, Atatürk Spor Salonu...";
            }
        }
    },

    openModal: function() {
        const modal = document.getElementById('smart-route-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        this.updateDistrictUI();

        const fromInput = document.getElementById('smart-from-input');
        if (fromInput) {
            fromInput.focus();
        }

        const activeDist = this.getActiveDistrict();
        const speechNotice = `Akıllı Rota Sistemi açıldı. Aktif bölgeniz: ${activeDist}. Sadece bu bölgenin mahalle ve durakları listeleniyor. Ara durakları sürüş esnasında keşfedeceksiniz.`;
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(speechNotice);
        }
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    closeModal: function() {
        const modal = document.getElementById('smart-route-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    init: function() {
                // Bölge Seçim Sekmeleri Dinleyicileri
        const tabConfigs = [
            { id: 'tab-dist-spasa', dist: 'Süleymanpaşa', name: 'Süleymanpaşa' },
            { id: 'tab-dist-saray', dist: 'Saray', name: 'Saray' },
            { id: 'tab-dist-velimese', dist: 'Velimeşe', name: 'Velimeşe' },
            { id: 'tab-dist-intercity', dist: 'all', name: 'Tüm İlçeler' }
        ];

        tabConfigs.forEach(tc => {
            const btn = document.getElementById(tc.id);
            if (btn) {
                btn.addEventListener('click', () => {
                    if (typeof Game !== 'undefined' && Game.setActiveDistrict) {
                        Game.setActiveDistrict(tc.dist);
                    } else {
                        localStorage.setItem('activeDistrict', tc.dist);
                        this.updateDistrictUI();
                    }
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak(`Bölge değiştirildi: ${tc.name}. Sadece ${tc.name} mahalle ve durakları listeleniyor.`);
                    }
                });
            }
        });

        const btnOpen = document.getElementById('btn-open-smart-route');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => this.openModal());
        }

        const btnClose = document.getElementById('btn-smart-modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        const btnCancel = document.getElementById('btn-smart-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.closeModal());
        }

        const btnRecommend = document.getElementById('btn-smart-recommend');
        if (btnRecommend) {
            btnRecommend.addEventListener('click', () => {
                this.closeModal();
                if (typeof AkilliSistem !== 'undefined' && AkilliSistem.recommendSmartRoute) {
                    AkilliSistem.recommendSmartRoute();
                }
            });
        }

        const btnCalc = document.getElementById('btn-smart-calculate');
        if (btnCalc) {
            btnCalc.addEventListener('click', () => {
                const fromVal = (document.getElementById('smart-from-input') || {}).value;
                const toVal = (document.getElementById('smart-to-input') || {}).value;
                this.baslat(fromVal, toVal);
            });
        }

        ['smart-from-input', 'smart-to-input'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const fromVal = (document.getElementById('smart-from-input') || {}).value;
                        const toVal = (document.getElementById('smart-to-input') || {}).value;
                        if (id === 'smart-from-input' && !toVal) {
                            document.getElementById('smart-to-input').focus();
                        } else {
                            this.baslat(fromVal, toVal);
                        }
                    }
                });
            }
        });
    }
};

if (typeof window !== 'undefined') {
    window.AkilliRotaSistemi = AkilliRotaSistemi;
    document.addEventListener('DOMContentLoaded', () => {
        AkilliRotaSistemi.init();
    });
}


// Velimeşe 100 Sokak Hızlı Mod Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnV = document.getElementById('btn-velimese-quick-mode');
        if (btnV) {
            btnV.addEventListener('click', () => {
                if (typeof Game !== 'undefined' && !Game.hasPassedLevel10()) return;
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Velimeşe Çetin Sokak";
                    toInput.value = "Velimeşe TOKİ 233. Sokak";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Velimeşe 100 Sokak İçi Ulaşım Modu devrede. Kalkış: Çetin Sokak, Varış: TOKİ 233. Sokak. Dilerseniz sokakları değiştirebilirsiniz.");
                    }
                }
            });
        }
    });
}


// Süleymanpaşa Hızlı Mod Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnSp = document.getElementById('btn-spasa-quick-mode');
        if (btnSp) {
            btnSp.addEventListener('click', () => {
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Üniversite Caddesi";
                    toInput.value = "Yeni Otogar Caddesi";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Süleymanpaşa 7 Mahalle Sefer Modu devrede. Kalkış: Üniversite Caddesi Kampüs, Varış: Yeni Otobüs Terminali. Toplam mesafe ve süre formülle hesaplanıyor.");
                    }
                }
            });
        }
    });
}

// Saray 62 KM Direkt Ekspres Hızlı Mod Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnS = document.getElementById('btn-saray-quick-mode');
        if (btnS) {
            btnS.addEventListener('click', () => {
                if (typeof Game !== 'undefined' && !Game.hasPassedLevel10()) return;
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Süleymanpaşa Yeni Otobüs Terminali";
                    toInput.value = "Saray Belediyesi Otogarı";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Süleymanpaşa Saray 62 kilometre direkt ekspres hattı devrede. Kalkış: Süleymanpaşa Yeni Otogar, Varış: Saray Belediyesi Otogarı.");
                    }
                }
            });
        }
    });
}

// Saray Şehir İçi Sefer Modu Butonu
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnSm = document.getElementById('btn-saray-mahalle-mode');
        if (btnSm) {
            btnSm.addEventListener('click', () => {
                const fromInput = document.getElementById('smart-from-input');
                const toInput = document.getElementById('smart-to-input');
                if (fromInput && toInput) {
                    fromInput.value = "Saray Otogar 1 (Giriş Peronu)";
                    toInput.value = "Saray Devlet Hastanesi Ana Giriş";
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak("Saray Şehir İçi 25 Duraklı Sefer Modu devrede. Kalkış: Saray Otogarı, Varış: Saray Devlet Hastanesi. Dilerseniz durakları değiştirebilirsiniz.");
                    }
                }
            });
        }
    });
}

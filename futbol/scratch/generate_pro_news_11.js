const fs = require('fs');

const categories = {
    transfer: {
        prefixes: ["BOMBA PATLADI!", "YILIN ÇALIMI!", "UÇAK BİLETİ KESİLDİ!", "FLAŞ İDDİA!", "TRANSFERDE SICAK SAATLER!", "BÜYÜK OPERASYON!"],
        subjects: ["Avrupa devi", "Ezeli rakip", "Süper Lig ekibi", "Körfez sermayesi", "Yönetim", "Başkan"],
        actions: ["menajerle masaya oturdu.", "yıldız oyuncuyla prensipte anlaştı.", "sözleşme şartlarında pürüz yaşadı.", "bonservis pazarlıklarına başladı.", "imza parası için dev bir bütçe ayırdı."],
        conclusions: ["Taraftar sosyal medyada çıldırdı, uçak nöbeti başladı.", "Bu transfer gerçekleşirse ligin dengeleri tamamen değişecek.", "İmza an meselesi, gözler yapılacak KAP açıklamasında.", "Ancak araya giren menajerler işi yokuşa sürüyor."]
    },
    kulis: {
        prefixes: ["SOYUNMA ODASI KARIŞTI!", "HOCANIN BİLETİ KESİLDİ!", "BÜYÜK ŞOK!", "İSYAN BAYRAĞI AÇILDI!", "TESİSLERDE KRİZ!"],
        subjects: ["Takım kaptanı", "Yıldız golcü", "Yabancı oyuncu grubu", "Yönetim kurulu", "Sportif direktör"],
        actions: ["teknik direktörle idmanda tartıştı.", "hocanın sistemine açıkça isyan etti.", "tesisleri sinirle terk etti.", "başkanla gizli bir toplantı yaptı.", "kadro dışı kalma tehlikesiyle karşı karşıya."],
        conclusions: ["Takım içindeki bu gruplaşma maç skorlarına da yansıyacak gibi duruyor.", "Hocanın artık ipleri elinden kaçırdığı konuşuluyor.", "Yönetim acil bir karar almak için toplanıyor.", "Bu saatten sonra o soyunma odasından hayır gelmez."]
    },
    hakem: {
        prefixes: ["KARA GECE!", "HAKEM CİNAYETİ!", "VAR KAYITLARI SIZDI!", "PFDK CEZALARI AÇIKLADI!", "DÜDÜK ASACAK!"],
        subjects: ["Merkez Hakem Kurulu", "Maçın tartışmalı hakemi", "TFF yönetimi", "Disiplin kurulu", "VAR hakemi"],
        actions: ["verdiği skandal kararla maçı katletti.", "gözlemci raporuna göre sınıfta kaldı.", "ağır küfür ve hakaretten dolayı 3 maç men cezası verdi.", "penaltı pozisyonunda oyunu devam ettirerek eyyam yaptı.", "istifa dilekçesini masaya koydu."],
        conclusions: ["Spor kamuoyu bu skandalın ardından ayağa kalktı.", "Rakip takım yönetimi TFF binasına yürüyüş başlattı.", "Kulüpler Birliği acil koduyla toplanma kararı aldı.", "Bu saatten sonra o hakeme bir daha maç verilmesi zor."]
    },
    sakatlik: {
        prefixes: ["KÖTÜ HABER!", "SEZONU KAPATTI!", "SAĞLIK KURULUNDAN AÇIKLAMA!", "ŞOK SAKATLIK!", "MR SONUCU BELLİ OLDU!"],
        subjects: ["Takımın maestrosu", "Gol makinesi", "Milli stoper", "Yeni transfer", "Tecrübeli eldiven"],
        actions: ["idmanda girdiği ikili mücadelede acı içinde yerde kaldı.", "arka adalesindeki yırtık sebebiyle en az 6 hafta sahalardan uzak kalacak.", "çapraz bağlarını kopardı ve ameliyat masasına yatacak.", "eski sakatlığı nüksettiği için derbide forma giyemeyecek."],
        conclusions: ["Hocanın tüm taktik planları altüst oldu.", "Yönetim bu sakatlık sonrası acil transfer arayışına girdi.", "Taraftarlar yıldız oyuncunun yokluğunda umutsuzluğa kapıldı.", "Sağlık ekibinin raporu teknik heyeti kara kara düşündürüyor."]
    },
    finans: {
        prefixes: ["FFP KISKACI!", "DEV SPONSORLUK!", "KASAYA MİLYONLAR GİRDİ!", "İFLASIN EŞİĞİNDE!", "STAT İSİM HAKKI SATILDI!"],
        subjects: ["Kulüp başkanı", "Mali işler sorumlusu", "Global teknoloji devi", "Arap fonu", "Bankalar Birliği"],
        actions: ["dev bir sponsorluk anlaşmasına imza attı.", "borç yapılandırması için masaya oturdu.", "FFP kısıtlamaları nedeniyle transfer tahtasını kapattı.", "stadın isim hakkını astronomik bir bedelle satın aldı."],
        conclusions: ["Kasaya giren bu taze para, ocak ayında yıldız transferlerinin habercisi.", "Bu ekonomik dar boğaz kulübü uçuruma sürüklüyor.", "Yönetim mali tabloları düzeltmek için yıldız isimleri satmak zorunda kalabilir.", "Ekonomik bağımsızlık yolunda atılan bu adım alkış topladı."]
    },
    taktik: {
        prefixes: ["TAKTİK ANALİZ:", "xG VERİLERİ ŞOK ETTİ!", "ISI HARİTASI YALAN SÖYLEMEZ!", "SAHADA SATRANÇ!", "SİSTEM DEĞİŞİKLİĞİ!"],
        subjects: ["Veri analistleri", "Ünlü spor yorumcusu", "Avrupalı futbol akademisyenleri", "Teknik ekip", "Scout şefi"],
        actions: ["takımın pas ağlarının merkezden koptuğunu kanıtladı.", "Gol Beklentisi (xG) verilerinin sahadaki skoru yansıtmadığını ortaya koydu.", "yeni 3-5-2 sisteminin takımın kimyasına uymadığını raporladı.", "oyuncuların ısı haritalarında geriye dönmediklerini belgeledi."],
        conclusions: ["Bu veriler ışığında hocanın acilen oyun planını değiştirmesi gerekiyor.", "Rakamlar yalan söylemez, takım üretkenlik sorununu aşamıyor.", "Matematiksel olarak bu futbolla şampiyon olmak bir mucize.", "Modern futbolun gereksinimlerine ayak uyduramayanlar elenmeye mahkum."]
    },
    mac: {
        prefixes: ["Nefes Kesen Maç:", "Sessiz Gece:", "Fırtına Gibi Esti:", "Tarihi Fark:", "Kabus Gibi Bir İlk Yarı:"],
        subjects: ["Ev sahibi ekip", "Deplasman takımı", "Şampiyonluğun güçlü adayı", "Ligin dibindeki takım", "Düşme hattındaki ekip"],
        actions: ["90 dakika boyunca sahada adeta rakibini dövdü.", "ilk yarıda bulduğu 3 golle fişi erken çekti.", "kaleyi bulan tek şut çekemeden 90 dakikayı tamamladı.", "taraftarının müthiş desteğiyle sahadan 3 puanı söküp aldı."],
        conclusions: ["Bu galibiyet puan durumunda zirveyi yeniden şekillendirdi.", "Eleştirilen teknik direktör bu skorla derin bir nefes aldı.", "Tribünlerden maç sonu yükselen ıslıklar yönetimi istifaya çağırdı.", "Sahadaki oyun, tribündeki coşkuyla birleşince ortaya muazzam bir şölen çıktı."]
    },
    milli: {
        prefixes: ["MİLLİ TAKIM KAMPINDA SÜRPRİZ!", "DÜNYA KUPASI ATEŞİ!", "DEV TURNUVAYA DOĞRU!", "MİLLİ HEYECAN!", "ADAY KADRO AÇIKLANDI!"],
        subjects: ["A Milli Takım teknik direktörü", "Ay-yıldızlı ekip", "Rakiplerimizin analizi", "Turnuvanın ev sahibi", "Gurbetçi yıldızımız"],
        actions: ["kadroda köklü bir revizyona giderek gençlere yer verdi.", "kampta motivasyon toplantısı düzenledi.", "sakatlanan iki önemli ismi kadrodan çıkardı.", "turnuva öncesi son hazırlık maçında güven tazeledi."],
        conclusions: ["Taraftarlar bu turnuvada tarihi bir başarı bekliyor.", "Dünya Kupası vizesi almak için artık hata yapma lüksümüz yok.", "Gözler tamamen ay-yıldızlı armanın sahada vereceği mücadeleye çevrildi.", "Turnuva ağacındaki muhtemel rakiplerimiz hiç de kolay değil."]
    },
    roportaj: {
        prefixes: ["ÖZEL RÖPORTAJ:", "GÖZYAŞLARIYLA ANLATTI!", "YOKLUKTAN ZİRVEYE!", "PORTRE:", "SESSİZLİĞİNİ BOZDU!"],
        subjects: ["Ligin efsane golcüsü", "Takımın yeni yıldızı", "Emektar malzeme sorumlusu", "Genç yetenek", "Kurt teknik direktör"],
        actions: ["çocukluğunda yaşadığı zorlukları içtenlikle paylaştı.", "saha dışındaki bilinmeyen hayat felsefesini ilk kez anlattı.", "eski kulübünden neden ayrıldığını gözyaşları içinde itiraf etti.", "futbolu bıraktıktan sonraki hedeflerini açıkladı."],
        conclusions: ["Bu samimi açıklamalar taraftarın ona olan sevgisini daha da perçinledi.", "Yeşil sahanın sadece bir oyun olmadığını bir kez daha kanıtladı.", "Okuyanların boğazını düğümleyen bu hayat hikayesi güne damga vurdu.", "Yıldız ismin arkasındaki gerçek karakter nihayet anlaşıldı."]
    },
    taraftar: {
        prefixes: ["TRİBÜNLERDEN GÖZDAĞI!", "GÖRSEL ŞÖLEN!", "DEPLASMAN ÇİLESİ!", "TARAFTAR İSYANDA!", "ÖLÜMÜNE SEVDA!"],
        subjects: ["Ateşli taraftar grubu", "Kale arkası tribünü", "Dernek üyeleri", "Binlerce sevdalı", "Tribün liderleri"],
        actions: ["geceden itibaren stadın önünde uzun kuyruklar oluşturdu.", "rakip takımı korkutan devasa bir üç boyutlu koreografi hazırladı.", "yönetimi istifaya davet eden bir yürüyüş düzenledi.", "15 saatlik otobüs yolculuğuyla takımlarını yalnız bırakmadı."],
        conclusions: ["Futbolun asıl sahibinin taraftar olduğu bir kez daha anlaşıldı.", "Bu inanılmaz destek takımın ateşleyici gücü olacak.", "Yönetimin bu sese kulak tıkaması artık imkansız.", "Stadyumda oluşan bu muazzam atmosfer Avrupa basınında bile yer buldu."]
    },
    yerel: {
        prefixes: ["ŞEHRİN TAKIMI!", "AMATÖR RUH!", "ALT LİGDE ŞAMPİYONLUK YARIŞI!", "TESİSLEŞME HAMLESİ!", "KASABADA BAYRAM HAVASI!"],
        subjects: ["Yerel lig temsilcisi", "Bölgesel amatör lig ekibi", "Şehrin köklü takımı", "Belediye başkanı", "Semt takımı"],
        actions: ["kritik deplasmandan puan çıkararak lige tutundu.", "yeni altyapı tesislerinin temelini coşkuyla attı.", "hafta sonu oynanacak şampiyonluk maçı için şehri bayraklarla donattı.", "taraftarının maddi desteğiyle iflastan kurtuldu."],
        conclusions: ["Büyük paraların değil, tutkunun kazandığı bu ligde heyecan dorukta.", "Şehir halkı pazar günü oynanacak kritik maça kilitlendi.", "Bu başarı hikayesi ulusal medyanın da dikkatini çekmeye başladı.", "Altyapıya yapılan bu yatırımlar Türk futbolunun kurtuluşu olabilir."]
    }
};

let generatedNews = new Set();

// Kategori sayımız 11'e çıktı. Haber havuzunu 300'e çıkarıyoruz.
let totalNewsCount = 300;
let limitPerCategory = Math.ceil(totalNewsCount / Object.keys(categories).length);

for (let key in categories) {
    let cat = categories[key];
    for (let i = 0; i < limitPerCategory; i++) {
        let p = cat.prefixes[Math.floor(Math.random() * cat.prefixes.length)];
        let s = cat.subjects[Math.floor(Math.random() * cat.subjects.length)];
        let a = cat.actions[Math.floor(Math.random() * cat.actions.length)];
        let c = cat.conclusions[Math.floor(Math.random() * cat.conclusions.length)];
        let newsText = p + " " + s + " " + a + " " + c;
        generatedNews.add(newsText);
    }
}

// Ensure exactly totalNewsCount items (fill remaining randomly)
while(generatedNews.size < totalNewsCount) {
    let keys = Object.keys(categories);
    let randomKey = keys[Math.floor(Math.random() * keys.length)];
    let cat = categories[randomKey];
    
    let p = cat.prefixes[Math.floor(Math.random() * cat.prefixes.length)];
    let s = cat.subjects[Math.floor(Math.random() * cat.subjects.length)];
    let a = cat.actions[Math.floor(Math.random() * cat.actions.length)];
    let c = cat.conclusions[Math.floor(Math.random() * cat.conclusions.length)];
    
    generatedNews.add(p + " " + s + " " + a + " " + c);
}

// Convert Set to Array and shuffle
let newsArray = Array.from(generatedNews);
for (let i = newsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newsArray[i], newsArray[j]] = [newsArray[j], newsArray[i]];
}

// Keep only the required amount
newsArray = newsArray.slice(0, totalNewsCount);

const jsContent = "window.dailyNewsPool = " + JSON.stringify(newsArray, null, 4) + ";\n";
fs.writeFileSync('js/news_data.js', jsContent, 'utf8');
console.log(totalNewsCount + ' Clickbait Turkish Sports News generated with all 11 categories!');

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
    }
};

let generatedNews = new Set();
let limitPerCategory = Math.ceil(200 / Object.keys(categories).length);

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

// Ensure exactly 200 items (fill remaining randomly)
while(generatedNews.size < 200) {
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

// Keep only 200
newsArray = newsArray.slice(0, 200);

const jsContent = "window.dailyNewsPool = " + JSON.stringify(newsArray, null, 4) + ";\n";
fs.writeFileSync('js/news_data.js', jsContent, 'utf8');
console.log('200 Clickbait Turkish Sports News generated!');

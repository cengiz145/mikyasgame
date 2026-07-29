const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');

// 1. Assign scout profile randomly if not set
let target1 = `    if (!window.scoutProfile) {
        window.scoutProfile = "tribun_kurdu"; // Şu anlık sadece bu var, gelecekte eklenecek
    }`;
let replacement1 = `    if (!window.scoutProfile) {
        window.scoutProfile = Math.random() < 0.5 ? "tribun_kurdu" : "veri_analisti";
    }`;
content = content.replace(target1, replacement1);

// 2. Add pool_veri_analisti and update the pool selection
let target2 = `    const pool = window.scoutProfile === "tribun_kurdu" ? pool_tribun_kurdu : {`;

let replacement2 = `    const pool_veri_analisti = {
        wonderkid: {
            intro: ["Hocam, StatsBomb verilerini ve Wyscout kliplerini detaylı analiz ettik. Algoritmalar yanılmaz.", "Bu oyuncunun 90 dakika başına xG (Gol Beklentisi) katkısı, kendi yaş grubunda Avrupa'da top %1'de.", "Progresif pas verileri ve dar alandaki isabet oranı tam bir dahiye işaret ediyor."],
            mid: ["Topu üçüncü bölgeye taşıma becerisi muazzam, asimetrik pres karşısında bile pas isabeti %92.", "Gözle görülmeyen ama sistemin dişlilerini kusursuz çalıştıran bir veri harikası.", "Kilit pas (Key Passes) ortalaması elit seviyede, skor üretimimizi doğrudan artıracaktır."],
            outro: ["Veri departmanımızın kesin onayını almıştır. Yatırım getirisi (ROI) çok yüksek olacaktır.", "Matematik yalan söylemez, sistemimize kusursuz entegre olur. Hemen alınmalı.", "Parametreleri bu kadar kusursuz bir profili kaçırmamalıyız, derhal imza attıralım."]
        },
        high_pot: {
            intro: ["Parametreleri çok dengeli, gelişime açık bir profil.", "Geniş veri havuzumuzda belirlediğimiz özel filtrelerden geçmeyi başaran nadir isimlerden.", "Özellikle hücum pres (PPDA) verilerinde elit bir seviyeye çıkma potansiyeli var."],
            mid: ["Taktiksel sadakati istatistiklere yansıyor, savunma geçişlerinde harika konumlanıyor.", "Zayıf ayağını kullanım oranı biraz düşük ama antrenman algoritmalarıyla düzeltilebilir.", "Sistemimize uyum sağladığında verimliliği (Efficiency) %30 oranında artacaktır."],
            outro: ["Uzun vadeli planlamamızda bize çok yüksek bir performans katkısı sağlayacak.", "İstatistiklerin işaret ettiği potansiyele ulaşırsa piyasa değeri tavan yapar.", "Veritabanımızdaki en mantıklı risk/ödül oranına sahip transfer hedeflerinden biri."]
        },
        good_pot: {
            intro: ["Sistemimize rotasyon parçası olarak uyum sağlayacak veriler sunuyor.", "Standart parametrelerin bir tık üzerinde, faydalı bir profil.", "Modellemelerimize göre takımın genel xG üretimine olumlu katkı yapar."],
            mid: ["Gösterişsiz oynuyor ama top kaybı yüzdesi (Turnovers/90) çok düşük.", "Defansif istikrarı iyi, istatistik kağıdını doldurmasa da alanı iyi daraltıyor.", "Taktiksel antrenmanlarımızla verimliliğini belirli bir eşiğe kadar artırabiliriz."],
            outro: ["Maliyet/Performans analizi sonucunda yedek kulübemiz için onaylanmıştır.", "Düşük riskli, istatistiksel olarak tutarlı bir yedek oyuncu profili.", "Uygun bir bedelle rotasyonumuza veri derinliği katabilir."]
        },
        capped_youth: {
            intro: ["Veritabanımızda yaptığı hatalar çok net gözüküyor, algoritmalar onay vermedi.", "Isı haritası çok dağınık, oyunda kalma süresi (Active Time) çok yetersiz.", "Kağıt üzerinde genç duruyor ancak verileri hiçbir gelişme trendi göstermiyor."],
            mid: ["İkili mücadele kazanma yüzdesi çok düşük, sistemimizin dayanıklılık testlerinden geçemez.", "Üçüncü bölgedeki karar verme mekanizması zayıf, pas hataları (xPass eksisi) takıma zarar verir.", "Gelişim eğrisi (Growth Curve) düzleşmiş durumda, potansiyel tavanına şimdiden ulaşmış."],
            outro: ["Analiz departmanımız bu transfere kesinlikle ret oyu veriyor.", "İstatistiksel modelimiz bu oyuncunun takıma katkı sağlamayacağını gösteriyor.", "Zaman ve kaynak israfı olur, listeden çıkaralım."]
        },
        bad_youth: {
            intro: ["Hocam bu oyuncunun Wyscout verilerine bakarken gözlerimiz kanadı.", "Hangi algoritmaya sokarsak sokalım sonuç 'Yetersiz' çıkıyor.", "Sahada kaldığı dakikalar boyunca takıma negatif (-) xG katkısı yapıyor."],
            mid: ["Ne fiziksel dayanıklılık testlerinde ne de pas isabet yüzdesinde asgari şartları sağlıyor.", "Top kazanma parametreleri sıfıra yakın, pres sistemimizi tamamen çökertir.", "Sadece bizim ligimizde değil, hiçbir modern sistemde yeri yok."],
            outro: ["Bu dosyayı kalıcı olarak kapatalım.", "Parametreler bu kadar kötüyken bu transfere onay vermek veriye ihanet olur.", "Altyapımızdaki ortalama bir oyuncunun bile verileri bundan daha parlak."]
        },
        prime_star: {
            intro: ["Şu an kariyerinin pik noktasında, verileri Avrupa'nın en iyileriyle yarışıyor.", "Algoritmalarımız bu oyuncunun sisteme entegre olmasıyla xG değerimizin %40 artacağını hesapladı.", "Sahanın her bölgesinde pozitif etki yaratan tam bir oyun makinesi."],
            mid: ["İleri uçtaki üretkenliği, pres şiddeti ve anahtar pas istatistikleri muazzam seviyede.", "Hiçbir zayıf verisi yok, standart sapması (Standard Deviation) sıfıra yakın.", "Sadece kendi pozisyonunun değil, etrafındaki oyuncuların da verimliliğini artırıyor (Synergy Effect)."],
            outro: ["Matematiksel olarak bu transferin bizi şampiyonluğa taşıma ihtimali %85.", "Bu verilere sahip bir oyuncu için bütçe sınırları zorlanmalıdır.", "Kulübümüzün seviyesini elit kategoriye çıkaracak kusursuz bir veri kümesi."]
        },
        prime_solid: {
            intro: ["Takımın omurgasını sağlamlaştıracak, verileri çok tutarlı bir isim.", "Gözlemcilerimiz belki heyecanlanmaz ama istatistikler bu adamın tam bir görev adamı olduğunu kanıtlıyor.", "Hata payı çok düşük, sahada ne yapacağı önceden tahmin edilebilen güvenilir bir profil."],
            mid: ["Top çalma (Interceptions) ve pozisyon alma verileri sistemimiz için ideal seviyede.", "Skora doğrudan katkı yapmasa da takımın defansif parametrelerini (xGA) ciddi oranda düşürür.", "Saha içi dayanıklılık (Stamina Metric) puanı 90 dakikayı rahat çıkaracağını gösteriyor."],
            outro: ["Analiz raporları bu transferin 'Akıllı Yatırım' olduğunu belirtiyor.", "Takımın temel işleyişi için kesinlikle kadromuzda bulunması gereken bir dişli.", "Fiyat/Performans algoritmasında en üst sıralarda yer alıyor."]
        },
        prime_average: {
            intro: ["Veritabanımızdaki binlerce ortalama oyuncudan bir diğeri.", "İstatistikleri lig ortalamasında seyrediyor, ekstra bir katkı sunmuyor.", "Parametreleri stabil ama tavan noktası düşük."],
            mid: ["Geniş alanda fena değil ama dar alanda (Tight Spaces) pas yüzdesi dramatik şekilde düşüyor.", "Taktiksel görevlerini ortalama bir başarıyla yerine getirir.", "Takımın ana sorunlarını çözemez, sadece sayısal bir eksikliği kapatır."],
            outro: ["Eğer elit bir hedef bulamazsak son çare olarak düşünebiliriz.", "Maliyetine göre değerlendirilmeli, yüksek bedeller ödenmemeli.", "Transfer modellemelerimizde 'zorunlu alternatif' olarak işaretlendi."]
        },
        old_star: {
            intro: ["Fiziksel parametrelerinde ciddi bir düşüş trendi var ama oyun zekası (Game Intelligence) hala elit seviyede.", "Yaşına rağmen anahtar pas ve şans yaratma istatistiklerinde zirveyi zorluyor.", "Sprint mesafeleri kısalmış olsa da doğru konumlanarak (Positioning) bu açığı kapatıyor."],
            mid: ["Top ayağındayken oyunun temposunu kendi algoritmasına göre harika dikte ediyor.", "Pres istatistikleri düşük olduğu için ona defansif yük bindirmeyen bir sistemde kullanılmalı.", "Maçın son 20 dakikasında oyuna girip kilidi açma (Game Changer) metriği çok yüksek."],
            outro: ["Fiziksel düşüşünü göze alıyorsak, salt tecrübesi ve oyun aklı için alınabilir.", "Sahada kaldığı süre boyunca yaratacağı etki, aldığı süreye oranla çok karlı olacaktır.", "Kısa vadeli, hedef odaklı bir hamle."]
        },
        old_declining: {
            intro: ["Wyscout ve fitness verileri maalesef alarm veriyor.", "Fiziksel parametreleri (Sprint/90, İkili Mücadele Kazanma) dibe vurmuş durumda.", "Oyun zekası yerinde olsa da bedeni artık elit seviye futbola reaksiyon veremiyor."],
            mid: ["Defansif geçişlerdeki yavaşlığı (Recovery Pace) yüzünden takımın xGA (Yenilen Gol Beklentisi) oranını artırır.", "Sakattlık geçmişi ve kas yorgunluğu analizleri, sezonun %40'ını kaçıracağını gösteriyor.", "İstatistiksel olarak sahada durması takıma yarardan çok zarar veriyor."],
            outro: ["Adı ne kadar büyük olursa olsun, veriler bu transferi kesin bir dille veto ediyor.", "Geçmiş başarıları için kulübün parasını israf edemeyiz.", "Modern futbolun hızına ayak uyduramaz, listeden çıkarılmalı."]
        }
    };

    const pool = window.scoutProfile === "tribun_kurdu" ? pool_tribun_kurdu : 
                 window.scoutProfile === "veri_analisti" ? pool_veri_analisti : {
        wonderkid: {`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', content, 'utf8');
console.log('Patch scout veri analisti applied successfully.');

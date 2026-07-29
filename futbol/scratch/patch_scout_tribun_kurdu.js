const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');

// 1. Assign scout profile
let target1 = `function generateScoutReportText(p) {`;
let replacement1 = `function generateScoutReportText(p) {
    if (!window.scoutProfile) {
        window.scoutProfile = "tribun_kurdu"; // Şu anlık sadece bu var, gelecekte eklenecek
    }`;
content = content.replace(target1, replacement1);

// 2. Add custom pool for tribun_kurdu
let target2 = `    const pool = {
        wonderkid: {`;

let replacement2 = `    const pool_tribun_kurdu = {
        wonderkid: {
            intro: ["Hocam, bu çocuğu yağmur çamur demeden izledim, yemin ederim onda o ışık var.", "Gözlerime inanamadım, elimdeki not defterini fırlatıp atasım geldi.", "Taktik maktik hikaye, bu çocukta efsane olacak bir yürek var."],
            mid: ["Topu kaybettiğindeki o hırsı, yüzündeki acı ifadeyi görmeliydin. Tam bir savaşçı.", "Rakiple girdiği ikili mücadelelerde gözünü budaktan sakınmıyor, karakteri çok sağlam.", "Maçtan önce saha kenarında tek başına ısınırken bile o aidiyeti ve ciddiyeti hissettiriyor."],
            outro: ["Eğer bu çocuğu kaçırırsak ben mesleği bırakırım hocam.", "Ne yapıp edip bu 'ruhu' takıma kazandırmalıyız, bilgisayardaki verileri boşverin.", "Maliyeti ne olursa olsun alın, bu çocuğun karakteri bize şampiyonluk getirir."]
        },
        high_pot: {
            intro: ["Çamurlu sahaların tozunu yutmuş, çok sağlam bir çocuk.", "Eski günlerdeki gibi, sahada forması terlemeden çıkmıyor.", "Oyun zekasını bilmem ama yüreğiyle oynayan bir genç buldum."],
            mid: ["Hakemle diyaloğu, arkadaşlarına olan tavrı tam bir lider gibi.", "Tekniği biraz eksik olabilir ama o açığı bitmek bilmeyen ciğeriyle kapatıyor.", "Sahada basmadık yer bırakmadı, tam bizim takımın aradığı ruh."],
            outro: ["Kadromuza katarsak formanın hakkını son damlasına kadar verir.", "Bilgisayardaki istatistiklerine bakmayın, çıplak gözle harika bir işçi.", "İleride çok büyük bir savaşçıya dönüşecek, yatırım yapılmalı."]
        },
        good_pot: {
            intro: ["İyi niyetli, sahada elinden geleni yapan bir çocuk.", "Gözüme çok batmadı ama mücadele gücü fena değil.", "Not defterime 'denenebilir' diye düştüm."],
            mid: ["Teknik kapasitesi sınırlı ama formaya küsmez.", "Yedek kalsa bile sorun çıkarmaz, antrenmanda aslan gibi çalışır.", "Maç içinde oyundan düştüğü oluyor ama hırsıyla tekrar toparlıyor."],
            outro: ["Rotasyonda görev adamı olarak işimizi görür.", "Çok büyük bir yıldız olmaz ama her hocanın isteyeceği bir asker.", "Uygun fiyata alınırsa takımın savaş gücünü artırır."]
        },
        capped_youth: {
            intro: ["Hocam çocuk genç ama gözlerinde o ateşi göremedim.", "Sahada var ama ruhu yok gibi.", "Bu çocuktan pek bir şey beklemiyorum."],
            mid: ["Topu kaybettiğinde geri dönmüyor, hemen hakeme itiraz ediyor.", "Yetenekli olabilir ama o kibirli tavrı beni çok rahatsız etti.", "Formanın değerini bilecek bir karaktere sahip değil."],
            outro: ["Bana sorarsanız bu topa hiç girmeyelim.", "İstatistikleri iyi olabilir ama benim defterimde sınıfta kaldı.", "Takımın ahengini bozar, hiç bulaşmayalım."]
        },
        bad_youth: {
            intro: ["İzlediğim maça yazık oldu hocam.", "Bu çocuğun futbolcu olması bile mucize.", "Not defterimi cebimden hiç çıkarmadım."],
            mid: ["Ne mücadele ediyor ne koşuyor. Tamamen ruhsuz.", "Karakter olarak da çok laubali, ısınırken bile ciddiyetsizdi.", "İkili mücadelelerden korkup ayağını çekiyor."],
            outro: ["Kesinlikle uzak duralım.", "Altyapıdaki çocuklarımızın hakkını yemeyelim, bu bize yaramaz.", "Üstünü kırmızı kalemle çizdim."]
        },
        prime_star: {
            intro: ["Hocam kelimeler yetmez, adam sahada general gibi.", "Yılların tecrübesi, duruşuyla bile rakibi titretiyor.", "Eski toprak bir yıldız, ruhuyla takımı şampiyon yapar."],
            mid: ["Sadece yetenek değil, adam soyunma odasının da lideri olur.", "Gençlere ağabeylik yapar, takımı etrafında toplar.", "Kriz anlarında sorumluluk almaktan asla kaçmaz."],
            outro: ["Ne istiyorsa verip alalım.", "Şampiyonluk istiyorsak bu komutanı takıma katmalıyız.", "Gözü kapalı imza attırılır."]
        },
        prime_solid: {
            intro: ["Görev adamı, formayı terden sırılsıklam yapıyor.", "Taktik falan bilmem ama adam sahada canını dişine takıyor.", "Çok güvenilir bir savaşçı."],
            mid: ["Ne ego yapıyor ne de mızmızlanıyor. Çıkıp işini yapıyor.", "Tekmelere kafa sokan cinsten, tam bir eski toprak.", "Hocasına ve takımına çok sadık bir karakteri var."],
            outro: ["Rotasyonun bel kemiği olur.", "Taraftar bu tarz savaşçıları çok sever, hemen alalım.", "Takımın savaş gücünü artırır, işimize çok yarar."]
        },
        prime_average: {
            intro: ["Ortalama bir işçi, ne eksiği var ne fazlası.", "Sahada pek göze batmıyor ama işini de aksatmıyor.", "Not defterimde ortalarda bir yerde kaldı."],
            mid: ["Ekstra bir liderlik veya savaşçılık göremedim ama kötü de değil.", "Bazen maçın içinde kayboluyor ama takımı da satmıyor.", "Rutin bir performansı var."],
            outro: ["Mecbur kalırsak alırız.", "Yedek kulübesi için düşünülebilir.", "Daha iyisini bulamazsak işimizi görür."]
        },
        old_star: {
            intro: ["Yaşına rağmen sahaya o karakteri koyuyor.", "Efsane bir isim, sadece varlığı bile rakibe korku verir.", "Ciğeri bitse bile tecrübesiyle oynamaya devam ediyor."],
            mid: ["Belki 90 dakika koşamaz ama son 20 dakikada maçı çözer.", "Soyunma odasında gençlere rehberlik yapar.", "Karakteri ve profesyonelliği takdire şayan."],
            outro: ["Son bir şarkı için takıma katılmalı.", "Tecrübesi bize çok maç kazandırır.", "Bu büyük ustayı kadromuza katalım."]
        },
        old_declining: {
            intro: ["Hocam artık ruhu sahada ama bedeni izin vermiyor.", "Eski günlerinden çok uzak, gözlerindeki o ateş sönmüş.", "Yazık, efsane ama artık bırakma vakti gelmiş."],
            mid: ["İkili mücadelelere giremiyor, eski cesareti kalmamış.", "Oyundan düşünce hemen hakeme sızlanmaya başlıyor.", "Saha içindeki varlığı takıma faydadan çok zarar veriyor."],
            outro: ["Geçmişine saygı duyuyorum ama takımımızda yeri yok.", "Bu transfer tamamen israf olur.", "Emekliliğinin tadını çıkarsın, bizden uzak dursun."]
        }
    };

    const pool = window.scoutProfile === "tribun_kurdu" ? pool_tribun_kurdu : {
        wonderkid: {`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', content, 'utf8');
console.log('Patch scout tribun kurdu applied successfully.');

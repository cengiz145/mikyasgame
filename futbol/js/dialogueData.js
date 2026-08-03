const winPrefixes = [
    "Sayın Teknik Direktör", 
    "Kıymetli Hocam", 
    "Saygıdeğer Menajer", 
    "Değerli Hocam", 
    "Sayın Menajer"
];

const winMiddles = [
    "sahada kulübümüzün vizyonuna yakışır bir duruş sergilediniz", 
    "taktiksel disiplininiz takdire şayandı", 
    "camiamızı gururlandıran bir futbol izlettiniz", 
    "oyuncularımızın gösterdiği performans yönetimimizi memnun etti", 
    "stratejik hamlelerinizle değerli bir üç puan aldık"
];

const winSuffixes = [
    "tebrik ediyor, başarılarınızın devamını diliyorum.", 
    "şampiyonluk yolunda emin adımlarla ilerliyoruz.", 
    "bu istikrarın sürmesini temenni ederim.", 
    "yönetim kurulumuz adına teşekkürlerimi sunarım.", 
    "hedeflerimize ulaşacağımıza olan inancımız tam."
];

const lossPrefixes = [
    "Sayın Teknik Direktör", 
    "Kıymetli Hocam", 
    "Saygıdeğer Menajer", 
    "Değerli Hocam", 
    "Sayın Menajer"
];

const lossMiddles = [
    "bugün sahadaki oyun kulübümüzün hedefleriyle uyuşmamaktadır", 
    "beklentilerimizin çok altında bir performans sergilendi", 
    "taraftarımızın ve camiamızın hak etmediği bir sonuçla karşılaştık", 
    "sahadaki sistemsizlik ve disiplinsizlik bizleri derinden üzmüştür", 
    "alınan bu mağlubiyet yönetim kurulumuzda rahatsızlık yaratmıştır"
];

const lossSuffixes = [
    "en kısa sürede gerekli önlemleri almanızı bekliyorum.", 
    "durum değerlendirmesi için teknik heyetten rapor talep ediyorum.", 
    "gelecek maçlarda bu tablonun değişmesini umuyoruz.", 
    "takımın motivasyonunu derhal toparlamanızı rica ediyorum.", 
    "bu gidişatın tekrarlanmamasını kati suretle temenni ederim."
];

const dialogueData = {
    winMessages: [],
    lossMessages: [],
    drawMessages: [
        "Sayın Teknik Direktör, alınan beraberlik makul karşılansa da şampiyonluk yolunda puan kayıplarını en aza indirmeliyiz.",
        "Kıymetli Hocam, sahadaki mücadele fena değildi ancak kulübümüz her zaman galibiyet hedefler.",
        "Değerli Hocam, bir puanı hanemize yazdırdık fakat teknik heyetimizin daha fazlasını başarabileceğine inanıyoruz.",
        "Saygıdeğer Menajer, alınan bu sonucun ardından takımın eksiklerini analiz etmenizi rica ediyorum.",
        "Sayın Menajer, evimize bir puanla dönüyoruz; gelecek haftaki müsabakada mutlak galibiyet bekliyoruz."
    ],
    fanExpectationMessages: []
};

// Kombinasyonlarla tam 100 tane resmi Win mesajı üret
let wCount = 0;
for(let p of winPrefixes) {
    for(let m of winMiddles) {
        for(let s of winSuffixes) {
            if(wCount < 100) {
                dialogueData.winMessages.push(p + ", " + m + "; " + s);
                wCount++;
            }
        }
    }
}

// Kombinasyonlarla tam 100 tane resmi Loss mesajı üret
let lCount = 0;
for(let p of lossPrefixes) {
    for(let m of lossMiddles) {
        for(let s of lossSuffixes) {
            if(lCount < 100) {
                dialogueData.lossMessages.push(p + ", " + m + "; " + s);
                lCount++;
            }
        }
    }
}

// Hakem İtirazları ve Cezalar
const objPrefix = [
    "Saha kenarında hoca çılgına döndü:", 
    "Teknik direktör dördüncü hakeme yürüdü:", 
    "Yedek kulübesi ayaklandı, hoca bağırıyor:", 
    "Teknik direktör çileden çıktı:", 
    "Hoca kollarını iki yana açıp isyan etti:"
];

const fanPrefixes = [
    "Taraftarlar olarak",
    "Tribünlerin sesi olarak",
    "Armaya gönül verenler olarak",
    "Bu takımın gerçek sahipleri olarak",
    "Yıllardır bu tribünlerde ömrünü çürüten bizler",
    "İyi günde kötü günde buradayız ama",
    "Bizler bu kulübün neferleriyiz",
    "Takımın peşinden her deplasmana giden taraftarlar olarak",
    "Büyük taraftar grubumuz adına",
    "Babadan miras bu sevdayı yaşayan bizler"
];

const fanMiddles = [
    "sahada terinin son damlasına kadar savaşan bir takım görmek en büyük beklentimizdir",
    "artık mazeret değil, şampiyonluğa inanan bir oyun istiyoruz",
    "sahada ruhsuz dolaşan oyuncular değil, formanın hakkını veren savaşçılar görmeyi bekliyoruz",
    "bu formanın ağırlığını taşıyamayanların gönderilmesini ve yürekli oynanmasını talep ediyoruz",
    "taktiksel hatalardan bıktık, bize sahaya karakter koyan bir takım lazım",
    "bizim tek beklentimiz armanın yere düşürülmemesi ve son düdüğe kadar mücadeledir",
    "biz milyonlarca taraftarın beklentisi, sahaya çıkıp o formayı ıslatmanızdır",
    "beklentimiz kupalar değil, sahada savaşan ve geri adım atmayan bir armadır",
    "bizim en büyük arzumuz ve beklentimiz rakipleri sahaya gömen efsane oyunumuzun geri dönmesidir",
    "artık sabrımız kalmadı, en büyük beklentimiz bizi gururlandıran bir futbol izlemektir"
];

const fanSuffixes = [
    "Hocamızın ve takımın bunun bilincinde olmasını umuyoruz.",
    "Bu beklentiyi karşılamayanlarla yolların ayrılmasını istiyoruz.",
    "Eğer bu beklentiler karşılanmazsa tribünler gereken cevabı verecektir.",
    "Yönetim ve teknik heyet bu sesi duymalı ve gereğini yapmalıdır.",
    "Bizim sabrımızı taşırmadan bu takımın ayağa kalkması şarttır.",
    "Şanlı tarihimize yakışan tek sonuç budur, başka bir yol yoktur.",
    "Aksi takdirde bu stadyumu sizlere dar edeceğimizden şüpheniz olmasın.",
    "Sahada bunu göremediğimiz her saniye bizim için kahırdır.",
    "Umarız bu sese kulak verilir ve o ruh sahaya yansır.",
    "Arma sevdalılarının bu beklentisini boşa çıkarmayın!"
];

let fCount = 0;
for(let p of fanPrefixes) {
    for(let m of fanMiddles) {
        for(let s of fanSuffixes) {
            if(fCount < 1000) {
                dialogueData.fanExpectationMessages.push(p + ", " + m + ". " + s);
                fCount++;
            }
        }
    }
}

window.dialogueData = dialogueData;
window.objPrefix = objPrefix;
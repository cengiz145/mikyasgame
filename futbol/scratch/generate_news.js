const subjects = [
    "Avrupa devi", "Ligin flaş takımı", "Ünlü teknik adam", "Yıldız golcü", 
    "Genç yetenek", "Efsane kaptan", "Milli kaleci", "Şampiyonluk adayı", 
    "Süper Lig ekibi", "Federasyon başkanı", "Hakem komitesi", "Spor yazarları",
    "İngiliz kulübü", "İtalyan devi", "İspanyol devi", "Taraftar derneği",
    "Kulüp başkanı", "Yabancı yatırımcılar", "Körfez sermayesi", "Brezilyalı efsane"
];

const events = [
    "sürpriz bir transfer görüşmesine başladı.", 
    "hakkındaki iddiaları yalanladı.",
    "sözleşmesini fesh ettiğini duyurdu.",
    "basın toplantısında ateş püskürdü.",
    "astronomik bir teklif aldı.",
    "taraftarlarla gerginlik yaşadı.",
    "kadro dışı bırakıldı.",
    "rekor bir bonservis bedeliyle anlaşmaya vardı.",
    "gizlice şehre geldi.",
    "sağlık kontrollerinden geçti.",
    "yeni bir sponsorluk anlaşması imzaladı.",
    "satış listesine konuldu.",
    "istifa sinyali verdi.",
    "hastanesinden taburcu edildi.",
    "kavga haberleriyle gündeme geldi."
];

const conclusions = [
    "Bu gelişme piyasayı altüst etti.",
    "Taraftarlar bu habere inanamadı.",
    "Sosyal medyada günün en çok konuşulan olayı oldu.",
    "Yönetimden acil bir açıklama bekleniyor.",
    "Gözler şimdi yapılacak resmi açıklamada.",
    "Rakipler bu hamleye nasıl karşılık verecek merak konusu.",
    "Hisseler bu haberin ardından yükselişe geçti.",
    "Spor programlarında hararetli tartışmalara sebep oldu.",
    "Uzmanlar bu hamlenin büyük bir risk olduğunu söylüyor.",
    "Bu durum şampiyonluk yarışını derinden etkileyecek."
];

let newsArray = [];
while(newsArray.length < 200) {
    let s = subjects[Math.floor(Math.random() * subjects.length)];
    let e = events[Math.floor(Math.random() * events.length)];
    let c = conclusions[Math.floor(Math.random() * conclusions.length)];
    let newsStr = s + " " + e + " " + c;
    if(!newsArray.includes(newsStr)) {
        newsArray.push(newsStr);
    }
}

const fs = require('fs');
const jsContent = "window.dailyNewsPool = " + JSON.stringify(newsArray, null, 4) + ";\n";
fs.writeFileSync('js/news_data.js', jsContent, 'utf8');
console.log('200 news items generated to js/news_data.js');

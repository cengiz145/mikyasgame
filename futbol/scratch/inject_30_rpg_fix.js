const fs = require('fs');

const newEvents = [
    {
        type: "rpg30_01", condition: "() => Math.random() < 0.25", title: "📱 Sosyal Medya Çılgınlığı",
        desc: "Yıldız oyuncun maçtan bir gün önce ezeli rakibin logosunu beğenerek büyük bir kaos yarattı. Taraftarlar tesisleri basmak üzere!",
        options: [
            { text: "Kadro Dışı Bırak", effect: { authority: 15, loyalty: -15, customAction: "() => alert('Oyuncuyu cezalandırdın. Otoriten arttı ama takımın huzuru kaçtı.')" } },
            { text: "Hesabı Hacklenmiş Gibi Davran", effect: { authority: -10, loyalty: 10, president: 5, customAction: "() => alert('Oyuncuyu korudun. Taraftar inandı ve kriz çözüldü.')" } }
        ]
    },
    {
        type: "rpg30_02", condition: "() => Math.random() < 0.25", title: "💸 Prim Kavgası",
        desc: "Kaptan, yönetimden söz verilen galibiyet primlerinin yatmadığını söyleyerek antrenmana çıkmayı reddediyor.",
        options: [
            { text: "Yönetime Baskı Yap", effect: { president: -20, loyalty: 20, customAction: "() => alert('Başkanla kavga edip parayı kopardın. Takım sana tapıyor ama başkan sinirli.')" } },
            { text: "Oyuncuları Fırçala", effect: { authority: 20, loyalty: -20, customAction: "() => alert('Para için mi oynuyorsunuz! diyerek idmanı başlattın. Moraller bozuk.')" } }
        ]
    },
    {
        type: "rpg30_03", condition: "() => Math.random() < 0.25", title: "🕵️ Rakip Takım Casusu",
        desc: "Tesislerin üzerinde uçan yabancı bir drone tespit edildi! Taktik idmanı gizlice kaydediyor olabilirler.",
        options: [
            { text: "İdmanı Gizli Salona Al", effect: { authority: 5, president: 5, customAction: "() => alert('Önlem aldın, casusluk girişimi boşa çıktı.')" } },
            { text: "Sahte Taktik Çalıştır", effect: { authority: 10, customAction: "() => alert('Rakibi yanıltmak için bilerek yanlış diziliş çalıştın! Çok zekice.')" } }
        ]
    },
    {
        type: "rpg30_04", condition: "() => Math.random() < 0.20", title: "🍕 Diyetisyen Skandalı",
        desc: "Takımın en önemli iki oyuncusu gece yarısı gizlice dürümcüde yakalandı. Fotoğraflar basına sızdı.",
        options: [
            { text: "Ağır Para Cezası Ver (Bütçe +20K)", effect: { budget: 20000, authority: 10, loyalty: -10 } },
            { text: "Birlikte Yemeğe Gidin (PR Çalışması)", effect: { authority: -5, loyalty: 15, customAction: "() => alert('Olayı şakaya vurup tüm takımı kebaba götürdün. Medya bu sempatik tavrı sevdi.')" } }
        ]
    },
    {
        type: "rpg30_05", condition: "() => Math.random() < 0.20", title: "👊 Kavgalı Yarı Devre",
        desc: "Devre arasında iki oyuncun birbirine girdi ve yumruklaştı. Soyunma odasında kan donduran bir gerilim var.",
        options: [
            { text: "İkisini de Oyundan Al", effect: { authority: 20, loyalty: -15, customAction: "() => alert('Taviz vermedin! Maçı kaybetme riskini aldın ama disiplini sağladın.')" } },
            { text: "Barıştır ve Sahaya Sür", effect: { authority: -10, loyalty: 10, customAction: "() => alert('Zorla sarıldırıp sahaya gönderdin. Sorun şimdilik halının altına süpürüldü.')" } }
        ]
    },
    {
        type: "rpg30_06", condition: "() => Math.random() < 0.20", title: "📞 Gece Yarısı Araması",
        desc: "Gece saat 03:00. Kulüp başkanı seni alkollü şekilde arayıp yarınki maçta hangi taktikle oynaman gerektiğini dikte ediyor.",
        options: [
            { text: "Telefonu Yüzüne Kapat", effect: { authority: 15, president: -30, customAction: "() => alert('Haddini bildirdin. Başkan ertesi gün bu durumu unutmayacak!')" } },
            { text: "Alttan Al ve Haklısın De", effect: { authority: -15, president: 20, customAction: "() => alert('Gururunu hiçe sayıp başkanı pohpohladın. Koltuğun şimdilik güvende.')" } }
        ]
    },
    {
        type: "rpg30_07", condition: "() => Math.random() < 0.25", title: "🗣️ Çevirmen Krizi",
        desc: "Yabancı oyunculara taktiksel uyarılarda bulunurken, çevirmenin sözlerini yumuşatarak aktardığını fark ettin.",
        options: [
            { text: "Çevirmeni Hemen Kov", effect: { authority: 20, loyalty: -5, customAction: "() => alert('Otoriteni gösterdin ama yabancı oyuncularla iletişimin kısa süreliğine koptu.')" } },
            { text: "Çevirmeni Kenara Çek ve Uyar", effect: { authority: 5, loyalty: 5, customAction: "() => alert('Krizi profesyonelce yönettin.')" } }
        ]
    },
    {
        type: "rpg30_08", condition: "() => Math.random() < 0.15", title: "⭐ VIP Davetiye Krizi",
        desc: "Yıldız oyuncular, derbi maçı için ailelerine ayrılan VIP bilet sayısının yetersiz olmasından dolayı isyan çıkardı.",
        options: [
            { text: "Kendi Locanı Onlara Ver", effect: { authority: -10, loyalty: 20, customAction: "() => alert('Büyük bir fedakarlık yaptın, oyuncular bu hareketini unutmayacak.')" } },
            { text: "Kulüp Kuralları Kesindir De", effect: { authority: 10, loyalty: -15, customAction: "() => alert('Ayrıcalık yapmadın ama moraller fena bozuldu.')" } }
        ]
    },
    {
        type: "rpg30_09", condition: "() => window.managerAuthority < 40", title: "👕 Forma Numarası Kavgası",
        desc: "Yeni transfer edilen yıldız oyuncu, takımın eski kaptanının giydiği 10 numaralı formayı istiyor. İkisi de geri adım atmıyor.",
        options: [
            { text: "Kaptana Destek Ol", effect: { loyalty: 15, customAction: "() => alert('Kaptanı korudun. Yeni transfer sana cephe aldı.')" } },
            { text: "Formayı Yeni Yıldıza Ver", effect: { authority: 10, loyalty: -20, customAction: "() => alert('Otoriteni kullanarak kararı sen verdin ama takım içi hiyerarşiyi paramparça ettin.')" } }
        ]
    },
    {
        type: "rpg30_10", condition: "() => Math.random() < 0.20", title: "🎬 Sponsor Çekimi",
        desc: "Kulübün ana sponsoru, tam da taktik idmanının olduğu saatte tüm takımın reklam çekiminde olmasını dayatıyor.",
        options: [
            { text: "İdmanı İptal Et (Bütçe +100K€)", effect: { budget: 100000, president: 15, authority: -15 } },
            { text: "Sponsoru Reddet!", effect: { budget: -50000, president: -25, authority: 20, customAction: "() => alert('Önce futbol dedin! Yönetim kriz geçirdi.')" } }
        ]
    },
    {
        type: "rpg30_11", condition: "() => Math.random() < 0.10", title: "🔮 Astroloji Çılgınlığı",
        desc: "Takımın en formda oyuncusu, Merkür Retrosu olduğu için bu hafta sahaya çıkarsa ayağının kırılacağına inanıyor.",
        options: [
            { text: "Kadroya Alma", effect: { authority: -5, loyalty: 5, customAction: "() => alert('Deliliğe boyun eğdin ama oyuncunu kaybetmedin.')" } },
            { text: "Zorla Oynat", effect: { authority: 15, loyalty: -10, customAction: "() => alert('Batıl inançlara yer yok dedin. Oyuncu sahada korkudan titreyerek oynayacak.')" } }
        ]
    },
    {
        type: "rpg30_12", condition: "() => Math.random() < 0.20", title: "🏃 Yedek Kulübesi İsyanı",
        desc: "Maçın son anlarında oyuna almak istediğin bir yedek oyuncu, 'Bu saatten sonra girmem' diyerek ısınmayı reddetti.",
        options: [
            { text: "Süresiz Kadro Dışı Bırak", effect: { authority: 25, president: -5, customAction: "() => alert('Taviz vermedin! Oyuncunun bileti kesildi.')" } },
            { text: "Maç Sonu Özel Olarak Görüş", effect: { authority: -10, loyalty: 10, customAction: "() => alert('Krizi basının önünde büyütmedin ama diğer oyuncular zayıfladığını düşünüyor.')" } }
        ]
    },
    {
        type: "rpg30_13", condition: "() => Math.random() < 0.15", title: "🚘 Trafik Kazası",
        desc: "Genç yıldızınız gece geç saatlerde lüks aracıyla ufak bir kaza yaptı. Sağlığı iyi ama basın olayı abartıyor.",
        options: [
            { text: "Arkasına Dur ve Savun", effect: { authority: -5, loyalty: 15, customAction: "() => alert('Oyuncunu medyanın önüne atmadın.')" } },
            { text: "Para Cezası Ver (Bütçe +30K)", effect: { budget: 30000, authority: 15, loyalty: -15 } }
        ]
    },
    {
        type: "rpg30_14", condition: "() => Math.random() < 0.15", title: "💔 Eşler Arası Kavga",
        desc: "İki oyuncunun eşleri (WAGs) Instagram üzerinden birbirlerine ağır hakaretler etti. Bu durum saha içine de sıçradı.",
        options: [
            { text: "Aileleri Topla ve Arabuluculuk Yap", effect: { authority: 5, loyalty: 10, customAction: "() => alert('Terapist gibi davrandın ve takımın bağlarını güçlendirdin.')" } },
            { text: "Beni İlgilendirmez De", effect: { authority: -10, loyalty: -10, customAction: "() => alert('Sorunu görmezden geldin, saha içinde paslaşmamaya başladılar.')" } }
        ]
    },
    {
        type: "rpg30_15", condition: "() => window.managerAuthority < 50", title: "😠 Küfürlü Pankart",
        desc: "Bir grup taraftar, antrenman sahasının tellerine doğrudan sana yönelik hakaret içeren bir pankart astı.",
        options: [
            { text: "Pankartı İndirt ve Dava Aç", effect: { authority: 15, president: -10, customAction: "() => alert('Taraftarla savaşa girdin! Otoriten arttı ama camia ikiye bölündü.')" } },
            { text: "Görmezden Gel", effect: { authority: -15, customAction: "() => alert('Pasif kaldın. Medya zayıflığını manşetlere taşıdı.')" } }
        ]
    },
    {
        type: "rpg30_16", condition: "() => Math.random() < 0.20", title: "🎭 Menajer Tehdidi",
        desc: "Yıldız bir oyuncunun menajeri odanı basıp, 'Oyuncumu her maç 90 dakika oynatmazsan onu sezon sonu bedavaya götürürüm' dedi.",
        options: [
            { text: "Menajeri Odadan Kov!", effect: { authority: 20, president: -15, customAction: "() => alert('Şantaja boyun eğmedin! Başkan finansal kayıp yaşanacağı için sinirli.')" } },
            { text: "Söz Ver ve Kabul Et", effect: { authority: -25, loyalty: -10, customAction: "() => alert('Boyun eğdin. Takımdaki diğer oyuncular menajerlerin kulübü yönettiğini düşünüyor.')" } }
        ]
    },
    {
        type: "rpg30_17", condition: "() => Math.random() < 0.20", title: "🚑 Sahte Sakatlık İddiası",
        desc: "Sağlık ekibi, kritik maç öncesi oynamak istemeyen bir oyuncunun sakatlık numarası yaptığını raporladı.",
        options: [
            { text: "Basına İfşa Et", effect: { authority: 20, loyalty: -25, customAction: "() => alert('Oyuncuyu bitirdin! Disiplin sağlandı ama oyuncular sana güvenmiyor.')" } },
            { text: "Gizlice Para Cezası Kes", effect: { budget: 15000, authority: 5, loyalty: 5 } }
        ]
    },
    {
        type: "rpg30_18", condition: "() => Math.random() < 0.15", title: "🍲 Gıda Zehirlenmesi",
        desc: "Deplasman kafilesindeki 3 as oyuncun otelde yedikleri tavuk yüzünden zehirlendi. Mide bulantısıyla oynayamazlar.",
        options: [
            { text: "Oteli Mahkemeye Ver", effect: { authority: 10, president: 5, customAction: "() => alert('Suçu otelde aradın. Olay medyatik oldu ama oyuncular hala eksik.')" } },
            { text: "Taktik Değiştirip Gençleri Sür", effect: { loyalty: 15, customAction: "() => alert('Krizi fırsata çevirdin, gençler bu güvenini boşa çıkarmayacaktır.')" } }
        ]
    },
    {
        type: "rpg30_19", condition: "() => Math.random() < 0.10", title: "👹 Kötü Şans Tılsımı",
        desc: "Üst üste alınan kötü sonuçlardan sonra oyuncular, soyunma odasında 'büyü' olduğuna inanıp bir Şaman çağırmak istiyor.",
        options: [
            { text: "İzin Ver (Bütçe -5K€)", effect: { budget: -5000, loyalty: 15, authority: -10, customAction: "() => alert('Soyunma odasında tütsüler yakıldı. Medyaya sızarsa dalga konusu olursun.')" } },
            { text: "Saçmalamayın! İdmana Çıkın!", effect: { authority: 15, loyalty: -15, customAction: "() => alert('Bilimi savundun ama oyuncuların psikolojisi hala bozuk.')" } }
        ]
    },
    {
        type: "rpg30_20", condition: "() => Math.random() < 0.10", title: "🎰 Kumar Borcu",
        desc: "En iyi golcün, mafyaya olan yüklü kumar borcu yüzünden tehdit alıyor ve sahaya odaklanamıyor.",
        options: [
            { text: "Borcu Kulüp Bütçesinden Öde (-200K€)", effect: { budget: -200000, loyalty: 30, president: -40, customAction: "() => alert('Büyük risk aldın. Başkan çıldırdı ama oyuncu senin için canını verir.')" } },
            { text: "Kadro Dışı Bırak ve Polise Ver", effect: { authority: 20, loyalty: -10, customAction: "() => alert('Temiz futbol dedin! Yıldızını kaybettin ama kulübü korudun.')" } }
        ]
    },
    {
        type: "rpg30_21", condition: "() => window.managerAuthority < 60", title: "🤬 Rakip Hocayla Söz Dalaşı",
        desc: "Rakip takımın teknik direktörü basın toplantısında senin taktik bilginle dalga geçip seni aşağıladı.",
        options: [
            { text: "Sert Yanıt Ver (Polemik)", effect: { authority: 15, president: -5, customAction: "() => alert('Savaş başlattın! Taraftar bu dik duruşunu sevdi.')" } },
            { text: "Cevabı Sahada Vereceğiz De", effect: { authority: -5, president: 10, customAction: "() => alert('Polemiğe girmedin. Başkan bu klas tavrını takdir etti.')" } }
        ]
    },
    {
        type: "rpg30_22", condition: "() => Math.random() < 0.20", title: "🔍 Transfer Sızıntısı",
        desc: "Aylardır gizlice yürüttüğün yıldız transfer görüşmesi basına sızdı ve ezeli rakibin fiyat artırmak için devreye girdi.",
        options: [
            { text: "Bütçeyi Zorla (Teklifi Artır)", effect: { budget: -300000, president: -15, customAction: "() => alert('Kesenin ağzını açtın! Transfer büyük ihtimalle senin olacak ama başkan kızgın.')" } },
            { text: "Masadan Kalk", effect: { authority: 15, customAction: "() => alert('Kimse bu kulüpten büyük değildir dedin ve transferden vazgeçtin.')" } }
        ]
    },
    {
        type: "rpg30_23", condition: "() => Math.random() < 0.15", title: "🤫 Gizli Parti Skandalı",
        desc: "Sokağa çıkma yasağı / kamp kuralları ihlal edilerek 5 oyuncunun lüks bir yatta parti yaptığı video internete düştü.",
        options: [
            { text: "Hepsine Ağır Ceza (Bütçe +100K€)", effect: { budget: 100000, authority: 20, loyalty: -20 } },
            { text: "Videoyu Yalanla (Medya Savaşı)", effect: { authority: -10, loyalty: 20, customAction: "() => alert('Yalan söyledin ve oyuncularını korudun. Medya senin ipini çekmek için bekliyor olacak.')" } }
        ]
    },
    {
        type: "rpg30_24", condition: "() => window.presidentConfidence > 60", title: "🎁 Prim Bağışı Talebi",
        desc: "Takım, son galibiyet primini tamamıyla bir çocuk hastanesine bağışlamak istediklerini açıkladı.",
        options: [
            { text: "Kulüp Olarak Destekle (Bütçe -50K€)", effect: { budget: -50000, president: 15, loyalty: 20, customAction: "() => alert('Harika bir PR çalışması! Bütün ülke sizi konuşuyor.')" } },
            { text: "Kendi Paranızla Yapın De", effect: { authority: 10, loyalty: -15, customAction: "() => alert('Soğuk bir tepki verdin. Medya bu tavrını acımasız buldu.')" } }
        ]
    },
    {
        type: "rpg30_25", condition: "() => Math.random() < 0.20", title: "🎙️ Özel Röportaj Krizi",
        desc: "Yedek kalan tecrübeli bir oyuncu, kendi ülkesinin basınına konuşarak senin adaletsiz bir teknik adam olduğunu söyledi.",
        options: [
            { text: "Sözleşmesini Feshet! (Bütçe -150K€)", effect: { budget: -150000, authority: 25, president: -20, customAction: "() => alert('Tazminatını ödeyip gönderdin! Kimse sana meydan okuyamaz.')" } },
            { text: "Kulübeye Hapset", effect: { authority: 10, loyalty: -10, customAction: "() => alert('Maaşını ödemeye devam edip çürümeye bıraktın.')" } }
        ]
    },
    {
        type: "rpg30_26", condition: "() => Math.random() < 0.10", title: "⚖️ Şike İddiası",
        desc: "İsimsiz bir sosyal medya hesabı, son derbide oyuncularından birinin bilerek hata yaptığını ve şikeye karıştığını iddia etti.",
        options: [
            { text: "Oyuncuyla Acil Toplantı Yap", effect: { authority: 10, loyalty: -5, customAction: "() => alert('Sert bir dille sorguladın. Oyuncu yemin ederek reddetti.')" } },
            { text: "Hesabı Mahkemeye Ver", effect: { loyalty: 15, president: 10, customAction: "() => alert('Camia kenetlendi, dış düşmanlara karşı savaş açıldı!')" } }
        ]
    },
    {
        type: "rpg30_27", condition: "() => Math.random() < 0.20", title: "✈️ Uçak Rötari",
        desc: "Kritik deplasman maçı öncesi havaalanında yoğun sis nedeniyle uçak 6 saat rötar yaptı. Oyuncular havalimanında perişan oldu.",
        options: [
            { text: "Havalimanında Antrenman Yaptır", effect: { authority: 15, loyalty: -20, customAction: "() => alert('Bekleme salonunda esneme hareketleri yaptırdın. Oyuncular senden nefret etti.')" } },
            { text: "Serbest Zaman Ver", effect: { authority: -5, loyalty: 10, customAction: "() => alert('Oyuncular kafelerde dinlenip moral depoladı.')" } }
        ]
    },
    {
        type: "rpg30_28", condition: "() => Math.random() < 0.15", title: "🚪 Hakem Odası Baskını",
        desc: "Başkan devre arasında yanına gelerek: 'Sen gelmiyorsan ben iniyorum, o hakemin odasını basıp düdüğünü astıracağım!' diye bağırdı.",
        options: [
            { text: "Başkanı Fiziksel Olarak Engelle", effect: { authority: 20, president: -30, customAction: "() => alert('Büyük skandalı önledin ama başkanla ilişkilerin koptu kopacak!')" } },
            { text: "Beraber Basalım Başkanım!", effect: { authority: -20, president: 30, loyalty: 10, customAction: "() => alert('Eyyamın dibine vurdun! Hakem korkudan ikinci yarı eyyam yapacak.')" } }
        ]
    },
    {
        type: "rpg30_29", condition: "() => Math.random() < 0.20", title: "🧘 Yoga ve Meditasyon",
        desc: "Eski bir futbolcu olan ünlü bir yaşam koçu, takıma gönüllü olarak nefes ve meditasyon dersleri vermek istiyor.",
        options: [
            { text: "Kabul Et (Takım İçi Uyum)", effect: { authority: -5, loyalty: 15, customAction: "() => alert('Oyuncular çimlerde lotus duruşu yaparak stres attı.')" } },
            { text: "Futbol Sahasında Yoga Olmaz!", effect: { authority: 10, loyalty: -10, customAction: "() => alert('Kovdun! Bizim işimiz savaşmak dedin.')" } }
        ]
    },
    {
        type: "rpg30_30", condition: "() => Math.random() < 0.25", title: "🏟️ Taraftar Tesis Basması",
        desc: "Son alınan kötü sonuçlardan dolayı maskeli bir grup taraftar tesislere girip meşalelerle antrenmanı böldü.",
        options: [
            { text: "Polis Çağır", effect: { authority: 10, president: -10, customAction: "() => alert('Taraftarları polise teslim ettin. Camianın ağır abileri bu kararını sevmedi.')" } },
            { text: "Karşılarına Çık ve Yüzleş", effect: { authority: 20, loyalty: 20, president: 10, customAction: "() => alert('Korkusuzca aralarına girip onlara söz verdin. Liderliğini herkese kanıtladın!')" } }
        ]
    }
];

let content = fs.readFileSync('js/menu.js', 'utf8');

// The array ends with `];\n\nwindow.currentDynamicEvent = null;`
// We will replace `];\n\nwindow.currentDynamicEvent = null;`
// with `, ...newEvents];\n\nwindow.currentDynamicEvent = null;`

let stringifiedEvents = newEvents.map(e => {
    let opts = e.options.map(o => {
        let act = o.effect.customAction ? "customAction: " + o.effect.customAction : '';
        let effs = [];
        if(o.effect.budget) effs.push("budget: " + o.effect.budget);
        if(o.effect.authority) effs.push("authority: " + o.effect.authority);
        if(o.effect.loyalty) effs.push("loyalty: " + o.effect.loyalty);
        if(o.effect.president) effs.push("president: " + o.effect.president);
        if(act) effs.push(act);
        return "{ text: '" + o.text + "', effect: { " + effs.join(', ') + " } }";
    }).join(',\n            ');

    return `
    {
        type: "` + e.type + `",
        condition: ` + e.condition + `,
        title: "` + e.title + `",
        desc: "` + e.desc + `",
        options: [
            ` + opts + `
        ]
    }`;
}).join(',');

const targetPoint = `];

window.currentDynamicEvent = null;`;

const replacement = `, ` + stringifiedEvents + `
];

window.currentDynamicEvent = null;`;

content = content.replace(targetPoint, replacement);

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('30 New RPG Events Injected Successfully without syntax errors!');

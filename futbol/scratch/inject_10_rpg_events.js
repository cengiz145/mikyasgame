const fs = require('fs');
let code = fs.readFileSync('js/menu.js', 'utf8');

const additional10Events = `
    // --- [YENİ 10 OLAY] ---
    {
        type: "rpgMole",
        condition: () => Math.random() < 0.20,
        title: "🐀 Soyunma Odası Köstebeği!",
        desc: "Şok bir gelişme! Taktik tahtasında çizdiğiniz en gizli hücum organizasyonları yerel bir gazetede harfiyen yayımlandı. Takım içinde bir köstebek var!",
        options: [
            { text: "Cadı Avı Başlat (Tesisleri Kapat)", effect: { authority: 15, loyalty: -20, customAction: () => alert("Oyuncuların telefonlarını toplattın ve ağır sorgu yaptın. Otoriten arttı ama takım sana çok kırıldı.") } },
            { text: "Bırakın Yazsınlar (Umursama)", effect: { authority: -10, loyalty: 10, customAction: () => alert("Soğukkanlı kaldın, oyunculara güvendiğini söyledin. Takım içi bağlar güçlendi ama medya seninle dalga geçiyor.") } }
        ]
    },
    {
        type: "rpgYoungsterGaming",
        condition: () => Math.random() < 0.25,
        title: "🎮 Genç Yetenek Disiplinsizliği",
        desc: "Altyapıdan yeni çıkardığınız en potansiyelli genç oyuncunuz, sabah idmanına katılmadı. Sonradan ortaya çıktı ki gece boyu bir 'Valorant' e-spor turnuvasında oyun oynamış!",
        options: [
            { text: "A Takımdan Kov ve Altyapıya Yolla", effect: { authority: 20, president: -10, customAction: () => alert("Başkanın çok sevdiği genci cezalandırdın. Disiplin tavan yaptı ama başkan sana kızgın.") } },
            { text: "Ufak Bir Para Cezası Ver", effect: { authority: -5, loyalty: 5, customAction: () => alert("Gence babacan yaklaştın. Oyuncu hatasını anladı, takım bu hoşgörüyü sevdi.") } }
        ]
    },
    {
        type: "rpgAgentBlackmail",
        condition: () => Math.random() < 0.20,
        title: "💼 Menajer Şantajı",
        desc: "Takımın en çok kazanan oyuncusunun menajeri aradı: 'Hocam benim oyuncumu son maçlarda yedek bıraktın. Eğer bu hafta ilk 11 oynamazsa basına takımda kriz var diye açıklama yaparım.'",
        options: [
            { text: "Tehdide Boyun Eğ (Oynat)", effect: { authority: -25, loyalty: -10, customAction: () => alert("Menajerin tehdidine boyun eğdin. Takımdaki diğer oyuncular senin zayıf olduğunu düşünüyor.") } },
            { text: "Menajeri Tesisten Kov!", effect: { authority: 30, president: -15, customAction: () => alert("Menajeri güvenlikle dışarı attırdın! Otoriten efsanevi boyutlara ulaştı ama yönetim bu krizden dolayı endişeli.") } }
        ]
    },
    {
        type: "rpgSocialMedia",
        condition: () => Math.random() < 0.30,
        title: "📱 Sosyal Medya Fiyaskosu",
        desc: "Bir oyuncunuz, en büyük rakibinizin galibiyet gönderisini yanlışlıkla 'beğendi'. Taraftar sosyal medyada oyuncuyu linç ediyor, tesisleri basmakla tehdit ediyorlar!",
        options: [
            { text: "Oyuncuyu Medyanın Önüne At", effect: { authority: 10, loyalty: -30, fan: 20, customAction: () => alert("Taraftara şirin gözüktün ama oyuncunu sattın. Soyunma odasında kimse sana güvenmiyor artık.") } },
            { text: "Oyuncuma Sahip Çıkıyorum!", effect: { authority: 15, loyalty: 30, president: -10, customAction: () => alert("Tüm tepkileri üzerine çektin. Taraftar sana kızgın ama oyuncular senin gerçek bir lider olduğunu düşünüyor!") } }
        ]
    },
    {
        type: "rpgPitchRuined",
        condition: () => Math.random() < 0.20,
        title: "🏟️ Saha Zemini Rezayeti",
        desc: "Yönetim para kazanmak için stadyumu dün gece büyük bir rock konserine kiraladı. Konser sonrası saha zemini patates tarlasına dönmüş! Pas yapmak imkansız.",
        options: [
            { text: "Yönetimi Basına Şikayet Et", effect: { authority: 10, president: -40, customAction: () => alert("Medyaya 'Bu zeminde top oynanmaz, yönetimin vizyonu bu' dedin. Başkan deliye döndü, kovulman an meselesi!") } },
            { text: "Kendi Cebinden Çim Uzmanı Getir (-100.000 €)", effect: { budget: -0.1, president: 15, authority: 5, customAction: () => alert("Faturayı cebinden ödedin. Zemin maça yetişti, Başkan senin bu fedakarlığına bayıldı.") } }
        ]
    },
    {
        type: "rpgLegendVisit",
        condition: () => Math.random() < 0.25,
        title: "👑 Efsanenin Ziyareti",
        desc: "Kulübün efsanevi eski kaptanlarından biri idmanı ziyarete geldi. Oyuncular ona hayranlıkla bakıyor. Size taktiksel bir tavsiyede bulunmak istiyor.",
        options: [
            { text: "Tavsiyesini Dinle ve Uygula", effect: { loyalty: 15, authority: -10, customAction: () => alert("Efsaneye saygı duydun. Takım çok mutlu oldu ama antrenörlük karizman hafif çizildi.") } },
            { text: "Teşekkür Et Ama Kendi Bildiğini Oku", effect: { authority: 20, loyalty: -5, customAction: () => alert("Efsaneye 'Devir değişti abi' dedin. Otoriteni net bir şekilde kanıtladın.") } }
        ]
    },
    {
        type: "rpgFanDinner",
        condition: () => Math.random() < 0.35,
        title: "🍲 Taraftar Derneği Gecesi",
        desc: "Şehrin en fanatik taraftar derneği, düzenledikleri dayanışma yemeğine sizi davet etti. Katılırsanız yüklü bir bağış yapmanız beklenecek.",
        options: [
            { text: "Katıl ve Derneğe Bağış Yap (-50.000 €)", effect: { budget: -0.05, authority: 15, president: 5, customAction: () => alert("Yemeğe katılıp gövde gösterisi yaptın. Taraftar artık senin için ölüme bile gider!") } },
            { text: "Yoğun Olduğunu Söyleyip Reddet", effect: { authority: -10, loyalty: 5, customAction: () => alert("Taraftarı ektin. 'Hoca bizi beğenmiyor' dedikoduları çıktı. Sadece işine odaklandığın için takımın formu etkilenmedi.") } }
        ]
    },
    {
        type: "rpgBoardVisit",
        condition: () => Math.random() < 0.25,
        title: "👔 Yönetim Kurulu Baskını",
        desc: "Başkan ve 5 yönetim kurulu üyesi habersiz şekilde sabah antrenmanına geldi. Saha kenarında puro içerek idmanı izliyor ve sürekli yüksek sesle yorum yapıyorlar.",
        options: [
            { text: "İdmanı Durdurup Onlara Kahve İkram Et", effect: { president: 25, authority: -20, loyalty: -10, customAction: () => alert("Patronlara yaranmak için idmanı böldün. Yönetim seni çok sevdi ama oyuncular senin vizyonsuz olduğunu düşünüyor.") } },
            { text: "İdmanı Sertleştir, Onları Görmezden Gel", effect: { authority: 20, president: -15, loyalty: 10, customAction: () => alert("Yönetimi hiç takmadın, oyunculara 'Bana bakın!' diye bağırdın. Takım liderliğini hissetti ama patronlar bozuldu.") } }
        ]
    },
    {
        type: "rpgRefCall",
        condition: () => Math.random() < 0.20,
        title: "☎️ TFF'den Uyarı Telefonu",
        desc: "Geçen haftaki maçta hakeme yaptığınız itirazlar nedeniyle TFF yetkililerinden biri sizi gizlice aradı. 'Hocam biraz sakinleşin, yoksa hakemler size cephe alacak' dedi.",
        options: [
            { text: "Alttan Al ve Özür Dile", effect: { authority: -15, president: 10, customAction: () => alert("Politik davrandın. Federasyonla aranı düzelttin ama sahadaki 'Hırçın Hoca' imajın yıkıldı.") } },
            { text: "Gidin Hakemlerinizi Eğitin! (Telefonu Kapat)", effect: { authority: 30, president: -20, customAction: () => alert("Federasyona rest çektin! Otoriten zirvede ama hakem hataları ve federasyon cezaları yakındır.") } }
        ]
    },
    {
        type: "rpgMatchFixingRumor",
        condition: () => Math.random() < 0.15,
        title: "📰 Şok İddia: Şike Dedikodusu!",
        desc: "Yerel bir internet sitesi, takımınızın son galibiyetinde şaibe olduğunu, hakemlere hediye gönderildiğini iddia eden yalan bir haber yaptı. Ortalık karıştı!",
        options: [
            { text: "Acil Basın Toplantısı Düzenle (Meydan Oku)", effect: { authority: 25, loyalty: 15, customAction: () => alert("Kameralar karşısına geçip masaya yumruğunu vurdun. 'Alnımız ak!' dedin. Otorite ve moral zirve yaptı!") } },
            { text: "Suskun Kal, Yönetim Halleder", effect: { authority: -20, president: 5, loyalty: -15, customAction: () => alert("Korkak davrandın. İddialar takımın üzerine yapıştı, moral ve motivasyonunuz ciddi zarar gördü.") } }
        ]
    },
`;

code = code.replace(/window\.dynamicEventsPool = \[/m, "window.dynamicEventsPool = [" + additional10Events);

fs.writeFileSync('js/menu.js', code, 'utf8');
console.log('10 additional RPG events injected into menu.js!');

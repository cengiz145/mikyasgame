const fs = require('fs');
let code = fs.readFileSync('js/menu.js', 'utf8');

const newEvents = `
    // --- [YENİ] HAFTA İÇİ RPG OLAYLARI ---
    {
        type: "rpgNightclub",
        condition: () => Math.random() < 0.30, // %30 ihtimalle çıkabilir
        title: "🍷 Gece Kulübü Skandalı!",
        desc: "Yardımcı antrenör telaşla yanınıza gelir: 'Hocam, takımın en önemli oyuncularından biri dün gece geç saatlere kadar gece kulübünde eğlenirken yakalanmış. Görüntüler basına sızmak üzere, ne yapalım?'",
        options: [
            { 
                text: "Kadro Dışı Bırak ve Ceza Kes!", 
                effect: { 
                    authority: 15, 
                    loyalty: -15, 
                    president: 5,
                    customAction: () => alert("Oyuncuyu cezalandırdın! Otoriten pekişti ama oyuncu sana fena halde küstü. Takım içindeki huzur bozulabilir.")
                } 
            },
            { 
                text: "Üstünü Ört, Aramızda Kalsın", 
                effect: { 
                    authority: -15, 
                    loyalty: 20, 
                    president: -10,
                    customAction: () => alert("Skandalın üstünü örttün. Oyuncu sana sadakatle bağlandı ama otoriten sarsıldı, başkan ise bu durumdan pek hoşnut değil.")
                } 
            }
        ]
    },
    {
        type: "rpgPresidentTactic",
        condition: () => window.presidentConfidence > 30 && Math.random() < 0.25,
        title: "📞 Başkanın Müdahalesi",
        desc: "Başkan sizi bizzat aradı: 'Hocam, hafta sonu oynayacağımız maç çok kritik. Medyaya söz verdim, sahaya çift forvet ve çok ofansif bir sistemle çıkmamız lazım. İstediğim kadroyu sahaya süreceksin değil mi?'",
        options: [
            { 
                text: "Tabii ki Başkanım, Emredersiniz", 
                effect: { 
                    president: 20, 
                    authority: -20, 
                    loyalty: -5,
                    customAction: () => alert("Başkana boyun eğdin! Başkanın güveni arttı ancak takım ve medya senin 'Başkanın Adamı' olduğunu konuşuyor. Otoriten sarsıldı.")
                } 
            },
            { 
                text: "Soyunma Odasının Anahtarı Bende!", 
                effect: { 
                    president: -25, 
                    authority: 25, 
                    loyalty: 10,
                    customAction: () => alert("Başkana rest çektin! 'Takıma ben karışırım' dedin. Otoriten tavan yaptı, oyuncular karakterine saygı duydu ancak Başkanla arandaki ipler gerildi.")
                } 
            }
        ]
    },
    {
        type: "rpgRivalProvocation",
        condition: () => Math.random() < 0.35,
        title: "⚔️ Rakip Hocadan Tahrik!",
        desc: "Hafta sonu oynayacağınız takımın hocası gazetelere flaş bir demeç verdi: 'Bizden korkuyorlar, sahaya çıkıp 90 dakika defans yapacaklar. Onları rahat yeneceğiz!'",
        options: [
            { 
                text: "Saha İçinde Cevap Vereceğiz (Sessiz Kal)", 
                effect: { 
                    authority: 5, 
                    president: 5,
                    customAction: () => alert("Profesyonelce davrandın. Takım sessizce maça odaklandı. Risk almadın.")
                } 
            },
            { 
                text: "Kimin Korkak Olduğunu Görecekler! (Agresif Yanıt)", 
                effect: { 
                    loyalty: 15, 
                    authority: 10, 
                    president: -5,
                    customAction: () => alert("Medyada büyük bir söz savaşı başlattın! Taraftar ve takım gaza geldi, motivasyon tavan yaptı ama üzerinizdeki baskı inanılmaz derecede arttı.")
                } 
            }
        ]
    },
`;

code = code.replace(/window\.dynamicEventsPool = \[/m, "window.dynamicEventsPool = [" + newEvents);

fs.writeFileSync('js/menu.js', code, 'utf8');
console.log('RPG events injected into menu.js!');

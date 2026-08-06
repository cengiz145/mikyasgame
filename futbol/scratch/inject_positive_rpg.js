const fs = require('fs');
let code = fs.readFileSync('js/menu.js', 'utf8');

const positiveEvents = `
    // --- [YENİ] HAFTA İÇİ İYİ OLAYLAR ---
    {
        type: "rpgSponsorSurprise",
        condition: () => Math.random() < 0.35, // Çıkma ihtimali
        title: "🎁 Beklenmedik Destek!",
        desc: "Şehrin önde gelen iş adamlarından biri tesisleri ziyaret etti. Takımın son haftalardaki mücadelesini çok beğendiğini söyleyerek kulübe 500.000 € bağış yapmak istiyor.",
        options: [
            { 
                text: "Teşekkür Et ve Kabul Et", 
                effect: { 
                    budget: 0.5, // 500 bin euro
                    president: 10, 
                    authority: 5,
                    customAction: () => alert("Bağış kulübün kasasına girdi! Başkan bu ekstra gelirden dolayı çok mutlu.")
                } 
            }
        ]
    },
    {
        type: "rpgTeamDinner",
        condition: () => Math.random() < 0.40,
        title: "🍽️ Takım Yemeği",
        desc: "Takım kaptanı yanınıza geldi: 'Hocam, hafta sonu maçı öncesi takımın moralini yükseltmek için dışarıda bir moral yemeği organize ettik. Sizin de katılmanızı çok isteriz.'",
        options: [
            { 
                text: "Katıl ve Hesabı Sen Öde (-50.000 €)", 
                effect: { 
                    budget: -0.05, 
                    loyalty: 25, 
                    president: 0,
                    customAction: () => alert("Yemekte oyuncularla harika vakit geçirdin ve hesabı ödeyerek büyük bir jest yaptın. Takımın sana olan sadakati ve morali tavan yaptı!")
                } 
            },
            { 
                text: "Siz Eğlenin, Benim Taktik Çalışmam Lazım", 
                effect: { 
                    authority: 15, 
                    loyalty: 5, 
                    customAction: () => alert("Yemeğe katılmadın ama takımın bu kaynaşma çabasını takdir ettin. İşkolik tavrın oyuncuların sana olan saygısını (Otoriteni) artırdı.")
                } 
            }
        ]
    },
    {
        type: "rpgFanLove",
        condition: () => Math.random() < 0.35,
        title: "❤️ Taraftarın Sevgisi",
        desc: "Antrenman çıkışında tesislerin kapısında bekleyen küçük bir taraftar grubu gördünüz. Ellerinde 'Sana İnanıyoruz Hocam!' yazılı bir pankart var ve saatlerdir sizi bekliyorlar.",
        options: [
            { 
                text: "Arabandan İn ve Onlarla Fotoğraf Çekil", 
                effect: { 
                    authority: 20, 
                    president: 5,
                    customAction: () => alert("Mütevazı tavrın sosyal medyada viral oldu! Taraftarın ve yönetimin gözündeki saygınlığın (Otoriten) inanılmaz arttı.")
                } 
            },
            { 
                text: "Onlara Kulüp Mağazasından Forma Hediye Et (-10.000 €)", 
                effect: { 
                    budget: -0.01,
                    authority: 10, 
                    loyalty: 10,
                    customAction: () => alert("Çocuklara yaptığın bu sürpriz herkesin içini ısıttı. Hem oyuncuların hem de taraftarın sana olan sevgisi pekişti.")
                } 
            }
        ]
    },
`;

// Insert the new events right after the existing ones we added
code = code.replace(/window\.dynamicEventsPool = \[/m, "window.dynamicEventsPool = [" + positiveEvents);

// Günlük ihtimali %25'ten %35'e çıkaralım (ortalama 3 günde bir olay olsun)
code = code.replace(/Math\.random\(\) < 0\.25 && typeof window\.triggerDynamicEvent === 'function'/g, "Math.random() < 0.35 && typeof window.triggerDynamicEvent === 'function'");


fs.writeFileSync('js/menu.js', code, 'utf8');
console.log('Positive RPG events injected and frequency updated!');

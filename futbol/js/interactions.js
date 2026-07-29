// interactions.js - Oyuncu İletişim ve Menajere Bağlılık Sistemi

window.openPlayerInteraction = function(player) {
    if (player.talkedThisWeek) {
        alert("Bu oyuncuyla bu hafta zaten görüştünüz. Haftaya tekrar deneyin.");
        return;
    }

    // Oyuncunun durumuna göre bir senaryo belirle
    let scenario = getPlayerScenario(player);
    
    // Modalı oluştur ve ekranda göster
    renderInteractionModal(player, scenario);
};

function getPlayerScenario(player) {
    if (player.loyalty === undefined || isNaN(player.loyalty)) player.loyalty = 50;
    if (player.morale === undefined || isNaN(player.morale)) player.morale = 75;
    if (player.condition === undefined || isNaN(player.condition)) player.condition = 100;
    
    let isAggressive = (player.mentalTrait === 'aggressive');

    // 0. İsyan / Küstahlık
    if (player.loyalty === 0) {
        return {
            text: isAggressive 
                  ? "Bana hoca falan deme! Seninle muhatap bile olmak istemiyorum. Çık odamdan!" 
                  : "Saygısızlık etmek istemem hocam, ancak aramızdaki bağ tamamen koptu. İzninizle...",
            options: [
                {
                    text: "Peki, sen bilirsin.",
                    action: (p) => {
                        return "Görüşme sona erdi.";
                    }
                }
            ]
        };
    }

    // 1. İlgilenmeme kaprisi (Konuşulmamış ve puanı düşmüşse)
    if (player.loyalty < 50) {
        return {
            text: isAggressive 
                  ? "Aylardır yüzüme baktığınız yok! Takımdaki varlığımı hiçe sayıyorsunuz!" 
                  : "Hocam affedersiniz ama son zamanlarda benimle pek ilgilenmediğinizi hissediyorum. Gözden mi düştüm?",
            options: [
                {
                    text: "Haklısın, seni ihmal ettim. Sen bu takım için değerlisin.",
                    action: (p) => {
                        p.loyalty += 7; // Gönlü alındı
                        return isAggressive ? "Heh, sonunda bunu duymak güzel." : "Teşekkür ederim hocam, kendimi daha iyi hissediyorum.";
                    }
                },
                {
                    text: "Sızlanmayı bırak da işine bak!",
                    action: (p) => {
                        p.loyalty -= 7; // Ters tepti
                        if (p.loyalty < 0) p.loyalty = 0;
                        return isAggressive ? "Bu saygısızlığınızı unutmayacağım!" : "Sizden de bu beklenirdi zaten... (Kırgın bir şekilde çıktı)";
                    }
                }
            ]
        };
    }

    // 2. Yedek kalmaktan bıkmışsa
    if (player.benchedMatches > 2) {
        return {
            text: isAggressive
                  ? "Ben bu takımın en iyisiyim! Yedek kalmak gururuma dokunuyor, o formayı hemen istiyorum!"
                  : "Hocam haftalardır kulübedeyim. Lütfen bana da kendimi kanıtlama şansı verin.",
            options: [
                {
                    text: "Sakin ol evlat, bu hafta sana şans vereceğim.",
                    action: (p) => {
                        p.loyalty += 7;
                        p.promisedNextMatch = true; 
                        return isAggressive ? "Sonunda doğru kararı verdiniz!" : "Çok teşekkür ederim hocam, yüzünüzü kara çıkarmayacağım.";
                    }
                },
                {
                    text: "Kadroyu ben kurarım! Sen sadece antrenmanına odaklan.",
                    action: (p) => {
                        p.loyalty -= 7;
                        if (p.mentalTrait === 'aggressive') p.power += 0.5; // Hırslanır
                        return isAggressive ? "Göreceğiz bakalım o takım bensiz ne yapacak!" : "Siz nasıl isterseniz hocam... (Söylenerek odadan çıktı)";
                    }
                }
            ]
        };
    }
    
    // 3. Yorgunsa
    if (player.condition < 60) {
        return {
            text: isAggressive
                  ? "Bu nasıl bir tempo hocam? Robot değiliz biz, kaslarım koptu kopacak!"
                  : "Hocam antrenmanlar beni çok yıprattı. Dinlenmeye ihtiyacım var, sakatlanmaktan korkuyorum.",
            options: [
                {
                    text: "Haklısın, sağlığın her şeyden önemli. Bu hafta idmanları hafifletiyorum.",
                    action: (p) => {
                        p.loyalty += 7;
                        p.condition += 25; 
                        return isAggressive ? "İyi, en azından laf anlıyorsunuz." : "Beni anladığınız için çok sağ olun hocam.";
                    }
                },
                {
                    text: "Futbol fedakarlık ister! Sahada yürümeyeceksin, koşacaksın!",
                    action: (p) => {
                        p.loyalty -= 7;
                        if (p.mentalTrait === 'elite') p.power += 1.0; 
                        p.condition -= 10; 
                        return isAggressive ? "Beni öldürmek mi istiyorsunuz! Alın formayı o zaman!" : "Haklısınız hocam, daha çok çalışacağım... (Gözleri doldu)";
                    }
                }
            ]
        };
    }

    // 4. Rastgele Pozitif / Standart Muhabbet VEYA Arkadaşlık Senaryoları
    const friendshipScenarios = [
        // 1. Pas Bencilliği
        {
            text: "Hocam, forvetteki arkadaşımız bana asla pas atmıyor! Sadece kendi istatistiğini düşünüyor, takımın kazanması umurunda değil.",
            options: [
                { text: "Bunu onunla konuşacağım, sahadaki bencilliğe asla müsamaha göstermem.", action: (p) => { p.loyalty += 5; return "Haklısınız hocam, takım oyunu her şeydir."; } },
                { text: "Sahada şut atmak forvetin işidir, sen kendi pozisyonuna odaklan.", action: (p) => { p.loyalty -= 5; return "Öyle mi? Anlaşıldı hocam, biz boşuna koşuyoruz..."; } }
            ]
        },
        // 2. Sert İdman Müdahalesi
        {
            text: "Dünkü idmanda defanstaki arkadaşımız bileğime kasten sert girdi! Bu takımda kimse beni korumuyor.",
            options: [
                { text: "Antrenmanda tatlı sertlik olur ama kasıt varsa cezasını ben veririm. Merak etme.", action: (p) => { p.loyalty += 5; p.condition += 5; return "Bana sahip çıktığınız için teşekkürler hocam."; } },
                { text: "Futbol bale değildir! Ayakta kalmayı öğreneceksin.", action: (p) => { p.loyalty -= 8; if(p.mentalTrait === 'aggressive') p.power += 0.5; return "Bale değil anladık ama bacağımı kırıyordu!"; } }
            ]
        },
        // 3. Soyunma Odası Müzik Kavgası
        {
            text: "Hocam soyunma odasında hep aynı müzikler çalıyor, değiştirmek isteyince üstüme yürüdüler!",
            options: [
                { text: "Bugün müzik listesini sen yapıyorsun, itiraz eden olursa bana gönder.", action: (p) => { p.loyalty += 8; return "İşte beklediğim adalet! Teşekkürler hocam."; } },
                { text: "Böyle çocukça şeylerle bana gelmeyin, kendi aranızda çözün.", action: (p) => { p.loyalty -= 3; return "Peki hocam, biz kendi aramızda hallederiz o zaman..."; } }
            ]
        },
        // 4. Yeni Transfere Cephe
        {
            text: "Yeni gelen arkadaşımız bizimle hiç konuşmuyor, kendini bizden üstün görüyor.",
            options: [
                { text: "Henüz adapte olamadı, kaptan olarak onu aranıza alıp kaynaştırmak sana düşer.", action: (p) => { p.loyalty += 5; return "Haklısınız, ona biraz daha zaman ve şans vereceğiz."; } },
                { text: "Sen onun işine karışma, sahada işini yapsın yeter.", action: (p) => { p.loyalty -= 5; return "Takım ruhu olmadan nasıl şampiyon olacağız ki?"; } }
            ]
        },
        // 5. Maaş Adaletsizliği
        {
            text: "Hocam aynı mevkide oynuyoruz ama onun maaşı benimkinin 3 katı! Bu adalet mi?",
            options: [
                { text: "Performansını böyle yüksek tutmaya devam et, sözleşme yenilerken bizzat yönetimle konuşacağım.", action: (p) => { p.loyalty += 10; return "Sözünüze güveniyorum hocam, sahada her şeyimi vereceğim."; } },
                { text: "Parayı değil formayı düşün! Sözleşmeye imza atarken bana mı sordun?", action: (p) => { p.loyalty -= 15; return "Demek öyle... Artık ne kadar ekmek, o kadar köfte!"; } }
            ]
        },
        // 6. Kaptanlık Pazubendi
        {
            text: "Ben bu kulübün evladıyım ama kaptanlığı benden çok daha yeni olan birine verdiniz...",
            options: [
                { text: "Haklısın evlat. İkinci kaptanımız sensin, takımın saha içindeki gizli lideri olacaksın.", action: (p) => { p.loyalty += 8; return "Gizli liderlik de fena değil... Teşekkürler hocam."; } },
                { text: "Pazubent sadece bir kumaş parçasıdır, liderlik ruhta biter.", action: (p) => { p.loyalty -= 5; return "O kumaş parçasının bir anlamı var ama neyse..."; } }
            ]
        },
        // 7. Medya Kıskançlığı
        {
            text: "Maçı kazandıran golü ben atıyorum ama manşetlerde hep o var! Takım içinde ayrımcılık yapılıyor.",
            options: [
                { text: "Basının ne yazdığı umurumda değil, benim raporumda maçın yıldızı sensin.", action: (p) => { p.loyalty += 10; p.condition += 5; return "Sizin bu sözleriniz manşetlerden çok daha değerli hocam!"; } },
                { text: "Şov yapmak yerine futbol oynamaya odaklan, manşetleri değil maçları kazanıyoruz.", action: (p) => { p.loyalty -= 7; return "Herkes şov yapıyor da bir ben mi battım gözünüze?"; } }
            ]
        },
        // 8. Hocanın Prensi Sendromu
        {
            text: "Açık konuşalım hocam, takımda bazı oyuncuların sizin tarafınızdan kayırıldığını düşünüyoruz.",
            options: [
                { text: "Benim tek prensim formayı en çok terletendir. Kimseye ayrıcalık yok, bunu tüm takıma söyle.", action: (p) => { p.loyalty += 5; return "Umarım öyledir hocam, takım olarak bunu duymaya ihtiyacımız vardı."; } },
                { text: "Haddini bil! Kararlarımı sorgulamak senin işin değil.", action: (p) => { p.loyalty -= 10; return "Nasıl isterseniz 'imparator'... Ben sadece uyarmak istemiştim."; } }
            ]
        },
        // 9. Kötü Oynayana Destek
        {
            text: "Hocam, dünkü maçta hata yapan arkadaşımızın çok morali bozuk. Ona destek olmak için bu akşam yemeğe çıkarabilir miyim?",
            options: [
                { text: "Harika bir fikir, hesaplar benden. Gerçek bir takım böyle günlerde belli olur.", action: (p) => { p.loyalty += 12; return "Adamsınız hocam! Bu takım için canımızı veririz."; } },
                { text: "Yemeği boşver, sahada ayağına hakim olmayı öğrensin. Kampa erken girin.", action: (p) => { p.loyalty -= 8; return "En ufak bir moral desteğine bile izin vermiyorsunuz..."; } }
            ]
        },
        // 10. Özel Gol Sevinci
        {
            text: "Hocam, forvet hattıyla özel bir gol sevinci koreografisi çalıştık. Maçta yaparsak kızmazsınız değil mi?",
            options: [
                { text: "Golü atın da, isterseniz amuda kalkın! Taraftar bunu sevecektir.", action: (p) => { p.loyalty += 8; return "Harika! Hafta sonu size güzel bir sürprizimiz olacak."; } },
                { text: "Sirke çevirmeyin sahayı! Ciddiyetinizi koruyun ve yerinize dönün.", action: (p) => { p.loyalty -= 5; return "Peki hocam, biz işimize bakalım..."; } }
            ]
        },
        // 11. Sakatlanan Arkadaşa Söz
        {
            text: "Bu haftaki maçı, sakatlanan arkadaşımız için oynayacağız. İzninizle sahaya pankartla çıkmak istiyoruz.",
            options: [
                { text: "Çok asil bir davranış. Pankartı hazırlatıyorum, maçı da onun için kazanın!", action: (p) => { p.loyalty += 10; if(p.power < 90) p.power += 1; return "İşte gerçek takım ruhu! Bu maçı parçalayacağız!"; } },
                { text: "Kuralları çiğneyemeyiz, sahaya çıkın ve sadece futbolunuza odaklanın.", action: (p) => { p.loyalty -= 6; return "Duygusuzluğunuza inanamıyorum hocam."; } }
            ]
        },
        // 12. Özel Frikik Çalışması
        {
            text: "Hocam, idmandan sonra frikik ustamızla sahada kalıp ekstra şut çalışmak istiyoruz.",
            options: [
                { text: "Çok çalışanın hakkı yenmez. Sahanın ışıklarını açık bırakıyorum, kolay gelsin.", action: (p) => { p.loyalty += 8; p.condition -= 5; return "Çok teşekkürler hocam, hafta sonu o frikik gol olacak!"; } },
                { text: "Hayır, herkesle aynı anda idmanı bitirip dinleneceksin. Sakatlık riskine giremem.", action: (p) => { p.loyalty -= 3; p.condition += 5; return "Biraz ekstra çalışmaktan zarar gelmezdi ama siz bilirsiniz."; } }
            ]
        },
        // 13. Gençlere Abilik
        {
            text: "Hocam, altyapıdan yeni çıkan çocukların heyecanını görüyorum. Onları kanatlarımın altına almak isterim.",
            options: [
                { text: "İşte benim kaptanım! O çocukların sana ihtiyacı var, tecrübelerini onlara aktar.", action: (p) => { p.loyalty += 10; return "Gururla hocam. Kulübün geleceği emin ellerde."; } },
                { text: "Sen kendi futboluna odaklan, altyapı koçları o işi halleder.", action: (p) => { p.loyalty -= 5; return "Yardımcı olmak istemiştim sadece..."; } }
            ]
        },
        // 14. Yabancı Oyuncuya Adaptasyon
        {
            text: "Yeni transferimizin hiç dil bilmediğini fark ettim. Onu evimde misafir edip şehri gezdirebilir miyim?",
            options: [
                { text: "Muazzam bir liderlik örneği! Faturayı bana gönder, takım ruhunu sen inşa ediyorsun.", action: (p) => { p.loyalty += 12; return "Teşekkürler hocam, aramızdaki bağ çok daha güçlenecek."; } },
                { text: "Özel hayatını işine karıştırma. Sahada birbirinizi anlamanız yeterli.", action: (p) => { p.loyalty -= 6; return "Buz gibi bir takımız sizin yüzünüzden."; } }
            ]
        },
        // 15. Yeteneksiz ama Çalışkan
        {
            text: "Takımda yeteneği kısıtlı ama çok çabalayan bir kardeşimiz var. Onun ekstra idmanlarına yardımcı olmak istiyorum.",
            options: [
                { text: "Böyle takım arkadaşlarına can kurban. İstediğiniz kadar tesisleri kullanabilirsiniz.", action: (p) => { p.loyalty += 8; return "Süper! Onu çok daha iyi bir oyuncu yapacağız."; } },
                { text: "Yeteneksiz adamla vakit kaybetme, bu takımın hedefleri var.", action: (p) => { p.loyalty -= 10; return "Sizin futbol felsefeniz çok acımasız hocam."; } }
            ]
        },
        // 16. Gece Hayatına Müdahale
        {
            text: "Hocam, takımdan bir arkadaşımızın gece hayatı biraz kontrolden çıktı. Onu uyarmak istiyorum ama yanlış anlar diye korkuyorum.",
            options: [
                { text: "Sen arkadaşça uyarını yap, baktın olmuyor topu bana at ben cezasını keserim.", action: (p) => { p.loyalty += 7; return "Tamamdır hocam, olayı çözmeye çalışacağım."; } },
                { text: "Onun avukatı mısın sen? Disiplin benim işim, karışma!", action: (p) => { p.loyalty -= 5; return "Bir daha takım arkadaşlarımı düşünmeyeceğim, anlaşıldı."; } }
            ]
        },
        // 17. Yabancılar vs Yerliler
        {
            text: "Hocam, soyunma odasında yabancı oyuncular tamamen kendi aralarında takılıyor. Takım ikiye bölündü!",
            options: [
                { text: "Hemen yarın akşam tüm takıma barbekü partisi veriyoruz. Bu sorunu kökünden çözeceğiz.", action: (p) => { p.loyalty += 10; return "Müthiş fikir! Etler benden hocam."; } },
                { text: "Bana böyle dedikodularla gelmeyin, sahaya çıkıp topunuzu oynayın.", action: (p) => { p.loyalty -= 8; return "Sorunları halı altına süpürürsek daha çok kaybederiz."; } }
            ]
        },
        // 18. Gençler vs Yaşlılar
        {
            text: "Takımın tecrübeli isimleri bize sürekli bağırıyor, sahada hata yapınca faturayı hep bize kesiyorlar.",
            options: [
                { text: "Bunu takım kaptanıyla konuşacağım, kimsenin moralinizi bozmasına izin vermem.", action: (p) => { p.loyalty += 8; return "Arkamızda durduğunuz için sağ olun hocam."; } },
                { text: "Tecrübeye saygı duyacaksınız! Onlar ne derse yapmak zorundasınız.", action: (p) => { p.loyalty -= 8; return "Bu takımda gençlerin hiç değeri yokmuş..."; } }
            ]
        },
        // 19. Dil/Uyruk Çetesi
        {
            text: "Brezilyalı oyuncular sahada sadece birbirlerine pas atıyor. Sanki biz bu takımda yokmuşuz gibi davranıyorlar.",
            options: [
                { text: "Antrenmanda onları farklı takımlara böleceğim. Bu çeteleşmeyi bitireceğim, merak etme.", action: (p) => { p.loyalty += 7; return "Oh be, sonunda biri duruma el atıyor."; } },
                { text: "Onların oyun görüşü daha iyi olduğu içindir, bence onlara ayak uydurmaya çalış.", action: (p) => { p.loyalty -= 10; return "Siz de o çetenin bir parçasıymışsınız meğer."; } }
            ]
        },
        // 20. İspiyoncu Suçlaması
        {
            text: "Hocam, soyunma odasında konuştuğumuz her şey ertesi gün size geliyor. Takımda sizin 'köstebeğiniz' kim?",
            options: [
                { text: "Benim köstebeğe ihtiyacım yok, sizin hocanız olarak her şeyi hissederim. Bana güvenin.", action: (p) => { p.loyalty += 5; return "Haklısınız hocam, galiba paranoya yapıyoruz..."; } },
                { text: "Siz ne konuşursanız anında haberim olur, adımınızı denk atın!", action: (p) => { p.loyalty -= 12; return "Soyunma odasında diktatörlük var demek... Güvenimiz sıfır."; } }
            ]
        }
    ];

    // %60 ihtimalle yeni 20 dinamik senaryodan biri gelsin
    if (Math.random() < 0.6) {
        let randomFriendshipScenario = friendshipScenarios[Math.floor(Math.random() * friendshipScenarios.length)];
        return randomFriendshipScenario;
    }

    // Aksi halde Standart Pozitif Muhabbet
    return {
        text: isAggressive
              ? "Sahaya çıkıp herkesi darmadağın edeceğim hocam! Ben hazırım!"
              : "Hocam her şey yolunda. Hafta sonu maçta takım için elimden geleni yapacağım.",
        options: [
            {
                text: "Aferin koçum, sana güveniyorum! Aynen böyle devam.",
                action: (p) => {
                    p.loyalty += 7;
                    p.condition += 5; // Moral motivasyon
                    return isAggressive ? "Tabii ki bana güveneceksiniz!" : "Adamsınız hocam!";
                }
            },
            {
                text: "Sözle değil, sahada göreceğiz. Rehavete kapılma.",
                action: (p) => {
                    p.loyalty -= 7;
                    return isAggressive ? "Görürüz o zaman sahada!" : "Peki hocam, anlaşıldı.";
                }
            }
        ]
    };
}

function renderInteractionModal(player, scenario) {
    // Varsa eskisini sil
    let oldModal = document.getElementById('interaction-modal');
    if (oldModal) oldModal.remove();

    let overlay = document.createElement('div');
    overlay.id = "interaction-modal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex"; if(overlay) { let title = overlay.querySelector('h1, h2'); if(title) title.focus(); else overlay.focus(); };
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";

    let modalBox = document.createElement('div');
    modalBox.style.background = "linear-gradient(to bottom, #2c3e50, #34495e)";
    modalBox.style.border = "3px solid #3498db";
    modalBox.style.borderRadius = "15px";
    modalBox.style.padding = "30px";
    modalBox.style.maxWidth = "600px";
    modalBox.style.width = "90%";
    modalBox.style.color = "white";
    modalBox.style.textAlign = "center";
    modalBox.style.boxShadow = "0 15px 30px rgba(0,0,0,0.5)";

    let title = document.createElement('h2');
    title.style.color = "#f1c40f";
    title.style.marginBottom = "5px";
    title.innerHTML = `Birebir Görüşme: ${player.name}`;

    let expressionText = "";
    if (player.loyalty === 0) expressionText = "Gözlerinden ateş saçıyor, size büyük bir öfkeyle bakıyor.";
    else if (player.loyalty < 30) expressionText = "Yüzünde çok soğuk, mesafeli ve gergin bir ifade var.";
    else if (player.loyalty < 50) expressionText = "Gözlerini sizden kaçırıyor, kırgın ve isteksiz görünüyor.";
    else if (player.loyalty < 70) expressionText = "Sakin, sıradan ve profesyonel bir duruş sergiliyor.";
    else if (player.loyalty < 90) expressionText = "Yüzünde hafif bir tebessüm var, size saygıyla bakıyor.";
    else expressionText = "Gözleri parlıyor! Size olan hayranlığı duruşundan belli oluyor.";

    if (player.condition < 60) {
        expressionText += " Ayrıca göz altları çökmüş, bedenen çok yorgun görünüyor.";
    }

    let loyText = document.createElement('div');
    loyText.style.color = "#bdc3c7";
    loyText.style.marginBottom = "20px";
    loyText.innerHTML = `<em>Gözleminiz: ${expressionText}</em>`;

    let dialogueBox = document.createElement('div');
    dialogueBox.style.backgroundColor = "rgba(0,0,0,0.4)";
    dialogueBox.style.padding = "20px";
    dialogueBox.style.borderRadius = "10px";
    dialogueBox.style.marginBottom = "25px";
    dialogueBox.style.fontStyle = "italic";
    dialogueBox.style.fontSize = "1.2rem";
    dialogueBox.innerText = `"${scenario.text}"`;

    if(typeof speak === 'function') speak(player.name + " diyor ki: " + scenario.text);

    let optionsContainer = document.createElement('div');
    optionsContainer.style.display = "flex"; if(optionsContainer) { let title = optionsContainer.querySelector('h1, h2'); if(title) title.focus(); else optionsContainer.focus(); };
    optionsContainer.style.flexDirection = "column";
    optionsContainer.style.gap = "15px";

    scenario.options.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = "menu-button";
        btn.style.backgroundColor = "#27ae60";
        btn.style.whiteSpace = "normal";
        btn.style.height = "auto";
        btn.style.padding = "15px";
        btn.style.fontSize = "1rem";
        btn.innerText = opt.text;

        btn.onclick = () => {
            let resultMessage = opt.action(player); // Değişiklikleri uygula
            player.talkedThisWeek = true; // Haftada 1 görüşme kuralı
            
            // Sınırları ve NaN bozulmalarını koru
            if (isNaN(player.loyalty)) player.loyalty = 50;
            if (player.loyalty > 100) player.loyalty = 100;
            if (player.loyalty < 0) player.loyalty = 0;
            
            if (isNaN(player.condition)) player.condition = 100;
            if (player.condition > 100) player.condition = 100;
            if (player.condition < 0) player.condition = 0;
            
            if (isNaN(player.morale)) player.morale = 75;
            if (player.morale > 100) player.morale = 100;
            if (player.morale < 0) player.morale = 0;

            // Sonucu göster
            dialogueBox.style.backgroundColor = "#2980b9";
            dialogueBox.innerText = `"${resultMessage}"`;
            
            if(typeof speak === 'function') speak(resultMessage);

            // Butonları gizle, kapat butonu çıkar
            optionsContainer.innerHTML = "";
            let closeBtn = document.createElement('button');
            closeBtn.className = "menu-button";
            closeBtn.style.backgroundColor = "#e74c3c";
            closeBtn.innerText = "Görüşmeyi Bitir";
            closeBtn.onclick = () => {
                overlay.remove();
                if(typeof loadSquadScreen === 'function') loadSquadScreen(); // Ekrandaki buton/yüzde güncellensin
            };
            optionsContainer.appendChild(closeBtn);
        };
        optionsContainer.appendChild(btn);
    });

    modalBox.appendChild(title);
    modalBox.appendChild(loyText);
    modalBox.appendChild(dialogueBox);
    modalBox.appendChild(optionsContainer);
    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);
};

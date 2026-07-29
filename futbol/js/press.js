// İki Aşamalı Basın Toplantısı Sistemi (Açılış Konuşması -> Soru Cevap) ve Oyuncu Reaksiyonları

// --- 1. AŞAMA: AÇILIŞ KONUŞMALARI (STATEMENTS) ---
const preMatchStatements = [
    {
        text: "Kazanmaya Geldik: \"Bugün buraya sadece 3 puan için geldik, başka bir sonuç düşünmüyoruz.\"",
        effect: { president: 0, authority: 5, fan: 10, playerLoyalty: 0, playerMorale: 10 },
        msg: "Açılış konuşmanızdaki iddialı tavır taraftarı ateşledi, takımın özgüvenini artırdı."
    },
    {
        text: "Temkinli Yaklaşım: \"Zor bir takıma karşı oynayacağız, eksiklerimiz var ama savaşacağız.\"",
        effect: { president: 5, authority: -5, fan: 0, playerLoyalty: 0, playerMorale: -5 },
        msg: "Mütevazı açıklamalarınız yönetimi memnun etti ancak takıma biraz tedirginlik verdi."
    },
    {
        text: "Sessiz Kalma: \"Şu an maçtan başka bir şey düşünmüyoruz, sahada konuşacağız.\"",
        effect: { president: 0, authority: 5, fan: 5, playerLoyalty: 5, playerMorale: 5 },
        msg: "Soğukkanlı ve profesyonel duruşunuz takdir topladı, oyuncularınızın size saygısı arttı."
    }
];

const postMatchStatements = {
    win: [
        { text: "Hak Ettik: \"Harika oynadık ve hak ettiğimiz bir 3 puan aldık. Oyuncularımla gurur duyuyorum.\"", effect: { president: 5, authority: 10, fan: 10, playerLoyalty: 15, playerMorale: 15 }, msg: "Galibiyet sonrası oyuncularınızı yüceltmeniz onların size olan sadakatini zirveye çıkardı!" },
        { text: "Daha İyisi Olabilirdi: \"Kazandık ama hatalarımız var, bunları düzelteceğiz.\"", effect: { president: 10, authority: 5, fan: 0, playerLoyalty: -5, playerMorale: -5 }, msg: "Mükemmeliyetçi yapınız başkanın hoşuna gitti ama oyuncularınız biraz burkuldu." }
    ],
    loss: [
        { text: "Hakem Eleştirisi: \"Bugün sahada sadece bizim hatalarımız yoktu, hakem kararları maça damga vurdu!\"", effect: { president: -10, authority: 10, fan: 15, playerLoyalty: 10, playerMorale: 5 }, msg: "Faturayı hakeme keserek takımı korumanız oyuncularınızın hoşuna gitti." },
        { text: "Sorumluluk Alma: \"İstediğimizi sahaya yansıtamadık, tüm sorumluluk bana ait.\"", effect: { president: 5, authority: -5, fan: 5, playerLoyalty: 15, playerMorale: 10 }, msg: "Yenilginin sorumluluğunu alarak takımı korumanız, onların size olan sadakatini çok artırdı." },
        { text: "Oyuncuları Suçlama: \"Bazı oyuncularımın performansı bu formaya yakışmıyor.\"", effect: { president: 5, authority: 15, fan: 0, playerLoyalty: -20, playerMorale: -20 }, msg: "Oyuncularınızı medya önüne atmanız soyunma odasında isyan çıkardı! Sadakat ve moral dibe vurdu." }
    ],
    draw: [
        { text: "Şanssızlık: \"Kazanabilirdik ama şanssız anlar yaşadık, sağlık olsun.\"", effect: { president: 0, authority: 0, fan: 0, playerLoyalty: 5, playerMorale: 0 }, msg: "Sakin bir açıklama yaptınız, takım rahatladı." },
        { text: "Hayal Kırıklığı: \"Bu sonuç bizi tatmin etmiyor, daha iyisini yapmalıyız.\"", effect: { president: 5, authority: 5, fan: 5, playerLoyalty: -5, playerMorale: -5 }, msg: "Hırsınız yönetimde olumlu bir etki yarattı." }
    ]
};

// --- 2. AŞAMA: GAZETECİ SORULARI (QUESTIONS) ---
const preMatchQuestions = [
    {
        reporter: "Fanatik Gazetesi:",
        text: "\"Hocam, takımın antrenmanlardaki hırsı maça nasıl yansıyacak?\"",
        options: [
            { text: "Politik: \"Oyuncularımın neşesi yerinde, elimizden geleni yapacağız.\"", effect: { president: 5, authority: 0, fan: 0, playerLoyalty: 5, playerMorale: 5 }, msg: "Sade bir yanıt takıma huzur verdi." },
            { text: "İddialı: \"Sahada fırtına gibi eseceğiz, rakipler korksun!\"", effect: { president: 0, authority: 5, fan: 10, playerLoyalty: 0, playerMorale: 10 }, msg: "İddialı sözler taraftarı ve takımı coşturdu!" },
            { text: "Suçlayıcı: \"Bazı oyuncular idmanlarda isteksiz, umarım maça yansımaz.\"", effect: { president: -5, authority: -10, fan: -5, playerLoyalty: -15, playerMorale: -15 }, msg: "Oyuncularla medya önünde didişmeniz takımı küstürdü." }
        ]
    }
];

const postMatchQuestions = [
    {
        reporter: "DHA Spor:",
        text: "\"Hocam, 90 dakikanın ardından genel performans hakkında ne söylersiniz?\"",
        options: [
            { text: "Politik: \"Lig uzun bir maraton, maç maç ilerliyoruz.\"", effect: { president: 5, authority: 0, fan: 0, playerLoyalty: 0, playerMorale: 0 }, msg: "Standart bir yanıt." },
            { text: "Sert: \"Futbol dışı olaylar moralimizi bozuyor ama yıkılmayacağız!\"", effect: { president: -5, authority: 10, fan: 10, playerLoyalty: 5, playerMorale: 5 }, msg: "Agresif tarzınız takımı ateşledi." },
            { text: "Özeleştiri: \"Kendimizi daha çok geliştirmeliyiz, taraftardan özür dileriz.\"", effect: { president: 10, authority: 5, fan: 5, playerLoyalty: 5, playerMorale: -5 }, msg: "Taraftardan özür dilemeniz takımı biraz utandırdı ama sadakati korudu." }
        ]
    }
];

const crisisQuestions = [
    {
        reporter: "🔥 FLAŞ: SporX Medya Kriz Masası:",
        text: "\"Hocam, üst üste gelen mağlubiyetler sonrası taraftarın sabrı taştı ve koltuğunuzun sallandığı iddia ediliyor. İstifa etmeyi düşünüyor musunuz?\"",
        options: [
            { text: "İddialı (Meydan Okuma): \"Ben buradayım, hiçbir yere gitmiyorum! Bu takımı ben ayağa kaldıracağım.\"", effect: { president: -5, authority: 15, fan: 5, playerLoyalty: 10, playerMorale: 10 }, msg: "Korkusuz duruşunuz takımın ve taraftarın size olan inancını körükledi ama başkan özgüveninizden rahatsız." },
            { text: "Politik (Kaçamak): \"Şu an sadece önümüzdeki maça odaklanmış durumdayım, bunları konuşmanın sırası değil.\"", effect: { president: 5, authority: -5, fan: 0, playerLoyalty: 0, playerMorale: -5 }, msg: "Kaçamak cevabınız sizi hedef tahtasından şimdilik indirdi ama takımda endişe yarattı." },
            { text: "Suçlayıcı (Bahane): \"Bu fikstürde ve bu hakemlerle kim gelse kazanamaz!\"", effect: { president: -10, authority: -10, fan: -5, playerLoyalty: -10, playerMorale: -5 }, msg: "Bahane üretmeniz yönetimi çok kızdırdı, otoriteniz sarsıldı!" }
        ]
    }
];


const extremeCrisisQuestions = [
    {
        reporter: "🚨 SON DAKİKA: Tesislerin Önü Karıştı!",
        text: "\"Hocam, inanılmaz görüntüler var! Maskeli bir taraftar grubu antrenman tesislerini bastı, meşalelerle sahaya girip oyunculara saldırdılar! Ne yapacaksınız?\"",
        options: [
            { text: "Kavgaya Gir: \"Oyuncularımı ezdirmem!\" diyerek kavgaya dahil ol.", effect: { president: -20, authority: 40, fan: 10, playerLoyalty: 30, playerMorale: 10, injuryRisk: true, fine: 0 }, msg: "Kendini siper edip dayak yedin ama takımın gözünde kahramansın! Fakat arbedede 200.000€ tesis hasarı oluştu!" },
            { text: "Kaç: \"Polisi arayın, ben odama geçiyorum.\"", effect: { president: -10, authority: -40, fan: -30, playerLoyalty: -50, playerMorale: -50, injuryRisk: true, fine: 0 }, msg: "Oyuncuları meşalelerle baş başa bıraktın... Takım sana olan saygısını tamamen yitirdi ve 200.000€ tesis hasarı oluştu." },
            { text: "Taraftarı Destekle: \"Ruhsuzlara az bile yaptılar, taraftar haklı!\"", effect: { president: -30, authority: -10, fan: 30, playerLoyalty: -100, playerMorale: -100, injuryRisk: false, fine: 0 }, msg: "Taraftarın saldırısını meşrulaştırman takımda DEPREM etkisi yarattı. Oyuncular senden nefret ediyor!" }
        ]
    },
    {
        reporter: "📺 CANLI YAYIN SKANDALI:",
        text: "\"Hocam dün geceki spor programında ünlü bir yorumcu size 'Şarlatan' dedi. Kameralar önünde stüdyo birbirine girdi! Ne diyorsunuz?\"",
        options: [
            { text: "Dava Aç: \"Hukuki yollara başvuracağım.\"", effect: { president: 10, authority: -10, fan: -10, playerLoyalty: 0, playerMorale: 0, injuryRisk: false, fine: 0 }, msg: "Sıkıcı ve diplomatik bir yol seçtin. Otoriten biraz sarsıldı." },
            { text: "Mekanı Bas: \"O stüdyoyu başlarına yıkarım!\"", effect: { president: -40, authority: 50, fan: 50, playerLoyalty: 10, playerMorale: 10, injuryRisk: false, fine: 500000 }, msg: "Deli dolu halin taraftarı çıldırttı! Otoriten zirvede ama TFF sana 500.000€ PARA CEZASI kesti!" },
            { text: "Saldır: \"Bana şarlatan diyeni sokağa çıkamaz hale getiririm!\"", effect: { president: -50, authority: 30, fan: 30, playerLoyalty: 5, playerMorale: 5, injuryRisk: false, fine: 300000 }, msg: "Agresif tehditlerin TFF'den 300.000€ PARA CEZASI almana sebep oldu." }
        ]
    }
];

const extremeCrisisStatements = [
    { text: "Gergin: \"Şu an konuşacak pek bir şey yok, durumun farkındayız.\"", effect: { president: -5, authority: -5, fan: 0, playerLoyalty: -5, playerMorale: -5 }, msg: "Gerginliğiniz her halinizden belli oluyor." },
    { text: "Korkusuz: \"Ne olursa olsun işimizi yapmaya devam edeceğiz.\"", effect: { president: 0, authority: 10, fan: 0, playerLoyalty: 10, playerMorale: 10 }, msg: "Dimdik durmanız takımınıza biraz umut verdi." }
];

let currentPressContext = { type: "", statementEffect: null };

window.openPreMatchPressConference = function() {
    currentPressContext = { type: "pre", statementEffect: null };
    
    // [YENİ] Ağır Kriz Kontrolü
    if (window.managerAuthority !== undefined && window.managerAuthority < 35 && window.presidentConfidence < 40) {
        renderPressStatement("pre", extremeCrisisStatements);
    } else {
        renderPressStatement("pre", preMatchStatements);
    }
};

window.openPostMatchPressConference = function() {
    currentPressContext = { type: "post", statementEffect: null };
    
    // [YENİ] Dinamik Maç Senaryosu Analizi
    let matchContext = "normal"; // normal, blowout_win, blowout_loss, comeback_win
    let hattrickPlayer = null;

    if (window.lastMatchScore && typeof window.playerScore !== 'undefined' && typeof window.enemyScore !== 'undefined') {
        let diff = window.playerScore - window.enemyScore;
        if (diff >= 3) matchContext = "blowout_win";
        else if (diff <= -3) matchContext = "blowout_loss";
        
        // Comeback logic: If enemy scored first, but we won
        if (diff > 0 && window.lastMatchGoalEvents && window.lastMatchGoalEvents.length > 0) {
            if (window.lastMatchGoalEvents[0].team === 'away') {
                matchContext = "comeback_win";
            }
        }
    }

    // Hat-trick logic
    if (window.lastMatchGoalEvents && window.lastMatchGoalEvents.length > 0) {
        let playerGoals = {};
        window.lastMatchGoalEvents.forEach(e => {
            if (e.team === 'home') {
                playerGoals[e.scorer] = (playerGoals[e.scorer] || 0) + 1;
            }
        });
        for (let scorer in playerGoals) {
            if (playerGoals[scorer] >= 3) {
                hattrickPlayer = scorer;
                break;
            }
        }
    }

    window.currentMatchContext = matchContext;
    window.currentHattrickPlayer = hattrickPlayer;

    if (hattrickPlayer) {
        window.newspaperQueue = window.newspaperQueue || [];
        window.newspaperQueue.push({
            headline: "HAT-TRICK KAHRAMANI!",
            subheadline: `${hattrickPlayer} attığı 3 golle sahanın yıldızı oldu. Maç topunu evine götürdü!`,
            article: `İnanılmaz bir resital! ${hattrickPlayer} rakip savunmayı adeta ipe dizerek attığı 3 golle maçın mutlak hakimiydi. Tribünler onu ayakta alkışlarken, spor yorumcuları bu efsane performansı günlerce konuşacak.`,
            color: "#f39c12",
            bgColor: "#fff",
            priority: 70
        });
    }

    let dynamicStatements = [];
    if (matchContext === "blowout_win") {
        dynamicStatements = [
            { text: `Tarih Yazdık: "Bugün sahadaki futbol herkese ders oldu. ${window.playerScore}-${window.enemyScore}'lık skor her şeyi özetliyor."`, effect: { president: 10, authority: 15, fan: 20, playerLoyalty: 10, playerMorale: 15 }, msg: "Tarihi şovu gururla sahiplenmeniz taraftarı coşturdu!" },
            { text: `Temkinli: "Farklı kazandık ama hala eksiklerimiz var. Ayaklarımız yere basmalı."`, effect: { president: 5, authority: 5, fan: 0, playerLoyalty: -5, playerMorale: -5 }, msg: "Mükemmeliyetçi tavrınız biraz sıkıcı bulundu." }
        ];
    } else if (matchContext === "blowout_loss") {
        dynamicStatements = [
            { text: `Özür: "Bugün taraftarımıza izlettiğimiz bu hezimetten dolayı tüm camiadan özür dilerim."`, effect: { president: 5, authority: -10, fan: 10, playerLoyalty: 5, playerMorale: 0 }, msg: "Yenilgiyi kabullenip özür dilemeniz taraftarın öfkesini biraz dindirdi." },
            { text: `Sorumsuzluk: "Bu kadar fark yememiz tamamen oyuncuların disiplinsizliğinden kaynaklı!"`, effect: { president: -5, authority: 10, fan: -5, playerLoyalty: -25, playerMorale: -20 }, msg: "Faturayı oyunculara kesmeniz soyunma odasında isyana neden oldu!" }
        ];
    } else if (matchContext === "comeback_win") {
        dynamicStatements = [
            { text: `İnanç: "Geriye düşsek de asla pes etmedik. Takımımın geri dönüş karakteriyle gurur duyuyorum."`, effect: { president: 10, authority: 10, fan: 15, playerLoyalty: 20, playerMorale: 20 }, msg: "Geri dönüşün kahramanı olarak oyuncuları göstermeniz aranızdaki bağı güçlendirdi." }
        ];
    }

    if (dynamicStatements.length === 0) {
        let result = window.lastMatchResult || "draw";
        if (!postMatchStatements[result]) result = "draw";
        dynamicStatements = postMatchStatements[result];
    }
    
    // Ağır Kriz Kontrolü
    if (window.managerAuthority !== undefined && window.managerAuthority < 35 && window.presidentConfidence < 40) {
        renderPressStatement("post", extremeCrisisStatements);
    } else {
        renderPressStatement("post", dynamicStatements);
    }
};

// 1. AŞAMA RENDER: Açılış Konuşması
function renderPressStatement(type, statements) {
    document.getElementById('press-reporter-name').textContent = "🎤 Sizin Açılış Konuşmanız:";
    document.getElementById('press-question-text').textContent = "Gazetecilerin sorularını almadan önce, maça dair değerlendirmenizi yapın.";
    
    const optionsContainer = document.getElementById('press-options');
    optionsContainer.innerHTML = '';
    
    statements.forEach((stmt, index) => {
        let btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.style.textAlign = "left";
        btn.style.background = index === 0 ? "#2980b9" : (index === 1 ? "#c0392b" : "#f39c12");
        btn.innerHTML = stmt.text;
        
        btn.onclick = () => {
            // Etkiyi kaydet, ikinci aşamada toplayıp göstereceğiz
            currentPressContext.statementEffect = {
                msg: stmt.msg,
                president: stmt.effect.president,
                authority: stmt.effect.authority,
                playerLoyalty: stmt.effect.playerLoyalty || 0,
                playerMorale: stmt.effect.playerMorale || 0
            };
            
            // 2. Aşamaya geçiş
            transitionToQuestions();
        };
        
        optionsContainer.appendChild(btn);
    });
    
    if(document.getElementById('press-modal')) document.getElementById('press-modal').style.display = 'flex';
    let title = document.getElementById('press-modal').querySelector('h1, h2');
    if(title) title.focus();
    else document.getElementById('press-modal').focus();
}

function transitionToQuestions() {
    document.getElementById('press-reporter-name').textContent = "⌛ Lütfen Bekleyin...";
    document.getElementById('press-question-text').textContent = "Açılış konuşmanız not edildi. Şimdi gazetecilerin sorularına geçiliyor...";
    
    const optionsContainer = document.getElementById('press-options');
    optionsContainer.innerHTML = ''; // Butonları gizle
    
    setTimeout(() => {
        let q;
        // [YENİ] Ağır Kriz (Taraftar Baskını)
        if (window.managerAuthority !== undefined && window.managerAuthority < 35 && window.presidentConfidence < 40) {
            q = extremeCrisisQuestions[Math.floor(Math.random() * extremeCrisisQuestions.length)];
        } 
        // Oyuncu Medyaya Sızdıysa Özel Soru Devreye Girer
        else if (window.complainingPlayerName) {
            let playerName = window.complainingPlayerName;
            q = {
                reporter: "💥 ŞOK HABER (SporX Özel):",
                text: `"Hocam, oyuncunuz ${playerName} hafta içi verdiğimiz röportajda takımda mutsuz olduğunu ve yönetiminizle sorun yaşadığını söyledi. Ne diyeceksiniz?"`,
                options: [
                    { text: `Kadro Dışı: "${playerName} artık bu takımın bir parçası değildir!"`, effect: { president: 5, authority: 20, fan: 0, playerLoyalty: -100, playerMorale: 0 }, msg: `Demir yumruğunuz otoritenizi zirveye çıkardı ama ${playerName}'i tamamen kaybettiniz.` },
                    { text: `Alttan Alma: "Aile içinde böyle şeyler olur, kendisiyle görüşeceğim."`, effect: { president: 0, authority: -10, fan: 0, playerLoyalty: 15, playerMorale: 5 }, msg: "Babacan tavrınız takımı sakinleştirdi ama otoriteniz biraz sarsıldı." },
                    { text: `İnkar: "Medyamız yine masa başında haber uydurmuş, böyle bir şey yok."`, effect: { president: -10, authority: 0, fan: 0, playerLoyalty: -5, playerMorale: -5 }, msg: "Kaçamak cevabınız takım içi gerilimi tam çözmedi." }
                ],
                complainingPlayerName: playerName // Etki uygulaması için işaretle
            };
            window.complainingPlayerName = null; // İsyanı sıfırla ki her hafta tekrar etmesin (yenisi çıkana kadar)
        } else if (window.consecutiveLosses >= 3) {
            // [YENİ] Üst üste mağlubiyet varsa Kriz Masası soruları devreye girer
            q = crisisQuestions[Math.floor(Math.random() * crisisQuestions.length)];
        } else {
            if (currentPressContext.type === "pre") {
                const pool = preMatchQuestions;
                q = pool[Math.floor(Math.random() * pool.length)];
            } else {
                let dynamicQuestions = [];
                if (window.currentHattrickPlayer) {
                    dynamicQuestions.push({
                        reporter: "Goal Türkiye:",
                        text: `"Hocam, bugün ${window.currentHattrickPlayer} attığı 3 golle sahanın mutlak yıldızıydı. Bu harika performans için ne diyeceksiniz?"`,
                        options: [
                            { text: `Övgü: "${window.currentHattrickPlayer} bugün muazzamdı, ona sahip olduğumuz için şanslıyız."`, effect: { president: 5, authority: 5, fan: 10, playerLoyalty: 15, playerMorale: 15 }, msg: "Oyuncunuzu göklere çıkarmanız takım içi uyumu artırdı." },
                            { text: `Takım Oyunu: "Onun gol atması önemli ama biz bir takımız, asist yapanlar da onun kadar değerli."`, effect: { president: 5, authority: 10, fan: 5, playerLoyalty: 0, playerMorale: 5 }, msg: "Takım oyununu vurgulamanız otoritenizi pekiştirdi." }
                        ]
                    });
                } else if (window.currentMatchContext === "blowout_win") {
                    dynamicQuestions.push({
                        reporter: "Bein Sports:",
                        text: `"Hocam, sahadaki bu farklı galibiyeti bekliyor muydunuz? Rakiplere açık bir mesaj mı veriyorsunuz?"`,
                        options: [
                            { text: `Kibirli: "Bizim kalitemiz bu, kim gelirse gelsin aynı tarifeyi uygulayıp ezip geçeceğiz!"`, effect: { president: 0, authority: 10, fan: 15, playerLoyalty: 5, playerMorale: 10 }, msg: "Korkusuz meydan okumanız taraftarı çıldırttı!" },
                            { text: `Mütevazı: "Bugün günümüzdeydik, her maç aynı olmaz. Çok çalışmaya devam edeceğiz."`, effect: { president: 10, authority: 5, fan: 0, playerLoyalty: 5, playerMorale: 5 }, msg: "Mütevazı tavrınız yönetimin hoşuna gitti." }
                        ]
                    });
                } else if (window.currentMatchContext === "blowout_loss") {
                     dynamicQuestions.push({
                        reporter: "Fanatik:",
                        text: `"Hocam, bu tarihi hezimet taraftarı çileden çıkardı. Eleştirilerin hedefindesiniz, bunun altından nasıl kalkacaksınız?"`,
                        options: [
                            { text: `Tepkili: "Bir maç kötü oynadık diye kimse bizi asamaz! Biz bu işi toparlarız."`, effect: { president: -10, authority: 10, fan: -10, playerLoyalty: 10, playerMorale: 0 }, msg: "Agresif cevabınız medyayla gerilimi artırdı ama takıma kalkan oldunuz." },
                            { text: `Boynu Bükük: "Çok ağır bir ders aldık, tüm hatalarımızdan ders çıkarıp telafi edeceğiz."`, effect: { president: 5, authority: -5, fan: 5, playerLoyalty: 0, playerMorale: -5 }, msg: "Sakin ve yapıcı tutumunuz hasarı en aza indirdi." }
                        ]
                    });
                } else if (window.currentMatchContext === "comeback_win") {
                     dynamicQuestions.push({
                        reporter: "A Spor:",
                        text: `"Hocam geriye düştüğünüz maçta bu muazzam geri dönüşü neye bağlıyorsunuz? Soyunma odasında takıma ne söylediniz?"`,
                        options: [
                            { text: `Taktik: "Sadece dizilişte küçük bir taktiksel değişiklik yaptık ve hemen meyvesini aldık."`, effect: { president: 10, authority: 15, fan: 5, playerLoyalty: 5, playerMorale: 5 }, msg: "Taktik dehanızı öne çıkarmanız otoritenizi zirveye taşıdı." },
                            { text: `İnanç: "Onlara ne kadar büyük oyuncular olduklarını hatırlattım. Maçı benim taktiğim değil onların inancı kazandı."`, effect: { president: 5, authority: 5, fan: 15, playerLoyalty: 20, playerMorale: 20 }, msg: "Oyuncuları onurlandırmanız moral ve sadakati göklere uçurdu!" }
                        ]
                    });
                }

                if (dynamicQuestions.length === 0) {
                    const pool = postMatchQuestions;
                    q = pool[Math.floor(Math.random() * pool.length)];
                } else {
                    q = dynamicQuestions[Math.floor(Math.random() * dynamicQuestions.length)];
                }
            }
        }
        renderPressQuestion(q);
    }, 2000);
}

// 2. AŞAMA RENDER: Gazeteci Sorusu
function renderPressQuestion(q) {
    document.getElementById('press-reporter-name').textContent = q.reporter;
    document.getElementById('press-question-text').textContent = q.text;
    
    const optionsContainer = document.getElementById('press-options');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        let btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.style.textAlign = "left";
        btn.style.background = index === 0 ? "#2980b9" : (index === 1 ? "#c0392b" : "#f39c12");
        btn.innerHTML = opt.text;
        
        btn.onclick = () => {
            finishPressConference(opt, q);
        };
        
        optionsContainer.appendChild(btn);
    });

    let qText = document.getElementById('press-question-text');
    if (qText) qText.focus();
}

function finishPressConference(questionOption, questionObj) {
    let stmtEffect = currentPressContext.statementEffect || {};
    let totalPresident = (stmtEffect.president || 0) + (questionOption.effect.president || 0);
    let totalAuthority = (stmtEffect.authority || 0) + (questionOption.effect.authority || 0);
    let totalLoyalty = (stmtEffect.playerLoyalty || 0) + (questionOption.effect.playerLoyalty || 0);
    let totalMorale = (stmtEffect.playerMorale || 0) + (questionOption.effect.playerMorale || 0);
    let totalFan = (stmtEffect.fan || 0) + (questionOption.effect.fan || 0);
    
    // Etkileri uygula (Başkan & Otorite) - Anti-NaN koruması
    if (window.presidentConfidence !== undefined) {
        window.presidentConfidence = (isNaN(window.presidentConfidence) ? 50 : window.presidentConfidence) + totalPresident;
    }
    if (window.managerAuthority !== undefined) {
        window.managerAuthority = (isNaN(window.managerAuthority) ? 50 : window.managerAuthority) + totalAuthority;
    }
    
    // Sınırları koru
    if (window.presidentConfidence > 100) window.presidentConfidence = 100;
    if (window.presidentConfidence < 0) window.presidentConfidence = 0;
    if (window.managerAuthority > 100) window.managerAuthority = 100;
    if (window.managerAuthority < 0) window.managerAuthority = 0;
    
    if (window.fanSupport !== undefined) {
        window.fanSupport = (isNaN(window.fanSupport) ? 50 : window.fanSupport) + totalFan;
        if (window.fanSupport > 100) window.fanSupport = 100;
        if (window.fanSupport < 0) window.fanSupport = 0;
    } else {
        window.fanSupport = 50 + totalFan;
    }
    
    // Etkileri uygula (Takım Oyuncuları)
    if (window.leagueData && window.leagueData.players) {
        window.leagueData.players.forEach(p => {
            if (p.teamId === window.myTeamId) {
                // [YENİ] Eğer soru özel bir isyan sorusuysa ve oyuncu isyan eden kişiyse ekstra etki (veya sadece o)
                if (questionObj && questionObj.complainingPlayerName && p.name === questionObj.complainingPlayerName) {
                    if (p.loyalty === undefined || isNaN(p.loyalty)) p.loyalty = 50;
                    p.loyalty += totalLoyalty; // Bu totalLoyalty zaten özel soru seçeneklerinde -100 veya +15 olarak ayarlı
                    if (p.loyalty > 100) p.loyalty = 100;
                    if (p.loyalty < 0) p.loyalty = 0;
                    
                    // [YENİ] İsyan edenin morali de etkilenir
                    if (p.morale === undefined || isNaN(p.morale)) p.morale = 75;
                    p.morale += totalMorale;
                    if (p.morale > 100) p.morale = 100;
                    if (p.morale < 0) p.morale = 0;
                } else if (!questionObj || !questionObj.complainingPlayerName) {
                    // Normal takım geneli etki
                    // Sadakat (Loyalty)
                    if (p.loyalty === undefined || isNaN(p.loyalty)) p.loyalty = 50;
                    p.loyalty += totalLoyalty;
                    if (p.loyalty > 100) p.loyalty = 100;
                    if (p.loyalty < 0) p.loyalty = 0;
                    
                    // Eski Özgüven (selfEfficacy)
                    if (!p.psy) p.psy = { intrinsicMotivation: false, selfEfficacy: 50 };
                    if (!p.psy.intrinsicMotivation) {
                        if (p.psy.selfEfficacy === undefined || isNaN(p.psy.selfEfficacy)) p.psy.selfEfficacy = 50;
                        p.psy.selfEfficacy += totalMorale;
                        if (p.psy.selfEfficacy > 100) p.psy.selfEfficacy = 100;
                        if (p.psy.selfEfficacy < 0) p.psy.selfEfficacy = 0;
                    }
                    
                    // [YENİ] Yeni Sistematik Moral
                    if (p.morale === undefined || isNaN(p.morale)) p.morale = 75;
                    p.morale += totalMorale;
                    if (p.morale > 100) p.morale = 100;
                    if (p.morale < 0) p.morale = 0;
                }
            }
        });
    }
    
    if (typeof updateStatsUI === 'function') updateStatsUI();
    
    const optionsContainer = document.getElementById('press-options');
    optionsContainer.innerHTML = ''; // Temizle
    
    
    // [YENİ] Ceza ve Sakatlık Mekanikleri
    let t = window.leagueData ? window.leagueData.teams.find(x => x.id === window.myTeamId) : null;
    if (questionOption.effect.fine && t) {
        let fineInMillions = questionOption.effect.fine / 1000000;
        t.budget -= fineInMillions;
        if (t.budget < 0) t.budget = 0;
        penaltyText += `<br><span style="color: #e74c3c; font-weight:bold;">TFF CEZASI: -${questionOption.effect.fine.toLocaleString('tr-TR')} € kulüp bütçesinden kesildi!</span>`;
        if (typeof updateBudgetUI === 'function') updateBudgetUI();
    }
    
    
    if (questionOption.effect.injuryRisk && t) {
        let damageCost = 0.2; // 200.000 Euro
        t.budget -= damageCost;
        if (t.budget < 0) t.budget = 0;
        penaltyText += `<br><span style="color: #c0392b; font-weight:bold;">ŞOK BİLGİ: Taraftar tesisleri savaş alanına çevirdi! 200.000 € hasar bedeli kulübün kasasından çıktı.</span>`;
        if (typeof updateBudgetUI === 'function') updateBudgetUI();
    }


    if (typeof updateStatsUI === 'function') updateStatsUI();

    // Rapor Göster (İki aşamayı da özetle + Takım Reaksiyonu)
    let teamReactionText = "";
    if (totalLoyalty < -10) teamReactionText = "💥 Oyuncularınızı suçlamanız soyunma odasında İSYAN çıkardı! Sadakat dibe vurdu.";
    else if (totalLoyalty < 0) teamReactionText = "📉 Açıklamalarınız takımın size olan sadakatini ve güvenini biraz sarstı.";
    else if (totalLoyalty > 10) teamReactionText = "🛡️ Takıma sahip çıkmanız oyuncularınızın size olan sadakatini ZİRVEYE taşıdı!";
    else if (totalLoyalty > 0) teamReactionText = "📈 Açıklamalarınız takımda olumlu karşılandı, sadakat arttı.";
    else teamReactionText = "➖ Takım bu açıklamalardan pek etkilenmedi.";
    
    const reportEl = document.createElement('div');
    reportEl.style.color = "#fff";
    reportEl.style.fontSize = "1.05em";
    reportEl.style.textAlign = "left";
    reportEl.innerHTML = `
        <p><b>Medya Tepkisi:</b></p>
        <p><i>Konuşmanız:</i> ${stmtEffect.msg}</p>
        <p><i>Soruya Cevabınız:</i> ${questionOption.msg}</p>
        <p style="color: #f1c40f; margin-top: 10px;"><b>Takım Reaksiyonu:</b> ${teamReactionText}</p>
        <p>${penaltyText}</p>
        <hr style="border-color: #555;">
        <p style="text-align: center;"><small>Başkanın Güveni: ${totalPresident > 0 ? '+'+totalPresident : totalPresident} | Otorite: ${totalAuthority > 0 ? '+'+totalAuthority : totalAuthority} | Taraftar Desteği: ${totalFan > 0 ? '+'+totalFan : totalFan}</small></p>
    `;
    optionsContainer.appendChild(reportEl);
    
    // Yönlendirme Butonu
    const nextBtn = document.createElement('button');
    nextBtn.className = 'menu-button';
    
    // [YENİ] Kovulma Kontrolü
    if (window.presidentConfidence !== undefined && window.presidentConfidence <= 0) {
        nextBtn.style.background = "#c0392b";
        nextBtn.innerHTML = "Başkanın Odasına Git 🚪";
        nextBtn.onclick = () => {
            if(typeof window.triggerGameOver === 'function') {
                window.triggerGameOver();
            }
        };
    } else {
        nextBtn.style.background = "#27ae60";
        if (currentPressContext.type === "pre") {
            nextBtn.innerHTML = "Maça Çık ⚽";
            nextBtn.onclick = () => {
                if(document.getElementById('press-modal')) document.getElementById('press-modal').style.display = 'none';
                if(typeof window.initGame === 'function') {
                    hideAllContainers();
                    const gameContainer = document.getElementById('game-container');
                    if (gameContainer) gameContainer.style.display = 'block';
                    window.initGame();
                }
            };
        } else {
            nextBtn.innerHTML = "Bitir ve Ana Menüye Dön 🏠";
            nextBtn.onclick = () => {
                if(document.getElementById('press-modal')) document.getElementById('press-modal').style.display = 'none';
                if(typeof window.showNewspaper === 'function') {
                    window.showNewspaper();
                } else {
                    if(typeof window.advanceWeek === 'function') window.advanceWeek();
                    if(typeof showContainer === 'function') showContainer('main-menu-container');
                }
            };
        }
    }
    
    optionsContainer.appendChild(nextBtn);
}

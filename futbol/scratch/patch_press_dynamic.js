const fs = require('fs');
const path = require('path');

const pressPath = path.join(__dirname, '..', 'js', 'press.js');
let pressContent = fs.readFileSync(pressPath, 'utf8');

// Replace window.openPostMatchPressConference
const openPostMatchRegex = /window\.openPostMatchPressConference\s*=\s*function\(\)\s*\{[\s\S]*?(\};\n)/;

const newOpenPostMatch = `window.openPostMatchPressConference = function() {
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

    let dynamicStatements = [];
    if (matchContext === "blowout_win") {
        dynamicStatements = [
            { text: \`Tarih Yazdık: "Bugün sahadaki futbol herkese ders oldu. \${window.playerScore}-\${window.enemyScore}'lık skor her şeyi özetliyor."\`, effect: { president: 10, authority: 15, fan: 20, playerLoyalty: 10, playerMorale: 15 }, msg: "Tarihi şovu gururla sahiplenmeniz taraftarı coşturdu!" },
            { text: \`Temkinli: "Farklı kazandık ama hala eksiklerimiz var. Ayaklarımız yere basmalı."\`, effect: { president: 5, authority: 5, fan: 0, playerLoyalty: -5, playerMorale: -5 }, msg: "Mükemmeliyetçi tavrınız biraz sıkıcı bulundu." }
        ];
    } else if (matchContext === "blowout_loss") {
        dynamicStatements = [
            { text: \`Özür: "Bugün taraftarımıza izlettiğimiz bu hezimetten dolayı tüm camiadan özür dilerim."\`, effect: { president: 5, authority: -10, fan: 10, playerLoyalty: 5, playerMorale: 0 }, msg: "Yenilgiyi kabullenip özür dilemeniz taraftarın öfkesini biraz dindirdi." },
            { text: \`Sorumsuzluk: "Bu kadar fark yememiz tamamen oyuncuların disiplinsizliğinden kaynaklı!"\`, effect: { president: -5, authority: 10, fan: -5, playerLoyalty: -25, playerMorale: -20 }, msg: "Faturayı oyunculara kesmeniz soyunma odasında isyana neden oldu!" }
        ];
    } else if (matchContext === "comeback_win") {
        dynamicStatements = [
            { text: \`İnanç: "Geriye düşsek de asla pes etmedik. Takımımın geri dönüş karakteriyle gurur duyuyorum."\`, effect: { president: 10, authority: 10, fan: 15, playerLoyalty: 20, playerMorale: 20 }, msg: "Geri dönüşün kahramanı olarak oyuncuları göstermeniz aranızdaki bağı güçlendirdi." }
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
`;

pressContent = pressContent.replace(openPostMatchRegex, newOpenPostMatch);

// Replace transitionToQuestions part for post match
// Search for `const pool = currentPressContext.type === "pre" ? preMatchQuestions : postMatchQuestions;`
const transitionRegex = /const pool = currentPressContext\.type === "pre" \? preMatchQuestions : postMatchQuestions;\s*q = pool\[Math\.floor\(Math\.random\(\) \* pool\.length\)\];/;

const newTransition = `if (currentPressContext.type === "pre") {
                const pool = preMatchQuestions;
                q = pool[Math.floor(Math.random() * pool.length)];
            } else {
                let dynamicQuestions = [];
                if (window.currentHattrickPlayer) {
                    dynamicQuestions.push({
                        reporter: "Goal Türkiye:",
                        text: \`"Hocam, bugün \${window.currentHattrickPlayer} attığı 3 golle sahanın mutlak yıldızıydı. Bu harika performans için ne diyeceksiniz?"\`,
                        options: [
                            { text: \`Övgü: "\${window.currentHattrickPlayer} bugün muazzamdı, ona sahip olduğumuz için şanslıyız."\`, effect: { president: 5, authority: 5, fan: 10, playerLoyalty: 15, playerMorale: 15 }, msg: "Oyuncunuzu göklere çıkarmanız takım içi uyumu artırdı." },
                            { text: \`Takım Oyunu: "Onun gol atması önemli ama biz bir takımız, asist yapanlar da onun kadar değerli."\`, effect: { president: 5, authority: 10, fan: 5, playerLoyalty: 0, playerMorale: 5 }, msg: "Takım oyununu vurgulamanız otoritenizi pekiştirdi." }
                        ]
                    });
                } else if (window.currentMatchContext === "blowout_win") {
                    dynamicQuestions.push({
                        reporter: "Bein Sports:",
                        text: \`"Hocam, sahadaki bu farklı galibiyeti bekliyor muydunuz? Rakiplere açık bir mesaj mı veriyorsunuz?"\`,
                        options: [
                            { text: \`Kibirli: "Bizim kalitemiz bu, kim gelirse gelsin aynı tarifeyi uygulayıp ezip geçeceğiz!"\`, effect: { president: 0, authority: 10, fan: 15, playerLoyalty: 5, playerMorale: 10 }, msg: "Korkusuz meydan okumanız taraftarı çıldırttı!" },
                            { text: \`Mütevazı: "Bugün günümüzdeydik, her maç aynı olmaz. Çok çalışmaya devam edeceğiz."\`, effect: { president: 10, authority: 5, fan: 0, playerLoyalty: 5, playerMorale: 5 }, msg: "Mütevazı tavrınız yönetimin hoşuna gitti." }
                        ]
                    });
                } else if (window.currentMatchContext === "blowout_loss") {
                     dynamicQuestions.push({
                        reporter: "Fanatik:",
                        text: \`"Hocam, bu tarihi hezimet taraftarı çileden çıkardı. Eleştirilerin hedefindesiniz, bunun altından nasıl kalkacaksınız?"\`,
                        options: [
                            { text: \`Tepkili: "Bir maç kötü oynadık diye kimse bizi asamaz! Biz bu işi toparlarız."\`, effect: { president: -10, authority: 10, fan: -10, playerLoyalty: 10, playerMorale: 0 }, msg: "Agresif cevabınız medyayla gerilimi artırdı ama takıma kalkan oldunuz." },
                            { text: \`Boynu Bükük: "Çok ağır bir ders aldık, tüm hatalarımızdan ders çıkarıp telafi edeceğiz."\`, effect: { president: 5, authority: -5, fan: 5, playerLoyalty: 0, playerMorale: -5 }, msg: "Sakin ve yapıcı tutumunuz hasarı en aza indirdi." }
                        ]
                    });
                } else if (window.currentMatchContext === "comeback_win") {
                     dynamicQuestions.push({
                        reporter: "A Spor:",
                        text: \`"Hocam geriye düştüğünüz maçta bu muazzam geri dönüşü neye bağlıyorsunuz? Soyunma odasında takıma ne söylediniz?"\`,
                        options: [
                            { text: \`Taktik: "Sadece dizilişte küçük bir taktiksel değişiklik yaptık ve hemen meyvesini aldık."\`, effect: { president: 10, authority: 15, fan: 5, playerLoyalty: 5, playerMorale: 5 }, msg: "Taktik dehanızı öne çıkarmanız otoritenizi zirveye taşıdı." },
                            { text: \`İnanç: "Onlara ne kadar büyük oyuncular olduklarını hatırlattım. Maçı benim taktiğim değil onların inancı kazandı."\`, effect: { president: 5, authority: 5, fan: 15, playerLoyalty: 20, playerMorale: 20 }, msg: "Oyuncuları onurlandırmanız moral ve sadakati göklere uçurdu!" }
                        ]
                    });
                }

                if (dynamicQuestions.length === 0) {
                    const pool = postMatchQuestions;
                    q = pool[Math.floor(Math.random() * pool.length)];
                } else {
                    q = dynamicQuestions[Math.floor(Math.random() * dynamicQuestions.length)];
                }
            }`;

pressContent = pressContent.replace(transitionRegex, newTransition);

fs.writeFileSync(pressPath, pressContent, 'utf8');

console.log("press.js patched successfully for dynamic press logic.");

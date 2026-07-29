const fs = require('fs');
let code = fs.readFileSync('js/press.js', 'utf8');

// 1. Yeni Ekstrem Soruları ve Etkilerini Tanımlama
const newCrisisQuestions = `
const extremeCrisisQuestions = [
    {
        reporter: "🚨 SON DAKİKA: Tesislerin Önü Karıştı!",
        text: "\\"Hocam, inanılmaz görüntüler var! Maskeli bir taraftar grubu antrenman tesislerini bastı, meşalelerle sahaya girip oyunculara saldırdılar! Ne yapacaksınız?\\"",
        options: [
            { text: "Kavgaya Gir: \\"Oyuncularımı ezdirmem!\\" diyerek kavgaya dahil ol.", effect: { president: -20, authority: 40, fan: 10, playerLoyalty: 30, playerMorale: 10, injuryRisk: true, fine: 0 }, msg: "Kendini siper edip dayak yedin ama takımın gözünde kahramansın! Fakat arbedede 1 oyuncu sakatlandı!" },
            { text: "Kaç: \\"Polisi arayın, ben odama geçiyorum.\\"", effect: { president: -10, authority: -40, fan: -30, playerLoyalty: -50, playerMorale: -50, injuryRisk: true, fine: 0 }, msg: "Oyuncuları meşalelerle baş başa bıraktın... Takım sana olan saygısını tamamen yitirdi ve 1 oyuncu yaralandı." },
            { text: "Taraftarı Destekle: \\"Ruhsuzlara az bile yaptılar, taraftar haklı!\\"", effect: { president: -30, authority: -10, fan: 30, playerLoyalty: -100, playerMorale: -100, injuryRisk: false, fine: 0 }, msg: "Taraftarın saldırısını meşrulaştırman takımda DEPREM etkisi yarattı. Oyuncular senden nefret ediyor!" }
        ]
    },
    {
        reporter: "📺 CANLI YAYIN SKANDALI:",
        text: "\\"Hocam dün geceki spor programında ünlü bir yorumcu size 'Şarlatan' dedi. Kameralar önünde stüdyo birbirine girdi! Ne diyorsunuz?\\"",
        options: [
            { text: "Dava Aç: \\"Hukuki yollara başvuracağım.\\"", effect: { president: 10, authority: -10, fan: -10, playerLoyalty: 0, playerMorale: 0, injuryRisk: false, fine: 0 }, msg: "Sıkıcı ve diplomatik bir yol seçtin. Otoriten biraz sarsıldı." },
            { text: "Mekanı Bas: \\"O stüdyoyu başlarına yıkarım!\\"", effect: { president: -40, authority: 50, fan: 50, playerLoyalty: 10, playerMorale: 10, injuryRisk: false, fine: 500000 }, msg: "Deli dolu halin taraftarı çıldırttı! Otoriten zirvede ama TFF sana 500.000€ PARA CEZASI kesti!" },
            { text: "Saldır: \\"Bana şarlatan diyeni sokağa çıkamaz hale getiririm!\\"", effect: { president: -50, authority: 30, fan: 30, playerLoyalty: 5, playerMorale: 5, injuryRisk: false, fine: 300000 }, msg: "Agresif tehditlerin TFF'den 300.000€ PARA CEZASI almana sebep oldu." }
        ]
    }
];
`;

// Değiştir const extremeCrisisQuestions = [...]
code = code.replace(/const extremeCrisisQuestions = \[\s*\{[\s\S]*?\];\s*const extremeCrisisStatements/m, newCrisisQuestions + '\nconst extremeCrisisStatements');

// 2. Eşik değerlerini (15 -> 35, 25 -> 40) düşürme
code = code.replace(/window\.managerAuthority < 15 && window\.presidentConfidence < 25/g, 'window.managerAuthority < 35 && window.presidentConfidence < 40');

// 3. finishPressConference içine sakatlık ve para cezası mekaniklerini ekleme
const penaltyLogic = `
    // [YENİ] Ceza ve Sakatlık Mekanikleri
    let penaltyText = "";
    if (questionOption.effect.fine) {
        if (window.userTeam && window.userTeam.budget !== undefined) {
            let fineInMillions = questionOption.effect.fine / 1000000;
            window.userTeam.budget -= fineInMillions;
            if (window.userTeam.budget < 0) window.userTeam.budget = 0;
            penaltyText += \`<br><span style="color: #e74c3c; font-weight:bold;">TFF CEZASI: -\${questionOption.effect.fine.toLocaleString('tr-TR')} € kulüp bütçesinden kesildi!</span>\`;
        }
    }
    
    if (questionOption.effect.injuryRisk && window.leagueData && window.leagueData.players) {
        let myPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeamId && !p.injured);
        if (myPlayers.length > 0) {
            // Rastgele 1 oyuncuyu sakatla
            let unlucky = myPlayers[Math.floor(Math.random() * myPlayers.length)];
            unlucky.injured = true;
            unlucky.injuryWeeks = 2; // Arbedede 2 hafta sakatlandı
            unlucky.psy = unlucky.psy || {};
            unlucky.psy.selfEfficacy = 10; // Psikolojisi bozuldu
            penaltyText += \`<br><span style="color: #c0392b; font-weight:bold;">ŞOK BİLGİ: Taraftar baskınında \${unlucky.name} darp edildi ve 2 hafta sakatlandı!</span>\`;
        }
    }

    if (typeof updateStatsUI === 'function') updateStatsUI();
`;

// Insert penaltyLogic just before "// Rapor Göster"
code = code.replace(/(\/\/ Rapor Göster)/, penaltyLogic + '\n    $1');

// Append penaltyText to reportEl
code = code.replace(/(\$\{teamReactionText\}<\/p>)/, '$1' + '\n        <p>${penaltyText}</p>');


fs.writeFileSync('js/press.js', code, 'utf8');
console.log('js/press.js hardcore modifications applied successfully!');

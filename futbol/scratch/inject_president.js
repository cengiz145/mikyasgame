const fs = require('fs');
let code = fs.readFileSync('js/manager.js', 'utf8');

// Replace init function
let targetInit = `    init: function(teamBudget) {
        if (teamBudget >= 70) {
            window.seasonObjective = "Şampiyonluk";
            window.boardTrust = 70; // Büyük takımlarda kredi çabuk tükenir
        } else if (teamBudget >= 40) {
            window.seasonObjective = "Avrupa Kupaları";
            window.boardTrust = 80;
        } else {
            window.seasonObjective = "Ligde Kalmak";
            window.boardTrust = 90; // Küçük takımlarda daha fazla sabır vardır
        }
    },`;

let replaceInit = `    init: function(teamBudget) {
        if (teamBudget >= 70) {
            window.seasonObjective = "Şampiyonluk";
            window.boardTrust = 70;
            window.presidentProfile = Math.random() < 0.5 ? "SABIRSIZ" : "ŞOVMEN";
        } else if (teamBudget >= 40) {
            window.seasonObjective = "Avrupa Kupaları";
            window.boardTrust = 80;
            const profiles = ["SABIRSIZ", "CİMRİ", "VİZYONER", "ŞOVMEN"];
            window.presidentProfile = profiles[Math.floor(Math.random() * profiles.length)];
        } else {
            window.seasonObjective = "Ligde Kalmak";
            window.boardTrust = 90;
            window.presidentProfile = Math.random() < 0.5 ? "CİMRİ" : "VİZYONER";
        }
    },`;

code = code.replace(targetInit, replaceInit);

// Replace evaluateMatch logic
let targetEval = `    evaluateMatch: function(isWin, isDraw, isLoss, isDerby) {
        let trustChange = 0;
        
        if (isWin) trustChange = isDerby ? 8 : 4;
        if (isDraw) trustChange = isDerby ? 0 : -2;
        if (isLoss) trustChange = isDerby ? -12 : -6;
        
        // Beklentiye göre ekstra baskı
        if (window.seasonObjective === "Şampiyonluk" && isLoss) trustChange -= 4;
        if (window.seasonObjective === "Ligde Kalmak" && isWin) trustChange += 5;

        window.boardTrust += trustChange;
        if (window.boardTrust > 100) window.boardTrust = 100;
        if (window.boardTrust < 0) window.boardTrust = 0;`;

let replaceEval = `    evaluateMatch: function(isWin, isDraw, isLoss, isDerby) {
        let trustChange = 0;
        let p = window.presidentProfile || "VİZYONER";
        
        if (isWin) {
            trustChange = isDerby ? 8 : 4;
            if (p === "SABIRSIZ") trustChange += 2;
            if (p === "ŞOVMEN" && isDerby) trustChange += 5;
        }
        if (isDraw) {
            trustChange = isDerby ? 0 : -2;
            if (p === "SABIRSIZ") trustChange -= 3;
            if (p === "CİMRİ") trustChange += 1;
        }
        if (isLoss) {
            trustChange = isDerby ? -12 : -6;
            if (p === "SABIRSIZ") trustChange -= 6;
            if (p === "VİZYONER") trustChange += 3;
            if (p === "ŞOVMEN" && isDerby) trustChange -= 10;
        }
        
        // Beklentiye göre ekstra baskı
        if (window.seasonObjective === "Şampiyonluk" && isLoss) trustChange -= 4;
        if (window.seasonObjective === "Ligde Kalmak" && isWin) trustChange += 5;

        window.boardTrust += trustChange;
        if (window.boardTrust > 100) window.boardTrust = 100;
        if (window.boardTrust < 0) window.boardTrust = 0;

        window.eventQueue = window.eventQueue || [];
        let pChance = Math.random();
        
        if (isLoss && p === "SABIRSIZ" && pChance < 0.5) {
             window.eventQueue.push({
                 title: "📱 BAŞKANDAN WHATSAPP MESAJI",
                 message: "\\"Hocam bu nasıl futbol? Oynattığın topu da, sahaya dizdiğin oyuncuları da anlamıyorum. Haftaya kazanmazsan sonuçlarına katlanırsın!\\"",
                 actionText: "Haklısınız Başkanım (-2 Moral)",
                 actionCallback: () => { window.teamConfidence = Math.max(0, (window.teamConfidence||100) - 2); }
             });
        } else if (isWin && p === "ŞOVMEN" && pChance < 0.4) {
             window.eventQueue.push({
                 title: "💰 BAŞKANDAN PRİM JESTİ",
                 message: "\\"Aslanlarım benim! Helal olsun size! Soyunma odasına benden 500.000 Euro prim!\\"",
                 actionText: "Harikasınız Başkanım (+10 Moral)",
                 actionCallback: () => { 
                     window.teamConfidence = Math.min(100, (window.teamConfidence||100) + 10); 
                     if (window.myTeam && window.myTeam.budget !== undefined) window.myTeam.budget -= 0.5;
                 }
             });
        } else if (isLoss && p === "VİZYONER" && pChance < 0.4) {
             window.eventQueue.push({
                 title: "☕ BAŞKANLA KAHVE",
                 message: "\\"Hocam sonuç kötü ama projemize güveniyoruz. Sen sahaya odaklan, dışarıdaki seslere kulak tıkamaya devam et.\\"",
                 actionText: "Teşekkürler Başkanım (+5 Güven)",
                 actionCallback: () => { window.boardTrust = Math.min(100, window.boardTrust + 5); }
             });
        } else if (isDraw && p === "CİMRİ" && pChance < 0.4) {
             window.eventQueue.push({
                 title: "📱 BAŞKANDAN MESAJ",
                 message: "\\"Hocam deplasmandan 1 puan iyidir, bütçeyi yormadan puan puan ilerleyelim. Prim falan da istemesinler.\\"",
                 actionText: "Anlaşıldı Başkanım",
                 actionCallback: () => {}
             });
        }`;

code = code.replace(targetEval, replaceEval);

fs.writeFileSync('js/manager.js', code, 'utf8');
console.log("manager.js updated!");

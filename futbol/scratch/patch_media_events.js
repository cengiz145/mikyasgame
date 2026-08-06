const fs = require('fs');

let managerPath = 'c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\manager.js';
let content = fs.readFileSync(managerPath, 'utf8');

let targetCode = `        window.boardTrust += trustChange;
        if (window.boardTrust > 100) window.boardTrust = 100;
        if (window.boardTrust < 0) window.boardTrust = 0;

        this.checkSacking();`;

let replaceCode = `        window.boardTrust += trustChange;
        if (window.boardTrust > 100) window.boardTrust = 100;
        if (window.boardTrust < 0) window.boardTrust = 0;

        // MEDIA REALITY SHOW LOGIC
        window.eventQueue = window.eventQueue || [];
        let mediaChance = Math.random();
        
        if (isLoss && mediaChance < 0.6) {
            window.eventQueue.push({
                title: "📺 GECE YARISI SPOR ŞOVU (KRİZ)",
                message: "Dün geceki programda yorumcular sizi ve taktiğinizi paramparça etti! Stüdyoda sinirler gerildi. Eski hakem yorumcusu <em>'Bu takımdan hiçbir şey olmaz!'</em> diyerek formayı yere fırlattı. Takımın morali düştü ve medya baskısı arttı!",
                actionText: "Televizyonu Kapat (-5 Güven)",
                actionCallback: () => {
                    window.boardTrust -= 5;
                    window.teamConfidence = (window.teamConfidence || 100) - 10;
                    if (window.teamConfidence < 0) window.teamConfidence = 0;
                    if(typeof boardEngine !== 'undefined') boardEngine.checkSacking();
                }
            });
        } else if (isWin && isDerby) {
            window.eventQueue.push({
                title: "📺 KAOTİK SPOR ŞOVU (ZAFER)",
                message: "Derbi zaferi sonrası stüdyo bayram yerine döndü! Yorumcular sizi överken, kaybeden takımın eski oyuncusu olan diğer yorumcu canlı yayını sinirle terk etti! Taraftar bu kaosu çok sevdi.",
                actionText: "Keyifle İzle (+5 Güven)",
                actionCallback: () => {
                    window.boardTrust += 5;
                    window.teamConfidence = (window.teamConfidence || 100) + 10;
                    if (window.teamConfidence > 100) window.teamConfidence = 100;
                }
            });
        } else if (isDraw && mediaChance < 0.4) {
            window.eventQueue.push({
                title: "📺 HAKEM TARTIŞMASI",
                message: "Dün geceki beraberliğin faturası hakeme kesildi. 3 saat boyunca stüdyoda hakemin verdiği o karar tartışıldı. Yorumcular çizgiyi kendileri çizmeye kalkınca komik anlar yaşandı.",
                actionText: "Gülerek Geç",
                actionCallback: () => {}
            });
        }

        this.checkSacking();`;

content = content.replace(targetCode, replaceCode);

fs.writeFileSync(managerPath, content, 'utf8');

console.log('Media events patched into manager.js');

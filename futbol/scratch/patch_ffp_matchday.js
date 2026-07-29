const fs = require('fs');
const path = require('path');

// 1. FFP & BANKRUPTCY in scout.js (advanceDateAndEvents)
const scoutPath = path.join(__dirname, '..', 'js', 'scout.js');
let scoutContent = fs.readFileSync(scoutPath, 'utf8');

const checkScoutRegex = /\/\/ 3\. Yeni günde olan olayları tetikle[\s\S]*?if \(typeof checkScoutArrivals === 'function'\) checkScoutArrivals\(\);/m;
const checkScoutRepl = `
    // 3. Yeni günde olan olayları tetikle
    if (typeof checkScoutArrivals === 'function') checkScoutArrivals();
    
    // [YENİ] FFP ve İflas Kontrolü (Günlük)
    if (window.budget < 0) {
        window.bankruptcyDays = (window.bankruptcyDays || 0) + 1;
        if (window.bankruptcyDays === 3) {
            if(typeof speak === 'function') speak("Başkanım, kulübün kasası ekside! Bankalar Birliği ihtar çekti, acilen oyuncu satıp bütçeyi artıya geçirmezsek kulübe kayyım atanacak!");
            alert("⚠️ FFP İHTARI: Bütçeniz ekside! 4 gün içinde düzeltmezseniz en değerli oyuncunuz zorla satılacaktır.");
        } else if (window.bankruptcyDays >= 7) {
            // İFLAS: En değerli oyuncuyu zorla sat
            if (window.myRoster && window.myRoster.length > 0) {
                let bestPlayer = window.myRoster.reduce((prev, current) => (prev.power > current.power) ? prev : current);
                
                // Oyuncuyu listeden çıkar
                window.myRoster = window.myRoster.filter(p => p.id !== bestPlayer.id);
                if (window.myTeam) {
                    let formIdx = window.myTeam.formation.indexOf(bestPlayer.id);
                    if(formIdx !== -1) window.myTeam.formation[formIdx] = null;
                    let subIdx = window.myTeam.subs.indexOf(bestPlayer.id);
                    if(subIdx !== -1) window.myTeam.subs[subIdx] = null;
                }
                
                // Kulüpsüz (Free Agent) veya başka bir takıma yolla (Şimdilik free_agent)
                bestPlayer.teamId = 'free_agent';
                
                let forcedSaleValue = (bestPlayer.power > 80 ? 10 : 5); // Zorunlu satış ucuza gider
                window.budget += forcedSaleValue;
                window.bankruptcyDays = 0;
                
                let crisisMsg = "🚨 KAYYIM ATANDI! Kulüp borçlarını ödeyemediği için Bankalar Birliği duruma el koydu. Takımın en büyük yıldızı " + bestPlayer.name + ", " + forcedSaleValue + " Milyon Euro'ya acımasızca satıldı.";
                if(typeof speak === 'function') speak("Acil durum... Kulübe kayyım atandı! En büyük yıldızımızı borçlar yüzünden yok pahasına sattılar!");
                alert(crisisMsg);
                if(typeof updateBudgetUI === 'function') updateBudgetUI();
            }
        }
    } else {
        window.bankruptcyDays = 0; // Kasa artıdaysa tehlike yok
    }
`;
scoutContent = scoutContent.replace(checkScoutRegex, checkScoutRepl.trim());
fs.writeFileSync(scoutPath, scoutContent, 'utf8');

// 2. MATCHDAY REVENUE in squad.js (processMatch)
const squadPath = path.join(__dirname, '..', 'js', 'squad.js');
let squadContent = fs.readFileSync(squadPath, 'utf8');

const processMatchRegex = /if \(window\.newRedCards && window\.newRedCards\.length > 0\) \{/m;
const processMatchRepl = `
        // [YENİ] Gişe Hasılatı (Matchday Revenue) - Sadece iç sahada (Şimdilik her maç sonu genel gişe ekleyelim)
        let attendance = Math.floor(Math.random() * 20000) + 15000; // 15k - 35k seyirci
        let ticketPrice = 40; // Ortalama 40 Euro
        let matchdayRevenue = (attendance * ticketPrice) / 1000000; // Milyon Euro cinsinden
        
        // Eğer takım son maçını kazanmışsa (moral yüksekse) seyirci artar
        if (window.lastMatchResult === 'win') {
            matchdayRevenue *= 1.5;
            attendance += 10000;
        } else if (window.lastMatchResult === 'loss') {
            matchdayRevenue *= 0.7; // Taraftar küstü
        }
        
        matchdayRevenue = parseFloat(matchdayRevenue.toFixed(2));
        window.budget += matchdayRevenue;
        
        console.log("Gişe Hasılatı: " + matchdayRevenue + "M (Seyirci: " + attendance + ")");
        if (window.lastMatchResult === 'win') {
            setTimeout(() => {
                if(typeof speak === 'function') speak("Başkanım, stadyum kapalı gişeydi! Sadece bugünkü maçın bilet ve sosisli satışlarından kasamıza " + matchdayRevenue + " Milyon Euro girdi.");
            }, 3000);
        }

        if (window.newRedCards && window.newRedCards.length > 0) {
`;
squadContent = squadContent.replace(processMatchRegex, processMatchRepl.trim());
fs.writeFileSync(squadPath, squadContent, 'utf8');

console.log("FFP and Matchday Revenue patches applied successfully.");

const fs = require('fs');
const path = require('path');

const transferPath = path.join(__dirname, '..', 'js', 'transfer.js');
let transferContent = fs.readFileSync(transferPath, 'utf8');

const menuPath = path.join(__dirname, '..', 'js', 'menu.js');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// 1. Add free agent wage logic
// In calculateSalary(player), we need to check if player.teamId === 'free_agent' and boost wage by 30%.
// Wait, calculateSalary might just return a base value. Let's see if we can inject it.
// Wait, I didn't see calculateSalary logic before, let's inject it into calculatePrice or startNegotiation?
// Actually, let's just append window.processFreeAgents to transfer.js
const processFreeAgentsLogic = `
// --- FREE AGENT AI (BOŞTAKİ OYUNCU ZEKASI) ---
window.processFreeAgents = function() {
    let bots = window.leagueData.teams.filter(t => t.id !== (window.myTeamId || "galatasaray"));
    if (bots.length === 0) return;

    window.leagueData.players.forEach(p => {
        if (p.teamId === "free_agent") {
            // Paslanma (Kondisyon ve Güç düşüşü)
            if (Math.random() < 0.25) { // Her hafta %25 ihtimalle paslanır
                p.condition = Math.max(10, (p.condition || 100) - 2);
                if (Math.random() < 0.10) {
                    p.power = Math.max(30, p.power - 1);
                }
            }

            // Transfer olma zekası
            if (p.power > 80) {
                // Büyük takım bekliyor
                if (Math.random() < 0.10) {
                    let bigBots = bots.filter(t => t.budget > 20); // Zengin takımlar
                    if (bigBots.length > 0) {
                        let chosenBot = bigBots[Math.floor(Math.random() * bigBots.length)];
                        p.teamId = chosenBot.id;
                        p.isListed = false;
                        console.log(\`\${p.name} (Free Agent), \${chosenBot.name} takımına imza attı!\`);
                        // Haberlere yansıtılabilir
                    }
                }
            } else {
                // Anadolu takımı veya rastgele
                if (Math.random() < 0.15) {
                    let chosenBot = bots[Math.floor(Math.random() * bots.length)];
                    p.teamId = chosenBot.id;
                    p.isListed = false;
                    console.log(\`\${p.name} (Free Agent), \${chosenBot.name} takımına katıldı!\`);
                }
            }
        }
    });
};

// Maaş pazarlığında Free Agent kaprisi ekle
const originalCalculateDemandedWage = window.calculateDemandedWage;
if (originalCalculateDemandedWage) {
    window.calculateDemandedWage = function(player) {
        let wage = originalCalculateDemandedWage(player);
        if (player.teamId === "free_agent") {
            return Math.floor(wage * 1.30); // %30 İmza parası kaprisi
        }
        return wage;
    };
}
`;

transferContent += "\n" + processFreeAgentsLogic;
fs.writeFileSync(transferPath, transferContent, 'utf8');

// 2. Add processFreeAgents call to menu.js when week advances
const weekRegex = /window\.currentWeek = \(window\.currentWeek \|\| 1\) \+ 1;/;
const weekRepl = `window.currentWeek = (window.currentWeek || 1) + 1;\n            if (window.processFreeAgents) window.processFreeAgents();`;
menuContent = menuContent.replace(weekRegex, weekRepl);
fs.writeFileSync(menuPath, menuContent, 'utf8');

console.log("Free Agent AI logic added.");

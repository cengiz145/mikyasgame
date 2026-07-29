const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the UI string for injuries in renderSquad()
// Look for: let injuryText = p.injuredWeeks > 0 ? ` [Sakat ${p.injuredWeeks} Hafta]` : "";
// Replace with logic that includes injuryType
content = content.replace(
    /let injuryText = p\.injuredWeeks > 0 \? ` \[Sakat \$\{p\.injuredWeeks\} Hafta\]` : "";/g,
    `let injuryText = p.injuredWeeks > 0 ? (p.injuryType ? \` [Sakat - \${p.injuryType} (\${p.injuredWeeks} Hafta)]\` : \` [Sakat \${p.injuredWeeks} Hafta]\`) : "";`
);

// 2. Update the injury logic in processMatchCondition()
// Look for:
/*
                if (Math.random() < injuryRisk) {
                    p.injuredWeeks = Math.floor(Math.random() * 4) + 1; // 1 to 4 weeks
                    newInjuries.push(p);
                }
*/
const oldInjuryLogic = `if (Math.random() < injuryRisk) {
                    p.injuredWeeks = Math.floor(Math.random() * 4) + 1; // 1 to 4 weeks
                    newInjuries.push(p);
                }`;

const newInjuryLogic = `if (Math.random() < injuryRisk) {
                    // Detaylı Sakatlık Motoru
                    let randType = Math.random();
                    if (randType < 0.25) {
                        p.injuryType = "Kasık Çekmesi (Groin Strain)";
                        p.injuredWeeks = Math.floor(Math.random() * 3) + 1; // 1-3 hafta
                    } else if (randType < 0.50) {
                        p.injuryType = "Quadriceps (Ön Üst Bacak) Yırtığı";
                        p.injuredWeeks = Math.floor(Math.random() * 3) + 2; // 2-4 hafta
                    } else if (randType < 0.75) {
                        p.injuryType = "Kalf (Baldır) Yırtığı";
                        p.injuredWeeks = Math.floor(Math.random() * 3) + 3; // 3-5 hafta
                    } else {
                        p.injuryType = "Hamstring (Arka Bacak) Yırtığı";
                        p.injuredWeeks = Math.floor(Math.random() * 5) + 4; // 4-8 hafta (En ağır)
                    }
                    newInjuries.push(p);
                }`;

content = content.replace(oldInjuryLogic, newInjuryLogic);

// 3. Update the report string
// Look for: msg += `- ${p.name} sakatlandı! (${p.injuredWeeks} hafta yok)\n`;
const oldReport = 'msg += `- ${p.name} sakatlandı! (${p.injuredWeeks} hafta yok)\\n`;';
const newReport = 'msg += `- ${p.name} sakatlandı! \\n   Sakatlık: ${p.injuryType || "Bilinmiyor"} (${p.injuredWeeks} hafta yok)\\n`;';
content = content.replace(oldReport, newReport);

// Write back to squad.js
fs.writeFileSync(filePath, content, 'utf8');
console.log("Medical System patch applied successfully to squad.js.");

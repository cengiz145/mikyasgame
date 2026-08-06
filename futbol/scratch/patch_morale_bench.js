const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

// Dinlenen oyuncular için moral düşüşü ekleyeceğiz
const oldRestRegex = /\/\/ Benched \/ Rested[\s\S]*?p\.condition \+= 25;\s*if \(p\.condition > 100\) p\.condition = 100;/m;

const newRestLogic = `
                // Benched / Rested
                p.condition += 25;
                if (p.condition > 100) p.condition = 100;
                
                // [YENİ] Dinlenen oyuncunun morali biraz düşebilir (oynamak istediği için)
                // Ancak "Yıldız" oyuncularda bu düşüş çok daha keskin olur.
                if (p.power > 82) {
                    p.morale -= 5;
                } else {
                    p.morale -= 2; 
                }
                if (p.morale < 0) p.morale = 0;
`;

content = content.replace(oldRestRegex, newRestLogic.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log("Squad logic updated: Benched players lose morale.");

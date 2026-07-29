const fs = require('fs');
const path = require('path');

const leaguePath = path.join(__dirname, '..', 'js', 'league.js');
let content = fs.readFileSync(leaguePath, 'latin1');

const searchStr = `    // Güç farkına göre bonus (Güçlü takımı yenerse ekstra puan)
    let powerDiff = (tB.power || 60) - (tA.power || 60);
    if (scoreA > scoreB && powerDiff > 5) {
        pointsA += powerDiff * 2; // Sürpriz galibiyet bonusu
        pointsB -= powerDiff;
    } else if (scoreB > scoreA && powerDiff < -5) {
        pointsB += Math.abs(powerDiff) * 2;
        pointsA -= Math.abs(powerDiff);
    }`;

// Since the file might have 'latin1' encoding, let's use regex to replace the bonus part without strict charset matching.
content = content.replace(/let powerDiff = \(tB\.power.*?\-= Math\.abs\(powerDiff\);\r?\n\s*\}/s, '');

// Also remove the comment above it just to be clean
content = content.replace(/\/\/\s*G[^]*?fark[^]*?g[^]*?re bonus[^]*?ekstra puan\)\r?\n/i, '');

fs.writeFileSync(leaguePath, content, 'latin1');
console.log("Bonus points removed.");

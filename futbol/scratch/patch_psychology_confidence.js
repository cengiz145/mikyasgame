const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', 'utf8');

// 1. Add confidence request to the queue loop
let target1 = `        myRoster.forEach(p => {
            // 1. Kinesiofobi Talebi`;

let replacement1 = `        myRoster.forEach(p => {
            // 5. Medya Linci / Özgüven Çöküşü Talebi
            if (p.psy && p.psy.selfEfficacy < 50 && Math.random() < 0.8) {
                psychologyQueue.push({
                    player: p,
                    type: 'confidence',
                    title: "Medya Baskısı ve Özgüven Çöküşü",
                    message: \`Hocam dünkü televizyon yayınlarını ve sosyal medyadaki linçleri gördünüz mü? Herkes üzerime geliyor, yorumcular taktiği ve benim performansımı yerden yere vurdu. Sahaya çıkıp top oynamaktan korkar hale geldim. Terapiste ihtiyacım var.\`
                });
            }

            // 1. Kinesiofobi Talebi`;

content = content.replace(target1, replacement1);

// 2. Add handling logic
let target2 = `            } else if (request.type === 'bench') {
                p.benchedMatches = 1;
                p.promisedNextMatch = false;
                msg = \`\${p.name} psikolog terapisiyle egolarından arındı ve takıma küsmekten vazgeçti.\`;
            }`;

let replacement2 = `            } else if (request.type === 'bench') {
                p.benchedMatches = 1;
                p.promisedNextMatch = false;
                msg = \`\${p.name} psikolog terapisiyle egolarından arındı ve takıma küsmekten vazgeçti.\`;
            } else if (request.type === 'confidence') {
                if(p.psy && p.psy.selfEfficacy !== undefined) {
                    p.psy.selfEfficacy = Math.min(100, p.psy.selfEfficacy + 40);
                }
                msg = \`\${p.name} spor psikoloğu sayesinde medyanın ve yorumcuların yarattığı linç baskısından tamamen arındı. Özgüveni geri geldi ve sahaya çıkmaya hazır!\`;
            }`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', content, 'utf8');
console.log('Patch psychology confidence applied successfully.');

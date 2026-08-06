const fs = require('fs');
const path = require('path');

const squadPath = path.join(__dirname, '..', 'js', 'squad.js');
let squadContent = fs.readFileSync(squadPath, 'utf8');

// 1. ADD DEFAULTS
const defaultsRegex = /if \(p\.injuredWeeks === undefined\) p\.injuredWeeks = 0;/g;
const defaultsReplacement = `if (p.injuredWeeks === undefined) p.injuredWeeks = 0;
        if (p.yellowCards === undefined) p.yellowCards = 0;
        if (p.redCardWeeks === undefined) p.redCardWeeks = 0;`;
squadContent = squadContent.replace(defaultsRegex, defaultsReplacement);

// 2. ADD VISUAL INDICATOR
// Look for let injuryText = p.injuredWeeks > 0 ? ...
const visualRegex = /let injuryText = p\.injuredWeeks > 0[\s\S]*?let condColor/m;
const visualRepl = `
        let injuryText = p.injuredWeeks > 0 ? (p.injuryType ? \` [Sakat - \${p.injuryType} (\${p.injuredWeeks} Hafta)]\` : \` [Sakat \${p.injuredWeeks} Hafta]\`) : "";
        let redText = p.redCardWeeks > 0 ? \` [🟥 Cezalı (\${p.redCardWeeks} Maç)]\` : "";
        let yellowText = p.yellowCards > 0 ? \` [\` + "🟨".repeat(p.yellowCards) + \`]\` : "";
        
        let condColor`;
squadContent = squadContent.replace(visualRegex, visualRepl.trim());

// Look for btn.innerHTML = `<strong>${p.name}</strong> ...
const btnHtmlRegex = /btn\.innerHTML = `<strong>\$\{p\.name\}<\/strong> - \$\{p\.position\} \(Güç: \$\{p\.power\}, Kond: <span style='color:\$\{condColor\}'>%\$\{p\.condition\}<\/span>, Moral: <span style='color:\$\{moraleColor\}'>\$\{moraleText\}<\/span>\)\$\{injuryText\}\$\{status\}`;/;
const btnHtmlRepl = "btn.innerHTML = `<strong>${p.name}</strong> - ${p.position} (Güç: ${p.power}, Kond: <span style='color:${condColor}'>%${p.condition}</span>, Moral: <span style='color:${moraleColor}'>${moraleText}</span>)${injuryText}${redText}${yellowText}${status}`;";
squadContent = squadContent.replace(btnHtmlRegex, btnHtmlRepl);

// 3. ADD CARD SIMULATION TO processMatch
const simRegex = /\/\/ 'fragile' trait increases injury risk[\s\S]*?if \(Math\.random\(\) < injuryRisk\) \{/m;
const simRepl = `
                // --- KART SİMÜLASYONU ---
                let cardRisk = 0.05; // Base 5% chance
                if (p.position === 'Stoper' || p.position === 'Defansif Orta Saha') cardRisk += 0.08;
                if (p.mentalTrait === 'agresif') cardRisk += 0.15;
                if (p.condition < 40) cardRisk += 0.10; // Yorgun oyuncu geç müdahale eder
                
                if (Math.random() < cardRisk) {
                    // Sarı mı Kırmızı mı?
                    if (Math.random() < 0.05 || (p.mentalTrait === 'agresif' && Math.random() < 0.1)) {
                        // Kırmızı Kart!
                        p.redCardWeeks = Math.random() < 0.3 ? 2 : 1; // 1 veya 2 maç ceza
                        if (!window.newRedCards) window.newRedCards = [];
                        window.newRedCards.push(p);
                        p.lastMatchRating = "3.0"; // Kırmızı kart gören sürünür
                    } else {
                        // Sarı Kart!
                        p.yellowCards++;
                        if (p.yellowCards >= 4) {
                            p.yellowCards = 0;
                            p.redCardWeeks = 1; // Sarı kart cezalısı (1 maç)
                            if (!window.newYellowSuspensions) window.newYellowSuspensions = [];
                            window.newYellowSuspensions.push(p);
                        }
                    }
                }

                // 'fragile' trait increases injury risk
                let injuryRisk = 0.01;
                if (p.condition < 70) injuryRisk = 0.05;
                if (p.condition < 50) injuryRisk = 0.15;
                if (p.condition < 30) injuryRisk = 0.40;
                if (p.mentalTrait === 'fragile') injuryRisk *= 2;
                
                if (Math.random() < injuryRisk) {
`;
squadContent = squadContent.replace(simRegex, simRepl.trim());

// 4. ADD SUSPENSION DECREMENT
// Look for if (p.injuredWeeks > 0) { ... return; }
const decRegex = /if \(p\.injuredWeeks > 0\) \{/m;
const decRepl = `
            if (p.redCardWeeks > 0 && !playedIds.includes(p.id)) {
                p.redCardWeeks--;
            }
            if (p.injuredWeeks > 0) {
`;
squadContent = squadContent.replace(decRegex, decRepl.trim());

// 5. ALERT MESSAGES POST MATCH
// Look for if (newInjuries.length > 0) {
const alertRegex = /if \(newInjuries\.length > 0\) \{/m;
const alertRepl = `
        if (window.newRedCards && window.newRedCards.length > 0) {
            console.log(window.newRedCards.length + " kırmızı kart görüldü.");
            let msg = "KIRMIZI KART RAPORU\\n";
            window.newRedCards.forEach(p => msg += \`- \${p.name} (\${p.redCardWeeks} Maç Men)\\n\`);
            setTimeout(() => alert(msg), 500);
            window.newRedCards = [];
        }
        if (window.newYellowSuspensions && window.newYellowSuspensions.length > 0) {
            console.log(window.newYellowSuspensions.length + " oyuncu sarı kart cezalısı oldu.");
            let msg = "SARI KART CEZALILARI (4. Kart)\\n";
            window.newYellowSuspensions.forEach(p => msg += \`- \${p.name} (1 Maç Men)\\n\`);
            setTimeout(() => alert(msg), 1500);
            window.newYellowSuspensions = [];
        }

        if (newInjuries.length > 0) {
`;
squadContent = squadContent.replace(alertRegex, alertRepl.trim());

fs.writeFileSync(squadPath, squadContent, 'utf8');
console.log("squad.js updated for Card and Suspension System.");

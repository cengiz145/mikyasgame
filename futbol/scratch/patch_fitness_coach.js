const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// 1. Apply stamina decay multiplier
let target1 = `        let baseDecayRate = 0.0005;
        let staminaDecay = (dist * baseDecayRate) * roleMultiplier;`;

let replacement1 = `        let baseDecayRate = 0.0005;
        let staminaDecay = (dist * baseDecayRate) * roleMultiplier;

        // KONDİSYONER PROFİLİ BAŞLANGICI
        if (!window.fitnessCoachProfile) {
            window.fitnessCoachProfile = "diktator"; // Antonio Pintus tarzı
        }

        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
            // Acımasız Kondisyoner: Oyuncuların yorgunluk hissetmesini engeller.
            staminaDecay *= 0.4; // 90 dakika tükenmeden pres yaparlar
        }`;

content = content.replace(target1, replacement1);

// 2. Apply injury logic
let target2 = `                if (dirDiff > 1.2) { 
                    if (p.stamina < 40 && typeof isGameHalted !== 'undefined' && !isGameHalted && !p.isInjured) {
                        let injuryChance = (40 - p.stamina) * 0.00005 * roleMultiplier;
                        if (Math.random() < injuryChance) {`;

let replacement2 = `                if (dirDiff > 1.2) { 
                    let injuryThreshold = (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) ? 70 : 40;
                    
                    if (p.stamina < injuryThreshold && typeof isGameHalted !== 'undefined' && !isGameHalted && !p.isInjured) {
                        let injuryChance = (injuryThreshold - p.stamina) * 0.00005 * roleMultiplier;
                        
                        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
                            // Diktatör limitleri zorladığı için kaslar her an kopmaya hazırdır
                            injuryChance *= 4.0;
                        }

                        if (Math.random() < injuryChance) {`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch fitness coach applied successfully.');

const fs = require('fs');

let scoutContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');

let targetScout = `function advanceDay() {
  window.currentDay++;`;

let replaceScout = `function advanceDay() {
  window.totalDaysPassed = (window.totalDaysPassed || 0) + 1;
  window.currentDay++;`;

scoutContent = scoutContent.replace(targetScout, replaceScout);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', scoutContent, 'utf8');


let gameContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let targetGame1 = `        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
            // Acımasız Kondisyoner: Oyuncuların yorgunluk hissetmesini engeller.
            staminaDecay *= 0.4; // 90 dakika tükenmeden pres yaparlar
        }`;

let replaceGame1 = `        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
            // Acımasız Kondisyoner Gelişim Eğrisi:
            // Oyuncuların diktatör idmanlarına alışması zaman alır. 60 gün (2 ay) sürer.
            let daysPassed = window.totalDaysPassed || 0;
            let adaptation = Math.min(1.0, daysPassed / 60.0);
            
            // İlk günlerde yorgunluk daha da artar (1.2x). Ancak 60 gün sonra tam makineye dönerler (0.4x).
            let dictatorMultiplier = 1.2 - (adaptation * 0.8);
            staminaDecay *= dictatorMultiplier;
        }`;

gameContent = gameContent.replace(targetGame1, replaceGame1);


let targetGame2 = `                        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
                            // Diktatör limitleri zorladığı için kaslar her an kopmaya hazırdır
                            injuryChance *= 4.0;
                        }`;

let replaceGame2 = `                        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
                            // Adaptasyon sürecinde kaslar kopmaya çok müsaittir (x4 risk).
                            // Vücut alıştıkça risk azalır ama limitler hep zorlandığı için asla tam güvenli olmaz (x1.5 risk kalır).
                            let daysPassed = window.totalDaysPassed || 0;
                            let adaptation = Math.min(1.0, daysPassed / 60.0);
                            
                            let injuryRiskMultiplier = 4.0 - (adaptation * 2.5);
                            injuryChance *= injuryRiskMultiplier;
                        }`;

gameContent = gameContent.replace(targetGame2, replaceGame2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', gameContent, 'utf8');

console.log('Patch fitness coach progression applied successfully.');

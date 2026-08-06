const fs = require('fs');

// 1. REVERT GAME.JS
let gameContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// Remove the stamina decay multiplier logic
let targetGame1 = `        // KONDİSYONER PROFİLİ BAŞLANGICI
        if (!window.fitnessCoachProfile) {
            window.fitnessCoachProfile = "diktator"; // Antonio Pintus tarzı
        }

        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
            // Acımasız Kondisyoner Gelişim Eğrisi:
            // Oyuncuların diktatör idmanlarına alışması zaman alır. 60 gün (2 ay) sürer.
            let daysPassed = window.totalDaysPassed || 0;
            let adaptation = Math.min(1.0, daysPassed / 60.0);
            
            // İlk günlerde yorgunluk daha da artar (1.2x). Ancak 60 gün sonra tam makineye dönerler (0.4x).
            let dictatorMultiplier = 1.2 - (adaptation * 0.8);
            staminaDecay *= dictatorMultiplier;
        }`;
gameContent = gameContent.replace(targetGame1, "");

// Remove the injury multiplier logic
let targetGame2 = `                if (dirDiff > 1.2) { 
                    let injuryThreshold = (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) ? 70 : 40;
                    
                    if (p.stamina < injuryThreshold && typeof isGameHalted !== 'undefined' && !isGameHalted && !p.isInjured) {
                        let injuryChance = (injuryThreshold - p.stamina) * 0.00005 * roleMultiplier;
                        
                        if (window.fitnessCoachProfile === 'diktator' && homePlayers.includes(p)) {
                            // Adaptasyon sürecinde kaslar kopmaya çok müsaittir (x4 risk).
                            // Vücut alıştıkça risk azalır ama limitler hep zorlandığı için asla tam güvenli olmaz (x1.5 risk kalır).
                            let daysPassed = window.totalDaysPassed || 0;
                            let adaptation = Math.min(1.0, daysPassed / 60.0);
                            
                            let injuryRiskMultiplier = 4.0 - (adaptation * 2.5);
                            injuryChance *= injuryRiskMultiplier;
                        }

                        if (Math.random() < injuryChance) {`;

let replaceGame2Original = `                if (dirDiff > 1.2) { 
                    if (p.stamina < 40 && typeof isGameHalted !== 'undefined' && !isGameHalted && !p.isInjured) {
                        let injuryChance = (40 - p.stamina) * 0.00005 * roleMultiplier;
                        if (Math.random() < injuryChance) {`;

gameContent = gameContent.replace(targetGame2, replaceGame2Original);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', gameContent, 'utf8');

// 2. PATCH TRAINING.JS
let trainingContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\training.js', 'utf8');

let targetTraining = `    if (type === 'stamina') {
        p.stamina += gain;
        p.speed += (0.1 * ageMultiplier); // Kondisyon biraz hız da artırır
        successMsg = \`\${p.name} kondisyon idmanını tamamladı.\`;
    }`;

let replaceTraining = `    if (!window.fitnessCoachProfile) {
        window.fitnessCoachProfile = "diktator";
    }

    if (type === 'stamina') {
        if (window.fitnessCoachProfile === 'diktator') {
            // Diktatör idmanı çok serttir. Ya mükemmel gelişirsin ya da sakatlanırsın.
            if (Math.random() < 0.15) { // %15 Sakatlık/Aşırı Yüklenme riski
                p.trainingHoursLeft -= hoursCost;
                window.myTeam.budget -= moneyCost;
                p.isInjured = true;
                p.stamina -= 10; // Adale attı
                if(typeof speak === 'function') speak(\`Eyvah! \${p.name} ağır kondisyon yüklemesine dayanamadı ve antrenmanı yarıda bırakıp revire gitti.\`);
                openTrainingFacility();
                return;
            } else {
                p.stamina += (gain * 4.0); // 4 Katı kondisyon gelişimi
                p.speed += (0.2 * ageMultiplier);
                successMsg = \`\${p.name} diktatörün cehennem idmanından sağ çıktı! Kondisyonu devasa seviyede arttı.\`;
            }
        } else {
            p.stamina += gain;
            p.speed += (0.1 * ageMultiplier); 
            successMsg = \`\${p.name} kondisyon idmanını tamamladı.\`;
        }
    }`;

trainingContent = trainingContent.replace(targetTraining, replaceTraining);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\training.js', trainingContent, 'utf8');

console.log('Patch training dictator applied successfully.');

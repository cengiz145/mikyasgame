const fs = require('fs');

let content = fs.readFileSync('js/game.js', 'utf8');

// The player update loop contains variable 'p'. We need to inject the role buffs.
// We will look for: let roleMultiplier = 1.0;
// and staminaDecay calculation.
// And decision making blocks: if (p.passPending)

const staminaSearchStr = `let baseDecayRate = 0.0005;
        let staminaDecay = (dist * baseDecayRate) * roleMultiplier;`;

const staminaReplacement = `let baseDecayRate = 0.0005;
        let staminaDecay = (dist * baseDecayRate) * roleMultiplier;
        
        // 7 PROFİL: FİZİKSEL VE MENTAL ETKİLER
        if (p.tacticalRole === 'box_to_box') {
            staminaDecay *= 0.5; // Hamal/Dinamo yorulmaz
        }
        if (p.tacticalRole === 'utility') {
            // Asker/Joker oyuncular taktik disiplinden kopmaz, kaos yaşamazlar
            if (window.teamPsychology === 'chaos') staminaDecay *= 0.8;
            p.mistakes = 0; 
        }
        if (p.tacticalRole === 'playmaker') {
            p.mistakes = 0; // Maestro pas hatası yapmaz
        }
        if (p.tacticalRole === 'stopper') {
            p.isStunned = false; // Patron stoper asla paniğe kapılmaz
        }`;

content = content.replace(staminaSearchStr, staminaReplacement);

// Role specific TARGETING
const targetSearchStr = `if (p.tacticalRole === 'false_9') targetX += (teamType === 'home' ? -60 : 60);
            else if (p.tacticalRole === 'poacher') targetX += (teamType === 'home' ? 60 : -60);`;

const targetReplacement = `if (p.tacticalRole === 'false_9') targetX += (teamType === 'home' ? -60 : 60);
            else if (p.tacticalRole === 'poacher') {
                targetX += (teamType === 'home' ? 100 : -100); // Fırsatçı santrfor her zaman ceza sahasında bekler
                if (teamType === 'home' && targetX > 750) targetX = 750;
                if (teamType === 'away' && targetX < 50) targetX = 50;
            }
            else if (p.tacticalRole === 'attacking_fullback' && ball.team === teamType) {
                // Çizgi Otobanı top bizdeyken ileri fırlar
                targetX += (teamType === 'home' ? 150 : -150);
            }
            else if (p.tacticalRole === 'utility' && ball.team !== teamType) {
                // Joker top rakipteyken acilen savunmaya/bölgesine döner
                targetX -= (teamType === 'home' ? 50 : -50);
            }`;

content = content.replace(targetSearchStr, targetReplacement);

// Decision making adjustments (Speed, Shoot cooldown)
// Find speed modifiers
const speedSearchStr = `let spd = p.speed || 3.0;`;
const speedReplacement = `let spd = p.speed || 3.0;
        
        // 7 PROFİL: HIZ VE ANLIK KARAR ETKİLERİ
        if (p.tacticalRole === 'winger' && ball.team === teamType) {
            spd *= 1.2; // Cambazlar/Kanatlar topla veya topsuz atakta %20 daha hızlıdır
        }
        if (p.tacticalRole === 'playmaker' && ball.lastTouchedBy === p) {
            spd *= 0.8; // Maestrolar topu alınca oyunu yavaşlatır, etrafı izler
        }`;

content = content.replace(speedSearchStr, speedReplacement);

// Collision Power Buffs
// Search for collision detection logic
const collisionSearchStr = `if (dist < 15 && hp.isStunned === false && ap.isStunned === false) {`;
const collisionReplacement = `if (dist < 15 && hp.isStunned === false && ap.isStunned === false) {
                    
                    // 7 PROFİL: ÇARPIŞMA/GÜÇ ETKİLERİ
                    let hpPower = hp.power;
                    let apPower = ap.power;
                    if (hp.tacticalRole === 'stopper') hpPower += 20; // Patron Stoper çok güçlüdür
                    if (ap.tacticalRole === 'stopper') apPower += 20;
                    if (hp.tacticalRole === 'box_to_box') hpPower += 10; // Dinamo top kapmada iyidir
                    if (ap.tacticalRole === 'box_to_box') apPower += 10;
                    `;

// We also need to replace the usage of hp.power and ap.power with hpPower and apPower in the collision block
// But string replacement might be tricky for the whole block.
// Instead, I'll use regex to replace `hp.power` with `hpPower` in the next 10 lines.

fs.writeFileSync('js/game.js', content, 'utf8');
console.log('js/game.js patched with 7 player profiles logic.');

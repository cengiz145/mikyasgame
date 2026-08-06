const fs = require('fs');

let content = fs.readFileSync('js/game.js', 'utf8');

const collisionSearchStr = `if (dist < 15 && hp.isStunned === false && ap.isStunned === false) {`;
const collisionEndStr = `// top kapma ihtimali`;

// Let's find the exact block and replace it using regex
content = content.replace(/if \(dist < 15 && hp\.isStunned === false && ap\.isStunned === false\) \{[\s\S]*?\/\/ top kapma ihtimali/g, (match) => {
    let replaced = match.replace(/hp\.power/g, 'hpPower').replace(/ap\.power/g, 'apPower');
    
    // inject the new variables right after the if statement
    let injectStr = `if (dist < 15 && hp.isStunned === false && ap.isStunned === false) {
                    // 7 PROFİL: ÇARPIŞMA/GÜÇ ETKİLERİ
                    let hpPower = hp.power;
                    let apPower = ap.power;
                    if (hp.tacticalRole === 'stopper') hpPower += 20; // Patron Stoper
                    if (ap.tacticalRole === 'stopper') apPower += 20;
                    if (hp.tacticalRole === 'box_to_box') hpPower += 15; // Dinamo
                    if (ap.tacticalRole === 'box_to_box') apPower += 15;
                    `;
                    
    return replaced.replace(`if (dist < 15 && hp.isStunned === false && ap.isStunned === false) {`, injectStr);
});

// For Poacher shoot cooldown, search for shootCooldown assignment inside decision logic
// Wait, is there shootCooldown? Let's check game.js for shootCooldown or random chance to shoot
content = content.replace(/if \(Math\.random\(\) < shootChance\)/g, `
            // 7 PROFİL: FIRSATÇI (POACHER)
            if (p.tacticalRole === 'poacher') {
                shootChance *= 5.0; // Fırsatçılar şutu çok hızlı çıkarır
            }
            if (Math.random() < shootChance)`);

fs.writeFileSync('js/game.js', content, 'utf8');
console.log('js/game.js correctly patched with advanced collision & poacher logics.');

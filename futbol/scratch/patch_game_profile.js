const fs = require('fs');
let content = fs.readFileSync('js/game.js', 'utf8');

// 1. initGame buffs (Pragmatist, Proje Hocası, Eski Efsane)
const initBuffsStr = `    window.abandonmentAnnounced = false;`;
const initBuffsReplacement = `    // YENİ: MENAJER PROFİLİ (Başlangıç Etkileri)
    let mProfile = window.managerProfile || 'motivasyon_ustasi';
    if (mProfile === 'pragmatist') {
        homePlayers.forEach(p => { 
            if (p.position && (p.position.includes('CB') || p.position.includes('LB') || p.position.includes('RB') || p.position.includes('Defans') || p.x < 300)) {
                p.power += 10; 
            }
        });
    } else if (mProfile === 'proje_hocasi') {
        homePlayers.forEach(p => { 
            if (p.isTier2 || p.isTier3) {
                p.speed *= 1.2;
                p.power += 10;
            }
        });
    } else if (mProfile === 'eski_efsane') {
        window.isSilentProtest = false; // Efsane hocaya protesto olmaz
    }
    
    window.abandonmentAnnounced = false;`;
content = content.replace(initBuffsStr, initBuffsReplacement);

// 2. staminaDecay buff (Taktik Deha)
const staminaDecayStr = `let staminaDecay = (dist * baseDecayRate) * roleMultiplier;`;
const staminaDecayReplacement = `let staminaDecay = (dist * baseDecayRate) * roleMultiplier;
        // YENİ: MENAJER PROFİLİ (Taktik Deha Stamina Tüketimi)
        if (window.managerProfile === 'taktik_deha' && homePlayers.includes(p)) {
            staminaDecay *= 1.3;
            p.mistakes = 0; // Pas hatası tamamen kalkar
        }`;
content = content.replace(staminaDecayStr, staminaDecayReplacement);

// 3. foulChance buff (Pragmatist)
const foulChanceStr = `let foulChance = isTier2Emotional ? 0.05 : 0.02;`;
const foulChanceReplacement = `let foulChance = isTier2Emotional ? 0.05 : 0.02;
            if (window.managerProfile === 'pragmatist' && teamType === 'home') {
                foulChance *= 1.5; // Karanlık sanatlar: Daha sert, faullü oyun
            }`;
content = content.replace(foulChanceStr, foulChanceReplacement);

// 4. updateCrowdForm buff (İtfaiyeci)
const crowdFormStr = `// Sınırlandırmalar
    if (newForm > 7) newForm = 7;`;
const crowdFormReplacement = `// İtfaiyeci Profili Koruması (Kaos ve Toksik İsyan engellemesi)
    if (window.managerProfile === 'itfaiyeci' && newForm >= 3 && newForm <= 6) {
        newForm = 2; // En kötü taktiksel homurdanmada tutar, çöküşü engeller
    }

    // Sınırlandırmalar
    if (newForm > 7) newForm = 7;`;
content = content.replace(crowdFormStr, crowdFormReplacement);

// 5. Motivasyon Ustası buff (Geriye düşünce Adrenalin)
const scoreboardStr = `if (typeof enemyScore !== 'undefined' && typeof playerScore !== 'undefined' && enemyScore > playerScore) {
        // Geriye düştük, deplasman coşar
        if (window.AudioManager && !window.AudioManager.isChanting) {
            window.AudioManager.triggerAwayDominance(window.todayOpponent || 'away');
        }
    }`;
const scoreboardReplacement = `if (typeof enemyScore !== 'undefined' && typeof playerScore !== 'undefined' && enemyScore > playerScore) {
        // Geriye düştük, deplasman coşar
        if (window.AudioManager && !window.AudioManager.isChanting) {
            window.AudioManager.triggerAwayDominance(window.todayOpponent || 'away');
        }
        
        // Motivasyon Ustası Adrenalin Patlaması
        if (window.managerProfile === 'motivasyon_ustasi') {
            if (typeof homePlayers !== 'undefined') {
                homePlayers.forEach(p => { 
                    p.stamina = Math.min(100, p.stamina + 30); // İkinci rüzgar
                    p.power += 5;
                });
            }
            if (typeof announcerText !== 'undefined') announcerText.textContent = "MOTİVASYON USTASI: TAKIM İKİNCİ RÜZGARI YAKALADI!";
            if (typeof speak === 'function') speak("Menajer saha kenarında adeta çıldırdı ve takımını ateşledi! Oyuncular inanılmaz bir adrenalinle oynamaya başladı.");
        }
    }`;
content = content.replace(scoreboardStr, scoreboardReplacement);


fs.writeFileSync('js/game.js', content, 'utf8');
console.log('js/game.js patched with Manager Profile mechanics!');

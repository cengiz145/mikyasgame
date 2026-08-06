const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Oyuncu Bio objesini initGame içerisine ekle
    const homePushHook = /isUserControlled: false, isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false/g;
    const homePushReplace = `isUserControlled: false, isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false, bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }`;
    
    if (content.match(homePushHook)) {
        content = content.replace(homePushHook, homePushReplace);
    }
    
    const awayPushHook = /isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false/g;
    const awayPushReplace = `isStunned: false, stamina: 100, isRedCarded: false, hasYellowCard: false, bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }`;
    
    // Both home and away push statements look slightly different due to userControlled flag. This awayPushHook will catch the away one.
    if (content.match(awayPushHook)) {
        content = content.replace(awayPushHook, awayPushReplace);
    }

    // 2. updateBiochemistry fonksiyonunu ekle
    const matchTimerHook = /if \(typeof window\.updateCrowdForm === 'function'\) window\.updateCrowdForm\(\);/g;
    const biochemFunc = `
                // AŞAMA 83: Biyokimyasal Motor Güncellemesi
                let updateBiochemistry = function(p, isHome) {
                    if (!p || p.isRedCarded || p.x === -1000) return;
                    if (!p.bio) p.bio = { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 };
                    
                    // Doğal Erime (Decay)
                    p.bio.adrenaline = Math.max(0, p.bio.adrenaline - 5); // Adrenalin çabuk biter
                    p.bio.cortisol = Math.max(0, p.bio.cortisol - 2);     // Stres yavaş azalır
                    p.bio.lacticAcid = Math.max(0, p.bio.lacticAcid - 1); // Dinlenince laktik asit atılır
                    p.bio.dopamine = Math.max(20, Math.min(100, p.bio.dopamine + (Math.random() > 0.5 ? 1 : -1))); // Dalgalanma
                    
                    // Laktik asit birikimi (Koşuya bağlı)
                    if (typeof p.speed !== 'undefined' && p.speed > p.baseSpeed) {
                        p.bio.lacticAcid = Math.min(100, p.bio.lacticAcid + 2);
                    }
                    
                    // Tribün ve Psikolojik Etkiler
                    if (isHome) {
                        if (p.isBooedByOwnFans) p.bio.cortisol = Math.min(100, p.bio.cortisol + 10);
                        if (p.isMessiah) p.bio.dopamine = Math.min(100, p.bio.dopamine + 5);
                        if (window.CrowdForm === 7) p.bio.serotonin = 100; // Ekstra rehavet
                    }
                    
                    // Derbi agresyonu (Testosteron)
                    if (typeof window.isDerby !== 'undefined' && window.isDerby) {
                        p.bio.testosterone = Math.min(100, p.bio.testosterone + 1);
                    }
                    
                    // Laktik asit sakatlık riski (Adale çekmesi)
                    if (p.bio.lacticAcid > 90 && Math.random() < 0.05) {
                        p.isStunned = true; // Kramplar girer
                        if (Math.random() < 0.1 && typeof speak === 'function') speak(p.name + " arka adalesini tutuyor, laktik asit patlaması yaşadı!");
                    }
                    
                    // Efektif Hız ve Güç Hesaplaması
                    let effectiveSpeed = p.baseSpeed * (1 + (p.bio.adrenaline * 0.01)) * (1 - (p.bio.lacticAcid * 0.005));
                    let effectivePower = (p.basePower || 50) * (1 + (p.bio.testosterone * 0.005)) * (1 + (p.bio.adrenaline * 0.005));
                    
                    p.speed = Math.max(0.5, effectiveSpeed);
                    p.power = Math.max(10, Math.min(100, effectivePower));
                    
                    // Kortizol (Stres) Hata oranını artırır
                    p.mistakes = (p.mistakes || 0);
                    if (p.bio.cortisol > 80 && Math.random() < 0.2) p.mistakes++;
                };
                
                if (typeof homePlayers !== 'undefined') homePlayers.forEach(p => updateBiochemistry(p, true));
                if (typeof awayPlayers !== 'undefined') awayPlayers.forEach(p => updateBiochemistry(p, false));
                
                if (typeof window.updateCrowdForm === 'function') window.updateCrowdForm();`;
                
    if (content.match(matchTimerHook) && !content.includes('AŞAMA 83: Biyokimyasal Motor Güncellemesi')) {
        content = content.replace(matchTimerHook, biochemFunc);
    }
    
    // Adrenalin patlamasını "Kırmızı Kart / Ani Kenetlenme" anına ekle
    const kenetlenmeHook = /hp\.speed = \(hp\.baseSpeed \|\| 3\) \* 1\.5; \/\/ Kudurmuş gibi basarlar/g;
    const adrenalinPatlamasi = `hp.speed = (hp.baseSpeed || 3) * 1.5;
                                            if (hp.bio) hp.bio.adrenaline = 100; // Savaş veya Kaç hormonu tavan yapar`;
    
    if (content.match(kenetlenmeHook)) {
        content = content.replace(kenetlenmeHook, adrenalinPatlamasi);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Biyokimyasal Motor (Hormonlar) başarıyla entegre edildi.");
} else {
    console.log("game.js bulunamadı!");
}

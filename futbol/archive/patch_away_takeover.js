const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Deplasman Direnci (Away Resistance Buff)
    const awayStaminaHook = /if \(p\.isTier4\) staminaDecay \*= 3\.0; \/\/ AŞAMA 39: Çaylakların panik eforu/g;
    const awayResistanceCode = `if (p.isTier4) staminaDecay *= 3.0; // AŞAMA 39: Çaylakların panik eforu
        
        // AŞAMA 70: %5'lik Kemik Kadro Direnci (Deplasman Ele Geçirmesi)
        if (typeof isEarlyDefeat !== 'undefined' && isEarlyDefeat && teamType === 'away') {
            staminaDecay *= 0.1; // Deplasman takımı yorulmaz, muazzam direnç kazanır
            spd *= 1.2; // Gelen destekle hızlanırlar
        }`;
    
    if (content.match(awayStaminaHook) && !content.includes('AŞAMA 70: %5')) {
        content = content.replace(awayStaminaHook, awayResistanceCode);
    }

    // 2. İşitsel Yankı (DelayNode) ve Spiker Anonsu
    const dominanceAudioHook = /awayAudio\.volume = 1\.0; \/\/ Maksimum ses/g;
    const dominanceAudioCode = `
            // Yankı Efekti (Boş stadyumda çınlama)
            let delayNode = this.audioCtx.createDelay();
            delayNode.delayTime.value = 0.3; // 300ms yankı
            let feedbackNode = this.audioCtx.createGain();
            feedbackNode.gain.value = 0.4; // Yankı şiddeti
            
            awaySource.connect(delayNode);
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode);
            delayNode.connect(awayPanner);
            
            awayAudio.volume = 1.0; // Maksimum ses`;

    if (content.match(dominanceAudioHook) && !content.includes('delayNode.delayTime')) {
        content = content.replace(dominanceAudioHook, dominanceAudioCode);
    }
    
    const dominanceSpeakHook = /speak\("Ev sahibi takım geriye düştü! Stadyumda ölüm sessizliği var, şu an sadece deplasman tribününün coşkulu marşları yankılanıyor!"\);/g;
    const dominanceSpeakCode = `speak("Ev sahibi takım geriye düştü ve koca stadyum sustu! Şu an köşedeki o %5'lik küçük deplasman grubunun hiç susmadan söylediği marşlar tüm stadyumda yankılanıyor! Ev sahibi takım kendi evinde adeta deplasmanı yaşıyor!");`;
    if (content.match(dominanceSpeakHook)) {
        content = content.replace(dominanceSpeakHook, dominanceSpeakCode);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Deplasman Tribünü Ele Geçirmesi (%5 Kemik Kadro) Eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    const protestHook = /if\(typeof speak === 'function'\) speak\("Tribünler maçı tamamen bıraktı! 'Yönetim İstifa' protestoları/;
    const protestReplace = `
            // Yönetim İstifa sesini çalmayı dener
            let istifaAudio = new Audio('sounds/istifa.ogg');
            istifaAudio.volume = 1.0;
            istifaAudio.play().catch(e => {
                // Dosya yoksa sadece yuhalama sesi çalar
                if(window.AudioManager && window.AudioManager.triggerPossessionReaction) window.AudioManager.triggerPossessionReaction('away');
            });
            if(typeof speak === 'function') speak("Tribünler maçı tamamen bıraktı! 'Yönetim İstifa' protestoları`;

    if (content.match(protestHook) && !content.includes("new Audio('sounds/istifa.ogg')")) {
        content = content.replace(protestHook, protestReplace);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - İstifa sesi altyapısı eklendi.");
    } else {
        console.log("Hook noktası bulunamadı veya zaten ekli.");
    }
} else {
    console.log("game.js bulunamadı!");
}

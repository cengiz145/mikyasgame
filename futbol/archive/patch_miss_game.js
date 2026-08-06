const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Add miss to AudioManager
    if (!content.includes('miss: null')) {
        content = content.replace('boo: null,', 'boo: null,\n    miss: null,');
        content = content.replace("this.boo = new Audio('sounds/boo.ogg');\n            this.boo.volume = 0.7;\n        }", "this.boo = new Audio('sounds/boo.ogg');\n            this.boo.volume = 0.7;\n        }\n        if (!this.miss) {\n            this.miss = new Audio('sounds/miss.ogg');\n            this.miss.volume = 0.9;\n        }");
        
        const playMissFn = `
    playMiss: function() {
        if (this.isMuted) return;
        if (this.miss) {
            this.miss.currentTime = 0;
            this.miss.play().catch(e => console.log(e));
            if (this.ambiance) this.ambiance.volume = 0.2;
            setTimeout(() => { if (this.ambiance) this.ambiance.volume = 0.4; }, 3000);
        }
    },`;
        content = content.replace('toggleMute: function()', playMissFn + '\n    toggleMute: function()');
    }

    // 2. Add playMiss() triggers
    content = content.replace(/reason === 'out' \?/g, "reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), ");
    // The above replace might break syntax depending on context: `speak(reason === 'out' ? "A" : "B")`
    // If it becomes `speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(), "A") : "B")` this is valid JS (comma operator)!
    
    // Let's add it to Direkten dönme:
    content = content.replace(/speak\("Top direkten dndǬ!/g, "if(window.AudioManager) window.AudioManager.playMiss(); speak(\"Top direkten dndǬ!");
    content = content.replace(/speak\("Top direkten döndü!/g, "if(window.AudioManager) window.AudioManager.playMiss(); speak(\"Top direkten döndü!");

    // And also to simple 'out' or save conditions where `speak(` is called but we don't know the exact string.
    // Let's just hook into the `speak` function itself if it contains "aut" or "dışarı" or "kurtardı".
    // Better yet, find the `handleShotResult` or `speak` definition.
    const speakHook = `function speak(text) {
    if (typeof text === 'string' && (text.toLowerCase().includes('aut') || text.toLowerCase().includes('dışarı') || text.toLowerCase().includes('kurtardı') || text.toLowerCase().includes('direk') || text.toLowerCase().includes('kaçırdı'))) {
        if(window.AudioManager && window.AudioManager.playMiss) window.AudioManager.playMiss();
    }`;
    content = content.replace(/function speak\(text\) \{/, speakHook);

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Awww/Miss sesi eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

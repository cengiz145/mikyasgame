const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Bu hata paternini bul ve onar
    // Pattern: if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "TEXT" : "TEXT");
    
    // Regex ile tümünü düzelt: (window.AudioManager && window.AudioManager.playMiss(), "HERHANGİ BİR TEXT" :
    // Şunu yapacağız: (window.AudioManager && window.AudioManager.playMiss(), "HERHANGİ BİR TEXT") :
    
    content = content.replace(/\(window\.AudioManager && window\.AudioManager\.playMiss\(\),\s*([^:]+?)\s*:/g, "(window.AudioManager && window.AudioManager.playMiss(), $1) :");

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Ternary operator parenthesis errors fixed.");
}

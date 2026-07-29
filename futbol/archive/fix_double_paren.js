const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    content = content.replace(/\)\) :/g, ") :");

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Double parenthesis fixed.");
}

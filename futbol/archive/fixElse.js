const fs = require('fs');
let text = fs.readFileSync('js/game.js', 'utf8');

const targetRegex = /\} else \{\s*document\.getElementById\('game-screen'\)\.classList\.add\('hidden'\);\s*document\.getElementById\('menu-screen'\)\.classList\.remove\('hidden'\);\s*\}/g;

const replacement = `} else {
            if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
            const mm = document.getElementById('main-menu-container');
            if (mm) mm.style.display = 'flex';
        }`;

if (targetRegex.test(text)) {
    text = text.replace(targetRegex, replacement);
    fs.writeFileSync('js/game.js', text);
    console.log('Fixed else block exit logic');
} else {
    console.log('Target not found');
}

const fs = require('fs');
let text = fs.readFileSync('js/game.js', 'utf8');

const targetRegex = /if \(window\.isFriendlyMatch\) \{\s*window\.isFriendlyMatch = false;\s*document\.getElementById\('game-screen'\)\.classList\.add\('hidden'\);\s*document\.getElementById\('menu-screen'\)\.classList\.remove\('hidden'\);\s*if \(typeof speak === 'function'\) speak\("Hazırlık maçı sona erdi\."\);\s*\}/g;

const replacement = `if (window.isFriendlyMatch) {
            window.isFriendlyMatch = false;
            if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
            const mm = document.getElementById('main-menu-container');
            if (mm) mm.style.display = 'flex';
            if (typeof speak === 'function') speak("Hazırlık maçı sona erdi.");
        }`;

if (targetRegex.test(text)) {
    text = text.replace(targetRegex, replacement);
    fs.writeFileSync('js/game.js', text);
    console.log('Fixed friendly match exit logic');
} else {
    console.log('Target not found');
}

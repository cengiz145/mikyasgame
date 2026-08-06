const fs = require('fs');
const path = require('path');

const jsDir = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js';
const archiveDir = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\archive';

if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir);

const activeFiles = [
    'autoRepair.js', 'data.js', 'save.js', 'league.js', 'audio.js', 
    'dialogueData.js', 'dialogue.js', 'transfer.js', 'training.js', 
    'scout.js', 'psychology.js', 'manager.js', 'squad.js', 'game.js', 'menu.js'
];

const files = fs.readdirSync(jsDir);
for (let f of files) {
    if (f.endsWith('.js') && !activeFiles.includes(f)) {
        fs.renameSync(path.join(jsDir, f), path.join(archiveDir, f));
    }
}
console.log("Moved unused JS files to archive.");

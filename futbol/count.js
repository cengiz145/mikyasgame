const fs = require('fs');
const files = ['data.js','data_superlig.js','data_tff1.js','data_tff2.js','data_premier.js','data_laliga.js','data_bundesliga.js','data_ligue1.js','data_seriea.js','data_eredivisie.js','data_portekiz.js','data_brazil.js','data_world.js','data_world_stars.js'];
let total = 0;
files.forEach(f => {
    try {
        const content = fs.readFileSync('js/' + f, 'utf8');
        // match "name": or name: but only inside a player object block (containing "power" or power:)
        // simpler: count occurrences of position: or "position": since only players have position
        const count = (content.match(/["']?position["']?\s*:/g) || []).length;
        console.log(f + ': ' + count);
        total += count;
    } catch(e) {}
});
console.log('Total players: ' + total);

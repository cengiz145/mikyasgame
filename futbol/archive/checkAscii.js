const fs = require('fs');
let text = fs.readFileSync('js/game.js', 'utf8');

let lines = text.split('\n');
let count = 0;
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Remove strings
    let noStrings = line.replace(/['"`].*?['"`]/g, '');
    // Remove comments
    let noComments = noStrings.replace(/\/\/.*|\/\*.*?\*\//g, '');
    if (/[^\x00-\x7F]/.test(noComments)) {
        console.log((i+1) + ': ' + noComments.trim());
        count++;
        if (count > 20) break;
    }
}

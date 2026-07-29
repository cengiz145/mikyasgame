const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js', 'utf8').split('\n');
let depth = 0;
let lastDepth = 0;
for(let i=0; i<lines.length; i++) {
    for(let char of lines[i]) {
        if(char === '{') depth++;
        if(char === '}') depth--;
    }
    if (depth < 0) { console.log('Negative depth at line ' + (i+1)); break; }
    // We expect depth to be 0 for global scope functions
    if (depth === 0 && lastDepth > 0) {
        // console.log('Back to 0 at line ' + (i+1));
    }
    if (i % 100 === 0 && depth > 0) {
        console.log('Line ' + (i+1) + ' depth: ' + depth);
    }
    lastDepth = depth;
}
console.log('Final depth: ' + depth);

const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js', 'utf8').split('\n');
let depth = 0;
let lastDepth = 0;
for(let i=2550; i<3350; i++) {
    for(let char of lines[i]) {
        if(char === '{') depth++;
        if(char === '}') depth--;
    }
    if (depth !== lastDepth) {
        console.log("Line " + (i+1) + " Depth: " + depth + " | " + lines[i].substring(0, 40));
    }
    lastDepth = depth;
}

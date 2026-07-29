const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\menu.js', 'utf8').split('\n');
let depth = 0;
for(let i=0; i<lines.length; i++) {
    for(let char of lines[i]) {
        if(char === '{') depth++;
        if(char === '}') depth--;
    }
    if (depth < 0) {
        console.log("Negative depth at line " + (i+1));
        break;
    }
}
console.log("Final depth: " + depth);

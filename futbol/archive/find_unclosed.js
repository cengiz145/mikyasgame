const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js', 'utf8').split('\n');

let stack = [];
for(let i=2400; i<lines.length; i++) {
    for(let j=0; j<lines[i].length; j++) {
        if(lines[i][j] === '{') {
            stack.push(i+1);
        }
        if(lines[i][j] === '}') {
            stack.pop();
        }
    }
}
console.log("Unclosed brackets opened at lines: " + stack.join(', '));

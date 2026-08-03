const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js', 'utf8').split('\n');
let depth = 0;
for(let i=2400; i<2600; i++) {
    for(let char of lines[i]) {
        if(char === '{') depth++;
        if(char === '}') depth--;
    }
    // Sadece derinliğin değiştiği veya yüksek olduğu yerleri bulmak için
    console.log("Line " + (i+1) + " Depth: " + depth + " | " + lines[i].substring(0, 40));
}

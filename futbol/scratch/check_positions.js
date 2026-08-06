const fs = require('fs');

const files = [
    'js/data.js', 
    'js/data_world.js', 
    'js/data_superlig.js', 
    'js/data_tff1.js',
    'js/data_premier.js',
    'js/data_laliga.js',
    'js/data_seriea.js',
    'js/data_bundesliga.js'
];

let uniquePositions = new Set();

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Yöntem 1: position: "..."
    let regex1 = /position:\s*"([^"]+)"/g;
    let match;
    while ((match = regex1.exec(content)) !== null) {
        uniquePositions.add(match[1]);
    }
    
    // Yöntem 2: "position": "..."
    let regex2 = /"position":\s*"([^"]+)"/g;
    while ((match = regex2.exec(content)) !== null) {
        uniquePositions.add(match[1]);
    }
});

console.log("Bulunan tüm eşsiz mevkiler:");
let arr = Array.from(uniquePositions);
arr.sort();
arr.forEach(pos => console.log("- " + pos));

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The literal string '\n' is causing visual glitches.
html = html.replace(/\\n/g, '');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Removed literal \\n from index.html');

const fs = require('fs');
let js = fs.readFileSync('js/menu.js', 'utf8');

// Odak zorlama scriptlerini silelim
const regex = /; if\([a-zA-Z0-9_().']+\) \{ let title = [a-zA-Z0-9_().']+\.querySelector\('h1, h2'\); if\(title\) title\.focus\(\); else [a-zA-Z0-9_().']+\.focus\(\); \};/g;

js = js.replace(regex, '');

fs.writeFileSync('js/menu.js', js, 'utf8');
console.log('Cleaned focus scripts from menu.js');

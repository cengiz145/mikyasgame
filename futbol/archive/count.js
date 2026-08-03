const fs = require('fs');
let text = fs.readFileSync('js/game.js', 'utf8');
let single = (text.match(/'/g) || []).length;
let double = (text.match(/"/g) || []).length;
let backtick = (text.match(/`/g) || []).length;
console.log('Single:', single, 'Double:', double, 'Backtick:', backtick);

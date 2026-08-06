const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="([^"]+)"><\/script>/g, '<script src="$1" charset="utf-8"></script>');
fs.writeFileSync('index.html', html);
console.log('Added charset=utf-8 to all scripts.');

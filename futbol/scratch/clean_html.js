const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Sadece container tanımlarındaki aria-hidden="true" ve role="presentation" özelliklerini temizleyelim.
html = html.replace(/ class="menu-container" role="presentation" aria-hidden="true"/g, ' class="menu-container"');
html = html.replace(/ role="presentation" aria-hidden="true"/g, '');
html = html.replace(/ aria-hidden="true"/g, '');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Cleaned index.html');

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let buttonsToAdd = `
        <button id="btn-country-tr" class="menu-button" style="background-color: #c0392b; width: 300px;">🇹🇷 Türkiye</button>
        <button id="btn-country-eng" class="menu-button" style="background-color: #2980b9; width: 300px;">🏴󠁧󠁢󠁥󠁮󠁧󠁿 İngiltere</button>
        <button id="btn-country-it" class="menu-button" style="background-color: #27ae60; width: 300px;">🇮🇹 İtalya</button>
`;

html = html.replace('<h1 style="color: #f1c40f;">Ülke Seçimi</h1>', '<h1 style="color: #f1c40f;">Ülke Seçimi</h1>' + buttonsToAdd);

fs.writeFileSync('index.html', html);
console.log('Added missing country buttons back!');

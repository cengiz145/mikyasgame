const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let buttonsToAdd = `
          <button id="btn-league-laliga" class="menu-button" style="background-color: #d35400; width: 300px;">🇪🇸 La Liga</button>
`;

html = html.replace('<button id="btn-league-seriea"', buttonsToAdd + '<button id="btn-league-seriea"');

fs.writeFileSync('index.html', html);
console.log('Added La Liga button!');

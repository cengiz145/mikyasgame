const fs = require('fs');

const map = {
  'ı': 'ı', 'İ': 'İ',
  'ç': 'ç', 'Ç': 'Ç',
  'ö': 'ö', 'Ö': 'Ö',
  'ü': 'ü', 'Ü': 'Ü',
  'ş': 'ş', 'Ş': 'Ş',
  'ğ': 'ğ', 'Ğ': 'Ğ',
  'â€™': "'", 'â€œ': '"', 'â€': '"'
};

function recoverFile(filePath) {
    let text = fs.readFileSync(filePath, 'utf8');
    for (let key in map) {
        text = text.split(key).join(map[key]);
    }
    fs.writeFileSync(filePath, text, 'utf8');
    console.log('Recovered ' + filePath);
}

recoverFile('js/game.js');

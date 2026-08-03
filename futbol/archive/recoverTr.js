const fs = require('fs');

const map = {
  'Ä±': 'ı', 'Ä°': 'İ',
  'Ã§': 'ç', 'Ã‡': 'Ç',
  'Ã¶': 'ö', 'Ã–': 'Ö',
  'Ã¼': 'ü', 'Ãœ': 'Ü',
  'ÅŸ': 'ş', 'Åž': 'Ş',
  'ÄŸ': 'ğ', 'Äž': 'Ğ',
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

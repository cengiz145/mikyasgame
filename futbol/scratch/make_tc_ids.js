const fs = require('fs');

const dataPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
const worldPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data_world.js';

let dataContent = fs.readFileSync(dataPath, 'utf8');
let worldContent = fs.readFileSync(worldPath, 'utf8');

const idSet = new Set();

function generateTC() {
    let newId;
    do {
        newId = Math.floor(Math.random() * 90000000000) + 10000000000;
    } while (idSet.has(newId));
    idSet.add(newId);
    return newId;
}

// Replace in data.js (format: { id: 123456, ... })
dataContent = dataContent.replace(/([{,]\s*id:\s*)(\d+)/g, (match, p1, p2) => {
    return p1 + generateTC();
});

// Replace in data_world.js (format: "id": 123456)
worldContent = worldContent.replace(/("id":\s*)(\d+)/g, (match, p1, p2) => {
    return p1 + generateTC();
});

fs.writeFileSync(dataPath, dataContent, 'utf8');
fs.writeFileSync(worldPath, worldContent, 'utf8');

console.log("TC Kimlik Operasyonu Tamamlandi! Tam " + idSet.size + " futbolcuya 11 haneli benzersiz kimlik numarasi verildi.");

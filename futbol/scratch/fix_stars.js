const fs = require('fs');

// Fix data.js
let dataPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
let dataContent = fs.readFileSync(dataPath, 'utf8');

const correctBirthplaces = {
    "K. Mbappe": "Paris, Fransa",
    "E. Haaland": "Leeds, Ingiltere",
    "J. Bellingham": "Stourbridge, Ingiltere",
    "Vini Jr.": "Sao Goncalo, Brezilya",
    "P. Foden": "Stockport, Ingiltere",
    "B. Saka": "Londra, Ingiltere",
    "L. Yamal": "Katalonya, Ispanya",
    "F. Wirtz": "Pulheim, Almanya",
    "J. Musiala": "Stuttgart, Almanya",
    "Rodri": "Madrid, Ispanya",
    "D. Rice": "Londra, Ingiltere",
    "M. Odegaard": "Drammen, Norvec",
    "Tchouameni": "Rouen, Fransa",
    "R. Dias": "Amadora, Portekiz",
    "W. Saliba": "Bondy, Fransa",
    "G. Donnarumma": "Castellammare, Italya",
    "A. Davies": "Buduburam, Gana",
    "T. Alexander-Arnold": "Liverpool, Ingiltere",
    "H. Kane": "Londra, Ingiltere",
    "A. Guler": "Ankara, Turkiye",
    "K. De Bruyne": "Drongen, Belcika",
    "L. Messi": "Rosario, Arjantin",
    "C. Ronaldo": "Madeira, Portekiz",
    "Neymar Jr": "Sao Paulo, Brezilya",
    "M. Salah": "Nagrig, Misir",
    "V. van Dijk": "Breda, Hollanda",
    "T. Courtois": "Bree, Belcika",
    "A. Griezmann": "Macon, Fransa"
};

for (const [name, place] of Object.entries(correctBirthplaces)) {
    // Regex to match the birthplace property for this specific player name
    const regex = new RegExp(`(birthplace:\\s*")[^"]+(",[^}]+name:\\s*"${name.replace('.', '\\.')}")`, 'g');
    dataContent = dataContent.replace(regex, `$1${place}$2`);
}
fs.writeFileSync(dataPath, dataContent, 'utf8');
console.log('data.js yildizlari duzeltildi.');

// Fix data_world.js (JSON)
let worldPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data_world.js';
let worldContentStr = fs.readFileSync(worldPath, 'utf8');

// The file might be a JS file that assigns to a variable, let's check
if (worldContentStr.includes('const data_world_players = [')) {
    // It's a JS file. Let's just do a string replace for the fake Ronaldo.
    // Instead of parsing the whole weird JS/JSON, just regex replace Kaleci Ronaldo.
    worldContentStr = worldContentStr.replace(/"name":\s*"Cristiano Ronaldo",\s*"position":\s*"Kaleci",\s*"power":\s*91,\s*"speed":\s*5,\s*"age":\s*28,\s*birthplace:\s*"Buenos Aires, Ingiltere"/g, 
    `"name": "Rastgele Kaleci",
        "position": "Kaleci",
        "power": 75,
        "speed": 5,
        "age": 28,
        birthplace: "Buenos Aires, Arjantin"`);
    fs.writeFileSync(worldPath, worldContentStr, 'utf8');
    console.log('data_world.js icindeki Kaleci Ronaldo silindi ve Rastgele Kaleci yapildi.');
}

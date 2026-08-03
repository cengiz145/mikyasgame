const fs = require('fs');

let worldPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data_world.js';
let worldContentStr = fs.readFileSync(worldPath, 'utf8');

worldContentStr = worldContentStr.replace(
    /"name":\s*"Cristiano Ronaldo",\s*"position":\s*"Kaleci",\s*"power":\s*91,\s*"speed":\s*5,\s*"age":\s*28,\s*birthplace:\s*"Buenos Aires, Ingiltere"/g, 
    `"name": "Rastgele Kaleci",\n        "position": "Kaleci",\n        "power": 75,\n        "speed": 5,\n        "age": 28,\n        birthplace: "Buenos Aires, Arjantin"`
);

fs.writeFileSync(worldPath, worldContentStr, 'utf8');
console.log('data_world.js icindeki Kaleci Ronaldo silindi!');

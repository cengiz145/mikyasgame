const fs = require('fs');

const dataPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
const worldPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data_world.js';

let dataContent = fs.readFileSync(dataPath, 'utf8');
let worldContent = fs.readFileSync(worldPath, 'utf8');

function fixContent(content) {
    // 1. Fix Typos
    content = content.replace(/Trkiye/g, "Türkiye");
    content = content.replace(/Trkiye/g, "Türkiye");
    content = content.replace(/0stanbul/g, "İstanbul");
    content = content.replace(/0zmir/g, "İzmir");
    content = content.replace(/Eski_ehir/g, "Eskişehir");
    content = content.replace(/Diyarbak1r/g, "Diyarbakır");
    content = content.replace(/Ispanya/g, "İspanya");
    content = content.replace(/Ingiltere/g, "İngiltere");

    // 2. Fix Goalkeeper Speeds in JS format (data.js)
    // Matches: position: "Kaleci", power: 88, speed: 4.5
    // We want to safely replace the speed if it belongs to a Kaleci.
    
    // Split by line to be safe
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('"Kaleci"') || line.includes(': "Kaleci"')) {
            // Check speed
            let speedMatch = line.match(/speed:\s*([\d\.]+)/) || line.match(/"speed":\s*([\d\.]+)/);
            if (speedMatch) {
                let speed = parseFloat(speedMatch[1]);
                if (speed > 3.0) {
                    let newSpeed = (Math.random() * (2.8 - 1.5) + 1.5).toFixed(1);
                    // replace just this line's speed
                    if (line.includes(`"speed":`)) {
                        line = line.replace(/"speed":\s*[\d\.]+/, `"speed": ${newSpeed}`);
                    } else {
                        line = line.replace(/speed:\s*[\d\.]+/, `speed: ${newSpeed}`);
                    }
                    lines[i] = line;
                }
            }
        }
    }
    return lines.join('\n');
}

dataContent = fixContent(dataContent);
worldContent = fixContent(worldContent);

fs.writeFileSync(dataPath, dataContent, 'utf8');
fs.writeFileSync(worldPath, worldContent, 'utf8');

console.log("Veritabanı onarıldı: Karakter hataları düzeltildi ve Süper Hızlı Kaleciler yavaşlatıldı.");

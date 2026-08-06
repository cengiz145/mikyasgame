const fs = require('fs');

const files = [
    'js/data.js', 
    'js/data_world.js', 
    'js/data_superlig.js', 
    'js/data_tff1.js',
    'js/data_premier.js',
    'js/data_laliga.js',
    'js/data_seriea.js',
    'js/data_bundesliga.js'
];

const trueStats = {
    "Lionel Messi": { age: 39, position: "Sağ Kanat", speed: 2.8 },
    "Cristiano Ronaldo": { age: 41, position: "Santrfor", speed: 2.5 },
    "Kylian Mbappé": { age: 28, position: "Santrfor", speed: 4.8 },
    "Erling Haaland": { age: 26, position: "Santrfor", speed: 4.7 },
    "Jude Bellingham": { age: 23, position: "Orta Saha", speed: 4.0 },
    "Vinícius Júnior": { age: 26, position: "Sol Kanat", speed: 4.9 },
    "Arda Güler": { age: 21, position: "Maestro", speed: 3.5 },
    "Lamine Yamal": { age: 19, position: "Sağ Kanat", speed: 4.5 },
    "Neymar": { age: 34, position: "Sol Kanat", speed: 3.9 }
};

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Yöntem 1: data.js (Tek satırda obje)
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        let playerName = "";
        let nameMatch = line.match(/"name":\s*"([^"]+)"/) || line.match(/name:\s*"([^"]+)"/);
        
        // Eğer data_world.js gibi obje birden fazla satıra yayılmışsa, 
        // isim önceki satırlarda kalmış olabilir, o yüzden yukarı doğru 10 satır tarayalım
        if (nameMatch) {
            playerName = nameMatch[1];
        } else {
            for (let j = i; j >= Math.max(0, i - 10); j--) {
                let prevMatch = lines[j].match(/"name":\s*"([^"]+)"/) || lines[j].match(/name:\s*"([^"]+)"/);
                if (prevMatch) {
                    playerName = prevMatch[1];
                    break;
                }
                if (lines[j].includes("{")) break; // obje başlangıcı
            }
        }

        let ageMatch = line.match(/"age":\s*(\d+)/) || line.match(/age:\s*(\d+)/);
        if (ageMatch) {
            let currentAge = parseInt(ageMatch[1]);
            let newAge = currentAge + 2; 
            
            if (trueStats[playerName]) {
                newAge = trueStats[playerName].age;
            } else if (newAge > 43) {
                // Emeklilik yaşını çok geçmesinler
                newAge = 40; 
            }
            
            if (line.includes('"age":')) {
                line = line.replace(/"age":\s*\d+/, `"age": ${newAge}`);
            } else {
                line = line.replace(/age:\s*\d+/, `age: ${newAge}`);
            }
        }
        
        if (trueStats[playerName]) {
            let posMatch = line.match(/"position":\s*"([^"]+)"/) || line.match(/position:\s*"([^"]+)"/);
            if (posMatch) {
                if (line.includes('"position":')) {
                    line = line.replace(/"position":\s*"[^"]+"/, `"position": "${trueStats[playerName].position}"`);
                } else {
                    line = line.replace(/position:\s*"[^"]+"/, `position: "${trueStats[playerName].position}"`);
                }
            }
            
            let speedMatch = line.match(/"speed":\s*([\d\.]+)/) || line.match(/speed:\s*([\d\.]+)/);
            if (speedMatch) {
                if (line.includes('"speed":')) {
                    line = line.replace(/"speed":\s*[\d\.]+/, `"speed": ${trueStats[playerName].speed}`);
                } else {
                    line = line.replace(/speed:\s*[\d\.]+/, `speed: ${trueStats[playerName].speed}`);
                }
            }
        }
        
        lines[i] = line;
    }
    
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
});

console.log("Yaşlar +2 artırıldı, Messi gibi yıldızların hataları düzeltildi.");

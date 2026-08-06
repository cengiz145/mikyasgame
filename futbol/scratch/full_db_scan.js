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

let stats = {
    totalPlayers: 0,
    missingAge: 0,
    missingPower: 0,
    missingSpeed: 0,
    missingNationality: 0,
    missingPosition: 0,
    missingRole: 0,
    uniquePositions: new Set(),
    uniqueNationalities: new Set(),
    uniqueRoles: new Set()
};

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Basit regex ile her obje bloğunu yakalayalım. 
    // Ancak daha güvenli yol: window.leagueData = ... yerine sadece JSON verisini regex ile parse etmek zor olabilir.
    // Biz satır satır tarayarak eksikleri düzeltip kaydedelim.
    
    let lines = content.split('\n');
    let inObj = false;
    let objLines = [];
    let startIdx = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Obje ayrıştırıcı (Süslü parantez içine bak)
        if (line.includes('{') && (line.includes('name:') || line.includes('"name":'))) {
            // tek satırlık obje
            stats.totalPlayers++;
            let posMatch = line.match(/"position":\s*"([^"]+)"/) || line.match(/position:\s*"([^"]+)"/);
            if (posMatch) stats.uniquePositions.add(posMatch[1]);
            else stats.missingPosition++;
            
            let natMatch = line.match(/"nationality":\s*"([^"]+)"/) || line.match(/nationality:\s*"([^"]+)"/);
            if (natMatch) stats.uniqueNationalities.add(natMatch[1]);
            else stats.missingNationality++;
            
            let roleMatch = line.match(/"tacticalRole":\s*"([^"]+)"/) || line.match(/tacticalRole:\s*"([^"]+)"/);
            if (roleMatch) stats.uniqueRoles.add(roleMatch[1]);
            else {
                // Rolü yoksa rastgele rol ata
                stats.missingRole++;
                let defaultRole = posMatch && posMatch[1].includes('Kaleci') ? 'classic' : 'playmaker';
                if (line.includes('"name":')) line = line.replace('}', `, "tacticalRole": "${defaultRole}" }`);
                else line = line.replace('}', `, tacticalRole: "${defaultRole}" }`);
                lines[i] = line;
            }
            
            if (!line.includes('power:')) {
                if (!line.includes('"power":')) stats.missingPower++;
            }
            if (!line.includes('speed:')) {
                if (!line.includes('"speed":')) stats.missingSpeed++;
            }
        } 
    }
    
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
});

console.log("=== FULL DB SCAN RESULTS ===");
console.log("Total Players:", stats.totalPlayers);
console.log("Missing Position:", stats.missingPosition);
console.log("Missing Nationality:", stats.missingNationality);
console.log("Missing Power:", stats.missingPower);
console.log("Missing Speed:", stats.missingSpeed);
console.log("Fixed Missing Roles:", stats.missingRole);
console.log("----------------------------");
console.log("All Found Positions:", Array.from(stats.uniquePositions).sort().join(', '));
console.log("All Found Roles:", Array.from(stats.uniqueRoles).sort().join(', '));

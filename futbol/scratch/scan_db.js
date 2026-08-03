const fs = require('fs');

const dataPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
const worldPath = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data_world.js';

let dataContent = fs.readFileSync(dataPath, 'utf8');
let worldContent = fs.readFileSync(worldPath, 'utf8');

// We will use regex to extract players since they are JS files, not pure JSON.
function extractPlayers(content) {
    let players = [];
    const regex = /{[^{}]*id:\s*(\d+)[^{}]*name:\s*"([^"]+)"[^{}]*}/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        players.push({
            id: match[1],
            name: match[2],
            raw: match[0]
        });
    }
    
    // Also try JSON-like objects for data_world
    const regexWorld = /{\s*"id":\s*(\d+)[^{}]*"name":\s*"([^"]+)"[^{}]*}/g;
    while ((match = regexWorld.exec(content)) !== null) {
        players.push({
            id: match[1],
            name: match[2],
            raw: match[0]
        });
    }
    return players;
}

let allPlayers = [...extractPlayers(dataContent), ...extractPlayers(worldContent)];

console.log(`Total extracted raw player objects: ${allPlayers.length}`);

let issues = {
    ageAnomalies: 0,
    powerAnomalies: 0,
    typos: 0,
    duplicateIds: 0,
    goalkeeperSpeed: 0
};

let ids = new Set();

allPlayers.forEach(p => {
    let raw = p.raw;
    
    // Check Age
    let ageMatch = raw.match(/age:\s*(\d+)/) || raw.match(/"age":\s*(\d+)/);
    if (ageMatch) {
        let age = parseInt(ageMatch[1]);
        if (age < 15 || age > 45) issues.ageAnomalies++;
    }

    // Check Power
    let powerMatch = raw.match(/power:\s*(\d+)/) || raw.match(/"power":\s*(\d+)/);
    if (powerMatch) {
        let power = parseInt(powerMatch[1]);
        if (power < 1 || power > 99) issues.powerAnomalies++;
    }

    // Check Typos in birthplace
    if (raw.includes('Trkiye') || raw.includes('Trkiye') || raw.includes('0stanbul') || raw.includes('0zmir')) {
        issues.typos++;
    }

    // Check Keeper speed
    let isKeeper = raw.includes('"Kaleci"') || raw.includes(': "Kaleci"');
    if (isKeeper) {
        let speedMatch = raw.match(/speed:\s*([\d\.]+)/) || raw.match(/"speed":\s*([\d\.]+)/);
        if (speedMatch) {
            let speed = parseFloat(speedMatch[1]);
            if (speed > 3.0) issues.goalkeeperSpeed++; // Keepers shouldn't be very fast
        }
    }

    if (ids.has(p.id)) {
        issues.duplicateIds++;
    } else {
        ids.add(p.id);
    }
});

console.log('--- ISSUES FOUND ---');
console.log(JSON.stringify(issues, null, 2));


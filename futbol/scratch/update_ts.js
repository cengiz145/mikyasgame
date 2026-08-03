const fs = require('fs');
const path = 'js/data_superlig.js';

let content = fs.readFileSync(path, 'utf8');

const ts_players = [
    {"id": "ts_1", "name": "Uğurcan Çakır", "teamId": "trabzonspor", "position": "KL", "power": 85, "age": 28, "value": 12, "wage": 2, "morale": 90, "fitness": 100, "form": 8, "contractYears": 3},
    {"id": "ts_2", "name": "M. Taha Tepe", "teamId": "trabzonspor", "position": "KL", "power": 70, "age": 23, "value": 2, "wage": 0.5, "morale": 80, "fitness": 100, "form": 6, "contractYears": 2},
    {"id": "ts_3", "name": "Stefan Savic", "teamId": "trabzonspor", "position": "DF", "power": 84, "age": 33, "value": 4, "wage": 2.5, "morale": 85, "fitness": 95, "form": 7, "contractYears": 2},
    {"id": "ts_4", "name": "Stefano Denswil", "teamId": "trabzonspor", "position": "DF", "power": 78, "age": 31, "value": 3, "wage": 1.5, "morale": 80, "fitness": 98, "form": 6, "contractYears": 1},
    {"id": "ts_5", "name": "Serdar Saatçı", "teamId": "trabzonspor", "position": "DF", "power": 76, "age": 21, "value": 5, "wage": 1, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "ts_6", "name": "Eren Elmalı", "teamId": "trabzonspor", "position": "DF", "power": 78, "age": 24, "value": 6, "wage": 1, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_7", "name": "Borna Barisic", "teamId": "trabzonspor", "position": "DF", "power": 77, "age": 31, "value": 3, "wage": 1.5, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "ts_8", "name": "Pedro Malheiro", "teamId": "trabzonspor", "position": "DF", "power": 76, "age": 23, "value": 4, "wage": 1, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_9", "name": "Batista Mendy", "teamId": "trabzonspor", "position": "OS", "power": 82, "age": 24, "value": 10, "wage": 1.5, "morale": 90, "fitness": 100, "form": 8, "contractYears": 3},
    {"id": "ts_10", "name": "Okay Yokuşlu", "teamId": "trabzonspor", "position": "OS", "power": 80, "age": 30, "value": 4, "wage": 1.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_11", "name": "John Lundstram", "teamId": "trabzonspor", "position": "OS", "power": 78, "age": 30, "value": 3, "wage": 1.5, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "ts_12", "name": "Ozan Tufan", "teamId": "trabzonspor", "position": "OS", "power": 79, "age": 29, "value": 4, "wage": 1.5, "morale": 85, "fitness": 98, "form": 7, "contractYears": 3},
    {"id": "ts_13", "name": "Enis Bardhi", "teamId": "trabzonspor", "position": "OS", "power": 79, "age": 29, "value": 5, "wage": 1.5, "morale": 80, "fitness": 100, "form": 7, "contractYears": 1},
    {"id": "ts_14", "name": "Muhammed Cham", "teamId": "trabzonspor", "position": "OS", "power": 81, "age": 23, "value": 8, "wage": 1.5, "morale": 90, "fitness": 100, "form": 8, "contractYears": 4},
    {"id": "ts_15", "name": "Cihan Çanak", "teamId": "trabzonspor", "position": "OS", "power": 75, "age": 19, "value": 4, "wage": 0.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "ts_16", "name": "Edin Visca", "teamId": "trabzonspor", "position": "OS", "power": 82, "age": 34, "value": 2, "wage": 2, "morale": 90, "fitness": 90, "form": 8, "contractYears": 1},
    {"id": "ts_17", "name": "Anthony Nwakaeme", "teamId": "trabzonspor", "position": "OS", "power": 81, "age": 35, "value": 1, "wage": 1.8, "morale": 90, "fitness": 85, "form": 7, "contractYears": 1},
    {"id": "ts_18", "name": "Simon Banza", "teamId": "trabzonspor", "position": "FV", "power": 83, "age": 27, "value": 15, "wage": 2.5, "morale": 95, "fitness": 100, "form": 9, "contractYears": 1},
    {"id": "ts_19", "name": "Denis Drăguș", "teamId": "trabzonspor", "position": "FV", "power": 79, "age": 25, "value": 6, "wage": 1.2, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_20", "name": "Enis Destan", "teamId": "trabzonspor", "position": "FV", "power": 76, "age": 22, "value": 5, "wage": 0.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3}
];

const pattern = /(const trPlayers = \[)([\s\S]*?)(\];)/;
const match = content.match(pattern);

if (match) {
    const arrayContent = match[2];
    
    // Basit bir regex ile obje bloklarını ayır
    const blocks = arrayContent.match(/\{[^}]+\}/g);
    
    let newBlocks = [];
    if (blocks) {
        for (let block of blocks) {
            if (!block.includes('"teamId": "trabzonspor"')) {
                newBlocks.push(block);
            }
        }
    }
    
    // ts_players'ı ekle
    for (let p of ts_players) {
        newBlocks.push(JSON.stringify(p, null, 8));
    }
    
    const newArrayContent = newBlocks.join(',\n');
    content = content.replace(pattern, `$1\n${newArrayContent}\n$3`);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Updated Trabzonspor squad successfully.");
} else {
    console.log("trPlayers array not found.");
}

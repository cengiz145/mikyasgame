const fs = require('fs');
const path = 'js/data_superlig.js';

let content = fs.readFileSync(path, 'utf8');

const ts_players = [
    {"id": "ts_1", "name": "André Onana", "teamId": "trabzonspor", "position": "KL", "power": 86, "age": 30, "value": 10, "wage": 3.0, "morale": 90, "fitness": 100, "form": 8, "contractYears": 1},
    {"id": "ts_2", "name": "Onuralp Çevikkan", "teamId": "trabzonspor", "position": "KL", "power": 65, "age": 20, "value": 1, "wage": 0.3, "morale": 80, "fitness": 100, "form": 6, "contractYears": 3},
    {"id": "ts_3", "name": "Arseniy Batagov", "teamId": "trabzonspor", "position": "DF", "power": 80, "age": 24, "value": 11, "wage": 1.5, "morale": 85, "fitness": 95, "form": 7, "contractYears": 3},
    {"id": "ts_4", "name": "Chibuike Nwaiwu", "teamId": "trabzonspor", "position": "DF", "power": 78, "age": 22, "value": 10, "wage": 1.2, "morale": 85, "fitness": 98, "form": 6, "contractYears": 4},
    {"id": "ts_5", "name": "Stefan Savic", "teamId": "trabzonspor", "position": "DF", "power": 79, "age": 35, "value": 0.4, "wage": 1.5, "morale": 85, "fitness": 90, "form": 7, "contractYears": 1},
    {"id": "ts_6", "name": "Mathias Løvik", "teamId": "trabzonspor", "position": "DF", "power": 75, "age": 22, "value": 4, "wage": 0.8, "morale": 80, "fitness": 100, "form": 6, "contractYears": 4},
    {"id": "ts_7", "name": "Mustafa Eskihellaç", "teamId": "trabzonspor", "position": "DF", "power": 74, "age": 29, "value": 4, "wage": 0.9, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "ts_8", "name": "Wagner Pina", "teamId": "trabzonspor", "position": "DF", "power": 80, "age": 23, "value": 11, "wage": 1.2, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "ts_9", "name": "Okay Yokuşlu", "teamId": "trabzonspor", "position": "OS", "power": 76, "age": 32, "value": 1.2, "wage": 1.0, "morale": 85, "fitness": 100, "form": 7, "contractYears": 2},
    {"id": "ts_10", "name": "Salih Malkoçoğlu", "teamId": "trabzonspor", "position": "OS", "power": 68, "age": 21, "value": 1.5, "wage": 0.4, "morale": 80, "fitness": 100, "form": 6, "contractYears": 3},
    {"id": "ts_11", "name": "Christ Inao Oulaï", "teamId": "trabzonspor", "position": "OS", "power": 85, "age": 20, "value": 23, "wage": 2.0, "morale": 90, "fitness": 100, "form": 8, "contractYears": 4},
    {"id": "ts_12", "name": "Tim Jabol-Folcarelli", "teamId": "trabzonspor", "position": "OS", "power": 78, "age": 26, "value": 7, "wage": 1.1, "morale": 85, "fitness": 98, "form": 7, "contractYears": 3},
    {"id": "ts_13", "name": "Benjamin Bouchouari", "teamId": "trabzonspor", "position": "OS", "power": 76, "age": 24, "value": 4.5, "wage": 0.8, "morale": 80, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_14", "name": "Ozan Tufan", "teamId": "trabzonspor", "position": "OS", "power": 75, "age": 31, "value": 1.5, "wage": 1.2, "morale": 85, "fitness": 98, "form": 7, "contractYears": 2},
    {"id": "ts_15", "name": "Ernest Muci", "teamId": "trabzonspor", "position": "OS", "power": 82, "age": 25, "value": 11, "wage": 1.8, "morale": 90, "fitness": 100, "form": 8, "contractYears": 1},
    {"id": "ts_16", "name": "Anthony Nwakaeme", "teamId": "trabzonspor", "position": "OS", "power": 75, "age": 37, "value": 0.1, "wage": 0.8, "morale": 85, "fitness": 85, "form": 6, "contractYears": 1},
    {"id": "ts_17", "name": "Oleksandr Zubkov", "teamId": "trabzonspor", "position": "OS", "power": 78, "age": 29, "value": 6, "wage": 1.3, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_18", "name": "Edin Visca", "teamId": "trabzonspor", "position": "OS", "power": 76, "age": 36, "value": 0.1, "wage": 1.0, "morale": 85, "fitness": 90, "form": 7, "contractYears": 1},
    {"id": "ts_19", "name": "Felipe Augusto", "teamId": "trabzonspor", "position": "FV", "power": 84, "age": 22, "value": 15, "wage": 2.0, "morale": 95, "fitness": 100, "form": 9, "contractYears": 4},
    {"id": "ts_20", "name": "Paul Onuachu", "teamId": "trabzonspor", "position": "FV", "power": 81, "age": 32, "value": 6, "wage": 1.8, "morale": 90, "fitness": 100, "form": 8, "contractYears": 3},
    {"id": "ts_21", "name": "Umut Nayir", "teamId": "trabzonspor", "position": "FV", "power": 74, "age": 32, "value": 0.6, "wage": 0.7, "morale": 80, "fitness": 95, "form": 6, "contractYears": 1}
];

const pattern = /(const trPlayers = \[)([\s\S]*?)(\];)/;
const match = content.match(pattern);

if (match) {
    const arrayContent = match[2];
    
    const blocks = arrayContent.match(/\{[^}]+\}/g);
    
    let newBlocks = [];
    if (blocks) {
        for (let block of blocks) {
            if (!block.includes('"teamId": "trabzonspor"')) {
                newBlocks.push(block);
            }
        }
    }
    
    for (let p of ts_players) {
        newBlocks.push(JSON.stringify(p, null, 8));
    }
    
    const newArrayContent = newBlocks.join(',\n');
    content = content.replace(pattern, `$1\n${newArrayContent}\n$3`);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Updated Trabzonspor squad with Transfermarkt data successfully.");
} else {
    console.log("trPlayers array not found.");
}

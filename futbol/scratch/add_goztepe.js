const fs = require('fs');
const path = 'js/data_superlig.js';

let content = fs.readFileSync(path, 'utf8');

const goztepe = {
    "id": "goztepe",
    "name": "Göztepe",
    "color": "#f1c40f", // Yellow
    "budget": 20,
    "city": "Izmir",
    "leagueId": "superlig"
};

const goztepe_players = [
    {"id": "gz_1", "name": "Mateusz Lis", "teamId": "goztepe", "position": "KL", "power": 76, "age": 28, "value": 2.5, "wage": 0.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "gz_2", "name": "Arda Özçimen", "teamId": "goztepe", "position": "KL", "power": 68, "age": 23, "value": 0.4, "wage": 0.2, "morale": 80, "fitness": 100, "form": 6, "contractYears": 2},
    {"id": "gz_3", "name": "Hélicio", "teamId": "goztepe", "position": "DF", "power": 75, "age": 22, "value": 2, "wage": 0.7, "morale": 85, "fitness": 95, "form": 7, "contractYears": 3},
    {"id": "gz_4", "name": "Koray Günter", "teamId": "goztepe", "position": "DF", "power": 74, "age": 30, "value": 1.2, "wage": 0.8, "morale": 80, "fitness": 95, "form": 6, "contractYears": 1},
    {"id": "gz_5", "name": "Malcom Bokele", "teamId": "goztepe", "position": "DF", "power": 73, "age": 25, "value": 1.8, "wage": 0.6, "morale": 80, "fitness": 100, "form": 6, "contractYears": 3},
    {"id": "gz_6", "name": "Novatus Miroshi", "teamId": "goztepe", "position": "DF", "power": 73, "age": 22, "value": 1.5, "wage": 0.5, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "gz_7", "name": "Taha Altıkardeş", "teamId": "goztepe", "position": "DF", "power": 72, "age": 21, "value": 2.5, "wage": 0.5, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "gz_8", "name": "İsmail Köybaşı", "teamId": "goztepe", "position": "DF", "power": 70, "age": 36, "value": 0.1, "wage": 0.5, "morale": 80, "fitness": 85, "form": 6, "contractYears": 1},
    {"id": "gz_9", "name": "Djalma Silva", "teamId": "goztepe", "position": "DF", "power": 74, "age": 30, "value": 1, "wage": 0.7, "morale": 85, "fitness": 95, "form": 7, "contractYears": 2},
    {"id": "gz_10", "name": "Nazım Sangaré", "teamId": "goztepe", "position": "DF", "power": 73, "age": 30, "value": 0.8, "wage": 0.6, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "gz_11", "name": "Ogün Bayrak", "teamId": "goztepe", "position": "DF", "power": 71, "age": 26, "value": 1, "wage": 0.4, "morale": 80, "fitness": 100, "form": 6, "contractYears": 2},
    {"id": "gz_12", "name": "Isaac Solet", "teamId": "goztepe", "position": "OS", "power": 75, "age": 24, "value": 2.5, "wage": 0.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "gz_13", "name": "Kuryu Matsuki", "teamId": "goztepe", "position": "OS", "power": 77, "age": 22, "value": 5, "wage": 1.2, "morale": 90, "fitness": 100, "form": 8, "contractYears": 1},
    {"id": "gz_14", "name": "Victor Hugo", "teamId": "goztepe", "position": "OS", "power": 74, "age": 21, "value": 3, "wage": 0.7, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "gz_15", "name": "Doğan Erdoğan", "teamId": "goztepe", "position": "OS", "power": 73, "age": 28, "value": 0.9, "wage": 0.6, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "gz_16", "name": "Anthony Dennis", "teamId": "goztepe", "position": "OS", "power": 72, "age": 21, "value": 1.5, "wage": 0.4, "morale": 80, "fitness": 100, "form": 6, "contractYears": 3},
    {"id": "gz_17", "name": "Yalçın Kayan", "teamId": "goztepe", "position": "OS", "power": 71, "age": 26, "value": 1.4, "wage": 0.5, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "gz_18", "name": "David Tijanić", "teamId": "goztepe", "position": "OS", "power": 74, "age": 27, "value": 1.6, "wage": 0.7, "morale": 85, "fitness": 95, "form": 7, "contractYears": 2},
    {"id": "gz_19", "name": "Rômulo", "teamId": "goztepe", "position": "FV", "power": 76, "age": 23, "value": 3, "wage": 0.9, "morale": 85, "fitness": 100, "form": 8, "contractYears": 3},
    {"id": "gz_20", "name": "David Datro Fofana", "teamId": "goztepe", "position": "FV", "power": 77, "age": 22, "value": 10, "wage": 1.5, "morale": 90, "fitness": 100, "form": 8, "contractYears": 1},
    {"id": "gz_21", "name": "Juan", "teamId": "goztepe", "position": "FV", "power": 74, "age": 23, "value": 2.5, "wage": 0.8, "morale": 80, "fitness": 100, "form": 7, "contractYears": 1},
    {"id": "gz_22", "name": "Kubilay Kanatsızkuş", "teamId": "goztepe", "position": "FV", "power": 70, "age": 28, "value": 0.5, "wage": 0.4, "morale": 80, "fitness": 95, "form": 6, "contractYears": 1}
];

// 1. Takımı ekle veya değiştir
const teamPattern = /(const trTeams = \[)([\s\S]*?)(\];)/;
const teamMatch = content.match(teamPattern);

if (teamMatch) {
    let teamArrayContent = teamMatch[2];
    let teamBlocks = teamArrayContent.match(/\{[^}]+\}/g);
    let newTeamBlocks = [];
    
    let foundGoztepe = false;
    if (teamBlocks) {
        for (let block of teamBlocks) {
            if (block.includes('"id": "goztepe"')) {
                // Ignore old one
                foundGoztepe = true;
            } else if (block.includes('"id": "alanya"')) {
                // Alanya is the last team, we will append before or after
                newTeamBlocks.push(block);
            } else {
                newTeamBlocks.push(block);
            }
        }
    }
    
    newTeamBlocks.push(JSON.stringify(goztepe, null, 8));
    
    const newTeamArrayContent = newTeamBlocks.join(',\n');
    content = content.replace(teamPattern, `$1\n${newTeamArrayContent}\n$3`);
}


// 2. Oyuncuları ekle
const playerPattern = /(const trPlayers = \[)([\s\S]*?)(\];)/;
const playerMatch = content.match(playerPattern);

if (playerMatch) {
    const playerArrayContent = playerMatch[2];
    const playerBlocks = playerArrayContent.match(/\{[^}]+\}/g);
    
    let newPlayerBlocks = [];
    if (playerBlocks) {
        for (let block of playerBlocks) {
            if (!block.includes('"teamId": "goztepe"')) {
                newPlayerBlocks.push(block);
            }
        }
    }
    
    for (let p of goztepe_players) {
        newPlayerBlocks.push(JSON.stringify(p, null, 8));
    }
    
    const newPlayerArrayContent = newPlayerBlocks.join(',\n');
    content = content.replace(playerPattern, `$1\n${newPlayerArrayContent}\n$3`);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Göztepe team and squad added successfully.");

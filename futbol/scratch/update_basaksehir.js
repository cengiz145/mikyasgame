const fs = require('fs');
const path = 'js/data_superlig.js';

let content = fs.readFileSync(path, 'utf8');

const basaksehir_players = [
    {"id": "bs_1", "name": "Muhammed Şengezer", "teamId": "basaksehir", "position": "KL", "power": 78, "age": 29, "value": 3.5, "wage": 1.2, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "bs_2", "name": "Doğan Alemdar", "teamId": "basaksehir", "position": "KL", "power": 74, "age": 23, "value": 1.5, "wage": 0.8, "morale": 80, "fitness": 100, "form": 6, "contractYears": 2},
    {"id": "bs_3", "name": "Volkan Babacan", "teamId": "basaksehir", "position": "KL", "power": 72, "age": 37, "value": 0.05, "wage": 0.5, "morale": 80, "fitness": 85, "form": 6, "contractYears": 1},
    {"id": "bs_4", "name": "Jerome Opoku", "teamId": "basaksehir", "position": "DF", "power": 78, "age": 27, "value": 5, "wage": 1.5, "morale": 85, "fitness": 95, "form": 7, "contractYears": 3},
    {"id": "bs_5", "name": "Léo Duarte", "teamId": "basaksehir", "position": "DF", "power": 76, "age": 29, "value": 2.5, "wage": 1.2, "morale": 80, "fitness": 95, "form": 6, "contractYears": 1},
    {"id": "bs_6", "name": "Hamza Güreler", "teamId": "basaksehir", "position": "DF", "power": 70, "age": 20, "value": 1.8, "wage": 0.5, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "bs_7", "name": "Ousseynou Ba", "teamId": "basaksehir", "position": "DF", "power": 75, "age": 30, "value": 1.2, "wage": 1.0, "morale": 80, "fitness": 90, "form": 6, "contractYears": 2},
    {"id": "bs_8", "name": "Christopher Operi", "teamId": "basaksehir", "position": "DF", "power": 77, "age": 29, "value": 4, "wage": 1.3, "morale": 85, "fitness": 95, "form": 7, "contractYears": 3},
    {"id": "bs_9", "name": "Kazımcan Karataş", "teamId": "basaksehir", "position": "DF", "power": 74, "age": 23, "value": 2, "wage": 0.8, "morale": 80, "fitness": 100, "form": 6, "contractYears": 1},
    {"id": "bs_10", "name": "Festy Ebosele", "teamId": "basaksehir", "position": "DF", "power": 75, "age": 23, "value": 2.5, "wage": 1.0, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "bs_11", "name": "Onur Bulut", "teamId": "basaksehir", "position": "DF", "power": 74, "age": 32, "value": 0.6, "wage": 0.8, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "bs_12", "name": "Berat Özdemir", "teamId": "basaksehir", "position": "OS", "power": 76, "age": 28, "value": 2.5, "wage": 1.2, "morale": 85, "fitness": 95, "form": 7, "contractYears": 3},
    {"id": "bs_13", "name": "Jakub Kaluzinski", "teamId": "basaksehir", "position": "OS", "power": 75, "age": 23, "value": 2.5, "wage": 1.0, "morale": 80, "fitness": 100, "form": 6, "contractYears": 3},
    {"id": "bs_14", "name": "Umut Güneş", "teamId": "basaksehir", "position": "OS", "power": 76, "age": 26, "value": 3, "wage": 1.2, "morale": 85, "fitness": 95, "form": 7, "contractYears": 2},
    {"id": "bs_15", "name": "Olivier Kemen", "teamId": "basaksehir", "position": "OS", "power": 76, "age": 29, "value": 2.5, "wage": 1.1, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "bs_16", "name": "Miguel Crespo", "teamId": "basaksehir", "position": "OS", "power": 77, "age": 29, "value": 2, "wage": 1.2, "morale": 85, "fitness": 95, "form": 7, "contractYears": 3},
    {"id": "bs_17", "name": "Amine Harit", "teamId": "basaksehir", "position": "OS", "power": 80, "age": 29, "value": 5, "wage": 1.8, "morale": 90, "fitness": 95, "form": 8, "contractYears": 1},
    {"id": "bs_18", "name": "Ivan Brnic", "teamId": "basaksehir", "position": "OS", "power": 74, "age": 24, "value": 2, "wage": 0.8, "morale": 80, "fitness": 100, "form": 6, "contractYears": 3},
    {"id": "bs_19", "name": "Abbosbek Fayzullaev", "teamId": "basaksehir", "position": "OS", "power": 79, "age": 22, "value": 7, "wage": 1.5, "morale": 85, "fitness": 100, "form": 8, "contractYears": 4},
    {"id": "bs_20", "name": "Yusuf Sarı", "teamId": "basaksehir", "position": "OS", "power": 77, "age": 27, "value": 4, "wage": 1.3, "morale": 85, "fitness": 95, "form": 7, "contractYears": 2},
    {"id": "bs_21", "name": "Eldor Shomurodov", "teamId": "basaksehir", "position": "FV", "power": 79, "age": 30, "value": 7, "wage": 1.8, "morale": 90, "fitness": 100, "form": 8, "contractYears": 1},
    {"id": "bs_22", "name": "Bertuğ Yıldırım", "teamId": "basaksehir", "position": "FV", "power": 78, "age": 23, "value": 7, "wage": 1.5, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "bs_23", "name": "Davie Selke", "teamId": "basaksehir", "position": "FV", "power": 76, "age": 31, "value": 2.8, "wage": 1.4, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2}
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
            if (!block.includes('"teamId": "basaksehir"')) {
                newBlocks.push(block);
            }
        }
    }
    
    // basaksehir_players'ı ekle
    for (let p of basaksehir_players) {
        newBlocks.push(JSON.stringify(p, null, 8));
    }
    
    const newArrayContent = newBlocks.join(',\n');
    content = content.replace(pattern, `$1\n${newArrayContent}\n$3`);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Updated Başakşehir squad with Transfermarkt data successfully.");
} else {
    console.log("trPlayers array not found.");
}

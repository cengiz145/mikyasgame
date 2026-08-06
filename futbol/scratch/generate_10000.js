const fs = require('fs');

const firstNames = [
    "Juan", "Carlos", "Luis", "Jose", "Miguel", "Jorge", "Pedro", "Diego", "Alejandro", "Javier",
    "Marco", "Lucas", "Matteo", "Leonardo", "Alessandro", "Gabriel", "Thiago", "Arthur", "Bernardo",
    "Ibrahim", "Musa", "Ali", "Hassan", "Omar", "Tariq", "Youssef", "Karim", "Hakim", "Ziyech",
    "John", "David", "Michael", "James", "Robert", "William", "Joseph", "Thomas", "Charles",
    "Jean", "Pierre", "Paul", "Jacques", "Michel", "Claude", "Antoine", "Louis", "Henri",
    "Oliver", "Jack", "Harry", "Jacob", "Charlie", "Thomas", "George", "Oscar", "James",
    "Noah", "Liam", "Mason", "Jacob", "William", "Ethan", "James", "Alexander", "Michael",
    "Daniel", "Matthew", "Aiden", "Henry", "Joseph", "Jackson", "Samuel", "Sebastian", "David",
    "Yusuf", "Mustafa", "Emre", "Ahmet", "Mehmet", "Can", "Burak", "Kaan", "Cem", "Deniz"
];

const lastNames = [
    "Garcia", "Martinez", "Rodriguez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Gomez", "Martin",
    "Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Jesus",
    "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino",
    "Traore", "Diallo", "Toure", "Diop", "Cisse", "Ndiaye", "Sow", "Fall", "Ba", "Gueye",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
    "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau",
    "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Aydın", "Özdemir", "Arslan",
    "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz"
];

const positions = [
    "Kaleci", "Stoper", "Stoper", "Merkez Bek", "Sağ Bek", "Sol Bek",
    "Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro",
    "Sağ Kanat", "Sol Kanat", "Forvet", "Forvet", "Sağ Forvet", "Sol Forvet"
];

const roles = [
    "classic", "sweeper_keeper", "stopper", "sweeper", "anchor", "box_to_box", 
    "playmaker", "maestro", "regista", "inside_forward", "poacher", "target_man", "false_9"
];

const mentalTraits = ["elite", "aggressive", "fragile", "classic"];

const players = [];

for (let i = 0; i < 10000; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const mental = mentalTraits[Math.floor(Math.random() * mentalTraits.length)];
    
    // Güç dağılımı: Çoğunluk 50-65 arası, nadiren 65-80 arası, çok nadir 80+
    let power;
    let rand = Math.random();
    if (rand < 0.7) power = Math.floor(Math.random() * 16) + 50; // 50-65
    else if (rand < 0.95) power = Math.floor(Math.random() * 16) + 66; // 66-81
    else power = Math.floor(Math.random() * 8) + 82; // 82-89 Wonderkid/Star
    
    const speed = Math.floor(Math.random() * 6) + 4; // 4-9
    
    // Yaş dağılımı: 17 ile 38 arası
    const age = Math.floor(Math.random() * 22) + 17;
    
    const contractYears = Math.floor(Math.random() * 3) + 1;
    
    const id = `${fName.toLowerCase()}_${lName.toLowerCase()}_10k_${i}`;

    players.push({
        id: id.replace(/[^a-z0-9_]/g, ''),
        name: `${fName} ${lName}`,
        position: pos,
        power: power,
        speed: speed,
        age: age,
        teamId: "free_agent",
        tacticalRole: role,
        mentalTrait: mental,
        contractYears: contractYears,
        isListed: false
    });
}

let fileContent = `// js/data_10000.js\n// Yapay Zeka tarafindan uretilmis 10.000 Serbest Oyuncu (Free Agent Havuzu)\n\nwindow.leagueData = window.leagueData || { teams: [], players: [] };\n\n`;
fileContent += `const freeAgentPool10k = ${JSON.stringify(players, null, 4)};\n\n`;
fileContent += `freeAgentPool10k.forEach(p => window.leagueData.players.push(p));\n`;

fs.writeFileSync('js/data_10000.js', fileContent, 'utf-8');
console.log('10.000 oyuncu basariyla js/data_10000.js dosyasina yazildi!');

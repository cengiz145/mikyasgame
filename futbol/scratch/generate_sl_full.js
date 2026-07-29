const fs = require('fs');

const slTeams = [
    {"id": "galatasaray", "name": "Galatasaray", "color": "#A90432", "budget": 65, "city": "Istanbul", "leagueId": "superlig"},
    {"id": "fenerbahce", "name": "Fenerbahçe", "color": "#000080", "budget": 65, "city": "Istanbul", "leagueId": "superlig"},
    {"id": "besiktas", "name": "Beşiktaş", "color": "#000000", "budget": 55, "city": "Istanbul", "leagueId": "superlig"},
    {"id": "trabzonspor", "name": "Trabzonspor", "color": "#800000", "budget": 45, "city": "Trabzon", "leagueId": "superlig"},
    {"id": "basaksehir", "name": "Başakşehir", "color": "#FF6600", "budget": 35, "city": "Istanbul", "leagueId": "superlig"},
    {"id": "kasimpasa", "name": "Kasımpaşa", "color": "#000080", "budget": 25, "city": "Istanbul", "leagueId": "superlig"},
    {"id": "alanyaspor", "name": "Alanyaspor", "color": "#FFA500", "budget": 25, "city": "Antalya", "leagueId": "superlig"},
    {"id": "konyaspor", "name": "Konyaspor", "color": "#008000", "budget": 25, "city": "Konya", "leagueId": "superlig"},
    {"id": "rizespor", "name": "Rizespor", "color": "#0000FF", "budget": 20, "city": "Rize", "leagueId": "superlig"},
    {"id": "gaziantep", "name": "Gaziantep FK", "color": "#FF0000", "budget": 20, "city": "Gaziantep", "leagueId": "superlig"},
    {"id": "samsunspor", "name": "Samsunspor", "color": "#FF0000", "budget": 25, "city": "Samsun", "leagueId": "superlig"},
    {"id": "goztepe", "name": "Göztepe", "color": "#FFFF00", "budget": 25, "city": "Izmir", "leagueId": "superlig"},
    {"id": "eyupspor", "name": "Eyüpspor", "color": "#800080", "budget": 30, "city": "Istanbul", "leagueId": "superlig"},
    {"id": "sivasspor", "name": "Sivasspor", "color": "#FF0000", "budget": 25, "city": "Sivas", "leagueId": "superlig"},
    {"id": "antalyaspor", "name": "Antalyaspor", "color": "#FF0000", "budget": 25, "city": "Antalya", "leagueId": "superlig"},
    {"id": "kayserispor", "name": "Kayserispor", "color": "#FFFF00", "budget": 20, "city": "Kayseri", "leagueId": "superlig"},
    {"id": "hatayspor", "name": "Hatayspor", "color": "#800000", "budget": 15, "city": "Hatay", "leagueId": "superlig"},
    {"id": "adanademir", "name": "Adana Demirspor", "color": "#0000FF", "budget": 20, "city": "Adana", "leagueId": "superlig"},
    {"id": "bodrumspor", "name": "Bodrum FK", "color": "#008000", "budget": 20, "city": "Mugla", "leagueId": "superlig"}
];

const slPlayers = {
    "galatasaray": [
        "M. Icardi|Santrfor|90|elite", "D. Mertens|10 Numara|87|elite", "L. Torreira|Ön Libero|88|aggressive", 
        "B. Yılmaz|Sağ Açık|86|creative", "F. Muslera|Kaleci|85|elite", "D. Sanchez|Stoper|86|aggressive", 
        "A. Bardakcı|Stoper|85|aggressive", "K. Aktürkoğlu|Sol Açık|84|creative", "S. Boey|Sağ Bek|86|aggressive", // returning for simulation
        "K. Demirbay|Merkez Orta Saha|82|consistent", "V. Nelsson|Stoper|83|consistent", "D. Köhn|Sol Bek|81|aggressive", 
        "G. Sara|Merkez Orta Saha|85|creative", "E. Jelert|Sağ Bek|80|consistent", "H. Ziyech|Sağ Açık|83|fragile", 
        "M. Batshuayi|Santrfor|82|aggressive", "G. Günay|Kaleci|76|consistent", "B. Kutlu|Ön Libero|78|consistent",
        "K. Ayhan|Stoper|79|consistent", "Y. Akgün|Sağ Açık|78|creative", "M. Icardi|Santrfor|89|elite"
    ],
    "fenerbahce": [
        "E. Dzeko|Santrfor|87|elite", "S. Szymanski|10 Numara|86|creative", "Fred|Merkez Orta Saha|88|elite",
        "D. Tadic|Sol Açık|87|elite", "D. Livakovic|Kaleci|85|consistent", "A. Djiku|Stoper|84|consistent", 
        "C. Söyüncü|Stoper|83|aggressive", "F. Kadıoğlu|Sol Bek|86|creative", "B. Osayi-Samuel|Sağ Bek|82|aggressive",
        "I. Kahveci|Sağ Açık|85|creative", "Y. En-Nesyri|Santrfor|85|aggressive", "A. Saint-Maximin|Sol Açık|86|creative",
        "I. Yüksek|Ön Libero|81|aggressive", "S. Amrabat|Ön Libero|84|aggressive", "M. Müldür|Sağ Bek|79|consistent",
        "R. Becao|Stoper|82|aggressive", "C. Ünder|Sağ Açık|81|fragile", "E. Mor|Sağ Açık|77|fragile", 
        "İ. Eğribayat|Kaleci|76|consistent", "M. H. Yandaş|Merkez Orta Saha|77|aggressive", "S. Dursun|Santrfor|75|consistent"
    ],
    "besiktas": [
        "C. Immobile|Santrfor|88|elite", "Rafa Silva|10 Numara|87|elite", "G. Fernandes|Merkez Orta Saha|85|aggressive",
        "M. Rashica|Sağ Açık|83|consistent", "M. Günok|Kaleci|83|consistent", "G. Paulista|Stoper|84|elite",
        "O. Colley|Stoper|81|aggressive", "A. Masuaku|Sol Bek|80|creative", "J. Svensson|Sağ Bek|79|consistent",
        "Semih Kılıçsoy|Santrfor|82|creative", "Al Musrati|Ön Libero|83|consistent", "C. Ndour|Merkez Orta Saha|80|creative",
        "J. Mario|Sol Açık|82|consistent", "E. Uduokhai|Stoper|81|aggressive", "B. Zaynutdinov|Sol Bek|78|consistent",
        "E. Destanoğlu|Kaleci|76|fragile", "N. Uysal|Stoper|75|elite", "S. Uçan|Merkez Orta Saha|78|consistent",
        "T. Sanuç|Stoper|77|consistent", "C. Keleş|Sağ Açık|75|creative"
    ],
    "trabzonspor": [
        "S. Banza|Santrfor|83|aggressive", "E. Vişça|Sağ Açık|83|elite", "Trezeguet|Sol Açık|82|creative",
        "U. Çakır|Kaleci|85|elite", "S. Savic|Stoper|84|elite", "S. Denswil|Stoper|80|consistent",
        "E. Elmalı|Sol Bek|78|aggressive", "P. Malheiro|Sağ Bek|78|creative", "J. Lundstram|Merkez Orta Saha|80|consistent",
        "B. Mendy|Ön Libero|82|aggressive", "O. Tufan|Merkez Orta Saha|80|aggressive", "E. Destan|Santrfor|77|aggressive",
        "M. Orsic|Sol Açık|81|fragile", "A. Nwakaeme|Sol Açık|82|creative", "M. Cham|10 Numara|81|creative",
        "U. Bozok|Santrfor|76|fragile", "D. Asan|Sağ Bek|75|consistent", "B. Asan|Stoper|75|consistent",
        "E. Çetin|Kaleci|74|consistent", "A. Bardhi|10 Numara|79|creative"
    ]
};

// Gerçekçi Anadolu ve TFF 1. Lig için jeneratör
const tr_firstNames = ["Ahmet", "Mehmet", "Can", "Burak", "Emre", "Ozan", "Hasan", "Mustafa", "Ali", "Serkan", "Volkan", "Gökhan", "Arda", "Efe", "Umut", "Enes", "Cengiz", "Kaan", "Kerem", "Yusuf"];
const tr_lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek"];
const foreign_firstNames = ["Moussa", "Alex", "Diego", "Carlos", "John", "David", "Gaston", "Victor", "Matias", "Lucas", "Fernando", "Kevin", "Christian", "Max", "Leo"];
const foreign_lastNames = ["Ndiaye", "Diaby", "Tavares", "Silva", "Gomez", "Lopez", "Mendes", "Santos", "Costa", "Fernandez", "Onyekuru", "Sow", "Ba", "Gomis"];

function generateTRName(isForeign) {
    if (isForeign) {
        return foreign_firstNames[Math.floor(Math.random() * foreign_firstNames.length)] + " " + foreign_lastNames[Math.floor(Math.random() * foreign_lastNames.length)];
    } else {
        return tr_firstNames[Math.floor(Math.random() * tr_firstNames.length)] + " " + tr_lastNames[Math.floor(Math.random() * tr_lastNames.length)];
    }
}

const roles = ["Kaleci", "Kaleci", "Sağ Bek", "Sol Bek", "Stoper", "Stoper", "Ön Libero", "Merkez Orta Saha", "10 Numara", "Sağ Açık", "Sol Açık", "Santrfor", "Santrfor"];
const traits = ["elite", "aggressive", "fragile", "consistent", "creative"];

const players = [];
let player_id = 40000;

for (let team of slTeams) {
    let tid = team.id;
    let t_pow = team.budget + 10;
    
    if (slPlayers[tid]) {
        for (let pStr of slPlayers[tid]) {
            let [name, pos, powStr, tr] = pStr.split('|');
            players.push({
                "id": player_id++,
                "teamId": tid,
                "name": name,
                "age": Math.floor(Math.random() * 12) + 21,
                "position": pos,
                "power": parseInt(powStr),
                "speed": parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
                "mentalTrait": tr,
                "tacticalRole": "classic",
                "contractYears": Math.floor(Math.random() * 4) + 1
            });
        }
        // Eksik olanı tamamla 24'e
        let currentCount = slPlayers[tid].length;
        for (let i = currentCount; i < 24; i++) {
            let pos = roles[i % roles.length];
            players.push({
                "id": player_id++,
                "teamId": tid,
                "name": generateTRName(Math.random() < 0.3),
                "age": Math.floor(Math.random() * 10) + 19,
                "position": pos,
                "power": t_pow - Math.floor(Math.random() * 10),
                "speed": parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
                "mentalTrait": traits[Math.floor(Math.random() * traits.length)],
                "tacticalRole": "classic",
                "contractYears": Math.floor(Math.random() * 4) + 1
            });
        }
    } else {
        // Anadolu takımı 24 gerçekçi oyuncu
        for (let i = 0; i < 24; i++) {
            let pos = roles[i % roles.length];
            // Yabancı kuralı gibi: %50 yabancı
            let isForeign = Math.random() < 0.5;
            players.push({
                "id": player_id++,
                "teamId": tid,
                "name": generateTRName(isForeign),
                "age": Math.floor(Math.random() * 13) + 21,
                "position": pos,
                "power": t_pow + Math.floor(Math.random() * 10) - 5,
                "speed": parseFloat((Math.random() * 2 + 2.5).toFixed(1)),
                "mentalTrait": traits[Math.floor(Math.random() * traits.length)],
                "tacticalRole": "classic",
                "contractYears": Math.floor(Math.random() * 4) + 1
            });
        }
    }
}

const js_content = `// TÜRKİYE SÜPER LİG VERİTABANI
const trTeams = ${JSON.stringify(slTeams, null, 4)};
const trPlayers = ${JSON.stringify(players, null, 4)};

if (window.leagueData) {
    // Önceki superlig takımlarını temizle
    window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'superlig');
    // Önceki superlig oyuncularını temizle
    window.leagueData.players = window.leagueData.players.filter(p => !trTeams.some(tt => tt.id === p.teamId));
    
    window.leagueData.teams.push(...trTeams);
    window.leagueData.players.push(...trPlayers);
}
`;

fs.writeFileSync('js/data_superlig.js', js_content, 'utf-8');
console.log('Super Lig 19 teams 24-man real-like rosters created!');

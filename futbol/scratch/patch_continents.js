const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'data_world_ranking.js');
let content = fs.readFileSync(filePath, 'latin1');

const continentsMap = {
    "İngiltere": "Avrupa", "İspanya": "Avrupa", "İtalya": "Avrupa", "Almanya": "Avrupa", "Fransa": "Avrupa",
    "Portekiz": "Avrupa", "Hollanda": "Avrupa", "Belçika": "Avrupa", "İskoçya": "Avrupa", "Avusturya": "Avrupa",
    "Sırbistan": "Avrupa", "İsviçre": "Avrupa", "Türkiye": "Avrupa", "Ukrayna": "Avrupa", "Çekya": "Avrupa",
    "Yunanistan": "Avrupa", "Hırvatistan": "Avrupa", "Danimarka": "Avrupa", "İsveç": "Avrupa", "Polonya": "Avrupa",
    "Norveç": "Avrupa", "Macaristan": "Avrupa", "Romanya": "Avrupa", "Kıbrıs": "Avrupa", "Slovakya": "Avrupa",
    "Bulgaristan": "Avrupa", "Slovenya": "Avrupa", "Rusya": "Avrupa", "Faroe Adaları": "Avrupa", "İzlanda": "Avrupa",
    "Galler": "Avrupa", "Kuzey İrlanda": "Avrupa", "İrlanda": "Avrupa", "San Marino": "Avrupa", "Andorra": "Avrupa",
    "Bosna Hersek": "Avrupa", "Makedonya": "Avrupa", "Karadağ": "Avrupa", "Kosova": "Avrupa", "Arnavutluk": "Avrupa",
    "Estonya": "Avrupa", "Letonya": "Avrupa", "Litvanya": "Avrupa", "Finlandiya": "Avrupa", "Belarus": "Avrupa",
    
    "Arjantin": "Güney Amerika", "Brezilya": "Güney Amerika", "Uruguay": "Güney Amerika", "Kolombiya": "Güney Amerika",
    "Şili": "Güney Amerika", "Ekvador": "Güney Amerika", "Peru": "Güney Amerika", "Paraguay": "Güney Amerika",
    "Bolivya": "Güney Amerika", "Venezuela": "Güney Amerika",
    
    "ABD (MLS)": "Kuzey Amerika", "Meksika": "Kuzey Amerika", "Kanada": "Kuzey Amerika", "Kosta Rika": "Kuzey Amerika",
    "Honduras": "Kuzey Amerika", "Jamaika": "Kuzey Amerika", "Panama": "Kuzey Amerika", "El Salvador": "Kuzey Amerika",
    
    "Suudi Arabistan": "Asya", "Japonya": "Asya", "Güney Kore": "Asya", "İran": "Asya", "Katar": "Asya",
    "Birleşik Arap Emirlikleri": "Asya", "Avustralya": "Asya", "Özbekistan": "Asya", "Irak": "Asya", "Çin": "Asya",
    "Suriye": "Asya", "Umman": "Asya", "Bahreyn": "Asya", "Ürdün": "Asya", "Lübnan": "Asya", "Filistin": "Asya",
    "Kuveyt": "Asya", "Vietnam": "Asya", "Tayland": "Asya", "Kuzey Kore": "Asya", "Hindistan": "Asya",
    "Endonezya": "Asya", "Malezya": "Asya", "Singapur": "Asya", "Kamboçya": "Asya", "Filipinler": "Asya",
    "Tayvan": "Asya", "Hong Kong": "Asya", "Tacikistan": "Asya", "Kırgızistan": "Asya", "Türkmenistan": "Asya",
    
    "Fas": "Afrika", "Senegal": "Afrika", "Cezayir": "Afrika", "Mısır": "Afrika", "Nijerya": "Afrika",
    "Kamerun": "Afrika", "Mali": "Afrika", "Fildişi Sahili": "Afrika", "Gana": "Afrika", "Burkina Faso": "Afrika",
    "Güney Afrika": "Afrika", "Kongo DC": "Afrika", "Gine": "Afrika", "Yeşil Burun Adaları": "Afrika",
    "Zambiya": "Afrika", "Uganda": "Afrika", "Benin": "Afrika", "Angola": "Afrika", "Kenya": "Afrika",
    "Madagaskar": "Afrika", "Zimbabve": "Afrika", "Togo": "Afrika", "Ruanda": "Afrika", "Tanzanya": "Afrika",
    "Burundi": "Afrika", "Etiyopya": "Afrika", "Sudan": "Afrika",
    
    "Yeni Zelanda": "Okyanusya", "Tahiti": "Okyanusya", "Fiji": "Okyanusya", "Vanuatu": "Okyanusya",
    "Papua Yeni Gine": "Okyanusya", "Solomon Adaları": "Okyanusya"
};

let count = 0;

// Re-split and map
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"country":')) {
        let match = lines[i].match(/"country":\s*"(.*?)"/);
        if (match && match[1]) {
            let country = match[1];
            let continent = continentsMap[country] || "Dünya";
            
            // Check if continent already exists
            if (!lines[i].includes('"continent":')) {
                lines[i] = lines[i] + `,\n        "continent": "${continent}"`;
                count++;
            }
        }
    }
}

content = lines.join('\n');
fs.writeFileSync(filePath, content, 'latin1');
console.log(`Continents added to ${count} teams in data_world_ranking.js.`);

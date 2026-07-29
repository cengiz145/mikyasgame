const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '..', 'js');
const files = fs.readdirSync(jsDir).filter(f => f.startsWith('data') && f.endsWith('.js'));

const cities = {
    turkey: ["İstanbul", "Ankara", "İzmir", "Trabzon", "Bursa", "Antalya", "Adana", "Konya", "Kayseri", "Samsun", "Eskişehir", "Gaziantep", "Kocaeli", "Diyarbakır", "Erzurum"],
    england: ["London", "Manchester", "Liverpool", "Birmingham", "Leeds", "Newcastle", "Sheffield", "Bristol", "Nottingham", "Leicester"],
    spain: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga", "Murcia", "Palma", "Bilbao", "Alicante"],
    italy: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania"],
    france: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
    germany: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
    portugal: ["Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Coimbra", "Funchal", "Setúbal"],
    netherlands: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen"],
    brazil: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba"],
    global: ["Buenos Aires", "Tokyo", "Cairo", "Lagos", "Mexico City", "Bogota", "Seoul", "Sydney", "Riyadh", "Dakar", "Montevideo", "Santiago"]
};

const getCity = (country) => {
    const list = cities[country] || cities.global;
    return list[Math.floor(Math.random() * list.length)];
};

let totalUpdated = 0;

for (const file of files) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'latin1');
    
    let defaultCountry = 'global';
    let countryName = "Dünya";
    
    if (file.includes('superlig') || file.includes('tff1') || file.includes('tff2') || file.includes('bal') || file === 'data.js' || file === 'data_1000.js' || file === 'data_10000.js' || file === 'data_1000_v2.js') {
        defaultCountry = 'turkey'; countryName = "Türkiye";
    } else if (file.includes('premier') || file.includes('england')) {
        defaultCountry = 'england'; countryName = "İngiltere";
    } else if (file.includes('laliga')) {
        defaultCountry = 'spain'; countryName = "İspanya";
    } else if (file.includes('seriea')) {
        defaultCountry = 'italy'; countryName = "İtalya";
    } else if (file.includes('ligue1')) {
        defaultCountry = 'france'; countryName = "Fransa";
    } else if (file.includes('bundesliga')) {
        defaultCountry = 'germany'; countryName = "Almanya";
    } else if (file.includes('portekiz')) {
        defaultCountry = 'portugal'; countryName = "Portekiz";
    } else if (file.includes('eredivisie')) {
        defaultCountry = 'netherlands'; countryName = "Hollanda";
    } else if (file.includes('brazil')) {
        defaultCountry = 'brazil'; countryName = "Brezilya";
    }

    let fileUpdated = 0;
    
    // We match objects that have "teamId"
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('teamId:') || lines[i].includes('"teamId":')) {
            // Make sure it doesn't already have birthplace
            if (!lines[i].includes('birthplace:')) {
                // Find a good place to insert, right after position or age or name
                const randomCity = getCity(defaultCountry);
                const birthplaceStr = `${randomCity}, ${countryName}`;
                
                // Add before teamId
                lines[i] = lines[i].replace(/(teamId:|"teamId":)/, `birthplace: "${birthplaceStr}", $1`);
                fileUpdated++;
                totalUpdated++;
            }
        }
    }

    if (fileUpdated > 0) {
        fs.writeFileSync(filePath, lines.join('\n'), 'latin1');
        console.log(`Added birthplaces to ${fileUpdated} players in ${file}`);
    }
}

console.log(`Total players updated with birthplace: ${totalUpdated}`);

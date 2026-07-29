const fs = require('fs');

const dataFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\data.js';
if (fs.existsSync(dataFile)) {
    let content = fs.readFileSync(dataFile, 'utf8');
    
    // Mapping team IDs to their cities
    const cityMap = {
        // Turkey Super Lig
        "trabzonspor": "Trabzon",
        "alanyaspor": "Antalya",
        "konyaspor": "Konya",
        "rizespor": "Rize",
        "gaziantep": "Gaziantep",
        "samsunspor": "Samsun",
        "goztepe": "Izmir",
        
        // Turkey TFF 1
        "kocaelispor": "Kocaeli",
        "erzurumspor": "Erzurum",
        "amed": "Diyarbakir",
        "corum": "Corum",
        
        // Europe Champions & Europa
        "barcelona": "Barcelona",
        "psg": "Paris",
        "liverpool": "Liverpool",
        "man_united": "Manchester",
        "inter": "Milan",
        "ac_milan": "Milan",
        "juventus": "Turin",
        "bayer_leverkusen": "Leverkusen",
        "dortmund": "Dortmund",
        "tottenham": "London",
        "roma": "Rome",
        "lazio": "Rome",
        "benfica": "Lisbon",
        "porto": "Porto",
        "sporting_cp": "Lisbon",
        "ajax": "Amsterdam",
        "feyenoord": "Rotterdam",
        "psv": "Eindhoven",
        "club_brugge": "Bruges",
        "anderlecht": "Brussels",
        "galatasaray": "Istanbul",
        "fenerbahce": "Istanbul",
        "besiktas": "Istanbul",
        "basaksehir": "Istanbul",
        "kasimpasa": "Istanbul",
        "eyupspor": "Istanbul",
        "genclerbirligi": "Ankara"
    };
    
    for (const [id, city] of Object.entries(cityMap)) {
        // Find line with { id: "id"
        // Replace it by adding city: "City" if it's not already there.
        const regex = new RegExp(`(\\{ id: "${id}",[^\\}]*)( \\})`, 'g');
        content = content.replace(regex, (match, p1, p2) => {
            if (!match.includes('city:')) {
                return `${p1}, city: "${city}"${p2}`;
            }
            return match;
        });
    }
    
    fs.writeFileSync(dataFile, content, 'utf8');
    console.log("data.js - Şehirler güncellendi.");
} else {
    console.log("data.js bulunamadı!");
}

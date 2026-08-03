const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '..', 'js');
const files = fs.readdirSync(jsDir).filter(f => f.startsWith('data') && f.endsWith('.js'));

const realNationalities = {
    "Enzo Fernández": "Buenos Aires, Arjantin",
    "Rayan Cherki": "Lyon, Fransa",
    "Morgan Rogers": "Halesowen, İngiltere",
    "Federico Valverde": "Montevideo, Uruguay",
    "Lautaro Martínez": "Bahía Blanca, Arjantin",
    "Alexander Isak": "Solna, İsveç",
    "Estêvão": "Franca, Brezilya",
    "Pau Cubarsí": "Girona, İspanya",
    "Nico Paz": "Tenerife, İspanya", // Arg/Esp
    "Warren Zaïre-Emery": "Montreuil, Fransa",
    "Hugo Ekitiké": "Reims, Fransa",
    "Willian Pacho": "Quinindé, Ekvador",
    "João Pedro": "Ribeirão Preto, Brezilya",
    "Nuno Mendes": "Sintra, Portekiz",
    "Antoine Semenyo": "Londra, İngiltere", // Gana
    "Ryan Gravenberch": "Amsterdam, Hollanda",
    "Achraf Hakimi": "Madrid, İspanya", // Fas
    "Sandro Tonali": "Lodi, İtalya",
    "Kenan Yıldız": "Regensburg, Almanya", // Türkiye
    "Benjamin Sesko": "Radeče, Slovenya",
    "Elliot Anderson": "Whitley Bay, İngiltere",
    "Matheus Cunha": "João Pessoa, Brezilya",
    "Jérémy Doku": "Antwerp, Belçika",
    "Gabriel": "São Paulo, Brezilya",
    "Martín Zubimendi": "San Sebastián, İspanya",
    "Lamine Yamal": "Esplugues de Llobregat, İspanya",
    "Erling Haaland": "Leeds, İngiltere", // Norveç
    "Kylian Mbappé": "Paris, Fransa",
    "Jude Bellingham": "Stourbridge, İngiltere",
    "Vinicius Junior": "São Gonçalo, Brezilya",
    "Phil Foden": "Stockport, İngiltere",
    "Bukayo Saka": "Londra, İngiltere",
    "Jamal Musiala": "Stuttgart, Almanya",
    "Florian Wirtz": "Pulheim, Almanya",
    "Declan Rice": "Londra, İngiltere",
    "Rodri": "Madrid, İspanya",
    "Harry Kane": "Londra, İngiltere",
    "Kevin De Bruyne": "Drongen, Belçika",
    "Victor Osimhen": "Lagos, Nijerya",
    "Rafael Leão": "Almada, Portekiz",
    "Martin Odegaard": "Drammen, Norveç",
    "Gavi": "Los Palacios y Villafranca, İspanya",
    "Pedri": "Tegueste, İspanya",
    "Ousmane Dembélé": "Vernon, Fransa",
    "William Saliba": "Bondy, Fransa",
    "Cole Palmer": "Manchester, İngiltere",
    "Julián Alvarez": "Calchín, Arjantin",
    "Arda Güler": "Ankara, Türkiye",
    "Aleksandar Pavlovic": "Münih, Almanya"
};

let totalFixed = 0;

for (const file of files) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'latin1');
    let lines = content.split('\n');
    let fileUpdated = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('birthplace:')) {
            // Check if it's a known real player
            let matchedReal = false;
            for (let name in realNationalities) {
                // To avoid latin1 encoding issues with names, we can strip accents for comparison
                // or just do a simple include check. Since names in file might be garbled, we check partials.
                let simpleName = name.replace(/[^\w\s]/gi, ''); // remove accents
                // Let's just check if line includes name
                // Actually since names are garbled (e.g., Enzo FernÃ¡ndez), let's extract the name from the line
                let nameMatch = lines[i].match(/"name"\s*:\s*"([^"]+)"/);
                if (!nameMatch) nameMatch = lines[i].match(/name\s*:\s*"([^"]+)"/);
                
                if (nameMatch) {
                    let playerName = nameMatch[1];
                    // Compare simple versions
                    let p1 = playerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toLowerCase();
                    let p2 = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toLowerCase();
                    
                    if (p1 === p2 || p1.includes(p2) || p2.includes(p1)) {
                        // We found a match!
                        lines[i] = lines[i].replace(/birthplace:\s*"[^"]+"/, `birthplace: "${realNationalities[name]}"`);
                        matchedReal = true;
                        totalFixed++;
                        fileUpdated = true;
                        break;
                    }
                }
            }
            
            // If it's not a known world star, but it says "Dünya", let's fix it based on the league
            if (!matchedReal && lines[i].includes('Dünya')) {
                // If it's data_premier, they get England, etc.
                let defaultCountry = "İngiltere";
                if (file.includes('laliga')) defaultCountry = "İspanya";
                else if (file.includes('seriea')) defaultCountry = "İtalya";
                else if (file.includes('ligue1')) defaultCountry = "Fransa";
                else if (file.includes('bundesliga')) defaultCountry = "Almanya";
                else if (file.includes('brazil')) defaultCountry = "Brezilya";
                else if (file.includes('superlig') || file.includes('tff')) defaultCountry = "Türkiye";
                else if (file.includes('world_stars')) {
                    // For remaining unknown world stars, give them random global capitals
                    const globals = ["Roma, İtalya", "Lizbon, Portekiz", "Zagreb, Hırvatistan", "Brüksel, Belçika", "Kopenhag, Danimarka", "Prag, Çekya"];
                    defaultCountry = globals[Math.floor(Math.random() * globals.length)];
                }

                if (file.includes('world_stars')) {
                    lines[i] = lines[i].replace(/birthplace:\s*"[^"]*Dünya"/, `birthplace: "${defaultCountry}"`);
                } else {
                    lines[i] = lines[i].replace(/Dünya/g, defaultCountry);
                }
                fileUpdated = true;
                totalFixed++;
            }
        }
    }

    if (fileUpdated) {
        fs.writeFileSync(filePath, lines.join('\n'), 'latin1');
    }
}

console.log(`Nationalities fixed for ${totalFixed} players.`);

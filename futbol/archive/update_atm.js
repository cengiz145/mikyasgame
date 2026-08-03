const fs = require('fs');

const data = `
13
Jan Oblak
Jan Oblak
Kaleci
7 Oca 1993 (33)
Slovenya
15.00 mil. €
1
Atalanta BergamoAtalanta Bergamo'dan yeni transfer; Tarih: 10 Haz 2025; Bonservis: 3.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Juan Musso
Juan Musso
Kaleci
6 May 1994 (32)
Arjantin
İtalya
3.00 mil. €
17 
FeyenoordFeyenoord'dan yeni transfer; Tarih: 24 Tem 2025; Bonservis: 26.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Dávid Hancko
Dávid Hancko
Stoper
13 Ara 1997 (28)
Slovakya
35.00 mil. €
18 
UD AlmeríaUD Almería'dan yeni transfer; Tarih: 23 Tem 2025; Bonservis: 16.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Marc Pubill
Marc Pubill
Stoper
20 Haz 2003 (23)
İspanya
35.00 mil. €
24 
Robin Le Normand
Robin Le Normand
Stoper
 
11 Kas 1996 (29)
İspanya
Fransa
20.00 mil. €
2 
José María Giménez
José María Giménez
Stoper
 
20 Oca 1995 (31)
Uruguay
İspanya
9.00 mil. €
15 
FC BarcelonaFC Barcelona'dan yeni transfer; Tarih: 9 Haz 2025; Bonservis: Bedelsiz. Sol ok simgesi, Geri anlamına gelebilir
Clément Lenglet
Clément Lenglet
Stoper
17 Haz 1995 (31)
Fransa
4.00 mil. €
3 
Atalanta BergamoAtalanta Bergamo'dan yeni transfer; Tarih: 1 Tem 2025; Bonservis: 17.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Matteo Ruggeri
Matteo Ruggeri
Sol Bek
11 Tem 2002 (23)
İtalya
28.00 mil. €
14 
Marcos Llorente
Marcos Llorente
Sağ Bek
 
30 Oca 1995 (31)
İspanya
20.00 mil. €
16 
Nahuel Molina
Nahuel Molina
Sağ Bek
 
6 Nis 1998 (28)
Arjantin
15.00 mil. €
8 
Pablo Barrios
Pablo Barrios
Merkez Orta Saha
 
15 Haz 2003 (23)
İspanya
55.00 mil. €
4 
Elche CFOcak ayında geldiği takım: Elche CF; tarih: 2 Şub 2026; ücret: 16.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Rodrigo Mendoza
Rodrigo Mendoza
Merkez Orta Saha
15 Mar 2005 (21)
İspanya
20.00 mil. €
5 
Real BetisReal Betis'dan yeni transfer; Tarih: 16 Tem 2025; Bonservis: 24.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Johnny Cardoso
Johnny Cardoso 
Merkez Orta Saha
20 Eyl 2001 (24)
Amerika Birleşik Devletleri
İtalya
20.00 mil. €
21 
Seattle Sounders FCOcak ayında geldiği takım: Seattle Sounders FC; tarih: 2 Şub 2026; ücret: 3.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Obed Vargas
Obed Vargas
Merkez Orta Saha
5 Ağu 2005 (20)
Meksika
İspanya
10.00 mil. €
6 
Koke
Koke 
Merkez Orta Saha
 
8 Oca 1992 (34)
İspanya
5.00 mil. €
10 
Villarreal CFVillarreal CF'dan yeni transfer; Tarih: 2 Tem 2025; Bonservis: 42.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Álex Baena
Álex Baena
Sol Kanat
20 Tem 2001 (24)
İspanya
40.00 mil. €
22 
Atalanta BergamoOcak ayında geldiği takım: Atalanta Bergamo; tarih: 2 Şub 2026; ücret: 35.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Ademola Lookman
Ademola Lookman
Sol Kanat
20 Eki 1997 (28)
Nijerya
İngiltere
40.00 mil. €
23 
JuventusKiralandığı takım: Juventus; dönüş tarihi: 30 Haz 2026. Açıklama yok.
Nico González
Nico González
Sol Kanat
6 Nis 1998 (28)
Arjantin
İtalya
22.00 mil. €
11 
Botafogo FRBotafogo FR'dan yeni transfer; Tarih: 17 Tem 2025; Bonservis: 21.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Thiago Almada
Thiago Almada
Sol Kanat
26 Nis 2001 (25)
Arjantin
İtalya
15.00 mil. €
20 
Giuliano Simeone
Giuliano Simeone
Sağ Kanat
 
18 Ara 2002 (23)
Arjantin
İtalya
40.00 mil. €
7 
Orlando CityBu takıma transfer olacak:Orlando City; Tarih:10 Tem 2026;Bonservis:Bedelsiz. Sağ ok simgesi, İleri anlamına gelebilir
Antoine Griezmann
Antoine Griezmann
Forvet Arkası
21 Mar 1991 (35)
Fransa
8.00 mil. €
19 
Julián Alvarez
Julián Alvarez
Santrafor
 
31 Oca 2000 (26)
Arjantin
İtalya
100.00 mil. €
9 
Alexander Sørloth
Alexander Sørloth
Santrafor
 
5 Ara 1995 (30)
Norveç
18.00 mil. €
`;

const lines = data.split('\n').map(l => l.trim());

const players = [];
let currentName = "";
let currentPos = "";
let currentAge = 25;
let currentVal = 1;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (/^\d+\s*$/.test(line) || line === '-') continue;

    let posLower = line.toLowerCase();
    let isPos = posLower.includes("kaleci") || posLower.includes("stoper") || posLower.includes("bek") || posLower.includes("libero") || posLower.includes("orta saha") || posLower.includes("numara") || posLower.includes("kanat") || posLower.includes("santrafor") || posLower.includes("forvet arkası") || posLower.includes("forvet");

    if (isPos) {
        currentPos = line;
        let nameCandidate = lines[i-1];
        if (nameCandidate === '') nameCandidate = lines[i-2];
        currentName = nameCandidate.replace(/ {2,}/g, '').trim();

        let j = i + 1;
        while (j < lines.length && !lines[j].includes('(')) j++;
        if (j < lines.length) {
            let match = lines[j].match(/\((\d+)\)/);
            if (match) currentAge = parseInt(match[1]);
            
            let k = j + 1;
            while (k < lines.length && !lines[k].includes('€') && lines[k] !== '-') k++;
            if (k < lines.length) {
                let valStr = lines[k];
                if (valStr.includes('mil. €')) {
                    let vMatch = valStr.match(/([\d\.]+)/);
                    if (vMatch) currentVal = Math.round(parseFloat(vMatch[1]) / 3.5);
                } else {
                    currentVal = 1;
                }
            }
            
            let role = "box_to_box";
            if (posLower.includes("kaleci")) role = "sweeper_keeper";
            else if (posLower.includes("stoper")) role = "stopper";
            else if (posLower.includes("bek")) role = "wing_back";
            else if (posLower.includes("kanat")) role = "winger";
            else if (posLower.includes("santrafor") || posLower.includes("forvet")) role = "poacher";
            else if (posLower.includes("numara") || posLower.includes("arkası")) role = "playmaker";
            
            let trait = "elite";
            if (currentVal < 3) trait = "fragile";
            else if (currentVal < 7) trait = "classic";
            
            players.push({
                id: currentName.toLowerCase().replace(/[^a-z]/g, '') + "_atletico_madrid",
                name: currentName.replace("  ", "").trim(),
                position: currentPos,
                age: currentAge,
                power: Math.min(99, 60 + currentVal*1.5),
                speed: parseFloat((3.5 + Math.random()*1.5).toFixed(1)),
                mentalTrait: trait,
                tacticalRole: role,
                price: Math.max(1, currentVal),
                teamId: "atletico_madrid"
            });
            i = k;
        }
    }
}

const uniquePlayers = [];
const seenNames = new Set();
for (let p of players) {
    if (!seenNames.has(p.name)) {
        seenNames.add(p.name);
        uniquePlayers.push(p);
    }
}

let jsPath = 'js/data_laliga.js';
let jsContent = fs.readFileSync(jsPath, 'utf8');

let hasBOM = jsContent.charCodeAt(0) === 0xFEFF;
if (hasBOM) jsContent = jsContent.substring(1);

let startIndex = jsContent.indexOf('const laligaPlayers = [');
if (startIndex !== -1) {
    let arrayStart = jsContent.indexOf('[', startIndex);
    let arrayEnd = jsContent.lastIndexOf(']', jsContent.indexOf('window.leagueData.players.push'));
    
    let playersStr = jsContent.substring(arrayStart, arrayEnd + 1);
    
    try {
        let allPlayers = eval(playersStr);
        allPlayers = allPlayers.filter(p => p.teamId !== 'atletico_madrid');
        allPlayers = allPlayers.concat(uniquePlayers);
        
        let newPlayersStr = JSON.stringify(allPlayers, null, 4);
        
        jsContent = jsContent.substring(0, arrayStart) + newPlayersStr + jsContent.substring(arrayEnd + 1);
        fs.writeFileSync(jsPath, (hasBOM ? '\uFEFF' : '') + jsContent, 'utf8');
        console.log("Atletico Madrid updated with " + uniquePlayers.length + " players.");
    } catch(e) {
        console.error("Eval error", e);
    }
} else {
    console.log("Could not find laligaPlayers array.");
}

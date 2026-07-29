const fs = require('fs');

const data = `
13 
Espanyol BarcelonaEspanyol Barcelona'dan yeni transfer; Tarih: 1 Tem 2025; Bonservis: 25.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Joan García
Joan García
Kaleci
4 May 2001 (25)
İspanya
45.00 mil. €
31 
Diego Kochen
Diego Kochen
Kaleci
 
19 Mar 2006 (20)
Amerika Birleşik Devletleri
Peru
1.50 mil. €  
25 
Wojciech Szczesny
Wojciech Szczesny
Kaleci
 
18 Nis 1990 (36)
Polonya
800 bin €
5 
Pau Cubarsí
Pau Cubarsí
Stoper
 
22 Oca 2007 (19)
İspanya
80.00 mil. €
24 
Eric García
Eric García
Stoper
 
9 Oca 2001 (25)
İspanya
40.00 mil. €
18 
Gerard Martín
Gerard Martín
Stoper
 
26 Şub 2002 (24)
İspanya
35.00 mil. €
4 
Ronald Araujo
Ronald Araujo  
Stoper
 
7 Mar 1999 (27)
Uruguay
İspanya
20.00 mil. €
15 
Andreas Christensen
Andreas Christensen
Stoper
 
10 Nis 1996 (30)
Danimarka
8.00 mil. €
3 
Alejandro Balde
Alejandro Balde
Sol Bek
 
18 Eki 2003 (22)
İspanya
50.00 mil. €
23 
Jules Koundé
Jules Koundé
Sağ Bek
 
12 Kas 1998 (27)
Fransa
Benin
60.00 mil. €
2 
Al-Hilal SFCKiralandığı takım: Al-Hilal SFC; dönüş tarihi: 30 Haz 2026. Açıklama yok.
João Cancelo
João Cancelo
Sağ Bek
27 May 1994 (32)
Portekiz
8.00 mil. €
22 
Marc Bernal
Marc Bernal
Ön Libero
 
26 May 2007 (19)
İspanya
30.00 mil. €
17 
Marc Casadó
Marc Casadó
Ön Libero
 
14 Eyl 2003 (22)
İspanya
18.00 mil. €
8 
Pedri
Pedri
Merkez Orta Saha
 
25 Kas 2002 (23)
İspanya
150.00 mil. €
21 
Frenkie de Jong
Frenkie de Jong
Merkez Orta Saha
 
12 May 1997 (29)
Hollanda
35.00 mil. €
6 
Gavi
Gavi
Merkez Orta Saha
 
5 Ağu 2004 (21)
İspanya
30.00 mil. €
16 
Fermín López
Fermín López 
On Numara
 
11 May 2003 (23)
İspanya
100.00 mil. €
20 
Dani Olmo
Dani Olmo
On Numara
 
7 May 1998 (28)
İspanya
60.00 mil. €
11 
Raphinha
Raphinha 
Sol Kanat
 
14 Ara 1996 (29)
Brezilya
İtalya
70.00 mil. €
14 
Manchester UnitedKiralandığı takım: Manchester United; dönüş tarihi: 30 Haz 2026. Açıklama yok.
Marcus Rashford
Marcus Rashford
Sol Kanat
31 Eki 1997 (28)
İngiltere
St.Kitts ve Nevis
40.00 mil. €
10 
Lamine Yamal
Lamine Yamal
Sağ Kanat
 
13 Tem 2007 (18)
İspanya
200.00 mil. €
19 
FC KopenhagFC Kopenhag'dan yeni transfer; Tarih: 14 Tem 2025; Bonservis: 2.50 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Roony Bardghji
Roony Bardghji
Sağ Kanat
15 Kas 2005 (20)
İsveç
Suriye
15.00 mil. €
7 
Ferran Torres
Ferran Torres
Santrafor
 
29 Şub 2000 (26)
İspanya
50.00 mil. €
9 
KulüpsüzBu takıma transfer olacak:Kulüpsüz; Tarih:1 Tem 2026;Bonservis:-. Sağ ok simgesi, İleri anlamına gelebilir
Robert Lewandowski
Robert Lewandowski
Santrafor
21 Ağu 1988 (37)
Polonya
7.00 mil. €
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
    let isPos = posLower.includes("kaleci") || posLower.includes("stoper") || posLower.includes("bek") || posLower.includes("libero") || posLower.includes("orta saha") || posLower.includes("numara") || posLower.includes("kanat") || posLower.includes("santrafor");

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
                    currentVal = 1; // Default for bin €
                }
            }
            
            let role = "box_to_box";
            if (posLower.includes("kaleci")) role = "sweeper_keeper";
            else if (posLower.includes("stoper")) role = "stopper";
            else if (posLower.includes("bek")) role = "wing_back";
            else if (posLower.includes("kanat")) role = "winger";
            else if (posLower.includes("santrafor")) role = "poacher";
            else if (posLower.includes("numara")) role = "playmaker";
            
            let trait = "elite";
            if (currentVal < 3) trait = "fragile";
            else if (currentVal < 7) trait = "classic";
            
            players.push({
                id: currentName.toLowerCase().replace(/[^a-z]/g, '') + "_barcelona",
                name: currentName.replace("  ", "").trim(),
                position: currentPos,
                age: currentAge,
                power: Math.min(99, 60 + currentVal*1.5), // For laliga 1.5 multiplier
                speed: parseFloat((3.5 + Math.random()*1.5).toFixed(1)),
                mentalTrait: trait,
                tacticalRole: role,
                price: Math.max(1, currentVal),
                teamId: "barcelona"
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
        allPlayers = allPlayers.filter(p => p.teamId !== 'barcelona');
        allPlayers = allPlayers.concat(uniquePlayers);
        
        let newPlayersStr = JSON.stringify(allPlayers, null, 4);
        
        jsContent = jsContent.substring(0, arrayStart) + newPlayersStr + jsContent.substring(arrayEnd + 1);
        fs.writeFileSync(jsPath, (hasBOM ? '\uFEFF' : '') + jsContent, 'utf8');
        console.log("Barcelona updated with " + uniquePlayers.length + " players.");
    } catch(e) {
        console.error("Eval error", e);
    }
} else {
    console.log("Could not find laligaPlayers array.");
}

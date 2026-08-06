const fs = require('fs');

const data = `
1
Thibaut Courtois
Thibaut Courtois
Kaleci
11 May 1992 (34)
Belçika
15.00 mil. €
13
Andriy Lunin
Andriy Lunin
Kaleci
11 Şub 1999 (27)
Ukrayna
12.00 mil. €
26
Fran González
Fran González
Kaleci
24 Haz 2005 (21)
İspanya
3.00 mil. €  
24
AFC BournemouthAFC Bournemouth'dan yeni transfer; Tarih: 1 Haz 2025; Bonservis: 62.50 mil. €. Açıklama alınıyor…
Dean Huijsen
Dean Huijsen
Stoper
14 Nis 2005 (21)
İspanya
Hollanda
60.00 mil. €
3
Éder Militão
Éder Militão 
Stoper
18 Oca 1998 (28)
Brezilya
İspanya
20.00 mil. €
17
Raúl Asencio
Raúl Asencio
Stoper
13 Şub 2003 (23)
İspanya
20.00 mil. €
22
Antonio Rüdiger
Antonio Rüdiger
Stoper
3 Mar 1993 (33)
Almanya
Sierra Leone
6.00 mil. €
4
KulüpsüzBu takıma transfer olacak:Kulüpsüz; Tarih:1 Tem 2026;Bonservis:-. Açıklama alınıyor…
David Alaba
David Alaba
Stoper
24 Haz 1992 (34)
Avusturya
3.00 mil. €
18
SL BenficaSL Benfica'dan yeni transfer; Tarih: 14 Tem 2025; Bonservis: 50.00 mil. €. Açıklama alınıyor…
Álvaro Carreras
Álvaro Carreras
Sol Bek
23 Mar 2003 (23)
İspanya
50.00 mil. €
20
Fran García
Fran García
Sol Bek
14 Ağu 1999 (26)
İspanya
10.00 mil. €
23
Ferland Mendy
Ferland Mendy 
Sol Bek
8 Haz 1995 (31)
Fransa
Senegal
4.00 mil. €
12
Liverpool FCLiverpool FC'dan yeni transfer; Tarih: 1 Haz 2025; Bonservis: 10.00 mil. €. Açıklama alınıyor…
Trent Alexander-Arnold
Trent Alexander-Arnold
Sağ Bek
7 Eki 1998 (27)
İngiltere
60.00 mil. €
2
KulüpsüzBu takıma transfer olacak:Kulüpsüz; Tarih:1 Tem 2026;Bonservis:-. Açıklama alınıyor…
Daniel Carvajal
Daniel Carvajal 
Sağ Bek
11 Oca 1992 (34)
İspanya
4.00 mil. €
14
Aurélien Tchouaméni
Aurélien Tchouaméni
Ön Libero
27 Oca 2000 (26)
Fransa
Kamerun
70.00 mil. €
8
Federico Valverde
Federico Valverde
Merkez Orta Saha
22 Tem 1998 (27)
Uruguay
İspanya
90.00 mil. €
6
Eduardo Camavinga
Eduardo Camavinga
Merkez Orta Saha
10 Kas 2002 (23)
Fransa
Kongo
50.00 mil. €
45
Real Madrid Castillaİç transfer: Real Madrid Castilla; tarih: 1 Mar 2026. Açıklama alınıyor…
Thiago Pitarch
Thiago Pitarch
Merkez Orta Saha
3 Ağu 2007 (18)
İspanya
Fas
20.00 mil. €
28
Jorge Cestero
Jorge Cestero
Merkez Orta Saha
24 Mar 2006 (20)
İspanya
7.50 mil. €
19
KulüpsüzBu takıma transfer olacak:Kulüpsüz; Tarih:1 Tem 2026;Bonservis:-. Açıklama alınıyor…
Dani Ceballos
Dani Ceballos
Merkez Orta Saha
7 Ağu 1996 (29)
İspanya
7.00 mil. €
37
Manuel Ángel
Manuel Ángel
Merkez Orta Saha
15 Mar 2004 (22)
İspanya
5.00 mil. €
5
Jude Bellingham
Jude Bellingham
On Numara
29 Haz 2003 (22)
İngiltere
İrlanda
130.00 mil. €
15
Arda Güler
Arda Güler
On Numara
25 Şub 2005 (21)
Türkiye
90.00 mil. €
38
César Palacios
César Palacios
On Numara
11 Kas 2004 (21)
İspanya
7.50 mil. €
7
Vinicius Junior
Vinicius Junior
Sol Kanat
12 Tem 2000 (25)
Brezilya
İspanya
140.00 mil. €
11
Rodrygo
Rodrygo 
Sağ Kanat
9 Oca 2001 (25)
Brezilya
İspanya
45.00 mil. €
30
CA River PlateCA River Plate'dan yeni transfer; Tarih: 14 Ağu 2025; Bonservis: 45.00 mil. €. Açıklama alınıyor…
Franco Mastantuono
Franco Mastantuono
Sağ Kanat
14 Ağu 2007 (18)
Arjantin
İtalya
45.00 mil. €
21
Brahim Díaz
Brahim Díaz
Sağ Kanat
3 Ağu 1999 (26)
Fas
İspanya
35.00 mil. €
10
Kylian Mbappé
Kylian Mbappé
Santrafor
20 Ara 1998 (27)
Fransa
Kamerun
180.00 mil. €
16
Real Madrid Castillaİç transfer: Real Madrid Castilla; tarih: 1 Haz 2025. Açıklama alınıyor…
Gonzalo García
Gonzalo García
Santrafor
24 Mar 2004 (22)
İspanya
30.00 mil. €
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
                } else if (valStr.includes('milyar €')) {
                     currentVal = 200; // Unlikely for a single player but just in case
                } else {
                    currentVal = 1;
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
                id: currentName.toLowerCase().replace(/[^a-z]/g, '') + "_real_madrid",
                name: currentName.replace("  ", "").trim(),
                position: currentPos,
                age: currentAge,
                power: Math.min(99, 60 + currentVal*1.5),
                speed: parseFloat((3.5 + Math.random()*1.5).toFixed(1)),
                mentalTrait: trait,
                tacticalRole: role,
                price: Math.max(1, currentVal),
                teamId: "real_madrid"
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
        allPlayers = allPlayers.filter(p => p.teamId !== 'real_madrid');
        allPlayers = allPlayers.concat(uniquePlayers);
        
        let newPlayersStr = JSON.stringify(allPlayers, null, 4);
        
        jsContent = jsContent.substring(0, arrayStart) + newPlayersStr + jsContent.substring(arrayEnd + 1);
        fs.writeFileSync(jsPath, (hasBOM ? '\uFEFF' : '') + jsContent, 'utf8');
        console.log("Real Madrid updated with " + uniquePlayers.length + " players.");
    } catch(e) {
        console.error("Eval error", e);
    }
} else {
    console.log("Could not find laligaPlayers array.");
}

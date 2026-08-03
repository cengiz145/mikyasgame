const fs = require('fs');

const data = `
1 
TrabzonsporTrabzonspor'dan yeni transfer; Tarih: 1 Eyl 2025; Bonservis: 27.50 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Uğurcan Çakır
Uğurcan Çakır
Kaleci
5 Nis 1996 (30)
Türkiye
15.00 mil. €
12 
Fatih KaragümrükBu takıma transfer olacak:Fatih Karagümrük; Tarih:1 Tem 2026;Bonservis:Bedelsiz. Sağ ok simgesi, İleri anlamına gelebilir
Batuhan Şen
Batuhan Şen
Kaleci
3 Şub 1999 (27)
Türkiye
200 bin €
19 
Günay Güvenç
Günay Güvenç
Kaleci
 
25 Haz 1991 (35)
Türkiye
Almanya
200 bin €
70 
Galatasaray U19İç transfer: Galatasaray U19; tarih: 1 Tem 2025. Sol ok simgesi, Geri anlamına gelebilir
Enes Emre Büyük
Enes Emre Büyük
Kaleci
8 May 2006 (20)
Türkiye
-
6 
Davinson Sánchez
Davinson Sánchez
Stoper
 
12 Haz 1996 (30)
Kolombiya
16.00 mil. €
42 
Abdülkerim Bardakcı
Abdülkerim Bardakcı
Stoper
 
7 Eyl 1994 (31)
Türkiye
6.50 mil. €
91 
Galatasaray U19İç transfer: Galatasaray U19; tarih: 1 Tem 2025. Sol ok simgesi, Geri anlamına gelebilir
Arda Ünyay
Arda Ünyay
Stoper
18 Oca 2007 (19)
Türkiye
1.00 mil. €
3 
Metehan Baltacı
Metehan Baltacı 
Stoper
 
3 Kas 2002 (23)
Türkiye
-
4 
AS MonacoAS Monaco'dan yeni transfer; Tarih: 1 Tem 2025; Bonservis: 8.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Ismail Jakobs
Ismail Jakobs
Sol Bek
17 Ağu 1999 (26)
Senegal
Almanya
8.00 mil. €
17 
Eren Elmalı
Eren Elmalı
Sol Bek
 
7 Tem 2000 (25)
Türkiye
5.00 mil. €
90 
AS MonacoAS Monaco'dan yeni transfer; Tarih: 28 Ağu 2025; Bonservis: 30.77 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Wilfried Singo
Wilfried Singo
Sağ Bek
25 Ara 2000 (25)
Fildişi Sahili
23.00 mil. €
7 
Roland Sallai
Roland Sallai
Sağ Bek
 
22 May 1997 (29)
Macaristan
14.00 mil. €
93 
FC Bayern Münih Kiralandığı takım: FC Bayern Münih ; dönüş tarihi: 30 Haz 2026. Açıklama yok.
Sacha Boey
Sacha Boey
Sağ Bek
13 Eyl 2000 (25)
Fransa
10.00 mil. €
34 
Lucas Torreira
Lucas Torreira
Ön Libero
 
11 Şub 1996 (30)
Uruguay
İspanya
10.00 mil. €
99 
Mario Lemina
Mario Lemina
Ön Libero
 
1 Eyl 1993 (32)
Gabon
Fransa
4.50 mil. €
23 
Kaan Ayhan
Kaan Ayhan
Ön Libero
 
10 Kas 1994 (31)
Türkiye
Almanya
1.50 mil. €
8 
Gabriel Sara
Gabriel Sara 
Merkez Orta Saha
 
26 Haz 1999 (27)
Brezilya
27.00 mil. €
74 
Casa Pia ACOcak ayında geldiği takım: Casa Pia AC; tarih: 3 Şub 2026; ücret: 6.50 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Renato Nhaga
Renato Nhaga
Merkez Orta Saha
27 Mar 2007 (19)
Gine-Bissau
Portekiz
6.00 mil. €
20 
Manchester CityManchester City'dan yeni transfer; Tarih: 2 Eyl 2025; Bonservis: Bedelsiz. Sol ok simgesi, Geri anlamına gelebilir
İlkay Gündoğan
İlkay Gündoğan
Merkez Orta Saha
24 Eki 1990 (35)
Almanya
2.00 mil. €
33 
KulüpsüzBu takıma transfer olacak:Kulüpsüz; Tarih:1 Tem 2026;Bonservis:-. Sağ ok simgesi, İleri anlamına gelebilir
Gökdeniz Gürpüz
Gökdeniz Gürpüz
Merkez Orta Saha
25 Şub 2006 (20)
Türkiye
Almanya
250 bin €
53 
Barış Alper Yılmaz
Barış Alper Yılmaz
Sol Kanat
 
23 May 2000 (26)
Türkiye
30.00 mil. €
77 
SSC NapoliKiralandığı takım: SSC Napoli; dönüş tarihi: 30 Haz 2026. Açıklama yok.
Noa Lang
Noa Lang
Sol Kanat
17 Haz 1999 (27)
Hollanda
Surinam
22.00 mil. €
21 
Ahmed Kutucu
Ahmed Kutucu
Sol Kanat
 
1 Mar 2000 (26)
Türkiye
Almanya
3.00 mil. €
10 
FC Bayern Münih FC Bayern Münih 'dan yeni transfer; Tarih: 1 Tem 2025; Bonservis: Bedelsiz. Sol ok simgesi, Geri anlamına gelebilir
Leroy Sané
Leroy Sané
Sağ Kanat
11 Oca 1996 (30)
Almanya
Fransa
20.00 mil. €
11 
Yunus Akgün
Yunus Akgün
Sağ Kanat
 
7 Tem 2000 (25)
Türkiye
18.00 mil. €
22 
Girona FCKiralandığı takım: Girona FC; dönüş tarihi: 30 Haz 2026. Açıklama yok.
Yáser Asprilla
Yáser Asprilla
Sağ Kanat
19 Kas 2003 (22)
Kolombiya
14.00 mil. €
27 
Borussia Mönchengladbach U19Ocak ayında geldiği takım: Borussia Mönchengladbach U19; tarih: 5 Şub 2026; ücret: 350 bin €. Sol ok simgesi, Geri anlamına gelebilir
Armando Güner
Armando Güner
Sağ Kanat
7 Oca 2008 (18)
Arjantin
Almanya
500 bin €
45 
SSC NapoliSSC Napoli'dan yeni transfer; Tarih: 31 Tem 2025; Bonservis: 75.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Victor Osimhen
Victor Osimhen
Santrafor
29 Ara 1998 (27)
Nijerya
75.00 mil. €
9 
KulüpsüzBu takıma transfer olacak:Kulüpsüz; Tarih:1 Tem 2026;Bonservis:-. Sağ ok simgesi, İleri anlamına gelebilir
Mauro Icardi
Mauro Icardi 
Santrafor
19 Şub 1993 (33)
Arjantin
İtalya
4.00 mil. €
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
                id: currentName.toLowerCase().replace(/[^a-z]/g, '') + "_galatasaray",
                name: currentName.replace("  ", "").trim(),
                position: currentPos,
                age: currentAge,
                power: Math.min(95, 60 + currentVal*2),
                speed: parseFloat((3 + Math.random()*2).toFixed(1)),
                mentalTrait: trait,
                tacticalRole: role,
                price: Math.max(1, currentVal),
                teamId: "galatasaray"
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

let jsPath = 'js/data_superlig.js';
let jsContent = fs.readFileSync(jsPath, 'utf8');

let hasBOM = jsContent.charCodeAt(0) === 0xFEFF;
if (hasBOM) jsContent = jsContent.substring(1);

let startIndex = jsContent.indexOf('const trPlayers = [');
if (startIndex !== -1) {
    let arrayStart = jsContent.indexOf('[', startIndex);
    let arrayEnd = jsContent.lastIndexOf(']', jsContent.indexOf('window.leagueData.players.push'));
    
    let playersStr = jsContent.substring(arrayStart, arrayEnd + 1);
    
    try {
        let allPlayers = eval(playersStr);
        allPlayers = allPlayers.filter(p => p.teamId !== 'galatasaray'); // Remove old gs players
        allPlayers = allPlayers.concat(uniquePlayers);
        
        let newPlayersStr = JSON.stringify(allPlayers, null, 4);
        
        jsContent = jsContent.substring(0, arrayStart) + newPlayersStr + jsContent.substring(arrayEnd + 1);
        fs.writeFileSync(jsPath, (hasBOM ? '\uFEFF' : '') + jsContent, 'utf8');
        console.log("Galatasaray updated with " + uniquePlayers.length + " players.");
    } catch(e) {
        console.error("Eval error", e);
    }
} else {
    console.log("Could not find trPlayers array.");
}

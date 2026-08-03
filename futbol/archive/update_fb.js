const fs = require('fs');

const data = `
31 
Manchester CityManchester City'dan yeni transfer; Tarih: 2 Eyl 2025; Bonservis: 11.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Ederson
Ederson
Kaleci
17 Ağu 1993 (32)
Brezilya
Portekiz
10.00 mil. €
13 
Çaykur Rizespor Çaykur Rizespor 'dan yeni transfer; Tarih: 13 Tem 2025; Bonservis: Bedelsiz. Sol ok simgesi, Geri anlamına gelebilir
Tarık Çetin
Tarık Çetin
Kaleci
8 Oca 1997 (29)
Türkiye
600 bin €
34 
Beşiktaş JKOcak ayında geldiği takım: Beşiktaş JK; tarih: 6 Oca 2026; ücret: Bedelsiz. Sol ok simgesi, Geri anlamına gelebilir
Mert Günok
Mert Günok
Kaleci
1 Mar 1989 (37)
Türkiye
500 bin €
39 
Fenerbahçe U19İç transfer: Fenerbahçe U19; tarih: 1 Tem 2025. Sol ok simgesi, Geri anlamına gelebilir
Engin Can Biterge
Engin Can Biterge
Kaleci
22 Oca 2007 (19)
Türkiye
Bulgaristan
-
24 
Jayden Oosterwolde
Jayden Oosterwolde
Stoper
 
26 Nis 2001 (25)
Hollanda
Surinam
20.00 mil. €
37 
Paris Saint-GermainParis Saint-Germain'dan yeni transfer; Tarih: 30 Tem 2025; Bonservis: 6.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Milan Škriniar
Milan Škriniar  
Stoper
11 Şub 1995 (31)
Slovakya
10.00 mil. €
14 
Fatih KaragümrükFatih Karagümrük ile kiralık döneminden döndü; Tarih: 30 Haz 2025; Ablöse: Kiralıktan geri döndü. Sol ok simgesi, Geri anlamına gelebilir
Yiğit Efe Demir
Yiğit Efe Demir
Stoper
2 Ağu 2004 (21)
Türkiye
6.00 mil. €
4 
Çağlar Söyüncü
Çağlar Söyüncü
Stoper
 
23 May 1996 (30)
Türkiye
3.50 mil. €
67 
Kamil Efe Üregen
Kamil Efe Üregen
Stoper
 
9 Nis 2008 (18)
Türkiye
100 bin €
3 
KAA GentKAA Gent'dan yeni transfer; Tarih: 12 Tem 2025; Bonservis: 8.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Archie Brown
Archie Brown
Sol Bek
28 May 2002 (24)
İngiltere
Jamaika
12.00 mil. €
22 
Levent Mercan
Levent Mercan
Sol Bek
 
10 Ara 2000 (25)
Türkiye
Almanya
5.00 mil. €
18 
Mert Müldür
Mert Müldür
Sağ Bek
 
3 Nis 1999 (27)
Türkiye
Avusturya
7.00 mil. €
27 
Wolverhampton WanderersWolverhampton Wanderers'dan yeni transfer; Tarih: 30 Tem 2025; Bonservis: Bedelsiz. Sol ok simgesi, Geri anlamına gelebilir
Nélson Semedo
Nélson Semedo
Sağ Bek
16 Kas 1993 (32)
Portekiz
Yeşil Burun Adaları
6.00 mil. €
5 
İsmail Yüksek
İsmail Yüksek
Ön Libero
 
26 Oca 1999 (27)
Türkiye
15.00 mil. €
11 
West Ham UnitedKiralandığı takım: West Ham United; dönüş tarihi: 30 Haz 2026. Açıklama yok.
Edson Álvarez
Edson Álvarez
Ön Libero
24 Eki 1997 (28)
Meksika
15.00 mil. €
17 
Al-Ittihad ClubOcak ayında geldiği takım: Al-Ittihad Club; tarih: 2 Şub 2026; ücret: Bedelsiz. Sol ok simgesi, Geri anlamına gelebilir
N'Golo Kanté
N'Golo Kanté
Ön Libero
29 Mar 1991 (35)
Fransa
Mali
4.00 mil. €
6 
SS LazioOcak ayında geldiği takım: SS Lazio; tarih: 8 Oca 2026; ücret: 28.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Mattéo Guendouzi
Mattéo Guendouzi
Merkez Orta Saha
14 Nis 1999 (27)
Fransa
Fas
27.00 mil. €
7 
Fred
Fred
Merkez Orta Saha
 
5 Mar 1993 (33)
Brezilya
4.50 mil. €
60 
Essamaye FCEssamaye FC'dan yeni transfer; Tarih: 1 Tem 2025; Bonservis: ?. Sol ok simgesi, Geri anlamına gelebilir
Abdou Aziz Fall
Abdou Aziz Fall
Merkez Orta Saha
20 Şub 2007 (19)
Senegal
100 bin €
21 
Paris Saint-GermainParis Saint-Germain'dan yeni transfer; Tarih: 1 Eyl 2025; Bonservis: 7.50 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Marco Asensio
Marco Asensio
On Numara
21 Oca 1996 (30)
İspanya
Hollanda
15.00 mil. €
94 
Talisca
Talisca
On Numara
 
1 Şub 1994 (32)
Brezilya
7.00 mil. €
8 
Mert Hakan Yandaş
Mert Hakan Yandaş 
On Numara
 
19 Ağu 1994 (31)
Türkiye
-
9 
SL BenficaSL Benfica'dan yeni transfer; Tarih: 1 Eyl 2025; Bonservis: 22.50 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Kerem Aktürkoğlu
Kerem Aktürkoğlu
Sol Kanat
21 Eki 1998 (27)
Türkiye
20.00 mil. €
20 
SamsunsporOcak ayında geldiği takım: Samsunspor; tarih: 2 Oca 2026; ücret: 5.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Anthony Musaba
Anthony Musaba
Sol Kanat
6 Ara 2000 (25)
Hollanda
Kongo DC
7.00 mil. €
45 
Red Bull SalzburgRed Bull Salzburg'dan yeni transfer; Tarih: 19 Ağu 2025; Bonservis: 18.00 mil. €. Sol ok simgesi, Geri anlamına gelebilir
Dorgeles Nene
Dorgeles Nene
Sağ Kanat
23 Ara 2002 (23)
Mali
20.00 mil. €
70 
Oğuz Aydın
Oğuz Aydın
Sağ Kanat
 
27 Eki 2000 (25)
Türkiye
Hollanda
7.00 mil. €
- 
KulüpsüzBu takıma transfer olacak:Kulüpsüz; Tarih:1 Tem 2026;Bonservis:-. Sağ ok simgesi, İleri anlamına gelebilir
Emre Mor
Emre Mor
Sağ Kanat
24 Tem 1997 (28)
Türkiye
Danimarka
500 bin €
26 
Angers SCOKiralandığı takım: Angers SCO; dönüş tarihi: 30 Haz 2026. Açıklama yok.
Sidiki Chérif
Sidiki Chérif
Santrafor
15 Ara 2006 (19)
Gine
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
                id: currentName.toLowerCase().replace(/[^a-z]/g, '') + "_fenerbahce",
                name: currentName.replace("  ", "").trim(),
                position: currentPos,
                age: currentAge,
                power: Math.min(95, 60 + currentVal*2),
                speed: parseFloat((3 + Math.random()*2).toFixed(1)),
                mentalTrait: trait,
                tacticalRole: role,
                price: Math.max(1, currentVal),
                teamId: "fenerbahce"
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
    
    // We need to parse until the matching '];' 
    // However, since window.leagueData.players.push(...trPlayers); is right after it, we can just use lastIndexOf(']')
    let arrayEnd = jsContent.lastIndexOf(']', jsContent.indexOf('window.leagueData.players.push'));
    
    let playersStr = jsContent.substring(arrayStart, arrayEnd + 1);
    
    try {
        let allPlayers = eval(playersStr);
        allPlayers = allPlayers.filter(p => p.teamId !== 'fenerbahce');
        allPlayers = allPlayers.concat(uniquePlayers);
        
        let newPlayersStr = JSON.stringify(allPlayers, null, 4);
        
        jsContent = jsContent.substring(0, arrayStart) + newPlayersStr + jsContent.substring(arrayEnd + 1);
        fs.writeFileSync(jsPath, (hasBOM ? '\uFEFF' : '') + jsContent, 'utf8');
        console.log("Fenerbahçe updated with " + uniquePlayers.length + " players.");
    } catch(e) {
        console.error("Eval error", e);
    }
} else {
    console.log("Could not find trPlayers array.");
}

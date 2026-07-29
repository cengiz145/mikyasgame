const fs = require('fs');

const data = `
226
Lucas Bergvall
Lucas Bergvall
Merkez Orta Saha
20
İsveç
Tottenham Hotspur
35.00 mil. € 
227
Marc Pubill
Stoper
23
İspanya
Atlético Madrid
35.00 mil. € 
228
Ange-Yoan Bonny
Ange-Yoan Bonny
Santrafor
22
Fildişi Sahili
Fransa
Inter Milan
35.00 mil. € 
229
Dango Ouattara
Dango Ouattara
Sağ Kanat
24
Burkina Faso
Brentford FC
35.00 mil. € 
230
Mika Godts
Mika Godts
Sol Kanat
21
Belçika
Ajax Amsterdam
35.00 mil. € 
231
Savinho
Savinho
Sol Kanat
22
Brezilya
Manchester City
35.00 mil. € 
232
Milos Kerkez
Milos Kerkez
Sol Bek
22
Macaristan
Sırbistan
Liverpool FC
35.00 mil. € 
233
Noah Sadiki
Noah Sadiki
Merkez Orta Saha
21
Kongo DC
Belçika
Sunderland AFC
35.00 mil. € 
234
Matias Fernandez-Pardo
Matias Fernandez-Pardo
Santrafor
21
Belçika
İspanya
LOSC Lille
35.00 mil. € 
235
Evanilson
Evanilson
Santrafor
26
Brezilya
AFC Bournemouth
35.00 mil. € 
236
Gerard Martín
Gerard Martín
Stoper
24
İspanya
FC Barcelona
35.00 mil. € 
237
Matías Soulé
Matías Soulé
Sağ Kanat
23
Arjantin
İtalya
AS Roma
35.00 mil. € 
238
Máximo Perrone
Máximo Perrone
Ön Libero
23
Arjantin
İspanya
Como 1907. Açıklama yok.
35.00 mil. € 
239
Yasin Ayari
Yasin Ayari
Merkez Orta Saha
22
İsveç
Tunus
Brighton & Hove Albion
35.00 mil. € 
240
Bilal El Khannouss
Bilal El Khannouss
On Numara
22
Fas
Belçika
VfB Stuttgart
35.00 mil. € 
241
Igor Paixão
Igor Paixão
Sol Kanat
25
Brezilya
Olympique Marsilya
35.00 mil. € 
242
Malo Gusto
Malo Gusto
Sağ Bek
23
Fransa
Martinique
Chelsea FC
35.00 mil. € 
243
Maxi Araújo
Maxi Araújo
Sol Bek
26
Uruguay
Sporting Lizbon
35.00 mil. € 
244
Edmond Tapsoba
Edmond Tapsoba
Stoper
27
Burkina Faso
Bayer 04 Leverkusen
35.00 mil. € 
245
Pedro Porro
Pedro Porro
Sağ Bek
26
İspanya
Tottenham Hotspur
35.00 mil. € 
246
Fisnik Asllani
Fisnik Asllani
Santrafor
23
Kosova
Almanya
TSG 1899 Hoffenheim
35.00 mil. € 
247
Bremer
Bremer
Stoper
29
Brezilya
Juventus
35.00 mil. € 
248
Senne Lammens
Senne Lammens
Kaleci
23
Belçika
Manchester United
35.00 mil. € 
249
Jacob Ramsey
Jacob Ramsey
Merkez Orta Saha
25
İngiltere
Newcastle United
35.00 mil. € 
250
Jeremie Frimpong
Jeremie Frimpong
Sağ Bek
25
Hollanda
Gana
Liverpool FC
35.00 mil. €
`;

const lines = data.split('\n').map(l => l.trim()).filter(l => l);

const players = [];
let i = 0;
while (i < lines.length) {
    if (/^\d+$/.test(lines[i])) {
        let rank = lines[i++];
        let name = lines[i++];
        if (lines[i] === name) i++;
        
        let position = lines[i++];
        let age = parseInt(lines[i++]);
        
        let club = "";
        while (i < lines.length && !lines[i].includes('mil. €')) {
            club = lines[i++];
        }
        
        let valueStr = lines[i++];
        let gameVal = 10;
        if (valueStr && valueStr.includes('mil. €')) {
            let match = valueStr.match(/([\d\.]+)/);
            if (match) {
                let tmVal = parseFloat(match[1]);
                gameVal = Math.round(tmVal / 3.5);
            }
        }
        
        let role = "box_to_box";
        let trait = "elite";
        let posLower = position.toLowerCase();
        if (posLower.includes("kaleci")) role = "sweeper_keeper";
        else if (posLower.includes("stoper") || posLower.includes("defans")) role = "stopper";
        else if (posLower.includes("bek")) role = "wing_back";
        else if (posLower.includes("kanat") || posLower.includes("açık")) role = "winger";
        else if (posLower.includes("santrafor") || posLower.includes("forvet")) role = "poacher";
        else if (posLower.includes("10 numara")) role = "playmaker";
        
        let teamId = club.toLowerCase().replace(/ /g, '').replace(/fc/g, '').replace(/1907/g, '').replace(/\./g, '').replace(/açıklamayok/g, '');
        if (!teamId) teamId = "free";
        
        players.push({
            name, position, age, teamId, value: gameVal, role, trait
        });
    } else {
        i++;
    }
}

let jsPath = 'js/data_world_stars.js';
let jsContent = fs.readFileSync(jsPath, 'utf8');

// remove BOM if present for manipulation
if (jsContent.charCodeAt(0) === 0xFEFF) {
    jsContent = jsContent.substring(1);
}

let endIdx = jsContent.lastIndexOf(']');
if (endIdx !== -1) {
    let newJson = ",\n" + players.map(p => "    " + JSON.stringify(p)).join(",\n");
    let updatedContent = jsContent.substring(0, endIdx) + newJson + "\n" + jsContent.substring(endIdx);
    
    // Add BOM back
    fs.writeFileSync(jsPath, '\\uFEFF' + updatedContent, 'utf8');
}

console.log('Appended ' + players.length + ' players.');

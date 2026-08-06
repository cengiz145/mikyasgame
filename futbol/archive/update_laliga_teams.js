const fs = require('fs');

const data = `
Real Madrid
Real Madrid FIFA Intercontinental Cup Winner 24/25
29
25.8
17
42.03 mil. €
1.22 milyar €
FC Barcelona
FC Barcelona İspanya Kupası 24/25İspanya LaLiga 24/25
24
25.9
11
48.05 mil. €
1.15 milyar €
Atlético Madrid
Atlético Madrid
23
27.8
16
25.09 mil. €
577.00 mil. €
Villarreal CF
Villarreal CF
27
26.6
13
11.20 mil. €
302.50 mil. €
Real Sociedad
Real Sociedad
25
26.3
9
10.22 mil. €
255.40 mil. €
Real Betis
Real Betis
27
29.3
13
9.13 mil. €
246.40 mil. €
Athletic Bilbao
Athletic Bilbao
28
27.4
3
8.19 mil. €
229.20 mil. €
Celta Vigo
Celta Vigo
28
27.2
9
6.79 mil. €
190.20 mil. €
Sevilla FC
Sevilla FC
28
28.1
17
5.31 mil. €
148.80 mil. €
Girona FC
Girona FC
27
28.8
14
5.35 mil. €
144.40 mil. €
Valencia CF
Valencia CF
27
28.3
14
5.33 mil. €
143.90 mil. €
Espanyol Barcelona
Espanyol Barcelona
24
27.4
7
5.11 mil. €
122.75 mil. €
Levante UD
Levante UD İspanya LaLiga2 24/25
27
26.0
8
4.04 mil. €
109.00 mil. €
Rayo Vallecano
Rayo Vallecano
27
28.9
14
3.90 mil. €
105.40 mil. €
CA Osasuna
CA Osasuna
23
28.2
3
4.34 mil. €
99.80 mil. €
Elche CF
Elche CF 
26
26.9
10
3.81 mil. €
99.10 mil. €
RCD Mallorca
RCD Mallorca
26
28.0
11
3.13 mil. €
81.50 mil. €
Getafe CF
Getafe CF
25
28.4
13
3.01 mil. €
75.30 mil. €
Deportivo Alavés
Deportivo Alavés
24
28.2
10
2.97 mil. €
71.30 mil. €
Real Oviedo
Real Oviedo 
26
28.1
16
2.15 mil. €
55.80 mil. €
`;

const lines = data.split('\n').map(l => l.trim()).filter(l => l);
const teams = [];

const defaultColors = {
    'Real Madrid': '#FFFFFF',
    'FC Barcelona': '#A50044',
    'Atlético Madrid': '#CB3524',
    'Villarreal CF': '#FCE300',
    'Real Sociedad': '#0067B1',
    'Real Betis': '#0BA35C',
    'Athletic Bilbao': '#EE2523',
    'Celta Vigo': '#ADD8E6',
    'Sevilla FC': '#D01A22',
    'Girona FC': '#ED1C24',
    'Valencia CF': '#000000',
    'Espanyol Barcelona': '#004B87',
    'Levante UD': '#004B87',
    'Rayo Vallecano': '#FFFFFF',
    'CA Osasuna': '#D0112B',
    'Elche CF': '#FFFFFF',
    'RCD Mallorca': '#D82028',
    'Getafe CF': '#0044A1',
    'Deportivo Alavés': '#00539C',
    'Real Oviedo': '#004A99'
};

for (let i = 0; i < lines.length; i++) {
    let name = lines[i];
    if (defaultColors[name] || defaultColors[name.replace(' ', '')]) {
        let valStr = '';
        let euroCount = 0;
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].includes('€')) {
                euroCount++;
                if (euroCount === 2) {
                    valStr = lines[j];
                    i = j;
                    break;
                }
            }
        }
        
        let val = 10;
        if (valStr.includes('milyar')) {
            let match = valStr.match(/([\d\.]+)/);
            if (match) val = parseFloat(match[1]) * 1000;
        } else if (valStr.includes('mil. €')) {
            let match = valStr.match(/([\d\.]+)/);
            if (match) val = parseFloat(match[1]);
        }
        
        let budget = Math.round(val / 10);
        
        let teamId = name.toLowerCase()
            .replace(/ /g, '_')
            .replace(/fc/g, '')
            .replace(/cf/g, '')
            .replace(/ud/g, '')
            .replace(/ca/g, '')
            .replace(/rcd/g, '')
            .replace(/_$/, '')
            .replace(/^_/, '')
            .replace(/__/g, '_')
            .replace('é', 'e')
            .replace('á', 'a');
            
        teams.push({
            id: teamId,
            name: name,
            color: defaultColors[name] || '#FFFFFF',
            budget: budget,
            leagueId: 'laliga'
        });
    }
}

let jsPath = 'js/data_laliga.js';
let jsContent = fs.readFileSync(jsPath, 'utf8');
let hasBOM = jsContent.charCodeAt(0) === 0xFEFF;
if (hasBOM) jsContent = jsContent.substring(1);

let startIndex = jsContent.indexOf('const laligaTeams = [');
if (startIndex !== -1) {
    let arrayStart = jsContent.indexOf('[', startIndex);
    let arrayEnd = jsContent.lastIndexOf(']', jsContent.indexOf('window.leagueData.teams.push'));
    
    let newTeamsStr = JSON.stringify(teams, null, 4);
    
    jsContent = jsContent.substring(0, arrayStart) + newTeamsStr + jsContent.substring(arrayEnd + 1);
    fs.writeFileSync(jsPath, (hasBOM ? '\uFEFF' : '') + jsContent, 'utf8');
    console.log('La Liga updated with ' + teams.length + ' teams.');
} else {
    console.log('Could not find laligaTeams array.');
}

const fs = require('fs');

let content = fs.readFileSync('js/data.js', 'utf8');

// I'll add an initialization block at the end of the file that modifies leagueData.players in memory.
// Wait, data.js is a const object `leagueData`. We can mutate it at the end of data.js.

const patchCode = `

// --- 7 FUTBOLCU PROFİLİ OTOMATİK ATAMA SİSTEMİ ---
if (leagueData && leagueData.players) {
    leagueData.players.forEach(p => {
        if (!p.tacticalRole || p.tacticalRole === 'classic') {
            let r = Math.random();
            let pos = p.position || "";
            
            if (pos.includes('Bek')) {
                p.tacticalRole = r < 0.6 ? 'attacking_fullback' : 'utility';
            } else if (pos.includes('Stoper')) {
                p.tacticalRole = r < 0.7 ? 'stopper' : 'utility';
            } else if (pos === 'On Numara') {
                p.tacticalRole = 'playmaker';
            } else if (pos.includes('Ortasaha') || pos === 'Ön Libero') {
                if (r < 0.4) p.tacticalRole = 'box_to_box';
                else if (r < 0.7) p.tacticalRole = 'playmaker';
                else p.tacticalRole = 'utility';
            } else if (pos.includes('Kanat')) {
                p.tacticalRole = r < 0.7 ? 'winger' : 'utility';
            } else if (pos === 'Forvet') {
                p.tacticalRole = r < 0.7 ? 'poacher' : 'utility';
            } else if (pos === 'Kaleci') {
                p.tacticalRole = 'sweeper_keeper';
            } else {
                p.tacticalRole = 'utility'; // Joker
            }
        }
        
        // Bazı bilindik isimlere özel atamalar (Örnek)
        if (p.name.includes("Torreira") || p.name.includes("Kanté") || p.name.includes("Gattuso")) p.tacticalRole = 'box_to_box';
        if (p.name.includes("Icardi") || p.name.includes("Dzeko") || p.name.includes("Haaland")) p.tacticalRole = 'poacher';
        if (p.name.includes("Ferdi") || p.name.includes("Alexander-Arnold")) p.tacticalRole = 'attacking_fullback';
        if (p.name.includes("De Bruyne") || p.name.includes("Ødegaard")) p.tacticalRole = 'playmaker';
        if (p.name.includes("Vinícius") || p.name.includes("Quaresma")) p.tacticalRole = 'winger';
        if (p.name.includes("Ramos") || p.name.includes("van Dijk")) p.tacticalRole = 'stopper';
        if (p.name.includes("Barış Alper") || p.name.includes("Nacho")) p.tacticalRole = 'utility';
    });
}
`;

if (!content.includes('7 FUTBOLCU PROFİLİ OTOMATİK ATAMA SİSTEMİ')) {
    content += patchCode;
    fs.writeFileSync('js/data.js', content, 'utf8');
    console.log('js/data.js patched with 7 player profiles.');
} else {
    console.log('Already patched.');
}

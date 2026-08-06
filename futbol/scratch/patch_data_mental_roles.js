const fs = require('fs');

let content = fs.readFileSync('js/data.js', 'utf8');

const searchRegex = /if \(leagueData && leagueData\.players\) \{[\s\S]*?\/\/ Bazı bilindik isimlere özel atamalar \(Örnek\)/;

const replaceStr = `if (leagueData && leagueData.players) {
    leagueData.players.forEach(p => {
        if (!p.tacticalRole || p.tacticalRole === 'classic') {
            let pos = p.position || "";
            let mental = p.mentalTrait || "consistent"; // elite, aggressive, creative, consistent, fragile
            
            // KARAKTERE (MENTAL TRAIT) GÖRE GİZLİ PROFİL ATAMASI
            if (pos.includes('Bek')) {
                // Agresif bekler çizgi otobanı olur, diğerleri joker
                p.tacticalRole = (mental === 'aggressive' || mental === 'elite') ? 'attacking_fullback' : 'utility';
            } else if (pos.includes('Stoper')) {
                // Lider veya agresif stoperler Patron Stoper olur
                p.tacticalRole = (mental === 'elite' || mental === 'aggressive') ? 'stopper' : 'utility';
            } else if (pos === 'On Numara') {
                p.tacticalRole = 'playmaker'; // On numara her zaman maestro'dur
            } else if (pos.includes('Ortasaha') || pos === 'Ön Libero') {
                if (mental === 'aggressive') p.tacticalRole = 'box_to_box';
                else if (mental === 'elite' || mental === 'creative') p.tacticalRole = 'playmaker';
                else p.tacticalRole = 'utility';
            } else if (pos.includes('Kanat')) {
                // Yaratıcı kanatlar sihirbaz olur
                p.tacticalRole = (mental === 'creative' || mental === 'elite') ? 'winger' : 'utility';
            } else if (pos === 'Forvet') {
                // Fırsatçı (Poacher) genelde kırılgan (sadece gol atar) veya elit karakterlidir
                p.tacticalRole = (mental === 'fragile' || mental === 'elite') ? 'poacher' : 'utility';
            } else if (pos === 'Kaleci') {
                p.tacticalRole = 'sweeper_keeper';
            } else {
                p.tacticalRole = 'utility'; 
            }
        }
        
        // Bazı bilindik isimlere özel atamalar (Örnek)`;

content = content.replace(searchRegex, replaceStr);

fs.writeFileSync('js/data.js', content, 'utf8');
console.log('js/data.js updated to bind roles to mentalTraits');

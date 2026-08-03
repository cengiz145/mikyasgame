const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

const searchStr = `document.getElementById('pp-role').textContent = player.tacticalRole || "Belirsiz";`;
const replaceStr = `
        let roleName = "Joker (Çok Yönlü)";
        switch(player.tacticalRole) {
            case 'playmaker': roleName = "Maestro (Orkestra Şefi)"; break;
            case 'box_to_box': roleName = "Dinamo (Top Kapan)"; break;
            case 'poacher': roleName = "Fırsatçı (Hedef Forvet)"; break;
            case 'winger': roleName = "Sihirbaz (Cambaz)"; break;
            case 'stopper': roleName = "Patron Stoper (Savunma Bakanı)"; break;
            case 'attacking_fullback': roleName = "Çizgi Otobanı (Hücumcu Bek)"; break;
            case 'utility': roleName = "Asker (Joker)"; break;
            case 'sweeper_keeper': roleName = "Libero Kaleci"; break;
            case 'classic': roleName = "Klasik Oyuncu"; break;
        }
        document.getElementById('pp-role').textContent = roleName;
`;

content = content.replace(searchStr, replaceStr);

// Let's also patch it if it shows up anywhere else like in the list rendering.
// squad-list rendering
const squadSearchStr = `<span style="font-size: 0.8rem; opacity: 0.8;">Yaş: \${p.age || 25} | Rol: \${p.tacticalRole || 'Belirsiz'}</span>`;
const squadReplaceStr = `<span style="font-size: 0.8rem; opacity: 0.8;">Yaş: \${p.age || 25} | Rol: \${
            p.tacticalRole === 'playmaker' ? "Maestro" :
            p.tacticalRole === 'box_to_box' ? "Dinamo" :
            p.tacticalRole === 'poacher' ? "Fırsatçı" :
            p.tacticalRole === 'winger' ? "Sihirbaz" :
            p.tacticalRole === 'stopper' ? "Patron Stoper" :
            p.tacticalRole === 'attacking_fullback' ? "Çizgi Otobanı" :
            p.tacticalRole === 'utility' ? "Asker (Joker)" :
            p.tacticalRole === 'sweeper_keeper' ? "Libero Kaleci" : "Klasik"
        }</span>`;

content = content.replace(squadSearchStr, squadReplaceStr);

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('js/menu.js patched to show beautiful role names.');

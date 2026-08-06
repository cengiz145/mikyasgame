const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

// 1. Revert Squad list
// Current format in patched code:
const squadSearchStr = `<span style="font-size: 0.8rem; opacity: 0.8;">Yaş: \\\${p.age || 25} | Rol: \\\${
            p.tacticalRole === 'playmaker' ? "Maestro" :
            p.tacticalRole === 'box_to_box' ? "Dinamo" :
            p.tacticalRole === 'poacher' ? "Fırsatçı" :
            p.tacticalRole === 'winger' ? "Sihirbaz" :
            p.tacticalRole === 'stopper' ? "Patron Stoper" :
            p.tacticalRole === 'attacking_fullback' ? "Çizgi Otobanı" :
            p.tacticalRole === 'utility' ? "Asker (Joker)" :
            p.tacticalRole === 'sweeper_keeper' ? "Libero Kaleci" : "Klasik"
        }</span>`;
        
// The user wants it hidden in the background, so I will remove the role display completely.
const squadReplaceStr = `<span style="font-size: 0.8rem; opacity: 0.8;">Yaş: \${p.age || 25}</span>`;
content = content.replace(new RegExp(squadSearchStr.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&'), 'g'), squadReplaceStr);


// 2. Revert Player Detail Modal
const detailSearchStr = `        let roleName = "Joker (Çok Yönlü)";
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
        document.getElementById('pp-role').textContent = roleName;`;

const detailReplaceStr = `        // Rol bilgisini arka planda gizli tuttuk. Karakter (mentalTrait) gösterilebilir.
        let mentalName = "Standart";
        switch(player.mentalTrait) {
            case 'elite': mentalName = "Lider (Elit)"; break;
            case 'aggressive': mentalName = "Agresif"; break;
            case 'creative': mentalName = "Yaratıcı"; break;
            case 'consistent': mentalName = "İstikrarlı"; break;
            case 'fragile': mentalName = "Kırılgan"; break;
        }
        document.getElementById('pp-role').textContent = "Karakter: " + mentalName;`;

content = content.replace(detailSearchStr, detailReplaceStr);

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('js/menu.js reverted to hide tactical roles in the background.');

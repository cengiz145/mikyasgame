const fs = require('fs');
const path = require('path');

const managerPath = path.join(__dirname, '..', 'js', 'manager.js');
let content = fs.readFileSync(managerPath, 'utf8');

const oldFuncRegex = /function selectPlayerForSlot\(playerId\) \{[\s\S]*?let p = getPlayerById\(playerId\);/m;

const newFuncLogic = `
function selectPlayerForSlot(playerId) {
    if (!window.medicalProfile) {
        window.medicalProfile = Math.random() < 0.5 ? "koruyucu" : "geleneksel";
    }

    let p = getPlayerById(playerId);
    
    // [YENİ] Kart Cezalısı Kontrolü
    if (p && p.redCardWeeks > 0) {
        alert("🟥 HATA: " + p.name + " kart cezalısı olduğu için maç kadrosuna alınamaz!");
        if(typeof speak === 'function') speak("Hocam, bu oyuncu kart cezalısı. Kadroya dahil edemeyiz.");
        return;
    }
    
    // [YENİ] Sakatlık Kontrolü
    if (p && p.injuredWeeks > 0) {
        alert("🚑 HATA: " + p.name + " sakat olduğu için kadroya alınamaz! Revire gidip tedavisini takip edin.");
        if(typeof speak === 'function') speak("Hocam, oyuncu sakat. Tedavisi bitmeden sahaya çıkamaz.");
        return;
    }
`;

content = content.replace(oldFuncRegex, newFuncLogic.trim());
fs.writeFileSync(managerPath, content, 'utf8');
console.log("manager.js updated to block suspended and injured players.");

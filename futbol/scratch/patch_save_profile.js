const fs = require('fs');

let content = fs.readFileSync('js/save.js', 'utf8');

// Patch saveGame
const saveStr = `            presidentConfidence: window.presidentConfidence !== undefined ? window.presidentConfidence : 50,
            managerAuthority: window.managerAuthority !== undefined ? window.managerAuthority : 50,`;
const saveReplacement = `            presidentConfidence: window.presidentConfidence !== undefined ? window.presidentConfidence : 50,
            managerAuthority: window.managerAuthority !== undefined ? window.managerAuthority : 50,
            managerProfile: window.managerProfile || 'motivasyon_ustasi',`;

content = content.replace(saveStr, saveReplacement);

// Patch loadGame
const loadStr = `            if (savedData.presidentConfidence !== undefined) window.presidentConfidence = savedData.presidentConfidence;
            if (savedData.managerAuthority !== undefined) window.managerAuthority = savedData.managerAuthority;`;
const loadReplacement = `            if (savedData.presidentConfidence !== undefined) window.presidentConfidence = savedData.presidentConfidence;
            if (savedData.managerAuthority !== undefined) window.managerAuthority = savedData.managerAuthority;
            if (savedData.managerProfile) window.managerProfile = savedData.managerProfile;`;

content = content.replace(loadStr, loadReplacement);

fs.writeFileSync('js/save.js', content, 'utf8');
console.log('js/save.js patched for managerProfile');

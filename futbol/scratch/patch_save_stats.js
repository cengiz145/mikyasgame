const fs = require('fs');

let content = fs.readFileSync('js/save.js', 'utf8');

const saveStr = `            managerProfile: window.managerProfile || 'motivasyon_ustasi',`;
const saveReplacement = `            managerProfile: window.managerProfile || 'tarafsiz',
            managerStats: window.managerStats || { defensiveMinutes: 0, passingMinutes: 0, youngPlayerMinutes: 0, comebackWins: 0, crisisAvertedCount: 0 },`;

content = content.replace(saveStr, saveReplacement);

const loadStr = `            if (savedData.managerProfile) window.managerProfile = savedData.managerProfile;`;
const loadReplacement = `            if (savedData.managerProfile) window.managerProfile = savedData.managerProfile;
            if (savedData.managerStats) window.managerStats = savedData.managerStats;
            else window.managerStats = { defensiveMinutes: 0, passingMinutes: 0, youngPlayerMinutes: 0, comebackWins: 0, crisisAvertedCount: 0 };`;

content = content.replace(loadStr, loadReplacement);

fs.writeFileSync('js/save.js', content, 'utf8');
console.log('js/save.js patched for managerStats');

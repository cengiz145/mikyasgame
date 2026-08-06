const fs = require('fs');

let saveContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\save.js', 'utf8');

let targetSave = `            usedDynamicEvents: window.usedDynamicEvents || []
        };`;

let replaceSave = `            usedDynamicEvents: window.usedDynamicEvents || [],
            scoutProfile: window.scoutProfile || null,
            fitnessCoachProfile: window.fitnessCoachProfile || null,
            medicalProfile: window.medicalProfile || null,
            mentalCoachProfile: window.mentalCoachProfile || null,
            clubCultureProfile: window.clubCultureProfile || null
        };`;

let targetLoad = `            if (savedData.usedDynamicEvents) window.usedDynamicEvents = savedData.usedDynamicEvents;
            else window.usedDynamicEvents = [];`;

let replaceLoad = `            if (savedData.usedDynamicEvents) window.usedDynamicEvents = savedData.usedDynamicEvents;
            else window.usedDynamicEvents = [];
            
            if (savedData.scoutProfile) window.scoutProfile = savedData.scoutProfile;
            if (savedData.fitnessCoachProfile) window.fitnessCoachProfile = savedData.fitnessCoachProfile;
            if (savedData.medicalProfile) window.medicalProfile = savedData.medicalProfile;
            if (savedData.mentalCoachProfile) window.mentalCoachProfile = savedData.mentalCoachProfile;
            if (savedData.clubCultureProfile) window.clubCultureProfile = savedData.clubCultureProfile;`;

saveContent = saveContent.replace(targetSave, replaceSave);
saveContent = saveContent.replace(targetLoad, replaceLoad);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\save.js', saveContent, 'utf8');

console.log('Patch save.js applied successfully.');

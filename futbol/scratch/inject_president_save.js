const fs = require('fs');
let code = fs.readFileSync('js/save.js', 'utf8');

let targetSave = `            boardTrust: window.boardTrust,`;
let replaceSave = `            boardTrust: window.boardTrust,
            presidentProfile: window.presidentProfile,`;

let targetLoad = `            if (savedData.boardTrust !== undefined) window.boardTrust = savedData.boardTrust;`;
let replaceLoad = `            if (savedData.boardTrust !== undefined) window.boardTrust = savedData.boardTrust;
            if (savedData.presidentProfile !== undefined) window.presidentProfile = savedData.presidentProfile;`;

if (!code.includes('presidentProfile: window.presidentProfile')) {
    code = code.replace(targetSave, replaceSave);
    code = code.replace(targetLoad, replaceLoad);
    fs.writeFileSync('js/save.js', code, 'utf8');
    console.log("save.js updated!");
} else {
    console.log("save.js already updated!");
}

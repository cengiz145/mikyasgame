const fs = require('fs');

function patchFile(file, patches) {
    if (!fs.existsSync(file)) return;
    let text = fs.readFileSync(file, 'utf8');
    patches.forEach(p => {
        text = text.replace(p.regex, p.repl);
    });
    fs.writeFileSync(file, text);
    console.log('Patched ' + file);
}

patchFile('js/menu.js', [
    {
        regex: /document\.getElementById\('league-select-container'\)\.style\.display = 'none';\s*document\.getElementById\('tr-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('eng-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('it-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('es-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('de-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('fr-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('nl-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('br-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('pt-leagues'\)\.style\.display = 'none';\s*document\.getElementById\('country-select-container'\)\.style\.display = 'flex';/g,
        repl: `['league-select-container', 'tr-leagues', 'eng-leagues', 'it-leagues', 'es-leagues', 'de-leagues', 'fr-leagues', 'nl-leagues', 'br-leagues', 'pt-leagues'].forEach(id => { let el = document.getElementById(id); if (el) el.style.display = 'none'; });
        let csc = document.getElementById('country-select-container');
        if (csc) csc.style.display = 'flex';`
    },
    { regex: /document\.getElementById\('dynamic-event-title'\)\.innerHTML = /g, repl: 'if(document.getElementById(\'dynamic-event-title\')) document.getElementById(\'dynamic-event-title\').innerHTML = ' },
    { regex: /document\.getElementById\('dynamic-event-desc'\)\.innerHTML = /g, repl: 'if(document.getElementById(\'dynamic-event-desc\')) document.getElementById(\'dynamic-event-desc\').innerHTML = ' },
    { regex: /document\.getElementById\('dynamic-event-modal'\)\.style\.display = 'none';/g, repl: 'if(document.getElementById(\'dynamic-event-modal\')) document.getElementById(\'dynamic-event-modal\').style.display = \'none\';' }
]);

patchFile('js/manager.js', [
    { regex: /document\.getElementById\('player-selector-modal'\)\.style\.display = 'none';/g, repl: 'if(document.getElementById(\'player-selector-modal\')) document.getElementById(\'player-selector-modal\').style.display = \'none\';' }
]);

patchFile('js/facilities.js', [
    { regex: /document\.getElementById\('facility-modal'\)\.style\.display = /g, repl: 'if(document.getElementById(\'facility-modal\')) document.getElementById(\'facility-modal\').style.display = ' }
]);

patchFile('js/game.js', [
    { regex: /document\.getElementById\('player-profile-modal'\)\.style\.display = /g, repl: 'if(document.getElementById(\'player-profile-modal\')) document.getElementById(\'player-profile-modal\').style.display = ' }
]);

patchFile('js/press.js', [
    { regex: /document\.getElementById\('press-modal'\)\.style\.display = /g, repl: 'if(document.getElementById(\'press-modal\')) document.getElementById(\'press-modal\').style.display = ' }
]);

console.log('All patches applied.');

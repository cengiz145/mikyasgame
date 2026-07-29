const fs = require('fs');
const vm = require('vm');

let text = fs.readFileSync('js/game.js', 'utf8');
let lines = text.split('\n');

function checkSyntax(code) {
    try {
        new vm.Script(code);
        return true;
    } catch (e) {
        return false;
    }
}

// Bisect
let low = 0;
let high = lines.length;

// If we just add a '}' at the very end, does it fix it?
if (checkSyntax(text + '}')) {
    console.log("Adding a '}' fixes it!");
} else if (checkSyntax(text + '}}')) {
    console.log("Adding '}}' fixes it!");
} else {
    console.log("Adding '}' doesn't fix it. Something else is broken.");
}

const fs = require('fs');
const path = require('path');

const gamePath = path.join(__dirname, '..', 'js', 'game.js');
let gameContent = fs.readFileSync(gamePath, 'utf8');

const regex = /let ap = \(awayRoster\.length > i\) \? awayRoster\[i\] : \{ name: "Rakip "\+\(i\+1\), speed: 3\.0, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor', morale: 75 \};/g;

const replacement = `let ap = (awayRoster.length > i) ? awayRoster[i] : { name: "Rakip "+(i+1), speed: 3.0, tacticalRole: 'classic', mentalTrait: 'elite', power: (oppTeamData.power || 80), position: 'Bilinmiyor', morale: 75 };`;

gameContent = gameContent.replace(regex, replacement);

fs.writeFileSync(gamePath, gameContent, 'utf8');

console.log("game.js patched to fix generic bot power logic.");

const fs = require('fs');
const content = fs.readFileSync('transcript_extract.txt', 'utf8');
const regex = /<div id="game-container"[\s\S]*?<canvas id="game-canvas"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
const matches = content.match(regex);

if (matches && matches.length > 0) {
    fs.writeFileSync('recovered_game_container.txt', matches[0]);
    console.log('Saved ' + matches[0].length + ' bytes to recovered_game_container.txt');
} else {
    // try game-screen
    const regex2 = /<div id="game-screen"[\s\S]*?<canvas id="game-canvas"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    const matches2 = content.match(regex2);
    if (matches2 && matches2.length > 0) {
        fs.writeFileSync('recovered_game_container.txt', matches2[0]);
        console.log('Saved ' + matches2[0].length + ' bytes to recovered_game_container.txt from game-screen');
    } else {
        console.log('Not found');
    }
}

const fs = require('fs');
global.window = {
    addEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
    AudioContext: class {},
    CrowdForm: 1,
    teamPsychology: 'neutral',
    audioEngine: { masterGain: { gain: { value: 1 } }, ambiance: { volume: 1 } },
    innerWidth: 800,
    innerHeight: 500,
    currentFormation: '4-4-2',
    myTeamId: 'home',
    managerStats: { defensiveMinutes: 0, passingMinutes: 0, youngPlayerMinutes: 0, crisisAvertedCount: 0 }
};
global.document = {
    getElementById: () => ({ textContent: '', appendChild: () => {}, style: {}, addEventListener: () => {}, value: '' }),
    createElement: () => ({ style: {}, appendChild: () => {}, innerHTML: '', className: '' }),
    body: { appendChild: () => {} },
    addEventListener: () => {}
};
global.requestAnimationFrame = (cb) => { global.nextFrame = cb; };
global.setInterval = () => {};
global.clearInterval = () => {};
global.setTimeout = (cb) => { cb(); };
global.Math = Math;
global.Date = Date;

const gameCode = fs.readFileSync('js/game.js', 'utf8');
try {
    eval(gameCode);
    console.log('game.js evaluated successfully');
    
    // try to init and run
    initGame();
    console.log('initGame successful');
    
    // Mock canvas context
    global.canvas = { width: 800, height: 500 };
    global.ctx = {
        clearRect: () => {}, fillRect: () => {}, strokeRect: () => {},
        beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
        arc: () => {}, fill: () => {}, fillText: () => {}, setLineDash: () => {},
        save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {},
        drawImage: () => {}
    };
    
    gameLoop();
    console.log('gameLoop executed 1st time successful');
    
    // Simulate being at 81 minutes!
    global.timeLeft = 81;
    gameLoop();
    console.log('gameLoop executed at 81 minutes successful');
    
} catch (e) {
    console.log('ERROR:', e.stack || e);
}

const fs = require('fs');
global.window = {
    addEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
    AudioContext: class {},
    CrowdForm: 1,
    teamPsychology: 'neutral',
    audioEngine: { masterGain: { gain: { value: 1 } }, ambiance: { volume: 1 }, playGoalSound: () => {}, updateCrowdExcitement: () => {} },
    innerWidth: 800,
    innerHeight: 500,
    currentFormation: '4-4-2',
    myTeamId: 'home',
    managerStats: { defensiveMinutes: 0, passingMinutes: 0, youngPlayerMinutes: 0, crisisAvertedCount: 0 },
    announcerBrain: { watchPitch: () => {}, onShot: () => {} },
    speak: () => {}
};
global.document = {
    getElementById: () => ({ 
        textContent: '', 
        appendChild: () => {}, 
        style: {}, 
        addEventListener: () => {}, 
        value: '',
        getContext: () => ({
            clearRect: () => {}, fillRect: () => {}, strokeRect: () => {},
            beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
            arc: () => {}, fill: () => {}, fillText: () => {}, setLineDash: () => {},
            save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {},
            drawImage: () => {}
        })
    }),
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
global.Audio = class { play() { return { catch: () => {} }; } };

const gameCode = fs.readFileSync('js/game.js', 'utf8');
try {
    eval(gameCode);
    console.log('game.js evaluated successfully');
    
    // Setup data needed for gameLoop
    global.window.leagueData = { teams: [{id: 'home', players: []}, {id: 'away', players: []}] };
    global.homePlayers = [{name: 'p1', x: 400, y: 250, power: 80, speed: 3}];
    global.awayPlayers = [{name: 'p2', x: 500, y: 250, power: 80, speed: 3}];
    global.ball = { x: 400, y: 250, vx: 0, vy: 0, team: 'none' };
    global.gameActive = true;
    global.isPaused = false;
    global.playerScore = 0;
    global.enemyScore = 0;
    
    // Mock canvas context manually in case getElementById is weird
    global.canvas = { width: 800, height: 500 };
    global.ctx = document.getElementById('canvas').getContext('2d');
    
    gameLoop();
    console.log('gameLoop executed 1st time successful');
    
    // Simulate being at 81 minutes!
    global.timeLeft = 81;
    gameLoop();
    console.log('gameLoop executed at 81 minutes successful');
    
    global.window.CrowdForm = 4;
    gameLoop();
    console.log('gameLoop executed at 81 minutes with CrowdForm 4 successful');
    
} catch (e) {
    console.log('ERROR:', e.stack || e);
}

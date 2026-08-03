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
    announcerBrain: { watchPitch: () => {}, onShot: () => {}, onPass: () => {}, onHeader: () => {} },
    speak: () => {},
    leagueData: { teams: [{id: 'home', players: []}, {id: 'away', players: []}] }
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

let gameCode = fs.readFileSync('js/game.js', 'utf8');
let dataCode = fs.readFileSync('js/data.js', 'utf8');

gameCode += "\n\nglobal.gameLoopFunc = gameLoop;\nglobal.initGameFunc = initGame;\n";

eval(dataCode);
eval(gameCode);

try {
    global.window.playerTeamId = 'besiktas';
    global.homePlayers = [];
    global.awayPlayers = [];
    // Just force it by overriding the internal arrays if possible, but initGame does that.
    global.initGameFunc();
} catch (e) {
    // ignore init error
}

global.homePlayers = [{name: 'p1', x: 400, y: 250, power: 80, speed: 3}];
global.awayPlayers = [{name: 'p2', x: 500, y: 250, power: 80, speed: 3}];
global.allPlayers = [...global.homePlayers, ...global.awayPlayers];
global.ball = { x: 400, y: 250, vx: 0, vy: 0, team: 'none' };
global.gameActive = true;
global.isPaused = false;
global.playerScore = 0;
global.enemyScore = 0;
global.activePlayer = global.homePlayers[0];

global.canvas = { width: 800, height: 500 };
global.ctx = document.getElementById('canvas').getContext('2d');

try {
    global.timeLeft = 81;
    global.gameLoopFunc();
    console.log('gameLoop 81 successful');
    
    global.window.CrowdForm = 4;
    global.gameLoopFunc();
    console.log('gameLoop 81 with form 4 successful');
    
} catch (e) {
    console.log('RUNTIME ERROR IN GAMELOOP:', e.stack || e);
}

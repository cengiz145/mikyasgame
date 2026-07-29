const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(filePath, 'utf8');

// VAR Sistemini oyuna ekliyoruz
const varLogic = `
window.isVARCheckActive = false;

window.checkVAR = function(team) {
    if (window.isVARCheckActive) return; // Zaten VAR çalışıyorsa çık
    
    // Yüzde 15 ihtimalle VAR devreye girsin
    if (Math.random() < 0.15) {
        window.isVARCheckActive = true;
        isPaused = true;
        if(typeof speak === 'function') speak("Hakem VAR odasını dinliyor... Çok kritik bir an!");
        
        let announcerText = document.getElementById('announcer-text');
        if(announcerText) announcerText.textContent = "HAKEM VAR'I DİNLİYOR...";
        
        // UI Overlay
        let varOverlay = document.createElement('div');
        varOverlay.id = 'var-overlay';
        varOverlay.style.position = 'absolute';
        varOverlay.style.top = '50%';
        varOverlay.style.left = '50%';
        varOverlay.style.transform = 'translate(-50%, -50%)';
        varOverlay.style.background = 'rgba(0, 0, 0, 0.9)';
        varOverlay.style.color = '#f1c40f';
        varOverlay.style.padding = '30px';
        varOverlay.style.border = '5px solid #f1c40f';
        varOverlay.style.borderRadius = '10px';
        varOverlay.style.zIndex = '9999';
        varOverlay.style.fontSize = '3rem';
        varOverlay.style.fontWeight = 'bold';
        varOverlay.style.textAlign = 'center';
        varOverlay.innerHTML = '<i class="fas fa-video"></i> VAR İNCELEMESİ';
        
        let gameContainer = document.getElementById('game-container');
        if(gameContainer) gameContainer.appendChild(varOverlay);
        
        setTimeout(() => {
            // %50 ihtimalle gol iptal, %50 geçerli
            if (Math.random() < 0.5) {
                // Gol iptal
                if(team === 'home') window.playerScore--;
                else window.enemyScore--;
                
                varOverlay.innerHTML = '<i class="fas fa-times-circle" style="color:#e74c3c;"></i> GOL İPTAL!';
                varOverlay.style.color = '#e74c3c';
                varOverlay.style.borderColor = '#e74c3c';
                if(typeof speak === 'function') speak("İnanılmaz! Gol iptal edildi! Hakem ofsayt olduğunu belirtiyor.");
                if(announcerText) announcerText.textContent = "VAR KARARI: GOL İPTAL!";
                
                // Golü events tablosundan da silmek lazım (son eklenen golü siliyoruz)
                if (window.lastMatchGoalEvents && window.lastMatchGoalEvents.length > 0) {
                    window.lastMatchGoalEvents.pop();
                }
            } else {
                // Gol geçerli
                varOverlay.innerHTML = '<i class="fas fa-check-circle" style="color:#2ecc71;"></i> GOL GEÇERLİ!';
                varOverlay.style.color = '#2ecc71';
                varOverlay.style.borderColor = '#2ecc71';
                if(typeof speak === 'function') speak("Gol geçerli! VAR odasından onay geldi, santra yapılacak.");
                if(announcerText) announcerText.textContent = "VAR KARARI: GOL GEÇERLİ!";
            }
            
            updateScoreBoard();
            
            setTimeout(() => {
                if(varOverlay && varOverlay.parentNode) varOverlay.parentNode.removeChild(varOverlay);
                window.isVARCheckActive = false;
                isPaused = false;
            }, 3000);
            
        }, 5000); // 5 saniye VAR incelemesi sürer
    } else {
        // VAR yoksa normal skoru güncelle
        updateScoreBoard();
    }
};
`;

// Insert the VAR logic at the end of the file, or somewhere global.
// Let's add it before window.initGame = initGame;
content = content.replace(/window\.initGame = initGame;/, `${varLogic}\nwindow.initGame = initGame;`);

// Replace all playerScore++ ... updateScoreBoard(); with a VAR hook
// The pattern is usually: playerScore++; updateScoreBoard();
// But sometimes it's enemyScore++; updateScoreBoard();

// We need to match things like: playerScore++; updateScoreBoard(); 
content = content.replace(/playerScore\+\+;?\s*updateScoreBoard\(\);?/g, "window.playerScore++; window.checkVAR('home');");
content = content.replace(/enemyScore\+\+;?\s*updateScoreBoard\(\);?/g, "window.enemyScore++; window.checkVAR('away');");

// Let's also fix the local variables `playerScore` and `enemyScore` in `game.js` which might be let/var so we make sure we access window.playerScore.
// Actually, `playerScore` and `enemyScore` are likely global in `game.js` (declared at the top).
// Let's make sure they are accessible. `window.playerScore` will work if they are implicitly global. If they are declared with `let`, `window.playerScore` might not work.
// Let's check how they are declared.
const declarationsMatch = content.match(/let playerScore = 0;|var playerScore = 0;/);
if (declarationsMatch) {
    content = content.replace(/let playerScore = 0;/, "window.playerScore = 0;");
    content = content.replace(/let enemyScore = 0;/, "window.enemyScore = 0;");
    
    // Replace all existing local `playerScore` usage with `window.playerScore`
    content = content.replace(/\bplayerScore\b/g, "window.playerScore");
    content = content.replace(/\benemyScore\b/g, "window.enemyScore");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("VAR patch applied successfully to game.js.");

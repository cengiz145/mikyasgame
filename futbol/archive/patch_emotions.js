const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Clean duplicated bio and add emotions object to player init
    content = content.replace(/, bio: \{ adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 \}, bio: \{ adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 \}/g, 
        ', bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }, emotions: { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 }');
        
    content = content.replace(/hasYellowCard: false, bio: \{ adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 \} /g, 
        'hasYellowCard: false, bio: { adrenaline: 0, cortisol: 0, dopamine: 50, testosterone: 50, lacticAcid: 0 }, emotions: { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 } ');

    // 2. Add updateEmotions inside updateBiochemistry
    const biochemHook = /p\.mistakes = \(p\.mistakes \|\| 0\);\s*if \(p\.bio\.cortisol > 80 && Math\.random\(\) < 0\.2\) p\.mistakes\+\+;\s*\};/g;
    const emotionLogic = `p.mistakes = (p.mistakes || 0);
                    if (p.bio.cortisol > 80 && Math.random() < 0.2) p.mistakes++;
                    
                    // AŞAMA 84: Duygu Motoru Güncellemesi
                    if (!p.emotions) p.emotions = { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 };
                    
                    // Duyguların Doğal Erimesi
                    for (let key in p.emotions) {
                        if (key !== 'happiness') p.emotions[key] = Math.max(0, p.emotions[key] - 5);
                    }
                    
                    // Hormonlardan Duygulara Geçiş
                    if (p.bio.cortisol > 60) p.emotions.fear = Math.min(100, p.emotions.fear + 10);
                    if (p.bio.testosterone > 70 && p.bio.dopamine < 40) p.emotions.anger = Math.min(100, p.emotions.anger + 10);
                    if (p.bio.dopamine > 80) p.emotions.happiness = Math.min(100, p.emotions.happiness + 5);
                    else p.emotions.happiness = Math.max(0, p.emotions.happiness - 1);
                    
                    if (window.CrowdForm === 5) p.emotions.sadness = 100; // Ruhsuzluk evresinde tam çöküş
                    if (p.isJealous) p.emotions.disgust = Math.min(100, p.emotions.disgust + 20); // İğrenme/Tahammülsüzlük
                };`;
                
    if (content.match(biochemHook)) {
        content = content.replace(biochemHook, emotionLogic);
    } else {
        console.log("Could not find biochem hook for emotions.");
    }
    
    // 3. Add movement modifiers inside gameLoop for homePlayers
    const gameLoopHomeMovementHook = /let spd = p\.speed;/g;
    const emotionMovementLogic = `let spd = p.speed;
          if (!p.emotions) p.emotions = { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 };
          
          // AŞAMA 85: Duyguların Sahaya Yansıması (Fiziksel Hareket)
          if (p.emotions.fear > 80 && ball.team !== 'home') {
              // Korku: Rakibin arkasına saklanma / Toptan kaçma
              p.x += (p.x > 400 ? 1 : -1) * 1.5;
              spd *= 0.5;
          }
          if (p.emotions.anger > 80 && ball.team !== 'home' && !p.isRedCarded) {
              // Öfke: Şuursuz pres, pozisyonunu kaybeder
              target = {x: ball.x, y: ball.y};
              spd *= 1.2; 
          }
          if (p.emotions.sadness > 80) {
              // Üzüntü: Omuzlar düşer, koşmaz
              spd *= 0.5;
          }
          if (p.emotions.disgust > 80 && ball.team !== 'home') {
              // İğrenme: Geri dönmeyi reddeder, isyan eder
              spd *= 0.1;
          }`;
          
    // Replace the very first match (which is inside homePlayers loop)
    let replacedHome = false;
    content = content.replace(/let spd = p\.speed;/g, function(match, offset, string) {
        if (!replacedHome) {
            replacedHome = true;
            return emotionMovementLogic;
        }
        return match;
    });

    // Replace the second match (which is inside awayPlayers loop)
    let replacedAway = false;
    const emotionMovementLogicAway = `let spd = ap.speed;
          if (!ap.emotions) ap.emotions = { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 };
          
          if (ap.emotions.fear > 80 && ball.team !== 'away') {
              ap.x += (ap.x > 400 ? -1 : 1) * 1.5;
              spd *= 0.5;
          }
          if (ap.emotions.anger > 80 && ball.team !== 'away' && !ap.isRedCarded) {
              targetA = {x: ball.x, y: ball.y};
              spd *= 1.2; 
          }
          if (ap.emotions.sadness > 80) spd *= 0.5;
          if (ap.emotions.disgust > 80 && ball.team !== 'away') spd *= 0.1;`;
          
    // To properly replace `let spd = ap.speed;`, let's do a direct replace
    content = content.replace(/let spd = ap\.speed;/g, emotionMovementLogicAway);

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - 6 Temel Duygu Motoru başarıyla entegre edildi.");
} else {
    console.log("game.js bulunamadı!");
}

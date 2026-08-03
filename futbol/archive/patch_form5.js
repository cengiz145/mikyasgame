const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Update form conditions to include Form 5
    const patienceHook = /if \(patience < 50\) \{\s*newForm = 4;/g;
    const newPatience = `if (patience < 20 && window.currentWeek >= 10) {
        newForm = 5; // Ruhsuz Kabulleniş (Umursamazlık)
    } else if (patience < 50) {
        newForm = 4;`;
    if (content.match(patienceHook) && !content.includes('newForm = 5; // Ruhsuz Kabulleniş')) {
        content = content.replace(patienceHook, newPatience);
    }

    const clampHook = /if \(newForm > 4\) newForm = 4;/g;
    const newClamp = `if (newForm > 5) newForm = 5;`;
    content = content.replace(clampHook, newClamp);
    
    const formNamesHook = /"TRİBÜN FORMU 4: TOKSİK İSYAN"\];/g;
    const newFormNames = `"TRİBÜN FORMU 4: TOKSİK İSYAN", "TRİBÜN FORMU 5: RUHSUZ KABULLENİŞ"];`;
    content = content.replace(formNamesHook, newFormNames);

    // 2. Add Form 5 mechanics to match timer
    const updateCrowdFormCallHook = /if \(typeof window\.updateCrowdForm === 'function'\) window\.updateCrowdForm\(\);/g;
    const newUpdateCall = `if (typeof window.updateCrowdForm === 'function') window.updateCrowdForm();
                
                // AŞAMA 77: Form 5 (Umursamazlık Paradoksu)
                if (window.CrowdForm === 5) {
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.1; // Sadece uğultu/sohbet sesi
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => { 
                            p.speed = (p.baseSpeed || 3) * 0.7; // Antrenman temposu
                            p.power = Math.min(p.power || 50, 30); // Vuracak şevk yok
                            p.mistakes = 0; // Baskı hissetmedikleri için panik de yok
                        });
                    }
                }`;
    if (content.match(updateCrowdFormCallHook) && !content.includes('AŞAMA 77: Form 5')) {
        content = content.replace(updateCrowdFormCallHook, newUpdateCall);
    }

    // 3. Ironic applause on conceding a goal
    const goalConcededHook = /if \(window\.CrowdForm === 4 && Math\.random\(\) < 0\.15\)/g;
    const ironicApplause = `if (window.CrowdForm === 5 && Math.random() < 0.6) {
                        if (window.AudioManager) {
                            let clap = new Audio('sounds/cheer.ogg');
                            clap.volume = 0.2;
                            clap.play().catch(e=>{});
                        }
                        if(typeof speak === 'function') speak("Top ağlarda. Ama stadyumda hiçbir tepki, hiçbir ıslık yok. Aksine taraftarlar çekirdek çitleyerek yenen bu golü alaycı bir şekilde, hafifçe alkışlıyorlar. Kulüp için acınası bir kabulleniş anı.");
                    } else if (window.CrowdForm === 4 && Math.random() < 0.15)`;
    if (content.match(goalConcededHook) && !content.includes('window.CrowdForm === 5 && Math.random() < 0.6')) {
        content = content.replace(goalConcededHook, ironicApplause);
    }
    
    // Silence chant check if Form 5
    const chantHook = /if \(sA \- sB >= 2 \|\| \(timeLeft <= 15 && sA > sB\)\) \{/g;
    const noChantForm5 = `if (window.CrowdForm < 5 && (sA - sB >= 2 || (timeLeft <= 15 && sA > sB))) {`;
    content = content.replace(chantHook, noChantForm5);

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Form 5: Ruhsuz Kabulleniş eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Update Crowd Form Logic
    const oldCrowdFormHook = /window\.CrowdForm = 1;\s*window\.updateCrowdForm = function\(\) \{[\s\S]*?let playerScore = 0;/;
    
    const newCrowdFormCode = `
window.CrowdForm = 1;
window.currentWeek = window.currentWeek || 1;

window.updateCrowdForm = function() {
    if (typeof playerScore === 'undefined' || typeof enemyScore === 'undefined') return;
    
    let diff = enemyScore - playerScore;
    let newForm = 1;
    
    // Makro-Tribün Psikolojisi (Haftalar ilerledikçe Sabır Tükenir)
    // Sezon başı kredisi: (100 üzerinden) her hafta azalır. 
    // Toplam Sabır (Patience) = managerAuthority + Sezon Kredisi
    let seasonCredit = Math.max(0, 100 - (window.currentWeek * 5)); // Her hafta 5 kredi düşer (20 haftada biter)
    let patience = (window.managerAuthority || 100) + seasonCredit;

    // Sabır puanına göre ana form belirleniyor
    if (patience < 50) {
        newForm = 4; // Toksik İsyan (Otorite yerle bir, kredi bitmiş)
    } else if (patience < 100) {
        newForm = 3; // Yıkılan Kale
    } else if (patience < 160) {
        newForm = 2; // Taktiksel Homurdanma
    } else {
        newForm = 1; // Romantik İyimserlik (Koşulsuz Kalkan)
    }

    // Maç içi dinamikler (Skor) bu 'Ana Formu' anlık olarak esnetebilir
    if (diff >= 3 && newForm < 4) newForm += 1; // 3 fark yenirse taraftar 1 kademe daha delirir
    if (diff < 0 && newForm > 1) newForm -= 1;  // Öne geçerse taraftar 1 kademe sakinleşir

    // Sınırlandırmalar
    if (newForm > 4) newForm = 4;
    if (newForm < 1) newForm = 1;
    
    // Gerçekçilik Kilidi: Stadyum ilk haftalardan ateşe verilmez (Form 4 için en az 4 hafta geçmeli)
    if (newForm === 4 && window.currentWeek <= 3) newForm = 3;

    if (window.CrowdForm !== newForm) {
        window.CrowdForm = newForm;
        if (typeof announcerText !== 'undefined') {
            let formNames = ["", "TRİBÜN FORMU 1: ROMANTİK İYİMSERLİK", "TRİBÜN FORMU 2: TAKTİKSEL HOMURDANMA", "TRİBÜN FORMU 3: YIKILAN KALE (TRAVMA)", "TRİBÜN FORMU 4: TOKSİK İSYAN"];
            announcerText.textContent = "HAFTA " + window.currentWeek + " | " + formNames[newForm];
        }
    }
};
let playerScore = 0;`;

    if (content.match(oldCrowdFormHook)) {
        content = content.replace(oldCrowdFormHook, newCrowdFormCode);
    } else {
        console.log("Hook for updateCrowdForm not found. Trying fallback...");
        // Fallback replacement if regex failed slightly
        content = content.replace(/window\.updateCrowdForm = function\(\) \{[\s\S]*?let playerScore = 0;/, newCrowdFormCode.replace('window.CrowdForm = 1;\nwindow.currentWeek = window.currentWeek || 1;\n\n', ''));
    }

    // 2. Increment Week on Game End
    const endGameHook = /gameActive = false;/g;
    const incrementWeekCode = `gameActive = false;
      window.currentWeek = (window.currentWeek || 1) + 1;`;
    
    if (content.match(endGameHook) && !content.includes('window.currentWeek = (window.currentWeek || 1) + 1;')) {
        content = content.replace(endGameHook, incrementWeekCode);
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Tribün Evrimi sezona yayıldı (Hafta mekaniği eklendi).");
} else {
    console.log("game.js bulunamadı!");
}

const fs = require('fs');
const path = require('path');

const transferPath = path.join(__dirname, '..', 'js', 'transfer.js');
let content = fs.readFileSync(transferPath, 'utf8');

// The line we want to replace is: let initialDemand = Math.floor(basePrice * surcharge);
const oldDemandRegex = /let initialDemand = Math\.floor\(basePrice \* surcharge\);/m;

const newDemandLogic = `
    let initialDemand = Math.floor(basePrice * surcharge);
    
    // [YENİ] Serbest Oyuncu (Free Agent) Kaprisi
    if (player.teamId === 'free_agent') {
        initialDemand = Math.floor(initialDemand * 1.30); // Bonservis yok, o yüzden maaş/imza parası %30 fazla!
        initialSpeech = "Serbest Statü Oyuncusu / Menajeri: Bonservisim elimde, kulübüm yok. O yüzden bana ödemeniz gereken tek şey devasa bir imza parası. Rakam aşağıdadır, kabul ediyorsanız hemen imzalayalım.";
    }
`;

content = content.replace(oldDemandRegex, newDemandLogic.trim());
fs.writeFileSync(transferPath, content, 'utf8');
console.log("Free Agent wage negotiation logic fixed in transfer.js");

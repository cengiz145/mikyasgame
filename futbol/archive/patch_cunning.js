const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // Hedef Blok:
    // homePlayers.forEach(hp => {
    //     if (hp !== closestHome.p) {
    //         hp.isJealous = true;
    //         hp.power = (hp.power || 50) * 0.7; // Hiyerarşi çöküşü
    //     }
    // });
    
    const hook = /homePlayers\.forEach\(hp => \{\s*if \(hp !== closestHome\.p\) \{\s*hp\.isJealous = true;\s*hp\.power = \(hp\.power \|\| 50\) \* 0\.7; \/\/ Hiyerarşi çöküşü\s*\}\s*\}\);/g;
    
    const newCode = `// Takım içi ihanet ve kıskançlık (Sadece kurnaz/zeki futbolcular bunu algılayıp cephe alır)
                         homePlayers.forEach(hp => {
                             if (hp !== closestHome.p) {
                                 // Kurnazlık (Oyun zekası / tecrübe) özelliği:
                                 let isCunning = hp.isTier2 || hp.isTier3 || Math.random() < 0.35; 
                                 if (isCunning) {
                                     hp.isJealous = true;
                                     hp.power = (hp.power || 50) * 0.7; // Hiyerarşi çöküşü
                                 }
                             }
                         });`;
                         
    if (content.match(hook)) {
        content = content.replace(hook, newCode);
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Kurnaz futbolcu (Jealousy) mekaniği eklendi.");
    } else {
        console.log("Hook bulunamadı!");
    }
} else {
    console.log("game.js bulunamadı!");
}

const fs = require('fs');
let code = fs.readFileSync('js/press.js', 'utf8');

// Sakatlık mantığını koddan tamamen temizle
code = code.replace(/if \(questionOption\.effect\.injuryRisk[\s\S]*?\}\n    \}/m, `
    if (questionOption.effect.injuryRisk) {
        // Sakatlık mekaniği görme engelli kullanıcı için iptal edildi. 
        // Bunun yerine Tesis Hasar Bedeli kesiliyor.
        if (window.userTeam && window.userTeam.budget !== undefined) {
            let damageCost = 0.2; // 200.000 Euro
            window.userTeam.budget -= damageCost;
            if (window.userTeam.budget < 0) window.userTeam.budget = 0;
            penaltyText += \`<br><span style="color: #c0392b; font-weight:bold;">ŞOK BİLGİ: Taraftar tesisleri savaş alanına çevirdi! 200.000 € hasar bedeli kulübün kasasından çıktı.</span>\`;
        }
    }
`);

// Mesajlardaki sakatlık uyarılarını Tesis Hasarı ile değiştir
code = code.replace(/1 oyuncu sakatlandı!/g, "200.000€ tesis hasarı oluştu!");
code = code.replace(/1 oyuncu yaralandı\./g, "200.000€ tesis hasarı oluştu.");

fs.writeFileSync('js/press.js', code, 'utf8');
console.log('Injury mechanics removed and replaced with facility damage.');

const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

let target = `    if (isSuccess) {
        // Satın alma işlemini tamamla
        buyPlayer(window.currentNegotiationPlayer, finalPrice);
    } else {
        if (!isVoluntary) {
            window.currentNegotiationPlayer.negotiationFailed = true;
        }`;

let replacement = `    if (isSuccess) {
        // Küresel Duyumcu (Fabrizio Romano Stili) Olayı
        // Eğer yıldız bir oyuncuysa veya rastgele şans (%40) tutarsa resmi açıklamadan önce duyumcu patlatır.
        if (window.currentNegotiationPlayer.power >= 78 && Math.random() < 0.5) {
            let myTeamName = window.league ? window.league.userTeamId.toUpperCase() : window.myTeamId.toUpperCase();
            let msg = \`🚨 TRANSFER İSTİHBARATI (Küresel Duyumcu) 🚨\\n\\n📱 [X] @GlobalInsider:\\n"\${window.currentNegotiationPlayer.name} to \${myTeamName}... HERE WE GO! ⌛️🤝\\n\\nAz önce menajerleriyle Whatsapp üzerinden teyit ettim. Taraflar el sıkıştı, belgeler az önce imzalandı. Resmi açıklama yakında. Bitti bu iş!"\`;
            alert(msg);
        }
        // Satın alma işlemini tamamla
        buyPlayer(window.currentNegotiationPlayer, finalPrice);
    } else {
        if (!isVoluntary) {
            // Görüşme Çökerse Duyumcu Sızdırması
            if (window.currentNegotiationPlayer.power >= 82 && Math.random() < 0.5) {
                let myTeamName = window.league ? window.league.userTeamId.toUpperCase() : window.myTeamId.toUpperCase();
                let msg = \`🚨 ÖZEL HABER (Küresel Duyumcu) 🚨\\n\\n📱 [X] @GlobalInsider:\\n"ÖZEL BİLGİ: \${window.currentNegotiationPlayer.name} - \${myTeamName} görüşmeleri ÇÖKTÜ! ❌ Menajerler masadan sinirle kalktı. Anlaşma an itibarıyla tamamen iptal edildi."\`;
                alert(msg);
            }
            window.currentNegotiationPlayer.negotiationFailed = true;
        }`;

content = content.replace(target, replacement);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch global insider applied successfully.');

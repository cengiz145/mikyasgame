const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// 1. Assign "efsane" profile
let target1 = `        if (!window.sportingDirectorProfile) {
            window.sportingDirectorProfile = Math.random() < 0.5 ? "tuccar" : "analitik"; 
        }`;

let replacement1 = `        if (!window.sportingDirectorProfile) {
            let r = Math.random();
            window.sportingDirectorProfile = r < 0.33 ? "tuccar" : (r < 0.66 ? "analitik" : "efsane");
        }`;

content = content.replace(target1, replacement1);

// 2. Add Paratoner logic in isLoss
let target2 = `    if (isLoss) {
        window.consecutiveLosses++;
        window.consecutiveWins = 0; // Galibiyet serisini sıfırla
        if (isHeavyDefeat) {
            window.managerAuthority -= 15;
            window.presidentConfidence -= 20;
            if(typeof speak === 'function') setTimeout(() => speak("Yönetim kurulu bu hezimetin ardından acil toplanma kararı alabilir. Başkan ve taraftar çok öfkeli."), 3000);
        } else if (window.consecutiveLosses >= 3) {
            window.managerAuthority -= 10;
            window.presidentConfidence -= 15;
            if(typeof speak === 'function') setTimeout(() => speak("Peş peşe gelen mağlubiyetler hocanın koltuğunu sallamaya başladı. Takım çöküşte."), 3000);
        } else {
            window.managerAuthority -= 5;
            window.presidentConfidence -= 5;
        }`;

let replacement2 = `    if (isLoss) {
        window.consecutiveLosses++;
        window.consecutiveWins = 0; // Galibiyet serisini sıfırla
        
        // YENİ: Paratoner Efsane (Sportif Direktör)
        let isParatonerActive = false;
        if (window.sportingDirectorProfile === "efsane" && Math.random() < 0.50) {
            isParatonerActive = true;
        }

        if (isHeavyDefeat) {
            let authLoss = isParatonerActive ? 5 : 15;
            let confLoss = isParatonerActive ? 5 : 20;
            window.managerAuthority -= authLoss;
            window.presidentConfidence -= confLoss;
            if (isParatonerActive) {
                if(typeof speak === 'function') setTimeout(() => speak("Büyük hezimet yaşandı ancak kulüp efsanesi olan sportif direktör faturayı üzerine alarak basını yatıştırdı."), 3000);
                setTimeout(() => alert("🛡️ PARATONER DEVREDE! (Vitrin Süsü)\\n\\nSahadaki ağır hezimetten sonra taraftar size isyan edecekken, kulübün efsanesi olan sportif direktörünüz kameraların karşısına geçti ve tüm suçu üstlendi.\\n\\nEfsaneye olan saygılarından dolayı taraftarın öfkesi dindi. Otorite kaybınız minimumda kaldı!"), 6000);
            } else {
                if(typeof speak === 'function') setTimeout(() => speak("Yönetim kurulu bu hezimetin ardından acil toplanma kararı alabilir. Başkan ve taraftar çok öfkeli."), 3000);
            }
        } else if (window.consecutiveLosses >= 3) {
            let authLoss = isParatonerActive ? 0 : 10;
            let confLoss = isParatonerActive ? 0 : 15;
            window.managerAuthority -= authLoss;
            window.presidentConfidence -= confLoss;
            if (isParatonerActive) {
                if(typeof speak === 'function') setTimeout(() => speak("Peş peşe mağlubiyetler gelse de sportif direktörün varlığı şimdilik suları durultuyor."), 3000);
                setTimeout(() => alert("🛡️ PARATONER DEVREDE! (Vitrin Süsü)\\n\\nÜst üste alınan yenilgiler başkanı istifa noktasına getirdi. Ancak sportif direktörünüz (eski efsane) taraftarla bizzat görüşerek onlardan sabır istedi.\\n\\nBu sayede koltuğunuz güvende kaldı, otorite kaybetmediniz!"), 6000);
            } else {
                if(typeof speak === 'function') setTimeout(() => speak("Peş peşe gelen mağlubiyetler hocanın koltuğunu sallamaya başladı. Takım çöküşte."), 3000);
            }
        } else {
            let authLoss = isParatonerActive ? 0 : 5;
            let confLoss = isParatonerActive ? 0 : 5;
            window.managerAuthority -= authLoss;
            window.presidentConfidence -= confLoss;
        }`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch sporting director efsane applied successfully.');

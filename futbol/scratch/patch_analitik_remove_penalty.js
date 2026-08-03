const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// Remove managerAuthority penalty from substitution
let target1 = `                    if(typeof speak === 'function') speak("Yeni nesil analitik taraftarlar bu değişikliğe sosyal medyadan anında tepki verdi! 'Isı haritası gayet iyiydi, asimetrik beki neden oyundan aldı?' diyerek hocayı eleştiriyorlar.");
                    window.managerAuthority = Math.max(0, window.managerAuthority - 5);`;

let replacement1 = `                    if(typeof speak === 'function') speak("Yeni nesil analitik taraftarlar bu değişikliğe sosyal medyadan anında tepki verdi! 'Isı haritası gayet iyiydi, asimetrik beki neden oyundan aldı?' diyerek hocayı eleştiriyorlar.");`;

content = content.replace(target1, replacement1);

// Remove managerAuthority penalty from end match
let target2 = `        setTimeout(() => {
            if(typeof speak === 'function') speak("Analitik taraftarlar maç sonu açıklamalarınızı istatistiksel açıdan yetersiz buldu. xG ve yarım alan (half-space) kullanımlarından bahsetmediğiniz için sosyal medyada eleştiriliyorsunuz.");
            window.managerAuthority = Math.max(0, window.managerAuthority - 5);
        }, 6500);`;

let replacement2 = `        setTimeout(() => {
            if(typeof speak === 'function') speak("Analitik taraftarlar maç sonu açıklamalarınızı istatistiksel açıdan yetersiz buldu. xG ve yarım alan (half-space) kullanımlarından bahsetmediğiniz için sosyal medyada kendi aralarında tartışıyorlar.");
        }, 6500);`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Authority penalties removed successfully.');

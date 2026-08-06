const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

// The logic to replace:
// We want to remove the setTimeout block that shows the alert, speak, and dailyNewsText
const searchStr = `        // Evrim Haberi Gösterimi
        setTimeout(() => {
            if (typeof speak === 'function') speak("Tebrikler! Oyun tarzındaki değişim sayesinde medyanın sana taktığı yeni bir lakap var!");
            
            let dailyNewsText = document.getElementById('daily-news-text');
            if (dailyNewsText) {
                dailyNewsText.innerHTML = "<b>" + title + "</b> " + desc;
            }
            alert("🌟 OYUN ANLAYIŞIN EVRİMLEŞTİ 🌟\\n\\n" + title + "\\n\\n" + desc);
            
            if (typeof saveGame === 'function') saveGame(true);
        }, 1000);`;

const replacementStr = `        // Evrim tamamen sessiz gerçekleşir (Kullanıcı kendi tarzını biliyor)
        if (typeof saveGame === 'function') saveGame(true);`;

content = content.replace(searchStr, replacementStr);

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('js/menu.js patched to make evolution silent');

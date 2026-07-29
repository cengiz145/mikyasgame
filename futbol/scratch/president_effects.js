const fs = require('fs');

// 1. index.html Güncellemesi
let html = fs.readFileSync('index.html', 'utf8');

const oldHtmlBtn1 = `onclick="window.closePresidentBriefing()">"Merak etmeyin Başkanım, şampiyonluk için savaşacağız."</button>`;
const newHtmlBtn1 = `onclick="window.closePresidentBriefing('ambitious')">"Merak etmeyin Başkanım, şampiyonluk için savaşacağız."</button>`;

const oldHtmlBtn2 = `onclick="window.closePresidentBriefing()">"Bütçemizi dikkatli kullanıp takımı adım adım büyüteceğiz."</button>`;
const newHtmlBtn2 = `onclick="window.closePresidentBriefing('cautious')">"Bütçemizi dikkatli kullanıp takımı adım adım büyüteceğiz."</button>`;

const oldHtmlBtn3 = `onclick="window.closePresidentBriefing()">"Taraftarımızla birlikte bu sezon destan yazacağız!"</button>`;
const newHtmlBtn3 = `onclick="window.closePresidentBriefing('motivational')">"Taraftarımızla birlikte bu sezon destan yazacağız!"</button>`;

html = html.replace(oldHtmlBtn1, newHtmlBtn1);
html = html.replace(oldHtmlBtn2, newHtmlBtn2);
html = html.replace(oldHtmlBtn3, newHtmlBtn3);

fs.writeFileSync('index.html', html, 'utf8');


// 2. js/menu.js Güncellemesi
let js = fs.readFileSync('js/menu.js', 'utf8');

const oldJsFunc = `window.closePresidentBriefing = function() {
    document.getElementById('president-briefing-modal').style.display = 'none';
    document.getElementById('main-menu-container').style.display = 'flex';
    if(typeof speak === 'function') speak("Kariyeriniz başladı. Başarılar dileriz.");
    if (typeof window.SponsorManager !== 'undefined') {
        setTimeout(() => window.SponsorManager.showSponsorModal(), 500);
    }
};`;

// Regex ile daha esnek yakalamaya çalışalım eğer tam eşleşmezse
const oldJsRegex = /window\.closePresidentBriefing = function\(\) \{[\s\S]*?showSponsorModal\(\), 500\);\s*\}\s*\};\s*/;

const newJsFunc = `window.closePresidentBriefing = function(choice) {
    if (!window.presidentConfidence) window.presidentConfidence = 50;
    if (!window.managerAuthority) window.managerAuthority = 50;

    if (choice === 'ambitious') {
        window.presidentConfidence = Math.min(100, window.presidentConfidence + 5);
        window.managerAuthority = Math.min(100, window.managerAuthority + 10);
        if(typeof speak === 'function') speak("Başkan özgüvenini takdir etti. Otoriten arttı. Kariyeriniz başladı.");
    } else if (choice === 'cautious') {
        window.presidentConfidence = Math.min(100, window.presidentConfidence + 15);
        if(typeof speak === 'function') speak("Başkan mali disiplinini takdir etti. Başkana kendini çok sevdirdin. Kariyeriniz başladı.");
    } else if (choice === 'motivational') {
        window.managerAuthority = Math.min(100, window.managerAuthority + 15);
        if(typeof speak === 'function') speak("Taraftar ve oyuncular bu tutkundan çok etkilendi. Otoriten ciddi arttı. Kariyeriniz başladı.");
    } else {
        if(typeof speak === 'function') speak("Kariyeriniz başladı. Başarılar dileriz.");
    }

    if (typeof updateStatusBar === 'function') updateStatusBar();
    if (typeof saveGame === 'function') saveGame(true);

    document.getElementById('president-briefing-modal').style.display = 'none';
    document.getElementById('main-menu-container').style.display = 'flex';
    
    if (typeof window.SponsorManager !== 'undefined') {
        setTimeout(() => window.SponsorManager.showSponsorModal(), 500);
    }
};
`;

if (js.includes('window.closePresidentBriefing = function() {')) {
    js = js.replace(/window\.closePresidentBriefing = function\(\) \{[\s\S]*?showSponsorModal\(\), 500\);\s*\n?\s*\};/, newJsFunc);
    fs.writeFileSync('js/menu.js', js, 'utf8');
    console.log("Updated js/menu.js successfully");
} else {
    console.log("Could not find exact function block in js/menu.js");
}

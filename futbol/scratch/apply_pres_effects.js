const fs = require('fs');

let js = fs.readFileSync('js/menu.js', 'utf8');

const oldLogicRegex = /window\.closePresidentBriefing = function\(choice\) \{[\s\S]*?showSponsorModal\(\), 500\);\s*\n?\s*\};/;

const newLogic = `window.closePresidentBriefing = function(choice) {
    if (!window.presidentConfidence) window.presidentConfidence = 50;
    if (!window.managerAuthority) window.managerAuthority = 50;

    let profile = window.presidentProfile || 'project';
    let confChange = 0;
    let authChange = 0;
    let feedback = "";

    if (choice === 'ambitious') {
        if (profile === 'populist') { confChange = 15; authChange = 10; feedback = "Popülist başkan iddialı konuşmanı çok sevdi!"; }
        else if (profile === 'corporate') { confChange = -5; feedback = "Teknokrat başkan boş vaatleri sevmez, bilançoya bakar. Güveni düştü."; }
        else if (profile === 'project') { confChange = -5; feedback = "Proje odaklı başkan aceleci hedeflerden hoşlanmadı. Sakin olmalısın."; }
        else if (profile === 'dictator') { confChange = 5; authChange = 5; feedback = "Müdahaleci başkan hırsını takdir etti ama tetikte."; }
        else { confChange = 5; authChange = 5; feedback = "Sessiz başkan onayladı. Otoriten arttı."; }
    } else if (choice === 'cautious') {
        if (profile === 'populist') { confChange = -10; feedback = "Popülist başkan bütçe hesabını sıkıcı buldu. O yıldız istiyor!"; }
        else if (profile === 'corporate') { confChange = 20; authChange = 5; feedback = "Şirketçi başkan mali disiplinini takdir etti! Güveni tavan yaptı."; }
        else if (profile === 'project') { confChange = 10; feedback = "Proje odaklı başkan akılcı yaklaşımını destekliyor."; }
        else if (profile === 'dictator') { confChange = 5; feedback = "Başkan temkinli olmanı onayladı."; }
        else { confChange = 10; feedback = "Sessiz başkan para istememeni sevdi. Güveni arttı."; }
    } else if (choice === 'motivational') {
        if (profile === 'populist') { confChange = 20; authChange = 10; feedback = "Popülist başkan taraftar vurgusuna bayıldı! Güveni çok arttı."; }
        else if (profile === 'corporate') { confChange = -5; feedback = "Şirketçi başkan taraftar edebiyatını umursamıyor. Finansal hedeflere odaklan."; }
        else if (profile === 'project') { confChange = 5; authChange = 5; feedback = "Takım moralini yükseltmen desteklendi."; }
        else if (profile === 'dictator') { confChange = -10; feedback = "Tek adam taraftarı değil, KENDİSİNİ övmeni bekliyordu. Güveni sarsıldı!"; }
        else { authChange = 10; feedback = "Taraftar ve takım sana inandı. Otoriten arttı."; }
    } else {
        feedback = "Kariyeriniz başladı. Başarılar dileriz.";
    }

    window.presidentConfidence = Math.min(100, Math.max(0, window.presidentConfidence + confChange));
    window.managerAuthority = Math.min(100, Math.max(0, window.managerAuthority + authChange));

    if(typeof speak === 'function') speak(feedback);

    if (typeof updateStatusBar === 'function') updateStatusBar();
    if (typeof saveGame === 'function') saveGame(true);

    document.getElementById('president-briefing-modal').style.display = 'none';
    document.getElementById('main-menu-container').style.display = 'flex';
    
    if (typeof window.SponsorManager !== 'undefined') {
        setTimeout(() => window.SponsorManager.showSponsorModal(), 500);
    }
};`;

if (js.match(oldLogicRegex)) {
    js = js.replace(oldLogicRegex, newLogic);
    fs.writeFileSync('js/menu.js', js, 'utf8');
    console.log('Updated js/menu.js successfully for dynamic choice effects');
} else {
    console.log('Could not find logic block in js/menu.js');
}

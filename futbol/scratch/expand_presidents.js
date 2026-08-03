const fs = require('fs');

// 1. UPDATE LEAGUE.JS
let leagueJs = fs.readFileSync('js/league.js', 'utf8');

const oldLogicRegex = /\/\/ --- BAŞKAN PROFİLİ BELİRLEME \(Weighted Random\) ---[\s\S]*?else document\.getElementById\('president-briefing-modal'\)\.focus\(\);\s*\}/;

const newLogic = `
    // --- BAŞKAN PROFİLİ BELİRLEME (10 Profil - Bütçesel Ağırlıklı) ---
    if (!window.presidentProfile) {
        let budget = window.userTeam ? window.userTeam.budget : 20;
        let rand = Math.random();
        
        if (budget >= 40) {
            // Büyük Takımlar (Oligark ve Politik eklendi)
            if (rand < 0.25) window.presidentProfile = 'populist';
            else if (rand < 0.45) window.presidentProfile = 'oligarch';
            else if (rand < 0.65) window.presidentProfile = 'political';
            else if (rand < 0.85) window.presidentProfile = 'dictator';
            else if (rand < 0.95) window.presidentProfile = 'corporate';
            else window.presidentProfile = 'project';
        } else if (budget >= 20) {
            // Orta Takımlar
            if (rand < 0.2) window.presidentProfile = 'corporate';
            else if (rand < 0.4) window.presidentProfile = 'silent';
            else if (rand < 0.6) window.presidentProfile = 'political';
            else if (rand < 0.8) window.presidentProfile = 'fanatic';
            else if (rand < 0.9) window.presidentProfile = 'project';
            else window.presidentProfile = 'populist';
        } else {
            // Küçük Takımlar (Kurtarıcı ve Misyoner eklendi)
            if (rand < 0.3) window.presidentProfile = 'savior';
            else if (rand < 0.5) window.presidentProfile = 'missionary';
            else if (rand < 0.7) window.presidentProfile = 'fanatic';
            else if (rand < 0.85) window.presidentProfile = 'project';
            else if (rand < 0.95) window.presidentProfile = 'silent';
            else window.presidentProfile = 'dictator';
        }
    }

    let presText = "Hocam kulübümüze hoşgeldin. Ligin başlamasına 15 gün var. Yaz transfer sezonu an itibariyle açıldı ve ligin 3. haftasına kadar sürecek.<br><br>";
    
    switch (window.presidentProfile) {
        case 'populist':
            presText += "<span style='color:#f1c40f;'>[Karizmatik Başkan]</span><br>Taraftar bizden büyük başarılar bekliyor hocam! O tribünlerin sesini duyacaksın. Yıldız transferler yap, taraftarı coştur. Medyada kulübümüzü aslanlar gibi temsil et. Sana güveniyorum!";
            break;
        case 'corporate':
            presText += "<span style='color:#f1c40f;'>[Teknokrat Başkan]</span><br>Biliyorsun ki kulüp aynı zamanda bir şirkettir. Bütçeyi milimetrik idare et, marka değerimizi düşürme ve kâr etmemiz için elinden geleni yap. Duygusallığa yer yok, rasyonel kararlar almanı bekliyorum.";
            break;
        case 'project':
            presText += "<span style='color:#f1c40f;'>[Proje Odaklı Başkan]</span><br>Sana sabrımız sonsuz hocam. Gençleri oynat, takımın sistemini yavaş yavaş oturt. Altyapıya önem ver. Saha içi sana emanet, işi ehline bıraktık. Adım adım yükseleceğiz.";
            break;
        case 'dictator':
            presText += "<span style='color:#f1c40f;'>[Müdahaleci Başkan]</span><br>Burası benim kulübüm, kuralları ben koyarım! Dediklerimi harfiyen yapmazsan kendini kapıda bulursun. Bana mazeret değil kupa getir! Sadece sahaya çık ve kazan, transferlere de kafana göre çok karışma.";
            break;
        case 'silent':
            presText += "<span style='color:#f1c40f;'>[Sessiz Başkan]</span><br>Hocam yetki tamamen sende. Ben arka planda kalmayı, sadece finansal destek sağlamayı tercih ederim. Bütçe belli, işini yap, makro stratejimizden sapma ve başımızı ağrıtma. Kolay gelsin.";
            break;
        case 'oligarch':
            presText += "<span style='color:#f1c40f;'>[Oligark Başkan]</span><br>Hocam para sorun değil, itibar önemli. En iyi hocaları ve oyuncuları alacak gücümüz var. Senden tek isteğim bu kulübü küresel bir marka yapman ve kupaları toplamandır. Kaynağımız sınırsız, vizyonun geniş olsun.";
            break;
        case 'political':
            presText += "<span style='color:#f1c40f;'>[Politik Başkan]</span><br>Kulübümüzün başarısı toplumun da huzurudur hocam. Basına vereceğin demeçlere dikkat et, halkı ve taraftarı arkamıza alalım. Sportif başarınla hem kulübü hem de bizleri yüceltmeni bekliyorum.";
            break;
        case 'savior':
            presText += "<span style='color:#f1c40f;'>[Kurtarıcı Başkan]</span><br>Hocam kulübü ipten aldık, zor günlerden geçiyoruz. Benden büyük transferler değil, gemiyi sağ salim limana yanaştırmanı bekliyorum. Sabırla ve fedakarlıkla bu enkazı beraber kaldıracağız.";
            break;
        case 'fanatic':
            presText += "<span style='color:#f1c40f;'>[Amigo Başkan]</span><br>Hocaamm! Bu tribünler başarıya aç, bu arma için canımızı veririz! Gerekirse sahaya iner omuz omuza savaşırız. Futbolculara söyle formanın hakkını versinler. Bizi şampiyon yap heykelini dikeyim!";
            break;
        case 'missionary':
            presText += "<span style='color:#f1c40f;'>[Misyoner / Öz Kaynak Başkanı]</span><br>Hocam skorlar umurumda değil, felsefemiz önemli. Akademideki gençlerimize şans ver, sadece kiralık lejyonerlerle günü kurtarma. Biz bir felsefe takımıyız, yerli kaynaklarımızla büyüyeceğiz.";
            break;
        default:
            presText += "Sana güveniyorum. İşleri iyi idare et.";
    }

    let presTextEl = document.getElementById('president-briefing-text');
    if (presTextEl) {
        presTextEl.innerHTML = '"' + presText + '"';
    }

    document.getElementById('president-briefing-modal').style.display = 'flex';
    if(document.getElementById('president-briefing-modal')) {
        let title = document.getElementById('president-briefing-modal').querySelector('h1, h2');
        if(title) title.focus();
        else document.getElementById('president-briefing-modal').focus();
    }
`;

if (leagueJs.match(oldLogicRegex)) {
    leagueJs = leagueJs.replace(oldLogicRegex, newLogic);
    fs.writeFileSync('js/league.js', leagueJs, 'utf8');
    console.log('Updated js/league.js with 10 profiles successfully');
} else {
    console.log('Could not find old logic in js/league.js');
}

// 2. UPDATE MENU.JS
let menuJs = fs.readFileSync('js/menu.js', 'utf8');

const oldMenuRegex = /window\.closePresidentBriefing = function\(choice\) \{[\s\S]*?showSponsorModal\(\), 500\);\s*\n?\s*\};/;

const newMenuLogic = `window.closePresidentBriefing = function(choice) {
    if (!window.presidentConfidence) window.presidentConfidence = 50;
    if (!window.managerAuthority) window.managerAuthority = 50;

    let profile = window.presidentProfile || 'project';
    let confChange = 0;
    let authChange = 0;
    let feedback = "";

    if (choice === 'ambitious') {
        if (profile === 'populist') { confChange = 15; authChange = 10; feedback = "Popülist başkan iddialı konuşmanı sevdi!"; }
        else if (profile === 'oligarch') { confChange = 15; authChange = 5; feedback = "Oligark başkanın vizyonuna ayak uydurdun!"; }
        else if (profile === 'political') { confChange = 15; authChange = 10; feedback = "Politik başkan bu iddiayı PR için harika buldu!"; }
        else if (profile === 'fanatic') { confChange = 15; authChange = 10; feedback = "Amigo başkan coşkuna ortak oldu!"; }
        else if (profile === 'corporate') { confChange = -5; feedback = "Teknokrat başkan boş vaatleri sevmez, bilançoya bakar."; }
        else if (profile === 'project') { confChange = -5; feedback = "Proje başkanı aceleci hedeflerden hoşlanmadı."; }
        else if (profile === 'savior') { confChange = -10; feedback = "Kurtarıcı başkan krizdeyken bu lafları hayalperest buldu."; }
        else if (profile === 'missionary') { confChange = -5; feedback = "Öz kaynak başkanı kupa değil sistem istiyor."; }
        else if (profile === 'dictator') { confChange = 5; authChange = 5; feedback = "Müdahaleci başkan hırsını takdir etti ama tetikte."; }
        else { confChange = 5; authChange = 5; feedback = "Sessiz başkan onayladı. Otoriten arttı."; }
    } else if (choice === 'cautious') {
        if (profile === 'corporate') { confChange = 20; authChange = 5; feedback = "Şirketçi başkan mali disiplinini takdir etti!"; }
        else if (profile === 'savior') { confChange = 20; authChange = 10; feedback = "Kurtarıcı başkan tam olarak bu fedakarlığı duymak istiyordu!"; }
        else if (profile === 'project') { confChange = 10; feedback = "Proje odaklı başkan akılcı yaklaşımını destekliyor."; }
        else if (profile === 'missionary') { confChange = 10; feedback = "Misyoner başkan akılcı büyümeyi onayladı."; }
        else if (profile === 'oligarch') { confChange = -10; feedback = "Oligark başkan 'Bütçeyi dert etme!' diyerek sana kızdı."; }
        else if (profile === 'populist') { confChange = -10; feedback = "Popülist başkan bütçe hesabını sıkıcı buldu."; }
        else if (profile === 'fanatic') { confChange = -10; feedback = "Amigo başkan mali masallardan sıkıldı."; }
        else if (profile === 'political') { confChange = 5; feedback = "Politik başkan temkinliliği makul karşıladı."; }
        else if (profile === 'dictator') { confChange = 5; feedback = "Başkan temkinli olmanı onayladı."; }
        else { confChange = 10; feedback = "Sessiz başkan para istememeni sevdi."; }
    } else if (choice === 'motivational') {
        if (profile === 'populist') { confChange = 20; authChange = 10; feedback = "Popülist başkan taraftar vurgusuna bayıldı!"; }
        else if (profile === 'fanatic') { confChange = 25; authChange = 15; feedback = "Amigo başkan sevincinden çıldırdı! Taraftar arkanda!"; }
        else if (profile === 'political') { confChange = 15; authChange = 10; feedback = "Politik başkan kalabalıkları coşturmanı çok sevdi!"; }
        else if (profile === 'corporate') { confChange = -5; feedback = "Şirketçi başkan taraftar edebiyatını umursamıyor."; }
        else if (profile === 'missionary') { confChange = -5; feedback = "Misyoner başkan tribüne oynamanı değil felsefeye odaklanmanı istiyor."; }
        else if (profile === 'dictator') { confChange = -10; feedback = "Tek adam KENDİSİNİ övmeni bekliyordu. Güveni sarsıldı!"; }
        else if (profile === 'savior') { confChange = 5; feedback = "Kurtarıcı başkan umut aşılamanı beğendi."; }
        else if (profile === 'project') { confChange = 5; authChange = 5; feedback = "Takım moralini yükseltmen desteklendi."; }
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

if (menuJs.match(oldMenuRegex)) {
    menuJs = menuJs.replace(oldMenuRegex, newMenuLogic);
    fs.writeFileSync('js/menu.js', menuJs, 'utf8');
    console.log('Updated js/menu.js with 10 profiles successfully');
} else {
    console.log('Could not find old logic in js/menu.js');
}

const fs = require('fs');

let js = fs.readFileSync('js/league.js', 'utf8');

const oldLogicRegex = /let presText = "Hocam kulübümüze hoşgeldin\. Ligin başlamasına 15 gün var\. Yaz transfer sezonu an itibariyle açıldı ve ligin 3\. haftasına kadar sürecek\.<br><br>";[\s\S]*?let title = document\.getElementById\('president-briefing-modal'\)\.querySelector\('h1, h2'\);\s*if\(title\) title\.focus\(\);\s*else document\.getElementById\('president-briefing-modal'\)\.focus\(\);\s*\}/;

const newLogic = `
    // --- BAŞKAN PROFİLİ BELİRLEME (Weighted Random) ---
    if (!window.presidentProfile) {
        let budget = window.userTeam ? window.userTeam.budget : 20;
        let rand = Math.random();
        
        if (budget >= 40) {
            // Büyük Takımlar: %40 Popülist, %30 Müdahaleci, %20 Şirketçi, %10 Proje
            if (rand < 0.4) window.presidentProfile = 'populist';
            else if (rand < 0.7) window.presidentProfile = 'dictator';
            else if (rand < 0.9) window.presidentProfile = 'corporate';
            else window.presidentProfile = 'project';
        } else if (budget >= 20) {
            // Orta Takımlar: %30 Şirketçi, %30 Sessiz, %20 Proje, %20 Popülist
            if (rand < 0.3) window.presidentProfile = 'corporate';
            else if (rand < 0.6) window.presidentProfile = 'silent';
            else if (rand < 0.8) window.presidentProfile = 'project';
            else window.presidentProfile = 'populist';
        } else {
            // Küçük Takımlar: %40 Proje, %30 Müdahaleci, %20 Sessiz, %10 Şirketçi
            if (rand < 0.4) window.presidentProfile = 'project';
            else if (rand < 0.7) window.presidentProfile = 'dictator';
            else if (rand < 0.9) window.presidentProfile = 'silent';
            else window.presidentProfile = 'corporate';
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
            presText += "<span style='color:#f1c40f;'>[Futbolun İçinden / Proje Odaklı Başkan]</span><br>Sana sabrımız sonsuz hocam. Gençleri oynat, takımın sistemini yavaş yavaş oturt. Altyapıya önem ver. Saha içi sana emanet, işi ehline bıraktık. Adım adım yükseleceğiz.";
            break;
        case 'dictator':
            presText += "<span style='color:#f1c40f;'>[Müdahaleci / Tek Adam Başkan]</span><br>Burası benim kulübüm, kuralları ben koyarım! Dediklerimi harfiyen yapmazsan kendini kapıda bulursun. Bana mazeret değil kupa getir! Sadece sahaya çık ve kazan, transferlere de kafana göre çok karışma.";
            break;
        case 'silent':
            presText += "<span style='color:#f1c40f;'>[Sessiz / Delegasyon Ustası Başkan]</span><br>Hocam yetki tamamen sende. Ben arka planda kalmayı, sadece finansal destek sağlamayı tercih ederim. Bütçe belli, işini yap, makro stratejimizden sapma ve başımızı ağrıtma. Kolay gelsin.";
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

if (js.match(oldLogicRegex)) {
    js = js.replace(oldLogicRegex, newLogic);
    fs.writeFileSync('js/league.js', js, 'utf8');
    console.log('Updated js/league.js successfully');
} else {
    console.log('Could not find logic in js/league.js');
}

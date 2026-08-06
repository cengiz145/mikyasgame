const fs = require('fs');

// 1. UPDATE LEAGUE.JS
let leagueJs = fs.readFileSync('js/league.js', 'utf8');

const oldLogicRegex = /\/\/ --- BAŞKAN PROFİLİ BELİRLEME \(10 Profil - Bütçesel Ağırlıklı\) ---[\s\S]*?else document\.getElementById\('president-briefing-modal'\)\.focus\(\);\s*\}/;

const newLogic = `
    // --- BAŞKAN PROFİLİ BELİRLEME (15 Profil - Makale Uyumlu) ---
    if (!window.presidentProfile) {
        let budget = window.userTeam ? window.userTeam.budget : 20;
        let profiles = [];
        
        if (budget >= 40) {
            profiles = ['populist', 'oligarch', 'political', 'dictator', 'corporate', 'project', 'hollywood', 'democratic'];
        } else if (budget >= 20) {
            profiles = ['corporate', 'silent', 'political', 'fanatic', 'project', 'populist', 'moneyball', 'multiclub', 'nostalgic', 'democratic'];
        } else {
            profiles = ['savior', 'missionary', 'fanatic', 'project', 'silent', 'dictator', 'moneyball', 'multiclub', 'nostalgic'];
        }
        
        window.presidentProfile = profiles[Math.floor(Math.random() * profiles.length)];
    }

    let presText = "Hocam kulübümüze hoşgeldin. Ligin başlamasına 15 gün var. Yaz transfer sezonu an itibariyle açıldı ve ligin 3. haftasına kadar sürecek.<br><br>";
    
    switch (window.presidentProfile) {
        case 'populist': presText += "<span style='color:#f1c40f;'>[Karizmatik Başkan]</span><br>Taraftar bizden başarı bekliyor hocam! Yıldız transferler yap, taraftarı coştur. Medyada kulübümüzü iyi temsil et."; break;
        case 'corporate': presText += "<span style='color:#f1c40f;'>[Teknokrat Başkan]</span><br>Biliyorsun ki kulüp aynı zamanda bir şirkettir. Bütçeyi milimetrik idare et, marka değerimizi düşürme ve kâr etmemiz için rasyonel kararlar al."; break;
        case 'project': presText += "<span style='color:#f1c40f;'>[Proje Odaklı Başkan]</span><br>Sana sabrımız var hocam. Gençleri oynat, sistemi yavaş yavaş oturt. Saha içi sana emanet, adım adım yükseleceğiz."; break;
        case 'dictator': presText += "<span style='color:#f1c40f;'>[Müdahaleci Başkan]</span><br>Burası benim kulübüm, kuralları ben koyarım! Dediklerimi harfiyen yapmazsan kovulursun. Bana mazeret değil kupa getir!"; break;
        case 'silent': presText += "<span style='color:#f1c40f;'>[Sessiz Başkan]</span><br>Hocam yetki tamamen sende. Ben arka planda kalmayı tercih ederim. İşini yap, makro stratejimizden sapma ve başımızı ağrıtma."; break;
        case 'oligarch': presText += "<span style='color:#f1c40f;'>[Oligark Başkan]</span><br>Hocam para sorun değil. En iyi hocaları ve oyuncuları alacak gücümüz var. Kulübü küresel marka yap, kupaları topla."; break;
        case 'political': presText += "<span style='color:#f1c40f;'>[Politik Başkan]</span><br>Başarı toplumun huzurudur hocam. Basına vereceğin demeçlere dikkat et. Sportif başarınla kulübü ve bizi yüceltmeni bekliyorum."; break;
        case 'savior': presText += "<span style='color:#f1c40f;'>[Kurtarıcı Başkan]</span><br>Hocam kulübü ipten aldık. Benden transfer bekleme, sadece gemiyi sağ salim limana yanaştır. Beraber bu enkazı kaldıracağız."; break;
        case 'fanatic': presText += "<span style='color:#f1c40f;'>[Amigo Başkan]</span><br>Hocaamm! Tribünler başarıya aç, bu arma için canımızı veririz! Şampiyon yap heykelini dikeyim!"; break;
        case 'missionary': presText += "<span style='color:#f1c40f;'>[Misyoner / Öz Kaynak Başkanı]</span><br>Skorlar umurumda değil, felsefemiz önemli. Akademideki gençlerimize şans ver, yerli kaynaklarımızla büyüyeceğiz."; break;
        case 'moneyball': presText += "<span style='color:#f1c40f;'>[Veri Odaklı 'Moneyball' Başkanı]</span><br>Hocam bana popüler isimlerle değil, verilerle gel. Potansiyelli oyuncuları ucuza bulup pahalıya satacağız. Duygularla değil matematik ve istatistiklerle karar almanı bekliyorum."; break;
        case 'hollywood': presText += "<span style='color:#f1c40f;'>[Hollywood Şov Başkanı]</span><br>Welcome hocam! Bize galibiyet kadar marka değeri ve hikaye lazım. Kameralara iyi oyna, yıldızları parlat, kulübü küresel bir eğlence markasına dönüştürelim!"; break;
        case 'multiclub': presText += "<span style='color:#f1c40f;'>[Multi-Club Şube Müdürü]</span><br>Hocam merkez holdingden gelen talimatları uygulayacağız. Dev bir ağın parçasıyız. Ana kulüp için yetenekleri pişir, kendi başına macera arama."; break;
        case 'nostalgic': presText += "<span style='color:#f1c40f;'>[Nostaljik Başkan]</span><br>Ah o eski güzel günler... Kulübümüzün altın çağlarını geri getirmemiz lazım. Kendi evlatlarımıza güven, o eski savaşçı ruhu sahaya yansıt."; break;
        case 'democratic': presText += "<span style='color:#f1c40f;'>[Demokratik 'Sözcü' Başkan]</span><br>Hocam ben genel kurulun temsilcisiyim. Her adımımızda taraftarın ve üyelerin rızasını almalıyız. Bütçeyi aşamayız, yaklaşan seçimlerde yüzümüzü kara çıkartma."; break;
        default: presText += "Sana güveniyorum. İşleri iyi idare et.";
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
    console.log('Updated js/league.js with 15 profiles successfully');
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
        if (['populist','oligarch','political','fanatic','hollywood','nostalgic'].includes(profile)) { 
            confChange = 15; authChange = 10; feedback = "Başkan bu iddialı tutkunu harika buldu!"; 
        } else if (['corporate','project','savior','missionary','moneyball','multiclub'].includes(profile)) { 
            confChange = -5; feedback = "Başkan bu aceleci ve altı boş vaatlerinden hoşlanmadı."; 
        } else { 
            confChange = 5; authChange = 5; feedback = "Başkan iddialı hedefini onayladı."; 
        }
    } else if (choice === 'cautious') {
        if (['corporate','savior','missionary','moneyball','multiclub','democratic'].includes(profile)) { 
            confChange = 20; authChange = 10; feedback = "Başkan bu finansal ve rasyonel yaklaşımına bayıldı!"; 
        } else if (['oligarch','populist','fanatic','hollywood'].includes(profile)) { 
            confChange = -10; feedback = "Başkan bütçe bahanesini sıkıcı buldu. O şov ve kupa istiyor!"; 
        } else { 
            confChange = 10; feedback = "Başkan temkinli yaklaşımını takdir etti."; 
        }
    } else if (choice === 'motivational') {
        if (['populist','fanatic','political','nostalgic','democratic'].includes(profile)) { 
            confChange = 20; authChange = 15; feedback = "Başkan tribünleri ve taraftarı heveslendirmeni çok sevdi!"; 
        } else if (['corporate','missionary','dictator','moneyball','multiclub'].includes(profile)) { 
            confChange = -10; feedback = "Başkan taraftar edebiyatını umursamıyor, sisteme odaklanmanı istiyor."; 
        } else { 
            authChange = 10; feedback = "Taraftar ve takım sana inandı. Otoriten arttı."; 
        }
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
    console.log('Updated js/menu.js with 15 profiles successfully');
} else {
    console.log('Could not find old logic in js/menu.js');
}

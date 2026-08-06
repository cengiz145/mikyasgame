const fs = require('fs');

// 1. index.html dosyasında <p> etiketine ID ekleyelim
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
    '<p tabindex="0" style="color: #ecf0f1; font-size: 1.2rem; line-height: 1.6; font-style: italic; outline: none;">',
    '<p id="president-briefing-text" tabindex="0" style="color: #ecf0f1; font-size: 1.2rem; line-height: 1.6; font-style: italic; outline: none;">'
);
fs.writeFileSync('index.html', html, 'utf8');

// 2. js/league.js dosyasında dinamik metin oluşturan mantığı ekleyelim
let js = fs.readFileSync('js/league.js', 'utf8');

const targetLine = "document.getElementById('president-briefing-modal').style.display = 'flex'; if(document.getElementById('president-briefing-modal')) { let title = document.getElementById('president-briefing-modal').querySelector('h1, h2'); if(title) title.focus(); else document.getElementById('president-briefing-modal').focus(); };";

const replacementCode = `
    let presText = "Hocam kulübümüze hoşgeldin. Ligin başlamasına 15 gün var. Yaz transfer sezonu an itibariyle açıldı ve ligin 3. haftasına kadar sürecek.<br><br>";
    
    if (window.userTeam && window.userTeam.budget >= 40) {
        presText += "Hedefimiz mutlak şampiyonluk. Elindeki bütçe ve kadro bu ligin çok üzerinde. Başarısızlığa tahammülüm yok, hedeften saparsak yollarımız çabuk ayrılır. Eksiklerini tamamla ve takımı ilk maça hazırla. Uyarılarımı dikkate al, başarılar dilerim!";
    } else {
        presText += "Hedefimiz ligde kalıcı olmak ve üst sıraları zorlamak. Bütçemiz kısıtlı, bu yüzden akıllı transferler yapmalısın. Arkanda devasa bir camia var, güvenim sana tam. Başarılar dilerim!";
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

if (js.includes(targetLine)) {
    js = js.replace(targetLine, replacementCode);
    fs.writeFileSync('js/league.js', js, 'utf8');
    console.log('Successfully updated index.html and js/league.js');
} else {
    console.log('Target line not found in js/league.js');
}

const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

// 1. Negotiation Open Logic
let target1 = `    let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
    window.isSuperAgentNegotiation = isSuperAgent;

    let initialSpeech = "Oyuncumun kalitesi ortada. İstenen bonservis bedelini ödemezseniz masadan kalkarız.";
    window.currentAgentPatience = 3;

    if (isSuperAgent) {`;

let replacement1 = `    let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
    let isFamilyAgent = !isSuperAgent && Math.random() < 0.25; // %25 ihtimalle Aile Üyesi (Baba/Eş) Menajer
    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;

    let initialSpeech = "Oyuncumun kalitesi ortada. İstenen bonservis bedelini ödemezseniz masadan kalkarız.";
    window.currentAgentPatience = 3;

    if (isSuperAgent) {`;

content = content.replace(target1, replacement1);

// 2. Add Family Agent Logic after Super Agent
let target2 = `        } else if (isUnwanted && player.teamId !== 'free_agent') {
            surcharge -= 0.4; // Çok ucuz
            if (surcharge < 0.5) surcharge = 0.5;
            window.currentAgentPatience = 4; // Çok sabırlı
            initialSpeech = "Açıkçası oyuncu şu an kulüpte forma şansı bulamıyor ve mutsuz. Bizi bu maaş yükünden kurtarırsanız size her türlü kolaylığı sağlarız.";
        }
    }`;

let replacement2 = `        } else if (isUnwanted && player.teamId !== 'free_agent') {
            surcharge -= 0.4; // Çok ucuz
            if (surcharge < 0.5) surcharge = 0.5;
            window.currentAgentPatience = 4; // Çok sabırlı
            initialSpeech = "Açıkçası oyuncu şu an kulüpte forma şansı bulamıyor ve mutsuz. Bizi bu maaş yükünden kurtarırsanız size her türlü kolaylığı sağlarız.";
        }
    }
    
    // Aile Menajeri (Üzerine yazar)
    if (isFamilyAgent) {
        let isSpouse = Math.random() < 0.3; // %30 Wanda Nara stili eş, %70 Baba
        let relationStr = isSpouse ? "eşime" : "oğluma";
        surcharge += (Math.random() * 0.4); // Piyasayı bilmediği için rastgele saçma fiyatlar isteyebilir
        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, ailemizin menfaatini düşünüyoruz. Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yemenize asla müsaade etmem! Lütfen duygularımızı incitecek rakamlarla gelmeyin.";
    }`;

content = content.replace(target2, replacement2);

// 3. Failure logic update
let target3 = `    // Ölücü Teklif (Değerinin çok altı)
    if (offer < base * 0.7) {
        let msg = window.isSuperAgentNegotiation 
            ? "Süper Menajer: 'Benim gibi küresel bir figürle dalga mı geçiyorsunuz?!' diyerek masayı devirdi ve gazetecileri arayıp kulübünüzü medyada rezil etti." 
            : "Menajer: 'Bu bir hakaret! Bizimle dalga mı geçiyorsunuz?' diyerek masayı terk etti.";
        alert(msg);
        finishNegotiation(false);
        return;
    }
    
    // Orta halli teklif
    window.currentAgentPatience--;
    if (window.currentAgentPatience <= 0) {
        let msg = window.isSuperAgentNegotiation 
            ? "Süper Menajer: 'Benim vaktimi böyle amatörce harcayamazsınız. Oyuncumu rakip takıma pazarlamaya gidiyorum!' diyerek kapıyı çarpıp çıktı."
            : "Menajer: 'Anlaşamayacağımız belli oldu, iyi günler.' diyerek masayı terk etti.";
        alert(msg);
        finishNegotiation(false);
        return;
    }`;

let replacement3 = `    // Ölücü Teklif (Değerinin çok altı)
    if (offer < base * 0.7) {
        let msg = "Menajer: 'Bu bir hakaret! Bizimle dalga mı geçiyorsunuz?' diyerek masayı terk etti.";
        if (window.isSuperAgentNegotiation) {
            msg = "Süper Menajer: 'Benim gibi küresel bir figürle dalga mı geçiyorsunuz?!' diyerek masayı devirdi ve gazetecileri arayıp kulübünüzü medyada rezil etti.";
        } else if (window.isFamilyAgentNegotiation) {
            msg = "Aile Menajeri: 'Benim evladıma/eşime bu sadakayı mı layık görüyorsunuz? Sizin gibi vefasız, kalpsiz insanlarla işimiz olmaz!' diyerek ağlamaklı bir öfkeyle odayı terk etti.";
        }
        alert(msg);
        finishNegotiation(false);
        return;
    }
    
    // Orta halli teklif
    window.currentAgentPatience--;
    if (window.currentAgentPatience <= 0) {
        let msg = "Menajer: 'Anlaşamayacağımız belli oldu, iyi günler.' diyerek masayı terk etti.";
        if (window.isSuperAgentNegotiation) {
            msg = "Süper Menajer: 'Benim vaktimi böyle amatörce harcayamazsınız. Oyuncumu rakip takıma pazarlamaya gidiyorum!' diyerek kapıyı çarpıp çıktı.";
        } else if (window.isFamilyAgentNegotiation) {
            msg = "Aile Menajeri: 'Ailemiz bu teklife çok kırıldı. Bizim duygularımızı anlamadığınızı görüyorum. Anlaşamayacağız...'";
        }
        alert(msg);
        finishNegotiation(false);
        return;
    }`;

content = content.replace(target3, replacement3);

// 4. Orta yolu bulma repliğini de Aile Menajerine göre uyarla
let target4 = `    window.currentAgentDemand -= discount;
    
    updateNegotiationUI("Teklifiniz çok düşük, ancak biraz daha inebiliriz. Yeni fiyatımız budur.");`;

let replacement4 = `    window.currentAgentDemand -= discount;
    
    let midMsg = "Teklifiniz çok düşük, ancak biraz daha inebiliriz. Yeni fiyatımız budur.";
    if (window.isFamilyAgentNegotiation) midMsg = "Açıkçası evladımın/eşimin değeri bu değil... Ama madem bu kadar ısrar ediyorsunuz, hatırınız için biraz daha fedakarlık yapacağız.";
    if (window.isSuperAgentNegotiation) midMsg = "Normalde 1 kuruş inmem ama projenize inandığım için şimdilik ufak bir indirim yapıyorum. Şansınızı zorlamayın.";
    updateNegotiationUI(midMsg);`;

content = content.replace(target4, replacement4);


fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch family agent applied successfully.');

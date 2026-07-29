const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

// 1. Setup the isCorporateAgent logic
let target1 = `    let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
    let isFamilyAgent = !isSuperAgent && Math.random() < 0.25; // %25 ihtimalle Aile Üyesi (Baba/Eş) Menajer
    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;`;

let replacement1 = `    let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
    let isFamilyAgent = !isSuperAgent && Math.random() < 0.25; // %25 ihtimalle Aile Üyesi (Baba/Eş) Menajer
    let isCorporateAgent = !isSuperAgent && !isFamilyAgent && Math.random() < 0.40; // %40 Kurumsal Ajans
    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;
    window.isCorporateAgentNegotiation = isCorporateAgent;`;

content = content.replace(target1, replacement1);

// 2. Add Corporate Agent logic after Family Agent
let target2 = `        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, duygusal insanlarız... Ama duygularımızı ancak MİLYON EUROLAR tatmin edebilir! Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yedirmem. Dolgun bir komisyon bekliyoruz, yoksa masaya dahi oturmayız!";
    }`;

let replacement2 = `        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, duygusal insanlarız... Ama duygularımızı ancak MİLYON EUROLAR tatmin edebilir! Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yedirmem. Dolgun bir komisyon bekliyoruz, yoksa masaya dahi oturmayız!";
    }
    
    // Kurumsal Ajans (Üzerine yazar)
    if (isCorporateAgent) {
        window.currentAgentPatience = 3; // Duygusuz ve stabil sabır
        initialSpeech = "Kurumsal Ajans (CAA Stellar / Roc Nation): Merhabalar. PR departmanımızın raporlarına göre müşterimizin marka değeri son çeyrekte %40 büyüdü. Masaya getireceğiniz teklifin sadece sportif değil, oyuncunun imaj haklarına ve global yatırım stratejilerimize uygun olmasını bekliyoruz.";
    }`;

content = content.replace(target2, replacement2);

// 3. Failure logic update
let target3 = `    // Ölücü Teklif (Değerinin çok altı)
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

let replacement3 = `    // Ölücü Teklif (Değerinin çok altı)
    if (offer < base * 0.7) {
        let msg = "Menajer: 'Bu bir hakaret! Bizimle dalga mı geçiyorsunuz?' diyerek masayı terk etti.";
        if (window.isSuperAgentNegotiation) {
            msg = "Süper Menajer: 'Benim gibi küresel bir figürle dalga mı geçiyorsunuz?!' diyerek masayı devirdi ve gazetecileri arayıp kulübünüzü medyada rezil etti.";
        } else if (window.isFamilyAgentNegotiation) {
            msg = "Aile Menajeri: 'Benim evladıma/eşime bu sadakayı mı layık görüyorsunuz? Sizin gibi vefasız, kalpsiz insanlarla işimiz olmaz!' diyerek ağlamaklı bir öfkeyle odayı terk etti.";
        } else if (window.isCorporateAgentNegotiation) {
            msg = "Kurumsal Ajans: 'Şirketimizin algoritmaları bu rakamın müşterimizin global marka algısını düşüreceğini saptadı. Finans departmanımız görüşmeleri tek taraflı olarak feshetmiştir.'";
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
        } else if (window.isCorporateAgentNegotiation) {
            msg = "Kurumsal Ajans: 'Maalesef hukuk ve risk departmanımız teklif şartlarınızı şirket stratejilerimize uygun bulmadı. Toplantı bitmiştir, iyi günler dileriz.'";
        }
        alert(msg);
        finishNegotiation(false);
        return;
    }`;

content = content.replace(target3, replacement3);

// 4. Orta yolu bulma repliği
let target4 = `    if (window.isFamilyAgentNegotiation) midMsg = "Açıkçası evladımın/eşimin değeri bu değil... Ama madem bu kadar ısrar ediyorsunuz, hatırınız için biraz daha fedakarlık yapacağız.";
    if (window.isSuperAgentNegotiation) midMsg = "Normalde 1 kuruş inmem ama projenize inandığım için şimdilik ufak bir indirim yapıyorum. Şansınızı zorlamayın.";
    updateNegotiationUI(midMsg);`;

let replacement4 = `    if (window.isFamilyAgentNegotiation) midMsg = "Açıkçası evladımın/eşimin değeri bu değil... Ama madem bu kadar ısrar ediyorsunuz, hatırınız için biraz daha fedakarlık yapacağız.";
    if (window.isSuperAgentNegotiation) midMsg = "Normalde 1 kuruş inmem ama projenize inandığım için şimdilik ufak bir indirim yapıyorum. Şansınızı zorlamayın.";
    if (window.isCorporateAgentNegotiation) midMsg = "Hukuk departmanımızla görüştük. Sözleşmeye bazı ekstra imaj ve reklam hakları maddeleri ekleyerek fiyatı bu seviyeye çekebiliriz.";
    updateNegotiationUI(midMsg);`;

content = content.replace(target4, replacement4);


fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch corporate agent applied successfully.');

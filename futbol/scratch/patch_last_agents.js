const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

// 1. Setup the isScoutAgent and isSuitcaseAgent logic
let target1 = `    let isCorporateAgent = !isSuperAgent && !isFamilyAgent && Math.random() < 0.40; // %40 Kurumsal Ajans
    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;
    window.isCorporateAgentNegotiation = isCorporateAgent;`;

let replacement1 = `    let isCorporateAgent = !isSuperAgent && !isFamilyAgent && Math.random() < 0.40; // %40 Kurumsal Ajans
    
    // Keşif Menajeri: Sadece genç oyuncular (21 yaş altı veya düşük güç)
    let isScoutAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && (player.power < 75 || (player.age && player.age <= 21)) && Math.random() < 0.50;
    
    // Çantacı Menajer: Serbest oyuncular veya yaşlı/vasat oyuncular
    let isSuitcaseAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && !isScoutAgent && (player.teamId === 'free_agent' || player.power < 83) && Math.random() < 0.50;

    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;
    window.isCorporateAgentNegotiation = isCorporateAgent;
    window.isScoutAgentNegotiation = isScoutAgent;
    window.isSuitcaseAgentNegotiation = isSuitcaseAgent;`;

content = content.replace(target1, replacement1);

// 2. Add Scout and Suitcase Agent logic after Corporate Agent
let target2 = `    // Kurumsal Ajans (Üzerine yazar)
    if (isCorporateAgent) {
        window.currentAgentPatience = 3; // Duygusuz ve stabil sabır
        initialSpeech = "Kurumsal Ajans (CAA Stellar / Roc Nation): Merhabalar. PR departmanımızın raporlarına göre müşterimizin marka değeri son çeyrekte %40 büyüdü. Masaya getireceğiniz teklifin sadece sportif değil, oyuncunun imaj haklarına ve global yatırım stratejilerimize uygun olmasını bekliyoruz.";
    }`;

let replacement2 = `    // Kurumsal Ajans (Üzerine yazar)
    if (isCorporateAgent) {
        window.currentAgentPatience = 3; // Duygusuz ve stabil sabır
        initialSpeech = "Kurumsal Ajans (CAA Stellar / Roc Nation): Merhabalar. PR departmanımızın raporlarına göre müşterimizin marka değeri son çeyrekte %40 büyüdü. Masaya getireceğiniz teklifin sadece sportif değil, oyuncunun imaj haklarına ve global yatırım stratejilerimize uygun olmasını bekliyoruz.";
    }
    
    // Bölgesel Keşif Menajeri
    if (isScoutAgent) {
        window.currentAgentPatience = 4; // Çok sabırlı, çocuğun oynamasını istiyor
        surcharge -= 0.3; // Çok insaflı, ucuz
        if (surcharge < 0.3) surcharge = 0.3;
        initialSpeech = "Keşif Menajeri: Bu çocuğu favelalardan/tozlu sahalardan ben çekip çıkardım, o benim öz evladım gibidir. Onun Avrupa'ya uyum sağlaması, evi ve dil eğitimi için de size bizzat yardımcı olacağım. Yeter ki onun potansiyeline inanın ve bu formayı ona verin.";
    }
    
    // Çantacı Menajer
    if (isSuitcaseAgent) {
        window.currentAgentPatience = 2; // Sabırsız, çabuk komisyon peşinde
        surcharge += 0.4; // Komisyon kilitli
        initialSpeech = "Çantacı Menajer (Komisyoncu): Başkanım selamlar! Aradığınız oyuncuyu buldum. Tam sizin sisteme göre, tecrübesi yeter. Ufak bir imza parası ve benim komisyonumu halledersek çocuğu yarın idmana çıkartırım. Biliyorsunuz aramızda lafı olmaz, çayınızı içmeye geldim.";
    }`;

content = content.replace(target2, replacement2);

// 3. Failure logic update
let target3 = `        } else if (window.isCorporateAgentNegotiation) {
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
        }`;

let replacement3 = `        } else if (window.isCorporateAgentNegotiation) {
            msg = "Kurumsal Ajans: 'Şirketimizin algoritmaları bu rakamın müşterimizin global marka algısını düşüreceğini saptadı. Finans departmanımız görüşmeleri tek taraflı olarak feshetmiştir.'";
        } else if (window.isScoutAgentNegotiation) {
            msg = "Keşif Menajeri: 'Benim çocuğum bu paralara oynamayı hak etmiyor. Biz yine tozlu sahalara dönüyoruz, ama bir gün Avrupa onu konuşacak!' diyerek masadan kalktı.";
        } else if (window.isSuitcaseAgentNegotiation) {
            msg = "Çantacı Menajer: 'Başkanım ayıp ediyorsunuz, bu paralara amatör kümede oynatmazlar adamı. Neyse kısmet değilmiş...' diyerek çantayı alıp çıktı.";
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
        } else if (window.isScoutAgentNegotiation) {
            msg = "Keşif Menajeri: 'Sanırım bizim hayallerimiz sizin kulübünüze büyük geldi. Şans vermediğiniz için teşekkürler...'";
        } else if (window.isSuitcaseAgentNegotiation) {
            msg = "Çantacı Menajer: 'Başkanım başka kulüpten daha iyi teklif vardı sırf dostluğumuz için size geldim. Anlaşamıyorsak uzatmaya gerek yok.'";
        }`;

content = content.replace(target3, replacement3);

// 4. Orta yolu bulma repliği
let target4 = `    if (window.isCorporateAgentNegotiation) midMsg = "Hukuk departmanımızla görüştük. Sözleşmeye bazı ekstra imaj ve reklam hakları maddeleri ekleyerek fiyatı bu seviyeye çekebiliriz.";
    updateNegotiationUI(midMsg);`;

let replacement4 = `    if (window.isCorporateAgentNegotiation) midMsg = "Hukuk departmanımızla görüştük. Sözleşmeye bazı ekstra imaj ve reklam hakları maddeleri ekleyerek fiyatı bu seviyeye çekebiliriz.";
    if (window.isScoutAgentNegotiation) midMsg = "Para bizim için ikinci planda, önemli olan çocuğun kariyeri. Tamam, biraz daha iniyorum. Yeter ki anlaşalım.";
    if (window.isSuitcaseAgentNegotiation) midMsg = "Başkanım sırf aramızdaki dostluk hatırına komisyondan feragat ediyorum. Yeni rakam budur, el sıkışalım Bitsin bu iş.";
    updateNegotiationUI(midMsg);`;

content = content.replace(target4, replacement4);


fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch last agents applied successfully.');

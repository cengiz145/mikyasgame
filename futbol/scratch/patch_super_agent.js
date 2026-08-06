const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

// 1. Negotiation Open Logic
let target1 = `    let initialSpeech = "Oyuncumun kalitesi ortada. İstenen bonservis bedelini ödemezseniz masadan kalkarız.";
    window.currentAgentPatience = 3;

    if (player.contractYears === 1 && player.teamId !== 'free_agent') {
        surcharge = 1.0; // Bosman: İstediği imza parası net
        window.currentAgentPatience = 3;
        initialSpeech = "Oyuncumun sözleşmesi bitiyor. Kulübüne bonservis ödemeyeceksiniz ancak bu transferin gerçekleşmesi için talep ettiğim İMZA PARASI tam olarak budur. Ciddiyseniz masadayız.";
    } else if (isStarter && player.teamId !== 'free_agent') {
        surcharge += 0.5; // Çok pahalı
        window.currentAgentPatience = 2; // Sabırsız
        initialSpeech = "O, kulübün en önemli parçalarından biri (İlk 11). Onu satmayı düşünmüyoruz ancak reddedemeyeceğimiz bir teklif yaparsanız konuşabiliriz.";
    } else if (isUnwanted && player.teamId !== 'free_agent') {
        surcharge -= 0.4; // Çok ucuz
        if (surcharge < 0.5) surcharge = 0.5;
        window.currentAgentPatience = 4; // Çok sabırlı
        initialSpeech = "Açıkçası oyuncu şu an kulüpte forma şansı bulamıyor ve mutsuz. Bizi bu maaş yükünden kurtarırsanız size her türlü kolaylığı sağlarız.";
    }`;

let replacement1 = `    let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
    window.isSuperAgentNegotiation = isSuperAgent;

    let initialSpeech = "Oyuncumun kalitesi ortada. İstenen bonservis bedelini ödemezseniz masadan kalkarız.";
    window.currentAgentPatience = 3;

    if (isSuperAgent) {
        surcharge += 0.8; // Devasa komisyon
        window.currentAgentPatience = 2; // Kibirli ve sabırsız
        initialSpeech = "Süper Menajer (Küresel Güç): Benim oyuncum dünyanın en iyilerinden biri. Masada üç farklı Şampiyonlar Ligi devinin astronomik teklifi duruyor. İstediğim devasa komisyonu ve bonservisi hemen vermezseniz basınla konuşur, oyuncuyu size düşman ederim.";
        setTimeout(() => alert("📱 MEDYA SIZINTISI: Süper Menajer, görüşmeleri anında basına sızdırdı! Sosyal medyada fırtınalar kopuyor, oyuncunun piyasa değeri ve menajerin komisyon beklentisi bir gecede tavan yaptı!"), 500);
    } else {
        if (player.contractYears === 1 && player.teamId !== 'free_agent') {
            surcharge = 1.0; // Bosman: İstediği imza parası net
            window.currentAgentPatience = 3;
            initialSpeech = "Oyuncumun sözleşmesi bitiyor. Kulübüne bonservis ödemeyeceksiniz ancak bu transferin gerçekleşmesi için talep ettiğim İMZA PARASI tam olarak budur. Ciddiyseniz masadayız.";
        } else if (isStarter && player.teamId !== 'free_agent') {
            surcharge += 0.5; // Çok pahalı
            window.currentAgentPatience = 2; // Sabırsız
            initialSpeech = "O, kulübün en önemli parçalarından biri (İlk 11). Onu satmayı düşünmüyoruz ancak reddedemeyeceğimiz bir teklif yaparsanız konuşabiliriz.";
        } else if (isUnwanted && player.teamId !== 'free_agent') {
            surcharge -= 0.4; // Çok ucuz
            if (surcharge < 0.5) surcharge = 0.5;
            window.currentAgentPatience = 4; // Çok sabırlı
            initialSpeech = "Açıkçası oyuncu şu an kulüpte forma şansı bulamıyor ve mutsuz. Bizi bu maaş yükünden kurtarırsanız size her türlü kolaylığı sağlarız.";
        }
    }`;

content = content.replace(target1, replacement1);

// 2. Failure logic update
let target2 = `    // Ölücü Teklif (Değerinin çok altı)
    if (offer < base * 0.7) {
        alert("Menajer: 'Bu bir hakaret! Bizimle dalga mı geçiyorsunuz?' diyerek masayı terk etti.");
        finishNegotiation(false);
        return;
    }
    
    // Orta halli teklif
    window.currentAgentPatience--;
    if (window.currentAgentPatience <= 0) {
        alert("Menajer: 'Anlaşamayacağımız belli oldu, iyi günler.' diyerek masayı terk etti.");
        finishNegotiation(false);
        return;
    }`;

let replacement2 = `    // Ölücü Teklif (Değerinin çok altı)
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

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch super agent applied successfully.');

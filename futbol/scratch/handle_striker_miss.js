function handleStrikerMiss(reason = 'save') {
    if (lastShooter !== homePlayers[10]) return false;
    lastShooter = null;
    strikerMissedShots++;
    
    // AŞAMA 56: Anti-Mekanikler (Efsanevi Gol Kaçırma Anonsları)
    if (ball.isBicycleKick) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Röveşata denedi ama top auta gitti! Belki biraz daha çalışması lazım." : "Röveşata denedi ama kaleci inanılmaz çıkardı! O gol olsaydı haftalarca konuşulurdu!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "İNANILMAZ RÖVEŞATA KAÇTI!";
        ball.isBicycleKick = false;
    } else if (ball.isChipShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Aşırtma denedi ama top farklı şekilde dışarı çıkıyor." : "Aşırtma denedi ama kaleci uyumuyor! Topu havada çok rahat kontrol etti.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "AŞIRTMA BAŞARISIZ!";
        ball.isChipShot = false;
    } else if (ball.isBackheelShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Topukla klas bir gol atmak istedi ama top dışarıda!" : "Topukla klas bir gol atmak istedi ama savunma yemedi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "TOPUK ŞOVU İŞE YARAMADI!";
        ball.isBackheelShot = false;
    } else if (ball.isPanenka) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Panenka denedi ama topu dışarı attı! Şaka gibi bir an!" : "Panenka denedi! Ne yaptın sen?! Kaleci yerinden bile kıpırdamadı ve topu rahatça kucağına aldı! Büyük rezalet!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "PANENKA REZALETİ!";
        ball.isPanenka = false;
    } else if (ball.isOlympicGoalShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Kornerden şansını denedi ama top kaleye yönelmeden auta çıktı." : "Kornerden kaleyi düşündü ama kaleci çok dikkatli.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "OLİMPİK DENEME BAŞARISIZ!";
        ball.isOlympicGoalShot = false;
    } else if (window.isSetPieceRoutine && Date.now() < window.setPieceTimer) {
        if(typeof speak === 'function') speak("Organizasyon denediler ama savunma yemedi, tehlike uzaklaştırıldı.");
        window.isSetPieceRoutine = false;
    } else if (ball.isLongHeader) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Uzaktan kafa vuruşu ama isabet yok." : "O kadar uzaktan kafa vuruşu kaleciyi rahatsız etmedi.");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KAFA VURUŞU KAÇTI!";
        ball.isLongHeader = false;
    } else if (ball.isDeflectedShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Savunmaya çarpan top kornere çıkıyor!" : "Savunmaya çarptı ama kaleci son anda harika bir refleksle uzandı!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "KONTRA PİYE BAŞARISIZ!";
        ball.isDeflectedShot = false;
    } else if (ball.isZeroAngleShot) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "O açıdan gol atması mucize olurdu zaten. Top auta çıktı." : "İmkansız açıdan mucize aradı ama kaleci kapattı köşeyi!");
        if(typeof announcerText !== 'undefined') announcerText.textContent = "SIFIRDAN DENEME BAŞARISIZ!";
        ball.isZeroAngleShot = false;
    } else if (ball.shotOriginX && ball.shotOriginX < 600) {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Uzaktan şansını denedi ama isabet yok." : "Uzaktan şansını denedi ama kalecinin kucağına gitti.");
        ball.shotOriginX = null;
    } else {
        if(typeof speak === 'function') speak(reason === 'out' ? (window.AudioManager && window.AudioManager.playMiss(),  "Top auta çıktı." : "Önemli bir fırsat tepti.");
    }
    
    let p = homePlayers[10];
    if (p.mentalTrait !== 'elite') {
        
    // AŞAMA 64: Bireysel Rehabilitasyon
    if (Math.random() < 0.40) {
        if(window.AudioManager && window.AudioManager.cheer) window.AudioManager.cheer.play().catch(e=>{});
        strikerConfidence = 100;
        if(typeof speak === 'function') speak("Stadyum homurdanmak yerine oyuncuyu ayakta alkışlıyor! Hata yapma korkusu tamamen silindi, forvet yeniden doğdu!");
    } else {
        strikerConfidence -= 25;
        if (strikerConfidence < 0) strikerConfidence = 0;
        
        if (p.mentalTrait === 'fragile') {
            p.isStunned = true;
            setTimeout(() => { if(p) p.isStunned = false; }, 2000);
            if(typeof speak === 'function') speak("Eyvah! Forvetimiz akılalmaz bir gol kaçırdı, saç baş yoluyor! Psikolojik olarak çökmek üzere.");
            announcerText.textContent = p.name + " isyanlarda! Özgüveni kırıldı.";
        } else if (p.mentalTrait === 'aggressive') {
            if(typeof speak === 'function') speak("Kaçan gole çok sinirlendi! Forvet takım arkadaşlarına ve hakeme bağırıp çağırıyor. Bencilleşmeye başladı!");
            announcerText.textContent = p.name + " kontrolden çıkıyor!";
        }
    } else {
        if(typeof speak === 'function') speak("Kaçırdı ama umurunda değil. Gerçek bir elit forvet, Japon Balığı hafızasıyla hemen sıfırlandı!");
    }
}

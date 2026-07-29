const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // -- ADIM 1 & 2: Form 6 ve Form 7'yi updateCrowdForm içine entegre et --
    // window.isHistoricalClub ve window.seasonPoints gibi statik değişkenleri en tepeye koyabiliriz, 
    // ama maç içinde test edebilmesi için global nesne üzerinden okuyacağız.
    const crowdFormPatienceHook = /if \(patience < 20 && window\.currentWeek >= 10\) \{/g;
    const newCrowdFormLogic = `
      window.isHistoricalClub = window.isHistoricalClub || (Math.random() < 0.5); // Şimdilik simüle etmek için %50 ihtimal veya dışarıdan atanabilir
      window.seasonPoints = window.seasonPoints || (window.currentWeek * 1.5); // Geçici puan hesabı
      
      // FORM 7: Absürt Karnaval (Skorun Ölümü) - Şampiyonluk garantiyse veya küme düşmüşse
      if (window.currentWeek > 30 && (window.seasonPoints > 85 || window.seasonPoints < 25)) {
          newForm = 7;
      }
      // FORM 6: Geçmişin Hayaletleri - Tarihi kulüp krizdeyse
      else if (window.isHistoricalClub && patience < 80 && patience > 20) {
          newForm = 6;
      }
      else if (patience < 20 && window.currentWeek >= 10) {`;

    if (content.match(crowdFormPatienceHook) && !content.includes('newForm = 7')) {
        content = content.replace(crowdFormPatienceHook, newCrowdFormLogic);
    }
    
    // Sınırlandırmalar ve Form isimleri güncellenmeli
    const clampHook = /if \(newForm > 5\) newForm = 5;/g;
    content = content.replace(clampHook, `if (newForm > 7) newForm = 7;`);
    
    const formNamesHook = /"TRİBÜN FORMU 5: RUHSUZ KABULLENİŞ"\];/g;
    const newFormNames = `"TRİBÜN FORMU 5: RUHSUZ KABULLENİŞ", "TRİBÜN FORMU 6: GEÇMİŞİN HAYALETLERİ", "TRİBÜN FORMU 7: ABSÜRT KARNAVAL"];`;
    if(content.match(formNamesHook)) {
        content = content.replace(formNamesHook, newFormNames);
    } else {
         // Windows/Turkish encoding issue fallback
         const formNamesFallback = /"TR\S+B\S+N FORMU 5: RUHSUZ KABULLEN\S+"];/g;
         content = content.replace(formNamesFallback, `"TRİBÜN FORMU 5: RUHSUZ KABULLENİŞ", "TRİBÜN FORMU 6: GEÇMİŞİN HAYALETLERİ", "TRİBÜN FORMU 7: ABSÜRT KARNAVAL"];`);
    }

    // -- ADIM 3: Yan Form 4 (Organize Boykot) --
    // matchTimer (gameLoop içi) her saniye çalışıyor
    const matchTimerHook = /if \(window\.CrowdForm === 5\) \{/g;
    const sideForm4Logic = `
                // AŞAMA 81: Yan Form 4 (Organize Boykot)
                window.isOrganizedBoycott = false;
                if (typeof window.presidentConfidence !== 'undefined' && window.presidentConfidence < 30 && timeLeft > 45) {
                    window.isOrganizedBoycott = true;
                    if (window.AudioManager && window.AudioManager.ambiance) window.AudioManager.ambiance.volume = 0.05; // Ölüm sessizliği
                    
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.speed = (p.baseSpeed || 3) * 0.6; // Motor gücü eksikliği
                        });
                    }
                }
                
                // Form 6: Geçmişin Hayaletleri
                if (window.CrowdForm === 6) {
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.power = (p.power || 50) * 0.5; // Formanın kurşun gibi ağırlaşması (Şut çekemez)
                            // İnisiyatif almaz
                            p.mistakes = 0; // Yan pas yapar
                        });
                    }
                    if (Math.random() < 0.005 && typeof speak === 'function') {
                        speak("Tribünler maçı tamamen bıraktı, efsane oyuncuların isimlerini bağırarak mevcut kadroyu protesto ediyorlar. Formalar kurşun gibi ağırlaştı, kimse sorumluluk almak istemiyor.");
                    }
                }
                
                // Form 7: Absürt Karnaval
                if (window.CrowdForm === 7) {
                    if (typeof homePlayers !== 'undefined') {
                        homePlayers.forEach(p => {
                            p.speed = (p.baseSpeed || 3) * 0.5; // Laubalilik
                            if (Math.random() < 0.05) p.mistakes = (p.mistakes || 0) + 1; // Konsantrasyon 0
                        });
                    }
                    if (Math.random() < 0.005 && typeof speak === 'function') {
                        speak("İnanılmaz görüntüler! Skorun hiçbir önemi kalmadığı için stadyumda adeta bir Meksika dalgası ve gece kulübü havası var. Oyuncular tamamen rehavete kapıldı!");
                    }
                }
                
                if (window.CrowdForm === 5) {`;
    if (content.match(matchTimerHook) && !content.includes('AŞAMA 81: Yan Form 4')) {
        content = content.replace(matchTimerHook, sideForm4Logic);
    }
    
    // -- ADIM 4: Yan Form 5 (Formayı Çıkarttırma Terörü) --
    // Oyuncu isBooedByOwnFans iken hata yaparsa
    const scapegoatHook = /closestHome\.p\.isBooedByOwnFans = true;/g;
    const sideForm5Logic = `closestHome.p.isBooedByOwnFans = true;
                    } else if (closestHome.p.isBooedByOwnFans && closestHome.p.mistakes >= 5) {
                        // AŞAMA 82: Yan Form 5 - Formayı Çıkarttırma Terörü
                        if (!closestHome.p.isJerseyStripped) {
                            closestHome.p.isJerseyStripped = true;
                            
                            if (window.AudioManager) {
                                let boo = new Audio('sounds/boo.ogg'); boo.volume = 1.0; boo.play().catch(e=>{});
                            }
                            if(typeof speak === 'function') {
                                speak("Bütün stadyum koro halinde tek bir oyuncunun üzerine gidiyor! 'O formayı çıkar, defol git' tezahüratları yeri göğü inletiyor. Oyuncunun psikolojisi tamamen iflas etti, kenara beni değiştirin diye ağlayarak işaret yapıyor!");
                                if(typeof announcerText !== 'undefined') announcerText.textContent = "FORMAYI ÇIKARTTIRMA TERÖRÜ!";
                            }
                            
                            // Oyuncunun futbol hayatı o saniye biter
                            closestHome.p.speed = 0;
                            closestHome.p.power = 0;
                            closestHome.p.isStunned = true; // Olduğu yerde donup kalır
                            
                            // 1 dakika (6 oyun saniyesi) içinde değiştirilmezse formayı kendi çıkarır
                            setTimeout(() => {
                                if (closestHome.p.isJerseyStripped && !closestHome.p.isSubbedOut) {
                                    if(typeof speak === 'function') speak("İNANILMAZ BİR AN! Oyuncu daha fazla dayanamadı, kendi formasını çıkartıp yere attı ve sahayı terk ediyor! Takım sahada 10 kişi kaldı!");
                                    
                                    // Oyuncuyu sahadan sil (Kırmızı kart gibi)
                                    closestHome.p.x = -100;
                                    closestHome.p.y = -100;
                                    closestHome.p.isRedCarded = true; // Teknik olarak sahada yok
                                }
                            }, 6000);
                        }`;
                        
    // Due to previous replacements, there might be two occurrences of closestHome.p.isBooedByOwnFans = true;
    // We will use a more precise hook around mistakes.
    const accurateHook = /\} else if \(window\.CrowdForm >= 3\) \{\s*closestHome\.p\.isBooedByOwnFans = true;/g;
    const preciseReplacement = `} else if (window.CrowdForm >= 3) {
                        closestHome.p.isBooedByOwnFans = true;
                    } 
                    // AŞAMA 82: Yan Form 5 - Formayı Çıkarttırma Terörü
                    if (closestHome.p.isBooedByOwnFans && closestHome.p.mistakes >= 6 && window.CrowdForm >= 4) {
                        if (!closestHome.p.isJerseyStripped) {
                            closestHome.p.isJerseyStripped = true;
                            
                            if (window.AudioManager) {
                                let boo = new Audio('sounds/boo.ogg'); boo.volume = 1.0; boo.play().catch(e=>{});
                            }
                            if(typeof speak === 'function') {
                                speak("Bütün stadyum koro halinde tek bir oyuncunun üzerine gidiyor! 'O formayı çıkar, defol git' tezahüratları yeri göğü inletiyor. Oyuncunun psikolojisi tamamen iflas etti, ağlayarak kenara 'beni değiştirin' işareti yapıyor!");
                                if(typeof announcerText !== 'undefined') announcerText.textContent = "FORMAYI ÇIKARTTIRMA TERÖRÜ!";
                            }
                            
                            // Oyuncunun futbol hayatı o saniye biter
                            closestHome.p.speed = 0;
                            closestHome.p.power = 0;
                            closestHome.p.isStunned = true; // Olduğu yerde donup kalır
                            
                            // 10 oyun saniyesi içinde değiştirilmezse formayı kendi çıkarır
                            setTimeout(() => {
                                // Not: window.homeBenchPlayers ve substitution logic'te isSubbedOut vb. kullanmalıyız.
                                if (closestHome.p.isJerseyStripped && closestHome.p.speed === 0) {
                                    if(typeof speak === 'function') speak("İNANILMAZ BİR AN! Oyuncu daha fazla dayanamadı, hocasını beklemeden formasını çıkartıp yere attı ve ağlayarak sahayı terk ediyor! Takım sahada 10 kişi kaldı!");
                                    closestHome.p.x = -1000;
                                    closestHome.p.y = -1000;
                                    closestHome.p.isRedCarded = true; 
                                }
                            }, 10000);
                        }
                    `;
    
    if (content.match(accurateHook) && !content.includes('AŞAMA 82: Yan Form 5')) {
        content = content.replace(accurateHook, preciseReplacement);
    } else {
        console.log("Accurate hook for Yan Form 5 not found! Trying fallback...");
        // Fallback
        const fallbackHook = /closestHome\.p\.isBooedByOwnFans = true;/;
        content = content.replace(fallbackHook, preciseReplacement.replace('} else if (window.CrowdForm >= 3) {\n', ''));
    }

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Form 6, 7 ve Yan Form 4, 5 eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

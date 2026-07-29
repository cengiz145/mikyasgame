// AŞAMA 35: İnteraktif Oyuncu Psikolojisi ve Yüzleşme Sistemi

function processBenchPsychology() {
    let myTeamId = window.league ? window.league.userTeamId : "galatasaray";
    let myRoster = window.leagueData.players.filter(p => p.teamId === myTeamId);
    
    // game.js içindeki homePlayers (İlk 11) listesini alıyoruz
    // homePlayers global bir değişken olduğu için doğrudan erişebiliriz
    let playedIds = (typeof homePlayers !== 'undefined') ? homePlayers.map(p => p.id) : [];
    
    myRoster.forEach(p => {
        if (p.morale === undefined) p.morale = 75; // Yeni Moral Sistemi Entegrasyonu
        
        if (playedIds.includes(p.id)) {
            // Oyuncu ilk 11 oynadı
            p.benchedMatches = 0;
            p.morale = Math.min(100, p.morale + 3); // Oynamak morali düzeltir
            p.happiness = "Mutlu";
            if (p.promisedNextMatch) {
                p.promisedNextMatch = false; // Söz tutuldu
            }
        } else {
            // Oyuncu yedek kaldı
            p.benchedMatches = (p.benchedMatches || 0) + 1;
            p.morale = Math.max(0, p.morale - 3); // Yedek kalmak morali düşürür
            
            // Eğer söz verilmiş ve tutulmamışsa!
            if (p.promisedNextMatch) {
                p.benchedMatches += 5; // İhanete uğradığı için cezası devasa
                p.morale = Math.max(0, p.morale - 20); // Moral çöküşü
                p.promisedNextMatch = false;
                if(typeof speak === 'function') speak(`${p.name} sana çok sinirli! İlk 11 sözü vermiştin ama tutmadın!`);
            }
            
            if (p.benchedMatches <= 2) p.happiness = "Mutlu";
            else if (p.benchedMatches <= 4) p.happiness = "Huzursuz";
            else if (p.benchedMatches <= 8) p.happiness = "Mutsuz";
            else {
                p.happiness = "İsyan Etti";
                p.morale = 0; // İsyan
                // İsyan mekaniği
                p.teamId = "free_agent";
                p.isListed = true;
                if (typeof window.removePlayerFromTactics === 'function') window.removePlayerFromTactics(p.id);
                if(typeof speak === 'function') speak(`Takımda isyan çıktı! ${p.name} formayı unuttuğu için sözleşmesini feshedip takımdan ayrıldı!`);
                
                // Alert ile uyarı
                setTimeout(() => {
                    alert(`🚨 ŞOK AYRILIK! ${p.name} kulübede çürümekten bıktı ve sözleşmesini tek taraflı feshedip kulübü terk etti!`);
                }, 1000);
            }
        }
    });
}

let pendingDialogues = [];

function checkPsychologyDialogue() {
    let myTeamId = window.league ? window.league.userTeamId : "galatasaray";
    let myRoster = window.leagueData.players.filter(p => p.teamId === myTeamId);
    
    // 3, 5 ve 7. yedek kalışında konuşmaya gelir
    pendingDialogues = myRoster.filter(p => p.benchedMatches === 3 || p.benchedMatches === 5 || p.benchedMatches === 7);
    
    if (pendingDialogues.length > 0) {
        showNextDialogue();
    }
}

function showNextDialogue() {
    if (pendingDialogues.length === 0) return;
    
    let p = pendingDialogues.shift(); // İlk sıradakini al
    
    const modal = document.createElement('div');
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "#2c3e50";
    modal.style.border = "3px solid #e74c3c";
    modal.style.padding = "30px";
    modal.style.zIndex = "9999";
    modal.style.color = "white";
    modal.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
    modal.style.borderRadius = "10px";
    modal.style.textAlign = "center";
    modal.style.width = "400px";

    let title = document.createElement('h2');
    title.innerHTML = `🚪 Yüzleşme: ${p.name}`;
    title.style.color = "#f1c40f";
    
    let text = document.createElement('p');
    text.innerHTML = `<i>"Hocam haftalardır kulübede oturuyorum! Ben bir yıldızım, bu şekilde devam edemem. Ne zaman oynayacağım?"</i><br><br><small>Oyuncu Tipi: ${p.mentalTrait === 'elite' ? '🧠 Lider' : (p.mentalTrait === 'aggressive' ? '⚔️ Agresif' : '🩹 Hassas')}</small>`;
    
    // Seçenekler
    let btnA = document.createElement('button');
    btnA.className = "menu-button";
    btnA.style.display = "block"; btnA.style.width = "100%"; btnA.style.margin = "10px 0"; btnA.style.background = "#c0392b";
    btnA.innerHTML = "😡 (Sert) Burası dingonun ahırı değil, formayı hak edeceksin!";
    btnA.onclick = () => { document.body.removeChild(modal); handleDialogueResult(p, 'hard'); };

    let btnB = document.createElement('button');
    btnB.className = "menu-button";
    btnB.style.display = "block"; btnB.style.width = "100%"; btnB.style.margin = "10px 0"; btnB.style.background = "#f39c12";
    btnB.innerHTML = "🤝 (Politik) Sezon uzun, sana mutlaka şans gelecek, sabırlı ol.";
    btnB.onclick = () => { document.body.removeChild(modal); handleDialogueResult(p, 'soft'); };

    let btnC = document.createElement('button');
    btnC.className = "menu-button";
    btnC.style.display = "block"; btnC.style.width = "100%"; btnC.style.margin = "10px 0"; btnC.style.background = "#27ae60";
    btnC.innerHTML = "✋ (Söz Ver) Haklısın, bir sonraki maç kesinlikle ilk 11'desin!";
    btnC.onclick = () => { document.body.removeChild(modal); handleDialogueResult(p, 'promise'); };

    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(btnA);
    modal.appendChild(btnB);
    modal.appendChild(btnC);
    
    document.body.appendChild(modal);
}

function handleDialogueResult(p, choice) {
    let msg = "";

    if (choice === 'hard') {
        if (p.mentalTrait === 'aggressive') {
            msg = `'Sen bana böyle konuşamazsın!' diyerek kapıyı çarptı. Çok sinirli!`;
            p.benchedMatches += 3; // İsyanı hızlandır
            p.happiness = "Mutsuz 😡";
        } else if (p.mentalTrait === 'fragile') {
            msg = `Gözleri doldu ve odadan çıktı. Özgüveni tamamen kırıldı. Yetenekleri köreldi.`;
            p.power = Math.max(10, p.power - 5);
            p.happiness = "Depresyonda 😭";
        } else {
            msg = `Söylene söylene odadan çıktı.`;
        }
    } else if (choice === 'soft') {
        if (p.mentalTrait === 'elite') {
            msg = `'Beni anladığın için teşekkürler hocam' diyerek sabretmeye karar verdi. Profesyonelce davrandı.`;
            p.benchedMatches = 1; // Yatıştırdık
            p.happiness = "Umutlu 😊";
        } else {
            if (Math.random() < 0.5) {
                msg = `Şimdilik ikna olmuş gibi görünüyor.`;
                p.benchedMatches -= 1;
            } else {
                msg = `'Hep aynı yalanlar!' diyerek tatmin olmadı.`;
                p.benchedMatches += 1;
            }
        }
    } else if (choice === 'promise') {
        msg = `Çok teşekkürler hocam, güveninizi boşa çıkarmayacağım!\n\n(DİKKAT: Sonraki maç ilk 11 oynatmazsanız ihanet sayıp isyan edecektir!)`;
        p.promisedNextMatch = true;
        p.happiness = "Umutlu 🤩";
    }

    setTimeout(() => {
        alert(msg);
        if(typeof speak === 'function') speak(msg);
        showNextDialogue(); // Diğer oyuncuya geç
    }, 500);
}

window.processBenchPsychology = processBenchPsychology;
window.checkPsychologyDialogue = checkPsychologyDialogue;

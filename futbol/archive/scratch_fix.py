import sys

file_path = r"c:\Users\Umit Ekrem Mikyas\Downloads\wep sitem\futbol\js\game.js"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    setTimeout(() => {
        if (window.isFriendlyMatch) {
            window.isFriendlyMatch = false;
            if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
            const mm = document.getElementById('main-menu-container');
            if (mm) mm.style.display = 'flex'; if(if (mm) mm) { let title = if (mm) mm.querySelector('h1, h2'); if(title) title.focus(); else if (mm) mm.focus(); };
            if (typeof speak === 'function') speak("Hazırlık maçı sona erdi.");
        } else if(window.leagueData && typeof window.leagueData.playMatch === 'function') {
            window.leagueData.playMatch();
        } else {
            if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
            const mm = document.getElementById('main-menu-container');
            if (mm) mm.style.display = 'flex'; if(if (mm) mm) { let title = if (mm) mm.querySelector('h1, h2'); if(title) title.focus(); else if (mm) mm.focus(); };
        }
        
        // AÅžAMA 35: Yüzleşme Diyaloglarını Kontrol Et
        if (typeof checkPsychologyDialogue === 'function') {
            checkPsychologyDialogue();
        }
    }, 5000);
}"""

replacement = """    setTimeout(() => {
        let proceedToNextMenu = () => {
            if (window.isFriendlyMatch) {
                window.isFriendlyMatch = false;
                if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
                const mm = document.getElementById('main-menu-container');
                if (mm) { mm.style.display = 'flex'; let title = mm.querySelector('h1, h2'); if(title) title.focus(); else mm.focus(); }
                if (typeof speak === 'function') speak("Hazırlık maçı sona erdi.");
            } else if(window.leagueData && typeof window.leagueData.playMatch === 'function') {
                window.leagueData.playMatch();
            } else {
                if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
                const mm = document.getElementById('main-menu-container');
                if (mm) { mm.style.display = 'flex'; let title = mm.querySelector('h1, h2'); if(title) title.focus(); else mm.focus(); }
            }
            if (typeof checkPsychologyDialogue === 'function') {
                checkPsychologyDialogue();
            }
        };

        let isLoss = (playerScore - enemyScore) < 0;
        let isHeavyDefeat = (playerScore - enemyScore) <= -3;
        
        if (isLoss && typeof showPunishmentModal === 'function') {
            showPunishmentModal(isHeavyDefeat, proceedToNextMenu);
        } else {
            proceedToNextMenu();
        }
    }, 5000);
}

window.showPunishmentModal = function(isHeavyDefeat, callback) {
    const modal = document.createElement('div');
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = isHeavyDefeat ? "linear-gradient(to bottom, #c0392b, #8e44ad)" : "linear-gradient(to bottom, #2c3e50, #34495e)";
    modal.style.border = isHeavyDefeat ? "5px solid #000" : "3px solid #e74c3c";
    modal.style.padding = "30px";
    modal.style.zIndex = "10000";
    modal.style.color = "white";
    modal.style.boxShadow = "0 0 30px rgba(0,0,0,0.9)";
    modal.style.borderRadius = "15px";
    modal.style.textAlign = "center";
    modal.style.width = "500px";

    let title = document.createElement('h2');
    title.innerHTML = isHeavyDefeat ? "🔥 SOYUNMA ODASINDA HEZİMET SESSİZLİĞİ 🔥" : "🚪 SOYUNMA ODASINA GİRDİNİZ";
    title.style.color = isHeavyDefeat ? "#f1c40f" : "#ecf0f1";
    
    let text = document.createElement('p');
    text.innerHTML = isHeavyDefeat 
        ? "Takım sahada darmadağın oldu. Herkesin başı önde, soyunma odasında ölüm sessizliği var. Oyuncular korkarak sizin ne diyeceğinizi bekliyor..."
        : "Mağlubiyetin ardından soyunma odasında moral bozukluğu hakim. Takım gözlerinizin içine bakıyor.";
    text.style.fontSize = "1.2rem";
    text.style.marginBottom = "20px";

    let optionsContainer = document.createElement('div');
    optionsContainer.style.display = "flex";
    optionsContainer.style.flexDirection = "column";
    optionsContainer.style.gap = "15px";

    let applyPunishment = (type) => {
        let msg = "";
        if (typeof homePlayers !== 'undefined' && window.leagueData) {
            let myTeam = window.leagueData.teams.find(t => t.id === window.leagueData.userTeamId);
            
            homePlayers.forEach(p => {
                if (type === 'harsh') {
                    p.loyalty = Math.max(0, (p.loyalty || 50) - (isHeavyDefeat ? 20 : 10));
                    p.condition = Math.max(10, (p.condition || 100) - 25);
                    p.aggression = Math.min(100, (p.aggression || 50) + 30);
                    p.happiness = "Öfkeli 😡";
                } else if (type === 'soft') {
                    p.loyalty = Math.min(100, (p.loyalty || 50) + 5);
                    p.happiness = "Umutlu 😊";
                }
            });

            if (type === 'harsh') {
                if (myTeam) {
                    let fine = isHeavyDefeat ? 5 : 2;
                    myTeam.budget += fine;
                    msg = `Takımı duvarlara vura vura fırçaladınız! Ekstra idman cezası verildi, primler kesildi (+${fine}M Euro bütçeye eklendi). Oyuncular size kırgın ama bir sonraki maç sahayı rakibe dar etmek için kuduruyorlar!`;
                }
            } else if (type === 'soft') {
                msg = "Baba şefkatiyle yaklaştınız. 'Başınızı dik tutun, haftaya telafi edeceğiz' dediniz. Oyuncuların size olan sevgisi arttı.";
            } else {
                msg = "Tek kelime etmeden soyunma odasını terk ettiniz. Oyuncular aralarında tartışmaya devam etti.";
            }
        }
        
        document.body.removeChild(modal);
        if(typeof speak === 'function') speak(msg);
        alert(msg);
        callback();
    };

    let btnHarsh = document.createElement('button');
    btnHarsh.style.padding = "15px";
    btnHarsh.style.backgroundColor = "#c0392b";
    btnHarsh.style.color = "white";
    btnHarsh.style.border = "none";
    btnHarsh.style.borderRadius = "5px";
    btnHarsh.style.cursor = "pointer";
    btnHarsh.innerHTML = "🤬 Saç Kurutma Makinesi (Bağır, Maaş Kes, Ekstra İdman Koy)";
    btnHarsh.onclick = () => applyPunishment('harsh');

    let btnSoft = document.createElement('button');
    btnSoft.style.padding = "15px";
    btnSoft.style.backgroundColor = "#27ae60";
    btnSoft.style.color = "white";
    btnSoft.style.border = "none";
    btnSoft.style.borderRadius = "5px";
    btnSoft.style.cursor = "pointer";
    btnSoft.innerHTML = "🤝 Babacan Yaklaş (Moral Ver, Sahip Çık)";
    btnSoft.onclick = () => applyPunishment('soft');

    let btnIgnore = document.createElement('button');
    btnIgnore.style.padding = "15px";
    btnIgnore.style.backgroundColor = "#7f8c8d";
    btnIgnore.style.color = "white";
    btnIgnore.style.border = "none";
    btnIgnore.style.borderRadius = "5px";
    btnIgnore.style.cursor = "pointer";
    btnIgnore.innerHTML = "🚪 Hiçbir Şey Söylemeden Odayı Terk Et";
    btnIgnore.onclick = () => applyPunishment('ignore');

    optionsContainer.appendChild(btnHarsh);
    optionsContainer.appendChild(btnSoft);
    optionsContainer.appendChild(btnIgnore);

    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(optionsContainer);
    
    document.body.appendChild(modal);
};"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED TO FIND TARGET")

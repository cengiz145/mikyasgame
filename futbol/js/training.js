// training.js - Gerçekçi Antrenman Sistemi (Zaman Sınırlamalı)

function openTrainingFacility() {
    let container = document.getElementById('training-container');
    let list = document.getElementById('training-list');
    let budgetDisplay = document.getElementById('training-budget-display');
    
    list.innerHTML = "";
    
    if (!window.myTeam) {
        if (window.leagueData && window.leagueData.teams) {
            window.myTeam = window.leagueData.teams[0]; 
        } else {
            return;
        }
    }

    budgetDisplay.textContent = `Bütçe: €${window.myTeam.budget.toFixed(1)}M (İdman Tesis Gideri: Saat başına ufak kesinti)`;
    
    let myPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeam.id);
    
    myPlayers.forEach(p => {
        // İdman saatini başlat (eğer yoksa 2 saat)
        if (p.trainingHoursLeft === undefined) p.trainingHoursLeft = 2;
        
        // Yeni statları başlat (eğer yoksa)
        if (p.passing === undefined) p.passing = p.power; 
        if (p.shooting === undefined) p.shooting = p.power;
        if (p.setPieces === undefined) p.setPieces = p.power - 10;
        if (p.stamina === undefined) p.stamina = p.power;

        let li = document.createElement('li');
        li.style.borderBottom = "1px solid #444";
        li.style.padding = "10px";
        li.style.display = "flex"; if(li) { let title = li.querySelector('h1, h2'); if(title) title.focus(); else li.focus(); };
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        
        // Oyuncu Bilgileri (Saat Göstergesiyle)
        let infoDiv = document.createElement('div');
        let hoursColor = p.trainingHoursLeft > 3 ? "#2ecc71" : (p.trainingHoursLeft > 0 ? "#f39c12" : "#e74c3c");
        
        infoDiv.innerHTML = `
            <strong style="font-size:1.2rem; color:#fff;">${p.name}</strong> 
            <span style="color:#aaa;">(${p.age} Yaş - ${p.position})</span><br>
            <span style="color:#2ecc71;">Güç: ${Math.round(p.power)}</span> | 
            <span style="color:#3498db;">Pas: ${Math.round(p.passing)}</span> | 
            <span style="color:#e67e22;">Şut: ${Math.round(p.shooting)}</span> | 
            <span style="color:#9b59b6;">Kondisyon: ${Math.round(p.stamina)}</span><br>
            <strong style="color:${hoursColor}; font-size:1.1rem;">Kalan İdman Süresi: ${p.trainingHoursLeft.toFixed(1)} Saat</strong>
        `;
        
        let actionsDiv = document.createElement('div');
        actionsDiv.style.display = "flex"; if(actionsDiv) { let title = actionsDiv.querySelector('h1, h2'); if(title) title.focus(); else actionsDiv.focus(); };
        actionsDiv.style.gap = "10px";
        actionsDiv.style.flexWrap = "wrap";
        actionsDiv.style.maxWidth = "400px";
        actionsDiv.style.justifyContent = "flex-end";
        
        // İdman Butonları
        let btnMevki = createTrainBtn("Mevki Antrenmanına Yolla (2s)", "#e67e22", p.trainingHoursLeft >= 2, () => trainPlayer(p, 'mevki', 2, 0.2));
        
        actionsDiv.appendChild(btnMevki);
        
        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
        list.appendChild(li);
    });

    if (typeof showContainer === 'function') showContainer('training-container'); 
    else container.style.display = 'block';
}

function createTrainBtn(text, color, isEnabled, onClick) {
    let btn = document.createElement('button');
    btn.textContent = text;
    btn.className = "menu-button";
    btn.style.padding = "5px 10px";
    btn.style.fontSize = "0.9rem";
    btn.style.backgroundColor = isEnabled ? color : "#555";
    btn.style.color = isEnabled ? "white" : "#aaa";
    btn.disabled = !isEnabled;
    if (isEnabled) btn.onclick = onClick;
    return btn;
}

function trainPlayer(p, type, hoursCost, moneyCost) {
    if (window.myTeam.budget < moneyCost) {
        if(typeof speak === 'function') speak("Yeterli bütçeniz yok!");
        return;
    }
    if (p.trainingHoursLeft < hoursCost) {
        if(typeof speak === 'function') speak("Oyuncu bugünlük çok yorgun!");
        return;
    }
    
    let ageMultiplier = 1.0;
    if (p.age >= 32) ageMultiplier = 0.4;
    else if (p.age >= 29) ageMultiplier = 0.7;
    else if (p.age <= 21) ageMultiplier = 1.6;
    
    let gain = 0.3 * ageMultiplier;
    let successMsg = "";
    
    if (!window.fitnessCoachProfile) {
        window.fitnessCoachProfile = "diktator";
    }

    if (type === 'mevki') {
        let options = [];
        let pos = (p.position || "").toUpperCase();
        
        if (pos.includes('FV') || pos.includes('FORVET') || pos.includes('ST') || pos.includes('CF')) {
            options = ['shooting', 'speed', 'stamina', 'power', 'setPieces'];
        } else if (pos.includes('OS') || pos.includes('ORTA') || pos.includes('KANAT') || pos.includes('CM') || pos.includes('AM')) {
            options = ['passing', 'stamina', 'speed', 'power', 'setPieces'];
        } else if (pos.includes('DF') || pos.includes('DEFANS') || pos.includes('BEK') || pos.includes('CB') || pos.includes('LB')) {
            options = ['power', 'stamina', 'passing', 'speed'];
        } else if (pos.includes('KL') || pos.includes('KALECİ') || pos.includes('GK')) {
            options = ['power', 'passing', 'stamina'];
        } else {
            options = ['stamina', 'passing', 'shooting', 'setPieces', 'speed', 'power'];
        }
        
        let chosenStat = options[Math.floor(Math.random() * options.length)];
        
        if (window.fitnessCoachProfile === 'diktator' && Math.random() < 0.15) {
            p.trainingHoursLeft -= hoursCost;
            window.myTeam.budget -= moneyCost;
            p.isInjured = true;
            p.stamina -= 10;
            if(typeof speak === 'function') speak(`Eyvah! ${p.name} diktatörün yoğun mevki idmanına dayanamadı ve sakatlanarak idmanı yarıda bıraktı.`);
            openTrainingFacility();
            return;
        }
        
        let diktatorBonus = (window.fitnessCoachProfile === 'diktator') ? 2.0 : 1.0;
        let totalGain = gain * diktatorBonus * 2.0;

        if (chosenStat === 'stamina') {
            p.stamina += totalGain;
            successMsg = `${p.name} mevki idmanında nefes nefese kaldı, KONDİSYONU ciddi şekilde arttı!`;
        } else if (chosenStat === 'passing') {
            p.passing = (p.passing || p.power) + totalGain;
            successMsg = `${p.name} taktiksel pas organizasyonlarında çok sivrildi, PAS yeteneği gelişti!`;
        } else if (chosenStat === 'shooting') {
            p.shooting = (p.shooting || p.power) + totalGain;
            successMsg = `${p.name} gol vuruşlarında harikalar yarattı, ŞUT tekniği keskinleşti!`;
        } else if (chosenStat === 'setPieces') {
            p.setPieces = (p.setPieces || p.power) + totalGain;
            successMsg = `${p.name} ölü toplarda ekstra mesafe kat etti, DURAN TOP yeteneği arttı!`;
        } else if (chosenStat === 'speed') {
            p.speed += (0.2 * ageMultiplier * diktatorBonus);
            successMsg = `${p.name} sprint idmanlarında fırtına gibiydi, HIZI arttı!`;
        } else if (chosenStat === 'power') {
            p.power += totalGain;
            successMsg = `${p.name} ağırlık salonundan çıkmadı, genel GÜCÜ ve fiziği muazzam arttı!`;
        }
    }
    
    p.power += (gain * 0.1); // Her idman genel gücü minik artırır
    p.trainingHoursLeft -= hoursCost;
    window.myTeam.budget -= moneyCost;
    
    if(p.power > 99) p.power = 99;
    if(p.stamina > 99) p.stamina = 99;
    if(p.passing > 99) p.passing = 99;
    if(p.shooting > 99) p.shooting = 99;
    if(p.setPieces > 99) p.setPieces = 99;
    if(p.speed > 5.5) p.speed = 5.5;
    
    if(typeof speak === 'function') speak(successMsg);
    openTrainingFacility();
}

document.addEventListener("DOMContentLoaded", () => {
    let btnTraining = document.getElementById('btn-training-facility');
    let btnBackTraining = document.getElementById('btn-back-training');
    
    if (btnTraining) btnTraining.addEventListener('click', openTrainingFacility);
    if (btnBackTraining) {
        btnBackTraining.addEventListener('click', () => {
            if (typeof showContainer === 'function') showContainer('main-menu-container'); 
        });
    }
});

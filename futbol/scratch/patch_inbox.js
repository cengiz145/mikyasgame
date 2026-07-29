const fs = require('fs');

let scoutContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');

// Add the queue and showNextEvent at the top, replace advanceDay
let targetAdvanceDay = `function advanceDay() {
  window.totalDaysPassed = (window.totalDaysPassed || 0) + 1;
  window.currentDay++;
  if (window.currentDay > 30) {
    window.currentDay = 1;
    window.currentMonth++;
    if (window.currentMonth > 12) {
      window.currentMonth = 1;
      window.currentYear++;
    }
  }
  
  updateCalendarUI();
  checkScoutArrivals();
  if(typeof speak === 'function') speak(\`\${window.currentDay} gününe geçildi.\`);
}`;

let replaceAdvanceDay = `window.eventQueue = window.eventQueue || [];

window.showNextEvent = function() {
    if (!window.eventQueue || window.eventQueue.length === 0) return false;

    let event = window.eventQueue.shift();
    
    let overlay = document.createElement('div');
    overlay.style.position = "fixed";
    overlay.style.top = "50%";
    overlay.style.left = "50%";
    overlay.style.transform = "translate(-50%, -50%)";
    overlay.style.background = "#2c3e50";
    overlay.style.border = "3px solid #f1c40f";
    overlay.style.padding = "30px";
    overlay.style.zIndex = "99999";
    overlay.style.color = "white";
    overlay.style.textAlign = "center";
    overlay.style.width = "450px";
    overlay.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
    overlay.style.borderRadius = "10px";
    
    let title = document.createElement('h2');
    title.innerHTML = "📨 " + event.title;
    title.style.color = "#f1c40f";
    
    let msg = document.createElement('p');
    msg.innerHTML = event.message;
    msg.style.margin = "20px 0";
    msg.style.fontSize = "1.1rem";
    
    let btn = document.createElement('button');
    btn.className = "menu-button";
    btn.style.width = "100%";
    btn.style.backgroundColor = "#27ae60";
    btn.innerText = event.actionText || "Tamam (Okudum)";
    btn.onclick = () => {
        document.body.removeChild(overlay);
        if (event.actionCallback) event.actionCallback();
        
        // Zincirleme
        if (window.eventQueue.length > 0) {
            window.showNextEvent();
        }
    };
    
    overlay.appendChild(title);
    overlay.appendChild(msg);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
    
    if(typeof speak === 'function') speak(event.title + ". " + event.message.replace(/<[^>]+>/g, ''));
    return true;
};

function advanceDay() {
    // 1. Önce bekleyen olayları kontrol et
    if (window.eventQueue && window.eventQueue.length > 0) {
        if(typeof speak === 'function') speak("Hocam, kulüpte çözülmesi gereken işler var. Günü atlamadan önce bunları okumalısınız.");
        window.showNextEvent();
        return; 
    }

    // 2. Olay yoksa günü atla
    window.totalDaysPassed = (window.totalDaysPassed || 0) + 1;
    window.currentDay++;
    if (window.currentDay > 30) {
        window.currentDay = 1;
        window.currentMonth++;
        if (window.currentMonth > 12) {
            window.currentMonth = 1;
            window.currentYear++;
        }
    }
    
    updateCalendarUI();
    
    // 3. Yeni günde olan olayları tetikle
    if (typeof window.resolvePendingTransfers === 'function') window.resolvePendingTransfers();
    checkScoutArrivals();
    
    // 4. Eğer olay oluşmuşsa anında göster
    if (window.eventQueue && window.eventQueue.length > 0) {
        window.showNextEvent();
    } else {
        if(typeof speak === 'function') speak(\`\${window.currentDay} gününe geçildi.\`);
    }
}`;

scoutContent = scoutContent.replace(targetAdvanceDay, replaceAdvanceDay);


// Fix checkScoutArrivals
let targetScoutAlert = `      if(typeof speak === 'function') speak(\`Müjde! Gözlemciniz \${scout.profile} profilindeki oyuncu için raporunu tamamladı: \${scout.targetName}\`);
      alert(\`Müjde!\\nGözlemciniz \${scout.profile} profilindeki \${scout.targetName} için raporunu tamamladı! Transfer ekranından raporu inceleyebilirsiniz.\`);`;

let replaceScoutAlert = `      window.eventQueue = window.eventQueue || [];
      window.eventQueue.push({
          title: "Scout Raporu Hazır",
          message: \`Gözlemciniz <strong>\${scout.profile}</strong>, <strong>\${scout.targetName}</strong> için raporunu tamamladı!<br>Transfer ekranından raporu inceleyebilirsiniz.\`
      });`;

scoutContent = scoutContent.replace(targetScoutAlert, replaceScoutAlert);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', scoutContent, 'utf8');

// --- TRANSFER.JS PATCH ---
let transferContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

let targetTransferAlert = `    // Raporları tek bir alert veya popup ile göster
    if (reports.length > 0) {
        let msg = "📝 TRANSFER RAPORU:\\n\\n" + reports.join("\\n\\n");
        alert(msg);
    }`;

let replaceTransferAlert = `    // Raporları Event Queue'ya gönder
    if (reports.length > 0) {
        window.eventQueue = window.eventQueue || [];
        window.eventQueue.push({
            title: "Transfer Komitesi",
            message: reports.join("<br><br>")
        });
    }`;

transferContent = transferContent.replace(targetTransferAlert, replaceTransferAlert);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', transferContent, 'utf8');

console.log('Patch scout and transfer queue applied successfully.');

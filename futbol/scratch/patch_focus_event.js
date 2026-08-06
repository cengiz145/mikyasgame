const fs = require('fs');

let scoutContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', 'utf8');

// Add isEventModalOpen flag and fix focus
let targetShowEvent = `window.showNextEvent = function() {
    if (!window.eventQueue || window.eventQueue.length === 0) return false;

    let event = window.eventQueue.shift();`;

let replaceShowEvent = `window.isEventModalOpen = false;

window.showNextEvent = function() {
    if (window.isEventModalOpen) return false; // Zaten açık modal var
    if (!window.eventQueue || window.eventQueue.length === 0) return false;

    window.isEventModalOpen = true;
    let event = window.eventQueue.shift();`;

let targetBtnClick = `    btn.onclick = () => {
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
    return true;`;

let replaceBtnClick = `    btn.onclick = () => {
        document.body.removeChild(overlay);
        window.isEventModalOpen = false;
        
        if (event.actionCallback) event.actionCallback();
        
        // Zincirleme kontrol
        if (window.eventQueue && window.eventQueue.length > 0) {
            setTimeout(() => window.showNextEvent(), 100);
        } else {
            // Modal bittiyse İleri Sar butonuna odaklan (Oyun akışını bozmamak için)
            let advBtn = document.getElementById('btn-advance-day');
            if (advBtn && advBtn.style.display !== 'none') advBtn.focus();
        }
    };
    
    overlay.appendChild(title);
    overlay.appendChild(msg);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
    
    // Tıklama problemi: Odak modal'a geçmeli!
    setTimeout(() => {
        btn.focus();
    }, 50);
    
    if(typeof speak === 'function') speak(event.title + ". " + event.message.replace(/<[^>]+>/g, ''));
    return true;`;

scoutContent = scoutContent.replace(targetShowEvent, replaceShowEvent);
scoutContent = scoutContent.replace(targetBtnClick, replaceBtnClick);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\scout.js', scoutContent, 'utf8');

console.log('Patch scout event focus applied successfully.');

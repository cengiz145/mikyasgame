const fs = require('fs');
const path = require('path');

// 1. PATCH MENU.JS for Auto-Fill Formation Nulls & Budget Sanitization
const menuPath = path.join(__dirname, '..', 'js', 'menu.js');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// Replace budget assignment in updateMenuStats to sanitize
const updateStatsRegex = /document\.getElementById\('budget-display'\)\.textContent = window\.budget\.toLocaleString\(\) \+ " \?";/m;
const updateStatsRepl = `
    if (isNaN(window.budget)) window.budget = 0; // Kasa (NaN) Hatası Çözümü
    document.getElementById('budget-display').textContent = window.budget.toLocaleString() + " €";
`;
menuContent = menuContent.replace(updateStatsRegex, updateStatsRepl.trim());

// Intercept Match start to auto-fill formation
const matchStartRegex = /if \(window\.currentDayOfWeek === 7 && this\.innerHTML\.includes\("Maça Çık"\)\) \{/m;
const matchStartRepl = `
        if (window.currentDayOfWeek === 7 && this.innerHTML.includes("Maça Çık")) {
            // [HATA DÜZELTME]: Eksik (null) İlk 11 kontrolü
            if (window.myTeam && window.myTeam.formation) {
                let nullCount = 0;
                for (let i = 0; i < 11; i++) {
                    if (window.myTeam.formation[i] === null) {
                        nullCount++;
                        // Kadrodan boşta olan en güçlü adamı bul
                        let availablePlayers = window.leagueData.players.filter(p => p.teamId === window.myTeam.id && !window.myTeam.formation.includes(p.id) && !window.myTeam.subs.includes(p.id) && (!p.injuredWeeks || p.injuredWeeks <= 0) && (!p.redCardWeeks || p.redCardWeeks <= 0));
                        availablePlayers.sort((a,b) => b.power - a.power);
                        
                        if (availablePlayers.length > 0) {
                            window.myTeam.formation[i] = availablePlayers[0].id;
                        } else {
                            // Yedeklerden çek (Çaresizlik)
                            let subPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeam.id && window.myTeam.subs.includes(p.id));
                            if (subPlayers.length > 0) {
                                window.myTeam.formation[i] = subPlayers[0].id;
                                let subIdx = window.myTeam.subs.indexOf(subPlayers[0].id);
                                if (subIdx !== -1) window.myTeam.subs[subIdx] = null;
                            }
                        }
                    }
                }
                if (nullCount > 0) {
                    let warnMsg = "Kritik Uyarı: Takımınızdan ayrılan/isyan eden oyuncular yüzünden İlk 11'de eksiklikler vardı. Sistem sizin için en uygun oyuncuları sahaya sürdü. Lütfen bir dahaki maça kadronuzu kontrol edin.";
                    alert(warnMsg);
                    if(typeof speak === 'function') speak("Başkanım, İlk 11'de eksiklerimiz vardı. Maça çıkmadan önce yerlerine yedekleri yerleştirdim.");
                }
            }
`;
menuContent = menuContent.replace(matchStartRegex, matchStartRepl.trim());
fs.writeFileSync(menuPath, menuContent, 'utf8');

// 2. PATCH TRANSFER.JS for Budget Sanitization
const transferPath = path.join(__dirname, '..', 'js', 'transfer.js');
let transferContent = fs.readFileSync(transferPath, 'utf8');

const parseOfferRegex = /let offer = parseInt\(document\.getElementById\('neg-offer-input'\)\.value\);/m;
const parseOfferRepl = `
    let offer = parseInt(document.getElementById('neg-offer-input').value);
    if (isNaN(offer)) offer = 0;
`;
transferContent = transferContent.replace(parseOfferRegex, parseOfferRepl.trim());
fs.writeFileSync(transferPath, transferContent, 'utf8');

// 3. PATCH ANNOUNCER.JS for Speech Queuing
const announcerPath = path.join(__dirname, '..', 'js', 'announcer.js');
let announcerContent = fs.readFileSync(announcerPath, 'utf8');

const speakRegex = /window\.speak = function\(text, priority = false\) \{([\s\S]*?)catch \(e\) \{[\s\S]*?\}\n\};/m;
const speakRepl = `
window.speechQueue = [];
window.isSpeakingNow = false;

window.speak = function(text, priority = false) {
    if (!text) return;
    text = processAICommentary(text);

    try {
        const uiText = document.getElementById('announcer-text');
        if (uiText) uiText.textContent = text;
        const liveRegion = document.getElementById('live-announcer');
        if (liveRegion) liveRegion.textContent = text;

        if (window.speechEnabled && 'speechSynthesis' in window) { 
            if(priority) {
                window.speechSynthesis.cancel(); 
                window.speechQueue = [];
            }
            
            window.speechQueue.push(text);
            processSpeechQueue();
        }
    } catch (e) {
        console.error("Spiker motorunda hata:", e);
    }
};

function processSpeechQueue() {
    if (window.isSpeakingNow || window.speechQueue.length === 0) return;
    
    let nextText = window.speechQueue.shift();
    window.isSpeakingNow = true;
    
    let utterance = new SpeechSynthesisUtterance(nextText); 
    utterance.lang = 'tr-TR'; 
    utterance.rate = 1.1; 
    let voices = window.speechSynthesis.getVoices(); 
    let trVoice = voices.find(v => v.lang === 'tr-TR'); 
    if(trVoice) utterance.voice = trVoice; 
    
    utterance.onend = function() {
        window.isSpeakingNow = false;
        processSpeechQueue();
    };
    
    utterance.onerror = function() {
        window.isSpeakingNow = false;
        processSpeechQueue();
    };
    
    window.speechSynthesis.speak(utterance); 
}
`;

announcerContent = announcerContent.replace(speakRegex, speakRepl.trim());
fs.writeFileSync(announcerPath, announcerContent, 'utf8');

console.log("Cleanup patches successfully applied.");

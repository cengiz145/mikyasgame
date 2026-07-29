const fs = require('fs');
let content = fs.readFileSync('js/game.js', 'utf8');

// Chunk 1
const target1 = `    // AŞAMA 31: Bağımsız Veritabanından Takım Çekme (Data.js)
    let homeRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.myTeamId || "galatasaray")) : [];
    let awayRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.todayOpponent || "fenerbahce")) : [];
    
    // --- YENİ KADRO ENTEGRASYONU ---`;
const replace1 = `    // AŞAMA 31: Bağımsız Veritabanından Takım Çekme (Data.js)
    let homeRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.myTeamId || "galatasaray")) : [];
    
    let opponentId = window.todayOpponent || "fenerbahce";
    if (window.isFriendlyMatch && window.friendlyOpponentId) {
        opponentId = window.friendlyOpponentId;
    }
    let awayRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === opponentId) : [];
    
    // --- YENİ KADRO ENTEGRASYONU ---`;

// Chunk 2
const target2 = `        if (typeof announcerText !== 'undefined') {
            let formNames = ["", "TRİBÜN FORMU 1: ROMANTİK İYİMSERLİK", "TRİBÜN FORMU 2: TAKTİKSEL HOMURDANMA", "TRİBÜN FORMU 3: YIKILAN KALE (TRAVMA)", "TRİBÜN FORMU 4: TOKSİK İSYAN", "TRİBÜN FORMU 5: RUHSUZ KABULLENİŞ", "TRİBÜN FORMU 6: GEÇMİŞİN HAYALETLERİ", "TRİBÜN FORMU 7: ABSÜRT KARNAVAL"];
            announcerText.textContent = "HAFTA " + window.currentWeek + " | " + formNames[newForm];
        }
    }`;
const replace2 = `        if (typeof announcerText !== 'undefined') {
            let formNames = ["", "TRİBÜN FORMU 1: ROMANTİK İYİMSERLİK", "TRİBÜN FORMU 2: TAKTİKSEL HOMURDANMA", "TRİBÜN FORMU 3: YIKILAN KALE (TRAVMA)", "TRİBÜN FORMU 4: TOKSİK İSYAN", "TRİBÜN FORMU 5: RUHSUZ KABULLENİŞ", "TRİBÜN FORMU 6: GEÇMİŞİN HAYALETLERİ", "TRİBÜN FORMU 7: ABSÜRT KARNAVAL"];
            
            if (window.isFriendlyMatch) {
                announcerText.textContent = "HAZIRLIK MAÇI | " + formNames[newForm];
            } else {
                announcerText.textContent = "HAFTA " + window.currentWeek + " | " + formNames[newForm];
            }
        }
    }`;

// Chunk 3
const target3 = `    setTimeout(() => {
        if(window.leagueData && typeof window.leagueData.playMatch === 'function') {
            window.leagueData.playMatch();
        } else {
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('menu-screen').classList.remove('hidden');
        }
        
        // AŞAMA 35: Yüzleşme Diyaloglarını Kontrol Et
        if (typeof checkPsychologyDialogue === 'function') {
            checkPsychologyDialogue();
        }
    }, 5000);`;
const replace3 = `    setTimeout(() => {
        if (window.isFriendlyMatch) {
            // Lig puanlamasını atla, sadece menüye dön
            window.isFriendlyMatch = false; // Temizle
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('menu-screen').classList.remove('hidden');
            if (typeof speak === 'function') speak("Hazırlık maçı sona erdi.");
        } else if(window.leagueData && typeof window.leagueData.playMatch === 'function') {
            window.leagueData.playMatch();
        } else {
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('menu-screen').classList.remove('hidden');
        }
        
        // AŞAMA 35: Yüzleşme Diyaloglarını Kontrol Et
        if (typeof checkPsychologyDialogue === 'function') {
            checkPsychologyDialogue();
        }
    }, 5000);`;

if (!content.includes(target1)) console.log('Chunk 1 not found');
if (!content.includes(target2)) console.log('Chunk 2 not found');
if (!content.includes(target3)) console.log('Chunk 3 not found');

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);
content = content.replace(target3, replace3);

fs.writeFileSync('js/game.js', content);
console.log('Done');

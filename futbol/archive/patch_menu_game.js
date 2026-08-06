const fs = require('fs');

// --- 1. MENU.JS DÜZELTMELERİ (Takım Atama ve Rakip Bulma) ---
const menuFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\menu.js';
if (fs.existsSync(menuFile)) {
    let menuContent = fs.readFileSync(menuFile, 'utf8');
    
    // window.myTeamId atamasını ekle
    menuContent = menuContent.replace(
        /window\.league = window\.league \|\| \{\};\s*window\.league\.userTeamId = team\.id;/,
        'window.league = window.league || {};\n                window.league.userTeamId = team.id;\n                window.myTeamId = team.id; // CRITICAL FIX: Make myTeamId globally available'
    );
    
    // btn-play-match logic'ini düzelt
    const oldPlayMatch = /document\.getElementById\('btn-play-match'\)\?\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/;
    const newPlayMatch = `document.getElementById('btn-play-match')?.addEventListener('click', () => {
        // O haftaki rakibi bul ve ata
        if (typeof window.getNextOpponent === 'function') {
            window.todayOpponent = window.getNextOpponent();
        } else if (window.fixture && window.fixture[window.currentWeek - 1]) {
            let weekMatches = window.fixture[window.currentWeek - 1];
            let myMatch = weekMatches.find(m => m.home === window.myTeamId || m.away === window.myTeamId);
            if (myMatch) {
                window.todayOpponent = (myMatch.home === window.myTeamId) ? myMatch.away : myMatch.home;
            }
        }
        
        // Eğer rakip bulunamadıysa fallback (Çökmemesi için)
        if (!window.todayOpponent) window.todayOpponent = "fenerbahce"; 
        
        // Arayüzleri gizle, maçı başlat
        if(typeof window.initGame === 'function') {
            const containers = document.querySelectorAll('.menu-container');
            containers.forEach(c => c.style.display = 'none');
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) gameContainer.style.display = 'block';
            window.initGame();
        } else {
            console.error("Maç Motoru (initGame) yüklenemedi.");
            alert("Maç motorunda hata oluştu!");
        }
    });`;
    
    menuContent = menuContent.replace(oldPlayMatch, newPlayMatch);
    fs.writeFileSync(menuFile, menuContent, 'utf8');
    console.log("menu.js güncellendi (Takım Atama ve Rakip Bulma).");
} else {
    console.log("menu.js bulunamadı!");
}

// --- 2. GAME.JS İÇİN SIFIRLAMA MANTIĞI EKLENTİSİ ---
const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let gameContent = fs.readFileSync(gameFile, 'utf8');
    
    // initGame fonksiyonunun başında eski DOM elemanlarını ve setInterval'leri temizleme
    const oldInitGame = /function initGame\(\) \{/;
    const newInitGame = `function initGame() {
    // Önceki maçtan kalan timer'ları temizle (Çift çalışma hatasını önler)
    if (typeof matchTimer !== 'undefined') clearInterval(matchTimer);
    if (typeof matchEventTimer !== 'undefined') clearInterval(matchEventTimer);
    if (typeof drawInterval !== 'undefined') clearInterval(drawInterval);
    
    // Sahadaki önceki elementleri temizle (Eğer varsa)
    const pitch = document.getElementById('pitch');
    if (pitch) {
        pitch.innerHTML = '<div id="ball"></div>'; // Topu bırak, diğerlerini temizle
    }
    
    // Skor tabelasını sıfırla
    const scoreA = document.getElementById('score-home');
    const scoreB = document.getElementById('score-away');
    if (scoreA) scoreA.textContent = "0";
    if (scoreB) scoreB.textContent = "0";
    `;
    
    if (!gameContent.includes('clearInterval(matchTimer)')) {
        gameContent = gameContent.replace(oldInitGame, newInitGame);
        fs.writeFileSync(gameFile, gameContent, 'utf8');
        console.log("game.js güncellendi (Maç Motoru Sıfırlama Mekaniği Eklendi).");
    } else {
        console.log("game.js zaten sıfırlama mekaniğine sahip.");
    }
}

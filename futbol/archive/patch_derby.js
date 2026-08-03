const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Maç başladığında Derby kontrolü ve UI animasyonu
    const oldInitRoster = /let homeRoster = window\.leagueData \? window\.leagueData\.players\.filter\(p => p\.teamId === \(window\.myTeamId \|\| "galatasaray"\)\) : \[\];\s*let awayRoster = window\.leagueData \? window\.leagueData\.players\.filter\(p => p\.teamId === \(window\.todayOpponent \|\| "fenerbahce"\)\) : \[\];/;
    
    const newInitRoster = `let homeRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.myTeamId || "galatasaray")) : [];
    let awayRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.todayOpponent || "fenerbahce")) : [];
    
    // --- YENİ: DERBİ KONTROLÜ ---
    let myTeamIdStr = window.myTeamId || "galatasaray";
    let oppTeamIdStr = window.todayOpponent || "fenerbahce";
    let myTeamData = window.leagueData.teams.find(t => t.id === myTeamIdStr) || {};
    let oppTeamData = window.leagueData.teams.find(t => t.id === oppTeamIdStr) || {};
    
    const big4 = ["galatasaray", "fenerbahce", "besiktas", "trabzonspor"];
    let isBig4Derby = big4.includes(myTeamIdStr) && big4.includes(oppTeamIdStr);
    let isCityDerby = (myTeamData.city && oppTeamData.city && myTeamData.city === oppTeamData.city);
    window.isDerbyMatch = isBig4Derby || isCityDerby;
    
    if (window.isDerbyMatch) {
        let derbyOverlay = document.createElement('div');
        derbyOverlay.id = 'derby-overlay';
        derbyOverlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#e74c3c; animation: flash 0.5s infinite alternate;";
        
        // CSS animasyon ekle (Eğer yoksa)
        if(!document.getElementById('derby-style')) {
            let style = document.createElement('style');
            style.id = 'derby-style';
            style.innerHTML = "@keyframes flash { from { text-shadow: 0 0 10px #e74c3c; } to { text-shadow: 0 0 30px #f1c40f, 0 0 40px #e74c3c; } }";
            document.head.appendChild(style);
        }
        
        let title = isBig4Derby ? "TÜRKİYE DERBİSİ!" : "ŞEHİR DERBİSİ!";
        derbyOverlay.innerHTML = '<h1 style="font-size:4rem; margin:0; text-transform:uppercase;">' + title + '</h1>' +
                                 '<h2 style="font-size:2rem; color:white;">' + myTeamData.name + ' vs ' + oppTeamData.name + '</h2>' +
                                 '<p style="color:#f1c40f; font-size:1.5rem; margin-top:20px;">Derbi ateşi oyuncularını sardı! Adrenalin tavan yaptı!</p>';
        document.getElementById('game-container').appendChild(derbyOverlay);
        
        setTimeout(() => {
            if(document.getElementById('derby-overlay')) document.getElementById('derby-overlay').remove();
        }, 3000);
    }
    // --- DERBİ KONTROLÜ SONU ---`;
    
    content = content.replace(oldInitRoster, newInitRoster);
    
    // 2. Oyuncuların Gücünü ve Hızını Derbide Artırma
    const oldPlayerLoop = /for\(let i=0; i<11; i\+\+\) \{[\s\S]*?let hp = \(homeRoster\.length > i\) \? homeRoster\[i\] : \{ name: "Oyuncu "\+\(i\+1\), speed: 3\.5, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor' \};/;
    const newPlayerLoop = `for(let i=0; i<11; i++) {
        let hpOriginal = (homeRoster.length > i) ? homeRoster[i] : { name: "Oyuncu "+(i+1), speed: 3.5, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor' };
        // Deep copy so we don't permanently modify database
        let hp = JSON.parse(JSON.stringify(hpOriginal));
        
        // --- YENİ: DERBİ ADRENALİNİ ---
        if (window.isDerbyMatch) {
            hp.power += 5; // Derbi gerginliği gücü artırır
            if (hp.mentalTrait === 'aggressive') hp.speed *= 1.1; // Agresifler derbide uçar
            if (hp.mentalTrait === 'fragile' && Math.random() < 0.3) hp.power -= 8; // Kırılganlar bazen derbiyi kaldıramaz
        }
        // --- DERBİ ADRENALİNİ SONU ---`;
    content = content.replace(oldPlayerLoop, newPlayerLoop);
    
    const oldAwayLoop = /for\(let i=0; i<11; i\+\+\) \{[\s\S]*?let ap = \(awayRoster\.length > i\) \? awayRoster\[i\] : \{ name: "Rakip "\+\(i\+1\), speed: 3\.5, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor' \};/;
    const newAwayLoop = `for(let i=0; i<11; i++) {
        let apOriginal = (awayRoster.length > i) ? awayRoster[i] : { name: "Rakip "+(i+1), speed: 3.5, tacticalRole: 'classic', mentalTrait: 'elite', power: 80, position: 'Bilinmiyor' };
        let ap = JSON.parse(JSON.stringify(apOriginal));
        
        if (window.isDerbyMatch) {
            ap.power += 5;
            if (ap.mentalTrait === 'aggressive') ap.speed *= 1.1;
            if (ap.mentalTrait === 'fragile' && Math.random() < 0.3) ap.power -= 8;
        }`;
    content = content.replace(oldAwayLoop, newAwayLoop);

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Derbi efektleri eklendi.");
} else {
    console.log("game.js bulunamadı!");
}

// 3. LEAGUE.JS İÇİN SİMÜLASYON SÜRPRİZİ (Derbide favori olmaz)
const leagueFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\league.js';
if (fs.existsSync(leagueFile)) {
    let lContent = fs.readFileSync(leagueFile, 'utf8');
    
    const oldSimulate = /window\.simulateMatch = function\(teamA, teamB\) \{[\s\S]*?let aStr = tA\.budget \+ Math\.floor\(Math\.random\(\)\*20\);[\s\S]*?let bStr = tB\.budget \+ Math\.floor\(Math\.random\(\)\*20\);/;
    const newSimulate = `window.simulateMatch = function(teamA, teamB) {
    let tA = leagueData.teams.find(t => t.id === teamA);
    let tB = leagueData.teams.find(t => t.id === teamB);
    
    const big4 = ["galatasaray", "fenerbahce", "besiktas", "trabzonspor"];
    let isBig4Derby = big4.includes(teamA) && big4.includes(teamB);
    let isCityDerby = (tA.city && tB.city && tA.city === tB.city);
    let isDerbyMatch = isBig4Derby || isCityDerby;
    
    // YENİ: Derbilerde rastgelelik çok daha yüksek olur (Büyük sürprizler)
    let randFactorA = isDerbyMatch ? Math.floor(Math.random()*40) : Math.floor(Math.random()*20);
    let randFactorB = isDerbyMatch ? Math.floor(Math.random()*40) : Math.floor(Math.random()*20);
    
    let aStr = tA.budget + randFactorA;
    let bStr = tB.budget + randFactorB;`;
    
    lContent = lContent.replace(oldSimulate, newSimulate);
    fs.writeFileSync(leagueFile, lContent, 'utf8');
    console.log("league.js - Derbi simülasyon mantığı eklendi.");
}

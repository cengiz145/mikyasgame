const fs = require('fs');

// --- 1. GAME.JS DÜZELTMESİ (Hardcode takımları dinamik yapma) ---
const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let gameContent = fs.readFileSync(gameFile, 'utf8');
    gameContent = gameContent.replace(
        /let homeRoster = window\.leagueData \? window\.leagueData\.players\.filter\(p => p\.teamId === "galatasaray"\) : \[\];/,
        'let homeRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.myTeamId || "galatasaray")) : [];'
    );
    gameContent = gameContent.replace(
        /let awayRoster = window\.leagueData \? window\.leagueData\.players\.filter\(p => p\.teamId === "fenerbahce"\) : \[\];/,
        'let awayRoster = window.leagueData ? window.leagueData.players.filter(p => p.teamId === (window.todayOpponent || "fenerbahce")) : [];'
    );
    fs.writeFileSync(gameFile, gameContent, 'utf8');
    console.log("game.js hardcoded takımları düzeltildi.");
}

// --- 2. LEAGUE.JS KÜME DÜŞME SİSTEMİ ---
const leagueFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\league.js';
let content = fs.readFileSync(leagueFile, 'utf8');

// replace showSeasonEndModal implementation
const oldModalMatch = content.match(/window\.showSeasonEndModal = function\(\) \{[\s\S]*?document\.getElementById\('btn-next-season'\)\.onclick = function\(\) \{[\s\S]*?\}\s*;/);

if (oldModalMatch) {
    const newModalLogic = `window.showSeasonEndModal = function() {
    if (window.clPhase === "Eliminated" || !window.clTournament) {
        if(typeof window.simulateEuropeanTournament === 'function') window.simulateEuropeanTournament();
    }
    window.seasonEndedModalShown = true;

    let sorted = Object.keys(window.leagueTable).map(id => {
        let st = window.leagueTable[id];
        return { id: id, pts: st.pts, av: st.gf - st.ga };
    }).sort((a,b) => b.pts - a.pts || b.av - a.av);
    
    let myRank = sorted.findIndex(t => t.id === window.myTeamId) + 1;
    let champName = leagueData.teams.find(t => t.id === sorted[0].id).name;
    
    // YENİ: KÜME DÜŞME VE YÜKSELME MANTIĞI
    let relegatedTeams = [];
    let promotedTeams = [];
    let promotionDesc = "";
    
    if (window.selectedLeague === "superlig") {
        // Süper Lig'de oynanıyorsa
        relegatedTeams = [sorted[sorted.length - 1].id, sorted[sorted.length - 2].id]; // Son 2 düşer
        
        let tff1Teams = leagueData.teams.filter(t => t.leagueId === "tff1").sort((a,b) => b.budget - a.budget);
        if (tff1Teams.length >= 3) {
            let champTFF = tff1Teams[0].id;
            // Playoff simülasyonu 2. ve 3. arasında
            let playoffWinner = (Math.random() > 0.5) ? tff1Teams[1].id : tff1Teams[2].id;
            promotedTeams = [champTFF, playoffWinner];
            
            promotionDesc = "<br><br><span style='color:#e74c3c;'>Süper Lig'den Düşenler:</span> " + leagueData.teams.find(t=>t.id===relegatedTeams[0]).name + ", " + leagueData.teams.find(t=>t.id===relegatedTeams[1]).name + 
                            "<br><span style='color:#2ecc71;'>Süper Lig'e Yükselenler:</span> " + leagueData.teams.find(t=>t.id===champTFF).name + " (Şampiyon), " + leagueData.teams.find(t=>t.id===playoffWinner).name + " (Play-Off)";
        }
    } else if (window.selectedLeague === "tff1") {
        // TFF 1. Lig'de oynanıyorsa
        let champTFF = sorted[0].id;
        let secondTFF = sorted[1].id;
        let thirdTFF = sorted[2].id;
        
        let superligTeams = leagueData.teams.filter(t => t.leagueId === "superlig").sort((a,b) => a.budget - b.budget); // En kötü bütçeliler
        relegatedTeams = [superligTeams[0].id, superligTeams[1].id];
        
        // Eğer oyuncu 2. veya 3. sıradaysa Play-Off Oynayacak!
        if (window.myTeamId === secondTFF || window.myTeamId === thirdTFF) {
            let opponentId = (window.myTeamId === secondTFF) ? thirdTFF : secondTFF;
            let opponentName = leagueData.teams.find(t=>t.id===opponentId).name;
            
            // Özel Play-Off Modalı
            let playoffModal = document.createElement('div');
            playoffModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:20000; display:flex; flex-direction:column; justify-content:center; align-items:center;";
            playoffModal.innerHTML = '<div style="background:#8e44ad; border:4px solid #f1c40f; padding:40px; border-radius:15px; max-width:600px; text-align:center; color:white;">' +
                '<h1 style="color:#f1c40f; font-size:3rem; margin-top:0;">PLAY-OFF FİNALİ!</h1>' +
                '<p style="font-size:1.5rem;">Ligi ' + myRank + '. bitirdin ve Süper Lig e çıkmak için son bir bilet kaldı!</p>' +
                '<p style="font-size:1.8rem; font-weight:bold;">Rakip: ' + opponentName + '</p>' +
                '<button id="btn-playoff-sim" class="menu-button" style="background:#27ae60; margin-top:30px; padding:15px 40px; font-size:1.5rem;">Final Maçını Simüle Et</button>' +
                '</div>';
            document.body.appendChild(playoffModal);
            
            document.getElementById('btn-playoff-sim').onclick = function() {
                playoffModal.remove();
                // Basit Simülasyon (0 Hata)
                let res = window.simulateMatch ? window.simulateMatch(window.myTeamId, opponentId) : {scoreA: Math.floor(Math.random()*3), scoreB: Math.floor(Math.random()*2)};
                while (res.scoreA === res.scoreB) { if (Math.random() > 0.5) res.scoreA++; else res.scoreB++; } // Penaltılarla biri kazanır
                
                let didIWin = res.scoreA > res.scoreB;
                let playoffWinner = didIWin ? window.myTeamId : opponentId;
                promotedTeams = [champTFF, playoffWinner];
                
                alert("Play-Off Finali Sonucu:\\nSen: " + res.scoreA + " - " + opponentName + ": " + res.scoreB + "\\n" + (didIWin ? "TEBRİKLER! SÜPER LİG'E YÜKSELDİN!" : "Maalesef kaybettin, TFF 1. Lig'de kaldın."));
                
                // Swap League IDs
                relegatedTeams.forEach(id => { let t = leagueData.teams.find(x=>x.id===id); if(t) t.leagueId = "tff1"; });
                promotedTeams.forEach(id => { let t = leagueData.teams.find(x=>x.id===id); if(t) t.leagueId = "superlig"; });
                if (didIWin) window.selectedLeague = "superlig";
                
                showNormalSeasonEndModal(champName, myRank, "<br><span style='color:#2ecc71;'>Süper Lig'e Yükselenler:</span> " + leagueData.teams.find(t=>t.id===champTFF).name + ", " + leagueData.teams.find(t=>t.id===playoffWinner).name, true);
            };
            return; // Normal modala geçme, Play-Off oynanacak
        } else {
            // Oyuncu 1. oldu veya 4. ve aşağısı oldu (Playoff'a kalamadı)
            let playoffWinner = (Math.random() > 0.5) ? secondTFF : thirdTFF;
            promotedTeams = [champTFF, playoffWinner];
            
            promotionDesc = "<br><br><span style='color:#e74c3c;'>Süper Lig'den Düşenler:</span> " + leagueData.teams.find(t=>t.id===relegatedTeams[0]).name + ", " + leagueData.teams.find(t=>t.id===relegatedTeams[1]).name + 
                            "<br><span style='color:#2ecc71;'>Süper Lig'e Yükselenler:</span> " + leagueData.teams.find(t=>t.id===champTFF).name + " (Şampiyon), " + leagueData.teams.find(t=>t.id===playoffWinner).name + " (Play-Off)";
        }
    }

    // Takımların liglerini güncelle
    if (relegatedTeams.length > 0 && promotedTeams.length > 0) {
        relegatedTeams.forEach(id => { let t = leagueData.teams.find(x=>x.id===id); if(t) t.leagueId = (window.selectedLeague === "superlig") ? "tff1" : "tff1"; });
        promotedTeams.forEach(id => { let t = leagueData.teams.find(x=>x.id===id); if(t) t.leagueId = (window.selectedLeague === "tff1") ? "superlig" : "superlig"; });
        
        // Eğer benim takımım düştüyse ligimi güncelle
        if (relegatedTeams.includes(window.myTeamId)) {
            window.selectedLeague = "tff1";
            promotionDesc += "<br><br><span style='color:red; font-size:2rem; font-weight:bold;'>KÜME DÜŞTÜN! Gelecek sezon TFF 1. Lig'de mücadele edeceksin.</span>";
        } else if (promotedTeams.includes(window.myTeamId)) {
            window.selectedLeague = "superlig";
            promotionDesc += "<br><br><span style='color:#2ecc71; font-size:2rem; font-weight:bold;'>ŞAMPİYON! Süper Lig'e yükseldin!</span>";
        }
    }
    
    showNormalSeasonEndModal(champName, myRank, promotionDesc, false);
};

function showNormalSeasonEndModal(champName, myRank, promotionDesc, fromPlayoff) {
    let desc = "Sezon sona erdi. Şampiyon: " + champName + ".<br>";
    if (window.cupWinner) desc += "Türkiye Kupası Şampiyonu: " + leagueData.teams.find(t=>t.id===window.cupWinner).name + ".<br><br>";
    
    // Avrupa vs. textler (Basitleştirildi)
    desc += "Ligi " + myRank + ". sırada bitirdin.<br>";
    desc += promotionDesc;

    let modal = document.createElement('div');
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:20000; display:flex; flex-direction:column; justify-content:center; align-items:center;";
    modal.innerHTML = '<div style="background:#2c3e50; border:4px solid #f1c40f; padding:40px; border-radius:15px; max-width:700px; text-align:center; color:white;">' +
        '<h1 style="color:#f1c40f; font-size:3rem; margin-top:0;">SEZON TAMAMLANDI</h1>' +
        '<p style="font-size:1.3rem; line-height:1.5;">' + desc + '</p>' +
        '<button id="btn-next-season" class="menu-button" style="background:#27ae60; margin-top:30px; padding:15px 40px; font-size:1.5rem;">Yeni Sezona Başla</button>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    document.getElementById('btn-next-season').onclick = function() {
        modal.remove();
        window.season++;
        window.currentWeek = 1;
        window.seasonEndedModalShown = false;
        
        let domesticTeams = leagueData.teams.filter(t => t.leagueId === (window.selectedLeague || "superlig")).map(t => t.id);
        window.fixture = window.generateFixture ? window.generateFixture(domesticTeams) : [];
        domesticTeams.forEach(tid => {
            window.leagueTable[tid] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
        });
        if(typeof window.initCup === 'function') window.initCup(domesticTeams); 
        
        // SETUP EUROPE
        if (window.clQualification === "DirectCL" && typeof window.initSwissSystem === 'function') {
            window.clPhase = "Swiss"; window.clTournament = "CL";
            window.initSwissSystem(window.clTournament);
        }
        
        const containers = document.querySelectorAll('.menu-container');
        containers.forEach(c => c.style.display = 'none');
        document.getElementById('main-menu-container').style.display = 'flex';
        
        if(typeof updateFixtureUI === 'function') updateFixtureUI();
        alert("Yeni sezon Fikstürü çekildi! Liginiz: " + (window.selectedLeague === "superlig" ? "Süper Lig" : "TFF 1. Lig"));
    };
}`;
    
    content = content.replace(oldModalMatch[0], newModalLogic);
    fs.writeFileSync(leagueFile, content, 'utf8');
    console.log("league.js güncellendi (Küme düşme/Yükselme, Play-Off).");
} else {
    console.log("showSeasonEndModal bulunamadı!");
}

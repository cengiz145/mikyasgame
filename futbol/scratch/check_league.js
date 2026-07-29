window.generateFixture = function(teamIds) {
    let teams = [...teamIds];
    if (teams.length % 2 !== 0) teams.push(null);
    let numDays = teams.length - 1;
    let halfSize = teams.length / 2;
    let fixture = [];
    
    for (let day = 0; day < numDays; day++) {
        let week = [];
        for (let i = 0; i < halfSize; i++) {
            let home = teams[i];
            let away = teams[teams.length - 1 - i];
            if (home !== null && away !== null) {
                if (day % 2 === 0) week.push({home: home, away: away});
                else week.push({home: away, away: home});
            }
        }
        fixture.push(week);
        teams.splice(1, 0, teams.pop());
    }
    
    let secondHalf = [];
    fixture.forEach(week => {
        let revWeek = week.map(match => ({home: match.away, away: match.home}));
        secondHalf.push(revWeek);
    });
    
    let fullFixture = fixture.concat(secondHalf);
    return fullFixture;
};

window.initCup = function(domesticTeams) {
    window.cupBracket = [];
    let cupTeams = [...domesticTeams];
    while(cupTeams.length < 16) cupTeams.push(cupTeams[Math.floor(Math.random()*cupTeams.length)]);
    let roundOf16 = [];
    for(let i=0; i<8; i++) {
        roundOf16.push({home: cupTeams[i], away: cupTeams[15-i]});
    }
    window.cupBracket.push(roundOf16);
};

window.simulateCupMatch = function(match) {
    let res = window.simulateMatch(match.home, match.away);
    let hScore = res.scoreA; let aScore = res.scoreB;
    if(hScore === aScore) {
        if(Math.random() > 0.5) hScore++; else aScore++;
    }
    match.homeScore = hScore;
    match.awayScore = aScore;
    match.winner = hScore > aScore ? match.home : match.away;
};

window.initLeague = function() {
    let domesticTeams = leagueData.teams.filter(t => t.leagueId === (window.selectedLeague || "superlig")).map(t => t.id);
    
    if (!window.fixture || window.fixture.length === 0) {
        window.leagueTable = {};
        window.initCup(domesticTeams);
        domesticTeams.forEach(tid => {
            window.leagueTable[tid] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
        });
        window.season = window.season || 1;
        window.currentWeek = 0;
        window.isPreSeason = true;
        window.preSeasonDay = 1;
    }
};

window.drawFixtures = function() {
    let domesticTeams = leagueData.teams.filter(t => t.leagueId === (window.selectedLeague || "superlig")).map(t => t.id);
    window.fixture = window.generateFixture ? window.generateFixture(domesticTeams) : [];
    window.currentWeek = 1;
    window.isPreSeason = false;
    if (typeof speak === 'function') speak("Fikstürler çekildi. Artık lig başlıyor.");
    if (typeof updateCalendarUI === 'function') updateCalendarUI();
    if (typeof saveGame === 'function') saveGame(true);
};

window.simulateMatch = function(teamA, teamB) {
    let tA = leagueData.teams.find(t => t.id === teamA);
    let tB = leagueData.teams.find(t => t.id === teamB);
    
    if (!tA || !tB) return { scoreA: 0, scoreB: 0 };
    
    const big4 = ["galatasaray", "fenerbahce", "besiktas", "trabzonspor"];
    let isBig4Derby = big4.includes(teamA) && big4.includes(teamB);
    let isCityDerby = (tA.city && tB.city && tA.city === tB.city);
    let isDerbyMatch = isBig4Derby || isCityDerby;
    
    let randFactorA = isDerbyMatch ? Math.floor(Math.random()*40) : Math.floor(Math.random()*20);
    let randFactorB = isDerbyMatch ? Math.floor(Math.random()*40) : Math.floor(Math.random()*20);
    
    let aStr = (tA.budget || 30) + randFactorA;
    let bStr = (tB.budget || 30) + randFactorB;
    
    let scoreA = 0; let scoreB = 0;
    if (aStr > bStr + 15) { scoreA = Math.floor(Math.random()*3)+1; scoreB = Math.floor(Math.random()*2); }
    else if (bStr > aStr + 15) { scoreB = Math.floor(Math.random()*3)+1; scoreA = Math.floor(Math.random()*2); }
    else {
        scoreA = Math.floor(Math.random()*3);
        scoreB = scoreA;
        if(Math.random() < 0.3) scoreA += 1;
        else if (Math.random() < 0.6) scoreB += 1;
    }
    
    if (teamA === window.myTeamId || teamB === window.myTeamId) {
        window.lastMatchGoalEvents = [];
        let isHome = (teamA === window.myTeamId);
        window.lastMatchScore = { home: isHome ? scoreA : scoreB, away: isHome ? scoreB : scoreA };
        window.lastMatchOpponentName = isHome ? tB.name : tA.name;
        
        let myGoals = isHome ? scoreA : scoreB;
        let oppGoals = isHome ? scoreB : scoreA;
        let tMy = isHome ? tA : tB;
        let tOpp = isHome ? tB : tA;
        
        // BUG FIX: tMyPlayers uses leagueData.players
        let tMyPlayers = window.leagueData.players.filter(p => p.teamId === tMy.id);
        let tOppPlayers = window.leagueData.players.filter(p => p.teamId === tOpp.id);
        
        for(let i=0; i<myGoals; i++) {
            let min = Math.floor(Math.random() * 89) + 1;
            let scorer = (tMyPlayers.length > 0) ? tMyPlayers[Math.floor(Math.random() * Math.min(tMyPlayers.length, 6))] : {name: "Oyuncu"};
            window.lastMatchGoalEvents.push({ team: 'home', scorer: scorer.name, min: min });
        }
        for(let i=0; i<oppGoals; i++) {
            let min = Math.floor(Math.random() * 89) + 1;
            let scorer = (tOppPlayers.length > 0) ? tOppPlayers[Math.floor(Math.random() * Math.min(tOppPlayers.length, 6))] : {name: "Rakip Oyuncu"};
            window.lastMatchGoalEvents.push({ team: 'away', scorer: scorer.name, min: min });
        }
        window.lastMatchGoalEvents.sort((a,b) => a.min - b.min);
    }

    return { scoreA, scoreB };
};

window.simulateEuropeanTournament = function() {
    // dummy implementation
};

window.simulateWorldMatches = function() {
    // dummy implementation
};

window.showSeasonEndModal = function() {
    let leagueId = window.selectedLeague || "superlig";
    let domesticTeams = window.leagueData.teams.filter(t => t.leagueId === leagueId);
    
    // 1. Sıralamayı Hesapla
    let sortedTeams = [...domesticTeams].sort((a, b) => {
        let ptsA = window.leagueTable[a.id] ? window.leagueTable[a.id].pts : 0;
        let ptsB = window.leagueTable[b.id] ? window.leagueTable[b.id].pts : 0;
        if (ptsB !== ptsA) return ptsB - ptsA;
        let diffA = window.leagueTable[a.id] ? (window.leagueTable[a.id].gf - window.leagueTable[a.id].ga) : 0;
        let diffB = window.leagueTable[b.id] ? (window.leagueTable[b.id].gf - window.leagueTable[b.id].ga) : 0;
        return diffB - diffA;
    });

    let myRank = sortedTeams.findIndex(t => t.id === window.myTeamId) + 1;
    let champName = sortedTeams[0] ? sortedTeams[0].name : "Bilinmiyor";
    
    // 1.5 Şampiyonluk ve Sıralama Ödülleri
    let champPrize = 40000000; // Şampiyona 40 Milyon Euro
    if (sortedTeams[0]) {
        sortedTeams[0].budget = (sortedTeams[0].budget || 0) + champPrize;
        if (sortedTeams[0].id === window.myTeamId) {
            window.budget = sortedTeams[0].budget;
            if(typeof updateBudgetUI === 'function') updateBudgetUI();
        }
    }
    
    // 2. Sponsor Ödemeleri
    domesticTeams.forEach((t, index) => {
        let rank = sortedTeams.findIndex(st => st.id === t.id) + 1;
        if (window.sponsorManager && typeof window.sponsorManager.evaluateSeasonEnd === 'function') {
            window.sponsorManager.evaluateSeasonEnd(t, rank);
        }
    });

    // 3. UI Modal Gösterimi
    let modal = document.createElement('div');
    modal.id = 'season-end-modal';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:20000; display:flex; flex-direction:column; justify-content:center; align-items:center;";
    modal.innerHTML = '<div style="background:#2c3e50; border:4px solid #f1c40f; padding:40px; border-radius:15px; max-width:700px; text-align:center; color:white;">' +
        '<h1 style="color:#f1c40f; font-size:3rem; margin-top:0;">SEZON TAMAMLANDI</h1>' +
        '<p style="font-size:1.3rem; line-height:1.5;">Şampiyon: <strong>' + champName + '</strong></p>' +
        '<p style="font-size:1.3rem; line-height:1.5;">Ligi ' + myRank + '. sırada tamamladınız.</p>' +
        '<button id="btn-next-season" class="menu-button" style="background:#27ae60; margin-top:30px; padding:15px 40px; font-size:1.5rem; color:white; border:none; border-radius:8px; cursor:pointer;">Yeni Sezona Başla</button>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    document.getElementById('btn-next-season').onclick = function() {
        modal.remove();
        
        // 4. Sezonu İlerlet
        window.season = (window.season || 1) + 1;
        
        // 5. Oyuncuları Yaşlandır ve İstatistiklerini Sıfırla
        if (window.leagueData && window.leagueData.players) {
            window.leagueData.players.forEach(p => {
                p.age = (p.age || 18) + 1;
                p.seasonMatches = 0;
                p.seasonGoals = 0;
                p.seasonAssists = 0;
            });
        }
        
        // 6. Lig Tablosunu ve Fikstürü Sıfırla
        domesticTeams.forEach(t => {
            window.leagueTable[t.id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
        });
        
        window.isPreSeason = true;
        window.preSeasonDay = 1;
        window.currentWeek = 0;
        
        if (typeof window.drawFixtures === 'function') {
            window.drawFixtures();
        } else {
            window.fixture = window.generateFixture ? window.generateFixture(domesticTeams.map(t=>t.id)) : [];
            window.currentWeek = 1;
            window.isPreSeason = false;
        }

        if (typeof window.updateBudgetUI === 'function') window.updateBudgetUI();
        if (typeof window.updateCalendarUI === 'function') window.updateCalendarUI();
        
        alert("Yeni Sezon Başladı! Bütün oyuncuların yaşı 1 arttı, bütçeler güncellendi ve yeni fikstür çekildi.");
        
        if (typeof showContainer === 'function') showContainer('main-menu-container');
    };
};

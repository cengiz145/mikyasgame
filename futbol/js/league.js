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
    let tA = window.leagueData.teams.find(t => t.id === teamA);
    let tB = window.leagueData.teams.find(t => t.id === teamB);
    
    if (!tA || !tB) return { scoreA: 0, scoreB: 0 };
    
    // YARDIMCI FONKSİYON: Takımın ilk 11 efektif gücünü hesapla
    function getTeamStrength(teamId) {
        let players = window.leagueData.players.filter(p => p.teamId === teamId);
        
        // 1. Defansif Programlama (Eksik veya hatalı (NaN) verileri güvenli sınırlara hapset)
        players.forEach(p => {
            p.power = Math.max(1, Math.min(99, p.power || 50));
            p.form = Math.max(1, Math.min(10, p.form || 5));
            p.morale = Math.max(1, Math.min(100, p.morale || 50));
            p.condition = Math.max(1, Math.min(100, p.condition || p.fitness || 100)); // fitness geriye dönük uyumluluk
        });
        
        // En güçlü 11 oyuncuyu (veya kadro darsa mevcut olanları) seç
        players.sort((a, b) => b.power - a.power);
        let top11 = players.slice(0, 11);
        
        let totalEffectivePower = 0;
        top11.forEach(p => {
            // Formülü uygula: (Matematiksel Kusursuzlaştırma)
            // Moral (50 = 1.0 Çarpan, 100 = 1.1 Çarpan, 1 = 0.9 Çarpan)
            let moraleMultiplier = 0.9 + (p.morale / 500); 
            // Kondisyon (50 = 0.9 Çarpan, 100 = 1.0 Çarpan)
            let conditionMultiplier = 0.8 + (p.condition / 500);
            // Form (5 = 1.0 Çarpan, 10 = 1.1 Çarpan)
            let formMultiplier = 0.9 + (p.form / 50);
            
            // Oyuncunun sahaya yansıttığı gerçek güç
            let effective = p.power * moraleMultiplier * conditionMultiplier * formMultiplier;
            totalEffectivePower += effective;
        });
        
        // 11 oyuncu tam yoksa takım güçsüz düşer (hata koruması)
        if (top11.length === 0) return 30; 
        
        // Takımın Ortalama Efektif Gücü (Yaklaşık 1-105 arası bir değer)
        return totalEffectivePower / top11.length;
    }
    
    let baseStrA = getTeamStrength(teamA);
    let baseStrB = getTeamStrength(teamB);
    
    // Ev sahibi avantajı (Mental ve taraftar desteği)
    baseStrA += 2;
    
    // Derbi faktörü
    const big4 = ["galatasaray", "fenerbahce", "besiktas", "trabzonspor"];
    let isBig4Derby = big4.includes(teamA) && big4.includes(teamB);
    let isCityDerby = (tA.city && tB.city && tA.city === tB.city);
    let isDerbyMatch = isBig4Derby || isCityDerby;
    
    // Rastgelelik faktörü (Oyunun tuzu biberi, ama eskisi gibi tamamen sonuca hükmetmez)
    let randFactorA = isDerbyMatch ? Math.floor(Math.random()*8) : Math.floor(Math.random()*5);
    let randFactorB = isDerbyMatch ? Math.floor(Math.random()*8) : Math.floor(Math.random()*5);
    
    let aStr = baseStrA + randFactorA;
    let bStr = baseStrB + randFactorB;
    
    let scoreA = 0; let scoreB = 0;
    
    // YENİ: Oyuncuların Maç Sonu Yorgunluğu ve Form Güncellemesi (Defansif Sınırlarla)
    function updatePostMatchStats(teamId, isWinner, isDraw) {
        let players = window.leagueData.players.filter(p => p.teamId === teamId);
        players.sort((a, b) => b.power - a.power);
        let top11 = players.slice(0, 11);
        
        top11.forEach(p => {
            // Yorgunluk (15 ile 25 arası kondisyon düşer)
            let drain = Math.floor(Math.random() * 10) + 15;
            p.condition = Math.max(1, (p.condition || 100) - drain);
            
            // Maç Sonucuna Göre Form Değişimi
            if (isWinner) {
                if (Math.random() < 0.6) p.form = Math.min(10, (p.form || 5) + 1);
            } else if (isDraw) {
                if (Math.random() < 0.2) p.form = Math.min(10, (p.form || 5) + 1);
                if (Math.random() < 0.2) p.form = Math.max(1, (p.form || 5) - 1);
            } else { // Mağlubiyet
                if (Math.random() < 0.6) p.form = Math.max(1, (p.form || 5) - 1);
                // Kötü mağlubiyette moral de az düşebilir
                if (Math.random() < 0.4) p.morale = Math.max(1, (p.morale || 50) - 5);
            }
        });
    }
    
    // YENİ SKOR ALGORİTMASI (Güç farkına göre dinamik, mantıklı ve matematiksel skor dağılımı)
    let diff = aStr - bStr;
    
    if (diff > 15) { 
        // A takımı ezici üstün
        scoreA = Math.floor(Math.random()*3) + 2; // 2-4 gol
        scoreB = Math.floor(Math.random()*2);     // 0-1 gol
    }
    else if (diff < -15) { 
        // B takımı ezici üstün
        scoreB = Math.floor(Math.random()*3) + 2; 
        scoreA = Math.floor(Math.random()*2); 
    }
    else if (diff > 5) {
        // A takımı favori
        scoreA = Math.floor(Math.random()*2) + 1; // 1-2 gol
        scoreB = Math.floor(Math.random()*2);     // 0-1 gol
        if (Math.random() < 0.2) scoreA++; // ekstra gol şansı
    }
    else if (diff < -5) {
        // B takımı favori
        scoreB = Math.floor(Math.random()*2) + 1; 
        scoreA = Math.floor(Math.random()*2); 
        if (Math.random() < 0.2) scoreB++;
    }
    else {
        // Denk güçler (Kıran kırana mücadele)
        scoreA = Math.floor(Math.random()*3); // 0-2 gol
        scoreB = scoreA; // Beraberlik ağırlıklı
        if(Math.random() < 0.35) scoreA += 1;
        else if (Math.random() < 0.35) scoreB += 1; // Kalan %30 berabere biter
    }
    
    // Yorgunluk ve Form Güncellemesini Uygula
    updatePostMatchStats(teamA, scoreA > scoreB, scoreA === scoreB);
    updatePostMatchStats(teamB, scoreB > scoreA, scoreA === scoreB);
    
    // KULLANICININ MAÇI İSE: Maç İstatistiklerini Çıkar
    if (teamA === window.myTeamId || teamB === window.myTeamId) {
        window.lastMatchGoalEvents = [];
        let isHome = (teamA === window.myTeamId);
        window.lastMatchScore = { home: isHome ? scoreA : scoreB, away: isHome ? scoreB : scoreA };
        window.lastMatchOpponentName = isHome ? tB.name : tA.name;
        
        let myGoals = isHome ? scoreA : scoreB;
        let oppGoals = isHome ? scoreB : scoreA;
        let tMy = isHome ? tA : tB;
        let tOpp = isHome ? tB : tA;
        
        let tMyPlayers = window.leagueData.players.filter(p => p.teamId === tMy.id);
        let tOppPlayers = window.leagueData.players.filter(p => p.teamId === tOpp.id);
        
        // AKILLI GOLCÜ SEÇİMİ (Artık stoperler rastgele gol atmayacak)
        function getRandomScorer(playersArr) {
            if (playersArr.length === 0) return {name: "Oyuncu"};
            // Ofansif oyuncuları bul (Santrfor, Kanat, Forvet)
            let attackers = playersArr.filter(p => p.position && (p.position.toLowerCase().includes('for') || p.position.toLowerCase().includes('kanat') || p.position.toLowerCase().includes('sf') || p.position.toLowerCase().includes('kan')));
            if (attackers.length > 0 && Math.random() < 0.75) {
                // %75 ihtimalle golü bir forvet veya kanat atar
                return attackers[Math.floor(Math.random() * attackers.length)];
            }
            // Kalan %25 ihtimalle en güçlü 6 oyuncudan biri atar (Orta saha / Duran top vs)
            playersArr.sort((a,b) => b.power - a.power);
            return playersArr[Math.floor(Math.random() * Math.min(playersArr.length, 6))];
        }

        for(let i=0; i<myGoals; i++) {
            let min = Math.floor(Math.random() * 89) + 1;
            let scorer = getRandomScorer(tMyPlayers);
            window.lastMatchGoalEvents.push({ team: 'home', scorer: scorer.name, min: min });
        }
        for(let i=0; i<oppGoals; i++) {
            let min = Math.floor(Math.random() * 89) + 1;
            let scorer = getRandomScorer(tOppPlayers);
            window.lastMatchGoalEvents.push({ team: 'away', scorer: scorer.name, min: min });
        }
        // Golleri dakikaya göre sırala
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
        
        // [YENİ] GOL KRALI ÖDÜLÜ HESAPLAMASI
        if (window.leagueData && window.leagueData.players) {
            let maxGoals = 0;
            window.leagueData.players.forEach(p => {
                if (p.seasonGoals && p.seasonGoals > maxGoals) maxGoals = p.seasonGoals;
            });
            
            if (maxGoals > 0) {
                let topScorers = window.leagueData.players.filter(p => p.seasonGoals === maxGoals);
                let myTopScorers = topScorers.filter(p => p.teamId === window.myTeamId);
                
                if (myTopScorers.length > 0) {
                    let reward = myTopScorers.length * 1000000;
                    let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
                    if (myTeam) {
                        myTeam.budget = (myTeam.budget || 0) + reward;
                        let names = myTopScorers.map(p => p.name).join(", ");
                        alert(`👑 GOL KRALI BİZDEN ÇIKTI!\n\n${names} bu sezon ${maxGoals} gol atarak ligin en golcü ismi oldu!\nYönetim bu büyük başarı için kulübün kasasına ${reward.toLocaleString('tr-TR')} € ekledi.`);
                    }
                }
            }
        }
        
        window.leagueData.hallOfFame = window.leagueData.hallOfFame || [];
        window.leagueData.seasonArchive = window.leagueData.seasonArchive || [];
        
        let currentYear = 2024 + (window.season || 1) - 1;
        let topScorerName = "Yok";
        if (typeof maxGoals !== 'undefined' && maxGoals > 0 && typeof topScorers !== 'undefined' && topScorers.length > 0) {
            topScorerName = topScorers.map(p => p.name).join(", ");
        }
        window.leagueData.seasonArchive.push({
            year: currentYear,
            champion: champName,
            topScorer: topScorerName,
            maxGoals: typeof maxGoals !== 'undefined' ? maxGoals : 0
        });

        // 5. Oyuncuları Yaşlandır ve İstatistiklerini Sıfırla
        if (window.leagueData && window.leagueData.players) {
            // Emekli olanları oyundan sil
            let retiredCount = 0;
            window.leagueData.players = window.leagueData.players.filter(p => {
                if (p.isRetiring) {
                    retiredCount++;
                    // FORMÜL 1: Efsane Skoru Hesaplama
                    let cM = p.careerMatches || 0;
                    let cG = p.careerGoals || 0;
                    let cA = p.careerAssists || 0;
                    let cD = p.dalyaCount || 0;
                    let isChamp = (p.teamId === window.myTeamId && myRank === 1); 
                    
                    let legendScore = (cM * 10) + (cG * 30) + (cA * 20) + (cD * 500) + (isChamp ? 1000 : 0);
                    
                    if (legendScore >= 1000) {
                        // FORMÜL 2: Genel Ortalama (OVR) ve Sıkıştırma
                        let ovr = Math.floor(((p.power || 50) + (p.speed || 50) + (p.experience || 50)) / 3);
                        window.leagueData.hallOfFame.push({
                            name: p.name,
                            ovr: ovr,
                            matches: cM,
                            goals: cG,
                            assists: cA,
                            retireAge: p.age,
                            score: legendScore,
                            year: currentYear
                        });
                    }
                    return false; // Silindi
                }
                return true; // Kaldı
            });

            window.leagueData.players.forEach(p => {
                p.age = (p.age || 18) + 1;
                p.seasonMatches = 0;
                p.seasonGoals = 0;
                p.seasonAssists = 0;
                
                // DİNAMİK FİZİKSEL ÇÖKÜŞ (Decline)
                if (p.age >= 32) {
                    let declineFactor = p.age - 31; // 32 yaş: 1, 33 yaş: 2, 38 yaş: 7
                    // Mentalitesi elite olanlar daha az düşer
                    if (p.mentalTrait === 'elite') declineFactor *= 0.5;
                    
                    let powerDrop = Math.ceil(Math.random() * declineFactor);
                    let speedDrop = Math.ceil(Math.random() * (declineFactor * 0.5));
                    
                    p.power = Math.max(10, (p.power || 50) - powerDrop);
                    p.speed = Math.max(1, (p.speed || 5) - speedDrop);
                }
                
                // DİNAMİK EMEKLİLİK KARARI
                if (!p.isRetiring && p.age >= 33) {
                    let isBodyFailing = p.power < 45;
                    let isTooOld = p.age >= 40 && p.power < 75;
                    let randomChance = (p.age >= 36 && p.power < 60) ? Math.random() < 0.3 : false;
                    
                    if (isBodyFailing || isTooOld || randomChance) {
                        p.isRetiring = true;
                    }
                }
            });
            console.log(retiredCount + " oyuncu emekli olup oyundan silindi.");
        }
        
        // 6. Lig Tablosunu ve Fikstürü Sıfırla
        domesticTeams.forEach(t => {
            window.leagueTable[t.id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
        });
        
        // Şampiyonlar Ligi'ni Sıfırla (Yeni sezon kuraları çekilebilsin diye)
        if (window.championsLeague) {
            window.championsLeague.isActive = false;
        }
        
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


// ==========================================
// [PATCH] LEAGUE SIMULATION ENGINE RECOVERY
// ==========================================
window.leagueData = window.leagueData || {};
window.leagueData.playMatch = function() {
    let myId = window.myTeamId;
    let oppId = window.todayOpponent;
    let pScore = window.playerScore || 0;
    let eScore = window.enemyScore || 0;

    // 1. Kullanıcının ve rakibinin maç sonucunu puan durumuna yansıt
    if (myId && window.leagueTable[myId]) {
        window.leagueTable[myId].p++;
        window.leagueTable[myId].gf += pScore;
        window.leagueTable[myId].ga += eScore;
        if (pScore > eScore) { window.leagueTable[myId].w++; window.leagueTable[myId].pts += 3; }
        else if (pScore === eScore) { window.leagueTable[myId].d++; window.leagueTable[myId].pts += 1; }
        else { window.leagueTable[myId].l++; }
    }

    if (oppId && window.leagueTable[oppId]) {
        window.leagueTable[oppId].p++;
        window.leagueTable[oppId].gf += eScore;
        window.leagueTable[oppId].ga += pScore;
        if (eScore > pScore) { window.leagueTable[oppId].w++; window.leagueTable[oppId].pts += 3; }
        else if (eScore === pScore) { window.leagueTable[oppId].d++; window.leagueTable[oppId].pts += 1; }
        else { window.leagueTable[oppId].l++; }
    }

    // 2. O haftaki diğer bot maçlarını simüle et
    if (window.fixture && window.currentWeek && window.currentWeek <= window.fixture.length) {
        let weekMatches = window.fixture[window.currentWeek - 1];
        if (weekMatches) {
            weekMatches.forEach(match => {
                let home = match.home;
                let away = match.away;
                if (home === myId || away === myId) return; // Kullanıcının maçı zaten oynandı

                let res = window.simulateMatch(home, away);
                let scoreA = res.scoreA;
                let scoreB = res.scoreB;

                if (window.leagueTable[home]) {
                    window.leagueTable[home].p++;
                    window.leagueTable[home].gf += scoreA;
                    window.leagueTable[home].ga += scoreB;
                    if (scoreA > scoreB) { window.leagueTable[home].w++; window.leagueTable[home].pts += 3; }
                    else if (scoreA === scoreB) { window.leagueTable[home].d++; window.leagueTable[home].pts += 1; }
                    else { window.leagueTable[home].l++; }
                }
                if (window.leagueTable[away]) {
                    window.leagueTable[away].p++;
                    window.leagueTable[away].gf += scoreB;
                    window.leagueTable[away].ga += scoreA;
                    if (scoreB > scoreA) { window.leagueTable[away].w++; window.leagueTable[away].pts += 3; }
                    else if (scoreB === scoreA) { window.leagueTable[away].d++; window.leagueTable[away].pts += 1; }
                    else { window.leagueTable[away].l++; }
                }
            });
        }
    }

    // 3. Menüye dön ve maç sonu gazetesi/basın toplantısını tetikle
    if (typeof window.hideAllContainers === 'function') window.hideAllContainers();
    const mm = document.getElementById('main-menu-container');
    if (mm) { mm.style.display = 'flex'; let title = mm.querySelector('h1, h2'); if(title) title.focus(); else mm.focus(); }

    if (typeof window.openPostMatchPressConference === 'function') {
        window.openPostMatchPressConference();
    } else if (typeof window.showNewspaper === 'function') {
        window.showNewspaper();
    } else if (typeof window.advanceWeek === 'function') {
        window.advanceWeek();
    }
    
    // Eğer şampiyonlar ligi haftasıysa oradaki durumu da check edelim
    if (window.championsLeague && typeof window.championsLeague.updateUI === 'function') {
        window.championsLeague.updateUI();
    }
};

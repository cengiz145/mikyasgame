// manager.js - NVDA Uyumlu Dinamik Kadro Yönetimi

let selectedSlotIndex = null;
let isSelectingForSub = false;

window.formations = {
    "4-4-2": ["Kaleci", "Sağ Bek", "Sağ Stoper", "Sol Stoper", "Sol Bek", "Sağ Kanat", "Merkez Orta Saha", "Merkez Orta Saha", "Sol Kanat", "Santrfor", "Santrfor"],
    "4-2-3-1": ["Kaleci", "Sağ Bek", "Sağ Stoper", "Sol Stoper", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Sağ Açık", "10 Numara", "Sol Açık", "Santrfor"],
    "4-3-3": ["Kaleci", "Sağ Bek", "Sağ Stoper", "Sol Stoper", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Merkez Orta Saha", "Sağ Açık", "Sol Açık", "Santrfor"],
    "4-1-4-1": ["Kaleci", "Sağ Bek", "Sağ Stoper", "Sol Stoper", "Sol Bek", "Ön Libero", "Sağ Orta Saha", "Merkez Orta Saha", "Merkez Orta Saha", "Sol Orta Saha", "Santrfor"],
    "3-5-2": ["Kaleci", "Sağ Stoper", "Merkez Stoper", "Sol Stoper", "Sağ Kanat Bek", "Ön Libero", "Merkez Orta Saha", "Merkez Orta Saha", "Sol Kanat Bek", "Santrfor", "Santrfor"],
    "3-4-3": ["Kaleci", "Sağ Stoper", "Merkez Stoper", "Sol Stoper", "Sağ Kanat", "Merkez Orta Saha", "Merkez Orta Saha", "Sol Kanat", "Sağ Açık", "Sol Açık", "Santrfor"],
    "5-3-2": ["Kaleci", "Sağ Bek", "Sağ Stoper", "Merkez Stoper", "Sol Stoper", "Sol Bek", "Ön Libero", "Merkez Orta Saha", "Merkez Orta Saha", "Santrfor", "Santrfor"]
};
window.currentFormation = "4-4-2"; // Default

function loadManageScreen() {
    if (!window.myTeam) {
        if(typeof speak === 'function') speak("Lütfen önce bir takım seçin.");
        return;
    }
    
    // Kadro kayıtlı değilse ilk kez oluştur (Hepsi boş başlar)
    if (!window.myTeam.formation) {
        window.myTeam.formation = new Array(11).fill(null); 
        let teamPlayerCount = (window.leagueData && window.leagueData.players) ? window.leagueData.players.filter(p => p.teamId === window.myTeam.id).length : 18;
        window.myTeam.subs = new Array(Math.max(0, teamPlayerCount - 11)).fill(null);
    }
    
    renderSquad();
    if(typeof speak === 'function') speak("Takım yönetimi açıldı. Mevkileri yön tuşlarıyla gezinerek doldurabilirsiniz.");
}

function renderSquad() {
    // Diziliş Değişimi Dinleyicisi
    const formationSelect = document.getElementById('formation-select');
    if (formationSelect) {
        formationSelect.value = window.currentFormation || "4-4-2";
        formationSelect.onchange = (e) => {
            window.currentFormation = e.target.value;
            if(typeof speak === 'function') speak("Taktik diziliş " + window.currentFormation + " olarak değiştirildi.");
            renderSquad();
        };
    }

    const formationList = document.getElementById('formation-slots');
    const subList = document.getElementById('sub-slots');
    
    formationList.innerHTML = '';
    subList.innerHTML = '';

    let currentPositions = window.formations[window.currentFormation];
    // İlk 11 Slotları
    for(let i=0; i<11; i++) {
        let posName = currentPositions[i];
        let pId = window.myTeam.formation[i];
        let p = pId ? getPlayerById(pId) : null;
        
        let btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.id = 'slot-btn-' + i;
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        
        if(p) {
            btn.innerHTML = `<strong>${posName}</strong>: ${p.name} (Güç: ${p.power})`;
            btn.setAttribute('aria-label', `${posName} mevkisinde ${p.name} var. Gücü ${p.power}. Değiştirmek için Enter'a basın.`);
            btn.style.backgroundColor = '#27ae60'; // Dolu slot yeşil
        } else {
            btn.innerHTML = `<strong>${posName}</strong>: [Boş]`;
            btn.setAttribute('aria-label', `${posName} mevkisi boş. Oyuncu seçmek için Enter'a basın.`);
            btn.style.backgroundColor = '#7f8c8d'; // Boş slot gri
        }
        
        btn.onclick = () => openPlayerSelector(i, false);
        
        let li = document.createElement('li');
        li.appendChild(btn);
        formationList.appendChild(li);
    }
    
    // Yedek Kulübesi Slotları
    let subCount = (window.myTeam && window.myTeam.subs) ? window.myTeam.subs.length : 7;
    for(let i=0; i<subCount; i++) {
        let pId = window.myTeam.subs[i];
        let p = pId ? getPlayerById(pId) : null;
        
        let btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.id = 'sub-btn-' + i;
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        
        if(p) {
            btn.innerHTML = `<strong>Yedek ${i+1}</strong>: ${p.name} (Güç: ${p.power})`;
            btn.setAttribute('aria-label', `Yedek ${i+1} slotunda ${p.name} var. Gücü ${p.power}. Değiştirmek için Enter'a basın.`);
            btn.style.backgroundColor = '#f39c12'; // Yedek slot turuncu
        } else {
            btn.innerHTML = `<strong>Yedek ${i+1}</strong>: [Boş]`;
            btn.setAttribute('aria-label', `Yedek ${i+1} boş. Oyuncu seçmek için Enter'a basın.`);
            btn.style.backgroundColor = '#7f8c8d'; 
        }
        
        btn.onclick = () => openPlayerSelector(i, true);
        
        let li = document.createElement('li');
        li.appendChild(btn);
        subList.appendChild(li);
    }
}

function getPlayerById(id) {
    if(!window.leagueData || !window.leagueData.players) return null;
    return window.leagueData.players.find(p => p.id === id);
}

window.showAllPlayersInSelector = false;

function getPositionGroup(pos) {
    if (!pos) return 'Hepsi';
    pos = pos.toLowerCase();
    if (pos.includes('kaleci')) return 'Kaleci';
    if (pos.includes('stoper') || pos.includes('bek')) return 'Defans';
    if (pos.includes('orta saha') || pos.includes('libero') || pos.includes('10 numara')) return 'Orta Saha';
    if (pos.includes('santrfor') || pos.includes('açık') || pos.includes('kanat') || pos.includes('forvet')) return 'Forvet';
    return 'Hepsi';
}

function openPlayerSelector(index, isSub) {
    selectedSlotIndex = index;
    isSelectingForSub = isSub;
    
    let modal = document.getElementById('player-selector-modal');
    let title = document.getElementById('player-selector-title');
    let list = document.getElementById('player-selector-list');
    
    let currentPositions = window.formations[window.currentFormation];
    let posName = isSub ? `Yedek ${index+1}` : currentPositions[index];
    title.textContent = `${posName} İçin Oyuncu Seç`;
    
    list.innerHTML = '';
    
    let squadPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeam.id && !p.isReserves);
    
    let slotGroup = isSub ? 'Hepsi' : getPositionGroup(posName);
    
    if (!isSub && !window.showAllPlayersInSelector) {
        let filtered = squadPlayers.filter(p => getPositionGroup(p.position) === slotGroup);
        if (filtered.length > 0) {
            squadPlayers = filtered;
        }
    }
    
    squadPlayers.sort((a, b) => b.power - a.power);
    
    if (!isSub) {
        let toggleBtn = document.createElement('button');
        toggleBtn.className = 'menu-button';
        toggleBtn.style.width = '100%';
        toggleBtn.style.backgroundColor = '#8e44ad';
        toggleBtn.style.marginBottom = '10px';
        toggleBtn.textContent = window.showAllPlayersInSelector ? 'Sadece İlgili Mevkiyi ( ' + slotGroup + ' ) Göster' : 'Tüm Kadroyu Göster';
        toggleBtn.onclick = () => {
            window.showAllPlayersInSelector = !window.showAllPlayersInSelector;
            openPlayerSelector(index, isSub);
        };
        list.appendChild(toggleBtn);
    }
    
    squadPlayers.forEach(p => {
        let isStarter = window.myTeam.formation.includes(p.id);
        let isSubbed = window.myTeam.subs.includes(p.id);
        
        let btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        
        let status = "";
        let ariaStatus = "";
        if (isStarter) { status = " (İlk 11'de)"; ariaStatus = "Şu an İlk onbirde."; }
        if (isSubbed) { status = " (Yedekte)"; ariaStatus = "Şu an yedekte."; }
        
        btn.textContent = `${p.name} - ${p.position} (Güç: ${p.power}, Hız: ${p.speed})${status}`;
        btn.setAttribute('aria-label', `${p.name}. Mevkisi ${p.position}. Gücü ${p.power}. ${ariaStatus} Bu slota seçmek için Enter'a basın.`);
        
        if (isStarter || isSubbed) {
            btn.style.backgroundColor = '#555';
        } else {
            btn.style.backgroundColor = '#34495e';
        }
        
        btn.onclick = () => {
            window.showAllPlayersInSelector = false; // Reset
            selectPlayerForSlot(p.id);
        };
        
        let li = document.createElement('li');
        li.appendChild(btn);
        list.appendChild(li);
    });
    
    modal.style.display = 'flex'; 
    if(typeof speak === 'function') speak(`${posName} seçimi açıldı. ${window.showAllPlayersInSelector ? 'Tüm oyuncular listelendi.' : 'Sadece uygun mevkiler listelendi.'}`);
    
    setTimeout(() => {
        if(list.firstChild && list.firstChild.firstChild) {
            list.firstChild.firstChild.focus();
        } else {
            let btnClose = document.getElementById('btn-close-selector');
            if (btnClose) btnClose.focus();
        }
    }, 50);
}

function selectPlayerForSlot(playerId) {
    if (!window.medicalProfile) {
        window.medicalProfile = Math.random() < 0.5 ? "koruyucu" : "geleneksel";
    }

    let p = getPlayerById(playerId);
    
    // [YENİ] Kart Cezalısı Kontrolü
    if (p && p.redCardWeeks > 0) {
        alert("🟥 HATA: " + p.name + " kart cezalısı olduğu için maç kadrosuna alınamaz!");
        if(typeof speak === 'function') speak("Hocam, bu oyuncu kart cezalısı. Kadroya dahil edemeyiz.");
        return;
    }
    
    // [YENİ] Sakatlık Kontrolü
    if (p && p.injuredWeeks > 0) {
        alert("🚑 HATA: " + p.name + " sakat olduğu için kadroya alınamaz! Revire gidip tedavisini takip edin.");
        if(typeof speak === 'function') speak("Hocam, oyuncu sakat. Tedavisi bitmeden sahaya çıkamaz.");
        return;
    }

    if (!isSelectingForSub && window.medicalProfile === 'koruyucu' && p && p.stamina < 65) {
        let warnMsg = "⚕️ KORUYUCU HEKİM UYARISI:\n\nHocam, " + p.name + " isimli oyuncunun kan değerleri ve uyku kalitesi alarm veriyor. Kas yorgunluğu sınırda (Kondisyon: %" + Math.floor(p.stamina) + ").\n\nEğer onu bugün ilk 11'e koyarsan kası her an yırtılabilir. Riske girmek istediğine emin misin?";
        if (!confirm(warnMsg)) {
            if(typeof speak === 'function') speak("Doktorun tavsiyesine uyarak oyuncuyu dinlendirme kararı aldınız.");
            return;
        } else {
            if(typeof speak === 'function') speak("Sağlık ekibini dinlemeyip büyük bir risk aldınız!");
        }
    }

    // 1. Önce oyuncu başka bir slotta varsa ordan sil (Duble olmasın)
    let oldFormIdx = window.myTeam.formation.indexOf(playerId);
    if (oldFormIdx !== -1) window.myTeam.formation[oldFormIdx] = null;
    
    let oldSubIdx = window.myTeam.subs.indexOf(playerId);
    if (oldSubIdx !== -1) window.myTeam.subs[oldSubIdx] = null;
    
    // 2. Yeni slota ata
    if (isSelectingForSub) {
        window.myTeam.subs[selectedSlotIndex] = playerId;
    } else {
        window.myTeam.formation[selectedSlotIndex] = playerId;
    }
    
    // 3. Modal'ı kapat ve anons yap
    if(document.getElementById('player-selector-modal')) document.getElementById('player-selector-modal').style.display = 'none';
    
    p = getPlayerById(playerId);
    let currentPositions = window.formations[window.currentFormation];
    let posName = isSelectingForSub ? `Yedek ${selectedSlotIndex+1}` : currentPositions[selectedSlotIndex];
    if(typeof speak === 'function') speak(`${posName} mevkisine ${p.name} oyuncuyu yerleştirdiniz.`);
    
    // Ekranı güncelle
    renderSquad();
    
    // Odağı geri butona ver
    setTimeout(() => {
        let btnId = isSelectingForSub ? 'sub-btn-' + selectedSlotIndex : 'slot-btn-' + selectedSlotIndex;
        let btn = document.getElementById(btnId);
        if (btn) btn.focus();
    }, 50);
}

// Olay Dinleyicisi
document.addEventListener("DOMContentLoaded", () => {
    let btnClose = document.getElementById('btn-close-selector');
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            if(document.getElementById('player-selector-modal')) document.getElementById('player-selector-modal').style.display = 'none';
            if(typeof speak === 'function') speak("Seçim iptal edildi.");
            // Odağı geri ver
            let btnId = isSelectingForSub ? 'sub-btn-' + selectedSlotIndex : 'slot-btn-' + selectedSlotIndex;
            let btn = document.getElementById(btnId);
            if (btn) btn.focus();
        });
    }
});

window.autoFillSquad = function(team) {
    if (!team) return;
    let players = (window.leagueData && window.leagueData.players) ? window.leagueData.players.filter(p => p.teamId === team.id) : [];
    if (players.length === 0) return;
    players.sort((a,b) => b.power - a.power);

    team.formation = new Array(11).fill(null);
    for(let i=0; i<11; i++) {
        if(players[i]) team.formation[i] = players[i].id;
    }

    let subCount = Math.max(0, players.length - 11);
    team.subs = new Array(subCount).fill(null);
    for(let i=11; i<players.length; i++) {
        team.subs[i-11] = players[i].id;
    }
    console.log('[AutoFill] Kadro otomatik dolduruldu.', team);
};


// --- YÖNETİM, HEDEFLER VE KOVULMA SİSTEMİ (BOARD ENGINE) ---
window.boardTrust = 80; // 0-100 arası yönetim güveni
window.seasonObjective = "Şampiyonluk";

const boardEngine = {
    init: function(teamBudget) {
        if (teamBudget >= 70) {
            window.seasonObjective = "Şampiyonluk";
            window.boardTrust = 70;
            window.presidentProfile = Math.random() < 0.5 ? "SABIRSIZ" : "ŞOVMEN";
        } else if (teamBudget >= 40) {
            window.seasonObjective = "Avrupa Kupaları";
            window.boardTrust = 80;
            const profiles = ["SABIRSIZ", "CİMRİ", "VİZYONER", "ŞOVMEN"];
            window.presidentProfile = profiles[Math.floor(Math.random() * profiles.length)];
        } else {
            window.seasonObjective = "Ligde Kalmak";
            window.boardTrust = 90;
            window.presidentProfile = Math.random() < 0.5 ? "CİMRİ" : "VİZYONER";
        }
    },

    evaluateMatch: function(isWin, isDraw, isLoss, isDerby) {
        let trustChange = 0;
        let p = window.presidentProfile || "VİZYONER";
        
        if (isWin) {
            trustChange = isDerby ? 8 : 4;
            if (p === "SABIRSIZ") trustChange += 2;
            if (p === "ŞOVMEN" && isDerby) trustChange += 5;
        }
        if (isDraw) {
            trustChange = isDerby ? 0 : -2;
            if (p === "SABIRSIZ") trustChange -= 3;
            if (p === "CİMRİ") trustChange += 1;
        }
        if (isLoss) {
            trustChange = isDerby ? -12 : -6;
            if (p === "SABIRSIZ") trustChange -= 6;
            if (p === "VİZYONER") trustChange += 3;
            if (p === "ŞOVMEN" && isDerby) trustChange -= 10;
        }
        
        // Beklentiye göre ekstra baskı
        if (window.seasonObjective === "Şampiyonluk" && isLoss) trustChange -= 4;
        if (window.seasonObjective === "Ligde Kalmak" && isWin) trustChange += 5;

        window.boardTrust += trustChange;
        if (window.boardTrust > 100) window.boardTrust = 100;
        if (window.boardTrust < 0) window.boardTrust = 0;

        window.eventQueue = window.eventQueue || [];
        let pChance = Math.random();
        
        if (isLoss && p === "SABIRSIZ" && pChance < 0.5) {
             window.eventQueue.push({
                 title: "📱 BAŞKANDAN WHATSAPP MESAJI",
                 message: "\"Hocam bu nasıl futbol? Oynattığın topu da, sahaya dizdiğin oyuncuları da anlamıyorum. Haftaya kazanmazsan sonuçlarına katlanırsın!\"",
                 actionText: "Haklısınız Başkanım (-2 Moral)",
                 actionCallback: () => { window.teamConfidence = Math.max(0, (window.teamConfidence||100) - 2); }
             });
        } else if (isWin && p === "ŞOVMEN" && pChance < 0.4) {
             window.eventQueue.push({
                 title: "💰 BAŞKANDAN PRİM JESTİ",
                 message: "\"Aslanlarım benim! Helal olsun size! Soyunma odasına benden 500.000 Euro prim!\"",
                 actionText: "Harikasınız Başkanım (+10 Moral)",
                 actionCallback: () => { 
                     window.teamConfidence = Math.min(100, (window.teamConfidence||100) + 10); 
                     if (window.myTeam && window.myTeam.budget !== undefined) {
                         if (isNaN(window.myTeam.budget)) window.myTeam.budget = 5;
                         window.myTeam.budget -= 0.5;
                     }
                 }
             });
        } else if (isLoss && p === "VİZYONER" && pChance < 0.4) {
             window.eventQueue.push({
                 title: "☕ BAŞKANLA KAHVE",
                 message: "\"Hocam sonuç kötü ama projemize güveniyoruz. Sen sahaya odaklan, dışarıdaki seslere kulak tıkamaya devam et.\"",
                 actionText: "Teşekkürler Başkanım (+5 Güven)",
                 actionCallback: () => { window.boardTrust = Math.min(100, window.boardTrust + 5); }
             });
        } else if (isDraw && p === "CİMRİ" && pChance < 0.4) {
             window.eventQueue.push({
                 title: "📱 BAŞKANDAN MESAJ",
                 message: "\"Hocam deplasmandan 1 puan iyidir, bütçeyi yormadan puan puan ilerleyelim. Prim falan da istemesinler.\"",
                 actionText: "Anlaşıldı Başkanım",
                 actionCallback: () => {}
             });
        }

        // MEDIA REALITY SHOW LOGIC
        window.eventQueue = window.eventQueue || [];
        let mediaChance = Math.random();
        
        if (isLoss && mediaChance < 0.6) {
            window.eventQueue.push({
                title: "📺 GECE YARISI SPOR ŞOVU (KRİZ)",
                message: "Dün geceki programda yorumcular sizi ve taktiğinizi paramparça etti! Stüdyoda sinirler gerildi. Eski hakem yorumcusu <em>'Bu takımdan hiçbir şey olmaz!'</em> diyerek formayı yere fırlattı. Takımın morali düştü ve medya baskısı arttı!",
                actionText: "Televizyonu Kapat (-5 Güven)",
                actionCallback: () => {
                    window.boardTrust -= 5;
                    window.teamConfidence = (window.teamConfidence || 100) - 10;
                    if (window.teamConfidence < 0) window.teamConfidence = 0;
                    if(typeof boardEngine !== 'undefined') boardEngine.checkSacking();
                }
            });
        } else if (isWin && isDerby) {
            window.eventQueue.push({
                title: "📺 KAOTİK SPOR ŞOVU (ZAFER)",
                message: "Derbi zaferi sonrası stüdyo bayram yerine döndü! Yorumcular sizi överken, kaybeden takımın eski oyuncusu olan diğer yorumcu canlı yayını sinirle terk etti! Taraftar bu kaosu çok sevdi.",
                actionText: "Keyifle İzle (+5 Güven)",
                actionCallback: () => {
                    window.boardTrust += 5;
                    window.teamConfidence = (window.teamConfidence || 100) + 10;
                    if (window.teamConfidence > 100) window.teamConfidence = 100;
                }
            });
        } else if (isDraw && mediaChance < 0.4) {
            window.eventQueue.push({
                title: "📺 HAKEM TARTIŞMASI",
                message: "Dün geceki beraberliğin faturası hakeme kesildi. 3 saat boyunca stüdyoda hakemin verdiği o karar tartışıldı. Yorumcular çizgiyi kendileri çizmeye kalkınca komik anlar yaşandı.",
                actionText: "Gülerek Geç",
                actionCallback: () => {}
            });
        }

        this.checkSacking();
    },

    checkSacking: function() {
        if (window.boardTrust <= 15) {
            if(typeof speak === 'function') speak("Yönetim kurulu olağanüstü toplandı. Alınan kötü sonuçlar nedeniyle görevine son verildi. Kovuldun!");
            alert("YÖNETİM KARARI:\n\nÜst üste alınan kötü sonuçlar ve hedeflerden uzaklaşılması nedeniyle kulübümüzle olan sözleşmen tek taraflı olarak feshedilmiştir.\n\nKOVULDUNUZ!");
            // Reset game or show game over screen
            location.reload();
        } else if (window.boardTrust <= 30) {
            if(typeof speak === 'function') speak("Yönetim uyarıyor! Koltuğun sallanıyor, acil galibiyetlere ihtiyacımız var.");
            console.warn("YÖNETİM UYARISI: Koltuğunuz sallanıyor!");
        }
    },
    
    updateBoardUI: function() {
        let display = document.getElementById('board-trust-display');
        if (display) {
            let status = this.getTrustStatus();
            let profile = window.presidentProfile || "VİZYONER";
            display.textContent = `Başkan (${profile}) Güveni: %${Math.round(window.boardTrust)} (${status})`;
            
            if (window.boardTrust > 60) display.style.color = "#2ecc71";
            else if (window.boardTrust > 30) display.style.color = "#f39c12";
            else display.style.color = "#e74c3c";
        }
    },
    getTrustStatus: function() {
        if (window.boardTrust >= 80) return "Güvende (Mükemmel)";
        if (window.boardTrust >= 50) return "Stabil (Normal)";
        if (window.boardTrust >= 30) return "Baskı Altında (Kötü)";
        return "Kovulmanın Eşiğinde (Kritik)";
    }
};

window.boardEngine = boardEngine;

window.updateBoardUI = () => { if(window.boardEngine && window.boardEngine.updateBoardUI) window.boardEngine.updateBoardUI(); };

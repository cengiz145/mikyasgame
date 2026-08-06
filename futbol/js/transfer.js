// AŞAMA 33: İlişkisel Veritabanı Uyumlu Sıfır Hata Transfer Merkezi

let userTeamIdForTransfer = null;
window.pendingTransfers = window.pendingTransfers || [];

// Fiyat Hesaplama
function calculatePrice(player) {
    if (player.price) return player.price; // AŞAMA 34: Veritabanından gelen özel fiyat
    
    // Özel değerler
    const realValues = {
        "V. Osimhen": 100, "Icardi": 15, "Gabriel Sara": 18, "Torreira": 15, "D. Sanchez": 18, "Muslera": 1, 
        "En-Nesyri": 22, "Saint-Maximin": 18, "Szymanski": 19, "Fred": 15, "S. Amrabat": 22
    };
    if (realValues[player.name]) return realValues[player.name];

    let p = player.power || 50;
    
    // Akıllı ve Eksponansiyel Fiyat Hesaplama
    let value = 1;
    if (p >= 90) {
        value = 40 + (p - 90) * 15; // 90=40M, 95=115M
    } else if (p >= 85) {
        value = 20 + (p - 85) * 4;  // 85=20M, 89=36M
    } else if (p >= 80) {
        value = 10 + (p - 80) * 2;  // 80=10M, 84=18M
    } else if (p >= 75) {
        value = 5 + (p - 75) * 1;   // 75=5M, 79=9M
    } else if (p >= 65) {
        value = 2 + (p - 65) * 0.3; // 65=2M, 74=4.7M
    } else {
        value = 1;
    }
    
    // Yaş Çarpanı (Gençler pahalı, yaşlılar ucuz)
    let age = player.age || 25;
    if (age <= 21) value *= 1.5;
    else if (age >= 32) value *= 0.5;
    
    return Math.max(1, Math.round(value));
}

function initTransferScreen() {
    // Kullanıcının takımını tespit et
    if (window.league && window.league.userTeamId) {
        userTeamIdForTransfer = window.league.userTeamId;
    } else {
        userTeamIdForTransfer = "galatasaray"; // Varsayılan
    }

    updateBudgetUI();
    populateTeamSelect();
}

function updateBudgetUI() {
    let myTeam = window.leagueData.teams.find(t => t.id === userTeamIdForTransfer);
    if (myTeam) {
        window.budget = myTeam.budget; // Always sync UP to window.budget
    }
    
    const budgetEl = document.getElementById('budget-display');
    
    const fanEl = document.getElementById('fan-display');
    if(fanEl) {
        let cultureText = "Belirsiz";
        if (window.clubCultureProfile === "emektar_malzemeci") cultureText = "Emektar Malzemeci";
        else if (window.clubCultureProfile === "sosyal_medya_admini") cultureText = "Sosyal Medya";

        let fanProfileText = "Bilinmiyor";
        if (myTeam && myTeam.fanProfile) {
            let p = myTeam.fanProfile;
            if (p === "ultras") fanProfileText = "Ateşli (Ultras)";
            else if (p === "cekirdekci") fanProfileText = "Büyük Kitle (Çekirdekçi)";
            else if (p === "glory_hunters") fanProfileText = "İyi Gün Taraftarı";
            else if (p === "analist") fanProfileText = "Analist/Taktiksel";
            else if (p === "oyuncu_fanatigi") fanProfileText = "Oyuncu Fanatiği";
            else if (p === "nostaljik") fanProfileText = "Nostaljik";
        }

        let fanSupportVal = window.fanSupport !== undefined ? window.fanSupport : 50;
        let fanColor = fanSupportVal > 70 ? "#2ecc71" : (fanSupportVal < 30 ? "#e74c3c" : "#3498db");
        fanEl.innerHTML = `Taraftar: <span style="color:${fanColor};">%${fanSupportVal}</span> | Profil: ${fanProfileText} | Kültür: ${cultureText}`;
    }

    if(budgetEl && myTeam) {
        if (myTeam.budget < 0) {
            budgetEl.innerHTML = `Bütçeniz: <span style="color:red; font-weight:bold;">${myTeam.budget.toFixed(2)} Milyon Euro (BORÇ BATAĞI)</span>`;
        } else {
            budgetEl.innerHTML = `Bütçeniz: ${myTeam.budget.toFixed(2)} Milyon Euro`;
        }
    }
}

function populateTeamSelect() {
    let container = document.getElementById('transfer-center-container');
    let selectEl = document.getElementById('transfer-team-select');
    
    // Eğer Select menüsü HTML'de yoksa JS ile oluştur (Sıfır Hata Önlemi)
    if (!selectEl) {
        selectEl = document.createElement('select');
        selectEl.id = 'transfer-team-select';
        selectEl.className = 'menu-button';
        selectEl.style.marginBottom = '20px';
        selectEl.style.width = '100%';
        selectEl.style.padding = '10px';
        
        let listEl = document.getElementById('transfer-list');
        container.insertBefore(selectEl, listEl);
    }
    
    // Gelişmiş Arama Motoru (YENİ)
    let searchInput = document.getElementById('transfer-search-input');
    if (!searchInput) {
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'transfer-search-input';
        searchInput.placeholder = '🔍 16.000 Futbolcu Arasında İsimle Ara...';
        searchInput.style.width = '100%';
        searchInput.style.padding = '10px';
        searchInput.style.marginBottom = '10px';
        searchInput.style.borderRadius = '5px';
        searchInput.style.border = '1px solid #ccc';
        searchInput.style.fontSize = '1.1rem';
        
        const triggerSearch = () => {
            renderTransferPlayers(selectEl.value); // render fonksiyonu artık kendi içinden değerleri okuyacak
        };

        searchInput.addEventListener('input', triggerSearch);
        
        container.insertBefore(searchInput, selectEl);
        
        // Gelişmiş Filtreler Konteyneri
        let filterContainer = document.createElement('div');
        filterContainer.style.display = 'flex';
        filterContainer.style.gap = '10px';
        filterContainer.style.marginBottom = '15px';
        filterContainer.style.flexWrap = 'wrap';
        
        // Mevki Filtresi
        let posSelect = document.createElement('select');
        posSelect.id = 'transfer-filter-position';
        posSelect.className = 'menu-button';
        posSelect.style.flex = '1';
        posSelect.style.minWidth = '120px';
        posSelect.innerHTML = `
            <option value="">Tüm Mevkiler</option>
            <option value="Kaleci">Kaleci</option>
            <option value="Savunma">Savunma</option>
            <option value="Orta Saha">Orta Saha</option>
            <option value="Hücum">Hücum</option>
        `;
        posSelect.onchange = triggerSearch;
        
        // Yaş Filtresi
        let ageSelect = document.createElement('select');
        ageSelect.id = 'transfer-filter-age';
        ageSelect.className = 'menu-button';
        ageSelect.style.flex = '1';
        ageSelect.style.minWidth = '120px';
        ageSelect.innerHTML = `
            <option value="">Tüm Yaşlar</option>
            <option value="young">Genç Yetenek (≤ 22)</option>
            <option value="prime">Olgun (23 - 29)</option>
            <option value="veteran">Tecrübeli (≥ 30)</option>
        `;
        ageSelect.onchange = triggerSearch;

        // Uyruk Filtresi
        let natSelect = document.createElement('select');
        natSelect.id = 'transfer-filter-nationality';
        natSelect.className = 'menu-button';
        natSelect.style.flex = '1';
        natSelect.style.minWidth = '120px';
        natSelect.innerHTML = `
            <option value="">Tüm Uyruklar</option>
            <option value="yerli">Sadece Türkler 🇹🇷</option>
            <option value="yabanci">Yabancılar 🌍</option>
            <option value="Brezilya">Brezilya 🇧🇷</option>
            <option value="Arjantin">Arjantin 🇦🇷</option>
            <option value="İngiltere">İngiltere 🏴󠁧󠁢󠁥󠁮󠁧󠁿</option>
            <option value="İspanya">İspanya 🇪🇸</option>
            <option value="Fransa">Fransa 🇫🇷</option>
        `;
        natSelect.onchange = triggerSearch;

        // Güç Filtresi
        let powSelect = document.createElement('select');
        powSelect.id = 'transfer-filter-power';
        powSelect.className = 'menu-button';
        powSelect.style.flex = '1';
        powSelect.style.minWidth = '120px';
        powSelect.innerHTML = `
            <option value="">Tüm Güçler</option>
            <option value="star">Yıldız (80+)</option>
            <option value="first11">İlk 11 (70-79)</option>
            <option value="rotation">Rotasyon (<70)</option>
        `;
        powSelect.onchange = triggerSearch;

        // Bütçe Filtresi
        let valSelect = document.createElement('select');
        valSelect.id = 'transfer-filter-value';
        valSelect.className = 'menu-button';
        valSelect.style.flex = '1';
        valSelect.style.minWidth = '120px';
        valSelect.innerHTML = `
            <option value="">Tüm Fiyatlar</option>
            <option value="cheap">Ucuz (≤ 10M €)</option>
            <option value="mid">Ortalama (11M - 30M €)</option>
            <option value="expensive">Pahalı (> 30M €)</option>
        `;
        valSelect.onchange = triggerSearch;
        
        filterContainer.appendChild(posSelect);
        filterContainer.appendChild(ageSelect);
        filterContainer.appendChild(natSelect);
        filterContainer.appendChild(powSelect);
        filterContainer.appendChild(valSelect);
        container.insertBefore(filterContainer, selectEl);
    }
    
    selectEl.innerHTML = '';

    // 0. Transfer Piyasasını İlerlet Butonu Ekle
    let advanceBtn = document.getElementById('advance-market-btn');
    if(!advanceBtn) {
        advanceBtn = document.createElement('button');
        advanceBtn.id = 'advance-market-btn';
        advanceBtn.className = 'menu-button';
        advanceBtn.innerHTML = '🔄 Transfer Piyasasını İlerlet (Botlar Listeyi Günceller)';
        advanceBtn.style.width = '100%';
        advanceBtn.style.marginBottom = '10px';
        advanceBtn.style.background = '#8e44ad';
        advanceBtn.onclick = () => simulateBotTransfers();
        container.insertBefore(advanceBtn, selectEl);
    }

    // 1. Genel Transfer Listesi
    const generalOption = document.createElement('option');
    generalOption.value = 'transfer_list_view';
    generalOption.text = '🌍 Genel Transfer Listesi (Satılık Tüm Oyuncular)';
    selectEl.appendChild(generalOption);

    // 2. Sizin Takımınız (Satış İçin)
    const myTeam = window.leagueData.teams.find(t => t.id === userTeamIdForTransfer);
    if(myTeam) {
        const myOption = document.createElement('option');
        myOption.value = myTeam.id;
        myOption.text = `Sizin Takımınız (${myTeam.name}) - Kadronuz`;
        selectEl.appendChild(myOption);
    }

    // 2. Diğer Takımlar ve Serbest Oyuncular
    window.leagueData.teams.forEach(t => {
        if (t.id !== userTeamIdForTransfer) {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.text = t.name;
            selectEl.appendChild(opt);
        }
    });

    selectEl.onchange = () => {
        renderTransferPlayers(selectEl.value);
    };

    // İlk açılışta kendi takımımızı göster
    renderTransferPlayers(userTeamIdForTransfer);
}

function renderTransferPlayers(targetTeamId, oldSearchParam) {
    const listEl = document.getElementById('transfer-list');
    if(!listEl) return;
    
    // Filtre Değerlerini Oku
    let searchInputEl = document.getElementById('transfer-search-input');
    let posSelectEl = document.getElementById('transfer-filter-position');
    let ageSelectEl = document.getElementById('transfer-filter-age');
    let natSelectEl = document.getElementById('transfer-filter-nationality');
    let powSelectEl = document.getElementById('transfer-filter-power');
    let valSelectEl = document.getElementById('transfer-filter-value');
    
    let searchQuery = searchInputEl ? searchInputEl.value.toLowerCase().trim() : (oldSearchParam || "");
    let posFilter = posSelectEl ? posSelectEl.value : "";
    let ageFilter = ageSelectEl ? ageSelectEl.value : "";
    let natFilter = natSelectEl ? natSelectEl.value : "";
    let powFilter = powSelectEl ? powSelectEl.value : "";
    let valFilter = valSelectEl ? valSelectEl.value : "";
    
    // Eğer eski search parametresi geldiyse arama kutusunu ona ayarla (Geriye Dönük Uyumluluk)
    if (targetTeamId === 'search' && searchQuery) {
        if (searchInputEl && searchInputEl.value !== searchQuery) searchInputEl.value = searchQuery;
    }
    
    listEl.innerHTML = '';
    const isMyTeam = (targetTeamId === userTeamIdForTransfer);
    let targetPlayers = [];
    
    if (targetTeamId === 'search' || searchQuery.length >= 2) {
        // İsim araması varsa tüm veritabanında ara
        targetPlayers = window.leagueData.players.filter(p => p.name.toLowerCase().includes(searchQuery)).slice(0, 100);
    } else if (targetTeamId === 'transfer_list_view') {
        // Tüm takımlardaki 'Satılık' oyuncular ve serbest oyuncular (kullanıcının takımı hariç)
        targetPlayers = window.leagueData.players.filter(p => 
            p.teamId !== userTeamIdForTransfer && 
            (p.isListed === true || p.teamId === 'free_agent')
        );
    } else {
        // Sadece seçilen takımdaki oyuncular
        targetPlayers = window.leagueData.players.filter(p => p.teamId === targetTeamId);
    }
    
    // KESİN KURAL: Kendi takımımız hariç, transfer listesinde OLMAYAN futbolcuları gizle
    if (!isMyTeam) {
        targetPlayers = targetPlayers.filter(p => p.isListed === true || p.teamId === 'free_agent');
    }
    
    if (posFilter) {
        const positionsMap = {
            "Kaleci": ["Kaleci", "GK", "KL"],
            "Savunma": ["Stoper", "Sağ Bek", "Sol Bek", "Merkez Bek", "Bek", "DF"],
            "Orta Saha": ["Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro", "OS"],
            "Hücum": ["Forvet", "Sağ Kanat", "Sol Kanat", "Sol Forvet", "Sağ Forvet", "Santrafor", "Santrfor", "10 Numara", "On Numara", "Gizli Forvet", "Sağ Açık", "Sol Açık", "Kanat", "FV"]
        };
        targetPlayers = targetPlayers.filter(p => {
            let pPos = p.position || "";
            return positionsMap[posFilter].some(fPos => pPos.includes(fPos) || pPos === fPos);
        });
    }
    
    if (ageFilter) {
        targetPlayers = targetPlayers.filter(p => {
            let pAge = p.age || 25; // Eğer yaş yoksa 25 kabul et
            if (ageFilter === 'young') return pAge <= 22;
            if (ageFilter === 'prime') return pAge >= 23 && pAge <= 29;
            if (ageFilter === 'veteran') return pAge >= 30;
            return true;
        });
    }

    if (natFilter) {
        targetPlayers = targetPlayers.filter(p => {
            let pNat = p.nationality || "";
            if (natFilter === 'yerli') return pNat === "Türkiye";
            if (natFilter === 'yabanci') return pNat !== "Türkiye";
            return pNat === natFilter;
        });
    }

    if (powFilter) {
        targetPlayers = targetPlayers.filter(p => {
            let pPow = p.power || 50;
            if (powFilter === 'star') return pPow >= 80;
            if (powFilter === 'first11') return pPow >= 70 && pPow < 80;
            if (powFilter === 'rotation') return pPow < 70;
            return true;
        });
    if (valFilter) {
        targetPlayers = targetPlayers.filter(p => {
            let price = calculatePrice(p);
            if (valFilter === 'cheap') return price <= 10;
            if (valFilter === 'mid') return price > 10 && price <= 30;
            if (valFilter === 'expensive') return price > 30;
            return true;
        });
    }

    // Kategori Tanımları
    const categories = [
        { id: "hucum", name: "🔥 HÜCUM HATTI (Forvet & Kanatlar)", positions: ["Forvet", "Sağ Kanat", "Sol Kanat", "Sol Forvet", "Sağ Forvet", "Santrafor", "Santrfor", "10 Numara", "On Numara", "Gizli Forvet", "Sağ Açık", "Sol Açık", "Kanat", "FV"] },
        { id: "orta", name: "🧠 ORTA SAHA (Maestro & Ön Libero)", positions: ["Maestro", "Forvet Arkası", "Ön Libero", "Orta Saha", "Merkez Orta Saha", "OS"] },
        { id: "savunma", name: "🛡️ SAVUNMA (Stoper & Bekler)", positions: ["Stoper", "Sağ Bek", "Sol Bek", "Merkez Bek", "Bek", "DF"] },
        { id: "kaleci", name: "🧤 KALECİLER", positions: ["Kaleci", "KL", "GK"] }
    ];

    // Tipleme Çevirileri
    const mentalIcons = { "elite": "🧠 Lider", "aggressive": "⚔️ Agresif", "fragile": "🩹 Hassas" };
    const roleIcons = {
        "inside_forward": "⚡ Kat Eden", "poacher": "🎯 Fırsatçı", "target_man": "🗼 Pivot",
        "playmaker": "🎩 Oyun Kurucu", "maestro": "🎻 Şef", "box_to_box": "🏃 Dinamo",
        "anchor": "⚓ Çapa", "stopper": "🧱 Duvar", "sweeper": "🧹 Süpürücü",
        "classic": "🛡️ Standart", "sweeper_keeper": "🦅 Uçan Kaleci", "false_9": "👻 Sahte 9", "regista": "🎯 Regista"
    };

    categories.forEach(cat => {
        // Filtrele ve Güce göre sırala (büyükten küçüğe)
        let playersInCat = targetPlayers.filter(p => cat.positions.includes(p.position));
        playersInCat.sort((a, b) => b.power - a.power);

        if (playersInCat.length > 0) {
            // Başlık ekle
            const header = document.createElement('h3');
            header.innerHTML = cat.name;
            header.style.color = "#f1c40f";
            header.style.borderBottom = "1px solid #555";
            header.style.paddingBottom = "5px";
            header.style.marginTop = "20px";
            listEl.appendChild(header);

            // Oyuncuları ekle
            playersInCat.forEach(p => {
                const price = calculatePrice(p);
                const btn = document.createElement('button');
                btn.className = 'menu-button';
                btn.style.width = "100%";
                btn.style.marginBottom = "10px";
                btn.style.textAlign = "left";
                btn.style.display = "block";
                btn.style.background = isMyTeam ? "#c0392b" : "#27ae60";
                btn.style.color = "white";
                
                let mentalStr = mentalIcons[p.mentalTrait] || "👤 " + (p.mentalTrait || "Standart");
                let roleStr = roleIcons[p.tacticalRole] || "⚽ " + (p.tacticalRole || "Genel");
                
                let finalPrice = price;
                let priceHtml = '';
                let isBuyable = true;
                let isBosman = (!isMyTeam && p.teamId !== 'free_agent' && p.contractYears === 1);
                
                if (isMyTeam) {
                    priceHtml = `<span style="color:#f1c40f; font-size:1.1em;">Satış: ${finalPrice}M €</span>`;
                } else {
                    if (isBosman) {
                        finalPrice = Math.max(1, Math.round(price * 0.15)); // Bosman İmza Parası
                        priceHtml = `🟢 <span style="color:#2ecc71; font-size:1.1em; font-weight:bold;">[BOSMAN] İmza Parası: ${finalPrice}M €</span>`;
                    } else if (p.isListed || p.teamId === 'free_agent') {
                        priceHtml = `🛒 <span style="color:#2ecc71; font-size:1.1em;">Satılık: ${finalPrice}M €</span>`;
                    } else {
                        // Satılık değil, fesih bedeli ile alabilir
                        finalPrice = price * 3; 
                        priceHtml = `❌ <span style="color:#e74c3c; font-size:1.1em;">Satılık Değil (Fesih: ${finalPrice}M €)</span>`;
                    }
                }

                let actionIcon = isMyTeam ? "💵" : "🛒";
                
                // AŞAMA 35: Psikoloji Gösterimi
                let psychoHtml = isMyTeam && p.happiness ? `<span style="color:#3498db; font-size:1.1em; font-weight:bold;"> Durum: ${p.happiness} (${p.benchedMatches || 0} Yedek)</span><br>` : '';
                let contractHtml = `<span style="color:#f39c12;">Sözleşme: ${p.contractYears || 1} Yıl</span> | `;

                btn.innerHTML = `${actionIcon} <b>${p.name}</b> (${p.position}) | Yaş: ${p.age || 25} | Takım: ${p.teamId === 'free_agent' ? 'Serbest' : p.teamId.toUpperCase()}<br>
                                 Güç: <b>${p.power}</b> | Hız: ${p.speed} | <small style="color:#ddd; font-style:italic;">${mentalStr} | ${roleStr}</small><br>
                                 ${contractHtml}${psychoHtml}${priceHtml}`;
                                 
                if (p.isPendingTransfer) {
                    btn.style.opacity = "0.5";
                    btn.innerHTML += `<br><span style="color:#f1c40f;">(Görüşmeler Sürüyor...)</span>`;
                    btn.onclick = () => alert("Bu oyuncu için zaten bir teklif yaptınız. Cevap bekleniyor.");
                } else if (p.negotiationFailed) {
                    btn.style.opacity = "0.5";
                    btn.innerHTML += `<br><span style="color:#e74c3c;">(Görüşmeler Çöktü)</span>`;
                    btn.onclick = () => alert("Menajer sizinle görüşmek istemiyor. Pazarlık çöktü!");
                } else {
                    btn.onclick = () => isMyTeam ? sellPlayer(p, finalPrice) : window.showTransferActionModal(p, finalPrice);
                }

                const li = document.createElement('li');
                li.appendChild(btn);
                listEl.appendChild(li);
            });
        }
    });

    // Eğer mevkilere uymayan oyuncu varsa (DİĞER) - Fail Safe
    let otherPlayers = targetPlayers.filter(p => !categories.some(cat => cat.positions.includes(p.position)));
    if (otherPlayers.length > 0) {
        otherPlayers.sort((a, b) => b.power - a.power);
        const header = document.createElement('h3');
        header.innerHTML = "❔ DİĞER";
        header.style.color = "#ccc";
        listEl.appendChild(header);
        
        otherPlayers.forEach(p => {
            const price = calculatePrice(p);
            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.style.width = "100%";
            btn.style.marginBottom = "10px";
            btn.style.background = isMyTeam ? "#c0392b" : "#27ae60";
            if (p.negotiationFailed) {
                btn.style.background = "#7f8c8d";
                btn.onclick = () => alert("Menajer sizinle görüşmek istemiyor. Pazarlık çöktü!");
            } else {
                btn.onclick = () => isMyTeam ? sellPlayer(p, price) : window.showTransferActionModal(p, price);
            }
            let finalPrice = price;
            let status = "";
            let isBosman = (!isMyTeam && p.teamId !== 'free_agent' && p.contractYears === 1);
            if (!isMyTeam) {
                if (isBosman) {
                    finalPrice = Math.max(1, Math.round(price * 0.15));
                    status = "🟢 [BOSMAN] İmza Parası: " + finalPrice + "M";
                } else if (p.isListed || p.teamId === 'free_agent') { 
                    status = "🌟 Satılık: " + finalPrice + "M"; 
                }
                else { 
                    finalPrice = price * 3; 
                    status = "❌ Satılık Değil (Fesih: "+finalPrice+"M)"; 
                }
            }
            btn.innerHTML = `<b>${p.name}</b> (${p.position}) | Yaş: ${p.age || 25} | Takım: ${p.teamId === 'free_agent' ? 'Serbest' : p.teamId.toUpperCase()} | Güç: ${p.power} - ${isMyTeam ? "Satış: " + price : status} M €`;
            
            const li = document.createElement('li');
            li.appendChild(btn);
            listEl.appendChild(li);
        });
    }
}

// YENİ: Transfer Seçim Ekranı (Satın Al veya Kirala)
window.showTransferActionModal = function(player, finalPrice) {
    if (player.teamId === 'free_agent') {
        window.openNegotiation(player, finalPrice);
        return;
    }

    // YENİ: Takım içi güç sıralaması analizi
    let teamPlayers = window.leagueData.players.filter(p => p.teamId === player.teamId).sort((a,b) => b.power - a.power);
    let playerIndex = teamPlayers.findIndex(p => p.id === player.id);
    let isStarter = playerIndex >= 0 && playerIndex < 11;
    let isUnwanted = player.isListed || playerIndex >= 16;
    
    // Kiralama çarpanları
    let loanHalfMod = isStarter ? 0.30 : (isUnwanted ? 0.05 : 0.15);
    let loanFullMod = isStarter ? 0.60 : (isUnwanted ? 0.10 : 0.30);

    let oldModal = document.getElementById('transfer-action-modal');
    if (oldModal) oldModal.remove();

    let overlay = document.createElement('div');
    overlay.id = 'transfer-action-modal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100%'; overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex'; if(overlay) { let title = overlay.querySelector('h1, h2'); if(title) title.focus(); else overlay.focus(); };
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    let modalBox = document.createElement('div');
    modalBox.style.background = 'linear-gradient(to bottom, #1e3c72, #2a5298)';
    modalBox.style.border = '3px solid #f39c12';
    modalBox.style.borderRadius = '15px';
    modalBox.style.padding = '30px';
    modalBox.style.maxWidth = '500px';
    modalBox.style.width = '90%';
    modalBox.style.color = 'white';
    modalBox.style.textAlign = 'center';

    let titleHtml = `<h2>${player.name} Transfer İşlemi</h2>`;
    
    let isBosman = (player.teamId !== 'free_agent' && player.contractYears === 1);
    if (isBosman) {
        titleHtml += `<p style="color:#2ecc71; font-weight:bold; margin-top:10px;">🟢 Bu oyuncunun sözleşmesi bitmek üzere! Kulübüne bonservis ödenmeyecek, bu tutar sadece menajerlik imza parasıdır.</p>`;
    }
    
    let title = document.createElement('div');
    title.innerHTML = titleHtml;
    title.style.color = '#f1c40f';
    
    let btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex'; if(btnContainer) { let title = btnContainer.querySelector('h1, h2'); if(title) title.focus(); else btnContainer.focus(); };
    btnContainer.style.flexDirection = 'column';
    btnContainer.style.gap = '10px';
    btnContainer.style.marginTop = '20px';

    let btnBuy = document.createElement('button');
    btnBuy.className = 'menu-button';
    btnBuy.style.backgroundColor = '#27ae60';
    btnBuy.innerHTML = `Bonservisiyle Satın Al`;
    btnBuy.onclick = () => {
        overlay.remove();
        window.openNegotiation(player, finalPrice);
    };

    let halfLoanFee = Math.max(1, Math.round(finalPrice * loanHalfMod));
    let btnLoanHalf = document.createElement('button');
    btnLoanHalf.className = 'menu-button';
    btnLoanHalf.style.backgroundColor = '#e67e22';
    btnLoanHalf.innerHTML = `Yarım Sezon Kirala (${halfLoanFee} Milyon Euro)`;
    btnLoanHalf.onclick = () => {
        overlay.remove();
        window.processLoanRequest(player, halfLoanFee, 17);
    };

    let fullLoanFee = Math.max(1, Math.round(finalPrice * loanFullMod));
    let btnLoanFull = document.createElement('button');
    btnLoanFull.className = 'menu-button';
    btnLoanFull.style.backgroundColor = '#d35400';
    btnLoanFull.innerHTML = `1 Yıl Kirala (${fullLoanFee} Milyon Euro)`;
    btnLoanFull.onclick = () => {
        overlay.remove();
        window.processLoanRequest(player, fullLoanFee, 34);
    };

    let btnCancel = document.createElement('button');
    btnCancel.className = 'menu-button';
    btnCancel.style.backgroundColor = '#7f8c8d';
    btnCancel.innerHTML = `İptal`;
    btnCancel.onclick = () => overlay.remove();

    btnContainer.appendChild(btnBuy);
    btnContainer.appendChild(btnLoanHalf);
    btnContainer.appendChild(btnLoanFull);
    btnContainer.appendChild(btnCancel);

    modalBox.appendChild(title);
modalBox.appendChild(btnContainer);
    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);
    setTimeout(() => { if (btnBuy) btnBuy.focus(); }, 50);
};

window.processLoanRequest = function(player, fee, weeks) {
    let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
    let myTeam = window.leagueData.teams.find(t => t.id === myTeamId);
    if (myTeam.budget < fee) {
        return alert(`Kiralama bedeli için bütçeniz yetersiz! (${fee} Milyon Euro gerekiyor)`);
    }

    if(confirm(`${player.name} oyuncusunu ${weeks} haftalığına ${fee} Milyon Euro karşılığında kiralıyorsunuz. Onaylıyor musunuz?`)) {
        myTeam.budget -= fee;
        player.isLoaned = true;
        player.loanWeeksLeft = weeks;
        player.originalTeamId = player.teamId;
        player.teamId = myTeam.id;

        alert(`BAŞARILI: ${player.name} kiralandı ve kadroya katıldı! Kalan Hafta: ${weeks}`);
        if(typeof renderTransferPlayers === 'function') {
            renderTransferPlayers(myTeam.id);
        }
        if(typeof updateFinancesUI === 'function') updateFinancesUI();
    }
};

function buyPlayer(player, price) {
    if(typeof playSound === 'function' && typeof enterSound !== 'undefined') playSound(enterSound);

    let myTeam = window.leagueData.teams.find(t => t.id === userTeamIdForTransfer);

    if (myTeam.budget >= price) {
        // [YENİ] Anında almak yerine kuyruğa ekle
        window.pendingTransfers.push({
            type: 'buy_player',
            player: player,
            price: price,
            teamId: userTeamIdForTransfer,
            waitDays: Math.floor(Math.random() * 2) + 1 // 1-2 gün bekle
        });
        
        player.isPendingTransfer = true; 
        alert(`${player.name} için transfer talebiniz kulübüne iletildi. Birkaç gün içinde cevap verecekler.`);
        if(typeof speak === 'function') {
            speak(`Transfer talebi iletildi.`);
        }
        
        const selectEl = document.getElementById('transfer-team-select');
        renderTransferPlayers(selectEl ? selectEl.value : "free_agent");
    } else {
        if(typeof speak === 'function') {
            speak(`Bütçeniz yetersiz! ${player.name} için ${price} Milyon Euro gerekiyor.`);
        }
    }
}

function sellPlayer(player, price) {
    if(typeof playSound === 'function' && typeof enterSound !== 'undefined') playSound(enterSound);

    let myTeam = window.leagueData.teams.find(t => t.id === userTeamIdForTransfer);
    
    // Takımdaki oyuncu sayısını say (Maça çıkabilmek için minimum 11)
    let myPlayerCount = window.leagueData.players.filter(p => p.teamId === userTeamIdForTransfer).length;

    if (myPlayerCount <= 11) {
        // AŞAMA 39: REGEN SİSTEMİ
        if(typeof speak === 'function') speak(`Kadro eksiğini kapatmak için altyapıdan 17 yaşında bir çaylak A takıma çıkarıldı.`);
        
        let newRookie = {
            id: "regen_" + Date.now(),
            name: "Altyapı Genci",
            teamId: userTeamIdForTransfer,
            position: player.position,
            power: Math.floor(Math.random() * 15) + 35, // 35-50 arası
            speed: Math.floor(Math.random() * 3) + 2,
            tacticalRole: "classic",
            mentalTrait: "fragile",
            isListed: false
        };
        window.leagueData.players.push(newRookie);
    }

    myTeam.budget += price;
    player.teamId = "free_agent"; // AŞAMA 33: Serbest havuza yolla!
    player.wasInUserTeam = true; // AŞAMA 46: Hain Yuhalaması için işaretle
    if (typeof window.removePlayerFromTactics === 'function') window.removePlayerFromTactics(player.id);
    
    updateBudgetUI();
    renderTransferPlayers(userTeamIdForTransfer);

    if(typeof speak === 'function') {
        speak(`${player.name} isimli oyuncu ${price} Milyon Euro'ya satıldı. Artık serbest statüde.`);
    }
    if(typeof saveGame === 'function') saveGame(true); // Otomatik kaydet
}


// ==========================================
// YAPAY ZEKA TRANSFER BOTU (AKILLI SATILIK LİSTESİ)
// ==========================================
function simulateBotTransfers() {
    let listedCount = 0;
    
    // Önce takımların kadro derinliklerini hesapla
    let teamSquads = {};
    window.leagueData.players.forEach(p => {
        if (!teamSquads[p.teamId]) teamSquads[p.teamId] = { count: 0, byPos: {} };
        teamSquads[p.teamId].count++;
        
        let posGroup = "Diğer";
        if (["Kaleci", "KL", "GK"].includes(p.position)) posGroup = "KL";
        else if (["Stoper", "Sağ Bek", "Sol Bek", "Merkez Bek", "Bek", "DF"].includes(p.position)) posGroup = "DF";
        else if (["Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro", "OS"].includes(p.position)) posGroup = "OS";
        else if (["Forvet", "Sağ Kanat", "Sol Kanat", "Sol Forvet", "Sağ Forvet", "Santrafor", "Santrfor", "FV"].includes(p.position)) posGroup = "FV";
        
        if (!teamSquads[p.teamId].byPos[posGroup]) teamSquads[p.teamId].byPos[posGroup] = [];
        teamSquads[p.teamId].byPos[posGroup].push(p);
    });

    // Oyuncuları değerlendir
    window.leagueData.players.forEach(p => {
        if (p.teamId === "free_agent") {
            p.isListed = (Math.random() < 0.15); // Serbest oyuncuların %15'i aktif menajer arıyor
            if (p.isListed) listedCount++;
            return;
        }
        
        // Kullanıcının oyuncularına dokunma
        if (p.teamId === userTeamIdForTransfer) {
            p.isListed = false; 
            return;
        }

        // AKILLI SATILIK LOGIC
        p.isListed = false; // Varsayılan
        let squad = teamSquads[p.teamId];
        
        // Eğer takımın toplam oyuncusu 18'den azsa KİMSEYİ satılığa koyma (Çökme koruması)
        if (squad && squad.count <= 18) return;

        let posGroup = "Diğer";
        if (["Kaleci", "KL", "GK"].includes(p.position)) posGroup = "KL";
        else if (["Stoper", "Sağ Bek", "Sol Bek", "Merkez Bek", "Bek", "DF"].includes(p.position)) posGroup = "DF";
        else if (["Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro", "OS"].includes(p.position)) posGroup = "OS";
        else if (["Forvet", "Sağ Kanat", "Sol Kanat", "Sol Forvet", "Sağ Forvet", "Santrafor", "Santrfor", "FV"].includes(p.position)) posGroup = "FV";

        let posPlayers = squad.byPos[posGroup] || [];
        posPlayers.sort((a,b) => b.power - a.power);
        
        let playerRank = posPlayers.findIndex(x => x.id === p.id);
        
        // 1. Durum: Rotasyon Fazlası (O mevkide en kötü oyunculardan biriyse ve takımda o mevkiden çok adam varsa)
        let isRotationExcess = false;
        if (posGroup === "KL" && posPlayers.length > 3 && playerRank >= 2) isRotationExcess = true;
        if (posGroup === "DF" && posPlayers.length > 8 && playerRank >= 6) isRotationExcess = true;
        if (posGroup === "OS" && posPlayers.length > 8 && playerRank >= 6) isRotationExcess = true;
        if (posGroup === "FV" && posPlayers.length > 6 && playerRank >= 4) isRotationExcess = true;

        // 2. Durum: Yaşlanan ve Düşüşteki Yıldız
        let isAging = (p.age >= 33 && playerRank >= 2);
        
        // 3. Durum: Mutsuz Oyuncu
        let isUnhappy = (p.happiness && p.happiness < 40);

        if (isRotationExcess || isAging || isUnhappy) {
            if (Math.random() < 0.6) { // %60 ihtimalle satışa konur
                p.isListed = true;
                listedCount++;
            }
        } else {
            // Hiçbiri değilse rastgele ufak bir ihtimal (%2) kulüp oyuncuyu gözden çıkarmış olabilir
            if (Math.random() < 0.02) {
                p.isListed = true;
                listedCount++;
            }
        }
    });

    if(typeof speak === 'function') {
        speak(`Avrupa piyasası güncellendi. Kulüpler kadroda düşünmedikleri oyuncuları satış listesine koydu.`);
    }
    
    // UI Güncelle
    const selectEl = document.getElementById('transfer-team-select');
    if(selectEl) {
        renderTransferPlayers(selectEl.value);
    }
}

// --- [YENİ] GLOBAL (YABANCI) TRANSFER HABERLERİ SİSTEMİ ---
window.simulateGlobalBotTransfers = function() {
    if (!window.leagueData || !window.leagueData.players || !window.leagueData.teams) return;
    
    // Her gün sadece %15 ihtimalle global bir transfer gerçekleşir
    if (Math.random() > 0.15) return;

    let foreignTeams = window.leagueData.teams.filter(t => t.id !== window.myTeamId && t.leagueId !== (window.selectedLeague || "superlig"));
    if (foreignTeams.length < 2) return;

    // Alıcı takımı seç
    let buyer = foreignTeams[Math.floor(Math.random() * foreignTeams.length)];
    
    // Yüksek reytingli potansiyel yıldız oyuncu ara
    let eligiblePlayers = window.leagueData.players.filter(p => 
        p.teamId !== buyer.id && 
        p.teamId !== window.myTeamId && 
        ((p.power || 50) + (p.speed || 50) + (p.experience || 50)) / 3 > 80
    );
    
    if (eligiblePlayers.length === 0) return;
    
    let targetPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    let oldTeam = window.leagueData.teams.find(t => t.id === targetPlayer.teamId);
    let oldTeamName = oldTeam ? oldTeam.name : "eski kulübü";
    
    // Transferi gerçekleştir
    targetPlayer.teamId = buyer.id;
    targetPlayer.isListed = false;

    // Gazete haberine ekle
    let transferFees = [40, 55, 70, 85, 100, 120];
    let fee = transferFees[Math.floor(Math.random() * transferFees.length)];
    
    let headlines = [
        `BOMBA TRANSFER! ${buyer.name}, ${targetPlayer.name} ile anlaştı!`,
        `Kıtalararası Çılgınlık: ${targetPlayer.name} resmen ${buyer.name}'de!`,
        `Yılın Transferi: ${buyer.name}, ${oldTeamName}'nden yıldız oyuncuyu kopardı!`
    ];
    let selectedHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    
    let newsText = `Avrupa piyasasında dengeler değişti! ${buyer.name}, uzun süredir peşinde olduğu yıldız oyuncu ${targetPlayer.name} için ${oldTeamName} ile yaklaşık ${fee} Milyon Euro karşılığında el sıkıştı. Yıldız ismin yeni takımında neler yapacağı merak konusu.`;
    
    if (!window.newspaperQueue) window.newspaperQueue = [];
    window.newspaperQueue.push({
        priority: 9,
        headline: selectedHeadline,
        content: newsText,
        newspaperType: 'default',
        subheadline: `Avrupa'da transfer borsası alev aldı! Maliyet: ${fee}M Euro`,
        reporter: "Fabrizio Romano" // Eğlenceli küçük detay
    });

    // Günlük habere de düşür
    const dailyNewsText = document.getElementById('daily-news-text');
    if (dailyNewsText) {
        dailyNewsText.textContent = `SON DAKİKA: ${buyer.name}, ${targetPlayer.name}'i ${fee} Milyon Euro'ya kadrosuna kattı!`;
    }
};

// --- GELEN SCOUT TEKLİFLERİ SİSTEMİ ---
window.checkIncomingOffers = function() {
    let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
    let myPlayers = window.leagueData.players.filter(p => p.teamId === myTeamId);
    
    // %25 ihtimalle teklif gelir
    if (Math.random() > 0.25) return;

    // Hedef oyuncuyu seç (Çok kötü kondisyonlu olmasın)
    let eligiblePlayers = myPlayers.filter(p => (!p.condition || p.condition > 40));
    if (eligiblePlayers.length === 0) return;

    // Rastgele birine gelsin
    let targetPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

    let baseVal = calculatePrice(targetPlayer);
    let interestedClub = "";
    let pot = targetPlayer.hiddenPotential || targetPlayer.power;
    let multiplier = (Math.random() * 0.5) + 0.8; // Default 0.8 - 1.3

    const topClubs = ['Real Madrid', 'Manchester City', 'Bayern Munich', 'PSG', 'Barcelona'];
    const highClubs = ['Ajax', 'Sevilla', 'Bologna', 'Lille', 'Sporting CP', 'Benfica', 'Marsilya', 'Fiorentina'];
    const midClubs = ['Kızılyıldız', 'Dinamo Zagreb', 'Slavia Prag', 'AEK', 'Young Boys', 'Olympiakos', 'Rangers'];
    const lowClubs = ['Al Nassr', 'Al Hilal', 'Inter Miami', 'LA Galaxy', 'Boca Juniors', 'River Plate', 'Al Sadd', 'Flamengo', 'Palmeiras', 'Santos'];

    if (targetPlayer.age <= 24 && pot >= 88) {
        // Wonderkid! Gerçek gücü düşük olsa bile potansiyeli gören devler devreye girer.
        interestedClub = topClubs[Math.floor(Math.random() * topClubs.length)];
        multiplier = (Math.random() * 1.0) + 1.5; // Potansiyel için yüksek ödeme
        if (baseVal < 5) baseVal = 8; // Wonderkid asgari değeri
    } else if (targetPlayer.power >= 80) {
        interestedClub = highClubs[Math.floor(Math.random() * highClubs.length)];
    } else if (targetPlayer.power >= 65 && targetPlayer.power < 80) {
        interestedClub = midClubs[Math.floor(Math.random() * midClubs.length)];
    } else {
        // Yaşı geçmiş veya gücü düşük (düşmüş) oyuncular
        interestedClub = lowClubs[Math.floor(Math.random() * lowClubs.length)];
        multiplier = (Math.random() * 0.4) + 0.6; // Daha düşük ödeme (0.6 - 1.0)
    }

    let offerPrice = Math.round(baseVal * multiplier);
    if (offerPrice < 1) offerPrice = 1;

    window.showIncomingOfferModal(targetPlayer, interestedClub, offerPrice);
};

window.showIncomingOfferModal = function(player, clubName, offerPrice) {
    // Varsa eskisini sil
    let oldModal = document.getElementById('scout-offer-modal');
    if (oldModal) oldModal.remove();

    let overlay = document.createElement('div');
    overlay.id = 'scout-offer-modal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100%'; overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex'; if(overlay) { let title = overlay.querySelector('h1, h2'); if(title) title.focus(); else overlay.focus(); };
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    let modalBox = document.createElement('div');
    modalBox.style.background = 'linear-gradient(to bottom, #1e3c72, #2a5298)';
    modalBox.style.border = '3px solid #f39c12';
    modalBox.style.borderRadius = '15px';
    modalBox.style.padding = '30px';
    modalBox.style.maxWidth = '500px';
    modalBox.style.width = '90%';
    modalBox.style.color = 'white';
    modalBox.style.textAlign = 'center';
    modalBox.style.boxShadow = '0 15px 30px rgba(0,0,0,0.6)';

    let title = document.createElement('h2');
    title.style.color = '#f1c40f';
    title.style.marginBottom = '15px';
    title.innerHTML = 'SCOUT RAPORU: RESMİ TEKLİF!';

    let text = document.createElement('p');
    text.style.fontSize = '18px';
    text.style.lineHeight = '1.5';
    text.style.marginBottom = '25px';
    text.innerHTML = `<strong>${clubName}</strong> gözlemcileri son haftalarda <strong>${player.name}</strong>'i yakından takip etti ve sistemlerine tam uyduğunu düşünüyorlar. Oyuncuyu kadrolarına katmak için kulübünüze tam <strong>${offerPrice} Milyon Euro</strong> teklif ediyorlar. Ne yanıt vermek istersiniz?`;

    let btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex'; if(btnContainer) { let title = btnContainer.querySelector('h1, h2'); if(title) title.focus(); else btnContainer.focus(); };
    btnContainer.style.justifyContent = 'center';
    btnContainer.style.gap = '10px';
    btnContainer.style.flexWrap = 'wrap';

    let btnAccept = document.createElement('button');
    btnAccept.className = 'menu-button';
    btnAccept.style.backgroundColor = '#27ae60';
    btnAccept.style.margin = '0';
    btnAccept.style.padding = '10px 20px';
    btnAccept.innerHTML = `Kabul Et (${offerPrice} M€)`;
    btnAccept.onclick = () => {
        let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
        let myTeam = window.leagueData.teams.find(t => t.id === myTeamId);
        if (myTeam) {
            myTeam.budget += offerPrice;
        }
        player.teamId = 'sold_abroad';
        if (typeof window.removePlayerFromTactics === 'function') window.removePlayerFromTactics(player.id);
        alert(`${player.name}, ${clubName} kulübüne ${offerPrice} Milyon Euro karşılığında transfer oldu.`);
        overlay.remove();
        if(typeof updateBudgetUI === 'function') updateBudgetUI();
    };

    let btnNegotiate = document.createElement('button');
    btnNegotiate.className = 'menu-button';
    btnNegotiate.style.backgroundColor = '#f39c12';
    btnNegotiate.style.margin = '0';
    btnNegotiate.style.padding = '10px 20px';
    btnNegotiate.innerHTML = 'Pazarlık Yap';
    btnNegotiate.onclick = () => {
        btnContainer.innerHTML = "";
        
        let negoInput = document.createElement('input');
        negoInput.type = 'number';
        negoInput.min = '1';
        negoInput.value = offerPrice + 5;
        negoInput.style.padding = '10px';
        negoInput.style.borderRadius = '5px';
        negoInput.style.border = 'none';
        negoInput.style.width = '100px';
        negoInput.style.marginRight = '10px';
        negoInput.style.fontSize = '16px';
        
        let lbl = document.createElement('span');
        lbl.innerHTML = "Karşı Teklifiniz (M€): ";
        lbl.style.fontWeight = "bold";
        
        let btnSubmitNego = document.createElement('button');
        btnSubmitNego.className = 'menu-button';
        btnSubmitNego.style.backgroundColor = '#8e44ad';
        btnSubmitNego.style.margin = '0';
        btnSubmitNego.style.padding = '10px 20px';
        btnSubmitNego.innerHTML = 'Gönder';
        
        btnSubmitNego.onclick = () => {
            let requested = parseInt(negoInput.value) || 0;
            if (isNaN(requested) || requested < 1) {
                alert("Geçerli bir miktar girin.");
                return;
            }
            
            let ratio = requested / offerPrice;
            let successChance = 0;
            if (ratio <= 1.0) successChance = 1.0;
            else if (ratio <= 1.10) successChance = 0.80; // %10 artışa yüksek ihtimal
            else if (ratio <= 1.25) successChance = 0.40; // %25 artışa %40 ihtimal
            else if (ratio <= 1.50) successChance = 0.15; // %50 artışa düşük ihtimal
            else successChance = 0.05; // Aşırı yüksek
            
            // [YENİ] Anında sonuç yerine kuyruğa ekle
            window.pendingTransfers.push({
                type: 'incoming_negotiation',
                player: player,
                clubName: clubName,
                requestedPrice: requested,
                successChance: successChance,
                waitDays: Math.floor(Math.random() * 2) + 1 // 1-2 gün bekle
            });
            
            player.isPendingTransfer = true;
            alert(`Karşı teklifiniz (${requested} M€) iletildi. ${clubName} yönetimi durumu değerlendirip birkaç gün içinde haber verecek.`);
            overlay.remove();
        };
        
        btnContainer.appendChild(lbl);
        btnContainer.appendChild(negoInput);
        btnContainer.appendChild(btnSubmitNego);
    };

    let btnReject = document.createElement('button');
    btnReject.className = 'menu-button';
    btnReject.style.backgroundColor = '#c0392b';
    btnReject.style.margin = '0';
    btnReject.style.padding = '10px 20px';
    btnReject.innerHTML = 'Reddet';
    btnReject.onclick = () => {
        alert(`Teklifi reddettiniz. ${player.name} takımda kalıyor.`);
        overlay.remove();
    };

    btnContainer.appendChild(btnAccept);
    btnContainer.appendChild(btnNegotiate);
    btnContainer.appendChild(btnReject);
    modalBox.appendChild(title);
    modalBox.appendChild(text);
    modalBox.appendChild(btnContainer);
    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);
};

// --- BEKLEYEN TRANSFERLERİ SONUÇLANDIRMA ---
window.resolvePendingTransfers = function() {
    if (!window.pendingTransfers || window.pendingTransfers.length === 0) return;
    
    let reports = [];
    let remainingTransfers = [];
    
    window.pendingTransfers.forEach(task => {
        task.waitDays--;
        
        if (task.waitDays > 0) {
            remainingTransfers.push(task);
            return;
        }
        
        let p = task.player;
        p.isPendingTransfer = false; // Kilidi kaldır
        
        let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
        let myTeam = window.leagueData.teams.find(t => t.id === myTeamId);
        
        if (task.type === 'buy_player') {
            if (myTeam.budget >= task.price) {
                myTeam.budget -= task.price;
                p.teamId = task.teamId;
                p.contractYears = Math.floor(Math.random() * 3) + 2;

                if (!window.clubCultureProfile) {
                    window.clubCultureProfile = Math.random() < 0.5 ? "emektar_malzemeci" : "sosyal_medya_admini";
                }

                if (window.clubCultureProfile === 'sosyal_medya_admini') {
                    reports.push(`🔥 GECE YARISI OPERASYONU! Sosyal Medya Ekibimiz Hollywood fragmanlarını aratmayan bir video yayınladı: "Şehrin yeni sahibi ${p.name}!". Rakip takım taraftarları çıldırıyor, kendi taraftarımızın aidiyeti tavan yaptı!`);
                } else if (window.clubCultureProfile === 'emektar_malzemeci') {
                    reports.push(`👕 ${p.name} tesislere adımını atar atmaz Emektar Malzemecimiz onu karşıladı. Odasını gösterdi, ona şehri anlattı. Oyuncu kendisini 10 yıldır bu kulüpteymiş gibi güvende hissediyor.`);
                    p.loyalty = 100; // Emektar malzemeci aidiyeti fuller
                } else {
                    reports.push(`💰 BAŞARILI: ${p.name} için yapılan ${task.price} Milyon Euro'luk teklif kabul edildi. Oyuncu takımınıza katıldı!`);
                }
                
                // Kendi bomba transferimizi gazeteye düşürmek için bayrak koy
                if (p.power >= 75) {
                    window.myBigTransferEvent = p;
                }
            } else {
                reports.push(`❌ İPTAL EDİLDİ: ${p.name} transferi için bütçeniz yetersiz kaldı (${task.price} M€ gerekiyordu).`);
            }
        } 
        else if (task.type === 'incoming_negotiation') {
            if (Math.random() <= task.successChance) {
                myTeam.budget += task.requestedPrice;
                p.teamId = 'sold_abroad';
                reports.push(`💰 ANLAŞMA SAĞLANDI: ${task.clubName}, ${p.name} için talep ettiğiniz ${task.requestedPrice} Milyon Euro'yu ödemeyi kabul etti.`);
            } else {
                reports.push(`💥 GÖRÜŞMELER ÇÖKTÜ: ${task.clubName}, ${p.name} için istediğiniz rakamı çok buldu ve masadan kalktı.`);
            }
        }
    });
    
    window.pendingTransfers = remainingTransfers;
    if(typeof updateBudgetUI === 'function') updateBudgetUI();
    if(typeof saveGame === 'function') saveGame(true);
    
    // Raporları Event Queue'ya gönder
    if (reports.length > 0) {
        window.eventQueue = window.eventQueue || [];
        window.eventQueue.push({
            title: "Transfer Komitesi",
            message: reports.join("<br><br>")
        });
    }
};

// --- PAZARLIK MASASI (NEGOTIATION) SİSTEMİ ---
window.currentNegotiationPlayer = null;
window.currentNegotiationBasePrice = 0;
window.currentAgentDemand = 0;
window.currentAgentPatience = 3;

window.openNegotiation = function(player, basePrice) {
    if(typeof playSound === 'function' && typeof enterSound !== 'undefined') playSound(enterSound);
    
    let auth = window.managerAuthority || 50;
    let surcharge = 1.3 - (auth / 400); // Orijinal, daha insaflı seviye
    
    // YENİ: Oyuncu Sıralaması Analizi
    let teamPlayers = window.leagueData.players.filter(p => p.teamId === player.teamId).sort((a,b) => b.power - a.power);
    let playerIndex = teamPlayers.findIndex(p => p.id === player.id);
    let isStarter = playerIndex >= 0 && playerIndex < 11;
    let isUnwanted = player.isListed || playerIndex >= 16;
    
    // Eğer oyuncunun henüz atanmış kalıcı bir menajeri yoksa, bir defaya mahsus belirle
    if (!player.agentType) {
        let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
        let isFamilyAgent = !isSuperAgent && Math.random() < 0.25; 
        let isCorporateAgent = !isSuperAgent && !isFamilyAgent && Math.random() < 0.40; 
        let isScoutAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && (player.power < 75 || (player.age && player.age <= 21)) && Math.random() < 0.50;
        let isSuitcaseAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && !isScoutAgent && (player.teamId === 'free_agent' || player.power < 83) && Math.random() < 0.50;
        
        if (isSuperAgent) player.agentType = 'super';
        else if (isFamilyAgent) player.agentType = 'family';
        else if (isCorporateAgent) player.agentType = 'corporate';
        else if (isScoutAgent) player.agentType = 'scout';
        else if (isSuitcaseAgent) player.agentType = 'suitcase';
        else player.agentType = 'normal';
    }

    let isSuperAgent = player.agentType === 'super';
    let isFamilyAgent = player.agentType === 'family';
    let isCorporateAgent = player.agentType === 'corporate';
    let isScoutAgent = player.agentType === 'scout';
    let isSuitcaseAgent = player.agentType === 'suitcase';

    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;
    window.isCorporateAgentNegotiation = isCorporateAgent;
    window.isScoutAgentNegotiation = isScoutAgent;
    window.isSuitcaseAgentNegotiation = isSuitcaseAgent;

    let initialSpeech = "Oyuncumun kalitesi ortada. İstenen bonservis bedelini ödemezseniz masadan kalkarız.";
    window.currentAgentPatience = 3;

    if (isSuperAgent) {
        surcharge += 0.8; // Devasa komisyon
        window.currentAgentPatience = 2; // Kibirli ve sabırsız
        initialSpeech = "Süper Menajer (Küresel Güç): Benim oyuncum dünyanın en iyilerinden biri. Masada üç farklı Şampiyonlar Ligi devinin astronomik teklifi duruyor. İstediğim devasa komisyonu ve bonservisi hemen vermezseniz basınla konuşur, oyuncuyu size düşman ederim.";
        setTimeout(() => alert("📱 MEDYA SIZINTISI: Süper Menajer, görüşmeleri anında basına sızdırdı! Sosyal medyada fırtınalar kopuyor, oyuncunun piyasa değeri ve menajerin komisyon beklentisi bir gecede tavan yaptı!"), 500);
    } else {
        if (player.contractYears === 1 && player.teamId !== 'free_agent') {
            surcharge = 1.0; // Bosman: İstediği imza parası net
            window.currentAgentPatience = 3;
            initialSpeech = "Oyuncumun sözleşmesi bitiyor. Kulübüne bonservis ödemeyeceksiniz ancak bu transferin gerçekleşmesi için talep ettiğim İMZA PARASI tam olarak budur. Ciddiyseniz masadayız.";
        } else if (isStarter && player.teamId !== 'free_agent') {
            surcharge += 0.5; // Çok pahalı
            window.currentAgentPatience = 2; // Sabırsız
            initialSpeech = "O, kulübün en önemli parçalarından biri (İlk 11). Onu satmayı düşünmüyoruz ancak reddedemeyeceğimiz bir teklif yaparsanız konuşabiliriz.";
        } else if (isUnwanted && player.teamId !== 'free_agent') {
            surcharge -= 0.4; // Çok ucuz
            if (surcharge < 0.5) surcharge = 0.5;
            window.currentAgentPatience = 4; // Çok sabırlı
            initialSpeech = "Açıkçası oyuncu şu an kulüpte forma şansı bulamıyor ve mutsuz. Bizi bu maaş yükünden kurtarırsanız size her türlü kolaylığı sağlarız.";
        }
    }
    
    // Aile Menajeri (Üzerine yazar)
    if (isFamilyAgent) {
        let isSpouse = Math.random() < 0.3; // %30 Wanda Nara stili eş, %70 Baba
        let relationStr = isSpouse ? "eşime" : "oğluma";
        surcharge += (Math.random() * 0.3); // Fiyat etkisi abartılı değil, makul seviyede
        window.currentAgentPatience = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası son derece dengesiz sabır
        initialSpeech = "Aile Menajeri: Biz profesyonel tüccar değiliz, duygusal insanlarız... Ama duygularımızı ancak MİLYON EUROLAR tatmin edebilir! Benim " + relationStr + " Avrupa'nın her takımında oynar, onun hakkını yedirmem. Dolgun bir komisyon bekliyoruz, yoksa masaya dahi oturmayız!";
    }
    
    // Kurumsal Ajans (Üzerine yazar)
    if (isCorporateAgent) {
        window.currentAgentPatience = 3; // Duygusuz ve stabil sabır
        initialSpeech = "Kurumsal Ajans (CAA Stellar / Roc Nation): Merhabalar. PR departmanımızın raporlarına göre müşterimizin marka değeri son çeyrekte %40 büyüdü. Masaya getireceğiniz teklifin sadece sportif değil, oyuncunun imaj haklarına ve global yatırım stratejilerimize uygun olmasını bekliyoruz.";
    }
    
    // Bölgesel Keşif Menajeri
    if (isScoutAgent) {
        window.currentAgentPatience = 4; // Çok sabırlı, çocuğun oynamasını istiyor
        surcharge -= 0.3; // Çok insaflı, ucuz
        if (surcharge < 0.3) surcharge = 0.3;
        initialSpeech = "Keşif Menajeri: Bu çocuğu favelalardan/tozlu sahalardan ben çekip çıkardım, o benim öz evladım gibidir. Onun Avrupa'ya uyum sağlaması, evi ve dil eğitimi için de size bizzat yardımcı olacağım. Yeter ki onun potansiyeline inanın ve bu formayı ona verin.";
    }
    
    // Çantacı Menajer
    if (isSuitcaseAgent) {
        window.currentAgentPatience = 2; // Sabırsız, çabuk komisyon peşinde
        surcharge += 0.4; // Komisyon kilitli
        initialSpeech = "Çantacı Menajer (Komisyoncu): Başkanım selamlar! Aradığınız oyuncuyu buldum. Tam sizin sisteme göre, tecrübesi yeter. Ufak bir imza parası ve benim komisyonumu halledersek çocuğu yarın idmana çıkartırım. Biliyorsunuz aramızda lafı olmaz, çayınızı içmeye geldim.";
    }

    let initialDemand = Math.floor(basePrice * surcharge);
    
    // [YENİ] Serbest Oyuncu (Free Agent) Kaprisi
    if (player.teamId === 'free_agent') {
        initialDemand = Math.floor(initialDemand * 1.30); // Bonservis yok, o yüzden maaş/imza parası %30 fazla!
        initialSpeech = "Serbest Statü Oyuncusu / Menajeri: Bonservisim elimde, kulübüm yok. O yüzden bana ödemeniz gereken tek şey devasa bir imza parası. Rakam aşağıdadır, kabul ediyorsanız hemen imzalayalım.";
    }
    
    window.currentNegotiationPlayer = player;
    window.currentNegotiationBasePrice = basePrice;
    window.currentAgentDemand = initialDemand;
    
    updateNegotiationUI(initialSpeech);
    document.getElementById('negotiation-modal').style.display = 'flex'; if(document.getElementById('negotiation-modal')) { let title = document.getElementById('negotiation-modal').querySelector('h1, h2'); if(title) title.focus(); else document.getElementById('negotiation-modal').focus(); };
};

function updateNegotiationUI(speechText) {
    document.getElementById('neg-agent-speech').innerText = '"' + speechText + '"';
    document.getElementById('neg-agent-demand').innerText = window.currentAgentDemand.toLocaleString() + " €";
    
    let patienceText = "";
    if (window.currentAgentPatience >= 3) patienceText = "Kusursuz (⭐⭐⭐)";
    else if (window.currentAgentPatience === 2) patienceText = "Gergin (⭐⭐)";
    else patienceText = "Kopmak Üzere (⭐)";
    
    document.getElementById('neg-agent-patience').innerText = patienceText;
    document.getElementById('neg-offer-input').value = "";
    
    // Sesli okuma (Erişilebilirlik ve Karakter Rol Yapma)
    if(typeof speak === 'function') {
        speak(speechText);
    }
}

document.getElementById('btn-neg-submit')?.addEventListener('click', () => {
    let offer = parseInt(document.getElementById('neg-offer-input').value) || 0;
    if (isNaN(offer)) offer = 0;
    if (!offer || offer <= 0) return alert("Geçerli bir teklif girin.");
    
    let base = window.currentNegotiationBasePrice;
    let demand = window.currentAgentDemand;
    
    // Yeterli Para Kontrolü
    let myTeam = window.leagueData.teams.find(t => t.id === (window.league ? window.league.userTeamId : 'galatasaray'));
    if (offer > myTeam.budget) {
        return alert("Bütçenizi aşan bir teklif yapamazsınız!");
    }
    
    if (offer >= demand) {
        // Doğrudan kabul etti sayılır
        finishNegotiation(true, offer);
        return;
    }
    
    // Ölücü Teklif (Değerinin çok altı)
    if (offer < base * 0.7) {
        let msg = "Menajer: 'Bu bir hakaret! Bizimle dalga mı geçiyorsunuz?' diyerek masayı terk etti.";
        if (window.isSuperAgentNegotiation) {
            msg = "Süper Menajer: 'Benim gibi küresel bir figürle dalga mı geçiyorsunuz?!' diyerek masayı devirdi ve gazetecileri arayıp kulübünüzü medyada rezil etti.";
        } else if (window.isFamilyAgentNegotiation) {
            msg = "Aile Menajeri: 'Benim evladıma/eşime bu sadakayı mı layık görüyorsunuz? Sizin gibi vefasız, kalpsiz insanlarla işimiz olmaz!' diyerek ağlamaklı bir öfkeyle odayı terk etti.";
        } else if (window.isCorporateAgentNegotiation) {
            msg = "Kurumsal Ajans: 'Şirketimizin algoritmaları bu rakamın müşterimizin global marka algısını düşüreceğini saptadı. Finans departmanımız görüşmeleri tek taraflı olarak feshetmiştir.'";
        } else if (window.isScoutAgentNegotiation) {
            msg = "Keşif Menajeri: 'Benim çocuğum bu paralara oynamayı hak etmiyor. Biz yine tozlu sahalara dönüyoruz, ama bir gün Avrupa onu konuşacak!' diyerek masadan kalktı.";
        } else if (window.isSuitcaseAgentNegotiation) {
            msg = "Çantacı Menajer: 'Başkanım ayıp ediyorsunuz, bu paralara amatör kümede oynatmazlar adamı. Neyse kısmet değilmiş...' diyerek çantayı alıp çıktı.";
        }
        alert(msg);
        if(typeof speak === 'function') speak(msg);
        finishNegotiation(false);
        return;
    }
    
    // Orta halli teklif
    window.currentAgentPatience--;
    if (window.currentAgentPatience <= 0) {
        let msg = "Menajer: 'Anlaşamayacağımız belli oldu, iyi günler.' diyerek masayı terk etti.";
        if (window.isSuperAgentNegotiation) {
            msg = "Süper Menajer: 'Benim vaktimi böyle amatörce harcayamazsınız. Oyuncumu rakip takıma pazarlamaya gidiyorum!' diyerek kapıyı çarpıp çıktı.";
        } else if (window.isFamilyAgentNegotiation) {
            msg = "Aile Menajeri: 'Ailemiz bu teklife çok kırıldı. Bizim duygularımızı anlamadığınızı görüyorum. Anlaşamayacağız...'";
        } else if (window.isCorporateAgentNegotiation) {
            msg = "Kurumsal Ajans: 'Maalesef hukuk ve risk departmanımız teklif şartlarınızı şirket stratejilerimize uygun bulmadı. Toplantı bitmiştir, iyi günler dileriz.'";
        } else if (window.isScoutAgentNegotiation) {
            msg = "Keşif Menajeri: 'Sanırım bizim hayallerimiz sizin kulübünüze büyük geldi. Şans vermediğiniz için teşekkürler...'";
        } else if (window.isSuitcaseAgentNegotiation) {
            msg = "Çantacı Menajer: 'Başkanım başka kulüpten daha iyi teklif vardı sırf dostluğumuz için size geldim. Anlaşamıyorsak uzatmaya gerek yok.'";
        }
        alert(msg);
        if(typeof speak === 'function') speak(msg);
        finishNegotiation(false);
        return;
    }
    
    // Yeni fiyat belirle (Orta yolu bulma)
    let difference = demand - offer;
    let discount = Math.floor(difference * 0.4); // Aradaki farkın %40'ı kadar iner
    window.currentAgentDemand -= discount;
    
    let midMsg = "Teklifiniz çok düşük, ancak biraz daha inebiliriz. Yeni fiyatımız budur.";
    if (window.isFamilyAgentNegotiation) midMsg = "Açıkçası evladımın/eşimin değeri bu değil... Ama madem bu kadar ısrar ediyorsunuz, hatırınız için biraz daha fedakarlık yapacağız.";
    if (window.isSuperAgentNegotiation) midMsg = "Normalde 1 kuruş inmem ama projenize inandığım için şimdilik ufak bir indirim yapıyorum. Şansınızı zorlamayın.";
    if (window.isCorporateAgentNegotiation) midMsg = "Hukuk departmanımızla görüştük. Sözleşmeye bazı ekstra imaj ve reklam hakları maddeleri ekleyerek fiyatı bu seviyeye çekebiliriz.";
    if (window.isScoutAgentNegotiation) midMsg = "Para bizim için ikinci planda, önemli olan çocuğun kariyeri. Tamam, biraz daha iniyorum. Yeter ki anlaşalım.";
    if (window.isSuitcaseAgentNegotiation) midMsg = "Başkanım sırf aramızdaki dostluk hatırına komisyondan feragat ediyorum. Yeni rakam budur, el sıkışalım Bitsin bu iş.";
    updateNegotiationUI(midMsg);
});

document.getElementById('btn-neg-accept')?.addEventListener('click', () => {
    let myTeam = window.leagueData.teams.find(t => t.id === (window.league ? window.league.userTeamId : 'galatasaray'));
    if (myTeam.budget < window.currentAgentDemand) {
        return alert("Bu talebi karşılayacak bütçeniz yok!");
    }
    finishNegotiation(true, window.currentAgentDemand);
});

document.getElementById('btn-neg-withdraw')?.addEventListener('click', () => {
    finishNegotiation(false, null, true); // İsteğe bağlı çekilme (başarısız sayılmaz, tekrar denenebilir)
});

function finishNegotiation(isSuccess, finalPrice, isVoluntary = false) {
    if(document.getElementById('negotiation-modal')) if(document.getElementById('negotiation-modal')) document.getElementById('negotiation-modal').style.display = 'none';
    
    if (isSuccess) {
        // Küresel Duyumcu (Fabrizio Romano Stili) Olayı
        // Eğer yıldız bir oyuncuysa veya rastgele şans (%40) tutarsa resmi açıklamadan önce duyumcu patlatır.
        if (window.currentNegotiationPlayer.power >= 78 && Math.random() < 0.5) {
            let myTeamName = window.league ? window.league.userTeamId.toUpperCase() : window.myTeamId.toUpperCase();
            let msg = `🚨 TRANSFER İSTİHBARATI (Küresel Duyumcu) 🚨\n\n📱 [X] @GlobalInsider:\n"${window.currentNegotiationPlayer.name} to ${myTeamName}... İMZALAR ATILDI! ⌛️🤝\n\nAz önce menajerleriyle Whatsapp üzerinden teyit ettim. Taraflar el sıkıştı, belgeler az önce imzalandı. Resmi açıklama yakında. Bitti bu iş!"`;
            alert(msg);
        }
        // Satın alma işlemini tamamla
        buyPlayer(window.currentNegotiationPlayer, finalPrice);
    } else {
        if (!isVoluntary) {
            // Görüşme Çökerse Duyumcu Sızdırması
            if (window.currentNegotiationPlayer.power >= 82 && Math.random() < 0.5) {
                let myTeamName = window.league ? window.league.userTeamId.toUpperCase() : window.myTeamId.toUpperCase();
                let msg = `🚨 ÖZEL HABER (Küresel Duyumcu) 🚨\n\n📱 [X] @GlobalInsider:\n"ÖZEL BİLGİ: ${window.currentNegotiationPlayer.name} - ${myTeamName} görüşmeleri ÇÖKTÜ! ❌ Menajerler masadan sinirle kalktı. Anlaşma an itibarıyla tamamen iptal edildi."`;
                alert(msg);
            }
            window.currentNegotiationPlayer.negotiationFailed = true;
        }
        // UI'ı yenile ki buton kilitlensin
        if(typeof renderTransferPlayers === 'function') {
            let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
            renderTransferPlayers(myTeamId);
        }
    }
    window.currentNegotiationPlayer = null;
}

// YABANCI KÜRESEL TRANSFER MOTORU (BOT AI) - AKILLI SİSTEM
window.simulateBotTransfers = function() {
    if (!window.leagueData || !window.leagueData.teams || !window.leagueData.players) return;
    
    let isTransferSeason = ((window.currentWeek <= 3) || (window.currentWeek >= 17 && window.currentWeek <= 19) || window.isPreSeason);
    if (!isTransferSeason) return; // Sadece transfer sezonunda transfer yapılır

    // BUG FİX: Bütçeler milyon bazındadır, 30.000.000 yerine 10 (milyon) aranmalı!
    let richBots = window.leagueData.teams.filter(t => t.id !== window.myTeamId && t.budget >= 10);
    if (richBots.length === 0) return;

    // Her hafta en fazla 1-3 transfer olsun
    let transferCount = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası

    // Satılık olan veya serbest oyuncular
    let availablePlayers = window.leagueData.players.filter(p => p.teamId !== window.myTeamId && (p.isListed || p.teamId === 'free_agent'));

    for (let i = 0; i < transferCount; i++) {
        if (richBots.length === 0 || availablePlayers.length === 0) break;
        
        let buyerIdx = Math.floor(Math.random() * richBots.length);
        let buyer = richBots[buyerIdx];

        // AKILLI HEDEFLEME: Alıcı takımın hangi mevkiye ihtiyacı var?
        let buyerSquad = window.leagueData.players.filter(p => p.teamId === buyer.id);
        
        let posCounts = { KL: 0, DF: 0, OS: 0, FV: 0 };
        buyerSquad.forEach(p => {
            if (["Kaleci", "KL", "GK"].includes(p.position)) posCounts.KL++;
            else if (["Stoper", "Sağ Bek", "Sol Bek", "Merkez Bek", "Bek", "DF"].includes(p.position)) posCounts.DF++;
            else if (["Ön Libero", "Merkez Orta Saha", "Orta Saha", "Forvet Arkası", "Maestro", "OS"].includes(p.position)) posCounts.OS++;
            else if (["Forvet", "Sağ Kanat", "Sol Kanat", "Sol Forvet", "Sağ Forvet", "Santrafor", "Santrfor", "FV"].includes(p.position)) posCounts.FV++;
        });

        // En çok ihtiyaç duyulan mevkiyi bul
        let neededPosGroup = "OS"; // Varsayılan
        let minDepth = 99;
        if (posCounts.KL < 2 && posCounts.KL < minDepth) { neededPosGroup = "KL"; minDepth = posCounts.KL; }
        if (posCounts.DF < 6 && posCounts.DF < minDepth) { neededPosGroup = "DF"; minDepth = posCounts.DF; }
        if (posCounts.OS < 5 && posCounts.OS < minDepth) { neededPosGroup = "OS"; minDepth = posCounts.OS; }
        if (posCounts.FV < 4 && posCounts.FV < minDepth) { neededPosGroup = "FV"; minDepth = posCounts.FV; }

        let targets = availablePlayers.filter(p => {
            if (p.teamId === buyer.id) return false;
            let pGroup = "OS";
            if (["Kaleci", "KL", "GK"].includes(p.position)) pGroup = "KL";
            else if (["Stoper", "Sağ Bek", "Sol Bek", "Merkez Bek", "Bek", "DF"].includes(p.position)) pGroup = "DF";
            else if (["Forvet", "Sağ Kanat", "Sol Kanat", "Sol Forvet", "Sağ Forvet", "Santrafor", "Santrfor", "FV"].includes(p.position)) pGroup = "FV";
            
            // Eğer takımın çok eksiği olan bir bölge varsa oradan adam arasın
            if (minDepth < 99) return pGroup === neededPosGroup;
            return true; // Eksiği yoksa rastgele satılık
        });

        if (targets.length === 0) continue;
        
        // Kendi bütçesine uyan ve takıma değer katacak (Güç > 65) birini seç
        targets = targets.filter(p => calculatePrice(p) <= buyer.budget && p.power >= 65);
        if (targets.length === 0) continue;

        let targetPlayer = targets[Math.floor(Math.random() * targets.length)];
        let actualFee = calculatePrice(targetPlayer);
        
        if (buyer.budget >= actualFee) {
            let sellerTeam = window.leagueData.teams.find(t => t.id === targetPlayer.teamId);
            
            if (sellerTeam) {
                let sellerPlayers = window.leagueData.players.filter(p => p.teamId === sellerTeam.id);
                // Eğer takımın 18'den az oyuncusu kalacaksa transferi iptal et (Motor çökmesini engeller)
                if (sellerPlayers.length <= 18) continue;
                
                // Eğer satılan oyuncu kaleciyse ve takımda başka kaleci yoksa iptal et
                if (targetPlayer.position === 'Kaleci' || targetPlayer.position === 'GK') {
                    let sellerGKs = sellerPlayers.filter(p => p.position === 'Kaleci' || p.position === 'GK');
                    if (sellerGKs.length <= 1) continue;
                }
            }
            
            buyer.budget -= actualFee;
            if (sellerTeam) sellerTeam.budget = (sellerTeam.budget || 0) + actualFee;
            
            let oldTeamName = sellerTeam ? sellerTeam.name : "Serbest Statü";
            targetPlayer.teamId = buyer.id;
            targetPlayer.isListed = false; // Transfer oldu, satılıktan çıkar
            
            let newsText = `🔴 SON DAKİKA KÜRESEL TRANSFER: ${buyer.name}, ${oldTeamName} takımından ${targetPlayer.name} ile ${actualFee} Milyon € karşılığında anlaştı! KAP'a bildirildi.`;
            
            if (window.dailyNewsPool) {
                window.dailyNewsPool.unshift(newsText);
            }
            
            availablePlayers = availablePlayers.filter(p => p.id !== targetPlayer.id);
        }
    }
};

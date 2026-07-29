// squad.js - Takım Kadrosu ve Satış Sistemi

let playerToTransfer = null;

function loadSquadScreen() {
    let list = document.getElementById('squad-list');
    list.innerHTML = "";
    
    if (!window.myTeam) return;

    let squadPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeam.id);
    
    // Güce göre sırala
    squadPlayers.sort((a, b) => b.power - a.power);
    
    squadPlayers.forEach(p => {
        let li = document.createElement('li');
        li.style.marginBottom = "10px";
        li.style.display = "flex"; if(li) { let title = li.querySelector('h1, h2'); if(title) title.focus(); else li.focus(); };
        li.style.gap = "10px";
        
        let btn = document.createElement('button');
        btn.className = "menu-button";
        btn.style.flex = "1";
        btn.style.textAlign = "left";
        btn.style.margin = "0";
        
        let status = "";
        let ariaStatus = "";
        if (p.isReserves) {
            status = " [KADRO DIŞI]";
            ariaStatus = "Bu oyuncu şu an kadro dışı bırakılmış ve A takımdan uzaklaştırılmıştır.";
            btn.style.backgroundColor = "#7f8c8d"; // Gri
        } else if (p.isListed) {
            status = " [SATILIK]";
            ariaStatus = "Bu oyuncu şu an transfer listesinde satılık.";
            btn.style.backgroundColor = "#c0392b"; // Kırmızımsı
        } else {
            btn.style.backgroundColor = "#2c3e50";
        }
        
        
        if (p.condition === undefined) p.condition = 100;
        if (p.injuredWeeks === undefined) p.injuredWeeks = 0;
        if (p.yellowCards === undefined) p.yellowCards = 0;
        if (p.redCardWeeks === undefined) p.redCardWeeks = 0;
        if (p.loyalty === undefined) p.loyalty = 50; // Bağlılık sistemi varsayılan 50
        if (p.morale === undefined) p.morale = 75; // Yeni Moral sistemi
        
        let injuryText = p.injuredWeeks > 0 ? (p.injuryType ? ` [Sakat - ${p.injuryType} (${p.injuredWeeks} Hafta)]` : ` [Sakat ${p.injuredWeeks} Hafta]`) : "";
        let redText = p.redCardWeeks > 0 ? ` [🟥 Cezalı (${p.redCardWeeks} Maç)]` : "";
        let yellowText = p.yellowCards > 0 ? ` [` + "🟨".repeat(p.yellowCards) + `]` : "";
        
        let condColor = p.condition > 70 ? "green" : (p.condition > 40 ? "orange" : "red");
        let moraleColor = p.morale > 70 ? "#3498db" : (p.morale > 40 ? "#7f8c8d" : "#e74c3c");
        let moraleText = p.morale > 84 ? "Mükemmel" : (p.morale > 59 ? "İyi" : (p.morale > 39 ? "Normal" : (p.morale > 19 ? "Kötü" : "Berbat")));
        
        let natFlag = (p.nationality && window.nationalities && window.nationalities[p.nationality]) ? window.nationalities[p.nationality].flag : "🏳️";
        let natText = p.isNationalPlayer ? ` [${natFlag} Milli Takım]` : ` ${natFlag}`;
        
        const mentalIcons = { "elite": "🧠 Lider", "aggressive": "⚔️ Agresif", "fragile": "🩹 Hassas" };
        const roleIcons = {
            "inside_forward": "⚡ Kat Eden", "poacher": "🎯 Fırsatçı", "target_man": "🗼 Pivot",
            "playmaker": "🎩 Oyun Kurucu", "maestro": "🎻 Şef", "box_to_box": "🏃 Dinamo",
            "anchor": "⚓ Çapa", "stopper": "🧱 Duvar", "sweeper": "🧹 Süpürücü",
            "classic": "🛡️ Klasik", "sweeper_keeper": "🦅 Uçan Kaleci", "false_9": "👻 Sahte 9", "regista": "🎯 Regista"
        };
        let mentalStr = mentalIcons[p.mentalTrait] || "👤 Standart";
        let roleStr = roleIcons[p.tacticalRole] || "⚽ Genel";

        btn.innerHTML = `<strong>${p.name}</strong>${natText} - ${p.position} | <small style="color:#f1c40f; font-style:italic;">${roleStr} | ${mentalStr}</small><br>
                         (Güç: ${p.power}, Kond: <span style='color:${condColor}'>%${p.condition}</span>, Moral: <span style='color:${moraleColor}'>${moraleText}</span>)${injuryText}${redText}${yellowText}${status}`;
    
        btn.setAttribute('aria-label', `${p.name}. Rol: ${roleStr}. Karakter: ${mentalStr}. Ülke: ${natFlag}. Mevki: ${p.position}. Güç: ${p.power}. Kondisyon: Yüzde ${p.condition}. Moral: ${moraleText}. ${ariaStatus} Detaylar için tıklayın.`);
        
        btn.onclick = () => showPlayerProfile(p);
        
        li.appendChild(btn);
        list.appendChild(li);
    });
    
    if(typeof speak === 'function') speak("Takım kadrosu açıldı. Bir oyuncuyu transfer listesine eklemek için üzerine tıklayabilirsiniz.");
    setTimeout(() => {
        if(list.firstChild) list.firstChild.firstChild.focus();
    }, 100);
}

function openTransferModal(player) {
    if (player.isListed) {
        if(typeof speak === 'function') speak(`${player.name} zaten transfer listesinde.`);
        return;
    }
    
    playerToTransfer = player;
    document.getElementById('transfer-confirm-modal').style.display = 'flex'; if(document.getElementById('transfer-confirm-modal')) { let title = document.getElementById('transfer-confirm-modal').querySelector('h1, h2'); if(title) title.focus(); else document.getElementById('transfer-confirm-modal').focus(); };
    
    let msg = `${player.name} isimli oyuncuyu transfer listesine koymak istediğinize emin misiniz?`;
    document.getElementById('transfer-confirm-text').textContent = msg;
    
    if(typeof speak === 'function') speak(msg + " Evet veya Hayır butonunu seçin.");
    
    setTimeout(() => {
        document.getElementById('btn-confirm-transfer').focus();
    }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
    let btnBackSquad = document.getElementById('btn-back-squad');
    if (btnBackSquad) {
        btnBackSquad.addEventListener('click', () => {
            // Ekranda açık container'ı bul gizle
            document.querySelectorAll('.menu-container').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            let mm = document.getElementById('main-menu-container');
            if (mm) {
                mm.style.display = 'block';
                setTimeout(() => mm.classList.add('active'), 10);
                if(typeof speak === 'function') speak("Ana menü");
            }
        });
    }
    
    let btnConfirmTransfer = document.getElementById('btn-confirm-transfer');
    if (btnConfirmTransfer) {
        btnConfirmTransfer.addEventListener('click', () => {
            if (playerToTransfer) {
                playerToTransfer.isListed = true;
                
                // Eğer transfer.js içinde calculatePrice varsa onu kullan, yoksa tahmini
                if(typeof calculatePrice === 'function') {
                    playerToTransfer.price = calculatePrice(playerToTransfer);
                } else {
                    playerToTransfer.price = Math.round((playerToTransfer.power * 2 + playerToTransfer.speed) / 5);
                }
                
                if(typeof speak === 'function') speak(`${playerToTransfer.name} başarıyla transfer listesine eklendi.`);
                
                if(document.getElementById('transfer-confirm-modal')) if(document.getElementById('transfer-confirm-modal')) document.getElementById('transfer-confirm-modal').style.display = 'none';
                loadSquadScreen(); // Ekranı güncelle ve odağı ilk oyuncuya ver
            }
        });
    }
    
    let btnCancelTransfer = document.getElementById('btn-cancel-transfer');
    if (btnCancelTransfer) {
        btnCancelTransfer.addEventListener('click', () => {
            playerToTransfer = null;
            if(document.getElementById('transfer-confirm-modal')) document.getElementById('transfer-confirm-modal').style.display = 'none';
            if(typeof speak === 'function') speak("İşlem iptal edildi.");
            loadSquadScreen();
        });
    }
});


// --- SAKATLIK VE KONDİSYON MOTORU (SQUAD ENGINE) ---
window.squadEngine = {
    processMatch: function(playedIds) {
        let myTeamId = window.league ? window.league.userTeamId : "galatasaray";
        let myRoster = window.leagueData.players.filter(p => p.teamId === myTeamId);
        let myTeam = window.leagueData.teams.find(t => t.id === myTeamId);
        
        let medLvl = myTeam && myTeam.medicalLevel ? myTeam.medicalLevel : 1;
        let medRecoveryBoost = (medLvl === 4) ? 25 : (medLvl === 3) ? 15 : (medLvl === 2) ? 5 : 0;
        let medInjuryReduction = (medLvl === 4) ? 0.40 : (medLvl === 3) ? 0.25 : (medLvl === 2) ? 0.10 : 0;
        
        let tLvl = myTeam && myTeam.trainingLevel ? myTeam.trainingLevel : 1;
        let trainConditionRetention = (tLvl === 4) ? 5 : (tLvl === 3) ? 2 : 0;
        let trainInjuryReduction = (tLvl === 4) ? 0.15 : (tLvl === 3) ? 0.05 : 0;
        
        let pLvl = myTeam && myTeam.pitchLevel ? myTeam.pitchLevel : 1;
        let pitchInjuryRiskMod = (pLvl === 4) ? 0.80 : (pLvl === 3) ? 0.90 : (pLvl === 2) ? 1.00 : 1.20;
        
        let newInjuries = [];
        
        myRoster.forEach(p => {
            // Initialize if not present
            if (p.condition === undefined) p.condition = 100;
            if (p.injuredWeeks === undefined) p.injuredWeeks = 0;
            if (p.yellowCards === undefined) p.yellowCards = 0;
            if (p.redCardWeeks === undefined) p.redCardWeeks = 0;
            if (p.consecutiveMatchesPlayed === undefined) p.consecutiveMatchesPlayed = 0;
            if (p.injuryHistory === undefined) p.injuryHistory = [];
            
            if (p.redCardWeeks > 0 && !playedIds.includes(p.id)) {
                p.redCardWeeks--;
            }
            if (p.injuredWeeks > 0) {
                p.injuredWeeks--;
                p.consecutiveMatchesPlayed = 0;
                p.condition += (10 + medRecoveryBoost); // Cryotherapy boost
                if (p.condition > 100) p.condition = 100;
                
                // YENİ: Sahaya Dönüş (RTP - AlterG, Kum Havuzu)
                if (p.injuredWeeks === 0) {
                    if (p.injuryHistory && p.injuryHistory.length > 0) {
                        let lastInj = p.injuryHistory[p.injuryHistory.length - 1];
                        if (lastInj.weeks >= 4) {
                            let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
                            let tLvl = myTeam && myTeam.trainingLevel ? myTeam.trainingLevel : 1;
                            let mLvl = myTeam && myTeam.medicalLevel ? myTeam.medicalLevel : 1;
                            
                            // Tesis seviyesine göre kas kaybını engelleme şansı (Seviye 1: %25, Seviye 4: %100)
                            let avgLvl = Math.max(tLvl, mLvl); // En iyi tesise göre şans
                            let protectionChance = avgLvl * 0.25; 
                            
                            if (Math.random() < protectionChance) {
                                console.log(`${p.name} ağır sakatlıktan gücünü koruyarak döndü! (Tesis: Lvl ${avgLvl})`);
                            } else {
                                let powerDrop = (p.age >= 30) ? 2 : 1;
                                p.power -= powerDrop;
                                console.log(`${p.name} ağır sakatlıktan döndü ama kas kaybından dolayı gücü ${powerDrop} düştü.`);
                            }
                        }
                    }
                }
                return;
            }
            
            if (!playedIds.includes(p.id)) {
                p.consecutiveMatchesPlayed = 0;
                
                // YAŞA BAĞLI TOPARLANMA (Recovery)
                let baseRecover = 25;
                if (p.age <= 22) baseRecover = 35;
                else if (p.age >= 34) baseRecover = 15;
                
                p.condition += (baseRecover + medRecoveryBoost); // Tesis destekli aktif dinlenme
                if (p.condition > 100) p.condition = 100;
                return;
            }
            
            if (playedIds.includes(p.id)) {
                // Played the match
                p.consecutiveMatchesPlayed++; // İş yükü artar (Red Zone)
                
                // YAŞA BAĞLI YORULMA (Fatigue)
                let drop = 0;
                if (p.age <= 22) {
                    drop = Math.floor(Math.random() * 8) + 5; // 5 - 12 drop
                } else if (p.age <= 28) {
                    drop = Math.floor(Math.random() * 9) + 10; // 10 - 18 drop
                } else if (p.age <= 33) {
                    drop = Math.floor(Math.random() * 11) + 15; // 15 - 25 drop
                } else {
                    drop = Math.floor(Math.random() * 14) + 22; // 22 - 35 drop
                }
                
                if (p.mentalTrait === 'elite') drop = Math.max(5, drop - 3); // Elit oyuncular daha az yorulur
                
                // --- ANTRENMAN TESİSİ MİKRO-KAZANIMI (GPS & Fitness) ---
                drop -= trainConditionRetention;
                
                p.condition -= drop;
                if (p.condition < 0) p.condition = 0;
                
                // [YENİ] Reyting Hesaplama (1.0 - 10.0)
                let baseRating = 6.0;
                let condBonus = (p.condition - 50) / 50; // -1 to 1
                let powerBonus = (p.power - 60) / 40; // -0.5 to 1
                let randomFactor = (Math.random() * 3) - 1.5; // -1.5 to +1.5
                
                let finalRating = baseRating + condBonus + powerBonus + randomFactor;
                if (finalRating > 10.0) finalRating = 10.0;
                if (finalRating < 1.0) finalRating = 1.0;
                
                p.lastMatchRating = finalRating.toFixed(1);
                
                // KAHRAMANLIK MEKANİZMASI (Kariyer Mimarı)
                // Orijinal condition'a (maç öncesi) drop ekleyerek bakarız
                let preMatchCondition = p.condition + drop;
                if (preMatchCondition >= 85 && finalRating >= 8.0) {
                    if (Math.random() < 0.05) { // %5 Şansla form tutar
                        p.power = Math.min(100, (p.power || 50) + 1);
                        p.morale = Math.min(100, (p.morale || 75) + 10);
                        if (!p.heroicMatches) p.heroicMatches = 0;
                        p.heroicMatches++;
                        console.log(p.name + " mükemmel yönetildiği için kalıcı form kazandı!");
                    }
                }
                
                // --- YENİ U-ŞEKLİNDE SAKATLIK MOTORU (Biyolojik Yaş ve Kondisyon) ---
                let baseInjuryRisk = 0.005; // Varsayılan (yarıya düşürüldü)
                let conditionPenalty = 0;
                
                if (p.age <= 21) {
                    // Gençlik ateşi ve tecrübesizlik
                    baseInjuryRisk = 0.015;
                    if (p.condition < 70) conditionPenalty = 0.02;
                    if (p.condition < 50) conditionPenalty = 0.05;
                    if (p.condition < 30) conditionPenalty = 0.12;
                } 
                else if (p.age >= 22 && p.age <= 28) {
                    // Prime Dönem
                    baseInjuryRisk = 0.005;
                    if (p.condition < 70) conditionPenalty = 0.01;
                    if (p.condition < 50) conditionPenalty = 0.04;
                    if (p.condition < 30) conditionPenalty = 0.12;
                }
                else if (p.age >= 29 && p.age <= 33) {
                    // Yıpranma ve Elastikiyet Kaybı
                    baseInjuryRisk = 0.015;
                    if (p.condition < 70) conditionPenalty = 0.03;
                    if (p.condition < 50) conditionPenalty = 0.09;
                    if (p.condition < 30) conditionPenalty = 0.22;
                }
                else {
                    // 34+ Emeklilik Arefesi
                    baseInjuryRisk = 0.025;
                    if (p.condition < 70) conditionPenalty = 0.05;
                    if (p.condition < 50) conditionPenalty = 0.15;
                    if (p.condition < 30) conditionPenalty = 0.32;
                }
                
                let injuryRisk = baseInjuryRisk + conditionPenalty;

                // 1. İŞ YÜKÜ (Red Zone)
                if (p.consecutiveMatchesPlayed >= 3) {
                    injuryRisk *= 1.50; // %50 Artış
                }

                // 2. GEÇMİŞ SAKATLIK HİKAYESİ (Skar Dokusu)
                if (p.injuryHistory && p.injuryHistory.length > 0) {
                    injuryRisk *= 1.20; // %20 Artış
                }

                // 3. BİYOMEKANİK KUSUR (Asimetri)
                let asymmetry = Math.abs((p.speed * 20) - p.power);
                if (asymmetry > 30) {
                    injuryRisk *= 1.15; // Dengesiz vücut %15 daha riskli
                }

                // 4. PSİKOLOJİK STRES (Düşük Moral = Kas Gerginliği)
                if (p.morale < 40) {
                    injuryRisk *= 1.15; // %15 Artış
                }

                // 5. ZEMİN VE HAVA (Saha Şartları)
                if (window.currentWeather === 'rainy' || window.currentWeather === 'snowy') {
                    injuryRisk *= 1.25; // Kaygan zemin %25 Artış
                }
                
                // --- TESİS FAYDASI (Medical Facility & Training Prehab) ---
                injuryRisk *= (1 - medInjuryReduction); 
                injuryRisk *= (1 - trainInjuryReduction); // İzokinetik testler ve Prehab katkısı
                
                // [YENİ] SAHA ZEMİNİ ETKİSİ
                injuryRisk *= pitchInjuryRiskMod;
                
                // Karakter Çarpanı
                if (p.mentalTrait === 'fragile') {
                    injuryRisk *= 1.30; // Kırılgan oyuncular %30 daha fazla risk taşır
                } else if (p.mentalTrait === 'agresif' || p.mentalTrait === 'aggressive') {
                    injuryRisk *= 1.15; // Agresif oyuncular kontrolsüz girdikleri için riski artırır
                }
                
                // --- KART SİMÜLASYONU ---
                let cardRisk = 0.05; // Base 5% chance
                if (p.position === 'Stoper' || p.position === 'Defansif Orta Saha') cardRisk += 0.08;
                if (p.mentalTrait === 'agresif') cardRisk += 0.15;
                if (p.condition < 40) cardRisk += 0.10; // Yorgun oyuncu geç müdahale eder
                
                if (Math.random() < cardRisk) {
                    // Sarı mı Kırmızı mı?
                    if (Math.random() < 0.05 || (p.mentalTrait === 'agresif' && Math.random() < 0.1)) {
                        // Kırmızı Kart!
                        p.redCardWeeks = Math.random() < 0.3 ? 2 : 1; // 1 veya 2 maç ceza
                        if (!window.newRedCards) window.newRedCards = [];
                        window.newRedCards.push(p);
                        p.lastMatchRating = "3.0"; // Kırmızı kart gören sürünür
                    } else {
                        // Sarı Kart!
                        p.yellowCards++;
                        if (p.yellowCards >= 4) {
                            p.yellowCards = 0;
                            p.redCardWeeks = 1; // Sarı kart cezalısı (1 maç)
                            if (!window.newYellowSuspensions) window.newYellowSuspensions = [];
                            window.newYellowSuspensions.push(p);
                        }
                    }
                }


                
                if (Math.random() < injuryRisk) {
                    // Dev Tıbbi Simülasyon v2: Overuse ve Kaleci Eklentileri
                    
                    let weights = [
                        // 1. ADALE (KAS) YIRTIKLARI
                        { type: "Arka Bacak Yırtığı", weight: 20, min: 4, max: 8 },
                        { type: "Ön Bacak Yırtığı", weight: 15, min: 2, max: 4 },
                        { type: "Baldır Yırtığı", weight: 15, min: 3, max: 5 },
                        { type: "Kasık Çekmesi", weight: 25, min: 1, max: 3 },
                        
                        // 2. DİZ BAĞLARI VE MENİSKÜS
                        { type: "İç Yan Bağ Esnemesi", weight: 5, min: 4, max: 6 },
                        { type: "Menisküs Yırtığı", weight: 3, min: 8, max: 12 },
                        { type: "Ön Çapraz Bağ Kopması", weight: 1, min: 24, max: 36 },
                        
                        // 3. KIRIKLAR
                        { type: "Ayak Tarak Kemiği Kırığı", weight: 4, min: 6, max: 10 },
                        { type: "Kaval Kemiği Kırığı", weight: 1, min: 16, max: 24 },
                        
                        // 4. AŞIRI KULLANIM (OVERUSE) & TENDİNİTLER
                        { type: "Kasık İltihabı (Pubis)", weight: 0, min: 8, max: 16 },
                        { type: "Aşil Tendonu Kopması", weight: 0, min: 20, max: 30 },
                        { type: "Diz Kapağı İltihabı", weight: 0, min: 4, max: 8 },
                        { type: "Kaval Kemiği Ağrısı", weight: 0, min: 2, max: 4 },
                        
                        // 5. ÜST VÜCUT & KALECİ
                        { type: "El ve Parmak Kırığı", weight: 0, min: 4, max: 8 },
                        { type: "Omuz ve Köprücük Kemiği Kırığı", weight: 0, min: 6, max: 12 },
                        
                        // 6. KONTÜZYON & AYAK
                        { type: "Üst Bacak Ezilmesi", weight: 5, min: 1, max: 2 },
                        { type: "Ayak Başparmağı Burkulması", weight: 2, min: 2, max: 4 },
                        { type: "Topuk Dikeni", weight: 2, min: 3, max: 6 },
                        
                        
                        // 8. KOMPLEKS VE KRONİK SAKATLIKLAR
                        { type: "Sporcu Fıtığı", weight: 0, min: 4, max: 12 },
                        { type: "Diz Kapağı Çıkığı", weight: 0, min: 6, max: 10 },
                        { type: "Kıkırdak Yumuşaması", weight: 0, min: 4, max: 8 },
                        { type: "Bel Spazmı", weight: 5, min: 1, max: 3 },
                        { type: "Bel Fıtığı", weight: 0, min: 12, max: 24 },
                        { type: "Leğen Kemiği Ezilmesi", weight: 2, min: 2, max: 5 },
                        { type: "IT Bant Sendromu", weight: 0, min: 3, max: 6 },
                        
                        // 9. YÜZEYEL YARALANMALAR
                        { type: "Çim Yanığı", weight: 8, min: 1, max: 2 },
                        { type: "Krampon Kesiği", weight: 4, min: 1, max: 3 },
                        
                        // 7. DİĞER
                        { type: "Ayak Bileği Burkulması", weight: 15, min: 2, max: 4 },
                        { type: "Kafa Travması", weight: 0, min: 1, max: 2 }
                    ];

                    let getW = (t) => weights.find(w => w.type === t);

                    // --- FORMÜLLER VE ŞARTLAR ---
                    
                    // Kaleci Özel Sakatlıkları
                    if (p.position === "Kaleci") {
                        getW("El ve Parmak Kırığı").weight += 30; // Sadece kalecilere has
                        getW("Omuz ve Köprücük Kemiği Kırığı").weight += 10;
                        getW("Arka Bacak Yırtığı").weight = 0; // Kaleciler nadir yaşar
                        getW("Kafa Travması").weight += 5; // Direk dibine çarpma
                    } else {
                        // Saha Oyuncusu Şartları
                        if (p.condition < 40) {
                            getW("Arka Bacak Yırtığı").weight += 25; 
                            getW("Ayak Tarak Kemiği Kırığı").weight += 15; 
                            
                            
                            // --- GELİŞMİŞ SAKATLIK FORMÜLLERİ (KOMPLEKS VE KRONİK) ---
                            // 1. Sporcu Fıtığı: Patlayıcı koşu yapan açıklar/forvetler yorulunca risk katlanarak artar.
                            if (p.condition < 65 && (p.position.includes("Açık") || p.position.includes("Forvet") || p.position === "Santrafor")) {
                                getW("Sporcu Fıtığı").weight += (65 - p.condition) * 0.8; 
                            }
                            
                            // 2. IT Bant Sendromu: Kanat oyuncularının (Bek/Açık) koşu mekaniği yıpranması
                            if (p.condition < 70 && (p.position.includes("Bek") || p.position.includes("Açık"))) {
                                getW("IT Bant Sendromu").weight += (70 - p.condition) * 0.5;
                            }
                            
                            // 3. Bel Spazmı & Bel Fıtığı: Stoperler ve forvetlerin hava topu sıçramaları ve yaş faktörü
                            if (p.position === "Stoper" || p.position === "Santrafor") {
                                getW("Bel Spazmı").weight += 10 + ((100 - p.condition) * 0.2);
                                if (p.age > 29) {
                                    getW("Bel Fıtığı").weight += (p.age - 29) * 2.5; // Yaşlandıkça disk kayma riski katlanır
                                }
                            }
                            
                            // 4. Leğen Kemiği Ezilmesi (Hip Pointer): Sert müdahalelere maruz kalan/yapanlar
                            if (p.position === "Defansif Orta Saha" || p.position === "Stoper") {
                                getW("Leğen Kemiği Ezilmesi").weight += 12;
                            }
                            
                            // 5. Kıkırdak Yumuşaması ve Diz Kapağı Çıkığı: Diz eklemi yaşa bağlı yıpranma formülü
                            if (p.age > 26) {
                                getW("Kıkırdak Yumuşaması").weight += (p.age - 26) * 1.8;
                                getW("Diz Kapağı Çıkığı").weight += (p.age - 25) * 1.2;
                            }
                            
                            // 6. Yüzeyel Yaralanmalar: Agresif oyun karakteri ve defansif rol
                            if (p.mentalTrait === "agresif" || p.trait === "aggressive" || p.trait === "stopper") {
                                getW("Krampon Kesiği").weight += 15 + (Math.random() * 10);
                                getW("Çim Yanığı").weight += 15 + (Math.random() * 10);
                            }

                            // Overuse

                            getW("Kasık İltihabı (Pubis)").weight += 15;
                            getW("Kaval Kemiği Ağrısı").weight += 10;
                            getW("Topuk Dikeni").weight += 10;
                        }

                        
                        if (p.age > 28 && p.condition < 50) {
                            getW("Aşil Tendonu Kopması").weight += 15; // Yaşlı ve yorgunlarda Aşil kopması!
                            getW("Kıkırdak Yumuşaması").weight += 20; // Yılların yıpranması
                            getW("Bel Fıtığı").weight += 10;
                        }

                        
                        if (p.age > 28) {
                            getW("Arka Bacak Yırtığı").weight += 15;
                            getW("Menisküs Yırtığı").weight += 10;
                            getW("Ön Çapraz Bağ Kopması").weight += 2; 
                        }

                        if (p.position.includes("Açık") || p.position.includes("Bek")) {
                            getW("Arka Bacak Yırtığı").weight += 20; 
                            getW("Ayak Bileği Burkulması").weight += 10;     
                            getW("Ayak Başparmağı Burkulması").weight += 10; // Depar
                        }
                        
                        if (p.position === "10 Numara" || p.position === "Santrafor") {
                            getW("Ön Bacak Yırtığı").weight += 20; 
                        }

                        if (p.position === "Stoper" || p.position === "Santrafor") {
                            getW("Baldır Yırtığı").weight += 15;         
                            getW("Kafa Travması").weight += 20;   
                            getW("Diz Kapağı İltihabı").weight += 10; // Sıçrama stresi
                            getW("Omuz ve Köprücük Kemiği Kırığı").weight += 5; // Ters düşme
                            getW("Üst Bacak Ezilmesi").weight += 15; // Sert darbe
                        }

                        
                        if (p.trait === "aggressive" || p.trait === "stopper") {
                            getW("Kaval Kemiği Kırığı").weight += 10; 
                            getW("Ön Çapraz Bağ Kopması").weight += 5;    
                            getW("Krampon Kesiği").weight += 15; // Sert müdahaleler
                            getW("Çim Yanığı").weight += 10; // Kayarak müdahale
                        }

                    }

                    // --- AĞIRLIKLI RASTGELE SEÇİM ---
                    let totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
                    let r = Math.random() * totalWeight;
                    
                    let currentSum = 0;
                    for (let w of weights) {
                        currentSum += w.weight;
                        if (r <= currentSum) {
                            p.injuryType = w.type;
                            p.injuredWeeks = Math.floor(Math.random() * (w.max - w.min + 1)) + w.min;
                            if (!p.injuryHistory) p.injuryHistory = [];
                            p.injuryHistory.push({ type: p.injuryType, weeks: p.injuredWeeks });
                            
                            // YIPRANMA VE KALICI HASAR MEKANİZMASI (Kariyer Katili)
                            if (p.injuredWeeks >= 10 && preMatchCondition < 60) {
                                let pDrop = Math.floor(Math.random() * 4) + 2; // 2 ile 5 arası kalıcı güç kaybı
                                let sDrop = Math.floor(Math.random() * 3) + 1; // 1 ile 3 arası kalıcı hız kaybı
                                p.power = Math.max(10, (p.power || 50) - pDrop);
                                p.speed = Math.max(1, (p.speed || 5) - sDrop);
                                p.careerRuined = true;
                                console.warn(p.name + " yorgun oynatıldığı için kariyerini bitirebilecek bir sakatlık yaşadı! -" + pDrop + " Güç");
                            }
                            break;
                        }
                    }
                    
                    newInjuries.push(p);
                }
            } else {
                // Benched / Rested
                p.condition += 25;
                if (p.condition > 100) p.condition = 100;
                
                // [YENİ] Dinlenen oyuncunun morali biraz düşebilir (oynamak istediği için)
                // Ancak "Yıldız" oyuncularda bu düşüş çok daha keskin olur.
                if (p.power > 82) {
                    p.morale -= 5;
                } else {
                    p.morale -= 2; 
                }
                if (p.morale < 0) p.morale = 0;
            }
        });
        
        // [YENİ] Gişe Hasılatı (Matchday Revenue) - Sadece iç sahada (Şimdilik her maç sonu genel gişe ekleyelim)
        let attendance = Math.floor(Math.random() * 20000) + 15000; // 15k - 35k seyirci
        let ticketPrice = 40; // Ortalama 40 Euro
        let matchdayRevenue = (attendance * ticketPrice) / 1000000; // Milyon Euro cinsinden
        
        // Eğer takım son maçını kazanmışsa (moral yüksekse) seyirci artar
        if (window.lastMatchResult === 'win') {
            matchdayRevenue *= 1.5;
            attendance += 10000;
        } else if (window.lastMatchResult === 'loss') {
            matchdayRevenue *= 0.7; // Taraftar küstü
        }

        // [YENİ] Taraftar Desteği Çarpanı (50 = %100 normal gelir, 100 = x2 gelir, 0 = 0 gelir)
        let fanSupportVal = window.fanSupport !== undefined ? window.fanSupport : 50;
        matchdayRevenue *= (fanSupportVal / 50);
        
        matchdayRevenue = parseFloat(matchdayRevenue.toFixed(2));
        window.budget += matchdayRevenue;
        
        console.log("Gişe Hasılatı: " + matchdayRevenue + "M (Seyirci: " + attendance + ")");
        if (window.lastMatchResult === 'win') {
            setTimeout(() => {
                if(typeof speak === 'function') speak("Başkanım, stadyum kapalı gişeydi! Sadece bugünkü maçın bilet ve sosisli satışlarından kasamıza " + matchdayRevenue + " Milyon Euro girdi.");
            }, 3000);
        }

        if (window.newRedCards && window.newRedCards.length > 0) {
            console.log(window.newRedCards.length + " kırmızı kart görüldü.");
            let msg = "KIRMIZI KART RAPORU\n";
            window.newRedCards.forEach(p => msg += `- ${p.name} (${p.redCardWeeks} Maç Men)\n`);
            setTimeout(() => alert(msg), 500);
            window.newRedCards = [];
        }
        if (window.newYellowSuspensions && window.newYellowSuspensions.length > 0) {
            console.log(window.newYellowSuspensions.length + " oyuncu sarı kart cezalısı oldu.");
            let msg = "SARI KART CEZALILARI (4. Kart)\n";
            window.newYellowSuspensions.forEach(p => msg += `- ${p.name} (1 Maç Men)\n`);
            setTimeout(() => alert(msg), 1500);
            window.newYellowSuspensions = [];
        }

        if (newInjuries.length > 0) {
            let msg = "🚑 SAKATLIK ŞOKU!\n\n";
            newInjuries.forEach(p => {
                msg += `- ${p.name} sakatlandı! \n   Sakatlık: ${p.injuryType || "Bilinmiyor"} (${p.injuredWeeks} hafta yok)\n`;
                if (p.injuredWeeks >= 3) {
                    let headline = "SAKATLIK ŞOKU!";
                    let subheadline = `${p.name} ağır bir sakatlık geçirdi. Sezon planlaması alt üst oldu.`;
                    let article = `Sahalardan ${p.injuredWeeks} hafta uzak kalacak olan yıldız oyuncunun sakatlığı camiada şok etkisi yarattı. Doktorlar oyuncunun sahalara dönüş sürecinin zorlu olacağını ve tedaviye derhal başlandığını açıkladı. Bu beklenmedik kayıp hocanın elini zayıflatacak.`;
                    
                    if (p.careerRuined) {
                        headline = "BİR KARİYER BÖYLE BİTTİ!";
                        subheadline = `Teknik direktörün yorgun oyuncudaki inadı ${p.name}'e pahalıya patladı!`;
                        article = `Skandal karar! Kondisyonu bitik durumda sahaya sürülen ${p.name}, ${p.injuredWeeks} hafta sürecek çok ağır bir sakatlık yaşadı. Doktor raporlarına göre oyuncunun kalıcı fiziksel hasar aldığı ve sahalara dönse bile bir daha asla eski hızına ve gücüne kavuşamayacağı açıklandı. Taraftar, oyuncusunu göz göre göre ateşe atan hocaya çok öfkeli!`;
                        p.careerRuined = false; // reset flag
                    }

                    window.newspaperQueue = window.newspaperQueue || [];
                    window.newspaperQueue.push({
                        headline: headline,
                        subheadline: subheadline,
                        article: article,
                        color: "#c0392b",
                        bgColor: "#fff",
                        priority: 90
                    });
                }
            });
            setTimeout(() => {
                alert(msg);
                if(typeof speak === 'function') speak("Hocam kötü haber! Maçta sakatlanan oyuncularımız var.");
            }, 1500);
        }
    }
};

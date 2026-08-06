
// js/sponsor.js
// Finans ve Sponsorluk Yapay Zeka Sistemi

window.SponsorManager = {
    sponsors: [
        { id: "fly_emirates", name: "Fly Emirates", desc: "Sade Sözleşme: Sezon sonu 4 Milyon Euro net, risksiz.", upfront: 0, endSeason: 4, perWin: 0, champBonus: 0, targetRank: null, penalty: 0 },
        { id: "qatar_airways", name: "Qatar Airways", desc: "Zengin Peşinat: Hemen 2 Milyon Euro, sezon sonu 2 Milyon.", upfront: 2, endSeason: 2, perWin: 0, champBonus: 0, targetRank: null, penalty: 0 },
        { id: "spotify", name: "Spotify", desc: "Performans Bazlı: Her galibiyette +150 Bin Euro, peşinat yok.", upfront: 0, endSeason: 0, perWin: 0.15, champBonus: 0, targetRank: null, penalty: 0 },
        { id: "puma", name: "Puma", desc: "Şampiyonluk Hedefli: Şampiyon olursan ekstra 5 Milyon Euro, ama riskli.", upfront: 1, endSeason: 1, perWin: 0, champBonus: 5, targetRank: 1, penalty: 2 },
        { id: "redbull", name: "RedBull", desc: "Tehlikeli Sözleşme: Anında 3 Milyon Euro veririz. Fakat ilk 3'e giremezsen 4 Milyon geri alırız (FFP İflas Riski).", upfront: 3, endSeason: 0, perWin: 0, champBonus: 0, targetRank: 3, penalty: 4 }
    ],

    showSponsorModal: function() {
        if (!window.leagueData || !window.myTeamId) return;
        
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (!myTeam) return;

        // Zaten sponsoru varsa tekrar gösterme
        if (myTeam.sponsor && myTeam.sponsor.id) return;

        const modal = document.getElementById('sponsor-modal');
        const container = document.getElementById('sponsor-options');
        if(!modal || !container) return;

        container.innerHTML = "";
        
        if(typeof speak === 'function') {
            speak("Başkanım, Finans Direktörünüz olarak masadaki sponsor tekliflerini derledim. Özellikle RedBull ve Puma'nın sözleşmeleri çok tehlikeli, eğer hedeflerine ulaşamazsak kulübü iflasa sürükleyebilirler. Seçiminizi dikkatli yapın.");
        }

        this.sponsors.forEach(sp => {
            let btn = document.createElement('button');
            btn.className = "menu-button";
            btn.style.backgroundColor = sp.penalty > 0 ? "#8e44ad" : "#2c3e50"; // Riskli olanları mor yap

            let textHtml = `<strong>${sp.name}</strong><br>${sp.desc}`;
            btn.innerHTML = textHtml;

            // Hover olunca asistan detayı okusun
            btn.onmouseover = () => {
                if(typeof speak === 'function') speak(sp.name + " firmasından gelen teklif: " + sp.desc);
            };

            btn.onclick = () => {
                myTeam.sponsor = sp;
                // Peşinat varsa anında kasaya ekle
                if (sp.upfront > 0) {
                    window.budget += sp.upfront;
                    if(typeof updateBudgetUI === 'function') updateBudgetUI();
                    if(typeof speak === 'function') speak(sp.name + " ile anlaştık. " + sp.upfront + " milyon euro kasamıza girdi.");
                } else {
                    if(typeof speak === 'function') speak(sp.name + " firmasıyla el sıkıştık.");
                }
                modal.style.display = "none";
                document.getElementById('sponsor-btn').innerText = "Sponsor: " + sp.name;

                // [YENİ] Gazete Haberi Ekle
                window.newspaperQueue = window.newspaperQueue || [];
                window.newspaperQueue.push({
                    headline: "DEV SPONSORLUK!",
                    subheadline: `Kulübümüz global marka ${sp.name} ile sponsorluk anlaşması imzaladı.`,
                    article: `Mali açıdan kulübü rahatlatması beklenen bu dev anlaşma spor kamuoyunda büyük ses getirdi. Finans uzmanları, ${sp.name} gibi bir devin kulübe yatırım yapmasının takımın uluslararası vizyonunu güçlendireceğini belirtiyor.`,
                    color: "#8e44ad",
                    bgColor: "#fff",
                    priority: 80
                });
            };

            container.appendChild(btn);
        });

        modal.style.display = "block";
    },

    closeSponsorModal: function() {
        if(document.getElementById('sponsor-modal')) if(document.getElementById('sponsor-modal')) document.getElementById('sponsor-modal').style.display = "none";
        if(typeof speak === 'function') speak("Henüz sponsorluk imzalamadık.");
    },
    
    // Sezon sonu hesaplama
    
    handleWin: function(teamId) {
        if (!window.leagueData || !window.leagueData.teams) return;
        let t = window.leagueData.teams.find(x => x.id === teamId);
        if (t && t.sponsor && t.sponsor.perWin > 0) {
            window.budget += t.sponsor.perWin;
            console.log(t.sponsor.name + " galibiyet primi ödendi: " + t.sponsor.perWin + " M");
        }
    },
    
    evaluateSeasonEnd: function(team, finalRank) {
        if (!team.sponsor) return;
        let sp = team.sponsor;
        
        let msg = "Sponsorluk Sezon Sonu Hesaplaması:\n";
        let earnings = 0;
        
        if (sp.endSeason > 0) {
            earnings += sp.endSeason;
            msg += `+ Garanti Ödeme: ${sp.endSeason} M €\n`;
        }
        
        if (sp.targetRank && sp.penalty > 0) {
            if (finalRank <= sp.targetRank) {
                // Hedef tuttu
                if (sp.champBonus > 0 && finalRank === 1) {
                    earnings += sp.champBonus;
                    msg += `+ Şampiyonluk Primi: ${sp.champBonus} M €\n`;
                }
            } else {
                // Hedef tutmadı, tazminat kesintisi
                earnings -= sp.penalty;
                msg += `- Hedef Tutmadı Ceza (İlk ${sp.targetRank} istenmişti): -${sp.penalty} M €\n`;
            }
        }
        
        if (team.id === window.myTeamId) {
            window.budget += earnings;
            console.log(msg + " Toplam Yansıyan: " + earnings + "M");
            alert("Finans Direktörü Raporu:\n\n" + msg + "\nNet Etki: " + earnings.toFixed(2) + " Milyon Euro");
        } else {
            // Bot team
            team.budget = (team.budget || 20) + earnings;
        }
        
        // Sözleşme bitir (gelecek sezon yeni sponsor bulması için)
        team.sponsor = null;
    }
};

window.sponsorManager = window.SponsorManager;

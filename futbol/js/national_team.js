// milli takim sistemi
window.nationalities = {
    TR: { name: "Türkiye", flag: "🇹🇷" },
    BR: { name: "Brezilya", flag: "🇧🇷" },
    AR: { name: "Arjantin", flag: "🇦🇷" },
    DE: { name: "Almanya", flag: "🇩🇪" },
    FR: { name: "Fransa", flag: "🇫🇷" },
    ES: { name: "İspanya", flag: "🇪🇸" },
    EN: { name: "İngiltere", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    PT: { name: "Portekiz", flag: "🇵🇹" },
    IT: { name: "İtalya", flag: "🇮🇹" },
    NL: { name: "Hollanda", flag: "🇳🇱" },
    BE: { name: "Belçika", flag: "🇧🇪" },
    HR: { name: "Hırvatistan", flag: "🇭🇷" },
    UY: { name: "Uruguay", flag: "🇺🇾" },
    SN: { name: "Senegal", flag: "🇸🇳" },
    MA: { name: "Fas", flag: "🇲🇦" }
};

window.assignNationalities = function() {
    if (!window.leagueData || !window.leagueData.players) return;
    
    window.leagueData.players.forEach(p => {
        if (!p.nationality) {
            // İsim analizi ile uyruk tahmini (Basit)
            let nLower = p.name.toLowerCase();
            let isTurkish = nLower.includes("yilmaz") || nLower.includes("kaya") || nLower.includes("demir") || nLower.includes("ahmet") || nLower.includes("mehmet") || nLower.includes("can") || nLower.includes("arda") || nLower.includes("emre") || Math.random() < 0.4;
            
            if (isTurkish) {
                p.nationality = "TR";
            } else {
                let keys = Object.keys(window.nationalities);
                let randomKey = keys[Math.floor(Math.random() * keys.length)];
                p.nationality = randomKey;
            }
        }
    });
};

window.simulateNationalTeamSelection = function() {
    if (!window.leagueData || !window.leagueData.players) return;
    
    // Her uyruk için en iyi oyuncuları seçeceğiz
    let candidatesByNation = {};
    Object.keys(window.nationalities).forEach(k => {
        candidatesByNation[k] = [];
    });
    
    // Bütün uygun oyuncuları havuza ekle
    window.leagueData.players.forEach(p => {
        if (p.isRetired || p.injuredWeeks > 0) return; // Sakat ve emekliler gidemez
        
        let nat = p.nationality;
        if (!candidatesByNation[nat]) candidatesByNation[nat] = [];
        
        // Milli takım puanı (Gerçekçilik Güncellemesi)
        // Artık sadece "Yüksek Güç" yetmiyor. Oyuncu formsuzsa veya yedekte çürüyorsa puanı düşecek.
        let lastRating = parseFloat(p.lastMatchRating) || 5.0; // Oynamayan adama 6 değil 5 varsayıyoruz (formsuz).
        
        // Rating'i 100'lük sisteme çevir (Örn: 8.5 alan adam 85 form puanı alır)
        let formScore = lastRating * 10;
        
        // Moral çok düşükse (yedek kaldığı için mutsuzsa) penaltı
        let morale = p.morale || 75;
        let moralePenalty = (100 - morale) * 0.2; 
        
        // Yarı yarıya Güç ve Form! Formsuz yıldız evde kalır, formda anadolu topçusu milli takıma gider!
        let natScore = (p.power * 0.5) + (formScore * 0.5) - moralePenalty;
        
        candidatesByNation[nat].push({ player: p, score: natScore });
    });
    
    // My Team'den seçilenler listesi (Gazetede basmak için)
    let mySelectedPlayers = [];
    let mySnubbedPlayers = []; // Hak edip çağrılmayanlar
    
    let userTeamId = window.league ? window.league.userTeamId : 'galatasaray';
    
    // Her ülke için en iyi 23 kişiyi seç (Burada mevki ayrımı şimdilik basitleştirildi)
    Object.keys(candidatesByNation).forEach(nat => {
        let playersInNation = candidatesByNation[nat];
        // Skora göre büyükten küçüğe sırala
        playersInNation.sort((a, b) => b.score - a.score);
        
        let squadSize = 23;
        
        playersInNation.forEach((item, index) => {
            let p = item.player;
            if (index < squadSize) {
                p.isNationalPlayer = true; // Çağrıldı
                
                if (p.teamId === userTeamId) {
                    mySelectedPlayers.push(p);
                    // ÖDÜL: Milli gurur
                    p.morale += 20;
                    if (p.morale > 100) p.morale = 100;
                    if (!p.marketValueBonus) p.marketValueBonus = 0;
                    p.marketValueBonus += 1000000; // Değeri arttı
                    
                    // RİSK: FIFA Virüsü (Yorgun dönecek veya sakatlanacak)
                    if (Math.random() < 0.05) {
                        p.injuredWeeks = 1; // Milli takımda sakatlandı
                        p.injuryType = "Milli Takım Kampında Sakatlık";
                    } else {
                        p.condition -= 25; // Yorgun döndü
                        if (p.condition < 0) p.condition = 0;
                    }
                }
            } else {
                p.isNationalPlayer = false;
                
                // Eğer oyuncu kendi takımımda, yıldız ama seçilemediyse (İSYAN)
                if (p.teamId === userTeamId && p.power > 82 && p.nationality === nat) {
                    // O ülkenin kadrosuna girememiş bir yıldız
                    mySnubbedPlayers.push(p);
                    p.morale -= 30; // Büyük yıkım
                    if (p.morale < 0) p.morale = 0;
                    p.isNationalSnub = true; // Psikoloğa derdini anlatacak
                }
            }
        });
    });
    
    return { selected: mySelectedPlayers, snubbed: mySnubbedPlayers };
};

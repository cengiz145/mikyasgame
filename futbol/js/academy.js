// academy.js - Altyapı (Youth Academy) Sistemi

window.youthAcademy = window.youthAcademy || [];
window.coachesPool = window.coachesPool || [];

// Oyuna başlarken başlangıç antrenörü
window.myYouthCoach = window.myYouthCoach || {
    id: 'coach_starter',
    name: "Mahmut Hoca",
    level: 1,
    cost: 0
};

const ACADEMY_CAPACITY = 5;

const trFirstNames = ["Ahmet", "Can", "Burak", "Emre", "Arda", "Uğur", "Kaan", "Ozan", "Efe", "Mert", "Kerem", "Yunus", "Doğukan", "Semih", "Cenk", "Hasan", "Hüseyin", "İsmail", "Mehmet"];
const trLastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Yıldız", "Güneş", "Bozkurt", "Avcı"];

function generateRandomName() {
    let f = trFirstNames[Math.floor(Math.random() * trFirstNames.length)];
    let l = trLastNames[Math.floor(Math.random() * trLastNames.length)];
    return f + " " + l;
}

function generateYouthPlayer() {
    let basePower = 40 + Math.floor(Math.random() * 10); // 40 ile 49 arası
    
    // Gizli Yetenek (Talent): 0.0 ile 1.0 arası. 0 = Halı saha, 1.0 = Wonderkid
    let talent = Math.random();
    // Nadiren efsanevi talent gelir
    if (Math.random() < 0.1) talent = 0.9 + (Math.random() * 0.1); // 0.9 ile 1.0

    return {
        id: Math.floor(100000 + Math.random() * 900000),
        name: generateRandomName(),
        age: 15,
        weeksInAge: 0,
        power: basePower,
        talent: talent,
        speed: 3.5 + (Math.random() * 0.5),
        position: Math.random() > 0.5 ? 'Forvet' : (Math.random() > 0.5 ? 'Orta Saha' : 'Defans'),
        tacticalRole: 'classic',
        mentalTrait: Math.random() > 0.8 ? 'elite' : (Math.random() > 0.5 ? 'aggressive' : 'fragile'),
        isYouth: true,
        birthplace: (window.myTeam && window.myTeam.city) ? (window.myTeam.city + ", " + (window.myTeam.country || "Türkiye")) : "Altyapı Tesisleri"
    };
}

function fillAcademy() {
    while (window.youthAcademy.length < ACADEMY_CAPACITY) {
        window.youthAcademy.push(generateYouthPlayer());
    }
}

// 1000 Antrenörlük Havuz Yaratma
function generateCoachesPool() {
    if (window.coachesPool.length >= 1000) return;
    
    for (let i = window.coachesPool.length; i < 1000; i++) {
        let level = 1 + Math.floor(Math.random() * 5); // 1 ile 5 arası
        // Fiyatlandırma: 0.2M ile 1.0M arası (Rastgele fırsatlar)
        // Seviyesi yüksek olanın ortalama fiyatı daha yüksektir ama arada kelepirler de düşer
        let minCost = 0.1 + (level * 0.1); 
        let maxCost = 0.3 + (level * 0.15);
        let cost = minCost + (Math.random() * (maxCost - minCost));
        // Fiyatı 0.2 ile 1.0 arasına sıkıştır
        if (cost < 0.2) cost = 0.2;
        if (cost > 1.0) cost = 1.0;
        
        window.coachesPool.push({
            id: 'coach_' + i + '_' + Date.now(),
            name: generateRandomName(),
            level: level,
            cost: parseFloat(cost.toFixed(2)) // 2 ondalıklı
        });
    }
}

window.progressYouthAcademy = function() {
    fillAcademy();

    let graduatedPlayers = [];
    
    // Antrenör Çarpanı (Seviye 1 = 0.5x, Seviye 5 = 2.5x)
    let coachMultiplier = 0.5 * window.myYouthCoach.level; 
    
    // [YENİ] İdman Tesisleri Çarpanı
    let facilityMultiplier = 1.0;
    if (window.leagueData && window.leagueData.teams) {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (myTeam && myTeam.trainingLevel) {
            // Seviye 1: 1.0, Seviye 2: 1.2, Seviye 3: 1.5, Seviye 4: 2.0
            facilityMultiplier = (myTeam.trainingLevel === 4) ? 2.0 : (myTeam.trainingLevel === 3) ? 1.5 : (myTeam.trainingLevel === 2) ? 1.2 : 1.0;
        }
    }

    window.youthAcademy.forEach(p => {
        let baseGain = 0.01 + (p.talent * 0.1); 
        p.power += (baseGain * coachMultiplier * facilityMultiplier); 
        
        p.weeksInAge++;
        if (p.weeksInAge >= 52) {
            p.age++;
            p.weeksInAge = 0;
        }

        // 17 Yaş 0 Hafta olduğunda mezun olur
        if (p.age >= 17) {
            p.power = Math.round(p.power);
            p.passing = p.power;
            p.shooting = p.power;
            p.stamina = p.power;
            p.setPieces = p.power - 5;
            p.teamId = window.myTeamId;
            p.trainingHoursLeft = 2;
            
            if (typeof window.sanitizePlayerValues === 'function') window.sanitizePlayerValues(p);
            
            window.leagueData.players.push(p);
            graduatedPlayers.push(p);
        }
    });

    window.youthAcademy = window.youthAcademy.filter(p => p.age < 17);

    if (graduatedPlayers.length > 0) {
        let names = graduatedPlayers.map(p => p.name).join(", ");
        if(typeof speak === 'function') speak("Altyapıdan müjde! " + names + " tam 17 yaşına bastı ve A takım antrenmanlarına katıldı.");
        alert("🎓 ALTYAPI MEZUNİYETİ: " + names + " artık A Takım kadrosunda!");
    }
};

window.hireYouthCoach = function(coachId) {
    let coach = window.coachesPool.find(c => c.id === coachId);
    if (!coach) return;
    
    if (window.myTeam && window.myTeam.budget >= coach.cost) {
        window.myTeam.budget -= coach.cost;
        window.myYouthCoach = coach; // İşe al
        
        // İş havuzundan sil
        window.coachesPool = window.coachesPool.filter(c => c.id !== coachId);
        
        if(typeof speak === 'function') speak(coach.name + " altyapı tesislerimizin yeni patronu oldu.");
        openAcademyFacility(); // Arayüzü yenile
    } else {
        alert("Bütçeniz yetersiz!");
        if(typeof speak === 'function') speak("Bu antrenörü işe almak için bütçeniz yetersiz.");
    }
};

window.openAcademyFacility = function() {
    if (typeof showContainer === 'function') showContainer('academy-container');
    
    let list = document.getElementById('academy-list');
    if (!list) return;
    list.innerHTML = "";

    generateCoachesPool();
    fillAcademy();

    // 1. Mevcut Antrenör Bölümü
    let currentCoachDiv = document.createElement('div');
    currentCoachDiv.style.background = "linear-gradient(to right, #27ae60, #2c3e50)";
    currentCoachDiv.style.padding = "15px";
    currentCoachDiv.style.borderRadius = "8px";
    currentCoachDiv.style.marginBottom = "20px";
    
    let stars = window.myYouthCoach ? "⭐".repeat(window.myYouthCoach.level) : "";
    
    if (window.myYouthCoach) {
        currentCoachDiv.innerHTML = `
            <h3 style="margin:0; color:white;">Mevcut Altyapı Direktörümüz</h3>
            <div style="font-size:1.2rem; color:#f1c40f; margin-top:5px;">👨‍🏫 ${window.myYouthCoach.name}</div>
            <div style="font-size:1rem; color:#ecf0f1;">Antrenör Seviyesi: ${stars} (${window.myYouthCoach.level}/5)</div>
        `;
    } else {
        currentCoachDiv.innerHTML = `
            <h3 style="margin:0; color:white;">Mevcut Altyapı Direktörümüz</h3>
            <div style="font-size:1rem; color:#e74c3c; margin-top:5px;">Henüz bir Altyapı Direktörü işe almadınız! Lütfen iş ilanlarına göz atın.</div>
        `;
    }
    list.appendChild(currentCoachDiv);

    // 2. Altyapıdaki Gençler (Öğrenciler)
    let studentsTitle = document.createElement('h3');
    studentsTitle.textContent = "Kayıtlı Genç Yetenekler";
    studentsTitle.style.color = "#bdc3c7";
    studentsTitle.style.borderBottom = "1px solid #444";
    list.appendChild(studentsTitle);

    window.youthAcademy.forEach(p => {
        let li = document.createElement('li');
        li.style.borderBottom = "1px solid #444";
        li.style.padding = "15px";
        li.style.display = "flex"; if(li) { let title = li.querySelector('h1, h2'); if(title) title.focus(); else li.focus(); };
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.background = "linear-gradient(to right, #1a1a1a, #2c3e50)";
        li.style.marginBottom = "5px";
        li.style.borderRadius = "8px";

        let totalWeeksProgress = ((p.age - 15) * 52) + p.weeksInAge;
        let progressPercent = Math.min(100, Math.round((totalWeeksProgress / 104) * 100));

        let talentText = "Sıradan bir genç";
        let talentColor = "#95a5a6";
        if (p.talent > 0.8) { talentText = "Geleceğin Yıldızı!"; talentColor = "#f1c40f"; }
        else if (p.talent > 0.6) { talentText = "Çok Gelişime Açık"; talentColor = "#2ecc71"; }
        else if (p.talent < 0.2) { talentText = "Zaman Kaybı (Halı Saha)"; talentColor = "#e74c3c"; }

        let infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <strong style="font-size:1.3rem; color:#f1c40f;">${p.name}</strong> 
            <span style="color:#aaa;">(${p.position})</span><br>
            <span style="color:#ecf0f1; font-size:1.1rem;">📅 Yaş: ${p.age} Yıl ${p.weeksInAge} Hafta</span><br>
            <span style="color:#2ecc71;">Mevcut Güç: ${Math.round(p.power)}</span> | 
            <span style="color:${talentColor}; font-style:italic;">Gözlemci Yorumu: "${talentText}"</span>
        `;

        let progressDiv = document.createElement('div');
        progressDiv.style.width = "200px";
        progressDiv.style.textAlign = "right";
        progressDiv.innerHTML = `
            <div style="font-size:0.9rem; color:#bdc3c7; margin-bottom:5px;">Mezuniyet İlerlemesi: %${progressPercent}</div>
            <div style="width:100%; background:#333; border-radius:5px; height:10px; overflow:hidden;">
                <div style="width:${progressPercent}%; background:#3498db; height:100%;"></div>
            </div>
            <div style="font-size:0.8rem; color:#aaa; margin-top:5px;">17 Yaşına gelince A Takıma çıkar</div>
        `;

        li.appendChild(infoDiv);
        li.appendChild(progressDiv);
        list.appendChild(li);
    });
};

// staff.js - Kurmaylar (Teknik Ekip) Yönetimi

window.currentStaffCandidate = null;

function fetchNewCandidate() {
    if (!window.coachesPool || window.coachesPool.length === 0) {
        if (typeof generateCoachesPool === 'function') generateCoachesPool();
    }
    
    // Havuzdan rastgele 1 aday çek
    if (window.coachesPool && window.coachesPool.length > 0) {
        let randomIndex = Math.floor(Math.random() * window.coachesPool.length);
        window.currentStaffCandidate = window.coachesPool[randomIndex];
    }
}

window.openStaffFacility = function() {
    if (typeof showContainer === 'function') showContainer('staff-container');
    
    let container = document.getElementById('staff-content');
    if (!container) return;
    
    // Eğer aday yoksa yeni aday getir
    if (!window.currentStaffCandidate) {
        fetchNewCandidate();
    }

    renderStaffUI(container);
};

function renderStaffUI(container) {
    container.innerHTML = "";

    // 1. Mevcut Ekip Özeti
    let currentStaffDiv = document.createElement('div');
    currentStaffDiv.style.background = "linear-gradient(to right, #27ae60, #2c3e50)";
    currentStaffDiv.style.padding = "15px";
    currentStaffDiv.style.borderRadius = "8px";
    currentStaffDiv.style.marginBottom = "30px";
    
    let currentCoachStars = window.myYouthCoach ? "⭐".repeat(window.myYouthCoach.level) : "Yok";
    let currentCoachName = window.myYouthCoach ? window.myYouthCoach.name : "Yok";

    currentStaffDiv.innerHTML = `
        <h3 style="margin:0; color:white;">Mevcut Kurmaylarımız</h3>
        <div style="font-size:1.1rem; color:#ecf0f1; margin-top:10px;">
            <strong>Altyapı Direktörü:</strong> ${currentCoachName} (${currentCoachStars})
        </div>
        <div style="font-size:0.9rem; color:#bdc3c7; margin-top:5px;">*(Şimdilik sadece altyapı direktörü aranmaktadır)*</div>
    `;
    container.appendChild(currentStaffDiv);

    // 2. Aday Değerlendirme (1'e 1 Mülakat)
    let candidateTitle = document.createElement('h3');
    candidateTitle.textContent = "🔍 Özgeçmiş İnceleme (Mülakat Masası)";
    candidateTitle.style.color = "#f1c40f";
    candidateTitle.style.borderBottom = "1px solid #444";
    candidateTitle.style.paddingBottom = "10px";
    container.appendChild(candidateTitle);

    if (!window.currentStaffCandidate) {
        container.innerHTML += `<p style="color:#e74c3c;">Havuzda uygun aday bulunamadı!</p>`;
        return;
    }

    let candidate = window.currentStaffCandidate;
    let stars = "⭐".repeat(candidate.level);

    let candidateCard = document.createElement('div');
    candidateCard.style.background = "#2c3e50";
    candidateCard.style.border = "2px solid #34495e";
    candidateCard.style.borderRadius = "10px";
    candidateCard.style.padding = "20px";
    candidateCard.style.textAlign = "center";
    candidateCard.style.margin = "20px auto";
    candidateCard.style.maxWidth = "400px";
    candidateCard.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";

    candidateCard.innerHTML = `
        <div style="font-size:3rem;">👨‍💼</div>
        <h2 style="color:white; margin:10px 0 5px 0;">${candidate.name}</h2>
        <div style="color:#f1c40f; font-size:1.5rem; letter-spacing:3px;">${stars}</div>
        <p style="color:#ecf0f1; font-size:1.1rem; margin:15px 0;">Pozisyon: <strong>Altyapı Direktörü</strong></p>
        <div style="background:#1a252f; padding:10px; border-radius:5px; margin-bottom:20px;">
            <span style="color:#bdc3c7;">Talep Ettiği İmza Parası:</span><br>
            <strong style="color:#e74c3c; font-size:1.3rem;">€${candidate.cost}M</strong>
        </div>
        
        <div style="display:flex; justify-content:space-between; gap:10px;">
            <button onclick="window.rejectStaffCandidate()" class="menu-button" style="flex:1; background-color:#c0392b; font-size:1rem; padding:15px;">
                ❌ Reddet<br><span style="font-size:0.8rem;">(Sıradaki Gelsin)</span>
            </button>
            <button onclick="window.hireStaffCandidate()" class="menu-button" style="flex:1; background-color:#27ae60; font-size:1rem; padding:15px;">
                ✅ İşe Al<br><span style="font-size:0.8rem;">(€${candidate.cost}M Öde)</span>
            </button>
        </div>
    `;

    container.appendChild(candidateCard);
}

window.rejectStaffCandidate = function() {
    // Reddedilen adayı havuzdan silebiliriz veya tekrar denk gelebilir. (Siliyoruz)
    if (window.currentStaffCandidate) {
        window.coachesPool = window.coachesPool.filter(c => c.id !== window.currentStaffCandidate.id);
    }
    
    // Yeni aday getir
    fetchNewCandidate();
    
    // Arayüzü yenile
    let container = document.getElementById('staff-content');
    if (container) renderStaffUI(container);
    
    // Ses efekti (opsiyonel)
    if(typeof speak === 'function') speak("Aday reddedildi, yeni özgeçmiş inceleniyor.");
};

window.hireStaffCandidate = function() {
    let candidate = window.currentStaffCandidate;
    if (!candidate) return;

    if (window.myTeam && window.myTeam.budget >= candidate.cost) {
        // Bütçeden düş
        window.myTeam.budget -= candidate.cost;
        
        // Altyapı antrenörü yap
        window.myYouthCoach = candidate;
        
        // Havuzdan sil
        window.coachesPool = window.coachesPool.filter(c => c.id !== candidate.id);
        
        if(typeof speak === 'function') speak(candidate.name + " ile sözleşme imzalandı. Yeni altyapı direktörümüz hayırlı olsun.");
        alert("✅ İŞE ALIM BAŞARILI: " + candidate.name + " kulübünüze katıldı!");
        
        // İşe alındığı için masaya hemen yeni bir boş aday koyalım
        fetchNewCandidate();
        
        // Arayüzü yenile
        let container = document.getElementById('staff-content');
        if (container) renderStaffUI(container);
    } else {
        alert("Bütçeniz yetersiz!");
        if(typeof speak === 'function') speak("Bu kurmayı işe almak için bütçeniz yetersiz.");
    }
};

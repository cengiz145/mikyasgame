const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const target = `    <!-- TEAM SELECT -->
    <div id="team-select-container" class="menu-container" style="display: none;">
        <h1 id="team-select-title" tabindex="-1" style="outline: none; color:#f1c40f;">Takımınızı Seçin</h1>
        <div id="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; width: 80%; max-height: 60vh; overflow-y: auto; margin-top: 20px; padding: 10px;">
            <!-- JS ile doldurulacak -->
        </div>
        <button id="btn-back-team" class="menu-button" style="margin-top: 30px; background-color: #555;">Geri Dön</button>
    </div>`;

const replacement = target + `
    
    <!-- MANAGER PROFILE SELECT -->
    <div id="manager-profile-select-container" class="menu-container" style="display: none;">
        <h1 tabindex="-1" style="color: #f1c40f; margin-bottom: 20px;">Menajer Profilinizi Seçin</h1>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; width: 80%; max-height: 60vh; overflow-y: auto; padding: 10px;">
            
            <button class="menu-button btn-profile" data-profile="taktik_deha" style="background-color: #2980b9; display: flex; flex-direction: column; align-items: center; padding: 15px; height: auto;">
                <span style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">♟️ Taktik Deha (Satranç Ustası)</span>
                <span style="font-size: 0.9rem; font-weight: normal;">Hatasız pas oyunu, ancak yüksek fiziksel yorgunluk.</span>
            </button>

            <button class="menu-button btn-profile" data-profile="motivasyon_ustasi" style="background-color: #27ae60; display: flex; flex-direction: column; align-items: center; padding: 15px; height: auto;">
                <span style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">🔥 Motivasyon Ustası</span>
                <span style="font-size: 0.9rem; font-weight: normal;">Yüksek başlangıç sadakati. Geriye düşünce müthiş kenetlenme ve adrenalin.</span>
            </button>

            <button class="menu-button btn-profile" data-profile="pragmatist" style="background-color: #34495e; display: flex; flex-direction: column; align-items: center; padding: 15px; height: auto;">
                <span style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">🛡️ Pragmatist (Sonuç Odaklı)</span>
                <span style="font-size: 0.9rem; font-weight: normal;">Savunma gücüne kalıcı katkı, ancak agresif ve kart görmeye müsait sert futbol.</span>
            </button>

            <button class="menu-button btn-profile" data-profile="proje_hocasi" style="background-color: #8e44ad; display: flex; flex-direction: column; align-items: center; padding: 15px; height: auto;">
                <span style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">🎓 Proje Hocası (Öğretmen)</span>
                <span style="font-size: 0.9rem; font-weight: normal;">Genç oyuncuların muazzam gelişimi ve ekstra Başkan Güveni.</span>
            </button>

            <button class="menu-button btn-profile" data-profile="itfaiyeci" style="background-color: #c0392b; display: flex; flex-direction: column; align-items: center; padding: 15px; height: auto;">
                <span style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">🧯 İtfaiyeci (Kriz Yöneticisi)</span>
                <span style="font-size: 0.9rem; font-weight: normal;">Kötü gidişatta morallerin çökmesini engeller, kaos ihtimalini bitirir.</span>
            </button>

            <button class="menu-button btn-profile" data-profile="eski_efsane" style="background-color: #f39c12; display: flex; flex-direction: column; align-items: center; padding: 15px; height: auto; color: black;">
                <span style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">👑 Eski Efsane (Oyun Kurucu)</span>
                <span style="font-size: 0.9rem; font-weight: normal;">Sınırsız otorite ile başlarsın. Taraftar protestoları çok zor tetiklenir.</span>
            </button>

        </div>
    </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('index.html', content, 'utf8');
console.log("index.html patched with Manager Profiles!");

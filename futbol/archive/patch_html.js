const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix main-menu-container
const oldMainMenu = `        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-width: 600px;">
            <button id="btn-next-day" class="menu-button" style="background-color: #e74c3c; grid-column: span 2;">Sonraki Gün / Maça Geç</button>
            <button id="btn-squad-view" class="menu-button" style="background-color: #3498db;">Kadro</button>
            <button id="btn-tactics" class="menu-button" style="background-color: #e67e22;">Taktik</button>
            <button id="btn-transfer-center" class="menu-button" style="background-color: #9b59b6;">Transfer Merkezi</button>
            <button id="btn-training-facility" class="menu-button" style="background-color: #f39c12;">İdman Tesisleri</button>
            <button id="btn-scout-network" class="menu-button" style="background-color: #16a085;">Gözlemci Ağı</button>
            <button id="btn-facilities" class="menu-button" style="background-color: #2980b9;">Tesisler</button>
            <button id="btn-save-game" class="menu-button" style="background-color: #27ae60; grid-column: span 2;">Oyunu Kaydet</button>
            <button id="btn-back-main" class="menu-button" style="background-color: #555; grid-column: span 2;">Ana Menüye Dön</button>
        </div>`;

const newMainMenu = `        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; max-width: 800px; padding: 20px;">
            <button id="btn-next-day" class="menu-button" style="background-color: #e74c3c; grid-column: span 3; font-size: 1.5rem; padding: 20px;">Sonraki Gün / Maça Geç</button>
            
            <button id="btn-squad-view" class="menu-button" style="background-color: #3498db;">Kadro</button>
            <button id="btn-formation" class="menu-button" style="background-color: #e67e22;">Taktik Diziliş</button>
            <button id="btn-training-facility" class="menu-button" style="background-color: #f39c12;">İdman Tesisleri</button>
            
            <button id="btn-transfer-center" class="menu-button" style="background-color: #9b59b6;">Transfer Merkezi</button>
            <button id="btn-scout-network" class="menu-button" style="background-color: #16a085;">Gözlemci Ağı</button>
            <button id="btn-academy" class="menu-button" style="background-color: #2ecc71;">Altyapı (Akademi)</button>
            
            <button id="btn-facilities" class="menu-button" style="background-color: #2980b9;">Stadyum Tesisleri</button>
            <button id="btn-staff" class="menu-button" style="background-color: #8e44ad;">Kurmaylar</button>
            <button id="btn-medical-center" class="menu-button" style="background-color: #d35400;">Sağlık Merkezi</button>
            
            <button id="btn-standings" class="menu-button" style="background-color: #34495e;">Puan Durumu</button>
            <button id="btn-fixture" class="menu-button" style="background-color: #7f8c8d;">Fikstür</button>
            <button id="btn-press" class="menu-button" style="background-color: #f1c40f; color: #333;">Basın Toplantısı</button>
            
            <button id="btn-save-game" class="menu-button" style="background-color: #27ae60; grid-column: span 3;">Oyunu Kaydet</button>
            
            <div style="display: flex; gap: 15px; grid-column: span 3;">
                <button id="btn-resign" class="menu-button" style="background-color: #c0392b; flex: 1;">İstifa Et</button>
                <button id="btn-back-main" class="menu-button" style="background-color: #555; flex: 1;">Ana Menüye Dön</button>
            </div>
        </div>`;

if (content.includes(oldMainMenu)) {
    content = content.replace(oldMainMenu, newMainMenu);
}

// 2. Fix scout-center-container ID mismatch
if (content.includes('id="scout-center-container"')) {
    content = content.replace('id="scout-center-container"', 'id="scout-container"');
}

// 3. Add facilities-container if not exists
const facilitiesContainer = `
    <!-- FACILITIES CONTAINER -->
    <div id="facilities-container" class="menu-container" role="region" aria-label="Tesis Yönetimi" style="display:none; text-align:center;">
        <h2 style="color:#f1c40f;">Tesis Yönetimi</h2>
        <div id="facilities-budget-display" style="color: #2ecc71; font-size: 1.2rem; margin-bottom: 15px; font-weight: bold;"></div>
        
        <div style="display: flex; gap: 30px; justify-content: center; margin-top: 20px;">
            <div style="background: rgba(0,0,0,0.6); padding: 25px; border-radius: 12px; border: 2px solid #2980b9; width: 300px;">
                <h3 style="color: #3498db;"><i class="fas fa-building"></i> Stadyum</h3>
                <p style="color: #ecf0f1; font-size: 1.2rem; margin: 15px 0;">Seviye: <strong id="stadium-level-display" style="color: #f1c40f;">1</strong>/10</p>
                <button id="btn-upgrade-stadium" class="menu-button" style="background-color: #2980b9; width: 100%;">Geliştir</button>
            </div>
            
            <div style="background: rgba(0,0,0,0.6); padding: 25px; border-radius: 12px; border: 2px solid #27ae60; width: 300px;">
                <h3 style="color: #2ecc71;"><i class="fas fa-dumbbell"></i> İdman Tesisleri</h3>
                <p style="color: #ecf0f1; font-size: 1.2rem; margin: 15px 0;">Seviye: <strong id="training-level-display" style="color: #f1c40f;">1</strong>/10</p>
                <button id="btn-upgrade-training" class="menu-button" style="background-color: #27ae60; width: 100%;">Geliştir</button>
            </div>
        </div>
        <button id="btn-back-facilities" class="menu-button" style="background-color:#555; margin-top: 30px; width: 300px;">Geri</button>
    </div>
`;

if (!content.includes('id="facilities-container"')) {
    content = content.replace('<!-- STAFF CONTAINER -->', facilitiesContainer + '\\n    <!-- STAFF CONTAINER -->');
}

// 4. Add player-selector-modal
const playerSelectorModal = `
    <!-- OYUNCU SEÇİCİ MODALI -->
    <div id="player-selector-modal" class="modal" role="dialog" aria-modal="true" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:2000; align-items:center; justify-content:center;">
        <div style="background: #1a252f; border: 2px solid #f39c12; border-radius: 12px; padding: 30px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
            <h2 id="player-selector-title" style="color: #f39c12; text-align: center; margin-top: 0;">Oyuncu Seçin</h2>
            <div id="player-selector-list" style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; margin: 15px 0; display: flex; flex-direction: column; gap: 10px;">
                <!-- js/manager.js dolduracak -->
            </div>
            <button id="btn-close-selector" class="menu-button" style="background: #c0392b; width: 100%; margin-bottom: 0;">İptal</button>
        </div>
    </div>
`;

if (!content.includes('id="player-selector-modal"')) {
    content = content.replace('<!-- HATA BİLDİRİM MODALI -->', playerSelectorModal + '\\n    <!-- HATA BİLDİRİM MODALI -->');
}

// 5. Add captain-selector-modal
const captainSelectorModal = `
    <!-- KAPTAN SEÇİCİ MODALI -->
    <div id="captain-selector-modal" class="modal" role="dialog" aria-modal="true" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:2000; align-items:center; justify-content:center;">
        <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 12px; padding: 30px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
            <h2 style="color: #3498db; text-align: center; margin-top: 0;">Kaptan Seçimi</h2>
            <div id="captain-selector-list" style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; margin: 15px 0; display: flex; flex-direction: column; gap: 10px;">
                <!-- js/menu.js dolduracak -->
            </div>
            <button id="btn-close-captain" class="menu-button" style="background: #c0392b; width: 100%; margin-bottom: 0;">İptal</button>
        </div>
    </div>
`;

if (!content.includes('id="captain-selector-modal"')) {
    content = content.replace('<!-- HATA BİLDİRİM MODALI -->', captainSelectorModal + '\\n    <!-- HATA BİLDİRİM MODALI -->');
}

// 6. Fix interaction-modal
const interactionModal = `
    <!-- ETKİLEŞİM MODALI (Basın/Oyuncu Sohbeti vb) -->
    <div id="interaction-modal" class="modal" role="dialog" aria-modal="true" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:3000; align-items:center; justify-content:center;">
        <div style="background: #1a252f; border: 3px solid #9b59b6; border-radius: 15px; padding: 30px; width: 500px; text-align: center;">
            <h2 id="interaction-title" style="color: #9b59b6; margin-top: 0;">Etkileşim</h2>
            <p id="interaction-desc" style="color: white; font-size: 1.1rem; margin-bottom: 20px;">Bir seçenek belirleyin.</p>
            <div id="interaction-options" style="display: flex; flex-direction: column; gap: 10px;">
                <!-- js/interactions.js dolduracak -->
            </div>
            <button id="btn-close-interaction" class="menu-button" style="background: #c0392b; margin-top: 20px; width: 100%;" onclick="document.getElementById('interaction-modal').style.display='none'">Kapat</button>
        </div>
    </div>
`;

if (!content.includes('id="interaction-modal"')) {
    content = content.replace('<!-- HATA BİLDİRİM MODALI -->', interactionModal + '\\n    <!-- HATA BİLDİRİM MODALI -->');
}

// 7. Fix dynamic-event-modal
const dynamicEventModal = `
    <!-- DİNAMİK OLAY MODALI -->
    <div id="dynamic-event-modal" class="modal" role="dialog" aria-modal="true" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:3000; align-items:center; justify-content:center;">
        <div style="background: #2c3e50; border: 3px solid #e74c3c; border-radius: 15px; padding: 30px; width: 500px; text-align: center;">
            <h2 id="dynamic-event-title" style="color: #e74c3c; margin-top: 0;">Beklenmedik Olay!</h2>
            <p id="dynamic-event-desc" style="color: white; font-size: 1.2rem; margin-bottom: 25px; line-height: 1.5;"></p>
            <div id="dynamic-event-options" style="display: flex; flex-direction: column; gap: 15px;">
                <!-- js/menu.js dolduracak -->
            </div>
        </div>
    </div>
`;

if (!content.includes('id="dynamic-event-modal"')) {
    content = content.replace('<!-- HATA BİLDİRİM MODALI -->', dynamicEventModal + '\\n    <!-- HATA BİLDİRİM MODALI -->');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log("index.html patched with missing containers and buttons.");

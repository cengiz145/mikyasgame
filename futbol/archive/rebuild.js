const fs = require('fs');
let html = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Futbol Simülasyonu</title>
    <link rel="stylesheet" href="style.css">
    <script src="js/howler.min.js"></script>
    <style>
        .menu-container { display: none; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .active-container { display: flex !important; }
        .hidden { display: none !important; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center; }
        ul { list-style: none; padding: 0; width: 100%; max-width: 800px; }
        .menu-button { padding: 15px 30px; font-size: 1.2rem; border: none; border-radius: 8px; cursor: pointer; color: white; margin-bottom: 15px; font-weight: bold; transition: opacity 0.2s; }
        .menu-button:hover { opacity: 0.8; }
    </style>
</head>
<body role="application" tabindex="0" id="game-application">

    <!-- ARIA Live Regions for NVDA -->
    <div id="live-announcer" aria-live="assertive" class="visually-hidden" style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);"></div>
    <div id="announcer-text" aria-live="polite" class="visually-hidden" style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);"></div>

    <!-- HATA BİLDİRİM MODALI -->
    <div id="error-reporter-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="error-modal-title">
        <div style="background: #111; border: 3px solid #ff4444; border-radius: 12px; padding: 30px; width: 80%; max-width: 700px;">
            <h2 id="error-modal-title" style="color: #ff4444;">KRİTİK SİSTEM HATASI</h2>
            <textarea id="error-log-textarea" readonly style="width: 100%; height: 200px; background: #000; color: #0f0;"></textarea>
            <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 15px;">
                <button id="btn-reload-error" class="menu-button">Oyunu Yeniden Başlat</button>
                <button id="btn-send-error" class="menu-button" style="background: #ff4444;">Hatayı Panoya Kopyala</button>
            </div>
        </div>
    </div>

    <!-- DIALOGUE MODAL -->
    <div id="dialogue-overlay" class="modal" role="dialog">
        <div id="dialogue-box" style="background: rgba(13, 17, 23, 0.95); border: 2px solid #d4af37; border-radius: 12px; padding: 30px; width: 500px;">
            <h2 id="dialogue-sender" style="color: #f1c40f;"></h2>
            <p id="dialogue-text" style="color: white; font-size: 1.2rem;"></p>
            <div id="dialogue-choices" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;"></div>
            <button id="btn-dialogue-next" class="menu-button hidden" style="margin-top: 15px;">Devam Et</button>
        </div>
    </div>

    <!-- PRESIDENT BRIEFING -->
    <div id="president-briefing-modal" class="modal">
        <div style="background: #1a1a2e; padding: 40px; border-radius: 10px; border: 2px solid #f1c40f; text-align: center; max-width: 600px;">
            <h2 style="color: #f1c40f;">Başkanın Mesajı</h2>
            <p style="color: white; font-size: 1.2rem;">Hocam kulübümüze hoş geldin. Eksiklerini tamamla, bütçeni idareli kullan.</p>
            <button class="menu-button" style="background-color: #27ae60;" onclick="document.getElementById('president-briefing-modal').style.display='none'">Anlaşıldı Başkanım</button>
        </div>
    </div>

    <!-- SPONSOR MODAL -->
    <div id="sponsor-modal" class="modal">
        <div style="background: #1a1a2e; padding: 40px; border-radius: 10px; border: 2px solid #2980b9; text-align: center; max-width: 600px;">
            <h2 style="color: #2980b9;">Sponsorluk Teklifleri</h2>
            <div id="sponsor-options" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;"></div>
        </div>
    </div>

    <!-- PRESS MODAL -->
    <div id="press-modal" class="modal">
        <div style="background: #2c3e50; padding: 40px; border-radius: 10px; border: 2px solid #f1c40f; text-align: center; max-width: 700px;">
            <h2 id="press-reporter-name" style="color: #f1c40f;">Basın Toplantısı</h2>
            <p id="press-question-text" style="color: white; font-size: 1.2rem; font-style: italic;"></p>
            <div id="press-options" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;"></div>
        </div>
    </div>

    <!-- NEGOTIATION MODAL -->
    <div id="negotiation-modal" class="modal">
        <div style="background: #2c3e50; padding: 30px; border-radius: 10px; border: 2px solid #e74c3c; width: 500px; text-align: center;">
            <h2 style="color: #ecf0f1;">Menajerle Pazarlık</h2>
            <p id="neg-agent-speech" style="color: #f1c40f; font-style: italic;"></p>
            <p style="color: white;">İstenen: <strong id="neg-agent-demand"></strong></p>
            <p style="color: #e74c3c;">Sabır: <strong id="neg-agent-patience"></strong></p>
            <input type="number" id="neg-offer-input" placeholder="Teklifiniz" style="padding: 10px; width: 80%; margin: 10px 0;">
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="btn-neg-submit" class="menu-button" style="background: #2980b9;">Teklif Yap</button>
                <button id="btn-neg-accept" class="menu-button" style="background: #27ae60;">Kabul Et</button>
                <button id="btn-neg-withdraw" class="menu-button" style="background: #c0392b;">Masadan Kalk</button>
            </div>
        </div>
    </div>

    <!-- TRANSFER CONFIRM MODAL -->
    <div id="transfer-confirm-modal" class="modal">
        <div style="background: #2c3e50; padding: 30px; border-radius: 10px; border: 2px solid #e74c3c;">
            <p id="transfer-confirm-text" style="color: white; font-size: 1.2rem;"></p>
            <button id="btn-confirm-transfer" class="menu-button" style="background: #27ae60;">Evet</button>
            <button id="btn-cancel-transfer" class="menu-button" style="background: #c0392b;">Hayır</button>
        </div>
    </div>

    <!-- TRANSFER ACTION MODAL -->
    <div id="transfer-action-modal" class="modal">
        <div style="background: #2c3e50; padding: 30px; border-radius: 10px; border: 2px solid #3498db; text-align: center;">
            <h2 style="color: #3498db;">Transfer Aksiyonu</h2>
            <p id="transfer-action-text" style="color: white;"></p>
            <div id="transfer-action-buttons" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>
            <button onclick="document.getElementById('transfer-action-modal').style.display='none'" class="menu-button" style="background: #555; margin-top: 10px;">İptal</button>
        </div>
    </div>

    <!-- SCOUT OFFER MODAL -->
    <div id="scout-offer-modal" class="modal">
        <div style="background: #16a085; padding: 30px; border-radius: 10px; border: 2px solid #f1c40f; text-align: center;">
            <h2 style="color: #f1c40f;">Teklif Yap</h2>
            <p style="color: white;">Oyuncu için teklifinizi girin.</p>
            <input type="number" id="scout-offer-input" placeholder="Teklifiniz" style="padding: 10px; width: 80%; margin: 10px 0;">
            <button id="btn-submit-scout-offer" class="menu-button" style="background: #2980b9;">Teklif Gönder</button>
            <button onclick="document.getElementById('scout-offer-modal').style.display='none'" class="menu-button" style="background: #555;">İptal</button>
        </div>
    </div>

    <!-- INTRO MENU -->
    <div id="intro-container" class="menu-container active-container">
        <h1 style="color: #f1c40f; font-size: 3rem; margin-bottom: 40px;">FUTBOL MENAJERİ</h1>
        <button id="btn-new-game" class="menu-button" style="background-color: #27ae60; width: 300px;">Yeni Oyun</button>
        <button id="btn-continue" class="menu-button" style="background-color: #2980b9; width: 300px;">Kariyerime Devam Et</button>
        <button id="btn-settings" class="menu-button" style="background-color: #8e44ad; width: 300px;">Ayarlar</button>
    </div>

    <!-- LEAGUE SELECT -->
    <div id="league-select-container" class="menu-container">
        <h1 style="color: #f1c40f;">Lig Seçimi</h1>
        <button id="btn-league-superlig" class="menu-button" style="background-color: #27ae60; width: 300px;">Trendyol Süper Lig</button>
        <button id="btn-league-tff1" class="menu-button" style="background-color: #8e44ad; width: 300px;">Trendyol 1. Lig</button>
        <button id="btn-league-seriea" class="menu-button" style="background-color: #2980b9; width: 300px;">🇮🇹 Serie A</button>
        <button id="btn-league-serieb" class="menu-button" style="background-color: #7f8c8d; width: 300px; opacity: 0.7;">Serie B (Yakında)</button>
        <button id="btn-back-league" class="menu-button" style="background-color: #555; width: 300px; margin-top: 20px;">Geri</button>
    </div>

    <!-- COUNTRY SELECT (World Stars etc) -->
    <div id="country-select-container" class="menu-container">
        <h1 style="color: #f1c40f;">Ülke Seçimi</h1>
        <button id="btn-country-es" class="menu-button" style="background-color: #e67e22; width: 300px;">🇪🇸 İspanya</button>
        <button id="btn-country-de" class="menu-button" style="background-color: #8e44ad; width: 300px;">🇩🇪 Almanya</button>
        <button id="btn-country-fr" class="menu-button" style="background-color: #34495e; width: 300px;">🇫🇷 Fransa</button>
        <button id="btn-country-nl" class="menu-button" style="background-color: #f39c12; width: 300px;">🇳🇱 Hollanda</button>
        <button id="btn-country-br" class="menu-button" style="background-color: #27ae60; width: 300px;">🇧🇷 Brezilya</button>
        <button id="btn-country-pt" class="menu-button" style="background-color: #c0392b; width: 300px;">🇵🇹 Portekiz</button>
        <button id="btn-back-country" class="menu-button" style="background-color: #555; width: 300px; margin-top: 20px;">Geri</button>
    </div>

    <!-- MAIN MENU -->
    <div id="main-menu-container" class="menu-container">
        <h1 style="color: #f1c40f;">Yönetim Paneli</h1>
        <div id="budget-display" style="color: #2ecc71; font-size: 1.5rem; margin-bottom: 10px; font-weight: bold;">Bütçe: Yükleniyor...</div>
        <div id="calendar-display" style="color: #ecf0f1; font-size: 1.2rem; margin-bottom: 20px;">Tarih: Yükleniyor...</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-width: 600px;">
            <button id="btn-next-day" class="menu-button" style="background-color: #e74c3c; grid-column: span 2;">Sonraki Gün / Maça Geç</button>
            <button id="btn-squad" class="menu-button" style="background-color: #3498db;">Kadro</button>
            <button id="btn-tactics" class="menu-button" style="background-color: #e67e22;">Taktik</button>
            <button id="btn-transfer-center" class="menu-button" style="background-color: #9b59b6;">Transfer Merkezi</button>
            <button id="btn-training-facility" class="menu-button" style="background-color: #f39c12;">İdman Tesisleri</button>
            <button id="btn-scout-network" class="menu-button" style="background-color: #16a085;">Gözlemci Ağı</button>
            <button id="btn-facilities" class="menu-button" style="background-color: #2980b9;">Tesisler</button>
            <button id="btn-save-game" class="menu-button" style="background-color: #27ae60; grid-column: span 2;">Oyunu Kaydet</button>
            <button id="btn-back-main" class="menu-button" style="background-color: #555; grid-column: span 2;">Ana Menüye Dön</button>
        </div>
    </div>

    <!-- SQUAD CONTAINER -->
    <div id="squad-container" class="menu-container">
        <h1 style="color: #f1c40f;">Kadro</h1>
        <ul id="squad-list"></ul>
        <button id="btn-back-squad" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    <!-- TRAINING CONTAINER -->
    <div id="training-container" class="menu-container">
        <h1 style="color: #f1c40f;">İdman Tesisleri</h1>
        <div id="training-budget-display" style="color: #2ecc71; font-size: 1.2rem; margin-bottom: 15px;"></div>
        <ul id="training-list"></ul>
        <button id="btn-back-training" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    <!-- SCOUT CONTAINER -->
    <div id="scout-center-container" class="menu-container">
        <h1 style="color: #f1c40f;">Gözlemci Ağı</h1>
        <div id="scout-budget-display" style="color: #2ecc71; font-size: 1.2rem; margin-bottom: 15px;"></div>
        <ul id="scout-list"></ul>
        <button id="btn-back-scout" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    <!-- TRANSFER CONTAINER -->
    <div id="transfer-center-container" class="menu-container">
        <h1 style="color: #f1c40f;">Transfer Merkezi</h1>
        <select id="transfer-team-select" style="padding: 10px; font-size: 1.1rem; margin-bottom: 15px; width: 300px;">
            <option value="free">Serbest Oyuncular</option>
        </select>
        <button id="advance-market-btn" class="menu-button" style="background-color: #8e44ad; margin-bottom: 15px;">Piyasayı İlerlet</button>
        <ul id="transfer-list"></ul>
        <button id="btn-back-transfer" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    <!-- STAFF CONTAINER -->
    <div id="staff-container" class="menu-container">
        <h1 style="color: #f1c40f;">Tesisler / Personel</h1>
        <div id="staff-content" style="width: 100%; max-width: 800px;"></div>
        <button id="btn-back-staff" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    <!-- GAME CONTAINER -->
    <div id="game-container" class="menu-container" style="background-color: #1a252f;">
        <h1 style="color: #f1c40f; text-align: center;">CANLI MAÇ</h1>
        <div id="score-display" style="font-size: 3rem; color: white; text-align: center; margin: 20px 0;">0 - 0</div>
        <div id="match-clock" style="font-size: 2rem; color: #e74c3c; text-align: center; margin-bottom: 20px;">00:00</div>
        <div id="commentary-box" aria-live="polite" style="background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 8px; width: 80%; max-width: 600px; height: 200px; overflow-y: auto; font-size: 1.2rem; margin-bottom: 20px; border: 2px solid #34495e;">
            Maç başlamak üzere...
        </div>
        <div id="match-actions" style="display: flex; gap: 10px; justify-content: center;"></div>
        <button class="menu-button" style="background-color: #555; margin-top: 20px;" onclick="showContainer('main-menu-container')">Yönetim Paneline Dön</button>
    </div>
    
`;

let currentHtml = fs.readFileSync('index.html', 'utf8');
let newHtml = html + '\n' + currentHtml;
fs.writeFileSync('index.html', newHtml);
console.log('Rebuilt index.html successfully!');

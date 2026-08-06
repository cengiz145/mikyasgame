const fs = require('fs');

const indexFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\index.html';
let content = fs.readFileSync(indexFile, 'utf8');

const newContainers = `
    <!-- YENİ: ÜLKE SEÇİM EKRANI -->
    <div id="country-select-container" class="menu-container" role="presentation" aria-hidden="true" style="display: none;">
        <h1 id="country-select-title" tabindex="-1" style="outline: none;">Oynamak İstediğiniz Ülkeyi Seçin</h1>
        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
            <button id="btn-country-tr" class="menu-button" style="background-color: #e74c3c; padding: 20px 40px; font-size: 1.5rem;">TÜRKİYE</button>
            <button id="btn-country-it" class="menu-button" style="background-color: #3498db; padding: 20px 40px; font-size: 1.5rem;">İTALYA</button>
        </div>
        <button id="btn-back-country" class="menu-button" style="margin-top: 50px; background-color: #555;">Geri Dön</button>
    </div>

    <!-- YENİ: LİG SEÇİM EKRANI -->
    <div id="league-select-container" class="menu-container" role="presentation" aria-hidden="true" style="display: none;">
        <h1 id="league-select-title" tabindex="-1" style="outline: none;">Lig Seçimi</h1>
        <div id="tr-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
            <button id="btn-league-superlig" class="menu-button" style="background-color: #27ae60; width: 300px;">Trendyol Süper Lig</button>
            <button id="btn-league-tff1" class="menu-button" style="background-color: #8e44ad; width: 300px;">Trendyol 1. Lig</button>
        </div>
        <div id="it-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
            <button id="btn-league-seriea" class="menu-button" style="background-color: #2980b9; width: 300px;">Serie A</button>
            <button id="btn-league-serieb" class="menu-button" style="background-color: #7f8c8d; width: 300px; opacity: 0.7;">Serie B (Yakında)</button>
        </div>
        <button id="btn-back-league" class="menu-button" style="margin-top: 50px; background-color: #555;">Geri Dön</button>
    </div>

    <!-- YENİ: TAKIM SEÇİM EKRANI -->
    <div id="team-select-container" class="menu-container" role="presentation" aria-hidden="true" style="display: none;">
        <h1 id="team-select-title" tabindex="-1" style="outline: none;">Takımınızı Seçin</h1>
        <div id="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; width: 80%; max-height: 60vh; overflow-y: auto; margin-top: 20px; padding: 10px;">
            <!-- JS ile doldurulacak -->
        </div>
        <button id="btn-back-team" class="menu-button" style="margin-top: 30px; background-color: #555;">Geri Dön</button>
    </div>
`;

if (!content.includes('id="country-select-container"')) {
    content = content.replace('<!-- 2. ANA MENÜ -->', newContainers + '\n    <!-- 2. ANA MENÜ -->');
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log("HTML güncellendi.");
} else {
    console.log("Konteynerler zaten var.");
}

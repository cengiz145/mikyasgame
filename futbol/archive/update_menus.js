const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace league-select-container
const leagueSelectOldStart = '<div id="league-select-container" class="menu-container">';
const countrySelectStart = '<!-- COUNTRY SELECT (World Stars etc) -->';

let startIndex = html.indexOf(leagueSelectOldStart);
let endIndex = html.indexOf(countrySelectStart);

if (startIndex !== -1 && endIndex !== -1) {
    let oldLeagueSelect = html.substring(startIndex, endIndex);
    let newLeagueSelect = `<div id="league-select-container" class="menu-container">
        <h1 style="color: #f1c40f;">Lig Seçimi</h1>
        <div id="tr-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
            <button id="btn-league-superlig" class="menu-button" style="background-color: #27ae60; width: 300px;">Trendyol Süper Lig</button>
            <button id="btn-league-tff1" class="menu-button" style="background-color: #8e44ad; width: 300px;">Trendyol 1. Lig</button>
        </div>
        <div id="es-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
            <button id="btn-league-laliga" class="menu-button" style="background-color: #d35400; width: 300px;">🇪🇸 La Liga</button>
        </div>
        <div id="it-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
            <button id="btn-league-seriea" class="menu-button" style="background-color: #2980b9; width: 300px;">🇮🇹 Serie A</button>
            <button id="btn-league-serieb" class="menu-button" style="background-color: #7f8c8d; width: 300px; opacity: 0.7;">Serie B (Yakında)</button>
        </div>
        <div id="eng-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
             <button id="btn-league-premier" class="menu-button" style="background-color: #2980b9; width: 300px;">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (Yakında)</button>
        </div>
        <div id="de-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
             <button id="btn-league-bundesliga" class="menu-button" style="background-color: #2980b9; width: 300px;">🇩🇪 Bundesliga (Yakında)</button>
        </div>
        <div id="fr-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
             <button id="btn-league-ligue1" class="menu-button" style="background-color: #2980b9; width: 300px;">🇫🇷 Ligue 1 (Yakında)</button>
        </div>
        <div id="nl-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
             <button id="btn-league-hollanda" class="menu-button" style="background-color: #2980b9; width: 300px;">🇳🇱 Eredivisie (Yakında)</button>
        </div>
        <div id="br-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
             <button id="btn-league-brezilya" class="menu-button" style="background-color: #2980b9; width: 300px;">🇧🇷 Serie A (Yakında)</button>
        </div>
        <div id="pt-leagues" style="display: none; flex-direction: column; gap: 15px; margin-top: 30px; align-items: center;">
             <button id="btn-league-portekiz" class="menu-button" style="background-color: #2980b9; width: 300px;">🇵🇹 Primeira Liga (Yakında)</button>
        </div>
        <button id="btn-back-league" class="menu-button" style="background-color: #555; width: 300px; margin-top: 20px;">Geri</button>
    </div>
    
    `;
    
    html = html.replace(oldLeagueSelect, newLeagueSelect);
    console.log("League select container updated.");
}

// 2. Add Team Select Container right after country-select-container ends
const mainMenuStart = '<!-- MAIN MENU -->';
if (html.indexOf('<div id="team-select-container"') === -1) {
    let teamSelectHTML = `<!-- TEAM SELECT -->
    <div id="team-select-container" class="menu-container" role="presentation" aria-hidden="true" style="display: none;">
        <h1 id="team-select-title" tabindex="-1" style="outline: none; color:#f1c40f;">Takımınızı Seçin</h1>
        <div id="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; width: 80%; max-height: 60vh; overflow-y: auto; margin-top: 20px; padding: 10px;">
            <!-- JS ile doldurulacak -->
        </div>
        <button id="btn-back-team" class="menu-button" style="margin-top: 30px; background-color: #555;">Geri Dön</button>
    </div>
    
    `;
    
    html = html.replace(mainMenuStart, teamSelectHTML + mainMenuStart);
    console.log("Team select container added.");
}

// 3. Rename btn-squad to btn-squad-view
html = html.replace('<button id="btn-squad"', '<button id="btn-squad-view"');
console.log("Renamed btn-squad to btn-squad-view");

// 4. Add placeholders for missing containers right before GAME CONTAINER
const gameContainerStart = '<!-- GAME CONTAINER -->';
if (html.indexOf('<div id="fixture-container"') === -1) {
    let placeholdersHTML = `
    <!-- STANDINGS CONTAINER -->
    <div id="standings-container" class="menu-container">
        <h1 style="color: #f1c40f;">Puan Durumu</h1>
        <div id="standings-content" style="width: 100%; max-width: 800px; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
            Puan durumu yükleniyor...
        </div>
        <button id="btn-back-standings" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    <!-- FIXTURE CONTAINER -->
    <div id="fixture-container" class="menu-container">
        <h1 style="color: #f1c40f;">Fikstür</h1>
        <div id="fixture-content" style="width: 100%; max-width: 800px; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
            Fikstür yükleniyor...
        </div>
        <button id="btn-back-fixture" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    <!-- MEDICAL CENTER CONTAINER -->
    <div id="medical-center-container" class="menu-container">
        <h1 style="color: #f1c40f;">Sağlık Merkezi</h1>
        <div id="medical-content" style="width: 100%; max-width: 800px; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
            Sağlık merkezi yükleniyor...
        </div>
        <button id="btn-back-medical" class="menu-button" style="background-color: #555; margin-top: 20px;">Geri</button>
    </div>

    `;
    
    html = html.replace(gameContainerStart, placeholdersHTML + gameContainerStart);
    console.log("Placeholders added.");
}

fs.writeFileSync('index.html', html, 'utf8');
console.log("index.html successfully updated!");

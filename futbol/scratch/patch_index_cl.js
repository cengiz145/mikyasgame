const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// 1. Add "Avrupa (Şampiyonlar Ligi)" button
const rankBtnRegex = /<button id="btn-world-ranking" class="menu-button" style="background-color: #8e44ad;">Dünya Sıralaması<\/button>/;
const rankBtnRepl = `<button id="btn-world-ranking" class="menu-button" style="background-color: #8e44ad;">Dünya Sıralaması</button>
            <button id="btn-europe" class="menu-button" style="background-color: #f1c40f; color: black; font-weight: bold; border: 2px solid #f39c12;">🌍 Avrupa Ligi</button>`;
htmlContent = htmlContent.replace(rankBtnRegex, rankBtnRepl);

// 2. Add Champions League Modal/Container
const modalsEndRegex = /<!-- \/Tesis Modal -->/i; // Let's check where to put it. Let's just put it before the closing body tag.
const bodyEndRegex = /<script src="js\/menu\.js"><\/script>/i;

const clModalHtml = `
    <!-- CHAMPIONS LEAGUE MODAL -->
    <div id="europe-container" class="menu-container" style="display:none; text-align:center;">
        <h1 tabindex="-1" style="color: #f1c40f;">🌍 Avrupa Şampiyonlar Ligi</h1>
        <p style="color: #ecf0f1; font-size: 1.2rem;" id="cl-status-text">Grup aşamaları başlıyor...</p>
        
        <div id="cl-groups-wrapper" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-top: 20px;">
            <!-- Gruplar js ile buraya yüklenecek -->
        </div>
        
        <button class="menu-button" style="background-color: #e74c3c; width: 100%; max-width: 300px; margin-top: 20px;" onclick="showContainer('main-menu-container')">Geri Dön</button>
    </div>

    <script src="js/champions_league.js"></script>
    <script src="js/menu.js"></script>
`;
htmlContent = htmlContent.replace(bodyEndRegex, clModalHtml.trim());
fs.writeFileSync(indexPath, htmlContent, 'utf8');
console.log("index.html patched with Europe UI.");

const fs = require('fs');

// 1. Patch scout.js
let scoutContent = fs.readFileSync('js/scout.js', 'utf8');
scoutContent = scoutContent.replace(/scout-center-container/g, 'scout-container');
fs.writeFileSync('js/scout.js', scoutContent, 'utf8');
console.log("scout.js patched.");

// 2. Patch index.html medical center
let htmlContent = fs.readFileSync('index.html', 'utf8');
const oldMedical = `        <div id="medical-content" style="width: 100%; max-width: 800px; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
            Sağlık merkezi yükleniyor...
        </div>`;
const newMedical = `        <div id="medical-content" style="width: 100%; max-width: 800px; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
            <h3 style="color: #e74c3c;">Sakat Oyuncular</h3>
            <ul id="injured-players-list" style="list-style:none; padding:0;">Sakat oyuncu bulunmuyor.</ul>
            <h3 style="color: #3498db; margin-top: 20px;">Psikolog Desteği</h3>
            <button id="btn-start-psychology-sessions" class="menu-button" style="background-color: #3498db; width: 100%;">Tüm Takım İçin Toplu Terapi Düzenle (-50.000€)</button>
        </div>`;

if (htmlContent.includes(oldMedical)) {
    htmlContent = htmlContent.replace(oldMedical, newMedical);
    fs.writeFileSync('index.html', htmlContent, 'utf8');
    console.log("medical center patched.");
}

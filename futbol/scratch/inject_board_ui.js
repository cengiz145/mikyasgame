const fs = require('fs');

// 1. Update index.html
let htmlContent = fs.readFileSync('index.html', 'utf8');
let targetHtml = `<div id="calendar-display" style="color: #ecf0f1; font-size: 1.2rem; margin-bottom: 20px;">Tarih: Yükleniyor...</div>`;
let replaceHtml = `<div id="calendar-display" style="color: #ecf0f1; font-size: 1.2rem; margin-bottom: 10px;">Tarih: Yükleniyor...</div>
        <div id="board-trust-display" style="color: #e74c3c; font-size: 1.2rem; margin-bottom: 20px; font-weight: bold;">Başkan (Vizyoner) Güveni: %80 (Güvende)</div>`;

if (!htmlContent.includes('board-trust-display')) {
    htmlContent = htmlContent.replace(targetHtml, replaceHtml);
    fs.writeFileSync('index.html', htmlContent, 'utf8');
    console.log("index.html updated with board-trust-display!");
}

// 2. Update manager.js to include updateBoardUI and call it
let managerContent = fs.readFileSync('js/manager.js', 'utf8');

if (!managerContent.includes('window.updateBoardUI')) {
    let targetStatus = `    getTrustStatus: function() {`;
    let replaceStatus = `    updateBoardUI: function() {
        let display = document.getElementById('board-trust-display');
        if (display) {
            let status = this.getTrustStatus();
            let profile = window.presidentProfile || "VİZYONER";
            display.textContent = \`Başkan (\${profile}) Güveni: %\${Math.round(window.boardTrust)} (\${status})\`;
            
            if (window.boardTrust > 60) display.style.color = "#2ecc71";
            else if (window.boardTrust > 30) display.style.color = "#f39c12";
            else display.style.color = "#e74c3c";
        }
    },
    getTrustStatus: function() {`;
    managerContent = managerContent.replace(targetStatus, replaceStatus);
    
    // Add window.updateBoardUI binding
    managerContent += `\nwindow.updateBoardUI = () => { if(window.boardEngine && window.boardEngine.updateBoardUI) window.boardEngine.updateBoardUI(); };\n`;
    fs.writeFileSync('js/manager.js', managerContent, 'utf8');
    console.log("manager.js updated with updateBoardUI!");
}

// 3. Update scout.js to call updateBoardUI daily
let scoutContent = fs.readFileSync('js/scout.js', 'utf8');
let targetScout = `    if (calDisplay) calDisplay.textContent = \`📅 Takvim: \${formatDate()}\`;`;
let replaceScout = `    if (calDisplay) calDisplay.textContent = \`📅 Takvim: \${formatDate()}\`;
    if (typeof window.updateBoardUI === 'function') window.updateBoardUI();`;

if (!scoutContent.includes('window.updateBoardUI')) {
    scoutContent = scoutContent.replace(targetScout, replaceScout);
    fs.writeFileSync('js/scout.js', scoutContent, 'utf8');
    console.log("scout.js updated to call updateBoardUI!");
}

const fs = require('fs');

// 1. Patch menu.js
let menuContent = fs.readFileSync('js/menu.js', 'utf8');

menuContent = menuContent.replace(
    /settingsBtn.addEventListener('click', () => {s*alert("Ayarlar menüsü yakında eklenecek.");s*});/g,
    "settingsBtn.addEventListener('click', () => { document.getElementById('settings-modal').style.display = 'flex'; });"
);
// fallback for utf-8 mismatch or different quotes
menuContent = menuContent.replace(
    /settingsBtn.addEventListener('click', () => {s*alert("Ayarlar menǬsǬ yaknda eklenecek.");s*});/g,
    "settingsBtn.addEventListener('click', () => { document.getElementById('settings-modal').style.display = 'flex'; });"
);

// one more fallback regex
menuContent = menuContent.replace(/alert(["']Ayarlar[^"']*["']);/g, "document.getElementById('settings-modal').style.display = 'flex';");

fs.writeFileSync('js/menu.js', menuContent, 'utf8');
console.log("menu.js patched.");

// 2. Patch index.html
let htmlContent = fs.readFileSync('index.html', 'utf8');

const settingsModalHtml = `
    <!-- AYARLAR MODAL -->
    <div id="settings-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 5000; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
        <div style="background: rgba(30,30,40,0.95); padding: 40px; border-radius: 15px; border: 2px solid #8e44ad; box-shadow: 0 0 30px rgba(142,68,173,0.5); width: 400px; text-align: center;">
            <h2 style="color: #f1c40f; margin-bottom: 25px; border-bottom: 1px solid #555; padding-bottom: 10px;">OYUN AYARLARI</h2>
            
            <div style="margin-bottom: 20px; text-align: left;">
                <label style="color: white; font-size: 1.1rem; display: block; margin-bottom: 8px;">Spiker (Sesli Anlatım):</label>
                <select id="setting-announcer" style="width: 100%; padding: 10px; background: #2c3e50; color: white; border: 1px solid #8e44ad; border-radius: 5px;">
                    <option value="on">Açık</option>
                    <option value="off">Kapalı</option>
                </select>
            </div>

            <div style="margin-bottom: 20px; text-align: left;">
                <label style="color: white; font-size: 1.1rem; display: block; margin-bottom: 8px;">Stadyum Sesleri:</label>
                <select id="setting-crowd" style="width: 100%; padding: 10px; background: #2c3e50; color: white; border: 1px solid #8e44ad; border-radius: 5px;">
                    <option value="on">Açık</option>
                    <option value="off">Kapalı</option>
                </select>
            </div>

            <div style="margin-bottom: 30px; text-align: left;">
                <label style="color: white; font-size: 1.1rem; display: block; margin-bottom: 8px;">Maç Hızı (Yakında):</label>
                <select id="setting-speed" style="width: 100%; padding: 10px; background: #2c3e50; color: white; border: 1px solid #8e44ad; border-radius: 5px;" disabled>
                    <option value="normal">Normal (1x)</option>
                    <option value="fast">Hızlı (1.5x)</option>
                </select>
            </div>

            <button onclick="saveSettings()" class="menu-button" style="background: #27ae60; width: 100%;">Kaydet ve Kapat</button>
        </div>
    </div>
    
    <script>
        function saveSettings() {
            const announcer = document.getElementById('setting-announcer').value;
            const crowd = document.getElementById('setting-crowd').value;
            
            window.speechEnabled = (announcer === 'on');
            if (window.audioEngine) {
                window.audioEngine.crowdEnabled = (crowd === 'on');
                if(!window.audioEngine.crowdEnabled && window.audioEngine.crowdGainNode) {
                    window.audioEngine.crowdGainNode.gain.value = 0;
                }
            }
            
            // Override speak
            const originalSpeak = window.speak;
            window.speak = function(text, priority = false) {
                if(!window.speechEnabled && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel(); 
                    // Update UI text only
                    const uiText = document.getElementById('announcer-text');
                    if (uiText) uiText.textContent = text;
                    const liveRegion = document.getElementById('live-announcer');
                    if (liveRegion) liveRegion.textContent = text;
                    return; 
                }
                originalSpeak(text, priority);
            };

            document.getElementById('settings-modal').style.display = 'none';
        }
    </script>
`;

if (!htmlContent.includes('id="settings-modal"')) {
    htmlContent = htmlContent.replace('</body>', settingsModalHtml + 'n</body>');
    fs.writeFileSync('index.html', htmlContent, 'utf8');
    console.log("index.html patched with settings modal.");
} else {
    console.log("settings modal already exists.");
}


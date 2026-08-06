const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Eski kopya modalı sil (Eski kodda class="modal" olan kısım)
const oldModalRegex = /<div id="president-briefing-modal" class="modal">[\s\S]*?<\/div>\s*<\/div>/;
html = html.replace(oldModalRegex, '');

// 2. Yeni aktif modalı bul ve daha iyi diyalog + erişilebilirlik ile değiştir
const activeModalRegex = /<div id="president-briefing-modal"\s*style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba\(0,0,0,0\.95\); z-index: 20000; justify-content: center; align-items: center; flex-direction: column;"\s*role="dialog" aria-modal="true">[\s\S]*?Anlaşıldı Başkanım \(Devam Et\)<\/button>\s*<\/div>\s*<\/div>/;

const newModalHTML = `<div id="president-briefing-modal"
        style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 20000; justify-content: center; align-items: center; flex-direction: column;"
        role="dialog" aria-modal="true">
        <div style="background: linear-gradient(145deg, #2c3e50, #1a252f); border: 4px solid #f1c40f; border-radius: 12px; padding: 30px; width: 90%; max-width: 600px; text-align: center; box-shadow: 0 0 40px rgba(241, 196, 15, 0.4);">
            <div style="font-size: 5rem; margin-bottom: 10px;" aria-hidden="true">👔</div>
            <h2 tabindex="-1" style="color: #f1c40f; font-size: 2rem; margin-bottom: 20px;">Başkanın Odası</h2>
            <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px; border-left: 5px solid #f1c40f; text-align: left; margin-bottom: 25px;">
                <p tabindex="0" style="color: #ecf0f1; font-size: 1.2rem; line-height: 1.6; font-style: italic; outline: none;">
                    "Hocam kulübümüze hoşgeldin. Ligin başlamasına 15 gün var. Yaz transfer sezonu an itibariyle açıldı ve ligin 3. haftasına kadar sürecek.<br><br>
                    Eksiklerini tamamla, bütçeni idareli kullan ve takımı ilk maça hazırla. Arkanda devasa bir camia var, güvenim sana tam. Başarılar dilerim!"
                </p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button class="menu-button" style="background-color: #27ae60; font-size: 1.1rem; padding: 12px;" onclick="window.closePresidentBriefing()">"Merak etmeyin Başkanım, şampiyonluk için savaşacağız."</button>
                <button class="menu-button" style="background-color: #2980b9; font-size: 1.1rem; padding: 12px;" onclick="window.closePresidentBriefing()">"Bütçemizi dikkatli kullanıp takımı adım adım büyüteceğiz."</button>
                <button class="menu-button" style="background-color: #e67e22; font-size: 1.1rem; padding: 12px;" onclick="window.closePresidentBriefing()">"Taraftarımızla birlikte bu sezon destan yazacağız!"</button>
            </div>
        </div>
    </div>`;

html = html.replace(activeModalRegex, newModalHTML);

fs.writeFileSync('index.html', html, 'utf8');
console.log('President modal updated successfully');

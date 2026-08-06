const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const dialogueStart = '<!-- DIALOGUE MODAL -->';
const presidentBriefingStart = '<!-- PRESIDENT BRIEFING -->';

let startIndex = html.indexOf(dialogueStart);
let endIndex = html.indexOf(presidentBriefingStart);

if (startIndex !== -1 && endIndex !== -1) {
    let oldDialogueHTML = html.substring(startIndex, endIndex);
    let newDialogueHTML = `<!-- DIALOGUE MODAL -->
    <div id="dialogue-overlay" class="modal" role="dialog" style="align-items: flex-end; padding-bottom: 20px;">
        <div id="dialogue-box" style="background: rgba(20, 25, 30, 0.95); border: 2px solid #3498db; border-radius: 20px; padding: 0; width: 450px; height: 80vh; max-height: 800px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            
            <!-- Chat Header -->
            <div style="background: #2980b9; padding: 15px; text-align: center; border-bottom: 1px solid #1f618d; display: flex; align-items: center; justify-content: center;">
                <h2 id="chat-header-title" style="color: white; margin: 0; font-size: 1.4rem; font-weight: bold;">Gelen Kutusu</h2>
            </div>
            
            <!-- Chat History -->
            <div id="chat-history" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: url('https://www.transparenttextures.com/patterns/cubes.png');">
                <!-- Mesaj baloncuklari dinamik olarak eklenecek -->
            </div>
            
            <!-- Chat Input Area -->
            <div style="background: rgba(0,0,0,0.8); padding: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                <div id="dialogue-choices" style="display: flex; flex-direction: column; gap: 10px;"></div>
                <button id="btn-dialogue-next" class="menu-button hidden" style="margin-top: 0; width: 100%; background: #27ae60; border-radius: 20px; padding: 12px; font-size: 1.1rem;">Mesajı Oku / Devam Et</button>
            </div>
        </div>
    </div>

    `;
    
    html = html.replace(oldDialogueHTML, newDialogueHTML);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Dialogue modal successfully updated to chat box UI!");
} else {
    console.log("Could not find dialogue modal boundaries in index.html.");
}

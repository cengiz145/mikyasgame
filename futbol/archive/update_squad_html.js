const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const squadStart = '<!-- SQUAD CONTAINER -->';
const squadEnd = '<!-- TRAINING CONTAINER -->';

let startIndex = html.indexOf(squadStart);
let endIndex = html.indexOf(squadEnd);

if (startIndex !== -1 && endIndex !== -1) {
    let oldSquadContainer = html.substring(startIndex, endIndex);
    let newSquadContainer = `<!-- SQUAD CONTAINER -->
    <div id="squad-container" class="menu-container">
        <h1 style="color: #f1c40f;">Kadro Yönetimi</h1>
        <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
            <label style="color: white; font-size: 1.2rem;">Taktik Diziliş:</label>
            <select id="formation-select" style="padding: 10px; font-size: 1.1rem; background: #34495e; color: white; border: 1px solid #f1c40f; border-radius: 8px;">
                <option value="4-4-2">4-4-2</option>
                <option value="4-3-3">4-3-3</option>
                <option value="3-5-2">3-5-2</option>
                <option value="4-2-3-1">4-2-3-1</option>
                <option value="5-3-2">5-3-2</option>
            </select>
        </div>
        
        <div style="display: flex; gap: 30px; width: 100%; max-width: 1000px; justify-content: center;">
            <div style="flex: 1; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px; border: 2px solid #2ecc71;">
                <h2 style="color: #2ecc71; text-align: center;">İlk 11</h2>
                <ul id="formation-slots" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px;"></ul>
            </div>
            <div style="flex: 1; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px; border: 2px solid #e74c3c;">
                <h2 style="color: #e74c3c; text-align: center;">Yedekler</h2>
                <ul id="sub-slots" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px;"></ul>
            </div>
        </div>
        
        <button id="btn-back-squad" class="menu-button" style="background-color: #555; margin-top: 30px; width: 300px;">Geri Dön</button>
    </div>

    `;
    
    html = html.replace(oldSquadContainer, newSquadContainer);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Squad container updated with formation slots!");
} else {
    console.log("Could not find squad container limits.");
}

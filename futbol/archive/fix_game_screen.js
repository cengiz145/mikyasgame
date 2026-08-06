const fs = require('fs');

let indexContent = fs.readFileSync('index.html', 'utf8');

// The original game screen was something like:
const gameScreenHTML = `
      <div id="game-container" class="menu-container" style="background-color: #1a252f; display: none; padding: 20px; align-items: center; justify-content: flex-start;">
          <h1 style="color: #f1c40f; text-align: center; margin-bottom: 10px; font-size: 2.5rem; text-shadow: 0 0 10px rgba(241,196,15,0.5);">CANLI MAÇ</h1>
          
          <div id="score-board" style="display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 15px; font-size: 3.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
              <span id="home-team-name" style="font-size: 2rem; color: #ecf0f1; width: 250px; text-align: right;">Ev Sahibi</span>
              <div style="background: rgba(0,0,0,0.6); padding: 10px 30px; border-radius: 15px; border: 2px solid #34495e; color: #f1c40f;">
                  <span id="score-home">0</span> - <span id="score-away">0</span>
              </div>
              <span id="away-team-name" style="font-size: 2rem; color: #ecf0f1; width: 250px; text-align: left;">Deplasman</span>
          </div>

          <div id="time-board" style="font-size: 2.5rem; color: #e74c3c; margin-bottom: 20px; font-weight: bold; background: rgba(0,0,0,0.5); padding: 5px 20px; border-radius: 10px; border: 1px solid #c0392b;">
              00:00
          </div>
          
          <div style="display: flex; flex-direction: row; gap: 20px; width: 100%; max-width: 1000px; justify-content: center;">
              <!-- Maç Sahası (Canvas) -->
              <div style="border: 3px solid #27ae60; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); background: #2ecc71; position: relative;">
                  <canvas id="game-canvas" width="600" height="400" style="display: block;"></canvas>
                  
                  <!-- YEDEK OYUNCU DEĞİŞİKLİĞİ MODALI (Canvas Üzerinde) -->
                  <div id="sub-modal" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:100; flex-direction:column; padding:20px; box-sizing:border-box;">
                      <h3 style="color:#f1c40f; text-align:center; margin-bottom:15px; font-size:1.5rem;">Oyuncu Değişikliği</h3>
                      <div style="display:flex; justify-content:space-between; flex:1; gap:15px;">
                          <div style="flex:1; background:rgba(255,255,255,0.1); border-radius:8px; padding:10px; overflow-y:auto;">
                              <h4 style="color:#e74c3c; text-align:center; margin-bottom:10px;">Çıkan Oyuncu (Saha)</h4>
                              <ul id="sub-pitch-list" style="list-style:none; padding:0; margin:0;"></ul>
                          </div>
                          <div style="flex:1; background:rgba(255,255,255,0.1); border-radius:8px; padding:10px; overflow-y:auto;">
                              <h4 style="color:#2ecc71; text-align:center; margin-bottom:10px;">Giren Oyuncu (Yedek)</h4>
                              <ul id="sub-bench-list" style="list-style:none; padding:0; margin:0;"></ul>
                          </div>
                      </div>
                      <div style="text-align:center; margin-top:15px;">
                          <button id="btn-sub-confirm" class="menu-button" style="background:#27ae60; margin-right:10px; padding:10px 20px; font-size:1.1rem;">Değişikliği Onayla</button>
                          <button class="menu-button" style="background:#c0392b; padding:10px 20px; font-size:1.1rem;" onclick="document.getElementById('sub-modal').style.display='none'">İptal</button>
                      </div>
                  </div>
              </div>
              
              <!-- Spiker Metni -->
              <div style="display: flex; flex-direction: column; gap: 15px; width: 350px;">
                  <div id="announcer-text" style="flex: 1; background: rgba(0,0,0,0.6); padding: 15px; border-radius: 10px; border: 2px solid #34495e; color: #ecf0f1; font-size: 1.1rem; line-height: 1.5; overflow-y: auto;">
                      Spiker maçın başlamasını bekliyor...
                  </div>
                  <div style="display: flex; gap: 10px; justify-content: space-between;">
                      <button id="btn-pause-sub" class="menu-button" style="background-color: #f39c12; flex: 1; padding: 10px; font-size: 1rem;">Durdur / Oyuncu Değiştir</button>
                      <button id="btn-mute" class="menu-button" style="background-color: #34495e; flex: 1; padding: 10px; font-size: 1rem;">Sesi Kapat</button>
                  </div>
              </div>
          </div>
      </div>
`;

// Replace existing game-container with the full one
const startStr = '<div id="game-container" class="menu-container" style="background-color: #1a252f;">';
const startIndex = indexContent.indexOf(startStr);

if (startIndex !== -1) {
    const endStr = '<div id="player-profile-modal" class="modal hidden">';
    const endIndex = indexContent.indexOf(endStr);
    
    if (endIndex !== -1) {
        indexContent = indexContent.substring(0, startIndex) + gameScreenHTML + indexContent.substring(endIndex);
        fs.writeFileSync('index.html', indexContent, 'utf8');
        console.log('Fixed game container');
    } else {
        console.log('End index not found');
    }
} else {
    console.log('Start index not found');
}

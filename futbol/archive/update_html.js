const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newModal = `    <div id="player-profile-modal" class="modal hidden">
        <div class="modal-content glass-panel player-profile-content" style="max-width: 650px; padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
            <span class="close-btn" onclick="closePlayerProfile()" style="position: absolute; right: 15px; top: 15px; z-index: 10; color: white; text-shadow: 0 0 5px rgba(0,0,0,0.5);">&times;</span>
            
            <div class="cv-header" style="display: flex; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 30px 25px; position: relative;">
                <div class="cv-avatar-container" style="width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 50px; color: white; border: 3px solid rgba(255,255,255,0.4); position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <i id="pp-avatar-icon" class="fas fa-user"></i>
                </div>
                <div class="cv-basic-info" style="margin-left: 20px; color: white; display: flex; flex-direction: column; justify-content: center;">
                    <h2 id="pp-name" style="margin: 0 0 5px 0; font-size: 1.8rem; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">Oyuncu Adı</h2>
                    <p class="cv-subtitle" style="margin: 0 0 10px 0; opacity: 0.9; font-size: 1.05rem;">
                        <span id="pp-age">25</span> Yaş | 
                        <strong id="pp-position" style="color: #f1c40f;">Forvet</strong> |
                        <span id="pp-team">Galatasaray</span>
                    </p>
                    <div class="cv-market-value" style="background: rgba(0,0,0,0.4); padding: 5px 15px; border-radius: 20px; display: inline-block; font-size: 0.95rem; border: 1px solid rgba(255,255,255,0.1); width: fit-content; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                        Piyasa Değeri: <strong id="pp-market-value" style="color: #2ecc71; font-size: 1.2rem; margin-left: 5px;">-</strong>
                    </div>
                </div>
            </div>

            <div class="cv-tabs" style="display: flex; background: #1a252f; border-bottom: 2px solid #2c3e50;">
                <button id="tab-btn-genel" class="cv-tab-btn active" onclick="switchCVTab('genel')" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.05); border: none; color: white; cursor: pointer; border-bottom: 3px solid #3498db; font-weight: bold; transition: 0.3s; font-size: 1rem;"><i class="fas fa-id-card"></i> Genel Bakış</button>
                <button id="tab-btn-istatistik" class="cv-tab-btn" onclick="switchCVTab('istatistik')" style="flex: 1; padding: 15px; background: transparent; border: none; color: #95a5a6; cursor: pointer; border-bottom: 3px solid transparent; transition: 0.3s; font-size: 1rem;"><i class="fas fa-chart-bar"></i> İstatistikler</button>
                <button id="tab-btn-kariyer" class="cv-tab-btn" onclick="switchCVTab('kariyer')" style="flex: 1; padding: 15px; background: transparent; border: none; color: #95a5a6; cursor: pointer; border-bottom: 3px solid transparent; transition: 0.3s; font-size: 1rem;"><i class="fab fa-wikipedia-w"></i> Kariyer</button>
            </div>

            <div class="cv-body" style="padding: 25px; background: rgba(20, 30, 40, 0.98);">
                <!-- TAB 1: Genel Bakış -->
                <div id="cv-tab-genel" class="cv-tab-content" style="display: block;">
                    <div class="profile-stats-grid">
                        <div class="stat-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                            <span class="stat-label">Güç</span>
                            <span class="stat-value" id="pp-power" style="color: #3498db;">80</span>
                        </div>
                        <div class="stat-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                            <span class="stat-label">Hız</span>
                            <span class="stat-value" id="pp-speed">3.5</span>
                        </div>
                        <div class="stat-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                            <span class="stat-label">Mental</span>
                            <span class="stat-value" id="pp-mental" style="font-size: 1rem;">Yaratıcı</span>
                        </div>
                        <div class="stat-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                            <span class="stat-label">Rol</span>
                            <span class="stat-value" id="pp-role" style="font-size: 1rem;">Poacher</span>
                        </div>
                        <div class="stat-box" style="background: rgba(241, 196, 15, 0.15); border: 1px solid rgba(241, 196, 15, 0.5);">
                            <span class="stat-label" style="color:#f1c40f;">Form Puanı</span>
                            <span class="stat-value" id="pp-rating" style="color:#f1c40f;">-</span>
                        </div>
                    </div>
                    <div class="contract-section" style="margin-top: 25px; background: rgba(0,0,0,0.4); padding: 15px 20px; border-radius: 8px; border-left: 4px solid #9b59b6;">
                        <h3 style="margin: 0 0 8px 0; color: #9b59b6; font-size: 1.1rem;"><i class="fas fa-file-signature"></i> Sözleşme Durumu</h3>
                        <p style="margin: 0; color: #ecf0f1; font-size: 1rem;">Kalan Süre: <strong id="pp-contract-years" style="color: white; font-size: 1.1rem;">2 Yıl</strong></p>
                        <p class="contract-details" id="pp-contract-details" style="margin: 5px 0 0 0; font-size: 0.9rem; color: #95a5a6;">
                            Sözleşmesi sezon sonunda bitecek.
                        </p>
                    </div>
                    <div class="profile-actions" id="pp-actions-container" style="margin-top: 20px; display: flex; gap: 10px;">
                        <!-- Actions injected here -->
                    </div>
                </div>

                <!-- TAB 2: İstatistikler -->
                <div id="cv-tab-istatistik" class="cv-tab-content" style="display: none;">
                    <h3 style="color: #3498db; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-trophy"></i> Sezon Performansı (Lig)</h3>
                    <div style="display: flex; justify-content: space-between; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                        <div style="flex: 1;">
                            <div style="font-size: 2.5rem; color: white; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" id="pp-stat-matches">0</div>
                            <div style="color: #bdc3c7; font-size: 0.95rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Maç</div>
                        </div>
                        <div style="flex: 1; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
                            <div style="font-size: 2.5rem; color: #2ecc71; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" id="pp-stat-goals">0</div>
                            <div style="color: #bdc3c7; font-size: 0.95rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Gol</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 2.5rem; color: #f1c40f; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" id="pp-stat-assists">0</div>
                            <div style="color: #bdc3c7; font-size: 0.95rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Asist</div>
                        </div>
                    </div>
                </div>

                <!-- TAB 3: Kariyer (Wikipedia) -->
                <div id="cv-tab-kariyer" class="cv-tab-content" style="display: none;">
                    <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <h3 style="color: #ecf0f1; margin: 0 0 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;"><i class="fab fa-wikipedia-w" style="color: #bdc3c7;"></i> Özgeçmiş</h3>
                        <div id="pp-cv-text" style="color: #ecf0f1; line-height: 1.7; font-size: 1rem;">
                            <span style="opacity: 0.7; font-style: italic;">Wikipedia bilgileri yükleniyor...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

let oldModalStart = html.indexOf('<div id="player-profile-modal"');
let nextModalStart = html.indexOf('<!-- SATIN ALMA MODALI -->');
let oldModal = html.substring(oldModalStart, nextModalStart);

html = html.replace(oldModal, newModal + '\n\n    ');
fs.writeFileSync('index.html', html);
console.log('Successfully updated HTML modal');

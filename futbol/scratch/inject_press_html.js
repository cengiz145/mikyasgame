const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const pressModalHtml = `
    <!-- BASIN TOPLANTISI MODAL -->
    <div id="press-conference-modal"
        style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 21000; justify-content: center; align-items: center; flex-direction: column;"
        role="dialog" aria-modal="true">
        <div style="background: linear-gradient(145deg, #1e272e, #2f3640); border: 4px solid #e1b12c; border-radius: 12px; padding: 30px; width: 90%; max-width: 700px; text-align: center; box-shadow: 0 0 40px rgba(225, 177, 44, 0.4);">
            <div style="font-size: 5rem; margin-bottom: 10px;" aria-hidden="true">🎙️📸</div>
            <h2 tabindex="-1" style="color: #e1b12c; font-size: 2rem; margin-bottom: 20px;">Maç Sonu Basın Toplantısı</h2>
            <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px; border-left: 5px solid #e1b12c; text-align: left; margin-bottom: 25px;">
                <p id="press-conference-text" tabindex="0" style="color: #f5f6fa; font-size: 1.2rem; line-height: 1.6; font-style: italic; outline: none;">
                    "Gazeteci sorusu buraya gelecek..."
                </p>
            </div>
            <div id="press-conference-choices" style="display: flex; flex-direction: column; gap: 12px;">
                <!-- Butonlar dinamik olarak js/press.js'den basılacak -->
            </div>
        </div>
    </div>
`;

// Insert modal before <!-- AYARLAR MODAL -->
if (!html.includes('id="press-conference-modal"')) {
    html = html.replace('<!-- AYARLAR MODAL -->', pressModalHtml + '\n\n    <!-- AYARLAR MODAL -->');
}

// Insert JS script before </body>
if (!html.includes('js/press.js')) {
    html = html.replace('</body>', '    <script src="js/press.js"></script>\n</body>');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with press modal and script.');

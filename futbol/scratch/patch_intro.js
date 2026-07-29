const fs = require('fs');
const path = 'c:/Users/Umit Ekrem Mikyas/Downloads/wep sitem/futbol/index.html';
let html = fs.readFileSync(path, 'utf8');

const introModalHTML = `
    <!-- GELİŞTİRİCİ İNTRO MODALI -->
    <div id="developer-intro-modal" class="modal" role="dialog" aria-modal="true" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:9999; align-items:center; justify-content:center;">
        <div style="background: #1a252f; border: 4px solid #f39c12; border-radius: 15px; padding: 40px; width: 700px; max-width: 90%; text-align: left; box-shadow: 0 0 30px #f39c12; color: #ecf0f1; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h1 style="color: #f39c12; text-align: center; font-size: 2.5rem; margin-top: 0;">BAŞ TASARIMCIDAN MESAJ VAR</h1>
            <p style="font-size: 1.1rem; line-height: 1.6;">Oyuna girmeden önce bilmen gereken bir şey var: <strong>Bu sıradan bir oyun değil.</strong></p>
            <p style="font-size: 1.1rem; line-height: 1.6;">Bu simülasyonu kurgularken, aylar boyunca gerçek futbol istatistiklerini taradım, spor tıbbı makaleleri okudum ve dünyanın en büyük menajerlik oyunlarının algoritmalarını inceledim.</p>
            
            <h3 style="color: #3498db; border-bottom: 1px solid #34495e; padding-bottom: 5px;">Mükemmellik Detaylarda Gizlidir</h3>
            <ul style="font-size: 1.05rem; line-height: 1.5; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Bir stoperin hava topuna çıkarken <strong>Kalf Kasını</strong> yırtma ihtimalini tıp makalelerindeki oranlara göre hesapladım.</li>
                <li style="margin-bottom: 10px;">VAR (Video Yardımcı Hakem) sistemini, hakemin o gergin 5 saniyesini sana iliklerine kadar hissettirmek için kare kare Canvas motoruna işledim.</li>
                <li style="margin-bottom: 10px;">Karlı havalardaki pas isabetsizliğini rastgele değil, rüzgar ve zemin sürtünme katsayılarını hesaba katarak fizik motoruna entegre ettim.</li>
            </ul>

            <p style="font-size: 1.1rem; line-height: 1.6; margin-top: 20px; font-style: italic;">"Gerçek bir menajerlik deneyimi, sahada top koşturan piksellerden değil; arka planda dönen kusursuz matematikten doğar."</p>
            <p style="text-align: right; font-weight: bold; color: #f39c12;">- Ümit Ekrem Mikyas (Baş Tasarımcı & Geliştirici)</p>
            
            <button id="btn-start-masterpiece" class="menu-button" style="background: #27ae60; font-size: 1.3rem; padding: 15px 30px; width: 100%; margin-top: 20px; border-radius: 8px; cursor: pointer; border: none; color: white; font-weight: bold;" onclick="document.getElementById('developer-intro-modal').style.display='none'">Şahesere Giriş Yap</button>
        </div>
    </div>
`;

if (!html.includes('developer-intro-modal')) {
    html = html.replace('<body id="game-application" role="application">', '<body id="game-application" role="application">\n' + introModalHTML);
    fs.writeFileSync(path, html, 'utf8');
    console.log('Intro modal injected.');
} else {
    console.log('Intro modal already exists.');
}

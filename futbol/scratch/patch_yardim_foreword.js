const fs = require('fs');
const path = 'c:/Users/Umit Ekrem Mikyas/Downloads/wep sitem/futbol/yardim.html';
let html = fs.readFileSync(path, 'utf8');

const introText = `
    <div class="card" style="border-left: 5px solid var(--warning); background-color: rgba(241, 196, 15, 0.1);">
        <h2 style="margin-top: 0; color: var(--warning);">Baş Tasarımcıdan Mesaj (Önsöz)</h2>
        <p style="font-size: 1.1rem; line-height: 1.6; font-style: italic;">Oyuna girmeden önce bilmen gereken bir şey var: <strong>Bu sıradan bir oyun değil.</strong></p>
        <p>Bu simülasyonu kurgularken, aylar boyunca gerçek futbol istatistiklerini taradım, spor tıbbı makaleleri okudum ve dünyanın en büyük menajerlik oyunlarının algoritmalarını inceledim.</p>
        
        <h3>Mükemmellik Detaylarda Gizlidir</h3>
        <p>Bu oyunun her bir ayrıntısını kurgularken şunlara dikkat ettim:</p>
        <ul>
            <li>Bir stoperin hava topuna çıkarken <strong>Kalf Kasını</strong> yırtma ihtimalini, spor tıbbı makalelerindeki gerçek oranlara göre hesapladım. Yaşlı ve yorgun bir oyuncunun Hamstring kasını koparma riski tamamen gerçek bir tıp matematiğine dayanıyor.</li>
            <li><strong>VAR (Video Yardımcı Hakem)</strong> sistemini, o gergin 5 saniyeyi sana iliklerine kadar hissettirmek için kare kare oyun motoruna işledim. Atılan her golün iptal edilme riski tıpkı gerçek hayattaki oranlarla kodlandı.</li>
            <li>Karlı veya yağmurlu havalardaki pas isabetsizliğini rastgele değil; rüzgar ve zemin sürtünme katsayılarını hesaba katarak fizik motoruna entegre ettim. Hava muhalefetinden dolayı kaybedilen şampiyonluklar bir şanssızlık değil, fizik kurallarının ta kendisidir.</li>
        </ul>
        <p style="font-size: 1.1rem; line-height: 1.6; margin-top: 20px; font-weight: bold; color: var(--accent);">"Gerçek bir menajerlik deneyimi, sahada top koşturan piksellerden değil; arka planda dönen kusursuz matematikten doğar."</p>
        <p style="text-align: right; font-weight: bold; color: var(--warning);">- Ümit Ekrem Mikyas (Baş Tasarımcı & Geliştirici)</p>
    </div>
`;

// Insert after </header>
html = html.replace('</header>', '</header>\n' + introText);

fs.writeFileSync(path, html, 'utf8');
console.log('Yardim updated with foreword.');

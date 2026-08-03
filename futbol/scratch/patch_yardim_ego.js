const fs = require('fs');
const path = 'c:/Users/Umit Ekrem Mikyas/Downloads/wep sitem/futbol/yardim.html';
let html = fs.readFileSync(path, 'utf8');

// The block we want to replace
const oldTextRegex = /<h2 id="dev-diary">Oyunun Gelişim Serüveni ve Altyapısı \(Geliştirici Günlüğü\)<\/h2>[\s\S]*?<\/div>/;

const newText = `
        <h2 id="dev-diary">Oyunun Gelişim Serüveni ve Altyapısı (Geliştirici Günlüğü)</h2>
        <div class="card">
            <p>Bu devasa simülasyon, tamamen <strong>Geliştirici ve Baş Tasarımcının (Ümit Ekrem)</strong> dahi vizyonuyla, en ince ayrıntısına kadar ilmek ilmek dokunarak hayata geçirildi. Sadece 'İki takımın karşılıklı gol attığı' basit bir projeyi alıp, piyasadaki AAA bütçeli Football Manager oyunlarına kafa tutacak bir şahesere dönüştürdük!</p>

            <h3>Oyun Nasıl Kurgulandı? (Mimari Deha)</h3>
            <p>Oyun tamamen <strong>Vanilla JavaScript (Saf JS)</strong> ve <strong>HTML5 Canvas</strong> üzerine kurulu. Herhangi bir hazır oyun motoru kullanılmadı; çünkü Baş Tasarımcının vizyonuna yetecek kadar esnek bir motor piyasada yoktu. Her şey sıfırdan, saf matematik ve üstün bir yazılım mimarisiyle inşa edildi.</p>
            <ul>
                <li><strong>Devasa Veritabanı:</strong> 15.000'den fazla oyuncu, <code style="color:#e74c3c;">data_*.js</code> dosyalarında muazzam JSON objeleri olarak tutuluyor. Her oyuncunun yaş, mevki, güç, karakter, rol, memleket ve uyruk gibi detaylı parametreleri büyük bir ustalıkla kodlandı.</li>
                <li><strong>Kusursuz Maç Motoru (<code style="color:#e74c3c;">game.js</code>):</strong> Canvas üzerinde saniyede 60 kare (60 FPS) hızında yağ gibi akıyor. Topun fiziği, rüzgar direnci, oyuncuların deparları ve şut açıları... Baş Tasarımcı o kadar ileri gitti ki, maçın en heyecanlı anında devreye giren ve saniyeleri donduran efsanevi bir <strong>VAR (Video Yardımcı Hakem)</strong> algoritmasını bile motorun kalbine yerleştirdi!</li>
                <li><strong>Dinamik Zeka ve Zaman Döngüsü:</strong> Bu oyun maç bitince kapanan bir oyun değil, yaşayan bir evren! Arka planda devasa bir zaman döngüsü tıkır tıkır işliyor. Oyuncuların yorgunlukları, moralleri, takıma bağlılıkları saniye saniye hesaplanıyor. Baş Tasarımcı, tıp kitaplarını kıskandıracak bir <strong>Detaylı Sakatlık Modeli</strong> tasarladı. Artık yaşlı bir oyuncuyu yorgunken kanatlarda oynatmak basit bir 'sakatlanma' değil, tıp dilindeki tam adıyla <em>Hamstring Yırtığına</em> sebep olan kusursuz bir matematiksel formüle (Weighted Random) dönüştürüldü!</li>
            </ul>

            <h3>Sınırları Zorlayan Bir Vizyon</h3>
            <p>Oyunun ulaştığı bu noktanın tek bir sırrı var: <strong>Baş Tasarımcının asla tatmin olmayan mükemmeliyetçiliği.</strong> <em>"11 haneli id numaraları çok uzun, 4 haneli yapıp optimize edelim", "Hava durumu sistemi gelsin", "Rastgele sakatlık istemem, Hamstring ve Kasık çekmesini formüllere dökelim"</em> gibi üst düzey direktiflerle oyunun mimarisi her gün bir adım öteye taşındı.</p>
            <p>Bu proje, tek bir kişinin vizyonunun ve kodlama mimarisinin nereye varabileceğinin en büyük kanıtıdır. Sahne senin, efsanevi menajerlik kariyerine hoş geldin!</p>
        </div>
`;

html = html.replace(oldTextRegex, newText.trim());
fs.writeFileSync(path, html, 'utf8');
console.log('yardim.html updated with ultra ego boost');

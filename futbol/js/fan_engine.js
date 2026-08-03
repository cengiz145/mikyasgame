// Taraftar Duygu Motoru (Fan Emotion Engine) - Otonom Sistem
// Bu script, tüm data_*.js dosyalarından SONRA yüklenmelidir.

(function initFanEngine() {
    if (window.leagueData && window.leagueData.teams) {
        window.leagueData.teams.forEach(t => {
            if (!t.fanProfile) {
                let name = t.name.toLowerCase();
                
                // ULTRAS (Ateşli, sabırsız, agresif kitle)
                if (name.includes('göztepe') || name.includes('kocaelispor') || name.includes('dortmund') || name.includes('amed') || name.includes('trabzonspor') || name.includes('ankaragücü') || name.includes('marsilya') || name.includes('napoli')) {
                    t.fanProfile = 'ultras';
                } 
                // BÜYÜK KİTLE (Yarı Ultras, yarı çekirdekçi - başarı odaklı ama kırılgan)
                else if (name.includes('galatasaray') || name.includes('fenerbahçe') || name.includes('beşiktaş') || name.includes('roma') || name.includes('bologna')) {
                    t.fanProfile = Math.random() < 0.5 ? 'cekirdekci' : 'ultras';
                } 
                // İYİ GÜN TARAFTARI (Başarıya doymuş, beklentisi çok yüksek, hemen homurdanan kitle)
                else if (name.includes('real madrid') || name.includes('manchester city') || name.includes('psg') || name.includes('bayern')) {
                    t.fanProfile = 'glory_hunters';
                } 
                // ANALİST & TAKTİK SEVDALILARI (Veriye önem veren, sabırlı ama oyun kalitesi arayan kitle)
                else if (name.includes('arsenal') || name.includes('brighton') || name.includes('bayer leverkusen') || name.includes('basaksehir') || name.includes('ajax')) {
                    t.fanProfile = 'analist';
                } 
                // OYUNCU FANATİĞİ (Takımdan çok yıldız oyuncuları takip eden popüler kültür kitlesi)
                else if (name.includes('al-nassr') || name.includes('inter miami') || name.includes('manchester utd') || name.includes('inter')) {
                    t.fanProfile = 'oyuncu_fanatigi';
                } 
                // NOSTALJİK & GELENEKSEL (Eski kafalı, mücadele seven, kemik kitle)
                else if (name.includes('genclerbirligi') || name.includes('konyaspor') || name.includes('como') || name.includes('bodo') || name.includes('everton')) {
                    t.fanProfile = 'nostaljik';
                } 
                // DİĞER (Rastgele dağılım)
                else {
                    let profiles = ['ultras', 'cekirdekci', 'analist', 'glory_hunters', 'oyuncu_fanatigi', 'nostaljik'];
                    t.fanProfile = profiles[Math.floor(Math.random() * profiles.length)];
                }
            }
        });
        console.log("🔥 Taraftar Duygu Motoru (Fan Emotion Engine) başarıyla yüklendi! Bütün takımlara kültür atandı.");
    } else {
        console.warn("⚠️ Taraftar Duygu Motoru: leagueData.teams bulunamadı. Veritabanı dosyaları eksik yüklenmiş olabilir.");
    }
})();

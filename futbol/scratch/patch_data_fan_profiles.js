const fs = require('fs');

let content = fs.readFileSync('js/data.js', 'utf8');

const patchCode = `
// --- TARAFTAR PROFİLLERİ (FAN PROFILES) ATAMASI ---
if (leagueData && leagueData.teams) {
    leagueData.teams.forEach(t => {
        if (!t.fanProfile) {
            let name = t.name.toLowerCase();
            if (name.includes('göztepe') || name.includes('kocaelispor') || name.includes('dortmund') || name.includes('amed') || name.includes('trabzonspor')) {
                t.fanProfile = 'ultras';
            } else if (name.includes('galatasaray') || name.includes('fenerbahçe') || name.includes('beşiktaş') || name.includes('roma') || name.includes('bologna')) {
                t.fanProfile = Math.random() < 0.5 ? 'cekirdekci' : 'ultras'; // Büyük ama sabırsız kitle
            } else if (name.includes('real madrid') || name.includes('manchester city') || name.includes('psg') || name.includes('bayern')) {
                t.fanProfile = 'glory_hunters'; // İyi gün taraftarı
            } else if (name.includes('arsenal') || name.includes('brighton') || name.includes('bayer leverkusen') || name.includes('basaksehir')) {
                t.fanProfile = 'analist'; // Taktik sevdalıları
            } else if (name.includes('al-nassr') || name.includes('inter') || name.includes('manchester utd')) {
                t.fanProfile = 'oyuncu_fanatigi'; // Bireysel hayranlar
            } else if (name.includes('genclerbirligi') || name.includes('konyaspor') || name.includes('como') || name.includes('bodo')) {
                t.fanProfile = 'nostaljik'; // Eski kafalılar
            } else {
                let profiles = ['ultras', 'cekirdekci', 'analist', 'glory_hunters', 'oyuncu_fanatigi', 'nostaljik'];
                t.fanProfile = profiles[Math.floor(Math.random() * profiles.length)];
            }
        }
    });
}
`;

if (!content.includes('TARAFTAR PROFİLLERİ (FAN PROFILES) ATAMASI')) {
    content += patchCode;
    fs.writeFileSync('js/data.js', content, 'utf8');
    console.log('js/data.js patched with Fan Profiles.');
} else {
    console.log('js/data.js already patched with Fan Profiles.');
}

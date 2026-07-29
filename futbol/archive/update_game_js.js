const fs = require('fs');
let code = fs.readFileSync('js/game.js', 'utf8');

if (!code.includes('switchCVTab')) {
    code += `
// CV Tab Switching
window.switchCVTab = function(tabName) {
    // Hide all contents
    document.querySelectorAll('.cv-tab-content').forEach(el => el.style.display = 'none');
    // Remove active from all buttons
    document.querySelectorAll('.cv-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderBottom = '3px solid transparent';
        btn.style.color = '#95a5a6';
    });
    
    // Show selected content
    let content = document.getElementById('cv-tab-' + tabName);
    if(content) content.style.display = 'block';
    
    // Activate selected button
    let btn = document.getElementById('tab-btn-' + tabName);
    if(btn) {
        btn.classList.add('active');
        btn.style.borderBottom = '3px solid #3498db';
        btn.style.color = 'white';
    }
};
`;
}

code = code.replace(/document\.getElementById\('pp-name'\)\.textContent = player\.name;/g, 
    `document.getElementById('pp-name').textContent = player.name;
    
    // Switch to first tab by default
    if(typeof switchCVTab === 'function') switchCVTab('genel');
    
    // Stats Update
    if(document.getElementById('pp-stat-matches')) document.getElementById('pp-stat-matches').textContent = player.seasonMatches || 0;
    if(document.getElementById('pp-stat-goals')) document.getElementById('pp-stat-goals').textContent = player.seasonGoals || 0;
    if(document.getElementById('pp-stat-assists')) document.getElementById('pp-stat-assists').textContent = player.seasonAssists || 0;
    
    // Value Update
    if(document.getElementById('pp-market-value')) {
        let price = player.price;
        if (!price && typeof calculatePrice === 'function') price = calculatePrice(player);
        if (!price) price = 1;
        document.getElementById('pp-market-value').textContent = '€' + price + '.00m';
    }
    `);

code = code.replace(/cvEl\.innerHTML = \`<strong>\(Gerçek Wikipedia Verisi\)<\/strong><br>\$\{realBio\}\` \+ statsHtml;/g, "cvEl.innerHTML = `<strong>(Gerçek Wikipedia Verisi)</strong><br><br>${realBio}`;");
code = code.replace(/cvEl\.innerHTML = fallbackCvText \+ statsHtml;/g, "cvEl.innerHTML = fallbackCvText;");

fs.writeFileSync('js/game.js', code);
console.log('Successfully updated JS game.js logic');

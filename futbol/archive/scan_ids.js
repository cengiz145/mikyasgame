const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync('index.html', 'utf8');

// HTML icindeki ID'leri bul
const htmlIds = [];
const idRegex = /id=["']([^"']+)["']/g;
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
    htmlIds.push(match[1]);
}

const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
const jsIds = [];
const missingInHTML = [];
const containerCalls = [];

for (const file of jsFiles) {
    const jsContent = fs.readFileSync(path.join('js', file), 'utf8');
    
    // getElementById cagrilarini bul
    const getElRegex = /document.getElementById(['"]([^'"]+)['"])/g;
    while ((match = getElRegex.exec(jsContent)) !== null) {
        const id = match[1];
        if (!jsIds.includes(id)) jsIds.push(id);
        if (!htmlIds.includes(id) && !missingInHTML.includes(id)) {
            missingInHTML.push({ id, file, type: 'getElementById' });
        }
    }
    
    // showContainer cagrilarini bul
    const showContRegex = /showContainer(['"]([^'"]+)['"])/g;
    while ((match = showContRegex.exec(jsContent)) !== null) {
        const id = match[1];
        if (!htmlIds.includes(id) && !missingInHTML.some(m => m.id === id)) {
            missingInHTML.push({ id, file, type: 'showContainer' });
        }
    }
}

console.log("=== HTML'de Olmayan Ama JS'de Aranan ID'ler ===");
missingInHTML.forEach(item => {
    console.log(`- ID: ${item.id} (Dosya: ${item.file}, Tip: ${item.type})`);
});

const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync('index.html', 'utf8');

// HTML icindeki tum id'leri topla
const htmlIds = new Set();
const idRegex = /id=["']([^"']+)["']/g;
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
    htmlIds.add(match[1]);
}

const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
const brokenConnections = [];

for (const file of jsFiles) {
    const jsContent = fs.readFileSync(path.join('js', file), 'utf8');
    
    // getElementById
    const getElRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
    while ((match = getElRegex.exec(jsContent)) !== null) {
        const id = match[1];
        if (!htmlIds.has(id)) {
            brokenConnections.push({ file, type: 'getElementById', id });
        }
    }
    
    // showContainer
    const showContRegex = /showContainer\(['"]([^'"]+)['"]\)/g;
    while ((match = showContRegex.exec(jsContent)) !== null) {
        const id = match[1];
        if (!htmlIds.has(id)) {
            brokenConnections.push({ file, type: 'showContainer', id });
        }
    }
}

// Remove duplicates for cleaner output
const uniqueBroken = [];
const seen = new Set();
for (const b of brokenConnections) {
    const key = `${b.file}-${b.type}-${b.id}`;
    if (!seen.has(key)) {
        seen.add(key);
        uniqueBroken.push(b);
    }
}

fs.writeFileSync('broken_connections.json', JSON.stringify(uniqueBroken, null, 2), 'utf8');
console.log("Broken connections saved to broken_connections.json");

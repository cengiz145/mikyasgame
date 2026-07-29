const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        if (line.match(/document\.getElementById\([^)]+\)\.style\./)) {
            if (!line.includes('if') && !line.includes('?')) {
                console.log(`[${file}:${index+1}] ${line.trim()}`);
            }
        }
    });
});

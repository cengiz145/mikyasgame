const fs = require('fs');
const path = require('path');
const dir = 'js';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js')) {
        let p = path.join(dir, file);
        let buf = fs.readFileSync(p);
        // Check if BOM already exists
        if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
            // Already has BOM
            return;
        }
        
        // Ensure valid UTF-8 string, then add BOM
        let str = buf.toString('utf8');
        let withBOM = '\uFEFF' + str;
        fs.writeFileSync(p, withBOM, 'utf8');
        console.log('Added BOM to ' + file);
    }
});
console.log('Done.');

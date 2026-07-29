const fs = require('fs');
let c = 0;
fs.readdirSync('js').filter(f => f.startsWith('data')).forEach(f => {
    const s = fs.readFileSync('js/' + f, 'utf8');
    const m = s.match(/"?age"?\s*:/g);
    if (m) {
        c += m.length;
        console.log(f + ': ' + m.length);
    }
});
console.log('Total players:', c);

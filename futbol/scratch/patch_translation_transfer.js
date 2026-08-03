const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

const replacements = [
    { target: "HERE WE GO!", replace: "İMZALAR ATILDI!" }
];

replacements.forEach(r => {
    content = content.replaceAll(r.target, r.replace);
});

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch translation transfer applied successfully.');

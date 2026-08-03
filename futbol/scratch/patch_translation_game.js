const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

const replacements = [
    { target: "xG (Gol Beklentisi)", replace: "Gol Beklentisi" },
    { target: "Bana xG, sahte dokuz", replace: "Bana ısı haritası, sahte dokuz" },
    { target: "half-space", replace: "yarım alanları" },
    { target: "(half-space) ", replace: "" },
    { target: "Kusursuz bir xG üretimi", replace: "Kusursuz bir pozisyon üretimi" }
];

replacements.forEach(r => {
    content = content.replaceAll(r.target, r.replace);
});

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch translation game applied successfully.');

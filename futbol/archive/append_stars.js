const fs = require('fs');

const newRaw = [
    { name: 'Enzo Fernández', position: 'Merkez Orta Saha', age: 25, teamId: 'chelsea', value: 90, role: 'maestro', trait: 'elite' },
    { name: 'Rayan Cherki', position: '10 Numara', age: 22, teamId: 'mancity', value: 90, role: 'playmaker', trait: 'playmaker' },
    { name: 'Morgan Rogers', position: '10 Numara', age: 23, teamId: 'astonvilla', value: 90, role: 'playmaker', trait: 'aggressive' },
    { name: 'Federico Valverde', position: 'Merkez Orta Saha', age: 27, teamId: 'realmadrid', value: 90, role: 'box_to_box', trait: 'elite' },
    { name: 'Lautaro Martínez', position: 'Santrafor', age: 28, teamId: 'inter', value: 85, role: 'poacher', trait: 'elite' },
    { name: 'Alexander Isak', position: 'Santrafor', age: 26, teamId: 'liverpool', value: 85, role: 'poacher', trait: 'aggressive' },
    { name: 'Estêvão', position: 'Sağ Açık', age: 19, teamId: 'chelsea', value: 80, role: 'winger', trait: 'elite' },
    { name: 'Pau Cubarsí', position: 'Stoper', age: 19, teamId: 'barcelona', value: 80, role: 'playmaker', trait: 'elite' },
    { name: 'Nico Paz', position: '10 Numara', age: 21, teamId: 'como', value: 80, role: 'maestro', trait: 'playmaker' },
    { name: 'Warren Zaïre-Emery', position: 'Merkez Orta Saha', age: 20, teamId: 'psg', value: 80, role: 'box_to_box', trait: 'elite' },
    { name: 'Hugo Ekitiké', position: 'Santrafor', age: 24, teamId: 'liverpool', value: 80, role: 'target_man', trait: 'playmaker' },
    { name: 'Willian Pacho', position: 'Stoper', age: 24, teamId: 'psg', value: 80, role: 'stopper', trait: 'aggressive' },
    { name: 'João Pedro', position: 'Santrafor', age: 24, teamId: 'chelsea', value: 80, role: 'poacher', trait: 'elite' },
    { name: 'Nuno Mendes', position: 'Sol Bek', age: 24, teamId: 'psg', value: 80, role: 'wing_back', trait: 'aggressive' },
    { name: 'Antoine Semenyo', position: 'Sağ Açık', age: 26, teamId: 'bournemouth', value: 80, role: 'inside_forward', trait: 'aggressive' },
    { name: 'Ryan Gravenberch', position: 'Ön Libero', age: 24, teamId: 'liverpool', value: 80, role: 'anchor', trait: 'playmaker' },
    { name: 'Achraf Hakimi', position: 'Sağ Bek', age: 27, teamId: 'psg', value: 80, role: 'wing_back', trait: 'elite' },
    { name: 'Sandro Tonali', position: 'Ön Libero', age: 26, teamId: 'newcastle', value: 80, role: 'anchor', trait: 'aggressive' },
    { name: 'Kenan Yıldız', position: 'Sol Açık', age: 21, teamId: 'juventus', value: 75, role: 'inside_forward', trait: 'elite' },
    { name: 'Benjamin Sesko', position: 'Santrafor', age: 23, teamId: 'manutd', value: 75, role: 'target_man', trait: 'aggressive' },
    { name: 'Elliot Anderson', position: 'Merkez Orta Saha', age: 23, teamId: 'nforest', value: 75, role: 'box_to_box', trait: 'playmaker' },
    { name: 'Matheus Cunha', position: 'Santrafor', age: 27, teamId: 'manutd', value: 75, role: 'poacher', trait: 'aggressive' },
    { name: 'Jérémy Doku', position: 'Sol Açık', age: 24, teamId: 'mancity', value: 75, role: 'winger', trait: 'aggressive' },
    { name: 'Gabriel', position: 'Stoper', age: 28, teamId: 'arsenal', value: 75, role: 'stopper', trait: 'aggressive' },
    { name: 'Martín Zubimendi', position: 'Ön Libero', age: 27, teamId: 'arsenal', value: 75, role: 'anchor', trait: 'playmaker' }
];

let code = fs.readFileSync('js/data_world_stars.js', 'utf8');

const additionalArrayString = newRaw.map(p => `    ${JSON.stringify(p)},`).join('\n');
code = code.replace(/const worldStarsRaw = \[/, 'const worldStarsRaw = [\n' + additionalArrayString);

fs.writeFileSync('js/data_world_stars.js', code);
console.log('Appended 26-50 players');

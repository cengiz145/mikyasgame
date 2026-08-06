const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

let errors = [];
for (let f of files) {
    try {
        execSync(`node -c "${path.join(dir, f)}"`, { stdio: 'pipe' });
    } catch (e) {
        errors.push(f + ' failed syntax check!');
    }
}

if (errors.length === 0) {
    console.log("All JS files passed syntax check.");
} else {
    console.log(errors.join('\n'));
}

const fs = require('fs');
const content = fs.readFileSync('js/data_laliga.js', 'utf8');
const teamMatch = content.match(/"teamId":\s*"([^"]+)"/g);
if (teamMatch) {
    const teams = new Set(teamMatch.map(t => t.split('"')[3]));
    console.log('Found ' + teams.size + ' teams:', Array.from(teams).join(', '));
} else {
    console.log('No teams found.');
}

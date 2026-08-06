const fs = require('fs');
const path = require('path');

const academyPath = path.join(__dirname, '..', 'js', 'academy.js');
let content = fs.readFileSync(academyPath, 'utf8');

const searchStr = "id: 'youth_' + Date.now() + '_' + Math.floor(Math.random()*1000),";
const replaceStr = "id: Math.floor(100000 + Math.random() * 900000),";

if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(academyPath, content, 'utf8');
    console.log("academy.js patched with 6-digit IDs for youth players.");
} else {
    console.log("Could not find search string in academy.js.");
}

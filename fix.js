const fs = require('fs');

try {
    let content = fs.readFileSync('index.html', 'utf8');

    content = content.replace(/entıra/g, "Enter'a");
    content = content.replace(/entır/g, 'Enter');
    content = content.replace(/page up/gi, 'Page Up');
    content = content.replace(/page down/gi, 'Page Down');

    fs.writeFileSync('index.html', content, 'utf8');
    console.log('OK');
} catch (e) {
    console.error(e);
}

const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Add tabindex="-1" to all h1 and h2 so they can receive programmatic focus
html = html.replace(/<h1(.*?)>/g, (match, p1) => {
    if (p1.includes('tabindex')) return match;
    return `<h1 tabindex="-1"${p1}>`;
});

html = html.replace(/<h2(.*?)>/g, (match, p1) => {
    if (p1.includes('tabindex')) return match;
    return `<h2 tabindex="-1"${p1}>`;
});

// Also fix dialogue-modal and settings-modal accessibility
// Make sure settings-modal has a focusable element
if (html.includes('id="settings-modal"')) {
    html = html.replace(
        '<h2 style="color: #f1c40f;',
        '<h2 id="settings-title" tabindex="-1" style="color: #f1c40f;'
    );
}

fs.writeFileSync('index.html', html, 'utf8');
console.log("Added tabindex='-1' to headings for accessibility.");


const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('a11y_observer.js')) {
    html = html.replace(
        '<script src="js/menu.js',
        '<script src="js/a11y_observer.js" charset="utf-8"></script>\n        <script src="js/menu.js'
    );
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Injected a11y_observer.js');
}

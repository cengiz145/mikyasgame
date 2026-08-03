const fs = require('fs');
const path = require('path');

const jsDir = 'js';
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).map(f => path.join(jsDir, f));

for (const file of jsFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // This regex looks for assignments to display = 'flex' for modals or overlays
    // We use a safe group for the element reference
    const regex = /([^;\{\}\n]+?)\.style\.display\s*=\s*['"]flex['"]/g;
    
    content = content.replace(regex, (match, elementRef) => {
        // Exclude generic containers that use showContainer
        if (elementRef.includes('container') && !elementRef.includes('modal') && !elementRef.includes('overlay')) {
            return match;
        }
        
        const cleanRef = elementRef.trim();
        if (!cleanRef || cleanRef === '') return match;
        
        return `${match}; if(${cleanRef}) { let title = ${cleanRef}.querySelector('h1, h2'); if(title) title.focus(); else ${cleanRef}.focus(); }`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Patched focus management in ${file}`);
    }
}

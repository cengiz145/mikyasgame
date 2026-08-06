const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Function to replace span/div onclick with accessible versions
const makeAccessible = (tag, extraClasses = '') => {
    // Finds <span class="..." onclick="...">...</span> and converts to accessible version
    const regex = new RegExp(`<${tag}[^>]*onclick="([^"]+)"[^>]*>(.*?)</${tag}>`, 'g');
    html = html.replace(regex, (match, onclickContent, innerContent) => {
        if (match.includes('role="button"')) return match; // already fixed
        
        // Add role="button", tabindex="0", and onkeydown
        // Extract all other attributes except onclick
        let otherAttrs = match
            .replace(new RegExp(`^<${tag}`), '')
            .replace(new RegExp(`>${innerContent.replace(/[.*+?^${}()|[]]/g, '$&')}</${tag}>$`), '')
            .replace(/onclick="[^"]+"/, '');
            
        return `<${tag} ${otherAttrs} role="button" tabindex="0" onclick="${onclickContent}" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.click(); }">${innerContent}</${tag}>`;
    });
};

makeAccessible('span');
makeAccessible('div');

// Special check for CV tabs which are already buttons but could be structured better, they are actually buttons though:
// <button id="tab-btn-genel" ...> So they are fine!

fs.writeFileSync('index.html', html, 'utf8');
console.log("index.html accessibility patched for interactive non-button elements.");


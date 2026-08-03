const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

// Ayarlar butonuna listener ekleyelim eğer yoksa
if (!content.includes("settingsBtn.addEventListener('click'")) {
    const startBtnLogic = `
    if (startBtn) {
        startBtn.addEventListener('click', () => {
`;
    
    const settingsLogic = `
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            alert("Ayarlar menüsü yakında eklenecek.");
        });
    }
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
`;
    
    content = content.replace(startBtnLogic, settingsLogic);
    fs.writeFileSync('js/menu.js', content, 'utf8');
    console.log("Settings button listener added.");
} else {
    console.log("Settings button listener already exists.");
}

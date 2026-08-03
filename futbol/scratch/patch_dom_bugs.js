const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../js');

function patchFile(filename, replacements) {
    const filePath = path.join(jsDir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    let patched = false;
    
    replacements.forEach(r => {
        if (content.includes(r.search)) {
            content = content.replace(r.search, r.replace);
            patched = true;
        } else {
            console.warn(`[WARNING] Could not find string in ${filename}:`, r.search);
        }
    });
    
    if (patched) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[OK] Patched ${filename}`);
    }
}

// 1. champions_league.js
patchFile('champions_league.js', [
    {
        search: "document.getElementById('europe-container').style.display = 'block';",
        replace: "if(document.getElementById('europe-container')) document.getElementById('europe-container').style.display = 'block';"
    }
]);

// 2. facilities.js
patchFile('facilities.js', [
    {
        search: "document.getElementById('facilities-container').style.display = 'block';",
        replace: "if(document.getElementById('facilities-container')) document.getElementById('facilities-container').style.display = 'block';"
    },
    {
        search: "document.getElementById('facilities-container').style.display = 'none';",
        replace: "if(document.getElementById('facilities-container')) document.getElementById('facilities-container').style.display = 'none';"
    },
    {
        search: "document.getElementById('main-menu-container').style.display = 'flex';",
        replace: "if(document.getElementById('main-menu-container')) document.getElementById('main-menu-container').style.display = 'flex';"
    },
    {
        search: "else document.getElementById('facilities-budget-display').style.color = \"#2ecc71\";",
        replace: "else if(document.getElementById('facilities-budget-display')) document.getElementById('facilities-budget-display').style.color = \"#2ecc71\";"
    }
]);

// 3. game.js
patchFile('game.js', [
    {
        search: "closeBtn.addEventListener('click', () => { document.getElementById('sub-modal').style.display = 'none'; isPaused = false; });",
        replace: "closeBtn.addEventListener('click', () => { if(document.getElementById('sub-modal')) document.getElementById('sub-modal').style.display = 'none'; isPaused = false; });"
    },
    {
        search: "document.getElementById('sub-modal').style.display = 'none';",
        replace: "if(document.getElementById('sub-modal')) document.getElementById('sub-modal').style.display = 'none';"
    }
]);

// 4. menu.js
patchFile('menu.js', [
    {
        search: "document.getElementById('captain-selector-modal').style.display = 'none';",
        replace: "if(document.getElementById('captain-selector-modal')) document.getElementById('captain-selector-modal').style.display = 'none';"
    }
]);

// 5. sponsor.js
patchFile('sponsor.js', [
    {
        search: "document.getElementById('sponsor-modal').style.display = \"none\";",
        replace: "if(document.getElementById('sponsor-modal')) document.getElementById('sponsor-modal').style.display = \"none\";"
    }
]);

// 6. squad.js
patchFile('squad.js', [
    {
        search: "document.getElementById('transfer-confirm-modal').style.display = 'none';",
        replace: "if(document.getElementById('transfer-confirm-modal')) document.getElementById('transfer-confirm-modal').style.display = 'none';"
    }
]);

// 7. transfer.js
patchFile('transfer.js', [
    {
        search: "document.getElementById('negotiation-modal').style.display = 'none';",
        replace: "if(document.getElementById('negotiation-modal')) document.getElementById('negotiation-modal').style.display = 'none';"
    }
]);

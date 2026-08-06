const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'js', 'menu.js');
let content = fs.readFileSync(menuPath, 'latin1'); // Use latin1 for Windows-1254 usually

if (!content.includes('btn-world-ranking')) {
    const searchStr = "showContainer('standings-container');\n    });";
    const replaceStr = "showContainer('standings-container');\n    });\n    document.getElementById('btn-world-ranking')?.addEventListener('click', () => {\n        if(typeof updateWorldRankingUI === 'function') updateWorldRankingUI();\n        showContainer('world-ranking-container');\n    });";
    
    // Sometimes newline is \r\n
    const searchStrWin = "showContainer('standings-container');\r\n    });";
    const replaceStrWin = "showContainer('standings-container');\r\n    });\r\n    document.getElementById('btn-world-ranking')?.addEventListener('click', () => {\r\n        if(typeof updateWorldRankingUI === 'function') updateWorldRankingUI();\r\n        showContainer('world-ranking-container');\r\n    });";

    if (content.includes(searchStrWin)) {
        content = content.replace(searchStrWin, replaceStrWin);
    } else {
        content = content.replace(searchStr, replaceStr);
    }

    fs.writeFileSync(menuPath, content, 'latin1');
    console.log("menu.js updated successfully.");
} else {
    console.log("btn-world-ranking already exists in menu.js.");
}

const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '..', 'js');
const files = fs.readdirSync(jsDir).filter(f => f.startsWith('data') && f.endsWith('.js'));

const generatedIds = new Set();

function generateId() {
    let newId;
    do {
        newId = Math.floor(100000 + Math.random() * 900000);
    } while (generatedIds.has(newId));
    generatedIds.add(newId);
    return newId;
}

let totalPlayersUpdated = 0;

for (const file of files) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to match `id: "something"` or `"id": "something"` or `id: 123` 
    // ONLY if it's inside an object that also has `teamId:` or `"teamId":`
    
    // An easier approach without AST:
    // Split the file by "{"
    let parts = content.split('{');
    let updatedContent = parts[0];
    let fileUpdated = 0;

    for (let i = 1; i < parts.length; i++) {
        let part = parts[i];
        
        // If this block looks like a player (has teamId)
        if (part.includes('teamId:') || part.includes('"teamId":')) {
            // Check if it has an id property
            const idRegex = /("?id"?\s*:\s*)(['"]?[a-zA-Z0-9_-]+['"]?)/;
            if (idRegex.test(part)) {
                const newId = generateId();
                part = part.replace(idRegex, `$1${newId}`);
                fileUpdated++;
                totalPlayersUpdated++;
            }
        }
        updatedContent += '{' + part;
    }

    if (fileUpdated > 0) {
        // Because data files might be ANSI/Windows-1254, but since we read as utf8, if there are issues we might corrupt turkish chars.
        // Let's read and write as latin1 to be safe with Turkish characters if they were saved that way.
        // Wait, reading as utf8 and writing as utf8 might break latin1. Let's re-read as latin1.
        
        let contentLatin = fs.readFileSync(filePath, 'latin1');
        let partsLatin = contentLatin.split('{');
        let updatedLatin = partsLatin[0];
        for (let i = 1; i < partsLatin.length; i++) {
            let part = partsLatin[i];
            if (part.includes('teamId:') || part.includes('"teamId":')) {
                const idRegex = /("?id"?\s*:\s*)(['"]?[a-zA-Z0-9_-]+['"]?)/;
                if (idRegex.test(part)) {
                    // Generate new id without re-adding to set since it's just repeating
                    const newId = generateId(); 
                    part = part.replace(idRegex, `$1${newId}`);
                }
            }
            updatedLatin += '{' + part;
        }
        
        fs.writeFileSync(filePath, updatedLatin, 'latin1');
        console.log(`Updated ${fileUpdated} players in ${file}`);
    }
}

console.log(`Total players updated: ${totalPlayersUpdated}`);

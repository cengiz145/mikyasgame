const fs = require('fs');

const transcriptPath = "C:\\\\Users\\\\Umit Ekrem Mikyas\\\\.gemini\\\\antigravity-ide\\\\brain\\\\f5dad394-43eb-4e57-9a75-55881090fe3f\\\\.system_generated\\\\logs\\\\transcript_full.jsonl";

let menuOriginal = null;
let managerOriginal = null;
let scoutOriginal = null;
let dataStarsOriginal = null;

try {
    const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\\n');
    for (let line of lines) {
        if (!line.trim()) continue;
        try {
            const data = JSON.parse(line);
            const contentStr = data.content || '';
            
            // Check if this is a view_file output for menu.js
            if (contentStr.includes('// menu.js - Restored Core UI') && !contentStr.includes('<span style')) {
                menuOriginal = contentStr;
            }
            if (contentStr.includes('// manager.js') && !managerOriginal) {
                // Not perfectly reliable, but maybe we can find the file content
                // Actually, let's just dump the file contents from earlier view_file outputs.
            }
        } catch (e) {}
    }
} catch (e) {
    console.log("Error: " + e);
}

if (menuOriginal) {
    // Extract the actual file content from the tool output
    // Tool output is usually "1: line1\n2: line2"
    let clean = menuOriginal.split('\\n').map(l => {
        let match = l.match(/^\\d+:\\s(.*)$/);
        return match ? match[1] : null;
    }).filter(l => l !== null).join('\\n');
    
    fs.writeFileSync('C:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\menu_recovered.js', clean, 'utf-8');
    console.log("Recovered menu.js!");
} else {
    console.log("Could not find original menu.js in transcript");
}

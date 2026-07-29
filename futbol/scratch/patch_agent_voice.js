const fs = require('fs');
const path = require('path');

const transferPath = path.join(__dirname, '..', 'js', 'transfer.js');
let content = fs.readFileSync(transferPath, 'utf8');

// We want to patch updateNegotiationUI to speak the text
const updateUiRegex = /function updateNegotiationUI\(speechText\) \{([\s\S]*?)document\.getElementById\('neg-offer-input'\)\.value = "";\n\}/m;

const newUpdateUi = `function updateNegotiationUI(speechText) {
    document.getElementById('neg-agent-speech').innerText = '"' + speechText + '"';
    document.getElementById('neg-agent-demand').innerText = window.currentAgentDemand.toLocaleString() + " €";
    
    let patienceText = "";
    if (window.currentAgentPatience >= 3) patienceText = "Kusursuz (⭐⭐⭐)";
    else if (window.currentAgentPatience === 2) patienceText = "Gergin (⭐⭐)";
    else patienceText = "Kopmak Üzere (⭐)";
    
    document.getElementById('neg-agent-patience').innerText = patienceText;
    document.getElementById('neg-offer-input').value = "";
    
    // Sesli okuma (Erişilebilirlik ve Karakter Rol Yapma)
    if(typeof speak === 'function') {
        speak(speechText);
    }
}`;

content = content.replace(updateUiRegex, newUpdateUi);

// We also need to patch the alert(msg) calls in the submit listener to also speak the msg.
const submitRegex = /alert\(msg\);\s*finishNegotiation\(false\);/g;
const submitRepl = `alert(msg);\n        if(typeof speak === 'function') speak(msg);\n        finishNegotiation(false);`;

content = content.replace(submitRegex, submitRepl);

fs.writeFileSync(transferPath, content, 'utf8');
console.log("transfer.js patched for agent voice and behaviors.");

const fs = require('fs');
const path = 'js/announcer.js';

let content = fs.readFileSync(path, 'utf8');

const oldStr = "if ('speechSynthesis' in window) { if(priority) window.speechSynthesis.cancel(); let utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'tr-TR'; utterance.rate = 1.1; let voices = window.speechSynthesis.getVoices(); let trVoice = voices.find(v => v.lang === 'tr-TR'); if(trVoice) utterance.voice = trVoice; window.speechSynthesis.speak(utterance); }";
const newStr = "if (window.speechEnabled && 'speechSynthesis' in window) { if(priority) window.speechSynthesis.cancel(); let utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'tr-TR'; utterance.rate = 1.1; let voices = window.speechSynthesis.getVoices(); let trVoice = voices.find(v => v.lang === 'tr-TR'); if(trVoice) utterance.voice = trVoice; window.speechSynthesis.speak(utterance); }";

if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log('SUCCESS');
} else {
    console.log('NOT FOUND');
}

import sys

path = 'js/announcer.js'
with open(path, 'rb') as f:
    content = f.read().decode('utf-8', errors='ignore')

old_str = "if ('speechSynthesis' in window) { if(priority) window.speechSynthesis.cancel(); let utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'tr-TR'; utterance.rate = 1.1; let voices = window.speechSynthesis.getVoices(); let trVoice = voices.find(v => v.lang === 'tr-TR'); if(trVoice) utterance.voice = trVoice; window.speechSynthesis.speak(utterance); }"
new_str = "if (window.speechEnabled && 'speechSynthesis' in window) { if(priority) window.speechSynthesis.cancel(); let utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'tr-TR'; utterance.rate = 1.1; let voices = window.speechSynthesis.getVoices(); let trVoice = voices.find(v => v.lang === 'tr-TR'); if(trVoice) utterance.voice = trVoice; window.speechSynthesis.speak(utterance); }"

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(path, 'wb') as f:
        f.write(content.encode('utf-8'))
    print('SUCCESS')
else:
    print('NOT FOUND')

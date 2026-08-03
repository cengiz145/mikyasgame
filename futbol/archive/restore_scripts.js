const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const missingScripts = `    <script src="js/menu.js?v=5" charset="utf-8"></script>
    <script src="js/sponsor.js" charset="utf-8"></script>
    <script src="js/facilities.js" charset="utf-8"></script>
    <script src="js/audio.js" charset="utf-8"></script>
    <script src="js/dialogueData.js" charset="utf-8"></script>
    <script src="js/dialogue.js" charset="utf-8"></script>
    <script src="js/transfer.js" charset="utf-8"></script>
    <script src="js/psychologist.js" charset="utf-8"></script>
    <script src="js/training.js" charset="utf-8"></script>
    <script src="js/scout.js" charset="utf-8"></script>
    <script src="js/psychology.js" charset="utf-8"></script>
    <script src="js/manager.js?v=4" charset="utf-8"></script>
    <script src="js/squad.js" charset="utf-8"></script>
    <script src="js/announcer.js" charset="utf-8"></script>
    <script src="js/interactions.js" charset="utf-8"></script>
    <script src="js/academy.js" charset="utf-8"></script>
    <script src="js/staff.js" charset="utf-8"></script>
    <script src="js/press.js" charset="utf-8"></script>
    <script src="js/commentator.js" charset="utf-8"></script>
    <script>
        window.triggerGameOver = function() {`;

// Sadece <script src="js/menu.js?v=5" charset="utf-8"></script> ve sonrasındaki <script> bloğu arasını değiştir.
const searchStr = `    <script src="js/menu.js?v=5" charset="utf-8"></script>
    <script>
        window.triggerGameOver = function() {`;

if (content.includes(searchStr)) {
    content = content.replace(searchStr, missingScripts);
    fs.writeFileSync('index.html', content, 'utf8');
    console.log("Script tags restored.");
} else {
    // Maybe whitespace is different
    const regex = /<script src="js\/menu\.js\?v=5" charset="utf-8"><\/script>[\s\n\r]*<script>[\s\n\r]*window\.triggerGameOver = function\(\) \{/;
    if (regex.test(content)) {
        content = content.replace(regex, missingScripts);
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Script tags restored using regex.");
    } else {
        console.log("Could not find the target string to restore scripts.");
    }
}

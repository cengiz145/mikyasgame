const fs = require('fs');
let content = fs.readFileSync('js/game.js', 'utf8');

content = content.replace(
    /if\s*\(window\.announcerBrain\)\s*\{\s*let\s*dist\s*=\s*Math\.sqrt\(Math\.pow\(activePlayer\.x\s*-\s*800,\s*2\)\s*\+\s*Math\.pow\(activePlayer\.y\s*-\s*250,\s*2\)\);\s*window\.announcerBrain\.onShot\(activePlayer,\s*dist\);\s*\}/,
    if (window.announcerBrain) {
          let dist = Math.sqrt(Math.pow(activePlayer.x - 800, 2) + Math.pow(activePlayer.y - 250, 2));
          let currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          window.announcerBrain.onShot(activePlayer, dist, currentSpeed);
      }
);

// Delete the old "şut çekiyor" from the beginning
content = content.replace(/if\(typeof speak === 'function'\) speak\(activePlayer\.name \+ "[^"]*ut ekiyor!"\);\s*/, '');
content = content.replace(/if\(typeof speak === 'function'\) speak\(activePlayer\.name \+ "[^"]*ut ekiyor!"\);\s*/, '');
content = content.replace(/if\(typeof speak === 'function'\) speak\(activePlayer\.name \+ "[^"]+şut çekiyor!"\);\s*/, '');

// Also passLogic
content = content.replace(
    /if \(\!closestTeammate\) return;\s*let angle = Math\.atan2\(closestTeammate\.y - activePlayer\.y, closestTeammate\.x - activePlayer\.x\);/,
    if (!closestTeammate) return;
      let dist = Math.sqrt(Math.pow(closestTeammate.x - activePlayer.x, 2) + Math.pow(closestTeammate.y - activePlayer.y, 2));
      let angle = Math.atan2(closestTeammate.y - activePlayer.y, closestTeammate.x - activePlayer.x);
);

content = content.replace(
    /if \(window\.announcerBrain\) window\.announcerBrain\.onPass\(activePlayer, closestTeammate\);/,
    if (window.announcerBrain) window.announcerBrain.onPass(activePlayer, closestTeammate, dist);
);

// remove hardcoded speak from doPassLogic
content = content.replace(/if\(typeof speak === 'function'\) speak\(activePlayer\.name \+ " pas verdi\."\);\s*/, '');

// executeHeader
content = content.replace(
    /if\(typeof speak === 'function'\) speak\(p\.name \+ " kafa vuruyor!"\);\s*/,
    if(window.announcerBrain) {
        let dist = Math.sqrt(Math.pow(p.x - 800, 2) + Math.pow(p.y - 250, 2));
        window.announcerBrain.onHeader(p, dist);
    }
    
);

fs.writeFileSync('js/game.js', content, 'utf8');
console.log('Replaced successfully');

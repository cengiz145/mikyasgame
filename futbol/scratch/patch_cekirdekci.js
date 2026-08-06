const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let target1 = `      let isStadiumAbandoned = (window.CrowdForm === 4) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);
      
      if (isStadiumAbandoned) {
          if (!window.abandonmentAnnounced) {`;

let replacement1 = `      let isStadiumAbandoned = (window.CrowdForm === 4) && (typeof timeLeft !== 'undefined' && timeLeft <= 30);
      
      if (window.currentFanProfile) {
          if (window.currentFanProfile.profile === 'ultras') {
              isStadiumAbandoned = false;
          } else if (window.currentFanProfile.profile === 'cekirdekci' && typeof timeLeft !== 'undefined' && timeLeft <= 15) {
              isStadiumAbandoned = true; // Trafik olmasın diye çıkarlar
          }
      }

      if (isStadiumAbandoned) {
          if (!window.abandonmentAnnounced) {`;

content = content.replace(target1, replacement1);

let target2 = `                    } else if (window.CrowdForm >= 3) {
                        closestHome.p.isBooedByOwnFans = true;
                    } `;

let replacement2 = `                    } else if (window.CrowdForm >= 3 || (window.currentFanProfile && window.currentFanProfile.profile === 'cekirdekci')) {
                        closestHome.p.isBooedByOwnFans = true;
                    } `;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch applied successfully.');

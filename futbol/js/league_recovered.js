Created At: 2026-07-13T14:44:38Z
Completed At: 2026-07-13T14:44:39Z

				The command completed successfully.
				Output:
				
> js\league.js:171:window.drawFixtures = function() {
  js\league.js:172:    let domesticTeams = leagueData.teams.filter(t => t.leagueId === (window.selectedLeague || "super
lig")).map(t => t.id);
  js\league.js:173:    window.fixture = window.generateFixture ? window.generateFixture(domesticTeams) : [];
> js\menu.js:463:                if (typeof window.drawFixtures === 'function') window.drawFixtures();
  js\menu.js:464:                this.innerHTML = "�lerle (Sal�)";
  js\menu.js:465:            } else {




// Saudi Pro League Database

const saudiTeams = [
    { "id": "alnassr", "name": "Al-Nassr", "power": 85, "budget": 500, "stadium": "Al-Awwal Park", "country": "saudi", "leagueId": "saudipro", "tactics": "4-2-3-1" },
    { "id": "alhilal", "name": "Al-Hilal", "power": 87, "budget": 600, "stadium": "Kingdom Arena", "country": "saudi", "leagueId": "saudipro", "tactics": "4-3-3" },
    { "id": "alittihad", "name": "Al-Ittihad", "power": 83, "budget": 450, "stadium": "King Abdullah Sports City", "country": "saudi", "leagueId": "saudipro", "tactics": "4-4-2" },
    { "id": "alahli", "name": "Al-Ahli", "power": 82, "budget": 400, "stadium": "King Abdullah Sports City", "country": "saudi", "leagueId": "saudipro", "tactics": "4-3-3" },
    { "id": "alettifaq", "name": "Al-Ettifaq", "power": 75, "budget": 150, "stadium": "Abdullah Al Dabil Stadium", "country": "saudi", "leagueId": "saudipro", "tactics": "4-3-3" },
    { "id": "alshabab", "name": "Al-Shabab", "power": 78, "budget": 200, "stadium": "Al-Shabab Club Stadium", "country": "saudi", "leagueId": "saudipro", "tactics": "4-2-3-1" }
];

const saudiPlayers = [
    // Al-Nassr
    { "id": "ronaldo_nassr", "name": "Cristiano Ronaldo", "birthplace": "Funchal, Portekiz", "nationality": "Portekiz", "teamId": "alnassr", "position": "Santrfor", "power": 90, "speed": 14, "age": 41, "tacticalRole": "poacher", "mentalTrait": "leader", "value": 15, "wage": 200, "morale": 100, "fitness": 95, "form": 8, "contractYears": 1, "isListed": false },
    { "id": "mane_nassr", "name": "Sadio Mané", "birthplace": "Bambali, Senegal", "nationality": "Senegal", "teamId": "alnassr", "position": "Sol Kanat", "power": 85, "speed": 17, "age": 34, "tacticalRole": "winger", "mentalTrait": "worker", "value": 20, "wage": 40, "morale": 90, "fitness": 90, "form": 7, "contractYears": 2, "isListed": false },
    { "id": "brozovic_nassr", "name": "Marcelo Brozović", "birthplace": "Zagreb, Hırvatistan", "nationality": "Hırvatistan", "teamId": "alnassr", "position": "Merkez Orta Saha", "power": 84, "speed": 13, "age": 33, "tacticalRole": "playmaker", "mentalTrait": "worker", "value": 18, "wage": 25, "morale": 90, "fitness": 95, "form": 8, "contractYears": 2, "isListed": false },
    { "id": "laporte_nassr", "name": "Aymeric Laporte", "birthplace": "Agen, Fransa", "nationality": "İspanya", "teamId": "alnassr", "position": "Stoper", "power": 85, "speed": 12, "age": 32, "tacticalRole": "ball_playing_defender", "mentalTrait": "calm", "value": 25, "wage": 25, "morale": 95, "fitness": 95, "form": 8, "contractYears": 2, "isListed": false },
    { "id": "talisca_nassr", "name": "Anderson Talisca", "birthplace": "Feira de Santana, Brezilya", "nationality": "Brezilya", "teamId": "alnassr", "position": "Forvet Arkası", "power": 83, "speed": 15, "age": 32, "tacticalRole": "advanced_playmaker", "mentalTrait": "creative", "value": 15, "wage": 15, "morale": 85, "fitness": 90, "form": 7, "contractYears": 1, "isListed": false },

    // Al-Hilal
    { "id": "neymar_hilal", "name": "Neymar Jr.", "birthplace": "Mogi das Cruzes, Brezilya", "nationality": "Brezilya", "teamId": "alhilal", "position": "Sol Kanat", "power": 89, "speed": 16, "age": 34, "tacticalRole": "inside_forward", "mentalTrait": "creative", "value": 45, "wage": 100, "morale": 95, "fitness": 90, "form": 9, "contractYears": 2, "isListed": false },
    { "id": "mitrovic_hilal", "name": "Aleksandar Mitrović", "birthplace": "Smederevo, Sırbistan", "nationality": "Sırbistan", "teamId": "alhilal", "position": "Santrfor", "power": 85, "speed": 12, "age": 31, "tacticalRole": "target_man", "mentalTrait": "warrior", "value": 30, "wage": 25, "morale": 100, "fitness": 95, "form": 9, "contractYears": 2, "isListed": false },
    { "id": "savic_hilal", "name": "Sergej Milinković-Savić", "birthplace": "Lleida, İspanya", "nationality": "Sırbistan", "teamId": "alhilal", "position": "Merkez Orta Saha", "power": 86, "speed": 13, "age": 31, "tacticalRole": "box_to_box", "mentalTrait": "leader", "value": 40, "wage": 30, "morale": 90, "fitness": 95, "form": 8, "contractYears": 2, "isListed": false },
    { "id": "neves_hilal", "name": "Rúben Neves", "birthplace": "Mozelos, Portekiz", "nationality": "Portekiz", "teamId": "alhilal", "position": "Ön Libero", "power": 84, "speed": 12, "age": 29, "tacticalRole": "deep_lying_playmaker", "mentalTrait": "calm", "value": 35, "wage": 20, "morale": 95, "fitness": 95, "form": 8, "contractYears": 3, "isListed": false },
    { "id": "koulibaly_hilal", "name": "Kalidou Koulibaly", "birthplace": "Saint-Dié-des-Vosges, Fransa", "nationality": "Senegal", "teamId": "alhilal", "position": "Stoper", "power": 84, "speed": 12, "age": 35, "tacticalRole": "stopper", "mentalTrait": "leader", "value": 15, "wage": 30, "morale": 85, "fitness": 90, "form": 7, "contractYears": 1, "isListed": false },
    { "id": "bounou_hilal", "name": "Yassine Bounou", "birthplace": "Montreal, Kanada", "nationality": "Fas", "teamId": "alhilal", "position": "Kaleci", "power": 85, "speed": 8, "age": 35, "tacticalRole": "sweeper_keeper", "mentalTrait": "calm", "value": 12, "wage": 15, "morale": 95, "fitness": 95, "form": 8, "contractYears": 2, "isListed": false },

    // Al-Ittihad
    { "id": "benzema_ittihad", "name": "Karim Benzema", "birthplace": "Lyon, Fransa", "nationality": "Fransa", "teamId": "alittihad", "position": "Santrfor", "power": 87, "speed": 13, "age": 38, "tacticalRole": "false_nine", "mentalTrait": "creative", "value": 10, "wage": 100, "morale": 85, "fitness": 85, "form": 7, "contractYears": 1, "isListed": false },
    { "id": "kante_ittihad", "name": "N'Golo Kanté", "birthplace": "Paris, Fransa", "nationality": "Fransa", "teamId": "alittihad", "position": "Ön Libero", "power": 85, "speed": 14, "age": 35, "tacticalRole": "ball_winning_midfielder", "mentalTrait": "worker", "value": 12, "wage": 25, "morale": 95, "fitness": 90, "form": 8, "contractYears": 1, "isListed": false },
    { "id": "fabinho_ittihad", "name": "Fabinho", "birthplace": "Campinas, Brezilya", "nationality": "Brezilya", "teamId": "alittihad", "position": "Ön Libero", "power": 84, "speed": 11, "age": 32, "tacticalRole": "anchor", "mentalTrait": "calm", "value": 25, "wage": 20, "morale": 90, "fitness": 95, "form": 7, "contractYears": 2, "isListed": false },

    // Al-Ahli
    { "id": "mahrez_ahli", "name": "Riyad Mahrez", "birthplace": "Sarcelles, Fransa", "nationality": "Cezayir", "teamId": "alahli", "position": "Sağ Kanat", "power": 85, "speed": 15, "age": 35, "tacticalRole": "winger", "mentalTrait": "creative", "value": 18, "wage": 35, "morale": 90, "fitness": 90, "form": 8, "contractYears": 2, "isListed": false },
    { "id": "firmino_ahli", "name": "Roberto Firmino", "birthplace": "Maceió, Brezilya", "nationality": "Brezilya", "teamId": "alahli", "position": "Santrfor", "power": 83, "speed": 13, "age": 34, "tacticalRole": "false_nine", "mentalTrait": "worker", "value": 12, "wage": 20, "morale": 85, "fitness": 90, "form": 7, "contractYears": 1, "isListed": false },
    { "id": "kessie_ahli", "name": "Franck Kessié", "birthplace": "Ouragahio, Fildişi Sahili", "nationality": "Fildişi Sahili", "teamId": "alahli", "position": "Merkez Orta Saha", "power": 84, "speed": 13, "age": 29, "tacticalRole": "box_to_box", "mentalTrait": "warrior", "value": 30, "wage": 20, "morale": 95, "fitness": 95, "form": 8, "contractYears": 3, "isListed": false },
    { "id": "mendy_ahli", "name": "Édouard Mendy", "birthplace": "Montivilliers, Fransa", "nationality": "Senegal", "teamId": "alahli", "position": "Kaleci", "power": 83, "speed": 8, "age": 34, "tacticalRole": "sweeper_keeper", "mentalTrait": "calm", "value": 10, "wage": 15, "morale": 90, "fitness": 90, "form": 7, "contractYears": 2, "isListed": false },
    
    // Al-Ettifaq
    { "id": "wijnaldum_ettifaq", "name": "Georginio Wijnaldum", "birthplace": "Rotterdam, Hollanda", "nationality": "Hollanda", "teamId": "alettifaq", "position": "Merkez Orta Saha", "power": 80, "speed": 12, "age": 35, "tacticalRole": "box_to_box", "mentalTrait": "worker", "value": 5, "wage": 10, "morale": 85, "fitness": 85, "form": 7, "contractYears": 1, "isListed": false },

    // Al-Shabab
    { "id": "carrasco_shabab", "name": "Yannick Carrasco", "birthplace": "Vilvoorde, Belçika", "nationality": "Belçika", "teamId": "alshabab", "position": "Sol Kanat", "power": 82, "speed": 16, "age": 32, "tacticalRole": "winger", "mentalTrait": "creative", "value": 15, "wage": 15, "morale": 90, "fitness": 90, "form": 8, "contractYears": 2, "isListed": false }
];

if (typeof window !== 'undefined' && window.leagueData) {
    if (!window.leagueData.teams) window.leagueData.teams = [];
    if (!window.leagueData.players) window.leagueData.players = [];
    
    // Remove old data to prevent duplication
    window.leagueData.teams = window.leagueData.teams.filter(t => t.leagueId !== 'saudipro');
    window.leagueData.players = window.leagueData.players.filter(p => !saudiTeams.find(t => t.id === p.teamId));

    saudiTeams.forEach(t => window.leagueData.teams.push(t));
    saudiPlayers.forEach(p => window.leagueData.players.push(p));
}

import csv
import json
import random
import re

csv_file = 'scratch/fifa19.csv'
js_file = 'js/data_fifa.js'

def slugify(text):
    if not text:
        return 'free_agent'
    text = text.lower()
    text = re.sub(r'[^a-z0-9]', '_', text)
    text = re.sub(r'_+', '_', text)
    return text.strip('_')

# Position mapping
pos_map = {
    'GK': 'Kaleci',
    'CB': 'Stoper', 'LCB': 'Stoper', 'RCB': 'Stoper',
    'LB': 'Sol Bek', 'LWB': 'Sol Bek',
    'RB': 'Sağ Bek', 'RWB': 'Sağ Bek',
    'CDM': 'Ön Libero', 'LDM': 'Ön Libero', 'RDM': 'Ön Libero',
    'CM': 'Orta Saha', 'LCM': 'Orta Saha', 'RCM': 'Orta Saha',
    'CAM': 'Maestro', 'LAM': 'Maestro', 'RAM': 'Maestro',
    'LM': 'Sol Kanat', 'LW': 'Sol Kanat', 'LF': 'Sol Kanat',
    'RM': 'Sağ Kanat', 'RW': 'Sağ Kanat', 'RF': 'Sağ Kanat',
    'ST': 'Santrfor', 'LS': 'Santrfor', 'RS': 'Santrfor', 'CF': 'Santrfor'
}

players = []
clubs = {}
id_set = set()

def get_unique_id():
    while True:
        new_id = random.randint(10000000000, 99999999999)
        if new_id not in id_set:
            id_set.add(new_id)
            return new_id

with open(csv_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row.get('Name', 'Unknown')
        age = int(row.get('Age', 20))
        nationality = row.get('Nationality', 'Unknown')
        power = int(row.get('Overall', 50))
        
        club_name = row.get('Club', '')
        team_id = slugify(club_name)
        if team_id != 'free_agent':
            if team_id not in clubs:
                clubs[team_id] = {
                    'id': team_id,
                    'name': club_name,
                    'budget': random.randint(50, 500) * 1000000,
                    'leagueId': 'world'
                }
        
        pos = row.get('Position', '')
        mapped_pos = pos_map.get(pos, 'Orta Saha')
        
        # Calculate speed from SprintSpeed and Acceleration if possible
        speed_val = 2.5
        sprint = row.get('SprintSpeed', '')
        acc = row.get('Acceleration', '')
        try:
            s = float(sprint) if sprint else 50
            a = float(acc) if acc else 50
            avg = (s + a) / 2
            # 0-100 to 1.0-5.0
            speed_val = round((avg / 100.0) * 4.0 + 1.0, 1)
        except:
            pass
            
        player = {
            "id": get_unique_id(),
            "name": name,
            "position": mapped_pos,
            "power": power,
            "speed": speed_val,
            "age": age,
            "birthplace": f"Bilinmiyor, {nationality}",
            "teamId": team_id,
            "tacticalRole": "classic",
            "mentalTrait": random.choice(["aggressive", "creative", "elite", "fragile"]),
            "contractYears": random.randint(1, 5),
            "isListed": False
        }
        players.append(player)

# Output generation
js_content = "// GERCEK FIFA 15.000+ YILDIZ VERILERI\n"
js_content += "window.leagueData = window.leagueData || { teams: [], players: [] };\n\n"

# We won't wipe ALL existing teams because we need Galatasaray, Fenerbahce, etc. 
# We'll just push the new clubs if they don't exist.
js_content += f"const worldTeams = {json.dumps(list(clubs.values()), indent=4, ensure_ascii=False)};\n"
js_content += """
worldTeams.forEach(t => {
    if (!window.leagueData.teams.some(existing => existing.id === t.id)) {
        window.leagueData.teams.push(t);
    }
});
"""

# Push players
js_content += f"\nconst worldPlayers = {json.dumps(players, indent=4, ensure_ascii=False)};\n"
js_content += "window.leagueData.players.push(...worldPlayers);\n"

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Bitti! {len(players)} oyuncu ve {len(clubs)} kulup data_fifa.js dosyasina yazildi.")

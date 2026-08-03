import sys
import json
import re
import codecs

data = """
226
Lucas Bergvall
Lucas Bergvall
Merkez Orta Saha
20
İsveç
Tottenham Hotspur
35.00 mil. € 
227
Marc Pubill
Stoper
23
İspanya
Atlético Madrid
35.00 mil. € 
228
Ange-Yoan Bonny
Ange-Yoan Bonny
Santrafor
22
Fildişi Sahili
Fransa
Inter Milan
35.00 mil. € 
229
Dango Ouattara
Dango Ouattara
Sağ Kanat
24
Burkina Faso
Brentford FC
35.00 mil. € 
230
Mika Godts
Mika Godts
Sol Kanat
21
Belçika
Ajax Amsterdam
35.00 mil. € 
231
Savinho
Savinho
Sol Kanat
22
Brezilya
Manchester City
35.00 mil. € 
232
Milos Kerkez
Milos Kerkez
Sol Bek
22
Macaristan
Sırbistan
Liverpool FC
35.00 mil. € 
233
Noah Sadiki
Noah Sadiki
Merkez Orta Saha
21
Kongo DC
Belçika
Sunderland AFC
35.00 mil. € 
234
Matias Fernandez-Pardo
Matias Fernandez-Pardo
Santrafor
21
Belçika
İspanya
LOSC Lille
35.00 mil. € 
235
Evanilson
Evanilson
Santrafor
26
Brezilya
AFC Bournemouth
35.00 mil. € 
236
Gerard Martín
Gerard Martín
Stoper
24
İspanya
FC Barcelona
35.00 mil. € 
237
Matías Soulé
Matías Soulé
Sağ Kanat
23
Arjantin
İtalya
AS Roma
35.00 mil. € 
238
Máximo Perrone
Máximo Perrone
Ön Libero
23
Arjantin
İspanya
Como 1907. Açıklama yok.
35.00 mil. € 
239
Yasin Ayari
Yasin Ayari
Merkez Orta Saha
22
İsveç
Tunus
Brighton & Hove Albion
35.00 mil. € 
240
Bilal El Khannouss
Bilal El Khannouss
On Numara
22
Fas
Belçika
VfB Stuttgart
35.00 mil. € 
241
Igor Paixão
Igor Paixão
Sol Kanat
25
Brezilya
Olympique Marsilya
35.00 mil. € 
242
Malo Gusto
Malo Gusto
Sağ Bek
23
Fransa
Martinique
Chelsea FC
35.00 mil. € 
243
Maxi Araújo
Maxi Araújo
Sol Bek
26
Uruguay
Sporting Lizbon
35.00 mil. € 
244
Edmond Tapsoba
Edmond Tapsoba
Stoper
27
Burkina Faso
Bayer 04 Leverkusen
35.00 mil. € 
245
Pedro Porro
Pedro Porro
Sağ Bek
26
İspanya
Tottenham Hotspur
35.00 mil. € 
246
Fisnik Asllani
Fisnik Asllani
Santrafor
23
Kosova
Almanya
TSG 1899 Hoffenheim
35.00 mil. € 
247
Bremer
Bremer
Stoper
29
Brezilya
Juventus
35.00 mil. € 
248
Senne Lammens
Senne Lammens
Kaleci
23
Belçika
Manchester United
35.00 mil. € 
249
Jacob Ramsey
Jacob Ramsey
Merkez Orta Saha
25
İngiltere
Newcastle United
35.00 mil. € 
250
Jeremie Frimpong
Jeremie Frimpong
Sağ Bek
25
Hollanda
Gana
Liverpool FC
35.00 mil. €
"""

lines = [line.strip() for line in data.split('\n') if line.strip()]

players = []
i = 0
while i < len(lines):
    # Match the rank number
    if re.match(r'^\d+$', lines[i]):
        rank = lines[i]
        i += 1
        name = lines[i]
        i += 1
        # skip repeated name if any
        if lines[i] == name:
            i += 1
        
        position = lines[i]
        i += 1
        
        age = int(lines[i])
        i += 1
        
        # Next lines are nationalities, skip until we hit club (which doesn't end in 'mil. €' and next line ends in 'mil. €')
        # Actually a safer way: keep advancing i until we hit 'mil. €'
        club = ""
        while i < len(lines) and "mil. €" not in lines[i]:
            club = lines[i]
            i += 1
        
        # The line before 'mil. €' might be the club.
        # But wait, nationalities might be 1 or 2 lines. The club is the line just before the value.
        
        value_str = lines[i]
        
        # Go back to find club properly if needed
        # In our loop, `club` will hold the last line seen before 'mil. €', which IS the club name.
        
        if "mil. €" in value_str:
            val_match = re.search(r'([\d\.]+)', value_str)
            if val_match:
                tm_val = float(val_match.group(1))
                game_val = round(tm_val / 3.5)
            else:
                game_val = 10
        
        # Role/trait guessing
        role = "box_to_box"
        trait = "elite"
        pos_lower = position.lower()
        if "kaleci" in pos_lower:
            role = "sweeper_keeper"
        elif "stoper" in pos_lower or "defans" in pos_lower:
            role = "stopper"
        elif "bek" in pos_lower:
            role = "wing_back"
        elif "kanat" in pos_lower or "açık" in pos_lower:
            role = "winger"
        elif "santrafor" in pos_lower or "forvet" in pos_lower:
            role = "poacher"
        elif "10 numara" in pos_lower:
            role = "playmaker"
            
        team_id = club.lower().replace(" ", "").replace("fc", "").replace("1907", "").replace(".", "")
        if not team_id:
            team_id = "free"
            
        players.append({
            "name": name,
            "position": position,
            "age": age,
            "teamId": team_id,
            "value": game_val,
            "role": role,
            "trait": trait
        })
    i += 1

# Append to data_world_stars.js
js_path = 'js/data_world_stars.js'
with codecs.open(js_path, 'r', 'utf-8') as f:
    js_content = f.read()

# Find the end of the array
end_idx = js_content.rfind(']')
if end_idx != -1:
    new_players_json = ",\n" + ",\n".join("    " + json.dumps(p, ensure_ascii=False) for p in players)
    updated_content = js_content[:end_idx] + new_players_json + "\n" + js_content[end_idx:]
    
    with codecs.open(js_path, 'w', 'utf-8') as f:
        # BOM is preserved if we write utf-8-sig but let's just write raw and then re-run add_bom
        f.write(updated_content)

print(f"Appended {len(players)} players.")

import json
import random
import re
import os

besiktasRaw = [
    { "name": 'E. Destanoğlu', "position": 'Kaleci', "age": 25, "value": 4.00, "role": 'classic', "trait": 'fragile' },
    { "name": 'D. Vásquez', "position": 'Kaleci', "age": 28, "value": 1.50, "role": 'classic', "trait": 'classic' },
    { "name": 'E. Bilgin', "position": 'Kaleci', "age": 22, "value": 0.40, "role": 'classic', "trait": 'classic' },
    { "name": 'E. Yaşar', "position": 'Kaleci', "age": 20, "value": 0.10, "role": 'classic', "trait": 'classic' },
    
    { "name": 'E. Agbadou', "position": 'Stoper', "age": 29, "value": 16.00, "role": 'stopper', "trait": 'elite' },
    { "name": 'T. Djaló', "position": 'Stoper', "age": 26, "value": 7.00, "role": 'stopper', "trait": 'elite' },
    { "name": 'E. Topçu', "position": 'Stoper', "age": 25, "value": 7.00, "role": 'stopper', "trait": 'aggressive' },
    { "name": 'Y. Özcan', "position": 'Stoper', "age": 20, "value": 5.00, "role": 'stopper', "trait": 'elite' },
    { "name": 'F. Uduokhai', "position": 'Stoper', "age": 28, "value": 3.50, "role": 'stopper', "trait": 'aggressive' },
    
    { "name": 'R. Yılmaz', "position": 'Sol Bek', "age": 25, "value": 5.00, "role": 'classic', "trait": 'aggressive' },
    { "name": 'A. Murillo', "position": 'Sağ Bek', "age": 30, "value": 7.00, "role": 'classic', "trait": 'aggressive' },
    { "name": 'T. Bulut', "position": 'Sağ Bek', "age": 20, "value": 5.00, "role": 'classic', "trait": 'elite' },
    { "name": 'G. Sazdağı', "position": 'Sağ Bek', "age": 31, "value": 1.20, "role": 'classic', "trait": 'classic' },
    
    { "name": 'K. Asllani', "position": 'Ön Libero', "age": 24, "value": 12.00, "role": 'anchor', "trait": 'elite' },
    { "name": 'W. Ndidi', "position": 'Ön Libero', "age": 29, "value": 8.00, "role": 'anchor', "trait": 'aggressive' },
    { "name": 'K. Yılmaz', "position": 'Ön Libero', "age": 25, "value": 2.50, "role": 'playmaker', "trait": 'playmaker' },
    { "name": 'N. Uysal', "position": 'Ön Libero', "age": 35, "value": 0.10, "role": 'anchor', "trait": 'classic' },
    
    { "name": 'O. Kökçü', "position": 'Merkez Orta Saha', "age": 25, "value": 25.00, "role": 'maestro', "trait": 'elite' },
    { "name": 'S. Uçan', "position": 'Merkez Orta Saha', "age": 32, "value": 0.80, "role": 'maestro', "trait": 'playmaker' },
    
    { "name": 'J. Olaitan', "position": '10 Numara', "age": 24, "value": 7.00, "role": 'playmaker', "trait": 'elite' },
    
    { "name": 'E. Touré', "position": 'Sol Açık', "age": 24, "value": 13.00, "role": 'inside_forward', "trait": 'elite' },
    { "name": 'J. Silva', "position": 'Sol Açık', "age": 26, "value": 10.00, "role": 'inside_forward', "trait": 'aggressive' },
    { "name": 'D. Şahin', "position": 'Sol Açık', "age": 19, "value": 0.40, "role": 'winger', "trait": 'classic' },
    
    { "name": 'V. Cerny', "position": 'Sağ Açık', "age": 28, "value": 7.00, "role": 'inside_forward', "trait": 'elite' },
    { "name": 'C. Ünder', "position": 'Sağ Açık', "age": 28, "value": 4.00, "role": 'inside_forward', "trait": 'fragile' },
    { "name": 'M. Rashica', "position": 'Sağ Açık', "age": 29, "value": 3.50, "role": 'inside_forward', "trait": 'aggressive' },
    
    { "name": 'H. Oh', "position": 'Santrafor', "age": 25, "value": 15.00, "role": 'poacher', "trait": 'elite' },
    { "name": 'M. Hekimoğlu', "position": 'Santrafor', "age": 19, "value": 5.00, "role": 'poacher', "trait": 'poacher' }
]

def get_power(val):
    if val >= 25: return 84
    if val >= 15: return 81 + random.randint(0, 1)
    if val >= 10: return 78 + random.randint(0, 1)
    if val >= 7: return 76 + random.randint(0, 1)
    if val >= 5: return 74 + random.randint(0, 1)
    if val >= 3: return 72 + random.randint(0, 1)
    if val >= 1: return 70 + random.randint(0, 1)
    return 65 + random.randint(0, 3)

new_players = []
for p in besiktasRaw:
    pid = re.sub(r'\W+', '', p['name']).lower() + '_besiktas'
    new_players.append({
        "id": pid,
        "name": p['name'],
        "position": p['position'],
        "power": get_power(p['value']),
        "speed": random.randint(3, 7) - (2 if p['position'] == 'Kaleci' else 0),
        "age": p['age'],
        "teamId": "besiktas",
        "tacticalRole": p['role'],
        "mentalTrait": p['trait'],
        "contractYears": random.randint(1, 3),
        "isListed": False
    })

file_path = 'js/data_superlig.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# find const trPlayers = [ ... ]
start_idx = content.find('const trPlayers = [')
if start_idx == -1:
    print('trPlayers not found')
    exit()

# find matching closing bracket
bracket_count = 0
end_idx = -1
for i in range(start_idx + 18, len(content)):
    if content[i] == '[':
        bracket_count += 1
    elif content[i] == ']':
        bracket_count -= 1
        if bracket_count == 0:
            end_idx = i
            break

if end_idx == -1:
    print('Closing bracket not found')
    exit()

json_str = content[start_idx+18 : end_idx+1]
try:
    players = json.loads(json_str)
except Exception as e:
    print('Failed to parse JSON:', e)
    exit()

filtered_players = [p for p in players if p.get('teamId') != 'besiktas']
filtered_players.extend(new_players)

new_json_str = json.dumps(filtered_players, indent=4, ensure_ascii=False)
new_content = content[:start_idx+18] + new_json_str + content[end_idx+1:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully updated Besiktas roster. Old size: {len(players)}, New size: {len(filtered_players)}")

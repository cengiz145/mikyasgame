import json
import re

path = r"js\data_superlig.js"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# TRABZONSPOR SQUAD (2024/2025 realistic)
ts_players = [
    {"id": "ts_1", "name": "Uğurcan Çakır", "teamId": "trabzonspor", "position": "KL", "power": 85, "age": 28, "value": 12, "wage": 2, "morale": 90, "fitness": 100, "form": 8, "contractYears": 3},
    {"id": "ts_2", "name": "M. Taha Tepe", "teamId": "trabzonspor", "position": "KL", "power": 70, "age": 23, "value": 2, "wage": 0.5, "morale": 80, "fitness": 100, "form": 6, "contractYears": 2},
    {"id": "ts_3", "name": "Stefan Savic", "teamId": "trabzonspor", "position": "DF", "power": 84, "age": 33, "value": 4, "wage": 2.5, "morale": 85, "fitness": 95, "form": 7, "contractYears": 2},
    {"id": "ts_4", "name": "Stefano Denswil", "teamId": "trabzonspor", "position": "DF", "power": 78, "age": 31, "value": 3, "wage": 1.5, "morale": 80, "fitness": 98, "form": 6, "contractYears": 1},
    {"id": "ts_5", "name": "Serdar Saatçı", "teamId": "trabzonspor", "position": "DF", "power": 76, "age": 21, "value": 5, "wage": 1, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "ts_6", "name": "Eren Elmalı", "teamId": "trabzonspor", "position": "DF", "power": 78, "age": 24, "value": 6, "wage": 1, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_7", "name": "Borna Barisic", "teamId": "trabzonspor", "position": "DF", "power": 77, "age": 31, "value": 3, "wage": 1.5, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "ts_8", "name": "Pedro Malheiro", "teamId": "trabzonspor", "position": "DF", "power": 76, "age": 23, "value": 4, "wage": 1, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_9", "name": "Batista Mendy", "teamId": "trabzonspor", "position": "OS", "power": 82, "age": 24, "value": 10, "wage": 1.5, "morale": 90, "fitness": 100, "form": 8, "contractYears": 3},
    {"id": "ts_10", "name": "Okay Yokuşlu", "teamId": "trabzonspor", "position": "OS", "power": 80, "age": 30, "value": 4, "wage": 1.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_11", "name": "John Lundstram", "teamId": "trabzonspor", "position": "OS", "power": 78, "age": 30, "value": 3, "wage": 1.5, "morale": 80, "fitness": 95, "form": 6, "contractYears": 2},
    {"id": "ts_12", "name": "Ozan Tufan", "teamId": "trabzonspor", "position": "OS", "power": 79, "age": 29, "value": 4, "wage": 1.5, "morale": 85, "fitness": 98, "form": 7, "contractYears": 3},
    {"id": "ts_13", "name": "Enis Bardhi", "teamId": "trabzonspor", "position": "OS", "power": 79, "age": 29, "value": 5, "wage": 1.5, "morale": 80, "fitness": 100, "form": 7, "contractYears": 1},
    {"id": "ts_14", "name": "Muhammed Cham", "teamId": "trabzonspor", "position": "OS", "power": 81, "age": 23, "value": 8, "wage": 1.5, "morale": 90, "fitness": 100, "form": 8, "contractYears": 4},
    {"id": "ts_15", "name": "Cihan Çanak", "teamId": "trabzonspor", "position": "OS", "power": 75, "age": 19, "value": 4, "wage": 0.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 4},
    {"id": "ts_16", "name": "Edin Visca", "teamId": "trabzonspor", "position": "OS", "power": 82, "age": 34, "value": 2, "wage": 2, "morale": 90, "fitness": 90, "form": 8, "contractYears": 1},
    {"id": "ts_17", "name": "Anthony Nwakaeme", "teamId": "trabzonspor", "position": "OS", "power": 81, "age": 35, "value": 1, "wage": 1.8, "morale": 90, "fitness": 85, "form": 7, "contractYears": 1},
    {"id": "ts_18", "name": "Simon Banza", "teamId": "trabzonspor", "position": "FV", "power": 83, "age": 27, "value": 15, "wage": 2.5, "morale": 95, "fitness": 100, "form": 9, "contractYears": 1},
    {"id": "ts_19", "name": "Denis Drăguș", "teamId": "trabzonspor", "position": "FV", "power": 79, "age": 25, "value": 6, "wage": 1.2, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3},
    {"id": "ts_20", "name": "Enis Destan", "teamId": "trabzonspor", "position": "FV", "power": 76, "age": 22, "value": 5, "wage": 0.8, "morale": 85, "fitness": 100, "form": 7, "contractYears": 3}
]

# Hedef arrayin başlangıcını bul. trPlayers = [ ... ]
pattern = r'(const trPlayers = \[)(.*?)(\];)'

# parse js object with regex is hard, so let's just find and replace the individual object strings that have teamId: 'trabzonspor'
# But wait, trPlayers is an array of objects.
match = re.search(pattern, content, re.DOTALL)
if match:
    array_content = match.group(2)
    # Split into objects
    # We will reconstruct array_content by keeping non-trabzonspor players and appending real trabzonspor players
    # Find all { ... } blocks
    blocks = re.findall(r'\{[^{}]*\}', array_content, re.DOTALL)
    new_blocks = []
    for block in blocks:
        if '"teamId": "trabzonspor"' not in block:
            new_blocks.append(block)
    
    # Append ts_players as json strings
    for p in ts_players:
        new_blocks.append(json.dumps(p, ensure_ascii=False, indent=8))
        
    new_array_content = ',\n'.join(new_blocks)
    new_content = content[:match.start(2)] + '\n' + new_array_content + '\n' + content[match.end(2):]
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Updated Trabzonspor squad.")
else:
    print("Could not find trPlayers array.")

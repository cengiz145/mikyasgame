import json
import os

transcript_path = r"C:\Users\Umit Ekrem Mikyas\.gemini\antigravity-ide\brain\f5dad394-43eb-4e57-9a75-55881090fe3f\.system_generated\logs\transcript_full.jsonl"

found_contents = []

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            # Check if this was a view_file output that showed game.js
            # Actually, the best way to get the original game.js is if the previous agent used `grep_search` or `view_file`
            content_str = data.get('content', '')
            if 'Total Lines: 4746' in content_str or 'Total Lines: 4747' in content_str:
                if 'Showing lines 1 to 4747' in content_str or 'file:///c:/Users/Umit%20Ekrem%20Mikyas/Downloads/wep%20sitem/futbol/js/game.js' in content_str:
                    found_contents.append(content_str)
                    
            # Also check tool_calls for write_to_file or replace_file_content
            for tool_call in data.get('tool_calls', []):
                args = tool_call.get('arguments', {})
                if tool_call.get('name') == 'default_api:write_to_file':
                    if 'game.js' in str(args.get('TargetFile', '')):
                        found_contents.append(args.get('CodeContent', ''))
        except:
            pass

print(f"Found {len(found_contents)} potential game.js contents.")
if found_contents:
    with open('recovered_game.js_log.txt', 'w', encoding='utf-8') as out:
        out.write(found_contents[-1])
    print("Wrote last found content to recovered_game.js_log.txt")

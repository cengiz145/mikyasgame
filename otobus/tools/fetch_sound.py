import os, sys, json, urllib.request, urllib.parse, subprocess

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "freesound_config.json")

def load_api_key():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("freesound_api_key")
        except Exception:
            pass
    return "eXIQ5gzLvhsNbaRY7tECJlybDkY7PbV6fuLPRFDT"

def search_and_download(query, target_filename, exclude_tags=None, min_duration=2, max_duration=120):
    api_key = load_api_key()
    if exclude_tags is None:
        exclude_tags = ["drum", "beat", "music", "construction", "loop"]
    
    filter_expr = f"duration:[{min_duration} TO {max_duration}]"
    params = {
        "query": query,
        "token": api_key,
        "filter": filter_expr,
        "fields": "id,name,tags,description,duration,previews,license",
        "sort": "rating_desc",
        "page_size": 15
    }
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode(params)
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode('utf-8'))
    
    results = data.get("results", [])
    print(f"Found {len(results)} potential sounds for '{query}'. Filtering...")
    
    selected = None
    for r in results:
        tags = [t.lower() for t in r.get("tags", [])]
        name = r.get("name", "").lower()
        if any(bad in tags or bad in name for bad in exclude_tags):
            continue
        selected = r
        break
        
    if not selected and results:
        selected = results[0]
        
    if not selected:
        print("No suitable sound found.")
        return None
        
    print(f"Selected: ID {selected['id']} - '{selected['name']}' ({selected['duration']:.1f}s)")
    previews = selected.get("previews", {})
    mp3_url = previews.get("preview-hq-mp3") or previews.get("preview-lq-mp3")
    
    if not mp3_url:
        print("No preview URL.")
        return None
        
    dest_path = os.path.join(os.path.dirname(__file__), "..", "sounds", target_filename)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    cmd = [
        "curl.exe", "-s", "-L", "--max-time", "25",
        "-e", "https://freesound.org/",
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        mp3_url, "-o", dest_path
    ]
    subprocess.run(cmd, check=True)
    print(f"Successfully downloaded to: {dest_path}")
    return dest_path

if __name__ == "__main__":
    if len(sys.argv) > 2:
        search_and_download(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python fetch_sound.py <query> <output_filename.mp3>")

#!/usr/bin/env python3
# manage_monsters.py - list, edit or delete the custom monsters that were added
# with add_monster.py. It reads the colocar_<name>(...) definitions from
# includes/comandos.nvgt and the spawn calls from BC-servidor.nvgt, lets you pick
# one by number, then edit or delete it. When editing, press Enter on a question to
# keep the current value, or type a new value to change it. After every operation it
# returns to the list. Recompile + restart the server when you are done.
import os, re

BASE = os.path.dirname(os.path.abspath(__file__))
COMANDOS = os.path.join(BASE, "includes", "comandos.nvgt")
BCSERV = os.path.join(BASE, "BC-servidor.nvgt")
SPAWN_MARKER = "==== CUSTOM_MONSTER_SPAWNS"

# one custom-monster definition line, e.g.:
# void colocar_zeus(int x, int y, string m){ spawn_custom_monster("zeus", x, y, m, ...); }
DEF_RE = re.compile(
    r'^[ \t]*void\s+colocar_(\w+)\s*\(\s*int x,\s*int y,\s*string m\s*\)\s*\{\s*'
    r'spawn_custom_monster\s*\((.*)\)\s*;\s*\}[ \t]*$')


def read(path):
    with open(path, "r", encoding="utf-8", newline="") as f:
        return f.read()


def write(path, s):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def eol(s):
    return "\r\n" if "\r\n" in s else "\n"


def split_args(s):
    # split on top-level commas, respecting "double quotes"
    out, cur, q = [], "", False
    for ch in s:
        if ch == '"':
            q = not q
            cur += ch
        elif ch == "," and not q:
            out.append(cur.strip())
            cur = ""
        else:
            cur += ch
    out.append(cur.strip())
    return out


def parse_monsters(com):
    # returns ordered list of dicts: {name, line, hp, speed, ...}
    out = []
    for ln in com.split(eol(com)):
        mm = DEF_RE.match(ln)
        if not mm:
            continue
        name = mm.group(1)
        vals = split_args(mm.group(2))[4:]  # drop "name", x, y, m
        if len(vals) < 7:
            continue
        d = {
            "name": name, "line": ln,
            "hp": int(vals[0]), "speed": int(vals[1]), "damage": int(vals[2]),
            "atk": int(vals[3]), "respawn": int(vals[4]),
            "yup": vals[5], "ydown": vals[6],
            "xp_min": 0, "xp_max": 0, "drop_item": "", "drop_min": 0, "drop_max": 0,
        }
        if len(vals) >= 12:
            d["xp_min"] = int(vals[7]); d["xp_max"] = int(vals[8])
            d["drop_item"] = vals[9].strip('"'); d["drop_min"] = int(vals[10]); d["drop_max"] = int(vals[11])
        out.append(d)
    return out


def build_line(d):
    return ('void colocar_%s(int x, int y, string m){ spawn_custom_monster("%s", x, y, m, %d, %d, %d, %d, %d, %s, %s, %d, %d, "%s", %d, %d); }'
            % (d["name"], d["name"], d["hp"], d["speed"], d["damage"], d["atk"], d["respawn"],
               d["yup"], d["ydown"], d["xp_min"], d["xp_max"], d["drop_item"], d["drop_min"], d["drop_max"]))


def parse_spawns(bc, name):
    # returns list of (map, x, y) for colocar_<name>(x, y, "map");
    rx = re.compile(r'colocar_%s\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*"([^"]*)"\s*\)\s*;' % re.escape(name))
    return [(g.group(3), int(g.group(1)), int(g.group(2))) for g in rx.finditer(bc)]


def insert_after_marker(text, marker, new_lines, e):
    out, done = [], False
    for ln in text.split(e):
        out.append(ln)
        if (not done) and marker in ln:
            out.extend(new_lines)
            done = True
    return e.join(out), done


def remove_call_lines(bc, name, e):
    rx = re.compile(r'^\s*colocar_%s\s*\(' % re.escape(name))
    return e.join(ln for ln in bc.split(e) if not rx.match(ln))


# ---- prompts (Enter keeps the current value) ----

def ask_keep_int(prompt, cur, minv=None):
    while True:
        v = input("%s [%s] (Enter=keep): " % (prompt, cur)).strip()
        if v == "":
            return cur
        if v.lstrip("-").isdigit():
            iv = int(v)
            if minv is not None and iv < minv:
                print("  must be >= %d" % minv); continue
            return iv
        print("  enter a whole number, or Enter to keep")


def ask_keep_bool(prompt, cur):
    while True:
        v = input("%s (y/n) [%s] (Enter=keep): " % (prompt, "yes" if cur == "true" else "no")).strip().lower()
        if v == "":
            return cur
        if v in ("y", "yes", "i", "igen"):
            return "true"
        if v in ("n", "no", "nem"):
            return "false"
        print("  y, n or Enter to keep")


def ask_keep_range(label, curlo, curhi, minv=0):
    cur = str(curlo) if curlo == curhi else "%d to %d" % (curlo, curhi)
    print("  %s (same number twice = a fixed amount). current: %s" % (label, cur))
    while True:
        lo = ask_keep_int("    minimum", curlo, minv)
        hi = ask_keep_int("    maximum", curhi, minv)
        if hi >= lo:
            return lo, hi
        print("    maximum must be >= minimum")


def edit_monster(d, bc, e_bc):
    print("\n--- Editing '%s' (Enter keeps the current value) ---" % d["name"])

    # rename
    while True:
        nn = input("Name [%s] (Enter=keep): " % d["name"]).strip()
        if nn == "":
            newname = d["name"]; break
        if re.fullmatch(r"[A-Za-z0-9_]+", nn):
            newname = nn; break
        print("  letters, numbers and _ only")
    oldname = d["name"]

    d["hp"] = ask_keep_int("HP (health)", d["hp"], 1)
    d["speed"] = ask_keep_int("Speed (ms between steps, lower = faster)", d["speed"], 1)
    d["damage"] = ask_keep_int("Damage per hit", d["damage"], 0)
    d["atk"] = ask_keep_int("Number of attack sound files", d["atk"], 1)
    d["respawn"] = ask_keep_int("Respawn time in ms (0 = never)", d["respawn"], 0)
    d["yup"] = ask_keep_bool("Can it follow the player UP the stairs?", d["yup"])
    d["ydown"] = ask_keep_bool("Can it follow the player DOWN the stairs?", d["ydown"])
    d["xp_min"], d["xp_max"] = ask_keep_range("XP given on death (0 and 0 = no xp)", d["xp_min"], d["xp_max"], 0)

    # drop
    has = d["drop_item"] != ""
    cur = ("yes: %s x %s" % (d["drop_item"], str(d["drop_min"]) if d["drop_min"] == d["drop_max"] else "%d-%d" % (d["drop_min"], d["drop_max"]))) if has else "no"
    while True:
        v = input("Should it drop an item on death? (y/n) [%s] (Enter=keep): " % cur).strip().lower()
        if v == "":
            break
        if v in ("n", "no", "nem"):
            d["drop_item"] = ""; d["drop_min"] = d["drop_max"] = 0; break
        if v in ("y", "yes", "i", "igen"):
            while True:
                it = input("  Item name [%s] (Enter=keep): " % (d["drop_item"] or "(none)")).strip()
                if it == "" and d["drop_item"]:
                    break
                if it and " " not in it and '"' not in it:
                    d["drop_item"] = it; break
                print("    item name has no spaces")
            d["drop_min"], d["drop_max"] = ask_keep_range("Item amount", d["drop_min"] or 1, d["drop_max"] or 1, 1)
            break
        print("  y, n or Enter to keep")

    d["name"] = newname

    # spawn locations
    spawns = parse_spawns(bc, oldname)
    shown = ", ".join("%s(%d,%d)" % (m, x, y) for (m, x, y) in spawns) or "(none)"
    print("Current spawn locations: %s" % shown)
    v = input("Edit spawn locations? (y/n) [keep] (Enter=keep): ").strip().lower()
    new_spawns = None
    if v in ("y", "yes", "i", "igen"):
        new_spawns = []
        print("  Enter the new spawn locations. Blank map name when finished.")
        while True:
            m = input("    Spawn map (blank to finish): ").strip()
            if m == "":
                break
            if " " in m:
                print("      map name cannot contain spaces"); continue
            x = ask_keep_int("    X position", 0)
            y = ask_keep_int("    Y position", 0)
            new_spawns.append((m, x, y))
        if not new_spawns:
            print("  (no locations entered - keeping the existing ones)")
            new_spawns = None

    # apply to bc: rename and/or replace spawns
    if new_spawns is not None:
        bc = remove_call_lines(bc, oldname, e_bc)
        calls = ['colocar_%s(%d, %d, "%s");' % (newname, x, y, m) for (m, x, y) in new_spawns]
        bc, _ = insert_after_marker(bc, SPAWN_MARKER, calls, e_bc)
    elif newname != oldname:
        bc = re.sub(r'colocar_%s\s*\(' % re.escape(oldname), 'colocar_%s(' % newname, bc)

    return d, bc, (newname != oldname), oldname, newname


def main():
    for p in (COMANDOS, BCSERV):
        if not os.path.exists(p):
            print("!! File not found: %s\n   Run this from inside the server folder." % p)
            return

    while True:
        com = read(COMANDOS); bc = read(BCSERV)
        e_com = eol(com); e_bc = eol(bc)
        monsters = parse_monsters(com)

        print("\n=== Custom monsters ===")
        if not monsters:
            print("  (none found - use add_monster.py to create some)")
            return
        for i, d in enumerate(monsters, 1):
            print("  %2d) %s" % (i, d["name"]))
        print("   0) Quit")

        sel = input("Pick a monster number: ").strip()
        if sel == "0":
            print("Bye."); return
        if not sel.isdigit() or not (1 <= int(sel) <= len(monsters)):
            print("  invalid number"); continue
        d = monsters[int(sel) - 1]

        print("\n--- '%s' ---" % d["name"])
        print("  1) Edit")
        print("  2) Delete")
        print("  0) Back to the list")
        act = input("What do you want to do? ").strip()

        if act == "1":
            d2, bc2, renamed, oldname, newname = edit_monster(dict(d), bc, e_bc)
            com2 = com.replace(d["line"], build_line(d2))
            write(COMANDOS, com2)
            write(BCSERV, bc2)
            print("\nSaved changes to '%s'.%s" % (newname, ("  (renamed from '%s')" % oldname) if renamed else ""))
            print(">> Recompile the server (C:\\nvgt\\nvgt.exe -c BC-servidor.nvgt) and restart it.")
        elif act == "2":
            yn = input("Really delete '%s'? (y/n): " % d["name"]).strip().lower()
            if yn in ("y", "yes", "i", "igen"):
                com2 = e_com.join(ln for ln in com.split(e_com) if ln != d["line"])
                bc2 = remove_call_lines(bc, d["name"], e_bc)
                write(COMANDOS, com2)
                write(BCSERV, bc2)
                print("Deleted '%s'." % d["name"])
                print(">> Recompile the server (C:\\nvgt\\nvgt.exe -c BC-servidor.nvgt) and restart it.")
            else:
                print("  delete cancelled")
        else:
            pass  # back to the list


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nCancelled.")

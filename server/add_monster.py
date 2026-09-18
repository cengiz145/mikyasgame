#!/usr/bin/env python3
# add_monster.py - interactively add a custom monster to the server source.
# It writes a colocar_<name>(x, y, map) definition into includes/comandos.nvgt and
# the spawn call(s) into BC-servidor.nvgt, the same way the built-in monsters work.
# Run it, answer the questions, then recompile + restart the server.
import os, re, sys

BASE = os.path.dirname(os.path.abspath(__file__))
COMANDOS = os.path.join(BASE, "includes", "comandos.nvgt")
BCSERV = os.path.join(BASE, "BC-servidor.nvgt")
DEF_MARKER = "==== CUSTOM_MONSTER_DEFINITIONS"
SPAWN_MARKER = "==== CUSTOM_MONSTER_SPAWNS"


def read(path):
    with open(path, "r", encoding="utf-8", newline="") as f:
        return f.read()


def write(path, s):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def eol(s):
    return "\r\n" if "\r\n" in s else "\n"


def ask_int(prompt, minv=None):
    while True:
        v = input(prompt + ": ").strip()
        if v.lstrip("-").isdigit():
            iv = int(v)
            if minv is not None and iv < minv:
                print("  must be >= %d" % minv)
                continue
            return iv
        print("  please enter a whole number")


def ask_yesno(prompt):
    while True:
        v = input(prompt + " (y/n): ").strip().lower()
        if v in ("y", "yes", "i", "igen"):
            return "true"
        if v in ("n", "no", "nem"):
            return "false"
        print("  please answer y or n")


def ask_bool(prompt):
    return ask_yesno(prompt) == "true"


def ask_range(label, minv=0):
    # Asks a min and a max. If you type the same number for both, it is a fixed amount
    # (random(n, n) == n), otherwise a random value between them.
    while True:
        lo = ask_int(label + " - minimum (lowest amount)", minv)
        hi = ask_int(label + " - maximum (highest amount)", minv)
        if hi >= lo:
            return lo, hi
        print("  the maximum must be >= the minimum")


def insert_after_marker(text, marker, new_lines, e):
    lines = text.split(e)
    out = []
    done = False
    for ln in lines:
        out.append(ln)
        if (not done) and marker in ln:
            out.extend(new_lines)
            done = True
    return (e.join(out), done)


def main():
    for p in (COMANDOS, BCSERV):
        if not os.path.exists(p):
            print("!! File not found: %s" % p)
            print("   Run this script from inside the server folder.")
            return

    com = read(COMANDOS)
    bc = read(BCSERV)
    if DEF_MARKER not in com:
        print("!! Marker '%s' not found in comandos.nvgt." % DEF_MARKER); return
    if SPAWN_MARKER not in bc:
        print("!! Marker '%s' not found in BC-servidor.nvgt." % SPAWN_MARKER); return

    print("=== Add a custom monster ===")
    while True:
        name = input("Monster name (identifier + sound prefix, letters/numbers/_ only): ").strip()
        if re.fullmatch(r"[A-Za-z0-9_]+", name or ""):
            break
        print("  invalid name (letters, numbers and _ only, no spaces)")
    if ("void colocar_%s(" % name) in com:
        print("!! A monster called '%s' already exists (colocar_%s). Aborting." % (name, name))
        return

    hp = ask_int("HP (health)", 1)
    speed = ask_int("Speed (ms between steps, lower = faster)", 1)
    damage = ask_int("Damage per hit", 0)
    atk = ask_int("Number of attack sound files (%s_attack1..N.ogg)" % name, 1)
    respawn = ask_int("Respawn time in ms after death (0 = never respawns)", 0)
    yup = ask_yesno("Can it follow the player UP the stairs?")
    ydown = ask_yesno("Can it follow the player DOWN the stairs?")

    xp_min, xp_max = ask_range("XP given to the killer on death (0 and 0 = no xp)")
    drop_item = ""
    drop_min = drop_max = 0
    if ask_bool("Should it drop an item to the killer when it dies?"):
        while True:
            drop_item = input("  Item name (e.g. coins, reais, bomba_relogio - no spaces): ").strip()
            if drop_item and " " not in drop_item and '"' not in drop_item:
                break
            print("    invalid item name (no spaces)")
        drop_min, drop_max = ask_range("  Item amount")

    spawns = []
    print("Spawn location(s) - enter a blank map name when you are finished.")
    while True:
        m = input("  Spawn map (blank to finish): ").strip()
        if m == "":
            break
        if " " in m:
            print("    map name cannot contain spaces"); continue
        x = ask_int("    X position")
        y = ask_int("    Y position")
        spawns.append((m, x, y))
    if not spawns:
        print("!! No spawn location given. Aborting.")
        return

    e1 = eol(com)
    func = ('void colocar_%s(int x, int y, string m){ spawn_custom_monster("%s", x, y, m, %d, %d, %d, %d, %d, %s, %s, %d, %d, "%s", %d, %d); }'
            % (name, name, hp, speed, damage, atk, respawn, yup, ydown, xp_min, xp_max, drop_item, drop_min, drop_max))
    com2, ok1 = insert_after_marker(com, DEF_MARKER, [func], e1)

    e2 = eol(bc)
    calls = ['colocar_%s(%d, %d, "%s");' % (name, x, y, m) for (m, x, y) in spawns]
    bc2, ok2 = insert_after_marker(bc, SPAWN_MARKER, calls, e2)

    if not (ok1 and ok2):
        print("!! Could not find an insertion marker. Nothing was written.")
        return

    write(COMANDOS, com2)
    write(BCSERV, bc2)

    print()
    print("Done! Monster '%s' added:" % name)
    print("  - definition added to includes/comandos.nvgt  ->  colocar_%s(...)" % name)
    for (m, x, y) in spawns:
        print("  - spawns on map '%s' at (%d, %d)" % (m, x, y))
    if xp_max > 0:
        print("  - gives XP on death: %s" % (str(xp_min) if xp_min == xp_max else "random %d to %d" % (xp_min, xp_max)))
    if drop_item:
        amt = str(drop_min) if drop_min == drop_max else "random %d to %d" % (drop_min, drop_max)
        print("  - drops on death: %s x %s" % (drop_item, amt))
    print("  Sounds: %s_attack1..%d.ogg (attack), %s_death.ogg (death), plus terrain step sounds." % (name, atk, name))
    print(">> Now recompile the server (C:\\nvgt\\nvgt.exe -c BC-servidor.nvgt) and restart it.")


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nCancelled.")

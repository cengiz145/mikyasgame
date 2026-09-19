# Constant Battle — Command Reference

Every command below can be typed in English. The original Portuguese (and
Spanish/French) spellings still work — they are aliases for the same command,
so nothing you already know has stopped working.

Type commands into the chat line, starting with `/`.

---

## Player commands

### Communication

| English | Also accepts | What it does |
|---|---|---|
| `/say <text>` | `/falar` | Speak out loud to players nearby |
| `/saymap <text>` | `/falarnomapa` | Speak to everyone on your current map |
| `/pm <player> <text>` | | Send a private message |
| `/reply <text>` | `/r`, `/responder` | Reply to the last private message you received |
| `/me <text>` | | Emote — "*YourName does something*" |
| `/t <text>` | `/e` | Talk to your team |
| `/ign <player>` | | Ignore a player |
| `/deign <player>` | | Stop ignoring a player |
| `/igns` | | List everyone you are ignoring |

### Information

| English | Also accepts | What it does |
|---|---|---|
| `/help` | `/ajuda`, `/ayuda` | Show the in-game help |
| `/rules` | `/regras`, `/reglas`, `/règles` | Show the server rules |
| `/listplayers` | `/listar` | List the players currently online |
| `/howmany` | `/quantos` | Show how many players are online |
| `/wearing` | `/vestindo` | Show what you are currently wearing |
| `/showmap` | `/mmapa` | Describe the map you are on |
| `/record` | `/peak`, `/recorde` | Show the server's player-count record |
| `/inv` | | Open your inventory |
| `/invs` | | Open your secondary inventory |

### Team

| English | Also accepts | What it does |
|---|---|---|
| `/teama <player>` | `/equipea`, `/équipe` | Add a player to your team |
| `/teaml` | `/equipel`, `/équipement` | List your team members |
| `/teamr <player>` | `/equiper`, `/équipeur` | Remove a player from your team |
| `/teamq` | `/equipes`, `/équipes` | Leave your team |
| `/equiped` | | Disband your team |

### Auction house

| English | Also accepts | What it does |
|---|---|---|
| `/auction <item> <price>` | `/leilão`, `/subasta`, `/vente` | Put an item up for auction |
| `/bid <amount>` | `/ofertar` | Bid on the current auction |

### Message board

| English | Also accepts | What it does |
|---|---|---|
| `/readboard` | `/lerquadro`, `/leercuadro`, `/lircadre` | Read the message board |
| `/writeboard <text>` | `/escreverquadro`, `/escribircuadro`, `/écriscadre` | Write on the message board |

### Account

| English | Also accepts | What it does |
|---|---|---|
| `/changepassword` | | Change your password |
| `/deleteme` | | Delete your own character (permanent) |
| `/newbie` | `/novato` | Toggle newbie status |
| `/afk` | | Mark yourself away from keyboard |
| `/pacifista` | | Toggle pacifist mode |
| `/quest <name>` | | Start a quest |

### Vehicles and equipment

| English | Also accepts | What it does |
|---|---|---|
| `/helicopter` | `/helicoptero` | Call a helicopter |
| `/joinpirates` | `/entrarpiratas` | Join the pirates |
| `/cannon` | `/canhão` | Fire the cannon |
| `/cannondown` | `/canhãod` | Lower the cannon |

---

## Administrator commands

These require admin or moderator rights. Use them carefully — several are
destructive and cannot be undone.

### Players

| English | Also accepts | What it does |
|---|---|---|
| `/kick <player>` | `/expulsar` | Disconnect a player |
| `/ban <player>` | `/banear` | Ban a player |
| `/unban <player>` | `/desbanir`, `/desbanear` | Lift a ban |
| `/bannick <nick>` | `/banirn` | Ban a nickname |
| `/clearbans` | | Clear the ban list |
| `/banned` | | List banned players |
| `/arrest <player>` | `/prender` | Send a player to jail |
| `/fine <player> <amount>` | `/multar` | Fine a player |
| `/moveplayer <player> <map>` | `/mover` | Move a player to another map |
| `/killplayer <player>` | | Kill a player |
| `/setgender <player>` | `/msexo` | Set a player's gender |
| `/givexp <player> <amount>` | `/darxp` | Grant experience points |
| `/sethealth <player> <value>` | `/svida` | Set a player's health |
| `/raisehealth <player>` | `/subirvida` | Raise a player's health |
| `/lowerhealth <player>` | `/descervida` | Lower a player's health |
| `/novest <player>` | `/ncolete` | Remove a player's vest |
| `/getinv <player>` | | Inspect a player's inventory |
| `/setinv <player> ...` | | Modify a player's inventory |
| `/getpassword <player>` | | Read a player's password |
| `/setpassword <player> <pw>` | | Set a player's password |
| `/ip <player>` | | Show a player's IP address |

### Ranks

| English | Also accepts | What it does |
|---|---|---|
| `/setadmin <player>` | `/administrador` | Grant administrator rank |
| `/deladmin <player>` | `/dadministrador` | Revoke administrator rank |
| `/setmoderator <player>` | `/moderador` | Grant moderator rank |
| `/delmoderator <player>` | `/dmoderador` | Revoke moderator rank |
| `/setowner <player>` | `/mdono` | Set the server owner |
| `/addadmin <player>` | `/aadm` | Add to the admin list |
| `/saveranks` | `/rsalvar` | Save the rank table to disk |

### Maps and world

| English | Also accepts | What it does |
|---|---|---|
| `/listmaps` | `/lmapas` | List all maps |
| `/newmap <name>` | | Create a map |
| `/deletemap <name>` | `/delmap`, `/delete_map` | Delete a map |
| `/changemap <map>` | | Move yourself to a map |
| `/savemaps` | `/msalvar` | Save all maps to disk |
| `/wall ...` | `/parede` | Place a wall |
| `/adddoor ...` | `/adicionard` | Place a door |
| `/addmonster ...` | `/adicionarm` | Spawn a monster |
| `/addbomb ...` | `/abomba` | Place a bomb |
| `/adddart ...` | `/adardo` | Place a dart trap |
| `/addtape ...` | `/afita` | Place explosive tape |
| `/placearmoredcar` | `/colocar_cforte` | Place an armored car |
| `/rawmap <map>` | | Dump raw map data |
| `/item_maps` | | List item maps |

### Message board / flags

| English | Also accepts | What it does |
|---|---|---|
| `/addboard <text>` | `/aquadro` | Add a board entry |
| `/updateboard` | `/atudoquadro` | Refresh the whole board |
| `/setflag ...` | `/fbandeira` | Set a flag |
| `/initflag ...` | `/inibandeira` | Initialise a flag |
| `/listflags` | `/listarbandeira` | List all flags |

### Events and challenges

| English | Also accepts | What it does |
|---|---|---|
| `/event ...` | `/evento` | Start an event |
| `/challengeadd ...` | `/desafioa` | Add a challenge |
| `/challengemod ...` | `/desafiom` | Modify a challenge |
| `/challengequery ...` | `/desafioq` | Query a challenge |
| `/gift <player> <item>` | `/presente` | Give a player a gift |
| `/openarena` | | Open the arena |
| `/arena`, `/arena1`, `/arena2` | | Arena controls |
| `/doublexp` | | Toggle double experience |
| `/doublegold` | | Toggle double gold |
| `/votes` | `/votos` | Show current vote counts |

### Server control

| English | Also accepts | What it does |
|---|---|---|
| `/clearserver` | `/limparservidor`, `/limpiarservidor` | Disconnect every player |
| `/closegame` | `/fechar` | Close the game |
| `/gamestart` | | Start the game |
| `/gamestop` | | Stop the game |
| `/savegame` | `/salvar` | Save the game state |
| `/backup` | | Take a backup |
| `/vbackup`, `/vbackup2` | | View backups |
| `/reboot` | | Restart the server |
| `/reboot20` … `/reboot60` | | Restart after N seconds |
| `/enable <feature>` | `/ativar` | Enable a feature |
| `/disable <feature>` | `/desativar` | Disable a feature |
| `/pvp` | | Toggle player-versus-player |
| `/notify <text>` | | Broadcast a notice |
| `/listthings` | `/lcoisas` | List world objects |
| `/invert` | `/inverter` | Invert a setting |
| `/credit <player> <amount>` | | Credit a player's account |
| `/mdebug` | | Debug output |
| `/rawdata` | | Dump raw server data |
| `/msgen`, `/msges`, `/msgfr`, `/msgpt` | | Set the message of the day per language |
| `/nen`, `/nes`, `/nfr`, `/npt` | | Set the news text per language |

---

## Notes

- Portuguese, Spanish and French spellings are kept as aliases. If you have
  muscle memory for `/regras`, it still works.
- Quest names are still in Portuguese (`ritual_da_meia_noite`,
  `escalada_perigosa`) because the server matches them as identifiers.
- Commands marked with `...` take arguments whose exact form depends on the
  subsystem; run the command with no arguments to see what it expects.

# Tile → Archipelago name mapping

Renaming map tiles in `src/data/mapData.js` to canonical Archipelago (AP) names.
Names verbatim from AP `EntranceShuffle.py` + `Regions.py`. The tile popup shows its
node **`#id`** at the top-right so we can refer to tiles unambiguously.

## Status: ~96 tiles carry AP names ✅

Resolved this round:
| # | Tile | Name |
|---|---|---|
| 26 | Graveyard Ledge | `Graveyard Cave` |
| 27 | Kings tomb | `Kings Grave` |
| 32 | Blinds hideout (5-chest house) | `Blinds Hideout` |
| 39 | Kakariko bombable house (8 pots + rats) | `Light World Bomb Hut` |
| 79 | (was "Death Mountain Entrance") | `Long Fairy Cave` |
| 113 | Hammer Pegs Cave | `Dark World Hammer Peg Cave` |

Earlier best-guesses still in place (verify against `#id` if unsure): Elder House
30/31, Snitch Lady 34/35, Death Mountain Return Cave (West) 22, Old Man House (Top)
83, Lake Hylia Healer Fairy 67.

---

## Still open — need your call ⚠️

**No distinct AP entrance exists (kept as-is unless you say otherwise):**
- #70 Light World Flute 5 Cave · #131 Dark Flute 5 Cave · #132 Dark Witch's Hut
- #111 Hammer House (the house behind the pegs — #113 is the peg cave)
- #4 Back of Tavern (item; AP location is `Kakariko Tavern` — rename or keep?)
- #17 Bumper Ledge (item — kept)

**Need identification (I don't have a confident AP name):**
| # | Tile | Note / your hint |
|---|---|---|
| 21 | Forest Hideout | 18 = `Lost Woods Hideout`; what is 21? |
| 38 | Grass house | grass/bushes out front, below #35, near smiths — `Bush Covered House`? |
| 51 | Hype Fairy Cave | "LW entrance of hype cave" |
| 53 | Rupee Cave | lower rock near purple-chest delivery |
| 54 | Thief Cave | left of purple-chest delivery |
| 64 | Ice Fairy Cave | the rock in front of Ice Rod Cave |
| 89 | EDM Fairy Cave | left of the two caves above Paradox Lower |
| 99 | Dwarven Smiths | the frog — surface `Blacksmith`, or a DW smith house? |
| 124 | Dark Hylia Fortune Teller | which AP string? |
| 125 / 126 / 127 | Dark Ice Rod Left / Right / Rock | `Dark Lake Hylia Ledge Fairy` / `...Spike Cave` / `...Hint` — which is which? |
| 133 | Pyramid Fairy | the big-bomb fairy — AP name? |
| 135 | Dark Forest Shop | `Village of Outcasts Shop` or `Dark World Potion Shop`? |

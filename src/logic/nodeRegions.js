// src/logic/nodeRegions.js
//
// Maps each of the 147 tracker map-nodes (src/data/mapData.js) to the overworld
// region it sits in (src/logic/regions.js). This is the hinge of Phase 2b: it's
// how "the player is standing at this map spot" becomes "the player is in this
// logic region", which is what makes a placed entrance/connector a graph edge.
//
// ─────────────────────────────────────────────────────────────────────────────
// FIDELITY: this is a FIRST PASS. Entries I'm confident about are untagged;
// uncertain ones are marked `// V` (VALIDATE) and are the primary thing the 2e
// spoiler harness will confirm/correct. Where 2a hasn't yet wired a fine ledge
// into the graph, the node is mapped to the nearest CONNECTED coarse region so
// its checks aren't spuriously unreachable — also a 2e refinement.
// ─────────────────────────────────────────────────────────────────────────────

import { rules } from './rules';

// nodeId -> region id (must exist in regions.js)
export const nodeRegions = {
  // ── Light World surface (Kakariko / Hyrule field / lake / forest) ──
  1: 'Master Sword Meadow',
  2: 'Light World',
  3: 'Light World',
  4: 'Light World',
  5: 'Light World', // V (Maze Race Ledge)
  6: 'Light World',
  7: 'Hobo Bridge',
  8: 'Lake Hylia Island',
  9: 'Zoras River',
  10: 'Desert Ledge',
  11: 'Light World', // Bombos Tablet — walk up in the LW; reading it needs book + master sword (nodeAccessRules)
  12: 'Death Mountain (Top)', // V (Ether tablet, west DM top)
  13: 'Death Mountain Floating Island (Light World)',
  14: 'Death Mountain (Top)', // Top of Spectacle Rock — reachable from the Hera plateau (VALIDATE, per user hunch)
  15: 'Light World',
  16: 'Light World',
  17: 'Death Mountain Return Ledge', // V (Bumper Ledge)
  18: 'Light World',
  19: 'Light World',
  20: 'Light World',
  21: 'Light World',
  22: 'Death Mountain (Top)', // Death Mountain Exit Back — up on the west mountain (group)
  23: 'Light World', // Death Mountain Entrance Cave — a door at the base, walkable from the LW
  24: 'Light World',
  25: 'Light World',
  26: 'Graveyard Ledge',
  27: 'Kings Grave Area',
  28: 'Light World', // V (Huluhan drop)
  29: 'Light World',
  30: 'Light World',
  31: 'Light World',
  32: 'Light World',
  33: 'Light World',
  34: 'Light World',
  35: 'Light World',
  36: 'Light World',
  37: 'Light World',
  38: 'Light World',
  39: 'Light World',
  40: 'Light World',
  41: 'Light World',
  42: 'Light World',
  43: 'Light World', // V (Magic Bat / Bat Cave Drop Ledge)
  44: 'Light World',
  45: 'Light World',
  46: 'Light World',
  47: 'Light World',
  48: 'Light World',
  49: 'Light World',
  50: 'Light World', // Link's House (start entrance in ER — see entranceGraph)
  51: 'Light World',
  52: 'Light World',
  53: 'Light World',
  54: 'Light World',
  55: 'Light World',
  56: 'Desert Palace Lone Stairs', // Desert Left/West — separate ledge; NOT walkable from the front (crossed ER)
  57: 'Desert Palace Stairs', // Desert Main — book opens the stairs (Rules.py)
  58: 'Desert Ledge (Northeast)', // Desert Right/East — separate ledge; entrance-gated
  59: 'Desert Northern Cliffs', // Desert Back — top ledge; NOT walkable from the front (crossed ER), entrance-gated
  60: 'Light World', // V (Checkerboard cave, glove-gated at the check)
  61: 'Light World',
  62: 'Light World',
  63: 'Light World',
  64: 'Light World',
  65: 'Light World',
  66: 'Light World',
  67: 'Light World', // V (Lake fairy, needs flippers)
  68: 'Light World',
  69: 'Light World', // Eastern Palace entrance
  70: 'Light World',
  71: 'Hobo Bridge', // Capacity Upgrade Cave — flipper-gated, same as Hobo
  72: 'Light World', // Witch's hut
  73: 'Light World', // Castle Main Entrance — same open area as Link's House
  74: 'Hyrule Castle Ledge', // Castle Left — top of castle; NOT walkable from the ground (crossed ER)
  75: 'Hyrule Castle Ledge', // Castle Right — top of castle; entrance-gated
  76: 'Hyrule Castle Ledge', // Agahnim Tower — top of castle; entrance-gated
  77: 'Light World', // V (Castle secret passage drop)
  78: 'Zoras River', // V (Waterfall Fairy, needs flippers)

  // ── Light World Death Mountain ──
  // West Death Mountain is one walkable group (user): entrance, Old Man Cave +
  // back, Spectacle Rock upper/left/right, and DM 2nd Floor Left.
  79: 'Death Mountain (Top)', // Death Mountain Entrance
  80: 'Death Mountain (Top)', // Old Man Cave
  81: 'Death Mountain (Top)', // Spectacle Rock Upper
  82: 'Death Mountain (Top)', // Spectacle Rock Right
  83: 'Death Mountain (Top)', // LW DM 2nd Floor Left
  84: 'Death Mountain (Top)', // Spectacle Rock Left
  85: 'Death Mountain (Top)', // Old Man Cave Back
  86: 'Death Mountain (Top)', // Tower of Hera
  87: 'East Death Mountain (Bottom)', // V (Spiral Cave Bottom)
  88: 'East Death Mountain (Bottom)',
  89: 'East Death Mountain (Bottom)', // V
  90: 'East Death Mountain (Top)',
  91: 'East Death Mountain (Bottom)', // V (Paradox middle)
  92: 'East Death Mountain (Bottom)',
  93: 'Spiral Cave Ledge', // V
  94: 'Mimic Cave Ledge',
  95: 'East Death Mountain (Top)',

  // ── Dark World surface ──
  96: 'Pyramid Ledge',
  97: 'Catfish',
  98: 'South Dark World', // V (Haunted Grove)
  99: 'West Dark World', // V (Dwarven Smiths)
  100: 'South Dark World', // V (Digging Game)
  101: 'Skull Woods Forest (West)',
  102: 'Skull Woods Forest',
  103: 'Skull Woods Forest', // V (Dark Lumberjack House)
  104: 'Bumper Cave Entrance',
  105: 'Bumper Cave Ledge',
  106: 'West Dark World', // V (Dark Sanctuary)
  107: 'West Dark World', // V
  108: 'West Dark World', // V (C-Shaped Hut)
  109: 'West Dark World', // V (Treasure Game)
  110: 'West Dark World', // Thieves Town
  111: 'West Dark World', // V (Hammer House)
  112: 'West Dark World', // V
  113: 'Hammer Peg Area',
  114: 'West Dark World', // V (Shooting Gallery)
  115: 'South Dark World', // V (Dark Bonkrocks)
  116: 'South Dark World', // V (Big Bomb Shop)
  117: 'South Dark World', // Hype Cave
  118: 'South Dark World', // V (Swamp Palace)
  119: 'Dark Desert', // Mire Shed
  120: 'Dark Desert', // Misery Mire
  121: 'Dark Desert',
  122: 'Dark Desert', // V
  123: 'Dark Lake Hylia Central Island', // Ice Palace sits on the lake island
  124: 'South Dark World', // Dark Hylia Fortune Teller — traversable with the southern strip (116/118)
  125: 'Dark Lake Hylia Central Island', // Dark Ice Rod corner — flippers to reach
  126: 'Dark Lake Hylia Central Island', // Dark Ice Rod corner — flippers to reach
  127: 'Dark Lake Hylia Central Island', // Dark Ice Rod Rock — flippers to reach
  128: 'Dark Lake Hylia', // Fairy — reachable from the east hub without items
  129: 'East Dark World', // V (Palace Hint)
  130: 'East Dark World', // Palace of Darkness
  131: 'East Dark World', // V
  132: 'Northeast Dark World', // Dark Witch's Hut — behind the broken bridge (hammer/rocks/flippers)
  133: 'East Dark World', // Pyramid Fairy — reachable region, but gated by the Big Bomb (see nodeAccessRules)
  134: 'Pyramid Ledge', // V (Ganon Drop)
  135: 'Skull Woods Forest', // V (Dark Forest Shop)

  // ── Dark World Death Mountain ──
  136: 'Dark Death Mountain (West Bottom)', // V (Dark Death Fairy)
  137: 'Dark Death Mountain (Top)', // V (Spike Cave)
  138: 'Dark Death Mountain (Top)', // Ganon's Tower
  139: 'Dark Death Mountain (East Bottom)', // V (Superbunny Lower)
  140: 'Dark Death Mountain (East Bottom)', // V (DEDM Shop)
  141: 'Dark Death Mountain (Top)', // V (Superbunny Upper)
  142: 'Turtle Rock (Top)', // V
  143: 'Turtle Rock (Top)', // V
  144: 'Turtle Rock (Top)', // Turtle Rock Entrance
  145: 'Turtle Rock (Top)', // V
  146: 'Dark Death Mountain (Top)', // V (Hookshot Cave)
  147: 'Death Mountain Floating Island (Dark World)',
};

// User overrides (from the in-app region editor) are layered on top of the baked
// map. The registry is set explicitly by the app at startup / on edit — it is
// NOT read from localStorage here, so pure logic + tests stay deterministic.
let regionOverrides = {};
export const setRegionOverrides = (overrides) => {
  regionOverrides = overrides || {};
};
export const getRegionOverrides = () => regionOverrides;

export const regionOfNode = (nodeId) => regionOverrides[nodeId] || nodeRegions[nodeId] || null;

// Extra access requirements for reaching specific nodes, beyond their region
// being reachable. A predicate over item state; absent = no extra requirement.
// This is for entrances gated by something a region edge can't express.
export const nodeAccessRules = {
  // Bombos Tablet: read it with the Book + Master Sword (L2). Needs the Moon
  // Pearl too — activating the medallion needs items, which a bunny can't use.
  11: (items) => rules.hasMoonPearl(items) && rules.hasBook(items) && rules.hasSwordLevel(items, 2),
  // Checkerboard Cave: lift the rock to enter (glove). Verbatim from Rules.py.
  60: (items) => rules.canLiftRocks(items),
  // Bonk-rock caves (Bonk Rock Cave, Bonk Fairy): dash into the rocks with Boots.
  24: (items) => rules.hasBoots(items),
  49: (items) => rules.hasBoots(items),
  115: (items) => rules.hasBoots(items),
  // King's Grave: dash the grave open with the Boots ('Kings Grave' = Pegasus
  // Boots, Rules.py). Reaching the grave area itself is the mitts edge / mirror.
  27: (items) => rules.hasBoots(items),
  // Pyramid Fairy: you carry the Big Bomb from the bomb shop to the pyramid
  // crack. That depends on Agahnim/crystal state we don't track yet, so it's
  // conservatively gated OFF — it reads as unreachable until the Big Bomb is
  // modelled. TODO: replace with real big-bomb logic once Agahnim/crystals track.
  133: () => false,
};

export const getNodeAccessRule = (nodeId) => nodeAccessRules[nodeId] || null;

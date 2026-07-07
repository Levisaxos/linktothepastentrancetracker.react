// src/logic/overworldGraph.js
//
// Fixed overworld connectivity for the logic engine (Phase 2a).
//
// These are the edges you traverse by WALKING (item-gated where the terrain
// demands it). They do NOT change between seeds — only entrances are shuffled —
// so this graph is authored once and reused. Entrance edges (2b) and the LW<->DW
// portals attach to these regions to form the full graph the solver sweeps (2d).
//
// ─────────────────────────────────────────────────────────────────────────────
// FIDELITY STATUS (read before trusting this):
//   CONFIDENT  — item-gated transitions taken from the apworld Rules.py
//                (Death Mountain, desert, dark-world bridges/gaps, teleporters).
//   VALIDATE   — plausible from ALttP knowledge but not yet confirmed against
//                source/spoiler; the 2e harness will confirm or correct these.
//   DEFERRED   — intentionally NOT here yet:
//                • fine ledge-to-ledge adjacency within a world
//                • LW<->DW overworld portals (modelled with entrances in 2b,
//                  since they behave like fixed cross-world entrances)
// Each edge carries a `requires(itemState)` predicate from ./rules. Undirected
// links use `link`; genuine one-way drops/ledges use `oneWay`.
// ─────────────────────────────────────────────────────────────────────────────

import { rules } from './rules';
import { regionExists } from './regions';

const edges = [];

const link = (from, to, requires = rules.always, tag = 'CONFIDENT') =>
  edges.push({ from, to, requires, tag }, { from: to, to: from, requires, tag });

// (A one-way edge helper will return when connector directionality is modelled.)

// The Menu → start-region edge is mode-dependent, so it's injected by
// entranceGraph.buildGraph(), not hardcoded here.

// ── Death Mountain (rebuilt from AP Regions.py, 2026-07-05) ──────────────────
// KEY CORRECTION: most DM "exits" in the source are shuffled CONNECTORS (Old Man
// Cave, Spectacle Rock Cave, Paradox Cave, Spiral Cave, Fairy Ascension Cave),
// one-way DROPS, or MIRROR SPOTS — NOT fixed walking edges. So they're recorded
// entrances, not hardcoded here. The genuine fixed walking links:
link('Death Mountain (Top)', 'East Death Mountain (Top)', rules.hasHammer);        // cross the top (hammer)
link('Death Mountain (Top)', 'East Death Mountain (Bottom)', rules.hasHookshot);   // Broken Bridge (hookshot)
link('East Death Mountain (Bottom)', 'Fairy Ascension Plateau', rules.canLiftHeavy); // Fairy Ascension Rocks (mitts)

// Fixed cross-world Death Mountain teleporters (light<->dark). The mitts/hammer
// gates are verbatim from Rules.py. DW→LW mirror-spot portals are mode-dependent
// and deferred, so they're not here.
link('East Death Mountain (Bottom)', 'Dark Death Mountain (East Bottom)', rules.canLiftHeavy, 'VALIDATE'); // East DM Teleporter
link('East Death Mountain (Top)', 'Turtle Rock (Top)', (s) => rules.canLiftHeavy(s) && rules.hasHammer(s), 'VALIDATE'); // Turtle Rock Teleporter
link('Death Mountain (Top)', 'Dark Death Mountain (West Bottom)', rules.always, 'VALIDATE'); // Death Mountain Teleporter

// ── Light World surface (VALIDATE — fine adjacency, mostly DEFERRED) ─────────
link('Light World', 'Zoras River', rules.always, 'VALIDATE');
link('Light World', 'Hyrule Castle Courtyard', rules.always, 'VALIDATE');
link('Light World', 'Desert Palace Stairs', rules.hasBook, 'VALIDATE'); // Book opens the desert stairs (Rules.py)
// Desert BACK (north cliffs): 'Desert Palace Entrance (North) Rocks' = can_lift_rocks
// (Rules.py). Lift the rocks by the north entrance to drop to the Light World (and
// climb back up). This connects to the Light World, NOT to the book-gated front
// stairs — so reaching the back + a glove opens the light world overworld, while
// Desert Main (South) stays gated behind the book.
link('Desert Northern Cliffs', 'Light World', rules.canLiftRocks);
// Desert WEST entrance shares that northern ledge with the back, one rock-lift
// away — so reaching the back + a glove also opens the West entrance.
link('Desert Northern Cliffs', 'Desert Palace Lone Stairs', rules.canLiftRocks);
// Hobo + Capacity Upgrade Cave: reached by swimming (Hobo Bridge = flippers, Rules.py).
link('Light World', 'Hobo Bridge', rules.hasFlippers);
// King's Tomb: reach the grave area by lifting the outer+inner rocks — Titan's
// Mitts ('Kings Grave Outer/Inner Rocks' = can_lift_heavy_rocks, Rules.py). Opening
// the grave itself needs the Boots (checkRules 203). The mirror route (from the
// dark-world graveyard by the Dark Sanctuary) is deferred with the other mirror
// portals — so for now the grave area is mitts-gated.
link('Light World', 'Kings Grave Area', rules.canLiftHeavy);

// ── Dark World surface ───────────────────────────────────────────────────────
// Edges carry only terrain/item gates. The bunny/Moon-Pearl gate is NOT here —
// it's applied by the solver per region world + mode (see mode.js), so this same
// edge set works for both standard and inverted. (Partial-bunny nuance = Phase 6.)
const dwLink = (a, b, extra, tag = 'CONFIDENT') =>
  link(a, b, extra ? extra : rules.always, tag);

// All gates below are the terrain requirement taken VERBATIM from the AP alttp
// Rules.py (Moon Pearl is applied separately by the solver per mode).
// Broken-bridge pass (Northeast): rocks OR hammer OR flippers.
const brokenBridge = (s) => rules.canLiftRocks(s) || rules.hasHammer(s) || rules.hasFlippers(s);
// Village of Outcasts entry: Titan's Mitts (dark rocks) OR Hammer (pegs). NOT hookshot.
const villageAccess = (s) => rules.canLiftHeavy(s) || rules.hasHammer(s);

// East Dark World is the central hub; the other quadrants branch off it, gated.
dwLink('East Dark World', 'South Dark World', rules.hasHammer);          // South Dark World Bridge (hammer)
dwLink('East Dark World', 'Northeast Dark World', brokenBridge);         // broken-bridge pass
dwLink('East Dark World', 'West Dark World', villageAccess);             // into the Village of Outcasts
dwLink('West Dark World', 'Northeast Dark World', rules.hasHookshot);    // West Dark World Gap (hookshot)
dwLink('West Dark World', 'South Dark World', null);                     // village opens south to the swamp/bomb-shop strip (traversable)

// --- East / pyramid / lake (lake shore walkable from the east hub) ---
dwLink('East Dark World', 'Pyramid Ledge', null);
dwLink('East Dark World', 'Dark Lake Hylia', null);                      // fairy: reachable from the east hub
dwLink('Dark Lake Hylia', 'Dark Lake Hylia Ledge', rules.hasHammer);    // fortune teller corner needs hammer
dwLink('Dark Lake Hylia', 'Dark Lake Hylia Central Island', rules.hasFlippers); // ice palace + ice-rod corner: flippers

// --- North: catfish (behind the broken bridge, then lift a rock) ---
dwLink('Northeast Dark World', 'Catfish', rules.canLiftRocks);           // Catfish Exit Rock

// --- West: the village and everything behind it ---
dwLink('West Dark World', 'Skull Woods Forest', null);
dwLink('Skull Woods Forest', 'Skull Woods Forest (West)', null);
dwLink('South Dark World', 'Dark Grassy Lawn', null);                    // stumpy / haunted grove (south-central)
dwLink('West Dark World', 'Hammer Peg Area', rules.hasHammer);           // hammer pegs
dwLink('West Dark World', 'Bumper Cave Entrance', null);
// The Bumper Cave LEDGE (top) is NOT walkable from the entrance — the bumper cave
// is a shuffled connector; you reach the ledge only via a recorded entrance, the
// cape-climb through the connector, or the Magic Mirror. So no fixed edge here.

// Dark Desert (Misery Mire) is isolated — reached via the flute/mire portal or a
// recorded entrance, so it has no fixed walking edge here.

// ── Dark Death Mountain ───────────────────────────────────────────────────────
dwLink('Dark Death Mountain (West Bottom)', 'Dark Death Mountain (Top)', null, 'VALIDATE');
dwLink('Dark Death Mountain (Top)', 'Dark Death Mountain (East Bottom)', null, 'VALIDATE');
dwLink('Dark Death Mountain (Top)', 'Dark Death Mountain Ledge', rules.hasMirror, 'VALIDATE');
dwLink('Dark Death Mountain (East Bottom)', 'Turtle Rock (Top)', rules.canLiftHeavy, 'VALIDATE');
dwLink('Dark Death Mountain (Top)', 'Death Mountain Floating Island (Dark World)', rules.hasHookshot, 'VALIDATE');

// Validate every endpoint references a real region — catches typos at import.
const unknownEndpoints = [
  ...new Set(edges.flatMap((e) => [e.from, e.to]).filter((id) => !regionExists(id))),
];
if (unknownEndpoints.length > 0) {
  throw new Error(`overworldGraph references unknown region(s): ${unknownEndpoints.join(', ')}`);
}

export const overworldEdges = edges;

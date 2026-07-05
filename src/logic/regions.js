// src/logic/regions.js
//
// Authoritative ALttP overworld region set for the logic engine (Phase 2a).
//
// The `id` strings are the EXACT region names used by the Archipelago ALttP
// apworld (worlds/alttp/Regions.py). Keeping them verbatim pays off twice:
//   - Phase 2b maps our 147 tracker map-nodes onto these by name.
//   - Phase 2e validates against AP spoiler logs that use these same names.
//
// This file lists the OVERWORLD surface regions only. Dungeon/cave interiors are
// added in 2b (they attach to this graph via shuffled entrances). In the pure
// overworld graph these regions form several disconnected components (e.g. Death
// Mountain is unreachable from the Light World by walking) — entrances stitch
// them together, which is exactly what makes this an *entrance* tracker.

export const WORLD = { LIGHT: 'light', DARK: 'dark' };

// kind: 'start' | 'overworld'
const R = (id, world, kind = 'overworld') => ({ id, world, kind });

export const regionData = [
  // --- Light World surface ---
  R('Menu', WORLD.LIGHT, 'start'),
  R('Light World', WORLD.LIGHT),
  R('Death Mountain Entrance', WORLD.LIGHT),
  R('Lake Hylia Central Island', WORLD.LIGHT),
  R('Zoras River', WORLD.LIGHT),
  R('Kings Grave Area', WORLD.LIGHT),
  R('Bat Cave Drop Ledge', WORLD.LIGHT),
  R('Hobo Bridge', WORLD.LIGHT),
  R('Cave 45 Ledge', WORLD.LIGHT),
  R('Graveyard Ledge', WORLD.LIGHT),
  R('Lake Hylia Island', WORLD.LIGHT),
  R('Maze Race Ledge', WORLD.LIGHT),
  R('Desert Ledge', WORLD.LIGHT),
  R('Desert Ledge (Northeast)', WORLD.LIGHT),
  R('Desert Palace Stairs', WORLD.LIGHT),
  R('Desert Palace Lone Stairs', WORLD.LIGHT),
  R('Desert Palace Entrance (North) Spot', WORLD.LIGHT),
  R('Desert Northern Cliffs', WORLD.LIGHT),
  R('Master Sword Meadow', WORLD.LIGHT),
  R('Hyrule Castle Courtyard', WORLD.LIGHT),
  R('Hyrule Castle Ledge', WORLD.LIGHT),

  // --- Light World Death Mountain ---
  R('Death Mountain', WORLD.LIGHT),
  R('Death Mountain Return Ledge', WORLD.LIGHT),
  R('East Death Mountain (Bottom)', WORLD.LIGHT),
  R('East Death Mountain (Top)', WORLD.LIGHT),
  R('Spiral Cave Ledge', WORLD.LIGHT),
  R('Fairy Ascension Plateau', WORLD.LIGHT),
  R('Fairy Ascension Ledge', WORLD.LIGHT),
  R('Death Mountain (Top)', WORLD.LIGHT),
  R('Spectacle Rock', WORLD.LIGHT),
  R('Death Mountain Floating Island (Light World)', WORLD.LIGHT),
  R('Bombos Tablet Ledge', WORLD.LIGHT),
  R('Mimic Cave Ledge', WORLD.LIGHT),

  // --- Dark World surface ---
  R('East Dark World', WORLD.DARK),
  R('Catfish', WORLD.DARK),
  R('Northeast Dark World', WORLD.DARK),
  R('South Dark World', WORLD.DARK),
  R('Dark Lake Hylia', WORLD.DARK),
  R('Dark Lake Hylia Central Island', WORLD.DARK),
  R('Dark Lake Hylia Ledge', WORLD.DARK),
  R('West Dark World', WORLD.DARK),
  R('Dark Grassy Lawn', WORLD.DARK),
  R('Hammer Peg Area', WORLD.DARK),
  R('Bumper Cave Entrance', WORLD.DARK),
  R('Bumper Cave Ledge', WORLD.DARK),
  R('Skull Woods Forest', WORLD.DARK),
  R('Skull Woods Forest (West)', WORLD.DARK),
  R('Dark Desert', WORLD.DARK),
  R('Pyramid Ledge', WORLD.DARK),

  // --- Dark World Death Mountain ---
  R('Dark Death Mountain (West Bottom)', WORLD.DARK),
  R('Dark Death Mountain (Top)', WORLD.DARK),
  R('Dark Death Mountain Ledge', WORLD.DARK),
  R('Dark Death Mountain Isolated Ledge', WORLD.DARK),
  R('Dark Death Mountain (East Bottom)', WORLD.DARK),
  R('Death Mountain Floating Island (Dark World)', WORLD.DARK),
  R('Turtle Rock (Top)', WORLD.DARK),
  R('Dark Death Mountain Bunny Descent Area', WORLD.DARK),
];

// Lookups
const byId = Object.fromEntries(regionData.map((r) => [r.id, r]));
export const getRegion = (id) => byId[id] || null;
export const regionExists = (id) => id in byId;
export const START_REGION = 'Menu';

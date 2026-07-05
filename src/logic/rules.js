// src/logic/rules.js
//
// Shared access-rule predicates for the logic engine (Phase 2a).
//
// Every predicate is a pure function of the item state (the { itemId: count }
// map from itemStateService). They are the vocabulary the overworld graph (2a),
// entrance edges (2b), and per-check rules (2c) are written in, so the logic
// lives in one place and reads like the apworld's StateHelpers.
//
// Fidelity note: these mirror ALttP glitchless logic. Glitch variants (Phase 6)
// will layer on top. Anything approximated is marked APPROX and revisited in 2e.

import { itemStateService as I } from '../services/itemStateService';

export const rules = {
  // --- Weapons / tools ---
  hasSword: (s) => I.swordLevel(s) >= 1,
  hasSwordLevel: (s, n) => I.swordLevel(s) >= n,
  hasMelee: (s) => I.hasMelee(s),
  hasHammer: (s) => I.has(s, 'hammer'),
  hasHookshot: (s) => I.has(s, 'hookshot'),
  hasFireRod: (s) => I.has(s, 'fireRod'),
  hasIceRod: (s) => I.has(s, 'iceRod'),
  hasFireSource: (s) => I.hasFireSource(s), // lamp or fire rod
  hasBow: (s) => I.hasBow(s),
  hasSilverArrows: (s) => I.hasSilverArrows(s),
  hasBombos: (s) => I.has(s, 'bombos'),
  hasEther: (s) => I.has(s, 'ether'),
  hasQuake: (s) => I.has(s, 'quake'),

  // --- Movement / access ---
  canLiftRocks: (s) => I.canLiftRocks(s), // Power Glove+
  canLiftHeavy: (s) => I.canLiftHeavy(s), // Titans Mitts
  hasFlippers: (s) => I.has(s, 'flippers'),
  hasMirror: (s) => I.has(s, 'mirror'),
  hasMoonPearl: (s) => I.has(s, 'moonPearl'),
  hasBoots: (s) => I.has(s, 'boots'),
  // A tracker can't tell whether the player has *played* the flute yet, so we
  // treat owning the Flute as "activated" once obtained. Refined in 2e if needed.
  hasFlute: (s) => I.has(s, 'flute'),
  hasBook: (s) => I.has(s, 'book'),

  // --- Composite helpers ---
  // Medallion needed to open Misery Mire / Turtle Rock is seed-specific
  // (slot_data), which a fresh tracker doesn't know. APPROX: accept any
  // medallion; tightened once slot_data drives it (Phase 4/6).
  hasAnyMedallion: (s) => I.has(s, 'bombos') || I.has(s, 'ether') || I.has(s, 'quake'),

  // Can survive the dark world as a non-bunny. Base gate for essentially all
  // dark-world overworld traversal in non-inverted mode.
  canBeNonBunny: (s) => I.has(s, 'moonPearl'),

  always: () => true,
  never: () => false,
};

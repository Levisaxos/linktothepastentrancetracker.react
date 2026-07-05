// src/logic/checkRules.js
//
// Phase 2c — per-check access rules: what a check needs BEYOND reaching the
// region it sits in. Keyed by checkData id (src/data/checkData.js). A check with
// no entry here is reachable as soon as its region is reachable.
//
// The solver (2d) composes these: check is in logic  ⇔  its region is reachable
// AND checkRule(itemState) is true.
//
// ─────────────────────────────────────────────────────────────────────────────
// FIDELITY / DEFERRALS (all first-pass; 2e validates):
//   • Overworld item gates below are CONFIDENT (flippers/book+sword/shovel).
//   • Boss-defeat rules are VALIDATE — the damage requirements are approximated
//     from ALttP knowledge and need spoiler confirmation.
//   • DUNGEON-INTERNAL LOGIC (small keys, big keys, item-gated rooms) is NOT
//     modelled — dungeon chests are treated as reachable once the dungeon is
//     entered. This is the single biggest deferral; it's a whole sub-project
//     (keysanity/key-logic) and is called out in the plan.
//   • PRIZE-GATED checks (Master Sword Pedestal = 3 pendants; Ganon = crystals)
//     can't be gated yet because dungeon prizes (pendants/crystals) aren't in the
//     item model. Left default (always) with a TODO rather than guessed.
//   • MISERY MIRE / TURTLE ROCK entry medallion is applied here as a per-check
//     approximation (it's really an entrance-entry rule); tighten in 2e once
//     slot_data supplies the actual medallion.
// ─────────────────────────────────────────────────────────────────────────────

import { rules } from './rules';
import { itemStateService as I } from '../services/itemStateService';

const hasMasterSword = (s) => I.swordLevel(s) >= 2;
const canDamage = (s) => rules.hasMelee(s) || rules.hasBow(s); // sword/hammer/bow
const mmTrEntry = (s) => rules.hasAnyMedallion(s) && rules.hasSword(s); // APPROX

export const checkRules = {
  // ── Overworld surface, item-gated (CONFIDENT) ──
  12: (s) => rules.hasBook(s) && hasMasterSword(s), // Bombos Tablet
  13: (s) => rules.hasBook(s) && hasMasterSword(s), // Ether Tablet
  21: (s) => I.has(s, 'shovel'), // Flute Spot (dig it up)
  23: (s) => rules.hasFlippers(s), // Zora's Ledge
  24: (s) => rules.hasFlippers(s), // Waterfall Fairy Left
  25: (s) => rules.hasFlippers(s), // Waterfall Fairy Right
  26: (s) => rules.hasFlippers(s), // Lake Hylia Island (VALIDATE: also mirror route)

  // ── Boss / prize checks (VALIDATE — damage rules approximated) ──
  45: canDamage, // Eastern Palace - Armos Knights
  51: (s) => canDamage(s) || rules.hasFireRod(s) || rules.hasIceRod(s), // Desert - Lanmolas
  57: (s) => rules.hasMelee(s), // Tower of Hera - Moldorm (needs sword/hammer to bump)
  101: (s) => rules.hasMelee(s), // Palace of Darkness - Helmasaur King (APPROX: mask via hammer/bombs)
  111: (s) => rules.hasHookshot(s) && rules.hasMelee(s), // Swamp Palace - Arrghus
  119: (s) => rules.hasMelee(s) || rules.hasFireRod(s), // Skull Woods - Mothula
  127: (s) => rules.hasMelee(s), // Thieves Town - Blind
  135: (s) => (rules.hasFireRod(s) || rules.hasBombos(s)) && rules.hasMelee(s), // Ice Palace - Kholdstare
  142: (s) => mmTrEntry(s) && canDamage(s), // Misery Mire - Vitreous (+ MM entry medallion)
  216: (s) => mmTrEntry(s) && canDamage(s), // Misery Mire - Boss Reward
  154: (s) => rules.hasFireRod(s) && rules.hasIceRod(s) && rules.hasMelee(s), // Turtle Rock - Trinexx

  // ── End game (VALIDATE) ──
  211: (s) => hasMasterSword(s) && rules.hasSilverArrows(s), // Dark World - Ganon (APPROX)

  // TODO(prizes): 1 (Master Sword Pedestal) needs 3 pendants — needs prize model.
};

export const getCheckRule = (checkId) => checkRules[checkId] || rules.always;

// src/logic/mode.js
//
// World-orientation mode for the logic engine (Phase 2f). ALttP randomizers run
// in two orientations, and the app already tracks it per game (game.isInverted):
//
//   STANDARD  — start in the Light World; the LIGHT world is "home" (no Moon
//               Pearl needed). Without the pearl you are a bunny in the DARK
//               world, so dark-world regions gate on the pearl.
//   INVERTED  — start in the Dark World; the DARK world is home. Without the
//               pearl you are a bunny in the LIGHT world, so it flips.
//
// The pearl/bunny gate is therefore a property of (region world + mode), applied
// once in the solver — not baked into individual edges. That keeps a single edge
// set usable by both modes.

export const MODES = { STANDARD: 'standard', INVERTED: 'inverted' };

export const modeFromGame = (game) => (game?.isInverted ? MODES.INVERTED : MODES.STANDARD);

// The world whose regions require the Moon Pearl to be a non-bunny.
export const pearlWorld = (mode) => (mode === MODES.INVERTED ? 'light' : 'dark');

// The overworld region the player starts in.
// NOTE: the inverted start hub is a first approximation (VALIDATE) — inverted
// connectivity + node regions are grounded in 2f-2.
export const startRegion = (mode) =>
  mode === MODES.INVERTED ? 'East Dark World' : 'Light World';

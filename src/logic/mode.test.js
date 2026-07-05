// src/logic/mode.test.js
import { MODES, modeFromGame, pearlWorld, startRegion } from './mode';
import { regionExists } from './regions';

describe('mode helpers', () => {
  test('modeFromGame reads game.isInverted', () => {
    expect(modeFromGame({ isInverted: true })).toBe(MODES.INVERTED);
    expect(modeFromGame({ isInverted: false })).toBe(MODES.STANDARD);
    expect(modeFromGame(null)).toBe(MODES.STANDARD);
  });

  test('pearl-world flips between modes', () => {
    expect(pearlWorld(MODES.STANDARD)).toBe('dark');
    expect(pearlWorld(MODES.INVERTED)).toBe('light');
  });

  test('start region is a real region in both modes', () => {
    expect(regionExists(startRegion(MODES.STANDARD))).toBe(true);
    expect(regionExists(startRegion(MODES.INVERTED))).toBe(true);
  });
});

// src/logic/checkRules.test.js
import { checkRules, getCheckRule } from './checkRules';
import { checksData } from '../data/checkData';

describe('checkRules — integrity', () => {
  test('every keyed check id exists in checksData', () => {
    const validIds = new Set(checksData.map((c) => c.id));
    const unknown = Object.keys(checkRules).map(Number).filter((id) => !validIds.has(id));
    expect(unknown).toEqual([]);
  });

  test('every rule is a callable predicate', () => {
    for (const id of Object.keys(checkRules)) {
      expect(typeof checkRules[id]).toBe('function');
    }
  });

  test('unknown check ids default to always-reachable', () => {
    expect(getCheckRule(999999)({})).toBe(true);
  });
});

describe('checkRules — sample semantics', () => {
  test('Bombos Tablet needs Book AND Master Sword (sword level 2)', () => {
    const r = getCheckRule(12);
    expect(r({ book: 1 })).toBe(false); // no sword
    expect(r({ book: 1, sword: 1 })).toBe(false); // fighter sword too weak
    expect(r({ book: 1, sword: 2 })).toBe(true);
  });

  test("Zora's Ledge needs Flippers", () => {
    const r = getCheckRule(23);
    expect(r({})).toBe(false);
    expect(r({ flippers: 1 })).toBe(true);
  });

  test('Flute Spot needs the Shovel', () => {
    expect(getCheckRule(21)({})).toBe(false);
    expect(getCheckRule(21)({ shovel: 1 })).toBe(true);
  });

  test('Trinexx needs Fire Rod, Ice Rod and a sword', () => {
    const r = getCheckRule(154);
    expect(r({ fireRod: 1, iceRod: 1 })).toBe(false); // no melee
    expect(r({ fireRod: 1, iceRod: 1, sword: 1 })).toBe(true);
    expect(r({ fireRod: 1, sword: 1 })).toBe(false); // no ice rod
  });

  test('Misery Mire boss needs a medallion + sword + damage', () => {
    const r = getCheckRule(142);
    expect(r({ sword: 1 })).toBe(false); // no medallion
    expect(r({ sword: 1, bombos: 1 })).toBe(true);
  });
});

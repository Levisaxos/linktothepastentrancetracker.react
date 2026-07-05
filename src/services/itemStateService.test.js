// src/services/itemStateService.test.js
import { itemStateService as svc } from './itemStateService';

describe('itemStateService — state transforms', () => {
  test('empty state has nothing', () => {
    const s = svc.createEmptyState();
    expect(svc.has(s, 'hammer')).toBe(false);
    expect(svc.getCount(s, 'sword')).toBe(0);
  });

  test('setCount clamps to the item max and drops zeros', () => {
    let s = svc.setCount({}, 'sword', 99);
    expect(svc.getCount(s, 'sword')).toBe(4); // Progressive Sword max
    s = svc.setCount(s, 'sword', -5);
    expect(svc.getCount(s, 'sword')).toBe(0);
    expect('sword' in s).toBe(false); // zero counts are pruned
  });

  test('setCount ignores unknown items', () => {
    const s = svc.setCount({}, 'not-a-real-item', 3);
    expect(s).toEqual({});
  });

  test('increment wraps to 0 past max (toggle 0↔1)', () => {
    let s = svc.increment({}, 'hammer');
    expect(svc.has(s, 'hammer')).toBe(true);
    s = svc.increment(s, 'hammer');
    expect(svc.has(s, 'hammer')).toBe(false);
  });

  test('increment steps a progressive item then wraps', () => {
    let s = {};
    const seen = [];
    for (let i = 0; i < 6; i++) {
      s = svc.increment(s, 'sword');
      seen.push(svc.getCount(s, 'sword'));
    }
    expect(seen).toEqual([1, 2, 3, 4, 0, 1]);
  });

  test('decrement wraps 0 → max', () => {
    const s = svc.decrement({}, 'glove');
    expect(svc.getCount(s, 'glove')).toBe(2); // Progressive Glove max
  });

  test('transforms never mutate the input', () => {
    const s = { hammer: 1 };
    const s2 = svc.increment(s, 'sword');
    expect(s).toEqual({ hammer: 1 });
    expect(s2).not.toBe(s);
  });
});

describe('itemStateService — derived helpers', () => {
  test('sword level and melee', () => {
    expect(svc.hasMelee({})).toBe(false);
    expect(svc.hasMelee({ sword: 1 })).toBe(true);
    expect(svc.hasMelee({ hammer: 1 })).toBe(true);
    expect(svc.swordLevel({ sword: 3 })).toBe(3);
  });

  test('glove tiers', () => {
    expect(svc.canLiftRocks({})).toBe(false);
    expect(svc.canLiftRocks({ glove: 1 })).toBe(true);
    expect(svc.canLiftHeavy({ glove: 1 })).toBe(false);
    expect(svc.canLiftHeavy({ glove: 2 })).toBe(true);
  });

  test('bow tiers include silver arrows', () => {
    expect(svc.hasBow({ bow: 1 })).toBe(true);
    expect(svc.hasSilverArrows({ bow: 1 })).toBe(false);
    expect(svc.hasSilverArrows({ bow: 2 })).toBe(true);
  });

  test('fire source is lamp or fire rod', () => {
    expect(svc.hasFireSource({})).toBe(false);
    expect(svc.hasFireSource({ lamp: 1 })).toBe(true);
    expect(svc.hasFireSource({ fireRod: 1 })).toBe(true);
  });

  test('bottle count', () => {
    expect(svc.bottleCount({ bottle: 3 })).toBe(3);
  });
});

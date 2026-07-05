// src/data/dungeons.test.js
import { dungeons, keyItems, smallKeyItemId, bigKeyItemId } from './dungeons';
import { itemData, getItemById, getItemByApName } from './itemData';
import { itemStateService as svc } from '../services/itemStateService';

describe('dungeon key items — generation', () => {
  test('each dungeon with small keys yields a small-key item with the right cap', () => {
    for (const d of dungeons) {
      if (d.smallKeys <= 0) continue;
      const item = getItemById(smallKeyItemId(d.id));
      expect(item).toBeTruthy();
      expect(item.max).toBe(d.smallKeys);
      expect(item.apName).toBe(`Small Key (${d.apName})`);
      expect(item.group).toBe('keys');
    }
  });

  test('big-key items exist only for dungeons that have one', () => {
    expect(getItemById(bigKeyItemId('GT'))).toBeTruthy();
    expect(getItemById(bigKeyItemId('AT'))).toBeNull(); // Agahnim's Tower has no big key
  });

  test('AP key names map back to the generated items', () => {
    expect(getItemByApName('Small Key (Ganons Tower)').id).toBe('sk_GT');
    expect(getItemByApName('Big Key (Turtle Rock)').id).toBe('bk_TR');
  });

  test('no id collisions between key items and inventory items', () => {
    const ids = itemData.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('dungeon keys — itemState integration', () => {
  test('small keys are counted and clamped to the dungeon cap', () => {
    let s = svc.setCount({}, 'sk_GT', 8);
    expect(svc.getCount(s, 'sk_GT')).toBe(8);
    s = svc.setCount(s, 'sk_GT', 99);
    expect(svc.getCount(s, 'sk_GT')).toBe(8); // Ganon's Tower cap
  });

  test('big keys behave as a toggle', () => {
    const s = svc.increment({}, 'bk_TR');
    expect(svc.has(s, 'bk_TR')).toBe(true);
    expect(svc.increment(s, 'bk_TR')['bk_TR']).toBeUndefined(); // wraps to 0
  });

  test('keyItems is non-empty and every entry is well-formed', () => {
    expect(keyItems.length).toBeGreaterThan(0);
    for (const k of keyItems) {
      expect(k.id).toMatch(/^(sk|bk)_/);
      expect(typeof k.max).toBe('number');
    }
  });
});

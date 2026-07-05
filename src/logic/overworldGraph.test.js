// src/logic/overworldGraph.test.js
import { overworldEdges } from './overworldGraph';
import { regionExists } from './regions';

describe('overworld graph — structural integrity', () => {
  test('imports without throwing (no unknown region endpoints)', () => {
    expect(Array.isArray(overworldEdges)).toBe(true);
    expect(overworldEdges.length).toBeGreaterThan(0);
  });

  test('every edge endpoint is a real region', () => {
    for (const e of overworldEdges) {
      expect(regionExists(e.from)).toBe(true);
      expect(regionExists(e.to)).toBe(true);
    }
  });

  test('every edge carries a callable requires predicate and a fidelity tag', () => {
    for (const e of overworldEdges) {
      expect(typeof e.requires).toBe('function');
      expect(['CONFIDENT', 'VALIDATE']).toContain(e.tag);
    }
  });
});

describe('overworld graph — sample gate semantics', () => {
  const edge = (from, to) => overworldEdges.find((e) => e.from === from && e.to === to);

  test('Death Mountain top crosses to East DM top with the hammer', () => {
    const e = edge('Death Mountain (Top)', 'East Death Mountain (Top)');
    expect(e.requires({})).toBe(false);
    expect(e.requires({ hammer: 1 })).toBe(true);
  });

  test('East DM ↔ Turtle Rock teleporter needs Titan\'s Mitts AND Hammer', () => {
    const e = edge('East Death Mountain (Top)', 'Turtle Rock (Top)');
    expect(e.requires({ glove: 2 })).toBe(false); // mitts alone
    expect(e.requires({ hammer: 1 })).toBe(false); // hammer alone
    expect(e.requires({ glove: 2, hammer: 1 })).toBe(true);
  });

  test('South Dark World bridge needs only the Hammer (pearl is solver-applied)', () => {
    // The bunny/Moon-Pearl gate is no longer baked into the edge — it's applied
    // by the solver per region world + mode. The edge itself is terrain-only.
    const e = edge('East Dark World', 'South Dark World');
    expect(e.requires({})).toBe(false); // hammer missing
    expect(e.requires({ hammer: 1 })).toBe(true);
  });

  test('the Menu start edge is NOT in the static overworld set (mode-injected)', () => {
    expect(edge('Menu', 'Light World')).toBeUndefined();
  });

  test('dark world: lake shore is walkable from the East hub (no flippers)', () => {
    expect(edge('East Dark World', 'Dark Lake Hylia').requires({})).toBe(true);
    // But the central island still needs flippers.
    expect(edge('Dark Lake Hylia', 'Dark Lake Hylia Central Island').requires({})).toBe(false);
    expect(edge('Dark Lake Hylia', 'Dark Lake Hylia Central Island').requires({ flippers: 1 })).toBe(true);
  });

  test('dark world: South is gated by the Hammer bridge (not free via the lake)', () => {
    // Regression: South was wrongly reachable for free through a South↔Lake edge.
    expect(edge('South Dark World', 'Dark Lake Hylia')).toBeUndefined();
    const bridge = edge('East Dark World', 'South Dark World');
    expect(bridge.requires({})).toBe(false);
    expect(bridge.requires({ hammer: 1 })).toBe(true);
  });

  test('dark world: Northeast (Dark Witch Hut) needs the broken-bridge pass', () => {
    // Regression: Dark Witch's Hut was a false-positive when lumped in East Dark World.
    const e = edge('East Dark World', 'Northeast Dark World');
    expect(e.requires({})).toBe(false);
    expect(e.requires({ hammer: 1 })).toBe(true);
    expect(e.requires({ glove: 1 })).toBe(true); // lift rocks
    expect(e.requires({ flippers: 1 })).toBe(true);
  });

  test('dark world: Catfish needs a glove (behind the broken bridge)', () => {
    expect(edge('Northeast Dark World', 'Catfish').requires({})).toBe(false);
    expect(edge('Northeast Dark World', 'Catfish').requires({ glove: 1 })).toBe(true);
  });

  test('dark world: Village of Outcasts needs Titan\'s Mitts or Hammer (verbatim AP rule)', () => {
    // Regression: West DW (village + Skull Woods behind it) was wrongly free.
    const e = edge('East Dark World', 'West Dark World');
    expect(e.requires({})).toBe(false);
    expect(e.requires({ glove: 1 })).toBe(false); // power glove is not enough (dark rocks)
    expect(e.requires({ glove: 2 })).toBe(true); // titan's mitts
    expect(e.requires({ hammer: 1 })).toBe(true);
    expect(e.requires({ hookshot: 1 })).toBe(false); // the hookshot gap is a separate transition
  });
});

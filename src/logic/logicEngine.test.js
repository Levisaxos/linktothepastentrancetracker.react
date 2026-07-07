// src/logic/logicEngine.test.js
import { evaluate, getReachableRegions } from './logicEngine';
import { checksData } from '../data/checkData';

// Reference ids used across tests:
//   node 69  → 'Light World' (reachable from Menu)
//   node 120 → 'Dark Desert' (isolated: no edges lead in)
//   EP dungeon interior = 1045; its checks are 40–45 (45 = Armos boss).
//   Old Man Cave connector pair = 2005 / 2006 (number 3).

describe('getReachableRegions', () => {
  test('Light World is reachable from the start with nothing', () => {
    const r = getReachableRegions({}, {});
    expect(r.has('Light World')).toBe(true);
  });

  test('a connector opens the far region, but the off-world needs the Moon Pearl (bunny rule)', () => {
    const layout = { 2: { locationId: 2005 }, 117: { locationId: 2006 } }; // LW ↔ South Dark World
    // Standard: the Dark World is the off-world. Without the pearl you're a bunny
    // there, so the far (dark) region does NOT count as reachable…
    expect(getReachableRegions({}, layout).has('South Dark World')).toBe(false);
    // …but with the pearl the connector opens it.
    expect(getReachableRegions({ moonPearl: 1 }, layout).has('South Dark World')).toBe(true);
  });

  test('a connector with only one end placed opens nothing', () => {
    const r = getReachableRegions({}, { 2: { locationId: 2005 } });
    expect(r.has('South Dark World')).toBe(false);
  });

  test('inverted mode: start is the dark world; light world needs a recorded entrance', () => {
    // Dark world is home in inverted → reachable from the start with nothing.
    expect(getReachableRegions({}, {}, 'inverted').has('East Dark World')).toBe(true);
    // Light World has no fixed edge from the dark world — only a recorded
    // connector/portal opens it (and, being the off-world in inverted, the pearl).
    expect(getReachableRegions({}, {}, 'inverted').has('Light World')).toBe(false);
  });

  test('start region is always reachable even when it sits in the pearl-world', () => {
    // Standard start forced into a dark region (South Dark World): it's home, so
    // it's reachable with no pearl, but nothing beyond the terrain gates opens.
    const r = getReachableRegions({}, {}, 'standard', 'South Dark World');
    expect(r.has('South Dark World')).toBe(true);
    expect(r.has('Light World')).toBe(false);
  });
});

describe('evaluate — three-state semantics', () => {
  test('with no spawn placed, nothing is reachable → every check is unknown', () => {
    const res = evaluate({}, { 69: { locationId: 1045 } }); // EP placed, but no spawn
    const states = new Set(Object.values(res));
    expect(states).toEqual(new Set(['unknown']));
  });

  test('interior placed in a reachable region, no rule → in', () => {
    // Spawn in the Light World (node 50); EP in the Light World.
    const res = evaluate({}, { 69: { locationId: 1045 } }, { startNodes: [50] });
    expect(res[40]).toBe('in'); // Compass Chest, no extra rule
  });

  test('reachable but item-blocked → out (not unknown)', () => {
    const res = evaluate({}, { 69: { locationId: 1045 } }, { startNodes: [50] });
    expect(res[45]).toBe('out'); // Armos needs a weapon; we have none
    const armed = evaluate({ sword: 1 }, { 69: { locationId: 1045 } }, { startNodes: [50] });
    expect(armed[45]).toBe('in');
  });

  test('interior placed in an UNREACHABLE region → unknown (not out)', () => {
    // Spawn in the Light World; EP sits in Dark Desert, which has no inbound edges.
    const res = evaluate({ sword: 1 }, { 120: { locationId: 1045 } }, { startNodes: [50] });
    expect(res[40]).toBe('unknown');
    expect(res[45]).toBe('unknown');
  });

  test('reaching a dungeon via a connector flips its checks to in', () => {
    // Put EP behind a region only reachable through a connector from Light World.
    const layout = {
      2: { locationId: 2005 }, // OMC front in Light World
      117: { locationId: 2006 }, // OMC back in South Dark World
      118: { locationId: 1045 }, // EP now sits in South Dark World (node 118)
    };
    // Before the connector is complete, node 118's region is unreachable.
    const partial = evaluate({ sword: 1, moonPearl: 1 }, { 118: { locationId: 1045 } }, { startNodes: [50] });
    expect(partial[40]).toBe('unknown');
    // With the connector completed (and the pearl for the dark world), reachable.
    const full = evaluate({ sword: 1, moonPearl: 1 }, layout, { startNodes: [50] });
    expect(full[40]).toBe('in');
  });

  test('result covers exactly the checkData set', () => {
    const res = evaluate({}, {});
    expect(Object.keys(res).length).toBe(checksData.length);
  });

  test('startNode derives the start region from the recorded spawn', () => {
    // EP placed at node 117 (South Dark World). With the default start (Light
    // World) it's unreachable; marking node 117 as spawn makes it home.
    const layout = { 117: { locationId: 1045 } };
    expect(evaluate({ sword: 1 }, layout)[40]).toBe('unknown');
    expect(evaluate({ sword: 1 }, layout, { startNode: 117 })[40]).toBe('in');
  });

  test('multiple spawn points seed reachability from all of them (union)', () => {
    const layout = { 117: { locationId: 1045 } }; // EP → South Dark World

    // Spawning only in the Light World (node 50): EP's dark-world region is out.
    expect(evaluate({}, layout, { startNodes: [50] })[40]).toBe('unknown');
    // Add a second spawn at node 117 (South Dark World): now EP is reachable.
    expect(evaluate({}, layout, { startNodes: [50, 117] })[40]).toBe('in');

    // getReachableRegions seeds every spawn region directly.
    const r = getReachableRegions({}, layout, 'standard', ['Light World', 'South Dark World']);
    expect(r.has('Light World')).toBe(true);
    expect(r.has('South Dark World')).toBe(true);
  });

  test('spawns are DERIVED from placed spawn locations (no explicit startNodes)', () => {
    // Link's House (3003) placed at node 117 (South Dark World) makes it a spawn,
    // so EP placed alongside it becomes reachable — with no startNodes passed.
    const layout = {
      117: { locationId: 3003 }, // Link's House → South Dark World is now a spawn
      118: { locationId: 1045 }, // EP in South Dark World
    };
    expect(evaluate({}, layout)[40]).toBe('in');
    // Without any spawn location, the same EP placement is unreachable (default
    // start is the Light World).
    expect(evaluate({}, { 118: { locationId: 1045 } })[40]).toBe('unknown');
  });
});

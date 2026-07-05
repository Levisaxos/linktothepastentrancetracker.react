// src/logic/entranceGraph.test.js
import { nodeRegions, regionOfNode } from './nodeRegions';
import { buildEntranceEdges, buildGraph, crossWorldPortals } from './entranceGraph';
import { regionExists, getRegion } from './regions';
import { mapData } from '../data/mapData';
import { connectorData } from '../data/locationTypes';

describe('nodeRegions — integrity', () => {
  const allNodeIds = [...mapData.light, ...mapData.dark].map((n) => n.id);

  test('every one of the 147 map-nodes has a region', () => {
    const missing = allNodeIds.filter((id) => !(id in nodeRegions));
    expect(missing).toEqual([]);
  });

  test('every mapped region is a real region', () => {
    for (const id of allNodeIds) {
      expect(regionExists(regionOfNode(id))).toBe(true);
    }
  });

  test('no stray node ids that are not on the map', () => {
    const stray = Object.keys(nodeRegions).map(Number).filter((id) => !allNodeIds.includes(id));
    expect(stray).toEqual([]);
  });

  // Load-bearing for mode support: a node's physical world (which map it's on)
  // is fixed; only the pearl requirement flips by mode. So every light-map node
  // must map to a light region, every dark-map node to a dark region.
  test('each node maps to a region in its own physical world', () => {
    const wrong = [];
    for (const n of mapData.light) {
      if (getRegion(regionOfNode(n.id)).world !== 'light') wrong.push([n.id, n.name, 'expected light']);
    }
    for (const n of mapData.dark) {
      if (getRegion(regionOfNode(n.id)).world !== 'dark') wrong.push([n.id, n.name, 'expected dark']);
    }
    expect(wrong).toEqual([]);
  });
});

describe('crossWorldPortals — integrity', () => {
  test('endpoints are real regions and predicates callable', () => {
    for (const p of crossWorldPortals) {
      expect(regionExists(p.from)).toBe(true);
      expect(regionExists(p.to)).toBe(true);
      expect(typeof p.requires).toBe('function');
    }
  });
});

describe('buildEntranceEdges — connector placements become edges', () => {
  // Old Man Cave is connector pair number 3: 2005 (front) + 2006 (back).
  const OMC_FRONT = 2005;
  const OMC_BACK = 2006;

  test('a single placed end creates no edge (undiscovered pair)', () => {
    const edges = buildEntranceEdges({ 80: { locationId: OMC_FRONT } });
    expect(edges).toEqual([]);
  });

  test('both ends placed in different regions create a two-way edge', () => {
    // Put the two ends on nodes in deliberately different regions.
    const edges = buildEntranceEdges({
      2: { locationId: OMC_FRONT }, // node 2 → Light World
      117: { locationId: OMC_BACK }, // node 117 → South Dark World
    });
    const from = new Set(edges.map((e) => e.from));
    const to = new Set(edges.map((e) => e.to));
    expect(edges.length).toBe(2); // two-way
    expect(from).toEqual(new Set(['Light World', 'South Dark World']));
    expect(to).toEqual(new Set(['Light World', 'South Dark World']));
  });

  test('both ends in the same region create no self-loop', () => {
    const edges = buildEntranceEdges({
      2: { locationId: OMC_FRONT }, // Light World
      3: { locationId: OMC_BACK }, // also Light World
    });
    expect(edges).toEqual([]);
  });

  test('non-connector placements (dungeons/useful) add no edges', () => {
    const edges = buildEntranceEdges({
      69: { locationId: 1045 }, // Eastern Palace (dungeon) — dead end
      68: { locationId: 3012 }, // Sahasrala (useful) — dead end
    });
    expect(edges).toEqual([]);
  });

  test('connectorData pairs are internally consistent (each number appears >1)', () => {
    const counts = {};
    for (const c of connectorData) counts[c.number] = (counts[c.number] || 0) + 1;
    for (const n of Object.keys(counts)) expect(counts[n]).toBeGreaterThan(1);
  });
});

describe('buildGraph — assembly', () => {
  test('includes fixed overworld edges even with no placements', () => {
    const g = buildGraph({});
    expect(g['Menu']).toBeDefined();
    expect(g['Menu'].some((e) => e.to === 'Light World')).toBe(true);
  });

  test('adds entrance edges from placements', () => {
    const g = buildGraph({
      2: { locationId: 2005 },
      117: { locationId: 2006 },
    });
    expect(g['Light World'].some((e) => e.to === 'South Dark World')).toBe(true);
  });
});

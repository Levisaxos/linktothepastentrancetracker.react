// src/logic/entranceGraph.js
//
// Phase 2b — turns the user's manual entrance layout (game.locations) into graph
// edges the solver (2d) can traverse, and assembles the full region graph:
//
//     full graph = fixed overworld edges (2a)
//                + fixed cross-world portals (2b, provisional)
//                + entrance edges derived from connector placements (2b)
//
// How a placement becomes an edge:
//   • A CONNECTOR (locationId 2001–2999) has a pair sharing `connector.number`.
//     When two ends of the same number are placed on two nodes, we link those
//     nodes' regions two-way. Because regionOfNode returns light OR dark regions
//     transparently, a connector whose ends span worlds links them for free —
//     which is how most LW↔DW travel in ER emerges without a portal table.
//   • A DUNGEON / useful / static interior is a dead-end for *traversal*: it
//     exposes checks in the region it sits in but adds no overworld edge. (Check
//     reachability is resolved by the solver in 2d, not here.)
//
// FIDELITY: connectors are treated as free, two-way. Some real connectors are
// one-way (drops) or item-gated internally — marked for 2e to correct.

import { getConnectorById } from '../data/locationTypes';
import { overworldEdges } from './overworldGraph';
import { regionOfNode } from './nodeRegions';
import { rules } from './rules';
import { START_REGION } from './regions';
import { MODES, startRegion } from './mode';

const CONNECTOR_MIN = 2001;
const CONNECTOR_MAX = 2999;

// Fixed cross-world portals. The Death Mountain teleporters now live in
// overworldGraph.js (rebuilt from source). Everything else crosses worlds via
// user-recorded connectors, and DW→LW mirror-spot portals are mode-dependent and
// still deferred. So this list is currently empty.
export const crossWorldPortals = [];

/**
 * Derive two-way edges from connector placements in a game's locations.
 * @param {Object} gameLocations - game.locations: { [nodeId]: { locationId, ... } }
 * @returns {Array<{from,to,requires,tag}>}
 */
export function buildEntranceEdges(gameLocations = {}) {
  // Group placed connector ends by their pair number.
  const byNumber = {};
  for (const [nodeId, data] of Object.entries(gameLocations)) {
    const locId = data?.locationId;
    if (!locId || locId < CONNECTOR_MIN || locId > CONNECTOR_MAX) continue;
    const connector = getConnectorById(locId);
    if (!connector) continue;
    (byNumber[connector.number] ||= []).push(Number(nodeId));
  }

  const edges = [];
  for (const nodeIds of Object.values(byNumber)) {
    // Link every distinct region pair among the placed ends (usually 2 ends;
    // e.g. Paradox has 3). Guard against self-loops within one region.
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const a = regionOfNode(nodeIds[i]);
        const b = regionOfNode(nodeIds[j]);
        if (a && b && a !== b) {
          edges.push({ from: a, to: b, requires: rules.always, tag: 'entrance' });
          edges.push({ from: b, to: a, requires: rules.always, tag: 'entrance' });
        }
      }
    }
  }
  return edges;
}

/**
 * Assemble the full region graph for a game as a region -> [{to, requires}] map,
 * ready for the solver (2d). The Menu → start-region edge is mode-dependent and
 * injected here.
 * @param {Object} gameLocations
 * @param {string} mode - one of MODES (defaults to standard)
 * @param {string|string[]} startRegionIds - overworld region(s) the player can
 *   spawn in (defaults to the mode's home hub). A Menu edge is added to each.
 */
// Corresponding overworld positions between the Dark and Light worlds — the Magic
// Mirror warps you to the SAME map spot in the other world. Listed [dark, light].
// Most dark overworld quadrants mirror to the single big 'Light World' region (once
// you land anywhere in it you can walk it all); ledges/mountain map to their
// counterparts. (APPROX — refine specific spots as they come up.)
const MIRROR_PAIRS = [
  ['East Dark World', 'Light World'],
  ['Catfish', 'Light World'],
  ['Northeast Dark World', 'Light World'],
  ['South Dark World', 'Light World'],
  ['Dark Lake Hylia', 'Light World'],
  ['Dark Lake Hylia Central Island', 'Lake Hylia Island'],
  ['Dark Lake Hylia Ledge', 'Light World'],
  ['West Dark World', 'Light World'],
  ['West Dark World', 'Kings Grave Area'], // the graveyard ledge, specifically
  ['Dark Grassy Lawn', 'Light World'],
  ['Hammer Peg Area', 'Light World'],
  ['Bumper Cave Entrance', 'Light World'],
  ['Bumper Cave Ledge', 'Death Mountain Return Ledge'],
  ['Skull Woods Forest', 'Light World'],
  ['Skull Woods Forest (West)', 'Light World'],
  ['Dark Desert', 'Light World'],
  ['Pyramid Ledge', 'Light World'],
  ['Dark Death Mountain (West Bottom)', 'Death Mountain'],
  ['Dark Death Mountain (Top)', 'Death Mountain (Top)'],
  ['Dark Death Mountain Ledge', 'Death Mountain (Top)'],
  ['Dark Death Mountain (East Bottom)', 'East Death Mountain (Bottom)'],
  ['Death Mountain Floating Island (Dark World)', 'Death Mountain Floating Island (Light World)'],
];

// The Mirror warps HOME world -> OFF world at the matching position.
//   INVERTED: dark(home) -> light(off), no pearl ('...Mirror Spot' = mirror only,
//             Rules.py inverted) — so it bypasses the off-world bunny/pearl gate.
//   STANDARD: light(home) -> dark(off), needs the pearl to arrive as Link, not a
//             bunny ('Kings Grave Mirror Spot' = Moon Pearl + Magic Mirror).
// One-way edges (you mirror INTO the off-world; getting back is a separate route).
function mirrorEdges(mode) {
  const inverted = mode === MODES.INVERTED;
  return MIRROR_PAIRS.map(([dark, light]) => inverted
    ? { from: dark, to: light, requires: rules.hasMirror, bypassPearl: true }
    : { from: light, to: dark, requires: (s) => rules.hasMirror(s) && rules.hasMoonPearl(s) });
}

export function buildGraph(gameLocations = {}, mode = MODES.STANDARD, startRegionIds = [startRegion(mode)]) {
  const starts = (Array.isArray(startRegionIds) ? startRegionIds : [startRegionIds]).filter(Boolean);
  const startEdges = starts.map((to) => ({ from: START_REGION, to, requires: rules.always }));
  const all = [...startEdges, ...overworldEdges, ...crossWorldPortals, ...mirrorEdges(mode), ...buildEntranceEdges(gameLocations)];
  const adjacency = {};
  for (const e of all) {
    (adjacency[e.from] ||= []).push({ to: e.to, requires: e.requires, bypassPearl: e.bypassPearl });
  }
  return adjacency;
}

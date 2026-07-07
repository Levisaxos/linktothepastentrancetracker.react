// src/logic/logicEngine.js
//
// Phase 2d — the reachability solver. Pure function of (itemState, entrance
// layout). Ties together the region graph (2a/2b) and per-check rules (2c):
//
//     evaluate(itemState, gameLocations) -> { [checkId]: 'in' | 'out' | 'unknown' }
//
// Three-state semantics (this is the crux for an entrance tracker):
//   'in'      — an interior exposing the check is placed in a REACHABLE region
//               AND the check's own rule passes → obtainable right now.
//   'out'     — reachable, but the required item is missing (item-blocked).
//   'unknown' — the exposing interior isn't placed yet, OR its region is only
//               reachable through entrances not yet recorded. "Can't reach it
//               YET" is honestly unknown, not out.
//
// Edges depend only on items (not on which other regions are visited), so plain
// reachability from the start region suffices — no fixed-point iteration needed.

import { buildGraph } from './entranceGraph';
import { regionOfNode } from './nodeRegions';
import { getCheckRule } from './checkRules';
import { checksData } from '../data/checkData';
import { START_REGION, getRegion } from './regions';
import { MODES, startRegion, pearlWorld } from './mode';
import { rules } from './rules';

/**
 * Set of region ids reachable from the start given items + entrance layout.
 *
 * Bunny rule: entering the OFF-world (the pearlWorld for the mode — Dark World in
 * standard, Light World in inverted) requires the Moon Pearl. Without it you're a
 * bunny there and can't meaningfully act, so those regions don't count as reached.
 * The HOME world is always pearl-free — you walk it and its connectors freely.
 * Spawn regions are seeded directly (save & quit), so they're reachable even if
 * off-world.
 * @param {string|string[]} startRegionIds - the region(s) the player can begin
 *   from (each recorded spawn point: Link's House, Sanctuary, rescued Old Man,
 *   …). Reachability seeds from all of them. Defaults to the mode's home hub.
 */
export function getReachableRegions(
  itemState = {},
  gameLocations = {},
  mode = MODES.STANDARD,
  startRegionIds = [startRegion(mode)]
) {
  const starts = (Array.isArray(startRegionIds) ? startRegionIds : [startRegionIds]).filter(Boolean);
  const adjacency = buildGraph(gameLocations, mode, starts);

  const offWorld = pearlWorld(mode);
  const hasPearl = rules.hasMoonPearl(itemState);

  // Seed Menu + every spawn region (a spawn is always reachable — save & quit).
  const reachable = new Set([START_REGION, ...starts]);
  const queue = [START_REGION, ...starts];
  while (queue.length) {
    const current = queue.shift();
    for (const edge of adjacency[current] || []) {
      if (reachable.has(edge.to) || !edge.requires(itemState)) continue;
      // Bunny gate: can't enter the off-world without the Moon Pearl — unless the
      // edge is pearl-exempt (e.g. an inverted mirror spot, which lands you as Link).
      const toRegion = getRegion(edge.to);
      if (toRegion && toRegion.world === offWorld && !hasPearl && !edge.bypassPearl) continue;
      reachable.add(edge.to);
      queue.push(edge.to);
    }
  }
  return reachable;
}

// Locations that ARE spawn points by their nature — placing one makes its node a
// save-and-quit start. Reachability seeds from all of them; no separate "set
// spawn" step. (IDs from usefulLocationData / connector data.)
export const SPAWN_LOCATION_IDS = new Set([
  3003, // Link's House
  3004, // Dark Sanctuary (inverted)
  3014, // Sanctuary (standard)
  2006, // Old Man Cave Back (a spawn once the Old Man is rescued)
]);

// Region(s) the player can spawn in, derived from the placed spawn locations
// (Link's House, Sanctuary, …). Returns [] when none are placed — with no spawn
// recorded, nothing is reachable yet (don't assume a default start).
export function getSpawnRegions(gameLocations = {}) {
  const regionIds = [];
  for (const [nodeId, data] of Object.entries(gameLocations)) {
    if (data && SPAWN_LOCATION_IDS.has(data.locationId)) {
      const r = regionOfNode(Number(nodeId));
      if (r) regionIds.push(r);
    }
  }
  return [...new Set(regionIds)];
}

// interiorId -> [nodeId, ...] where the user has placed that interior.
function indexPlacements(gameLocations) {
  const index = {};
  for (const [nodeId, data] of Object.entries(gameLocations)) {
    const locId = data?.locationId;
    if (locId) (index[locId] ||= []).push(Number(nodeId));
  }
  return index;
}

/**
 * Evaluate every check to in / out / unknown.
 * @param {Object} itemState - { itemId: count }
 * @param {Object} gameLocations - game.locations: { nodeId: { locationId } }
 * @param {Object} [opts] - { mode | inverted, startNodes | startNode }
 *   startNodes = the map-nodes the player marked as spawn points; their regions
 *   are the reachability roots. `startNode` (single) is also accepted. Falls back
 *   to the mode's home hub when none are set.
 * @returns {Object} { [checkId]: 'in' | 'out' | 'unknown' }
 */
export function evaluate(itemState = {}, gameLocations = {}, opts = {}) {
  const mode = opts.mode || (opts.inverted ? MODES.INVERTED : MODES.STANDARD);
  // Spawns are normally derived from the placed spawn locations (Link's House,
  // Sanctuary, …). An explicit startNodes/startNode override is honoured for
  // tests and edge cases.
  let startRegionIds;
  if (opts.startNodes || opts.startNode != null) {
    const nodes = opts.startNodes || [opts.startNode];
    const regionIds = nodes.map((n) => regionOfNode(n)).filter(Boolean);
    startRegionIds = regionIds.length ? [...new Set(regionIds)] : [startRegion(mode)];
  } else {
    startRegionIds = getSpawnRegions(gameLocations);
  }
  const reachable = getReachableRegions(itemState, gameLocations, mode, startRegionIds);
  const placements = indexPlacements(gameLocations);

  const result = {};
  for (const check of checksData) {
    // A check is reachable if ANY interior exposing it is placed in a reachable
    // region. locationId 0 = an overworld surface check not wired to a node yet
    // (app gap) — it contributes nothing, so such checks resolve to 'unknown'.
    let reachableHere = false;
    for (const locId of check.locationIds) {
      if (!locId) continue;
      const nodes = placements[locId];
      if (nodes && nodes.some((n) => reachable.has(regionOfNode(n)))) {
        reachableHere = true;
        break;
      }
    }

    if (reachableHere) {
      result[check.id] = getCheckRule(check.id)(itemState) ? 'in' : 'out';
    } else {
      result[check.id] = 'unknown';
    }
  }
  return result;
}

export const logicEngine = { evaluate, getReachableRegions };

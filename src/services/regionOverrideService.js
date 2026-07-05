// src/services/regionOverrideService.js
//
// Lets the user re-assign a map node to a different logic region from inside the
// tracker (no backend needed). Overrides are GLOBAL (they're logic data, not
// per-game) and live in localStorage. The engine reads them via
// nodeRegions.setRegionOverrides(). "Export" dumps the effective map so it can be
// baked into src/logic/nodeRegions.js permanently.

import { nodeRegions } from '../logic/nodeRegions';

const KEY = 'zelda_tracker_region_overrides';

export const regionOverrideService = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  },

  save(overrides) {
    try {
      localStorage.setItem(KEY, JSON.stringify(overrides));
    } catch (e) {
      console.error('Failed to save region overrides:', e);
    }
  },

  set(nodeId, region) {
    const overrides = this.load();
    overrides[nodeId] = region;
    this.save(overrides);
    return overrides;
  },

  clear(nodeId) {
    const overrides = this.load();
    delete overrides[nodeId];
    this.save(overrides);
    return overrides;
  },

  // The full node -> region map with overrides applied, ready to paste into
  // nodeRegions.js. Keys are numeric node ids, sorted.
  effectiveMap() {
    const merged = { ...nodeRegions, ...this.load() };
    const sorted = {};
    for (const id of Object.keys(merged).map(Number).sort((a, b) => a - b)) {
      sorted[id] = merged[id];
    }
    return sorted;
  },
};

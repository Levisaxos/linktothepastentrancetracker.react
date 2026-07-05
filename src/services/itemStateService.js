// src/services/itemStateService.js
//
// Pure item-state model for logic tracking (Phase 1). No React, no storage — just
// data transforms over an item map of { [itemId]: count }. Missing keys = 0.
//
// This is the single source of truth for "what the player has". The manual item
// panel edits it now; the AP client (Phase 4) will produce the same shape. The
// logic engine (Phase 2) consumes the derived helpers at the bottom.

import { getItemById } from '../data/itemData';

export const itemStateService = {
  createEmptyState() {
    return {};
  },

  getCount(items, id) {
    return (items && items[id]) || 0;
  },

  has(items, id) {
    return this.getCount(items, id) > 0;
  },

  // Returns a new item map with `id` clamped to [0, item.max]. Zero counts are
  // dropped so the stored object stays sparse.
  setCount(items, id, count) {
    const item = getItemById(id);
    if (!item) return items;

    const clamped = Math.max(0, Math.min(count, item.max));
    const next = { ...items };
    if (clamped === 0) {
      delete next[id];
    } else {
      next[id] = clamped;
    }
    return next;
  },

  // Left-click behaviour: step up, wrapping to 0 once past max. Works for
  // toggles (0↔1) and progressive/count items alike.
  increment(items, id) {
    const item = getItemById(id);
    if (!item) return items;
    const current = this.getCount(items, id);
    const next = current >= item.max ? 0 : current + 1;
    return this.setCount(items, id, next);
  },

  // Right-click behaviour: step down, wrapping to max once below 0.
  decrement(items, id) {
    const item = getItemById(id);
    if (!item) return items;
    const current = this.getCount(items, id);
    const next = current <= 0 ? item.max : current - 1;
    return this.setCount(items, id, next);
  },

  // --- Derived helpers (grow in Phase 2 as the logic engine needs them) ---

  swordLevel(items) {
    return this.getCount(items, 'sword');
  },

  // Any melee weapon that can break/attack (sword or hammer). Kept deliberately
  // simple for now; refine against apworld StateHelpers in Phase 2.
  hasMelee(items) {
    return this.swordLevel(items) > 0 || this.has(items, 'hammer');
  },

  gloveLevel(items) {
    return this.getCount(items, 'glove');
  },

  // Power Glove or better lifts light rocks.
  canLiftRocks(items) {
    return this.gloveLevel(items) >= 1;
  },

  // Titans Mitts lifts dark/heavy rocks.
  canLiftHeavy(items) {
    return this.gloveLevel(items) >= 2;
  },

  bottleCount(items) {
    return this.getCount(items, 'bottle');
  },

  hasBow(items) {
    return this.getCount(items, 'bow') >= 1;
  },

  hasSilverArrows(items) {
    return this.getCount(items, 'bow') >= 2;
  },

  // Lamp or Fire Rod can light darkness / torches.
  hasFireSource(items) {
    return this.has(items, 'lamp') || this.has(items, 'fireRod');
  },
};

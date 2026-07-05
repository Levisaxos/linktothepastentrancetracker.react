// src/data/itemData.js
//
// Canonical ALttP inventory item list for logic tracking (Phase 1).
//
// Each item's `apName` is our best-known Archipelago item name. In Phase 4 these
// are validated/corrected against the live AP DataPackage (the authoritative
// source), so treat them as a starting point, not gospel.
//
// Item state is stored per-game as a map of { [item.id]: count }. Missing = 0.
//   - type 'toggle'      : count is 0 or 1
//   - type 'progressive' : count is 0..max, icon chosen by level (files[count-1])
//   - type 'count'       : count is 0..max, single icon + numeric badge
//
// `logic: true` marks items that affect reachability (Phase 2+). Items with
// `logic: false` (mail, shield, magic upgrade) are tracked for completeness only.

import { keyItems } from './dungeons';

const ICON_BASE = '/images/items';

// Build a browser-safe src from a filename that may contain spaces.
export const itemIconSrc = (file) => `${ICON_BASE}/${encodeURIComponent(file)}`;

// Inventory items shown in the manual panel. Dungeon keys (group 'keys') are
// appended below from dungeons.js — they're logic/AP-driven and hidden from the
// panel, but share the same registry so getItemById / itemState work uniformly.
const inventoryItems = [
  // --- Core progression: weapons / tools ---
  {
    id: 'sword', label: 'Sword', apName: 'Progressive Sword',
    type: 'progressive', max: 4, logic: true, group: 'equipment',
    files: ['fighters sword.png', 'master sword.png', 'tempered sword.png', 'golden sword.png'],
  },
  {
    id: 'bow', label: 'Bow', apName: 'Progressive Bow',
    // 0 none, 1 bow, 2 bow + silver arrows
    type: 'progressive', max: 2, logic: true, group: 'equipment',
    files: ['bow.png', 'bowandsilverarrow.png'],
  },
  { id: 'blueBoomerang', label: 'Blue Boomerang', apName: 'Blue Boomerang', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'blue boomerang.png' },
  { id: 'redBoomerang', label: 'Red Boomerang', apName: 'Red Boomerang', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'red boomerang.png' },
  { id: 'hookshot', label: 'Hookshot', apName: 'Hookshot', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'hookshot.png' },
  { id: 'mushroom', label: 'Mushroom', apName: 'Mushroom', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'mushroom.png' },
  { id: 'powder', label: 'Magic Powder', apName: 'Magic Powder', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'powder.png' },
  { id: 'fireRod', label: 'Fire Rod', apName: 'Fire Rod', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'fire rod.png' },
  { id: 'iceRod', label: 'Ice Rod', apName: 'Ice Rod', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'ice rod.png' },
  { id: 'bombos', label: 'Bombos', apName: 'Bombos', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'bombos tablet.png' },
  { id: 'ether', label: 'Ether', apName: 'Ether', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'ether tablet.png' },
  { id: 'quake', label: 'Quake', apName: 'Quake', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'quake tablet.png' },
  { id: 'lamp', label: 'Lamp', apName: 'Lamp', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'lamp.png' },
  { id: 'hammer', label: 'Hammer', apName: 'Hammer', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'hammer.png' },
  { id: 'shovel', label: 'Shovel', apName: 'Shovel', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'shovel.png' },
  { id: 'flute', label: 'Flute', apName: 'Flute', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'flute.png' },
  { id: 'bugNet', label: 'Bug Net', apName: 'Bug Catching Net', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'bugnet.png' },
  { id: 'book', label: 'Book of Mudora', apName: 'Book of Mudora', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'book.png' },
  { id: 'bottle', label: 'Bottle', apName: 'Bottle', type: 'count', max: 4, logic: true, group: 'equipment', file: 'bottle.png' },
  { id: 'somaria', label: 'Cane of Somaria', apName: 'Cane of Somaria', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'cane of somaria.png' },
  { id: 'byrna', label: 'Cane of Byrna', apName: 'Cane of Byrna', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'cane of byrna.png' },
  { id: 'cape', label: 'Magic Cape', apName: 'Cape', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'cape.png' },
  { id: 'mirror', label: 'Magic Mirror', apName: 'Magic Mirror', type: 'toggle', max: 1, logic: true, group: 'equipment', file: 'mirror.png' },

  // --- Core progression: movement / access ---
  { id: 'boots', label: 'Pegasus Boots', apName: 'Pegasus Boots', type: 'toggle', max: 1, logic: true, group: 'movement', file: 'boots.png' },
  {
    id: 'glove', label: 'Glove', apName: 'Progressive Glove',
    // 1 Power Glove, 2 Titans Mitts
    type: 'progressive', max: 2, logic: true, group: 'movement',
    files: ['power gloves.png', 'titans mitts.png'],
  },
  { id: 'flippers', label: 'Flippers', apName: 'Flippers', type: 'toggle', max: 1, logic: true, group: 'movement', file: 'flippers.png' },
  { id: 'moonPearl', label: 'Moon Pearl', apName: 'Moon Pearl', type: 'toggle', max: 1, logic: true, group: 'movement', file: 'moon pearl.png' },

  // --- Non-logic gear (tracked for completeness only) ---
  {
    id: 'mail', label: 'Mail', apName: 'Progressive Mail',
    type: 'progressive', max: 2, logic: false, group: 'other',
    files: ['blue mail.png', 'red mail.png'],
  },
  {
    id: 'shield', label: 'Shield', apName: 'Progressive Shield',
    type: 'progressive', max: 3, logic: false, group: 'other',
    files: ['fighters shield.png', 'red shield.png', 'mirror shield.png'],
  },
  {
    id: 'magic', label: 'Magic Upgrade', apName: 'Magic Upgrade (1/2)',
    // 1 = 1/2 magic, 2 = 1/4 magic
    type: 'progressive', max: 2, logic: false, group: 'other',
    files: ['half magic.png', 'quarter magic.png'],
  },
];

export const itemData = [...inventoryItems, ...keyItems];

// Lookups
const itemById = Object.fromEntries(itemData.map((i) => [i.id, i]));
export const getItemById = (id) => itemById[id] || null;
export const getItemByApName = (apName) => itemData.find((i) => i.apName === apName) || null;

// The icon to show for a given item at a given count (0 = base/dimmed level 1).
export const getItemIconFile = (item, count) => {
  if (item.type === 'progressive') {
    const idx = Math.max(0, Math.min(count, item.max) - 1);
    return item.files[idx] || item.files[0];
  }
  return item.file;
};

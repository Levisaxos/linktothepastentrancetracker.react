// src/data/dungeons.js
//
// Canonical *logical* dungeons for key logic (Phase 2g). This is the key-bearing
// dungeon list — distinct from `locationTypes.dungeonData`, which lists map
// SECTIONS (HM/HL/HR, DM/DL/DR/DB, etc.) for the entrance UI.
//
// `apName` matches the Archipelago key item names: keys are named
// "Small Key (<apName>)" / "Big Key (<apName>)" in the spoiler and DataPackage.
//
// smallKeys = number of small keys in the dungeon. These are SETTINGS-DEPENDENT
// (key-drop shuffle adds keys) — the values below are the key-drop-on totals
// taken from the validation spoiler (docs/AP_..._Spoiler.txt). slot_data will
// supply the exact per-seed count in Phase 4; treat these as a soft cap.

export const dungeons = [
  { id: 'HC', apName: 'Hyrule Castle', smallKeys: 4, bigKey: true },
  { id: 'EP', apName: 'Eastern Palace', smallKeys: 2, bigKey: true },
  { id: 'DP', apName: 'Desert Palace', smallKeys: 4, bigKey: true },
  { id: 'TH', apName: 'Tower of Hera', smallKeys: 1, bigKey: true },
  { id: 'AT', apName: 'Agahnims Tower', smallKeys: 4, bigKey: false },
  { id: 'PD', apName: 'Palace of Darkness', smallKeys: 6, bigKey: true },
  { id: 'SP', apName: 'Swamp Palace', smallKeys: 6, bigKey: true },
  { id: 'SW', apName: 'Skull Woods', smallKeys: 5, bigKey: true },
  { id: 'TT', apName: 'Thieves Town', smallKeys: 3, bigKey: true },
  { id: 'IP', apName: 'Ice Palace', smallKeys: 6, bigKey: true },
  { id: 'MM', apName: 'Misery Mire', smallKeys: 6, bigKey: true },
  { id: 'TR', apName: 'Turtle Rock', smallKeys: 6, bigKey: true },
  { id: 'GT', apName: 'Ganons Tower', smallKeys: 8, bigKey: true },
];

const byId = Object.fromEntries(dungeons.map((d) => [d.id, d]));
export const getDungeon = (id) => byId[id] || null;

// Item ids for a dungeon's keys (used by itemState + the logic engine).
export const smallKeyItemId = (dungeonId) => `sk_${dungeonId}`;
export const bigKeyItemId = (dungeonId) => `bk_${dungeonId}`;

// Key items, generated so they live in the same item registry as everything else
// (getItemById / getItemByApName / itemState all work uniformly, and AP can
// populate them in Phase 4). group 'keys' keeps them out of the manual panel.
export const keyItems = dungeons.flatMap((d) => {
  const items = [];
  if (d.smallKeys > 0) {
    items.push({
      id: smallKeyItemId(d.id),
      label: `Small Key (${d.id})`,
      apName: `Small Key (${d.apName})`,
      type: 'count',
      max: d.smallKeys,
      logic: true,
      group: 'keys',
      file: 'lttp_small_key.png',
    });
  }
  if (d.bigKey) {
    items.push({
      id: bigKeyItemId(d.id),
      label: `Big Key (${d.id})`,
      apName: `Big Key (${d.apName})`,
      type: 'toggle',
      max: 1,
      logic: true,
      group: 'keys',
      file: 'lttp_big_key.png',
    });
  }
  return items;
});

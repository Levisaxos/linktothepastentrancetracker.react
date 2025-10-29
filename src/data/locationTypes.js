// src/data/locationTypes.js
import { Package, Link, Castle, X } from 'lucide-react';

export const locationTypes = {
  useful: { name: 'Useful', icon: Package, color: 'bg-green-600', prefix: 'C' },
  connector: { name: 'Connector', icon: Link, color: 'bg-yellow-600', prefix: '#' },
  dungeon: { name: 'Dungeon', icon: Castle, color: 'bg-purple-600', prefix: '' },
  dungeonCompleted: { name: 'Dungeon Completed', icon: Castle, color: 'bg-red-900', prefix: '' },
  static: { name: 'Static', icon: Package, color: 'bg-blue-600', prefix: '' },
  useless: { name: 'Useless', icon: X, color: 'bg-red-900', prefix: '' }
};

// Normalized dungeon data with numeric IDs
export const dungeonData = [
  // Hyrule Castle Sections (early game)
  { id: 1001, acronym: 'HM', fullName: 'Hyrule Castle - Main' },
  { id: 1002, acronym: 'HL', fullName: 'Hyrule Castle - Left' },
  { id: 1003, acronym: 'HR', fullName: 'Hyrule Castle - Right' },
  
  
  // Light World Dungeons (in progression order)
  { id: 1045, acronym: 'EP', fullName: 'Eastern Palace' },
  
  // Desert Palace Sections
  { id: 1005, acronym: 'DM', fullName: 'Desert Palace - Main' },
  { id: 1006, acronym: 'DL', fullName: 'Desert Palace - Left' },
  { id: 1007, acronym: 'DR', fullName: 'Desert Palace - Right' },
  { id: 1008, acronym: 'DB', fullName: 'Desert Palace - Back' },
  
  { id: 1009, acronym: 'TH', fullName: 'Tower of Hera' },
  
  { id: 1010, acronym: 'AT', fullName: 'Agahnim Tower' },
  // Dark World Dungeons (in progression order)
  { id: 1011, acronym: 'PD', fullName: 'Palace of Darkness' },
  { id: 1012, acronym: 'SP', fullName: 'Swamp Palace' },
  
  // Skull Woods Sections
  { id: 1013, acronym: 'SW', fullName: 'Skull Woods' },
  { id: 1014, acronym: 'SB', fullName: 'Skull Woods - Back' },
  
  { id: 1015, acronym: 'TT', fullName: 'Thieves Town' },
  { id: 1016, acronym: 'IP', fullName: 'Ice Palace' },
  { id: 1017, acronym: 'MM', fullName: 'Misery Mire' },
  
  // Turtle Rock Sections
  { id: 1018, acronym: 'TR', fullName: 'Turtle Rock' },
  { id: 1019, acronym: 'TC', fullName: 'Turtle Rock - Compass' },
  { id: 1020, acronym: 'TB', fullName: 'Turtle Rock - Big Chest' },
  { id: 1021, acronym: 'TL', fullName: 'Turtle Rock - Laser Bridge' },
  
  { id: 1022, acronym: 'GT', fullName: 'Ganons Tower' }
];

// Normalized connector data with numeric IDs (starting from 2001)
export const connectorData = [
  // Old Lady House (Kakariko)
  { id: 2001, name: 'Old Lady Right', number: 1 },
  { id: 2002, name: 'Old Lady Left', number: 1 },
  
  // 2 Brothers (Race House)
  { id: 2003, name: '2 Brothers Right', number: 2 },
  { id: 2004, name: '2 Brothers Left', number: 2 },
  
  // Old Man Cave (Death Mountain)
  { id: 2005, name: 'Old Man Cave', number: 3 },
  { id: 2006, name: 'Old Man Cave Back', number: 3 },
  
  // Paradox Cave (Eastern Death Mountain)
  { id: 2007, name: 'Paradox Cave Upper', number: 4 },
  { id: 2008, name: 'Paradox Cave Middle', number: 4 },
  { id: 2009, name: 'Paradox Cave Lower', number: 4 },
  
  // EDM Cave System
  { id: 2010, name: 'EDM Cave Entrance', number: 5 },
  { id: 2011, name: 'EDM Cave Exit', number: 5 },
  
  // Spiral Cave
  { id: 2012, name: 'Spiral Cave', number: 6 },
  { id: 2013, name: 'Spiral Cave Bottom', number: 6 },
  
  // Bumper Cave (Dark World)
  { id: 2014, name: 'Mountain Climb', number: 7 },
  { id: 2015, name: 'Mountain Descent', number: 7 },
  
  // Superbunny Cave System (Dark World)
  { id: 2016, name: 'Superbunny Lower', number: 8 },
  { id: 2017, name: 'Superbunny Upper', number: 8 },
  
  // Hookshot/Floating Island System (Dark World)
  { id: 2018, name: 'Hookshot Cave', number: 9 },
  { id: 2019, name: 'Floating Island', number: 9 },
  // Hookshot/Floating Island System (Dark World)
  { id: 2020, name: 'Spectacle Rock Upper', number: 10 },
  { id: 2021, name: 'Spectacle Rock Lower', number: 10 },
  { id: 2022, name: 'Spectacle Rock Side', number: 10 },
  // Hookshot/Floating Island System (Dark World)
  { id: 2023, name: 'Old Man Rescue Entrance', number: 11 },
  { id: 2024, name: 'Old Man Rescue Exit', number: 11 },
//Bumper cave
  { id: 2025, name: 'Bumper Cave Entrance', number: 12 },
  { id: 2026, name: 'Bumper Cave Exit', number: 12 }
];

// Normalized useful location data
export const usefulLocationData = [
  // Chest location - special case with ID 4001
  { id: 4001, type: 'chests', display: 'C', name: 'Chests (1-5)' },
  
  // Non-chest useful locations with numeric IDs
  { id: 3001, type: 'special', value: 'MC', display: 'MC', name: 'Mimic Cave' },
  { id: 3002, type: 'special', value: 'D', display: 'D', name: 'Dam' },  
  { id: 3003, type: 'special', value: 'LH', display: 'LH', name: 'Link\'s House' },
  { id: 3004, type: 'special', value: 'DS', display: 'DS', name: 'Dark Sanctuary' },  
  { id: 3005, type: 'special', value: 'WH', display: 'WH', name: 'Witch\'s Hut' },
  { id: 3006, type: 'special', value: 'SK', display: 'SK', name: 'Sick Kid' },
  { id: 3007, type: 'special', value: 'SM', display: 'SM', name: 'Smith\'s' },
  { id: 3008, type: 'special', value: 'MB', display: 'MB', name: 'Magic Bat' },
  { id: 3009, type: 'special', value: 'GD', display: 'GD', name: 'Ganon\'s Drop' },
  { id: 3010, type: 'special', value: 'SC', display: 'SC', name: 'Spike Cave' },
  { id: 3011, type: 'special', value: 'SC', display: 'CH', name: 'Chicken Hut' },
  { id: 3012, type: 'special', value: 'SC', display: 'SH', name: 'Sahasrala' },
  { id: 3013, type: 'special', value: 'BS', display: 'BS', name: 'Bomb Shop' },
  { id: 3014, type: 'special', value: 'DS', display: 'DS', name: 'Sanctuary' },
  { id: 3098, type: 'special', value: 'S3', display: 'S3', name: 'Shop' },
  { id: 3099, type: 'special', value: 'DR', display: 'DR', name: 'Dark Room' },
  
  
  // Useless location - special case with ID 5001
  { id: 5001, type: 'useless', display: '', name: 'Useless Location' }
];

// Static locations - checks that are always in the same place (IDs 6001-6999)
export const staticLocationData = [
  { id: 6001, display: 'MS', name: 'Mushroom' },
  { id: 6002, display: 'BV', name: 'Bottle Vendor' },
  { id: 6003, display: 'HB', name: 'Hobo' },
  { id: 6004, display: 'LI', name: 'Lake Hylia Island' },
  { id: 6005, display: 'KZ', name: 'King Zora' },
  { id: 6006, display: 'PC', name: 'Purple Chest' },
  { id: 6007, display: 'MP', name: 'Master Sword Pedestal' },
  { id: 6008, display: 'BT', name: 'Bombos Tablet' },
  { id: 6009, display: 'ET', name: 'Ether Tablet' },
  { id: 6014, display: 'DL', name: 'Desert Ledge' },
  { id: 6022, display: 'FL', name: 'Flute Spot' },
  { id: 6023, display: 'MR', name: 'Maze Race' },
  { id: 6030, display: 'CF', name: 'Catfish' },
  { id: 6031, display: 'PY', name: 'Pyramid' },
  { id: 6032, display: 'DG', name: 'Digging Game' },
  { id: 6033, display: 'ST', name: 'Stumpy' }
];
// Helper functions to get data by ID
export const getDungeonById = (id) => dungeonData.find(d => d.id === id);
export const getConnectorById = (id) => connectorData.find(c => c.id === id);
export const getUsefulLocationById = (id) => usefulLocationData.find(u => u.id === id);
export const getStaticLocationById = (id) => staticLocationData.find(s => s.id === id);

// Keep the old export for backward compatibility
export const dungeonAcronyms = dungeonData.map(d => d.acronym);
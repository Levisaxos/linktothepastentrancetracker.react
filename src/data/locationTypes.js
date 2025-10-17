// src/data/locationTypes.js
import { Package, Link, Castle, X } from 'lucide-react';

export const locationTypes = {
  useful: { name: 'Useful', icon: Package, color: 'bg-green-600', prefix: 'C' },
  connector: { name: 'Connector', icon: Link, color: 'bg-yellow-600', prefix: '#' },
  dungeon: { name: 'Dungeon', icon: Castle, color: 'bg-purple-600', prefix: '' },
  dungeonCompleted: { name: 'Dungeon Completed', icon: Castle, color: 'bg-red-900', prefix: '' },
  useless: { name: 'Useless', icon: X, color: 'bg-red-900', prefix: '' }
};

// Normalized dungeon data with numeric IDs
// Add groupId to dungeons and include checks
export const dungeonData = [
  // Hyrule Castle Sections (group 1)
  { id: 1001, acronym: 'HM', fullName: 'Hyrule Castle - Main', groupId: 1 },
  { id: 1002, acronym: 'HL', fullName: 'Hyrule Castle - Left', groupId: 1 },
  { id: 1003, acronym: 'HR', fullName: 'Hyrule Castle - Right', groupId: 1 },
  
  { id: 1045, acronym: 'EP', fullName: 'Eastern Palace', groupId: 2 },
  
  // Desert Palace Sections (group 3)
  { id: 1005, acronym: 'DM', fullName: 'Desert Palace - Main', groupId: 3 },
  { id: 1006, acronym: 'DL', fullName: 'Desert Palace - Left', groupId: 3 },
  { id: 1007, acronym: 'DR', fullName: 'Desert Palace - Right', groupId: 3 },
  { id: 1008, acronym: 'DB', fullName: 'Desert Palace - Back', groupId: 3 },
  
  { id: 1009, acronym: 'TH', fullName: 'Tower of Hera', groupId: 4 },
  { id: 1010, acronym: 'AT', fullName: 'Agahnim Tower', groupId: 5 },
  { id: 1011, acronym: 'PD', fullName: 'Palace of Darkness', groupId: 6 },
  { id: 1012, acronym: 'SP', fullName: 'Swamp Palace', groupId: 7 },
  
  // Skull Woods Sections (group 8)
  { id: 1013, acronym: 'SW', fullName: 'Skull Woods', groupId: 8 },
  { id: 1014, acronym: 'SB', fullName: 'Skull Woods - Back', groupId: 8 },
  
  { id: 1015, acronym: 'TT', fullName: 'Thieves Town', groupId: 9 },
  { id: 1016, acronym: 'IP', fullName: 'Ice Palace', groupId: 10 },
  { id: 1017, acronym: 'MM', fullName: 'Misery Mire', groupId: 11 },
  
  // Turtle Rock Sections (group 12)
  { id: 1018, acronym: 'TR', fullName: 'Turtle Rock', groupId: 12 },
  { id: 1019, acronym: 'TC', fullName: 'Turtle Rock - Compass', groupId: 12 },
  { id: 1020, acronym: 'TB', fullName: 'Turtle Rock - Big Chest', groupId: 12 },
  { id: 1021, acronym: 'TL', fullName: 'Turtle Rock - Laser Bridge', groupId: 12 },
  
  { id: 1022, acronym: 'GT', fullName: 'Ganons Tower', groupId: 13 }
];

// Define dungeon group checks (shared across all entrances of the same dungeon)
export const dungeonGroupChecks = {
  1: ['Map Chest', 'Boomerang Chest', 'Zelda\'s Cell'], // Hyrule Castle
  2: ['Compass Chest', 'Big Chest', 'Big Key Chest', 'Map Chest', 'Cannonball Chest', 'Boss'], // Eastern Palace
  3: ['Map Chest', 'Big Chest', 'Torch', 'Big Key Chest', 'Compass Chest', 'Boss'], // Desert Palace
  4: ['Basement Cage', 'Map Chest', 'Big Key Chest', 'Compass Chest', 'Big Chest', 'Boss'], // Tower of Hera
  5: ['Agahnim'], // Agahnim Tower
  6: ['Shooter Room', 'Big Key Chest', 'The Arena - Bridge', 'Stalfos Basement', 'The Arena - Ledge', 'Map Chest', 'Compass Chest', 'Harmless Hellway', 'Dark Basement - Left', 'Dark Basement - Right', 'Dark Maze - Top', 'Dark Maze - Bottom', 'Big Chest', 'Boss'], // Palace of Darkness
  7: ['Entrance', 'Map Chest', 'Big Chest', 'Compass Chest', 'Big Key Chest', 'West Chest', 'Flooded Room - Left', 'Flooded Room - Right', 'Waterfall Room', 'Boss'], // Swamp Palace
  8: ['Compass Chest', 'Map Chest', 'Bridge Room', 'Pot Prison', 'Pinball Room', 'Big Chest', 'Big Key Chest', 'Boss'], // Skull Woods
  9: ['Map Chest', 'Ambush Chest', 'Compass Chest', 'Big Key Chest', 'Attic', 'Blind\'s Cell', 'Big Chest', 'Boss'], // Thieves Town
  10: ['Compass Chest', 'Spike Room', 'Map Chest', 'Big Key Chest', 'Iced T Room', 'Freezor Chest', 'Big Chest', 'Boss'], // Ice Palace
  11: ['Main Lobby', 'Big Chest', 'Compass Chest', 'Big Key Chest', 'Map Chest', 'Spike Chest', 'Boss'], // Misery Mire
  12: ['Compass Chest', 'Roller Room - Left', 'Roller Room - Right', 'Chain Chomps', 'Big Key Chest', 'Big Chest', 'Crystaroller Room', 'Laser Bridge - Top Left', 'Laser Bridge - Top Right', 'Laser Bridge - Bottom Left', 'Laser Bridge - Bottom Right', 'Boss'], // Turtle Rock
  13: ['Bob\'s Torch', 'DMs Room - Top Left', 'DMs Room - Top Right', 'DMs Room - Bottom Left', 'DMs Room - Bottom Right', 'Map Chest', 'Firesnake Room', 'Randomizer Room - Top Left', 'Randomizer Room - Top Right', 'Randomizer Room - Bottom Left', 'Randomizer Room - Bottom Right', 'Hope Room - Left', 'Hope Room - Right', 'Bob\'s Chest', 'Tile Room', 'Compass Room - Top Left', 'Compass Room - Top Right', 'Compass Room - Bottom Left', 'Compass Room - Bottom Right', 'Big Chest', 'Big Key Chest', 'Big Key Room - Left', 'Big Key Room - Right', 'Mini Helmasaur Room - Left', 'Mini Helmasaur Room - Right', 'Pre-Moldorm Chest', 'Moldorm Chest'] // Ganon's Tower
};

// Connector data with both number (for display) and groupId (for check grouping)
export const connectorData = [
  // Old Lady House (Kakariko) - Group 1
  { id: 2001, name: 'Old Lady Right', number: 1, groupId: 1 },
  { id: 2002, name: 'Old Lady Left', number: 1, groupId: 1 },
  
  // 2 Brothers (Race House) - Group 2
  { id: 2003, name: '2 Brothers Right', number: 2, groupId: 2 },
  { id: 2004, name: '2 Brothers Left', number: 2, groupId: 2 },
  
  // Old Man Cave (Death Mountain) - Group 3
  { id: 2005, name: 'Old Man Cave', number: 3, groupId: 3 },
  { id: 2006, name: 'Old Man Cave Back', number: 3, groupId: 3 },
  
  // Paradox Cave (Eastern Death Mountain) - Group 4
  { id: 2007, name: 'Paradox Cave Upper', number: 4, groupId: 4 },
  { id: 2008, name: 'Paradox Cave Middle', number: 4, groupId: 4 },
  { id: 2009, name: 'Paradox Cave Lower', number: 4, groupId: 4 },
  
  // EDM Cave System - Group 5
  { id: 2010, name: 'EDM Cave Entrance', number: 5, groupId: 5 },
  { id: 2011, name: 'EDM Cave Exit', number: 5, groupId: 5 },
  
  // Spiral Cave - Group 6
  { id: 2012, name: 'Spiral Cave', number: 6, groupId: 6 },
  { id: 2013, name: 'Spiral Cave Bottom', number: 6, groupId: 6 },
  
  // Mountain Climb - Group 7
  { id: 2014, name: 'Mountain Climb', number: 7, groupId: 7 },
  { id: 2015, name: 'Mountain Descent', number: 7, groupId: 7 },
  
  // Superbunny Cave System (Dark World) - Group 8
  { id: 2016, name: 'Superbunny Lower', number: 8, groupId: 8 },
  { id: 2017, name: 'Superbunny Upper', number: 8, groupId: 8 },
  
  // Hookshot/Floating Island System (Dark World) - Group 9
  { id: 2018, name: 'Hookshot Cave', number: 9, groupId: 9 },
  { id: 2019, name: 'Floating Island', number: 9, groupId: 9 },
  
  // Spectacle Rock - Group 10
  { id: 2020, name: 'Spectacle Rock Upper', number: 10, groupId: 10 },
  { id: 2021, name: 'Spectacle Rock Lower', number: 10, groupId: 10 },
  { id: 2022, name: 'Spectacle Rock Side', number: 10, groupId: 10 },
  
  // Old Man Rescue - Group 11
  { id: 2023, name: 'Old Man Rescue Entrance', number: 11, groupId: 11 },
  { id: 2024, name: 'Old Man Rescue Exit', number: 11, groupId: 11 },
  
  // Bumper Cave - Group 12
  { id: 2025, name: 'Bumper Cave Entrance', number: 12, groupId: 12 },
  { id: 2026, name: 'Bumper Cave Exit', number: 12, groupId: 12 }
];

// Define connector group checks (shared across all entrances of the same connector)
export const connectorGroupChecks = {
  4: ['Paradox Cave Upper - Left', 'Paradox Cave Upper - Right', 'Paradox Cave Middle - Left', 'Paradox Cave Middle - Right', 'Paradox Cave Lower - Left', 'Paradox Cave Lower - Middle', 'Paradox Cave Lower - Right'], // Paradox Cave (7 chests)
  8: ['Superbunny Lower - Left', 'Superbunny Lower - Right', 'Superbunny Upper - Left', 'Superbunny Upper - Right'], // Superbunny Cave
  9: ['Hookshot Cave - Top Right', 'Hookshot Cave - Top Left', 'Hookshot Cave - Bottom Right', 'Hookshot Cave - Bottom Left', 'Floating Island'] // Hookshot/Floating Island
};
// Normalized useful location data
export const usefulLocationData = [
  // Chest location - special case with ID 4001
  { id: 4001, type: 'chests', display: 'C', name: 'Chests (1-5)' },

  // Non-chest useful locations with numeric IDs
  { id: 3001, type: 'special', value: 'MC', display: 'MC', name: 'Mimic Cave', checks: ["Chest"] },
  { id: 3002, type: 'special', value: 'D', display: 'D', name: 'Dam', checks: ["Sunken Treasure"] },
  { id: 3003, type: 'special', value: 'LH', display: 'LH', name: 'Link\'s House', checks: ["Uncle's Sword"] },
  { id: 3004, type: 'special', value: 'DS', display: 'DS', name: 'Dark Sanctuary' },
  { id: 3005, type: 'special', value: 'WH', display: 'WH', name: 'Witch\'s Hut' },
  { id: 3006, type: 'special', value: 'SK', display: 'SK', name: 'Sick Kid', checks: ["Sick kid"] },
  { id: 3007, type: 'special', value: 'SM', display: 'SM', name: 'Smith\'s', checks: ["Tempered Sword"] },
  { id: 3008, type: 'special', value: 'MB', display: 'MB', name: 'Magic Bat', checks: ["Magic Bat"] },
  { id: 3009, type: 'special', value: 'GD', display: 'GD', name: 'Ganon\'s Drop' },
  { id: 3010, type: 'special', value: 'SC', display: 'SC', name: 'Spike Cave', checks: ["Spike Cave"] },
  { id: 3011, type: 'special', value: 'SC', display: 'CH', name: 'Chicken Hut', checks: ["Chicken Hut"] },
  { id: 3012, type: 'special', value: 'SC', display: 'SH', name: 'Sahasrala', checks: ["Left", "Middle", "Right", "Sahasrala"] },
  { id: 3013, type: 'special', value: 'BS', display: 'BS', name: 'Bomb Shop' },
  { id: 3098, type: 'special', value: 'S3', display: 'S3', name: 'Shop', checks: ["Left", "Middle", "Right"] },
  { id: 3099, type: 'special', value: 'DR', display: 'DR', name: 'Dark Room' },

  // Useless location - special case with ID 5001
  { id: 5001, type: 'useless', display: '', name: 'Useless Location' }
];

// Helper functions to get data by ID
export const getDungeonById = (id) => dungeonData.find(d => d.id === id);
export const getConnectorById = (id) => connectorData.find(c => c.id === id);
export const getUsefulLocationById = (id) => usefulLocationData.find(u => u.id === id);

// Keep the old export for backward compatibility
export const dungeonAcronyms = dungeonData.map(d => d.acronym);
// src/services/gameService.js
import { mapData } from '../data/mapData';

export const gameService = {
  createGame: (gameData) => {
    const newGame = {
      id: Date.now(),
      name: gameData.name,
      randomizerType: gameData.randomizerType,
      isInverted: gameData.isInverted,
      created: new Date().toISOString(),
      lastSaved: new Date().toISOString(),
      isFinished: false,
      finishedDate: null,
      locations: {},
      globalNotes: []
    };

    // Apply default locations based on randomizer type
    if (gameData.randomizerType === 'Vanilla') {
      newGame.locations = gameService.getDefaultLocations();
    } else if (gameData.randomizerType === 'Dungeons Simple') {
      newGame.locations = gameService.getDungeonsSimpleLocations();
    }

    return newGame;
  },

  getDefaultLocations: () => {
    const locations = {};
    
    // Process both light and dark world locations
    [...mapData.light, ...mapData.dark].forEach(location => {
      if (location.defaultType) {
        const locationData = {
          type: location.defaultType,
          value: location.defaultValue || 'X',
          isEditable: false // Vanilla games have all locations locked
        };

        // Add connector-specific data
        if (location.defaultType === 'connector') {
          locationData.number = location.defaultNumber;
          locationData.name = location.defaultName;
        }

        locations[location.id] = locationData;
      }
    });

    return locations;
  },

  getDungeonsSimpleLocations: () => {
    const locations = {};
    
    // Get all locations with their defaults
    [...mapData.light, ...mapData.dark].forEach(location => {
      if (location.defaultType) {
        const locationData = {
          type: location.defaultType,
          value: location.defaultValue || 'X',
          isEditable: location.defaultType === 'dungeon' // Only dungeons are editable in simple mode
        };

        // Add connector-specific data
        if (location.defaultType === 'connector') {
          locationData.number = location.defaultNumber;
          locationData.name = location.defaultName;
        }

        // For dungeons in simple mode, they should be editable but show as unassigned
        if (location.defaultType === 'dungeon') {
          // Don't add this location to the locations object initially
          // This will leave it as a ? button for manual assignment, but it will be editable
          return;
        }

        locations[location.id] = locationData;
      }
    });

    return locations;
  },

  updateGameLastSaved: (game) => ({
    ...game,
    lastSaved: new Date().toISOString()
  }),

  markGameFinished: (game) => ({
    ...game,
    isFinished: true,
    finishedDate: new Date().toISOString()
  }),

  markGameActive: (game) => ({
    ...game,
    isFinished: false,
    finishedDate: null
  }),

  getProgressStats: (game, totalLocations = 147) => {
    const markedLocations = Object.keys(game.locations || {}).length;
    const usefulLocations = Object.values(game.locations || {}).filter(loc => loc.type === 'useful').length;
    const connectorLocations = Object.values(game.locations || {}).filter(loc => loc.type === 'connector').length;
    const dungeonLocations = Object.values(game.locations || {}).filter(loc => loc.type === 'dungeon').length;
    const uselessLocations = Object.values(game.locations || {}).filter(loc => loc.type === 'useless').length;
    
    return {
      total: totalLocations,
      marked: markedLocations,
      unmarked: totalLocations - markedLocations,
      useful: usefulLocations,
      connector: connectorLocations,
      dungeon: dungeonLocations,
      useless: uselessLocations,
      percentageComplete: Math.round((markedLocations / totalLocations) * 100)
    };
  },

  sortGames: (games, showFinished = false) => {
    const filteredGames = games.filter(game => game.isFinished === showFinished);
    
    if (showFinished) {
      // Sort finished games by finished date (most recent first)
      return filteredGames.sort((a, b) => 
        new Date(b.finishedDate || 0) - new Date(a.finishedDate || 0)
      );
    } else {
      // Sort active games by last saved date (most recent first)
      return filteredGames.sort((a, b) => 
        new Date(b.lastSaved || 0) - new Date(a.lastSaved || 0)
      );
    }
  },

  loadGames: () => {
    try {
      const saved = localStorage.getItem('zelda_tracker_games');
      const games = saved ? JSON.parse(saved) : [];
      
      // Migrate old games without finished status, notes, and isEditable properties
      return games.map(game => ({
        isFinished: false,
        finishedDate: null,
        notes: '',
        locationNotes: {},
        globalNotes: [],
        ...game,
        // Migrate locations to add isEditable property if missing
        locations: game.locations ? Object.fromEntries(
          Object.entries(game.locations).map(([locationId, locationData]) => [
            locationId,
            {
              isEditable: true, // Default to editable for existing games
              ...locationData
            }
          ])
        ) : {}
      }));
    } catch (error) {
      console.error('Error loading games:', error);
      return [];
    }
  },

  saveGames: (games) => {
    try {
      localStorage.setItem('zelda_tracker_games', JSON.stringify(games));
    } catch (error) {
      console.error('Error saving games:', error);
    }
  },

  getLastExported: () => {
    try {
      return localStorage.getItem('zelda_tracker_last_export');
    } catch (error) {
      return null;
    }
  },

  setLastExported: () => {
    try {
      localStorage.setItem('zelda_tracker_last_export', new Date().toISOString());
    } catch (error) {
      console.error('Error saving export date:', error);
    }
  }
};
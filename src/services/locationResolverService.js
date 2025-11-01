// src/services/locationResolverService.js
import { getChecksByLocationId } from '../data/checkData';
import {
  dungeonData,
  connectorData,
  usefulLocationData,
  getDungeonById,
  getConnectorById,
  getUsefulLocationById,
  staticLocationData,
  getStaticLocationById
} from '../data/locationTypes';

export const locationResolverService = {
  /**
   * Resolves location data by ID
   * @param {number} locationId - The location ID
   * @param {boolean} completed - Whether the location is completed (for dungeons)
   * @param {number} chestCount - The chest count (only used for chest locations)
   * @returns {Object} - Resolved location data
   */
  resolveLocationById(locationId, completed = false) {
    if (!locationId) return null;  

    // Special case for useless location (ID 5001)
    if (locationId === 5001) {
      return {
        type: 'useless',
        displayValue: '',
        description: 'Useless Location'
      };
    }

    // Check if it's a dungeon (IDs 1001-1099)
    if (locationId >= 1001 && locationId <= 1099) {
      const dungeon = getDungeonById(locationId);
      if (dungeon) {
        return {
          type: completed ? 'dungeonCompleted' : 'dungeon',
          acronym: dungeon.acronym,
          fullName: dungeon.fullName,
          completed: completed
        };
      }
    }

    // Check if it's a connector (IDs 2001-2999)
    if (locationId >= 2001 && locationId <= 2999) {
      const connector = getConnectorById(locationId);
      if (connector) {
        return {
          type: 'connector',
          name: connector.name,
          number: connector.number
        };
      }
    }

    // Check if it's a special useful location (IDs 3001-3999)
    if (locationId >= 3001 && locationId <= 3999) {
      const usefulLocation = getUsefulLocationById(locationId);
      if (usefulLocation) {
        return {
          type: 'location',
          displayValue: usefulLocation.display,
          description: usefulLocation.name
        };
      }
    }

    // Check if it's a static location (IDs 6001-6999)
    if (locationId >= 6001 && locationId <= 6999) {
      const staticLocation = getStaticLocationById(locationId);
      if (staticLocation) {
        return {
          type: 'static',
          displayValue: staticLocation.display,
          description: staticLocation.name
        };
      }
    }

    return null;
  },

  /**
   * Gets available dungeons that aren't already used
   * @param {Object} currentGame - The current game object
   * @param {string} excludeLocationId - Location ID to exclude from the check
   * @param {string} locationWorld - 'light' or 'dark' for world restrictions
   * @returns {Array} - Available dungeon objects
   */
  getAvailableDungeons(currentGame, excludeLocationId = null, locationWorld = null) {
    const usedDungeonIds = this.getUsedLocationIds(currentGame, excludeLocationId).dungeons;

    let availableDungeons = dungeonData.filter(dungeon =>
      !usedDungeonIds.includes(dungeon.id)
    );

    // For Dungeons Simple mode, filter by world
    if (currentGame?.randomizerType === 'Dungeons Simple' && locationWorld) {
      if (locationWorld === 'light') {
        // Light world dungeons: Hyrule Castle sections, Eastern Palace, Desert Palace, Tower of Hera
        const lightWorldDungeonIds = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010]; // HM, HL, HR, AT, EP, DM, DL, DR, DB, TH
        availableDungeons = availableDungeons.filter(dungeon =>
          lightWorldDungeonIds.includes(dungeon.id)
        );
      } else {
        // Dark world dungeons: everything else
        const lightWorldDungeonIds = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010];
        availableDungeons = availableDungeons.filter(dungeon =>
          !lightWorldDungeonIds.includes(dungeon.id)
        );
      }
    }

    return availableDungeons;
  },

  /**
   * Gets available connectors that aren't already used
   * @param {Object} currentGame - The current game object
   * @param {string} excludeLocationId - Location ID to exclude from the check
   * @returns {Array} - Available connector objects
   */
  getAvailableConnectors(currentGame, excludeLocationId = null) {
    const usedConnectorIds = this.getUsedLocationIds(currentGame, excludeLocationId).connectors;
    return connectorData.filter(connector =>
      !usedConnectorIds.includes(connector.id)
    );
  },

  /**
   * Gets available special useful locations that aren't already used
   * @param {Object} currentGame - The current game object
   * @param {string} excludeLocationId - Location ID to exclude from the check
   * @returns {Array} - Available special useful location objects
   */
  getAvailableSpecialLocations(currentGame, excludeLocationId = null) {
    const usedSpecialIds = this.getUsedLocationIds(currentGame, excludeLocationId).specialUseful;
    return usefulLocationData
      .filter(loc => loc.type === 'special')
      .filter(loc => !usedSpecialIds.includes(loc.id) || loc.id === 3098 || loc.id === 3099);
  },

  /**
   * Checks if location IDs are already used in the current game
   * @param {Object} currentGame - The current game object
   * @param {string} excludeLocationId - Location ID to exclude from the check (for editing)
   * @returns {Object} - { dungeons: [], connectors: [], specialUseful: [] }
   */
  getUsedLocationIds(currentGame, excludeLocationId = null) {
    if (!currentGame?.locations) {
      return { dungeons: [], connectors: [], specialUseful: [], staticLocations: [] };
    }

    const usedDungeons = [];
    const usedConnectors = [];
    const usedSpecialUseful = [];
    const usedStaticLocations = [];

    Object.entries(currentGame.locations).forEach(([locId, locData]) => {
      // Skip the excluded location (when editing)
      if (locId === excludeLocationId) return;

      if (!locData.locationId) return;

      const locationId = locData.locationId;

      // Dungeons (1001-1099)
      if (locationId >= 1001 && locationId <= 1099) {
        usedDungeons.push(locationId);
      }
      // Connectors (2001-2999)  
      else if (locationId >= 2001 && locationId <= 2999) {
        usedConnectors.push(locationId);
      }
      // Special useful locations (3001-3999)
      else if (locationId >= 3001 && locationId <= 3999) {
        usedSpecialUseful.push(locationId);
      }
      // Static locations (6001-6999)
      else if (locationId >= 6001 && locationId <= 6999) {
        usedStaticLocations.push(locationId);
      }
    });

    return {
      dungeons: usedDungeons,
      connectors: usedConnectors,
      specialUseful: usedSpecialUseful,
      staticLocations: usedStaticLocations
    };
  },
  /**
     * Gets available static locations that aren't already used
     * @param {Object} currentGame - The current game object
     * @param {string} excludeLocationId - Location ID to exclude from the check
     * @returns {Array} - Available static location objects
     */
  getAvailableStaticLocations(currentGame, excludeLocationId = null) {
    const usedStaticIds = this.getUsedLocationIds(currentGame, excludeLocationId).staticLocations;
    return staticLocationData.filter(loc => !usedStaticIds.includes(loc.id));
  },

  /**
   * Gets checks for a location based on its ID
   * @param {number} locationId - The location ID
   * @returns {Array} - Array of check objects
   */
  getLocationChecks(locationId) {
    if (!locationId) {
      return [];
    }

    // Import and use the helper function from checkData
    return getChecksByLocationId(locationId);
  },

  /**
   * Gets the group identifier for check storage
   * @param {number} locationId - The location ID
   * @returns {string|null} - Group key for storing checks
   */
  getLocationGroupKey(locationId) {
    if (!locationId) return null;

    // For dungeons, use the groupId
    if (locationId >= 1001 && locationId <= 1099) {
      const dungeon = getDungeonById(locationId);
      return dungeon?.groupId ? `dungeon_${dungeon.groupId}` : null;
    }

    // For connectors, use the groupId
    if (locationId >= 2001 && locationId <= 2999) {
      const connector = getConnectorById(locationId);
      return connector?.groupId ? `connector_${connector.groupId}` : null;
    }

    // For special locations, use the locationId directly
    if (locationId >= 3001 && locationId <= 3999) {
      return `location_${locationId}`;
    }

    return null;
  }
};
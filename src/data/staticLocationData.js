// src/data/staticLocationData.js

export const staticLocationSets = {
    // True surface checks — overworld items that never shuffle. Always present at
    // their fixed map node, toggled off when collected, shown in cyan.
    ALWAYS: [
        { mapLocationId: 18, locationTypeId: 4004 },
        { mapLocationId: 1, locationTypeId: 6007 },  // Master Sword Pedestal
        { mapLocationId: 2, locationTypeId: 6001 },  // Mushroom
        { mapLocationId: 3, locationTypeId: 6002 },  // Bottle Merchant
        { mapLocationId: 16, locationTypeId: 6006 }, // Purple Chest
        { mapLocationId: 9, locationTypeId: 6005 },  // King Zora
        { mapLocationId: 7, locationTypeId: 6003 },  // Hobo
        { mapLocationId: 11, locationTypeId: 6008 }, // Bombos Tablet
        { mapLocationId: 12, locationTypeId: 6009 }, // Ether Tablet
        { mapLocationId: 15, locationTypeId: 6022 }, // Flute Spot (Grove Digging Spot)
        { mapLocationId: 8, locationTypeId: 6004 },  // Lake Hylia Island
        { mapLocationId: 6, locationTypeId: 6034 },  // Sunken Treasure (Dam Exterior)
        { mapLocationId: 5, locationTypeId: 6023 },  // Maze Race
        { mapLocationId: 10, locationTypeId: 6014 }, // Desert Ledge
        { mapLocationId: 97, locationTypeId: 6030 }, // Catfish
        { mapLocationId: 96, locationTypeId: 6031 }, // Pyramid
        { mapLocationId: 100, locationTypeId: 6032 }, // Digging Game
        { mapLocationId: 98, locationTypeId: 6033 }, // Stumpy (Haunted Grove)
        { mapLocationId: 99, locationTypeId: 6035 }, // DW Blacksmith / Frog (Dwarven Smiths)
        { mapLocationId: 14, locationTypeId: 6036 }, // Spectacle Rock (Top of Spectacle Rock)
    ],
    VANILLA: [],
    DUNGEONS_SIMPLE: [],
    DUNGEONS_FULL: [],
    DUNGEONS_CROSSED: [],
    SIMPLE: [],
    RESTRICTED: [],
    FULL: [],
    CROSSED: []
};

/**
 * Get static locations for a specific randomizer type
 * @param {string} randomizerType - The randomizer type from the game
 * @returns {Array} - Array of static location mappings
 */
export const getStaticLocationsForRandomizer = (randomizerType) => {
    const alwaysStatic = staticLocationSets.ALWAYS || [];
    const randomizerSet = staticLocationSets[randomizerType.toUpperCase().replace(' ', '_')] || [];
    return [...alwaysStatic, ...randomizerSet];
};

/**
 * Check if a map location should be static for a given randomizer type
 * @param {string} mapLocationId - The map location ID
 * @param {string} randomizerType - The randomizer type
 * @returns {Object|null} - The static location data if it exists, null otherwise
 */
export const getStaticLocationData = (mapLocationId, randomizerType) => {
    const staticLocations = getStaticLocationsForRandomizer(randomizerType);
    return staticLocations.find(loc => loc.mapLocationId === mapLocationId) || null;
};

/**
 * Check if a specific map location is static (locked)
 * @param {string} mapLocationId - The map location ID
 * @param {string} randomizerType - The randomizer type
 * @returns {boolean} - True if the location is static/locked
 */
export const isLocationStatic = (mapLocationId, randomizerType) => {
    return getStaticLocationData(mapLocationId, randomizerType) !== null;
};

/**
 * Check if a location is marked as useless but is actually a static location
 * @param {string} mapLocationId - The map location ID
 * @param {Object} locationData - The current location data from game.locations
 * @param {string} randomizerType - The randomizer type
 * @returns {boolean} - True if this is a static location marked as useless
 */
export const isStaticMarkedUseless = (mapLocationId, locationData, randomizerType) => {
    if (!locationData || locationData.locationId !== 5001) return false;
    return isLocationStatic(mapLocationId, randomizerType);
};

/**
 * Restore a static location to its original state
 * @param {string} mapLocationId - The map location ID
 * @param {string} randomizerType - The randomizer type
 * @returns {Object|null} - The original static location data, or null if not static
 */
export const restoreStaticLocation = (mapLocationId, randomizerType) => {
    const staticData = getStaticLocationData(mapLocationId, randomizerType);

    if (!staticData) return null;

    return {
        locationId: staticData.locationTypeId,
        completed: false,
        isEditable: false,
        isStatic: true
        
    };
};

/**
 * Apply static locations to a game's location data
 * Used when creating a new game or changing randomizer settings
 * @param {Object} game - The game object
 * @returns {Object} - Updated locations object with static locations applied
 */
export const applyStaticLocations = (game) => {
    const staticLocations = getStaticLocationsForRandomizer(game.randomizerType);
    const locations = { ...game.locations };

    staticLocations.forEach(staticLoc => {
        const existingLocation = locations[staticLoc.mapLocationId];

        // Only apply if location doesn't exist or if it exists but needs the static flag
        if (!existingLocation) {
            locations[staticLoc.mapLocationId] = {
                locationId: staticLoc.locationTypeId,
                completed: false,
                isEditable: false,
                isStatic: true,
                markedUseless: false,
                chestCount: staticLoc.chestCount || 1
            };
        } else {
            // Preserve existing location but ensure it has the static flag
            locations[staticLoc.mapLocationId] = {
                ...existingLocation,
                isStatic: true
            };
        }
    });

    return locations;
};
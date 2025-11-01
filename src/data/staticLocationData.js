// src/data/staticLocationData.js

export const staticLocationSets = {
    ALWAYS: [
        { mapLocationId: '1', locationTypeId: 3014 },
        { mapLocationId: '18', locationTypeId: 4004},
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
        isStatic: true,
        chestCount: staticData.chestCount || 1
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
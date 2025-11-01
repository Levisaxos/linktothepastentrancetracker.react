// src/components/LocationModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { locationTypes } from '../data/locationTypes';
import { locationResolverService } from '../services/locationResolverService';
import { mapData } from '../data/mapData';
import SelectDropdown from './SelectDropdown';

const LocationModal = ({ location, locationData, currentGame, onClose, onSave }) => {
  const [selectedType, setSelectedType] = useState('location');
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  // Determine which world this location is in
  const getLocationWorld = () => {
    const lightWorldLocation = mapData.light.find(loc => loc.id === location.id);
    return lightWorldLocation ? 'light' : 'dark';
  };

  const locationWorld = getLocationWorld();

  // Get available options based on current game state - MEMOIZED
  const availableDungeons = useMemo(() =>
    locationResolverService.getAvailableDungeons(currentGame, location.id, locationWorld),
    [currentGame?.locations, location.id, locationWorld]
  );

  const availableConnectors = useMemo(() =>
    locationResolverService.getAvailableConnectors(currentGame, location.id),
    [currentGame?.locations, location.id]
  );

  const availableSpecialLocations = useMemo(() =>
    locationResolverService.getAvailableSpecialLocations(currentGame, location.id),
    [currentGame?.locations, location.id]
  );
  // Get available location types based on randomizer mode
  const getAvailableLocationTypes = () => {
    const { static: _, dungeonCompleted: __, ...allTypes } = locationTypes;
    const { dungeonCompleted, ...selectableTypes } = allTypes;

    // For Dungeons Simple mode, only allow certain types
    if (currentGame?.randomizerType === 'Dungeons Simple') {
      const mapLocation = [...mapData.light, ...mapData.dark].find(loc => loc.id === location.id);
      if (mapLocation?.defaultLocationId && mapLocation.defaultLocationId >= 1 && mapLocation.defaultLocationId <= 99) {
        // This is a dungeon location by default, only allow dungeon type
        return { dungeon: selectableTypes.dungeon };
      } else {
        // For non-dungeon locations, don't allow dungeon type
        const { dungeon, ...otherTypes } = selectableTypes;
        return otherTypes;
      }
    }

    return selectableTypes;
  };

  const availableLocationTypes = getAvailableLocationTypes();

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (locationData) {
      if (locationData.locationId) {
        const resolvedData = locationResolverService.resolveLocationById(locationData.locationId, locationData.completed);

        if (resolvedData) {
          setSelectedType(resolvedData.type === 'dungeonCompleted' ? 'dungeon' : resolvedData.type);
          setSelectedLocationId(locationData.locationId);
        }
      }
    } else {
      // No existing data - set defaults
      const availableTypes = Object.keys(availableLocationTypes);
      if (availableTypes.length === 1) {
        setSelectedType(availableTypes[0]);
      }

      // Set initial selectedLocationId based on type
      if (selectedType === 'dungeon' && availableDungeons.length > 0) {
        setSelectedLocationId(availableDungeons[0].id);
      } else if (selectedType === 'connector' && availableConnectors.length > 0) {
        setSelectedLocationId(availableConnectors[0].id);
      } else if (selectedType === 'location' && availableSpecialLocations.length > 0) {
        setSelectedLocationId(availableSpecialLocations[0].id);
      }
    }
  }, []); // Only run once when modal opens

  // Handle type change - reset selectedLocationId when type changes
  const handleTypeChange = (newType) => {
    setSelectedType(newType);

    // Set appropriate default locationId for the new type
    if (newType === 'dungeon' && availableDungeons.length > 0) {
      setSelectedLocationId(availableDungeons[0].id);
    } else if (newType === 'connector' && availableConnectors.length > 0) {
      setSelectedLocationId(availableConnectors[0].id);
    } else if (newType === 'location' && availableSpecialLocations.length > 0) {
      setSelectedLocationId(availableSpecialLocations[0].id);
    } else {
      setSelectedLocationId(null);
    }
  };

  const handleSave = () => {
    if (selectedType === 'useless') {
      // For useless locations - use special ID 5001
      onSave(5001, false);
    } else if (selectedLocationId) {
      // For other ID-based locations
      onSave(selectedLocationId, false);
    }
  };

  const handleReset = () => {
    onSave('reset');
  };

  const renderValueInput = () => {
    switch (selectedType) {
      case 'location':
        return (
          <div>
            <SelectDropdown
              value={selectedLocationId || ''}
              onChange={(id) => setSelectedLocationId(parseInt(id, 10))}
              options={availableSpecialLocations.map(loc => ({
                value: loc.id,
                label: loc.name
              }))}
              emptyMessage="All special locations are already assigned to other locations."
            />
          </div>
        );
      case 'connector':
        return (
          <div>
            <SelectDropdown
              value={selectedLocationId || ''}
              onChange={(id) => setSelectedLocationId(parseInt(id, 10))}
              options={availableConnectors.map(connector => ({
                value: connector.id,
                label: connector.name
              }))}
              emptyMessage="All connectors are already assigned to other locations."
            />
          </div>
        );
      case 'dungeon':
        return (
          <div>
            <SelectDropdown
              value={selectedLocationId || ''}
              onChange={(id) => setSelectedLocationId(parseInt(id, 10))}
              options={availableDungeons.map(dungeon => ({
                value: dungeon.id,
                label: dungeon.fullName
              }))}
              emptyMessage="All dungeons are already assigned to other locations."
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Check if save should be disabled
  const isSaveDisabled = () => {
    if (selectedType === 'dungeon' && availableDungeons.length === 0) return true;
    if (selectedType === 'connector' && availableConnectors.length === 0) return true;
    if (selectedType === 'location' && availableSpecialLocations.length === 0) return true;
    if (selectedType === 'useless') return false; // Useless is always available
    return !selectedLocationId;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{location.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(availableLocationTypes).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  className={`p-3 rounded border text-left ${selectedType === key
                    ? `${type.color} border-white`
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}
                >
                  <div className="font-medium">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedType !== 'useless' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {selectedType === 'location' ? 'Specific Location' :
                  selectedType === 'connector' ? 'Connector' :
                    'Dungeon'}
              </label>
              {renderValueInput()}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaveDisabled()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
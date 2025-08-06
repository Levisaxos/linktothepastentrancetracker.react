// src/components/LocationModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { locationTypes } from '../data/locationTypes';
import { locationResolverService } from '../services/locationResolverService';
import { mapData } from '../data/mapData';
import SelectDropdown from './SelectDropdown';

const LocationModal = ({ location, locationData, currentGame, onClose, onSave }) => {
  const [selectedType, setSelectedType] = useState('useful');
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedUsefulType, setSelectedUsefulType] = useState('chests');
  const [selectedChestCount, setSelectedChestCount] = useState('1');

  // Determine which world this location is in
  const getLocationWorld = () => {
    const lightWorldLocation = mapData.light.find(loc => loc.id === location.id);
    return lightWorldLocation ? 'light' : 'dark';
  };

  const locationWorld = getLocationWorld();

  // Get available options based on current game state
  const availableDungeons = locationResolverService.getAvailableDungeons(currentGame, location.id, locationWorld);
  const availableConnectors = locationResolverService.getAvailableConnectors(currentGame, location.id);
  const availableSpecialLocations = locationResolverService.getAvailableSpecialLocations(currentGame, location.id);

  // Get available location types based on randomizer mode
  const getAvailableLocationTypes = () => {
    const allTypes = locationTypes;
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
        // Special case for chest location (ID 4001)
        if (locationData.locationId === 4001) {
          setSelectedType('useful');
          setSelectedUsefulType('chests');
          setSelectedLocationId(4001);
          setSelectedChestCount((locationData.chestCount || 1).toString());
        } else {
          // ID-based location
          const resolvedData = locationResolverService.resolveLocationById(locationData.locationId, locationData.completed);
          
          if (resolvedData) {
            setSelectedType(resolvedData.type === 'dungeonCompleted' ? 'dungeon' : resolvedData.type);
            setSelectedLocationId(locationData.locationId);
            
            if (resolvedData.type === 'useful') {
              setSelectedUsefulType('special');
            }
          }
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
      } else if (selectedType === 'useful' && selectedUsefulType === 'special' && availableSpecialLocations.length > 0) {
        setSelectedLocationId(availableSpecialLocations[0].id);
      } else if (selectedType === 'useful' && selectedUsefulType === 'chests') {
        setSelectedLocationId(4001);
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
    } else if (newType === 'useful') {
      if (selectedUsefulType === 'special' && availableSpecialLocations.length > 0) {
        setSelectedLocationId(availableSpecialLocations[0].id);
      }
      // For chests, no locationId needed
    } else {
      setSelectedLocationId(null);
    }
  };

  // Handle useful type change
  const handleUsefulTypeChange = (newUsefulType) => {
    setSelectedUsefulType(newUsefulType);
    
    if (newUsefulType === 'special' && availableSpecialLocations.length > 0) {
      setSelectedLocationId(availableSpecialLocations[0].id);
    } else if (newUsefulType === 'chests') {
      setSelectedLocationId(4001); // Special chest ID
    } else {
      setSelectedLocationId(null);
    }
  };

  const handleSave = () => {
    if (selectedType === 'useful' && selectedUsefulType === 'chests') {
      // For chest locations - use special ID 4001 with chest count
      onSave(4001, false, parseInt(selectedChestCount, 10));
    } else if (selectedType === 'useless') {
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
      case 'useful':
        return (
          <div className="space-y-4">
            {/* Location Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUsefulTypeChange('chests')}
                className={`p-3 rounded border text-left ${
                  selectedUsefulType === 'chests'
                    ? 'bg-green-600 border-white'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Chests</div>
              </button>
              <button
                onClick={() => handleUsefulTypeChange('special')}
                className={`p-3 rounded border text-left ${
                  selectedUsefulType === 'special'
                    ? 'bg-green-600 border-white'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Special</div>
              </button>
            </div>

            {/* Chest Count Buttons */}
            {selectedUsefulType === 'chests' && (
              <div>
                <label className="block text-sm font-medium mb-2">Number of Chests</label>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => setSelectedChestCount(num.toString())}
                      className={`p-2 rounded border text-center ${
                        selectedChestCount === num.toString()
                          ? 'bg-green-600 border-white text-white'
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Location Selection */}
            {selectedUsefulType === 'special' && (
              <div>
                <label className="block text-sm font-medium mb-2">Special Location</label>
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
            )}
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
    if (selectedType === 'useful' && selectedUsefulType === 'special' && availableSpecialLocations.length === 0) return true;
    if (selectedType === 'useful' && selectedUsefulType === 'chests') return false; // Chests are always available
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
                  className={`p-3 rounded border text-left ${
                    selectedType === key
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
                {selectedType === 'useful' ? 'Location Details' : 
                 selectedType === 'connector' ? 'Connector Type' : 
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
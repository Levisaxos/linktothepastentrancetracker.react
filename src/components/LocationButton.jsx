// src/components/LocationButton.jsx
import React from 'react';
import { locationTypes } from '../data/locationTypes';
import { locationResolverService } from '../services/locationResolverService';
import { mapData } from '../data/mapData';

const LocationButton = ({ location, locationData, onClick, onRightClick, imageDimensions, isReadOnly = false, currentGame }) => {
  const getLocationDisplay = () => {
    let resolvedData = null;


    // Only show user-set location data, not defaults
    if (locationData) {
      if (locationData.locationId) {
        // ID-based location (dungeons, connectors, special useful, chests)
        const chestCount = locationData.chestCount || 1; // Default to 1 if not specified
        resolvedData = locationResolverService.resolveLocationById(locationData.locationId, locationData.completed, chestCount);
      }
    }
    // Remove the default location logic - only show what user has explicitly set

    if (!resolvedData) {
      // No user-set data means show empty button
      return null;
    }

    const type = locationTypes[resolvedData.type];
    if (!type) {
      console.warn(`Unknown location type: ${resolvedData.type}`);
      return {
        text: 'X',
        color: 'bg-gray-600',
        size: 'w-8 h-8 text-sm'
      };
    }

    const isUseless = resolvedData.type === 'useless';
    const isCompleted = resolvedData.completed;
    
    let displayText = '';
    let color = type.color;

    switch (resolvedData.type) {
      case 'useful':
        displayText = resolvedData.displayValue;
        break;
      case 'connector':
        displayText = `${type.prefix}${resolvedData.number}`;
        break;
      case 'dungeon':
        displayText = resolvedData.acronym;
        color = isCompleted ? 'bg-red-900' : type.color;
        break;        
      case 'useless':
        displayText = '';
        break;
      default:
        displayText = resolvedData.acronym;
    }

    const result = {
      text: displayText,
      color: color,
      size: isUseless ? 'w-4 h-4 text-xs' : 'w-8 h-8 text-sm'
    };

    return result;
  };

  const display = getLocationDisplay();

  if (!imageDimensions) return null;

  // Calculate position based on actual rendered image dimensions
  const scaleX = imageDimensions.width / imageDimensions.naturalWidth;
  const scaleY = imageDimensions.height / imageDimensions.naturalHeight;
  
  const scaledX = location.x * scaleX;
  const scaledY = location.y * scaleY;

  // Check if location is editable
  const isLocationEditable = !locationData || locationData.isEditable !== false;
  const canEdit = !isReadOnly && isLocationEditable;

  return (
    <div className="absolute" style={{
      left: `${scaledX}px`,
      top: `${scaledY}px`,
      transform: 'translate(-50%, -50%)'
    }}>
      <button
        onMouseUp={(e) => {
          e.stopPropagation();
          
          if (e.button === 0) { // Left click
            if (canEdit && onClick) {
              onClick();
            }
          } else if (e.button === 2) { // Right click
            if (canEdit && onRightClick) {
              onRightClick();
            }
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`border-2 border-gray-500 rounded flex items-center justify-center font-bold transition-colors ${
          display 
            ? `${display.color} text-white ${display.size}` 
            : 'w-6 h-6 bg-gray-600 hover:bg-gray-500 text-white text-xs'
        } ${canEdit ? 'cursor-pointer hover:border-white' : 'opacity-75 cursor-default'}`}
        style={{
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        title={`${location.name}${!isLocationEditable ? ' (Locked)' : ''}`}
      >
        {display ? display.text : '?'}
      </button>
    </div>
  );
};

export default LocationButton;
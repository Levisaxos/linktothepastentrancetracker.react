// src/components/LocationButton.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { locationTypes } from '../data/locationTypes';
import { locationResolverService } from '../services/locationResolverService';
import LocationHoverTooltip from './LocationHoverTooltip';

const LocationButton = React.memo(({ 
  location, 
  locationData, 
  onClick, 
  onRightClick, 
  imageDimensions, 
  isReadOnly = false,
  currentGame,
  onToggleCheck
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const hideTimeoutRef = useRef(null);

  // Memoize the location display calculation
  const display = useMemo(() => {
    let resolvedData = null;

    // Only show user-set location data, not defaults
    if (locationData) {
      if (locationData.locationId) {
        // ID-based location (dungeons, connectors, special useful, chests)
        const chestCount = locationData.chestCount || 1;
        resolvedData = locationResolverService.resolveLocationById(
          locationData.locationId, 
          locationData.completed, 
          chestCount
        );
      }
    }

    if (!resolvedData) {
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

    return {
      text: displayText,
      color: color,
      size: isUseless ? 'w-4 h-4 text-xs' : 'w-8 h-8 text-sm'
    };
  }, [locationData]);

  // Memoize position calculation
  const position = useMemo(() => {
    if (!imageDimensions) return null;
    
    const scaleX = imageDimensions.width / imageDimensions.naturalWidth;
    const scaleY = imageDimensions.height / imageDimensions.naturalHeight;
    
    return {
      left: `${location.x * scaleX}px`,
      top: `${location.y * scaleY}px`
    };
  }, [location.x, location.y, imageDimensions]);

  // Check if location is editable
  const isLocationEditable = !locationData || locationData.isEditable !== false;
  const canEdit = !isReadOnly && isLocationEditable;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Early return after all hooks
  if (!imageDimensions || !position) return null;

  const handleMouseEnter = (e) => {
    e.stopPropagation();
    
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Only update position if this is from the button, not from the tooltip
    if (e.currentTarget.tagName === 'BUTTON') {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
    
    setTooltipVisible(true);
  };

  const handleMouseLeave = (e) => {
    e.stopPropagation();
    
    // Add a delay before hiding the tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setTooltipVisible(false);
    }, 100); // 100ms delay allows mouse to move to tooltip
  };

  return (
    <>
      <div  
        className="absolute" 
        style={{
          ...position,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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

      <LocationHoverTooltip
        isVisible={tooltipVisible}
        position={tooltipPosition}
        location={location}
        locationData={locationData}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        currentGame={currentGame}
        onToggleCheck={onToggleCheck}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific props change
  const prevLocationId = prevProps.locationData?.locationId;
  const nextLocationId = nextProps.locationData?.locationId;
  
  // If location IDs are different or one is undefined, re-render
  if (prevLocationId !== nextLocationId) return false;
  
  // If we have a locationId, check if any checks for this location changed
  if (prevLocationId && nextLocationId) {
    const prevChecks = prevProps.currentGame?.checkStatus || {};
    const nextChecks = nextProps.currentGame?.checkStatus || {};
    
    // Get all checks for this location
    const locationChecks = locationResolverService.getLocationChecks(prevLocationId);
    
    // Check if any of these checks changed status
    const hasCheckChanges = locationChecks.some(check => 
      prevChecks[check.id] !== nextChecks[check.id]
    );
    
    if (hasCheckChanges) return false;
  }
  
  return (
    prevProps.location.id === nextProps.location.id &&
    prevProps.locationData === nextProps.locationData &&
    prevProps.imageDimensions === nextProps.imageDimensions &&
    prevProps.isReadOnly === nextProps.isReadOnly &&
    prevProps.currentGame?.id === nextProps.currentGame?.id
  );
});

LocationButton.displayName = 'LocationButton';

export default LocationButton;
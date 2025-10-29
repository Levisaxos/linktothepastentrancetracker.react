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
  console.log('=== LOCATION BUTTON RENDER ===', location.name);
  console.log('Current checkStatus:', currentGame?.checkStatus);

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
  const checkStatusVersion = useMemo(() => {
    if (!locationData?.locationId) return 0;
    const checks = locationResolverService.getLocationChecks(locationData.locationId);
    const checkStatus = currentGame?.checkStatus || {};
    return checks.reduce((sum, check) => sum + (checkStatus[check.id] ? 1 : 0), 0);
  }, [locationData?.locationId, currentGame?.checkStatus]);
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
          className={`border-2 border-gray-500 rounded flex items-center justify-center font-bold transition-colors ${display
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
        key={`tooltip-${location.id}-${JSON.stringify(currentGame?.checkStatus || {})}`}
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
  // Basic props that should trigger re-render
  if (prevProps.location.id !== nextProps.location.id) return false;
  if (prevProps.locationData !== nextProps.locationData) return false;
  if (prevProps.imageDimensions !== nextProps.imageDimensions) return false;
  if (prevProps.isReadOnly !== nextProps.isReadOnly) return false;
  if (prevProps.currentGame?.id !== nextProps.currentGame?.id) return false;
  
  // Get the locationId to check which checks belong to this location
  const locationId = nextProps.locationData?.locationId;
  
  if (!locationId) {
    // No location assigned, only re-render if other props changed
    return true;
  }
  
  // Get all checks for this specific location
  const checks = locationResolverService.getLocationChecks(locationId);
  
  if (checks.length === 0) {
    // No checks for this location, only re-render if other props changed
    return true;
  }
  
  // Check if ANY of this location's checks changed status
  const prevCheckStatus = prevProps.currentGame?.checkStatus || {};
  const nextCheckStatus = nextProps.currentGame?.checkStatus || {};
  
  for (const check of checks) {
    const prevStatus = prevCheckStatus[check.id] || false;
    const nextStatus = nextCheckStatus[check.id] || false;
    
    if (prevStatus !== nextStatus) {
      console.log(`Check ${check.id} status changed: ${prevStatus} -> ${nextStatus}, re-rendering button for ${nextProps.location.name}`);
      return false; // Status changed, need to re-render
    }
  }
  
  // No relevant changes, skip re-render
  return true;
});

LocationButton.displayName = 'LocationButton';

export default LocationButton;
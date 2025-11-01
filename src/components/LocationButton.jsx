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

  const display = useMemo(() => {
    let resolvedData = null;

    // Check if marked as useless - if so, show useless state regardless of actual location
    if (locationData?.markedUseless) {
      return {
        text: '',
        color: 'bg-red-900',
        size: 'w-4 h-4 text-xs'
      };
    }

    // Only show user-set location data, not defaults
    if (locationData) {
      if (locationData.locationId) {        
        resolvedData = locationResolverService.resolveLocationById(
          locationData.locationId,
          locationData.completed,
        );
      }
    }

    // ... rest of the existing display logic stays the same
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
      case 'location':
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

  const canLeftClick = !isReadOnly && (!locationData || locationData.isEditable !== false) && !locationData?.markedUseless && !locationData?.completed;
  const canRightClick = !isReadOnly;

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);
  
  if (!imageDimensions || !position) return null;

  const handleMouseEnter = (e) => {
    e.stopPropagation();

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

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

            if (e.button === 0) {
              if (canLeftClick && onClick) {
                onClick();
              }
            } else if (e.button === 2) {
              if (canRightClick && onRightClick) {
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
            } ${canLeftClick ? 'cursor-pointer hover:border-white' : 'opacity-75 cursor-default'}`}
          style={{
            zIndex: 10,
            pointerEvents: 'auto'
          }}
          title={`${location.name}${!canLeftClick ? ' (Locked)' : ''}`}
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
      return false; // Status changed, need to re-render
    }
  }

  // No relevant changes, skip re-render
  return true;
});

LocationButton.displayName = 'LocationButton';

export default LocationButton;
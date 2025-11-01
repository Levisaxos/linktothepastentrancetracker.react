// src/components/LocationHoverTooltip.jsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { locationResolverService } from '../services/locationResolverService';
import { locationTypes } from '../data/locationTypes';
import { getCheckSpriteById } from '../data/checkData';

const LocationHoverTooltip = ({ isVisible, position, location, locationData, onMouseEnter, onMouseLeave, currentGame, onToggleCheck, checkStatusVersion }) => {
  const tooltipRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y });
  // Calculate adjusted position to keep tooltip in bounds
  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !position.x || !position.y) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10; // Padding from viewport edges

    let newX = position.x;
    let newY = position.y;

    // Default positioning: centered horizontally, above the button
    let translateX = '-50%';
    let translateY = 'calc(-100% - 12px)';

    // Check if tooltip goes off the right edge
    if (newX + rect.width / 2 > viewportWidth - padding) {
      newX = viewportWidth - rect.width / 2 - padding;
      translateX = '-50%';
    }

    // Check if tooltip goes off the left edge
    if (newX - rect.width / 2 < padding) {
      newX = rect.width / 2 + padding;
      translateX = '-50%';
    }

    // Check if tooltip goes off the top edge
    const wouldBeTop = newY - rect.height - 12;
    if (wouldBeTop < padding) {
      // Not enough space above, position below the button instead
      translateY = '12px'; // Small gap below the button
      newY = position.y;
    }

    // Check if tooltip would go off the bottom when positioned below
    const wouldBeBottom = newY + rect.height + 12;
    if (translateY === '12px' && wouldBeBottom > viewportHeight - padding) {
      // Not enough space below either, stick to top of viewport
      newY = rect.height / 2 + padding;
      translateY = '-50%';
    }

    setAdjustedPosition({ x: newX, y: newY, translateX, translateY });
  }, [isVisible, position.x, position.y]);

  if (!isVisible || !position.x || !position.y) return null;

  console.log('=== TOOLTIP RENDER ===', location?.name);
  console.log('Full checkStatus:', currentGame?.checkStatus);

  const handleCheckClick = (checkId, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (onToggleCheck) {
      const isRightClick = e.button === 2 || e.type === 'contextmenu';
      onToggleCheck(checkId, isRightClick);
    }
  };

  const getLocationInfo = () => {
    // Check if marked as useless first
    if (locationData?.markedUseless) {
      return {
        type: 'Marked Useless',
        description: 'This location has been marked as not useful',
        linkedLocationName: 'Marked as Useless',
        color: 'text-red-400',
        bgColor: 'bg-red-900'
      };
    }

    if (!locationData?.locationId) {
      return {
        type: 'Unassigned',
        description: 'Click to assign a location type',
        linkedLocationName: null,
        color: 'text-gray-400',
        bgColor: 'bg-gray-700'
      };
    }

    const chestCount = locationData.chestCount || 1;
    const resolvedData = locationResolverService.resolveLocationById(
      locationData.locationId,
      locationData.completed,
      chestCount
    );

    if (!resolvedData) {
      return {
        type: 'Unknown',
        description: 'Unknown location type',
        linkedLocationName: null,
        color: 'text-gray-400',
        bgColor: 'bg-gray-700'
      };
    }

    const type = locationTypes[resolvedData.type];
    let typeDisplay = '';
    let description = '';
    let linkedLocationName = null;
    let color = 'text-white';
    let bgColor = type?.color || 'bg-gray-700';

    switch (resolvedData.type) {
      case 'useful':
        typeDisplay = 'Useful Item';
        linkedLocationName = resolvedData.description || resolvedData.displayValue;
        description = `Contains: ${resolvedData.displayValue}`;
        color = 'text-green-300';
        break;
      case 'connector':
        typeDisplay = 'Connector';
        linkedLocationName = resolvedData.name;
        description = `Connector Group #${resolvedData.number}`;
        color = 'text-yellow-300';
        break;
      case 'dungeon':
        typeDisplay = locationData.completed ? 'Dungeon (Completed)' : 'Dungeon (Active)';
        linkedLocationName = resolvedData.fullName;
        description = locationData.completed ? 'This dungeon has been completed' : 'This dungeon is still active';
        color = locationData.completed ? 'text-red-300' : 'text-purple-300';
        bgColor = locationData.completed ? 'bg-red-900' : 'bg-purple-600';
        break;
      default:
        typeDisplay = 'Unknown';
        description = 'Unknown location type';
        linkedLocationName = null;
    }

    return { type: typeDisplay, description, linkedLocationName, color, bgColor };
  };

  const locationInfo = getLocationInfo();
  const isMinimal = !locationInfo.linkedLocationName || locationInfo.type === 'Marked Useless';

  const tooltipContent = (
    <div
      ref={tooltipRef}
      key={`${JSON.stringify(currentGame?.checkStatus || {})}-${checkStatusVersion}`}
      className="bg-gray-900 border-2 border-gray-600 rounded-lg shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        transform: `translate(${adjustedPosition.translateX || '-50%'}, ${adjustedPosition.translateY || 'calc(-100% - 12px)'})`,
        zIndex: 999999,
        pointerEvents: 'auto',
        minWidth: isMinimal ? '180px' : '220px',
        maxWidth: '350px'
      }}
    >
      <div className="p-4">
        {isMinimal ? (
          <>
            <div className="font-bold text-base mb-2 text-gray-400">
              {location?.name || 'Unknown Location'}
            </div>
            <div className="text-xs text-gray-500">
              {locationInfo.type === 'Marked Useless'
                ? '• Right click to unmark'
                : '• Click to assign location'}
            </div>
          </>
        ) : (
          <>
            <div className="font-bold text-lg mb-3 text-blue-300 border-b border-gray-700 pb-2">
              <div className="text-sm text-gray-400 mb-1">{location?.name || 'Unknown Location'}</div>
              <div className="flex items-center gap-1">
                <span className="text-base">Connected to</span>
                <span className={locationInfo.color}>{locationInfo.linkedLocationName}</span>
              </div>
            </div>

            <div className={`text-sm ${locationInfo.color} mb-3`}>
              {locationInfo.description}
            </div>

            {(() => {
              const locationId = locationData?.locationId;
              const checks = locationId ? locationResolverService.getLocationChecks(locationId) : [];
              const checkStatus = currentGame?.checkStatus || {};

              if (checks.length > 0) {
                return (
                  <div className="pt-2 border-t border-gray-700 mb-3">
                    <div className="text-xs text-gray-400 mb-2">
                      Checks ({checks.filter(c => checkStatus[c.id]).length}/{checks.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {checks.map((check) => {
                        const isCollected = checkStatus[check.id] === true;
                        const sprite = getCheckSpriteById(check.type);

                        return (
                          <img
                            key={check.id}
                            src={isCollected ? sprite?.collectedSprite : sprite?.collectableSprite}
                            alt={check.name}
                            className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => handleCheckClick(check.id, e)}
                            onContextMenu={(e) => handleCheckClick(check.id, e)}
                            title={check.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
              {locationData?.markedUseless ? (
                <>
                  <div>• Right click to unmark as useless</div>
                  {locationData?.isEditable !== false && (
                    <div>• Left click to edit location</div>
                  )}
                </>
              ) : locationData?.isEditable !== false ? (
                <>
                  <div>• Left click to edit</div>
                  {locationData?.locationId && locationResolverService.resolveLocationById(locationData.locationId)?.type === 'dungeon' ? (
                    <div>• Right click to toggle completion</div>
                  ) : (
                    <div>• Right click to mark useless</div>
                  )}
                </>
              ) : (
                <>
                  <div>• Location is locked</div>
                  <div>• Right click to mark useless</div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(tooltipContent, document.body);
};

export default LocationHoverTooltip;
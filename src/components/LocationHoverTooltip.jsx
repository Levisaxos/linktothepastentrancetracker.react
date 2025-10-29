// src/components/LocationHoverTooltip.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { locationResolverService } from '../services/locationResolverService';
import { locationTypes } from '../data/locationTypes';
import { getCheckSpriteById } from '../data/checkData';

const LocationHoverTooltip = ({ isVisible, position, location, locationData, onMouseEnter, onMouseLeave, currentGame, onToggleCheck, checkStatusVersion }) => {
  if (!isVisible || !position.x || !position.y) return null;

  console.log('=== TOOLTIP RENDER ===', location?.name);
  console.log('Full checkStatus:', currentGame?.checkStatus);
  
  const handleCheckClick = (checkId, e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent context menu

    if (onToggleCheck) {
      const isRightClick = e.button === 2 || e.type === 'contextmenu';
      onToggleCheck(checkId, isRightClick);
    }
  };


  // Resolve location data to get display information
  const getLocationInfo = () => {
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
      case 'useless':
        typeDisplay = 'Useless Location';
        linkedLocationName = 'Nothing Useful';
        description = 'This location has been marked as not useful';
        color = 'text-red-400';
        break;
      default:
        typeDisplay = 'Unknown';
        description = 'Unknown location type';
        linkedLocationName = null;
    }

    return { type: typeDisplay, description, linkedLocationName, color, bgColor };
  };

  const locationInfo = getLocationInfo();

  // Minimal tooltip for unassigned and useless locations
  const isMinimal = !locationInfo.linkedLocationName || locationInfo.type === 'Useless Location';

  const tooltipContent = (
    <div
      key={`${JSON.stringify(currentGame?.checkStatus || {})}-${checkStatusVersion}`}
      className="bg-gray-900 border-2 border-gray-600 rounded-lg shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, calc(-100% - 12px))',
        zIndex: 999999,
        pointerEvents: 'auto',
        minWidth: isMinimal ? '180px' : '220px',
        maxWidth: '350px'
      }}
    >
      <div className="p-4">
        {isMinimal ? (
          // Minimal view for unassigned/useless
          <>
            <div className="font-bold text-base mb-2 text-gray-400">
              {location?.name || 'Unknown Location'}
            </div>
            <div className="text-xs text-gray-500">
              {locationInfo.type === 'Useless Location'
                ? '• Right click to unmark'
                : '• Click to assign location'}
            </div>
          </>
        ) : (
          // Full view for assigned locations
          <>
            {/* Title showing connection */}
            <div className="font-bold text-lg mb-3 text-blue-300 border-b border-gray-700 pb-2">
              <div className="text-sm text-gray-400 mb-1">{location?.name || 'Unknown Location'}</div>
              <div className="flex items-center gap-1">
                <span className="text-base">Connected to</span>
                <span className={locationInfo.color}>{locationInfo.linkedLocationName}</span>
              </div>
            </div>

            {/* Location Description */}
            <div className={`text-sm ${locationInfo.color} mb-3`}>
              {locationInfo.description}
            </div>

            {/* ADD THIS CHECKS SECTION HERE */}
            {/* Checks Section */}
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

            {/* Controls Hint */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
              {locationData?.isEditable !== false ? (
                <>
                  <div>• Left click to edit</div>
                  {locationData?.locationId && locationResolverService.resolveLocationById(locationData.locationId)?.type === 'dungeon' ? (
                    <div>• Right click to toggle completion</div>
                  ) : (
                    <div>• Right click to mark useless</div>
                  )}
                </>
              ) : (
                <div>• Location is locked (read-only)</div>
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
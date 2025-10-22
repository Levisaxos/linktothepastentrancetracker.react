// src/components/LocationHoverTooltip.jsx
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { locationResolverService } from '../services/locationResolverService';
import { locationTypes, dungeonData, connectorData, usefulLocationData } from '../data/locationTypes';

const LocationHoverTooltip = ({ isVisible, position, location, locationData, onMouseEnter, onMouseLeave, currentGame, onToggleCheck }) => {
  const [hoveredCheck, setHoveredCheck] = useState(null);
  const [checkTooltipPosition, setCheckTooltipPosition] = useState({ x: 0, y: 0 });  

  // Memoize checks to ensure they update when locationData changes
  const checks = useMemo(() => {
    if (!locationData?.locationId) {
      return [];
    }
    return locationResolverService.getLocationChecks(locationData.locationId);
  }, [locationData?.locationId]);

  // Calculate checkStatus directly (no memo) to ensure it's always current
  const getCheckStatus = () => {
    if (!locationData?.locationId) {
      return {};
    }

    const groupKey = locationResolverService.getLocationGroupKey(locationData.locationId);
    if (!groupKey || !currentGame?.checkStatus) {
      return {};
    }

    return currentGame.checkStatus[groupKey] || {};
  };
  
  const checkStatus = getCheckStatus();

  // Early return AFTER all hooks
  if (!isVisible || !position.x || !position.y) return null;

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
  const isMinimal = !locationInfo.linkedLocationName || locationInfo.type === 'Useless Location';

  const handleCheckMouseEnter = (checkName, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCheckTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setHoveredCheck(checkName);
  };

  const handleCheckMouseLeave = () => {
    setHoveredCheck(null);
  };

  const handleCheckClick = (checkName, e) => {
    e.stopPropagation();
    
    const locationDataForLog = currentGame?.locations[location.id];
    const groupKey = locationResolverService.getLocationGroupKey(locationDataForLog?.locationId);
    
    console.log('Check clicked:', {
      mapLocationId: location.id,
      locationData: locationDataForLog,
      locationId: locationDataForLog?.locationId,
      groupKey: groupKey,
      checkName: checkName,
      currentGameCheckStatus: currentGame?.checkStatus,
      groupCheckStatus: currentGame?.checkStatus?.[groupKey],
      currentStatus: currentGame?.checkStatus?.[groupKey]?.[checkName],
      checkStatusFromMemo: checkStatus,
      checkStatusValue: checkStatus[checkName]
    });
    
    if (onToggleCheck) {
      onToggleCheck(location.id, checkName);
    }
  };

  // Calculate bounded position to keep tooltip within viewport
  const getBoundedPosition = () => {
    const tooltipWidth = isMinimal ? 180 : 220;
    const tooltipHeight = isMinimal ? 100 : 300; // Approximate heights
    const padding = 12; // Space between button and tooltip

    let x = position.x;
    let y = position.y - padding;
    let transform = 'translate(-50%, -100%)';

    // Check if tooltip would go off the left edge
    if (x - tooltipWidth / 2 < 10) {
      x = tooltipWidth / 2 + 10;
      transform = 'translate(-50%, -100%)';
    }

    // Check if tooltip would go off the right edge
    if (x + tooltipWidth / 2 > window.innerWidth - 10) {
      x = window.innerWidth - tooltipWidth / 2 - 10;
      transform = 'translate(-50%, -100%)';
    }

    // Check if tooltip would go off the top edge
    if (y - tooltipHeight < 10) {
      // Show below the button instead
      y = position.y + padding + 20; // 20px is approximate button height
      transform = 'translate(-50%, 0)';
    }

    return { x, y, transform };
  };

  const boundedPos = getBoundedPosition();

  const tooltipContent = (
    <div
      className="bg-gray-900 border-2 border-gray-600 rounded-lg shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        left: `${boundedPos.x}px`,
        top: `${boundedPos.y}px`,
        transform: boundedPos.transform,
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
              {locationInfo.type === 'Useless Location'
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

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${locationInfo.bgColor} text-white`}>
                {locationInfo.type}
              </span>
              {locationData?.isEditable === false && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-600 text-white">
                  Locked
                </span>
              )}
            </div>

            <div className={`text-sm ${locationInfo.color} mb-3`}>
              {locationInfo.description}
            </div>

            {checks.length > 0 && (
              <div className="mb-3 pb-3 border-b border-gray-700">
                <div className="text-xs text-gray-400 mb-2">Checks: ({Object.values(checkStatus).filter(Boolean).length}/{checks.length})</div>
                <div className="flex flex-wrap gap-1">
                  {checks.map((checkName, index) => {
                    const isCompleted = checkStatus[checkName] === true;
                    return (
                      <img
                        key={index}
                        src={isCompleted ? '/images/sprites/openchest.png' : '/images/sprites/chest.png'}
                        alt={checkName}
                        className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => handleCheckClick(checkName, e)}
                        onMouseEnter={(e) => handleCheckMouseEnter(checkName, e)}
                        onMouseLeave={handleCheckMouseLeave}
                        title={checkName}
                      />
                    );
                  })}
                </div>
              </div>
            )}

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

  return (
    <>
      {ReactDOM.createPortal(tooltipContent, document.body)}
      {hoveredCheck && ReactDOM.createPortal(
        <div
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
          style={{
            position: 'fixed',
            left: `${checkTooltipPosition.x}px`,
            top: `${checkTooltipPosition.y}px`,
            transform: 'translate(-50%, calc(-100% - 8px))',
            zIndex: 9999999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {hoveredCheck}
        </div>,
        document.body
      )}
    </>
  );
};

export default LocationHoverTooltip;
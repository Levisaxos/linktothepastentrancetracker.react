// src/components/LocationHoverTooltip.jsx
import React from 'react';
import ReactDOM from 'react-dom';

const LocationHoverTooltip = ({ isVisible, position, location, locationData }) => {
  if (!isVisible) return null;

  const tooltipContent = (
    <div 
      className="fixed bg-gray-800 border-2 border-gray-600 rounded-lg p-4 shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, calc(-100% - 8px))',
        zIndex: 99999,
        pointerEvents: 'none',
        minWidth: '200px'
      }}
    >
      <div className="text-white text-sm">
        <div className="font-bold mb-2 text-blue-300">Hello!</div>
        <div className="text-gray-300 mb-1">This is a hover tooltip</div>
        <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
          Location: {location?.name || 'Unknown'}
        </div>
        {locationData?.linkedLocationId && (
          <div className="text-gray-400 text-xs">
            Linked ID: {locationData.linkedLocationId}
          </div>
        )}
      </div>
    </div>
  );

  // Render to document body using portal to ensure highest z-index
  return ReactDOM.createPortal(
    tooltipContent,
    document.body
  );
};

export default LocationHoverTooltip;
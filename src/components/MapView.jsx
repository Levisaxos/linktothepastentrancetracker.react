// src/components/MapView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LocationButton from './LocationButton';
import LocationModal from './LocationModal';
import NotesPanel from './NotesPanel';
import { mapData } from '../data/mapData';
import { locationResolverService } from '../services/locationResolverService';
import { IMAGE_PATHS } from '../constants/imagePaths';

// Memoized WorldMap component to prevent unnecessary re-renders
const WorldMap = React.memo(({
  world,
  locations,
  imagePath,
  dimensions,
  currentGameLocations,
  currentGame,
  isReadOnly,
  onLocationClick,
  onLocationRightClick,
  onImageLoad,
  onToggleCheck
}) => {
  return (
    <div className="flex-1">
      <div
        className="relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={imagePath}
          alt={`${world} world map`}
          className="w-full h-auto max-h-[calc(100vh-120px)] object-contain"
          onLoad={onImageLoad}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        {dimensions && (
          <div
            className="absolute"
            style={{
              left: `${dimensions.offsetX}px`,
              top: `${dimensions.offsetY}px`,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {locations.map(location => (
              <LocationButton
                key={location.id}
                location={location}
                locationData={currentGameLocations[location.id]}
                onClick={() => onLocationClick(location)}
                onRightClick={() => onLocationRightClick(location)}
                imageDimensions={dimensions}
                isReadOnly={isReadOnly}
                currentGame={currentGame}
                onToggleCheck={onToggleCheck}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if these specific props change
  return (
    prevProps.world === nextProps.world &&
    prevProps.dimensions === nextProps.dimensions &&
    prevProps.currentGameLocations === nextProps.currentGameLocations &&
    prevProps.isReadOnly === nextProps.isReadOnly &&
    prevProps.currentGame?.id === nextProps.currentGame?.id
  );
});

WorldMap.displayName = 'WorldMap';

const MapView = ({ currentGame, setCurrentGame }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});

  // Disable context menu for the entire MapView
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Handle window resize to recalculate button positions
  useEffect(() => {
    const handleResize = () => {
      // Force recalculation of image dimensions on resize
      const images = document.querySelectorAll('img[alt*="world map"]');
      images.forEach(img => {
        const world = img.alt.includes('light') ? 'light' : 'dark';
        const container = img.parentElement;

        const containerRect = container.getBoundingClientRect();
        const naturalRatio = img.naturalWidth / img.naturalHeight;
        const containerRatio = containerRect.width / containerRect.height;

        let renderedWidth, renderedHeight, offsetX, offsetY;

        if (containerRatio > naturalRatio) {
          renderedHeight = containerRect.height;
          renderedWidth = renderedHeight * naturalRatio;
          offsetX = (containerRect.width - renderedWidth) / 2;
          offsetY = 0;
        } else {
          renderedWidth = containerRect.width;
          renderedHeight = renderedWidth / naturalRatio;
          offsetX = 0;
          offsetY = (containerRect.height - renderedHeight) / 2;
        }

        setImageDimensions(prev => ({
          ...prev,
          [world]: {
            width: renderedWidth,
            height: renderedHeight,
            offsetX,
            offsetY,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }
        }));
      });
    };

    // Debounce resize handler to avoid too many updates
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Memoize location click handler to prevent recreation on every render
  const handleLocationClick = useCallback((location) => {
    if (currentGame?.isFinished) return;

    const locationData = currentGame?.locations[location.id];
    const isLocationEditable = locationData?.isEditable !== false;

    if (!isLocationEditable) return;

    setSelectedLocation(location);
    setShowLocationModal(true);
  }, [currentGame?.isFinished, currentGame?.locations]);


  const handleToggleCheck = useCallback((checkId, isRightClick = false) => {
    if (currentGame?.isFinished) return;

    setCurrentGame(prevGame => {
      const currentStatus = (prevGame?.checkStatus || {})[checkId] || false;
      
      let newStatus;
      if (isRightClick) {
        newStatus = false;
      } else {
        newStatus = true;
      }

      if (currentStatus === newStatus) return prevGame;

      console.log('Toggling check:', checkId, 'from', currentStatus, 'to', newStatus);

      return {
        ...prevGame,
        checkStatus: {
          ...(prevGame.checkStatus || {}),
          [checkId]: newStatus
        }
      };
    });
  }, [currentGame?.isFinished, setCurrentGame]);

  const handleLocationUpdate = useCallback((locationIdOrSpecial, completed = false, chestCount = 1) => {
    if (currentGame?.isFinished) return;

    const existingLocationData = currentGame?.locations[selectedLocation.id];
    const isLocationEditable = existingLocationData?.isEditable !== false;

    if (!isLocationEditable) return;

    // Handle reset case - remove location data entirely
    if (locationIdOrSpecial === 'reset') {
      const updatedLocations = { ...currentGame.locations };
      delete updatedLocations[selectedLocation.id];

      setCurrentGame({
        ...currentGame,
        locations: updatedLocations
      });

      setShowLocationModal(false);
      setSelectedLocation(null);
      return;
    }

    let locationData;

    // Handle chest locations (ID 4001)
    if (locationIdOrSpecial === 4001) {
      locationData = {
        locationId: 4001,
        chestCount: chestCount,
        completed: false,
        isEditable: true
      };
    } else {
      // Handle normal ID-based locations
      locationData = {
        locationId: locationIdOrSpecial,
        completed: completed || false,
        isEditable: true
      };
    }

    setCurrentGame({
      ...currentGame,
      locations: {
        ...currentGame.locations,
        [selectedLocation.id]: locationData
      }
    });

    setShowLocationModal(false);
    setSelectedLocation(null);
  }, [currentGame, selectedLocation, setCurrentGame]);

  // Memoize global notes update handler
  const handleUpdateGlobalNotes = useCallback((updatedNotes) => {
    if (currentGame?.isFinished) return;

    setCurrentGame({
      ...currentGame,
      globalNotes: updatedNotes
    });
  }, [currentGame, setCurrentGame]);

  // Memoize right click handler
  const handleRightClick = useCallback((location) => {
    if (currentGame?.isFinished) return;

    const locationData = currentGame?.locations[location.id];
    const isLocationEditable = locationData?.isEditable !== false;

    if (!isLocationEditable) return;

    // Special handling for dungeon locations
    if (locationData && locationData.locationId) {
      const resolvedData = locationResolverService.resolveLocationById(locationData.locationId);

      if (resolvedData && resolvedData.type === 'dungeon') {
        // Right-click on dungeon = toggle completion state
        const newLocationData = {
          ...locationData,
          completed: !locationData.completed
        };

        setCurrentGame({
          ...currentGame,
          locations: {
            ...currentGame.locations,
            [location.id]: newLocationData
          }
        });
        return;
      }
    }

    // For all other location types, mark as useless (set to ID 5001)
    const uselessLocationData = {
      locationId: 5001,
      completed: false,
      isEditable: true
    };

    setCurrentGame({
      ...currentGame,
      locations: {
        ...currentGame.locations,
        [location.id]: uselessLocationData
      }
    });
  }, [currentGame, setCurrentGame]);

  // Memoize image load handler
  const handleImageLoad = useCallback((world) => (event) => {
    const img = event.target;
    const container = img.parentElement;

    const containerRect = container.getBoundingClientRect();
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = containerRect.width / containerRect.height;

    let renderedWidth, renderedHeight, offsetX, offsetY;

    if (containerRatio > naturalRatio) {
      renderedHeight = containerRect.height;
      renderedWidth = renderedHeight * naturalRatio;
      offsetX = (containerRect.width - renderedWidth) / 2;
      offsetY = 0;
    } else {
      renderedWidth = containerRect.width;
      renderedHeight = renderedWidth / naturalRatio;
      offsetX = 0;
      offsetY = (containerRect.height - renderedHeight) / 2;
    }

    setImageDimensions(prev => ({
      ...prev,
      [world]: {
        width: renderedWidth,
        height: renderedHeight,
        offsetX,
        offsetY,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }
    }));
  }, []);

  // Determine world order based on inverted setting
  const isInverted = currentGame?.isInverted || false;
  const leftWorld = isInverted ? 'dark' : 'light';
  const rightWorld = isInverted ? 'light' : 'dark';

  // Memoize locations arrays to prevent recreation
  const leftLocations = useMemo(() => mapData[leftWorld] || [], [leftWorld]);
  const rightLocations = useMemo(() => mapData[rightWorld] || [], [rightWorld]);

  // Memoize image paths
  const leftImagePath = leftWorld === 'light' ? IMAGE_PATHS.LIGHT_WORLD_MAP : IMAGE_PATHS.DARK_WORLD_MAP;
  const rightImagePath = rightWorld === 'light' ? IMAGE_PATHS.LIGHT_WORLD_MAP : IMAGE_PATHS.DARK_WORLD_MAP;

  return (
    <>
      {currentGame?.isFinished && (
        <div className="bg-amber-900 border-l-4 border-amber-500 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-amber-200">
                <strong>Read-Only Mode:</strong> This game is marked as finished and cannot be edited.
                Reactivate it from the games list to make changes.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-2">
        <div className="flex gap-2">
          <WorldMap
            world={leftWorld}
            locations={leftLocations}
            imagePath={leftImagePath}
            dimensions={imageDimensions[leftWorld]}
            currentGameLocations={currentGame?.locations || {}}
            currentGame={currentGame}
            isReadOnly={currentGame?.isFinished}
            onLocationClick={handleLocationClick}
            onLocationRightClick={handleRightClick}
            onImageLoad={handleImageLoad(leftWorld)}
            onToggleCheck={handleToggleCheck}
          />
          <WorldMap
            world={rightWorld}
            locations={rightLocations}
            imagePath={rightImagePath}
            dimensions={imageDimensions[rightWorld]}
            currentGameLocations={currentGame?.locations || {}}
            currentGame={currentGame}
            isReadOnly={currentGame?.isFinished}
            onLocationClick={handleLocationClick}
            onLocationRightClick={handleRightClick}
            onImageLoad={handleImageLoad(rightWorld)}
            onToggleCheck={handleToggleCheck}
          />
        </div>
      </div>

      {showLocationModal && !currentGame?.isFinished && (
        <LocationModal
          location={selectedLocation}
          locationData={currentGame?.locations[selectedLocation?.id]}
          currentGame={currentGame}
          onClose={() => setShowLocationModal(false)}
          onSave={handleLocationUpdate}
        />
      )}

      <NotesPanel
        currentGame={currentGame}
        onUpdateNotes={handleUpdateGlobalNotes}
        isReadOnly={currentGame?.isFinished}
      />
    </>
  );
};

export default MapView;
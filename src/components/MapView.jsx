// src/components/MapView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LocationButton from './LocationButton';
import LocationModal from './LocationModal';
import NotesPanel from './NotesPanel';
import { mapData } from '../data/mapData';
import { locationResolverService } from '../services/locationResolverService';
import { IMAGE_PATHS } from '../constants/imagePaths';

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
  onToggleCheck,
  onImageLoad
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
                onToggleCheck={onToggleCheck}
                imageDimensions={dimensions}
                isReadOnly={isReadOnly}
                currentGame={currentGame}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
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

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
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

  const handleLocationClick = useCallback((location) => {
    if (currentGame?.isFinished) return;

    const locationData = currentGame?.locations[location.id];
    const isLocationEditable = locationData?.isEditable !== false;

    if (!isLocationEditable) return;

    setSelectedLocation(location);
    setShowLocationModal(true);
  }, [currentGame?.isFinished, currentGame?.locations]);

  const handleLocationUpdate = useCallback((locationIdOrSpecial, completed = false, chestCount = 1) => {
    if (currentGame?.isFinished) return;

    const existingLocationData = currentGame?.locations[selectedLocation.id];
    const isLocationEditable = existingLocationData?.isEditable !== false;

    if (!isLocationEditable) return;

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

    if (locationIdOrSpecial === 4001) {
      locationData = {
        locationId: 4001,
        chestCount: chestCount,
        completed: false,
        isEditable: true
      };
    } else {
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

  const handleUpdateGlobalNotes = useCallback((updatedNotes) => {
    if (currentGame?.isFinished) return;

    setCurrentGame({
      ...currentGame,
      globalNotes: updatedNotes
    });
  }, [currentGame, setCurrentGame]);

  const handleRightClick = useCallback((location) => {
    if (currentGame?.isFinished) return;

    const locationData = currentGame?.locations[location.id];
    const isLocationEditable = locationData?.isEditable !== false;

    if (!isLocationEditable) return;

    if (locationData && locationData.locationId) {
      const resolvedData = locationResolverService.resolveLocationById(locationData.locationId);

      if (resolvedData && resolvedData.type === 'dungeon') {
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

  const handleToggleCheck = useCallback((locationId, checkName) => {
    if (currentGame?.isFinished) return;

    const locationData = currentGame?.locations[locationId] || {};

    // Get the group key for this location
    const groupKey = locationResolverService.getLocationGroupKey(locationData.locationId);
    if (!groupKey) return;

    const currentCheckStatus = currentGame.checkStatus || {};
    const groupCheckStatus = currentCheckStatus[groupKey] || {};

    const newGroupCheckStatus = {
      ...groupCheckStatus,
      [checkName]: !groupCheckStatus[checkName]
    };

    setCurrentGame({
      ...currentGame,
      checkStatus: {
        ...currentCheckStatus,
        [groupKey]: newGroupCheckStatus
      }
    });
  }, [currentGame, setCurrentGame]);
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

  const isInverted = currentGame?.isInverted || false;
  const leftWorld = isInverted ? 'dark' : 'light';
  const rightWorld = isInverted ? 'light' : 'dark';

  const leftLocations = useMemo(() => mapData[leftWorld] || [], [leftWorld]);
  const rightLocations = useMemo(() => mapData[rightWorld] || [], [rightWorld]);

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
            onToggleCheck={handleToggleCheck}
            onImageLoad={handleImageLoad(leftWorld)}
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
            onToggleCheck={handleToggleCheck}
            onImageLoad={handleImageLoad(rightWorld)}
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
// src/components/MapView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LocationButton from './LocationButton';
import LocationModal from './LocationModal';
import NotesPanel from './NotesPanel';
import ItemPanel from './ItemPanel';
import { mapData } from '../data/mapData';
import { locationResolverService } from '../services/locationResolverService';
import { IMAGE_PATHS } from '../constants/imagePaths';
import { getChecksByLocationId } from '../data/checkData';
import { evaluate, getReachableRegions, getSpawnRegions, SPAWN_LOCATION_IDS } from '../logic/logicEngine';
import { modeFromGame } from '../logic/mode';
import { regionOfNode, getNodeAccessRule, setRegionOverrides, getRegionOverrides } from '../logic/nodeRegions';
import { regionOverrideService } from '../services/regionOverrideService';
import RegionEditModal from './RegionEditModal';

// Memoized WorldMap component
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
  onToggleCheck,
  nodeLogicState,
  spawnNodeSet,
  editMode
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
                logicState={nodeLogicState?.[location.id] || null}
                isSpawn={spawnNodeSet?.has(location.id) || false}
                editMode={editMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific things change
  if (prevProps.world !== nextProps.world) return false;
  if (prevProps.dimensions !== nextProps.dimensions) return false;
  if (prevProps.currentGameLocations !== nextProps.currentGameLocations) return false;
  if (prevProps.isReadOnly !== nextProps.isReadOnly) return false;
  if (prevProps.currentGame?.id !== nextProps.currentGame?.id) return false;
  if (prevProps.currentGame?.checkStatus !== nextProps.currentGame?.checkStatus) return false;
  if (prevProps.nodeLogicState !== nextProps.nodeLogicState) return false;
  if (prevProps.spawnNodeSet !== nextProps.spawnNodeSet) return false;
  if (prevProps.editMode !== nextProps.editMode) return false;

  return true; // No changes, skip re-render
});

WorldMap.displayName = 'WorldMap';

const MapView = React.memo(({ currentGame, setCurrentGame }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});
  const [showLogic, setShowLogic] = useState(true);
  const [editRegions, setEditRegions] = useState(false);
  const [editingRegionNode, setEditingRegionNode] = useState(null);
  const [regionVersion, setRegionVersion] = useState(0); // bump to recompute logic after an override change

  // Load saved region overrides into the engine's registry on mount.
  useEffect(() => {
    setRegionOverrides(regionOverrideService.load());
    setRegionVersion(v => v + 1);
  }, []);

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

  // Handle window resize - OPTIMIZED VERSION
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

        setImageDimensions(prev => {
          // Only update if dimensions actually changed
          const prevDims = prev[world];
          if (prevDims &&
              prevDims.width === renderedWidth &&
              prevDims.height === renderedHeight &&
              prevDims.offsetX === offsetX &&
              prevDims.offsetY === offsetY) {
            return prev; // No change, don't trigger re-render
          }

          return {
            ...prev,
            [world]: {
              width: renderedWidth,
              height: renderedHeight,
              offsetX,
              offsetY,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            }
          };
        });
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

  // STABLE CALLBACKS - These don't change unless game ID changes
  const handleLocationClick = useCallback((location) => {
    // Region-edit mode: clicking any node opens its region picker.
    if (editRegions) {
      setEditingRegionNode(location);
      return;
    }

    if (currentGame?.isFinished) return;

    const locationData = currentGame?.locations[location.id];
    const isLocationEditable = locationData?.isEditable !== false;

    if (!isLocationEditable) return;

    setSelectedLocation(location);
    setShowLocationModal(true);
  }, [currentGame?.isFinished, currentGame?.locations, currentGame?.id, editRegions]);

  // --- Region editor handlers ---
  const handleSaveRegion = useCallback((region) => {
    if (!editingRegionNode) return;
    setRegionOverrides(regionOverrideService.set(editingRegionNode.id, region));
    setRegionVersion(v => v + 1);
    setEditingRegionNode(null);
  }, [editingRegionNode]);

  const handleResetRegion = useCallback(() => {
    if (!editingRegionNode) return;
    setRegionOverrides(regionOverrideService.clear(editingRegionNode.id));
    setRegionVersion(v => v + 1);
    setEditingRegionNode(null);
  }, [editingRegionNode]);

  const handleExportRegions = useCallback(() => {
    const json = JSON.stringify(regionOverrideService.effectiveMap(), null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).then(
        () => window.alert('Full node→region map copied to clipboard. Paste it to me to bake in.'),
        () => window.prompt('Copy the node→region map:', json)
      );
    } else {
      window.prompt('Copy the node→region map:', json);
    }
  }, []);

  const handleToggleCheck = useCallback((checkId, isRightClick = false) => {
    if (currentGame?.isFinished) return;

    setCurrentGame(prevGame => {
      const currentStatus = (prevGame?.checkStatus || {})[checkId] || false;
      const newStatus = isRightClick ? false : true;

      if (currentStatus === newStatus) return prevGame;

      return {
        ...prevGame,
        checkStatus: {
          ...(prevGame.checkStatus || {}),
          [checkId]: newStatus
        }
      };
    });
  }, [currentGame?.isFinished, currentGame?.id, setCurrentGame]);

  const handleLocationUpdate = useCallback((locationIdOrSpecial, completed = false) => {
    if (currentGame?.isFinished) return;

    setCurrentGame(prevGame => {
      const existingLocationData = prevGame?.locations[selectedLocation.id];
      const isLocationEditable = existingLocationData?.isEditable !== false;

      if (!isLocationEditable) return prevGame;

      if (locationIdOrSpecial === 'reset') {
        const updatedLocations = { ...prevGame.locations };
        delete updatedLocations[selectedLocation.id];

        return {
          ...prevGame,
          locations: updatedLocations
        };
      }

      const locationData = {
        locationId: locationIdOrSpecial,
        completed: completed || false,
        isEditable: true
      };

      return {
        ...prevGame,
        locations: {
          ...prevGame.locations,
          [selectedLocation.id]: locationData
        }
      };
    });

    setShowLocationModal(false);
    setSelectedLocation(null);
  }, [currentGame?.isFinished, currentGame?.id, selectedLocation, setCurrentGame]);

  const handleUpdateGlobalNotes = useCallback((updatedNotes) => {
    if (currentGame?.isFinished) return;

    setCurrentGame({
      ...currentGame,
      globalNotes: updatedNotes
    });
  }, [currentGame, setCurrentGame]);

  const handleUpdateItems = useCallback((updatedItems) => {
    if (currentGame?.isFinished) return;

    setCurrentGame(prevGame => ({
      ...prevGame,
      items: updatedItems
    }));
  }, [currentGame?.isFinished, setCurrentGame]);

  const handleRightClick = useCallback((location) => {
    if (currentGame?.isFinished) return;

    setCurrentGame(prevGame => {
      const locationData = prevGame?.locations[location.id];

      if (!locationData) {
        return {
          ...prevGame,
          locations: {
            ...prevGame.locations,
            [location.id]: {
              markedUseless: true,
              isEditable: true
            }
          }
        };
      }

      if (locationData.locationId) {
        const resolvedData = locationResolverService.resolveLocationById(locationData.locationId);

        if (resolvedData && resolvedData.type === 'dungeon') {
          return {
            ...prevGame,
            locations: {
              ...prevGame.locations,
              [location.id]: {
                ...locationData,
                completed: !locationData.completed
              }
            }
          };
        }
      }

      return {
        ...prevGame,
        locations: {
          ...prevGame.locations,
          [location.id]: {
            ...locationData,
            markedUseless: !locationData.markedUseless
          }
        }
      };
    });
  }, [currentGame?.isFinished, currentGame?.id, setCurrentGame]);

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

  // STABLE VALUES - These are memoized and only change when game changes
  const isInverted = currentGame?.isInverted || false;
  const leftWorld = isInverted ? 'dark' : 'light';
  const rightWorld = isInverted ? 'light' : 'dark';

  // Memoize locations arrays
  const leftLocations = useMemo(() => mapData[leftWorld] || [], [leftWorld]);
  const rightLocations = useMemo(() => mapData[rightWorld] || [], [rightWorld]);

  // Memoize image paths
  const leftImagePath = useMemo(() => 
    leftWorld === 'light' ? IMAGE_PATHS.LIGHT_WORLD_MAP : IMAGE_PATHS.DARK_WORLD_MAP,
    [leftWorld]
  );
  const rightImagePath = useMemo(() => 
    rightWorld === 'light' ? IMAGE_PATHS.LIGHT_WORLD_MAP : IMAGE_PATHS.DARK_WORLD_MAP,
    [rightWorld]
  );

  // Memoize game locations to prevent reference changes
  const currentGameLocations = useMemo(() =>
    currentGame?.locations || {},
    [currentGame?.locations]
  );

  // --- Logic overlay (Phase 3) ---
  // Spawns are DERIVED from placed spawn locations (Link's House, Sanctuary, …) —
  // no separate "set spawn" step. These node ids just drive the blue outline.
  const spawnNodeSet = useMemo(() => {
    const set = new Set();
    for (const [nodeId, data] of Object.entries(currentGame?.locations || {})) {
      if (SPAWN_LOCATION_IDS.has(data?.locationId)) set.add(Number(nodeId));
    }
    return set;
  }, [currentGame?.locations]);

  const hasSpawn = spawnNodeSet.size > 0;

  // Which overworld regions you can currently reach from your spawns, given items
  // + recorded entrances. This is the primary "where can I go" signal.
  const reachableRegions = useMemo(() => {
    if (!currentGame) return new Set();
    const mode = modeFromGame(currentGame);
    const startRegionIds = getSpawnRegions(currentGame.locations || {});
    return getReachableRegions(currentGame.items || {}, currentGame.locations || {}, mode, startRegionIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame, regionVersion]);

  // Per-check in/out/unknown — used to refine nodes that have an assigned interior.
  const logicByCheck = useMemo(() => {
    if (!currentGame) return {};
    return evaluate(currentGame.items || {}, currentGame.locations || {}, {
      mode: modeFromGame(currentGame),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame, regionVersion]);

  // A node lights up when its region is reachable from spawn ("you can walk here
  // and go check it"). If an interior is assigned, refine to amber when the only
  // remaining checks are item-blocked. Unreachable nodes get no ring.
  const nodeLogicState = useMemo(() => {
    if (!showLogic || !currentGame) return {};
    const checkStatus = currentGame.checkStatus || {};
    const locations = currentGame.locations || {};
    const map = {};
    const items = currentGame.items || {};
    for (const node of [...mapData.light, ...mapData.dark]) {
      if (!reachableRegions.has(regionOfNode(node.id))) continue; // can't get here yet
      const nodeRule = getNodeAccessRule(node.id);
      if (nodeRule && !nodeRule(items)) continue; // gated by a special requirement
      const data = locations[node.id];
      if (data?.markedUseless || data?.locationId === 5001) continue; // user marked as nothing
      const locId = data?.locationId;
      if (!locId) { map[node.id] = 'in'; continue; } // reachable, not yet explored

      let hasIn = false, hasOut = false;
      for (const check of getChecksByLocationId(locId)) {
        if (checkStatus[check.id]) continue; // already collected
        const s = logicByCheck[check.id];
        if (s === 'in') hasIn = true;
        else if (s === 'out') hasOut = true;
      }
      map[node.id] = hasOut && !hasIn ? 'out' : 'in';
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLogic, currentGame, reachableRegions, logicByCheck, regionVersion]);

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
        <div className="flex items-center gap-3 mb-2 text-sm">
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLogic}
              onChange={(e) => setShowLogic(e.target.checked)}
            />
            <span className="text-gray-200">Show logic</span>
          </label>
          {showLogic && (
            <div className="flex items-center gap-3 text-gray-300">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }} /> reachable</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#d97706' }} /> reachable — need item</span>
              <span className="text-gray-500 italic">unlit = can't reach yet · provisional</span>
            </div>
          )}
          {showLogic && !editRegions && (
            hasSpawn ? (
              <span className="text-blue-300" title="Spawn points are where you place Link's House, Sanctuary, etc.">
                {spawnNodeSet.size} spawn{spawnNodeSet.size === 1 ? '' : 's'} (blue outline)
              </span>
            ) : (
              <span className="text-amber-300">Place Link's House / Sanctuary to set a spawn</span>
            )
          )}
          <div className="flex items-center gap-2 ml-auto">
            {editRegions && (
              <span className="text-blue-300 italic">Click a tile to set its region</span>
            )}
            <button
              onClick={() => setEditRegions(e => !e)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                editRegions ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              title="Reassign which logic region a tile belongs to"
            >
              {editRegions ? 'Done editing regions' : 'Edit regions'}
            </button>
            <button
              onClick={handleExportRegions}
              className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-200 hover:bg-gray-600"
              title="Copy the full node→region map (with your edits) as JSON to bake into the code"
            >
              Export regions
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <WorldMap
            world={leftWorld}
            locations={leftLocations}
            imagePath={leftImagePath}
            dimensions={imageDimensions[leftWorld]}
            currentGameLocations={currentGameLocations}
            currentGame={currentGame}
            isReadOnly={currentGame?.isFinished}
            onLocationClick={handleLocationClick}
            onLocationRightClick={handleRightClick}
            onImageLoad={handleImageLoad(leftWorld)}
            onToggleCheck={handleToggleCheck}
            nodeLogicState={nodeLogicState}
            spawnNodeSet={spawnNodeSet}
            editMode={editRegions}
          />
          <WorldMap
            world={rightWorld}
            locations={rightLocations}
            imagePath={rightImagePath}
            dimensions={imageDimensions[rightWorld]}
            currentGameLocations={currentGameLocations}
            currentGame={currentGame}
            isReadOnly={currentGame?.isFinished}
            onLocationClick={handleLocationClick}
            onLocationRightClick={handleRightClick}
            onImageLoad={handleImageLoad(rightWorld)}
            onToggleCheck={handleToggleCheck}
            nodeLogicState={nodeLogicState}
            spawnNodeSet={spawnNodeSet}
            editMode={editRegions}
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

      {editingRegionNode && (
        <RegionEditModal
          node={editingRegionNode}
          currentRegion={regionOfNode(editingRegionNode.id)}
          isOverridden={editingRegionNode.id in getRegionOverrides()}
          onSave={handleSaveRegion}
          onReset={handleResetRegion}
          onClose={() => setEditingRegionNode(null)}
        />
      )}

      <NotesPanel
        currentGame={currentGame}
        onUpdateNotes={handleUpdateGlobalNotes}
        isReadOnly={currentGame?.isFinished}
      />

      <ItemPanel
        currentGame={currentGame}
        onUpdateItems={handleUpdateItems}
        isReadOnly={currentGame?.isFinished}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // MapView only re-renders if game actually changes
  return prevProps.currentGame === nextProps.currentGame &&
         prevProps.setCurrentGame === nextProps.setCurrentGame;
});

MapView.displayName = 'MapView';

export default MapView;
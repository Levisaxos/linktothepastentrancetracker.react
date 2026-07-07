import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { itemData, getItemIconFile, itemIconSrc } from '../data/itemData';
import { itemStateService } from '../services/itemStateService';

const GROUPS = [
  { key: 'equipment', label: 'Items' },
  { key: 'movement', label: 'Movement' },
  { key: 'other', label: 'Other' },
];
const GROUP_KEYS = GROUPS.map((g) => g.key);

// A single clickable item icon. Left-click steps up, right-click steps down.
const ItemCell = ({ item, count, isReadOnly, onStep }) => {
  const owned = count > 0;
  const iconFile = getItemIconFile(item, count);
  const showBadge = (item.type === 'count' || item.type === 'progressive') && count > 0;

  return (
    <button
      type="button"
      disabled={isReadOnly}
      onClick={() => !isReadOnly && onStep(item.id, 'up')}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!isReadOnly) onStep(item.id, 'down');
      }}
      title={`${item.label}${item.max > 1 ? ` (${count}/${item.max})` : ''}`}
      className={`relative flex items-center justify-center w-11 h-11 rounded transition-all ${
        owned ? 'bg-gray-700' : 'bg-gray-800'
      } ${isReadOnly ? 'cursor-default' : 'hover:bg-gray-600 cursor-pointer'}`}
    >
      <img
        src={itemIconSrc(iconFile)}
        alt={item.label}
        draggable={false}
        className={`max-w-[32px] max-h-[32px] object-contain transition-all ${
          owned ? 'opacity-100' : 'opacity-30 grayscale'
        }`}
      />
      {showBadge && (
        <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-[10px] leading-none px-1 py-0.5 rounded">
          {count}
        </span>
      )}
    </button>
  );
};

const ItemPanel = ({ currentGame, onUpdateItems, isReadOnly = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef(null);

  // Collapse when the user clicks anywhere outside the panel.
  useEffect(() => {
    if (!isExpanded) return;
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsExpanded(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isExpanded]);

  const items = useMemo(() => currentGame?.items || {}, [currentGame?.items]);

  const ownedCount = useMemo(
    () =>
      itemData.reduce(
        (n, item) =>
          GROUP_KEYS.includes(item.group) && itemStateService.has(items, item.id) ? n + 1 : n,
        0
      ),
    [items]
  );

  const handleStep = (id, dir) => {
    const next =
      dir === 'up'
        ? itemStateService.increment(items, id)
        : itemStateService.decrement(items, id);
    onUpdateItems(next);
  };

  if (!currentGame) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed bottom-0 left-4 bg-gray-800 border border-gray-700 rounded-t-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}
    >
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-t-lg transition-colors"
          title="Open item tracker"
        >
          <ChevronUp size={16} />
          <span className="text-sm font-medium">Items</span>
          {ownedCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
              {ownedCount}
            </span>
          )}
        </button>
      )}

      {isExpanded && (
        <div className="w-80 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h4 className="font-semibold text-white">Items</h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Collapse items"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {isReadOnly && (
              <p className="text-xs text-amber-300">Read-only — game is finished.</p>
            )}
            {GROUPS.map((group) => {
              const groupItems = itemData.filter((i) => i.group === group.key);
              if (groupItems.length === 0) return null;
              return (
                <div key={group.key}>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {groupItems.map((item) => (
                      <ItemCell
                        key={item.id}
                        item={item}
                        count={itemStateService.getCount(items, item.id)}
                        isReadOnly={isReadOnly}
                        onStep={handleStep}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="text-[11px] text-gray-500 pt-1">
              Left-click to add, right-click to remove.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ItemPanel, (prevProps, nextProps) => {
  if (prevProps.currentGame?.id !== nextProps.currentGame?.id) return false;
  if (prevProps.currentGame?.items !== nextProps.currentGame?.items) return false;
  if (prevProps.isReadOnly !== nextProps.isReadOnly) return false;
  return true;
});

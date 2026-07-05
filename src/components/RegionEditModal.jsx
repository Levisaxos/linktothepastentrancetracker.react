import React, { useState } from 'react';
import { regionData } from '../logic/regions';

// Lets the user re-assign one map node to a different logic region. Grouped by
// world so the ~50 AP region names are easy to scan.
const RegionEditModal = ({ node, currentRegion, isOverridden, onSave, onReset, onClose }) => {
  const [selected, setSelected] = useState(currentRegion || '');

  const lightRegions = regionData.filter((r) => r.world === 'light');
  const darkRegions = regionData.filter((r) => r.world === 'dark');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-96 max-w-[90vw] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <h4 className="font-semibold text-white">Set region</h4>
          <p className="text-sm text-gray-400">
            {node.name} <span className="text-gray-500">(#{node.id})</span>
          </p>
        </div>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-sm text-gray-100 mb-1"
        >
          <optgroup label="Light World">
            {lightRegions.map((r) => (
              <option key={r.id} value={r.id}>{r.id}</option>
            ))}
          </optgroup>
          <optgroup label="Dark World">
            {darkRegions.map((r) => (
              <option key={r.id} value={r.id}>{r.id}</option>
            ))}
          </optgroup>
        </select>
        <p className="text-xs text-gray-500 mb-4">
          {isOverridden ? 'Overridden from the baked default.' : 'Currently the baked default.'}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            disabled={!isOverridden}
            className={`text-xs px-2 py-1 rounded ${
              isOverridden ? 'text-amber-300 hover:bg-gray-700' : 'text-gray-600 cursor-default'
            }`}
            title="Remove the override and use the baked default"
          >
            Reset to default
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm px-3 py-1 rounded text-gray-300 hover:bg-gray-700">
              Cancel
            </button>
            <button
              onClick={() => onSave(selected)}
              disabled={!selected}
              className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionEditModal;

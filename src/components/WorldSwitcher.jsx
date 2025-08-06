import React from 'react';

const WorldSwitcher = ({ currentWorld, setCurrentWorld }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center space-x-4">
        <span className="text-gray-400">World:</span>
        <button
          onClick={() => setCurrentWorld('light')}
          className={`px-4 py-2 rounded ${currentWorld === 'light' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Light World
        </button>
        <button
          onClick={() => setCurrentWorld('dark')}
          className={`px-4 py-2 rounded ${currentWorld === 'dark' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Dark World
        </button>
      </div>
    </div>
  );
};

export default WorldSwitcher;
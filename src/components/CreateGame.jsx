// src/components/CreateGame.jsx
import React, { useState } from 'react';

const CreateGame = ({ onCreateGame, onCancel }) => {
  const [gameName, setGameName] = useState('');
  const [randomizerType, setRandomizerType] = useState('Vanilla');
  const [isInverted, setIsInverted] = useState(false);

  const randomizerOptions = [
    'Vanilla',
    'Dungeons Simple',
    'Dungeons Full',
    'Dungeons Crossed',
    'Simple',
    'Restricted',
    'Full',
    'Crossed'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameName.trim()) {
      onCreateGame({
        name: gameName.trim(),
        randomizerType,
        isInverted
      });
    }
  };

  const toggleInverted = () => {
    setIsInverted(!isInverted);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Create New Game</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gameName" className="block text-sm font-medium mb-2">
              Game Name
            </label>
            <input
              type="text"
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="randomizerType" className="block text-sm font-medium mb-2">
              Randomizer Type
            </label>
            <select
              id="randomizerType"
              value={randomizerType}
              onChange={(e) => setRandomizerType(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {randomizerOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              World Type
            </label>
            <button
              type="button"
              onClick={toggleInverted}
              className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                isInverted 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isInverted ? 'Inverted' : 'Normal'}
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
            >
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGame;
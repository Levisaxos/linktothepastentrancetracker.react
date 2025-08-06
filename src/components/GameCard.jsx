// src/components/GameCard.jsx
import React from 'react';
import { Archive, RotateCcw } from 'lucide-react';

const GameCard = ({ game, onLoadGame, onDeleteGame, onToggleFinished }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleToggleFinished = () => {
    const action = game.isFinished ? 'reactivate' : 'finish';
    const message = game.isFinished 
      ? 'Are you sure you want to reactivate this game? It will become editable again.'
      : 'Are you sure you want to mark this game as finished? It will become read-only.';
    
    if (window.confirm(message)) {
      onToggleFinished(game.id);
    }
  };

  return (
    <div className={`border rounded-lg p-4 hover:border-gray-600 transition-colors ${
      game.isFinished 
        ? 'bg-gray-700 border-gray-600' 
        : 'bg-gray-800 border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-white">{game.name}</h3>
          {game.isFinished && (
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
              Finished
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFinished}
            className={`text-sm px-2 py-1 rounded transition-colors ${
              game.isFinished
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900'
                : 'text-green-400 hover:text-green-300 hover:bg-green-900'
            }`}
            title={game.isFinished ? 'Reactivate game' : 'Mark as finished'}
          >
            {game.isFinished ? <RotateCcw size={16} /> : <Archive size={16} />}
          </button>
          <button
            onClick={() => onDeleteGame(game.id)}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-gray-400 text-sm">
          Type: <span className="text-white">{game.randomizerType || 'Vanilla'}</span>
        </p>
        <p className="text-gray-400 text-sm">
          World: <span className={`${game.isInverted ? 'text-purple-400' : 'text-yellow-400'}`}>
            {game.isInverted ? 'Inverted' : 'Normal'}
          </span>
        </p>
        <p className="text-gray-400 text-sm">
          Created: {new Date(game.created).toLocaleDateString()}
        </p>
        {game.isFinished ? (
          <p className="text-gray-400 text-sm">
            Finished: <span className="text-green-400">
              {game.finishedDate ? new Date(game.finishedDate).toLocaleDateString() : 'Unknown'}
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            Last Saved: <span className="text-green-400">            
              {game.lastSaved ? formatDate(game.lastSaved) : 'Never'}
            </span>
          </p>
        )}
      </div>
      
      <button
        onClick={() => onLoadGame(game)}
        className={`w-full py-2 rounded transition-colors ${
          game.isFinished
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {game.isFinished ? 'View Game' : 'Load Game'}
      </button>
    </div>
  );
};

export default GameCard;
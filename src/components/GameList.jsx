// src/components/GameList.jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import GameCard from './GameCard';
import { gameService } from '../services/gameService';

const GameList = ({ games, onCreateGame, onLoadGame, onDeleteGame, onToggleFinished }) => {
  const [showFinished, setShowFinished] = useState(false);

  const sortedGames = gameService.sortGames(games, showFinished);
  const activeCount = games.filter(g => !g.isFinished).length;
  const finishedCount = games.filter(g => g.isFinished).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Your Games</h2>

          {/* Toggle between active and finished games */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setShowFinished(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!showFinished
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
                }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setShowFinished(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${showFinished
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:text-white'
                }`}
            >
              Finished ({finishedCount})
            </button>
          </div>
        </div>

        {!showFinished && (
          <button
            onClick={onCreateGame}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>New Game</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onLoadGame={onLoadGame}
            onDeleteGame={onDeleteGame}
            onToggleFinished={onToggleFinished}
          />
        ))}
      </div>

      {sortedGames.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          {showFinished ? (
            <p>No finished games yet. Complete some games to see them here!</p>
          ) : (
            <p>No active games. Create your first game to get started!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(GameList, (prevProps, nextProps) => {
  if (prevProps.games !== nextProps.games) return false;

  return true;
});
// src/components/Header.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, StickyNote } from 'lucide-react';
import { exportImportService } from '../services/exportImportService';
import { gameService } from '../services/gameService';

const Header = ({ currentView, currentGame, onBackToGames, games, onImportGames }) => {
  const fileInputRef = useRef(null);
  const [lastExported, setLastExported] = useState(null);

  useEffect(() => {
    setLastExported(gameService.getLastExported());
  }, []);

  const handleExportGames = () => {
    const success = exportImportService.exportGamesToFile(games);
    if (success) {
      setLastExported(new Date().toISOString());
    } else {
      alert('Failed to export games. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedData = await exportImportService.importGamesFromFile(file);

      const confirmMessage = `Found ${importedData.games.length} games in backup file.\n` +
        `Export date: ${new Date(importedData.exportDate).toLocaleDateString()}\n\n` +
        `This will replace your current games. Continue?`;

      if (window.confirm(confirmMessage)) {
        onImportGames(importedData.games);
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }

    // Reset file input
    event.target.value = '';
  };

  const formatLastExported = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get progress stats for current game
  const getProgressStats = () => {
    if (!currentGame || currentView !== 'tracker') return null;
    return gameService.getProgressStats(currentGame);
  };

  const progressStats = getProgressStats();

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {(currentView === 'tracker' || currentView === 'create') && (
            <button
              onClick={onBackToGames}
              className="text-blue-400 hover:text-blue-300"
            >
              ← Back to Games
            </button>
          )}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white">
              {currentView === 'games' ? 'Link to the Past Tracker' :
                currentView === 'create' ? 'Create New Game' :
                  currentGame?.name}
            </h1>
            {currentView === 'tracker' && currentGame && (
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">|</span>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="bg-blue-600 px-2 py-1 rounded text-white">
                    {currentGame.randomizerType || 'Vanilla'}
                  </span>
                  <span className={`px-2 py-1 rounded text-white ${currentGame.isInverted ? 'bg-purple-600' : 'bg-yellow-600'
                    }`}>
                    {currentGame.isInverted ? 'Inverted' : 'Normal'}
                  </span>
                  {progressStats && (
                    <span className="bg-green-600 px-2 py-1 rounded text-white">
                      {progressStats.marked}/{progressStats.total} ({progressStats.percentageComplete}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last exported: {formatLastExported(lastExported)}
          </div>

          <div className="flex items-center space-x-2">
            {games && games.length > 0 && (
              <button
                onClick={handleExportGames}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded transition-colors text-sm"
                title="Export games to file"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            )}
            <button
              onClick={handleImportClick}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors text-sm"
              title="Import games from file"
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for import functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default Header;
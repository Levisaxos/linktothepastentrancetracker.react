import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import GameList from './GameList';
import CreateGame from './CreateGame';
import MapView from './MapView';
import { gameService } from '../services/gameService';

const GameTracker = () => {
  const [currentView, setCurrentView] = useState('games'); // 'games', 'create', or 'tracker'
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    setGames(gameService.loadGames());
  }, []);

  // Auto-save function that doesn't depend on stale closures
  // Auto-save function that doesn't depend on stale closures
  const autoSaveGame = useCallback((gameToSave) => {
    if (!gameToSave || gameToSave.isFinished) return;

    const updatedGame = gameService.updateGameLastSaved(gameToSave);
    setGames(prevGames => {
      const updatedGames = prevGames.map(g =>
        g.id === gameToSave.id ? updatedGame : g
      );
      gameService.saveGames(updatedGames);
      return updatedGames;
    });
  }, []);

  useEffect(() => {
    document.title = 'Link to the Past Tracker';
  }, []);

  // Single auto-save effect that watches for any game changes
  const previousGameRef = useRef(null);

  useEffect(() => {
    // Only auto-save if we're in tracker view and game isn't finished
    if (!currentGame || currentView !== 'tracker' || currentGame.isFinished) {
      previousGameRef.current = null;
      return;
    }

    // Skip the very first render (when game is initially loaded)
    if (previousGameRef.current === null) {
      previousGameRef.current = JSON.stringify({
        checkStatus: currentGame.checkStatus,
        locations: currentGame.locations,
        globalNotes: currentGame.globalNotes
      });
      return;
    }

    // Check if anything actually changed
    const currentData = JSON.stringify({
      checkStatus: currentGame.checkStatus,
      locations: currentGame.locations,
      globalNotes: currentGame.globalNotes
    });

    if (previousGameRef.current !== currentData) {
      previousGameRef.current = currentData;
      autoSaveGame(currentGame);
    }
  }, [currentGame, currentView, autoSaveGame]);

  const handleCreateGame = (gameData) => {
    const newGame = gameService.createGame(gameData);
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    gameService.saveGames(updatedGames);
    setCurrentView('games');
  };

  const handleLoadGame = (game) => {
    setCurrentGame(game);
    setCurrentView('tracker');
  };

  const handleDeleteGame = (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      const updatedGames = games.filter(g => g.id !== gameId);
      setGames(updatedGames);
      gameService.saveGames(updatedGames);
    }
  };

  const handleToggleFinished = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const updatedGame = game.isFinished
      ? gameService.markGameActive(game)
      : gameService.markGameFinished(game);

    const updatedGames = games.map(g =>
      g.id === gameId ? updatedGame : g
    );

    setGames(updatedGames);
    gameService.saveGames(updatedGames);

    // If we're currently viewing this game and it was just finished, show read-only message
    if (currentGame && currentGame.id === gameId && !game.isFinished) {
      setCurrentGame(updatedGame);
    }
  };

  const handleImportGames = (importedGames) => {
    // Update game IDs to prevent conflicts with existing games
    const maxExistingId = games.length > 0 ? Math.max(...games.map(g => g.id)) : 0;
    const gamesWithNewIds = importedGames.map((game, index) => ({
      ...game,
      id: maxExistingId + index + 1
    }));

    setGames(gamesWithNewIds);
    gameService.saveGames(gamesWithNewIds);
  };

  const handleBackToGames = () => {
    setCurrentView('games');
    setCurrentGame(null);
  };

  const handleShowCreateGame = () => {
    setCurrentView('create');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header
        currentView={currentView}
        currentGame={currentGame}
        games={games}
        onBackToGames={handleBackToGames}
        onImportGames={handleImportGames}
      />

      {currentView === 'games' && (
        <GameList
          games={games}
          onCreateGame={handleShowCreateGame}
          onLoadGame={handleLoadGame}
          onDeleteGame={handleDeleteGame}
          onToggleFinished={handleToggleFinished}
        />
      )}

      {currentView === 'create' && (
        <CreateGame
          onCreateGame={handleCreateGame}
          onCancel={handleBackToGames}
        />
      )}

      {currentView === 'tracker' && (
        <MapView
          currentGame={currentGame}
          setCurrentGame={setCurrentGame}
        />
      )}
    </div>
  );
};

export default GameTracker;
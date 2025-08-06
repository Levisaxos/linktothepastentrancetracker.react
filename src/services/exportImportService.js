// src/services/exportImportService.js
import { gameService } from './gameService';

export const exportImportService = {
  exportGamesToFile: (games) => {
    try {
      const dataToExport = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        games: games
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `zelda-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Update last export timestamp
      gameService.setLastExported();
      
      return true;
    } catch (error) {
      console.error('Error exporting games:', error);
      return false;
    }
  },

  importGamesFromFile: (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate the imported data structure
            if (!importedData.games || !Array.isArray(importedData.games)) {
              reject(new Error('Invalid file format: missing games array'));
              return;
            }

            // Validate each game object has required properties
            const validGames = importedData.games.filter(game => 
              game.id && 
              game.name && 
              game.created &&
              typeof game.locations === 'object'
            );

            if (validGames.length === 0) {
              reject(new Error('No valid games found in file'));
              return;
            }

            resolve({
              games: validGames,
              version: importedData.version || 'unknown',
              exportDate: importedData.exportDate
            });
          } catch (parseError) {
            reject(new Error('Invalid JSON file'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  },

  validateGameData: (game) => {
    const requiredFields = ['id', 'name', 'created'];
    return requiredFields.every(field => game.hasOwnProperty(field)) &&
           typeof game.locations === 'object';
  }
};
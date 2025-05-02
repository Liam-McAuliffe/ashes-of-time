import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  saveGame, 
  loadGame, 
  getAllSaves, 
  getSaveMetadata, 
  autoSaveGame, 
  deleteSave, 
  renameSave,
  SaveMetadata,
  getGameSettings,
  saveGameSettings,
  updateDifficulty,
  DifficultyLevel
} from '../services/saveManager';
import { RootState } from '../store/store';
import { loadGameState } from '../store/slices/gameSlice';

/**
 * Hook to manage game saves and game settings
 * 
 * @returns SaveManager functions and state
 */
export function useSaveManager() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Load the list of saves
  const refreshSaves = useCallback(() => {
    try {
      const allSaves = getAllSaves();
      setSaves(allSaves);
      return allSaves;
    } catch (error) {
      console.error('Failed to refresh saves:', error);
      setErrorMessage('Failed to load saved games list.');
      return [];
    }
  }, []);
  
  // Load saves on mount
  useEffect(() => {
    refreshSaves();
  }, [refreshSaves]);
  
  // Save game to a specific slot
  const saveToSlot = useCallback((slot: number, name?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const success = saveGame(gameState, slot, name);
      if (success) {
        setLastSaveTime(new Date());
        refreshSaves();
      } else {
        setErrorMessage('Failed to save game.');
      }
      
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('Error saving game:', error);
      setErrorMessage('An error occurred while saving the game.');
      setIsLoading(false);
      return false;
    }
  }, [gameState, refreshSaves]);
  
  // Load game from a specific slot
  const loadFromSlot = useCallback((slot: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const loadedGameState = loadGame(slot);
      if (loadedGameState) {
        dispatch(loadGameState(loadedGameState));
        setIsLoading(false);
        return true;
      } else {
        setErrorMessage('Failed to load game. Save file may be corrupted or missing.');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error loading game:', error);
      setErrorMessage('An error occurred while loading the game.');
      setIsLoading(false);
      return false;
    }
  }, [dispatch]);
  
  // Auto-save functionality
  const performAutoSave = useCallback(() => {
    if (!gameState.isLoading && gameState.day > 1 && !gameState.isGameOver) {
      try {
        const success = autoSaveGame(gameState);
        if (success) {
          setLastSaveTime(new Date());
          // Optionally refresh saves, but might not be needed for auto-saves
          // refreshSaves();
        }
        return success;
      } catch (error) {
        console.error('Auto-save failed:', error);
        return false;
      }
    }
    return false;
  }, [gameState]);
  
  // Auto-save timer
  useEffect(() => {
    const settings = getGameSettings();
    if (!settings.autoSaveEnabled) return;
    
    // Auto-save every 5 minutes if enabled
    const autoSaveInterval = setInterval(() => {
      if (gameState.day > 1 && !gameState.isLoading && !gameState.isGameOver) {
        performAutoSave();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(autoSaveInterval);
  }, [gameState, performAutoSave]);
  
  // Delete a save
  const deleteSaveSlot = useCallback((slot: number) => {
    try {
      const success = deleteSave(slot);
      if (success) {
        refreshSaves();
      }
      return success;
    } catch (error) {
      console.error('Failed to delete save:', error);
      setErrorMessage('Failed to delete save game.');
      return false;
    }
  }, [refreshSaves]);
  
  // Rename a save
  const renameSaveSlot = useCallback((slot: number, newName: string) => {
    try {
      const success = renameSave(slot, newName);
      if (success) {
        refreshSaves();
      }
      return success;
    } catch (error) {
      console.error('Failed to rename save:', error);
      setErrorMessage('Failed to rename save game.');
      return false;
    }
  }, [refreshSaves]);
  
  // Get metadata for a specific save
  const getSaveInfo = useCallback((slot: number) => {
    return getSaveMetadata(slot);
  }, []);
  
  // Check if we have saves
  const hasSaves = saves.length > 0;
  
  // Get the newest save
  const newestSave = saves.length > 0 ? saves[0] : null;
  
  // Check if a specific slot has a save
  const hasSaveInSlot = useCallback((slot: number) => {
    return saves.some(save => save.slot === slot);
  }, [saves]);
  
  // Change the game difficulty
  const changeDifficulty = useCallback((level: DifficultyLevel) => {
    return updateDifficulty(level);
  }, []);
  
  return {
    // Actions
    saveToSlot,
    loadFromSlot,
    performAutoSave,
    deleteSaveSlot,
    renameSaveSlot,
    refreshSaves,
    getSaveInfo,
    changeDifficulty,
    
    // State
    saves,
    isLoading,
    errorMessage,
    lastSaveTime,
    hasSaves,
    newestSave,
    hasSaveInSlot,
    
    // Utility function
    getGameSettings,
    saveGameSettings
  };
} 
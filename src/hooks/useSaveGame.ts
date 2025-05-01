import { useCallback, useEffect } from 'react';
import { GameState } from '../types/game';

export function useSaveGame(state: GameState, dispatch: React.Dispatch<any>) {
  // Save game state to localStorage
  const saveGame = useCallback(() => {
    try {
      localStorage.setItem('ashes-of-time-save', JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
      console.log('Game saved');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, [state]);

  // Load saved game state from localStorage
  const loadGame = useCallback(() => {
    try {
      const savedGame = localStorage.getItem('ashes-of-time-save');
      if (savedGame) {
        const parsedGame = JSON.parse(savedGame);
        dispatch({ type: 'LOAD_GAME', payload: parsedGame });
        return true;
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
    return false;
  }, [dispatch]);

  // Delete saved game
  const resetGame = useCallback(() => {
    try {
      localStorage.removeItem('ashes-of-time-save');
      console.log('Game reset');
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  }, []);

  // Auto-save every time state changes (but not too frequently)
  useEffect(() => {
    if (!state.isLoading && state.day > 1) {
      const debounceTimer = setTimeout(() => {
        saveGame();
      }, 1000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [state, saveGame]);

  return { saveGame, loadGame, resetGame };
} 
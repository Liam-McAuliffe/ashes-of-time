import { generateSecureGameId } from '../utils/security';
import { GameState } from '../types/game';

// Prefix for all keys stored in localStorage
const STORAGE_PREFIX = 'ashes_of_time_';

// Key for storing the current game token
const GAME_TOKEN_KEY = `${STORAGE_PREFIX}game_token`;

/**
 * Authentication service that manages game saves and session tokens
 * Uses localStorage for persistence
 * 
 * Does not require full user login but provides a secure way to identify 
 * and protect saved games with an anonymous token
 */

/**
 * Initialize a secure anonymous session for the player
 * Creates a secure token if one doesn't exist yet
 * 
 * @returns The session token
 */
export const initSession = (): string => {
  try {
    // Check if we already have a token
    const existingToken = localStorage.getItem(GAME_TOKEN_KEY);
    
    if (existingToken) {
      return existingToken;
    }
    
    // Generate a new secure token
    const newToken = generateSecureGameId();
    localStorage.setItem(GAME_TOKEN_KEY, newToken);
    
    return newToken;
  } catch (error) {
    console.error('Failed to initialize session:', error);
    // Return a temporary in-memory token
    return `temp_${Math.random().toString(36).substring(2)}`;
  }
};

/**
 * Check if the current session is valid
 * 
 * @returns Boolean indicating if the session is valid
 */
export const hasValidSession = (): boolean => {
  try {
    return !!localStorage.getItem(GAME_TOKEN_KEY);
  } catch {
    return false;
  }
};

/**
 * Save the current game state with secure token
 * 
 * @param gameState - The game state to save
 * @param saveSlot - Optional slot number for multiple saves
 * @returns Success status of the save operation
 */
export const saveGame = (gameState: GameState, saveSlot: number = 1): boolean => {
  try {
    const token = initSession();
    const saveKey = `${STORAGE_PREFIX}save_${saveSlot}_${token}`;
    
    // Store the game state
    localStorage.setItem(saveKey, JSON.stringify({
      timestamp: Date.now(),
      gameState
    }));
    
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

/**
 * Load a saved game state using the secure token
 * 
 * @param saveSlot - Optional slot number to load from
 * @returns The saved game state or null if not found
 */
export const loadGame = (saveSlot: number = 1): GameState | null => {
  try {
    const token = localStorage.getItem(GAME_TOKEN_KEY);
    if (!token) return null;
    
    const saveKey = `${STORAGE_PREFIX}save_${saveSlot}_${token}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (!savedData) return null;
    
    const { gameState } = JSON.parse(savedData);
    return gameState;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

/**
 * Get a list of all saved games for the current session
 * 
 * @returns Array of save info objects
 */
export const getSavedGames = (): Array<{ slot: number, timestamp: number, day: number }> => {
  try {
    const token = localStorage.getItem(GAME_TOKEN_KEY);
    if (!token) return [];
    
    const savedGames = [];
    
    // Check all possible save slots (1-10)
    for (let slot = 1; slot <= 10; slot++) {
      const saveKey = `${STORAGE_PREFIX}save_${slot}_${token}`;
      const savedData = localStorage.getItem(saveKey);
      
      if (savedData) {
        const { timestamp, gameState } = JSON.parse(savedData);
        savedGames.push({
          slot,
          timestamp,
          day: gameState.day
        });
      }
    }
    
    return savedGames;
  } catch (error) {
    console.error('Failed to get saved games:', error);
    return [];
  }
};

/**
 * Delete a saved game
 * 
 * @param saveSlot - The slot number to delete
 * @returns Success status of the deletion
 */
export const deleteSavedGame = (saveSlot: number): boolean => {
  try {
    const token = localStorage.getItem(GAME_TOKEN_KEY);
    if (!token) return false;
    
    const saveKey = `${STORAGE_PREFIX}save_${saveSlot}_${token}`;
    localStorage.removeItem(saveKey);
    
    return true;
  } catch (error) {
    console.error('Failed to delete saved game:', error);
    return false;
  }
};

/**
 * Clear all saved game data and session information
 * 
 * @returns Success status of the clear operation
 */
export const clearAllData = (): boolean => {
  try {
    const token = localStorage.getItem(GAME_TOKEN_KEY);
    if (token) {
      // Remove all saves associated with this token
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(token)) {
          localStorage.removeItem(key);
        }
      }
    }
    
    // Remove the token itself
    localStorage.removeItem(GAME_TOKEN_KEY);
    
    return true;
  } catch (error) {
    console.error('Failed to clear all data:', error);
    return false;
  }
}; 
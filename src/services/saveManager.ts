import { GameState } from '../types/game';
import { generateSecureGameId } from '../utils/security';
import { createResourceError } from '../utils/errorHandler';

// Constants for save system
const STORAGE_PREFIX = 'ashes_of_time_';
const MAX_SAVE_SLOTS = 10;
const SAVE_VERSION = 1; // Increment when save format changes
const AUTO_SAVE_SLOT = 0;
const SAVE_SCHEMA_KEY = `${STORAGE_PREFIX}save_schema_version`;
const GAME_TOKEN_KEY = `${STORAGE_PREFIX}game_token`;
const GAME_SETTINGS_KEY = `${STORAGE_PREFIX}game_settings`;

// Default difficulty settings
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'apocalypse' | 'custom';

export interface DifficultySettings {
  level: DifficultyLevel;
  resourceMultiplier: number;  // How much resources are gathered (higher = more)
  consumptionRate: number;     // How fast resources are consumed (higher = faster)
  eventDifficulty: number;     // How challenging events are (higher = harder)
  healingRate: number;         // How fast HP regenerates (higher = faster)
  adaptiveDifficulty: boolean; // Whether difficulty adjusts based on player performance
}

// Default settings for each difficulty level
export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultySettings> = {
  easy: {
    level: 'easy',
    resourceMultiplier: 1.5,
    consumptionRate: 0.7,
    eventDifficulty: 0.7,
    healingRate: 1.5,
    adaptiveDifficulty: false
  },
  normal: {
    level: 'normal',
    resourceMultiplier: 1.0,
    consumptionRate: 1.0,
    eventDifficulty: 1.0,
    healingRate: 1.0,
    adaptiveDifficulty: false
  },
  hard: {
    level: 'hard',
    resourceMultiplier: 0.7,
    consumptionRate: 1.2,
    eventDifficulty: 1.3,
    healingRate: 0.7,
    adaptiveDifficulty: false
  },
  apocalypse: {
    level: 'apocalypse',
    resourceMultiplier: 0.5,
    consumptionRate: 1.5,
    eventDifficulty: 1.7,
    healingRate: 0.5,
    adaptiveDifficulty: true
  },
  custom: {
    level: 'custom',
    resourceMultiplier: 1.0,
    consumptionRate: 1.0,
    eventDifficulty: 1.0,
    healingRate: 1.0,
    adaptiveDifficulty: false
  }
};

export interface GameSettings {
  difficulty: DifficultySettings;
  autoSaveEnabled: boolean;
  tutorialCompleted: boolean;
  musicVolume: number;
  soundEffectsVolume: number;
}

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: DIFFICULTY_PRESETS.normal,
  autoSaveEnabled: true,
  tutorialCompleted: false,
  musicVolume: 0.5,
  soundEffectsVolume: 0.7
};

// Save metadata interface
export interface SaveMetadata {
  slot: number;
  timestamp: number;
  name: string;
  day: number;
  survivors: number;
  food: number;
  water: number;
  playtime: number;
  version: number;
  difficulty: DifficultyLevel;
  screenshot?: string; // Base64 encoded screenshot of the game state
}

/**
 * Get or initialize the session token
 * @returns The session token
 */
export const getSessionToken = (): string => {
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
 * Gets current game settings or initializes with defaults
 * @returns The current game settings
 */
export const getGameSettings = (): GameSettings => {
  try {
    const settingsJson = localStorage.getItem(GAME_SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
  } catch (error) {
    console.error('Failed to load game settings:', error);
  }
  
  // If no settings or error, initialize with defaults
  saveGameSettings(DEFAULT_GAME_SETTINGS);
  return DEFAULT_GAME_SETTINGS;
};

/**
 * Save game settings
 * @param settings Settings to save
 * @returns Success status
 */
export const saveGameSettings = (settings: GameSettings): boolean => {
  try {
    localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save game settings:', error);
    return false;
  }
};

/**
 * Update the difficulty settings
 * @param level The difficulty level to set
 * @param customSettings Optional custom settings (for custom difficulty)
 * @returns Updated game settings
 */
export const updateDifficulty = (
  level: DifficultyLevel, 
  customSettings?: Partial<DifficultySettings>
): GameSettings => {
  const currentSettings = getGameSettings();
  
  // Get preset for selected level
  let newDifficulty = {...DIFFICULTY_PRESETS[level]};
  
  // If custom and custom settings provided, merge them
  if (level === 'custom' && customSettings) {
    newDifficulty = {...newDifficulty, ...customSettings, level: 'custom'};
  }
  
  // Update settings
  const updatedSettings = {
    ...currentSettings,
    difficulty: newDifficulty
  };
  
  // Save and return
  saveGameSettings(updatedSettings);
  return updatedSettings;
};

/**
 * Generate save metadata from a game state
 * @param gameState The game state
 * @param slot The save slot
 * @param name Optional save name
 * @returns Metadata for the save
 */
export const generateSaveMetadata = (
  gameState: GameState, 
  slot: number,
  name?: string
): SaveMetadata => {
  const settings = getGameSettings();
  
  return {
    slot,
    timestamp: Date.now(),
    name: name || `Day ${gameState.day} - ${new Date().toLocaleDateString()}`,
    day: gameState.day,
    survivors: gameState.survivors.filter(s => s.health > 0).length,
    food: gameState.food,
    water: gameState.water,
    playtime: gameState.playtime || 0, // In seconds, may need to be added to GameState
    version: SAVE_VERSION,
    difficulty: settings.difficulty.level
  };
};

/**
 * Save a game state to the specified slot
 * @param gameState The game state to save
 * @param slot The slot to save to (0 = auto-save)
 * @param name Optional name for the save
 * @returns Success status of the save operation
 */
export const saveGame = (
  gameState: GameState, 
  slot: number = 1,
  name?: string
): boolean => {
  try {
    // Validate slot
    if (slot < 0 || slot > MAX_SAVE_SLOTS) {
      console.error(`Invalid save slot: ${slot}. Must be between 0 and ${MAX_SAVE_SLOTS}`);
      return false;
    }
    
    const token = getSessionToken();
    const saveKey = `${STORAGE_PREFIX}save_${slot}_${token}`;
    const metadata = generateSaveMetadata(gameState, slot, name);
    
    // Store the game state and metadata
    localStorage.setItem(saveKey, JSON.stringify({
      metadata,
      gameState
    }));
    
    // Update the save list
    updateSaveList(metadata);
    
    console.log(`Game saved to slot ${slot}`);
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

/**
 * Auto-save the game
 * @param gameState The game state to save
 * @returns Success status of the auto-save
 */
export const autoSaveGame = (gameState: GameState): boolean => {
  const settings = getGameSettings();
  
  if (!settings.autoSaveEnabled) {
    return false;
  }
  
  return saveGame(gameState, AUTO_SAVE_SLOT, 'Auto-save');
};

/**
 * Load a game state from the specified slot
 * @param slot The slot to load from
 * @returns The loaded game state or null if not found
 */
export const loadGame = (slot: number = 1): GameState | null => {
  try {
    const token = getSessionToken();
    const saveKey = `${STORAGE_PREFIX}save_${slot}_${token}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (!savedData) {
      return null;
    }
    
    const { gameState, metadata } = JSON.parse(savedData);
    
    // Migrate save if version is older
    if (metadata.version < SAVE_VERSION) {
      return migrateSave(gameState, metadata.version);
    }
    
    return gameState;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

/**
 * Get save metadata for a specific slot
 * @param slot The slot to get metadata for
 * @returns The save metadata or null if not found
 */
export const getSaveMetadata = (slot: number): SaveMetadata | null => {
  try {
    const token = getSessionToken();
    const saveKey = `${STORAGE_PREFIX}save_${slot}_${token}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (!savedData) {
      return null;
    }
    
    const { metadata } = JSON.parse(savedData);
    return metadata;
  } catch (error) {
    console.error('Failed to get save metadata:', error);
    return null;
  }
};

/**
 * Get a list of all saved games for the current session
 * @returns Array of save metadata objects
 */
export const getAllSaves = (): SaveMetadata[] => {
  try {
    const token = getSessionToken();
    const savedGames: SaveMetadata[] = [];
    
    // Check all possible save slots
    for (let slot = 0; slot <= MAX_SAVE_SLOTS; slot++) {
      const saveKey = `${STORAGE_PREFIX}save_${slot}_${token}`;
      const savedData = localStorage.getItem(saveKey);
      
      if (savedData) {
        try {
          const { metadata } = JSON.parse(savedData);
          savedGames.push(metadata);
        } catch (e) {
          console.error(`Failed to parse save in slot ${slot}:`, e);
        }
      }
    }
    
    // Sort by timestamp, newest first
    return savedGames.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get saved games:', error);
    return [];
  }
};

/**
 * Update the cached list of saves with a new save metadata
 * @param metadata The metadata to add/update
 */
const updateSaveList = (metadata: SaveMetadata): void => {
  try {
    const saveListKey = `${STORAGE_PREFIX}save_list`;
    let saveList: SaveMetadata[] = [];
    
    // Load existing list
    const existingList = localStorage.getItem(saveListKey);
    if (existingList) {
      saveList = JSON.parse(existingList);
    }
    
    // Update or add metadata
    const existingIndex = saveList.findIndex(save => save.slot === metadata.slot);
    if (existingIndex >= 0) {
      saveList[existingIndex] = metadata;
    } else {
      saveList.push(metadata);
    }
    
    // Sort by timestamp, newest first
    saveList.sort((a, b) => b.timestamp - a.timestamp);
    
    // Save updated list
    localStorage.setItem(saveListKey, JSON.stringify(saveList));
  } catch (error) {
    console.error('Failed to update save list:', error);
  }
};

/**
 * Migrate a save from an older version to the current version
 * @param oldGameState The game state to migrate
 * @param fromVersion The version of the save
 * @returns Migrated game state
 */
const migrateSave = (oldGameState: GameState, fromVersion: number): GameState => {
  // Create a deep copy to avoid modifying the original
  const gameState = JSON.parse(JSON.stringify(oldGameState));
  
  // Version-specific migrations
  if (fromVersion < 1) {
    // Migrate from pre-versioning to version 1
    console.log('Migrating save from pre-versioning to version 1');
    
    // Add any missing fields with default values
    if (gameState.playtime === undefined) {
      gameState.playtime = 0;
    }
    
    if (gameState.theme === undefined) {
      gameState.theme = 'Standard Post-Apocalypse';
    }
    
    if (gameState.eventHistory === undefined) {
      gameState.eventHistory = [];
    }
    
    if (gameState.huntPerformedToday === undefined) {
      gameState.huntPerformedToday = false;
    }
    
    if (gameState.gatherPerformedToday === undefined) {
      gameState.gatherPerformedToday = false;
    }
  }
  
  // Add migrations for future versions here
  
  return gameState;
};

/**
 * Rename a saved game
 * @param slot The slot to rename
 * @param newName The new name for the save
 * @returns Success status of the rename
 */
export const renameSave = (slot: number, newName: string): boolean => {
  try {
    const metadata = getSaveMetadata(slot);
    if (!metadata) {
      return false;
    }
    
    // Update the metadata
    metadata.name = newName;
    
    // Load the save to get the game state
    const gameState = loadGame(slot);
    if (!gameState) {
      return false;
    }
    
    // Save with updated metadata
    return saveGame(gameState, slot, newName);
  } catch (error) {
    console.error('Failed to rename save:', error);
    return false;
  }
};

/**
 * Delete a saved game
 * @param slot The slot to delete
 * @returns Success status of the deletion
 */
export const deleteSave = (slot: number): boolean => {
  try {
    const token = getSessionToken();
    if (!token) return false;
    
    const saveKey = `${STORAGE_PREFIX}save_${slot}_${token}`;
    localStorage.removeItem(saveKey);
    
    // Update the save list
    try {
      const saveListKey = `${STORAGE_PREFIX}save_list`;
      const existingList = localStorage.getItem(saveListKey);
      if (existingList) {
        let saveList: SaveMetadata[] = JSON.parse(existingList);
        saveList = saveList.filter(save => save.slot !== slot);
        localStorage.setItem(saveListKey, JSON.stringify(saveList));
      }
    } catch (e) {
      console.error('Failed to update save list after deletion:', e);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete saved game:', error);
    return false;
  }
};

/**
 * Clear all saved game data
 * @returns Success status of the clear operation
 */
export const clearAllSaves = (): boolean => {
  try {
    const token = getSessionToken();
    if (token) {
      // Remove all saves associated with this token
      for (let slot = 0; slot <= MAX_SAVE_SLOTS; slot++) {
        const saveKey = `${STORAGE_PREFIX}save_${slot}_${token}`;
        localStorage.removeItem(saveKey);
      }
      
      // Clear the save list
      localStorage.removeItem(`${STORAGE_PREFIX}save_list`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear all saves:', error);
    return false;
  }
};

/**
 * Take a screenshot of the current game state
 * @param element The HTML element to screenshot (typically the main game container)
 * @param gameState The current game state
 * @param slot The slot to save the screenshot to
 * @returns A promise that resolves to true if successful
 */
export const takeScreenshot = async (
  element: HTMLElement | null,
  gameState: GameState,
  slot: number
): Promise<boolean> => {
  // This would be implemented with something like html2canvas
  // For now, we'll just return placeholder functionality
  try {
    if (!element) {
      return false;
    }
    
    console.log('Screenshot functionality would capture element:', element);
    
    // Mock screenshot data for now
    const mockScreenshotData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEA...';
    
    // Update metadata with screenshot
    const metadata = getSaveMetadata(slot);
    if (metadata) {
      metadata.screenshot = mockScreenshotData;
      updateSaveList(metadata);
      
      // Re-save the game with updated metadata
      return saveGame(gameState, slot, metadata.name);
    }
    
    return false;
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    return false;
  }
};

/**
 * Updates the adaptive difficulty score based on player performance
 * @param gameState Current game state
 * @returns Updated difficulty settings
 */
export const updateAdaptiveDifficulty = (gameState: GameState): DifficultySettings => {
  const settings = getGameSettings();
  
  // If adaptive difficulty is disabled, return current settings
  if (!settings.difficulty.adaptiveDifficulty) {
    return settings.difficulty;
  }
  
  // Calculate performance metrics
  const { day, survivors, food, water, resources = {} } = gameState;
  let performanceScore = 50; // Start at neutral score (0-100 scale)
  
  // Factors that increase difficulty (player doing well)
  // - High resources relative to day count
  // - High number of survivors
  // - Low number of injured survivors
  
  // Resource abundance (food & water)
  const resourceScore = Math.min(100, (food + water) / Math.max(1, day) * 3);
  performanceScore += (resourceScore - 50) * 0.3;
  
  // Advanced resource abundance
  if (resources && typeof resources === 'object') {
    const medicine = (resources as any).medicine || 0;
    const ammunition = (resources as any).ammunition || 0;
    const advancedResourceScore = Math.min(100, (medicine + ammunition) / Math.max(1, day) * 5);
    performanceScore += (advancedResourceScore - 50) * 0.2;
  }
  
  // Survivor count
  const survivorScore = Math.min(100, survivors.length * 15);
  performanceScore += (survivorScore - 50) * 0.3;
  
  // Health status
  const healthyCount = survivors.filter(s => 
    s.health > 50 && 
    !s.statuses.some(status => 
      ['Injured (Bleeding)', 'Fever', 'Infected Wound', 'Hypothermia'].includes(status)
    )
  ).length;
  const healthScore = Math.min(100, (healthyCount / Math.max(1, survivors.length)) * 100);
  performanceScore += (healthScore - 50) * 0.2;
  
  // Clamp final score between 0-100
  performanceScore = Math.max(0, Math.min(100, performanceScore));
  
  // Update game state with new adaptive difficulty score
  gameState.adaptiveDifficultyScore = performanceScore;
  
  // Only apply changes every 3 days to avoid rapid fluctuations
  if (day % 3 !== 0) {
    return settings.difficulty;
  }
  
  // Calculate difficulty adjustments
  const normalizedScore = (performanceScore - 50) / 50; // Range from -1 to 1
  
  // Copy the current difficulty settings
  const newDifficulty: DifficultySettings = { ...settings.difficulty };
  
  // Apply adaptive changes based on performance (if score > 50, make harder)
  newDifficulty.resourceMultiplier = Math.max(0.5, Math.min(1.5, 
    settings.difficulty.resourceMultiplier * (1 - normalizedScore * 0.1)));
  
  newDifficulty.consumptionRate = Math.max(0.7, Math.min(1.5, 
    settings.difficulty.consumptionRate * (1 + normalizedScore * 0.1)));
  
  newDifficulty.eventDifficulty = Math.max(0.7, Math.min(1.7, 
    settings.difficulty.eventDifficulty * (1 + normalizedScore * 0.15)));
  
  // Save updated difficulty settings
  const updatedSettings = {
    ...settings,
    difficulty: newDifficulty
  };
  
  saveGameSettings(updatedSettings);
  return newDifficulty;
};

/**
 * Initialize resource system for a new game state
 * @param gameState Current game state
 * @param difficultyLevel Difficulty level
 * @returns Game state with initialized resources
 */
export const initializeResources = (gameState: GameState, difficultyLevel: DifficultyLevel): GameState => {
  const difficulty = DIFFICULTY_PRESETS[difficultyLevel];
  const resourceMultiplier = difficulty.resourceMultiplier;
  
  // Initial resource amounts based on difficulty
  const baseResources = {
    food: Math.round(15 * resourceMultiplier),
    water: Math.round(20 * resourceMultiplier),
    medicine: Math.round(5 * resourceMultiplier),
    scrap: Math.round(10 * resourceMultiplier),
    fuel: Math.round(8 * resourceMultiplier),
    ammunition: Math.round(5 * resourceMultiplier),
    tools: 1,
    clothing: 0,
    foodCapacity: 100,
    waterCapacity: 100,
    medicineCapacity: 50,
    scrapCapacity: 100,
    fuelCapacity: 50,
    ammunitionCapacity: 30
  };
  
  // Setup resource dependencies
  const resourceDependencies = {
    // Tools needed for efficient gathering
    gatheringEfficiency: { 
      requirement: 'tools',
      minimumAmount: 1,
      bonusPerUnit: 0.1
    },
    // Clothing for cold resistance
    temperatureResistance: {
      requirement: 'clothing',
      minimumAmount: 1,
      effect: 'reduce_cold_damage'
    }
  };
  
  return {
    ...gameState,
    food: baseResources.food,
    water: baseResources.water,
    resources: baseResources,
    resourceDependencies
  };
}; 
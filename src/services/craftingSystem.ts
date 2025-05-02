import { GameState, ResourceStore } from '../types/game';
import { getGameSettings } from './saveManager';

/**
 * Recipe interface for crafting items
 */
export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: 'tools' | 'medicine' | 'weapons' | 'clothing' | 'utility';
  difficulty: number; // 1-5 scale, affects success chance
  ingredients: {
    [key: string]: number; // Resource key and amount required
  };
  products: {
    [key: string]: number; // Resource key and amount produced
  };
  requiredTools?: string[]; // Tools needed for this recipe
  unlockDay?: number; // Minimum day when this recipe becomes available
}

/**
 * Available crafting recipes in the game
 */
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'basic_tools',
    name: 'Basic Tools',
    description: 'Craft simple tools from scrap metal and wood.',
    category: 'tools',
    difficulty: 1,
    ingredients: {
      scrap: 5
    },
    products: {
      tools: 1
    },
    unlockDay: 1
  },
  {
    id: 'improvised_medicine',
    name: 'Improvised Medicine',
    description: 'Create basic medical supplies from gathered herbs and clean water.',
    category: 'medicine',
    difficulty: 2,
    ingredients: {
      water: 3
    },
    products: {
      medicine: 2
    },
    requiredTools: ['tools'],
    unlockDay: 2
  },
  {
    id: 'basic_clothing',
    name: 'Basic Clothing',
    description: 'Fashion protective clothing from scavenged materials.',
    category: 'clothing',
    difficulty: 2,
    ingredients: {
      scrap: 4
    },
    products: {
      clothing: 1
    },
    requiredTools: ['tools'],
    unlockDay: 3
  },
  {
    id: 'water_filter',
    name: 'Water Filter',
    description: 'Build a filtration system to make contaminated water drinkable.',
    category: 'utility',
    difficulty: 3,
    ingredients: {
      scrap: 8,
      tools: 1
    },
    products: {
      waterCapacity: 20
    },
    unlockDay: 5
  },
  {
    id: 'ammunition_crafting',
    name: 'Ammunition Crafting',
    description: 'Repurpose scrap metal into crude but effective ammunition.',
    category: 'weapons',
    difficulty: 4,
    ingredients: {
      scrap: 6,
      tools: 1
    },
    products: {
      ammunition: 3
    },
    unlockDay: 7
  }
];

/**
 * Check if a recipe is available based on game state
 * 
 * @param recipe The recipe to check
 * @param gameState Current game state
 * @returns Whether the recipe is available
 */
export function isRecipeAvailable(recipe: CraftingRecipe, gameState: GameState): boolean {
  // Check day requirement
  if (recipe.unlockDay && gameState.day < recipe.unlockDay) {
    return false;
  }
  
  // Check for required tools
  if (recipe.requiredTools && recipe.requiredTools.length > 0) {
    const resources = gameState.resources;
    for (const tool of recipe.requiredTools) {
      if (tool === 'tools' && (!resources || resources.tools <= 0)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Check if player has enough resources for a recipe
 * 
 * @param recipe The recipe to check
 * @param resources Current resources
 * @returns Whether the player has enough resources
 */
export function hasEnoughResources(recipe: CraftingRecipe, resources: ResourceStore): boolean {
  for (const [resource, amount] of Object.entries(recipe.ingredients)) {
    // Special case for food/water which are tracked at top level
    if (resource === 'food' && resources.food < amount) {
      return false;
    }
    if (resource === 'water' && resources.water < amount) {
      return false;
    }
    
    // Check all other resources
    if (resources[resource as keyof ResourceStore] < amount) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate success chance for crafting based on difficulty and game settings
 * 
 * @param recipe The recipe being crafted
 * @param gameState Current game state
 * @returns Success probability (0-1)
 */
export function calculateCraftingSuccessChance(recipe: CraftingRecipe, gameState: GameState): number {
  const settings = getGameSettings();
  const baseDifficulty = settings.difficulty.eventDifficulty;
  
  // Base success chance is inversely proportional to recipe difficulty
  let successChance = 1 - ((recipe.difficulty - 1) * 0.15);
  
  // Adjust for game difficulty
  successChance /= baseDifficulty;
  
  // Bonus for having more tools than required
  if (recipe.requiredTools && recipe.requiredTools.includes('tools')) {
    const extraTools = (gameState.resources?.tools || 0) - 1;
    if (extraTools > 0) {
      successChance += extraTools * 0.05; // +5% per extra tool
    }
  }
  
  // Cap between 10% and 95%
  return Math.min(0.95, Math.max(0.1, successChance));
}

/**
 * Attempt to craft an item
 * 
 * @param recipeId ID of the recipe to craft
 * @param gameState Current game state
 * @returns Result of the crafting attempt with updated game state
 */
export function craftItem(recipeId: string, gameState: GameState): { 
  success: boolean; 
  message: string; 
  updatedState: GameState;
} {
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  
  if (!recipe) {
    return {
      success: false,
      message: 'Recipe not found.',
      updatedState: gameState
    };
  }
  
  if (!isRecipeAvailable(recipe, gameState)) {
    return {
      success: false,
      message: 'This recipe is not available yet.',
      updatedState: gameState
    };
  }
  
  if (!hasEnoughResources(recipe, gameState.resources)) {
    return {
      success: false,
      message: 'Not enough resources to craft this item.',
      updatedState: gameState
    };
  }
  
  // Make a deep copy of the game state
  const updatedState = JSON.parse(JSON.stringify(gameState));
  const resources = updatedState.resources;
  
  // Consume ingredients
  for (const [resource, amount] of Object.entries(recipe.ingredients)) {
    if (resource === 'food') {
      updatedState.food -= amount;
    } else if (resource === 'water') {
      updatedState.water -= amount;
    } else {
      resources[resource as keyof ResourceStore] -= amount;
    }
  }
  
  // Calculate success chance
  const successChance = calculateCraftingSuccessChance(recipe, gameState);
  const roll = Math.random();
  const success = roll <= successChance;
  
  // If successful, add products
  if (success) {
    for (const [product, amount] of Object.entries(recipe.products)) {
      if (product === 'food') {
        updatedState.food += amount;
      } else if (product === 'water') {
        updatedState.water += amount;
      } else if (product.endsWith('Capacity')) {
        // Handle capacity increases
        const resourceKey = product as keyof ResourceStore;
        resources[resourceKey] = (resources[resourceKey] || 0) + amount;
      } else {
        const resourceKey = product as keyof ResourceStore;
        resources[resourceKey] = (resources[resourceKey] || 0) + amount;
      }
    }
    
    return {
      success: true,
      message: `Successfully crafted ${recipe.name}!`,
      updatedState
    };
  } else {
    // On failure, ingredient cost is still deducted but 
    // some materials might be salvageable (25% return)
    for (const [resource, amount] of Object.entries(recipe.ingredients)) {
      if (roll > successChance * 0.5) { // Very bad roll, no recovery
        continue;
      }
      
      const recoveredAmount = Math.floor(amount * 0.25);
      if (recoveredAmount <= 0) continue;
      
      if (resource === 'food') {
        updatedState.food += recoveredAmount;
      } else if (resource === 'water') {
        updatedState.water += recoveredAmount;
      } else {
        resources[resource as keyof ResourceStore] += recoveredAmount;
      }
    }
    
    return {
      success: false,
      message: `Failed to craft ${recipe.name}. Some materials were wasted.`,
      updatedState
    };
  }
} 
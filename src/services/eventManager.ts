import { EventChain, EventChainType, GameState } from '../types/game';
import { getGameSettings } from './saveManager';

// Define different event types
export enum EventType {
  SURVIVAL = 'survival',
  RESOURCE = 'resource',
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  MYSTERY = 'mystery',
  STORY = 'story'
}

// Event chain templates
export interface EventChainTemplate {
  id: string;
  name: string;
  type: EventChainType;
  description: string;
  totalSteps: number;
  minDay: number; // Minimum day when this chain can start
  maxDay?: number; // Optional maximum day when this chain can still start
  weight: number; // Base chance for this chain to trigger
  tags: string[];
  requirements?: {
    minSurvivors?: number;
    maxSurvivors?: number;
    minFood?: number;
    minWater?: number;
    requiredThemes?: string[];
    excludedThemes?: string[];
    requiredLocations?: string[];
  };
  onComplete?: {
    rewards?: {
      food?: number;
      water?: number;
      medicine?: number;
      scrap?: number;
      fuel?: number;
      ammunition?: number;
    };
    unlockLocations?: string[];
  };
  steps: EventChainStep[];
}

// Individual step in an event chain
export interface EventChainStep {
  description: string;
  choices: EventChainChoice[];
  specialEffects?: {
    triggerEvent?: string;
    unlockLocation?: string;
    modifyRelationship?: {
      survivorId: string;
      change: number;
    }[];
  };
}

// Choices in each step of an event chain
export interface EventChainChoice {
  text: string;
  outcome: string;
  success: {
    chance: number; // 0-1 probability
    result: string;
    effects: any[]; // Same format as normal event effects
  };
  failure?: {
    result: string;
    effects: any[];
  };
  requirements?: {
    minFood?: number;
    minWater?: number;
    cost?: {
      food?: number;
      water?: number;
      medicine?: number;
      ammunition?: number;
    };
    survivorStatuses?: string[];
  };
}

// Database of event chain templates
const EVENT_CHAINS: EventChainTemplate[] = [
  {
    id: 'mysterious_radio',
    name: 'Mysterious Radio Signal',
    type: 'story',
    description: 'A faint radio signal leads to a series of discoveries',
    totalSteps: 3,
    minDay: 5,
    weight: 60,
    tags: ['radio', 'exploration', 'technology'],
    requirements: {
      minSurvivors: 2,
    },
    onComplete: {
      rewards: {
        food: 10,
        water: 10,
        scrap: 5
      },
      unlockLocations: ['radio_tower'],
    },
    steps: [
      {
        description: "While scavenging through an abandoned electronics store, you discover an old ham radio that crackles to life, emitting a faint but repeating signal. The voice is garbled but seems to be giving coordinates and mentioning supplies.",
        choices: [
          {
            text: "Try to boost the signal",
            outcome: "You fiddle with the radio's components to enhance reception.",
            success: {
              chance: 0.7,
              result: "After connecting some scavenged wires and a makeshift antenna, the signal becomes clearer. It's a recorded message giving coordinates to a supply cache about a day's journey away.",
              effects: []
            },
            failure: {
              result: "Your attempts to boost the signal accidentally fry the radio's circuits. The signal is lost, but you've memorized enough of the coordinates to have a general idea of the location.",
              effects: []
            }
          },
          {
            text: "Record the coordinates and prepare to travel",
            outcome: "You jot down what you can make out from the garbled transmission.",
            success: {
              chance: 0.9,
              result: "You've managed to write down what seem to be the right coordinates. Time to prepare for a journey to investigate.",
              effects: []
            }
          }
        ]
      },
      {
        description: "Following the coordinates leads you to a dilapidated radio tower on a hilltop. The surrounding area shows signs of a hasty evacuation. The radio equipment inside still has power from emergency solar panels.",
        choices: [
          {
            text: "Investigate the transmission equipment",
            outcome: "You carefully examine the sophisticated radio equipment.",
            success: {
              chance: 0.8,
              result: "The equipment is operational but locked with a keypad. Looking around, you notice maintenance logs with highlighted dates - possibly the code. After trying several combinations, the system unlocks, revealing a map with several marked locations.",
              effects: []
            }
          },
          {
            text: "Search the surrounding buildings",
            outcome: "You decide to check the outbuildings first.",
            success: {
              chance: 0.6,
              result: "In a maintenance shed, you find emergency supplies and a locked box. Breaking it open reveals a key card and handwritten notes about a 'secure supply depot' several miles east.",
              effects: [
                { "target": "player", "addStatus": "Exhausted" },
                { "foodChange": 5, "waterChange": 5 }
              ]
            },
            failure: {
              result: "While searching, you trigger an old alarm system. The noise attracts a group of hostile scavengers who force you to flee without thoroughly searching the area.",
              effects: [
                { "target": "random", "healthChange": -10, "addStatus": "Injured (Bleeding)" }
              ]
            }
          }
        ]
      },
      {
        description: "The final coordinates lead to a concealed bunker entrance hidden beneath an ordinary-looking shed. The door requires both the key card and a code sequence.",
        choices: [
          {
            text: "Use the key card and try the code combinations",
            outcome: "You insert the key card and carefully input code combinations based on the clues you've gathered.",
            success: {
              chance: 0.7,
              result: "After several attempts, the heavy door slides open with a hiss of pressurized air. Inside, you find a treasure trove of preserved supplies and equipment. This could sustain your group for weeks! There's also a functioning communication system that might help you contact other survivors.",
              effects: [
                { "foodChange": 15, "waterChange": 15 },
                { "target": "all", "addStatus": "Hopeful" }
              ]
            },
            failure: {
              result: "After several failed attempts, the security system locks down completely. You'll need specialized tools to break in now. At least you've confirmed that valuable supplies likely exist inside.",
              effects: [
                { "target": "player", "addStatus": "Exhausted" }
              ]
            }
          },
          {
            text: "Look for another entrance",
            outcome: "Rather than risk the main entrance, you search the perimeter for another way in.",
            success: {
              chance: 0.5,
              result: "Your thorough search reveals a partially collapsed maintenance tunnel. Squeezing through is dangerous but possible. Inside, you bypass the security system and access the supply cache, though you can only carry a portion of the supplies through the narrow tunnel.",
              effects: [
                { "foodChange": 8, "waterChange": 8 },
                { "target": "player", "healthChange": -5, "addStatus": "Exhausted" }
              ]
            },
            failure: {
              result: "While searching around the perimeter, you disturb a nest of creatures that have made their home near the bunker. In the ensuing chaos, someone gets hurt, and you're forced to retreat empty-handed.",
              effects: [
                { "target": "random", "healthChange": -15, "addStatus": "Injured (Bleeding)" }
              ]
            },
            requirements: {
              survivorStatuses: ["Injured (Bleeding)"]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'medical_crisis',
    name: 'Medical Crisis',
    type: 'crisis',
    description: 'A sudden illness threatens your group',
    totalSteps: 2,
    minDay: 3,
    weight: 80,
    tags: ['disease', 'medicine', 'survival'],
    requirements: {
      minSurvivors: 3,
    },
    steps: [
      {
        description: "One of your survivors wakes up with a high fever and difficulty breathing. Others soon report similar symptoms. It appears to be a contagious illness spreading through your camp.",
        choices: [
          {
            text: "Isolate the sick survivors",
            outcome: "You separate the sick from the healthy members of your group.",
            success: {
              chance: 0.8,
              result: "Quick action prevents further spread of the illness. Now you need to find medicine to treat those already sick.",
              effects: [
                { "target": "random", "addStatus": "Fever" },
                { "target": "random", "addStatus": "Fever" }
              ]
            }
          },
          {
            text: "Forage for medicinal plants",
            outcome: "You search the surrounding area for plants with medicinal properties.",
            success: {
              chance: 0.6,
              result: "You manage to find some herbs that can help reduce fever. It's not a cure, but it might buy you time to find real medicine.",
              effects: [
                { "target": "random", "addStatus": "Fever" }
              ]
            },
            failure: {
              result: "Despite your best efforts, you can't find anything useful. Meanwhile, more survivors fall ill.",
              effects: [
                { "target": "random", "addStatus": "Fever" },
                { "target": "random", "addStatus": "Fever" },
                { "target": "random", "addStatus": "Fever" }
              ]
            }
          }
        ]
      },
      {
        description: "The illness continues to spread. You've heard rumors of an abandoned pharmacy in a nearby town that might still have medical supplies.",
        choices: [
          {
            text: "Send a team to the pharmacy",
            outcome: "You organize an expedition to the pharmacy.",
            success: {
              chance: 0.7,
              result: "Your team successfully reaches the pharmacy and finds antibiotics and other medical supplies. Upon returning, you treat the sick survivors, who begin to recover.",
              effects: [
                { "target": "all", "removeStatus": "Fever" },
                { "foodChange": -5, "waterChange": -5 }
              ]
            },
            failure: {
              result: "The pharmacy has been thoroughly looted. Your team returns empty-handed, and the situation worsens.",
              effects: [
                { "target": "random", "healthChange": -15 },
                { "target": "random", "healthChange": -15 }
              ]
            }
          },
          {
            text: "Create a makeshift quarantine zone",
            outcome: "You set up a separate area to contain the illness.",
            success: {
              chance: 0.5,
              result: "The quarantine is effective. Though some survivors remain sick, the spread stops. Over time, most recover naturally, though it takes a toll on your resources.",
              effects: [
                { "target": "random", "removeStatus": "Fever" },
                { "foodChange": -10, "waterChange": -10 }
              ]
            },
            failure: {
              result: "Despite your precautions, the illness continues to spread. Your group is severely weakened.",
              effects: [
                { "target": "all", "healthChange": -10 }
              ]
            }
          }
        ]
      }
    ]
  }
];

// Common/frequent event templates for daily events
const COMMON_EVENTS = [
  {
    type: EventType.RESOURCE,
    description: "You discover an untouched convenience store partially hidden by overgrowth. The windows are intact, suggesting it hasn't been looted.",
    weight: 100,
    minDay: 1,
    choices: [
      {
        text: "Break in through the front door",
        cost: { food: 0, water: 0 },
        outcome: "You smash the glass door with a rock, triggering a long-dead alarm. The noise echoes through the empty streets as you quickly gather supplies.",
        foodChange: 8,
        waterChange: 5,
        survivorChanges: [
          { target: "random", addStatus: "Scared" }
        ]
      },
      {
        text: "Look for a quieter way in",
        cost: { food: 1, water: 1 },
        outcome: "You find a back entrance and carefully pick the lock. Inside, you methodically search the shelves, finding several untouched supplies.",
        foodChange: 12,
        waterChange: 8
      }
    ]
  },
  {
    type: EventType.SURVIVAL,
    description: "A sudden storm rolls in, bringing freezing rain and harsh winds. Your current shelter offers minimal protection from the elements.",
    weight: 120,
    minDay: 1,
    choices: [
      {
        text: "Reinforce the shelter using scavenged materials",
        cost: { food: 2, water: 1 },
        outcome: "Working together, you manage to patch the worst leaks and create better insulation before the storm intensifies.",
        survivorChanges: [
          { target: "all", addStatus: "Exhausted" }
        ]
      },
      {
        text: "Huddle together and endure the storm",
        cost: { food: 0, water: 0 },
        outcome: "You all crowd into the most protected corner, sharing body heat as the storm rages. It's a miserable night with little sleep.",
        survivorChanges: [
          { target: "all", addStatus: "Cold" },
          { target: "random", addStatus: "Hypothermia" }
        ]
      }
    ]
  }
];

/**
 * Determine what type of event should occur based on the game state
 * and weighted probabilities
 * 
 * @param gameState Current game state
 * @returns Type of event to generate
 */
export function determineEventType(gameState: GameState): EventType {
  const { day, survivors } = gameState;
  const settings = getGameSettings();
  
  // Base weights
  const weights = {
    [EventType.SURVIVAL]: 100,
    [EventType.RESOURCE]: 100,
    [EventType.COMBAT]: 70,
    [EventType.EXPLORATION]: 80,
    [EventType.SOCIAL]: 60,
    [EventType.MYSTERY]: 40,
    [EventType.STORY]: 50
  };
  
  // Modify weights based on game state
  
  // Resource events more likely when low on supplies
  if (gameState.food < 5 || gameState.water < 5) {
    weights[EventType.RESOURCE] += 50;
  }
  
  // Social events more likely with more survivors
  if (survivors.length >= 3) {
    weights[EventType.SOCIAL] += 20 * (survivors.length - 2);
  }
  
  // Story events more likely as days progress
  weights[EventType.STORY] += Math.min(100, day * 5);
  
  // Combat events more likely in higher difficulties
  if (settings.difficulty.level === 'hard' || settings.difficulty.level === 'apocalypse') {
    weights[EventType.COMBAT] += 30;
  }
  
  // Normalize weights into probabilities
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const normalizedWeights: Record<EventType, number> = {} as Record<EventType, number>;
  
  Object.entries(weights).forEach(([type, weight]) => {
    normalizedWeights[type as EventType] = weight / totalWeight;
  });
  
  // Select an event type based on probabilities
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const [type, probability] of Object.entries(normalizedWeights)) {
    cumulativeProbability += probability;
    if (random <= cumulativeProbability) {
      return type as EventType;
    }
  }
  
  // Fallback to survival event if something goes wrong
  return EventType.SURVIVAL;
}

/**
 * Check if any event chains can be started based on the current game state
 * 
 * @param gameState Current game state
 * @returns Event chain to start, or null if none should start
 */
export function checkForEventChainStart(gameState: GameState): EventChainTemplate | null {
  const { day, survivors, theme, eventChains = [] } = gameState;
  const settings = getGameSettings();
  
  // Only consider chains that aren't already active or completed
  const activeChainIds = eventChains.map(chain => chain.id);
  const eligibleChains = EVENT_CHAINS.filter(template => 
    !activeChainIds.includes(template.id) &&
    day >= template.minDay &&
    (!template.maxDay || day <= template.maxDay)
  );
  
  // Filter by requirements
  const validChains = eligibleChains.filter(chain => {
    const req = chain.requirements || {};
    if (req.minSurvivors && survivors.length < req.minSurvivors) return false;
    if (req.maxSurvivors && survivors.length > req.maxSurvivors) return false;
    if (req.minFood && gameState.food < req.minFood) return false;
    if (req.minWater && gameState.water < req.minWater) return false;
    if (req.requiredThemes && !req.requiredThemes.includes(theme)) return false;
    if (req.excludedThemes && req.excludedThemes.includes(theme)) return false;
    
    // Check if required locations are discovered
    if (req.requiredLocations && req.requiredLocations.length > 0) {
      const discoveredLocations = gameState.discoveredLocations || [];
      if (!req.requiredLocations.every(loc => discoveredLocations.includes(loc))) {
        return false;
      }
    }
    
    return true;
  });
  
  // If no valid chains, return null
  if (validChains.length === 0) return null;
  
  // Calculate total weight
  const totalWeight = validChains.reduce((sum, chain) => sum + chain.weight, 0);
  
  // Base chance of starting a chain (adjusted by game settings)
  const baseChance = 0.2 * settings.difficulty.eventDifficulty;
  
  // First decide if we should start a chain at all
  if (Math.random() > baseChance) {
    return null;
  }
  
  // Select a chain based on weights
  const random = Math.random() * totalWeight;
  let cumulativeWeight = 0;
  
  for (const chain of validChains) {
    cumulativeWeight += chain.weight;
    if (random <= cumulativeWeight) {
      return chain;
    }
  }
  
  // Fallback if something goes wrong
  return validChains[0] || null;
}

/**
 * Start a new event chain
 * 
 * @param template Event chain template
 * @returns New event chain object
 */
export function startEventChain(template: EventChainTemplate): EventChain {
  return {
    id: template.id,
    name: template.name,
    type: template.type,
    currentStep: 0,
    totalSteps: template.totalSteps,
    expires: template.type === 'crisis' ? 3 : null, // Crisis events expire in 3 days if not completed
    data: {},
    completed: false
  };
}

/**
 * Generate an event description and choices based on the current chain step
 * 
 * @param chain Active event chain
 * @param template Event chain template
 * @returns Event description and choices for the current step
 */
export function generateChainEvent(chain: EventChain, template: EventChainTemplate) {
  const currentStep = template.steps[chain.currentStep];
  
  return {
    description: currentStep.description,
    choices: currentStep.choices.map(choice => ({
      action: choice.text,
      cost: choice.requirements?.cost || { food: 0, water: 0 },
      outcome: choice.outcome,
      // We'll use a random number to determine success/failure when the choice is selected
      // rather than pre-determining it here
    }))
  };
}

/**
 * Advance an event chain to the next step
 * 
 * @param gameState Current game state
 * @param chainId ID of the chain to advance
 * @returns Updated game state
 */
export function advanceEventChain(gameState: GameState, chainId: string): GameState {
  const updatedState = { ...gameState };
  const eventChains = [...(updatedState.eventChains || [])];
  
  const chainIndex = eventChains.findIndex(chain => chain.id === chainId);
  if (chainIndex === -1) return gameState;
  
  const chain = { ...eventChains[chainIndex] };
  chain.currentStep += 1;
  
  // Check if chain is completed
  if (chain.currentStep >= chain.totalSteps) {
    chain.completed = true;
    
    // Apply completion rewards if any
    const template = EVENT_CHAINS.find(t => t.id === chainId);
    if (template?.onComplete) {
      // Add rewards
      if (template.onComplete.rewards) {
        const rewards = template.onComplete.rewards;
        if (rewards.food) updatedState.food += rewards.food;
        if (rewards.water) updatedState.water += rewards.water;
        
        // For the advanced resource system
        if (updatedState.resources) {
          if (rewards.medicine) updatedState.resources.medicine += rewards.medicine;
          if (rewards.scrap) updatedState.resources.scrap += rewards.scrap;
          if (rewards.fuel) updatedState.resources.fuel += rewards.fuel;
          if (rewards.ammunition) updatedState.resources.ammunition += rewards.ammunition;
        }
      }
      
      // Unlock locations
      if (template.onComplete.unlockLocations) {
        const discoveredLocations = [
          ...(updatedState.discoveredLocations || []),
          ...template.onComplete.unlockLocations
        ];
        updatedState.discoveredLocations = discoveredLocations;
      }
    }
  }
  
  // Update the chain in the state
  eventChains[chainIndex] = chain;
  updatedState.eventChains = eventChains;
  
  return updatedState;
}

/**
 * Clean up expired event chains
 * 
 * @param gameState Current game state
 * @returns Updated game state with expired chains removed
 */
export function cleanupExpiredChains(gameState: GameState): GameState {
  const { day, eventChains = [] } = gameState;
  
  if (eventChains.length === 0) return gameState;
  
  const updatedChains = eventChains.filter(chain => {
    // Keep completed chains or chains without expiration
    if (chain.completed || chain.expires === null) return true;
    
    // Remove chains that have expired
    return chain.expires >= day;
  });
  
  if (updatedChains.length === eventChains.length) {
    return gameState;
  }
  
  return {
    ...gameState,
    eventChains: updatedChains
  };
}

/**
 * Process resource changes from event choices based on game settings
 * 
 * @param gameState Current game state
 * @param resourceChanges Resource changes from event choice
 * @returns Updated game state with applied resource changes
 */
export function processResourceChanges(gameState: GameState, resourceChanges: any): GameState {
  const settings = getGameSettings();
  const difficultyMultiplier = settings.difficulty.resourceMultiplier;
  
  const updatedState = { ...gameState };
  const resources = updatedState.resources || {
    food: updatedState.food || 0,
    water: updatedState.water || 0,
    medicine: 0,
    scrap: 0,
    fuel: 0,
    ammunition: 0,
    tools: 0,
    clothing: 0,
    foodCapacity: 100,
    waterCapacity: 100,
    medicineCapacity: 50,
    scrapCapacity: 100,
    fuelCapacity: 50,
    ammunitionCapacity: 30
  };
  
  // Handle legacy food/water changes
  if (resourceChanges.foodChange) {
    // Apply positive changes with difficulty multiplier
    if (resourceChanges.foodChange > 0) {
      updatedState.food += Math.round(resourceChanges.foodChange * difficultyMultiplier);
    } else {
      // Negative changes (consumption) aren't affected by resource multiplier
      updatedState.food += resourceChanges.foodChange;
    }
  }
  
  if (resourceChanges.waterChange) {
    // Apply positive changes with difficulty multiplier
    if (resourceChanges.waterChange > 0) {
      updatedState.water += Math.round(resourceChanges.waterChange * difficultyMultiplier);
    } else {
      // Negative changes (consumption) aren't affected by resource multiplier
      updatedState.water += resourceChanges.waterChange;
    }
  }
  
  // Handle advanced resources if provided
  if (resourceChanges.resourceChanges) {
    const changes = resourceChanges.resourceChanges;
    
    // Apply changes to each resource type
    Object.keys(changes).forEach(resourceType => {
      if (!resources[resourceType]) return;
      
      const change = changes[resourceType];
      // Apply positive changes with difficulty multiplier
      if (change > 0) {
        resources[resourceType] += Math.round(change * difficultyMultiplier);
      } else {
        // Negative changes aren't affected by resource multiplier
        resources[resourceType] += change;
      }
      
      // Ensure resource doesn't exceed capacity
      const capacityKey = `${resourceType}Capacity`;
      if (resources[capacityKey]) {
        resources[resourceType] = Math.min(resources[resourceType], resources[capacityKey]);
      }
      
      // Ensure resource doesn't go below 0
      resources[resourceType] = Math.max(0, resources[resourceType]);
    });
  }
  
  // Update resources in game state
  updatedState.resources = resources;
  
  // Update legacy food/water to stay in sync with resources
  updatedState.food = Math.max(0, updatedState.food);
  updatedState.water = Math.max(0, updatedState.water);
  
  return updatedState;
} 
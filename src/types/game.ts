export interface Survivor {
  id: string;
  name: string;
  health: number;
  statuses: StatusEffect[];
  companion: Companion | null;
  healthChange?: number;
  isPlayer?: boolean;
}

export interface Companion {
  id: string;
  name: string;
  type: string;
  bonuses?: {
    gathering_success_chance?: number;
    hunting_yield?: number;
    healing_rate?: number;
    combat_assist?: number;
    scavenging_bonus?: number;
  };
}

export interface SurvivorChange {
  target: 'player' | 'random' | 'all' | 'new' | string;
  healthChange?: number;
  addStatus?: StatusEffect;
  removeStatus?: StatusEffect | 'all_negative';
  name?: string;
  health?: number;
  statuses?: StatusEffect[];
  addCompanion?: Companion;
  removeCompanion?: boolean;
  new?: boolean;
}

export interface GameChoice {
  // id: string; // Removed, as it doesn't seem to come from the API
  action: string; // Renamed from 'text'
  cost?: { // Made optional, assuming it might not always be present
    food?: number; // Made optional
    water?: number; // Made optional
  };
  outcome: string;
  // Removed the 'effects' nesting
  foodChange?: number; // Added (optional)
  waterChange?: number; // Added (optional)
  resourceChanges?: {  // Add support for advanced resources
    medicine?: number;
    scrap?: number;
    fuel?: number;
    ammunition?: number;
    tools?: number;
    clothing?: number;
  };
  survivorChanges?: SurvivorChange[]; // Moved from effects (optional)
}

// Add type for event history entries
export interface EventHistoryEntry {
  day: number;
  description: string; // The event description from that day
  outcome: string;     // The outcome of the choice made that day
}

export interface GameState {
  day: number;
  food: number;
  water: number;
  survivors: Survivor[];
  foodChange: number;
  waterChange: number;
  eventText: string;
  currentChoices: GameChoice[] | null;
  lastOutcome: string;
  isLoading: boolean;
  error: string | null;
  isGameOver: boolean;
  gameOverMessage: string;
  isNamingCompanion: boolean;
  companionToNameInfo: {
    survivorId: string;
    companion: Companion;
  } | null;
  theme: string;
  eventHistory: EventHistoryEntry[]; // Add event history array
  // Add flags for daily actions
  huntPerformedToday: boolean;
  gatherPerformedToday: boolean;
  // New properties for enhanced mechanics
  playtime: number; // Total game playtime in seconds
  resources: ResourceStore; // Enhanced resource system
  resourceDependencies?: Record<string, {
    requirement: string;
    minimumAmount: number;
    bonusPerUnit?: number;
    effect?: string;
  }>;
  eventChains: EventChain[]; // Tracks active event chains
  discoveredLocations: string[]; // List of discovered location IDs
  difficultyLevel: string; // Current difficulty level
  adaptiveDifficultyScore: number; // Score for adaptive difficulty (0-100)
}

export interface HuntResult {
  hunterId: string;
  foodGained: number;
  outcomeText: string;
}

export interface GatherResult {
  gathererId: string;
  waterGained: number;
  outcomeText: string;
}

// Define specific status effects
export type StatusEffect = 
  | 'Dehydrated'
  | 'Malnourished'
  | 'Injured (Bleeding)'
  | 'Exhausted'
  | 'Fever'
  | 'Infected Wound'
  | 'Hypothermia'
  | 'Heatstroke' // Assuming this might be relevant depending on theme/events
  | 'Poisoned'
  | 'Broken Limb'
  | 'Companion Bond' // Note: This seems more like a positive buff
  | 'Cold' // Keeping existing simple status if needed
  | 'Sick' // Keeping existing simple status if needed
  | 'Hopeful' // Keeping existing simple status if needed
  | 'Scared'; // Keeping existing simple status if needed

// Optional: Descriptions for tooltips
export const statusEffectDescriptions: Record<StatusEffect, string> = {
  'Dehydrated': '–10% action success; +1 Water consumption per day.',
  'Malnourished': '–10% movement/reaction speed in mini-games; small HP drain.',
  'Injured (Bleeding)': 'Lose 5 HP immediately upon receiving; passive HP loss until treated.',
  'Exhausted': '–20% chance of critical failure in choices; can only perform one mini-game per day.',
  'Fever': '–15 Max HP; 25% chance to skip turn (perform no action).',
  'Infected Wound': 'HP drains over 3 days unless disinfected; requires advanced medicine.',
  'Hypothermia': 'Passive HP loss in cold environments; actions are less effective.',
  'Heatstroke': 'Passive HP loss in hot environments; increased water consumption.',
  'Poisoned': 'Steady HP loss until healed.',
  'Broken Limb': 'Cannot Go Hunting or perform strenuous actions until splinted.',
  'Companion Bond': '+5 HP regen per day when traveling with companion, but double resource cost for the pair.',
  'Cold': 'Slightly increased chance of getting sick.',
  'Sick': 'Moderate passive HP loss; reduced effectiveness.',
  'Hopeful': '+5% action success chance.',
  'Scared': '-10% action success chance.',
};

// Enhanced resource types
export interface ResourceStore {
  // Core survival resources
  food: number;
  water: number;
  // Advanced resources
  medicine: number;
  scrap: number;
  fuel: number;
  ammunition: number;
  // Craftable resources
  tools: number;
  clothing: number;
  // Resource limits
  foodCapacity: number;
  waterCapacity: number;
  medicineCapacity: number;
  scrapCapacity: number;
  fuelCapacity: number;
  ammunitionCapacity: number;
}

// Event chain system to create multi-day events
export interface EventChain {
  id: string;
  name: string;
  type: EventChainType;
  currentStep: number;
  totalSteps: number;
  expires: number | null; // Day when this chain expires, null = no expiration
  data: Record<string, any>; // Custom data for this chain
  completed: boolean;
}

export type EventChainType = 
  | 'story'  // Main story events
  | 'quest'  // Side quests
  | 'crisis' // Time-sensitive challenges
  | 'character' // Character development
  | 'location' // Location exploration
  | 'resource'; // Resource gathering/management 
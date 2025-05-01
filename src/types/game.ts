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
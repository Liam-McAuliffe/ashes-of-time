export interface Survivor {
  id: string;
  name: string;
  health: number;
  statuses: string[];
  companion: Companion | null;
}

export interface Companion {
  id: string;
  name: string;
  type: string;
  bonuses?: {
    hunting?: number;
    gathering?: number;
    healing?: number;
  };
}

export interface SurvivorChange {
  target: 'player' | 'random' | 'all' | 'new' | string;
  healthChange?: number;
  addStatus?: string;
  removeStatus?: string;
  name?: string;
  health?: number;
  statuses?: string[];
  addCompanion?: Companion;
  removeCompanion?: boolean;
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
}

export interface HuntResult {
  hunterId: string;
  foodGained: number;
  healthChange: number;
  outcomeText: string;
}

export interface GatherResult {
  gathererId: string;
  waterGained: number;
  healthChange: number;
  outcomeText: string;
} 
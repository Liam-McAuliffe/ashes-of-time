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
  id: string;
  text: string;
  cost: {
    food: number;
    water: number;
  };
  outcome: string;
  effects: {
    food: number;
    water: number;
    survivorChanges?: SurvivorChange[];
  };
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
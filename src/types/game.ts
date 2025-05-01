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
    defense?: number;
  };
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

export interface SurvivorChange {
  id: string;
  health?: number;
  statuses?: { add?: string[]; remove?: string[] };
  companion?: Companion;
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
  success: boolean;
  foodGained: number;
  waterGained?: number;
  survivorId: string;
  healthLost?: number;
  statusGained?: string;
  outcomeText: string;
}

export interface GatherResult {
  success: boolean;
  waterGained: number;
  foodGained?: number;
  survivorId: string;
  healthLost?: number;
  statusGained?: string;
  outcomeText: string;
} 
export interface SurvivorChange {
  target: string | 'player' | 'random' | 'all'; // Survivor ID, 'player', 'random', 'all'
  name?: string; // Used when target is 'new' or for matching by name
  health?: number; // Used when target is 'new'
  healthChange?: number;
  addStatus?: string;
  removeStatus?: string;
  addCompanion?: Omit<Companion, 'id'>; // Allow adding companion details
  removeCompanion?: boolean;
  statuses?: string[]; // Used when target is 'new'
  new?: boolean; // Flag to indicate this is a new survivor addition
}

export interface GameChoice {
  // ... existing code ...
}
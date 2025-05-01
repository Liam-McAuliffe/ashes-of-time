import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  GameState,
  GameChoice,
  Survivor,
  HuntResult,
  GatherResult,
  Companion,
  SurvivorChange,
} from '../../types/game';
import {
  checkGameOver,
  applyDailyStatusEffects,
  applySurvivorChanges,
  calculateDailyConsumption,
} from '../../utils/gameLogic';
import { fetchGameEvent, PromptContext, EventResponse } from '../../services/aiService';
import { RootState } from '../index';

const initialState: GameState = {
  day: 1,
  food: 20,
  water: 20,
  survivors: [
    { id: 'player', name: 'You', health: 100, statuses: [], companion: null },
  ],
  foodChange: 0,
  waterChange: 0,
  eventText: 'Initializing...',
  currentChoices: null,
  lastOutcome: 'The adventure begins...',
  isLoading: false,
  error: null,
  isGameOver: false,
  gameOverMessage: '',
  isNamingCompanion: false,
  companionToNameInfo: null,
  theme: 'Nuclear Winter',
};

export const fetchEvent = createAsyncThunk<
  EventResponse,
  void,
  { state: RootState }
>(
  'game/fetchEvent',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState().game;

    const context: PromptContext = {
      day: state.day,
      food: state.food,
      water: state.water,
      survivors: state.survivors,
      theme: state.theme,
      previousDayOutcome: state.lastOutcome,
    };

    const eventData = await fetchGameEvent(context);
    return eventData;
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    applyChoice: (state, action: PayloadAction<{ choice: GameChoice }>) => {
      const { choice } = action.payload;
      const { food: startingFood, water: startingWater, day: currentDay } = state;

      let tempFood = startingFood - (choice.cost?.food || 0);
      let tempWater = startingWater - (choice.cost?.water || 0);
      
      tempFood += choice.effects?.food || 0;
      tempWater += choice.effects?.water || 0;
      
      let survivorsAfterChoice = applySurvivorChanges(
        state.survivors,
        choice.effects?.survivorChanges
      );

      tempFood = Math.max(0, tempFood);
      tempWater = Math.max(0, tempWater);

      state.lastOutcome = choice.outcome || `You chose: ${choice.text}`;
      state.currentChoices = null;

      let newlyAddedCompanionInfo: { survivorId: string; companion: Companion } | null = null;
      for (const survivor of survivorsAfterChoice) {
        const oldSurvivor = state.survivors.find((s) => s.id === survivor.id);
        if (survivor && survivor.companion && (!oldSurvivor || !oldSurvivor.companion)) {
          if (!survivor.companion.id) {
            survivor.companion.id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
          newlyAddedCompanionInfo = {
            survivorId: survivor.id,
            companion: survivor.companion, 
          };
          break;
        }
      }
      
      if (newlyAddedCompanionInfo) {
        state.food = tempFood;
        state.water = tempWater;
        state.survivors = survivorsAfterChoice;
        state.foodChange = tempFood - startingFood;
        state.waterChange = tempWater - startingWater;
        state.isNamingCompanion = true;
        state.companionToNameInfo = newlyAddedCompanionInfo;
        state.isLoading = false;
        state.error = null;
        return;
      }
       
      proceedToNextDay(state, startingFood, startingWater, tempFood, tempWater, survivorsAfterChoice, currentDay);
    },
    resolveHunting: (state, action: PayloadAction<HuntResult>) => {
      const { hunterId, foodGained, healthChange, outcomeText } = action.payload;
      const { food: startingFood, water: startingWater, day: currentDay } = state;

      let tempFood = startingFood + foodGained;
      const survivorsAfterHunt = applySurvivorChanges(
        state.survivors,
        [{ target: hunterId, healthChange: healthChange }]
      );

      tempFood = Math.max(0, tempFood);
      state.lastOutcome = outcomeText;
      state.currentChoices = null;

      proceedToNextDay(state, startingFood, startingWater, tempFood, state.water, survivorsAfterHunt, currentDay);
    },
    resolveGatherWater: (state, action: PayloadAction<GatherResult>) => {
      const { gathererId, waterGained, healthChange, outcomeText } = action.payload;
      const { food: startingFood, water: startingWater, day: currentDay } = state;

      let tempWater = startingWater + waterGained;
      const survivorsAfterGather = applySurvivorChanges(
        state.survivors,
        [{ target: gathererId, healthChange: healthChange }]
      );

      tempWater = Math.max(0, tempWater);
      state.lastOutcome = outcomeText;
      state.currentChoices = null;

      proceedToNextDay(state, startingFood, startingWater, state.food, tempWater, survivorsAfterGather, currentDay);
    },
    finishNamingCompanion: (
      state,
      action: PayloadAction<{ survivorId: string; newName: string }>
    ) => {
      const { survivorId, newName } = action.payload;
      if (!state.companionToNameInfo || !state.isNamingCompanion) return;

      const { food: startingFood, water: startingWater, day: currentDay } = state;

      const finalName = newName.trim() || state.companionToNameInfo.companion.name;
      const outcome = `You named the new companion '${finalName}'.`;

      const updatedSurvivors = state.survivors.map(survivor => 
         survivor.id === survivorId && survivor.companion
           ? { ...survivor, companion: { ...survivor.companion, name: finalName } }
           : survivor
       );
       
      state.isNamingCompanion = false;
      state.companionToNameInfo = null;
      state.lastOutcome += ` ${outcome}`;
      
      proceedToNextDay(state, startingFood, startingWater, state.food, state.water, updatedSurvivors, currentDay);
    },
    skipNamingCompanion: (state) => {
      if (!state.isNamingCompanion) return;
      const { food: startingFood, water: startingWater, day: currentDay } = state;
      
      const outcome = `You decided not to name the ${state.companionToNameInfo?.companion?.type || 'new arrival'} for now.`;
      state.lastOutcome += ` ${outcome}`;
      state.isNamingCompanion = false;
      state.companionToNameInfo = null;

      proceedToNextDay(state, startingFood, startingWater, state.food, state.water, state.survivors, currentDay);
    },
    setChoiceError: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setGameOver: (state, action: PayloadAction<{ message: string }>) => {
      state.isGameOver = true;
      state.gameOverMessage = action.payload.message;
      state.isLoading = false;
      state.currentChoices = null;
    },
    loadGameState: (state, action: PayloadAction<GameState>) => {
      return { ...action.payload, isLoading: false, error: null };
    },
    resetGame: () => {
      return { ...initialState, theme: initialState.theme, isLoading: true };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentChoices = null;
        state.eventText =
          state.day === 1
            ? 'Establishing contact...'
            : `Planning for Day ${state.day}...`;
      })
      .addCase(fetchEvent.fulfilled, (state, action: PayloadAction<EventResponse>) => {
        const { description, choices } = action.payload;
        const finalChoices = 
            Array.isArray(choices) && choices.length > 0
            ? choices
            : [
                {
                    id: 'continue',
                    text: 'Acknowledge and continue...',
                    cost: { food: 0, water: 0 },
                    outcome: 'You acknowledge the situation and prepare for what comes next.',
                    effects: { food: 0, water: 0, survivorChanges: [] },
                },
                ];

        state.isLoading = false;
        state.eventText = description || 'An eerie silence hangs in the air.';
        state.currentChoices = finalChoices;
        state.error = null;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch event data.';
        state.eventText = 'Radio interference blocks the signal. Unable to get a clear situation report.';
        state.currentChoices = [
          {
            id: 'wait_error',
            text: 'Hunker down and wait...',
            cost: { food: 0, water: 0 },
            outcome: 'You cautiously wait, conserving energy.',
            effects: { food: 0, water: 0, survivorChanges: [] },
          },
        ];
      });
  },
});

function proceedToNextDay(
    state: GameState,
    startingFood: number, 
    startingWater: number, 
    foodBeforeConsumption: number,
    waterBeforeConsumption: number,
    survivorsBeforeConsumption: Survivor[],
    previousDay: number
) {
    if (state.isGameOver) return;

    const gameOverMsgDirect = checkGameOver(foodBeforeConsumption, waterBeforeConsumption, survivorsBeforeConsumption);
    if (gameOverMsgDirect) {
        state.food = foodBeforeConsumption;
        state.water = waterBeforeConsumption;
        state.survivors = survivorsBeforeConsumption;
        state.foodChange = foodBeforeConsumption - startingFood;
        state.waterChange = waterBeforeConsumption - startingWater;
        state.isGameOver = true;
        state.gameOverMessage = `${gameOverMsgDirect} Game Over.`;
        state.eventText = `Day ${previousDay}: The struggle ends... ${gameOverMsgDirect}`;
        state.isLoading = false;
        state.currentChoices = null;
        return;
    }

    const { foodConsumed, waterConsumed } = calculateDailyConsumption(survivorsBeforeConsumption);
    let foodAfterConsumption = foodBeforeConsumption - foodConsumed;
    let waterAfterConsumption = waterBeforeConsumption - waterConsumed;

    let survivorsAfterDailyEffects = applyDailyStatusEffects(survivorsBeforeConsumption);

    foodAfterConsumption = Math.max(0, foodAfterConsumption);
    waterAfterConsumption = Math.max(0, waterAfterConsumption);

    const gameOverMsgAfterDaily = checkGameOver(
        foodAfterConsumption,
        waterAfterConsumption,
        survivorsAfterDailyEffects
    );
    if (gameOverMsgAfterDaily) {
        state.food = foodAfterConsumption;
        state.water = waterAfterConsumption;
        state.survivors = survivorsAfterDailyEffects;
        state.foodChange = foodAfterConsumption - startingFood;
        state.waterChange = waterAfterConsumption - startingWater;
        state.isGameOver = true;
        state.gameOverMessage = `${gameOverMsgAfterDaily} Game Over.`;
        state.eventText = `Day ${previousDay}: The struggle ends... ${gameOverMsgAfterDaily}`;
        state.isLoading = false;
        state.currentChoices = null;
        return;
    }

    state.day = previousDay + 1;
    state.food = foodAfterConsumption;
    state.water = waterAfterConsumption;
    state.survivors = survivorsAfterDailyEffects;
    state.foodChange = foodAfterConsumption - startingFood;
    state.waterChange = waterAfterConsumption - startingWater;
    state.isLoading = true;
    state.error = null;
    state.isNamingCompanion = false;
    state.companionToNameInfo = null;
}

export const {
  applyChoice,
  setChoiceError,
  clearError,
  resolveHunting,
  resolveGatherWater,
  finishNamingCompanion,
  skipNamingCompanion,
  setGameOver,
  loadGameState,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer; 
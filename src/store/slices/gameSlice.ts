import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  GameState,
  GameChoice,
  Survivor,
  HuntResult,
  GatherResult,
  Companion,
  SurvivorChange,
  EventHistoryEntry,
} from '../../types/game';
import {
  checkGameOver,
  applyDailyStatusEffects,
  applySurvivorChanges,
  calculateDailyConsumption,
} from '../../utils/gameLogic';
import { fetchGameEvent, PromptContext, EventResponse } from '../../services/aiService';
import { RootState } from '../index';

const MAX_HISTORY_LENGTH = 3;

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
  eventHistory: [],
  huntPerformedToday: false,
  gatherPerformedToday: false,
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
      eventHistory: state.eventHistory?.slice(-3),
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
      const { food: startingFood, water: startingWater, day: currentDay, survivors: survivorsBefore } = state;

      let tempFood = startingFood - (choice.cost?.food || 0);
      let tempWater = startingWater - (choice.cost?.water || 0);
      
      tempFood += choice.foodChange || 0;
      tempWater += choice.waterChange || 0;
      
      let survivorsAfterChoice = applySurvivorChanges(
        survivorsBefore,
        choice.survivorChanges || []
      );

      survivorsAfterChoice = survivorsAfterChoice.map(survivor => {
        const initialHealth = survivorsBefore.find(s => s.id === survivor.id)?.health ?? survivor.health;
        const change = survivor.health - initialHealth;
        return { ...survivor, healthChange: change !== 0 ? change : undefined };
      });

      tempFood = Math.max(0, tempFood);
      tempWater = Math.max(0, tempWater);

      state.lastOutcome = choice.outcome || `You chose: ${choice.action}`;
      state.currentChoices = null;

      let newlyAddedCompanionInfo: { survivorId: string; companion: Companion } | null = null;
      for (const survivor of survivorsAfterChoice) {
        const oldSurvivor = survivorsBefore.find((s) => s.id === survivor.id);
        if (survivor.companion && (!oldSurvivor || !oldSurvivor.companion)) {
          if (!survivor.companion.id) {
            survivor.companion.id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
          newlyAddedCompanionInfo = {
            survivorId: survivor.id,
            companion: survivor.companion, 
          };
          console.log("Companion detected, setting info:", newlyAddedCompanionInfo);
          break;
        }
      }
      
      state.survivors = survivorsAfterChoice;
      state.food = tempFood;
      state.water = tempWater;
      state.foodChange = tempFood - startingFood;
      state.waterChange = tempWater - startingWater;
      
      if (newlyAddedCompanionInfo) {
        console.log("Proceeding to naming companion...");
        state.isNamingCompanion = true;
        state.companionToNameInfo = newlyAddedCompanionInfo;
        state.isLoading = false;
        state.error = null;
        return; 
      } else {
        console.log("No new companion detected or already processed, proceeding to next day...");
        proceedToNextDay(state, startingFood, startingWater, tempFood, tempWater, survivorsAfterChoice, currentDay);
      }
    },
    resolveHunting: (state, action: PayloadAction<HuntResult>) => {
      const { hunterId, foodGained, outcomeText } = action.payload;
      const { food: startingFood, water: startingWater, survivors: survivorsBefore } = state;

      const healthCost = -(7 + Math.floor(Math.random() * 9));
      let survivorsAfterHunt = applySurvivorChanges(
        survivorsBefore,
        [{ target: hunterId, healthChange: healthCost }]
      );

      survivorsAfterHunt = survivorsAfterHunt.map(survivor => {
        const initialHealth = survivorsBefore.find(s => s.id === survivor.id)?.health ?? survivor.health;
        const change = survivor.health - initialHealth;
        return { ...survivor, healthChange: change !== 0 ? change : undefined };
      });

      let tempFood = Math.max(0, startingFood + foodGained);

      state.survivors = survivorsAfterHunt;
      state.food = tempFood;
      state.lastOutcome = `${outcomeText} The effort cost ${Math.abs(healthCost)} health.`;
      state.foodChange = tempFood - startingFood;
      state.waterChange = state.water - startingWater; 
      state.huntPerformedToday = true;
      state.isLoading = false;
    },
    resolveGatherWater: (state, action: PayloadAction<GatherResult>) => {
      const { gathererId, waterGained, outcomeText } = action.payload;
      const { food: startingFood, water: startingWater, survivors: survivorsBefore } = state;

      const healthCost = -(5 + Math.floor(Math.random() * 6)); 
      let survivorsAfterGather = applySurvivorChanges(
        survivorsBefore,
        [{ target: gathererId, healthChange: healthCost }]
      );

      survivorsAfterGather = survivorsAfterGather.map(survivor => {
        const initialHealth = survivorsBefore.find(s => s.id === survivor.id)?.health ?? survivor.health;
        const change = survivor.health - initialHealth;
        return { ...survivor, healthChange: change !== 0 ? change : undefined };
      });

      let tempWater = Math.max(0, startingWater + waterGained);

      state.survivors = survivorsAfterGather;
      state.water = tempWater;
      state.lastOutcome = `${outcomeText} The effort cost ${Math.abs(healthCost)} health.`;
      state.foodChange = state.food - startingFood;
      state.waterChange = tempWater - startingWater;
      state.gatherPerformedToday = true;
      state.isLoading = false;
    },
    finishNamingCompanion: (
      state,
      action: PayloadAction<{ survivorId: string; newName: string }>
    ) => {
      const { survivorId, newName } = action.payload;
      if (!state.companionToNameInfo || !state.isNamingCompanion) return;

      const { food: startingFood, water: startingWater, day: currentDay, survivors: survivorsBeforeNaming } = state;

      const finalName = newName.trim() || state.companionToNameInfo.companion.name;
      const outcome = `You named the new companion '${finalName}'.`;

      const updatedSurvivors = survivorsBeforeNaming.map(survivor => 
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
      const { food: startingFood, water: startingWater, day: currentDay, survivors: survivorsBeforeSkipping } = state;
      
      const outcome = `You decided not to name the ${state.companionToNameInfo?.companion?.type || 'new arrival'} for now.`;
      state.lastOutcome += ` ${outcome}`;
      state.isNamingCompanion = false;
      state.companionToNameInfo = null;

      proceedToNextDay(state, startingFood, startingWater, state.food, state.water, survivorsBeforeSkipping, currentDay);
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
      return { ...action.payload, isLoading: false, error: null, eventHistory: action.payload.eventHistory || [] };
    },
    resetGame: (state) => {
      return { ...initialState, theme: state.theme, isLoading: true, eventHistory: [] };
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
        const finalChoices: GameChoice[] = 
            Array.isArray(choices) && choices.length > 0
            ? choices
            : [
                {
                    action: 'Acknowledge and continue...',
                    cost: { food: 0, water: 0 },
                    outcome: 'You acknowledge the situation and prepare for what comes next.',
                    foodChange: 0, 
                    waterChange: 0, 
                    survivorChanges: [],
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
            action: 'Hunker down and wait...',
            cost: { food: 0, water: 0 },
            outcome: 'You cautiously wait, conserving energy.',
            foodChange: 0, 
            waterChange: 0, 
            survivorChanges: [],
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

    const completedEventText = state.eventText;
    const completedChoiceOutcome = state.lastOutcome;
    
    const player = survivorsBeforeConsumption.find(s => s.id === 'player');
    if (player && player.health > 0 && player.statuses.includes('Fever')) {
        if (Math.random() < 0.25) {
            state.lastOutcome = `${completedChoiceOutcome} // The fever overwhelmed you, causing you to lose track of time. A day passes in a haze.`;
            
            const { foodConsumed, waterConsumed } = calculateDailyConsumption(survivorsBeforeConsumption);
            let foodAfterConsumption = foodBeforeConsumption - foodConsumed;
            let waterAfterConsumption = waterBeforeConsumption - waterConsumed;
            
            let survivorsAfterDailyEffects = applyDailyStatusEffects(survivorsBeforeConsumption);
            
            foodAfterConsumption = Math.max(0, foodAfterConsumption);
            waterAfterConsumption = Math.max(0, waterAfterConsumption);
            
            const gameOverMsgAfterLostDay = checkGameOver(
                foodAfterConsumption,
                waterAfterConsumption,
                survivorsAfterDailyEffects
            );
            
            if (gameOverMsgAfterLostDay) {
                 state.food = foodAfterConsumption;
                 state.water = waterAfterConsumption;
                 state.survivors = survivorsAfterDailyEffects;
                 state.isGameOver = true;
                 state.gameOverMessage = `${gameOverMsgAfterLostDay} (Lost day to fever). Game Over.`;
                 state.eventText = `Day ${previousDay}: The fever claims you... ${gameOverMsgAfterLostDay}`;
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
            state.currentChoices = null;
            return;
        }
    }

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

    let survivorsBeforeDailyEffects = survivorsBeforeConsumption.map(s => ({ ...s, healthChange: undefined }));

    let survivorsAfterDailyEffects = applyDailyStatusEffects(survivorsBeforeDailyEffects);

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

    if (previousDay >= 1 && completedEventText && completedChoiceOutcome) {
        const historyEntry: EventHistoryEntry = {
            day: previousDay,
            description: completedEventText,
            outcome: completedChoiceOutcome,
        };
        state.eventHistory = [historyEntry, ...state.eventHistory].slice(0, MAX_HISTORY_LENGTH);
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
    state.currentChoices = null;
    state.huntPerformedToday = false;
    state.gatherPerformedToday = false;
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
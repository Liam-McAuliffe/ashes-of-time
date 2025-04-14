import { GameActionTypes } from '../actions/gameActions';
import {
  checkGameOver,
  applyDailyStatusEffects,
  applySurvivorChanges,
  calculateDailyConsumption,
} from '../utils/gameLogic';

export const initialGameState = {
  day: 1,
  food: 20,
  water: 20,
  survivors: [
    { id: 'player', name: 'You', health: 100, statuses: [], companion: null },
  ],
  foodChange: 0,
  waterChange: 0,
  eventText: 'Loading day 1...',
  currentChoices: null,
  lastOutcome: '',
  isLoading: true,
  error: null,
  isGameOver: false,
  gameOverMessage: '',
  isNamingCompanion: false,
  companionToNameInfo: null,
  theme: 'Nuclear Winter',
};

export function gameStateReducer(state, action) {
  console.log('Reducer Action:', action.type, action.payload);

  switch (action.type) {
    case GameActionTypes.FETCH_EVENT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        currentChoices: null,
        eventText:
          state.day === 1
            ? 'Fetching situation report...'
            : 'Advancing to the next day...',
      };

    case GameActionTypes.FETCH_EVENT_SUCCESS: {
      const { description, choices } = action.payload;
      const finalChoices =
        Array.isArray(choices) && choices.length > 0
          ? choices
          : [
              {
                id: 'continue',
                text: 'Continue...',
                cost: { food: 0, water: 0 },
                outcome: 'You acknowledged the situation.',
                effects: { food: 0, water: 0, survivorChanges: [] },
              },
            ];
      return {
        ...state,
        isLoading: false,
        eventText:
          description || 'An unexpected silence falls over the bunker.',
        currentChoices: finalChoices,
        error: null,
      };
    }

    case GameActionTypes.FETCH_EVENT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error || 'Failed to get event.',
        eventText: 'Radio silence...',
        currentChoices: [
          {
            id: 'continue_error',
            text: 'Try to wait it out...',
            cost: { food: 0, water: 0 },
            outcome: 'You cautiously wait...',
            effects: { food: 0, water: 0, survivorChanges: [] },
          },
        ],
      };

    case GameActionTypes.APPLY_CHOICE: {
      const { choice } = action.payload;
      const {
        food: startingFood,
        water: startingWater,
        survivors: startingSurvivors,
        day,
      } = state;
      let tempFood = startingFood - (choice.cost?.food || 0);
      let tempWater = startingWater - (choice.cost?.water || 0);
      tempFood += choice.effects?.food || 0;
      tempWater += choice.effects?.water || 0;
      const survivorsAfterChoiceEffects = applySurvivorChanges(
        startingSurvivors,
        choice.effects?.survivorChanges
      );
      tempFood = Math.max(0, tempFood);
      tempWater = Math.max(0, tempWater);

      let newlyAddedCompanionInfo = null;
      for (const survivor of survivorsAfterChoiceEffects) {
        const oldSurvivor = startingSurvivors.find((s) => s.id === survivor.id);
        if (survivor.companion && !oldSurvivor?.companion) {
          newlyAddedCompanionInfo = {
            survivorId: survivor.id,
            companion: survivor.companion,
          };
          break;
        }
      }

      if (newlyAddedCompanionInfo) {
        return {
          ...state,
          food: tempFood,
          water: tempWater,
          survivors: survivorsAfterChoiceEffects,
          lastOutcome: choice.outcome || `You chose: ${choice.text}`,
          currentChoices: null,
          isLoading: false,
          error: null,
          isNamingCompanion: true,
          companionToNameInfo: newlyAddedCompanionInfo,
        };
      }

      let gameOverMsg = checkGameOver(
        tempFood,
        tempWater,
        survivorsAfterChoiceEffects
      );
      if (gameOverMsg) {
        return {
          ...state,
          food: tempFood,
          water: tempWater,
          survivors: survivorsAfterChoiceEffects,
          foodChange: tempFood - startingFood,
          waterChange: tempWater - startingWater,
          lastOutcome: choice.outcome || `You chose: ${choice.text}`,
          isGameOver: true,
          gameOverMessage: `${gameOverMsg} Game Over.`,
          eventText: `Day ${day}: The struggle ends... ${gameOverMsg}`,
          currentChoices: null,
          isLoading: false,
        };
      }

      const { foodConsumed, waterConsumed } = calculateDailyConsumption(
        survivorsAfterChoiceEffects
      );
      let foodForNextDay = tempFood - foodConsumed;
      let waterForNextDay = tempWater - waterConsumed;
      let survivorsAfterDaily = applyDailyStatusEffects(
        survivorsAfterChoiceEffects
      );
      foodForNextDay = Math.max(0, foodForNextDay);
      waterForNextDay = Math.max(0, waterForNextDay);

      gameOverMsg = checkGameOver(
        foodForNextDay,
        waterForNextDay,
        survivorsAfterDaily
      );
      if (gameOverMsg) {
        return {
          ...state,
          food: foodForNextDay,
          water: waterForNextDay,
          survivors: survivorsAfterDaily,
          foodChange: foodForNextDay - startingFood,
          waterChange: waterForNextDay - startingWater,
          lastOutcome: choice.outcome || `You chose: ${choice.text}`,
          isGameOver: true,
          gameOverMessage: `${gameOverMsg} Game Over.`,
          eventText: `Day ${day}: The struggle ends... ${gameOverMsg}`,
          currentChoices: null,
          isLoading: false,
        };
      }

      const nextDayNumber = day + 1;
      const netFoodChange = foodForNextDay - startingFood;
      const netWaterChange = waterForNextDay - startingWater;
      const finalOutcomeText = choice.outcome || `You chose: ${choice.text}`;

      return {
        ...state,
        day: nextDayNumber,
        food: foodForNextDay,
        water: waterForNextDay,
        survivors: survivorsAfterDaily,
        foodChange: netFoodChange,
        waterChange: netWaterChange,
        lastOutcome: finalOutcomeText,
        currentChoices: null,
        isLoading: true,
        error: null,
        isNamingCompanion: false,
        companionToNameInfo: null,
      };
    }

    case GameActionTypes.RESOLVE_HUNTING: {
      const { hunterId, foodGained, healthChange, outcomeText } =
        action.payload;
      const {
        food: startingFood,
        water: startingWater,
        survivors: startingSurvivors,
        day,
      } = state;

      let tempFood = startingFood + foodGained;
      let tempWater = startingWater;
      const survivorsAfterHuntEffects = applySurvivorChanges(
        startingSurvivors,
        [{ target: hunterId, healthChange: healthChange }]
      );

      tempFood = Math.max(0, tempFood);
      tempWater = Math.max(0, tempWater);

      let gameOverMsg = checkGameOver(
        tempFood,
        tempWater,
        survivorsAfterHuntEffects
      );
      if (gameOverMsg) {
        return {
          ...state,
          food: tempFood,
          water: tempWater,
          survivors: survivorsAfterHuntEffects,
          foodChange: tempFood - startingFood,
          waterChange: tempWater - startingWater,
          lastOutcome: outcomeText,
          isGameOver: true,
          gameOverMessage: `${gameOverMsg} Game Over.`,
          eventText: `Day ${day}: The struggle ends... ${gameOverMsg}`,
          currentChoices: null,
          isLoading: false,
        };
      }

      const { foodConsumed, waterConsumed } = calculateDailyConsumption(
        survivorsAfterHuntEffects
      );
      let foodForNextDay = tempFood - foodConsumed;
      let waterForNextDay = tempWater - waterConsumed;
      let survivorsAfterDaily = applyDailyStatusEffects(
        survivorsAfterHuntEffects
      );

      foodForNextDay = Math.max(0, foodForNextDay);
      waterForNextDay = Math.max(0, waterForNextDay);

      gameOverMsg = checkGameOver(
        foodForNextDay,
        waterForNextDay,
        survivorsAfterDaily
      );
      if (gameOverMsg) {
        return {
          ...state,
          food: foodForNextDay,
          water: waterForNextDay,
          survivors: survivorsAfterDaily,
          foodChange: foodForNextDay - startingFood,
          waterChange: waterForNextDay - startingWater,
          lastOutcome: outcomeText,
          isGameOver: true,
          gameOverMessage: `${gameOverMsg} Game Over.`,
          eventText: `Day ${day}: The struggle ends... ${gameOverMsg}`,
          currentChoices: null,
          isLoading: false,
        };
      }

      const nextDayNumber = day + 1;
      const netFoodChange = foodForNextDay - startingFood;
      const netWaterChange = waterForNextDay - startingWater;

      return {
        ...state,
        day: nextDayNumber,
        food: foodForNextDay,
        water: waterForNextDay,
        survivors: survivorsAfterDaily,
        foodChange: netFoodChange,
        waterChange: netWaterChange,
        lastOutcome: outcomeText,
        currentChoices: null,
        isLoading: true,
        error: null,
        isNamingCompanion: false,
        companionToNameInfo: null,
      };
    }

    case GameActionTypes.RESOLVE_GATHER_WATER: {
      const { gathererId, waterGained, healthChange, outcomeText } =
        action.payload;
      const {
        food: startingFood,
        water: startingWater,
        survivors: startingSurvivors,
        day,
      } = state;

      let tempFood = startingFood;
      let tempWater = startingWater + waterGained;
      const survivorsAfterGatherEffects = applySurvivorChanges(
        startingSurvivors,
        [{ target: gathererId, healthChange: healthChange }]
      );

      tempFood = Math.max(0, tempFood);
      tempWater = Math.max(0, tempWater);

      let gameOverMsg = checkGameOver(
        tempFood,
        tempWater,
        survivorsAfterGatherEffects
      );
      if (gameOverMsg) {
        return {
          ...state,
          food: tempFood,
          water: tempWater,
          survivors: survivorsAfterGatherEffects,
          foodChange: tempFood - startingFood,
          waterChange: tempWater - startingWater,
          lastOutcome: outcomeText,
          isGameOver: true,
          gameOverMessage: `${gameOverMsg} Game Over.`,
          eventText: `Day ${day}: The struggle ends... ${gameOverMsg}`,
          currentChoices: null,
          isLoading: false,
        };
      }

      const { foodConsumed, waterConsumed } = calculateDailyConsumption(
        survivorsAfterGatherEffects
      );
      let foodForNextDay = tempFood - foodConsumed;
      let waterForNextDay = tempWater - waterConsumed;
      let survivorsAfterDaily = applyDailyStatusEffects(
        survivorsAfterGatherEffects
      );

      foodForNextDay = Math.max(0, foodForNextDay);
      waterForNextDay = Math.max(0, waterForNextDay);

      gameOverMsg = checkGameOver(
        foodForNextDay,
        waterForNextDay,
        survivorsAfterDaily
      );
      if (gameOverMsg) {
        return {
          ...state,
          food: foodForNextDay,
          water: waterForNextDay,
          survivors: survivorsAfterDaily,
          foodChange: foodForNextDay - startingFood,
          waterChange: waterForNextDay - startingWater,
          lastOutcome: outcomeText,
          isGameOver: true,
          gameOverMessage: `${gameOverMsg} Game Over.`,
          eventText: `Day ${day}: The struggle ends... ${gameOverMsg}`,
          currentChoices: null,
          isLoading: false,
        };
      }

      const nextDayNumber = day + 1;
      const netFoodChange = foodForNextDay - startingFood;
      const netWaterChange = waterForNextDay - startingWater;

      return {
        ...state,
        day: nextDayNumber,
        food: foodForNextDay,
        water: waterForNextDay,
        survivors: survivorsAfterDaily,
        foodChange: netFoodChange,
        waterChange: netWaterChange,
        lastOutcome: outcomeText,
        currentChoices: null,
        isLoading: true,
        error: null,
        isNamingCompanion: false,
        companionToNameInfo: null,
      };
    }

    case GameActionTypes.FINISH_NAMING_COMPANION: {
      const { survivorId, newName } = action.payload;
      if (!survivorId || !newName || !state.companionToNameInfo) {
        return { ...state, isLoading: false };
      }

      const updatedSurvivors = state.survivors.map((survivor) =>
        survivor.id === survivorId && survivor.companion
          ? {
              ...survivor,
              companion: {
                ...survivor.companion,
                name:
                  newName.trim() || state.companionToNameInfo.companion.name,
              },
            }
          : survivor
      );

      const { food: currentFood, water: currentWater, day: currentDay } = state;
      const { foodConsumed, waterConsumed } =
        calculateDailyConsumption(updatedSurvivors);
      let foodForNextDay = currentFood - foodConsumed;
      let waterForNextDay = currentWater - waterConsumed;
      let survivorsAfterDaily = applyDailyStatusEffects(updatedSurvivors);

      foodForNextDay = Math.max(0, foodForNextDay);
      waterForNextDay = Math.max(0, waterForNextDay);

      const gameOverMsg = checkGameOver(
        foodForNextDay,
        waterForNextDay,
        survivorsAfterDaily
      );
      const outcome = `${
        updatedSurvivors.find((s) => s.id === survivorId)?.name || 'Someone'
      } named your new companion '${newName}'.`;

      if (gameOverMsg) {
        return {
          ...state,
          food: foodForNextDay,
          water: waterForNextDay,
          survivors: survivorsAfterDaily,
          foodChange: foodForNextDay - state.food,
          waterChange: waterForNextDay - state.water,
          lastOutcome: outcome,
          isGameOver: true,
          gameOverMessage: `${gameOverMsg} Game Over.`,
          eventText: `Day ${currentDay}: The struggle ends... ${gameOverMsg}`,
          currentChoices: null,
          isLoading: false,
          isNamingCompanion: false,
          companionToNameInfo: null,
        };
      }

      const nextDayNumber = currentDay + 1;
      const netFoodChange = foodForNextDay - state.food;
      const netWaterChange = waterForNextDay - state.water;

      return {
        ...state,
        day: nextDayNumber,
        food: foodForNextDay,
        water: waterForNextDay,
        survivors: survivorsAfterDaily,
        foodChange: netFoodChange,
        waterChange: netWaterChange,
        isNamingCompanion: false,
        companionToNameInfo: null,
        isLoading: true,
        error: null,
        lastOutcome: outcome,
      };
    }

    case GameActionTypes.SET_CHOICE_ERROR:
      return { ...state, error: action.payload.error, isLoading: false };

    case GameActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    case GameActionTypes.SET_GAME_OVER:
      return {
        ...state,
        isGameOver: true,
        gameOverMessage: action.payload.message || 'The journey ends.',
        currentChoices: null,
        isLoading: false,
      };

    case GameActionTypes.START_COMPANION_NAMING:
      return {
        ...state,
        isNamingCompanion: true,
        companionToNameInfo: action.payload,
        isLoading: false,
        currentChoices: null,
      };

    case GameActionTypes.COMPLETE_COMPANION_NAMING: {
      const {
        survivorId: completeSurvivorId,
        companionName: completeCompanionName,
      } = action.payload;
      const completedSurvivors = state.survivors.map((survivor) =>
        survivor.id === completeSurvivorId && survivor.companion
          ? {
              ...survivor,
              companion: { ...survivor.companion, name: completeCompanionName },
            }
          : survivor
      );
      return {
        ...state,
        survivors: completedSurvivors,
        isNamingCompanion: false,
        companionToNameInfo: null,
      };
    }

    case GameActionTypes.CANCEL_COMPANION_NAMING:
      return {
        ...state,
        isNamingCompanion: false,
        companionToNameInfo: null,
        isLoading: true,
        error: null,
        lastOutcome: state.lastOutcome + ' Naming the companion was skipped.',
      };

    default:
      return state;
  }
}

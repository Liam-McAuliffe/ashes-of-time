import { useReducer, useEffect, useCallback } from 'react';
import {
  gameStateReducer,
  initialGameState,
} from '../reducers/gameStateReducer';
import { GameActionTypes } from '../actions/gameActions';
import { fetchEventFromApi } from '../services/gameService';

export function useGameState() {
  const [state, dispatch] = useReducer(gameStateReducer, initialGameState);

  const {
    day,
    food,
    water,
    survivors,
    foodChange,
    waterChange,
    eventText,
    isLoading,
    error,
    isGameOver,
    gameOverMessage,
    currentChoices,
    lastOutcome,
    isNamingCompanion,
    companionToNameInfo,
    theme,
  } = state;

  const fetchNextEvent = useCallback(async () => {
    if (state.isGameOver) return;

    dispatch({ type: GameActionTypes.FETCH_EVENT_START });

    const livingSurvivorCount = state.survivors.filter(
      (s) => s.health > 0
    ).length;
    const situation = `Food: ${state.food}, Water: ${state.water}, Survivors: ${livingSurvivorCount}`;
    const promptContext = {
      day: state.day,
      food: state.food,
      water: state.water,
      situation: situation,
      previousDay: state.lastOutcome,
      survivors: state.survivors,
      theme: state.theme,
    };

    try {
      const data = await fetchEventFromApi(promptContext);
      dispatch({ type: GameActionTypes.FETCH_EVENT_SUCCESS, payload: data });
    } catch (e) {
      dispatch({
        type: GameActionTypes.FETCH_EVENT_FAILURE,
        payload: { error: e.message || 'Unknown API error' },
      });
    }
  }, [
    state.day,
    state.food,
    state.water,
    state.survivors,
    state.lastOutcome,
    state.isGameOver,
    state.theme,
  ]);

  const handleChoice = useCallback(
    (choice) => {
      if (state.isGameOver || state.isLoading) return;

      dispatch({ type: GameActionTypes.CLEAR_ERROR });

      const costFood = choice.cost?.food || 0;
      const costWater = choice.cost?.water || 0;

      if (state.food < costFood || state.water < costWater) {
        dispatch({
          type: GameActionTypes.SET_CHOICE_ERROR,
          payload: {
            error: `Not enough resources! Needs ${costFood} food, ${costWater} water.`,
          },
        });
        return;
      }

      dispatch({ type: GameActionTypes.APPLY_CHOICE, payload: { choice } });
    },
    [state.isGameOver, state.isLoading, state.food, state.water]
  );

  useEffect(() => {
    if (
      !state.isGameOver &&
      state.isLoading &&
      state.day > 1 &&
      !state.isNamingCompanion
    ) {
      fetchNextEvent();
    }
  }, [
    state.day,
    state.isLoading,
    state.isGameOver,
    state.isNamingCompanion,
    fetchNextEvent,
  ]);

  useEffect(() => {
    if (
      state.isLoading &&
      state.day === 1 &&
      !state.isGameOver &&
      !state.isNamingCompanion
    ) {
      fetchNextEvent();
    }
  }, [fetchNextEvent]);

  return {
    day,
    food,
    water,
    survivors,
    foodChange,
    waterChange,
    eventText,
    isLoading,
    error,
    isGameOver,
    gameOverMessage,
    currentChoices,
    lastOutcome,
    handleChoice,
    isNamingCompanion,
    companionToNameInfo,
    dispatch,
    theme,
  };
}

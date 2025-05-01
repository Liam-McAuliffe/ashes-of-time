'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameState, GameChoice, HuntResult, GatherResult } from '../types/game';
import { GameActionTypes } from '../actions/gameActions';

interface GameContextType extends GameState {
  handleChoice: (choice: GameChoice) => void;
  handleHuntComplete: (result: HuntResult) => void;
  handleGatherComplete: (result: GatherResult) => void;
  dispatch: React.Dispatch<any>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const gameState = useGameState();
  
  const handleHuntComplete = (huntResults: HuntResult) => {
    if (gameState.isLoading || gameState.isNamingCompanion || gameState.isGameOver) return;
    gameState.dispatch({ type: GameActionTypes.RESOLVE_HUNTING, payload: huntResults });
    gameState.dispatch({ type: GameActionTypes.CLEAR_ERROR });
  };

  const handleGatherComplete = (gatherResults: GatherResult) => {
    if (gameState.isLoading || gameState.isNamingCompanion || gameState.isGameOver) return;
    gameState.dispatch({
      type: GameActionTypes.RESOLVE_GATHER_WATER,
      payload: gatherResults,
    });
    gameState.dispatch({ type: GameActionTypes.CLEAR_ERROR });
  };

  const value = {
    ...gameState,
    handleHuntComplete,
    handleGatherComplete,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 
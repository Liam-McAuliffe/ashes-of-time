'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch, useEventFetcher } from '../hooks';
import {
  applyChoice,
  resolveHunting,
  resolveGatherWater,
  setChoiceError,
  clearError,
  finishNamingCompanion,
  resetGame,
} from '../store/slices/gameSlice';
import ResourceDisplay from '../components/game/ResourceDisplay';
import EventDisplay from '../components/game/EventDisplay';
import ChoiceList from '../components/game/ChoiceList';
import GameOverScreen from '../components/game/GameOverScreen';
import SurvivorDisplay from '../components/game/SurvivorDisplay';
import Prologue from '../components/game/Prologue';
import NameCompanionInput from '../components/game/NameCompanionInput';
import PlayerActions from '../components/game/PlayerActions';
import type { GameChoice, HuntResult, GatherResult } from '../types/game';

export default function GamePage() {
  const dispatch = useAppDispatch();
  
  useEventFetcher();

  const gameState = useAppSelector((state) => state.game);
  
  const [isStarted, setIsStarted] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const handleChoice = (choice: GameChoice) => {
    if (gameState.isGameOver || gameState.isLoading) return;

    dispatch(clearError());

    const costFood = choice.cost?.food || 0;
    const costWater = choice.cost?.water || 0;

    if (gameState.food < costFood || gameState.water < costWater) {
      dispatch(
        setChoiceError({
          error: `Not enough resources! Needs ${costFood} food, ${costWater} water.`,
        })
      );
      return;
    }

    dispatch(applyChoice({ choice }));
  };

  const handleHuntStart = () => {
    setCurrentAction('hunting');
  };

  const handleGatherStart = () => {
    setCurrentAction('gathering');
  };

  const handleHuntComplete = (results: HuntResult) => {
    setCurrentAction(null);
    dispatch(resolveHunting(results));
  };

  const handleGatherComplete = (results: GatherResult) => {
    setCurrentAction(null);
    dispatch(resolveGatherWater(results));
  };

  const handleStartGame = () => {
    setIsStarted(true);
    dispatch(resetGame());
  };

  if (gameState.isGameOver) {
    return <GameOverScreen message={gameState.gameOverMessage} day={gameState.day} />;
  }

  const mainBgClass = isStarted ? 'bg-stone' : 'bg-charcoal';
  const canTakeAction =
    !gameState.isLoading && !gameState.isNamingCompanion && !gameState.isGameOver && !currentAction;

  return (
    <main className={`min-h-screen ${mainBgClass} text-olive transition-colors duration-500 font-mono`}>
      {!isStarted ? (
        <Prologue onStartGame={handleStartGame} />
      ) : (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 lg:gap-8">
          
          {/* Column 1: Status Info */}
          <div className="md:w-1/3 lg:w-1/4 flex flex-col gap-4">
              <ResourceDisplay
                day={gameState.day}
                food={gameState.food}
                water={gameState.water}
                foodChange={gameState.foodChange}
                waterChange={gameState.waterChange}
                survivors={gameState.survivors}
              />
              <SurvivorDisplay survivors={gameState.survivors} />
          </div>

          {/* Column 2: Narrative & Actions */}
          <div className="md:w-2/3 lg:w-3/4 flex flex-col gap-4">
              <EventDisplay
                text={gameState.eventText}
                isLoading={gameState.isLoading}
                error={gameState.error}
                lastOutcome={gameState.lastOutcome}
              />
              
              {/* Conditional Rendering for Naming vs. Choices/Actions */}
              {gameState.isNamingCompanion && gameState.companionToNameInfo ? (
                <NameCompanionInput
                  companionToNameInfo={gameState.companionToNameInfo}
                />
              ) : (
                <>
                  {gameState.currentChoices && (
                    <ChoiceList
                      choices={gameState.currentChoices}
                      onChoiceSelected={handleChoice}
                      isLoading={gameState.isLoading || currentAction !== null}
                      currentFood={gameState.food}
                      currentWater={gameState.water}
                    />
                  )}
                  <PlayerActions
                    survivors={gameState.survivors}
                    onHuntComplete={handleHuntComplete}
                    onGatherComplete={handleGatherComplete}
                    onHuntStart={handleHuntStart}
                    onGatherStart={handleGatherStart}
                    disabled={!canTakeAction}
                    currentAction={currentAction}
                  />
                </>
              )}
          </div>

        </div>
      )}
    </main>
  );
} 
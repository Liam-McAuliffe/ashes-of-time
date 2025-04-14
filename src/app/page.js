'use client';

import { useGameState } from '../hooks/useGameState';
import ResourceDisplay from '../components/game/ResourceDisplay';
import EventDisplay from '../components/game/EventDisplay';
import ChoiceList from '../components/game/ChoiceList';
import GameOverScreen from '../components/game/GameOverScreen';
import SurvivorDisplay from '../components/game/SurvivorDisplay';
import { useState } from 'react';
import Prologue from '../components/game/Prologue';
import NameCompanionInput from '../components/game/NameCompanionInput';
import { GameActionTypes } from '@/actions/gameActions';
import PlayerActions from '../components/game/PlayerActions';

function GamePage() {
  const {
    day,
    food,
    water,
    foodChange,
    waterChange,
    survivors,
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
  } = useGameState();

  const [isStarted, setIsStarted] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);

  const handleHuntStart = () => {
    setCurrentAction('hunting');
  };

  const handleGatherStart = () => {
    setCurrentAction('gathering');
  };

  const handleHuntComplete = (huntResults) => {
    if (isLoading || isNamingCompanion || isGameOver) return;
    setCurrentAction(null);
    dispatch({ type: GameActionTypes.RESOLVE_HUNTING, payload: huntResults });
    dispatch({ type: GameActionTypes.CLEAR_ERROR });
  };

  const handleGatherComplete = (gatherResults) => {
    if (isLoading || isNamingCompanion || isGameOver) return;
    setCurrentAction(null);
    dispatch({
      type: GameActionTypes.RESOLVE_GATHER_WATER,
      payload: gatherResults,
    });
    dispatch({ type: GameActionTypes.CLEAR_ERROR });
  };

  if (isGameOver) {
    return <GameOverScreen message={gameOverMessage} day={day} />;
  }

  const mainBgClass = isStarted ? 'bg-stone' : 'bg-charcoal';
  const canTakeAction =
    !isLoading && !isNamingCompanion && !isGameOver && !currentAction;

  console.log('Rendering GamePage component', {
    isLoading,
    isNamingCompanion,
    currentAction,
  });

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24 ${mainBgClass} transition-colors duration-500 ease-in-out`}
    >
      {!isStarted ? (
        <Prologue setIsStarted={setIsStarted} />
      ) : (
        <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm flex flex-col space-y-6">
          <ResourceDisplay
            day={day}
            food={food}
            water={water}
            foodChange={foodChange}
            waterChange={waterChange}
            survivors={survivors}
          />
          <SurvivorDisplay survivors={survivors} />

          {isNamingCompanion ? (
            <NameCompanionInput
              companionInfo={companionToNameInfo}
              dispatch={dispatch}
            />
          ) : (
            <EventDisplay
              lastOutcome={lastOutcome}
              eventText={eventText}
              isLoading={isLoading}
              currentChoices={currentChoices}
            />
          )}

          {!isNamingCompanion && (
            <>
              <PlayerActions
                survivors={survivors}
                onHuntComplete={handleHuntComplete}
                onGatherComplete={handleGatherComplete}
                onHuntStart={handleHuntStart}
                onGatherStart={handleGatherStart}
                disabled={!canTakeAction}
                currentAction={currentAction}
              />

              {!currentAction && (
                <ChoiceList
                  choices={currentChoices}
                  onChoiceSelected={handleChoice}
                  isLoading={!canTakeAction}
                  currentFood={food}
                  currentWater={water}
                />
              )}
            </>
          )}

          {error && !isNamingCompanion && (
            <p className="text-red-500 mt-2 font-semibold text-center w-full bg-red-100 p-2 rounded border border-red-300">
              Error: {error}
            </p>
          )}
        </div>
      )}
    </main>
  );
}

export default GamePage;

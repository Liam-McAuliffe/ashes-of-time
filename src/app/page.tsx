'use client';

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import ResourceDisplay from '../components/game/ResourceDisplay';
import EventDisplay from '../components/game/EventDisplay';
import ChoiceList from '../components/game/ChoiceList';
import GameOverScreen from '../components/game/GameOverScreen';
import SurvivorDisplay from '../components/game/SurvivorDisplay';
import Prologue from '../components/game/Prologue';
import NameCompanionInput from '../components/game/NameCompanionInput';
import PlayerActions from '../components/game/PlayerActions';

export default function GamePage() {
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
    handleHuntComplete,
    handleGatherComplete,
  } = useGame();

  const [isStarted, setIsStarted] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const handleHuntStart = () => {
    setCurrentAction('hunting');
  };

  const handleGatherStart = () => {
    setCurrentAction('gathering');
  };

  const handleActionComplete = (results: any) => {
    setCurrentAction(null);
    if (currentAction === 'hunting') {
      handleHuntComplete(results);
    } else if (currentAction === 'gathering') {
      handleGatherComplete(results);
    }
  };

  if (isGameOver) {
    return <GameOverScreen message={gameOverMessage} day={day} />;
  }

  const mainBgClass = isStarted ? 'bg-stone' : 'bg-charcoal';
  const canTakeAction =
    !isLoading && !isNamingCompanion && !isGameOver && !currentAction;

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
                onHuntComplete={handleActionComplete}
                onGatherComplete={handleActionComplete}
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
            <div className="text-red-500 mt-2 font-semibold text-center w-full bg-red-100 p-2 rounded border border-red-300" 
                 role="alert" aria-live="assertive">
              Error: {error}
            </div>
          )}
        </div>
      )}
    </main>
  );
} 
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
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
import { ActorSelectionModal } from '../components/game/ActorSelectionModal';
import HuntingMiniGame from '../components/game/HuntingMiniGame';
import GatherWaterMiniGame from '../components/game/GatherWaterMiniGame';
import type { GameChoice, HuntResult, GatherResult, Survivor } from '../types/game';

export default function GamePage() {
  const dispatch = useAppDispatch();
  
  useEventFetcher();

  const gameState = useAppSelector((state) => state.game);
  
  const [isStarted, setIsStarted] = useState(false);
  const [selectingActorFor, setSelectingActorFor] = useState<null | 'hunt' | 'gather'>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<null | 'hunt' | 'gather'>(null);
  const [actorForMiniGame, setActorForMiniGame] = useState<Survivor | null>(null);

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

  const handleSelectActor = useCallback((actionType: 'hunt' | 'gather') => {
    setSelectingActorFor(actionType);
  }, []);

  const startActionWithActor = useCallback((actorId: string, actionType: 'hunt' | 'gather') => {
    const actor = gameState.survivors.find(s => s.id === actorId);
    if (!actor) return;
    
    setSelectingActorFor(null);
    setActorForMiniGame(actor);
    setActiveMiniGame(actionType);
  }, [gameState.survivors]);

  const cancelActorSelection = useCallback(() => {
    setSelectingActorFor(null);
  }, []);

  const handleHuntComplete = useCallback((success: boolean) => {
    if (!actorForMiniGame) return;

    const result: HuntResult = success ? 
        { hunterId: actorForMiniGame.id, foodGained: 5, outcomeText: `${actorForMiniGame.name} succeeded!` } :
        { hunterId: actorForMiniGame.id, foodGained: 0, outcomeText: `${actorForMiniGame.name} failed.` };
    
    dispatch(resolveHunting(result));
    setActiveMiniGame(null);
    setActorForMiniGame(null);
  }, [dispatch, actorForMiniGame]);

  const handleGatherComplete = useCallback((success: boolean) => {
    if (!actorForMiniGame) return;

    const result: GatherResult = success ? 
        { gathererId: actorForMiniGame.id, waterGained: 5, outcomeText: `${actorForMiniGame.name} succeeded!` } : 
        { gathererId: actorForMiniGame.id, waterGained: 0, outcomeText: `${actorForMiniGame.name} failed.` };

    dispatch(resolveGatherWater(result));
    setActiveMiniGame(null);
    setActorForMiniGame(null);
  }, [dispatch, actorForMiniGame]);

  const handleStartGame = () => {
    setIsStarted(true);
    dispatch(resetGame());
  };

  if (gameState.isGameOver) {
    return <GameOverScreen message={gameState.gameOverMessage} day={gameState.day} />;
  }

  const mainBgClass = isStarted ? 'bg-stone' : 'bg-charcoal';
  const canTakeAction =
    !gameState.isLoading && !gameState.isNamingCompanion && !gameState.isGameOver && !activeMiniGame && !selectingActorFor;

  return (
    <main className={`min-h-screen ${mainBgClass} text-olive transition-colors duration-500 font-mono relative`}>
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
                      isLoading={gameState.isLoading || activeMiniGame !== null || selectingActorFor !== null}
                      currentFood={gameState.food}
                      currentWater={gameState.water}
                    />
                  )}
                  <PlayerActions
                    survivors={gameState.survivors}
                    onSelectActor={handleSelectActor}
                    disabled={!canTakeAction}
                    currentAction={null}
                    huntPerformedToday={gameState.huntPerformedToday}
                    gatherPerformedToday={gameState.gatherPerformedToday}
                  />
                </>
              )}
          </div>

        </div>
      )}
      
      {selectingActorFor && (
        <ActorSelectionModal 
            survivors={gameState.survivors}
            actionType={selectingActorFor}
            onSelect={(actorId) => startActionWithActor(actorId, selectingActorFor)}
            onCancel={cancelActorSelection}
        />
      )}
      
      {activeMiniGame === 'hunt' && actorForMiniGame && (
        <HuntingMiniGame 
            onComplete={handleHuntComplete} 
            difficulty={1}
            actorId={actorForMiniGame.id}
            actorStatuses={actorForMiniGame.statuses}
        />
      )}
      {activeMiniGame === 'gather' && actorForMiniGame && (
        <GatherWaterMiniGame 
            onComplete={handleGatherComplete} 
            difficulty={1}
            actorId={actorForMiniGame.id}
        />
      )}
    </main>
  );
} 
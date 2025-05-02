'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
import ResourceDisplaySkeleton from '../components/game/ResourceDisplaySkeleton';
import EventDisplay from '../components/game/EventDisplay';
import ChoiceList from '../components/game/ChoiceList';
import GameOverScreen from '../components/game/GameOverScreen';
import SurvivorDisplay from '../components/game/SurvivorDisplay';
import SurvivorDisplaySkeleton from '../components/game/SurvivorDisplaySkeleton';
import Prologue from '../components/game/Prologue';
import NameCompanionInput from '../components/game/NameCompanionInput';
import PlayerActions from '../components/game/PlayerActions';
import { ActorSelectionModal } from '../components/game/ActorSelectionModal';
import HuntingMiniGame from '../components/game/HuntingMiniGame';
import GatherWaterMiniGame from '../components/game/GatherWaterMiniGame';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import AnimatedTransition from '../components/ui/AnimatedTransition';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import { gameTutorialSteps } from '../components/tutorial/gameTutorialSteps';
import useTutorial from '../hooks/useTutorial';
import type { GameChoice, HuntResult, GatherResult, Survivor } from '../types/game';
import InventoryDisplay from '../components/game/InventoryDisplay';

// Import the new components
import NewResourceDisplay from '../components/ui/ResourceDisplay';
import CraftingPanel from '../components/ui/CraftingPanel';
import SaveManagerPanel from '../components/ui/SaveManagerPanel';
import { processResourceChanges } from '../services/eventManager';
import { useSaveManager } from '../hooks/useSaveManager';
import { updateAdaptiveDifficulty } from '../services/saveManager';
import { populateInventoryWithItems } from '../utils/populateInventory';

export default function GamePage() {
  const dispatch = useAppDispatch();
  
  // Automatically fetch events when needed (on game start or after choices)
  useEventFetcher();

  // Get the entire game state from Redux
  const gameState = useAppSelector((state) => state.game);
  
  // Local UI state
  const [isStarted, setIsStarted] = useState(false);
  const [selectingActorFor, setSelectingActorFor] = useState<null | 'hunt' | 'gather'>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<null | 'hunt' | 'gather'>(null);
  const [actorForMiniGame, setActorForMiniGame] = useState<Survivor | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Setup tutorial
  const { 
    isOpen: isTutorialOpen, 
    openTutorial, 
    closeTutorial, 
    completeTutorial, 
    steps 
  } = useTutorial({
    tutorialId: 'main-game',
    steps: gameTutorialSteps,
    autoShowOnMount: true,
    showOnlyOnce: true
  });

  // Add state variables for new UI panels
  const [showCraftingPanel, setShowCraftingPanel] = useState(false);
  const [showSavePanel, setShowSavePanel] = useState(false);

  // Initialize the save manager hook
  const saveManager = useSaveManager();

  // Simulate initial loading on first render
  useEffect(() => {
    if (isStarted) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isStarted]);

  // Add useEffect to handle adaptive difficulty
  useEffect(() => {
    if (gameState.day > 1 && !gameState.isLoading && !gameState.isGameOver) {
      // Update adaptive difficulty based on player performance
      updateAdaptiveDifficulty(gameState);
    }
  }, [gameState.day]);

  /**
   * Handles when a player selects a choice from the current event
   * 
   * 1. Validates if the player has enough resources for the choice
   * 2. Clears any previous errors
   * 3. Dispatches the choice to update game state
   */
  const handleChoice = (choice: GameChoice) => {
    // Don't allow choices if game is over or loading
    if (gameState.isGameOver || gameState.isLoading) return;

    dispatch(clearError());

    // Check if player has enough resources for this choice
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

    // Process advanced resource changes if present
    if (choice.resourceChanges) {
      const processedState = processResourceChanges(gameState, {
        foodChange: choice.foodChange || 0,
        waterChange: choice.waterChange || 0,
        resourceChanges: choice.resourceChanges
      });
      
      // Apply the processed state with the choice
      dispatch(applyChoice({ 
        choice: {
          ...choice,
          foodChange: processedState.food - gameState.food,
          waterChange: processedState.water - gameState.water
        } 
      }));
    } else {
      // Apply the choice effects as normal
      dispatch(applyChoice({ choice }));
    }
  };

  /**
   * Initiates the actor selection process for an action 
   * 
   * Opens the modal to select which survivor will perform hunting or gathering
   */
  const handleSelectActor = useCallback((actionType: 'hunt' | 'gather') => {
    setSelectingActorFor(actionType);
  }, []);

  /**
   * Starts the selected mini-game with the chosen actor
   * 
   * Called after a survivor is selected from the ActorSelectionModal
   */
  const startActionWithActor = useCallback((actorId: string, actionType: 'hunt' | 'gather') => {
    // Find the survivor by ID
    const actor = gameState.survivors.find(s => s.id === actorId);
    if (!actor) return;
    
    // Close the selection modal and start the mini-game
    setSelectingActorFor(null);
    setActorForMiniGame(actor);
    setActiveMiniGame(actionType);
  }, [gameState.survivors]);

  /**
   * Cancels the actor selection process
   */
  const cancelActorSelection = useCallback(() => {
    setSelectingActorFor(null);
  }, []);

  /**
   * Handles the completion of the hunting mini-game
   * 
   * Creates a result object with food gained and outcome text,
   * then dispatches the result to update game state
   */
  const handleHuntComplete = useCallback((success: boolean) => {
    if (!actorForMiniGame) return;

    // Create the hunting result based on success/failure
    const result: HuntResult = success ? 
        { hunterId: actorForMiniGame.id, foodGained: 5, outcomeText: `${actorForMiniGame.name} succeeded!` } :
        { hunterId: actorForMiniGame.id, foodGained: 0, outcomeText: `${actorForMiniGame.name} failed.` };
    
    // Update game state with the hunting result
    dispatch(resolveHunting(result));
    setActiveMiniGame(null);
    setActorForMiniGame(null);
  }, [dispatch, actorForMiniGame]);

  /**
   * Handles the completion of the gathering mini-game
   * 
   * Creates a result object with water gained and outcome text,
   * then dispatches the result to update game state
   */
  const handleGatherComplete = useCallback((success: boolean) => {
    if (!actorForMiniGame) return;

    // Create the gathering result based on success/failure
    const result: GatherResult = success ? 
        { gathererId: actorForMiniGame.id, waterGained: 5, outcomeText: `${actorForMiniGame.name} succeeded!` } : 
        { gathererId: actorForMiniGame.id, waterGained: 0, outcomeText: `${actorForMiniGame.name} failed.` };

    // Update game state with the gathering result
    dispatch(resolveGatherWater(result));
    setActiveMiniGame(null);
    setActorForMiniGame(null);
  }, [dispatch, actorForMiniGame]);

  /**
   * Starts a new game
   * 
   * Sets the started flag and resets the game state
   */
  const handleStartGame = () => {
    setIsStarted(true);
    setInitialLoading(true);
    dispatch(resetGame());
    
    // Initialize inventory with test items
    populateInventoryWithItems(dispatch);
  };

  // If game is over, show the game over screen
  if (gameState.isGameOver) {
    return <GameOverScreen message={gameState.gameOverMessage} day={gameState.day} />;
  }

  // Set background color based on game state
  const mainBgClass = isStarted ? 'bg-stone' : 'bg-charcoal';
  
  // Determine if player can take actions based on game state
  const canTakeAction =
    !gameState.isLoading && !gameState.isNamingCompanion && !gameState.isGameOver && !activeMiniGame && !selectingActorFor;

  // Add functions to toggle panels
  const toggleCraftingPanel = () => {
    setShowCraftingPanel(!showCraftingPanel);
    setShowSavePanel(false); // Close other panel if open
  };

  const toggleSavePanel = () => {
    setShowSavePanel(!showSavePanel);
    setShowCraftingPanel(false); // Close other panel if open
  };

  return (
    <main className={`min-h-screen ${mainBgClass} text-olive transition-colors duration-500 font-mono relative`}>
      {!isStarted ? (
        // Show prologue if game hasn't started yet
        <Prologue onStartGame={handleStartGame} />
      ) : (
        <AnimatedTransition isVisible={true} type="fade" duration={0.8} className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 lg:gap-8">
          
          {/* Column 1: Status Info */}
          <div className="md:w-1/3 lg:w-1/4 flex flex-col gap-4">
              {initialLoading ? (
                <ResourceDisplaySkeleton />
              ) : (
                <div className="resource-display">
                  {/* Legacy Resource Display for compatibility */}
                  <ResourceDisplay
                    day={gameState.day}
                    food={gameState.food}
                    water={gameState.water}
                    foodChange={gameState.foodChange}
                    waterChange={gameState.waterChange}
                    survivors={gameState.survivors}
                    isLoading={gameState.isLoading}
                  />
                  
                  {/* New enhanced resource display */}
                  {gameState.resources && (
                    <div className="mt-4">
                      <NewResourceDisplay resources={gameState.resources} compact={true} />
                    </div>
                  )}
                </div>
              )}
              
              {initialLoading ? (
                <SurvivorDisplaySkeleton />
              ) : (
                <div className="survivor-display">
                  <SurvivorDisplay survivors={gameState.survivors} />
                  <InventoryDisplay />
                </div>
              )}
          </div>

          {/* Column 2: Narrative & Actions */}
          <div className="md:w-2/3 lg:w-3/4 flex flex-col gap-4">
              <div className="event-display">
                <EventDisplay
                  text={gameState.eventText}
                  isLoading={gameState.isLoading || initialLoading}
                  error={gameState.error}
                  lastOutcome={gameState.lastOutcome}
                />
              </div>
              
              {/* Initial loading indicator */}
              {initialLoading && (
                <div className="flex justify-center my-8">
                  <LoadingIndicator 
                    text="Setting up camp..." 
                    type="countdown" 
                    size="lg" 
                  />
                </div>
              )}
              
              {/* Conditional Rendering for Naming vs. Choices/Actions */}
              {!initialLoading && (
                <AnimatedTransition isVisible={true} type="fade" delay={0.3}>
                  {gameState.isNamingCompanion && gameState.companionToNameInfo ? (
                    // Show companion naming input when a new companion is found
                    <NameCompanionInput
                      companionToNameInfo={gameState.companionToNameInfo}
                    />
                  ) : (
                    <>
                      {gameState.currentChoices && (
                        // Show choices when available
                        <div className="choice-list">
                          <ChoiceList
                            choices={gameState.currentChoices}
                            onChoiceSelected={handleChoice}
                            isLoading={gameState.isLoading || activeMiniGame !== null || selectingActorFor !== null}
                            currentFood={gameState.food}
                            currentWater={gameState.water}
                          />
                        </div>
                      )}
                      {/* Show player actions (hunt/gather) */}
                      <div className="actions-container">
                        <PlayerActions
                          survivors={gameState.survivors}
                          onSelectActor={handleSelectActor}
                          disabled={!canTakeAction}
                          currentAction={activeMiniGame}
                          huntPerformedToday={gameState.huntPerformedToday}
                          gatherPerformedToday={gameState.gatherPerformedToday}
                          onCraft={toggleCraftingPanel}
                          onSave={toggleSavePanel}
                          canCraft={canTakeAction}
                          canSave={true}
                        />
                      </div>
                    </>
                  )}
                </AnimatedTransition>
              )}
          </div>
        </AnimatedTransition>
      )}
      
      {/* Tutorial overlay */}
      <TutorialOverlay
        steps={steps}
        isOpen={isTutorialOpen && isStarted && !initialLoading && !gameState.isGameOver}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />
      
      {/* Modals and overlays */}
      {selectingActorFor && (
        // Show actor selection modal when selecting a survivor for an action
        <ActorSelectionModal 
            survivors={gameState.survivors}
            actionType={selectingActorFor}
            onSelect={(actorId) => startActionWithActor(actorId, selectingActorFor)}
            onCancel={cancelActorSelection}
        />
      )}
      
      {/* Mini-games */}
      {activeMiniGame === 'hunt' && actorForMiniGame && (
        // Show hunting mini-game
        <HuntingMiniGame 
            onComplete={handleHuntComplete} 
            difficulty={1}
            actorId={actorForMiniGame.id}
            actorStatuses={actorForMiniGame.statuses}
        />
      )}
      {activeMiniGame === 'gather' && actorForMiniGame && (
        // Show gathering mini-game
        <GatherWaterMiniGame 
            onComplete={handleGatherComplete} 
            difficulty={1}
            actorId={actorForMiniGame.id}
        />
      )}

      {/* New panels */}
      {showCraftingPanel && <CraftingPanel onClose={() => setShowCraftingPanel(false)} />}
      {showSavePanel && <SaveManagerPanel onClose={() => setShowSavePanel(false)} />}
    </main>
  );
} 
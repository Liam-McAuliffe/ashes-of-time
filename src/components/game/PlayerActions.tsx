import { Survivor, GatherResult, HuntResult } from '../../types/game';
import { Crosshair, Droplets } from 'lucide-react';
import { useAppDispatch } from '../../hooks';
import HuntingMiniGame from './HuntingMiniGame';
import GatherWaterMiniGame from './GatherWaterMiniGame';

interface PlayerActionsProps {
  survivors: Survivor[];
  onGatherComplete: (result: GatherResult) => void;
  onHuntComplete: (result: HuntResult) => void;
  onHuntStart: () => void;
  onGatherStart: () => void;
  disabled: boolean;
  currentAction: string | null;
}

// Common button classes for consistency
const buttonBaseClasses = 
  'flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md';

// Updated Hunt button colors (Brownish-Orange)
const huntButtonClasses = 
  'bg-amber-700/80 text-stone hover:bg-amber-700 focus:ring-amber-700 border border-amber-800/50';

// Updated Gather button colors (Blue)
const gatherButtonClasses = 
  'bg-blue-700/80 text-stone hover:bg-blue-700 focus:ring-blue-700 border border-blue-800/50';

const PlayerActions: React.FC<PlayerActionsProps> = ({
  survivors,
  onGatherComplete,
  onHuntComplete,
  onHuntStart,
  onGatherStart,
  disabled,
  currentAction,
}) => {
  const handleMiniGameHuntComplete = (success: boolean) => {
    const hunterId = 'player';
    let huntResultData: HuntResult;

    if (success) {
      huntResultData = {
        hunterId,
        foodGained: 5,
        healthChange: 0,
        outcomeText: 'Success! You managed to find some edible scraps.',
      };
    } else {
      huntResultData = {
        hunterId,
        foodGained: 0,
        healthChange: -5,
        outcomeText: 'Failure. The hunt was unsuccessful, and you took a tumble.',
      };
    }
    onHuntComplete(huntResultData);
  };

  const handleMiniGameGatherComplete = (success: boolean) => {
    const gathererId = 'player';
    let gatherResultData: GatherResult;

    if (success) {
      gatherResultData = {
        gathererId,
        waterGained: 5,
        healthChange: 0,
        outcomeText: 'Success! You purified a decent amount of water.',
      };
    } else {
      gatherResultData = {
        gathererId,
        waterGained: 0,
        healthChange: 0,
        outcomeText: 'Failure. The pump mechanism sputtered, yielding no usable water.',
      };
    }
    onGatherComplete(gatherResultData);
  };

  const isGathering = currentAction === 'gathering';

  return (
    <div className="mt-4 pt-4 border-t border-olive/30 flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[60px]">
      {currentAction === 'hunting' ? (
        <HuntingMiniGame onComplete={handleMiniGameHuntComplete} difficulty={1} />
      ) : currentAction === 'gathering' ? (
        <GatherWaterMiniGame onComplete={handleMiniGameGatherComplete} difficulty={1} />
      ) : (
        <>
          <button
            onClick={onHuntStart}
            disabled={disabled}
            className={`${buttonBaseClasses} ${huntButtonClasses}`}
          >
            <Crosshair className="w-5 h-5" />
            <span>Hunt for Food</span>
          </button>
          <button
            onClick={onGatherStart}
            disabled={disabled || isGathering}
            className={`${buttonBaseClasses} ${gatherButtonClasses}`}
          >
            <Droplets className="w-5 h-5" />
            <span>Gather Water</span>
          </button>
        </>
      )}
    </div>
  );
};

export default PlayerActions; 
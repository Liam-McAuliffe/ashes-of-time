import { Survivor, HuntResult, GatherResult } from '../../types/game';
import { Crosshair, Droplets } from 'lucide-react';

interface PlayerActionsProps {
  survivors: Survivor[];
  onHuntComplete: (result: HuntResult) => void;
  onGatherComplete: (result: GatherResult) => void;
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
  onHuntComplete,
  onGatherComplete,
  onHuntStart,
  onGatherStart,
  disabled,
  currentAction,
}) => {
  const isHunting = currentAction === 'hunting';
  const isGathering = currentAction === 'gathering';

  return (
    <div className="mt-4 pt-4 border-t border-olive/30 flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button
        onClick={onHuntStart}
        disabled={disabled || isHunting}
        className={`${buttonBaseClasses} ${huntButtonClasses}`}
      >
        <Crosshair className="w-5 h-5" />
        <span>{isHunting ? 'Hunting...' : 'Hunt for Food'}</span>
      </button>
      <button
        onClick={onGatherStart}
        disabled={disabled || isGathering}
        className={`${buttonBaseClasses} ${gatherButtonClasses}`}
      >
        <Droplets className="w-5 h-5" />
        <span>{isGathering ? 'Gathering...' : 'Gather Water'}</span>
      </button>
    </div>
  );
};

export default PlayerActions; 
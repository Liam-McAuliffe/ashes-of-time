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

const PlayerActions: React.FC<PlayerActionsProps> = ({
  survivors,
  onHuntComplete,
  onGatherComplete,
  onHuntStart,
  onGatherStart,
  disabled,
  currentAction,
}) => {
  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-4">
      <button
        onClick={onHuntStart}
        disabled={disabled || currentAction === 'hunting'}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rust text-stone rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        <Crosshair className="w-5 h-5" />
        <span>Hunt for Food</span>
      </button>
      <button
        onClick={onGatherStart}
        disabled={disabled || currentAction === 'gathering'}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rust text-stone rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        <Droplets className="w-5 h-5" />
        <span>Gather Water</span>
      </button>
    </div>
  );
};

export default PlayerActions; 
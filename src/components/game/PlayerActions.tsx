import { Survivor, StatusEffect } from '../../types/game';
import { Crosshair, Droplets } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip';

interface PlayerActionsProps {
  survivors: Survivor[];
  onSelectActor: (actionType: 'hunt' | 'gather') => void;
  disabled: boolean;
  currentAction: string | null;
  huntPerformedToday: boolean;
  gatherPerformedToday: boolean;
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
  onSelectActor,
  disabled,
  currentAction,
  huntPerformedToday,
  gatherPerformedToday,
}) => {
  const playerSurvivor = survivors.find(s => s.id === 'player' || s.isPlayer);
  const playerStatuses = playerSurvivor?.statuses || [];

  const cannotHunt = playerStatuses.includes('Broken Limb');
  const isExhausted = playerStatuses.includes('Exhausted');
  const dailyActionTaken = huntPerformedToday || gatherPerformedToday;

  // Can *any* living survivor hunt/gather?
  const canAnyoneHunt = survivors.some(s => s.health > 0 && !s.statuses.includes('Broken Limb'));
  const canAnyoneGather = survivors.some(s => s.health > 0);
  
  // Disable button if no eligible actors, or exhausted, or action taken
  const huntDisabled = disabled || isExhausted || dailyActionTaken || !canAnyoneHunt;
  const gatherDisabled = disabled || isExhausted || dailyActionTaken || !canAnyoneGather;

  const getHuntTooltipText = () => {
    if (!canAnyoneHunt && !isExhausted && !dailyActionTaken) return "No one is able to hunt (check statuses).";
    if (isExhausted) return "Too exhausted for strenuous activity today.";
    if (dailyActionTaken) return "Already performed a daily action.";
    return null;
  };

  const getGatherTooltipText = () => {
    if (!canAnyoneGather && !isExhausted && !dailyActionTaken) return "No one is able to gather water.";
    if (isExhausted) return "Too exhausted for strenuous activity today.";
    if (dailyActionTaken) return "Already performed a daily action.";
    return null;
  };

  const huntTooltipText = getHuntTooltipText();
  const gatherTooltipText = getGatherTooltipText();

  return (
    <div className="mt-4 pt-4 border-t border-olive/30 flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[60px]">
        <Tooltip placement="top" open={huntDisabled ? undefined : false}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectActor('hunt')}
                disabled={huntDisabled}
                className={`${buttonBaseClasses} ${huntButtonClasses}`}
              >
                <Crosshair className="w-5 h-5" />
                <span>Hunt for Food</span>
              </button>
            </TooltipTrigger>
            {huntTooltipText && <TooltipContent>{huntTooltipText}</TooltipContent>}
        </Tooltip>

        <Tooltip placement="top" open={gatherDisabled ? undefined : false}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectActor('gather')}
                disabled={gatherDisabled}
                className={`${buttonBaseClasses} ${gatherButtonClasses}`}
              >
                <Droplets className="w-5 h-5" />
                <span>Gather Water</span>
              </button>
            </TooltipTrigger>
            {gatherTooltipText && <TooltipContent>{gatherTooltipText}</TooltipContent>}
        </Tooltip>
    </div>
  );
};

export default PlayerActions; 
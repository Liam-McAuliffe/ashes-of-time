import { Survivor, StatusEffect, statusEffectDescriptions } from '../../types/game';
import { Crosshair, Droplets, Wrench, Save } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip';
import OptimizedTooltip from '../ui/OptimizedTooltip';

interface PlayerActionsProps {
  survivors: Survivor[];
  onSelectActor: (actionType: 'hunt' | 'gather') => void;
  disabled: boolean;
  currentAction: string | null;
  huntPerformedToday: boolean;
  gatherPerformedToday: boolean;
  // New props for crafting and saving
  onCraft?: () => void;
  onSave?: () => void;
  canCraft?: boolean;
  canSave?: boolean;
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

// Craft button colors (Green)
const craftButtonClasses = 
  'bg-green-700/80 text-stone hover:bg-green-700 focus:ring-green-700 border border-green-800/50';

// Save button colors (Purple)
const saveButtonClasses = 
  'bg-purple-700/80 text-stone hover:bg-purple-700 focus:ring-purple-700 border border-purple-800/50';

const PlayerActions: React.FC<PlayerActionsProps> = ({
  survivors,
  onSelectActor,
  disabled,
  currentAction,
  huntPerformedToday,
  gatherPerformedToday,
  onCraft,
  onSave,
  canCraft = false,
  canSave = false,
}) => {
  const playerSurvivor = survivors.find(s => s.id === 'player' || s.isPlayer);
  const playerStatuses = playerSurvivor?.statuses || [];

  // Check for specific status effects that impact actions
  const hasBrokenLimb = playerStatuses.includes('Broken Limb');
  const isExhausted = playerStatuses.includes('Exhausted');
  const isFeverish = playerStatuses.includes('Fever');
  const isInjured = playerStatuses.includes('Injured (Bleeding)');
  const isHypothermic = playerStatuses.includes('Hypothermia');
  const isHeatstroked = playerStatuses.includes('Heatstroke');
  
  const dailyActionTaken = huntPerformedToday || gatherPerformedToday;

  // Can *any* living survivor hunt/gather?
  const canAnyoneHunt = survivors.some(s => s.health > 0 && !s.statuses.includes('Broken Limb'));
  const canAnyoneGather = survivors.some(s => s.health > 0);
  
  // Disable button if no eligible actors, or exhausted, or action taken
  const huntDisabled = disabled || isExhausted || dailyActionTaken || !canAnyoneHunt;
  const gatherDisabled = disabled || isExhausted || dailyActionTaken || !canAnyoneGather;
  const craftDisabled = disabled || !canCraft;

  // Create more detailed tooltips that explain status effects
  const getHuntTooltipText = () => {
    // Build an explanation of why hunting is disabled
    if (hasBrokenLimb) return `Cannot hunt with a Broken Limb: ${statusEffectDescriptions['Broken Limb']}`;
    if (isExhausted) return `Too exhausted to hunt: ${statusEffectDescriptions['Exhausted']}`;
    if (dailyActionTaken) return "Already performed a daily action today.";
    if (!canAnyoneHunt) return "No survivor is able to hunt (check survivor statuses).";
    
    // Show penalties that will apply but don't prevent the action
    if (isHypothermic) return `Hunting available, but with penalties: ${statusEffectDescriptions['Hypothermia']}`;
    if (isHeatstroked) return `Hunting available, but with penalties: ${statusEffectDescriptions['Heatstroke']}`;
    if (isFeverish) return `Hunting available, but with penalties: ${statusEffectDescriptions['Fever']}`;
    
    return null;
  };

  const getGatherTooltipText = () => {
    if (isExhausted) return `Too exhausted to gather: ${statusEffectDescriptions['Exhausted']}`;
    if (dailyActionTaken) return "Already performed a daily action today.";
    if (!canAnyoneGather) return "No one is able to gather water.";
    
    // Show penalties that will apply but don't prevent the action
    if (isHypothermic) return `Gathering available, but with penalties: ${statusEffectDescriptions['Hypothermia']}`;
    if (isHeatstroked) return `Gathering available, but with penalties: ${statusEffectDescriptions['Heatstroke']}`;
    if (isFeverish) return `Gathering available, but with penalties: ${statusEffectDescriptions['Fever']}`;
    
    return null;
  };

  const huntTooltipText = getHuntTooltipText();
  const gatherTooltipText = getGatherTooltipText();

  // Create helper function to format tooltip content
  const formatTooltipContent = (text: string) => {
    if (text.includes('with penalties')) {
      return <span className="text-yellow-200">{text}</span>;
    }
    return <span className="text-red-200">{text}</span>;
  };

  return (
    <div className="mt-4 pt-4 border-t border-olive/30 flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[60px]">
        <OptimizedTooltip 
          content={huntTooltipText ? formatTooltipContent(huntTooltipText) : "Hunt for food in the wilderness"} 
          showOnDisabled={true}
        >
          <button
            onClick={() => onSelectActor('hunt')}
            disabled={huntDisabled}
            className={`${buttonBaseClasses} ${huntButtonClasses}`}
          >
            <Crosshair className="w-5 h-5" />
            <span>Hunt for Food</span>
          </button>
        </OptimizedTooltip>

        <OptimizedTooltip 
          content={gatherTooltipText ? formatTooltipContent(gatherTooltipText) : "Search for water sources"} 
          showOnDisabled={true}
        >
          <button
            onClick={() => onSelectActor('gather')}
            disabled={gatherDisabled}
            className={`${buttonBaseClasses} ${gatherButtonClasses}`}
          >
            <Droplets className="w-5 h-5" />
            <span>Gather Water</span>
          </button>
        </OptimizedTooltip>
        
        {/* Crafting button */}
        {onCraft && (
          <OptimizedTooltip 
            content="Craft items from resources" 
            showOnDisabled={true}
          >
            <button
              onClick={onCraft}
              disabled={craftDisabled}
              className={`${buttonBaseClasses} ${craftButtonClasses}`}
            >
              <Wrench className="w-5 h-5" />
              <span>Craft Items</span>
            </button>
          </OptimizedTooltip>
        )}
        
        {/* Save game button */}
        {onSave && (
          <OptimizedTooltip 
            content="Save your game progress" 
            showOnDisabled={true}
          >
            <button
              onClick={onSave}
              disabled={!canSave}
              className={`${buttonBaseClasses} ${saveButtonClasses}`}
            >
              <Save className="w-5 h-5" />
              <span>Save Game</span>
            </button>
          </OptimizedTooltip>
        )}
    </div>
  );
};

export default PlayerActions; 
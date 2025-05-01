import { Survivor, StatusEffect, statusEffectDescriptions } from '../../types/game';
import { Heart, Shield } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip';
import { getStatusColor } from '../../utils/gameLogic';

interface SurvivorDisplayProps {
  survivors: Survivor[];
}

const SurvivorDisplay: React.FC<SurvivorDisplayProps> = ({ survivors }) => {
  return (
    <div className="mt-4 space-y-2">
      {survivors.map((survivor) => (
        <div
          key={survivor.id}
          className="p-3 border border-olive/30 rounded bg-stone/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{survivor.name}</span>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rust" />
                <span className="text-sm">{survivor.health}</span>
                {survivor.healthChange && survivor.healthChange !== 0 && (
                  <span className={`text-xs font-bold ml-1 ${survivor.healthChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ({survivor.healthChange > 0 ? '+' : ''}{survivor.healthChange})
                  </span>
                )}
              </div>
            </div>
            {survivor.companion && (
              <div className="flex items-center gap-2 text-xs text-olive/90">
                <Shield className="w-4 h-4 text-olive flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span>{survivor.companion.name} ({survivor.companion.type})</span>
                  <div className="flex gap-x-2 gap-y-0.5 flex-wrap text-xs">
                    {survivor.companion.bonuses?.hunting_yield && (
                      <span className="text-amber-600">+{survivor.companion.bonuses.hunting_yield}% Hunt Yield</span>
                    )}
                    {survivor.companion.bonuses?.gathering_success_chance && (
                      <span className="text-sky-600">+{survivor.companion.bonuses.gathering_success_chance}% Gather Chance</span>
                    )}
                    {survivor.companion.bonuses?.healing_rate && (
                      <span className="text-emerald-600">+{survivor.companion.bonuses.healing_rate} Heal/Day</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {survivor.statuses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {survivor.statuses.map((status) => (
                <Tooltip key={status} placement="top">
                  <TooltipTrigger asChild>
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-default ${getStatusColor(status)}`}
                    >
                      {status}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {statusEffectDescriptions[status] || 'No description available.'}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SurvivorDisplay; 
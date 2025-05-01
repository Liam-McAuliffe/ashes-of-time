import React from 'react';
import { GameChoice } from '../../types/game';
import { Utensils, Droplets } from 'lucide-react';

interface ChoiceListProps {
  choices: GameChoice[];
  onChoiceSelected: (choice: GameChoice) => void;
  isLoading: boolean;
  currentFood: number;
  currentWater: number;
}

const ChoiceList: React.FC<ChoiceListProps> = ({
  choices,
  onChoiceSelected,
  isLoading,
  currentFood,
  currentWater,
}) => {
  const canAffordChoice = (choice: GameChoice) => {
    const costFood = choice.cost?.food || 0;
    const costWater = choice.cost?.water || 0;
    return currentFood >= costFood && currentWater >= costWater;
  };

  const buttonBase = "w-full p-4 border border-olive/40 rounded bg-stone/40 text-left transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone focus:ring-olive/80";
  const buttonEnabled = "hover:bg-stone/60 hover:border-olive/60 cursor-pointer";
  const buttonDisabled = "opacity-60 cursor-not-allowed";

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-charcoal border-b border-olive/30 pb-2">Choose an Action:</h3>
      {choices.map((choice) => {
        const isAffordable = canAffordChoice(choice);
        const isDisabled = isLoading || !isAffordable;

        return (
          <button
            key={choice.id}
            onClick={() => onChoiceSelected(choice)}
            disabled={isDisabled}
            className={`${buttonBase} ${isDisabled ? buttonDisabled : buttonEnabled}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex-grow text-charcoal font-medium">{choice.text}</span>
              {(choice.cost?.food > 0 || choice.cost?.water > 0) && (
                <div className="flex items-center gap-3 text-sm flex-shrink-0">
                  {choice.cost.food > 0 && (
                    <div 
                      className={`flex items-center gap-1 ${currentFood < choice.cost.food ? 'text-red-600' : 'text-amber-700/90'}`}
                      title={`${choice.cost.food} Food Cost`}
                    >
                      <Utensils className="w-4 h-4" />
                      <span className="font-semibold">-{choice.cost.food}</span>
                    </div>
                  )}
                  {choice.cost.water > 0 && (
                    <div 
                      className={`flex items-center gap-1 ${currentWater < choice.cost.water ? 'text-red-600' : 'text-sky-700/90'}`}
                      title={`${choice.cost.water} Water Cost`}
                    >
                      <Droplets className="w-4 h-4" />
                      <span className="font-semibold">-{choice.cost.water}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChoiceList; 
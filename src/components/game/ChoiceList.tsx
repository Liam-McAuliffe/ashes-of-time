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

  return (
    <div className="mt-6 space-y-4">
      {choices.map((choice) => {
        const isAffordable = canAffordChoice(choice);
        return (
          <button
            key={choice.id}
            onClick={() => onChoiceSelected(choice)}
            disabled={isLoading || !isAffordable}
            className="w-full p-4 border border-olive/30 rounded bg-stone/50 text-left hover:bg-stone/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex-grow">{choice.text}</span>
              {(choice.cost?.food > 0 || choice.cost?.water > 0) && (
                <div className="flex items-center gap-4 text-sm">
                  {choice.cost.food > 0 && (
                    <div className="flex items-center gap-1">
                      <Utensils className="w-4 h-4 text-rust" />
                      <span className={currentFood < choice.cost.food ? 'text-rust' : ''}>
                        -{choice.cost.food}
                      </span>
                    </div>
                  )}
                  {choice.cost.water > 0 && (
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-olive" />
                      <span className={currentWater < choice.cost.water ? 'text-rust' : ''}>
                        -{choice.cost.water}
                      </span>
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
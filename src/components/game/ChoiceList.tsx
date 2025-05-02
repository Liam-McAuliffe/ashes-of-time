import React, { memo, useCallback, useMemo } from 'react';
import { GameChoice } from '../../types/game';
import { Utensils, Droplets } from 'lucide-react';
import OptimizedTooltip from '../ui/OptimizedTooltip';
import { FixedSizeList as List } from 'react-window';

/**
 * Props for the ChoiceList component
 * 
 * @interface ChoiceListProps
 * @property {GameChoice[]} choices - Array of choices to display
 * @property {(choice: GameChoice) => void} onChoiceSelected - Callback function for when a choice is selected
 * @property {boolean} isLoading - Whether the game is in a loading state
 * @property {number} currentFood - Current food resource amount
 * @property {number} currentWater - Current water resource amount
 */
interface ChoiceListProps {
  choices: GameChoice[];
  onChoiceSelected: (choice: GameChoice) => void;
  isLoading: boolean;
  currentFood: number;
  currentWater: number;
}

/**
 * Props for the ChoiceItem component
 * 
 * @interface ChoiceItemProps
 * @property {GameChoice} choice - The choice data to display
 * @property {() => void} onSelect - Callback function for when the choice is selected
 * @property {boolean} isDisabled - Whether the choice is disabled
 * @property {string} buttonClass - CSS class string for styling the button
 * @property {number} currentFood - Current food resource amount
 * @property {number} currentWater - Current water resource amount
 */
interface ChoiceItemProps {
  choice: GameChoice;
  onSelect: () => void;
  isDisabled: boolean;
  buttonClass: string;
  currentFood: number;
  currentWater: number;
}

/**
 * Component that displays an individual choice with its action text and resource costs
 * 
 * This component is memoized to prevent unnecessary re-renders when other choices change
 * but this particular choice's data remains the same.
 * 
 * @param {ChoiceItemProps} props - The component props
 * @returns {React.ReactElement} The rendered component
 */
const ChoiceItem = memo(({
  choice,
  onSelect,
  isDisabled,
  buttonClass,
  currentFood,
  currentWater
}: ChoiceItemProps) => {
  // Determine reason for being disabled
  let disabledReason = '';
  if (isDisabled) {
    const costFood = choice.cost?.food || 0;
    const costWater = choice.cost?.water || 0;
    
    if (currentFood < costFood && currentWater < costWater) {
      disabledReason = `Not enough resources (Need ${costFood} Food and ${costWater} Water)`;
    } else if (currentFood < costFood) {
      disabledReason = `Not enough Food (Need ${costFood})`;
    } else if (currentWater < costWater) {
      disabledReason = `Not enough Water (Need ${costWater})`;
    } else {
      disabledReason = 'Action unavailable while loading';
    }
  }

  const buttonElement = (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={buttonClass}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="flex-grow text-charcoal font-medium">{choice.action}</span>
        {(choice.cost?.food > 0 || choice.cost?.water > 0) && (
          <div className="flex items-center gap-3 text-sm flex-shrink-0">
            {choice.cost.food > 0 && (
              <OptimizedTooltip content={`${choice.cost.food} Food Cost`}>
                <div 
                  className={`flex items-center gap-1 ${currentFood < choice.cost.food ? 'text-red-600' : 'text-amber-700/90'}`}
                >
                  <Utensils className="w-4 h-4" />
                  <span className="font-semibold">-{choice.cost.food}</span>
                </div>
              </OptimizedTooltip>
            )}
            {choice.cost.water > 0 && (
              <OptimizedTooltip content={`${choice.cost.water} Water Cost`}>
                <div 
                  className={`flex items-center gap-1 ${currentWater < choice.cost.water ? 'text-red-600' : 'text-sky-700/90'}`}
                >
                  <Droplets className="w-4 h-4" />
                  <span className="font-semibold">-{choice.cost.water}</span>
                </div>
              </OptimizedTooltip>
            )}
          </div>
        )}
      </div>
    </button>
  );

  // Wrap with tooltip only if disabled
  if (isDisabled && disabledReason) {
    return (
      <OptimizedTooltip 
        content={<span className="text-red-200">{disabledReason}</span>} 
        showOnDisabled={true}
      >
        {buttonElement}
      </OptimizedTooltip>
    );
  }

  return buttonElement;
});

ChoiceItem.displayName = 'ChoiceItem';

/**
 * Component that displays a list of available choices to the player
 * 
 * This component is memoized to prevent unnecessary re-renders when other parts
 * of the application state change but the choices remain the same. It uses virtualization
 * through react-window when there are many choices to improve performance.
 * 
 * @param {ChoiceListProps} props - The component props
 * @returns {React.ReactElement} The rendered component
 */
const ChoiceList: React.FC<ChoiceListProps> = memo(({
  choices,
  onChoiceSelected,
  isLoading,
  currentFood,
  currentWater,
}) => {
  /**
   * Determines if a choice can be afforded based on current resources
   * 
   * @param {GameChoice} choice - The choice to check
   * @returns {boolean} True if the player has enough resources for the choice
   */
  const canAffordChoice = useCallback((choice: GameChoice) => {
    const costFood = choice.cost?.food || 0;
    const costWater = choice.cost?.water || 0;
    return currentFood >= costFood && currentWater >= costWater;
  }, [currentFood, currentWater]);

  /**
   * Base button style class string
   */
  const buttonBase = useMemo(() => 
    "w-full p-4 border border-olive/40 rounded bg-stone/40 text-left transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone focus:ring-olive/80", 
    []
  );
  
  const buttonEnabled = "hover:bg-stone/60 hover:border-olive/60 cursor-pointer";
  const buttonDisabled = "opacity-60 cursor-not-allowed";

  // Only use virtualization if we have more than 5 choices
  const shouldUseVirtualization = choices.length > 5;

  /**
   * Render function for virtualized list items
   * 
   * @param {{ index: number, style: React.CSSProperties }} props - Props from react-window
   * @returns {React.ReactElement} The rendered list item
   */
  const renderItem = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const choice = choices[index];
    const isAffordable = canAffordChoice(choice);
    const isDisabled = isLoading || !isAffordable;
    const buttonClass = `${buttonBase} ${isDisabled ? buttonDisabled : buttonEnabled}`;
    
    return (
      <div style={{ ...style, paddingBottom: '12px' }}>
        <ChoiceItem
          choice={choice}
          onSelect={() => onChoiceSelected(choice)}
          isDisabled={isDisabled}
          buttonClass={buttonClass}
          currentFood={currentFood}
          currentWater={currentWater}
        />
      </div>
    );
  }, [choices, canAffordChoice, isLoading, buttonBase, buttonEnabled, buttonDisabled, onChoiceSelected, currentFood, currentWater]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-charcoal border-b border-olive/30 pb-2">Choose an Action:</h3>
      
      {shouldUseVirtualization ? (
        <List
          height={Math.min(400, choices.length * 85)} // Limit max height
          itemCount={choices.length}
          itemSize={85} // Approximate height of each item
          width="100%"
        >
          {renderItem}
        </List>
      ) : (
        choices.map((choice, index) => {
          const isAffordable = canAffordChoice(choice);
          const isDisabled = isLoading || !isAffordable;
          const buttonClass = `${buttonBase} ${isDisabled ? buttonDisabled : buttonEnabled}`;
          
          return (
            <ChoiceItem
              key={index}
              choice={choice}
              onSelect={() => onChoiceSelected(choice)}
              isDisabled={isDisabled}
              buttonClass={buttonClass}
              currentFood={currentFood}
              currentWater={currentWater}
            />
          );
        })
      )}
    </div>
  );
});

ChoiceList.displayName = 'ChoiceList';

export default ChoiceList; 
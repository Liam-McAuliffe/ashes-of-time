import React, { memo, useMemo } from 'react';
import { Droplet, Utensils, Sun, Info, Droplets } from 'lucide-react';
import { Survivor } from '../../types/game';
import AnimatedNumber from '../ui/AnimatedNumber';
import OptimizedTooltip from '../ui/OptimizedTooltip';
import AnimatedTransition from '../ui/AnimatedTransition';

/**
 * Props for the ResourceDisplay component
 * 
 * @interface ResourceDisplayProps
 * @property {number} day - Current game day
 * @property {number} food - Current food amount
 * @property {number} water - Current water amount
 * @property {number} foodChange - Food change since last day
 * @property {number} waterChange - Water change since last day
 * @property {Survivor[]} survivors - Array of survivors
 * @property {boolean} isLoading - Whether the component is in a loading state
 */
interface ResourceDisplayProps {
  day: number;
  food: number;
  water: number;
  foodChange: number;
  waterChange: number;
  survivors: Survivor[];
  isLoading?: boolean;
}

/**
 * Component that displays game resources and day count
 * 
 * This component is memoized to prevent unnecessary re-renders when other parts
 * of the application state change but the resources remain the same.
 * 
 * @param {ResourceDisplayProps} props - The component props
 * @returns {React.ReactElement} The rendered component
 */
const ResourceDisplay: React.FC<ResourceDisplayProps> = memo(({
  day,
  food,
  water,
  foodChange,
  waterChange,
  survivors,
  isLoading = false,
}) => {
  /**
   * Determines the appropriate CSS class based on resource value
   * 
   * @param {number} value - The resource value to check
   * @returns {string} CSS class string for styling the resource display
   */
  const getResourceClass = (value: number) => {
    if (value <= 3) return 'text-red-600 font-semibold animate-pulse';
    if (value <= 6) return 'text-amber-600 font-semibold';
    return 'text-charcoal';
  };

  /**
   * Formats resource change value with appropriate styling
   * 
   * @param {number} change - The resource change value
   * @returns {React.ReactNode | null} Formatted change display or null if no change
   */
  const formatChange = (change: number) => {
    if (change === 0) return null;
    
    return (
      <AnimatedTransition 
        isVisible={true} 
        type="apocalyptic" 
        duration={0.5}
        className="inline-block"
      >
        {change > 0 ? (
          <span className="text-emerald-600 font-semibold">(+{change})</span>
        ) : (
          <span className="text-red-600 font-semibold">({change})</span>
        )}
      </AnimatedTransition>
    );
  };

  /**
   * Count of living survivors, memoized to prevent recalculation
   */
  const livingSurvivorCount = useMemo(() => {
    return survivors?.filter((s) => s.health > 0).length || 0;
  }, [survivors]);
  
  const changeTooltipText = 'Net resource change since the start of the previous day';

  /**
   * Memoized resource display classes and formatted changes
   */
  const foodResourceClass = useMemo(() => getResourceClass(food), [food]);
  const waterResourceClass = useMemo(() => getResourceClass(water), [water]);
  const formattedFoodChange = useMemo(() => formatChange(foodChange), [foodChange]);
  const formattedWaterChange = useMemo(() => formatChange(waterChange), [waterChange]);

  // Critical resource warning effect
  const isFoodCritical = food <= 3;
  const isWaterCritical = water <= 3;

  return (
    <div className="w-full bg-stone/10 border border-olive/30 p-4 rounded-lg flex flex-col gap-3">
      <AnimatedTransition 
        isVisible={true} 
        type="fade" 
        className="flex items-center gap-2"
      >
        <Sun className="text-yellow-500" size={20} />
        <h3 className="text-xl font-bold text-charcoal">
          <AnimatedNumber value={day} formatter={(val) => `Day ${val}`} duration={800} />
        </h3>
      </AnimatedTransition>

      <p className="text-xs text-olive -mt-2 ml-7">
        Daily Use: -{livingSurvivorCount} Food, -{livingSurvivorCount} Water per survivor
      </p>

      <div className="space-y-2">
        <OptimizedTooltip content={changeTooltipText}>
          <div className={`flex items-center justify-between ${foodResourceClass} cursor-help relative`}>
            <div className="flex items-center gap-1.5 text-lg">
              <Utensils className={`text-rust ${isFoodCritical ? 'animate-pulse' : ''}`} size={18} />
              <span>Food:</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold">
                <AnimatedNumber 
                  value={food} 
                  duration={800} 
                />
              </span> 
              <span className="text-sm font-normal">{formattedFoodChange}</span>
            </div>
            {isFoodCritical && (
              <div className="absolute inset-0 border-2 border-red-500/60 rounded-lg pointer-events-none animate-pulse" />
            )}
          </div>
        </OptimizedTooltip>
        
        <OptimizedTooltip content={changeTooltipText}>
          <div className={`flex items-center justify-between ${waterResourceClass} cursor-help relative`}>
            <div className="flex items-center gap-1.5 text-lg">
              <Droplets className={`text-cyan-600 ${isWaterCritical ? 'animate-pulse' : ''}`} size={18} />
              <span>Water:</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold">
                <AnimatedNumber 
                  value={water} 
                  duration={800} 
                />
              </span>
              <span className="text-sm font-normal">{formattedWaterChange}</span>
            </div>
            {isWaterCritical && (
              <div className="absolute inset-0 border-2 border-red-500/60 rounded-lg pointer-events-none animate-pulse" />
            )}
          </div>
        </OptimizedTooltip>
      </div>
    </div>
  );
});

ResourceDisplay.displayName = 'ResourceDisplay';

export default ResourceDisplay;
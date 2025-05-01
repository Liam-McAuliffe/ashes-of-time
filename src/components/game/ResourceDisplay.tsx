import React from 'react';
import { Droplet, Utensils, Sun, Info, Droplets } from 'lucide-react';
import { Survivor } from '../../types/game';
import AnimatedNumber from '../ui/AnimatedNumber';

interface ResourceDisplayProps {
  day: number;
  food: number;
  water: number;
  foodChange: number;
  waterChange: number;
  survivors: Survivor[];
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  day,
  food,
  water,
  foodChange,
  waterChange,
  survivors,
}) => {
  const getResourceClass = (value: number) => {
    if (value <= 3) return 'text-red-600 font-semibold animate-pulse';
    if (value <= 6) return 'text-amber-600 font-semibold';
    return 'text-charcoal';
  };

  const formatChange = (change: number) => {
    if (change > 0) return <span className="text-emerald-600 font-semibold">(+{change})</span>;
    else if (change < 0) return <span className="text-red-600 font-semibold">({change})</span>;
    else return null;
  };

  const livingSurvivorCount = survivors?.filter((s) => s.health > 0).length || 0;
  const changeTooltip = 'Net resource change since the start of the previous day';

  return (
    <div className="w-full bg-stone/10 border border-olive/30 p-4 rounded-lg flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sun className="text-yellow-500" size={20} />
        <h3 className="text-xl font-bold text-charcoal">Day {day}</h3>
      </div>
      <p className="text-xs text-olive -mt-2 ml-7">
        Daily Use: -{livingSurvivorCount} Food, -{livingSurvivorCount} Water per survivor
      </p>

      <div className="space-y-2">
        <div className={`flex items-center justify-between ${getResourceClass(food)}`} title={changeTooltip}>
          <div className="flex items-center gap-1.5 text-lg">
            <Utensils className="text-rust" size={18} />
            <span>Food:</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold"><AnimatedNumber value={food} /></span> 
            <span className="text-sm font-normal">{formatChange(foodChange)}</span>
          </div>
        </div>
        <div className={`flex items-center justify-between ${getResourceClass(water)}`} title={changeTooltip}>
          <div className="flex items-center gap-1.5 text-lg">
            <Droplets className="text-cyan-600" size={18} />
            <span>Water:</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold"><AnimatedNumber value={water} /></span>
            <span className="text-sm font-normal">{formatChange(waterChange)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDisplay;
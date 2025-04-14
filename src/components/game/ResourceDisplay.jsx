import { Droplet, Ham, Sun } from 'lucide-react';
import React from 'react';

function ResourceDisplay({
  day,
  food,
  water,
  foodChange,
  waterChange,
  survivors,
}) {
  const getResourceClass = (value) => {
    if (value <= 3) return 'text-rust font-semibold animate-pulse';
    if (value <= 6) return 'text-amber-600 font-semibold';
    return 'text-charcoal';
  };

  const formatChange = (change) => {
    if (change > 0)
      return (
        <span className="text-emerald-600 font-semibold">(+{change})</span>
      );
    else if (change < 0)
      return <span className="text-rust font-semibold">({change})</span>;
    else return null;
  };

  const livingSurvivorCount =
    survivors?.filter((s) => s.health > 0).length || 0;
  const changeTooltip =
    'Net change from previous day (includes choice cost/effect and daily use)';

  return (
    <div className="w-full flex justify-between sm:items-start border-b border-olive/50 pb-3 mb-4 text-charcoal flex-col sm:flex-row items-center">
      <div className="flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <Sun className="text-yellow-500" size={24} />
          <h1 className="text-3xl font-bold text-charcoal">Day {day}</h1>
        </div>
        <p className="text-sm text-olive">
          Daily Use: -{livingSurvivorCount} Food, -{livingSurvivorCount} Water
        </p>
      </div>
      <div className="text-right space-y-1">
        <div
          className={`text-lg ${getResourceClass(food)}`}
          title={changeTooltip}
        >
          <div className="flex gap-1.5 items-center justify-end">
            <Ham className="text-rust" size={20} />
            <span>Food: {food}</span>
            <span className="text-sm ml-1">{formatChange(foodChange)}</span>
          </div>
        </div>
        <div
          className={`text-lg ${getResourceClass(water)}`}
          title={changeTooltip}
        >
          <div className="flex gap-1.5 items-center justify-end">
            <Droplet className="text-cyan-600" size={20} />
            <span>Water: {water}</span>
            <span className="text-sm ml-1">{formatChange(waterChange)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceDisplay;

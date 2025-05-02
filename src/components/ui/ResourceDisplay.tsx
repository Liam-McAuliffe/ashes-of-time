import React from 'react';
import { ResourceStore } from '../../types/game';
import { Droplet, Sandwich, Pill, Package, Fuel, Target, Wrench, Shirt } from 'lucide-react';

interface ResourceDisplayProps {
  resources: ResourceStore;
  compact?: boolean;
}

/**
 * Component to display all resource types with appropriate icons
 */
const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources, compact = false }) => {
  // Helper function to calculate percentage for progress bars
  const getPercentage = (current: number, max: number) => {
    return Math.min(100, Math.round((current / max) * 100));
  };

  // Color classes based on resource level
  const getColorClass = (current: number, max: number) => {
    const percentage = getPercentage(current, max);
    if (percentage < 20) return 'bg-red-600';
    if (percentage < 40) return 'bg-orange-500';
    if (percentage < 60) return 'bg-amber-500';
    return 'bg-green-600';
  };

  // Render compact view (icons + values only)
  if (compact) {
    return (
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1 text-amber-200">
          <Sandwich className="w-4 h-4" />
          <span>{resources.food}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-200">
          <Droplet className="w-4 h-4" />
          <span>{resources.water}</span>
        </div>
        <div className="flex items-center gap-1 text-red-200">
          <Pill className="w-4 h-4" />
          <span>{resources.medicine}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-300">
          <Package className="w-4 h-4" />
          <span>{resources.scrap}</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-300">
          <Fuel className="w-4 h-4" />
          <span>{resources.fuel}</span>
        </div>
        <div className="flex items-center gap-1 text-purple-300">
          <Target className="w-4 h-4" />
          <span>{resources.ammunition}</span>
        </div>
        <div className="flex items-center gap-1 text-stone-300">
          <Wrench className="w-4 h-4" />
          <span>{resources.tools}</span>
        </div>
        <div className="flex items-center gap-1 text-indigo-200">
          <Shirt className="w-4 h-4" />
          <span>{resources.clothing}</span>
        </div>
      </div>
    );
  }

  // Render detailed view with progress bars
  return (
    <div className="space-y-3 p-2 bg-stone-900/60 rounded-md border border-amber-900/30">
      <h3 className="text-amber-100 font-medium mb-2">Survival Resources</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Food */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-amber-200">
              <Sandwich className="w-4 h-4" />
              <span>Food</span>
            </div>
            <span className="text-amber-100/80 text-sm">
              {resources.food}/{resources.foodCapacity}
            </span>
          </div>
          <div className="h-2 bg-stone-800 rounded overflow-hidden">
            <div 
              className={`h-full ${getColorClass(resources.food, resources.foodCapacity)}`}
              style={{ width: `${getPercentage(resources.food, resources.foodCapacity)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Water */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-blue-200">
              <Droplet className="w-4 h-4" />
              <span>Water</span>
            </div>
            <span className="text-blue-100/80 text-sm">
              {resources.water}/{resources.waterCapacity}
            </span>
          </div>
          <div className="h-2 bg-stone-800 rounded overflow-hidden">
            <div 
              className={`h-full ${getColorClass(resources.water, resources.waterCapacity)}`}
              style={{ width: `${getPercentage(resources.water, resources.waterCapacity)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Medicine */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-red-200">
              <Pill className="w-4 h-4" />
              <span>Medicine</span>
            </div>
            <span className="text-red-100/80 text-sm">
              {resources.medicine}/{resources.medicineCapacity}
            </span>
          </div>
          <div className="h-2 bg-stone-800 rounded overflow-hidden">
            <div 
              className={`h-full ${getColorClass(resources.medicine, resources.medicineCapacity)}`}
              style={{ width: `${getPercentage(resources.medicine, resources.medicineCapacity)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Scrap */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-gray-300">
              <Package className="w-4 h-4" />
              <span>Scrap</span>
            </div>
            <span className="text-gray-200/80 text-sm">
              {resources.scrap}/{resources.scrapCapacity}
            </span>
          </div>
          <div className="h-2 bg-stone-800 rounded overflow-hidden">
            <div 
              className={`h-full ${getColorClass(resources.scrap, resources.scrapCapacity)}`}
              style={{ width: `${getPercentage(resources.scrap, resources.scrapCapacity)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Fuel */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-yellow-300">
              <Fuel className="w-4 h-4" />
              <span>Fuel</span>
            </div>
            <span className="text-yellow-200/80 text-sm">
              {resources.fuel}/{resources.fuelCapacity}
            </span>
          </div>
          <div className="h-2 bg-stone-800 rounded overflow-hidden">
            <div 
              className={`h-full ${getColorClass(resources.fuel, resources.fuelCapacity)}`}
              style={{ width: `${getPercentage(resources.fuel, resources.fuelCapacity)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Ammunition */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-purple-300">
              <Target className="w-4 h-4" />
              <span>Ammunition</span>
            </div>
            <span className="text-purple-200/80 text-sm">
              {resources.ammunition}/{resources.ammunitionCapacity}
            </span>
          </div>
          <div className="h-2 bg-stone-800 rounded overflow-hidden">
            <div 
              className={`h-full ${getColorClass(resources.ammunition, resources.ammunitionCapacity)}`}
              style={{ width: `${getPercentage(resources.ammunition, resources.ammunitionCapacity)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-amber-900/30">
        <h4 className="text-amber-100/90 text-sm mb-2">Crafted Items</h4>
        <div className="flex gap-6">
          <div className="flex items-center gap-1 text-stone-300">
            <Wrench className="w-4 h-4" />
            <span className="text-stone-200">Tools: {resources.tools}</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-200">
            <Shirt className="w-4 h-4" />
            <span className="text-indigo-100">Clothing: {resources.clothing}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDisplay; 
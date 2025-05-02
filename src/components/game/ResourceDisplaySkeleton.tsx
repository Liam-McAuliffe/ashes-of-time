import React from 'react';
import { Sun, Utensils, Droplets } from 'lucide-react';
import Skeleton from '../ui/Skeleton';

/**
 * Skeleton loader for the ResourceDisplay component
 * Shows a placeholder while data is loading
 */
const ResourceDisplaySkeleton: React.FC = () => {
  return (
    <div className="bg-stone/10 border border-olive/30 p-4 rounded-lg">
      {/* Day display */}
      <div className="flex items-center mb-3">
        <Sun className="text-amber-500 mr-2" size={20} />
        <Skeleton className="w-24 h-5" />
      </div>

      {/* Daily consumption notice */}
      <div className="mb-4">
        <Skeleton className="w-full h-4 mb-1" />
      </div>

      {/* Food resource */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-rust mr-2 font-mono">
            <Utensils />
          </span>
          <span className="text-olive">Food:</span>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
      </div>

      {/* Water resource */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-cyan-500 mr-2 font-mono">
            <Droplets />
          </span>
          <span className="text-olive">Water:</span>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ResourceDisplaySkeleton; 
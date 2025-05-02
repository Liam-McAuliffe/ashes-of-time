import React from 'react';
import Skeleton from '../ui/Skeleton';

/**
 * Skeleton loader for the SurvivorDisplay component
 * Shows placeholder survivors while data is loading
 */
const SurvivorDisplaySkeleton: React.FC = () => {
  // Render multiple placeholder survivors
  return (
    <div className="space-y-3 bg-stone/10 border border-olive/30 p-4 rounded-lg">
      <div className="text-sm text-olive font-semibold mb-2">Survivors</div>
      
      {/* Render 2 skeleton survivor cards */}
      {[1, 2].map((i) => (
        <div key={i} className="border border-olive/20 rounded-md p-3 bg-charcoal/20">
          <div className="flex justify-between mb-2">
            <Skeleton className="w-1/3 h-5" />
            <div className="flex items-center">
              <Skeleton className="w-8 h-5 rounded-md mr-1" variant="rounded" />
            </div>
          </div>
          
          {/* Health bar */}
          <div className="mb-2 w-full h-2 bg-stone/20 rounded-full overflow-hidden">
            <Skeleton className="h-full rounded-full" width="60%" animation="pulse" />
          </div>
          
          {/* Status effect placeholders */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-24 h-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurvivorDisplaySkeleton; 
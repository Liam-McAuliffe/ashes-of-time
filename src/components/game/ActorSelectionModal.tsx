'use client';

import React, { memo } from 'react';
import { Survivor, StatusEffect, statusEffectDescriptions } from '../../types/game';
import { X } from 'lucide-react';
import OptimizedTooltip from '../ui/OptimizedTooltip';
import { getStatusColor } from '../../utils/gameLogic';

interface ActorSelectionModalProps {
  survivors: Survivor[];
  actionType: 'hunt' | 'gather';
  onSelect: (survivorId: string) => void;
  onCancel: () => void;
}

// Memoized survivor button component
const SurvivorButton = memo(({ 
  survivor, 
  eligible, 
  tooltipText, 
  buttonClasses, 
  onSelect 
}: { 
  survivor: Survivor, 
  eligible: boolean, 
  tooltipText: string | null,
  buttonClasses: string,
  onSelect: (id: string) => void
}) => (
  <div key={survivor.id}>
    {!eligible && tooltipText ? (
      <OptimizedTooltip content={tooltipText}>
        <button
          disabled={!eligible}
          className={buttonClasses}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium text-charcoal">{survivor.name}</span>
            <span className="text-xs text-rust">HP: {survivor.health}</span>
          </div>
          {survivor.statuses.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
              {survivor.statuses.map((status) => (
                <OptimizedTooltip key={status} content={statusEffectDescriptions[status] || 'Unknown effect.'}>
                  <span 
                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium cursor-default ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </OptimizedTooltip>
              ))}
            </div>
          )}
        </button>
      </OptimizedTooltip>
    ) : (
      <button
        onClick={() => eligible && onSelect(survivor.id)}
        disabled={!eligible}
        className={buttonClasses}
      >
        <div className="flex flex-col items-start">
          <span className="font-medium text-charcoal">{survivor.name}</span>
          <span className="text-xs text-rust">HP: {survivor.health}</span>
        </div>
        {survivor.statuses.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
            {survivor.statuses.map((status) => (
              <OptimizedTooltip key={status} content={statusEffectDescriptions[status] || 'Unknown effect.'}>
                <span 
                  className={`px-1.5 py-0.5 rounded-full text-xs font-medium cursor-default ${getStatusColor(status)}`}
                >
                  {status}
                </span>
              </OptimizedTooltip>
            ))}
          </div>
        )}
      </button>
    )}
  </div>
));

SurvivorButton.displayName = 'SurvivorButton';

export const ActorSelectionModal: React.FC<ActorSelectionModalProps> = memo(({
  survivors,
  actionType,
  onSelect,
  onCancel,
}) => {
  const livingSurvivors = survivors.filter((s) => s.health > 0);

  const isEligible = (survivor: Survivor): boolean => {
    if (actionType === 'hunt' && survivor.statuses.includes('Broken Limb')) {
      return false;
    }
    // Add other eligibility checks if needed (e.g., specific items required?)
    return true;
  };

  const getEligibilityTooltip = (survivor: Survivor): string | null => {
    if (actionType === 'hunt' && survivor.statuses.includes('Broken Limb')) {
      return "Cannot hunt with a broken limb.";
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 backdrop-blur-sm p-4">
      <div className="bg-stone rounded-lg shadow-xl p-6 w-full max-w-md relative border border-olive/50">
        <button 
          onClick={onCancel}
          className="absolute top-2 right-2 text-olive hover:text-rust transition-colors"
          aria-label="Close selection"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-charcoal mb-4 text-center">
          Select Survivor to {actionType === 'hunt' ? 'Hunt' : 'Gather Water'}
        </h2>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {livingSurvivors.map((survivor) => {
            const eligible = isEligible(survivor);
            const tooltipText = getEligibilityTooltip(survivor);
            const buttonClasses = `
              w-full p-3 border border-olive/30 rounded bg-stone/50 flex justify-between items-center 
              ${eligible ? 'hover:bg-stone/70 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
            `;

            return (
              <SurvivorButton
                key={survivor.id}
                survivor={survivor}
                eligible={eligible}
                tooltipText={tooltipText}
                buttonClasses={buttonClasses}
                onSelect={onSelect}
              />
            );
          })}
        </div>
        <button 
            onClick={onCancel}
            className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
            Cancel
        </button>
      </div>
    </div>
  );
});

ActorSelectionModal.displayName = 'ActorSelectionModal';
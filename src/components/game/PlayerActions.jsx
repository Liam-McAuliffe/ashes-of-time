import React from 'react';
import HuntSelection from './HuntSelection';
import GatherWaterSelection from './GatherWaterSelection';

function PlayerActions({
  survivors,
  onHuntComplete,
  onGatherComplete,
  onHuntStart,
  onGatherStart,
  disabled,
  currentAction,
}) {
  const canDoAnything = survivors.some((s) => s.health > 20);

  if (!canDoAnything) {
    return (
      <div className="w-full mt-4 p-3 text-center">
        <p className="text-sm text-olive italic">
          No one is well enough for strenuous tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 mt-4">
      <HuntSelection
        survivors={survivors}
        onHuntComplete={onHuntComplete}
        onHuntStart={onHuntStart}
        disabled={disabled || currentAction === 'gathering'}
        isActive={currentAction === 'hunting'}
      />
      <GatherWaterSelection
        survivors={survivors}
        onGatherComplete={onGatherComplete}
        onGatherStart={onGatherStart}
        disabled={disabled || currentAction === 'hunting'}
        isActive={currentAction === 'gathering'}
      />
    </div>
  );
}

export default PlayerActions;
